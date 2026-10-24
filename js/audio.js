// Sons du minuteur (Web Audio).

import { state } from './core.js';

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

export function playTimerEnd() {
  if (!state.timerSound || !audioCtx || audioCtx.state !== 'running') return;
  try {
    tone(880, 0, 0.16, 0.22);
    tone(880, 0.24, 0.16, 0.22);
    tone(1175, 0.48, 0.45, 0.25);
  } catch (e) {}
}

export function previewSound() {
  unlockAudio();
  if (!audioCtx || audioCtx.state !== 'running') return;
  try {
    tone(880, 0, 0.14, 0.18);
  } catch (e) {}
}

export function bootAudio() {
  document.addEventListener('pointerdown', unlockAudio, {
    passive: true
  });

  document.addEventListener('keydown', unlockAudio);
}
