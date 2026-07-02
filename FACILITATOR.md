# Facilitator Run-Sheet — Zero Trust Agentic Design Sprint

A one-page guide to **running the digital activity**. (First-time setup is in [`SETUP.md`](./SETUP.md);
the in-session phase/time cues live on the participant page itself.)

**Links** — replace `ROOM` with a code for this cohort (e.g. `june-am`):

- Participant: `https://coolmukky.github.io/github-slideshow/zero-trust-design-sprint.html?room=ROOM`
- Proctor:     `https://coolmukky.github.io/github-slideshow/proctor.html?room=ROOM`

> Tip: generate a QR code for the participant link so people can join from their phones.

---

## Before the session (5 min)

- [ ] Pages published and Firebase live (see `SETUP.md`; proctor should read **"Live · Firebase"**).
- [ ] Pick a **room code** and build both links above with `?room=ROOM`.
- [ ] Open the **proctor** link on your screen; confirm status is **"Live · Firebase"**.
- [ ] Share the **participant** link / QR with the room.
- [ ] Decide team names in advance (or let each table choose one) so people group correctly.

## As people arrive (5 min)

- [ ] Participants who open the link **before you open the event** see a **"Waiting for the proctor…"** screen — that's expected.
- [ ] When ready, on **`proctor.html`** press **Open event**. Everyone's waiting screen clears and they're prompted to take their seat.
- [ ] Each person clicks **Take your seat**: name, email, **team name**, role. **The team's own 60-minute clock starts the moment the first teammate registers** — so a team begins when *they* are ready; teammates who join after start on the same running clock.
- [ ] Watch teams appear on your **proctor** screen, grouped by team, each showing a live **⏱ time-left** clock. Use the **summary** to spot gaps (each team should show **4/4 roles**).

## Running the hour (per-team 60 min)

- [ ] *(Optional)* Ask teams to press **Focus** in their control bar to hide reference sections — cuts on-page reading ~in half. Toggle **Show all** anytime.
- [ ] Each team's board, phases, and **injection reveals (24/38/50 min)** run off **their own** clock — teams that started later reach each phase later. The proctor roster shows every team's remaining time.
- [ ] The in-game **Conductor** on each team keeps their table on pace; you float between tables.
- [ ] Participants' local Start/Pause is **locked** while the event is open — the clock is automatic per team.
- [ ] Press **Close event** when you want to stop new teams from starting (teams already running keep their clocks). Keep the **proctor** tab open to watch the roster and clocks throughout.

## After the clock (10 min)

- [ ] Teams fill the solution sheet and click **Submit for scoring** (each team submits once; the last submit wins).
- [ ] On **proctor**, each submitted team shows an **Evaluate** button → open it to read their solution and score **3 injections (10 each) + final solution (70) = 100**. Scores appear live on **`leaderboard.html`** (project it).
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
