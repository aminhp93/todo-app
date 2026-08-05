# Gap Analysis: PMP4 (`webpmp` + `native-v4`) Mapped Against Level Scale

`webpmp` (`/Users/aminhp93/working/pmp4/webpmp`) and `native-v4` (`/Users/aminhp93/working/pmp4/native-v4`) are two active production repositories forming **PMP4** — Piscada's edge-controller product for building automation: `webpmp` is the React frontend (`PMP/`) + Node.js backend server (`packages/server/`) interfacing with Core via MQTT; `native-v4` is the C++/Qt codebase — "Core" operating alongside ~20 peripheral satellite processes (TagManager, AlarmManager, SystemConfig, BACnet/Modbus/OPC-UA drivers...), MariaDB, communicating via MQTT JSON-RPC. In the same spirit as [`foresight-gap-analysis.md`](foresight-gap-analysis.md): this **is not a personal sandbox project for arbitrary code edits** (even if it represents your daily professional codebase, unlike Foresight's external due-diligence view) — the core value of this document lies in **real-world examples with explicit file/line citations**, covering both architectural best practices and live production vulnerability findings.

The primary distinction from `foresight-gap-analysis.md`: Foresight represents a modern cloud-native stack (K8s/GitOps/Federation), whereas PMP4 represents a **legacy edge/on-premise system** (20+ year legacy C++ footprint existing alongside modern Node/React tiers) — consequently, the primary learning value here resides in **"reading real code to identify vulnerabilities, architectural friction, and technical debt"**, rather than "emulating modern architecture." Many findings below stem from direct source code auditing.

## Summary by Level

| Level | Example Richness | Notes |
| :--- | :--- | :--- |
| 1 — Fresher | 🔴 N/A for learning | Both repos have long operated at multi-process/layered architectures — use `todo-app` for this level |
| 2 — Junior | 🟢 Good (including antipatterns) | Validation/CORS/multi-stage Docker setups solid; alongside copy-pasted auth self-identified as weak — both offer learning value |
| 3 — Middle | 🟡 Both Good & Warning Signs | Automated test frameworks exist in both repos but are **orphaned** (omitted from CI/build execution) — rare example of "having tests without a testing culture" |
| 4 — Senior | 🟢 Very Good (Tradeoffs) | Prometheus metrics, MQTT decoupling — yet available correlation IDs go unused for tracing; CI maturity varies drastically across repos |
| 5 — Staff | 🟢 Concrete RFC Material | Watchdog detects Core failure without auto-restart; "lost subscriptions on Core restart" bug documented; 90% legacy FE excluded from linting |
| 6 — Consultant | 🟢 Outstanding Due-Diligence Material | Plaintext admin password defaults seeded in DB setup; hardcoded expired production JWT; vendor OpenSSL/Botan libraries dating from 2016–2017 |

## Level 2 — Junior

**Backend — Zod Input Validation Implemented Partially**: `packages/server/src/api/v1/{alarms,alarm-classes,alarm-statistics}/` and select services (`FavouriteService.ts`, `UserService.ts`) enforce schemas via `zod` — whereas ~50 remaining API route files in `packages/server/src/api/` (`auth.ts`, `bacnet.ts`, `config.ts`, `device.ts`, `useradmin.ts`...) rely on manual string type checks (`@piscada/is`) or lack validation entirely. This illustrates a real-world pattern noted in `level-2-junior.md`: adopting validation libraries for new features without retrofitting legacy routes — unlike small solo projects with 100% initial schema coverage.

**Backend — Educational Antipattern: Copy-Pasted Authentication Self-Documented in Code**: `packages/server/src/api/auth.ts` — route `/login` (lines 16–55) and `/ldap` (lines 80–116) are near-identical, accompanied by author comments: *"/ldap is just a copy paste of /login with one different line... Creating tokens should be abstracted away"* (lines 75–79), alongside self-confessed vulnerabilities: *"This implementation of 'login' uses base64 encoding... which in practice is the same as plaintext, and only relies on HTTPS for security... Ideally there should be done at least some iterations (ex 4096) of key derivation on the client before sending it"* (lines 23–27). This demonstrates an authentic developer comment acknowledging architectural compromises in production code.

**Backend (native-v4) — Parameterized SQL Query Enforced in 2 of 3 Identical Handlers, Missing in the Third**: `PiscadaServer/src/apps/SystemConfig/journalmessageworker.cpp` contains 3 similar handlers processing user-supplied `name` parameters via MQTT JSON-RPC: `closeJournal()` (line 253) and `markMessageAsRead()` (line 373) properly sanitize inputs using `makeSqlSafe()`/`safeSqlValue()`; however `deleteJournal()` (lines 236–237) concatenates raw strings **without escaping**:
```cpp
QString name = params.value("name").toString();
QString stm = "DELETE FROM piscada_notes.history WHERE note_name='" + name + "'";
```
This represents a live SQL injection vulnerability reachable from authenticated client payloads — serving as an ideal illustration for `level-2-junior.md`: proving that **knowing how to write safe code is insufficient** if automated static analysis or code reviews fail to catch omissions in identical adjacent methods (native-v4 lacks static analysis tools, see Level 3).

**DevOps — Production CI Caching + Multi-Stage Docker Builds (webpmp)**: `.circleci/config.yml` caches Yarn dependencies by `checksum "yarn.lock"`; `Dockerfile` maintains **3 distinct build stages** (`client-build` executing Vite builds, `server-build` executing `tsc`, final `node:alpine` copying `dist/` outputs without carrying `devDependencies`/TypeScript into production images). Fully satisfies and exceeds Junior/Middle Docker expectations.

## Level 3 — Middle

**Testing — Dual Test Frameworks Present but ORPHANED in Both Repositories**:
- `webpmp`: 2 test runners coexist — `jest.config.js` at root is **vestigial**: lacks installed `jest` binaries, the `"test"` script in `package.json` executes `vitest`, and `jest.config.js` retains stale `testPathIgnorePatterns` from prior migrations. Active Vitest suites comprise only 3 test files for `packages/server` (out of 292 files — ~1%) and 43 files for `PMP/src` (out of ~1606 files — ~2.7%), concentrated almost exclusively on alarm features. 38 of 39 socket plugins maintain 0 test coverage.
- `native-v4`: contains 11 dedicated QTest files (~3,300 lines of test code), including comprehensive BACnet JSON conversion test suites. However, **no `.pro` files across the build chain (`src.pro` → `apps.pro` → individual apps) include test directories in `SUBDIRS`** — meaning `build-linux-amd64-docker.sh` (the active build script) **never compiles nor executes unit tests during build pipelines**. `test_alarmmanager.cpp` begins with the comment *"You must start AlarmManager.exe first"* — reflecting manual integration testing rather than automated unit testing.

This serves as a key architectural insight: **possessing test files does not equal maintaining an active testing culture**. Uncompiled, unexecuted test suites yield zero coverage value — creating a false sense of test maturity for onboarding developers when 0% executes in CI.

**Backend — Monolithic Non-Versioned Database Schema Setup (native-v4)**: `PiscadaServer/src/PiscadaDB/dbsetup.cpp` spans **4,726 lines**, combining full DDL schema creation (`CREATE TABLE` blocks) with ad-hoc inline data seeding (`addAdminUser()` embedded directly within table creation code) — lacking versioned migration files (`up/down`) or version counters. Contrasts sharply with `webpmp`'s modern Node stack — illustrating how legacy technical debt persists in core database tiers even as satellite services adopt modern tooling.

**DevOps — Uneven CI Engineering Maturity Across Repositories within the Same Organization**: `webpmp`'s CircleCI configuration caches dependencies, executes typechecks (`tsc --noEmit`), and runs Vitest suites; `native-v4`'s CircleCI configuration (`.circleci/config.yml`) **solely builds Docker images and pushes to registries** — omitting test compilation and static analysis (`cppcheck`/`clang-tidy`/`clang-format` return 0 repository references, lacking `.clang-format` configs entirely). Demonstrates how engineering maturity varies across language domains and team boundaries within the same organization.

## Level 4 — Senior

**Backend — Production Prometheus Metrics Across MQTT and Socket.IO Protocol Layers**: `packages/server/src/metrics.ts` declares real histograms and counters (`socketio_requests_duration_seconds`, `mqtt_requests_duration_seconds`, `mqtt_message_sent_size_bytes`...), exposed via `metrics.installEndpoints(app)` in `start-express.ts:78`. Demonstrates robust observability across hybrid protocol architectures (HTTP + Socket.IO + MQTT).

**Backend — Protocol-Level Correlation IDs Generated but Omitted from Observability Pipelines**: `NativeIo.ts:233` generates UUID `callbackId` values attached as MQTT5 `correlationData` — but uses them solely to match pending Promise handlers (`activeRequests[callbackId]`), **omitting them from logs** (`writeToMqttLog` on line 268 excludes this field), Sentry error contexts, and Prometheus metrics labels. Result: **~90% of distributed tracing infrastructure exists in protocol headers**, but lacks propagation into logging endpoints. Demonstrates the gap between implementing mechanism components vs maintaining end-to-end tracing discipline.

**Reliability — Live Documented System Resilience Failure Modes**: `packages/server/ISSUES.md` documents *"Subscriptions lost on controller restart (Cloud)"*: subscriptions persist purely in volatile memory without auto-resubscription logic when Core restarts, causing silent metric update freezes. Represents a concrete real-world failure mode for exponential backoff and reconnect logic required by `level-4-senior.md`.

**Security — Legacy Cryptographic Dependency Debt**: `native-v4/3rdparty/openssl/` vendors 3 concurrent versions — **1.0.2h (released 2016, EOL since 2020)**, 1.1.0, 1.1.1; `3rdparty/botan/` maintains version **2.0.1 (January 2017)** while upstream releases span 3.x branches. Lacks automated Dependabot/Renovate dependency scanning across both repos.

**Security — Plaintext Default Admin Credentials Seeded in Database Setup Logic**: `PiscadaServer/src/PiscadaDB/dbsetup.cpp:2101` (`DBSetup::addAdminUser()`):
```cpp
QString stm("INSERT INTO piscada_system.accounts (username,name,password,role) VALUES ('admin','admin','admin','Admin')");
```
Executes unconditionally if `admin` accounts are absent — persisting raw, **unhashed** `"admin"` string passwords into database columns, despite `bcryptfunctions.cpp` existing within the same codebase for alternative flows. Classic security audit finding: hardcoded default credentials unforced for post-deployment rotation.

**CI Pipeline Quality Gates and Operational Antipatterns**: Neither repository filters CI workflows by branch (`filters: tags: only: /.*/`) — triggering full build and image push jobs across every branch push. In `webpmp`, the single quality gate script in CircleCI counts `eslint-disable` occurrences (`scripts/eslint-comments.sh`), which contains a **bash comparison bug**: `if [[ $count>79 ]]` performs a lexicographical string comparison in bash (lacking `-gt`), failing numerical evaluation logic. Complete `yarn lint`/ESLint configurations exist only inside `_bitbucket-pipelines.yml` (prefixed with `_`, **preventing Bitbucket pipeline execution**), which self-documents permitting up to **1,324 lint warnings** in server tiers.

## Level 5 — Staff / Tech Lead

**Core Process Recovery Architecture & Watchdog Design Scenarios**: `native-v4` deploys a `Watchdog` daemon (`PiscadaServer/src/apps/Watchdog/watchdog.cpp`, 373 lines) monitoring Core process tick heartbeats, firing alerts upon heartbeat failure (`checkTick()`, lines 202–261) — but **does not attempt process restarts**, relying exclusively on container-level Docker `restart: always` policies. RFC Question: *"When Core restarts (via crash or deployment), what state persists and what state clears across C++ processes → MQTT → `webpmp` server → Socket.IO → browser clients? Is the documented 'lost subscriptions on Core restart' bug (`ISSUES.md`) a direct consequence of container-level restarts lacking application-level session resume protocols? Should remediation be executed at the Core tier (state replay), `webpmp` tier (reconnect detection & auto-resubscription), or client browser tier (re-fetching state on socket reconnect)?"*

**Quantifiable Frontend Technical Debt**: `PMP/src/legacy/` comprises **~90% of frontend source files** (1,482 out of 1,646), while `eslint.config.mjs:14` explicitly excludes `"PMP/src/legacy/**"` from all linting rules — leaving 90% of frontend code unvalidated. Modern code paths adopt `zustand` + `react-query`, while legacy modules run `redux-saga`, supported by dedicated test suites (`ActiveAlarmTableV2.test.tsx`) tasked with verifying state synchronization between modern and legacy stores — yet lacking documented migration roadmaps (searching for "migrat[e] redux" returns 0 results). Staff Question: *"Is legacy migration prioritized, stalled, or implicitly abandoned? When 90% of frontend code bypasses lint checks while maintaining dual concurrent state architectures, what is the calculated operational cost of status-quo maintenance vs completing legacy refactoring?"*

## Level 6 — Principal / Consultant

Technical due-diligence audit findings for PMP4:

- **Concrete Risk Register Entries** (Probability × Impact):
  1. Plaintext default `admin`/`admin` password seeding (`dbsetup.cpp:2101`) — moderate probability (risk persists if unrotated post-deployment), **critical impact** (full administrative control over physical building automation hardware).
  2. Unescaped SQL injection in `deleteJournal()` — low probability (requires prior authentication), high impact (arbitrary deletion in `piscada_notes.history`, indicating lack of enforced parameterized query patterns).
  3. Legacy cryptographic library dependencies (OpenSSL 1.0.2h / Botan 2.0.1) — unconfirmed probability (requires auditing binary linkage in active Linux containers vs legacy Windows build artifacts), high impact if linked in production.
  4. Core single point of failure lacking automated self-healing, paired with subscription loss bugs — moderate probability (surfaces on every Core restart), moderate-to-high operational impact (silent telemetry freeze in building safety automation systems).
- **Historical Secrets Embedded in Source Control**: `FunctionBlockRegistry/blocks/smartblocks/cloudtaglistener.cpp:196` contains a code comment retaining a live production JWT string (expired 2018, issued by `access.piscada.online`) — proving production tokens were checked into source control, highlighting the absence of automated secret-scanning tools (Gitleaks / TruffleHog) in CI pipelines.
- **Outdated Build Documentation vs Production Reality**: `Build instructions.txt` details manual compilation steps using Visual Studio 2015 + Qt 5.7 (2015–2016 tooling), whereas live production builds execute exclusively via Docker + CircleCI. Onboarding engineers following official documentation would fail build setup — signaling institutional knowledge loss suitable for inclusion in due-diligence reports.
- **Build vs Buy Strategy Comparison (PMP4 vs Foresight)**: `native-v4` hand-coded custom JWT/bcrypt implementations (`jwt.cpp`, `bcryptfunctions.cpp`) and custom protocol driver stacks (BACnet/Modbus/OPC-UA) from scratch — sensible for protocol drivers (core BAS differentiators), but questionable for authentication and database migration layers — directly contrasting Foresight's decision to **buy/adopt** Keycloak for identity management. Consultant Inquiry: Does this architectural divergence reflect deliberate strategic intent, or does it stem from PMP4's legacy codebase predating modern commodity SaaS adoption strategies?
- **Evaluating CI Quality Signals**: `native-v4`'s pipeline never compiles its 11 written test files (0 `.pro` `SUBDIRS` references) and omits static analysis entirely; `webpmp`'s pipeline relies on a broken bash string-comparison script (`$count>79`) as its primary lint gate, while full ESLint configurations exist only in disabled pipeline definitions tolerating up to 1,324 warnings. Key due-diligence question: *"Does a green CI status indicate true software quality, or does it function primarily as a superficial build-pass check?"*

## How to Use This Document

Similar to `foresight-gap-analysis.md`: this file contains no action-item checklist — as this is active enterprise production code rather than a personal sandbox repository. Use this file in two ways:

1. When reviewing "Requirements" / "Keywords" in `level-N-*.md` files, reference corresponding sections here to analyze **both proper patterns and anti-patterns within live production systems**, complete with exact file and line references.
2. When practicing Senior/Staff/Consultant artifacts (postmortems, RFCs, risk registers, due diligence audits), **use the specific findings listed above as authentic case-study assignments** to draft professional consulting deliverables.
