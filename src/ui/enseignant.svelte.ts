// Espace enseignant : code d'accès simple (sans prétention de sécurité) et exercices en préparation.

import type { Exercice } from '../engine/exercice';
import { CLE_ENSEIGNANT, ecrire, lire } from '../io/stockage';
import type { Relecture } from '../io/relecture';
import { varianteSure } from '../engine/variante';
import type { Classe } from '../io/classe';

interface DonneesEnseignant {
  code: string | null;
  exercices: Exercice[];
  /** Date ISO de la dernière sauvegarde exportée. */
  derniereSauvegarde?: string | null;
  /** Avis de relecture du contenu (exercices, dossiers, théorie). */
  relecture?: Relecture;
}

class Enseignant {
  code = $state<string | null>(null);
  exercices = $state<Exercice[]>([]);
  derniereSauvegarde = $state<string | null>(null);
  relecture = $state<Relecture>({});
  /** Espace affiché à la place de l'accueil élève. */
  ouvert = $state(false);
  deverrouille = $state(false);
  /** Onglet affiché ; gardé en mémoire pour revenir au même endroit après un aperçu. */
  onglet = $state<'exercices' | 'dossiers' | 'copies' | 'classe' | 'progression' | 'simulateur' | 'relecture' | 'parametres'>('exercices');
  /** Exercice dont le panneau « Distribuer » est ouvert (phase V3). */
  distribuer = $state<string | null>(null);
  /**
   * Fichier de classe ouvert (phase V3) : gardé en mémoire seulement, jamais dans le navigateur (décision de
   * l'enseignant du 27.11.2026) ; l'enseignant l'enregistre dans un fichier.
   */
  classe = $state<Classe | null>(null);
  /** Le fichier de classe a changé depuis son dernier enregistrement. */
  classeModifiee = $state(false);
  /** Exercice en cours d'édition (identifiant). */
  edition = $state<string | null>(null);

  constructor() {
    const d = lire<DonneesEnseignant>(CLE_ENSEIGNANT);
    if (d) {
      this.code = d.code;
      this.exercices = d.exercices ?? [];
      this.derniereSauvegarde = d.derniereSauvegarde ?? null;
      this.relecture = d.relecture ?? {};
    }
  }

  sauver() {
    ecrire(
      $state.snapshot({ code: this.code, exercices: this.exercices, derniereSauvegarde: this.derniereSauvegarde, relecture: this.relecture }),
      CLE_ENSEIGNANT,
    );
  }

  enregistrer(ex: Exercice) {
    const i = this.exercices.findIndex((x) => x.id === ex.id);
    if (i >= 0) this.exercices[i] = ex;
    else this.exercices.unshift(ex);
  }

  /**
   * Variante d'évaluation d'un exercice du logiciel : montants multipliés par 2 ou 3, mode évaluation, enregistrée dans
   * les exercices de l'enseignant (son corrigé n'est pas public). Ouvre l'éditeur sur la variante.
   */
  creerVariante(ex: Exercice): { exercice: Exercice; avertissements: string[] } {
    const facteur = 2 + Math.floor(Math.random() * 2);
    const r = varianteSure(ex, facteur, nouvelIdentifiant());
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    const v = r.valeur;
    this.enregistrer(v);
    this.onglet = 'exercices';
    this.edition = v.id;
    return { exercice: v, avertissements: r.avertissements };
  }

  /** Met à jour l'avis de relecture d'un élément. */
  avis(cle: string, changement: { valide?: boolean; remarque?: string }) {
    const ancien = this.relecture[cle] ?? { valide: false, remarque: '' };
    this.relecture[cle] = { ...ancien, ...changement, le: new Date().toISOString() };
  }

  supprimer(id: string) {
    this.exercices = this.exercices.filter((x) => x.id !== id);
  }

  trouver(id: string | null): Exercice | undefined {
    return this.exercices.find((x) => x.id === id);
  }
}

export const enseignant = new Enseignant();

$effect.root(() => {
  $effect(() => {
    enseignant.sauver();
  });
});

export function nouvelIdentifiant(): string {
  return `ex-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
