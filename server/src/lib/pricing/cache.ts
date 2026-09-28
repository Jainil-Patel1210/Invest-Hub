import type { Pool } from "pg";
import { addDaysIso } from "./dateUtils";
import type { Candle, PricingProvider, Quote, SearchResult, StockFundamentals } from "./types";

const QUOTE_TTL_SECONDS = 60;
const FUNDAMENTALS_TTL_HOURS = 24;
const SEARCH_LIMIT = 10;
// Below this many local hits, Yahoo is also asked to fill in.
const SEARCH_LOCAL_ENOUGH = 5;

// pg returns NUMERIC/DECIMAL columns as strings, not JS numbers -- a JS
// `number` (IEEE 754 double) can't exactly represent arbitrary-precision
// decimals, so the driver hands back the raw string rather than silently
// losing precision, and leaves the conversion to us.
function numOrNull(value: string | null): number | null {
  return value == null ? null : Number(value);
}

interface StockRow {
  symbol: string;
  exchange: "NSE" | "BSE";
  company_name: string;
  sector: string | null;
  industry: string | null;
  currency: string;
  market_cap: string | null;
  pe_ratio: string | null;
  eps: string | null;
  week52_high: string | null;
  week52_low: string | null;
}

function mapStockRow(row: StockRow): StockFundamentals {
  return {
    symbol: row.symbol,
    exchange: row.exchange,
    companyName: row.company_name,
    sector: row.sector,
    industry: row.industry,
    currency: row.currency,
    marketCap: numOrNull(row.market_cap),
    peRatio: numOrNull(row.pe_ratio),
    eps: numOrNull(row.eps),
    week52High: numOrNull(row.week52_high),
    week52Low: numOrNull(row.week52_low),
  };
}

interface QuoteRow {
  symbol: string;
  price: string;
  prev_close: string;
  day_change: string;
  day_change_pct: string;
  day_high: string | null;
  day_low: string | null;
  volume: string | null;
}

function mapQuoteRow(row: QuoteRow): Quote {
  return {
    symbol: row.symbol,
    price: Number(row.price),
    prevClose: Number(row.prev_close),
    dayChange: Number(row.day_change),
    dayChangePct: Number(row.day_change_pct),
    dayHigh: numOrNull(row.day_high),
    dayLow: numOrNull(row.day_low),
    volume: row.volume == null ? null : Number(row.volume),
  };
}

interface CandleRow {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string | null;
}

function mapCandleRow(row: CandleRow): Candle {
  return {
    date: row.date,
    open: Number(row.open),
    high: Number(row.high),
    low: Number(row.low),
    close: Number(row.close),
    volume: row.volume == null ? null : Number(row.volume),
  };
}

/**
 * Wraps an inner PricingProvider with a Postgres-backed cache. Callers only
 * ever see the PricingProvider interface -- they can't tell (and don't need
 * to know) that a database sits in front of the real data source.
 */
export class CachedPricingProvider implements PricingProvider {
  constructor(
    private readonly inner: PricingProvider,
    private readonly pool: Pool,
  ) {}

  /**
   * Fetches fresh fundamentals from the inner provider and upserts them into
   * `stocks`. This is also how the "growing cache" of tracked stocks actually
   * grows: the first time any symbol is looked up, this is what inserts it.
   */
  private async fetchAndStoreFundamentals(symbol: string): Promise<StockFundamentals> {
    const fundamentals = await this.inner.getFundamentals(symbol);

    await this.pool.query(
      `INSERT INTO stocks
         (symbol, exchange, company_name, sector, industry, currency, market_cap, pe_ratio, eps, week52_high, week52_low, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
       ON CONFLICT (symbol) DO UPDATE SET
         exchange = EXCLUDED.exchange,
         company_name = EXCLUDED.company_name,
         sector = EXCLUDED.sector,
         industry = EXCLUDED.industry,
         currency = EXCLUDED.currency,
         market_cap = EXCLUDED.market_cap,
         pe_ratio = EXCLUDED.pe_ratio,
         eps = EXCLUDED.eps,
         week52_high = EXCLUDED.week52_high,
         week52_low = EXCLUDED.week52_low,
         updated_at = now()`,
      [
        symbol,
        fundamentals.exchange,
        fundamentals.companyName,
        fundamentals.sector,
        fundamentals.industry,
        fundamentals.currency,
        fundamentals.marketCap,
        fundamentals.peRatio,
        fundamentals.eps,
        fundamentals.week52High,
        fundamentals.week52Low,
      ],
    );

    return fundamentals;
  }

  /** Makes sure `stocks` has a row for this symbol before anything that FKs to it runs. */
  private async ensureStockRow(symbol: string): Promise<void> {
    const { rows } = await this.pool.query("SELECT 1 FROM stocks WHERE symbol = $1", [symbol]);
    if (rows.length === 0) {
      await this.fetchAndStoreFundamentals(symbol);
    }
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    const { rows } = await this.pool.query<StockRow>(
      `SELECT * FROM stocks
       WHERE symbol = $1 AND updated_at > now() - make_interval(hours => $2)`,
      [symbol, FUNDAMENTALS_TTL_HOURS],
    );

    const cached = rows[0];
    if (cached) {
      return mapStockRow(cached);
    }

    return this.fetchAndStoreFundamentals(symbol);
  }

  async getQuote(symbol: string): Promise<Quote> {
    await this.ensureStockRow(symbol);

    const { rows } = await this.pool.query<QuoteRow>(
      `SELECT * FROM quote_cache
       WHERE symbol = $1 AND fetched_at > now() - make_interval(secs => $2)`,
      [symbol, QUOTE_TTL_SECONDS],
    );

    const cached = rows[0];
    if (cached) {
      return mapQuoteRow(cached);
    }

    const quote = await this.inner.getQuote(symbol);
    await this.storeQuotes([quote]);

    return quote;
  }

  // Index quotes have no `stocks` row (quote_cache has a foreign key to it),
  // so they are cached in memory instead, with the same TTL as stock quotes.
  private indexCache: { key: string; quotes: Quote[]; fetchedAt: number } | null = null;

  async getIndexQuotes(symbols: string[]): Promise<Quote[]> {
    const key = symbols.join(",");
    const cached = this.indexCache;
    if (cached && cached.key === key && Date.now() - cached.fetchedAt < QUOTE_TTL_SECONDS * 1000) {
      return cached.quotes;
    }

    const quotes = await this.inner.getIndexQuotes(symbols);
    this.indexCache = { key, quotes, fetchedAt: Date.now() };
    return quotes;
  }

  // Index history is cached in memory for an hour: it changes at most once a
  // day, and a restart just refetches it (a single cheap Yahoo call).
  private indexHistoryCache = new Map<string, { candles: Candle[]; fetchedAt: number }>();

  async getIndexHistory(symbol: string, from: string, to: string): Promise<Candle[]> {
    const key = `${symbol}|${from}|${to}`;
    const cached = this.indexHistoryCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < 60 * 60 * 1000) return cached.candles;

    const candles = await this.inner.getIndexHistory(symbol, from, to);
    this.indexHistoryCache.set(key, { candles, fetchedAt: Date.now() });
    return candles;
  }

  /** Bulk upsert into quote_cache: one statement for any number of quotes (unnest turns parallel arrays into rows). */
  private async storeQuotes(quotes: Quote[]): Promise<void> {
    if (quotes.length === 0) return;

    await this.pool.query(
      `INSERT INTO quote_cache (symbol, price, prev_close, day_change, day_change_pct, day_high, day_low, volume, fetched_at)
       SELECT symbol, price, prev_close, day_change, day_change_pct, day_high, day_low, volume, now()
       FROM unnest($1::text[], $2::numeric[], $3::numeric[], $4::numeric[], $5::numeric[], $6::numeric[], $7::numeric[], $8::bigint[])
         AS t(symbol, price, prev_close, day_change, day_change_pct, day_high, day_low, volume)
       ON CONFLICT (symbol) DO UPDATE SET
         price = EXCLUDED.price,
         prev_close = EXCLUDED.prev_close,
         day_change = EXCLUDED.day_change,
         day_change_pct = EXCLUDED.day_change_pct,
         day_high = EXCLUDED.day_high,
         day_low = EXCLUDED.day_low,
         volume = EXCLUDED.volume,
         fetched_at = now()`,
      [
        quotes.map((q) => q.symbol),
        quotes.map((q) => q.price),
        quotes.map((q) => q.prevClose),
        quotes.map((q) => q.dayChange),
        quotes.map((q) => q.dayChangePct),
        quotes.map((q) => q.dayHigh),
        quotes.map((q) => q.dayLow),
        quotes.map((q) => q.volume),
      ],
    );
  }

  /**
   * Bulk quotes: fresh ones come from quote_cache in one query, and every
   * stale/missing one is fetched from the inner provider in parallel (see
   * yahooProvider's getQuotes for why that's per-symbol requests now, not one
   * batched call). Only symbols already in `stocks` are considered
   * (quote_cache has a foreign key to it) -- unknown symbols are omitted, not
   * looked up.
   */
  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (symbols.length === 0) return [];

    const { rows: freshRows } = await this.pool.query<QuoteRow>(
      `SELECT * FROM quote_cache
       WHERE symbol = ANY($1) AND fetched_at > now() - make_interval(secs => $2)`,
      [symbols, QUOTE_TTL_SECONDS],
    );
    const bySymbol = new Map(freshRows.map((row) => [row.symbol, mapQuoteRow(row)]));

    const stale = symbols.filter((s) => !bySymbol.has(s));
    if (stale.length > 0) {
      const { rows: known } = await this.pool.query<{ symbol: string }>(
        "SELECT symbol FROM stocks WHERE symbol = ANY($1)",
        [stale],
      );
      const fetched = await this.inner.getQuotes(known.map((r) => r.symbol));
      await this.storeQuotes(fetched);
      for (const q of fetched) bySymbol.set(q.symbol, q);
    }

    return symbols.flatMap((s) => bySymbol.get(s) ?? []);
  }

  async getHistory(symbol: string, from: string, to: string): Promise<Candle[]> {
    await this.ensureStockRow(symbol);

    const { rows: rangeRows } = await this.pool.query<{
      min_date: string | null;
      max_date: string | null;
    }>("SELECT MIN(date) AS min_date, MAX(date) AS max_date FROM price_history WHERE symbol = $1", [
      symbol,
    ]);
    // A bare MIN()/MAX() aggregate with no GROUP BY always returns exactly one
    // row, even when zero underlying rows match (min/max just come back NULL
    // in that case) -- unlike the lookups above, this isn't a "might be
    // missing" case, so the non-null assertion reflects a real SQL guarantee
    // rather than an assumption.
    const { min_date: existingMin, max_date: existingMax } = rangeRows[0]!;

    // Which sub-range(s), if any, do we not already have cached? This only
    // handles extending the cached range backward (a longer chart) or
    // forward (today's new candle) -- it deliberately does not detect a gap
    // torn out of the middle of an existing range, which shouldn't happen
    // through normal use of this cache. Comparing plain "YYYY-MM-DD" strings
    // with < / > works correctly here because ISO dates sort lexicographically
    // in the same order as chronologically.
    const missingRanges: Array<[string, string]> = [];
    if (existingMin === null || existingMax === null) {
      missingRanges.push([from, to]);
    } else {
      if (from < existingMin) {
        missingRanges.push([from, addDaysIso(existingMin, -1)]);
      }
      if (to > existingMax) {
        missingRanges.push([addDaysIso(existingMax, 1), to]);
      }
    }

    for (const [rangeFrom, rangeTo] of missingRanges) {
      if (rangeFrom > rangeTo) continue;
      await this.fetchAndStoreHistory(symbol, rangeFrom, rangeTo);
    }

    const { rows } = await this.pool.query<CandleRow>(
      `SELECT date, open, high, low, close, volume FROM price_history
       WHERE symbol = $1 AND date BETWEEN $2 AND $3
       ORDER BY date ASC`,
      [symbol, from, to],
    );
    return rows.map(mapCandleRow);
  }

  private async fetchAndStoreHistory(symbol: string, from: string, to: string): Promise<void> {
    const candles = await this.inner.getHistory(symbol, from, to);
    if (candles.length === 0) return;

    // A bulk upsert in one round trip via unnest(): each array is a column,
    // matched up positionally into one row per index -- the SQL equivalent
    // of zip()-ing five parallel arrays into a table, instead of one INSERT
    // per candle (which would be `candles.length` separate round trips).
    await this.pool.query(
      `INSERT INTO price_history (symbol, date, open, high, low, close, volume)
       SELECT $1, t.date, t.open, t.high, t.low, t.close, t.volume
       FROM unnest($2::date[], $3::numeric[], $4::numeric[], $5::numeric[], $6::numeric[], $7::bigint[])
         AS t(date, open, high, low, close, volume)
       ON CONFLICT (symbol, date) DO UPDATE SET
         open = EXCLUDED.open,
         high = EXCLUDED.high,
         low = EXCLUDED.low,
         close = EXCLUDED.close,
         volume = EXCLUDED.volume`,
      [
        symbol,
        candles.map((c) => c.date),
        candles.map((c) => c.open),
        candles.map((c) => c.high),
        candles.map((c) => c.low),
        candles.map((c) => c.close),
        candles.map((c) => c.volume),
      ],
    );
  }

  /**
   * Local-first search. Yahoo's search endpoint is built for exact-ish
   * queries: "tc" finds nothing useful, "TCS.NS" works. So the `stocks`
   * table (the seeded Nifty 50, growing with every symbol anyone opens)
   * answers first, with as-you-type prefix matching on the symbol and
   * substring matching on the company name. Yahoo is only consulted to fill
   * in when the local catalog has few hits, so a stock nobody has opened yet
   * is still findable -- and a Yahoo outage just means local results only.
   */
  async search(query: string): Promise<SearchResult[]> {
    // LIKE treats % and _ as wildcards; escape them so a query like "a_b"
    // means those literal characters.
    const escaped = query.replace(/[\\%_]/g, (c) => `\\${c}`);

    const { rows } = await this.pool.query<{
      symbol: string;
      exchange: "NSE" | "BSE";
      company_name: string;
    }>(
      `SELECT symbol, exchange, company_name FROM stocks
       WHERE symbol ILIKE $1 || '%' OR company_name ILIKE '%' || $1 || '%'
       ORDER BY
         CASE
           WHEN upper(symbol) = upper($2) OR upper(symbol) = upper($2) || '.NS' THEN 0
           WHEN symbol ILIKE $1 || '%' THEN 1
           WHEN company_name ILIKE $1 || '%' THEN 2
           ELSE 3
         END,
         market_cap DESC NULLS LAST,
         symbol
       LIMIT $3`,
      [escaped, query, SEARCH_LIMIT],
    );

    const results: SearchResult[] = rows.map((r) => ({
      symbol: r.symbol,
      companyName: r.company_name,
      exchange: r.exchange,
    }));

    if (results.length >= SEARCH_LOCAL_ENOUGH) return results;

    try {
      const remote = await this.inner.search(query);
      const seen = new Set(results.map((r) => r.symbol));
      for (const r of remote) {
        if (!seen.has(r.symbol)) results.push(r);
      }
    } catch {
      // Local results are still a valid answer; don't fail the search over the fallback.
    }
    return results.slice(0, SEARCH_LIMIT);
  }
}
