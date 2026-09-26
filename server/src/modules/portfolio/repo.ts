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
