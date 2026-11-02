/**
 * Web uniquement : désactive les ligatures typographiques.
 * La police titre « Sirelia » a 36 ligatures (« el », « ma », « er », « em », « ia »…) dont les glyphes sont VIDES :
 * sans cette règle, ces lettres disparaissent (« Nouvelle manche » → « Nouvle nche »).
 *
 * La règle est injectée par l'application elle-même (et non via app/+html.tsx) : en mode « application monopage »
 * (`web.output: "single"`), Expo n'utilise pas forcément ce fichier, ce qui laissait le défaut visible.
 */
interface StyleEl { id: string; textContent: string }
interface Doc { getElementById(id: string): unknown; createElement(tag: string): StyleEl; head: { appendChild(el: StyleEl): void } }

const doc = (globalThis as unknown as { document?: Doc }).document;
if (doc && !doc.getElementById('mm-web-fixes')) {
  const style = doc.createElement('style');
  style.id = 'mm-web-fixes';
  style.textContent = '*{font-variant-ligatures:none;font-feature-settings:"liga" 0,"clig" 0}';
  doc.head.appendChild(style);
}

export {};
