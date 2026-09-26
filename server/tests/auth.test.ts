import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/db/pool";

// These tests run against the real dev Postgres instance rather than an
// isolated test database -- a deliberate scope simplification for a project
// this size, not an oversight. It's made safe by using a unique email per
// test run (so the UNIQUE constraint never collides with previous runs or a
// developer's own manually-created accounts) and cleaning up in afterAll.
// A more rigorous setup would point a separate TEST_DATABASE_URL at its own
// database so tests can never affect real data even in principle.
const email = `test-${Date.now()}@example.com`;
const password = "password123";

describe("auth", () => {
  let refreshCookie: string;

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
    await pool.end();
  });

  it("registers a new user and sets a refresh cookie", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password, fullName: "Test User" });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email, fullName: "Test User" });
    expect(res.body.accessToken).toBeTypeOf("string");
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^refreshToken=/);
  });

  it("rejects a duplicate email with 409 EMAIL_TAKEN", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password, fullName: "Test User" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("rejects an invalid email with 400 VALIDATION_ERROR", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password, fullName: "Someone" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.fieldErrors.email).toBeDefined();
  });

  it("rejects too-short a password with 400 VALIDATION_ERROR", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "someone-else@example.com", password: "short", fullName: "Someone" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.fieldErrors.password).toBeDefined();
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf("string");

    const cookie = res.headers["set-cookie"]?.find((c: string) => c.startsWith("refreshToken="));
    expect(cookie).toBeDefined();
    refreshCookie = cookie as string;
  });

  it("rejects the wrong password with 401 INVALID_CREDENTIALS", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a login for an email that was never registered, with the same error", async () => {
    // Same assertion as the wrong-password case above -- proving the API
    // genuinely can't be used to enumerate which emails exist.
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody-here@example.com", password: "whatever123" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns the profile for a valid access token", async () => {
    const login = await request(app).post("/api/auth/login").send({ email, password });
    const token = login.body.accessToken;

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
    expect(res.body.accountBalance).toBe(1000000);
  });

  it("rejects /me with no token at all", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects /me with a garbage token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer garbage.not.valid");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("refreshes using the refresh cookie and rotates it", async () => {
    const res = await request(app).post("/api/auth/refresh").set("Cookie", refreshCookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf("string");

    const newCookie = res.headers["set-cookie"]?.find((c: string) => c.startsWith("refreshToken="));
    expect(newCookie).toBeDefined();
    expect(newCookie).not.toBe(refreshCookie);
  });

  it("rejects reusing an already-rotated refresh token", async () => {
    // refreshCookie was deleted from the DB the moment the previous test
    // used it -- this proves rotation actually happened, not just that a
    // new token was issued alongside the old one still working.
    const res = await request(app).post("/api/auth/refresh").set("Cookie", refreshCookie);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("rejects /api/auth/refresh with no cookie at all", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
  });
});
