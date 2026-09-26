import { usePortfolio, usePortfolioSummary } from "../../api/hooks/portfolio";
import { Delta } from "../../components/Delta";
import { SectorAllocationChart } from "../../components/SectorAllocationChart";
import { StatTile } from "../../components/StatTile";
import { formatINR } from "../../lib/format";
import { HoldingsTable } from "./components/HoldingsTable";

export function PortfolioPage() {
  const { data: holdings, isLoading: holdingsLoading } = usePortfolio();
  const { data: summary, isLoading: summaryLoading } = usePortfolioSummary();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Portfolio</h1>

      {summary && !summaryLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Invested" value={formatINR(summary.investedValue, 0)} />
          <StatTile label="Current value" value={formatINR(summary.currentValue, 0)} />
          <StatTile
            label="Total P&L"
            value={formatINR(summary.totalPnl, 0)}
            delta={<Delta value={summary.totalPnlPct} kind="percent" showGlyph />}
          />
          <StatTile
            label="Day P&L"
            value={<Delta value={summary.dayPnl} kind="currency" showGlyph />}
          />
        </div>
      )}

      {summary && summary.sectorAllocation.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">Sector allocation</h2>
          <SectorAllocationChart allocation={summary.sectorAllocation} />
        </div>
      )}

      {holdingsLoading ? (
        <p className="text-sm text-text-secondary">Loading holdings...</p>
      ) : (
        <HoldingsTable holdings={holdings ?? []} />
      )}
    </div>
  );
}
