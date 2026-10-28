import{el as r}from"./core.js";
var a="undercover_theme_v1";
function m(){try{return window.localStorage.getItem(a)}catch{return null}}
function i(e){try{window.localStorage.setItem(a,e)}catch{}}
function n(e){var t=e==="light";t?document.documentElement.setAttribute("data-theme","light"):document.documentElement.removeAttribute("data-theme"),r.themeToggle&&(r.themeToggle.setAttribute("aria-pressed",String(t)),r.themeToggle.setAttribute("aria-label",t?"Passer en mode sombre":"Passer en mode clair"));var o=document.querySelector('meta[name="theme-color"]');o&&o.setAttribute("content",t?"#f1ecdd":"#10161a")}
function l(){var e=m();n(e==="dark"?"dark":"light")}
export function bootTheme(){r.themeToggle&&r.themeToggle.addEventListener("click",function(){var e=document.documentElement.getAttribute("data-theme")==="light",t=e?"dark":"light";n(t),i(t)}),l()}
