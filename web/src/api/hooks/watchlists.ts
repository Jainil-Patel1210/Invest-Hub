import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { Quote } from "./stocks";

export interface WatchlistSummary {
  id: number;
  name: string;
  createdAt: string;
  itemCount: number;
}

export interface WatchlistItem {
  symbol: string;
  companyName: string;
  sector: string | null;
  addedAt: string;
  quote: Quote | null;
}

export interface WatchlistDetail {
  id: number;
  name: string;
  items: WatchlistItem[];
}

export function useWatchlists() {
  return useQuery({
    queryKey: ["watchlists"],
    queryFn: () => api.get<{ watchlists: WatchlistSummary[] }>("/watchlists"),
    select: (data) => data.watchlists,
  });
}

export function useWatchlistDetail(id: number | null) {
  return useQuery({
    queryKey: ["watchlists", id],
    queryFn: () => api.get<WatchlistDetail>(`/watchlists/${id}`),
    enabled: id !== null,
  });
}

/** Invalidates both the summary list (item counts change) and the specific detail view -- every mutation below needs this same pair. */
function useInvalidateWatchlists() {
  const queryClient = useQueryClient();
  return (watchlistId?: number) => {
    void queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    if (watchlistId !== undefined) {
      void queryClient.invalidateQueries({ queryKey: ["watchlists", watchlistId] });
    }
  };
}

export function useCreateWatchlist() {
  const invalidate = useInvalidateWatchlists();
  return useMutation({
    mutationFn: (name: string) => api.post<WatchlistSummary>("/watchlists", { name }),
    onSuccess: () => invalidate(),
  });
}

export function useRenameWatchlist() {
  const invalidate = useInvalidateWatchlists();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.patch<WatchlistSummary>(`/watchlists/${id}`, { name }),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useDeleteWatchlist() {
  const invalidate = useInvalidateWatchlists();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/watchlists/${id}`),
    onSuccess: () => invalidate(),
  });
}

export function useAddStockToWatchlist() {
  const invalidate = useInvalidateWatchlists();
  return useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: number; symbol: string }) =>
      api.post(`/watchlists/${watchlistId}/stocks`, { symbol }),
    onSuccess: (_data, variables) => invalidate(variables.watchlistId),
  });
}

export function useRemoveStockFromWatchlist() {
  const invalidate = useInvalidateWatchlists();
  return useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: number; symbol: string }) =>
      api.delete(`/watchlists/${watchlistId}/stocks/${encodeURIComponent(symbol)}`),
    onSuccess: (_data, variables) => invalidate(variables.watchlistId),
  });
}
