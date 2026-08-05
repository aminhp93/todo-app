import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

export async function verifyDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Successfully connected to PostgreSQL');
  } finally {
    client.release();
  }
}
