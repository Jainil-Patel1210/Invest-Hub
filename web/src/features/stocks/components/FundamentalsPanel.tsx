import type { StockFundamentals } from "../../../api/hooks/stocks";
import { formatCompactINR, formatINR } from "../../../lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="tabular-nums text-sm text-text-primary">{value}</div>
    </div>
  );
}

export function FundamentalsPanel({ stock }: { stock: StockFundamentals }) {
  return (
    <div className="panel p-5">
      <h2 className="mb-4 text-sm font-semibold text-text-secondary">Fundamentals</h2>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Sector" value={stock.sector ?? "—"} />
        <Stat label="Industry" value={stock.industry ?? "—"} />
        <Stat
          label="Market cap"
          value={stock.marketCap != null ? formatCompactINR(stock.marketCap) : "—"}
        />
        <Stat label="P/E ratio" value={stock.peRatio != null ? stock.peRatio.toFixed(2) : "—"} />
        <Stat label="EPS" value={stock.eps != null ? formatINR(stock.eps) : "—"} />
        <Stat label="Currency" value={stock.currency} />
        <Stat
          label="52w high"
          value={stock.week52High != null ? formatINR(stock.week52High) : "—"}
        />
        <Stat label="52w low" value={stock.week52Low != null ? formatINR(stock.week52Low) : "—"} />
      </div>
    </div>
  );
}
