// Fiches de calcul du cours CFC (manuel E&S, ch. 1 et 12), retenues par l'enseignant le 09.11.2026 :
// - bilan d'ouverture : classer chaque compte dans sa masse, totaux des masses et fortune nette (ou découvert) ;
// - marge brute d'une entreprise commerciale : CAB, CAN, PRAMA, PRAMV, marge brute et taux, d'après les comptes ;
// - échelle des prix : du prix d'achat brut au prix de vente brut, et nombres clés.
// Montants en centimes. Pourcentages en nombres (5 = 5 %).

import type { Centimes } from './money';
import type { Dossier } from './dossier';
import { soldes } from './ledger';

// ---------- Bilan d'ouverture ----------

export type Masse = 'actifsCirculants' | 'actifsImmobilises' | 'ceCourtTerme' | 'ceLongTerme' | 'capitauxPropres';

export const MASSES: { cle: Masse; titre: string; de: string; a: string; cote: 'actif' | 'passif' }[] = [
  { cle: 'actifsCirculants', titre: 'Actifs circulants', de: '1000', a: '1399', cote: 'actif' },
  { cle: 'actifsImmobilises', titre: 'Actifs immobilisés', de: '1400', a: '1999', cote: 'actif' },
  { cle: 'ceCourtTerme', titre: 'Capitaux étrangers à court terme', de: '2000', a: '2399', cote: 'passif' },
  { cle: 'ceLongTerme', titre: 'Capitaux étrangers à long terme', de: '2400', a: '2799', cote: 'passif' },
  { cle: 'capitauxPropres', titre: 'Capitaux propres', de: '2800', a: '2999', cote: 'passif' },
];

/** Masse du bilan d'un compte (mêmes plages que le bilan du logiciel), null hors bilan. */
export function masseDuCompte(numero: string): Masse | null {
  return MASSES.find((m) => numero >= m.de && numero <= m.a)?.cle ?? null;
}

export interface PosteOuverture {
  numero: string;
  montant: Centimes;
  masse: Masse;
}

export interface BilanOuverture {
  /** Comptes à classer : tous les postes d'ouverture sauf les capitaux propres (le capital est à calculer). */
  postes: PosteOuverture[];
  totaux: Record<Masse, Centimes>;
  totalActifs: Centimes;
  capitauxEtrangers: Centimes;
  /** Fortune nette = actifs − capitaux étrangers ; négative en cas de découvert. */
  fortuneNette: Centimes;
}

/** Bilan d'ouverture d'un exercice (montants positifs de l'énoncé). */
export function bilanOuverture(actif: Record<string, Centimes>, passif: Record<string, Centimes>): BilanOuverture {
  const postes: PosteOuverture[] = [];
  const totaux: Record<Masse, Centimes> = { actifsCirculants: 0, actifsImmobilises: 0, ceCourtTerme: 0, ceLongTerme: 0, capitauxPropres: 0 };
  for (const [numero, montant] of [...Object.entries(actif), ...Object.entries(passif)].sort(([a], [b]) => a.localeCompare(b))) {
    const masse = masseDuCompte(numero);
    if (!masse || montant === 0) continue;
    if (masse !== 'capitauxPropres') postes.push({ numero, montant, masse });
  }
  for (const p of postes) totaux[p.masse] += p.montant;
  const totalActifs = totaux.actifsCirculants + totaux.actifsImmobilises;
  const capitauxEtrangers = totaux.ceCourtTerme + totaux.ceLongTerme;
  const fortuneNette = totalActifs - capitauxEtrangers;
  totaux.capitauxPropres = fortuneNette;
  return { postes, totaux, totalActifs, capitauxEtrangers, fortuneNette };
}

// ---------- Marge brute (entreprise commerciale) ----------

export interface MargeBrute {
  /** Chiffre d'affaires brut : ventes de marchandises (3200). */
  cab: Centimes;
  /** Chiffre d'affaires net : comptes de la classe 3 (ventes, prestations propres, moins déductions, frais de ventes, pertes). */
  can: Centimes;
  /** Achats + frais d'achats − déductions obtenues (comptes 4000 à 4279). */
  prama: Centimes;
  /** Solde de 4280 : positif = diminution de stock (charge), négatif = augmentation. */
  variationStock: Centimes;
  /** PRAMV = PRAMA + diminution de stock (ou − augmentation). */
  prmv: Centimes;
  margeBrute: Centimes;
  /** Marge brute en % du CAN (NaN si CAN nul). */
  tauxMargeBrute: number;
}

/** Calcul d'après les comptes actuels du dossier, avant les écritures de bouclement. */
export function margeBrute(d: Dossier): MargeBrute {
  const s = soldes(d);
  let cab = 0;
  let can = 0;
  let prama = 0;
  let variationStock = 0;
  for (const [n, x] of s) {
    if (n === '3200') cab = -x.solde;
    if (n >= '3000' && n <= '3999') can += -x.solde;
    else if (n === '4280') variationStock = x.solde;
    else if (n >= '4000' && n <= '4279') prama += x.solde;
  }
  const prmv = prama + variationStock;
  const mb = can - prmv;
  return { cab, can, prama, variationStock, prmv, margeBrute: mb, tauxMargeBrute: can ? Math.round((mb / can) * 1000) / 10 : NaN };
}

// ---------- Échelle des prix ----------

export interface DonneesEchelle {
  /** Désignation de l'article (« une machine à café »). */
  article: string;
  /** Prix d'achat brut, en centimes. */
  pab: Centimes;
  /** Rabais (ou remise) obtenu, en % du PAB. */
  rabaisObtenu: number;
  /** Escompte obtenu, en % du PAC. */
  escompteObtenu: number;
  /** Frais d'achat : montant en centimes, ou pourcentage du PAN. */
  fraisAchat: { type: 'chf' | 'pc'; valeur: number };
  /** Frais généraux, en % du PRA. */
  fraisGeneraux: number;
  /** Bénéfice net, en % du PR. */
  beneficeNet: number;
  /** Escompte accordé au client, en % du PVC. */
  escompteAccorde: number;
  /** Rabais accordé au client, en % du PVB. */
  rabaisAccorde: number;
}

export interface Echelle {
  rabaisObtenu: Centimes;
  pac: Centimes;
  escompteObtenu: Centimes;
  pan: Centimes;
  fraisAchat: Centimes;
  pra: Centimes;
  fraisGeneraux: Centimes;
  pr: Centimes;
  beneficeNet: Centimes;
  pvn: Centimes;
  beneficeBrut: Centimes;
  escompteAccorde: Centimes;
  pvc: Centimes;
  rabaisAccorde: Centimes;
  pvb: Centimes;
  /** PVN ÷ PAN, arrondi au dix-millième. */
  nombreClePanPvn: number;
  /** PVB ÷ PAB, arrondi au dix-millième. */
  nombreClePabPvb: number;
}

const pc = (base: Centimes, taux: number): Centimes => Math.round((base * taux) / 100);
const cle = (a: Centimes, b: Centimes) => (b ? Math.round((a / b) * 10000) / 10000 : NaN);

/** Calcul pas à pas, chaque étape arrondie au centime (comme l'élève le fait). */
export function echelle(x: DonneesEchelle): Echelle {
  const rabaisObtenu = pc(x.pab, x.rabaisObtenu);
  const pac = x.pab - rabaisObtenu;
  const escompteObtenu = pc(pac, x.escompteObtenu);
  const pan = pac - escompteObtenu;
  const fraisAchat = x.fraisAchat.type === 'chf' ? x.fraisAchat.valeur : pc(pan, x.fraisAchat.valeur);
  const pra = pan + fraisAchat;
  const fraisGeneraux = pc(pra, x.fraisGeneraux);
  const pr = pra + fraisGeneraux;
  const beneficeNet = pc(pr, x.beneficeNet);
  const pvn = pr + beneficeNet;
  // PVN = (100 − escompte) % du PVC ; PVC = (100 − rabais) % du PVB.
  const pvc = Math.round((pvn * 100) / (100 - x.escompteAccorde));
  const escompteAccorde = pvc - pvn;
  const pvb = Math.round((pvc * 100) / (100 - x.rabaisAccorde));
  const rabaisAccorde = pvb - pvc;
  return {
    rabaisObtenu, pac, escompteObtenu, pan, fraisAchat, pra, fraisGeneraux, pr, beneficeNet, pvn,
    beneficeBrut: pvn - pra, escompteAccorde, pvc, rabaisAccorde, pvb,
    nombreClePanPvn: cle(pvn, pan), nombreClePabPvb: cle(pvb, x.pab),
  };
}
