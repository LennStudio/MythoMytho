// Mots : chargement de words.json, données de « Mes paires », difficulté, tirage des paires et grille des thèmes.

import { DIFFICULTY_LABELS, MAX_WORD_LENGTH, el, normalizeWord, pairDifficulty, randomInt, showToast, state } from './core.js';
import { renderSetupRecap } from './setup.js';

// Les paires de mots vivent dans words.json (chargé au démarrage, précaché par le service worker).
// Format d'une paire : [mot1, mot2, difficulté] — 1 = facile, 2 = moyenne, 3 = difficile.
var WORD_THEMES = [];

export var wordsLoaded = false;

var WORDS_URL = 'words.json';

export var CUSTOM_THEME_KEY = 'perso';

var CUSTOM_STORAGE_KEY = 'undercover_custom_pairs_v1';

export var MAX_CUSTOM_PAIRS = 300;

export function sanitizePair(raw) {
  if (!Array.isArray(raw) || raw.length < 2) return null;
  var a = String(raw[0] == null ? '' : raw[0]).replace(/\s+/g, ' ').trim();
  var b = String(raw[1] == null ? '' : raw[1]).replace(/\s+/g, ' ').trim();
  if (!a || !b || a.length > MAX_WORD_LENGTH || b.length > MAX_WORD_LENGTH) return null;
  if (normalizeWord(a) === normalizeWord(b)) return null;
  var d = parseInt(raw[2], 10);
  return [a, b, (d === 1 || d === 3) ? d : 2];
}

export function pairKey(pair) {
  return [normalizeWord(pair[0]), normalizeWord(pair[1])].sort().join('|');
}

function loadCustomPairs() {
  try {
    var raw = window.localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    var seen = {};
    var out = [];
    parsed.forEach(function (item) {
      var p = sanitizePair(item);
      if (!p) return;
      var k = pairKey(p);
      if (seen[k]) return;
      seen[k] = true;
      out.push(p);
    });
    return out.slice(0, MAX_CUSTOM_PAIRS);
  } catch (e) {
    return [];
  }
}

export var customPairs = loadCustomPairs();

export function saveCustomPairs() {
  try {
    window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customPairs));
  } catch (e) {}
}

function customTheme() {
  return {
    key: CUSTOM_THEME_KEY,
    label: 'Mes paires',
    desc: 'Vos propres paires de mots, enregistrées sur cet appareil.',
    pairs: customPairs,
    custom: true
  };
}

function allThemes() {
  return WORD_THEMES.concat([customTheme()]);
}

function getTheme(key) {
  return allThemes().filter(function (t) {
    return t.key === key;
  })[0];
}

function countPairs(theme) {
  if (!state.difficulty) return theme.pairs.length;
  return theme.pairs.filter(function (pair) {
    return pairDifficulty(pair) === state.difficulty;
  }).length;
}

export function pairId(themeKey, pair) {
  return themeKey + '::' + pair[0] + '::' + pair[1];
}

var PAIR_STORAGE_KEY = 'undercover_used_pairs_v1';

function loadUsedPairs() {
  try {
    var raw = window.localStorage.getItem(PAIR_STORAGE_KEY);
    if (!raw) return {};
    var parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (e) {
    return {};
  }
}

export function saveUsedPairs() {
  try {
    window.localStorage.setItem(PAIR_STORAGE_KEY, JSON.stringify(usedPairsMap));
  } catch (e) {}
}

export var usedPairsMap = loadUsedPairs();

export function renderThemeToggles() {
  el.themesGrid.innerHTML = '';
  allThemes().forEach(function (theme) {
    var label = document.createElement('label');
    label.className = 'toggle-item';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'theme-' + theme.key;
    input.checked = !!state.selectedThemes[theme.key];
    input.addEventListener('change', function () {
      state.selectedThemes[theme.key] = input.checked;
      renderThemesSummary();
    });

    var span = document.createElement('span');

    var titleRow = document.createElement('span');
    titleRow.className = 'toggle-item__title-row';
    var strong = document.createElement('strong');
    strong.textContent = theme.label;
    var count = document.createElement('span');
    count.className = 'toggle-item__count';
    var shown = countPairs(theme);
    count.textContent = shown + (shown > 1 ? ' paires' : ' paire');
    titleRow.appendChild(strong);
    titleRow.appendChild(count);

    var small = document.createElement('small');
    small.textContent = theme.desc;

    span.appendChild(titleRow);
    span.appendChild(small);

    label.appendChild(input);
    label.appendChild(span);
    el.themesGrid.appendChild(label);
  });
  renderThemesSummary();
}

function renderThemesSummary() {
  if (el.themesSummary) {
    var n = selectedThemeKeys().length;
    el.themesSummary.textContent = n === 0 ?
      'Aucun thème sélectionné' :
      (n + (n > 1 ? ' thèmes sélectionnés' : ' thème sélectionné'));
  }
  renderCustomCountHint();
  renderSetupRecap();
}

export function selectedThemeKeys() {
  return allThemes().filter(function (t) {
      return state.selectedThemes[t.key];
    })
    .map(function (t) {
      return t.key;
    });
}

function themePool(themeKeys, difficulty) {
  var pool = [];
  themeKeys.forEach(function (key) {
    var theme = getTheme(key);
    if (!theme) return;
    theme.pairs.forEach(function (pair) {
      if (difficulty && pairDifficulty(pair) !== difficulty) return;
      pool.push({
        id: pairId(key, pair),
        key: key,
        pair: pair
      });
    });
  });
  return pool;
}

export function pickWordPair() {
  var themeKeys = selectedThemeKeys();
  if (!themeKeys.length) themeKeys = ['classique'];

  var pool = themePool(themeKeys, state.difficulty);
  if (!pool.length && state.difficulty) {
    pool = themePool(themeKeys, 0);
    if (pool.length) {
      showToast('Aucune paire « ' + DIFFICULTY_LABELS[state.difficulty].toLowerCase() +
        ' » dans les thèmes choisis — toutes les difficultés sont utilisées.', 3600);
    }
  }
  if (!pool.length) {
    pool = themePool(['classique'], 0);
    showToast('Aucune paire disponible pour cette sélection — le thème Général est utilisé.', 3600);
  }

  var available = pool.filter(function (entry) {
    return !usedPairsMap[entry.id];
  });
  if (!available.length) {
    pool.forEach(function (entry) {
      delete usedPairsMap[entry.id];
    });
    available = pool.slice();
    showToast('Toutes les paires des thèmes sélectionnés ont été utilisées — le stock repart à zéro.');
  }

  var choice = available[randomInt(available.length)];
  usedPairsMap[choice.id] = true;
  saveUsedPairs();

  var flip = Math.random() < 0.5;
  return {
    civilWord: flip ? choice.pair[0] : choice.pair[1],
    undercoverWord: flip ? choice.pair[1] : choice.pair[0],
    themeKey: choice.key,
    difficulty: pairDifficulty(choice.pair)
  };
}

export function renderCustomCountHint() {
  if (!el.customCountHint) return;
  var n = customPairs.length;
  el.customCountHint.textContent = n ? (n + (n > 1 ? ' paires enregistrées' : ' paire enregistrée')) : 'Aucune paire enregistrée';
}

// ======================================================================
// Chargement de words.json
// ======================================================================
var wordsLoading = false;

function renderThemesStatus(kind) {
  el.themesGrid.innerHTML = '';
  var box = document.createElement('div');
  box.className = 'themes-status';
  var text = document.createElement('p');
  text.className = 'hint-text';
  if (kind === 'loading') {
    text.textContent = 'Chargement des mots…';
    box.appendChild(text);
  } else {
    text.textContent = 'Impossible de charger les mots. Vérifiez la connexion puis réessayez.';
    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn--ghost btn--small';
    retry.textContent = 'Réessayer';
    retry.addEventListener('click', loadWords);
    box.appendChild(text);
    box.appendChild(retry);
  }
  el.themesGrid.appendChild(box);
}

export function loadWords() {
  if (wordsLoading) return;
  wordsLoading = true;
  renderThemesStatus('loading');
  fetch(WORDS_URL).then(function (res) {
    if (!res.ok) throw new Error('http ' + res.status);
    return res.json();
  }).then(function (data) {
    if (!data || !Array.isArray(data.themes)) throw new Error('format');
    var themes = [];
    data.themes.forEach(function (t) {
      if (!t || typeof t.key !== 'string' || !Array.isArray(t.pairs)) return;
      var pairs = [];
      t.pairs.forEach(function (p) {
        if (!Array.isArray(p) || p.length < 2) return;
        pairs.push([String(p[0]), String(p[1]), pairDifficulty(p)]);
      });
      if (!pairs.length) return;
      themes.push({
        key: t.key,
        label: String(t.label || t.key),
        desc: String(t.desc || ''),
        pairs: pairs
      });
    });
    if (!themes.length) throw new Error('empty');
    WORD_THEMES = themes;
    wordsLoaded = true;
    wordsLoading = false;
    renderThemeToggles();
  }).catch(function () {
    wordsLoading = false;
    renderThemesStatus('error');
  });
}
