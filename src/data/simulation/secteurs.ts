// Simulateur d'entreprise : secteurs préparés et paramètres du marché.
// Validé par l'enseignant le 20.11.2026 (CFC 1) ; données CFC 2 (TVA, salaires, capacité, véhicule) validées le
// 21.11.2026. Entreprises, personnes et adresses fictives.

import type { ParametresMarche, Secteur } from '../../engine/simulation/types';

const f = (francs: number) => Math.round(francs * 100);

export const MARCHE_PAR_DEFAUT: ParametresMarche = {
  elasticitePrix: 2,
  elasticiteMarche: 1,
  effetMaxPublicite: 0.6,
};

export const SECTEUR_VELOS: Secteur = {
  id: 'velos',
  nom: 'Vélos et trottinettes',
  produit: 'vélo de ville',
  produits: 'vélos de ville',
  prixAchatReference: f(520),
  prixVenteReference: f(899),
  baissePrixAchatMensuellePourcent: 0,
  demandeMensuelleParEntreprise: 25,
  saison: [50, 60, 90, 130, 150, 150, 140, 120, 100, 80, 60, 70],
  partVentesACreditPourcent: 10,
  loyerMensuel: f(3200),
  publiciteReferenceMensuelle: f(1000),
  fournisseurs: {
    grossiste: { nom: 'Cyclo-Distribution Romandie SA', adresse: ['Route de Saint-Julien 120', '1228 Plan-les-Ouates'], ecartPrixPourcent: 0, aCredit: true },
    importateur: { nom: 'Velimport Sàrl', adresse: ['Chemin du Pont-du-Centenaire 109', '1228 Plan-les-Ouates'], ecartPrixPourcent: -8, aCredit: false },
  },
  bailleur: 'Régie des Eaux-Vives',
  agencePublicite: 'Agence Lacustre Communication',
  tauxTva: 81,
  salaireBrutMensuel: f(4900),
  lppMensuelle: f(245),
  capaciteParPersonneMensuelle: 25,
  vehicule: { designation: 'Fourgon de livraison, neuf', prixHt: f(32000), garage: 'Garage des Acacias SA', adresseGarage: ['Route des Acacias 48', '1227 Les Acacias'] },
  ouverture: { caisse: f(2000), banque: f(30000), stockUnites: 40, mobilier: f(15000) },
};

export const SECTEUR_EPICERIE: Secteur = {
  id: 'epicerie',
  nom: 'Épicerie fine',
  produit: 'coffret gourmand',
  produits: 'coffrets gourmands',
  prixAchatReference: f(28),
  prixVenteReference: f(49),
  baissePrixAchatMensuellePourcent: 0,
  demandeMensuelleParEntreprise: 350,
  saison: [80, 80, 85, 90, 85, 80, 75, 75, 90, 100, 130, 230],
  partVentesACreditPourcent: 5,
  loyerMensuel: f(2600),
  publiciteReferenceMensuelle: f(800),
  fournisseurs: {
    grossiste: { nom: 'Terroirs du Léman Distribution SA', adresse: ['Rue de Lyon 87', '1203 Genève'], ecartPrixPourcent: 0, aCredit: true },
    importateur: { nom: 'Delizie Import Sàrl', adresse: ['Route du Nant-d\'Avril 150', '1217 Meyrin'], ecartPrixPourcent: -8, aCredit: false },
  },
  bailleur: 'Régie de la Vieille-Ville',
  agencePublicite: 'Studio Rive Droite',
  tauxTva: 26,
  salaireBrutMensuel: f(4500),
  lppMensuelle: f(225),
  capaciteParPersonneMensuelle: 400,
  vehicule: { designation: 'Véhicule utilitaire réfrigéré, neuf', prixHt: f(38000), garage: 'Garage du Bachet SA', adresseGarage: ['Route de Saint-Julien 5', '1227 Carouge'] },
  ouverture: { caisse: f(1500), banque: f(20000), stockUnites: 300, mobilier: f(12000) },
};

export const SECTEUR_INFORMATIQUE: Secteur = {
  id: 'informatique',
  nom: 'Matériel informatique',
  produit: 'ordinateur portable',
  produits: 'ordinateurs portables',
  prixAchatReference: f(780),
  prixVenteReference: f(1150),
  baissePrixAchatMensuellePourcent: 1,
  demandeMensuelleParEntreprise: 22,
  saison: [90, 85, 90, 85, 80, 80, 90, 160, 140, 95, 100, 105],
  partVentesACreditPourcent: 40,
  loyerMensuel: f(2900),
  publiciteReferenceMensuelle: f(1200),
  fournisseurs: {
    grossiste: { nom: 'Infodis Suisse romande SA', adresse: ['Rue de la Bergère 10', '1217 Meyrin'], ecartPrixPourcent: 0, aCredit: true },
    importateur: { nom: 'Direct-PC Import Sàrl', adresse: ['Chemin du Champ-des-Filles 36', '1228 Plan-les-Ouates'], ecartPrixPourcent: -8, aCredit: false },
  },
  bailleur: 'Régie de Plainpalais',
  agencePublicite: 'Pixel & Plume Sàrl',
  tauxTva: 81,
  salaireBrutMensuel: f(5600),
  lppMensuelle: f(280),
  capaciteParPersonneMensuelle: 30,
  vehicule: { designation: 'Fourgon de livraison, neuf', prixHt: f(32000), garage: 'Garage de Châtelaine SA', adresseGarage: ['Avenue de Châtelaine 81', '1219 Châtelaine'] },
  ouverture: { caisse: f(2000), banque: f(35000), stockUnites: 25, mobilier: f(18000) },
};

export const SECTEURS: readonly Secteur[] = [SECTEUR_VELOS, SECTEUR_EPICERIE, SECTEUR_INFORMATIQUE];
