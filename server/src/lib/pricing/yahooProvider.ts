import YahooFinance from "yahoo-finance2";
import { addDaysIso } from "./dateUtils";
import { SymbolNotFoundError } from "./errors";
import type {
  Candle,
  Exchange,
  PricingProvider,
  Quote,
  SearchResult,
  StockFundamentals,
} from "./types";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

/**
 * Yahoo's own `exchange` field on search results is inconsistent (NSE shows
 * up as "NSI"). The `.NS`/`.BO` suffix on the symbol itself is the one thing
 * that's always reliable, so we derive exchange from that instead of trusting
 * whatever string the API hands back.
 */
function exchangeFromSymbol(symbol: string): Exchange {
  if (symbol.endsWith(".NS")) return "NSE";
  if (symbol.endsWith(".BO")) return "BSE";
  throw new Error(
    `Cannot determine exchange for symbol "${symbol}" -- expected a .NS or .BO suffix`,
  );
}

/**
 * yahoo-finance2 doesn't export a distinguishable "symbol not found" error
 * type, and different calls don't even agree on wording: quoteSummary()
 * throws "Quote not found for symbol: X", chart() throws "No data found,
 * symbol may be delisted". Matching on substrings is the best signal
 * available without one -- if a future version changes this wording, the
 * failure degrades to a generic error rather than breaking anything outright.
 */
function isNotFoundError(err: unknown): boolean {
  return err instanceof Error && /quote not found|no data found|delisted/i.test(err.message);
}

/** The subset of quoteSummary's `price` module that a Quote is built from. */
interface RawQuote {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
}

/** Returns null when Yahoo sent a quote without the two fields a Quote can't do without. */
function toQuote(symbol: string, q: RawQuote): Quote | null {
  if (q.regularMarketPrice == null || q.regularMarketPreviousClose == null) return null;

  return {
    symbol,
    price: q.regularMarketPrice,
    prevClose: q.regularMarketPreviousClose,
    dayChange: q.regularMarketChange ?? q.regularMarketPrice - q.regularMarketPreviousClose,
    dayChangePct:
      q.regularMarketChangePercent ??
      ((q.regularMarketPrice - q.regularMarketPreviousClose) / q.regularMarketPreviousClose) * 100,
    dayHigh: q.regularMarketDayHigh ?? null,
    dayLow: q.regularMarketDayLow ?? null,
    volume: q.regularMarketVolume ?? null,
  };
}

/**
 * Live price for one symbol via quoteSummary's `price` module, not the
 * dedicated quote() endpoint. Deliberate: `.quote()` (and the array form
 * used for batches) sits behind Yahoo's crumb/cookie anti-bot flow, which in
 * practice gets silently blocked from a lot of cloud-hosting IP ranges
 * (Render's among them, confirmed by this failing in production while
 * working from a home network) -- while `.quoteSummary()` and `.chart()`
 * keep working. `price` carries the exact same field names `.quote()` did,
 * so `toQuote` needs no change, only where the data comes from.
 */
async function fetchQuoteViaSummary(symbol: string): Promise<Quote> {
  const summary = await yahooFinance
    .quoteSummary(symbol, { modules: ["price"] })
    .catch((err: unknown) => {
      if (isNotFoundError(err)) throw new SymbolNotFoundError(symbol);
      throw err;
    });

  // quoteSummary's `price` module reports regularMarketChangePercent as a raw
  // fraction (0.0056), not the plain percent number (0.56) the old flat
  // quote() endpoint gave -- confirmed directly, real values differ by 100x
  // between the two for the same symbol at the same moment. Dropping it here
  // forces toQuote's own price/prevClose fallback math, which is scale-safe
  // by construction rather than trusting an endpoint-specific convention.
  const raw: RawQuote = { ...(summary.price as RawQuote), regularMarketChangePercent: undefined };
  const quote = toQuote(symbol, raw);
  if (!quote) throw new SymbolNotFoundError(symbol);
  return quote;
}

export class YahooPricingProvider implements PricingProvider {
  getQuote(symbol: string): Promise<Quote> {
    return fetchQuoteViaSummary(symbol);
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (symbols.length === 0) return [];

    // No array form here (unlike the old .quote() batch call) -- one
    // quoteSummary request per symbol, in parallel. A symbol that fails
    // (unknown, or a transient hiccup) is simply left out of the result
    // rather than failing the whole batch, via allSettled.
    const results = await Promise.allSettled(symbols.map((s) => fetchQuoteViaSummary(s)));

    return results
      .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
      .map((r) => r.value);
  }

  // Yahoo serves an index's daily chart exactly like a stock's.
  getIndexHistory(symbol: string, from: string, to: string): Promise<Candle[]> {
    return this.getHistory(symbol, from, to);
  }

  // Same bulk call as getQuotes -- Yahoo prices an index like any other symbol.
  getIndexQuotes(symbols: string[]): Promise<Quote[]> {
    return this.getQuotes(symbols);
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    // One quoteSummary call across four modules, rather than quote() +
    // quoteSummary(assetProfile) -- see fetchQuoteViaSummary's comment on
    // why .quote() is avoided entirely now. Company name/currency/market cap
    // come from `price`; P/E, EPS and the 52-week range live in
    // `summaryDetail`/`defaultKeyStatistics` instead of quote()'s flatter
    // shape, but under the same values (verified directly against real data).
    const summary = await yahooFinance
      .quoteSummary(symbol, {
        modules: ["price", "summaryDetail", "defaultKeyStatistics", "assetProfile"],
      })
      .catch((err: unknown) => {
        if (isNotFoundError(err)) throw new SymbolNotFoundError(symbol);
        throw err;
      });

    if (!summary.price?.longName) {
      throw new SymbolNotFoundError(symbol);
    }

    return {
      symbol,
      exchange: exchangeFromSymbol(symbol),
      companyName: summary.price.longName,
      sector: summary.assetProfile?.sector ?? null,
      industry: summary.assetProfile?.industry ?? null,
      currency: summary.price.currency ?? "INR",
      marketCap: summary.price.marketCap ?? summary.summaryDetail?.marketCap ?? null,
      peRatio: summary.summaryDetail?.trailingPE ?? null,
      eps: summary.defaultKeyStatistics?.trailingEps ?? null,
      week52High: summary.summaryDetail?.fiftyTwoWeekHigh ?? null,
      week52Low: summary.summaryDetail?.fiftyTwoWeekLow ?? null,
    };
  }

  async getHistory(symbol: string, from: string, to: string): Promise<Candle[]> {
    // Our own interface treats `to` as inclusive (the natural reading of
    // "history from X to Y"), but Yahoo's `period2` is exclusive -- verified
    // directly: requesting period2 on a real trading day still omits that
    // day's candle. Push our inclusive `to` one day past itself to translate
    // between the two conventions, entirely inside this Yahoo-specific class
    // rather than leaking Yahoo's quirk into the cache layer or the interface.
    const result = await yahooFinance
      .chart(symbol, { period1: from, period2: addDaysIso(to, 1), interval: "1d" })
      .catch((err: unknown) => {
        if (isNotFoundError(err)) throw new SymbolNotFoundError(symbol);
        throw err;
      });

    return result.quotes
      .filter((q) => q.open != null && q.high != null && q.low != null && q.close != null)
      .map((q) => ({
        // NSE/BSE both open well after UTC midnight (market open is ~03:45 UTC,
        // i.e. 09:15 IST), so slicing the UTC ISO string always lands on the
        // correct Indian trading day. This assumption is specific to this
        // market/timezone pair and would need revisiting for a market whose
        // local trading day crosses UTC midnight.
        date: q.date.toISOString().slice(0, 10),
        open: q.open as number,
        high: q.high as number,
        low: q.low as number,
        close: q.close as number,
        volume: q.volume ?? null,
      }));
  }

  async search(query: string): Promise<SearchResult[]> {
    const result = await yahooFinance.search(query);

    const matches: SearchResult[] = [];
    for (const item of result.quotes) {
      if (!("symbol" in item) || typeof item.symbol !== "string") continue;
      if (!item.symbol.endsWith(".NS") && !item.symbol.endsWith(".BO")) continue;

      const companyName =
        "shortname" in item && typeof item.shortname === "string" ? item.shortname : item.symbol;

      matches.push({
        symbol: item.symbol,
        companyName,
        exchange: exchangeFromSymbol(item.symbol),
      });
    }
    return matches;
  }
}
