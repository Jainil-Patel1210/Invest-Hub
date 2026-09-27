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

export interface HoldingPerformance {
  symbol: string;
  pnlPct: number;
}

export interface PortfolioSummary {
  investedValue: number;
  currentValue: number;
  /** Unrealized P&L on what is still held. */
  totalPnl: number;
  totalPnlPct: number;
  /** Profit locked in by past sells, before charges. */
  realizedPnl: number;
  feesPaid: number;
  /** Annualized return (%), or null when there is too little history to state one honestly. */
  xirrPct: number | null;
  bestPerformer: HoldingPerformance | null;
  worstPerformer: HoldingPerformance | null;
  dayPnl: number;
  sectorAllocation: SectorAllocation[];
}

export const PERFORMANCE_RANGES = ["1M", "3M", "6M", "1Y", "ALL"] as const;
export type PerformanceRange = (typeof PERFORMANCE_RANGES)[number];

export interface PerformancePoint {
  date: string;
  netWorth: number;
  benchmark: number | null;
}

export interface Performance {
  range: PerformanceRange;
  series: PerformancePoint[];
  changePct: number | null;
  benchmarkChangePct: number | null;
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

export function usePerformance(range: PerformanceRange) {
  return useQuery({
    queryKey: ["portfolio", "performance", range],
    queryFn: () => api.get<Performance>(`/portfolio/performance?range=${range}`),
    staleTime: 60_000,
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
