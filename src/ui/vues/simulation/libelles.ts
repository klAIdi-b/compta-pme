// Libellés de l'interface du simulateur.
import type { AffichageResultats, Comptabilite, Entreprise, Imprevu, NiveauSimulation, Secteur } from '../../../engine/simulation/types';

export const LIBELLE_NIVEAU: Record<NiveauSimulation, string> = { AFP: 'AFP', CFC1: '1ère CFC', CFC2: '2ème CFC', MP: 'MP' };

export const LIBELLE_COMPTABILITE: Record<Comptabilite, string> = {
  automatique: 'automatique',
  eleves: 'saisie par les élèves',
  mixte: 'mixte',
};

export const LIBELLE_AFFICHAGE: Record<AffichageResultats, string> = {
  classement: 'classement',
  sansRang: 'tableau sans rang',
  cache: 'chaque groupe ses chiffres',
};

export const DESCRIPTION_NIVEAU: Record<NiveauSimulation, string> = {
  AFP: 'AFP : prix, quantité et publicité ; comptabilité automatique, sans saisie.',
  CFC1: '1ère CFC : achats, ventes, banque, caisse, prélèvement privé, sans TVA.',
  CFC2: '2ème CFC : en plus, TVA au net (prix TVA comprise), personnel et salaires, véhicule de livraison amorti.',
  MP: 'MP : en plus de la 2ème CFC, société anonyme, emprunt bancaire et intérêts, répartition du bénéfice.',
};

/** Pourcentage en dixièmes (pour mille) → « 26,8 % ». */
export function pourMille(v: number): string {
  return `${(v / 10).toFixed(1).replace('.', ',')} %`;
}

/** Description d'un imprévu pour l'enseignant et la projection. */
export function libelleImprevu(imp: Imprevu, entreprises: readonly Entreprise[], secteur: Secteur): string {
  const nom = (id: string | null) => (id ? (entreprises.find((x) => x.id === id)?.nom ?? '?') : 'tout le marché');
  if (imp.type === 'hausseFournisseur') return `Hausse de ${imp.pourcent} % du prix d'achat des ${secteur.produits} (${nom(imp.entrepriseId)})`;
  return `Client insolvable : une facture client de ${nom(imp.entrepriseId)} ne sera pas payée (acte de défaut de biens)`;
}
