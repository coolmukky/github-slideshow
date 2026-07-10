# Agents

Custom [Claude Code subagents](https://code.claude.com/docs/en/subagents) for
this repository.

## `network-design-proctor` — Circuit, the AI proctor

Implements the **Circuit AI proctor** described on the sprint page
(`zero-trust-design-sprint.html`, section `#scoring`): it turns a photographed
**network-design topology** into a structured graph, compares it plus the
team's **solution sheet** against the **8-control Zero Trust reference pattern**,
and returns a **score out of 100**, a **proficiency level** (Foundational /
Proficient / Advanced / Expert), per-dimension rubric feedback, and a breakdown
that pastes straight into the **`proctor.html`** scoring console (Injection
01/02/03 at /10 each + Final solution at /70).

### Invoke it

Ask Claude Code to use the agent, giving it the two artifacts:

```
Use the network-design-proctor agent to evaluate this submission.
Diagram: ./submissions/team-atlas/topology.png
Solution sheet: ./submissions/team-atlas/solution.md
Team: Team Atlas
```

The agent reads the image(s) and sheet, runs the **Capture → Convert → Compare →
Score → Level** pipeline, and returns a Markdown report followed by a
machine-readable `json` block (score, level, per-control status, and the
`proctorConsole` fields to copy into `proctor.html`).

### What it grades against

- **Rubric & proficiency bands** — the 7 weighted dimensions and 4 levels from
  `zero-trust-design-sprint.html` (`#rubric`).
- **Reference design** — the 8-control target pattern from the Debrief
  (`#debrief`) and the worked-solution topology.
- **Injections** — the three sealed twists (`#injections`) and their reference
  answers.

`zero-trust-design-sprint.html` is the source of truth; the agent embeds copies
for convenience but defers to the file if they diverge. Keep the agent in sync
if you change the rubric, reference controls, or injections there.

> The score sorts; the debrief teaches. The proctor speeds up scoring — a human
> SME can always review or override, and low-confidence diagram reads are
> flagged for exactly that.
