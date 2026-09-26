import { Router } from "express";
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

export default router;
