import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/todo_db';

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: databaseUrl,
  });
} else {
  // Prevent multiple pools in development hot-reloading
  const globalWithPool = global as typeof globalThis & {
    _postgresPool?: Pool;
  };
  
  if (!globalWithPool._postgresPool) {
    globalWithPool._postgresPool = new Pool({
      connectionString: databaseUrl,
    });
  }
  pool = globalWithPool._postgresPool;
}

export { pool };
