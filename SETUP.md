# Setup & Verification — Zero Trust Agentic Design Sprint

Everything you need to run the interactive activity, enable the live cross-device
roster, and confirm it works. The activity **works without Firebase** (single-device
mode); Firebase only adds the shared, cross-device proctor roster.

- **Participant page:** `zero-trust-design-sprint.html`
- **Briefing (guided flow):** `briefing.html` — a **6-step** flow (customer → environment & architecture → objectives → roles & how to play → methodology → what "good" looks like) shown one step at a time with numbered progress and Prev/Next. Linked from the participant page (each card deep-links to a step via `?step=N`) so the main page stays focused on the work.
- **Proctor roster & evaluation:** `proctor.html`
- **Leaderboard:** `leaderboard.html`
- **Config file:** `firebase-config.js`
- **Offline / printable materials:** `offline/` — self-contained HTML you can open with no internet and **Print / Save as PDF** to run the clinic on paper. Start at [`offline/index.html`](./offline/index.html):
  - **ZTA Activity Guide** (`offline/activity-guide.html`) — customer, environment, reference architecture, objectives, roles, how-to-play, methodology, and each use-case brief. *Give to teams.*
  - **ZTA Workbook** (`offline/workbook.html`) — team answer sheet: pain→product mapping, products (how/why) and a diagram space per use case (100 pts each). *Give to teams.*
  - **ZTA Proctor Guide** (`offline/proctor-guide.html`) — reference answers (cheat sheet) **+** scoring rubric **+** score sheet for each use case, integrated. **Proctor only — do not show participants.**
  - **Proctor Evaluation Cheat Sheet** (`offline/proctor-cheatsheet.html`) — a quick at-the-table scoring aid: tick-box "award marks" anchors per criterion, must-see Cisco building blocks, red flags, and a score bar for each use case. **Proctor only.**
  - PDFs for all of the above are in `offline/pdf/`.
  - All five use cases are populated (1–3 required, 4–5 bonus).

---

## 1. Publish the pages (GitHub Pages)

1. Repo **Settings → Pages**.
2. **Source:** "Deploy from a branch" → **Branch:** `master` → folder `/ (root)` → **Save**.
3. After ~1 minute the pages are live at:
   - Participant: `https://coolmukky.github.io/github-slideshow/zero-trust-design-sprint.html`
   - Proctor: `https://coolmukky.github.io/github-slideshow/proctor.html`

> Instant preview without Pages:
> `https://htmlpreview.github.io/?https://github.com/coolmukky/github-slideshow/blob/master/zero-trust-design-sprint.html`

---

## 2. Firebase — live cross-device roster (optional but recommended)

Skip this and everything still works in **single-device mode** (the proctor only sees
people who joined on the proctor's own browser). Do this to see all participants across
all their devices.

### 2a. Create the project & web app  ✅ *(done)*
- Firebase Console → **Add project** → add a **Web app (`</>`)** → copy the `firebaseConfig`.
- Those values are already in [`firebase-config.js`](./firebase-config.js) for project `design-clinic-58ad0`.
- Firebase web config values are **public by design** — security comes from the Firestore rules below, not from hiding them.

### 2b. Create the Firestore database  ⬜ *(required)*
- Console → **Build → Firestore Database → Create database**.
- Mode: **Production**. Location: **`nam5` (United States)** — best for a mostly-US, global audience.

### 2c. Publish the security rules  ⬜ *(required)*
Firestore → **Rules** tab → paste and **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{id} {
      allow read: if true;
      allow create, update: if
        request.resource.data.name is string &&
        request.resource.data.name.size() < 120 &&
        request.resource.data.email.size() < 200 &&
        request.resource.data.teamName.size() < 120;
      allow delete: if false;
    }
    match /solutions/{id} {
      allow read: if true;
      allow create, update: if
        request.resource.data.teamName is string &&
        request.resource.data.teamName.size() < 120;
      allow delete: if false;
    }
    match /scores/{id} {
      allow read: if true;
      allow create, update: if
        request.resource.data.teamName is string &&
        request.resource.data.total is number;
      allow delete: if false;
    }
    match /control/{id} {
      allow read: if true;
      allow create, update: if request.resource.data.room is string;
      allow delete: if false;
    }
  }
}
```

Covers four collections: `players` (roster), `solutions` (submitted design sheets), `scores`
(proctor evaluations), and `control` (the proctor's start/pause/reset of the shared clock).
Allows registering/submitting/scoring/controlling and reading; blocks client-side deletes.
**Do not leave Firestore in open "test mode"** — that exposes participant emails. **Whenever you
add features you must re-publish this full block** — if an older version is live, submissions,
scores, or the shared "Start event" clock will be rejected.

### 2d. (Recommended for scale) Enable Storage for diagram photos  ⬜
Diagrams are uploaded to **Firebase Storage** and only their short download URL is stored in
Firestore — this keeps large images out of the database (important at ~300 participants). If
Storage isn't enabled, the app **falls back** to embedding the image inline (still works, just
heavier), so this step is optional but recommended.

- Console → **Build → Storage → Get started** (accept the default bucket, same location as Firestore).
- Storage → **Rules** tab → paste and **Publish**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /diagrams/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 6 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Allows uploading/reading diagram images (capped at 6 MB, images only) under `diagrams/…`;
everything else stays locked. The `storageBucket` value is already in `firebase-config.js`.

### 2e. (Optional) Restrict the API key — defense-in-depth  ⬜
Google Cloud Console → **APIs & Services → Credentials** → project `design-clinic-58ad0` →
open **"Browser key (auto created by Firebase)"**:

- **Application restrictions → HTTP referrers**, add:
  - `https://coolmukky.github.io/*`
  - `http://localhost:*/*` (optional, local testing)
- **API restrictions → Restrict key**, select: **Cloud Firestore API**, **Firebase Installations API**, **Identity Toolkit API**.
- **Save.** Allow ~5 minutes to propagate. If the roster breaks afterward, set API restrictions back to "Don't restrict key" (keep the referrer restriction) and re-check the referrer matches your URL exactly.

---

## 3. Verify it's live

1. Open the **participant page** and **Take your seat** (name, email, team, role).
2. On a **different device/browser**, open **`proctor.html`**.
3. Top-left status should read **"Live · Firebase"** (green dot) — not "Single-device (local)".
4. Your entry appears under its team; a second person on another device appears too.

Troubleshooting:
- Status is "Live" but nothing shows → check **2c rules** and that **2b** database exists.
- Status stuck on "Single-device (local)" → the SDK couldn't load; check the browser console and that `firebase-config.js` has real values (no `PASTE…`).

---

## 3b. Proctor passcode (facilitator access)

`proctor.html` is gated by a **passcode** so people with the URL can't wander in and start/reset
events. The default passcode is **`clinic2026`** — **change it.** Only the SHA-256 *hash* is stored
(in `firebase-config.js` as `PROCTOR_PASSCODE_SHA256`), never the passcode itself. Once entered, the
console stays unlocked on that device for the browser session; press **Lock** (top bar) to re-lock.

To change the passcode: in your browser console run
`crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR-PASSCODE')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))`,
paste the printed hash into `PROCTOR_PASSCODE_SHA256`, commit, and push. (Set it to an empty string to
disable the gate.) This is a **client-side deterrent**, not hardened auth — good enough to keep the
wrong people out of a facilitated clinic; for real security, use Firebase sign-in.

## 4. Running a session

- **Create an event:** on `proctor.html`, enter an **event name**, an optional **scheduled start**,
  and note the generated **event code**; click **Create event**. Share the code (or the join link
  the console shows). The event code scopes everything (roster, teams, scores) — it's the `?room=`
  value in the URLs.
- **Resume an event:** reopening `proctor.html` (refresh, new tab, bookmark) **automatically reopens
  your most recent event** on that browser — you never lose it. Press **New event** to start another;
  pick an older one from the **"Resume an event you created"** list on the create screen, or type its
  code in the **room** box and press **Switch**. The event lives in Firestore, so it survives refreshes
  and is reachable from any device by its code.
- **Start / join:** press **Start event** to open joining. Participants enter the **event code**,
  then their details and role, and either **create a team** (get a **team code** to share) or
  **join a team** (enter that team code). A team is **4 fixed roles** (IT Director, Digital Resiliency Officer, Network Architect,
  Network Security Engineer); its own **60-minute clock starts automatically once all 4 roles are filled**.
- **Proctor controls:** the console shows each team's live **time-left**; **Reset clock** on a team
  card gives that team a fresh 60:00; **Reset** (event) closes it and **Start event** reopens.
- **Reports:** on `proctor.html`, use **Export CSV** for raw data or **Report** for a printable
  (PDF-ready) participant summary with per-team completeness. Scales to ~300 participants.
- **The activity — five use cases (3 required + 2 bonus):** each team works a customer environment
  with **5 sequential use cases** — **Use Cases 1–3 are required, 4 & 5 are bonus** (tiles are tagged
  *Required* / *Bonus*). The five: 1 *Managed Environment — Segmentation*, 2 *Remote Workers — Zero Trust Access*, 3 *AI Access and Agent Controls* (required), 4 *Merger & Acquisition — Extend Segmentation*, 5 *Zero Trust across Multicloud Data Center* (bonus).
  For each use case they fill a **pain-point → product mapping**, a **products (how / why)** table,
  attach a **diagram**, and **Submit group response for Use Case N**. Submitting unlocks the next use
  case; teams clear the required cases, then bank the bonus rounds before the clock ends.
- **Scoring & leaderboard:** on `proctor.html`, each team card lists every submitted use case with an
  **Evaluate** button. Open it to see the team's response **and the proctor-only cheat sheet** for
  that use case, then score three criteria — pain→product mapping (40) + products how/why (30) +
  diagram & overall solution (30) = **100 per use case**. An **AI-evaluation** option (model picker +
  *Evaluate with AI*) can pre-fill the score with **Claude** via a serverless proxy — see
  [`AI-EVAL.md`](./AI-EVAL.md) to enable it; until it's configured it stays in preview and manual
  scoring is fully working. **`leaderboard.html`** ranks teams by **total points across use cases** and
  shows how many each solved (project it on the shared screen).

## 5. Privacy / after the session

The roster stores participant **names and emails (PII)**. When a cohort is done, delete its
records in the Firestore console (**Firestore → Data →** `players` collection). Client-side
deletes are disabled by the rules, so removal is done from the console.
