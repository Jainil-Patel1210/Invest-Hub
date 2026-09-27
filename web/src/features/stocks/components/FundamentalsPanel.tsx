import type { Quote, StockFundamentals } from "../../../api/hooks/stocks";
import { formatCompactINR, formatINR } from "../../../lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="tabular-nums text-sm text-text-primary">{value}</div>
    </div>
  );
}

/** Where today's price sits between the 52-week low and high, as a 0-100 position. Clamped: a price can briefly sit outside a stale 52w range. */
function rangePosition(price: number, low: number, high: number): number {
  if (high <= low) return 50;
  return Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100));
}

export function FundamentalsPanel({ stock, quote }: { stock: StockFundamentals; quote?: Quote }) {
  const hasRange = stock.week52High != null && stock.week52Low != null;
  const position =
    hasRange && quote ? rangePosition(quote.price, stock.week52Low!, stock.week52High!) : null;

  return (
    <div className="panel p-5">
      <h2 className="mb-4 text-base font-semibold">Fundamentals</h2>
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
      </div>

      {hasRange && (
        <div className="mt-5 border-t border-border pt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
            <span>52-week low</span>
            <span>52-week high</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent"
              style={{ width: `${position ?? 0}%` }}
            />
            {position !== null && (
              <span
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-bg bg-accent-strong"
                style={{ left: `${position}%`, transform: "translate(-50%, -50%)" }}
                title={quote ? `Current: ${formatINR(quote.price)}` : undefined}
              />
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-sm tabular-nums text-text-primary">
            <span>{formatINR(stock.week52Low!)}</span>
            <span>{formatINR(stock.week52High!)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
