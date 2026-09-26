import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/db/pool";

// Portfolio holdings are normally created by the trade engine (Phase 5,
// not yet built) -- these tests insert a holding and a transaction directly
// as fixtures, exactly the row shape Phase 5 will produce for real. This is
// deliberate: Phase 4 builds the read side of portfolio data, independent of
// how that data gets written.
describe("portfolio", () => {
  const email = `portfolio-test-${Date.now()}@example.com`;
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123", fullName: "Portfolio Test" });
    accessToken = res.body.accessToken;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    await pool.end();
  });

  function auth(req: request.Test) {
    return req.set("Authorization", `Bearer ${accessToken}`);
  }

  it("rejects portfolio routes with no auth", async () => {
    const res = await request(app).get("/api/portfolio");
    expect(res.status).toBe(401);
  });

  it("returns an empty portfolio and zeroed summary before any holdings exist", async () => {
    const holdings = await auth(request(app).get("/api/portfolio"));
    expect(holdings.status).toBe(200);
    expect(holdings.body.holdings).toEqual([]);

    const summary = await auth(request(app).get("/api/portfolio/summary"));
    expect(summary.status).toBe(200);
    expect(summary.body).toEqual({
      investedValue: 0,
      currentValue: 0,
      totalPnl: 0,
      totalPnlPct: 0,
      dayPnl: 0,
      sectorAllocation: [],
    });
  });

  it("returns 404 for a symbol with no holding", async () => {
    const res = await auth(request(app).get("/api/portfolio/TCS.NS"));
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  describe("with a real fixture holding", () => {
    beforeAll(async () => {
      await pool.query(
        "INSERT INTO portfolio_holdings (user_id, symbol, quantity, avg_buy_price) VALUES ($1, 'TCS.NS', 10, 2000.00)",
        [userId],
      );
      await pool.query(
        `INSERT INTO transactions (user_id, symbol, type, quantity, price, fee, total)
         VALUES ($1, 'TCS.NS', 'BUY', 10, 2000.00, 20.00, 20020.00)`,
        [userId],
      );
    });

    it("lists the holding with live P&L computed from the real quote", async () => {
      const res = await auth(request(app).get("/api/portfolio"));

      expect(res.status).toBe(200);
      expect(res.body.holdings).toHaveLength(1);

      const holding = res.body.holdings[0];
      expect(holding.symbol).toBe("TCS.NS");
      expect(holding.quantity).toBe(10);
      expect(holding.avgBuyPrice).toBe(2000);
      expect(holding.investedValue).toBe(20000);
      // currentPrice/currentValue/pnl are live and will move -- just assert
      // the math is internally consistent, not a specific price.
      expect(holding.currentValue).toBe(holding.quantity * holding.currentPrice);
      expect(holding.pnl).toBeCloseTo(holding.currentValue - holding.investedValue, 5);
    });

    it("reflects the same holding in the summary, with sector allocation", async () => {
      const res = await auth(request(app).get("/api/portfolio/summary"));

      expect(res.status).toBe(200);
      expect(res.body.investedValue).toBe(20000);
      expect(res.body.sectorAllocation).toHaveLength(1);
      expect(res.body.sectorAllocation[0].sector).toBe("Technology");
      expect(res.body.sectorAllocation[0].percentage).toBe(100);
    });

    it("returns the holding detail with its transaction history as real numbers, not NUMERIC strings", async () => {
      const res = await auth(request(app).get("/api/portfolio/TCS.NS"));

      expect(res.status).toBe(200);
      expect(res.body.holding.symbol).toBe("TCS.NS");
      expect(res.body.transactions).toHaveLength(1);

      const tx = res.body.transactions[0];
      expect(tx.type).toBe("BUY");
      expect(typeof tx.price).toBe("number");
      expect(typeof tx.fee).toBe("number");
      expect(typeof tx.total).toBe("number");
      expect(tx.total).toBe(20020);
    });
  });
});
