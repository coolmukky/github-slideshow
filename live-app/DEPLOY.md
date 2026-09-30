# ZTA Design Clinic — Live Workshop App (Firebase)

A real-time, multi-device app for running the Zero Trust Design Clinic:

- **Proctor** creates an event → gets a 5-character **join code**.
- **Participants** open the link on any device, enter the code, type a **nickname**, and join or create a **team**. No account or login (anonymous).
- **Proctor** **starts** the workshop (a shared 60-minute clock) and **closes** it. Participants get the live **Runner** (timer, phases, use cases) while it's running.
- **Leaderboard** shows every team, its members, scores, and the cumulative **Associate / Professional / Expert** level — live on all devices.
- **Proctor** evaluates each team's submission and records scores (Mapping 40 / Products 30 / Diagram 30); the level is computed automatically.

It's a static frontend backed by **Firebase** (Anonymous Auth + Firestore realtime + Hosting). Nothing to run on a server; Firebase hosts it.

---

## What you need
- A Google account.
- [Node.js](https://nodejs.org) (for the Firebase CLI).
- ~15 minutes. The Firebase **Spark (free) plan** is enough for a workshop.

## 1. Create the Firebase project
1. Go to <https://console.firebase.google.com> → **Add project** (any name, e.g. `zta-clinic`). Analytics optional.
2. **Build → Authentication → Get started → Sign-in method →** enable **Anonymous**.
3. **Build → Firestore Database → Create database →** Production mode → pick a location.
4. Project **Overview (⚙ → Project settings)** → scroll to **Your apps** → **</> (Web)** → register an app (nickname `zta-web`; Hosting can be set up here or via CLI). Copy the shown **firebaseConfig** values.

## 2. Configure the app
Edit **`public/config.js`** and paste your values:
```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza…",
  authDomain: "zta-clinic.firebaseapp.com",
  projectId: "zta-clinic",
  storageBucket: "zta-clinic.appspot.com",
  messagingSenderId: "…",
  appId: "1:…:web:…"
};
```
(These are **not** secrets — Firebase web config is meant to ship in the client. Access is controlled by the Firestore rules in `firestore.rules`.)

## 3. Point the CLI at your project
```bash
npm install -g firebase-tools
firebase login
cd live-app
cp .firebaserc.example .firebaserc      # then edit it:
#   "default": "YOUR_FIREBASE_PROJECT_ID"
```

## 4. Deploy
```bash
firebase deploy --only firestore:rules,hosting
```
The CLI prints your live URL, e.g. **`https://zta-clinic.web.app`**. That's the app.

## Run a workshop
1. Open the URL, **Create event**, set a title and a **proctor PIN** (lets you reclaim proctor controls on any device). You'll land on the **Proctor console** with a big join code.
2. **Copy join link** and share it (or just read out the code). Participants open it, enter the code, pick a name and team.
3. Watch teams appear under **Teams & roster**. Press **Start workshop** — the 60-minute clock starts on every device and participants get the Runner.
4. As teams present, go to **Evaluate & score**, pick a team, enter Mapping/Products/Diagram per use case → **Save score**. The **Leaderboard** updates live for everyone.
5. Press **Close workshop** when done. Participants see their final level; the leaderboard is the record.

To be a proctor on a **second device**: open the event link, then use the proctor PIN (the app adds you as a proctor after the PIN matches).

---

## Security posture (read this)
Everyone signs in **anonymously**, so there is no verified identity. Proctor status is a **soft, PIN-gated** claim checked in the browser (`firestore.rules` lets a signed-in user add *only themselves* to the event's `proctorUids` after the client confirms the PIN). Score and status writes are then restricted to `proctorUids`. This is right for a friendly internal workshop, **not** an adversarial setting.

**To harden** (optional): move proctor verification into a **Cloud Function** that checks the PIN server-side and sets a custom claim / writes `proctorUids`, then tighten the `update` rule to remove the self-add path. Add **App Check** to block non-app clients. (Cloud Functions require the Blaze plan.)

## Cost & limits
- Spark (free) plan covers a typical workshop (Firestore free quota is generous for a few dozen devices and live listeners).
- Each participant device holds a handful of realtime listeners; a single event with tens of teams is well within free limits.

## Data model (Firestore)
```
events/{CODE}                      title, status(lobby|running|closed), pinHash,
                                   proctorUids[], startedAt, endsAtMillis
events/{CODE}/teams/{teamId}       name, progress{uc:bool}, answers{uc:text}, submission{link,note}
events/{CODE}/members/{uid}        name, teamId            (each writes only their own)
events/{CODE}/scores/{teamId}      uc{n:{m,p,d,total}}, core, full, level, all5
                                   (proctor-only write; everyone reads → leaderboard)
```

## Local preview (optional)
```bash
cd live-app
firebase emulators:start        # or: npx serve public
```
Anonymous auth + Firestore work against the emulators, or against your real project once `config.js` is filled in.
