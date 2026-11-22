// Fichier des réglages de l'établissement (.compta-reglages.json) : plan comptable et niveaux, partagé entre collègues.
import type { Compte } from '../engine/plan';
import { controlerPlanEtablissement, controlerTitres, type Reglages } from '../engine/reglages';
import { NIVEAUX } from '../engine/plan';
import { ErreurFichier, VERSION } from './fichiers';

export const EXT_REGLAGES = '.compta-reglages.json';
export const CLE_REGLAGES = 'compta-pme:reglages:v1';

export function exporterReglages(r: Reglages, maintenant = new Date()): string {
  return JSON.stringify({ format: 'compta-pme/reglages', version: VERSION, exporteLe: maintenant.toISOString(), reglages: r }, null, 2);
}

/** Lit et contrôle un fichier de réglages (même contrôle que la saisie à l'écran). */
export function importerReglages(texte: string, planDefaut: readonly Compte[]): Reglages {
  let f: { format?: unknown; reglages?: unknown };
  try {
    f = JSON.parse(texte);
  } catch {
    throw new ErreurFichier("Ce fichier n'est pas un fichier de réglages Compta PME.");
  }
  if (f?.format !== 'compta-pme/reglages' || typeof f.reglages !== 'object' || f.reglages === null) {
    throw new ErreurFichier("Ce fichier n'est pas un fichier de réglages Compta PME.");
  }
  return verifierReglages(f.reglages as Reglages, planDefaut);
}

/** Vérifie des réglages lus (fichier ou navigateur) ; lève ErreurFichier avec les messages du contrôle. */
export function verifierReglages(brut: Reglages, planDefaut: readonly Compte[]): Reglages {
  const r: Reglages = {};
  if (brut.plan !== undefined) {
    if (!Array.isArray(brut.plan)) throw new ErreurFichier('Le plan comptable des réglages est endommagé.');
    const c = controlerPlanEtablissement(brut.plan, planDefaut);
    if (!c.ok) throw new ErreurFichier(`Plan comptable refusé : ${c.erreurs.join(' ')}`);
    r.plan = c.valeur;
  }
  if (brut.titres !== undefined) {
    const t = brut.titres;
    const valide = t && typeof t === 'object' && ['CFC', 'MP'].every((f) => t[f as 'CFC'] && typeof t[f as 'CFC'] === 'object');
    if (!valide) throw new ErreurFichier('Les niveaux des réglages sont endommagés.');
    const erreurs = controlerTitres(t);
    if (erreurs.length) throw new ErreurFichier(`Niveaux refusés : ${erreurs.join(' ')}`);
    r.titres = { CFC: { ...t.CFC }, MP: { ...t.MP } };
  }
  if (brut.libellesContenu !== undefined) {
    const l: Reglages['libellesContenu'] = {};
    for (const n of NIVEAUX) {
      const v = brut.libellesContenu?.[n];
      if (typeof v === 'string' && v.trim()) l[n] = v.trim();
    }
    r.libellesContenu = l;
  }
  return r;
}
