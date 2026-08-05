import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 5001),
  databaseUrl: required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/todo_db'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS || 7),
  },
  session: {
    secret: required('SESSION_SECRET', 'dev-session-secret-change-me'),
    ttlMs: Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24), // 1 day
  },
};
