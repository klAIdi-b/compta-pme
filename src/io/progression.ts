// Fichier de progression du parcours « Apprendre » : l'élève le télécharge et le rend dans le devoir Google Classroom ;
// l'enseignant importe les fichiers de la classe dans l'onglet « Progression ». Aucune donnée ne passe en ligne.
import type { Progression } from './apprendre';
import { ErreurFichier } from './fichiers';

export const EXT_PROGRESSION = '.compta-progression.json';
const FORMAT = 'compta-pme/progression';

export interface FichierProgression {
  eleve: { prenom: string; nom: string; classe: string };
  exporteLe: string;
  progression: Progression;
}

export function exporterProgression(f: FichierProgression): string {
  return JSON.stringify({ format: FORMAT, version: 1, ...f }, null, 2);
}

export function importerProgression(texte: string): FichierProgression {
  const refus = () => new ErreurFichier("Ce fichier n'est pas un fichier de progression Compta PME.");
  let o: unknown;
  try {
    o = JSON.parse(texte);
  } catch {
    throw refus();
  }
  const x = o as Partial<FichierProgression> & { format?: string };
  if (x?.format !== FORMAT || !x.eleve || typeof x.progression !== 'object' || x.progression === null) throw refus();
  const texteDe = (v: unknown) => (typeof v === 'string' ? v : '');
  return {
    eleve: { prenom: texteDe(x.eleve.prenom), nom: texteDe(x.eleve.nom), classe: texteDe(x.eleve.classe) },
    exporteLe: texteDe(x.exporteLe),
    progression: x.progression,
  };
}
