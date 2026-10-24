// Fenêtre « Mes paires » : saisie, import / export, partage. [chargé à la première ouverture]

import { DIFFICULTY_LABELS, MAX_WORD_LENGTH, downloadFile, el, pairDifficulty, showToast, state, todayStamp } from './core.js';
import { CUSTOM_THEME_KEY, MAX_CUSTOM_PAIRS, customPairs, pairId, pairKey, renderThemeToggles, sanitizePair, saveCustomPairs, saveUsedPairs, usedPairsMap } from './themes.js';

// ======================================================================
// « Mes paires » : saisie, import / export, partage par lien
// ======================================================================
var pendingImport = null;

function toBase64Url(str) {
  var bytes = new TextEncoder().encode(str);
  var bin = '';
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return window.btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  var s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  var bin = window.atob(s);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function buildShareUrl() {
  var json = JSON.stringify(customPairs);
  return window.location.origin + window.location.pathname + '#paires=' + toBase64Url(json);
}

export function decodeShared(encoded) {
  try {
    var arr = JSON.parse(fromBase64Url(encoded));
    if (!Array.isArray(arr)) return null;
    return arr.map(sanitizePair).filter(Boolean).slice(0, MAX_CUSTOM_PAIRS);
  } catch (e) {
    return null;
  }
}

function mergeCustomPairs(list) {
  var seen = {};
  customPairs.forEach(function (p) {
    seen[pairKey(p)] = true;
  });
  var added = 0;
  var skipped = 0;
  list.forEach(function (raw) {
    var p = sanitizePair(raw);
    if (!p) {
      skipped += 1;
      return;
    }
    var k = pairKey(p);
    if (seen[k] || customPairs.length >= MAX_CUSTOM_PAIRS) {
      skipped += 1;
      return;
    }
    seen[k] = true;
    customPairs.push(p);
    added += 1;
  });
  if (added) saveCustomPairs();
  return {
    added: added,
    skipped: skipped
  };
}

function afterCustomChange() {
  renderCustomModal();
  renderThemeToggles();
}

function renderCustomModal() {
  var n = customPairs.length;
  el.customCount.textContent = n + (n > 1 ? ' paires' : ' paire') + ' (max. ' + MAX_CUSTOM_PAIRS + ')';
  el.customEmpty.style.display = n ? 'none' : '';
  el.customList.style.display = n ? '' : 'none';
  el.customExportBtn.disabled = !n;
  el.customShareBtn.disabled = !n;
  el.customList.innerHTML = '';
  customPairs.forEach(function (pair, index) {
    var li = document.createElement('li');
    var words = document.createElement('span');
    words.className = 'custom-list__words';
    words.textContent = pair[0] + ' / ' + pair[1];
    var badge = document.createElement('span');
    badge.className = 'custom-list__diff custom-list__diff--' + pairDifficulty(pair);
    badge.textContent = DIFFICULTY_LABELS[pairDifficulty(pair)];
    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'custom-list__del';
    del.setAttribute('aria-label', 'Supprimer la paire ' + pair[0] + ' / ' + pair[1]);
    del.textContent = '×';
    del.addEventListener('click', function () {
      var removed = customPairs.splice(index, 1)[0];
      delete usedPairsMap[pairId(CUSTOM_THEME_KEY, removed)];
      saveUsedPairs();
      saveCustomPairs();
      afterCustomChange();
    });
    li.appendChild(words);
    li.appendChild(badge);
    li.appendChild(del);
    el.customList.appendChild(li);
  });
}

function showImportBanner() {
  if (pendingImport && pendingImport.length) {
    var n = pendingImport.length;
    el.customImportText.textContent = 'Un lien de partage contient ' + n + (n > 1 ? ' paires' : ' paire') + '. Les ajouter à « Mes paires » ?';
    el.customImportBanner.hidden = false;
  } else {
    el.customImportBanner.hidden = true;
  }
}

export function openCustomModal(sharedList) {
  if (sharedList) pendingImport = sharedList;
  renderCustomModal();
  showImportBanner();
  el.customModal.classList.add('modal--open');
  el.customModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  el.customWordA.focus();
}

function closeCustomModal() {
  el.customModal.classList.remove('modal--open');
  el.customModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  pendingImport = null;
}

function addCustomPair() {
  var pair = sanitizePair([el.customWordA.value, el.customWordB.value, el.customDifficulty.value]);
  if (!pair) {
    showToast('Saisissez deux mots différents (' + MAX_WORD_LENGTH + ' caractères maximum chacun).');
    return;
  }
  var res = mergeCustomPairs([pair]);
  if (!res.added) {
    showToast(customPairs.length >= MAX_CUSTOM_PAIRS ? 'Limite de ' + MAX_CUSTOM_PAIRS + ' paires atteinte.' : 'Cette paire existe déjà.');
    return;
  }
  el.customWordA.value = '';
  el.customWordB.value = '';
  el.customWordA.focus();
  afterCustomChange();
  showToast(state.selectedThemes[CUSTOM_THEME_KEY] ?
    'Paire ajoutée.' : 'Paire ajoutée — cochez « Mes paires » dans les thèmes pour l\'utiliser.', 3600);
}

function reportImport(res) {
  var msg = res.added + (res.added > 1 ? ' paires ajoutées' : ' paire ajoutée');
  if (res.skipped) msg += ' · ' + res.skipped + ' ignorée' + (res.skipped > 1 ? 's' : '') + ' (doublon ou invalide)';
  showToast(msg + '.', 3600);
}

export function bootCustomUi() {
  el.customCloseBtn.addEventListener('click', closeCustomModal);

  el.customScrim.addEventListener('click', closeCustomModal);

  el.customAddBtn.addEventListener('click', addCustomPair);

  [el.customWordA, el.customWordB].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomPair();
      }
    });
  });

  el.customExportBtn.addEventListener('click', function () {
    downloadFile('mythomytho-mes-paires-' + todayStamp() + '.json', 'application/json', JSON.stringify({
      app: 'mythomytho',
      kind: 'custom-pairs',
      version: 1,
      pairs: customPairs
    }, null, 2));
    showToast('Paires exportées.');
  });

  el.customImportBtn.addEventListener('click', function () {
    el.customImportFile.click();
  });

  el.customImportFile.addEventListener('change', function () {
    var file = el.customImportFile.files && el.customImportFile.files[0];
    el.customImportFile.value = '';
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var list = Array.isArray(data) ? data : (data && Array.isArray(data.pairs) ? data.pairs : null);
        if (!list) throw new Error('format');
        reportImport(mergeCustomPairs(list));
        afterCustomChange();
      } catch (e) {
        showToast('Fichier non reconnu : choisissez un export JSON de « Mes paires ».');
      }
    };
    reader.onerror = function () {
      showToast('Lecture du fichier impossible.');
    };
    reader.readAsText(file);
  });

  el.customShareBtn.addEventListener('click', function () {
    if (!customPairs.length) return;
    var url = buildShareUrl();
    if (window.navigator.share) {
      window.navigator.share({
        title: 'MythoMytho — mes paires',
        text: 'Mes paires de mots pour MythoMytho',
        url: url
      }).catch(function () {});
      return;
    }
    if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
      window.navigator.clipboard.writeText(url).then(function () {
        showToast('Lien de partage copié dans le presse-papiers.');
      }).catch(function () {
        window.prompt('Copiez ce lien de partage :', url);
      });
    } else {
      window.prompt('Copiez ce lien de partage :', url);
    }
  });

  el.customImportConfirm.addEventListener('click', function () {
    if (pendingImport) {
      reportImport(mergeCustomPairs(pendingImport));
      pendingImport = null;
      showImportBanner();
      afterCustomChange();
    }
  });

  el.customImportDismiss.addEventListener('click', function () {
    pendingImport = null;
    showImportBanner();
  });
}

export { bootCustomUi as boot };