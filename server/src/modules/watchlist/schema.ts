import { z } from "zod";

export const watchlistNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});

export const addStockSchema = z.object({
  symbol: z.string().trim().min(1, "Symbol is required"),
});
