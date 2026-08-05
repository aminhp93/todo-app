# Level 3 — Answers / Detailed Explanations

Explanations for each bullet point in [level-3-mid.md](level-3-mid.md).

## Frontend

**React Query / TanStack Query or SWR vs manual `useEffect` + `useState`**
* **Data Flow Comparison:**
  ```text
  Manual useEffect: Component Mounts ──> trigger fetch() ──> Set Loading ──> Receive Data ──> Set State (No Cache)
  React Query:      Component Mounts ──> Check Cache ──(Hit)──> Serve Instant Data ──> Background Refetch
  ```
* **React Query Mutation & Cache Invalidation:**
  ```tsx
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

  function TodoList() {
    const queryClient = useQueryClient();

    // 1. Automatic fetching, caching, deduplication & refetching
    const { data: todos, isLoading } = useQuery({
      queryKey: ['todos'],
      queryFn: fetchTodos,
    });

    // 2. Mutations with cache invalidation
    const addTodoMutation = useMutation({
      mutationFn: createTodo,
      onSuccess: () => {
        // Automatically refetches 'todos' query to update UI seamlessly
        queryClient.invalidateQueries({ queryKey: ['todos'] });
      },
    });
  }
  ```

**Client State Management: Redux Toolkit, Zustand, Context API**
| Library | Use Case | Re-render Scope | Boilerplate Level |
| :--- | :--- | :--- | :--- |
| **Context API** | Global static state (Theme, User Session) | Re-renders **ALL** consuming child components on update | Low |
| **Zustand** | Small-to-medium client state | Selective subscription (re-renders only changed state slice) | Low |
| **Redux Toolkit** | Large enterprise complex client state | Selective subscription via selectors + Time-travel debugging | Medium |

**Performance: `React.memo`, Code Splitting, Preventing Unnecessary Re-renders**
* **Code Splitting with `React.lazy` + `Suspense`:**
  ```tsx
  import { lazy, Suspense } from 'react';

  // Loads Analytics Dashboard bundle chunk ONLY when route rendered
  const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

  function App() {
    return (
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <AnalyticsDashboard />
      </Suspense>
    );
  }
  ```

**Testing: Jest + React Testing Library (RTL), Behavior-driven Testing**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from './TodoList';

test('adds a new todo when form submitted', async () => {
  render(<TodoList />);

  // User-centric querying (Behavior over implementation)
  const input = screen.getByPlaceholderText('Add new todo');
  const button = screen.getByRole('button', { name: /add/i });

  fireEvent.change(input, { target: { value: 'Buy Milk' } });
  fireEvent.click(button);

  // Assert user-visible DOM output
  expect(await screen.findByText('Buy Milk')).toBeInTheDocument();
});
```

**Stricter TypeScript: Generics, Unions / Discriminated Unions**
* **Discriminated Union Type Narrowing:**
  ```typescript
  type State =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: Todo[] };

  function renderUI(state: State) {
    switch (state.status) {
      case 'error':
        // TypeScript automatically narrows state to include `message`
        return <p>Error: {state.message}</p>;
      case 'success':
        // TypeScript automatically narrows state to include `data`
        return <p>Loaded {state.data.length} todos</p>;
    }
  }
  ```

**SSR / CSR / SSG, Web Vitals**
```text
CSR (Client-Side): Download Empty HTML ──> Load Bundle JS ──> Execute & Render (Slower FCP)
SSR (Server-Side): Request ──> Server Renders HTML with Data ──> Fast FCP ──> Hydrate JS
SSG (Static Site): Build-time HTML Generation ──> Served via CDN (Instant Load)
```

## Backend

**REST API Design: Pagination, Filtering, Sorting, Versioning**
* **Offset vs Cursor Pagination:**
  ```sql
  -- Offset Pagination (Slow on deep pages: scans & drops 1,000,000 rows first)
  SELECT * FROM todos ORDER BY id LIMIT 20 OFFSET 1000000;

  -- Cursor Pagination (Fast index lookup: seeks directly after last seen ID)
  SELECT * FROM todos WHERE id > 1000000 ORDER BY id LIMIT 20;
  ```

**Advanced SQL: `EXPLAIN`/`EXPLAIN ANALYZE`, Composite Indexes, N+1 Queries, Transactions**
* **N+1 Query Problem:**
  ```text
  1 Query:  SELECT * FROM todos; -- Returns 100 items
  N Queries: SELECT * FROM categories WHERE id = 1; (Repeated 100 times!)
  Solution:  SELECT todos.*, categories.name FROM todos LEFT JOIN categories ON categories.id = todos.category_id;
  ```
* **Database Transactions (`BEGIN...COMMIT`/`ROLLBACK`):**
  ```typescript
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE accounts SET balance = balance - 100 WHERE id = $1', [fromId]);
    await client.query('UPDATE accounts SET balance = balance + 100 WHERE id = $2', [toId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK'); // Atomic rollback on failure
  } finally {
    client.release();
  }
  ```

**Auth: JWT vs Session Tradeoffs, Refresh Rotation, Revocation**
* **Refresh Token Rotation & Reuse Detection Sequence:**
  ```text
  Client                 Server                 Database
    │                       │                       │
    ├─── Use Refresh R1 ───>│ Check R1 status       │
    │                       ├─── Is R1 active? ────>│ Yes
    │                       │                       │
    │<── Return R2 + A2 ────┼─── Revoke R1 ────────>│ Mark R1 Used (Issue R2)
    │                       │                       │
  [ ATTACKER RE-USES R1 ]   │                       │
    ├─(Attacker) Use R1 ───>│ Check R1 status       │
    │                       ├─── Is R1 active? ────>│ NO! Already Used (REUSE DETECTED ⚠️)
    │                       │                       │
    │<── Return 401 ────────┼─── REVOKE ALL ───────>│ Invalidate R1, R2, R3 (Token Family Revoked)
  ```

**Testing: Service Layer Unit Tests (Mock Repositories), Integration Tests (`supertest`)**
```typescript
import request from 'supertest';
import { buildApp } from '../src/app';

describe('GET /api/todos', () => {
  it('returns 200 OK with todo array', async () => {
    const app = await buildApp();
    const response = await request(app)
      .get('/api/todos')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
  });
});
```

**Versioned Database Migrations**
Tracks schema changes in ordered files (`0001_init.sql`, `0002_add_priority.sql`) with explicit `up` and `down` scripts.

**Basic Caching: Redis, Cache Invalidation**
```text
Client Request ──> API Server ──> Check Redis Cache ──(Hit)──> Return Cached JSON
                                      │
                                   (Miss)
                                      ▼
                             Query PostgreSQL ──> Write to Redis (TTL 60s) ──> Return JSON
```

## DevOps

**Multi-stage Docker Build**
```dockerfile
# Stage 1: Build & Compile TypeScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # Produces compiled /app/dist

# Stage 2: Production Runtime (Omits devDependencies & TS compiler)
FROM node:18-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist  # Stripped production artifact
CMD ["node", "dist/index.js"]
```

**Realistic CI Pipeline: Lint + Type-check + Test, Dependency Caching**
```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      - run: npm ci
      - run: npm run lint        # Step 1: ESLint code format check
      - run: npx tsc --noEmit    # Step 2: TypeScript type-check
      - run: npm test            # Step 3: Run Jest/Vitest automated test suite
```

**Health Check Endpoints and `HEALTHCHECK`**
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1
```

## Security

**JWT Best Practices: Short-lived Access Tokens, Refresh Rotation, Externalized Secrets**
Short access tokens (e.g. 15 min) + Refresh rotation (e.g. 7 days). Store secrets strictly in environment variables (`process.env.JWT_SECRET`), failing fast if unconfigured.

**Rate Limiting against Brute-Force Attacks**
```typescript
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                  // Limit each IP to 20 requests per window
  message: { error: 'Too many login attempts, please try again later' },
});
```

**CSRF and Session-based Authentication vs Header JWTs**
```text
Cross-Site Request Forgery (CSRF):
User logged into Bank.com ──> Visits EvilSite.com ──> EvilSite triggers <form action="Bank.com/transfer">
                             Browser AUTO-ATTACH_COOKIE ──> Bank Server processes unauthorized transfer!
Mitigation: SameSite=Lax/Strict Cookies OR Anti-CSRF Tokens. Header-based JWTs ignore auto-cookies.
```
