// Dossiers CFC, niveau 1, tirés des cas du manuel E&S 2019 (vol. 1 ch. 1 et vol. 2 ch. 12) : droits d'utilisation
// obtenus par l'enseignant (09.11.2026), cas reformulés. Entreprises, personnes et numéros fictifs.
import { avisBancaire, facture, noteCredit, noteInterne, quittance, ticket } from '../../engine/pieces';
import { BANQUE, C, construireDossier, D, f, S } from './outils';

// ─────────────────────────── Dossier : Garage du Pont-Rouge (ch. 1, comptes de bilan et prestations) ───────────────────────────
const garage = { nom: 'Garage du Pont-Rouge', adresse: ['Route du Pont-Butin 41', '1213 Petit-Lancy'] };
const compteGarage = 'CH46 0000 4471 5510 3302 7';
const equipauto = { nom: 'Équip-Auto Romandie SA', adresse: ['Rue de Lyon 77', '1203 Genève'] };

const g1 = facture({
  emetteur: equipauto, destinataire: garage, numero: 'EA-26-118', date: '2026-01-07',
  articles: [{ designation: 'Pont élévateur à deux colonnes, 3,5 t, montage compris', prixUnitaire: f(18000) }],
  mentions: ['Payable à 30 jours net.'],
});
const g2 = noteCredit({
  emetteur: equipauto, destinataire: garage, numero: 'NC-26-009', date: '2026-01-14',
  reference: 'facture EA-26-118 du 07.01.2026',
  motif: 'Rabais accordé pour des rayures sur la colonne gauche du pont élévateur, constatées à la livraison.',
  articles: [{ designation: 'Rabais de 5 % sur le pont élévateur', prixUnitaire: f(900) }],
});
const g3 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-02-05',
  operations: [{ designation: 'Paiement à Équip-Auto Romandie SA — facture EA-26-118, déduction faite de la note de crédit NC-26-009', montant: g1.ttc - g2.montant }] });
const g4 = facture({
  emetteur: garage, destinataire: { nom: 'M. Patrick Dunand', adresse: ['Avenue des Communes-Réunies 12', '1212 Grand-Lancy'] },
  numero: 'GPR-0214', date: '2026-02-09',
  articles: [
    { designation: 'Service des 60 000 km, main-d’œuvre et fournitures', prixUnitaire: f(1240) },
    { designation: 'Remplacement des plaquettes de frein avant', prixUnitaire: f(610) },
  ],
  mentions: ['Payable à 30 jours.', `IBAN ${compteGarage}`],
});
const g5 = quittance({
  emetteur: garage, destinataire: { nom: 'Mme Inès Morand' }, date: '2026-02-12', numero: 'Q-031',
  texte: ['Reçu de Mme Inès Morand, en espèces, pour le remplacement de deux pneus et l’équilibrage, travaux faits le jour même.'],
  montant: f(420), mentions: ['Pour acquit : F. Pittet'],
});
const g6 = facture({
  emetteur: { nom: 'Outillage Pro Genève Sàrl', adresse: ['Chemin du Pont-du-Centenaire 110', '1228 Plan-les-Ouates'] },
  destinataire: garage, numero: 'OP-4471', date: '2026-02-18',
  articles: [
    { designation: 'Clé dynamométrique 40–200 Nm', quantite: 2, prixUnitaire: f(380) },
    { designation: "Servante d'atelier équipée", prixUnitaire: f(1540) },
  ],
  mentions: ['Payable à 30 jours.'],
});
const g7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-02-28',
  operations: [{ designation: 'Ordre permanent — loyer de l’atelier, février', montant: f(2600) }] });
const g8 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-03-06',
  operations: [{ designation: 'Virement de M. Patrick Dunand — facture GPR-0214', montant: g4.ttc }] });
const g9 = quittance({
  emetteur: garage, date: '2026-03-10', titre: 'BON DE PRÉLÈVEMENT', numero: 'P-03',
  texte: ['Retrait de la caisse de l’atelier par le propriétaire, M. Fabien Pittet, pour ses besoins personnels.'],
  montant: f(400), mentions: ['Signature : F. Pittet'],
});
const g10 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-03-16',
  operations: [{ designation: 'Versement de M. Fabien Pittet — apport au capital de l’entreprise', montant: f(10000) }] });
const g11 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-03-31',
  operations: [{ designation: 'Amortissement contractuel de votre prêt n° 55-2048', montant: f(5000) }] });
const g12 = facture({
  emetteur: { nom: 'Utilitaires du Léman SA', adresse: ['Route de Saint-Julien 280', '1258 Perly'] },
  destinataire: garage, numero: 'UL-26-0077', date: '2026-03-24',
  articles: [
    { designation: 'Dépanneuse plateau, occasion, expertisée', prixUnitaire: f(46000) },
    { designation: 'Reprise de votre ancienne dépanneuse (valeur convenue)', prixUnitaire: f(-14000) },
  ],
  mentions: ['Solde payable à 30 jours.'],
});

export const dossierGarage = construireDossier(
  {
    id: 'dossier-cfc1-garage-pont-rouge',
    titre: 'Garage du Pont-Rouge — dossier de pièces, premier trimestre',
    niveau: 'CFC1',
    filiere: 'CFC',
    difficulte: 1,
    sujets: ["Bilan d'ouverture", 'Comptes de bilan', 'Note de crédit', 'Prestations de services (travaux)', 'Écritures composées', 'Bouclement'],
    raisonSociale: 'Garage du Pont-Rouge',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour cet exercice, la TVA est laissée de côté. Les réparations facturées aux clients sont des produits des travaux. " +
      "Commencez par la fiche « Bilan d'ouverture », comptabilisez les douze pièces, puis passez les écritures de " +
      'bouclement au 31.12.2026 (aucune autre opération jusqu’à cette date).',
    situation:
      "Fabien Pittet a repris il y a cinq ans le Garage du Pont-Rouge, au Petit-Lancy. Avec un mécanicien et un apprenti, " +
      "il entretient et répare les voitures des habitants du quartier et assure le dépannage avec sa propre dépanneuse.\n\n" +
      "Ce trimestre, il modernise l'atelier : un nouveau pont élévateur, de l'outillage et une dépanneuse plus récente, " +
      "en échange de l'ancienne. Il vous remet les factures, les notes de crédit, les avis de la banque et les quittances " +
      "de l'atelier, et vous demande de les comptabiliser puis de boucler l'exercice.",
    ouvertureActif: { '1000': f(1200), '1020': f(24000), '1100': f(3500), '1500': f(35000), '1530': f(14000), '1540': f(6000) },
    ouverturePassif: { '2010': f(2800), '2400': f(30000), '2800': f(50900) },
    parametres: {
      corrigerBouclement: true,
      ficheBilanOuverture: true,
      comptesAjoutes: ['1540', '3410'],
      comptesMasques: ['1200', '3200', '4200', '4280'],
    },
  },
  [
    { date: '2026-01-07', piece: g1.piece, lignes: S('1500', '2010', g1.ttc) },
    { date: '2026-01-14', piece: g2.piece, lignes: S('2010', '1500', g2.montant) },
    { date: '2026-02-05', piece: g3.piece, lignes: S('2010', '1020', g3.total) },
    { date: '2026-02-09', piece: g4.piece, lignes: S('1100', '3410', g4.ttc) },
    { date: '2026-02-12', piece: g5.piece, lignes: S('1000', '3410', g5.montant) },
    { date: '2026-02-18', piece: g6.piece, lignes: S('1540', '2010', g6.ttc) },
    { date: '2026-02-28', piece: g7.piece, lignes: S('6000', '1020', g7.total) },
    { date: '2026-03-06', piece: g8.piece, lignes: S('1020', '1100', g8.total) },
    { date: '2026-03-10', piece: g9.piece, lignes: S('2850', '1000', g9.montant) },
    { date: '2026-03-16', piece: g10.piece, lignes: S('1020', '2800', g10.total) },
    { date: '2026-03-24', piece: g12.piece, lignes: [D('1530', f(46000)), C('1530', f(14000)), C('2010', g12.ttc)] },
    { date: '2026-03-31', piece: g11.piece, lignes: S('2400', '1020', g11.total) },
  ],
);

// ─────────────────────────── Dossier : Hi-Fi Plainpalais (ch. 12, commerce, rabais et escomptes) ───────────────────────────
const hifi = { nom: 'Hi-Fi Plainpalais', adresse: ['Rue de Carouge 38', '1205 Genève'] };
const compteHifi = 'CH73 0000 4471 6620 1187 4';
const acoustique = { nom: 'Acoustique Rhône Distribution SA', adresse: ['Rue Eugène-Marziano 25', '1227 Les Acacias'] };
const clientTv = { nom: 'Mme Lucie Bornand', adresse: ['Rue de la Servette 51', '1202 Genève'] };

const h1 = facture({
  emetteur: acoustique, destinataire: hifi, numero: 'ARD-26-0412', date: '2026-01-08',
  articles: [{ designation: 'Enceintes colonne « Studio 80 », la pièce', quantite: 20, prixUnitaire: f(475) }],
  mentions: ["Payable à 30 jours net ou à 10 jours avec 2 % d'escompte."],
});
const h2 = noteCredit({
  emetteur: acoustique, destinataire: hifi, numero: 'NC-26-031', date: '2026-01-12',
  reference: 'facture ARD-26-0412 du 08.01.2026',
  motif: 'Reprise de deux enceintes non conformes, retournées par le client.',
  articles: [{ designation: 'Enceintes colonne « Studio 80 » retournées', quantite: 2, prixUnitaire: f(475) }],
});
const h3 = facture({
  emetteur: { nom: 'Transports Jura-Léman Sàrl', adresse: ['Route du Nant-d’Avril 150', '1217 Meyrin'] },
  destinataire: hifi, numero: 'TJL-8841', date: '2026-01-09',
  articles: [
    { designation: 'Transport des enceintes depuis l’entrepôt de Bâle', prixUnitaire: f(260) },
    { designation: 'Assurance transport', prixUnitaire: f(120) },
  ],
  mentions: ['Payable à 30 jours.'],
});
const h4 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: hifi, compte: compteHifi, date: '2026-01-16',
  operations: [{ designation: "Paiement à Acoustique Rhône Distribution SA — facture ARD-26-0412, moins note de crédit NC-26-031 et escompte 2 %", montant: f(8379) }] });
const h5 = ticket({
  emetteur: hifi, date: '2026-01-31', titre: 'RAPPORT DE CAISSE — VENTES DE JANVIER', numero: 'Z-01',
  articles: [
    { designation: 'Casques et écouteurs', montant: f(2380) },
    { designation: 'Enceintes', montant: f(2850) },
    { designation: 'Câbles et accessoires', montant: f(1010) },
  ],
  mentions: ['Encaissements en espèces.'],
});
const h6 = facture({
  emetteur: hifi, destinataire: clientTv, numero: 'HFP-2026-018', date: '2026-02-03',
  articles: [{ designation: 'Téléviseur 65 pouces, livraison et installation comprises', prixUnitaire: f(1950) }],
  mentions: ['Payable à 30 jours.', `IBAN ${compteHifi}`],
});
const h7 = noteCredit({
  emetteur: hifi, destinataire: clientTv, numero: 'NC-2026-02', date: '2026-02-10',
  reference: 'facture HFP-2026-018 du 03.02.2026',
  motif: 'Rabais de 10 % pour une rayure sur le pied du téléviseur, que la cliente accepte de garder.',
  articles: [{ designation: 'Rabais de 10 % sur le téléviseur', prixUnitaire: f(195) }],
});
const h8 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: hifi, compte: compteHifi, date: '2026-02-24',
  operations: [{ designation: 'Virement de Mme Lucie Bornand — facture HFP-2026-018, moins note de crédit NC-2026-02', montant: f(1755) }] });
const h9 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: hifi, compte: compteHifi, date: '2026-03-02',
  operations: [{ designation: "Virement de l'Hôtel des Tilleuls — votre facture HFP-2025-112 de 3'000.00, moins escompte 3 %", montant: f(2910) }] });
const h10 = facture({
  emetteur: { nom: 'Coursiers de Plainpalais', adresse: ['Boulevard du Pont-d’Arve 16', '1205 Genève'] },
  destinataire: hifi, numero: 'CP-26-0390', date: '2026-03-09',
  articles: [{ designation: 'Livraisons à domicile des appareils vendus en février', quantite: 8, prixUnitaire: f(20) }],
  mentions: ['Payable à 30 jours.'],
});
const h11 = quittance({
  emetteur: hifi, date: '2026-03-14', titre: 'BON DE PRÉLÈVEMENT DE MARCHANDISES', numero: 'PM-01',
  texte: ['Le propriétaire, M. Yann Rochette, prend pour son usage personnel un casque sans fil « Silence Pro », au prix coûtant.'],
  montant: f(240), mentions: ['Signature : Y. Rochette'],
});
const h12 = noteInterne({
  emetteur: hifi, date: '2026-12-31', titre: "NOTE INTERNE — INVENTAIRE DE FIN D'EXERCICE",
  texte: [
    "L'inventaire du 31.12.2026, évalué au prix coûtant, s'élève à 63'400.00.",
    'Stock au bilan d’ouverture : 60’000.00.',
  ],
  totaux: [{ libelle: 'Valeur du stock à l’inventaire', montant: f(63400), fort: true }],
});

export const dossierHifi = construireDossier(
  {
    id: 'dossier-cfc1-hifi-plainpalais',
    titre: 'Hi-Fi Plainpalais — dossier de pièces, marchandises',
    niveau: 'CFC1',
    filiere: 'CFC',
    difficulte: 1,
    sujets: [
      'Achats et ventes de marchandises',
      'Note de crédit (retour, rabais)',
      "Escomptes, frais d'achat et frais de ventes",
      'Prélèvements de marchandises',
      'Variation de stock',
      'Marge brute',
    ],
    raisonSociale: 'Hi-Fi Plainpalais',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour cet exercice, la TVA est laissée de côté. Comptabilisez les douze pièces ; la dernière est l'inventaire de fin " +
      "d'exercice. Remplissez ensuite la fiche « Marge brute » d'après vos comptes, puis passez les écritures de " +
      'bouclement au 31.12.2026.',
    situation:
      "Yann Rochette tient depuis dix ans Hi-Fi Plainpalais, un magasin de son et d'image de la rue de Carouge : enceintes, " +
      "casques, téléviseurs, et l'installation à domicile pour les clients qui le souhaitent.\n\n" +
      "Il achète surtout chez un grossiste des Acacias qui accorde un escompte pour paiement rapide, et il n'hésite pas à " +
      "consentir un rabais quand un appareil est livré avec un défaut. Il vous confie les pièces du trimestre : factures, " +
      "notes de crédit, avis de la banque, rapport de caisse et bons de prélèvement.",
    ouvertureActif: { '1000': f(1500), '1020': f(40000), '1100': f(8000), '1200': f(60000), '1510': f(30000) },
    ouverturePassif: { '2000': f(12000), '2400': f(50000), '2800': f(77500) },
    parametres: { corrigerBouclement: true, ficheMargeBrute: true },
  },
  [
    { date: '2026-01-08', piece: h1.piece, lignes: S('4200', '2000', h1.ttc) },
    { date: '2026-01-09', piece: h3.piece, lignes: S('4270', '2010', h3.ttc) },
    { date: '2026-01-12', piece: h2.piece, lignes: S('2000', '4200', h2.montant) },
    { date: '2026-01-16', piece: h4.piece, lignes: [D('2000', h1.ttc - h2.montant), C('1020', h4.total), C('4209', h1.ttc - h2.montant - h4.total)] },
    { date: '2026-01-31', piece: h5.piece, lignes: S('1000', '3200', h5.ttc) },
    { date: '2026-02-03', piece: h6.piece, lignes: S('1100', '3200', h6.ttc) },
    { date: '2026-02-10', piece: h7.piece, lignes: S('3209', '1100', h7.montant) },
    { date: '2026-02-24', piece: h8.piece, lignes: S('1020', '1100', h8.total) },
    { date: '2026-03-02', piece: h9.piece, lignes: [D('1020', h9.total), D('3209', f(90)), C('1100', f(3000))] },
    { date: '2026-03-09', piece: h10.piece, lignes: S('3210', '2010', h10.ttc) },
    { date: '2026-03-14', piece: h11.piece, lignes: S('2850', '3720', h11.montant) },
    { date: '2026-12-31', piece: h12.piece, lignes: S('1200', '4280', f(3400)) },
  ],
);
