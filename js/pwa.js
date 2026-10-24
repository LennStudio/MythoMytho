// Installation de l'application et service worker (mises à jour).

import { announce, el, showToast } from './core.js';

// ======================================================================
// Installation de l'application
// ======================================================================
var deferredInstallPrompt = null;

function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

function updateInstallBtn() {
  if (!el.installBtn) return;
  el.installBtn.hidden = isStandalone() || !(deferredInstallPrompt || isIos());
}

var swUpdateRequested = false;

function showUpdateToast(worker) {
  if (document.getElementById('updateToast')) return;

  var box = document.createElement('div');
  box.id = 'updateToast';
  box.className = 'update-toast';
  box.setAttribute('role', 'status');

  var text = document.createElement('span');
  text.textContent = 'Nouvelle version disponible.';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'update-toast__btn';
  btn.textContent = 'Recharger';
  btn.addEventListener('click', function () {
    btn.disabled = true;
    swUpdateRequested = true;
    worker.postMessage({ type: 'SKIP_WAITING' });
  });

  box.appendChild(text);
  box.appendChild(btn);
  document.body.appendChild(box);
  announce('Nouvelle version disponible.');
}

export function bootPwa() {
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    updateInstallBtn();
  });

  window.addEventListener('appinstalled', function () {
    deferredInstallPrompt = null;
    updateInstallBtn();
    showToast('Application installée !');
  });

  el.installBtn.addEventListener('click', function () {
    if (deferredInstallPrompt) {
      var promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      promptEvent.prompt();
      promptEvent.userChoice.then(updateInstallBtn).catch(updateInstallBtn);
    } else if (isIos()) {
      showToast('Sur iPhone / iPad : touchez Partager, puis « Sur l\'écran d\'accueil ».', 6000);
    }
  });

  updateInstallBtn();

  if ('serviceWorker' in navigator) {
    var swRefreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      // Pas de rechargement à la 1re installation : uniquement après un clic sur « Recharger ».
      if (!swUpdateRequested || swRefreshing) return;
      swRefreshing = true;
      window.location.reload();
    });

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        // Une mise à jour peut déjà attendre (onglet ouvert depuis longtemps).
        if (reg.waiting && navigator.serviceWorker.controller) {
          showUpdateToast(reg.waiting);
        }

        reg.addEventListener('updatefound', function () {
          var installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', function () {
            // "controller" est nul à la toute première installation : pas de toast dans ce cas.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(installing);
            }
          });
        });

        // Vérifie aussi quand l'app revient au premier plan (PWA rarement rechargée).
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') {
            reg.update().catch(function () {});
          }
        });
      }).catch(function () {});
    });
  }
}
