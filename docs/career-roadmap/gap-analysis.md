# Gap Analysis: Where Does `todo-app` Currently Stand?

An honest (unvarnished) evaluation based on the codebase as of this writing (2026-08). Use this document as your starting baseline, checking off items as you complete each task.

## Summary by Level

| Level | Status | Notes |
| :--- | :--- | :--- |
| 1 — Fresher | ✅ Far Exceeded | The original `be-node-express` was precisely at this baseline |
| 2 — Junior | ✅ Far Exceeded | Includes layer separation, JWT auth, input validation |
| 3 — Middle | 🟡 Mostly Met | Lacks automated test suites, migration tools, caching — see details below |
| 4 — Senior | 🟠 Partially Met | Contains ADR-worthy technical decisions (unwritten); lacks observability and queues |
| 5 — Staff | 🔴 Not Met | Requires written artifacts (RFCs), rather than additional code in this project |
| 6 — Consultant | 🔴 Not Met | Requires written artifacts (due diligence, build-vs-buy decision memos) |

## Summary by Engineering Track

| Track | Estimated Level | Notes |
| :--- | :--- | :--- |
| Backend | Middle (early Senior) | Layered architecture, 2 auth patterns, real SQL — lack of test suites is main barrier to Senior |
| Frontend | Junior | `fe-vite`/`fe-nextjs` remain at original baseline, falling behind refactored BE capabilities |
| DevOps | Junior (early Middle) | Good multi-stage Docker + dev/prod compose setups, but CI lacks linting/testing and `HEALTHCHECK` |
| Security | Middle | Hashing/JWT/rate-limiting proper, but lacks security headers, vulnerability scanning, least-privilege DB role |

## Existing Strengths (Notable for Interview Discussions)

- Clear layered architecture: `routes → controllers → services → repositories` ([`be-node-express/src`](../../be-node-express/src)).
- Dual auth patterns running side-by-side on a single CRUD app for direct comparison: JWT (access + refresh token rotation, revocation upon reuse detection) and session auth (`express-session` + `connect-pg-simple`, persisted in PostgreSQL).
- Real SQL: composite index verified via `EXPLAIN`, `JOIN` + `GROUP BY` + `FILTER` for analytical metrics (`/api/todos/stats`), 100% parameterized queries, whitelisted `sortBy` columns preventing SQL injection via `ORDER BY`.
- REST API design: pagination / filtering / sorting, proper status codes, rate limiting on auth endpoints.
- Real bug discovered and fixed: `authenticateSession` async middleware lacked an `asyncHandler` wrapper → unhandled rejection → process crash. Serves as prime material for postmortems (see [level-4-senior.md](level-4-senior.md)).
- GraphQL sharing underlying service/repository layers with REST, eliminating logic duplication.
- DevOps: multi-stage `Dockerfile` (builder stage isolated from runtime), environment config separation (dev/prod), `docker-compose.prod.yml` using `${VAR:?...}` syntax to fail-fast on missing production secrets rather than quietly defaulting to weak credentials.
- Security: `bcrypt` with 12 salt rounds, 100% parameterized SQL queries, refresh token rotation + reuse detection, rate limiting on auth endpoints.

## Gaps Remaining (In Priority Order for Implementation)

1. **Automated Tests (Highest Priority)** — `be-node-express` currently lacks tests (`package.json` contains no `test` script). This represents the primary single blocker to solidifying Level 3. Start with:
   - Unit tests for `services/auth.service.ts` (mocking repositories).
   - Integration tests using `supertest` covering `/api/auth/*` and `/api/todos` (using isolated test databases or per-test transaction rollbacks).
2. **Versioned Database Migrations** — currently uses a single `db/init.sql` script via Docker entrypoint. Add `node-pg-migrate` or Prisma to provide `up/down` migrations reviewable via PRs like standard application code.
3. **Caching Layer** — `/api/todos/stats` is a prime candidate for Redis caching by `userId`, invalidated whenever todo items mutate within associated categories.
4. **Minimal Observability** — replace `console.log`/`console.error` with structured JSON logging (`pino`), introducing unique request IDs to trace requests through logs.
5. **CI Upgrades** — [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) currently only executes build + Docker image checks for `be-node-express`, omitting `tsc --noEmit`, test runs (due to missing tests), and linting steps for this service.
6. **Bringing Frontend Up to Speed with Backend** — `fe-vite`/`fe-nextjs` fetch `/api/todos` without authentication headers; after enforcing JWT in `be-node-express`, these frontends cannot communicate with the backend via UI (see warnings in [`ARCHITECTURE.md`](../../ARCHITECTURE.md)). Implementing a login interface + token persistence serves as a practical Level 3 FE exercise (React Query + memory tokens / httpOnly refresh cookies).
7. **Senior / Staff / Consultant Artifacts** — authoring the 3 recommended documents detailed in [level-4-senior.md](level-4-senior.md), [level-5-staff-lead.md](level-5-staff-lead.md), and [level-6-principal-consultant.md](level-6-principal-consultant.md): a postmortem for the unhandled async error bug, an RFC detailing architectural failure points at 10M users, and a simulated technical due diligence report.
8. **Security Headers (`helmet`)** — currently missing security headers (`CSP`, `HSTS`, `X-Frame-Options`) in `src/app.ts`. This requires <30 minutes and should be implemented before items 9–10.
9. **Remediating `npm audit` Findings** — `be-node-express` currently reports 3 transitive vulnerabilities (`@apollo/server`, `brace-expansion`, `uuid` at moderate/high severity). Lacks Dependabot/Renovate configs for automated CVE tracking.
10. **Least-Privilege Database Role** — application currently connects using `postgres`/`postgres` superuser credentials rather than a dedicated application DB role restricted strictly to `SELECT/INSERT/UPDATE/DELETE` on target tables.
11. **`HEALTHCHECK` in Dockerfile** — the `/health` endpoint exists in [`src/app.ts`](../../be-node-express/src/app.ts), but [`Dockerfile`](../../be-node-express/Dockerfile) lacks a `HEALTHCHECK` directive for container orchestrators.

## How to Use This File

Copy the "Gaps Remaining" list into a personal checklist. Upon completing an item, review the corresponding `level-N-*.md` document to self-evaluate — ensuring you understand *why* the implementation matters beyond checking off tasks.
