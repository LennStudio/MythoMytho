import{el as r,state as i}from"./core.js";
var e=null,t=!1;
function a(){return"wakeLock"in window.navigator&&r.gameScreen.classList.contains("screen--active")&&document.visibilityState==="visible"&&(i.phase==="reveal"||i.timerRunning)}
function c(){if(e){var n=e;e=null;try{n.release().catch(function(){})}catch{}}}
export function syncWakeLock(){if("wakeLock"in window.navigator){if(!a()){c();return}e||t||(t=!0,window.navigator.wakeLock.request("screen").then(function(n){t=!1,e=n,n.addEventListener("release",function(){e===n&&(e=null)}),a()||c()}).catch(function(){t=!1}))}}
export function bootWakelock(){document.addEventListener("visibilitychange",syncWakeLock)}
