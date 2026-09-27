import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { EnrichedHolding } from "../../../api/hooks/portfolio";
import { Delta } from "../../../components/Delta";
import { formatINR } from "../../../lib/format";
import { useQuickTrade } from "../../../lib/useQuickTrade";

const ROWS_SHOWN = 5;

/** Compact top-holdings table for the dashboard: biggest positions first, with one-click Buy / Sell. */
export function CoreHoldings({ holdings }: { holdings: EnrichedHolding[] }) {
  const navigate = useNavigate();
  const { openTrade } = useQuickTrade();

  if (holdings.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No holdings yet.{" "}
        <Link to="/stocks" className="text-accent hover:underline">
          Browse stocks
        </Link>{" "}
        to make your first trade.
      </p>
    );
  }

  // Positions with no live price sort last rather than being treated as zero.
  const top = [...holdings]
    .sort((a, b) => (b.currentValue ?? -1) - (a.currentValue ?? -1))
    .slice(0, ROWS_SHOWN);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left">Instrument</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Avg / CMP</th>
              <th className="px-3 py-2 text-right">Day</th>
              <th className="px-3 py-2 text-right">Total P&amp;L</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {top.map((h) => {
              // Today's move as a % of yesterday's value of this position.
              const dayPct =
                h.dayChange !== null && h.currentValue !== null && h.currentValue - h.dayChange > 0
                  ? (h.dayChange / (h.currentValue - h.dayChange)) * 100
                  : null;

              return (
                <tr
                  key={h.symbol}
                  onClick={() => navigate(`/portfolio/${encodeURIComponent(h.symbol)}`)}
                  className="cursor-pointer border-b border-border last:border-0"
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-text-primary">{h.symbol}</div>
                    <div className="max-w-[10rem] truncate text-xs text-text-secondary">
                      {h.companyName}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{h.quantity}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <div>{h.currentPrice !== null ? formatINR(h.currentPrice) : "—"}</div>
                    <div className="text-xs text-text-tertiary">Avg {formatINR(h.avgBuyPrice)}</div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {dayPct !== null ? <Delta value={dayPct} kind="percent" pill /> : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {h.pnl !== null && h.pnlPct !== null ? (
                      <>
                        <Delta value={h.pnl} kind="currency" />
                        <div className="text-xs">
                          <Delta value={h.pnlPct} kind="percent" />
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // the row itself navigates
                          openTrade(h.symbol, "BUY");
                        }}
                        className="rounded-md bg-gain-muted px-2.5 py-1 text-xs font-medium text-gain hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTrade(h.symbol, "SELL");
                        }}
                        className="rounded-md bg-loss-muted px-2.5 py-1 text-xs font-medium text-loss hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between px-3 text-xs text-text-secondary">
        <span>
          Showing {top.length} of {holdings.length} holdings
        </span>
        <Link to="/portfolio" className="flex items-center gap-1 text-accent hover:underline">
          View all holdings <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
