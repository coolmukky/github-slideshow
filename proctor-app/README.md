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
├── index.html          ← participant page: submit + view your result
├── proctor.html        ← proctor console: reference material, scoring, records
├── app.js              ← shared logic (store, file handling, Claude call, rendering)
├── store.js            ← data adapter: Firestore, or localStorage fallback
├── firebase-config.js  ← OPTIONAL cross-device sync config (unset = local mode)
├── styles.css          ← styles
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

## Quick demo (single machine)

```
cd proctor-app
./run.sh            # serves on http://localhost:8000  (run.sh [port] to change)
```

Open **both** URLs it prints in the **same browser**:
`…/proctor.html` (paste your Claude API key + reference material, then Score) and
`…/index.html` (submit a team, then check its result). Same origin = they share
data. That's the whole loop — no Firebase, no accounts.

## Run it

**Locally:** run `./run.sh` (above), or serve the folder yourself
(`python3 -m http.server` from inside `proctor-app/`). Serving over `http://`
rather than opening `file://` avoids browser CORS issues with the API call.

**GitHub Pages:** commit this folder and enable Pages for the repo. The pages are
served at `…/proctor-app/index.html` and `…/proctor-app/proctor.html`.

## Getting a Claude API key

The proctor needs an Anthropic API key (from the Anthropic Console). It's entered
once on the proctor page and stored in that browser's `localStorage` — it is
**never** committed to the repo or sent anywhere except Anthropic's API. Pick the
model on the same page: **Opus 4.8** (best judgment), **Sonnet 5** (faster/cheaper),
or **Haiku 4.5** (cheapest). Rough cost is a few cents per team.

## Cross-device sync (optional Firebase)

Out of the box the app runs in **single-device mode** — data lives in the
browser's `localStorage`, so the proctor and participants share data only on the
**same browser/computer** (ideal for a kiosk or for building/testing).

To let participants submit from **their own phones/laptops** while the proctor
sees everyone live, fill in **`firebase-config.js`** (a free Firebase/Firestore
project — step-by-step setup and the security rules are in that file). Nothing
else changes: `store.js` uses Firestore when configured and falls back to
localStorage otherwise. A small badge in the header shows which mode is active
(**Live · Firebase** or **Single-device**).

- **Rooms:** add `?room=CODE` to both page URLs to scope a session, so separate
  clinics don't mix (default room is `default`). Share
  `…/proctor-app/index.html?room=CODE` with participants.
- **Live updates:** in Firebase mode, new submissions appear on the proctor
  console automatically, and a team's **result page updates itself** the moment
  the proctor scores it.

### Limits

- **Documents:** PDF is read natively by Claude; `.txt`/`.md` are read as text.
  For `.docx`, export to PDF first.
- **Images** are downscaled to ~1400px (JPEG) before storing, to keep storage
  small and token costs low.
- **Firestore doc size** is ~1 MB per submission; diagrams are downscaled to fit,
  but a very large image-heavy PDF is rejected with a clear message — use a
  smaller PDF or paste the solution as text.
- **Clearing data:** local mode → clear the browser's storage; Firebase mode →
  the rules block client deletes, so remove data from the Firebase console.

## Customising the rubric

Edit the **Rubric** box on the proctor page (or the `DEFAULT_RUBRIC` in
`app.js`). The three use-case dimensions the participant feedback is organised
around — pain points, right solution, uplevel opportunities — come from the
evaluation schema in `app.js`; keep those keys if you want the same participant
view.
