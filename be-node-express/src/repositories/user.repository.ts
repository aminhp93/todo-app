import { pool } from '../config/db';
import { User } from '../types/domain';

export async function createUser(email: string, passwordHash: string, name: string): Promise<User> {
  const result = await pool.query<User>(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, name],
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}
