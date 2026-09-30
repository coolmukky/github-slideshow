// ZTA Design Clinic — live workshop app (Firebase + Firestore, anonymous auth).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, collection, setDoc, getDoc, updateDoc, deleteDoc,
         onSnapshot, serverTimestamp, arrayUnion }
  from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const ACT = window.ACTIVITY;
const CFG = window.FIREBASE_CONFIG;
const TOTAL = 3600;                       // 60 minutes, in seconds
const app  = document.getElementById("app");

// ── theme ──────────────────────────────────────────────────────────────────
document.getElementById("themeBtn").onclick = () => {
  const r = document.documentElement, c = r.getAttribute("data-theme");
  const dark = c === "dark" || (!c && matchMedia("(prefers-color-scheme:dark)").matches);
  r.setAttribute("data-theme", dark ? "light" : "dark");
  try { localStorage.setItem("zta_theme", dark ? "light" : "dark"); } catch(e){}
};
try { const t = localStorage.getItem("zta_theme"); if (t) document.documentElement.setAttribute("data-theme", t); } catch(e){}

// ── tiny helpers ─────────────────────────────────────────────────────────────
const esc = s => { const d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; };
function el(tag, props = {}, ...kids){
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)){
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k === "onclick") n.onclick = v;
    else if (k === "oninput") n.oninput = v;
    else if (k in n) { try { n[k] = v; } catch(e){ n.setAttribute(k, v); } }
    else n.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}
let toastTimer;
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}
async function sha256(str){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";  // no ambiguous chars
const genCode = () => Array.from({length:5}, () => CODE_ALPHABET[Math.floor(Math.random()*CODE_ALPHABET.length)]).join("");
const fmt = s => { s = Math.max(0, s|0); return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); };

// ── level computation (mirrors the Grading Guide) ────────────────────────────
const CORE_MAX = 300, FULL_MAX = 500, PRO_MIN = 210, EXP_MIN = 400;
function computeLevel(ucTotals){
  const core = (ucTotals[1]||0)+(ucTotals[2]||0)+(ucTotals[3]||0);
  const full = [1,2,3,4,5].reduce((a,n)=>a+(ucTotals[n]||0),0);
  const all5 = [1,2,3,4,5].every(n => (ucTotals[n]||0) > 0);
  let level = "Associate";
  if (all5 && full >= EXP_MIN) level = "Expert";
  else if (core >= PRO_MIN) level = "Professional";
  return { core, full, all5, level };
}

// ── firebase init ────────────────────────────────────────────────────────────
let db, auth, uid = null;
function configured(){ return CFG && CFG.apiKey && CFG.apiKey !== "REPLACE_ME"; }

// ── app state ────────────────────────────────────────────────────────────────
const S = {
  code:null, event:null, teams:[], members:[], scores:{}, myMember:null,
  tab:"activity", ucIdx:0, scoreTeam:null, scoreDraft:{}, subs:[]
};
function clearSubs(){ S.subs.forEach(u => { try{u();}catch(e){} }); S.subs = []; }
const isProctor = () => !!(S.event && uid && (S.event.proctorUids||[]).includes(uid));

// ── router ───────────────────────────────────────────────────────────────────
function route(){
  const m = (location.hash || "").match(/^#\/e\/([A-Z0-9]{4,8})/i);
  if (m) enterEvent(m[1].toUpperCase());
  else { clearSubs(); S.code=null; S.event=null; renderHome(); }
}
window.addEventListener("hashchange", route);

// ── HOME: create or join ─────────────────────────────────────────────────────
function renderHome(){
  setTop("Live Workshop", "Create an event, or join with a code.", []);
  const create = el("div", {class:"card"},
    el("h2", {}, "Start a workshop"),
    el("p", {class:"note", style:"margin:6px 0 14px"}, "For proctors. Creates an event and a join code to share with teams."),
    field("Event title", el("input", {id:"evTitle", type:"text", placeholder:"ZTA Design Clinic — Oct 2026", value:"ZTA Design Clinic"})),
    field("Proctor PIN (to run it on any device)", el("input", {id:"evPin", type:"text", inputmode:"numeric", placeholder:"e.g. 4821", autocomplete:"off"})),
    el("div", {class:"row-btns"}, el("button", {class:"primary", onclick:doCreate}, "Create event"))
  );
  const join = el("div", {class:"card"},
    el("h2", {}, "Join a workshop"),
    el("p", {class:"note", style:"margin:6px 0 14px"}, "For participants. Ask your proctor for the 5-character code."),
    field("Event code", el("input", {id:"joinCode", type:"text", maxlength:"8", placeholder:"ABCDE",
      style:"text-transform:uppercase;letter-spacing:.2em;font-family:'IBM Plex Mono',monospace", autocomplete:"off"})),
    el("div", {class:"row-btns"}, el("button", {class:"primary", onclick:doJoin}, "Join event"))
  );
  render(el("div", {class:"grid2"}, create, join));
  if (!configured())
    app.prepend(el("div", {class:"card", style:"border-color:var(--danger);margin-bottom:16px"},
      el("h3", {}, "⚠ Firebase not configured"),
      el("p", {class:"note"}, "Edit public/config.js with your Firebase project values, then redeploy. See DEPLOY.md.")));
}
function field(labelText, input){ return el("div", {class:"field"}, el("label", {}, labelText), input); }

async function doCreate(){
  if (!ensureReady()) return;
  const title = (document.getElementById("evTitle").value || "ZTA Design Clinic").trim();
  const pin = (document.getElementById("evPin").value || "").trim();
  let code, exists = true, tries = 0;
  do { code = genCode(); exists = (await getDoc(doc(db,"events",code))).exists(); } while (exists && ++tries < 8);
  const pinHash = pin ? await sha256(pin) : "";
  await setDoc(doc(db,"events",code), {
    title, code, status:"lobby", pinHash, proctorUids:[uid],
    createdAt: serverTimestamp(), startedAt:null, endsAtMillis:null
  });
  try { localStorage.setItem("zta_proctor_"+code, "1"); } catch(e){}
  location.hash = "#/e/" + code;
}
async function doJoin(){
  if (!ensureReady()) return;
  const code = (document.getElementById("joinCode").value || "").trim().toUpperCase();
  if (code.length < 4) return toast("Enter the event code.");
  const snap = await getDoc(doc(db,"events",code));
  if (!snap.exists()) return toast("No event with that code.");
  location.hash = "#/e/" + code;
}

// ── EVENT: subscribe + render ────────────────────────────────────────────────
function enterEvent(code){
  if (S.code === code && S.event) { renderEvent(); return; }
  clearSubs(); S.code = code; S.event = null; S.teams = []; S.members = []; S.scores = {}; S.myMember = null;
  render(el("div", {class:"card"}, el("p", {class:"muted"}, "Loading event…")));
  S.subs.push(onSnapshot(doc(db,"events",code), d => {
    if (!d.exists()){ toast("Event not found."); location.hash = "#/"; return; }
    S.event = d.data(); renderEvent();
  }, err => showError(err)));
  S.subs.push(onSnapshot(collection(db,"events",code,"teams"), q => {
    S.teams = q.docs.map(d => ({ id:d.id, ...d.data() })); renderEvent();
  }));
  S.subs.push(onSnapshot(collection(db,"events",code,"members"), q => {
    S.members = q.docs.map(d => ({ id:d.id, ...d.data() }));
    S.myMember = S.members.find(m => m.id === uid) || null; renderEvent();
  }));
  S.subs.push(onSnapshot(collection(db,"events",code,"scores"), q => {
    S.scores = {}; q.docs.forEach(d => S.scores[d.id] = d.data()); renderEvent();
  }));
}

function setTop(title, sub, infoNodes){
  document.getElementById("topTitle").textContent = title;
  document.getElementById("topSub").textContent = sub;
  const info = document.getElementById("topInfo"); info.innerHTML = "";
  (infoNodes||[]).forEach(n => info.append(n));
}

function renderEvent(){
  if (!S.event) return;
  const e = S.event, statusLabel = {lobby:"Lobby", running:"Running", closed:"Closed"}[e.status] || e.status;
  const info = [
    el("span", {class:"codechip"}, e.code),
    el("span", {class:"pill"}, el("span", {class:"status-"+e.status}, "● "), statusLabel),
  ];
  if (e.status === "running") info.push(el("span", {class:"pill mono", id:"topTimer"}, "—:—"));
  info.push(el("button", {class:"ghost", onclick:()=>{location.hash="#/";}}, "Leave"));
  setTop(e.title || "Design Clinic", isProctor() ? "Proctor console" : "Participant", info);

  if (isProctor()) renderProctor();
  else if (!S.myMember) renderJoinForm();
  else renderParticipant();
  startTicker();
}

// ── participant: choose name + team ──────────────────────────────────────────
function renderJoinForm(){
  const teamButtons = S.teams.length
    ? el("div", {class:"row-btns", style:"margin:6px 0 4px"},
        S.teams.map(t => el("button", {onclick:()=>joinTeam(t.id), class:"ghost"}, t.name)))
    : el("p", {class:"note"}, "No teams yet — create the first one.");
  render(el("div", {class:"center"}, el("div", {class:"card"},
    el("h2", {}, "Join ", el("span", {class:"mono", style:"color:var(--accent)"}, S.event.code)),
    field("Your name", el("input", {id:"pName", type:"text", placeholder:"Alex Rao", autocomplete:"off"})),
    el("label", {}, "Pick your team"),
    teamButtons,
    el("div", {class:"field", style:"margin-top:10px;display:flex;gap:8px"},
      el("input", {id:"newTeam", type:"text", placeholder:"…or create a new team"}),
      el("button", {class:"primary", onclick:createTeam, style:"white-space:nowrap"}, "Create & join")),
    el("p", {class:"note"}, S.event.status==="closed" ? "This workshop is closed." : "")
  )));
}
function nameVal(){ const v = (document.getElementById("pName")?.value||"").trim(); if(!v) toast("Enter your name first."); return v; }
async function createTeam(){
  const nm = nameVal(); if (!nm) return;
  const tn = (document.getElementById("newTeam").value||"").trim(); if (!tn) return toast("Enter a team name.");
  const ref = doc(collection(db,"events",S.code,"teams"));
  await setDoc(ref, { name:tn, createdAt:serverTimestamp(), progress:{}, submission:{} });
  await joinTeam(ref.id, nm);
}
async function joinTeam(teamId, nm){
  nm = nm || nameVal(); if (!nm) return;
  await setDoc(doc(db,"events",S.code,"members",uid), { name:nm, teamId, joinedAt:serverTimestamp() });
  S.tab = "activity";
}

// ── participant: main ────────────────────────────────────────────────────────
function renderParticipant(){
  const e = S.event, team = S.teams.find(t => t.id === S.myMember.teamId);
  const teammates = S.members.filter(m => m.teamId === S.myMember.teamId);
  const header = el("div", {class:"card", style:"margin-bottom:16px"},
    el("div", {style:"display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"},
      el("div", {},
        el("div", {class:"note"}, "Your team"),
        el("h2", {}, team ? team.name : "—"),
        el("div", {class:"note"}, teammates.map(m=>m.name).join(" · "))),
      levelBadgeFor(S.myMember.teamId)));

  const tabs = tabbar(["activity","leaderboard"], {activity:"The activity", leaderboard:"Leaderboard"});
  let panel;
  if (S.tab === "leaderboard") panel = leaderboardCard();
  else if (e.status === "lobby") panel = el("div", {class:"card"},
      el("h2", {}, "You're in. Sit tight."),
      el("p", {}, "The proctor hasn't started the workshop yet. When they do, your 60-minute activity begins here."),
      el("p", {class:"note"}, "Meanwhile: assign your four roles (NetOps · Information Security · Compliance · Scribe) and skim the customer background."));
  else if (e.status === "closed") panel = el("div", {class:"stack"},
      el("div", {class:"card"}, el("h2", {}, "Workshop closed"),
        el("p", {}, "Thanks! Your final result is below. See the leaderboard for the full standings."),
        scoreSummary(S.myMember.teamId)),
      leaderboardCard());
  else panel = runnerCard(team);   // running

  render(el("div", {}, header, tabs, panel));
}

function levelBadgeFor(teamId){
  const sc = S.scores[teamId];
  const lv = sc?.level || null;
  return el("span", {class:"lv " + (lv ? "lv-"+lv : "lv-none")}, lv || "Not scored");
}

// ── participant: the runner (timer + use cases + steps) ──────────────────────
function runnerCard(team){
  const e = S.event;
  const timeline = el("div", {class:"timeline", id:"ptl"},
    ACT.timeline.map((p,i) => el("div", {class:"ph", "data-i":i},
      el("div", {class:"t"}, p.t), el("div", {class:"n"}, p.phase), el("div", {class:"bar"}))));

  const uctabs = el("div", {class:"uctabs"},
    ACT.uc.map((u,i) => {
      const done = !!(team?.progress && team.progress[u.n]);
      return el("button", {class:"uctab"+(i===S.ucIdx?"":"")+(done?" done":""),
        "aria-selected": i===S.ucIdx ? "true":"false",
        onclick:()=>{ S.ucIdx=i; renderParticipant(); }}, "UC"+u.n+(done?" ✓":""));
    }));

  const u = ACT.uc[S.ucIdx];
  const done = !!(team?.progress && team.progress[u.n]);
  const panel = el("div", {class:"card"},
    el("div", {style:"display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"},
      el("h2", {}, "Use Case #"+u.n+": "+u.title),
      el("span", {class:"chip "+(u.kind==="Required"?"req":"bonus")}, u.kind)),
    el("div", {class:"grid2", style:"margin-top:14px"},
      el("div", {}, el("h3", {}, "Customer requirements"), list(u.req)),
      el("div", {}, el("h3", {}, "Pain points"), list(u.pains))),
    el("div", {style:"margin-top:16px"}, el("h3", {}, "Your group's tasks"), list(u.tasks)),
    el("div", {style:"margin-top:18px"},
      el("h3", {}, "Your team's answer for UC"+u.n),
      el("p", {class:"note", style:"margin:0 0 8px"}, "Proposed Cisco solution and products (how & why), and how it addresses each requirement and pain point."),
      el("textarea", {id:"ans-"+u.n, rows:"5", placeholder:"e.g. Use ISE + SGTs instead of VLANs because…",
        value:(team?.answers?.[u.n])||""}),
      el("button", {class:"primary", style:"margin-top:8px", onclick:()=>saveAnswer(u.n)}, "Save answer")),
    el("div", {style:"display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"},
      el("button", {class:done?"":"primary", onclick:()=>toggleProgress(u.n)}, done?"✓ Marked done":"Mark this use case done"),
      el("button", {class:"ghost", onclick:()=>{S.ucIdx=(S.ucIdx+1)%ACT.uc.length;renderParticipant();}}, "Next →")));

  const submit = el("div", {class:"card"},
    el("h3", {}, "Submit your work"),
    el("p", {class:"note", style:"margin:0 0 10px"}, "Paste a link to your diagram (Cisco Circuit / photo) and any notes. Your proctor reviews this to score you."),
    el("div", {class:"field"}, el("input", {id:"subLink", type:"url", placeholder:"https://… diagram link",
      value:(team?.submission?.link)||""})),
    el("div", {class:"field"}, el("input", {id:"subNote", type:"text", placeholder:"Notes for the proctor",
      value:(team?.submission?.note)||""})),
    el("button", {class:"primary", onclick:saveSubmission}, "Save submission"));

  const rail = el("aside", {class:"stack"},
    el("div", {class:"card"}, el("h3", {}, "Your 7 steps"),
      el("ul", {class:"list"}, ACT.steps.map((s,i)=>el("li", {}, el("b",{},(i+1)+". "+s.t+" "), s.d)))),
    submit);

  return el("div", {}, timeline, el("div", {class:"grid-side"},
    el("main", {}, uctabs, panel), rail));
}
async function toggleProgress(n){
  const team = S.teams.find(t => t.id === S.myMember.teamId); if (!team) return;
  const prog = { ...(team.progress||{}) }; prog[n] = !prog[n];
  await updateDoc(doc(db,"events",S.code,"teams",team.id), { progress: prog });
}
async function saveAnswer(n){
  const team = S.teams.find(t => t.id === S.myMember.teamId); if (!team) return;
  const val = (document.getElementById("ans-"+n).value||"").trim();
  const answers = { ...(team.answers||{}) }; answers[n] = val;
  await updateDoc(doc(db,"events",S.code,"teams",team.id), { answers });
  toast("Answer saved for UC"+n);
}
async function saveSubmission(){
  const team = S.teams.find(t => t.id === S.myMember.teamId); if (!team) return;
  const link = (document.getElementById("subLink").value||"").trim();
  const note = (document.getElementById("subNote").value||"").trim();
  await updateDoc(doc(db,"events",S.code,"teams",team.id), { submission:{ link, note, at:Date.now() } });
  toast("Submission saved.");
}

// ── proctor console ──────────────────────────────────────────────────────────
function renderProctor(){
  const e = S.event;
  const controls = el("div", {class:"card", style:"margin-bottom:16px"},
    el("div", {style:"display:flex;gap:16px;align-items:center;flex-wrap:wrap"},
      el("div", {}, el("div",{class:"note"},"Event code — share to join"),
        el("div", {style:"display:flex;gap:10px;align-items:center;margin-top:4px"},
          el("span",{class:"codechip",style:"font-size:22px"}, e.code),
          el("button",{class:"ghost",onclick:copyJoin},"Copy join link"))),
      el("div", {class:"spacer"}),
      el("div", {style:"text-align:right"},
        el("div",{class:"note"},"Time remaining"),
        el("div",{class:"timer",id:"pTimer"}, e.status==="running" ? "—:—" : "60:00")),
      el("div", {class:"row-btns"},
        e.status!=="running"
          ? el("button",{class:"primary",onclick:startWorkshop}, e.status==="closed"?"Restart":"Start workshop")
          : el("button",{class:"danger",onclick:closeWorkshop},"Close workshop"))),
    el("details",{style:"margin-top:12px"},
      el("summary",{},"Show join QR"),
      el("div",{id:"qrbox",class:"qr"}),
      el("p",{class:"note",style:"text-align:center;margin:6px 0 0"},"Attendees scan to join event ",el("b",{},e.code))),
    el("p",{class:"note",style:"margin:12px 0 0"},
      e.status==="lobby"?"Teams can join now. Press Start to begin the 60-minute clock.":
      e.status==="running"?"Workshop is live. Participants see the runner and timer.":
      "Workshop is closed. Scores are final; you can still adjust them below."));
  setTimeout(renderQR, 0);

  const tabs = tabbar(["roster","leaderboard","evaluate"], {roster:"Teams & roster", leaderboard:"Leaderboard", evaluate:"Evaluate & score"});
  let panel;
  if (S.tab === "leaderboard") panel = leaderboardCard();
  else if (S.tab === "evaluate") panel = evaluateCard();
  else panel = rosterCard();

  render(el("div", {}, controls, tabs, panel));
}
function joinUrl(){ return location.origin + location.pathname + "#/e/" + S.code; }
function copyJoin(){
  const url = joinUrl();
  navigator.clipboard?.writeText(url).then(()=>toast("Join link copied"), ()=>toast(url));
}
function renderQR(){
  const box = document.getElementById("qrbox");
  if (!box || !window.QRCode) return;
  box.innerHTML = "";
  try { new QRCode(box, { text: joinUrl(), width:160, height:160, correctLevel: QRCode.CorrectLevel.M }); } catch(e){}
}
async function startWorkshop(){
  await updateDoc(doc(db,"events",S.code), { status:"running", startedAt:serverTimestamp(), endsAtMillis: Date.now()+TOTAL*1000 });
  toast("Workshop started — 60 minutes.");
}
async function closeWorkshop(){
  if (!confirm("Close the workshop for everyone?")) return;
  await updateDoc(doc(db,"events",S.code), { status:"closed" });
  toast("Workshop closed.");
}

function rosterCard(){
  if (!S.teams.length) return el("div",{class:"card"}, el("p",{class:"muted"},"No teams yet. Share the code — teams appear here as they join."));
  return el("div",{class:"card"}, el("h2",{},"Teams & roster"),
    el("table",{}, el("thead",{}, el("tr",{},
      el("th",{},"Team"), el("th",{},"Members"), el("th",{},"Progress"), el("th",{},"Submission"), el("th",{},"Level"))),
      el("tbody",{}, S.teams.map(t => {
        const mem = S.members.filter(m=>m.teamId===t.id);
        const prog = [1,2,3,4,5].filter(n=>t.progress&&t.progress[n]).length;
        const sub = t.submission&&t.submission.link
          ? el("a",{href:t.submission.link,target:"_blank",rel:"noopener"},"link")
          : el("span",{class:"note"}, t.submission&&t.submission.note ? "note only" : "—");
        return el("tr",{},
          el("td",{class:"tnum",style:"font-weight:600"}, t.name),
          el("td",{}, mem.length ? mem.map(m=>m.name).join(", ") : el("span",{class:"note"},"—")),
          el("td",{class:"tnum"}, prog+"/5"),
          el("td",{}, sub),
          el("td",{}, levelBadgeFor(t.id)));
      }))));
}

// ── leaderboard ──────────────────────────────────────────────────────────────
function leaderboardCard(){
  const rows = S.teams.map(t => {
    const sc = S.scores[t.id];
    return { name:t.name, members:S.members.filter(m=>m.teamId===t.id).length,
             full: sc?sc.full:0, core: sc?sc.core:0, level: sc?sc.level:null, scored: !!sc };
  }).sort((a,b) => (b.full-a.full) || (b.core-a.core) || a.name.localeCompare(b.name));
  if (!rows.length) return el("div",{class:"card"}, el("p",{class:"muted"},"No teams yet."));
  return el("div",{class:"card"}, el("h2",{},"Leaderboard"),
    el("table",{}, el("thead",{}, el("tr",{},
      el("th",{},"#"), el("th",{},"Team"), el("th",{},"People"), el("th",{},"Required /300"), el("th",{},"Full /500"), el("th",{},"Level"))),
      el("tbody",{}, rows.map((r,i) => el("tr",{},
        el("td",{class:"rank"}, r.scored?("#"+(i+1)):"—"),
        el("td",{style:"font-weight:600"}, r.name),
        el("td",{class:"tnum"}, r.members),
        el("td",{class:"tnum"}, r.scored?r.core:"—"),
        el("td",{class:"tnum"}, r.scored?r.full:"—"),
        el("td",{}, el("span",{class:"lv "+(r.level?"lv-"+r.level:"lv-none")}, r.level||"Not scored")))))),
    el("p",{class:"note",style:"margin-top:10px"},
      "Level is cumulative: Associate (3 required, <70%) · Professional (3 required, ≥70% of 300) · Expert (all 5, ≥80% of 500)."));
}
function scoreSummary(teamId){
  const sc = S.scores[teamId];
  if (!sc) return el("p",{class:"note"},"Not scored yet.");
  return el("div",{style:"display:flex;gap:20px;align-items:baseline;flex-wrap:wrap;margin-top:8px"},
    el("div",{}, el("div",{class:"note"},"Required /300"), el("div",{class:"big"}, String(sc.core))),
    el("div",{}, el("div",{class:"note"},"Full /500"), el("div",{class:"big"}, String(sc.full))),
    el("div",{}, el("div",{class:"note"},"Level"), el("div",{style:"margin-top:6px"}, el("span",{class:"lv lv-"+sc.level}, sc.level))));
}

// ── proctor: evaluate & score ────────────────────────────────────────────────
function evaluateCard(){
  if (!S.teams.length) return el("div",{class:"card"}, el("p",{class:"muted"},"No teams to score yet."));
  const pick = el("div",{class:"card",style:"margin-bottom:16px"},
    el("h2",{},"Evaluate & score"),
    el("p",{class:"note",style:"margin:4px 0 12px"},"Pick a team, score each use case (Mapping 40 · Products 30 · Diagram 30). The level is computed automatically."),
    el("div",{class:"row-btns"}, S.teams.map(t =>
      el("button",{class:(S.scoreTeam===t.id?"primary":"ghost"),onclick:()=>{S.scoreTeam=t.id;renderProctor();}}, t.name))));
  if (!S.scoreTeam) return el("div",{}, pick);

  const t = S.teams.find(x=>x.id===S.scoreTeam);
  if (!t){ S.scoreTeam=null; return el("div",{},pick); }
  const existing = S.scores[t.id];
  const draft = S.scoreDraft[t.id] || (S.scoreDraft[t.id] = seedDraft(existing));

  const grid = el("div",{class:"scoregrid"},
    el("div",{class:"hd"},"Use case"), el("div",{class:"hd"},"Mapping /40"),
    el("div",{class:"hd"},"Products /30"), el("div",{class:"hd"},"Diagram /30"), el("div",{class:"hd"},"Total"),
    ...ACT.uc.flatMap(u => {
      const d = draft[u.n];
      const mk = (key,max) => el("input",{type:"number",min:"0",max:String(max),inputmode:"numeric",
        value: d[key]===0&&!d._touched?.[key] ? "" : String(d[key]),
        oninput:(e)=>{ d[key]=clamp(e.target.value,max); (d._touched||(d._touched={}))[key]=true; updateTotals(t.id); }});
      return [
        el("div",{class:"uc-row-label"}, "UC"+u.n+" "+(u.kind==="Bonus"?"·B":"")),
        mk("m",40), mk("p",30), mk("d",30),
        el("div",{class:"tnum",id:"tot-"+t.id+"-"+u.n,style:"text-align:center;font-weight:600"}, String((d.m||0)+(d.p||0)+(d.d||0)))
      ];
    }));

  const totalsLine = el("div",{id:"draftTotals-"+t.id,style:"margin-top:16px"});
  const save = el("div",{class:"row-btns",style:"margin-top:16px"},
    el("button",{class:"primary",onclick:()=>saveScore(t.id)},"Save score"),
    el("button",{class:"ghost",onclick:()=>{S.scoreTeam=null;renderProctor();}},"Done"));

  const answers = t.answers || {};
  const answerBlock = el("div",{style:"margin:6px 0 14px"},
    ACT.uc.map(u => answers[u.n]
      ? el("details",{}, el("summary",{}, "UC"+u.n+" — "+u.title+" · team's answer"), el("p",{}, answers[u.n]))
      : null));

  const card = el("div",{class:"card"},
    el("h2",{}, "Scoring: "+t.name),
    (t.submission&&(t.submission.link||t.submission.note)
      ? el("p",{class:"note",style:"margin:2px 0 8px"}, "Submission: ",
          t.submission.link?el("a",{href:t.submission.link,target:"_blank",rel:"noopener"},"diagram link"):"(no link) ",
          t.submission.note?(" — "+t.submission.note):"")
      : el("p",{class:"note",style:"margin:2px 0 8px"},"No diagram link submitted.")),
    answerBlock,
    grid, totalsLine, save);
  setTimeout(()=>updateTotals(t.id),0);
  return el("div",{}, pick, card);
}
function seedDraft(existing){
  const d = {}; [1,2,3,4,5].forEach(n=>{
    const s = existing?.uc?.[n]; d[n] = { m:s?.m||0, p:s?.p||0, d:s?.d||0, _touched:s?{m:true,p:true,d:true}:{} };
  }); return d;
}
const clamp = (v,max)=>Math.max(0,Math.min(max, parseInt(v,10)||0));
function updateTotals(teamId){
  const d = S.scoreDraft[teamId]; if (!d) return;
  const ucTotals = {};
  [1,2,3,4,5].forEach(n=>{ const t=(d[n].m||0)+(d[n].p||0)+(d[n].d||0); ucTotals[n]=t;
    const cell=document.getElementById("tot-"+teamId+"-"+n); if(cell) cell.textContent=String(t); });
  const {core,full,level,all5} = computeLevel(ucTotals);
  const line = document.getElementById("draftTotals-"+teamId);
  if (line) line.innerHTML = "";
  if (line) line.append(
    el("div",{style:"display:flex;gap:20px;align-items:baseline;flex-wrap:wrap"},
      el("div",{}, el("span",{class:"note"},"Required /300 "), el("b",{},String(core))),
      el("div",{}, el("span",{class:"note"},"Full /500 "), el("b",{},String(full))),
      el("div",{}, el("span",{class:"note"},"All five attempted "), el("b",{}, all5?"yes":"no")),
      el("div",{}, el("span",{class:"lv lv-"+level}, level))));
}
async function saveScore(teamId){
  const d = S.scoreDraft[teamId]; if (!d) return;
  const uc = {}, ucTotals = {};
  [1,2,3,4,5].forEach(n=>{ uc[n]={m:d[n].m||0,p:d[n].p||0,d:d[n].d||0,total:(d[n].m||0)+(d[n].p||0)+(d[n].d||0)}; ucTotals[n]=uc[n].total; });
  const {core,full,level,all5} = computeLevel(ucTotals);
  await setDoc(doc(db,"events",S.code,"scores",teamId), { uc, core, full, level, all5, at:Date.now() });
  toast("Score saved: "+level+" ("+full+"/500)");
}

// ── shared UI bits ───────────────────────────────────────────────────────────
function tabbar(keys, labels){
  return el("div",{class:"tabs"}, keys.map(k =>
    el("button",{class:"tab","aria-selected":S.tab===k?"true":"false",onclick:()=>{S.tab=k;isProctor()?renderProctor():renderParticipant();}}, labels[k])));
}
function list(items){ return el("ul",{class:"list"}, items.map(x=>el("li",{},x))); }
function render(node){ app.innerHTML=""; app.append(node); }
function showError(err){ render(el("div",{class:"card"}, el("h3",{},"Something went wrong"), el("p",{class:"note"}, esc(err.message||String(err))))); }

// ── ticker (timer + phases), updates DOM in place ────────────────────────────
let ticker;
function startTicker(){ if (ticker) return; ticker = setInterval(tick, 1000); tick(); }
function tick(){
  const e = S.event; if (!e) return;
  let rem = TOTAL;
  if (e.status==="running" && e.endsAtMillis) rem = Math.max(0, Math.round((e.endsAtMillis - Date.now())/1000));
  else if (e.status==="closed") rem = 0;
  const txt = fmt(rem);
  for (const id of ["pTimer","topTimer"]){ const n=document.getElementById(id); if(n){ n.textContent=txt; n.classList.toggle("warn",rem<=600&&rem>0); n.classList.toggle("over",rem===0);} }
  const tl = document.getElementById("ptl"); if (tl && e.status==="running"){
    const elapsed = TOTAL - rem, starts = ACT.phaseStarts; let idx=-1;
    for (let i=0;i<starts.length;i++) if (elapsed>=starts[i]) idx=i;
    tl.querySelectorAll(".ph").forEach((c,i)=>{ c.classList.toggle("active",i===idx); c.classList.toggle("past",idx>-1&&i<idx);
      const bar=c.querySelector(".bar");
      if(i<idx) bar.style.width="100%";
      else if(i===idx){ const s0=starts[i],s1=(i+1<starts.length)?starts[i+1]:TOTAL; bar.style.width=Math.min(100,Math.max(0,((elapsed-s0)/(s1-s0))*100))+"%"; }
      else bar.style.width="0"; });
  }
}

// ── boot ─────────────────────────────────────────────────────────────────────
function ensureReady(){ if (!configured()){ toast("Configure Firebase first (see DEPLOY.md)."); return false; } if (!uid){ toast("Connecting… try again in a second."); return false; } return true; }
function start(){
  if (!configured()){ renderHome(); return; }
  try {
    db = getFirestore(initializeApp(CFG)); auth = getAuth();
    onAuthStateChanged(auth, u => { if (u){ uid = u.uid; route(); } });
    signInAnonymously(auth).catch(err => showError(new Error("Anonymous sign-in failed: "+err.message+" — enable Anonymous auth in Firebase.")));
  } catch(err){ showError(err); }
}
start();
