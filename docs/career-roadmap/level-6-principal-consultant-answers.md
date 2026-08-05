# Level 6 — Answers / Detailed Explanations

Explanations for each bullet point in [level-6-principal-consultant.md](level-6-principal-consultant.md).
At this level, most concepts stem from financial and organizational management rather than pure software engineering — if this material feels unfamiliar, that indicates genuine progression rather than misplaced study.

## Requirements

**Strategic Technology Consulting: Multiple Options with Cost / Risk / Timeline Tradeoffs**
| Option | Estimated Cost | Implementation Timeline | Primary Risk / Tradeoff | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **1. Custom Build** | High ($150k) | 6 Months | High maintenance, engineering bandwidth sink | Core Moat Only |
| **2. SaaS Vendor (Buy)** | Medium ($2k/mo) | 2 Weeks | Vendor lock-in, recurring operating expense | **Recommended** |
| **3. Do Nothing (Status Quo)** | $0 Initial | Instant | High technical debt accumulation, risk exposure | Reject |

**Business Acumen: ROI, TCO, Tying Technical Decisions to Business Goals**
* **Total Cost of Ownership (TCO) Iceberg:**
  ```text
            /\      <-- Visible Initial Purchase / License Price (20%)
           /  \
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         /      \
        /        \  <-- Hidden Ongoing Costs (80%):
       /          \     - Infrastructure Hosting & Cloud Bandwidth
      /            \    - Maintenance, Security Patching & Upgrades
     /              \   - Employee Training & Onboarding Overhead
    /                \  - Downtime Risk & SLA Penalty Exposure
  -----------------------------------------------------------------
  ```

**Build vs Buy**
```text
Is this feature a Core Competitive Differentiator for our business?
                    │
           +--------+--------+
           |                 |
          YES               NO
           │                 │
           ▼                 ▼
   [ BUILD IN-HOUSE ]   [ BUY SAAS / ADOPT VENDOR ]
  (Retain 100% Control)  (Fast Time-to-Market)
```

**Organizational Standardization: Technology Radar**
```text
+-------------------------------+-------------------------------+
| ADOPT                         | TRIAL                         |
| Proven, default for new builds| Controlled experimental use   |
| (e.g. Next.js, PostgreSQL)    | (e.g. Vite, Bun)              |
+-------------------------------+-------------------------------+
| HOLD                          | RETIRE                        |
| Maintain existing, no new use | Active scheduled migration out|
| (e.g. Redux Toolkit)          | (e.g. jQuery, REST v1)        |
+-------------------------------+-------------------------------+
```

**Executive Communication: Proposals, C-Level Presentations**
```text
Standard Technical Presentation:
Details ──> Experiments ──> Architecture Specs ──> Conclusion (Bores C-Level!)

Executive Summary Presentation (Pyramid Principle):
Recommendation & ROI ──> Business & Financial Impact ──> Technical Proof (Appendix)
```

## DevOps (Infrastructure & Operational Consulting)

**Cloud Strategy Consulting: Multi-Cloud vs Single-Vendor**
```text
Single-Vendor (AWS / GCP / Azure):
  - Streamlined operations, unified IAM, volume billing discounts
  - High Vendor Lock-in (Migration requires heavy re-architecture)

Multi-Cloud Strategy:
  - Eliminates single-vendor dependency, improved negotiation leverage
  - Increased operational overhead, lowest-common-denominator feature use
```

**Organizational FinOps**
```text
Cloud Account Ingress ──> Tagging & Attribution ──> Budget Threshold Alerts ──> Showback / Chargeback to Departments
```

## Security (Security Consulting)

**Risk Registers: Probability × Impact**
```text
           Impact ->  LOW          MEDIUM          HIGH
Probability
   HIGH            |  Medium      |  High        |  CRITICAL (Address Instantly)
   MEDIUM          |  Low         |  Medium      |  High
   LOW             |  Negligible  |  Low         |  Medium
```
* **Sample Risk Register Matrix Entry:**
  | Vulnerability Risk | Probability | Impact | Risk Score | Mitigation Plan | Owner |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | Unpatched OpenSSL CVE | Medium | High | **High** | Upgrade base image layer in CI | Security Lead |
  | Plaintext DB Seed Pass | Low | Critical | **High** | Enforce bcrypt + Secrets Manager | Backend Lead |

**C-Level Security Risk Communication**
```text
Technical Vulnerability: "Missing rate limiting on /api/auth/login route"
                                   │
                                   ▼  (Translate to Business Terms)
Executive Risk Statement: "Exposes system to credential stuffing attacks, risking customer account takeover, $500k regulatory GDPR fines, and severe brand reputational loss."
```

## Practical Self-Study Guide

For each topic, ask yourself: "If I had 2 sentences to explain this concept to a non-technical executive, what would I say?" — if you cannot articulate a concise explanation, you understand the technical concept but have not yet mastered translating it into strategic advisory output.
