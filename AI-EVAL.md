# Live AI evaluation — setup

The proctor console (`proctor.html`) can score a team's use-case response with
**Claude** and pre-fill the rubric (you still review and **Save**). Because this
site is static (GitHub Pages) and the Anthropic API key must **never** ship in
browser JavaScript, the model is called through a tiny **serverless proxy** that
holds the key as a server secret.

- Proxy code: [`ai-eval-worker.js`](./ai-eval-worker.js) (Cloudflare Workers reference; adaptable)
- Client config: `window.AI_EVAL_ENDPOINT` in [`firebase-config.js`](./firebase-config.js)

Manual scoring always works; AI evaluation is **optional**.

There are **two ways** to turn it on:
- **Quickest — no backend (your own key):** paste your Anthropic key into the proctor
  page; it's kept only in that browser tab and calls Claude directly. Zero deploy. Best
  for a demo or a single facilitator. See **[Quickest](#quickest--no-backend-your-own-key)** below.
- **Serverless proxy:** a small function holds the key server-side (the key never touches
  any browser). Best for shared/repeat use. See **[Option A](#option-a--cloudflare-workers-recommended-free-tier)**.

---

## Quickest — no backend (your own key)

No Cloudflare, no terminal, no deploy.

1. Open **`proctor.html`** → click **AI key** (top bar).
2. Paste your Anthropic key (`sk-ant-…`, from `console.anthropic.com`) → **Save key**.
   It's stored in **sessionStorage** — only this browser tab, cleared when you close it.
3. Click **Test AI** → expect **"AI evaluation OK (your key) · &lt;model&gt; · &lt;ms&gt; ms"**.
4. In an Evaluate modal, click **Evaluate with AI** → it pre-fills the score + rationale to review and Save.

**Tradeoff (be aware):** the key lives in that browser tab while you use it, so anyone
with access to *that* browser's dev tools could read it. Since only the facilitator opens
the proctor page — and you can **Clear** the key (or just close the tab) afterward, and
rotate it in the Anthropic console — this is a reasonable trade for a facilitated session.
For anything shared or long-lived, use the proxy instead (below). If both a proxy endpoint
and a pasted key are present, the **proxy wins**.

---

## What happens

1. Proctor opens **Evaluate** on a submitted use case and clicks **Evaluate with AI**.
2. The page POSTs the team's response + the **cheat sheet** + the rubric maxima to your proxy.
3. The proxy calls the **Anthropic Messages API** (with the key it holds) and forces a
   structured `submit_score` result: `c1`, `c2`, `c3`, and a short rationale.
4. The page fills the three score boxes and the notes; the proctor adjusts if needed and **Saves**.
   The score is stored with `method:"ai"` and the model used.

Data flow (nothing sensitive in the browser):

```
proctor.html ──POST {response, cheatSheet, rubric}──▶ your proxy ──x-api-key──▶ Anthropic
             ◀──── {c1,c2,c3,total,rationale} ───────           ◀── tool_use ──
```

---

## Option A — Cloudflare Workers (recommended, free tier)

The repo already ships the Worker ([`ai-eval-worker.js`](./ai-eval-worker.js)) **and** a ready
[`wrangler.toml`](./wrangler.toml), so deploy is basically: set your key, deploy.

1. Install Wrangler and log in (once):
   ```
   npm i -g wrangler
   wrangler login
   ```
2. From the **repo root**, set your Anthropic key as a Worker secret:
   ```
   wrangler secret put ANTHROPIC_API_KEY        # paste your Anthropic key when prompted
   # optional light abuse guard (see below):
   # wrangler secret put EVAL_SHARED_TOKEN
   ```
3. Deploy (uses `wrangler.toml` automatically — name, entry file, and `ALLOW_ORIGIN` are preset):
   ```
   wrangler deploy
   ```
   Note the printed URL, e.g. `https://clinic-ai-eval.<you>.workers.dev`.

   > `wrangler.toml` presets `ALLOW_ORIGIN = https://coolmukky.github.io`. If you serve the pages
   > from a different origin, edit that line before deploying.

4. Point the app at it — edit [`firebase-config.js`](./firebase-config.js):
   ```js
   window.AI_EVAL_ENDPOINT = "https://clinic-ai-eval.<you>.workers.dev";
   window.AI_EVAL_TOKEN = "";   // set only if you configured EVAL_SHARED_TOKEN
   ```
   Commit and push, then hard-refresh `proctor.html`.
5. On the proctor, click **Test AI** → expect **"AI endpoint OK · &lt;model&gt; · &lt;ms&gt; ms"**.

---

## Option B — Firebase Cloud Functions (same Google project)

Requires the **Blaze** (pay-as-you-go) plan. Sketch:

```js
// functions/index.js  (2nd-gen HTTPS function)
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

exports.aiEval = onRequest({ secrets: [ANTHROPIC_API_KEY], cors: ["https://coolmukky.github.io"] },
  async (req, res) => {
    // Reuse the request/prompt/Anthropic logic from ai-eval-worker.js:
    // read req.body, build the messages + submit_score tool, call
    // https://api.anthropic.com/v1/messages with x-api-key: ANTHROPIC_API_KEY.value(),
    // then res.json({ c1, c2, c3, total, rationale, model }).
  });
```

Deploy with `firebase deploy --only functions`, set the secret with
`firebase functions:secrets:set ANTHROPIC_API_KEY`, then set
`window.AI_EVAL_ENDPOINT` to the function URL.

---

## Configuration reference

**Proxy environment (server side — never in the browser):**

| Name | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Your Anthropic API key (a server secret). |
| `ALLOW_ORIGIN` | recommended | Exact origin allowed via CORS, e.g. `https://coolmukky.github.io`. Defaults to `*`. |
| `EVAL_SHARED_TOKEN` | optional | If set, requests must send a matching `x-eval-token` header. Light abuse guard. |

**Client (`firebase-config.js`):**

| Name | Purpose |
|---|---|
| `window.AI_EVAL_ENDPOINT` | Your proxy URL. Empty = AI evaluation stays in preview mode. |
| `window.AI_EVAL_TOKEN` | Only if you set `EVAL_SHARED_TOKEN`. It ships in the page, so treat it as low-value (rotate/limit via origin restriction). |

**Models:** the proctor's picker offers Claude Opus 4.8 / Sonnet 5 (and Haiku).
The proxy allow-lists Claude model ids and defaults to `claude-opus-4-8`.

---

## Notes & limits

- **The AI suggests; the proctor decides.** Scores are pre-filled, not auto-saved — always review before Save.
- **Cheat sheet drives grading.** The model is told to grade against the reference answer for that use case (in `CHEATSHEETS` in `proctor.html`). Use cases without a cheat sheet still work but grade more loosely.
- **Diagrams** are sent to the model (Claude is multimodal) when a team attached one, so the "diagram & overall solution" criterion reflects the picture.
- **Cost/rate:** each click is one API call. The optional `EVAL_SHARED_TOKEN` + `ALLOW_ORIGIN` reduce casual abuse; for anything public, add real auth/rate-limiting at the proxy.
- **CORS errors?** Make sure `ALLOW_ORIGIN` exactly matches your site's origin (scheme + host, no trailing slash), then hard-refresh.
