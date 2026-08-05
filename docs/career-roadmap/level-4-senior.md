# Level 4 — Senior

Từ đây, "biết làm" không còn đủ — phải **giải thích được đánh đổi** và
**thiết kế cho scale/maintainability**, không chỉ cho bài toán hiện tại.

> Tự trả lời từng gạch đầu dòng trước khi xem [đáp án/giải thích chi tiết](level-4-senior-answers.md).

## Frontend

**Yêu cầu**
- Kiến trúc frontend ở quy mô nhiều team: module boundaries rõ ràng, design
  system/component library dùng chung, monorepo (Turborepo/Nx) khi cần.
- Performance sâu: phân tích bundle size (`webpack-bundle-analyzer`),
  virtualization cho list dài (`react-window`), Web Worker cho tính toán
  nặng, tối ưu Web Vitals thực chiến (không chỉ biết khái niệm).
- Testing: E2E (Playwright/Cypress), visual regression testing, test
  pyramid (unit >> integration >> E2E).
- Security phía FE: XSS prevention (escape output, tránh
  `dangerouslySetInnerHTML` tuỳ tiện), CSRF, Content Security Policy.
- Dẫn dắt code review, đặt convention (ESLint/Prettier rules riêng của team),
  mentor junior/middle.

**Keywords**: micro-frontend, module federation, design token, `react-window`,
Web Worker, Playwright, visual regression, CSP header, `SameSite` cookie,
Core Web Vitals budget, ADR (Architecture Decision Record).

**Áp dụng vào `todo-app`**: dự án hiện có 2 frontend riêng biệt
(`fe-vite`, `fe-nextjs`) gọi chung nhiều backend — đây thực chất là bài tập
tốt để luyện tư duy "nhiều team dùng chung API". Artifact nên viết: 1 ADR
ngắn trả lời "nếu 2 frontend này phải share component (vd: `TodoItem`,
design token màu category), nên tách thành package riêng trong monorepo
hay copy code? Đánh đổi là gì?" — đây là câu hỏi thật một Senior FE phải trả
lời, và **quan trọng hơn việc code lại monorepo thật**.

## Backend

**Yêu cầu**
- System design: horizontal scaling, load balancer, cache strategy nhiều
  tầng (CDN/app cache/DB cache), message queue cho xử lý bất đồng bộ
  (RabbitMQ/Kafka/SQS).
- Database sâu: replication (read replica), partitioning/sharding ở mức
  khái niệm + biết khi nào cần, connection pool tuning, query optimization
  cho bảng hàng triệu dòng.
- Security: OWASP Top 10 áp dụng thực tế (không chỉ liệt kê), secrets
  management (Vault/SSM thay vì `.env` trong production), rate limiting
  theo user/IP, least privilege cho DB user.
- Observability: structured logging (JSON logs), metrics (Prometheus),
  distributed tracing (OpenTelemetry) — biết debug production issue bằng
  log/metric/trace, không phải `console.log` qua SSH.
- Reliability patterns: idempotency key cho API ghi tiền/đơn hàng, retry
  with exponential backoff, circuit breaker, timeout hợp lý giữa các service.
- Thiết kế CI/CD pipeline thật (không chỉ build/check), Infrastructure as
  Code cơ bản.

**Keywords**: read replica, sharding, connection pooling, OWASP Top 10,
secrets manager, structured logging, OpenTelemetry, idempotency key, circuit
breaker, exponential backoff, SLA/SLO/SLI, blue-green deployment.

**Áp dụng vào `todo-app`**: hiện dự án CHƯA có observability (chỉ
`console.log`), chưa có message queue, CI (`ci.yml`) chỉ build/check chứ
chưa chạy test hay lint cho `be-node-express`. Artifact nên viết, lấy chính
bug đã tìm thấy trong session này làm ví dụ thật:
- Một **postmortem giả lập** cho bug `authenticateSession` (async middleware
  không wrap `asyncHandler` → unhandled rejection → crash process). Cấu
  trúc chuẩn: Impact / Timeline / Root cause / Detection gap (vì sao không
  có alert nào báo crash) / Action items (thêm `process.on('unhandledRejection')`
  global handler? thêm test cho middleware? thêm APM?).
- Một **ADR** trả lời: "JWT hay session cho hệ thống này nếu phải chọn 1,
  khi scale ra nhiều instance?" (gợi ý: session cần sticky session hoặc
  store tập trung — dự án đã dùng `connect-pg-simple` đúng hướng, nhưng
  Postgres không phải lựa chọn tối ưu cho session store ở scale lớn so với
  Redis — giải thích được vì sao là đạt yêu cầu).

## DevOps

**Yêu cầu**
- Orchestration ở mức dùng thật: Kubernetes cơ bản (Pod/Deployment/Service/
  Ingress) hoặc managed alternative (ECS/Cloud Run) — biết khi nào KHÔNG
  cần Kubernetes cho quy mô nhỏ.
- Infrastructure as Code: Terraform/Pulumi để hạ tầng có version, review
  được qua PR, không click tay trên console.
- CI/CD đầy đủ vòng đời: build → test → security scan (SAST/dependency
  scan) → deploy tự động, có rollback strategy (blue-green/canary).
- Observability thực chiến: metrics (Prometheus/Grafana), centralized log
  (Loki/ELK), alerting có ngưỡng rõ ràng (không alert-fatigue).
- Auto-scaling dựa trên metric thật (CPU/memory/queue depth), không hardcode
  số instance.

**Keywords**: Kubernetes (Pod/Deployment/Ingress/HPA), Terraform state,
blue-green deployment, canary release, Prometheus/Grafana, Loki/ELK,
alerting threshold, auto-scaling, GitOps (ArgoCD/Flux).

**Áp dụng vào `todo-app`**: dự án hiện chạy bằng `docker-compose` — đúng
quy mô cho 1 dự án demo, và một Senior giỏi phải nhận ra **chưa cần
Kubernetes ở đây**, không phải mặc định đề xuất nó. Artifact nên viết: 1
ADR ngắn "Nếu `todo-app` phải chạy production thật với vài trăm user, nên
dừng ở `docker-compose` + 1 VPS, hay chuyển sang Kubernetes/ECS? Ngưỡng nào
(traffic, số service, đội ngũ vận hành) khiến câu trả lời đổi?" — trả lời
đúng là biết **khi nào KHÔNG cần** công cụ phức tạp, không phải liệt kê tên
công nghệ.

## Security

**Yêu cầu**
- Threat modeling cho tính năng mới trước khi code (không phải sau khi bị
  báo lỗi) — vd: STRIDE ở mức áp dụng, không cần thuộc lòng lý thuyết.
- Secrets management thật: Vault/AWS Secrets Manager/SSM Parameter Store
  thay vì biến môi trường tĩnh trong file cấu hình.
- Security headers: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`
  (thường qua middleware như `helmet`).
- SAST (Semgrep/CodeQL) và dependency scanning tự động trong CI, chặn merge
  khi có lỗ hổng nghiêm trọng.
- Least privilege: DB user của app không nên có quyền `DROP TABLE`/
  `CREATE ROLE`; network segmentation giữa các service.

**Keywords**: threat modeling (STRIDE), secrets manager, CSP/HSTS, `helmet`,
SAST (Semgrep/CodeQL), least privilege, network segmentation.

**Áp dụng vào `todo-app`**: đây là gap rõ nhất ở Level 4. Hiện tại:
- `docker-compose.prod.yml` đã đúng hướng least-privilege-cho-secrets: dùng
  `${JWT_ACCESS_SECRET:?...}` để **fail fast** nếu secret production không
  được set, thay vì âm thầm dùng giá trị mặc định yếu — nhưng vẫn là biến
  môi trường tĩnh, chưa qua secrets manager thật.
- Chưa có `helmet` hay bất kỳ security header nào trong
  [`src/app.ts`](../../be-node-express/src/app.ts) — đây là việc làm được
  trong &lt;30 phút và nên làm trước các mục còn lại.
- Chưa có SAST/dependency-scan step nào trong
  [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
- DB user `postgres`/`postgres` (superuser) được dùng luôn cho app — vi
  phạm least privilege rõ ràng, nên tạo riêng 1 DB role chỉ có quyền
  `SELECT/INSERT/UPDATE/DELETE` trên các bảng cần thiết.

## Cách tự kiểm tra đã qua Level 4

Bạn trả lời được câu hỏi "hệ thống hiện tại chịu được bao nhiêu QPS trước
khi DB là bottleneck, và bottleneck cụ thể ở đâu" mà không cần đoán mò, viết
được 1 postmortem/ADR mạch lạc cho chính bug/quyết định trong dự án của
mình, và với security/DevOps: bạn biết chỉ ra được **3 việc cụ thể** nên
làm trước tiên nếu dự án này lên production thật (không phải 1 danh sách
20 công nghệ), và giải thích được vì sao đúng 3 việc đó là ưu tiên cao nhất.
