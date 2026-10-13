(function () {
  "use strict";

  var WORD_THEMES = [{
      key: "classique",
      label: "Général",
      desc: "Le pack classique : objets, animaux, lieux, quotidien.",
      pairs: [
        ["Tinder", "LinkedIn"],
        ["Instagram", "TikTok"],
        ["Chat", "Chien"],
        ["Café", "Thé"],
        ["Pizza", "Burger"],
        ["Plage", "Montagne"],
        ["Été", "Hiver"],
        ["Voiture", "Moto"],
        ["Piscine", "Mer"],
        ["Guitare", "Piano"],
        ["Médecin", "Infirmier"],
        ["Lion", "Tigre"],
        ["Avion", "Train"],
        ["Pomme", "Poire"],
        ["Lune", "Soleil"],
        ["Livre", "Journal"],
        ["Stylo", "Crayon"],
        ["Football", "Rugby"],
        ["Neige", "Pluie"],
        ["Chocolat", "Vanille"],
        ["Château", "Maison"],
        ["Pirate", "Corsaire"],
        ["Vélo", "Trottinette"],
        ["Fromage", "Beurre"],
        ["Whisky", "Vodka"],
        ["Sushi", "Ramen"],
        ["Ordinateur", "Tablette"],
        ["Dentiste", "Chirurgien"],
        ["Rivière", "Lac"],
        ["Étoile", "Planète"],
        ["Pain de mie", "Baguette"],
        ["Cinéma", "Théâtre"],
        ["Requin", "Dauphin"],
        ["Camion", "Bus"],
        ["Hôtel", "Auberge"],
        ["Perroquet", "Aigle"],
        ["Salade", "Soupe"],
        ["Montre", "Bracelet"],
        ["Parapluie", "Manteau"],
        ["Bougie", "Lampe"],
        ["Sapin", "Palmier"],
        ["Robot", "Extraterrestre"],
        ["Policier", "Pompier"],
        ["Violon", "Violoncelle"],
        ["Tornade", "Ouragan"],
        ["Compte", "Comte"],
        ["Paris", "Marseille"],
        ["Lego", "Playmobil"],
        ["Croissant", "Pain au chocolat"],
        ["Apple", "Samsung"],
        ["Uber", "Uber Eats"],
        ["Coca", "Pepsi"],
        ["Océan", "Mer"],
        ["Criminel", "Délinquant"],
        ["Manette", "Souris"],
        ["Cathédrale", "Église"],
        ["Shampoing", "Gel douche"],
        ["Boulangerie", "Pâtisserie"],
        ["Lunettes", "Lentilles"],
        ["Miroir", "Vitre"],
        ["Terre", "Mars"],
        ["Koh-Lanta", "Fort Boyard"],
        ["Raclette", "Tartiflette"],
        ["Futuroscope", "Disneyland"],
        ["Pain au chocolat", "Chocolatine"],
        ["Réussite", "Échec"],
        ["Licence", "Master"],
        ["Pâtes", "Nouilles"],
        ["Calvitie", "Mulet"],
        ["Mac", "Windows"],
        ["Burger King", "McDonald's"],
        ["Pacsé", "Marié"],
        ["Fourchette", "Couteau"],
        ["Escalier", "Ascenceur"],
        ["Culpabilité", "Honte"],
        ["Sympathie", "Empathie"],
        ["Illusion", "Hallucination"],
        ["Mythe", "Légende"],
        ["Sable", "Poussière"],
        ["Grotte", "Caverne"],
        ["Brouillard", "Brume"],
        ["Venin", "Poison"],
        ["Bactérie", "Virus"],
        ["Température", "Chaleur"],
        ["Sagesse", "Intelligence"],
        ["Éthique", "Morale"],
        ["Météore", "Météorite"],
        ["Fleuve", "Torrent"],
        ["Fosse", "Gouffre"],
        ["Nuance", "Subtilité"],
        ["Hasard", "Coïncidence"],
        ["Destin", "Fatalité"],
        ["Angoisse", "Anxiété"],
        ["Peur", "Phobie"],
        ["Folie", "Délire"],
        ["Ombre", "Pénombre"],
        ["Reflet", "Silhouette"],
        ["Écho", "Résonance"],
        ["Infini", "Éternité"],
        ["Galaxie", "Constellation"],
        ["Âme", "Esprit"],
        ["Croyance", "Foi"],
        ["Mensonge", "Omission"],
        ["Secret", "Mystère"],
        ["Auteur", "Écrivain"],
        ["Magazine", "Revue"],
        ["Pendule", "Horloge"],
        ["Crâne", "Squelette"],
        ["Labyrinthe", "Dédale"],
        ["Prison", "Donjon"],
        ["Cimetière", "Crypte"],
        ["Désert", "Aridité"],
        ["Falaise", "Ravin"],
        ["Givre", "Verglas"],
        ["Avalanche", "Glissement"],
        ["Typhon", "Cyclone"],
        ["Tsunami", "Raz-de-marée"],
        ["Magma", "Lave"],
        ["Astéroïde", "Comète"],
        ["Cosmos", "Univers"],
        ["Atome", "Molécule"],
        ["Gravité", "Apesanteur"],
        ["Instinct", "Intuition"],
        ["Émotion", "Sentiment"],
        ["Paradoxe", "Contradiction"],
        ["Honneur", "Fierté"],
        ["Vengeance", "Justice"],
        ["Souvenir", "Mémoire"],
        ["Rêve", "Songe"],
        ["Idée", "Concept"],
        ["Théorie", "Hypothèse"],
        ["Méthode", "Technique"],
        ["Stratégie", "Tactique"],
        ["Objectif", "But"],
        ["Moyen", "Outil"],
        ["Principe", "Règle"],
        ["Loi", "Norme"],
        ["Devoir", "Obligation"],
        ["Droit", "Privilège"],
        ["Liberté", "Indépendance"],
        ["Égalité", "Équité"],
        ["Pouvoir", "Autorité"],
        ["Force", "Puissance"],
        ["Courage", "Bravoure"],
        ["Audace", "Témérité"],
        ["Patience", "Persévérance"],
        ["Tolérance", "Acceptation"],
        ["Respect", "Estime"],
        ["Amour", "Passion"],
        ["Amitié", "Camaraderie"],
        ["Alliance", "Coalition"],
        ["Contrat", "Accord"],
        ["Promesse", "Engagement"],
        ["Trahison", "Tromperie"],
        ["Falsification", "Hypocrisie"],
        ["Erreur", "Faute"],
        ["Pardon", "Clémence"],
        ["Punition", "Châtiment"],
        ["Récompense", "Prix"],
        ["Don", "Cadeau"],
        ["Talent", "Génie"],
        ["Compétence", "Aptitude"],
        ["Connaissance", "Savoir"],
        ["Éducation", "Instruction"],
        ["Culture", "Civilisation"],
        ["Tradition", "Coutume"],
        ["Art", "Artisanat"],
        ["Science", "Recherche"],
        ["Invention", "Trouvaille"],
        ["Progrès", "Évolution"],
        ["Changement", "Transformation"],
        ["Début", "Origine"],
        ["Fin", "Terme"],
        ["Limite", "Frontière"],
        ["Hasard", "Chance"],
        ["Sarcasme", "Ironie"],
        ["Mélancolie", "Tristesse"],
        ["Charisme", "Charme"],
        ["Dilemme", "Problème"],
        ["Mélodie", "Harmonie"],
        ["Parfum", "Odeur"],
        ["Colère", "Rage"],
        ["Pitié", "Compassion"],
        ["Gloire", "Renommée"],
        ["Gourmandise", "Avidité"],
        ["Erreur", "Oubli"],
        ["Joie", "Bonheur"],
        ["Dispute", "Conflit"],
        ["Pardon", "Excuse"],
        ["Sourire", "Rire"],
        ["Bruit", "Son"],
        ["Regard", "Vision"],
        ["Geste", "Mouvement"],
        ["Vitesse", "Accélération"],
        ["Ombre", "Reflet"],
        ["Doute", "Incertitude"],
        ["Foi", "Espérance"],
        ["Magie", "Illusion"],
        ["Froid", "Gel"],
        ["Chaud", "Brûlant"],
        ["Sec", "Aride"],
        ["Humide", "Mouillé"],
        ["Lisse", "Doux"],
        ["Rond", "Cercle"],
        ["Carré", "Rectangle"],
        ["Rouge", "Bordeaux"],
        ["Bleu", "Cyan"],
        ["Vert", "Kaki"],
        ["Jaune", "Or"],
        ["Blanc", "Gris"],
        ["Noir", "Sombre"],
        ["Jour", "Matin"],
        ["Nuit", "Soir"],
        ["Survirage", "Sous-virage"],
        ["Diffuseur", "Aileron"],
        ["Monoplace", "Karting"],
        ["Circuit", "Piste"],
        ["Asphalte", "Bitume"],
        ["Paddock", "Stand"],
        ["Qualifications", "Course"],
        ["Visière", "Casque"],
        ["Dérapage", "Glissade"],
        ["Freinage", "Ralentissement"],
        ["Lewis Hamilton", "Michael Schumacher"],
        ["Maquette", "Prototype"],
        ["Wireframe", "Zoning"],
        ["Interface", "Expérience"],
        ["Police", "Typographie"],
        ["Marge", "Espacement"],
        ["Bouton", "Lien"],
        ["Code", "Script"],
        ["Branche", "Commit"],
        ["Hébergement", "Serveur"],
        ["Balise", "Attribut"],
        ["Header", "Footer"],
        ["Variable", "Fonction"],
        ["Résolution", "Définition"],
        ["Contraste", "Luminosité"],
        ["Acoustique", "Instrumental"],
        ["Refrain", "Couplet"],
        ["Rythme", "Tempo"],
        ["Album", "EP"],
        ["Concert", "Festival"],
        ["Écoute", "Audition"],
        ["Odorat", "Flair"],
        ["Goût", "Saveur"],
        ["Toucher", "Contact"],
        ["Sens", "Direction"],
        ["Chemin", "Route"],
        ["Sentier", "Piste"],
        ["Forêt", "Bois"],
        ["Arbre", "Plante"],
        ["Fleur", "Bourgeon"],
        ["Graine", "Pépin"],
        ["Fruit", "Légume"],
        ["Viande", "Poisson"],
        ["Eau", "Liquide"],
        ["Verre", "Cristal"],
        ["Métal", "Fer"],
        ["Or", "Argent"],
        ["Pierre", "Roche"],
        ["Caillou", "Gravier"],
        ["Montagne", "Colline"],
        ["Sommet", "Pic"],
        ["Vallée", "Plaine"],
        ["Nuage", "Ciel"],
        ["Pluie", "Averse"],
        ["Vent", "Souffle"],
        ["Feu", "Flamme"],
        ["Cendre", "Braise"],
        ["Terre", "Sol"],
        ["Monde", "Planète"],
        ["Univers", "Espace"],
      ]
    },
    {
      key: "metier",
      label: "Métier UX / Web",
      desc: "Vocabulaire design, dev et vie de bureau.",
      pairs: [
        ["Delmas", "Louveton"],
        ["UX", "UI"],
        ["Zoning", "Wireframe"],
        ["Maquette", "Prototype"],
        ["Illustrator", "Photoshop"],
        ["Accessibilité", "Ergonomie"],
        ["Serif", "Sans-serif"],
        ["Montserrat", "Times New Roman"],
        ["WebP", "AVIF"],
        ["Header", "Footer"],
        ["Bouton", "Lien"],
        ["CDI", "CDD"],
        ["Freelance", "Chômeur"],
        ["Figma", "Adobe Xd"],
        ["Auto-entreprise", "Société"],
        ["Logo", "Charte graphique"],
        ["Front-end", "Back-end"],
        ["Margin", "Padding"],
      ]
    },
    {
      key: "sportauto",
      label: "Sport auto",
      desc: "Formule 1, courses et pilotes.",
      pairs: [
        ["Ferrari", "Lamborghini"],
        ["Peugeot", "Renault"],
        ["F1", "Karting"],
        ["Formule 1", "Formule E"],
        ["Lewis Hamilton", "Michael Schumacher"],
        ["Ayrton Senna", "Alain Prost"],
        ["Chauffeur", "Pilote"],
        ["Pneu", "Roue"],
        ["Accélérer", "Freiner"],
        ["Chronomètre", "Montre"],
        ["Survirage", "Sous-virage"],
        ["Moteur", "Batterie"],
        ["Aileron Avant", "Aileron Arrière"],
        ["DRS", "ERS"],
        ["Drapeau rouge", "Drapeau jaune"],
        ["Voiture de sécurité", "Voiture médicale"],
        ["Qualification", "Grand Prix"],
        ["Pneu soft", "Pneu dur"],
        ["Pneu inter", "Pneu pluie"],
        ["Halo", "Casque"],
        ["WRC", "WEC"],
        ["Le Mans", "Indianapolis"],
        ["Monaco", "Monza"],
        ["Spa-Francorchamps", "Silverstone"],
        ["Ingénieur", "Mécanicien"],
        ["Sponsor", "Écurie"],
        ["Simulateur", "Piste"],
        ["Podium", "Trophée"],
        ["Championnat", "Classement"],
        ["Max Verstappen", "Charles Leclerc"],
        ["Fernando Alonso", "Sebastian Vettel"],
        ["Niki Lauda", "James Hunt"],
        ["Sébastien Loeb", "Sébastien Ogier"],
        ["Esteban Ocon", "Pierre Gasly"],
        ["Lando Norris", "George Russell"],
        ["Mercedes", "Red Bull"],
        ["McLaren", "Aston Martin"],
        ["Alpine", "Haas"],
        ["Porsche", "Audi"],
        ["Michelin", "Pirelli"],
        ["Undercut", "Overcut"],
        ["Graining", "Blistering"],
        ["DNF", "DNS"],
        ["Combinaison", "Gants"],
      ]
    },
    {
      key: "popculture",
      label: "Cinéma & Pop culture",
      desc: "Super-héros, films et personnages cultes.",
      pairs: [
        ["Flash", "Flash McQueen"],
        ["Batman", "Ironman"],
        ["Hulk", "RedHulk"],
        ["Woody", "Buzz l'Eclair"],
        ["John Wick", "Tyler Rake"],
        ["Terminator", "Robocop"],
        ["Godzilla", "King Kong"],
        ["Agent 47", "Jason Bourne"],
        ["Cendrillon", "Blanche-Neige"],
        ["Lilo", "Stitch"],
        ["Belle", "Bête"],
        ["Mickey", "Minnie"],
        ["Jedi", "Sith"],
        ["Marvel", "DC Comics"],
        ["Gryffondor", "Serpentard"],
        ["Harry Potter", "Ron Weasley"],
        ["Gandalf", "Dumbledore"],
        ["Superman", "Captain America"],
        ["Spiderman", "Venom"],
        ["Thor", "Loki"],
        ["Deadpool", "Wolverine"],
        ["Mario", "Luigi"],
        ["Bowser", "Donkey Kong"],
        ["Link", "Zelda"],
        ["Pikachu", "Dracaufeu"],
        ["Sacha", "Ondine"],
        ["Goku", "Vegeta"],
        ["Naruto", "Sasuke"],
        ["Luffy", "Zoro"],
        ["Tintin", "Milou"],
        ["Astérix", "Obélix"],
        ["Luke Skywalker", "Dark Vador"],
        ["Yoda", "Obi-Wan Kenobi"],
        ["Han Solo", "Chewbacca"],
        ["R2-D2", "C-3PO"],
        ["Indiana Jones", "Lara Croft"],
        ["James Bond", "Ethan Hunt"],
        ["Shrek", "L'Âne"],
        ["Fiona", "Raiponce"],
        ["Simba", "Mufasa"],
        ["Scar", "Jafar"],
        ["Aladdin", "Peter Pan"],
        ["Mulan", "Pocahontas"],
        ["Ariel", "Elsa"],
        ["Donald", "Dingo"],
        ["Picsou", "Riri"],
        ["Tom", "Jerry"],
        ["Titi", "Grosminet"],
        ["Bugs Bunny", "Daffy Duck"],
        ["Homer", "Bart"],
        ["Marge", "Lisa"],
        ["Rick", "Morty"],
        ["Cartman", "Kenny"],
        ["Bob l'éponge", "Patrick"],
        ["Scooby-Doo", "Sammy"],
        ["Fred", "Daphné"],
        ["Dracula", "Frankenstein"],
        ["Loup-garou", "Vampire"],
        ["Zombie", "Fantôme"],
        ["Momie", "Sorcière"],
        ["Alien", "Predator"],
        ["Groot", "Rocket"],
        ["Star-Lord", "Gamora"],
        ["Thanos", "Dr Doom"],
        ["Joker", "Harley Quinn"],
        ["Aquaman", "Namor"],
        ["Wonder Woman", "Supergirl"],
        ["Flash", "Quicksilver"],
        ["Cyborg", "Vision"],
        ["Ant-Man", "La Guêpe"],
        ["Black Panther", "Faucon"],
        ["Daredevil", "Punisher"],
        ["Professeur X", "Magneto"],
        ["Cyclope", "Jean Grey"],
        ["Tornade", "Malicia"],
        ["Katniss Everdeen", "Peeta Mellark"],
        ["Jacob Black", "Charlie Swan"],
        ["Hermione Granger", "Drago Malefoy"],
        ["Voldemort", "Gollum"],
        ["Inspecteur Gadget", "Hercule Poirot"],
        ["Tortues Ninja", "Splinter"],
        ["Optimus Prime", "Megatron"],
        ["Bumblebee", "Starscream"],
        ["Sonic", "Knuckles"],
        ["Pac-Man", "Tetris"],
      ]
    },
    {
      key: "celebrites",
      label: "Célébrités & Sosies",
      desc: "Stars, DJ, sportifs et leurs faux jumeaux.",
      pairs: [
        ["Ryan Gosling", "Ryan Reynolds"],
        ["Tom Holland", "Tom Hanks"],
        ["Tom Cruise", "Tom Felton"],
        ["Chris Hemsworth", "Chris Evans"],
        ["Emma Stone", "Emma Watson"],
        ["Will Smith", "Will Ferrell"],
        ["Jennifer Lawrence", "Jennifer Lopez"],
        ["James Cameron", "James Wan"],
        ["Emma Stone", "Emma Thompson"],
        ["Kevin Bacon", "Kevin Hart"],
        ["Dwayne Johnson", "The Rock"],
        ["Tom Holland", "François Hollande"],
        ["Squeezie", "Cyprien"],
        ["David Guetta", "DJ Snake"],
        ["Zinedine Zidane", "Didier Deschamps"],
        ["Ousmane Dembélé", "Kylian Mbappé"],
        ["Laurent Manaudou", "Léon Marchand"],
        ["Pierre Niney", "Pierre Gasly"],
        ["François Civil", "François Cluzet"],
        ["Jean Dujardin", "Jean Reno"],
        ["Jonathan Cohen", "Jonathan Lambert"],
        ["Philippe Lacheau", "Philippe Katerine"],
        ["Gérard Depardieu", "Gérard Jugnot"],
        ["Alain Chabat", "Alain Delon"],
        ["Paul Walker", "Paul Rudd"],
        ["Julien Doré", "Julien Clerc"],
        ["George Clooney", "George Lucas"],
        ["Steve Jobs", "Steve Carell"],
        ["Daniel Radcliffe", "Daniel Craig"],
        ["Harrison Ford", "Henry Ford"],
        ["Matthew Perry", "Katy Perry"],
        ["Cillian Murphy", "Eddie Murphy"],
        ["Michael Schumacher", "Michael Jordan"],
        ["Antoine Griezmann", "Antoine Dupont"],
        ["Teddy Riner", "Teddy Thomas"],
        ["Lewis Hamilton", "Carl Lewis"],
        ["Mark Zuckerberg", "Mark Wahlberg"],
        ["Tim Cook", "Tim Burton"],
        ["Jeff Bezos", "Jeff Goldblum"],
        ["David Guetta", "David Bowie"],
        ["Justin Bieber", "Justin Timberlake"],
        ["DJ Snake", "DJ Khaled"],
        ["John Lennon", "John Legend"],
        ["Adele", "Adèle Castillon"],
        ["Lady Gaga", "Lady Diana"],
        ["Bruno Mars", "Bruno Le Maire"],
        ["George Michael", "George Clooney"],
        ["Logan Paul", "Paul Walker"],
        ["Charlie D'Amelio", "Charlie Chaplin"],
        ["Seb la Frite", "Sébastien Loeb"],
        ["Mcfly", "Marty McFly"],
        ["David Lafarge", "David Guetta"],
        ["Antoine Daniel", "Antoine Dupont"],
        ["Zack Nani", "Zack Snyder"],
        ["Pierre Croce", "Pierre Richard"],
        ["Thomas Angelvy", "Thomas Pesquet"],
        ["Mister MV", "Mister V"],
        ["Domingo", "Doflamingo"],
        ["Adrien Nougaret", "Adrien Brody"],
        ["Corentin Houssein", "Barack Hussein Obama"],
        ["Ayrton Senna", "John Cena"],
        ["Victor Wembanyama", "Victor Hugo"],
        ["Serena Williams", "Robbie Williams"],
        ["Bruce Willis", "Bruce Lee"],
        ["Camille Cottin", "Camille Combal"],
        ["Marion Cotillard", "Marion Maréchal"],
        ["Morgan Freeman", "Morgane Make Up"],
        ["Martin Scorsese", "Martin Luther King"],
        ["Gordon Ramsay", "James Gordon"],
        ["Ethan Hunt", "Ethan Hawke"],
        ["John Wick", "John Travolta"],
        ["Indiana Jones", "Bridget Jones"],
        ["James Bond", "LeBron James"],
        ["Jason Bourne", "Jason Statham"],
        ["Luke Skywalker", "Luke Evans"],
        ["Sarah Connor", "Sarah Cameron"],
        ["Lara Croft", "Lara Fabian"],
        ["Kevin Costner", "Kevin De Bruyne"],
        ["Frank Martin", "Frank Sinatra"]
      ]
    },
    {
      key: "jeuxdemots",
      label: "Jeux de mots",
      desc: "Calembours autour de noms de célébrités.",
      pairs: [
        ["Jérémy Ferrari", "Ferrari"],
        ["Arnaud Tsamère", "Ta mère"],
        ["Jean Dujardin", "Jardin"],
        ["Christian Clavier", "Clavier"],
        ["Thierry Lhermitte", "Ermite"],
        ["Jean Reno", "Renault"],
        ["Marc Lavoine", "Avoine"],
        ["Omar Sy", "Scie"],
        ["Jean Rochefort", "Roquefort"],
        ["Céline Dion", "Pion"],
        ["David Douillet", "Douillet"],
        ["Michel Blanc", "Blanc"],
        ["Julien Clerc", "Clair"],
        ["Vin Diesel", "Diesel"],
        ["Harrison Ford", "Ford"],
        ["Kevin Bacon", "Bacon"],
        ["Nicolas Cage", "Cage"],
        ["Taylor Swift", "Suzuki Swift"],
        ["Bruno Mars", "Mars"],
        ["Brad Pitt", "Pit stop"],
        ["50 Cent", "50 centimes"],
        ["Eminem", "M&M's"],
        ["James Bond", "Bon"],
        ["Stephen King", "Burger King"],
        ["Emmanuel Macron", "Macaron"],
        ["Katy Perry", "Perrier"],
        ["Elton John", "Jaune"],
        ["Tom Cruise", "Croisière"],
        ["Tiger Woods", "Bois"],
        ["Megan Fox", "Renard"],
        ["Steve Jobs", "Pôle Emploi"],
        ["Justin Timberlake", "Lac"],
        ["Gérard Depardieu", "Dieu"],
        ["Brad Pitt", "Pitre"],
        ["Kylian Mbappé", "Canapé"],
        ["Léa Salamé", "Salami"],
        ["Gilles Lellouche", "Louche"],
        ["Alain Delon", "Melon"],
        ["Florent Pagny", "Panier"],
        ["Paul Mirabel", "Mirabelle"],
        ["Vincent Cassel", "Vaisselle"],
        ["Cyril Lignac", "Cognac"],
        ["Jean Castex", "Casse-tête"],
        ["Teddy Riner", "Dîner"],
        ["Matt Damon", "Démon"],
        ["Snoop Dogg", "Hot-dog"],
        ["Travis Scott", "Scoot"],
        ["Post Malone", "Boîte aux lettres"],
        ["Ice Spice", "Piment"],
        ["Machine Gun Kelly", "Fusil"],
        ["Rick Ross", "Gros"]
      ]
    },
    {
      key: "homophones",
      label: "Homophones",
      desc: "Mots qui se prononcent pareil, sens différent.",
      pairs: [
        ["Verre", "Ver"],
        ["Sceau", "Sot"],
        ["Chêne", "Chaîne"],
        ["Auteur", "Hauteur"],
        ["Plaine", "Pleine"],
        ["Sel", "Selle"],
        ["Tique", "Tic"],
        ["Fil", "Fils"],
        ["Pouce", "Pousse"],
        ["Cerf", "Serre"],
        ["Poing", "Point"],
        ["Taux", "Tôt"],
        ["Poil", "Poêle"],
        ["Vers", "Vert"],
        ["Coup", "Cou"],
        ["Faim", "Fin"],
        ["Pâte", "Patte"],
        ["Cygne", "Signe"],
        ["Sale", "Salle"],
        ["Vin", "Vingt"],
        ["Sain", "Saint"],
        ["Père", "Pai"],
        ["Repaire", "Repère"],
        ["Conte", "Compte"],
        ["Lait", "Laid"],
        ["Malle", "Mâle"],
        ["Toux", "Tout"],
        ["Roue", "Roux"],
        ["Cœur", "Chœur"],
        ["Saut", "Seau"],
        ["Dans", "Dent"],
        ["Pari", "Paris"],
        ["Sang", "Sans"],
        ["Cuire", "Cuir"],
        ["Boue", "Bout"],
        ["Amande", "Amende"],
        ["Pause", "Pose"],
        ["Tente", "Tante"],
        ["Mer", "Maire"],
        ["Sang", "Cent"],
        ["Voix", "Voie"],
        ["Poids", "Pois"],
        ["Mètre", "Maître"],
        ["Porc", "Port"],
        ["Reine", "Renne"],
        ["Chant", "Champ"],
      ]
    },
  ];

  function getTheme(key) {
    return WORD_THEMES.filter(function (t) {
      return t.key === key;
    })[0];
  }

  function pairId(themeKey, pair) {
    return themeKey + '::' + pair[0] + '::' + pair[1];
  }

  var PAIR_STORAGE_KEY = 'undercover_used_pairs_v1';

  function loadUsedPairs() {
    try {
      var raw = window.localStorage.getItem(PAIR_STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveUsedPairs() {
    try {
      window.localStorage.setItem(PAIR_STORAGE_KEY, JSON.stringify(usedPairsMap));
    } catch (e) {}
  }

  var usedPairsMap = loadUsedPairs();

  var THEME_STORAGE_KEY = 'undercover_theme_v1';
  var TIMER_STORAGE_KEY = 'undercover_timer_settings_v1';
  var SCORE_STORAGE_KEY = 'undercover_score_log_v1';
  var MAX_SCORE_ENTRIES = 200;

  function loadTimerSettings() {
    try {
      var raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function saveTimerSettings() {
    try {
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
        enabled: state.timerEnabled,
        durationMin: state.timerDurationMin
      }));
    } catch (e) {}
  }

  function loadScoreLog() {
    try {
      var raw = window.localStorage.getItem(SCORE_STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveScoreLog() {
    try {
      window.localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scoreLog.slice(0, MAX_SCORE_ENTRIES)));
    } catch (e) {}
  }

  var scoreLog = loadScoreLog();

  var MIN_PLAYERS = 3;
  var MAX_PLAYERS = 20;
  var MIN_UNDERCOVER = 1;

  function maxImpostors(playerCount) {
    return Math.max(MIN_UNDERCOVER, Math.ceil(playerCount / 2) - 1);
  }

  var ROLE_INFO = {
    idiot: {
      label: 'Idiot du village',
      desc: 'Si tu es éliminé dès le tout premier vote, tu gagnes la partie à toi seul !'
    },
    fantome: {
      label: 'Fantôme',
      desc: 'Même éliminé, tu pourras continuer à voter aux prochains tours.'
    },
    mime: {
      label: 'Mime',
      desc: 'Décris ton mot uniquement par gestes, sans jamais parler.'
    },
    procureur: {
      label: 'Procureur',
      desc: 'En cas d\'égalité au vote, c\'est toi qui trancheras qui est éliminé.'
    }
  };

  var state = {
    playerCount: 6,
    undercoverCount: 1,
    mrWhiteCount: 0,
    espionCount: 0,
    roles: {
      idiot: false,
      fantome: false,
      mime: false,
      procureur: false,
      amoureux: false
    },
    players: [],
    round: 1,
    selectedThemes: {
      classique: true
    },
    openCardId: null,
    phase: 'reveal',
    pendingEliminationId: null,
    voteCount: 0,
    winner: null,
    winnerDetail: '',
    winnerReason: '',
    civilWordHint: '',
    timerEnabled: false,
    timerDurationMin: 3,
    timerRemaining: 0,
    timerRunning: false,
    timerHasEnded: false,
    timerStartedRound: false
  };

  var el = {
    setupScreen: document.getElementById('setup'),
    gameScreen: document.getElementById('game'),
    countMinus: document.getElementById('countMinus'),
    countPlus: document.getElementById('countPlus'),
    countDisplay: document.getElementById('countDisplay'),
    underMinus: document.getElementById('underMinus'),
    underPlus: document.getElementById('underPlus'),
    underDisplay: document.getElementById('underDisplay'),
    underRange: document.getElementById('underRange'),
    mrwhiteMinus: document.getElementById('mrwhiteMinus'),
    mrwhitePlus: document.getElementById('mrwhitePlus'),
    mrwhiteDisplay: document.getElementById('mrwhiteDisplay'),
    mrwhiteRange: document.getElementById('mrwhiteRange'),
    espionMinus: document.getElementById('espionMinus'),
    espionPlus: document.getElementById('espionPlus'),
    espionDisplay: document.getElementById('espionDisplay'),
    espionRange: document.getElementById('espionRange'),
    roleIdiot: document.getElementById('roleIdiot'),
    roleFantome: document.getElementById('roleFantome'),
    roleMime: document.getElementById('roleMime'),
    roleProcureur: document.getElementById('roleProcureur'),
    roleAmoureux: document.getElementById('roleAmoureux'),
    themesGrid: document.getElementById('themesGrid'),
    namesGrid: document.getElementById('namesGrid'),
    startBtn: document.getElementById('startBtn'),
    rulesToggle: document.getElementById('rulesToggle'),
    rulesText: document.getElementById('rulesText'),
    themesSummary: document.getElementById('themesSummary'),
    rolesSummary: document.getElementById('rolesSummary'),
    setupRecap: document.getElementById('setupRecap'),

    timerEnabledInput: document.getElementById('timerEnabled'),
    timerDurationField: document.getElementById('timerDurationField'),
    timerMinus: document.getElementById('timerMinus'),
    timerPlus: document.getElementById('timerPlus'),
    timerDisplaySetup: document.getElementById('timerDisplay'),
    timerSummary: document.getElementById('timerSummary'),

    themeToggle: document.getElementById('themeToggle'),

    scoreLogToggle: document.getElementById('scoreLogToggle'),
    scoreLogBtnGame: document.getElementById('scoreLogBtnGame'),
    scoreModal: document.getElementById('scoreModal'),
    scoreScrim: document.getElementById('scoreScrim'),
    scoreEmptyState: document.getElementById('scoreEmptyState'),
    scoreContent: document.getElementById('scoreContent'),
    scoreLeaderboard: document.getElementById('scoreLeaderboard'),
    scoreHistory: document.getElementById('scoreHistory'),
    scoreResetBtn: document.getElementById('scoreResetBtn'),
    closeScoreBtn: document.getElementById('closeScoreBtn'),

    roundNumber: document.getElementById('roundNumber'),
    playerCountLabel: document.getElementById('playerCountLabel'),
    viewedCount: document.getElementById('viewedCount'),
    totalCount: document.getElementById('totalCount'),
    progressFill: document.getElementById('progressFill'),
    statusBanner: document.getElementById('statusBanner'),
    tableNote: document.getElementById('tableNote'),
    roundRolesBanner: document.getElementById('roundRolesBanner'),
    cardsGrid: document.getElementById('cardsGrid'),

    discussionTimer: document.getElementById('discussionTimer'),
    discussionTimerDisplay: document.getElementById('discussionTimerDisplay'),
    discussionTimerFill: document.getElementById('discussionTimerFill'),
    discussionTimerToggle: document.getElementById('discussionTimerToggle'),
    discussionTimerExtend: document.getElementById('discussionTimerExtend'),

    voteSection: document.getElementById('voteSection'),
    eliminatedList: document.getElementById('eliminatedList'),
    voteGrid: document.getElementById('voteGrid'),
    startVoteBtn: document.getElementById('startVoteBtn'),

    gameOverBanner: document.getElementById('gameOverBanner'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverSub: document.getElementById('gameOverSub'),

    summaryBtn: document.getElementById('summaryBtn'),
    newRoundBtn: document.getElementById('newRoundBtn'),
    resetBtn: document.getElementById('resetBtn'),

    wordModal: document.getElementById('wordModal'),
    modalOwner: document.getElementById('modalOwner'),
    modalRole: document.getElementById('modalRole'),
    modalWord: document.getElementById('modalWord'),
    modalBadges: document.getElementById('modalBadges'),
    hideWordBtn: document.getElementById('hideWordBtn'),

    voteConfirmModal: document.getElementById('voteConfirmModal'),
    voteConfirmName: document.getElementById('voteConfirmName'),
    voteConfirmCancel: document.getElementById('voteConfirmCancel'),
    voteConfirmYes: document.getElementById('voteConfirmYes'),

    eliminationModal: document.getElementById('eliminationModal'),
    elimName: document.getElementById('elimName'),
    elimRole: document.getElementById('elimRole'),
    elimContinueText: document.getElementById('elimContinueText'),
    elimContinueBtn: document.getElementById('elimContinueBtn'),

    summaryModal: document.getElementById('summaryModal'),
    summaryScrim: document.getElementById('summaryScrim'),
    summaryList: document.getElementById('summaryList'),
    closeSummaryBtn: document.getElementById('closeSummaryBtn'),
    summaryNewRoundBtn: document.getElementById('summaryNewRoundBtn'),

    toast: document.getElementById('toast'),
    srAnnounce: document.getElementById('srAnnounce')
  };

  var toastTimer = null;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function randomInt(maxExclusive) {
    return Math.floor(Math.random() * maxExclusive);
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('toast--show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('toast--show');
    }, 2600);
  }

  function announce(message) {
    el.srAnnounce.textContent = message;
  }

  function vibrate(pattern) {
    try {
      if (window.navigator && typeof window.navigator.vibrate === 'function') {
        window.navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  function loadTheme() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    var isLight = theme === 'light';
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (el.themeToggle) {
      el.themeToggle.setAttribute('aria-pressed', String(isLight));
      el.themeToggle.setAttribute('aria-label', isLight ? 'Passer en mode sombre' : 'Passer en mode clair');
    }
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isLight ? '#f1ecdd' : '#10161a');
    }
  }

  function initTheme() {
    var saved = loadTheme();
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  }

  if (el.themeToggle) {
    el.themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      applyTheme(next);
      saveTheme(next);
    });
  }

  initTheme();

  function renderNameFields() {
    var count = state.playerCount;
    var existing = el.namesGrid.querySelectorAll('input[data-name-input]');
    var previousValues = [];
    existing.forEach(function (input) {
      previousValues.push(input.value);
    });

    el.namesGrid.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var wrap = document.createElement('div');
      wrap.className = 'name-field';

      var label = document.createElement('label');
      label.setAttribute('for', 'nameInput' + i);
      label.textContent = 'Joueur ' + (i + 1);

      var input = document.createElement('input');
      input.type = 'text';
      input.id = 'nameInput' + i;
      input.maxLength = 20;
      input.setAttribute('data-name-input', 'true');
      input.placeholder = 'Joueur ' + (i + 1);
      if (previousValues[i]) input.value = previousValues[i];

      wrap.appendChild(label);
      wrap.appendChild(input);
      el.namesGrid.appendChild(wrap);
    }
  }

  function updateCounter() {
    el.countDisplay.textContent = state.playerCount;
    el.countMinus.disabled = state.playerCount <= MIN_PLAYERS;
    el.countPlus.disabled = state.playerCount >= MAX_PLAYERS;
    renderSetupRecap();
  }

  function clampRoleCounts() {
    var cap = maxImpostors(state.playerCount);
    state.undercoverCount = clamp(state.undercoverCount, MIN_UNDERCOVER, cap);
    state.mrWhiteCount = clamp(state.mrWhiteCount, 0, Math.max(0, cap - state.undercoverCount));
    state.espionCount = clamp(state.espionCount, 0, Math.max(0, cap - state.undercoverCount - state.mrWhiteCount));
  }

  function updateUnderCounter() {
    clampRoleCounts();
    var cap = maxImpostors(state.playerCount);
    var underMax = Math.max(MIN_UNDERCOVER, cap - state.mrWhiteCount - state.espionCount);
    var mrwhiteMax = Math.max(0, cap - state.undercoverCount - state.espionCount);
    var espionMax = Math.max(0, cap - state.undercoverCount - state.mrWhiteCount);

    el.underDisplay.textContent = state.undercoverCount;
    el.underRange.textContent = 'de ' + MIN_UNDERCOVER + ' à ' + underMax;
    el.underMinus.disabled = state.undercoverCount <= MIN_UNDERCOVER;
    el.underPlus.disabled = state.undercoverCount >= underMax;

    el.mrwhiteDisplay.textContent = state.mrWhiteCount;
    el.mrwhiteRange.textContent = 'de 0 à ' + mrwhiteMax;
    el.mrwhiteMinus.disabled = state.mrWhiteCount <= 0;
    el.mrwhitePlus.disabled = state.mrWhiteCount >= mrwhiteMax;

    el.espionDisplay.textContent = state.espionCount;
    el.espionRange.textContent = 'de 0 à ' + espionMax;
    el.espionMinus.disabled = state.espionCount <= 0;
    el.espionPlus.disabled = state.espionCount >= espionMax;

    renderRolesSummary();
  }

  el.countMinus.addEventListener('click', function () {
    var wasAtLeast8 = state.playerCount >= 8;
    state.playerCount = clamp(state.playerCount - 1, MIN_PLAYERS, MAX_PLAYERS);
    updateCounter();
    updateUnderCounter();
    renderNameFields();
    if (state.roles.amoureux && wasAtLeast8 && state.playerCount < 8) {
      showToast('Les Amoureux avec moins de 8 joueurs peut ne pas offrir une expérience de jeu optimale.');
    }
  });

  el.countPlus.addEventListener('click', function () {
    state.playerCount = clamp(state.playerCount + 1, MIN_PLAYERS, MAX_PLAYERS);
    updateCounter();
    updateUnderCounter();
    renderNameFields();
  });

  el.underMinus.addEventListener('click', function () {
    state.undercoverCount = clamp(state.undercoverCount - 1, MIN_UNDERCOVER, maxImpostors(state.playerCount));
    updateUnderCounter();
  });

  el.underPlus.addEventListener('click', function () {
    var cap = maxImpostors(state.playerCount);
    state.undercoverCount = clamp(state.undercoverCount + 1, MIN_UNDERCOVER, Math.max(MIN_UNDERCOVER, cap - state.mrWhiteCount - state.espionCount));
    updateUnderCounter();
  });

  el.mrwhiteMinus.addEventListener('click', function () {
    state.mrWhiteCount = clamp(state.mrWhiteCount - 1, 0, maxImpostors(state.playerCount));
    updateUnderCounter();
  });

  el.mrwhitePlus.addEventListener('click', function () {
    var cap = maxImpostors(state.playerCount);
    state.mrWhiteCount = clamp(state.mrWhiteCount + 1, 0, Math.max(0, cap - state.undercoverCount - state.espionCount));
    updateUnderCounter();
  });

  el.espionMinus.addEventListener('click', function () {
    state.espionCount = clamp(state.espionCount - 1, 0, maxImpostors(state.playerCount));
    updateUnderCounter();
  });

  el.espionPlus.addEventListener('click', function () {
    var cap = maxImpostors(state.playerCount);
    state.espionCount = clamp(state.espionCount + 1, 0, Math.max(0, cap - state.undercoverCount - state.mrWhiteCount));
    updateUnderCounter();
  });

  el.roleIdiot.addEventListener('change', function () {
    state.roles.idiot = el.roleIdiot.checked;
    renderRolesSummary();
  });
  el.roleFantome.addEventListener('change', function () {
    state.roles.fantome = el.roleFantome.checked;
    renderRolesSummary();
  });
  el.roleMime.addEventListener('change', function () {
    state.roles.mime = el.roleMime.checked;
    renderRolesSummary();
  });
  el.roleProcureur.addEventListener('change', function () {
    state.roles.procureur = el.roleProcureur.checked;
    renderRolesSummary();
  });
  el.roleAmoureux.addEventListener('change', function () {
    state.roles.amoureux = el.roleAmoureux.checked;
    renderRolesSummary();
    if (state.roles.amoureux && state.playerCount < 8) {
      showToast('Les Amoureux avec moins de 8 joueurs peut ne pas offrir une expérience de jeu optimale.');
    }
  });

  var TIMER_MIN_DURATION = 1;
  var TIMER_MAX_DURATION = 15;

  function renderTimerSetupUI() {
    if (el.timerEnabledInput) el.timerEnabledInput.checked = state.timerEnabled;
    if (el.timerDurationField) el.timerDurationField.style.display = state.timerEnabled ? '' : 'none';
    if (el.timerDisplaySetup) el.timerDisplaySetup.textContent = state.timerDurationMin;
    if (el.timerMinus) el.timerMinus.disabled = state.timerDurationMin <= TIMER_MIN_DURATION;
    if (el.timerPlus) el.timerPlus.disabled = state.timerDurationMin >= TIMER_MAX_DURATION;
    if (el.timerSummary) {
      el.timerSummary.textContent = state.timerEnabled ?
        (state.timerDurationMin + ' min') : 'Désactivé';
    }
    renderSetupRecap();
  }

  if (el.timerEnabledInput) {
    el.timerEnabledInput.addEventListener('change', function () {
      state.timerEnabled = el.timerEnabledInput.checked;
      saveTimerSettings();
      renderTimerSetupUI();
    });
  }

  if (el.timerMinus) {
    el.timerMinus.addEventListener('click', function () {
      state.timerDurationMin = clamp(state.timerDurationMin - 1, TIMER_MIN_DURATION, TIMER_MAX_DURATION);
      saveTimerSettings();
      renderTimerSetupUI();
    });
  }

  if (el.timerPlus) {
    el.timerPlus.addEventListener('click', function () {
      state.timerDurationMin = clamp(state.timerDurationMin + 1, TIMER_MIN_DURATION, TIMER_MAX_DURATION);
      saveTimerSettings();
      renderTimerSetupUI();
    });
  }

  (function initTimerSettings() {
    var saved = loadTimerSettings();
    if (saved) {
      if (typeof saved.enabled === 'boolean') state.timerEnabled = saved.enabled;
      if (typeof saved.durationMin === 'number') {
        state.timerDurationMin = clamp(saved.durationMin, TIMER_MIN_DURATION, TIMER_MAX_DURATION);
      }
    }
    renderTimerSetupUI();
  })();

  function renderThemeToggles() {
    el.themesGrid.innerHTML = '';
    WORD_THEMES.forEach(function (theme) {
      var label = document.createElement('label');
      label.className = 'toggle-item';

      var input = document.createElement('input');
      input.type = 'checkbox';
      input.id = 'theme-' + theme.key;
      input.checked = !!state.selectedThemes[theme.key];
      input.addEventListener('change', function () {
        state.selectedThemes[theme.key] = input.checked;
        renderThemesSummary();
      });

      var span = document.createElement('span');

      var titleRow = document.createElement('span');
      titleRow.className = 'toggle-item__title-row';
      var strong = document.createElement('strong');
      strong.textContent = theme.label;
      var count = document.createElement('span');
      count.className = 'toggle-item__count';
      count.textContent = theme.pairs.length + ' paires';
      titleRow.appendChild(strong);
      titleRow.appendChild(count);

      var small = document.createElement('small');
      small.textContent = theme.desc;

      span.appendChild(titleRow);
      span.appendChild(small);

      label.appendChild(input);
      label.appendChild(span);
      el.themesGrid.appendChild(label);
    });
    renderThemesSummary();
  }

  function renderThemesSummary() {
    if (el.themesSummary) {
      var n = selectedThemeKeys().length;
      el.themesSummary.textContent = n === 0 ?
        'Aucun thème sélectionné' :
        (n + (n > 1 ? ' thèmes sélectionnés' : ' thème sélectionné'));
    }
    renderSetupRecap();
  }

  function renderRolesSummary() {
    if (el.rolesSummary) {
      var parts = [];
      if (state.mrWhiteCount > 0) parts.push(state.mrWhiteCount + ' Mr. White');
      if (state.espionCount > 0) parts.push(state.espionCount + (state.espionCount > 1 ? ' Espions' : ' Espion'));
      var labels = [];
      if (state.roles.idiot) labels.push('Idiot du village');
      if (state.roles.fantome) labels.push('Fantôme');
      if (state.roles.mime) labels.push('Mime');
      if (state.roles.procureur) labels.push('Procureur');
      if (state.roles.amoureux) labels.push('Amoureux');
      if (labels.length) parts.push(labels.join(', '));
      el.rolesSummary.textContent = parts.length ? parts.join(' + ') : 'Aucun rôle activé';
    }
    renderSetupRecap();
  }

  function renderSetupRecap() {
    if (!el.setupRecap) return;
    var chips = [];
    chips.push(state.playerCount + ' joueurs');
    chips.push(state.undercoverCount + (state.undercoverCount > 1 ? ' Undercovers' : ' Undercover'));
    if (state.mrWhiteCount > 0) chips.push(state.mrWhiteCount + ' Mr. White');
    if (state.espionCount > 0) chips.push(state.espionCount + (state.espionCount > 1 ? ' Espions' : ' Espion'));

    var themeCount = selectedThemeKeys().length;
    chips.push(themeCount ? (themeCount + (themeCount > 1 ? ' thèmes' : ' thème')) : 'aucun thème');

    var specialCount = Object.keys(state.roles).filter(function (k) {
      return state.roles[k];
    }).length;
    if (specialCount) {
      chips.push(specialCount + (specialCount > 1 ? ' rôles spéciaux' : ' rôle spécial'));
    }

    if (state.timerEnabled) {
      chips.push('minuteur ' + state.timerDurationMin + ' min');
    }

    el.setupRecap.innerHTML = '';
    chips.forEach(function (text) {
      var chip = document.createElement('span');
      chip.className = 'recap-chip';
      chip.textContent = text;
      el.setupRecap.appendChild(chip);
    });
  }

  function selectedThemeKeys() {
    return WORD_THEMES.filter(function (t) {
        return state.selectedThemes[t.key];
      })
      .map(function (t) {
        return t.key;
      });
  }

  function pickWordPair() {
    var themeKeys = selectedThemeKeys();
    if (!themeKeys.length) themeKeys = ['classique'];

    var pool = [];
    themeKeys.forEach(function (key) {
      var theme = getTheme(key);
      if (!theme) return;
      theme.pairs.forEach(function (pair) {
        pool.push({
          id: pairId(key, pair),
          pair: pair
        });
      });
    });
    if (!pool.length) {
      pool = getTheme('classique').pairs.map(function (pair) {
        return {
          id: pairId('classique', pair),
          pair: pair
        };
      });
    }

    var available = pool.filter(function (entry) {
      return !usedPairsMap[entry.id];
    });
    if (!available.length) {
      pool.forEach(function (entry) {
        delete usedPairsMap[entry.id];
      });
      available = pool.slice();
      showToast('Toutes les paires des thèmes sélectionnés ont été utilisées — le stock repart à zéro.');
    }

    var choice = available[randomInt(available.length)];
    usedPairsMap[choice.id] = true;
    saveUsedPairs();

    var flip = Math.random() < 0.5;
    return {
      civilWord: flip ? choice.pair[0] : choice.pair[1],
      undercoverWord: flip ? choice.pair[1] : choice.pair[0]
    };
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var j = a.length - 1; j > 0; j--) {
      var k = randomInt(j + 1);
      var tmp = a[j];
      a[j] = a[k];
      a[k] = tmp;
    }
    return a;
  }

  function getPlayer(id) {
    return state.players.filter(function (p) {
      return p.id === id;
    })[0];
  }

  function assignRoles() {
    var words = pickWordPair();
    clampRoleCounts();
    var total = state.players.length;
    var cap = maxImpostors(total);
    var undercoverCount = clamp(state.undercoverCount, MIN_UNDERCOVER, cap);
    var mrWhiteCount = clamp(state.mrWhiteCount, 0, Math.max(0, cap - undercoverCount));
    var espionCount = clamp(state.espionCount, 0, Math.max(0, cap - undercoverCount - mrWhiteCount));

    var allIds = state.players.map(function (p) {
      return p.id;
    });
    var shuffledImpostors = shuffle(allIds).slice(0, undercoverCount + mrWhiteCount + espionCount);
    var undercoverIds = {};
    var mrWhiteIds = {};
    var espionIds = {};
    shuffledImpostors.forEach(function (id, idx) {
      if (idx < undercoverCount) undercoverIds[id] = true;
      else if (idx < undercoverCount + mrWhiteCount) mrWhiteIds[id] = true;
      else espionIds[id] = true;
    });

    state.civilWordHint = words.civilWord.charAt(0).toUpperCase();

    state.players.forEach(function (player) {
      player.isUndercover = !!undercoverIds[player.id];
      player.isMrWhite = !!mrWhiteIds[player.id];
      player.isEspion = !!espionIds[player.id];
      player.word = (player.isMrWhite || player.isEspion) ? '' : (player.isUndercover ? words.undercoverWord : words.civilWord);
      player.viewed = false;
      player.eliminated = false;
      player.isIdiot = false;
      player.isFantome = false;
      player.isMime = false;
      player.isProcureur = false;
      player.loverId = null;
    });

    var usedForSpecial = {};
    var skippedRoles = [];

    function availableIds(ids) {
      return ids.filter(function (id) {
        return !usedForSpecial[id];
      });
    }

    if (state.roles.idiot) {
      var civilIds = availableIds(state.players.filter(function (p) {
        return !p.isUndercover && !p.isMrWhite && !p.isEspion;
      }).map(function (p) {
        return p.id;
      }));
      if (civilIds.length) {
        var idiotId = shuffle(civilIds)[0];
        getPlayer(idiotId).isIdiot = true;
        usedForSpecial[idiotId] = true;
      } else {
        skippedRoles.push('Idiot du village');
      }
    }
    if (state.roles.fantome) {
      var fantomeIds = availableIds(allIds);
      if (fantomeIds.length) {
        var fantomeId = shuffle(fantomeIds)[0];
        getPlayer(fantomeId).isFantome = true;
        usedForSpecial[fantomeId] = true;
      } else {
        skippedRoles.push('Fantôme');
      }
    }
    if (state.roles.mime) {
      var mimeIds = availableIds(allIds);
      if (mimeIds.length) {
        var mimeId = shuffle(mimeIds)[0];
        getPlayer(mimeId).isMime = true;
        usedForSpecial[mimeId] = true;
      } else {
        skippedRoles.push('Mime');
      }
    }
    if (state.roles.procureur) {
      var procureurIds = availableIds(allIds);
      if (procureurIds.length) {
        var procureurId = shuffle(procureurIds)[0];
        getPlayer(procureurId).isProcureur = true;
        usedForSpecial[procureurId] = true;
      } else {
        skippedRoles.push('Procureur');
      }
    }
    if (state.roles.amoureux) {
      var amoureuxIds = availableIds(allIds);
      if (amoureuxIds.length >= 2) {
        var pair = shuffle(amoureuxIds).slice(0, 2);
        getPlayer(pair[0]).loverId = pair[1];
        getPlayer(pair[1]).loverId = pair[0];
        usedForSpecial[pair[0]] = true;
        usedForSpecial[pair[1]] = true;
      } else {
        skippedRoles.push('Les Amoureux');
      }
    }

    state.phase = 'reveal';
    state.pendingEliminationId = null;
    state.voteCount = 0;
    state.winner = null;
    state.winnerDetail = '';
    state.winnerReason = '';

    if (skippedRoles.length) {
      showToast('Pas assez de joueurs disponibles pour attribuer : ' + skippedRoles.join(', ') + '.');
    }
  }

  function collectNames() {
    var inputs = el.namesGrid.querySelectorAll('input[data-name-input]');
    var names = [];
    inputs.forEach(function (input, i) {
      var val = input.value.trim();
      names.push(val || ('Joueur ' + (i + 1)));
    });
    return names;
  }

  function startGame() {
    var names = collectNames();
    state.players = names.map(function (name, i) {
      return {
        id: i,
        name: name,
        isUndercover: false,
        isMrWhite: false,
        isEspion: false,
        word: '',
        viewed: false,
        eliminated: false,
        isIdiot: false,
        isFantome: false,
        isMime: false,
        isProcureur: false,
        loverId: null
      };
    });
    state.round = 1;
    assignRoles();
    switchToGameScreen();
  }

  function resetStageUI() {
    el.tableNote.style.display = '';
    el.cardsGrid.style.display = '';
    el.statusBanner.classList.remove('status-banner--show');
    el.voteSection.classList.remove('vote-section--active');
    el.gameOverBanner.classList.remove('game-over-banner--active', 'game-over-banner--civils', 'game-over-banner--undercover');
    el.startVoteBtn.style.display = '';
    el.startVoteBtn.disabled = true;
    el.summaryBtn.classList.add('summary-btn--hidden');
    resetDiscussionTimer();
  }

  function switchToGameScreen() {
    el.setupScreen.classList.remove('screen--active');
    el.gameScreen.classList.add('screen--active');
    resetStageUI();
    renderGameHeader();
    renderCards();
  }

  el.startBtn.addEventListener('click', function () {
    if (state.playerCount < MIN_PLAYERS) {
      showToast('Il faut au moins ' + MIN_PLAYERS + ' joueurs pour lancer une manche.');
      return;
    }
    if (!selectedThemeKeys().length) {
      showToast('Sélectionnez au moins un thème de mots avant de lancer la manche.');
      return;
    }
    startGame();
  });

  function renderGameHeader() {
    el.roundNumber.textContent = state.round;
    el.playerCountLabel.textContent = state.players.length;
    el.totalCount.textContent = state.players.length;
    updateProgress();
    renderRoundRoles();
  }

  function renderRoundRoles() {
    if (!el.roundRolesBanner) return;
    el.roundRolesBanner.innerHTML = '';

    var entries = [];
    var mime = state.players.filter(function (p) {
      return p.isMime;
    })[0];
    var procureur = state.players.filter(function (p) {
      return p.isProcureur;
    })[0];

    if (mime) {
      entries.push({
        icon: '🎭',
        label: 'Mime',
        name: mime.name,
        hint: 'communique uniquement par gestes, sans parler'
      });
    }
    if (procureur) {
      entries.push({
        icon: '⚖️',
        label: 'Procureur',
        name: procureur.name,
        hint: 'tranchera en cas d\'égalité au vote'
      });
    }

    if (!entries.length) {
      el.roundRolesBanner.classList.remove('round-roles--show');
      return;
    }

    entries.forEach(function (entry) {
      var chip = document.createElement('div');
      chip.className = 'round-roles__chip';
      chip.setAttribute('role', 'listitem');

      var icon = document.createElement('span');
      icon.className = 'round-roles__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = entry.icon;

      var text = document.createElement('span');
      text.className = 'round-roles__text';

      var line = document.createElement('span');
      line.className = 'round-roles__line';
      var strong = document.createElement('strong');
      strong.textContent = entry.label + ' : ';
      var nameSpan = document.createElement('span');
      nameSpan.textContent = entry.name;
      line.appendChild(strong);
      line.appendChild(nameSpan);

      var small = document.createElement('small');
      small.textContent = entry.hint;

      text.appendChild(line);
      text.appendChild(small);

      chip.appendChild(icon);
      chip.appendChild(text);
      el.roundRolesBanner.appendChild(chip);
    });

    el.roundRolesBanner.classList.add('round-roles--show');
  }

  function updateProgress() {
    var total = state.players.length;
    var viewed = state.players.filter(function (p) {
      return p.viewed;
    }).length;
    el.viewedCount.textContent = viewed;
    el.progressFill.style.width = (total ? (viewed / total * 100) : 0) + '%';

    var allViewed = total > 0 && viewed === total;
    if (state.phase === 'reveal') {
      el.startVoteBtn.disabled = !allViewed;
    }
    el.statusBanner.classList.toggle('status-banner--show', allViewed && state.phase === 'reveal');

    if (allViewed && state.phase === 'reveal' && state.timerEnabled && !state.timerStartedRound) {
      state.timerStartedRound = true;
      startDiscussionTimer();
    }
  }

  var discussionTimerInterval = null;

  function formatTimerTime(totalSeconds) {
    var s = Math.max(0, totalSeconds);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' + m : m) + ':' + (sec < 10 ? '0' + sec : sec);
  }

  function clearDiscussionInterval() {
    if (discussionTimerInterval) {
      clearInterval(discussionTimerInterval);
      discussionTimerInterval = null;
    }
  }

  function updateDiscussionTimerDisplay() {
    if (!el.discussionTimer) return;
    el.discussionTimerDisplay.textContent = formatTimerTime(state.timerRemaining);
    var totalSeconds = Math.max(1, state.timerDurationMin * 60);
    var pct = Math.max(0, Math.min(100, (state.timerRemaining / totalSeconds) * 100));
    el.discussionTimerFill.style.width = pct + '%';
    el.discussionTimer.classList.toggle('discussion-timer--warning', state.timerRemaining <= 30 && state.timerRemaining > 0);
    el.discussionTimer.classList.toggle('discussion-timer--paused', !state.timerRunning && !state.timerHasEnded);
    if (el.discussionTimerToggle) {
      el.discussionTimerToggle.textContent = state.timerHasEnded ? 'Relancer' : (state.timerRunning ? 'Pause' : 'Reprendre');
    }
  }

  function tickDiscussionTimer() {
    state.timerRemaining -= 1;
    if (state.timerRemaining <= 0) {
      state.timerRemaining = 0;
      state.timerRunning = false;
      state.timerHasEnded = true;
      clearDiscussionInterval();
      updateDiscussionTimerDisplay();
      vibrate([200, 100, 200]);
      showToast('Temps de discussion écoulé — place au vote !');
      announce('Temps de discussion écoulé.');
      return;
    }
    updateDiscussionTimerDisplay();
  }

  function startDiscussionTimer() {
    if (!state.timerEnabled || !el.discussionTimer) return;
    if (state.timerRemaining <= 0) {
      state.timerRemaining = state.timerDurationMin * 60;
    }
    state.timerHasEnded = false;
    state.timerRunning = true;
    el.discussionTimer.classList.add('discussion-timer--show');
    updateDiscussionTimerDisplay();
    clearDiscussionInterval();
    discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
  }

  function resetDiscussionTimer() {
    clearDiscussionInterval();
    state.timerRemaining = state.timerDurationMin * 60;
    state.timerRunning = false;
    state.timerHasEnded = false;
    state.timerStartedRound = false;
    if (el.discussionTimer) {
      el.discussionTimer.classList.remove('discussion-timer--show', 'discussion-timer--warning', 'discussion-timer--paused');
    }
    updateDiscussionTimerDisplay();
  }

  function stopDiscussionTimer() {
    clearDiscussionInterval();
    state.timerRunning = false;
    if (el.discussionTimer) {
      el.discussionTimer.classList.remove('discussion-timer--show');
    }
  }

  if (el.discussionTimerToggle) {
    el.discussionTimerToggle.addEventListener('click', function () {
      if (state.timerHasEnded) {
        state.timerRemaining = state.timerDurationMin * 60;
        state.timerHasEnded = false;
        state.timerRunning = true;
        el.discussionTimer.classList.remove('discussion-timer--warning');
        clearDiscussionInterval();
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
        updateDiscussionTimerDisplay();
        return;
      }
      state.timerRunning = !state.timerRunning;
      clearDiscussionInterval();
      if (state.timerRunning) {
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
      }
      updateDiscussionTimerDisplay();
    });
  }

  if (el.discussionTimerExtend) {
    el.discussionTimerExtend.addEventListener('click', function () {
      state.timerRemaining += 60;
      if (state.timerHasEnded) {
        state.timerHasEnded = false;
        state.timerRunning = true;
        clearDiscussionInterval();
        discussionTimerInterval = setInterval(tickDiscussionTimer, 1000);
      }
      el.discussionTimer.classList.remove('discussion-timer--warning');
      updateDiscussionTimerDisplay();
      showToast('Une minute de discussion supplémentaire a été ajoutée.');
    });
  }

  var CARD_ICON = '<svg class="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +
    '<circle cx="12" cy="12" r="8.4"/>' +
    '<circle cx="12" cy="12" r="4.6"/>' +
    '<circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/></svg>';

  var CHECK_ICON = '<svg class="card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<path d="M4 12.5l5 5L20 6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function cardRotation(id) {
    var steps = (id * 37) % 7;
    var deg = (steps - 3) * 1;
    return deg + 'deg';
  }

  function renderCards() {
    el.cardsGrid.innerHTML = '';
    state.players.forEach(function (player) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card' + (player.viewed ? ' card--seen' : '');
      card.style.setProperty('--rot', player.viewed ? '0deg' : cardRotation(player.id));
      card.setAttribute('role', 'listitem');
      card.setAttribute('data-id', player.id);

      if (player.viewed) {
        card.disabled = true;
        card.setAttribute('aria-label', player.name + ', carte déjà consultée');
      } else {
        card.setAttribute('aria-label', 'Carte de ' + player.name + ', appuyer pour révéler le mot');
      }

      var indexEl = document.createElement('span');
      indexEl.className = 'card__index';
      indexEl.textContent = '#' + (player.id + 1);

      var iconWrap = document.createElement('span');
      iconWrap.innerHTML = player.viewed ? CHECK_ICON : CARD_ICON;

      var nameEl = document.createElement('span');
      nameEl.className = 'card__name';
      nameEl.textContent = player.viewed ? 'Vu' : player.name;

      card.appendChild(indexEl);
      card.appendChild(iconWrap);
      card.appendChild(nameEl);

      if (!player.viewed) {
        card.addEventListener('click', function () {
          openCard(player.id);
        });
      }

      el.cardsGrid.appendChild(card);
    });
  }

  function openCard(id) {
    var player = getPlayer(id);
    if (!player || player.viewed) return;

    vibrate(12);

    state.openCardId = id;
    el.modalOwner.textContent = 'Carte de ' + player.name;

    if (player.isMrWhite) {
      el.modalRole.textContent = 'Tu es Mr. White — improvise, tu n\'as pas de mot !';
      el.modalWord.textContent = 'Aucun mot';
    } else if (player.isEspion) {
      el.modalRole.textContent = 'Tu es l\'Espion — tu n\'as pas de mot, mais un indice t\'attend ci-dessous';
      el.modalWord.textContent = 'Aucun mot';
    } else if (player.isUndercover) {
      el.modalRole.textContent = 'Tu es l\'Undercover — fonds-toi dans la masse';
      el.modalWord.textContent = player.word;
    } else {
      el.modalRole.textContent = 'Tu es Civil — retrouve l\'imposteur';
      el.modalWord.textContent = player.word;
    }

    renderModalBadges(player);

    el.wordModal.classList.add('modal--open');
    el.wordModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.hideWordBtn.focus();
    announce('Mot révélé pour ' + player.name);
  }

  function renderModalBadges(player) {
    el.modalBadges.innerHTML = '';
    var badges = [];
    if (player.isEspion) {
      badges.push({
        label: 'Indice d\'Espion',
        desc: 'Le mot des Civils commence par la lettre « ' + state.civilWordHint + ' ».'
      });
    }
    if (player.isIdiot) badges.push(ROLE_INFO.idiot);
    if (player.isFantome) badges.push(ROLE_INFO.fantome);
    if (player.isMime) badges.push(ROLE_INFO.mime);
    if (player.isProcureur) badges.push(ROLE_INFO.procureur);
    if (player.loverId !== null) {
      var lover = getPlayer(player.loverId);
      if (lover) {
        badges.push({
          label: 'Amoureux de ' + lover.name,
          desc: 'Si l\'un de vous deux est éliminé, l\'autre l\'est aussi. Peu importe vos camps respectifs, vous devez être les deux derniers survivants pour gagner ensemble.'
        });
      }
    }
    badges.forEach(function (b) {
      var div = document.createElement('div');
      div.className = 'modal__badge';
      var strong = document.createElement('strong');
      strong.textContent = b.label;
      var span = document.createElement('span');
      span.textContent = b.desc;
      div.appendChild(strong);
      div.appendChild(span);
      el.modalBadges.appendChild(div);
    });
  }

  function hideOpenCard() {
    if (state.openCardId === null) return;
    var player = state.players.filter(function (p) {
      return p.id === state.openCardId;
    })[0];
    if (player) player.viewed = true;

    vibrate(12);

    el.wordModal.classList.remove('modal--open');
    el.wordModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.openCardId = null;

    renderCards();
    updateProgress();

    if (player) {
      var total = state.players.length;
      var viewed = state.players.filter(function (p) {
        return p.viewed;
      }).length;
      announce(player.name + ' a caché sa carte. ' + viewed + ' sur ' + total + ' consultées.');
      if (viewed === total) {
        showToast('Toutes les cartes ont été vues. Place à la discussion !');
      }
    }
  }

  el.hideWordBtn.addEventListener('click', hideOpenCard);

  function alivePlayers() {
    return state.players.filter(function (p) {
      return !p.eliminated;
    });
  }

  function livingProcureurExists() {
    return state.players.filter(function (p) {
      return p.isProcureur && !p.eliminated;
    }).length > 0;
  }

  function fantomePresent() {
    return state.players.filter(function (p) {
      return p.isFantome;
    }).length > 0;
  }

  function deadlockRuleActive() {
    return !livingProcureurExists() && !fantomePresent();
  }

  function enterVotePhase() {
    state.phase = 'vote';
    el.tableNote.style.display = 'none';
    el.cardsGrid.style.display = 'none';
    el.statusBanner.classList.remove('status-banner--show');
    el.startVoteBtn.style.display = 'none';
    el.voteSection.classList.add('vote-section--active');
    stopDiscussionTimer();
    renderEliminatedList();
    renderVoteGrid();
    announce('Phase de vote lancée.');
  }

  el.startVoteBtn.addEventListener('click', function () {
    if (el.startVoteBtn.disabled) return;
    enterVotePhase();
  });

  function renderEliminatedList() {
    el.eliminatedList.innerHTML = '';
    state.players.filter(function (p) {
      return p.eliminated;
    }).forEach(function (player) {
      var chip = document.createElement('span');
      chip.className = 'eliminated-chip' + (player.isFantome ? ' eliminated-chip--fantome' : '');
      chip.innerHTML = player.name + ' <span class="eliminated-chip__role">' +
        (player.isUndercover ? 'Undercover' : 'Civil') + '</span>' +
        (player.isFantome ? ' <span class="eliminated-chip__fantome">👻 Fantôme — vote encore</span>' : '');
      el.eliminatedList.appendChild(chip);
    });
  }

  function renderVoteGrid() {
    el.voteGrid.innerHTML = '';
    alivePlayers().forEach(function (player) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'card';
      card.style.setProperty('--rot', cardRotation(player.id));
      card.setAttribute('role', 'listitem');
      card.setAttribute('data-id', player.id);
      card.setAttribute('aria-label', 'Voter pour éliminer ' + player.name);

      var indexEl = document.createElement('span');
      indexEl.className = 'card__index';
      indexEl.textContent = '#' + (player.id + 1);

      var iconWrap = document.createElement('span');
      iconWrap.innerHTML = CARD_ICON;

      var nameEl = document.createElement('span');
      nameEl.className = 'card__name';
      nameEl.textContent = player.name;

      card.appendChild(indexEl);
      card.appendChild(iconWrap);
      card.appendChild(nameEl);

      card.addEventListener('click', function () {
        openVoteConfirm(player.id);
      });

      el.voteGrid.appendChild(card);
    });
  }

  function openVoteConfirm(id) {
    var player = getPlayer(id);
    if (!player) return;
    vibrate(12);
    state.pendingEliminationId = id;
    el.voteConfirmName.textContent = player.name;
    el.voteConfirmModal.classList.add('modal--open');
    el.voteConfirmModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.voteConfirmYes.focus();
  }

  function closeVoteConfirm() {
    el.voteConfirmModal.classList.remove('modal--open');
    el.voteConfirmModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.pendingEliminationId = null;
  }

  el.voteConfirmCancel.addEventListener('click', closeVoteConfirm);

  el.voteConfirmYes.addEventListener('click', function () {
    var id = state.pendingEliminationId;
    if (id === null) return;
    vibrate([30, 40, 30]);
    closeVoteConfirm();
    performElimination(id);
  });

  function roleLabel(player) {
    if (player.isMrWhite) return player.name + ' était Mr. White';
    if (player.isEspion) return player.name + ' était l\'Espion';
    if (player.isUndercover) return player.name + ' était l\'Undercover';
    return player.name + ' était Civil';
  }

  function performElimination(id) {
    var player = getPlayer(id);
    if (!player) return;

    state.voteCount += 1;

    var eliminatedNow = [player];
    player.eliminated = true;

    if (player.loverId !== null) {
      var lover = getPlayer(player.loverId);
      if (lover && !lover.eliminated) {
        lover.eliminated = true;
        eliminatedNow.push(lover);
      }
    }

    var winner = null;
    var winnerDetail = '';
    var winnerReason = '';

    var idiotEliminated = eliminatedNow.filter(function (p) {
      return p.isIdiot;
    })[0];
    if (state.voteCount === 1 && idiotEliminated) {
      winner = 'idiot';
      winnerDetail = idiotEliminated.name;
    } else {
      var aliveNow = alivePlayers();
      var ruleActive = deadlockRuleActive();

      if (ruleActive && aliveNow.length === 4) {
        var loverPairAlive4 = aliveNow.filter(function (p) {
          if (p.loverId === null) return false;
          var partner = getPlayer(p.loverId);
          return partner && !partner.eliminated;
        }).length > 0;
        if (loverPairAlive4) {
          winner = 'amoureux';
          winnerReason = 'deadlock4';
        }
      }

      if (!winner) {
        var loverSurvivor = state.players.filter(function (p) {
          if (p.eliminated || p.loverId === null) return false;
          var partner = getPlayer(p.loverId);
          return partner && !partner.eliminated;
        })[0];

        if (loverSurvivor) {
          var others = state.players.filter(function (p) {
            return p.id !== loverSurvivor.id && p.id !== loverSurvivor.loverId;
          });
          if (others.length && others.every(function (p) {
              return p.eliminated;
            })) {
            winner = 'amoureux';
          }
        }
      }

      if (!winner && ruleActive && aliveNow.length === 2) {
        var impostorAlive2 = aliveNow.filter(function (p) {
          return p.isUndercover || p.isMrWhite || p.isEspion;
        }).length;
        if (impostorAlive2 > 0) {
          winner = 'undercover';
          winnerReason = 'deadlock2';
        }
      }

      if (!winner) {
        var aliveImpostor = state.players.filter(function (p) {
          return !p.eliminated && (p.isUndercover || p.isMrWhite || p.isEspion);
        }).length;
        var aliveCivil = state.players.filter(function (p) {
          return !p.eliminated && !(p.isUndercover || p.isMrWhite || p.isEspion);
        }).length;
        if (aliveImpostor === 0) winner = 'civils';
        else if (aliveCivil === 0) winner = 'undercover';
      }
    }

    state.winner = winner;
    state.winnerDetail = winnerDetail;
    state.winnerReason = winnerReason;

    var namesText = eliminatedNow.map(function (p) {
      return p.name;
    }).join(' et ');
    el.elimName.textContent = namesText + (eliminatedNow.length > 1 ? ' ont été éliminés' : ' a été éliminé(e)');
    el.elimRole.innerHTML = eliminatedNow.map(function (p) {
      var line = roleLabel(p);
      if (p.isFantome) {
        line += '<span class="modal__fantome-note">👻 ' + p.name + ' est le Fantôme — il/elle continue de voter aux prochains tours !</span>';
      }
      return line;
    }).join('<br>');

    if (winner === 'civils') {
      el.elimContinueText.textContent = 'Tous les Undercovers et Mr. White ont été démasqués !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else if (winner === 'undercover') {
      el.elimContinueText.textContent = winnerReason === 'deadlock2' ?
        'Il ne reste plus que 2 joueurs : l\'Undercover/Mr. White l\'emporte automatiquement !' :
        'Il ne reste plus aucun Civil !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else if (winner === 'idiot') {
      el.elimContinueText.textContent = winnerDetail + ' était l\'Idiot du village et remporte la partie dès le premier vote !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else if (winner === 'amoureux') {
      el.elimContinueText.textContent = winnerReason === 'deadlock4' ?
        'Il ne reste plus que 4 joueurs : les Amoureux l\'emportent automatiquement !' :
        'Les Amoureux sont les deux derniers survivants !';
      el.elimContinueBtn.textContent = 'Voir le résultat';
    } else {
      el.elimContinueText.textContent = 'La partie continue — au prochain vote.';
      el.elimContinueBtn.textContent = 'Continuer';
    }

    el.eliminationModal.classList.add('modal--open');
    el.eliminationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.elimContinueBtn.focus();
    announce(el.elimName.textContent);
  }

  function closeEliminationModal() {
    el.eliminationModal.classList.remove('modal--open');
    el.eliminationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  el.elimContinueBtn.addEventListener('click', function () {
    closeEliminationModal();
    if (state.winner) {
      enterGameOver(state.winner);
    } else {
      renderEliminatedList();
      renderVoteGrid();
    }
  });

  function enterGameOver(winner) {
    state.phase = 'gameover';
    el.voteSection.classList.remove('vote-section--active');
    el.startVoteBtn.style.display = 'none';
    el.summaryBtn.classList.remove('summary-btn--hidden');
    stopDiscussionTimer();

    var impostorPlural = state.players.filter(function (p) {
      return p.isUndercover || p.isMrWhite || p.isEspion;
    }).length > 1;

    if (winner === 'civils') {
      el.gameOverTitle.textContent = 'Les Civils ont gagné !';
      el.gameOverSub.textContent = impostorPlural ?
        'Tous les imposteurs ont été démasqués et éliminés.' :
        'L\'imposteur a été démasqué et éliminé.';
      el.gameOverBanner.classList.add('game-over-banner--civils');
    } else if (winner === 'undercover') {
      el.gameOverTitle.textContent = impostorPlural ? 'Les Undercovers ont gagné !' : 'L\'Undercover a gagné !';
      el.gameOverSub.textContent = state.winnerReason === 'deadlock2' ?
        'Il ne restait plus que 2 joueurs : la situation était dans l\'impasse, l\'imposteur l\'emporte automatiquement.' :
        'Tous les Civils ont été éliminés avant d\'avoir démasqué l\'imposteur.';
      el.gameOverBanner.classList.add('game-over-banner--undercover');
    } else if (winner === 'idiot') {
      el.gameOverTitle.textContent = 'L\'Idiot du village a gagné !';
      el.gameOverSub.textContent = state.winnerDetail + ' a été éliminé(e) dès le tout premier vote et remporte la partie à lui/elle seul(e) !';
      el.gameOverBanner.classList.add('game-over-banner--idiot');
    } else if (winner === 'amoureux') {
      el.gameOverTitle.textContent = 'Les Amoureux ont gagné !';
      el.gameOverSub.textContent = state.winnerReason === 'deadlock4' ?
        'Il ne restait plus que 4 joueurs : la situation était dans l\'impasse, les Amoureux l\'emportent automatiquement.' :
        'Peu importe leurs camps respectifs, ils ont survécu ensemble à tous les autres joueurs !';
      el.gameOverBanner.classList.add('game-over-banner--amoureux');
    }

    el.gameOverBanner.classList.add('game-over-banner--active');
    announce(el.gameOverTitle.textContent);
    recordScoreEntry(winner);
  }

  function openSummary() {
    el.summaryList.innerHTML = '';
    state.players.forEach(function (player) {
      var li = document.createElement('li');

      var nameSpan = document.createElement('strong');
      nameSpan.textContent = player.name + (player.eliminated ? ' (éliminé)' : '');

      var right = document.createElement('span');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.flexWrap = 'wrap';
      right.style.gap = '6px';

      var wordSpan = document.createElement('span');
      wordSpan.textContent = (player.isMrWhite || player.isEspion) ? 'Aucun mot' : player.word;
      wordSpan.style.color = 'var(--ink-soft)';
      right.appendChild(wordSpan);

      var roleSpan = document.createElement('span');
      if (player.isMrWhite) {
        roleSpan.className = 'summary-role summary-role--undercover';
        roleSpan.textContent = 'Mr. White';
      } else if (player.isEspion) {
        roleSpan.className = 'summary-role summary-role--undercover';
        roleSpan.textContent = 'Espion';
      } else if (player.isUndercover) {
        roleSpan.className = 'summary-role summary-role--undercover';
        roleSpan.textContent = 'Undercover';
      } else {
        roleSpan.className = 'summary-role summary-role--civil';
        roleSpan.textContent = 'Civil';
      }
      right.appendChild(roleSpan);

      var specials = [];
      if (player.isIdiot) specials.push('Idiot du village');
      if (player.isFantome) specials.push('Fantôme');
      if (player.isMime) specials.push('Mime');
      if (player.isProcureur) specials.push('Procureur');
      if (player.loverId !== null) specials.push('Amoureux');
      specials.forEach(function (label) {
        var specialSpan = document.createElement('span');
        specialSpan.className = 'summary-role summary-role--special';
        specialSpan.textContent = label;
        right.appendChild(specialSpan);
      });

      li.appendChild(nameSpan);
      li.appendChild(right);
      el.summaryList.appendChild(li);
    });

    el.summaryModal.classList.add('modal--open');
    el.summaryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.closeSummaryBtn.focus();
  }

  function closeSummary() {
    el.summaryModal.classList.remove('modal--open');
    el.summaryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  el.summaryBtn.addEventListener('click', openSummary);
  el.closeSummaryBtn.addEventListener('click', closeSummary);
  el.summaryScrim.addEventListener('click', closeSummary);

  function recordScoreEntry(winner) {
    var winnerLabel = '';
    var winnerNames = [];

    if (winner === 'civils') {
      winnerLabel = 'Les Civils';
      winnerNames = state.players.filter(function (p) {
        return !p.isUndercover && !p.isMrWhite && !p.isEspion;
      }).map(function (p) {
        return p.name;
      });
    } else if (winner === 'undercover') {
      winnerLabel = 'Les Imposteurs';
      winnerNames = state.players.filter(function (p) {
        return p.isUndercover || p.isMrWhite || p.isEspion;
      }).map(function (p) {
        return p.name;
      });
    } else if (winner === 'idiot') {
      winnerLabel = 'Idiot du village';
      winnerNames = state.winnerDetail ? [state.winnerDetail] : [];
    } else if (winner === 'amoureux') {
      winnerLabel = 'Les Amoureux';
      winnerNames = state.players.filter(function (p) {
        return p.loverId !== null;
      }).map(function (p) {
        return p.name;
      });
    } else {
      return;
    }

    scoreLog.unshift({
      round: state.round,
      playerCount: state.players.length,
      winner: winner,
      winnerLabel: winnerLabel,
      winnerNames: winnerNames
    });
    if (scoreLog.length > MAX_SCORE_ENTRIES) {
      scoreLog.length = MAX_SCORE_ENTRIES;
    }
    saveScoreLog();
  }

  function renderScoreModal() {
    var hasEntries = scoreLog.length > 0;
    if (el.scoreEmptyState) el.scoreEmptyState.style.display = hasEntries ? 'none' : '';
    if (el.scoreContent) el.scoreContent.style.display = hasEntries ? '' : 'none';
    if (!hasEntries) return;

    var tally = {};
    scoreLog.forEach(function (entry) {
      (entry.winnerNames || []).forEach(function (name) {
        tally[name] = (tally[name] || 0) + 1;
      });
    });
    var leaderboard = Object.keys(tally).map(function (name) {
      return {
        name: name,
        wins: tally[name]
      };
    }).sort(function (a, b) {
      return b.wins - a.wins;
    });

    el.scoreLeaderboard.innerHTML = '';
    leaderboard.forEach(function (entry) {
      var li = document.createElement('li');
      var nameSpan = document.createElement('strong');
      nameSpan.textContent = entry.name;
      var countSpan = document.createElement('span');
      countSpan.className = 'score-leaderboard__count';
      countSpan.textContent = entry.wins + (entry.wins > 1 ? ' victoires' : ' victoire');
      li.appendChild(nameSpan);
      li.appendChild(countSpan);
      el.scoreLeaderboard.appendChild(li);
    });

    el.scoreHistory.innerHTML = '';
    scoreLog.forEach(function (entry) {
      var li = document.createElement('li');
      var labelSpan = document.createElement('strong');
      labelSpan.className = 'score-history__label';
      labelSpan.textContent = entry.winnerLabel;
      var roundSpan = document.createElement('span');
      roundSpan.className = 'score-history__round';
      roundSpan.textContent = 'Manche ' + entry.round + ' · ' + entry.playerCount + ' joueurs';
      li.appendChild(labelSpan);
      li.appendChild(roundSpan);
      el.scoreHistory.appendChild(li);
    });
  }

  function openScoreModal() {
    renderScoreModal();
    el.scoreModal.classList.add('modal--open');
    el.scoreModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    el.closeScoreBtn.focus();
  }

  function closeScoreModal() {
    el.scoreModal.classList.remove('modal--open');
    el.scoreModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (el.scoreLogToggle) el.scoreLogToggle.addEventListener('click', openScoreModal);
  if (el.scoreLogBtnGame) el.scoreLogBtnGame.addEventListener('click', openScoreModal);
  if (el.closeScoreBtn) el.closeScoreBtn.addEventListener('click', closeScoreModal);
  if (el.scoreScrim) el.scoreScrim.addEventListener('click', closeScoreModal);

  if (el.scoreResetBtn) {
    el.scoreResetBtn.addEventListener('click', function () {
      scoreLog = [];
      saveScoreLog();
      renderScoreModal();
      showToast('Le journal des scores a été réinitialisé.');
    });
  }

  function newRound() {
    closeSummary();
    state.round += 1;
    assignRoles();
    resetStageUI();
    renderGameHeader();
    renderCards();
    showToast('Nouvelle manche lancée — de nouveaux mots ont été distribués.');
  }

  el.newRoundBtn.addEventListener('click', newRound);
  el.summaryNewRoundBtn.addEventListener('click', newRound);

  el.resetBtn.addEventListener('click', function () {
    stopDiscussionTimer();
    state.players = [];
    state.round = 1;
    state.phase = 'reveal';
    state.winner = null;
    state.winnerReason = '';
    state.pendingEliminationId = null;
    el.gameScreen.classList.remove('screen--active');
    el.setupScreen.classList.add('screen--active');
  });

  if (el.rulesToggle && el.rulesText) {
    el.rulesToggle.addEventListener('click', function () {
      var expanded = el.rulesToggle.getAttribute('aria-expanded') === 'true';
      el.rulesToggle.setAttribute('aria-expanded', String(!expanded));
      el.rulesText.hidden = expanded;
    });
  }

  updateCounter();
  updateUnderCounter();
  renderThemeToggles();
  renderNameFields();
  renderSetupRecap();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();