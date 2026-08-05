# Level 3 — Answers / Detailed Explanations

Explanations for each bullet point in [level-3-mid.md](level-3-mid.md).

## Frontend

**React Query / TanStack Query or SWR vs manual `useEffect` + `useState`**
Manual fetching via `useEffect` requires hand-coding: loading/error states, caching (preventing redundant API requests for cached data), window refetching on refocus, and race condition handling when older out-of-order responses overwrite newer ones. React Query manages these complexities using a concise hook (`useQuery(['todos'], fetchTodos)`), complements writes with `useMutation`, and automatically invalidates related query caches post-mutation (`queryClient.invalidateQueries(['todos'])`).

**Client State Management: Redux Toolkit, Zustand, Context API**
"Server state" (remote API data — best managed with React Query) differs fundamentally from pure UI "client state" (e.g., modal visibility, selected tab indexes — managed via `useState`/Context). Redux Toolkit excels in large-scale applications with shared state spanning unrelated components, requiring time-travel debugging. Zustand offers a lightweight alternative with minimal boilerplate. Context API causes re-renders across ALL descendant components whenever Context values change — suitable for low-frequency updates like global themes or active user sessions, but unsuitable for high-frequency state updates like keystroke inputs.

**Performance: `React.memo`, Code Splitting, Preventing Unnecessary Re-renders**
`React.memo(Component)` wraps functional components, skipping re-renders when props remain shallowly equal. "Unnecessary re-renders" occur when components execute render logic despite output state remaining unchanged, consuming CPU cycles — typically triggered when parent re-renders trigger automatic child cascade renders. Code splitting (`React.lazy(() => import('./Page'))` + `<Suspense>`) splits JS bundles into smaller chunks loaded on-demand as users navigate routes, improving initial page load performance.

**Testing: Jest + React Testing Library (RTL), Behavior-driven Testing**
Jest serves as the test runner and assertion framework (`expect(x).toBe(y)`); React Testing Library (RTL) renders components into a virtual DOM, enabling user-centric assertions (`screen.getByText('Add')`, `fireEvent.click(...)`). RTL's core philosophy prioritizes testing "what the user sees and does" over implementation details (such as internal state hooks) — ensuring tests do not break during code refactoring as long as external behavior remains intact.

**Stricter TypeScript: Generics, Unions / Discriminated Unions**
Generics (`function first<T>(arr: T[]): T`) enable reusable functions/types across data models while maintaining strict type-safety (unlike `any`, which disables type checking). Unions (`string | number`) represent values that can take one of several types. Discriminated unions use a shared literal property allowing TypeScript to narrow types across conditional branches:
`{ status: 'loading' } | { status: 'error', message: string } | { status: 'success', data: Todo[] }` — checking `status === 'error'` allows TypeScript to infer that `message` is guaranteed to exist.

**SSR / CSR / SSG, Web Vitals**
CSR (Client-Side Rendering): browsers download empty HTML shells and execute client JS to construct DOM trees (e.g., `fe-vite`) — fast subsequent interactions, but slower initial page loads and poor SEO indexability. SSR (Server-Side Rendering): servers pre-render HTML with populated data before transmission, followed by client JS hydration — yielding faster first-contentful-paint and superior SEO. SSG (Static Site Generation): HTML pages are pre-built at deploy time as static assets — yielding maximum speed, but lacks real-time data reactivity. Web Vitals: LCP (Largest Contentful Paint — load timing of main page elements), CLS (Cumulative Layout Shift — visual layout stability), INP (Interaction to Next Paint — responsiveness latency).

## Backend

**REST API Design: Pagination, Filtering, Sorting, Versioning**
Pagination breaks large query result sets into pages (`?page=2&limit=20`) — implemented as offset (`OFFSET/LIMIT`, simple but degrades on deep page numbers) or cursor-based pagination (using previous page tail record IDs as seek pointers, performing efficiently on large datasets). Filtering and sorting query strings empower clients to request customized data subsets. Versioning (`/api/v1/todos`) provides breaking-change isolation across client ecosystem updates.

**Advanced SQL: `EXPLAIN`/`EXPLAIN ANALYZE`, Composite Indexes, N+1 Queries, Transactions**
`EXPLAIN <query>` displays Postgres execution query plans (index scanning vs sequential table scans) WITHOUT executing statements; `EXPLAIN ANALYZE` executes queries to measure exact stage execution durations. Composite indexes (multi-column indexes, e.g., `(user_id, completed)`) optimize multi-condition filtering queries — column order matters (an index on `(a, b)` services queries filtering by `a`, but cannot optimize standalone queries filtering only by `b`). N+1 query bugs occur when applications make 1 query for a parent list and subsequently trigger N individual queries for each child row (e.g., fetching 100 todos followed by 100 individual category queries) instead of executing a single unified `JOIN`. Transactions (`BEGIN...COMMIT`/`ROLLBACK`) guarantee atomicity — ensuring failure at any intermediate stage rolls back all preceding writes.

**Auth: JWT vs Session Tradeoffs, Refresh Rotation, Revocation**
JWT (stateless): servers hold no session state, validating cryptographic signatures independently — facilitating horizontal scaling, but complicating immediate token revocation before expiration (unless backed by blacklists). Session (stateful): servers persist session records (e.g., Postgres via `connect-pg-simple`) — enabling instant revocation by destroying session records, but requiring database lookup checks per request and shared session stores across scaled instances. Refresh token rotation: utilizing a refresh token to request new access tokens immediately invalidates the used refresh token and issues a new pair — if a token is stolen and used by an attacker, subsequent requests by the legitimate owner fail (due to token invalidation), triggering automatic reuse detection flags. See [`src/services/auth.service.ts`](../../be-node-express/src/services/auth.service.ts).

**Testing: Service Layer Unit Tests (Mock Repositories), Integration Tests (`supertest`)**
Service unit tests validate core domain logic in isolation from databases — mocking repository return values to maintain rapid, deterministic execution. Integration tests using `supertest` send HTTP requests directly to Express application instances (spawning ephemeral servers), verifying end-to-end routing → middleware → controller → database integration (typically against isolated test databases reset between test runs).

**Versioned Database Migrations**
Moving beyond static SQL files (`init.sql`), migration frameworks track schema evolution via sequential files (`0001_init.sql`, `0002_add_priority.sql`), providing explicit `up` (apply) and `down` (rollback) paths. This enables schema change code reviews via pull requests, zero-downtime database migrations, and safe rollbacks during failed deployments.

**Basic Caching: Redis, Cache Invalidation**
Redis acts as an in-memory key-value store providing high-speed read/write performance compared to disk-bound PostgreSQL queries. Used for read-heavy/write-light endpoints (e.g., `/api/todos/stats`), computing initial aggregates from Postgres and storing results in Redis with time-to-live (TTL) expiration. Cache invalidation requires purging/updating cached data whenever underlying todo entries mutate, ensuring stale metrics are never served.

## DevOps

**Multi-stage Docker Build**
Utilizing multiple `FROM` stages inside a single `Dockerfile` — an initial `builder` stage installs complete `devDependencies` and compiles TypeScript to JavaScript; the final stage copies compiled `dist/` outputs via `COPY --from=builder` and installs runtime dependencies via `npm install --only=production`. This yields lightweight production container images, reducing attack surface area.

**Realistic CI Pipeline: Lint + Type-check + Test, Dependency Caching**
Basic "build checks" (`npm run build`) only detect syntax and type errors, missing runtime logic failures (requiring unit tests) and style inconsistencies (requiring linters). Robust CI pipelines run `eslint`, `tsc --noEmit`, and `npm test` sequentially. Dependency caching (`actions/cache` keyed on `package-lock.json`) persists `node_modules` across pipeline runs, speeding up workflow execution time.

**Environmental Config Separation**
Dev, staging, and production environments require isolated database credentials, secrets, and feature flags — sharing `.env` files introduces operational risk (e.g., staging tests accidentally dropping production databases). Best practice enforces isolated environment variables via CI secrets or dedicated secrets managers, reserving `.env` files exclusively for local development.

**Health Check Endpoints and `HEALTHCHECK`**
`GET /health` endpoints return standard `200 OK` statuses indicating service availability to external load balancers and orchestrators. Dockerfile `HEALTHCHECK` instructions execute periodic health checks inside containers to flag instances as healthy/unhealthy — empowering orchestrators to route traffic safely or restart unhealthy containers automatically.

## Security

**JWT Best Practices: Short-lived Access Tokens, Refresh Rotation, Externalized Secrets**
Short access token lifetimes (e.g., 15 minutes) limit vulnerability exposure windows if tokens are intercepted; refresh tokens paired with rotation mechanisms mitigate long-term replay risk. Cryptographic secrets must NEVER be hardcoded into source control repositories — requiring environment variable injection, with production environments enforcing strong, cryptographically random strings.

**Rate Limiting against Brute-Force Attacks**
Restricting request volume per IP/user within fixed time windows (e.g., 20 requests / 15 minutes on `/api/auth/login`) prevents automated dictionary brute-force attacks. See [`src/middleware/rateLimiter.ts`](../../be-node-express/src/middleware/rateLimiter.ts).

**OWASP Top 10 in Practice**
The OWASP Top 10 documents critical web application security risks. Key areas in CRUD applications include Injection (SQL injection), Broken Authentication (flawed session management, missing rate limits), and Sensitive Data Exposure (leaking password hashes in API responses, logging secrets). Practical application requires identifying and remediating specific vulnerability patterns within actual codebase implementations.

**Dependency Vulnerability Scanning**
Third-party dependencies (including transitive dependencies) may contain known vulnerabilities (CVEs). `npm audit` scans project dependency trees against vulnerability databases. Automated tools like Dependabot and Renovate continuously scan repositories and submit automated pull requests to patch vulnerable dependencies.

**CSRF and Session-based Authentication vs Header JWTs**
CSRF (Cross-Site Request Forgery) attacks exploit automatic browser cookie transmission to issue unauthorized requests from malicious sites to authenticated applications. Header-based JWT authentication requires explicit JavaScript header attachment, significantly mitigating CSRF risk. Session-based cookie authentication requires strict CSRF defenses such as `SameSite=Lax/Strict` cookie attributes and explicit anti-CSRF tokens.
