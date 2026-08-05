# Level 6 — Principal / Consultant

At this level, the value you generate is no longer measured in lines of code written — but by **making sound decisions, communicating them clearly to non-technical (or non-specialist) stakeholders**, and delivering real organizational and financial impact.

> Self-answer each bullet point before viewing the [answers/detailed explanation](level-6-principal-consultant-answers.md).

## Requirements

- **Strategic Technology Consulting**: presenting multiple architectural options complete with cost, risk, and delivery timelines for each choice, rather than forcing a single "technically pure" solution.
- **Business Acumen**: understanding ROI, TCO (Total Cost of Ownership), cloud cost optimization, and tying technical choices directly to business outcomes (e.g., "reducing latency by 200ms" holds value only when correlated to conversion rate / revenue gains).
- **Technical Due Diligence**: assessing unfamiliar codebases and systems under tight timelines (M&A due diligence, pre-contract audits), producing clear risk reports.
- **Build vs Buy Evaluation**: evaluating when to build in-house vs leverage SaaS/vendors, assessing vendor lock-in exposure.
- **Compliance & Risk Management**: GDPR, SOC 2, data residency — recognizing when to involve legal counsel rather than making unilateral assumptions.
- **Organizational Standardization**: Technology Radar management (categorizing technologies under adopt/trial/hold/retire), codifying cross-team engineering standards across multiple domain initiatives.
- **Executive Communication Skills**: drafting formal proposals, delivering C-level presentations, and defending strategic decisions under tough interrogation.

**Keywords**: TCO, ROI, technical due diligence, technology radar, build-vs-buy, vendor lock-in, SOC2/GDPR, cost-benefit analysis, executive summary, risk register, statement of work (SOW).

## Application in `todo-app`

At this level, "demo code in todo-app" is largely irrelevant — however, this project serves as prime material for practicing **authentic consulting artifacts**, containing sufficient concrete context to perform real analysis rather than generic generalities. Recommended exercise: complete and evaluate the following deliverables by sharing them with non-technical peers without extra verbal explanation:

1. **Simulated Technical Due Diligence Report**: adopt the role of an external consultant hired to evaluate `todo-app` prior to an acquisition / handover. Write a 1-page report detailing: current architecture, risks (e.g., 3 concurrent backends indicates a lack of technical direction — tripling maintenance overhead for identical features), technical debt (lack of test suites, absence of versioned migration tools, static hardcoded defaults in `docker-compose.prod.yml`), and prioritized recommendations by effort/impact.
2. **Build vs Buy Decision Memo**: `be-node-express` implements custom JWT + session authentication from scratch. Write a decision memo comparing this approach against leveraging Auth0/Clerk/Supabase Auth — examining costs, time-to-market, vendor lock-in risks, and scenarios where custom build implementations remain justifiable.
3. **Executive Summary**: condense the entire technical `GUIDE.md` into 5 concise lines tailored for non-technical stakeholders to grasp business value and operational risk.

If you can author all 3 documents **without relying on jargon to sound proficient**, enabling non-technical readers to make confident decisions — that demonstrates genuine Level 6 mastery.

## DevOps (Infrastructure & Operational Consulting)

**Requirements**
- Cloud strategy consulting: evaluating multi-cloud vs single-vendor strategies, assessing vendor lock-in at contract and migration cost levels beyond technical factors.
- Organizational FinOps: establishing cost governance across multiple teams and projects, enforcing budget alerts, implementing showback/chargeback accounting models.
- Cross-team DevOps tool standardization (infrastructure-specific Technology Radar: defining standard CI/CD and IaC tools).
- Operational maturity assessments: evaluating organizational operational maturity across systems — analogous to security due diligence for operations.

**Keywords**: FinOps, cost governance, showback/chargeback, operational maturity assessment, cloud vendor lock-in, infrastructure technology radar.

**Application in `todo-app`**: Write a **simulated operational maturity assessment** for `todo-app` using authentic client report structures: scores across categories (CI/CD, observability, disaster recovery, cost governance), concrete supporting evidence (e.g., "CI lacks automated test execution ⇒ low quality gate score"), and a 3-phase improvement roadmap (0–1 month / 1–3 months / 3–6 months) to elevate operational maturity — reflecting the deliverables an infrastructure consultant delivers to clients.

## Security (Security Consulting)

**Requirements**
- Security due diligence (M&A): rapidly evaluating security postures under acquisition timelines, quantifying risk exposure beyond vulnerability lists.
- Navigating legal / insurance landscapes: understanding cyber insurance prerequisites and varying regulatory environments (e.g., EU GDPR vs local data protection laws).
- Risk registers: quantifying risks by Probability × Impact rather than listing isolated technical vulnerabilities.
- C-level security risk communication: translating technical vulnerabilities into business, legal, and reputational risk terms.

**Keywords**: security due diligence, cyber insurance, regulatory landscape, risk register (probability × impact), risk-to-business translation.

**Application in `todo-app`**: Write a **simulated risk register** for `todo-app` detailing at least 5 known project risks (e.g., "3 backends sharing 1 schema without auth synchronization ⇒ moderate probability, high impact if 1 backend unpatched; DB superuser `postgres` used directly ⇒ low probability, critical impact if exploited"), each with probability, impact, and mitigation recommendations — evaluating whether a CFO/CEO reviewing the document could immediately determine where to allocate budget.

## How to Self-Check Level 6 Mastery

A non-technical stakeholder can read your document, accurately comprehend the risks, and confidently make strategic decisions (invest/pass, build/buy) without requiring follow-up verbal explanations.
