import { isUniqueViolation } from "../../lib/db";
import { Errors } from "../../lib/errors";
import { pricingProvider } from "../../lib/pricing";
import type { Quote } from "../../lib/pricing/types";
import * as repo from "./repo";
import type { WatchlistRow } from "./repo";

export async function listWatchlists(userId: number) {
  const rows = await repo.findWatchlists(userId);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    itemCount: Number(r.item_count),
  }));
}

export async function createWatchlist(userId: number, name: string): Promise<WatchlistRow> {
  try {
    return await repo.createWatchlist(userId, name);
  } catch (err) {
    if (isUniqueViolation(err)) throw Errors.watchlistNameTaken();
    throw err;
  }
}

export async function renameWatchlist(
  id: number,
  userId: number,
  name: string,
): Promise<WatchlistRow> {
  try {
    const updated = await repo.renameWatchlist(id, userId, name);
    if (!updated) throw Errors.notFound("Watchlist");
    return updated;
  } catch (err) {
    if (isUniqueViolation(err)) throw Errors.watchlistNameTaken();
    throw err;
  }
}

export async function deleteWatchlist(id: number, userId: number): Promise<void> {
  const deleted = await repo.deleteWatchlist(id, userId);
  if (!deleted) throw Errors.notFound("Watchlist");
}

async function requireOwnedWatchlist(id: number, userId: number): Promise<WatchlistRow> {
  const watchlist = await repo.findWatchlistById(id, userId);
  if (!watchlist) throw Errors.notFound("Watchlist");
  return watchlist;
}

export interface EnrichedWatchlistItem {
  symbol: string;
  companyName: string;
  sector: string | null;
  addedAt: Date;
  quote: Quote | null;
}

export async function getWatchlistDetail(id: number, userId: number) {
  const watchlist = await requireOwnedWatchlist(id, userId);
  const items = await repo.getWatchlistItems(id);

  // Same allSettled reasoning as portfolio and market: one stale/broken
  // symbol shouldn't blank out the whole watchlist view.
  const results = await Promise.allSettled(
    items.map((item) => pricingProvider.getQuote(item.symbol)),
  );
  const enriched: EnrichedWatchlistItem[] = items.map((item, i) => {
    const result = results[i]!;
    return {
      symbol: item.symbol,
      companyName: item.company_name,
      sector: item.sector,
      addedAt: item.added_at,
      quote: result.status === "fulfilled" ? result.value : null,
    };
  });

  return { id: watchlist.id, name: watchlist.name, items: enriched };
}

export async function addStock(id: number, userId: number, symbol: string): Promise<void> {
  await requireOwnedWatchlist(id, userId);
  // Validates the symbol is real AND, as a side effect, grows the `stocks`
  // cache to include it if this is the first time anyone's looked it up --
  // the FK on watchlist_items.symbol requires the row to already exist.
  await pricingProvider.getFundamentals(symbol);
  await repo.addStockToWatchlist(id, symbol);
}

export async function removeStock(id: number, userId: number, symbol: string): Promise<void> {
  await requireOwnedWatchlist(id, userId);
  await repo.removeStockFromWatchlist(id, symbol);
}
