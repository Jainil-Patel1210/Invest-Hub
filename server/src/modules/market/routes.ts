import { Router } from "express";
import { pricingProvider } from "../../lib/pricing";
import { requireAuth } from "../../middleware/requireAuth";
import { validateQuery } from "../../middleware/validate";
import { moversQuerySchema } from "./schema";
import { getMovers } from "./service";

const router = Router();

router.get("/movers", requireAuth, validateQuery(moversQuerySchema), async (req, res) => {
  const { limit } = res.locals.query as { limit: number };
  // requireAuth guarantees req.userId is set by the time this handler runs
  // (see auth/routes.ts's /me for the same pattern).
  const movers = await getMovers(req.userId!, limit);
  res.json(movers);
});

const INDICES = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^BSESN", name: "SENSEX" },
];

// Public market data, like the stock routes -- it isn't user-specific.
router.get("/indices", async (_req, res) => {
  const quotes = await pricingProvider.getIndexQuotes(INDICES.map((i) => i.symbol));
  const bySymbol = new Map(quotes.map((q) => [q.symbol, q]));

  res.json({
    indices: INDICES.map((i) => ({ ...i, quote: bySymbol.get(i.symbol) ?? null })),
  });
});

export default router;
