import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/db/pool";

describe("watchlist", () => {
  const emailA = `watchlist-a-${Date.now()}@example.com`;
  const emailB = `watchlist-b-${Date.now()}@example.com`;
  let tokenA: string;
  let tokenB: string;
  let userIdA: number;
  let userIdB: number;
  let watchlistId: number;

  beforeAll(async () => {
    const a = await request(app)
      .post("/api/auth/register")
      .send({ email: emailA, password: "password123", fullName: "Watchlist A" });
    tokenA = a.body.accessToken;
    userIdA = a.body.user.id;

    const b = await request(app)
      .post("/api/auth/register")
      .send({ email: emailB, password: "password123", fullName: "Watchlist B" });
    tokenB = b.body.accessToken;
    userIdB = b.body.user.id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [[userIdA, userIdB]]);
    await pool.end();
  });

  function authA(req: request.Test) {
    return req.set("Authorization", `Bearer ${tokenA}`);
  }
  function authB(req: request.Test) {
    return req.set("Authorization", `Bearer ${tokenB}`);
  }

  it("starts with no watchlists", async () => {
    const res = await authA(request(app).get("/api/watchlists"));
    expect(res.status).toBe(200);
    expect(res.body.watchlists).toEqual([]);
  });

  it("creates a watchlist", async () => {
    const res = await authA(request(app).post("/api/watchlists").send({ name: "Tech Stocks" }));

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Tech Stocks");
    watchlistId = res.body.id;
  });

  it("rejects a duplicate name for the same user with 409", async () => {
    const res = await authA(request(app).post("/api/watchlists").send({ name: "Tech Stocks" }));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("WATCHLIST_NAME_TAKEN");
  });

  it("allows a different user to use the same name", async () => {
    const res = await authB(request(app).post("/api/watchlists").send({ name: "Tech Stocks" }));
    expect(res.status).toBe(201);
    // Clean up immediately -- this one exists only to prove the point above.
    await authB(request(app).delete(`/api/watchlists/${res.body.id}`));
  });

  it("rejects an empty name with 400 VALIDATION_ERROR", async () => {
    const res = await authA(request(app).post("/api/watchlists").send({ name: "" }));
    expect(res.status).toBe(400);
  });

  it("adds a real stock to the watchlist", async () => {
    const res = await authA(
      request(app).post(`/api/watchlists/${watchlistId}/stocks`).send({ symbol: "TCS.NS" }),
    );
    expect(res.status).toBe(201);
  });

  it("returns 404 SYMBOL_NOT_FOUND when adding a symbol that doesn't exist", async () => {
    const res = await authA(
      request(app)
        .post(`/api/watchlists/${watchlistId}/stocks`)
        .send({ symbol: "TOTALLYFAKE123.NS" }),
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SYMBOL_NOT_FOUND");
  });

  it("shows the added stock with a live quote in the watchlist detail", async () => {
    const res = await authA(request(app).get(`/api/watchlists/${watchlistId}`));

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].symbol).toBe("TCS.NS");
    expect(res.body.items[0].quote).not.toBeNull();
    expect(res.body.items[0].quote.price).toBeGreaterThan(0);
  });

  it("adding the same stock again is a no-op, not a duplicate or an error", async () => {
    const res = await authA(
      request(app).post(`/api/watchlists/${watchlistId}/stocks`).send({ symbol: "TCS.NS" }),
    );
    expect(res.status).toBe(201);

    const detail = await authA(request(app).get(`/api/watchlists/${watchlistId}`));
    expect(detail.body.items).toHaveLength(1);
  });

  describe("ownership isolation", () => {
    it("returns 404 (not 403) when another user tries to view this watchlist", async () => {
      const res = await authB(request(app).get(`/api/watchlists/${watchlistId}`));
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("returns 404 when another user tries to rename this watchlist", async () => {
      const res = await authB(
        request(app).patch(`/api/watchlists/${watchlistId}`).send({ name: "Hijacked" }),
      );
      expect(res.status).toBe(404);
    });

    it("returns 404 when another user tries to delete this watchlist", async () => {
      const res = await authB(request(app).delete(`/api/watchlists/${watchlistId}`));
      expect(res.status).toBe(404);
    });

    it("the watchlist is untouched by all of the above", async () => {
      const res = await authA(request(app).get(`/api/watchlists/${watchlistId}`));
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Tech Stocks");
      expect(res.body.items).toHaveLength(1);
    });
  });

  it("renames the watchlist (as its actual owner)", async () => {
    const res = await authA(
      request(app).patch(`/api/watchlists/${watchlistId}`).send({ name: "Renamed" }),
    );
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Renamed");
  });

  it("removes a stock, which is idempotent (204 even if called twice)", async () => {
    const first = await authA(request(app).delete(`/api/watchlists/${watchlistId}/stocks/TCS.NS`));
    expect(first.status).toBe(204);

    const second = await authA(request(app).delete(`/api/watchlists/${watchlistId}/stocks/TCS.NS`));
    expect(second.status).toBe(204);

    const detail = await authA(request(app).get(`/api/watchlists/${watchlistId}`));
    expect(detail.body.items).toEqual([]);
  });

  it("deletes the watchlist, then 404s on the second delete (unlike removing a stock, the resource is actually gone)", async () => {
    const first = await authA(request(app).delete(`/api/watchlists/${watchlistId}`));
    expect(first.status).toBe(204);

    const second = await authA(request(app).delete(`/api/watchlists/${watchlistId}`));
    expect(second.status).toBe(404);
  });
});
