import { useState } from "react";
import {
  PERFORMANCE_RANGES,
  useAnalytics,
  usePerformance,
  type PerformanceRange,
} from "../../api/hooks/portfolio";
import { Delta } from "../../components/Delta";
import { Skeleton } from "../../components/Skeleton";
import { StatTile } from "../../components/StatTile";
import { formatPercent } from "../../lib/format";
import { ReturnChart } from "./components/ReturnChart";
import { TradeQualityPanel } from "./components/TradeQualityPanel";


export function AnalyticsPage() {
  const [range, setRange] = useState<PerformanceRange>("6M");
  const { data: performance, isLoading: perfLoading } = usePerformance(range);
  const { data: analytics, isLoading: analyticsLoading, isError } = useAnalytics(range);

  const loading = perfLoading || analyticsLoading;
  const hasCurve = (performance?.series.length ?? 0) >= 2;

  const outperformance =
    analytics?.returnPct != null && analytics.benchmarkReturnPct != null
      ? analytics.returnPct - analytics.benchmarkReturnPct
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Performance intelligence
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio analytics</h1>
        </div>

        <div className="flex rounded-lg bg-sidebar p-1" role="group" aria-label="Analysis range">
          {PERFORMANCE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={r === range}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted ${
                r === range
                  ? "bg-accent-strong text-on-accent-strong"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-loss">Couldn&apos;t load analytics right now.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatTile
              label="Return vs NIFTY"
              loading={loading}
              value={
                analytics?.returnPct != null ? (
                  <Delta value={analytics.returnPct} kind="percent" showGlyph />
                ) : (
                  <span className="text-text-tertiary">—</span>
                )
              }
              delta={
                outperformance !== null ? (
                  <span className="text-xs text-text-secondary">
                    {outperformance >= 0 ? "Ahead by" : "Behind by"}{" "}
                    <span className="tabular-nums text-text-primary">
                      {formatPercent(Math.abs(outperformance))}
                    </span>
                  </span>
                ) : undefined
              }
            />
            <StatTile
              label="Volatility"
              loading={loading}
              value={
                analytics?.volatilityPct != null ? (
                  formatPercent(analytics.volatilityPct)
                ) : (
                  <span className="text-text-tertiary">—</span>
                )
              }
              delta={<span className="text-xs text-text-secondary">Annualized, daily returns</span>}
            />
            <StatTile
              label="Max drawdown"
              loading={loading}
              value={
                analytics?.maxDrawdownPct != null ? (
                  <Delta value={analytics.maxDrawdownPct} kind="percent" />
                ) : (
                  <span className="text-text-tertiary">—</span>
                )
              }
              delta={<span className="text-xs text-text-secondary">Worst peak-to-trough</span>}
            />
            <StatTile
              label="Beta vs NIFTY"
              loading={loading}
              value={analytics?.beta != null ? analytics.beta.toFixed(2) : "—"}
              delta={
                <span className="text-xs text-text-secondary">
                  {analytics?.beta != null
                    ? analytics.beta > 1
                      ? "More volatile than the index"
                      : "Less volatile than the index"
                    : "Needs a benchmark-matched history"}
                </span>
              }
            />
            <StatTile
              label="Sharpe ratio"
              loading={loading}
              value={analytics?.sharpeRatio != null ? analytics.sharpeRatio.toFixed(2) : "—"}
              delta={<span className="text-xs text-text-secondary">Assumes 0% risk-free rate</span>}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="panel p-5 xl:col-span-8">
              <h2 className="mb-4 text-base font-semibold">Cumulative return vs NIFTY 50</h2>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : hasCurve ? (
                <ReturnChart series={performance!.series} />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
                  Not enough trade history to draw a curve yet.
                </div>
              )}
            </div>

            <div className="panel p-5 xl:col-span-4">
              <h2 className="mb-1 text-base font-semibold">Trade quality</h2>
              <p className="mb-4 text-xs text-text-tertiary">
                Across every closed (sold) trade, all-time -- not scoped to the range above.
              </p>
              {analyticsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <TradeQualityPanel stats={analytics!.tradeStats} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
