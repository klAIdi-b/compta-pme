// Révision espacée du parcours « Apprendre » (audit du 24.11.2026, à valider sur la prévisualisation).
// Une notion maîtrisée est redemandée après 1, 3, 7, 14 puis 30 jours : chaque réussite allonge l'intervalle, un échec
// le ramène à 1 jour. Principe de la récupération espacée : se souvenir un peu plus tard ancre mieux que relire.

export const INTERVALLES = [1, 3, 7, 14, 30] as const;

export interface EtatRevision {
  /** Rang dans INTERVALLES de la prochaine échéance. */
  rang: number;
  /** Date ISO (AAAA-MM-JJ) à partir de laquelle la notion est à revoir. */
  prochaine: string;
}

export function ajouterJours(jour: string, n: number): string {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Première échéance, le lendemain de la maîtrise. */
export const premiereRevision = (aujourdhui: string): EtatRevision => ({ rang: 0, prochaine: ajouterJours(aujourdhui, INTERVALLES[0]) });

/** Après une question de révision : intervalle suivant si elle est réussie, retour à 1 jour sinon. */
export function apresRevision(e: EtatRevision, reussie: boolean, aujourdhui: string): EtatRevision {
  const rang = reussie ? Math.min(e.rang + 1, INTERVALLES.length - 1) : 0;
  return { rang, prochaine: ajouterJours(aujourdhui, INTERVALLES[rang]!) };
}

/** Notions à revoir aujourd'hui, la plus ancienne échéance d'abord. */
export function aRevoir<T extends { revision?: EtatRevision }>(progression: Record<string, T>, aujourdhui: string): string[] {
  return Object.entries(progression)
    .filter(([, p]) => p.revision && p.revision.prochaine <= aujourdhui)
    .sort((a, b) => a[1].revision!.prochaine.localeCompare(b[1].revision!.prochaine))
    .map(([id]) => id);
}
