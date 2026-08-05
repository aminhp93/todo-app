# Level 2 — Answers / Detailed Explanations

Explanations for each bullet point in [level-2-junior.md](level-2-junior.md).

## Frontend

**Understanding `useEffect` dependency arrays, avoiding infinite loops / stale closures**
The dependency array (`[a, b]` in `useEffect(fn, [a, b])`) instructs React: "only re-run `fn` when `a` or `b` changes". Passing an empty array `[]` = run once after initial render; omitting the array entirely = run after EVERY render (usually a bug). A classic infinite loop occurs when `useEffect` calls `setState`, and that state variable is included in the dependency array or causes a re-render that triggers the effect again. A "stale closure" happens when a function inside an effect captures variable values from the render scope when the effect was created rather than receiving updated values — caused by omitting that variable from the dependency array.

**Logical child component decomposition, typed props**
Decomposing a large single component into smaller subcomponents (e.g., `TodoList` rendering multiple `TodoItem` components) makes each part easier to test, reuse, and allows React to re-render only the affected sub-tree. Typed props (TypeScript `interface Props { title: string; onToggle: (id: number) => void }`) catch invalid prop types at compile-time rather than runtime.

**Form management: controlled inputs, basic validation**
A "controlled input" means the input value is driven by React state (`value={title} onChange={e => setTitle(e.target.value)}`) — React retains full control of current state, unlike "uncontrolled inputs" (where the DOM manages state, accessed via `ref` when submitted). Basic validation checks required fields (`title.trim() !== ''`) and max length (`title.length <= 255`) BEFORE making API calls to provide instant UI feedback without waiting for server errors.

**CSS framework (Tailwind), responsive design**
Tailwind provides utility classes applied directly within JSX (`className="flex gap-2 p-4"`) instead of writing separate CSS stylesheets — speeding up development without class-naming friction. Responsive/mobile-first design styles small mobile screens by default, using media breakpoint prefixes (`md:`, `lg:`) to adapt layouts for larger viewports — Tailwind enforces this mobile-first paradigm by design.

**`useMemo`/`useCallback`**
`useMemo(fn, deps)` recomputes a memoized value only when `deps` change — preventing expensive calculations on every render. `useCallback(fn, deps)` does the same specifically for FUNCTIONS (preserving referential equality across renders when `deps` remain unchanged) — essential when passing callbacks to child components optimized with `React.memo`, preventing unnecessary re-renders.

## Backend

**Basic architectural separation: routes → controller**
Routes define "which URL triggers which handler" (`router.get('/todos', todoController.list)`); controllers contain request/response processing logic. Decoupling routes from controllers keeps route definitions clean and readable (a plain list of endpoints) while keeping controllers independently testable and decoupled from URL paths.

**Input validation using libraries (`zod`/`joi`)**
Instead of manually writing `if (!title) return res.status(400)...`, declare a schema (`z.object({ title: z.string().min(1) })`) and invoke `schema.parse(body)` — automatically enforcing data contracts, throwing standardized validation errors, and avoiding unhandled input fields as APIs grow in complexity. See [`src/schemas/todo.schema.ts`](../../be-node-express/src/schemas/todo.schema.ts).

**Centralized error handling middleware**
Middleware functions `(req, res, next)` execute before or after route handlers. A centralized error handling middleware placed at the END of the Express pipeline (`app.use(errorHandler)`) catches all errors passed via `next(err)` or thrown from preceding routes/middlewares, formatting unified error JSON responses — replacing fragmented `try/catch` blocks scattered across routes. See [`src/middleware/errorHandler.ts`](../../be-node-express/src/middleware/errorHandler.ts).

**Basic Authentication: password hashing (`bcrypt`), JWT sign/verify**
`bcrypt.hash(password, saltRounds)` converts a password into a 1-way cryptographic hash (irreversible to the original password); `bcrypt.compare(input, hash)` validates user input without ever needing to know the original plaintext password. JWT (JSON Web Token) is a 3-part string `header.payload.signature` signed by the server using a secret key — clients store the token and attach it in the `Authorization: Bearer <token>` header on subsequent requests; the server verifies the cryptographic signature without querying the database for every single request.

**SQL: `JOIN`, Foreign Keys, `INDEX`**
`JOIN` combines rows from two or more tables based on a related column (e.g., `todos LEFT JOIN categories ON categories.id = todos.category_id`) — retrieving category names alongside todos in a single query. A Foreign Key is a constraint ensuring column values reference existing records in another table (e.g., `todos.category_id` must match a valid `id` in `categories`) — enforced automatically by the relational database engine. An Index is a secondary data structure (typically a B-tree) enabling fast lookup speeds for indexed columns, at the cost of additional storage overhead and slightly slower `INSERT`/`UPDATE` operations (since index trees must be updated).

## DevOps

**Writing a single-stage Node.js `Dockerfile`**
Minimal structure: `FROM node:18-alpine` → `WORKDIR /app` → `COPY package*.json ./` → `RUN npm install` → `COPY . .` → `CMD ["node", "index.js"]`. Copying `package*.json` BEFORE running `npm install` (rather than copying all source code first) allows Docker to leverage layer caching for `npm install` — if source code changes but dependencies remain unchanged, subsequent builds execute significantly faster by skipping dependency re-installation.

**`docker-compose.yml` for dependent services**
`depends_on: [db]` instructs Docker to start the `db` container before dependent application containers (note: it does NOT wait for PostgreSQL inside `db` to finish initialization and accept connections — which is why application code must implement retry logic). `networks` defines virtual bridge networks for container-to-container communication using service names; `volumes` persist stateful data across container lifecycles (e.g., `pgdata_dev` retains database storage even if containers are destroyed and recreated).

**Reading CI pipeline YAML files**
`on: push/pull_request` defines trigger conditions; each `job` runs independently (in parallel by default) on an isolated runner; `steps` within a job execute sequentially. `actions/checkout` fetches repository code into the runner context (a mandatory initial step required before subsequent steps can execute scripts).

## Security

**Proper password hashing and salt rounds**
A "salt" is a random string concatenated with a password prior to hashing, ensuring two users with identical passwords produce distinct hash values (protecting against pre-computed rainbow table attacks). `bcrypt` generates and embeds the salt directly inside the output hash string. "Salt rounds" (e.g., 12) determine the computational work factor — higher iterations increase security but consume more CPU time; 10–12 is the industry standard balance point.

**Parameterized queries and SQL injection**
Direct string concatenation (`` `SELECT * FROM users WHERE email = '${email}'` ``) allows attackers to inject input like `email = "' OR '1'='1"` to turn `WHERE` conditions into tautologies, leaking the entire database table. Parameterized queries (`pool.query('... WHERE email = $1', [email])`) separate SQL commands from untrusted parameter values — the database driver safely escapes input values so they are never executed as SQL code.

**CORS: `origin` vs `credentials`**
CORS (Cross-Origin Resource Sharing) is a browser security mechanism restricting cross-origin HTTP requests (e.g., from `localhost:5173` to `localhost:5001`) unless explicitly permitted by the target server via the `Access-Control-Allow-Origin` header. When requests include credentials/cookies (`credentials: true` on the client), servers MUST NOT specify a wildcard `origin: '*'` — browsers will reject the response; servers must explicitly match specific origins (or dynamically reflect allowed origins as done in [`src/app.ts`](../../be-node-express/src/app.ts)).

**XSS and output escaping**
XSS (Cross-Site Scripting) occurs when attackers inject malicious `<script>` tags or raw HTML payload into application data, which is subsequently rendered directly by victim browsers (e.g., a todo title containing `<script>steal cookie</script>`). React automatically escapes values rendered inside JSX `{}` (converting `<` into `&lt;`) — risk only arises when explicitly invoking `dangerouslySetInnerHTML`.

## Practical Self-Study Guide

Cover the detailed answer sections, review only the requirement titles in `level-2-junior.md`, and speak out (or write down) your explanations before referencing this answer guide to verify accuracy.
