import { pool } from "../../db/pool";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  account_balance: string; // NUMERIC comes back as a string -- see cache.ts's numOrNull comment
  created_at: Date;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  fullName: string,
): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    "INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *",
    [email, passwordHash, fullName],
  );
  // INSERT ... RETURNING * always yields exactly one row for a single-row
  // INSERT -- unlike a SELECT, there's no "what if nothing matched" case here.
  return rows[0]!;
}

export async function storeRefreshToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt],
  );
}

export interface RefreshTokenRow {
  id: number;
  user_id: number;
}

export async function findValidRefreshToken(tokenHash: string): Promise<RefreshTokenRow | null> {
  const { rows } = await pool.query<RefreshTokenRow>(
    "SELECT id, user_id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now()",
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function deleteRefreshTokenById(id: number): Promise<void> {
  await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [id]);
}

export async function deleteRefreshTokenByHash(tokenHash: string): Promise<void> {
  await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [tokenHash]);
}
