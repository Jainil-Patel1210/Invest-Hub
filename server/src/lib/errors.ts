/**
 * A deliberate application-level error, as opposed to an unexpected bug.
 * Extending the built-in Error keeps `instanceof Error`, stack traces, and
 * `.message` all working normally -- we're adding fields, not replacing
 * anything.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * One canonical definition per error condition the app can throw, instead of
 * routes hand-writing `new AppError(401, "INVALID_CREDENTIALS", ...)` inline
 * with a slightly different string every time. The frontend can switch on
 * `error.code` reliably because there's exactly one place these are minted.
 */
export const Errors = {
  validation: (details: unknown) =>
    new AppError(400, "VALIDATION_ERROR", "Request validation failed", details),
  unauthorized: () => new AppError(401, "UNAUTHORIZED", "Authentication required"),
  invalidCredentials: () => new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password"),
  invalidToken: () => new AppError(401, "INVALID_TOKEN", "Invalid or expired token"),
  notFound: (resource: string) => new AppError(404, "NOT_FOUND", `${resource} not found`),
  emailTaken: () => new AppError(409, "EMAIL_TAKEN", "An account with this email already exists"),
  watchlistNameTaken: () =>
    new AppError(409, "WATCHLIST_NAME_TAKEN", "You already have a watchlist with this name"),
  // 422, not 400: the request is structurally well-formed (a valid symbol,
  // a valid positive quantity) -- it fails on a business rule evaluated
  // against current state (your balance, your holdings), which is exactly
  // the distinction 422 Unprocessable Entity exists to express.
  insufficientFunds: () =>
    new AppError(422, "INSUFFICIENT_FUNDS", "Insufficient account balance for this trade"),
  insufficientHoldings: () =>
    new AppError(
      422,
      "INSUFFICIENT_HOLDINGS",
      "You don't hold enough shares to sell this quantity",
    ),
};
