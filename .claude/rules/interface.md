---
paths:
  - "src/ui/**"
  - "src/pdf/**"
  - "src/app.css"
  - "e2e/**"
  - "public/maquettes/**"
  - "index.html"
---

# Interface et charte (détail)

Règles validées par l'enseignant, dans leur version actuelle. Elles complètent la section « Pédagogie et interface »
de `CLAUDE.md`. Toute nouvelle interface passe d'abord par une maquette dans `public/maquettes/`.

## Charte

- Inspiration : logiciels comptables suisses (Banana, Abacus, bexio) : fond blanc, tableaux denses à lignes
  alternées, montants à droite en chiffres tabulaires, soldes négatifs en rouge, une seule couleur forte pour
  l'action principale.
- Couleurs (`src/ui/theme.css`) : structure #1F4E78 ; sélection #D6E4F0 ; lignes alternées #F1F6FB ; barre latérale
  bleu nuit #11304D ; bouton principal #C4501A (texte blanc, AA) ; #E8601C seulement pour le focus clavier, la
  rubrique active et les bordures d'alerte ; texte d'alerte #B34A12 ; « Juste » en vert #1D6B3A ; bordure des champs
  #8793A2. Palette bleu et orange conservée.
- Design system (maquette `design-system.html`) : police Inter (jeu latin par `@font-face` dans `theme.css`, Helvetica
  dans les PDF) ; tailles `--t-12` à `--t-26` (et `--t-titre` pour le grand titre de l'accueil), espacements `--e-1`
  à `--e-7`, rayons `--r-1` à `--r-3`, couleurs d'état `--c-succes`, `--c-erreur`, `--c-avert` ; classes `.message`
  (succes, erreur, avert, information), `.btn-petit`, `.btn-danger`. Écrire toute nouvelle taille, tout rayon et toute
  couleur d'état avec ces variables. Réponses fausses en `--c-erreur`. Exceptions voulues : projection du simulateur
  et page à imprimer.
- Libellés en minuscules, consultation à plat, seule la saisie en relief, cartes à ombre légère, pas d'animation au
  survol des cartes, aucun émoji, aucune illustration, aucune animation superflue.
- Exception de l'accueil (`Accueil.svelte` seulement) : visuels qui montrent la comptabilité, animations courtes qui
  ont un sens (coupées par `prefers-reduced-motion`), survol animé des cartes. Interdits partout : émojis, points,
  badges à collectionner, classement individuel (seul le simulateur classe des groupes), mascotte, dégradés
  décoratifs, verre dépoli, textes marketing creux. Gamification permise seulement pour une maîtrise prouvée
  (voir `CLAUDE.md`).

## Navigation

- Trois espaces dans le bandeau (`BandeauRubriques.svelte`) : Accueil · Comptabilité (Mes dossiers, Exercices,
  Évaluation) · Cours (Apprendre, Théorie), puis Guide et Espace enseignant. Pages de l'accueil par
  `etat.pageAccueil`, historique du navigateur par `history.pushState` sans changer l'adresse.
- Dans un dossier : en-tête avec dossier, exercice, niveau et mode ; barre latérale groupée (Votre mission, Saisie,
  Comptes, États financiers, Clôture, Fiches, Outils), étapes cochées, « Étape suivante » (`parcours.ts`) ; rubriques
  activées seulement ; une seule tâche à la fois. Pas de parcours pour le simulateur.
- Dénominations affichées : « 1ère CFC », « 2ème CFC », « Maturité professionnelle » (`LIBELLES_NIVEAU`,
  `LIBELLES_ANNEE`) ; les identifiants `CFC1` / `CFC2` du code ne changent pas.

## Saisie

- Grille de saisie en haut du journal ; saisie guidée par défaut, saisie rapide au choix de l'élève (pas sous 821 px,
  imposable par exercice). Tab entre les champs, Entrée valide ; différence débit / crédit en direct.
- Champ compte = liste déroulante complète, groupée par classe, filtrée par la frappe (nom d'abord, numéro accepté) ;
  le nom avant le numéro. Tab choisit le compte en surbrillance comme Entrée dès que l'élève a tapé ou désigné un
  compte ; champ vide sans désignation : Tab passe au champ suivant.
- Verdict de la dernière écriture au-dessus de la saisie, ramené à l'écran après « Valider » ; raison affichée quand
  « Valider » est grisé ; Extourner et Supprimer derrière « ⋯ ». La solution se masque dès que l'élève saisit une
  ligne de la pièce (« Revoir la solution » la rouvre).
- « Bilan en direct » : résultat du moment montré à part (« Perte provisoire » à l'actif, « Bénéfice provisoire » au
  passif), effet de la dernière écriture décrit compte par compte ; ne jamais laisser croire à un débutant qu'un achat
  est une perte.
- Historique des modifications de l'élève : jamais noté. Modèles d'écritures de l'élève permis en évaluation,
  désactivables par exercice. Palette de commandes Ctrl + K.
- Plusieurs exercices par navigateur (`etat.autres`) ; un autre nom d'élève demande confirmation avant d'effacer.
- Après la dernière opération juste (entraînement) ou saisie (évaluation), la balance s'ouvre ; puis « Étape
  suivante » jusqu'à « Votre mission ».
- Éditeur d'exercice : le « × » d'une ligne remplie demande une confirmation en deux temps (`BoutonRetirer.svelte`).

## Téléphone, accessibilité, performance

- WCAG AA, testé avec axe ; lisible au projecteur, sur ordinateur, tablette et téléphone.
- Sous 900 px : menu repliable (fermé = `visibility: hidden`, Échap, focus rendu, contenu `inert`). Sous 820 px :
  grille de saisie empilée. Sous 700 px : écritures, balance et grand livre en fiches (`table.empile`), bilan et
  compte de résultat en une colonne.
- Cibles : 24 px au moins partout, 44 px avec `pointer: coarse` ; cases et boutons radio 20 px.
- Dialogues du logiciel (`dialogue.demander`, `dialogue.informer`) ; action qui efface = bouton rouge nommé, focus sur
  « Annuler ».
- Vues de base chargées à la demande par `VUES_BASE` et préchargées pendant un temps mort ; Théorie, Guide, espace
  enseignant, fiches, TVA, Facturation, Budget par `Differe`. Le catalogue d'exercices reste dans le fichier
  principal (le rendre asynchrone demande l'accord de l'enseignant).

## Tests d'écran

- `e2e/` avec Playwright sur `vite preview` (port 4173) : toujours `npm run build` avant `npm run test:ecrans`.
- Captures ponctuelles : spécification temporaire dans `e2e/`, images dans le dossier temporaire, spécification
  supprimée ensuite.
