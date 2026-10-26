// Recommandation du nombre d'imposteurs et contrôle d'équilibrage.

import { MIN_UNDERCOVER, clamp, el, maxImpostors, state } from './core.js';
import { duplicateNames, readNameInputs } from './groups.js';
import { saveOptions } from './options.js';
import { updateUnderCounter } from './setup.js';

// ======================================================================
// Suggestion et contrôle d'équilibrage
// ======================================================================
// Total d'imposteurs recommandé (Undercover + Mr. White + Espion), environ 1 pour 4 joueurs.
function recommendedImpostors(n) {
  return Math.max(1, Math.floor((n + 1) / 4));
}

function recommendedUndercover(n) {
  var cap = maxImpostors(n);
  var others = state.mrWhiteCount + state.espionCount + (state.roles.fauxfrere ? 1 : 0);
  return clamp(recommendedImpostors(n) - others, MIN_UNDERCOVER, Math.max(MIN_UNDERCOVER, cap - others));
}

export function applyAutoUndercover() {
  if (state.autoUndercover) {
    state.undercoverCount = recommendedUndercover(state.playerCount);
  }
}

function plural(n, one, many) {
  return n + ' ' + (n > 1 ? many : one);
}

export function renderAutoUnderUI() {
  if (!el.autoUndercover) return;
  el.autoUndercover.checked = state.autoUndercover;
  var rec = recommendedImpostors(state.playerCount);
  el.autoUnderHint.textContent = 'Recommandé pour ' + state.playerCount + ' joueurs : ' +
    plural(rec, 'imposteur', 'imposteurs') + ' au total (Undercover, Mr. White et Espion compris).';
}

export function manualUndercoverChange() {
  if (state.autoUndercover) {
    state.autoUndercover = false;
    saveOptions();
  }
}

function specialSlots() {
  return (state.roles.idiot ? 1 : 0) + (state.roles.fantome ? 1 : 0) + (state.roles.mime ? 1 : 0) +
    (state.roles.procureur ? 1 : 0) + (state.roles.amoureux ? 2 : 0) + (state.roles.mytho ? 1 : 0) +
    (state.roles.voyeur ? 1 : 0) + (state.roles.janus ? 1 : 0) + (state.roles.fauxfrere ? 1 : 0);
}

function computeBalanceNotes() {
  var n = state.playerCount;
  // Le Faux-Frère compte comme un imposteur de plus (il gagne avec eux).
  var realImp = state.undercoverCount + state.mrWhiteCount + state.espionCount;
  var imp = realImp + (state.roles.fauxfrere ? 1 : 0);
  var rec = recommendedImpostors(n);
  var slots = specialSlots();
  var notes = [];

  if (slots > n) {
    notes.push({
      level: 'warn',
      text: 'Les rôles spéciaux activés demandent ' + slots + ' joueurs différents : avec ' + n +
        ' joueurs, certains ne pourront pas être attribués.'
    });
  } else if (slots > 0 && slots / n > 0.4) {
    notes.push({
      level: 'warn',
      text: 'Beaucoup de rôles spéciaux (' + slots + ' joueurs concernés sur ' + n +
        ') : la partie risque de devenir confuse. Désactivez-en quelques-uns.'
    });
  }

  if (imp > rec + 1) {
    notes.push({
      level: 'warn',
      text: 'Beaucoup d\'imposteurs (' + imp + ' sur ' + n + (state.roles.fauxfrere ? ', Faux-Frère compris' : '') +
        ') : les Civils auront du mal à gagner. Recommandé : ' + rec + '.'
    });
  } else if (imp < rec) {
    notes.push({
      level: 'info',
      text: 'Peu d\'imposteurs pour ' + n + ' joueurs : la manche risque d\'être longue. Recommandé : ' + rec + '.'
    });
  }

  if (state.roles.amoureux && n < 8) {
    notes.push({
      level: 'warn',
      text: 'Les Amoureux sont conçus pour 8 joueurs ou plus : en dessous, la partie peut être déséquilibrée.'
    });
  }

  var bigTable = [];
  if (state.roles.voyeur) bigTable.push('le Voyeur');
  if (state.roles.fauxfrere) bigTable.push('le Faux-Frère');
  if (bigTable.length && n < 8) {
    notes.push({
      level: 'warn',
      text: (bigTable.join(' et ').charAt(0).toUpperCase() + bigTable.join(' et ').slice(1)) + (bigTable.length > 1 ? ' sont conçus' : ' est conçu') +
        ' pour 8 joueurs ou plus : en dessous, la partie peut être déséquilibrée.'
    });
  }

  if (state.roles.voyeur && n - realImp - 1 < 2) {
    notes.push({
      level: 'warn',
      text: 'Le Voyeur a besoin d\'au moins 2 joueurs non imposteurs en plus de lui : il ne pourra pas recevoir ses 3 noms.'
    });
  }

  if (n <= 4 && (state.mrWhiteCount > 0 || state.espionCount > 0 || state.roles.idiot)) {
    notes.push({
      level: 'info',
      text: 'À 4 joueurs ou moins, Mr. White, l\'Espion et l\'Idiot du village sont très exposés dès le premier vote.'
    });
  }

  var dups = duplicateNames(readNameInputs());
  if (dups.length) {
    notes.push({
      level: 'warn',
      text: 'Deux joueurs portent le même nom (' + dups[0] + ') : leurs statistiques seront confondues.'
    });
  }

  return notes;
}

export function renderBalance() {
  if (!el.balanceBox) return;
  var notes = computeBalanceNotes();
  var n = state.playerCount;
  el.balanceBox.innerHTML = '';
  el.balanceBox.className = 'balance';

  var title = document.createElement('h3');
  title.className = 'balance__title';
  title.textContent = 'Équilibrage';
  el.balanceBox.appendChild(title);

  if (!notes.length) {
    var ok = document.createElement('p');
    ok.className = 'balance__item balance__item--ok';
    ok.textContent = 'Configuration équilibrée pour ' + n + ' joueurs.';
    el.balanceBox.appendChild(ok);
  } else {
    notes.forEach(function (note) {
      var p = document.createElement('p');
      p.className = 'balance__item balance__item--' + note.level;
      p.textContent = note.text;
      el.balanceBox.appendChild(p);
    });
  }

  var recUnder = recommendedUndercover(n);
  if (!state.autoUndercover && state.undercoverCount !== recUnder) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--ghost btn--small balance__apply';
    btn.textContent = 'Appliquer la recommandation (' + plural(recUnder, 'Undercover', 'Undercovers') + ')';
    btn.addEventListener('click', function () {
      state.undercoverCount = recUnder;
      updateUnderCounter();
    });
    el.balanceBox.appendChild(btn);
  }
}

export function bootBalance() {
  el.autoUndercover.addEventListener('change', function () {
    state.autoUndercover = el.autoUndercover.checked;
    saveOptions();
    updateUnderCounter();
  });
}