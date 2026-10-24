// Options mémorisées : difficulté, confidentialité des cartes, son, Undercovers automatiques.

import { previewSound } from './audio.js';
import { el, state } from './core.js';
import { renderComfortSummary, renderSetupRecap } from './setup.js';
import { renderCustomCountHint, renderThemeToggles } from './themes.js';

var OPTIONS_STORAGE_KEY = 'undercover_options_v1';

// ======================================================================
// Options : difficulté, confidentialité des cartes, son
// ======================================================================
var AUTO_HIDE_CHOICES = [5, 8, 12, 20];

export function loadOptions() {
  try {
    var raw = window.localStorage.getItem(OPTIONS_STORAGE_KEY);
    if (!raw) return;
    var o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return;
    if (o.difficulty === 0 || o.difficulty === 1 || o.difficulty === 2 || o.difficulty === 3) state.difficulty = o.difficulty;
    if (o.difficultyLevel === 1 || o.difficultyLevel === 2 || o.difficultyLevel === 3) state.difficultyLevel = o.difficultyLevel;
    else if (state.difficulty) state.difficultyLevel = state.difficulty;
    if (o.privacy === 'standard' || o.privacy === 'auto' || o.privacy === 'hold') state.privacy = o.privacy;
    if (AUTO_HIDE_CHOICES.indexOf(o.autoHideSec) !== -1) state.autoHideSec = o.autoHideSec;
    if (typeof o.timerSound === 'boolean') state.timerSound = o.timerSound;
    if (typeof o.autoUndercover === 'boolean') state.autoUndercover = o.autoUndercover;
    if (typeof o.showRole === 'boolean') state.showRole = o.showRole;
  } catch (e) {}
}

export function saveOptions() {
  try {
    window.localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify({
      difficulty: state.difficulty,
      difficultyLevel: state.difficultyLevel,
      privacy: state.privacy,
      autoHideSec: state.autoHideSec,
      timerSound: state.timerSound,
      autoUndercover: state.autoUndercover,
      showRole: state.showRole
    }));
  } catch (e) {}
}

var DIFFICULTY_HINTS = {
  0: 'Toutes les paires sont mélangées.',
  1: 'Mots plutôt éloignés : l\'Undercover se repère assez facilement.',
  2: 'Mots du même univers : un bon équilibre pour la plupart des groupes.',
  3: 'Mots quasi identiques : l\'Undercover est très difficile à démasquer.'
};

function renderDifficultyUI() {
  var on = state.difficulty !== 0;
  el.difficultyEnabledInput.checked = on;
  el.difficultyLevels.hidden = !on;
  el.difficultyRadios.forEach(function (r) {
    r.checked = on && parseInt(r.value, 10) === state.difficulty;
  });
  if (el.difficultyHint) el.difficultyHint.textContent = DIFFICULTY_HINTS[state.difficulty];
}

function renderPrivacyUI() {
  el.privacyRadios.forEach(function (r) {
    r.checked = r.value === state.privacy;
  });
  el.autoHideField.style.display = state.privacy === 'auto' ? '' : 'none';
  el.autoHideSelect.value = String(state.autoHideSec);
  el.showRoleInput.checked = state.showRole;
  renderComfortSummary();
  renderSetupRecap();
}

export function initOptionsUI() {
  el.difficultyEnabledInput.addEventListener('change', function () {
    state.difficulty = el.difficultyEnabledInput.checked ? state.difficultyLevel : 0;
    saveOptions();
    renderDifficultyUI();
    renderThemeToggles();
  });

  el.difficultyRadios.forEach(function (r) {
    r.addEventListener('change', function () {
      if (!r.checked) return;
      state.difficulty = parseInt(r.value, 10);
      state.difficultyLevel = state.difficulty;
      saveOptions();
      renderDifficultyUI();
      renderThemeToggles();
    });
  });

  el.privacyRadios.forEach(function (r) {
    r.addEventListener('change', function () {
      if (!r.checked) return;
      state.privacy = r.value;
      saveOptions();
      renderPrivacyUI();
    });
  });

  el.autoHideSelect.addEventListener('change', function () {
    var v = parseInt(el.autoHideSelect.value, 10);
    state.autoHideSec = AUTO_HIDE_CHOICES.indexOf(v) !== -1 ? v : 8;
    saveOptions();
    renderPrivacyUI();
  });

  el.timerSoundInput.addEventListener('change', function () {
    state.timerSound = el.timerSoundInput.checked;
    saveOptions();
    if (state.timerSound) previewSound();
  });

  el.showRoleInput.addEventListener('change', function () {
    state.showRole = el.showRoleInput.checked;
    saveOptions();
    renderPrivacyUI();
  });

  renderDifficultyUI();
  renderPrivacyUI();
  renderCustomCountHint();
}