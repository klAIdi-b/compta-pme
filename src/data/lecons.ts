// Leçons du parcours « Apprendre » : une leçon par module (idée en langage courant, vocabulaire, méthode, exemples
// chiffrés, piège fréquent, à retenir, questions pour se contrôler). Les règles reprennent la théorie validée.

import { LECONS_CFC1 } from './lecons-cfc1';
import { LECONS_CFC } from './lecons-cfc';
import { LECONS_MP } from './lecons-mp';

export interface ExempleLecon {
  situation: string;
  /** Tableau (bilan, compte en T, écritures) : en-têtes puis lignes. */
  tableau?: { entetes: string[]; lignes: string[][] };
  lignes?: string[];
  /** Ce qu'il faut voir dans l'exemple, en une ou deux phrases. */
  conclusion?: string;
}

export interface PartieLecon {
  titre: string;
  /** Explication en langage courant, un paragraphe par élément. */
  texte: string[];
  /** Vocabulaire introduit dans la partie. */
  definitions?: { terme: string; definition: string }[];
  /** Démarche à suivre, étape par étape. */
  methode?: string[];
  exemple?: ExempleLecon;
  /** Exemples supplémentaires, affichés après « exemple ». */
  exemples?: ExempleLecon[];
  /** Erreur ou confusion fréquente. */
  piege?: string;
  retenir?: string;
  /** Questions pour se contrôler, réponse masquée. */
  questions?: { question: string; reponse: string }[];
}

/** Tous les exemples d'une partie, dans l'ordre d'affichage. */
export const exemplesDe = (p: PartieLecon): ExempleLecon[] => [...(p.exemple ? [p.exemple] : []), ...(p.exemples ?? [])];

/** Leçon de chaque module du parcours Apprendre, par identifiant de module. */
export const LECONS: Record<string, PartieLecon[]> = { ...LECONS_CFC1, ...LECONS_CFC, ...LECONS_MP };
