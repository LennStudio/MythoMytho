// Noyau partagé : constantes, état de la partie (state), références DOM (el) et petits utilitaires.

export var MAX_WORD_LENGTH = 40;

export var DIFFICULTY_LABELS = {
  1: 'Facile',
  2: 'Moyenne',
  3: 'Difficile'
};

export function normalizeWord(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function pairDifficulty(pair) {
  var d = pair[2];
  return (d === 1 || d === 3) ? d : 2;
}

export var MIN_PLAYERS = 3;

export var MAX_PLAYERS = 20;

export var MIN_UNDERCOVER = 1;

export function maxImpostors(playerCount) {
  return Math.max(MIN_UNDERCOVER, Math.ceil(playerCount / 2) - 1);
}

export var ROLE_INFO = {
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

export var state = {
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

export var el = {
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

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

export function showToast(message, duration) {
  el.toast.textContent = message;
  el.toast.classList.add('toast--show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.toast.classList.remove('toast--show');
  }, duration || 2600);
}

export function announce(message) {
  el.srAnnounce.textContent = message;
}

export function vibrate(pattern) {
  try {
    if (window.navigator && typeof window.navigator.vibrate === 'function') {
      window.navigator.vibrate(pattern);
    }
  } catch (e) {}
}

export function shuffle(arr) {
  var a = arr.slice();
  for (var j = a.length - 1; j > 0; j--) {
    var k = randomInt(j + 1);
    var tmp = a[j];
    a[j] = a[k];
    a[k] = tmp;
  }
  return a;
}

export function getPlayer(id) {
  return state.players.filter(function (p) {
    return p.id === id;
  })[0];
}

export var ROLE_NAMES = {
  civil: 'Civil',
  undercover: 'Undercover',
  mrwhite: 'Mr. White',
  espion: 'Espion'
};

export function downloadFile(filename, mime, text) {
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

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}
