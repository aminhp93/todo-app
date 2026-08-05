# Level 3 — Middle

> Self-answer each bullet point before viewing the [answers/detailed explanation](level-3-mid-answers.md).

## Frontend

**Requirements**
- Proper server state management: React Query / TanStack Query or SWR (instead of manual `useEffect` + `useState` for fetch/cache/refetch).
- Complex client state management when needed: Redux Toolkit, Zustand, or Context API used correctly (understanding when Context triggers unnecessary re-renders).
- Performance: `React.memo`, code splitting (`React.lazy` + `Suspense`), understanding re-rendering mechanisms and how to prevent unnecessary re-renders.
- Testing: component unit testing with Jest + React Testing Library (testing user behavior rather than implementation details).
- Stricter TypeScript: basic generics, union / discriminated unions, avoiding indiscriminate use of `any`.
- Conceptual understanding of SSR/CSR/SSG (Next.js `app router`) and Web Vitals (LCP/CLS/INP).

**Keywords**: React Query, cache invalidation, optimistic update, Redux Toolkit slice, Zustand store, code splitting, `React.memo`, discriminated union, hydration, Web Vitals, accessibility (a11y) — `aria-*`, focus management.

**Application in `todo-app`**: **NOT YET implemented** in current `fe-vite`/`fe-nextjs` — both currently handle fetching via raw `useState`/`useEffect`, lacking React Query and automated test suites. This is the clearest gap for practicing Level 3 FE: refactor one of the frontends to use TanStack Query for `GET/POST/PATCH/DELETE /api/todos`, implement optimistic updates when toggling `completed`, and write RTL tests for `TodoList`.

## Backend

**Requirements**
- Standard REST API design: pagination, filtering, sorting, versioning (`/api/v1`).
- Advanced SQL: reading and understanding `EXPLAIN`/`EXPLAIN ANALYZE`, knowing when composite indexes are required, identifying N+1 query problems, implementing database transactions with rollback on failure.
- Auth: evaluating tradeoffs between JWT (stateless) vs session (stateful), JWT refresh token rotation, token revocation on logout.
- Testing: service layer unit testing (mocking repository layers), integration testing APIs using `supertest` against an isolated test database.
- Versioned database migrations (Knex/Prisma/TypeORM migrations) instead of a single `init.sql` executed once.
- Basic caching: Redis for read-heavy/write-light data patterns, cache invalidation on updates.

**Keywords**: cursor vs offset pagination, composite index, `EXPLAIN ANALYZE`, N+1 query, refresh token rotation, `supertest`, test database, migration up/down, Redis, cache invalidation, idempotency key.

**Application in `todo-app`**: `be-node-express` currently ACHIEVES: pagination/filtering/sorting (`GET /api/todos`), composite index verified via `EXPLAIN` (see [GUIDE.md](../../be-node-express/GUIDE.md#sql)), JWT refresh rotation + revocation, JOIN + aggregate queries (`/api/todos/stats`), and side-by-side session auth comparison. **Missing to solidify Level 3**:
- No tests (`npm test` does not exist) — this is the largest single gap.
- Uses `init.sql` run once via Docker entrypoint, rather than versioned/rollback migrations (try adding Prisma or `node-pg-migrate`).
- No caching layer (Redis) — `GET /api/todos/stats` is a prime candidate for caching per `userId`, invalidated whenever todos change.
- No API versioning prefix yet.

## DevOps

**Requirements**
- Multi-stage Docker builds to reduce final image size (separating build stage from runtime stage, omitting `devDependencies`/TypeScript source files from production images).
- Realistic CI pipeline: running lint + type-check + tests (not just build steps), caching `node_modules`/npm cache across pipeline runs to decrease CI build duration.
- Explicit environmental config separation (dev/staging/prod) — avoiding copying identical `.env` files across environments.
- Health check endpoints (`/health`) and utilizing them for container orchestrators (`HEALTHCHECK` in Dockerfile, or readiness probes).

**Keywords**: multi-stage build, Docker layer caching, CI cache (`actions/cache`), `HEALTHCHECK`, environment parity, container registry.

**Application in `todo-app`**: [`be-node-express/Dockerfile`](../../be-node-express/Dockerfile) is already multi-stage (builder stage separated from runtime stage, `npm install --only=production` in the final stage) — explaining why the final stage does not require TypeScript or `devDependencies` meets requirements. **Missing**: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) currently only runs `npm install && npm run build` (a build check), does NOT run linters, does NOT run tests (since `be-node-express` lacks tests — see [gap-analysis.md](gap-analysis.md)), does NOT cache `node_modules` between runs, and lacks a `HEALTHCHECK` in the Dockerfile despite having a `/health` endpoint in [`src/app.ts`](../../be-node-express/src/app.ts).

## Security

**Requirements**
- JWT best practices: short-lived access tokens, refresh token rotation + revocation upon detecting reuse (mitigating replay attacks), storing JWT secrets securely outside source code.
- Rate limiting on sensitive endpoints (login/register) to prevent brute-force attacks.
- Understanding and applying OWASP Top 10 vulnerabilities (Injection, Broken Authentication, Sensitive Data Exposure) in practice.
- Dependency vulnerability scanning: `npm audit`, Dependabot/Renovate automatically submitting PRs when CVEs are identified.
- Understanding CSRF and why session-based authentication requires greater CSRF mitigation than JWT sent via request headers.

**Keywords**: refresh token rotation, replay attack, rate limiting, OWASP Top 10, `npm audit`, Dependabot, CSRF, `SameSite` cookie.

**Application in `todo-app`**: [`src/services/auth.service.ts`](../../be-node-express/src/services/auth.service.ts) implements refresh token rotation + reuse detection (revoking old tokens immediately upon producing new access tokens) — test this by making two consecutive requests to `/api/auth/refresh` using the same refresh token; the second attempt will yield `401`. [`src/middleware/rateLimiter.ts`](../../be-node-express/src/middleware/rateLimiter.ts) enforces a limit of 20 requests per 15 minutes for `/api/auth/*`. **Missing**: running `npm audit` in `be-node-express` currently reports 3 transitive vulnerabilities (`@apollo/server`, `brace-expansion`, `uuid`) requiring tracking/remediation; lacks Dependabot/Renovate configurations; session cookies utilize `sameSite: 'lax'` (proper CSRF defense), but code comments do not explicitly document why `'strict'` was not chosen.

## How to Self-Check Level 3 Mastery

You can design a database schema with proper transactions (e.g., transferring funds between two accounts), write integration tests simulating real HTTP requests (`supertest`) without executing manual curl commands, explain why offset pagination degrades on deep pages in large tables (and how cursor pagination resolves it), write a CI workflow executing automated test suites, and articulate what specific attack vector refresh token rotation prevents.
