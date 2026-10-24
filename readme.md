# 🕵️ Undercover — Jeu de mots & de déduction (PWA)

**Undercover** est une application web progressive (PWA) qui adapte le jeu de société « Undercover » (façon *Mr. White*) à **un seul appareil que l'on se passe de main en main**. Chaque joueur découvre son mot en secret, tout le monde le décrit à tour de rôle, puis le groupe vote pour démasquer l'imposteur. Tout fonctionne **hors ligne**, sans compte et sans serveur.

> HTML5 · CSS3 · JavaScript pur · Web Audio · Wake Lock · Service Worker · données stockées localement

* * *

## Sommaire

1. [Aperçu](#aperçu)
2. [Règle du jeu](#règle-du-jeu)
3. [Fonctionnalités](#fonctionnalités)
4. [Mots, thèmes et difficulté](#mots-thèmes-et-difficulté)
5. [PWA et mode hors ligne](#pwa-et-mode-hors-ligne)
6. [Architecture et chargement](#architecture-et-chargement)
7. [Données et confidentialité](#données-et-confidentialité)
8. [Installation](#installation)
9. [Structure du projet](#structure-du-projet)
10. [Technologies](#technologies)
11. [Limites connues](#limites-connues)
12. [À venir](#à-venir)

* * *

## Aperçu

- **Mobile-first**, installable sur l'écran d'accueil, en plein écran (`standalone`, orientation portrait).
- **De 3 à 20 joueurs**, avec un nombre d'Undercovers **suggéré automatiquement** selon la taille de la table et des **avertissements d'équilibrage**.
- **Groupes de joueurs mémorisés** (« Famille », « Soirée du samedi »…) rechargeables en un tap.
- **596 paires de mots** réparties en 7 thèmes, avec 3 niveaux de difficulté, plus un thème **« Mes paires »** que les joueurs alimentent eux-mêmes.
- **Cinq rôles spéciaux** optionnels (Idiot du village, Fantôme, Mime, Procureur, Amoureux) et un **Espion** qui reçoit un indice.
- **Dernière chance de Mr. White** : éliminé, il peut deviner le mot des Civils pour voler la victoire.
- **Confidentialité des cartes** réglable, **minuteur de discussion** avec son et vibration, **écran maintenu allumé** pendant la partie.
- **Journal des scores** avec taux de victoire, séries et export JSON / CSV.
- **Thème clair / sombre** avec bascule manuelle, mémorisée d'une session à l'autre.
- **Aucun framework, aucun bundler, aucune dépendance** à installer.

* * *

## Règle du jeu

Chaque joueur reçoit un mot en secret. **Tous les Civils reçoivent le même mot** ; l'**Undercover** reçoit un mot différent, mais proche (ex. *Pizza* / *Burger*). Personne ne sait qui a quel mot : à chaque tour, chacun décrit le sien avec un indice, sans jamais le prononcer. Puis le groupe vote et élimine un joueur. Une fois éliminé, un joueur révèle son rôle.

### Rôles de base

| Rôle           | Ce qu'il reçoit                                         | Son objectif                                         |
|----------------|---------------------------------------------------------|------------------------------------------------------|
| **Civil**      | Le mot majoritaire                                      | Éliminer tous les imposteurs                         |
| **Undercover** | Un mot proche, mais différent                           | Survivre jusqu'à la fin sans se faire démasquer      |
| **Mr. White**  | Aucun mot : il doit improviser                          | Survivre, ou deviner le mot des Civils s'il tombe    |
| **Espion**     | Aucun mot, mais la **première lettre** du mot des Civils | Se fondre dans la masse grâce à cet indice discret   |

Le nombre total d'imposteurs (Undercover + Mr. White + Espion) est plafonné à `⌈joueurs / 2⌉ − 1`, avec toujours **au moins un Undercover**. Le compteur de chaque rôle se limite automatiquement à ce qui reste disponible.

### Rôles spéciaux (optionnels)

| Rôle                | Effet                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------|
| **Idiot du village** | Gagne **seul** s'il est éliminé dès le **tout premier vote**                                |
| **Fantôme**         | Continue de **voter** même après avoir été éliminé                                            |
| **Mime**            | Doit décrire son mot **uniquement par gestes**, sans parler                                   |
| **Procureur**       | **Tranche lui-même** en cas d'égalité au vote                                                 |
| **Les Amoureux**    | Deux joueurs liés : si l'un est éliminé, **l'autre l'est aussi**. Ils gagnent à deux          |

Si un rôle spécial ne peut pas être attribué (trop peu de joueurs disponibles), l'application l'indique au lancement de la manche.

### Conditions de victoire

| Vainqueur             | Condition                                                                                                         |
|-----------------------|-------------------------------------------------------------------------------------------------------------------|
| **Les Civils**        | Tous les imposteurs (Undercover, Mr. White, Espion) sont éliminés                                                 |
| **Les Imposteurs**    | Il ne reste plus aucun Civil en vie                                                                               |
| **Idiot du village**  | Il est éliminé lors du tout premier vote                                                                          |
| **Les Amoureux**      | Ils sont les derniers survivants                                                                                  |
| **Mr. White**         | Il devine le mot des Civils pendant sa **dernière chance** (voir [ci-dessous](#-dernière-chance-de-mr-white))      |

**Règle d'impasse** (active tant qu'aucun Procureur n'est en vie et qu'aucun Fantôme n'est en jeu) : s'il ne reste que **2 joueurs** dont un imposteur, les imposteurs gagnent ; s'il reste **4 joueurs** dont un couple d'Amoureux, les Amoureux gagnent.

* * *

## Fonctionnalités

### 🎛️ Configuration de la partie

L'écran d'accueil est organisé en six blocs (dont cinq repliables), chacun avec un résumé de son état. Un **récapitulatif** de la configuration reste affiché sous les blocs.

| Bloc                           | Contenu                                                                                           |
|--------------------------------|---------------------------------------------------------------------------------------------------|
| **1. Joueurs & Undercover**    | Nombre de joueurs (3 à 20), d'Undercovers, et réglage automatique du nombre d'imposteurs           |
| **2. Thèmes des mots**         | Choix des thèmes, difficulté des paires, gestion de « Mes paires »                                |
| **3. Rôles spéciaux**          | Mr. White, Espion, dernière chance, Idiot, Fantôme, Mime, Procureur, Amoureux                     |
| **4. Noms des joueurs**        | Un champ par joueur (noms par défaut : *Joueur 1*, *Joueur 2*…) et **groupes de joueurs**        |
| **5. Minuteur de discussion**  | Activation, durée (1 à 15 min, 3 par défaut), son de fin                                          |
| **6. Confidentialité des cartes** | Mode d'affichage du mot et affichage (ou non) du rôle sur la carte (voir ci-dessous)           |

Les réglages durables (difficulté, confidentialité, son, dernière chance, minuteur, thème d'affichage) sont **mémorisés** d'une partie à l'autre.

### ⚖️ Suggestion et contrôle d'équilibrage

**Nombre d'imposteurs recommandé.** Le total conseillé (Undercover + Mr. White + Espion) est d'environ **1 imposteur pour 4 joueurs** :

| Joueurs | 3 – 6 | 7 – 10 | 11 – 14 | 15 – 18 | 19 – 20 |
|---------|:-----:|:------:|:-------:|:-------:|:-------:|
| **Imposteurs recommandés** | 1 | 2 | 3 | 4 | 5 |

- L'option **« Nombre d'Undercovers automatique »** (activée par défaut) ajuste le nombre d'Undercovers à chaque changement du nombre de joueurs, en tenant compte des Mr. White et Espions déjà configurés.
- Dès qu'on règle l'Undercover **à la main**, l'automatisme se désactive ; on peut le réactiver d'un tap. Le choix est mémorisé.

**Encart « Équilibrage ».** Affiché au-dessus du récapitulatif, il prévient quand la configuration risque de poser problème :

| Situation détectée                                                                       | Niveau       |
|------------------------------------------------------------------------------------------|--------------|
| Rôles spéciaux demandant plus de joueurs que la table (ex. les 5 rôles à 3 joueurs)      | Avertissement |
| Rôles spéciaux concernant **plus de 40 %** des joueurs                                   | Avertissement |
| Trop d'imposteurs : plus d'**un de plus** que la recommandation                          | Avertissement |
| Amoureux avec **moins de 8 joueurs**                                                     | Avertissement |
| Deux joueurs portant **le même nom** (leurs statistiques seraient confondues)            | Avertissement |
| Trop peu d'imposteurs par rapport à la recommandation (manche potentiellement longue)    | Information  |
| Mr. White, Espion ou Idiot du village à **4 joueurs ou moins** (très exposés au 1er vote) | Information  |

Sans problème détecté, l'encart indique « Configuration équilibrée ». Quand l'automatisme est désactivé et que l'Undercover s'écarte de la recommandation, un bouton **« Appliquer la recommandation »** la remet en place.

### 👥 Groupes de joueurs

Dans le bloc *Noms des joueurs*, on peut **enregistrer la liste des noms** sous un nom de groupe (24 caractères max, **20 groupes** au plus) :

- **Enregistrer** : saisir les noms, donner un nom au groupe, puis « Enregistrer les noms ». Tous les noms doivent être renseignés et uniques ; enregistrer sous un nom existant **met le groupe à jour**.
- **Recharger en un tap** : toucher le groupe règle le nombre de joueurs **et** remplit tous les noms. Le groupe actif est surligné et son nom apparaît dans le résumé du bloc.
- **Supprimer** : le × de la pastille, avec confirmation.
- **Statistiques propres à chaque groupe** : chaque manche enregistre le groupe dont la liste de noms correspond (peu importe l'ordre). Le journal propose alors un **filtre « Groupe »** (*Tous les groupes*, chaque groupe, *Sans groupe*) qui recalcule classement, taux, séries et historique. Fini les « Joueur 1 » de parties différentes confondus.

### 🃏 Distribution et consultation des cartes

- L'appareil circule : chaque joueur touche **sa propre carte**, mémorise son mot en privé, puis appuie sur **« Cacher & passer au suivant »**.
- Une carte déjà consultée ne peut **pas être rouverte** ; une barre indique le nombre de cartes consultées.
- Chaque carte rappelle le rôle (Civil, Undercover, Mr. White, Espion) et les **badges** associés (Mime, Procureur, Amoureux, indice de l'Espion…). La mention « Tu es [rôle] » des Civils et de l'Undercover peut être **désactivée** (voir [Confidentialité des cartes](#-confidentialité-des-cartes)).
- À chaque nouvelle manche, de **nouveaux mots** sont tirés ; l'ordre des mots entre Civils et Undercover est **aléatoire** (la même paire ne donne pas toujours le même mot à l'imposteur).

### 🔒 Confidentialité des cartes

Pour éviter les regards indiscrets, trois modes sont proposés (bloc 6) :

| Mode                        | Fonctionnement                                                                                                                       |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| **Standard**                | Le mot reste affiché jusqu'à « Cacher & passer au suivant »                                                                          |
| **Masquage automatique**    | Le mot se masque seul après **5, 8, 12 ou 20 s** (barre de temps visible) ; un bouton permet de le **réafficher**                    |
| **Maintenir pour révéler**  | Le mot n'apparaît que **tant que le doigt reste appuyé** sur le bouton (souris, tactile ou clavier). Impossible de passer au suivant sans l'avoir vu au moins une fois |

Dans les deux derniers modes, le contenu est masqué **sans changer la mise en page**, et les lecteurs d'écran n'y ont pas accès tant qu'il est caché.

**Afficher « Tu es [rôle] » sur la carte** (case à cocher, activée par défaut) : désactivée, les **Civils et l'Undercover ne voient que leur mot** et ignorent leur camp, comme dans le jeu classique. **Mr. White et l'Espion**, qui n'ont pas de mot, voient toujours leur rôle, de même que les badges des rôles spéciaux (Mime, Procureur, Amoureux…). L'option est mémorisée ; un résumé « rôle masqué » apparaît dans le bloc 6 et dans le récapitulatif de la partie.

### ⏱️ Minuteur de discussion

- Se lance automatiquement une fois **toutes les cartes consultées**, pour cadrer le débat.
- **Durée de 1 à 15 minutes**, avec pause / reprise, relance et bouton **+1 min**.
- À la fin du temps : **vibration** et **sonnerie** (trois notes, synthétisées en direct par la Web Audio API, **aucun fichier audio**). Le son se désactive depuis les réglages ; un petit bip de contrôle confirme l'activation.
- L'**écran reste allumé** pendant la phase des cartes et la discussion (Screen Wake Lock, quand le navigateur le permet), puis se libère au moment du vote.

### 🗳️ Vote et élimination

- Le groupe désigne un joueur ; l'application demande une **confirmation** avant d'éliminer.
- Une fenêtre **révèle le rôle** du joueur éliminé, puis annonce la suite : la partie continue, ou la fin de manche.
- La liste des **joueurs éliminés** est affichée avec leur rôle ; un **Fantôme** garde un marqueur « vote encore ».
- La fin de manche affiche le vainqueur et le bouton **« Voir tous les rôles »** (récapitulatif des rôles et des mots), puis propose **« Nouvelle manche (mêmes joueurs) »** ou **« Nouvelle partie »**.

### 🎩 Dernière chance de Mr. White

Quand un Mr. White est éliminé, une fenêtre lui laisse une dernière chance de **deviner le mot des Civils** :

- Le mot se **saisit au clavier** ou se **dicte** (bouton « Dicter », si le navigateur prend en charge la reconnaissance vocale, en français).
- La comparaison **ignore la casse, les accents et les articles** (*l'éthique* = *Éthique*). Le pluriel est toléré, **sauf** s'il revient à donner le mot de l'Undercover (ex. *Pari* / *Paris*).
- **Bonne réponse** : Mr. White gagne la partie **à lui seul**, même si son élimination donnait la victoire aux Civils.
- **Mauvaise réponse** (ou renoncement) : la partie suit son cours, et le mot des Civils **reste secret**. Si plusieurs Mr. White sont éliminés ensemble, ils tentent leur chance l'un après l'autre.
- Ne s'applique pas lorsque l'Idiot du village gagne au premier vote.
- Une case dans le bloc *Rôles spéciaux* permet de **désactiver** cette règle ; le Mr. White en est informé sur sa carte quand elle est active.

### 📊 Journal des scores et statistiques

Accessible depuis l'écran de partie (et par le [raccourci](#-raccourcis-et-liens-spéciaux) *Journal des scores*). Les **200 dernières manches** sont conservées.

| Élément                      | Contenu                                                                                                  |
|------------------------------|----------------------------------------------------------------------------------------------------------|
| **Classement des joueurs**   | Nombre de victoires, **taux de victoire**, **série en cours** et **record de série** par joueur           |
| **Taux par rôle**            | Victoires / manches jouées et pourcentage pour Civil, Undercover, Mr. White et Espion                    |
| **Historique des manches**   | Vainqueur, numéro de manche, nombre de joueurs                                                           |
| **Export JSON**              | Entrées complètes du journal + statistiques calculées                                                    |
| **Filtre par groupe**        | Restreint classement, taux, séries et historique à un groupe de joueurs (visible dès qu'une manche a été jouée avec un groupe) |
| **Export CSV**               | Une ligne par joueur et par manche, avec la colonne `groupe` (séparateur `;`, BOM UTF-8, ouvre directement dans Excel en français) |

Chaque manche enregistre la date, le groupe, les joueurs, leur rôle, leurs rôles spéciaux, leur résultat, ainsi que le **thème** et la **difficulté** de la paire jouée.

> Les taux et les séries ne comptent que les manches enregistrées **depuis l'ajout des statistiques** ; les anciennes entrées restent dans le classement des victoires, une note l'indique.

### ✏️ « Mes paires » : mots personnalisés

Le thème **Mes paires** regroupe les paires saisies par les joueurs, stockées sur l'appareil. Le bouton **« Gérer “Mes paires” »** ouvre une fenêtre dédiée :

- **Ajouter** une paire (deux mots différents, **40 caractères max** chacun, jusqu'à **300 paires**) avec sa difficulté. Les doublons sont refusés, quel que soit l'ordre des deux mots ou les accents.
- **Supprimer** une paire (×).
- **Exporter** la liste dans un fichier JSON (`undercover-mes-paires-AAAA-MM-JJ.json`) et la **réimporter** depuis un fichier : l'import **fusionne** sans écraser l'existant, ignore les doublons et les paires invalides, et indique combien de paires ont été ajoutées ou ignorées. Un export de l'application, ou un simple tableau JSON `[["mot1", "mot2", 2], …]`, est accepté ; tout autre fichier est refusé avec un message.
- **Partager par lien** : un lien `…/index.html#paires=…` encode toutes les paires. À son ouverture, l'application propose d'**ajouter les paires reçues** (feuille de partage native quand elle existe, sinon copie dans le presse-papiers).

### 🔗 Raccourcis et liens spéciaux

| Lien                               | Effet                                                                  |
|------------------------------------|------------------------------------------------------------------------|
| `index.html?action=new`            | Ouvre l'écran de configuration et place le curseur sur « Lancer »      |
| `index.html?action=scores`         | Ouvre directement le journal des scores                                |
| `index.html#paires=…`              | Propose d'importer les paires partagées                                |

Ces liens alimentent les **raccourcis d'icône** du manifeste (appui long sur Android, clic droit sur desktop). L'action est exécutée **une seule fois** et l'URL est aussitôt nettoyée : un rechargement ne la rejoue pas.

### 📲 Installation et mises à jour

- Un bouton **« Installer l'app »** apparaît quand le navigateur le permet (événement `beforeinstallprompt`). Sur iPhone / iPad, il affiche la marche à suivre (*Partager → Sur l'écran d'accueil*). Il disparaît une fois l'application installée.
- Quand une **nouvelle version** est disponible, un bandeau « Nouvelle version disponible. **Recharger** » s'affiche ; la mise à jour ne s'applique qu'après ce clic, et jamais à la toute première installation.

### ♿ Accessibilité & confort

Zone *live* pour annoncer les cartes, les éliminations et les résultats ; libellés accessibles sur les boutons d'icône ; **zoom autorisé** ; champs de saisie à 16 px (pas de zoom automatique sur iOS) ; focus visible ; respect de `prefers-reduced-motion`.

* * *

## Mots, thèmes et difficulté

Les paires vivent dans **`words.json`**, chargé au démarrage et **précaché** par le service worker. Une paire ne revient **jamais** tant que tout le stock des thèmes sélectionnés n'a pas été utilisé ; le stock repart alors de zéro (avec un message).

| Thème                     | Paires | Facile | Moyenne | Difficile | Contenu                                      |
|---------------------------|-------:|-------:|--------:|----------:|----------------------------------------------|
| **Général**               |    273 |     29 |      92 |       152 | Objets, animaux, lieux, quotidien            |
| **Métier UX / Web**       |     18 |      3 |       8 |         7 | Vocabulaire design, dev et vie de bureau     |
| **Sport auto**            |     44 |      4 |      25 |        15 | Formule 1, courses et pilotes                |
| **Cinéma & Pop culture**  |     85 |     16 |      54 |        15 | Super-héros, films et personnages cultes     |
| **Célébrités & Sosies**   |     79 |     38 |      24 |        17 | Stars, DJ, sportifs et leurs faux jumeaux    |
| **Jeux de mots**          |     51 |     22 |      14 |        15 | Calembours autour de noms de célébrités      |
| **Homophones**            |     46 |     18 |      10 |        18 | Mots qui se prononcent pareil, sens différent |
| **Total**                 |    596 |    130 |     227 |       239 |                                              |

### Niveaux de difficulté

La difficulté mesure la **proximité des deux mots** : plus ils sont proches, plus l'Undercover est difficile à repérer.

| Niveau        | Idée                                                       | Exemple          |
|---------------|------------------------------------------------------------|------------------|
| **Facile**    | Mots plutôt éloignés : l'Undercover se repère assez vite   | Chat / Chien     |
| **Moyenne**   | Même univers, éléments distincts : un bon équilibre        | Pizza / Burger   |
| **Difficile** | Quasi-synonymes ou mots presque identiques                 | Mer / Océan      |
| **Toutes**    | Toutes les paires sont mélangées (par défaut)              | —                |

Les compteurs de paires par thème se mettent à jour selon le niveau choisi. Si aucun thème sélectionné ne contient de paire du niveau demandé, l'application utilise **toutes les difficultés** et le signale.

> Les niveaux fournis sont une **évaluation éditoriale** : ils sont modifiables paire par paire directement dans `words.json`.

### Format de `words.json`

```json
{
  "version": 1,
  "difficulty": { "1": "Facile", "2": "Moyenne", "3": "Difficile" },
  "themes": [
    {
      "key": "classique",
      "label": "Général",
      "desc": "Le pack classique : objets, animaux, lieux, quotidien.",
      "pairs": [
        ["Mot des Civils", "Mot de l'Undercover", 2]
      ]
    }
  ]
}
```

Pour **ajouter un thème**, il suffit d'ajouter un objet dans `themes` : il apparaît automatiquement dans l'écran de configuration. Le troisième élément d'une paire est la difficulté (`1`, `2` ou `3` ; `2` par défaut s'il est absent). Après modification, incrémentez `CACHE_VERSION` dans `sw.js`.

* * *

## PWA et mode hors ligne

- **Manifeste** (`manifest.json`) : nom « Undercover — jeu de mots & de déduction », affichage `standalone`, orientation portrait, langue `fr`, catégories jeux / divertissement, icônes 192 et 512 px (dont des versions *maskable*) et icône Apple Touch.
- **Raccourcis d'application** : « Nouvelle manche » et « Journal des scores ».
- **Captures d'écran** déclarées (`narrow` et `wide`) pour la fiche d'installation.
- **Service Worker** (`sw.js`, cache `undercover-v1.4.2`) :
  - **précache** obligatoire de l'application (HTML, CSS, **les 20 modules de `js/`**, manifeste, `words.json`) : les modules chargés à la demande sont donc eux aussi disponibles hors ligne ; les **icônes** sont mises en cache « au mieux » : une icône manquante ne bloque pas l'installation ;
  - navigation : **réseau d'abord**, repli sur `index.html` en cache ;
  - fichiers de l'application : **cache d'abord**, rafraîchis en arrière-plan (*stale-while-revalidate*) ;
  - autres origines (polices Google) : cache d'exécution avec rafraîchissement en arrière-plan ;
  - **nettoyage automatique** des anciens caches à l'activation ;
  - **pas de prise de contrôle brutale** : la nouvelle version attend le clic sur « Recharger » (message `SKIP_WAITING`), et l'application recherche une mise à jour à chaque retour au premier plan.
- **Compatibilité iOS** : plein écran, gestion des zones sûres (`viewport-fit=cover`), consigne d'installation dédiée.

> **Pour publier une nouvelle version, incrémentez `CACHE_VERSION` dans `sw.js`.** Avec le découpage en modules, c'est indispensable : sans cela, un appareil pourrait mélanger d'anciens et de nouveaux fichiers de `js/` (les fichiers en cache sont rafraîchis un par un en arrière-plan) et l'application risquerait de planter. Toute modification de `js/`, `words.json`, `style.css` ou `index.html` doit s'accompagner d'une nouvelle version du cache, et tout **nouveau module** doit être ajouté à la liste `APP_SHELL_FILES`.

* * *

## Architecture et chargement

Le JavaScript est découpé en **modules ES** (`js/`, sans bundler ni build). Trois niveaux de chargement évitent de télécharger et d'exécuter, dès l'ouverture, du code que l'écran d'accueil n'utilise pas :

| Niveau | Modules | Quand ? |
|--------|---------|---------|
| **Accueil** (immédiat) | `main`, `core`, `theme`, `themes`, `setup`, `options`, `balance`, `groups`, `audio`, `pwa` | Au chargement de la page, récupérés **en parallèle** grâce aux balises `modulepreload` |
| **Jeu** (arrière-plan) | `game-chunk` → `game`, `timer`, `cards`, `vote`, `guess`, `wakelock`, `journal` | Préchargé quand le navigateur est inactif (`requestIdleCallback`), ou **au clic sur « Lancer »** s'il n'est pas encore prêt |
| **À la demande** | `journal-ui` (fenêtre du journal, statistiques, exports) et `custom-ui` (« Mes paires », import / export / partage) | À la **première ouverture** de la fenêtre, ou au lancement via `?action=scores` / `#paires=…` |

Règles de l'architecture :

- Un module de l'accueil **n'importe jamais** un module du jeu ou « à la demande » : il passe par le chargeur de `main.js` (`import()` dynamique). Une erreur de chargement (hors ligne sans cache) affiche un message et permet de réessayer.
- Chaque module expose une fonction `boot…()` qui branche ses écouteurs ; elles sont appelées par `main.js` (accueil) ou à la première charge du chunk. Un module ne fait aucun effet de bord à l'import, ce qui évite les problèmes d'ordre dans les dépendances circulaires.
- `core.js` ne dépend de rien : constantes, état de la partie (`state`), références DOM (`el`) et utilitaires.
- `words.json` est préchargé (`<link rel="preload">`) en parallèle des modules.

### Mesures

Chargement à froid (cache vidé), serveur HTTP/2 avec gzip, comparé à l'ancienne version en un seul `script.js` ; médianes de 5 à 7 essais :

| Conditions                          | JS exécuté avant l'accueil | JS gzip avant l'accueil | Accueil interactif    |
|-------------------------------------|---------------------------:|------------------------:|-----------------------|
| Mobile moyen (CPU ×4, 4G)           | 58 ms → **32 ms** (−45 %)  | 26,2 Ko → **16,7 Ko** (−36 %) | ≈ identique (796 → 786 ms) |
| Mobile bas de gamme (CPU ×6, 3G)    | 68 ms → **38 ms** (−44 %)  | 26,2 Ko → **16,7 Ko** (−36 %) | 1 353 → 1 256 ms (−7 %) |

Le gain porte surtout sur le **temps de calcul du thread principal** au démarrage. Il reste modeste en valeur absolue : l'application est légère. En contrepartie, le total des octets JS après chargement du jeu augmente d'environ 14 % (30 Ko gzip contre 26 Ko), car des fichiers séparés se compressent moins bien qu'un seul.

> Pour aller plus loin : minifier les modules (environ −40 % d'octets) nécessiterait un outil de build, ce qui sortirait du principe « sans dépendance » du projet.

* * *

## Données et confidentialité

Toutes les données restent **sur votre appareil**, dans le `localStorage` du navigateur. Aucune donnée n'est envoyée à un serveur et aucun compte n'est nécessaire.

| Clé                                  | Contenu                                                              |
|--------------------------------------|----------------------------------------------------------------------|
| `undercover_theme_v1`                | Thème d'affichage (clair / sombre)                                   |
| `undercover_options_v1`              | Difficulté, confidentialité des cartes (dont affichage du rôle), son, dernière chance, Undercovers automatiques |
| `undercover_groups_v1`               | Groupes de joueurs (20 max)                                          |
| `undercover_timer_settings_v1`       | Minuteur : activation et durée                                       |
| `undercover_used_pairs_v1`           | Paires déjà jouées (pour éviter les répétitions)                     |
| `undercover_custom_pairs_v1`         | Paires de « Mes paires » (300 max)                                   |
| `undercover_score_log_v1`            | Journal des scores et statistiques (200 manches max)                 |

L'état d'une manche en cours **n'est pas sauvegardé** : recharger la page pendant une manche la perd (les scores déjà enregistrés sont conservés).

Conséquences à connaître : les données sont propres à chaque navigateur et chaque appareil, et vider les données du site ou désinstaller l'application les supprime. Il n'y a pas de synchronisation automatique ; utilisez l'**export JSON / CSV** du journal et l'**export JSON** de « Mes paires » (les groupes de joueurs ne s'exportent pas encore) pour conserver ou transférer vos données.

Les liens de partage de « Mes paires » contiennent **les mots eux-mêmes** (encodés dans l'URL) : ne partagez que ce que vous êtes prêt à rendre lisible par le destinataire.

* * *

## Installation

L'application ne nécessite ni build ni dépendance à installer.

1. Placez les fichiers `index.html`, `style.css`, `words.json`, `manifest.json` et `sw.js` à la racine, avec le dossier `js/` (les 20 modules) et le dossier `assets/` contenant les icônes (`logo-192.png`, `logo-512.png`, `logo-maskable-192.png`, `logo-maskable-512.png`, `logo-apple-touch.png`) et les captures d'écran (`screenshot-setup.png`, `screenshot-game.png`, `screenshot-wide.png`).
2. Servez le dossier en **HTTPS** (GitHub Pages, Netlify, Vercel…) ou en local, par exemple avec `npx serve` ou `python -m http.server`. Le chargement de `words.json`, des modules `js/`, le service worker et l'installation PWA **ne fonctionnent pas** en ouvrant directement le fichier (`file://`). Le serveur doit servir les fichiers `.js` avec un type MIME JavaScript (c'est le cas de tous les hébergeurs courants).
3. Ouvrez l'adresse dans un navigateur moderne, puis :
   - **Android / Chrome** : bouton **Installer l'app** ou menu → *Installer l'application* ;
   - **iOS / Safari** : Partager → *Sur l'écran d'accueil*.

Une connexion est nécessaire au **premier chargement** (mots et polices) ; ensuite, tout est mis en cache et l'application fonctionne hors ligne.

* * *

## Structure du projet

```
├── index.html        Écran de configuration, écran de partie, modales (carte, élimination,
│                     dernière chance, mes paires, journal), bandeau de mise à jour
├── style.css         Thème clair / sombre, composants, animations
├── words.json        596 paires de mots, thèmes et niveaux de difficulté
├── manifest.json     Métadonnées PWA, icônes, raccourcis, captures d'écran
├── sw.js             Service Worker (précache, hors-ligne, mises à jour)
├── readme.md         Ce fichier
├── js/
│   ├── main.js         Point d'entrée : démarrage de l'accueil, chargement à la demande
│   ├── core.js         Constantes, état (state), références DOM (el), utilitaires
│   ├── theme.js        Thème clair / sombre
│   ├── themes.js       words.json, données de « Mes paires », difficulté, tirage, grille des thèmes
│   ├── setup.js        Compteurs, rôles, noms, minuteur, récapitulatif
│   ├── options.js      Options mémorisées (difficulté, confidentialité, son, dernière chance)
│   ├── balance.js      Recommandation d'imposteurs et contrôle d'équilibrage
│   ├── groups.js       Groupes de joueurs mémorisés
│   ├── audio.js        Sons du minuteur (Web Audio)
│   ├── pwa.js          Installation de l'app, service worker, bandeau de mise à jour
│   ├── game-chunk.js   Point d'entrée du chunk de jeu
│   ├── game.js         Attribution des rôles, lancement, nouvelle manche
│   ├── timer.js        Minuteur de discussion
│   ├── cards.js        Cartes secrètes et confidentialité des cartes
│   ├── vote.js         Vote, élimination, fin de partie, récapitulatif
│   ├── guess.js        Dernière chance de Mr. White (saisie et dictée)
│   ├── wakelock.js     Écran maintenu allumé
│   ├── journal.js      Enregistrement des manches dans le journal
│   ├── journal-ui.js   Fenêtre du journal, statistiques, exports   [à la demande]
│   └── custom-ui.js    Fenêtre « Mes paires », import / export / partage   [à la demande]
└── assets/           Icônes de l'application et captures d'écran
```

## Technologies

- **HTML5 / CSS3** : variables CSS, Flexbox, Grid, `prefers-color-scheme`, `env(safe-area-inset-*)`
- **JavaScript** vanilla en **modules ES** (`import` statique, `import()` dynamique, `modulepreload`, `requestIdleCallback`), sans framework ni bundler
- **Google Fonts** : Barlow Condensed (titres), Courier Prime (texte), avec polices de secours
- **Service Worker** et **Web App Manifest** (raccourcis, captures d'écran, `beforeinstallprompt`)
- **Web Audio API** (sonnerie du minuteur), **Vibration API**, **Screen Wake Lock API**
- **Web Speech API** (`SpeechRecognition`) pour la dictée de Mr. White, quand elle est disponible
- **File API**, **Blob** et **Web Share** pour les exports, l'import et le partage par lien
- **localStorage** pour toute la persistance

* * *

## Limites connues

- **Dictée vocale** : disponible seulement sur les navigateurs qui prennent en charge `SpeechRecognition` (Chrome, Edge, Safari récents), généralement avec une connexion. Sinon, le bouton « Dicter » est masqué et la saisie au clavier reste possible.
- **Wake Lock** : ignoré silencieusement par les navigateurs qui ne le prennent pas en charge.
- **Vibration** : non disponible sur Safari iPhone.
- **Installation iOS** : pas d'événement `beforeinstallprompt` ; le bouton affiche simplement la marche à suivre. Les raccourcis d'icône ne sont pas pris en charge par iOS.
- **Pas de reprise de manche** après un rechargement de la page.
- **Homophones et dictée** : la reconnaissance vocale ne distingue pas deux mots qui se prononcent pareil ; le joueur peut corriger le texte avant de valider.
- Les **noms par défaut** (*Joueur 1*, *Joueur 2*…) restent fusionnés dans les statistiques d'une partie à l'autre : utilisez des **groupes** et de vrais prénoms pour des taux de victoire parlants. Les manches enregistrées avant l'ajout des groupes sont classées « Sans groupe ».
- **Groupes de joueurs** : ils sont propres à l'appareil et ne s'exportent pas encore. Un groupe n'est reconnu dans le journal que si **tous les noms** de la manche correspondent exactement à sa liste.

## À venir

- Reprise de la manche en cours après un rechargement
- Export / import des groupes de joueurs
- Tirage au sort du **premier joueur** et du sens de parole
- **Vote secret individuel** à tour de rôle, avec décompte et gestion des égalités
- Polices **auto-hébergées** (confidentialité et hors-ligne dès la première visite)
- Version **anglaise** de l'interface