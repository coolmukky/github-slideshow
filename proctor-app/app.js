/* ============================================================================
 * Proctor App — shared logic (storage, file helpers, LLM evaluation, rendering)
 * Pure client-side. No build step. Works from a static host (GitHub Pages).
 * ==========================================================================*/
(function (global) {
  "use strict";

  // ---- storage keys ---------------------------------------------------------
  var K = {
    apiKey: "pa_apiKey",
    model: "pa_model",
    reference: "pa_reference",     // { brief, rubric, diagramDataUrl }
    submissions: "pa_submissions", // [ submission ]
  };

  // ---- proficiency bands ----------------------------------------------------
  var LEVELS = [
    { min: 85, name: "Expert" },
    { min: 70, name: "Advanced" },
    { min: 50, name: "Proficient" },
    { min: 0, name: "Foundational" },
  ];
  function levelForScore(score) {
    for (var i = 0; i < LEVELS.length; i++) if (score >= LEVELS[i].min) return LEVELS[i].name;
    return "Foundational";
  }

  // ---- default rubric (proctor can edit on the proctor page) ----------------
  var DEFAULT_RUBRIC = [
    "Score the team's SOLUTION DOCUMENT and TOPOLOGY DIAGRAM against the reference",
    "brief and the reference solution diagram. Judge how well the solution meets the",
    "expected solution. Weighted dimensions (total 100):",
    "",
    "1. Pain-point identification (25) — did they surface the REAL problems in the",
    "   brief and prioritise them, versus generic or missed risks?",
    "2. Finding the right solution (40) — does the design actually solve those pain",
    "   points and align with the reference solution's approach and key controls?",
    "3. Uplevel opportunities (15) — did they identify higher-order improvements,",
    "   trade-offs, or next steps beyond the minimum?",
    "4. Topology diagram quality (10) — correct components, clear flows/labels.",
    "   Legibility is judged HERE ONLY; a hard-to-read diagram never lowers the",
    "   scores above if the intent is clear from the document.",
    "5. Communication (10) — is the write-up clear, with the 'why' behind decisions?",
    "",
    "Proficiency bands (map the overall 0–100 total): ",
    "  0–49 Foundational · 50–69 Proficient · 70–84 Advanced · 85–100 Expert.",
  ].join("\n");

  // ---- small helpers --------------------------------------------------------
  function readJSON(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function uid() { return "s_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- config / reference / submissions accessors ---------------------------
  function getApiKey() { return localStorage.getItem(K.apiKey) || ""; }
  function setApiKey(v) { localStorage.setItem(K.apiKey, v || ""); }
  function getModel() { return localStorage.getItem(K.model) || "claude-opus-4-8"; }
  function setModel(v) { localStorage.setItem(K.model, v || "claude-opus-4-8"); }

  function getReference() {
    return readJSON(K.reference, { brief: "", rubric: DEFAULT_RUBRIC, diagramDataUrl: "" });
  }
  function setReference(ref) { writeJSON(K.reference, ref); }

  function getSubmissions() { return readJSON(K.submissions, []); }
  function setSubmissions(list) { writeJSON(K.submissions, list); }
  function addSubmission(sub) {
    var list = getSubmissions();
    list.push(sub);
    setSubmissions(list);
    return sub;
  }
  function updateSubmission(id, patch) {
    var list = getSubmissions();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { Object.assign(list[i], patch); break; }
    }
    setSubmissions(list);
  }
  function latestForTeam(team) {
    var t = String(team || "").trim().toLowerCase();
    var list = getSubmissions().filter(function (s) {
      return String(s.team || "").trim().toLowerCase() === t;
    });
    list.sort(function (a, b) { return b.ts - a.ts; });
    return list[0] || null;
  }

  // ---- file readers ---------------------------------------------------------
  function readAsText(file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(r.result); };
      r.onerror = rej; r.readAsText(file);
    });
  }
  function readAsDataURL(file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(r.result); };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }

  // Downscale an image file to a JPEG data URL (caps tokens + localStorage size).
  function imageToDataURL(file, maxDim) {
    maxDim = maxDim || 1400;
    return readAsDataURL(file).then(function (dataUrl) {
      return new Promise(function (res) {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          var scale = Math.min(1, maxDim / Math.max(w, h));
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var c = document.createElement("canvas");
          c.width = cw; c.height = ch;
          var ctx = c.getContext("2d");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          try { res(c.toDataURL("image/jpeg", 0.85)); }
          catch (e) { res(dataUrl); } // fallback: original
        };
        img.onerror = function () { res(dataUrl); };
        img.src = dataUrl;
      });
    });
  }

  // Read a solution document into { name, kind, text? , data? }.
  // kind: "pdf" (Claude reads it natively) | "text" (txt/md/etc.)
  function readDocument(file) {
    var name = file.name || "document";
    var isPdf = /\.pdf$/i.test(name) || file.type === "application/pdf";
    if (isPdf) {
      return readAsDataURL(file).then(function (dataUrl) {
        var m = /^data:[^;]*;base64,(.*)$/.exec(dataUrl);
        return { name: name, kind: "pdf", data: m ? m[1] : "" };
      });
    }
    return readAsText(file).then(function (txt) {
      return { name: name, kind: "text", text: txt };
    });
  }

  // ---- LLM evaluation -------------------------------------------------------
  function dataUrlToImageBlock(dataUrl) {
    var m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl || "");
    if (!m) return null;
    return { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } };
  }

  var OUTPUT_INSTRUCTIONS = [
    "Return ONLY a JSON object (no prose, no markdown fences) with EXACTLY this shape:",
    "{",
    '  "overallScore": <integer 0-100>,',
    '  "proficiency": "Foundational|Proficient|Advanced|Expert",',
    '  "diagramScore": <integer 0-100>,',
    '  "documentScore": <integer 0-100>,',
    '  "summary": "<2-4 sentence overall explanation of how they did and why this level>",',
    '  "useCases": {',
    '    "painPoints":   { "score": <0-100>, "found": ["..."], "missed": ["..."], "comment": "<why>" },',
    '    "rightSolution":{ "score": <0-100>, "alignmentWithReference": "<how well it matches the expected solution>", "comment": "<why>" },',
    '    "uplevelOpportunities": { "score": <0-100>, "identified": ["what the team already called out"], "suggested": ["higher-order improvements they could still make"], "comment": "<why>" }',
    "  },",
    '  "strengths": ["..."],',
    '  "gaps": ["..."]',
    "}",
    "Base every point on evidence in the team's diagram or document. Do not invent",
    "content they did not show. Keep the overall score consistent with the proficiency band.",
  ].join("\n");

  function buildPrompt(reference) {
    var parts = [];
    parts.push("You are an expert proctor evaluating a team's network/solution design.");
    parts.push("");
    parts.push("=== RUBRIC (authoritative) ===");
    parts.push(reference.rubric || DEFAULT_RUBRIC);
    if (reference.brief && reference.brief.trim()) {
      parts.push("");
      parts.push("=== REFERENCE BRIEF / EXPECTED SOLUTION ===");
      parts.push(reference.brief.trim());
    }
    parts.push("");
    parts.push("You will be given (optionally) a reference solution diagram, then the");
    parts.push("team's topology diagram, then the team's solution document. Grade the team.");
    return parts.join("\n");
  }

  function parseResult(text) {
    var t = String(text || "").trim();
    // strip ```json ... ``` fences if present
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    // grab the outermost {...}
    var first = t.indexOf("{"), last = t.lastIndexOf("}");
    if (first >= 0 && last > first) t = t.slice(first, last + 1);
    var obj = JSON.parse(t);
    if (typeof obj.overallScore === "number" && !obj.proficiency) {
      obj.proficiency = levelForScore(obj.overallScore);
    }
    return obj;
  }

  // Calls the Anthropic Messages API directly from the browser.
  // Requires the caller (proctor) to have set an API key.
  function evaluateSubmission(opts) {
    var apiKey = opts.apiKey, model = opts.model || getModel();
    var reference = opts.reference, submission = opts.submission;
    if (!apiKey) return Promise.reject(new Error("No API key set. Add it on the Proctor page."));

    var content = [];
    content.push({ type: "text", text: buildPrompt(reference) });

    var refImg = reference.diagramDataUrl && dataUrlToImageBlock(reference.diagramDataUrl);
    if (refImg) {
      content.push({ type: "text", text: "=== REFERENCE SOLUTION DIAGRAM ===" });
      content.push(refImg);
    }
    var teamImg = submission.diagramDataUrl && dataUrlToImageBlock(submission.diagramDataUrl);
    content.push({ type: "text", text: "=== TEAM TOPOLOGY DIAGRAM ===" });
    if (teamImg) content.push(teamImg);
    else content.push({ type: "text", text: "(no diagram uploaded)" });

    content.push({ type: "text", text: "=== TEAM SOLUTION DOCUMENT ===" });
    var doc = submission.doc || {};
    if (doc.kind === "pdf" && doc.data) {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: doc.data } });
    } else {
      content.push({ type: "text", text: (doc.text && doc.text.trim()) || "(no document provided)" });
    }

    content.push({ type: "text", text: OUTPUT_INSTRUCTIONS });

    var body = { model: model, max_tokens: 3000, messages: [{ role: "user", content: content }] };

    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    }).then(function (resp) {
      return resp.text().then(function (raw) {
        if (!resp.ok) throw new Error("Claude API " + resp.status + ": " + raw);
        var data = JSON.parse(raw);
        var text = (data.content || [])
          .filter(function (b) { return b.type === "text"; })
          .map(function (b) { return b.text; })
          .join("\n");
        return parseResult(text);
      });
    });
  }

  // ---- shared UI: render a result card --------------------------------------
  function list(arr) {
    if (!arr || !arr.length) return '<span class="muted">—</span>';
    return "<ul>" + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }
  function renderResult(result) {
    if (!result) return '<p class="muted">Not scored yet.</p>';
    var uc = result.useCases || {};
    var pp = uc.painPoints || {}, rs = uc.rightSolution || {}, up = uc.uplevelOpportunities || {};
    var lvl = result.proficiency || levelForScore(result.overallScore || 0);
    var lvlClass = "lvl-" + lvl.toLowerCase();
    return [
      '<div class="result">',
      '  <div class="score-head">',
      '    <div class="big-score">' + esc(result.overallScore) + '<small>/100</small></div>',
      '    <span class="badge ' + lvlClass + '">' + esc(lvl) + '</span>',
      '    <div class="subscores">',
      '      <span>Diagram <b>' + esc(result.diagramScore != null ? result.diagramScore : "–") + "</b></span>",
      '      <span>Document <b>' + esc(result.documentScore != null ? result.documentScore : "–") + "</b></span>",
      "    </div>",
      "  </div>",
      '  <p class="summary">' + esc(result.summary) + "</p>",

      '  <div class="uc">',
      "    <h4>1 · Identifying pain points <span class=\"ucs\">" + esc(pp.score != null ? pp.score : "–") + "/100</span></h4>",
      "    <div class=\"cols\">",
      "      <div><div class=\"lbl ok\">Found</div>" + list(pp.found) + "</div>",
      "      <div><div class=\"lbl bad\">Missed</div>" + list(pp.missed) + "</div>",
      "    </div>",
      "    <p>" + esc(pp.comment) + "</p>",
      "  </div>",

      '  <div class="uc">',
      "    <h4>2 · Finding the right solution <span class=\"ucs\">" + esc(rs.score != null ? rs.score : "–") + "/100</span></h4>",
      "    <p><b>Alignment with expected:</b> " + esc(rs.alignmentWithReference) + "</p>",
      "    <p>" + esc(rs.comment) + "</p>",
      "  </div>",

      '  <div class="uc">',
      "    <h4>3 · Uplevel opportunities <span class=\"ucs\">" + esc(up.score != null ? up.score : "–") + "/100</span></h4>",
      "    <div class=\"cols\">",
      "      <div><div class=\"lbl ok\">They identified</div>" + list(up.identified) + "</div>",
      "      <div><div class=\"lbl\">Could still pursue</div>" + list(up.suggested) + "</div>",
      "    </div>",
      "    <p>" + esc(up.comment) + "</p>",
      "  </div>",

      '  <div class="cols">',
      '    <div><div class="lbl ok">Strengths</div>' + list(result.strengths) + "</div>",
      '    <div><div class="lbl bad">Gaps</div>' + list(result.gaps) + "</div>",
      "  </div>",
      "</div>",
    ].join("\n");
  }

  function fmtTime(ts) {
    try { return new Date(ts).toLocaleString(); } catch (e) { return String(ts); }
  }

  // ---- export ---------------------------------------------------------------
  global.ProctorApp = {
    K: K,
    DEFAULT_RUBRIC: DEFAULT_RUBRIC,
    levelForScore: levelForScore,
    esc: esc, fmtTime: fmtTime,
    getApiKey: getApiKey, setApiKey: setApiKey,
    getModel: getModel, setModel: setModel,
    getReference: getReference, setReference: setReference,
    getSubmissions: getSubmissions, setSubmissions: setSubmissions,
    addSubmission: addSubmission, updateSubmission: updateSubmission,
    latestForTeam: latestForTeam, uid: uid,
    imageToDataURL: imageToDataURL, readDocument: readDocument, readAsText: readAsText,
    evaluateSubmission: evaluateSubmission,
    renderResult: renderResult,
  };
})(window);
