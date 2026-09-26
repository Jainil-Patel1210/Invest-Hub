import { Router } from "express";
import { getIntParam, getParam } from "../../lib/httpParams";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import { addStockSchema, watchlistNameSchema } from "./schema";
import * as service from "./service";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const watchlists = await service.listWatchlists(req.userId!);
  res.json({ watchlists });
});

router.post("/", validateBody(watchlistNameSchema), async (req, res) => {
  const watchlist = await service.createWatchlist(req.userId!, req.body.name);
  res.status(201).json(watchlist);
});

// Note on route ordering here, contrasted with portfolio/routes.ts: "/:id",
// "/:id/stocks", and "/:id/stocks/:symbol" don't need careful ordering
// relative to each other the way portfolio's "/summary" vs "/:symbol" did --
// those were both single-segment patterns competing for the same path
// shape. These three have different segment counts, so a given request path
// only ever matches one of them regardless of registration order.

router.get("/:id", async (req, res) => {
  const detail = await service.getWatchlistDetail(getIntParam(req, "id"), req.userId!);
  res.json(detail);
});

router.patch("/:id", validateBody(watchlistNameSchema), async (req, res) => {
  const watchlist = await service.renameWatchlist(
    getIntParam(req, "id"),
    req.userId!,
    req.body.name,
  );
  res.json(watchlist);
});

router.delete("/:id", async (req, res) => {
  await service.deleteWatchlist(getIntParam(req, "id"), req.userId!);
  res.status(204).send();
});

router.post("/:id/stocks", validateBody(addStockSchema), async (req, res) => {
  await service.addStock(getIntParam(req, "id"), req.userId!, req.body.symbol);
  res.status(201).json({ added: req.body.symbol });
});

router.delete("/:id/stocks/:symbol", async (req, res) => {
  await service.removeStock(getIntParam(req, "id"), req.userId!, getParam(req, "symbol"));
  res.status(204).send();
});

export default router;
