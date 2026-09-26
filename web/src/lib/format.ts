/** Plain rupee formatting with Indian digit grouping (₹1,00,000, not ₹100,000). */
export function formatINR(value: number, decimals = 2): string {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Large aggregate values (market cap, AUM) in Indian convention: Lakh (10^5)
 * and Crore (10^7) -- not the same grouping as formatINR above, which only
 * changes comma placement. A market cap of ₹16,59,081.06 Cr is never written
 * out digit-by-digit in an Indian financial app.
 *
 * The divided figure still needs Indian-grouped commas of its own once a
 * company is large enough (a company worth "16,59,081 Cr" is a real,
 * unremarkable market cap in this dataset -- Reliance's is exactly that) --
 * caught by actually looking at the rendered page rather than trusting the
 * arithmetic alone, since `(value / 1e7).toFixed(2)` is correct math but
 * renders as an ungrouped raw number once the quotient itself exceeds 1,000.
 */
export function formatCompactINR(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e7)
    return `₹${(value / 1e7).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
  if (abs >= 1e5)
    return `₹${(value / 1e5).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  return formatINR(value, 0);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/** "up", "down", or "flat" -- the one place that decides what counts as each, reused by <Delta> and the price chart's line color alike. */
export function deltaDirection(value: number): "up" | "down" | "flat" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}
