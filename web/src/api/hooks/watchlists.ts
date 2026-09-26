import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

export interface WatchlistSummary {
  id: number;
  name: string;
  createdAt: string;
  itemCount: number;
}

export function useWatchlists() {
  return useQuery({
    queryKey: ["watchlists"],
    queryFn: () => api.get<{ watchlists: WatchlistSummary[] }>("/watchlists"),
    select: (data) => data.watchlists,
  });
}

export function useAddStockToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: number; symbol: string }) =>
      api.post(`/watchlists/${watchlistId}/stocks`, { symbol }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      void queryClient.invalidateQueries({ queryKey: ["watchlists", variables.watchlistId] });
    },
  });
}
