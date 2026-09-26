import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";
import { Errors } from "../lib/errors";

/**
 * A middleware *factory*: `validateBody(schema)` returns the actual
 * middleware, so a route reads `router.post("/x", validateBody(xSchema), handler)`
 * -- the expected request shape is documented right where the route is
 * defined, not buried inside the handler body.
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(Errors.validation(z.flattenError(result.error)));
      return;
    }
    // Replace the raw, untyped body with zod's *parsed* output -- schemas
    // can trim, coerce, or transform, so downstream code should see the
    // validated value, not what Express's JSON body-parser handed over.
    req.body = result.data;
    next();
  };
}

/**
 * Same idea for query strings (?range=1Y etc), but landing the validated
 * result on `res.locals.query` rather than reassigning `req.query`.
 * `req.query` conceptually means "the raw query string" -- overwriting its
 * meaning with post-validation typed data is a confusing fit even where it
 * happens to work, and Express 5 changed enough `req` internals from
 * Express 4 that "happens to work" isn't something to lean on without
 * checking. `res.locals` is guaranteed writable middleware-to-handler
 * storage in every Express version, which sidesteps the question entirely.
 */
export function validateQuery(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(Errors.validation(z.flattenError(result.error)));
      return;
    }
    res.locals.query = result.data;
    next();
  };
}
