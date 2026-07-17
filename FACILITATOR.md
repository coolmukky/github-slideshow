# Facilitator Run-Sheet — Zero Trust Agentic Design Sprint

A one-page guide to **running the digital activity**. (First-time setup is in [`SETUP.md`](./SETUP.md);
the in-session phase/time cues live on the participant page itself.)

**Pages:**

- Proctor console: `https://coolmukky.github.io/github-slideshow/proctor.html`
- Participant page: `https://coolmukky.github.io/github-slideshow/zero-trust-design-sprint.html`
- Leaderboard: `https://coolmukky.github.io/github-slideshow/leaderboard.html`

---

## Before the session — create the event (2 min)

- [ ] Open **`proctor.html`**; confirm status reads **"Live · Firebase"**.
- [ ] Fill in the **event name**, an optional **scheduled date/time**, and note the auto-generated **event code** (↻ to regenerate). Click **Create event**.
- [ ] Share the **event code** with participants, or click **QR** on the console to show a scannable **join QR** (opens the participant page with the code pre-filled) — great for phones. The **join link** is there too.
- [ ] **Reopening the console later?** Your events are remembered on that browser — open `proctor.html` and pick the event from the **"Resume an event you created"** list (or type its code in the **room** box and press **Switch**). Use **New event** on the control panel to create another without losing the current one.

## Opening for teams to join

- [ ] Participants who open the page early see a **"Waiting for the proctor…"** screen (or a countdown if you scheduled a time).
- [ ] When ready, press **Start event** on the proctor. Participants can now take their seat.
- [ ] Each participant enters the **event code**, then their **name, email, role**, and either:
  - **Creates a team** (first person): names it and gets a **team code** to share, or
  - **Joins a team**: enters the **team code** their first teammate shared.
- [ ] A team is **4 people, one per role** (IT Director, Digital Resiliency Officer, Network Architect, Network Security Engineer). **Each team's own 60-minute clock starts automatically once all 4 roles are filled.**
- [ ] Watch the console: **"N joined · T teams · K/T full (4 roles) · R running."** Team cards show each team's code and a live **⏱ time-left**.

## During the hour

- [ ] Each team runs on **its own clock**; boards, phases, and **injection reveals (24/38/50 min)** follow it, with automatic **5-min / 1-min** warnings. Participants' local Start/Pause is locked.
- [ ] *(Optional)* Ask teams to press **Focus** to hide reference sections — cuts on-page reading ~in half.
- [ ] Need to give a team a fresh 60? On its card press **Reset clock**. Press **Reset** (event) to close the event; **Start event** to reopen.

## After the clock (10 min)

- [ ] Teams fill the solution sheet, optionally **Attach diagram** (a photo of their topology), and click **Submit for scoring** (last submit wins). Participants get **5-min and 1-min** warnings automatically.
- [ ] **Late is allowed:** teams can still submit after 60:00 — the submission records **total time taken** and is flagged **LATE +overtime** (not auto-penalized; you decide how to weigh it).
- [ ] On **proctor**, each team card lists every **submitted use case** with an **Evaluate** button → open it to see the team's **pain→product mapping, products, diagram + time taken** alongside the **proctor-only cheat sheet**, and score **pain→product (40) + products how/why (30) + diagram & solution (30) = 100 per use case**. An **AI-evaluation** option (model picker + *Evaluate with AI*) can pre-fill the score with Claude once you enable it (see `AI-EVAL.md`); you still review and Save. Totals rank live on **`leaderboard.html`** (project it).
- [ ] On **proctor**, click **Report** → **Print / Save as PDF** for a per-team record (now includes scores), or **Export CSV** for raw data.
- [ ] Run the 10-minute debrief (reference design is in the participant page's Debrief section).

## Cleanup (privacy)

- [ ] The roster holds names + emails (**PII**). After the cohort, delete its records in the
      Firebase console: **Firestore → Data → `players`** (client deletes are disabled by design).
- [ ] Reuse the tool for the next cohort with a **new room code**.

---

### Quick troubleshooting

| Symptom | Fix |
|---|---|
| Proctor says "Single-device (local)" | Firebase not reachable/configured — see `SETUP.md` §2. |
| "Live" but no one shows | Firestore rules not published, or wrong room code on one of the links. |
| Someone joined the wrong team | They can reopen **Take your seat** (persona chip in the bar) and re-enter the team name. |
| Timer lost after refresh | It auto-restores from the browser; if truly stuck, press **Reset** to restart the clock. |
