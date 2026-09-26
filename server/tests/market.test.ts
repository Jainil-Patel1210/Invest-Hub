import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/db/pool";

describe("market", () => {
  const email = `movers-test-${Date.now()}@example.com`;
  let accessToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123", fullName: "Movers Test" });
    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
    await pool.end();
  });

  it("rejects movers with no auth", async () => {
    const res = await request(app).get("/api/market/movers");
    expect(res.status).toBe(401);
  });

  it("returns empty gainers/losers for a brand new user with nothing tracked", async () => {
    const res = await request(app)
      .get("/api/market/movers")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ gainers: [], losers: [] });
  });
});
