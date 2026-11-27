# Vision : Compta PME, logiciel comptable de niveau professionnel pour l'enseignement

Document de travail du 27.11.2026, étape 1 de la demande de l'enseignant (étude et vision, aucune modification de code).
**À valider par l'enseignant avant toute maquette.** Non commité.

---

## Décisions de l'enseignant (27.11.2026, réponses à la section h)

- **Architecture et noms** : laissés au choix de Claude. Retenu : **un seul site, trois espaces**, nommés
  **« Comptabilité »** (le logiciel), **« Cours »** (Apprendre, Théorie, leçons, exercices générés) et
  **« Espace enseignant »**. « Logiciel » est écarté : tout le site est un logiciel, le mot ne dit pas à l'élève ce qu'il
  y fait ; « Comptabilité » est le mot des logiciels professionnels (« ouvrir la comptabilité »).
- **Ouverture saisie par l'élève (énoncé papier)** : « le plus efficace, ne jamais alourdir l'utilisation ». Retenu :
  **contrôlée, non notée par défaut**. Rien de plus à faire pour l'élève ni pour l'enseignant : si le corrigé contient un
  bilan d'ouverture, le logiciel le compare et signale les écarts dans le détail de la copie ; les écritures restent
  corrigées pièce par pièce et le bouclement d'après les comptes de l'élève, donc une erreur d'ouverture n'est jamais
  pénalisée deux fois. L'enseignant peut, s'il le souhaite, donner des points à l'ouverture dans le barème (0 par défaut).
- **Plan comptable modifiable par l'élève** : **non**. L'élève travaille toujours avec le plan du cours de son année ;
  seul l'enseignant ajoute ou masque des comptes pour un exercice, comme aujourd'hui. Fonction 3 retirée.
- **TDFN, certificat de salaire, annexe des comptes annuels, comptes auxiliaires** : **non enseignés**, retirés de la
  vision (fonctions 8 en partie, 12, 14 en partie, 18 en partie).
- **Dépendance pour les codes QR** : **acceptée** (« ok pour la dépendance », 27.11.2026). Une petite bibliothèque libre
  d'encodage QR, sans connexion réseau, chargée à la demande seulement là où un code QR est produit (lien d'exercice en
  V3, QR-facture en V7) ; licence et taille vérifiées avant l'ajout, puis consignées dans `CLAUDE.md`.

---

## 0. État de départ (vérifié le 27.11.2026)

**Git.**
- Branche courante : `apercu`, à jour avec `origin/apercu`, aucun fichier modifié.
- `apercu` a un seul commit de plus que `origin/main` (`b3b880c`, mise à jour du suivi après la PR 30) ; le contenu de `main` est entièrement dans `apercu`.
- La branche locale `main` a 84 commits de retard sur `origin/main` : c'est seulement une copie locale ancienne, `origin/main` est à jour. À rafraîchir un jour, sans urgence.
- Un worktree ancien existe : `.claude/worktrees/version-publique-28b3cf` (branche `claude/version-publique-28b3cf`). Ce document ne le touche pas.

**Vérifications.**
- `npm test` : 58 fichiers, 661 tests, tous verts.
- `npm run check` : 389 fichiers, 0 erreur, 0 avertissement.
- `npm run build` : réussi ; script principal 436,7 ko, soit 133,5 ko compressés.

**Documents lus.** `CLAUDE.md`, `TRAVAIL_EN_COURS.md`, `PROMPT_EQUIPE.md`, les synthèses et les plans des deux audits (`AUDIT_COMPTA_PME.md`, `AUDIT_COMPTA_PME_2.md`).

---

## a. Étude du marché

Méthode : pages officielles des éditeurs, lues le 27.11.2026. Ce sont des pages commerciales : elles disent ce que l'éditeur affirme, pas ce qu'un essai aurait montré. Je n'ai essayé aucun de ces logiciels. Quand une page n'a pas pu être lue, je l'écris.

### a.1 Logiciels professionnels utilisés en Suisse

#### Banana Comptabilité Plus (Banana.ch SA, Lugano)
**Ce qu'il fait de mieux.**
- Saisie dans un tableau proche d'Excel : déplacement au clavier, copier-coller depuis et vers Excel. Colonnes Débit et Crédit toujours visibles, colonne Solde, erreurs signalées tout de suite. Bilan et compte de résultat produits en direct. ([fonctions](https://www.banana.ch/fr/features), [éducation](https://www.banana.ch/en/education))
- Le plan comptable est entièrement modifiable ([éducation](https://www.banana.ch/en/education)).
- TVA : méthode effective, taux de la dette fiscale nette (TDFN) et taux forfaitaires ; méthodes selon les contre-prestations convenues ou reçues ; rapport TVA suisse avec fac-similé et fichier XML pour l'AFC dans le plan Advanced ([accueil FR](https://www.banana.ch/fr), [fonctions](https://www.banana.ch/fr/features)).
- Autres fonctions : import de relevés bancaires (ISO 20022 dans le plan Professional, règles d'import dans le plan Advanced), QR-facture, multidevises, comptes clients et fournisseurs, centres de coûts et segments, budget par écritures prévisionnelles, registre des biens amortissables, export PDF avec les pièces jointes ([fonctions](https://www.banana.ch/fr/features)).
- **Pour l'école, c'est l'offre la plus aboutie.** Licence gratuite du plan Advanced, à installer sur tous les ordinateurs de l'école ; usage pédagogique seulement, sur demande signée par l'école, révocable ([écoles](https://www.banana.ch/en/schools)). Plan Free gratuit jusqu'à 70 écritures par fichier ; version qui fonctionne dans le navigateur ([éducation](https://www.banana.ch/en/education)). L'enseignant partage un fichier modèle, l'élève le rend ; une extension « Accounting exercise correction » insère la solution à côté des écritures de l'élève ([éducation](https://www.banana.ch/en/education)).

**Ce qui manque pour l'enseignement.**
- Aucune notion d'énoncé, d'opération ni de barème.
- La correction place la solution à côté de la saisie, sans diagnostic (débit et crédit inversés, mauvais compte, montant) ni note.
- Pas de retour pendant la saisie au-delà de l'équilibre, pas de niveau (1ère CFC, 2ème CFC, maturité) : l'élève voit tout le logiciel.
- Pas de synthèse de classe.
- Les élèves qui donnent leur adresse e-mail deviennent des utilisateurs et reçoivent la lettre d'information ([écoles](https://www.banana.ch/en/schools)).
- Pages non lues : les conditions de licence détaillées (https://www.banana.ch/en/node/10225, accès refusé).

#### bexio (bexio AG)
**Ce qu'il fait de mieux.**
- Logiciel en ligne tout intégré pour PME, quatre forfaits payants ([tarifs](https://www.bexio.com/en-CH/packages-and-prices)).
- Factures entrantes et sortantes comptabilisées automatiquement, paiements rapprochés automatiquement ([comptabilité](https://www.bexio.com/fr-CH/comptabilite)).
- QR-facture et rappels de paiement automatiques ([accueil](https://www.bexio.com/fr-CH/), [débiteurs](https://www.bexio.com/fr-CH/debiteurs)).
- Connexion directe à plus de 65 banques suisses ; lecture des pièces par intelligence artificielle avec proposition d'écriture ; multidevises avec différences de change au paiement ; salaires certifiés Swissdec ([accueil](https://www.bexio.com/fr-CH/), [comptabilité](https://www.bexio.com/fr-CH/comptabilite)).

**Ce qui manque pour l'enseignement.**
- Aucune offre pour les écoles trouvée sur les pages lues : seulement un essai de 30 jours et des cours de la bexio Academy ([tarifs](https://www.bexio.com/en-CH/packages-and-prices)).
- L'automatisation cache la partie double. La facture « se comptabilise toute seule » : c'est l'inverse de ce qu'un élève doit apprendre.
- Compte en ligne obligatoire, donc données saisies hors de l'école.

#### Abacus (Abacus Research AG)
**Ce qu'il fait de mieux.**
- Progiciel de gestion de référence des moyennes et grandes entreprises : 65'000 clients selon la page allemande, 60'000 selon la page française ([accueil](https://www.abacus.ch/)).
- Comptabilité financière avec budget, plan financier pluriannuel, liquidités, comptabilité analytique par sections et centres de frais, monnaies étrangères, assistant du décompte TVA, aides aux clôtures, tableau de financement, e-banking intégré ([comptabilité financière](https://www.abacus.ch/fr/produits/finances/comptabilite-financiere/vue-densemble)).
- **Programme « Education Partner »** pour les écoles professionnelles commerciales, gymnases, écoles privées de commerce et hautes écoles spécialisées. Il couvre la comptabilité financière, la comptabilité analytique, les débiteurs et créanciers, les salaires, avec un certificat Abacus après examen ([Education Partner](https://www.abacus.ch/fr/entreprise/formations-abacus/education-partner)).

**Ce qui manque pour l'enseignement.**
- Les conditions d'adhésion et les licences pour les écoles ne figurent pas sur la page.
- Les cours sont payants : par exemple 560 CHF pour « Finanzbuchhaltung User » ([Academy](https://academy.abacus.ch/customer/)).
- Logiciel lourd, pensé pour des comptables ; aucune correction d'exercice.

#### Crésus (Epsitec SA, Yverdon-les-Bains)
**Ce qu'il fait de mieux.**
- Logiciel romand : comptabilité, facturation et salaires ; plus de 35'000 utilisateurs et 700 fiduciaires annoncés ; modules en abonnement (Banking, e-TVA, Swissdec, Saisie rapide…) ([accueil](https://www.cresus.ch/)).
- Un « mode enseignement » est documenté par l'éditeur ([PDF de support](https://support.cresus.ch/wp-content/documentation/19/cresus-mode-enseignement-19.pdf)). D'après le résumé du moteur de recherche, l'enseignant prépare des exercices dans les trois modules et les exporte en fichier `.crpack`, que l'élève ouvre sans compte. **Je n'ai pas pu lire le texte du PDF** : ce point est à vérifier avant d'être cité.

**Ce qui manque pour l'enseignement.**
- Aucune correction automatique ni barème n'est mentionné sur les pages lues.

#### WinBIZ (Winbiz SA, bureaux à Genève, Lausanne, Martigny)
**Ce qu'il fait de mieux.**
- Gestion complète pour PME : comptabilité, ventes, salaires (Swissdec 5), achats, stock, caisse ; rapprochement bancaire automatisé, e-banking et e-factures ; « + 50 000 sociétés » et « + 1000 fiduciaires » annoncées ([accueil](https://www.winbiz.ch/)).
- Très présent en Suisse romande.

**Ce qui manque pour l'enseignement.**
- Aucune offre pour les écoles sur la page d'accueil.
- Abonnement à 64 CHF par mois et par accès ([accueil](https://www.winbiz.ch/)).

#### CashCtrl (Suisse)
**Ce qu'il fait de mieux.**
- Progiciel en ligne multi-entités ([accueil](https://cashctrl.com)).
- Une version gratuite permanente comprend la comptabilité, la clôture annuelle, les factures débiteurs et créanciers avec QR-facture, les rapports et les immobilisations. La version PRO ajoute les salaires et l'import bancaire camt.052, camt.053, camt.054 et MT940.
- **Licence « CashCtrl School »** : 2'850 CHF par an, 40 comptes de participants, module d'introduction de 8 heures en bande dessinée avec des tâches, webinaire annuel pour les enseignants ([éducation](https://cashctrl.com/de/help/education)).

**Ce qui manque pour l'enseignement.**
- Licence payante et comptes en ligne.
- Aucune correction d'exercice mentionnée.

#### Klara (Suisse)
- Comptabilité en ligne avec facturation, rappels, connexion bancaire et intelligence artificielle ; salaires certifiés Swissdec ; dès 26 CHF par mois ; fonctions de base gratuites ([accueil](https://www.klara.ch/)).
- Aucune offre pour les écoles trouvée.

#### Sage 50 (Suisse)
- Très répandu en Suisse alémanique et romande, mais les pages officielles n'ont pas pu être lues (accès refusé à sage.com). **Je n'en dis donc rien de plus.**

### a.2 Logiciels pédagogiques et programmes éducation

| Offre | Ce qu'elle fait de mieux | Ce qui manque pour une école suisse |
|---|---|---|
| **QuickBooks, programme éducation** ([Intuit Canada](https://www.intuit.com/fr-ca/partners/education-program/teaching-the-future-of-cloud-accounting/)) | Logiciel gratuit pour enseignants et étudiants, essai d'un an pour l'étudiant ; l'enseignant revoit les dossiers des étudiants ; exercices de classe choisis par l'éditeur | Plan comptable, TVA et droit non suisses ; en ligne ; pas de correction automatique décrite |
| **Pennylane pour l'éducation** ([Pennylane](https://www.pennylane.com/fr/expert-comptable/pennylane-pour-education)) | Programme gratuit, cas pratiques prêts à l'emploi, certification pour les étudiants, plus de 400 enseignants inscrits | Droit et plan comptable français ; en ligne |
| **Banana, Abacus, CashCtrl** (voir a.1) | Le vrai logiciel à l'école, gratuit (Banana) ou payant (CashCtrl), avec un certificat (Abacus) | Aucun ne sait ce qu'est un énoncé, un niveau ou une note |
| **Sage BOB School Edition, Xero** | Pages non lisibles (Sage) ; la page éducation de Xero pour l'Australie ne décrit qu'un programme pour les comptables partenaires ([Xero](https://www.xero.com/au/partners/education/)) | Non évaluable |

Je n'ai trouvé **aucun logiciel suisse** qui combine un vrai logiciel de comptabilité, un énoncé, une correction automatique et des niveaux scolaires. Une recherche générale (« Lernsoftware Rechnungswesen Berufsschule Schweiz ») ne renvoie que des cours en ligne pour adultes et des cours sur Banana. Cette absence n'est pas une preuve qu'un tel outil n'existe pas : les plateformes des éditeurs de manuels, réservées aux abonnés, n'ont pas pu être examinées.

### a.3 Ce que l'étude enseigne

1. **Le marché scolaire suisse se divise en deux.**
   - D'un côté, de vrais logiciels prêtés à l'école : Banana gratuit, Abacus et CashCtrl avec formation. L'élève y apprend un outil, mais personne ne l'aide à comprendre ses erreurs.
   - De l'autre, des manuels et des cours en ligne : l'élève y apprend la matière, sans le geste du logiciel.
   - Compta PME est déjà le seul à faire les deux.
2. **Les gestes qu'un employé de commerce retrouvera partout :**
   - saisie rapide au clavier dans une grille ;
   - plan comptable propre au dossier ;
   - codes TVA sur les comptes et décompte ;
   - postes ouverts des clients et des fournisseurs, avec rappels ;
   - QR-facture ;
   - import du relevé bancaire (ISO 20022 camt.053) et rapprochement ;
   - pièces jointes ;
   - clôture et nouvel exercice ;
   - états imprimables et exports.
   C'est le socle « professionnel » à viser.
3. **Les normes publiques sont citables et stables.**
   - Les Swiss Payment Standards de SIX : relevé camt.053 fondé sur le schéma ISO camt.053.001.08, version en vigueur dès le 14 novembre 2026 ([SIX](https://www.six-group.com/dam/download/banking-services/standardization/sps/ig-cash-management-sps-2026-en.pdf)).
   - La méthode TDFN de l'AFC : chiffre d'affaires TVA comprise × taux de la branche, décompte semestriel, plafonds de 5,024 millions de francs et de 108'000 francs d'impôt ([AFC](https://www.estv.admin.ch/fr/tva-taux-de-la-dette-fiscale-nette-et-taux-forfaitaires)).
   Ces normes s'implémentent dans le navigateur, sans serveur.

---

## b. Compta PME face au marché

### b.1 Ce que Compta PME fait déjà mieux

**Correction.**
- **Correction automatique par opération**, insensible à l'ordre, avec diagnostic nommé : débit et crédit inversés, bonne classe mais mauvais compte, montant, TVA oubliée, écriture nette.
- Indice à deux niveaux, solution après la première erreur, raisonnement en trois questions sous la solution.
- Erreurs typiques expliquées par « Pourquoi ? ».
- Aucun logiciel du marché ne le fait. Banana place seulement la solution à côté de la saisie.

**Évaluation.**
- Trois modes : entraînement, formative, sommative.
- Barème, points partiels, note suisse, PDF par élève, bilan de la classe par opération et par notion, groupes de remédiation.

**Exactitude.**
- Plan du cours et vocabulaire de l'école ; niveaux qui n'affichent que les comptes et fonctions du niveau.
- 661 tests ; deux audits indépendants sans erreur de calcul trouvée dans les corrigés.

**Le travail réel d'un employé.**
- Pièces comptables affichées à côté de la saisie : factures, tickets, avis bancaires, fiches de salaire.
- Dix-neuf dossiers de pièces ; facturation avec mentions obligatoires ; formulaire officiel de décompte TVA ; budget et écarts.

**Pédagogie intégrée.**
- Théorie de référence en 30 chapitres, parcours Apprendre, révision espacée, bilan en direct, simulateur d'entreprise.

**Données et accès.**
- Aucune donnée d'élève en ligne (sauf les données anonymes du simulateur).
- Aucun compte à créer, gratuit, hors ligne ; ordinateur, tablette et téléphone.
- Banana fonctionne aussi hors ligne, mais bexio, Klara et CashCtrl demandent un compte en ligne.

**Comptes choisis par leur nom**, comme les élèves les apprennent.

### b.2 Ce qui lui manque pour un niveau professionnel

Constat franc : aujourd'hui, Compta PME est un **excellent cahier d'exercices corrigé**. Ce n'est pas encore un **logiciel de comptabilité**. Concrètement :

| Manque | Aujourd'hui | Dans un logiciel professionnel |
|---|---|---|
| Dossier sans énoncé | Impossible : tout travail part d'un exercice (seuls les exercices avec budget ou facturation peuvent n'avoir aucune opération) | On crée une société, on saisit l'ouverture, on comptabilise |
| Plusieurs exercices comptables | Un dossier = un exercice ; la réouverture existe dans le moteur, mais l'interface ne l'utilise pas | Clôture, puis nouvel exercice avec report à nouveau, historique des années |
| Plan comptable du dossier | Plan du cours, filtré par niveau ; l'enseignant ajoute ou masque des comptes | Comptes créés, renommés et désactivés dans le dossier |
| Saisie rapide | Grille d'une écriture à la fois, très guidée | Grille continue, numéro de pièce et date repris, modèles d'écritures, recherche, filtres |
| Débiteurs et créanciers | Comptes collectifs 1100 et 2000 seulement ; la fiche Facturation est un exercice à part | Comptes auxiliaires par client et fournisseur, postes ouverts, lettrage, relances |
| Banque | Aucune | Import du relevé camt.053, rapprochement |
| Pièces jointes | Pièces de l'énoncé seulement | Fichier joint à chaque écriture |
| TVA | Méthode effective, au net et au brut, décompte, formulaire | Codes TVA par compte ou par ligne, TDFN, rapport par période |
| Immobilisations | Écritures saisies à la main | Registre, plan d'amortissement, écritures proposées |
| Historique | Extourne visible ; modification directe sans trace | Journal des modifications daté |
| Sorties | PDF de copie et de dossier | PDF de chaque état, Excel, CSV ; imports |

---

## c. Vision cible

### c.1 L'idée en une phrase
**Compta PME devient deux espaces sur un même socle :**
- **le Logiciel**, un vrai logiciel de comptabilité suisse dans lequel l'élève tient des dossiers comme en entreprise ;
- **le Cours**, l'endroit où il apprend (Apprendre, Théorie, leçons, exercices générés).

Entre les deux, **l'Espace enseignant** crée, distribue et corrige.

Ce qui distingue Compta PME des logiciels du marché, la correction et le niveau, devient une **couche pédagogique** posée sur le logiciel : « Contrôler ma saisie », la note, le niveau. On ne la confond plus avec le logiciel lui-même.

Le jour où l'élève ouvre Banana ou bexio en entreprise, il retrouve les mêmes objets : dossier, exercice, plan comptable, journal, pièces, débiteurs, banque, TVA, clôture. Il a appris à s'en servir avec un filet de sécurité.

### c.2 Principe : un logiciel adaptable au niveau
- **Mode « guidé »** (par défaut en 1ère CFC) : l'interface d'aujourd'hui, avec les comptes choisis par leur nom et les seules fonctions du niveau.
- **Mode « professionnel »** : toutes les fonctions activées pour le dossier, saisie en grille continue, raccourcis. L'élève, ou l'enseignant pour un exercice, choisit le mode.
- **La règle actuelle reste vraie :** une fonction non activée n'apparaît pas.

### c.3 Fonctions, une par une

Légende de l'effort :
- **S** : quelques jours ;
- **M** : une à deux semaines ;
- **L** : plusieurs semaines ;
- **XL** : chantier de plusieurs mois.

Niveau = premier niveau où la fonction est utile. Sauf mention contraire, aucune ne demande de règle comptable nouvelle. Celles qui en demandent sont marquées **⚠ à valider** : je n'en coderai aucune sans les règles de l'enseignant.

| # | Fonction | Intérêt pour l'enseignement | Niveau | Effort |
|---|---|---|---|---|
| 1 | **Dossier libre** (société créée par l'élève : raison sociale, forme, période, niveau du plan), ouverture saisie par l'élève | Base du mode énoncé papier ; l'élève fait le geste d'entreprise « créer un mandat » | 1ère CFC | M |
| 2 | **Plusieurs dossiers et plusieurs exercices par dossier**, clôture puis **nouvel exercice avec report à nouveau** (moteur de réouverture existant) | Faire vivre une entreprise sur deux ou trois années (fil rouge Cycles du Léman), comprendre San et Spb | 1ère CFC | M |
| 3 | ~~Plan comptable du dossier modifiable par l'élève~~ **Retiré (décision du 27.11.2026)** : plan du cours de l'année, ajustable par l'enseignant seulement | | | |
| 4 | **Saisie rapide** : grille continue, pièce et date reprises, Tab et Entrée, recherche et filtres du journal, duplication d'une écriture | Rapidité, aisance au clavier comme dans Banana | Tous | M |
| 5 | **Modèles d'écritures** (« loyer mensuel », « salaire de Mme X ») créés par l'élève | Opérations répétitives des dossiers longs ; en entraînement, la couche pédagogique peut les interdire | 2ème CFC | S |
| 6 | **Pièces justificatives jointes** (photo ou PDF de la feuille, stockés dans le navigateur, IndexedDB) ; pièces de l'énoncé liées à l'écriture | Lien pièce → écriture, cœur du métier ; contrôle par l'enseignant | Tous | M |
| 7 | **Historique des modifications** : écriture créée, modifiée, supprimée, extournée, avec date et heure | Rigueur ; l'enseignant voit le cheminement ; utile pour l'évaluation | Tous | S |
| 8 | **Factures ouvertes** (réduit le 27.11.2026 : comptes auxiliaires et lettrage retirés, non enseignés) : liste des factures émises et reçues de l'exercice, payées ou non, d'après la rubrique Facturation ; aucun compte nouveau, 1100, 2000 et 2010 inchangés | Suivi des factures comme au service de comptabilité, sans notion nouvelle | 2ème CFC (option Finances), maturité | M |
| 9 | **QR-facture** : facture et section de paiement conformes aux directives de SIX, code QR produit dans le navigateur ; lecture du code QR d'une pièce | La facturation d'aujourd'hui devient réelle ; ⚠ demande un encodeur de QR (dépendance à justifier ou code écrit à la main) | 2ème CFC | M |
| 10 | **Rapprochement bancaire** : import d'un relevé camt.053 (fichier fictif produit par l'enseignant depuis l'éditeur), pointage des lignes avec les écritures, propositions d'écritures que l'élève confirme | Geste central en entreprise, enseignable sans vraie banque ; l'écriture reste celle de l'élève | 2ème CFC, maturité | L |
| 11 | **TVA par codes** : code TVA par compte ou par ligne, TVA calculée et ventilée, rapport de période, formulaire existant branché | Rapproche la saisie de Banana, bexio et Abacus | 2ème CFC | M |
| 12 | ~~TVA, méthode TDFN~~ **Retiré (non enseignée, 27.11.2026)** | | | |
| 13 | **Registre des immobilisations** : fiche par bien, méthode et taux donnés par l'élève, plan d'amortissement, écritures proposées et passées par l'élève | Calcul vérifié, lien avec 6800 et les comptes xxx9 ; règles déjà validées (direct, indirect, linéaire, dégressif, prorata) | 2ème CFC | M |
| 14 | **Salaires** : fichier du personnel, décomptes mensuels à partir de la fiche existante, récapitulatif annuel (certificat de salaire retiré le 27.11.2026, non enseigné) | Prolonge la fiche de salaire et la déclaration annuelle déjà enseignée | 2ème CFC | M |
| 15 | **Centres de coûts** (une dimension sur les lignes d'écriture) et rapport par centre | Lien avec la comptabilité analytique de maturité | Maturité | M |
| 16 | **Budget du dossier** : budget par compte et comparaison continue (moteur `budget.ts` existant) | Déjà enseigné, à généraliser à tout dossier | 2ème CFC | S |
| 17 | **Multidevises** : compte en devise, cours du jour donné par la pièce, différence de change selon la règle validée du cours (passée dans 4200 ou 3200) | Règle de maturité déjà validée ; ⚠ la présentation « professionnelle » (compte de change séparé) diffère de la règle du cours : garder celle du cours | Maturité | L |
| 18 | **États financiers selon le CO**, bilan et compte de résultat (art. 959a et 959b), en forme de compte et en forme de liste (annexe retirée le 27.11.2026, non enseignée) | Comptes annuels « vrais », imprimables | Maturité | S |
| 19 | **Tableaux de bord** : liquidités, résultat cumulé, postes ouverts, TVA due, ratios existants | Lecture des chiffres ; réutilise `analyse.ts` et `tableaux.ts` | 2ème CFC | S |
| 20 | **Exports** : PDF de chaque état, CSV, **Excel** (fichier .xlsx écrit à la main sur le module ZIP existant, sans dépendance) ; **imports** : plan comptable et écritures en CSV, relevé camt.053 | Passerelle vers Excel et les autres logiciels ; l'enseignant récupère des données | Tous | M |
| 21 | **Recherche globale et raccourcis** : palette de commandes, « aller au compte » | Ergonomie professionnelle | Tous | S |
| 22 | **Clôture guidée** : liste de contrôle de fin d'exercice (transitoires, amortissements, ducroire, stock, TVA, bouclement), puis verrouillage de l'exercice | Synthèse de 2ème CFC ; reprend `guide-bouclement.ts` | 2ème CFC | M |

**Non retenu pour le moment :**
- connexion à une vraie banque, lecture des pièces par intelligence artificielle, stockage en ligne : contraires à la règle « aucune donnée d'élève en ligne » ;
- usage par une vraie entreprise (exclu par la demande) ;
- salaires transmis par Swissdec ;
- facture électronique eBill.

---

## d. Séparer le logiciel et le cours

### d.1 Architecture proposée : **un seul site, un moteur, trois espaces**

Je recommande **une application et trois espaces**, plutôt que deux applications. Raisons :
1. Les **liens `?exercice=`** et `?theorie=` déjà distribués, le service worker hors ligne et le stockage du navigateur (une seule origine) continuent de fonctionner sans rien changer.
2. Le chargement à la demande déjà en place (`Differe`, `VUES_BASE`) sépare déjà le code par espace : l'élève qui n'ouvre que le Logiciel ne charge pas le Cours.
3. Une seule adresse à retenir pour les élèves et les collègues.

Deux applications séparées (par exemple `cours.html` et `index.html`) restent possibles plus tard. Ce serait une page de plus du même site, sans nouveau moteur.

**Organisation du code** (sans routeur, avec la machine à états de `modes.ts`) :

```
src/engine/            moteur comptable pur (inchangé, enrichi)
src/engine/pedagogie/  couche pédagogique : correction, notation, diagnostics, niveaux
                       (fichiers actuels déplacés plus tard, ou réexportés, sans changer leur comportement)
src/ui/logiciel/       espace Logiciel : dossiers, exercices comptables, journal, comptes, débiteurs, banque…
src/ui/cours/          espace Cours : Apprendre, Théorie, leçons, exercices générés, révision
src/ui/enseignant/     espace Enseignant : éditeur, distribution, copies, synthèse, simulateur
src/ui/commun/         thème, dialogues, bandeau, composants partagés
```

Le déplacement des fichiers se fait **sans changer le comportement**, dans une phase à part et couverte par les tests existants. Il est facultatif : la séparation visible pour l'élève ne l'exige pas.

### d.2 Navigation
Un bandeau commun propose trois entrées : **Logiciel · Cours · Espace enseignant**, puis Guide.

- **Logiciel.** Page « Mes dossiers » (les entreprises de l'élève), avec pour chacune ses exercices comptables. L'exercice distribué par l'enseignant apparaît comme un dossier « à faire », avec son énoncé et ses pièces dans un panneau latéral repliable. Dans un dossier, barre latérale de logiciel professionnel : Tableau de bord, Journal, Plan comptable, Comptes, Grand livre, Balance, Bilan, Compte de résultat, puis les modules activés (TVA, Débiteurs, Créanciers, Banque, Immobilisations, Salaires, Budget), puis Clôture.
- **Cours.** L'actuelle page Apprendre, la Théorie, les leçons, les exercices générés, la révision du jour.
- **Ponts entre les deux.**
  - Du Logiciel vers le Cours : depuis une erreur, « Revoir la notion » ouvre le chapitre dans un nouvel onglet, comme aujourd'hui.
  - Du Cours vers le Logiciel : à la fin d'un module, « Appliquer dans un dossier » ouvre un dossier d'exercice du logiciel.

### d.3 Ce que deviennent les écrans actuels

| Écran actuel | Devient |
|---|---|
| Accueil (portes, fil rouge, démonstration) | Page d'entrée du site, inchangée dans l'esprit ; ses trois portes mènent aux trois espaces (« m'exercer » et « évaluation » vers le Logiciel) |
| Page Exercices et page Évaluation de l'accueil | Logiciel, « Nouveau dossier » : à partir d'un exercice du catalogue, d'un fichier reçu, ou dossier libre (énoncé papier) |
| Votre mission, Journal, Comptes, Grand livre, Balance, Bilan, Compte de résultat, Bouclement | Logiciel, à l'intérieur d'un dossier ; « Votre mission » devient l'onglet Énoncé et le Tableau de bord |
| TVA, Salaire, Répartition, Analyse, Fiches (marge brute, échelle, degrés, flux, seuil, bilan d'ouverture) | Logiciel : modules et rapports ; les fiches à remplir restent des **fiches d'exercice**, rattachées à l'énoncé |
| Facturation, Budget | Logiciel : modules Débiteurs et Budget ; leurs exercices actuels restent des fiches d'exercice |
| Apprendre, Théorie, leçons, Révision | Cours |
| Espace enseignant (Exercices, Dossiers, Copies, Progression, Relecture, Simulateur) | Espace enseignant, avec une entrée « Distribuer » (voir e) |
| Simulateur | Espace enseignant pour la partie ; chaque groupe voit sa comptabilité comme un dossier du Logiciel |

### d.4 Ce qui change pour l'élève et pour l'enseignant
- **Élève.** Il distingue « j'apprends » (Cours) et « je tiens une comptabilité » (Logiciel). Il retrouve tous ses dossiers dans une même liste, au lieu de l'exercice en cours et des « autres exercices ». Il peut créer son propre dossier. Rien de ce qu'il a commencé n'est perdu : les sessions enregistrées deviennent des dossiers de la liste.
- **Enseignant.**
  - Un exercice se pense comme un **dossier de départ et un énoncé**, distribué puis corrigé.
  - Il peut faire travailler la classe dans le Logiciel sans que l'énoncé y soit (énoncé papier).
  - Pour lui, le Cours et le Logiciel se présentent séparément, et il peut renvoyer ses élèves vers l'un ou l'autre.

### d.5 Les trois engagements (conditions qui ne changent pas)
1. **Rien de perdu.**
   - Les fichiers `.compta-exercice.json` et `.compta-copie.json` actuels restent lus : le mécanisme de version `VERSION` et `MIGRATIONS` de `src/io/fichiers.ts` existe déjà.
   - Les sessions du navigateur (clés `compta-pme:…`) sont converties en dossiers à la première ouverture, sans effacer les anciennes clés pendant au moins une année scolaire.
   - Les liens `?exercice=` (et `ANCIENS_IDS`) et `?theorie=` ouvrent la même chose qu'aujourd'hui.
   - Un test de non-régression par format : fichiers réels des versions actuelles gardés dans `tests/fixtures/`.
2. **Aucune donnée d'élève en ligne.** Tout reste dans le navigateur et circule par fichiers. Les pièces jointes restent dans IndexedDB et dans le fichier de copie.
3. **Tests.** Toute fonction comptable nouvelle a ses tests dans `tests/`. Les 661 tests actuels restent verts à chaque phase.

---

## e. Les exercices des enseignants

### e.1 Créer
L'éditeur actuel, enrichi :
- **Partir d'un dossier.** L'enseignant tient lui-même un dossier dans le Logiciel : ouverture et écritures. Puis « Faire un exercice de ce dossier » : chaque pièce devient une opération, son écriture devient le corrigé. C'est la méthode de saisie du corrigé déjà en place (session `role: 'corrige'`), généralisée.
- **Énoncé.** Texte de chaque opération, pièces générées (modèle `pieces.ts`) ou photo ou PDF joint, barème proposé (2 points dès trois lignes, 1 sinon, règle déjà validée).
- **Contrôle** par `controlerExercice` avant l'export, comme aujourd'hui.

### e.2 Distribuer, sans serveur
1. **Fichier**, comme aujourd'hui : `.compta-exercice.json`, déposé dans le devoir Google Classroom.
2. **Lien autonome.** L'exercice est compressé et placé **après le `#`** de l'adresse (`…/compta-pme/#ex=…`). Le fragment n'est jamais envoyé au serveur par le navigateur : l'exercice voyage dans le lien sans être hébergé. Compression native du navigateur (`CompressionStream`), sans dépendance.
   - En évaluation sommative, le corrigé n'est jamais dans le lien.
   - En entraînement et en formative, il y est encodé, comme dans le fichier.
   - Limite : quelques dizaines de kilo-octets. Les exercices du catalogue passent ; des pièces jointes lourdes, non (fichier alors).
3. **QR code** de ce lien, à projeter ou à imprimer sur la feuille. Un code QR contient au plus environ 2,9 ko : il convient aux exercices courts (une quinzaine d'opérations sans pièces jointes, à mesurer). Pour les autres, le QR code mène à l'exercice du catalogue ou au fichier.
   - ⚠ Demande un encodeur de QR : petite dépendance à justifier, ou code écrit à la main.
   - Je mesurerai la taille réelle des exercices avant de promettre quoi que ce soit.
4. **Paquet de classe.** Un ZIP (module `zip.ts` existant) contient l'exercice, la liste de la classe et la consigne Classroom prête à coller.

### e.3 Variantes par élève
La variante actuelle multiplie les montants par 2 ou 3 : le second audit a montré qu'il suffit de diviser. Proposition, **⚠ à valider sur maquette** :
- **Exercice paramétré.** L'enseignant marque certains montants comme variables (« entre 800 et 1'200, par 50 francs ») et écrit le corrigé en formules à partir de ces montants. Exemple : TVA = montant × 8,1 %, arrondie aux 5 centimes par le moteur existant.
- Le logiciel tire les montants de chaque élève d'après son nom (graine reproductible, comme les exercices courts) : chaque élève a sa variante.
- À l'import de la copie, l'enseignant retrouve le même tirage d'après le nom, donc le même corrigé.
- Effort L ; les règles de calcul restent celles du moteur.

### e.4 Corriger et rendre
- **Import en lot.** ZIP de l'archive Classroom ou dossier de fichiers. Les contrôles actuels restent : rejeu du journal, mode, doublons, copie la plus récente.
- **Ajustement manuel des points d'une opération**, avec un commentaire : demandé par les deux audits.
- **Retour à l'élève.** Un fichier `.compta-retour.json` par élève, ou le PDF déjà en place. L'élève l'ouvre dans son dossier : chaque écriture porte son statut et le commentaire de l'enseignant.
- **Synthèse de classe** actuelle (par opération, par notion, fautes communes), inchangée.

### e.5 Suivre la classe (question de l'enseignant du 27.11.2026)
Sans serveur, l'enseignant ne voit en direct ni l'écran ni le navigateur des élèves : il voit ce qu'ils lui rendent
(copies `.compta-copie.json`, progression `.compta-progression.json`). Aujourd'hui, les onglets « Copies » et
« Progression » les montrent séparément et les oublient à la fermeture. Proposition : un tableau **« Ma classe »**,
une ligne par élève de la liste de classe, une colonne par exercice distribué et une par notion d'Apprendre : rendu ou
non, avancement, note, notions confirmées ; filtre « n'a pas rendu ». Les données restent sur l'ordinateur de
l'enseignant, enregistrées dans un **fichier de classe** qu'il rouvre (décision de l'enseignant du 27.11.2026), jamais
en ligne ni dans le navigateur.

---

## f. Le mode « énoncé papier »

### f.1 Côté élève
1. Logiciel, **« Nouveau dossier, énoncé sur papier »**. L'élève indique :
   - l'entreprise ;
   - la forme juridique ;
   - la période ;
   - son année (1ère CFC, 2ème CFC, maturité), qui fixe les comptes du plan du cours proposés ;
   - le **code de l'exercice** donné par l'enseignant sur la feuille, facultatif mais recommandé (par exemple `GOLAY-24`).
2. Il **saisit le bilan d'ouverture** à partir de la feuille ; contrôle actif = passif.
3. Il **saisit les écritures** avec **les numéros de pièce de la feuille** (le numéro est libre, et le logiciel avertit d'un doublon).
4. Pendant la saisie, aucune correction : il n'y a pas de corrigé. Seuls les contrôles du journal s'appliquent (équilibre, compte existant).
5. Bouclement comme d'habitude, puis **« Exporter ma copie »** (même fichier `.compta-copie.json`, avec l'ouverture saisie).

### f.2 Côté enseignant
1. Le corrigé se prépare de trois façons :
   - saisi dans le Logiciel comme un dossier (même chemin que l'élève), puis « Enregistrer comme corrigé » ;
   - ou importé d'un fichier `.compta-exercice.json` existant ;
   - ou créé dans l'éditeur actuel.
   Le corrigé porte le même code d'exercice et les numéros de pièce de la feuille.
2. **Comparaison**, par le moteur de correction existant :
   - **par numéro de pièce** ;
   - totaux débit et crédit par compte, tolérance de 5 centimes, date non contrôlée ;
   - extourne neutralisée ;
   - **points partiels** selon la règle validée ;
   - pièces de l'élève absentes du corrigé signalées (`piecesHorsEnonce`, existant) ;
   - bouclement comparé aux écritures calculées d'après les comptes de l'élève, sans double pénalité.
   Ajout nécessaire : **comparer aussi le bilan d'ouverture saisi par l'élève**, compte par compte, avec des points prévus au barème.
   ⚠ Comment noter l'ouverture et comment traiter une erreur d'ouverture qui se répercute : **à décider par l'enseignant**. Ma proposition : l'ouverture est notée une fois, et la suite est corrigée normalement, puisque les écritures sont comparées pièce par pièce et non par solde.
3. Ensuite, tout est comme pour un exercice du logiciel : note, PDF par élève, synthèse de classe, retour.

### f.3 Du logiciel vers le papier
Depuis l'éditeur, **« Imprimer l'énoncé »** et **« Imprimer le corrigé »**, en PDF. Le module `src/pdf/dossier.ts` existe pour les dossiers de pièces : il faut le généraliser à tout exercice.
- L'énoncé : page de garde, situation, consignes, bilan d'ouverture, opérations ou pièces, code de l'exercice et QR code facultatif.
- Le corrigé : journal par pièce, bilan, compte de résultat, bouclement, barème.

---

## g. Feuille de route

Chaque phase est utilisable seule, livrée sur `apercu`, avec ses tests, une vérification dans le navigateur, le guide mis à jour (`npm run guide`), puis arrêt et attente de l'accord ; fusion dans `main` sur accord explicite. Maquettes avant chaque phase qui touche l'interface. Pour les phases L, sous-agents du projet (`.claude/agents/` : relecteur, expert-comptable, testeur d'écrans) et commande `/fin-de-phase`.

| Phase | Contenu | Utile seule parce que… | Effort |
|---|---|---|---|
| **V1. Séparation Logiciel et Cours** | Bandeau à trois espaces ; page « Mes dossiers » (les sessions actuelles et `etat.autres` deviennent des dossiers, conversion sans perte) ; écrans actuels rangés selon d.3 ; aucun changement de règle | Clarifie l'application pour tous dès la rentrée ; prépare tout le reste | M |
| **V2. Mode énoncé papier** | Dossier libre (fonction 1), ouverture saisie ou **déjà remplie** (code d'un exercice du catalogue, ou fichier de l'enseignant ; question du 27.11.2026), numéros de pièce libres, code d'exercice ; impression de **tous** les exercices du catalogue (aujourd'hui seuls les 19 dossiers de pièces ont un PDF) ; corrigé saisi ou importé ; comparaison par pièce, ouverture comprise ; impression de l'énoncé et du corrigé depuis l'éditeur (f.3) | Les collègues qui travaillent sur papier peuvent utiliser Compta PME tout de suite | L |
| **V3. Distribution, retour et suivi de la classe** | Lien autonome `#ex=`, QR code, paquet de classe ; import en lot ; ajustement manuel des points ; fichier de retour à l'élève ; tableau « Ma classe » (proposé le 27.11.2026, voir e.5) | Distribuer ses propres exercices aussi simplement qu'un exercice du catalogue | M |
| **V4. Saisie professionnelle** | Mode professionnel (c.2), saisie rapide (4), historique des modifications (7), recherche et raccourcis (21), modèles d'écritures (5) | L'élève acquiert les gestes de Banana | M |
| **V5. Années comptables** | Plusieurs exercices par dossier, clôture guidée et verrouillage (22), nouvel exercice avec report à nouveau (2) | Fil rouge sur plusieurs années ; synthèse de 2ème CFC | M |
| **V6. Variantes par élève** | Exercice paramétré (e.3) | Évaluations défendables, une variante par élève | L |
| **V7. Factures ouvertes et QR-facture** | Fonctions 8 (réduite) et 9 ; la Facturation actuelle s'y branche | Le service de comptabilité au quotidien | M |
| **V8. Banque** | Relevé camt.053 produit par l'éditeur, import, rapprochement (10) | Geste central en entreprise | L |
| **V9. Pièces jointes** | Fonction 6 (photo de la feuille, PDF), dans la copie | Lien pièce → écriture, contrôle | M |
| **V10. TVA et immobilisations** | Codes TVA (11), registre des immobilisations (13) | 2ème CFC au niveau professionnel | M |
| **V11. Rapports et échanges** | États CO en liste et en compte (18), tableaux de bord (19), budget du dossier (16), exports PDF, CSV, Excel et imports (20) | Comptes annuels imprimables, passerelle vers Excel | M |
| **V12. Maturité** | Centres de coûts (15), multidevises selon la règle du cours (17), salaires (14) | Niveau maturité et préparation à la pratique | L |

Ordre proposé : V1, V2, V3 d'abord, comme le demande l'enseignant. **V1 et V2 peuvent se recouvrir** : le dossier libre a besoin de la page « Mes dossiers ». Je propose donc de maquetter V1 et V2 ensemble, puis de les livrer l'une après l'autre.

---

## h. Questions à l'enseignant avant les maquettes

Réponses reçues le 27.11.2026 : voir « Décisions de l'enseignant » en tête du document. Toutes les questions sont
tranchées.

1. **Architecture.** Un seul site à trois espaces (recommandé), ou deux applications ?
2. **Noms des espaces.** « Logiciel », « Cours », « Espace enseignant » vous conviennent-ils ? (Autres idées : « Comptabilité » et « Apprendre ».)
3. **Énoncé papier, ouverture.** L'ouverture saisie par l'élève est-elle notée ? Si oui, combien de points par défaut, et l'erreur d'ouverture est-elle pénalisée une seule fois (proposition) ?
4. **Plan comptable modifiable par l'élève.** Fermé en 1ère CFC, ouvert en 2ème CFC et en maturité : d'accord ?
5. **TDFN, certificat de salaire, annexe des comptes annuels, comptes auxiliaires.** Font-ils partie de ce que vous enseignez ? Si oui, il me faudra vos règles et vos écritures de référence. Je n'invente rien.
6. **QR code et QR-facture.** Acceptez-vous une petite dépendance pour encoder les codes QR, ou préférez-vous un code écrit à la main, plus long à faire ?
7. **Ordre des phases V4 à V12** : à ajuster selon vos priorités de l'année.
