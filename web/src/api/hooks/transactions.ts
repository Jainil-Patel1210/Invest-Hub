import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { TransactionView } from "./trade";

export interface TransactionsFilters {
  symbol?: string;
  type?: "BUY" | "SELL";
  from?: string;
  to?: string;
  page: number;
}

export interface TransactionsPage {
  transactions: TransactionView[];
  page: number;
  pageSize: number;
  total: number;
}

export function useTransactions(filters: TransactionsFilters) {
  const params = new URLSearchParams();
  if (filters.symbol) params.set("symbol", filters.symbol);
  if (filters.type) params.set("type", filters.type);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  params.set("page", String(filters.page));

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => api.get<TransactionsPage>(`/transactions?${params.toString()}`),
  });
}
