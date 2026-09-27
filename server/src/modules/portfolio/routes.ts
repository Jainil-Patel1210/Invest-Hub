import { Router } from "express";
import { getParam } from "../../lib/httpParams";
import { requireAuth } from "../../middleware/requireAuth";
import { validateQuery } from "../../middleware/validate";
import type { HistoryRange } from "../stocks/schema";
import { performanceQuerySchema } from "./schema";
import * as service from "./service";

const router = Router();
// Every route in this router is user-scoped, so requireAuth is applied once
// here rather than repeated per-route (contrast with stocks/routes.ts, where
// no route needs auth at all, and market/routes.ts, which currently has one
// route either way would be fine on).
router.use(requireAuth);

router.get("/", async (req, res) => {
  const holdings = await service.getEnrichedHoldings(req.userId!);
  res.json({ holdings });
});

// Registered *before* "/:symbol" -- Express matches routes strictly in
// registration order, not "most specific first". Reversed, a request to
// /api/portfolio/summary would match "/:symbol" instead, treating "summary"
// itself as a stock ticker.
router.get("/summary", async (req, res) => {
  const summary = await service.getSummary(req.userId!);
  res.json(summary);
});

router.get("/performance", validateQuery(performanceQuerySchema), async (req, res) => {
  const { range } = res.locals.query as { range: HistoryRange };
  const performance = await service.getPerformance(req.userId!, range);
  res.json(performance);
});

router.get("/:symbol", async (req, res) => {
  const detail = await service.getHoldingDetail(req.userId!, getParam(req, "symbol"));
  res.json(detail);
});

export default router;
