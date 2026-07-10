# CLAUDE.md — Network Design Proctor

This is a **standalone Claude Code project**. Its single purpose is to evaluate
network-design topology diagrams and solution sheets against a Zero Trust rubric.

## How to work here

- The deliverable is the **`network-design-proctor`** subagent
  (`.claude/agents/network-design-proctor.md`). To grade a submission, invoke
  that agent with a diagram image path and a solution sheet.
- The **source of truth** for scoring is the `reference/` directory
  (`scenario.md`, `reference-design.md`, `injections.md`, `rubric.md`). If you
  change how submissions should be graded, edit those files — the agent reads
  them and defers to them over the copies embedded in its own prompt.
- Put team artifacts under `submissions/`.

## Independence

This project is intentionally **decoupled** from any design-clinic / presentation
files. Do not add dependencies on files outside `proctor-agent/`. Everything the
proctor needs to grade a submission lives inside this folder.
