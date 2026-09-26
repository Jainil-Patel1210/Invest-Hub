import YahooFinance from "yahoo-finance2";
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

export class YahooPricingProvider implements PricingProvider {
  async getQuote(symbol: string): Promise<Quote> {
    const q = await yahooFinance.quote(symbol);

    if (q.regularMarketPrice == null || q.regularMarketPreviousClose == null) {
      throw new Error(`No live price available for "${symbol}"`);
    }

    return {
      symbol,
      price: q.regularMarketPrice,
      prevClose: q.regularMarketPreviousClose,
      dayChange: q.regularMarketChange ?? q.regularMarketPrice - q.regularMarketPreviousClose,
      dayChangePct:
        q.regularMarketChangePercent ??
        ((q.regularMarketPrice - q.regularMarketPreviousClose) / q.regularMarketPreviousClose) *
          100,
      dayHigh: q.regularMarketDayHigh ?? null,
      dayLow: q.regularMarketDayLow ?? null,
      volume: q.regularMarketVolume ?? null,
    };
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, { modules: ["assetProfile"] }),
    ]);

    if (!quote.longName) {
      throw new Error(`No company data available for "${symbol}"`);
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

  async getHistory(symbol: string, from: Date, to: Date): Promise<Candle[]> {
    const result = await yahooFinance.chart(symbol, {
      period1: from,
      period2: to,
      interval: "1d",
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
