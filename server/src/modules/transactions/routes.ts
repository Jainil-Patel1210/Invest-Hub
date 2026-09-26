import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validateQuery } from "../../middleware/validate";
import { findTransactions, PAGE_SIZE } from "./repo";
import { transactionsQuerySchema, type TransactionsQuery } from "./schema";
import { mapTransaction } from "./types";

const router = Router();
router.use(requireAuth);

router.get("/", validateQuery(transactionsQuerySchema), async (req, res) => {
  const query = res.locals.query as TransactionsQuery;
  const { rows, total } = await findTransactions(req.userId!, query);

  res.json({
    transactions: rows.map(mapTransaction),
    page: query.page,
    pageSize: PAGE_SIZE,
    total,
  });
});

export default router;
