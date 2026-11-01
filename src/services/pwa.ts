import { Platform } from 'react-native';

interface InstallEvent { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; preventDefault(): void }
interface Win {
  addEventListener(name: string, cb: (e: unknown) => void): void;
  removeEventListener(name: string, cb: (e: unknown) => void): void;
}
const win = (): Win | undefined => (Platform.OS === 'web' ? (globalThis as unknown as { window?: Win }).window : undefined);

let deferred: InstallEvent | null = null;

/** Web uniquement : prévient quand le navigateur propose l'installation (ou quand elle n'est plus possible). */
export function watchInstallable(onChange: (installable: boolean) => void): () => void {
  const w = win();
  if (!w) return () => undefined;
  const before = (e: unknown): void => {
    (e as InstallEvent).preventDefault();
    deferred = e as InstallEvent;
    onChange(true);
  };
  const installed = (): void => { deferred = null; onChange(false); };
  w.addEventListener('beforeinstallprompt', before);
  w.addEventListener('appinstalled', installed);
  onChange(deferred !== null);
  return () => { w.removeEventListener('beforeinstallprompt', before); w.removeEventListener('appinstalled', installed); };
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  deferred = null;
  await e.prompt();
  return (await e.userChoice).outcome === 'accepted';
}
