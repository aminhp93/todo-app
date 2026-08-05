# Level 1 — Answers / Detailed Explanations

This file explains **each bullet point** from the "Requirements" section of [level-1-fresher.md](level-1-fresher.md). Read both files in parallel: that file states "what you need to know", while this file answers "what it is, why it is needed, and concrete examples".

## Frontend

**Semantic HTML tags, basic CSS (box model, Flexbox)**
"Semantic" means using the correct tag according to the meaning of the content instead of using `<div>` for everything — tags like `<nav>`, `<header>`, `<button>`, `<ul><li>` help browsers, search engines, and screen readers understand the page structure without parsing CSS.
The box model is the browser rule for calculating an element's size: `content + padding + border + margin`. Flexbox is a 1-dimensional layout model (rows or columns) using `display: flex` — replacing old manual centering/spacing methods using `float`/`position`.

**JavaScript Fundamentals**
- `var` has function scope and exhibits strange hoisting behavior (accessible before declaration with an `undefined` value) — it should virtually never be used anymore.
- `let`/`const` have block scope (`{}`), which is safer; `const` prevents re-assigning the variable binding (though properties of objects/arrays inside can still be mutated).
- `map` returns a new array of the same length (transforming each element), `filter` returns a subarray meeting a condition, `reduce` aggregates an array into a single value (total, object, etc.) — these 3 functions are fundamental for data processing without manual `for` loops.
- Arrow functions (`() => {}`) do not have their own `this` binding — they inherit `this` from the enclosing lexical scope, unlike traditional `function` declarations which bind their own `this`. This is why older class-based React components often had bugs when forgetting `.bind(this)`.

**Basic React: component, props, `useState`, simple `useEffect`**
A component is a JavaScript function that returns JSX (the UI). Props are data passed down from a parent component to a child, and are read-only (child components cannot mutate props).
`useState(initial)` returns `[value, setValue]` — calling `setValue` schedules React to re-render the component with the new `value`; state does not change synchronously. `useEffect(fn, deps)` runs `fn` after the component finishes rendering — used for side effects like API calls; at Level 1, you only need to know that `useEffect(fn, [])` runs exactly once after the initial render.

**Basic API calls using `fetch`/`axios`, loading/error states**
`fetch(url)` returns a Promise; you must call `.then(res => res.json())` to obtain the parsed data (step 1 only returns the HTTP response object, not the parsed body). `axios` simplifies this (`axios.get(url).then(res => res.data)`), automatically parses JSON, and automatically throws errors when the status is non-2xx (unlike `fetch`, which does not reject on 404/500). "Loading state" is a `boolean` tracking pending requests to show a spinner; "error state" captures error details to display notification messages instead of a blank white screen when an API call fails.

**Git Fundamentals**
`clone` downloads a repo locally; `add` stages files for commit; `commit` saves a snapshot with a message; `push` uploads commits to a remote repository; `pull` fetches new commits from the remote and merges them into the current branch. A branch is an independent line of development to work in parallel without affecting `main`.

## Backend

**Writing a simple Express CRUD REST API**
CRUD = Create/Read/Update/Delete, mapping directly to HTTP methods `POST/GET/PATCH(or PUT)/DELETE`. Express is an HTTP framework for Node.js: `app.get('/api/todos', (req, res) => {...})` registers a route handler function that receives `req` (request params, query, body) and `res` (to construct the response). At Level 1, the route handler interacts directly with the DB without separate layers.

**Basic SQL**
`SELECT cols FROM table WHERE condition` reads data; `INSERT INTO table (cols) VALUES (...)` inserts new rows; `UPDATE table SET col = value WHERE condition` updates data; `DELETE FROM table WHERE condition` deletes rows. **Always include a `WHERE` clause when using `UPDATE`/`DELETE`** — omitting `WHERE` applies the operation to the ENTIRE table.
A Primary Key is a column (or composite columns) that uniquely identifies a row — in `todo-app`, `todos.id SERIAL PRIMARY KEY` auto-increments and ensures uniqueness.

**HTTP Methods & Status Codes**
`GET` = read, does not modify data (idempotent — multiple identical requests yield the same result); `POST` = create, NOT idempotent (calling twice creates two records); `PATCH` = partial update; `PUT` = replace entire resource (less common than `PATCH` in practice); `DELETE` = remove resource.
Status codes: `2xx` success (`200` OK, `201` Created — used after successful `POST`); `4xx` client error (`400` malformed request, `401` unauthorized, `404` not found); `5xx` server error (`500` unexpected internal server error).

**`.env`**
A file containing environment variables (`DATABASE_URL`, `PORT`, ...) read at application runtime instead of hardcoding values in source code — allowing different configurations across dev, CI, and production **without changing code**. The `dotenv` library loads `.env` variables into `process.env` when calling `dotenv.config()`.

## DevOps

**Basic Docker: `build`/`run`/`ps`/`logs`, image vs container**
An image is an immutable snapshot (filesystem + config) built from a `Dockerfile` — akin to a "class". A container is a running instance of that image — akin to an "object" instantiated from that class. `docker build -t name .` builds an image; `docker run name` runs a container from the image; `docker ps` lists running containers; `docker logs <container>` views container output/logs.

**Reading a simple `Dockerfile`**
Each instruction creates a "layer": `FROM node:18-alpine` sets the base image; `WORKDIR /app` sets the working directory inside the container; `COPY . .` copies source code into the image; `RUN npm install` executes commands during image BUILD (persisting results to the layer); `CMD [...]` specifies the default command executed when the container STARTS (unlike `RUN`, it executes every time the container starts and is not saved into the image layers).

**`docker-compose up` running multiple services**
`docker-compose.yml` defines multiple containers (e.g., `db`, `be-node-express`) and how they communicate over a shared network — services address each other by SERVICE NAME (e.g., `be-node-express` connects to the database via host `db`, not `localhost`) rather than hardcoded IP addresses.

## Security

**Never storing passwords in plaintext**
If a database is leaked/compromised, plaintext passwords expose every user account immediately. Since users frequently reuse passwords across sites, the security breach cascades to other services. At Level 1, you simply need to recognize **this is wrong**; proper hashing (`bcrypt`) is covered in Level 2.

**Never committing `.env`/secrets to Git**
Git preserves complete, permanent history — even if a secret file is deleted in a later commit, it remains in git history for anyone who clones the repo. `.gitignore` specifies files/directories Git should ignore when running `git add`; `.env` must always be ignored, committing only `.env.example` (containing variable names without real values).

**HTTPS vs HTTP**
HTTP transmits data in plaintext across networks — anyone capturing packets (e.g., on public Wi-Fi) can inspect all traffic, including credentials entered into login forms. HTTPS encrypts data via TLS before transmission — eavesdroppers only see encrypted cipher data, protecting sensitive contents.
