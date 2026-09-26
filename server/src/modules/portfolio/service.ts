import { Errors } from "../../lib/errors";
import { pricingProvider } from "../../lib/pricing";
import type { Quote } from "../../lib/pricing/types";
import * as repo from "./repo";
import type { HoldingRow, TransactionRow } from "./repo";

export interface EnrichedHolding {
  symbol: string;
  companyName: string;
  sector: string | null;
  quantity: number;
  avgBuyPrice: number;
  investedValue: number;
  // Everything below is null when a live quote couldn't be fetched for this
  // one holding -- deliberately, rather than falling back to a guessed value
  // (e.g. "assume no change today"), which would silently misrepresent a
  // real price move we simply failed to observe. investedValue above is
  // always known regardless, since it comes from our own stored data, not
  // a live external call.
  currentPrice: number | null;
  currentValue: number | null;
  pnl: number | null;
  pnlPct: number | null;
  dayChange: number | null;
}

function enrichHolding(row: HoldingRow, quote: Quote | null): EnrichedHolding {
  const quantity = row.quantity;
  const avgBuyPrice = Number(row.avg_buy_price);
  const investedValue = quantity * avgBuyPrice;

  if (!quote) {
    return {
      symbol: row.symbol,
      companyName: row.company_name,
      sector: row.sector,
      quantity,
      avgBuyPrice,
      investedValue,
      currentPrice: null,
      currentValue: null,
      pnl: null,
      pnlPct: null,
      dayChange: null,
    };
  }

  const currentValue = quantity * quote.price;
  const pnl = currentValue - investedValue;

  return {
    symbol: row.symbol,
    companyName: row.company_name,
    sector: row.sector,
    quantity,
    avgBuyPrice,
    investedValue,
    currentPrice: quote.price,
    currentValue,
    pnl,
    pnlPct: investedValue > 0 ? (pnl / investedValue) * 100 : 0,
    dayChange: quantity * quote.dayChange,
  };
}

/**
 * Fetches all holdings and enriches each with a live quote. Uses
 * allSettled, not all: one holding's quote failing to fetch (a transient
 * hiccup, a since-delisted stock still sitting in an old portfolio) should
 * degrade that one row to nulls, not take down the whole portfolio view --
 * same reasoning as market/service.ts's movers.
 */
export async function getEnrichedHoldings(userId: number): Promise<EnrichedHolding[]> {
  const rows = await repo.getHoldings(userId);
  if (rows.length === 0) return [];

  const results = await Promise.allSettled(rows.map((row) => pricingProvider.getQuote(row.symbol)));

  return rows.map((row, i) => {
    const result = results[i]!; // same length and order as `rows`, by construction
    return enrichHolding(row, result.status === "fulfilled" ? result.value : null);
  });
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

export async function getSummary(userId: number): Promise<PortfolioSummary> {
  const holdings = await getEnrichedHoldings(userId);

  const investedValue = holdings.reduce((sum, h) => sum + h.investedValue, 0);

  // currentValue/dayPnl only sum holdings with a known live price -- a
  // holding with a failed quote fetch is excluded from these rather than
  // treated as zero (which would understate the portfolio) or equal to its
  // invested value (which would fabricate a 0% return that was never
  // actually observed).
  const knownCurrent = holdings.filter((h) => h.currentValue !== null);
  const currentValue = knownCurrent.reduce((sum, h) => sum + h.currentValue!, 0);
  const dayPnl = knownCurrent.reduce((sum, h) => sum + h.dayChange!, 0);
  const totalPnl = currentValue - investedValue;

  const sectorTotals = new Map<string, number>();
  for (const h of knownCurrent) {
    const sector = h.sector ?? "Uncategorized";
    sectorTotals.set(sector, (sectorTotals.get(sector) ?? 0) + h.currentValue!);
  }
  const sectorAllocation: SectorAllocation[] = [...sectorTotals.entries()]
    .map(([sector, value]) => ({
      sector,
      value,
      percentage: currentValue > 0 ? (value / currentValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    investedValue,
    currentValue,
    totalPnl,
    totalPnlPct: investedValue > 0 ? (totalPnl / investedValue) * 100 : 0,
    dayPnl,
    sectorAllocation,
  };
}

export interface TransactionView {
  id: number;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  total: number;
  executedAt: Date;
}

function mapTransaction(row: TransactionRow): TransactionView {
  return {
    id: row.id,
    type: row.type,
    quantity: row.quantity,
    price: Number(row.price),
    fee: Number(row.fee),
    total: Number(row.total),
    executedAt: row.executed_at,
  };
}

export interface HoldingDetail {
  holding: EnrichedHolding;
  transactions: TransactionView[];
}

export async function getHoldingDetail(userId: number, symbol: string): Promise<HoldingDetail> {
  const row = await repo.getHolding(userId, symbol);
  if (!row) {
    throw Errors.notFound("Holding");
  }

  const quote = await pricingProvider.getQuote(symbol).catch(() => null);
  const transactions = await repo.getTransactionsForSymbol(userId, symbol);

  return { holding: enrichHolding(row, quote), transactions: transactions.map(mapTransaction) };
}
