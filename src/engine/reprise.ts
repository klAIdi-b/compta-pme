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
