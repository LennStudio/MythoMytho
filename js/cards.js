// Cartes secrètes et confidentialité (masquage auto, maintenir pour révéler). [chunk de jeu]

import { ROLE_INFO, announce, el, getPlayer, showToast, state, vibrate } from './core.js';
import { updateProgress } from './game.js';

export var CARD_ICON = '<svg class="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +
  '<circle cx="12" cy="12" r="8.4"/>' +
  '<circle cx="12" cy="12" r="4.6"/>' +
  '<circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/></svg>';

var CHECK_ICON = '<svg class="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
  '<path d="M4 12.5l5 5L20 6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function cardRotation(id) {
  var steps = (id * 37) % 7;
  var deg = (steps - 3) * 1;
  return deg + 'deg';
}

export function renderCards() {
  el.cardsGrid.innerHTML = '';
  state.players.forEach(function (player) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'card' + (player.viewed ? ' card--seen' : '');
    card.style.setProperty('--rot', player.viewed ? '0deg' : cardRotation(player.id));
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-id', player.id);

    if (player.viewed) {
      card.disabled = true;
      card.setAttribute('aria-label', player.name + ', carte déjà consultée');
    } else {
      card.setAttribute('aria-label', 'Carte de ' + player.name + ', appuyer pour révéler le mot');
    }

    var indexEl = document.createElement('span');
    indexEl.className = 'card__index';
    indexEl.textContent = '#' + (player.id + 1);

    var iconWrap = document.createElement('span');
    iconWrap.innerHTML = player.viewed ? CHECK_ICON : CARD_ICON;

    var nameEl = document.createElement('span');
    nameEl.className = 'card__name';
    nameEl.textContent = player.viewed ? 'Vu' : player.name;

    card.appendChild(indexEl);
    card.appendChild(iconWrap);
    card.appendChild(nameEl);

    if (!player.viewed) {
      card.addEventListener('click', function () {
        openCard(player.id);
      });
    }

    el.cardsGrid.appendChild(card);
  });
}

function openCard(id) {
  var player = getPlayer(id);
  if (!player || player.viewed) return;

  vibrate(12);

  state.openCardId = id;
  el.modalOwner.textContent = 'Carte de ' + player.name;

  if (player.isMrWhite) {
    el.modalRole.textContent = 'Tu es Mr. White — improvise, tu n\'as pas de mot !';
    el.modalWord.textContent = 'Aucun mot';
  } else if (player.isEspion) {
    el.modalRole.textContent = 'Tu es l\'Espion — tu n\'as pas de mot, mais un indice t\'attend ci-dessous';
    el.modalWord.textContent = 'Aucun mot';
  } else if (player.isUndercover) {
    el.modalRole.textContent = 'Tu es l\'Undercover — fonds-toi dans la masse';
    el.modalWord.textContent = player.word;
  } else {
    el.modalRole.textContent = 'Tu es Civil — retrouve l\'imposteur';
    el.modalWord.textContent = player.word;
  }

  renderModalBadges(player);
  beginCardPrivacy();

  el.wordModal.classList.add('modal--open');
  el.wordModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  focusCardModal();
  announce(state.privacy === 'hold' ?
    ('Carte de ' + player.name + '. Maintenez le bouton pour révéler le mot.') :
    ('Mot révélé pour ' + player.name));
}

function renderModalBadges(player) {
  el.modalBadges.innerHTML = '';
  var badges = [];
  if (player.isMrWhite && state.mrWhiteGuess) {
    badges.push({
      label: 'Dernière chance',
      desc: 'Si tu es éliminé, tu pourras tenter de deviner le mot des Civils : si tu le trouves, tu gagnes seul(e).'
    });
  }
  if (player.isEspion) {
    badges.push({
      label: 'Indice d\'Espion',
      desc: 'Le mot des Civils commence par la lettre « ' + state.civilWordHint + ' ».'
    });
  }
  if (player.isIdiot) badges.push(ROLE_INFO.idiot);
  if (player.isFantome) badges.push(ROLE_INFO.fantome);
  if (player.isMime) badges.push(ROLE_INFO.mime);
  if (player.isProcureur) badges.push(ROLE_INFO.procureur);
  if (player.loverId !== null) {
    var lover = getPlayer(player.loverId);
    if (lover) {
      badges.push({
        label: 'Amoureux de ' + lover.name,
        desc: 'Si l\'un de vous deux est éliminé, l\'autre l\'est aussi. Peu importe vos camps respectifs, vous devez être les deux derniers survivants pour gagner ensemble.'
      });
    }
  }
  badges.forEach(function (b) {
    var div = document.createElement('div');
    div.className = 'modal__badge';
    var strong = document.createElement('strong');
    strong.textContent = b.label;
    var span = document.createElement('span');
    span.textContent = b.desc;
    div.appendChild(strong);
    div.appendChild(span);
    el.modalBadges.appendChild(div);
  });
}

function hideOpenCard() {
  if (state.openCardId === null) return;
  endCardPrivacy();
  var player = state.players.filter(function (p) {
    return p.id === state.openCardId;
  })[0];
  if (player) player.viewed = true;

  vibrate(12);

  el.wordModal.classList.remove('modal--open');
  el.wordModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  state.openCardId = null;

  renderCards();
  updateProgress();

  if (player) {
    var total = state.players.length;
    var viewed = state.players.filter(function (p) {
      return p.viewed;
    }).length;
    announce(player.name + ' a caché sa carte. ' + viewed + ' sur ' + total + ' consultées.');
    if (viewed === total) {
      showToast('Toutes les cartes ont été vues. Place à la discussion !');
    }
  }
}

// ======================================================================
// Confidentialité des cartes : masquage auto / maintenir pour révéler
// ======================================================================
var autoHideTimer = null;

function setCardMasked(masked) {
  el.wordModal.classList.toggle('modal--masked', masked);
}

function clearAutoHide() {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
  if (el.autoHideBar) el.autoHideBar.hidden = true;
}

function armAutoHide() {
  clearAutoHide();
  var fill = el.autoHideBar.firstElementChild;
  el.autoHideBar.hidden = false;
  fill.style.transition = 'none';
  fill.style.width = '100%';
  void fill.offsetWidth;
  fill.style.transition = 'width ' + state.autoHideSec + 's linear';
  fill.style.width = '0%';
  autoHideTimer = setTimeout(function () {
    autoHideTimer = null;
    el.autoHideBar.hidden = true;
    setCardMasked(true);
    el.revealBtn.textContent = 'Réafficher le mot';
    el.revealRow.hidden = false;
    announce('Mot masqué.');
  }, state.autoHideSec * 1000);
}

function beginCardPrivacy() {
  clearAutoHide();
  setCardMasked(false);
  el.revealRow.hidden = true;
  el.hideWordBtn.disabled = false;
  if (state.privacy === 'auto') {
    armAutoHide();
  } else if (state.privacy === 'hold') {
    setCardMasked(true);
    el.revealBtn.textContent = 'Maintenir pour révéler';
    el.revealRow.hidden = false;
    // Impossible de passer au suivant sans avoir vu son mot au moins une fois.
    el.hideWordBtn.disabled = true;
  }
}

function endCardPrivacy() {
  clearAutoHide();
  setCardMasked(false);
  el.revealRow.hidden = true;
  el.hideWordBtn.disabled = false;
}

function holdReveal(on) {
  if (state.privacy !== 'hold' || state.openCardId === null) return;
  setCardMasked(!on);
  if (on) el.hideWordBtn.disabled = false;
}

function focusCardModal() {
  if (state.privacy === 'hold') el.revealBtn.focus();
  else el.hideWordBtn.focus();
}

export function bootCards() {
  el.hideWordBtn.addEventListener('click', hideOpenCard);

  el.revealBtn.addEventListener('pointerdown', function (e) {
    if (state.privacy !== 'hold') return;
    e.preventDefault();
    try {
      el.revealBtn.setPointerCapture(e.pointerId);
    } catch (err) {}
    holdReveal(true);
  });

  ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach(function (evt) {
    el.revealBtn.addEventListener(evt, function () {
      holdReveal(false);
    });
  });

  el.revealBtn.addEventListener('keydown', function (e) {
    if (state.privacy === 'hold' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      holdReveal(true);
    }
  });

  el.revealBtn.addEventListener('keyup', function (e) {
    if (state.privacy === 'hold' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      holdReveal(false);
    }
  });

  el.revealBtn.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  el.revealBtn.addEventListener('click', function () {
    if (state.privacy !== 'auto') return;
    setCardMasked(false);
    el.revealRow.hidden = true;
    armAutoHide();
  });
}
