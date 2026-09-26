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
export async function findTransactions(
  userId: number,
  filters: TransactionsQuery,
): Promise<TransactionPage> {
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

  const where = conditions.join(" AND ");

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
