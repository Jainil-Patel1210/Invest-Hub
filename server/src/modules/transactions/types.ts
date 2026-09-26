/**
 * The canonical shape of one transaction row, and its mapping into an API
 * view. Lives here, neutrally, rather than inside either the `trade` module
 * (which creates transactions) or being duplicated there -- both `trade`
 * and `transactions` import this same definition, since a transaction is
 * one domain concept regardless of which route surfaces it.
 *
 * Note: this is deliberately *not* reused by portfolio/service.ts's
 * TransactionView, which is narrower on purpose (no `symbol` field, since
 * it's already scoped to one symbol by the URL it's returned from). Forcing
 * that context into this shared type would mean an awkward always-redundant
 * field in one place to save a ~3-line mapping function in the other --
 * not a trade worth making.
 */
export interface TransactionRow {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: string; // NUMERIC comes back as a string -- see cache.ts's numOrNull comment
  fee: string;
  total: string;
  executed_at: Date;
}

export interface TransactionView {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  total: number;
  executedAt: Date;
}

export function mapTransaction(row: TransactionRow): TransactionView {
  return {
    id: row.id,
    symbol: row.symbol,
    type: row.type,
    quantity: row.quantity,
    price: Number(row.price),
    fee: Number(row.fee),
    total: Number(row.total),
    executedAt: row.executed_at,
  };
}
