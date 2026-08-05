# Lộ trình Level Full-stack + DevOps + Security: Level 1 → Consultant

Bộ tài liệu này dùng để **tự review** kiến thức bản thân theo từng cấp độ,
và biết chính xác còn thiếu gì để lên Senior/Consultant. Mỗi file level có 4
mảng — **Frontend, Backend, DevOps, Security** (từ Level 5 trở đi, FE/BE gộp
chung vì ranh giới không còn rõ) — và mỗi mảng có 3 phần:

1. **Yêu cầu** — kỹ năng/kiến thức cần có ở cấp độ đó.
2. **Keywords** — từ khóa để tự search, tự học, hoặc dùng khi review CV/phỏng vấn.
3. **Áp dụng vào `todo-app`** — phần nào trong chính dự án này đã thể hiện
   được yêu cầu đó, và phần nào **còn thiếu**.

## Danh sách level

Mỗi level có 2 file: file **Yêu cầu** (đề bài — đọc trước, tự trả lời trước
khi mở file đáp án) và file **Đáp án** (giải thích chi tiết từng gạch đầu
dòng trong file Yêu cầu).

| Yêu cầu | Đáp án | Level | Kinh nghiệm tương ứng (tham khảo) |
| :--- | :--- | :--- | :--- |
| [level-1-fresher.md](level-1-fresher.md) | [→ đáp án](level-1-fresher-answers.md) | Fresher / Intern | 0–6 tháng |
| [level-2-junior.md](level-2-junior.md) | [→ đáp án](level-2-junior-answers.md) | Junior | 6 tháng – 1.5 năm |
| [level-3-mid.md](level-3-mid.md) | [→ đáp án](level-3-mid-answers.md) | Middle | 1.5 – 3 năm |
| [level-4-senior.md](level-4-senior.md) | [→ đáp án](level-4-senior-answers.md) | Senior | 3 – 6 năm |
| [level-5-staff-lead.md](level-5-staff-lead.md) | [→ đáp án](level-5-staff-lead-answers.md) | Staff / Tech Lead | 6 – 10 năm |
| [level-6-principal-consultant.md](level-6-principal-consultant.md) | [→ đáp án](level-6-principal-consultant-answers.md) | Principal / Consultant | 10+ năm |
| [gap-analysis.md](gap-analysis.md) | — | — | Tổng hợp: `todo-app` đang ở đâu, làm gì tiếp theo |
| [foresight-gap-analysis.md](foresight-gap-analysis.md) | — | — | Ví dụ thật từ nền tảng production thật (Foresight, 28 repo, công ty Piscada) cho từng level — không phải dự án để sửa, chỉ để đối chiếu |
| [pmp4-gap-analysis.md](pmp4-gap-analysis.md) | — | — | Ví dụ thật (đúng lẫn sai, có trích dẫn file/dòng) từ PMP4 (`webpmp` + `native-v4`, công ty Piscada) cho từng level — không phải dự án để sửa, chỉ để đối chiếu |

**Cách dùng đúng**: đọc file Yêu cầu, TỰ trả lời từng gạch đầu dòng trước
(viết ra hoặc nói to), rồi mới mở file Đáp án để đối chiếu. Mở đáp án trước
khi tự thử sẽ khiến bạn đánh giá sai khả năng thật của mình.

## Cách đọc thang level này

- **Level không cộng dồn tuyến tính 100%** — một senior giỏi FE có thể yếu
  hệ thống distributed, và ngược lại. Coi đây là **khung tham chiếu**, không
  phải checklist cứng.
- Từ **Level 4 (Senior) trở lên**, ranh giới giữa "biết code" và "biết đánh
  đổi/thiết kế/giao tiếp" ngày càng rõ. Từ Level 5-6, một phần yêu cầu
  **không thể hiện được bằng code trong 1 dự án todo-app nhỏ** — phần "Áp
  dụng vào todo-app" ở các file đó sẽ gợi ý viết **artifact** (ADR, RFC,
  postmortem, cost/tradeoff doc) lấy chính dự án này làm chủ đề, vì đó chính
  là loại sản phẩm một Staff/Principal/Consultant thực sự tạo ra.
- Khi phỏng vấn Senior/Consultant, người ta hỏi **"tại sao"** và **"đánh đổi
  là gì"** nhiều hơn **"làm sao"**. Ưu tiên trả lời được câu hỏi "vì sao chọn
  X thay vì Y" cho mọi quyết định trong dự án.

## Ghi chú về `todo-app` hiện tại

Dự án có 3 backend (`be-node-express`, `be-nestjs`, `be-fastapi`) và 2
frontend (`fe-vite`, `fe-nextjs`). Riêng `be-node-express` đã được refactor
thành kiến trúc layered với JWT + session auth, REST + GraphQL, index/JOIN/
aggregate SQL (xem [`be-node-express/GUIDE.md`](../../be-node-express/GUIDE.md)).
Đây là baseline dùng để đối chiếu trong toàn bộ tài liệu này.

Về hạ tầng: dự án chạy bằng Docker + `docker-compose` (tách `dev`/`prod`) và
1 pipeline GitHub Actions build-per-service
([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) — chưa có
Kubernetes, chưa có test/security-scan trong CI. Về bảo mật: đã có
`bcrypt`, parameterized query, JWT refresh rotation, rate limiting; **chưa
có** security headers (`helmet`), SAST/dependency-scan trong CI, hay
secrets manager thật. Chi tiết đầy đủ ở từng level và ở
[gap-analysis.md](gap-analysis.md).
