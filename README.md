# Your GitHub Learning Lab Repository for Introducing GitHub

## 🛡️ Zero Trust Agentic Design Sprint

An interactive playbook for running the **Zero Trust Agentic Design Sprint** design-clinic group activity — a timed, four-person tabletop exercise. It adds a live 60-minute facilitator timer, auto-tracked phases, timed injection reveals, tickable checklists, a fillable solution sheet, a per-person **"take your seat" persona** view, and a live **team roster** for the proctor.

**Pages**

- ➡️ **[Participant page — `zero-trust-design-sprint.html`](./zero-trust-design-sprint.html)** — the playbook each participant opens (served at `/zero-trust-design-sprint.html`).
- 👁️ **[Proctor roster — `proctor.html`](./proctor.html)** — live view of all teams and members as they join, with per-role counts, team-completeness flags, a search filter, **CSV export**, and a printable **participant report** (PDF-ready). Scales comfortably to ~300 participants.

**Live cross-device roster (optional setup)**

Participants enter their **name, email, and team name** when they take a seat, and the proctor sees everyone grouped by team on `proctor.html`. Because GitHub Pages is static, sharing that data across devices needs a small backend:

- Fill in **[`firebase-config.js`](./firebase-config.js)** with your Firebase project values (step-by-step setup is in that file). Firestore then syncs the roster live across every device.
- Until it's configured, everything still works in **single-device mode** (localStorage) so you can demo it on one machine.
- Optional `?room=CODE` on both pages scopes a roster to one session (handy when running several clinics).
- Note: the roster stores participant **emails (PII)** — use the provided Firestore rules and clear the data after your session.

---

Welcome to **your** repository for your GitHub Learning Lab course. This repository will be used during the different activities that I will be guiding you through. See a word you don't understand? We've included an emoji 📖 next to some key terms. Click on it to see its definition.

Oh! I haven't introduced myself...

I'm the GitHub Learning Lab bot and I'm here to help guide you in your journey to learn and master the various topics covered in this course. I will be using Issue and Pull Request comments to communicate with you. In fact, I already added an issue for you to check out.

![issue tab](https://lab.github.com/public/images/issue_tab.png)

I'll meet you over there, can't wait to get started!

This course is using the :sparkles: open source project [reveal.js](https://github.com/hakimel/reveal.js/). In some cases we’ve made changes to the history so it would behave during class, so head to the original project repo to learn more about the cool people behind this project.
