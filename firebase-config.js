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
          }
        }

   5. Paste your values below (replace every PASTE_… placeholder) and commit.

   NOTE: Firebase web config values are NOT secrets — they're meant to ship in
   the browser. Your data is protected by the Firestore rules above, not by
   hiding these values.
   ========================================================================== */
window.FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};
