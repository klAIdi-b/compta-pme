// Accompagnement des écritures de bouclement (validé par l'enseignant le 15.11.2026) : consigne de chaque étape,
// aide en deux niveaux (la règle, puis les comptes concernés sans les montants). La solution reste réservée au
// retour gradué habituel (après un essai faux). Méthode du cours : voir closing.ts (B1, B2, B3).

import type { Dossier } from './dossier';
import { indexPlan } from './dossier';
import { optionsBouclement } from './closing';
import { soldes } from './ledger';
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

const B1: EtapeBouclement = {
  piece: 'B1',
  titre: 'Charges et produits',
  consigne: 'Soldez tous les comptes de charges et de produits en les virant au compte de résultat.',
  regle:
    'Un compte se solde en inscrivant son solde du côté opposé. Les charges ont un solde au débit : on les inscrit au ' +
    'crédit, et le compte de résultat au débit. Les produits font l’inverse.',
  but:
    'Le compte de résultat rassemble toutes les charges et tous les produits de l’exercice : sa différence donne le ' +
    'bénéfice ou la perte. Les comptes de charges et de produits repartent ainsi à zéro pour l’exercice suivant.',
};

export function etapesBouclement(forme: Dossier['formeJuridique']): EtapeBouclement[] {
  if (forme === 'raison individuelle') {
    return [
      B1,
      {
        piece: 'B2',
        titre: 'Résultat au compte privé',
        consigne: 'Virez le résultat de l’exercice (bénéfice ou perte) au compte privé.',
        regle:
          'Après B1, la différence du compte de résultat est le résultat. Un bénéfice est un solde au crédit : on le ' +
          'solde en l’inscrivant au débit, contre le compte privé. Une perte fait l’inverse.',
        but:
          'Le résultat revient au propriétaire de l’entreprise : on le reporte au compte privé, où figurent déjà ses ' +
          'prélèvements.',
      },
      {
        piece: 'B3',
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
    B1,
    {
      piece: 'B2',
      titre: 'Résultat au bénéfice reporté',
      consigne: 'Virez le résultat de l’exercice (bénéfice ou perte) au bénéfice reporté.',
      regle:
        'Après B1, la différence du compte de résultat est le résultat. Un bénéfice est un solde au crédit : on le ' +
        'solde en l’inscrivant au débit, contre le bénéfice reporté. Une perte fait l’inverse.',
      but:
        'Le bénéfice d’une société est à la disposition de l’assemblée générale : on l’inscrit au bénéfice reporté, ' +
        'd’où il sera réparti.',
    },
  ];
}

const estPieceBouclement = (piece: string) => /^B\d+$/.test(piece);

/**
 * Aide de niveau 2 : comptes concernés par l'étape, par leur nom, sans montants. Pour B1, les charges et produits
 * dont le solde n'est pas nul avant le bouclement de l'élève.
 */
export function comptesDeLEtape(d: Dossier, piece: string): { numero: string; intitule: string }[] {
  const plan = indexPlan(d.plan);
  const o = optionsBouclement(d.formeJuridique);
  const nom = (n: string) => ({ numero: n, intitule: plan.get(n)?.intitule ?? n });
  if (piece === 'B1') {
    const avant: Dossier = { ...d, ecritures: d.ecritures.filter((e) => !estPieceBouclement(e.piece)) };
    return [...soldes(avant).entries()]
      .filter(([n, x]) => x.solde !== 0 && ['charge', 'produit'].includes(plan.get(n)?.type ?? ''))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([n]) => nom(n));
  }
  const prive = o.comptesPrives[0];
  if (piece === 'B2') return [nom(o.compteResultat), nom(prive ?? o.compteCapital)];
  if (piece === 'B3' && prive) return [nom(prive), nom(o.compteCapital)];
  return [];
}

/** Étapes déjà saisies (au moins une écriture retenue de cette pièce dans le journal). */
export function etapesSaisies(d: Dossier): Set<string> {
  return new Set(ecrituresRetenues(d.ecritures).map((e) => e.piece).filter(estPieceBouclement));
}
