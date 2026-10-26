// Déroulement d'une partie : attribution des rôles, lancement, nouvelle manche. [chunk de jeu]

import { renderCards } from './cards.js';
import { MIN_PLAYERS, MIN_UNDERCOVER, clamp, el, getPlayer, isImpostor, maxImpostors, showToast, shuffle, state } from './core.js';
import { hideMythoPanel } from './mytho.js';
import { clampRoleCounts } from './setup.js';
import { pickWordPair, selectedThemeKeys, wordsLoaded } from './themes.js';
import { resetDiscussionTimer, startDiscussionTimer, stopDiscussionTimer } from './timer.js';
import { closeSummary } from './vote.js';
import { syncWakeLock } from './wakelock.js';

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
    player.isMytho = false;
    player.isVoyeur = false;
    player.isJanus = false;
    player.isFauxFrere = false;
    player.voyeurNames = [];
    player.janusWords = [];
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
  // Rôles de camp Civils (un joueur distinct chacun) : attribués avant les rôles « tous joueurs »
  // pour que le groupe des Civils ne soit pas épuisé par ceux-ci.
  function pickCivilFor(flag, label) {
    var ids = availableIds(state.players.filter(function (p) {
      return !isImpostor(p);
    }).map(function (p) {
      return p.id;
    }));
    if (!ids.length) {
      skippedRoles.push(label);
      return null;
    }
    var id = shuffle(ids)[0];
    getPlayer(id)[flag] = true;
    usedForSpecial[id] = true;
    return getPlayer(id);
  }

  if (state.roles.fauxfrere) pickCivilFor('isFauxFrere', 'Faux-Frère');
  if (state.roles.mytho) pickCivilFor('isMytho', 'Mytho');
  if (state.roles.janus) {
    var janus = pickCivilFor('isJanus', 'Janus');
    if (janus) janus.janusWords = shuffle([words.civilWord, words.undercoverWord]);
  }
  if (state.roles.voyeur) {
    var voyeur = pickCivilFor('isVoyeur', 'Voyeur');
    if (voyeur) {
      // Trois noms dont exactement un vrai imposteur ; les deux autres n'en sont pas.
      var impostorNames = state.players.filter(isImpostor).map(function (p) {
        return p.name;
      });
      var innocentNames = state.players.filter(function (p) {
        return p.id !== voyeur.id && !isImpostor(p);
      }).map(function (p) {
        return p.name;
      });
      if (impostorNames.length && innocentNames.length >= 2) {
        voyeur.voyeurNames = shuffle([shuffle(impostorNames)[0]].concat(shuffle(innocentNames).slice(0, 2)));
      } else {
        voyeur.isVoyeur = false;
        usedForSpecial[voyeur.id] = false;
        skippedRoles.push('Voyeur');
      }
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
  hideMythoPanel();
  resetDiscussionTimer();
}

function switchToGameScreen() {
  el.setupScreen.classList.remove('screen--active');
  el.gameScreen.classList.add('screen--active');
  resetStageUI();
  renderGameHeader();
  renderCards();
}

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

export function updateProgress() {
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

function newRound() {
  closeSummary();
  state.round += 1;
  assignRoles();
  resetStageUI();
  renderGameHeader();
  renderCards();
  showToast('Nouvelle manche lancée — de nouveaux mots ont été distribués.');
}

export function handleStartClick() {
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
}

export function bootGame() {
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
}