import { useState } from "react";
import { useStockQuote } from "../../../api/hooks/stocks";
import { useBuy, useSell } from "../../../api/hooks/trade";
import { ApiError } from "../../../api/client";
import { formatINR } from "../../../lib/format";
import { useAuth } from "../../../lib/useAuth";

const TRADE_FEE = 20; // matches the backend's TRADE_FEE default; only used for the live estimate shown before submitting

export function TradePanel({ symbol }: { symbol: string }) {
  const { refreshUser } = useAuth();
  const { data: quote } = useStockQuote(symbol);
  const buy = useBuy();
  const sell = useSell();

  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(1);
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(
    null,
  );

  const mutation = side === "BUY" ? buy : sell;
  const effectivePrice = useCustomPrice ? Number(customPrice) : (quote?.price ?? null);
  const estimatedTotal =
    effectivePrice != null && quantity > 0
      ? side === "BUY"
        ? quantity * effectivePrice + TRADE_FEE
        : quantity * effectivePrice - TRADE_FEE
      : null;

  async function handleSubmit() {
    setFeedback(null);
    try {
      const result = await mutation.mutateAsync({
        symbol,
        quantity,
        price: useCustomPrice ? Number(customPrice) : undefined,
      });
      setFeedback({
        kind: "success",
        message: `${side === "BUY" ? "Bought" : "Sold"} ${result.transaction.quantity} @ ${formatINR(result.transaction.price)}`,
      });
      await refreshUser(); // reflects the new balance immediately, e.g. on the Account page
    } catch (err) {
      setFeedback({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex rounded-md border border-border p-0.5">
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSide(s);
              setFeedback(null);
            }}
            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              side === s
                ? s === "BUY"
                  ? "bg-gain-muted text-gain"
                  : "bg-loss-muted text-loss"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {s === "BUY" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        Quantity
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="rounded-md border border-border bg-bg px-3 py-2 tabular-nums text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
        />
      </label>

      <label className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
        <input
          type="checkbox"
          checked={useCustomPrice}
          onChange={(e) => setUseCustomPrice(e.target.checked)}
        />
        Use a custom price (e.g. logging a past trade)
      </label>

      {useCustomPrice && (
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Price per share"
          value={customPrice}
          onChange={(e) => setCustomPrice(e.target.value)}
          className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 tabular-nums text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
        />
      )}

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-text-secondary">Est. total</span>
        <span className="tabular-nums text-text-primary">
          {estimatedTotal != null ? formatINR(estimatedTotal) : "—"}
        </span>
      </div>

      {feedback && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            feedback.kind === "success" ? "bg-gain-muted text-gain" : "bg-loss-muted text-loss"
          }`}
          role="alert"
        >
          {feedback.message}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={mutation.isPending || (useCustomPrice && !customPrice)}
        className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
          side === "BUY" ? "bg-gain" : "bg-loss"
        }`}
      >
        {mutation.isPending ? "Placing order..." : `${side === "BUY" ? "Buy" : "Sell"} ${symbol}`}
      </button>
    </div>
  );
}
