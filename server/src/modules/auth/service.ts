import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { Errors } from "../../lib/errors";
import { signAccessToken } from "../../lib/jwt";
import * as repo from "./repo";
import type { LoginInput, RegisterInput } from "./schema";

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface PublicUser {
  id: number;
  email: string;
  fullName: string;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

function toPublicUser(user: repo.UserRow): PublicUser {
  return { id: user.id, email: user.email, fullName: user.full_name };
}

/**
 * A refresh token is 256 bits of random data, not a human-chosen password --
 * brute-forcing it is infeasible regardless of hash speed. Hashing it with a
 * fast, non-salted algorithm (SHA-256) is the *correct* choice here, not a
 * shortcut: bcrypt's whole design point is to be deliberately slow so it
 * resists guessing a low-entropy human password, which is a problem this
 * token doesn't have. Using bcrypt here would just make every refresh
 * request slower for no security benefit.
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueRefreshToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await repo.storeRefreshToken(userId, hashToken(token), expiresAt);
  return token;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) {
    throw Errors.emailTaken();
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await repo.createUser(input.email, passwordHash, input.fullName);

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: await issueRefreshToken(user.id),
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await repo.findUserByEmail(input.email);
  // Deliberately the *same* error for "no such email" and "wrong password".
  // Distinguishing them would let an attacker enumerate which emails are
  // registered just by watching which error comes back.
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw Errors.invalidCredentials();
  }

  return {
    user: toPublicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: await issueRefreshToken(user.id),
  };
}

export async function refresh(
  presentedToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const existing = await repo.findValidRefreshToken(hashToken(presentedToken));
  if (!existing) {
    throw Errors.invalidToken();
  }

  // Rotate: the presented token is deleted and a brand new one issued. If
  // this exact (now-deleted) token is ever presented again, it simply won't
  // be found -- that's the concrete signal a stolen, already-used refresh
  // token trips, rather than staying valid until its expiry no matter how
  // many times it's replayed.
  await repo.deleteRefreshTokenById(existing.id);

  return {
    accessToken: signAccessToken(existing.user_id),
    refreshToken: await issueRefreshToken(existing.user_id),
  };
}

export async function logout(presentedToken: string): Promise<void> {
  await repo.deleteRefreshTokenByHash(hashToken(presentedToken));
}

export interface Profile extends PublicUser {
  accountBalance: number;
  createdAt: Date;
}

export async function getProfile(userId: number): Promise<Profile> {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw Errors.notFound("User");
  }
  return {
    ...toPublicUser(user),
    accountBalance: Number(user.account_balance),
    createdAt: user.created_at,
  };
}
