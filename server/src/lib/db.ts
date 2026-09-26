/**
 * Postgres reports a unique-constraint violation with SQLSTATE 23505. pg
 * throws this as a plain object carrying a `code` string property, not a
 * distinguishable Error subclass -- this is the generic way to detect it
 * from any module.
 */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "23505";
}
