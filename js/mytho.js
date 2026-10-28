import{announce as i,el as e,state as r}from"./core.js";
import{saveScoreLog as d}from"./journal.js";
export function hideMythoPanel(){e.mythoPanel.hidden=!0,e.mythoDone.hidden=!0,e.mythoDone.textContent="",e.mythoSpotted.hidden=!1,e.mythoPassed.hidden=!1}
export function showMythoQuestion(){var t=r.players.filter(function(n){return n.isMytho})[0];if(!t){hideMythoPanel();return}hideMythoPanel(),e.mythoQuestion.textContent="Le groupe a-t-il repéré le mensonge du Mytho ("+t.name+") ?",e.mythoPanel.hidden=!1,i(e.mythoQuestion.textContent)}
function s(t){var n=-1;r.players.forEach(function(h,a){h.isMytho&&(n=a)});var o=r.lastScoreEntry;o&&o.players&&o.players[n]&&(o.players[n].lie=t?"spotted":"passed",d()),e.mythoSpotted.hidden=!0,e.mythoPassed.hidden=!0,e.mythoDone.textContent=t?"Enregistré : mensonge repéré.":"Enregistré : mensonge réussi, il est passé inaperçu !",e.mythoDone.hidden=!1,i(e.mythoDone.textContent)}
export function bootMytho(){e.mythoSpotted.addEventListener("click",function(){s(!0)}),e.mythoPassed.addEventListener("click",function(){s(!1)})}
