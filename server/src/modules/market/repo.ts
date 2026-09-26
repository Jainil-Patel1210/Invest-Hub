import { pool } from "../../db/pool";

/**
 * The distinct set of symbols a user is tracking, across both holdings and
 * every watchlist. Plain UNION (not UNION ALL) deliberately: UNION removes
 * duplicates itself (at the cost of an internal sort/hash step), which is
 * exactly what's wanted here -- a stock held *and* watchlisted should count
 * once for movers, not twice. UNION ALL would be the cheaper choice only if
 * duplicates were harmless, which they aren't for this query.
 */
export async function getTrackedSymbols(userId: number): Promise<string[]> {
  const { rows } = await pool.query<{ symbol: string }>(
    `SELECT symbol FROM portfolio_holdings WHERE user_id = $1
     UNION
     SELECT wi.symbol FROM watchlist_items wi
     JOIN watchlists w ON w.id = wi.watchlist_id
     WHERE w.user_id = $1`,
    [userId],
  );
  return rows.map((r) => r.symbol);
}
