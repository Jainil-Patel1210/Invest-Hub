import { createContext } from "react";

export type TradeSide = "BUY" | "SELL";

export interface QuickTradeContextValue {
  /** Opens the quick-order modal for a symbol from anywhere in the app. */
  openTrade: (symbol: string, side?: TradeSide) => void;
}

export const QuickTradeContext = createContext<QuickTradeContextValue | null>(null);
