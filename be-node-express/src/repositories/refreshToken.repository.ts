import { pool } from '../config/db';

export interface RefreshTokenRow {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export async function storeRefreshToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt],
  );
}

export async function findActiveRefreshToken(tokenHash: string): Promise<RefreshTokenRow | null> {
  const result = await pool.query<RefreshTokenRow>(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [tokenHash],
  );
  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
}

export async function revokeAllRefreshTokensForUser(userId: number): Promise<void> {
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
    [userId],
  );
}
