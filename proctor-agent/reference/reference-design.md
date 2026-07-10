# Reference design — the 8-control target pattern

A strong design shows these eight controls, correctly placed and connected. Each
maps to a numbered node in the reference topology below.

1. **Per-agent identity** — each agent has its own verifiable workload identity;
   no shared service accounts. *(Identity Provider)*
2. **Just-in-time, scoped, short-lived tokens** — least privilege per action,
   expiring fast. *(Token Service — JIT · scoped · short-lived)*
3. **Policy checkpoint on every call** — a Policy Decision/Enforcement Point
   authorizes each agent→resource request; **deny by default**. *(Policy
   Decision Point + Agent Gateway / Policy Enforcement Point)*
4. **Microsegmentation** — resources isolated behind a trust boundary so a
   compromise can't move laterally. *(Microsegmented resource zone — "verify
   every call")*
5. **Continuous verification + anomaly monitoring** — re-check trust each
   request; detect abnormal behaviour; **revoke fast** on abuse. *(Continuous
   verification — anomaly detection · revoke on abuse)*
6. **Runtime guardrails on agent tools** — constrain tools and inputs to blunt
   prompt-injection / tool misuse. *(Guardrails at the gateway — tool & input
   guardrails)*
7. **Human-in-the-loop on high-risk actions** — refunds, account freezes,
   production writes gated behind human approval. *(Human-in-the-loop approval)*
8. **Immutable, identity-bound audit log** — every agent→resource call logged at
   the checkpoint, append-only, queryable on demand. *(Immutable, identity-bound
   audit log)*

## Reference topology shape

```
                         control plane
        ┌───────────────┬──────────────┬────────────────────┐
        │ 1 Identity    │ 2 Token       │ 3 Policy Decision  │
        │   Provider    │   Service     │   Point (deny-by-  │
        │ per-agent id  │ JIT · scoped  │   default)         │
        └───────┬───────┴──────┬────────┴─────────┬──────────┘
                │ identity      │ 1 token/action   │ consult
   agents       ▼               ▼                  ▼
  ┌─────────┐        ┌─────────────────────────────────┐        ┌──── microsegmented ────┐
  │ agent-A │──────▶ │  3/6 AGENT GATEWAY (PEP)         │──────▶ │ 4 Customer records      │
  │ agent-B │  req   │  ★ authorizes every call        │ scoped │   Production ledger DB   │
  │ agent-C │──────▶ │  + tool & input guardrails      │  call  │   Partner bank API       │
  └─────────┘        └───────┬───────────────┬─────────┘        │  VERIFY EVERY CALL       │
                             │ observe       │ high-risk        └───────────┬─────────────┘
                             ▼               ▼                              │ approved write
                   ┌───────────────────┐  ┌────────────────────┐           ▼
                   │ 5 Continuous      │  │ 7 Human-in-the-loop │   (refunds · freezes ·
                   │   verification    │  │   approval          │    production writes)
                   │ revoke on abuse   │  └────────────────────┘
                   └───────────────────┘
                             │ log                     │ log
                             ▼                         ▼
                   ┌──────────────────────────────────────────┐
                   │ 8 Immutable, identity-bound audit log     │
                   │   every agent→resource call · queryable   │
                   └──────────────────────────────────────────┘
```

Key relationships: `agents → gateway (PEP) → microsegmented resources`, with the
**identity provider + token service + policy decision point** on the control
plane, **monitoring/revocation** observing the gateway, **human approval** in
front of high-risk resources, and the **audit log** fed by the gateway.

## Worked reference answer (one strong example)

- **Problem in one sentence:** three autonomous agents share one over-privileged
  account on a flat network with no per-agent audit, so a single compromised
  agent could read, move, or alter customer funds undetected.
- **Approach:** give every agent its own identity; broker every action through a
  policy enforcement point that issues JIT least-privilege tokens; isolate
  resources into microsegments; gate irreversible actions behind a human; log
  every call to an immutable, identity-bound trail.
- **Legend convention:** agents & gateway = one colour; identity/policy control
  plane & trust boundary = another; microsegmented resources = white boxes in a
  dashed zone; human approval, monitoring/revocation, and the audit log each get
  their own colour so the roles read at a glance.
