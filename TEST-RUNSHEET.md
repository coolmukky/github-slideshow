# Test run-sheet — Segmentation Design Clinic

A single page to test the whole system end-to-end. **Pre-flight checks are already
green** (verified from the build + database); you can jump straight to the walkthrough.

## Pages
- **Participant:** https://coolmukky.github.io/github-slideshow/zero-trust-design-sprint.html
- **Proctor:** https://coolmukky.github.io/github-slideshow/proctor.html
- **Leaderboard:** https://coolmukky.github.io/github-slideshow/leaderboard.html

## Pre-flight — already verified ✅
- **GitHub Pages** — latest `master` deployed successfully (all features live).
- **Firestore** — `control`, `players`, `solutions`, `scores` all readable/writable (rules published).
- **Pages load clean** — participant (5 use-case cards), proctor (Test AI + setup), leaderboard — no JS errors.
- **AI evaluation** — code complete; **needs the proxy deployed** to go live (optional — see the bottom). Manual scoring works without it.

> Before you start: **hard-refresh** each page once (Cmd/Ctrl-Shift-R) so you're on the newest build.
> Use a **fresh event code** so old test data from other rooms doesn't show.

---

## Walkthrough (10 min, 2 devices)

Use two browsers/devices: one **Proctor**, one **Participant**. (You can add more participant
tabs to fill a team of 4 and see the clock auto-start.)

### 1 · Proctor — create & open the event
- [ ] Open **proctor.html**. Top-left pill reads **"Live · Firebase"** (green).
- [ ] Enter an **event name** + **code** (e.g. `TEST1`) → **Create event**.
- [ ] Click **Start event** (status flips **CLOSED → OPEN**).
- [ ] Click **QR** to get the join link/QR (it carries `?room=TEST1`).
- [ ] *(Sanity)* Reload proctor.html with no `?room` → your event appears under **"Resume an event you created."**

### 2 · Participant — join & take a seat
- [ ] On the 2nd device, open the **join link / scan the QR** (or enter the code on the plain page).
- [ ] You briefly see "Connecting…" then land on **"Take your seat"** (because the event is open).
- [ ] Enter **name + email**, pick a **role**, **Create a team** → note the **team code**.
- [ ] *(Optional, to see the clock start)* open 3 more participant tabs → **Join a team** with that code, one per remaining role → on the **4th role** the team's **60:00 clock auto-starts**.

### 3 · Participant — solve Use Case 1
- [ ] The **Use Cases** hub shows UC 1 open and **UC 2–5 "Coming soon"** (locked — expected).
- [ ] In the **Workspace**: fill the **pain-point → product mapping**, the **products (how / why)** table, and **Attach diagram** (any image).
- [ ] Click **Submit group response for Use Case 1** → UC 1 marks **Submitted ✓**.

### 4 · Proctor — evaluate
- [ ] The team card lists **UC 1** with an **Evaluate** button. Click it.
- [ ] You see the team's **mapping + products + diagram + time taken**, and the **cheat sheet** (answer key) for UC 1.
- [ ] Score the three criteria (40 + 30 + 30) and **Save score**. *(Or click **Evaluate with AI** if the proxy is set up — see below.)*

### 5 · Leaderboard
- [ ] Open **leaderboard.html** (or the proctor's **Leaderboard** button).
- [ ] The team appears with its **total points** and **1 / 5 use cases solved**.

### 6 · Proctor — reports (optional)
- [ ] **Report** → Print / Save as PDF (per-team record incl. scores).
- [ ] **Export CSV** for the raw roster.

---

## What "good" looks like
- Participant moves off the waiting screen the instant you press **Start event**.
- Everyone lands under the **same team** (all used the coded join link / same code).
- Submitting UC 1 shows it on the proctor and the leaderboard within a second or two.
- No red banner on the proctor. *(A red banner = Firestore rules issue — re-publish the `control` block, `SETUP.md` §2c.)*

## Common gotchas
| Symptom | Fix |
|---|---|
| Participant stuck on **"No event found"** | They used the plain link, not the coded join link — reshare the QR/link or the exact code. |
| Participant stuck on **"Waiting…"** after Start | Confirm the pill says "Live · Firebase" and no red banner appeared. |
| Roster looks split across teams | Everyone must use the **same event code** (the proctor's join link). |
| Pill says **"Single-device (local)"** | Firebase didn't load — hard-refresh; check `firebase-config.js`. |

---

## Optional — turn on Live AI evaluation
Manual scoring already works; do this only if you want the **Evaluate with AI** button live.
1. Deploy the proxy: `wrangler deploy` on [`ai-eval-worker.js`](./ai-eval-worker.js); set the
   `ANTHROPIC_API_KEY` secret and `ALLOW_ORIGIN=https://coolmukky.github.io` (full steps in
   [`AI-EVAL.md`](./AI-EVAL.md)).
2. Put the proxy URL in `window.AI_EVAL_ENDPOINT` in [`firebase-config.js`](./firebase-config.js); commit + hard-refresh.
3. On the proctor, click **Test AI** → expect **"AI endpoint OK · <model> · <ms>ms"**.
4. In an Evaluate modal, click **Evaluate with AI** → it pre-fills the score + rationale for you to review and Save.
