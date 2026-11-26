// Exercices courts et générés pour le parcours « Apprendre » : classer un compte, reconnaître une variation du bilan,
// passer une écriture, retrouver l'opération d'une écriture, trouver l'écriture fausse, calculer un solde.
// Chaque série est tirée au hasard (graine reproductible) à partir de modèles d'opérations validés ; les montants
// changent à chaque série, l'élève peut donc s'entraîner jusqu'à la maîtrise.

import { formatMontant, type Centimes } from './money';
import type { Compte, TypeCompte } from './plan';
import { champJuste, genererCalcul, type QuestionCalcul, type QuestionQcm } from './calculs';
import { genererEcriture, type QuestionComposee } from './ecritures-generees';
import { etapeRaisonnement, sensVariation } from './raisonnement';

export { sensVariation };

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

export type FormatQuestion = 'classer' | 'variation' | 'ecriture' | 'operation' | 'erreur' | 'solde' | 'calcul' | 'composee';

export type Question =
  | QuestionComposee
  | QuestionCalcul
  | QuestionQcm
  | { format: 'classer'; compte: string; choix: TypeCompte[]; reponse: TypeCompte; pourquoi?: string[] }
  | { format: 'variation'; texte: string; choix: string[]; reponse: number; pourquoi?: string[] }
  | { format: 'ecriture'; texte: string; montant: Centimes; comptes: string[]; reponse: { debit: string; credit: string } }
  | { format: 'operation'; debit: string; credit: string; montant: Centimes; choix: string[]; reponse: number; pourquoi?: string[] }
  | { format: 'erreur'; lignes: { texte: string; debit: string; credit: string; montant: Centimes }[]; reponse: number; pourquoi?: string[] }
  | {
      format: 'solde';
      compte: string;
      initial: Centimes;
      debits: Centimes[];
      credits: Centimes[];
      reponse: { montant: Centimes; cote: 'debiteur' | 'crediteur' };
    };

const nomCompte = (plan: readonly Compte[], n: string) => plan.find((c) => c.numero === n)?.intitule ?? n;

/** Rôle de chaque type de compte, dans les termes du rappel des modules « Le bilan » et « Charges et produits ». */
const ROLE_TYPE: Record<TypeCompte, string> = {
  actif: "compte d'actif : il dit à quoi les fonds ont servi (liquidités, créances, stock, immobilisations).",
  passif: "compte de passif : il dit d'où viennent les fonds (capitaux étrangers, c'est-à-dire des dettes, et capitaux propres).",
  charge: 'compte de charge : il diminue le bénéfice.',
  produit: "compte de produit : il augmente le bénéfice.",
  bouclement: 'compte de bouclement.',
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
  /** Familles d'écritures générées (src/engine/ecritures-generees.ts) pour le format « composee ». */
  ecritures?: readonly string[];
}

/**
 * Réponses équilibrées (second audit, 26.11.2026) : on tire d'abord la réponse (le type de compte, la variation), puis
 * un compte ou une opération qui la donne. Répondre toujours « Actif » ou toujours la même variation ne paie plus.
 */
function questionClasser(h: Hasard, x: ContexteSerie): Question {
  const candidats = x.comptes.filter((n) => x.types.includes(typeDe(x.plan, n)));
  const types = x.types.filter((t) => candidats.some((n) => typeDe(x.plan, n) === t));
  const type = tirer(h, types);
  const compte = tirer(h, candidats.filter((n) => typeDe(x.plan, n) === type));
  const t = typeDe(x.plan, compte);
  return { format: 'classer', compte, choix: [...x.types], reponse: t, pourquoi: [`${nomCompte(x.plan, compte)} : ${ROLE_TYPE[t]}`] };
}

function questionVariation(h: Hasard, x: ContexteSerie): Question | null {
  const tous = x.modeles.filter((m) => variationBilan(x.plan, m.debit, m.credit) !== null);
  if (tous.length === 0) return null;
  const variations = [...new Set(tous.map((m) => variationBilan(x.plan, m.debit, m.credit)!))];
  const v = tirer(h, variations);
  const bilan = tous.filter((m) => variationBilan(x.plan, m.debit, m.credit) === v);
  const m = tirer(h, bilan);
  const r = variationBilan(x.plan, m.debit, m.credit)!;
  return {
    format: 'variation',
    texte: texteOperation(m, montantModele(h, m)),
    choix: [...VARIATIONS],
    reponse: r,
    pourquoi: [...raisonnement(x.plan, m.debit, m.credit), `Donc : ${VARIATIONS[r]}.`],
  };
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
    pourquoi: [`L'écriture débite ${nomCompte(x.plan, m.debit)} et crédite ${nomCompte(x.plan, m.credit)}.`, ...raisonnement(x.plan, m.debit, m.credit).slice(1)],
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
  let defaut = '';
  const lignes = choisis.map((m, i) => {
    const montant = montantModele(h, m);
    const e = i === fausse ? falsifier(h, x, m) : { debit: m.debit, credit: m.credit };
    if (i === fausse) defaut = e.debit === m.credit && e.credit === m.debit ? 'le débit et le crédit sont inversés' : "le moyen de paiement n'est pas le bon";
    return { texte: texteOperation(m, montant), debit: e.debit, credit: e.credit, montant };
  });
  const juste = choisis[fausse]!;
  return {
    format: 'erreur',
    lignes,
    reponse: fausse,
    pourquoi: [`Opération ${fausse + 1} : ${defaut}.`, `Écriture juste : débit ${nomCompte(x.plan, juste.debit)}, crédit ${nomCompte(x.plan, juste.credit)}.`],
  };
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

/** Rang du prochain générateur à utiliser, propre à chaque série (aucun état partagé entre deux séries). */
interface Tour { rang: number }

function questionCalcul(h: Hasard, x: ContexteSerie, t: Tour): Question | null {
  if (!x.calculs?.length) return null;
  const id = x.calculs[t.rang++ % x.calculs.length]!;
  return genererCalcul(id, h, { plan: x.plan, modeles: x.modeles });
}

function questionComposee(h: Hasard, x: ContexteSerie, t: Tour): Question | null {
  if (!x.ecritures?.length) return null;
  return genererEcriture(x.ecritures[t.rang++ % x.ecritures.length]!, h);
}

const FABRIQUES: Record<FormatQuestion, (h: Hasard, x: ContexteSerie, t: Tour) => Question | null> = {
  classer: questionClasser,
  variation: questionVariation,
  ecriture: questionEcriture,
  operation: questionOperation,
  erreur: questionErreur,
  solde: questionSolde,
  calcul: questionCalcul,
  composee: questionComposee,
};

/**
 * Série de `n` questions des formats demandés, répartis à tour de rôle puis mélangés.
 * Un format impossible avec ce module (pas assez de modèles) est remplacé par une écriture à passer.
 */
export function genererSerie(x: ContexteSerie, formats: readonly FormatQuestion[], n: number, graine: number): Question[] {
  const h = hasard(graine);
  const tour: Tour = { rang: Math.floor(h() * 100) };
  const r: Question[] = [];
  // Une même situation (énoncé sans ses montants) ne revient pas dans la série tant qu'on peut l'éviter : jusqu'à cinq
  // nouveaux tirages (second audit, 26.11.2026 : sinon, la série se réussit en retenant quelques énoncés par cœur).
  const vues = new Set<string>();
  const signature = (q: Question) => JSON.stringify(q).replace(/\d/g, '');
  for (let i = 0; i < n; i++) {
    const f = formats[i % formats.length]!;
    const fabriquer = () => FABRIQUES[f](h, x, tour) ?? (x.modeles.length ? questionEcriture(h, x) : (questionCalcul(h, x, tour) ?? questionComposee(h, x, tour))!);
    let q = fabriquer();
    // Classer un compte ou lire un solde : un compte peut revenir, ce n'est pas un énoncé à retenir par cœur.
    if (f !== 'classer' && f !== 'solde') for (let essai = 0; essai < 5 && vues.has(signature(q)); essai++) q = fabriquer();
    vues.add(signature(q));
    r.push(q);
  }
  return melanger(h, r);
}

// ---------- Correction ----------

export type Reponse =
  | { format: 'composee'; comptes: string[] }
  | { format: 'calcul'; valeurs: string[] }
  | { format: 'qcm'; choix: number }
  | { format: 'classer'; type: TypeCompte }
  | { format: 'variation' | 'operation' | 'erreur'; choix: number }
  | { format: 'ecriture'; debit: string; credit: string }
  | { format: 'solde'; montant: Centimes; cote: 'debiteur' | 'crediteur' };

export function estJuste(q: Question, r: Reponse): boolean {
  switch (q.format) {
    case 'composee':
      return r.format === 'composee' && q.lignes.every((l, i) => r.comptes[i] === l.compte);
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

/**
 * Part de la question réussie, de 0 à 1. Une question à plusieurs réponses (calcul en plusieurs étapes, écriture
 * composée) compte au prorata des réponses justes : une seule étape fausse ne fait pas perdre toute la question.
 */
export function credit(q: Question, r: Reponse): number {
  if (q.format === 'calcul' && r.format === 'calcul') return q.champs.filter((c, i) => champJuste(c, r.valeurs[i])).length / q.champs.length;
  if (q.format === 'composee' && r.format === 'composee') return q.lignes.filter((l, i) => r.comptes[i] === l.compte).length / q.lignes.length;
  return estJuste(q, r) ? 1 : 0;
}

/** Seuil de maîtrise d'une série : 8 réponses justes sur 10 (arrondi au supérieur pour une autre longueur). */
export const seuilMaitrise = (n: number) => Math.ceil(n * 0.8);

/** Nom d'un format de question, tel qu'il est montré à l'élève dans le bilan d'une série. */
export const NOM_FORMAT: Record<Question['format'], string> = {
  classer: 'Classer un compte',
  variation: 'Variation du bilan',
  ecriture: "Passer l'écriture",
  operation: "Retrouver l'opération",
  erreur: "Trouver l'écriture fausse",
  solde: "Solde d'un compte en T",
  calcul: 'Calculs',
  qcm: 'Questions à choix',
  composee: 'Écritures composées',
};

export interface BilanFormat {
  format: Question['format'];
  points: number;
  sur: number;
  /** Minimum à atteindre dans ce format : la moitié de ses points. */
  minimum: number;
  atteint: boolean;
}

export interface BilanSerie {
  points: number;
  sur: number;
  /** Formats de la série ; le minimum ne s'applique que si la série en mêle plusieurs. */
  parFormat: BilanFormat[];
  /** 8 points sur 10 et, dans une série à plusieurs formats, au moins la moitié des points de chaque format. */
  reussie: boolean;
}

/**
 * Bilan d'une série (audit du 24.11.2026, action 7) : la notion n'est réussie qu'avec le seuil de maîtrise et, quand
 * la série mêle plusieurs formats, au moins la moitié des points dans chacun. On ne réussit donc pas une notion en
 * passant les écritures sans savoir retrouver l'opération ou repérer une écriture fausse.
 */
export function bilanSerie(resultats: readonly { format: Question['format']; part: number }[]): BilanSerie {
  const points = resultats.reduce((t, r) => t + r.part, 0);
  const sur = resultats.length;
  const formats = [...new Set(resultats.map((r) => r.format))];
  const parFormat = formats.map((format) => {
    const ici = resultats.filter((r) => r.format === format);
    const p = ici.reduce((t, r) => t + r.part, 0);
    const minimum = ici.length / 2;
    return { format, points: p, sur: ici.length, minimum, atteint: formats.length < 2 || p >= minimum - 1e-9 };
  });
  return { points, sur, parFormat, reussie: sur > 0 && points >= seuilMaitrise(sur) - 1e-9 && parFormat.every((f) => f.atteint) };
}

// ---------- Révision espacée ----------

/** Formats où l'élève produit la réponse (au lieu de la reconnaître dans une liste). */
const PRODUCTION: readonly FormatQuestion[] = ['ecriture', 'solde', 'calcul', 'composee'];

/** Nombre de questions par notion dans la révision du jour. */
export const QUESTIONS_PAR_REVISION = 2;

/**
 * Questions de révision d'une notion (second audit, 26.11.2026) : deux questions, de formats tirés au hasard parmi ceux
 * du module, en privilégiant ceux où l'élève produit la réponse. La révision n'est réussie que si les deux sont
 * entièrement justes (`revisionReussie`) : une réponse devinée ne suffit plus à confirmer une notion.
 */
export function questionsRevision(x: ContexteSerie, formats: readonly FormatQuestion[], graine: number): Question[] {
  const h = hasard(graine);
  const production = formats.filter((f) => PRODUCTION.includes(f));
  const pool = [...new Set(production.length ? production : formats)];
  const choisis = melanger(h, pool).slice(0, QUESTIONS_PAR_REVISION);
  while (choisis.length < QUESTIONS_PAR_REVISION) choisis.push(tirer(h, pool));
  return genererSerie(x, choisis, QUESTIONS_PAR_REVISION, graine + 1);
}

/** Révision d'une notion réussie : chaque question entièrement juste. */
export const revisionReussie = (parts: readonly number[]) => parts.length > 0 && parts.every((p) => p >= 1 - 1e-9);

// ---------- Exemple travaillé ----------

/**
 * Raisonnement pas à pas d'une écriture simple, selon la méthode du chapitre « Les comptes » : quels comptes,
 * de quel type, augmente ou diminue, donc débit ou crédit.
 */
export function raisonnement(plan: readonly Compte[], debit: string, credit: string): string[] {
  const nom = (n: string) => plan.find((c) => c.numero === n)?.intitule ?? n;
  const ligne = (n: string, cote: 'debit' | 'credit') => etapeRaisonnement(nom(n), typeDe(plan, n), cote);
  return [`Comptes touchés : ${nom(debit)} et ${nom(credit)}.`, ligne(debit, 'debit'), ligne(credit, 'credit')];
}
