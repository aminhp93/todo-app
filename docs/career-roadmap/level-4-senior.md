# Level 4 — Senior

From this level onwards, "knowing how to build" is no longer enough — you must **be able to explain tradeoffs** and **design for scale and maintainability**, not just solve the immediate problem at hand.

> Self-answer each bullet point before viewing the [answers/detailed explanation](level-4-senior-answers.md).

## Frontend

**Requirements**
- Multi-team frontend architecture: clear module boundaries, shared design systems/component libraries, monorepos (Turborepo/Nx) when appropriate.
- Deep performance optimization: bundle size analysis (`webpack-bundle-analyzer`), long-list virtualization (`react-window`), Web Workers for heavy computations, real-world Web Vitals optimization (beyond basic definitions).
- Testing: E2E testing (Playwright/Cypress), visual regression testing, understanding the test pyramid (unit >> integration >> E2E).
- Frontend security: XSS prevention (output escaping, avoiding indiscriminate `dangerouslySetInnerHTML`), CSRF mitigation, Content Security Policy.
- Driving code reviews, enforcing team engineering conventions (custom ESLint/Prettier rules), mentoring junior and mid-level engineers.

**Keywords**: micro-frontend, module federation, design token, `react-window`, Web Worker, Playwright, visual regression, CSP header, `SameSite` cookie, Core Web Vitals budget, ADR (Architecture Decision Record).

**Application in `todo-app`**: The project currently has 2 distinct frontends (`fe-vite`, `fe-nextjs`) consuming shared backends — presenting a practical exercise in "multi-team API consumption". Recommended artifact: Write an ADR addressing: "If these 2 frontends need to share components (e.g., `TodoItem`, category color design tokens), should they be extracted into a separate monorepo package or duplicated across repos? What are the tradeoffs?" — this is a real-world architectural question a Senior FE must answer, **which holds greater value than writing the actual monorepo code**.

## Backend

**Requirements**
- System design: horizontal scaling, load balancing, multi-tier caching strategies (CDN / app cache / DB cache), asynchronous message queues (RabbitMQ/Kafka/SQS).
- Deep database knowledge: replication (read replicas), partitioning/sharding principles + knowing when to apply them, connection pool tuning, query optimization for multi-million row tables.
- Security: OWASP Top 10 applied in real-world contexts (beyond superficial listing), secrets management (Vault/SSM replacing production `.env` files), user/IP rate limiting, principle of least privilege for database roles.
- Observability: structured logging (JSON logs), metrics collection (Prometheus), distributed tracing (OpenTelemetry) — ability to debug production incidents using logs/metrics/traces rather than `console.log` via SSH.
- Reliability patterns: idempotency keys for financial/order mutation APIs, retry with exponential backoff, circuit breaker patterns, reasonable timeouts across inter-service calls.
- Designing realistic CI/CD pipelines (beyond basic build/syntax checks), foundational Infrastructure as Code.

**Keywords**: read replica, sharding, connection pooling, OWASP Top 10, secrets manager, structured logging, OpenTelemetry, idempotency key, circuit breaker, exponential backoff, SLA/SLO/SLI, blue-green deployment.

**Application in `todo-app`**: The project currently LACKS observability (only `console.log`), lacks message queues, and CI ([`ci.yml`](../../.github/workflows/ci.yml)) only performs build checks without running tests or linting for `be-node-express`. Recommended artifacts to write, using bugs discovered in this codebase as concrete examples:
- A **simulated postmortem** for the `authenticateSession` bug (an unhandled async middleware rejection causing process crashes due to missing `asyncHandler`). Standard structure: Impact / Timeline / Root Cause / Detection Gap (why no alerts fired on process crash) / Action Items (add global `process.on('unhandledRejection')` handlers? add middleware tests? integrate APM?).
- An **ADR** evaluating: "JWT vs Session for this system if scaling across multiple instances?" (Hint: Session auth requires sticky sessions or a centralized store — the project correctly used `connect-pg-simple`, but PostgreSQL is suboptimal for large-scale session stores compared to Redis — explaining *why* meets the requirement).

## DevOps

**Requirements**
- Hands-on orchestration: practical Kubernetes knowledge (Pod/Deployment/Service/Ingress) or managed alternatives (ECS/Cloud Run) — knowing when Kubernetes is NOT necessary for smaller scales.
- Infrastructure as Code: Terraform/Pulumi to version infrastructure, enabling code reviews via PRs instead of manual cloud console clicks.
- Full lifecycle CI/CD: build → test → security scanning (SAST / dependency scanning) → automated deployment, backed by rollback strategies (blue-green / canary releases).
- Operational observability: metrics (Prometheus/Grafana), centralized logging (Loki/ELK), alerting thresholds (preventing alert fatigue).
- Metric-driven auto-scaling (CPU/memory/queue depth) rather than hardcoded instance counts.

**Keywords**: Kubernetes (Pod/Deployment/Ingress/HPA), Terraform state, blue-green deployment, canary release, Prometheus/Grafana, Loki/ELK, alerting threshold, auto-scaling, GitOps (ArgoCD/Flux).

**Application in `todo-app`**: The project currently runs on `docker-compose` — an appropriate scale for a demo project. A skilled Senior must recognize that **Kubernetes is not needed here**, rather than defaulting to recommending it. Recommended artifact: Write an ADR answering: "If `todo-app` were deployed to production with several hundred users, should it remain on `docker-compose` + single VPS or migrate to Kubernetes/ECS? What scale thresholds (traffic, service count, team capacity) trigger a shift in decision?" — demonstrating knowledge of **when NOT to adopt** complex tools.

## Security

**Requirements**
- Threat modeling for new features before writing code (rather than reacting post-vulnerability discovery) — e.g., practical application of STRIDE framework.
- Production secrets management: Vault / AWS Secrets Manager / SSM Parameter Store instead of static environment variables in configuration files.
- Security response headers: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options` (typically via middleware like `helmet`).
- Automated SAST (Semgrep/CodeQL) and dependency scanning in CI pipelines, blocking PR merges on high-severity vulnerabilities.
- Least privilege: application database users should NOT possess `DROP TABLE` or `CREATE ROLE` permissions; enforcing network segmentation between services.

**Keywords**: threat modeling (STRIDE), secrets manager, CSP/HSTS, `helmet`, SAST (Semgrep/CodeQL), least privilege, network segmentation.

**Application in `todo-app`**: This represents the clearest gap at Level 4. Currently:
- `docker-compose.prod.yml` correctly follows least-privilege for secrets handling: using `${JWT_ACCESS_SECRET:?...}` to **fail fast** if production secrets are unconfigured, avoiding fallback to weak defaults — but relies on static environment variables rather than a secrets manager.
- Lacks `helmet` or security headers in [`src/app.ts`](../../be-node-express/src/app.ts) — an actionable fix requiring <30 minutes.
- Lacks SAST / dependency scanning steps in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
- Superuser credentials `postgres`/`postgres` are used directly by the application — violating least privilege; a dedicated application DB role restricted to `SELECT/INSERT/UPDATE/DELETE` on specific tables should be configured.

## How to Self-Check Level 4 Mastery

You can answer: "How many QPS can the current system handle before the database becomes a bottleneck, and where specifically is the bottleneck?" without guessing; write structured postmortems and ADRs for bugs and architectural decisions in your own projects; and for Security/DevOps, identify the **top 3 actionable priorities** if moving this application to production (rather than listing 20 random technologies), defending why those specific 3 carry highest priority.
