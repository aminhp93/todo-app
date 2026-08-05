# Level 2 — Đáp án / Giải thích chi tiết

Giải thích từng gạch đầu dòng trong [level-2-junior.md](level-2-junior.md).

## Frontend

**Hiểu đúng dependency array của `useEffect`, tránh infinite loop/stale closure**
Dependency array (`[a, b]` trong `useEffect(fn, [a, b])`) báo React "chỉ
chạy lại `fn` khi `a` hoặc `b` đổi". Bỏ trống `[]` = chạy 1 lần; bỏ hẳn mảng
= chạy sau MỌI lần render (thường là lỗi). Infinite loop kinh điển: `useEffect`
gọi `setState` mà state đó lại nằm trong dependency array và thay đổi mỗi
lần chạy → effect chạy lại → set lại state → lặp vô hạn. "Stale closure" là
khi hàm bên trong effect "nhớ" giá trị biến tại thời điểm effect được tạo,
không phải giá trị mới nhất — xảy ra khi thiếu biến đó trong dependency
array.

**Tách component con hợp lý, props có kiểu**
Tách 1 component lớn thành nhiều component nhỏ hơn (vd: `TodoList` chứa
nhiều `TodoItem`) giúp mỗi phần dễ test, dễ tái sử dụng, và React chỉ
re-render đúng phần thay đổi thay vì cả cây. Props có kiểu (TypeScript
`interface Props { title: string; onToggle: (id: number) => void }`) giúp
compiler báo lỗi ngay khi truyền sai kiểu dữ liệu, thay vì lỗi runtime khó
tìm.

**Quản lý form: controlled input, validate cơ bản**
"Controlled input" nghĩa là giá trị input do React state quản lý
(`value={title} onChange={e => setTitle(e.target.value)}`) — React luôn
biết giá trị hiện tại, khác với "uncontrolled" (để DOM tự giữ giá trị, đọc
qua `ref` khi cần). Validate cơ bản: kiểm tra bắt buộc (`title.trim() !== ''`),
độ dài (`title.length <= 255`) TRƯỚC khi gọi API, để phản hồi người dùng
ngay thay vì chờ lỗi từ server.

**CSS framework (Tailwind), responsive design**
Tailwind cung cấp class tiện ích áp trực tiếp trong JSX (`className="flex
gap-2 p-4"`) thay vì viết file CSS riêng — tốc độ code nhanh hơn, không cần
đặt tên class. Responsive/mobile-first nghĩa là style mặc định cho màn hình
nhỏ trước, rồi thêm breakpoint (`md:`, `lg:`) để mở rộng cho màn hình lớn
hơn — Tailwind mặc định theo hướng này.

**`useMemo`/`useCallback`**
`useMemo(fn, deps)` chỉ tính lại giá trị khi `deps` đổi — tránh tính toán
nặng lặp lại mỗi render. `useCallback(fn, deps)` tương tự nhưng cho HÀM (giữ
cùng 1 reference hàm giữa các lần render nếu `deps` không đổi) — hữu ích khi
truyền hàm xuống component con được bọc `React.memo`, vì nếu không, hàm mới
được tạo mỗi render khiến `React.memo` không có tác dụng.

## Backend

**Tách kiến trúc cơ bản: routes → controller**
Route định nghĩa "URL nào gọi hàm nào" (`router.get('/todos', todoController.list)`);
controller chứa logic xử lý request/response. Tách 2 lớp này giúp file route
dễ đọc (chỉ thấy danh sách endpoint), và controller có thể test/tái sử dụng
độc lập với việc URL là gì.

**Validate input bằng thư viện (`zod`/`joi`)**
Thay vì viết tay từng `if (!title) return res.status(400)...`, khai báo 1
schema (`z.object({ title: z.string().min(1) })`) rồi gọi `schema.parse(body)`
— tự động kiểm tra đủ điều kiện, throw lỗi rõ ràng nếu sai, và tránh bỏ sót
field khi API phức tạp dần. Xem [`src/schemas/todo.schema.ts`](../../be-node-express/src/schemas/todo.schema.ts).

**Middleware xử lý lỗi tập trung**
Middleware là hàm `(req, res, next)` chạy trước/sau route handler. 1
middleware lỗi đặt ở CUỐI app (`app.use(errorHandler)`) bắt mọi lỗi được
`next(err)` hoặc throw từ route/middleware trước đó, trả response lỗi thống
nhất (1 format JSON) — thay vì mỗi route tự viết `try/catch` và tự quyết
định format lỗi khác nhau. Xem
[`src/middleware/errorHandler.ts`](../../be-node-express/src/middleware/errorHandler.ts).

**Authentication cơ bản: hash password (`bcrypt`), JWT sign/verify**
`bcrypt.hash(password, saltRounds)` biến password thành chuỗi hash 1 chiều
(không thể đảo ngược lại password gốc); `bcrypt.compare(input, hash)` so
sánh mà không cần biết password gốc. JWT (JSON Web Token) là 1 chuỗi gồm 3
phần `header.payload.signature`, server "ký" bằng 1 secret — client giữ
token, gửi lại trong header `Authorization: Bearer <token>` mỗi request;
server chỉ cần verify chữ ký (không cần tra DB) để biết token hợp lệ và lấy
thông tin user từ payload.

**SQL: `JOIN`, Foreign Key, `INDEX`**
`JOIN` gộp dữ liệu từ 2 bảng theo điều kiện liên kết (vd:
`todos LEFT JOIN categories ON categories.id = todos.category_id`) — lấy
tên category cùng lúc với todo mà không cần 2 query riêng. Foreign Key là
ràng buộc đảm bảo giá trị 1 cột phải tồn tại ở bảng khác (vd:
`todos.category_id` phải là 1 `id` có thật trong `categories`) — DB tự
chặn nếu vi phạm. Index là cấu trúc dữ liệu phụ (thường B-tree) giúp
database tìm dòng nhanh hơn theo 1 cột, đổi lại tốn thêm dung lượng và làm
chậm `INSERT`/`UPDATE` (vì phải cập nhật cả index).

## DevOps

**Tự viết `Dockerfile` 1 stage cho Node.js**
Cấu trúc tối thiểu: `FROM node:18-alpine` → `WORKDIR /app` →
`COPY package*.json ./` → `RUN npm install` → `COPY . .` →
`CMD ["node", "index.js"]`. Copy `package*.json` TRƯỚC rồi mới `npm install`
(thay vì copy hết source rồi mới install) để Docker cache được layer
`npm install` — nếu code đổi nhưng dependency không đổi, build lại nhanh
hơn nhiều vì không phải install lại từ đầu.

**`docker-compose.yml` cho nhiều service phụ thuộc nhau**
`depends_on: [db]` báo Docker khởi động `db` trước service phụ thuộc nó
(nhưng KHÔNG đợi `db` sẵn sàng nhận connection, chỉ đợi container start —
đây là lý do code cần tự retry connect DB). `networks` định nghĩa 1 mạng ảo
để các container gọi nhau bằng tên service; `volumes` là nơi lưu dữ liệu
sống ngoài vòng đời container (vd: `pgdata_dev` giữ dữ liệu Postgres dù
container bị xoá và tạo lại).

**Đọc hiểu CI pipeline YAML**
`on: push/pull_request` định nghĩa khi nào pipeline chạy; mỗi `job` chạy
độc lập (mặc định song song) trên 1 máy ảo sạch; các `step` trong 1 job
chạy tuần tự. `actions/checkout` tải code repo vào máy CI (bắt buộc phải có
ở bước đầu, nếu không các step sau không có code để chạy).

## Security

**Hash password đúng cách, salt rounds**
"Salt" là chuỗi ngẫu nhiên trộn vào password trước khi hash, khiến 2 user
cùng password vẫn ra hash khác nhau (chống rainbow table attack — bảng tra
sẵn hash của password phổ biến). `bcrypt` tự sinh và lưu salt trong chuỗi
hash output. "Salt rounds" (vd: 12) quyết định số lần lặp thuật toán — càng
cao càng an toàn nhưng càng chậm; 10-12 là mức phổ biến cân bằng.

**Parameterized query, SQL injection**
Nối chuỗi trực tiếp (`` `SELECT * FROM users WHERE email = '${email}'` ``)
cho phép attacker nhập `email = "' OR '1'='1"` để biến điều kiện `WHERE`
thành luôn đúng, đọc được TOÀN BỘ bảng. Parameterized query
(`pool.query('... WHERE email = $1', [email])`) gửi giá trị tách biệt khỏi
câu lệnh SQL — driver DB tự escape, giá trị nhập vào không bao giờ được
hiểu là code SQL.

**CORS: `origin` vs `credentials`**
CORS (Cross-Origin Resource Sharing) là cơ chế trình duyệt chặn request từ
origin A (vd: `localhost:5173`) gọi tới origin B (vd: `localhost:5001`) trừ
khi server B khai báo cho phép qua header `Access-Control-Allow-Origin`.
Khi request cần gửi cookie (`credentials: true` ở client), server KHÔNG
được dùng `origin: '*'` (wildcard) — trình duyệt sẽ chặn — mà phải khai báo
đúng origin cụ thể (hoặc reflect origin động như
[`src/app.ts`](../../be-node-express/src/app.ts) đang làm).

**XSS và output escaping**
XSS (Cross-Site Scripting) là khi attacker chèn được `<script>` hoặc HTML
độc hại vào dữ liệu, và nó bị hiển thị lại như code thật trên trình duyệt
người khác (vd: todo title chứa `<script>steal cookie</script>`). React tự
động escape mọi giá trị render qua `{}` (biến `<` thành `&lt;`) — chỉ mất an
toàn khi dùng `dangerouslySetInnerHTML` (đúng như tên gọi, phải tự chịu
trách nhiệm escape).

## Cách dùng file này để tự luyện

Che phần giải thích lại, chỉ nhìn tiêu đề gạch đầu dòng ở
`level-2-junior.md`, tự nói to (hoặc viết ra) câu trả lời trước khi mở lại
file này để đối chiếu.
