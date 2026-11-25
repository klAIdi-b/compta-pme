// « Bilan en direct » du journal : les masses du bilan en blocs, et l'effet de la dernière écriture.
// Fonctions pures : les totaux viennent tels quels de `bilan()`, rien n'est recalculé à l'affichage (correction du
// 24.11.2026 : la perte, déjà ajoutée à l'actif par le moteur, était comptée une seconde fois par l'écran).
//
// Pour ne pas tromper un débutant (remarque de l'enseignant du 25.11.2026) :
// - le résultat de l'exercice en cours est montré à part, sous le nom de « Perte provisoire » (à l'actif, règle du cours)
//   ou de « Bénéfice provisoire » (au passif, séparé des capitaux propres) : un achat de marchandises n'est pas une perte,
//   c'est le résultat du moment, avant les ventes ;
// - l'effet de la dernière écriture est décrit compte par compte, dans le vocabulaire du cours (actif, passif, charge,
//   produit), puis par son effet sur le résultat provisoire quand elle touche une charge ou un produit. Le message ne
//   compare plus les totaux du bilan, qui mêlent les postes et le résultat.
import { indexPlan, type Dossier, type Ecriture } from './dossier';
import type { Centimes } from './money';
import type { TypeCompte } from './plan';
import type { Bilan } from './statements';

export type ClasseBloc = 'ac' | 'ai' | 'ct' | 'lt' | 'cp' | 'perte' | 'benefice';

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

export const TITRE_PERTE = 'Perte provisoire';
export const TITRE_BENEFICE = 'Bénéfice provisoire';

const CLASSES: Record<string, ClasseBloc> = {
  'Actifs circulants': 'ac',
  'Actifs immobilisés': 'ai',
  'Capitaux étrangers à court terme': 'ct',
  'Capitaux étrangers à long terme': 'lt',
  'Capitaux propres': 'cp',
};

/** Masses d'un côté du bilan, le résultat de l'exercice en cours à part. */
function masses(cote: 'actif' | 'passif', b: Bilan): { titre: string; montant: Centimes; classe: ClasseBloc }[] {
  const r: { titre: string; montant: Centimes; classe: ClasseBloc }[] = [];
  for (const g of b[cote]) {
    // Perte : le moteur la présente à l'actif comme un groupe sans titre (règle du cours).
    if (g.titre === '') r.push({ titre: TITRE_PERTE, montant: g.total, classe: 'perte' });
    // Bénéfice : le moteur l'ajoute aux capitaux propres ; on le montre à côté, comme résultat du moment.
    else if (g.titre === 'Capitaux propres' && b.resultat > 0) r.push({ titre: g.titre, montant: g.total - b.resultat, classe: 'cp' });
    else r.push({ titre: g.titre, montant: g.total, classe: CLASSES[g.titre] ?? 'cp' });
  }
  if (cote === 'passif' && b.resultat > 0) r.push({ titre: TITRE_BENEFICE, montant: b.resultat, classe: 'benefice' });
  return r;
}

function blocs(cote: 'actif' | 'passif', b: Bilan, avant: Bilan | null): BlocBilan[] {
  const maintenant = masses(cote, b);
  const precedent = avant ? masses(cote, avant) : null;
  const titres = new Set(maintenant.map((x) => x.titre));
  const disparus = (precedent ?? []).filter((x) => !titres.has(x.titre)).map((x) => ({ ...x, montant: 0 }));
  return [...maintenant, ...disparus]
    .map((x) => ({
      ...x,
      // Sans écriture précédente, pas de variation ; une masse absente du bilan précédent valait zéro.
      avant: precedent ? (precedent.find((y) => y.titre === x.titre)?.montant ?? 0) : x.montant,
    }))
    .filter((k) => k.montant > 0 || k.avant > 0);
}

/** Les masses du bilan en blocs ; `avant` est le bilan sans la dernière écriture, ou null. */
export function bilanEnBlocs(b: Bilan, avant: Bilan | null): BilanEnBlocs {
  return { actif: blocs('actif', b, avant), passif: blocs('passif', b, avant), totalActif: b.totalActif, totalPassif: b.totalPassif };
}

// ---------- Effet de la dernière écriture ----------

export interface MouvementCompte {
  numero: string;
  intitule: string;
  /** Catégorie du cours : actif, passif, charge ou produit. */
  type: Exclude<TypeCompte, 'bouclement'>;
  /** Variation dans le sens du compte : positive = le compte augmente, négative = il diminue. */
  variation: Centimes;
}

export type EffetResultat =
  /** L'écriture ne touche ni charge ni produit : le résultat ne change pas. */
  | { genre: 'aucun' }
  /** Une charge ou un produit change le résultat provisoire. */
  | { genre: 'change'; avant: Centimes; apres: Centimes }
  /** Écriture de bouclement : le résultat est viré, il ne figure plus à part. */
  | { genre: 'vire'; montant: Centimes };

export type EffetBilan =
  | { genre: 'permutation' }
  | { genre: 'ensemble'; sens: 'hausse' | 'baisse'; montant: Centimes }
  /** Ne se produit pas avec une écriture équilibrée ; gardé pour ne jamais affirmer un équilibre faux. */
  | { genre: 'desequilibre'; actif: Centimes; passif: Centimes };

export interface EffetEcriture {
  mouvements: MouvementCompte[];
  resultat: EffetResultat;
  /** Effet sur les masses du bilan, seulement quand l'écriture ne touche que des comptes du bilan. */
  bilan: EffetBilan | null;
}

/** Effet sur les totaux du bilan d'une écriture qui ne touche que des comptes du bilan. */
function effetSurLeBilan(b: Bilan, avant: Bilan): EffetBilan {
  const dA = b.totalActif - avant.totalActif;
  const dP = b.totalPassif - avant.totalPassif;
  if (dA === 0 && dP === 0) return { genre: 'permutation' };
  if (dA === dP) return { genre: 'ensemble', sens: dA > 0 ? 'hausse' : 'baisse', montant: Math.abs(dA) };
  return { genre: 'desequilibre', actif: dA, passif: dP };
}

/** Effet de l'écriture `e` : chaque compte touché, puis l'effet sur le résultat provisoire ou sur le bilan. */
export function effetEcriture(e: Ecriture, d: Dossier, b: Bilan, avant: Bilan): EffetEcriture {
  const plan = indexPlan(d.plan);
  const net = new Map<string, Centimes>();
  for (const l of e.lignes) {
    if (l.debit) net.set(l.debit, (net.get(l.debit) ?? 0) + l.montant);
    if (l.credit) net.set(l.credit, (net.get(l.credit) ?? 0) - l.montant);
  }
  const mouvements: MouvementCompte[] = [];
  let gestion = false;
  let cloture = false;
  for (const [numero, solde] of net) {
    const c = plan.get(numero);
    if (!c || solde === 0) continue;
    if (c.type === 'bouclement') {
      cloture = true;
      continue;
    }
    if (c.type === 'charge' || c.type === 'produit') gestion = true;
    // Actif et charge augmentent au débit ; passif et produit au crédit.
    const variation = c.type === 'actif' || c.type === 'charge' ? solde : -solde;
    mouvements.push({ numero, intitule: c.intitule, type: c.type, variation });
  }
  let resultat: EffetResultat = { genre: 'aucun' };
  if (cloture && avant.resultat !== 0 && b.resultat === 0) resultat = { genre: 'vire', montant: avant.resultat };
  else if (gestion || b.resultat !== avant.resultat) resultat = { genre: 'change', avant: avant.resultat, apres: b.resultat };
  return { mouvements, resultat, bilan: resultat.genre === 'aucun' ? effetSurLeBilan(b, avant) : null };
}
