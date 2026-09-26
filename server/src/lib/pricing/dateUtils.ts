/**
 * Adds `days` (negative to subtract) to an ISO "YYYY-MM-DD" date string,
 * returning another ISO date string. The "T00:00:00.000Z" pins the parse to
 * UTC explicitly -- a plain `new Date("2025-01-09")` is *already* parsed as
 * UTC midnight per the ECMA-262 spec, but spelling it out here makes that
 * non-negotiable regardless of how this function is called. That matters:
 * a real off-by-one-day bug during development came from exactly this kind
 * of UTC/local ambiguity (see pool.ts's DATE type parser override).
 */
export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
