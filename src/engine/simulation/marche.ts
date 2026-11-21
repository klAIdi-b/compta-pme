// Règle du marché (cahier des charges § 5, règle simple décidée le 20.11.2026 : prix et publicité seulement).
//
// 1. Demande totale = clients de base × nombre d'entreprises × saison × (prix de référence / prix moyen)^elasticiteMarche
// 2. Attractivité d'une entreprise = (prix moyen / son prix)^elasticitePrix × (1 + effet de la publicité)
//    effet de la publicité = effetMax × budget / (budget + budget de référence) : au budget de référence, la moitié de
//    l'effet maximal ; chaque franc supplémentaire rapporte de moins en moins.
// 3. Clients attirés = demande totale × attractivité / somme des attractivités (répartition entière exacte).
// 4. Ventes = clients attirés, limitées par le stock disponible ; le reste repart sans acheter.
//
// Les calculs intermédiaires (rapports, puissances) sont des nombres réels ; les résultats (clients, montants) sont
// des entiers. Mêmes décisions → mêmes résultats.

import type { Centimes } from '../money';
import type { ParametresMarche, Secteur } from './types';

/**
 * Répartit un total entier proportionnellement à des poids (méthode des plus forts restes).
 * Équité : des entreprises à égalité reçoivent toujours le même nombre ; si les unités restantes ne suffisent pas pour
 * toutes les entreprises à égalité, aucune ne les reçoit (au plus n − 1 clients repartent sans acheter).
 */
export function repartirEntiers(total: number, poids: readonly number[]): number[] {
  const somme = poids.reduce((s, p) => s + p, 0);
  if (total <= 0 || somme <= 0) return poids.map(() => 0);
  const exacts = poids.map((p) => (total * p) / somme);
  const parts = exacts.map((x) => Math.floor(x + 1e-9));
  let reste = total - parts.reduce((s, p) => s + p, 0);
  const restes = exacts.map((x, i) => x - parts[i]!);
  const ordre = restes.map((r, i) => ({ i, r })).sort((a, b) => b.r - a.r || a.i - b.i);
  let k = 0;
  while (reste > 0 && k < ordre.length) {
    const groupe = ordre.slice(k).filter((o) => Math.abs(o.r - ordre[k]!.r) < 1e-9);
    if (groupe.length > reste) break;
    for (const { i } of groupe) parts[i]! += 1;
    reste -= groupe.length;
    k += groupe.length;
  }
  return parts;
}

export function prixMoyen(prix: readonly Centimes[]): Centimes {
  if (prix.length === 0) return 0;
  return Math.round(prix.reduce((s, p) => s + p, 0) / prix.length);
}

/** Coefficient de saison cumulé des mois du tour (100 = un mois moyen). */
export function saisonDesMois(secteur: Secteur, mois: readonly number[]): number {
  return mois.reduce((s, m) => s + (secteur.saison[m - 1] ?? 100), 0);
}

export function demandeTotale(
  secteur: Secteur,
  marche: ParametresMarche,
  nbEntreprises: number,
  mois: readonly number[],
  moyen: Centimes,
): number {
  if (nbEntreprises === 0 || moyen <= 0) return 0;
  const base = (secteur.demandeMensuelleParEntreprise * nbEntreprises * saisonDesMois(secteur, mois)) / 100;
  return Math.round(base * Math.pow(secteur.prixVenteReference / moyen, marche.elasticiteMarche));
}

export function effetPublicite(marche: ParametresMarche, budget: Centimes, reference: Centimes): number {
  if (budget <= 0 || reference <= 0) return 0;
  return (marche.effetMaxPublicite * budget) / (budget + reference);
}

export function attractivite(
  marche: ParametresMarche,
  prix: Centimes,
  moyen: Centimes,
  publicite: Centimes,
  publiciteReference: Centimes,
): number {
  return Math.pow(moyen / prix, marche.elasticitePrix) * (1 + effetPublicite(marche, publicite, publiciteReference));
}

export interface OffreEntreprise {
  prix: Centimes;
  publicite: Centimes;
  /** Unités disponibles à la vente pendant le tour (stock + réassort). */
  disponible: number;
}

export interface ResultatMarche {
  demandeTotale: number;
  prixMoyen: Centimes;
  demandes: number[];
  vendues: number[];
}

export function repartirMarche(
  secteur: Secteur,
  marche: ParametresMarche,
  mois: readonly number[],
  offres: readonly OffreEntreprise[],
): ResultatMarche {
  const moyen = prixMoyen(offres.map((o) => o.prix));
  const total = demandeTotale(secteur, marche, offres.length, mois, moyen);
  const reference = secteur.publiciteReferenceMensuelle * mois.length;
  const poids = offres.map((o) => attractivite(marche, o.prix, moyen, o.publicite, reference));
  const demandes = repartirEntiers(total, poids);
  const vendues = demandes.map((d, i) => Math.min(d, Math.max(0, offres[i]!.disponible)));
  return { demandeTotale: total, prixMoyen: moyen, demandes, vendues };
}
