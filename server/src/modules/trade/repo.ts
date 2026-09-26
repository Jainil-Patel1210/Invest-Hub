import type { PoolClient } from "pg";
import type { TransactionRow } from "../transactions/types";

export interface TransactionInsert {
  userId: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  total: number;
  executedAt: Date;
}

export async function insertTransaction(
  client: PoolClient,
  input: TransactionInsert,
): Promise<TransactionRow> {
  const { rows } = await client.query<TransactionRow>(
    `INSERT INTO transactions (user_id, symbol, type, quantity, price, fee, total, executed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, symbol, type, quantity, price, fee, total, executed_at`,
    [
      input.userId,
      input.symbol,
      input.type,
      input.quantity,
      input.price,
      input.fee,
      input.total,
      input.executedAt,
    ],
  );
  return rows[0]!; // a single-row INSERT ... RETURNING always yields exactly one row
}

/**
 * Debits the balance and checks sufficiency in one atomic statement -- the
 * WHERE guard and the write happen together, so there's no gap between
 * "check" and "act" for a concurrent request to race into. This is exactly
 * as safe under concurrency as an explicit SELECT ... FOR UPDATE followed by
 * a conditional write: a plain UPDATE always takes a row-level lock on the
 * rows it touches for the rest of the transaction, the same guarantee
 * FOR UPDATE provides explicitly. FOR UPDATE earns its keep when you need to
 * *read* a row now and decide how to write it *later* in the same
 * transaction; here the whole decision is expressed in the UPDATE's own
 * WHERE clause, so a separate read step first would just be redundant.
 */
export async function debitBalanceIfSufficient(
  client: PoolClient,
  userId: number,
  amount: number,
): Promise<boolean> {
  const result = await client.query(
    "UPDATE users SET account_balance = account_balance - $1 WHERE id = $2 AND account_balance >= $1",
    [amount, userId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function creditBalance(
  client: PoolClient,
  userId: number,
  amount: number,
): Promise<void> {
  await client.query("UPDATE users SET account_balance = account_balance + $1 WHERE id = $2", [
    amount,
    userId,
  ]);
}

/**
 * Weighted-average cost basis, computed entirely in SQL via ON CONFLICT ...
 * DO UPDATE: `portfolio_holdings.*` refers to the row as it exists right
 * now, `EXCLUDED.*` refers to the values from this statement's own VALUES
 * clause. One atomic statement -- no separate read-then-write round trip
 * that a concurrent buy of the same stock could race into.
 */
export async function upsertHoldingOnBuy(
  client: PoolClient,
  userId: number,
  symbol: string,
  quantity: number,
  price: number,
): Promise<void> {
  await client.query(
    `INSERT INTO portfolio_holdings (user_id, symbol, quantity, avg_buy_price, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id, symbol) DO UPDATE SET
       avg_buy_price = (
         portfolio_holdings.quantity * portfolio_holdings.avg_buy_price
         + EXCLUDED.quantity * EXCLUDED.avg_buy_price
       ) / (portfolio_holdings.quantity + EXCLUDED.quantity),
       quantity = portfolio_holdings.quantity + EXCLUDED.quantity,
       updated_at = now()`,
    [userId, symbol, quantity, price],
  );
}

/**
 * Sells `quantity` out of a holding, atomically choosing between two
 * outcomes: if some quantity remains, UPDATE and decrement; if this sale
 * exactly closes the position, DELETE the row instead.
 *
 * This isn't the obvious version. The obvious version -- one UPDATE with
 * `WHERE quantity >= $1`, decrementing unconditionally -- has a real bug: it
 * would try to *write* quantity = 0 for a full-close sale, and
 * `portfolio_holdings` has `CHECK (quantity > 0)`. Postgres evaluates CHECK
 * constraints immediately, per row, as part of the write itself -- not
 * deferred to commit -- so that UPDATE fails outright the moment a sale
 * would zero out the position, before the application ever gets a chance to
 * notice "oh, this should have been a DELETE instead". Verified directly by
 * reproducing it in psql, not assumed.
 *
 * The fix is a writable CTE: two DML statements (an UPDATE guarded by
 * `quantity > $1`, strictly, so it can never reach zero; a DELETE guarded by
 * `quantity = $1`, the exact-close case) combined into one atomic statement
 * with UNION ALL. The two WHERE conditions are mutually exclusive by
 * construction, so exactly one of them can ever match a given row -- and if
 * the row has less than `$1` (insufficient) or doesn't exist, neither
 * matches, and the whole query returns zero rows.
 */
export async function sellFromHolding(
  client: PoolClient,
  userId: number,
  symbol: string,
  quantity: number,
): Promise<boolean> {
  const result = await client.query(
    `WITH updated AS (
       UPDATE portfolio_holdings
       SET quantity = quantity - $1, updated_at = now()
       WHERE user_id = $2 AND symbol = $3 AND quantity > $1
       RETURNING quantity
     ),
     deleted AS (
       DELETE FROM portfolio_holdings
       WHERE user_id = $2 AND symbol = $3 AND quantity = $1
       RETURNING quantity
     )
     SELECT quantity FROM updated
     UNION ALL
     SELECT quantity FROM deleted`,
    [quantity, userId, symbol],
  );
  return result.rowCount === 1;
}
