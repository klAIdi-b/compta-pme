// Lien direct vers un exercice du logiciel : l'enseignant le copie et le donne à sa classe ; l'élève arrive sur
// l'accueil avec cet exercice déjà choisi. Seuls les exercices et dossiers fournis avec le logiciel ont un lien
// (les exercices propres à l'enseignant ne sont pas sur le site : ils se donnent par fichier).

const PARAMETRE = 'exercice';

/**
 * Anciens identifiants des contenus construits sur les manuels, renommés le 27.11.2026 avec leurs entreprises : un lien
 * déjà donné aux élèves ouvre la nouvelle version. Les copies rendues avec un ancien identifiant ne sont pas redirigées :
 * leurs montants ne correspondent plus au corrigé.
 */
export const ANCIENS_IDS: Record<string, string> = {
  'manuel-cfc1-favre-evenements': 'exercice-cfc1-golay-evenements',
  'manuel-cfc1-vinotheque-des-paquis': 'exercice-cfc1-cave-eaux-vives',
  'manuel-cfc2-maison-lacroix-tva': 'exercice-cfc2-maison-vuilleumier-tva',
  'manuel-cfc3-materiaux-brodard-creances': 'exercice-cfc3-materiaux-jaquier-creances',
  'manuel-cfc3-imprimerie-mont-blanc-amortissements': 'exercice-cfc3-imprimerie-delices-amortissements',
  'manuel-cfc3-truffaz-transports-transitoires': 'exercice-cfc3-transports-monnier-transitoires',
  'manuel-cfc4-lambert-horlogerie-cloture': 'exercice-cfc4-horlogerie-perrin-cloture',
  'manuel-mp3-zephyr-automation-fondation': 'exercice-mp3-alize-robotique-fondation',
  'manuel-mp4-rive-gauche-participations-titres': 'exercice-mp4-arve-placements-titres',
  'dossier-cfc1-garage-pont-rouge': 'dossier-cfc1-garage-praille',
  'dossier-cfc1-hifi-plainpalais': 'dossier-cfc1-son-image-servette',
  'dossier-cfc2-electromenager-du-rhone-tva': 'dossier-mp1-electromenager-acacias-tva',
  'dossier-cfc3-confiserie-bourg-de-four-salaires': 'dossier-cfc3-patisserie-molard-salaires',
};

/** Identifiant d'exercice indiqué dans l'adresse (un ancien identifiant est remplacé par le nouveau), ou null. */
export function exerciceDuLien(): string | null {
  const id = new URLSearchParams(location.search).get(PARAMETRE);
  return id ? (ANCIENS_IDS[id] ?? id) : null;
}

/** Adresse à donner aux élèves pour ouvrir directement un exercice. */
export function lienEleves(exerciceId: string): string {
  const base = `${location.origin}${location.pathname.replace(/index\.html$/, '')}`;
  return `${base}?${PARAMETRE}=${encodeURIComponent(exerciceId)}`;
}

/** Retire le lien de l'adresse une fois l'exercice commencé (un rechargement ne le rouvre pas). */
export function oublierLien() {
  if (!location.search) return;
  history.replaceState(null, '', `${location.pathname}${location.hash}`);
}

// Lien vers un chapitre de la théorie : un module d'Apprendre l'ouvre dans un nouvel onglet, pour que l'élève garde
// sa place dans le module.
const PARAMETRE_THEORIE = 'theorie';

/** Identifiant de chapitre indiqué dans l'adresse, ou null. */
export function chapitreDuLien(): string | null {
  return new URLSearchParams(location.search).get(PARAMETRE_THEORIE);
}

/** Adresse qui ouvre la rubrique Théorie sur un chapitre. */
export function lienTheorie(chapitreId: string): string {
  return `${location.pathname.replace(/index\.html$/, '')}?${PARAMETRE_THEORIE}=${encodeURIComponent(chapitreId)}`;
}
