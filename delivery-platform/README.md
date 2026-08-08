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

## The multi-layer UI

The left rail mirrors the sitemap on every screen, so the "layers" are always visible.

| Layer | Screen | What happens there |
| --- | --- | --- |
| **MAP** | Sitemap | The whole idea at a glance; click any node to jump in. |
| **L0** | Portal | Pick an architecture track; global quarterly/monthly view + KPIs. |
| **L1** | Delivery Calendar | Track roadmap (quarterly) or dated calendar (monthly); sub-domain filters; sessions list. |
| **L2** | Create Event | Producer view — pick format(s), link material, flip integrations; publishing mints the QR + participant page. |
| **L3** | Event & QR Signup | Mobile-first participant page the QR opens: register → unlock materials → enter workspace. |
| **L4** | Activity Workspace | Run the activity, with **Circuit AI** and **Webex** docked on the right for every format. |

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
