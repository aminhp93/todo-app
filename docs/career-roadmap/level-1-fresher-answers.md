# Level 1 — Đáp án / Giải thích chi tiết

File này giải thích **từng gạch đầu dòng** trong phần "Yêu cầu" của
[level-1-fresher.md](level-1-fresher.md). Đọc song song 2 file: file kia nói
"cần biết gì", file này trả lời "nó là gì, vì sao cần, và ví dụ ra sao".

## Frontend

**HTML ngữ nghĩa (semantic tags), CSS cơ bản (box model, Flexbox)**
"Ngữ nghĩa" nghĩa là dùng đúng tag cho đúng ý nghĩa nội dung thay vì `<div>`
cho mọi thứ — `<nav>`, `<header>`, `<button>`, `<ul><li>` giúp trình duyệt,
công cụ tìm kiếm, và screen reader hiểu cấu trúc trang mà không cần đọc CSS.
Box model là quy tắc trình duyệt tính kích thước 1 phần tử:
`content + padding + border + margin`. Flexbox là mô hình layout 1 chiều
(hàng hoặc cột) dùng `display: flex` — thay thế cách canh giữa/khoảng cách
thủ công bằng `float`/`position` trước đây.

**JavaScript nền tảng**
- `var` có function scope và bị hoisting kỳ lạ (dùng được trước khi khai
  báo, giá trị `undefined`) — hầu như không nên dùng nữa.
- `let`/`const` có block scope (`{}`), an toàn hơn; `const` không cho gán
  lại tên biến (nhưng object/array bên trong vẫn đổi được).
- `map` trả về mảng mới cùng độ dài (biến đổi từng phần tử), `filter` trả
  về mảng con thoả điều kiện, `reduce` gộp mảng thành 1 giá trị (tổng, object,
  v.v.) — 3 hàm này là nền tảng để xử lý dữ liệu mà không cần vòng `for` thủ
  công.
- Arrow function (`() => {}`) không có `this` riêng — nó dùng `this` của
  scope bao ngoài, khác với `function` thường tự tạo `this` riêng. Đây là lý
  do component class-based React cũ hay bug khi quên `.bind(this)`.

**React cơ bản: component, props, `useState`, `useEffect` đơn giản**
Component là 1 hàm JavaScript trả về JSX (giao diện). Props là dữ liệu
component cha truyền xuống con, chỉ đọc (component con không tự sửa props).
`useState(initial)` trả về `[value, setValue]` — gọi `setValue` làm React
lên lịch render lại component với `value` mới; state không đổi ngay lập tức
(bất đồng bộ). `useEffect(fn, deps)` chạy `fn` sau khi component render
xong — dùng cho side-effect như gọi API; ở Level 1 chỉ cần biết
`useEffect(fn, [])` chạy đúng 1 lần sau lần render đầu.

**Gọi API cơ bản bằng `fetch`/`axios`, loading/error state**
`fetch(url)` trả về Promise; phải `.then(res => res.json())` để lấy dữ liệu
thật (bước 1 chỉ lấy được response object, chưa parse body). `axios` làm
việc này gọn hơn (`axios.get(url).then(res => res.data)`) và tự parse JSON,
tự throw lỗi khi status không phải 2xx (khác `fetch`, `fetch` không tự
reject khi gặp 404/500). "Loading state" là biến `boolean` báo đang chờ kết
quả để hiện spinner; "error state" lưu lỗi để hiện thông báo thay vì màn
hình trắng khi API fail.

**Git cơ bản**
`clone` tải repo về máy; `add` đưa file vào "staging area" (chuẩn bị commit);
`commit` lưu 1 snapshot có message; `push` đẩy commit lên remote; `pull` kéo
commit mới từ remote về và merge vào branch hiện tại. Branch là 1 nhánh
lịch sử độc lập để làm việc song song mà không ảnh hưởng `main`.

## Backend

**Viết được 1 REST API CRUD đơn giản với Express**
CRUD = Create/Read/Update/Delete, ánh xạ sang HTTP method
`POST/GET/PATCH(hoặc PUT)/DELETE`. Express là framework HTTP cho Node.js:
`app.get('/api/todos', (req, res) => {...})` đăng ký 1 route handler — hàm
này nhận `req` (thông tin request: params, query, body) và `res` (để trả
response). Ở Level 1, route handler gọi thẳng DB, chưa cần tách file riêng.

**SQL cơ bản**
`SELECT cols FROM table WHERE condition` đọc dữ liệu; `INSERT INTO table
(cols) VALUES (...)` thêm dòng mới; `UPDATE table SET col = value WHERE
condition` sửa; `DELETE FROM table WHERE condition` xoá. **Luôn có `WHERE`
khi `UPDATE`/`DELETE`** — quên `WHERE` nghĩa là áp dụng cho TOÀN BỘ bảng.
Primary Key là cột (hoặc tổ hợp cột) định danh duy nhất 1 dòng — trong
`todo-app`, `todos.id SERIAL PRIMARY KEY` tự tăng và không trùng.

**HTTP method & status code**
`GET` = đọc, không thay đổi dữ liệu (idempotent — gọi nhiều lần kết quả như
nhau); `POST` = tạo mới, KHÔNG idempotent (gọi 2 lần tạo 2 dòng); `PATCH` =
sửa 1 phần dữ liệu; `PUT` = thay thế toàn bộ resource (ít dùng hơn `PATCH`
trong thực tế); `DELETE` = xoá. Status code: `2xx` thành công (`200` OK,
`201` Created — dùng sau `POST` tạo thành công); `4xx` lỗi do client
(`400` request sai định dạng, `401` chưa đăng nhập, `404` không tìm thấy);
`5xx` lỗi do server (`500` lỗi không lường trước).

**`.env`**
File chứa biến môi trường (`DATABASE_URL`, `PORT`, ...) đọc lúc chạy chương
trình thay vì hardcode trong source — cho phép dùng giá trị khác nhau giữa
máy dev, CI, và production **mà không sửa code**. Thư viện `dotenv` đọc file
`.env` và gán vào `process.env` khi gọi `dotenv.config()`.

## DevOps

**Docker cơ bản: `build`/`run`/`ps`/`logs`, image vs container**
Image là 1 bản snapshot bất biến (filesystem + config) được build từ
`Dockerfile` — giống như 1 "class". Container là 1 instance đang chạy của
image đó — giống như 1 "object" được tạo từ class. `docker build -t name .`
tạo image; `docker run name` khởi chạy 1 container từ image; `docker ps`
liệt kê container đang chạy; `docker logs <container>` xem output/log của
nó.

**Đọc hiểu 1 `Dockerfile` đơn giản**
Mỗi dòng là 1 "layer": `FROM node:18-alpine` chọn base image; `WORKDIR /app`
đặt thư mục làm việc trong container; `COPY . .` copy code vào image;
`RUN npm install` chạy lệnh lúc BUILD image (kết quả được lưu vào layer);
`CMD [...]` là lệnh chạy khi container KHỞI ĐỘNG (khác `RUN`, chỉ chạy 1 lần
lúc container start, không lưu vào image).

**`docker-compose up` chạy nhiều service cùng lúc**
`docker-compose.yml` định nghĩa nhiều container (vd: `db`, `be-node-express`)
và cách chúng nói chuyện với nhau qua 1 network chung — mỗi service gọi
service khác bằng TÊN service (vd: `be-node-express` kết nối DB qua host
`db`, không phải `localhost`) thay vì IP.

## Security

**Không lưu password dạng plaintext**
Nếu database bị lộ (leak/breach), password dạng plaintext = mọi tài khoản
người dùng bị lộ ngay lập tức, và vì nhiều người dùng lại 1 password cho
nhiều nơi, hệ quả lan sang cả các dịch vụ khác. Ở Level 1 chỉ cần biết
**đây là sai**, cách làm đúng (hash bằng `bcrypt`) học ở Level 2.

**Không commit `.env`/secrets lên Git**
Git lưu lịch sử vĩnh viễn — dù xoá file ở commit sau, secret vẫn còn trong
lịch sử commit cũ và ai clone repo cũng thấy được. `.gitignore` liệt kê
file/thư mục Git bỏ qua khi `git add`; `.env` luôn phải nằm trong đó, chỉ
commit `.env.example` (có tên biến, không có giá trị thật).

**HTTPS vs HTTP**
HTTP gửi dữ liệu dạng plaintext qua mạng — ai chặn được gói tin (vd: cùng
Wi-Fi công cộng) đọc được toàn bộ nội dung, kể cả password gõ trong form
login. HTTPS mã hoá dữ liệu bằng TLS trước khi gửi đi — kẻ chặn giữa đường
chỉ thấy dữ liệu đã mã hoá, không đọc được nội dung thật.
