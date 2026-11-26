// Correction automatique : comparaison des écritures de l'élève au corrigé, opération par opération.
//
// Règles validées par l'enseignant :
// - le numéro de pièce identifie l'opération ; l'ordre de saisie et la date ne comptent pas ;
// - on compare, par opération, les totaux au débit et au crédit de chaque compte,
//   avec une tolérance de 0.05 CHF : une écriture composée équivaut à sa décomposition ;
// - une écriture et son extourne s'annulent et ne sont pas prises en compte.

import type { Centimes } from './money';
import type { Ecriture } from './dossier';
import type { EcritureCorrigee } from './exercice';

export const TOLERANCE: Centimes = 5;

/** Comptes de TVA : impôt préalable (1170, 1171) et TVA due (2200). */
const COMPTES_TVA = new Set(['1170', '1171', '2200']);

export type Diagnostic =
  | 'juste'
  | 'manquante'
  | 'incomplete'
  | 'nette'
  | 'inversee'
  | 'inversee_compte'
  | 'tva_oubliee'
  | 'montant'
  | 'compte_classe'
  | 'compte'
  | 'erronee';

/** Indices du 1er niveau : nomment le type d'erreur sans donner la réponse. */
export const INDICES: Record<Diagnostic, string> = {
  juste: '',
  manquante: "Cette opération n'a pas encore été saisie.",
  incomplete:
    "L'opération n'est pas encore complète : il manque une partie de l'écriture, ou un montant est trop faible " +
    "(par exemple un montant net au lieu du montant brut). Si vous pensez avoir terminé, revoyez les montants et les comptes manquants.",
  nette:
    "Les soldes sont justes, mais l'écriture regroupe sur un même compte un mouvement au débit et un autre au crédit. " +
    "Présentez séparément chaque mouvement (par exemple l'entrée du nouveau bien et la sortie de l'ancien).",
  inversee: 'Le débit et le crédit sont inversés.',
  inversee_compte: "Le débit et le crédit sont inversés, et au moins un compte n'est pas le bon : vérifiez d'abord les côtés.",
  tva_oubliee: "La TVA n'a pas été comptabilisée.",
  montant: 'Les comptes sont justes, mais un montant ne correspond pas à l\'opération.',
  compte_classe: "Bonne classe de comptes, mais un compte n'est pas le bon.",
  compte: "Au moins un compte n'est pas le bon : demandez-vous quels comptes l'opération modifie.",
  erronee:
    "L'écriture ne correspond pas à l'opération : demandez-vous quels comptes elle modifie, de quel côté, et s'il manque " +
    "un compte (une retenue, la TVA, un deuxième moyen de paiement…).",
};

/** Libellés courts pour la synthèse de l'enseignant. */
export const LIBELLES_DIAGNOSTIC: Record<Diagnostic, string> = {
  juste: 'Juste',
  manquante: 'Non saisie',
  incomplete: 'Incomplète',
  nette: 'Mouvements regroupés',
  inversee: 'Débit et crédit inversés',
  inversee_compte: 'Inversée, mauvais compte',
  tva_oubliee: 'TVA oubliée',
  montant: 'Montant erroné',
  compte_classe: 'Bonne classe, mauvais compte',
  compte: 'Mauvais compte',
  erronee: 'Écriture erronée',
};

type Agregat = Map<string, Centimes>; // clé « compte|D » ou « compte|C »

function agreger(lignes: { debit: string | null; credit: string | null; montant: Centimes }[]): Agregat {
  const a: Agregat = new Map();
  const ajouter = (cle: string, m: Centimes) => a.set(cle, (a.get(cle) ?? 0) + m);
  for (const l of lignes) {
    if (l.debit) ajouter(`${l.debit}|D`, l.montant);
    if (l.credit) ajouter(`${l.credit}|C`, l.montant);
  }
  return a;
}

/** Écritures de l'élève à prendre en compte : sans les écritures extournées ni leurs extournes. */
export function ecrituresRetenues(ecritures: readonly Ecriture[]): Ecriture[] {
  const extournees = new Set(ecritures.filter((e) => e.extourneDe).map((e) => e.extourneDe!));
  return ecritures.filter((e) => !e.extourneDe && !extournees.has(e.id));
}

function egaux(a: Agregat, b: Agregat): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    const w = b.get(k);
    if (w === undefined || Math.abs(v - w) > TOLERANCE) return false;
  }
  return true;
}

function inverser(a: Agregat): Agregat {
  const r: Agregat = new Map();
  for (const [k, v] of a) {
    const [c, s] = k.split('|');
    r.set(`${c}|${s === 'D' ? 'C' : 'D'}`, v);
  }
  return r;
}

const compteDe = (cle: string) => cle.split('|')[0]!;
const sensDe = (cle: string) => cle.split('|')[1]!;

/** Diagnostic d'une opération : écritures de l'élève (même pièce) comparées au corrigé. */
export function diagnostiquer(eleve: readonly Ecriture[], corrige: EcritureCorrigee): Diagnostic {
  const e = agreger(ecrituresRetenues(eleve).filter((x) => x.piece === corrige.piece).flatMap((x) => x.lignes));
  const c = agreger(corrige.lignes);
  if (e.size === 0) return 'manquante';
  if (egaux(e, c)) return 'juste';
  if (egaux(inverser(e), c)) return 'inversee';

  const tvaAttendue = [...c.keys()].some((k) => COMPTES_TVA.has(compteDe(k)));
  const tvaSaisie = [...e.keys()].some((k) => COMPTES_TVA.has(compteDe(k)));
  if (tvaAttendue && !tvaSaisie) return 'tva_oubliee';

  // Mêmes comptes, mêmes côtés : seul un montant diffère.
  if (e.size === c.size && [...e.keys()].every((k) => c.has(k))) return 'montant';

  // Mêmes soldes que le corrigé, mais un débit et un crédit d'un même compte regroupés (écriture nette).
  if (egauxNets(e, c)) return 'nette';

  // Partie juste d'une opération décomposée en plusieurs écritures.
  if ([...e].every(([k, v]) => c.has(k) && v <= c.get(k)! + TOLERANCE)) return 'incomplete';

  // Côtés inversés et un compte faux : on le dit, les côtés d'abord, quand l'inversion retrouve plus de comptes justes.
  const communs = (a: Agregat) => [...a.keys()].filter((k) => c.has(k)).length;
  const r = apparier(e, c);
  const ri = apparier(inverser(e), c);
  if (ri && (!r || communs(inverser(e)) > communs(e))) return 'inversee_compte';
  if (r) return r;
  return 'erronee';
}

/** Solde net par compte (débit positif). */
function nets(a: Agregat): Map<string, Centimes> {
  const r = new Map<string, Centimes>();
  for (const [k, v] of a) r.set(compteDe(k), (r.get(compteDe(k)) ?? 0) + (sensDe(k) === 'D' ? v : -v));
  return r;
}

/** Mêmes soldes nets, alors que le corrigé mouvemente un compte des deux côtés. */
function egauxNets(e: Agregat, c: Agregat): boolean {
  const deuxCotes = [...c.keys()].some((k) => sensDe(k) === 'D' && c.has(`${compteDe(k)}|C`));
  if (!deuxCotes) return false;
  const ne = nets(e);
  const nc = nets(c);
  const comptes = new Set([...ne.keys(), ...nc.keys()]);
  return [...comptes].every((k) => Math.abs((ne.get(k) ?? 0) - (nc.get(k) ?? 0)) <= TOLERANCE);
}

/** Même structure, mais des comptes différents : on apparie par côté et par montant. */
function apparier(e: Agregat, c: Agregat): 'compte' | 'compte_classe' | null {
  const enTrop = [...e].filter(([k]) => !c.has(k));
  const manquants = [...c].filter(([k]) => !e.has(k));
  const communsJustes = [...e].filter(([k]) => c.has(k)).every(([k, v]) => Math.abs(v - c.get(k)!) <= TOLERANCE);
  if (!communsJustes || enTrop.length !== manquants.length || enTrop.length === 0) return null;
  const libres = [...manquants];
  let memeClasse = true;
  for (const [k, v] of enTrop) {
    const i = libres.findIndex(([k2, v2]) => sensDe(k2) === sensDe(k) && Math.abs(v2 - v) <= TOLERANCE);
    if (i < 0) return null;
    if (compteDe(libres[i]![0])[0] !== compteDe(k)[0]) memeClasse = false;
    libres.splice(i, 1);
  }
  return memeClasse ? 'compte_classe' : 'compte';
}

/**
 * Indice du 2e niveau, montré après une nouvelle tentative fausse : la forme de l'écriture attendue (nombre de comptes
 * au débit et au crédit), sans nommer les comptes ni les montants.
 */
export function indiceNiveau2(corrige: EcritureCorrigee): string {
  const c = agreger(corrige.lignes);
  const d = [...c.keys()].filter((k) => sensDe(k) === 'D').length;
  const cr = [...c.keys()].filter((k) => sensDe(k) === 'C').length;
  const n = (x: number) => `${x} compte${x > 1 ? 's' : ''}`;
  return `L'écriture attendue touche ${n(d)} au débit et ${n(cr)} au crédit.`;
}

// ---------- Suivi des tentatives (entraînement) ----------

export interface SuiviOperation {
  /** Nombre de tentatives jugées fausses. */
  essais: number;
  dernier: Diagnostic;
  solutionVue: boolean;
  /** Nombre de fois où la solution, masquée pendant la correction, a été rouverte. */
  revues?: number;
  /** Bouclement : niveau d'aide consulté par étape (1 la règle, 2 les comptes), information pour l'enseignant. */
  aides?: Record<string, number>;
}

export type Suivi = Record<string, SuiviOperation>;

/**
 * Enregistre une tentative après la validation d'une écriture de la pièce donnée.
 * Une opération incomplète (décomposition en cours) ne compte pas comme une erreur.
 */
export function enregistrerTentative(suivi: Suivi, piece: string, d: Diagnostic): Suivi {
  const ancien = suivi[piece] ?? { essais: 0, dernier: 'manquante' as Diagnostic, solutionVue: false };
  const faux = d !== 'juste' && d !== 'incomplete' && d !== 'manquante';
  return { ...suivi, [piece]: { ...ancien, essais: ancien.essais + (faux ? 1 : 0), dernier: d } };
}

/**
 * « Voir la solution » apparaît dès la première tentative fausse (choix de l'enseignant le 18.11.2026), et aussi quand
 * l'opération est jugée incomplète : l'élève qui croit avoir fini n'est jamais privé de la solution.
 */
export function solutionDisponible(s: SuiviOperation | undefined): boolean {
  return !!s && s.dernier !== 'juste' && (s.essais >= 1 || s.dernier === 'incomplete');
}

// ---------- Avancement de l'élève ----------

export type StatutOperation = 'juste' | 'revoir' | 'incomplete' | 'saisie' | 'manquante';

export interface Avancement {
  total: number;
  saisies: number;
  justes: number;
  /** Parmi les justes : écritures passées après « Voir la solution » (audit du 24.11.2026). */
  avecSolution: number;
  aRevoir: number;
  incompletes: number;
  nonSaisies: number;
  /** Statut de chaque opération de l'énoncé, dans l'ordre. « saisie » : écrite, sans correction (évaluation). */
  parOperation: { numero: string; statut: StatutOperation; avecSolution?: boolean }[];
}

/**
 * Avancement de l'élève sur les opérations de l'énoncé. Avec correction (entraînement, corrigé disponible), chaque
 * opération saisie est juste, à revoir ou incomplète ; sans correction (évaluation), elle est seulement « saisie ».
 */
export function avancement(
  operations: readonly { numero: string }[],
  ecritures: readonly Ecriture[],
  corrige: readonly EcritureCorrigee[] | null,
  suivi: Suivi = {},
): Avancement {
  const retenues = ecrituresRetenues(ecritures);
  const pieces = new Set(retenues.map((e) => e.piece));
  const parPiece = new Map((corrige ?? []).map((c) => [c.piece, c]));
  const parOperation = operations.map((o) => {
    if (!pieces.has(o.numero)) return { numero: o.numero, statut: 'manquante' as StatutOperation };
    const c = corrige ? parPiece.get(o.numero) : undefined;
    if (!c) return { numero: o.numero, statut: 'saisie' as StatutOperation };
    const d = diagnostiquer(retenues, c);
    const statut: StatutOperation = d === 'juste' ? 'juste' : d === 'incomplete' ? 'incomplete' : d === 'manquante' ? 'manquante' : 'revoir';
    // Juste, mais trouvée après « Voir la solution » : on le dit, sans la compter comme une erreur.
    if (statut === 'juste' && suivi[o.numero]?.solutionVue) return { numero: o.numero, statut, avecSolution: true };
    return { numero: o.numero, statut };
  });
  const compte = (s: StatutOperation) => parOperation.filter((x) => x.statut === s).length;
  const nonSaisies = compte('manquante');
  return {
    total: operations.length,
    saisies: operations.length - nonSaisies,
    justes: compte('juste'),
    avecSolution: parOperation.filter((x) => x.avecSolution).length,
    aRevoir: compte('revoir'),
    incompletes: compte('incomplete'),
    nonSaisies,
    parOperation,
  };
}
