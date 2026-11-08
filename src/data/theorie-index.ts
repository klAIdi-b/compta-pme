// Sommaire de la théorie : identifiant, titre et niveau de chaque chapitre, sans le contenu.
// Chargé avec le journal (lien « Revoir la théorie ») ; le contenu complet (theorie.ts) n'est chargé qu'à l'ouverture
// de la rubrique Théorie. tests/theorie.test.ts vérifie que ce sommaire reste identique aux chapitres.

import type { Niveau } from '../engine/plan';

export interface EntreeSommaire {
  id: string;
  titre: string;
  niveau: Niveau;
}

export const SOMMAIRE: EntreeSommaire[] = [
  { id: 'cadre-legal', titre: 'Le cadre légal de la comptabilité', niveau: 'CFC1' },
  { id: 'bilan', titre: 'Le bilan', niveau: 'CFC1' },
  { id: 'comptes', titre: 'Les comptes et les règles du débit et du crédit', niveau: 'CFC1' },
  { id: 'journal', titre: 'Le journal et les écritures', niveau: 'CFC1' },
  { id: 'resultat', titre: 'Compte de résultat, compte privé et bouclement', niveau: 'CFC1' },
  { id: 'marchandises', titre: 'Marchandises et stock', niveau: 'CFC1' },
  { id: 'tva', titre: 'TVA — méthode effective', niveau: 'CFC2' },
  { id: 'amortissements', titre: 'Amortissements', niveau: 'CFC2' },
  { id: 'transitoires', titre: 'Actifs et passifs transitoires', niveau: 'CFC2' },
  { id: 'creances', titre: 'Pertes sur créances, créances douteuses et ducroire', niveau: 'CFC2' },
  { id: 'salaires', titre: 'Salaires et assurances sociales', niveau: 'CFC2' },
  { id: 'monnaies', titre: 'Monnaies étrangères', niveau: 'MP' },
  { id: 'proprietaire', titre: 'Rémunération du propriétaire', niveau: 'MP' },
  { id: 'societes', titre: 'Sociétés (SA, Sàrl) et répartition du bénéfice', niveau: 'MP' },
  { id: 'provisions', titre: 'Provisions', niveau: 'MP' },
  { id: 'titres', titre: 'Titres et produits financiers', niveau: 'MP' },
  { id: 'immeubles', titre: 'Immeubles', niveau: 'MP' },
  { id: 'interets', titre: 'Intérêts, frais bancaires, escomptes et frais d\'achat', niveau: 'MP' },
  { id: 'evaluation', titre: "Principes d'évaluation et réserves latentes", niveau: 'MP' },
  { id: 'resultat-degres', titre: 'Compte de résultat à plusieurs degrés', niveau: 'MP' },
  { id: 'flux', titre: 'Tableau des flux de trésorerie', niveau: 'MP' },
  { id: 'seuil', titre: 'Seuil de rentabilité', niveau: 'MP' },
  { id: 'analyse', titre: 'Analyse du bilan et du compte de résultat', niveau: 'MP' },
];

/**
 * Chapitre de théorie à revoir pour une opération, d'après les comptes de son corrigé (premier thème reconnu).
 * Sert au lien « Revoir la théorie » sous l'indice ; null si aucun chapitre du niveau ne correspond.
 */
const THEMES: { id: string; comptes: string[] }[] = [
  { id: 'tva', comptes: ['1170', '1171', '2200', '2205'] },
  { id: 'salaires', comptes: ['5200', '5270', '2170', '2171', '2172', '1140'] },
  { id: 'creances', comptes: ['1108', '1109', '3805'] },
  { id: 'transitoires', comptes: ['1300', '2300'] },
  { id: 'amortissements', comptes: ['6800', '1509', '1519', '1529', '1539', '1609', '8510', '8500'] },
  { id: 'titres', comptes: ['1060', '6940', '6952', '1176'] },
  { id: 'immeubles', comptes: ['7500', '7510', '2401'] },
  { id: 'societes', comptes: ['1850', '1860', '2810', '2900', '2950', '2960', '2970', '2230', '6550'] },
  { id: 'provisions', comptes: ['2600', '2640', '2660', '2690'] },
  { id: 'interets', comptes: ['6900', '6950'] },
  { id: 'marchandises', comptes: ['1200', '3200', '3209', '4200', '4209', '4270', '4280'] },
];

export function chapitrePourComptes(comptes: readonly string[], niveau: Niveau): EntreeSommaire | null {
  const ordre: Niveau[] = ['CFC1', 'CFC2', 'MP'];
  const dispo = SOMMAIRE.filter((c) => ordre.indexOf(c.niveau) <= ordre.indexOf(niveau));
  const presents = new Set(comptes);
  for (const t of THEMES) {
    if (t.comptes.some((c) => presents.has(c))) {
      const ch = dispo.find((c) => c.id === t.id);
      if (ch) return ch;
    }
  }
  return dispo.find((c) => c.id === 'journal') ?? null;
}
