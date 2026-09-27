import { Errors } from "../../lib/errors";
import {
  annualizedVolatilityPct,
  beta,
  buildEquityCurve,
  dailyReturns,
  maxDrawdownPct,
  realizedPnl,
  sharpeRatio,
  sumFees,
  summarizeTradeOutcomes,
  tradeOutcomes,
  xirr,
  xirrFlows,
  type CloseLookup,
  type Trade,
  type TradeStats,
} from "../../lib/finance";
import { addDaysIso } from "../../lib/pricing/dateUtils";
import type { HistoryRange } from "../stocks/schema";
import { rangeToDates } from "../stocks/service";
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

export interface HoldingPerformance {
  symbol: string;
  pnlPct: number;
}

export interface PortfolioSummary {
  investedValue: number;
  currentValue: number;
  /** Unrealized: what the current holdings are up/down versus their cost. */
  totalPnl: number;
  totalPnlPct: number;
  /** Profit locked in by past sells, before charges. */
  realizedPnl: number;
  /** All fees paid across every trade. */
  feesPaid: number;
  /** Annualized money-weighted return as a percentage, or null when it cannot be honestly computed (see finance.xirr). */
  xirrPct: number | null;
  bestPerformer: HoldingPerformance | null;
  worstPerformer: HoldingPerformance | null;
  dayPnl: number;
  sectorAllocation: SectorAllocation[];
}

function toTrade(row: repo.TradeRow): Trade {
  return {
    date: row.trade_date,
    symbol: row.symbol,
    type: row.type,
    quantity: row.quantity,
    price: Number(row.price),
    fee: Number(row.fee),
    total: Number(row.total),
  };
}

function todayIst(): string {
  // Shift to IST, then read the UTC fields -- the calendar date in India regardless of server timezone.
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function getSummary(userId: number): Promise<PortfolioSummary> {
  const [holdings, tradeRows] = await Promise.all([
    getEnrichedHoldings(userId),
    repo.getAllTrades(userId),
  ]);
  const trades = tradeRows.map(toTrade);

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

  // Best/worst by % return, over holdings whose live price is known.
  const ranked = knownCurrent
    .filter((h) => h.pnlPct !== null)
    .map((h) => ({ symbol: h.symbol, pnlPct: h.pnlPct! }))
    .sort((a, b) => b.pnlPct - a.pnlPct);

  const rate = xirr(xirrFlows(trades, currentValue, todayIst()));

  return {
    investedValue,
    currentValue,
    totalPnl,
    totalPnlPct: investedValue > 0 ? (totalPnl / investedValue) * 100 : 0,
    realizedPnl: realizedPnl(trades),
    feesPaid: sumFees(trades),
    xirrPct: rate === null ? null : rate * 100,
    bestPerformer: ranked[0] ?? null,
    worstPerformer: ranked[ranked.length - 1] ?? null,
    dayPnl,
    sectorAllocation,
  };
}

export interface PerformancePoint {
  date: string;
  netWorth: number;
  /** NIFTY 50 rebased to the portfolio's starting value; null if index data was unavailable. */
  benchmark: number | null;
}

export interface Performance {
  range: HistoryRange;
  series: PerformancePoint[];
  changePct: number | null;
  benchmarkChangePct: number | null;
}

const BENCHMARK_SYMBOL = "^NSEI";
// Extra days fetched before the range so a holding has a "last close" to
// carry forward on the range's first day, even if it starts on a weekend.
const LEAD_IN_DAYS = 10;

/**
 * Net worth over time (cash + holdings at each day's close), plus NIFTY 50
 * rebased to the same starting value so the two lines are directly
 * comparable. Rebuilt from the trade history and cached daily prices -- no
 * portfolio snapshots are stored, so it is always consistent with the trades
 * on record, including back-dated ones.
 */
export interface Analytics {
  range: HistoryRange;
  /** Return over the selected range, as percentages -- not annualized (see xirrPct on the summary for that). */
  returnPct: number | null;
  benchmarkReturnPct: number | null;
  /** Annualized standard deviation of daily returns, as a percentage. */
  volatilityPct: number | null;
  /** Largest peak-to-trough decline within the range, as a percentage (always <= 0). */
  maxDrawdownPct: number | null;
  /** Portfolio sensitivity to NIFTY 50 moves over the range (1 = moves with it, >1 = more volatile). */
  beta: number | null;
  /** Annualized Sharpe ratio, assuming a 0% risk-free rate (disclosed, not fetched from a live source). */
  sharpeRatio: number | null;
  /** Win rate / profit factor over every closed (sold) trade ever made -- not scoped to `range`, since a range with no sells would otherwise report misleadingly empty stats. */
  tradeStats: TradeStats;
}

/**
 * Risk and trade-quality statistics, built on top of getPerformance's daily
 * net-worth curve -- no separate data fetch, just different math over the
 * same series.
 */
export async function getAnalytics(userId: number, range: HistoryRange): Promise<Analytics> {
  const [performance, tradeRows] = await Promise.all([
    getPerformance(userId, range),
    repo.getAllTrades(userId),
  ]);

  const netWorths = performance.series.map((p) => p.netWorth);
  const benchmarks = performance.series
    .filter((p) => p.benchmark !== null)
    .map((p) => p.benchmark!);

  const portfolioReturns = dailyReturns(netWorths);
  const benchmarkReturns = dailyReturns(benchmarks);

  const outcomes = tradeOutcomes(tradeRows.map(toTrade));

  return {
    range,
    returnPct: performance.changePct,
    benchmarkReturnPct: performance.benchmarkChangePct,
    volatilityPct: annualizedVolatilityPct(portfolioReturns),
    maxDrawdownPct: maxDrawdownPct(netWorths),
    beta: benchmarks.length === netWorths.length ? beta(portfolioReturns, benchmarkReturns) : null,
    sharpeRatio: sharpeRatio(portfolioReturns),
    tradeStats: summarizeTradeOutcomes(outcomes),
  };
}

export async function getPerformance(userId: number, range: HistoryRange): Promise<Performance> {
  const tradeRows = await repo.getAllTrades(userId);
  if (tradeRows.length === 0) {
    return { range, series: [], changePct: null, benchmarkChangePct: null };
  }

  const trades = tradeRows.map(toTrade);
  const { from, to } = rangeToDates(range);
  const leadFrom = addDaysIso(from, -LEAD_IN_DAYS);

  // Cash before the first trade = today's cash with every trade's cash effect undone.
  const balance = await repo.getBalance(userId);
  const netCashFlow = trades.reduce((s, t) => s + (t.type === "SELL" ? t.total : -t.total), 0);
  const startBalance = balance - netCashFlow;

  const symbols = [...new Set(trades.map((t) => t.symbol))];
  const [histories, benchmark] = await Promise.all([
    Promise.all(symbols.map((s) => pricingProvider.getHistory(s, leadFrom, to))),
    pricingProvider.getIndexHistory(BENCHMARK_SYMBOL, leadFrom, to).catch(() => null),
  ]);

  const closes: CloseLookup = new Map(
    symbols.map((symbol, i) => [symbol, new Map(histories[i]!.map((c) => [c.date, c.close]))]),
  );

  // Trading days: the index's own calendar when available, otherwise the union of held symbols' days.
  const dates = benchmark
    ? benchmark.map((c) => c.date)
    : [...new Set(histories.flat().map((c) => c.date))].sort();

  // Always end the curve at today's date. On a weekend or holiday there is no
  // new trading day, so without this a trade placed today would not appear
  // until the next session -- the point carries the last close forward.
  const today = todayIst();
  if (dates.length === 0 || dates[dates.length - 1]! < today) dates.push(today);

  const curve = buildEquityCurve(trades, startBalance, closes, dates).filter((p) => p.date >= from);
  if (curve.length === 0) {
    return { range, series: [], changePct: null, benchmarkChangePct: null };
  }

  const first = curve[0]!;

  // The index's latest close on or before a date (carried across weekends/holidays,
  // exactly like the holdings' prices), so the first point of the curve -- which
  // can itself fall on a non-trading day -- still has a base to rebase against.
  const indexCandles = benchmark ?? [];
  let cursor = 0;
  let latestIndex: number | undefined;
  const indexAt = (date: string): number | undefined => {
    // `curve` is in date order, so the cursor only ever moves forward.
    while (cursor < indexCandles.length && indexCandles[cursor]!.date <= date) {
      latestIndex = indexCandles[cursor]!.close;
      cursor++;
    }
    return latestIndex;
  };

  const baseIndex = indexAt(first.date);

  const series: PerformancePoint[] = curve.map((p) => {
    const idx = indexAt(p.date);
    return {
      date: p.date,
      netWorth: p.netWorth,
      benchmark: baseIndex && idx ? first.netWorth * (idx / baseIndex) : null,
    };
  });

  const last = series[series.length - 1]!;
  const pct = (end: number, start: number) => (start > 0 ? ((end - start) / start) * 100 : null);

  return {
    range,
    series,
    changePct: pct(last.netWorth, first.netWorth),
    benchmarkChangePct: last.benchmark !== null ? pct(last.benchmark, first.netWorth) : null,
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
