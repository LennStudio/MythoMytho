// Écran de configuration : compteurs, rôles, noms des joueurs, minuteur et récapitulatif.

import { applyAutoUndercover, manualUndercoverChange, renderAutoUnderUI, renderBalance } from './balance.js';
import { DIFFICULTY_LABELS, MAX_PLAYERS, MIN_PLAYERS, MIN_UNDERCOVER, clamp, el, maxImpostors, state } from './core.js';
import { onNamesChanged } from './groups.js';
import { selectedThemeKeys } from './themes.js';

var TIMER_STORAGE_KEY = 'undercover_timer_settings_v1';

function loadTimerSettings() {
  try {
    var raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : null;
  } catch (e) {
    return null;
  }
}

function saveTimerSettings() {
  try {
    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
      enabled: state.timerEnabled,
      durationMin: state.timerDurationMin
    }));
  } catch (e) {}
}

export function renderNameFields() {
  var count = state.playerCount;
  var existing = el.namesGrid.querySelectorAll('input[data-name-input]');
  var previousValues = [];
  existing.forEach(function (input) {
    previousValues.push(input.value);
  });

  el.namesGrid.innerHTML = '';
  for (var i = 0; i < count; i++) {
    var wrap = document.createElement('div');
    wrap.className = 'name-field';

    var label = document.createElement('label');
    label.setAttribute('for', 'nameInput' + i);
    label.textContent = 'Joueur ' + (i + 1);

    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'nameInput' + i;
    input.maxLength = 20;
    input.setAttribute('data-name-input', 'true');
    input.placeholder = 'Joueur ' + (i + 1);
    if (previousValues[i]) input.value = previousValues[i];

    wrap.appendChild(label);
    wrap.appendChild(input);
    el.namesGrid.appendChild(wrap);
  }
  onNamesChanged();
}

export function updateCounter() {
  el.countDisplay.textContent = state.playerCount;
  el.countMinus.disabled = state.playerCount <= MIN_PLAYERS;
  el.countPlus.disabled = state.playerCount >= MAX_PLAYERS;
  renderSetupRecap();
}

export function clampRoleCounts() {
  var cap = maxImpostors(state.playerCount);
  state.undercoverCount = clamp(state.undercoverCount, MIN_UNDERCOVER, cap);
  state.mrWhiteCount = clamp(state.mrWhiteCount, 0, Math.max(0, cap - state.undercoverCount));
  state.espionCount = clamp(state.espionCount, 0, Math.max(0, cap - state.undercoverCount - state.mrWhiteCount));
}

export function updateUnderCounter() {
  applyAutoUndercover();
  clampRoleCounts();
  var cap = maxImpostors(state.playerCount);
  var underMax = Math.max(MIN_UNDERCOVER, cap - state.mrWhiteCount - state.espionCount);
  var mrwhiteMax = Math.max(0, cap - state.undercoverCount - state.espionCount);
  var espionMax = Math.max(0, cap - state.undercoverCount - state.mrWhiteCount);

  el.underDisplay.textContent = state.undercoverCount;
  el.underRange.textContent = 'de ' + MIN_UNDERCOVER + ' à ' + underMax;
  el.underMinus.disabled = state.undercoverCount <= MIN_UNDERCOVER;
  el.underPlus.disabled = state.undercoverCount >= underMax;

  el.mrwhiteDisplay.textContent = state.mrWhiteCount;
  el.mrwhiteRange.textContent = 'de 0 à ' + mrwhiteMax;
  el.mrwhiteMinus.disabled = state.mrWhiteCount <= 0;
  el.mrwhitePlus.disabled = state.mrWhiteCount >= mrwhiteMax;

  el.espionDisplay.textContent = state.espionCount;
  el.espionRange.textContent = 'de 0 à ' + espionMax;
  el.espionMinus.disabled = state.espionCount <= 0;
  el.espionPlus.disabled = state.espionCount >= espionMax;

  renderAutoUnderUI();
  renderRolesSummary();
}

var TIMER_MIN_DURATION = 1;

var TIMER_MAX_DURATION = 15;

function renderTimerSetupUI() {
  if (el.timerEnabledInput) el.timerEnabledInput.checked = state.timerEnabled;
  if (el.timerDurationField) el.timerDurationField.style.display = state.timerEnabled ? '' : 'none';
  if (el.timerExtras) el.timerExtras.style.display = state.timerEnabled ? '' : 'none';
  if (el.timerSoundInput) el.timerSoundInput.checked = state.timerSound;
  if (el.timerDisplaySetup) el.timerDisplaySetup.textContent = state.timerDurationMin;
  if (el.timerMinus) el.timerMinus.disabled = state.timerDurationMin <= TIMER_MIN_DURATION;
  if (el.timerPlus) el.timerPlus.disabled = state.timerDurationMin >= TIMER_MAX_DURATION;
  renderComfortSummary();
  renderSetupRecap();
}

// Résumé du bloc 5 « Minuteur & confidentialité » (affiché dans l'en-tête replié).
export function renderComfortSummary() {
  if (!el.timerSummary) return;
  var privacy = state.privacy === 'auto' ? ('masquage ' + state.autoHideSec + ' s') :
    (state.privacy === 'hold' ? 'maintenir' : 'standard');
  var parts = [state.timerEnabled ? (state.timerDurationMin + ' min') : 'sans minuteur', privacy];
  if (!state.showRole) parts.push('rôle masqué');
  el.timerSummary.textContent = parts.join(' · ');
}

function renderRolesSummary() {
  if (el.rolesSummary) {
    var parts = [];
    if (state.mrWhiteCount > 0) parts.push(state.mrWhiteCount + ' Mr. White');
    if (state.espionCount > 0) parts.push(state.espionCount + (state.espionCount > 1 ? ' Espions' : ' Espion'));
    var labels = [];
    if (state.roles.idiot) labels.push('Idiot du village');
    if (state.roles.fantome) labels.push('Fantôme');
    if (state.roles.mime) labels.push('Mime');
    if (state.roles.procureur) labels.push('Procureur');
    if (state.roles.amoureux) labels.push('Amoureux');
    if (labels.length) parts.push(labels.join(', '));
    el.rolesSummary.textContent = parts.length ? parts.join(' + ') : 'Aucun rôle activé';
  }
  renderSetupRecap();
}

export function renderSetupRecap() {
  if (!el.setupRecap) return;
  renderBalance();
  var chips = [];
  chips.push(state.playerCount + ' joueurs');
  chips.push(state.undercoverCount + (state.undercoverCount > 1 ? ' Undercovers' : ' Undercover'));
  if (state.mrWhiteCount > 0) chips.push(state.mrWhiteCount + ' Mr. White');
  if (state.espionCount > 0) chips.push(state.espionCount + (state.espionCount > 1 ? ' Espions' : ' Espion'));

  var themeCount = selectedThemeKeys().length;
  chips.push(themeCount ? (themeCount + (themeCount > 1 ? ' thèmes' : ' thème')) : 'aucun thème');

  var specialCount = Object.keys(state.roles).filter(function (k) {
    return state.roles[k];
  }).length;
  if (specialCount) {
    chips.push(specialCount + (specialCount > 1 ? ' rôles spéciaux' : ' rôle spécial'));
  }

  if (state.difficulty) {
    chips.push('difficulté ' + DIFFICULTY_LABELS[state.difficulty].toLowerCase());
  }

  if (state.privacy !== 'standard') {
    chips.push(state.privacy === 'auto' ? ('masquage auto ' + state.autoHideSec + ' s') : 'maintenir pour révéler');
  }

  if (!state.showRole) {
    chips.push('rôle masqué sur la carte');
  }

  if (state.timerEnabled) {
    chips.push('minuteur ' + state.timerDurationMin + ' min');
  }

  el.setupRecap.innerHTML = '';
  chips.forEach(function (text) {
    var chip = document.createElement('span');
    chip.className = 'recap-chip';
    chip.textContent = text;
    el.setupRecap.appendChild(chip);
  });
}

export function bootSetup() {
  el.countMinus.addEventListener('click', function () {
    state.playerCount = clamp(state.playerCount - 1, MIN_PLAYERS, MAX_PLAYERS);
    updateCounter();
    updateUnderCounter();
    renderNameFields();
  });

  el.countPlus.addEventListener('click', function () {
    state.playerCount = clamp(state.playerCount + 1, MIN_PLAYERS, MAX_PLAYERS);
    updateCounter();
    updateUnderCounter();
    renderNameFields();
  });

  el.underMinus.addEventListener('click', function () {
    manualUndercoverChange();
    state.undercoverCount = clamp(state.undercoverCount - 1, MIN_UNDERCOVER, maxImpostors(state.playerCount));
    updateUnderCounter();
  });

  el.underPlus.addEventListener('click', function () {
    manualUndercoverChange();
    var cap = maxImpostors(state.playerCount);
    state.undercoverCount = clamp(state.undercoverCount + 1, MIN_UNDERCOVER, Math.max(MIN_UNDERCOVER, cap - state.mrWhiteCount - state.espionCount));
    updateUnderCounter();
  });

  el.mrwhiteMinus.addEventListener('click', function () {
    state.mrWhiteCount = clamp(state.mrWhiteCount - 1, 0, maxImpostors(state.playerCount));
    updateUnderCounter();
  });

  el.mrwhitePlus.addEventListener('click', function () {
    var cap = maxImpostors(state.playerCount);
    state.mrWhiteCount = clamp(state.mrWhiteCount + 1, 0, Math.max(0, cap - state.undercoverCount - state.espionCount));
    updateUnderCounter();
  });

  el.espionMinus.addEventListener('click', function () {
    state.espionCount = clamp(state.espionCount - 1, 0, maxImpostors(state.playerCount));
    updateUnderCounter();
  });

  el.espionPlus.addEventListener('click', function () {
    var cap = maxImpostors(state.playerCount);
    state.espionCount = clamp(state.espionCount + 1, 0, Math.max(0, cap - state.undercoverCount - state.mrWhiteCount));
    updateUnderCounter();
  });

  el.roleIdiot.addEventListener('change', function () {
    state.roles.idiot = el.roleIdiot.checked;
    renderRolesSummary();
  });

  el.roleFantome.addEventListener('change', function () {
    state.roles.fantome = el.roleFantome.checked;
    renderRolesSummary();
  });

  el.roleMime.addEventListener('change', function () {
    state.roles.mime = el.roleMime.checked;
    renderRolesSummary();
  });

  el.roleProcureur.addEventListener('change', function () {
    state.roles.procureur = el.roleProcureur.checked;
    renderRolesSummary();
  });

  el.roleAmoureux.addEventListener('change', function () {
    state.roles.amoureux = el.roleAmoureux.checked;
    renderRolesSummary();
  });

  if (el.timerEnabledInput) {
    el.timerEnabledInput.addEventListener('change', function () {
      state.timerEnabled = el.timerEnabledInput.checked;
      saveTimerSettings();
      renderTimerSetupUI();
    });
  }

  if (el.timerMinus) {
    el.timerMinus.addEventListener('click', function () {
      state.timerDurationMin = clamp(state.timerDurationMin - 1, TIMER_MIN_DURATION, TIMER_MAX_DURATION);
      saveTimerSettings();
      renderTimerSetupUI();
    });
  }

  if (el.timerPlus) {
    el.timerPlus.addEventListener('click', function () {
      state.timerDurationMin = clamp(state.timerDurationMin + 1, TIMER_MIN_DURATION, TIMER_MAX_DURATION);
      saveTimerSettings();
      renderTimerSetupUI();
    });
  }

  (function initTimerSettings() {
    var saved = loadTimerSettings();
    if (saved) {
      if (typeof saved.enabled === 'boolean') state.timerEnabled = saved.enabled;
      if (typeof saved.durationMin === 'number') {
        state.timerDurationMin = clamp(saved.durationMin, TIMER_MIN_DURATION, TIMER_MAX_DURATION);
      }
    }
    renderTimerSetupUI();
  })();

  if (el.rulesToggle && el.rulesText) {
    el.rulesToggle.addEventListener('click', function () {
      var expanded = el.rulesToggle.getAttribute('aria-expanded') === 'true';
      el.rulesToggle.setAttribute('aria-expanded', String(!expanded));
      el.rulesText.hidden = expanded;
    });
  }
}