import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import { tradeSchema } from "./schema";
import * as service from "./service";

const router = Router();
router.use(requireAuth);

router.post("/buy", validateBody(tradeSchema), async (req, res) => {
  const transaction = await service.buy(req.userId!, req.body);
  res.status(201).json({ transaction });
});

router.post("/sell", validateBody(tradeSchema), async (req, res) => {
  const transaction = await service.sell(req.userId!, req.body);
  res.status(201).json({ transaction });
});

export default router;
