# Travail en cours (demandes de l'enseignant du 04.11.2026)

Ce fichier sert à reprendre le travail automatiquement si la session est interrompue (limite d'utilisation).
Lire d'abord `CLAUDE.md` (règles du projet). Cocher chaque tâche terminée, avec un commit et une publication.
Toujours : `npm test` et `npm run check` sans erreur avant chaque commit ; message de commit en français terminé par
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ; `git push` (la publication GitHub Pages est automatique).
Git : `C:\Program Files\Git\cmd\git.exe` ; GitHub CLI : `C:\Program Files\GitHub CLI\gh.exe`.

## Tâches

- [x] **A. Éditeur : choix des comptes de l'exercice.** Dans `src/ui/vues/EditeurExercice.svelte`, section « Comptes de
  l'exercice » : tous les comptes du plan groupés par classe, avec une case à cocher ; cochés par défaut ceux du niveau.
  Cocher un compte hors niveau l'ajoute à `parametres.comptesAjoutes`, décocher un compte du niveau l'ajoute à
  `parametres.comptesMasques`. Filtre de recherche par nom. Test du moteur si nécessaire.

- [x] **B. Situation de départ.** Nouveau champ `situation` (texte) dans `Exercice` (`src/engine/exercice.ts`) : un récit
  qui place l'élève dans l'entreprise (son rôle, l'entreprise, ses produits, ses collègues, ce qu'on attend de lui).
  Éditeur : zone de texte. Affichage : carte « Votre situation » en tête du tableau de bord ; au démarrage d'un
  exercice, ouvrir le tableau de bord (et non le journal) avec un bouton « Commencer la saisie ». Rédiger une situation
  originale pour chaque exercice de démonstration. Texte entièrement original (aucune reprise des manuels).

- [x] **C. Onglet « Théorie ».** Rubrique de la barre latérale, visible à tous les niveaux, n'affichant que les
  chapitres du niveau de l'exercice (CFC1 ⊂ CFC2 ⊂ MP). Contenu rédigé EN NOS PROPRES MOTS (les manuels E&S sont
  protégés : s'en inspirer seulement, ne jamais recopier de phrase, d'exemple ou d'exercice), cohérent avec le plan
  comptable du cours (`src/data/plan-pme.csv`) et le vocabulaire validé (extourne, SI/SF, San/Spb, FAC…).
  Chapitres : bilan ; comptes et règles débit/crédit ; journal et écritures (simples, composées, extourne) ; compte de
  résultat et bouclement de la raison individuelle, compte privé ; marchandises et stock (CFC1) ; TVA méthode effective
  (au net / au brut, décompte, 2205) ; amortissements (direct/indirect, linéaire/dégressif, prorata) ; transitoires et
  extourne au 01.01 ; pertes sur créances, créances douteuses, ducroire ; salaires et assurances sociales (sans taux
  figés) ; sociétés (SA, Sàrl), répartition du bénéfice (art. 672 CO révisé), impôt anticipé ; provisions ; titres ;
  intérêts, escomptes ; analyse financière (ratios du cours). Bases légales citées (CO 957 ss, 959a, 959b, 672 ;
  LTVA). Données en fichier TS (`src/data/theorie.ts`), écran `src/ui/vues/Theorie.svelte` (sommaire + chapitre,
  exemples d'écritures en tableau, mise en page sobre selon la charte).

- [x] **D. Nouveaux exercices** (proposés, à faire valider par l'enseignant), entreprises fictives et montants
  originaux, inspirés de la structure des chapitres du cours, chacun avec situation de départ, ~10–15 opérations,
  corrigé complet et test (corrigé équilibré, `controlerExercice` sans erreur) :
  1. CFC1 — commerce de détail : bilan d'ouverture, achats/ventes, charges, privé, bouclement noté.
  2. CFC1 — entreprise de services (honoraires 3400 activé via comptes ajoutés), bouclement.
  3. CFC2 — TVA : un trimestre complet au net, décompte et paiement (2205).
  4. CFC2 — amortissements (direct et indirect, linéaire et dégressif, prorata) et transitoires.
  5. CFC2 — pertes sur créances, créances douteuses, ducroire, récupération d'une créance amortie (8510).
  6. CFC2 — salaires : décomptes de plusieurs employés, charges patronales, paiements aux assurances.
  7. MP — SA : répartition avec perte reportée compensée, dividendes et impôt anticipé, titres et provisions.
  Les ajouter à `src/data/demos.ts` (marquer « proposé » dans le titre ou la description tant que non validé).

## Journal de reprise

(ajouter une ligne datée à chaque reprise : ce qui a été fait, ce qui reste)

- 05.11.2026 — A terminée : section « Comptes de l'exercice » (cases par classe, recherche, retour aux comptes du niveau), moteur `comptesChoisis` / `basculerCompte` testé ; le bilan d'ouverture de l'éditeur propose les comptes choisis. Reste B, C, D.
- 05.11.2026 — B terminée : champ `situation` (facultatif, rétrocompatible), zone de texte dans l'éditeur, carte « Votre situation » en tête du tableau de bord, démarrage sur le tableau de bord avec « Commencer la saisie » (visite guidée lancée à ce moment), situations originales des trois démos (à relire). Non vérifié dans le navigateur (serveur de prévisualisation non autorisé pendant la reprise automatique). Reste C, D.
- 05.11.2026 — C terminée : rubrique « Cours › Théorie » (tous niveaux), 15 chapitres cumulatifs (5 CFC1, 5 CFC2, 5 MP ; voir `src/data/theorie.ts`), exemples d'écritures en tableau vérifiés par test (équilibre, comptes du plan disponibles au niveau, arrondi 5 cts), mention « Contenu proposé » tant que `THEORIE_VALIDEE = false`. Points à valider : variation de stock 1200/4280 (CFC1), TVA au brut (3200/2200 et 1170/4200 en fin de période), récupération d'une créance amortie en 8510, hausse de cours des titres 1060/6950, provisions (constitution et utilisation seulement). Reste D.
- 05.11.2026 — D terminée : 7 exercices proposés dans `src/data/exercices-proposes.ts` (titres « (proposé) »), ajoutés à la liste des démos ; test `tests/exercices-proposes.test.ts` (contrôle sans erreur ni avertissement, corrigé complet et équilibré, résultat et soldes calculés à la main, bouclement, répartition Novaterm). Choix à valider : D1 prélèvement privé payé par la banque (pas de prélèvement de marchandises) ; D2 comptes de marchandises masqués et 3400 ajouté ; D3 loyer non soumis à la TVA ; D4 et D5 entreprises non assujetties à la TVA, méthodes directe et indirecte dans le même exercice ; D6 LPP en montants fixes, part patronale égale à la part salariale, compte 3410 ajouté ; D7 frais d'achat de titres en 6900, provisions 6100/2600 et 8900/2640. Toutes les tâches sont terminées.

# Chantier « Dossiers d'exercices avec pièces comptables » (demande du 05.11.2026)

Choix de l'enseignant : PDF à distribuer ET pièces affichées dans le logiciel ; un dossier par grand thème (10) ;
une entreprise fictive par dossier ; 10 à 12 pièces par dossier ; pièces seules (l'élève déduit l'opération) ;
types : factures, tickets et quittances, documents bancaires, fiches de salaire (et notes internes pour les
opérations de clôture) ; corrigé PDF pour l'enseignant ; chaque dossier en version entraînement ET évaluation.
Aucune référence aux manuels. Textes et entreprises entièrement originaux.

- [x] E1. Modèle `PieceComptable` (`src/engine/pieces.ts`) : constructeurs facture / ticket / quittance / avis bancaire /
  fiche de salaire / note interne / avis de dividende, montants calculés (TVA arrondie 5 cts) ; champ `piece` facultatif
  dans `Operation` ; tests.
- [x] E2. Composant `PieceVue.svelte` (aspect d'un document) ; dans le journal, la pièce de l'opération choisie
  s'affiche au-dessus de la grille (bouton afficher / masquer) ; dans l'énoncé « Pièce n — titre ».
- [x] E3. PDF : `src/pdf/dossier.ts` — dossier élève (page de garde, situation, consignes, bilan d'ouverture, pièces)
  et corrigé enseignant (journal corrigé par pièce, bilan et compte de résultat finaux, bouclement si demandé).
- [x] E4. Dix dossiers (`src/data/dossiers/`) : CFC 1 bases commerce (non assujetti, bouclement) ; CFC 1 services
  (honoraires, bouclement) ; CFC 2 TVA ; CFC 3 amortissements ; CFC 3 transitoires ; CFC 3 créances, pertes,
  ducroire ; CFC 3 salaires ; CFC 4 synthèse CFC ; MP 1 sociétés et répartition ; MP 2 titres, provisions et
  opérations financières (Lémantec passe en MP 3 Synthèse). Tests : corrigé complet et équilibré, contrôle sans erreur.
- [x] E5. Espace enseignant, onglet « Dossiers » : pour chaque dossier, PDF élève, corrigé PDF, exercice entraînement,
  exercice évaluation. Script `scripts/generer-dossiers.ts` (vite-node) qui écrit ces fichiers dans `dossiers/`.
- [x] E6. Tests, contrôle, vérification dans le navigateur, publication.

# Chantier « Accueil engageant » (demande du 24.11.2026)

Refonte de l'aspect de la page d'accueil (`src/ui/vues/Accueil.svelte`), sans rien retirer de ses fonctions.
Exception à la charte pour l'accueil seulement : voir CLAUDE.md, section « Interface et charte visuelle ».

- [x] F1. Maquettes : `public/maquettes/accueil-engageant.html`, trois directions (A le logiciel en action,
  B votre parcours, C grand format), ordinateur et téléphone. Choix de l'enseignant : **A, avec la reprise de B**.
- [x] F2. Mise en œuvre sur la branche `apercu` : démonstration `composants/DemoEcriture.svelte`, carte
  « Votre prochaine étape » pour l'élève qui revient, portes sans numéro, tests `e2e/accueil.spec.ts`.
- [x] F3. Vérification par l'enseignant sur la prévisualisation (téléphone et ordinateur), puis fusion dans `main`
  **seulement après son accord explicite**.

- 24.11.2026 — F1 et F2 faites. Reste F3 : attendre l'accord de l'enseignant avant toute fusion dans `main`.
- [x] F4. Onglets en haut (Accueil, Apprendre, Exercices, Évaluation) et pages séparées pour le choix d'un exercice et
  l'évaluation (`composants/BandeauRubriques.svelte`, `etat.pageAccueil`), sur `apercu`.
- [x] F5. Onglet « Théorie » accessible depuis l'accueil, avec le choix de l'année (1ère CFC, 2ème CFC, Maturité
  professionnelle). Libellés « 1ère CFC » / « 2ème CFC » dans toute l'interface.

- 24.11.2026 — F4 faite et publiée sur la prévisualisation. Restent F3 (accord pour la fusion) et F5.
- 24.11.2026 — F5 faite et publiée sur la prévisualisation. Reste F3 : accord de l'enseignant pour la fusion dans `main`.
- 24.11.2026 — F3 faite : fusion dans `main` demandée par l'enseignant (« Fusionner dans main »). Chantier terminé.

# Chantier « Théorie de référence » (demande du 24.11.2026)

Faire de l'onglet Théorie la référence complète du cours ; les leçons d'Apprendre y renvoient. Règles : aucune
règle ni compte inventé, texte original, rien de validé n'est retiré, nouveau contenu sur `apercu` et marqué
« À relire », une année à la fois, fusion dans `main` seulement après accord explicite. Détails dans CLAUDE.md.

- [x] G1. Proposition : articulation Théorie / leçons, couverture, modèle de chapitre, chapitre TVA en maquette
  (`public/maquettes/theorie-chapitre-tva.html`). Modèle validé par l'enseignant (« Oui, 1ère CFC »).
- [x] G2. Modèle enrichi dans le code (nouveaux blocs, affichage, tests) et 1ère CFC : neuf chapitres
  (`src/data/theorie-cfc1.ts`).
- [x] G3. Relecture de la 1ère CFC par l'enseignant.
- [x] G4. 2ème CFC (TVA selon la maquette, amortissements, transitoires, créances, salaires ; chapitres à créer :
  facturation, budget, marge contributive et répartition des coûts).
- [x] G5. Maturité professionnelle.
- [x] G6. Vérification finale, puis fusion dans `main` après accord explicite ; raccourcir ensuite les leçons.

- 24.11.2026 — G1 et G2 faites. Reste G3 : attendre la relecture de la 1ère CFC avant de rédiger la 2ème CFC.
- 24.11.2026 — G4 faite après l'accord « Oui, 2ème CFC » : huit chapitres dans `src/data/theorie-cfc2.ts`, publiés sur la
  prévisualisation. Reste : relecture de la 1ère et de la 2ème CFC par l'enseignant (G3), puis maturité (G5) sur son accord.
- 24.11.2026 — G5 faite après l'accord « Oui, maturité » : treize chapitres dans `src/data/theorie-mp.ts`, publiés sur la
  prévisualisation. Les 30 chapitres sont enrichis et marqués « À relire ». Reste G3 (relecture des trois années par
  l'enseignant) et G6 (vérification finale, fusion dans `main` sur accord explicite, puis leçons raccourcies).
- 24.11.2026 — Étape 3 (vérification) faite après l'accord « Oui, étape 3 » : calculs des 30 chapitres refaits par un test,
  arrondi aux 5 centimes, comptes des réponses, renvois des modules ; 30 chapitres contrôlés à 360 px ; grands tableaux en
  fiches sur téléphone ; guide complété. `npm test` (591), `check`, `build` et `test:ecrans` (48) sans erreur. Publié sur la
  prévisualisation. G6 reste ouverte pour sa seconde moitié : relecture de l'enseignant, puis fusion dans `main` sur son
  accord explicite, puis leçons d'Apprendre raccourcies.
- 24.11.2026 — Théorie de référence fusionnée dans `main` sur l'accord explicite de l'enseignant. Les chapitres gardent la
  mention « À relire ». Restent : sa relecture et ses réponses aux points comptables signalés, puis les leçons raccourcies.
- 24.11.2026 — Théorie validée par l'enseignant (« c'est validé ») : mention « À relire » retirée des 30 chapitres, publié.
  Chantier clos, sauf la suite prévue : raccourcir les leçons d'Apprendre (à proposer avant de modifier).
- 24.11.2026 — Leçons gardées telles quelles (choix de l'enseignant). Dans un module, lien vers le chapitre de théorie (nouvel
  onglet) à la place du chapitre déplié ; exemples de la théorie changés dans sept chapitres pour ne plus répéter ceux des
  leçons. Publié sur la prévisualisation ; fusion dans `main` sur accord.
- 24.11.2026 — Lien vers la théorie et nouveaux exemples fusionnés dans `main` sur l'accord de l'enseignant.

# Suites de l'audit du 24.11.2026 (rapport `AUDIT_COMPTA_PME.md`, commité le 25.11.2026 à la demande de l'enseignant)

Corrections faites une à une, sur accord de l'enseignant, d'abord sur `apercu`.

- [x] E1. « Bilan en direct » : la perte de l'exercice n'est plus comptée deux fois. Blocs, totaux et effet de la dernière
  écriture calculés par `src/engine/bilan-vivant.ts` à partir de `bilan()` ; test `tests/bilan-vivant.test.ts` sur tous les
  corrigés ; contrôle à l'écran dans `e2e/eleve.spec.ts`. Fait le 24.11.2026, à commiter et publier sur accord.
- [x] E2. Bouclement par 9000 : la correction accepte une clôture complète des comptes de charges et de produits par 9000
  (`clotureDeGestionPar9000`), une clôture partielle reste fausse ; phrase du chapitre Journal réécrite selon la méthode du
  18.11.2026. Fait le 24.11.2026, à commiter et publier sur accord.
- [x] E4. Pièce hors énoncé : une écriture de bouclement se reconnaît à ses comptes (compte de résultat, ou virement entre
  privé et capital) ; toute autre pièce hors énoncé reste dans les comptes et est signalée à l'élève (journal) et à
  l'enseignant (détail de la copie, `CorrectionCopie.piecesHorsEnonce`). Fait le 24.11.2026, à commiter et publier sur accord.
- [x] E5. Répartition : des tantièmes sont refusés sans un dividende d'au moins 5 % du capital (art. 677 CO) ; message
  plus clair quand la perte reportée dépasse le bénéfice. Fait le 25.11.2026, à commiter et publier sur accord.
- [x] E6. Imprimerie du Mandement : passif transitoire d'ouverture porté de 900.00 à 2'700.00 (électricité d'octobre à
  décembre), capital d'ouverture de 66'800.00 à 65'000.00, opération 2 et son corrigé à 2'700.00, bénéfice de 30'000.00 à
  31'800.00. Fait le 25.11.2026, à commiter et publier sur accord.
- [x] E9. Classée sans suite le 25.11.2026 : l'enseignant garde la comparaison au centime sur la fiche Facturation
  (« Garder le centime ») ; la fiche sert à vérifier l'arrondi de la TVA aux 5 centimes. Aucun changement de code.
- [x] E3. Règle de l'enseignant (25.11.2026) : tout le matériel informatique en 1521. Mont-Blanc (ouverture et op. 6),
  Lambert (ouverture et op. 13), Zéphyr (op. 2), Électroménager du Rhône (pièces 2 et 4), Atelier Zufferey (station de
  travail, amortissement partagé 1520 / 1521), modèle d'amortissement d'Apprendre. Une session commencée ne reprend le
  corrigé à jour que si le bilan d'ouverture est inchangé (`avecCorrigeAJour`). À commiter et publier sur accord.
- [x] E7. Décision de l'enseignant (25.11.2026) : escompte avec correction de la TVA en maturité seulement. Modèle retiré
  du module Apprendre de 2ème CFC ; leçon TVA de 2ème CFC (partie 6 sur le rabais obtenu) ; dossiers Électroménager du
  Rhône et Cycles du Léman (facturation) passés en maturité niveau 1 (« Passer en maturité »), identifiants inchangés ;
  facturation retirée du fil rouge de l'accueil ; chapitre Facturation de la théorie sans « Pour s'exercer ».
  À commiter et publier sur accord (avec E3, E5, E6).
- [x] E8. Formulaire TVA (25.11.2026) : une vente avec TVA due créditée hors classe 3 (cession d'une immobilisation,
  produit d'immeuble, produit exceptionnel) compte en 200 et au taux, sa contre-prestation étant le montant TVA comprise
  des liquidités ou créances moins la TVA ; commentaire d'en-tête à jour ; limites écrites dans le moteur (220 pour toute
  vente sans TVA, rabais sans TVA hors 235, prélèvement privé non compté). À commiter et publier sur accord.
- [x] Vague 2, verdict visible (25.11.2026) : le verdict est placé au-dessus de la grille de saisie et ramené à l'écran
  après « Valider » s'il n'y est pas ; espace manquante corrigée (« correcte. Passez »). À commiter et publier sur accord.
- [x] Accueil, remarque de l'enseignant (25.11.2026) : « Commencer » sans prénom, nom ou classe amène l'élève au premier
  champ vide (défilement, curseur dans le champ, champs vides en rouge, message sous les champs) ; même chose pour la
  confirmation d'un autre élève. À commiter et publier sur accord.
- [x] Bilan en direct, remarque de l'enseignant (25.11.2026) : « Perte provisoire » et « Bénéfice provisoire » à part,
  effet de l'écriture décrit compte par compte (catégorie du cours) puis sur le résultat provisoire. À commiter et publier
  sur accord.
- [x] Vague 2, statut « Juste avec la solution » (25.11.2026) : verdict, statuts, en-tête, barre et accueil ; essais faux et
  solution vue dans le détail d'une copie. Fusionné dans main le 25.11.2026.
- [x] Raisonnement en trois questions sous la solution du journal (25.11.2026) : `src/engine/raisonnement.ts`
  (`raisonnementEcriture`, écritures simples et composées, d'après le solde de chaque compte ; même texte que l'exemple
  travaillé d'Apprendre) ; pas de raisonnement automatique pour les comptes correctifs 1xx9, 3209, 4209, 3805, 4280,
  2970 ni pour le bouclement. À commiter et publier sur accord.
- [ ] Les autres actions de la vague 2 : en attente.
