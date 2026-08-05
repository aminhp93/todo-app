# Level 4 — Đáp án / Giải thích chi tiết

Giải thích từng gạch đầu dòng trong [level-4-senior.md](level-4-senior.md).
Ở Level 4, phần lớn câu trả lời đúng có dạng "phụ thuộc vào X" — nếu bạn chỉ
nhớ được định nghĩa mà không nói được đánh đổi, coi như chưa đạt.

## Frontend

**Kiến trúc frontend nhiều team: module boundaries, design system, monorepo**
"Module boundary" là ranh giới rõ ràng giữa các phần code (vd: `auth/`,
`todos/`, `shared-ui/`) sao cho 1 team sửa 1 module không vô tình phá module
khác — thường ép bằng lint rule (cấm import chéo trái phép) chứ không chỉ
quy ước bằng lời. Design system là bộ component + design token (màu, spacing,
typography) dùng chung để nhiều team ra UI nhất quán mà không copy-paste.
Monorepo (Turborepo/Nx) cho phép nhiều app/package trong 1 repo, build chỉ
phần thay đổi (tương tự cách `ci.yml` của `todo-app` dùng `paths-filter` để
chỉ build service đổi — cùng ý tưởng, khác công cụ). Đánh đổi: monorepo dễ
share code nhưng tăng độ phức tạp tooling và có thể làm CI chậm nếu không
cache đúng.

**Performance sâu: bundle analysis, virtualization, Web Worker, Web Vitals thực chiến**
Bundle analysis (`webpack-bundle-analyzer` hoặc tương đương của Vite) vẽ
biểu đồ dung lượng từng package trong file JS cuối cùng — phát hiện
dependency nặng không cần thiết (vd: import cả thư viện chỉ để dùng 1 hàm).
Virtualization (`react-window`) chỉ render các dòng ĐANG HIỂN THỊ trong
viewport của 1 danh sách dài (thay vì render hết 10,000 dòng), giữ DOM nhỏ
và mượt khi scroll. Web Worker chạy JS trên thread riêng, không chặn UI
thread — dùng cho tính toán nặng (vd: xử lý ảnh, parse file lớn). "Thực
chiến" khác "biết khái niệm" ở chỗ: bạn đo được LCP/CLS/INP thật bằng công
cụ (Lighthouse, Chrome DevTools Performance tab), không chỉ định nghĩa được
từng chữ viết tắt.

**Testing: E2E, visual regression, test pyramid**
E2E (End-to-End, Playwright/Cypress) mô phỏng người dùng thật thao tác trên
trình duyệt thật, qua toàn bộ hệ thống (FE + BE + DB) — chậm và tốn tài
nguyên nhất nhưng phát hiện được lỗi tích hợp mà unit test không thấy.
Visual regression chụp screenshot UI và so sánh với ảnh baseline, phát hiện
thay đổi giao diện ngoài ý muốn (vd: 1 CSS thay đổi làm vỡ layout ở màn hình
khác). Test pyramid: nên có NHIỀU unit test (nhanh, rẻ), ÍT integration
test hơn, và RẤT ÍT E2E test (chậm, dễ flaky) — hình kim tự tháp, không phải
hình chữ nhật đều.

**Security phía FE: XSS prevention, CSRF, CSP**
Ngoài việc React tự escape (Level 2), tránh dùng
`dangerouslySetInnerHTML` với dữ liệu từ user trừ khi đã sanitize qua thư
viện (`DOMPurify`). CSP (Content Security Policy) là header HTTP khai báo
trình duyệt CHỈ được tải script/style/image từ nguồn được liệt kê — nếu
attacker chèn được `<script src="evil.com">`, CSP chặn trình duyệt tải nó
dù XSS đã xảy ra (lớp phòng thủ thứ 2).

**Dẫn dắt code review, convention, mentor**
Đặt convention (ESLint/Prettier rule riêng của team) giúp code review tập
trung vào LOGIC thay vì tranh cãi style (đã tự động hoá). Mentor không chỉ
là sửa code cho junior mà là đặt câu hỏi đúng để họ TỰ tìm ra vấn đề — đây
là kỹ năng khác hẳn kỹ năng viết code giỏi.

## Backend

**System design: horizontal scaling, load balancer, cache nhiều tầng, message queue**
Horizontal scaling = thêm nhiều instance chạy song song (khác vertical
scaling = tăng cấu hình 1 máy) — đòi hỏi app phải stateless hoặc state được
lưu ở nơi dùng chung (như session lưu Postgres thay vì memory, xem
`todo-app` hiện tại). Load balancer phân phối request tới các instance.
Cache nhiều tầng: CDN (cache tĩnh gần người dùng) → app cache (Redis) → DB
cache (query plan cache của Postgres) — mỗi tầng giảm tải cho tầng sau.
Message queue (RabbitMQ/Kafka/SQS) tách việc XỬ LÝ NGAY khỏi việc XỬ LÝ SAU:
API nhận request, đẩy việc nặng vào queue, trả response ngay cho client,
worker riêng xử lý dần — dùng cho việc không cần kết quả tức thì (gửi email,
export báo cáo).

**Database sâu: replication, partitioning/sharding, connection pool tuning**
Read replica: bản sao DB chỉ đọc, đồng bộ từ DB chính (primary) — tách bớt
tải đọc khỏi DB ghi chính, nhưng có "replication lag" (dữ liệu đọc từ
replica có thể trễ vài trăm ms). Partitioning chia 1 bảng lớn thành nhiều
phần vật lý theo tiêu chí (vd: theo tháng) NHƯNG vẫn trên 1 database.
Sharding chia dữ liệu ra NHIỀU database/máy chủ khác nhau theo 1 khoá (vd:
`user_id % N`) — phức tạp hơn nhiều vì query xuyên shard rất khó. Connection
pool tuning: mỗi kết nối DB tốn tài nguyên cả 2 phía — pool quá nhỏ khiến
request phải chờ; pool quá lớn khiến DB quá tải vì có giới hạn connection
tối đa.

**Security: OWASP thực tế, secrets management, rate limit theo user/IP, least privilege**
Xem thêm phần Security bên dưới — ở mức Senior, khác biệt là ÁP DỤNG được
cho hệ thống cụ thể, không chỉ liệt kê tên.

**Observability: structured logging, metrics, distributed tracing**
Structured logging (log dạng JSON: `{"level":"error","userId":1,"msg":"..."}`
thay vì `console.log('lỗi rồi:', x)`) cho phép query/filter log bằng công cụ
(vd: "tất cả lỗi của `userId=1` trong 1 giờ qua") thay vì đọc bằng mắt.
Metrics (Prometheus) là số liệu theo thời gian (request/giây, latency
p99, lỗi/giây) — dùng để phát hiện XU HƯỚNG bất thường. Distributed tracing
(OpenTelemetry) gắn 1 "trace ID" xuyên suốt 1 request qua nhiều service, cho
phép thấy CHÍNH XÁC request đó chậm ở bước nào khi hệ thống có nhiều service
gọi nhau.

**Reliability: idempotency key, retry backoff, circuit breaker, timeout**
Idempotency key: client gửi kèm 1 ID duy nhất cho 1 "ý định" ghi dữ liệu
(vd: tạo đơn hàng) — nếu request bị timeout và client tự động gửi lại, server
nhận diện ID đã xử lý và KHÔNG tạo đơn hàng lần 2. Retry with exponential
backoff: khi gọi service khác thất bại, thử lại nhưng tăng dần khoảng chờ
giữa các lần (1s, 2s, 4s, ...) thay vì retry dồn dập làm service đang lỗi
càng quá tải. Circuit breaker: sau N lần gọi service B thất bại liên tiếp,
NGỪNG gọi B trong 1 khoảng thời gian (trả lỗi ngay lập tức) thay vì tiếp tục
gọi và chờ timeout mỗi lần — giúp service A không bị kéo sập theo B. Timeout
hợp lý: mọi lệnh gọi service khác PHẢI có giới hạn thời gian chờ, nếu không
1 service chậm có thể làm nghẽn toàn bộ chuỗi gọi phía trên.

## DevOps

**Orchestration: Kubernetes/ECS, biết khi nào KHÔNG cần**
Kubernetes quản lý vòng đời container ở quy mô lớn: tự khởi động lại
container chết, tự scale theo tải, tự phân phối traffic — nhưng chi phí vận
hành (học Kubernetes, duy trì cluster) chỉ đáng nếu có đủ số service/traffic
để tận dụng. Với 1-3 service, traffic thấp, `docker-compose` + 1-2 VPS đơn
giản hơn NHIỀU và đủ dùng — chọn Kubernetes sớm khi chưa cần là over-engineering
kinh điển.

**Infrastructure as Code: Terraform/Pulumi**
Định nghĩa hạ tầng (VPC, DB instance, load balancer...) bằng code có version
thay vì click tay trên AWS/GCP console — cho phép review qua PR, tái tạo
hạ tầng y hệt ở môi trường khác, và biết CHÍNH XÁC hạ tầng hiện tại gồm gì
(console dễ bị "cấu hình trôi" — ai đó sửa tay mà không ai biết).

**CI/CD đầy đủ vòng đời, rollback strategy**
Pipeline đầy đủ: build → test → security scan → deploy tự động (không cần
người bấm nút) → có cách quay lại nhanh nếu deploy mới có lỗi. Blue-green
deployment: chạy song song 2 môi trường (blue = đang live, green = version
mới), chuyển traffic sang green khi đã kiểm tra ổn, giữ blue để rollback tức
thì nếu có vấn đề. Canary release: chuyển dần % nhỏ traffic sang version mới
trước (vd: 5% → 25% → 100%), phát hiện lỗi sớm với ảnh hưởng giới hạn thay
vì đẩy 100% traffic ngay.

**Observability thực chiến: Prometheus/Grafana, Loki/ELK, alerting threshold**
Prometheus thu thập metrics định kỳ (pull model), Grafana vẽ dashboard từ
đó. Loki/ELK (Elasticsearch-Logstash-Kibana) tập trung log từ nhiều service
vào 1 nơi tìm kiếm được. "Alerting có ngưỡng rõ ràng" nghĩa là ngưỡng alert
phải được tính toán (dựa trên SLO thực tế), không phải đặt tuỳ tiện — ngưỡng
sai gây "alert fatigue" (quá nhiều cảnh báo giả khiến người trực bỏ qua cả
cảnh báo thật).

**Auto-scaling dựa trên metric thật**
Horizontal Pod Autoscaler (Kubernetes) hoặc tương đương tăng/giảm số
instance dựa trên CPU/memory/queue depth ĐO ĐƯỢC theo thời gian thực, thay
vì hardcode "luôn chạy 5 instance" — tiết kiệm chi phí lúc tải thấp, tự mở
rộng lúc tải cao.

## Security

**Threat modeling (STRIDE) trước khi code**
Trước khi viết 1 tính năng mới, tự hỏi: ai có thể giả mạo ai (**S**poofing),
ai có thể sửa dữ liệu trái phép (**T**ampering), ai có thể chối bỏ hành động
đã làm (**R**epudiation), dữ liệu nhạy cảm có thể bị lộ không
(**I**nformation disclosure), tính năng có thể bị lạm dụng làm sập hệ thống
không (**D**enial of service), user có thể chiếm quyền cao hơn được cấp
không (**E**levation of privilege). Làm việc này TRƯỚC khi code giúp phát
hiện lỗ hổng thiết kế sớm, rẻ hơn nhiều so với vá sau khi bị khai thác.

**Secrets management thật: Vault/SSM**
Biến môi trường tĩnh (`.env`, hay biến trong `docker-compose.yml`) vẫn nằm
"tĩnh" ở đâu đó (file, CI config) — ai truy cập được nơi đó thấy được secret
mãi mãi. Vault/AWS Secrets Manager/SSM Parameter Store cấp secret ĐỘNG lúc
runtime, hỗ trợ xoay vòng (rotation) tự động, và ghi log ai/khi nào truy cập
secret nào — audit được, thu hồi được mà không cần deploy lại code.

**Security headers: CSP, HSTS, `X-Frame-Options`, `helmet`**
HSTS (`Strict-Transport-Security`) báo trình duyệt LUÔN dùng HTTPS cho domain
này, kể cả nếu user gõ `http://` — chặn kiểu tấn công downgrade về HTTP.
`X-Frame-Options: DENY` chặn trang bị nhúng trong `<iframe>` của site khác
(chống clickjacking). `X-Content-Type-Options: nosniff` chặn trình duyệt tự
đoán loại file khác với header `Content-Type` khai báo (vector tấn công
hiếm nhưng có thật). `helmet` là middleware Express set sẵn các header này
với giá trị mặc định an toàn hợp lý.

**SAST và dependency scanning trong CI**
SAST (Static Application Security Testing — Semgrep/CodeQL) quét SOURCE CODE
tìm pattern nguy hiểm (vd: nối chuỗi SQL trực tiếp, dùng `eval()`) mà KHÔNG
cần chạy chương trình — khác dependency scanning (`npm audit`) chỉ quét lỗ
hổng trong package bên thứ 3. Gắn vào CI để CHẶN merge khi phát hiện lỗ
hổng nghiêm trọng, biến security thành 1 phần quy trình thay vì việc làm
"khi nhớ ra".

**Least privilege DB user, network segmentation**
App chỉ nên có quyền DB đúng những gì nó cần (`SELECT/INSERT/UPDATE/DELETE`
trên bảng cụ thể), KHÔNG có quyền `DROP TABLE`/`CREATE ROLE`/truy cập bảng
của service khác — nếu app bị khai thác (vd: qua lỗ hổng injection sót lại),
thiệt hại bị giới hạn trong phạm vi quyền đó. Network segmentation tương tự
ở tầng mạng: DB chỉ nhận kết nối từ đúng service cần nó, không mở public.
