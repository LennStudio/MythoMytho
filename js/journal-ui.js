// Fenêtre du journal : classement, statistiques et exports. [chargé à la première ouverture]

import { DIFFICULTY_LABELS, ROLE_NAMES, downloadFile, el, showToast, todayStamp } from './core.js';
import { saveScoreLog, scoreLog } from './journal.js';

// Statistiques calculées sur les manches qui détaillent leurs joueurs (les anciennes
// entrées du journal ne contiennent que les vainqueurs et restent comptées dans le classement).
function computeStats(list) {
  var byPlayer = {};
  var byRole = {};
  var lies = {};
  var missions = {};
  var tracked = 0;
  (list || scoreLog).slice().reverse().forEach(function (entry) {
    if (!Array.isArray(entry.players) || !entry.players.length) return;
    tracked += 1;
    entry.players.forEach(function (p) {
      var s = byPlayer[p.name] || (byPlayer[p.name] = {
        games: 0,
        wins: 0,
        streak: 0,
        best: 0
      });
      s.games += 1;
      if (p.won) {
        s.wins += 1;
        s.streak += 1;
        if (s.streak > s.best) s.best = s.streak;
      } else {
        s.streak = 0;
      }
      var r = byRole[p.role] || (byRole[p.role] = {
        games: 0,
        wins: 0
      });
      r.games += 1;
      if (p.won) r.wins += 1;
      // Mensonges du Mytho (seulement ceux dont le résultat a été renseigné)
      if (p.lie === 'spotted' || p.lie === 'passed') {
        var l = lies[p.name] || (lies[p.name] = {
          games: 0,
          passed: 0
        });
        l.games += 1;
        if (p.lie === 'passed') l.passed += 1;
      }
      // Missions d'Hercule (seulement celles dont le résultat a été renseigné)
      if (p.mission === 'success' || p.mission === 'fail') {
        var m = missions[p.name] || (missions[p.name] = {
          games: 0,
          success: 0
        });
        m.games += 1;
        if (p.mission === 'success') m.success += 1;
      }
    });
  });
  return {
    byPlayer: byPlayer,
    byRole: byRole,
    lies: lies,
    missions: missions,
    tracked: tracked
  };
}

function percent(wins, games) {
  return games ? Math.round(wins / games * 100) : 0;
}

function renderScoreModal() {
  refreshScoreFilter();
  var hasEntries = scoreLog.length > 0;
  if (el.scoreEmptyState) el.scoreEmptyState.style.display = hasEntries ? 'none' : '';
  if (el.scoreContent) el.scoreContent.style.display = hasEntries ? '' : 'none';
  if (el.scoreExportRow) el.scoreExportRow.style.display = hasEntries ? '' : 'none';
  if (!hasEntries) return;

  var entries = filteredScoreEntries();
  var stats = computeStats(entries);

  var tally = {};
  entries.forEach(function (entry) {
    (entry.winnerNames || []).forEach(function (name) {
      tally[name] = (tally[name] || 0) + 1;
    });
  });
  var leaderboard = Object.keys(tally).map(function (name) {
    return {
      name: name,
      wins: tally[name],
      stat: stats.byPlayer[name] || null
    };
  }).sort(function (a, b) {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.stat ? percent(b.stat.wins, b.stat.games) : 0) - (a.stat ? percent(a.stat.wins, a.stat.games) : 0);
  });

  el.scoreLeaderboard.innerHTML = '';
  leaderboard.forEach(function (entry) {
    var li = document.createElement('li');
    var nameSpan = document.createElement('strong');
    nameSpan.textContent = entry.name;
    var countSpan = document.createElement('span');
    countSpan.className = 'score-leaderboard__count';
    countSpan.textContent = entry.wins + (entry.wins > 1 ? ' victoires' : ' victoire');
    li.appendChild(nameSpan);
    li.appendChild(countSpan);

    if (entry.stat) {
      var meta = document.createElement('span');
      meta.className = 'score-leaderboard__meta';
      var parts = [entry.stat.wins + '/' + entry.stat.games + ' manches · ' + percent(entry.stat.wins, entry.stat.games) + ' %'];
      if (entry.stat.streak > 1) parts.push('série en cours : ' + entry.stat.streak);
      if (entry.stat.best > 1) parts.push('record : ' + entry.stat.best);
      meta.textContent = parts.join(' · ');
      li.appendChild(meta);
    }
    el.scoreLeaderboard.appendChild(li);
  });

  var hasStats = stats.tracked > 0;
  el.scoreRolesTitle.style.display = hasStats ? '' : 'none';
  el.scoreRoles.style.display = hasStats ? '' : 'none';
  el.scoreNote.style.display = (hasStats && stats.tracked < entries.length) ? '' : 'none';

  // Mensonges du Mytho : réussis = passés inaperçus
  var liars = Object.keys(stats.lies).sort(function (a, b) {
    return percent(stats.lies[b].passed, stats.lies[b].games) - percent(stats.lies[a].passed, stats.lies[a].games);
  });
  el.scoreLiesTitle.style.display = liars.length ? '' : 'none';
  el.scoreLies.style.display = liars.length ? '' : 'none';
  el.scoreLies.innerHTML = '';
  liars.forEach(function (name) {
    var l = stats.lies[name];
    var li = document.createElement('li');
    var label = document.createElement('strong');
    label.textContent = name;
    var value = document.createElement('span');
    value.className = 'score-leaderboard__count';
    value.textContent = l.passed + '/' + l.games + ' réussis · ' + percent(l.passed, l.games) + ' %';
    li.appendChild(label);
    li.appendChild(value);
    el.scoreLies.appendChild(li);
  });

  // Missions d'Hercule : réussies = accomplies
  var heroes = Object.keys(stats.missions).sort(function (a, b) {
    return percent(stats.missions[b].success, stats.missions[b].games) - percent(stats.missions[a].success, stats.missions[a].games);
  });
  el.scoreMissionsTitle.style.display = heroes.length ? '' : 'none';
  el.scoreMissions.style.display = heroes.length ? '' : 'none';
  el.scoreMissions.innerHTML = '';
  heroes.forEach(function (name) {
    var m = stats.missions[name];
    var li = document.createElement('li');
    var label = document.createElement('strong');
    label.textContent = name;
    var value = document.createElement('span');
    value.className = 'score-leaderboard__count';
    value.textContent = m.success + '/' + m.games + ' réussies · ' + percent(m.success, m.games) + ' %';
    li.appendChild(label);
    li.appendChild(value);
    el.scoreMissions.appendChild(li);
  });
  el.scoreRoles.innerHTML = '';
  ['civil', 'undercover', 'mrwhite', 'espion', 'fauxfrere', 'judas'].forEach(function (role) {
    var r = stats.byRole[role];
    if (!r) return;
    var li = document.createElement('li');
    var label = document.createElement('strong');
    label.textContent = ROLE_NAMES[role];
    var value = document.createElement('span');
    value.className = 'score-leaderboard__count';
    value.textContent = r.wins + '/' + r.games + ' · ' + percent(r.wins, r.games) + ' %';
    li.appendChild(label);
    li.appendChild(value);
    el.scoreRoles.appendChild(li);
  });

  el.scoreHistory.innerHTML = '';
  entries.forEach(function (entry) {
    var li = document.createElement('li');
    var labelSpan = document.createElement('strong');
    labelSpan.className = 'score-history__label';
    labelSpan.textContent = entry.winnerLabel;
    var roundSpan = document.createElement('span');
    roundSpan.className = 'score-history__round';
    roundSpan.textContent = 'Manche ' + entry.round + ' · ' + entry.playerCount + ' joueurs';
    li.appendChild(labelSpan);
    li.appendChild(roundSpan);
    el.scoreHistory.appendChild(li);
  });
}

function exportScoreJson() {
  var stats = computeStats();
  var payload = {
    app: 'mythomytho',
    kind: 'score-log',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: scoreLog,
    stats: {
      players: Object.keys(stats.byPlayer).map(function (name) {
        var s = stats.byPlayer[name];
        return {
          name: name,
          games: s.games,
          wins: s.wins,
          winRate: percent(s.wins, s.games),
          currentStreak: s.streak,
          bestStreak: s.best
        };
      }),
      roles: Object.keys(stats.byRole).map(function (role) {
        var r = stats.byRole[role];
        return {
          role: role,
          games: r.games,
          wins: r.wins,
          winRate: percent(r.wins, r.games)
        };
      }),
      missions: Object.keys(stats.missions).map(function (name) {
        var m = stats.missions[name];
        return {
          name: name,
          games: m.games,
          successful: m.success,
          successRate: percent(m.success, m.games)
        };
      }),
      lies: Object.keys(stats.lies).map(function (name) {
        var l = stats.lies[name];
        return {
          name: name,
          games: l.games,
          successful: l.passed,
          successRate: percent(l.passed, l.games)
        };
      })
    }
  };
  downloadFile('mythomytho-journal-' + todayStamp() + '.json', 'application/json', JSON.stringify(payload, null, 2));
  showToast('Journal exporté en JSON.');
}

function csvCell(value) {
  var s = String(value == null ? '' : value);
  if (/[;"\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function exportScoreCsv() {
  var rows = [
    ['date', 'manche', 'nb_joueurs', 'vainqueur', 'groupe', 'joueur', 'role', 'roles_speciaux', 'victoire', 'elimine', 'difficulte_paire', 'theme', 'mensonge', 'mission']
  ];
  scoreLog.slice().reverse().forEach(function (e) {
    var base = [e.date || '', e.round, e.playerCount, e.winnerLabel, e.group || ''];
    var diff = e.pairDifficulty ? DIFFICULTY_LABELS[e.pairDifficulty] : '';
    var theme = e.theme || '';
    if (Array.isArray(e.players) && e.players.length) {
      e.players.forEach(function (p) {
        rows.push(base.concat([p.name, ROLE_NAMES[p.role] || p.role, (p.specials || []).join(' + '),
          p.won ? 'oui' : 'non', p.eliminated ? 'oui' : 'non', diff, theme,
          p.lie === 'passed' ? 'réussi' : (p.lie === 'spotted' ? 'repéré' : ''),
          p.mission === 'success' ? 'accomplie' : (p.mission === 'fail' ? 'ratée' : '')
        ]));
      });
    } else {
      // Ancienne entrée : seuls les vainqueurs ont été conservés.
      rows.push(base.concat([(e.winnerNames || []).join(', '), '', '', 'oui', '', diff, theme, '', '']));
    }
  });
  var text = '\ufeff' + rows.map(function (r) {
    return r.map(csvCell).join(';');
  }).join('\r\n');
  downloadFile('mythomytho-journal-' + todayStamp() + '.csv', 'text/csv', text);
  showToast('Journal exporté en CSV.');
}

export function openScoreModal() {
  renderScoreModal();
  el.scoreModal.classList.add('modal--open');
  el.scoreModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  el.closeScoreBtn.focus();
}

function closeScoreModal() {
  el.scoreModal.classList.remove('modal--open');
  el.scoreModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Filtre du journal par groupe
var scoreGroupFilter = 'all';

function refreshScoreFilter() {
  var names = {};
  scoreLog.forEach(function (e) {
    if (e.group) names[e.group] = true;
  });
  var list = Object.keys(names).sort();
  el.scoreFilterRow.hidden = list.length === 0;
  if (scoreGroupFilter !== 'all' && scoreGroupFilter !== '__none' && !names[scoreGroupFilter]) scoreGroupFilter = 'all';
  el.scoreGroupFilter.innerHTML = '';
  var opts = [
    ['all', 'Tous les groupes']
  ];
  list.forEach(function (n) {
    opts.push([n, n]);
  });
  opts.push(['__none', 'Sans groupe']);
  opts.forEach(function (o) {
    var opt = document.createElement('option');
    opt.value = o[0];
    opt.textContent = o[1];
    el.scoreGroupFilter.appendChild(opt);
  });
  el.scoreGroupFilter.value = scoreGroupFilter;
}

function filteredScoreEntries() {
  if (scoreGroupFilter === 'all') return scoreLog;
  return scoreLog.filter(function (e) {
    return scoreGroupFilter === '__none' ? !e.group : e.group === scoreGroupFilter;
  });
}

export function bootJournalUi() {
  if (el.closeScoreBtn) el.closeScoreBtn.addEventListener('click', closeScoreModal);

  if (el.scoreScrim) el.scoreScrim.addEventListener('click', closeScoreModal);

  if (el.scoreResetBtn) {
    el.scoreResetBtn.addEventListener('click', function () {
      scoreLog.length = 0;
      saveScoreLog();
      renderScoreModal();
      showToast('Le journal des scores a été réinitialisé.');
    });
  }

  // ======================================================================
  // Export du journal
  // ======================================================================
  if (el.scoreExportJson) el.scoreExportJson.addEventListener('click', exportScoreJson);

  if (el.scoreExportCsv) el.scoreExportCsv.addEventListener('click', exportScoreCsv);

  el.scoreGroupFilter.addEventListener('change', function () {
    scoreGroupFilter = el.scoreGroupFilter.value;
    renderScoreModal();
  });
}

export { bootJournalUi as boot };