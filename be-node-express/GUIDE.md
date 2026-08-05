# be-node-express: hands-on backend reference

This service was extended from a single-file CRUD demo into a small layered
API specifically to exercise the skills in a typical full-stack JD:

- **Node.js**: production API structure (routes → controllers → services →
  repositories), not a single file of route handlers.
- **SQL**: real FK relations, indexes, parameterized queries, an aggregate/
  JOIN query, and a look at `EXPLAIN` output.
- **REST + auth**: resource design (pagination/filtering/sorting), and two
  parallel auth strategies — JWT and server-side sessions — so you can
  compare them directly instead of reading about them in the abstract.

Read this alongside the code; it points at files, not concepts.

## Architecture

```
src/
  config/       env loading, pg Pool, express-session store
  repositories/ raw SQL only — no business logic (user, todo, category, refreshToken)
  services/     business rules: validation, ownership checks, token issuance
  controllers/  HTTP glue: pull req → call service → shape response
  routes/       wires middleware (auth, validation) to controllers
  middleware/   authenticateJwt, authenticateSession, validate, errorHandler
  schemas/      zod request-body schemas
  graphql/      same repository/service layer, exposed over GraphQL too
```

Request flow for `PATCH /api/todos/:id`:
`routes/todo.routes.ts` → `authenticateJwt` → `validateBody(updateTodoSchema)`
→ `controllers/todo.controller.ts` → `services/todo.service.ts`
(ownership + category-exists checks) → `repositories/todo.repository.ts`
(parameterized `UPDATE ... RETURNING *`).

## SQL

- Schema: [`db/init.sql`](../db/init.sql) — `users`, `categories`, `todos`
  (FK to both), `refresh_tokens`, and a `session` table matching
  `connect-pg-simple`'s expected shape.
- Every query is parameterized (`$1, $2, ...`) — see any `repositories/*.ts`
  file. `sortBy`/`sortDir` in `todo.repository.ts` are the one place a value
  is interpolated into SQL directly, which is why `todo.service.ts` first
  validates them against a hardcoded whitelist (`SORTABLE_COLUMNS`) before
  they ever reach the query string.
- Composite index `idx_todos_user_completed (user_id, completed)` backs the
  most common query shape ("this user's incomplete todos"). Confirm it's
  used:
  ```bash
  docker exec todo-postgres-dev psql -U postgres -d todo_db -c \
    "EXPLAIN SELECT * FROM todos WHERE user_id = 1 AND completed = false;"
  ```
- Analytical query: `getTodoStatsByCategory` in
  [`src/repositories/todo.repository.ts`](src/repositories/todo.repository.ts)
  — a `LEFT JOIN` from `todos` to `categories`, `GROUP BY`, and
  `FILTER (WHERE ...)` aggregates to compute per-category completion rate in
  the database instead of in JS. Hit it via `GET /api/todos/stats`.

## REST API design

Base path `/api`, resource-oriented, standard status codes (`201` on create,
`404` on missing resource, `409` on duplicate email, `400` on validation
failure).

`GET /api/todos` supports:
- **Filtering**: `?completed=true`, `?categoryId=3`
- **Pagination**: `?page=2&limit=20` (capped at 100), response includes a
  `pagination` object with `total`/`totalPages`
- **Sorting**: `?sortBy=title&sortDir=asc` (whitelisted columns only)

Validation is schema-based ([`src/schemas/`](src/schemas)) via `zod`, applied
as middleware (`validateBody`) before the controller runs — invalid input
never reaches business logic.

## Auth: two patterns, side by side

Both protect the exact same todo CRUD surface (same controller, same
service, same repository) — only the middleware differs.

| | JWT | Session |
|---|---|---|
| Login | `POST /api/auth/login` | `POST /api/session-auth/login` |
| Protected todos | `GET /api/todos` (`Authorization: Bearer <token>`) | `GET /api/session-todos` (cookie, automatic) |
| Who am I | decode the access token client-side | `GET /api/session-auth/me` |
| Logout | `POST /api/auth/logout` (revokes refresh token) | `POST /api/session-auth/logout` (destroys session) |
| State | stateless — server verifies a signature, no DB hit per request | stateful — every request looks up the session row in Postgres (`middleware/authenticateSession.ts`) |
| Storage | client holds both tokens; server stores only a *hash* of the refresh token (`refresh_tokens` table) | server stores session data in the `session` table (`connect-pg-simple`), client holds only an opaque cookie |

**JWT refresh rotation** (`services/auth.service.ts`): each call to
`POST /api/auth/refresh` verifies the presented refresh token, checks it's
still active in the DB, immediately revokes it, and issues a brand new pair.
Replaying an already-used refresh token is rejected — try it twice in a row
and watch the second call 401.

**Password storage**: `bcrypt` with 12 salt rounds
([`src/utils/password.ts`](src/utils/password.ts)), never compared or logged
in plaintext.

**Rate limiting**: `authRateLimiter`
([`src/middleware/rateLimiter.ts`](src/middleware/rateLimiter.ts)) throttles
login/register/refresh to slow down credential stuffing.

*(OAuth — e.g. "Sign in with Google" — isn't wired up here: it needs a real
registered OAuth app with a client ID/secret you'd have to provision
yourself. The JWT flow above is the piece that pattern would plug into once
a provider confirms identity.)*

## GraphQL (bonus, not in the JD)

`/graphql` was already in this repo before this pass; it's now wired through
the same `services`/`repositories` instead of duplicating SQL
(`src/graphql/resolvers.ts`), and reuses the same JWT — pass
`Authorization: Bearer <accessToken>` when calling it.

## Try it end-to-end

```bash
docker compose up -d db
cd be-node-express && cp .env.example .env && npm install && npm run dev
```

```bash
# JWT
curl -s -X POST localhost:5001/api/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"supersecret123","name":"You"}'
TOKENS=$(curl -s -X POST localhost:5001/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"supersecret123"}')
ACCESS=$(echo "$TOKENS" | jq -r .accessToken)

curl -s -X POST localhost:5001/api/categories -H "Authorization: Bearer $ACCESS" \
  -H 'Content-Type: application/json' -d '{"name":"Work","color":"#3b82f6"}'
curl -s -X POST localhost:5001/api/todos -H "Authorization: Bearer $ACCESS" \
  -H 'Content-Type: application/json' -d '{"title":"Ship the demo"}'
curl -s "localhost:5001/api/todos?completed=false&sortBy=title&sortDir=asc" \
  -H "Authorization: Bearer $ACCESS"
curl -s localhost:5001/api/todos/stats -H "Authorization: Bearer $ACCESS"

# Session
curl -s -c cookies.txt -X POST localhost:5001/api/session-auth/login -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"supersecret123"}'
curl -s -b cookies.txt localhost:5001/api/session-todos
```

## A real bug this build surfaced (worth understanding)

`middleware/authenticateSession.ts` is an `async` function used directly as
Express middleware. Express 4 only forwards *synchronous* throws to the
error handler automatically — a rejected promise from an async middleware
that isn't wrapped just becomes an unhandled rejection, which crashes the
Node process by default on modern Node versions. It's wrapped in
`asyncHandler` now (same helper the controllers use), but it's a good
concrete example of an Express 4 gotcha worth being able to explain in an
interview: *"async middleware needs explicit error forwarding; async route
handlers wrapped in a helper do too, since Express 4 predates native promise
support."*
