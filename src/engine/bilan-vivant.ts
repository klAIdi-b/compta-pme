// « Bilan en direct » du journal : les masses du bilan en blocs, et l'effet de la dernière écriture.
// Fonctions pures : les totaux et la ligne de perte viennent tels quels de `bilan()`, rien n'est recalculé à l'affichage
// (correction du 24.11.2026 : la perte de l'exercice, déjà ajoutée à l'actif par le moteur, était comptée une seconde
// fois par l'écran, qui annonçait un bilan déséquilibré après une écriture juste).
import type { Centimes } from './money';
import type { Bilan } from './statements';

export type ClasseBloc = 'ac' | 'ai' | 'ct' | 'lt' | 'cp' | 'perte';

export interface BlocBilan {
  titre: string;
  montant: Centimes;
  /** Montant avant la dernière écriture (égal à `montant` s'il n'y en a pas). */
  avant: Centimes;
  classe: ClasseBloc;
}

export interface BilanEnBlocs {
  actif: BlocBilan[];
  passif: BlocBilan[];
  /** Totaux du moteur. */
  totalActif: Centimes;
  totalPassif: Centimes;
}

export const TITRE_PERTE = "Perte de l'exercice";

const CLASSES: Record<string, ClasseBloc> = {
  'Actifs circulants': 'ac',
  'Actifs immobilisés': 'ai',
  'Capitaux étrangers à court terme': 'ct',
  'Capitaux étrangers à long terme': 'lt',
  'Capitaux propres': 'cp',
};

function blocs(cote: 'actif' | 'passif', b: Bilan, avant: Bilan | null): BlocBilan[] {
  // Le moteur présente la perte de l'exercice comme un groupe sans titre, du côté de l'actif.
  const presents = b[cote].map((g) => g.titre);
  const disparus = (avant?.[cote] ?? []).filter((g) => !presents.includes(g.titre)).map((g) => ({ titre: g.titre, total: 0 }));
  return [...b[cote], ...disparus]
    .map((g) => ({
      titre: g.titre === '' ? TITRE_PERTE : g.titre,
      montant: g.total,
      // Sans écriture précédente, pas de variation ; un groupe absent du bilan précédent valait zéro.
      avant: avant ? (avant[cote].find((h) => h.titre === g.titre)?.total ?? 0) : g.total,
      classe: g.titre === '' ? ('perte' as const) : (CLASSES[g.titre] ?? 'cp'),
    }))
    .filter((k) => k.montant > 0 || k.avant > 0);
}

/** Les masses du bilan en blocs ; `avant` est le bilan sans la dernière écriture, ou null. */
export function bilanEnBlocs(b: Bilan, avant: Bilan | null): BilanEnBlocs {
  return { actif: blocs('actif', b, avant), passif: blocs('passif', b, avant), totalActif: b.totalActif, totalPassif: b.totalPassif };
}

export type EffetEcriture =
  | { genre: 'permutation' }
  | { genre: 'ensemble'; sens: 'hausse' | 'baisse'; montant: Centimes }
  /** Ne se produit pas avec une écriture équilibrée ; gardé pour ne jamais affirmer un équilibre faux. */
  | { genre: 'desequilibre'; actif: Centimes; passif: Centimes };

/** Effet de la dernière écriture sur les totaux du bilan, dans les termes du chapitre « Le bilan ». */
export function effetEcriture(b: Bilan, avant: Bilan): EffetEcriture {
  const dA = b.totalActif - avant.totalActif;
  const dP = b.totalPassif - avant.totalPassif;
  if (dA === 0 && dP === 0) return { genre: 'permutation' };
  if (dA === dP) return { genre: 'ensemble', sens: dA > 0 ? 'hausse' : 'baisse', montant: Math.abs(dA) };
  return { genre: 'desequilibre', actif: dA, passif: dP };
}
