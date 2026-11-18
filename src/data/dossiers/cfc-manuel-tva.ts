// Dossier CFC, niveau 2 (TVA), tiré des cas du manuel E&S 2022, vol. 2, ch. 14 (exercices 14.9 et 14.10) : droits
// d'utilisation obtenus par l'enseignant (09.11.2026), cas reformulés. Montants hors taxe du livre, TVA aux taux en
// vigueur (8,1 % et 2,6 %, arrondi aux 5 centimes). Entreprises, personnes et numéros fictifs.
import { avisBancaire, facture, noteCredit, noteInterne, ticket } from '../../engine/pieces';
import { BANQUE, C, construireDossier, D, f, S } from './outils';

const magasin = { nom: 'Électroménager du Rhône', adresse: ['Rue de Cornavin 14', '1201 Genève'] };
const compteMagasin = 'CH58 0000 4471 7730 2214 6';
const grossiste = { nom: 'Électro Distribution Romande SA', adresse: ['Route de Genève 99', '1028 Préverenges'] };
const informatique = { nom: 'Informatique du Rhône Sàrl', adresse: ['Rue de la Servette 70', '1202 Genève'] };
const residence = { nom: 'Résidence Les Tilleuls', adresse: ['Chemin des Tilleuls 5', '1226 Thônex'] };
const exportateur = { nom: 'Casa Lavanda SRL', adresse: ['Avenida Corrientes 1450', 'C1042 Buenos Aires', 'Argentine'] };

// 1. Achat de marchandises (taux normal), escompte de 2 % à 10 jours.
const e1 = facture({
  emetteur: grossiste, destinataire: magasin, numero: 'EDR-26-0318', date: '2026-01-12', tauxTva: 81,
  articles: [
    { designation: 'Lave-vaisselle encastrable 60 cm', quantite: 6, prixUnitaire: f(890) },
    { designation: 'Réfrigérateur combiné 300 l', quantite: 5, prixUnitaire: f(1422) },
  ],
  mentions: ["Payable à 30 jours net ou à 10 jours avec 2 % d'escompte."],
});
// 2. Achat d'un ordinateur pour l'administration (investissement).
const e2 = facture({
  emetteur: informatique, destinataire: magasin, numero: 'IR-4410', date: '2026-01-19', tauxTva: 81,
  articles: [{ designation: "Ordinateur de bureau et écran, pour l'administration du magasin", prixUnitaire: f(1900) }],
  mentions: ['Payable à 30 jours.'],
});
// 3. Paiement de la facture 1 dans le délai d'escompte (escompte sur le montant TVA comprise).
const escompteAchatHT = f(249);
const escompteAchatTVA = f(20.15);
const e3 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-01-20',
  operations: [{ designation: 'Paiement à Électro Distribution Romande SA — facture EDR-26-0318, escompte de 2 % déduit', montant: e1.ttc - escompteAchatHT - escompteAchatTVA }] });
// 4. Remise de 10 % obtenue sur l'ordinateur.
const e4 = noteCredit({
  emetteur: informatique, destinataire: magasin, numero: 'NC-112', date: '2026-01-24',
  reference: 'facture IR-4410 du 19.01.2026',
  motif: 'Remise commerciale de 10 % accordée sur votre commande.',
  articles: [
    { designation: "Remise de 10 % sur l'ordinateur et l'écran", prixUnitaire: f(190) },
    { designation: 'TVA 8,1 % sur la remise', prixUnitaire: f(15.4) },
  ],
});
// 5. Paiement du solde de l'ordinateur.
const e5 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-01-26',
  operations: [{ designation: 'Paiement à Informatique du Rhône Sàrl — facture IR-4410, déduction faite de la note de crédit NC-112', montant: e2.ttc - e4.montant }] });
// 6. Vente à crédit, escompte de 3 % à 10 jours.
const e6 = facture({
  emetteur: magasin, destinataire: residence, numero: 'ER-26-041', date: '2026-03-12', tauxTva: 81,
  articles: [{ designation: 'Équipement de la cuisine collective : lave-vaisselle professionnel et deux réfrigérateurs', prixUnitaire: f(20000) }],
  mentions: ["Payable à 30 jours net ou à 10 jours avec 3 % d'escompte.", `IBAN ${compteMagasin}`],
});
// 7. Le client paie dans le délai d'escompte.
const escompteVenteHT = f(600);
const escompteVenteTVA = f(48.6);
const e7 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-03-15',
  operations: [{ designation: 'Virement de Résidence Les Tilleuls — facture ER-26-041, escompte de 3 % déduit', montant: e6.ttc - escompteVenteHT - escompteVenteTVA }] });
// 8. Exportation (exonérée).
const e8 = facture({
  emetteur: magasin, destinataire: exportateur, numero: 'ER-26-042', date: '2026-03-18',
  articles: [{ designation: 'Robots de cuisine multifonctions, livraison départ Genève', quantite: 50, prixUnitaire: f(370) }],
  mentions: ['Livraison à l’étranger, exonérée de la TVA.', 'Payable à 60 jours.'],
});
// 9. Revues spécialisées (taux réduit), payées en espèces.
const e9 = ticket({
  emetteur: { nom: 'Presse Romande Diffusion', adresse: ['Boulevard du Pont-d’Arve 18', '1205 Genève'] }, date: '2026-03-20',
  numero: '22-7713', tauxTva: 26,
  articles: [{ designation: 'Abonnement annuel à trois revues spécialisées en électroménager', montant: f(513) }],
  mentions: ['Payé en espèces.'],
});
// 10. Ventes au comptoir du mois (taux normal).
const e10 = ticket({
  emetteur: magasin, date: '2026-03-31', titre: 'RAPPORT DE CAISSE — VENTES DE MARS', numero: 'Z-03', tauxTva: 81,
  articles: [
    { designation: 'Petit électroménager', montant: f(4864.5) },
    { designation: 'Accessoires et pièces détachées', montant: f(4215.9) },
  ],
  mentions: ['Encaissements en espèces.'],
});
// 11. Décompte TVA du trimestre.
const tvaDue = e6.tva - escompteVenteTVA + e10.tva;
const ipMarch = e1.tva - escompteAchatTVA;
const ipInv = e2.tva - f(15.4) + e9.tva;
const solde = tvaDue - ipMarch - ipInv;
const e11 = noteInterne({
  emetteur: magasin, date: '2026-03-31', titre: 'NOTE INTERNE — DÉCOMPTE TVA', numero: 'NI-01',
  texte: [
    "Établir le décompte TVA du premier trimestre (méthode effective) d'après les comptes : virer l'impôt préalable en " +
      'diminution de la TVA due, puis virer le solde dû dans le compte de dette envers l’AFC.',
  ],
  mentions: ['Signé : M. Rochat'],
});
// 12. Paiement de la TVA.
const e12 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-04-28',
  operations: [{ designation: 'Administration fédérale des contributions — TVA 1er trimestre 2026', montant: solde }] });

export const dossierElectromenager = construireDossier(
  {
    id: 'dossier-cfc2-electromenager-du-rhone-tva',
    titre: 'Électroménager du Rhône — dossier de pièces, TVA, escomptes et remises',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 2,
    sujets: [
      'TVA au net (8,1 % et 2,6 %)',
      'Escompte obtenu et accordé avec correction de la TVA',
      'Remise sur un investissement',
      'Exportation sans TVA',
      'Décompte et paiement de la TVA',
    ],
    raisonSociale: 'Électroménager du Rhône',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net). Un escompte ou une remise " +
      "réduit aussi la TVA : corrigez l'impôt préalable ou la TVA due du montant correspondant. Les livraisons à " +
      "l'étranger sont exonérées. Comptabilisez les douze pièces du premier trimestre.",
    situation:
      "Marc Rochat tient Électroménager du Rhône, près de la gare de Cornavin. Il vend des appareils aux particuliers, " +
      "équipe les cuisines de quelques établissements de la région et vient de décrocher un premier client en Argentine.\n\n" +
      "Il paie ses fournisseurs dans le délai d'escompte et accorde lui aussi un escompte à ses gros clients. Il vous remet " +
      "les factures, les avis de la banque et les tickets du trimestre : à vous de séparer la TVA, d'établir le décompte au " +
      '31 mars et d’enregistrer son paiement.',
    ouvertureActif: { '1000': f(2000), '1020': f(45000), '1100': f(3000), '1200': f(30000), '1510': f(15000), '1520': f(4000) },
    ouverturePassif: { '2000': f(5000), '2800': f(94000) },
    parametres: { corrigerBouclement: false },
  },
  [
    { date: '2026-01-12', piece: e1.piece, lignes: [D('4200', e1.ht), D('1170', e1.tva), C('2000', e1.ttc)] },
    { date: '2026-01-19', piece: e2.piece, lignes: [D('1520', e2.ht), D('1171', e2.tva), C('2000', e2.ttc)] },
    { date: '2026-01-20', piece: e3.piece, lignes: [D('2000', e1.ttc), C('1020', e3.total), C('4209', escompteAchatHT), C('1170', escompteAchatTVA)] },
    { date: '2026-01-24', piece: e4.piece, lignes: [D('2000', e4.montant), C('1520', f(190)), C('1171', f(15.4))] },
    { date: '2026-01-26', piece: e5.piece, lignes: S('2000', '1020', e5.total) },
    { date: '2026-03-12', piece: e6.piece, lignes: [D('1100', e6.ttc), C('3200', e6.ht), C('2200', e6.tva)] },
    { date: '2026-03-15', piece: e7.piece, lignes: [D('1020', e7.total), D('3209', escompteVenteHT), D('2200', escompteVenteTVA), C('1100', e6.ttc)] },
    { date: '2026-03-18', piece: e8.piece, lignes: S('1100', '3200', e8.ttc) },
    { date: '2026-03-20', piece: e9.piece, lignes: [D('6500', e9.ht), D('1171', e9.tva), C('1000', e9.ttc)] },
    { date: '2026-03-31', piece: e10.piece, lignes: [D('1000', e10.ttc), C('3200', e10.ht), C('2200', e10.tva)] },
    { date: '2026-03-31', piece: e11.piece, lignes: [D('2200', tvaDue), C('1170', ipMarch), C('1171', ipInv), C('2205', solde)] },
    { date: '2026-04-28', piece: e12.piece, lignes: S('2205', '1020', solde) },
  ],
);

/** Contrôles des montants dérivés (tests) : escomptes et remises calculés au taux de 8,1 %, arrondi aux 5 centimes. */
export const CONTROLES_ELECTROMENAGER = { e1, e2, e6, e9, e10, escompteAchatHT, escompteAchatTVA, escompteVenteHT, escompteVenteTVA, solde };
