# Level 1 — Fresher / Intern

> Tự trả lời từng gạch đầu dòng trước khi xem [đáp án/giải thích chi tiết](level-1-fresher-answers.md).

## Frontend

**Yêu cầu**
- HTML ngữ nghĩa (semantic tags), CSS cơ bản (box model, Flexbox).
- JavaScript nền tảng: `var/let/const`, kiểu dữ liệu, array/object methods
  (`map/filter/reduce` ở mức đọc hiểu), function vs arrow function.
- React cơ bản: component, props, `useState`, `useEffect` đơn giản
  (không cần hiểu sâu dependency array).
- Gọi API cơ bản bằng `fetch`/`axios`, hiển thị loading/error state đơn giản.
- Dùng được Git cơ bản: `clone/add/commit/push/pull`, tạo branch.

**Keywords**: DOM, JSX, Virtual DOM (biết khái niệm), npm/yarn, ES6,
component tree, controlled input, `console.log` debugging.

**Áp dụng vào `todo-app`**: [`fe-vite/src/App.tsx`](../../fe-vite/src/App.tsx)
chính là mức độ này — một component lớn, `useState` quản lý list todos, gọi
`fetch` tới backend, không có state management hay tách component con phức
tạp. Đọc và giải thích lại được từng dòng trong file đó là đạt Level 1 FE.

## Backend

**Yêu cầu**
- Viết được 1 REST API CRUD đơn giản với Express (route handler trực tiếp,
  chưa cần tách layer).
- SQL cơ bản: `SELECT/INSERT/UPDATE/DELETE`, mệnh đề `WHERE`, hiểu Primary
  Key là gì.
- Hiểu HTTP method nào dùng cho việc gì (`GET/POST/PATCH/DELETE`), và ý
  nghĩa cơ bản của status code (`200/201/400/404/500`).
- Đọc/ghi được biến môi trường qua `.env`.

**Keywords**: HTTP method, status code, JSON, request/response, `.env`,
connection string, `pg`/`mysql2` driver.

**Áp dụng vào `todo-app`**: bản gốc (trước khi refactor trong session này)
của `be-node-express/src/index.ts` — toàn bộ logic trong 1 file, không tách
controller/service, không auth, 1 bảng `todos` duy nhất — chính là mẫu hình
Level 1 BE. Xem lịch sử git (`git log -p -- be-node-express/src/index.ts`)
để thấy phiên bản gốc đó.

## DevOps

**Yêu cầu**
- Dùng được Docker ở mức cơ bản: `docker build`, `docker run`, `docker ps`,
  `docker logs`, biết image khác container ở điểm nào.
- Đọc hiểu được 1 `Dockerfile` đơn giản (không cần tự viết multi-stage).
- Biết `docker-compose up` chạy nhiều service cùng lúc để làm gì.

**Keywords**: image, container, `Dockerfile`, `docker-compose`, port
mapping, volume (biết khái niệm).

**Áp dụng vào `todo-app`**: chạy được
[`docker-compose.yml`](../../docker-compose.yml) bằng `docker compose up -d db`
và giải thích được vì sao `db` phải "Up" trước khi `be-node-express` connect
được — đây chính là mức Level 1 DevOps.

## Security

**Yêu cầu**
- Biết KHÔNG được lưu password dạng plaintext (chưa cần biết hash đúng
  cách).
- Biết KHÔNG commit file `.env`/secrets lên Git.
- Biết HTTPS là gì và khác HTTP ở điểm nào (ở mức khái niệm).

**Keywords**: plaintext password (biết là sai), `.gitignore`, HTTPS vs HTTP.

**Áp dụng vào `todo-app`**: [`be-node-express/.gitignore`](../../be-node-express/.gitignore)
đã ignore `.env` — giải thích được vì sao file này không nên lên Git (chứa
`JWT_ACCESS_SECRET`, `DATABASE_URL` thật) là đủ Level 1 Security.

## Cách tự kiểm tra đã qua Level 1

Bạn giải thích được: JSX compile ra gì, tại sao `useState` re-render
component, sự khác nhau giữa `PATCH` và `PUT`, viết lại được 1 route CRUD
Express + `pg` từ đầu không cần xem tài liệu, chạy được `docker-compose`
của dự án, và giải thích được vì sao `.env` không nên lên Git.
