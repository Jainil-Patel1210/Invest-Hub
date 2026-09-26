export type Exchange = "NSE" | "BSE";

export interface Quote {
  symbol: string;
  price: number;
  prevClose: number;
  dayChange: number;
  dayChangePct: number;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
}

export interface StockFundamentals {
  symbol: string;
  exchange: Exchange;
  companyName: string;
  sector: string | null;
  industry: string | null;
  currency: string;
  marketCap: number | null;
  peRatio: number | null;
  eps: number | null;
  week52High: number | null;
  week52Low: number | null;
}

export interface Candle {
  date: string; // ISO date, e.g. "2025-01-02" -- calendar day, no time component
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface SearchResult {
  symbol: string;
  companyName: string;
  exchange: Exchange;
}

/**
 * Anything that can answer "what's this stock worth" implements this.
 * Routes and the caching layer depend only on this interface, never on
 * yahoo-finance2 directly -- swapping providers later means writing one
 * new class, not touching a single route.
 */
export interface PricingProvider {
  getQuote(symbol: string): Promise<Quote>;
  getFundamentals(symbol: string): Promise<StockFundamentals>;
  getHistory(symbol: string, from: Date, to: Date): Promise<Candle[]>;
  search(query: string): Promise<SearchResult[]>;
}
