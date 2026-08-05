# Full-stack + DevOps + Security Career Roadmap: Level 1 → Consultant

This document set is used to **self-review** your current knowledge across levels, and pinpoint exactly what is missing to reach Senior/Consultant. Each level file covers 4 domains — **Frontend, Backend, DevOps, Security** (from Level 5 onwards, FE/BE are combined because the boundary becomes blurred) — and each domain contains 3 sections:

1. **Requirements** — skills/knowledge expected at that level.
2. **Keywords** — key terms to search, self-study, or reference during CV reviews/interviews.
3. **Application in `todo-app`** — which parts of this project demonstrate the requirements, and which parts are **missing**.

## Level List

Each level consists of 2 files: the **Requirements** file (problem statement — read first and attempt to answer before opening the answer file) and the **Answers** file (detailed explanations for each bullet point in the Requirements file).

| Requirements | Answers | Level | Corresponding Experience (Reference) |
| :--- | :--- | :--- | :--- |
| [level-1-fresher.md](level-1-fresher.md) | [→ answers](level-1-fresher-answers.md) | Fresher / Intern | 0–6 months |
| [level-2-junior.md](level-2-junior.md) | [→ answers](level-2-junior-answers.md) | Junior | 6 months – 1.5 years |
| [level-3-mid.md](level-3-mid.md) | [→ answers](level-3-mid-answers.md) | Middle | 1.5 – 3 years |
| [level-4-senior.md](level-4-senior.md) | [→ answers](level-4-senior-answers.md) | Senior | 3 – 6 years |
| [level-5-staff-lead.md](level-5-staff-lead.md) | [→ answers](level-5-staff-lead-answers.md) | Staff / Tech Lead | 6 – 10 years |
| [level-6-principal-consultant.md](level-6-principal-consultant.md) | [→ answers](level-6-principal-consultant-answers.md) | Principal / Consultant | 10+ years |
| [gap-analysis.md](gap-analysis.md) | — | — | Summary: Where `todo-app` stands and what to do next |
| [foresight-gap-analysis.md](foresight-gap-analysis.md) | — | — | Real production platform examples (Foresight, 28 repos, Piscada) for each level — for reference/comparison only, not for code edits |
| [pmp4-gap-analysis.md](pmp4-gap-analysis.md) | — | — | Real examples (both right and wrong, with file/line citations) from PMP4 (`webpmp` + `native-v4`, Piscada) for each level — for reference/comparison only, not for code edits |

**Proper Usage**: Read the Requirements file, ANSWER each bullet point yourself first (written down or out loud), then open the Answers file to compare. Opening the answers file beforehand will lead to an inaccurate assessment of your real capabilities.

## How to Read This Level Scale

- **Levels are not 100% linear cumulative** — a strong FE Senior might be weak in distributed systems, and vice versa. Treat this as a **reference framework**, not a strict rigid checklist.
- From **Level 4 (Senior) onwards**, the distinction between "knowing how to code" and "knowing how to make tradeoffs/design/communicate" becomes increasingly pronounced. For Levels 5–6, some requirements **cannot be demonstrated through code in a small todo-app project** — the "Application in todo-app" sections in those files will suggest writing **artifacts** (ADRs, RFCs, postmortems, cost/tradeoff docs) using this project as the topic, as these are the actual deliverables created by a Staff/Principal/Consultant.
- In Senior/Consultant interviews, questions lean heavily on **"why"** and **"what are the tradeoffs"** rather than just **"how to do it"**. Prioritize being able to answer "why choose X over Y" for every decision made in a project.

## Notes on Current `todo-app`

The project has 3 backends (`be-node-express`, `be-nestjs`, `be-fastapi`) and 2 frontends (`fe-vite`, `fe-nextjs`). Specifically, `be-node-express` has been refactored into a layered architecture with JWT + session auth, REST + GraphQL, and index/JOIN/aggregate SQL (see [`be-node-express/GUIDE.md`](../../be-node-express/GUIDE.md)). This serves as the baseline for comparison throughout this document set.

Regarding infrastructure: the project runs with Docker + `docker-compose` (separated `dev`/`prod`) and a single build-per-service GitHub Actions workflow ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) — no Kubernetes yet, no test/security scanning in CI. Regarding security: it includes `bcrypt`, parameterized queries, JWT refresh rotation, and rate limiting; **no** security headers (`helmet`), SAST/dependency scanning in CI, or actual secrets manager yet. Full details are provided at each level and in [gap-analysis.md](gap-analysis.md).
