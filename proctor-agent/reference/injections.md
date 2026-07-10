# The three injections

Each injection is a mid-exercise twist that must show up **inside the design or
the solution sheet**, not bolted on afterward. **All three are always used**, so
every submission is graded on the same twists.

An injection answer is **coherent** when it uses the team's own design (their
gateway, their tokens, their log) rather than introducing a new one-off tool.

---

## Injection 01 · Autonomous Expansion  *(revealed @ 24:00)*

**Prompt.** A new reconciliation agent must read and write the **production
customer ledger** with no human in the loop. Leadership wants it live this week.

**What to look for.** How do you grant this access under Zero Trust **without**
standing, broad privilege? Per-agent identity, just-in-time scoped tokens,
policy-gated writes, and human approval reserved for the riskiest actions.

**Reference answer.** Give the reconciliation agent **its own identity** and a
**token scoped to "ledger read + one write," issued per task and expiring in
minutes**; production writes still route through **human approval**. No standing
broad access. *(Exercises controls 1, 2, 3, 7.)*

---

## Injection 02 · Token in the Wild  *(revealed @ 38:00)*

**Prompt.** Monitoring fires: one agent's credential is calling APIs from an
**unexpected region at 20× normal volume**. It may be compromised right now.

**What to look for.** How does the design contain the blast radius in real time?
Short token lifetimes, instant revocation, continuous verification, segmentation
that stops lateral movement, and behavioural anomaly response.

**Reference answer.** The **monitor flags the abnormal region and volume**, the
**gateway revokes that agent's token instantly**, and **short TTLs plus
microsegmentation** cap what the attacker reaches in the seconds before
revocation. *(Exercises controls 5, 2, 4, 3.)*

---

## Injection 03 · Prove It  *(revealed @ 50:00)*

**Prompt.** An auditor demands a **complete, tamper-evident trail of every
agent-to-resource action** for the last 90 days — produced on demand.

**What to look for.** Does the design already produce this, and where? Logging at
the policy checkpoint, identity-bound records, immutable/append-only storage, and
a single place to query it.

**Reference answer.** Every agent→resource call is **already logged at the
gateway, identity-bound and append-only**, so the 90-day trail is a **single
query** — nothing to reconstruct. *(Exercises control 8.)*
