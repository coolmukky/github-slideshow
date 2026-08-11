# Tech Elevate — Delivery Platform (wireframe)

Interactive, clickable wireframe for a **multi-layer delivery platform** that lets Tech
Elevate teams run technical sessions — lectures, hands-on labs, Birds-of-a-Feather, and
more — on a **quarterly and monthly** cadence across the three architecture tracks.

- **Open it:** `delivery-platform/wireframe.html` (single self-contained file — no build, no
  dependencies; open directly in a browser or serve the folder).
- Blueprint / schematic visual language, light + dark themes, keyboard-focusable controls.
- Toggle **✎** in the top bar for spec annotations, **◑** for theme, and the
  **Quarterly / Monthly** switch to reframe the calendar.

> This is a concept prototype with placeholder content — not a production build.

## Architecture tracks

| Track | Sub-domains |
| --- | --- |
| **Secure Networking** | Networking · Security |
| **Full-Stack AI Infrastructure** | I&MI · CAI |
| **Workplace Experience** | Collaboration |

## Roles

A **View as** switcher (top of the left rail) reframes the platform for four roles:
**Attendee**, **Facilitator**, **Producer**, and **Program lead**. The rail groups screens
into *Delivery spine* (the L0–L4 journey) and *Operate* (the two console surfaces).

## Webex model (design decision)

The platform is designed to run as a **Webex Embedded App** — it opens as a *tab inside the
meeting* rather than embedding Webex inside itself. The Portal and QR signup also work
standalone in a browser for async / self-paced access. This is surfaced as a context bar on
the workspace and facilitator console, and as a note in the rail.

## The multi-layer UI

The left rail mirrors the sitemap on every screen, so the "layers" are always visible.

| Layer | Screen | Role | What happens there |
| --- | --- | --- | --- |
| **MAP** | Sitemap | all | The whole idea at a glance; click any node to jump in. |
| **L0** | Portal | attendee | Pick an architecture track; global quarterly/monthly view + KPIs. |
| **L1** | Delivery Calendar | attendee | Track roadmap (quarterly) or dated calendar (monthly); sub-domain filters; sessions list. |
| **L2** | Create Event | producer | Pick format(s), link material, flip integrations; publishing mints the QR + participant page. |
| **L3** | Event & QR Signup | attendee | Mobile-first participant page the QR opens: register → unlock materials → enter workspace. |
| **L4** | Activity Workspace | attendee | Run the activity, with **Circuit AI** and **Webex** docked on the right for every format. |
| **L5** | After the Session | attendee | Post-event: recording + chapters, Circuit AI summary, badges/points earned, feedback survey, and a "what's next" nudge. |
| **LIB** | Content Library | producer | Session **templates** (start a new event from a proven pattern) + a reusable **material catalog** — so a monthly/quarterly cadence isn't rebuilt each time. |
| **FAC** | Facilitator Console | facilitator | Live run-of-show + proctor: drive the agenda ("Advance room"), watch check-ins & lab health, act on people who are stuck, Circuit AI co-pilot. |
| **ADM** | Admin & Analytics | program lead | Cross-track program dashboard: delivery vs plan, engagement by format, enablement outcomes, and a roadmap-coverage heatmap that flags scheduling gaps. |

## Engagement & flow

- **Facilitator-led vs self-paced** — the L4 workspace has a mode toggle. In *facilitator-led* the activity switcher follows the room (the facilitator's "Advance room" pushes everyone to the next activity); *self-paced* unlocks every activity.
- **Points & badges spine** — a persistent progress strip in L4 accrues points and badges across the hands-on lab, CTF, and escape room, and those earned badges + points resurface on the L5 recap.

## Accessibility & craft

Single inline-SVG icon set (a `<symbol>` sprite + a `paintIcons()` helper), a real `<h1>`, a skip-to-content link, and a visible `:focus-visible` state on every control. Icons are `currentColor` stroke so they inherit theme and semantic colors.

## Eight activity formats (all in the L4 workspace)

Lecture · Hands-on Lab · BOF Discussion · Capture the Flag · Escape Room · Whiteboarding ·
POC · Design Clinic.

Several are interactive in the wireframe: tick lab steps, submit a CTF flag, unlock an
escape-room stage, draw on the whiteboard, book a design-clinic slot, and chat with / call
Circuit AI.

## Platform capabilities demonstrated

- Create an event and link delivery material (deck, lab/sandbox, repo, dataset, video).
- Auto-generated **QR code** → sign-up → seat + material unlock.
- Per-activity workspaces for every format above.
- **Circuit AI** integration (make a call, ask, auto-grade) and **Webex** integration
  (roster, breakouts, recording) as always-on companions.

## Editing

Everything lives in one file. Content data (events, cadence, activity names) sits in the
`<script>` block near the bottom (`EVENTS`, `CRUMB`, `ACTNAME`, cadence renderers); styling
is token-driven at the top of the `<style>` block (`--paper`, `--ink`, `--accent`, …) with
light, dark, and system themes all defined.
