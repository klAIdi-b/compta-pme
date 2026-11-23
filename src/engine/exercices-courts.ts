// Exercices courts et générés pour le parcours « Apprendre » : classer un compte, reconnaître une variation du bilan,
// passer une écriture, retrouver l'opération d'une écriture, trouver l'écriture fausse, calculer un solde.
// Chaque série est tirée au hasard (graine reproductible) à partir de modèles d'opérations validés ; les montants
// changent à chaque série, l'élève peut donc s'entraîner jusqu'à la maîtrise.

import { formatMontant, type Centimes } from './money';
import type { Compte, TypeCompte } from './plan';
import { champJuste, genererCalcul, type QuestionCalcul, type QuestionQcm } from './calculs';

/** Modèle d'opération : texte avec le montant, écriture simple attendue (comptes du corrigé d'un exercice validé). */
export interface ModeleOperation {
  id: string;
  /** Texte de l'opération ; `{m}` est remplacé par le montant formaté. */
  texte: string;
  debit: string;
  credit: string;
  /** Montant en francs : minimum, maximum et pas (le montant tiré est un multiple du pas). */
  min: number;
  max: number;
  pas: number;
}

export type FormatQuestion = 'classer' | 'variation' | 'ecriture' | 'operation' | 'erreur' | 'solde' | 'calcul';

export type Question =
  | QuestionCalcul
  | QuestionQcm
  | { format: 'classer'; compte: string; choix: TypeCompte[]; reponse: TypeCompte }
  | { format: 'variation'; texte: string; choix: string[]; reponse: number }
  | { format: 'ecriture'; texte: string; montant: Centimes; comptes: string[]; reponse: { debit: string; credit: string } }
  | { format: 'operation'; debit: string; credit: string; montant: Centimes; choix: string[]; reponse: number }
  | { format: 'erreur'; lignes: { texte: string; debit: string; credit: string; montant: Centimes }[]; reponse: number }
  | {
      format: 'solde';
      compte: string;
      initial: Centimes;
      debits: Centimes[];
      credits: Centimes[];
      reponse: { montant: Centimes; cote: 'debiteur' | 'crediteur' };
    };

/** Les quatre variations du bilan, dans les termes du chapitre « Le bilan ». */
export const VARIATIONS = [
  'Actif + et passif + (le total du bilan augmente)',
  'Actif − et passif − (le total du bilan diminue)',
  "Actif + et actif − (permutation d'actifs)",
  'Passif + et passif − (permutation de passifs)',
] as const;

// ---------- Hasard reproductible ----------

export type Hasard = () => number;

/** Générateur pseudo-aléatoire (mulberry32) : une même graine donne la même série. */
export function hasard(graine: number): Hasard {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const entier = (h: Hasard, n: number) => Math.floor(h() * n);
const tirer = <T>(h: Hasard, t: readonly T[]): T => t[entier(h, t.length)]!;
function melanger<T>(h: Hasard, t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = entier(h, i + 1);
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

// ---------- Montants ----------

export function montantModele(h: Hasard, m: ModeleOperation): Centimes {
  const n = Math.floor((m.max - m.min) / m.pas) + 1;
  return (m.min + entier(h, n) * m.pas) * 100;
}

export const texteOperation = (m: ModeleOperation, montant: Centimes) => m.texte.replace('{m}', formatMontant(montant));

// ---------- Règles de fond ----------

function typeDe(plan: readonly Compte[], numero: string): TypeCompte {
  const c = plan.find((x) => x.numero === numero);
  if (!c) throw new Error(`Compte ${numero} absent du plan`);
  return c.type;
}

/** Variation du bilan d'une écriture simple entre deux comptes de bilan, ou null si un compte de gestion est touché. */
export function variationBilan(plan: readonly Compte[], debit: string, credit: string): number | null {
  const d = typeDe(plan, debit);
  const c = typeDe(plan, credit);
  if (d === 'actif' && c === 'passif') return 0;
  if (d === 'passif' && c === 'actif') return 1;
  if (d === 'actif' && c === 'actif') return 2;
  if (d === 'passif' && c === 'passif') return 3;
  return null;
}

/** Augmentation ou diminution d'un compte inscrit au débit ou au crédit (règle du chapitre « Les comptes »). */
export function sensVariation(type: TypeCompte, cote: 'debit' | 'credit'): 'augmente' | 'diminue' {
  const augmenteAuDebit = type === 'actif' || type === 'charge';
  return (cote === 'debit') === augmenteAuDebit ? 'augmente' : 'diminue';
}

// ---------- Génération ----------

export interface ContexteSerie {
  plan: readonly Compte[];
  modeles: readonly ModeleOperation[];
  /** Comptes proposés dans les listes (comptes des modèles et quelques voisins). */
  comptes: readonly string[];
  /** Types proposés pour « classer » (par exemple actif et passif seulement au début). */
  types: readonly TypeCompte[];
  /** Générateurs de calculs (src/engine/calculs.ts) utilisés par le format « calcul ». */
  calculs?: readonly string[];
}

function questionClasser(h: Hasard, x: ContexteSerie): Question {
  const candidats = x.comptes.filter((n) => x.types.includes(typeDe(x.plan, n)));
  const compte = tirer(h, candidats);
  return { format: 'classer', compte, choix: [...x.types], reponse: typeDe(x.plan, compte) };
}

function questionVariation(h: Hasard, x: ContexteSerie): Question | null {
  const bilan = x.modeles.filter((m) => variationBilan(x.plan, m.debit, m.credit) !== null);
  if (bilan.length === 0) return null;
  const m = tirer(h, bilan);
  return { format: 'variation', texte: texteOperation(m, montantModele(h, m)), choix: [...VARIATIONS], reponse: variationBilan(x.plan, m.debit, m.credit)! };
}

function questionEcriture(h: Hasard, x: ContexteSerie): Question {
  const m = tirer(h, x.modeles);
  const montant = montantModele(h, m);
  return { format: 'ecriture', texte: texteOperation(m, montant), montant, comptes: [...x.comptes], reponse: { debit: m.debit, credit: m.credit } };
}

function questionOperation(h: Hasard, x: ContexteSerie): Question | null {
  const m = tirer(h, x.modeles);
  const montant = montantModele(h, m);
  // Distracteurs : d'autres opérations du module dont l'écriture est différente.
  const autres = melanger(h, x.modeles.filter((o) => o.debit !== m.debit || o.credit !== m.credit));
  const distracteurs: ModeleOperation[] = [];
  for (const o of autres) if (!distracteurs.some((d) => d.debit === o.debit && d.credit === o.credit)) distracteurs.push(o);
  if (distracteurs.length < 2) return null;
  const options = melanger(h, [m, ...distracteurs.slice(0, 3)]);
  return {
    format: 'operation',
    debit: m.debit,
    credit: m.credit,
    montant,
    choix: options.map((o) => texteOperation(o, montant)),
    reponse: options.indexOf(m),
  };
}

/** Écriture fausse plausible : débit et crédit inversés, ou un moyen de paiement confondu. */
function falsifier(h: Hasard, x: ContexteSerie, m: ModeleOperation): { debit: string; credit: string } {
  const liquidites = ['1000', '1010', '1020'].filter((n) => x.plan.some((c) => c.numero === n));
  const remplacable = [m.debit, m.credit].some((n) => liquidites.includes(n));
  if (remplacable && h() < 0.4) {
    const swap = (n: string) => (liquidites.includes(n) ? tirer(h, liquidites.filter((l) => l !== n)) : n);
    return { debit: swap(m.debit), credit: swap(m.credit) };
  }
  return { debit: m.credit, credit: m.debit };
}

function questionErreur(h: Hasard, x: ContexteSerie): Question | null {
  const choisis: ModeleOperation[] = [];
  for (const m of melanger(h, x.modeles)) {
    if (!choisis.some((c) => c.debit === m.debit && c.credit === m.credit)) choisis.push(m);
    if (choisis.length === 4) break;
  }
  if (choisis.length < 3) return null;
  const fausse = entier(h, choisis.length);
  const lignes = choisis.map((m, i) => {
    const montant = montantModele(h, m);
    const e = i === fausse ? falsifier(h, x, m) : { debit: m.debit, credit: m.credit };
    return { texte: texteOperation(m, montant), debit: e.debit, credit: e.credit, montant };
  });
  return { format: 'erreur', lignes, reponse: fausse };
}

function questionSolde(h: Hasard, x: ContexteSerie): Question {
  const candidats = x.comptes.filter((n) => ['actif', 'passif'].includes(typeDe(x.plan, n)));
  const compte = tirer(h, candidats);
  const type = typeDe(x.plan, compte);
  const centaine = (a: number, b: number) => (a + entier(h, b - a + 1)) * 10000;
  const initial = centaine(20, 80);
  const plus = Array.from({ length: 2 + entier(h, 2) }, () => centaine(5, 40));
  const moins = Array.from({ length: 1 + entier(h, 2) }, () => centaine(5, 15));
  // Côté + : débit pour un actif, crédit pour un passif. Le solde reste du côté normal du compte.
  const debits = type === 'actif' ? plus : moins;
  const credits = type === 'actif' ? moins : plus;
  const somme = (t: Centimes[]) => t.reduce((a, b) => a + b, 0);
  const signe = type === 'actif' ? 1 : -1;
  const solde = signe * initial + somme(debits) - somme(credits);
  return {
    format: 'solde',
    compte,
    initial,
    debits,
    credits,
    reponse: { montant: Math.abs(solde), cote: solde >= 0 ? 'debiteur' : 'crediteur' },
  };
}

let rangCalcul = 0;
function questionCalcul(h: Hasard, x: ContexteSerie): Question | null {
  if (!x.calculs?.length) return null;
  const id = x.calculs[rangCalcul++ % x.calculs.length]!;
  return genererCalcul(id, h, { plan: x.plan });
}

const FABRIQUES: Record<FormatQuestion, (h: Hasard, x: ContexteSerie) => Question | null> = {
  classer: questionClasser,
  variation: questionVariation,
  ecriture: questionEcriture,
  operation: questionOperation,
  erreur: questionErreur,
  solde: questionSolde,
  calcul: questionCalcul,
};

/**
 * Série de `n` questions des formats demandés, répartis à tour de rôle puis mélangés.
 * Un format impossible avec ce module (pas assez de modèles) est remplacé par une écriture à passer.
 */
export function genererSerie(x: ContexteSerie, formats: readonly FormatQuestion[], n: number, graine: number): Question[] {
  const h = hasard(graine);
  rangCalcul = Math.floor(h() * 100);
  const r: Question[] = [];
  for (let i = 0; i < n; i++) {
    const f = formats[i % formats.length]!;
    r.push(FABRIQUES[f](h, x) ?? (x.modeles.length ? questionEcriture(h, x) : questionCalcul(h, x)!));
  }
  return melanger(h, r);
}

// ---------- Correction ----------

export type Reponse =
  | { format: 'calcul'; valeurs: string[] }
  | { format: 'qcm'; choix: number }
  | { format: 'classer'; type: TypeCompte }
  | { format: 'variation' | 'operation' | 'erreur'; choix: number }
  | { format: 'ecriture'; debit: string; credit: string }
  | { format: 'solde'; montant: Centimes; cote: 'debiteur' | 'crediteur' };

export function estJuste(q: Question, r: Reponse): boolean {
  switch (q.format) {
    case 'calcul':
      return r.format === 'calcul' && q.champs.every((c, i) => champJuste(c, r.valeurs[i]));
    case 'qcm':
      return r.format === 'qcm' && r.choix === q.reponse;
    case 'classer':
      return r.format === 'classer' && r.type === q.reponse;
    case 'variation':
    case 'operation':
    case 'erreur':
      return r.format === q.format && r.choix === q.reponse;
    case 'ecriture':
      return r.format === 'ecriture' && r.debit === q.reponse.debit && r.credit === q.reponse.credit;
    case 'solde':
      return r.format === 'solde' && r.montant === q.reponse.montant && (q.reponse.montant === 0 || r.cote === q.reponse.cote);
  }
}

/** Seuil de maîtrise d'une série : 8 réponses justes sur 10 (arrondi au supérieur pour une autre longueur). */
export const seuilMaitrise = (n: number) => Math.ceil(n * 0.8);

// ---------- Exemple travaillé ----------

const NOM_TYPE: Record<TypeCompte, string> = {
  actif: "compte d'actif",
  passif: 'compte de passif',
  charge: 'compte de charge',
  produit: 'compte de produit',
  bouclement: 'compte de bouclement',
};

/**
 * Raisonnement pas à pas d'une écriture simple, selon la méthode du chapitre « Les comptes » : quels comptes,
 * de quel type, augmente ou diminue, donc débit ou crédit.
 */
export function raisonnement(plan: readonly Compte[], debit: string, credit: string): string[] {
  const nom = (n: string) => plan.find((c) => c.numero === n)?.intitule ?? n;
  const ligne = (n: string, cote: 'debit' | 'credit') => {
    const t = typeDe(plan, n);
    const v = sensVariation(t, cote);
    const ici = cote === 'debit' ? 'au débit' : 'au crédit';
    return `${nom(n)} : ${NOM_TYPE[t]}, il ${v} ; ${v === 'augmente' ? (t === 'actif' || t === 'charge' ? 'un tel compte augmente au débit' : 'un tel compte augmente au crédit') : (t === 'actif' || t === 'charge' ? 'un tel compte diminue au crédit' : 'un tel compte diminue au débit')} → ${ici}.`;
  };
  return [`Comptes touchés : ${nom(debit)} et ${nom(credit)}.`, ligne(debit, 'debit'), ligne(credit, 'credit')];
}
