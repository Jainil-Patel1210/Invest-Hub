import { useEffect, useState } from "react";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const OPEN_MINUTE = 9 * 60 + 15; // 09:15 IST
const CLOSE_MINUTE = 15 * 60 + 30; // 15:30 IST

/**
 * Whether NSE/BSE are in their regular session: Monday-Friday, 09:15-15:30 IST.
 * Exchange holidays aren't modelled (that needs a maintained calendar), so on
 * a weekday holiday this reports "open" -- the indicator is a hint, not a
 * trading gate: the app never blocks a paper trade based on it.
 */
export function isMarketOpen(now: Date = new Date()): boolean {
  // Shift to IST, then read the *UTC* fields of the shifted date -- that gives
  // IST wall-clock time regardless of the viewer's own timezone.
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const day = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return minutes >= OPEN_MINUTE && minutes < CLOSE_MINUTE;
}

/** Re-evaluates once a minute so the sidebar indicator flips at 09:15 / 15:30 without a reload. */
export function useMarketOpen(): boolean {
  const [open, setOpen] = useState(() => isMarketOpen());
  useEffect(() => {
    const id = setInterval(() => setOpen(isMarketOpen()), 60_000);
    return () => clearInterval(id);
  }, []);
  return open;
}
