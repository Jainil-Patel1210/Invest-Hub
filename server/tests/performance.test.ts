import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/db/pool";

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

// Real Yahoo history and a real database, like every other suite here. The
// trades are back-dated so there is an actual multi-week curve to compute.
describe("portfolio performance & metrics", () => {
  const email = `perf-test-${Date.now()}@example.com`;
  let accessToken: string;
  let userId: number;

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  beforeAll(async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123", fullName: "Perf Test" });
    accessToken = reg.body.accessToken;
    userId = reg.body.user.id;

    // Buy 10 @ 2000 sixty days ago, sell 4 @ 2100 thirty days ago.
    const buy = await request(app)
      .post("/api/trade/buy")
      .set(auth())
      .send({ symbol: "TCS.NS", quantity: 10, price: 2000, executedAt: daysAgoIso(60) });
    expect(buy.status).toBe(201);

    const sell = await request(app)
      .post("/api/trade/sell")
      .set(auth())
      .send({ symbol: "TCS.NS", quantity: 4, price: 2100, executedAt: daysAgoIso(30) });
    expect(sell.status).toBe(201);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  });

  it("reports realized P&L, fees, and best/worst performer in the summary", async () => {
    const res = await request(app).get("/api/portfolio/summary").set(auth());

    expect(res.status).toBe(200);
    // (2100 - 2000) * 4 shares, before charges.
    expect(res.body.realizedPnl).toBe(400);
    // Two trades at the flat fee.
    expect(res.body.feesPaid).toBe(40);
    expect(res.body.bestPerformer.symbol).toBe("TCS.NS");
    expect(res.body.worstPerformer.symbol).toBe("TCS.NS");
  });

  it("computes an annualized XIRR once the holding period is long enough", async () => {
    const res = await request(app).get("/api/portfolio/summary").set(auth());

    expect(res.body.xirrPct).not.toBeNull();
    expect(Number.isFinite(res.body.xirrPct)).toBe(true);
  });

  it("builds a multi-week net worth curve with a NIFTY 50 benchmark on the same base", async () => {
    const res = await request(app)
      .get("/api/portfolio/performance")
      .query({ range: "3M" })
      .set(auth());

    expect(res.status).toBe(200);
    const { series } = res.body as {
      series: Array<{ date: string; netWorth: number; benchmark: number | null }>;
    };

    expect(series.length).toBeGreaterThan(15);
    // Dates ascend, and the curve starts on the first trade's day, not before it.
    expect(series.map((p) => p.date)).toEqual([...series.map((p) => p.date)].sort());
    // Nothing invested yet on day one beyond the trade itself: net worth stays near the 10L start.
    expect(series[0]!.netWorth).toBeGreaterThan(990_000);
    expect(series[0]!.netWorth).toBeLessThan(1_010_000);
    // The benchmark is rebased to the same starting value.
    expect(series.every((p) => p.benchmark !== null)).toBe(true);
    expect(series[0]!.benchmark).toBeCloseTo(series[0]!.netWorth, 2);
    expect(res.body.changePct).toEqual(expect.any(Number));
    expect(res.body.benchmarkChangePct).toEqual(expect.any(Number));
  });

  it("returns an empty curve for a user with no trades", async () => {
    const other = await request(app)
      .post("/api/auth/register")
      .send({
        email: `perf-empty-${Date.now()}@example.com`,
        password: "password123",
        fullName: "Empty",
      });

    const res = await request(app)
      .get("/api/portfolio/performance")
      .set({ Authorization: `Bearer ${other.body.accessToken}` });

    expect(res.status).toBe(200);
    expect(res.body.series).toEqual([]);
    expect(res.body.changePct).toBeNull();

    await pool.query("DELETE FROM users WHERE id = $1", [other.body.user.id]);
  });

  it("rejects an unknown range", async () => {
    const res = await request(app)
      .get("/api/portfolio/performance")
      .query({ range: "10Y" })
      .set(auth());
    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/portfolio/performance");
    expect(res.status).toBe(401);
  });
});
