import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EnrichedHolding } from "../../../api/hooks/portfolio";
import { Delta } from "../../../components/Delta";
import { formatINR } from "../../../lib/format";

type SortKey = "symbol" | "quantity" | "currentValue" | "pnl" | "pnlPct";

const COLUMNS: Array<{ key: SortKey; label: string; align: "left" | "right" }> = [
  { key: "symbol", label: "Stock", align: "left" },
  { key: "quantity", label: "Qty", align: "right" },
  { key: "currentValue", label: "Value", align: "right" },
  { key: "pnl", label: "P&L", align: "right" },
  { key: "pnlPct", label: "P&L %", align: "right" },
];

// Nulls (a holding whose live quote failed to fetch) always sort last,
// regardless of direction -- an unknown value is never "the biggest" or
// "the smallest", it's just unranked.
function compareNullable(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

export function HoldingsTable({ holdings }: { holdings: EnrichedHolding[] }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>("currentValue");
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...holdings];
    copy.sort((a, b) => {
      const result =
        sortKey === "symbol"
          ? a.symbol.localeCompare(b.symbol)
          : compareNullable(a[sortKey], b[sortKey]);
      return sortDesc ? -result : result;
    });
    return copy;
  }, [holdings, sortKey, sortDesc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  if (holdings.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No holdings yet.{" "}
        <button
          type="button"
          onClick={() => navigate("/stocks")}
          className="text-accent hover:underline"
        >
          Browse stocks
        </button>{" "}
        to make your first trade.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto panel">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`cursor-pointer select-none px-4 py-2.5 font-medium text-text-secondary hover:text-text-primary ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-text-tertiary">{sortDesc ? "▼" : "▲"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((h) => (
            <tr
              key={h.symbol}
              onClick={() => navigate(`/portfolio/${encodeURIComponent(h.symbol)}`)}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-raised"
            >
              <td className="px-4 py-2.5">
                <div className="font-medium text-text-primary">{h.symbol}</div>
                <div className="text-xs text-text-secondary">{h.companyName}</div>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">{h.quantity}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {h.currentValue != null ? formatINR(h.currentValue) : "—"}
              </td>
              <td className="px-4 py-2.5 text-right">
                {h.pnl != null ? <Delta value={h.pnl} kind="currency" /> : "—"}
              </td>
              <td className="px-4 py-2.5 text-right">
                {h.pnlPct != null ? <Delta value={h.pnlPct} kind="percent" /> : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
