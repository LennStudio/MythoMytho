import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TAG = 'mythomytho-game';
let active = false;

/**
 * Maintient l'écran allumé (ou relâche le verrou). L'état est mémorisé ici : `expo-keep-awake` LÈVE une erreur
 * si l'on désactive un verrou qui n'est pas actif (ex. double désactivation au changement de phase), et certains
 * navigateurs n'offrent pas l'API Wake Lock. Dans tous les cas, ce n'est jamais bloquant pour la partie.
 */
export async function setKeepAwake(on: boolean): Promise<void> {
  try {
    if (on && !active) {
      active = true;
      await activateKeepAwakeAsync(TAG);
    } else if (!on && active) {
      active = false;
      await deactivateKeepAwake(TAG);
    }
  } catch {
    /* Wake Lock indisponible ou déjà relâché : sans importance */
  }
}
