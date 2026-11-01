import { Platform, Share } from 'react-native';

/**
 * Export : téléchargement d'un fichier sur le web, feuille de partage native sinon.
 * Import : sélecteur de fichier sur le web ; sur mobile, l'écran propose de coller le JSON.
 */
export async function exportText(filename: string, mime: string, content: string): Promise<void> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  await Share.share({ title: filename, message: content });
}

export const canPickFile = Platform.OS === 'web';

export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') return resolve(null);
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      void file.text().then(resolve, () => resolve(null));
    };
    input.click();
  });
}

export async function shareLink(text: string): Promise<void> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  await Share.share({ message: text });
}

/** Localisation du navigateur (undefined hors web) — sans dépendre des types DOM. */
export function webLocation(): { hash: string; origin: string } | undefined {
  if (Platform.OS !== 'web') return undefined;
  return (globalThis as unknown as { location?: { hash: string; origin: string } }).location;
}
