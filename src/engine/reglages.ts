// Réglages de l'établissement (version publique, phase P2, maquette validée le 22.11.2026) : plan comptable adapté
// par l'école et titres des niveaux. Module pur, sans dépendance à l'interface.
import type { Resultat } from './dossier';
import { ErreurPlan, lirePlanCsv, ecrirePlanCsv, type Compte, type Niveau } from './plan';
import type { Filiere } from './exercice';

/**
 * Comptes utilisés par une fonction du logiciel (bouclement, TVA, ducroire, salaires, répartition, titres, analyse,
 * simulateur) : tous les numéros du plan par défaut cités dans `src/engine/` (test de cohérence dans
 * `tests/reglages.test.ts`). Ils ne peuvent être ni retirés, ni changés de type ou de niveau ; leur intitulé reste
 * modifiable, sauf 2800 dont l'intitulé suit la forme juridique.
 */
export const COMPTES_VERROUILLES: readonly string[] = [
  '1000', '1020', '1060', '1100', '1109', '1170', '1171', '1200', '1400', '1510', '1530', '1850',
  '2000', '2010', '2100', '2170', '2171', '2172', '2200', '2205', '2230', '2400', '2600', '2800', '2850', '2950', '2970', '2979',
  '3200', '3805', '4200', '4280', '5200', '5270', '6000', '6600', '6800', '6900', '6950',
  '8000', '8100', '8500', '8510', '8900', '9000',
];

/** Comptes dont l'intitulé n'est pas modifiable (2800 : Capital / Capital-actions / Capital social selon la forme). */
export const INTITULES_FIXES: readonly string[] = ['2800'];

export const estVerrouille = (numero: string) => COMPTES_VERROUILLES.includes(numero);

export type TitresNiveaux = Record<Filiere, Record<number, string>>;

export interface Reglages {
  /** Plan de l'établissement ; absent = plan par défaut. */
  plan?: Compte[];
  /** Titres des niveaux de difficulté ; absent = titres par défaut. */
  titres?: TitresNiveaux;
  /** Noms affichés des niveaux « Comptes et fonctions » ; absent = noms par défaut. */
  libellesContenu?: Partial<Record<Niveau, string>>;
}

/**
 * Contrôle un plan d'établissement par rapport au plan par défaut : format (règles de `lirePlanCsv`), comptes verrouillés
 * présents avec le même type et le même niveau, intitulé de 2800 inchangé.
 */
export function controlerPlanEtablissement(plan: readonly Compte[], defaut: readonly Compte[]): Resultat<Compte[]> {
  let lu: Compte[];
  try {
    lu = lirePlanCsv(ecrirePlanCsv(plan));
  } catch (e) {
    return { ok: false, erreurs: [e instanceof ErreurPlan ? e.message : 'Plan comptable illisible.'] };
  }
  return controlerVerrouilles(lu, defaut);
}

/** Lit un plan CSV importé et le contrôle. */
export function importerPlanCsv(texte: string, defaut: readonly Compte[]): Resultat<Compte[]> {
  let lu: Compte[];
  try {
    lu = lirePlanCsv(texte);
  } catch (e) {
    return { ok: false, erreurs: [e instanceof ErreurPlan ? e.message : 'Fichier illisible.'] };
  }
  return controlerVerrouilles(lu, defaut);
}

function controlerVerrouilles(plan: Compte[], defaut: readonly Compte[]): Resultat<Compte[]> {
  const erreurs: string[] = [];
  const parNumero = new Map(plan.map((c) => [c.numero, c]));
  for (const ref of defaut) {
    if (!estVerrouille(ref.numero)) continue;
    const c = parNumero.get(ref.numero);
    if (!c) {
      erreurs.push(`Le compte ${ref.numero} ${ref.intitule} manque : il est utilisé par une fonction du logiciel.`);
      continue;
    }
    if (c.type !== ref.type) erreurs.push(`Le compte ${ref.numero} doit rester de type « ${ref.type} ».`);
    if (c.niveauMin !== ref.niveauMin) {
      erreurs.push(`Le compte ${ref.numero} doit rester visible dès ${ref.niveauMin ?? 'le niveau « non utilisé »'} : il est utilisé par une fonction du logiciel.`);
    }
    if (INTITULES_FIXES.includes(ref.numero) && c.intitule !== ref.intitule) {
      erreurs.push(`L'intitulé du compte ${ref.numero} ne se modifie pas : il suit la forme juridique de l'entreprise.`);
    }
  }
  return erreurs.length ? { ok: false, erreurs } : { ok: true, valeur: [...plan].sort((a, b) => a.numero.localeCompare(b.numero)) };
}

export interface DifferencesPlan {
  intitulesModifies: string[];
  ajoutes: string[];
  retires: string[];
  /** Comptes passés à « non utilisé ». */
  nonUtilises: string[];
  /** Autres changements de niveau. */
  niveauxModifies: string[];
}

export function differencesPlan(avant: readonly Compte[], apres: readonly Compte[]): DifferencesPlan {
  const a = new Map(avant.map((c) => [c.numero, c]));
  const b = new Map(apres.map((c) => [c.numero, c]));
  const d: DifferencesPlan = { intitulesModifies: [], ajoutes: [], retires: [], nonUtilises: [], niveauxModifies: [] };
  for (const c of apres) {
    const x = a.get(c.numero);
    if (!x) {
      d.ajoutes.push(c.numero);
      continue;
    }
    if (x.intitule !== c.intitule) d.intitulesModifies.push(c.numero);
    if (x.niveauMin !== c.niveauMin) (c.niveauMin === null ? d.nonUtilises : d.niveauxModifies).push(c.numero);
  }
  for (const c of avant) if (!b.has(c.numero)) d.retires.push(c.numero);
  return d;
}

export const nombreDifferences = (d: DifferencesPlan) =>
  d.intitulesModifies.length + d.ajoutes.length + d.retires.length + d.nonUtilises.length + d.niveauxModifies.length;

/** Titres effectifs : ceux de l'établissement complétés par les titres par défaut. */
export function titresEffectifs(defaut: TitresNiveaux, reglages?: Reglages | null): TitresNiveaux {
  return {
    CFC: { ...defaut.CFC, ...(reglages?.titres?.CFC ?? {}) },
    MP: { ...defaut.MP, ...(reglages?.titres?.MP ?? {}) },
  };
}

/** Contrôle des titres saisis : niveaux numérotés 1, 2, 3… sans trou, titres non vides. */
export function controlerTitres(titres: TitresNiveaux): string[] {
  const erreurs: string[] = [];
  for (const f of ['CFC', 'MP'] as const) {
    const niveaux = Object.keys(titres[f]).map(Number).sort((x, y) => x - y);
    niveaux.forEach((n, i) => {
      if (n !== i + 1) erreurs.push(`${f} : les niveaux doivent se suivre (1, 2, 3…).`);
      if (!titres[f][n]?.trim()) erreurs.push(`${f} : le titre du niveau ${n} est vide.`);
    });
  }
  return [...new Set(erreurs)];
}
