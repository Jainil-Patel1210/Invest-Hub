import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PerformancePoint } from "../../../api/hooks/portfolio";
import { formatPercent } from "../../../lib/format";

const PORTFOLIO_COLOR = "var(--color-accent)";
const BENCHMARK_COLOR = "var(--color-text-tertiary)";

interface ReturnPoint {
  date: string;
  portfolioPct: number;
  benchmarkPct: number | null;
}

function formatDateTick(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ReturnPoint }>;
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
          {formatPercent(point.portfolioPct)}
        </span>
      </div>
      {point.benchmarkPct !== null && (
        <div className="mt-0.5 flex items-center gap-2 tabular-nums">
          <span
            className="h-0.5 w-3 border-t border-dashed border-text-tertiary"
            aria-hidden="true"
          />
          <span className="text-text-secondary">NIFTY 50</span>
          <span className="ml-auto font-medium text-text-primary">
            {formatPercent(point.benchmarkPct)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Cumulative % return of the portfolio against NIFTY 50 over the same
 * period -- both series rebased to 0% at the first point, so the vertical
 * gap between the lines at any date is the out/under-performance to date.
 */
export function ReturnChart({ series }: { series: PerformancePoint[] }) {
  const points: ReturnPoint[] = useMemo(() => {
    if (series.length === 0) return [];
    const base = series[0]!;
    return series.map((p) => ({
      date: p.date,
      portfolioPct: ((p.netWorth - base.netWorth) / base.netWorth) * 100,
      benchmarkPct:
        p.benchmark !== null && base.netWorth > 0
          ? ((p.benchmark - base.netWorth) / base.netWorth) * 100
          : null,
    }));
  }, [series]);

  const hasBenchmark = points.some((p) => p.benchmarkPct !== null);

  if (points.length < 2) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 text-center text-sm text-text-secondary">
        <span>Not enough history to draw a return curve yet.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              width={44}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="portfolioPct"
              stroke={PORTFOLIO_COLOR}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: PORTFOLIO_COLOR, stroke: "var(--color-bg)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {hasBenchmark && (
              <Line
                type="monotone"
                dataKey="benchmarkPct"
                stroke={BENCHMARK_COLOR}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

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
            NIFTY 50
          </span>
        )}
      </div>
    </div>
  );
}
