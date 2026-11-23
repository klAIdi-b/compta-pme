// Dossier CFC, niveau 2 : facturation et paiements (plan d'études CFC, 2e année, c5.ep3a et c5.ep5a). Maquette
// validée le 23.11.2026. L'élève établit trois factures, paie trois factures de fournisseurs par ordre de paiement,
// contrôle les paiements de ses clients, puis passe les écritures. Entreprises, IBAN et références fictifs.
import {
  calculFacture, calculPaiement, LIBELLES_SITUATION, montantEscompte, situationFacture,
  type DonneesFacturation, type FactureAEtablir, type FactureAPayer,
} from '../../engine/facturation';
import { avisBancaire, facture, noteInterne, type Partie } from '../../engine/pieces';
import { tvaSurTTC } from '../../engine/tva';
import { BANQUE, C, construireDossier, D, f, S, type TableauComplement } from './outils';

const magasin: Partie = { nom: 'Cycles du Léman', adresse: ['Rue Saint-Joseph 18', '1227 Carouge'] };
const compteMagasin = 'CH00 0000 0000 0000 1801 2 (fictif)';
const DEUX_POUR_CENT = { taux: 20, jours: 10 };

// ---------- Factures à établir (bons de commande) ----------

const veloClub = { nom: 'Vélo-Club des Eaux-Vives', adresse: ['Rue des Vollandes 12', '1207 Genève'] };
const ecole = { nom: 'École de Plainpalais', adresse: ['Rue de Carouge 50', '1205 Genève'] };
const camping = { nom: 'Camping des Rives', adresse: ['Route du Lac 3', '1246 Corsier'] };

const f301: FactureAEtablir = {
  numero: 'F-301', date: '2026-03-03', client: veloClub, tauxTva: 81, delaiNet: 30, escompte: DEUX_POUR_CENT, rabais: 100,
  consigne: 'Rabais de 10 % pour le club. Facture datée du jour de la livraison (03.03.2026). Conditions : 30 jours net, 2 % d\'escompte à 10 jours.',
  articles: [
    { designation: 'Vélo de ville « Rhône »', quantite: 4, prixUnitaire: f(890) },
    { designation: 'Antivol à arceau', quantite: 4, prixUnitaire: f(45) },
  ],
};
const f302: FactureAEtablir = {
  numero: 'F-302', date: '2026-03-06', client: ecole, tauxTva: 81, delaiNet: 30,
  consigne: 'Pas de rabais. Facture datée du jour de la livraison (06.03.2026). Conditions : 30 jours net.',
  articles: [
    { designation: 'Vélo pour enfant 24 pouces', quantite: 2, prixUnitaire: f(480) },
    { designation: 'Casque de vélo', quantite: 4, prixUnitaire: f(38.5) },
  ],
};
const f303: FactureAEtablir = {
  numero: 'F-303', date: '2026-03-12', client: camping, tauxTva: 81, delaiNet: 30, escompte: DEUX_POUR_CENT, rabais: 50,
  consigne: 'Rabais de 5 % pour une commande de trois vélos. Facture datée du jour de la livraison (12.03.2026). Conditions : 30 jours net, 2 % d\'escompte à 10 jours.',
  articles: [{ designation: 'Vélo de location « Lac »', quantite: 3, prixUnitaire: f(690) }],
};
const aEtablir = [f301, f302, f303];
const c301 = calculFacture(f301);
const c302 = calculFacture(f302);
const c303 = calculFacture(f303);

/** Bon de commande donné comme pièce de l'opération ; l'élève établit la facture dans la rubrique Facturation. */
function bonDeCommande(fa: FactureAEtablir) {
  return noteInterne({
    emetteur: fa.client,
    destinataire: magasin,
    date: fa.date,
    titre: 'BON DE COMMANDE',
    numero: fa.numero,
    texte: [
      `Note de Sandra Rochat : ${fa.consigne} TVA ${fa.tauxTva / 10} %.`.replace('8.1', '8,1'),
      `Établissez la facture ${fa.numero} dans la rubrique Facturation, puis comptabilisez-la.`,
    ],
    lignes: fa.articles.map((a) => ({ designation: a.designation, quantite: String(a.quantite), prixUnitaire: a.prixUnitaire, montant: a.quantite * a.prixUnitaire })),
    mentions: ['Prix catalogue hors TVA.'],
  });
}

// ---------- Factures à payer ----------

const grossiste = { nom: 'Grossiste Cycles Romandie SA', adresse: ['Route de Lausanne 40', '1196 Gland'] };
const pieces = { nom: 'Pièces Détachées Léman Sàrl', adresse: ['Rue du Lac 8', '1815 Clarens'] };
const energie = { nom: 'Énergies du Léman SA', adresse: ['Quai du Seujet 2', '1201 Genève'] };

const gcr = facture({
  emetteur: grossiste, destinataire: magasin, numero: 'GCR-118', date: '2026-03-05', tauxTva: 81,
  articles: [{ designation: 'Vélo électrique « Salève », livrés le 05.03.2026', quantite: 6, prixUnitaire: f(750) }],
  mentions: [
    "Conditions : 30 jours net, 2 % d'escompte en cas de paiement dans les 10 jours.",
    'Section paiement : compte CH00 0000 0000 0000 0118 5 (fictif), Grossiste Cycles Romandie SA, 1196 Gland.',
    'Référence : 00 00000 00000 00000 00011 82026.',
  ],
});
const pdl = facture({
  emetteur: pieces, destinataire: magasin, numero: 'PDL-2026-044', date: '2026-03-09', tauxTva: 81,
  articles: [
    { designation: "Chambres à air 28 pouces", quantite: 20, prixUnitaire: f(8.5) },
    { designation: 'Pneus de ville 700 × 38', quantite: 10, prixUnitaire: f(32) },
  ],
  mentions: [
    "Conditions : 30 jours net, 2 % d'escompte en cas de paiement dans les 10 jours.",
    'Section paiement : compte CH00 0000 0000 0000 0044 7 (fictif), Pièces Détachées Léman Sàrl, 1815 Clarens.',
    'Référence : 00 00000 00000 00000 00002 60443.',
  ],
});
const sel = facture({
  emetteur: energie, destinataire: magasin, numero: 'EL-77120', date: '2026-03-18', tauxTva: 81,
  articles: [{ designation: 'Électricité du magasin et de l\'atelier, février et mars 2026', prixUnitaire: f(310) }],
  mentions: [
    'Conditions : 30 jours net.',
    'Section paiement : compte CH00 0000 0000 0000 7712 0 (fictif), Énergies du Léman SA, 1201 Genève.',
    'Référence : 00 00000 00000 00000 07712 00318.',
  ],
});

const aPayer: FactureAPayer[] = [
  {
    id: 'GCR-118', piece: gcr.piece, dateFacture: '2026-03-05', total: gcr.ttc, delaiNet: 30, escompte: DEUX_POUR_CENT,
    beneficiaire: grossiste.nom, iban: 'CH00 0000 0000 0000 0118 5', reference: '00 00000 00000 00000 00011 82026', datePaiement: '2026-03-12',
  },
  {
    id: 'EL-77120', piece: sel.piece, dateFacture: '2026-03-18', total: sel.ttc, delaiNet: 30,
    beneficiaire: energie.nom, iban: 'CH00 0000 0000 0000 7712 0', reference: '00 00000 00000 00000 07712 00318', datePaiement: '2026-03-25',
  },
  {
    id: 'PDL-2026-044', piece: pdl.piece, dateFacture: '2026-03-09', total: pdl.ttc, delaiNet: 30, escompte: DEUX_POUR_CENT,
    beneficiaire: pieces.nom, iban: 'CH00 0000 0000 0000 0044 7', reference: '00 00000 00000 00000 00002 60443', datePaiement: '2026-03-31',
  },
];
const [pGcr, pSel, pPdl] = aPayer.map(calculPaiement) as [ReturnType<typeof calculPaiement>, ReturnType<typeof calculPaiement>, ReturnType<typeof calculPaiement>];

function ordreExecute(p: FactureAPayer) {
  return noteInterne({
    emetteur: magasin,
    date: p.datePaiement,
    titre: 'ORDRE DE PAIEMENT EXÉCUTÉ',
    numero: p.id,
    texte: [
      `Payez la facture ${p.id} de ${p.beneficiaire} le ${p.datePaiement.split('-').reverse().join('.')} : remplissez l'ordre de paiement dans la rubrique Facturation.`,
      "La banque a exécuté l'ordre. Comptabilisez le paiement d'après votre ordre de paiement.",
    ],
  });
}

// ---------- Encaissements (relevé bancaire) ----------

const credit = (date: string, donneur: string, designation: string, montant: number) =>
  avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date, operations: [{ designation: `Virement de ${donneur} — ${designation}`, montant }] });

const esc301 = montantEscompte(c301.ttc, DEUX_POUR_CENT);
const esc301Tva = tvaSurTTC(esc301, 81);
const recu303 = c303.ttc - montantEscompte(c303.ttc, DEUX_POUR_CENT);
const cr1 = credit('2026-03-10', 'Garage Favre', 'facture F-297', f(640));
const cr2 = credit('2026-03-12', veloClub.nom, 'facture F-301', c301.aPayerAvecEscompte!);
// Deux virements reçus en fin de mois, sur le même avis de crédit.
const cr34 = avisBancaire({
  sens: 'credit', banque: BANQUE, titulaire: magasin, compte: compteMagasin, date: '2026-03-28',
  operations: [
    { designation: `27.03 Virement de ${camping.nom} — facture F-303`, montant: recu303 },
    { designation: '28.03 Virement de Atelier mécanique du Rhône — facture F-299', montant: f(500) },
  ],
});

const escGcr = gcr.ttc - pGcr.montant;
const escGcrTva = tvaSurTTC(escGcr, 81);

export const facturationLeman: DonneesFacturation = {
  factures: aEtablir,
  paiements: aPayer,
  controle: {
    date: '2026-03-31',
    factures: [
      { numero: 'F-297', client: 'Garage Favre', date: '2026-02-20', total: f(640), delaiNet: 30 },
      { numero: 'F-298', client: 'Hôtel du Parc', date: '2026-02-15', total: f(1180), delaiNet: 30 },
      { numero: 'F-299', client: 'Atelier mécanique du Rhône', date: '2026-02-26', total: f(860), delaiNet: 30 },
      ...aEtablir.map((x, i) => ({ numero: x.numero, client: x.client.nom, date: x.date, total: [c301, c302, c303][i]!.ttc, delaiNet: x.delaiNet, escompte: x.escompte })),
    ],
    credits: [
      { id: '1', date: '2026-03-10', donneur: 'Garage Favre', montant: f(640), facture: 'F-297' },
      { id: '2', date: '2026-03-12', donneur: veloClub.nom, montant: c301.aPayerAvecEscompte!, facture: 'F-301' },
      { id: '3', date: '2026-03-27', donneur: camping.nom, montant: recu303, facture: 'F-303' },
      { id: '4', date: '2026-03-28', donneur: 'Atelier mécanique du Rhône', montant: f(500), facture: 'F-299' },
    ],
  },
};

export const dossierFacturationLeman = construireDossier(
  {
    id: 'dossier-cfc2-cycles-du-leman-facturation',
    titre: 'Cycles du Léman — facturation et paiements de mars',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 2,
    sujets: ['Établir une facture', 'Ordre de paiement', 'Contrôle des paiements', 'Escompte avec correction de la TVA'],
    raisonSociale: 'Cycles du Léman',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net, 8,1 %). Dans la rubrique Facturation, " +
      'établissez les factures, remplissez les ordres de paiement et contrôlez les paiements des clients au 31 mars. ' +
      "Comptabilisez ensuite chaque pièce au journal. Un escompte corrige aussi la TVA. Arrondissez la TVA et les escomptes aux 5 centimes.",
    situation:
      "Vous êtes en deuxième année d'apprentissage chez Cycles du Léman, le magasin de vélos de Sandra Rochat à Carouge. " +
      "Depuis le début de l'année, c'est vous qui vous occupez des factures.\n\n" +
      "En mars, trois clients ont passé commande : à vous d'établir leurs factures. Il faut aussi payer trois factures de " +
      "fournisseurs, en profitant de l'escompte quand c'est encore possible. Le 31 mars, Sandra vous demande de contrôler " +
      'le relevé de la banque : qui a payé, qui a déduit un escompte auquel il n\'avait pas droit, et qui faut-il relancer ?',
    ouvertureActif: { '1000': f(1500), '1020': f(25000), '1100': f(2680), '1200': f(18000), '1510': f(15000), '1530': f(22000) },
    ouverturePassif: { '2400': f(25000), '2800': f(59180) },
    parametres: { corrigerBouclement: false, facturation: facturationLeman },
  },
  [
    { date: '2026-03-03', piece: bonDeCommande(f301).piece, lignes: [D('1100', c301.ttc), C('3200', c301.ht), C('2200', c301.tva)] },
    { date: '2026-03-05', piece: gcr.piece, lignes: [D('4200', gcr.ht), D('1170', gcr.tva), C('2000', gcr.ttc)] },
    { date: '2026-03-06', piece: bonDeCommande(f302).piece, lignes: [D('1100', c302.ttc), C('3200', c302.ht), C('2200', c302.tva)] },
    { date: '2026-03-09', piece: pdl.piece, lignes: [D('4200', pdl.ht), D('1170', pdl.tva), C('2000', pdl.ttc)] },
    { date: '2026-03-10', piece: cr1.piece, lignes: S('1020', '1100', cr1.total) },
    {
      date: '2026-03-12',
      piece: cr2.piece,
      lignes: [D('1020', cr2.total), D('3209', esc301 - esc301Tva), D('2200', esc301Tva), C('1100', c301.ttc)],
    },
    {
      date: '2026-03-12',
      piece: ordreExecute(aPayer[0]!).piece,
      lignes: [D('2000', gcr.ttc), C('1020', pGcr.montant), C('4209', escGcr - escGcrTva), C('1170', escGcrTva)],
    },
    { date: '2026-03-12', piece: bonDeCommande(f303).piece, lignes: [D('1100', c303.ttc), C('3200', c303.ht), C('2200', c303.tva)] },
    // Facture de services (pas des marchandises) : Autres dettes, impôt préalable sur autres charges d'exploitation.
    { date: '2026-03-18', piece: sel.piece, lignes: [D('6400', sel.ht), D('1171', sel.tva), C('2010', sel.ttc)] },
    { date: '2026-03-25', piece: ordreExecute(aPayer[1]!).piece, lignes: S('2010', '1020', pSel.montant) },
    // Escompte déduit hors délai (F-303) : seul le montant reçu est encaissé ; le solde reste dû par le client.
    { date: '2026-03-28', piece: cr34.piece, lignes: S('1020', '1100', cr34.total) },
    { date: '2026-03-31', piece: ordreExecute(aPayer[2]!).piece, lignes: S('2000', '1020', pPdl.montant) },
  ],
);

// ---------- Corrigé PDF : solutions de la rubrique Facturation ----------

const fr = (c: number) => (c / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
const date = (d: string) => d.split('-').reverse().join('.');

export const complementFacturationLeman: TableauComplement[] = [
  {
    titre: 'Factures à établir',
    entetes: ['Facture', 'Total brut', 'Rabais', 'Hors TVA', 'TVA 8,1 %', 'Total', 'Échéance', 'Avec escompte'],
    lignes: aEtablir.map((x) => {
      const c = calculFacture(x);
      return [x.numero, fr(c.brut), fr(c.rabais), fr(c.ht), fr(c.tva), fr(c.ttc), date(c.echeance),
        c.escompteJusquau ? `${fr(c.aPayerAvecEscompte!)} jusqu'au ${date(c.escompteJusquau)}` : '—'];
    }),
  },
  {
    titre: 'Ordres de paiement',
    entetes: ['Facture', 'Bénéficiaire', "Date d'exécution", 'Escompte déduit', 'Montant'],
    lignes: aPayer.map((p) => {
      const c = calculPaiement(p);
      return [p.id, p.beneficiaire, date(p.datePaiement), c.escompteDeduit ? 'oui' : 'non', fr(c.montant)];
    }),
  },
  {
    titre: 'Contrôle des paiements au 31.03.2026',
    entetes: ['Facture', 'Client', 'Situation', 'Reste à encaisser'],
    lignes: facturationLeman.controle!.factures.map((x) => {
      const s = situationFacture(facturationLeman.controle!, x);
      return [x.numero, x.client, LIBELLES_SITUATION[s.situation], fr(s.reste)];
    }),
  },
];
