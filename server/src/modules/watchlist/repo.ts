import { pool } from "../../db/pool";

export interface WatchlistRow {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
}

export interface WatchlistWithCount extends WatchlistRow {
  item_count: string; // COUNT(...) comes back as a string from pg, not a number
}

export async function findWatchlists(userId: number): Promise<WatchlistWithCount[]> {
  const { rows } = await pool.query<WatchlistWithCount>(
    `SELECT w.*, COUNT(wi.symbol) AS item_count
     FROM watchlists w
     LEFT JOIN watchlist_items wi ON wi.watchlist_id = w.id
     WHERE w.user_id = $1
     GROUP BY w.id
     ORDER BY w.created_at`,
    [userId],
  );
  return rows;
}

/** Scoped to the owner in the query itself -- returns null for "doesn't exist" and "exists but isn't yours" alike. */
export async function findWatchlistById(id: number, userId: number): Promise<WatchlistRow | null> {
  const { rows } = await pool.query<WatchlistRow>(
    "SELECT * FROM watchlists WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return rows[0] ?? null;
}

export async function createWatchlist(userId: number, name: string): Promise<WatchlistRow> {
  const { rows } = await pool.query<WatchlistRow>(
    "INSERT INTO watchlists (user_id, name) VALUES ($1, $2) RETURNING *",
    [userId, name],
  );
  return rows[0]!; // a single-row INSERT ... RETURNING * always yields exactly one row
}

/**
 * The UPDATE's own WHERE clause does double duty as both the ownership
 * check and the target selection -- one round trip instead of a separate
 * SELECT-then-UPDATE, with `rows[0] ?? null` telling the caller whether
 * anything actually matched (nonexistent id, or an id that exists but
 * belongs to someone else -- indistinguishable on purpose, same
 * anti-enumeration principle as auth's login error).
 */
export async function renameWatchlist(
  id: number,
  userId: number,
  name: string,
): Promise<WatchlistRow | null> {
  const { rows } = await pool.query<WatchlistRow>(
    "UPDATE watchlists SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [name, id, userId],
  );
  return rows[0] ?? null;
}

export async function deleteWatchlist(id: number, userId: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM watchlists WHERE id = $1 AND user_id = $2", [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export interface WatchlistItemRow {
  symbol: string;
  added_at: Date;
  company_name: string;
  sector: string | null;
}

export async function getWatchlistItems(watchlistId: number): Promise<WatchlistItemRow[]> {
  const { rows } = await pool.query<WatchlistItemRow>(
    `SELECT wi.symbol, wi.added_at, s.company_name, s.sector
     FROM watchlist_items wi
     JOIN stocks s ON s.symbol = wi.symbol
     WHERE wi.watchlist_id = $1
     ORDER BY wi.added_at`,
    [watchlistId],
  );
  return rows;
}

/** ON CONFLICT DO NOTHING: adding an already-present stock is a silent no-op, not an error. */
export async function addStockToWatchlist(watchlistId: number, symbol: string): Promise<void> {
  await pool.query(
    "INSERT INTO watchlist_items (watchlist_id, symbol) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [watchlistId, symbol],
  );
}

/** Removing a stock that was never a member is also a no-op -- DELETE matching zero rows isn't an error. */
export async function removeStockFromWatchlist(watchlistId: number, symbol: string): Promise<void> {
  await pool.query("DELETE FROM watchlist_items WHERE watchlist_id = $1 AND symbol = $2", [
    watchlistId,
    symbol,
  ]);
}
