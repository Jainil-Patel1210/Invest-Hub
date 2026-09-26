import type { Request } from "express";
import { Errors } from "./errors";

/**
 * Express 5's type inference for a route param turns out to depend on how
 * many handler functions a route passes: a route with a single handler
 * infers a param as a precise `string`, but one with a middleware in front
 * of the handler widens it to `string | string[] | undefined` -- same route
 * shape, different inferred type purely from handler count (first seen in
 * stocks/routes.ts). Every route in the app reads path params through these
 * two helpers instead, so no route has to trust inference that isn't
 * actually consistent. At runtime, a plain named path segment (not a
 * wildcard) is always a single string when present -- this just makes that
 * real guarantee explicit.
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") {
    throw Errors.validation({ [name]: ["missing path parameter"] });
  }
  return value;
}

export function getIntParam(req: Request, name: string): number {
  const raw = getParam(req, name);
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw Errors.validation({ [name]: [`must be an integer, got "${raw}"`] });
  }
  return value;
}
