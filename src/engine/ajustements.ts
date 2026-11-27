// Ajustement manuel des points d'une opération (phase V3, maquette validée le 27.11.2026, écran V3.4) : l'enseignant
// accorde d'autres points que le calcul du logiciel et peut ajouter un commentaire. Le point calculé reste connu ; la
// note se recalcule avec la règle validée (`noteSuisse`).

import { noteSuisse, type CorrectionCopie, type ResultatOperation } from './notation';

export interface Ajustement {
  /** Points accordés par l'enseignant (au demi-point, entre 0 et le barème) ; absent = calcul du logiciel. */
  points?: number;
  /** Commentaire pour l'élève (facultatif). */
  commentaire?: string;
}

/** Ajustements d'une copie, par numéro de pièce (ou « Bouclement », ou clé d'un document noté). */
export type Ajustements = Record<string, Ajustement>;

export interface ResultatAjuste extends ResultatOperation {
  /** Points calculés par le logiciel, avant l'ajustement. */
  calcules: number;
  commentaire?: string;
  ajuste: boolean;
}

export interface CorrectionAjustee extends Omit<CorrectionCopie, 'operations'> {
  operations: ResultatAjuste[];
  /** Note sans les ajustements, pour mémoire. */
  noteCalculee: number;
}

/** Points saisis par l'enseignant ramenés au demi-point le plus proche, entre 0 et le barème de l'opération. */
export function pointsAccordes(saisie: number, max: number): number {
  if (!Number.isFinite(saisie)) return 0;
  return Math.min(max, Math.max(0, Math.round(saisie * 2) / 2));
}

export function appliquerAjustements(c: CorrectionCopie, aj: Ajustements = {}): CorrectionAjustee {
  const operations = c.operations.map((o): ResultatAjuste => {
    const a = aj[o.piece];
    const ajuste = a?.points !== undefined;
    const points = ajuste ? pointsAccordes(a!.points!, o.max) : o.points;
    return { ...o, points, calcules: o.points, ajuste: ajuste && points !== o.points, ...(a?.commentaire?.trim() ? { commentaire: a.commentaire.trim() } : {}) };
  });
  const points = operations.reduce((s, o) => s + o.points, 0);
  return { ...c, operations, points, note: noteSuisse(points, c.max), noteCalculee: c.note };
}
