# Network Design Proctor

A standalone **AI proctor** that evaluates a **network-design topology** (an
image) together with its **solution sheet** (text or image) against a fixed
**Zero Trust reference pattern** and **rubric**, then returns a **score out of
100**, a **proficiency level**, and evidence-based feedback.

It is packaged as a self-contained [Claude Code](https://code.claude.com)
project: open this folder as your working directory and the
`network-design-proctor` subagent and its reference material are available on
their own — **no dependency on any other project's files.**

## What it does

Given a topology diagram and a solution write-up, the agent runs the pipeline:

**Capture → Convert → Compare → Score → Level**

1. **Capture** — reads the diagram image(s) and the solution sheet.
2. **Convert** — turns the diagram into a structured topology graph (nodes +
   labelled flows) with a read-confidence score.
3. **Compare** — checks the design against the **8-control reference pattern**
   and the **three injections**, citing evidence for each.
4. **Score** — rates the **7 weighted rubric dimensions** (total 100).
5. **Level** — maps the total to **Foundational / Proficient / Advanced /
   Expert** and explains why, plus the highest-leverage way to level up.

It returns a Markdown report **and** a machine-readable `json` block (score,
level, per-control status, per-dimension points, and a console-ready breakdown
of Injection 01/02/03 at /10 each + Final solution at /70).

## Project layout

```
proctor-agent/
├── README.md                     ← you are here
├── CLAUDE.md                     ← project guidance for Claude Code
├── .claude/agents/
│   └── network-design-proctor.md ← the agent definition
├── reference/                    ← source of truth the agent grades against
│   ├── scenario.md               ←   the design task
│   ├── reference-design.md       ←   the 8-control target pattern
│   ├── injections.md             ←   the 3 twists + reference answers
│   └── rubric.md                 ←   7 weighted dimensions + proficiency bands
└── submissions/                  ← drop team artifacts here to grade them
```

## Usage

From this folder, ask Claude Code to run the agent with the two artifacts:

```
Use the network-design-proctor agent to evaluate this submission.
Diagram: ./submissions/team-atlas/topology.png
Solution sheet: ./submissions/team-atlas/solution.md
Team: Team Atlas
```

The agent reads the image(s) and sheet and returns the report + JSON. Grading the
diagram alone is allowed — it will note the sheet was absent and cap the
communication-dependent dimensions.

## Customising the rubric

The files in `reference/` are the **authoritative** rubric, reference design, and
injections. Edit them to retarget the proctor to a different scenario or scoring
scheme; the agent reads them as the source of truth and defers to them if they
ever diverge from the copies embedded in its prompt.

> The score sorts; the debrief teaches. The proctor speeds up scoring — a human
> SME can always review or override, and low-confidence diagram reads are flagged
> for exactly that.
