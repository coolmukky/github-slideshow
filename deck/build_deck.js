// Rebuilds the Ultra Secure Collaboration storyboard .pptx from the images in ../page/assets.
// Story text + Cisco decoders are kept in sync with page/index.html (reviewed/approved copy).
//   cd deck && npm install && node build_deck.js
const pptxgen = require('pptxgenjs');
const path = require('path');
const IMG = f => path.join(__dirname, '..', 'page', 'assets', f);

const MID="07182D", DEEP="040D1B", WHITE="FFFFFF", CYAN="02C8FF",
      ORANGE="FF9000", STEEL="3D5478", STEEL2="1E3B5C";
const HEAD="Inter Semi Bold", BODY="Inter";

const p = new pptxgen();
p.defineLayout({ name:"W", width:13.333, height:7.5 });
p.layout = "W";
p.author = "Cisco Tech Elevate";
p.title = "Kingdom of Ultra Secure Collaboration — Storyboard";

function bg(s, color=MID){ s.background = { color }; }
function footer(s, left){
  s.addText(left, { x:0.5, y:7.06, w:8, h:0.3, fontFace:BODY, fontSize:9, color:"6E7A8C", align:"left" });
  s.addText("Ultra Secure Collaboration  ·  Cisco GSX 2026  ·  Cisco Confidential",
    { x:5.0, y:7.06, w:7.8, h:0.3, fontFace:BODY, fontSize:9, color:"6E7A8C", align:"right" });
}
const SLIDE_W = 13.333;
function chip(s, x, y, txt, col){
  // clamp to the slide: a fixed 4.6" width hangs off the right edge in the right-hand
  // column (x=8.85). The label is short and left-aligned so nothing was visibly cut,
  // but the box should not leave the canvas.
  const w = Math.min(4.6, SLIDE_W - x - 0.25);
  s.addText(txt.toUpperCase(), { x, y, w, h:0.3, fontFace:HEAD, fontSize:11, bold:true,
    color:col, charSpacing:2, align:"left" });
}

// 1. TITLE
let s = p.addSlide(); bg(s);
s.addImage({ path:IMG('title.jpg'), x:0, y:0, w:13.333, h:7.5 });
s.addShape(p.ShapeType.rect,{ x:0, y:0, w:13.333, h:7.5, fill:{ color:MID, transparency:38 } });
s.addShape(p.ShapeType.rect,{ x:0, y:4.7, w:13.333, h:2.8, fill:{ color:MID, transparency:10 } });
s.addText("A VISUAL STORYBOARD", { x:0.9, y:3.5, w:9, h:0.4, fontFace:HEAD, fontSize:15, bold:true, color:CYAN, charSpacing:5 });
s.addText("The Kingdom of\nUltra Secure Collaboration",
  { x:0.85, y:3.9, w:11.6, h:1.9, fontFace:HEAD, fontSize:52, bold:true, color:WHITE, lineSpacingMultiple:0.98 });
s.addText("How a medieval kingdom explains Cisco's Zero-Trust meetings, calls and identity — story slides 15–19, one panel per beat.",
  { x:0.9, y:5.95, w:10.8, h:0.7, fontFace:BODY, fontSize:16, color:"CFE0F5" });
s.addText("Cisco Tech Elevate Sessions at GSX  ·  July 2026",
  { x:0.9, y:6.72, w:10, h:0.3, fontFace:BODY, fontSize:12, color:"8FA6C4" });

// 2. PREMISE
s = p.addSlide(); bg(s);
s.addText("One story, told twice", { x:0.7, y:0.55, w:12, h:0.7, fontFace:HEAD, fontSize:34, bold:true, color:WHITE });
s.addText("Every panel that follows carries the fable on the left and the technology on the right. The allegory is exact — each character and prop maps to a real Cisco Ultra Secure capability.",
  { x:0.7, y:1.35, w:12, h:0.7, fontFace:BODY, fontSize:15, color:"CFE0F5" });
const premise = [
  ["THE STORY", ORANGE, "A kingdom, its Lords, and a guarded castle. Identities are proven, secrets are sealed in a magic book, and unwelcome crows are shut out.", "cast_castle.jpg"],
  ["IN CISCO TERMS", CYAN, "Zero-trust identity, end-to-end encryption with rotating keys, on-prem AI services, and secure external access — all under customer control.", "cast_medallion.jpg"],
];
premise.forEach((c,i)=>{
  const x=0.7+i*6.15;
  s.addShape(p.ShapeType.roundRect,{ x, y:2.3, w:5.75, h:3.9, rectRadius:0.14, fill:{ color:"0C2038" }, line:{ color:STEEL2, width:1 } });
  s.addImage({ path:IMG(c[3]), x:x+0.32, y:2.62, w:1.5, h:1.5 });
  chip(s, x+2.0, 2.78, c[0], c[1]);
  s.addText(c[2], { x:x+2.0, y:3.15, w:3.5, h:1.0, fontFace:BODY, fontSize:13.5, color:"DDE8F6", valign:"top" });
});
s.addText("Read each panel left → right:  the fable sets the scene, the decoder line names the real control.",
  { x:0.7, y:6.45, w:12, h:0.4, fontFace:BODY, fontSize:13, italic:true, color:"9FB4D0" });
footer(s, "Story premise");

// 3. CAST
s = p.addSlide(); bg(s);
s.addText("The Cast", { x:0.7, y:0.42, w:8, h:0.7, fontFace:HEAD, fontSize:34, bold:true, color:WHITE });
s.addText("Taxonomy from the story bible — who's who, and what each one really is.",
  { x:0.7, y:1.18, w:12, h:0.4, fontFace:BODY, fontSize:14, color:"CFE0F5" });
const castCards = [
  ["cast_king.jpg","The King","Customer / Enterprise"],
  ["cast_lords.jpg","The Lords","Management team — the participants"],
  ["cast_castle.jpg","The Castle","Collaboration SaaS provider (Cisco)"],
  ["cast_chamber.jpg","Meeting Chamber","The meeting itself"],
  ["cast_maester.jpg","Maesters","Video Mesh Node & on-prem AI"],
  ["cast_medallion.jpg","Medallion","Webex identity + voiceprint"],
  ["cast_patent.jpg","Letters Patent","Individual, per-user identity"],
];
// Card height and start are set so the second row clears the footer band at y=7.06.
// At the previous 2.62 tall / 1.72 start the row ran to 7.30 and the footer printed
// straight over the bottom of the cards.
const cw=2.86, ch=2.44, gx=0.34, gy=0.34, startX=0.62, startY=1.66;
castCards.forEach((c,i)=>{
  const col=i%4, row=Math.floor(i/4);
  const x=startX+col*(cw+gx), y=startY+row*(ch+gy);
  s.addShape(p.ShapeType.roundRect,{ x, y, w:cw, h:ch, rectRadius:0.12, fill:{ color:"0C2038" }, line:{ color:STEEL2, width:1 } });
  s.addImage({ path:IMG(c[0]), x:x+(cw-1.62)/2, y:y+0.14, w:1.62, h:1.62 });
  s.addText(c[1], { x:x+0.1, y:y+1.78, w:cw-0.2, h:0.28, fontFace:HEAD, fontSize:15, bold:true, color:CYAN, align:"center" });
  s.addText(c[2], { x:x+0.14, y:y+2.04, w:cw-0.28, h:0.34, fontFace:BODY, fontSize:11, color:"CFE0F5", align:"center", valign:"top" });
});
footer(s, "Cast of characters · from story slide 13");

// CHAPTERS + PANELS
const chapters = [
  { n:1, src:15, title:"Independently Verified Identity", concept:"Zero-Trust Identity for every meeting", ga:"GA Q3 CY26", hero:"p14.jpg",
    tagline:"Only independently verified individuals get in — and deepfakes don't." },
  { n:2, src:16, title:"Zero-Trust End-to-End Encryption", concept:"Zero-Trust Encryption for all calls & meetings", ga:"GA Q3 CY26", hero:"p22.jpg",
    tagline:"A shared secret only the participants hold — the provider can't listen in." },
  { n:3, src:17, title:"Adding Services into the Meeting", concept:"Fully-featured Zero-Trust Meetings — recording & AI", ga:"GA Q3 CY26", hero:"p31.jpg",
    tagline:"Trusted scribes and advisors join under the same rules — records stay with the customer." },
  { n:4, src:18, title:"Including Others (PSTN & Beyond)", concept:"Bridging legacy & external audio into Zero-Trust meetings", ga:"GA Q4 CY26", hero:"p42.jpg",
    tagline:"A controlled gateway lets the chamber speak to the outside world." },
  { n:5, src:19, title:"Adding External Participants", concept:"External participants via standard browser — C2B", ga:"GA Q3 CY26", hero:"p54.jpg",
    tagline:"Guests join securely from anywhere with a temporary, time-bound identity." },
];
const panels = {
1:[
  ["p11","1.1","Each Lord is issued with two forms of identity.","Every participant is provisioned two independent identity factors — no single token grants trust."],
  ["p12","1.2","A Medallion that marks them a Lord, used together with their voice.","Webex Identity (the medallion) is bound to a live voiceprint — mitigating impersonation and deepfakes."],
  ["p13","1.3","A \u201Cletters patent\u201D — signed and sealed by the King.","A unique, per-user credential (individual identity) is cryptographically issued by the enterprise."],
  ["p14","1.4","To enter the chamber, participant Lords show their medallions to the guards, verify with their voice, and must be on the invite list.","Admission requires identity + voice verification + presence on the invite list — a true zero-trust join."],
  ["p15","1.5","Inside, the Lords show their letters patent to one another to prove who they say they are.","Participants mutually verify individual identities in-meeting — only verified individuals take part."],
],
2:[
  ["p21","2.1","All the Lords share their letters patent.","Every participant contributes their individual identity to establish the session."],
  ["p22","2.2","Combined, the letters patent create a \u201Cmagic\u201D book holding the code the Lords use to speak inside the chamber.","Their combination derives the shared meeting key used for end-to-end encryption."],
  ["p23","2.3","Each time a Lord enters or leaves, a new book is created and replaces the old — everyone uses the new one from then on.","The key is re-derived on every join and leave — giving forward and backward secrecy."],
  ["p24","2.4","A crow eavesdropping at the window has no book, so it cannot understand a word.","An eavesdropper without the key sees only ciphertext — even the SaaS provider cannot decrypt."],
],
3:[
  ["p31","3.1","The King employs Maesters — learned scholars, doctors and advisors — to serve as scribes in sensitive meetings.","Optional services — Video Mesh Node and on-prem AI — act as trusted scribes and advisors."],
  ["p32","3.2","The King issues the Maesters their own special letters patent, used just like a Lord\u2019s.","Those services are issued their own verifiable identity and admitted like any other participant."],
  ["p33","3.3","The chairperson may ask a Maester to enter the room.","The meeting organizer explicitly invites the service into the session."],
  ["p34","3.4","The Maester shows their letters patent, a new book is generated, and they can then follow, document and advise.","On join the key rotates to include it; it can transcribe, record and advise inside the meeting."],
  ["p35","3.5","When done, all records go to the King\u2019s secure vault — which the castle operator cannot open.","Records are stored under customer control; the SaaS provider holds no keys and has no access."],
],
4:[
  ["p41","4.1","Sometimes the Lords must speak to servants — to call for food and wine.","Some conversations must reach the outside world, e.g. PSTN or legacy endpoints."],
  ["p42","4.2","Via the Maester, the Chairman adds a special Babel Fish to translate between the coded conversation and the outside world.","A controlled gateway bridges the encrypted meeting and external audio, in both directions."],
],
5:[
  ["p51","5.1","Sometimes Lords bring in people on other systems to discuss alliances — the Kingdom of the Isles.","External parties on different platforms can be brought in for cross-org and C2B collaboration."],
  ["p52","5.2","These talks are sensitive and must stay protected — yet cannot be confined to the chamber.","The exchange stays protected even as it extends beyond the core meeting."],
  ["p53","5.3","The King issues a temporary letters patent, sent by Carrier Crow.","A temporary, time-bound identity is issued and delivered to the external participant."],
  ["p54","5.4","The envoy uses a Magic Mirror — standard across all kingdoms — to join remotely, presents the temporary patent, and a new book is shared.","They join via a standard browser; presenting the temp identity rotates the key to include them."],
],
};

chapters.forEach((ch) => {
  // divider
  let d = p.addSlide(); bg(d, DEEP);
  d.addImage({ path:IMG(ch.hero), x:0, y:0, w:13.333, h:7.5 });
  d.addShape(p.ShapeType.rect,{ x:0, y:0, w:13.333, h:7.5, fill:{ color:MID, transparency:22 } });
  d.addShape(p.ShapeType.rect,{ x:0, y:3.9, w:13.333, h:3.6, fill:{ color:DEEP, transparency:18 } });
  d.addText(`CHAPTER ${ch.n}`, { x:0.9, y:3.55, w:8, h:0.5, fontFace:HEAD, fontSize:18, bold:true, color:CYAN, charSpacing:6 });
  d.addText(ch.title, { x:0.85, y:4.0, w:11.6, h:1.5, fontFace:HEAD, fontSize:46, bold:true, color:WHITE, lineSpacingMultiple:0.98 });
  d.addText(ch.tagline, { x:0.9, y:5.55, w:11.4, h:0.6, fontFace:BODY, fontSize:17, color:"CFE0F5", italic:true });
  d.addShape(p.ShapeType.roundRect,{ x:0.9, y:6.25, w:0.18, h:0.44, rectRadius:0.09, fill:{ color:CYAN } });
  d.addText([
    { text:"IN CISCO TERMS   ", options:{ bold:true, color:CYAN, fontFace:HEAD } },
    { text:ch.concept + "   ", options:{ color:WHITE, fontFace:BODY } },
    { text:ch.ga, options:{ color:ORANGE, bold:true, fontFace:HEAD } },
  ], { x:1.2, y:6.24, w:11.4, h:0.46, fontSize:14, valign:"middle" });
  footer(d, `Story slide ${ch.src}  ·  Chapter ${ch.n} of 5`);

  // panels
  panels[ch.n].forEach(([img,label,story,decoder]) => {
    let ps = p.addSlide(); bg(ps);
    chip(ps, 0.55, 0.36, `Chapter ${ch.n} · ${ch.title}`, CYAN);
    ps.addText(`Story slide ${ch.src}`, { x:9.3, y:0.34, w:3.5, h:0.3, fontFace:BODY, fontSize:11, color:"6E7A8C", align:"right" });
    const fx=0.5, fy=1.55, fw=8.0, fh=fw*900/1600;
    ps.addShape(p.ShapeType.roundRect,{ x:fx-0.06, y:fy-0.06, w:fw+0.12, h:fh+0.12, rectRadius:0.1, fill:{ color:"08192E" }, line:{ color:STEEL, width:1.75 } });
    ps.addImage({ path:IMG(img+'.jpg'), x:fx, y:fy, w:fw, h:fh, rounding:true });
    ps.addShape(p.ShapeType.roundRect,{ x:fx+0.14, y:fy+0.14, w:0.92, h:0.46, rectRadius:0.1, fill:{ color:MID, transparency:8 }, line:{ color:CYAN, width:1.25 } });
    ps.addText(`PANEL ${label}`, { x:fx+0.14, y:fy+0.15, w:0.92, h:0.44, fontFace:HEAD, fontSize:12, bold:true, color:CYAN, align:"center", valign:"middle" });
    const rx=8.85, rw=4.0;
    chip(ps, rx, 1.15, "The Story", ORANGE);
    ps.addText(story, { x:rx, y:1.5, w:rw, h:2.5, fontFace:BODY, fontSize:16.5, color:"FFFFFF", valign:"top", lineSpacingMultiple:1.08 });
    ps.addShape(p.ShapeType.line,{ x:rx, y:4.35, w:rw, h:0, line:{ color:STEEL2, width:1 } });
    chip(ps, rx, 4.55, "In Cisco Terms", CYAN);
    ps.addShape(p.ShapeType.roundRect,{ x:rx-0.02, y:4.9, w:rw+0.04, h:1.75, rectRadius:0.1, fill:{ color:"0C2038" }, line:{ color:STEEL2, width:1 } });
    ps.addText(decoder, { x:rx+0.22, y:5.06, w:rw-0.42, h:1.45, fontFace:BODY, fontSize:14, color:"CFE0F5", valign:"top", lineSpacingMultiple:1.06 });
    footer(ps, `Story slide ${ch.src}  ·  bullet ${label.split('.')[1]}  ·  panel ${label}`);
  });
});

// RECAP
s = p.addSlide(); bg(s, DEEP);
s.addImage({ path:IMG('title.jpg'), x:0, y:0, w:13.333, h:7.5 });
s.addShape(p.ShapeType.rect,{ x:0, y:0, w:13.333, h:7.5, fill:{ color:MID, transparency:20 } });
s.addText("Five chapters, one guarantee", { x:0.8, y:0.6, w:12, h:0.7, fontFace:HEAD, fontSize:32, bold:true, color:WHITE });
const recap=[
  ["1 · Verified Identity","Independently verified individuals — no deepfakes."],
  ["2 · E2E Encryption","Rotating keys the provider can never hold."],
  ["3 · Services","AI & recording join under the same trust — records stay yours."],
  ["4 · Including Others","Controlled bridges to PSTN and the outside world."],
  ["5 · External Guests","Secure browser access with temporary identities."],
];
recap.forEach((r,i)=>{
  const y=1.6+i*1.02;
  s.addShape(p.ShapeType.roundRect,{ x:0.8, y, w:11.7, h:0.86, rectRadius:0.1, fill:{ color:"0C2038", transparency:10 }, line:{ color:STEEL2, width:1 } });
  s.addText(r[0], { x:1.05, y:y+0.02, w:3.6, h:0.82, fontFace:HEAD, fontSize:17, bold:true, color:CYAN, valign:"middle" });
  s.addText(r[1], { x:4.7, y:y+0.02, w:7.6, h:0.82, fontFace:BODY, fontSize:15, color:"E7EEF8", valign:"middle" });
});
s.addText("Meeting customers where they are — securely.", { x:0.8, y:6.82, w:12, h:0.4, fontFace:BODY, fontSize:14, italic:true, color:"9FB4D0" });

const OUT = path.join(__dirname, 'Kingdom_of_Ultra_Secure_Collaboration_Storyboard.pptx');
p.writeFile({ fileName: OUT }).then(()=>console.log("WROTE", OUT));
