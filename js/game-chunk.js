import{bootGame as o,handleStartClick as t}from"./game.js";
import{bootTimer as r}from"./timer.js";
import{bootCards as m}from"./cards.js";
import{bootVote as i}from"./vote.js";
import{bootWakelock as f}from"./wakelock.js";
import{bootGuess as p}from"./guess.js";
import{bootPicker as e}from"./picker.js";
import{bootQuestions as b}from"./questions.js";
import{loadMissions as s}from"./missions.js";
export{t as handleStartClick};
export function boot(){o(),r(),m(),i(),f(),p(),b(),e(),s().catch(function(){})}
