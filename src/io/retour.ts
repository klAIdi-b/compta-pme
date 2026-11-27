// Fichier de retour à l'élève (phase V3, maquette validée le 27.11.2026, écran V3.5) : la copie corrigée revient à
// l'élève, qui l'ouvre dans « Mes dossiers ». Il voit la note, les points et le statut de chaque opération, et les
// commentaires de l'enseignant ; les écritures attendues seulement si l'enseignant a coché « avec les solutions ».
// Le fichier contient aussi la copie de l'élève et l'exercice sans son corrigé : l'élève peut le rouvrir sur un autre
// ordinateur. Il complète le PDF par élève, sans le remplacer (décision de l'enseignant du 27.11.2026).

import type { CorrectionAjustee } from '../engine/ajustements';
import type { Diagnostic } from '../engine/correction';
import type { LigneEcriture } from '../engine/dossier';
import type { Exercice } from '../engine/exercice';
import { ErreurFichier, importerCopie, exporterCopie, type Copie, type Eleve } from './fichiers';

export const EXT_RETOUR = '.compta-retour.json';
const FORMAT = 'compta-pme/retour';

export interface RetourOperation {
  piece: string;
  /** Texte de l'opération dans l'énoncé (vide pour un énoncé papier ou le bouclement). */
  texte: string;
  diagnostic: Diagnostic;
  points: number;
  max: number;
  ajuste: boolean;
  commentaire?: string;
  /** Écriture attendue, seulement « avec les solutions ». */
  solution?: LigneEcriture[];
}

export interface Retour {
  eleve: Eleve;
  exerciceId: string;
  exerciceTitre: string;
  corrigeLe: string;
  note: number;
  points: number;
  max: number;
  operations: RetourOperation[];
  /** Copie de l'élève (pour la rouvrir sur un autre ordinateur). */
  copie: Copie;
  /** Exercice sans son corrigé (pour rouvrir la copie). */
  exercice: Exercice;
}

export function creerRetour(copie: Copie, ex: Exercice, c: CorrectionAjustee, avecSolutions: boolean, maintenant = new Date()): Retour {
  const corrige = new Map((ex.corrige ?? []).map((x) => [x.piece, x.lignes]));
  const { corrige: _sans, ...exSansCorrige } = ex;
  return {
    eleve: copie.eleve,
    exerciceId: copie.exerciceId,
    exerciceTitre: copie.exerciceTitre,
    corrigeLe: maintenant.toISOString(),
    note: c.note,
    points: c.points,
    max: c.max,
    operations: c.operations.map((o) => ({
      piece: o.piece,
      texte: ex.operations.find((x) => x.numero === o.piece)?.texte ?? '',
      diagnostic: o.diagnostic,
      points: o.points,
      max: o.max,
      ajuste: o.ajuste,
      ...(o.commentaire ? { commentaire: o.commentaire } : {}),
      ...(avecSolutions && corrige.has(o.piece) ? { solution: corrige.get(o.piece)! } : {}),
    })),
    copie,
    exercice: exSansCorrige as Exercice,
  };
}

export function exporterRetour(r: Retour): string {
  return JSON.stringify({ format: FORMAT, version: 1, ...r, copie: JSON.parse(exporterCopie(r.copie, new Date(r.copie.exporteLe))) }, null, 2);
}

export function importerRetour(texte: string): Retour {
  const refus = () => new ErreurFichier("Ce fichier n'est pas une copie corrigée Compta PME.");
  let o: Partial<Retour> & { format?: string; copie?: unknown };
  try {
    o = JSON.parse(texte);
  } catch {
    throw refus();
  }
  if (o?.format !== FORMAT || !o.eleve || !Array.isArray(o.operations) || !o.exercice || !o.copie) throw refus();
  const copie = importerCopie(JSON.stringify(o.copie));
  return {
    eleve: o.eleve,
    exerciceId: String(o.exerciceId ?? copie.exerciceId),
    exerciceTitre: String(o.exerciceTitre ?? copie.exerciceTitre),
    corrigeLe: String(o.corrigeLe ?? ''),
    note: Number(o.note),
    points: Number(o.points),
    max: Number(o.max),
    operations: o.operations,
    copie,
    exercice: { ...(o.exercice as Exercice), corrige: undefined },
  };
}
