// Suivi par notion : chaque opération d'un exercice est rattachée à une notion du cours d'après les comptes de son
// corrigé ; la synthèse des copies montre alors, notion par notion, la réussite de la classe, les élèves à reprendre
// et l'erreur typique la plus fréquente.

import type { LigneEcriture } from './dossier';
import type { Exercice } from './exercice';
import type { Niveau } from './plan';
import { comparaisonOperation, corrigerCopie, type CopieNommee } from './notation';
import { erreurTypique } from './erreurs-typiques';

export interface Notion {
  id: string;
  titre: string;
  /** Comptes caractéristiques : une opération qui en touche un relève de cette notion (premier trouvé). */
  comptes?: string[];
}

/**
 * Ordre de priorité : la notion la plus spécifique d'abord, les opérations du bilan en dernier.
 * La TVA n'est pas cherchée par ses comptes : une opération est d'abord rangée d'après sa nature (achat, vente,
 * investissement…) ; seules les opérations propres à la TVA (décompte, paiement à l'AFC) vont en « TVA »
 * (décision de l'enseignant du 27.11.2026).
 */
export const NOTIONS: Notion[] = [
  { id: 'tva', titre: 'TVA' },
  { id: 'salaires', titre: 'Salaires et assurances sociales', comptes: ['5200', '5270', '2170', '2171', '2172', '1140'] },
  { id: 'creances', titre: 'Pertes sur créances et ducroire', comptes: ['1108', '1109', '3805'] },
  { id: 'transitoires', titre: 'Actifs et passifs transitoires', comptes: ['1300', '2300'] },
  { id: 'amortissements', titre: 'Amortissements', comptes: ['6800', '1509', '1519', '1529', '1539', '1549', '1609', '1709'] },
  { id: 'titres', titre: 'Titres', comptes: ['1060', '6940', '6952', '1176'] },
  { id: 'immeubles', titre: 'Immeubles', comptes: ['7500', '7510', '2401'] },
  { id: 'societes', titre: 'Sociétés', comptes: ['1850', '1860', '2810', '2900', '2950', '2960', '2970', '2230', '6550'] },
  { id: 'provisions', titre: 'Provisions', comptes: ['2600', '2640', '2660', '2690'] },
  { id: 'prive', titre: 'Compte privé', comptes: ['2850'] },
  // Maturité seulement, comme le chapitre « Intérêts, frais bancaires… » de la théorie ; avant, charges et produits.
  // Après le compte privé : l'intérêt du capital de l'exploitant (6900/2850) reste une opération du compte privé.
  { id: 'interets', titre: 'Intérêts et frais bancaires', comptes: ['6900', '6950'] },
  { id: 'marchandises', titre: 'Marchandises', comptes: ['1200', '3200', '3209', '3210', '3720', '4200', '4209', '4270', '4280'] },
  { id: 'factures', titre: 'Factures, dettes et créances', comptes: ['1100', '2000', '2010'] },
  { id: 'charges-produits', titre: 'Charges et produits' },
  { id: 'bilan', titre: 'Opérations du bilan' },
];

const TVA = new Set(['1170', '1171', '2200', '2205']);
const notion = (id: string) => NOTIONS.find((n) => n.id === id)!;

/**
 * Notion d'une opération d'après les comptes de son corrigé, le niveau de l'exercice et le texte de l'opération.
 * En 1ère CFC, un salaire est une charge comme une autre (manuel du cours, ch. 12) ; les intérêts ne forment une
 * notion qu'en maturité.
 */
export function notionDe(
  lignes: readonly LigneEcriture[],
  contexte: { niveau?: Niveau; texte?: string; impotAnticipe?: boolean } = {},
): Notion {
  const tous = new Set(lignes.flatMap((l) => [l.debit, l.credit]).filter((c): c is string => !!c));
  const comptes = new Set([...tous].filter((c) => !TVA.has(c)));
  // Rien d'autre que la TVA et des liquidités : décompte ou paiement à l'AFC. Le versement de l'impôt anticipé sur un
  // dividende (2205, même compte que la TVA) relève des sociétés.
  if ([...comptes].every((c) => /^10/.test(c)) && [...tous].some((c) => TVA.has(c))) {
    return contexte.impotAnticipe || /imp[ôo]t anticip/i.test(contexte.texte ?? '') ? notion('societes') : notion('tva');
  }
  for (const n of NOTIONS) {
    if (!n.comptes?.some((c) => comptes.has(c))) continue;
    if (n.id === 'salaires' && contexte.niveau === 'CFC1') return notion('charges-produits');
    if (n.id === 'interets' && contexte.niveau !== 'MP') continue;
    return n;
  }
  // Un compte de gestion (classes 3 à 8) : charges et produits ; sinon, seulement des comptes du bilan.
  if ([...comptes].some((c) => /^[345678]/.test(c))) return NOTIONS.find((n) => n.id === 'charges-produits')!;
  return NOTIONS.find((n) => n.id === 'bilan')!;
}

export interface ResultatNotion {
  notion: Notion;
  /** Pièces de l'énoncé rattachées à la notion. */
  pieces: string[];
  /** Opérations justes / opérations notées, pour toute la classe. */
  reussites: number;
  total: number;
  /** Élèves sous 50 % de réussite sur la notion : groupe de remédiation. */
  aReprendre: string[];
  /** Erreur typique la plus fréquente, avec les élèves concernés. */
  erreurFrequente: { explication: string; eleves: string[] } | null;
}

export function analyseParNotion(ex: Exercice, copies: readonly CopieNommee[]): ResultatNotion[] {
  const corrige = new Map((ex.corrige ?? []).map((c) => [c.piece, c]));
  const notionPiece = new Map<string, Notion>();
  // Un exercice qui verse un dividende (2230) sans aucune TVA : un paiement de 2205 y est l'impôt anticipé
  // (le texte d'une pièce, par exemple « Avis de débit », ne le dit pas toujours).
  const comptesEx = new Set((ex.corrige ?? []).flatMap((c) => c.lignes.flatMap((l) => [l.debit, l.credit])));
  const impotAnticipe = comptesEx.has('2230') && !['2200', '1170', '1171'].some((n) => comptesEx.has(n));
  for (const o of ex.operations) {
    const c = corrige.get(o.numero);
    // Texte de l'opération et, pour un dossier de pièces, le contenu de la pièce (désignations, mentions).
    const texte = `${o.texte} ${o.piece ? JSON.stringify(o.piece) : ''}`;
    if (c) notionPiece.set(o.numero, notionDe(c.lignes, { niveau: ex.niveau, texte, impotAnticipe }));
  }
  const res = new Map<string, ResultatNotion & { parEleve: Map<string, [number, number]>; erreurs: Map<string, { explication: string; eleves: Set<string> }> }>();
  for (const copie of copies) {
    for (const o of corrigerCopie(ex, copie.dossier).operations) {
      const n = notionPiece.get(o.piece);
      if (!n) continue;
      let r = res.get(n.id);
      if (!r) {
        r = { notion: n, pieces: [], reussites: 0, total: 0, aReprendre: [], erreurFrequente: null, parEleve: new Map(), erreurs: new Map() };
        res.set(n.id, r);
      }
      if (!r.pieces.includes(o.piece)) r.pieces.push(o.piece);
      r.total++;
      const e = r.parEleve.get(copie.nom) ?? [0, 0];
      e[1]++;
      if (o.diagnostic === 'juste') {
        r.reussites++;
        e[0]++;
      } else if (o.diagnostic !== 'manquante') {
        const { eleve, corrige: attendu } = comparaisonOperation(ex, copie.dossier, o.piece);
        const t = erreurTypique(eleve, attendu);
        if (t) {
          const x = r.erreurs.get(t.id) ?? { explication: t.explication, eleves: new Set<string>() };
          x.eleves.add(copie.nom);
          r.erreurs.set(t.id, x);
        }
      }
      r.parEleve.set(copie.nom, e);
    }
  }
  const ordre = NOTIONS.map((n) => n.id);
  return [...res.values()]
    .map(({ parEleve, erreurs, ...r }) => {
      const plus = [...erreurs.values()].sort((a, b) => b.eleves.size - a.eleves.size)[0];
      return {
        ...r,
        aReprendre: [...parEleve].filter(([, [j, t]]) => j / t < 0.5).map(([nom]) => nom).sort((a, b) => a.localeCompare(b, 'fr')),
        erreurFrequente: plus ? { explication: plus.explication, eleves: [...plus.eleves].sort((a, b) => a.localeCompare(b, 'fr')) } : null,
      };
    })
    .sort((a, b) => ordre.indexOf(a.notion.id) - ordre.indexOf(b.notion.id));
}
