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
