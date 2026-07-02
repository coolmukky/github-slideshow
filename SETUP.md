# Setup & Verification — Zero Trust Agentic Design Sprint

Everything you need to run the interactive activity, enable the live cross-device
roster, and confirm it works. The activity **works without Firebase** (single-device
mode); Firebase only adds the shared, cross-device proctor roster.

- **Participant page:** `zero-trust-design-sprint.html`
- **Proctor roster & evaluation:** `proctor.html`
- **Leaderboard:** `leaderboard.html`
- **Config file:** `firebase-config.js`

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

### 2d. (Optional) Restrict the API key — defense-in-depth  ⬜
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

## 4. Running a session

- **Multiple rooms/cohorts:** add `?room=CODE` to *both* page URLs to scope a roster to one
  session, e.g. `…/proctor.html?room=june-cohort` and `…/zero-trust-design-sprint.html?room=june-cohort`.
- **Two-phase start:** on `proctor.html`, press **Open for login** — participants (who until then
  see a "Waiting for the proctor…" screen) can now take their seats and sit in a **lobby** at
  00:00. The proctor shows a readiness readout ("N logged in · T teams · K/T complete"). When
  everyone's in, press **Start clock** to begin the **single 60-minute clock for all teams at
  once**. **Pause/Resume** holds the room; **Reset** returns everyone to the lobby. *(If no proctor
  opens an event, a participant page falls back to a local self-run timer.)*
- **Reports:** on `proctor.html`, use **Export CSV** for raw data or **Report** for a printable
  (PDF-ready) participant summary with per-team completeness. Scales to ~300 participants.
- **Scoring & leaderboard:** teams click **Submit for scoring** on the participant page (after
  taking a seat with a team). On `proctor.html`, each submitted team shows an **Evaluate** button —
  open it to read their solution and score 3 injections (10 each) + final solution (70) = 100.
  Scores rank teams live on **`leaderboard.html`** (project it on the shared screen). Evaluation is
  manual by the proctor. *(AI-agent evaluation is not enabled in this version.)*

## 5. Privacy / after the session

The roster stores participant **names and emails (PII)**. When a cohort is done, delete its
records in the Firestore console (**Firestore → Data →** `players` collection). Client-side
deletes are disabled by the rules, so removal is done from the console.
