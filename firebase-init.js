/* ═══════════════════════════════════════════════════════════════
   ARCADIA MMO — Master Init & View Control
   ═══════════════════════════════════════════════════════════════
   1. Replace the firebaseConfig below with your project credentials
   2. This single config/auth/db is shared by all three views
   ═══════════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// ═══════════════════════════════════════════════

let auth = null;
let db = null;
let firebaseReady = false;

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('YOUR_')) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseReady = true;
  } else {
    console.warn('Firebase not configured. Using offline demo mode.');
  }
} catch (e) {
  console.error('Firebase init failed:', e);
}

let UID = null;
let EMAIL = null;

function showView(name){
  document.getElementById('view-login').classList.toggle('hidden', name !== 'login');
  document.getElementById('view-setup').classList.toggle('hidden', name !== 'setup');
  document.getElementById('view-game').classList.toggle('hidden', name !== 'game');
}

function enterGame(){
  showView('game');
  startGame();
  loadUsername();
}

if (auth) {
  auth.onAuthStateChanged(async user => {
    if(!user){
      UID = null; EMAIL = null;
      showView('login');
      return;
    }
    UID = user.uid;
    EMAIL = user.email;
    try{
      const playerDoc = await db.collection('players').doc(UID).get();
      if(playerDoc.exists){
        enterGame();
      } else {
        showView('setup');
      }
    } catch(e){
      console.error(e);
    }
  });
} else {
  // Offline demo mode: show login but warn user
  showView('login');
  document.addEventListener('DOMContentLoaded', () => {
    const errorBox = document.getElementById('errorBox');
    if (errorBox) {
      errorBox.textContent = 'Offline mode: Configure Firebase in the code to enable cloud save. Guest play works locally.';
      errorBox.style.display = 'block';
    }
  });
}
