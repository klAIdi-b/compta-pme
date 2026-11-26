// Variante d'un exercice : tous les montants sont multipliés par un facteur entier (2, 3…), ce qui garde chaque
// écriture équilibrée et chaque rapport (taux de TVA, pourcentages, quantités) inchangé. Le corrigé de la variante
// n'est pas public : elle sert aux évaluations. Les arrondis aux 5 centimes recalculés par l'élève restent dans la
// tolérance de correction (5 centimes).

import type { Centimes } from './money';
import { formatMontant, lireMontant } from './money';
import { tvaSurHT, tvaSurTTC } from './tva';
import type { Exercice } from './exercice';
import type { PieceComptable } from './pieces';

/**
 * Multiplie les montants écrits dans un texte (format suisse avec décimales : 1'234.50, 85.00). Les nombres inférieurs
 * à 1.00 (cours de change, coefficients) et les nombres sans décimales (quantités, années, pour cent) sont laissés tels quels.
 */
export function multiplierTexte(texte: string, facteur: number): string {
  return texte.replace(/(?<![\d'.,])(\d{1,3}(?:'\d{3})*|\d+)\.(\d{2})(?![\d])/g, (tout, entier: string, dec: string) => {
    const centimes = Number(entier.replace(/'/g, '')) * 100 + Number(dec);
    if (centimes < 100) return tout;
    return formatMontant(centimes * facteur);
  });
}

const fois = (c: Centimes, k: number) => c * k;
const record = (r: Record<string, Centimes>, k: number) => Object.fromEntries(Object.entries(r).map(([n, v]) => [n, fois(v, k)]));

function multiplierPiece(p: PieceComptable, k: number): PieceComptable {
  const t = (x: string) => multiplierTexte(x, k);
  return {
    ...p,
    texte: p.texte?.map(t),
    mentions: p.mentions?.map(t),
    lignes: p.lignes.map((l) => ({
      ...l,
      designation: t(l.designation),
      montant: fois(l.montant, k),
      ...(l.prixUnitaire !== undefined ? { prixUnitaire: fois(l.prixUnitaire, k) } : {}),
    })),
    totaux: p.totaux.map((x) => ({ ...x, montant: fois(x.montant, k) })),
  };
}

/** Variante d'évaluation : nouvel identifiant, montants × facteur, mode évaluation. */
export function varianteExercice(ex: Exercice, facteur: number, id: string): Exercice {
  if (!Number.isInteger(facteur) || facteur < 2) throw new Error('Le facteur doit être un entier au moins égal à 2.');
  const k = facteur;
  const t = (x: string) => multiplierTexte(x, k);
  const p = ex.parametres;
  return {
    ...structuredClone(ex),
    id,
    titre: `${ex.titre.replace(/ — dossier de pièces/, '')} — variante d'évaluation`,
    mode: 'evaluation',
    introduction: t(ex.introduction),
    situation: ex.situation === undefined ? undefined : t(ex.situation),
    ouvertureActif: record(ex.ouvertureActif, k),
    ouverturePassif: record(ex.ouverturePassif, k),
    operations: ex.operations.map((o) => ({ ...o, texte: t(o.texte), ...(o.piece ? { piece: multiplierPiece(o.piece, k) } : {}) })),
    corrige: (ex.corrige ?? []).map((c) => ({ ...c, lignes: c.lignes.map((l) => ({ ...l, montant: fois(l.montant, k) })) })),
    parametres: {
      ...structuredClone(p),
      ...(p.repartition
        ? {
            repartition: {
              ...p.repartition,
              benefice: fois(p.repartition.benefice, k),
              reporte: fois(p.repartition.reporte, k),
              capital: fois(p.repartition.capital, k),
              reserveLegaleCapital: fois(p.repartition.reserveLegaleCapital, k),
              reserveLegaleBenefice: fois(p.repartition.reserveLegaleBenefice, k),
              tantiemes: fois(p.repartition.tantiemes, k),
              reservesLibres: fois(p.repartition.reservesLibres, k),
            },
          }
        : {}),
      ...(p.seuil
        ? { seuil: { ...p.seuil, prixVente: fois(p.seuil.prixVente, k), coutVariable: fois(p.seuil.coutVariable, k), chargesFixes: fois(p.seuil.chargesFixes, k) } }
        : {}),
      ...(p.echellePrix
        ? {
            echellePrix: {
              ...p.echellePrix,
              pab: fois(p.echellePrix.pab, k),
              fraisAchat:
                p.echellePrix.fraisAchat.type === 'chf'
                  ? { type: 'chf' as const, valeur: fois(p.echellePrix.fraisAchat.valeur, k) }
                  : p.echellePrix.fraisAchat,
            },
          }
        : {}),
    },
  };
}

// ---------- Contrôle d'une variante (second audit, 26.11.2026) ----------

const tauxDe = (texte: string): number | null => {
  const m = /TVA\s+(\d+),(\d)\s*%/.exec(texte);
  return m ? Number(m[1]) * 10 + Number(m[2]) : null;
};

/**
 * Pièces dont la TVA écrite ne correspond plus au calcul : une TVA arrondie aux 5 centimes puis multipliée n'est pas
 * toujours la TVA arrondie du montant multiplié (41.85 au lieu de 41.90). Rend la liste des opérations touchées.
 */
export function piecesIncoherentes(ex: Exercice): string[] {
  const fausses: string[] = [];
  for (const o of ex.operations) {
    const p = o.piece;
    if (!p) continue;
    const ht = p.totaux.find((t) => /hors TVA/i.test(t.libelle))?.montant;
    const ligneTva = p.totaux.find((t) => tauxDe(t.libelle) !== null);
    if (ht !== undefined && ligneTva && tvaSurHT(ht, tauxDe(ligneTva.libelle)!) !== ligneTva.montant) fausses.push(o.numero);
    for (const mention of p.mentions ?? []) {
      const m = /TVA\s+(\d+),(\d)\s*%\s+comprise\s*:\s*CHF\s+([\d'’.]+)/.exec(mention);
      const total = p.totaux.find((t) => t.fort)?.montant;
      if (!m || total === undefined) continue;
      const tva = lireMontant(m[3]!);
      if (tva !== null && tvaSurTTC(total, Number(m[1]) * 10 + Number(m[2])) !== tva) fausses.push(o.numero);
    }
  }
  return [...new Set(fausses)];
}

/**
 * Variante d'évaluation contrôlée : refusée si l'exercice a une fiche Facturation ou Budget (ses montants attendus ne
 * sont pas mis à l'échelle) ; sinon, le facteur qui laisse le moins de pièces à la TVA décalée, avec un avertissement
 * pour l'enseignant qui liste celles qui restent.
 */
export function varianteSure(
  ex: Exercice,
  souhaite: number,
  id: string,
): { ok: true; valeur: Exercice; avertissements: string[] } | { ok: false; erreurs: string[] } {
  if (ex.parametres.facturation || ex.parametres.budget) {
    return {
      ok: false,
      erreurs: ["Variante impossible : cet exercice a une fiche Facturation ou Budget, dont les montants attendus ne peuvent pas être multipliés. Créez une copie et modifiez-la à la main."],
    };
  }
  // Le facteur qui laisse le moins de pièces à la TVA décalée ; une TVA arrondie puis multipliée reste cohérente avec
  // le corrigé (l'élève comptabilise les montants de la pièce), mais elle peut différer de 5 centimes du calcul exact.
  let meilleur = varianteExercice(ex, Math.max(2, souhaite), id);
  let fausses = piecesIncoherentes(meilleur);
  for (let k = Math.max(2, souhaite) + 1; fausses.length > 0 && k <= souhaite + 8; k++) {
    const v = varianteExercice(ex, k, id);
    const f = piecesIncoherentes(v);
    if (f.length < fausses.length) [meilleur, fausses] = [v, f];
  }
  const avertissements = fausses.length
    ? [
        `Pièce${fausses.length > 1 ? 's' : ''} ${fausses.join(', ')} : la TVA indiquée diffère de 5 centimes du calcul exact (TVA arrondie puis ` +
          'multipliée). Le corrigé suit la pièce ; un élève qui recalcule la TVA reste dans la tolérance de 5 centimes. ' +
          'Vous pouvez corriger ces montants dans l’éditeur.',
      ]
    : [];
  return { ok: true, valeur: meilleur, avertissements };
}
