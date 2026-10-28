import{DIFFICULTY_LABELS as T,MAX_WORD_LENGTH as v,el as o,normalizeWord as c,pairDifficulty as l,randomInt as _,showToast as f,state as s}from"./core.js";
import{renderSetupRecap as A}from"./setup.js";
var y=[];
export var wordsLoaded=!1;
var k="words.json";
export var CUSTOM_THEME_KEY="perso";
var E="undercover_custom_pairs_v1";
export var MAX_CUSTOM_PAIRS=300;
export function sanitizePair(e){if(!Array.isArray(e)||e.length<2)return null;var t=String(e[0]==null?"":e[0]).replace(/\s+/g," ").trim(),r=String(e[1]==null?"":e[1]).replace(/\s+/g," ").trim();if(!t||!r||t.length>v||r.length>v||c(t)===c(r))return null;var n=parseInt(e[2],10);return[t,r,n===1||n===3?n:2]}
export function pairKey(e){return[c(e[0]),c(e[1])].sort().join("|")}
function b(){try{var e=window.localStorage.getItem(E);if(!e)return[];var t=JSON.parse(e);if(!Array.isArray(t))return[];var r={},n=[];return t.forEach(function(i){var a=sanitizePair(i);if(a){var u=pairKey(a);r[u]||(r[u]=!0,n.push(a))}}),n.slice(0,MAX_CUSTOM_PAIRS)}catch{return[]}}
export var customPairs=b();
export function saveCustomPairs(){try{window.localStorage.setItem(E,JSON.stringify(customPairs))}catch{}}
function w(){return{key:CUSTOM_THEME_KEY,label:"Mes paires",desc:"Vos propres paires de mots, enregistrées sur cet appareil.",pairs:customPairs,custom:!0}}
function p(){return y.concat([w()])}
function I(e){return p().filter(function(t){return t.key===e})[0]}
function L(e){return s.difficulty?e.pairs.filter(function(t){return l(t)===s.difficulty}).length:e.pairs.length}
export function pairId(e,t){return e+"::"+t[0]+"::"+t[1]}
var C="undercover_used_pairs_v1";
function M(){try{var e=window.localStorage.getItem(C);if(!e)return{};var t=JSON.parse(e);return t&&typeof t=="object"?t:{}}catch{return{}}}
export function saveUsedPairs(){try{window.localStorage.setItem(C,JSON.stringify(usedPairsMap))}catch{}}
export var usedPairsMap=M();
export function renderThemeToggles(){o.themesGrid.innerHTML="",p().forEach(function(e){var t=document.createElement("label");t.className="toggle-item";var r=document.createElement("input");r.type="checkbox",r.id="theme-"+e.key,r.checked=!!s.selectedThemes[e.key],r.addEventListener("change",function(){s.selectedThemes[e.key]=r.checked,x()});var n=document.createElement("span"),i=document.createElement("span");i.className="toggle-item__title-row";var a=document.createElement("strong");a.textContent=e.label;var u=document.createElement("span");u.className="toggle-item__count";var h=L(e);u.textContent=h+(h>1?" paires":" paire"),i.appendChild(a),i.appendChild(u);var g=document.createElement("small");g.textContent=e.desc,n.appendChild(i),n.appendChild(g),t.appendChild(r),t.appendChild(n),o.themesGrid.appendChild(t)}),x()}
function x(){if(o.themesSummary){var e=selectedThemeKeys().length;o.themesSummary.textContent=e===0?"Aucun thème sélectionné":e+(e>1?" thèmes sélectionnés":" thème sélectionné")}renderCustomCountHint(),A()}
export function selectedThemeKeys(){return p().filter(function(e){return s.selectedThemes[e.key]}).map(function(e){return e.key})}
function m(e,t){var r=[];return e.forEach(function(n){var i=I(n);i&&i.pairs.forEach(function(a){t&&l(a)!==t||r.push({id:pairId(n,a),key:n,pair:a})})}),r}
export function pickWordPair(){var e=selectedThemeKeys();e.length||(e=["classique"]);var t=m(e,s.difficulty);!t.length&&s.difficulty&&(t=m(e,0),t.length&&f("Aucune paire « "+T[s.difficulty].toLowerCase()+" » dans les thèmes choisis — toutes les difficultés sont utilisées.",3600)),t.length||(t=m(["classique"],0),f("Aucune paire disponible pour cette sélection — le thème Général est utilisé.",3600));var r=t.filter(function(a){return!usedPairsMap[a.id]});r.length||(t.forEach(function(a){delete usedPairsMap[a.id]}),r=t.slice(),f("Toutes les paires des thèmes sélectionnés ont été utilisées — le stock repart à zéro."));var n=r[_(r.length)];usedPairsMap[n.id]=!0,saveUsedPairs();var i=Math.random()<.5;return{civilWord:i?n.pair[0]:n.pair[1],undercoverWord:i?n.pair[1]:n.pair[0],themeKey:n.key,difficulty:l(n.pair)}}
export function renderCustomCountHint(){if(o.customCountHint){var e=customPairs.length;o.customCountHint.textContent=e?e+(e>1?" paires enregistrées":" paire enregistrée"):"Aucune paire enregistrée"}}
var d=!1;
function S(e){o.themesGrid.innerHTML="";var t=document.createElement("div");t.className="themes-status";var r=document.createElement("p");if(r.className="hint-text",e==="loading")r.textContent="Chargement des mots…",t.appendChild(r);else{r.textContent="Impossible de charger les mots. Vérifiez la connexion puis réessayez.";var n=document.createElement("button");n.type="button",n.className="btn btn--ghost btn--small",n.textContent="Réessayer",n.addEventListener("click",loadWords),t.appendChild(r),t.appendChild(n)}o.themesGrid.appendChild(t)}
export function loadWords(){d||(d=!0,S("loading"),fetch(k).then(function(e){if(!e.ok)throw new Error("http "+e.status);return e.json()}).then(function(e){if(!e||!Array.isArray(e.themes))throw new Error("format");var t=[];if(e.themes.forEach(function(r){if(!(!r||typeof r.key!="string"||!Array.isArray(r.pairs))){var n=[];r.pairs.forEach(function(i){!Array.isArray(i)||i.length<2||n.push([String(i[0]),String(i[1]),l(i)])}),n.length&&t.push({key:r.key,label:String(r.label||r.key),desc:String(r.desc||""),pairs:n})}}),!t.length)throw new Error("empty");y=t,wordsLoaded=!0,d=!1,renderThemeToggles()}).catch(function(){d=!1,S("error")}))}
