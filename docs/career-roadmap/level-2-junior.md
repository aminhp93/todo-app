# Level 2 — Junior

> Self-answer each bullet point before viewing the [answers/detailed explanation](level-2-junior-answers.md).

## Frontend

**Requirements**
- Properly understanding the `useEffect` dependency array, avoiding infinite loops and stale closures.
- Logical child component decomposition (reusability), passing typed props (TypeScript interfaces / prop typing).
- Form management: controlled inputs, basic validation (required fields, maximum length).
- CSS framework (Tailwind) and basic responsive design (mobile-first approach).
- Basic usage of `useMemo`/`useCallback` (deep understanding of when NOT to use them not required yet).

**Keywords**: custom hook, prop drilling, controlled/uncontrolled input, Tailwind utility classes, TypeScript interface, `key` prop in list rendering, error boundary (conceptual understanding).

**Application in `todo-app`**: [`fe-vite/src/App.tsx`](../../fe-vite/src/App.tsx) and [`fe-nextjs`](../../fe-nextjs/src/app) use TypeScript + Tailwind and feature a backend switcher toggle — reading the code that switches backends (pinging connection status) is a great example of managing side-effects with `useEffect`. **Missing at the Junior level**: extracting `TodoItem`, `TodoList`, and `AddTodoForm` into separate standalone components rather than leaving them in `App.tsx` — this serves as a good refactoring exercise for practice.

## Backend

**Requirements**
- Separating basic architecture: routes → controller → (standalone service/repository layers not strictly required yet).
- Input validation using libraries (`zod`/`joi`) rather than manual `if (!title)` checks.
- Centralized error handling middleware instead of repeating `try/catch` in every route handler.
- Understanding and implementing basic authentication: password hashing (`bcrypt`), basic JWT signing/verification (refresh token rotation not required yet).
- SQL: basic `JOIN` operations, understanding Foreign Keys, understanding what an `INDEX` is (deep optimization not required yet).

**Keywords**: middleware, `bcrypt`, JWT (access token), request validation schema, foreign key, `ON DELETE CASCADE`, parameterized query (preventing SQL injection).

**Application in `todo-app`**: `be-node-express` post-refactor EXCEEDS this level — it features full layer separation, JWT, and Zod validation. To get a true Level 2 hands-on feel, try rewriting **a small feature from scratch without referencing existing code**: for example, adding a `priority` field (`low/medium/high`) to `todos`, writing the SQL migration, and updating `todo.repository.ts`, `todo.service.ts`, `todo.schema.ts`, and the `PATCH` route. If you can complete this in <30 minutes without TypeScript errors, you have solidly mastered Level 2 BE.

## DevOps

**Requirements**
- Ability to write a simple single-stage `Dockerfile` for a Node.js service (`COPY` + `RUN npm install` + `CMD`).
- Writing a `docker-compose.yml` for multiple dependent services (`depends_on`), understanding `networks`/`volumes` at an operational level.
- Reading and understanding a basic YAML CI pipeline (GitHub Actions): trigger conditions, step execution order.

**Keywords**: `depends_on`, named volume, bridge network, CI trigger (`push`/`pull_request`), `actions/checkout`, `actions/setup-node`.

**Application in `todo-app`**: Read and explain the entirety of [`docker-compose.yml`](../../docker-compose.yml) and [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) — understanding why each service has its own job with `paths-filter` (only building when that directory changes) is a great example of effective monorepo CI.

## Security

**Requirements**
- Properly hashing passwords (`bcrypt`/`argon2`, understanding salt rounds).
- Always using parameterized queries, explaining how SQL injection occurs when concatenating strings directly.
- Configuring CORS properly (never setting `origin: '*'` when `credentials: true` is required).
- Understanding what XSS is and why React automatically escapes output to mitigate this risk.

**Keywords**: `bcrypt` salt rounds, parameterized query, CORS `origin` vs `credentials`, XSS, output escaping.

**Application in `todo-app`**: [`src/utils/password.ts`](../../be-node-express/src/utils/password.ts) uses `bcrypt` with 12 salt rounds; all queries in [`src/repositories/`](../../be-node-express/src/repositories) use `$1, $2` parameters instead of string concatenation. Key detail: `todo.repository.ts` is the ONLY place with direct string concatenation in SQL (`sortBy`/`sortDir` for `ORDER BY`) — read `todo.service.ts` to see why validating input against a strict whitelist (`SORTABLE_COLUMNS`) before reaching the repository is mandatory, not optional.

## How to Self-Check Level 2 Mastery

You can explain: why passwords must be hashed rather than 2-way encrypted, what 3 parts constitute a JWT and who verifies it, how `JOIN` differs from a subquery, how to debug basic CORS errors when FE calls a BE on a different port, and how to write a `docker-compose.yml` for 2 dependent services from scratch.
