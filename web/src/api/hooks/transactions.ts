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

function filterParams(filters: Omit<TransactionsFilters, "page">): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.symbol) params.set("symbol", filters.symbol);
  if (filters.type) params.set("type", filters.type);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  return params;
}

export interface TransactionSummary {
  count: number;
  buyCount: number;
  sellCount: number;
  turnover: number;
  feesPaid: number;
}

/** Totals over every trade matching the filters -- not just the visible page. */
export function useTransactionSummary(filters: Omit<TransactionsFilters, "page">) {
  return useQuery({
    queryKey: ["transactions", "summary", filters],
    queryFn: () =>
      api.get<TransactionSummary>(`/transactions/summary?${filterParams(filters).toString()}`),
  });
}

/** Downloads the trades matching the filters as a CSV file in the browser. */
export async function downloadTransactionsCsv(
  filters: Omit<TransactionsFilters, "page">,
): Promise<void> {
  const blob = await api.download(`/transactions/export?${filterParams(filters).toString()}`);

  // A Blob can't be "linked" directly: point a temporary anchor at an object
  // URL for it and click it, then release the URL so the file isn't held in memory.
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "investhub-transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
