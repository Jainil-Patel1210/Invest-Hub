import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HISTORY_RANGES, useStockHistory, type HistoryRange } from "../../../api/hooks/stocks";
import { deltaDirection, formatINR } from "../../../lib/format";

function formatDateTick(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface TooltipPoint {
  date: string;
  close: number;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TooltipPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <div className="text-text-secondary">
        {new Date(point.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
      <div className="mt-0.5 font-medium tabular-nums text-text-primary">
        {formatINR(point.close)}
      </div>
    </div>
  );
}

export function PriceChart({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<HistoryRange>("3M");
  const { data: candles, isLoading } = useStockHistory(symbol, range);

  const first = candles?.[0];
  const last = candles?.[candles.length - 1];
  // The line's color reflects whether the stock rose or fell *over the
  // selected range* -- a status signal (per the dataviz skill: identity
  // colors are categorical, this is a state), reusing the same gain/loss
  // tokens as everywhere else in the app rather than inventing a separate
  // chart palette.
  const isDown = first && last ? deltaDirection(last.close - first.close) === "down" : false;
  const lineColor = isDown ? "var(--color-loss)" : "var(--color-gain)";

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {HISTORY_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted ${
              r === range
                ? "bg-surface-raised text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            Loading chart...
          </div>
        ) : !candles || candles.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            No price history available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={candles} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
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
                tickFormatter={(v: number) => v.toLocaleString("en-IN")}
                width={56}
              />
              {/* The hover crosshair + tooltip the dataviz skill requires by
                  default on any line/area chart -- this is what makes the
                  chart genuinely interactive rather than a static image. */}
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#priceFill)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor, stroke: "var(--color-bg)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
