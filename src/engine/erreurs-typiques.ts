// Erreurs typiques des élèves : au-delà du type d'erreur (« mauvais compte »), une explication du raisonnement à
// corriger, avec le chapitre de théorie à revoir. Chaque règle compare un compte attendu par le corrigé à celui que
// l'élève a choisi du même côté. Les explications reprennent les règles validées du cours (voir CLAUDE.md).

import type { LigneEcriture } from './dossier';

export interface ErreurTypique {
  /** Identifiant stable (statistiques de la classe). */
  id: string;
  /** Explication pour l'élève : ce qu'il a confondu et comment raisonner. */
  explication: string;
  /** Chapitre de théorie à revoir (identifiant du sommaire). */
  chapitre: string;
}

type Sens = 'D' | 'C';
type Test = (compte: string) => boolean;

const parmi = (...c: string[]): Test => (x) => c.includes(x);
const LIQUIDITES = parmi('1000', '1010', '1020');
const CHARGE: Test = (x) => /^[456]/.test(x);
/** Immobilisations (classe 14 à 17), sans les fonds d'amortissements cumulés (xxx9). */
const IMMOBILISATION: Test = (x) => /^1[4-7]/.test(x) && !x.endsWith('9');
const DETTE_FACTURE = parmi('2000', '2010');

interface Regle extends ErreurTypique {
  sens: Sens;
  attendu: Test;
  saisi: Test;
}

const REGLES: Regle[] = [
  {
    id: 'investissement-en-charge',
    sens: 'D',
    attendu: IMMOBILISATION,
    saisi: CHARGE,
    explication:
      "Un bien qui sert durablement à l'entreprise (machine, véhicule, mobilier, ordinateur) est un actif immobilisé, " +
      "pas une charge : il figure au bilan.",
    chapitre: 'bilan',
  },
  {
    id: 'charge-en-investissement',
    sens: 'D',
    attendu: CHARGE,
    saisi: IMMOBILISATION,
    explication:
      "Cette dépense ne crée pas un bien durable pour l'entreprise : elle est consommée pendant l'exercice, c'est une charge.",
    chapitre: 'resultat',
  },
  {
    id: 'autres-dettes-en-fournisseurs',
    sens: 'C',
    attendu: parmi('2010'),
    saisi: parmi('2000'),
    explication:
      "Dettes fournisseurs seulement pour des marchandises achetées pour être revendues. Pour un investissement " +
      '(véhicule, mobilier, machine, ordinateur) ou une autre facture (service, frais) : Autres dettes.',
    chapitre: 'credit',
  },
  {
    id: 'fournisseurs-en-autres-dettes',
    sens: 'C',
    attendu: parmi('2000'),
    saisi: parmi('2010'),
    explication: 'Des marchandises achetées à crédit pour être revendues : la dette va dans Dettes fournisseurs.',
    chapitre: 'credit',
  },
  {
    id: 'paiement-en-charge',
    sens: 'D',
    attendu: DETTE_FACTURE,
    saisi: CHARGE,
    explication:
      "La facture a déjà été comptabilisée à sa réception (en charge, en achat ou à l'actif selon ce qu'elle concerne). " +
      "Le paiement éteint la dette : on débite la dette, pas une deuxième fois le compte de la facture.",
    chapitre: 'credit',
  },
  {
    id: 'encaissement-en-vente',
    sens: 'C',
    attendu: parmi('1100'),
    saisi: parmi('3200', '3400'),
    explication:
      "La vente a déjà été comptabilisée à l'envoi de la facture. L'encaissement éteint la créance du client : on crédite " +
      'Créances clients, pas une deuxième fois les ventes.',
    chapitre: 'credit',
  },
  {
    id: 'credit-paye-comptant-client',
    sens: 'D',
    attendu: parmi('1100'),
    saisi: LIQUIDITES,
    explication:
      "Le client recevra une facture et paiera plus tard : aucun argent n'entre aujourd'hui, l'entreprise a une créance.",
    chapitre: 'credit',
  },
  {
    id: 'credit-paye-comptant-fournisseur',
    sens: 'C',
    attendu: DETTE_FACTURE,
    saisi: LIQUIDITES,
    explication:
      "La facture sera payée plus tard : aucun argent ne sort aujourd'hui, l'entreprise a une dette.",
    chapitre: 'credit',
  },
  {
    id: 'moyen-de-paiement',
    sens: 'D',
    attendu: LIQUIDITES,
    saisi: LIQUIDITES,
    explication: 'Relisez le moyen de paiement : espèces → Caisse, compte postal → Poste, compte bancaire → Banque.',
    chapitre: 'comptes',
  },
  {
    id: 'moyen-de-paiement',
    sens: 'C',
    attendu: LIQUIDITES,
    saisi: LIQUIDITES,
    explication: 'Relisez le moyen de paiement : espèces → Caisse, compte postal → Poste, compte bancaire → Banque.',
    chapitre: 'comptes',
  },
  {
    id: 'prive-en-charge',
    sens: 'D',
    attendu: parmi('2850'),
    saisi: CHARGE,
    explication:
      "Cette dépense concerne la vie privée du propriétaire : elle va dans son compte privé, pas dans les charges de l'entreprise.",
    chapitre: 'prive',
  },
  {
    id: 'charge-en-prive',
    sens: 'D',
    attendu: CHARGE,
    saisi: parmi('2850'),
    explication: "Cette dépense sert à l'entreprise : c'est une charge, pas un prélèvement privé.",
    chapitre: 'prive',
  },
  {
    id: 'achat-en-stock',
    sens: 'D',
    attendu: parmi('4200'),
    saisi: parmi('1200'),
    explication:
      "Un achat de marchandises se comptabilise dans Achats de marchandises. Le stock n'est modifié qu'à la clôture, d'après l'inventaire.",
    chapitre: 'marchandises',
  },
  {
    id: 'vente-en-stock',
    sens: 'C',
    attendu: parmi('3200'),
    saisi: parmi('1200', '4200'),
    explication: 'Une vente de marchandises se comptabilise dans Ventes de marchandises, au prix de vente.',
    chapitre: 'marchandises',
  },
  // 2ème CFC (26.11.2026, second audit ; règles du cours relevées dans CLAUDE.md, textes à relire par l'enseignant).
  {
    id: 'impot-prealable-investissement',
    sens: 'D',
    attendu: parmi('1171'),
    saisi: parmi('1170'),
    explication:
      "L'impôt préalable sur un investissement ou une autre charge d'exploitation va dans le compte 1171 ; le compte 1170 " +
      'est réservé aux marchandises et aux prestations de services.',
    chapitre: 'tva',
  },
  {
    id: 'impot-prealable-marchandises',
    sens: 'D',
    attendu: parmi('1170'),
    saisi: parmi('1171'),
    explication:
      "L'impôt préalable sur des marchandises ou des prestations de services va dans le compte 1170 ; le compte 1171 sert " +
      'aux investissements et aux autres charges d\'exploitation.',
    chapitre: 'tva',
  },
  {
    id: 'amortissement-direct-au-lieu-indirect',
    sens: 'C',
    attendu: (x) => /^1[4-7]\d9$/.test(x),
    saisi: IMMOBILISATION,
    explication:
      "Méthode indirecte : l'amortissement est crédité au fonds d'amortissements cumulés (compte en 9) ; la valeur " +
      "d'acquisition reste inchangée dans le compte de l'immobilisation.",
    chapitre: 'amortissements',
  },
  {
    id: 'amortissement-indirect-au-lieu-direct',
    sens: 'C',
    attendu: IMMOBILISATION,
    saisi: (x) => /^1[4-7]\d9$/.test(x),
    explication:
      "Méthode directe : l'amortissement est crédité directement au compte de l'immobilisation, sans fonds d'amortissements cumulés.",
    chapitre: 'amortissements',
  },
  {
    id: 'ducroire-en-creances',
    sens: 'C',
    attendu: parmi('1109'),
    saisi: parmi('1100'),
    explication:
      'Le ducroire est une correction de valeur estimée : il se passe au compte Ducroire. Les créances clients ne ' +
      'diminuent que pour une perte définitive.',
    chapitre: 'creances',
  },
  {
    id: 'actif-transitoire',
    sens: 'D',
    attendu: parmi('1300'),
    saisi: parmi('2300'),
    explication:
      'Charge payée d\'avance ou produit à recevoir : c\'est un actif transitoire (1300). Le passif transitoire (2300) ' +
      'sert aux charges à payer et aux produits reçus d\'avance.',
    chapitre: 'transitoires',
  },
  {
    id: 'passif-transitoire',
    sens: 'C',
    attendu: parmi('2300'),
    saisi: parmi('1300'),
    explication:
      'Charge à payer ou produit reçu d\'avance : c\'est un passif transitoire (2300). L\'actif transitoire (1300) sert ' +
      'aux charges payées d\'avance et aux produits à recevoir.',
    chapitre: 'transitoires',
  },
];

function cotes(lignes: readonly LigneEcriture[]): Set<string> {
  const s = new Set<string>();
  for (const l of lignes) {
    if (l.debit) s.add(`${l.debit}|D`);
    if (l.credit) s.add(`${l.credit}|C`);
  }
  return s;
}

/**
 * Première erreur typique reconnue entre l'écriture de l'élève et le corrigé de l'opération, ou null.
 * Seuls les comptes en trop chez l'élève et ceux qui lui manquent sont comparés, côté par côté.
 */
export function erreurTypique(eleve: readonly LigneEcriture[], corrige: readonly LigneEcriture[]): ErreurTypique | null {
  const e = cotes(eleve);
  const c = cotes(corrige);
  const enTrop = [...e].filter((k) => !c.has(k)).map((k) => k.split('|') as [string, Sens]);
  const manquants = [...c].filter((k) => !e.has(k)).map((k) => k.split('|') as [string, Sens]);
  for (const r of REGLES) {
    for (const [attendu, sa] of manquants) {
      if (sa !== r.sens || !r.attendu(attendu)) continue;
      if (enTrop.some(([saisi, se]) => se === r.sens && saisi !== attendu && r.saisi(saisi))) {
        return { id: r.id, explication: r.explication, chapitre: r.chapitre };
      }
    }
  }
  return null;
}

/** Identifiants des erreurs typiques reconnues (liens depuis la théorie, tests). */
export const IDS_ERREURS_TYPIQUES: string[] = [...new Set(REGLES.map((r) => r.id))];
