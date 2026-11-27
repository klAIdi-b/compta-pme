# Inventaire : où se trouve chaque règle de l'ancien CLAUDE.md

Réduction du 27.11.2026. L'ancien texte complet est recopié sans perte dans `docs/historique.md` (partie 1).
Abréviations : **C** = `CLAUDE.md` ; **RC** = `.claude/rules/comptabilite.md` ; **RI** = `.claude/rules/interface.md` ;
**T** = `TRAVAIL_EN_COURS.md` ; **H** = `docs/historique.md` seulement (histoire, plus une règle à appliquer).

## En-tête et méthode de travail

| Ancienne règle | Où |
|---|---|
| But, école (nom dans CLAUDE.local.md), publics, interlocuteur, français, vouvoiement | C, en tête |
| N'inventer aucune règle, aucun numéro ni intitulé ; demander en cas de doute | C, Méthode |
| Aucun contenu de niveau sans accord | C, Méthode |
| Fin de phase : tests, vérification, ce qui reste, attendre l'accord | C, Méthode |
| Maquettes Journal et Bilan avant l'interface | C, Méthode, généralisée : « maquette avant toute nouvelle interface » (contradiction 6) |

## Phases 0 à 7 et chantiers datés

| Ancienne règle | Où |
|---|---|
| Récit des phases 0 à 7, dates de validation | H |
| Moteur `correction.ts`, `notation.ts`, `tva.ts`, `salaire.ts` ; écrans TVA, décompte de salaire | C, Où trouver quoi ; RC |
| Démos et bénéfices (3'530.00, 9'582.20, 76'415.00) | RC, Classement |
| Phase 6 : sociétés, 2800 selon la forme, 9000/2970, répartition art. 672, IA 35 % en 2205, analyse, titres ch. 54, ancienne règle art. 671 à ne pas reprendre | C (essentiel) ; RC, Maturité |
| Simulateur : phases S1 à S6, mise en ligne, données anonymes, classement par défaut | C, Données ; RC, Simulateur ; H (récit) ; `docs/simulateur-cahier-des-charges.md` |
| Dossiers de pièces : « pièces seules », 10 à 12 pièces, PDF, `npm run dossiers` | RC, Contenus pédagogiques ; C, Commandes |
| Accueil et avancement, plusieurs exercices par navigateur, autre élève avec confirmation | RI, Saisie |
| Parcours après le journal, « Étape suivante » | RI, Navigation et Saisie |
| Référence pédagogique (Apprendre, exercices courts, erreurs typiques, bilan par notion, guide) | C, Où trouver quoi ; RC ; H ; mention « à relire » dans T |
| Facturation et paiements | RC, Fiches et calculs ; H |
| Budget et écarts | RC, Fiches et calculs ; H |
| Plan d'études complet (16 modules de calcul), tolérances | RC, Fiches et calculs ; « à relire » dans T |
| Écritures de 2ème CFC et maturité dans Apprendre (modèles tirés de corrigés validés) | RC, Fiches et calculs ; « à relire » dans T |
| Formulaire officiel de décompte TVA | RC, TVA et formulaire |
| Refonte de l'expérience (portes, parcours numéroté, téléphone) | RI ; H ; « à relire » dans T |
| Chantier A : prévisualisation `apercu`, stockage séparé, règle « nouveauté d'abord sur apercu » | C, Méthode et Code |
| Maîtrise d'Apprendre (8 sur 10, minimum par format, états) | C, Correction et notation (version du second audit, contradiction 5) |
| Chantier B : bilan en direct sans confusion, entraînement guidé, révision espacée | RI, Saisie ; C ; H |
| Chantier C : progression par fichier, « Classer les pièces », projection sans réseau, fil rouge | C, Données ; H |
| Mise en ligne du 24.11, leçons d'Apprendre | H ; « à relire » dans T |
| Amélioration de l'interface en six parties, design system | RI, Charte et Téléphone ; étape 4 (Lighthouse) dans T |
| Accueil engageant, exception de l'accueil | RI, Charte |
| Onglets et pages de l'accueil, onglet Théorie, dénominations « 1ère CFC », « 2ème CFC » | C ; RI, Navigation |
| Théorie de référence (blocs validés intacts, vérification des calculs, points à confirmer) | RC, Contenus pédagogiques ; points à confirmer dans T |
| Escompte avec TVA en maturité seulement ; dossiers passés en maturité | C ; RC |
| Méthode au brut en 2ème CFC (en attente) | T |
| Vision V1 à V5 (espaces, énoncé papier, distribution, saisie professionnelle, années comptables) | C (espaces, énoncé papier, données) ; RI (saisie, historique, modèles) ; H (détail) ; `VISION_LOGICIEL.md` |
| Rappels de clôture par année (liste attendue) | T |
| Partage avec les collègues, lien `?exercice=`, variante d'évaluation, corrigés publics | C, Correction et notation ; RC, Contenus pédagogiques |
| Guide unique `src/data/guide.ts`, `npm run guide` | C, Commandes et Pédagogie |
| Trois exercices de démonstration | RC, Classement |
| Statut du contenu : tout validé, retours des collègues à appliquer | T (mentions « à relire » et retours des collègues) ; H |

## Contraintes techniques, états, supports

| Ancienne règle | Où |
|---|---|
| Svelte 5, Vite, TypeScript strict, Vitest, sans bibliothèque d'interface ni routeur ; dépendances admises | C, Code |
| Chargement à la demande, ne pas réimporter | C, Code ; RI |
| 100 % navigateur, exception du simulateur | C, Données |
| Centimes, formats d'affichage, français | C, Code |
| `src/engine/` pur et testé ; rôles des dossiers ; commandes | C, Code et Commandes |
| Conventions du moteur (solde, dates ISO, `Resultat<T>`, lignes, extourne) | C, Code |
| Bouclement : méthode du cours, `resultatAVirer`, ancienne méthode acceptée, aide, `bouclementAutomatique` | C (essentiel) ; RC, Bouclement |
| Deux modes de bouclement | C |
| Versionnement Git, GitHub Pages | C, Commandes |
| États de l'application (`modes.ts`) | C, Code |
| Manuels : inspiration, droits obtenus, reformuler, PDF verrouillés | C, Dépôt public |
| Contenus construits sur les manuels, noms et montants changés, anciens identifiants | RC, Contenus construits sur les manuels |
| Plan d'enrichissement par lots (A à I) | H ; règles encore valables dans RC |
| Usages relevés (1170 / 1171, amortissements, transitoires, ducroire, 8510, poursuites, escomptes, salaires) | RC, Écritures courantes |
| Documents fournis par l'enseignant | `CLAUDE.local.md` (emplacements) ; H |

## Classement, plan comptable, maturité, niveaux

| Ancienne règle | Où |
|---|---|
| `filiere`, `difficulte`, `chapitres` ; niveaux CFC et MP | RC, Classement ; « proposition » en attente dans T |
| Plan du cours PME, CSV, types, `niveau_min` (proposition) | C ; RC, Plan comptable ; T |
| Titres de groupes du bilan et du compte de résultat | RC, Plan comptable |
| 2205 Dettes AFC ; 2800 selon la forme | C |
| Maquettes anciennes avec numéros LPG | C, Où trouver quoi |
| Devises, raison individuelle, immeubles, fondation, réserves latentes, tableaux, titres | RC, Maturité |
| Niveaux 1ère CFC, 2ème CFC, maturité ; rabais dès la 1ère CFC ; fonction non activée invisible | C, Règles comptables essentielles |

## Règles comptables validées

| Ancienne règle | Où |
|---|---|
| Écritures composées, débit = crédit | C, Code (lignes) et Correction |
| Matériel informatique en 1521 | C |
| Achat à crédit 2000 / 2010 ; corrigé à jour d'une session (`avecCorrigeAJour`) | C ; H |
| Extourne, historique visible | C ; « modification directe sur autorisation » remplacée (contradiction 3) |
| États en forme de compte ; perte à l'actif | C |
| SI / SF, San / Spb | C |
| Bouclement par 9000 par défaut | C |
| TVA : taux, nette et brute, 5 centimes, décompte, écritures | C ; RC |
| Répartition art. 672 CO | C ; RC |
| Salaires : cotisations données, plusieurs façons | RC, Écritures courantes |

## Correction automatique et notation

| Ancienne règle | Où |
|---|---|
| Pièce = opération, ordre et date indifférents, totaux par compte à 5 centimes | C |
| Extourne annulée ; bouclement noté ; pièce hors énoncé signalée | C ; RC, Bouclement |
| Fiches dans la copie ; degré d'autofinancement | C ; RC |
| Indices, « Voir la solution », « Juste avec la solution », raisonnement, modification toujours possible | C ; RI (masquage de la solution) |
| Évaluation, barème, points partiels, note | C (barème de 2 points dès trois comptes, décision du 26.11) |
| Fichier d'exercice, évaluation formative | C |
| Accueil à onglets Entraînement / Évaluation | remplacé par les trois espaces (contradiction 4) ; RI, Navigation |
| Copie : prénom, nom, classe ; formats | C |
| « Bonne classe mais mauvais compte » ; opération incomplète | RC, Correction automatique |
| Reprise d'un travail par fichier | C |
| Second audit : réponses justes, diagnostics, explications, évaluation, maîtrise, conventions, décisions 8.3 | C ; RC (Correction automatique, Écritures courantes, Contenus pédagogiques) ; RI (masquage) ; H |
| Mode enseignant : code simple | C, Données |

## Pédagogie et interface

| Ancienne règle | Où |
|---|---|
| Retour immédiat, charge cognitive réduite, vocabulaire du cours | C |
| Gamification : aucune sauf le simulateur | C, avec « en cours de révision » ; décision dans T (contradiction 1) |
| L'élève choisit le compte ; messages clairs ; visite de cinq étapes | C |
| Logiciels suisses, barre latérale, en-tête | C ; RI |
| Saisie au clavier, comptes par leur nom, liste déroulante, Tab | C ; RI, Saisie |
| « Extourner » | C |
| Retrait en deux temps dans l'éditeur | RI, Saisie |
| Couleurs, design modernisé et épuré | RI, Charte |
| Typographie système (23.11) | remplacée par Inter (contradiction 2) ; RI |
| Inter, aucun émoji, WCAG AA | C ; RI |
| Exception de l'accueil | RI, Charte |

## Règles venues d'ailleurs

| Règle | Où |
|---|---|
| Orthographe jamais évaluée ; copies rendues dans Google Classroom (mémoire de Claude) | C, Correction et notation |
| Les classes ne perdent rien (demande « Vision » du 27.11) | C, Méthode |
| PROMPT_EQUIPE.md (équipe d'agents) | remplacé par les sous-agents (point 3) |
