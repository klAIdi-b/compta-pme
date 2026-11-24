// Déroulement d'une partie : création, contrôle des décisions, calcul d'un tour.
// Chaque tour produit, pour chaque entreprise, les pièces comptables et les écritures attendues (plan du cours).
// Inventaire intermittent : achats en 4200, variation de stock 1200/4280 à l'inventaire de fin d'année.
// CFC 2 (21.11.2026) : TVA au net (prix de vente TVA comprise), salaires et charges sociales, véhicule de livraison
// amorti en direct dégressif ; TVA et cotisations réglées au début du trimestre suivant.

import type { Centimes } from '../money';
import { arrondi5, formatMontant } from '../money';
import type { DateISO } from '../dates';
import type { Resultat, LigneEcriture } from '../dossier';
import { echec, ok } from '../dossier';
import type { Partie as PartiePiece } from '../pieces';
import { avisBancaire, facture, ficheSalaire, noteInterne, ticket } from '../pieces';
import { TAUX_TVA, tvaSurHT, tvaSurTTC } from '../tva';
import { montantRetenue } from '../salaire';
import { repartirMarche } from './marche';
import type {
  Cotisations,
  Decisions,
  ElementTour,
  Entreprise,
  EtatEntreprise,
  Partie,
  ReglagesPartie,
  ResultatEntreprise,
  Imprevu,
  ImprevusEntreprise,
  NiveauSimulation,
  Secteur,
  TourJoue,
} from './types';
import { NIVEAUX_DISPONIBLES, PARAMETRES_CFC2 as P2, PARAMETRES_MP as PMP, SANS_IMPREVU } from './types';

export const BANQUE_SIMULATION: PartiePiece = { nom: 'Banque Rhodanienne', adresse: ['Place des Bergues 12', '1201 Genève'] };

const S = (debit: string, credit: string, montant: Centimes): LigneEcriture[] => [{ debit, credit, montant }];
const D = (compte: string, montant: Centimes): LigneEcriture => ({ debit: compte, credit: null, montant });
const C = (compte: string, montant: Centimes): LigneEcriture => ({ debit: null, credit: compte, montant });
/** Écriture composée sans les lignes à zéro. */
const L = (...lignes: LigneEcriture[]): LigneEcriture[] => lignes.filter((l) => l.montant !== 0);
const pad2 = (n: number) => String(n).padStart(2, '0');

// ---------- Calendrier ----------

export function nbToursMax(r: Pick<ReglagesPartie, 'dureeTour'>): number {
  return r.dureeTour === 'mois' ? 12 : 4;
}

/** Mois (1 à 12) couverts par le tour n (1, 2…). L'exercice fictif commence en janvier. */
export function moisDuTour(r: Pick<ReglagesPartie, 'dureeTour'>, n: number): number[] {
  return r.dureeTour === 'mois' ? [n] : [3 * n - 2, 3 * n - 1, 3 * n];
}

function dernierJour(annee: number, mois: number): number {
  return new Date(Date.UTC(annee, mois, 0)).getUTCDate();
}

export function dateDu(annee: number, mois: number, jour: number): DateISO {
  return `${annee}-${pad2(mois)}-${pad2(Math.min(jour, dernierJour(annee, mois)))}`;
}

export function finDuMois(annee: number, mois: number): DateISO {
  return dateDu(annee, mois, 31);
}

/** L'exercice fictif couvre-t-il l'année entière (inventaire et bouclement possibles) ? */
export function exerciceComplet(r: Pick<ReglagesPartie, 'dureeTour' | 'nbTours'>): boolean {
  return r.nbTours === nbToursMax(r);
}

const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function libellePeriode(r: Pick<ReglagesPartie, 'dureeTour' | 'annee'>, n: number): string {
  const mois = moisDuTour(r, n);
  if (mois.length === 1) return `${NOMS_MOIS[mois[0]! - 1]} ${r.annee}`;
  return `${n}e trimestre ${r.annee}`.replace(/^1e/, '1er');
}

// ---------- Prix ----------

/** Prix d'achat unitaire du tour chez un fournisseur (baisse mensuelle éventuelle, arrondi aux 5 centimes). */
export function prixAchat(secteur: Secteur, choix: Decisions['fournisseur'], premierMois: number, hausseImprevuPourcent = 0): Centimes {
  const baisse = Math.pow(1 - secteur.baissePrixAchatMensuellePourcent / 100, premierMois - 1);
  const ecart = 1 + secteur.fournisseurs[choix].ecartPrixPourcent / 100;
  return arrondi5(Math.round(secteur.prixAchatReference * baisse * ecart * (1 + hausseImprevuPourcent / 100)));
}

// ---------- Imprévus ----------

/** Contrôle d'un imprévu avant de l'ajouter au tour en cours. */
export function controlerImprevu(p: Partie, imp: Imprevu): string[] {
  const e: string[] = [];
  const cible = imp.entrepriseId ? p.entreprises.find((x) => x.id === imp.entrepriseId) : null;
  if (imp.entrepriseId && !cible) e.push('Entreprise inconnue.');
  if (imp.type === 'hausseFournisseur') {
    if (!Number.isInteger(imp.pourcent) || imp.pourcent < 5 || imp.pourcent > 10) e.push('La hausse doit être comprise entre 5 et 10 %.');
  } else {
    if (!estCfc2(p.reglages)) e.push('Le client insolvable est réservé à la 2ème CFC et à la maturité (pertes sur créances).');
    else if (cible && (etatsCourants(p).get(cible.id)?.creancesClients ?? 0) <= 0) {
      e.push(`${cible.nom} n'a aucune facture client à encaisser : un client insolvable n'est pas possible ce tour.`);
    }
  }
  return e;
}

/** Effet des imprévus du tour sur une entreprise. La facture perdue est celle d'une unité au prix du tour précédent. */
export function imprevusEntreprise(p: Partie, imprevus: readonly Imprevu[], entrepriseId: string): ImprevusEntreprise {
  const etat = etatsCourants(p).get(entrepriseId);
  let hausse = 0;
  let perte = 0;
  for (const i of imprevus) {
    if (i.type === 'hausseFournisseur' && (i.entrepriseId === null || i.entrepriseId === entrepriseId)) hausse = Math.max(hausse, i.pourcent);
    if (i.type === 'clientInsolvable' && i.entrepriseId === entrepriseId && etat && estCfc2(p.reglages)) {
      const prix = p.tours.at(-1)?.resultats.find((x) => x.entrepriseId === entrepriseId)?.decisions.prixVente ?? 0;
      perte = Math.min(etat.creancesClients, prix);
    }
  }
  return { hausseAchatPourcent: hausse, perteClient: perte };
}

// ---------- Création de la partie ----------

/** CFC 2 et plus : TVA, salaires, capacité, véhicule. */
export function estCfc2(r: Pick<ReglagesPartie, 'niveau'>): boolean {
  return r.niveau === 'CFC2' || r.niveau === 'MP';
}

/** Clients de base par entreprise et par mois selon le niveau (CFC 2 : commerce plus grand). */
export function demandeDeBase(r: Pick<ReglagesPartie, 'niveau' | 'secteur'>): number {
  return r.secteur.demandeMensuelleParEntreprise * (estCfc2(r) ? P2.multiplicateurDemande : 1);
}

export function estMp(r: Pick<ReglagesPartie, 'niveau'>): boolean {
  return r.niveau === 'MP';
}

/** MP : capital-actions (dizaines de milliers de francs) et bénéfice reporté, pour un bilan d'ouverture équilibré. */
export function fondsPropresMp(s: Secteur): { capital: Centimes; reporte: Centimes } {
  const total = s.ouverture.caisse + s.ouverture.banque + s.ouverture.stockUnites * s.prixAchatReference + s.ouverture.mobilier;
  const capital = Math.floor(total / 1000000) * 1000000;
  return { capital, reporte: total - capital };
}

/** MP : intérêts d'un mois sur l'emprunt (taux annuel / 12), au centime. */
export function interetMensuel(emprunt: Centimes): Centimes {
  return Math.round((emprunt * PMP.tauxInteretAnnuelPourcent) / 1200);
}

const ZERO_COTISATIONS: Cotisations = { avs: 0, lpp: 0, alfa: 0 };

export function etatInitial(secteur: Secteur, niveau: NiveauSimulation = 'CFC1'): EtatEntreprise {
  return {
    caisse: secteur.ouverture.caisse,
    banque: secteur.ouverture.banque,
    creancesClients: 0,
    dettesFournisseurs: 0,
    stockUnites: secteur.ouverture.stockUnites,
    stockValeur: secteur.ouverture.stockUnites * secteur.prixAchatReference,
    resultatCumule: 0,
    clientsServisCumules: 0,
    employes: niveau === 'CFC2' || niveau === 'MP' ? P2.employesDepart : 0,
    vehicule: null,
    tva: { due: 0, ipMarchandises: 0, ipAutres: 0 },
    cotisations: { ...ZERO_COTISATIONS },
    aPayer: { ...ZERO_COTISATIONS, tva: 0 },
    emprunt: 0,
    interetsTrimestre: 0,
    ducroire: 0,
  };
}

export function controlerReglages(r: ReglagesPartie): string[] {
  const e: string[] = [];
  if (!NIVEAUX_DISPONIBLES.includes(r.niveau)) {
    e.push(`Le niveau ${r.niveau} n'est pas encore disponible dans le simulateur.`);
  }
  if (!Number.isInteger(r.nbTours) || r.nbTours < 1 || r.nbTours > nbToursMax(r)) {
    e.push(`Le nombre de tours doit être compris entre 1 et ${nbToursMax(r)} pour des tours d'un ${r.dureeTour}.`);
  }
  if (r.comptabilite === 'mixte') {
    const t = r.toursSaisis ?? [];
    if (t.length === 0) e.push('En comptabilité mixte, choisissez au moins un tour saisi par les élèves.');
    if (t.some((n) => !Number.isInteger(n) || n < 1 || n > r.nbTours)) e.push('Un tour à saisir est en dehors de la partie.');
  }
  if (r.niveau === 'AFP' && r.comptabilite !== 'automatique') {
    e.push("En AFP, la comptabilité est toujours automatique : les élèves travaillent sur la fiche de calcul.");
  }
  if (r.cloture && !exerciceComplet(r)) {
    e.push("L'inventaire de clôture n'est possible que si la partie couvre l'année entière (12 mois ou 4 trimestres).");
  }
  return e;
}

export function creerPartie(reglages: ReglagesPartie, entreprises: Entreprise[]): Resultat<Partie> {
  const e = controlerReglages(reglages);
  if (entreprises.length < 2 || entreprises.length > 8) e.push('Une partie compte de 2 à 8 entreprises.');
  const ids = new Set<string>();
  const noms = new Set<string>();
  for (const x of entreprises) {
    const nom = x.nom.trim();
    if (!nom) e.push("Chaque entreprise doit avoir un nom.");
    if (ids.has(x.id)) e.push(`L'identifiant ${x.id} figure deux fois.`);
    if (noms.has(nom.toLocaleLowerCase('fr-CH'))) e.push(`Le nom « ${nom} » est déjà pris.`);
    ids.add(x.id);
    noms.add(nom.toLocaleLowerCase('fr-CH'));
  }
  if (e.length) return echec(...e);
  return ok({ reglages, entreprises: entreprises.map((x) => ({ ...x, nom: x.nom.trim() })), tours: [] });
}

/** Situation de chaque entreprise au début du prochain tour. */
export function etatsCourants(p: Partie): Map<string, EtatEntreprise> {
  const dernier = p.tours[p.tours.length - 1];
  return new Map(
    p.entreprises.map((x) => [
      x.id,
      dernier?.resultats.find((r) => r.entrepriseId === x.id)?.etatFin ?? etatInitial(p.reglages.secteur, p.reglages.niveau),
    ]),
  );
}

export function partieTerminee(p: Partie): boolean {
  return p.tours.length >= p.reglages.nbTours;
}

// ---------- Décisions ----------

/** Décisions ramenées à celles du niveau (AFP : grossiste, pas de prélèvement privé ; CFC 1 : ni personnel ni véhicule). */
export function decisionsDuNiveau(r: ReglagesPartie, d: Decisions, etat?: EtatEntreprise): Decisions {
  const base: Decisions = {
    prixVente: d.prixVente,
    quantiteAchetee: d.quantiteAchetee,
    publicite: d.publicite,
    fournisseur: d.fournisseur,
    prelevementPrive: d.prelevementPrive,
  };
  if (r.niveau === 'AFP') return { ...base, fournisseur: 'grossiste', prelevementPrive: 0 };
  if (!estCfc2(r)) return base;
  return {
    ...base,
    employes: d.employes ?? etat?.employes ?? P2.employesDepart,
    acheterVehicule: !!d.acheterVehicule && !etat?.vehicule,
    ...(estMp(r) ? { prelevementPrive: 0, emprunt: d.emprunt ?? 0, dividendePourcent: d.dividendePourcent ?? 0 } : {}),
  };
}

const debutTrimestre = (mois: number) => (mois - 1) % 3 === 0;
const finTrimestre = (mois: number) => mois % 3 === 0;

const NOMS_EMPLOYES = ['Léo Berset', 'Inès Rochat', 'Hugo Favre', 'Nora Python'];

export interface CalculSalaires {
  fiches: { employe: string; brut: Centimes; avsAc: Centimes; lpp: Centimes; net: Centimes }[];
  masse: Centimes;
  /** Part de l'employeur : AVS/AI/APG et AC au même taux, LPP du même montant, allocations familiales. */
  patronAvs: Centimes;
  patronLpp: Centimes;
  alfa: Centimes;
  totalNet: Centimes;
}

/** Salaires du tour (CFC 2) : une fiche par employé pour la durée du tour. */
export function calculSalaires(r: ReglagesPartie, employes: number, nbMois: number): CalculSalaires {
  const s = r.secteur;
  const fiches = NOMS_EMPLOYES.slice(0, employes).map((employe) => {
    const brut = s.salaireBrutMensuel * nbMois;
    const avsAc = montantRetenue(brut, P2.tauxAvsAiApg) + montantRetenue(brut, P2.tauxAc);
    const lpp = s.lppMensuelle * nbMois;
    return { employe, brut, avsAc, lpp, net: brut - avsAc - lpp };
  });
  const masse = fiches.reduce((t, f) => t + f.brut, 0);
  return {
    fiches,
    masse,
    patronAvs: montantRetenue(masse, P2.tauxAvsAiApg) + montantRetenue(masse, P2.tauxAc),
    patronLpp: fiches.reduce((t, f) => t + f.lpp, 0),
    alfa: montantRetenue(masse, P2.tauxAlfa),
    totalNet: fiches.reduce((t, f) => t + f.net, 0),
  };
}

/** Clients que l'entreprise peut servir pendant le tour (CFC 2) ; illimité en CFC 1 et en AFP. */
export function capacite(r: ReglagesPartie, employes: number, vehicule: boolean, nbMois: number): number {
  if (!estCfc2(r)) return Number.POSITIVE_INFINITY;
  const base = (1 + employes) * r.secteur.capaciteParPersonneMensuelle * nbMois;
  return Math.floor((base * (100 + (vehicule ? P2.capaciteVehiculePourcent : 0))) / 100);
}

export function prixVehiculeTtc(s: Secteur): Centimes {
  return s.vehicule.prixHt + tvaSurHT(s.vehicule.prixHt, TAUX_TVA.normal);
}

export interface DetailSorties {
  lignes: { libelle: string; montant: Centimes }[];
  total: Centimes;
  /** Avoir en banque + factures clients encaissées au début du tour. */
  disponible: Centimes;
  /** Montant de la commande du tour payé seulement au tour suivant (grossiste). */
  commandeReportee: Centimes;
}

/** Paiements prévus pendant le tour, poste par poste (les ventes du tour ne sont pas comptées). */
export function detailSorties(r: ReglagesPartie, etat: EtatEntreprise, brut: Decisions, n: number, imp: ImprevusEntreprise = SANS_IMPREVU): DetailSorties {
  const d = decisionsDuNiveau(r, brut, etat);
  const mois = moisDuTour(r, n);
  const four = r.secteur.fournisseurs[d.fournisseur];
  const ht = four ? Math.max(0, d.quantiteAchetee) * prixAchat(r.secteur, d.fournisseur, mois[0]!, imp.hausseAchatPourcent) : 0;
  const cfc2 = estCfc2(r);
  const achat = cfc2 ? ht + tvaSurHT(ht, r.secteur.tauxTva) : ht;
  const trimestre = cfc2 && debutTrimestre(mois[0]!) ? etat.aPayer : null;
  const sal = cfc2 ? calculSalaires(r, Math.max(0, Math.trunc(d.employes ?? 0)), mois.length) : null;
  const nouvelEmprunt = estMp(r) ? Math.max(0, d.emprunt ?? 0) : 0;
  const interets = estMp(r) && finTrimestre(mois[mois.length - 1]!) ? etat.interetsTrimestre + mois.length * interetMensuel(etat.emprunt + nouvelEmprunt) : 0;
  const lignes = [
    { libelle: 'Facture du grossiste du tour précédent', montant: etat.dettesFournisseurs },
    { libelle: 'Commande payée à la commande', montant: four && !four.aCredit ? achat : 0 },
    { libelle: 'Véhicule de livraison', montant: d.acheterVehicule ? prixVehiculeTtc(r.secteur) : 0 },
    { libelle: 'Loyer', montant: r.secteur.loyerMensuel * mois.length },
    { libelle: 'Publicité', montant: Math.max(0, d.publicite) },
    { libelle: 'Salaires nets', montant: sal?.totalNet ?? 0 },
    { libelle: 'Cotisations sociales du trimestre précédent', montant: trimestre ? trimestre.avs + trimestre.lpp + trimestre.alfa : 0 },
    { libelle: 'TVA du trimestre précédent', montant: trimestre ? trimestre.tva : 0 },
    { libelle: "Intérêts de l'emprunt", montant: interets },
    { libelle: 'Prélèvement privé', montant: Math.max(0, d.prelevementPrive) },
  ].filter((l) => l.montant !== 0);
  return {
    lignes,
    total: lignes.reduce((s, l) => s + l.montant, 0),
    disponible: etat.banque + etat.creancesClients - imp.perteClient + nouvelEmprunt,
    commandeReportee: four?.aCredit ? achat : 0,
  };
}

/** Sorties de la banque prévues pendant le tour (les ventes du tour ne sont pas comptées). */
export function sortiesPrevues(r: ReglagesPartie, etat: EtatEntreprise, d: Decisions, n: number, imp: ImprevusEntreprise = SANS_IMPREVU): Centimes {
  return detailSorties(r, etat, d, n, imp).total;
}

/** Contrôle des décisions d'une entreprise ; messages en français, adressés au groupe. */
export function controlerDecisions(r: ReglagesPartie, etat: EtatEntreprise, brut: Decisions, n: number, imp: ImprevusEntreprise = SANS_IMPREVU): string[] {
  const d = decisionsDuNiveau(r, brut, etat);
  const s = r.secteur;
  const e: string[] = [];
  const mois = moisDuTour(r, n).length;
  const entier = (v: number) => Number.isSafeInteger(v);
  const min = Math.round(s.prixVenteReference / 2);
  const max = s.prixVenteReference * 3;
  if (!entier(d.prixVente) || d.prixVente < min || d.prixVente > max) {
    e.push(`Le prix de vente doit être compris entre ${formatMontant(min)} et ${formatMontant(max)}.`);
  }
  const maxQuantite = demandeDeBase(r) * mois * 5;
  if (!entier(d.quantiteAchetee) || d.quantiteAchetee < 0 || d.quantiteAchetee > maxQuantite) {
    e.push(`La quantité achetée doit être un nombre entier entre 0 et ${maxQuantite}.`);
  }
  const maxPub = s.publiciteReferenceMensuelle * mois * 10;
  if (!entier(d.publicite) || d.publicite < 0 || d.publicite > maxPub) {
    e.push(`Le budget de publicité doit être compris entre 0.00 et ${formatMontant(maxPub)}.`);
  }
  if (!entier(d.prelevementPrive) || d.prelevementPrive < 0) e.push('Le prélèvement privé ne peut pas être négatif.');
  if (!s.fournisseurs[d.fournisseur]) e.push('Choisissez un fournisseur.');
  if (estCfc2(r) && (!entier(d.employes ?? 0) || (d.employes ?? 0) < 0 || (d.employes ?? 0) > P2.employesMax)) {
    e.push(`Le nombre d'employés doit être compris entre 0 et ${P2.employesMax}.`);
  }
  if (estMp(r)) {
    const em = d.emprunt ?? 0;
    if (!entier(em) || em < 0) e.push("Le montant de l'emprunt ne peut pas être négatif.");
    else if (etat.emprunt + em > PMP.empruntMax) {
      e.push(`L'emprunt total ne peut pas dépasser ${formatMontant(PMP.empruntMax)} (déjà emprunté : ${formatMontant(etat.emprunt)}).`);
    }
    const div = d.dividendePourcent ?? 0;
    if (!entier(div) || div < 0 || div > PMP.dividendeMaxPourcent) e.push(`Le dividende proposé doit être compris entre 0 et ${PMP.dividendeMaxPourcent} %.`);
  }
  if (e.length) return e;
  // Les paiements obligatoires (fournisseur, loyer, TVA et cotisations dues) ne peuvent pas être refusés : s'ils
  // dépassent à eux seuls les liquidités, le compte bancaire passe en négatif, mais aucune dépense choisie n'est admise.
  const obligatoires = sortiesPrevues(r, etat, { ...d, quantiteAchetee: 0, publicite: 0, prelevementPrive: 0, employes: 0, acheterVehicule: false }, n, imp);
  const manque = sortiesPrevues(r, etat, d, n, imp) - Math.max(etat.banque + etat.creancesClients - imp.perteClient + (estMp(r) ? d.emprunt ?? 0 : 0), obligatoires);
  if (manque > 0) {
    e.push(
      `Liquidités insuffisantes : les paiements prévus dépassent l'avoir en banque de ${formatMontant(manque)}. ` +
        'Achetez moins, réduisez la publicité ou le prélèvement privé.',
    );
  }
  return e;
}

// ---------- Calcul d'un tour ----------

function adresseEntreprise(x: Entreprise): PartiePiece {
  return { nom: x.nom, adresse: ['Genève'] };
}

function ibanFictif(index: number): string {
  return `CH${pad2(10 + index)} 0000 4471 ${String(5000 + index * 137).padStart(4, '0')} 2026 ${index}`;
}

interface Contexte {
  r: ReglagesPartie;
  n: number;
  mois: number[];
  entreprise: Entreprise;
  index: number;
}

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function piecesDuTour(
  c: Contexte,
  etat: EtatEntreprise,
  d: Decisions,
  vendues: number,
  achatUnitaire: Centimes,
  imp: ImprevusEntreprise = SANS_IMPREVU,
): { elements: ElementTour[]; etatFin: EtatEntreprise; ca: Centimes; cmv: Centimes; charges: Centimes } {
  const { r, n, mois } = c;
  const s = r.secteur;
  const cfc2 = estCfc2(r);
  const taux = cfc2 ? s.tauxTva : null;
  const an = r.annee;
  const m0 = mois[0]!;
  const mFin = mois[mois.length - 1]!;
  const moi = adresseEntreprise(c.entreprise);
  const compte = ibanFictif(c.index);
  const banque = BANQUE_SIMULATION;
  const periode = libellePeriode(r, n);
  const el: ElementTour[] = [];
  const four = s.fournisseurs[d.fournisseur];
  const fournisseur: PartiePiece = { nom: four.nom, adresse: four.adresse };
  let bq = etat.banque;
  const tva = { ...etat.tva };
  const cot = { ...etat.cotisations };
  let aPayer = { ...etat.aPayer };
  let vehicule = etat.vehicule;
  const debit = (date: DateISO, designation: string, montant: Centimes, lignes: (total: Centimes) => LigneEcriture[], mentions?: string[]) => {
    const a = avisBancaire({ sens: 'debit', banque, titulaire: moi, compte, date, operations: [{ designation, montant }], mentions });
    el.push({ date, piece: a.piece, lignes: lignes(a.total) });
    bq -= a.total;
  };
  const credit = (date: DateISO, designation: string, montant: Centimes, lignes: (total: Centimes) => LigneEcriture[]) => {
    const a = avisBancaire({ sens: 'credit', banque, titulaire: moi, compte, date, operations: [{ designation, montant }] });
    el.push({ date, piece: a.piece, lignes: lignes(a.total) });
    bq += a.total;
  };

  // Encaissement des factures clients du tour précédent.
  // Imprévu (CFC 2 et MP) : un client insolvable ; sa facture devient une perte, sans correction de la TVA.
  if (imp.perteClient > 0) {
    const date = dateDu(an, m0, 1);
    const a = noteInterne({
      emetteur: { nom: 'Office des poursuites de Genève', adresse: ['Rue du Stand 46', '1204 Genève'] }, destinataire: moi, date,
      titre: 'ACTE DE DÉFAUT DE BIENS', numero: `ADB-${an}-${pad2(n)}${pad2(c.index + 1)}`,
      texte: [
        `La poursuite contre un client professionnel de ${moi.nom} est restée sans résultat : le débiteur est insolvable.`,
        "La facture n'a pas été payée et ne le sera pas. Montant de la créance perdue (TVA comprise) :",
      ],
      lignes: [{ designation: 'Facture client de la période précédente', montant: imp.perteClient }],
      totaux: [{ libelle: 'Créance perdue', montant: imp.perteClient, fort: true }],
    });
    el.push({ date, piece: a.piece, lignes: S('3805', '1100', imp.perteClient) });
  }
  if (etat.creancesClients - imp.perteClient > 0) {
    credit(dateDu(an, m0, 1), 'Virements de clients professionnels — factures de la période précédente', etat.creancesClients - imp.perteClient, (t) => S('1020', '1100', t));
  }
  // MP : versement de l'emprunt bancaire.
  let emprunt = etat.emprunt;
  if (estMp(r) && (d.emprunt ?? 0) > 0) {
    credit(dateDu(an, m0, 1), `Versement de l'emprunt bancaire (taux ${PMP.tauxInteretAnnuelPourcent} % par an, intérêts payables à la fin de chaque trimestre)`, d.emprunt!, (t) => S('1020', '2400', t));
    emprunt += d.emprunt!;
  }
  // Paiement du grossiste (factures du tour précédent).
  if (etat.dettesFournisseurs > 0) {
    debit(dateDu(an, m0, 1), `Paiement à ${s.fournisseurs.grossiste.nom} — facture de la période précédente`, etat.dettesFournisseurs, (t) => S('2000', '1020', t));
  }
  // CFC 2 : cotisations et TVA du trimestre précédent, réglées au début du trimestre.
  if (cfc2 && debutTrimestre(m0)) {
    const jour = dateDu(an, m0, 10);
    if (aPayer.avs > 0) debit(jour, 'Caisse de compensation AVS — cotisations AVS/AI/APG et AC du trimestre précédent (parts employés et employeur)', aPayer.avs, (t) => S('2170', '1020', t));
    if (aPayer.lpp > 0) debit(jour, 'Caisse de pension — cotisations LPP du trimestre précédent (parts employés et employeur)', aPayer.lpp, (t) => S('2171', '1020', t));
    if (aPayer.alfa > 0) debit(jour, "Caisse d'allocations familiales — cotisations du trimestre précédent", aPayer.alfa, (t) => S('2172', '1020', t));
    if (aPayer.tva > 0) debit(jour, 'Administration fédérale des contributions — TVA du trimestre précédent', aPayer.tva, (t) => S('2205', '1020', t));
    if (aPayer.tva < 0) credit(jour, 'Administration fédérale des contributions — remboursement de TVA du trimestre précédent', -aPayer.tva, (t) => S('1020', '2205', t));
    aPayer = { ...ZERO_COTISATIONS, tva: 0 };
  }

  // Réassort.
  let dettesFin = 0;
  let achatHt = 0;
  if (d.quantiteAchetee > 0) {
    const fa = facture({
      emetteur: fournisseur, destinataire: moi, numero: `${four.nom.slice(0, 2).toUpperCase()}-${an}-${pad2(n)}${pad2(c.index + 1)}`,
      date: dateDu(an, m0, 2), tauxTva: taux,
      articles: [{ designation: majuscule(s.produits), quantite: d.quantiteAchetee, prixUnitaire: achatUnitaire }],
      mentions: [four.aCredit ? `Payable à ${r.dureeTour === 'mois' ? 30 : 90} jours net.` : 'Payable à la commande.'],
    });
    achatHt = fa.ht;
    tva.ipMarchandises += fa.tva;
    el.push({ date: fa.piece.date, piece: fa.piece, lignes: cfc2 ? L(D('4200', fa.ht), D('1170', fa.tva), C('2000', fa.ttc)) : S('4200', '2000', fa.ttc) });
    if (!four.aCredit) debit(dateDu(an, m0, 2), `Paiement à ${four.nom} — facture ${fa.piece.numero}`, fa.ttc, (t) => S('2000', '1020', t));
    else dettesFin = fa.ttc;
  }

  // CFC 2 : achat du véhicule de livraison, payé à la livraison.
  if (cfc2 && d.acheterVehicule && !vehicule) {
    const garage: PartiePiece = { nom: s.vehicule.garage, adresse: s.vehicule.adresseGarage };
    const fa = facture({
      emetteur: garage, destinataire: moi, numero: `V-${an}-${pad2(c.index + 1)}`, date: dateDu(an, m0, 4), tauxTva: TAUX_TVA.normal,
      articles: [{ designation: s.vehicule.designation, prixUnitaire: s.vehicule.prixHt }],
      mentions: ['Payable à la livraison.'],
    });
    el.push({ date: fa.piece.date, piece: fa.piece, lignes: L(D('1530', fa.ht), D('1171', fa.tva), C('2010', fa.ttc)) });
    tva.ipAutres += fa.tva;
    debit(dateDu(an, m0, 4), `Paiement à ${garage.nom} — facture ${fa.piece.numero}`, fa.ttc, (t) => S('2010', '1020', t));
    vehicule = { valeurAcquisition: fa.ht, valeurComptable: fa.ht, moisAchat: m0 };
  }

  // Loyer (non soumis à la TVA).
  const loyer = s.loyerMensuel * mois.length;
  debit(dateDu(an, m0, 3), `Ordre permanent — loyer du magasin, ${periode}, ${s.bailleur}`, loyer, (t) => S('6000', '1020', t));

  // Publicité (TVA 8,1 % comprise en CFC 2).
  let publiciteHt = d.publicite;
  if (d.publicite > 0) {
    const tvaPub = cfc2 ? tvaSurTTC(d.publicite, TAUX_TVA.normal) : 0;
    publiciteHt = d.publicite - tvaPub;
    tva.ipAutres += tvaPub;
    debit(
      dateDu(an, m0, 5), `Paiement à ${s.agencePublicite} — campagne publicitaire, ${periode}`, d.publicite,
      (t) => (cfc2 ? L(D('6600', t - tvaPub), D('1171', tvaPub), C('1020', t)) : S('6600', '1020', t)),
      cfc2 ? [`TVA 8,1 % comprise : CHF ${formatMontant(tvaPub)}`] : undefined,
    );
  }

  // CFC 2 : salaires (une fiche par employé) et charges sociales de l'employeur.
  let chargesPersonnel = 0;
  if (cfc2 && (d.employes ?? 0) > 0) {
    const sal = calculSalaires(r, d.employes ?? 0, mois.length);
    const jour = dateDu(an, mFin, 25);
    const per = (mois.length === 1 ? NOMS_MOIS[m0 - 1]! : libellePeriode(r, n)).toUpperCase();
    for (const f of sal.fiches) {
      const fiche = ficheSalaire({
        employeur: moi, employe: { nom: f.employe, adresse: ['Genève'] }, periode: per, date: jour, brut: f.brut,
        retenues: [{ libelle: 'AVS/AI/APG', taux: P2.tauxAvsAiApg }, { libelle: 'AC', taux: P2.tauxAc }, { libelle: 'LPP', montant: f.lpp }],
        mentions: [`Salaire net viré le ${jour.slice(8, 10)}.${jour.slice(5, 7)}.${an} sur le compte de l'employé.`],
      });
      el.push({ date: jour, piece: fiche.piece, lignes: L(D('5200', fiche.brut), C('2170', f.avsAc), C('2171', f.lpp), C('1020', fiche.net)) });
      bq -= fiche.net;
    }
    const patron = sal.patronAvs + sal.patronLpp + sal.alfa;
    const note = noteInterne({
      emetteur: moi, date: finDuMois(an, mFin), numero: `CS-${pad2(n)}`, titre: `CHARGES SOCIALES DE L'EMPLOYEUR — ${per}`,
      texte: [
        "Part de l'employeur sur les salaires bruts : AVS/AI/APG et AC au même taux que les employés, LPP du même montant " +
          "que la part des employés, allocations familiales (ALFA) 2,40 % à la charge de l'employeur seul.",
      ],
      lignes: [
        { designation: 'AVS/AI/APG et AC (caisse de compensation)', montant: sal.patronAvs },
        { designation: 'LPP (caisse de pension)', montant: sal.patronLpp },
        { designation: 'Allocations familiales', montant: sal.alfa },
      ],
      totaux: [{ libelle: 'Total des charges patronales', montant: patron, fort: true }],
    });
    el.push({ date: note.piece.date, piece: note.piece, lignes: L(D('5270', patron), C('2170', sal.patronAvs), C('2171', sal.patronLpp), C('2172', sal.alfa)) });
    cot.avs += sal.fiches.reduce((t, f) => t + f.avsAc, 0) + sal.patronAvs;
    cot.lpp += sal.patronLpp * 2;
    cot.alfa += sal.alfa;
    chargesPersonnel = sal.masse + patron;
  }

  // Prélèvement privé.
  if (d.prelevementPrive > 0) {
    debit(dateDu(an, mFin, 20), 'Virement sur le compte personnel du propriétaire', d.prelevementPrive, (t) => S('2850', '1020', t));
  }

  // Ventes du tour : clients professionnels sur facture, les autres au comptant (prix TVA comprise en CFC 2).
  const surFacture = Math.round((vendues * s.partVentesACreditPourcent) / 100);
  const comptant = vendues - surFacture;
  const fin = finDuMois(an, mFin);
  let ca = 0;
  if (comptant > 0) {
    const montant = comptant * d.prixVente;
    const t = ticket({
      emetteur: moi, date: fin, titre: `RAPPORT DE CAISSE — VENTES, ${periode.toUpperCase()}`, numero: `Z-${pad2(n)}`, tauxTva: taux,
      articles: [{ designation: `${comptant} ${comptant > 1 ? s.produits : s.produit} à ${formatMontant(d.prixVente)}`, montant }],
      mentions: ['Encaissements au comptant (espèces et cartes).'],
    });
    el.push({ date: fin, piece: t.piece, lignes: cfc2 ? L(D('1000', t.ttc), C('3200', t.ht), C('2200', t.tva)) : S('1000', '3200', t.ttc) });
    tva.due += t.tva;
    ca += t.ht;
    credit(fin, 'Versement des recettes de caisse', montant, (x) => S('1020', '1000', x));
  }
  let creancesFin = 0;
  if (surFacture > 0) {
    if (cfc2) {
      const t = ticket({
        emetteur: moi, date: fin, titre: 'RELEVÉ DES FACTURES ÉMISES', numero: `${an}-${pad2(n)}`, tauxTva: taux,
        articles: [{ designation: `${surFacture} ${surFacture > 1 ? s.produits : s.produit} vendus sur facture à ${formatMontant(d.prixVente)}`, montant: surFacture * d.prixVente }],
        mentions: ['Clients professionnels. Factures payables à 30 jours.'],
      });
      t.piece.totaux = [{ libelle: 'Total facturé', montant: t.ttc, fort: true }];
      el.push({ date: fin, piece: t.piece, lignes: L(D('1100', t.ttc), C('3200', t.ht), C('2200', t.tva)) });
      tva.due += t.tva;
      ca += t.ht;
      creancesFin = t.ttc;
    } else {
      const fa = facture({
        emetteur: moi, destinataire: { nom: 'Clients professionnels (relevé des factures)', adresse: ['Genève'] },
        numero: `${an}-${pad2(n)}`, date: fin, titre: 'RELEVÉ DES FACTURES ÉMISES',
        articles: [{ designation: `${majuscule(s.produits)} vendus sur facture`, quantite: surFacture, prixUnitaire: d.prixVente }],
        mentions: ['Factures payables à 30 jours.'],
      });
      el.push({ date: fin, piece: fa.piece, lignes: S('1100', '3200', fa.ttc) });
      ca += fa.ttc;
      creancesFin = fa.ttc;
    }
  }

  // CFC 2 : décompte TVA à la fin du trimestre ; la TVA et les cotisations seront réglées au début du suivant.
  if (cfc2 && finTrimestre(mFin)) {
    const solde = tva.due - tva.ipMarchandises - tva.ipAutres;
    if (tva.due || tva.ipMarchandises || tva.ipAutres) {
      const note = noteInterne({
        emetteur: moi, date: fin, numero: `TVA-T${Math.ceil(mFin / 3)}`, titre: `DÉCOMPTE TVA — ${Math.ceil(mFin / 3)}E TRIMESTRE ${an}`.replace('1E', '1ER'),
        texte: ["Décompte TVA du trimestre (méthode effective) d'après les comptes : virer l'impôt préalable et le solde à payer à l'AFC."],
        lignes: [
          { designation: 'TVA due sur le chiffre d\'affaires', montant: tva.due },
          { designation: 'Impôt préalable sur marchandises', montant: tva.ipMarchandises },
          { designation: 'Impôt préalable sur investissements et autres charges', montant: tva.ipAutres },
        ],
        totaux: [{ libelle: solde >= 0 ? 'TVA à payer' : 'TVA à recevoir', montant: Math.abs(solde), fort: true }],
      });
      el.push({ date: fin, piece: note.piece, lignes: L(D('2200', tva.due), C('1170', tva.ipMarchandises), C('1171', tva.ipAutres), solde >= 0 ? C('2205', solde) : D('2205', -solde)) });
    }
    aPayer = { ...cot, tva: solde };
    tva.due = tva.ipMarchandises = tva.ipAutres = 0;
    cot.avs = cot.lpp = cot.alfa = 0;
  }

  // MP : intérêts de l'emprunt, payés à la fin de chaque trimestre.
  let interetsTrimestre = etat.interetsTrimestre;
  let interetsPayes = 0;
  if (estMp(r)) {
    interetsTrimestre += mois.length * interetMensuel(emprunt);
    if (finTrimestre(mFin) && interetsTrimestre > 0) {
      debit(fin, `Intérêts de l'emprunt bancaire, ${Math.ceil(mFin / 3)}e trimestre ${an} (${PMP.tauxInteretAnnuelPourcent} % par an)`.replace(', 1e ', ', 1er '), interetsTrimestre, (t) => S('6900', '1020', t));
      interetsPayes = interetsTrimestre;
      interetsTrimestre = 0;
    }
  }

  // Stock au prix d'achat moyen pondéré (hors taxe).
  const unites = etat.stockUnites + d.quantiteAchetee;
  const valeur = etat.stockValeur + achatHt;
  const cmv = unites > 0 ? Math.round((valeur * vendues) / unites) : 0;
  const charges = loyer + publiciteHt + chargesPersonnel + interetsPayes + imp.perteClient;
  const etatFin: EtatEntreprise = {
    caisse: etat.caisse,
    banque: bq,
    creancesClients: creancesFin,
    dettesFournisseurs: dettesFin,
    stockUnites: unites - vendues,
    stockValeur: valeur - cmv,
    resultatCumule: etat.resultatCumule + ca - cmv - charges,
    clientsServisCumules: etat.clientsServisCumules + vendues,
    employes: cfc2 ? (d.employes ?? etat.employes) : etat.employes,
    vehicule,
    tva,
    cotisations: cot,
    aPayer,
    emprunt,
    interetsTrimestre,
    ducroire: etat.ducroire,
  };
  el.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { elements: el, etatFin, ca, cmv, charges };
}

/** Inventaire de fin d'année : variation de stock entre l'ouverture et l'inventaire. */
function elementInventaire(r: ReglagesPartie, x: Entreprise, fin: EtatEntreprise): ElementTour {
  const s = r.secteur;
  const ouverture = s.ouverture.stockUnites * s.prixAchatReference;
  const variation = fin.stockValeur - ouverture;
  const date = `${r.annee}-12-31`;
  const n = noteInterne({
    emetteur: adresseEntreprise(x), date, titre: "INVENTAIRE DU STOCK DE MARCHANDISES", numero: 'INV',
    texte: [
      `Inventaire au 31.12.${r.annee} : ${fin.stockUnites} ${fin.stockUnites > 1 ? s.produits : s.produit} en stock, évalués au prix d'achat moyen${estCfc2(r) ? ' hors taxe' : ''}.`,
      'Comptabilisez la variation du stock par rapport au bilan d\'ouverture.',
    ],
    lignes: [
      { designation: "Stock selon le bilan d'ouverture", montant: ouverture },
      { designation: 'Stock selon inventaire', montant: fin.stockValeur },
    ],
  });
  const lignes = variation >= 0 ? S('1200', '4280', variation) : S('4280', '1200', -variation);
  return { date, piece: n.piece, lignes };
}

/** CFC 2 et MP : ducroire de fin d'année, 5 % des créances clients (arrondi aux 5 centimes). */
export const TAUX_DUCROIRE_POURCENT = 5;
export function montantDucroire(creances: Centimes): Centimes {
  return arrondi5(Math.round((creances * TAUX_DUCROIRE_POURCENT) / 100));
}

function elementDucroire(r: ReglagesPartie, x: Entreprise, creances: Centimes, montant: Centimes): ElementTour {
  const date = `${r.annee}-12-31`;
  const n = noteInterne({
    emetteur: adresseEntreprise(x), date, titre: 'DUCROIRE', numero: 'DUC',
    texte: [`Constituer un ducroire de ${TAUX_DUCROIRE_POURCENT} % des créances clients au 31.12.${r.annee} (arrondi aux 5 centimes).`],
    lignes: [{ designation: 'Créances clients au 31.12', montant: creances }],
    totaux: [{ libelle: 'Ducroire', montant, fort: true }],
  });
  return { date, piece: n.piece, lignes: S('3805', '1109', montant) };
}

/** CFC 2 : amortissement direct dégressif du véhicule au 31.12, au prorata des mois d'utilisation. */
export function amortissementVehicule(v: NonNullable<EtatEntreprise['vehicule']>): Centimes {
  const mois = 12 - v.moisAchat + 1;
  return arrondi5(Math.round((v.valeurComptable * P2.amortissementDegressifPourcent * mois) / 1200));
}

function elementAmortissement(r: ReglagesPartie, x: Entreprise, v: NonNullable<EtatEntreprise['vehicule']>, montant: Centimes): ElementTour {
  const date = `${r.annee}-12-31`;
  const mois = 12 - v.moisAchat + 1;
  const n = noteInterne({
    emetteur: adresseEntreprise(x), date, titre: 'AMORTISSEMENT DU VÉHICULE DE LIVRAISON', numero: 'AMO',
    texte: [
      `${r.secteur.vehicule.designation} acheté en ${NOMS_MOIS[v.moisAchat - 1]} ${r.annee} pour ${formatMontant(v.valeurAcquisition)} (hors taxe).`,
      `Amortissement direct, dégressif : ${P2.amortissementDegressifPourcent} % de la valeur comptable par an, au prorata de ${mois} mois d'utilisation (arrondi aux 5 centimes).`,
    ],
    lignes: [{ designation: 'Valeur comptable avant amortissement', montant: v.valeurComptable }],
    totaux: [{ libelle: 'Amortissement de l\'exercice', montant, fort: true }],
  });
  return { date, piece: n.piece, lignes: S('6800', '1530', montant) };
}

/**
 * Calcule le tour suivant à partir des décisions de toutes les entreprises.
 * Refuse le tour si une décision manque ou est invalide (messages par entreprise).
 */
export function jouerTour(p: Partie, decisionsBrutes: Record<string, Decisions>, imprevus: readonly Imprevu[] = []): Resultat<Partie> {
  const r = p.reglages;
  if (partieTerminee(p)) return echec('La partie est terminée : tous les tours ont été joués.');
  const n = p.tours.length + 1;
  const mois = moisDuTour(r, n);
  const etats = etatsCourants(p);
  const erreurs: string[] = [];
  const decisions = new Map<string, Decisions>();
  for (const x of p.entreprises) {
    const brut = decisionsBrutes[x.id];
    if (!brut) {
      erreurs.push(`${x.nom} : décisions manquantes.`);
      continue;
    }
    const e = controlerDecisions(r, etats.get(x.id)!, brut, n, imprevusEntreprise(p, imprevus, x.id));
    erreurs.push(...e.map((m) => `${x.nom} : ${m}`));
    decisions.set(x.id, decisionsDuNiveau(r, brut, etats.get(x.id)!));
  }
  for (const i of imprevus) erreurs.push(...controlerImprevu(p, i).map((m) => `Imprévu : ${m}`));
  if (erreurs.length) return echec(...erreurs);

  const offres = p.entreprises.map((x) => {
    const d = decisions.get(x.id)!;
    const etat = etats.get(x.id)!;
    const cap = capacite(r, d.employes ?? 0, !!etat.vehicule || !!d.acheterVehicule, mois.length);
    return { prix: d.prixVente, publicite: d.publicite, disponible: Math.min(etat.stockUnites + d.quantiteAchetee, cap) };
  });
  const m = repartirMarche({ ...r.secteur, demandeMensuelleParEntreprise: demandeDeBase(r) }, r.marche, mois, offres);
  const totalVendues = m.vendues.reduce((s, v) => s + v, 0);
  const cloture = n === r.nbTours && r.cloture && exerciceComplet(r);

  const resultats: ResultatEntreprise[] = p.entreprises.map((x, i) => {
    const d = decisions.get(x.id)!;
    const etat = etats.get(x.id)!;
    const imp = imprevusEntreprise(p, imprevus, x.id);
    const achatUnitaire = prixAchat(r.secteur, d.fournisseur, mois[0]!, imp.hausseAchatPourcent);
    const t = piecesDuTour({ r, n, mois, entreprise: x, index: i }, etat, d, m.vendues[i]!, achatUnitaire, imp);
    if (cloture) {
      const ouvertureStock = r.secteur.ouverture.stockUnites * r.secteur.prixAchatReference;
      if (t.etatFin.stockValeur !== ouvertureStock) t.elements.push(elementInventaire(r, x, t.etatFin));
      if (estCfc2(r) && t.etatFin.creancesClients > 0) {
        const duc = montantDucroire(t.etatFin.creancesClients);
        if (duc > 0) {
          t.elements.push(elementDucroire(r, x, t.etatFin.creancesClients, duc));
          t.charges += duc;
          t.etatFin = { ...t.etatFin, ducroire: duc, resultatCumule: t.etatFin.resultatCumule - duc };
        }
      }
      const v = t.etatFin.vehicule;
      if (v) {
        const amo = amortissementVehicule(v);
        t.elements.push(elementAmortissement(r, x, v, amo));
        t.charges += amo;
        t.etatFin = { ...t.etatFin, vehicule: { ...v, valeurComptable: v.valeurComptable - amo }, resultatCumule: t.etatFin.resultatCumule - amo };
      }
    }
    return {
      entrepriseId: x.id,
      decisions: d,
      prixAchatUnitaire: achatUnitaire,
      demande: m.demandes[i]!,
      vendues: m.vendues[i]!,
      clientsPerdus: m.demandes[i]! - m.vendues[i]!,
      partMarchePourMille: totalVendues > 0 ? Math.round((m.vendues[i]! * 1000) / totalVendues) : 0,
      chiffreAffaires: t.ca,
      coutMarchandisesVendues: t.cmv,
      charges: t.charges,
      resultat: t.ca - t.cmv - t.charges,
      etatFin: t.etatFin,
      elements: t.elements,
    };
  });

  const tour: TourJoue = {
    numero: n,
    debut: dateDu(r.annee, mois[0]!, 1),
    fin: finDuMois(r.annee, mois[mois.length - 1]!),
    demandeTotale: m.demandeTotale,
    prixMoyen: m.prixMoyen,
    imprevus: [...imprevus],
    resultats,
  };
  return ok({ ...p, tours: [...p.tours, tour] });
}

/**
 * Reconstruit une partie à partir de ses réglages et des décisions de chaque tour. Le calcul étant déterministe, on
 * n'enregistre que les décisions : les pièces et les résultats sont recalculés (fichiers légers, aucune incohérence).
 */
export function rejouer(
  reglages: ReglagesPartie,
  entreprises: Entreprise[],
  decisionsParTour: readonly Record<string, Decisions>[],
  imprevusParTour: readonly (readonly Imprevu[])[] = [],
): Resultat<Partie> {
  const c = creerPartie(reglages, entreprises);
  if (!c.ok) return c;
  let p = c.valeur;
  for (const [i, d] of decisionsParTour.entries()) {
    const r = jouerTour(p, d, imprevusParTour[i] ?? []);
    if (!r.ok) return echec(`Tour ${i + 1} : ${r.erreurs.join(' ')}`);
    p = r.valeur;
  }
  return ok(p);
}

// ---------- Formats proposés à la création ----------

export type Format = 'eclair' | 'court' | 'long';

export const FORMATS: Record<Format, { libelle: string; seances: string; dureeTour: 'mois' | 'trimestre'; nbTours: number; description: string }> = {
  eclair: { libelle: 'Éclair', seances: '2 à 3 séances', dureeTour: 'mois', nbTours: 3, description: "3 tours d'un mois, sans bouclement" },
  court: { libelle: 'Court', seances: '4 à 6 séances', dureeTour: 'trimestre', nbTours: 4, description: "4 tours d'un trimestre, année complète" },
  long: { libelle: 'Long', seances: 'un semestre', dureeTour: 'mois', nbTours: 12, description: "12 tours d'un mois, année complète" },
};
