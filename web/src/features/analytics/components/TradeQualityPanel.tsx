import type { TradeStats } from "../../../api/hooks/portfolio";
import { formatINR, formatPercent } from "../../../lib/format";

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-bg p-3">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-text-tertiary">{hint}</div>}
    </div>
  );
}

/** Win rate, profit factor, and average win/loss over every closed (sold) trade ever made. */
export function TradeQualityPanel({ stats }: { stats: TradeStats }) {
  if (stats.totalClosedTrades === 0) {
    return (
      <p className="text-sm text-text-secondary">
        Appears once you&apos;ve sold at least one holding -- there&apos;s no closed trade to grade
        yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Metric
        label="Win rate"
        value={stats.winRatePct !== null ? formatPercent(stats.winRatePct, 0) : "—"}
        hint={`${stats.totalClosedTrades} closed trade${stats.totalClosedTrades === 1 ? "" : "s"}`}
      />
      <Metric
        label="Profit factor"
        value={stats.profitFactor !== null ? `${stats.profitFactor.toFixed(2)}x` : "—"}
        hint={stats.profitFactor === null ? "No losing trades yet" : "Gross profit / gross loss"}
      />
      <Metric
        label="Avg win"
        value={stats.avgWin !== null ? formatINR(stats.avgWin, 0) : "—"}
        hint="Before charges"
      />
      <Metric
        label="Avg loss"
        value={stats.avgLoss !== null ? formatINR(stats.avgLoss, 0) : "—"}
        hint="Before charges"
      />
    </div>
  );
}
