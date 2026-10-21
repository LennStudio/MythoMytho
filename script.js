(function () {
  "use strict";

  // Les paires de mots vivent dans words.json (chargé au démarrage, précaché par le service worker).
  // Format d'une paire : [mot1, mot2, difficulté] — 1 = facile, 2 = moyenne, 3 = difficile.
  var WORD_THEMES = [];
  var wordsLoaded = false;
  var WORDS_URL = 'words.json';

  var CUSTOM_THEME_KEY = 'perso';
  var CUSTOM_STORAGE_KEY = 'undercover_custom_pairs_v1';
  var OPTIONS_STORAGE_KEY = 'undercover_options_v1';
  var MAX_CUSTOM_PAIRS = 300;
  var MAX_WORD_LENGTH = 40;

  var DIFFICULTY_LABELS = {
    1: 'Facile',
    2: 'Moyenne',
    3: 'Difficile'
  };

  function normalizeWord(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function pairDifficulty(pair) {
    var d = pair[2];
    return (d === 1 || d === 3) ? d : 2;
  }

  function sanitizePair(raw) {
    if (!Array.isArray(raw) || raw.length < 2) return null;
    var a = String(raw[0] == null ? '' : raw[0]).replace(/\s+/g, ' ').trim();
    var b = String(raw[1] == null ? '' : raw[1]).replace(/\s+/g, ' ').trim();
    if (!a || !b || a.length > MAX_WORD_LENGTH || b.length > MAX_WORD_LENGTH) return null;
    if (normalizeWord(a) === normalizeWord(b)) return null;
    var d = parseInt(raw[2], 10);
    return [a, b, (d === 1 || d === 3) ? d : 2];
  }

  function pairKey(pair) {
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

  var customPairs = loadCustomPairs();

  function saveCustomPairs() {
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

  function pairId(themeKey, pair) {
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

  function saveUsedPairs() {
    try {
      window.localStorage.setItem(PAIR_STORAGE_KEY, JSON.stringify(usedPairsMap));
    } catch (e) {}
  }

  var usedPairsMap = loadUsedPairs();

  var THEME_STORAGE_KEY = 'undercover_theme_v1';
  var TIMER_STORAGE_KEY = 'undercover_timer_settings_v1';
  var SCORE_STORAGE_KEY = 'undercover_score_log_v1';
  var MAX_SCORE_ENTRIES = 200;

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

  function loadScoreLog() {
    try {
      var raw = window.localStorage.getItem(SCORE_STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveScoreLog() {
    try {
      window.localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scoreLog.slice(0, MAX_SCORE_ENTRIES)));
    } catch (e) {}
  }

  var scoreLog = loadScoreLog();

  var MIN_PLAYERS = 3;
  var MAX_PLAYERS = 20;
  var MIN_UNDERCOVER = 1;

  function maxImpostors(playerCount) {
    return Math.max(MIN_UNDERCOVER, Math.ceil(playerCount / 2) - 1);
  }

  var ROLE_INFO = {
    idiot: {
      label: 'Idiot du village',
      desc: 'Si tu es éliminé dès le tout premier vote, tu gagnes la partie à toi seul !'
    },
    fantome: {
      label: 'Fantôme',
      desc: 'Même éliminé, tu pourras continuer à voter aux prochains tours.'
    },
    mime: {
      label: 'Mime',
      desc: 'Décris ton mot uniquement par gestes, sans jamais parler.'
    },
    procureur: {
      label: 'Procureur',
      desc: 'En cas d\'égalité au vote, c\'est toi qui trancheras qui est éliminé.'
    }
  };

  var state = {
    playerCount: 6,
    undercoverCount: 1,
    mrWhiteCount: 0,
    espionCount: 0,
    roles: {
      idiot: false,
      fantome: false,
      mime: false,
      procureur: false,
      amoureux: false
    },
    players: [],
    round: 1,
    selectedThemes: {
      classique: true
    },
    openCardId: null,
    phase: 'reveal',
    pendingEliminationId: null,
    voteCount: 0,
    winner: null,
    winnerDetail: '',
    winnerReason: '',
    civilWordHint: '',
    timerEnabled: false,
    timerDurationMin: 3,
    timerRemaining: 0,
    timerRunning: false,
    timerHasEnded: false,
    timerStartedRound: false,
    difficulty: 0,
    privacy: 'standard',
    autoHideSec: 8,
    timerSound: true,
    mrWhiteGuess: true,
    civilWord: '',
    undercoverWord: '',
    pairTheme: '',
    pairDifficulty: 0,
    guessQueue: [],
    winnerPlayerId: null,
    autoUndercover: true
  };

  loadOptions();

  var el = {
    setupScreen: document.getElementById('setup'),
    gameScreen: document.getElementById('game'),
    countMinus: document.getElementById('countMinus'),
    countPlus: document.getElementById('countPlus'),
    countDisplay: document.getElementById('countDisplay'),
    underMinus: document.getElementById('underMinus'),
    underPlus: document.getElementById('underPlus'),
    underDisplay: document.getElementById('underDisplay'),
    underRange: document.getElementById('underRange'),
    mrwhiteMinus: document.getElementById('mrwhiteMinus'),
    mrwhitePlus: document.getElementById('mrwhitePlus'),
    mrwhiteDisplay: document.getElementById('mrwhiteDisplay'),
    mrwhiteRange: document.getElementById('mrwhiteRange'),
    espionMinus: document.getElementById('espionMinus'),
    espionPlus: document.getElementById('espionPlus'),
    espionDisplay: document.getElementById('espionDisplay'),
    espionRange: document.getElementById('espionRange'),
    roleIdiot: document.getElementById('roleIdiot'),
    roleFantome: document.getElementById('roleFantome'),
    roleMime: document.getElementById('roleMime'),
    roleProcureur: document.getElementById('roleProcureur'),
    roleAmoureux: document.getElementById('roleAmoureux'),
    themesGrid: document.getElementById('themesGrid'),
    namesGrid: document.getElementById('namesGrid'),
    startBtn: document.getElementById('startBtn'),
    rulesToggle: document.getElementById('rulesToggle'),
    rulesText: document.getElementById('rulesText'),
    themesSummary: document.getElementById('themesSummary'),
    rolesSummary: document.getElementById('rolesSummary'),
    setupRecap: document.getElementById('setupRecap'),

    timerEnabledInput: document.getElementById('timerEnabled'),
    timerDurationField: document.getElementById('timerDurationField'),
    timerMinus: document.getElementById('timerMinus'),
    timerPlus: document.getElementById('timerPlus'),
    timerDisplaySetup: document.getElementById('timerDisplay'),
    timerSummary: document.getElementById('timerSummary'),

    themeToggle: document.getElementById('themeToggle'),

    scoreLogToggle: document.getElementById('scoreLogToggle'),
    scoreLogBtnGame: document.getElementById('scoreLogBtnGame'),
    scoreModal: document.getElementById('scoreModal'),
    scoreScrim: document.getElementById('scoreScrim'),
    scoreEmptyState: document.getElementById('scoreEmptyState'),
    scoreContent: document.getElementById('scoreContent'),
    scoreLeaderboard: document.getElementById('scoreLeaderboard'),
    scoreHistory: document.getElementById('scoreHistory'),
    scoreResetBtn: document.getElementById('scoreResetBtn'),
    closeScoreBtn: document.getElementById('closeScoreBtn'),

    roundNumber: document.getElementById('roundNumber'),
    playerCountLabel: document.getElementById('playerCountLabel'),
    viewedCount: document.getElementById('viewedCount'),
    totalCount: document.getElementById('totalCount'),
    progressFill: document.getElementById('progressFill'),
    statusBanner: document.getElementById('statusBanner'),
    tableNote: document.getElementById('tableNote'),
    roundRolesBanner: document.getElementById('roundRolesBanner'),
    cardsGrid: document.getElementById('cardsGrid'),

    discussionTimer: document.getElementById('discussionTimer'),
    discussionTimerDisplay: document.getElementById('discussionTimerDisplay'),
    discussionTimerFill: document.getElementById('discussionTimerFill'),
    discussionTimerToggle: document.getElementById('discussionTimerToggle'),
    discussionTimerExtend: document.getElementById('discussionTimerExtend'),

    voteSection: document.getElementById('voteSection'),
    eliminatedList: document.getElementById('eliminatedList'),
    voteGrid: document.getElementById('voteGrid'),
    startVoteBtn: document.getElementById('startVoteBtn'),

    gameOverBanner: document.getElementById('gameOverBanner'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverSub: document.getElementById('gameOverSub'),

    summaryBtn: document.getElementById('summaryBtn'),
    newRoundBtn: document.getElementById('newRoundBtn'),
    resetBtn: document.getElementById('resetBtn'),

    wordModal: document.getElementById('wordModal'),
    modalOwner: document.getElementById('modalOwner'),
    modalRole: document.getElementById('modalRole'),
    modalWord: document.getElementById('modalWord'),
    modalBadges: document.getElementById('modalBadges'),
    hideWordBtn: document.getElementById('hideWordBtn'),

    voteConfirmModal: document.getElementById('voteConfirmModal'),
    voteConfirmName: document.getElementById('voteConfirmName'),
    voteConfirmCancel: document.getElementById('voteConfirmCancel'),
    voteConfirmYes: document.getElementById('voteConfirmYes'),

    eliminationModal: document.getElementById('eliminationModal'),
    elimName: document.getElementById('elimName'),
    elimRole: document.getElementById('elimRole'),
    elimContinueText: document.getElementById('elimContinueText'),
    elimContinueBtn: document.getElementById('elimContinueBtn'),

    summaryModal: document.getElementById('summaryModal'),
    summaryScrim: document.getElementById('summaryScrim'),
    summaryList: document.getElementById('summaryList'),
    closeSummaryBtn: document.getElementById('closeSummaryBtn'),
    summaryNewRoundBtn: document.getElementById('summaryNewRoundBtn'),

    toast: document.getElementById('toast'),
    srAnnounce: document.getElementById('srAnnounce'),

    installBtn: document.getElementById('installBtn'),
    mrWhiteGuessInput: document.getElementById('mrWhiteGuess'),
    difficultyRadios: document.querySelectorAll('input[name="difficulty"]'),
    difficultyHint: document.getElementById('difficultyHint'),
    customManageBtn: document.getElementById('customManageBtn'),
    customCountHint: document.getElementById('customCountHint'),
    timerExtras: document.getElementById('timerExtras'),
    timerSoundInput: document.getElementById('timerSound'),
    privacyRadios: document.querySelectorAll('input[name="privacy"]'),
    autoHideField: document.getElementById('autoHideField'),
    autoHideSelect: document.getElementById('autoHideSelect'),
    privacySummary: document.getElementById('privacySummary'),

    autoHideBar: document.getElementById('autoHideBar'),
    revealRow: document.getElementById('revealRow'),
    revealBtn: document.getElementById('revealBtn'),

    guessModal: document.getElementById('guessModal'),
    guessTitle: document.getElementById('guessTitle'),
    guessIntro: document.getElementById('guessIntro'),
    guessInputRow: document.getElementById('guessInputRow'),
    guessInput: document.getElementById('guessInput'),
    guessMicBtn: document.getElementById('guessMicBtn'),
    guessResult: document.getElementById('guessResult'),
    guessSkipBtn: document.getElementById('guessSkipBtn'),
    guessSubmitBtn: document.getElementById('guessSubmitBtn'),
    guessContinueBtn: document.getElementById('guessContinueBtn'),

    customModal: document.getElementById('customModal'),
    customScrim: document.getElementById('customScrim'),
    customImportBanner: document.getElementById('customImportBanner'),
    customImportText: document.getElementById('customImportText'),
    customImportDismiss: document.getElementById('customImportDismiss'),
    customImportConfirm: document.getElementById('customImportConfirm'),
    customWordA: document.getElementById('customWordA'),
    customWordB: document.getElementById('customWordB'),
    customDifficulty: document.getElementById('customDifficulty'),
    customAddBtn: document.getElementById('customAddBtn'),
    customCount: document.getElementById('customCount'),
    customEmpty: document.getElementById('customEmpty'),
    customList: document.getElementById('customList'),
    customExportBtn: document.getElementById('customExportBtn'),
    customImportBtn: document.getElementById('customImportBtn'),
    customShareBtn: document.getElementById('customShareBtn'),
    customImportFile: document.getElementById('customImportFile'),
    customCloseBtn: document.getElementById('customCloseBtn'),

    scoreRolesTitle: document.getElementById('scoreRolesTitle'),
    scoreRoles: document.getElementById('scoreRoles'),
    scoreNote: document.getElementById('scoreNote'),
    scoreExportRow: document.querySelector('.score-export'),
    scoreExportJson: document.getElementById('scoreExportJson'),
    scoreExportCsv: document.getElementById('scoreExportCsv'),

    autoUndercover: document.getElementById('autoUndercover'),
    autoUnderHint: document.getElementById('autoUnderHint'),
    balanceBox: document.getElementById('balanceBox'),
    groupList: document.getElementById('groupList'),
    groupEmpty: document.getElementById('groupEmpty'),
    groupNameInput: document.getElementById('groupNameInput'),
    groupSaveBtn: document.getElementById('groupSaveBtn'),
    namesSummary: document.getElementById('namesSummary'),
    scoreFilterRow: document.getElementById('scoreFilterRow'),
    scoreGroupFilter: document.getElementById('scoreGroupFilter')
  };

  var toastTimer = null;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function randomInt(maxExclusive) {
    return Math.floor(Math.random() * maxExclusive);
  }

  function showToast(message, duration) {
    el.toast.textContent = message;
    el.toast.classList.add('toast--show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('toast--show');
    }, duration || 2600);
  }

  function announce(message) {
    el.srAnnounce.textContent = message;
  }

  function vibrate(pattern) {
    try {
      if (window.navigator && typeof window.navigator.vibrate === 'function') {
        window.navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  function loadTheme() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    var isLight = theme === 'light';
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (el.themeToggle) {
      el.themeToggle.setAttribute('aria-pressed', String(isLight));
      el.themeToggle.setAttribute('aria-label', isLight ? 'Passer en mode sombre' : 'Passer en mode clair');
    }
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isLight ? '#f1ecdd' : '#10161a');
    }
  }

  function initTheme() {
    var saved = loadTheme();
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  }

  if (el.themeToggle) {
    el.themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      applyTheme(next);
      saveTheme(next);
    });
  }

  initTheme();

  function renderNameFields() {
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

  function updateCounter() {
    el.countDisplay.textContent = state.playerCount;
    el.countMinus.disabled = state.playerCount <= MIN_PLAYERS;
    el.countPlus.disabled = state.playerCount >= MAX_PLAYERS;
    renderSetupRecap();
  }

  function clampRoleCounts() {
    var cap = maxImpostors(state.playerCount);
    state.undercoverCount = clamp(state.undercoverCount, MIN_UNDERCOVER, cap);
    state.mrWhiteCount = clamp(state.mrWhiteCount, 0, Math.max(0, cap - state.undercoverCount));
    state.espionCount = clamp(state.espionCount, 0, Math.max(0, cap - state.undercoverCount - state.mrWhiteCount));
  }

  function updateUnderCounter() {
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
    if (el.timerSummary) {
      el.timerSummary.textContent = state.timerEnabled ?
        (state.timerDurationMin + ' min') : 'Désactivé';
    }
    renderSetupRecap();
  }

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

  function renderThemeToggles() {
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

  function renderSetupRecap() {
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

  function selectedThemeKeys() {
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

  function pickWordPair() {
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

  function shuffle(arr) {
    var a = arr.slice();
    for (var j = a.length - 1; j > 0; j--) {
      var k = randomInt(j + 1);
      var tmp = a[j];
      a[j] = a[k];
      a[k] = tmp;
    }
    return a;
  }

  function getPlayer(id) {
    return state.players.filter(function (p) {
      return p.id === id;
    })[0];
  }

  function assignRoles() {
    var words = pickWordPair();
    clampRoleCounts();
    var total = state.players.length;
    var cap = maxImpostors(total);
    var undercoverCount = clamp(state.undercoverCount, MIN_UNDERCOVER, cap);
    var mrWhiteCount = clamp(state.mrWhiteCount, 0, Math.max(0, cap - undercoverCount));
    var espionCount = clamp(state.espionCount, 0, Math.max(0, cap - undercoverCount - mrWhiteCount));

    var allIds = state.players.map(function (p) {
      return p.id;
    });
    var shuffledImpostors = shuffle(allIds).slice(0, undercoverCount + mrWhiteCount + espionCount);
    var undercoverIds = {};
    var mrWhiteIds = {};
    var espionIds = {};
    shuffledImpostors.forEach(function (id, idx) {
      if (idx < undercoverCount) undercoverIds[id] = true;
      else if (idx < undercoverCount + mrWhiteCount) mrWhiteIds[id] = true;
      else espionIds[id] = true;
    });

    state.civilWordHint = words.civilWord.charAt(0).toUpperCase();
    state.civilWord = words.civilWord;
    state.undercoverWord = words.undercoverWord;
    state.pairTheme = words.themeKey;
    state.pairDifficulty = words.difficulty;

    state.players.forEach(function (player) {
      player.isUndercover = !!undercoverIds[player.id];
      player.isMrWhite = !!mrWhiteIds[player.id];
      player.isEspion = !!espionIds[player.id];
      player.word = (player.isMrWhite || player.isEspion) ? '' : (player.isUndercover ? words.undercoverWord : words.civilWord);
      player.viewed = false;
      player.eliminated = false;
      player.isIdiot = false;
      player.isFantome = false;
      player.isMime = false;
      player.isProcureur = false;
      player.loverId = null;
    });

    var usedForSpecial = {};
    var skippedRoles = [];

    function availableIds(ids) {
      return ids.filter(function (id) {
        return !usedForSpecial[id];
      });
    }

    if (state.roles.idiot) {
      var civilIds = availableIds(state.players.filter(function (p) {
        return !p.isUndercover && !p.isMrWhite && !p.isEspion;
      }).map(function (p) {
        return p.id;
      }));
      if (civilIds.length) {
        var idiotId = shuffle(civilIds)[0];
        getPlayer(idiotId).isIdiot = true;
        usedForSpecial[idiotId] = true;
      } else {
        skippedRoles.push('Idiot du village');
      }
    }
    if (state.roles.fantome) {
      var fantomeIds = availableIds(allIds);
      if (fantomeIds.length) {
        var fantomeId = shuffle(fantomeIds)[0];
        getPlayer(fantomeId).isFantome = true;
        usedForSpecial[fantomeId] = true;
      } else {
        skippedRoles.push('Fantôme');
      }
    }
    if (state.roles.mime) {
      var mimeIds = availableIds(allIds);
      if (mimeIds.length) {
        var mimeId = shuffle(mimeIds)[0];
        getPlayer(mimeId).isMime = true;
        usedForSpecial[mimeId] = true;
      } else {
        skippedRoles.push('Mime');
      }
    }
    if (state.roles.procureur) {
      var procureurIds = availableIds(allIds);
      if (procureurIds.length) {
        var procureurId = shuffle(procureurIds)[0];
        getPlayer(procureurId).isProcureur = true;
        usedForSpecial[procureurId] = true;
      } else {
        skippedRoles.push('Procureur');
      }
    }
    if (state.roles.amoureux) {
      var amoureuxIds = availableIds(allIds);
      if (amoureuxIds.length >= 2) {
        var pair = shuffle(amoureuxIds).slice(0, 2);
        getPlayer(pair[0]).loverId = pair[1];
        getPlayer(pair[1]).loverId = pair[0];
        usedForSpecial[pair[0]] = true;
        usedForSpecial[pair[1]] = true;
      } else {
        skippedRoles.push('Les Amoureux');
      }
    }

    state.phase = 'reveal';
    state.pendingEliminationId = null;
    state.voteCount = 0;
    state.winner = null;
    state.winnerDetail = '';
    state.winnerReason = '';
    state.winnerPlayerId = null;
    state.guessQueue = [];

    if (skippedRoles.length) {
      showToast('Pas assez de joueurs disponibles pour attribuer : ' + skippedRoles.join(', ') + '.');
    }
  }

  function collectNames() {
    var inputs = el.namesGrid.querySelectorAll('input[data-name-input]');
    var names = [];
    inputs.forEach(function (input, i) {
      var val = input.value.trim();
      names.push(val || ('Joueur ' + (i + 1)));
    });
    return names;
  }

  function startGame() {
    var names = collectNames();
    state.players = names.map(function (name, i) {
      return {
        id: i,
        name: name,
        isUndercover: false,
        isMrWhite: false,
        isEspion: false,
        word: '',
        viewed: false,
        eliminated: false,
        isIdiot: false,
        isFantome: false,
        isMime: false,
        isProcureur: false,
        loverId: null
      };
    });
    state.round = 1;
    assignRoles();
    switchToGameScreen();
  }

  function resetStageUI() {
    el.tableNote.style.display = '';
    el.cardsGrid.style.display = '';
    el.statusBanner.classList.remove('status-banner--show');
    el.voteSection.classList.remove('vote-section--active');
    el.gameOverBanner.classList.remove('game-over-banner--active', 'game-over-banner--civils', 'game-over-banner--undercover',
      'game-over-banner--idiot', 'game-over-banner--amoureux', 'game-over-banner--mrwhite');
    el.startVoteBtn.style.display = '';
    el.startVoteBtn.disabled = true;
    el.summaryBtn.classList.add('summary-btn--hidden');
    resetDiscussionTimer();
  }

  function switchToGameScreen() {
    el.setupScreen.classList.remove('screen--active');
    el.gameScreen.classList.add('screen--active');
    resetStageUI();
    renderGameHeader();
    renderCards();
  }

  el.startBtn.addEventListener('click', function () {
    if (!wordsLoaded) {
      showToast('Les mots sont encore en cours de chargement…');
      return;
    }
    if (state.playerCount < MIN_PLAYERS) {
      showToast('Il faut au moins ' + MIN_PLAYERS + ' joueurs pour lancer une manche.');
      return;
    }
    if (!selectedThemeKeys().length) {
      showToast('Sélectionnez au moins un thème de mots avant de lancer la manche.');
      return;
    }
    startGame();
  });

  function renderGameHeader() {
    el.roundNumber.textContent = state.round;
    el.playerCountLabel.textContent = state.players.length;
    el.totalCount.textContent = state.players.length;
    updateProgress();
    renderRoundRoles();
  }

  function renderRoundRoles() {
    if (!el.roundRolesBanner) return;
    el.roundRolesBanner.innerHTML = '';

    var entries = [];
    var mime = state.players.filter(function (p) {
      return p.isMime;
    })[0];
    var procureur = state.players.filter(function (p) {
      return p.isProcureur;
    })[0];

    if (mime) {
      entries.push({
        icon: '🎭',
        label: 'Mime',
        name: mime.name,
        hint: 'communique uniquement par gestes, sans parler'
      });
    }
    if (procureur) {
      entries.push({
        icon: '⚖️',
        label: 'Procureur',
        name: procureur.name,
        hint: 'tranchera en cas d\'égalité au vote'
      });
    }

    if (!entries.length) {
      el.roundRolesBanner.classList.remove('round-roles--show');
      return;
    }

    entries.forEach(function (entry) {
      var chip = document.createElement('div');
      chip.className = 'round-roles__chip';
      chip.setAttribute('role', 'listitem');

      var icon = document.createElement('span');
      icon.className = 'round-roles__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = entry.icon;

      var text = document.createElement('span');
      text.className = 'round-roles__text';

      var line = document.createElement('span');
      line.className = 'round-roles__line';
      var strong = document.createElement('strong');
      strong.textContent = entry.label + ' : ';
      var nameSpan = document.createElement('span');
      nameSpan.textContent = entry.name;
      line.appendChild(strong);
      line.appendChild(nameSpan);

      var small = document.createElement('small');
      small.textContent = entry.hint;

      text.appendChild(line);
      text.appendChild(small);

      chip.appendChild(icon);
      chip.appendChild(text);
      el.roundRolesBanner.appendChild(chip);
    });

    el.roundRolesBanner.classList.add('round-roles--show');
  }

  function updateProgress() {
    var total = state.players.length;
    var viewed = state.players.filter(function (p) {
      return p.viewed;
    }).length;
    el.viewedCount.textContent = viewed;
    el.progressFill.style.width = (total ? (viewed / total * 100) : 0) + '%';

    var allViewed = total > 0 && viewed === total;
    if (state.phase === 'reveal') {
      el.startVoteBtn.disabled = !allViewed;
    }
    el.statusBanner.classList.toggle('status-banner--show', allViewed && state.phase === 'reveal');

    if (allViewed && state.phase === 'reveal' && state.timerEnabled && !state.timerStartedRound) {
      state.timerStartedRound = true;
      startDiscussionTimer();
    }
    syncWakeLock();
  }

  var discussionTimerInterval = null;

  function formatTimerTime(totalSeconds) {
    var s = Math.max(0, totalSeconds);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
  }

  function clearDiscussionInterval() {
    if (discussionTimerInterval) {
      clearInterval(discussionTimerInterval);
      discussionTimerInterval = null;
    }
  }

  function updateDiscussionTimerDisplay() {
    if (!el.discussionTimer) return;
    el.discussionTimerDisplay.textContent = formatTimerTime(state.timerRemaining);
    var totalSeconds = Math.max(1, state.timerDurationMin * 60);
    var pct = Math.max(0, Math.min(100, (state.timerRemaining / totalSeconds) * 100));
    el.discussionTimerFill.style.width = pct + '%';
    el.discussionTimer.classList.toggle('discussion-timer--warning', state.timerRemaining <= 30 && state.timerRemaining > 0);
    el.discussionTimer.classList.toggle('discussion-timer--paused', !state.timerRunning && !state.timerHasEnded);
    if (el.discussionTimerToggle) {
      el.discussionTimerToggle.textContent = state.timerHasEnded ? 'Relancer' : (state.timerRunning ? 'Pause' : 'Reprendre');
    }
    syncWakeLock();
  }

  function tickDiscussionTimer() {
    state.timerRemaining -= 1;
    if (state.timerRemaining <= 0) {
      state.timerRemaining = 0;
      state.timerRunning = false;
      state.timerHasEnded = true;
      clearDiscussionInterval();
      updateDiscussionTimerDisplay();
      vibrate([200, 100, 200]);
      playTimerEnd();
      showToast('Temps de discussion écoulé — place au vote !');
      announce('Temps de discussion écoulé.');
      return;
    }
    updateDiscussionTimerDisplay();
  }

  function startDiscussionTimer() {
    if (!state.timerEnabled || !el.discussionTimer) return;
    if (state.timerRemaining <= 0) {
      state.timerRemaining = state.timerDurationMin * 60;
    }
    state.timerHasEnded = false;
    state.timerRunning = true;
    el.discussionTimer.classList.add('discussion-timer--show');
    updateDiscussionTimerDisplay();
    clearDiscussionInterval();
    discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
  }

  function resetDiscussionTimer() {
    clearDiscussionInterval();
    state.timerRemaining = state.timerDurationMin * 60;
    state.timerRunning = false;
    state.timerHasEnded = false;
    state.timerStartedRound = false;
    if (el.discussionTimer) {
      el.discussionTimer.classList.remove('discussion-timer--show', 'discussion-timer--warning', 'discussion-timer--paused');
    }
    updateDiscussionTimerDisplay();
  }

  function stopDiscussionTimer() {
    clearDiscussionInterval();
    state.timerRunning = false;
    if (el.discussionTimer) {
      el.discussionTimer.classList.remove('discussion-timer--show');
    }
    syncWakeLock();
  }

  if (el.discussionTimerToggle) {
    el.discussionTimerToggle.addEventListener('click', function () {
      if (state.timerHasEnded) {
        state.timerRemaining = state.timerDurationMin * 60;
        state.timerHasEnded = false;
        state.timerRunning = true;
        el.discussionTimer.classList.remove('discussion-timer--warning');
        clearDiscussionInterval();
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
        updateDiscussionTimerDisplay();
        return;
      }
      state.timerRunning = !state.timerRunning;
      clearDiscussionInterval();
      if (state.timerRunning) {
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
      }
      updateDiscussionTimerDisplay();
    });
  }

  if (el.discussionTimerExtend) {
    el.discussionTimerExtend.addEventListener('click', function () {
      state.timerRemaining += 60;
      if (state.timerHasEnded) {
        state.timerHasEnded = false;
        state.timerRunning = true;
        clearDiscussionInterval();
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
      }
      el.discussionTimer.classList.remove('discussion-timer--warning');
      updateDiscussionTimerDisplay();
      showToast('Une minute de discussion supplémentaire a été ajoutée.');
    });
  }

  var CARD_ICON = '<svg class="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +
    '<circle cx="12" cy="12" r="8.4"/>' +
    '<circle cx="12" cy="12" r="4.6"/>' +
    '<circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/></svg>';

  var CHECK_ICON = '<svg class="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<path d="M4 12.5l5 5L20 6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function cardRotation(id) {
    var steps = (id * 37) % 7;
    var deg = (steps - 3) * 1;
    return deg + 'deg';
  }

  function renderCards() {
    el.cardsGrid.innerHTML = '';
    state.players.forEach(function (player) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card' + (player.viewed ? ' card--seen' : '');
      card.style.setProperty('--rot', player.viewed ? '0deg' : cardRotation(player.id));
      card.setAttribute('role', 'listitem');
      card.setAttribute('data-id', player.id);

      if (player.viewed) {
        card.disabled = true;
        card.setAttribute('aria-label', player.name + ', carte déjà consultée');
      } else {
        card.setAttribute('aria-label', 'Carte de ' + player.name + ', appuyer pour révéler le mot');
      }

      var indexEl = document.createElement('span');
      indexEl.className = 'card__index';
      indexEl.textContent = '#' + (player.id + 1);

      var iconWrap = document.createElement('span');
      iconWrap.innerHTML = player.viewed ? CHECK_ICON : CARD_ICON;

      var nameEl = document.createElement('span');
      nameEl.className = 'card__name';
      nameEl.textContent = player.viewed ? 'Vu' : player.name;

      card.appendChild(indexEl);
      card.appendChild(iconWrap);
      card.appendChild(nameEl);

      if (!player.viewed) {
        card.addEventListener('click', function () {
          openCard(player.id);
        });
      }

      el.cardsGrid.appendChild(card);
    });
  }

  function openCard(id) {
    var player = getPlayer(id);
    if (!player || player.viewed) return;

    vibrate(12);

    state.openCardId = id;
    el.modalOwner.textContent = 'Carte de ' + player.name;

    if (player.isMrWhite) {
      el.modalRole.textContent = 'Tu es Mr. White — improvise, tu n\'as pas de mot !';
      el.modalWord.textContent = 'Aucun mot';
    } else if (player.isEspion) {
      el.modalRole.textContent = 'Tu es l\'Espion — tu n\'as pas de mot, mais un indice t\'attend ci-dessous';
      el.modalWord.textContent = 'Aucun mot';
    } else if (player.isUndercover) {
      el.modalRole.textContent = 'Tu es l\'Undercover — fonds-toi dans la masse';
      el.modalWord.textContent = player.word;
    } else {
      el.modalRole.textContent = 'Tu es Civil — retrouve l\'imposteur';
      el.modalWord.textContent = player.word;
    }

    renderModalBadges(player);
    beginCardPrivacy();

    el.wordModal.classList.add('modal--open');
    el.wordModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    focusCardModal();
    announce(state.privacy === 'hold' ?
      ('Carte de ' + player.name + '. Maintenez le bouton pour révéler le mot.') :
      ('Mot révélé pour ' + player.name));
  }

  function renderModalBadges(player) {
    el.modalBadges.innerHTML = '';
    var badges = [];
    if (player.isMrWhite && state.mrWhiteGuess) {
      badges.push({
        label: 'Dernière chance',
        desc: 'Si tu es éliminé, tu pourras tenter de deviner le mot des Civils : si tu le trouves, tu gagnes seul(e).'
      });
    }
    if (player.isEspion) {
      badges.push({
        label: 'Indice d\'Espion',
        desc: 'Le mot des Civils commence par la lettre « ' + state.civilWordHint + ' ».'
      });
    }
    if (player.isIdiot) badges.push(ROLE_INFO.idiot);
    if (player.isFantome) badges.push(ROLE_INFO.fantome);
    if (player.isMime) badges.push(ROLE_INFO.mime);
    if (player.isProcureur) badges.push(ROLE_INFO.procureur);
    if (player.loverId !== null) {
      var lover = getPlayer(player.loverId);
      if (lover) {
        badges.push({
          label: 'Amoureux de ' + lover.name,
          desc: 'Si l\'un de vous deux est éliminé, l\'autre l\'est aussi. Peu importe vos camps respectifs, vous devez être les deux derniers survivants pour gagner ensemble.'
        });
      }
    }
    badges.forEach(function (b) {
      var div = document.createElement('div');
      div.className = 'modal__badge';
      var strong = document.createElement('strong');
      strong.textContent = b.label;
      var span = document.createElement('span');
      span.textContent = b.desc;
      div.appendChild(strong);
      div.appendChild(span);
      el.modalBadges.appendChild(div);
    });
  }

  function hideOpenCard() {
    if (state.openCardId === null) return;
    endCardPrivacy();
    var player = state.players.filter(function (p) {
      return p.id === state.openCardId;
    })[0];
    if (player) player.viewed = true;

    vibrate(12);

    el.wordModal.classList.remove('modal--open');
    el.wordModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.openCardId = null;

    renderCards();
    updateProgress();

    if (player) {
      var total = state.players.length;
      var viewed = state.players.filter(function (p) {
        return p.viewed;
      }).length;
      announce(player.name + ' a caché sa carte. ' + viewed + ' sur ' + total + ' consultées.');
      if (viewed === total) {
        showToast('Toutes les cartes ont été vues. Place à la discussion !');
      }
    }
  }

  el.hideWordBtn.addEventListener('click', hideOpenCard);

  function alivePlayers() {
    return state.players.filter(function (p) {
      return !p.eliminated;
    });
  }

  function livingProcureurExists() {
    return state.players.filter(function (p) {
      return p.isProcureur && !p.eliminated;
    }).length > 0;
  }

  function fantomePresent() {
    return state.players.filter(function (p) {
      return p.isFantome;
    }).length > 0;
  }

  function deadlockRuleActive() {
    return !livingProcureurExists() && !fantomePresent();
  }

  function enterVotePhase() {
    state.phase = 'vote';
    el.tableNote.style.display = 'none';
    el.cardsGrid.style.display = 'none';
    el.statusBanner.classList.remove('status-banner--show');
    el.startVoteBtn.style.display = 'none';
    el.voteSection.classList.add('vote-section--active');
    stopDiscussionTimer();
    renderEliminatedList();
    renderVoteGrid();
    announce('Phase de vote lancée.');
  }

  el.startVoteBtn.addEventListener('click', function () {
    if (el.startVoteBtn.disabled) return;
    enterVotePhase();
  });

  function renderEliminatedList() {
    el.eliminatedList.innerHTML = '';
    state.players.filter(function (p) {
      return p.eliminated;
    }).forEach(function (player) {
      var chip = document.createElement('span');
      chip.className = 'eliminated-chip' + (player.isFantome ? ' eliminated-chip--fantome' : '');
      chip.innerHTML = player.name + ' <span class="eliminated-chip__role">' +
        ROLE_NAMES[baseRoleKey(player)] + '</span>' +
        (player.isFantome ? ' <span class="eliminated-chip__fantome">👻 Fantôme — vote encore</span>' : '');
      el.eliminatedList.appendChild(chip);
    });
  }

  function renderVoteGrid() {
    el.voteGrid.innerHTML = '';
    alivePlayers().forEach(function (player) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card';
      card.style.setProperty('--rot', cardRotation(player.id));
      card.setAttribute('role', 'listitem');
      card.setAttribute('data-id', player.id);
      card.setAttribute('aria-label', 'Voter pour éliminer ' + player.name);

      var indexEl = document.createElement('span');
      indexEl.className = 'card__index';
      indexEl.textContent = '#' + (player.id + 1);

      var iconWrap = document.createElement('span');
      iconWrap.innerHTML = CARD_ICON;

      var nameEl = document.createElement('span');
      nameEl.className = 'card__name';
      nameEl.textContent = player.name;

      card.appendChild(indexEl);
      card.appendChild(iconWrap);
      card.appendChild(nameEl);

      card.addEventListener('click', function () {
        openVoteConfirm(player.id);
      });

      el.voteGrid.appendChild(card);
    });
  }

  function openVoteConfirm(id) {
    var player = getPlayer(id);
    if (!player) return;
    vibrate(12);
    state.pendingEliminationId = id;
    el.voteConfirmName.textContent = player.name;
    el.voteConfirmModal.classList.add('modal--open');
    el.voteConfirmModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.voteConfirmYes.focus();
  }

  function closeVoteConfirm() {
    el.voteConfirmModal.classList.remove('modal--open');
    el.voteConfirmModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.pendingEliminationId = null;
  }

  el.voteConfirmCancel.addEventListener('click', closeVoteConfirm);

  el.voteConfirmYes.addEventListener('click', function () {
    var id = state.pendingEliminationId;
    if (id === null) return;
    vibrate([30, 40, 30]);
    closeVoteConfirm();
    performElimination(id);
  });

  function roleLabel(player) {
    if (player.isMrWhite) return player.name + ' était Mr. White';
    if (player.isEspion) return player.name + ' était l\'Espion';
    if (player.isUndercover) return player.name + ' était l\'Undercover';
    return player.name + ' était Civil';
  }

  function performElimination(id) {
    var player = getPlayer(id);
    if (!player) return;

    state.voteCount += 1;

    var eliminatedNow = [player];
    player.eliminated = true;

    if (player.loverId !== null) {
      var lover = getPlayer(player.loverId);
      if (lover && !lover.eliminated) {
        lover.eliminated = true;
        eliminatedNow.push(lover);
      }
    }

    var winner = null;
    var winnerDetail = '';
    var winnerReason = '';

    var idiotEliminated = eliminatedNow.filter(function (p) {
      return p.isIdiot;
    })[0];
    if (state.voteCount === 1 && idiotEliminated) {
      winner = 'idiot';
      winnerDetail = idiotEliminated.name;
    } else {
      var aliveNow = alivePlayers();
      var ruleActive = deadlockRuleActive();

      if (ruleActive && aliveNow.length === 4) {
        var loverPairAlive4 = aliveNow.filter(function (p) {
          if (p.loverId === null) return false;
          var partner = getPlayer(p.loverId);
          return partner && !partner.eliminated;
        }).length > 0;
        if (loverPairAlive4) {
          winner = 'amoureux';
          winnerReason = 'deadlock4';
        }
      }

      if (!winner) {
        var loverSurvivor = state.players.filter(function (p) {
          if (p.eliminated || p.loverId === null) return false;
          var partner = getPlayer(p.loverId);
          return partner && !partner.eliminated;
        })[0];

        if (loverSurvivor) {
          var others = state.players.filter(function (p) {
            return p.id !== loverSurvivor.id && p.id !== loverSurvivor.loverId;
          });
          if (others.length && others.every(function (p) {
              return p.eliminated;
            })) {
            winner = 'amoureux';
          }
        }
      }

      if (!winner && ruleActive && aliveNow.length === 2) {
        var impostorAlive2 = aliveNow.filter(function (p) {
          return p.isUndercover || p.isMrWhite || p.isEspion;
        }).length;
        if (impostorAlive2 > 0) {
          winner = 'undercover';
          winnerReason = 'deadlock2';
        }
      }

      if (!winner) {
        var aliveImpostor = state.players.filter(function (p) {
          return !p.eliminated && (p.isUndercover || p.isMrWhite || p.isEspion);
        }).length;
        var aliveCivil = state.players.filter(function (p) {
          return !p.eliminated && !(p.isUndercover || p.isMrWhite || p.isEspion);
        }).length;
        if (aliveImpostor === 0) winner = 'civils';
        else if (aliveCivil === 0) winner = 'undercover';
      }
    }

    state.winner = winner;
    state.winnerDetail = winnerDetail;
    state.winnerReason = winnerReason;

    // Dernière chance : un Mr. White éliminé peut tenter de deviner le mot des Civils,
    // même si sa chute donnait la victoire aux Civils (sauf victoire de l'Idiot au 1er vote).
    state.guessQueue = [];
    if (state.mrWhiteGuess && winner !== 'idiot') {
      state.guessQueue = eliminatedNow.filter(function (p) {
        return p.isMrWhite;
      });
    }

    var namesText = eliminatedNow.map(function (p) {
      return p.name;
    }).join(' et ');
    el.elimName.textContent = namesText + (eliminatedNow.length > 1 ? ' ont été éliminés' : ' a été éliminé(e)');
    el.elimRole.innerHTML = eliminatedNow.map(function (p) {
      var line = roleLabel(p);
      if (p.isFantome) {
        line += '<span class="modal__fantome-note">👻 ' + p.name + ' est le Fantôme — il/elle continue de voter aux prochains tours !</span>';
      }
      return line;
    }).join('<br>');

    if (winner === 'civils') {
      el.elimContinueText.textContent = 'Tous les Undercovers et Mr. White ont été démasqués !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else if (winner === 'undercover') {
      el.elimContinueText.textContent = winnerReason === 'deadlock2' ?
        'Il ne reste plus que 2 joueurs : l\'Undercover/Mr. White l\'emporte automatiquement !' :
        'Il ne reste plus aucun Civil !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else if (winner === 'idiot') {
      el.elimContinueText.textContent = winnerDetail + ' était l\'Idiot du village et remporte la partie dès le premier vote !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else if (winner === 'amoureux') {
      el.elimContinueText.textContent = winnerReason === 'deadlock4' ?
        'Il ne reste plus que 4 joueurs : les Amoureux l\'emportent automatiquement !' :
        'Les Amoureux sont les deux derniers survivants !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else {
      el.elimContinueText.textContent = 'La partie continue — au prochain vote.';
      el.elimContinueBtn.textContent = 'Continuer';
    }

    if (state.guessQueue.length) {
      el.elimContinueText.textContent = (state.guessQueue.length > 1 ? 'Les Mr. White ont' : 'Mr. White a') +
        ' une dernière chance : deviner le mot des Civils.';
      el.elimContinueBtn.textContent = 'Tenter sa chance';
    }

    el.eliminationModal.classList.add('modal--open');
    el.eliminationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.elimContinueBtn.focus();
    announce(el.elimName.textContent);
  }

  function closeEliminationModal() {
    el.eliminationModal.classList.remove('modal--open');
    el.eliminationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function proceedAfterElimination() {
    if (state.winner) {
      enterGameOver(state.winner);
    } else {
      renderEliminatedList();
      renderVoteGrid();
    }
  }

  el.elimContinueBtn.addEventListener('click', function () {
    closeEliminationModal();
    if (state.guessQueue.length) {
      openGuessModal();
    } else {
      proceedAfterElimination();
    }
  });

  function enterGameOver(winner) {
    state.phase = 'gameover';
    el.voteSection.classList.remove('vote-section--active');
    el.startVoteBtn.style.display = 'none';
    el.summaryBtn.classList.remove('summary-btn--hidden');
    stopDiscussionTimer();

    var impostorPlural = state.players.filter(function (p) {
      return p.isUndercover || p.isMrWhite || p.isEspion;
    }).length > 1;

    if (winner === 'civils') {
      el.gameOverTitle.textContent = 'Les Civils ont gagné !';
      el.gameOverSub.textContent = impostorPlural ?
        'Tous les imposteurs ont été démasqués et éliminés.' :
        'L\'imposteur a été démasqué et éliminé.';
      el.gameOverBanner.classList.add('game-over-banner--civils');
    } else if (winner === 'undercover') {
      el.gameOverTitle.textContent = impostorPlural ? 'Les Undercovers ont gagné !' : 'L\'Undercover a gagné !';
      el.gameOverSub.textContent = state.winnerReason === 'deadlock2' ?
        'Il ne restait plus que 2 joueurs : la situation était dans l\'impasse, l\'imposteur l\'emporte automatiquement.' :
        'Tous les Civils ont été éliminés avant d\'avoir démasqué l\'imposteur.';
      el.gameOverBanner.classList.add('game-over-banner--undercover');
    } else if (winner === 'idiot') {
      el.gameOverTitle.textContent = 'L\'Idiot du village a gagné !';
      el.gameOverSub.textContent = state.winnerDetail + ' a été éliminé(e) dès le tout premier vote et remporte la partie à lui/elle seul(e) !';
      el.gameOverBanner.classList.add('game-over-banner--idiot');
    } else if (winner === 'mrwhite') {
      el.gameOverTitle.textContent = 'Mr. White a gagné !';
      el.gameOverSub.textContent = state.winnerDetail + ' a deviné le mot des Civils' +
        (state.civilWord ? ' (« ' + state.civilWord + ' »)' : '') + ' et remporte la partie à lui/elle seul(e) !';
      el.gameOverBanner.classList.add('game-over-banner--mrwhite');
    } else if (winner === 'amoureux') {
      el.gameOverTitle.textContent = 'Les Amoureux ont gagné !';
      el.gameOverSub.textContent = state.winnerReason === 'deadlock4' ?
        'Il ne restait plus que 4 joueurs : la situation était dans l\'impasse, les Amoureux l\'emportent automatiquement.' :
        'Peu importe leurs camps respectifs, ils ont survécu ensemble à tous les autres joueurs !';
      el.gameOverBanner.classList.add('game-over-banner--amoureux');
    }

    el.gameOverBanner.classList.add('game-over-banner--active');
    announce(el.gameOverTitle.textContent);
    recordScoreEntry(winner);
  }

  function openSummary() {
    el.summaryList.innerHTML = '';
    state.players.forEach(function (player) {
      var li = document.createElement('li');

      var nameSpan = document.createElement('strong');
      nameSpan.textContent = player.name + (player.eliminated ? ' (éliminé)' : '');

      var right = document.createElement('span');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.flexWrap = 'wrap';
      right.style.gap = '6px';

      var wordSpan = document.createElement('span');
      wordSpan.textContent = (player.isMrWhite || player.isEspion) ? 'Aucun mot' : player.word;
      wordSpan.style.color = 'var(--ink-soft)';
      right.appendChild(wordSpan);

      var roleSpan = document.createElement('span');
      if (player.isMrWhite) {
        roleSpan.className = 'summary-role summary-role--undercover';
        roleSpan.textContent = 'Mr. White';
      } else if (player.isEspion) {
        roleSpan.className = 'summary-role summary-role--undercover';
        roleSpan.textContent = 'Espion';
      } else if (player.isUndercover) {
        roleSpan.className = 'summary-role summary-role--undercover';
        roleSpan.textContent = 'Undercover';
      } else {
        roleSpan.className = 'summary-role summary-role--civil';
        roleSpan.textContent = 'Civil';
      }
      right.appendChild(roleSpan);

      var specials = [];
      if (player.isIdiot) specials.push('Idiot du village');
      if (player.isFantome) specials.push('Fantôme');
      if (player.isMime) specials.push('Mime');
      if (player.isProcureur) specials.push('Procureur');
      if (player.loverId !== null) specials.push('Amoureux');
      specials.forEach(function (label) {
        var specialSpan = document.createElement('span');
        specialSpan.className = 'summary-role summary-role--special';
        specialSpan.textContent = label;
        right.appendChild(specialSpan);
      });

      li.appendChild(nameSpan);
      li.appendChild(right);
      el.summaryList.appendChild(li);
    });

    el.summaryModal.classList.add('modal--open');
    el.summaryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.closeSummaryBtn.focus();
  }

  function closeSummary() {
    el.summaryModal.classList.remove('modal--open');
    el.summaryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  el.summaryBtn.addEventListener('click', openSummary);
  el.closeSummaryBtn.addEventListener('click', closeSummary);
  el.summaryScrim.addEventListener('click', closeSummary);

  var ROLE_NAMES = {
    civil: 'Civil',
    undercover: 'Undercover',
    mrwhite: 'Mr. White',
    espion: 'Espion'
  };

  function baseRoleKey(player) {
    if (player.isMrWhite) return 'mrwhite';
    if (player.isEspion) return 'espion';
    if (player.isUndercover) return 'undercover';
    return 'civil';
  }

  function playerSpecials(player) {
    var specials = [];
    if (player.isIdiot) specials.push('Idiot du village');
    if (player.isFantome) specials.push('Fantôme');
    if (player.isMime) specials.push('Mime');
    if (player.isProcureur) specials.push('Procureur');
    if (player.loverId !== null) specials.push('Amoureux');
    return specials;
  }

  function isWinningPlayer(player, winner) {
    var impostor = player.isUndercover || player.isMrWhite || player.isEspion;
    if (winner === 'civils') return !impostor;
    if (winner === 'undercover') return impostor;
    if (winner === 'idiot') return player.isIdiot;
    if (winner === 'amoureux') return player.loverId !== null;
    if (winner === 'mrwhite') return player.id === state.winnerPlayerId;
    return false;
  }

  function recordScoreEntry(winner) {
    var winnerLabel = '';
    var winnerNames = [];

    if (winner === 'civils') {
      winnerLabel = 'Les Civils';
    } else if (winner === 'undercover') {
      winnerLabel = 'Les Imposteurs';
    } else if (winner === 'idiot') {
      winnerLabel = 'Idiot du village';
    } else if (winner === 'amoureux') {
      winnerLabel = 'Les Amoureux';
    } else if (winner === 'mrwhite') {
      winnerLabel = 'Mr. White';
    } else {
      return;
    }

    winnerNames = state.players.filter(function (p) {
      return isWinningPlayer(p, winner);
    }).map(function (p) {
      return p.name;
    });

    scoreLog.unshift({
      date: new Date().toISOString(),
      group: matchGroupName(state.players.map(function (p) {
        return p.name;
      })),
      round: state.round,
      playerCount: state.players.length,
      winner: winner,
      winnerLabel: winnerLabel,
      winnerNames: winnerNames,
      theme: state.pairTheme,
      pairDifficulty: state.pairDifficulty,
      players: state.players.map(function (p) {
        return {
          name: p.name,
          role: baseRoleKey(p),
          specials: playerSpecials(p),
          won: isWinningPlayer(p, winner),
          eliminated: !!p.eliminated
        };
      })
    });
    if (scoreLog.length > MAX_SCORE_ENTRIES) {
      scoreLog.length = MAX_SCORE_ENTRIES;
    }
    saveScoreLog();
  }

  // Statistiques calculées sur les manches qui détaillent leurs joueurs (les anciennes
  // entrées du journal ne contiennent que les vainqueurs et restent comptées dans le classement).
  function computeStats(list) {
    var byPlayer = {};
    var byRole = {};
    var tracked = 0;
    (list || scoreLog).slice().reverse().forEach(function (entry) {
      if (!Array.isArray(entry.players) || !entry.players.length) return;
      tracked += 1;
      entry.players.forEach(function (p) {
        var s = byPlayer[p.name] || (byPlayer[p.name] = {
          games: 0,
          wins: 0,
          streak: 0,
          best: 0
        });
        s.games += 1;
        if (p.won) {
          s.wins += 1;
          s.streak += 1;
          if (s.streak > s.best) s.best = s.streak;
        } else {
          s.streak = 0;
        }
        var r = byRole[p.role] || (byRole[p.role] = {
          games: 0,
          wins: 0
        });
        r.games += 1;
        if (p.won) r.wins += 1;
      });
    });
    return {
      byPlayer: byPlayer,
      byRole: byRole,
      tracked: tracked
    };
  }

  function percent(wins, games) {
    return games ? Math.round(wins / games * 100) : 0;
  }

  function renderScoreModal() {
    refreshScoreFilter();
    var hasEntries = scoreLog.length > 0;
    if (el.scoreEmptyState) el.scoreEmptyState.style.display = hasEntries ? 'none' : '';
    if (el.scoreContent) el.scoreContent.style.display = hasEntries ? '' : 'none';
    if (el.scoreExportRow) el.scoreExportRow.style.display = hasEntries ? '' : 'none';
    if (!hasEntries) return;

    var entries = filteredScoreEntries();
    var stats = computeStats(entries);

    var tally = {};
    entries.forEach(function (entry) {
      (entry.winnerNames || []).forEach(function (name) {
        tally[name] = (tally[name] || 0) + 1;
      });
    });
    var leaderboard = Object.keys(tally).map(function (name) {
      return {
        name: name,
        wins: tally[name],
        stat: stats.byPlayer[name] || null
      };
    }).sort(function (a, b) {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.stat ? percent(b.stat.wins, b.stat.games) : 0) - (a.stat ? percent(a.stat.wins, a.stat.games) : 0);
    });

    el.scoreLeaderboard.innerHTML = '';
    leaderboard.forEach(function (entry) {
      var li = document.createElement('li');
      var nameSpan = document.createElement('strong');
      nameSpan.textContent = entry.name;
      var countSpan = document.createElement('span');
      countSpan.className = 'score-leaderboard__count';
      countSpan.textContent = entry.wins + (entry.wins > 1 ? ' victoires' : ' victoire');
      li.appendChild(nameSpan);
      li.appendChild(countSpan);

      if (entry.stat) {
        var meta = document.createElement('span');
        meta.className = 'score-leaderboard__meta';
        var parts = [entry.stat.wins + '/' + entry.stat.games + ' manches · ' + percent(entry.stat.wins, entry.stat.games) + ' %'];
        if (entry.stat.streak > 1) parts.push('série en cours : ' + entry.stat.streak);
        if (entry.stat.best > 1) parts.push('record : ' + entry.stat.best);
        meta.textContent = parts.join(' · ');
        li.appendChild(meta);
      }
      el.scoreLeaderboard.appendChild(li);
    });

    var hasStats = stats.tracked > 0;
    el.scoreRolesTitle.style.display = hasStats ? '' : 'none';
    el.scoreRoles.style.display = hasStats ? '' : 'none';
    el.scoreNote.style.display = (hasStats && stats.tracked < entries.length) ? '' : 'none';
    el.scoreRoles.innerHTML = '';
    ['civil', 'undercover', 'mrwhite', 'espion'].forEach(function (role) {
      var r = stats.byRole[role];
      if (!r) return;
      var li = document.createElement('li');
      var label = document.createElement('strong');
      label.textContent = ROLE_NAMES[role];
      var value = document.createElement('span');
      value.className = 'score-leaderboard__count';
      value.textContent = r.wins + '/' + r.games + ' · ' + percent(r.wins, r.games) + ' %';
      li.appendChild(label);
      li.appendChild(value);
      el.scoreRoles.appendChild(li);
    });

    el.scoreHistory.innerHTML = '';
    entries.forEach(function (entry) {
      var li = document.createElement('li');
      var labelSpan = document.createElement('strong');
      labelSpan.className = 'score-history__label';
      labelSpan.textContent = entry.winnerLabel;
      var roundSpan = document.createElement('span');
      roundSpan.className = 'score-history__round';
      roundSpan.textContent = 'Manche ' + entry.round + ' · ' + entry.playerCount + ' joueurs';
      li.appendChild(labelSpan);
      li.appendChild(roundSpan);
      el.scoreHistory.appendChild(li);
    });
  }

  function downloadFile(filename, mime, text) {
    var blob = new Blob([text], {
      type: mime + ';charset=utf-8'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }

  function todayStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  function exportScoreJson() {
    var stats = computeStats();
    var payload = {
      app: 'undercover',
      kind: 'score-log',
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: scoreLog,
      stats: {
        players: Object.keys(stats.byPlayer).map(function (name) {
          var s = stats.byPlayer[name];
          return {
            name: name,
            games: s.games,
            wins: s.wins,
            winRate: percent(s.wins, s.games),
            currentStreak: s.streak,
            bestStreak: s.best
          };
        }),
        roles: Object.keys(stats.byRole).map(function (role) {
          var r = stats.byRole[role];
          return {
            role: role,
            games: r.games,
            wins: r.wins,
            winRate: percent(r.wins, r.games)
          };
        })
      }
    };
    downloadFile('undercover-journal-' + todayStamp() + '.json', 'application/json', JSON.stringify(payload, null, 2));
    showToast('Journal exporté en JSON.');
  }

  function csvCell(value) {
    var s = String(value == null ? '' : value);
    if (/[;"\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function exportScoreCsv() {
    var rows = [
      ['date', 'manche', 'nb_joueurs', 'vainqueur', 'groupe', 'joueur', 'role', 'roles_speciaux', 'victoire', 'elimine', 'difficulte_paire', 'theme']
    ];
    scoreLog.slice().reverse().forEach(function (e) {
      var base = [e.date || '', e.round, e.playerCount, e.winnerLabel, e.group || ''];
      var diff = e.pairDifficulty ? DIFFICULTY_LABELS[e.pairDifficulty] : '';
      var theme = e.theme || '';
      if (Array.isArray(e.players) && e.players.length) {
        e.players.forEach(function (p) {
          rows.push(base.concat([p.name, ROLE_NAMES[p.role] || p.role, (p.specials || []).join(' + '),
            p.won ? 'oui' : 'non', p.eliminated ? 'oui' : 'non', diff, theme
          ]));
        });
      } else {
        // Ancienne entrée : seuls les vainqueurs ont été conservés.
        rows.push(base.concat([(e.winnerNames || []).join(', '), '', '', 'oui', '', diff, theme]));
      }
    });
    var text = '\ufeff' + rows.map(function (r) {
      return r.map(csvCell).join(';');
    }).join('\r\n');
    downloadFile('undercover-journal-' + todayStamp() + '.csv', 'text/csv', text);
    showToast('Journal exporté en CSV.');
  }

  function openScoreModal() {
    renderScoreModal();
    el.scoreModal.classList.add('modal--open');
    el.scoreModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.closeScoreBtn.focus();
  }

  function closeScoreModal() {
    el.scoreModal.classList.remove('modal--open');
    el.scoreModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (el.scoreLogToggle) el.scoreLogToggle.addEventListener('click', openScoreModal);
  if (el.scoreLogBtnGame) el.scoreLogBtnGame.addEventListener('click', openScoreModal);
  if (el.closeScoreBtn) el.closeScoreBtn.addEventListener('click', closeScoreModal);
  if (el.scoreScrim) el.scoreScrim.addEventListener('click', closeScoreModal);

  if (el.scoreResetBtn) {
    el.scoreResetBtn.addEventListener('click', function () {
      scoreLog = [];
      saveScoreLog();
      renderScoreModal();
      showToast('Le journal des scores a été réinitialisé.');
    });
  }

  function newRound() {
    closeSummary();
    state.round += 1;
    assignRoles();
    resetStageUI();
    renderGameHeader();
    renderCards();
    showToast('Nouvelle manche lancée — de nouveaux mots ont été distribués.');
  }

  el.newRoundBtn.addEventListener('click', newRound);
  el.summaryNewRoundBtn.addEventListener('click', newRound);

  el.resetBtn.addEventListener('click', function () {
    stopDiscussionTimer();
    state.players = [];
    state.round = 1;
    state.phase = 'reveal';
    state.winner = null;
    state.winnerReason = '';
    state.pendingEliminationId = null;
    state.guessQueue = [];
    el.gameScreen.classList.remove('screen--active');
    el.setupScreen.classList.add('screen--active');
    syncWakeLock();
  });

  if (el.rulesToggle && el.rulesText) {
    el.rulesToggle.addEventListener('click', function () {
      var expanded = el.rulesToggle.getAttribute('aria-expanded') === 'true';
      el.rulesToggle.setAttribute('aria-expanded', String(!expanded));
      el.rulesText.hidden = expanded;
    });
  }

  // ======================================================================
  // Options : difficulté, confidentialité des cartes, son, dernière chance
  // ======================================================================
  var AUTO_HIDE_CHOICES = [5, 8, 12, 20];

  function loadOptions() {
    try {
      var raw = window.localStorage.getItem(OPTIONS_STORAGE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return;
      if (o.difficulty === 0 || o.difficulty === 1 || o.difficulty === 2 || o.difficulty === 3) state.difficulty = o.difficulty;
      if (o.privacy === 'standard' || o.privacy === 'auto' || o.privacy === 'hold') state.privacy = o.privacy;
      if (AUTO_HIDE_CHOICES.indexOf(o.autoHideSec) !== -1) state.autoHideSec = o.autoHideSec;
      if (typeof o.timerSound === 'boolean') state.timerSound = o.timerSound;
      if (typeof o.mrWhiteGuess === 'boolean') state.mrWhiteGuess = o.mrWhiteGuess;
      if (typeof o.autoUndercover === 'boolean') state.autoUndercover = o.autoUndercover;
    } catch (e) {}
  }

  function saveOptions() {
    try {
      window.localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify({
        difficulty: state.difficulty,
        privacy: state.privacy,
        autoHideSec: state.autoHideSec,
        timerSound: state.timerSound,
        mrWhiteGuess: state.mrWhiteGuess,
        autoUndercover: state.autoUndercover
      }));
    } catch (e) {}
  }

  var DIFFICULTY_HINTS = {
    0: 'Toutes les paires sont mélangées.',
    1: 'Mots plutôt éloignés : l\'Undercover se repère assez facilement.',
    2: 'Mots du même univers : un bon équilibre pour la plupart des groupes.',
    3: 'Mots quasi identiques : l\'Undercover est très difficile à démasquer.'
  };

  var PRIVACY_LABELS = {
    standard: 'Standard',
    auto: 'Masquage automatique',
    hold: 'Maintenir pour révéler'
  };

  function renderDifficultyUI() {
    el.difficultyRadios.forEach(function (r) {
      r.checked = parseInt(r.value, 10) === state.difficulty;
    });
    if (el.difficultyHint) el.difficultyHint.textContent = DIFFICULTY_HINTS[state.difficulty];
  }

  function renderPrivacyUI() {
    el.privacyRadios.forEach(function (r) {
      r.checked = r.value === state.privacy;
    });
    el.autoHideField.style.display = state.privacy === 'auto' ? '' : 'none';
    el.autoHideSelect.value = String(state.autoHideSec);
    el.privacySummary.textContent = state.privacy === 'auto' ?
      (PRIVACY_LABELS.auto + ' · ' + state.autoHideSec + ' s') : PRIVACY_LABELS[state.privacy];
    renderSetupRecap();
  }

  function renderCustomCountHint() {
    if (!el.customCountHint) return;
    var n = customPairs.length;
    el.customCountHint.textContent = n ? (n + (n > 1 ? ' paires enregistrées' : ' paire enregistrée')) : 'Aucune paire enregistrée';
  }

  function initOptionsUI() {
    el.difficultyRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        state.difficulty = parseInt(r.value, 10);
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

    el.mrWhiteGuessInput.checked = state.mrWhiteGuess;
    el.mrWhiteGuessInput.addEventListener('change', function () {
      state.mrWhiteGuess = el.mrWhiteGuessInput.checked;
      saveOptions();
    });

    renderDifficultyUI();
    renderPrivacyUI();
    renderCustomCountHint();
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

  function loadWords() {
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

  // ======================================================================
  // Sons du minuteur (Web Audio, aucun fichier à charger)
  // ======================================================================
  var audioCtx = null;

  function unlockAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
  }
  document.addEventListener('pointerdown', unlockAudio, {
    passive: true
  });
  document.addEventListener('keydown', unlockAudio);

  function tone(freq, offset, duration, volume) {
    var t0 = audioCtx.currentTime + offset;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  function playTimerEnd() {
    if (!state.timerSound || !audioCtx || audioCtx.state !== 'running') return;
    try {
      tone(880, 0, 0.16, 0.22);
      tone(880, 0.24, 0.16, 0.22);
      tone(1175, 0.48, 0.45, 0.25);
    } catch (e) {}
  }

  function previewSound() {
    unlockAudio();
    if (!audioCtx || audioCtx.state !== 'running') return;
    try {
      tone(880, 0, 0.14, 0.18);
    } catch (e) {}
  }

  // ======================================================================
  // Écran maintenu allumé (Wake Lock) pendant les cartes et la discussion
  // ======================================================================
  var wakeLockSentinel = null;
  var wakeLockPending = false;

  function wakeLockWanted() {
    return 'wakeLock' in window.navigator &&
      el.gameScreen.classList.contains('screen--active') &&
      document.visibilityState === 'visible' &&
      (state.phase === 'reveal' || state.timerRunning);
  }

  function releaseWakeLock() {
    if (!wakeLockSentinel) return;
    var s = wakeLockSentinel;
    wakeLockSentinel = null;
    try {
      s.release().catch(function () {});
    } catch (e) {}
  }

  function syncWakeLock() {
    if (!('wakeLock' in window.navigator)) return;
    if (!wakeLockWanted()) {
      releaseWakeLock();
      return;
    }
    if (wakeLockSentinel || wakeLockPending) return;
    wakeLockPending = true;
    window.navigator.wakeLock.request('screen').then(function (sentinel) {
      wakeLockPending = false;
      wakeLockSentinel = sentinel;
      sentinel.addEventListener('release', function () {
        if (wakeLockSentinel === sentinel) wakeLockSentinel = null;
      });
      if (!wakeLockWanted()) releaseWakeLock();
    }).catch(function () {
      wakeLockPending = false;
    });
  }
  document.addEventListener('visibilitychange', syncWakeLock);

  // ======================================================================
  // Confidentialité des cartes : masquage auto / maintenir pour révéler
  // ======================================================================
  var autoHideTimer = null;

  function setCardMasked(masked) {
    el.wordModal.classList.toggle('modal--masked', masked);
  }

  function clearAutoHide() {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
    if (el.autoHideBar) el.autoHideBar.hidden = true;
  }

  function armAutoHide() {
    clearAutoHide();
    var fill = el.autoHideBar.firstElementChild;
    el.autoHideBar.hidden = false;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    void fill.offsetWidth;
    fill.style.transition = 'width ' + state.autoHideSec + 's linear';
    fill.style.width = '0%';
    autoHideTimer = setTimeout(function () {
      autoHideTimer = null;
      el.autoHideBar.hidden = true;
      setCardMasked(true);
      el.revealBtn.textContent = 'Réafficher le mot';
      el.revealRow.hidden = false;
      announce('Mot masqué.');
    }, state.autoHideSec * 1000);
  }

  function beginCardPrivacy() {
    clearAutoHide();
    setCardMasked(false);
    el.revealRow.hidden = true;
    el.hideWordBtn.disabled = false;
    if (state.privacy === 'auto') {
      armAutoHide();
    } else if (state.privacy === 'hold') {
      setCardMasked(true);
      el.revealBtn.textContent = 'Maintenir pour révéler';
      el.revealRow.hidden = false;
      // Impossible de passer au suivant sans avoir vu son mot au moins une fois.
      el.hideWordBtn.disabled = true;
    }
  }

  function endCardPrivacy() {
    clearAutoHide();
    setCardMasked(false);
    el.revealRow.hidden = true;
    el.hideWordBtn.disabled = false;
  }

  function holdReveal(on) {
    if (state.privacy !== 'hold' || state.openCardId === null) return;
    setCardMasked(!on);
    if (on) el.hideWordBtn.disabled = false;
  }

  el.revealBtn.addEventListener('pointerdown', function (e) {
    if (state.privacy !== 'hold') return;
    e.preventDefault();
    try {
      el.revealBtn.setPointerCapture(e.pointerId);
    } catch (err) {}
    holdReveal(true);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach(function (evt) {
    el.revealBtn.addEventListener(evt, function () {
      holdReveal(false);
    });
  });
  el.revealBtn.addEventListener('keydown', function (e) {
    if (state.privacy === 'hold' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      holdReveal(true);
    }
  });
  el.revealBtn.addEventListener('keyup', function (e) {
    if (state.privacy === 'hold' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      holdReveal(false);
    }
  });
  el.revealBtn.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  el.revealBtn.addEventListener('click', function () {
    if (state.privacy !== 'auto') return;
    setCardMasked(false);
    el.revealRow.hidden = true;
    armAutoHide();
  });

  function focusCardModal() {
    if (state.privacy === 'hold') el.revealBtn.focus();
    else el.hideWordBtn.focus();
  }

  // ======================================================================
  // Dernière chance de Mr. White
  // ======================================================================
  var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null;
  var listening = false;

  function normalizeGuess(str, loose) {
    var s = normalizeWord(str).replace(/^(de la|le|la|les|l|un|une|des|du|d) /, '');
    if (loose && s.length > 3) s = s.replace(/[sx]$/, '');
    return s;
  }

  // Exact (articles et accents ignorés), ou pluriel/singulier — sauf si cela
  // revient à donner le mot de l'Undercover (ex. Pari / Paris).
  function isCorrectGuess(guess) {
    var g = normalizeGuess(guess, false);
    if (!g) return false;
    if (g === normalizeGuess(state.civilWord, false)) return true;
    var other = normalizeGuess(state.undercoverWord, false);
    if (g === other) return false;
    return normalizeGuess(guess, true) === normalizeGuess(state.civilWord, true) &&
      normalizeGuess(guess, true) !== normalizeGuess(state.undercoverWord, true);
  }

  function stopDictation() {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    listening = false;
    el.guessMicBtn.textContent = 'Dicter';
    el.guessMicBtn.setAttribute('aria-pressed', 'false');
  }

  function toggleDictation() {
    if (!SpeechRec) return;
    if (listening) {
      stopDictation();
      return;
    }
    try {
      recognition = new SpeechRec();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = function () {
        listening = true;
        el.guessMicBtn.textContent = 'Écoute…';
        el.guessMicBtn.setAttribute('aria-pressed', 'true');
      };
      recognition.onresult = function (event) {
        var text = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
        el.guessInput.value = String(text).replace(/[.!?,]+$/, '').trim().slice(0, MAX_WORD_LENGTH);
      };
      recognition.onerror = function () {
        showToast('Dictée indisponible : saisissez le mot au clavier.');
      };
      recognition.onend = function () {
        listening = false;
        el.guessMicBtn.textContent = 'Dicter';
        el.guessMicBtn.setAttribute('aria-pressed', 'false');
        el.guessInput.focus();
      };
      recognition.start();
    } catch (e) {
      stopDictation();
      showToast('Dictée indisponible : saisissez le mot au clavier.');
    }
  }

  function openGuessModal() {
    var p = state.guessQueue[0];
    if (!p) {
      proceedAfterElimination();
      return;
    }
    el.guessTitle.textContent = p.name + ' — dernière chance';
    el.guessIntro.textContent = 'Devine le mot des Civils. Si tu le trouves, tu gagnes seul(e) la partie !';
    el.guessInput.value = '';
    el.guessInputRow.hidden = false;
    el.guessMicBtn.hidden = !SpeechRec;
    el.guessResult.textContent = '';
    el.guessResult.className = 'guess__result';
    el.guessSubmitBtn.hidden = false;
    el.guessSkipBtn.hidden = false;
    el.guessContinueBtn.hidden = true;
    el.guessModal.classList.add('modal--open');
    el.guessModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.guessInput.focus();
    announce(p.name + ' tente sa dernière chance.');
  }

  function closeGuessModal() {
    stopDictation();
    el.guessModal.classList.remove('modal--open');
    el.guessModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function submitGuess(skipped) {
    var p = state.guessQueue.shift();
    if (!p) return;
    stopDictation();
    var guess = skipped ? '' : el.guessInput.value.trim();
    var ok = !skipped && guess !== '' && isCorrectGuess(guess);

    el.guessInputRow.hidden = true;
    el.guessSubmitBtn.hidden = true;
    el.guessSkipBtn.hidden = true;
    el.guessContinueBtn.hidden = false;

    if (ok) {
      state.winner = 'mrwhite';
      state.winnerDetail = p.name;
      state.winnerPlayerId = p.id;
      state.winnerReason = '';
      state.guessQueue = [];
      el.guessIntro.textContent = '';
      el.guessResult.textContent = 'Bravo ! « ' + guess + ' » était bien le mot des Civils.';
      el.guessResult.className = 'guess__result guess__result--ok';
      el.guessContinueBtn.firstChild.nodeValue = 'Voir le résultat ';
      vibrate([30, 40, 30, 40, 60]);
    } else {
      el.guessIntro.textContent = '';
      el.guessResult.textContent = skipped ?
        (p.name + ' renonce à deviner.') :
        ('Raté : « ' + guess + ' » n\'est pas le mot des Civils. Le mot reste secret.');
      el.guessResult.className = 'guess__result guess__result--ko';
      var next = state.guessQueue.length > 0;
      el.guessContinueBtn.firstChild.nodeValue = next ? 'Mr. White suivant ' : (state.winner ? 'Voir le résultat ' : 'Continuer ');
      vibrate(40);
    }
    announce(el.guessResult.textContent);
    el.guessContinueBtn.focus();
  }

  el.guessSubmitBtn.addEventListener('click', function () {
    if (!el.guessInput.value.trim()) {
      showToast('Saisissez un mot, ou choisissez de renoncer.');
      el.guessInput.focus();
      return;
    }
    submitGuess(false);
  });
  el.guessSkipBtn.addEventListener('click', function () {
    submitGuess(true);
  });
  el.guessInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      el.guessSubmitBtn.click();
    }
  });
  el.guessMicBtn.addEventListener('click', toggleDictation);
  el.guessContinueBtn.addEventListener('click', function () {
    closeGuessModal();
    if (state.guessQueue.length) openGuessModal();
    else proceedAfterElimination();
  });

  // ======================================================================
  // « Mes paires » : saisie, import / export, partage par lien
  // ======================================================================
  var pendingImport = null;

  function toBase64Url(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return window.btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromBase64Url(str) {
    var s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = window.atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function buildShareUrl() {
    var json = JSON.stringify(customPairs);
    return window.location.origin + window.location.pathname + '#paires=' + toBase64Url(json);
  }

  function decodeShared(encoded) {
    try {
      var arr = JSON.parse(fromBase64Url(encoded));
      if (!Array.isArray(arr)) return null;
      return arr.map(sanitizePair).filter(Boolean).slice(0, MAX_CUSTOM_PAIRS);
    } catch (e) {
      return null;
    }
  }

  function mergeCustomPairs(list) {
    var seen = {};
    customPairs.forEach(function (p) {
      seen[pairKey(p)] = true;
    });
    var added = 0;
    var skipped = 0;
    list.forEach(function (raw) {
      var p = sanitizePair(raw);
      if (!p) {
        skipped += 1;
        return;
      }
      var k = pairKey(p);
      if (seen[k] || customPairs.length >= MAX_CUSTOM_PAIRS) {
        skipped += 1;
        return;
      }
      seen[k] = true;
      customPairs.push(p);
      added += 1;
    });
    if (added) saveCustomPairs();
    return {
      added: added,
      skipped: skipped
    };
  }

  function afterCustomChange() {
    renderCustomModal();
    renderThemeToggles();
  }

  function renderCustomModal() {
    var n = customPairs.length;
    el.customCount.textContent = n + (n > 1 ? ' paires' : ' paire') + ' (max. ' + MAX_CUSTOM_PAIRS + ')';
    el.customEmpty.style.display = n ? 'none' : '';
    el.customList.style.display = n ? '' : 'none';
    el.customExportBtn.disabled = !n;
    el.customShareBtn.disabled = !n;
    el.customList.innerHTML = '';
    customPairs.forEach(function (pair, index) {
      var li = document.createElement('li');
      var words = document.createElement('span');
      words.className = 'custom-list__words';
      words.textContent = pair[0] + ' / ' + pair[1];
      var badge = document.createElement('span');
      badge.className = 'custom-list__diff custom-list__diff--' + pairDifficulty(pair);
      badge.textContent = DIFFICULTY_LABELS[pairDifficulty(pair)];
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'custom-list__del';
      del.setAttribute('aria-label', 'Supprimer la paire ' + pair[0] + ' / ' + pair[1]);
      del.textContent = '×';
      del.addEventListener('click', function () {
        var removed = customPairs.splice(index, 1)[0];
        delete usedPairsMap[pairId(CUSTOM_THEME_KEY, removed)];
        saveUsedPairs();
        saveCustomPairs();
        afterCustomChange();
      });
      li.appendChild(words);
      li.appendChild(badge);
      li.appendChild(del);
      el.customList.appendChild(li);
    });
  }

  function showImportBanner() {
    if (pendingImport && pendingImport.length) {
      var n = pendingImport.length;
      el.customImportText.textContent = 'Un lien de partage contient ' + n + (n > 1 ? ' paires' : ' paire') + '. Les ajouter à « Mes paires » ?';
      el.customImportBanner.hidden = false;
    } else {
      el.customImportBanner.hidden = true;
    }
  }

  function openCustomModal() {
    renderCustomModal();
    showImportBanner();
    el.customModal.classList.add('modal--open');
    el.customModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.customWordA.focus();
  }

  function closeCustomModal() {
    el.customModal.classList.remove('modal--open');
    el.customModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    pendingImport = null;
  }

  function addCustomPair() {
    var pair = sanitizePair([el.customWordA.value, el.customWordB.value, el.customDifficulty.value]);
    if (!pair) {
      showToast('Saisissez deux mots différents (' + MAX_WORD_LENGTH + ' caractères maximum chacun).');
      return;
    }
    var res = mergeCustomPairs([pair]);
    if (!res.added) {
      showToast(customPairs.length >= MAX_CUSTOM_PAIRS ? 'Limite de ' + MAX_CUSTOM_PAIRS + ' paires atteinte.' : 'Cette paire existe déjà.');
      return;
    }
    el.customWordA.value = '';
    el.customWordB.value = '';
    el.customWordA.focus();
    afterCustomChange();
    showToast(state.selectedThemes[CUSTOM_THEME_KEY] ?
      'Paire ajoutée.' : 'Paire ajoutée — cochez « Mes paires » dans les thèmes pour l\'utiliser.', 3600);
  }

  function reportImport(res) {
    var msg = res.added + (res.added > 1 ? ' paires ajoutées' : ' paire ajoutée');
    if (res.skipped) msg += ' · ' + res.skipped + ' ignorée' + (res.skipped > 1 ? 's' : '') + ' (doublon ou invalide)';
    showToast(msg + '.', 3600);
  }

  el.customManageBtn.addEventListener('click', openCustomModal);
  el.customCloseBtn.addEventListener('click', closeCustomModal);
  el.customScrim.addEventListener('click', closeCustomModal);
  el.customAddBtn.addEventListener('click', addCustomPair);
  [el.customWordA, el.customWordB].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomPair();
      }
    });
  });

  el.customExportBtn.addEventListener('click', function () {
    downloadFile('undercover-mes-paires-' + todayStamp() + '.json', 'application/json', JSON.stringify({
      app: 'undercover',
      kind: 'custom-pairs',
      version: 1,
      pairs: customPairs
    }, null, 2));
    showToast('Paires exportées.');
  });

  el.customImportBtn.addEventListener('click', function () {
    el.customImportFile.click();
  });

  el.customImportFile.addEventListener('change', function () {
    var file = el.customImportFile.files && el.customImportFile.files[0];
    el.customImportFile.value = '';
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var list = Array.isArray(data) ? data : (data && Array.isArray(data.pairs) ? data.pairs : null);
        if (!list) throw new Error('format');
        reportImport(mergeCustomPairs(list));
        afterCustomChange();
      } catch (e) {
        showToast('Fichier non reconnu : choisissez un export JSON de « Mes paires ».');
      }
    };
    reader.onerror = function () {
      showToast('Lecture du fichier impossible.');
    };
    reader.readAsText(file);
  });

  el.customShareBtn.addEventListener('click', function () {
    if (!customPairs.length) return;
    var url = buildShareUrl();
    if (window.navigator.share) {
      window.navigator.share({
        title: 'Undercover — mes paires',
        text: 'Mes paires de mots pour Undercover',
        url: url
      }).catch(function () {});
      return;
    }
    if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
      window.navigator.clipboard.writeText(url).then(function () {
        showToast('Lien de partage copié dans le presse-papiers.');
      }).catch(function () {
        window.prompt('Copiez ce lien de partage :', url);
      });
    } else {
      window.prompt('Copiez ce lien de partage :', url);
    }
  });

  el.customImportConfirm.addEventListener('click', function () {
    if (pendingImport) {
      reportImport(mergeCustomPairs(pendingImport));
      pendingImport = null;
      showImportBanner();
      afterCustomChange();
    }
  });
  el.customImportDismiss.addEventListener('click', function () {
    pendingImport = null;
    showImportBanner();
  });

  // ======================================================================
  // Export du journal
  // ======================================================================
  if (el.scoreExportJson) el.scoreExportJson.addEventListener('click', exportScoreJson);
  if (el.scoreExportCsv) el.scoreExportCsv.addEventListener('click', exportScoreCsv);

  // ======================================================================
  // Installation de l'application
  // ======================================================================
  var deferredInstallPrompt = null;

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  }

  function updateInstallBtn() {
    if (!el.installBtn) return;
    el.installBtn.hidden = isStandalone() || !(deferredInstallPrompt || isIos());
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    updateInstallBtn();
  });
  window.addEventListener('appinstalled', function () {
    deferredInstallPrompt = null;
    updateInstallBtn();
    showToast('Application installée !');
  });
  el.installBtn.addEventListener('click', function () {
    if (deferredInstallPrompt) {
      var promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      promptEvent.prompt();
      promptEvent.userChoice.then(updateInstallBtn).catch(updateInstallBtn);
    } else if (isIos()) {
      showToast('Sur iPhone / iPad : touchez Partager, puis « Sur l\'écran d\'accueil ».', 6000);
    }
  });
  updateInstallBtn();

  // ======================================================================
  // Raccourcis (?action=new | scores) et liens de partage (#paires=…)
  // ======================================================================
  function handleLaunchActions() {
    var action = null;
    try {
      action = new URLSearchParams(window.location.search).get('action');
    } catch (e) {}
    var hash = window.location.hash || '';
    var shared = hash.indexOf('#paires=') === 0 ? decodeShared(hash.slice(8)) : null;

    if (action || hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {}
    }

    if (shared && shared.length) {
      pendingImport = shared;
      openCustomModal();
    } else if (action === 'scores') {
      openScoreModal();
    } else if (action === 'new') {
      el.startBtn.scrollIntoView({
        block: 'center'
      });
      el.startBtn.focus();
    }
  }

  // ======================================================================
  // Groupes de joueurs mémorisés
  // ======================================================================
  var GROUPS_STORAGE_KEY = 'undercover_groups_v1';
  var MAX_GROUPS = 20;
  var MAX_GROUP_NAME = 24;

  function nameKey(str) {
    return normalizeWord(str);
  }

  function loadGroups() {
    try {
      var raw = window.localStorage.getItem(GROUPS_STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      var out = [];
      parsed.forEach(function (g) {
        if (!g || typeof g.name !== 'string' || !Array.isArray(g.players)) return;
        var name = g.name.replace(/\s+/g, ' ').trim().slice(0, MAX_GROUP_NAME);
        var players = g.players.map(function (p) {
          return String(p == null ? '' : p).replace(/\s+/g, ' ').trim().slice(0, 20);
        }).filter(Boolean);
        if (!name || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) return;
        out.push({
          id: String(g.id || ('g' + out.length + Date.now())),
          name: name,
          players: players
        });
      });
      return out.slice(0, MAX_GROUPS);
    } catch (e) {
      return [];
    }
  }

  var groups = loadGroups();

  function saveGroups() {
    try {
      window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {}
  }

  function readNameInputs() {
    var out = [];
    el.namesGrid.querySelectorAll('input[data-name-input]').forEach(function (input) {
      out.push(input.value.trim());
    });
    return out;
  }

  function sameNameSet(a, b) {
    if (a.length !== b.length) return false;
    var x = a.map(nameKey).sort();
    var y = b.map(nameKey).sort();
    return x.every(function (v, i) {
      return v === y[i];
    });
  }

  function matchGroup(names) {
    for (var i = 0; i < groups.length; i++) {
      if (sameNameSet(groups[i].players, names)) return groups[i];
    }
    return null;
  }

  function matchGroupName(names) {
    var g = matchGroup(names);
    return g ? g.name : '';
  }

  function duplicateNames(names) {
    var seen = {};
    var dups = [];
    names.forEach(function (n) {
      if (!n) return;
      var k = nameKey(n);
      if (!k) return;
      if (seen[k] === 1) dups.push(n);
      seen[k] = (seen[k] || 0) + 1;
    });
    return dups;
  }

  function renderGroups() {
    if (!el.groupList) return;
    var active = matchGroup(readNameInputs());
    el.groupList.innerHTML = '';
    el.groupEmpty.hidden = groups.length > 0;
    groups.forEach(function (g) {
      var chip = document.createElement('span');
      chip.className = 'group-chip' + (active && active.id === g.id ? ' group-chip--active' : '');

      var load = document.createElement('button');
      load.type = 'button';
      load.className = 'group-chip__load';
      load.title = g.players.join(', ');
      load.textContent = g.name;
      var count = document.createElement('small');
      count.textContent = ' · ' + g.players.length;
      load.appendChild(count);
      load.addEventListener('click', function () {
        loadGroup(g.id);
      });

      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'group-chip__del';
      del.setAttribute('aria-label', 'Supprimer le groupe ' + g.name);
      del.textContent = '×';
      del.addEventListener('click', function () {
        if (window.confirm('Supprimer le groupe « ' + g.name + ' » ?')) {
          groups = groups.filter(function (x) {
            return x.id !== g.id;
          });
          saveGroups();
          onNamesChanged();
        }
      });

      chip.appendChild(load);
      chip.appendChild(del);
      el.groupList.appendChild(chip);
    });
    if (el.namesSummary) el.namesSummary.textContent = active ? active.name : 'Optionnel';
  }

  function onNamesChanged() {
    renderGroups();
    renderBalance();
  }

  function loadGroup(id) {
    var g = groups.filter(function (x) {
      return x.id === id;
    })[0];
    if (!g) return;
    state.playerCount = clamp(g.players.length, MIN_PLAYERS, MAX_PLAYERS);
    updateCounter();
    updateUnderCounter();
    renderNameFields();
    el.namesGrid.querySelectorAll('input[data-name-input]').forEach(function (input, i) {
      input.value = g.players[i] || '';
    });
    onNamesChanged();
    showToast('Groupe « ' + g.name + ' » chargé (' + g.players.length + ' joueurs).');
  }

  function saveGroup() {
    var name = el.groupNameInput.value.replace(/\s+/g, ' ').trim().slice(0, MAX_GROUP_NAME);
    var names = readNameInputs();
    if (!name) {
      showToast('Donnez un nom au groupe avant de l\'enregistrer.');
      el.groupNameInput.focus();
      return;
    }
    if (names.some(function (n) {
        return !n;
      })) {
      showToast('Renseignez le nom des ' + names.length + ' joueurs avant d\'enregistrer le groupe.', 3600);
      return;
    }
    var dups = duplicateNames(names);
    if (dups.length) {
      showToast('Deux joueurs portent le même nom (' + dups[0] + ') : rendez-les uniques.', 3600);
      return;
    }
    var existing = groups.filter(function (g) {
      return nameKey(g.name) === nameKey(name);
    })[0];
    if (existing) {
      existing.name = name;
      existing.players = names;
    } else {
      if (groups.length >= MAX_GROUPS) {
        showToast('Limite de ' + MAX_GROUPS + ' groupes atteinte : supprimez-en un.', 3600);
        return;
      }
      groups.push({
        id: 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
        name: name,
        players: names
      });
    }
    saveGroups();
    el.groupNameInput.value = '';
    onNamesChanged();
    showToast(existing ? ('Groupe « ' + name + ' » mis à jour.') : ('Groupe « ' + name + ' » enregistré.'));
  }

  el.groupSaveBtn.addEventListener('click', saveGroup);
  el.groupNameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveGroup();
    }
  });
  el.namesGrid.addEventListener('input', onNamesChanged);

  // Filtre du journal par groupe
  var scoreGroupFilter = 'all';

  function refreshScoreFilter() {
    var names = {};
    scoreLog.forEach(function (e) {
      if (e.group) names[e.group] = true;
    });
    var list = Object.keys(names).sort();
    el.scoreFilterRow.hidden = list.length === 0;
    if (scoreGroupFilter !== 'all' && scoreGroupFilter !== '__none' && !names[scoreGroupFilter]) scoreGroupFilter = 'all';
    el.scoreGroupFilter.innerHTML = '';
    var opts = [
      ['all', 'Tous les groupes']
    ];
    list.forEach(function (n) {
      opts.push([n, n]);
    });
    opts.push(['__none', 'Sans groupe']);
    opts.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o[0];
      opt.textContent = o[1];
      el.scoreGroupFilter.appendChild(opt);
    });
    el.scoreGroupFilter.value = scoreGroupFilter;
  }

  function filteredScoreEntries() {
    if (scoreGroupFilter === 'all') return scoreLog;
    return scoreLog.filter(function (e) {
      return scoreGroupFilter === '__none' ? !e.group : e.group === scoreGroupFilter;
    });
  }

  el.scoreGroupFilter.addEventListener('change', function () {
    scoreGroupFilter = el.scoreGroupFilter.value;
    renderScoreModal();
  });

  // ======================================================================
  // Suggestion et contrôle d'équilibrage
  // ======================================================================
  // Total d'imposteurs recommandé (Undercover + Mr. White + Espion), environ 1 pour 4 joueurs.
  function recommendedImpostors(n) {
    return Math.max(1, Math.floor((n + 1) / 4));
  }

  function recommendedUndercover(n) {
    var cap = maxImpostors(n);
    var others = state.mrWhiteCount + state.espionCount;
    return clamp(recommendedImpostors(n) - others, MIN_UNDERCOVER, Math.max(MIN_UNDERCOVER, cap - others));
  }

  function applyAutoUndercover() {
    if (state.autoUndercover) {
      state.undercoverCount = recommendedUndercover(state.playerCount);
    }
  }

  function plural(n, one, many) {
    return n + ' ' + (n > 1 ? many : one);
  }

  function renderAutoUnderUI() {
    if (!el.autoUndercover) return;
    el.autoUndercover.checked = state.autoUndercover;
    var rec = recommendedImpostors(state.playerCount);
    el.autoUnderHint.textContent = 'Recommandé pour ' + state.playerCount + ' joueurs : ' +
      plural(rec, 'imposteur', 'imposteurs') + ' au total (Undercover, Mr. White et Espion compris).';
  }

  function manualUndercoverChange() {
    if (state.autoUndercover) {
      state.autoUndercover = false;
      saveOptions();
    }
  }

  function specialSlots() {
    return (state.roles.idiot ? 1 : 0) + (state.roles.fantome ? 1 : 0) + (state.roles.mime ? 1 : 0) +
      (state.roles.procureur ? 1 : 0) + (state.roles.amoureux ? 2 : 0);
  }

  function computeBalanceNotes() {
    var n = state.playerCount;
    var imp = state.undercoverCount + state.mrWhiteCount + state.espionCount;
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
        text: 'Beaucoup d\'imposteurs (' + imp + ' sur ' + n + ') : les Civils auront du mal à gagner. Recommandé : ' + rec + '.'
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

  function renderBalance() {
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

  el.autoUndercover.addEventListener('change', function () {
    state.autoUndercover = el.autoUndercover.checked;
    saveOptions();
    updateUnderCounter();
  });

  updateCounter();
  updateUnderCounter();
  renderNameFields();
  renderSetupRecap();
  initOptionsUI();
  loadWords();
  handleLaunchActions();

  var swUpdateRequested = false;

  function showUpdateToast(worker) {
    if (document.getElementById('updateToast')) return;

    var box = document.createElement('div');
    box.id = 'updateToast';
    box.className = 'update-toast';
    box.setAttribute('role', 'status');

    var text = document.createElement('span');
    text.textContent = 'Nouvelle version disponible.';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'update-toast__btn';
    btn.textContent = 'Recharger';
    btn.addEventListener('click', function () {
      btn.disabled = true;
      swUpdateRequested = true;
      worker.postMessage({ type: 'SKIP_WAITING' });
    });

    box.appendChild(text);
    box.appendChild(btn);
    document.body.appendChild(box);
    announce('Nouvelle version disponible.');
  }

  if ('serviceWorker' in navigator) {
    var swRefreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      // Pas de rechargement à la 1re installation : uniquement après un clic sur « Recharger ».
      if (!swUpdateRequested || swRefreshing) return;
      swRefreshing = true;
      window.location.reload();
    });

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        // Une mise à jour peut déjà attendre (onglet ouvert depuis longtemps).
        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateToast(reg.waiting);
        }

        reg.addEventListener('updatefound', function () {
          var installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', function () {
            // "controller" est nul à la toute première installation : pas de toast dans ce cas.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(installing);
            }
          });
        });

        // Vérifie aussi quand l'app revient au premier plan (PWA rarement rechargée).
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') {
            reg.update().catch(function () {});
          }
        });
      }).catch(function () {});
    });
  }
})();