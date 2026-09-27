import { useIndices } from "../../api/hooks/market";
import { formatPercent } from "../../lib/format";

/** Headline index levels in the top bar. Hidden until data arrives, so a slow or failed request leaves no empty box. */
export function IndexTicker() {
  const { data } = useIndices();
  const indices = (data ?? []).filter((i) => i.quote !== null);
  if (indices.length === 0) return null;

  return (
    <div className="hidden items-center gap-2 xl:flex">
      {indices.map(({ symbol, name, quote }) => {
        const q = quote!;
        const up = q.dayChangePct >= 0;
        return (
          <div
            key={symbol}
            className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs tabular-nums"
          >
            <span className="text-text-secondary">{name}</span>
            <span className="font-medium text-text-primary">
              {q.price.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={up ? "text-gain" : "text-loss"}>
              {up ? "▲ +" : "▼ -"}
              {formatPercent(Math.abs(q.dayChangePct))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
