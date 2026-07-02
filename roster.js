/* ============================================================================
   Shared store for the Zero Trust Agentic Design Sprint.
   Used by the participant page, proctor.html, and leaderboard.html.

   window.ZTDSRoster.init(room) -> Promise<adapter>, where adapter is:
     { mode, write(collection, doc), watch(collection, room, cb) -> unsubscribe }

   `doc` must include an `id` and a `room` field. Collections used:
     - "players"   : one doc per participant  {id, room, name, email, role, roleKey, teamName, joinedAt}
     - "solutions" : one doc per team         {id, room, teamName, submittedByName, submittedAt, fields[]}
     - "scores"    : one doc per team         {id, room, teamName, i1, i2, i3, solution, total, notes, evaluatedByName, evaluatedAt}

   If firebase-config.js is filled in, it uses Firestore (real cross-device
   sync). Otherwise it transparently falls back to a single-device localStorage
   store so the pages still work (testing / one-device demos).
   ========================================================================== */
(function () {
  "use strict";
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";

  function lsKey(coll, room) { return "ztds." + coll + "." + room; }

  function localAdapter() {
    function readAll(coll, room) { try { return JSON.parse(localStorage.getItem(lsKey(coll, room)) || "[]"); } catch (e) { return []; } }
    function writeAll(coll, room, a) { try { localStorage.setItem(lsKey(coll, room), JSON.stringify(a)); } catch (e) {} }
    var listeners = []; // { coll, room, cb }
    function emit(coll, room) { var d = readAll(coll, room); listeners.forEach(function (l) { if (l.coll === coll && l.room === room) l.cb(d); }); }
    window.addEventListener("storage", function (e) {
      if (!e.key || e.key.indexOf("ztds.") !== 0) return;
      var parts = e.key.split("."); // ztds.<coll>.<room...>
      if (parts.length >= 3) { var coll = parts[1]; var room = parts.slice(2).join("."); emit(coll, room); }
    });
    return {
      mode: "local",
      write: function (coll, doc) {
        var room = doc.room; var a = readAll(coll, room);
        var i = a.findIndex(function (x) { return x.id === doc.id; });
        if (i >= 0) a[i] = Object.assign(a[i], doc); else a.push(doc);
        writeAll(coll, room, a); emit(coll, room); return Promise.resolve();
      },
      watch: function (coll, room, cb) {
        cb(readAll(coll, room));
        var l = { coll: coll, room: room, cb: cb }; listeners.push(l);
        var iv = setInterval(function () { cb(readAll(coll, room)); }, 2000);
        return function () { clearInterval(iv); var idx = listeners.indexOf(l); if (idx >= 0) listeners.splice(idx, 1); };
      }
    };
  }

  function firebaseAdapter(cfg) {
    return import(SDK + "firebase-app.js").then(function (appMod) {
      return import(SDK + "firebase-firestore.js").then(function (fs) {
        var app = appMod.initializeApp(cfg);
        var db = fs.getFirestore(app);
        return {
          mode: "firebase",
          write: function (coll, doc) { return fs.setDoc(fs.doc(db, coll, doc.id), doc, { merge: true }); },
          watch: function (coll, room, cb) {
            var q = fs.query(fs.collection(db, coll), fs.where("room", "==", room));
            return fs.onSnapshot(q, function (snap) { var d = []; snap.forEach(function (docSnap) { d.push(docSnap.data()); }); cb(d); });
          }
        };
      });
    });
  }

  function init(room) {
    room = room || "default";
    var cfg = window.FIREBASE_CONFIG;
    var configured = cfg && cfg.apiKey && cfg.apiKey.indexOf("PASTE") !== 0;
    if (configured) {
      return firebaseAdapter(cfg).catch(function (e) {
        console.warn("[roster] Firebase unavailable, using local fallback:", e && e.message);
        return localAdapter();
      });
    }
    return Promise.resolve(localAdapter());
  }

  window.ZTDSRoster = { init: init };
})();
