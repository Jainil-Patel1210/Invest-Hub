import { z } from "zod";

export const transactionsQuerySchema = z.object({
  symbol: z.string().trim().min(1).optional(),
  type: z.enum(["BUY", "SELL"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
