import { useContext } from "react";
import { QuickTradeContext } from "./quickTradeContext";

export function useQuickTrade() {
  const ctx = useContext(QuickTradeContext);
  if (!ctx) throw new Error("useQuickTrade must be used inside <QuickTradeProvider>");
  return ctx;
}
