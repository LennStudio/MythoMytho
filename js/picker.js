// Choix d'une cible parmi les joueurs encore en vie : tir d'Orion, révélation de Prométhée. [chunk de jeu]

import { announce, el } from './core.js';

var selectedId = null;
var onChosen = null;

function closePicker() {
  el.pickerModal.classList.remove('modal--open');
  el.pickerModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// cfg : { stamp, title, intro, say } — textes de la fenêtre ; callback(idDeLaCible)
export function openPicker(cfg, targets, callback) {
  onChosen = callback;
  selectedId = null;
  el.pickerStamp.textContent = cfg.stamp;
  el.pickerTitle.textContent = cfg.title;
  el.pickerIntro.textContent = cfg.intro;
  el.pickerConfirmBtn.disabled = true;
  el.pickerList.innerHTML = '';

  targets.forEach(function (p) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'picker-target';
    btn.textContent = p.name;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      selectedId = p.id;
      el.pickerList.querySelectorAll('.picker-target').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('picker-target--selected', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      el.pickerConfirmBtn.disabled = false;
    });
    el.pickerList.appendChild(btn);
  });

  el.pickerModal.classList.add('modal--open');
  el.pickerModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  var first = el.pickerList.querySelector('.picker-target');
  if (first) first.focus();
  announce(cfg.say || cfg.intro);
}

export function bootPicker() {
  el.pickerConfirmBtn.addEventListener('click', function () {
    if (selectedId === null) return;
    var callback = onChosen;
    var id = selectedId;
    selectedId = null;
    onChosen = null;
    closePicker();
    if (callback) callback(id);
  });
}