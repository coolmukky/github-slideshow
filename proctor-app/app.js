/* ============================================================================
 * Proctor App — shared logic (store, file helpers, LLM evaluation, rendering)
 * Pure client-side. No build step. Works from a static host (GitHub Pages).
 *
 * Data (reference material + submissions) flows through window.ProctorStore,
 * which is either Firestore (if firebase-config.js is filled in) or a
 * localStorage fallback. The Claude API key + model stay in localStorage on the
 * proctor's device only and are NEVER written to the shared store.
 * ==========================================================================*/
(function (global) {
  "use strict";

  // ---- config keys (LOCAL ONLY — never synced) ------------------------------
  var CK = { apiKey: "pa_apiKey", model: "pa_model" };

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
  function uid() { return "s_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmtTime(ts) { try { return new Date(ts).toLocaleString(); } catch (e) { return String(ts); } }

  // ---- config accessors (local only) ----------------------------------------
  function getApiKey() { return localStorage.getItem(CK.apiKey) || ""; }
  function setApiKey(v) { localStorage.setItem(CK.apiKey, v || ""); }
  function getModel() { return localStorage.getItem(CK.model) || "claude-opus-4-8"; }
  function setModel(v) { localStorage.setItem(CK.model, v || "claude-opus-4-8"); }

  // ---- store layer (reference + submissions, via ProctorStore) --------------
  var _store = null, _room = "default";
  var _ref = { brief: "", rubric: DEFAULT_RUBRIC, diagramDataUrl: "" };
  var _subs = [];
  var _refCbs = [], _subCbs = [];
  var DEFAULT_REF = { brief: "", rubric: DEFAULT_RUBRIC, diagramDataUrl: "" };

  function getRoom() {
    try {
      var m = /[?&]room=([^&]+)/.exec(global.location.search || "");
      return m ? decodeURIComponent(m[1]) : "default";
    } catch (e) { return "default"; }
  }

  function initStore() {
    _room = getRoom();
    return global.ProctorStore.init(_room).then(function (adapter) {
      _store = adapter;
      adapter.watch("pa_submissions", _room, function (list) {
        _subs = (list || []).slice();
        _subCbs.forEach(function (cb) { try { cb(_subs); } catch (e) {} });
      });
      adapter.watch("pa_reference", _room, function (list) {
        var d = (list || []).filter(function (x) { return x.id === _room; })[0];
        _ref = d ? Object.assign({}, DEFAULT_REF, d) : Object.assign({}, DEFAULT_REF);
        _refCbs.forEach(function (cb) { try { cb(_ref); } catch (e) {} });
      });
      return adapter;
    });
  }
  function storeMode() { return _store ? _store.mode : "local"; }
  function room() { return _room; }

  function onReference(cb) { _refCbs.push(cb); if (_store) cb(_ref); }
  function onSubmissions(cb) { _subCbs.push(cb); if (_store) cb(_subs); }
  function referenceCache() { return _ref; }
  function submissionsCache() { return _subs; }

  function saveReference(ref) {
    var doc = Object.assign({}, ref, { id: _room, room: _room, updatedAt: Date.now() });
    _ref = Object.assign({}, DEFAULT_REF, doc);
    return _store.write("pa_reference", doc);
  }
  // Rough guard against the Firestore ~1 MB per-document limit.
  function tooBigForFirestore(sub) {
    if (storeMode() !== "firebase") return false;
    try { return JSON.stringify(sub).length > 950000; } catch (e) { return false; }
  }
  function saveSubmission(sub) {
    sub.room = _room;
    if (tooBigForFirestore(sub)) {
      return Promise.reject(new Error("This submission is too large to sync (over ~1 MB). Use a smaller PDF or paste the solution as text."));
    }
    return _store.write("pa_submissions", sub);
  }
  function patchSubmission(id, patch) {
    var doc = Object.assign({ id: id, room: _room }, patch);
    return _store.write("pa_submissions", doc);
  }
  function latestForTeam(team) {
    var t = String(team || "").trim().toLowerCase();
    var list = _subs.filter(function (s) { return String(s.team || "").trim().toLowerCase() === t; });
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
  function imageToDataURL(file, maxDim) {
    maxDim = maxDim || 1400;
    return readAsDataURL(file).then(function (dataUrl) {
      return new Promise(function (res) {
        var img = new Image();
        img.onload = function () {
          var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          var cw = Math.round(img.width * scale), ch = Math.round(img.height * scale);
          var c = document.createElement("canvas");
          c.width = cw; c.height = ch;
          var ctx = c.getContext("2d");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          try { res(c.toDataURL("image/jpeg", 0.85)); } catch (e) { res(dataUrl); }
        };
        img.onerror = function () { res(dataUrl); };
        img.src = dataUrl;
      });
    });
  }
  function readDocument(file) {
    var name = file.name || "document";
    var isPdf = /\.pdf$/i.test(name) || file.type === "application/pdf";
    if (isPdf) {
      return readAsDataURL(file).then(function (dataUrl) {
        var m = /^data:[^;]*;base64,(.*)$/.exec(dataUrl);
        return { name: name, kind: "pdf", data: m ? m[1] : "" };
      });
    }
    return readAsText(file).then(function (txt) { return { name: name, kind: "text", text: txt }; });
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
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    var first = t.indexOf("{"), last = t.lastIndexOf("}");
    if (first >= 0 && last > first) t = t.slice(first, last + 1);
    var obj = JSON.parse(t);
    if (typeof obj.overallScore === "number" && !obj.proficiency) obj.proficiency = levelForScore(obj.overallScore);
    return obj;
  }

  function evaluateSubmission(opts) {
    var apiKey = opts.apiKey, model = opts.model || getModel();
    var reference = opts.reference, submission = opts.submission;
    if (!apiKey) return Promise.reject(new Error("No API key set. Add it on the Proctor page."));

    var content = [];
    content.push({ type: "text", text: buildPrompt(reference) });

    var refImg = reference.diagramDataUrl && dataUrlToImageBlock(reference.diagramDataUrl);
    if (refImg) { content.push({ type: "text", text: "=== REFERENCE SOLUTION DIAGRAM ===" }); content.push(refImg); }

    var teamImg = submission.diagramDataUrl && dataUrlToImageBlock(submission.diagramDataUrl);
    content.push({ type: "text", text: "=== TEAM TOPOLOGY DIAGRAM ===" });
    content.push(teamImg || { type: "text", text: "(no diagram uploaded)" });

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
        var text = (data.content || []).filter(function (b) { return b.type === "text"; })
          .map(function (b) { return b.text; }).join("\n");
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
    return [
      '<div class="result">',
      '  <div class="score-head">',
      '    <div class="big-score">' + esc(result.overallScore) + '<small>/100</small></div>',
      '    <span class="badge lvl-' + esc(lvl.toLowerCase()) + '">' + esc(lvl) + '</span>',
      '    <div class="subscores">',
      '      <span>Diagram <b>' + esc(result.diagramScore != null ? result.diagramScore : "–") + "</b></span>",
      '      <span>Document <b>' + esc(result.documentScore != null ? result.documentScore : "–") + "</b></span>",
      "    </div>",
      "  </div>",
      '  <p class="summary">' + esc(result.summary) + "</p>",
      '  <div class="uc"><h4>1 · Identifying pain points <span class="ucs">' + esc(pp.score != null ? pp.score : "–") + "/100</span></h4>",
      '    <div class="cols"><div><div class="lbl ok">Found</div>' + list(pp.found) + "</div>",
      '      <div><div class="lbl bad">Missed</div>' + list(pp.missed) + "</div></div>",
      "    <p>" + esc(pp.comment) + "</p></div>",
      '  <div class="uc"><h4>2 · Finding the right solution <span class="ucs">' + esc(rs.score != null ? rs.score : "–") + "/100</span></h4>",
      "    <p><b>Alignment with expected:</b> " + esc(rs.alignmentWithReference) + "</p>",
      "    <p>" + esc(rs.comment) + "</p></div>",
      '  <div class="uc"><h4>3 · Uplevel opportunities <span class="ucs">' + esc(up.score != null ? up.score : "–") + "/100</span></h4>",
      '    <div class="cols"><div><div class="lbl ok">They identified</div>' + list(up.identified) + "</div>",
      '      <div><div class="lbl">Could still pursue</div>' + list(up.suggested) + "</div></div>",
      "    <p>" + esc(up.comment) + "</p></div>",
      '  <div class="cols"><div><div class="lbl ok">Strengths</div>' + list(result.strengths) + "</div>",
      '    <div><div class="lbl bad">Gaps</div>' + list(result.gaps) + "</div></div>",
      "</div>",
    ].join("\n");
  }

  // ---- export ---------------------------------------------------------------
  global.ProctorApp = {
    DEFAULT_RUBRIC: DEFAULT_RUBRIC,
    levelForScore: levelForScore, esc: esc, fmtTime: fmtTime, uid: uid,
    getApiKey: getApiKey, setApiKey: setApiKey, getModel: getModel, setModel: setModel,
    // store
    initStore: initStore, storeMode: storeMode, room: room,
    onReference: onReference, onSubmissions: onSubmissions,
    referenceCache: referenceCache, submissionsCache: submissionsCache,
    saveReference: saveReference, saveSubmission: saveSubmission,
    patchSubmission: patchSubmission, latestForTeam: latestForTeam,
    // files + eval + render
    imageToDataURL: imageToDataURL, readDocument: readDocument, readAsText: readAsText,
    evaluateSubmission: evaluateSubmission, renderResult: renderResult,
  };
})(window);
