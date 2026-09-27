import { Router } from "express";
import { getParam } from "../../lib/httpParams";
import { pricingProvider } from "../../lib/pricing";
import { validateQuery } from "../../middleware/validate";
import {
  catalogQuerySchema,
  historyQuerySchema,
  searchQuerySchema,
  type HistoryRange,
} from "./schema";
import { getCatalog, rangeToDates } from "./service";

const router = Router();

// Browse view: the tracked catalog with live quotes. Registered before
// "/:symbol" so it isn't captured by it (same ordering rule as /search).
router.get("/", validateQuery(catalogQuerySchema), async (_req, res) => {
  const { limit } = res.locals.query as { limit: number };
  const stocks = await getCatalog(limit);
  res.json({ stocks });
});

router.get("/search", validateQuery(searchQuerySchema), async (_req, res) => {
  // `as` cast, not a type-check: res.locals is typed as `Record<string, any>`
  // by Express itself, since it's a general-purpose bag with no fixed shape
  // across the whole app. This is the one place per route that trusts
  // validateQuery already ran and produced this exact shape.
  const { q } = res.locals.query as { q: string };
  const results = await pricingProvider.search(q);
  res.json({ results });
});

router.get("/:symbol", async (req, res) => {
  const fundamentals = await pricingProvider.getFundamentals(getParam(req, "symbol"));
  res.json(fundamentals);
});

router.get("/:symbol/quote", async (req, res) => {
  const quote = await pricingProvider.getQuote(getParam(req, "symbol"));
  res.json(quote);
});

router.get("/:symbol/history", validateQuery(historyQuerySchema), async (req, res) => {
  const { range } = res.locals.query as { range: HistoryRange };
  const { from, to } = rangeToDates(range);
  const candles = await pricingProvider.getHistory(getParam(req, "symbol"), from, to);
  res.json({ range, from, to, candles });
});

export default router;
