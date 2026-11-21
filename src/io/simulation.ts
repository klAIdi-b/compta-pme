// Parties du simulateur d'entreprise : enregistrement dans le navigateur et fichier d'échange (.compta-simulation.json).
// Seuls les réglages, les entreprises et les décisions sont enregistrés ; la partie est recalculée à la lecture
// (calcul déterministe). Aucun nom d'élève : seulement les noms d'entreprise choisis par les groupes.

import type { Decisions, Entreprise, Imprevu, Partie, ReglagesPartie } from '../engine/simulation/types';
import { rejouer } from '../engine/simulation/tour';
import { ErreurFichier, migrer } from './fichiers';

export const EXT_SIMULATION = '.compta-simulation.json';
export const CLE_SIMULATEUR = 'compta-pme:simulateur:v1';
const FORMAT = 'compta-pme/simulation';
const VERSION_SIMULATION = 1;

export interface PartieEnregistree {
  id: string;
  /** Nom donné par l'enseignant (classe, période), jamais un nom d'élève. */
  nom: string;
  creeLe: string;
  reglages: ReglagesPartie;
  entreprises: Entreprise[];
  /** Décisions de chaque tour joué. */
  decisionsParTour: Record<string, Decisions>[];
  /** Décisions validées pour le tour en cours, pas encore calculé. */
  brouillon: Record<string, Decisions>;
  /** Imprévus de chaque tour joué (phase S6). */
  imprevusParTour?: Imprevu[][];
  /** Imprévus prévus pour le tour en cours. */
  imprevus?: Imprevu[];
}

/** Recalcule la partie ; erreur si les données sont incohérentes (fichier modifié à la main, par exemple). */
export function partieDe(e: PartieEnregistree): Partie {
  const r = rejouer(e.reglages, e.entreprises, e.decisionsParTour, e.imprevusParTour ?? []);
  if (!r.ok) throw new ErreurFichier(`La partie « ${e.nom} » ne peut pas être recalculée : ${r.erreurs.join(' ')}`);
  return r.valeur;
}

export function exporterPartie(e: PartieEnregistree, maintenant = new Date()): string {
  return JSON.stringify({ format: FORMAT, version: VERSION_SIMULATION, exporteLe: maintenant.toISOString(), partie: e }, null, 2);
}

export function importerPartie(texte: string): PartieEnregistree {
  let f: Record<string, unknown>;
  try {
    f = JSON.parse(texte) as Record<string, unknown>;
  } catch {
    throw new ErreurFichier("Ce fichier n'est pas lisible (JSON invalide).");
  }
  if (!f || typeof f !== 'object' || f.format !== FORMAT) {
    throw new ErreurFichier("Ce fichier n'est pas une partie du simulateur d'entreprise.");
  }
  f = migrer(f, 'Cette partie', {}, VERSION_SIMULATION);
  const e = f.partie as PartieEnregistree | undefined;
  if (
    !e ||
    typeof e.id !== 'string' ||
    typeof e.nom !== 'string' ||
    !e.reglages ||
    !Array.isArray(e.entreprises) ||
    !Array.isArray(e.decisionsParTour)
  ) {
    throw new ErreurFichier('La partie est incomplète ou endommagée.');
  }
  const propre: PartieEnregistree = { ...e, brouillon: e.brouillon && typeof e.brouillon === 'object' ? e.brouillon : {} };
  partieDe(propre);
  return propre;
}
