// Thème clair / sombre.

import { el } from './core.js';

var THEME_STORAGE_KEY = 'undercover_theme_v1';

function loadTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {}
}

function applyTheme(theme) {
  var isLight = theme === 'light';
  if (isLight) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  if (el.themeToggle) {
    el.themeToggle.setAttribute('aria-pressed', String(isLight));
    el.themeToggle.setAttribute('aria-label', isLight ? 'Passer en mode sombre' : 'Passer en mode clair');
  }
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isLight ? '#f1ecdd' : '#10161a');
  }
}

function initTheme() {
  var saved = loadTheme();
  applyTheme(saved === 'dark' ? 'dark' : 'light');
}

export function bootTheme() {
  if (el.themeToggle) {
    el.themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      applyTheme(next);
      saveTheme(next);
    });
  }

  initTheme();
}
