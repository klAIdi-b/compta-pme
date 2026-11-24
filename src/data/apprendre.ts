// Parcours « Apprendre » (CFC 1) : un module par notion, dans l'ordre du cours. Chaque module : objectif, rappel
// (repris de la théorie validée), exemple travaillé, série d'exercices courts générés, maîtrise à 8 sur 10.
// Les modèles d'opérations reprennent les écritures des corrigés validés des exercices CFC 1 (mêmes comptes).

import type { FormatQuestion, ModeleOperation } from '../engine/exercices-courts';
import type { TypeCompte } from '../engine/plan';

export type NiveauApprendre = 'CFC1' | 'CFC2' | 'MP';

export const LIBELLES_NIVEAU_APPRENDRE: Record<NiveauApprendre, string> = {
  CFC1: 'CFC · 1re année',
  CFC2: 'CFC · 2e année et option Finances',
  MP: 'Maturité professionnelle',
};

export interface ModuleApprendre {
  id: string;
  niveau: NiveauApprendre;
  titre: string;
  /** Ce que l'élève saura faire à la fin du module. */
  objectif: string;
  /** Points essentiels, repris de la théorie validée. */
  rappel: string[];
  /** Chapitre de théorie correspondant (aucun pour les notions sans chapitre). */
  chapitre?: string;
  /** Modèle utilisé pour l'exemple travaillé (modules d'écritures) ; sinon, un calcul généré sert d'exemple. */
  exemple?: string;
  /** Générateurs de calculs (src/engine/calculs.ts) pour les modules de calcul. */
  calculs?: string[];
  /** Objectifs du plan d'études couverts (codes). */
  plan?: string[];
  /** Familles d'écritures générées (src/engine/ecritures-generees.ts) pour les modules d'écritures CFC 2 et MP. */
  ecritures?: string[];
  modeles: string[];
  /** Comptes proposés dans les listes et pour « classer » ou « solde ». */
  comptes: string[];
  types: TypeCompte[];
  formats: FormatQuestion[];
  /** Durée indicative en classe, en minutes (kit enseignant). */
  duree: number;
}

const M = (id: string, texte: string, debit: string, credit: string, min: number, max: number, pas = 10): ModeleOperation => ({
  id, texte, debit, credit, min, max, pas,
});

export const MODELES: ModeleOperation[] = [
  // Opérations entre comptes du bilan
  M('retrait-caisse', 'Retrait de {m} au bancomat pour alimenter la caisse.', '1000', '1020', 200, 1500, 50),
  M('versement-banque', 'Versement de {m} de la caisse sur le compte bancaire.', '1020', '1000', 1000, 9000, 100),
  M('virement-poste-banque', 'Virement de {m} du compte postal sur le compte bancaire.', '1020', '1010', 500, 4000, 100),
  M('client-paie', 'Un client règle sa facture par virement bancaire, {m}.', '1020', '1100', 800, 7000, 50),
  M('apport', "Le propriétaire apporte {m} à l'entreprise, versés sur le compte bancaire.", '1020', '2800', 5000, 20000, 500),
  M('remboursement-emprunt', "Remboursement partiel de l'emprunt bancaire à long terme, par la banque, {m}.", '2400', '1020', 2000, 8000, 500),
  M('dette-par-apport', "Le propriétaire rembourse {m} de l'emprunt bancaire de l'entreprise par un apport personnel.", '2400', '2800', 2000, 10000, 500),
  M('ordinateur-banque', "Achat d'un ordinateur pour le bureau, payé par la banque, {m}.", '1521', '1020', 900, 2500, 50),
  M('mobilier-credit', 'Achat de mobilier pour le magasin ; nous comptabilisons la facture, {m}.', '1510', '2010', 1500, 6000, 100),
  M('vehicule-credit', "Achat d'une camionnette d'occasion à crédit, {m}.", '1530', '2010', 8000, 25000, 500),
  M('machine-credit', "Achat à crédit d'une machine pour l'atelier, {m}.", '1500', '2010', 3000, 15000, 500),
  M('paie-autre-dette', "Paiement par le compte postal de la facture du mobilier, déjà comptabilisée, {m}.", '2010', '1010', 500, 4000, 50),
  M('paie-fournisseur', 'Paiement par la banque d\'une facture de marchandises déjà comptabilisée, {m}.', '2000', '1020', 1000, 9000, 100),
  // Charges et produits
  M('loyer', 'Paiement du loyer du mois par la banque, {m}.', '6000', '1020', 1200, 3000, 50),
  M('salaire', "Salaire de l'employé payé par la banque, {m}.", '5200', '1020', 2800, 5500, 50),
  M('electricite', "Facture d'électricité payée par le compte postal, {m}.", '6400', '1010', 120, 600, 5),
  M('assurance', "Prime d'assurance contre le vol et l'incendie payée par le compte postal, {m}.", '6300', '1010', 300, 900, 10),
  M('fournitures', 'Fournitures de bureau payées en espèces, {m}.', '6500', '1000', 40, 300, 5),
  M('telephone', "Facture de téléphone et d'Internet payée par la banque, {m}.", '6510', '1020', 90, 250, 5),
  M('publicite-credit', "Facture reçue d'une agence pour une annonce publicitaire, payable à 30 jours, {m}.", '6600', '2010', 300, 1500, 10),
  M('carburant', "Carburant de la voiture de l'entreprise, payé par la banque, {m}.", '6200', '1020', 80, 450, 5),
  // Marchandises
  M('ventes-comptant', 'Ventes au comptant de la journée encaissées en caisse, {m}.', '1000', '3200', 800, 6000, 10),
  M('vente-credit', 'Vente de marchandises à crédit à un client, {m}.', '1100', '3200', 1000, 8000, 50),
  M('achat-credit', 'Achat de marchandises à crédit chez un fournisseur, {m}.', '4200', '2000', 1500, 9000, 100),
  M('retour-fournisseur', 'Retour au fournisseur de marchandises défectueuses, {m} (facture déjà comptabilisée).', '2000', '4200', 100, 900, 10),
  M('retour-client', 'Un client retourne des marchandises, {m} (facture déjà comptabilisée).', '3200', '1100', 100, 900, 10),
  M('frais-achat', "Frais de transport d'un achat de marchandises, payés par la banque, {m}.", '4270', '1020', 60, 400, 5),
  M('frais-vente', 'Frais de livraison des marchandises vendues, payés par la banque, {m}.', '3210', '1020', 60, 400, 5),
  M('prelevement-marchandises', 'Le propriétaire prend des marchandises pour son usage privé, {m} au prix coûtant.', '2850', '3720', 80, 500, 5),
  // Compte privé
  M('prive-caisse', 'Le propriétaire prélève {m} en espèces dans la caisse pour ses besoins privés.', '2850', '1000', 100, 1500, 50),
  M('prive-poste', 'Le propriétaire retire {m} du compte postal pour ses besoins privés.', '2850', '1010', 300, 2000, 50),
  M('prive-facture', "Le propriétaire paie avec la carte bancaire de l'entreprise une facture de dentiste personnelle, {m}.", '2850', '1020', 150, 900, 5),
];

const BILAN = ['retrait-caisse', 'versement-banque', 'virement-poste-banque', 'client-paie', 'apport', 'remboursement-emprunt', 'dette-par-apport', 'ordinateur-banque', 'mobilier-credit', 'vehicule-credit', 'machine-credit', 'paie-autre-dette', 'paie-fournisseur'];
const COMPTES_BILAN = ['1000', '1010', '1020', '1100', '1200', '1500', '1510', '1521', '1530', '1600', '2000', '2010', '2400', '2800'];
const COMPTES_GESTION = ['3200', '4200', '5200', '6000', '6200', '6300', '6400', '6500', '6510', '6600'];

export const MODULES: ModuleApprendre[] = [
  {
    id: 'bilan',
    niveau: 'CFC1',
    titre: 'Le bilan : actif ou passif',
    objectif: "Classer chaque compte à l'actif ou au passif et reconnaître les quatre variations du bilan.",
    rappel: [
      "L'actif dit à quoi les fonds ont servi (les emplois) : liquidités, créances, stock, immobilisations.",
      "Le passif dit d'où viennent les fonds (les sources) : capitaux étrangers (dettes) et capitaux propres (capital).",
      "Une opération entre comptes du bilan : actif + et passif +, actif − et passif −, ou une permutation (actif + et actif −, passif + et passif −).",
    ],
    chapitre: 'bilan',
    exemple: 'vehicule-credit',
    modeles: BILAN,
    comptes: COMPTES_BILAN,
    types: ['actif', 'passif'],
    formats: ['classer', 'classer', 'variation', 'variation', 'classer'],
    duree: 30,
  },
  {
    id: 'comptes',
    niveau: 'CFC1',
    titre: 'Débit et crédit : opérations du bilan',
    objectif: 'Passer une écriture simple entre deux comptes du bilan et calculer le solde d\'un compte.',
    rappel: [
      "Un compte d'actif augmente au débit et diminue au crédit ; un compte de passif augmente au crédit et diminue au débit.",
      "Trois questions : quels comptes sont touchés ? De quel type est chacun ? Augmente-t-il ou diminue-t-il ?",
      'Solde = total du côté le plus fort − total de l\'autre côté ; il s\'inscrit du côté le plus faible pour équilibrer.',
    ],
    chapitre: 'comptes',
    exemple: 'retrait-caisse',
    modeles: BILAN,
    comptes: COMPTES_BILAN,
    types: ['actif', 'passif'],
    formats: ['ecriture', 'ecriture', 'operation', 'solde', 'ecriture'],
    duree: 45,
  },
  {
    id: 'charges-produits',
    niveau: 'CFC1',
    titre: 'Charges et produits',
    objectif: 'Reconnaître une charge et un produit et passer les écritures correspondantes.',
    rappel: [
      'Une charge diminue le bénéfice, un produit l\'augmente.',
      'Un compte de charge augmente au débit ; un compte de produit augmente au crédit.',
      'Une opération qui ne touche que des comptes du bilan ne modifie pas le bénéfice.',
    ],
    chapitre: 'resultat',
    exemple: 'loyer',
    modeles: ['loyer', 'salaire', 'electricite', 'assurance', 'fournitures', 'telephone', 'carburant', 'ventes-comptant', 'vente-credit', 'achat-credit', 'ordinateur-banque', 'retrait-caisse'],
    comptes: [...COMPTES_BILAN, ...COMPTES_GESTION],
    types: ['actif', 'passif', 'charge', 'produit'],
    formats: ['classer', 'ecriture', 'ecriture', 'operation', 'erreur'],
    duree: 45,
  },
  {
    id: 'factures',
    niveau: 'CFC1',
    titre: 'Factures, dettes et créances',
    objectif: 'Distinguer facture reçue, facture envoyée et paiement, et choisir entre Dettes fournisseurs et Autres dettes.',
    rappel: [
      'Vente à crédit : le client doit encore payer, l\'entreprise a une créance (Créances clients).',
      'Achat à crédit : Dettes fournisseurs seulement pour des marchandises à revendre ; Autres dettes pour un investissement ou une autre facture.',
      'Au paiement, la charge ou la vente sont déjà comptabilisées : on éteint la dette ou la créance.',
    ],
    chapitre: 'journal',
    exemple: 'mobilier-credit',
    modeles: ['achat-credit', 'paie-fournisseur', 'vente-credit', 'client-paie', 'vehicule-credit', 'publicite-credit', 'paie-autre-dette', 'mobilier-credit', 'machine-credit'],
    comptes: ['1000', '1010', '1020', '1100', '1500', '1510', '1530', '2000', '2010', '3200', '4200', '6600'],
    types: ['actif', 'passif', 'charge', 'produit'],
    formats: ['ecriture', 'ecriture', 'operation', 'erreur', 'ecriture'],
    duree: 45,
  },
  {
    id: 'prive',
    niveau: 'CFC1',
    titre: 'Le compte privé',
    objectif: 'Comptabiliser les prélèvements et apports du propriétaire sans les confondre avec les charges.',
    rappel: [
      "Ce que le propriétaire prend pour lui (argent, marchandises, factures privées) va au débit du compte Privé.",
      "Un apport durable du propriétaire augmente le capital.",
      "Une dépense qui sert à l'entreprise reste une charge.",
    ],
    chapitre: 'resultat',
    exemple: 'prive-caisse',
    modeles: ['prive-caisse', 'prive-poste', 'prive-facture', 'apport', 'loyer', 'fournitures', 'telephone', 'prelevement-marchandises'],
    comptes: ['1000', '1010', '1020', '2800', '2850', '3720', '6000', '6500', '6510'],
    types: ['actif', 'passif', 'charge', 'produit'],
    formats: ['ecriture', 'operation', 'erreur', 'ecriture', 'ecriture'],
    duree: 30,
  },
  {
    id: 'marchandises',
    niveau: 'CFC1',
    titre: 'Achats et ventes de marchandises',
    objectif: 'Comptabiliser achats, ventes, retours et frais liés aux marchandises.',
    rappel: [
      "Les achats de marchandises vont dans Achats de marchandises, les ventes dans Ventes de marchandises ; le stock n'est modifié qu'à la clôture, d'après l'inventaire.",
      'Un retour diminue l\'achat ou la vente de départ (écriture inverse).',
      "Les frais d'achats augmentent le coût des marchandises ; les frais de ventes diminuent le chiffre d'affaires.",
    ],
    chapitre: 'marchandises',
    exemple: 'retour-fournisseur',
    modeles: ['achat-credit', 'vente-credit', 'ventes-comptant', 'retour-fournisseur', 'retour-client', 'frais-achat', 'frais-vente', 'paie-fournisseur', 'client-paie', 'prelevement-marchandises'],
    comptes: ['1000', '1020', '1100', '1200', '2000', '2850', '3200', '3210', '3720', '4200', '4270'],
    types: ['actif', 'passif', 'charge', 'produit'],
    formats: ['ecriture', 'ecriture', 'operation', 'erreur', 'ecriture'],
    duree: 45,
  },
  {
    id: 'synthese-cfc1',
    niveau: 'CFC1',
    titre: 'Synthèse : toutes les opérations',
    objectif: 'Passer sans aide les écritures de toutes les notions de la 1re année.',
    rappel: [
      'Lisez l\'opération jusqu\'au bout : moyen de paiement, à crédit ou comptant, marchandises ou investissement, privé ou entreprise.',
      'Puis les trois questions : quels comptes, de quel type, augmente ou diminue ?',
    ],
    chapitre: 'journal',
    exemple: 'publicite-credit',
    modeles: MODELES.map((m) => m.id),
    comptes: [...new Set(MODELES.flatMap((m) => [m.debit, m.credit]))].sort(),
    types: ['actif', 'passif', 'charge', 'produit'],
    formats: ['ecriture', 'ecriture', 'operation', 'erreur', 'solde'],
    duree: 45,
  },
  ...MODULES_CALCUL(),
];

/** Module de calcul : pas d'écriture, des questions générées par src/engine/calculs.ts. */
function calcul(
  id: string, niveau: NiveauApprendre, titre: string, objectif: string, rappel: string[], calculs: string[], plan: string[],
  chapitre?: string, duree = 45,
): ModuleApprendre {
  return { id, niveau, titre, objectif, rappel, chapitre, calculs, plan, modeles: [], comptes: [], types: [], formats: ['calcul'], duree };
}

/** Module d'écritures composées générées (CFC 2 et MP). */
function ecritures(
  id: string, niveau: NiveauApprendre, titre: string, objectif: string, rappel: string[], familles: string[], plan: string[],
  chapitre: string, comptes: string[], duree = 45,
): ModuleApprendre {
  return { id, niveau, titre, objectif, rappel, chapitre, ecritures: familles, plan, modeles: [], comptes, types: [], formats: ['composee'], duree };
}

function MODULES_CALCUL(): ModuleApprendre[] {
  return [
    ecritures('tva-ecritures', 'CFC2', 'TVA : comptabilisation au net',
      'Comptabiliser achats, ventes, charges, investissements, escomptes et décompte de TVA selon la méthode au net.',
      ['Ventes : la TVA due va au crédit de TVA due ; achats : l’impôt préalable va au débit (marchandises et services, ou investissements et autres charges).', 'Décompte : l’impôt préalable est viré en diminution de la TVA due, le solde va à la dette envers l’AFC.', 'Un escompte corrige aussi la TVA.'],
      ['tva'], ['CFC 2e année (E&S Partie VIII)', 'MP 3.2'], 'tva', ['1000', '1020', '1100', '1170', '1171', '1530', '2000', '2200', '2205', '3200', '3209', '4200', '6400']),
    ecritures('amortissements-ecritures', 'CFC2', 'Amortissements : méthode directe ou indirecte',
      'Choisir les comptes de l’amortissement direct et indirect.',
      ['Méthode directe : Amortissements au débit, compte de l’immobilisation au crédit.', 'Méthode indirecte : Amortissements au débit, fonds d’amortissements cumulés (xxx9) au crédit ; l’immobilisation garde sa valeur d’acquisition.'],
      ['amortissements'], ['CFC 2e année', 'MP 5.2'], 'amortissements', ['1500', '1509', '1510', '1519', '1520', '1530', '1539', '6800'], 30),
    ecritures('transitoires-ecritures', 'CFC2', 'Actifs et passifs transitoires',
      'Régulariser charges et produits à la clôture, puis les extourner à la réouverture.',
      ['Charge payée d’avance : Actifs transitoires au débit, la charge au crédit.', 'Charge à payer (pas encore facturée ou payée) : la charge au débit, Passifs transitoires au crédit.', 'À la réouverture, on extourne : écriture inverse.'],
      ['transitoires'], ['CFC 2e année', 'MP 5.1'], 'transitoires', ['1300', '2300', '6000', '6100', '6300', '6400', '6900'], 30),
    ecritures('creances-ecritures', 'CFC2', 'Pertes sur créances et ducroire',
      'Comptabiliser une perte, une créance douteuse, un règlement partiel, l’ajustement du ducroire et une récupération.',
      ['Perte définitive : Pertes sur créances au débit, Créances clients au crédit (pas de correction de TVA dans le cours).', 'Créance douteuse : virée de Créances clients à Créances douteuses.', 'Ducroire : on ajuste la différence ; une créance amortie l’an passé puis récupérée est un produit exceptionnel.'],
      ['creances'], ['CFC 2e année', 'MP 3.1', 'MP 5.3'], 'creances', ['1020', '1100', '1108', '1109', '3805', '8510'], 30),
    ecritures('salaires-ecritures', 'CFC2', 'Salaires et charges sociales',
      'Comptabiliser le salaire, les retenues, les charges de l’employeur, les paiements aux assurances et une avance.',
      ['Salaire : brut au débit de Salaires ; retenues au crédit des dettes envers les assurances ; net au crédit de la banque.', 'Charges sociales de l’employeur : au débit de Charges sociales, au crédit des dettes envers les assurances.'],
      ['salaires'], ['CFC c6.ep2a', 'MP 4.1'], 'salaires', ['1020', '1140', '2170', '2171', '5200', '5270'], 30),
    ecritures('societes-ecritures', 'MP', 'Société anonyme : capital et bénéfice',
      'Comptabiliser la fondation, la libération, l’augmentation du capital avec agio, la répartition du bénéfice et le paiement du dividende.',
      ['Souscription : Actionnaires au débit, Capital-actions au crédit ; libération : la banque au débit, Actionnaires au crédit.', 'L’agio va aux réserves légales issues du capital.', 'Répartition depuis le bénéfice reporté ; dividende payé sous déduction de l’impôt anticipé de 35 %.'],
      ['societes'], ['MP 5.6'], 'societes', ['1020', '1850', '2010', '2205', '2230', '2800', '2900', '2950', '2960', '2970', '6550']),
    ecritures('titres-ecritures', 'MP', 'Titres, intérêts et provisions',
      'Comptabiliser l’achat et la vente de titres, un dividende avec impôt anticipé, une moins-value, des intérêts et des provisions.',
      ['Titres au prix d’achat frais compris ; vente créditée au net des frais.', 'Dividende : net en banque, impôt anticipé à récupérer, brut en Produits des titres.', 'Provision : la charge par nature au débit, la provision au crédit.'],
      ['titres'], ['MP 6.1', 'MP 5.1'], 'titres', ['1020', '1060', '1176', '2600', '2640', '6100', '6900', '6940', '6952', '8900']),

    {
      ...calcul('classer-pieces', 'CFC1', 'Classer les pièces',
        'Reconnaître, avant toute écriture, si une pièce concerne des marchandises, un investissement, une charge ou le privé.',
        ['Marchandises : achetées pour être revendues.', 'Investissement : un bien qui sert durablement à l’entreprise ; il figure au bilan.', 'Charge : une dépense consommée pendant l’exercice.', 'Privé : ce que le propriétaire prend ou paie pour lui-même.'],
        ['trier'], ['CFC c5.ep1a', 'CFC c5.ep1b'], 'journal', 20),
      modeles: ['achat-credit', 'ordinateur-banque', 'mobilier-credit', 'vehicule-credit', 'machine-credit', 'loyer', 'electricite', 'assurance', 'fournitures', 'telephone', 'publicite-credit', 'carburant', 'prive-caisse', 'prive-poste', 'prive-facture'],
    },
    calcul('livres-auxiliaires', 'CFC2', 'Livres auxiliaires des clients',
      'Tenir les comptes individuels des clients et les rapprocher du compte collectif Créances clients.',
      ['Chaque client a son compte dans le livre auxiliaire : solde initial + factures − paiements.', 'La somme des soldes des clients est égale au solde du compte collectif Créances clients.'],
      ['livres-auxiliaires'], ['CFC c6.ep1a', 'CFC c6.ep1b', 'MP compléments CFC'], 'journal', 30),
    calcul('declaration-salaire', 'CFC2', 'Déclaration de salaire',
      'Établir la déclaration annuelle des salaires et calculer les cotisations sociales.',
      ['La masse salariale soumise à l’AVS est la somme des salaires bruts de l’année.', 'Les cotisations AVS/AI/APG et AC sont payées pour moitié par l’employé et pour moitié par l’employeur (taux donnés).'],
      ['declaration-salaire'], ['CFC c6.ep2a', 'CFC c6.ep2b', 'MP 4.1'], 'salaires', 30),
    calcul('marge-contributive', 'CFC2', 'Marge contributive',
      'Calculer la marge contributive, le résultat et le seuil de rentabilité.',
      ['Marge contributive par pièce = prix de vente − coût variable.', 'Résultat = marge contributive totale − charges fixes.', 'Seuil de rentabilité = charges fixes ÷ marge contributive par pièce.'],
      ['marge-contributive'], ['CFC c6.ep1a', 'CFC c6.ep1b', 'MP 9.4'], 'seuil'),
    calcul('repartition-couts', 'CFC2', 'Feuille de répartition des coûts',
      'Répartir les charges indirectes sur les centres de coûts.',
      ['Chaque charge indirecte est répartie sur les centres selon une clé (en %).', 'Le total d’un centre est la somme des parts qu’il reçoit.'],
      ['repartition-simple'], ['CFC c6.ep1a', 'MP 9.2'], undefined, 30),
    calcul('classes-pme', 'MP', 'Plan comptable PME : les classes',
      'Classer chaque compte dans sa classe du plan comptable PME.',
      ['Le premier chiffre du numéro donne la classe : 1 actifs, 2 passifs, 3 chiffre d’affaires, 4 charges de marchandises, 5 personnel, 6 autres charges d’exploitation, 7 activités annexes, 8 exceptionnels, hors exploitation et impôts, 9 clôture.'],
      ['classe-compte'], ['MP 1.1'], 'comptes', 20),
    calcul('interets', 'MP', 'Intérêts commerciaux',
      'Calculer un intérêt, une durée, un taux ou un capital (année commerciale).',
      ['I = C × t × j ÷ 36 000 (360 jours par an, 30 jours par mois).', 'On en tire j = I × 36 000 ÷ (C × t), t = I × 36 000 ÷ (C × j), C = I × 36 000 ÷ (t × j).'],
      ['interet'], ['MP 2.2'], 'interets', 30),
    calcul('compte-courant', 'MP', 'Compte courant et méthode des nombres',
      'Calculer l’intérêt d’un compte courant par la méthode des nombres, et l’impôt anticipé.',
      ['Nombre = capital × jours ÷ 100 ; intérêt = total des nombres × taux ÷ 360.', 'Sur l’intérêt créditeur, la banque retient l’impôt anticipé de 35 %.'],
      ['compte-courant'], ['MP 2.3'], 'interets', 30),
    calcul('devises', 'MP', 'Monnaies étrangères',
      'Choisir le bon cours (billets ou devises, achat ou vente) et convertir un montant.',
      ['Virement : cours des devises ; espèces : cours des billets.', 'L’entreprise paie à l’étranger : la banque lui vend la monnaie (cours vente). L’entreprise reçoit une monnaie étrangère : la banque l’achète (cours achat).'],
      ['devises'], ['MP 2.4'], 'monnaies', 30),
    calcul('prix-inverse', 'MP', 'Calcul des prix à rebours',
      'Retrouver le prix d’achat à partir du prix de vente brut.',
      ['On remonte l’échelle des prix : PVB → PVC → PVN → PR → PRA → PAN → PAC → PAB.', 'Un pourcentage ajouté (bénéfice, frais généraux) se retire en divisant par (100 + taux) % ; un pourcentage déduit (rabais, escompte) se retire en divisant par (100 − taux) %.'],
      ['prix-inverse'], ['MP 3.4'], 'prix'),
    calcul('amortissements-mp', 'MP', 'Cession et changement de méthode',
      'Calculer la valeur comptable, le résultat d’une cession et le passage de la méthode directe à la méthode indirecte.',
      ['Valeur comptable = valeur d’acquisition − amortissements cumulés.', 'Résultat de cession = prix de vente − valeur comptable.', 'Passage à la méthode indirecte : les amortissements cumulés sont reportés au fonds d’amortissements cumulés.'],
      ['cession', 'changement-methode'], ['MP 5.2'], 'amortissements'),
    calcul('perte-capital', 'MP', 'Perte de capital et surendettement',
      'Reconnaître une perte de capital et un surendettement d’après le bilan d’une SA.',
      ['Perte de capital (art. 725a CO) : actifs − dettes couvrent moins de la moitié du capital-actions et des réserves légales.', 'Surendettement (art. 725b CO) : les dettes ne sont plus couvertes par les actifs.'],
      ['perte-capital'], ['MP 5.6'], 'societes', 30),
    calcul('titres-immeubles', 'MP', 'Bordereaux et rendements',
      'Établir un bordereau d’achat d’obligations et calculer le rendement d’un titre ou d’un immeuble.',
      ['Bordereau : prix (nominal × cours) + intérêt couru (30/360) + courtage + droit de timbre.', 'Rendement = revenu de l’année (± gain ou perte) ÷ capital investi × 100.', 'Immeuble : rendement brut = loyers ÷ prix ; rendement net = (loyers − charges − intérêts) ÷ fonds propres.'],
      ['bordereau', 'rendements'], ['MP 6.1', 'MP 6.2'], 'titres'),
    calcul('point-mort', 'MP', 'Point mort et rotation du stock',
      'Calculer le chiffre d’affaires et la date du point mort, la rotation et la durée de stockage.',
      ['CA au point mort = charges fixes ÷ taux de marge (marge contributive = marge brute).', 'Date du point mort = CA au point mort ÷ CA annuel × 360.', 'Rotation du stock = PRAMV ÷ stock moyen ; durée de stockage = 360 ÷ rotation.'],
      ['point-mort'], ['MP 9.4', 'CFC c6.ep1a'], 'seuil'),
    calcul('flux-direct', 'MP', 'Flux de trésorerie : méthode directe',
      'Calculer le cash-flow d’exploitation par la méthode directe et le free cash-flow.',
      ['Méthode directe : encaissements d’exploitation − paiements d’exploitation.', 'Free cash-flow = cash-flow d’exploitation − investissements + désinvestissements.'],
      ['flux-direct'], ['MP 7.1'], 'flux', 30),
    calcul('analytique', 'MP', 'Comptabilité analytique',
      'Répartir les charges indirectes (avec un centre auxiliaire), calculer un coût d’unité d’œuvre et un prix de revient complet.',
      ['Répartition primaire sur les centres, puis secondaire : le centre auxiliaire est réparti sur les centres principaux.', 'Coût d’une unité d’œuvre = total du centre ÷ nombre d’unités.', 'Prix de revient = coût de production + frais d’administration et de vente.'],
      ['analytique'], ['MP 9.2', 'MP 9.3', 'CFC c6.ep1a']),
    calcul('normes', 'MP', 'Comptes de groupe et normes',
      'Situer les normes de présentation des comptes et le principe de la consolidation.',
      ['Swiss GAAP RPC (Suisse), IFRS (international), US GAAP (États-Unis) visent une image fidèle.', 'Consolidation : les comptes des sociétés du groupe sont réunis ; les opérations internes au groupe sont éliminées.'],
      ['normes'], ['MP 5.7'], 'evaluation', 20),
  ];
}

export const modeleParId = (id: string) => MODELES.find((m) => m.id === id)!;
