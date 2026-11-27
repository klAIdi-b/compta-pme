// Exercices de journal construits sur la structure de cas du manuel E&S (vol. 1 ch. 1, vol. 2 ch. 12 et 14, vol. 3
// ch. 22 à 24, vol. 4 ch. 35) et de F&C (vol. 2 ch. 36 et 54). Droits d'utilisation obtenus par l'enseignant
// (09.11.2026). Décision de l'enseignant du 27.11.2026 : mêmes écritures, mais noms et montants changés ; entreprises,
// personnes et montants fictifs. Identifiants renommés le 27.11.2026 (anciens liens redirigés, voir `src/ui/lien.ts`).
import type { Exercice } from '../engine/exercice';

const f = (francs: number) => Math.round(francs * 100);
const s = (debit: string, credit: string, francs: number) => [{ debit, credit, montant: f(francs) }];
const D = (compte: string, francs: number) => ({ debit: compte, credit: null, montant: f(francs) });
const C = (compte: string, francs: number) => ({ debit: null, credit: compte, montant: f(francs) });
const montants = (r: Record<string, number>) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, f(v)]));

const parametresBase = {
  libellesT: 'SI/SF' as const,
  modificationDirecte: false,
  modeBouclement: 'compteDeResultat' as const,
  comptesAjoutes: [] as string[],
  comptesMasques: [] as string[],
};

const CONSIGNE =
  "Passez au journal les écritures des opérations ci-dessous, en indiquant le numéro de l'opération comme numéro de pièce.";

// ───────────────────────── Bilan, comptes de bilan, écritures composées ─────────────────────────
export const manuelGolay: Exercice = {
  id: 'exercice-cfc1-golay-evenements',
  titre: 'Golay Événements — bilan et comptes de bilan',
  niveau: 'CFC1',
  filiere: 'CFC',
  difficulte: 1,
  sujets: ["Bilan d'ouverture", 'Masses du bilan', 'Comptes de bilan', 'Facture comptabilisée ou non', 'Écritures composées'],
  raisonSociale: 'Golay Événements',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Commencez par la fiche « Bilan d'ouverture » : classez chaque compte dans sa masse et calculez la fortune nette. " +
    `${CONSIGNE} Les opérations ne touchent que des comptes du bilan et le compte privé. Bouclez ensuite l'exercice ` +
    "(aucune autre opération jusqu'au 31.12.2026).",
  situation:
    "Sandrine Golay organise des mariages, des séminaires et des fêtes d'entreprise dans tout le canton de Genève. Elle a " +
    "fondé Golay Événements il y a deux ans, en raison individuelle : elle loue du mobilier, de la sonorisation et " +
    "transporte le matériel avec ses propres véhicules.\n\n" +
    "Au début de l'année, elle renouvelle une partie de son équipement et rembourse son emprunt. Elle vous confie le " +
    "journal du premier trimestre : rien que des achats d'équipement, des paiements et des mouvements d'argent entre la " +
    "caisse, la poste et la banque, mais plusieurs opérations touchent plus de deux comptes.",
  operations: [
    { numero: '1', date: '2026-01-05', texte: "Achat à crédit d'un logiciel de gestion des réservations, 540.00." },
    { numero: '2', date: '2026-01-08', texte: "Un client verse sur le compte bancaire un acompte sur sa facture, 1'480.00." },
    { numero: '3', date: '2026-01-12', texte: 'Sandrine Golay prélève 300.00 en espèces pour ses besoins personnels.' },
    { numero: '4', date: '2026-01-15', texte: "Achat d'une camionnette d'occasion, 14'800.00 ; nous comptabilisons la facture." },
    { numero: '5', date: '2026-01-20', texte: "Paiement par la poste d'une facture de fournisseur déjà comptabilisée, 415.00." },
    { numero: '6', date: '2026-01-31', texte: "Remboursement partiel de l'emprunt bancaire par virement postal, 5'000.00." },
    { numero: '7', date: '2026-02-05', texte: "Retrait de 600.00 au bancomat pour alimenter la caisse de l'entreprise." },
    { numero: '8', date: '2026-02-10', texte: "Virement de 2'000.00 du compte postal sur le compte bancaire." },
    { numero: '9', date: '2026-02-15', texte: "Achat de tables pliantes, 4'200.00 ; nous comptabilisons la facture." },
    { numero: '10', date: '2026-02-20', texte: 'Le fournisseur accorde un rabais de 450.00 pour des tables abîmées à la livraison (opération 9).' },
    { numero: '11', date: '2026-02-28', texte: 'Paiement par la poste du solde de la facture des tables (opérations 9 et 10).' },
    { numero: '12', date: '2026-03-05', texte: "Sandrine Golay apporte 15'000.00 à l'entreprise, versés sur le compte bancaire." },
    {
      numero: '13',
      date: '2026-03-10',
      texte: "Achat d'une installation de sonorisation, 2'900.00 : 1'400.00 par la poste, 1'100.00 en espèces, le solde à crédit.",
    },
    {
      numero: '14',
      date: '2026-03-20',
      texte:
        "Achat d'un minibus, 38'000.00 : le garage reprend notre ancien véhicule à sa valeur au bilan, 14'000.00, et nous " +
        'payons le solde par la banque.',
    },
    {
      numero: '15',
      date: '2026-03-25',
      texte: "Un client règle le solde de sa facture, 1'330.00 : il nous livre du mobilier pour 700.00 et vire 630.00 sur le compte postal.",
    },
  ],
  ouvertureActif: montants({ '1000': 1800, '1010': 20000, '1020': 11000, '1100': 2810, '1510': 60000, '1521': 30000, '1530': 30000 }),
  ouverturePassif: montants({ '2010': 7500, '2400': 48000, '2800': 100110 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: true, ficheBilanOuverture: true },
  corrige: [
    { piece: '1', lignes: s('1521', '2010', 540) },
    { piece: '2', lignes: s('1020', '1100', 1480) },
    { piece: '3', lignes: s('2850', '1000', 300) },
    { piece: '4', lignes: s('1530', '2010', 14800) },
    { piece: '5', lignes: s('2010', '1010', 415) },
    { piece: '6', lignes: s('2400', '1010', 5000) },
    { piece: '7', lignes: s('1000', '1020', 600) },
    { piece: '8', lignes: s('1020', '1010', 2000) },
    { piece: '9', lignes: s('1510', '2010', 4200) },
    { piece: '10', lignes: s('2010', '1510', 450) },
    { piece: '11', lignes: s('2010', '1010', 3750) },
    { piece: '12', lignes: s('1020', '2800', 15000) },
    { piece: '13', lignes: [D('1510', 2900), C('1010', 1400), C('1000', 1100), C('2010', 400)] },
    { piece: '14', lignes: [D('1530', 38000), C('1530', 14000), C('1020', 24000)] },
    { piece: '15', lignes: [D('1510', 700), D('1010', 630), C('1100', 1330)] },
  ],
};

// ───────────────────────── Entreprise commerciale ─────────────────────────
export const manuelCaveEauxVives: Exercice = {
  id: 'exercice-cfc1-cave-eaux-vives',
  titre: 'Cave des Eaux-Vives — marchandises, rabais et escomptes',
  niveau: 'CFC1',
  filiere: 'CFC',
  difficulte: 1,
  sujets: [
    'Achats et ventes de marchandises',
    'Retours, rabais, remises et escomptes',
    "Frais d'achat et frais de ventes",
    'Prélèvements de marchandises',
    'Variation de stock',
    'Marge brute',
    'Échelle des prix',
  ],
  raisonSociale: 'Cave des Eaux-Vives',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    `Pour cet exercice, la TVA est laissée de côté. ${CONSIGNE} Après l'inventaire (opération 17), remplissez la fiche ` +
    "« Marge brute » d'après vos comptes, puis bouclez l'exercice. La fiche « Échelle des prix » se fait à part.",
  situation:
    "La Cave des Eaux-Vives, rue du Lac, appartient à Elena Rinaldi. Elle vend des vins suisses et italiens aux " +
    "particuliers et livre plusieurs restaurants du quartier.\n\n" +
    "Ses fournisseurs lui accordent des escomptes si elle paie vite, et elle-même consent des rabais quand une livraison " +
    "arrive en retard. Elle vous demande de tenir le journal du premier trimestre avec les bons comptes de marchandises, " +
    "puis de calculer sa marge brute : elle veut savoir ce que lui rapporte réellement son commerce.",
  operations: [
    { numero: '1', date: '2026-01-06', texte: "Achat de vins à crédit, 22'400.00 ; conditions : 30 jours net ou 2 % d'escompte à 10 jours." },
    { numero: '2', date: '2026-01-08', texte: "Frais de transport de cet achat payés en espèces, 350.00 (facture non comptabilisée)." },
    { numero: '3', date: '2026-01-10', texte: 'Retour au fournisseur de seize bouteilles bouchonnées, 800.00 (opération 1).' },
    { numero: '4', date: '2026-01-15', texte: "Paiement par la banque de la facture de l'opération 1, déduction faite du retour et de l'escompte de 2 %." },
    { numero: '5', date: '2026-01-20', texte: "Ventes au comptant du mois, 33'600.00." },
    { numero: '6', date: '2026-01-25', texte: "Vente à crédit à un restaurant, 7'200.00." },
    { numero: '7', date: '2026-01-30', texte: 'Rabais de 10 % accordé à ce restaurant pour une livraison tardive (facture comptabilisée).' },
    { numero: '8', date: '2026-02-05', texte: "Le restaurant paie le solde de sa facture par la banque, avec 2 % d'escompte." },
    { numero: '9', date: '2026-02-08', texte: "Versement de 28'000.00 de la caisse sur le compte bancaire." },
    { numero: '10', date: '2026-02-10', texte: 'Frais de livraison des vins vendus, payés par la banque, 280.00.' },
    { numero: '11', date: '2026-02-15', texte: 'Un client retourne quatre cartons livrés en décembre, 540.00 (facture comptabilisée).' },
    { numero: '12', date: '2026-02-20', texte: 'Elena Rinaldi prend des vins pour une fête de famille, 420.00 au prix coûtant.' },
    { numero: '13', date: '2026-02-28', texte: "Droits de douane sur un achat de vins italiens, payés par la banque, 260.00." },
    { numero: '14', date: '2026-03-05', texte: "Loyer du magasin payé par la banque, 3'100.00." },
    { numero: '15', date: '2026-03-10', texte: "Achat de vins à crédit, 8'400.00." },
    { numero: '16', date: '2026-03-12', texte: 'Le fournisseur accorde une remise de 5 % pour la quantité achetée (opération 15).' },
    { numero: '17', date: '2026-12-31', texte: "Inventaire final : le stock de marchandises est évalué à 29'000.00." },
  ],
  ouvertureActif: montants({ '1000': 2500, '1020': 34000, '1100': 7000, '1200': 26000, '1510': 28000 }),
  ouverturePassif: montants({ '2000': 11000, '2400': 18000, '2800': 68500 }),
  mode: 'entrainement',
  parametres: {
    ...parametresBase,
    corrigerBouclement: true,
    ficheMargeBrute: true,
    echellePrix: {
      article: 'un carton de six bouteilles de chasselas',
      pab: f(120),
      rabaisObtenu: 5,
      escompteObtenu: 2,
      fraisAchat: { type: 'chf', valeur: f(8.28) },
      fraisGeneraux: 25,
      beneficeNet: 20,
      escompteAccorde: 0,
      rabaisAccorde: 10,
    },
  },
  corrige: [
    { piece: '1', lignes: s('4200', '2000', 22400) },
    { piece: '2', lignes: s('4270', '1000', 350) },
    { piece: '3', lignes: s('2000', '4200', 800) },
    // 22'400.00 − 800.00 = 21'600.00 ; escompte 2 % = 432.00 ; payé 21'168.00.
    { piece: '4', lignes: [D('2000', 21600), C('1020', 21168), C('4209', 432)] },
    { piece: '5', lignes: s('1000', '3200', 33600) },
    { piece: '6', lignes: s('1100', '3200', 7200) },
    { piece: '7', lignes: s('3209', '1100', 720) },
    // Solde 6'480.00 ; escompte 2 % = 129.60 ; payé 6'350.40.
    { piece: '8', lignes: [D('1020', 6350.4), D('3209', 129.6), C('1100', 6480)] },
    { piece: '9', lignes: s('1020', '1000', 28000) },
    { piece: '10', lignes: s('3210', '1020', 280) },
    { piece: '11', lignes: s('3200', '1100', 540) },
    { piece: '12', lignes: s('2850', '3720', 420) },
    { piece: '13', lignes: s('4270', '1020', 260) },
    { piece: '14', lignes: s('6000', '1020', 3100) },
    { piece: '15', lignes: s('4200', '2000', 8400) },
    { piece: '16', lignes: s('2000', '4209', 420) },
    { piece: '17', lignes: s('1200', '4280', 3000) },
  ],
};

// ───────────────────────── TVA (taux 8,1 % et 2,6 %) ─────────────────────────
export const manuelVuilleumier: Exercice = {
  id: 'exercice-cfc2-maison-vuilleumier-tva',
  titre: 'Maison Vuilleumier — TVA du premier trimestre',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 2,
  sujets: ['TVA au net (8,1 % et 2,6 %)', 'Exportation sans TVA', 'Rabais avec correction de la TVA', 'Décompte et paiement de la TVA'],
  raisonSociale: 'Maison Vuilleumier',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net). Taux : 8,1 % sur le mobilier, la " +
    "décoration, l'énergie et le téléphone ; 2,6 % sur les journaux. Les livraisons à l'étranger sont exonérées. " +
    `${CONSIGNE} L'opération 14 est le décompte TVA du trimestre.`,
  situation:
    "Maison Vuilleumier vend du mobilier et des objets de décoration à Chêne-Bourg. Corinne Vuilleumier a ouvert le " +
    "magasin cette année ; les ventes du comptoir sont enregistrées chaque fin de mois, et une première commande est " +
    "partie à l'étranger.\n\n" +
    "Elle vous confie la comptabilité du premier trimestre : séparer la TVA à chaque opération, établir le décompte au " +
    "31 mars, puis enregistrer le paiement à l'Administration fédérale des contributions.",
  operations: [
    { numero: '1', date: '2026-01-20', texte: "Première vente de marchandises à l'étranger, sur facture, 12'600.00 (exportation exonérée de TVA)." },
    { numero: '2', date: '2026-01-31', texte: "Ventes du mois en espèces, 7'567.00 (TVA 8,1 % comprise)." },
    { numero: '3', date: '2026-01-31', texte: "Versement de 7'000.00 de la caisse sur le compte postal." },
    { numero: '4', date: '2026-02-14', texte: "Vente exceptionnelle au comptant pour la Saint-Valentin, 12'972.00 (TVA 8,1 % comprise)." },
    {
      numero: '5',
      date: '2026-02-15',
      texte:
        "Paiement par virement postal des factures de janvier, non comptabilisées : électricité 324.30 et téléphone 194.60, " +
        'soit 518.90 (TVA 8,1 % comprise).',
    },
    { numero: '6', date: '2026-02-25', texte: "Achat de marchandises à crédit, 28'000.00 hors TVA (TVA 8,1 %)." },
    { numero: '7', date: '2026-02-28', texte: "Ventes du mois en espèces, 8'648.00 (TVA 8,1 % comprise)." },
    {
      numero: '8',
      date: '2026-03-03',
      texte: 'Une partie des marchandises reçues le 25.02 est défectueuse : le fournisseur accorde un rabais de 648.60 (TVA 8,1 % comprise).',
    },
    { numero: '9', date: '2026-03-04', texte: 'Paiement par virement bancaire du montant net de la facture du 25.02 (opérations 6 et 8).' },
    { numero: '10', date: '2026-03-15', texte: "Achat de marchandises à crédit, 10'810.00 (TVA 8,1 % comprise)." },
    {
      numero: '11',
      date: '2026-03-20',
      texte: "Paiement par virement postal de l'abonnement au quotidien régional, facture non comptabilisée, 461.70 (TVA 2,6 % comprise).",
    },
    { numero: '12', date: '2026-03-31', texte: "Ventes du mois en espèces, 37'835.00 (TVA 8,1 % comprise)." },
    {
      numero: '13',
      date: '2026-03-31',
      texte: "Sur les ventes encaissées ce jour, 22'000.00 sont versés sur le compte bancaire ; Corinne Vuilleumier garde le solde pour ses besoins personnels.",
    },
    { numero: '14', date: '2026-03-31', texte: "Décompte TVA du premier trimestre : virer l'impôt préalable et le solde dû à l'AFC." },
    { numero: '15', date: '2026-04-20', texte: 'Paiement de la TVA due par virement bancaire.' },
  ],
  ouvertureActif: montants({ '1000': 3500, '1010': 9000, '1020': 30000, '1100': 4500, '1200': 45000, '1510': 35000 }),
  ouverturePassif: montants({ '2000': 7000, '2800': 120000 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, tvaMethode: 'net' },
  corrige: [
    { piece: '1', lignes: s('1100', '3200', 12600) },
    { piece: '2', lignes: [D('1000', 7567), C('3200', 7000), C('2200', 567)] },
    { piece: '3', lignes: s('1010', '1000', 7000) },
    { piece: '4', lignes: [D('1000', 12972), C('3200', 12000), C('2200', 972)] },
    // Électricité 300.00 + 24.30 de TVA, téléphone 180.00 + 14.60 de TVA, chacune dans son compte de nature.
    { piece: '5', lignes: [D('6400', 300), D('6510', 180), D('1171', 38.9), C('1010', 518.9)] },
    { piece: '6', lignes: [D('4200', 28000), D('1170', 2268), C('2000', 30268)] },
    { piece: '7', lignes: [D('1000', 8648), C('3200', 8000), C('2200', 648)] },
    { piece: '8', lignes: [D('2000', 648.6), C('4200', 600), C('1170', 48.6)] },
    { piece: '9', lignes: s('2000', '1020', 29619.4) },
    { piece: '10', lignes: [D('4200', 10000), D('1170', 810), C('2000', 10810)] },
    // Abonnement : 6700 ou 6500 admis (décision de l'enseignant du 26.11.2026).
    { piece: '11', lignes: [D('6700', 450), D('1171', 11.7), C('1010', 461.7)], variantes: [[D('6500', 450), D('1171', 11.7), C('1010', 461.7)]] },
    { piece: '12', lignes: [D('1000', 37835), C('3200', 35000), C('2200', 2835)] },
    { piece: '13', lignes: [D('1020', 22000), D('2850', 15835), C('1000', 37835)] },
    // TVA due 5'022.00 − IP 3'029.40 − IP 50.60 = 1'942.00.
    { piece: '14', lignes: [D('2200', 5022), C('1170', 3029.4), C('1171', 50.6), C('2205', 1942)] },
    { piece: '15', lignes: s('2205', '1020', 1942) },
  ],
};

// ───────────────────────── Pertes sur créances ─────────────────────────
export const manuelJaquier: Exercice = {
  id: 'exercice-cfc3-materiaux-jaquier-creances',
  titre: 'Matériaux Jaquier — pertes sur créances et ducroire',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  sujets: ['Poursuites et frais de poursuite', 'Acte de défaut de biens', 'Créances douteuses', 'Créance amortie récupérée', 'Ducroire'],
  raisonSociale: 'Matériaux Jaquier',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Pour cet exercice, la TVA est laissée de côté. Les frais de poursuite avancés sont à la charge du débiteur. Une " +
    "créance amortie lors d'un exercice précédent et récupérée est un produit exceptionnel. " +
    `${CONSIGNE} Au 31.12, le ducroire est fixé à 5 % des créances clients (sans les créances douteuses).`,
  situation:
    "Matériaux Jaquier vend des matériaux de construction aux artisans et aux particuliers de la région de Meyrin. " +
    "Olivier Jaquier accorde volontiers des délais de paiement, mais plusieurs clients ne paient plus : relances, " +
    "poursuites, faillites.\n\n" +
    "Il vous confie le suivi comptable de ses créances pour l'année : enregistrer les pertes, les montants récupérés, " +
    "les créances douteuses, puis ajuster le ducroire au 31 décembre.",
  operations: [
    { numero: '1', date: '2026-01-10', texte: "Vente de marchandises à crédit à Chappuis, un de nos plus gros clients, 18'200.00." },
    { numero: '2', date: '2026-02-16', texte: "Trois rappels restés sans réponse : nous poursuivons Chappuis et avançons 120.00 de frais à l'Office des poursuites, par virement postal." },
    { numero: '3', date: '2026-04-20', texte: "Chappuis est insolvable, la poursuite est restée infructueuse : l'Office des poursuites nous remet un acte de défaut de biens de 18'320.00." },
    { numero: '4', date: '2026-05-05', texte: "Notre client Sandoz nous devait 14'000.00. À la suite des poursuites, l'Office vire 6'000.00 sur notre compte bancaire ; acte de défaut de biens pour le solde." },
    { numero: '5', date: '2026-05-20', texte: "Faillite de Berset, débiteur à risque dont la créance de 5'000.00 figure en créances douteuses : l'Office des faillites vire 3'600.00 sur le compte postal, le solde est perdu." },
    { numero: '6', date: '2026-06-10', texte: "Contre toute attente, nous recevons sur le compte bancaire 4'500.00 sur la créance de Mettraux, complètement amortie il y a trois ans." },
    { numero: '7', date: '2026-08-14', texte: "Vente de marchandises à crédit à Cattin, 21'000.00 ; conditions : net à 60 jours ou 2 % d'escompte à 20 jours." },
    { numero: '8', date: '2026-09-15', texte: "Notre client Rapin nous devait 11'000.00 : les poursuites rapportent 4'000.00 en espèces ; acte de défaut de biens pour le solde." },
    { numero: '9', date: '2026-09-22', texte: "Notre client Vuille est parti sans laisser d'adresse ; après de vaines recherches, nous annulons sa créance de 1'250.00." },
    { numero: '10', date: '2026-10-12', texte: "Tinguely, dont nous avions amorti la créance il y a six ans, verse 6'300.00 sur notre compte postal." },
    { numero: '11', date: '2026-10-26', texte: "Nous réglons une facture de marchandises déjà comptabilisée en cédant d'anciens actes de défaut de biens (créances amorties), pour 3'200.00." },
    { numero: '12', date: '2026-12-15', texte: 'Quatre mois plus tard, la facture de Cattin (opération 7) est toujours impayée : nous la virons en créances douteuses.' },
    { numero: '13', date: '2026-12-31', texte: 'Ajustement du ducroire : 5 % des créances clients (compte Créances clients, sans les créances douteuses).' },
  ],
  ouvertureActif: montants({ '1000': 3500, '1010': 12000, '1020': 65000, '1100': 50000, '1108': 5000, '1200': 35000, '1500': 45000 }),
  ouverturePassif: montants({ '1109': 1800, '2000': 18000, '2800': 195700 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false },
  corrige: [
    { piece: '1', lignes: s('1100', '3200', 18200) },
    { piece: '2', lignes: s('1100', '1010', 120) },
    { piece: '3', lignes: s('3805', '1100', 18320) },
    { piece: '4', lignes: [D('1020', 6000), D('3805', 8000), C('1100', 14000)] },
    { piece: '5', lignes: [D('1010', 3600), D('3805', 1400), C('1108', 5000)] },
    { piece: '6', lignes: s('1020', '8510', 4500) },
    { piece: '7', lignes: s('1100', '3200', 21000) },
    { piece: '8', lignes: [D('1000', 4000), D('3805', 7000), C('1100', 11000)] },
    { piece: '9', lignes: s('3805', '1100', 1250) },
    { piece: '10', lignes: s('1010', '8510', 6300) },
    { piece: '11', lignes: s('2000', '8510', 3200) },
    { piece: '12', lignes: s('1108', '1100', 21000) },
    // Créances clients 23'750.00 × 5 % = 1'187.50 ; ducroire 1'800.00 → diminution de 612.50.
    { piece: '13', lignes: s('1109', '3805', 612.5) },
  ],
};

// ───────────────────────── Amortissements ─────────────────────────
export const manuelDelices: Exercice = {
  id: 'exercice-cfc3-imprimerie-delices-amortissements',
  titre: 'Imprimerie des Délices — amortissements de fin d’année',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  sujets: ['Amortissement direct et indirect', 'Linéaire (constant) et dégressif (décroissant)', 'Prorata temporis', 'Valeur pour mémoire'],
  raisonSociale: 'Imprimerie des Délices',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Pour cet exercice, la TVA est laissée de côté. Les machines et l'outillage sont amortis de façon indirecte (fonds " +
    "d'amortissements cumulés), les autres immobilisations de façon directe. Le taux constant s'applique à la valeur " +
    "d'acquisition, le taux dégressif à la valeur comptable. " + CONSIGNE,
  situation:
    "L'Imprimerie des Délices, rue des Délices, imprime des affiches, des cartes et des brochures pour les commerces " +
    "et les associations genevoises. Thomas Rey, le propriétaire, a acheté cette année une nouvelle presse numérique.\n\n" +
    "Avant d'établir les comptes annuels, il vous demande de calculer et de comptabiliser les amortissements de chaque " +
    "immobilisation, selon la méthode choisie pour chacune.",
  operations: [
    { numero: '1', date: '2026-06-30', texte: "Achat d'une presse numérique, 52'000.00 ; nous comptabilisons la facture." },
    { numero: '2', date: '2026-09-15', texte: 'Paiement de la presse par virement bancaire.' },
    { numero: '3', date: '2026-12-31', texte: "Machines possédées toute l'année (valeur d'acquisition 160'000.00) : amortissement indirect constant de 25 %." },
    { numero: '4', date: '2026-12-31', texte: 'Presse achetée le 30.06 : même méthode et même taux que les autres machines, prorata temporis.' },
    { numero: '5', date: '2026-12-31', texte: "Outillage (valeur d'acquisition 18'000.00) : amortissement indirect constant de 20 %." },
    { numero: '6', date: '2026-12-31', texte: "Ordinateurs achetés il y a un an pour 20'000.00 : amortissement direct dégressif de 40 % (deuxième année)." },
    { numero: '7', date: '2026-12-31', texte: "Mobilier (valeur d'acquisition 45'000.00) : amortissement direct constant de 15 %." },
    { numero: '8', date: '2026-12-31', texte: "Le véhicule figure au bilan pour 2'100.00 : nous ne laissons que 1.00 pour mémoire (amortissement direct)." },
  ],
  ouvertureActif: montants({
    '1000': 2500, '1020': 85000, '1100': 16000, '1200': 12000, '1500': 160000, '1510': 25000, '1521': 12000, '1530': 2100, '1540': 18000,
  }),
  ouverturePassif: montants({ '1509': 50000, '1549': 7200, '2000': 12000, '2400': 65000, '2800': 198400 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, comptesAjoutes: ['1540', '1549'] },
  corrige: [
    { piece: '1', lignes: s('1500', '2010', 52000) },
    { piece: '2', lignes: s('2010', '1020', 52000) },
    { piece: '3', lignes: s('6800', '1509', 40000) },
    { piece: '4', lignes: s('6800', '1509', 6500) }, // 52'000 × 25 % × 6/12
    { piece: '5', lignes: s('6800', '1549', 3600) },
    { piece: '6', lignes: s('6800', '1521', 4800) }, // 20'000 × 60 % = 12'000 ; 12'000 × 40 %
    { piece: '7', lignes: s('6800', '1510', 6750) },
    { piece: '8', lignes: s('6800', '1530', 2099) },
  ],
};

// ───────────────────────── Comptes transitoires ─────────────────────────
export const manuelMonnier: Exercice = {
  id: 'exercice-cfc3-transports-monnier-transitoires',
  titre: 'Transports Monnier — actifs et passifs transitoires',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  sujets: ['Actifs transitoires', 'Passifs transitoires', 'Charges payées d’avance', 'Charges à payer', 'Intérêt couru (prorata)'],
  raisonSociale: 'Transports Monnier',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Pour cet exercice, la TVA est laissée de côté. Les opérations 1 à 5 ont eu lieu pendant l'année ; les opérations 6 à " +
    "14 sont les écritures transitoires du 31 décembre : chaque charge doit être rattachée à l'exercice qu'elle concerne. " +
    CONSIGNE,
  situation:
    "Transports Monnier livre des marchandises dans tout le canton avec ses camionnettes. Isabelle Monnier possède aussi " +
    "le bâtiment où se trouvent le bureau et l'atelier, financé en partie par une dette hypothécaire.\n\n" +
    "En décembre, elle a payé plusieurs charges qui concernent déjà l'année prochaine, alors que d'autres factures de " +
    "cette année n'arriveront qu'en janvier. Elle vous demande de passer les écritures transitoires pour que le résultat " +
    "de l'exercice soit juste.",
  operations: [
    { numero: '1', date: '2026-03-01', texte: "Paiement par la banque de l'assurance responsabilité civile de l'entreprise, période du 01.03.2026 au 28.02.2027, 3'000.00." },
    { numero: '2', date: '2026-10-31', texte: "Paiement par la banque de l'assurance de l'immeuble commercial, semestre du 01.11.2026 au 30.04.2027, 3'600.00." },
    { numero: '3', date: '2026-12-15', texte: "Paiement par la banque du loyer d'un dépôt pour le premier semestre 2027, 16'800.00." },
    { numero: '4', date: '2026-12-20', texte: 'Paiement par la banque des abonnements à des revues professionnelles pour 2027, 720.00.' },
    { numero: '5', date: '2026-12-28', texte: "Paiement par la banque de la prime d'assurance des camionnettes pour 2027, 960.00." },
    { numero: '6', date: '2026-12-31', texte: 'Loyer du dépôt payé le 15.12 (opération 3) : il concerne entièrement le prochain exercice.' },
    { numero: '7', date: '2026-12-31', texte: 'Abonnements payés le 20.12 (opération 4) : ils concernent entièrement le prochain exercice.' },
    { numero: '8', date: '2026-12-31', texte: 'Prime des camionnettes payée le 28.12 (opération 5) : elle concerne entièrement le prochain exercice.' },
    { numero: '9', date: '2026-12-31', texte: "Assurance responsabilité civile (opération 1) : tenir compte de la part qui concerne l'exercice prochain." },
    { numero: '10', date: '2026-12-31', texte: "Assurance de l'immeuble (opération 2) : tenir compte de la part qui concerne l'exercice prochain." },
    { numero: '11', date: '2026-12-31', texte: "La facture des réparations faites en décembre sur les camionnettes, 4'200.00, n'arrivera qu'en janvier." },
    { numero: '12', date: '2026-12-31', texte: "Les salaires de décembre, 36'000.00, ne seront versés qu'au début de janvier." },
    { numero: '13', date: '2026-12-31', texte: "Réparations en cours sur l'immeuble commercial : la facture de 7'500.00 arrivera l'année prochaine." },
    { numero: '14', date: '2026-12-31', texte: "Dette hypothécaire de 240'000.00 à 3 %, intérêt payable chaque année le 31 août : comptabiliser l'intérêt couru." },
  ],
  ouvertureActif: montants({ '1000': 2500, '1020': 130000, '1100': 22000, '1530': 65000, '1600': 520000 }),
  ouverturePassif: montants({ '2000': 9000, '2401': 240000, '2800': 490500 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, comptesAjoutes: ['6900'] },
  corrige: [
    { piece: '1', lignes: s('6300', '1020', 3000) },
    { piece: '2', lignes: s('6300', '1020', 3600) },
    { piece: '3', lignes: s('6000', '1020', 16800) },
    // Abonnements : 6500 ou 6700 admis (décision de l'enseignant du 26.11.2026), ici et à l'opération 7.
    { piece: '4', lignes: s('6500', '1020', 720), variantes: [s('6700', '1020', 720)] },
    { piece: '5', lignes: s('6300', '1020', 960) },
    { piece: '6', lignes: s('1300', '6000', 16800) },
    { piece: '7', lignes: s('1300', '6500', 720), variantes: [s('1300', '6700', 720)] },
    { piece: '8', lignes: s('1300', '6300', 960) },
    { piece: '9', lignes: s('1300', '6300', 500) }, // 2 mois sur 12
    { piece: '10', lignes: s('1300', '6300', 2400) }, // 4 mois sur 6
    { piece: '11', lignes: s('6200', '2300', 4200) },
    { piece: '12', lignes: s('5200', '2300', 36000) },
    { piece: '13', lignes: s('6100', '2300', 7500) },
    { piece: '14', lignes: s('6900', '2300', 2400) }, // 240'000 × 3 % × 4/12
  ],
};

// ───────────────────────── Clôture de l'entreprise individuelle ─────────────────────────
export const manuelPerrin: Exercice = {
  id: 'exercice-cfc4-horlogerie-perrin-cloture',
  titre: 'Horlogerie Perrin — clôture annuelle de l’entreprise individuelle',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 4,
  sujets: [
    'Inventaire et variation de stock',
    'Ducroire',
    'Amortissements (direct, indirect, constant, dégressif)',
    'Actifs et passifs transitoires',
    'Immeuble locatif hors exploitation',
    'Salaire et intérêt du propriétaire',
    'Bouclement',
  ],
  raisonSociale: 'Horlogerie Perrin',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Pour cet exercice, la TVA est laissée de côté. Les opérations 1 à 10 résument l'année ; les opérations 11 à 25 sont " +
    "les écritures de clôture du 31 décembre. L'immeuble locatif est hors exploitation : ses charges, son amortissement " +
    "et ses intérêts vont en charges hors exploitation, ses loyers en produits hors exploitation. " +
    `${CONSIGNE} Bouclez ensuite l'exercice.`,
  situation:
    "Didier Perrin vend des montres dans sa boutique de la Corraterie, Horlogerie Perrin. Il possède aussi un immeuble " +
    "locatif à Florissant, dont les appartements sont loués.\n\n" +
    "Toutes les opérations courantes de l'année sont comptabilisées. Il vous demande maintenant de passer les écritures " +
    "de clôture : inventaire, ducroire, amortissements, écritures transitoires, puis son salaire et l'intérêt sur ses " +
    "apports, avant de boucler l'exercice.",
  operations: [
    { numero: '1', date: '2026-12-20', texte: "Récapitulatif de l'année : ventes de montres à crédit, 1'650'000.00." },
    { numero: '2', date: '2026-12-20', texte: "Récapitulatif de l'année : paiements des clients sur le compte bancaire, 1'540'000.00." },
    { numero: '3', date: '2026-12-20', texte: "Récapitulatif de l'année : achats de montres à crédit, 990'000.00." },
    { numero: '4', date: '2026-12-20', texte: "Récapitulatif de l'année : paiements aux fournisseurs par la banque, 968'000.00." },
    { numero: '5', date: '2026-12-20', texte: "Récapitulatif de l'année : salaires des employés payés par la banque, 198'000.00." },
    { numero: '6', date: '2026-12-20', texte: "Récapitulatif de l'année : frais d'administration payés par la banque, 19'800.00." },
    { numero: '7', date: '2026-10-20', texte: "Paiement par la poste de l'abonnement à la revue horlogère, du 1er novembre au 31 octobre suivant, 360.00." },
    { numero: '8', date: '2026-12-20', texte: "Récapitulatif de l'année : loyers de l'immeuble locatif encaissés par la banque, 66'000.00." },
    { numero: '9', date: '2026-12-20', texte: "Récapitulatif de l'année : charges de l'immeuble locatif payées par la banque, 13'200.00." },
    { numero: '10', date: '2026-12-20', texte: "Récapitulatif de l'année : prélèvements de Didier Perrin sur le compte bancaire, 44'000.00." },
    { numero: '11', date: '2026-12-31', texte: "Le stock final de montres, selon l'inventaire, est estimé à 396'000.00." },
    { numero: '12', date: '2026-12-31', texte: 'Ajuster le ducroire pour qu’il atteigne 5 % des créances clients.' },
    { numero: '13', date: '2026-12-31', texte: 'Amortissements directs : mobilier 20 % et infrastructure informatique 30 %, de la valeur au bilan.' },
    { numero: '14', date: '2026-12-31', texte: "Véhicules : amortissement indirect constant de 20 % de la valeur d'acquisition, 66'000.00." },
    { numero: '15', date: '2026-12-31', texte: "Immeuble locatif : amortissement indirect décroissant de 2 % de la valeur comptable." },
    { numero: '16', date: '2026-12-31', texte: "Intérêts courus sur l'emprunt bancaire, 9'000.00." },
    { numero: '17', date: '2026-12-31', texte: "Abonnement à la revue payé le 20.10 (opération 7) : tenir compte de la part de l'exercice prochain." },
    {
      numero: '18',
      date: '2026-12-31',
      texte: "Un locataire (loyer annuel 16'800.00) a versé d'avance en décembre le loyer du premier trimestre de l'année prochaine ; il est compris dans l'opération 8.",
    },
    { numero: '19', date: '2026-12-31', texte: "Un autre locataire doit encore son loyer de décembre, 1'300.00." },
    {
      numero: '20',
      date: '2026-12-31',
      texte: "Intérêt couru sur la dette hypothécaire de l'immeuble locatif, 275'000.00 à 3,6 %, échéances semestrielles au 31.03 et au 30.09.",
    },
    { numero: '21', date: '2026-12-31', texte: 'La facture de téléphone de décembre, 210.00, arrivera en janvier.' },
    { numero: '22', date: '2026-12-31', texte: "Montres livrées le 20 décembre, 13'200.00 : la facture n'est pas encore arrivée." },
    { numero: '23', date: '2026-12-31', texte: "Il reste du matériel de bureau en stock pour 280.00, qui sera utilisé l'exercice prochain." },
    { numero: '24', date: '2026-12-31', texte: "Salaire de Didier Perrin pour son travail dans l'entreprise, 55'000.00." },
    { numero: '25', date: '2026-12-31', texte: "Intérêt de 4 % sur le capital de Didier Perrin au 1er janvier, 588'500.00." },
  ],
  ouvertureActif: montants({
    '1000': 2200, '1010': 8800, '1020': 66000, '1100': 275000, '1200': 330000, '1510': 33000, '1521': 22000, '1530': 66000, '1600': 440000,
  }),
  ouverturePassif: montants({ '1109': 16500, '1539': 16500, '1609': 44000, '2000': 82500, '2400': 220000, '2401': 275000, '2800': 588500 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: true, comptesAjoutes: ['6900', '8000', '8100'] },
  corrige: [
    { piece: '1', lignes: s('1100', '3200', 1650000) },
    { piece: '2', lignes: s('1020', '1100', 1540000) },
    { piece: '3', lignes: s('4200', '2000', 990000) },
    { piece: '4', lignes: s('2000', '1020', 968000) },
    { piece: '5', lignes: s('5200', '1020', 198000) },
    { piece: '6', lignes: s('6500', '1020', 19800) },
    { piece: '7', lignes: s('6500', '1010', 360), variantes: [s('6700', '1010', 360)] }, // abonnement : 6500 ou 6700 admis
    { piece: '8', lignes: s('1020', '8100', 66000) },
    { piece: '9', lignes: s('8000', '1020', 13200) },
    { piece: '10', lignes: s('2850', '1020', 44000) },
    { piece: '11', lignes: s('1200', '4280', 66000) },
    { piece: '12', lignes: s('3805', '1109', 2750) }, // 385'000 × 5 % = 19'250 ; ducroire 16'500
    { piece: '13', lignes: [D('6800', 13200), C('1510', 6600), C('1521', 6600)] },
    { piece: '14', lignes: s('6800', '1539', 13200) },
    { piece: '15', lignes: s('8000', '1609', 7920) }, // (440'000 − 44'000) × 2 %
    { piece: '16', lignes: s('6900', '2300', 9000) },
    { piece: '17', lignes: s('1300', '6500', 300), variantes: [s('1300', '6700', 300)] }, // 10 mois sur 12 ; 6500 ou 6700 admis
    { piece: '18', lignes: s('8100', '2300', 4200) },
    { piece: '19', lignes: s('1300', '8100', 1300) },
    { piece: '20', lignes: s('8000', '2300', 2475) }, // 275'000 × 3,6 % × 3/12
    { piece: '21', lignes: s('6510', '2300', 210) },
    { piece: '22', lignes: s('4200', '2300', 13200) },
    { piece: '23', lignes: s('1300', '6500', 280) },
    { piece: '24', lignes: s('5200', '2850', 55000) },
    { piece: '25', lignes: s('6900', '2850', 23540) },
  ],
};

// ───────────────────────── MP : fondation et augmentation du capital ─────────────────────────
export const manuelAlize: Exercice = {
  id: 'exercice-mp3-alize-robotique-fondation',
  titre: 'Alizé Robotique SA — fondation et augmentation du capital',
  niveau: 'MP',
  filiere: 'MP',
  difficulte: 3,
  sujets: ['Souscription et libération', 'Apports en nature', 'Créances apportées et ducroire', 'Bons de participation', 'Agio', 'Frais de fondation (FAO)'],
  raisonSociale: 'Alizé Robotique SA',
  formeJuridique: 'SA',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "La société est fondée en janvier 2026 ; elle n'a pas encore de bilan. Les actionnaires et les participants sont " +
    "suivis dans un seul compte par catégorie. L'agio est viré aux réserves légales issues du capital ; les frais de " +
    "fondation et d'augmentation du capital sont des charges. " + CONSIGNE,
  situation:
    "Trois ingénieurs, Mme Keller, M. Costa et M. Ramseyer, fondent Alizé Robotique SA à Satigny pour concevoir " +
    "des robots d'emballage. Chacun apporte une partie en nature (matériel, véhicule, machine, créances de son ancienne " +
    "activité) et le solde en espèces.\n\n" +
    "Vous tenez la comptabilité dès la fondation : souscription et libération du capital-actions, émission de bons de " +
    "participation, puis, en fin d'année, une augmentation du capital avec agio.",
  operations: [
    { numero: '1', date: '2026-01-05', texte: "Souscription intégrale du capital-actions de 240'000.00, divisé en 240 actions nominatives de 1'000.00." },
    {
      numero: '2',
      date: '2026-01-10',
      texte:
        "Mme Keller libère ses 60 actions : matériel informatique 28'000.00, créances commerciales de 32'000.00 (ducroire de " +
        '10 % à constituer), le solde versé à la banque.',
    },
    { numero: '3', date: '2026-01-10', texte: "M. Costa libère ses 70 actions : un véhicule estimé à 24'000.00, le solde versé à la banque." },
    { numero: '4', date: '2026-01-10', texte: "M. Ramseyer libère les 110 actions restantes : une machine estimée à 45'000.00, le solde versé à la banque." },
    { numero: '5', date: '2026-01-15', texte: "La banque débite une commission de 0,25 % sur les versements en espèces des opérations 2 à 4, et 2'600.00 de frais de fondation." },
    { numero: '6', date: '2026-01-20', texte: "Souscription de 600 bons de participation de 100.00 de valeur nominale, sans droit de vote." },
    { numero: '7', date: '2026-01-25', texte: 'Les participants libèrent entièrement les bons de participation à la banque.' },
    {
      numero: '8',
      date: '2026-11-10',
      texte: "L'assemblée générale décide d'augmenter le capital-actions de 120 actions de 1'000.00, avec un agio de 250.00 par action : souscription intégrale.",
    },
    { numero: '9', date: '2026-11-20', texte: "Les nouvelles actions sont libérées à 60 %, ainsi que l'agio entier, à la banque." },
    { numero: '10', date: '2026-11-25', texte: "Facture du notaire pour l'augmentation du capital, 7'200.00." },
  ],
  ouvertureActif: {},
  ouverturePassif: {},
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, comptesAjoutes: ['1850', '1860', '2810', '6550'] },
  corrige: [
    { piece: '1', lignes: s('1850', '2800', 240000) },
    // 60'000.00 − 28'000.00 − (32'000.00 − 3'200.00) = 3'200.00 versés.
    { piece: '2', lignes: [D('1521', 28000), D('1100', 32000), D('1020', 3200), C('1109', 3200), C('1850', 60000)] },
    { piece: '3', lignes: [D('1530', 24000), D('1020', 46000), C('1850', 70000)] },
    { piece: '4', lignes: [D('1500', 45000), D('1020', 65000), C('1850', 110000)] },
    { piece: '5', lignes: s('6550', '1020', 2885.5) }, // 114'200 × 0,25 % = 285.50 + 2'600
    { piece: '6', lignes: s('1860', '2810', 60000) },
    { piece: '7', lignes: s('1020', '1860', 60000) },
    { piece: '8', lignes: [D('1850', 150000), C('2800', 120000), C('2900', 30000)] },
    { piece: '9', lignes: s('1020', '1850', 102000) }, // 60 % de 120'000 + agio 30'000
    { piece: '10', lignes: s('6550', '2010', 7200) },
  ],
};

// ───────────────────────── MP : titres ─────────────────────────
export const manuelArve: Exercice = {
  id: 'exercice-mp4-arve-placements-titres',
  titre: 'Arve Placements SA — portefeuille de titres',
  niveau: 'MP',
  filiere: 'MP',
  difficulte: 4,
  sujets: ['Achat et vente de titres', 'Coupons et dividendes', 'Impôt anticipé', 'Droits de garde', 'Évaluation à l’inventaire', 'Intérêt couru'],
  raisonSociale: 'Arve Placements SA',
  formeJuridique: 'SA',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Les titres sont portés au prix d'achat, frais compris ; une vente est créditée au compte Titres pour son produit " +
    "net de frais. À la clôture, la différence entre le solde du compte et l'inventaire est un bénéfice ou une perte de " +
    "cours. L'impôt anticipé de 35 % est récupérable. " + CONSIGNE,
  situation:
    "Arve Placements SA, à Lancy, place ses liquidités dans des actions et des obligations suisses. La directrice, " +
    "Mme Pasche, suit le portefeuille avec la banque, qui exécute les ordres et encaisse les coupons.\n\n" +
    "Elle vous confie les opérations de l'année sur titres : ventes, achats, coupons et dividendes, remboursement " +
    "d'obligations, puis l'évaluation du portefeuille et l'intérêt couru au 31 décembre.",
  operations: [
    { numero: '1', date: '2026-03-16', texte: "La banque vend 10 actions B (nominal 500.00) au cours de 2'100.00 ; frais de vente 130.00." },
    { numero: '2', date: '2026-05-19', texte: "La banque encaisse les coupons de 40 obligations de 1'000.00 de nominal, taux 3 %, impôt anticipé 35 %." },
    { numero: '3', date: '2026-05-28', texte: 'La banque encaisse le dividende de 6 actions (nominal 500.00) : 50.00 par action, impôt anticipé 35 %.' },
    {
      numero: '4',
      date: '2026-06-30',
      texte: "Échéance : la banque encaisse le remboursement de 5 obligations Ville de Sion de 10'000.00 au nominal et leur dernier coupon annuel de 2,5 %, impôt anticipé 35 %.",
    },
    { numero: '5', date: '2026-08-30', texte: 'La banque achète 12 actions Helvo (nominal 50.00) au cours de 820.00 ; frais d’achat 104.00.' },
    { numero: '6', date: '2026-09-30', texte: 'La banque débite 60.00 de droits de garde pour le portefeuille.' },
    { numero: '7', date: '2026-11-20', texte: "L'Administration fédérale des contributions rembourse sur le compte bancaire l'impôt anticipé des opérations 2 à 4." },
    { numero: '8', date: '2026-12-31', texte: "Inventaire du portefeuille au cours du 31 décembre : 71'000.00. Comptabiliser la différence de cours." },
    {
      numero: '9',
      date: '2026-12-31',
      texte: "Intérêt couru sur 3 obligations Canton du Valais de 10'000.00 en portefeuille, taux 3 %, coupon annuel au 15 septembre (année de 360 jours).",
    },
  ],
  ouvertureActif: montants({ '1020': 220000, '1060': 130000, '1100': 32000, '1500': 160000 }),
  ouverturePassif: montants({ '2000': 22000, '2800': 440000, '2900': 30000, '2970': 50000 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false },
  corrige: [
    { piece: '1', lignes: s('1020', '1060', 20870) }, // 10 × 2'100 − 130
    { piece: '2', lignes: [D('1020', 780), D('1176', 420), C('6952', 1200)] },
    { piece: '3', lignes: [D('1020', 195), D('1176', 105), C('6952', 300)] },
    { piece: '4', lignes: [D('1020', 50812.5), D('1176', 437.5), C('1060', 50000), C('6952', 1250)] },
    { piece: '5', lignes: s('1060', '1020', 9944) }, // 12 × 820 + 104
    { piece: '6', lignes: s('6940', '1020', 60) },
    { piece: '7', lignes: s('1020', '1176', 962.5) },
    { piece: '8', lignes: s('1060', '6952', 1926) }, // 130'000 − 20'870 − 50'000 + 9'944 = 69'074 ; inventaire 71'000
    { piece: '9', lignes: s('1300', '6952', 262.5) }, // 30'000 × 3 % × 105/360
  ],
};

export const exercicesManuel: Exercice[] = [
  manuelGolay, manuelCaveEauxVives, manuelVuilleumier, manuelJaquier, manuelDelices, manuelMonnier, manuelPerrin, manuelAlize, manuelArve,
];
