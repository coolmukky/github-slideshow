# Design Proctor — simple web app

A tiny, **static** web app (no backend, no build step) that lets teams submit a
**topology diagram + solution document**, and lets a **proctor** score each
submission with Claude against a reference brief, reference diagram, and rubric.
Every team gets a **score, a proficiency level, and per-use-case feedback**:

1. **Identifying pain points** — what they found vs. missed
2. **Finding the right solution** — how well it meets the expected solution
3. **Uplevel opportunities** — what they identified, and what they could still pursue

Plus a diagram score, a document score, an overall score/100, and strengths/gaps.

## Files

```
proctor-app/
├── index.html     ← participant page: submit + view your result
├── proctor.html   ← proctor console: reference material, scoring, records
├── app.js         ← shared logic (storage, file handling, Claude call, rendering)
├── styles.css     ← styles
└── README.md
```

## How it works

- **Participants** open `index.html`, enter their team name, attach a diagram
  (image) and a solution document (**PDF**, `.txt`, or `.md`), and submit. The
  submission is saved and marked **pending**.
- **The proctor** opens `proctor.html`, enters a **Claude API key** (stored only
  in their browser), uploads the **reference diagram / brief / rubric**, then
  clicks **Score** (or **Score all pending**). Claude evaluates each team and the
  score + feedback is saved back.
- Participants return to `index.html`, enter their team name under **Your
  result**, and see their score and explanation.

This keeps the API key on the **proctor's** machine only — participants never
need one. (A sensible default rubric is built in; the proctor can edit it.)

## Run it

**Locally:** just open `index.html` / `proctor.html` in a browser, or serve the
folder (`python3 -m http.server` from inside `proctor-app/`).

**GitHub Pages:** commit this folder and enable Pages for the repo. The pages are
served at `…/proctor-app/index.html` and `…/proctor-app/proctor.html`.

## Getting a Claude API key

The proctor needs an Anthropic API key (from the Anthropic Console). It's entered
once on the proctor page and stored in that browser's `localStorage` — it is
**never** committed to the repo or sent anywhere except Anthropic's API. Pick the
model on the same page: **Opus 4.8** (best judgment), **Sonnet 5** (faster/cheaper),
or **Haiku 4.5** (cheapest). Rough cost is a few cents per team.

## Scope & limits (this "simple for now" version)

- **Single machine.** Data lives in the browser's `localStorage`, so the proctor
  and participants share data only on the **same browser/computer** — ideal for a
  kiosk or for building/testing. For a real multi-device event (participants on
  their own phones/laptops), add a shared backend (e.g. Firebase Firestore) so
  submissions sync across devices. The storage layer in `app.js` is isolated to
  make that swap straightforward.
- **Documents:** PDF is read natively by Claude; `.txt`/`.md` are read as text.
  For `.docx`, export to PDF first.
- **Images** are downscaled to ~1400px before storing, to keep `localStorage`
  small and token costs low.

## Customising the rubric

Edit the **Rubric** box on the proctor page (or the `DEFAULT_RUBRIC` in
`app.js`). The three use-case dimensions the participant feedback is organised
around — pain points, right solution, uplevel opportunities — come from the
evaluation schema in `app.js`; keep those keys if you want the same participant
view.
