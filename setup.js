/* ═══════════════════════════════════════════════════════════════
   ARCADIA MMO — Account Setup (username + class)
   ═══════════════════════════════════════════════════════════════ */
// ═══════════════════════════════════════════════════════════════
// ARCADIA MMO — Account Setup
// ═══════════════════════════════════════════════════════════════
// 1. Replace the firebaseConfig below with your project credentials
// 2. This page handles: username selection + class selection
// ═══════════════════════════════════════════════════════════════
function logoutDuringSetup(){
  auth.signOut().then(()=>location.reload());
}

let selectedUsername = '';
let selectedClass = null;
let usernameAvailable = false;
let checkTimeout = null;

function checkUsername(){
  const input = document.getElementById('usernameInput');
  const val = input.value.trim();
  const errorBox = document.getElementById('inputError');
  const successBox = document.getElementById('inputSuccess');
  const nextBtn = document.getElementById('nextBtn');

  errorBox.style.display = 'none';
  successBox.style.display = 'none';
  nextBtn.disabled = true;
  usernameAvailable = false;

  if(!val) return;
  if(val.length < 3){
    errorBox.textContent = 'Name must be at least 3 characters';
    errorBox.style.display = 'block';
    return;
  }
  if(!/^[a-zA-Z0-9_]+$/.test(val)){
    errorBox.textContent = 'Contains disallowed symbols';
    errorBox.style.display = 'block';
    return;
  }

  clearTimeout(checkTimeout);
  checkTimeout = setTimeout(async () => {
    try{
      if (db) {
        const doc = await db.collection('usernames').doc(val).get();
        if(doc.exists){
          errorBox.textContent = '❌ This name is already taken';
          errorBox.style.display = 'block';
          return;
        }
      }
      successBox.style.display = 'block';
      usernameAvailable = true;
      selectedUsername = val;
      nextBtn.disabled = false;
    } catch(e){
      errorBox.textContent = 'Connection error, try again';
      errorBox.style.display = 'block';
    }
  }, 400);
}

function goToStep2(){
  if(!usernameAvailable) return;
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
}

function goToStep1(){
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
}

function selectSetupClass(cls){
  selectedClass = cls;
  document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.class-card[data-class="${cls}"]`).classList.add('selected');
  document.getElementById('finishBtn').disabled = false;
}

async function finishSetup(){
  if(!selectedClass || !usernameAvailable) return;

  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');

  try{
    if (db) {
      // Reserve username FIRST (atomic)
      await db.collection('usernames').doc(selectedUsername).set({
        uid: UID,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Create player document
      const now = firebase.firestore.FieldValue.serverTimestamp();
      const playerData = {
        uid: UID,
        email: EMAIL,
        username: selectedUsername,
        class: selectedClass,
        level: 1,
        xp: 0,
        xpToNext: 35,
        gold: 100,
        stamina: 100,
        maxStamina: 100,
        hp: 100,
        maxHp: 100,
        mana: 20,
        maxMana: 20,
        stats: {
          attack: 10,
          defense: 5,
          speed: 10,
          crit: 5,
          dodge: 5
        },
        resources: {
          wood: 0, stone: 0, food: 0, coal: 0, iron: 0, gold_ore: 0,
          cotton: 0, leather: 0, sand: 0, gemstones: 0, water: 0,
          salt: 0, copper: 0, silver: 0, zinc: 0, lead: 0,
          magic_stones: 0, herbs: 0, honey: 0
        },
        companies: [{
          id: 1,
          resource: 'wood',
          engineLevel: 1,
          stored: 0,
          disabled: false
        }],
        gear: {
          weapon: null,
          armor: null,
          helmet: null,
          boots: null,
          accessory: null,
          gloves: null
        },
        gearBag: [],
        skills: {
          health: 0, damage: 0, defense: 0,
          stamina: 0, storage: 0, profit: 0
        },
        skillPoints: 0,
        classSkills: {},
        classSkillPoints: 0,
        prestige: {
          points: 0, gatherBonus: 0, sellBonus: 0,
          energyBonus: 0, storageBonus: 0
        },
        combat: { wins: 0, losses: 0 },
        totalGoldEarned: 100,
        shards: 0,
        gems: 0,
        createdAt: now,
        lastLogin: now
      };

      await db.collection('players').doc(UID).set(playerData);
    }

    // Go to game (works even without db)
    enterGame();

  } catch(err){
    console.error(err);
    overlay.classList.remove('active');
    alert('Account creation failed: ' + err.message);
  }
}
