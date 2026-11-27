// Mode « énoncé papier » (phase V2 de VISION_LOGICIEL.md, maquette validée le 27.11.2026). L'élève reçoit l'énoncé sur
// une feuille : il crée lui-même le dossier de l'entreprise, saisit (ou reçoit) le bilan d'ouverture, puis passe les
// écritures avec les numéros de pièce de la feuille. L'enseignant corrige ensuite la copie avec son corrigé, pièce par
// pièce, comme une copie ordinaire.
//
// Code de l'exercice : imprimé sur la feuille, il associe la copie au bon corrigé. Pour un exercice du logiciel, deux
// codes existent : l'un fait remplir l'entreprise et le bilan d'ouverture par le logiciel (« fourni »), l'autre laisse
// l'élève les saisir (« saisi »). Les deux sont acceptés à la correction. Décision de l'enseignant du 27.11.2026 :
// l'ouverture saisie est comparée au corrigé, sans points par défaut.

import type { Centimes } from './money';
import { ouvertureDepuisBilan, type FormeJuridique } from './dossier';
import type { Exercice } from './exercice';
import type { Niveau } from './plan';

/** Bilan d'ouverture fourni par le logiciel, ou à saisir par l'élève. */
export type VarianteCode = 'fourni' | 'saisi';

/** Lettres et chiffres sans confusion possible à la lecture (ni 0/O, ni 1/I/L). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function empreinte(texte: string): number {
  // FNV-1a 32 bits : stable d'une version à l'autre, sans dépendance.
  let h = 0x811c9dc5;
  for (const c of texte) {
    h ^= c.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Code tel que l'élève peut le taper : majuscules, lettres et chiffres seulement (espaces, tirets et accents ignorés). */
export function normaliserCode(code: string): string {
  return code
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Code d'un exercice, à imprimer sur la feuille : le début du nom de l'entreprise, puis trois caractères tirés de
 * l'identifiant de l'exercice (« CYCLES-K7Q »). Le code choisi par l'enseignant dans l'éditeur l'emporte pour la
 * variante « fourni » ; la variante « saisi » ajoute toujours « S ».
 */
export function codeExercice(ex: Pick<Exercice, 'id' | 'raisonSociale' | 'code'>, variante: VarianteCode = 'fourni'): string {
  if (ex.code?.trim()) return variante === 'fourni' ? ex.code.trim().toUpperCase() : `${ex.code.trim().toUpperCase()}-S`;
  const mot = normaliserCode(ex.raisonSociale.split(/\s+/).find((m) => /[A-Za-zÀ-ÿ]{3,}/.test(m)) ?? ex.raisonSociale).replace(/[0-9]/g, '').slice(0, 8) || 'EX';
  // La version d'évaluation d'un exercice fourni garde le code de l'exercice : la feuille est la même.
  let h = empreinte(`${ex.id.replace(/-evaluation$/, '')}|${variante}`);
  let suite = '';
  for (let i = 0; i < 3; i++) {
    suite += ALPHABET[h % ALPHABET.length];
    h = Math.floor(h / ALPHABET.length);
  }
  return `${mot}-${suite}`;
}

/** Les deux codes d'un exercice se correspondent-ils au code tapé par l'élève ? Rend la variante reconnue, ou null. */
export function varianteDuCode(ex: Pick<Exercice, 'id' | 'raisonSociale' | 'code'>, code: string): VarianteCode | null {
  const c = normaliserCode(code);
  if (!c) return null;
  if (normaliserCode(codeExercice(ex, 'fourni')) === c) return 'fourni';
  if (normaliserCode(codeExercice(ex, 'saisi')) === c) return 'saisi';
  return null;
}

/** Exercice du catalogue désigné par un code tapé par l'élève, avec la variante reconnue. */
export function exerciceDuCode(code: string, catalogue: readonly Exercice[]): { exercice: Exercice; variante: VarianteCode } | null {
  for (const ex of catalogue) {
    const v = varianteDuCode(ex, code);
    if (v) return { exercice: ex, variante: v };
  }
  return null;
}

export interface InfosPapier {
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  niveau: Niveau;
  /** Dates ISO AAAA-MM-JJ. */
  debut: string;
  fin: string;
  /** Code tapé par l'élève (facultatif). */
  code: string;
}

/**
 * Exercice d'un dossier « énoncé papier » : sans opérations ni corrigé (l'énoncé est sur la feuille). Avec un exercice
 * du catalogue reconnu par son code, l'entreprise, la période, le niveau et les comptes viennent de cet exercice ; le
 * bilan d'ouverture aussi, si la variante du code est « fourni ».
 */
export function exercicePapier(id: string, infos: InfosPapier, source?: { exercice: Exercice; variante: VarianteCode }): Exercice {
  const s = source?.exercice;
  const fourni = source?.variante === 'fourni';
  const raisonSociale = s ? s.raisonSociale : infos.raisonSociale.trim();
  return {
    id,
    titre: `${raisonSociale} · énoncé papier`,
    niveau: s ? s.niveau : infos.niveau,
    ...(s?.filiere ? { filiere: s.filiere } : {}),
    ...(s?.difficulte ? { difficulte: s.difficulte } : {}),
    raisonSociale,
    formeJuridique: s ? s.formeJuridique : infos.formeJuridique,
    debut: s ? s.debut : infos.debut,
    fin: s ? s.fin : infos.fin,
    introduction: "Énoncé sur papier : passez au journal les opérations de la feuille, avec le numéro de chaque pièce.",
    operations: [],
    ouvertureActif: fourni ? { ...s!.ouvertureActif } : {},
    ouverturePassif: fourni ? { ...s!.ouverturePassif } : {},
    mode: 'entrainement',
    parametres: {
      libellesT: s?.parametres.libellesT ?? 'SI/SF',
      modificationDirecte: false,
      modeBouclement: s?.parametres.modeBouclement ?? 'compteDeResultat',
      comptesAjoutes: [...(s?.parametres.comptesAjoutes ?? [])],
      comptesMasques: [...(s?.parametres.comptesMasques ?? [])],
    },
    papier: { code: infos.code.trim() || undefined, source: s?.id, ouvertureFournie: fourni || undefined },
  };
}

export function estPapier(ex: Pick<Exercice, 'papier'>): boolean {
  return !!ex.papier;
}

/** Numéro de pièce proposé pour la prochaine écriture : le plus grand numéro entier déjà saisi, plus un. */
export function prochainePiece(pieces: readonly string[]): string {
  const nombres = pieces.map((p) => (/^\d+$/.test(p.trim()) ? Number(p.trim()) : NaN)).filter((n) => Number.isFinite(n));
  return String(nombres.length ? Math.max(...nombres) + 1 : 1);
}

export interface EcartOuverture {
  compte: string;
  /** Solde attendu par le corrigé (positif = débiteur), en centimes. */
  attendu: Centimes;
  /** Solde saisi par l'élève (positif = débiteur), en centimes. */
  saisi: Centimes;
}

/** Tolérance de la correction (0.05 CHF), comme pour les écritures. */
const TOLERANCE = 5;

/**
 * Comparaison du bilan d'ouverture saisi par l'élève avec celui du corrigé, compte par compte. Non noté par défaut
 * (décision de l'enseignant du 27.11.2026) : l'enseignant voit les écarts dans le détail de la copie.
 */
export function ecartsOuverture(ouvertureEleve: Record<string, Centimes>, ex: Pick<Exercice, 'ouvertureActif' | 'ouverturePassif'>): EcartOuverture[] {
  const attendu = ouvertureDepuisBilan(ex.ouvertureActif, ex.ouverturePassif);
  const comptes = [...new Set([...Object.keys(attendu), ...Object.keys(ouvertureEleve)])].sort();
  return comptes
    .map((compte) => ({ compte, attendu: attendu[compte] ?? 0, saisi: ouvertureEleve[compte] ?? 0 }))
    .filter((e) => Math.abs(e.attendu - e.saisi) > TOLERANCE);
}

/**
 * Une copie « énoncé papier » se corrige-t-elle avec cet exercice ? Le code tapé par l'élève doit être l'un des deux
 * codes de l'exercice ; une copie sans code est acceptée (l'enseignant la voit signalée).
 */
export function copiePapierPour(
  ex: Pick<Exercice, 'id' | 'raisonSociale' | 'code'>,
  papier: { code?: string; source?: string },
): 'oui' | 'sans-code' | 'non' {
  if (papier.code?.trim()) return varianteDuCode(ex, papier.code) ? 'oui' : 'non';
  if (papier.source) return papier.source === ex.id ? 'oui' : 'non';
  return 'sans-code';
}
