import { Vibration } from 'react-native';
import { createAudioPlayer } from 'expo-audio';

export const buzz = (pattern: number | number[] = 40): void => {
  try { Vibration.vibrate(pattern); } catch { /* non supporté */ }
};

let player: ReturnType<typeof createAudioPlayer> | null = null;
/** Triple bip de fin de minuteur (fichier généré, embarqué dans l'application). */
export function playTimerEnd(): void {
  try {
    player ??= createAudioPlayer(require('../../assets/sounds/timer-end.wav') as number);
    void player.seekTo(0);
    player.play();
  } catch { /* audio indisponible */ }
}
