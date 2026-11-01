import { Platform } from 'react-native';

type Recognition = { lang: string; interimResults: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start(): void; stop(): void };
type RecognitionCtor = new () => Recognition;

function ctor(): RecognitionCtor | null {
  if (Platform.OS !== 'web') return null;
  const w = globalThis as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Dictée vocale (navigateur uniquement). Retourne une fonction d'arrêt, ou null si indisponible. */
export const dictationAvailable = (): boolean => ctor() !== null;

export function startDictation(onText: (t: string) => void, onEnd: () => void): (() => void) | null {
  const C = ctor();
  if (!C) return null;
  const rec = new C();
  rec.lang = 'fr-FR'; rec.interimResults = false;
  rec.onresult = (e) => onText(e.results[0]?.[0]?.transcript ?? '');
  rec.onend = onEnd; rec.onerror = onEnd;
  rec.start();
  return () => rec.stop();
}
