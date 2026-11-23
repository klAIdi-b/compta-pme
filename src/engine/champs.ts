// Champs d'une fiche que l'élève remplit (facturation, budget) : valeur attendue, contrôle de la saisie et points
// au prorata des champs justes. Les saisies sont des textes, comme dans les autres fiches.

import { lireDate, type DateISO } from './dates';
import { lireMontant, type Centimes } from './money';

export interface ChampAttendu {
  cle: string;
  libelle: string;
  /**
   * chf : montant au centime ; pc : pour cent à 0,1 point près ; nombre : nombre exact ; date ; texte (sans
   * majuscules ni espaces en trop) ; compte : IBAN ou référence (sans espaces) ; choix : valeur d'une liste.
   */
  type: 'chf' | 'pc' | 'nombre' | 'date' | 'texte' | 'compte' | 'choix';
  attendu: string | Centimes | number;
}

const normaliser = (s: string) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr');
const sansEspaces = (s: string) => s.replace(/\s+/g, '').toUpperCase();
/** Le signe moins typographique (−) est accepté comme un tiret. */
const moins = (s: string) => s.replace(/[−–]/g, '-');

function lireNombre(s: string): number | null {
  const t = moins(s).replace(/['\s]/g, '').replace(',', '.').replace('%', '');
  if (t === '' || Number.isNaN(Number(t))) return null;
  return Number(t);
}

/** true : juste ; false : à revoir ; null : champ vide. */
export function controlerChamp(ch: ChampAttendu, saisie: string | undefined, annee?: number): boolean | null {
  const brut = (saisie ?? '').trim();
  if (brut === '') return null;
  switch (ch.type) {
    case 'chf':
      return lireMontant(moins(brut)) === ch.attendu;
    case 'pc': {
      const n = lireNombre(brut);
      return n !== null && Math.abs(n - (ch.attendu as number)) <= 0.1 + 1e-9;
    }
    case 'nombre': {
      const n = lireNombre(brut);
      return n !== null && n === ch.attendu;
    }
    case 'date':
      return lireDate(brut, annee) === (ch.attendu as DateISO);
    case 'texte':
      return normaliser(brut) === normaliser(String(ch.attendu));
    case 'compte':
      return sansEspaces(brut) === sansEspaces(String(ch.attendu));
    case 'choix':
      return brut === ch.attendu;
  }
}

export interface ResultatDocument {
  cle: string;
  justes: number;
  total: number;
  points: number;
  max: number;
}

const auDemiPointInferieur = (x: number) => Math.floor(x * 2 + 1e-9) / 2;

/** Points d'un document : barème × champs justes / champs, arrondi au demi-point inférieur. */
export function resultatDocument(
  cle: string,
  champs: ChampAttendu[],
  saisies: Record<string, string> | undefined,
  max: number,
  annee?: number,
): ResultatDocument {
  const justes = champs.filter((ch) => controlerChamp(ch, saisies?.[ch.cle], annee) === true).length;
  return { cle, justes, total: champs.length, points: champs.length ? auDemiPointInferieur((justes / champs.length) * max) : 0, max };
}
