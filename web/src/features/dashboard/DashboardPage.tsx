import { usePerformance, usePortfolio, usePortfolioSummary } from "../../api/hooks/portfolio";
import { Delta } from "../../components/Delta";
import { SectorAllocationChart } from "../../components/SectorAllocationChart";
import { Sparkline } from "../../components/Sparkline";
import { StatTile } from "../../components/StatTile";
import { formatINR } from "../../lib/format";
import { useAuth } from "../../lib/useAuth";
import { CoreHoldings } from "./components/CoreHoldings";
import { MarketPanel } from "./components/MarketPanel";
import { PerformanceChart } from "./components/PerformanceChart";

/** A section that failed to load says so, rather than silently rendering
 * nothing forever -- each dashboard panel is an independent query, so one
 * failing (say, movers) shouldn't leave the user wondering why a *different*
 * section (sector allocation) is blank too when it actually loaded fine. */
function SectionError() {
  return <p className="text-sm text-loss">Couldn&apos;t load this right now.</p>;
}

const SPARKLINE_POINTS = 40;

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isError: summaryError } = usePortfolioSummary();
  const { data: holdings, isError: holdingsError } = usePortfolio();
  // The all-time curve feeds the net-worth tile's trend line and change chip.
  const { data: allTime } = usePerformance("ALL");

  const cash = user?.accountBalance ?? 0;
  // Until the summary arrives, net worth would silently equal cash alone --
  // a wrong number shown as if it were right -- so it shows a skeleton instead.
  const summaryPending = !summary && !summaryError;
  const netWorth = cash + (summary?.currentValue ?? 0);
  const trend = (allTime?.series ?? []).slice(-SPARKLINE_POINTS).map((p) => p.netWorth);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Portfolio console
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Net worth"
          value={formatINR(netWorth, 0)}
          loading={summaryPending}
          delta={
            allTime?.changePct != null ? (
              <span className="flex items-center gap-2">
                <Delta value={allTime.changePct} kind="percent" showGlyph pill />
                <span className="text-xs text-text-tertiary">since first trade</span>
              </span>
            ) : undefined
          }
          footer={<Sparkline values={trend} className="h-6 w-full text-accent" />}
        />
        <StatTile
          label="Cash balance"
          value={formatINR(cash, 0)}
          delta={<span className="text-xs text-text-secondary">Available to trade</span>}
        />
        {summaryError ? (
          <div className="panel col-span-2 flex items-center p-4">
            <SectionError />
          </div>
        ) : summaryPending ? (
          <>
            <StatTile label="Total P&L" value="" loading />
            <StatTile label="Day P&L" value="" loading />
          </>
        ) : (
          summary && (
            <>
              <StatTile
                label="Total P&L"
                value={<Delta value={summary.totalPnl + summary.realizedPnl} kind="currency" />}
                delta={
                  <span className="text-xs text-text-secondary">
                    Unrealized{" "}
                    <span className="tabular-nums text-text-primary">
                      {formatINR(summary.totalPnl, 0)}
                    </span>{" "}
                    · Realized{" "}
                    <span className="tabular-nums text-text-primary">
                      {formatINR(summary.realizedPnl, 0)}
                    </span>
                  </span>
                }
              />
              <StatTile
                label="Day P&L"
                value={<Delta value={summary.dayPnl} kind="currency" showGlyph />}
                delta={
                  <span className="text-xs text-text-secondary">On today&apos;s live prices</span>
                }
              />
            </>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <PerformanceChart />
        </div>
        <div className="panel p-5 xl:col-span-4">
          <h2 className="mb-4 text-base font-semibold">Sector allocation</h2>
          {summaryError ? (
            <SectionError />
          ) : summary && summary.sectorAllocation.length > 0 ? (
            <SectorAllocationChart allocation={summary.sectorAllocation} layout="stack" />
          ) : (
            <p className="text-sm text-text-secondary">
              No holdings to show an allocation for yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="panel p-5 xl:col-span-8">
          <h2 className="mb-3 text-base font-semibold">Core holdings</h2>
          {holdingsError ? <SectionError /> : <CoreHoldings holdings={holdings ?? []} />}
        </div>
        <div className="xl:col-span-4">
          <MarketPanel />
        </div>
      </div>
    </div>
  );
}
