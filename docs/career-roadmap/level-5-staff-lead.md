# Level 5 — Staff / Tech Lead

Ở mức này, phạm vi ảnh hưởng vượt ra ngoài 1 codebase — bạn chịu trách nhiệm
cho **quyết định kỹ thuật của nhiều team**, không chỉ chất lượng code bạn
viết. Yêu cầu FE/BE không còn tách biệt rõ ràng nữa — phần lớn là kiến thức
kiến trúc hệ thống và lãnh đạo kỹ thuật dùng chung cho cả 2 mảng.

> Tự trả lời từng gạch đầu dòng trước khi xem [đáp án/giải thích chi tiết](level-5-staff-lead-answers.md).

## Yêu cầu chung (FE + BE)

- Thiết kế kiến trúc đa service: microservices vs modular monolith — biết
  khi nào KHÔNG nên tách microservices (chi phí vận hành, distributed
  transaction, network latency).
- Domain-Driven Design ở mức thực dụng: bounded context, tránh 1 model dùng
  chung cho mọi nghiệp vụ.
- API Gateway, BFF (Backend for Frontend) pattern khi nhiều client
  (web/mobile) cần API khác nhau từ cùng 1 hệ thống.
- Roadmap kỹ thuật: đánh giá technical debt, ưu tiên hoá (impact vs effort),
  thuyết phục được stakeholder không kỹ thuật.
- Incident management: on-call rotation, postmortem không đổ lỗi
  (blameless), action item có người sở hữu + deadline.
- Mentorship quy mô: thiết kế lộ trình lên level cho cả team (đây chính là
  loại tài liệu bạn đang đọc!), không chỉ 1-1 code review.
- Viết RFC (Request for Comments) cho quyết định lớn, thu thập phản biện từ
  nhiều team trước khi quyết.

**Keywords**: bounded context, BFF pattern, service mesh, API Gateway,
distributed transaction (Saga pattern), blameless postmortem, RFC, technical
debt quantification, on-call rotation, multi-region deployment, feature
flag / progressive rollout.

**Áp dụng vào `todo-app`**: một dự án CRUD nhỏ **không phải là môi trường
để thể hiện microservices/multi-region thật** — cố tách `todo-app` thành
microservices sẽ là ví dụ kinh điển của "over-engineering", và một Staff
giỏi phải nhận ra điều đó thay vì làm theo checklist. Bài tập đúng ở mức
này: viết 1 **RFC giả lập** trả lời "Giả sử `todo-app` phải phục vụ 10 triệu
user, những phần nào trong kiến trúc hiện tại (3 backend cùng 1 DB, session
lưu Postgres, không cache, không queue) sẽ vỡ đầu tiên, theo thứ tự?" — và
tự chấm điểm câu trả lời của mình bằng cách đối chiếu với
[level-4-senior.md](level-4-senior.md) (mọi điểm bạn liệt kê phải giải thích
được *tại sao* nó vỡ, không chỉ liệt kê tên công nghệ).

## DevOps (Platform / SRE)

**Yêu cầu**
- Platform engineering: xây internal developer platform để team khác tự
  deploy được mà không cần hiểu hết hạ tầng bên dưới.
- SRE thực hành: định nghĩa SLA/SLO/SLI cho từng service, error budget, và
  dùng error budget để quyết định "được phép ship tính năng mới hay phải
  dừng lại vá ổn định".
- Multi-region/disaster recovery: RTO (Recovery Time Objective)/RPO
  (Recovery Point Objective), chiến lược backup và test restore thật
  (không chỉ backup rồi không bao giờ thử phục hồi).
- Chaos engineering: chủ động gây lỗi có kiểm soát để tìm điểm yếu trước khi
  nó tự xảy ra trong production.
- Cost optimization ở quy mô tổ chức: right-sizing, reserved
  instance/savings plan, phát hiện lãng phí giữa nhiều team.

**Keywords**: SLA/SLO/SLI, error budget, RTO/RPO, disaster recovery,
chaos engineering, platform engineering, internal developer platform (IDP),
FinOps, right-sizing.

**Áp dụng vào `todo-app`**: không có hạ tầng thật để thực hành phần này.
Bài tập đúng: viết 1 **SLO giả định** cho `todo-app` nếu nó là sản phẩm thật
(vd: "99.5% request tới `/api/todos` phản hồi dưới 300ms trong 1 tháng"),
tính thử error budget tương ứng (bao nhiêu phút downtime/lỗi được phép
trong tháng đó), và liệt kê hạ tầng hiện tại (1 Postgres instance, không
replica, không backup tự động trong `docker-compose.yml`) có đáp ứng được
SLO đó không — câu trả lời trung thực nên là "không, vì X".

## Security (Security Leadership)

**Yêu cầu**
- Kiến trúc security cho toàn tổ chức: zero trust (không mặc định tin
  network nội bộ), identity-first security (SSO/OIDC cho mọi hệ thống nội
  bộ).
- Incident response process chính thức: playbook, phân loại mức độ nghiêm
  trọng (severity), thời gian phản hồi theo SLA, security postmortem
  (không chỉ kỹ thuật mà cả pháp lý/truyền thông nếu cần).
- Triển khai thực tế 1 compliance framework (SOC2/ISO27001/GDPR) — không
  chỉ đọc checklist mà điều phối được audit thật với nhiều team.
- Security champions program: mỗi team có 1 người phụ trách theo dõi
  security thay vì dồn hết trách nhiệm cho 1 security team trung tâm.

**Keywords**: zero trust, SSO/OIDC, incident response playbook, severity
classification, SOC2/ISO27001/GDPR, security champions, security postmortem.

**Áp dụng vào `todo-app`**: tương tự DevOps ở mức này, không có tổ chức
thật để áp dụng — nhưng bug `authenticateSession` (crash khi lỗi async
không được bắt) đã tìm thấy trong dự án là chất liệu tốt để viết 1
**incident response playbook giả lập**: nếu bug này xảy ra trên production
lúc 2h sáng, ai được page, mức độ nghiêm trọng là gì (service down hoàn
toàn hay chỉ 1 route), thời gian phản hồi kỳ vọng là bao lâu, và bước đầu
tiên khi on-call nhận alert là gì.

## Cách tự kiểm tra đã qua Level 5

Bạn viết được 1 RFC 1 trang mà một kỹ sư khác đọc xong hiểu được vấn đề,
các phương án, và trade-off của từng phương án — không cần bạn giải thích
thêm bằng lời. Bạn phân biệt được lúc nào nên nói "không" với một đề xuất
kỹ thuật (vd: "chưa cần microservices") thay vì luôn đề xuất giải pháp phức
tạp nhất, và bạn định nghĩa được SLO cho 1 service cụ thể kèm error budget
đi kèm.
