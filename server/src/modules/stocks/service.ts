import { addDaysIso } from "../../lib/pricing/dateUtils";
import type { HistoryRange } from "./schema";

const RANGE_TO_DAYS: Record<Exclude<HistoryRange, "ALL">, number> = {
  "1M": 30,
  "3M": 90,
  "6M": 182,
  "1Y": 365,
  "5Y": 365 * 5,
};

// "ALL" is capped at 10 years, not literal full company history. Yahoo
// genuinely has decades of daily data for a company like TCS -- fetching all
// of it on a single first request is a lot of latency and rows for a
// portfolio tracker's chart to justify. This is a deliberate scope decision,
// not a technical limitation of the caching layer underneath it.
const ALL_RANGE_DAYS = 365 * 10;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Converts a UI range like "1Y" into a concrete [from, to] ISO date pair, `to` being today. */
export function rangeToDates(range: HistoryRange): { from: string; to: string } {
  const to = todayIso();
  const days = range === "ALL" ? ALL_RANGE_DAYS : RANGE_TO_DAYS[range];
  return { from: addDaysIso(to, -days), to };
}
