import { usePortfolio, usePortfolioSummary } from "../../api/hooks/portfolio";
import { Delta } from "../../components/Delta";
import { SectorAllocationChart } from "../../components/SectorAllocationChart";
import { StatTile } from "../../components/StatTile";
import { formatINR } from "../../lib/format";
import { useAuth } from "../../lib/useAuth";
import { MoversList } from "./components/MoversList";
import { TopHoldings } from "./components/TopHoldings";
import { WatchlistStrip } from "./components/WatchlistStrip";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary } = usePortfolioSummary();
  const { data: holdings } = usePortfolio();

  const cash = user?.accountBalance ?? 0;
  const netWorth = cash + (summary?.currentValue ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Net worth" value={formatINR(netWorth, 0)} />
        <StatTile label="Cash balance" value={formatINR(cash, 0)} />
        {summary && (
          <>
            <StatTile
              label="Total P&L"
              value={formatINR(summary.totalPnl, 0)}
              delta={<Delta value={summary.totalPnlPct} kind="percent" showGlyph />}
            />
            <StatTile
              label="Day P&L"
              value={<Delta value={summary.dayPnl} kind="currency" showGlyph />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">Sector allocation</h2>
          {summary && summary.sectorAllocation.length > 0 ? (
            <SectorAllocationChart allocation={summary.sectorAllocation} />
          ) : (
            <p className="text-sm text-text-secondary">
              No holdings to show an allocation for yet.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">Top holdings</h2>
          <TopHoldings holdings={holdings ?? []} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-secondary">Movers</h2>
          <MoversList />
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <WatchlistStrip />
        </div>
      </div>
    </div>
  );
}
