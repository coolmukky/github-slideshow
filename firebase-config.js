/* ============================================================================
   Firebase configuration for the Zero Trust Agentic Design Sprint
   ----------------------------------------------------------------------------
   This powers the shared, cross-device roster: participants register (name,
   email, team) on their own devices, and the proctor sees everyone live on
   proctor.html.

   The page works WITHOUT this configured — it falls back to a single-device
   (localStorage) roster so nothing breaks. To enable the real cross-device
   proctor view, do the following one-time setup:

   1. Go to https://console.firebase.google.com/ and create a project (free).
   2. In the project, add a Web app (</>) — copy the "firebaseConfig" values.
   3. Build → Firestore Database → Create database (Production mode is fine).
   4. Firestore → Rules: for a short, facilitated clinic you can use the rules
      below. They allow reading/writing player records but block deleting them
      from the client. Tighten or delete the data after your session — the
      records contain participant emails (PII).

        rules_version = '2';
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /players/{id} {
              allow read: if true;
              allow create, update: if
                request.resource.data.name is string &&
                request.resource.data.name.size() < 120 &&
                request.resource.data.email.size() < 200 &&
                request.resource.data.teamName.size() < 120;
              allow delete: if false;
            }
            match /solutions/{id} {
              allow read: if true;
              allow create, update: if
                request.resource.data.teamName is string &&
                request.resource.data.teamName.size() < 120;
              allow delete: if false;
            }
            match /scores/{id} {
              allow read: if true;
              allow create, update: if
                request.resource.data.teamName is string &&
                request.resource.data.total is number;
              allow delete: if false;
            }
            match /control/{id} {
              allow read: if true;
              allow create, update: if request.resource.data.room is string;
              allow delete: if false;
            }
          }
        }

   5. Paste your values below (replace every PASTE_… placeholder) and commit.

   NOTE: Firebase web config values are NOT secrets — they're meant to ship in
   the browser. Your data is protected by the Firestore rules above, not by
   hiding these values.
   ========================================================================== */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBttVNwx0VOhTiMgMF6EAxn-f9X6au2CaA",
  authDomain: "design-clinic-58ad0.firebaseapp.com",
  databaseURL: "https://design-clinic-58ad0-default-rtdb.firebaseio.com",
  projectId: "design-clinic-58ad0",
  storageBucket: "design-clinic-58ad0.firebasestorage.app",
  messagingSenderId: "278404586451",
  appId: "1:278404586451:web:459afeba6085107d712d26"
};

/* ----------------------------------------------------------------------------
   AI evaluation (optional) — proctor.html "Evaluate with AI".
   Point this at your deployed serverless proxy (see ai-eval-worker.js + AI-EVAL.md).
   The proxy holds the Anthropic API key as a SERVER secret; the key must NOT be
   placed here. Leave the endpoint empty to keep AI evaluation in preview mode
   (manual scoring always works regardless).
   AI_EVAL_TOKEN is optional and only needed if you set EVAL_SHARED_TOKEN on the
   proxy — it's a light abuse guard, not a real secret, so keep it low-value.
   -------------------------------------------------------------------------- */
window.AI_EVAL_ENDPOINT = "";   // e.g. "https://clinic-ai-eval.<you>.workers.dev"
window.AI_EVAL_TOKEN = "";      // optional; matches the proxy's EVAL_SHARED_TOKEN

/* ----------------------------------------------------------------------------
   Proctor passcode gate (proctor.html). Blocks casual/accidental access to the
   facilitator console. Store the SHA-256 *hash* of your passcode here (never the
   passcode itself). Empty = no gate (console open to anyone with the URL).
   Note: this is a client-side deterrent, not hardened auth — a determined,
   technical person could bypass it. It stops the wrong people wandering in.
   To change it: pick a passcode, hash it, and paste the hash below. Easiest —
   in your browser console run:
     crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR-PASSCODE'))
       .then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
   Default passcode below is "clinic2026" — change it.
   -------------------------------------------------------------------------- */
window.PROCTOR_PASSCODE_SHA256 = "ec189984c5b36432f04401eb55b916a4801153d10b627bc4cc590382e27d1aa8";
