// Journal des scores : enregistrement des manches. [chunk de jeu]

import { isImpostorTeam, state } from './core.js';
import { matchGroupName } from './groups.js';

var SCORE_STORAGE_KEY = 'undercover_score_log_v1';

var MAX_SCORE_ENTRIES = 200;

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

export function saveScoreLog() {
  try {
    window.localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scoreLog.slice(0, MAX_SCORE_ENTRIES)));
  } catch (e) {}
}

export var scoreLog = loadScoreLog();

export function baseRoleKey(player) {
  if (player.isFauxFrere) return 'fauxfrere';
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
  if (player.isMytho) specials.push('Mytho');
  if (player.isVoyeur) specials.push('Voyeur');
  if (player.isJanus) specials.push('Janus');
  if (player.loverId !== null) specials.push('Amoureux');
  return specials;
}

function isWinningPlayer(player, winner) {
  var impostor = isImpostorTeam(player);
  if (winner === 'civils') return !impostor;
  if (winner === 'undercover') return impostor;
  if (winner === 'idiot') return player.isIdiot;
  if (winner === 'amoureux') return player.loverId !== null;
  if (winner === 'mrwhite') return player.id === state.winnerPlayerId;
  return false;
}

export function recordScoreEntry(winner) {
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
    return null;
  }

  winnerNames = state.players.filter(function (p) {
    return isWinningPlayer(p, winner);
  }).map(function (p) {
    return p.name;
  });

  var entry = {
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
      var row = {
        name: p.name,
        role: baseRoleKey(p),
        specials: playerSpecials(p),
        won: isWinningPlayer(p, winner),
        eliminated: !!p.eliminated
      };
      // Mytho : « spotted » / « passed », renseigné par la question de fin de manche.
      if (p.isMytho) row.lie = null;
      return row;
    })
  };
  scoreLog.unshift(entry);
  if (scoreLog.length > MAX_SCORE_ENTRIES) {
    scoreLog.length = MAX_SCORE_ENTRIES;
  }
  saveScoreLog();
  return entry;
}