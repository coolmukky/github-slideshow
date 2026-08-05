/* =====================================================================
 * build_deck.js — canonical copy of the storyboard + a Node deck builder.
 *
 * The STORY object below is the SINGLE SOURCE OF TRUTH for the fable and the
 * "In Cisco Terms" decoder copy. It is mirrored, verbatim, in
 * page/index.html — the two must always be edited together. (This file is
 * generated so the two stay identical; see scripts/build_embed.py notes.)
 *
 * Run under Node to emit a standalone, scrollable linear deck:
 *     node deck/build_deck.js        ->  writes deck/deck.html
 * ===================================================================== */

const STORY = {
  meta:{
    kicker:"A Zero Trust Fable",
    title:"The Kingdom of Cleartext",
    sub:"How a walled realm learned to trust no one — and everyone learned to prove themselves. A storyboard that decodes an old fable into Cisco Zero Trust architecture.",
  },
  chapters:[
    {
      numeral:"I", title:"The Crumbling Wall", theme:"Perimeter",
      tagline:"Why a wall that trusts everyone within is no wall at all.",
      panels:[
        {code:"1.1", id:"p11", caption:"One wall, one moat",
         story:"For a hundred years the realm slept behind a single great wall and a black moat. Within that ring no traveler was questioned — to stand inside the wall was to be trusted, and that was the whole of the law.",
         cisco:"The classic perimeter model: a hardened edge — firewall and VPN — around a soft, flat interior. Whatever was already inside the network was implicitly trusted, and east–west traffic went largely uninspected.",
         tags:["Perimeter","Implicit trust","Flat network"]},
        {code:"1.2", id:"p12", caption:"A hundred gates, a thousand keys",
         story:"But the great wall had a hundred small gates, and every gate had a key, and every key had been copied and copied again. A single borrowed key opened not one door but the whole realm behind it.",
         cisco:"Shared credentials, broad VPN tunnels, and flat VLANs mean one stolen key unlocks everything. Password reuse and over-broad access turn a single secret into keys to the entire kingdom.",
         tags:["Shared credentials","VPN sprawl","Over-broad access"]},
        {code:"1.3", id:"p13", caption:"The thief who was never stopped",
         story:"At dusk a thief slipped through a servant’s gate. No one barred the way, for he was already inside; unquestioned, he walked the length of the realm straight to the glittering treasury.",
         cisco:"This is lateral movement. An attacker who phishes one account or breaches one host pivots freely across a flat, trusting network — from a low-value foothold to the crown-jewel assets.",
         tags:["Lateral movement","Phishing","Blast radius"]},
        {code:"1.4", id:"p14", caption:"The Sovereign’s reckoning",
         story:"The Sovereign stood upon the cracked rampart and saw the truth at last: a wall that trusts all who stand within it is no wall at all. The old law would have to be unwritten.",
         cisco:"The founding premise of Zero Trust: never trust, always verify. Remove trust granted purely by network location. “Inside” can no longer mean “safe.”",
         tags:["Zero Trust","Never trust","Assume breach"]},
      ]
    },
    {
      numeral:"II", title:"Every Traveler Named", theme:"Identity",
      tagline:"The name became the new gate — and a name alone was never enough.",
      panels:[
        {code:"2.1", id:"p21", caption:"No one passes unnamed",
         story:"The Sovereign summoned the Herald and set a new decree upon every gate: none shall pass unnamed. Each traveler must first declare who they are and prove the claim before a single bolt is drawn.",
         cisco:"Strong identity becomes the new perimeter. Every user, device, and workload must authenticate before access. Cisco ISE authenticates network access with 802.1X and RADIUS at the point of entry.",
         tags:["Identity-first","Authentication","Cisco ISE"]},
        {code:"2.2", id:"p22", caption:"A name and a second sign",
         story:"A name alone could be borrowed, so the Herald demanded a second sign — a sigil the true bearer alone could show. A stolen name without its sigil opened nothing at all.",
         cisco:"Multi-factor authentication (Cisco Duo): something you know plus something you have. A password by itself — even a correct one — is no longer enough to pass the gate.",
         tags:["MFA","Cisco Duo","Phishing-resistant"]},
        {code:"2.3", id:"p23", caption:"Proven, and proven whole",
         story:"Even a proven name did not suffice. The Herald looked to each traveler’s bearing and health — their wounds, their fevers — and turned away any who might carry rot within the walls.",
         cisco:"Device trust and posture: Duo Device Trust and ISE posture checks verify patch level, disk encryption, and management state. An identity on a sick or unmanaged device is granted less — or nothing.",
         tags:["Device posture","Endpoint trust","Health check"]},
        {code:"2.4", id:"p24", caption:"Named again at every door",
         story:"And names were not checked once but at every threshold, for a traveler honest at dawn may be turned by dusk. Trust, the Herald wrote, is a question asked again and again.",
         cisco:"Continuous authentication. Trust is re-evaluated at every access request, not granted once at login and left standing. Sessions are short-lived and constantly re-verified.",
         tags:["Continuous auth","Re-verification","Session trust"]},
      ]
    },
    {
      numeral:"III", title:"Seals and Sigils", theme:"Least Privilege",
      tagline:"A right the baker did not need was a right the baker was never given.",
      panels:[
        {code:"3.1", id:"p31", caption:"The realm, carved into wards",
         story:"The realm was carved into many small wards, each ringed by its own low wall, and each traveler’s sigil named only the doors they were meant to open — no more.",
         cisco:"Segmentation and least privilege. Cisco TrustSec assigns Security Group Tags (SGTs) that travel with identity, carving one flat network into many enforced segments.",
         tags:["Segmentation","TrustSec","SGT"]},
        {code:"3.2", id:"p32", caption:"The baker at the armory door",
         story:"The baker’s sigil opened the granary and the mill, but never the armory. A right the baker did not need was a right the baker was never given.",
         cisco:"Least-privilege, role-based policy. A Security Group ACL lets “Baker” reach “Granary” and denies “Armory” — enforced by role, not by IP address or where the traveler happens to stand.",
         tags:["Least privilege","SGACL","Role-based"]},
        {code:"3.3", id:"p33", caption:"A fire that could not spread",
         story:"When fire took the middle ward, the inner gates held fast, and the flames found no road into the wards beside it. What burned, burned alone.",
         cisco:"Micro- and macro-segmentation contain blast radius. East–west traffic between segments is inspected and filtered (Secure Firewall, SD-Access), so a breach in one zone cannot spill into the next.",
         tags:["Blast radius","East–west","Containment"]},
        {code:"3.4", id:"p34", caption:"One door, two verdicts",
         story:"The same door judged each traveler differently, reading the role written in their sigil — the same threshold an open way for one and a barred one for the next.",
         cisco:"Group-based policy: a single destination enforces different rules per source group. Policy follows identity, not topology — the answer depends on who is asking, not the wire they arrive by.",
         tags:["Group policy","Identity-based","Context-aware"]},
      ]
    },
    {
      numeral:"IV", title:"The Watchful Eye", theme:"Continuous Verification",
      tagline:"Not to punish, but to see — an eye that never closes.",
      panels:[
        {code:"4.1", id:"p41", caption:"The eye that never closes",
         story:"The Sovereign raised the Sentinel, whose single eye never closed, to watch every road and every ward of the realm at once — not to punish, but to see.",
         cisco:"Continuous monitoring and telemetry. Cisco Secure Network Analytics (Stealthwatch) watches all traffic and baselines what normal looks like across the whole environment.",
         tags:["Monitoring","Telemetry","Secure Network Analytics"]},
        {code:"4.2", id:"p42", caption:"The map that never sleeps",
         story:"The Cartographer drew a living map that redrew itself as travelers moved, so that no journey through the realm went unseen or unrecorded.",
         cisco:"Full visibility. NetFlow and telemetry build a live map of who talks to what, while Cisco Umbrella inspects and logs DNS as the very first hop of every connection.",
         tags:["Visibility","NetFlow","Cisco Umbrella"]},
        {code:"4.3", id:"p43", caption:"The path that bent wrong",
         story:"When a courier’s path bent strangely — from the granary road toward the armory it had no cause to seek — the Sentinel marked it in the same breath.",
         cisco:"Behavioral anomaly detection. A host that suddenly scans or reaches a segment it never touches raises an alert — Encrypted Traffic Analytics flags it from patterns alone, without decrypting the payload.",
         tags:["Anomaly detection","Behavioral baseline","ETA"]},
        {code:"4.4", id:"p44", caption:"Seen, and answered",
         story:"What the eye saw, the gates obeyed. A traveler turned suspect had their sigil dimmed at once, their doors quietly closing before any harm was done.",
         cisco:"Automated response. XDR / SecureX orchestration revokes access through ISE — Rapid Threat Containment — the moment risk rises, quarantining a host without waiting for a human hand.",
         tags:["Automated response","Rapid Threat Containment","XDR"]},
      ]
    },
    {
      numeral:"V", title:"The Living Charter", theme:"Adaptive Policy",
      tagline:"Trust was no longer a wall to stand behind, but a tide.",
      panels:[
        {code:"5.1", id:"p51", caption:"Laws that rewrite themselves",
         story:"The old laws were carved in stone and never changed. The new Charter was written on living vellum, made to rewrite itself the moment the realm learned something new.",
         cisco:"Policy as code and adaptive policy. Cisco SD-Access and Catalyst Center express intent centrally and push it everywhere automatically — no more hand-editing rules gate by gate.",
         tags:["Policy as code","SD-Access","Intent-based"]},
        {code:"5.2", id:"p52", caption:"One gate teaches all",
         story:"When a single gate learned the face of a new deceiver at dawn, the Charter taught every other gate before nightfall. No lesson was learned twice.",
         cisco:"Coordinated, automated response. A verdict from one control — Umbrella, Secure Firewall, or Duo — updates policy fleet-wide through XDR, so a threat seen once is blocked everywhere.",
         tags:["Coordinated defense","Threat intel","XDR"]},
        {code:"5.3", id:"p53", caption:"Trust became a tide",
         story:"Trust was no longer a wall to stand behind but a tide — rising for the traveler who proved themselves true, falling for the one whose conduct turned strange.",
         cisco:"Risk-based, continuous trust scoring. Each access decision weighs live signals — identity, posture, behavior, threat intelligence — so trust rises and falls per request rather than being fixed at login.",
         tags:["Risk-based access","Continuous trust","Adaptive"]},
        {code:"5.4", id:"p54", caption:"A realm that needed no wall",
         story:"And so the kingdom let its great wall fall to points of light, for it no longer needed one. The whole realm had become watchful, and trust was a thing earned newly each day.",
         cisco:"The mature Zero Trust end state: no implicit trust anywhere. Identity, context, and continuous verification replace the perimeter entirely — the network defends itself, everywhere, all the time.",
         tags:["Zero Trust","No implicit trust","Defense in depth"]},
      ]
    },
  ],
  cast:[
    {id:"cast_sovereign", name:"The Sovereign", role:"Policy Authority",
     bio:"Rules not by whim but by charter, deciding who may pass and what each may touch.",
     maps:"Cisco ISE — the central policy engine that authenticates and authorizes every request."},
    {id:"cast_herald", name:"The Herald", role:"Keeper of Names",
     bio:"Grants no passage to the unnamed; demands a name, a second sign, and proof of health.",
     maps:"Cisco Duo — multi-factor authentication and device trust."},
    {id:"cast_gatekeeper", name:"The Gatekeeper", role:"Warden of the Threshold",
     bio:"Reads each sigil at every door and opens only what the bearer’s role allows.",
     maps:"Cisco Secure Firewall — the policy enforcement point (PEP)."},
    {id:"cast_cartographer", name:"The Cartographer", role:"Mapmaker of the Realm",
     bio:"Draws a map that never sleeps, redrawing every road as travelers move.",
     maps:"Cisco Secure Network Analytics — flow visibility and baselining."},
    {id:"cast_sentinel", name:"The Sentinel", role:"The Unclosing Eye",
     bio:"Watches every ward at once and marks the path that bends where it should not.",
     maps:"Cisco Umbrella + Secure Network Analytics — continuous monitoring."},
    {id:"cast_courier", name:"The Courier", role:"Bearer of Sealed Word",
     bio:"Carries messages sealed so tightly that a thief who holds them learns nothing.",
     maps:"Encrypted transport (TLS) and Cisco SD-WAN."},
    {id:"cast_pretender", name:"The Pretender", role:"The Uninvited",
     bio:"Wears a borrowed face and a copied key, trusting that the old wall still trusts whoever stands inside.",
     maps:"The threat actor — stolen credentials, phishing, and lateral movement."},
  ],
  recap:{
    title:"The Charter, in Five Laws",
    sub:"What the realm learned — and what it maps to.",
    laws:[
      {num:"I",   fable:"A wall that trusts everyone within is no wall.",       decode:"Perimeter trust is dead — never trust by network location."},
      {num:"II",  fable:"Let none pass unnamed, unproven, or unwell.",          decode:"Identity is the new perimeter — verify every user & device (ISE + Duo)."},
      {num:"III", fable:"Give each sigil only the doors it needs.",             decode:"Least privilege by design — segment with TrustSec SGTs."},
      {num:"IV",  fable:"Keep one eye that never closes.",                      decode:"Verify continuously — full visibility & anomaly detection."},
      {num:"V",   fable:"Let the charter rewrite itself; let trust be a tide.", decode:"Adapt automatically — policy as code & orchestrated response."},
    ],
    close:"Never trust. Always verify. Earn it again tomorrow.",
  }
};


/* ------------------------------------------------------------------ *
 * Deck builder                                                        *
 * ------------------------------------------------------------------ */
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function asset(id){ return "../page/assets/" + id + ".svg"; }

function buildDeckHTML(){
  const S = STORY;
  const slides = [];

  slides.push(`<section class="slide title">
    <div class="wax">&#9733;</div>
    <div class="kicker">${esc(S.meta.kicker)}</div>
    <h1>${esc(S.meta.title)}</h1>
    <p class="sub">${esc(S.meta.sub)}</p>
  </section>`);

  S.chapters.forEach(ch=>{
    slides.push(`<section class="slide divider">
      <div class="ghost">${esc(ch.numeral)}</div>
      <div class="eyebrow">Chapter ${esc(ch.numeral)}</div>
      <h2>${esc(ch.title)}</h2>
      <p class="tag">${esc(ch.tagline)}</p>
      <span class="theme">${esc(ch.theme)}</span>
    </section>`);
    ch.panels.forEach(p=>{
      slides.push(`<section class="slide panel">
        <figure class="frame">
          <img src="${asset(p.id)}" alt="Panel ${esc(p.code)} — ${esc(p.caption)}">
          <span class="chip">PANEL ${esc(p.code)}</span>
        </figure>
        <div class="cards">
          <div class="story"><div class="lbl story-lbl">The Story</div><p>${esc(p.story)}</p></div>
          <div class="cisco"><div class="lbl cisco-lbl">In Cisco Terms</div><p>${esc(p.cisco)}</p>
            <div class="tags">${p.tags.map(t=>`<span>${esc(t)}</span>`).join("")}</div>
          </div>
        </div>
        <div class="cap">${esc(p.caption)}</div>
      </section>`);
    });
  });

  slides.push(`<section class="slide cast">
    <h2>The Cast of the Realm</h2>
    <div class="cast-grid">${S.cast.map(c=>`<article class="cc">
      <img src="${asset(c.id)}" alt="${esc(c.name)}">
      <div class="cc-body">
        <div class="role">${esc(c.role)}</div>
        <div class="nm">${esc(c.name)}</div>
        <div class="bio">${esc(c.bio)}</div>
        <div class="maps"><b>In Cisco Terms</b>${esc(c.maps)}</div>
      </div>
    </article>`).join("")}</div>
  </section>`);

  slides.push(`<section class="slide recap">
    <h2>${esc(S.recap.title)}</h2>
    <p class="sub">${esc(S.recap.sub)}</p>
    <div class="laws">${S.recap.laws.map(l=>`<div class="law">
      <span class="num">${esc(l.num)}</span>
      <div><div class="fable">${esc(l.fable)}</div>
        <div class="decode"><b>In Cisco terms &mdash;</b> ${esc(l.decode)}</div></div>
    </div>`).join("")}</div>
    <div class="close">${esc(S.recap.close)}</div>
  </section>`);

  const css = `
    :root{--midnight:#07182D;--gold:#FFB74A;--cyan:#02C8FF;--wax:#C8324B;--bg:#05080F;--paper:#efdcac;--paper-ink:#3a2f1c;--text:#e8eef6}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--text);
      font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif}
    .slide{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:18px;padding:6vh 6vw;text-align:center;border-bottom:1px solid rgba(255,183,74,.12);position:relative}
    h1{font-family:'Cinzel',Georgia,serif;color:var(--gold);font-size:clamp(38px,8vw,96px);margin:0;
      text-shadow:0 0 40px rgba(255,183,74,.3)}
    h2{font-family:'Cinzel',Georgia,serif;color:var(--gold);font-size:clamp(28px,5vw,54px);margin:0}
    .kicker,.eyebrow{font-family:'Space Mono',monospace;letter-spacing:.4em;text-transform:uppercase;color:var(--cyan);font-size:13px}
    .sub{font-family:'EB Garamond',Georgia,serif;font-size:clamp(17px,2.2vw,24px);color:#d7e1ee;max-width:720px}
    .wax{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:#4e0e1a;
      background:radial-gradient(circle at 38% 34%,#e0546c,var(--wax) 55%,#8e2035);box-shadow:0 6px 16px -4px rgba(200,50,75,.6)}
    .divider .ghost{position:absolute;font-family:'Cinzel',serif;font-size:40vh;color:rgba(255,183,74,.06);z-index:0;line-height:1}
    .divider>*{position:relative}
    .tag{font-family:'EB Garamond',serif;font-style:italic;color:#d7e1ee;font-size:clamp(17px,2.2vw,22px);max-width:640px}
    .theme{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--cyan);
      border:1px solid rgba(2,200,255,.35);border-radius:999px;padding:6px 16px}
    .panel{gap:22px}
    .frame{position:relative;width:min(880px,90vw);aspect-ratio:16/9;margin:0;border-radius:12px;overflow:hidden;
      border:1px solid rgba(255,183,74,.25);box-shadow:0 30px 70px -30px #000}
    .frame img{width:100%;height:100%;object-fit:cover;display:block}
    .chip{position:absolute;top:12px;left:12px;font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.18em;
      color:var(--gold);background:rgba(2,6,13,.72);border:1px solid rgba(255,183,74,.3);border-radius:6px;padding:5px 10px}
    .cards{display:grid;grid-template-columns:1fr 1fr;gap:18px;width:min(1000px,92vw);text-align:left}
    @media(max-width:760px){.cards{grid-template-columns:1fr}}
    .lbl{font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:.26em;font-size:11px;margin-bottom:8px}
    .story{background:linear-gradient(160deg,var(--paper),#e3ce97);color:var(--paper-ink);border-radius:10px;padding:20px;
      border:1px solid rgba(120,90,40,.4)}
    .story p{font-family:'EB Garamond',serif;font-size:18px;line-height:1.6;margin:0}
    .story-lbl{color:#8a6a2e}
    .cisco{background:linear-gradient(165deg,#0a2137,#050f1b);border:1px solid rgba(2,200,255,.28);border-radius:10px;padding:20px}
    .cisco p{font-size:15px;line-height:1.6;color:#cfe6f5;margin:0}
    .cisco-lbl{color:var(--cyan)}
    .tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .tags span{font-family:'Space Mono',monospace;font-size:11px;color:#bfe9fb;border:1px solid rgba(2,200,255,.28);
      border-radius:999px;padding:4px 11px}
    .cap{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9fb0c4}
    .cast-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;width:min(1100px,94vw)}
    @media(max-width:900px){.cast-grid{grid-template-columns:repeat(2,1fr)}}
    .cc{border:1px solid rgba(255,183,74,.2);border-radius:12px;overflow:hidden;background:linear-gradient(180deg,rgba(10,26,43,.7),rgba(5,12,22,.7));text-align:left}
    .cc img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;border-bottom:1px solid rgba(255,183,74,.2)}
    .cc-body{padding:12px 14px;display:flex;flex-direction:column;gap:5px}
    .role{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--cyan)}
    .nm{font-family:'Cinzel',serif;color:var(--gold);font-size:18px}
    .bio{font-family:'EB Garamond',serif;font-size:14px;color:#dbe6f2}
    .maps{font-size:12px;color:#bfe1f2;border-top:1px dashed rgba(2,200,255,.25);padding-top:8px}
    .maps b{display:block;font-family:'Space Mono',monospace;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:#7fd4f0;margin-bottom:3px}
    .laws{display:grid;gap:12px;width:min(900px,92vw);text-align:left}
    .law{display:grid;grid-template-columns:52px 1fr;gap:14px;align-items:center;border:1px solid rgba(255,183,74,.24);
      border-radius:10px;padding:14px 18px;background:linear-gradient(120deg,rgba(10,26,43,.6),rgba(5,15,27,.55))}
    .law .num{font-family:'Cinzel',serif;font-size:28px;color:var(--gold);text-align:center}
    .fable{font-family:'EB Garamond',serif;font-size:18px;color:#eef3fa}
    .decode{font-size:13px;color:#9fd8ef;margin-top:3px}
    .decode b{font-family:'Space Mono',monospace;color:var(--cyan);font-size:.92em}
    .close{font-family:'Cinzel',serif;color:var(--gold);font-size:clamp(16px,2.4vw,24px);letter-spacing:.08em}
  `;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(S.meta.title)} — Deck</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${slides.join("\n")}
</body>
</html>
`;
}

/* exports / CLI */
if (typeof module !== "undefined" && module.exports){ module.exports = { STORY, buildDeckHTML }; }
if (typeof require !== "undefined" && require.main === module){
  const fs = require("fs"), path = require("path");
  const out = path.join(__dirname, "deck.html");
  fs.writeFileSync(out, buildDeckHTML(), "utf8");
  const panels = STORY.chapters.reduce((n,c)=>n + c.panels.length, 0);
  console.log("Wrote " + out + " — " + STORY.chapters.length + " chapters, " +
    panels + " panels, " + STORY.cast.length + " cast members.");
}
