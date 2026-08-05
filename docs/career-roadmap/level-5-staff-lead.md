# Level 5 — Staff / Tech Lead

At this level, your sphere of influence extends beyond a single codebase — you are responsible for the **technical decisions of multiple teams**, not just the quality of code you write individually. Frontend and Backend requirements are no longer cleanly separated — most competencies involve system architecture and technical leadership applicable across both domains.

> Self-answer each bullet point before viewing the [answers/detailed explanation](level-5-staff-lead-answers.md).

## General Requirements (FE + BE)

- Multi-service architectural design: microservices vs modular monolith — knowing when NOT to split into microservices (operational overhead, distributed transaction complexities, network latency).
- Practical Domain-Driven Design: bounded contexts, avoiding one monolithic shared data model across all business domains.
- API Gateway and BFF (Backend for Frontend) patterns when multiple client types (web/mobile) require distinct API tailored representations.
- Technical roadmap planning: quantifying technical debt, prioritizing initiatives (impact vs effort matrix), persuading non-technical stakeholders.
- Incident management: on-call rotations, blameless postmortems, action items assigned with explicit owners and deadlines.
- Scalable mentorship: designing career growth frameworks for entire engineering organizations (such as this roadmap document itself!), beyond 1-on-1 code reviews.
- Drafting RFCs (Request for Comments) for major technical decisions, soliciting cross-team feedback prior to finalizing architecture.

**Keywords**: bounded context, BFF pattern, service mesh, API Gateway, distributed transaction (Saga pattern), blameless postmortem, RFC, technical debt quantification, on-call rotation, multi-region deployment, feature flags / progressive rollouts.

**Application in `todo-app`**: A small CRUD application **is not an environment to demonstrate genuine microservices or multi-region infrastructure** — forcing `todo-app` into microservices would be a textbook case of over-engineering, and a Staff engineer must recognize this rather than blindly checking boxes. The appropriate exercise at this level: Write a **simulated RFC** answering: "Assuming `todo-app` must scale to serve 10 million users, which components in the current architecture (3 backends sharing 1 DB, Postgres-backed sessions, no caching, no message queues) will break first, in order?" — self-evaluate your analysis against [level-4-senior.md](level-4-senior.md) (every failure point listed must justify *why* it fails, not simply list technology names).

## DevOps (Platform / SRE)

**Requirements**
- Platform engineering: building internal developer platforms (IDPs) so feature teams can self-serve deployments without needing low-level infrastructure expertise.
- Practical SRE: defining SLAs/SLOs/SLIs for services, managing error budgets, and leveraging error budgets to govern feature releases vs stability freeze decisions.
- Multi-region / Disaster Recovery: RTO (Recovery Time Objective) / RPO (Recovery Point Objective), backup strategies, and performing real restore testing (beyond simply taking unvalidated backups).
- Chaos engineering: proactively injecting controlled failures to uncover system weaknesses before production incidents occur naturally.
- Organizational cost optimization: resource right-sizing, reserved instances / savings plans, detecting cross-team infrastructure waste.

**Keywords**: SLA/SLO/SLI, error budget, RTO/RPO, disaster recovery, chaos engineering, platform engineering, internal developer platform (IDP), FinOps, right-sizing.

**Application in `todo-app`**: Real production infrastructure is absent here. The appropriate exercise: Write a **hypothetical SLO** for `todo-app` assuming commercial production deployment (e.g., "99.5% of requests to `/api/todos` respond under 300ms over a 30-day window"), calculate the corresponding error budget (permitted downtime/error minutes per month), and evaluate whether current infrastructure (single Postgres container, no replicas, no automated backups in `docker-compose.yml`) can satisfy that SLO — an honest evaluation should conclude "no, because of X".

## Security (Security Leadership)

**Requirements**
- Organization-wide security architecture: Zero Trust principles (never assuming internal network implicit trust), identity-first security (SSO/OIDC for internal systems).
- Formal incident response processes: incident playbooks, severity classification standards, SLA response targets, security postmortems (encompassing technical, legal, and PR dimensions as required).
- Practical implementation of compliance frameworks (SOC 2 / ISO 27001 / GDPR) — coordinating audit evidence collection across multiple teams beyond checklist reading.
- Security Champions programs: embedding dedicated security champions within feature teams rather than centralizing security bottlenecks.

**Keywords**: zero trust, SSO/OIDC, incident response playbook, severity classification, SOC2/ISO27001/GDPR, security champions, security postmortem.

**Application in `todo-app`**: Similarly, organizational context is absent — however, the `authenticateSession` bug (unhandled async error process crash) discovered in this repository provides prime material for drafting a **simulated incident response playbook**: If this bug occurs in production at 2:00 AM, who gets paged, what is the severity level (total outage vs route-specific degradation), what is the expected SLA response time, and what initial diagnostic steps should an on-call engineer perform upon receiving the alert?

## How to Self-Check Level 5 Mastery

You can write a concise 1-page RFC enabling engineers to understand the problem, alternatives, and tradeoffs without requiring verbal clarification. You distinguish when to say "no" to complex technical proposals (e.g., "microservices are not needed yet") instead of over-engineering, and you can define clear SLOs with corresponding error budgets for specific services.
