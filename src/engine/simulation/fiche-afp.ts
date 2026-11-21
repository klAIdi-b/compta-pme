// Fiche de calcul AFP (phase S6, choix de l'enseignant du 21.11.2026) : après chaque tour, une fiche par groupe à
// imprimer. Les données du tour sont fournies ; les élèves calculent le chiffre d'affaires, le coût d'achat des
// marchandises vendues, la marge, le bénéfice et le stock final. Le corrigé est destiné à l'enseignant.

import type { Centimes } from '../money';
import { formatMontant } from '../money';
import type { Partie } from './types';
import { etatInitial, libellePeriode } from './tour';

export interface LigneFiche {
  libelle: string;
  valeur: string;
}

export interface QuestionFiche {
  libelle: string;
  /** Aide au calcul, imprimée sur la fiche élève. */
  aide: string;
  reponse: string;
}

export interface FicheAfp {
  entreprise: string;
  periode: string;
  donnees: LigneFiche[];
  questions: QuestionFiche[];
  /** Bénéfice de la fiche (prix d'achat moyen arrondi au centime) ; peut différer de quelques centimes du simulateur. */
  benefice: Centimes;
}

export function ficheAfp(p: Partie, entrepriseId: string, numeroTour: number): FicheAfp {
  const x = p.entreprises.find((e) => e.id === entrepriseId);
  const tour = p.tours.find((t) => t.numero === numeroTour);
  const res = tour?.resultats.find((r) => r.entrepriseId === entrepriseId);
  if (!x || !tour || !res) throw new Error('Tour ou entreprise introuvable.');
  const s = p.reglages.secteur;
  const avant = numeroTour > 1 ? p.tours[numeroTour - 2]!.resultats.find((r) => r.entrepriseId === entrepriseId)!.etatFin : etatInitial(s, p.reglages.niveau);
  const d = res.decisions;
  const prixMoyenAchat = res.vendues > 0 ? Math.round(res.coutMarchandisesVendues / res.vendues) : res.prixAchatUnitaire;
  const ca = res.vendues * d.prixVente;
  const cout = res.vendues * prixMoyenAchat;
  const marge = ca - cout;
  const charges = res.charges;
  const benefice = marge - charges;
  const stockFinal = avant.stockUnites + d.quantiteAchetee - res.vendues;
  const u = (n: number) => `${n} ${n > 1 ? s.produits : s.produit}`;
  return {
    entreprise: x.nom,
    periode: libellePeriode(p.reglages, numeroTour),
    donnees: [
      { libelle: 'Stock au début', valeur: u(avant.stockUnites) },
      { libelle: 'Achats du tour', valeur: u(d.quantiteAchetee) },
      { libelle: 'Ventes du tour', valeur: u(res.vendues) },
      { libelle: 'Prix de vente', valeur: `CHF ${formatMontant(d.prixVente)}` },
      { libelle: "Prix d'achat moyen d'une unité vendue", valeur: `CHF ${formatMontant(prixMoyenAchat)}` },
      { libelle: 'Loyer', valeur: `CHF ${formatMontant(s.loyerMensuel * (p.reglages.dureeTour === 'mois' ? 1 : 3))}` },
      { libelle: 'Publicité', valeur: `CHF ${formatMontant(d.publicite)}` },
    ],
    questions: [
      { libelle: "Chiffre d'affaires", aide: 'ventes × prix de vente', reponse: `CHF ${formatMontant(ca)}` },
      { libelle: "Coût d'achat des marchandises vendues", aide: "ventes × prix d'achat moyen", reponse: `CHF ${formatMontant(cout)}` },
      { libelle: 'Marge brute', aide: "chiffre d'affaires − coût d'achat", reponse: `CHF ${formatMontant(marge)}` },
      { libelle: 'Charges', aide: 'loyer + publicité', reponse: `CHF ${formatMontant(charges)}` },
      { libelle: benefice >= 0 ? 'Bénéfice' : 'Perte', aide: 'marge brute − charges', reponse: `CHF ${formatMontant(benefice)}` },
      { libelle: 'Stock à la fin', aide: 'stock au début + achats − ventes', reponse: u(stockFinal) },
    ],
    benefice,
  };
}
