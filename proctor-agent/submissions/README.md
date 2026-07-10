# Submissions

Drop each team's artifacts here, one folder per team, then point the
`network-design-proctor` agent at them.

Suggested layout:

```
submissions/
└── team-atlas/
    ├── topology.png     ← photo / screenshot / SVG export of the diagram
    └── solution.md      ← the one-page solution sheet (text or image)
```

Then, from the project root:

```
Use the network-design-proctor agent to evaluate this submission.
Diagram: ./submissions/team-atlas/topology.png
Solution sheet: ./submissions/team-atlas/solution.md
Team: Team Atlas
```

Artifacts placed here are inputs only — nothing in this folder affects scoring.
The rubric lives in `../reference/`.
