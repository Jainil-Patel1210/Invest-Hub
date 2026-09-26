/**
 * Thrown when a symbol genuinely doesn't resolve to any real stock -- kept
 * separate from the HTTP-aware `AppError` in lib/errors.ts on purpose: this
 * is a data-layer concept (a provider has no data for this symbol), and the
 * translation into an HTTP 404 is a routing concern that belongs at the
 * route/error-handler boundary, not baked into the pricing layer itself.
 */
export class SymbolNotFoundError extends Error {
  constructor(public readonly symbol: string) {
    super(`No data available for symbol "${symbol}"`);
    this.name = "SymbolNotFoundError";
  }
}
