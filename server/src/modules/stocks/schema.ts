import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
});

export const HISTORY_RANGES = ["1M", "3M", "6M", "1Y", "5Y", "ALL"] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];

export const historyQuerySchema = z.object({
  range: z.enum(HISTORY_RANGES).default("3M"),
});
