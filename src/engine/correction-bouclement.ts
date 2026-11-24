// Correction des écritures de bouclement (mode « compte de résultat »).
//
// Les écritures attendues sont calculées à partir des propres comptes de l'élève, juste avant son
// bouclement : une erreur commise dans une opération n'est donc pas pénalisée une seconde fois.
// Les écritures de bouclement de l'élève sont celles dont le numéro de pièce n'est pas un numéro
// d'opération de l'énoncé ET qui touchent le compte de résultat, ou virent entre le compte privé et le
// capital ; elles sont comparées ensemble (une écriture composée équivaut à sa décomposition, les numéros
// de pièce choisis n'ont pas d'importance).
//
// Pièce hors énoncé (24.11.2026) : une autre écriture saisie sous un numéro qui n'est pas celui d'une
// opération (« 3a » pour l'opération 3) n'est pas du bouclement. Elle reste dans les comptes de l'élève,
// donc dans le calcul des écritures attendues, et elle est signalée à l'élève et à l'enseignant
// (`piecesHorsEnonce`). Avant cette date, elle était retirée des comptes « avant bouclement » : le
// bouclement attendu était faux et l'élève pénalisé deux fois.
//
// Clôture des comptes de gestion par 9000 (24.11.2026) : le cours ne solde pas les charges et les produits au
// journal, mais un élève qui le fait, complètement, ne se trompe pas. Ces écritures sont alors mises de côté avant
// la comparaison : elles ne changent ni le résultat à virer ni les écritures attendues. Une clôture partielle
// n'est pas reconnue et reste jugée telle qu'elle est.

import { indexPlan, type Dossier, type Ecriture } from './dossier';
import type { EcritureCorrigee, Exercice } from './exercice';
import { ecrituresDeBouclement, optionsBouclement } from './closing';
import { diagnostiquer, ecrituresRetenues, type Diagnostic } from './correction';
import { soldes } from './ledger';

export const PIECE_BOUCLEMENT = 'Bouclement';
export const POINTS_BOUCLEMENT_PAR_DEFAUT = 3;

/** Le bouclement est-il corrigé (et noté) dans cet exercice ? */
export function bouclementCorrige(ex: Exercice): boolean {
  return ex.parametres.modeBouclement === 'compteDeResultat' && !!ex.parametres.corrigerBouclement && !ex.parametres.bouclementAutomatique;
}

/** La pièce de cette écriture n'est pas une opération de l'énoncé (ni une écriture automatique). */
function horsEnonce(e: Ecriture, ex: Exercice): boolean {
  return !e.automatique && !ex.operations.some((o) => o.numero === e.piece);
}

/**
 * Une écriture appartient au bouclement si sa pièce n'est pas une opération de l'énoncé et qu'elle touche le compte
 * de résultat, ou qu'elle ne touche que le capital (bénéfice reporté d'une société) et les comptes privés.
 */
export function estEcritureBouclement(e: Ecriture, ex: Exercice, d: Dossier): boolean {
  if (!horsEnonce(e, ex)) return false;
  const o = optionsBouclement(d.formeJuridique);
  const comptes = e.lignes.flatMap((l) => [l.debit, l.credit]).filter((n): n is string => !!n);
  const virement = new Set([o.compteCapital, ...o.comptesPrives]);
  return comptes.includes(o.compteResultat) || (comptes.length > 0 && comptes.every((n) => virement.has(n)));
}

/**
 * Numéros de pièce saisis par l'élève qui ne correspondent ni à une opération de l'énoncé ni au bouclement : ces
 * écritures modifient ses comptes mais ne sont rattachées à aucune opération, donc jamais corrigées. À signaler.
 */
export function piecesHorsEnonce(d: Dossier, ex: Exercice): string[] {
  if (ex.operations.length === 0) return [];
  const pieces = ecrituresRetenues(d.ecritures)
    .filter((e) => horsEnonce(e, ex) && !estEcritureBouclement(e, ex, d))
    .map((e) => e.piece);
  return [...new Set(pieces)];
}

/** Écritures de bouclement attendues, d'après les comptes de l'élève avant son bouclement. */
export function corrigeBouclement(d: Dossier, ex: Exercice): EcritureCorrigee | null {
  if (ex.parametres.modeBouclement !== 'compteDeResultat') return null;
  const avant: Dossier = { ...d, ecritures: d.ecritures.filter((e) => !estEcritureBouclement(e, ex, d)) };
  const r = ecrituresDeBouclement(avant);
  if (!r.ok || r.valeur.length === 0) return null;
  return { piece: PIECE_BOUCLEMENT, lignes: r.valeur.flatMap((e) => e.lignes) };
}

const COMPTE_DE_RESULTAT = '9000';

/**
 * Identifiants des écritures de bouclement qui soldent les comptes de charges et de produits par le compte de
 * résultat, quand cette clôture est complète : chaque compte de gestion finit à zéro. Ensemble vide sinon.
 */
export function clotureDeGestionPar9000(d: Dossier, ex: Exercice): Set<string> {
  const plan = indexPlan(d.plan);
  const gestion = (n: string | null) => {
    const t = n ? plan.get(n)?.type : undefined;
    return t === 'charge' || t === 'produit';
  };
  const bouclement = d.ecritures.filter((e) => estEcritureBouclement(e, ex, d));
  // Candidates : écritures qui ne touchent que le compte de résultat et des comptes de gestion.
  const candidates = bouclement.filter((e) => {
    const comptes = e.lignes.flatMap((l) => [l.debit, l.credit]).filter((n): n is string => !!n);
    return comptes.includes(COMPTE_DE_RESULTAT) && comptes.some(gestion) && comptes.every((n) => n === COMPTE_DE_RESULTAT || gestion(n));
  });
  if (candidates.length === 0) return new Set();
  const ids = new Set(candidates.map((e) => e.id));
  // Complète : sans le reste du bouclement, tous les comptes de gestion sont soldés (solde positif = débiteur).
  const apres = soldes({ ...d, ecritures: d.ecritures.filter((e) => !estEcritureBouclement(e, ex, d) || ids.has(e.id)) });
  for (const [n, x] of apres) if (gestion(n) && x.solde !== 0) return new Set();
  return ids;
}

/** Écritures de bouclement de l'élève à comparer aux écritures attendues, ramenées à la pièce « Bouclement ». */
function bouclementDeLEleve(d: Dossier, ex: Exercice): Ecriture[] {
  const cloture = clotureDeGestionPar9000(d, ex);
  return d.ecritures.filter((e) => estEcritureBouclement(e, ex, d) && !cloture.has(e.id)).map((e) => ({ ...e, piece: PIECE_BOUCLEMENT }));
}

/** Diagnostic du bouclement de l'élève (null si le bouclement n'est pas corrigé). */
export function diagnostiquerBouclement(d: Dossier, ex: Exercice): Diagnostic | null {
  const c = corrigeBouclement(d, ex);
  if (!c) return null;
  return diagnostiquer(bouclementDeLEleve(d, ex), c);
}

/** Écritures de l'élève pour la notation : celles du bouclement ramenées à la pièce « Bouclement ». */
export function ecrituresPourNotation(d: Dossier, ex: Exercice): Ecriture[] {
  const cloture = clotureDeGestionPar9000(d, ex);
  return d.ecritures.filter((e) => !cloture.has(e.id)).map((e) => (estEcritureBouclement(e, ex, d) ? { ...e, piece: PIECE_BOUCLEMENT } : e));
}
