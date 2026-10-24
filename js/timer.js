// Minuteur de discussion. [chunk de jeu]

import { playTimerEnd } from './audio.js';
import { announce, el, showToast, state, vibrate } from './core.js';
import { syncWakeLock } from './wakelock.js';

var discussionTimerInterval = null;

function formatTimerTime(totalSeconds) {
  var s = Math.max(0, totalSeconds);
  var m = Math.floor(s / 60);
  var sec = s % 60;
  return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
}

function clearDiscussionInterval() {
  if (discussionTimerInterval) {
    clearInterval(discussionTimerInterval);
    discussionTimerInterval = null;
  }
}

function updateDiscussionTimerDisplay() {
  if (!el.discussionTimer) return;
  el.discussionTimerDisplay.textContent = formatTimerTime(state.timerRemaining);
  var totalSeconds = Math.max(1, state.timerDurationMin * 60);
  var pct = Math.max(0, Math.min(100, (state.timerRemaining / totalSeconds) * 100));
  el.discussionTimerFill.style.width = pct + '%';
  el.discussionTimer.classList.toggle('discussion-timer--warning', state.timerRemaining <= 30 && state.timerRemaining > 0);
  el.discussionTimer.classList.toggle('discussion-timer--paused', !state.timerRunning && !state.timerHasEnded);
  if (el.discussionTimerToggle) {
    el.discussionTimerToggle.textContent = state.timerHasEnded ? 'Relancer' : (state.timerRunning ? 'Pause' : 'Reprendre');
  }
  syncWakeLock();
}

function tickDiscussionTimer() {
  state.timerRemaining -= 1;
  if (state.timerRemaining <= 0) {
    state.timerRemaining = 0;
    state.timerRunning = false;
    state.timerHasEnded = true;
    clearDiscussionInterval();
    updateDiscussionTimerDisplay();
    vibrate([200, 100, 200]);
    playTimerEnd();
    showToast('Temps de discussion écoulé — place au vote !');
    announce('Temps de discussion écoulé.');
    return;
  }
  updateDiscussionTimerDisplay();
}

export function startDiscussionTimer() {
  if (!state.timerEnabled || !el.discussionTimer) return;
  if (state.timerRemaining <= 0) {
    state.timerRemaining = state.timerDurationMin * 60;
  }
  state.timerHasEnded = false;
  state.timerRunning = true;
  el.discussionTimer.classList.add('discussion-timer--show');
  updateDiscussionTimerDisplay();
  clearDiscussionInterval();
  discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
}

export function resetDiscussionTimer() {
  clearDiscussionInterval();
  state.timerRemaining = state.timerDurationMin * 60;
  state.timerRunning = false;
  state.timerHasEnded = false;
  state.timerStartedRound = false;
  if (el.discussionTimer) {
    el.discussionTimer.classList.remove('discussion-timer--show', 'discussion-timer--warning', 'discussion-timer--paused');
  }
  updateDiscussionTimerDisplay();
}

export function stopDiscussionTimer() {
  clearDiscussionInterval();
  state.timerRunning = false;
  if (el.discussionTimer) {
    el.discussionTimer.classList.remove('discussion-timer--show');
  }
  syncWakeLock();
}

export function bootTimer() {
  if (el.discussionTimerToggle) {
    el.discussionTimerToggle.addEventListener('click', function () {
      if (state.timerHasEnded) {
        state.timerRemaining = state.timerDurationMin * 60;
        state.timerHasEnded = false;
        state.timerRunning = true;
        el.discussionTimer.classList.remove('discussion-timer--warning');
        clearDiscussionInterval();
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
        updateDiscussionTimerDisplay();
        return;
      }
      state.timerRunning = !state.timerRunning;
      clearDiscussionInterval();
      if (state.timerRunning) {
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
      }
      updateDiscussionTimerDisplay();
    });
  }

  if (el.discussionTimerExtend) {
    el.discussionTimerExtend.addEventListener('click', function () {
      state.timerRemaining += 60;
      if (state.timerHasEnded) {
        state.timerHasEnded = false;
        state.timerRunning = true;
        clearDiscussionInterval();
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
      }
      el.discussionTimer.classList.remove('discussion-timer--warning');
      updateDiscussionTimerDisplay();
      showToast('Une minute de discussion supplémentaire a été ajoutée.');
    });
  }
}
