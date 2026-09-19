// ============================================================================
// BATTLE — renders the active-battle UI (section 24) and wires its three
// actions to the server-authoritative Cloud Functions. Battle state comes
// straight from the player doc's real-time listener (battle.activeBattle),
// so this file never mutates state itself — it only calls the server and
// lets the resulting Firestore snapshot re-render the screen.
// ============================================================================

import { el, card, button, statBar } from './components.js';
import { battleAction } from '../services/functions.js';
import { toast } from './toast.js';

let submitting = false;

export function renderBattle(outlet, player) {
  const battle = player.activeBattle;
  const outer = el('div', { class: 'battle-screen' });

  outer.appendChild(el('h3', {}, `${battle.monsterName} — Round ${battle.round}`));
  outer.appendChild(statBar(battle.monsterName, battle.monsterHp, battle.monsterMaxHp, 'health'));
  outer.appendChild(statBar('You', player.health, player.maxHealth, 'health'));

  outer.appendChild(el('div', { class: 'battle-log' },
    battle.log.slice().reverse().map(line => el('div', { class: 'battle-log__line' }, line))
  ));

  const act = (action) => async () => {
    if (submitting) return;
    submitting = true;
    try {
      const result = await battleAction(action);
      if (result.victory) toast.success(`Victory! +${result.xpGained} XP, +${result.goldGained} gold${result.leveledUp ? ' — Level up!' : ''}`);
      if (result.defeat) toast.error('You were defeated and staggered back to town.');
      if (result.fled) toast.info('You fled the battle.');
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      submitting = false;
    }
  };

  outer.appendChild(el('div', { class: 'battle-actions' }, [
    button('⚔ Attack', act('attack'), { variant: 'primary' }),
    button('🛡 Defend', act('defend'), { variant: 'secondary' }),
    button('Use Item', () => toast.info('Battle items arrive in Phase 5 (Inventory).'), { variant: 'secondary', disabled: true }),
    button('Flee', act('flee'), { variant: 'danger' }),
  ]));

  outlet.appendChild(card(`Battle — ${battle.zoneId[0].toUpperCase()}${battle.zoneId.slice(1)}`, [outer]));
}
