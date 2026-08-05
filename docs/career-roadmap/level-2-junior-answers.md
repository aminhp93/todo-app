# Level 2 — Answers / Detailed Explanations

Explanations for each bullet point in [level-2-junior.md](level-2-junior.md).

## Frontend

**Understanding `useEffect` dependency arrays, avoiding infinite loops / stale closures**
The dependency array (`[a, b]` in `useEffect(fn, [a, b])`) instructs React: "only re-run `fn` when `a` or `b` changes".

* **Behavior Comparison:**
  * `useEffect(fn)` *(No array)* $\rightarrow$ Runs after **every** render (frequently an unintended bug).
  * `useEffect(fn, [])` *(Empty array)* $\rightarrow$ Runs **once** after initial render (on mount).
  * `useEffect(fn, [count])` *(With deps)* $\rightarrow$ Runs after initial render, and whenever `count` changes.

* **Visualizing an Infinite Loop:**
  ```tsx
  // ❌ BAD: Infinite Loop
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // 1. Triggers state update
  }, [count]);            // 2. `count` changed -> causes re-render -> effect executes again!
  ```
  ```text
  Render (count = 0) ──> useEffect runs ──> setCount(1)
         ▲                                      │
         └──────────────── Re-render ───────────┘ (Infinite Cycle 🔄)
  ```

* **Visualizing a Stale Closure:**
  ```tsx
  // ❌ BAD: Stale Closure
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Bug: `count` is captured from render 1 scope where count = 0.
      // Every 1s, it calculates 0 + 1 = 1, so `count` never increments past 1!
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Empty deps -> effect closure traps initial state (0)
  ```
  ```text
  Render 1 (count = 0) ──> Closure captures count = 0 ──> setInterval runs (0 + 1 = 1)
  Render 2 (count = 1) ──> useEffect skipped ([])   ──> setInterval STILL uses trapped count (0) ──> count stuck at 1!
  ```
  * **Fix:** Use a functional state updater `setCount(prev => prev + 1)` or add `count` to the dependency array.

**Logical child component decomposition, typed props**
Decomposing a large single component into smaller subcomponents (e.g., `TodoList` rendering multiple `TodoItem` components) makes each part easier to test, reuse, and allows React to re-render only the affected sub-tree.
```tsx
interface TodoItemProps {
  id: number;
  title: string;
  completed: boolean;
  onToggle: (id: number) => void;
}

export function TodoItem({ id, title, completed, onToggle }: TodoItemProps) {
  return (
    <div onClick={() => onToggle(id)}>
      <span style={{ textDecoration: completed ? 'line-through' : 'none' }}>{title}</span>
    </div>
  );
}
```

**Form management: controlled inputs, basic validation**
* **Controlled Input Flow:**
  ```text
  User types "A" ──> onChange event ──> setTitle("A") ──> React Re-renders ──> Input value = "A"
  ```
* **Client-side Validation Example:**
  ```tsx
  function AddTodoForm({ onAdd }: { onAdd: (title: string) => void }) {
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return setError('Title is required');
      if (title.length > 255) return setError('Title too long');
      onAdd(title);
      setTitle('');
    };

    return (
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} />
        {error && <span className="error">{error}</span>}
      </form>
    );
  }
  ```

**CSS framework (Tailwind), responsive design**
Tailwind provides utility classes applied directly within JSX (`className="flex gap-2 p-4"`). Mobile-first responsive design uses media query prefixes (`md:`, `lg:`) to scale layouts for larger screens:
```tsx
// Mobile default: flex-col (vertical) | Medium screens (md:): flex-row (horizontal)
<div className="flex flex-col md:flex-row gap-4 p-4">
  <div className="w-full md:w-1/2">Left Pane</div>
  <div className="w-full md:w-1/2">Right Pane</div>
</div>
```

**`useMemo`/`useCallback`**
* `useMemo`: Memoizes expensive computation outputs.
* `useCallback`: Preserves function reference identity across renders for child components wrapped in `React.memo`.

## Backend

**Basic architectural separation: routes → controller**
Decoupling endpoint registration from request processing logic:
```text
HTTP Request (GET /api/todos) ──> Express Router ──> TodoController.getTodos() ──> Response
```
* `todo.routes.ts`: `router.get('/todos', todoController.getTodos);`
* `todo.controller.ts`:
  ```typescript
  export const getTodos = async (req: Request, res: Response) => {
    const todos = await todoService.findAll();
    res.json(todos);
  };
  ```

**Input validation using libraries (`zod`/`joi`)**
Declarative validation schemas replace manual `if (!title)` checks:
```typescript
import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  completed: z.boolean().optional().default(false),
});

// Inside middleware / handler:
const validatedBody = createTodoSchema.parse(req.body); // Throws ZodError if invalid
```

**Centralized error handling middleware**
```text
Route Handler ──(throw error / next(err))──> Error Handling Middleware ──> Uniform JSON Error
```
```typescript
// Registered at the very END of Express middleware chain:
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});
```

**Basic Authentication: password hashing (`bcrypt`), JWT sign/verify**
* **JWT Structure:**
  ```text
  eyJhbGciOi... . eyJzdWIiOi... . ZmRzYWYx...
  [ Header ]     . [ Payload ]   . [ Signature ]
  (Alg & Type)    (User Claims)    (HMAC Secret Verification)
  ```
* Clients store JWT and include it in requests: `Authorization: Bearer <token>`.

**SQL: `JOIN`, Foreign Keys, `INDEX`**
* **SQL `JOIN` Data Combination:**
  ```sql
  SELECT todos.id, todos.title, categories.name AS category
  FROM todos
  LEFT JOIN categories ON categories.id = todos.category_id;
  ```
* **Foreign Key:** `todos.category_id REFERENCES categories(id) ON DELETE CASCADE`.
* **Database Index (B-Tree):** Secondary index structure speeding up `WHERE` lookups from $O(N)$ sequential table scans to $O(\log N)$.

## DevOps

**Writing a single-stage Node.js `Dockerfile`**
Docker layer caching mechanism relies on `COPY package*.json` order:
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Step 1: Copy dependency manifests FIRST (Layer cached if lockfile unchanged)
COPY package*.json ./
RUN npm install

# Step 2: Copy source files AFTER (Invalidates only source layer when code changes)
COPY . .
CMD ["node", "index.js"]
```

**`docker-compose.yml` for dependent services**
```yaml
services:
  db:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
  backend:
    build: .
    depends_on:
      - db # Starts 'db' container before 'backend'
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/tododb

volumes:
  pgdata: # Named volume for persistent database storage
```

**Reading CI pipeline YAML files**
Pipeline triggers execute sequential steps inside isolated runners:
```yaml
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3  # Step 1: Fetch repository code
      - uses: actions/setup-node@v3 # Step 2: Install Node runtime
      - run: npm ci                 # Step 3: Install dependencies
      - run: npm run build          # Step 4: Execute build script
```

## Security

**Proper password hashing and salt rounds**
```text
Plaintext Password + Random Salt ──(bcrypt iterations)──> Unique One-Way Hash Output
```
Salt rounds (e.g., `12`) specify $2^{12} = 4096$ hashing iterations, slowing down brute-force rainbow table dictionary attacks.

**Parameterized queries and SQL injection**
* **❌ Vulnerable String Concatenation:**
  ```typescript
  // Input: email = "' OR '1'='1"
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  // Resulting SQL: SELECT * FROM users WHERE email = '' OR '1'='1' (Returns entire DB!)
  ```
* **✅ Parameterized Query:**
  ```typescript
  const query = 'SELECT * FROM users WHERE email = $1';
  await pool.query(query, [email]); // Input safely escaped by PostgreSQL driver
  ```

**CORS: `origin` vs `credentials`**
| Header Configuration | Wildcard (`origin: '*'`) | Specific Origin (`origin: 'http://localhost:5173'`) |
| :--- | :--- | :--- |
| **`credentials: false`** | ✅ Allowed | ✅ Allowed |
| **`credentials: true`** *(Cookies/Auth)* | ❌ **Rejected by Browsers** | ✅ Allowed |

**XSS and output escaping**
React automatically escapes HTML strings rendered inside JSX `{}`:
```tsx
const userBio = "<script>alert('XSS Attack')</script>";
return <div>{userBio}</div>; // Renders safely as plaintext: &lt;script&gt;...&lt;/script&gt;
```

## Practical Self-Study Guide

Cover the detailed answer sections, review only the requirement titles in `level-2-junior.md`, and speak out (or write down) your explanations before referencing this answer guide to verify accuracy.
