# Simulateur d'entreprise — cahier des charges

Proposition du 20.11.2026. **Décisions de l'enseignant reportées le 20.11.2026** (§ 12). Les points marqués ❓ restent à valider.

## 1. En une phrase

Des groupes d'élèves dirigent chacun une entreprise fictive sur un même marché genevois. À chaque tour, ils prennent des décisions (prix, achats, publicité…). Le simulateur calcule les ventes de chacun, produit les pièces comptables du tour, puis la comptabilité est tenue soit par les élèves dans Compta PME, soit automatiquement.

## 2. Choix déjà faits par l'enseignant (20.11.2026)

- Un **module de Compta PME**, qui réutilise le moteur comptable, les pièces, la correction et l'espace enseignant.
- Des **groupes en concurrence** sur un marché commun, avec des tours lancés par l'enseignant.
- La comptabilité est **au choix de l'enseignant** : saisie par les élèves ou automatique.
- Le simulateur **s'adapte au niveau et à la durée** du projet.
- **Mise en ligne acceptée** pour les seules données du jeu, qui sont anonymes (voir § 8).

## 3. Créer une partie : les réglages

| Réglage | Valeurs | Effet |
|---|---|---|
| Niveau | AFP, CFC 1, CFC 2, MP | Décisions disponibles, pièces produites, comptes de l'exercice (§ 4) |
| Nombre de tours | 3 à 12 | Durée du projet en classe |
| Durée d'un tour | mois ou trimestre | 4 trimestres = une année complète en 4 tours seulement |
| Comptabilité | automatique / saisie par les élèves / mixte | En mode mixte, l'enseignant coche les tours à saisir (par exemple le premier et le dernier) |
| Mode de la saisie | entraînement / formative / évaluation | Les modes existants de Compta PME |
| Clôture | aucune / bouclement à la fin / bouclement + répartition (MP) | Disponible seulement si l'exercice fictif est complet |
| Secteur | vélos et trottinettes / épicerie fine / matériel informatique | § 5 bis |
| Imprévus | activés ou non, par type | § 6 |
| Résultats affichés | **classement (par défaut)** / tableau sans rang / caché | § 7 |

Formats proposés, modifiables :

| Format | Séances | Tours | Exercice fictif |
|---|---|---|---|
| Éclair | 2 à 3 | 3 × 1 mois | un trimestre, sans bouclement |
| Court | 4 à 6 | 4 × 1 trimestre | une année avec bouclement |
| Long | un semestre | 12 × 1 mois | une année avec bouclement, en MP avec répartition |

Ordre de grandeur d'un tour en classe : 15 à 20 minutes de décisions, puis 0 à 45 minutes de saisie selon le niveau et le mode.

## 4. Ce que chaque niveau ajoute

Chaque niveau reprend tout ce que contient le précédent. Les numéros de compte cités viennent de `src/data/plan-pme.csv`. **Aucune nouvelle règle comptable** : le simulateur produit des opérations que le cours traite déjà.

| Niveau | Décisions des groupes | Pièces et comptes produits |
|---|---|---|
| AFP | Prix de vente, quantité achetée, budget de publicité | **Comptabilité toujours automatique, sans saisie** (décidé). Les élèves remplissent une fiche de calcul simple : chiffre d'affaires, coût des marchandises vendues, marge, charges, bénéfice, trésorerie. Aucun niveau AFP n'est ajouté au plan comptable |
| CFC 1 | + choix du fournisseur (prix ou délai), paiement comptant ou à 30 jours, ventes à crédit, prélèvement privé | + 1000, 1020, 1100, 1200, 2000, 2850, 3200, 4200, 6000, 6600 ; rabais et escomptes ; bouclement de la raison individuelle. **Pas d'emprunt en CFC 1** (décidé) |
| CFC 2 | + nombre d'employés, investir dans un véhicule de livraison ou un équipement, conditions de crédit aux clients | + TVA au net (1170, 2200, 2205), fiches de salaire (5200, 5270), amortissements (6800, 1509), clients insolvables, ducroire (1109, 3805) |
| MP | + forme juridique (Sàrl ou SA) au départ, financement par capital ou par **emprunt bancaire**, dividende proposé | + capital-actions, emprunt 2400 et intérêts 6900 (niveau MP dans le plan), 9000/2970, répartition du bénéfice (art. 672 CO), impôt anticipé, ratios dans le tableau des résultats (fiche « Analyse » existante) |

En CFC 2 et en MP, le personnel et le véhicule ne changent pas l'attractivité (la règle du marché reste simple, § 5). Ils fixent une **capacité** : le nombre maximal de clients servis par tour. ❓ Sans cette capacité, engager du personnel ne serait qu'une charge, sans aucun effet sur les ventes.

## 5. Le marché (règle économique proposée)

La règle doit pouvoir s'expliquer au tableau (lien avec le cours d'économie B4). Elle se règle par partie.

1. **Demande totale du tour** = demande de base × facteur de saison (ex. plus forte en décembre).
2. **Attractivité d'une entreprise** = effet du prix × effet de la publicité. **Seulement ces deux facteurs** (décidé : règle simple).
   - Prix : plus le prix est bas par rapport au prix moyen du marché, plus l'entreprise attire. L'intensité de cet effet est réglable ; c'est l'élasticité-prix, à expliquer en classe.
   - Publicité : effet décroissant. Les premiers francs rapportent beaucoup, les suivants de moins en moins.
3. **Part de marché** = attractivité de l'entreprise / somme des attractivités.
4. **Ventes** = part de marché × demande totale, **limitées par le stock disponible** (et, en CFC 2 et en MP, par la capacité du § 4). Les ventes manquées sont affichées au groupe (« 40 clients sont repartis sans acheter »).

Tous les calculs se font en centimes entiers et de façon **déterministe** : les mêmes décisions donnent les mêmes résultats. Les imprévus sont tirés avec une graine propre à la partie, ce qui permet de rejouer un tour. Les paramètres de départ (élasticité, effet de la publicité, demande de base) seront proposés avec le moteur, puis validés.

## 5 bis. Secteurs (choix par partie, décidé)

Trois secteurs préparés. L'enseignant en choisit un en créant la partie, et toutes les entreprises de la partie sont dans ce secteur. Chacun a un produit type, un prix d'achat de référence, une demande de base et une saison :

| Secteur | Produit type | Saison forte | Particularité |
|---|---|---|---|
| Vélos et trottinettes | vélo de ville, trottinette électrique | printemps, été | montants moyens, ventes surtout au comptant |
| Épicerie fine | coffret, assortiment de produits | décembre | petits montants, beaucoup de ventes au comptant ; TVA au taux réduit dès CFC 2 |
| Matériel informatique | ordinateur portable | rentrée scolaire (août-septembre) | montants élevés, clients entreprises à crédit, prix d'achat qui baisse au fil des tours |

❓ Les données chiffrées de chaque secteur seront proposées avec le moteur (phase S1), puis validées.

## 6. Imprévus (facultatifs)

Ils sont produits par le simulateur sous forme de pièces, et chacun ne touche que des opérations déjà enseignées au niveau :

- Hausse du prix d'un fournisseur (tous niveaux) ;
- Réparation imprévue, 6100 (dès CFC 1) ;
- Client insolvable, puis perte sur créance (dès CFC 2) ;
- Panne d'une machine : réparation, ou investissement anticipé (dès CFC 2) ;
- Hausse du taux d'intérêt de l'emprunt (MP, seul niveau avec emprunt).

L'enseignant peut aussi déclencher un imprévu à la main pour un groupe ou pour tout le marché.

## 7. Résultats et classement

À la fin de chaque tour, un écran à projeter présente pour chaque entreprise : le chiffre d'affaires, le résultat du tour, la trésorerie, la part de marché et le stock. En MP s'ajoutent quelques ratios du cours.

**Classement affiché par défaut** (décidé le 20.11.2026 : la règle « aucune gamification » du projet ne s'applique pas au simulateur). Trois options par partie :

- **Classement** (par défaut) sur un score qui combine plusieurs critères (résultat, trésorerie, part de marché), pour éviter qu'un groupe gagne en vendant à perte. ❓ La pondération sera proposée avec le moteur ;
- **Tableau des résultats sans rang** : les chiffres seulement ;
- **Résultats cachés** : chaque groupe ne voit que les siens.

## 8. En ligne : ce qui part et ce qui reste

| En ligne (service de base de données, région Europe) | Sur le poste seulement (comme aujourd'hui) |
|---|---|
| Code de la partie, réglages | Noms des élèves |
| Nom d'équipe choisi par le groupe (« Les Lémaniques ») | Saisies comptables, copies, notes |
| Décisions de chaque tour | Composition des groupes |
| Résultats calculés, statut du tour | |

- **Service proposé : Supabase** (base de données et accès en direct, offre gratuite suffisante pour une classe). L'enseignant crée lui-même le compte ; Claude le guide pas à pas.
- **Accès** : l'enseignant se connecte par un lien reçu par e-mail. Un groupe rejoint la partie avec le code de partie et un code d'équipe secret, sans compte élève. Des règles d'accès côté base empêchent un groupe de lire les décisions des autres avant la fin du tour.
- **Le calcul se fait dans le navigateur de l'enseignant**, avec le moteur testé (`src/engine/`). La base sert seulement au stockage et à l'échange.
- **Secours hors ligne** : échange par fichier (`.compta-decisions.json` / `.compta-tour.json`), ou décisions saisies au poste de l'enseignant.
- ❓ À vérifier par l'enseignant : les règles de l'école ou du DIP (LIPAD) sur les services en ligne utilisés avec des élèves, même sans donnée nominative.

## 9. Écrans

- **Enseignant — tableau de la partie** : groupes, statut du tour (décisions reçues ou non), bouton « Calculer le tour », imprévus, réglages.
- **Groupe — décisions** : formulaire du tour (seulement les décisions du niveau), rappel de la situation (stock, trésorerie, résultats du tour précédent), bouton « Valider nos décisions ».
- **Projection — résultats du tour** : grands chiffres lisibles au projecteur, selon l'option du § 7.
- **Saisie** : quand la comptabilité est saisie par les élèves, chaque tour devient un exercice de Compta PME. On y retrouve les pièces du tour dans le journal, la correction et la note, sans rien de nouveau à apprendre.

Charte : celle de Compta PME (bleu nuit, orange pour l'action principale, sans émoji ni animation superflue).

## 10. Architecture

- `src/engine/simulation/` : moteur pur et testé, avec les réglages, le marché, l'application des décisions et la production des pièces et du corrigé de chaque tour (avec `pieces.ts`). La comptabilité automatique applique simplement ce corrigé. Elle reste ainsi identique à ce que les élèves doivent trouver.
- **Un seul exercice par entreprise pour toute la partie** (l'année fictive, du 01.01 au 31.12), modifié le 20.11.2026 pendant la phase S1 : chaque tour y ajoute ses opérations, numérotées à la suite (`operationsParTour` indique lesquelles appartiennent à quel tour). Il n'y a donc pas de réouverture entre les tours, et l'inventaire et le bouclement se font une seule fois, à la fin de l'année.
- `src/io/simulation-en-ligne.ts` : la seule partie qui communique avec le service en ligne, chargée à la demande (`Differe.svelte`).
- `src/ui/vues/simulation/` : les écrans du § 9.

## 11. Phases proposées

L'accord de l'enseignant est demandé à la fin de chaque phase, comme d'habitude.

- **S0** : validation de ce cahier des charges.
- **S1** : moteur du simulateur (marché, décisions, pièces par niveau CFC 1 puis CFC 2), tests, paramètres du marché à valider.
- **S2** : maquettes des quatre écrans, puis validation. *Faite et validée le 21.11.2026* : `public/maquettes/simulateur.html` (créer une partie, tableau de la partie, décisions d'un groupe, résultats à projeter).
- **S3** : interface **sans connexion**. Les décisions se saisissent au poste de l'enseignant, ce qui permet d'essayer en classe dès cette phase. *Faite et validée le 21.11.2026* : onglet « Simulateur » de l'espace enseignant (chargé à la demande), `src/ui/vues/simulation/` (liste des parties, création, tableau de la partie, décisions d'un groupe, projection plein écran fermée par Échap), état `src/ui/simulation.svelte.ts` (parties dans ce navigateur, clé `compta-pme:simulateur:v1`), fichier d'échange `.compta-simulation.json` (`src/io/simulation.ts`). Seuls les réglages, les entreprises et les décisions sont enregistrés ; la partie est recalculée à l'ouverture (`rejouer`). Le dernier tour peut être annulé. Pour chaque entreprise : aperçu de l'exercice, export pour les élèves (toutes les pièces des tours joués) et version enseignant. Dans l'application, les écrans sont placés dans l'espace enseignant existant (onglets en haut), et non dans une barre latérale propre comme sur la maquette. Tests : `tests/simulation-fichiers.test.ts`, `e2e/simulateur.spec.ts` (parcours complet et accessibilité).
- **S4** : saisie comptable des tours par les élèves, avec la correction et la note existantes. *Faite et validée le 21.11.2026* : en comptabilité mixte, les tours non saisis deviennent des **écritures automatiques** (pièces A1-1, A1-2…, nouveau champ `ecrituresAutomatiques` de l'exercice, `automatique` sur l'écriture). Elles sont dans le journal dès l'ouverture avec la mention « automatique » ; elles ne sont ni corrigées, ni notées, ni comptées dans l'avancement, ni modifiables, extournables ou supprimables, et ne comptent pas comme écritures de bouclement. Les opérations des tours saisis sont numérotées 1, 2, 3… Après chaque tour, l'enseignant distribue la nouvelle version de l'exercice (même identifiant `simulation-…`) : l'élève qui l'ouvre garde ses écritures, et les écritures automatiques sont remplacées (`actualiserDossier`, limité aux exercices du simulateur). En comptabilité automatique, tout le dossier est fait d'écritures automatiques et le bouclement n'est pas corrigé.
- **S5** : mise en ligne (Supabase), codes de groupe, suivi en direct, secours par fichier.
- **S6** : niveaux MP puis AFP (fiche de calcul), imprévus, premier essai en classe et ajustements.

## 12. Décisions de l'enseignant (20.11.2026)

1. **AFP** : simulateur centré sur les calculs, comptabilité automatique, pas de niveau AFP dans le plan comptable.
2. **Emprunt** : pas en CFC 1 ; il n'apparaît qu'en MP (2400, 6900).
3. **Marché** : règle simple, prix et publicité seulement, ventes limitées par le stock.
4. **Résultats** : classement multicritère affiché par défaut ; la règle « aucune gamification » ne s'applique pas au simulateur.
5. **Secteur** : au choix par partie, parmi trois secteurs préparés (§ 5 bis).
6. **Règles de l'école ou du DIP** sur les services en ligne : vérification en cours de votre côté. Elle n'est nécessaire qu'avant la phase S5.

Restent à valider plus tard, avec le moteur (phase S1) : la capacité liée au personnel (§ 4), les paramètres du marché, les données des trois secteurs et la pondération du classement.

## 13. Phase S1 — moteur (fait le 20.11.2026, **les 7 points validés par l'enseignant le 20.11.2026**)

Programmé : niveaux **AFP et CFC 1**, les trois secteurs, tours d'un mois ou d'un trimestre, contrôle des décisions, pièces et corrigé, inventaire de fin d'année, tableau des résultats et classement. CFC 2 (TVA, salaires, amortissements, capacité) et MP viendront après cette validation.

Fichiers : `src/engine/simulation/` (types, `marche.ts`, `tour.ts`, `exercice.ts`, `classement.ts`), `src/data/simulation/secteurs.ts`, tests `tests/simulation.test.ts` (43 tests). Pour chaque secteur, une année complète est jouée en 12 mois et en 4 trimestres par 4 entreprises aux stratégies différentes. Les tests vérifient que l'exercice produit est valide, que le corrigé passe entièrement, que les soldes concordent avec la simulation (banque, caisse, clients, fournisseurs, stock, résultat) et que le bouclement est possible.

### Ce que produit un tour (CFC 1), pour chaque entreprise

| Pièce | Quand | Écriture du corrigé |
|---|---|---|
| Avis de crédit : virements des clients professionnels | début du tour, s'il reste des factures clients | 1020 / 1100 |
| Avis de débit : paiement du grossiste | début du tour, s'il reste une facture | 2000 / 1020 |
| Facture du fournisseur (réassort) | 2e jour | 4200 / 2000 |
| Avis de débit : paiement à la commande (importateur seulement) | 2e jour | 2000 / 1020 |
| Avis de débit : loyer du mois ou du trimestre | 3e jour | 6000 / 1020 |
| Avis de débit : campagne publicitaire | 5e jour, si budget | 6600 / 1020 |
| Avis de débit : virement sur le compte personnel du propriétaire | 20e jour du dernier mois, si prélèvement | 2850 / 1020 |
| Rapport de caisse : ventes au comptant | dernier jour | 1000 / 3200 |
| Avis de crédit : versement des recettes de caisse | dernier jour | 1020 / 1000 |
| Relevé des factures émises aux clients professionnels | dernier jour | 1100 / 3200 |
| Note interne : inventaire du stock (dernier tour, si clôture) | 31.12 | 1200 / 4280 ou 4280 / 1200 |

Entreprise non assujettie à la TVA en CFC 1, comme dans les dossiers CFC 1 existants. Inventaire intermittent : achats en 4200, variation de stock à l'inventaire de fin d'année (théorie CFC 1 du logiciel).

### Points validés (20.11.2026)

1. **Évaluation du stock au prix d'achat moyen pondéré** (inventaire de fin d'année et coût des marchandises vendues). Avec cette règle, le résultat comptable après inventaire est exactement le résultat calculé par le simulateur.
2. **Crédit du grossiste** : sa facture est payée au début du tour suivant, que le tour dure un mois (« payable à 30 jours ») ou un trimestre (« payable à 90 jours »). L'importateur est 8 % moins cher, mais il est payé à la commande.
3. **Contrôle des liquidités** : une décision est refusée si les paiements prévus du tour (fournisseur dû, achat payé à la commande, loyer, publicité, prélèvement) dépassent l'avoir en banque plus les factures clients à encaisser. Les ventes du tour ne sont pas comptées, puisqu'elles ne sont pas encore faites. La banque ne devient donc jamais négative.
4. **Caisse** : les recettes au comptant sont versées à la banque le jour même. La caisse garde son fonds de départ.
5. **Paramètres du marché** : élasticité-prix 2, élasticité du marché 1, effet maximal de la publicité +60 %, et la moitié de cet effet atteinte au budget de référence du secteur. Si des entreprises sont à égalité, elles reçoivent toujours le même nombre de clients. Les quelques clients qui ne peuvent pas être partagés également repartent sans acheter.
6. **Données des secteurs** (`src/data/simulation/secteurs.ts`) :

| | Vélos et trottinettes | Épicerie fine | Matériel informatique |
|---|---|---|---|
| Produit | vélo de ville | coffret gourmand | ordinateur portable |
| Prix d'achat / de vente de référence | 520.00 / 899.00 | 28.00 / 49.00 | 780.00 / 1'150.00 (achat −1 % par mois) |
| Clients par entreprise et par mois (mois moyen) | 25 | 350 | 22 |
| Saison forte | avril à juillet (jusqu'à 150 %) | décembre (230 %) | août-septembre (160 %, 140 %) |
| Ventes sur facture | 10 % | 5 % | 40 % |
| Loyer mensuel | 3'200.00 | 2'600.00 | 2'900.00 |
| Publicité de référence par mois | 1'000.00 | 800.00 | 1'200.00 |
| Ouverture : caisse, banque, stock, mobilier | 2'000, 30'000, 40 vélos, 15'000 | 1'500, 20'000, 300 coffrets, 12'000 | 2'000, 35'000, 25 ordinateurs, 18'000 |

7. **Classement** : points de rang par critère (1er sur 4 = 4 points), avec pondération résultat cumulé ×2, trésorerie ×1 et part de marché cumulée ×1.

### Essai : une année de 12 mois, 4 entreprises

Stratégies : A au prix de référence ; B 8 % moins cher, chez l'importateur, avec la moitié de la publicité ; C 10 % plus cher, avec le double de publicité ; D 2 % plus cher, sans publicité. Chacune commande la demande prévue du mois, et la commande est réduite si les liquidités ne suffisent pas.

| Secteur | 1er | Résultats annuels (A / B / C / D) | Parts de marché (A / B / C / D) |
|---|---|---|---|
| Vélos | B | 70'501 / 74'586 / 70'768 / 55'689 | 26.9 / 29.2 / 23.9 / 20.0 % |
| Épicerie fine | C | 48'975 / 46'085 / 52'786 / 41'444 | 27.0 / 27.0 / 25.2 / 20.8 % |
| Informatique | B | 66'415 / 72'186 / 69'228 / 54'945 | 26.8 / 29.1 / 24.2 / 19.8 % |

Les décisions comptent sans écraser le jeu : l'entreprise sans publicité finit toujours dernière, et aucune stratégie ne gagne partout. Les résultats annuels (de 40'000 à 75'000 environ) sont ceux d'un petit commerce.

## 14. Niveau CFC 2 (programmé le 21.11.2026, **validé par l'enseignant le 21.11.2026**)

Choix de l'enseignant (21.11.2026) : prix de vente **TVA comprise** ; capacité selon le **personnel et le véhicule de livraison** ; véhicule amorti en **direct dégressif** ; **TVA et cotisations réglées une fois par trimestre**. Tout le reste reprend les conventions déjà validées (dossiers TVA et salaires de Compta PME).

### Décisions en plus du CFC 1

- **Employés** (0 à 4, sans le propriétaire) ; un employé au départ. Les changements s'appliquent dès le tour (pas de délai de congé, simplification).
- **Véhicule de livraison** : achat une seule fois, payé à la livraison ; +25 % de capacité.

### Pièces et écritures en plus du CFC 1

| Pièce | Écriture du corrigé |
|---|---|
| Facture du fournisseur (HT + TVA) | 4200 + 1170 / 2000 |
| Rapport de caisse (TVA comprise) | 1000 / 3200 + 2200 |
| Relevé des factures émises (TVA comprise) | 1100 / 3200 + 2200 |
| Avis de débit : publicité (TVA 8,1 % comprise) | 6600 + 1171 / 1020 |
| Facture du garage : véhicule (HT + TVA 8,1 %) | 1530 + 1171 / 2010 |
| Avis de débit : paiement du véhicule | 2010 / 1020 |
| Fiche de salaire, par employé (AVS/AI/APG 5,30 %, AC 1,10 %, LPP montant fixe) | 5200 / 2170 + 2171 + 1020 |
| Note interne : charges sociales de l'employeur (AVS/AC même taux, LPP même montant, ALFA 2,40 %) | 5270 / 2170 + 2171 + 2172 |
| Note interne : décompte TVA, fin de chaque trimestre | 2200 / 1170 + 1171 + 2205 |
| Avis de débit : TVA et cotisations du trimestre précédent, début du trimestre | 2205 / 1020, 2170 / 1020, 2171 / 1020, 2172 / 1020 |
| Note interne : amortissement du véhicule au 31.12 (40 % de la valeur comptable, prorata des mois, arrondi aux 5 centimes) | 6800 / 1530 |

Le loyer n'est pas soumis à la TVA (convention des exercices existants). Si le décompte donne un crédit d'impôt, l'AFC rembourse au début du trimestre suivant (1020 / 2205). Quand les tours durent un trimestre, chaque employé reçoit une fiche de salaire pour le trimestre (et non trois fiches mensuelles).

### Économie du CFC 2

- Le commerce est **deux fois plus grand** qu'en CFC 1 (clients de base ×2). Sinon, un employé coûterait plus qu'il ne rapporte.
- Capacité par personne et par mois : vélos 25, coffrets 400, ordinateurs 30.
- Salaires bruts mensuels : 4'900.00, 4'500.00 et 5'600.00 ; LPP de l'employé : 5 % du brut.
- Véhicule : 32'000.00 HT (vélos, informatique), 38'000.00 HT pour l'utilitaire réfrigéré (épicerie).
- TVA des ventes : 8,1 % (vélos, informatique), 2,6 % (épicerie fine, denrées alimentaires).

### Points validés (21.11.2026)

Le découvert reste tel quel : pas de reclassement automatique en 2100 (à revoir si l'enseignant le demande).

1. Les données ci-dessus : salaires, LPP, capacités, prix du véhicule, demande ×2.
2. **Découvert bancaire.** Le contrôle des liquidités refuse toute dépense choisie qui ne peut pas être payée. Mais si les paiements obligatoires (fournisseur, loyer, TVA et cotisations dues) dépassent à eux seuls les liquidités, le tour est accepté sans aucune dépense choisie, et la banque (1020) devient négative. Faut-il reclasser un solde négatif en 2100 Banque (n/dette) à la clôture ?
3. Les paramètres du véhicule : +25 % de capacité, amortissement 40 %.

Fichiers : `src/engine/simulation/tour.ts` (`calculSalaires`, `capacite`, `amortissementVehicule`, `detailSorties`), `PARAMETRES_CFC2` dans `types.ts`, tests `tests/simulation-cfc2.test.ts`. Pour chaque secteur, une année complète est jouée en 12 mois et en 4 trimestres par 3 stratégies. Les tests vérifient que l'exercice est valide, que le corrigé passe et que les soldes concordent avec la simulation : banque, clients, fournisseurs, stock, TVA (2200, 1170, 1171, 2205), cotisations (2170, 2171, 2172), véhicule (1530) et résultat.

## 15. Niveau MP (programmé le 21.11.2026, **validé par l'enseignant le 21.11.2026**)

Choix de l'enseignant (21.11.2026) : **SA pour toutes les entreprises** ; **emprunt bancaire libre** à chaque tour, intérêts payés à la fin de chaque trimestre, sans remboursement pendant l'année ; **répartition du bénéfice sur la fiche existante**, d'après le dividende proposé par le groupe. Le MP reprend tout le CFC 2 : TVA, salaires, capacité, véhicule.

### Décisions en plus du CFC 2

- **Nouvel emprunt bancaire**, à chaque tour (maximum 100'000.00 au total). Le montant est versé au début du tour et compte dans les liquidités du tour.
- **Dividende proposé**, en % du capital-actions, au dernier tour seulement (s'il y a clôture).
- Pas de prélèvement privé dans une SA.

### Pièces et écritures en plus du CFC 2

| Pièce | Écriture du corrigé |
|---|---|
| Avis de crédit : versement de l'emprunt | 1020 / 2400 |
| Avis de débit : intérêts du trimestre (4 % par an, par mois d'emprunt) | 6900 / 1020 |

- **Bilan d'ouverture** : 2800 Capital-actions, arrondi aux 10'000 francs, et 2970 Bénéfice reporté pour le solde. Pas de réserves.
- **Bouclement** : 9000 / 2970, la méthode du cours pour les sociétés.
- **Fiche « Répartition du bénéfice »** : bénéfice de l'année, bénéfice reporté d'ouverture, capital-actions et dividende proposé. Réserve légale, dividende et impôt anticipé sont calculés par la fiche existante (art. 672 CO). Si le bénéfice disponible ne suffit pas, le dividende est ramené au taux entier le plus élevé possible. En cas de perte, il n'y a pas de fiche.
- **Projection** : une colonne « Rentabilité des fonds propres » (résultat / fonds propres d'ouverture) s'ajoute, sans compter dans le score.

### Points validés (21.11.2026)

1. Le bilan d'ouverture de la SA (capital arrondi, solde en bénéfice reporté).
2. **Le directeur-actionnaire n'est pas salarié** : seuls les employés le sont, et il n'y a ni salaire du directeur ni tantièmes. C'est une simplification.
3. Emprunt : 4 % par an, maximum 100'000.00 au total, intérêts payés à la fin de chaque trimestre.
4. Le dividende trop élevé est réduit automatiquement, et la rentabilité des fonds propres est affichée sans compter dans le score.

Fichiers : `PARAMETRES_MP` dans `types.ts`, `fondsPropresMp`, `interetMensuel` et `estMp` dans `tour.ts`, `donneesRepartition` dans `exercice.ts`, tests `tests/simulation-mp.test.ts` (année complète dans les 3 secteurs, en mois et en trimestres : SA valide, 1020 et 2400 conformes, intérêts payés, bouclement par 2970, répartition possible).

## 16. Phase S6 (faite et validée le 21.11.2026)

Choix de l'enseignant (21.11.2026) : **fiche AFP à imprimer** ; imprévus **hausse du fournisseur** et **client insolvable**, **déclenchés par l'enseignant** ; **ducroire de 5 %** à l'inventaire du 31.12 (CFC 2 et MP).

### Imprévus

Ils s'ajoutent dans le tableau de la partie, avant le calcul du tour. Le groupe touché les voit sur son écran de décisions, et ils sont rappelés sur la projection.

| Imprévu | Niveaux | Effet | Écriture |
|---|---|---|---|
| Hausse du prix d'achat, 5 à 10 %, pour une entreprise ou tout le marché | tous | Prix d'achat des deux fournisseurs majoré pour le tour, contrôle des liquidités compris | aucune nouvelle écriture (facture plus chère) |
| Client insolvable, pour une entreprise | CFC 2, MP | Une facture client du tour précédent (une unité au prix de ce tour) est perdue ; le reste des créances est encaissé | Acte de défaut de biens : 3805 / 1100, sans correction de la TVA (règle validée) |

Le client insolvable n'est possible que si l'entreprise a des factures clients à encaisser. Les imprévus sont enregistrés avec la partie et rejoués à l'identique. Annuler un tour remet ses imprévus dans le tour en cours.

### Ducroire (CFC 2 et MP)

Note interne au 31.12, avec la clôture : 5 % des créances clients, arrondi aux 5 centimes, en 3805 / 1109. Il n'y a pas de ducroire d'ouverture.

### Fiche de calcul AFP

Pour l'AFP, le tableau de la partie propose, après chaque tour, « Imprimer les fiches de calcul » (une page par groupe) et « Imprimer le corrigé ».

- **Données de la fiche** : stock au début, achats, ventes, prix de vente, prix d'achat moyen d'une unité vendue, loyer et publicité.
- **À calculer** : chiffre d'affaires, coût d'achat des marchandises vendues, marge brute, charges, bénéfice ou perte, stock à la fin.
- Avec les vélos et l'épicerie fine (prix d'achat constant), le bénéfice de la fiche est exactement celui du simulateur. Avec le matériel informatique (prix en baisse), le prix moyen est arrondi au centime, ce qui peut créer quelques centimes d'écart.

### Reste à faire

Les ajustements après le premier essai en classe.

Fichiers : `controlerImprevu`, `imprevusEntreprise`, `montantDucroire` dans `tour.ts`, `fiche-afp.ts`, `src/ui/vues/simulation/impression.ts`, tests `tests/simulation-imprevus.test.ts` et `e2e/simulateur.spec.ts`.

## 17. Phase S5 — préparation de la mise en ligne (faite et validée le 21.11.2026)

Pendant que l'école ou le DIP répond, tout ce qui ne demande pas de compte en ligne est fait.

### Échange par fichier : utilisable dès maintenant

C'est le secours prévu au § 8, qui permet déjà aux groupes de décider sur leur propre poste.

1. Dans le tableau de la partie, l'enseignant clique sur **Distribuer les situations du tour N (fichiers)**. Il obtient une archive ZIP avec un fichier `.compta-situation.json` par groupe. Ce fichier ne contient que les chiffres du groupe : sa situation, ses imprévus et le résumé de son tour précédent, jamais ceux des autres entreprises.
2. Le groupe ouvre Compta PME, clique sur **Simulateur : ouvrir ma situation** dans l'accueil, puis choisit son fichier. Il retrouve l'écran de décisions validé, avec le même contrôle des liquidités, et clique sur « Valider et enregistrer le fichier de décisions ». Il obtient un fichier `.compta-decisions.json` à remettre à l'enseignant. Rien n'est conservé dans le navigateur du groupe.
3. L'enseignant clique sur **Importer des décisions…** (plusieurs fichiers à la fois). Chaque fichier est contrôlé : même partie, tour en cours, entreprise connue, décisions acceptables compte tenu des imprévus du tour. Les décisions acceptées sont validées.

L'écran de décisions est désormais le même pour l'enseignant et pour le groupe : il dépend seulement de la « situation » du groupe (`src/engine/simulation/situation.ts`).

### Préparé pour la connexion, pas encore branché à l'interface

- **`supabase/schema.sql`** : les tables `sim_parties`, `sim_equipes`, `sim_situations`, `sim_decisions` et `sim_resultats`, avec leurs règles d'accès (RLS).
  - L'enseignant connecté ne voit que ses propres parties.
  - Les groupes n'ont aucun accès direct aux tables. Ils passent seulement par trois fonctions (`rejoindre_partie`, `deposer_decisions`, `lire_resultats`) avec le code de partie et leur code d'équipe.
  - Seule l'empreinte SHA-256 des codes d'équipe est enregistrée.
- **`src/io/simulation-en-ligne.ts`** : le seul module qui communique avec le service. Il appelle directement l'API REST de Supabase, sans nouvelle dépendance. Il couvre :
  - pour les groupes : rejoindre la partie, déposer ses décisions, lire les résultats ;
  - pour l'enseignant : lien de connexion par e-mail, publication de la partie et des équipes, publication des situations du tour, lecture des décisions et publication des résultats.
  - Ses messages d'erreur sont en français, et une panne réseau renvoie vers l'échange par fichier.
- **Codes** (`genererCodes`) : 6 caractères pour la partie et 8 pour chaque équipe, sans caractère ambigu (pas de 0/O ni de 1/I/L).
- **Résultats publics** (`resultatsPublics`) : le tableau envoyé aux groupes respecte l'option d'affichage de la partie (classement, sans rang, ou chiffres propres seulement).

Le calcul des tours reste dans le navigateur de l'enseignant : la base ne fait que stocker et transmettre.

### Reste à faire, une fois le compte créé

1. **Votre part** : la réponse de l'école ou du DIP, puis la création du compte et du projet Supabase, et l'exécution de `supabase/schema.sql` (voir `docs/simulateur-mise-en-ligne.md`).
2. **Le branchement de l'interface**, à tester avec le vrai service :
   - la connexion de l'enseignant ;
   - le bouton « Mettre la partie en ligne » et l'affichage des codes ;
   - l'écran « Rejoindre une partie » pour les groupes ;
   - le suivi des décisions reçues, actualisé régulièrement ;
   - la publication des situations et des résultats à chaque tour.

Tests : `tests/simulation-en-ligne.test.ts` (situation, contrôle des décisions reçues, fichiers, codes, client contre un serveur simulé) et `e2e/simulateur.spec.ts` (échange par fichier complet).
