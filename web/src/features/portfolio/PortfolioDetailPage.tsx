import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { usePortfolioDetail } from "../../api/hooks/portfolio";
import { Delta } from "../../components/Delta";
import { formatINR } from "../../lib/format";
import { SkeletonList } from "../../components/Skeleton";

export function PortfolioDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const { data, isLoading, isError, error } = usePortfolioDetail(symbol ?? "");

  if (!symbol) return null;

  if (isLoading) return <SkeletonList rows={5} />;

  if (isError) {
    const notFound = error instanceof ApiError && error.code === "NOT_FOUND";
    return (
      <p className="text-sm text-text-secondary">
        {notFound ? (
          <>
            You don&apos;t hold {symbol}.{" "}
            <Link
              to={`/stocks/${encodeURIComponent(symbol)}`}
              className="text-accent hover:underline"
            >
              View stock
            </Link>
          </>
        ) : (
          "Something went wrong loading this position."
        )}
      </p>
    );
  }

  const { holding, transactions } = data!;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{holding.companyName}</h1>
          <Link
            to={`/stocks/${encodeURIComponent(holding.symbol)}`}
            className="text-xs text-accent hover:underline"
          >
            View stock
          </Link>
        </div>
        <p className="text-sm text-text-secondary">{holding.symbol}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 panel p-5 sm:grid-cols-4">
        <div>
          <div className="text-xs text-text-secondary">Quantity</div>
          <div className="tabular-nums">{holding.quantity}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Avg. buy price</div>
          <div className="tabular-nums">{formatINR(holding.avgBuyPrice)}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Current value</div>
          <div className="tabular-nums">
            {holding.currentValue != null ? formatINR(holding.currentValue) : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">P&L</div>
          <div>
            {holding.pnl != null ? (
              <>
                <Delta value={holding.pnl} kind="currency" />{" "}
                {holding.pnlPct != null && (
                  <Delta value={holding.pnlPct} kind="percent" className="ml-1" />
                )}
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-text-secondary">Transaction history</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-text-secondary">No transactions for this stock yet.</p>
        ) : (
          <div className="overflow-x-auto panel">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-text-secondary">
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-left font-medium">Type</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-right font-medium">Price</th>
                  <th className="px-4 py-2.5 text-right font-medium">Fee</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-text-secondary">
                      {new Date(tx.executedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
        )}
      </div>
    </div>
  );
}
