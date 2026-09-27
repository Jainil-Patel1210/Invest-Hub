import { pool } from "../../db/pool";
import type { TransactionRow } from "./types";
import type { TransactionsQuery } from "./schema";

const PAGE_SIZE = 20;

export interface TransactionPage {
  rows: TransactionRow[];
  total: number;
}

/**
 * Builds a WHERE clause with only the filters actually present -- but every
 * *value* that could carry attacker-controlled data still goes through a
 * parameterized `$n` placeholder. That's the actual SQL-injection boundary:
 * the shape of the query (how many conditions, which columns) is allowed to
 * vary at runtime; a value is never concatenated into the query text itself.
 */
function buildWhere(
  userId: number,
  filters: Omit<TransactionsQuery, "page">,
): { where: string; params: unknown[] } {
  const conditions: string[] = ["user_id = $1"];
  const params: unknown[] = [userId];

  if (filters.symbol) {
    params.push(filters.symbol);
    conditions.push(`symbol = $${params.length}`);
  }
  if (filters.type) {
    params.push(filters.type);
    conditions.push(`type = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`executed_at >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`executed_at <= $${params.length}`);
  }

  return { where: conditions.join(" AND "), params };
}

export async function findTransactions(
  userId: number,
  filters: TransactionsQuery,
): Promise<TransactionPage> {
  const { where, params } = buildWhere(userId, filters);

  const { rows: countRows } = await pool.query<{ count: string }>(
    `SELECT count(*) FROM transactions WHERE ${where}`,
    params,
  );
  const total = Number(countRows[0]!.count);

  // LIMIT/OFFSET are pushed as their own parameters, even though they're
  // internally-computed numbers, not raw user input -- always parameterize,
  // rather than lean on "this happens to be safe because of validation
  // upstream", a kind of confidence that erodes as code changes over time.
  const offset = (filters.page - 1) * PAGE_SIZE;
  params.push(PAGE_SIZE, offset);
  const limitParam = params.length - 1;
  const offsetParam = params.length;

  const { rows } = await pool.query<TransactionRow>(
    `SELECT id, symbol, type, quantity, price, fee, total, executed_at
     FROM transactions
     WHERE ${where}
     ORDER BY executed_at DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    params,
  );

  return { rows, total };
}

export { PAGE_SIZE };

export interface TransactionSummary {
  count: number;
  buyCount: number;
  sellCount: number;
  /** Sum of quantity * price across the matching trades, both sides -- the gross value traded. */
  turnover: number;
  feesPaid: number;
}

/** Totals over every trade matching the filters (not just the current page). */
export async function summarizeTransactions(
  userId: number,
  filters: Omit<TransactionsQuery, "page">,
): Promise<TransactionSummary> {
  const { where, params } = buildWhere(userId, filters);

  const { rows } = await pool.query<{
    count: string;
    buy_count: string;
    sell_count: string;
    turnover: string;
    fees: string;
  }>(
    `SELECT count(*) AS count,
            count(*) FILTER (WHERE type = 'BUY') AS buy_count,
            count(*) FILTER (WHERE type = 'SELL') AS sell_count,
            COALESCE(sum(quantity * price), 0) AS turnover,
            COALESCE(sum(fee), 0) AS fees
     FROM transactions
     WHERE ${where}`,
    params,
  );

  // An aggregate with no GROUP BY always yields exactly one row.
  const row = rows[0]!;
  return {
    count: Number(row.count),
    buyCount: Number(row.buy_count),
    sellCount: Number(row.sell_count),
    turnover: Number(row.turnover),
    feesPaid: Number(row.fees),
  };
}

/** Upper bound on an export, so one request can never pull an unbounded table. */
export const EXPORT_LIMIT = 5000;

/** Every matching trade, newest first, capped at EXPORT_LIMIT -- for CSV export. */
export async function findAllTransactions(
  userId: number,
  filters: Omit<TransactionsQuery, "page">,
): Promise<TransactionRow[]> {
  const { where, params } = buildWhere(userId, filters);
  params.push(EXPORT_LIMIT);

  const { rows } = await pool.query<TransactionRow>(
    `SELECT id, symbol, type, quantity, price, fee, total, executed_at
     FROM transactions
     WHERE ${where}
     ORDER BY executed_at DESC
     LIMIT $${params.length}`,
    params,
  );
  return rows;
}
