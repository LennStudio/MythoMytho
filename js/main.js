import{bootAudio as h}from"./audio.js";
import{bootBalance as m}from"./balance.js";
import{el as t,showToast as p}from"./core.js";
import{bootGroups as w}from"./groups.js";
import{initOptionsUI as g,loadOptions as b}from"./options.js";
import{bootPwa as k}from"./pwa.js";
import{bootSetup as C,renderNameFields as v,renderSetupRecap as L,updateCounter as B,updateUnderCounter as S}from"./setup.js";
import{bootTheme as y}from"./theme.js";
import{loadWords as G}from"./themes.js";
var i={};
function u(o,n){return i[o]||(i[o]=n().then(function(e){return e.boot(),e}),i[o].catch(function(){i[o]=null})),i[o]}
function s(){return u("game",function(){return import("./game-chunk.js")})}
function M(){return u("journal",function(){return import("./journal-ui.js")})}
function f(){return u("custom",function(){return import("./custom-ui.js")})}
function c(){p("Chargement impossible : vérifiez la connexion puis réessayez.",3600)}
function l(){M().then(function(o){o.openScoreModal()}).catch(c)}
function _(){f().then(function(o){o.openCustomModal()}).catch(c)}
function I(o){"requestIdleCallback"in window?window.requestIdleCallback(o,{timeout:2500}):setTimeout(o,800)}
function T(){var o=null;try{o=new URLSearchParams(window.location.search).get("action")}catch{}var n=window.location.hash||"",e=n.indexOf("#paires=")===0?n.slice(8):"";if(o||n)try{window.history.replaceState(null,"",window.location.pathname)}catch{}function d(){o==="scores"?l():o==="new"&&(t.startBtn.scrollIntoView({block:"center"}),t.startBtn.focus())}e?f().then(function(r){var a=r.decodeShared(e);a&&a.length?r.openCustomModal(a):d()}).catch(c):d()}
b(),y(),C(),h(),w(),m(),k(),t.startBtn.addEventListener("click",function(){s().then(function(o){o.handleStartClick()}).catch(c)}),t.scoreLogToggle&&t.scoreLogToggle.addEventListener("click",l),t.scoreLogBtnGame&&t.scoreLogBtnGame.addEventListener("click",l),t.customManageBtn.addEventListener("click",_),B(),S(),v(),L(),g(),G(),T(),I(function(){s().catch(function(){})}),window.__mythoBooted=!0,window.__mythoGuard&&window.__mythoGuard.ok();
