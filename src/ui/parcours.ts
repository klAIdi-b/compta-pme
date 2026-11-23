// Parcours de l'élève après le journal : les étapes s'enchaînent dans l'ordre du cours, sans que l'élève doive
// chercher la rubrique suivante dans la barre latérale (demande de l'enseignant du 23.11.2026).
// Module pur (testé dans tests/parcours.test.ts).

import type { Avancement } from '../engine/correction';
import type { Exercice, Fonction } from '../engine/exercice';
import type { Vue } from './etat.svelte';

export interface EtapeParcours {
  vue: Vue;
  libelle: string;
  consigne: string;
}

/**
 * Étapes qui suivent le journal, dans l'ordre du cours : balance (contrôle), compte de résultat et fiches qui
 * l'analysent, bilan avant bouclement, écritures de bouclement, puis fiches de clôture (répartition, analyse…).
 * Seules les fiches activées pour l'exercice figurent dans le parcours.
 */
export function etapesParcours(ex: Exercice, f: ReadonlySet<Fonction>): EtapeParcours[] {
  const e: EtapeParcours[] = [
    {
      vue: 'balance',
      libelle: 'Balance',
      consigne: "Contrôlez que le total du débit est égal au total du crédit. Sinon, retournez au journal.",
    },
    {
      vue: 'resultat',
      libelle: 'Compte de résultat',
      consigne: 'Total des produits − total des charges : relevez le bénéfice ou la perte de l’exercice.',
    },
  ];
  if (f.has('margeBrute')) e.push({ vue: 'margeBrute', libelle: 'Marge brute', consigne: 'Complétez la fiche « Marge brute ».' });
  if (f.has('echelle')) e.push({ vue: 'echelle', libelle: 'Échelle des prix', consigne: 'Complétez la fiche « Échelle des prix ».' });
  if (f.has('degres')) e.push({ vue: 'degres', libelle: 'Résultat par degrés', consigne: 'Complétez la fiche « Résultat par degrés ».' });
  e.push({
    vue: 'bilan',
    libelle: 'Bilan',
    consigne: 'Contrôlez le bilan avant bouclement : le total des actifs est égal au total des passifs.',
  });
  if (ex.parametres.modeBouclement === 'compteDeResultat') {
    const consigne = ex.parametres.bouclementAutomatique
      ? 'Cliquez sur « Passer les écritures de bouclement ».'
      : ex.formeJuridique === 'raison individuelle'
        ? 'Passez au journal B1 (résultat viré au compte privé), puis B2 (solde du compte privé viré au capital).'
        : 'Passez au journal B1 (résultat viré au bénéfice reporté).';
    e.push({ vue: 'bouclement', libelle: 'Bouclement', consigne });
  }
  if (f.has('repartition')) e.push({ vue: 'repartition', libelle: 'Répartition du bénéfice', consigne: 'Complétez la fiche « Répartition du bénéfice ».' });
  if (f.has('flux')) e.push({ vue: 'flux', libelle: 'Flux de trésorerie', consigne: 'Complétez la fiche « Flux de trésorerie ».' });
  if (f.has('analyse')) e.push({ vue: 'analyse', libelle: 'Analyse', consigne: 'Complétez la fiche « Analyse ».' });
  if (f.has('seuil')) e.push({ vue: 'seuil', libelle: 'Seuil de rentabilité', consigne: 'Complétez la fiche « Seuil de rentabilité ».' });
  return e;
}

/** Le parcours ne concerne pas le simulateur d'entreprise : son journal s'allonge à chaque tour. */
export function avecParcours(ex: Exercice): boolean {
  return !ex.id.startsWith('simulation-') && ex.operations.length > 0;
}

/**
 * État du journal pour passer à la suite. Avec la correction (entraînement), toutes les opérations doivent être
 * justes : sinon le compte de résultat et le bilan seraient faux. Sans correction (évaluation), il suffit que toutes
 * soient saisies.
 */
export type EtatJournal = { termine: true } | { termine: false; manquantes: number; aRevoir: number };

export function etatJournal(a: Avancement, avecCorrection: boolean): EtatJournal {
  const aRevoir = avecCorrection ? a.aRevoir + a.incompletes : 0;
  if (a.nonSaisies === 0 && aRevoir === 0) return { termine: true };
  return { termine: false, manquantes: a.nonSaisies, aRevoir };
}

/** Rang de la vue dans le parcours (0 = journal), ou -1 si la vue n'en fait pas partie. */
export function rangParcours(etapes: readonly EtapeParcours[], vue: Vue): number {
  if (vue === 'journal') return 0;
  const i = etapes.findIndex((e) => e.vue === vue);
  return i < 0 ? -1 : i + 1;
}
