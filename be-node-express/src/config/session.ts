import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';
import { env } from './env';

const PgSession = connectPgSimple(session);

// Session rows live in Postgres (the "session" table from db/init.sql), not
// in-memory — so sessions survive a server restart and work across multiple
// app instances behind a load balancer, unlike express-session's default
// MemoryStore.
export const sessionMiddleware = session({
  store: new PgSession({ pool, tableName: 'session', createTableIfMissing: false }),
  secret: env.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: env.session.ttlMs,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
});
