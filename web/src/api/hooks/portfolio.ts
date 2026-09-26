import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import type { TransactionView } from "./trade";

export interface EnrichedHolding {
  symbol: string;
  companyName: string;
  sector: string | null;
  quantity: number;
  avgBuyPrice: number;
  investedValue: number;
  currentPrice: number | null;
  currentValue: number | null;
  pnl: number | null;
  pnlPct: number | null;
  dayChange: number | null;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
}

export interface PortfolioSummary {
  investedValue: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPct: number;
  dayPnl: number;
  sectorAllocation: SectorAllocation[];
}

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.get<{ holdings: EnrichedHolding[] }>("/portfolio"),
    select: (data) => data.holdings,
  });
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ["portfolio", "summary"],
    queryFn: () => api.get<PortfolioSummary>("/portfolio/summary"),
  });
}

export function usePortfolioDetail(symbol: string) {
  return useQuery({
    queryKey: ["portfolio", symbol],
    queryFn: () =>
      api.get<{ holding: EnrichedHolding; transactions: TransactionView[] }>(
        `/portfolio/${encodeURIComponent(symbol)}`,
      ),
  });
}
