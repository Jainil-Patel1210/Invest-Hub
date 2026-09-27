import { pool } from "../../db/pool";

export interface HoldingRow {
  symbol: string;
  quantity: number;
  avg_buy_price: string; // NUMERIC comes back as a string -- see cache.ts's numOrNull comment
  updated_at: Date;
  company_name: string;
  sector: string | null;
}

export async function getHoldings(userId: number): Promise<HoldingRow[]> {
  const { rows } = await pool.query<HoldingRow>(
    `SELECT h.symbol, h.quantity, h.avg_buy_price, h.updated_at, s.company_name, s.sector
     FROM portfolio_holdings h
     JOIN stocks s ON s.symbol = h.symbol
     WHERE h.user_id = $1
     ORDER BY h.symbol`,
    [userId],
  );
  return rows;
}

export async function getHolding(userId: number, symbol: string): Promise<HoldingRow | null> {
  const { rows } = await pool.query<HoldingRow>(
    `SELECT h.symbol, h.quantity, h.avg_buy_price, h.updated_at, s.company_name, s.sector
     FROM portfolio_holdings h
     JOIN stocks s ON s.symbol = h.symbol
     WHERE h.user_id = $1 AND h.symbol = $2`,
    [userId, symbol],
  );
  return rows[0] ?? null;
}

export interface TransactionRow {
  id: number;
  type: "BUY" | "SELL";
  quantity: number;
  price: string;
  fee: string;
  total: string;
  executed_at: Date;
}

export async function getTransactionsForSymbol(
  userId: number,
  symbol: string,
): Promise<TransactionRow[]> {
  const { rows } = await pool.query<TransactionRow>(
    `SELECT id, type, quantity, price, fee, total, executed_at
     FROM transactions
     WHERE user_id = $1 AND symbol = $2
     ORDER BY executed_at DESC`,
    [userId, symbol],
  );
  return rows;
}

export interface TradeRow {
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: string;
  fee: string;
  total: string;
  trade_date: string;
}

/**
 * Every trade the user has made, oldest first, for the P&L / XIRR / equity
 * curve calculations. The date is converted to Indian calendar time in SQL
 * (a trade at 00:30 IST is still the previous day in UTC -- taking the date
 * from the raw timestamp would put it on the wrong trading day).
 */
export async function getAllTrades(userId: number): Promise<TradeRow[]> {
  const { rows } = await pool.query<TradeRow>(
    `SELECT symbol, type, quantity, price, fee, total,
            to_char(executed_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS trade_date
     FROM transactions
     WHERE user_id = $1
     ORDER BY executed_at ASC, id ASC`,
    [userId],
  );
  return rows;
}

export async function getBalance(userId: number): Promise<number> {
  const { rows } = await pool.query<{ account_balance: string }>(
    "SELECT account_balance FROM users WHERE id = $1",
    [userId],
  );
  return Number(rows[0]?.account_balance ?? 0);
}
