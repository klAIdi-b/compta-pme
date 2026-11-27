// Fichier de classe (phase V3, maquette validée le 27.11.2026, écran V3.6 ; décision de l'enseignant du 27.11.2026 :
// le suivi de la classe est gardé dans un fichier, jamais dans le navigateur ni en ligne). L'enseignant l'enregistre et
// le rouvre la fois suivante, sur n'importe quel ordinateur. Il contient la liste de la classe, les copies rendues
// (la plus récente par élève et par exercice), les ajustements de points et les fichiers de progression d'Apprendre.

import type { Ajustements } from '../engine/ajustements';
import { ErreurFichier, importerCopie, type Copie } from './fichiers';
import type { FichierProgression } from './progression';

export const EXT_CLASSE = '.compta-classe.json';
const FORMAT = 'compta-pme/classe';

export interface EleveClasse {
  nom: string;
  prenom: string;
}

export interface Classe {
  /** Nom de la classe (par exemple 1CA). */
  nom: string;
  eleves: EleveClasse[];
  /** Copies rendues : une par élève et par exercice, la plus récente. */
  copies: Copie[];
  /** Ajustements de points, par copie (`cleCopie`). */
  ajustements: Record<string, Ajustements>;
  progressions: FichierProgression[];
  enregistreLe?: string;
}

export function classeVide(nom = ''): Classe {
  return { nom, eleves: [], copies: [], ajustements: {}, progressions: [] };
}

/** Clé d'un élève, sans tenir compte des majuscules, des accents ni des espaces en trop. */
export function cleEleve(e: { nom: string; prenom: string }): string {
  const n = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
  return `${n(e.nom)}|${n(e.prenom)}`;
}

/** Clé d'une copie : l'élève et l'exercice (une copie d'énoncé papier est rattachée par son exercice de correction). */
export function cleCopie(c: Pick<Copie, 'eleve' | 'exerciceId'>, exerciceId = c.exerciceId): string {
  return `${cleEleve(c.eleve)}|${exerciceId}`;
}

/**
 * Liste de la classe collée depuis un tableur ou un fichier CSV : une ligne par élève, nom puis prénom, séparés par
 * une tabulation, un point-virgule ou une virgule ; sans séparateur, le premier mot est le nom, la suite le prénom.
 * Une ligne d'en-tête (« Nom ; Prénom ») et les lignes vides sont ignorées ; les doublons ne comptent qu'une fois.
 */
export function lireListeClasse(texte: string): EleveClasse[] {
  const vus = new Set<string>();
  const r: EleveClasse[] = [];
  for (const brute of texte.replace(/^﻿/, '').split(/\r?\n/)) {
    const ligne = brute.trim();
    if (!ligne) continue;
    const parties = /[\t;,]/.test(ligne) ? ligne.split(/[\t;,]/).map((x) => x.trim().replace(/^"|"$/g, '')) : [ligne.split(/\s+/)[0]!, ligne.split(/\s+/).slice(1).join(' ')];
    const [nom = '', prenom = ''] = parties;
    if (!nom || /^nom$/i.test(nom)) continue;
    const e = { nom, prenom };
    if (vus.has(cleEleve(e))) continue;
    vus.add(cleEleve(e));
    r.push(e);
  }
  return r;
}

/** Ajoute des élèves à la liste (ceux déjà présents ne sont pas doublés). */
export function ajouterEleves(c: Classe, eleves: EleveClasse[]): Classe {
  const vus = new Set(c.eleves.map(cleEleve));
  return { ...c, eleves: [...c.eleves, ...eleves.filter((e) => !vus.has(cleEleve(e)))] };
}

/**
 * Ajoute des copies corrigées avec l'exercice `exerciceId` : pour chaque élève, la copie la plus récente est gardée.
 * Un élève absent de la liste y est ajouté.
 */
export function ajouterCopies(c: Classe, copies: Copie[], exerciceId: string): Classe {
  const parCle = new Map(c.copies.map((x) => [cleCopie(x, exerciceDeCopie(x)), x]));
  for (const copie of copies) {
    const rattachee: Copie = copie.exerciceId === exerciceId ? copie : { ...copie, rattacheeA: exerciceId };
    const k = cleCopie(rattachee, exerciceId);
    const ancienne = parCle.get(k);
    if (!ancienne || (copie.exporteLe ?? '') >= (ancienne.exporteLe ?? '')) parCle.set(k, rattachee);
  }
  const avecEleves = ajouterEleves(c, copies.map((x) => ({ nom: x.eleve.nom, prenom: x.eleve.prenom })));
  return { ...avecEleves, copies: [...parCle.values()] };
}

/** Exercice avec lequel une copie se corrige : le sien, ou celui auquel une copie d'énoncé papier a été rattachée. */
export function exerciceDeCopie(c: Copie): string {
  return c.rattacheeA ?? c.exerciceId;
}

/** Ajoute des fichiers de progression d'Apprendre ; le plus récent par élève est gardé. */
export function ajouterProgressions(c: Classe, fichiers: FichierProgression[]): Classe {
  const parEleve = new Map(c.progressions.map((p) => [cleEleve(p.eleve), p]));
  for (const f of fichiers) {
    const ancien = parEleve.get(cleEleve(f.eleve));
    if (!ancien || f.exporteLe >= ancien.exporteLe) parEleve.set(cleEleve(f.eleve), f);
  }
  const avecEleves = ajouterEleves(c, fichiers.map((f) => ({ nom: f.eleve.nom, prenom: f.eleve.prenom })));
  return { ...avecEleves, progressions: [...parEleve.values()] };
}

export function exporterClasse(c: Classe, maintenant = new Date()): string {
  return JSON.stringify({ format: FORMAT, version: 1, ...c, enregistreLe: maintenant.toISOString() }, null, 2);
}

export function importerClasse(texte: string): Classe {
  const refus = () => new ErreurFichier("Ce fichier n'est pas un fichier de classe Compta PME.");
  let o: Partial<Classe> & { format?: string };
  try {
    o = JSON.parse(texte);
  } catch {
    throw refus();
  }
  if (o?.format !== FORMAT || !Array.isArray(o.eleves) || !Array.isArray(o.copies)) throw refus();
  return {
    nom: String(o.nom ?? ''),
    eleves: o.eleves.filter((e) => e && typeof e.nom === 'string').map((e) => ({ nom: e.nom, prenom: String(e.prenom ?? '') })),
    copies: o.copies.map((x) => {
      const c = importerCopie(JSON.stringify({ format: 'compta-pme/copie', version: 1, ...x }));
      return (x as Copie).rattacheeA ? { ...c, rattacheeA: String((x as Copie).rattacheeA) } : c;
    }),
    ajustements: o.ajustements && typeof o.ajustements === 'object' ? o.ajustements : {},
    progressions: Array.isArray(o.progressions) ? o.progressions : [],
    enregistreLe: o.enregistreLe,
  };
}
