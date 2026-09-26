import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

export interface StockSearchResult {
  symbol: string;
  companyName: string;
  exchange: "NSE" | "BSE";
}

export interface StockFundamentals {
  symbol: string;
  exchange: "NSE" | "BSE";
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

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export const HISTORY_RANGES = ["1M", "3M", "6M", "1Y", "5Y", "ALL"] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];

export function useStockSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["stocks", "search", trimmed],
    queryFn: () =>
      api.get<{ results: StockSearchResult[] }>(`/stocks/search?q=${encodeURIComponent(trimmed)}`),
    select: (data) => data.results,
    enabled: trimmed.length > 0,
  });
}

export function useStock(symbol: string) {
  return useQuery({
    queryKey: ["stocks", symbol],
    queryFn: () => api.get<StockFundamentals>(`/stocks/${encodeURIComponent(symbol)}`),
  });
}

export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: ["stocks", symbol, "quote"],
    queryFn: () => api.get<Quote>(`/stocks/${encodeURIComponent(symbol)}/quote`),
    // Matches the backend's own 60s quote_cache TTL -- polling faster than
    // that would just re-fetch the same cached row every time.
    refetchInterval: 60_000,
  });
}

export function useStockHistory(symbol: string, range: HistoryRange) {
  return useQuery({
    queryKey: ["stocks", symbol, "history", range],
    queryFn: () =>
      api.get<{ range: string; from: string; to: string; candles: Candle[] }>(
        `/stocks/${encodeURIComponent(symbol)}/history?range=${range}`,
      ),
    select: (data) => data.candles,
  });
}
