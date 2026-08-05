# Level 1 — Fresher / Intern

> Self-answer each bullet point before viewing the [answers/detailed explanation](level-1-fresher-answers.md).

## Frontend

**Requirements**
- Semantic HTML tags, basic CSS (box model, Flexbox).
- JavaScript fundamentals: `var/let/const`, data types, array/object methods (`map/filter/reduce` at a reading comprehension level), standard functions vs arrow functions.
- Basic React: component, props, `useState`, simple `useEffect` (no deep understanding of dependency arrays needed).
- Basic API calls using `fetch`/`axios`, displaying basic loading/error states.
- Basic Git usage: `clone/add/commit/push/pull`, creating branches.

**Keywords**: DOM, JSX, Virtual DOM (conceptual understanding), npm/yarn, ES6, component tree, controlled input, `console.log` debugging.

**Application in `todo-app`**: [`fe-vite/src/App.tsx`](../../fe-vite/src/App.tsx) represents this level — one single large component, `useState` managing the todos list, `fetch` calls to the backend, no complex state management or child component extraction. Being able to read and explain every line in that file means you have reached Level 1 FE.

## Backend

**Requirements**
- Ability to write a simple Express CRUD REST API (direct route handler, no layer separation required yet).
- Basic SQL: `SELECT/INSERT/UPDATE/DELETE`, `WHERE` clause, understanding what a Primary Key is.
- Understanding which HTTP method is used for what (`GET/POST/PATCH/DELETE`), and basic status code meanings (`200/201/400/404/500`).
- Reading/writing environment variables via `.env`.

**Keywords**: HTTP method, status code, JSON, request/response, `.env`, connection string, `pg`/`mysql2` driver.

**Application in `todo-app`**: The original version (before refactoring in this session) of `be-node-express/src/index.ts` — all logic in a single file, no controller/service separation, no auth, a single `todos` table — is a classic Level 1 BE pattern. View git history (`git log -p -- be-node-express/src/index.ts`) to see that original version.

## DevOps

**Requirements**
- Basic Docker usage: `docker build`, `docker run`, `docker ps`, `docker logs`, understanding the difference between an image and a container.
- Ability to read and understand a simple `Dockerfile` (no multi-stage builds needed yet).
- Understanding why `docker-compose up` is used to run multiple services simultaneously.

**Keywords**: image, container, `Dockerfile`, `docker-compose`, port mapping, volume (conceptual understanding).

**Application in `todo-app`**: Running [`docker-compose.yml`](../../docker-compose.yml) via `docker compose up -d db` and explaining why `db` must be "Up" before `be-node-express` can connect — this is Level 1 DevOps.

## Security

**Requirements**
- Knowing NEVER to store passwords in plaintext (proper hashing techniques not required yet).
- Knowing NEVER to commit `.env`/secrets files to Git.
- Knowing what HTTPS is and how it conceptually differs from HTTP.

**Keywords**: plaintext password (knowing it's wrong), `.gitignore`, HTTPS vs HTTP.

**Application in `todo-app`**: [`be-node-express/.gitignore`](../../be-node-express/.gitignore) already ignores `.env` — explaining why this file should not be uploaded to Git (it contains actual `JWT_ACCESS_SECRET`, `DATABASE_URL`) is sufficient for Level 1 Security.

## How to Self-Check Level 1 Mastery

You can explain: what JSX compiles down to, why `useState` re-renders a component, the difference between `PATCH` and `PUT`, re-write an Express + `pg` CRUD route from scratch without looking at documentation, run the project's `docker-compose`, and explain why `.env` should not be committed to Git.
