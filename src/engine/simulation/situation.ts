// Phase S5 (préparation de la mise en ligne) : ce qu'un groupe reçoit pour décider, et ce qu'il renvoie.
// La « situation » d'un groupe contient seulement ses propres chiffres (jamais ceux des autres entreprises) : elle
// circule par fichier aujourd'hui, et en ligne plus tard. Le groupe contrôle ses décisions avec le même moteur que
// l'enseignant ; l'enseignant les contrôle à nouveau au calcul du tour.

import type { Centimes } from '../money';
import type { Decisions, Entreprise, EtatEntreprise, Imprevu, ImprevusEntreprise, Partie, ReglagesPartie } from './types';
import { controlerDecisions, etatsCourants, imprevusEntreprise, partieTerminee } from './tour';
import { tableauResultats } from './classement';

export interface SituationGroupe {
  partieId: string;
  partieNom: string;
  reglages: ReglagesPartie;
  entreprise: Entreprise;
  numeroTour: number;
  etat: EtatEntreprise;
  /** Imprévus du tour qui concernent ce groupe, et leur effet. */
  imprevus: Imprevu[];
  effetImprevus: ImprevusEntreprise;
  /** Résultats du groupe au tour précédent (null au premier tour). */
  precedent: {
    numero: number;
    prixMoyen: Centimes;
    vendues: number;
    demande: number;
    clientsPerdus: number;
    partMarchePourMille: number;
    resultat: Centimes;
    decisions: Decisions;
  } | null;
  /** Décisions déjà validées pour ce tour, s'il y en a. */
  decisionsValidees: Decisions | null;
}

/** Situation d'un groupe pour le tour en cours ; null si la partie est terminée. */
export function situationGroupe(
  p: Partie,
  meta: { partieId: string; partieNom: string },
  imprevus: readonly Imprevu[],
  entrepriseId: string,
  brouillon: Record<string, Decisions> = {},
): SituationGroupe | null {
  if (partieTerminee(p)) return null;
  const entreprise = p.entreprises.find((x) => x.id === entrepriseId);
  const etat = etatsCourants(p).get(entrepriseId);
  if (!entreprise || !etat) return null;
  const dernier = p.tours.at(-1);
  const res = dernier?.resultats.find((x) => x.entrepriseId === entrepriseId);
  return {
    ...meta,
    reglages: p.reglages,
    entreprise,
    numeroTour: p.tours.length + 1,
    etat,
    imprevus: imprevus.filter((i) => i.entrepriseId === null || i.entrepriseId === entrepriseId),
    effetImprevus: imprevusEntreprise(p, imprevus, entrepriseId),
    precedent:
      dernier && res
        ? {
            numero: dernier.numero,
            prixMoyen: dernier.prixMoyen,
            vendues: res.vendues,
            demande: res.demande,
            clientsPerdus: res.clientsPerdus,
            partMarchePourMille: res.partMarchePourMille,
            resultat: res.resultat,
            decisions: res.decisions,
          }
        : null,
    decisionsValidees: brouillon[entrepriseId] ?? null,
  };
}

export function controlerDecisionsSituation(s: SituationGroupe, d: Decisions): string[] {
  return controlerDecisions(s.reglages, s.etat, d, s.numeroTour, s.effetImprevus);
}

/** Décisions renvoyées par un groupe. */
export interface DecisionsGroupe {
  partieId: string;
  numeroTour: number;
  entrepriseId: string;
  decisions: Decisions;
}

/**
 * Contrôle des décisions reçues d'un groupe avant de les enregistrer pour le tour en cours : bonne partie, bon tour,
 * entreprise connue, décisions acceptables avec les imprévus du tour.
 */
export function controlerDecisionsRecues(
  p: Partie,
  meta: { partieId: string },
  imprevus: readonly Imprevu[],
  recu: DecisionsGroupe,
): string[] {
  if (recu.partieId !== meta.partieId) return ["Ces décisions viennent d'une autre partie."];
  const x = p.entreprises.find((e) => e.id === recu.entrepriseId);
  if (!x) return ['Ces décisions viennent d’une entreprise inconnue.'];
  if (partieTerminee(p)) return ['La partie est terminée.'];
  const n = p.tours.length + 1;
  if (recu.numeroTour !== n) return [`${x.nom} : ces décisions sont celles du tour ${recu.numeroTour}, or le tour en cours est le tour ${n}.`];
  const etat = etatsCourants(p).get(x.id)!;
  return controlerDecisions(p.reglages, etat, recu.decisions, n, imprevusEntreprise(p, imprevus, x.id)).map((m) => `${x.nom} : ${m}`);
}

// ---------- Codes de partie et d'équipe (mise en ligne) ----------

/** Lettres et chiffres sans confusion possible (ni 0/O, ni 1/I/L). */
export const ALPHABET_CODES = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Code aléatoire ; `hasard` renvoie un nombre dans [0, 1) (Math.random, ou un générateur fixe dans les tests). */
export function genererCode(longueur: number, hasard: () => number = Math.random): string {
  let c = '';
  for (let i = 0; i < longueur; i++) c += ALPHABET_CODES[Math.floor(hasard() * ALPHABET_CODES.length)]!;
  return c;
}

/** Code de partie (6 caractères) et un code secret par équipe (8 caractères), tous différents. */
export function genererCodes(entreprises: readonly Entreprise[], hasard: () => number = Math.random): { partie: string; equipes: Record<string, string> } {
  const vus = new Set<string>();
  const neuf = (n: number) => {
    let c = genererCode(n, hasard);
    while (vus.has(c)) c = genererCode(n, hasard);
    vus.add(c);
    return c;
  };
  const partie = neuf(6);
  return { partie, equipes: Object.fromEntries(entreprises.map((x) => [x.id, neuf(8)])) };
}

export function normaliserCode(saisie: string): string {
  return saisie.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// ---------- Résultats publiés pour les groupes ----------

export interface ResultatsPublics {
  numeroTour: number;
  demandeTotale: number;
  prixMoyen: Centimes;
  /** Lignes du tableau : avec rang et score seulement si la partie affiche le classement ; vide si « chaque groupe ses chiffres ». */
  lignes: { nom: string; resultatCumule: Centimes; tresorerie: Centimes; partMarchePourMille: number; rang?: number; score?: number }[];
}

/** Ce qu'un groupe peut voir des résultats du dernier tour, selon l'option d'affichage de la partie. */
export function resultatsPublics(p: Partie): ResultatsPublics | null {
  const t = p.tours.at(-1);
  if (!t) return null;
  const affichage = p.reglages.affichage;
  const tableau = tableauResultats(p);
  const lignes =
    affichage === 'cache'
      ? []
      : (affichage === 'classement' ? tableau : [...tableau].sort((a, b) => a.nom.localeCompare(b.nom, 'fr-CH'))).map((l) => ({
          nom: l.nom,
          resultatCumule: l.resultatCumule,
          tresorerie: l.tresorerie,
          partMarchePourMille: l.partMarchePourMille,
          ...(affichage === 'classement' ? { rang: l.rang, score: l.score } : {}),
        }));
  return { numeroTour: t.numero, demandeTotale: t.demandeTotale, prixMoyen: t.prixMoyen, lignes };
}
