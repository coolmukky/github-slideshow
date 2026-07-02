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

## Logging everyone in (5 min)

- [ ] Participants who open the link **before you open registration** see a **"Waiting for the proctor…"** screen — that's expected.
- [ ] On **`proctor.html`** press **Open for login**. Everyone's waiting screen clears and they're prompted to take their seat.
- [ ] Each person clicks **Take your seat**: name, email, **team name**, role — then they sit in a **lobby** (clock at 00:00) until you start it.
- [ ] Watch the proctor **Event control** readout fill in: **"N logged in · T teams · K/T complete (4 roles)."** Nudge teams to fill missing roles.

## Starting the clock

- [ ] When everyone's in, press **Start clock** on the proctor. This starts the **single 60-minute clock for all teams at once**; every participant's board begins Phase 0 together.
- [ ] *(Optional)* Ask teams to press **Focus** to hide reference sections — cuts on-page reading ~in half.
- [ ] Boards, phases, and **injection reveals (24/38/50 min)** run off the shared clock; participants get **5-min and 1-min** warnings automatically. Participants' local Start/Pause is **locked**.
- [ ] Use **Pause / Resume** on the proctor to hold the whole room; **Reset** sends everyone back to the lobby at 00:00. Keep the proctor tab open to watch the roster throughout.

## After the clock (10 min)

- [ ] Teams fill the solution sheet, optionally **Attach diagram** (a photo of their topology), and click **Submit for scoring** (last submit wins). Participants get **5-min and 1-min** warnings automatically.
- [ ] **Late is allowed:** teams can still submit after 60:00 — the submission records **total time taken** and is flagged **LATE +overtime** (not auto-penalized; you decide how to weigh it).
- [ ] On **proctor**, each submitted team shows an **Evaluate** button → open it to see their **diagram + solution + time taken** and score **3 injections (10 each) + final solution (70) = 100**. Scores appear live on **`leaderboard.html`** (project it).
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
