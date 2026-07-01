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

- [ ] Each person opens the participant link and clicks **Take your seat**: name, email, **team name**, role.
- [ ] Watch them appear on your **proctor** screen, grouped by team.
- [ ] Use the proctor **summary** to spot gaps: each team should show **4/4 roles** (no amber "Missing:" flags).
- [ ] Nudge under/over-filled teams to rebalance before the clock starts.

## Running the hour (60 min)

- [ ] On the participant page's **control bar**, press **Start** — the 60-minute clock drives everything.
- [ ] The board and phase cards auto-highlight the current phase; **injections auto-reveal** at 24/38/50 min with a chime + toast.
- [ ] The in-game **Conductor** on each team keeps their table on pace; you float between tables.
- [ ] `Jump` advances a phase if needed; `Reset` restarts the clock (re-seals injections). Chimes toggle with the speaker button.
- [ ] Keep the **proctor** tab open on the side to see the live roster throughout.

## After the clock (10 min)

- [ ] Teams submit their diagram + solution sheet per the activity.
- [ ] On **proctor**, click **Report** → **Print / Save as PDF** for a per-team participant record, or **Export CSV** for raw data.
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
