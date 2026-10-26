// Vote, élimination, fin de partie et récapitulatif. [chunk de jeu]

import { CARD_ICON, cardRotation } from './cards.js';
import { ROLE_NAMES, announce, el, getPlayer, isImpostor, isImpostorTeam, state, vibrate } from './core.js';
import { openGuessModal } from './guess.js';
import { baseRoleKey, recordScoreEntry } from './journal.js';
import { showMythoQuestion } from './mytho.js';
import { stopDiscussionTimer } from './timer.js';

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

function roleLabel(player) {
  if (player.isFauxFrere) return player.name + ' était le Faux-Frère';
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
      var impostorAlive2 = aliveNow.filter(isImpostorTeam).length;
      if (impostorAlive2 > 0) {
        winner = 'undercover';
        winnerReason = 'deadlock2';
      }
    }

    if (!winner) {
      // Le Faux-Frère compte avec les imposteurs : les Civils ne gagnent qu'une fois
      // tous les imposteurs ET le Faux-Frère éliminés.
      var aliveImpostor = state.players.filter(function (p) {
        return !p.eliminated && isImpostorTeam(p);
      }).length;
      var aliveCivil = state.players.filter(function (p) {
        return !p.eliminated && !isImpostorTeam(p);
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
  if (winner !== 'idiot') {
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

  var traitorAlive = state.players.some(function (p) {
    return p.isFauxFrere && !p.eliminated;
  });
  var realImpostorsAlive = state.players.some(function (p) {
    return !p.eliminated && isImpostor(p);
  });

  if (winner === 'civils') {
    el.elimContinueText.textContent = state.players.some(function (p) {
      return p.isFauxFrere;
    }) ? 'Tous les imposteurs et le Faux-Frère ont été démasqués !' : 'Tous les imposteurs ont été démasqués !';
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
  } else if (traitorAlive && !realImpostorsAlive) {
    el.elimContinueText.textContent = 'Tous les imposteurs ont été démasqués, mais la partie n\'est pas terminée : un traître se cache encore parmi vous !';
    el.elimContinueBtn.textContent = 'Continuer';
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

export function proceedAfterElimination() {
  if (state.winner) {
    enterGameOver(state.winner);
  } else {
    renderEliminatedList();
    renderVoteGrid();
  }
}

function enterGameOver(winner) {
  state.phase = 'gameover';
  el.voteSection.classList.remove('vote-section--active');
  el.startVoteBtn.style.display = 'none';
  el.summaryBtn.classList.remove('summary-btn--hidden');
  stopDiscussionTimer();

  var impostorPlural = state.players.filter(isImpostor).length > 1;
  var traitor = state.players.filter(function (p) {
    return p.isFauxFrere;
  })[0];

  if (winner === 'civils') {
    el.gameOverTitle.textContent = 'Les Civils ont gagné !';
    el.gameOverSub.textContent = impostorPlural ?
      'Tous les imposteurs ont été démasqués et éliminés.' :
      'L\'imposteur a été démasqué et éliminé.';
    if (traitor) el.gameOverSub.textContent += ' Le Faux-Frère (' + traitor.name + ') aussi.';
    el.gameOverBanner.classList.add('game-over-banner--civils');
  } else if (winner === 'undercover') {
    el.gameOverTitle.textContent = impostorPlural ? 'Les Undercovers ont gagné !' : 'L\'Undercover a gagné !';
    el.gameOverSub.textContent = state.winnerReason === 'deadlock2' ?
      'Il ne restait plus que 2 joueurs : la situation était dans l\'impasse, l\'imposteur l\'emporte automatiquement.' :
      'Tous les Civils ont été éliminés avant d\'avoir démasqué l\'imposteur.';
    if (traitor) el.gameOverSub.textContent += ' Le Faux-Frère (' + traitor.name + ') gagne avec eux.';
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
  state.lastScoreEntry = recordScoreEntry(winner);
  showMythoQuestion();
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
    wordSpan.textContent = (player.isMrWhite || player.isEspion) ? 'Aucun mot' :
      (player.isJanus ? player.janusWords.join(' / ') : player.word);
    wordSpan.style.color = 'var(--ink-soft)';
    right.appendChild(wordSpan);

    var roleSpan = document.createElement('span');
    if (player.isMrWhite) {
      roleSpan.className = 'summary-role summary-role--undercover';
      roleSpan.textContent = 'Mr. White';
    } else if (player.isEspion) {
      roleSpan.className = 'summary-role summary-role--undercover';
      roleSpan.textContent = 'Espion';
    } else if (player.isFauxFrere) {
      roleSpan.className = 'summary-role summary-role--undercover';
      roleSpan.textContent = 'Faux-Frère';
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
    if (player.isMytho) specials.push('Mytho');
    if (player.isVoyeur) specials.push('Voyeur');
    if (player.isJanus) specials.push('Janus');
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

export function closeSummary() {
  el.summaryModal.classList.remove('modal--open');
  el.summaryModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

export function bootVote() {
  el.startVoteBtn.addEventListener('click', function () {
    if (el.startVoteBtn.disabled) return;
    enterVotePhase();
  });

  el.voteConfirmCancel.addEventListener('click', closeVoteConfirm);

  el.voteConfirmYes.addEventListener('click', function () {
    var id = state.pendingEliminationId;
    if (id === null) return;
    vibrate([30, 40, 30]);
    closeVoteConfirm();
    performElimination(id);
  });

  el.elimContinueBtn.addEventListener('click', function () {
    closeEliminationModal();
    if (state.guessQueue.length) {
      openGuessModal();
    } else {
      proceedAfterElimination();
    }
  });

  el.summaryBtn.addEventListener('click', openSummary);

  el.closeSummaryBtn.addEventListener('click', closeSummary);

  el.summaryScrim.addEventListener('click', closeSummary);
}