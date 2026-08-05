# Level 5 — Đáp án / Giải thích chi tiết

Giải thích từng gạch đầu dòng trong
[level-5-staff-lead.md](level-5-staff-lead.md). Ở mức này, mỗi khái niệm
gắn liền với 1 CÂU HỎI bạn phải tự trả lời được cho tổ chức của mình, không
chỉ định nghĩa suông.

## Yêu cầu chung (FE + BE)

**Microservices vs modular monolith, khi nào KHÔNG nên tách**
Modular monolith: 1 codebase, 1 lần deploy, nhưng code được tổ chức thành
module có ranh giới rõ (tương tự "module boundaries" ở Level 4) — đơn giản
vận hành, transaction xuyên module dễ (cùng 1 DB, dùng transaction SQL bình
thường). Microservices: mỗi service tự deploy độc lập, tự chọn công nghệ
riêng — đổi lại phải giải quyết: gọi nhau qua network (chậm hơn gọi hàm nội
bộ, có thể lỗi), transaction xuyên service phức tạp (cần Saga pattern thay
vì `COMMIT`/`ROLLBACK` đơn giản), và chi phí vận hành N service thay vì 1.
Câu hỏi tự hỏi: "team của tôi có đủ người để vận hành N service độc lập
không, hay tôi đang tách vì nghe 'cool' chứ không phải vì cần?"

**Domain-Driven Design: bounded context**
Bounded context là ranh giới trong đó 1 khái niệm nghiệp vụ có 1 NGHĨA DUY
NHẤT và 1 model duy nhất — ví dụ "User" trong context "Auth" (chỉ cần
email/password/role) khác hẳn "User" trong context "Billing" (cần địa chỉ,
phương thức thanh toán). Sai lầm phổ biến: dùng 1 bảng/model "User" khổng lồ
dùng chung cho mọi nghiệp vụ, khiến mọi thay đổi ở 1 chỗ có nguy cơ phá vỡ
chỗ khác không liên quan.

**API Gateway, BFF (Backend for Frontend) pattern**
API Gateway là 1 điểm vào duy nhất phía trước nhiều service — xử lý auth,
rate limiting, routing chung, để từng service không phải tự implement lại.
BFF là 1 lớp API RIÊNG cho từng loại client (web BFF khác mobile BFF) — vì
web và mobile thường cần shape dữ liệu khác nhau (mobile cần ít field hơn để
tiết kiệm băng thông) — tránh 1 API "chung chung" phải thoả mãn mọi client
và trở nên cồng kềnh.

**Roadmap kỹ thuật: technical debt, impact vs effort**
Technical debt là phần "nợ" phát sinh khi chọn giải pháp nhanh thay vì giải
pháp đúng (hợp lý lúc đó, nhưng cần trả sau). Ưu tiên hoá bằng ma trận
impact (ảnh hưởng nếu không sửa) × effort (công sức để sửa) — ưu tiên
"impact cao, effort thấp" trước. Thuyết phục stakeholder không kỹ thuật
nghĩa là quy đổi được nợ kỹ thuật thành ngôn ngữ họ hiểu (tốc độ ra tính
năng chậm dần, rủi ro downtime) thay vì nói "code xấu cần refactor".

**Incident management: on-call, blameless postmortem, action items**
On-call rotation: luân phiên ai chịu trách nhiệm phản hồi sự cố ngoài giờ.
Blameless postmortem: viết báo cáo sự cố tập trung vào QUY TRÌNH/HỆ THỐNG
nào cho phép lỗi xảy ra (không phải "ai đã code sai") — vì đổ lỗi cá nhân
khiến người sau giấu lỗi thay vì báo cáo, làm hệ thống KHÓ cải thiện hơn.
Action item phải có người sở hữu cụ thể + deadline — nếu không, postmortem
chỉ là 1 tài liệu đọc xong rồi quên.

**Mentorship quy mô, RFC**
Mentorship quy mô là thiết kế được lộ trình phát triển cho CẢ team (như bộ
tài liệu bạn đang đọc), không chỉ review code 1-1. RFC (Request for
Comments) là tài liệu trình bày 1 vấn đề + nhiều phương án + đánh đổi từng
phương án, gửi cho nhiều người GÓP Ý trước khi quyết định — khác ADR (ghi
lại quyết định ĐÃ chọn), RFC là bước THẢO LUẬN trước khi có quyết định.

## DevOps (Platform / SRE)

**Platform engineering: internal developer platform (IDP)**
Xây dựng công cụ/quy trình nội bộ để các team khác TỰ deploy, tự cấp phát
tài nguyên (DB, queue...) mà không cần hiểu Kubernetes/Terraform bên dưới —
qua 1 giao diện/CLI đơn giản hoá. Mục tiêu: giảm số lần team platform phải
"làm hộ" từng yêu cầu, tăng tốc độ tự chủ của các team sản phẩm.

**SRE: SLA/SLO/SLI, error budget**
SLI (Service Level Indicator) là 1 con số ĐO ĐƯỢC (vd: % request thành công).
SLO (Service Level Objective) là mục tiêu nội bộ cho SLI đó (vd: 99.5% trong
30 ngày). SLA (Service Level Agreement) là CAM KẾT với khách hàng, thường
kèm bồi thường nếu không đạt — luôn lỏng hơn SLO nội bộ (để có biên an
toàn). Error budget = 100% - SLO (vd: SLO 99.5% ⇒ error budget 0.5% thời
gian được phép lỗi/downtime) — khi budget còn, team được ưu tiên ship tính
năng mới; khi budget cạn, team PHẢI dừng ship tính năng, tập trung vá ổn
định.

**Multi-region/DR: RTO/RPO, backup và test restore thật**
RTO (Recovery Time Objective): tối đa bao lâu được phép DOWNTIME trước khi
khôi phục xong. RPO (Recovery Point Objective): tối đa được phép MẤT bao
nhiêu dữ liệu (tính theo thời gian, vd: RPO 1 giờ = backup mỗi giờ, mất tối
đa 1 giờ dữ liệu gần nhất). "Test restore thật" là điểm hay bị bỏ qua nhất:
có backup không đồng nghĩa PHỤC HỒI ĐƯỢC — file backup lỗi/thiếu chỉ phát
hiện ra khi thử restore thật, tốt nhất là định kỳ, không phải đợi lúc sự cố
thật mới thử lần đầu.

**Chaos engineering**
Chủ động gây lỗi có kiểm soát trong môi trường production (hoặc gần giống
production) — vd: tắt ngẫu nhiên 1 instance, làm chậm network giả lập — để
phát hiện điểm yếu (thiếu retry, thiếu timeout, single point of failure)
TRƯỚC khi nó tự xảy ra vào lúc không ai ngờ tới. Chỉ hợp lý khi hệ thống đã
đủ trưởng thành về observability để đo được tác động.

**Cost optimization: right-sizing, reserved instance, FinOps**
Right-sizing: chọn đúng kích thước tài nguyên (không quá dư thừa "cho chắc")
dựa trên metric sử dụng thật. Reserved instance/savings plan: cam kết dùng
lâu dài với cloud provider để đổi lấy giá rẻ hơn on-demand — đánh đổi là mất
linh hoạt nếu nhu cầu giảm. FinOps là thực hành/văn hoá quản lý chi phí cloud
liên tục (không phải 1 lần dọn dẹp), thường cần hợp tác giữa kỹ thuật và tài
chính.

## Security (Security Leadership)

**Zero trust, SSO/OIDC**
Zero trust: KHÔNG mặc định tin bất kỳ request nào chỉ vì nó tới từ "trong
mạng nội bộ" — mọi request đều phải xác thực/xác quyền, kể cả giữa các
service nội bộ với nhau (ngược với mô hình cũ "trong tường lửa = an toàn").
SSO (Single Sign-On)/OIDC (OpenID Connect — giao thức chuẩn cho SSO) cho
phép 1 lần đăng nhập dùng được cho nhiều hệ thống nội bộ, giảm số nơi lưu
password (giảm diện tấn công) và tập trung được việc thu hồi quyền truy cập
khi nhân viên nghỉ việc.

**Incident response process: playbook, severity, postmortem**
Playbook là quy trình CÓ SẴN cho từng loại sự cố (không phải nghĩ ra lúc
đang cháy nhà) — ai làm gì đầu tiên, escalate cho ai. Severity classification
phân loại mức độ nghiêm trọng (vd: Sev1 = toàn hệ thống down, Sev4 = lỗi nhỏ
không ảnh hưởng user) để quyết định tốc độ phản hồi tương ứng. Security
postmortem đặc biệt hơn postmortem kỹ thuật thường: có thể cần thông báo
pháp lý (nếu lộ dữ liệu cá nhân, một số luật YÊU CẦU thông báo trong thời
hạn nhất định) và truyền thông (nếu ảnh hưởng khách hàng).

**Triển khai thực tế 1 compliance framework (SOC2/ISO27001/GDPR)**
Đây không phải việc đọc checklist rồi tick — là điều phối được NHIỀU team
(kỹ thuật, pháp lý, HR) thu thập bằng chứng tuân thủ (access log, quy trình
review code, đào tạo nhân viên) để vượt qua audit của bên thứ 3 (auditor
độc lập cấp chứng chỉ SOC2/ISO27001). GDPR là luật (không phải chứng chỉ tự
nguyện) về quyền riêng tư dữ liệu ở EU — áp dụng cả khi công ty ở ngoài EU
nếu có user EU.

**Security champions program**
Thay vì 1 team security trung tâm cố gắng review MỌI thứ (nghẽn cổ chai,
không scale khi tổ chức lớn), mỗi team sản phẩm có 1 người được đào tạo
thêm để làm điểm liên lạc security trong chính team đó — biết khi nào cần
kéo team security trung tâm vào, và tự xử lý được các vấn đề cơ bản.

## Cách dùng file này để tự luyện

Ở Level 5, thay vì "học thuộc định nghĩa", hãy tự viết ra 1 câu hỏi cho
CHÍNH tổ chức/dự án bạn đang làm ứng với mỗi mục — nếu bạn không trả lời
được câu hỏi đó cho dự án thật của mình, đó là khoảng trống cần lấp trước
khi nhận trách nhiệm ở mức này.
