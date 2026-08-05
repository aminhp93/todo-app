-- ============================================================================
-- Users: backs both JWT auth (password_hash + refresh_tokens) and
-- session-based auth (express-session via the "session" table below).
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- Categories: gives todos a real FK relation to JOIN against (used by the
-- /api/todos/stats analytical endpoint).
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6b7280' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (user_id, name)
);

-- ============================================================================
-- Todos: owned by a user and optionally tagged with a category.
--
-- user_id is nullable (not NOT NULL) on purpose: be-nestjs/be-fastapi still
-- write to this same table with the pre-auth INSERT INTO todos (title,
-- completed) contract and have no concept of a user. be-node-express always
-- supplies user_id itself (from the JWT) and always filters by it, so a
-- NULL-owned row is simply invisible to it — that's the correct behavior,
-- not a bug: a row nobody owns shouldn't show up under any user's account.
-- ============================================================================
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- Refresh tokens: JWT refresh-token rotation. Only the hash is stored so a
-- leaked DB row can't be replayed as a live token.
-- ============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- Session store for express-session (connect-pg-simple). Schema matches
-- connect-pg-simple's expected table exactly.
-- ============================================================================
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- ============================================================================
-- Indexes
-- ============================================================================
-- Common query: "this user's todos, filtered by completion state"
CREATE INDEX IF NOT EXISTS idx_todos_user_completed ON todos (user_id, completed);
-- Analytical join target
CREATE INDEX IF NOT EXISTS idx_todos_category_id ON todos (category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);
-- Refresh-token lookups happen by user during rotation/revocation
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
-- connect-pg-simple prunes expired sessions with a query on this column
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);
