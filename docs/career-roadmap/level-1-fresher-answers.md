# Level 1 — Answers / Detailed Explanations

This file explains **each bullet point** from the "Requirements" section of [level-1-fresher.md](level-1-fresher.md). Read both files in parallel: that file states "what you need to know", while this file answers "what it is, why it is needed, and concrete examples".

## Frontend

**Semantic HTML tags, basic CSS (box model, Flexbox)**
"Semantic" means using the correct tag according to the meaning of the content instead of using `<div>` for everything — tags like `<nav>`, `<header>`, `<button>`, `<ul><li>` help browsers, search engines, and screen readers understand the page structure without parsing CSS.

* **CSS Box Model:** The browser rule for calculating an element's total size:
  ```text
  +-------------------------------------------------+
  | Margin (Outer spacing)                          |
  |   +-----------------------------------------+   |
  |   | Border (Frame outline)                  |   |
  |   |   +---------------------------------+   |   |
  |   |   | Padding (Inner spacing)         |   |   |
  |   |   |   +-------------------------+   |   |   |
  |   |   |   | Content (Text / Images) |   |   |   |
  |   |   |   +-------------------------+   |   |   |
  |   |   +---------------------------------+   |   |
  |   +-----------------------------------------+   |
  +-------------------------------------------------+
  ```

* **Flexbox Layout:** A 1-dimensional layout model (`display: flex`) controlling row/column alignment:
  ```text
  flex-direction: row               flex-direction: column
  +-------+ +-------+ +-------+     +-------+
  | Item 1| | Item 2| | Item 3|     | Item 1|
  +-------+ +-------+ +-------+     +-------+
                                    | Item 2|
                                    +-------+
  ```

**JavaScript Fundamentals**
- `var` has function scope and exhibits strange hoisting behavior (accessible before declaration with an `undefined` value) — it should virtually never be used anymore.
- `let`/`const` have block scope (`{}`), which is safer; `const` prevents re-assigning the variable binding (though properties of objects/arrays inside can still be mutated).
- **Array Methods (`map`, `filter`, `reduce`):**
  ```javascript
  const numbers = [1, 2, 3, 4];

  // map: Transforms each element (same array length)
  const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8]

  // filter: Selects elements matching a condition
  const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

  // reduce: Aggregates array into a single result
  const sum = numbers.reduce((acc, n) => acc + n, 0); // 10
  ```
- **Arrow Functions vs Standard Functions:** Arrow functions (`() => {}`) do not have their own `this` binding — they inherit `this` from the enclosing lexical scope, unlike traditional `function` declarations which bind their own `this`.

**Basic React: component, props, `useState`, simple `useEffect`**
A component is a JavaScript function that returns JSX (the UI). Props are data passed down from a parent component to a child (read-only).

* **State & Re-render Cycle:**
  ```tsx
  function Counter() {
    const [count, setCount] = useState(0); // [currentValue, updateFunction]

    return (
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    );
  }
  ```
  ```text
  User Click ──> setCount(1) ──> React schedules render ──> UI updates with count = 1
  ```
* `useEffect(fn, [])` runs `fn` exactly once after the component finishes its initial render (useful for initial API data loading).

**Basic API calls using `fetch`/`axios`, loading/error states**
* **Comparison:**
  | Feature | `fetch()` | `axios` |
  | :--- | :--- | :--- |
  | **JSON Parsing** | Manual (`res.json()`) | Automatic (`res.data`) |
  | **HTTP Error Handling** | Resolves on 404/500 (must check `res.ok`) | Rejects automatically on non-2xx status |

* **Loading & Error State Pattern:**
  ```tsx
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setTodos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  ```

**Git Fundamentals**
```text
  Working Dir  ──(git add)──>  Staging Area  ──(git commit)──>  Local Repo  ──(git push)──>  Remote (GitHub)
```
- `clone`: Downloads remote repo.
- `branch`: Independent line of development to isolate features.

## Backend

**Writing a simple Express CRUD REST API**
CRUD = Create / Read / Update / Delete, mapping directly to HTTP methods `POST / GET / PATCH(or PUT) / DELETE`.
```typescript
import express from 'express';
const app = express();
app.use(express.json());

// Simple route handler interacting with database pool
app.get('/api/todos', async (req, res) => {
  const result = await db.query('SELECT * FROM todos');
  res.json(result.rows);
});
```

**Basic SQL**
* `SELECT cols FROM table WHERE condition` reads data.
* `INSERT INTO table (cols) VALUES (...)` inserts new rows.
* `UPDATE table SET col = val WHERE condition` updates matching rows.
* `DELETE FROM table WHERE condition` deletes matching rows.
* **Primary Key:** Unique identifier for each row (e.g., `id SERIAL PRIMARY KEY`).

**HTTP Methods & Status Codes**
* **HTTP Methods:**
  * `GET` (Read, Idempotent)
  * `POST` (Create, Non-idempotent)
  * `PATCH` (Partial Update)
  * `DELETE` (Remove, Idempotent)
* **Status Codes:**
  * `2xx` Success (`200 OK`, `201 Created`)
  * `4xx` Client Error (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`)
  * `5xx` Server Error (`500 Internal Server Error`)

**`.env`**
Stores application environment variables (`DATABASE_URL`, `PORT`) loaded at runtime via `dotenv.config()`, allowing dev/prod configuration changes without modifying source code.

## DevOps

**Basic Docker: `build`/`run`/`ps`/`logs`, image vs container**
* **Image vs Container:**
  ```text
  Dockerfile ──(docker build)──> Image (Blueprint / Class) ──(docker run)──> Container (Running Instance / Object)
  ```
* Commands: `docker build -t app .`, `docker run -p 3000:3000 app`, `docker ps`, `docker logs <container_id>`.

**Reading a simple `Dockerfile`**
```dockerfile
FROM node:18-alpine        # 1. Base image layer
WORKDIR /app               # 2. Set container working directory
COPY package*.json ./      # 3. Copy dependency manifests
RUN npm install            # 4. Execute build command (cached layer)
COPY . .                   # 5. Copy application source
CMD ["node", "index.js"]   # 6. Container startup command
```

**`docker-compose up` running multiple services**
Defines multi-container environments where services communicate over a shared virtual network using **service names** (e.g., `be-node-express` connects to Postgres via host `db`, not `localhost`).

## Security

**Never storing passwords in plaintext**
Database breaches reveal plaintext passwords instantly across user accounts. Proper hashing (`bcrypt`) is mandatory.

**Never committing `.env`/secrets to Git**
Git history is permanent. `.gitignore` must ignore `.env` files, committing only safe `.env.example` templates.

**HTTPS vs HTTP**
```text
HTTP:  Client ─── Plaintext ("password123") ───> Server (Vulnerable to Eavesdropping ⚠️)
HTTPS: Client ─── TLS Encrypted ("a8f#$1k!") ──> Server (Secure 🔒)
```
