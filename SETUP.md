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

- **Create an event:** on `proctor.html`, enter an **event name**, an optional **scheduled start**,
  and note the generated **event code**; click **Create event**. Share the code (or the join link
  the console shows). The event code scopes everything (roster, teams, scores) — it's the `?room=`
  value in the URLs.
- **Resume an event:** events you create are remembered on that browser. Reopen `proctor.html` and
  pick it from the **"Resume an event you created"** list, or type its code in the **room** box and
  press **Switch**. **New event** (on the control panel) starts another without discarding the current
  one. The event itself lives in Firestore, so it survives refreshes and is shared across devices.
- **Start / join:** press **Start event** to open joining. Participants enter the **event code**,
  then their details and role, and either **create a team** (get a **team code** to share) or
  **join a team** (enter that team code). A team is **4 fixed roles** (IT Director, Digital Resiliency Officer, Network Architect,
  Network Security Engineer); its own **60-minute clock starts automatically once all 4 roles are filled**.
- **Proctor controls:** the console shows each team's live **time-left**; **Reset clock** on a team
  card gives that team a fresh 60:00; **Reset** (event) closes it and **Start event** reopens.
- **Reports:** on `proctor.html`, use **Export CSV** for raw data or **Report** for a printable
  (PDF-ready) participant summary with per-team completeness. Scales to ~300 participants.
- **The activity — five use cases:** each team works a customer environment with **5 sequential use
  cases** (Use Case 1 = *Managed Environment; Segmentation*; 2–5 are placeholders for now). For each
  use case they fill a **pain-point → product mapping**, a **products (how / why)** table, attach a
  **diagram**, and **Submit group response for Use Case N**. Submitting unlocks the next use case;
  teams complete as many as they can before the clock ends.
- **Scoring & leaderboard:** on `proctor.html`, each team card lists every submitted use case with an
  **Evaluate** button. Open it to see the team's response **and the proctor-only cheat sheet** for
  that use case, then score three criteria — pain→product mapping (40) + products how/why (30) +
  diagram & overall solution (30) = **100 per use case**. An **AI-evaluation** control (model picker +
  *Evaluate with AI*) is present as a preview; live model scoring is a follow-up (manual scoring is
  fully working). **`leaderboard.html`** ranks teams by **total points across use cases** and shows how
  many each solved (project it on the shared screen).

## 5. Privacy / after the session

The roster stores participant **names and emails (PII)**. When a cohort is done, delete its
records in the Firestore console (**Firestore → Data →** `players` collection). Client-side
deletes are disabled by the rules, so removal is done from the console.
