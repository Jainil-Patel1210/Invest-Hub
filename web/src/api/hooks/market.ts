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
