import { useState } from "react";
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  PERFORMANCE_RANGES,
  usePerformance,
  type PerformancePoint,
  type PerformanceRange,
} from "../../../api/hooks/portfolio";
import { Delta } from "../../../components/Delta";
import { Skeleton } from "../../../components/Skeleton";
import { formatINR } from "../../../lib/format";

const PORTFOLIO_COLOR = "var(--color-accent)";
const BENCHMARK_COLOR = "var(--color-text-tertiary)";

function formatDateTick(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** ₹9.99L style axis labels: an axis needs short labels, not 9,99,920.00. */
function formatAxis(value: number): string {
  if (Math.abs(value) >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`;
  if (Math.abs(value) >= 1e5) return `₹${(value / 1e5).toFixed(2)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PerformancePoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <div className="text-text-secondary">
        {new Date(point.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
      <div className="mt-1 flex items-center gap-2 tabular-nums">
        <span className="h-0.5 w-3 bg-accent" aria-hidden="true" />
        <span className="text-text-secondary">Portfolio</span>
        <span className="ml-auto font-medium text-text-primary">
          {formatINR(point.netWorth, 0)}
        </span>
      </div>
      {point.benchmark !== null && (
        <div className="mt-0.5 flex items-center gap-2 tabular-nums">
          <span
            className="h-0.5 w-3 border-t border-dashed border-text-tertiary"
            aria-hidden="true"
          />
          <span className="text-text-secondary">NIFTY 50</span>
          <span className="ml-auto font-medium text-text-primary">
            {formatINR(point.benchmark, 0)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Net worth over time against NIFTY 50 rebased to the same starting value, so
 * the two lines start together and the gap between them is the out- or
 * under-performance. The data is reconstructed server-side from the trade
 * history and daily closes.
 */
export function PerformanceChart() {
  const [range, setRange] = useState<PerformanceRange>("6M");
  const { data, isLoading, isError } = usePerformance(range);

  const series = data?.series ?? [];
  const last = series[series.length - 1];
  const hasCurve = series.length >= 2;
  const hasBenchmark = series.some((p) => p.benchmark !== null);

  const outperformance =
    data?.changePct != null && data.benchmarkChangePct != null
      ? data.changePct - data.benchmarkChangePct
      : null;

  return (
    <div className="panel flex flex-col p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Portfolio growth &amp; performance</h2>
          {last && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-lg font-semibold tabular-nums">
                {formatINR(last.netWorth, 0)}
              </span>
              {data?.changePct != null && (
                <Delta value={data.changePct} kind="percent" showGlyph pill />
              )}
              {outperformance !== null && (
                <span className="text-xs text-text-secondary">
                  {outperformance >= 0 ? "Ahead of" : "Behind"} NIFTY 50 by{" "}
                  <span className="tabular-nums text-text-primary">
                    {Math.abs(outperformance).toFixed(2)} pts
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className="flex self-start rounded-lg bg-sidebar p-1"
          role="group"
          aria-label="Chart range"
        >
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

      <div className="h-64 w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-loss">
            Couldn&apos;t load your performance right now.
          </div>
        ) : !hasCurve ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-sm text-text-secondary">
            <span>Not enough history to draw a curve yet.</span>
            <span className="text-xs text-text-tertiary">
              It builds as your trades span more than one trading day.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PORTFOLIO_COLOR} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={PORTFOLIO_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxis}
                width={64}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke={PORTFOLIO_COLOR}
                strokeWidth={2}
                fill="url(#portfolioFill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: PORTFOLIO_COLOR,
                  stroke: "var(--color-bg)",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
              {hasBenchmark && (
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke={BENCHMARK_COLOR}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Direct legend: color is never the only way to tell the two lines
          apart -- the benchmark is also dashed. */}
      {hasCurve && (
        <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-accent" aria-hidden="true" />
            Portfolio
          </span>
          {hasBenchmark && (
            <span className="flex items-center gap-1.5">
              <span
                className="h-0 w-4 border-t-2 border-dashed border-text-tertiary"
                aria-hidden="true"
              />
              NIFTY 50 (rebased)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
