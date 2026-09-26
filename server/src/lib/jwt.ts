import jwt from "jsonwebtoken";

const ACCESS_TOKEN_TTL = "15m";

export interface AccessTokenPayload {
  userId: number;
}

function requireSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not set");
  }
  return secret;
}

export function signAccessToken(userId: number): string {
  // "sub" (subject) is the standard JWT claim for "who is this token about".
  // Per the JWT spec it's always a string -- jsonwebtoken's own types agree
  // (JwtPayload.sub is `string | undefined`) -- so we convert our numeric
  // user id at the boundary rather than fight the spec.
  return jwt.sign({ sub: String(userId) }, requireSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, requireSecret());

  // jwt.verify's return type is `string | JwtPayload` (the plain-string case
  // only happens if a token was ever signed with a raw string payload, never
  // ours), and JwtPayload.sub is `string | undefined`. Both are real
  // possibilities the type system is right to force us to handle, not just
  // theoretical.
  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Malformed token payload");
  }

  const userId = Number(decoded.sub);
  if (!Number.isInteger(userId)) {
    throw new Error("Malformed token payload");
  }

  return { userId };
}
