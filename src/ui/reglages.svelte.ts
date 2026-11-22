// Réglages de l'établissement gardés dans ce navigateur (clé compta-pme:reglages:v1). Aucun envoi en ligne.
import { plan as planDefaut } from '../data/plan';
import { LIBELLES_CONTENU, TITRES_DIFFICULTE, type Filiere } from '../engine/exercice';
import type { Compte, Niveau } from '../engine/plan';
import { titresEffectifs, type Reglages, type TitresNiveaux } from '../engine/reglages';
import { effacer, ecrire, lire } from '../io/stockage';
import { CLE_REGLAGES, verifierReglages } from '../io/reglages';

function charger(): Reglages {
  const brut = lire<Reglages>(CLE_REGLAGES);
  if (!brut) return {};
  try {
    return verifierReglages(brut, planDefaut);
  } catch {
    return {};
  }
}

class ReglagesEtablissement {
  valeurs = $state<Reglages>(charger());

  /** Plan des exercices créés par l'enseignant : celui de l'établissement, sinon le plan par défaut. */
  get plan(): Compte[] {
    return this.valeurs.plan ?? planDefaut;
  }

  get planModifie(): boolean {
    return this.valeurs.plan !== undefined;
  }

  /** Titres effectifs des niveaux (établissement complété par les titres par défaut). */
  get titres(): TitresNiveaux {
    return titresEffectifs(TITRES_DIFFICULTE, this.valeurs);
  }

  /** Titres de l'établissement s'il en a défini, sinon null (l'accueil garde alors les titres portés par les exercices). */
  get titresPropres(): TitresNiveaux | null {
    return this.valeurs.titres ? this.titres : null;
  }

  titre(filiere: Filiere, difficulte: number): string {
    return this.titres[filiere][difficulte] ?? '';
  }

  libelleContenu(n: Niveau): string {
    return this.valeurs.libellesContenu?.[n] ?? LIBELLES_CONTENU[n];
  }

  enregistrer(r: Reglages) {
    this.valeurs = r;
    if (r.plan === undefined && r.titres === undefined && r.libellesContenu === undefined) effacer(CLE_REGLAGES);
    else ecrire($state.snapshot(r), CLE_REGLAGES);
  }
}

export const reglages = new ReglagesEtablissement();
