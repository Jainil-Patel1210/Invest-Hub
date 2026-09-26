import { Router, type Request } from "express";
import { Errors } from "../../lib/errors";
import { pricingProvider } from "../../lib/pricing";
import { validateQuery } from "../../middleware/validate";
import { historyQuerySchema, searchQuerySchema, type HistoryRange } from "./schema";
import { rangeToDates } from "./service";

/**
 * Express 5's type inference for a route param (":symbol") turns out to
 * depend on how many handler functions a route passes: a route with a
 * single handler infers `req.params.symbol` as a precise `string`, but one
 * with a middleware in front of the handler (as three of these four routes
 * have, via validateQuery) widens it to `string | string[] | undefined`.
 * Rather than have some routes trust that inference and others need an `as`
 * cast, every route here goes through this one helper -- at runtime, a plain
 * named path segment (not a wildcard) is always a single string when
 * present, so this just makes that real guarantee explicit instead of
 * depending on inconsistent inference.
 */
function getSymbolParam(req: Request): string {
  const symbol = req.params.symbol;
  if (typeof symbol !== "string") {
    throw Errors.notFound("Stock");
  }
  return symbol;
}

const router = Router();

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
  const fundamentals = await pricingProvider.getFundamentals(getSymbolParam(req));
  res.json(fundamentals);
});

router.get("/:symbol/quote", async (req, res) => {
  const quote = await pricingProvider.getQuote(getSymbolParam(req));
  res.json(quote);
});

router.get("/:symbol/history", validateQuery(historyQuerySchema), async (req, res) => {
  const { range } = res.locals.query as { range: HistoryRange };
  const { from, to } = rangeToDates(range);
  const candles = await pricingProvider.getHistory(getSymbolParam(req), from, to);
  res.json({ range, from, to, candles });
});

export default router;
