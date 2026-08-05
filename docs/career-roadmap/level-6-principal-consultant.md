# Level 6 — Principal / Consultant

Ở mức này, giá trị bạn tạo ra không còn đo bằng code nữa — mà bằng **quyết
định đúng, được truyền đạt rõ ràng, cho người không (hoặc ít) chuyên kỹ
thuật**, với hệ quả tài chính/tổ chức thật.

> Tự trả lời từng gạch đầu dòng trước khi xem [đáp án/giải thích chi tiết](level-6-principal-consultant-answers.md).

## Yêu cầu

- **Tư vấn chiến lược công nghệ**: đưa nhiều phương án kiến trúc kèm
  chi phí/rủi ro/thời gian cho từng phương án, không chỉ 1 giải pháp "đúng
  nhất về kỹ thuật".
- **Business acumen**: hiểu ROI, TCO (Total Cost of Ownership), cloud cost
  optimization, và liên hệ được quyết định kỹ thuật với mục tiêu kinh doanh
  (vd: "giảm latency 200ms" chỉ có giá trị nếu liên hệ được tới conversion
  rate/doanh thu).
- **Technical due diligence**: đánh giá 1 codebase/hệ thống lạ trong thời
  gian ngắn (M&A, audit trước khi ký hợp đồng), ra được báo cáo rủi ro rõ
  ràng.
- **Build vs Buy**: biết khi nào tự xây, khi nào dùng SaaS/vendor, đánh giá
  vendor lock-in.
- **Compliance & risk**: GDPR, SOC2, data residency — biết khi nào cần kéo
  chuyên gia pháp lý vào, không tự quyết định thay.
- **Chuẩn hoá tổ chức**: technology radar (công nghệ nào adopt/trial/hold/
  retire), best practices áp dụng cho nhiều team/dự án khác nhau, không
  phải 1 codebase.
- **Kỹ năng trình bày**: viết proposal, thuyết trình cho C-level, bảo vệ
  được quyết định trước phản biện gay gắt.

**Keywords**: TCO, ROI, technical due diligence, technology radar,
build-vs-buy, vendor lock-in, SOC2/GDPR, cost-benefit analysis, executive
summary, risk register, statement of work (SOW).

## Áp dụng vào `todo-app`

Ở mức này, "code demo trong todo-app" gần như không còn ý nghĩa — nhưng
chính dự án này vẫn là chất liệu tốt để luyện **artifact tư vấn thật**, vì
nó có đủ context cụ thể để phân tích thay vì nói chung chung. Bài tập đề
xuất, tự làm và tự chấm bằng cách đưa cho người khác đọc (không giải thích
thêm):

1. **Technical due diligence report (giả lập)**: đóng vai một consultant
   được thuê để đánh giá `todo-app` trước khi một công ty "mua lại"/tiếp
   quản dự án. Viết report 1 trang gồm: kiến trúc hiện tại, rủi ro (vd: 3
   backend cùng lúc là dấu hiệu thiếu quyết định rõ ràng — chi phí bảo trì
   gấp 3 lần cho cùng 1 tính năng), technical debt (thiếu test, thiếu
   migration tool, secrets hardcode trong `docker-compose.prod.yml` dùng
   giá trị mặc định), và khuyến nghị ưu tiên theo effort/impact.
2. **Build vs Buy memo**: `be-node-express` tự viết JWT + session auth từ
   đầu. Viết memo so sánh với việc dùng Auth0/Clerk/Supabase Auth — chi phí,
   tốc độ ra thị trường, rủi ro vendor lock-in, khi nào tự xây hợp lý hơn.
3. **Executive summary**: tóm tắt toàn bộ `GUIDE.md` kỹ thuật thành 5 dòng
   cho một người không biết code đọc hiểu được giá trị và rủi ro.

Nếu bạn viết được cả 3 tài liệu trên **mà không cần liệt kê thuật ngữ
technical để nghe "có vẻ giỏi"**, và người đọc không rành kỹ thuật vẫn ra
quyết định được — đó là dấu hiệu thật của Level 6.

## DevOps (tư vấn hạ tầng & vận hành)

**Yêu cầu**
- Tư vấn cloud strategy: multi-cloud vs single-vendor, đánh giá vendor
  lock-in ở mức hợp đồng/chi phí chuyển đổi, không chỉ kỹ thuật.
- FinOps ở quy mô tổ chức: cost governance giữa nhiều team/dự án, budget
  alerting, showback/chargeback.
- Chuẩn hoá công cụ DevOps cho nhiều team (technology radar riêng cho hạ
  tầng: CI/CD tool nào, IaC tool nào là chuẩn chung).
- Đánh giá mức độ trưởng thành vận hành (operational maturity assessment)
  của 1 tổ chức/dự án — tương tự security due diligence nhưng cho DevOps.

**Keywords**: FinOps, cost governance, showback/chargeback, operational
maturity assessment, cloud vendor lock-in, technology radar (hạ tầng).

**Áp dụng vào `todo-app`**: viết 1 **operational maturity assessment giả
lập** cho `todo-app` — dùng đúng cấu trúc bạn sẽ dùng cho khách hàng thật:
điểm số từng hạng mục (CI/CD, observability, disaster recovery, cost
control), bằng chứng cụ thể (vd: "CI chưa chạy test ⇒ điểm thấp ở hạng mục
Quality Gate"), và roadmap 3 giai đoạn (0-1 tháng / 1-3 tháng / 3-6 tháng)
để nâng điểm — đây chính là loại báo cáo một consultant hạ tầng giao cho
khách hàng.

## Security (tư vấn bảo mật)

**Yêu cầu**
- Security due diligence (M&A): đánh giá rủi ro bảo mật của 1 hệ thống
  trong thời gian ngắn, định lượng được rủi ro (không chỉ liệt kê lỗ hổng).
- Hiểu bối cảnh pháp lý/bảo hiểm: cyber insurance yêu cầu gì, regulatory
  landscape khác nhau giữa các thị trường (vd: GDPR ở EU vs quy định nội
  địa khác).
- Risk register: liệt kê rủi ro kèm xác suất × mức độ ảnh hưởng, không
  phải danh sách lỗ hổng kỹ thuật thuần túy.
- Giao tiếp rủi ro bảo mật cho C-level: quy đổi rủi ro kỹ thuật thành rủi ro
  kinh doanh/pháp lý/uy tín.

**Keywords**: security due diligence, cyber insurance, regulatory
landscape, risk register (probability × impact), risk-to-business
translation.

**Áp dụng vào `todo-app`**: viết 1 **risk register giả lập** cho `todo-app`
với ít nhất 5 rủi ro thật đã biết từ dự án (vd: "3 backend cùng schema,
không đồng bộ auth ⇒ xác suất trung bình, ảnh hưởng cao nếu 1 backend thiếu
patch bảo mật mà 2 backend kia không hay biết"; "DB user dùng superuser
`postgres` ⇒ xác suất thấp, ảnh hưởng nghiêm trọng nếu bị khai thác"), mỗi
rủi ro có cột xác suất, ảnh hưởng, và khuyến nghị xử lý — rồi tự hỏi: "nếu
tôi là CFO/CEO đọc bảng này, tôi có biết nên ưu tiên chi tiền vào đâu
không?"

## Cách tự kiểm tra đã qua Level 6

Một stakeholder phi kỹ thuật đọc xong tài liệu của bạn, hiểu đúng rủi ro,
và tự tin ra quyết định (đầu tư/không đầu tư, mua/tự xây) — mà không cần
gọi bạn giải thích thêm.
