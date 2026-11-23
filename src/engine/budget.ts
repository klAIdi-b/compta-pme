// Budget et écarts (plan d'études CFC : c5.ep1d préparer des budgets et des décomptes et en tirer des
// recommandations ; option Finances c6.ep4a écarts entre budget et chiffres effectifs ; compléments CFC de la MP).
// Règles validées par l'enseignant le 23.11.2026 (maquette public/maquettes/budget.html) :
// - écart = effectif − budget ; écart en % = écart ÷ budget × 100, à 0,1 point près ;
// - produit : effectif au-dessus du budget = favorable ; charge : effectif au-dessus du budget = défavorable ;
//   écart nul = conforme ; le résultat s'apprécie comme un produit ;
// - chiffres effectifs donnés par l'énoncé ou repris des comptes de l'élève, au choix par exercice ;
// - cause principale choisie dans une liste (corrigée), recommandation en texte libre (non corrigée) ;
// - points en évaluation : préparation du budget 3, comparaison 3, au prorata des champs justes.

import { resultatDocument, type ChampAttendu, type ResultatDocument } from './champs';
import type { Centimes } from './money';

export type NaturePoste = 'produit' | 'charge';

export interface PosteBudget {
  id: string;
  libelle: string;
  nature: NaturePoste;
  /** Indication de calcul donnée par la note (par exemple « 60 × 25.00 ») : affichée seulement dans le corrigé. */
  calcul?: string;
  budget: Centimes;
  /** Chiffre effectif donné par l'énoncé. */
  effectif?: Centimes;
  /** Ou : comptes dont le solde donne le chiffre effectif (exercice comptabilisé par l'élève). */
  comptes?: string[];
}

export interface DonneesBudget {
  titre: string;
  /** Note de la direction : données pour préparer le budget. */
  note: string[];
  /** L'élève prépare lui-même le budget (onglet 1) ; sinon le budget est donné. */
  preparer: boolean;
  postes: PosteBudget[];
  /** Phrase qui présente les chiffres effectifs (onglet 2). */
  contexteEffectif: string;
  causes: string[];
  /** Indice de la cause principale dans `causes`. */
  cause: number;
  /** Question facultative : seuil (par exemple participants nécessaires pour couvrir les charges). */
  seuil?: { question: string; attendu: number };
}

export interface FicheBudget {
  preparer: Record<string, string>;
  comparer: Record<string, string>;
}

export const ficheBudgetVide = (): FicheBudget => ({ preparer: {}, comparer: {} });

export type Appreciation = 'favorable' | 'defavorable' | 'conforme';

export const LIBELLES_APPRECIATION: Record<Appreciation, string> = {
  favorable: 'Favorable',
  defavorable: 'Défavorable',
  conforme: 'Conforme',
};

/** Ligne du tableau de comparaison : postes, totaux et résultat. */
export interface LigneComparaison {
  id: string;
  libelle: string;
  nature: NaturePoste;
  budget: Centimes;
  effectif: Centimes;
  ecart: Centimes;
  /** null si le budget est nul. */
  ecartPc: number | null;
  appreciation: Appreciation;
  total?: boolean;
}

export const ID_TOTAL_PRODUITS = 'totalProduits';
export const ID_TOTAL_CHARGES = 'totalCharges';
export const ID_RESULTAT = 'resultat';

/** Solde d'un compte de gestion : un produit est créditeur (solde négatif), une charge débitrice. */
export type SoldeCompte = (compte: string) => Centimes;

export function effectifPoste(p: PosteBudget, solde?: SoldeCompte): Centimes {
  if (p.comptes && solde) {
    const s = p.comptes.reduce((t, c) => t + solde(c), 0);
    return p.nature === 'produit' ? -s : s;
  }
  return p.effectif ?? 0;
}

export function appreciation(nature: NaturePoste, ecart: Centimes): Appreciation {
  if (ecart === 0) return 'conforme';
  return (ecart > 0) === (nature === 'produit') ? 'favorable' : 'defavorable';
}

const pc = (ecart: Centimes, budget: Centimes) => (budget === 0 ? null : Math.round((ecart / budget) * 1000) / 10);

function ligne(id: string, libelle: string, nature: NaturePoste, budget: Centimes, effectif: Centimes, total = false): LigneComparaison {
  const ecart = effectif - budget;
  return { id, libelle, nature, budget, effectif, ecart, ecartPc: pc(ecart, budget), appreciation: appreciation(nature, ecart), total };
}

export interface CalculBudget {
  totalProduits: Centimes;
  totalCharges: Centimes;
  resultat: Centimes;
  lignes: LigneComparaison[];
}

/** Budget, chiffres effectifs et écarts : postes de produits, total, postes de charges, total, résultat. */
export function calculBudget(d: DonneesBudget, solde?: SoldeCompte): CalculBudget {
  const produits = d.postes.filter((p) => p.nature === 'produit');
  const charges = d.postes.filter((p) => p.nature === 'charge');
  const somme = (ps: PosteBudget[], f: (p: PosteBudget) => Centimes) => ps.reduce((t, p) => t + f(p), 0);
  const eff = (p: PosteBudget) => effectifPoste(p, solde);
  const bP = somme(produits, (p) => p.budget);
  const bC = somme(charges, (p) => p.budget);
  const eP = somme(produits, eff);
  const eC = somme(charges, eff);
  return {
    totalProduits: bP,
    totalCharges: bC,
    resultat: bP - bC,
    lignes: [
      ...produits.map((p) => ligne(p.id, p.libelle, 'produit', p.budget, eff(p))),
      ligne(ID_TOTAL_PRODUITS, 'Total des produits', 'produit', bP, eP, true),
      ...charges.map((p) => ligne(p.id, p.libelle, 'charge', p.budget, eff(p))),
      ligne(ID_TOTAL_CHARGES, 'Total des charges', 'charge', bC, eC, true),
      // Le résultat s'apprécie comme un produit : plus élevé que prévu = favorable.
      ligne(ID_RESULTAT, 'Résultat (bénéfice ou perte)', 'produit', bP - bC, eP - eC, true),
    ],
  };
}

/** Champs de l'onglet « Préparer le budget ». */
export function champsPreparer(d: DonneesBudget): ChampAttendu[] {
  const c = calculBudget(d);
  const champs: ChampAttendu[] = d.postes.map((p) => ({ cle: p.id, libelle: p.libelle, type: 'chf', attendu: p.budget }));
  champs.push({ cle: ID_TOTAL_PRODUITS, libelle: 'Total des produits', type: 'chf', attendu: c.totalProduits });
  champs.push({ cle: ID_TOTAL_CHARGES, libelle: 'Total des charges', type: 'chf', attendu: c.totalCharges });
  champs.push({ cle: ID_RESULTAT, libelle: 'Résultat prévu', type: 'chf', attendu: c.resultat });
  if (d.seuil) champs.push({ cle: 'seuil', libelle: d.seuil.question, type: 'nombre', attendu: d.seuil.attendu });
  return champs;
}

/** Champs de l'onglet « Comparer » : écart, écart en %, appréciation de chaque ligne, puis la cause principale. */
export function champsComparer(d: DonneesBudget, solde?: SoldeCompte): ChampAttendu[] {
  const c = calculBudget(d, solde);
  const champs: ChampAttendu[] = c.lignes.flatMap((l) => [
    { cle: `e:${l.id}`, libelle: `Écart, ${l.libelle}`, type: 'chf' as const, attendu: l.ecart },
    ...(l.ecartPc === null ? [] : [{ cle: `p:${l.id}`, libelle: `Écart en %, ${l.libelle}`, type: 'pc' as const, attendu: l.ecartPc }]),
    { cle: `a:${l.id}`, libelle: `Appréciation, ${l.libelle}`, type: 'choix' as const, attendu: l.appreciation },
  ]);
  champs.push({ cle: 'cause', libelle: "Cause principale de l'écart", type: 'choix', attendu: String(d.cause) });
  return champs;
}

export const POINTS_BUDGET = 3;
export const POINTS_COMPARAISON = 3;
export const CLE_BAREME_BUDGET = 'Budget';
export const CLE_BAREME_COMPARAISON = 'Comparaison avec le budget';

export function noterBudget(
  d: DonneesBudget,
  fiche: FicheBudget | undefined,
  bareme: Record<string, number> = {},
  solde?: SoldeCompte,
): ResultatDocument[] {
  const r: ResultatDocument[] = [];
  if (d.preparer) r.push(resultatDocument(CLE_BAREME_BUDGET, champsPreparer(d), fiche?.preparer, bareme[CLE_BAREME_BUDGET] ?? POINTS_BUDGET));
  r.push(resultatDocument(CLE_BAREME_COMPARAISON, champsComparer(d, solde), fiche?.comparer, bareme[CLE_BAREME_COMPARAISON] ?? POINTS_COMPARAISON));
  return r.filter((x) => x.max > 0);
}
