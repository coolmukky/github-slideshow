/* ============================================================================
   Shared roster for the Zero Trust Agentic Design Sprint.
   Used by both the participant page and proctor.html.

   Exposes window.ZTDSRoster.init(room) -> Promise<adapter>, where adapter is:
     { mode, join(player), subscribe(cb) -> unsubscribe }

   If firebase-config.js is filled in, it uses Firestore (real cross-device
   sync). Otherwise it transparently falls back to a single-device localStorage
   roster so the pages still work (useful for testing / one-device demos).
   ========================================================================== */
(function () {
  "use strict";
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";

  function lsKey(room) { return "ztds.roster." + room; }

  function localAdapter(room) {
    function readAll() { try { return JSON.parse(localStorage.getItem(lsKey(room)) || "[]"); } catch (e) { return []; } }
    function writeAll(a) { try { localStorage.setItem(lsKey(room), JSON.stringify(a)); } catch (e) {} }
    var listeners = [];
    function emit() { var d = readAll(); listeners.forEach(function (fn) { fn(d); }); }
    window.addEventListener("storage", function (e) { if (e.key === lsKey(room)) emit(); });
    return {
      mode: "local",
      join: function (p) { var a = readAll(); var i = a.findIndex(function (x) { return x.id === p.id; }); if (i >= 0) a[i] = Object.assign(a[i], p); else a.push(p); writeAll(a); emit(); return Promise.resolve(); },
      subscribe: function (cb) { cb(readAll()); listeners.push(cb); var iv = setInterval(function () { cb(readAll()); }, 2000); return function () { clearInterval(iv); }; }
    };
  }

  function firebaseAdapter(room, cfg) {
    return import(SDK + "firebase-app.js").then(function (appMod) {
      return import(SDK + "firebase-firestore.js").then(function (fs) {
        var app = appMod.initializeApp(cfg);
        var db = fs.getFirestore(app);
        return {
          mode: "firebase",
          join: function (p) { return fs.setDoc(fs.doc(db, "players", p.id), p, { merge: true }); },
          subscribe: function (cb) {
            var q = fs.query(fs.collection(db, "players"), fs.where("room", "==", room));
            return fs.onSnapshot(q, function (snap) { var d = []; snap.forEach(function (doc) { d.push(doc.data()); }); cb(d); });
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
      return firebaseAdapter(room, cfg).catch(function (e) {
        console.warn("[roster] Firebase unavailable, using local fallback:", e && e.message);
        return localAdapter(room);
      });
    }
    return Promise.resolve(localAdapter(room));
  }

  window.ZTDSRoster = { init: init };
})();
