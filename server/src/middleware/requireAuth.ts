import type { RequestHandler } from "express";
import { Errors } from "../lib/errors";
import { verifyAccessToken } from "../lib/jwt";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(Errors.unauthorized());
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    // jwt.verify throws for anything wrong with the token: bad signature,
    // expired, malformed -- we don't need to distinguish which, the client
    // response is the same either way.
    next(Errors.invalidToken());
  }
};
