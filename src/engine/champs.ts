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
  /** Montant : écart admis en centimes (0 par défaut, au centime). */
  tolerance?: Centimes;
}

/**
 * Comparaison d'un texte (nom du bénéficiaire, désignation) sans compter l'orthographe : accents, majuscules,
 * ponctuation et forme juridique ignorés, faute de frappe tolérée (règle de l'école : l'orthographe n'est pas évaluée).
 */
const FORMES = /\b(sa|sarl|ag|gmbh|snc|sc)\b/g;
function simplifier(s: string): string {
  return s
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,;:'’‘"«»()-]/g, ' ')
    .replace(FORMES, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function distance(a: string, b: string): number {
  const p = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = p[0]!;
    p[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const haut = p[j]!;
      p[j] = Math.min(p[j]! + 1, p[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = haut;
    }
  }
  return p[b.length]!;
}
export function textesProches(saisie: string, attendu: string): boolean {
  const a = simplifier(saisie);
  const b = simplifier(attendu);
  if (a === '' || b === '') return a === b;
  return distance(a, b) <= Math.max(1, Math.floor(b.length / 10));
}
const sansEspaces = (s: string) => s.replace(/\s+/g, '').toUpperCase();
/** Le signe moins typographique (−) est accepté comme un tiret. */
const moins = (s: string) => s.replace(/[−–]/g, '-');

function lireNombre(s: string): number | null {
  const t = moins(s).replace(/chf/gi, '').replace(/['’‘\s  ]/g, '').replace(',', '.').replace('%', '');
  if (t === '' || Number.isNaN(Number(t))) return null;
  return Number(t);
}

/** true : juste ; false : à revoir ; null : champ vide. */
export function controlerChamp(ch: ChampAttendu, saisie: string | undefined, annee?: number): boolean | null {
  const brut = (saisie ?? '').trim();
  if (brut === '') return null;
  switch (ch.type) {
    case 'chf': {
      const v = lireMontant(moins(brut).replace(/chf/gi, ''));
      return v !== null && Math.abs(v - (ch.attendu as number)) <= (ch.tolerance ?? 0);
    }
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
      return textesProches(brut, String(ch.attendu));
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
