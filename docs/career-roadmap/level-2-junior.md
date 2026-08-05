# Level 2 — Junior

> Tự trả lời từng gạch đầu dòng trước khi xem [đáp án/giải thích chi tiết](level-2-junior-answers.md).

## Frontend

**Yêu cầu**
- Hiểu đúng dependency array của `useEffect`, tránh infinite loop / stale
  closure.
- Tách component con hợp lý (reusability), truyền props có kiểu
  (TypeScript interface/props typing).
- Quản lý form: controlled input, validate cơ bản (bắt buộc, độ dài).
- CSS framework (Tailwind) và responsive design cơ bản (mobile-first).
- Biết dùng `useMemo`/`useCallback` (chưa cần biết khi nào KHÔNG nên dùng).

**Keywords**: custom hook, prop drilling, controlled/uncontrolled input,
Tailwind utility classes, TypeScript interface, `key` prop trong list
rendering, error boundary (biết khái niệm).

**Áp dụng vào `todo-app`**: [`fe-vite/src/App.tsx`](../../fe-vite/src/App.tsx)
và [`fe-nextjs`](../../fe-nextjs/src/app) dùng TypeScript + Tailwind, có toggle
chọn backend — đọc phần code xử lý switch backend (ping kiểm tra trạng thái
kết nối) là ví dụ tốt về side-effect với `useEffect`. **Còn thiếu ở mức
Junior**: tách `TodoItem`, `TodoList`, `AddTodoForm` thành các component
riêng thay vì để chung trong `App.tsx` — đây là bài tập refactor tốt để tự
luyện.

## Backend

**Yêu cầu**
- Tách được kiến trúc cơ bản: routes → controller → (có thể chưa cần
  service/repository riêng).
- Validate input bằng thư viện (`zod`/`joi`), không chỉ `if (!title)`.
- Middleware xử lý lỗi tập trung thay vì `try/catch` lặp lại từng route.
- Hiểu và làm được authentication cơ bản: hash password (`bcrypt`), JWT
  sign/verify đơn giản (chưa cần refresh token rotation).
- SQL: `JOIN` cơ bản, biết Foreign Key, biết `INDEX` là gì (chưa cần tối ưu
  sâu).

**Keywords**: middleware, `bcrypt`, JWT (access token), request validation
schema, foreign key, `ON DELETE CASCADE`, parameterized query (chống SQL
injection).

**Áp dụng vào `todo-app`**: `be-node-express` sau khi refactor đã VƯỢT mức
này — có tách layer đầy đủ, JWT, zod validation. Để tự luyện đúng "cảm giác"
Level 2, thử tự viết lại **một tính năng nhỏ từ đầu, không xem code có sẵn**:
ví dụ thêm field `priority` (`low/medium/high`) vào `todos`, viết migration
SQL, cập nhật `todo.repository.ts`, `todo.service.ts`, `todo.schema.ts`,
route `PATCH`. Nếu tự làm được trong &lt;30 phút không lỗi TypeScript, bạn
đã chắc Level 2 BE.

## DevOps

**Yêu cầu**
- Tự viết được 1 `Dockerfile` đơn giản cho 1 service Node.js (1 stage,
  `COPY` + `RUN npm install` + `CMD`).
- Viết được `docker-compose.yml` cho vài service phụ thuộc nhau
  (`depends_on`), hiểu `networks`/`volumes` ở mức dùng được.
- Đọc hiểu 1 CI pipeline YAML đơn giản (GitHub Actions): trigger khi nào,
  step nào chạy trước/sau.

**Keywords**: `depends_on`, named volume, bridge network, CI trigger
(`push`/`pull_request`), `actions/checkout`, `actions/setup-node`.

**Áp dụng vào `todo-app`**: đọc và giải thích lại được toàn bộ
[`docker-compose.yml`](../../docker-compose.yml) và
[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) — vì sao mỗi
service có 1 job riêng với `paths-filter` (chỉ build khi thư mục đó thay
đổi) là ví dụ tốt về CI hiệu quả cho monorepo.

## Security

**Yêu cầu**
- Hash password đúng cách (`bcrypt`/`argon2`, biết salt rounds là gì).
- Luôn dùng parameterized query, giải thích được SQL injection xảy ra như
  thế nào nếu nối chuỗi trực tiếp.
- Cấu hình CORS đúng (không để `origin: '*'` khi cần `credentials: true`).
- Biết XSS là gì và vì sao React tự escape output giúp giảm rủi ro này.

**Keywords**: `bcrypt` salt rounds, parameterized query, CORS `origin` vs
`credentials`, XSS, output escaping.

**Áp dụng vào `todo-app`**: [`src/utils/password.ts`](../../be-node-express/src/utils/password.ts)
dùng `bcrypt` với 12 salt rounds; mọi query trong
[`src/repositories/`](../../be-node-express/src/repositories) dùng `$1, $2`
thay vì nối chuỗi. Điểm đáng chú ý: `todo.repository.ts` là nơi DUY NHẤT có
nối chuỗi trực tiếp vào SQL (`sortBy`/`sortDir` cho `ORDER BY`) — đọc
`todo.service.ts` để thấy vì sao việc validate qua whitelist
(`SORTABLE_COLUMNS`) trước khi tới đó là bắt buộc, không phải tùy chọn.

## Cách tự kiểm tra đã qua Level 2

Bạn giải thích được: vì sao phải hash password thay vì mã hoá 2 chiều, JWT
gồm 3 phần gì và ai verify được, `JOIN` khác `subquery` ra sao, tự debug
được lỗi CORS cơ bản khi FE gọi BE khác port, và tự viết được 1
`docker-compose.yml` cho 2 service phụ thuộc nhau từ đầu.
