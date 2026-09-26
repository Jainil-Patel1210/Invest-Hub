import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

export interface TradeInput {
  symbol: string;
  quantity: number;
  price?: number;
}

export interface TransactionView {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  total: number;
  executedAt: string;
}

function useTradeMutation(action: "buy" | "sell") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TradeInput) =>
      api.post<{ transaction: TransactionView }>(`/trade/${action}`, input),
    onSuccess: () => {
      // Invalidates the views a trade actually changes. Nothing queries
      // these keys yet in Phase 7 (portfolio/transactions UI is Phase 8),
      // so this is currently a no-op -- but it's the correct call to make
      // now, using the same key conventions Phase 8's queries will need to
      // match for this invalidation to start doing anything.
      void queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useBuy() {
  return useTradeMutation("buy");
}

export function useSell() {
  return useTradeMutation("sell");
}
