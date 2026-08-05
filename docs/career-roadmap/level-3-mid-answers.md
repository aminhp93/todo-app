# Level 3 — Đáp án / Giải thích chi tiết

Giải thích từng gạch đầu dòng trong [level-3-mid.md](level-3-mid.md).

## Frontend

**React Query/TanStack Query hoặc SWR thay vì tự `useEffect`+`useState`**
Tự fetch bằng `useEffect` phải tự tay xử lý: loading/error state, cache
(tránh gọi lại API đã có dữ liệu), refetch khi quay lại tab, tránh race
condition khi request cũ trả về sau request mới. React Query làm tất cả
việc này qua 1 hook (`useQuery(['todos'], fetchTodos)`) và thêm
`useMutation` cho ghi dữ liệu, tự động invalidate cache liên quan sau khi
ghi thành công (`queryClient.invalidateQueries(['todos'])`).

**State management client: Redux Toolkit, Zustand, Context API đúng chỗ**
"Server state" (dữ liệu từ API — nên dùng React Query) khác "client state"
thuần UI (vd: modal đang mở, tab đang chọn — dùng `useState`/Context là đủ).
Redux Toolkit phù hợp khi state phức tạp, nhiều component không liên quan
trực tiếp cùng cần đọc/sửa, cần debug time-travel. Zustand nhẹ hơn, ít
boilerplate hơn Redux, phù hợp state vừa. Context API gây re-render TOÀN BỘ
component con mỗi khi giá trị Context đổi — dùng cho theme/user hiện tại
(ít đổi) không phù hợp cho state đổi liên tục (vd: gõ phím mỗi ký tự).

**Performance: `React.memo`, code splitting, tránh re-render thừa**
`React.memo(Component)` bọc component, chỉ re-render khi props THỰC SỰ đổi
(so sánh nông — shallow compare). Re-render "thừa" là khi component render
lại dù output không đổi, tốn CPU vô ích — thường do component cha re-render
kéo theo mọi con re-render, dù con không cần. Code splitting
(`React.lazy(() => import('./Page'))` + `<Suspense>`) tách bundle JS thành
nhiều file nhỏ, chỉ tải phần cần khi user thực sự vào route đó, giảm thời
gian tải trang đầu.

**Testing: Jest + React Testing Library, test theo hành vi**
Jest chạy test và assert (`expect(x).toBe(y)`); React Testing Library (RTL)
render component ra "DOM giả" và cho phép query/tương tác như người dùng
thật (`screen.getByText('Add')`, `fireEvent.click(...)`) — triết lý RTL là
test "người dùng thấy gì, làm gì" chứ KHÔNG test chi tiết implementation
(vd: không assert state nội bộ), vì implementation đổi không nên làm test
vỡ nếu hành vi bên ngoài vẫn đúng.

**TypeScript chặt hơn: generic, union/discriminated union**
Generic (`function first<T>(arr: T[]): T`) cho phép viết hàm/type tái sử
dụng được với nhiều kiểu dữ liệu mà vẫn giữ type-safety (khác `any` — mất
hoàn toàn kiểm tra kiểu). Union (`string | number`) nghĩa là giá trị có thể
là 1 trong nhiều kiểu. Discriminated union dùng 1 field chung để TypeScript
tự suy luận đúng kiểu trong từng nhánh:
`{ status: 'loading' } | { status: 'error', message: string } | { status:
'success', data: Todo[] }` — check `status === 'error'` thì TypeScript tự
biết object đó chắc chắn có `message`.

**SSR/CSR/SSG, Web Vitals**
CSR (Client-Side Rendering): trình duyệt tải JS trống, JS tự vẽ giao diện
(vd: `fe-vite`) — nhanh cho tương tác sau đó nhưng chậm hiển thị lần đầu và
SEO kém. SSR (Server-Side Rendering): server render HTML có sẵn dữ liệu rồi
gửi về, JS "hydrate" (gắn lại tương tác) sau — hiển thị nhanh hơn, SEO tốt
hơn. SSG (Static Site Generation): HTML được build sẵn lúc deploy, phục vụ
như file tĩnh — nhanh nhất nhưng dữ liệu không real-time. Web Vitals: LCP
(Largest Contentful Paint — thời gian phần tử lớn nhất hiển thị), CLS
(Cumulative Layout Shift — độ "nhảy" layout gây khó chịu), INP (Interaction
to Next Paint — độ trễ phản hồi khi tương tác).

## Backend

**REST API design: pagination, filtering, sorting, versioning**
Pagination chia kết quả lớn thành từng trang (`?page=2&limit=20`) thay vì
trả hết 1 lần — 2 kiểu: offset (`OFFSET/LIMIT`, đơn giản nhưng chậm ở trang
sâu) và cursor (dùng giá trị của dòng cuối trang trước làm điểm bắt đầu,
nhanh hơn với bảng lớn). Filtering/sorting để client tự chọn tập con và thứ
tự dữ liệu qua query string. Versioning (`/api/v1/todos`) cho phép thay đổi
breaking change ở version mới mà không phá client đang dùng version cũ.

**SQL nâng cao: `EXPLAIN`/`EXPLAIN ANALYZE`, composite index, N+1, transaction**
`EXPLAIN <query>` cho biết Postgres SẼ chạy query như thế nào (dùng index
nào, hay quét toàn bảng "Seq Scan") mà KHÔNG thực sự chạy; `EXPLAIN ANALYZE`
chạy thật và cho thêm thời gian thực tế từng bước. Composite index (index
trên nhiều cột, vd: `(user_id, completed)`) tối ưu cho query lọc theo CẢ 2
điều kiện cùng lúc — thứ tự cột trong index quan trọng (index `(a,b)` dùng
được cho query chỉ lọc `a`, nhưng KHÔNG tối ưu cho query chỉ lọc `b`). N+1
query là lỗi gọi 1 query lấy danh sách rồi lặp gọi thêm 1 query cho MỖI dòng
(vd: lấy 100 todo rồi 100 lần query category riêng) thay vì 1 `JOIN` duy
nhất. Transaction (`BEGIN...COMMIT`/`ROLLBACK`) gộp nhiều câu lệnh thành 1
đơn vị "tất cả hoặc không gì cả" — nếu 1 câu lệnh giữa chừng lỗi, toàn bộ bị
hoàn tác, tránh dữ liệu nửa vời.

**Auth: JWT vs session trade-off, refresh rotation, revoke**
JWT (stateless): server không lưu gì, chỉ verify chữ ký — dễ scale ngang
(mọi instance verify độc lập) nhưng KHÓ thu hồi 1 token đã phát hành trước
khi nó hết hạn (trừ khi có thêm cơ chế danh sách đen). Session (stateful):
server lưu trạng thái đăng nhập (ở đây là Postgres qua `connect-pg-simple`)
— thu hồi tức thì (xoá session), nhưng mỗi request cần tra store, và cần
store dùng chung nếu chạy nhiều instance. Refresh token rotation: mỗi lần
dùng refresh token để lấy access token mới, token cũ bị vô hiệu hoá NGAY và
cấp token mới — nếu 1 token bị đánh cắp và dùng trước chủ sở hữu thật, lần
dùng tiếp theo của CHỦ SỞ HỮU THẬT sẽ thất bại (token đã bị dùng/revoke),
tạo tín hiệu phát hiện bị đánh cắp (reuse detection). Xem
[`src/services/auth.service.ts`](../../be-node-express/src/services/auth.service.ts).

**Testing: unit test service (mock repository), integration test (`supertest`)**
Unit test service kiểm tra LOGIC nghiệp vụ độc lập với DB thật — "giả"
(mock) hàm repository trả về dữ liệu cố định, để test chạy nhanh và không
phụ thuộc trạng thái DB. Integration test bằng `supertest` gửi request thật
tới Express `app` (không cần server chạy thật, `supertest` tự tạo server
tạm) và kiểm tra toàn bộ luồng route → middleware → controller → DB thật
(thường là DB test riêng, dọn dẹp sau mỗi test).

**Migration tool có version**
Thay vì 1 file SQL chạy 1 lần lúc tạo DB (`init.sql`), migration tool ghi
lại LỊCH SỬ thay đổi schema dưới dạng nhiều file có thứ tự (`0001_init.sql`,
`0002_add_priority.sql`, ...), mỗi file có `up` (áp dụng) và `down` (hoàn
tác). Cho phép: review thay đổi schema qua PR như code, áp dụng migration
mới lên DB đang chạy mà KHÔNG mất dữ liệu, và rollback nếu migration mới có
lỗi.

**Caching cơ bản: Redis, cache invalidation**
Redis là key-value store trong bộ nhớ (RAM), đọc/ghi cực nhanh so với query
Postgres từ đĩa. Dùng cho dữ liệu đọc nhiều/ghi ít (vd: `/api/todos/stats`)
— lần đầu tính từ DB rồi lưu vào Redis với thời gian sống (TTL), các lần
sau đọc thẳng từ Redis. "Cache invalidation" (thường được coi là 1 trong 2
việc khó nhất của lập trình) là biết CHÍNH XÁC khi nào phải xoá/cập nhật
cache đó — ở đây là mỗi khi có todo trong category thay đổi, nếu không
người dùng thấy số liệu cũ.

## DevOps

**Multi-stage Docker build**
1 `Dockerfile` có nhiều `FROM` (nhiều "stage") — stage đầu (`builder`) cài
đủ `devDependencies`, chạy `tsc` build TypeScript ra JavaScript; stage cuối
chỉ `COPY --from=builder` lấy đúng file `dist/` đã build, cài
`npm install --only=production` (không có TypeScript, không có
`devDependencies`). Kết quả: image production nhỏ hơn nhiều, giảm diện tấn
công (ít package hơn = ít lỗ hổng tiềm ẩn hơn).

**CI pipeline thực tế: lint + type-check + test, cache dependencies**
"Build check" (chỉ `npm run build`) chỉ phát hiện lỗi cú pháp/kiểu, KHÔNG
phát hiện logic sai (cần test) hay style không nhất quán (cần lint). CI nên
chạy cả 3: `eslint`, `tsc --noEmit`, `npm test`. Cache
(`actions/cache` với key theo `package-lock.json`) lưu `node_modules` giữa
các lần chạy CI — nếu dependency không đổi, khỏi cần tải lại từ npm registry,
tiết kiệm vài chục giây tới vài phút mỗi lần chạy.

**Tách biệt config theo môi trường**
Dev/staging/production nên có secret, connection string, feature flag khác
nhau — dùng CHUNG 1 file `.env` là rủi ro (vd: test trên staging vô tình
xoá dữ liệu production nếu nhầm `DATABASE_URL`). Best practice: mỗi môi
trường có biến môi trường riêng (qua CI secrets, hoặc secrets manager), file
`.env` chỉ dùng cho local dev.

**Health check endpoint và `HEALTHCHECK`**
`GET /health` trả `200 OK` đơn giản để hệ thống bên ngoài (load balancer,
container orchestrator) biết service còn sống. `HEALTHCHECK` trong
`Dockerfile` khai báo lệnh Docker tự gọi định kỳ để đánh dấu container là
"healthy"/"unhealthy" — orchestrator dựa vào đó để quyết định có route
traffic vào container này hay tự khởi động lại nó không.

## Security

**JWT best practices: access ngắn hạn, refresh rotation, secret không hardcode**
Access token sống ngắn (vd: 15 phút) để nếu bị đánh cắp, cửa sổ khai thác
hẹp; refresh token sống dài hơn nhưng có rotation (xem phần Backend ở trên)
để giảm rủi ro further. Secret KHÔNG được hardcode trong source (dù chỉ là
giá trị "tạm" lúc dev) vì source thường lên Git — dùng biến môi trường, và ở
production PHẢI là giá trị ngẫu nhiên đủ dài, không phải giá trị mặc định
kiểu `dev-access-secret-change-me`.

**Rate limiting chống brute-force**
Giới hạn số request/khoảng thời gian theo IP hoặc user (vd: 20
request/15 phút cho `/api/auth/login`) — nếu không có, attacker thử hàng
triệu password/giây tới khi đúng (brute-force). Xem
[`src/middleware/rateLimiter.ts`](../../be-node-express/src/middleware/rateLimiter.ts).

**OWASP Top 10 áp dụng thực tế**
Danh sách 10 rủi ro bảo mật web phổ biến nhất, cập nhật định kỳ bởi OWASP.
3 mục hay gặp nhất trong CRUD app: Injection (SQL injection — xem Level 2),
Broken Authentication (session/token quản lý sai, session không hết hạn,
không rate-limit login), Sensitive Data Exposure (trả về password hash
trong API response, log secret ra console). "Áp dụng thực tế" nghĩa là chỉ
RA ĐƯỢC ví dụ cụ thể trong chính codebase đang làm, không phải học thuộc
tên 10 mục.

**Dependency vulnerability scanning**
Package bên thứ 3 (kể cả dependency của dependency — "transitive") có thể
chứa lỗ hổng đã biết (CVE). `npm audit` liệt kê lỗ hổng trong cây dependency
hiện tại. Dependabot/Renovate tự động quét định kỳ và tạo Pull Request nâng
cấp package khi có CVE mới — không cần nhớ tự chạy `npm audit` thủ công.

**CSRF và vì sao session cần quan tâm nhiều hơn JWT qua header**
CSRF (Cross-Site Request Forgery): trang web độc hại B khiến trình duyệt
người dùng tự động gửi request tới trang A mà người dùng đang đăng nhập
(cookie tự động đính kèm bởi trình duyệt) — A xử lý như request hợp lệ vì
cookie hợp lệ. JWT gửi qua header `Authorization` KHÔNG tự động đính kèm
bởi trình duyệt (JS phải chủ động set) nên ít rủi ro CSRF hơn. Session dùng
cookie nên rủi ro cao hơn — giảm thiểu bằng `SameSite=Lax/Strict` (chặn
cookie gửi kèm request cross-site) và/hoặc CSRF token riêng.
