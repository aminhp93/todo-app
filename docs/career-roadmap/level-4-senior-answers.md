# Level 4 — Answers / Detailed Explanations

Explanations for each bullet point in [level-4-senior.md](level-4-senior.md).
At Level 4, most valid answers take the form of "it depends on X" — if you only memorize definitions without explaining tradeoffs, you have not met the standard.

## Frontend

**Multi-team Frontend Architecture: Module Boundaries, Design Systems, Monorepos**
```text
Monorepo Layout (Turborepo / Nx):
apps/
  ├── web-app/         (Imports @proj/ui, @proj/utils)
  └── mobile-app/      (Imports @proj/ui, @proj/utils)
packages/
  ├── ui/              (Shared Design System Components)
  ├── utils/           (Shared Business Logic & API Helpers)
  └── config/          (Shared ESLint / TS / Tailwind Configs)
```

**Deep Performance Optimization: Bundle Analysis, Virtualization, Web Workers, Real-world Web Vitals**
* **List Virtualization (`react-window`):**
  ```text
  Standard List (10,000 items):      Virtual List (10,000 items):
  +--------------------------+       +--------------------------+  Viewport Window
  | Item 1                   |       | Item 44 (Rendered DOM)   |  (Renders ONLY 10 visible
  | Item 2                   |       | Item 45 (Rendered DOM)   |   items in DOM tree;
  | ...                      |       | ...                      |   Recycles DOM nodes on scroll)
  | Item 10,000 (Laggy DOM!) |       | Item 53 (Rendered DOM)   |
  +--------------------------+       +--------------------------+
  ```
* **Offloading Heavy Computation to Web Worker:**
  ```typescript
  // main.ts (UI Thread stays at 60 FPS smooth response)
  const worker = new Worker(new URL('./parser.worker.ts', import.meta.url));
  worker.postMessage({ rawData: massiveCsvFile });
  worker.onmessage = (e) => setParsedData(e.data);
  ```

**Testing: E2E, Visual Regression, Test Pyramid**
```text
         / \        <-- E2E Tests (Playwright / Cypress)
        /   \           Slowest, Expensive, Full Stack Real Browsers
       /-----\
      / Integration \ <-- Integration Tests (Supertest, RTL Component Flows)
     /---------------\    Moderate Speed & Coverage
    /    Unit Tests    \ <-- Unit Tests (Jest / Vitest)
   /---------------------\   Fastest, Cheapest, High Coverage Volume
```

**Frontend Security: XSS Prevention, CSRF, CSP**
* **Content Security Policy (CSP) Header:**
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self' https://trustedscripts.com; object-src 'none';
  ```
  *(Prevents browsers from executing unauthorized inline scripts or untrusted external CDN scripts, mitigating XSS even if injection occurs)*.

## Backend

**System Design: Horizontal Scaling, Load Balancing, Multi-tier Caching, Message Queues**
```text
                          +------------------------+
                          | Load Balancer (Nginx)  |
                          +-----------+------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         ▼                            ▼                            ▼
+-----------------+          +-----------------+          +-----------------+
| App Instance 1  |          | App Instance 2  |          | App Instance 3  |
+--------+--------+          +--------+--------+          +--------+--------+
         |                            |                            |
         +----------------------------+----------------------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         ▼                            ▼                            ▼
+-----------------+          +-----------------+          +-----------------+
| Redis Session   |          | Primary DB      |          | Read Replicas   |
| & Cache Cluster |          | (Writes)        |          | (Replicated Reads)
+-----------------+          +-----------------+          +-----------------+
```

**Deep Database Knowledge: Replication, Partitioning / Sharding, Connection Pool Tuning**
* **Sharding Architecture:**
  ```text
  User ID Hash Key (user_id % 2):
  user_id = 102 ──> Shard 0 (PostgreSQL DB Server 1)
  user_id = 103 ──> Shard 1 (PostgreSQL DB Server 2)
  ```

**Observability: Structured Logging, Metrics, Distributed Tracing**
* **OpenTelemetry Distributed Tracing Propagation:**
  ```text
  Client ──(TraceID: abc-123)──> API Gateway ──(TraceID: abc-123)──> Auth Service ──(TraceID: abc-123)──> DB
  ```

**Reliability: Idempotency Keys, Retry Backoff, Circuit Breakers, Timeouts**
* **Circuit Breaker State Transitions:**
  ```text
                  +-----------------------------------+
                  |                                   | (Success Threshold Met)
                  ▼                                   |
           +--------------+   (Error Rate > 50%)    +--------------+
           |    CLOSED    | ----------------------> |     OPEN     |
           | (Normal Flow)|                         | (Fast Failure|
           +--------------+                         |  No Calls)   |
                  ▲                                 +--------------+
                  |                                        |
                  |                                        | (Cooldown Timeout)
                  |          +--------------+              |
                  +--------- |  HALF-OPEN   | <------------+
                             | (Test Traffic|
                             +--------------+
  ```

## DevOps

**Orchestration: Kubernetes/ECS, Knowing When NOT to Deploy**
```text
Kubernetes Cluster Architecture:
Ingress Controller ──> K8s Service ──> Pod 1 (App Container)
                                  └──> Pod 2 (App Container) [Managed by HPA]
```

**Full Lifecycle CI/CD, Rollback Strategies**
* **Blue-Green Deployment vs Canary Release:**
  ```text
  Blue-Green Deployment:
  Live Traffic ──> [ Router ] ──(100% Traffic)──> Green (V2 New Release)
                                 (0% Traffic) ──> Blue  (V1 Rollback Standby)

  Canary Release:
  Live Traffic ──> [ Router ] ──(95% Traffic)──> V1 Stable Instances
                             └──(5% Traffic) ──> V2 Canary Instances (Monitor Error Rate)
  ```

## Security

**Threat Modeling (STRIDE) Before Implementation**
| STRIDE Category | Threat Description | Security Mitigation |
| :--- | :--- | :--- |
| **S**poofing | Attacker impersonates legitimate user | Strong Auth, JWT signature verification, MFA |
| **T**ampering | Unauthorized modification of DB records | Parameterized queries, TLS encryption, HMAC signatures |
| **R**epudiation | User denies performing an action | Immutable audit logging with user IDs & timestamps |
| **I**nformation Disc. | Sensitive data leak to unauthorized parties | Encryption at rest, HTTPS, stripping secrets from logs |
| **D**enial of Service | Flooding server to exhaust resources | Rate limiting, Redis caching, CAPTCHA, WAF |
| **E**levation of Priv. | Standard user gains admin privileges | Strict RBAC (Role-Based Access Control) enforcement |

**Security Response Headers: CSP, HSTS, `X-Frame-Options`, `helmet`**
```typescript
import helmet from 'helmet';
import express from 'express';

const app = express();

// Automatically sets CSP, HSTS, X-Frame-Options (DENY), X-Content-Type-Options (nosniff)
app.use(helmet());
```
