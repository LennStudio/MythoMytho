// Point d'entrée : démarrage de l'accueil et chargement à la demande.

import { bootAudio } from './audio.js';
import { bootBalance } from './balance.js';
import { el, showToast } from './core.js';
import { bootGroups } from './groups.js';
import { initOptionsUI, loadOptions } from './options.js';
import { bootPwa } from './pwa.js';
import { bootSetup, renderNameFields, renderSetupRecap, updateCounter, updateUnderCounter } from './setup.js';
import { bootTheme } from './theme.js';
import { loadWords } from './themes.js';

var chunks = {};

function loadChunk(name, loader) {
  if (!chunks[name]) {
    chunks[name] = loader().then(function (m) {
      m.boot();
      return m;
    });
    chunks[name].catch(function () {
      chunks[name] = null;
    });
  }
  return chunks[name];
}

function loadGame() {
  return loadChunk('game', function () {
    return import('./game-chunk.js');
  });
}

function loadJournalUi() {
  return loadChunk('journal', function () {
    return import('./journal-ui.js');
  });
}

function loadCustomUi() {
  return loadChunk('custom', function () {
    return import('./custom-ui.js');
  });
}

function loadFailed() {
  showToast('Chargement impossible : vérifiez la connexion puis réessayez.', 3600);
}

function requestScoreModal() {
  loadJournalUi().then(function (m) {
    m.openScoreModal();
  }).catch(loadFailed);
}

function requestCustomModal() {
  loadCustomUi().then(function (m) {
    m.openCustomModal();
  }).catch(loadFailed);
}

function whenIdle(fn) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 2500 });
  else setTimeout(fn, 800);
}

function handleLaunchActions() {
  var action = null;
  try {
    action = new URLSearchParams(window.location.search).get('action');
  } catch (e) {}
  var hash = window.location.hash || '';
  var encoded = hash.indexOf('#paires=') === 0 ? hash.slice(8) : '';

  if (action || hash) {
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) {}
  }

  function runAction() {
    if (action === 'scores') {
      requestScoreModal();
    } else if (action === 'new') {
      el.startBtn.scrollIntoView({
        block: 'center'
      });
      el.startBtn.focus();
    }
  }

  if (encoded) {
    loadCustomUi().then(function (m) {
      var shared = m.decodeShared(encoded);
      if (shared && shared.length) m.openCustomModal(shared);
      else runAction();
    }).catch(loadFailed);
  } else {
    runAction();
  }
}

loadOptions();

bootTheme();

bootSetup();

bootAudio();

bootGroups();

bootBalance();

bootPwa();

el.startBtn.addEventListener('click', function () {
  loadGame().then(function (g) {
    g.handleStartClick();
  }).catch(loadFailed);
});

if (el.scoreLogToggle) el.scoreLogToggle.addEventListener('click', requestScoreModal);

if (el.scoreLogBtnGame) el.scoreLogBtnGame.addEventListener('click', requestScoreModal);

el.customManageBtn.addEventListener('click', requestCustomModal);

updateCounter();

updateUnderCounter();

renderNameFields();

renderSetupRecap();

initOptionsUI();

loadWords();

handleLaunchActions();

whenIdle(function () {
  loadGame().catch(function () {});
});
