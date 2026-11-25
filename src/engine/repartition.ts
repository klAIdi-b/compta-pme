// Répartition du bénéfice d'une SA ou d'une Sàrl selon le droit révisé (art. 672 CO, dès le 01.01.2023).
//
// - Une perte reportée est d'abord compensée.
// - 5 % du bénéfice de l'exercice (après compensation) vont à la réserve légale issue du bénéfice,
//   jusqu'à ce que celle-ci, additionnée à la réserve légale issue du capital, atteigne 50 % du capital
//   inscrit au registre du commerce (20 % pour une société holding).
// - Viennent ensuite les dividendes, les tantièmes et les réserves libres ; le solde reste reporté.
// - Des tantièmes ne peuvent être attribués qu'après un dividende d'au moins 5 % (art. 677 CO, vérifié sur Fedlex,
//   état au 01.01.2026 ; un taux supérieur prévu par les statuts n'est pas géré).
// - Impôt anticipé : 35 % du dividende brut, retenu au paiement.
// Montants arrondis aux 5 centimes.

import type { Centimes } from './money';
import { arrondi5 } from './money';

export const TAUX_IMPOT_ANTICIPE = 35; // %
/** Dividende minimal, en centièmes de pour cent du capital, avant toute attribution de tantièmes (art. 677 CO). */
export const DIVIDENDE_MINIMAL_TANTIEMES = 500;

export interface DonneesRepartition {
  /** Bénéfice de l'exercice (positif). */
  benefice: Centimes;
  /** Solde reporté avant répartition : positif = bénéfice reporté, négatif = perte reportée. */
  reporte: Centimes;
  /** Capital-actions ou capital social inscrit au registre du commerce. */
  capital: Centimes;
  reserveLegaleCapital: Centimes;
  reserveLegaleBenefice: Centimes;
  holding: boolean;
  /** Dividende en centièmes de pour cent du capital (5 % = 500). */
  tauxDividende: number;
  tantiemes: Centimes;
  reservesLibres: Centimes;
}

export interface TableauRepartition {
  /** Bénéfice disponible : bénéfice de l'exercice + bénéfice reporté (ou − perte reportée). */
  disponible: Centimes;
  reserveLegale: Centimes;
  dividendes: Centimes;
  tantiemes: Centimes;
  reservesLibres: Centimes;
  nouveauReporte: Centimes;
  impotAnticipe: Centimes;
  dividendeNet: Centimes;
}

export type ResultatRepartition = { ok: true; tableau: TableauRepartition } | { ok: false; erreur: string };

/** Attribution à la réserve légale issue du bénéfice (art. 672 CO). */
export function attributionReserveLegale(d: Pick<DonneesRepartition, 'benefice' | 'reporte' | 'capital' | 'reserveLegaleCapital' | 'reserveLegaleBenefice' | 'holding'>): Centimes {
  const base = d.benefice + Math.min(d.reporte, 0); // compensation d'une perte reportée
  if (base <= 0) return 0;
  const plafond = Math.floor((d.capital * (d.holding ? 20 : 50)) / 100);
  const marge = Math.max(0, plafond - d.reserveLegaleCapital - d.reserveLegaleBenefice);
  return Math.min(arrondi5(Math.round(base * 5) / 100), marge);
}

export function repartir(d: DonneesRepartition): ResultatRepartition {
  const disponible = d.benefice + d.reporte;
  if (d.tantiemes > 0 && d.tauxDividende < DIVIDENDE_MINIMAL_TANTIEMES) {
    return { ok: false, erreur: "Des tantièmes ne peuvent être attribués qu'après un dividende d'au moins 5 % du capital (art. 677 CO)." };
  }
  const reserveLegale = attributionReserveLegale(d);
  const dividendes = arrondi5(Math.round((d.capital * d.tauxDividende) / 10000));
  const nouveauReporte = disponible - reserveLegale - dividendes - d.tantiemes - d.reservesLibres;
  if (nouveauReporte < 0) {
    // Aucune attribution demandée : c'est la perte reportée qui dépasse le bénéfice.
    if (reserveLegale + dividendes + d.tantiemes + d.reservesLibres === 0) {
      return { ok: false, erreur: "La perte reportée dépasse le bénéfice de l'exercice : il n'y a rien à répartir." };
    }
    return {
      ok: false,
      erreur:
        'Le bénéfice disponible ne suffit pas pour les attributions prévues (réserve légale, dividendes, tantièmes, réserves libres).',
    };
  }
  const impotAnticipe = arrondi5(Math.round((dividendes * TAUX_IMPOT_ANTICIPE) / 100));
  return {
    ok: true,
    tableau: {
      disponible,
      reserveLegale,
      dividendes,
      tantiemes: d.tantiemes,
      reservesLibres: d.reservesLibres,
      nouveauReporte,
      impotAnticipe,
      dividendeNet: dividendes - impotAnticipe,
    },
  };
}
