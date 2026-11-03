/**
 * Police titre « Sirelia » : seules les lettres ASCII (et l'apostrophe, ajoutée dans SireliaFixed.otf) sont dessinées (chiffres, accents, ponctuation = glyphes vides).
 * Ses 36 ligatures (« ca », « eu », « er », « em »…) étaient vides elles aussi : elles ont été retirées du fichier
 * (assets/fonts/SireliaFixed.otf), ce qui évite de dépendre d'un réglage du navigateur ou d'un contournement.
 */
export interface TitleRun { readonly text: string; readonly letters: boolean }

/** Découpe un titre en suites de lettres ASCII et apostrophes (police Sirelia) et en reste (police de repli). */
export function titleRuns(text: string): TitleRun[] {
  return text
    .split(/([A-Za-z'’]+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, letters: /^[A-Za-z'’]+$/.test(part) }));
}
