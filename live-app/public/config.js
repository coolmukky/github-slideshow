// ─────────────────────────────────────────────────────────────────────────────
// Firebase project configuration.
//
// 1. Create a project at https://console.firebase.google.com
// 2. Add a Web App (</>), then copy its config values below.
// 3. In the console: Build → Authentication → Sign-in method → enable "Anonymous".
// 4. Build → Firestore Database → Create database (Production mode).
// 5. Deploy (see DEPLOY.md).
//
// These values are NOT secrets — Firebase web config is meant to ship in the
// client. Access is controlled by Firestore security rules (see firestore.rules).
// ─────────────────────────────────────────────────────────────────────────────
window.FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};
