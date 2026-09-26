import "dotenv/config";
import { pricingProvider } from "../lib/pricing";
import { pool } from "./pool";

// An approximation of the Nifty 50 -- real, liquid, long-standing NSE
// large-caps. NSE periodically reconstitutes the actual index, so this list
// isn't guaranteed to exactly match live index membership on any given day.
// What this app needs is a real, working starting catalog, not literal
// membership of one specific index snapshot -- and any stock a user searches
// for gets added to `stocks` on the spot regardless (see cache.ts), so this
// list only decides what's pre-populated before the first search happens.
const NIFTY_50_SYMBOLS = [
  "RELIANCE.NS",
  "TCS.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "INFY.NS",
  "ITC.NS",
  "LT.NS",
  "BHARTIARTL.NS",
  "KOTAKBANK.NS",
  "AXISBANK.NS",
  "SBIN.NS",
  "HINDUNILVR.NS",
  "BAJFINANCE.NS",
  "MARUTI.NS",
  "ASIANPAINT.NS",
  "M&M.NS",
  "SUNPHARMA.NS",
  "TITAN.NS",
  "ULTRACEMCO.NS",
  "WIPRO.NS",
  "NESTLEIND.NS",
  "ONGC.NS",
  "NTPC.NS",
  "POWERGRID.NS",
  // Tata Motors demerged in 2024/25 into separate commercial- and
  // passenger-vehicle companies; the old combined "TATAMOTORS.NS" ticker no
  // longer resolves. Confirmed via provider.search("Tata Motors").
  "TMCV.NS",
  "TMPV.NS",
  "TATASTEEL.NS",
  "JSWSTEEL.NS",
  "ADANIENT.NS",
  "ADANIPORTS.NS",
  "COALINDIA.NS",
  "HCLTECH.NS",
  "INDUSINDBK.NS",
  "BAJAJFINSV.NS",
  "GRASIM.NS",
  "DRREDDY.NS",
  "CIPLA.NS",
  "DIVISLAB.NS",
  "EICHERMOT.NS",
  "HEROMOTOCO.NS",
  "BAJAJ-AUTO.NS",
  "BRITANNIA.NS",
  "HINDALCO.NS",
  "TECHM.NS",
  "SBILIFE.NS",
  "HDFCLIFE.NS",
  "APOLLOHOSP.NS",
  "BPCL.NS",
  "SHREECEM.NS",
  "UPL.NS",
  "TATACONSUM.NS",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Seeding ${NIFTY_50_SYMBOLS.length} stocks...\n`);

  const failures: string[] = [];

  for (const [i, symbol] of NIFTY_50_SYMBOLS.entries()) {
    const progress = `[${i + 1}/${NIFTY_50_SYMBOLS.length}]`;
    try {
      const fundamentals = await pricingProvider.getFundamentals(symbol);
      console.log(`${progress} ${symbol} -- ${fundamentals.companyName}`);
    } catch (err) {
      console.error(`${progress} ${symbol} FAILED -- ${(err as Error).message}`);
      failures.push(symbol);
    }
    // A short pause between requests -- this is an unofficial API, and
    // hitting it 50 times back-to-back with no gap is a good way to get
    // temporarily rate-limited.
    await sleep(300);
  }

  console.log(
    `\nDone: ${NIFTY_50_SYMBOLS.length - failures.length}/${NIFTY_50_SYMBOLS.length} succeeded.`,
  );
  if (failures.length > 0) {
    console.log(
      `Failed symbols (check the ticker -- it may be wrong or delisted): ${failures.join(", ")}`,
    );
  }
}

main()
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
