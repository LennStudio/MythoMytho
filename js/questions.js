// Questions de fin de manche : mensonge du Mytho repéré ? mission d'Hercule accomplie ? [chunk de jeu]

import { announce, el, state } from './core.js';
import { saveScoreLog } from './journal.js';

// Chaque question : le rôle concerné (flag), le champ enregistré dans le journal, les éléments du
// panneau et les deux réponses possibles.
var QUESTIONS = [{
  flag: 'isMytho',
  field: 'lie',
  panel: 'mythoPanel',
  question: 'mythoQuestion',
  done: 'mythoDone',
  first: 'mythoSpotted',
  firstValue: 'spotted',
  second: 'mythoPassed',
  secondValue: 'passed',
  ask: function (p) {
    return 'Le groupe a-t-il repéré le mensonge du Mytho (' + p.name + ') ?';
  },
  answered: function (value) {
    return value === 'spotted' ?
      'Enregistré : mensonge repéré.' : 'Enregistré : mensonge réussi, il est passé inaperçu !';
  }
}, {
  flag: 'isHercule',
  field: 'mission',
  panel: 'herculePanel',
  question: 'herculeQuestion',
  done: 'herculeDone',
  first: 'herculeSuccess',
  firstValue: 'success',
  second: 'herculeFail',
  secondValue: 'fail',
  ask: function (p) {
    return 'Hercule (' + p.name + ') a-t-il accompli sa mission ? « ' + p.mission + ' »';
  },
  answered: function (value) {
    return value === 'success' ? 'Enregistré : mission accomplie !' : 'Enregistré : mission ratée.';
  }
}];

function hidePanel(q) {
  el[q.panel].hidden = true;
  el[q.done].hidden = true;
  el[q.done].textContent = '';
  el[q.first].hidden = false;
  el[q.second].hidden = false;
}

export function hideQuestionPanels() {
  QUESTIONS.forEach(hidePanel);
}

export function showEndQuestions() {
  QUESTIONS.forEach(function (q) {
    hidePanel(q);
    var player = state.players.filter(function (p) {
      return p[q.flag];
    })[0];
    if (!player) return;
    el[q.question].textContent = q.ask(player);
    el[q.panel].hidden = false;
    announce(el[q.question].textContent);
  });
}

function answer(q, value) {
  var index = -1;
  state.players.forEach(function (p, i) {
    if (p[q.flag]) index = i;
  });
  var entry = state.lastScoreEntry;
  if (entry && entry.players && entry.players[index]) {
    entry.players[index][q.field] = value;
    saveScoreLog();
  }
  el[q.first].hidden = true;
  el[q.second].hidden = true;
  el[q.done].textContent = q.answered(value);
  el[q.done].hidden = false;
  announce(el[q.done].textContent);
}

export function bootQuestions() {
  QUESTIONS.forEach(function (q) {
    el[q.first].addEventListener('click', function () {
      answer(q, q.firstValue);
    });
    el[q.second].addEventListener('click', function () {
      answer(q, q.secondValue);
    });
  });
}