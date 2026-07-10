# Rubric — 7 weighted dimensions (total 100)

Both artifacts (topology + solution sheet) are scored on these dimensions. Score
each 0–100% of its weight, then sum. The two heaviest — Zero Trust principles and
agentic-specific controls — are where strong designs separate themselves.

| # | Dimension | Weight | What a top answer shows |
|---|-----------|:------:|-------------------------|
| 1 | **Pain-point identification** | 10 | Surfaces the real risks — shared identity, implicit trust, flat network, no audit — and ranks them. |
| 2 | **Zero Trust principles** | 20 | Never-trust/always-verify, least privilege, assume breach, and microsegmentation applied throughout. |
| 3 | **Agentic-specific controls** | 25 | Per-agent identity, JIT scoped tokens, a policy checkpoint on every call, runtime guardrails, human-in-the-loop on high-risk actions. |
| 4 | **Topology quality** | 10 | Correct component placement and clear trust/data flows. **Legibility is judged here only.** |
| 5 | **Decisions under injection** | 15 | All three injections answered coherently and reflected in the design, not bolted on. |
| 6 | **Solution-sheet communication** | 10 | Approach and key decisions explained clearly, with the "why" behind each choice. |
| 7 | **Individual contribution** | 10 | Each member's reflection shows a distinct decision they drove. |

**Total: 100.**

## The legibility rule (do not violate)

A hard-to-read diagram may only lower **Topology quality (dimension 4)**. It must
**never** reduce the security dimensions (2, 3, 5). If a control's presence can be
inferred from labels, arrows, or the solution sheet, credit it. If the diagram
genuinely cannot be read and the sheet does not resolve it, flag it for **human
SME review** rather than guessing — the machine speeds up scoring, it does not get
the final word.

## Proficiency levels

Map the final total to a band. These describe an **individual's growth path, not a
ranking between teams.** Treat the cutoffs as provisional until calibrated against
a real cohort.

| Range | Level | Meaning |
|-------|-------|---------|
| 0–49  | **Foundational** | Names some risks; controls are partial or generic, not agent-aware. |
| 50–69 | **Proficient**   | Solid Zero Trust design; most agentic controls present and placed correctly. |
| 70–84 | **Advanced**     | Complete, well-reasoned design; injections handled with clear trade-offs. |
| 85–100| **Expert**       | Elegant, defensible architecture; every control justified and audit-ready. |

## Optional: proctor-console breakdown

Some consoles collapse the score into four fields that also sum to 100. Keep them
consistent with the rubric total:

- **Injection 01 / 02 / 03** — 0–10 each (how well each injection is answered and
  reflected in the design).
- **Final solution** — 0–70 (completeness and coherence against the 8 reference
  controls and overall best practice).
