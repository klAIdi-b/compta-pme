// Dossiers d'exercices avec pièces comptables (un par grand thème).
import type { Exercice } from '../../engine/exercice';
import type { TableauComplement } from './outils';
import { dossierPolyglotte, dossierSaveurs } from './cfc-bases';
import { dossierGarage, dossierHifi } from './cfc-manuel';
import { dossierElectromenager } from './cfc-manuel-tva';
import { complementFacturationLeman, dossierFacturationLeman } from './cfc-facturation';
import { dossierConfiserie } from './cfc-manuel-salaires';
import { dossierBabel, dossierMenuiserie, dossierOutils } from './cfc-tva-cloture';
import { dossierBoulangerie, dossierFleurs, dossierMeubles } from './cfc-creances-salaires';
import { dossierOptique, dossierPrecimeca } from './mp';
import { complementZufferey, dossierTerroirs, dossierZufferey } from './mp-operations';
import { complementCarrosserie, dossierCarrosserie, dossierSports } from './mp-immeubles-analyse';
import { dossierBrasserie, dossierLemanbio } from './mp-capital';
import { complementAteliers, dossierAteliers } from './mp-reserves-latentes';
import { dossierRhoneMobilite } from './mp-tableaux';
import { complementCartonnages, dossierCartonnages } from './mp-dissolution';

export const DOSSIERS: Exercice[] = [
  dossierSaveurs, dossierPolyglotte, dossierGarage, dossierHifi, dossierOutils, dossierElectromenager, dossierFacturationLeman, dossierMenuiserie, dossierBabel,
  dossierMeubles, dossierBoulangerie, dossierConfiserie, dossierFleurs, dossierTerroirs, dossierZufferey, dossierBrasserie, dossierLemanbio, dossierAteliers, dossierCartonnages, dossierOptique, dossierPrecimeca, dossierCarrosserie, dossierSports, dossierRhoneMobilite,
];

/** Version d'évaluation d'un dossier : même contenu, aucun retour pendant la saisie, corrigé absent du fichier élève. */
export function versionEvaluation(ex: Exercice): Exercice {
  return { ...ex, id: `${ex.id}-evaluation`, titre: `${ex.titre} (évaluation)`, mode: 'evaluation' };
}

/** Versions d'évaluation, connues de l'espace enseignant pour corriger les copies. */
export const DOSSIERS_EVALUATION: Exercice[] = DOSSIERS.map(versionEvaluation);

/** Tableaux complémentaires du corrigé PDF, par identifiant de dossier. */
export const COMPLEMENTS_CORRIGE: Record<string, TableauComplement[]> = {
  [dossierAteliers.id]: complementAteliers,
  [dossierFacturationLeman.id]: complementFacturationLeman,
  [dossierCartonnages.id]: complementCartonnages,
  [dossierZufferey.id]: complementZufferey,
  [dossierCarrosserie.id]: complementCarrosserie,
};
