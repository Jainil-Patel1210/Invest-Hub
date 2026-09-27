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

/** The subset of yahoo-finance2's quote object that a Quote is built from. */
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

export class YahooPricingProvider implements PricingProvider {
  async getQuote(symbol: string): Promise<Quote> {
    // Confirmed directly: quote() resolves to `undefined` for an unknown
    // symbol rather than throwing -- a third distinct "not found" convention
    // alongside the two below. `!q` must be checked before touching any
    // field on it.
    const q = await yahooFinance.quote(symbol);
    const quote = q ? toQuote(symbol, q as RawQuote) : null;
    if (!quote) throw new SymbolNotFoundError(symbol);
    return quote;
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (symbols.length === 0) return [];

    // Passing an array makes yahoo-finance2 issue a single HTTP request for
    // the whole batch (instead of N), and unknown symbols are simply absent
    // from the result array rather than throwing.
    const results = await yahooFinance.quote(symbols);

    const quotes: Quote[] = [];
    for (const q of results) {
      const quote = toQuote(q.symbol, q as RawQuote);
      if (quote) quotes.push(quote);
    }
    return quotes;
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    // .catch() chained directly on the Promise.all() call, rather than a
    // try/catch around pre-declared variables, lets TypeScript infer quote's
    // and summary's types normally from Promise.all's own overloads --
    // yahooFinance.quoteSummary is itself overloaded/generic, and manually
    // annotating hoisted variables with ReturnType<typeof ...> for it
    // resolves to `unknown` because ReturnType can't know which overload a
    // specific call would pick.
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, { modules: ["assetProfile"] }),
    ]).catch((err: unknown) => {
      if (isNotFoundError(err)) throw new SymbolNotFoundError(symbol);
      throw err;
    });

    if (!quote || !quote.longName) {
      throw new SymbolNotFoundError(symbol);
    }

    return {
      symbol,
      exchange: exchangeFromSymbol(symbol),
      companyName: quote.longName,
      sector: summary.assetProfile?.sector ?? null,
      industry: summary.assetProfile?.industry ?? null,
      currency: quote.currency ?? "INR",
      marketCap: quote.marketCap ?? null,
      peRatio: quote.trailingPE ?? null,
      eps: quote.epsTrailingTwelveMonths ?? null,
      week52High: quote.fiftyTwoWeekHigh ?? null,
      week52Low: quote.fiftyTwoWeekLow ?? null,
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
