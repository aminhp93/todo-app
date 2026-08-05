# Level 5 — Answers / Detailed Explanations

Explanations for each bullet point in [level-5-staff-lead.md](level-5-staff-lead.md).
At this level, every concept connects directly to a QUESTION you must answer for your organization, beyond basic definitions.

## General Requirements (FE + BE)

**Microservices vs Modular Monolith, When NOT to Split Services**
```text
Monolithic App:       Modular Monolith:             Microservices:
+-----------------+   +-------------------------+   +--------+ +--------+
| UI + Logic + DB |   | Auth | Billing | Order  |   | Auth   | | Billing|
| (All in 1 unit) |   | (Separate modules in 1) |   | Service| | Service|
+-----------------+   +-------------------------+   +---+----+ +---+----+
                                                        |          |
                                                        ▼          ▼
                                                   [ Network REST / gRPC ]
```

**Domain-Driven Design: Bounded Contexts**
```text
                  +-----------------------------------+
                  |           User Entity             |
                  +-----------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                                                     |
         ▼                                                     ▼
+-------------------------+                           +-------------------------+
| Auth Bounded Context    |                           | Billing Bounded Context |
|  - id                   |                           |  - id                   |
|  - email                |                           |  - paymentMethod        |
|  - passwordHash         |                           |  - billingAddress       |
|  - role                 |                           |  - taxId                |
+-------------------------+                           +-------------------------+
```

**API Gateway, BFF (Backend for Frontend) Pattern**
```text
[ Web Client ]               [ Mobile App ]
      │                            │
      ▼                            ▼
+------------+               +--------------+
| Web BFF    |               | Mobile BFF   |  <-- Tailors response payload shapes
+-----+------+               +------+-------+
      |                             |
      +--------------+--------------+
                     │
                     ▼
             [ API Gateway ]  <-- Auth verification, Rate limiting, Routing
                     │
      +--------------+--------------+
      |                             |
      ▼                             ▼
+-----------+                 +-----------+
| User Svc  |                 | Order Svc |
+-----------+                 +-----------+
```

**Technical Roadmap Planning: Technical Debt, Impact vs Effort Matrix**
```text
          High Impact
              │
    [ Quick Wins ]      |  [ Strategic Projects ]
    (Fix Immediately)   |  (Schedule & Resource)
    --------------------+--------------------
    [ Low Priority ]    |  [ Time Sinks ]
    (Ignore / Deprecate)|  (Avoid / Re-evaluate)
              │
              └──────────────────────── Low to High Effort
```

**Incident Management: On-Call Rotations, Blameless Postmortems, Action Items**
```text
Incident Alerts ──> On-Call Engineer Paged ──> Triage & Mitigate ──> Blameless Postmortem ──> Action Items (Owner + SLA)
```

## DevOps (Platform / SRE)

**Platform Engineering: Internal Developer Platforms (IDP)**
```text
Developer ──(Self-service Portal / CLI)──> Internal Platform (IDP) ──(Automated Provisioning)──> K8s / RDS / S3
```

**SRE: SLA / SLO / SLI, Error Budgets**
```text
  Telemetry Data  ──>  SLI (e.g. 99.7% Success) ──>  SLO Target (e.g. 99.5%) ──>  SLA Commitment (e.g. 99.0%)
                                                           │
                                                           ▼
                                               Error Budget = 100% - SLO (0.5% Allowed Downtime)
```
```text
Error Budget Status:
[ 100% Budget Remaining ] ──(Normal Feature Shipping)──> [ Budget Depleted ] ──> Feature Freeze / Focus on Reliability
```

**Multi-region / Disaster Recovery: RTO / RPO, Real Restore Testing**
```text
Incident / Disaster Event
         │
         |<─── RPO (Max Lost Data Window, e.g. 1 hour backup) ───|
         |
         |─── RTO (Max Downtime Window to Full Recovery, e.g. 4 hours) ───> Recovery Complete
```

## Security (Security Leadership)

**Zero Trust, SSO / OIDC**
```text
Perimeter Model (Legacy):  [ Firewall ] ──> Inside Network = Implicit Trust (Vulnerable ⚠️)

Zero Trust Model (Modern):  Every Request ──> Verify Identity (OIDC) ──> Verify Device ──> Least Privilege Access
```

**Incident Response Processes: Playbooks, Severity Standards, Postmortems**
| Severity Level | Impact Description | SLA Target Response | Escalation Path |
| :--- | :--- | :--- | :--- |
| **Sev-1 (Critical)** | Core service outage affecting all users | < 15 minutes | Executive Team + Lead Engineers |
| **Sev-2 (Major)** | Major feature degraded, no workaround | < 1 hour | On-Call Team + Domain Leads |
| **Sev-3 (Minor)** | Minor issue, workaround available | < 24 hours | Standard Ticket Backlog |

## Practical Self-Study Guide

At Level 5, instead of memorizing definitions, write down specific architectural questions for your own organization/projects corresponding to each bullet point — if you cannot answer these questions for your active projects, identify those knowledge gaps as key development targets before stepping into Staff/Lead responsibilities.
