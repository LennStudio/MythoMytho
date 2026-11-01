# MythoMytho — Expo / React Native Web (TypeScript strict)

Conversion de la PWA HTML/CSS/JS en application universelle : **iOS, Android et web** depuis une seule base de code,
navigation par **Expo Router**, cible web en **export statique** (hébergement type GitHub Pages, `CNAME` conservé).

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

## Limites à connaître

* **Non exécuté sur appareil ni navigateur** : l'environnement de conversion n'avait pas accès au réseau. Vérifié ici : le
  domaine et le réducteur (TypeScript strict, 3 550 contrôles, 400 parties simulées) et l'ensemble du code applicatif
  (TypeScript strict contre des déclarations minimales). Le premier `npx expo start` est donc la vraie recette visuelle.
* Dictée vocale : **web uniquement** (API du navigateur) ; masquée sur mobile.
* Export/import : téléchargement et sélecteur de fichier sur le web ; sur mobile, feuille de partage native et import par
  collage du JSON.
* Service worker : les bundles Expo sont hachés, il n'y a donc plus de liste de précache fixe ; le cache se remplit à
  l'usage (une première visite en ligne est nécessaire).
* En SDK 58, `web.output` est « server » par défaut ; `app.json` le force à `"static"` pour un hébergement statique.
