import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { Quote } from "./stocks";

export interface Movers {
  gainers: Quote[];
  losers: Quote[];
}

export function useMovers(limit = 5) {
  return useQuery({
    queryKey: ["market", "movers", limit],
    queryFn: () => api.get<Movers>(`/market/movers?limit=${limit}`),
  });
}

export interface IndexQuote {
  symbol: string;
  name: string;
  quote: Quote | null;
}

/** Headline index levels (NIFTY 50, SENSEX) for the top bar; refreshed every minute, matching the server's quote TTL. */
export function useIndices() {
  return useQuery({
    queryKey: ["market", "indices"],
    queryFn: () => api.get<{ indices: IndexQuote[] }>("/market/indices"),
    select: (data) => data.indices,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
