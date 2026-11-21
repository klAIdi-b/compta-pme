// Simulateur d'entreprise : types communs (cahier des charges docs/simulateur-cahier-des-charges.md).
// Moteur pur : aucun import d'interface, montants en centimes entiers.

import type { Centimes } from '../money';
import type { DateISO } from '../dates';
import type { LigneEcriture } from '../dossier';
import type { PieceComptable } from '../pieces';
import type { Mode } from '../exercice';

/** Niveaux du simulateur. L'AFP n'a pas de saisie comptable (décision du 20.11.2026). */
export type NiveauSimulation = 'AFP' | 'CFC1' | 'CFC2' | 'MP';

/** Niveaux programmés : AFP et CFC 1 (phase S1), CFC 2 et MP (21.11.2026). */
export const NIVEAUX_DISPONIBLES: readonly NiveauSimulation[] = ['AFP', 'CFC1', 'CFC2', 'MP'];

/**
 * CFC 2 (choix de l'enseignant du 21.11.2026) : cotisations reprises du dossier de salaires validé (taux donnés par
 * l'énoncé), capacité par personne + 25 % avec le véhicule de livraison, amortissement direct dégressif 40 % de la
 * valeur comptable au prorata des mois d'utilisation, TVA et cotisations réglées une fois par trimestre.
 */
export const PARAMETRES_CFC2 = {
  /** Taux en centièmes de pour cent (5,30 % = 530), employé et employeur. */
  tauxAvsAiApg: 530,
  tauxAc: 110,
  /** Allocations familiales, à la charge de l'employeur seul. */
  tauxAlfa: 240,
  employesMax: 4,
  employesDepart: 1,
  capaciteVehiculePourcent: 25,
  /** Commerce plus grand qu'en CFC 1 : clients de base multipliés, pour que le personnel soit nécessaire et rentable. */
  multiplicateurDemande: 2,
  amortissementDegressifPourcent: 40,
} as const;

/**
 * MP (choix de l'enseignant du 21.11.2026) : SA pour toutes les entreprises, emprunt bancaire libre à chaque tour
 * (intérêts payés à la fin de chaque trimestre, pas de remboursement), répartition du bénéfice sur la fiche existante
 * d'après le dividende proposé par le groupe. Pas de prélèvement privé dans une SA.
 */
export const PARAMETRES_MP = {
  tauxInteretAnnuelPourcent: 4,
  /** Emprunt total maximal par entreprise. */
  empruntMax: 10000000,
  dividendeMaxPourcent: 50,
} as const;

export type DureeTour = 'mois' | 'trimestre';

export type Comptabilite = 'automatique' | 'eleves' | 'mixte';

export type AffichageResultats = 'classement' | 'sansRang' | 'cache';

/** Fournisseur choisi pour le réassort (dès CFC 1 ; en AFP, toujours le grossiste). */
export type ChoixFournisseur = 'grossiste' | 'importateur';

export interface Fournisseur {
  nom: string;
  adresse: string[];
  /** Écart de prix par rapport au prix d'achat de référence, en pour cent (-8 = 8 % moins cher). */
  ecartPrixPourcent: number;
  /** À crédit, payé au début du tour suivant (true), ou payable à la commande (false). */
  aCredit: boolean;
}

/** Secteur d'activité préparé : produit type, prix, demande, saison (données à valider, src/data/simulation). */
export interface Secteur {
  id: string;
  nom: string;
  /** Produit type, au singulier et au pluriel (« vélo de ville », « vélos de ville »). */
  produit: string;
  produits: string;
  prixAchatReference: Centimes;
  prixVenteReference: Centimes;
  /** Baisse du prix d'achat par mois, en pour cent (matériel informatique). */
  baissePrixAchatMensuellePourcent: number;
  /** Clients par entreprise et par mois au prix de référence, avant la saison. */
  demandeMensuelleParEntreprise: number;
  /** Coefficient de saison par mois, en pour cent (100 = mois moyen), janvier à décembre. */
  saison: readonly number[];
  /** Part des ventes à des clients professionnels, sur facture à 30 jours, en pour cent. */
  partVentesACreditPourcent: number;
  loyerMensuel: Centimes;
  /** Budget publicitaire mensuel qui donne la moitié de l'effet maximal. */
  publiciteReferenceMensuelle: Centimes;
  fournisseurs: Record<ChoixFournisseur, Fournisseur>;
  bailleur: string;
  agencePublicite: string;
  /** CFC 2 : taux de TVA des ventes et des achats de marchandises, en dixièmes de pour cent (8,1 % = 81). */
  tauxTva: number;
  /** CFC 2 : salaire brut mensuel d'un employé et part de l'employé à la LPP (montant fixe, même part pour l'employeur). */
  salaireBrutMensuel: Centimes;
  lppMensuelle: Centimes;
  /** CFC 2 : clients servis par personne (propriétaire compris) et par mois. */
  capaciteParPersonneMensuelle: number;
  /** CFC 2 : véhicule de livraison proposé à l'achat (prix hors taxe, TVA 8,1 %). */
  vehicule: { designation: string; prixHt: Centimes; garage: string; adresseGarage: string[] };
  /** Bilan d'ouverture identique pour toutes les entreprises. */
  ouverture: {
    caisse: Centimes;
    banque: Centimes;
    stockUnites: number;
    mobilier: Centimes;
  };
}

/** Paramètres de la règle du marché (§ 5 du cahier des charges), à valider. */
export interface ParametresMarche {
  /** Sensibilité des clients au prix d'une entreprise comparé au prix moyen (élasticité). */
  elasticitePrix: number;
  /** Sensibilité de la demande totale au prix moyen comparé au prix de référence. */
  elasticiteMarche: number;
  /** Effet maximal de la publicité sur l'attractivité (0.6 = jusqu'à +60 %). */
  effetMaxPublicite: number;
}

export interface ReglagesPartie {
  niveau: NiveauSimulation;
  secteur: Secteur;
  dureeTour: DureeTour;
  nbTours: number;
  annee: number;
  comptabilite: Comptabilite;
  /** Mode mixte : numéros des tours (1, 2…) saisis par les élèves. */
  toursSaisis?: number[];
  affichage: AffichageResultats;
  /** Mode des exercices produits pour la saisie des élèves (entraînement par défaut). */
  modeSaisie?: Mode;
  /** Inventaire et variation de stock au dernier tour, si l'exercice fictif couvre l'année entière. */
  cloture: boolean;
  marche: ParametresMarche;
}

/**
 * Imprévus déclenchés par l'enseignant avant le calcul d'un tour (choix du 21.11.2026) :
 * - hausse du prix d'achat chez les fournisseurs, pour une entreprise ou tout le marché (tous niveaux) ;
 * - client insolvable : une facture client du tour précédent devient une perte (CFC 2 et MP, 3805 / 1100).
 */
export type Imprevu =
  | { type: 'hausseFournisseur'; entrepriseId: string | null; pourcent: number }
  | { type: 'clientInsolvable'; entrepriseId: string };

/** Effet des imprévus du tour sur une entreprise. */
export interface ImprevusEntreprise {
  hausseAchatPourcent: number;
  /** Facture client perdue (acte de défaut de biens), TVA comprise. */
  perteClient: Centimes;
}

export const SANS_IMPREVU: ImprevusEntreprise = { hausseAchatPourcent: 0, perteClient: 0 };

export interface Entreprise {
  id: string;
  /** Nom choisi par le groupe (aucun nom d'élève). */
  nom: string;
}

export interface Decisions {
  prixVente: Centimes;
  quantiteAchetee: number;
  publicite: Centimes;
  fournisseur: ChoixFournisseur;
  /** Prélèvement privé du propriétaire, par virement (CFC 1 et plus). */
  prelevementPrive: Centimes;
  /** CFC 2 : nombre d'employés pendant le tour (0 à 4) ; par défaut, celui du tour précédent. */
  employes?: number;
  /** CFC 2 : achat du véhicule de livraison au début du tour (une seule fois). */
  acheterVehicule?: boolean;
  /** MP : montant emprunté à la banque au début du tour. */
  emprunt?: Centimes;
  /** MP : dividende proposé à l'assemblée générale, en pour cent du capital-actions (dernier tour). */
  dividendePourcent?: number;
}

/** Montants cumulés pendant le trimestre en cours, ou à payer au début du trimestre suivant (CFC 2). */
export interface Cotisations {
  /** AVS/AI/APG et AC, parts employé et employeur (2170). */
  avs: Centimes;
  /** LPP, parts employé et employeur (2171). */
  lpp: Centimes;
  /** Allocations familiales (2172). */
  alfa: Centimes;
}

/** Situation d'une entreprise entre deux tours. */
export interface EtatEntreprise {
  caisse: Centimes;
  banque: Centimes;
  /** Factures clients à encaisser au tour suivant. */
  creancesClients: Centimes;
  /** Factures du grossiste à payer au tour suivant. */
  dettesFournisseurs: Centimes;
  stockUnites: number;
  /** Valeur du stock au prix d'achat moyen pondéré. */
  stockValeur: Centimes;
  resultatCumule: Centimes;
  clientsServisCumules: number;
  /** CFC 2 : employés (sans le propriétaire). */
  employes: number;
  /** CFC 2 : véhicule de livraison, s'il a été acheté. */
  vehicule: { valeurAcquisition: Centimes; valeurComptable: Centimes; moisAchat: number } | null;
  /** CFC 2 : TVA du trimestre en cours (2200, 1170, 1171), soldée au décompte de fin de trimestre. */
  tva: { due: Centimes; ipMarchandises: Centimes; ipAutres: Centimes };
  /** CFC 2 : cotisations du trimestre en cours. */
  cotisations: Cotisations;
  /** CFC 2 : montants à payer au début du trimestre suivant (TVA : solde du décompte, négatif si l'AFC rembourse). */
  aPayer: Cotisations & { tva: Centimes };
  /** MP : emprunt bancaire (2400) et intérêts du trimestre en cours, payés à la fin du trimestre. */
  emprunt: Centimes;
  interetsTrimestre: Centimes;
  /** CFC 2 et MP : ducroire constitué à l'inventaire du 31.12 (1109). */
  ducroire: Centimes;
}

/** Une opération produite par le simulateur : pièce + écriture attendue. */
export interface ElementTour {
  date: DateISO;
  piece: PieceComptable;
  lignes: LigneEcriture[];
}

export interface ResultatEntreprise {
  entrepriseId: string;
  decisions: Decisions;
  prixAchatUnitaire: Centimes;
  /** Clients attirés par l'entreprise (avant la limite du stock). */
  demande: number;
  vendues: number;
  clientsPerdus: number;
  /** Part des clients servis sur le marché, en dixièmes de pour cent. */
  partMarchePourMille: number;
  chiffreAffaires: Centimes;
  coutMarchandisesVendues: Centimes;
  charges: Centimes;
  /** Résultat du tour (marge brute − charges ; le prélèvement privé n'est pas une charge). */
  resultat: Centimes;
  etatFin: EtatEntreprise;
  elements: ElementTour[];
}

export interface TourJoue {
  numero: number;
  debut: DateISO;
  fin: DateISO;
  demandeTotale: number;
  prixMoyen: Centimes;
  /** Imprévus déclenchés par l'enseignant pour ce tour. */
  imprevus: Imprevu[];
  resultats: ResultatEntreprise[];
}

export interface Partie {
  reglages: ReglagesPartie;
  entreprises: Entreprise[];
  tours: TourJoue[];
}
