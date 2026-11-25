// Avancement de l'élève dans la session en cours (accueil et en-tête).
import { avancement, type Avancement } from '../engine/correction';
import type { Session } from './etat.svelte';
import { retourVisible } from '../engine/exercice';
import { genreSession, vueEleve } from './modes';

/** Avancement sur les opérations de l'énoncé, ou null si sans objet (saisie du corrigé, exercice sans opérations). */
export function avancementSession(s: Session): Avancement | null {
  if (!vueEleve(genreSession(s)) || s.exercice.operations.length === 0) return null;
  const d = s.dossier.debut === s.exercice.debut ? s.dossier : s.archives.find((a) => a.debut === s.exercice.debut);
  if (!d) return null;
  return avancement(s.exercice.operations, d.ecritures, avecCorrection(s) ? s.exercice.corrige! : null, s.suivi ?? {});
}

/** Juste / à revoir ne s'affichent qu'avec le retour (entraînement, formative terminée), quand le corrigé est disponible. */
export function avecCorrection(s: Session): boolean {
  return retourVisible(s.exercice.mode, !!s.formativeTerminee) && (s.exercice.corrige?.length ?? 0) > 0;
}
