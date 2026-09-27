import { useEffect, useRef } from "react";
import { useStockQuote } from "../api/hooks/stocks";
import { TradePanel } from "../features/stocks/components/TradePanel";
import { formatINR } from "../lib/format";
import type { TradeSide } from "../lib/quickTradeContext";
import { Delta } from "./Delta";

interface QuickTradeModalProps {
  symbol: string;
  initialSide: TradeSide;
  onClose: () => void;
}

export function QuickTradeModal({ symbol, initialSide, onClose }: QuickTradeModalProps) {
  const { data: quote } = useStockQuote(symbol);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Move focus into the dialog so keyboard users start inside it.
    dialogRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Trade ${symbol}`}
        tabIndex={-1}
        className="glass w-full max-w-sm rounded-xl p-4 outline-none"
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="font-medium">{symbol}</div>
            {quote && (
              <div className="mt-0.5 flex items-center gap-2 text-sm">
                <span className="font-semibold tabular-nums">{formatINR(quote.price)}</span>
                <Delta value={quote.dayChangePct} kind="percent" showGlyph />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          >
            ✕
          </button>
        </div>
        <TradePanel symbol={symbol} initialSide={initialSide} onSuccess={onClose} />
      </div>
    </div>
  );
}
