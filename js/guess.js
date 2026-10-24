// Dernière chance de Mr. White : saisie et dictée. [chunk de jeu]

import { MAX_WORD_LENGTH, announce, el, normalizeWord, showToast, state, vibrate } from './core.js';
import { proceedAfterElimination } from './vote.js';

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

export function openGuessModal() {
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

export function bootGuess() {
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
}
