// Accompagnement des écritures de bouclement (validé par l'enseignant le 15.11.2026, méthode précisée le 18.11.2026) :
// consigne de chaque étape, sens de l'écriture, aide en deux niveaux (la règle, puis les comptes concernés sans les
// montants). La solution reste réservée au retour gradué habituel (après un essai faux).
// Méthode du cours : les charges et produits ne sont pas soldés au journal (le compte de résultat est établi à part) ;
// raison individuelle B1 résultat au compte privé, B2 compte privé au capital ; société B1 résultat au bénéfice reporté.

import type { Dossier } from './dossier';
import { indexPlan } from './dossier';
import { optionsBouclement } from './closing';
import { ecrituresRetenues } from './correction';

export interface EtapeBouclement {
  piece: string;
  /** Titre court pour le suivi des étapes. */
  titre: string;
  /** Ce que l'élève doit faire (sans comptes ni montants). */
  consigne: string;
  /** Aide de niveau 1 : la règle. */
  regle: string;
  /** À quoi sert l'écriture (sens de l'étape, toujours consultable). */
  but: string;
}

export function etapesBouclement(forme: Dossier['formeJuridique']): EtapeBouclement[] {
  if (forme === 'raison individuelle') {
    return [
      {
        piece: 'B1',
        titre: 'Résultat au compte privé',
        consigne: 'Virez le résultat de l’exercice (bénéfice ou perte) du compte de résultat au compte privé.',
        regle:
          'Le compte de résultat montre le bénéfice ou la perte de l’exercice. Un bénéfice se vire en l’inscrivant au ' +
          'débit du compte de résultat et au crédit du compte privé. Une perte fait l’inverse.',
        but:
          'Le résultat revient au propriétaire de l’entreprise : on le reporte au compte privé, où figurent déjà ses ' +
          'prélèvements.',
      },
      {
        piece: 'B2',
        titre: 'Compte privé au capital',
        consigne: 'Virez le solde du compte privé au capital (si le compte privé n’est pas déjà soldé).',
        regle:
          'Le compte privé réunit les prélèvements et le résultat. Calculez son solde, puis virez-le au capital pour ' +
          'solder le compte privé.',
        but:
          'Le compte privé est soldé à la fin de l’exercice : ce qui reste (le résultat moins les prélèvements) augmente ' +
          'le capital, ou le diminue.',
      },
    ];
  }
  return [
    {
      piece: 'B1',
      titre: 'Résultat au bénéfice reporté',
      consigne: 'Virez le résultat de l’exercice (bénéfice ou perte) du compte de résultat au bénéfice reporté.',
      regle:
        'Le compte de résultat montre le bénéfice ou la perte de l’exercice. Un bénéfice se vire en l’inscrivant au ' +
        'débit du compte de résultat et au crédit du bénéfice reporté. Une perte fait l’inverse.',
      but:
        'Le bénéfice d’une société est à la disposition de l’assemblée générale : on l’inscrit au bénéfice reporté, ' +
        'd’où il sera réparti.',
    },
  ];
}

const estPieceBouclement = (piece: string) => /^B\d+$/.test(piece);

/** Aide de niveau 2 : comptes concernés par l'étape, par leur nom, sans montants. */
export function comptesDeLEtape(d: Dossier, piece: string): { numero: string; intitule: string }[] {
  const plan = indexPlan(d.plan);
  const o = optionsBouclement(d.formeJuridique);
  const nom = (n: string) => ({ numero: n, intitule: plan.get(n)?.intitule ?? n });
  const prive = o.comptesPrives[0];
  if (piece === 'B1') return [nom(o.compteResultat), nom(prive ?? o.compteCapital)];
  if (piece === 'B2' && prive) return [nom(prive), nom(o.compteCapital)];
  return [];
}

/** Étapes déjà saisies (au moins une écriture retenue de cette pièce dans le journal). */
export function etapesSaisies(d: Dossier): Set<string> {
  return new Set(ecrituresRetenues(d.ecritures).map((e) => e.piece).filter(estPieceBouclement));
}
