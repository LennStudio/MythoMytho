// Point d'entrée du chunk de jeu (chargé en arrière-plan ou au clic sur « Lancer »).

import { bootGame, handleStartClick } from './game.js';
import { bootTimer } from './timer.js';
import { bootCards } from './cards.js';
import { bootVote } from './vote.js';
import { bootWakelock } from './wakelock.js';
import { bootGuess } from './guess.js';
import { bootMytho } from './mytho.js';
import { bootOrion } from './orion.js';

// Ce module regroupe tout ce qui sert une fois la partie lancée (cartes, minuteur,
// vote, dernière chance de Mr. White, journal, écran maintenu allumé). Il est chargé
// en arrière-plan quand le navigateur est inactif, ou au clic sur « Lancer ».
export { handleStartClick };

export function boot() {
  bootGame();
  bootTimer();
  bootCards();
  bootVote();
  bootWakelock();
  bootGuess();
  bootMytho();
  bootOrion();
}