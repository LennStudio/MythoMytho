// Question de fin de manche du Mytho : « Le groupe a-t-il repéré le mensonge ? ». [chunk de jeu]

import { announce, el, state } from './core.js';
import { saveScoreLog } from './journal.js';

export function hideMythoPanel() {
  el.mythoPanel.hidden = true;
  el.mythoDone.hidden = true;
  el.mythoDone.textContent = '';
  el.mythoSpotted.hidden = false;
  el.mythoPassed.hidden = false;
}

export function showMythoQuestion() {
  var mytho = state.players.filter(function (p) {
    return p.isMytho;
  })[0];
  if (!mytho) {
    hideMythoPanel();
    return;
  }
  hideMythoPanel();
  el.mythoQuestion.textContent = 'Le groupe a-t-il repéré le mensonge du Mytho (' + mytho.name + ') ?';
  el.mythoPanel.hidden = false;
  announce(el.mythoQuestion.textContent);
}

function answerMytho(spotted) {
  var index = -1;
  state.players.forEach(function (p, i) {
    if (p.isMytho) index = i;
  });
  var entry = state.lastScoreEntry;
  if (entry && entry.players && entry.players[index]) {
    entry.players[index].lie = spotted ? 'spotted' : 'passed';
    saveScoreLog();
  }
  el.mythoSpotted.hidden = true;
  el.mythoPassed.hidden = true;
  el.mythoDone.textContent = spotted ?
    'Enregistré : mensonge repéré.' : 'Enregistré : mensonge réussi, il est passé inaperçu !';
  el.mythoDone.hidden = false;
  announce(el.mythoDone.textContent);
}

export function bootMytho() {
  el.mythoSpotted.addEventListener('click', function () {
    answerMytho(true);
  });
  el.mythoPassed.addEventListener('click', function () {
    answerMytho(false);
  });
}