---
paths:
  - "src/engine/**"
  - "src/data/**"
  - "src/pdf/**"
  - "tests/**"
  - "scripts/**"
---

# Règles comptables du projet (détail)

Règles validées par l'enseignant, dans leur version actuelle. Elles complètent la section « Règles comptables
essentielles » de `CLAUDE.md`. Ne rien inventer : en cas de doute, demander.

## Plan comptable

- Plan du cours, numérotation PME du manuel E&S (pas le plan LPG) : `src/data/plan-pme.csv`, numéros et intitulés
  alignés sur le cours, sans recopier l'annexe du manuel. Types : actif, passif, charge, produit, bouclement
  (classe 9). `niveau_min` : CFC1, CFC2, MP ou `-` (non utilisé par défaut, activable par l'enseignant).
- Titres de groupes du bilan et du compte de résultat : classes du plan du cours (actifs circulants, immobilisés ;
  capitaux étrangers à court et à long terme ; capitaux propres ; chiffre d'affaires ; charges de marchandises et de
  services ; charges de personnel ; autres charges d'exploitation ; amortissements ; charges et produits financiers ;
  hors exploitation ; exceptionnels ; impôts).
- `niveau` d'un exercice (CFC1, CFC2, MP) règle les comptes et fonctions disponibles ; l'enseignant ajoute ou masque
  des comptes par exercice (`comptesAjoutes`, `comptesMasques`). 3720 Prestations propres ouvert dès la 1ère CFC
  (prélèvements de marchandises 2850/3720).
- L'élève ne modifie jamais le plan comptable.

## Écritures courantes et conventions du cours

- Facture d'un fournisseur hors marchandises : 2010. Escompte au paiement en écriture composée : 2000/1020 + 4209,
  ou 1020 + 3209/1100. Déductions : 3209 accordées, 4209 obtenues ; frais : 3210 de ventes, 4270 d'achats.
- TVA : 1170 IP s/marchandises et services, 1171 IP s/investissements et autres charges d'exploitation ; escompte
  avec correction de la TVA (maturité) : accordé 3209 + 2200 au débit, obtenu 4209 + 1170 au crédit.
- Amortissements direct et indirect, fonds d'amortissements cumulés en xxx9, linéaire ou dégressif, prorata temporis.
- Transitoires 1300 / 2300 avec extourne au 01.01 passée par l'élève.
- Ducroire 3805 / 1109 par ajustement de la différence ; 1108 Créances douteuses ; pas de correction de TVA sur une
  perte sur créance (simplification du cours, art. 41 LTVA, écrite comme telle) ; créance amortie un exercice
  précédent puis récupérée : 1020/8510 ; frais de poursuite avancés : 1100.
- Salaires : retenues 5200 / dettes par assurance, net 5200/1020, charges patronales 5270 / dettes. Cotisations
  données par l'énoncé ; taux AVS/AI/APG 5,3 % + 5,3 %, AC 1,1 % + 1,1 % (donnés). LPP d'après les paramètres de
  2022, dits comme tels. Non repris faute de compte : LAA AANP, allocations familiales versées avec le salaire.
- Abonnements : 6500 et 6700 admis tous les deux (`EcritureCorrigee.variantes`).
- Provisions : dissolution permise, pas obligatoire (art. 960e al. 4 CO) ; dissolution au crédit du compte de charge
  d'origine.
- Conventions gardées comme telles et écrites dans les énoncés : « la TVA est laissée de côté » ; impôt anticipé
  d'une raison individuelle en 1176 (art. 30 LIA) ; intérêt d'un compte courant généré toujours supérieur à 200.00
  (art. 5 LIA).
- Degré d'autofinancement : (réserves issues du bénéfice + bénéfice reporté) / capitaux propres ; société : bénéfice
  de l'exercice compris ; raison individuelle : non.

## Bouclement (moteur)

- `resultatAVirer()` (résultat des charges et produits moins ce qui est déjà passé par la classe 9) sert au bilan, à
  `estBoucle()` et aux écritures attendues ; `resultatExercice()` reste le bénéfice de l'exercice.
- Écritures de bouclement = pièces hors énoncé qui touchent 9000 ou virent entre privé et capital
  (`estEcritureBouclement`) ; une clôture complète des comptes de gestion par 9000 est mise de côté
  (`clotureDeGestionPar9000`), une clôture partielle reste fausse.
- Accompagnement en entraînement : « Besoin d'aide ? » en deux niveaux (la règle, puis les comptes par leur nom, sans
  montants), aides enregistrées dans `suivi.Bouclement.aides`, sans effet sur les points. `bouclementAutomatique`
  (désactivé par défaut) : jamais corrigé ni noté. Barème `Bouclement` 3 points par défaut ; points seulement à partir
  de la moitié des opérations saisies.

## TVA et formulaire officiel

- Décompte simplifié : TVA due − impôt préalable. Méthode au brut : option d'exercice seulement.
- Formulaire 0550 de l'AFC (`formulaire-tva.ts`, option `formulaireTva`) : chiffres 200, 220, 235, 289, 299,
  303/313/343, 399, 400, 405, 479, 500 ou 510, d'après les écritures hors décompte ; vente sans TVA = 220 ; escompte
  ou rabais avec correction = 235 ; vente avec TVA hors classe 3 comptée (contre-prestation = montant TVA comprise
  en 10xx ou 11xx − TVA) ; impôt admis à 5 centimes.
- Montants hors taxe des manuels conservés, TVA recalculée aux taux actuels.

## Maturité (F&C profil M, validé)

- Devises : achat payé au cours vente, vente encaissée au cours achat ; différence de change dans 4200 ou 3200, sans
  compte de change ; cours donnés par la pièce.
- Raison individuelle : salaire du propriétaire 5200/2850, intérêt du capital 6900/2850 (facultatifs) ; revenu de
  l'entrepreneur = salaire + intérêt + résultat.
- Immeubles : usage mixte 7500 / 7510 (classe 7, après l'EBIT) ; loyers internes 6000/7500 et 2850/7500 ; dépense
  qui augmente la valeur → 1600 ; annuité = intérêt (6900, 7510 ou 8000 selon l'immeuble) + remboursement 2401 ;
  locatif hors exploitation 8000 / 8100.
- Fondation et augmentation : souscription 1850/2800 ; libération au crédit de 1850 (créances apportées au brut en
  1100, ducroire 1109, net à 1850) ; frais → 6550 (art. 959 al. 2 CO) ; agio → 2900, libéré entièrement ; bons de
  participation 1860 / 2810.
- Réserves latentes : création par amortissement excessif, stock sous-évalué, ducroire ou provision surévalués ;
  dissolution au crédit du compte de charge d'origine (1109/3805, 1509/6800, 2600/6100, 1200/4280) ; bénéfice réel =
  comptable + variation des réserves latentes. Calculs hors journal seulement dans le corrigé PDF
  (`COMPLEMENTS_CORRIGE`).
- Répartition (`repartition.ts`) : 5 % après compensation des pertes ; plafond 50 % du capital inscrit pour les
  réserves légales issues du capital et du bénéfice (20 % holding) ; tantièmes refusés sous 5 % de dividende
  (art. 677 CO). Le manuel E&S 2022 enseigne encore l'ancienne règle (art. 671, superdividende) : ne pas la reprendre.
- Titres (ch. 54) : 1060 au prix d'achat frais compris ; vente créditée au net de frais (1020/1060) ; 6940 charges des
  titres ; 6952 produits des titres ; dividendes reçus 1176 ; différence de cours à la clôture d'après l'inventaire ;
  moins-values toujours comptabilisées, plus-values au choix.
- Tableaux (`tableaux.ts`) : compte de résultat à plusieurs degrés (plan PME ch. 56) ; flux de trésorerie par la
  méthode indirecte (liquidités 1000 à 1059) ; seuil de rentabilité (`parametres.seuil`).
- Analyse (`analyse.ts`) : ratios du cours, ROI sur actif moyen, tolérance 0,1 point.

## Contenus pédagogiques

- Dossiers de pièces (`src/data/dossiers/`) : une entreprise fictive, 10 à 12 pièces, « pièces seules » (l'énoncé
  décrit le document, jamais l'écriture) ; PDF élève et corrigé par `npm run dossiers`.
- Exercices : entreprise fictive, situation de départ, corrigé complet et testé (équilibré, `controlerExercice` sans
  erreur). Théorie : les blocs validés de `CHAPITRES_VALIDES` restent intacts ; tout calcul écrit en toutes lettres
  est revérifié par `tests/theorie-verification.test.ts`.
- Variante d'évaluation (`variante.ts`) : montants × 2 ou 3, refusée avec une fiche Facturation ou Budget,
  pièces à TVA arrondie signalées ; opérations à réécrire signalées (`operationsAReecrire`).

## Fiches et calculs

- Fiches CFC (`fiches-cfc.ts`) : bilan d'ouverture (capital non donné), marge brute (CAB, CAN, PRAMA, PRAMV),
  échelle des prix (PAB → PVB, chaque étape au centime).
- Facturation (`facturation.ts`) : échéance date + 30 jours, escompte jusqu'à date + 10 jours, TVA et montant avec
  escompte arrondis aux 5 centimes ; escompte non accepté : seul le montant reçu est encaissé, le solde reste en
  1100 ; facture de services en 2010 ; montants comparés au centime ; points : facture 3, paiement 2, contrôle 3.
- Budget (`budget.ts`) : écart = effectif − budget ; écart en % au dixième ; produit plus élevé favorable, charge plus
  élevée défavorable ; points : budget 3, comparaison 3.
- Calculs d'Apprendre (`calculs.ts`) : tolérances 5 centimes et 0,1 point ; intérêts en année commerciale 30/360.
- Modèles d'écritures générées (Apprendre) : comptes et côtés repris d'une écriture d'un corrigé validé (test).

## Simulateur d'entreprise

Règles validées dans `docs/simulateur-cahier-des-charges.md` (§ 12 à 18) : stock au prix d'achat moyen pondéré,
crédit du grossiste jusqu'au tour suivant, client insolvable 3805/1100 sans correction de TVA, ducroire 5 % au 31.12
(3805/1109), emprunt 4 % en maturité (intérêts 6900/1020), véhicule amorti en direct dégressif 40 % au prorata.

## Correction automatique (moteur)

- Points partiels (écriture d'au moins trois comptes ou côtés) : barème × (lignes justes − lignes en trop) / lignes
  attendues, arrondi au demi-point inférieur.

- « Bonne classe mais mauvais compte » = même premier chiffre. Une opération incomplète n'est pas une erreur.
- Diagnostics : `inversee`, `inversee_compte`, `nette` (mêmes soldes, mouvements regroupés : faux avec message),
  montant, TVA oubliée ; indice du 2e niveau après deux essais faux.
- `champJuste` et `lireNombre` acceptent l'apostrophe typographique, les espaces insécables et « CHF ».
- Bénéficiaire d'un paiement comparé sans accents, forme juridique ni faute de frappe (`textesProches`).

## Contenus construits sur les manuels

Mêmes écritures, noms et montants changés (décision du 27.11.2026) ; anciens identifiants redirigés par
`ANCIENS_IDS` (`src/ui/lien.ts`) ; une copie rendue avec un ancien identifiant est refusée avec un message.
Correspondance : Favre Événements → Golay Événements ; Vinothèque des Pâquis → Cave des Eaux-Vives ; Maison Lacroix →
Maison Vuilleumier ; Matériaux Brodard → Matériaux Jaquier ; Imprimerie du Mont-Blanc → Imprimerie des Délices ;
Truffaz Transports → Transports Monnier ; Lambert Horlogerie → Horlogerie Perrin ; Zéphyr Automation SA → Alizé
Robotique SA ; Rive Gauche Participations SA → Arve Placements SA ; Garage du Pont-Rouge → Garage de la Praille ;
Hi-Fi Plainpalais → Son & Image Servette ; Électroménager du Rhône → Électroménager des Acacias ; Confiserie du
Bourg-de-Four → Pâtisserie du Molard. Les dossiers Électroménager des Acacias et Cycles du Léman (facturation) sont en
maturité niveau 1 (escompte avec TVA).

## Classement des exercices

`filiere` (CFC ou MP), `difficulte` (niveau) et `chapitres` du manuel. CFC : 1 Bases, 2 TVA, 3 Clôture, 4 Synthèse ;
contenus CFC de niveau 2 à 4 marqués « option Finances ». MP : 1 Opérations financières et commerciales, 2 Clôture de
l'entreprise individuelle, 3 Société anonyme, 4 Titres et immeubles, 5 Analyse financière, 6 Synthèse. Exercices de
démonstration : Cycles du Léman (1ère CFC, bénéfice 3'530.00), Papeterie de l'Arve (2ème CFC, 9'582.20), Lémantec SA
(maturité, 76'415.00).
