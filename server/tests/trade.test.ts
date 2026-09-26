import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/db/pool";

describe("trade", () => {
  let accessToken: string;
  let userId: number;
  let emailCounter = 0;

  // beforeEach in each nested describe below calls this before *every*
  // test, so each needs its own fresh, unique email -- a single shared
  // email would make every registration after the first fail with
  // EMAIL_TAKEN.
  async function register() {
    const email = `trade-test-${Date.now()}-${emailCounter++}@example.com`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123", fullName: "Trade Test" });
    accessToken = res.body.accessToken;
    userId = res.body.user.id;
  }

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email LIKE 'trade-test-%@example.com'", []);
    await pool.end();
  });

  function auth(req: request.Test) {
    return req.set("Authorization", `Bearer ${accessToken}`);
  }

  async function balance(): Promise<number> {
    const { rows } = await pool.query<{ account_balance: string }>(
      "SELECT account_balance FROM users WHERE id = $1",
      [userId],
    );
    return Number(rows[0]!.account_balance);
  }

  describe("buy", () => {
    beforeEach(register);

    it("rejects with no auth", async () => {
      const res = await request(app)
        .post("/api/trade/buy")
        .send({ symbol: "TCS.NS", quantity: 1, price: 2000 });
      expect(res.status).toBe(401);
    });

    it("buys at a manual price, creates a holding, and debits the balance exactly", async () => {
      const startBalance = await balance();

      const res = await auth(
        request(app).post("/api/trade/buy").send({ symbol: "TCS.NS", quantity: 10, price: 2000 }),
      );

      expect(res.status).toBe(201);
      expect(res.body.transaction).toMatchObject({
        symbol: "TCS.NS",
        type: "BUY",
        quantity: 10,
        price: 2000,
        fee: 20,
        total: 20020,
      });

      expect(await balance()).toBe(startBalance - 20020);

      const holding = await auth(request(app).get("/api/portfolio/TCS.NS"));
      expect(holding.body.holding.quantity).toBe(10);
      expect(holding.body.holding.avgBuyPrice).toBe(2000);
    });

    it("computes a correct weighted-average cost basis across two buys", async () => {
      await auth(
        request(app).post("/api/trade/buy").send({ symbol: "TCS.NS", quantity: 10, price: 2000 }),
      );
      await auth(
        request(app).post("/api/trade/buy").send({ symbol: "TCS.NS", quantity: 10, price: 2400 }),
      );

      const res = await auth(request(app).get("/api/portfolio/TCS.NS"));
      // (10*2000 + 10*2400) / 20 = 2200, exactly
      expect(res.body.holding.avgBuyPrice).toBe(2200);
      expect(res.body.holding.quantity).toBe(20);
    });

    it("rejects an unaffordable trade with 422 and leaves absolutely no trace (rollback)", async () => {
      const startBalance = await balance();

      const res = await auth(
        request(app)
          .post("/api/trade/buy")
          .send({ symbol: "TCS.NS", quantity: 1, price: 5_000_000 }),
      );

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("INSUFFICIENT_FUNDS");
      expect(await balance()).toBe(startBalance);

      const { rows } = await pool.query("SELECT count(*) FROM transactions WHERE user_id = $1", [
        userId,
      ]);
      expect(rows[0].count).toBe("0");
    });

    it("returns 404 SYMBOL_NOT_FOUND for a symbol that doesn't exist, without touching the balance", async () => {
      const startBalance = await balance();

      const res = await auth(
        request(app).post("/api/trade/buy").send({ symbol: "TOTALLYFAKE123.NS", quantity: 1 }),
      );

      expect(res.status).toBe(404);
      expect(await balance()).toBe(startBalance);
    });

    it("resolves the live quote when no price is given", async () => {
      const res = await auth(
        request(app).post("/api/trade/buy").send({ symbol: "TCS.NS", quantity: 1 }),
      );
      expect(res.status).toBe(201);
      expect(res.body.transaction.price).toBeGreaterThan(0);
    });

    /**
     * The flagship test the trade engine exists to satisfy: two genuinely
     * concurrent requests, each individually affordable, that together
     * exceed the balance. Fired via Promise.all (not sequential awaits) so
     * they really do race at the database level, not just in appearance.
     * This is a regression test for the atomic conditional UPDATE in
     * trade/repo.ts's debitBalanceIfSufficient -- if that were ever changed
     * back to a naive SELECT-then-UPDATE without a WHERE guard, this test
     * would start failing (or worse, the balance would go negative).
     */
    it("under real concurrency, exactly one of two individually-affordable-but-jointly-unaffordable buys succeeds", async () => {
      const startBalance = await balance(); // 1,000,000 by default
      const costEach = 600_020; // 600,000/share + 20 fee -- two of these exceed 1,000,000

      const [a, b] = await Promise.all([
        auth(
          request(app)
            .post("/api/trade/buy")
            .send({ symbol: "TCS.NS", quantity: 1, price: 600_000 }),
        ),
        auth(
          request(app)
            .post("/api/trade/buy")
            .send({ symbol: "TCS.NS", quantity: 1, price: 600_000 }),
        ),
      ]);

      const statuses = [a.status, b.status].sort();
      expect(statuses).toEqual([201, 422]);

      const failed = a.status === 422 ? a : b;
      expect(failed.body.error.code).toBe("INSUFFICIENT_FUNDS");

      // Not negative, not double-debited, not zero-debited -- exactly one
      // trade's worth of debit and no more.
      expect(await balance()).toBe(startBalance - costEach);

      const { rows } = await pool.query("SELECT count(*) FROM transactions WHERE user_id = $1", [
        userId,
      ]);
      expect(rows[0].count).toBe("1");
    });
  });

  describe("sell", () => {
    beforeEach(async () => {
      await register();
      await auth(
        request(app).post("/api/trade/buy").send({ symbol: "TCS.NS", quantity: 15, price: 2200 }),
      );
    });

    it("sells a partial quantity without changing the average cost basis", async () => {
      const res = await auth(
        request(app).post("/api/trade/sell").send({ symbol: "TCS.NS", quantity: 5, price: 2500 }),
      );
      expect(res.status).toBe(201);

      const holding = await auth(request(app).get("/api/portfolio/TCS.NS"));
      expect(holding.body.holding.quantity).toBe(10);
      expect(holding.body.holding.avgBuyPrice).toBe(2200); // unchanged by a sell
    });

    /**
     * Regression test for a real bug found during development: selling the
     * *entire* remaining position in one trade used to throw a raw 500,
     * because the naive UPDATE tried to write quantity = 0, which violates
     * portfolio_holdings' CHECK (quantity > 0) constraint -- Postgres
     * enforces that immediately, per row, not at commit time. Fixed with a
     * writable CTE in trade/repo.ts's sellFromHolding that routes a
     * full-close sale to DELETE instead of UPDATE. This test exists so that
     * fix can never silently regress.
     */
    it("selling the entire remaining position closes it cleanly instead of erroring", async () => {
      const res = await auth(
        request(app).post("/api/trade/sell").send({ symbol: "TCS.NS", quantity: 15, price: 2500 }),
      );
      expect(res.status).toBe(201);

      const holding = await auth(request(app).get("/api/portfolio/TCS.NS"));
      expect(holding.status).toBe(404);

      const { rows } = await pool.query(
        "SELECT * FROM portfolio_holdings WHERE user_id = $1 AND symbol = 'TCS.NS'",
        [userId],
      );
      expect(rows).toHaveLength(0);
    });

    it("rejects selling more than is held with 422 INSUFFICIENT_HOLDINGS", async () => {
      const res = await auth(
        request(app).post("/api/trade/sell").send({ symbol: "TCS.NS", quantity: 999, price: 2500 }),
      );
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("INSUFFICIENT_HOLDINGS");
    });

    it("rejects selling a symbol that was never held", async () => {
      const res = await auth(
        request(app).post("/api/trade/sell").send({ symbol: "INFY.NS", quantity: 1, price: 1500 }),
      );
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("INSUFFICIENT_HOLDINGS");
    });

    it("cleanly closing then re-selling again both fail the same way, not a 500 the second time", async () => {
      await auth(
        request(app).post("/api/trade/sell").send({ symbol: "TCS.NS", quantity: 15, price: 2500 }),
      );

      const res = await auth(
        request(app).post("/api/trade/sell").send({ symbol: "TCS.NS", quantity: 1, price: 2500 }),
      );
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("INSUFFICIENT_HOLDINGS");
    });
  });

  describe("GET /api/transactions", () => {
    beforeEach(async () => {
      await register();
      await auth(
        request(app).post("/api/trade/buy").send({ symbol: "TCS.NS", quantity: 5, price: 2000 }),
      );
      await auth(
        request(app).post("/api/trade/buy").send({ symbol: "INFY.NS", quantity: 3, price: 1500 }),
      );
      await auth(
        request(app).post("/api/trade/sell").send({ symbol: "TCS.NS", quantity: 2, price: 2100 }),
      );
    });

    it("lists all of this user's transactions, newest first", async () => {
      const res = await auth(request(app).get("/api/transactions"));
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.transactions[0].type).toBe("SELL"); // most recent
    });

    it("filters by symbol", async () => {
      const res = await auth(request(app).get("/api/transactions").query({ symbol: "TCS.NS" }));
      expect(res.body.total).toBe(2);
      expect(res.body.transactions.every((t: { symbol: string }) => t.symbol === "TCS.NS")).toBe(
        true,
      );
    });

    it("filters by type", async () => {
      const res = await auth(request(app).get("/api/transactions").query({ type: "SELL" }));
      expect(res.body.total).toBe(1);
      expect(res.body.transactions[0].type).toBe("SELL");
    });

    it("paginates past the end cleanly", async () => {
      const res = await auth(request(app).get("/api/transactions").query({ page: 2 }));
      expect(res.body.transactions).toEqual([]);
      expect(res.body.total).toBe(3);
    });
  });
});
