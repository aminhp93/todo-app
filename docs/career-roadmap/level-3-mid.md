# Level 3 — Middle

> Tự trả lời từng gạch đầu dòng trước khi xem [đáp án/giải thích chi tiết](level-3-mid-answers.md).

## Frontend

**Yêu cầu**
- Quản lý server state đúng cách: React Query/TanStack Query hoặc SWR (thay
  vì tự `useEffect` + `useState` để fetch/cache/refetch).
- State management client phức tạp khi cần: Redux Toolkit, Zustand, hoặc
  Context API dùng đúng chỗ (biết khi nào Context gây re-render thừa).
- Performance: `React.memo`, code splitting (`React.lazy` + `Suspense`),
  hiểu re-render là gì và cách tránh re-render thừa.
- Testing: unit test component với Jest + React Testing Library (test theo
  hành vi người dùng, không test implementation detail).
- TypeScript chặt hơn: generic type cơ bản, union/discriminated union,
  không dùng `any` tùy tiện.
- Kiến thức nền SSR/CSR/SSG (Next.js `app router`), Web Vitals (LCP/CLS/INP)
  ở mức khái niệm.

**Keywords**: React Query, cache invalidation, optimistic update, Redux
Toolkit slice, Zustand store, code splitting, `React.memo`, discriminated
union, hydration, Web Vitals, accessibility (a11y) — `aria-*`, focus
management.

**Áp dụng vào `todo-app`**: **CHƯA có** ở `fe-vite`/`fe-nextjs` hiện tại —
cả hai đều tự quản lý fetch bằng `useState`/`useEffect` thô, không có
React Query, không có test nào. Đây là phần gap rõ nhất để luyện Level 3
FE: refactor 1 trong 2 frontend sang dùng TanStack Query cho
`GET/POST/PATCH/DELETE /api/todos`, thêm optimistic update khi toggle
`completed`, và viết vài test RTL cho `TodoList`.

## Backend

**Yêu cầu**
- Thiết kế REST API chuẩn: pagination, filtering, sorting, versioning
  (`/api/v1`).
- SQL nâng cao: đọc hiểu `EXPLAIN`/`EXPLAIN ANALYZE`, biết khi nào cần
  composite index, nhận diện được N+1 query, transaction với rollback khi
  lỗi giữa chừng.
- Auth: so sánh được trade-off JWT (stateless) vs session (stateful), JWT
  refresh token rotation, revoke token khi logout.
- Testing: unit test service layer (mock repository), integration test API
  bằng `supertest` chạy trên DB test riêng.
- Migration tool có version (Knex/Prisma/TypeORM migrations) thay vì 1 file
  `init.sql` chạy 1 lần.
- Caching cơ bản: Redis cho dữ liệu đọc nhiều/ghi ít, cache invalidation khi
  update.

**Keywords**: pagination cursor vs offset, composite index, `EXPLAIN
ANALYZE`, N+1 query, refresh token rotation, `supertest`, test database,
migration up/down, Redis, cache invalidation, idempotency key.

**Áp dụng vào `todo-app`**: `be-node-express` hiện đã đạt: pagination/
filtering/sorting (`GET /api/todos`), composite index đã verify bằng
`EXPLAIN` (xem [GUIDE.md](../../be-node-express/GUIDE.md#sql)), JWT refresh
rotation + revoke, JOIN + aggregate query (`/api/todos/stats`), và session
auth song song để so sánh trade-off. **Còn thiếu để chắc Level 3**:
- Không có test nào (`npm test` không tồn tại) — đây là gap lớn nhất.
- Dùng `init.sql` chạy 1 lần qua Docker entrypoint, không phải migration có
  version/rollback (thử thêm Prisma hoặc `node-pg-migrate`).
- Chưa có caching layer (Redis) — `GET /api/todos/stats` là ứng viên tốt để
  cache theo `userId`, invalidate khi có todo thay đổi.
- Chưa có API versioning.

## DevOps

**Yêu cầu**
- Multi-stage Docker build để giảm image size (build stage tách khỏi
  runtime stage, không mang `devDependencies`/source TS vào image production).
- CI pipeline thực tế: chạy lint + type-check + test (không chỉ build),
  cache `node_modules`/npm cache giữa các run để giảm thời gian CI.
- Tách biệt config theo môi trường (dev/staging/prod) rõ ràng — không copy
  cùng 1 file `.env` giữa các môi trường.
- Health check endpoint (`/health`) và biết dùng nó cho container
  orchestrator (`HEALTHCHECK` trong Dockerfile, hoặc readiness probe).

**Keywords**: multi-stage build, Docker layer caching, CI cache
(`actions/cache`), `HEALTHCHECK`, environment parity, container registry.

**Áp dụng vào `todo-app`**: [`be-node-express/Dockerfile`](../../be-node-express/Dockerfile)
đã là multi-stage (builder tách khỏi runtime, `npm install --only=production`
ở stage cuối) — giải thích được vì sao stage cuối không cần TypeScript hay
`devDependencies` là đạt yêu cầu. **Còn thiếu**: `.github/workflows/ci.yml`
hiện chỉ `npm install && npm run build` (build check), CHƯA chạy lint, chưa
chạy test (vì `be-node-express` chưa có test — xem
[gap-analysis.md](gap-analysis.md)), chưa cache `node_modules` giữa các run,
và chưa có `HEALTHCHECK` trong Dockerfile dù endpoint `/health` đã tồn tại
trong [`src/app.ts`](../../be-node-express/src/app.ts).

## Security

**Yêu cầu**
- JWT best practices: access token sống ngắn, refresh token rotation +
  revoke khi phát hiện reuse (chống replay attack), không lưu JWT secret
  hardcode trong source.
- Rate limiting cho endpoint nhạy cảm (login/register) để chống brute-force.
- Hiểu và áp dụng được vài mục trong OWASP Top 10 (Injection, Broken
  Authentication, Sensitive Data Exposure) chứ không chỉ biết tên.
- Dependency vulnerability scanning: `npm audit`, Dependabot/Renovate tự
  động tạo PR khi có CVE.
- Biết CSRF là gì và vì sao session-based auth cần quan tâm tới nó nhiều
  hơn JWT qua header.

**Keywords**: refresh token rotation, replay attack, rate limiting, OWASP
Top 10, `npm audit`, Dependabot, CSRF, `SameSite` cookie.

**Áp dụng vào `todo-app`**: [`src/services/auth.service.ts`](../../be-node-express/src/services/auth.service.ts)
đã implement refresh token rotation + reuse detection (token cũ bị revoke
ngay khi dùng để lấy token mới) — test lại bằng cách gọi `/api/auth/refresh`
2 lần với cùng 1 refresh token, lần 2 phải trả `401`.
[`src/middleware/rateLimiter.ts`](../../be-node-express/src/middleware/rateLimiter.ts)
giới hạn 20 request/15 phút cho `/api/auth/*`. **Còn thiếu**: chạy
`npm audit` trong `be-node-express` hiện báo 3 lỗ hổng transitive
(`@apollo/server`, `brace-expansion`, `uuid`) chưa được xử lý hay theo dõi;
chưa có Dependabot/Renovate config; cookie session dùng `sameSite: 'lax'`
(đúng hướng chống CSRF) nhưng chưa giải thích rõ trong code vì sao không
dùng `'strict'`.

## Cách tự kiểm tra đã qua Level 3

Bạn tự thiết kế được schema có transaction đúng (vd: chuyển tiền giữa 2 tài
khoản), viết được test giả lập request thật (supertest) mà không cần chạy
tay bằng curl, giải thích được vì sao offset pagination chậm ở trang sau
với bảng lớn (và cursor pagination giải quyết ra sao), tự viết được CI chạy
test thật (không chỉ build), và giải thích được refresh token rotation
chống lại kiểu tấn công gì.
