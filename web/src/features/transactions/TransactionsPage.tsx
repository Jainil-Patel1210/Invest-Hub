import { useState } from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../../api/hooks/transactions";
import { formatINR } from "../../lib/format";
import { SkeletonList } from "../../components/Skeleton";

export function TransactionsPage() {
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState<"" | "BUY" | "SELL">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTransactions({
    symbol: symbol.trim() || undefined,
    type: type || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
  });

  // Any filter change resets to page 1 -- otherwise narrowing a filter while
  // sitting on page 3 of the old results could land on a page that no
  // longer exists once the smaller result set is applied.
  function updateFilter(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">Transactions</h1>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Symbol
          <input
            type="text"
            placeholder="e.g. TCS.NS"
            value={symbol}
            onChange={(e) => updateFilter(setSymbol)(e.target.value)}
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Type
          <select
            value={type}
            onChange={(e) => updateFilter((v) => setType(v as typeof type))(e.target.value)}
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          >
            <option value="">All</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => updateFilter(setFrom)(e.target.value)}
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => updateFilter(setTo)(e.target.value)}
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          />
        </label>

        {(symbol || type || from || to) && (
          <button
            type="button"
            onClick={() => {
              setSymbol("");
              setType("");
              setFrom("");
              setTo("");
              setPage(1);
            }}
            className="pb-1.5 text-xs text-text-secondary hover:text-text-primary"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <SkeletonList rows={6} />
      ) : !data || data.transactions.length === 0 ? (
        <p className="text-sm text-text-secondary">No transactions match these filters.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-text-secondary">
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-left font-medium">Stock</th>
                  <th className="px-4 py-2.5 text-left font-medium">Type</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-right font-medium">Price</th>
                  <th className="px-4 py-2.5 text-right font-medium">Fee</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 hover:bg-surface-raised"
                  >
                    <td className="px-4 py-2.5 text-text-secondary">
                      {new Date(tx.executedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/stocks/${encodeURIComponent(tx.symbol)}`}
                        className="font-medium text-text-primary hover:underline"
                      >
                        {tx.symbol}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          tx.type === "BUY" ? "bg-gain-muted text-gain" : "bg-loss-muted text-loss"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{tx.quantity}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(tx.price)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(tx.fee)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(tx.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>{data.total} total</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
