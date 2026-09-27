/**
 * Portfolio math, kept free of any database or network access so every
 * function here is a plain input -> output calculation that can be unit
 * tested directly (see tests/finance.test.ts).
 */

/** One executed trade, as the calculations below need it. */
export interface Trade {
  /** Calendar day of execution in Indian time, "YYYY-MM-DD". */
  date: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  /** Cash effect as stored: BUY = quantity*price + fee, SELL = quantity*price - fee. */
  total: number;
}

// ---------------------------------------------------------------------------
// Realized P&L
// ---------------------------------------------------------------------------

/**
 * Realized profit from closed (sold) quantity, using the same weighted-
 * average cost the holdings table stores: a buy blends into the running
 * average, a sell realizes (sell price - average cost) * quantity and leaves
 * the average unchanged.
 *
 * Reported BEFORE charges. Fees are not folded into cost basis anywhere else
 * in the app (avg_buy_price is price-only), so mixing them in only here would
 * make realized and unrealized P&L inconsistent; total charges are reported
 * separately instead (see sumFees).
 *
 * Trades are replayed in date order. A trade can be back-dated, so a SELL can
 * land before the BUY that funds it in date order; the sold quantity is
 * clamped to what the replay holds at that point rather than going negative.
 */
export function realizedPnl(trades: Trade[]): number {
  const positions = new Map<string, { quantity: number; avgCost: number }>();
  let realized = 0;

  for (const t of sortTrades(trades)) {
    const pos = positions.get(t.symbol) ?? { quantity: 0, avgCost: 0 };

    if (t.type === "BUY") {
      const newQuantity = pos.quantity + t.quantity;
      pos.avgCost = (pos.quantity * pos.avgCost + t.quantity * t.price) / newQuantity;
      pos.quantity = newQuantity;
    } else {
      const sold = Math.min(t.quantity, pos.quantity);
      realized += (t.price - pos.avgCost) * sold;
      pos.quantity -= sold;
    }
    positions.set(t.symbol, pos);
  }

  return realized;
}

export function sumFees(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + t.fee, 0);
}

function sortTrades(trades: Trade[]): Trade[] {
  // Array.prototype.sort is stable, so same-day trades keep their given
  // (insertion) order -- which is the order they were actually placed in.
  return [...trades].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// ---------------------------------------------------------------------------
// XIRR
// ---------------------------------------------------------------------------

export interface CashFlow {
  date: string; // "YYYY-MM-DD"
  /** Negative = money put in, positive = money taken out / current value. */
  amount: number;
}

const MS_PER_DAY = 86_400_000;

function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY;
}

/** Below this holding period an annualized rate is meaningless (a 1% gain in a week "annualizes" to 68%). */
export const MIN_XIRR_DAYS = 30;

/**
 * Extended internal rate of return: the single annual rate r that makes the
 * present value of every dated cash flow zero,
 *
 *     sum( amount_i / (1 + r) ^ (days_i / 365) ) = 0
 *
 * where days_i is measured from the first cash flow. Unlike a plain
 * percentage return it accounts for WHEN money went in and out, so buying
 * more late in the period counts for less than money invested from day one.
 *
 * There's no closed-form solution, so this bisects: the function is monotonic
 * in r for the usual sign pattern (money in first, money out later), so a
 * sign change between the bounds brackets exactly one root, and halving the
 * bracket 200 times pins it to far beyond display precision.
 *
 * Returns null when a rate can't be honestly reported: no money in or out,
 * a holding period under MIN_XIRR_DAYS, or no root inside [-99%, +10,000%].
 * The result is a fraction (0.214 = 21.4% a year).
 */
export function xirr(flows: CashFlow[]): number | null {
  if (flows.length < 2) return null;

  const sorted = [...flows].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  const hasOutflow = sorted.some((f) => f.amount < 0);
  const hasInflow = sorted.some((f) => f.amount > 0);
  if (!hasOutflow || !hasInflow) return null;
  if (daysBetween(first.date, last.date) < MIN_XIRR_DAYS) return null;

  const years = sorted.map((f) => daysBetween(first.date, f.date) / 365);
  const npv = (rate: number) =>
    sorted.reduce((sum, f, i) => sum + f.amount / Math.pow(1 + rate, years[i]!), 0);

  let low = -0.99;
  let high = 100;
  let npvLow = npv(low);
  const npvHigh = npv(high);
  if (!Number.isFinite(npvLow) || !Number.isFinite(npvHigh) || npvLow * npvHigh > 0) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid);
    if (npvMid === 0) return mid;
    if (npvLow * npvMid < 0) {
      high = mid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }
  return (low + high) / 2;
}

/**
 * Cash flows for a user's XIRR: every trade's actual cash effect (buys are
 * money out, sells money in), plus today's market value of what is still held
 * as a final "if I sold everything now" inflow.
 */
export function xirrFlows(trades: Trade[], currentValue: number, today: string): CashFlow[] {
  const flows: CashFlow[] = trades.map((t) => ({
    date: t.date,
    amount: t.type === "BUY" ? -t.total : t.total,
  }));
  if (currentValue > 0) flows.push({ date: today, amount: currentValue });
  return flows;
}

// ---------------------------------------------------------------------------
// Equity curve
// ---------------------------------------------------------------------------

export interface EquityPoint {
  date: string;
  netWorth: number;
}

/** symbol -> (date -> closing price) */
export type CloseLookup = Map<string, Map<string, number>>;

/**
 * Net worth (cash + market value of holdings) at the close of each given
 * trading day.
 *
 * For each date the holdings and cash are replayed from the trades up to and
 * including that date, and each holding is valued at its most recent close on
 * or before the date -- carrying the last close forward across weekends and
 * holidays is what a portfolio "as of" a date actually was worth.
 *
 * `startBalance` is the cash before the first trade. Days before the first
 * trade are skipped: a flat line of untouched cash says nothing about
 * performance.
 */
export function buildEquityCurve(
  trades: Trade[],
  startBalance: number,
  closes: CloseLookup,
  dates: string[],
): EquityPoint[] {
  const ordered = sortTrades(trades);
  const points: EquityPoint[] = [];

  const quantities = new Map<string, number>();
  const lastClose = new Map<string, number>();
  let cash = startBalance;
  let next = 0; // index of the next trade not yet applied

  for (const date of dates) {
    while (next < ordered.length && ordered[next]!.date <= date) {
      const t = ordered[next]!;
      const held = quantities.get(t.symbol) ?? 0;
      if (t.type === "BUY") {
        quantities.set(t.symbol, held + t.quantity);
        cash -= t.total;
      } else {
        quantities.set(t.symbol, held - Math.min(t.quantity, held));
        cash += t.total;
      }
      next++;
    }

    // Track the latest close of EVERY symbol on EVERY date, including days
    // before the first trade: a position opened on a non-trading day (or the
    // first day of the range) needs the previous session's close to be valued.
    for (const [symbol, byDate] of closes) {
      const close = byDate.get(date);
      if (close !== undefined) lastClose.set(symbol, close);
    }

    if (next === 0) continue; // before the first trade

    let holdingsValue = 0;
    for (const [symbol, quantity] of quantities) {
      const price = lastClose.get(symbol);
      if (quantity > 0 && price !== undefined) holdingsValue += quantity * price;
    }

    points.push({ date, netWorth: cash + holdingsValue });
  }

  return points;
}
