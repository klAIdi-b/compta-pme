// Reprise d'un travail par fichier (audit du 24.11.2026, action 11 : postes partagés, une copie exportée doit pouvoir
// se rouvrir). Le dossier n'est jamais repris tel quel depuis le fichier : on repart du dossier de l'exercice (plan,
// comptes, bilan d'ouverture, écritures automatiques) et on y repasse les écritures de l'élève une à une, avec les
// contrôles du journal. Un fichier modifié à la main ou destiné à un autre exercice est donc refusé.

import type { Dossier, Resultat } from './dossier';
import { echec, ok } from './dossier';
import { creerDossier, type Exercice } from './exercice';
import { ajouterEcriture } from './journal';
import type { Compte } from './plan';

export function dossierDeCopie(ex: Exercice, plan: Compte[], copie: Pick<Dossier, 'debut' | 'fin' | 'ecritures'>): Resultat<Dossier> {
  if (copie.debut !== ex.debut || copie.fin !== ex.fin) {
    return echec(
      "Cette copie a été enregistrée après l'ouverture de l'exercice comptable suivant : elle ne peut pas être reprise. Recommencez l'exercice ou demandez conseil à votre enseignant.",
    );
  }
  let d = creerDossier(ex, plan);
  for (const e of copie.ecritures) {
    if (e.automatique) continue;
    const r = ajouterEcriture(d, e);
    if (!r.ok) return echec(`La copie ne correspond pas à cet exercice (pièce ${e.piece}) : ${r.erreurs.join(' ')}`);
    d = r.valeur;
  }
  return ok(d);
}

/**
 * Contrôles d'une copie importée par l'enseignant (second audit, 26.11.2026) : la copie est rejouée comme à la reprise,
 * et son mode est comparé à celui de l'exercice. Rend les alertes à afficher (vide si tout est en ordre).
 */
export function alertesCopie(
  ex: Exercice,
  plan: Compte[],
  copie: { mode?: Exercice['mode']; dossier: Pick<Dossier, 'debut' | 'fin' | 'ecritures'> },
): string[] {
  const alertes: string[] = [];
  if (ex.mode !== 'entrainement' && copie.mode === 'entrainement') {
    alertes.push("La copie a été faite en mode entraînement alors que l'exercice est une évaluation : le fichier d'exercice a sans doute été modifié.");
  }
  const r = dossierDeCopie(ex, plan, copie.dossier);
  if (!r.ok) alertes.push(`Le journal de la copie ne passe pas les contrôles du logiciel (${r.erreurs.join(' ')}) : la copie a pu être modifiée à la main.`);
  return alertes;
}

/** Groupes de copies dont les écritures sont identiques (mêmes pièces, comptes et montants, sans tenir compte des dates). */
export function copiesIdentiques<T>(copies: readonly T[], ecritures: (c: T) => readonly { piece: string; lignes: unknown; automatique?: boolean }[]): T[][] {
  const groupes = new Map<string, T[]>();
  for (const c of copies) {
    const e = ecritures(c).filter((x) => !x.automatique);
    if (e.length === 0) continue;
    const k = JSON.stringify(e.map((x) => [x.piece, x.lignes]));
    groupes.set(k, [...(groupes.get(k) ?? []), c]);
  }
  return [...groupes.values()].filter((g) => g.length > 1);
}
