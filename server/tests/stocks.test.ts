import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";

// These hit the real Yahoo Finance API through the real cache -- no mocking
// layer, consistent with how the whole pricing layer was built and verified
// through Phase 1. TCS.NS is used throughout as a known-real, known-liquid
// symbol that isn't going anywhere.
describe("stocks", () => {
  it("searches for a real company by name", async () => {
    const res = await request(app).get("/api/stocks/search").query({ q: "Infosys" });

    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results.some((r: { symbol: string }) => r.symbol === "INFY.NS")).toBe(true);
  });

  it("rejects a search with no query", async () => {
    const res = await request(app).get("/api/stocks/search");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns fundamentals for a real symbol", async () => {
    const res = await request(app).get("/api/stocks/TCS.NS");

    expect(res.status).toBe(200);
    expect(res.body.symbol).toBe("TCS.NS");
    expect(res.body.exchange).toBe("NSE");
    expect(res.body.companyName).toMatch(/Tata Consultancy/i);
  });

  it("returns 404 SYMBOL_NOT_FOUND for a symbol that doesn't exist", async () => {
    const res = await request(app).get("/api/stocks/TOTALLYFAKESYMBOL123.NS");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SYMBOL_NOT_FOUND");
  });

  it("returns a live quote", async () => {
    const res = await request(app).get("/api/stocks/TCS.NS/quote");

    expect(res.status).toBe(200);
    expect(res.body.symbol).toBe("TCS.NS");
    expect(res.body.price).toBeGreaterThan(0);
    expect(typeof res.body.dayChangePct).toBe("number");
  });

  it("returns candle history for the default range", async () => {
    const res = await request(app).get("/api/stocks/TCS.NS/history");

    expect(res.status).toBe(200);
    expect(res.body.range).toBe("3M");
    expect(Array.isArray(res.body.candles)).toBe(true);
    expect(res.body.candles.length).toBeGreaterThan(0);
    expect(res.body.candles[0]).toHaveProperty("open");
    expect(res.body.candles[0]).toHaveProperty("close");
  });

  it("rejects an invalid history range", async () => {
    const res = await request(app).get("/api/stocks/TCS.NS/history").query({ range: "99Y" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
