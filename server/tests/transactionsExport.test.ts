import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/db/pool";
import { toCsv } from "../src/modules/transactions/csv";

describe("toCsv", () => {
  const base = {
    id: 1,
    type: "BUY" as const,
    quantity: 2,
    price: 100,
    fee: 20,
    total: 220,
    executedAt: new Date("2025-01-02T03:04:05.000Z"),
  };

  it("writes a header and one CRLF-terminated row per trade", () => {
    const csv = toCsv([{ ...base, symbol: "TCS.NS" }]);
    expect(csv).toBe(
      "Date,Symbol,Type,Quantity,Price,Fee,Total\r\n2025-01-02T03:04:05.000Z,TCS.NS,BUY,2,100.00,20.00,220.00\r\n",
    );
  });

  it("quotes fields containing commas and doubles embedded quotes", () => {
    const csv = toCsv([{ ...base, symbol: 'A,"B"' }]);
    expect(csv).toContain('"A,""B"""');
  });

  it("neutralizes spreadsheet formula injection in text fields", () => {
    const csv = toCsv([{ ...base, symbol: "=HYPERLINK(1)" }]);
    expect(csv).toContain("'=HYPERLINK(1)");
    expect(csv).not.toContain(",=HYPERLINK");
  });
});

describe("transactions summary & export", () => {
  const email = `tx-export-${Date.now()}@example.com`;
  let accessToken: string;
  let userId: number;
  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  beforeAll(async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123", fullName: "Export Test" });
    accessToken = reg.body.accessToken;
    userId = reg.body.user.id;

    await request(app)
      .post("/api/trade/buy")
      .set(auth())
      .send({ symbol: "TCS.NS", quantity: 10, price: 2000 });
    await request(app)
      .post("/api/trade/sell")
      .set(auth())
      .send({ symbol: "TCS.NS", quantity: 4, price: 2100 });
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  });

  it("summarizes turnover, fees and counts", async () => {
    const res = await request(app).get("/api/transactions/summary").set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      count: 2,
      buyCount: 1,
      sellCount: 1,
      turnover: 10 * 2000 + 4 * 2100,
      feesPaid: 40,
    });
  });

  it("applies the same filters to the summary as to the list", async () => {
    const res = await request(app)
      .get("/api/transactions/summary")
      .query({ type: "SELL" })
      .set(auth());

    expect(res.body.count).toBe(1);
    expect(res.body.turnover).toBe(4 * 2100);
  });

  it("exports matching trades as a CSV attachment", async () => {
    const res = await request(app).get("/api/transactions/export").set(auth());

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.headers["content-disposition"]).toContain("attachment");
    const lines = res.text.trim().split("\r\n");
    expect(lines[0]).toBe("Date,Symbol,Type,Quantity,Price,Fee,Total");
    expect(lines).toHaveLength(3); // header + 2 trades
  });

  it("requires authentication for both", async () => {
    expect((await request(app).get("/api/transactions/summary")).status).toBe(401);
    expect((await request(app).get("/api/transactions/export")).status).toBe(401);
  });
});
