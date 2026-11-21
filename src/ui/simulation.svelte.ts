// Simulateur d'entreprise, sans connexion (phase S3) : parties enregistrées dans ce navigateur, écran affiché.
// L'enseignant saisit les décisions des groupes à son poste ; le calcul est fait par le moteur (src/engine/simulation).

import type { Decisions, Imprevu, Partie } from '../engine/simulation/types';
import { controlerImprevu, jouerTour } from '../engine/simulation/tour';
import { CLE_SIMULATEUR, partieDe, type PartieEnregistree } from '../io/simulation';
import { ecrire, lire } from '../io/stockage';

export type EcranSimulation =
  | { ecran: 'liste' }
  | { ecran: 'creation' }
  | { ecran: 'partie'; id: string }
  | { ecran: 'decisions'; id: string; entrepriseId: string }
  | { ecran: 'projection'; id: string };

class Simulations {
  parties = $state<PartieEnregistree[]>([]);
  vue = $state<EcranSimulation>({ ecran: 'liste' });
  /** Parties recalculées, gardées en mémoire (clé : identifiant + nombre de tours joués). */
  #cache = new Map<string, { cle: string; partie: Partie }>();

  constructor() {
    const d = lire<{ parties: PartieEnregistree[] }>(CLE_SIMULATEUR);
    this.parties = d?.parties ?? [];
  }

  sauver() {
    ecrire($state.snapshot({ parties: this.parties }), CLE_SIMULATEUR);
  }

  trouver(id: string): PartieEnregistree | undefined {
    return this.parties.find((p) => p.id === id);
  }

  /** Partie calculée ; null si elle ne peut pas être recalculée (données endommagées). */
  calculee(id: string): Partie | null {
    const e = this.trouver(id);
    if (!e) return null;
    const cle = `${e.decisionsParTour.length}`;
    const c = this.#cache.get(id);
    if (c && c.cle === cle) return c.partie;
    try {
      const partie = partieDe($state.snapshot(e) as PartieEnregistree);
      this.#cache.set(id, { cle, partie });
      return partie;
    } catch {
      return null;
    }
  }

  ajouter(e: PartieEnregistree) {
    this.parties = [e, ...this.parties.filter((p) => p.id !== e.id)];
    this.#cache.delete(e.id);
  }

  supprimer(id: string) {
    this.parties = this.parties.filter((p) => p.id !== id);
    this.#cache.delete(id);
  }

  validerDecisions(id: string, entrepriseId: string, d: Decisions) {
    const e = this.trouver(id);
    if (e) e.brouillon[entrepriseId] = d;
  }

  retirerDecisions(id: string, entrepriseId: string) {
    const e = this.trouver(id);
    if (e) delete e.brouillon[entrepriseId];
  }

  /** Calcule le tour en cours avec les décisions validées ; renvoie les erreurs éventuelles. */
  calculerTour(id: string): string[] {
    const e = this.trouver(id);
    const p = this.calculee(id);
    if (!e || !p) return ['Partie introuvable.'];
    const imprevus = ($state.snapshot(e.imprevus ?? []) as Imprevu[]);
    const r = jouerTour(p, $state.snapshot(e.brouillon) as Record<string, Decisions>, imprevus);
    if (!r.ok) return r.erreurs;
    e.decisionsParTour.push($state.snapshot(e.brouillon) as Record<string, Decisions>);
    const parTour = e.imprevusParTour ?? [];
    while (parTour.length < e.decisionsParTour.length - 1) parTour.push([]);
    parTour.push(imprevus);
    e.imprevusParTour = parTour;
    e.brouillon = {};
    e.imprevus = [];
    this.#cache.set(id, { cle: `${e.decisionsParTour.length}`, partie: r.valeur });
    return [];
  }

  /** Annule le dernier tour calculé : ses décisions redeviennent celles du tour en cours. */
  annulerDernierTour(id: string) {
    const e = this.trouver(id);
    if (!e || e.decisionsParTour.length === 0) return;
    e.brouillon = e.decisionsParTour.pop()!;
    e.imprevus = e.imprevusParTour && e.imprevusParTour.length > e.decisionsParTour.length ? e.imprevusParTour.pop()! : [];
    this.#cache.delete(id);
  }

  /** Ajoute un imprévu au tour en cours ; renvoie les erreurs éventuelles. */
  ajouterImprevu(id: string, imp: Imprevu): string[] {
    const e = this.trouver(id);
    const p = this.calculee(id);
    if (!e || !p) return ['Partie introuvable.'];
    const erreurs = controlerImprevu(p, imp);
    if (erreurs.length) return erreurs;
    e.imprevus = [...(e.imprevus ?? []), imp];
    return [];
  }

  retirerImprevu(id: string, index: number) {
    const e = this.trouver(id);
    if (e) e.imprevus = (e.imprevus ?? []).filter((_, i) => i !== index);
  }
}

export const simulations = new Simulations();

$effect.root(() => {
  $effect(() => {
    simulations.sauver();
  });
});

export function nouvelIdPartie(): string {
  return `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
