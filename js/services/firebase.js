// ============================================================================
// FIREBASE — app initialization. This is the ONLY file that should contain
// the Firebase config object. Every other service (auth.js, firestore.js)
// imports `app`, `auth`, `db` from here.
//
// SETUP:
// 1. Create a project at https://console.firebase.google.com
// 2. Add a Web App to the project, copy the config object it gives you,
//    and paste the values below (replace the placeholders).
// 3. In the Firebase console, enable:
//      Authentication -> Sign-in method -> Google, and -> Anonymous
//      Firestore Database -> Create database (production mode)
// 4. Deploy the security rules in /firestore.rules:
//      firebase deploy --only firestore:rules
// ============================================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// -------- REPLACE WITH YOUR OWN FIREBASE PROJECT CONFIG --------
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
// -----------------------------------------------------------------

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
