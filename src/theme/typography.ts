/**
 * La police titre « Sirelia » contient 36 ligatures (« ca », « eu », « er », « en », « et », « ta »…) dont les
 * glyphes sont VIDES : sans précaution, ces lettres disparaissent (« cartes » → « rtes »). L'ancienne version
 * désactivait les ligatures en CSS (`font-variant-ligatures: none`) ; React Native n'expose pas cette propriété.
 * Sur le web, une règle CSS globale suffit (app/+html.tsx). Sur mobile, on insère un séparateur de largeur nulle (U+200C) entre deux lettres consécutives, ce qui empêche la
 * substitution sur web comme sur iOS/Android, sans rien afficher.
 */
const ZWNJ = '\u200C';
export function noLigatures(text: string): string {
  return text.replace(/([A-Za-z])(?=[A-Za-z])/g, `$1${ZWNJ}`);
}

export interface TitleRun { readonly text: string; readonly letters: boolean }

/** Découpe un titre en suites de lettres ASCII (police Sirelia) et en reste (police de repli). */
export function titleRuns(text: string): TitleRun[] {
  return text
    .split(/([A-Za-z]+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, letters: /^[A-Za-z]+$/.test(part) }));
}
