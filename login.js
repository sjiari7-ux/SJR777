/* ═══════════════════════════════════════════════════════════════
   ARCADIA MMO — Login (Google Sign-In)
   ═══════════════════════════════════════════════════════════════ */
// ═══════════════════════════════════════════════════════════════
// ARCADIA MMO — Login Page
// ═══════════════════════════════════════════════════════════════
// 1. Replace the firebaseConfig below with your project credentials
// 2. No other changes needed for basic auth
// ═══════════════════════════════════════════════════════════════
const googleBtn = document.getElementById('googleBtn');
const guestBtn = document.getElementById('guestBtn');
const loadingBox = document.getElementById('loadingBox');
const errorBox = document.getElementById('errorBox');

function showError(msg){
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
  loadingBox.style.display = 'none';
  googleBtn.disabled = false;
  guestBtn.disabled = false;
}

function setLoading(isLoading){
  googleBtn.disabled = isLoading;
  guestBtn.disabled = isLoading;
  loadingBox.style.display = isLoading ? 'flex' : 'none';
  errorBox.style.display = 'none';
}

async function signInWithGoogle(){
  if (!auth) {
    showError('Firebase not configured. Please set up Firebase credentials in the code.');
    return;
  }
  setLoading(true);
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');

  try{
    await auth.signInWithPopup(provider);
  } catch(err){
    console.error(err);
    showError('Login failed: ' + (err.message || 'Unknown error'));
    setLoading(false);
  }
}

async function continueAsGuest(){
  if (!auth) {
    // Offline demo: skip auth and go straight to setup
    showView('setup');
    return;
  }
  setLoading(true);
  try{
    await auth.signInAnonymously();
  } catch(err){
    console.error(err);
    showError('Guest login failed: ' + (err.message || 'Unknown error'));
    setLoading(false);
  }
}
