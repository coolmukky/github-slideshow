# Scenario — the design the topology must solve

> This is the reference scenario the proctor grades against. Specific node names
> will vary between cohorts; grade against the **pattern and principles**, not
> against these exact names.

## Halcyon Pay

Three autonomous AI agents operate inside a payments company:

- **Support agent** (`agent-A`)
- **Reconciliation agent** (`agent-B`)
- **Fraud-triage agent** (`agent-C`)

They share **one over-privileged account on a flat network with no per-agent
audit**. A single compromised agent could **read, move, or alter customer funds
undetected**.

## The design task

Re-architect around **Zero Trust for autonomous agents** so that an evaluator
can look at the topology and the one-page solution sheet and clearly see
**identity, least privilege, continuous verification, and blast-radius control**
applied to every agent.

A design is "done" when:

- Every pain point is addressed by a control in the design.
- All three injections (see `injections.md`) are answered **inside** the design,
  not bolted on afterward.
- The topology and the solution sheet tell the **same story**.
