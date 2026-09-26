import { Router, type Response } from "express";
import { Errors } from "../../lib/errors";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import { loginSchema, registerSchema } from "./schema";
import * as authService from "./service";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
// Scoping the cookie's path to /api/auth means the browser only ever attaches
// it to auth requests -- it isn't sent along with every other API call the
// way a root-scoped cookie would be, which is more than this cookie needs.
const REFRESH_COOKIE_PATH = "/api/auth";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true, // never readable from JS -- the whole point of keeping it out of localStorage
    secure: process.env.NODE_ENV === "production", // HTTPS-only in prod; relaxed for local http:// dev
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: REFRESH_COOKIE_PATH,
  });
}

const router = Router();

router.post("/register", validateBody(registerSchema), async (req, res) => {
  const result = await authService.register(req.body);
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({ user: result.user, accessToken: result.accessToken });
});

router.post("/login", validateBody(loginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  setRefreshCookie(res, result.refreshToken);
  res.json({ user: result.user, accessToken: result.accessToken });
});

router.post("/refresh", async (req, res) => {
  const token: unknown = req.cookies?.[REFRESH_COOKIE_NAME];
  if (typeof token !== "string") {
    throw Errors.unauthorized();
  }

  const result = await authService.refresh(token);
  setRefreshCookie(res, result.refreshToken);
  res.json({ accessToken: result.accessToken });
});

router.post("/logout", async (req, res) => {
  const token: unknown = req.cookies?.[REFRESH_COOKIE_NAME];
  if (typeof token === "string") {
    await authService.logout(token);
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
  res.status(204).send();
});

router.get("/me", requireAuth, async (req, res) => {
  // requireAuth runs first and either calls next(err) or sets req.userId --
  // by the time this handler runs, req.userId is guaranteed to be set.
  const profile = await authService.getProfile(req.userId!);
  res.json(profile);
});

export default router;
