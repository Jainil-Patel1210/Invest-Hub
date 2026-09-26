import type { ErrorRequestHandler } from "express";
import { AppError } from "../lib/errors";

/**
 * Express identifies error-handling middleware purely by counting its
 * declared parameters: exactly 4 means "this handles errors", 3 or fewer
 * means "this is normal middleware". `_next` below is never called -- but
 * removing it, even though it's unused, would silently turn this into a
 * regular middleware that Express never routes errors to. This one must be
 * registered *after* every route in app.ts, or none of them are covered by it.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Anything that isn't an AppError is a genuine bug, not an anticipated
  // condition -- log the real detail server-side, but never leak it to the
  // client (a raw stack trace or DB error string can reveal internals).
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
};
