// Missions secrètes d'Hercule : chargées depuis missions.json. [chunk de jeu]

import { normalizeWord, shuffle } from './core.js';

var data = null;
var loading = null;

export function missionsReady() {
  return !!data;
}

export function loadMissions() {
  if (!loading) {
    loading = fetch('missions.json').then(function (res) {
      if (!res.ok) throw new Error('http ' + res.status);
      return res.json();
    }).then(function (d) {
      var missions = Array.isArray(d && d.missions) ? d.missions.filter(function (m) {
        return typeof m === 'string' && m.trim();
      }) : [];
      var words = Array.isArray(d && d.words) ? d.words.filter(function (w) {
        return typeof w === 'string' && w.trim();
      }) : [];
      if (!missions.length) throw new Error('format');
      data = {
        missions: missions,
        words: words
      };
      return data;
    });
    loading.catch(function () {
      loading = null;
    });
  }
  return loading;
}

// Tire une mission au hasard ; le mot imposé (« {mot} ») n'est jamais l'un des mots de la manche.
export function pickMission(avoidWords) {
  if (!data || !data.missions.length) return '';
  var text = shuffle(data.missions.slice())[0];
  if (text.indexOf('{mot}') !== -1 && data.words.length) {
    var avoid = (avoidWords || []).map(normalizeWord);
    var pool = data.words.filter(function (w) {
      return avoid.indexOf(normalizeWord(w)) === -1;
    });
    var word = shuffle((pool.length ? pool : data.words).slice())[0];
    text = text.replace(/\{mot\}/g, word);
  }
  return text;
}