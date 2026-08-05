# Gap Analysis: PMP4 (`webpmp` + `native-v4`) đối chiếu với thang level

`webpmp` (`/Users/aminhp93/working/pmp4/webpmp`) và `native-v4`
(`/Users/aminhp93/working/pmp4/native-v4`) là 2 repo thật, đang chạy
production thật, tạo nên **PMP4** — sản phẩm edge-controller cho building
automation của Piscada: `webpmp` là React frontend (`PMP/`) + Node.js
server (`packages/server/`) nói MQTT xuống Core; `native-v4` là C++/Qt —
"Core" cùng ~20 process vệ tinh (TagManager, AlarmManager, SystemConfig,
driver BACnet/Modbus/OPC-UA...), MariaDB, giao tiếp qua MQTT JSON-RPC. Cùng
tinh thần với [`foresight-gap-analysis.md`](foresight-gap-analysis.md):
đây **không phải dự án cá nhân để sửa tuỳ ý** (dù có thể là code bạn đang
thật sự làm việc hàng ngày, khác với Foresight là do-diligence từ ngoài
nhìn vào) — giá trị của file này là **ví dụ thật, có trích dẫn file/dòng cụ
thể**, ở cả 2 hướng: chỗ làm đúng lẫn chỗ có lỗ hổng thật.

Điểm khác biệt lớn nhất so với `foresight-gap-analysis.md`: Foresight là hệ
cloud-native hiện đại (K8s/GitOps/Federation), còn PMP4 là hệ **edge/on-
premise lâu năm** (C++ 20+ tuổi bên cạnh Node/React hiện đại) — nên phần
lớn giá trị học được ở đây là **kỹ thuật "đọc code thật để tìm lỗ hổng/nợ kỹ
thuật"**, không phải "đây là kiến trúc hiện đại nên bắt chước". Nhiều phát
hiện dưới đây đến từ audit trực tiếp source, không phải suy đoán.

## Tóm tắt theo level

| Level | Độ giàu ví dụ | Ghi chú |
| :--- | :--- | :--- |
| 1 — Fresher | 🔴 Không phải chỗ để học | Cả 2 repo đã ở mức layered/nhiều process từ lâu — dùng `todo-app` cho level này |
| 2 — Junior | 🟢 Tốt, kể cả ví dụ xấu | Validate/CORS/multi-stage Docker đúng chuẩn; song song đó có auth copy-paste tự nhận là yếu — cả 2 hướng đều đáng học |
| 3 — Middle | 🟡 Vừa tốt vừa là cảnh báo | Test framework có thật ở cả 2 repo nhưng **mồ côi** (không chạy trong CI/build) — ví dụ thật hiếm gặp cho "viết test khác có văn hoá test" |
| 4 — Senior | 🟢 Rất tốt, đặc biệt phần đánh đổi | Prometheus metrics thật, MQTT decoupling thật — nhưng correlation ID có sẵn mà không dùng, CI 2 repo lệch hẳn về độ trưởng thành |
| 5 — Staff | 🟢 Chất liệu RFC thật, rất cụ thể | Watchdog chỉ phát hiện Core chết, không tự restart; bug "mất subscription khi Core restart" đã tự ghi nhận; 90% frontend legacy bị loại khỏi lint |
| 6 — Consultant | 🟢 Chất liệu due-diligence xuất sắc | Mật khẩu admin mặc định plaintext trong code setup DB; JWT thật (đã hết hạn) bị hardcode; OpenSSL/Botan vendor từ 2016-2017 |

## Level 2 — Junior

**Backend — validate bằng zod đúng hướng nhưng chỉ phủ 1 góc**:
`packages/server/src/api/v1/{alarms,alarm-classes,alarm-statistics}/` và vài
service (`FavouriteService.ts`, `UserService.ts`) dùng `zod` — nhưng ~50
file route còn lại trong `packages/server/src/api/` (`auth.ts`, `bacnet.ts`,
`config.ts`, `device.ts`, `useradmin.ts`...) chỉ validate thủ công qua
`isString()` (`@piscada/is`) hoặc không validate gì. Đây là ví dụ thật cho
đúng thứ `level-2-junior.md` cảnh báo: bắt đầu dùng thư viện validate cho
tính năng mới, không bao giờ quay lại retrofit code cũ — khác hẳn 1 dự án
nhỏ nơi bạn tự quyết định 100% coverage ngay từ đầu.

**Backend — ví dụ XẤU rất đáng học: auth copy-paste, tự nhận trong code**:
`packages/server/src/api/auth.ts` — route `/login` (dòng 16-55) và `/ldap`
(dòng 80-116) gần như giống hệt nhau, kèm chính comment của tác giả: *"/ldap
is just a copy paste of /login with one different line... Creating tokens
should be abstracted away"* (dòng 75-79), và cả 2 route dùng chung 1 đoạn tự
thú nhận: *"This implementation of 'login' uses base64 encoding... which in
practice is the same as plaintext, and only relies on HTTPS for
security... Ideally there should be done at least some iterations (ex 4096)
of key derivation on the client before sending it"* (dòng 23-27). Đây là ví
dụ thật, hiếm gặp: 1 kỹ sư thật, ở 1 công ty thật, tự viết ra lý do vì sao
giải pháp của mình chưa đủ tốt — quý hơn nhiều so với đọc lý thuyết "vì sao
không nên copy-paste code auth".

**Backend (native-v4) — parameterized query đúng ở 2/3 chỗ giống hệt nhau,
sai đúng 1 chỗ**: `PiscadaServer/src/apps/SystemConfig/journalmessageworker.cpp`
có 3 handler gần giống nhau, đều nhận `name` từ client qua MQTT JSON-RPC:
`closeJournal()` (dòng 253) và `markMessageAsRead()` (dòng 373) escape đúng
qua `makeSqlSafe()`/`safeSqlValue()`; nhưng `deleteJournal()` (dòng 236-237)
nối chuỗi **không escape gì cả**:
```cpp
QString name = params.value("name").toString();
QString stm = "DELETE FROM piscada_notes.history WHERE note_name='" + name + "'";
```
Đây là SQL injection thật, reachable từ 1 client đã authenticate — và là ví
dụ tốt nhất có thể có cho khái niệm "parameterized query": chứng minh **biết
cách làm đúng không đủ** — đội ngũ đã làm đúng ở 2 hàm ngay bên cạnh, vẫn
quên ở hàm thứ 3, vì không có lint/code-review gate nào bắt được (native-v4
hoàn toàn không có static analysis, xem Level 3).

**DevOps — CI cache + Docker multi-stage đúng chuẩn (webpmp)**:
`.circleci/config.yml` cache yarn theo `checksum "yarn.lock"`; `Dockerfile`
gốc là **3 stage thật** (`client-build` build Vite, `server-build` build
`tsc`, stage cuối `node:alpine` chỉ copy `dist/` — không mang theo
`devDependencies`/TypeScript vào production image). Đạt và vượt yêu cầu
Junior/Mid ở mục Docker.

## Level 3 — Middle

**Testing — có framework thật, nhưng MỒ CÔI ở cả 2 repo — ví dụ hiếm và quý**:
- `webpmp`: có 2 test runner cùng tồn tại — `jest.config.js` ở root là
  **xác chết**: không có `jest` binary cài, script `"test"` trong
  `package.json` thật ra chạy `vitest`, và `jest.config.js` vẫn còn dòng
  `testPathIgnorePatterns` từ thời trước khi chuyển sang vitest. Vitest thật
  sự có 3 test file cho `packages/server` (trong 292 file — ~1%) và 43 file
  cho `PMP/src` (trong ~1606 file — ~2.7%), tập trung gần hết vào tính năng
  alarm. 38/39 socket-plugin không có test nào.
- `native-v4`: có hẳn 11 file test QTest thật (~3.300 dòng), gồm cả bộ test
  khá chỉn chu cho BACnet JSON conversion. Nhưng **không file `.pro` nào
  trong toàn bộ chain build (`src.pro` → `apps.pro` → từng app) liệt kê các
  thư mục test này trong `SUBDIRS`** — nghĩa là `build-linux-amd64-docker.sh`
  (script build thật) **không bao giờ compile, chứ đừng nói chạy**, dù chỉ 1
  test. `test_alarmmanager.cpp` còn mở đầu bằng comment *"You must start
  AlarmManager.exe first"* — là integration test thủ công, không phải unit
  test tự động.

Đây là ví dụ thật tốt hơn hẳn "dự án X không có test nào" (dễ, nhàm) — nó
dạy một bài học sâu hơn: **có test không đồng nghĩa có văn hoá test**. Viết
test mà không nối vào build/CI thì giá trị gần như bằng 0 — người mới join
dễ tưởng nhầm "đã có coverage" trong khi thực tế 0% được chạy.

**Backend — migration/schema: 1 file khổng lồ, không version hoá (native-v4)**:
`PiscadaServer/src/PiscadaDB/dbsetup.cpp` dài **4.726 dòng**, vừa tạo toàn
bộ schema (hàng chục `CREATE TABLE`) vừa chạy migration dữ liệu ad-hoc trộn
lẫn ngay trong đó (`addAdminUser()` nằm giữa code tạo bảng) — không có
migration `up/down`, không version. Đối lập hoàn toàn với `webpmp` phía
frontend/backend Node vốn hiện đại hơn nhiều — cho thấy nợ kỹ thuật kiểu này
tồn tại thật ở phần cũ của 1 hệ thống dù phần khác đã rất mới.

**DevOps — CI 2 repo lệch hẳn về độ trưởng thành, dù cùng 1 công ty**:
`webpmp`'s CircleCI cache dependency, chạy `typecheck` (`tsc --noEmit`), và
chạy `vitest` thật; `native-v4`'s CircleCI (`.circleci/config.yml`) **chỉ
build Docker image rồi push** — không compile test, không static analysis
(`cppcheck`/`clang-tidy`/`clang-format` — 0 kết quả grep toàn repo), và
**không có file `.clang-format` nào** trong repo. Ví dụ thật cho "văn hoá kỹ
thuật không đồng đều ngay trong cùng 1 công ty, theo ngôn ngữ/team", không
phải giả định.

## Level 4 — Senior

**Backend — Prometheus metrics thật, đúng chuẩn, tích hợp cả MQTT lẫn
Socket.IO**: `packages/server/src/metrics.ts` định nghĩa histogram/counter
thật (`socketio_requests_duration_seconds`, `mqtt_requests_duration_seconds`,
`mqtt_message_sent_size_bytes`...), `metrics.installEndpoints(app)` được
wire vào `start-express.ts:78`. Đây là điểm mạnh thật, đáng nêu khi
interview: 1 hệ thống hybrid (HTTP + Socket.IO + MQTT) có metrics đàng
hoàng, không phải chỉ `console.log`.

**Backend — correlation ID có sẵn ở tầng protocol nhưng KHÔNG được dùng cho
observability — ví dụ chính xác nhất cho "biết vs. làm"**: `NativeIo.ts:233`
sinh `callbackId` (UUID) gửi làm MQTT5 `correlationData` — nhưng chỉ để
match Promise đang chờ (`activeRequests[callbackId]`), **không bao giờ được
log** (`writeToMqttLog` ở dòng 268 bỏ qua field này), không bao giờ được đưa
vào tag Sentry hay label Prometheus. Kết quả: **~90% hạ tầng cần cho
distributed tracing đã tồn tại**, chỉ thiếu bước cuối cùng là log/propagate
nó ra. Đây là ví dụ Senior thật hơn hẳn "hệ thống chưa có tracing" — nó cho
thấy khoảng cách giữa "có cơ chế" và "có kỷ luật dùng cơ chế đó tới cùng".

**Reliability — bug thật, tự ghi nhận, đúng khái niệm "resilience pattern"**:
`packages/server/ISSUES.md` — *"Subscriptions lost on controller restart
(Cloud)"*: subscription chỉ sống trong memory, không re-subscribe khi Core
restart, tag ngừng cập nhật âm thầm. Đây chính xác là ví dụ thật cho khái
niệm "retry with backoff / reconnect logic" mà `level-4-senior.md` yêu cầu —
và là chất liệu postmortem/RFC thật (xem Level 5).

**Security — dependency hygiene: crypto library vendor từ 2016-2017, không
scan CVE bao giờ**: `native-v4/3rdparty/openssl/` vendor cả 3 bản song song
— **1.0.2h (2016, hết hỗ trợ từ 2020)**, 1.1.0, 1.1.1;
`3rdparty/botan/` là **2.0.1 (tháng 1/2017)**, trong khi bản hiện tại đã lên
nhánh 3.x. Không có Dependabot/Renovate/Snyk ở CẢ HAI repo. Đây là ví dụ
thật, cụ thể hơn hẳn "chưa có dependency scanning" chung chung — 1 CVE mới
công bố cho OpenSSL 1.0.2 sẽ không ai biết được từ chính repo này.

**Security — mật khẩu admin mặc định seed dạng PLAINTEXT ngay trong code
setup DB**: `PiscadaServer/src/PiscadaDB/dbsetup.cpp:2101`
(`DBSetup::addAdminUser()`):
```cpp
QString stm("INSERT INTO piscada_system.accounts (username,name,password,role) VALUES ('admin','admin','admin','Admin')");
```
chạy vô điều kiện nếu chưa có account `admin` — cột `password` là chuỗi
`"admin"` thô, **không hash**, dù `bcryptfunctions.cpp` đã tồn tại sẵn trong
cùng codebase cho các luồng khác. Đây là phát hiện security-review kinh
điển: default credential, chưa kể không ép buộc đổi sau khi setup.

**Gap thật đáng chú ý, giống tinh thần "HPA = 0 kết quả" của Foresight**:
CI của cả 2 repo **không filter theo branch** (`filters: tags: only:
/.*/`, không có điều kiện branch) — nghĩa là job build+push Docker image
chạy trên MỌI branch/tag, không riêng `main`/`release/*`. Ở `webpmp`, gate
chất lượng duy nhất trong CircleCI là 1 script đếm số `eslint-disable`
(`scripts/eslint-comments.sh`) — và chính script đó có **bug thật**:
`if [[ $count>79 ]]` là so sánh CHUỖI trong bash (thiếu `-gt`), không phải
so sánh số — 1 lỗi thật, đang nằm ngay trong cổng chất lượng duy nhất của
CI. `yarn lint`/ESLint đầy đủ chỉ tồn tại trong `_bitbucket-pipelines.yml`
(tên có dấu `_` ở đầu — nghĩa là **không được Bitbucket chạy**), và file đó
tự thừa nhận cho phép tới **1.324 warning** ở phía server.

## Level 5 — Staff / Tech Lead

**Ai chịu trách nhiệm phục hồi khi Core chết? — RFC thật, không giả định**:
`native-v4` có `Watchdog` (`PiscadaServer/src/apps/Watchdog/watchdog.cpp`,
373 dòng) theo dõi nhịp "tick" của Core và bắn alarm nếu Core ngừng tick
(`checkTick()`, dòng 202-261) — nhưng **không tự restart bất cứ thứ gì**,
chỉ phát hiện + cảnh báo. Phục hồi thật sự chỉ dựa vào `restart: always`
của Docker ở tầng container. Câu hỏi RFC thật: *"Nếu Core restart (crash
hoặc chủ động), điều gì sống sót và điều gì mất, từ C++ process qua MQTT
qua `webpmp`'s server qua Socket.IO tới trình duyệt? Bug 'mất subscription
khi Core restart' đã biết (`ISSUES.md`) có phải hệ quả trực tiếp của việc
restart ở tầng container mà không có cơ chế resume ở tầng ứng dụng? Nên fix
ở phía Core (replay state), phía `webpmp` (phát hiện reconnect rồi tự
re-subscribe), hay phía browser (tự fetch lại khi reconnect)?"* — đúng dạng
câu hỏi "hệ thống vỡ ở đâu trước" mà `level-5-staff-lead.md` yêu cầu.

**Technical debt thật, lượng hoá được**: `PMP/src/legacy/` chiếm **~90% số
file frontend** (1.482/1.646), và `eslint.config.mjs:14` loại thẳng
`"PMP/src/legacy/**"` khỏi MỌI rule lint — nghĩa là 90% frontend không có
bất kỳ enforcement nào, kể cả rule cơ bản nhất. Song song đó, code mới dùng
`zustand`+`react-query` trong khi `legacy/` vẫn dùng `redux-saga`, và có hẳn
1 test (`ActiveAlarmTableV2.test.tsx`) mà nhiệm vụ là đảm bảo 2 hệ thống
này **đồng bộ với nhau** — nhưng không có ADR/doc/comment nào giải thích kế
hoạch migration (search "why zustand"/"migrat[e] redux" ra 0 kết quả). Câu
hỏi Staff thật: *"Migration khỏi `legacy/` đang được ưu tiên, bị đình trệ,
hay đã bị bỏ ngầm? Nếu 90% frontend vĩnh viễn không lint được và chạy 2 mô
hình state song song, chi phí giữ nguyên hiện trạng (bug lọt qua code không
lint, 2 mental model cho mỗi tính năng) so với chi phí hoàn thành migration
là bao nhiêu?"*

## Level 6 — Principal / Consultant

Nếu đóng vai consultant đánh giá PMP4 từ bên ngoài (technical due
diligence), đây là vật liệu thật:

- **Risk register thật** (xác suất × ảnh hưởng):
  1. Mật khẩu admin mặc định `admin`/`admin` seed plaintext không điều kiện
     (`dbsetup.cpp:2101`) — xác suất trung bình (chỉ còn rủi ro nếu không
     đổi sau deploy), ảnh hưởng **nghiêm trọng** (toàn quyền admin trên hệ
     điều khiển toà nhà thật).
  2. SQL injection tại `deleteJournal()` — xác suất thấp (cần đã
     authenticate), ảnh hưởng cao (xoá dữ liệu tuỳ ý ở `piscada_notes.history`,
     và là bằng chứng cho thấy kỷ luật escape không được enforce hệ thống,
     có thể còn chỗ khác chưa bị phát hiện).
  3. Crypto vendor lâu năm (OpenSSL 1.0.2h/Botan 2.0.1) — xác suất chưa rõ
     (cần xác nhận có thật sự compile vào binary Linux đang chạy production
     hay chỉ còn sót lại từ nhánh build Windows cũ) — ảnh hưởng cao nếu có.
  4. `core.cpp` là single point of failure, chỉ có phát hiện (Watchdog)
     không có tự phục hồi, kèm bug mất subscription đã biết — xác suất
     trung bình (xảy ra mỗi lần Core restart, kể cả chủ động), ảnh hưởng
     trung bình (dữ liệu cũ hiển thị sai âm thầm, không phải mất điều
     khiển hoàn toàn, nhưng nghiêm trọng với hệ thống liên quan an toàn toà
     nhà).
- **Bằng chứng thật cho "secret từng lọt vào source control"**:
  `FunctionBlockRegistry/blocks/smartblocks/cloudtaglistener.cpp:196` có 1
  dòng comment chứa 1 JWT thật (đã hết hạn từ 2018, issuer
  `access.piscada.online`) — chứng minh secret thật đã từng được paste vào
  code tại 1 thời điểm, và **không có secret-scanning nào trong CI** (không
  gitleaks/trufflehog) để chặn việc này tái diễn.
- **Tài liệu build đã lệch hoàn toàn khỏi thực tế — rủi ro bus-factor thật**:
  `Build instructions.txt` mô tả build bằng VS2015 + Qt 5.7 (2015-2016),
  trong khi hệ thống thật build qua Docker + CircleCI hoàn toàn khác. Một
  kỹ sư mới (hoặc đội kỹ thuật bên mua lại, nếu M&A) đi theo tài liệu
  "chính thức" sẽ build sai hoàn toàn — dấu hiệu rủi ro tri thức tổ chức
  (institutional knowledge) thật, đáng đưa vào report due diligence.
- **Build vs Buy quan sát được, đối lập trực tiếp với Foresight**:
  `native-v4` tự viết JWT/bcrypt (`jwt.cpp`, `bcryptfunctions.cpp`) và tự
  viết toàn bộ stack driver protocol (BACnet/Modbus/OPC-UA) từ đầu — hợp lý
  cho phần driver (core differentiator thật của 1 hãng BAS), nhưng đáng
  ngờ cho phần auth/migration (công việc "hàng hoá" mà đa số công ty
  mua/dùng thư viện chuẩn) — đối lập trực tiếp với cách Foresight **mua**
  Keycloak cho identity thay vì tự xây. Câu hỏi consultant thật: khác biệt
  này đến từ chủ đích, hay chỉ vì PMP4 được xây trước khi tư duy "buy
  commodity, build differentiator" phổ biến ở công ty?
- **CI "xanh" có thật sự là tín hiệu chất lượng không?**: `native-v4`'s
  pipeline không bao giờ compile 11 file test đã viết sẵn (0 SUBDIRS
  reference) và không static analysis gì cả; `webpmp`'s pipeline có 1 gate
  "lint" duy nhất là script đếm bị lỗi logic (`$count>79` so sánh chuỗi),
  còn ESLint đầy đủ chỉ tồn tại trong pipeline đã bị vô hiệu hoá (tolerate
  1.324 warning). Câu hỏi thật đáng hỏi khi due diligence: *"CI pass ở đây
  có nghĩa gì thật sự, hay chủ yếu mang tính hình thức?"*

## Cách dùng file này

Giống `foresight-gap-analysis.md`: không có mục "Còn thiếu, làm tiếp" kiểu
`pmp4-sim`/`todo-app` — đây là code thật, không phải sandbox cá nhân để tự
ý sửa. Dùng file này theo 2 cách:

1. Khi đọc "Yêu cầu"/"Keywords" ở `level-N-*.md`, quay lại đúng mục tương
   ứng ở đây để thấy **cả ví dụ đúng lẫn ví dụ sai, ở hệ thống thật đang
   chạy production**, kèm file/dòng cụ thể để tự verify lại nếu cần.
2. Khi luyện artifact cấp Senior/Staff/Consultant (postmortem, RFC, risk
   register, due diligence report), lấy đúng các câu hỏi/phát hiện đã liệt
   kê ở trên làm đề bài thật để viết ra artifact hoàn chỉnh — đây mới là
   bài tập, đọc xong file này chưa phải là luyện xong.
