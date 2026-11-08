// Notation : barème par opération, points partiels pour les écritures multiples, note selon l'échelle suisse.
//
// Règles validées :
// - tout ou rien par opération, sauf pour les écritures multiples où des points partiels sont possibles ;
// - note = 1 + points obtenus / points max × 5, arrondie au demi-point le plus proche (x.25 → x.5), bornée 1–6.
//
// Points partiels (proposition à valider) : pour une opération dont le corrigé comporte au moins
// trois « lignes » (compte + côté), points = barème × (lignes justes − lignes en trop) / lignes attendues,
// arrondi vers le bas au demi-point, jamais négatif.

import type { Dossier, Ecriture, LigneEcriture } from './dossier';
import type { EcritureCorrigee, Exercice } from './exercice';
import { diagnostiquer, ecrituresRetenues, TOLERANCE, type Diagnostic } from './correction';
import {
  bouclementCorrige,
  corrigeBouclement,
  ecrituresPourNotation,
  PIECE_BOUCLEMENT,
  POINTS_BOUCLEMENT_PAR_DEFAUT,
} from './correction-bouclement';

export const POINTS_PAR_DEFAUT = 1;

function agreger(lignes: readonly LigneEcriture[]): Map<string, number> {
  const a = new Map<string, number>();
  for (const l of lignes) {
    if (l.debit) a.set(`${l.debit}|D`, (a.get(`${l.debit}|D`) ?? 0) + l.montant);
    if (l.credit) a.set(`${l.credit}|C`, (a.get(`${l.credit}|C`) ?? 0) + l.montant);
  }
  return a;
}

/** Une opération est « multiple » si son corrigé touche au moins trois comptes/côtés. */
export function estMultiple(c: EcritureCorrigee): boolean {
  return agreger(c.lignes).size >= 3;
}

const auDemiPointInferieur = (x: number) => Math.floor(x * 2 + 1e-9) / 2;

export interface ResultatOperation {
  piece: string;
  diagnostic: Diagnostic;
  points: number;
  max: number;
}

/** Points d'une opération. */
export function pointsOperation(
  eleve: readonly Ecriture[],
  corrige: EcritureCorrigee,
  max: number,
  pointsPartiels: boolean,
): ResultatOperation {
  const diagnostic = diagnostiquer(eleve, corrige);
  if (diagnostic === 'juste') return { piece: corrige.piece, diagnostic, points: max, max };
  if (!pointsPartiels || !estMultiple(corrige) || diagnostic === 'manquante') {
    return { piece: corrige.piece, diagnostic, points: 0, max };
  }
  const attendu = agreger(corrige.lignes);
  const saisi = agreger(ecrituresRetenues(eleve).filter((e) => e.piece === corrige.piece).flatMap((e) => e.lignes));
  let justes = 0;
  let enTrop = 0;
  for (const [k, v] of saisi) {
    const w = attendu.get(k);
    if (w !== undefined && Math.abs(v - w) <= TOLERANCE) justes++;
    else if (w === undefined) enTrop++;
  }
  const points = auDemiPointInferieur(Math.max(0, ((justes - enTrop) / attendu.size) * max));
  return { piece: corrige.piece, diagnostic, points, max };
}

/** Note suisse : 1 + points / max × 5, arrondie au demi-point le plus proche (x.25 → x.5), bornée 1–6. */
export function noteSuisse(points: number, max: number): number {
  if (max <= 0) return 1;
  const brute = 1 + (points / max) * 5;
  const arrondie = Math.floor(brute * 2 + 0.5 + 1e-9) / 2;
  return Math.min(6, Math.max(1, arrondie));
}

export interface CorrectionCopie {
  operations: ResultatOperation[];
  points: number;
  max: number;
  note: number;
}

export function corrigerCopie(ex: Exercice, d: Dossier): CorrectionCopie {
  const bareme = ex.bareme ?? {};
  const partiels = ex.pointsPartiels ?? true;
  const ecritures = ecrituresPourNotation(d, ex);
  const operations = (ex.corrige ?? [])
    .filter((c) => ex.operations.some((o) => o.numero === c.piece))
    .map((c) => pointsOperation(ecritures, c, bareme[c.piece] ?? POINTS_PAR_DEFAUT, partiels));
  if (bouclementCorrige(ex)) {
    const max = bareme[PIECE_BOUCLEMENT] ?? POINTS_BOUCLEMENT_PAR_DEFAUT;
    const c = corrigeBouclement(d, ex);
    if (c && max > 0) operations.push(pointsOperation(ecritures, c, max, partiels));
  }
  const points = operations.reduce((s, o) => s + o.points, 0);
  const max = operations.reduce((s, o) => s + o.max, 0);
  return { operations, points, max, note: noteSuisse(points, max) };
}

// ---------- Synthèse de plusieurs copies ----------

export interface StatOperation {
  piece: string;
  reussites: number;
  total: number;
  /** Erreurs triées de la plus fréquente à la moins fréquente (hors « juste »). */
  erreurs: { diagnostic: Diagnostic; nombre: number }[];
}

export function statistiquesOperations(corrections: readonly CorrectionCopie[]): StatOperation[] {
  const parPiece = new Map<string, StatOperation>();
  for (const c of corrections) {
    for (const o of c.operations) {
      const s = parPiece.get(o.piece) ?? { piece: o.piece, reussites: 0, total: 0, erreurs: [] };
      s.total++;
      if (o.diagnostic === 'juste') s.reussites++;
      else {
        const e = s.erreurs.find((x) => x.diagnostic === o.diagnostic);
        if (e) e.nombre++;
        else s.erreurs.push({ diagnostic: o.diagnostic, nombre: 1 });
      }
      parPiece.set(o.piece, s);
    }
  }
  for (const s of parPiece.values()) s.erreurs.sort((a, b) => b.nombre - a.nombre);
  return [...parPiece.values()];
}

/** Écritures de l'élève et corrigé d'une opération, côte à côte (détail d'une copie). */
export function comparaisonOperation(ex: Exercice, d: Dossier, piece: string): { eleve: LigneEcriture[]; corrige: LigneEcriture[] } {
  const eleve = ecrituresRetenues(ecrituresPourNotation(d, ex))
    .filter((e) => e.piece === piece)
    .flatMap((e) => e.lignes);
  const corrige =
    piece === PIECE_BOUCLEMENT ? (corrigeBouclement(d, ex)?.lignes ?? []) : ((ex.corrige ?? []).find((c) => c.piece === piece)?.lignes ?? []);
  return { eleve, corrige };
}

// ---------- Bilan de la classe (remédiation) ----------

export interface CopieNommee {
  /** Nom affiché de l'élève (« Nom Prénom »). */
  nom: string;
  dossier: Dossier;
}

export interface AnalyseOperation {
  piece: string;
  reussites: number;
  total: number;
  /** Erreurs de la plus fréquente à la moins fréquente, avec les élèves concernés (groupes de remédiation). */
  erreurs: { diagnostic: Diagnostic; eleves: string[] }[];
  /**
   * Écriture fausse saisie à l'identique par au moins deux élèves (la plus fréquente), en lignes regroupées par compte
   * et par côté : montre la confusion précise à reprendre en classe.
   */
  fauteCommune: { lignes: LigneEcriture[]; eleves: string[] } | null;
}

/** Lignes d'une opération regroupées par compte et par côté, dans un ordre stable (débit puis crédit). */
function lignesRegroupees(lignes: readonly LigneEcriture[]): LigneEcriture[] {
  return [...agreger(lignes)]
    .map(([cle, montant]) => {
      const [compte, sens] = cle.split('|') as [string, string];
      return sens === 'D' ? { debit: compte, credit: null, montant } : { debit: null, credit: compte, montant };
    })
    .sort((a, b) => (a.debit ? 0 : 1) - (b.debit ? 0 : 1) || (a.debit ?? a.credit!).localeCompare(b.debit ?? b.credit!));
}

/** Bilan de la classe, opération par opération, dans l'ordre de l'énoncé. */
export function analyseClasse(ex: Exercice, copies: readonly CopieNommee[]): AnalyseOperation[] {
  const parPiece = new Map<string, { a: AnalyseOperation; fautes: Map<string, { lignes: LigneEcriture[]; eleves: string[] }> }>();
  for (const copie of copies) {
    for (const o of corrigerCopie(ex, copie.dossier).operations) {
      let x = parPiece.get(o.piece);
      if (!x) {
        x = { a: { piece: o.piece, reussites: 0, total: 0, erreurs: [], fauteCommune: null }, fautes: new Map() };
        parPiece.set(o.piece, x);
      }
      x.a.total++;
      if (o.diagnostic === 'juste') {
        x.a.reussites++;
        continue;
      }
      const err = x.a.erreurs.find((e) => e.diagnostic === o.diagnostic);
      if (err) err.eleves.push(copie.nom);
      else x.a.erreurs.push({ diagnostic: o.diagnostic, eleves: [copie.nom] });
      if (o.diagnostic === 'manquante') continue;
      const lignes = lignesRegroupees(comparaisonOperation(ex, copie.dossier, o.piece).eleve);
      const cle = lignes.map((l) => `${l.debit ?? ''}|${l.credit ?? ''}|${l.montant}`).join(';');
      const f = x.fautes.get(cle);
      if (f) f.eleves.push(copie.nom);
      else x.fautes.set(cle, { lignes, eleves: [copie.nom] });
    }
  }
  return [...parPiece.values()].map(({ a, fautes }) => {
    a.erreurs.sort((p, q) => q.eleves.length - p.eleves.length);
    const plus = [...fautes.values()].sort((p, q) => q.eleves.length - p.eleves.length)[0];
    return { ...a, fauteCommune: plus && plus.eleves.length >= 2 ? plus : null };
  });
}
