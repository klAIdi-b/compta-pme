// Parcours « Apprendre » (CFC 1) : un module par notion, dans l'ordre du cours. Chaque module : objectif, rappel
// (repris de la théorie validée), exemple travaillé, série d'exercices courts générés, maîtrise à 8 sur 10.
// Les modèles d'opérations reprennent les écritures des corrigés validés des exercices CFC 1 (mêmes comptes).

import type { FormatQuestion, ModeleOperation } from '../engine/exercices-courts';
import type { TypeCompte } from '../engine/plan';

export interface ModuleApprendre {
  id: string;
  titre: string;
  /** Ce que l'élève saura faire à la fin du module. */
  objectif: string;
  /** Points essentiels, repris de la théorie validée. */
  rappel: string[];
  /** Chapitre de théorie correspondant. */
  chapitre: string;
  /** Modèle utilisé pour l'exemple travaillé. */
  exemple: string;
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
];

export const modeleParId = (id: string) => MODELES.find((m) => m.id === id)!;
