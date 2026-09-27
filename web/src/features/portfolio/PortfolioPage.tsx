import { usePortfolio, usePortfolioSummary } from "../../api/hooks/portfolio";
import { Delta } from "../../components/Delta";
import { SectorAllocationChart } from "../../components/SectorAllocationChart";
import { SkeletonList } from "../../components/Skeleton";
import { StatTile } from "../../components/StatTile";
import { formatINR, formatPercent } from "../../lib/format";
import { HoldingsTable } from "./components/HoldingsTable";

const TILE_LABELS = ["Invested capital", "Unrealized P&L", "Realized P&L", "Day P&L", "XIRR"];

export function PortfolioPage() {
  const { data: holdings, isLoading: holdingsLoading } = usePortfolio();
  const { data: summary, isLoading: summaryLoading } = usePortfolioSummary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Portfolio valuation
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Holdings &amp; asset breakdown</h1>
      </div>

      {summaryLoading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {TILE_LABELS.map((label) => (
            <StatTile key={label} label={label} value="" loading />
          ))}
        </div>
      )}

      {summary && !summaryLoading && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatTile
              label="Invested capital"
              value={formatINR(summary.investedValue, 0)}
              delta={
                <span className="text-xs text-text-secondary">
                  Now worth{" "}
                  <span className="tabular-nums text-text-primary">
                    {formatINR(summary.currentValue, 0)}
                  </span>
                </span>
              }
            />
            <StatTile
              label="Unrealized P&L"
              value={<Delta value={summary.totalPnl} kind="currency" />}
              delta={<Delta value={summary.totalPnlPct} kind="percent" showGlyph pill />}
            />
            <StatTile
              label="Realized P&L"
              value={<Delta value={summary.realizedPnl} kind="currency" />}
              delta={
                <span className="text-xs text-text-secondary">
                  Booked profit, before ₹{summary.feesPaid.toLocaleString("en-IN")} in charges
                </span>
              }
            />
            <StatTile
              label="Day P&L"
              value={<Delta value={summary.dayPnl} kind="currency" showGlyph />}
              delta={<span className="text-xs text-text-secondary">On live prices</span>}
            />
            <StatTile
              label="XIRR (annualized)"
              value={
                summary.xirrPct !== null ? (
                  <Delta value={summary.xirrPct} kind="percent" showGlyph />
                ) : (
                  <span className="text-text-tertiary">—</span>
                )
              }
              delta={
                <span className="text-xs text-text-secondary">
                  {summary.xirrPct !== null
                    ? "Money-weighted, all trades"
                    : "Needs 30+ days of trade history"}
                </span>
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="panel p-5 xl:col-span-8">
              <h2 className="mb-4 text-base font-semibold">Sector allocation</h2>
              <SectorAllocationChart allocation={summary.sectorAllocation} />
            </div>

            <div className="panel flex flex-col gap-4 p-5 xl:col-span-4">
              <h2 className="text-base font-semibold">Best &amp; worst holding</h2>
              {summary.bestPerformer && summary.worstPerformer ? (
                <>
                  {[
                    { label: "Best performer", entry: summary.bestPerformer },
                    { label: "Worst performer", entry: summary.worstPerformer },
                  ].map(({ label, entry }) => (
                    <div key={label} className="rounded-lg bg-bg p-3">
                      <div className="text-xs text-text-secondary">{label}</div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-medium">{entry.symbol}</span>
                        <Delta value={entry.pnlPct} kind="percent" showGlyph pill />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-text-tertiary">
                    Ranked by return on cost across current holdings
                    {summary.bestPerformer.symbol === summary.worstPerformer.symbol
                      ? " (only one holding so far)"
                      : ""}
                    .
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-secondary">
                  Appears once you hold at least one stock with a live price.
                </p>
              )}
              {summary.currentValue > 0 && (
                <p className="mt-auto text-xs text-text-tertiary">
                  Holdings valued at {formatINR(summary.currentValue, 0)} ·{" "}
                  {formatPercent(summary.totalPnlPct)} on cost.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {holdingsLoading ? <SkeletonList rows={4} /> : <HoldingsTable holdings={holdings ?? []} />}
    </div>
  );
}
