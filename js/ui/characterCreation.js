// ============================================================================
// CHARACTER CREATION — shown once per account, right after first sign-in,
// before the player has a Firestore player doc (section 7).
// ============================================================================

import { el, card, button, icon } from './components.js';
import { CLASSES, CLASS_IDS } from '../data/classes.js';
import { createPlayerDoc } from '../services/firestore.js';
import { toast } from './toast.js';

export function renderCharacterCreation(outlet, uid, onComplete) {
  let step = 1;
  let username = '';
  let selectedClass = null;
  let submitting = false;

  function draw() {
    outlet.innerHTML = '';
    outlet.appendChild(
      step === 1 ? stepUsername() : stepClass()
    );
  }

  function stepUsername() {
    const input = el('input', {
      class: 'text-input',
      type: 'text',
      placeholder: 'Choose your username',
      maxlength: '20',
      value: username,
      oninput: (e) => { username = e.target.value; },
    });
    return card('Create Your Character — Step 1 of 2', [
      el('p', {}, 'Choose a username. 3–20 characters.'),
      input,
      button('Continue', () => {
        const trimmed = username.trim();
        if (trimmed.length < 3 || trimmed.length > 20) {
          toast.error('Username must be 3–20 characters.');
          return;
        }
        username = trimmed;
        step = 2;
        draw();
      }),
    ]);
  }

  function stepClass() {
    const classCards = CLASS_IDS.map(id => {
      const cls = CLASSES[id];
      const isSelected = selectedClass === id;
      return el('div', {
        class: `class-pick${isSelected ? ' class-pick--selected' : ''}`,
        onClick: () => { selectedClass = id; draw(); },
      }, [
        icon(id, 'class-pick__icon'),
        el('h4', {}, cls.name),
        el('p', { class: 'muted' }, cls.role),
        el('p', { class: 'muted' }, cls.description),
      ]);
    });

    return card('Create Your Character — Step 2 of 2', [
      el('div', { class: 'class-grid' }, classCards),
      el('div', {}, [
        button('Back', () => { step = 1; draw(); }, { variant: 'secondary' }),
        button(submitting ? 'Creating…' : 'Begin Adventure', async () => {
          if (!selectedClass) { toast.error('Choose a class first.'); return; }
          if (submitting) return;
          submitting = true;
          draw();
          try {
            const player = await createPlayerDoc(uid, username, selectedClass);
            toast.success(`Welcome to Arcadia, ${username}!`);
            onComplete(player);
          } catch (err) {
            toast.error(err.message || 'Could not create character.');
            submitting = false;
            draw();
          }
        }, { disabled: !selectedClass || submitting }),
      ]),
    ]);
  }

  draw();
}
