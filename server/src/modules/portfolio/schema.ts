import { z } from "zod";

export const performanceQuerySchema = z.object({
  range: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).default("6M"),
});
