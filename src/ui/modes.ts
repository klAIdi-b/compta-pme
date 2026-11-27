// Machines à états de l'application, rendues explicites (fonctions pures, testées dans tests/modes.test.ts).
//
// 1. Genre de la session active (persisté sous la forme `role` + `apercu`, format inchangé) :
//
//      travail ──ouvrirApercu──▶ apercu  ──fermerApercu──▶ travail mis de côté (ou aucune session)
//      travail ──ouvrirCorrige─▶ corrige ──fermerCorrige─▶ travail mis de côté (ou aucune session)
//
//    Seul un « travail » d'élève est mis de côté, et jamais par-dessus un autre travail déjà mis de côté.
//
// 2. Écran affiché, par priorité : guide > parcours Apprendre > espace enseignant > accueil > logiciel.

/** Ce qui suffit pour qualifier une session (sous-ensemble de `Session`). */
export interface SessionQualifiable {
  role: 'eleve' | 'corrige';
  apercu?: boolean;
}

/**
 * - `travail` : le travail d'un élève, enregistré et exportable ;
 * - `apercu` : l'enseignant voit l'exercice comme un élève, rien n'est gardé ;
 * - `corrige` : l'enseignant saisit le corrigé dans le journal.
 */
export type GenreSession = 'travail' | 'apercu' | 'corrige';

export function genreSession(s: SessionQualifiable | null | undefined): GenreSession | null {
  if (!s) return null;
  if (s.role === 'corrige') return 'corrige';
  return s.apercu ? 'apercu' : 'travail';
}

/** L'élève (ou l'aperçu) voit l'exercice comme un élève : retour gradué, avancement. */
export function vueEleve(g: GenreSession | null): boolean {
  return g === 'travail' || g === 'apercu';
}

/** Accueil, « Changer d'exercice », nom du site cliquable : seulement pendant un travail d'élève (ou sans session). */
export function peutOuvrirAccueil(g: GenreSession | null): boolean {
  return g === null || g === 'travail';
}

/**
 * Session à garder de côté quand l'enseignant ouvre un aperçu ou un corrigé : le travail actif s'il y en a un, sinon
 * celui déjà mis de côté. Le travail d'un élève n'est ainsi jamais remplacé par un aperçu ou un corrigé.
 */
export function aMettreDeCote<S extends SessionQualifiable>(active: S | null, dejaDeCote: S | null): S | null {
  return genreSession(active) === 'travail' ? active : dejaDeCote;
}

export type Ecran = 'guide' | 'apprendre' | 'enseignant' | 'accueil' | 'logiciel';

export function ecranAffiche(x: {
  guide: boolean;
  /** Parcours « Apprendre » ouvert (exercices courts, sans exercice en cours). */
  apprendre?: boolean;
  enseignantOuvert: boolean;
  session: SessionQualifiable | null;
  accueilOuvert: boolean;
}): Ecran {
  if (x.guide) return 'guide';
  if (x.apprendre) return 'apprendre';
  if (x.enseignantOuvert) return 'enseignant';
  if (!x.session) return 'accueil';
  // L'accueil ne se superpose qu'à un travail d'élève : un aperçu ou un corrigé reste affiché.
  if (x.accueilOuvert && peutOuvrirAccueil(genreSession(x.session))) return 'accueil';
  return 'logiciel';
}

// 3. Espaces du site (phase V1 de VISION_LOGICIEL.md, maquette validée le 27.11.2026) : la Comptabilité (dossiers de
//    l'élève, choix d'un exercice, évaluation) et le Cours (Apprendre, Théorie) sont séparés ; l'accueil mène aux deux.

/** Pages de l'accueil (sans exercice ouvert, ou par-dessus un travail en cours). */
export type PageAccueil = 'accueil' | 'dossiers' | 'papier' | 'theorie' | 'exercices' | 'evaluation';
/** Rubriques du bandeau : les pages de l'accueil, plus le parcours Apprendre (écran à part). */
export type Rubrique = PageAccueil | 'apprendre';
export type Espace = 'accueil' | 'comptabilite' | 'cours';

export function espaceDe(r: Rubrique): Espace {
  if (r === 'apprendre' || r === 'theorie') return 'cours';
  if (r === 'dossiers' || r === 'papier' || r === 'exercices' || r === 'evaluation') return 'comptabilite';
  return 'accueil';
}
