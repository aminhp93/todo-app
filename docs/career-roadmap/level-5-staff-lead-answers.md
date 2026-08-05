# Level 5 — Answers / Detailed Explanations

Explanations for each bullet point in [level-5-staff-lead.md](level-5-staff-lead.md).
At this level, every concept connects directly to a QUESTION you must answer for your organization, beyond basic definitions.

## General Requirements (FE + BE)

**Microservices vs Modular Monolith, When NOT to Split Services**
Modular Monolith: 1 codebase, 1 deployment unit, with code structured into cleanly bounded modules (analogous to Level 4 module boundaries) — simplifying operations and enabling easy cross-module transactions within a single DB transaction block. Microservices: independent service deployment units, enabling tech stack diversity — at the cost of managing inter-service network calls (slower, prone to transient network errors), complex distributed transactions (requiring Saga patterns over standard `COMMIT`/`ROLLBACK`), and operational maintenance overhead across N microservices. Key self-assessment question: "Does my engineering organization possess sufficient operational capacity to manage N distinct services, or am I splitting into microservices for trend alignment rather than architectural necessity?"

**Domain-Driven Design: Bounded Contexts**
A Bounded Context defines domain boundaries wherein business models retain precise, UNAMBIGUOUS meanings — e.g., a "User" in an "Auth" context (credentials, authorization roles) differs fundamentally from a "User" in a "Billing" context (billing addresses, payment methods). A common architectural antipattern involves creating a bloated, monolithic "User" table consumed globally across all domains, creating fragile cross-domain dependencies.

**API Gateway, BFF (Backend for Frontend) Pattern**
An API Gateway acts as a centralized ingress reverse proxy for multiple microservices — standardizing authentication, rate limiting, and request routing. BFFs establish tailored API layers optimized for specific client platforms (web vs mobile BFFs) — addressing platform-specific payload requirements (e.g., mobile clients requiring compressed payload fields) and preventing bloated, one-size-fits-all API endpoints.

**Technical Roadmap Planning: Technical Debt, Impact vs Effort Matrix**
Technical debt accumulates when prioritizing short-term expediency over long-term architecture (justified at the time, but requiring scheduled remediation). Prioritize technical debt using an Impact (cost of inaction) × Effort (remediation cost) matrix — targeting high-impact, low-effort items first. Persuading non-technical stakeholders requires framing technical debt in business terms (e.g., feature velocity degradation, downtime revenue loss) rather than abstract code aesthetics.

**Incident Management: On-Call Rotations, Blameless Postmortems, Action Items**
On-call rotations distribute off-hours incident response responsibilities across engineering teams. Blameless postmortems analyze systemic, process, and tooling root causes that allowed incidents to occur (rather than assigning personal blame) — psychological safety encourages transparent reporting, whereas personal fault leads to incident concealment. Action items must specify explicit single owners and target completion deadlines; unowned action items render postmortems ineffective.

**Scalable Mentorship, RFCs**
Scalable mentorship involves designing growth frameworks for entire engineering organizations (like this roadmap document), extending beyond 1-on-1 code reviews. An RFC (Request for Comments) documents technical proposals, trade-offs, and alternative architectures to gather peer feedback BEFORE finalizing decisions — unlike ADRs (which document past decisions made), RFCs facilitate pre-decision design alignment.

## DevOps (Platform / SRE)

**Platform Engineering: Internal Developer Platforms (IDP)**
IDPs build self-service developer tooling enabling product teams to provision infrastructure (DB instances, message queues) and execute deployments independently without needing low-level Kubernetes or Terraform expertise. The objective: eliminate platform team ticket bottlenecks and empower product feature team velocity.

**SRE: SLA / SLO / SLI, Error Budgets**
SLIs (Service Level Indicators) provide quantifiable telemetry metrics (e.g., % successful requests). SLOs (Service Level Objectives) establish internal reliability targets for SLIs (e.g., 99.5% success over 30 days). SLAs (Service Level Agreements) represent customer-facing contractual commitments with penalty clauses — set conservatively lower than internal SLOs to maintain safety margins. Error Budgets represent `100% - SLO` (e.g., a 99.5% SLO leaves a 0.5% error budget) — remaining error budget permits aggressive feature deployment; an exhausted error budget mandates feature freezes to focus exclusively on stability.

**Multi-region / Disaster Recovery: RTO / RPO, Real Restore Testing**
RTO (Recovery Time Objective): maximum acceptable downtime window prior to full operational recovery. RPO (Recovery Point Objective): maximum acceptable data loss window (e.g., 1-hour RPO = hourly backups, max 1 hour lost data). "Real restore testing" is frequently neglected: possessing backup archives does NOT guarantee successful recovery — unvalidated backup corruptions surface only during live restore attempts, highlighting the need for scheduled automated restore validation tests.

**Chaos Engineering**
Chaos engineering proactively injects controlled failures into production environments (e.g., terminating instances randomly, introducing synthetic network latency) to expose hidden failure modes (missing retries, missing timeouts, single points of failure) prior to unscripted production outages. Applicable only when system observability is mature enough to monitor impact accurately.

**Cost Optimization: Right-Sizing, Reserved Instances, FinOps**
Right-sizing aligns instance capacity directly with measured utilization telemetry. Reserved instances / savings plans commit to long-term cloud provider utilization in exchange for reduced billing rates — trading operational flexibility for cost efficiency. FinOps establishes ongoing financial management practices across engineering and finance teams to govern cloud spend continuously.

## Security (Security Leadership)

**Zero Trust, SSO / OIDC**
Zero Trust enforces continuous authentication and authorization for every request, regardless of whether traffic originates inside internal networks (rejecting legacy perimeter security assumptions). SSO (Single Sign-On) powered by OIDC (OpenID Connect) provides centralized authentication across internal services, reducing credential sprawl and enabling instant access revocation upon employee offboarding.

**Incident Response Processes: Playbooks, Severity Standards, Postmortems**
Incident playbooks define pre-approved operational steps for specific incident classes — clarifying role assignments and escalation paths during high-pressure outages. Severity classification levels (e.g., Sev1 = total outage, Sev4 = minor non-impacting glitch) dictate required SLA response urgency. Security postmortems incorporate legal reporting requirements (e.g., mandatory data breach notifications under regulatory frameworks) and public communications strategies.

**Practical Compliance Implementation (SOC 2 / ISO 27001 / GDPR)**
Compliance goes beyond ticking checklists — it involves cross-functional coordination (engineering, legal, HR) to produce audit trails (access logs, code review records, employee training) that satisfy independent third-party SOC 2 / ISO 27001 auditors. GDPR enforces data privacy regulations for EU citizen data globally.

**Security Champions Programs**
Rather than funneling all security reviews through a centralized security team bottleneck, Security Champions embed trained security focal points directly within product feature teams to handle initial security triage and escalate complex issues to central teams.

## Practical Self-Study Guide

At Level 5, instead of memorizing definitions, write down specific architectural questions for your own organization/projects corresponding to each bullet point — if you cannot answer these questions for your active projects, identify those knowledge gaps as key development targets before stepping into Staff/Lead responsibilities.
