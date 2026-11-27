// Dossiers CFC, niveau 1, construits sur la structure de cas du manuel E&S 2019 (vol. 1 ch. 1 et vol. 2 ch. 12) :
// droits d'utilisation obtenus par l'enseignant (09.11.2026). Décision de l'enseignant du 27.11.2026 : mêmes écritures,
// noms et montants changés. Entreprises, personnes et numéros fictifs ; identifiants renommés le 27.11.2026.
import { avisBancaire, facture, noteCredit, noteInterne, quittance, ticket } from '../../engine/pieces';
import { BANQUE, C, construireDossier, D, f, S } from './outils';

// ─────────────────────────── Dossier : Garage de la Praille (comptes de bilan et prestations) ───────────────────────────
const garage = { nom: 'Garage de la Praille', adresse: ['Route des Jeunes 63', '1227 Carouge'] };
const compteGarage = 'CH46 0000 4471 5518 6402 3';
const equipement = { nom: 'Auto-Équipement Léman SA', adresse: ['Rue de Lausanne 112', '1202 Genève'] };

const g1 = facture({
  emetteur: equipement, destinataire: garage, numero: 'AEL-26-204', date: '2026-01-07',
  articles: [{ designation: 'Pont élévateur à deux colonnes, 4 t, montage compris', prixUnitaire: f(21000) }],
  mentions: ['Payable à 30 jours net.'],
});
const g2 = noteCredit({
  emetteur: equipement, destinataire: garage, numero: 'NC-26-014', date: '2026-01-14',
  reference: 'facture AEL-26-204 du 07.01.2026',
  motif: 'Rabais accordé pour des éclats de peinture sur la colonne droite du pont élévateur, constatés à la livraison.',
  articles: [{ designation: 'Rabais de 5 % sur le pont élévateur', prixUnitaire: f(1050) }],
});
const g3 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-02-05',
  operations: [{ designation: 'Paiement à Auto-Équipement Léman SA — facture AEL-26-204, déduction faite de la note de crédit NC-26-014', montant: g1.ttc - g2.montant }] });
const g4 = facture({
  emetteur: garage, destinataire: { nom: 'M. Jérôme Baud', adresse: ['Rue de la Fontenette 8', '1227 Carouge'] },
  numero: 'GLP-0231', date: '2026-02-09',
  articles: [
    { designation: 'Service des 90 000 km, main-d’œuvre et fournitures', prixUnitaire: f(1420) },
    { designation: 'Remplacement des disques et plaquettes de frein arrière', prixUnitaire: f(680) },
  ],
  mentions: ['Payable à 30 jours.', `IBAN ${compteGarage}`],
});
const g5 = quittance({
  emetteur: garage, destinataire: { nom: 'Mme Chloé Perroud' }, date: '2026-02-12', numero: 'Q-044',
  texte: ['Reçu de Mme Chloé Perroud, en espèces, pour le changement de deux pneus et la géométrie, travaux faits le jour même.'],
  montant: f(480), mentions: ['Pour acquit : S. Favez'],
});
const g6 = facture({
  emetteur: { nom: 'Outils Pros Sàrl', adresse: ['Route de Saint-Julien 140', '1228 Plan-les-Ouates'] },
  destinataire: garage, numero: 'OPS-5520', date: '2026-02-18',
  articles: [
    { designation: 'Clé dynamométrique 60–300 Nm', quantite: 2, prixUnitaire: f(420) },
    { designation: "Servante d'atelier équipée, sept tiroirs", prixUnitaire: f(1700) },
  ],
  mentions: ['Payable à 30 jours.'],
});
const g7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-02-28',
  operations: [{ designation: 'Ordre permanent — loyer de l’atelier, février', montant: f(2900) }] });
const g8 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-03-06',
  operations: [{ designation: 'Virement de M. Jérôme Baud — facture GLP-0231', montant: g4.ttc }] });
const g9 = quittance({
  emetteur: garage, date: '2026-03-10', titre: 'BON DE PRÉLÈVEMENT', numero: 'P-05',
  texte: ['Retrait de la caisse de l’atelier par le propriétaire, M. Sébastien Favez, pour ses besoins personnels.'],
  montant: f(450), mentions: ['Signature : S. Favez'],
});
const g10 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-03-16',
  operations: [{ designation: 'Versement de M. Sébastien Favez — apport au capital de l’entreprise', montant: f(12000) }] });
const g11 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: garage, compte: compteGarage, date: '2026-03-31',
  operations: [{ designation: 'Amortissement contractuel de votre prêt n° 61-3307', montant: f(6000) }] });
const g12 = facture({
  emetteur: { nom: 'Véhicules Utilitaires Salève SA', adresse: ['Route de Base 52', '1228 Plan-les-Ouates'] },
  destinataire: garage, numero: 'VUS-26-0112', date: '2026-03-24',
  articles: [
    { designation: 'Dépanneuse plateau, occasion, expertisée', prixUnitaire: f(52000) },
    { designation: 'Reprise de votre ancienne dépanneuse (valeur convenue)', prixUnitaire: f(-16000) },
  ],
  mentions: ['Solde payable à 30 jours.'],
});

export const dossierGarage = construireDossier(
  {
    id: 'dossier-cfc1-garage-praille',
    titre: 'Garage de la Praille — dossier de pièces, premier trimestre',
    niveau: 'CFC1',
    filiere: 'CFC',
    difficulte: 1,
    sujets: ["Bilan d'ouverture", 'Comptes de bilan', 'Note de crédit', 'Prestations de services (travaux)', 'Écritures composées', 'Bouclement'],
    raisonSociale: 'Garage de la Praille',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour cet exercice, la TVA est laissée de côté. Les réparations facturées aux clients sont des produits des travaux. " +
      "Commencez par la fiche « Bilan d'ouverture », comptabilisez les douze pièces, puis passez les écritures de " +
      'bouclement au 31.12.2026 (aucune autre opération jusqu’à cette date).',
    situation:
      "Sébastien Favez a repris il y a cinq ans le Garage de la Praille, à Carouge. Avec un mécanicien et un apprenti, " +
      "il entretient et répare les voitures des habitants du quartier et assure le dépannage avec sa propre dépanneuse.\n\n" +
      "Ce trimestre, il modernise l'atelier : un nouveau pont élévateur, de l'outillage et une dépanneuse plus récente, " +
      "en échange de l'ancienne. Il vous remet les factures, les notes de crédit, les avis de la banque et les quittances " +
      "de l'atelier, et vous demande de les comptabiliser puis de boucler l'exercice.",
    ouvertureActif: { '1000': f(1400), '1020': f(28000), '1100': f(4000), '1500': f(40000), '1530': f(16000), '1540': f(7000) },
    ouverturePassif: { '2010': f(3200), '2400': f(36000), '2800': f(57200) },
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
    { date: '2026-03-24', piece: g12.piece, lignes: [D('1530', f(52000)), C('1530', f(16000)), C('2010', g12.ttc)] },
    { date: '2026-03-31', piece: g11.piece, lignes: S('2400', '1020', g11.total) },
  ],
);

// ─────────────────────────── Dossier : Son & Image Servette (commerce, rabais et escomptes) ───────────────────────────
const magasin = { nom: 'Son & Image Servette', adresse: ['Rue de la Servette 64', '1202 Genève'] };
const compteMagasin = 'CH73 0000 4471 6638 2290 1';
const grossiste = { nom: 'Audio Diffusion Romande SA', adresse: ['Route des Acacias 48', '1227 Les Acacias'] };
const clientTv = { nom: 'Mme Julie Mercier', adresse: ['Rue Liotard 22', '1202 Genève'] };

const h1 = facture({
  emetteur: grossiste, destinataire: magasin, numero: 'ADR-26-0533', date: '2026-01-08',
  articles: [{ designation: 'Enceintes colonne « Concert 90 », la pièce', quantite: 20, prixUnitaire: f(520) }],
  mentions: ["Payable à 30 jours net ou à 10 jours avec 2 % d'escompte."],
});
const h2 = noteCredit({
  emetteur: grossiste, destinataire: magasin, numero: 'NC-26-047', date: '2026-01-12',
  reference: 'facture ADR-26-0533 du 08.01.2026',
  motif: 'Reprise de deux enceintes non conformes, retournées par le client.',
  articles: [{ designation: 'Enceintes colonne « Concert 90 » retournées', quantite: 2, prixUnitaire: f(520) }],
});
const h3 = facture({
  emetteur: { nom: 'Transports Salève-Arve Sàrl', adresse: ['Route de Veyrier 210', '1255 Veyrier'] },
  destinataire: magasin, numero: 'TSA-9320', date: '2026-01-09',
  articles: [
    { designation: 'Transport des enceintes depuis l’entrepôt de Zurich', prixUnitaire: f(290) },
    { designation: 'Assurance transport', prixUnitaire: f(130) },
  ],
  mentions: ['Payable à 30 jours.'],
});
// (10'400.00 − 1'040.00) × 98 % = 9'172.80.
const h4 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-01-16',
  operations: [{ designation: "Paiement à Audio Diffusion Romande SA — facture ADR-26-0533, moins note de crédit NC-26-047 et escompte 2 %", montant: f(9172.8) }] });
const h5 = ticket({
  emetteur: magasin, date: '2026-01-31', titre: 'RAPPORT DE CAISSE — VENTES DE JANVIER', numero: 'Z-01',
  articles: [
    { designation: 'Casques et écouteurs', montant: f(2640) },
    { designation: 'Enceintes', montant: f(3120) },
    { designation: 'Câbles et accessoires', montant: f(1140) },
  ],
  mentions: ['Encaissements en espèces.'],
});
const h6 = facture({
  emetteur: magasin, destinataire: clientTv, numero: 'SIS-2026-021', date: '2026-02-03',
  articles: [{ designation: 'Téléviseur 75 pouces, livraison et installation comprises', prixUnitaire: f(2200) }],
  mentions: ['Payable à 30 jours.', `IBAN ${compteMagasin}`],
});
const h7 = noteCredit({
  emetteur: magasin, destinataire: clientTv, numero: 'NC-2026-03', date: '2026-02-10',
  reference: 'facture SIS-2026-021 du 03.02.2026',
  motif: 'Rabais de 10 % pour une rayure sur le pied du téléviseur, que la cliente accepte de garder.',
  articles: [{ designation: 'Rabais de 10 % sur le téléviseur', prixUnitaire: f(220) }],
});
const h8 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-02-24',
  operations: [{ designation: 'Virement de Mme Julie Mercier — facture SIS-2026-021, moins note de crédit NC-2026-03', montant: f(1980) }] });
const h9 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-03-02',
  operations: [{ designation: "Virement de l'Hôtel de la Roseraie — votre facture SIS-2025-140 de 3'500.00, moins escompte 3 %", montant: f(3395) }] });
const h10 = facture({
  emetteur: { nom: 'Coursiers de la Servette', adresse: ['Rue du Grand-Pré 30', '1202 Genève'] },
  destinataire: magasin, numero: 'CS-26-0418', date: '2026-03-09',
  articles: [{ designation: 'Livraisons à domicile des appareils vendus en février', quantite: 8, prixUnitaire: f(25) }],
  mentions: ['Payable à 30 jours.'],
});
const h11 = quittance({
  emetteur: magasin, date: '2026-03-14', titre: 'BON DE PRÉLÈVEMENT DE MARCHANDISES', numero: 'PM-01',
  texte: ['Le propriétaire, M. Karim Benali, prend pour son usage personnel un casque sans fil « Calme Plus », au prix coûtant.'],
  montant: f(260), mentions: ['Signature : K. Benali'],
});
const h12 = noteInterne({
  emetteur: magasin, date: '2026-12-31', titre: "NOTE INTERNE — INVENTAIRE DE FIN D'EXERCICE",
  texte: [
    "L'inventaire du 31.12.2026, évalué au prix coûtant, s'élève à 66'800.00.",
    'Stock au bilan d’ouverture : 63’000.00.',
  ],
  totaux: [{ libelle: 'Valeur du stock à l’inventaire', montant: f(66800), fort: true }],
});

export const dossierSonImage = construireDossier(
  {
    id: 'dossier-cfc1-son-image-servette',
    titre: 'Son & Image Servette — dossier de pièces, marchandises',
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
    raisonSociale: 'Son & Image Servette',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour cet exercice, la TVA est laissée de côté. Comptabilisez les douze pièces ; la dernière est l'inventaire de fin " +
      "d'exercice. Remplissez ensuite la fiche « Marge brute » d'après vos comptes, puis passez les écritures de " +
      'bouclement au 31.12.2026.',
    situation:
      "Karim Benali tient depuis dix ans Son & Image Servette, un magasin de son et d'image de la rue de la Servette : " +
      "enceintes, casques, téléviseurs, et l'installation à domicile pour les clients qui le souhaitent.\n\n" +
      "Il achète surtout chez un grossiste des Acacias qui accorde un escompte pour paiement rapide, et il n'hésite pas à " +
      "consentir un rabais quand un appareil est livré avec un défaut. Il vous confie les pièces du trimestre : factures, " +
      "notes de crédit, avis de la banque, rapport de caisse et bons de prélèvement.",
    ouvertureActif: { '1000': f(1600), '1020': f(42000), '1100': f(9000), '1200': f(63000), '1510': f(32000) },
    ouverturePassif: { '2000': f(13000), '2400': f(52000), '2800': f(82600) },
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
    { date: '2026-03-02', piece: h9.piece, lignes: [D('1020', h9.total), D('3209', f(105)), C('1100', f(3500))] },
    { date: '2026-03-09', piece: h10.piece, lignes: S('3210', '2010', h10.ttc) },
    { date: '2026-03-14', piece: h11.piece, lignes: S('2850', '3720', h11.montant) },
    { date: '2026-12-31', piece: h12.piece, lignes: S('1200', '4280', f(3800)) },
  ],
);
