# Level 6 — Đáp án / Giải thích chi tiết

Giải thích từng gạch đầu dòng trong
[level-6-principal-consultant.md](level-6-principal-consultant.md). Ở mức
này, phần lớn khái niệm đến từ tài chính/quản trị hơn là kỹ thuật thuần —
nếu thấy lạ, đó là dấu hiệu đúng của việc lên level, không phải bạn đang
học nhầm tài liệu.

## Yêu cầu

**Tư vấn chiến lược công nghệ: nhiều phương án kèm chi phí/rủi ro/thời gian**
Một kỹ sư thường đưa ra "giải pháp đúng nhất về kỹ thuật". Một consultant
giỏi đưa ra ÍT NHẤT 2-3 phương án (vd: "tự xây" / "dùng SaaS" / "không làm
gì cả — chấp nhận rủi ro hiện tại"), mỗi phương án kèm chi phí ước tính,
rủi ro cụ thể, và thời gian triển khai — để NGƯỜI RA QUYẾT ĐỊNH (thường
không phải kỹ sư) chọn, thay vì áp đặt 1 lựa chọn.

**Business acumen: ROI, TCO, liên hệ quyết định kỹ thuật với mục tiêu kinh doanh**
ROI (Return on Investment) = lợi ích thu về so với chi phí bỏ ra. TCO (Total
Cost of Ownership) = TỔNG chi phí thật của 1 giải pháp qua thời gian, không
chỉ giá mua ban đầu (gồm cả chi phí vận hành, bảo trì, đào tạo, rủi ro).
"Liên hệ với mục tiêu kinh doanh" nghĩa là: câu "giảm latency 200ms" tự nó
không có giá trị với người không kỹ thuật — phải nối tiếp bằng "...giúp tăng
X% conversion rate, tương đương Y đồng doanh thu/năm" để họ hiểu TẠI SAO nên
đầu tư.

**Technical due diligence**
Đánh giá 1 hệ thống/codebase LẠ trong thời gian ngắn (thường vài ngày tới
vài tuần) — điển hình khi 1 công ty chuẩn bị mua lại (M&A) hoặc thuê ngoài
1 đội đã xây sẵn hệ thống. Kết quả là 1 báo cáo rủi ro: kiến trúc hiện tại
ra sao, nợ kỹ thuật ở đâu, đội ngũ hiện tại có đủ hiểu hệ thống để bàn giao
không — giúp bên mua/thuê định giá đúng và biết rủi ro đang mua phải gì.

**Build vs Buy**
Quyết định tự xây (build) hay dùng dịch vụ có sẵn (buy/SaaS) cho 1 tính năng.
Tự xây: kiểm soát toàn bộ, không phụ thuộc bên thứ 3, nhưng tốn thời gian/
nhân lực duy trì lâu dài. Buy: ra thị trường nhanh hơn, nhưng có "vendor
lock-in" (chi phí/rủi ro khi muốn CHUYỂN khỏi vendor đó sau này — dữ liệu
khó export, API độc quyền, tăng giá mà không có lựa chọn khác). Quyết định
đúng phụ thuộc: tính năng đó có phải LỢI THẾ CẠNH TRANH cốt lõi không (nếu
có, nên tự xây), hay chỉ là hạ tầng phụ trợ (nên mua).

**Compliance & risk: GDPR, SOC2, data residency**
GDPR (luật, bắt buộc nếu có user EU), SOC2 (chứng chỉ tự nguyện, thường
khách hàng doanh nghiệp B2B yêu cầu trước khi ký hợp đồng). Data residency
là yêu cầu dữ liệu của user ở 1 quốc gia/khu vực PHẢI được lưu trữ vật lý
trong khu vực đó (không phải trên server ở nước khác) — 1 số ngành/quốc gia
bắt buộc. Việc của Principal/Consultant không phải TỰ quyết định các vấn đề
pháp lý này, mà là NHẬN RA khi nào cần kéo chuyên gia pháp lý vào trước khi
đưa ra cam kết kỹ thuật.

**Chuẩn hoá tổ chức: technology radar**
Technology radar là 1 bản đồ phân loại công nghệ theo 4 vùng: Adopt (dùng
rộng rãi, đã chứng minh hiệu quả), Trial (thử nghiệm có kiểm soát), Hold
(không dùng thêm cho dự án mới, nhưng không bắt buộc gỡ bỏ), Retire (chủ
động loại bỏ dần). Công cụ này giúp nhiều team trong tổ chức không mỗi
người 1 lựa chọn công nghệ khác nhau cho cùng 1 vấn đề, gây khó khăn khi
luân chuyển nhân sự giữa các team.

**Kỹ năng trình bày: proposal, C-level presentation**
Viết proposal và trình bày cho C-level đòi hỏi NÉN thông tin kỹ thuật phức
tạp thành vài điểm chính, dẫn dắt bằng KẾT LUẬN/KHUYẾN NGHỊ trước (executive
summary), chi tiết kỹ thuật để ở phụ lục cho ai cần đọc sâu — ngược hoàn
toàn với cách trình bày kỹ thuật thông thường (dẫn dắt từ chi tiết tới kết
luận).

## DevOps (tư vấn hạ tầng & vận hành)

**Tư vấn cloud strategy: multi-cloud vs single-vendor**
Single-vendor (chỉ dùng 1 cloud, vd: chỉ AWS): đơn giản vận hành, tận dụng
được chiết khấu theo volume, nhưng vendor lock-in cao. Multi-cloud: giảm
rủi ro phụ thuộc 1 vendor (đàm phán giá tốt hơn, tránh gián đoạn nếu 1
vendor gặp sự cố lớn), nhưng tăng độ phức tạp vận hành và thường KHÔNG tận
dụng được hết tính năng độc quyền của từng cloud. Đánh giá vendor lock-in
phải tính cả chi phí HỢP ĐỒNG (penalty khi rời sớm) chứ không chỉ chi phí kỹ
thuật để migrate.

**FinOps ở quy mô tổ chức**
Quản lý chi phí cloud khi có NHIỀU team cùng dùng chung tài khoản cloud:
cost governance (ai được phép tạo tài nguyên gì), budget alerting (cảnh báo
khi 1 team vượt ngân sách), showback (cho team thấy họ đang tốn bao nhiêu,
không bắt trả) hoặc chargeback (thực sự tính chi phí vào ngân sách team đó)
— để chi phí không trở thành "vấn đề chung không ai chịu trách nhiệm".

**Chuẩn hoá công cụ DevOps cho nhiều team**
Tương tự technology radar ở phần "Yêu cầu" chung, nhưng riêng cho hạ tầng:
nếu mỗi team tự chọn CI/CD tool, IaC tool khác nhau, tổ chức mất khả năng
luân chuyển nhân sự, khó audit tổng thể, và tốn nhiều license/chi phí vận
hành trùng lặp hơn cần thiết.

**Operational maturity assessment**
Đánh giá "mức độ trưởng thành" vận hành của 1 tổ chức/dự án theo nhiều hạng
mục (CI/CD, observability, disaster recovery, cost control...) — tương tự
security due diligence nhưng cho khía cạnh vận hành. Kết quả thường là 1
bảng điểm + roadmap cải thiện theo giai đoạn, dùng để CẢ đánh giá nội bộ lẫn
tư vấn cho khách hàng bên ngoài.

## Security (tư vấn bảo mật)

**Security due diligence (M&A)**
Tương tự technical due diligence nhưng tập trung vào rủi ro bảo mật khi 1
công ty chuẩn bị mua lại/sáp nhập công ty khác — đánh giá trong thời gian
ngắn, phải ĐỊNH LƯỢNG được rủi ro (không chỉ liệt kê lỗ hổng kỹ thuật) vì
kết quả ảnh hưởng trực tiếp tới GIÁ mua lại hoặc điều khoản hợp đồng.

**Cyber insurance, regulatory landscape**
Cyber insurance (bảo hiểm an ninh mạng) thường YÊU CẦU tổ chức đáp ứng 1 số
tiêu chuẩn bảo mật tối thiểu trước khi được bảo hiểm (và mức phí phụ thuộc
mức độ đáp ứng) — hiểu yêu cầu này giúp tư vấn đúng mức đầu tư bảo mật cần
thiết. Regulatory landscape khác nhau giữa các thị trường (GDPR ở EU, các
quy định khác ở từng quốc gia) — 1 giải pháp tuân thủ ở thị trường này có
thể KHÔNG đủ ở thị trường khác.

**Risk register: probability × impact**
Khác 1 danh sách lỗ hổng kỹ thuật thuần tuý, risk register định lượng mỗi
rủi ro theo XÁC SUẤT xảy ra × MỨC ĐỘ ẢNH HƯỞNG nếu xảy ra — cho phép SO SÁNH
và ưu tiên giữa các rủi ro khác loại (vd: so sánh được "rủi ro kỹ thuật A"
với "rủi ro vận hành B" trên cùng 1 thang đo).

**Giao tiếp rủi ro bảo mật cho C-level**
Quy đổi rủi ro kỹ thuật ("thiếu rate limiting") thành rủi ro mà C-level thực
sự quan tâm: kinh doanh (mất khách hàng nếu bị tấn công), pháp lý (phạt nếu
vi phạm compliance), uy tín (tin tức tiêu cực nếu bị lộ dữ liệu) — vì C-level
ra quyết định đầu tư dựa trên NHỮNG rủi ro này, không phải thuật ngữ kỹ
thuật.

## Cách dùng file này để tự luyện

Với mỗi mục, tự hỏi: "Nếu tôi phải giải thích khái niệm này cho 1 người bạn
không làm kỹ thuật trong 2 câu, tôi nói gì?" — nếu không trả lời được ngắn
gọn, nghĩa là bạn hiểu khái niệm nhưng CHƯA đủ để tư vấn nó cho người khác,
đó chính là kỹ năng riêng biệt của Level 6 so với các level trước.
