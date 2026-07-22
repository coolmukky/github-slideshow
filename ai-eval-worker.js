/* ============================================================================
   AI evaluation proxy for the Segmentation Design Clinic (Anthropic / Claude)
   ----------------------------------------------------------------------------
   A tiny serverless function that holds the Anthropic API key as a SERVER
   secret and scores a team's use-case response against the proctor's cheat
   sheet. The proctor page (proctor.html) POSTs to it; the key never touches
   the browser.

   Reference implementation: Cloudflare Workers (free tier, single file).
   Deploy steps and a Firebase Functions alternative are in AI-EVAL.md.

   Environment (secrets / vars):
     ANTHROPIC_API_KEY   (required)  your Anthropic API key
     ALLOW_ORIGIN        (optional)  exact origin allowed via CORS,
                                     e.g. https://coolmukky.github.io  (default "*")
     EVAL_SHARED_TOKEN   (optional)  if set, requests must send a matching
                                     "x-eval-token" header (light abuse guard)

   Request  (POST JSON):
     { model, useCase, useCaseTitle, rubric:{c1:{label,max},c2:{...},c3:{...}},
       cheatSheet:{painResponse:[[pain,response]...], products:[[name,how,why]...]},
       response:{ painMap:[{pain,product,note}], products:[{product,how,why}], diagram } }
   Response (JSON):
     { c1, c2, c3, total, rationale, model }
   ========================================================================== */

const ALLOWED_MODELS = ["claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5-20251001"];
const DEFAULT_MODEL = "claude-opus-4-8";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": (env && env.ALLOW_ORIGIN) || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, x-eval-token",
      "Access-Control-Max-Age": "86400",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (!env || !env.ANTHROPIC_API_KEY) return json({ error: "server not configured (missing ANTHROPIC_API_KEY)" }, 500, cors);
    if (env.EVAL_SHARED_TOKEN && request.headers.get("x-eval-token") !== env.EVAL_SHARED_TOKEN)
      return json({ error: "unauthorized" }, 401, cors);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "invalid JSON body" }, 400, cors); }

    const model = ALLOWED_MODELS.indexOf(body.model) >= 0 ? body.model : DEFAULT_MODEL;
    const rubric = normalizeRubric(body.rubric);

    const system =
      "You are an expert subject-matter examiner grading a team's network segmentation solution " +
      "in a Cisco design clinic. Grade ONLY against the provided reference answer (cheat sheet) and " +
      "the rubric maxima. Award partial credit generously where the team's intent matches the reference, " +
      "but do not reward blank or off-topic answers. Judge the diagram (if provided) for the third " +
      "criterion. Always respond by calling the submit_score tool.";

    const content = [{ type: "text", text: buildUserText(body, rubric) }];
    const blk = imageBlock(body && body.response && body.response.diagram);
    if (blk) content.push(blk);

    const tool = {
      name: "submit_score",
      description: "Return the rubric scores (integers within each maximum) and a short rationale.",
      input_schema: {
        type: "object",
        properties: {
          c1: { type: "integer", minimum: 0, maximum: rubric.c1.max, description: rubric.c1.label },
          c2: { type: "integer", minimum: 0, maximum: rubric.c2.max, description: rubric.c2.label },
          c3: { type: "integer", minimum: 0, maximum: rubric.c3.max, description: rubric.c3.label },
          rationale: { type: "string", description: "2-4 sentences: what was strong, what was missing." },
        },
        required: ["c1", "c2", "c3", "rationale"],
      },
    };

    let ar;
    try {
      ar = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model, max_tokens: 1024, system,
          tools: [tool], tool_choice: { type: "tool", name: "submit_score" },
          messages: [{ role: "user", content }],
        }),
      });
    } catch (e) {
      return json({ error: "could not reach Anthropic API", detail: String(e && e.message || e) }, 502, cors);
    }
    if (!ar.ok) {
      const t = await ar.text();
      return json({ error: "model API error (" + ar.status + ")", detail: t.slice(0, 600) }, 502, cors);
    }
    const data = await ar.json();
    const use = (data.content || []).find(function (b) { return b.type === "tool_use"; });
    if (!use || !use.input) return json({ error: "model returned no structured score" }, 502, cors);

    const c1 = clamp(use.input.c1, rubric.c1.max);
    const c2 = clamp(use.input.c2, rubric.c2.max);
    const c3 = clamp(use.input.c3, rubric.c3.max);
    return json({ c1, c2, c3, total: c1 + c2 + c3, rationale: String(use.input.rationale || ""), model }, 200, cors);
  },
};

function normalizeRubric(r) {
  r = r || {};
  const d = { c1: { label: "Pain-point → product mapping", max: 40 }, c2: { label: "Products — how & why", max: 30 }, c3: { label: "Diagram & overall solution", max: 30 } };
  ["c1", "c2", "c3"].forEach(function (k) {
    if (r[k] && typeof r[k].max === "number") d[k] = { label: String(r[k].label || d[k].label), max: r[k].max };
  });
  return d;
}

function buildUserText(body, rubric) {
  const cs = body.cheatSheet || {};
  const resp = body.response || {};
  const lines = [];
  lines.push("USE CASE " + (body.useCase || "?") + ": " + (body.useCaseTitle || ""));
  lines.push("");
  lines.push("=== RUBRIC (score each; integers) ===");
  lines.push("c1 — " + rubric.c1.label + " (0-" + rubric.c1.max + ")");
  lines.push("c2 — " + rubric.c2.label + " (0-" + rubric.c2.max + ")");
  lines.push("c3 — " + rubric.c3.label + " (0-" + rubric.c3.max + "); judge the attached diagram image if present.");
  lines.push("");
  lines.push("=== REFERENCE ANSWER (cheat sheet) ===");
  lines.push("Pain point → expected response:");
  (cs.painResponse || []).forEach(function (r) { lines.push("  - " + r[0] + "  =>  " + r[1]); });
  lines.push("Expected products (name / how / why):");
  (cs.products || []).forEach(function (r) { lines.push("  - " + r[0] + " | " + r[1] + " | " + r[2]); });
  lines.push("");
  lines.push("=== TEAM'S RESPONSE (grade this) ===");
  lines.push("Pain-point → product mapping:");
  (resp.painMap || []).forEach(function (r) { lines.push("  - PAIN: " + (r.pain || "") + " | PRODUCT: " + (r.product || "—") + " | HOW/WHY: " + (r.note || "—")); });
  lines.push("Products proposed (name / how / why):");
  (resp.products || []).forEach(function (r) { lines.push("  - " + (r.product || "—") + " | " + (r.how || "—") + " | " + (r.why || "—")); });
  lines.push("Diagram attached: " + (imageBlock(resp.diagram) ? "yes (see image)" : "no"));
  lines.push("");
  lines.push("Score the team's response against the reference using the rubric. Call submit_score.");
  return lines.join("\n");
}

function parseDataUrl(u) {
  if (typeof u !== "string") return null;
  const m = u.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  const mime = m[1];
  if (["image/jpeg", "image/png", "image/gif", "image/webp"].indexOf(mime) < 0) return null;
  return { mime: mime, data: m[2] };
}

// Build an Anthropic image block from either a Storage/HTTP URL or an inline data URL.
function imageBlock(u) {
  if (typeof u !== "string") return null;
  if (u.indexOf("http") === 0) return { type: "image", source: { type: "url", url: u } };
  const img = parseDataUrl(u);
  return img ? { type: "image", source: { type: "base64", media_type: img.mime, data: img.data } } : null;
}

function clamp(v, max) { v = parseInt(v, 10); if (isNaN(v) || v < 0) v = 0; if (v > max) v = max; return v; }

function json(o, status, cors) {
  return new Response(JSON.stringify(o), { status: status, headers: Object.assign({ "content-type": "application/json" }, cors) });
}
