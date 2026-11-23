// Facturation et paiements (plan d'études CFC, 2e année : c5.ep3a créer des documents de facturation et des ordres
// de paiement, c5.ep5a vérifier les processus de paiement ; compléments CFC de la maturité).
// Règles validées par l'enseignant le 23.11.2026 :
// - prix × quantité → total brut → rabais → total hors TVA → TVA arrondie aux 5 centimes → total à payer ;
// - escompte calculé sur le total TVA comprise, arrondi aux 5 centimes ;
// - échéance = date de la facture + délai (30 jours) ; escompte valable jusqu'à la date + 10 jours, ce jour compris ;
// - contrôle des paiements : six situations, pas de lettre de relance ;
// - points en évaluation.
// Les saisies de l'élève sont des textes (comme les autres fiches) ; montants comparés au centime près.

import { formatDate, jourSuivant, lireDate, type DateISO } from './dates';
import { arrondi5, lireMontant, type Centimes } from './money';
import type { PieceComptable } from './pieces';
import { tvaSurHT } from './tva';

// ---------- Données de l'exercice ----------

export interface ArticleCommande {
  designation: string;
  quantite: number;
  prixUnitaire: Centimes;
}

export interface Escompte {
  /** Taux en dixièmes de pour cent (2 % = 20). */
  taux: number;
  jours: number;
}

/** Facture que l'élève établit à partir d'un bon de commande. */
export interface FactureAEtablir {
  numero: string;
  date: DateISO;
  client: { nom: string; adresse?: string[] };
  /** Texte du bon de commande ou de la note du patron (consignes). */
  consigne: string;
  articles: ArticleCommande[];
  /** Rabais en dixièmes de pour cent (10 % = 100) ; 0 ou absent : pas de rabais. */
  rabais?: number;
  /** TVA en dixièmes de pour cent (8,1 % = 81). */
  tauxTva: number;
  delaiNet: number;
  escompte?: Escompte;
}

/** Facture reçue que l'élève paie par un ordre de paiement. */
export interface FactureAPayer {
  id: string;
  piece: PieceComptable;
  dateFacture: DateISO;
  /** Total à payer de la facture, TVA comprise. */
  total: Centimes;
  delaiNet: number;
  escompte?: Escompte;
  beneficiaire: string;
  iban: string;
  reference: string;
  /** Date d'exécution demandée par la consigne. */
  datePaiement: DateISO;
}

export interface FactureOuverte {
  numero: string;
  client: string;
  date: DateISO;
  total: Centimes;
  delaiNet: number;
  escompte?: Escompte;
}

export interface CreditBancaire {
  id: string;
  date: DateISO;
  donneur: string;
  montant: Centimes;
  /** Facture réellement payée (corrigé). */
  facture: string;
}

/** Contrôle des paiements des clients : rapprochement d'un relevé bancaire et des factures ouvertes. */
export interface ControlePaiements {
  /** Jour du contrôle (fin du mois). */
  date: DateISO;
  factures: FactureOuverte[];
  credits: CreditBancaire[];
}

export interface DonneesFacturation {
  factures: FactureAEtablir[];
  paiements: FactureAPayer[];
  controle?: ControlePaiements;
}

// ---------- Saisies de l'élève (fiche enregistrée dans la session) ----------

export interface FicheFacturation {
  factures: Record<string, Record<string, string>>;
  paiements: Record<string, Record<string, string>>;
  controle: Record<string, string>;
}

export const ficheFacturationVide = (): FicheFacturation => ({ factures: {}, paiements: {}, controle: {} });

// ---------- Dates ----------

export function ajouterJours(d: DateISO, n: number): DateISO {
  let r = d;
  for (let i = 0; i < n; i++) r = jourSuivant(r);
  return r;
}

const pourCent = (montant: Centimes, dixiemes: number) => Math.round((montant * dixiemes) / 1000);

/** Escompte d'un montant TVA comprise, arrondi aux 5 centimes. */
export const montantEscompte = (ttc: Centimes, e: Escompte) => arrondi5(pourCent(ttc, e.taux));

// ---------- Facture à établir ----------

export interface CalculFacture {
  lignes: Centimes[];
  brut: Centimes;
  rabais: Centimes;
  ht: Centimes;
  tva: Centimes;
  ttc: Centimes;
  echeance: DateISO;
  /** Dernier jour pour payer avec l'escompte, et montant à payer avec l'escompte. */
  escompteJusquau: DateISO | null;
  aPayerAvecEscompte: Centimes | null;
}

export function calculFacture(f: FactureAEtablir): CalculFacture {
  const lignes = f.articles.map((a) => a.quantite * a.prixUnitaire);
  const brut = lignes.reduce((s, x) => s + x, 0);
  const rabais = f.rabais ? pourCent(brut, f.rabais) : 0;
  const ht = brut - rabais;
  const tva = tvaSurHT(ht, f.tauxTva);
  const ttc = ht + tva;
  return {
    lignes,
    brut,
    rabais,
    ht,
    tva,
    ttc,
    echeance: ajouterJours(f.date, f.delaiNet),
    escompteJusquau: f.escompte ? ajouterJours(f.date, f.escompte.jours) : null,
    aPayerAvecEscompte: f.escompte ? ttc - montantEscompte(ttc, f.escompte) : null,
  };
}

/** Mentions proposées à l'élève ; `obligatoire` d'après l'art. 26 al. 2 LTVA. */
export const MENTIONS_FACTURE: { id: string; libelle: string; obligatoire: boolean }[] = [
  { id: 'fournisseur', libelle: 'Nom, adresse et n° TVA du fournisseur', obligatoire: true },
  { id: 'client', libelle: 'Nom et adresse du client', obligatoire: true },
  { id: 'date', libelle: 'Date ou période de la livraison', obligatoire: true },
  { id: 'nature', libelle: 'Nature et quantité des marchandises ou des services', obligatoire: true },
  { id: 'montant', libelle: 'Montant de la contre-prestation (prix)', obligatoire: true },
  { id: 'tva', libelle: 'Taux et montant de la TVA', obligatoire: true },
  { id: 'telephone', libelle: 'Numéro de téléphone du client', obligatoire: false },
  { id: 'signature', libelle: 'Signature du fournisseur', obligatoire: false },
];

export interface ChampAttendu {
  cle: string;
  libelle: string;
  type: 'chf' | 'date' | 'texte' | 'compte' | 'choix';
  attendu: string | Centimes;
}

/** Champs d'une facture à établir, dans l'ordre de l'écran. */
export function champsFacture(f: FactureAEtablir): ChampAttendu[] {
  const c = calculFacture(f);
  const champs: ChampAttendu[] = f.articles.map((a, i) => ({ cle: `l${i}`, libelle: a.designation, type: 'chf', attendu: c.lignes[i]! }));
  if (f.rabais) {
    champs.push({ cle: 'brut', libelle: 'Total brut', type: 'chf', attendu: c.brut });
    champs.push({ cle: 'rabais', libelle: `Rabais ${(f.rabais / 10).toString().replace('.', ',')} %`, type: 'chf', attendu: c.rabais });
  }
  champs.push({ cle: 'ht', libelle: 'Total hors TVA', type: 'chf', attendu: c.ht });
  champs.push({ cle: 'tva', libelle: `TVA ${(f.tauxTva / 10).toString().replace('.', ',')} %`, type: 'chf', attendu: c.tva });
  champs.push({ cle: 'ttc', libelle: 'Total à payer', type: 'chf', attendu: c.ttc });
  champs.push({ cle: 'echeance', libelle: `Échéance (${f.delaiNet} jours net)`, type: 'date', attendu: c.echeance });
  if (f.escompte && c.escompteJusquau && c.aPayerAvecEscompte !== null) {
    champs.push({ cle: 'escompteJusquau', libelle: `Escompte ${f.escompte.taux / 10} % valable jusqu'au`, type: 'date', attendu: c.escompteJusquau });
    champs.push({ cle: 'avecEscompte', libelle: 'Montant à payer avec escompte', type: 'chf', attendu: c.aPayerAvecEscompte });
  }
  champs.push({
    cle: 'mentions',
    libelle: 'Mentions obligatoires',
    type: 'choix',
    attendu: MENTIONS_FACTURE.filter((m) => m.obligatoire).map((m) => m.id).join(','),
  });
  return champs;
}

// ---------- Ordre de paiement ----------

export interface CalculPaiement {
  escompteDeduit: boolean;
  montant: Centimes;
}

export function calculPaiement(p: FactureAPayer): CalculPaiement {
  const dansLeDelai = !!p.escompte && p.datePaiement <= ajouterJours(p.dateFacture, p.escompte.jours);
  return {
    escompteDeduit: dansLeDelai,
    montant: dansLeDelai ? p.total - montantEscompte(p.total, p.escompte!) : p.total,
  };
}

export function champsPaiement(p: FactureAPayer): ChampAttendu[] {
  const c = calculPaiement(p);
  return [
    { cle: 'beneficiaire', libelle: 'Bénéficiaire', type: 'texte', attendu: p.beneficiaire },
    { cle: 'iban', libelle: 'IBAN', type: 'compte', attendu: p.iban },
    { cle: 'reference', libelle: 'Référence', type: 'compte', attendu: p.reference },
    { cle: 'date', libelle: "Date d'exécution", type: 'date', attendu: p.datePaiement },
    { cle: 'escompte', libelle: 'Escompte déduit ?', type: 'choix', attendu: c.escompteDeduit ? 'oui' : 'non' },
    { cle: 'montant', libelle: 'Montant', type: 'chf', attendu: c.montant },
  ];
}

// ---------- Contrôle des paiements ----------

export type Situation = 'payee' | 'escompte-justifie' | 'escompte-hors-delai' | 'partiel' | 'echue' | 'pas-echue';

export const LIBELLES_SITUATION: Record<Situation, string> = {
  payee: 'Payée',
  'escompte-justifie': 'Payée, escompte justifié',
  'escompte-hors-delai': 'Escompte déduit hors délai (à réclamer)',
  partiel: 'Paiement partiel (solde à relancer)',
  echue: 'Non payée, échue (à relancer)',
  'pas-echue': 'Non payée, pas encore échue',
};

export interface SituationFacture {
  situation: Situation;
  reste: Centimes;
}

export function situationFacture(c: ControlePaiements, f: FactureOuverte): SituationFacture {
  const credits = c.credits.filter((x) => x.facture === f.numero);
  const paye = credits.reduce((s, x) => s + x.montant, 0);
  if (credits.length === 0) {
    return { situation: c.date > ajouterJours(f.date, f.delaiNet) ? 'echue' : 'pas-echue', reste: f.total };
  }
  if (paye >= f.total) return { situation: 'payee', reste: 0 };
  if (f.escompte) {
    const esc = montantEscompte(f.total, f.escompte);
    if (paye === f.total - esc) {
      const dernier = credits.map((x) => x.date).sort().at(-1)!;
      return dernier <= ajouterJours(f.date, f.escompte.jours)
        ? { situation: 'escompte-justifie', reste: 0 }
        : { situation: 'escompte-hors-delai', reste: esc };
    }
  }
  return { situation: 'partiel', reste: f.total - paye };
}

export function champsControle(c: ControlePaiements): ChampAttendu[] {
  return [
    ...c.credits.map((x): ChampAttendu => ({ cle: `c:${x.id}`, libelle: `Crédit du ${formatDate(x.date)}, ${x.donneur}`, type: 'choix', attendu: x.facture })),
    ...c.factures.flatMap((f): ChampAttendu[] => {
      const s = situationFacture(c, f);
      return [
        { cle: `s:${f.numero}`, libelle: `Situation de la facture ${f.numero}`, type: 'choix', attendu: s.situation },
        { cle: `r:${f.numero}`, libelle: `Reste à encaisser, facture ${f.numero}`, type: 'chf', attendu: s.reste },
      ];
    }),
  ];
}

// ---------- Contrôle des saisies ----------

const normaliser = (s: string) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr');
const sansEspaces = (s: string) => s.replace(/\s+/g, '').toUpperCase();

/** null : champ vide (pas encore rempli). */
export function controlerChamp(ch: ChampAttendu, saisie: string | undefined, annee?: number): boolean | null {
  const brut = (saisie ?? '').trim();
  if (brut === '') return null;
  switch (ch.type) {
    case 'chf':
      return lireMontant(brut) === ch.attendu;
    case 'date':
      return lireDate(brut, annee) === ch.attendu;
    case 'texte':
      return normaliser(brut) === normaliser(String(ch.attendu));
    case 'compte':
      return sansEspaces(brut) === sansEspaces(String(ch.attendu));
    case 'choix':
      return brut === ch.attendu;
  }
}

/** Valeur attendue lisible (retour en entraînement). */
export function attenduLisible(ch: ChampAttendu): string {
  if (ch.type === 'chf') return (ch.attendu as number / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  if (ch.type === 'date') return formatDate(ch.attendu as DateISO);
  if (ch.cle === 'mentions') return MENTIONS_FACTURE.filter((m) => m.obligatoire).map((m) => m.libelle).join(' ; ');
  if (ch.cle.startsWith('s:')) return LIBELLES_SITUATION[ch.attendu as Situation];
  if (ch.cle === 'escompte') return ch.attendu === 'oui' ? 'Oui' : 'Non';
  return String(ch.attendu);
}

// ---------- Points (évaluation) ----------

export const POINTS_FACTURE = 3;
export const POINTS_PAIEMENT = 2;
export const POINTS_CONTROLE = 3;

export const cleBaremeFacture = (numero: string) => `Facture ${numero}`;
export const cleBaremePaiement = (id: string) => `Paiement ${id}`;
export const CLE_BAREME_CONTROLE = 'Contrôle des paiements';

export interface ResultatDocument {
  cle: string;
  justes: number;
  total: number;
  points: number;
  max: number;
}

const auDemiPointInferieur = (x: number) => Math.floor(x * 2 + 1e-9) / 2;

function resultat(cle: string, champs: ChampAttendu[], saisies: Record<string, string> | undefined, max: number, annee: number): ResultatDocument {
  const justes = champs.filter((ch) => controlerChamp(ch, saisies?.[ch.cle], annee) === true).length;
  return { cle, justes, total: champs.length, points: auDemiPointInferieur((justes / champs.length) * max), max };
}

/** Points de chaque document de facturation : barème × champs justes / champs, au demi-point inférieur. */
export function noterFacturation(d: DonneesFacturation, fiche: FicheFacturation | undefined, bareme: Record<string, number> = {}): ResultatDocument[] {
  const annee = Number((d.factures[0]?.date ?? d.paiements[0]?.dateFacture ?? '2026').slice(0, 4));
  const r: ResultatDocument[] = [];
  for (const f of d.factures) {
    const cle = cleBaremeFacture(f.numero);
    r.push(resultat(cle, champsFacture(f), fiche?.factures[f.numero], bareme[cle] ?? POINTS_FACTURE, annee));
  }
  for (const p of d.paiements) {
    const cle = cleBaremePaiement(p.id);
    r.push(resultat(cle, champsPaiement(p), fiche?.paiements[p.id], bareme[cle] ?? POINTS_PAIEMENT, annee));
  }
  if (d.controle) {
    r.push(resultat(CLE_BAREME_CONTROLE, champsControle(d.controle), fiche?.controle, bareme[CLE_BAREME_CONTROLE] ?? POINTS_CONTROLE, annee));
  }
  return r.filter((x) => x.max > 0);
}
