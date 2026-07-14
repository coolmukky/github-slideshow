# Design Clinic Environment — Halcyon Pay (simulated enterprise)

A **pseudo enterprise environment** for Sales Engineers to practice the
[Zero Trust Agentic Design Sprint](../zero-trust-design-sprint.html). It gives the clinic a tangible
**current-state ("before") architecture** to explore before the team designs the Zero Trust target state.

Everything is **static** — no backend, no real data, no credentials. It runs anywhere static files are served
(GitHub Pages, `python -m http.server`, or just opening `index.html`).

## The one page

➡️ **[`index.html`](./index.html)** — the **Environment Map**. A single page that shows every server and application
running in the fictional **Halcyon Pay** estate and **how they connect**:

- **Interactive topology** — click any node to inspect its role, host/port, the identity it runs as, what it connects
  to, and its current-state risks, then **open the live (static) application**.
- **Red dashed lines** mark the over-privileged trust that a Zero Trust redesign must remove.
- **Inventory table** and a **posture summary** below the diagram.

## The estate

The scenario mirrors the sprint dossier: Halcyon Pay is a mid-size fintech running three autonomous AI agents that all
share one over-privileged service account (`svc-halcyon`) on a flat network with no per-agent audit.

| Tier | Node | Application (static page) |
|---|---|---|
| Edge | `edge-lb-01` | reverse proxy / load balancer |
| Web | `web-01:443` | [Support Portal](./apps/support-portal.html) — support-resolution agent |
| Web | `web-01:8443` | [Ledger & Reconciliation](./apps/ledger-console.html) — reconciliation agent |
| Web | `web-01:9443` | [Fraud Triage](./apps/fraud-triage.html) — fraud-triage agent |
| App | `app-01:8081` | [Ops Console](./apps/ops-console.html) — internal admin |
| Data | `db-01:5432` | [DB Admin](./apps/db-admin.html) — ledger + customer records |
| Comms | `mail-01:993` | [Webmail](./apps/webmail.html) — notifications + internal mail |

Each app page is a **minimum static response** that looks like the running application and surfaces the security
"tells" (shared identity, no approval, long-lived keys, no segmentation) the SE is meant to spot.

## Using it in a clinic

1. **Walk the estate** on the map — open each app, note the identity it runs as and what it can reach.
2. **Mark the trust** — every red dashed line is standing, over-broad access to redesign.
3. **Redesign** the target state on the sprint canvas (per-agent identity, JIT least privilege, a policy checkpoint on
   every call, segmentation, an identity-bound audit log).
4. **Defend it** — re-walk against the target: can you now answer "which agent did what," and can one compromised
   agent still roam?

## Files

```
design-clinic-env/
├── index.html              # single-page environment map (topology + inventory)
├── assets/env.css          # shared styles (matches the sprint palette)
├── apps/
│   ├── support-portal.html
│   ├── ledger-console.html
│   ├── fraud-triage.html
│   ├── db-admin.html
│   ├── webmail.html
│   └── ops-console.html
└── README.md
```

> **Fictional.** Halcyon Pay, its servers, customers, and credentials are invented for training. Nothing here
> represents a real system.
