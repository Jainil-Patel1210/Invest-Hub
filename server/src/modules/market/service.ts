import type { Quote } from "../../lib/pricing/types";
import { pricingProvider } from "../../lib/pricing";
import * as repo from "./repo";

export interface Movers {
  gainers: Quote[];
  losers: Quote[];
}

export async function getMovers(userId: number, limit: number): Promise<Movers> {
  const symbols = await repo.getTrackedSymbols(userId);
  if (symbols.length === 0) {
    return { gainers: [], losers: [] };
  }

  // allSettled, not all: one tracked symbol failing to fetch (a transient
  // network hiccup, a delisted stock still sitting in an old watchlist)
  // shouldn't take down the entire market overview when every other symbol
  // is fine. Contrast with cache.ts's getFundamentals, which needs quote()
  // *and* quoteSummary() together for one coherent object -- all-or-nothing
  // is correct there. Here each symbol is independent, so partial success
  // is not just acceptable but clearly the better behavior.
  const results = await Promise.allSettled(
    symbols.map((symbol) => pricingProvider.getQuote(symbol)),
  );
  const quotes = results
    .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
    .map((r) => r.value);

  const sorted = [...quotes].sort((a, b) => b.dayChangePct - a.dayChangePct);

  return {
    // Sorted descending by day-change%: the front is the biggest gainers.
    gainers: sorted.slice(0, limit),
    // The back is the biggest losers, but in ascending (least-negative-first)
    // order -- reverse so the most dramatic decline is first, matching how a
    // "top losers" list is normally read.
    losers: sorted.slice(-limit).reverse(),
  };
}
