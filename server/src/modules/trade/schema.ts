import { z } from "zod";

export const tradeSchema = z.object({
  symbol: z.string().trim().min(1, "Symbol is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  // Omitted -> trade at the current live quote. Provided -> a manual or
  // backdated entry (e.g. logging a trade made in the past at its real price).
  price: z.number().positive().optional(),
  executedAt: z.coerce.date().optional(),
});

export type TradeInput = z.infer<typeof tradeSchema>;
