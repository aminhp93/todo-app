import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: number;
  email: string;
}

export interface RefreshTokenPayload {
  sub: number;
  jti: string; // unique id for this refresh token, used to find/revoke its DB row
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as unknown as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: `${env.jwt.refreshTtlDays}d` });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as unknown as RefreshTokenPayload;
}

// Refresh tokens are only ever stored as a SHA-256 hash so a leaked DB row
// can't be replayed as a live token (mirrors how you'd never store passwords
// in plaintext).
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
