import crypto from 'crypto';
import { env } from '../config/env';
import * as userRepo from '../repositories/user.repository';
import * as refreshTokenRepo from '../repositories/refreshToken.repository';
import { comparePassword, hashPassword } from '../utils/password';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError } from '../utils/AppError';
import { PublicUser, User, toPublicUser } from '../types/domain';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function register(email: string, password: string, name: string): Promise<PublicUser> {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }
  const passwordHash = await hashPassword(password);
  const user = await userRepo.createUser(email, passwordHash, name);
  return toPublicUser(user);
}

export async function validateCredentials(email: string, password: string): Promise<User> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }
  return user;
}

export async function issueTokenPair(user: User): Promise<TokenPair> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  const expiresAt = new Date(Date.now() + env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000);
  await refreshTokenRepo.storeRefreshToken(user.id, hashToken(refreshToken), expiresAt);

  return { accessToken, refreshToken };
}

// Refresh-token rotation: the presented token is verified, checked against
// the DB (so a logged-out/reused token is rejected even if the JWT itself is
// still cryptographically valid), then immediately revoked and replaced.
export async function rotateRefreshToken(presentedToken: string): Promise<TokenPair> {
  let payload;
  try {
    payload = verifyRefreshToken(presentedToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(presentedToken);
  const stored = await refreshTokenRepo.findActiveRefreshToken(tokenHash);
  if (!stored) {
    throw new UnauthorizedError('Refresh token has been revoked or reused');
  }

  const user = await userRepo.findUserById(payload.sub);
  if (!user) {
    throw new UnauthorizedError('User no longer exists');
  }

  await refreshTokenRepo.revokeRefreshToken(tokenHash);
  return issueTokenPair(user);
}

export async function logout(presentedToken: string): Promise<void> {
  await refreshTokenRepo.revokeRefreshToken(hashToken(presentedToken));
}
