import "dotenv/config";
import * as authService from "../modules/auth/service";
import * as tradeService from "../modules/trade/service";
import * as watchlistService from "../modules/watchlist/service";
import { addDaysIso } from "../lib/pricing/dateUtils";
import { pricingProvider } from "../lib/pricing";
import { pool } from "./pool";

const DEMO_EMAIL = "demo@investhub.local";
const DEMO_PASSWORD = "demo1234";

/**
 * A believable multi-month trade history for the demo account, so a fresh
 * deploy has a real equity curve, sector spread, and win/loss mix to show --
 * not just two same-day buys. Every price below is a real historical close
 * (fetched from Yahoo through the same cache the app itself uses), not a
 * made-up number: only the symbol, side, quantity, and how many days ago
 * each trade happened are hand-picked.
 */
const SCRIPT: Array<{ daysAgo: number; symbol: string; side: "BUY" | "SELL"; quantity: number }> = [
  { daysAgo: 150, symbol: "TCS.NS", side: "BUY", quantity: 10 },
  { daysAgo: 140, symbol: "HDFCBANK.NS", side: "BUY", quantity: 35 },
  { daysAgo: 120, symbol: "RELIANCE.NS", side: "BUY", quantity: 15 },
  { daysAgo: 100, symbol: "INFY.NS", side: "BUY", quantity: 20 },
  { daysAgo: 80, symbol: "HDFCBANK.NS", side: "SELL", quantity: 15 },
  { daysAgo: 60, symbol: "BHARTIARTL.NS", side: "BUY", quantity: 18 },
  { daysAgo: 45, symbol: "TCS.NS", side: "SELL", quantity: 3 },
  { daysAgo: 30, symbol: "ITC.NS", side: "BUY", quantity: 60 },
  { daysAgo: 15, symbol: "RELIANCE.NS", side: "SELL", quantity: 6 },
  { daysAgo: 5, symbol: "INFY.NS", side: "BUY", quantity: 8 },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The real close on or just before the target date, and the exact date it
 * actually traded on -- a target that lands on a weekend or holiday has no
 * candle of its own, so this looks back up to 7 days for the most recent one
 * that does. Anchored at 10:00 IST so the calendar day the app records
 * (transactions.executed_at converted to Asia/Kolkata) matches the date the
 * price actually came from.
 */
async function historicalTrade(
  symbol: string,
  daysAgo: number,
): Promise<{ price: number; executedAt: Date }> {
  const target = addDaysIso(todayIso(), -daysAgo);
  const from = addDaysIso(target, -7);
  const candles = await pricingProvider.getHistory(symbol, from, target);
  const candle = candles[candles.length - 1];
  if (!candle) {
    throw new Error(`No price history for ${symbol} on or before ${target} -- widen the lookback`);
  }
  return { price: candle.close, executedAt: new Date(`${candle.date}T10:00:00+05:30`) };
}

async function main() {
  const existing = await pool.query<{ id: number }>("SELECT id FROM users WHERE email = $1", [
    DEMO_EMAIL,
  ]);
  if (existing.rows.length > 0) {
    // Cascades to holdings, transactions, watchlists, and refresh tokens --
    // this only ever touches the one demo account, by id.
    console.log(`Removing existing demo account (id ${existing.rows[0]!.id})...`);
    await pool.query("DELETE FROM users WHERE id = $1", [existing.rows[0]!.id]);
  }

  console.log("Creating demo account...");
  const { user } = await authService.register({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    fullName: "Demo User",
  });

  console.log(`Replaying ${SCRIPT.length} trades across ${todayIso()}-150..-5 days...`);
  for (const step of SCRIPT) {
    const { price, executedAt } = await historicalTrade(step.symbol, step.daysAgo);
    const action = step.side === "BUY" ? tradeService.buy : tradeService.sell;
    await action(user.id, { symbol: step.symbol, quantity: step.quantity, price, executedAt });
    console.log(
      `  ${executedAt.toISOString().slice(0, 10)}  ${step.side.padEnd(4)} ${step.quantity.toString().padStart(3)} ${step.symbol.padEnd(12)} @ ${price}`,
    );
  }

  console.log("Creating watchlists...");
  const techWatch = await watchlistService.createWatchlist(user.id, "Tech Watch");
  await watchlistService.addStock(techWatch.id, user.id, "INFY.NS");
  await watchlistService.addStock(techWatch.id, user.id, "TCS.NS");

  const largeCaps = await watchlistService.createWatchlist(user.id, "Large Caps");
  await watchlistService.addStock(largeCaps.id, user.id, "SBIN.NS");
  await watchlistService.addStock(largeCaps.id, user.id, "ICICIBANK.NS");
  await watchlistService.addStock(largeCaps.id, user.id, "LT.NS");

  console.log(`\nDemo account ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Demo reset failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
