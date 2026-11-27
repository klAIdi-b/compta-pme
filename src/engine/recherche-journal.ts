// Recherche et filtres du journal (phase V4, écran V4.3 de la maquette validée le 27.11.2026) : libellé, nom ou numéro
// de compte, montant (« 1850 », « 1'850.00 », « 1’850,00 »), numéro de pièce ; filtres par compte et par période. Les
// filtres ne modifient rien : ils choisissent seulement les écritures à afficher.

import type { Compte } from './plan';
import type { Ecriture } from './dossier';
import type { Centimes } from './money';

export interface FiltreJournal {
  texte?: string;
  /** Numéro de compte : seulement les écritures qui le touchent. */
  compte?: string | null;
  /** Dates ISO AAAA-MM-JJ, comprises. */
  du?: string | null;
  au?: string | null;
}

const normaliser = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Montant tapé dans la recherche, en centimes, ou null si le texte n'est pas un montant. */
export function montantRecherche(texte: string): Centimes | null {
  const t = texte.replace(/[\s'’ ]/g, '').replace(/^chf/i, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(Number(t) * 100);
}

export function filtrerEcritures(ecritures: readonly Ecriture[], plan: readonly Compte[], f: FiltreJournal): Ecriture[] {
  const noms = new Map(plan.map((c) => [c.numero, normaliser(c.intitule)]));
  const texte = normaliser(f.texte ?? '');
  const montant = texte ? montantRecherche(texte) : null;
  return ecritures.filter((e) => {
    const comptes = e.lignes.flatMap((l) => [l.debit, l.credit]).filter((n): n is string => !!n);
    if (f.compte && !comptes.includes(f.compte)) return false;
    if (f.du && e.date < f.du) return false;
    if (f.au && e.date > f.au) return false;
    if (!texte) return true;
    if (e.piece.toLowerCase() === texte) return true;
    if (montant !== null && e.lignes.some((l) => l.montant === montant)) return true;
    if (normaliser(e.libelle).includes(texte)) return true;
    return comptes.some((n) => n.startsWith(texte) || (noms.get(n) ?? '').includes(texte));
  });
}

/** Total d'écritures (somme des débits), pour « n écritures trouvées · total ». */
export function totalEcritures(ecritures: readonly Ecriture[]): Centimes {
  return ecritures.reduce((s, e) => s + e.lignes.reduce((t, l) => t + (l.debit ? l.montant : 0), 0), 0);
}
