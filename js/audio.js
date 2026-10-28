import{state as s}from"./core.js";
var e=null;
function a(){try{var t=window.AudioContext||window.webkitAudioContext;if(!t)return;e||(e=new t),e.state==="suspended"&&e.resume()}catch{}}
function r(t,u,c,d){var n=e.currentTime+u,i=e.createOscillator(),o=e.createGain();i.type="sine",i.frequency.value=t,o.gain.setValueAtTime(1e-4,n),o.gain.exponentialRampToValueAtTime(d,n+.02),o.gain.exponentialRampToValueAtTime(1e-4,n+c),i.connect(o),o.connect(e.destination),i.start(n),i.stop(n+c+.05)}
export function playTimerEnd(){if(!(!s.timerSound||!e||e.state!=="running"))try{r(880,0,.16,.22),r(880,.24,.16,.22),r(1175,.48,.45,.25)}catch{}}
export function previewSound(){if(a(),!(!e||e.state!=="running"))try{r(880,0,.14,.18)}catch{}}
export function bootAudio(){document.addEventListener("pointerdown",a,{passive:!0}),document.addEventListener("keydown",a)}
