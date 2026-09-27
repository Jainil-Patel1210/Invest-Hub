import { useMemo, useState, type ReactNode } from "react";
import { QuickTradeModal } from "../components/QuickTradeModal";
import { QuickTradeContext, type TradeSide } from "./quickTradeContext";

/**
 * Owns the single, app-wide quick-order modal. Any component calls
 * openTrade(symbol, side) via useQuickTrade() instead of each page carrying
 * its own trade UI.
 */
export function QuickTradeProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<{ symbol: string; side: TradeSide } | null>(null);

  const value = useMemo(
    () => ({ openTrade: (symbol: string, side: TradeSide = "BUY") => setTarget({ symbol, side }) }),
    [],
  );

  return (
    <QuickTradeContext.Provider value={value}>
      {children}
      {target && (
        <QuickTradeModal
          // A new key per open resets the panel's form state (side, quantity).
          key={`${target.symbol}-${target.side}`}
          symbol={target.symbol}
          initialSide={target.side}
          onClose={() => setTarget(null)}
        />
      )}
    </QuickTradeContext.Provider>
  );
}
