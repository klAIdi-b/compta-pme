# Audit de Compta PME par quatre spécialistes

Date : 24.11.2026. Branche auditée : `apercu` (commit d111856), identique en contenu à `main`.
État de départ : `npm test` 592 tests réussis, `npm run check` sans erreur, `npm run build` réussi (script principal 127,7 ko compressés). Dépôt propre, `apercu` en retard de trois commits de fusion sur `origin/main`.

Méthode : quatre sous-agents en lecture seule, chacun avec un contexte neuf (expert-comptable, enseignant de comptabilité, web designer, spécialiste marketing et gamification). Phase 1 : audit indépendant. Phase 2 : deux tours de confrontation écrite. Phase 3 : arbitrage de l'orchestrateur. Aucun fichier de l'application n'a été modifié ; ce rapport est le seul fichier créé.

**Suites données (état au 25.11.2026).** E1 (bilan en direct), E2 (bouclement par 9000), E4 (pièce hors énoncé), E5 (tantièmes) et E6 (Imprimerie du Mandement) sont corrigées et publiées. E3 est corrigée selon la règle de l'enseignant : tout le matériel informatique en 1521. E7 est corrigée selon sa décision : l'escompte avec correction de la TVA est enseigné en maturité seulement ; les dossiers Électroménager du Rhône et Cycles du Léman (facturation) sont passés en maturité. E9 est classée sans suite : la fiche Facturation garde la comparaison au centime. E8 reste à faire. Les autres actions du rapport n'ont pas encore été engagées.

Comment lire les niveaux de preuve. « Essai » : le comportement a été reproduit par un script. « Lecture du code » : déduit du code, non exécuté. « Source » : texte officiel lu en ligne. Les constats critiques ont été revérifiés par l'orchestrateur (voir section 2). Les références de recherche citées par les spécialistes n'ont pas toutes été relues en texte intégral : la section 6 dit lesquelles.

---

## 1. Synthèse

Le moteur comptable est solide : sur 541 écritures de 45 corrigés, aucune erreur de calcul n'a été trouvée, et 25 corrigés ont été recalculés à la main. Les problèmes sont ailleurs. Voici les cinq plus importants.

**1. Le logiciel contredit ou refuse des réponses justes.**
Quatre cas démontrés. Le « Bilan en direct » affiche « le bilan n'est plus équilibré » après une écriture juste, dès la première opération de la démonstration de 1ère CFC (157 états sur 541 concernés, dans 30 exercices). Le bouclement « par 9000 », que la théorie décrit, est noté faux quand le bouclement est corrigé. Les comptes 1520 et 1521 sont utilisés de façon incohérente entre corrigés. Une opération saisie sous un numéro de pièce inattendu fausse la correction du bouclement. Tant que ces points ne sont pas corrigés, aucun message de réussite ne peut être digne de confiance.

**2. Le retour immédiat, promesse centrale de l'outil, n'est pas vu et ne dit pas tout.**
Après « Valider l'écriture », le verdict est hors de l'écran sur ordinateur comme sur téléphone. Une écriture recopiée après « Voir la solution » compte comme « Juste », sans distinction. Une notion est déclarée « Maîtrisée » en une seule série : au module Bilan, un élève qui devine les variations y parvient dans 26 % des séries. Toute gamification posée là-dessus récompenserait le tâtonnement.

**3. L'évaluation notée a trois faiblesses.**
La « variante d'évaluation » garde les textes de l'exercice public : l'élève retrouve les comptes du corrigé dans un second onglet. Le barème par défaut de 1 point rend les points partiels presque nuls sur les écritures composées. L'enseignant ne peut pas corriger à la main les points d'une opération.

**4. La froideur vient de choix cohérents, pas d'un défaut d'exécution.**
Toutes les surfaces sont en gris bleuté, la réussite est annoncée comme un constat administratif, il n'y a aucun visuel hors de l'accueil. L'accessibilité est bonne (aucune violation détectée sur 60 états d'écran). Les parcours d'entrée sont à revoir : lien `?exercice=` sur téléphone, saisie au journal sur téléphone, liste de 31 modules sans filtre.

**5. Rien n'est prêt pour un collègue d'une autre école.**
Le dépôt public n'a pas de licence. Des exercices tirés de manuels y sont toujours suivis par Git, alors que les notes locales du projet les disent retirés. La page de présentation pour les enseignants existe mais aucun lien n'y mène. La phrase « aucune donnée envoyée en ligne » n'est plus exacte depuis le simulateur en ligne. Le guide décrit un accueil qui n'existe plus et ne mentionne pas le simulateur.

Ordre conseillé : corriger d'abord ce qui est faux (problème 1), puis rendre le retour visible et honnête (problème 2), et seulement ensuite réchauffer la présentation et introduire la gamification.

---

## 2. Erreurs comptables trouvées

Classement : erreur avérée, puis écart entre usage scolaire et pratique (non tranché, à votre décision), puis point non vérifié.

### 2.1 Erreurs avérées

| N° | Où | Constat | Correction proposée | Preuve ou source |
|---|---|---|---|---|
| E1 | `src/ui/composants/BilanVivant.svelte` l. 31, avec `src/engine/statements.ts` l. 164 à 170 | Le « Bilan en direct » compte la perte de l'exercice deux fois. Démonstration 1ère CFC après l'opération 1 : actif affiché 102'600.00, passif 97'800.00, message « le bilan n'est plus équilibré », alors que le moteur donne 97'800.00 des deux côtés. | Prendre les totaux et la ligne de perte dans le résultat de `bilan()`, sans rien recalculer dans le composant. Test d'écran sur tous les corrigés. Effort faible. | Essai (157 états sur 541 affichés déséquilibrés). Relu par l'orchestrateur : le moteur ajoute déjà un groupe « Perte de l'exercice » à l'actif, le composant l'ajoute une seconde fois. |
| E2 | `src/engine/correction-bouclement.ts` ; `src/data/theorie.ts` l. 552 ; phrase de `CLAUDE.md` | Le bouclement qui solde charges et produits par 9000 est refusé quand la correction du bouclement est activée : 15 points sur 18, note 5 au lieu de 6. La théorie affichée décrit pourtant cette méthode, et `CLAUDE.md` affirme que ces travaux « restent justes ». | Les deux : réécrire la phrase de théorie selon la méthode du 18.11.2026, et faire accepter la réponse (neutraliser les lignes qui soldent exactement une charge ou un produit contre 9000 ; une clôture partielle reste fausse). Corriger la phrase de `CLAUDE.md`. Effort moyen. | Essai, relancé par l'orchestrateur : diagnostic « erronée », 0 point sur 3 au bouclement. |
| E3 | `src/data/exercices-manuel.ts` l. 369, 481, 522, 588 ; `src/data/dossiers/cfc-manuel-tva.ts` ; `src/data/dossiers/mp-operations.ts` ; à comparer avec `src/data/demo-cfc1.ts` (opération 8) | 1520 « Machines de bureau » et 1521 « Infrastructure informatique » sont employés sans règle. Un énoncé écrit « infrastructure informatique » et son corrigé attend 1520 ; ailleurs un ordinateur va en 1521. L'élève qui choisit le compte par son nom est jugé faux. | Fixer une règle avec vous (par exemple tout matériel informatique en 1521), puis aligner énoncés et corrigés. Masquer un des deux comptes ne suffit pas. Effort faible. | Lecture des corrigés. Aucune source légale : c'est une incohérence interne. |
| E4 | `src/engine/correction-bouclement.ts` l. 25 à 36 | Toute écriture dont la pièce n'est pas un numéro d'opération est traitée comme une écriture de bouclement et retirée des comptes « avant bouclement ». Opération 3 saisie sous « 3a » : le logiciel attend le virement d'une perte de 2'870.00 alors que les comptes de l'élève montrent un bénéfice de 3'530.00. Double pénalité. | Reconnaître une écriture de bouclement à ses comptes (9000, ou virement entre Privé et Capital, 2970 en société). Signaler à l'élève et à l'enseignant toute autre pièce hors énoncé. Effort moyen. | Essai. |
| E5 | `src/engine/repartition.ts` l. 57 à 81 | Des tantièmes sont acceptés avec un dividende de 2 %. | Refuser ou signaler des tantièmes quand le dividende est inférieur à 5 % du capital. Effort faible. Aucun exercice fourni n'est touché (tantièmes toujours à zéro). | Art. 677 CO, Fedlex, état au 01.01.2026. |
| E6 | `src/data/exercices-proposes.ts`, exercice `prop-cfc2-imprimerie-mandement`, opérations 1 à 3 | Le bilan d'ouverture porte 900.00 de passif transitoire pour l'électricité, alors que la facture impayée du trimestre est de 2'700.00. Le corrigé suit l'énoncé, mais le scénario contredit la délimitation des exercices qu'il enseigne. | Porter le passif transitoire d'ouverture à 2'700.00 et ajuster le capital, ou limiter la facture à décembre. Effort faible. | Calcul. |
| E7 | `src/engine/ecritures-generees.ts` l. 48 à 52 ; dossier `dossier-cfc2-electromenager-du-rhone-tva` ; `src/data/theorie-cfc2.ts` l. 6 | L'escompte avec correction de la TVA est demandé en 2ème CFC (module Apprendre et dossier), alors que la théorie de 2ème CFC ne l'explique pas et le classe en maturité. Les écritures elles-mêmes sont justes. | Votre décision, déjà en attente : le placer en 2ème CFC (et l'ajouter au chapitre) ou en maturité (et le retirer du module et du dossier). Effort faible. | Art. 41 LTVA pour la justesse des écritures. |
| E8 | `src/engine/formulaire-tva.ts` l. 24 à 28 et 75 à 103 | Le formulaire ne compte comme contre-prestation qu'un crédit en classe 3. Une vente avec TVA créditée ailleurs (cession d'immobilisation, produit d'immeuble) laisse sa TVA hors du chiffre 399. Toute vente sans TVA est classée en 220. Sans effet sur les deux exercices où le formulaire est activé. | Étendre la détection à toute ligne créditée accompagnée d'un crédit à TVA due, et documenter les limites dans l'éditeur. Effort moyen. | Lecture du code. Formulaire officiel non relu par l'expert. |
| E9 | `src/engine/facturation.ts` | La fiche Facturation compare les montants au centime, alors que la correction du journal tolère 5 centimes. Un élève qui écrit 20.24 au lieu de 20.25 est jugé faux. | Appliquer la même tolérance de 5 centimes. Effort faible. | Lecture du code. |

### 2.2 Écarts entre l'usage scolaire et la pratique professionnelle

L'expert-comptable les décrit sans les trancher. L'enseignant auditeur conseille de garder l'usage du cours en 1ère et 2ème CFC et d'ajouter une phrase « en pratique » en maturité seulement. La décision vous revient.

| Sujet | Usage du logiciel | Pratique ou texte de loi | Source |
|---|---|---|---|
| Perte de l'exercice au bilan | À l'actif, sur une ligne séparée (votre choix validé) | En diminution des capitaux propres | Art. 959a al. 2 ch. 3 let. g CO |
| Pertes sur créances d'une entreprise assujettie | Perte passée TVA comprise, sans toucher la TVA due | La contre-prestation corrigée réduit la TVA due | Art. 41 al. 1 LTVA |
| Impôt anticipé d'une raison individuelle | Porté en 1176 Créances AFC (dossier Terroirs du Monde, théorie de maturité) | Pour une personne physique, le remboursement se demande au canton, dans la déclaration du propriétaire ; en pratique l'impôt anticipé va au compte privé. Conforme pour une société. | Art. 30 al. 1 LIA |
| Dissolution d'une provision ou d'une réserve latente | Crédit du compte de charge d'origine | Même écriture si la correction concerne l'exercice ; sinon souvent en produits exceptionnels, avec mention dans l'annexe | Art. 959b al. 2 ch. 9 et 959c al. 1 ch. 3 CO |
| TVA de chaque facture | Arrondie aux 5 centimes | Les logiciels calculent au centime ; seuls les paiements en espèces s'arrondissent | Aucune source officielle consultée |
| Ducroire | Forfait de 5 % des créances, créances douteuses exclues et sans correction propre | Correction de valeur individuelle sur la créance douteuse, forfait en plus sur le reste | Taux fiscal non vérifié |
| Frais d'émission d'actions | Passés en charge (6550) | L'agio va à la réserve « sous déduction des frais d'émission » ; les deux traitements existent | Art. 671 al. 1 ch. 1 CO |
| Intitulé du compte 2960 | « Réserves libres » | « Réserves facultatives issues du bénéfice » (un énoncé généré emploie ce terme, que l'élève ne retrouve pas dans la liste) | Art. 673 CO |

### 2.3 Points confirmés sur une source officielle

Ces points figuraient comme « à confirmer » dans `CLAUDE.md` et peuvent en être retirés.

- Art. 672 CO (réserve légale, 5 %, plafond de 50 %, 20 % pour une holding) : conforme.
- Art. 725a et 725b CO (perte de capital, surendettement) : conformes. Le logiciel omet la précision « non remboursables aux actionnaires », simplification admissible.
- Art. 10 et 25 LTVA, taux de 8,1, 2,6 et 3,8 % : conformes (page de l'AFC).
- Art. 26 al. 2 LTVA (mentions de la facture) : les six lettres sont couvertes. Deux nuances à ajouter au chapitre : la date de la prestation n'est exigée que si elle diffère de la date de la facture ; si l'impôt est inclus dans le prix, le taux suffit.
- Impôt anticipé de 35 % : art. 13 LIA.
- Droit de timbre de négociation de 0,075 % par partie pour des titres suisses : art. 16 et 17 LT. Pour des titres étrangers, 0,15 % (à dire dans la leçon).

### 2.4 Points non vérifiés

- Compte courant généré (`src/engine/calculs.ts` l. 245 à 274) : l'exercice retient 35 % d'impôt anticipé sur des intérêts de 200 francs ou moins dans environ un tirage sur trois. L'art. 5 al. 1 let. c LIA exonère ces intérêts, mais la condition liée au bouclement annuel n'a pas pu être vérifiée. À traiter comme un risque d'erreur : faire tirer des intérêts supérieurs à 200 francs règle la question sans la trancher.
- Formulaire officiel 0550 de l'AFC : non relu par l'expert (il s'en remet à la vérification notée dans `CLAUDE.md`).
- Taux AVS/AI/APG et AC de 2026 : lus dans un résumé, pas dans le document de l'OFAS.
- Paramètres LPP et taux d'allocations familiales du dossier Confiserie du Bourg-de-Four : non vérifiés pour 2026.
- Base de calcul du droit de timbre (avec ou sans intérêt couru).
- Vingt corrigés n'ont été contrôlés que par script (équilibre, comptes, TVA, arrondi), pas recalculés à la main. La théorie de 1ère CFC, les fiches, le simulateur et les PDF n'ont pas été relus par l'expert.

---

## 3. Les 15 actions prioritaires

Classées par impact puis par effort. Porteur : C expert-comptable, E enseignant, D designer, M marketing et gamification.

| Rang | Action | Impact | Effort | Porteur |
|---|---|---|---|---|
| 1 | Corriger le « Bilan en direct » (E1) et ajouter le test d'écran sur tous les corrigés | Très fort | Faible | D, C |
| 2 | Bouclement par 9000 : corriger la phrase de théorie et accepter la réponse (E2) | Très fort | Moyen | C, E |
| 3 | Règle 1520 et 1521, puis alignement des énoncés et corrigés (E3) | Fort | Faible | C |
| 4 | Pièce hors énoncé : reconnaître le bouclement par ses comptes et signaler la pièce (E4) | Fort | Moyen | C |
| 5 | Verdict visible sans défiler, au-dessus de la grille ou collé en bas sur téléphone ; espace manquante corrigée | Très fort | Moyen | D |
| 6 | Statut « Avec la solution » distinct de « Juste », raisonnement en trois questions dans la solution, colonne « essais et solution vue » dans les copies | Très fort | Faible à moyen | E, M, D |
| 7 | Maîtrise d'une notion : minimum par format de question, état « Réussie une fois, à confirmer » | Fort | Faible | E, M |
| 8 | Variante d'évaluation : dire sa limite dans le guide, puis permettre de changer l'entreprise et l'ordre des opérations | Fort | Faible puis moyen | E |
| 9 | Notation : barème par défaut de 2 points dès trois comptes ou côtés, seuil du 4 affiché, correction manuelle des points par l'enseignant | Fort | Moyen | E, C |
| 10 | Lien `?exercice=` : écran court avec les trois champs, focus et erreur visibles | Fort | Moyen | D |
| 11 | Progression attachée à un élève et reprise par fichier (copie et progression Apprendre) | Fort | Moyen | E, M |
| 12 | Trancher le sort des contenus tirés de manuels encore suivis par Git, puis publier une licence et un README pour collègue | Fort | Faible | M |
| 13 | Apprendre : liste filtrée par année, carte entière cliquable, « Classer les pièces » remonté, module Bilan sans débit ni crédit | Moyen | Faible à moyen | E, D |
| 14 | Textes publics : « aucune donnée d'élève en ligne », page « Données », page de présentation à jour et liée, guide à jour avec le simulateur | Moyen | Moyen | M |
| 15 | Saisie sur téléphone : débit et crédit côte à côte dès 600 px, date repliée, « Valider » collé en bas, bilan en direct replié | Moyen | Moyen | D |

Le réchauffement de la palette et la gamification viennent après les actions 1 à 7 : c'est la seule condition sur laquelle les quatre spécialistes sont d'accord sans réserve.

---

## 4. Constats détaillés par spécialiste

### 4.1 Expert-comptable (20 constats : 4 critiques, 7 importants, 9 de confort)

Les constats 1 à 8 et le constat sur la facturation sont repris en section 2.1, les écarts d'usage en 2.2. Constats restants :

- **Message de la répartition** (confort, `src/engine/repartition.ts` l. 62 à 68) : quand la perte reportée dépasse le bénéfice, le message parle d'« attributions prévues » même sans attribution. Effort faible.
- **Seuil de l'art. 957 CO** (confort, `src/data/theorie-cfc1.ts` l. 113 et `src/data/theorie.ts` l. 188) : « atteint 500'000 francs » au lieu de « supérieur à 500'000 francs ». Effort faible.
- **Part patronale** (confort) : toujours égale à la part salariale ; en pratique s'ajoutent les frais d'administration de la caisse. Écrire sur les pièces « taux de l'exercice, donnés ».
- **Pièce hors énoncé sans correction du bouclement** (confort) : l'écriture n'est ni corrigée ni pénalisée alors qu'elle modifie les comptes.
- **Question sur les US GAAP** (confort, `src/engine/calculs.ts` l. 585) : formulation à nuancer, non vérifiée.
- **Sans remarque** après relecture complète : livres auxiliaires, marge contributive, répartition des coûts, déclaration de salaire, intérêts, devises, prix à rebours, cession, changement de méthode, rendements, point mort, flux, comptabilité analytique. Arrondi de la note vérifié.

### 4.2 Enseignant de comptabilité (16 constats : 1 critique, 12 importants, 3 de confort)

1. **Variante d'évaluation contournable** (critique, `src/engine/variante.ts` l. 44 à 60, guide l. 351 à 362). Effort faible pour le dire, moyen pour y remédier.
2. **« 2ème CFC » ne correspond pas à la 2e année du plan cantonal** (important, `src/data/apprendre.ts`). Le plan place en 2e année le budget, la facturation et le contrôle des paiements ; la comptabilisation, les salaires et la marge contributive sont en 3e année, option Finances. Sept modules de 1ère CFC n'ont aucun code d'objectif. Effort faible à moyen.
3. **Codes de maturité fondés sur un plan transitoire, ordre des modules sans rapport avec les semestres** (important). Le nouveau plan d'études cadre fédéral est en vigueur depuis le 01.03.2026 ; son contenu n'a pas été lu. Effort faible.
4. **Module Bilan** (important) : l'exemple travaillé emploie débit et crédit avant le module qui les enseigne, et 1'997 mots précèdent la première question. Effort faible à moyen.
5. **« Classer les pièces » placé après la synthèse** (important). Effort faible.
6. **Liste Apprendre de 31 modules sans filtre d'année** (important). Effort faible.
7. **« Maîtrisé » en une série** (important, `src/engine/exercices-courts.ts` l. 251 et 299). Effort faible.
8. **Erreurs typiques limitées à la 1ère CFC** (important, `src/engine/erreurs-typiques.ts`). Proposer 8 à 10 erreurs typiques de 2ème CFC et autant de maturité, à vous soumettre avant de coder. Effort moyen.
9. **Solution donnée sans raisonnement, et « juste après la solution » compté comme juste** (important, `src/ui/vues/Journal.svelte`, `SyntheseCopies.svelte`). Effort faible à moyen.
10. **Points partiels presque nuls avec le barème de 1 point** (important, `src/engine/notation.ts`). Comptes justes et TVA fausse : 0 point. Effort faible.
11. **Le 4 atteint à 55 % des points, aucun réglage ni correction manuelle** (important). Effort moyen.
12. **Postes partagés : une copie exportée ne se rouvre pas** (important). Effort moyen.
13. **Classement du simulateur sans la comptabilité** (important, `src/ui/vues/simulation/`). Ajouter une colonne « comptabilité » au score. Effort moyen.
14. **Indices génériques peu utiles pour « montant » et « erronée »** (confort, `src/engine/correction.ts` l. 30 à 40). Effort faible.
15. **Dénominations et codes visibles** (confort) : « CFC 1re, CFC 2e » dans le guide (l. 419) et dans `Relecture.svelte` (l. 45) ; codes du plan montrés à l'élève. Effort faible.
16. **Ce qui manque à un collègue** (confort) : tableau « semaine du programme vers module et exercice », consigne Classroom prête à coller, étiquette « socle » ou « pour aller plus loin ». Effort moyen.

### 4.3 Web designer (15 constats : 2 critiques, 7 importants, 6 de confort)

Preuves : 123 captures à 360, 768 et 1440 px, conservées hors du dépôt.

1. **Bilan en direct faux** (critique) : voir E1.
2. **Verdict hors de l'écran** (critique, `src/ui/vues/Journal.svelte` l. 236 et 587) : à 1440 × 900 le message est à 984 px du haut ; à 360 × 740, à 1183 px. Le « Bilan en direct », ajouté après l'amélioration de l'interface, l'a repoussé. Effort moyen.
3. **Réussite annoncée comme un constat administratif** (important) : même gabarit que l'erreur, aucun moment marquant pour le journal terminé, le bouclement ou une notion maîtrisée ; une espace manque (« écriture correcte.Passez »).
4. **Palette entièrement en gris bleuté** (important, `src/ui/theme.css` l. 47 à 62).
5. **Aucun visuel hors de l'accueil** (important) : le module Bilan mesure 12'554 px de haut à 360 px sans un schéma, alors que les composants de bilan et de compte en T existent.
6. **Liste Apprendre plate** (important) : seul le titre de 23 px de haut est cliquable dans une carte de 72 px.
7. **Lien `?exercice=`** (important, `src/ui/vues/Accueil.svelte`) : à 360 px, les champs prénom, nom et classe sont au bas d'une page de 3'996 px ; l'erreur de « Commencer » s'affiche hors de vue.
8. **Saisie sur téléphone** (important) : une écriture simple occupe plus de deux écrans, même à 768 px.
9. **Ton impersonnel** (important) : alerte « Copie jamais exportée » en orange dès la première seconde.
10. **Carte de reprise** (confort) : les manques en couleur, les acquis en gris ; faute d'accord « 1 justes ».
11. **Espace enseignant** (confort) : écran d'arrivée vide, débordement de 16 px à 360 px.
12. **Trois cibles tactiles sous 44 px** (confort) : conformes au critère AA de 24 px, mais pas à la règle interne.
13. **Mouvement réduit** (confort aujourd'hui) : la règle globale coupe les transitions, pas les animations ; aucune durée commune.
14. **Service worker** (confort) : 2,2 Mo mis en cache, dont les maquettes d'archives et trois dépendances facultatives du PDF. Le premier chargement lui-même est bon (environ 185 ko).
15. **Finitions** (confort) : colonne de lecture qui laisse un tiers de carte vide, raccourcis clavier affichés sur téléphone, pastille « Exercice » sans information, bordure de champ à 2,91 : 1 sur le fond de page.

Vérifié sans défaut : aucune violation axe (WCAG 2.2 A et AA) sur 60 états, aucun débordement côté élève, contrastes conformes, focus visible partout.

### 4.4 Marketing et gamification (14 constats : 0 critique après confrontation, 10 importants, 4 de confort)

1. **Page de présentation orpheline** (important) : `public/presentation.html` est en ligne, aucun lien n'y mène.
2. **Dépôt sans licence** (important) : `licenseInfo` nul ; un collègue n'a aucun droit de réutilisation.
3. **README de 17 lignes** (important) : pas de lien vers le site, pas de capture.
4. **Aperçu de partage sans image** (important, `index.html`).
5. **Page de présentation dépassée** (important) : « une trentaine d'exercices », anciennes dénominations, rien sur Apprendre, la Théorie ni le simulateur.
6. **« Aucune donnée envoyée en ligne »** (important) : inexact au mot près depuis le simulateur en ligne, dont l'exception n'est décrite dans aucun texte public.
7. **Guide dépassé** (important, `src/data/guide.ts` l. 37, 55, 388 à 398) : il cite « Que voulez-vous faire ? » et « Reprendre où vous en étiez », qui n'existent plus ; le mot « simulateur » n'y figure pas.
8. **Accueil sans « gratuit, sans compte » et sans phrase pour l'enseignant** (important).
9. **Nom « Compta PME »** (confort) : évoque un logiciel de gestion ; garder le nom, lui attacher une signature fixe.
10. **Conventions du logiciel non documentées** (important) : rien ne dit à un collègue si l'outil convient à son cours (plan, règle 2000 et 2010, bouclement).
11. **Documents de travail et maquettes publiés** (confort).
12. **Aucun canal de signalement, aucune date de version** (important).
13. **Pas de manifeste d'installation** (confort).
14. **Portée géographique non dite** (confort).

Deux préalables trouvés dans le code : la progression Apprendre n'est liée à aucun élève et survit au changement d'élève sur un poste partagé ; un exercice est « Terminé » même si tout a été recopié après « Voir la solution », alors que le suivi des essais existe déjà.

---

## 5. Direction visuelle proposée : « Le cahier bien tenu »

Version finale du designer, après les objections de l'enseignant et de l'expert-comptable.

**Principes**
1. Chaleur dans les surfaces, précision dans les chiffres. On réchauffe les fonds et les textes d'accompagnement ; la grille de saisie, les tableaux et les montants gardent le blanc, les filets et les chiffres tabulaires.
2. Chaque couleur a un rôle. Bleu : structure. Orange : l'action à faire maintenant. Lagon : ce que j'apprends. Or : ce que j'ai retenu durablement. Rouge : une erreur à corriger.
3. Les visuels montrent de la comptabilité : blocs de bilan, comptes en T, pièces. Ni mascotte, ni émoji, ni illustration décorative.
4. Tout fonctionne sans mouvement : chaque animation a un état final qui dit la même chose en texte.

**Palette** (contrastes calculés)

| Rôle | Aujourd'hui | Proposé | Contraste |
|---|---|---|---|
| Fond de page | `#f6f7f9` | crème `#fbf8f3` | sans objet |
| En-têtes | `#f4f6fa` | sable `#f3ede3` | sans objet |
| Cartes, grille, tableaux, états financiers | `#ffffff` | inchangé | sans objet |
| Texte | `#1b2430` | `#1c2b3a` | 13,61 sur crème |
| Texte secondaire | `#56616f` | `#5a6472` | 5,66 sur crème |
| Bordure de champ | `#8793a2` | `#857f78` | 3,96 sur blanc (corrige le 2,91 actuel sur le fond) |
| Lien orange (texte) | `#c4501a` | `#a8420f` | 5,45 |
| Progression (nouveau) | aucun | lagon `#0f6e6a` | 6,07 sur blanc |
| Réussite durable (nouveau) | aucun | or `#f2b233` en liseré, texte `#6b4a00` sur `#fff1c9` | 7,17 pour le texte ; l'or seul ne porte jamais d'information |

Bleu de structure, orange d'action, vert, rouge et couleur des montants négatifs restent inchangés.

**Où s'arrête le crème.** Fond de page, bandeau, pied de page. Restent blancs : cartes, grille de saisie, tableaux, bilan, compte de résultat, comptes en T, pièces, PDF. Aucun or ni lagon dans un état financier.

**Typographie.** Inter reste la seule police. Texte de lecture à 17 px sur une colonne de 68 caractères. Corps à 16 px sous 700 px. Une taille de plus (`--t-32`) pour le titre d'un écran d'arrivée.

**Composants à faire évoluer**
- Verdict d'écriture au-dessus de la grille, texte court et factuel : « Juste : Achats de marchandises au débit, Dettes fournisseurs au crédit. »
- Avancement de l'en-tête en cases, une par opération (juste, avec la solution, à revoir), chaque état avec pictogramme et mot, jamais la couleur seule.
- Carte de module avec anneau de maîtrise, carte entièrement cliquable.
- « Votre mission » avec une vignette faite de données comptables (mini-bilan d'ouverture en blocs).
- Espace enseignant : page d'arrivée en trois actions.

**Célébrations : liste fermée, en entraînement seulement, jamais en évaluation**

| Moment | Condition | Effet et durée | En mouvement réduit |
|---|---|---|---|
| Écriture juste | diagnostic juste, solution non vue | coche tracée, case verte, 240 ms | coche et case fixes |
| Écriture avec la solution | solution vue | aucun effet ; libellé « Avec la solution », case hachurée | identique |
| Journal terminé | toutes les opérations justes | bandeau « 12 seul·e, 3 avec la solution », 480 ms | bandeau fixe |
| Bouclement | bouclement jugé juste par la correction, toutes les opérations justes, sans aide de niveau 2 | double trait tracé sous les totaux, 480 ms | trait présent |
| Notion acquise | 8 sur 10 avec minimum par format | anneau lagon qui se ferme, 480 ms | anneau plein |
| Notion confirmée | révision réussie un autre jour | liseré or et visa daté, 480 ms | état fixe |
| Exercice accompli | bouclement juste | récapitulatif statique | identique |

Abandonné pendant la confrontation : le halo doré à chaque écriture, la célébration du « bilan équilibré » (il l'est par construction, même sur des écritures fausses), le texte « Vous y êtes presque ».

**Évolutions du design system** (`src/ui/theme.css`)
- À modifier : `--c-fond-page`, `--c-fond-2`, `--c-fond-tete`, `--c-zebra`, `--c-texte`, `--c-texte-2`, `--c-bordure`, `--c-bordure-2`, `--c-bordure-3`.
- À ajouter : `--c-action-texte`, `--c-progres`, `--c-progres-fond`, `--c-progres-texte`, `--c-reussite-trait`, `--c-reussite-fond`, `--c-reussite-texte`, `--c-neutre-etat`, `--t-32`, `--r-4`, `--d-1` (120 ms), `--d-2` (240 ms), `--d-3` (480 ms), `--courbe`.
- Classes : `.message.neutre`, `.verdict-colle`, `.etat`, `.anneau`, `.visa`, `.case-avancement`.
- Règle de mouvement réduit étendue aux animations, pas seulement aux transitions.
- Règles de `CLAUDE.md` à réviser avec vous : « fond blanc » (crème pour la page, blanc pour les surfaces de travail), « aucune animation superflue » et l'exception limitée à l'accueil (à étendre aux retours de maîtrise de la liste ci-dessus).
- Méthode du projet : maquette avant tout code (journal avec verdict et jalons, liste Apprendre, mission, à 360 et 1440 px).

---

## 6. Système de gamification proposé

Version finale du spécialiste, après deux tours. Principe commun aux quatre : on ne récompense que ce que le logiciel peut prouver, et rien tant qu'un verdict peut être faux (erreurs E1 à E4).

**Préalables**
- Corrections E1 à E4 et verdict visible.
- Progression attachée à un élève, effacée ou mise de côté quand un autre nom est saisi, et reprise par fichier (copie et progression Apprendre).

**Les neuf mécaniques**

| N° | Mécanique | Ce qu'elle récompense | Fonctionnement sans données en ligne | Avis de l'enseignant auditeur |
|---|---|---|---|---|
| 1 | Paliers par notion | Refaire, puis retenir. « Réussie une fois, à confirmer » : 8 sur 10 avec un minimum par format de question. « Confirmée » : deux révisions réussies à des jours distincts. « Ancrée » : quatre. Jamais retirés. | Clé `compta-pme:apprendre:v1` complétée ; séries générées, donc non mémorisables. | Acceptée. |
| 2 | Carte par année | L'étendue de la maîtrise : anneau « n notions sur N ». Aucun niveau, aucun point d'expérience. | Simple lecture des paliers, aucune donnée de plus. | Acceptée sans niveaux. |
| 3 | Écritures autonomes | Trouver sans la solution. Par écriture : « Seul·e » ou « Avec la solution ». Mention « Terminé en autonomie » à 80 %. Visible dans les copies. | Suivi des essais et de la solution vue, déjà enregistré dans la session et dans la copie exportée. | Acceptée, prioritaire. |
| 4 | Visas (huit au plus) | Un savoir-faire nommé et prouvé : notion confirmée et exercice du chapitre en autonomie, « Bouclement sans aide », « Fil rouge », « Mémoire longue », « Rebond ». Liste dans le carnet, jamais de grille grisée à compléter. | Clé locale avec la date et la preuve. | Sous condition : après les erreurs typiques de 2ème CFC et de maturité ; toutes les opérations justes pour le bouclement. |
| 5 | Semaines de pratique | La pratique répartie. Total cumulé, nombre seul, sans calendrier ni palier. Une semaine compte par une révision due réussie, une série réussie une fois, ou trois écritures autonomes. | Clé locale ; aucune notification. | Sous condition : réussites seulement, nombre seul. |
| 6 | Défi personnel | Un objectif choisi dans une liste de trois ; il disparaît sans commentaire s'il n'est pas atteint. | Clé locale. | Acceptée, en dernier. |
| 7 | Défi de classe | La réussite collective. Cinq questions projetées, réponses sur ardoise, question gagnée à 80 %. Total de classe à partir des fichiers de progression rendus dans Classroom, sans nom affiché. | Projection sans réseau ; fichiers importés par l'enseignant, gardés en mémoire seulement. | Projection acceptée ; fichiers sous condition : total de classe seulement. |
| 8 | Retours positifs | La bonne démarche : une phrase sur un fait vérifié, une coche. L'or est réservé à « confirmée ». | Aucune donnée. | Acceptée ; neutre si la solution a été vue. |
| 9 | Carnet de maîtrise ; simulateur | Une trace personnelle (page unique, PDF marqué « document personnel ») ; pour le simulateur, une colonne « comptabilité » dans le score du groupe. | Fichier de progression en version 2. | Acceptés ; le carnet n'est pas une attestation. |

**Ordre de mise en œuvre** : préalables ; 3 et 1 ; 8 ; 2 et carnet ; 5 ; 7 et simulateur ; 4 ; 6. Chaque étape sur `apercu`, avec votre accord.

**Exclus par les quatre spécialistes** : points, niveaux, monnaie, boutique, vies, chronomètre et bonus de vitesse, série de jours à ne pas perdre, paliers d'assiduité, calendrier d'activité, classement individuel, badge de progrès entre deux séries, collection affichée en grisé, carnet servant d'attestation, toute mécanique en évaluation, tout effet sur la note.

**Les trois conditions de l'expert-comptable**
1. Le déclencheur est une comparaison au corrigé, jamais un état interne (« bilan équilibré », « bouclé »).
2. Aucune célébration tant qu'un verdict peut être faux.
3. Rien pour une écriture recopiée, rien en évaluation.

**Appui de recherche et limites.** L'enseignant auditeur a vérifié en ligne les notices de : Deci, Koestner et Ryan (1999) sur les récompenses et la motivation intrinsèque ; Hanus et Fox (2015) sur les badges et classements imposés en classe ; Sailer et Homner (2020), méta-analyse de la gamification ; Mekler et al. (2017) ; Landers et al. (2017) ; Dijkstra et al. (2008) sur la comparaison sociale ; Roediger et Karpicke (2006) sur l'effet de test ; Cepeda et al. (2006) sur la pratique espacée ; Dunlosky et al. (2013) ; Kluger et DeNisi (1996), Hattie et Timperley (2007), Butler (1988) sur le feedback ; Metcalfe (2017) sur l'apprentissage par l'erreur. Les détails chiffrés de Hanus et Fox et de Butler ne sont connus que par leurs résumés. Les comparaisons avec Khan Academy, Duolingo et Kahoot viennent de la connaissance générale de ces produits, sans nouvel examen.

---

## 7. Désaccords entre spécialistes

### 7.1 Désaccords résolus pendant la confrontation

- Niveaux 1 à 5, calendrier à pastilles, badge « Progrès », paliers de semaines : retirés par le spécialiste marketing à la demande du designer et de l'enseignant.
- Halo doré en saisie et or dès 8 sur 10 : retirés par le designer.
- Célébration du « bilan équilibré » : supprimée à la demande de l'expert-comptable.
- « Série de révisions tenues » de l'enseignant : retirée par lui-même, car un compteur qui retombe est une perte.
- « Rien pendant la saisie » : l'enseignant admet le verdict et la case d'avancement.
- Bouclement par 9000 : l'expert-comptable et l'enseignant s'accordent sur « les deux » (corriger le texte et accepter la réponse).
- Diffusion à d'autres écoles : le spécialiste marketing accepte d'attendre la correction des erreurs E1 à E4.

### 7.2 Désaccords maintenus, avec arbitrage

| Sujet | Positions | Arbitrage de l'orchestrateur |
|---|---|---|
| Gain à refaire une série | Enseignant : aucune récompense sur un écart entre deux séries. Marketing : refaire est de l'entraînement, l'interdire toucherait l'élève faible. | Les deux positions se rejoignent : le meilleur score monte quand l'élève refait une série, mais aucun badge ne récompense l'écart. Retenu. |
| Seuil d'une semaine de pratique | Enseignant : réussites seulement. Marketing : trois portes, sinon l'élève qui débute est exclu. | Les trois portes du marketing sont toutes des réussites. Retenu tel quel. |
| Libellé « Seul·e » ou « Avec la solution » | Enseignant : en fin d'exercice. Marketing et designer : tout de suite, c'est lui qui pèse sur le clic « Voir la solution ». | Affichage immédiat, neutre, sans couleur de récompense. La formulation exacte du libellé vous revient. |
| Rappel d'export | Enseignant : permanent sur les postes partagés. Designer : un avertissement continu n'est plus lu. | Ligne neutre permanente (« Enregistré sur cet appareil seulement »), qui devient un avertissement à la fin du journal et à la sortie. À confirmer par vous, qui connaissez les salles. |
| Ton des erreurs | Designer : commencer par ce que le diagnostic prouve. Enseignant : pas de faux encouragement. | Retenu seulement là où le diagnostic prouve quelque chose (« Les deux comptes sont les bons, les côtés sont inversés »). Texte actuel ailleurs. |
| Points partiels | Enseignant : 1 point par ligne. Expert-comptable : formule inchangée, 2 points par défaut dès trois comptes ou côtés. | La proposition de l'expert-comptable, acceptée par l'enseignant au second tour. C'est une règle de notation : elle demande votre accord. |
| 1520 et 1521 | Enseignant : masquer l'un des deux comptes. Expert-comptable : il faut une règle écrite. | Règle écrite, puis alignement. À vous de la donner. |
| Hauteur minimale des blocs du bilan en direct | Expert-comptable : une proportion faussée est une information fausse. Designer : sous 34 px un bloc ne porte plus son nom, et le montant est écrit. | Garder la hauteur minimale, avec la mention « proportions indicatives ». |
| Lien vers la page enseignant | Designer : pied de page. Marketing : aussi sur l'écran du code de l'espace enseignant. | Les deux emplacements. |

### 7.3 Ce qui reste à trancher par vous

1. **Écarts d'usage** de la section 2.2 : garder l'usage du cours partout, ou ajouter une phrase « en pratique » en maturité.
2. **Règle 1520 et 1521.**
3. **Escompte avec correction de la TVA** : 2ème CFC ou maturité.
4. **« 2ème CFC » et 3e année** : comment votre école répartit réellement TVA, amortissements, ducroire et salaires. L'affichage actuel ne correspond pas à la lecture du plan cantonal faite par l'enseignant auditeur.
5. **Notation** : barème de 2 points dès trois lignes ; note au demi ou au dixième ; correction manuelle par l'enseignant.
6. **Fond de page crème** : il modifie la charte « fond blanc » validée. À juger sur maquette.
7. **Contenus tirés de manuels dans le dépôt public** : `src/data/exercices-manuel.ts` et trois fichiers `src/data/dossiers/cfc-manuel*.ts` sont suivis par Git, alors que vos notes locales les disent retirés. Vérifié par l'orchestrateur. Cette question précède le choix d'une licence.
8. **Licence** du code et des contenus, avec l'accord de l'école si elle a des droits sur le travail.
9. **Condition d'essai** posée par l'enseignant auditeur : tester chaque lot de gamification avec une classe volontaire, et le retirer si le nombre de « Voir la solution » augmente ou si les élèves faibles décrochent. Mesurable à la main, par les copies rendues.
10. **Désactivation** de la gamification par l'élève et par exercice (par classe, c'est impossible sans compte).

---

## 8. État des chantiers marqués « à relire » dans CLAUDE.md

| Chantier | État | Remarques |
|---|---|---|
| Référence pédagogique du 23.11.2026 (Apprendre 1ère CFC, exercices courts, erreurs typiques, bilan par notion) | Relu avec corrections (enseignant) ; non relu par l'expert-comptable | Constats enseignant 4, 5, 7, 8 |
| Plan d'études complet : seize modules de calcul (`calculs.ts`) | Relu avec corrections | Impôt anticipé sous 200 francs (non vérifié), titres étrangers à 0,15 % ; treize modules sans remarque |
| Écritures générées de 2ème CFC et de maturité | Relu avec corrections | E7, terme « réserves facultatives » |
| Formulaire officiel de décompte TVA | Relu avec corrections | E8 ; formulaire officiel non relu |
| Refonte de l'expérience du 23.11.2026 | Relu avec corrections (designer) | Lien direct, saisie sur téléphone, ton |
| Amélioration de l'interface, parties 1 à 6 | Relu avec corrections (designer) | Le verdict placé en partie 1 est de nouveau hors écran ; cibles et mouvement réduit |
| Bilan en direct, entraînement guidé, révision espacée (chantier B) | Relu avec corrections | E1 ; révision espacée sans remarque |
| Suivi de la progression, « Classer les pièces », question projetée (chantier C) | Relu avec corrections | Progression non liée à un élève ; ordre du module |
| Leçons d'Apprendre | Relu en partie | Sans erreur comptable relevée sur les passages chiffrés ; longueur du module Bilan |
| Théorie de 1ère CFC | Non relue par l'expert-comptable | Formulation du seuil de l'art. 957 CO |
| Théorie de 2ème CFC | Relue en partie | Chapitre TVA relu en entier, sans erreur |
| Théorie de maturité | Relue en partie | Sociétés, perte de capital, intérêts, bordereau : conformes, avec les nuances de la section 2 |
| Lot E, chapitre 14 (Maison Lacroix, Électroménager du Rhône) | Relu avec corrections | Calculs justes ; E3 et E7 |
| Lot F, chapitres 22 à 24 (Brodard, Mont-Blanc, Truffaz) | Relu avec corrections | Calculs justes ; E3 ; écart sur le ducroire |
| Lot G, chapitre 25 (Confiserie du Bourg-de-Four) | Relu sans erreur de calcul | Paramètres LPP et allocations non vérifiés pour 2026 |
| Lot H, chapitre 35 (Lambert Horlogerie) | Relu avec corrections | E3, opération 13 |
| Lot I, maturité (Zéphyr, Rive Gauche) | Relu sans erreur de calcul | E3 ; écart sur les frais d'émission |
| Simulateur d'entreprise | Non relu | Seul le classement a été examiné |
| Accueil, onglets, Théorie libre | Relu (designer) | Constats de finition |

---

## 9. Nouvelle rédaction proposée pour la règle de CLAUDE.md sur la gamification

À placer dans la section « Pédagogie », à la place de « aucune gamification (sauf le simulateur d'entreprise…) ». `CLAUDE.md` n'a pas été modifié.

> **Gamification (décision de l'enseignant du 24.11.2026, remplace « aucune gamification »).** Elle est souhaitée dans toute l'application, à une condition : récompenser la maîtrise et la progression réelles, jamais le temps passé, les clics ni la vitesse.
> - **Ce qui déclenche une récompense** : une réussite que le logiciel peut prouver par comparaison au corrigé, obtenue sans « Voir la solution » ni aide de niveau 2. Un statut durable (notion confirmée, visa) demande en plus une réussite à un autre jour. Un état interne (« bilan équilibré », « bouclé ») ne suffit jamais.
> - **Privé par défaut** : la progression n'est visible que de l'élève. L'enseignant la reçoit par fichier, sans rang. Aucun classement individuel. Comparaison entre équipes seulement dans le simulateur, sur décision de l'enseignant.
> - **Sans perte** : un palier acquis n'est jamais retiré, aucun compteur ne retombe à zéro, aucune série à « ne pas perdre », aucune fausse urgence, aucune notification.
> - **Absente des évaluations**, sommatives et formatives, et sans aucun effet sur la note.
> - **Interdits** : points, niveaux, monnaie, boutique, vies, chronomètre, bonus de vitesse, classement nominatif, collection affichée en grisé.
> - **Données** : tout reste dans le navigateur de l'élève ; échange par fichier seulement ; aucun envoi en ligne. Les défis de classe passent par la projection ou par des fichiers remis à l'enseignant.
> - **Messages** : un retour positif nomme ce que l'élève sait faire, avec le vocabulaire du cours. Pas de félicitation sans fait vérifié.
> - **Réglage** : l'élève peut masquer ces éléments ; l'enseignant peut les désactiver par exercice.
> - **Méthode** : chaque mécanique est d'abord essayée sur `apercu` et validée par l'enseignant avant fusion dans `main`.

Deux autres lignes de `CLAUDE.md` sont à réviser en conséquence : « aucune animation superflue » avec l'exception limitée à l'accueil, et la liste « restent interdits partout : émojis, points, badges, classements, mascotte… », où « badges » devient « visas de maîtrise selon la règle ci-dessus ». Émojis, mascotte, dégradés décoratifs et effets de verre dépoli restent interdits.

---

## 10. Plan en trois vagues

**Vague 1 : corrections rapides.** Elle ne demande aucune décision de fond, sauf les points signalés.
- E1 « Bilan en direct », avec son test d'écran.
- E2 bouclement par 9000 (phrase de théorie, acceptation de la réponse, phrase de `CLAUDE.md`).
- E4 pièce hors énoncé.
- E3 comptes 1520 et 1521, dès que vous aurez donné la règle.
- E5 tantièmes, E6 Imprimerie du Mandement, E9 tolérance de la fiche Facturation.
- Verdict visible sans défiler, espace manquante, accord « 1 juste ».
- « Classer les pièces » remonté ; dénominations « 1ère CFC » et « 2ème CFC » dans le guide et dans Relecture.
- Guide : limite de la variante d'évaluation, libellés de l'accueil mis à jour.
- Textes publics : « aucune donnée d'élève n'est envoyée en ligne ».
- Tirage du compte courant au-dessus de 200 francs d'intérêt.

**Vague 2 : améliorations de fond.** Chacune sur `apercu`, avec maquette quand l'interface change.
- Statut « Avec la solution », raisonnement en trois questions dans la solution, colonne « essais et solution vue » dans les copies.
- Maîtrise avec minimum par format, paliers « à confirmer » puis « confirmée ».
- Progression attachée à un élève et reprise par fichier.
- Lien `?exercice=` en écran court ; saisie sur téléphone.
- Apprendre filtré par année, carte cliquable, module Bilan sans débit ni crédit.
- Notation : barème de 2 points dès trois lignes, seuil affiché, correction manuelle.
- Variante d'évaluation renforcée (entreprise et ordre des opérations).
- Palette réchauffée, sur maquette.
- Retours positifs et célébrations de la liste fermée.
- Page de présentation à jour et liée, page « Données », page « Conventions du logiciel », README, image de partage.
- Décision sur les contenus de manuels, puis licence.

**Vague 3 : chantiers longs.**
- Carte par année, carnet de maîtrise, semaines de pratique.
- Défi de classe par projection et par fichiers ; colonne « comptabilité » du simulateur.
- Visas, puis défi personnel.
- Erreurs typiques de 2ème CFC et de maturité, à vous soumettre avant de coder.
- Schémas dans les leçons de 1ère CFC.
- Formulaire TVA étendu (E8).
- Correspondance avec les plans d'études : codes d'objectifs, découpage entre 2ème CFC et 3e année, modules de maturité par semestre, page « Planifier l'année ».
- Espace enseignant en trois actions ; service worker allégé ; manifeste d'installation.

---

## Annexe : ce que cet audit n'a pas couvert

- Aucun essai sur un appareil réel, sur Safari ou Firefox, ni avec un lecteur d'écran.
- Le mode évaluation, le simulateur, les écrans TVA, facturation, budget et salaires n'ont pas été capturés par le designer.
- Les jalons de fin d'exercice (journal terminé, bouclement, fin de série) ont été jugés d'après le code.
- Le nouveau plan d'études cadre fédéral de la maturité professionnelle (en vigueur depuis le 01.03.2026) et le plan de formation fédéral du CFC n'ont pas été lus en texte intégral.
- Aucune mesure Lighthouse.
- Les rapports complets des quatre spécialistes, leurs réponses des deux tours et les 123 captures sont dans le dossier de travail de la session, hors du dépôt. Ce dossier est temporaire : dites-moi si vous voulez les conserver.
