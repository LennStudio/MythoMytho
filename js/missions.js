import{normalizeWord as e,shuffle as f}from"./core.js";
var n=null,o=null;
export function missionsReady(){return!!n}
export function loadMissions(){return o||(o=fetch("missions.json").then(function(r){if(!r.ok)throw new Error("http "+r.status);return r.json()}).then(function(r){var t=Array.isArray(r&&r.missions)?r.missions.filter(function(i){return typeof i=="string"&&i.trim()}):[],s=Array.isArray(r&&r.words)?r.words.filter(function(i){return typeof i=="string"&&i.trim()}):[];if(!t.length)throw new Error("format");return n={missions:t,words:s},n}),o.catch(function(){o=null})),o}
export function pickMission(r){if(!n||!n.missions.length)return"";var t=f(n.missions.slice())[0];if(t.indexOf("{mot}")!==-1&&n.words.length){var s=(r||[]).map(e),i=n.words.filter(function(u){return s.indexOf(e(u))===-1}),a=f((i.length?i:n.words).slice())[0];t=t.replace(/\{mot\}/g,a)}return t}
