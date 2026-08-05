# Gap Analysis: `todo-app` hiện đang ở đâu?

Đánh giá thật (không tô hồng) dựa trên code hiện tại tại thời điểm viết
tài liệu này (2026-08). Dùng file này làm điểm bắt đầu, rồi tick dần khi
làm xong từng mục.

## Tóm tắt theo level

| Level | Trạng thái | Ghi chú |
| :--- | :--- | :--- |
| 1 — Fresher | ✅ Vượt xa | Bản gốc `be-node-express` từng ở đúng mức này |
| 2 — Junior | ✅ Vượt xa | Có tách layer, JWT, validation |
| 3 — Middle | 🟡 Đạt phần lớn | Thiếu test, migration tool, cache — xem chi tiết dưới |
| 4 — Senior | 🟠 Một phần | Có ADR-worthy decisions nhưng chưa viết ra; chưa có observability, queue |
| 5 — Staff | 🔴 Chưa | Cần artifact (RFC), không cần code thêm vào chính dự án |
| 6 — Consultant | 🔴 Chưa | Cần artifact (due diligence, build-vs-buy memo) |

## Tóm tắt theo mảng (track)

| Mảng | Level ước tính | Ghi chú |
| :--- | :--- | :--- |
| Backend | Middle (đầu Senior) | Layered, 2 auth pattern, SQL thật — thiếu test là rào cản chính lên Senior |
| Frontend | Junior | `fe-vite`/`fe-nextjs` chưa đổi từ baseline gốc, không theo kịp phần BE đã nâng cấp |
| DevOps | Junior (đầu Middle) | Multi-stage Docker + compose dev/prod tốt, nhưng CI chưa chạy test/lint, chưa `HEALTHCHECK` |
| Security | Middle | Password/JWT/rate-limit đúng cách, nhưng thiếu security headers, dependency scan, least-privilege DB user |

## Đã có (đáng kể để nói trong phỏng vấn)

- Kiến trúc layered rõ ràng: `routes → controllers → services →
  repositories` ([`be-node-express/src`](../../be-node-express/src)).
- Hai pattern auth chạy song song trên cùng 1 CRUD để so sánh trực tiếp:
  JWT (access + refresh rotation, revoke khi reuse) và session
  (`express-session` + `connect-pg-simple`, lưu trong Postgres).
- SQL thật: composite index đã verify bằng `EXPLAIN`, JOIN + `GROUP BY` +
  `FILTER` cho analytical endpoint (`/api/todos/stats`), parameterized query
  toàn bộ, whitelist cột `sortBy` để tránh SQL injection qua `ORDER BY`.
- REST API design: pagination/filtering/sorting, status code đúng chuẩn,
  rate limiting cho auth endpoints.
- Một bug thật đã tìm và fix: `authenticateSession` là async middleware
  không được wrap `asyncHandler` → unhandled rejection → crash process.
  Đây là chất liệu tốt cho postmortem (xem
  [level-4-senior.md](level-4-senior.md)).
- GraphQL dùng chung service/repository layer với REST, không duplicate
  logic.
- DevOps: multi-stage `Dockerfile` (build stage tách khỏi runtime), env
  tách biệt dev/prod, `docker-compose.prod.yml` dùng `${VAR:?...}` để
  fail-fast nếu thiếu secret production thay vì âm thầm dùng giá trị yếu.
- Security: `bcrypt` 12 salt rounds, parameterized query toàn bộ, refresh
  token rotation + reuse detection, rate limiting cho auth endpoints.

## Còn thiếu, theo thứ tự ưu tiên nên làm tiếp

1. **Automated tests (ưu tiên cao nhất)** — hiện tại `be-node-express`
   không có bất kỳ test nào (`package.json` không có script `test`). Đây là
   gap rõ nhất chặn bạn ở Level 3. Bắt đầu với:
   - Unit test cho `services/auth.service.ts` (mock repository).
   - Integration test bằng `supertest` cho `/api/auth/*` và `/api/todos`
     (dùng DB test riêng hoặc transaction rollback sau mỗi test).
2. **Migration tool có version** — hiện dùng 1 file `db/init.sql` chạy qua
   Docker entrypoint. Thêm `node-pg-migrate` hoặc Prisma để có `up/down`,
   review được qua PR như code.
3. **Caching layer** — `/api/todos/stats` là ứng viên tốt để thêm Redis
   cache theo `userId`, invalidate khi có todo thay đổi trong category đó.
4. **Observability tối thiểu** — thay `console.log`/`console.error` bằng
   structured logger (`pino`), thêm request ID để trace 1 request qua log.
5. **CI nâng cấp** — `.github/workflows/ci.yml` hiện chỉ build + docker
   build cho `be-node-express`, chưa chạy `tsc --noEmit`, chưa chạy test
   (vì chưa có), chưa có lint step riêng cho service này.
6. **Frontend theo kịp backend** — `fe-vite`/`fe-nextjs` gọi `/api/todos`
   không cần auth; sau khi thêm JWT vào `be-node-express`, 2 frontend này
   không còn gọi được backend đó qua UI (xem cảnh báo trong
   [`ARCHITECTURE.md`](../../ARCHITECTURE.md)). Thêm màn hình login đơn
   giản + lưu access token là bài tập tốt để luyện Level 3 FE (React Query +
   token trong memory/httpOnly refresh cookie).
7. **Artifact cấp Senior/Staff/Consultant** — 3 tài liệu gợi ý ở
   [level-4-senior.md](level-4-senior.md), [level-5-staff-lead.md](level-5-staff-lead.md),
   và [level-6-principal-consultant.md](level-6-principal-consultant.md):
   postmortem cho bug đã tìm thấy, RFC "hệ thống vỡ ở đâu tại 10 triệu
   user", và due diligence report giả lập.
8. **Security headers (`helmet`)** — chưa có bất kỳ security header nào
   (`CSP`, `HSTS`, `X-Frame-Options`) trong `src/app.ts`. Việc làm nhanh
   nhất trong danh sách này (&lt;30 phút), nên làm trước mục 9-10.
9. **Xử lý `npm audit`** — `be-node-express` hiện có 3 lỗ hổng transitive
   (`@apollo/server`, `brace-expansion`, `uuid` — mức moderate/high). Chưa
   có Dependabot/Renovate config để tự động theo dõi CVE mới.
10. **Least-privilege DB user** — app hiện dùng `postgres`/`postgres`
    (superuser) để kết nối DB thay vì 1 role riêng chỉ có quyền
    `SELECT/INSERT/UPDATE/DELETE` trên các bảng cần thiết.
11. **`HEALTHCHECK` trong Dockerfile** — endpoint `/health` đã tồn tại
    ([`src/app.ts`](../../be-node-express/src/app.ts)) nhưng
    [`Dockerfile`](../../be-node-express/Dockerfile) chưa khai báo
    `HEALTHCHECK` để container orchestrator dùng được.

## Cách dùng file này

Copy bảng "Còn thiếu" thành checklist cá nhân, làm 1 mục xong thì quay lại
đối chiếu với đúng file `level-N-*.md` tương ứng để tự chấm — không chỉ tick
xong việc mà không hiểu vì sao nó quan trọng.
