// Groupes de joueurs mémorisés.

import { renderBalance } from './balance.js';
import { MAX_PLAYERS, MIN_PLAYERS, clamp, el, normalizeWord, showToast, state } from './core.js';
import { renderNameFields, updateCounter, updateUnderCounter } from './setup.js';

// ======================================================================
// Groupes de joueurs mémorisés
// ======================================================================
var GROUPS_STORAGE_KEY = 'undercover_groups_v1';

var MAX_GROUPS = 20;

var MAX_GROUP_NAME = 24;

function nameKey(str) {
  return normalizeWord(str);
}

function loadGroups() {
  try {
    var raw = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    var out = [];
    parsed.forEach(function (g) {
      if (!g || typeof g.name !== 'string' || !Array.isArray(g.players)) return;
      var name = g.name.replace(/\s+/g, ' ').trim().slice(0, MAX_GROUP_NAME);
      var players = g.players.map(function (p) {
        return String(p == null ? '' : p).replace(/\s+/g, ' ').trim().slice(0, 20);
      }).filter(Boolean);
      if (!name || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) return;
      out.push({
        id: String(g.id || ('g' + out.length + Date.now())),
        name: name,
        players: players
      });
    });
    return out.slice(0, MAX_GROUPS);
  } catch (e) {
    return [];
  }
}

var groups = loadGroups();

function saveGroups() {
  try {
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {}
}

export function readNameInputs() {
  var out = [];
  el.namesGrid.querySelectorAll('input[data-name-input]').forEach(function (input) {
    out.push(input.value.trim());
  });
  return out;
}

function sameNameSet(a, b) {
  if (a.length !== b.length) return false;
  var x = a.map(nameKey).sort();
  var y = b.map(nameKey).sort();
  return x.every(function (v, i) {
    return v === y[i];
  });
}

function matchGroup(names) {
  for (var i = 0; i < groups.length; i++) {
    if (sameNameSet(groups[i].players, names)) return groups[i];
  }
  return null;
}

export function matchGroupName(names) {
  var g = matchGroup(names);
  return g ? g.name : '';
}

export function duplicateNames(names) {
  var seen = {};
  var dups = [];
  names.forEach(function (n) {
    if (!n) return;
    var k = nameKey(n);
    if (!k) return;
    if (seen[k] === 1) dups.push(n);
    seen[k] = (seen[k] || 0) + 1;
  });
  return dups;
}

function renderGroups() {
  if (!el.groupList) return;
  var active = matchGroup(readNameInputs());
  el.groupList.innerHTML = '';
  el.groupEmpty.hidden = groups.length > 0;
  groups.forEach(function (g) {
    var chip = document.createElement('span');
    chip.className = 'group-chip' + (active && active.id === g.id ? ' group-chip--active' : '');

    var load = document.createElement('button');
    load.type = 'button';
    load.className = 'group-chip__load';
    load.title = g.players.join(', ');
    load.textContent = g.name;
    var count = document.createElement('small');
    count.textContent = ' · ' + g.players.length;
    load.appendChild(count);
    load.addEventListener('click', function () {
      loadGroup(g.id);
    });

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'group-chip__del';
    del.setAttribute('aria-label', 'Supprimer le groupe ' + g.name);
    del.textContent = '×';
    del.addEventListener('click', function () {
      if (window.confirm('Supprimer le groupe « ' + g.name + ' » ?')) {
        groups = groups.filter(function (x) {
          return x.id !== g.id;
        });
        saveGroups();
        onNamesChanged();
      }
    });

    chip.appendChild(load);
    chip.appendChild(del);
    el.groupList.appendChild(chip);
  });
  if (el.namesSummary) el.namesSummary.textContent = active ? active.name : 'Optionnel';
}

export function onNamesChanged() {
  renderGroups();
  renderBalance();
}

function loadGroup(id) {
  var g = groups.filter(function (x) {
    return x.id === id;
  })[0];
  if (!g) return;
  state.playerCount = clamp(g.players.length, MIN_PLAYERS, MAX_PLAYERS);
  updateCounter();
  updateUnderCounter();
  renderNameFields();
  el.namesGrid.querySelectorAll('input[data-name-input]').forEach(function (input, i) {
    input.value = g.players[i] || '';
  });
  onNamesChanged();
  showToast('Groupe « ' + g.name + ' » chargé (' + g.players.length + ' joueurs).');
}

function saveGroup() {
  var name = el.groupNameInput.value.replace(/\s+/g, ' ').trim().slice(0, MAX_GROUP_NAME);
  var names = readNameInputs();
  if (!name) {
    showToast('Donnez un nom au groupe avant de l\'enregistrer.');
    el.groupNameInput.focus();
    return;
  }
  if (names.some(function (n) {
      return !n;
    })) {
    showToast('Renseignez le nom des ' + names.length + ' joueurs avant d\'enregistrer le groupe.', 3600);
    return;
  }
  var dups = duplicateNames(names);
  if (dups.length) {
    showToast('Deux joueurs portent le même nom (' + dups[0] + ') : rendez-les uniques.', 3600);
    return;
  }
  var existing = groups.filter(function (g) {
    return nameKey(g.name) === nameKey(name);
  })[0];
  if (existing) {
    existing.name = name;
    existing.players = names;
  } else {
    if (groups.length >= MAX_GROUPS) {
      showToast('Limite de ' + MAX_GROUPS + ' groupes atteinte : supprimez-en un.', 3600);
      return;
    }
    groups.push({
      id: 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
      name: name,
      players: names
    });
  }
  saveGroups();
  el.groupNameInput.value = '';
  onNamesChanged();
  showToast(existing ? ('Groupe « ' + name + ' » mis à jour.') : ('Groupe « ' + name + ' » enregistré.'));
}

export function bootGroups() {
  el.groupSaveBtn.addEventListener('click', saveGroup);

  el.groupNameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveGroup();
    }
  });

  el.namesGrid.addEventListener('input', onNamesChanged);
}
