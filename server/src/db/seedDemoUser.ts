import "dotenv/config";
import * as authService from "../modules/auth/service";
import * as tradeService from "../modules/trade/service";
import * as watchlistService from "../modules/watchlist/service";
import { pool } from "./pool";

const DEMO_EMAIL = "demo@investhub.local";
const DEMO_PASSWORD = "demo1234";

// Idempotent: safe to run against a database that already has the demo
// account. Everything below goes through the real service layer -- the same
// register/buy/watchlist functions the actual API routes call -- rather
// than raw INSERTs, so this exercises real business logic (price
// resolution, weighted-average cost basis, the atomic balance debit) the
// same way a real user's actions would.
async function main() {
  const existing = await pool.query<{ id: number }>("SELECT id FROM users WHERE email = $1", [
    DEMO_EMAIL,
  ]);

  if (existing.rows.length > 0) {
    console.log(`Demo account already exists (id ${existing.rows[0]!.id}) -- nothing to do.`);
    return;
  }

  console.log("Creating demo account...");
  const { user } = await authService.register({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    fullName: "Demo User",
  });

  console.log("Buying sample holdings...");
  await tradeService.buy(user.id, { symbol: "TCS.NS", quantity: 10 });
  await tradeService.buy(user.id, { symbol: "RELIANCE.NS", quantity: 8 });

  console.log("Creating a sample watchlist...");
  const watchlist = await watchlistService.createWatchlist(user.id, "Tech Watch");
  await watchlistService.addStock(watchlist.id, user.id, "INFY.NS");
  await watchlistService.addStock(watchlist.id, user.id, "HDFCBANK.NS");

  console.log(`\nDemo account ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("Demo seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
