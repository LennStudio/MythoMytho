// Écran maintenu allumé pendant les cartes et la discussion. [chunk de jeu]

import { el, state } from './core.js';

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

export function syncWakeLock() {
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

export function bootWakelock() {
  document.addEventListener('visibilitychange', syncWakeLock);
}
