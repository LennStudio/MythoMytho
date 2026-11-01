# MythoMytho — Expo / React Native Web (TypeScript strict)

Conversion de la PWA HTML/CSS/JS en application universelle : **iOS, Android et web** depuis une seule base de code,
navigation par **Expo Router**, cible web en **application monopage exportée** (hébergement type GitHub Pages, `CNAME` conservé).

## Démarrer

```bash
npm install
npx expo install --fix      # aligne toutes les dépendances sur la version d'Expo SDK installée
npm run web                 # ou: npm run android / npm run ios
npm run typecheck           # TypeScript strict
npm run test:domain         # règles du jeu + 400 parties simulées (sans dépendance)
npm run build:web           # export statique dans dist/
```

> `package.json` laisse volontairement `*` pour les bibliothèques Expo : `npx expo install --fix` choisit les versions
> compatibles avec votre SDK (testé sur la base d'Expo SDK 58).

## Premier lancement : à regarder en priorité

1. `npm run typecheck` — la première compilation contre les vrais types React Native / Expo peut révéler des détails de typage
   que la vérification hors ligne n'a pas pu voir.
2. Titres en police Sirelia sur téléphone (lettres, chiffres, accents).
3. Zones sûres (encoche, barre d'état, barre de navigation Android) sur tous les écrans.
4. Saisie dans la modale « Dernière chance » avec le clavier ouvert (iOS : `KeyboardAvoidingView`).
5. Son et vibration de fin de minuteur ; écran maintenu allumé pendant la distribution des cartes.

## Architecture

```
app/                      Routes Expo Router : fines, ne contiennent aucune logique
  _layout.tsx             polices, providers, Stack
  index.tsx               configuration (+ raccourcis ?action=scores / ?action=pairs)
  game.tsx  scores.tsx  custom-pairs.tsx  +not-found.tsx  +html.tsx (shell PWA)
src/
  domain/                 ★ TypeScript pur — aucun import React / React Native
    types.ts constants.ts text.ts roles.ts balance.ts words.ts
    assign.ts             attribution des rôles
    elimination.ts        victoires, Orion, Prométhée, Amoureux, impasses, textes d'annonce
    journal.ts stats.ts   Mr. White, groupes, journal, stats, CSV/JSON, paires, lien de partage
  state/
    gameReducer.ts        ★ flux complet d'une manche, pur et testé
    settings.tsx library.tsx game.tsx toast.tsx AppProviders.tsx   (contextes + persistance)
  components/             interface uniquement (ui/, setup/, game/, scores/)
  services/               plateforme : storage, fichiers, vibration/son, dictée
  theme/                  palette « dossier » (clair/sombre), polices
  data/                   words.json, missions.json (embarqués, hors ligne) + chargeur typé
scripts/                  tests du domaine et du flux
public/                   manifest.json, sw.js, icônes (web)
```

Règle de dépendance : `components → state → domain`. `domain` ne dépend de rien, d'où des tests sans émulateur.

## Correspondance avec l'ancienne version

| Avant (JS global) | Maintenant |
|---|---|
| `core.js` : `state` global + ~200 refs DOM `el` | `domain/types.ts` (états typés immuables) + contextes React |
| `game.js` (attribution), `balance.js`, `themes.js`, `guess.js`, `journal.js` | `domain/assign.ts`, `balance.ts`, `words.ts`, `journal.ts`, `stats.ts` |
| `vote.js` (élimination + UI mélangées) | `domain/elimination.ts` + `state/gameReducer.ts` + `components/game/` |
| `cards.js`, `picker.js`, `questions.js` | `SecretCardModal`, `PickModal`, `GuessModal`, `GameOverPhase` |
| `timer.js`, `wakelock.js`, `audio.js` | `DiscussionTimer`, `expo-keep-awake`, `services/feedback.ts` |
| `custom-ui.js`, `journal-ui.js`, `groups.js` | `CustomPairsScreen`, `ScoresScreen`, `NamesBlock` |
| `sw.js` + `manifest.json` | `public/sw.js` (cache à l'usage) + `public/manifest.json` |
| `mytho.js` (jamais importé) | supprimé (code mort) |

**Données conservées** : les clés `undercover_*_v1` sont inchangées ; sur le web, AsyncStorage utilise localStorage avec la
même clé, donc réglages, groupes, paires et journaux existants sont relus. L'ancien lien `#paires=…` fonctionne toujours.

## Corrections apportées au passage

* « Les Civils ont gagne ! » → **gagné** (accent manquant dans les titres de fin).
* `mytho.js` orphelin (non importé, absent du précache) supprimé.
* Le readme d'origine annonçait 23 modules pour 24 fichiers ; manifest et readme n'avaient plus le même nom d'application.
* Le manifest référençait des captures `screenshot-*.png` absentes du dépôt : retirées.

## Police titre « Sirelia » : piège connu

Seules les lettres A–Z / a–z y sont dessinées : chiffres, accents et ponctuation sont des **glyphes vides**, et ses 36
ligatures (« ca », « eu », « er »…) sont vides aussi. L'ancienne version le contournait par `unicode-range` et
`font-variant-ligatures: none`. Ici, `AppText title` rend les suites de lettres en Sirelia et le reste en Courier Prime
(`src/theme/typography.ts`), `app/+html.tsx` désactive les ligatures sur le web, et un séparateur invisible le fait sur mobile.

## Limites à connaître

* **Jamais lancé avec Expo ni sur appareil** (pas de réseau lors de la conversion). Vérifié : domaine et réducteur
  (TypeScript strict, 3 550 contrôles, 400 parties simulées) ; code applicatif en TypeScript strict ; et rendu réel de
  mes composants dans Chrome avec un substitut HTML des primitives React Native (parcours complet, Orion, Prométhée,
  Mr. White, journal, paires, thème sombre : 0 erreur console). Ce substitut approche `react-native-web` sans être
  identique : le premier `npx expo start` reste la vraie recette, surtout sur mobile.
* Dictée vocale : un micro par champ de nom, **web uniquement** (API du navigateur) ; masquée sur mobile.
* Bouton « Installer l'application » : web uniquement (événement `beforeinstallprompt`) ; il n'apparaît que si le navigateur propose l'installation.
* Export/import : téléchargement et sélecteur de fichier sur le web ; sur mobile, feuille de partage native et import par
  collage du JSON.
* Service worker : les bundles Expo sont hachés, il n'y a donc plus de liste de précache fixe ; le cache se remplit à
  l'usage (une première visite en ligne est nécessaire).
* `app.json` fixe `web.output` à `"single"` (application monopage : un seul `index.html` + le JavaScript). Le pré-rendu
  « static » n'apporte rien à ce jeu (tout dépend du navigateur) et, lors du premier test, laissait une page sans script.
  Sur GitHub Pages, copiez `dist/index.html` en `dist/404.html` pour que les liens directs (`/scores`) fonctionnent.
