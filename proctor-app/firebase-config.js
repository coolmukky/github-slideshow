/* ============================================================================
   Firebase configuration for the Design Proctor app (OPTIONAL).
   ----------------------------------------------------------------------------
   Fill this in to sync submissions and scores across devices — so participants
   submit from their own phones/laptops and the proctor sees everyone live.

   The app works WITHOUT this configured: it falls back to a single-device
   (localStorage) store so nothing breaks. To enable cross-device sync:

   1. Go to https://console.firebase.google.com/ and create a project (free),
      OR reuse the project already configured in the repo-root firebase-config.js
      (paste the same values below — a different set of collections is used, so
      the two apps won't collide).
   2. Add a Web app (</>) and copy the "firebaseConfig" values into the object
      at the bottom of this file (replace every PASTE_… placeholder).
   3. Build → Firestore Database → Create database (Production mode is fine).
   4. Firestore → Rules → paste the rules below → Publish.

        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /pa_reference/{id} {
              allow read: if true;
              allow create, update: if request.resource.data.room is string;
              allow delete: if false;
            }
            match /pa_submissions/{id} {
              allow read: if true;
              allow create, update: if
                request.resource.data.team is string &&
                request.resource.data.team.size() < 120 &&
                request.resource.data.room is string;
              allow delete: if false;
            }
          }
        }

   Scope a session with ?room=CODE on both pages (index.html and proctor.html)
   to keep separate clinics apart; the default room is "default".

   NOTES
   - Firebase web config values are NOT secrets — they ship in the browser. Your
     data is protected by the Firestore rules above, not by hiding these values.
   - Your Claude API key is NEVER stored here or synced — it lives only in the
     proctor's browser localStorage.
   - Firestore documents are capped at ~1 MB. Diagrams are downscaled to fit;
     avoid very large image-heavy PDFs (paste text or use a smaller PDF).
   ========================================================================== */
window.FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_AUTH_DOMAIN",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};
