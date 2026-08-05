# Gap Analysis: Foresight Platform đối chiếu với thang level

`foresight-2` (`/Users/aminhp93/working/foresight-2/repo`) là checkout cục bộ
của **Foresight** — nền tảng Building Intelligence thật của Piscada (công ty
Na Uy, đang gọi Series A $8M, 766 khách hàng thật, 1,500 tòa nhà thật) — gồm
**32 repo** (sau khi archive 4 repo legacy còn **28**), chạy production thật
trên GKE. Khác hẳn `pmp4-sim` (1 dự án mô phỏng để học), đây là **hệ thống
thật đang phục vụ khách hàng thật**, nên hầu như mọi level từ 1-6 đều có ví
dụ thật, nhiều hơn hẳn những gì 1 dự án cá nhân có thể tạo ra — giá trị của
file này là **trích ra ví dụ thật kèm đường dẫn cụ thể**, không phải "học
Foresight" (bạn không sửa được code này, không phải dự án của bạn).

File này dùng song song với `level-N-*.md` và không thay thế chúng — đọc
"Yêu cầu"/"Keywords" ở file level tương ứng trước, rồi quay lại đây để thấy
"đây là ví dụ thật, ở công ty thật, người ta làm y hệt khái niệm đó như thế
nào".

## Tóm tắt theo level

| Level | Độ giàu ví dụ | Ghi chú |
| :--- | :--- | :--- |
| 1 — Fresher | 🔴 Không phải chỗ để học | Toàn bộ codebase đã ở mức layered/TypeScript nghiêm ngặt ngay từ đầu — không có ví dụ "1 file làm hết" để soi. Dùng `todo-app` cho level này. |
| 2 — Junior | 🟢 Tốt | Custom hook convention rất rõ ràng, CORS thật (tự tay sửa trong session), quan hệ dữ liệu qua bảng thật trong Postgres |
| 3 — Middle | 🟢 Rất tốt | TanStack Query đúng chuẩn, batching chống N+1 thật, schema migration có review qua PR, test pyramid đầy đủ (Vitest/Playwright/MSW) |
| 4 — Senior | 🟢 Xuất sắc | GraphQL Federation thật, NATS JetStream, K8s + FluxCD GitOps, supply-chain security 4 lớp, Sealed Secrets, Jaeger tracing, SBOM scan trong CI |
| 5 — Staff | 🟢 Có chất liệu RFC thật | Bounded context thật (không phải lý thuyết), CAP-theorem trade-off thật quan sát được (BGS replication), technical debt thật (frontend 2 stack song song) |
| 6 — Consultant | 🟢 Có chất liệu due-diligence thật | Đã dùng chính codebase này làm due diligence + build-vs-buy + risk register thật trong các lượt hội thoại trước — xem phần cuối file |

## Level 2 — Junior

**Frontend — custom hook convention chuẩn hoá toàn platform**: mọi data hook
trong `foresight-cloud-bms/src/hooks/data/` theo đúng 1 khuôn 3 file
(`index.types.ts` chỉ chứa type, `query.ts` chứa GraphQL document + query
factory, `index.ts` là hook tiêu dùng) — quy ước này được viết thành luật
trong `foresight-cloud-bms/AGENTS.md`, không phải tự phát. Đọc file này là
cách nhanh nhất thấy "custom hook nên tách ra sao" ở mức tổ chức nhiều team,
không phải 1 file `useSomething.ts` tự do.

**Backend — CORS đúng/sai, tự tay sửa trong chính session này**: khi chạy
BGS local, phát hiện `foresight-bgs/API/Program.cs` **comment hẳn dòng
`app.UseCors()`** (dòng ~85 bản gốc) — vì production thật không cần CORS
(mọi request qua oauth2-proxy/ingress-nginx cùng origin), CORS chỉ cần khi
gọi thẳng từ browser local. Đây là ví dụ thật (không phải lý thuyết) cho câu
hỏi "tại sao 1 API thật không có CORS mà vẫn chạy đúng production" — vì
CORS là 1 concern của **trình duyệt gọi cross-origin**, không phải của mọi
API luôn luôn cần.

**Backend — quan hệ dữ liệu qua bảng nối thật**: BGS lưu Brick-graph trên
Postgres bằng bảng nối tường minh kiểu `r_org_ismemberof_`/`r_org_hasmember_`
(quan sát được trực tiếp qua log khi seed data — mỗi quan hệ có **2 bảng**,
1 chiều thuận + 1 chiều nghịch, thay vì 1 cột FK) — ví dụ thật cho khái niệm
"quan hệ nhiều-nhiều cần bảng trung gian, và khi cần truy vấn 2 chiều nhanh,
đôi khi denormalize thành 2 bảng thay vì 1 bảng + query ngược".

## Level 3 — Middle

**Frontend — TanStack Query đúng chuẩn, không phải `useEffect` thô**: toàn
bộ `foresight-cloud-bms` dùng `queryOptions(...)` factory pattern (không bao
giờ inline option vào `useQuery`), `staleTime`/`gcTime` được set có chủ đích
khác nhau theo loại dữ liệu (`Number.POSITIVE_INFINITY` cho danh sách tòa
nhà — gần như không đổi trong phiên; `30_000`ms cho giá trị cảm biến —
sống động) — đọc `AGENTS.md` mục "TanStack Query pattern" để thấy lý do
từng con số, không phải mặc định copy-paste.

**Backend — chống N+1 thật, có thư viện riêng**: `foresight-components/src/batching`
export `batchArray`/`calculateOptimalBatchSize`/`combineBatchResults` — khi
1 hook cần load N entity mà N có thể lên tới hàng nghìn (vd building theo
portfolio lớn), code **tự chia batch** (mặc định tối đa 100/request) thay vì
gửi 1 query khổng lồ hoặc N query riêng lẻ — đây là câu trả lời thật cho
"N+1 query" ở quy mô GraphQL (khác SQL N+1 nhưng cùng nguyên lý: đừng gọi
N lần khi có thể gộp).

**Backend — migration có version, có review, sinh tự động**: schema BGS
**không viết tay** — nguồn thật là `fs-b-backend/Engine/SampleInputData/_Schema.bodil`,
mọi commit vào nhánh main của repo đó tự động chạy pipeline sinh ra
`schema_structure.json`, commit vào nhánh `auto/update-schema-structure` của
`foresight-bgs`, **review qua PR rồi mới release** (xem
`foresight-bgs/README.md` mục "Updating the Schema"). Đây là mức trưởng
thành cao hơn hẳn "Prisma migrate" thông thường — migration được sinh từ 1
DSL, không viết SQL tay, và có bước review bắt buộc trước khi chạm production.

**Testing — test pyramid đầy đủ, có convention rõ**: `foresight-cloud-bms`
có `npm run test` (Vitest, co-located `*.test.ts` cạnh file nguồn — không
tách thư mục `__tests__`), `npm run test:e2e` (Playwright, chỉ chromium mặc
định), và **MSW mock GraphQL** (`src/integrations/msw/handlers.ts`) dùng
chung cho cả Vitest lẫn browser dev-mode — chính file này tôi đã dùng thật
để chạy app hoàn toàn offline trong session trước. Đọc `AGENTS.md` mục
"Tests" để thấy lý do chọn co-located thay vì `__tests__/`.

**Security — supply-chain scanning, vượt xa `npm audit` thông thường**:
`.npmrc` của `foresight-cloud-bms`/`foresight-components` có **4 lớp phòng
thủ** chồng nhau, enforce bằng script + pre-commit hook
(`scripts/check-npmrc.mjs`): `min-release-age=7` (chặn cài package mới
xuất bản <7 ngày — phòng supply-chain attack kiểu gói bị yank sau vài giờ),
`ignore-scripts=true` (chặn mọi lifecycle script kể cả transitive dep),
kiểm tra không có secret hardcode trong `.npmrc`, và quét không có `.npmrc`
lồng trong thư mục con (tránh 1 sub-folder override policy gốc). Đây là ví
dụ thật, cụ thể hơn hẳn "Dependabot/Renovate" — đáng đọc kỹ nếu muốn hiểu
phòng thủ supply-chain thực chiến trông ra sao.

## Level 4 — Senior

**Backend — GraphQL Federation thật, không phải 1 API monolith**:
`foresight-cloud/platform/foresight-core/federated-graph/` deploy image
`piscada/foresight-federated-graph:0.3.0` — đây là **gateway** compose nhiều
subgraph (`foresight-bgs`, `graph-service` = `foresight-graph-reader`, và
nhiều subgraph khác) thành 1 schema thống nhất mà frontend gọi. Xác nhận
được bằng `_service`/`_entities` field trong root Query type của cả BGS lẫn
graph-reader khi introspect trực tiếp (tự tay làm trong session trước) —
đây là ví dụ thật hiếm gặp của Apollo Federation ở production, tốt hơn hẳn
đọc tài liệu lý thuyết.

**Backend — message queue/event-driven thật**: `foresight-cloud/platform/nats/`
deploy NATS JetStream (Helm chart `nack` — NATS controller cho K8s CRD), và
`foresight-cloud/platform/foresight-core/timescale-datapoint-provider/` có
1 `Stream.yaml` CRD riêng — dữ liệu MQTT từ gateway vật lý đi qua NATS
JetStream rồi mới ghi vào historian, decoupling ingest khỏi storage đúng
kiểu message queue thật (không phải gọi hàm trực tiếp).

**Database sâu — historian thật là TimescaleDB, không phải Cassandra**:
tài liệu cũ trong `doc/Platform Architecture and TechStack.md` ghi
Cassandra, nhưng K8s manifest thật
(`platform/foresight-core/timescale-datapoint-provider/base/timescale-datapoint-provider-db.HelmRelease.yaml`)
cho thấy **TimescaleDB** (Postgres time-series extension) mới là lựa chọn
thật đang chạy. Đây là bài học Level 4 quan trọng hơn cả chi tiết công nghệ:
**luôn verify bằng infra-as-code thật, không tin tài liệu cũ** — tài liệu
drift khỏi thực tế là chuyện bình thường ở hệ thống sống lâu.

**Observability — 3 chân đầy đủ, có bằng chứng**: `ServiceMonitor` CRD
(Prometheus Operator) cho ít nhất 6 service riêng biệt
(`federated-graph`, `graph-service`, `datapoint-resolver`, `blob-service`,
`container-frontend`, `emqx-http-auth`), `PrometheusRule` alert thật cho
FalkorDB backup (`falkordb-pit-backup`/`falkordb-dr-backup`), và
`foresight-cloud/platform/monitoring/jaeger/` deploy Jaeger thật (distributed
tracing) với Grafana datasource nối sẵn. Đây là bộ 3 (metrics/log/trace) đầy
đủ hơn hẳn "chỉ có Prometheus" — hiếm thấy ở dự án nhỏ.

**DevOps — GitOps thật bằng FluxCD, không deploy tay**: `foresight-cloud`
toàn bộ là Kustomize + FluxCD — mỗi service có `base/` + `overlays/{development,staging,production}`,
image được update tự động qua `imagepolicy` annotation
(`# {"$imagepolicy": "foresight-core:graph-service"}` — image-reflector-controller
tự phát hiện tag mới, image-automation-controller tự commit vào Git, Flux
tự apply) — không ai `kubectl apply` tay, mọi thay đổi hạ tầng đi qua Git PR.
Đây là ví dụ GitOps thật, khác hẳn CI/CD "chạy script deploy" thông thường.

**Security — secrets qua Sealed Secrets, không phải biến môi trường tĩnh**:
`platform/oauth2-proxy/base/oauth2-proxy.SealedSecret.yaml` — secret được
**mã hoá ngay trong Git** (chỉ giải mã được bởi controller trong đúng
cluster đó), khác hẳn `.env` thường hay thậm chí khác cả việc chỉ dùng
`${VAR:?...}` fail-fast như `todo-app` đang làm — đây là câu trả lời thật
cho "secrets management thật" mà `level-4-senior.md` yêu cầu, không cần
Vault vẫn đạt được vì secret không tồn tại dạng plaintext ở bất kỳ đâu trong
Git.

**Security — SBOM scan trong CI, cao hơn cả SAST cơ bản**: `bitbucket-pipelines.yml`
(vd `fs-b-backend`, `foresight-energy-v1`) có step `sbom-scan-deploy` chạy
mỗi lần deploy + `nightly-audit` chạy `npm run audit:check` theo lịch (không
chỉ khi commit) — SBOM (Software Bill of Materials) là mức trưởng thành cao
hơn `npm audit` thông thường, dùng để trả lời nhanh "hệ thống có dùng package
X phiên bản Y không" khi 1 CVE mới công bố, không cần grep từng repo.

**Gap thật đáng chú ý (dù là hệ thống production)**: search toàn bộ
`foresight-cloud` cho `HorizontalPodAutoscaler` ra **0 kết quả** — nghĩa là
dù `level-4-senior.md` liệt kê "auto-scaling dựa trên metric thật" là yêu
cầu Senior DevOps, **hệ thống thật này chưa làm** (có thể vì traffic pattern
building automation ổn định, không cần — hoặc đơn giản là chưa tới lượt ưu
tiên). Bài học quan trọng: **hệ thống production thật không check hết mọi
ô trong checklist "Senior" — biết cái nào bị bỏ qua CÓ CHỦ ĐÍCH vs bị bỏ
qua vì chưa tới lượt mới là tư duy Senior thật**, không phải liệt kê đủ
buzzword.

## Level 5 — Staff / Tech Lead

**Bounded context thật, không phải vẽ sơ đồ**: platform tách rõ theo domain
— `foresight-bgs` (nguồn sự thật của knowledge graph, Postgres), `graph-service`
(read-cache tối ưu cho query, FalkorDB), historian riêng (TimescaleDB, chỉ
lo timeseries), NATS (event backbone, không ai gọi thẳng service-to-service
cho dữ liệu streaming) — đây là bounded context THẬT vì mỗi service có
database riêng, ngôn ngữ riêng (C#/Go/Python), team sở hữu riêng (suy ra từ
`bitbucket-pipelines.yml` khác nhau mỗi repo) — khác `pmp4-sim`'s 3-database
demo ở chỗ đây có 32 repo thật đứng sau, không phải 1 schema.sql minh hoạ.

**RFC-worthy thật, tự phát hiện trong session trước**: khi cấu hình
`NEW_APPLICATION_GRAPHQL_ENDPOINT` để BGS replicate sang graph-reader, đọc
`foresight-bgs/API/README_REPLICATION.md` thấy dòng: *"If replication fails,
the entire mutation fails and no data is written to the local database"* —
đây là 1 quyết định CAP-theorem thật (chọn **consistency over availability**
cho ghi dữ liệu): thà mutation fail hoàn toàn còn hơn 2 nguồn dữ liệu
(BGS/graph-reader) lệch nhau. Câu hỏi RFC thật rút ra được: *"Nếu
graph-service down 10 phút, mọi ghi dữ liệu vào BGS (kể cả không liên quan
gì tới graph-service) có nên fail theo không? Đánh đổi giữa consistency và
availability ở đây có đúng cho mọi loại mutation không, hay nên phân loại
theo mức độ quan trọng?"* — đúng dạng câu hỏi "hệ thống vỡ ở đâu trước" mà
`level-5-staff-lead.md` yêu cầu, lấy từ hành vi thật quan sát được, không
phải giả định.

**Technical debt thật, có thể lượng hoá**: `foresight-cloud-bms` (app BMS
mới) sau khi diff trực tiếp với template gốc `bms/` cho thấy **gần như giống
hệt nhau** — chưa có route/feature nào là sản phẩm thật, trong khi
`foresight-facilities-v1`/`foresight-energy-v1` (stack cũ) đã đầy đủ tính
năng production. Đây là ví dụ thật cho "frontend migration debt" — 2 stack
(cũ: TanStack Router SPA + `@piscada/foresight-shadcn-components`; mới:
TanStack Start SSR + `@piscada/foresight-components`) chạy song song, và
BMS — lẽ ra là app đại diện cho stack mới — lại là nơi ít tiến độ nhất.
Câu hỏi Staff thật: *"Ưu tiên hoàn thiện `foresight-cloud-bms` (chứng minh
stack mới) hay tiếp tục feature trên stack cũ đã có khách hàng thật dùng
(`foresight-facilities-v1`)? Impact vs effort ở đây tính thế nào khi công ty
đang gọi vốn dựa trên câu chuyện 'AI-first platform'?"*

## Level 6 — Principal / Consultant

Phần này **đã thực hành thật** trong các lượt hội thoại trước của chính
phiên làm việc này (không phải giả định) — dùng chính output đó làm ví dụ:

- **Technical due diligence thật**: đã đọc bộ deck gọi vốn Series A $8M thật
  của Piscada (`piscada-export (2).pdf`) và đối chiếu với code thật, phát
  hiện: 3 khách hàng dẫn chứng trong deck là **ẩn danh** ("Major Nordic
  Property Manager"...) trong khi chỉ 1 khách hàng (Olav Thon Eiendom) có
  tên thật + hợp đồng — dấu hiệu cần hỏi thêm khi due diligence thật; và
  công ty vừa **bán mảng aquaculture** (22M NOK, có lãi) tháng 3/2025 để dồn
  lực vào PropTech — vừa là tín hiệu tốt (kỷ luật vốn) vừa là rủi ro (pivot
  gần đây, chưa chứng minh dài hạn).
- **Build vs Buy thật, quan sát được từ code**: Piscada **không tự xây
  identity** — dùng Keycloak (open-source, self-host) + oauth2-proxy thay vì
  tự viết JWT/session như `todo-app` đang làm — quyết định build-vs-buy đúng
  đắn vì identity không phải core differentiator của họ. Ngược lại, họ
  **tự xây** semantic builder/AI classifier (core moat, không có SaaS nào
  làm đúng bài toán này) — ví dụ thật cho nguyên tắc "buy commodity, build
  differentiator".
- **Vendor lock-in thật, đáng đưa vào risk register**: `foresight-classifier`
  và `building-analytics-engine` đều phụ thuộc trực tiếp Anthropic Claude
  API (`claude-sonnet-4-6`/`claude-opus-4-6` hardcode trong config) — không
  có abstraction layer nào để đổi LLM provider. Nếu Anthropic đổi giá/ngừng
  model, ảnh hưởng trực tiếp core product. Đây là dòng thật nên có trong
  risk register (xác suất thấp, ảnh hưởng cao).
- **Bus-factor/dependency risk thật, tự phát hiện khi cố chạy `graph-reader` local**:
  service này phụ thuộc module Go riêng tư
  `bitbucket.org/teampiscadacloud/foresight-go-middleware` — không nằm
  trong bất kỳ 32 repo nào được checkout, không có cách nào build được nếu
  không có quyền truy cập Bitbucket nội bộ của Piscada. Về mặt due diligence
  hạ tầng: **1 thành phần lõi của kiến trúc phụ thuộc hoàn toàn vào quyền
  truy cập nội bộ team, không self-contained** — câu hỏi đáng hỏi CTO khi
  due diligence: "nếu người giữ quyền truy cập Bitbucket đó nghỉ việc/mất
  quyền, ai build lại được `graph-reader` từ đầu?"

## Cách dùng file này

Không có mục "Còn thiếu, làm tiếp" như `pmp4-sim-gap-analysis.md` — vì đây
không phải dự án của bạn để sửa. Dùng file này theo 2 cách:

1. Khi đọc "Yêu cầu"/"Keywords" ở file `level-N-*.md`, quay lại đúng mục
   tương ứng ở đây để xem **ví dụ thật, ở quy mô công ty thật**, thay vì chỉ
   tưởng tượng qua lý thuyết.
2. Khi tự luyện artifact cấp Senior/Staff/Consultant (ADR, RFC, due
   diligence), **lấy chính các câu hỏi RFC/risk-register đã liệt kê ở trên
   làm đề bài thật** để tự viết ra artifact hoàn chỉnh (1 trang, có
   trade-off rõ ràng) — đây mới là bài tập, không phải việc đọc file này là
   xong.
