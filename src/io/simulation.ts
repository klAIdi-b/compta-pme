// Parties du simulateur d'entreprise : enregistrement dans le navigateur et fichier d'échange (.compta-simulation.json).
// Seuls les réglages, les entreprises et les décisions sont enregistrés ; la partie est recalculée à la lecture
// (calcul déterministe). Aucun nom d'élève : seulement les noms d'entreprise choisis par les groupes.

import { ESPACE } from './espace';
import type { Decisions, Entreprise, Imprevu, Partie, ReglagesPartie } from '../engine/simulation/types';
import { rejouer } from '../engine/simulation/tour';
import type { DecisionsGroupe, SituationGroupe } from '../engine/simulation/situation';
import { ErreurFichier, migrer } from './fichiers';

export const EXT_SIMULATION = '.compta-simulation.json';
export const CLE_SIMULATEUR = `${ESPACE}:simulateur:v1`;
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
  /** Partie jouée en ligne : identifiant en ligne, code de partie et codes d'équipe (gardés seulement ici). */
  enLigne?: {
    id: string;
    code: string;
    codesEquipes: Record<string, string>;
    tourPublie: number;
    /** Empreinte de ce qui a été publié (tour, imprévus, décisions validées) : republier dès qu'elle change. */
    empreintePubliee?: string;
  };
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

// ---------- Échange par fichier avec les groupes (phase S5, secours sans connexion) ----------
// L'enseignant distribue une « situation » par groupe ; le groupe l'ouvre dans Compta PME, décide, et renvoie un
// fichier de décisions. Aucun nom d'élève : seulement le nom de l'entreprise et le numéro du tour.

export { EXT_SITUATION } from './simulation-extensions';
export const EXT_DECISIONS = '.compta-decisions.json';
const FORMAT_SITUATION = 'compta-pme/simulation-situation';
const FORMAT_DECISIONS = 'compta-pme/simulation-decisions';

function lireObjet(texte: string): Record<string, unknown> {
  try {
    const f = JSON.parse(texte) as unknown;
    if (f && typeof f === 'object') return f as Record<string, unknown>;
  } catch {
    /* plus bas */
  }
  throw new ErreurFichier("Ce fichier n'est pas lisible (JSON invalide).");
}

export function exporterSituation(s: SituationGroupe, maintenant = new Date()): string {
  return JSON.stringify({ format: FORMAT_SITUATION, version: VERSION_SIMULATION, exporteLe: maintenant.toISOString(), situation: s }, null, 2);
}

export function importerSituation(texte: string): SituationGroupe {
  let f = lireObjet(texte);
  if (f.format !== FORMAT_SITUATION) {
    throw new ErreurFichier(
      f.format === FORMAT_DECISIONS
        ? "Ce fichier contient des décisions : c'est l'enseignant qui l'importe, dans l'onglet Simulateur."
        : "Ce fichier n'est pas une situation du simulateur d'entreprise.",
    );
  }
  f = migrer(f, 'Cette situation', {}, VERSION_SIMULATION);
  const s = f.situation as SituationGroupe | undefined;
  if (!s || typeof s.partieId !== 'string' || !s.reglages || !s.entreprise || !s.etat || typeof s.numeroTour !== 'number') {
    throw new ErreurFichier('La situation est incomplète ou endommagée.');
  }
  return s;
}

export function exporterDecisions(d: DecisionsGroupe, maintenant = new Date()): string {
  return JSON.stringify({ format: FORMAT_DECISIONS, version: VERSION_SIMULATION, exporteLe: maintenant.toISOString(), ...d }, null, 2);
}

export function importerDecisions(texte: string): DecisionsGroupe {
  let f = lireObjet(texte);
  if (f.format !== FORMAT_DECISIONS) throw new ErreurFichier("Ce fichier n'est pas un fichier de décisions du simulateur.");
  f = migrer(f, 'Ce fichier de décisions', {}, VERSION_SIMULATION);
  const d = f as unknown as DecisionsGroupe;
  if (typeof d.partieId !== 'string' || typeof d.entrepriseId !== 'string' || typeof d.numeroTour !== 'number' || !d.decisions) {
    throw new ErreurFichier('Le fichier de décisions est incomplet ou endommagé.');
  }
  return { partieId: d.partieId, numeroTour: d.numeroTour, entrepriseId: d.entrepriseId, decisions: d.decisions };
}
