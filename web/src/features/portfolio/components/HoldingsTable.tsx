import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { EnrichedHolding } from "../../../api/hooks/portfolio";
import { Delta } from "../../../components/Delta";
import { formatINR, formatPercent } from "../../../lib/format";
import { useQuickTrade } from "../../../lib/useQuickTrade";

type SortKey = "symbol" | "sector" | "quantity" | "dayChange" | "pnl" | "weight";

interface Row extends EnrichedHolding {
  /** Share of the portfolio's current value, in percent; null without a live price. */
  weight: number | null;
}

const COLUMNS: Array<{ key: SortKey | null; label: string; align: "left" | "right" }> = [
  { key: "symbol", label: "Instrument", align: "left" },
  { key: "sector", label: "Sector", align: "left" },
  { key: "quantity", label: "Qty", align: "right" },
  { key: null, label: "Avg cost", align: "right" },
  { key: null, label: "CMP", align: "right" },
  { key: "dayChange", label: "Day P&L", align: "right" },
  { key: "pnl", label: "Overall P&L", align: "right" },
  { key: "weight", label: "Portfolio %", align: "right" },
  { key: null, label: "", align: "right" },
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
  const { openTrade } = useQuickTrade();
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");

  const rows: Row[] = useMemo(() => {
    const total = holdings.reduce((sum, h) => sum + (h.currentValue ?? 0), 0);
    return holdings.map((h) => ({
      ...h,
      weight: h.currentValue !== null && total > 0 ? (h.currentValue / total) * 100 : null,
    }));
  }, [holdings]);

  const sectors = useMemo(
    () => [...new Set(holdings.map((h) => h.sector).filter((s): s is string => !!s))].sort(),
    [holdings],
  );

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (!sector || r.sector === sector) &&
        (!needle ||
          r.symbol.toLowerCase().includes(needle) ||
          r.companyName.toLowerCase().includes(needle)),
    );
    filtered.sort((a, b) => {
      const result =
        sortKey === "symbol"
          ? a.symbol.localeCompare(b.symbol)
          : sortKey === "sector"
            ? (a.sector ?? "").localeCompare(b.sector ?? "")
            : compareNullable(a[sortKey], b[sortKey]);
      return sortDesc ? -result : result;
    });
    return filtered;
  }, [rows, search, sector, sortKey, sortDesc]);

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
      <div className="panel p-6 text-sm text-text-secondary">
        No holdings yet.{" "}
        <Link to="/stocks" className="text-accent hover:underline">
          Browse stocks
        </Link>{" "}
        to make your first trade.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-text-tertiary focus-within:ring-2 focus-within:ring-accent-muted sm:max-w-sm">
          <Search size={15} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ticker or company..."
            aria-label="Filter holdings"
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </label>
        {sectors.length > 1 && (
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            aria-label="Filter by sector"
            className="rounded-lg bg-surface px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          >
            <option value="">All sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <span className="ml-auto text-xs text-text-secondary">
          Showing {visible.length} of {holdings.length} holdings
        </span>
      </div>

      <div className="overflow-x-auto panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {COLUMNS.map((col) => (
                <th
                  key={col.label || "actions"}
                  onClick={col.key ? () => toggleSort(col.key!) : undefined}
                  className={`px-4 py-2.5 ${col.key ? "cursor-pointer select-none hover:text-text-primary" : ""} ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                  {col.key && sortKey === col.key && (
                    <span className="ml-1">{sortDesc ? "▼" : "▲"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((h) => (
              <tr
                key={h.symbol}
                onClick={() => navigate(`/portfolio/${encodeURIComponent(h.symbol)}`)}
                className="cursor-pointer border-b border-border last:border-0"
              >
                <td className="px-4 py-2.5">
                  <div className="font-medium text-text-primary">{h.symbol}</div>
                  <div className="max-w-[12rem] truncate text-xs text-text-secondary">
                    {h.companyName}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-text-secondary">{h.sector ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{h.quantity}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(h.avgBuyPrice)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {h.currentPrice !== null ? formatINR(h.currentPrice) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {h.dayChange !== null ? <Delta value={h.dayChange} kind="currency" /> : "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {h.pnl !== null && h.pnlPct !== null ? (
                    <>
                      <Delta value={h.pnl} kind="currency" />
                      <div className="text-xs">
                        <Delta value={h.pnlPct} kind="percent" />
                      </div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {h.weight !== null ? (
                    <div className="flex flex-col items-end gap-1">
                      <span>{formatPercent(h.weight, 1)}</span>
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-accent"
                          style={{ width: `${Math.min(h.weight, 100)}%` }}
                        />
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // the row itself navigates
                        openTrade(h.symbol, "BUY");
                      }}
                      aria-label={`Buy more ${h.symbol}`}
                      className="rounded-md bg-gain-muted px-2.5 py-1 text-xs font-medium text-gain hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTrade(h.symbol, "SELL");
                      }}
                      aria-label={`Sell ${h.symbol}`}
                      className="rounded-md bg-loss-muted px-2.5 py-1 text-xs font-medium text-loss hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
                    >
                      Sell
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-text-secondary">
                  No holdings match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
