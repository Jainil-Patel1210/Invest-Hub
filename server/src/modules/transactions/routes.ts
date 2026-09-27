import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validateQuery } from "../../middleware/validate";
import { findAllTransactions, findTransactions, PAGE_SIZE, summarizeTransactions } from "./repo";
import { transactionsQuerySchema, type TransactionsQuery } from "./schema";
import { toCsv } from "./csv";
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

// Totals over everything matching the filters, for the summary tiles. The
// page and page size are irrelevant to a total, so page is dropped.
router.get("/summary", validateQuery(transactionsQuerySchema), async (req, res) => {
  const filters = res.locals.query as TransactionsQuery; // page is ignored by summarizeTransactions
  res.json(await summarizeTransactions(req.userId!, filters));
});

// CSV download of every matching trade (up to a cap), same filters as the list.
router.get("/export", validateQuery(transactionsQuerySchema), async (req, res) => {
  const filters = res.locals.query as TransactionsQuery; // page is ignored by findAllTransactions
  const rows = await findAllTransactions(req.userId!, filters);

  res
    .type("text/csv")
    .set("Content-Disposition", 'attachment; filename="investhub-transactions.csv"')
    .send(toCsv(rows.map(mapTransaction)));
});

export default router;
