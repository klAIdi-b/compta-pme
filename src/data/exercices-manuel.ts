// Exercices de journal tirés des cas du manuel E&S : volume 1, ch. 1 « Structure du bilan et du résultat », volume 2,
// ch. 12 « Comptabilité de l'entreprise commerciale » (édition 2019) et ch. 14 « TVA » (édition 2022). Droits d'utilisation obtenus par
// l'enseignant (09.11.2026) ; choix : reformuler en gardant les cas. Entreprises genevoises fictives.
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

// ───────────────────────── Ch. 1 — bilan, comptes de bilan, écritures composées ─────────────────────────
export const manuelFavre: Exercice = {
  id: 'manuel-cfc1-favre-evenements',
  titre: 'Favre Événements — bilan et comptes de bilan',
  niveau: 'CFC1',
  filiere: 'CFC',
  difficulte: 1,
  sujets: ["Bilan d'ouverture", 'Masses du bilan', 'Comptes de bilan', 'Facture comptabilisée ou non', 'Écritures composées'],
  raisonSociale: 'Favre Événements',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Commencez par la fiche « Bilan d'ouverture » : classez chaque compte dans sa masse et calculez la fortune nette. " +
    `${CONSIGNE} Les opérations ne touchent que des comptes du bilan et le compte privé. Bouclez ensuite l'exercice ` +
    "(aucune autre opération jusqu'au 31.12.2026).",
  situation:
    "Claire Favre organise des mariages, des séminaires et des fêtes d'entreprise dans tout le canton de Genève. Elle a " +
    "fondé Favre Événements il y a deux ans, en raison individuelle : elle loue du mobilier, de la sonorisation et " +
    "transporte le matériel avec ses propres véhicules.\n\n" +
    "Au début de l'année, elle renouvelle une partie de son équipement et rembourse son emprunt. Elle vous confie le " +
    "journal du premier trimestre : rien que des achats d'équipement, des paiements et des mouvements d'argent entre la " +
    "caisse, la poste et la banque, mais plusieurs opérations touchent plus de deux comptes.",
  operations: [
    { numero: '1', date: '2026-01-05', texte: "Achat à crédit d'un logiciel de gestion des réservations, 450.00." },
    { numero: '2', date: '2026-01-08', texte: "Un client verse sur le compte bancaire un acompte sur sa facture, 1'290.00." },
    { numero: '3', date: '2026-01-12', texte: 'Claire Favre prélève 250.00 en espèces pour ses besoins personnels.' },
    { numero: '4', date: '2026-01-15', texte: "Achat d'une camionnette d'occasion, 12'500.00 ; nous comptabilisons la facture." },
    { numero: '5', date: '2026-01-20', texte: "Paiement par la poste d'une facture de fournisseur déjà comptabilisée, 345.00." },
    { numero: '6', date: '2026-01-31', texte: "Remboursement partiel de l'emprunt bancaire par virement postal, 4'000.00." },
    { numero: '7', date: '2026-02-05', texte: "Retrait de 500.00 au bancomat pour alimenter la caisse de l'entreprise." },
    { numero: '8', date: '2026-02-10', texte: "Virement de 1'500.00 du compte postal sur le compte bancaire." },
    { numero: '9', date: '2026-02-15', texte: "Achat de tables pliantes, 3'700.00 ; nous comptabilisons la facture." },
    { numero: '10', date: '2026-02-20', texte: 'Le fournisseur accorde un rabais de 500.00 pour des tables abîmées à la livraison (opération 9).' },
    { numero: '11', date: '2026-02-28', texte: 'Paiement par la poste du solde de la facture des tables (opérations 9 et 10).' },
    { numero: '12', date: '2026-03-05', texte: "Claire Favre apporte 12'000.00 à l'entreprise, versés sur le compte bancaire." },
    {
      numero: '13',
      date: '2026-03-10',
      texte: "Achat d'une installation de sonorisation, 2'400.00 : 1'200.00 par la poste, 1'000.00 en espèces, le solde à crédit.",
    },
    {
      numero: '14',
      date: '2026-03-20',
      texte:
        "Achat d'un minibus, 32'000.00 : le garage reprend notre ancien véhicule à sa valeur au bilan, 12'000.00, et nous " +
        'payons le solde par la banque.',
    },
    {
      numero: '15',
      date: '2026-03-25',
      texte: "Un client règle le solde de sa facture, 1'110.00 : il nous livre du mobilier pour 600.00 et vire 510.00 sur le compte postal.",
    },
  ],
  ouvertureActif: montants({ '1000': 1500, '1010': 17000, '1020': 9000, '1100': 2400, '1510': 52000, '1521': 26000, '1530': 25000 }),
  ouverturePassif: montants({ '2010': 6500, '2400': 40000, '2800': 86400 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: true, ficheBilanOuverture: true },
  corrige: [
    { piece: '1', lignes: s('1521', '2010', 450) },
    { piece: '2', lignes: s('1020', '1100', 1290) },
    { piece: '3', lignes: s('2850', '1000', 250) },
    { piece: '4', lignes: s('1530', '2010', 12500) },
    { piece: '5', lignes: s('2010', '1010', 345) },
    { piece: '6', lignes: s('2400', '1010', 4000) },
    { piece: '7', lignes: s('1000', '1020', 500) },
    { piece: '8', lignes: s('1020', '1010', 1500) },
    { piece: '9', lignes: s('1510', '2010', 3700) },
    { piece: '10', lignes: s('2010', '1510', 500) },
    { piece: '11', lignes: s('2010', '1010', 3200) },
    { piece: '12', lignes: s('1020', '2800', 12000) },
    { piece: '13', lignes: [D('1510', 2400), C('1010', 1200), C('1000', 1000), C('2010', 200)] },
    { piece: '14', lignes: [D('1530', 32000), C('1530', 12000), C('1020', 20000)] },
    { piece: '15', lignes: [D('1510', 600), D('1010', 510), C('1100', 1110)] },
  ],
};

// ───────────────────────── Ch. 12 — entreprise commerciale ─────────────────────────
export const manuelVinotheque: Exercice = {
  id: 'manuel-cfc1-vinotheque-des-paquis',
  titre: 'Vinothèque des Pâquis — marchandises, rabais et escomptes',
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
  raisonSociale: 'Vinothèque des Pâquis',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    `L'entreprise n'est pas assujettie à la TVA. ${CONSIGNE} Après l'inventaire (opération 17), remplissez la fiche ` +
    "« Marge brute » d'après vos comptes, puis bouclez l'exercice. La fiche « Échelle des prix » se fait à part.",
  situation:
    "La Vinothèque des Pâquis, rue de Berne, appartient à Sofia Marchetti. Elle vend des vins suisses et italiens aux " +
    "particuliers et livre plusieurs restaurants du quartier.\n\n" +
    "Ses fournisseurs lui accordent des escomptes si elle paie vite, et elle-même consent des rabais quand une livraison " +
    "arrive en retard. Elle vous demande de tenir le journal du premier trimestre avec les bons comptes de marchandises, " +
    "puis de calculer sa marge brute : elle veut savoir ce que lui rapporte réellement son commerce.",
  operations: [
    { numero: '1', date: '2026-01-06', texte: "Achat de vins à crédit, 19'600.00 ; conditions : 30 jours net ou 2 % d'escompte à 10 jours." },
    { numero: '2', date: '2026-01-08', texte: "Frais de transport de cet achat payés en espèces, 300.00 (facture non comptabilisée)." },
    { numero: '3', date: '2026-01-10', texte: 'Retour au fournisseur de douze bouteilles bouchonnées, 600.00 (opération 1).' },
    { numero: '4', date: '2026-01-15', texte: "Paiement par la banque de la facture de l'opération 1, déduction faite du retour et de l'escompte de 2 %." },
    { numero: '5', date: '2026-01-20', texte: "Ventes au comptant du mois, 29'400.00." },
    { numero: '6', date: '2026-01-25', texte: "Vente à crédit à un restaurant, 6'500.00." },
    { numero: '7', date: '2026-01-30', texte: 'Rabais de 10 % accordé à ce restaurant pour une livraison tardive (facture comptabilisée).' },
    { numero: '8', date: '2026-02-05', texte: "Le restaurant paie le solde de sa facture par la banque, avec 2 % d'escompte." },
    { numero: '9', date: '2026-02-08', texte: "Versement de 25'000.00 de la caisse sur le compte bancaire." },
    { numero: '10', date: '2026-02-10', texte: 'Frais de livraison des vins vendus, payés par la banque, 240.00.' },
    { numero: '11', date: '2026-02-15', texte: 'Un client retourne trois cartons livrés en décembre, 450.00 (facture comptabilisée).' },
    { numero: '12', date: '2026-02-20', texte: 'Sofia Marchetti prend des vins pour une fête de famille, 380.00 au prix coûtant.' },
    { numero: '13', date: '2026-02-28', texte: "Droits de douane sur un achat de vins italiens, payés par la banque, 210.00." },
    { numero: '14', date: '2026-03-05', texte: "Loyer du magasin payé par la banque, 2'800.00." },
    { numero: '15', date: '2026-03-10', texte: "Achat de vins à crédit, 7'200.00." },
    { numero: '16', date: '2026-03-12', texte: 'Le fournisseur accorde une remise de 5 % pour la quantité achetée (opération 15).' },
    { numero: '17', date: '2026-12-31', texte: "Inventaire final : le stock de marchandises est évalué à 25'500.00." },
  ],
  ouvertureActif: montants({ '1000': 2000, '1020': 30000, '1100': 6000, '1200': 23000, '1510': 25000 }),
  ouverturePassif: montants({ '2000': 9500, '2400': 15000, '2800': 61500 }),
  mode: 'entrainement',
  parametres: {
    ...parametresBase,
    corrigerBouclement: true,
    ficheMargeBrute: true,
    echellePrix: {
      article: 'un carton de six bouteilles de gamay',
      pab: f(90),
      rabaisObtenu: 5,
      escompteObtenu: 2,
      fraisAchat: { type: 'chf', valeur: f(6.21) },
      fraisGeneraux: 25,
      beneficeNet: 20,
      escompteAccorde: 0,
      rabaisAccorde: 10,
    },
  },
  corrige: [
    { piece: '1', lignes: s('4200', '2000', 19600) },
    { piece: '2', lignes: s('4270', '1000', 300) },
    { piece: '3', lignes: s('2000', '4200', 600) },
    { piece: '4', lignes: [D('2000', 19000), C('1020', 18620), C('4209', 380)] },
    { piece: '5', lignes: s('1000', '3200', 29400) },
    { piece: '6', lignes: s('1100', '3200', 6500) },
    { piece: '7', lignes: s('3209', '1100', 650) },
    { piece: '8', lignes: [D('1020', 5733), D('3209', 117), C('1100', 5850)] },
    { piece: '9', lignes: s('1020', '1000', 25000) },
    { piece: '10', lignes: s('3210', '1020', 240) },
    { piece: '11', lignes: s('3200', '1100', 450) },
    { piece: '12', lignes: s('2850', '3720', 380) },
    { piece: '13', lignes: s('4270', '1020', 210) },
    { piece: '14', lignes: s('6000', '1020', 2800) },
    { piece: '15', lignes: s('4200', '2000', 7200) },
    { piece: '16', lignes: s('2000', '4209', 360) },
    { piece: '17', lignes: s('1200', '4280', 2500) },
  ],
};

// ───────────────────────── Ch. 14 — TVA (vol. 2, exercice 14.8, taux actuels 8,1 % et 2,6 %) ─────────────────────────
// Montants hors taxe du livre conservés ; montants TVA comprise recalculés aux taux en vigueur (arrondi aux 5 centimes).
export const manuelLacroix: Exercice = {
  id: 'manuel-cfc2-maison-lacroix-tva',
  titre: 'Maison Lacroix — TVA du premier trimestre',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 2,
  sujets: ['TVA au net (8,1 % et 2,6 %)', 'Exportation sans TVA', 'Rabais avec correction de la TVA', 'Décompte et paiement de la TVA'],
  raisonSociale: 'Maison Lacroix',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net). Taux : 8,1 % sur le mobilier, la " +
    "décoration, l'énergie et le téléphone ; 2,6 % sur les journaux. Les livraisons à l'étranger sont exonérées. " +
    `${CONSIGNE} L'opération 14 est le décompte TVA du trimestre.`,
  situation:
    "Maison Lacroix vend du mobilier et des objets de décoration à Carouge. Hélène Lacroix a ouvert le magasin cette " +
    "année ; les ventes du comptoir sont enregistrées chaque fin de mois, et une première commande est partie à " +
    "l'étranger.\n\n" +
    "Elle vous confie la comptabilité du premier trimestre : séparer la TVA à chaque opération, établir le décompte au " +
    "31 mars, puis enregistrer le paiement à l'Administration fédérale des contributions.",
  operations: [
    { numero: '1', date: '2026-01-20', texte: "Première vente de marchandises à l'étranger, sur facture, 10'800.00 (exportation exonérée de TVA)." },
    { numero: '2', date: '2026-01-31', texte: "Ventes du mois en espèces, 6'486.00 (TVA 8,1 % comprise)." },
    { numero: '3', date: '2026-01-31', texte: "Versement de 6'000.00 de la caisse sur le compte postal." },
    { numero: '4', date: '2026-02-14', texte: "Vente exceptionnelle au comptant pour la Saint-Valentin, 11'891.00 (TVA 8,1 % comprise)." },
    {
      numero: '5',
      date: '2026-02-15',
      texte: "Paiement par virement postal des factures d'électricité et de téléphone de janvier, non comptabilisées, 432.40 (TVA 8,1 % comprise).",
    },
    { numero: '6', date: '2026-02-25', texte: "Achat de marchandises à crédit, 25'200.00 hors TVA (TVA 8,1 %)." },
    { numero: '7', date: '2026-02-28', texte: "Ventes du mois en espèces, 7'350.80 (TVA 8,1 % comprise)." },
    {
      numero: '8',
      date: '2026-03-03',
      texte: 'Une partie des marchandises reçues le 25.02 est défectueuse : le fournisseur accorde un rabais de 540.50 (TVA 8,1 % comprise).',
    },
    { numero: '9', date: '2026-03-04', texte: 'Paiement par virement bancaire du montant net de la facture du 25.02 (opérations 6 et 8).' },
    { numero: '10', date: '2026-03-15', texte: "Achat de marchandises à crédit, 9'729.00 (TVA 8,1 % comprise)." },
    {
      numero: '11',
      date: '2026-03-20',
      texte: "Paiement par virement postal de l'abonnement au quotidien régional, facture non comptabilisée, 410.40 (TVA 2,6 % comprise).",
    },
    { numero: '12', date: '2026-03-31', texte: "Ventes du mois en espèces, 32'430.00 (TVA 8,1 % comprise)." },
    {
      numero: '13',
      date: '2026-03-31',
      texte: "Sur les ventes encaissées ce jour, 20'000.00 sont versés sur le compte bancaire ; Hélène Lacroix garde le solde pour ses besoins personnels.",
    },
    { numero: '14', date: '2026-03-31', texte: "Décompte TVA du premier trimestre : virer l'impôt préalable et le solde dû à l'AFC." },
    { numero: '15', date: '2026-04-20', texte: 'Paiement de la TVA due par virement bancaire.' },
  ],
  ouvertureActif: montants({ '1000': 3000, '1010': 8000, '1020': 25000, '1100': 4000, '1200': 40000, '1510': 30000 }),
  ouverturePassif: montants({ '2000': 6000, '2800': 104000 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, tvaMethode: 'net' },
  corrige: [
    { piece: '1', lignes: s('1100', '3200', 10800) },
    { piece: '2', lignes: [D('1000', 6486), C('3200', 6000), C('2200', 486)] },
    { piece: '3', lignes: s('1010', '1000', 6000) },
    { piece: '4', lignes: [D('1000', 11891), C('3200', 11000), C('2200', 891)] },
    { piece: '5', lignes: [D('6700', 400), D('1171', 32.4), C('1010', 432.4)] },
    { piece: '6', lignes: [D('4200', 25200), D('1170', 2041.2), C('2000', 27241.2)] },
    { piece: '7', lignes: [D('1000', 7350.8), C('3200', 6800), C('2200', 550.8)] },
    { piece: '8', lignes: [D('2000', 540.5), C('4200', 500), C('1170', 40.5)] },
    { piece: '9', lignes: s('2000', '1020', 26700.7) },
    { piece: '10', lignes: [D('4200', 9000), D('1170', 729), C('2000', 9729)] },
    { piece: '11', lignes: [D('6700', 400), D('1171', 10.4), C('1010', 410.4)] },
    { piece: '12', lignes: [D('1000', 32430), C('3200', 30000), C('2200', 2430)] },
    { piece: '13', lignes: [D('1020', 20000), D('2850', 12430), C('1000', 32430)] },
    { piece: '14', lignes: [D('2200', 4357.8), C('1170', 2729.7), C('1171', 42.8), C('2205', 1585.3)] },
    { piece: '15', lignes: s('2205', '1020', 1585.3) },
  ],
};

// ───────────────────────── Ch. 22 — pertes sur créances (vol. 3, exercices 22.1 et 22.2) ─────────────────────────
export const manuelBrodard: Exercice = {
  id: 'manuel-cfc3-materiaux-brodard-creances',
  titre: 'Matériaux Brodard — pertes sur créances et ducroire',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  sujets: ['Poursuites et frais de poursuite', 'Acte de défaut de biens', 'Créances douteuses', 'Créance amortie récupérée', 'Ducroire'],
  raisonSociale: 'Matériaux Brodard',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "L'entreprise n'est pas assujettie à la TVA. Les frais de poursuite avancés sont à la charge du débiteur. Une " +
    "créance amortie lors d'un exercice précédent et récupérée est un produit exceptionnel. " +
    `${CONSIGNE} Au 31.12, le ducroire est fixé à 5 % des créances clients (sans les créances douteuses).`,
  situation:
    "Matériaux Brodard vend des matériaux de construction aux artisans et aux particuliers de la région de Vernier. Pierre " +
    "Brodard accorde volontiers des délais de paiement, mais plusieurs clients ne paient plus : relances, poursuites, " +
    "faillites.\n\n" +
    "Il vous confie le suivi comptable de ses créances pour l'année : enregistrer les pertes, les montants récupérés, " +
    "les créances douteuses, puis ajuster le ducroire au 31 décembre.",
  operations: [
    { numero: '1', date: '2026-01-10', texte: "Vente de marchandises à crédit à Pittet, un de nos plus gros clients, 15'700.00." },
    { numero: '2', date: '2026-02-16', texte: "Trois rappels restés sans réponse : nous poursuivons Pittet et avançons 103.00 de frais à l'Office des poursuites, par virement postal." },
    { numero: '3', date: '2026-04-20', texte: "Pittet est insolvable, la poursuite est restée infructueuse : l'Office des poursuites nous remet un acte de défaut de biens de 15'803.00." },
    { numero: '4', date: '2026-05-05', texte: "Notre client Prisco nous devait 12'300.00. À la suite des poursuites, l'Office vire 5'500.00 sur notre compte bancaire ; acte de défaut de biens pour le solde." },
    { numero: '5', date: '2026-05-20', texte: "Faillite de Joray, débiteur à risque dont la créance de 4'500.00 figure en créances douteuses : l'Office des faillites vire 3'200.00 sur le compte postal, le solde est perdu." },
    { numero: '6', date: '2026-06-10', texte: "Contre toute attente, nous recevons sur le compte bancaire 5'000.00 sur la créance de Lumière, complètement amortie il y a trois ans." },
    { numero: '7', date: '2026-08-14', texte: "Vente de marchandises à crédit à Patrizio, 19'000.00 ; conditions : net à 60 jours ou 2 % d'escompte à 20 jours." },
    { numero: '8', date: '2026-09-15', texte: "Notre client Grivet nous devait 12'500.00 : les poursuites rapportent 3'500.00 en espèces ; acte de défaut de biens pour le solde." },
    { numero: '9', date: '2026-09-22', texte: "Notre client Paulin est parti sans laisser d'adresse ; après de vaines recherches, nous annulons sa créance de 1'030.00." },
    { numero: '10', date: '2026-10-12', texte: "Lionel, dont nous avions amorti la créance il y a six ans, verse 7'120.00 sur notre compte postal." },
    { numero: '11', date: '2026-10-26', texte: "Nous réglons une facture de marchandises déjà comptabilisée en cédant d'anciens actes de défaut de biens (créances amorties), pour 2'930.00." },
    { numero: '12', date: '2026-12-15', texte: 'Quatre mois plus tard, la facture de Patrizio (opération 7) est toujours impayée : nous la virons en créances douteuses.' },
    { numero: '13', date: '2026-12-31', texte: 'Ajustement du ducroire : 5 % des créances clients (compte Créances clients, sans les créances douteuses).' },
  ],
  ouvertureActif: montants({ '1000': 3000, '1010': 10000, '1020': 60000, '1100': 45000, '1108': 4500, '1200': 30000, '1500': 40000 }),
  ouverturePassif: montants({ '1109': 1500, '2000': 15000, '2800': 176000 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false },
  corrige: [
    { piece: '1', lignes: s('1100', '3200', 15700) },
    { piece: '2', lignes: s('1100', '1010', 103) },
    { piece: '3', lignes: s('3805', '1100', 15803) },
    { piece: '4', lignes: [D('1020', 5500), D('3805', 6800), C('1100', 12300)] },
    { piece: '5', lignes: [D('1010', 3200), D('3805', 1300), C('1108', 4500)] },
    { piece: '6', lignes: s('1020', '8510', 5000) },
    { piece: '7', lignes: s('1100', '3200', 19000) },
    { piece: '8', lignes: [D('1000', 3500), D('3805', 9000), C('1100', 12500)] },
    { piece: '9', lignes: s('3805', '1100', 1030) },
    { piece: '10', lignes: s('1010', '8510', 7120) },
    { piece: '11', lignes: s('2000', '8510', 2930) },
    { piece: '12', lignes: s('1108', '1100', 19000) },
    // Créances clients 19'170.00 × 5 % = 958.50 ; ducroire 1'500.00 → diminution de 541.50.
    { piece: '13', lignes: s('1109', '3805', 541.5) },
  ],
};

// ───────────────────────── Ch. 23 — amortissements (vol. 3, exercices 23.9 à 23.11) ─────────────────────────
export const manuelMontBlanc: Exercice = {
  id: 'manuel-cfc3-imprimerie-mont-blanc-amortissements',
  titre: 'Imprimerie du Mont-Blanc — amortissements de fin d’année',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  sujets: ['Amortissement direct et indirect', 'Linéaire (constant) et dégressif (décroissant)', 'Prorata temporis', 'Valeur pour mémoire'],
  raisonSociale: 'Imprimerie du Mont-Blanc',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "L'entreprise n'est pas assujettie à la TVA. Les machines et l'outillage sont amortis de façon indirecte (fonds " +
    "d'amortissements cumulés), les autres immobilisations de façon directe. Le taux constant s'applique à la valeur " +
    "d'acquisition, le taux dégressif à la valeur comptable. " + CONSIGNE,
  situation:
    "L'Imprimerie du Mont-Blanc, rue du Mont-Blanc, imprime des affiches, des cartes et des brochures pour les commerces " +
    "et les associations genevoises. Julien Mottet, le propriétaire, a acheté cette année une nouvelle presse numérique.\n\n" +
    "Avant d'établir les comptes annuels, il vous demande de calculer et de comptabiliser les amortissements de chaque " +
    "immobilisation, selon la méthode choisie pour chacune.",
  operations: [
    { numero: '1', date: '2026-06-30', texte: "Achat d'une presse numérique, 48'000.00 ; nous comptabilisons la facture." },
    { numero: '2', date: '2026-09-15', texte: 'Paiement de la presse par virement bancaire.' },
    { numero: '3', date: '2026-12-31', texte: "Machines possédées toute l'année (valeur d'acquisition 150'000.00) : amortissement indirect constant de 25 %." },
    { numero: '4', date: '2026-12-31', texte: 'Presse achetée le 30.06 : même méthode et même taux que les autres machines, prorata temporis.' },
    { numero: '5', date: '2026-12-31', texte: "Outillage (valeur d'acquisition 16'000.00) : amortissement indirect constant de 20 %." },
    { numero: '6', date: '2026-12-31', texte: "Ordinateurs achetés il y a un an pour 18'000.00 : amortissement direct dégressif de 40 % (deuxième année)." },
    { numero: '7', date: '2026-12-31', texte: "Mobilier (valeur d'acquisition 40'000.00) : amortissement direct constant de 15 %." },
    { numero: '8', date: '2026-12-31', texte: "Le véhicule figure au bilan pour 1'850.00 : nous ne laissons que 1.00 pour mémoire (amortissement direct)." },
  ],
  ouvertureActif: montants({
    '1000': 2000, '1020': 80000, '1100': 15000, '1200': 10000, '1500': 150000, '1510': 22000, '1520': 10800, '1530': 1850, '1540': 16000,
  }),
  ouverturePassif: montants({ '1509': 45000, '1549': 6400, '2000': 10000, '2400': 60000, '2800': 186250 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, comptesAjoutes: ['1540', '1549'] },
  corrige: [
    { piece: '1', lignes: s('1500', '2000', 48000) },
    { piece: '2', lignes: s('2000', '1020', 48000) },
    { piece: '3', lignes: s('6800', '1509', 37500) },
    { piece: '4', lignes: s('6800', '1509', 6000) }, // 48'000 × 25 % × 6/12
    { piece: '5', lignes: s('6800', '1549', 3200) },
    { piece: '6', lignes: s('6800', '1520', 4320) }, // 18'000 × 60 % = 10'800 ; 10'800 × 40 %
    { piece: '7', lignes: s('6800', '1510', 6000) },
    { piece: '8', lignes: s('6800', '1530', 1849) },
  ],
};

// ───────────────────────── Ch. 24 — comptes transitoires (vol. 3, exercices 24.8 et 24.10) ─────────────────────────
export const manuelTruffaz: Exercice = {
  id: 'manuel-cfc3-truffaz-transports-transitoires',
  titre: 'Truffaz Transports — actifs et passifs transitoires',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  sujets: ['Actifs transitoires', 'Passifs transitoires', 'Charges payées d’avance', 'Charges à payer', 'Intérêt couru (prorata)'],
  raisonSociale: 'Truffaz Transports',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "L'entreprise n'est pas assujettie à la TVA. Les opérations 1 à 5 ont eu lieu pendant l'année ; les opérations 6 à " +
    "14 sont les écritures transitoires du 31 décembre : chaque charge doit être rattachée à l'exercice qu'elle concerne. " +
    CONSIGNE,
  situation:
    "Truffaz Transports livre des marchandises dans tout le canton avec ses camionnettes. Anne Truffaz possède aussi le " +
    "bâtiment où se trouvent le bureau et l'atelier, financé en partie par une dette hypothécaire.\n\n" +
    "En décembre, elle a payé plusieurs charges qui concernent déjà l'année prochaine, alors que d'autres factures de " +
    "cette année n'arriveront qu'en janvier. Elle vous demande de passer les écritures transitoires pour que le résultat " +
    "de l'exercice soit juste.",
  operations: [
    { numero: '1', date: '2026-03-01', texte: "Paiement par la banque de l'assurance responsabilité civile de l'entreprise, période du 01.03.2026 au 28.02.2027, 2'400.00." },
    { numero: '2', date: '2026-10-31', texte: "Paiement par la banque de l'assurance de l'immeuble commercial, semestre du 01.11.2026 au 30.04.2027, 3'000.00." },
    { numero: '3', date: '2026-12-15', texte: "Paiement par la banque du loyer d'un dépôt pour le premier semestre 2027, 15'000.00." },
    { numero: '4', date: '2026-12-20', texte: 'Paiement par la banque des abonnements à des revues professionnelles pour 2027, 600.00.' },
    { numero: '5', date: '2026-12-28', texte: "Paiement par la banque de la prime d'assurance des camionnettes pour 2027, 800.00." },
    { numero: '6', date: '2026-12-31', texte: 'Loyer du dépôt payé le 15.12 (opération 3) : il concerne entièrement le prochain exercice.' },
    { numero: '7', date: '2026-12-31', texte: 'Abonnements payés le 20.12 (opération 4) : ils concernent entièrement le prochain exercice.' },
    { numero: '8', date: '2026-12-31', texte: 'Prime des camionnettes payée le 28.12 (opération 5) : elle concerne entièrement le prochain exercice.' },
    { numero: '9', date: '2026-12-31', texte: "Assurance responsabilité civile (opération 1) : tenir compte de la part qui concerne l'exercice prochain." },
    { numero: '10', date: '2026-12-31', texte: "Assurance de l'immeuble (opération 2) : tenir compte de la part qui concerne l'exercice prochain." },
    { numero: '11', date: '2026-12-31', texte: "La facture des réparations faites en décembre sur les camionnettes, 3'900.00, n'arrivera qu'en janvier." },
    { numero: '12', date: '2026-12-31', texte: "Les salaires de décembre, 32'000.00, ne seront versés qu'au début de janvier." },
    { numero: '13', date: '2026-12-31', texte: "Réparations en cours sur l'immeuble commercial : la facture de 6'000.00 arrivera l'année prochaine." },
    { numero: '14', date: '2026-12-31', texte: "Dette hypothécaire de 230'000.00 à 3 %, intérêt payable chaque année le 31 août : comptabiliser l'intérêt couru." },
  ],
  ouvertureActif: montants({ '1000': 2000, '1020': 120000, '1100': 20000, '1530': 60000, '1600': 500000 }),
  ouverturePassif: montants({ '2000': 8000, '2401': 230000, '2800': 464000 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, comptesAjoutes: ['6900'] },
  corrige: [
    { piece: '1', lignes: s('6300', '1020', 2400) },
    { piece: '2', lignes: s('6300', '1020', 3000) },
    { piece: '3', lignes: s('6000', '1020', 15000) },
    { piece: '4', lignes: s('6500', '1020', 600) },
    { piece: '5', lignes: s('6300', '1020', 800) },
    { piece: '6', lignes: s('1300', '6000', 15000) },
    { piece: '7', lignes: s('1300', '6500', 600) },
    { piece: '8', lignes: s('1300', '6300', 800) },
    { piece: '9', lignes: s('1300', '6300', 400) }, // 2 mois sur 12
    { piece: '10', lignes: s('1300', '6300', 2000) }, // 4 mois sur 6
    { piece: '11', lignes: s('6200', '2300', 3900) },
    { piece: '12', lignes: s('5200', '2300', 32000) },
    { piece: '13', lignes: s('6100', '2300', 6000) },
    { piece: '14', lignes: s('6900', '2300', 2300) }, // 230'000 × 3 % × 4/12
  ],
};

// ───────────────────────── Ch. 35 — clôture de l'entreprise individuelle (vol. 4 profil E, exercice 35.5) ─────────────────────────
// Les douze écritures de clôture du livre sont reprises ; la balance du livre (illisible dans le fichier numérisé) est
// remplacée par un bilan d'ouverture et des opérations de l'année résumées, construits pour l'exercice.
export const manuelLambert: Exercice = {
  id: 'manuel-cfc4-lambert-horlogerie-cloture',
  titre: 'Lambert Horlogerie — clôture annuelle de l’entreprise individuelle',
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
  raisonSociale: 'Lambert Horlogerie',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "L'entreprise n'est pas assujettie à la TVA. Les opérations 1 à 10 résument l'année ; les opérations 11 à 25 sont " +
    "les écritures de clôture du 31 décembre. L'immeuble locatif est hors exploitation : ses charges, son amortissement " +
    "et ses intérêts vont en charges hors exploitation, ses loyers en produits hors exploitation. " +
    `${CONSIGNE} Bouclez ensuite l'exercice.`,
  situation:
    "Patrick Lambert vend des montres dans sa boutique de la rue du Rhône, Lambert Horlogerie. Il possède aussi un immeuble locatif à " +
    "Champel, dont les appartements sont loués.\n\n" +
    "Toutes les opérations courantes de l'année sont comptabilisées. Il vous demande maintenant de passer les écritures " +
    "de clôture : inventaire, ducroire, amortissements, écritures transitoires, puis son salaire et l'intérêt sur ses " +
    "apports, avant de boucler l'exercice.",
  operations: [
    { numero: '1', date: '2026-12-20', texte: "Récapitulatif de l'année : ventes de montres à crédit, 1'500'000.00." },
    { numero: '2', date: '2026-12-20', texte: "Récapitulatif de l'année : paiements des clients sur le compte bancaire, 1'400'000.00." },
    { numero: '3', date: '2026-12-20', texte: "Récapitulatif de l'année : achats de montres à crédit, 900'000.00." },
    { numero: '4', date: '2026-12-20', texte: "Récapitulatif de l'année : paiements aux fournisseurs par la banque, 880'000.00." },
    { numero: '5', date: '2026-12-20', texte: "Récapitulatif de l'année : salaires des employés payés par la banque, 180'000.00." },
    { numero: '6', date: '2026-12-20', texte: "Récapitulatif de l'année : frais d'administration payés par la banque, 18'000.00." },
    { numero: '7', date: '2026-10-20', texte: "Paiement par la poste de l'abonnement à la revue horlogère, du 1er novembre au 31 octobre suivant, 300.00." },
    { numero: '8', date: '2026-12-20', texte: "Récapitulatif de l'année : loyers de l'immeuble locatif encaissés par la banque, 60'000.00." },
    { numero: '9', date: '2026-12-20', texte: "Récapitulatif de l'année : charges de l'immeuble locatif payées par la banque, 12'000.00." },
    { numero: '10', date: '2026-12-20', texte: "Récapitulatif de l'année : prélèvements de Patrick Lambert sur le compte bancaire, 40'000.00." },
    { numero: '11', date: '2026-12-31', texte: "Le stock final de montres, selon l'inventaire, est estimé à 360'000.00." },
    { numero: '12', date: '2026-12-31', texte: 'Ajuster le ducroire pour qu’il atteigne le maximum admis fiscalement : 5 % des créances clients.' },
    { numero: '13', date: '2026-12-31', texte: 'Amortissements directs : mobilier 20 % et infrastructure informatique 30 %, de la valeur au bilan.' },
    { numero: '14', date: '2026-12-31', texte: "Véhicules : amortissement indirect constant de 20 % de la valeur d'acquisition, 60'000.00." },
    { numero: '15', date: '2026-12-31', texte: "Immeuble locatif : amortissement indirect décroissant de 2 % de la valeur comptable." },
    { numero: '16', date: '2026-12-31', texte: "Intérêts courus sur l'emprunt bancaire, 8'200.00." },
    { numero: '17', date: '2026-12-31', texte: "Abonnement à la revue payé le 20.10 (opération 7) : tenir compte de la part de l'exercice prochain." },
    {
      numero: '18',
      date: '2026-12-31',
      texte: "Un locataire (loyer annuel 15'000.00) a versé d'avance en décembre le loyer du premier trimestre de l'année prochaine ; il est compris dans l'opération 8.",
    },
    { numero: '19', date: '2026-12-31', texte: "Un autre locataire doit encore son loyer de décembre, 1'200.00." },
    {
      numero: '20',
      date: '2026-12-31',
      texte: "Intérêt couru sur la dette hypothécaire de l'immeuble locatif, 250'000.00 à 3,6 %, échéances semestrielles au 31.03 et au 30.09.",
    },
    { numero: '21', date: '2026-12-31', texte: 'La facture de téléphone de décembre, 180.00, arrivera en janvier.' },
    { numero: '22', date: '2026-12-31', texte: "Montres livrées le 20 décembre, 12'000.00 : la facture n'est pas encore arrivée." },
    { numero: '23', date: '2026-12-31', texte: "Il reste du matériel de bureau en stock pour 250.00, qui sera utilisé l'exercice prochain." },
    { numero: '24', date: '2026-12-31', texte: "Salaire de Patrick Lambert pour son travail dans l'entreprise, 50'000.00." },
    { numero: '25', date: '2026-12-31', texte: "Intérêt de 4 % sur le capital de Patrick Lambert au 1er janvier, 535'000.00." },
  ],
  ouvertureActif: montants({
    '1000': 2000, '1010': 8000, '1020': 60000, '1100': 250000, '1200': 300000, '1510': 30000, '1520': 20000, '1530': 60000, '1600': 400000,
  }),
  ouverturePassif: montants({ '1109': 15000, '1539': 15000, '1609': 40000, '2000': 75000, '2400': 200000, '2401': 250000, '2800': 535000 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: true, comptesAjoutes: ['6900', '8000', '8100'] },
  corrige: [
    { piece: '1', lignes: s('1100', '3200', 1500000) },
    { piece: '2', lignes: s('1020', '1100', 1400000) },
    { piece: '3', lignes: s('4200', '2000', 900000) },
    { piece: '4', lignes: s('2000', '1020', 880000) },
    { piece: '5', lignes: s('5200', '1020', 180000) },
    { piece: '6', lignes: s('6500', '1020', 18000) },
    { piece: '7', lignes: s('6500', '1010', 300) },
    { piece: '8', lignes: s('1020', '8100', 60000) },
    { piece: '9', lignes: s('8000', '1020', 12000) },
    { piece: '10', lignes: s('2850', '1020', 40000) },
    { piece: '11', lignes: s('1200', '4280', 60000) },
    { piece: '12', lignes: s('3805', '1109', 2500) }, // 350'000 × 5 % = 17'500 ; ducroire 15'000
    { piece: '13', lignes: [D('6800', 12000), C('1510', 6000), C('1520', 6000)] },
    { piece: '14', lignes: s('6800', '1539', 12000) },
    { piece: '15', lignes: s('8000', '1609', 7200) }, // (400'000 − 40'000) × 2 %
    { piece: '16', lignes: s('6900', '2300', 8200) },
    { piece: '17', lignes: s('1300', '6500', 250) }, // 10 mois sur 12
    { piece: '18', lignes: s('8100', '2300', 3750) },
    { piece: '19', lignes: s('1300', '8100', 1200) },
    { piece: '20', lignes: s('8000', '2300', 2250) }, // 250'000 × 3,6 % × 3/12
    { piece: '21', lignes: s('6510', '2300', 180) },
    { piece: '22', lignes: s('4200', '2300', 12000) },
    { piece: '23', lignes: s('1300', '6500', 250) },
    { piece: '24', lignes: s('5200', '2850', 50000) },
    { piece: '25', lignes: s('6900', '2850', 21400) },
  ],
};

// ───────────────────────── MP, F&C vol. 2, ch. 36 — fondation et augmentation du capital (36.4, 36.5, exemples) ─────────────────────────
export const manuelZephyr: Exercice = {
  id: 'manuel-mp3-zephyr-automation-fondation',
  titre: 'Zéphyr Automation SA — fondation et augmentation du capital',
  niveau: 'MP',
  filiere: 'MP',
  difficulte: 3,
  sujets: ['Souscription et libération', 'Apports en nature', 'Créances apportées et ducroire', 'Bons de participation', 'Agio', 'Frais de fondation (FAO)'],
  raisonSociale: 'Zéphyr Automation SA',
  formeJuridique: 'SA',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "La société est fondée en janvier 2026 ; elle n'a pas encore de bilan. Les actionnaires et les participants sont " +
    "suivis dans un seul compte par catégorie. L'agio est viré aux réserves légales issues du capital ; les frais de " +
    "fondation et d'augmentation du capital sont des charges. " + CONSIGNE,
  situation:
    "Trois ingénieurs, Mme Kristen, M. Carlos et M. Rossi, fondent Zéphyr Automation SA à Plan-les-Ouates pour concevoir " +
    "des robots d'emballage. Chacun apporte une partie en nature (matériel, véhicule, machine, créances de son ancienne " +
    "activité) et le solde en espèces.\n\n" +
    "Vous tenez la comptabilité dès la fondation : souscription et libération du capital-actions, émission de bons de " +
    "participation, puis, en fin d'année, une augmentation du capital avec agio.",
  operations: [
    { numero: '1', date: '2026-01-05', texte: "Souscription intégrale du capital-actions de 200'000.00, divisé en 200 actions nominatives de 1'000.00." },
    {
      numero: '2',
      date: '2026-01-10',
      texte:
        "Mme Kristen libère ses 55 actions : matériel informatique 25'000.00, créances commerciales de 30'000.00 (ducroire de " +
        '10 % à constituer), le solde versé à la banque.',
    },
    { numero: '3', date: '2026-01-10', texte: "M. Carlos libère ses 50 actions : un véhicule estimé à 20'000.00, le solde versé à la banque." },
    { numero: '4', date: '2026-01-10', texte: "M. Rossi libère les 95 actions restantes : une machine estimée à 40'000.00, le solde versé à la banque." },
    { numero: '5', date: '2026-01-15', texte: "La banque débite une commission de 0,25 % sur les versements en espèces des opérations 2 à 4, et 2'400.00 de frais de fondation." },
    { numero: '6', date: '2026-01-20', texte: "Souscription de 500 bons de participation de 100.00 de valeur nominale, sans droit de vote." },
    { numero: '7', date: '2026-01-25', texte: 'Les participants libèrent entièrement les bons de participation à la banque.' },
    {
      numero: '8',
      date: '2026-11-10',
      texte: "L'assemblée générale décide d'augmenter le capital-actions de 100 actions de 1'000.00, avec un agio de 200.00 par action : souscription intégrale.",
    },
    { numero: '9', date: '2026-11-20', texte: "Les nouvelles actions sont libérées à 60 %, ainsi que l'agio entier, à la banque." },
    { numero: '10', date: '2026-11-25', texte: "Facture du notaire pour l'augmentation du capital, 6'500.00." },
  ],
  ouvertureActif: {},
  ouverturePassif: {},
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false, comptesAjoutes: ['1850', '1860', '2810', '6550'] },
  corrige: [
    { piece: '1', lignes: s('1850', '2800', 200000) },
    { piece: '2', lignes: [D('1520', 25000), D('1100', 30000), D('1020', 3000), C('1109', 3000), C('1850', 55000)] },
    { piece: '3', lignes: [D('1530', 20000), D('1020', 30000), C('1850', 50000)] },
    { piece: '4', lignes: [D('1500', 40000), D('1020', 55000), C('1850', 95000)] },
    { piece: '5', lignes: s('6550', '1020', 2620) }, // 88'000 × 0,25 % = 220 + 2'400
    { piece: '6', lignes: s('1860', '2810', 50000) },
    { piece: '7', lignes: s('1020', '1860', 50000) },
    { piece: '8', lignes: [D('1850', 120000), C('2800', 100000), C('2900', 20000)] },
    { piece: '9', lignes: s('1020', '1850', 80000) }, // 60 % de 100'000 + agio 20'000
    { piece: '10', lignes: s('6550', '2010', 6500) },
  ],
};

// ───────────────────────── MP, F&C vol. 2, ch. 54 — titres (54.14, 54.15) ─────────────────────────
export const manuelRiveGauche: Exercice = {
  id: 'manuel-mp4-rive-gauche-participations-titres',
  titre: 'Rive Gauche Participations SA — portefeuille de titres',
  niveau: 'MP',
  filiere: 'MP',
  difficulte: 4,
  sujets: ['Achat et vente de titres', 'Coupons et dividendes', 'Impôt anticipé', 'Droits de garde', 'Évaluation à l’inventaire', 'Intérêt couru'],
  raisonSociale: 'Rive Gauche Participations SA',
  formeJuridique: 'SA',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Les titres sont portés au prix d'achat, frais compris ; une vente est créditée au compte Titres pour son produit " +
    "net de frais. À la clôture, la différence entre le solde du compte et l'inventaire est un bénéfice ou une perte de " +
    "cours. L'impôt anticipé de 35 % est récupérable. " + CONSIGNE,
  situation:
    "Rive Gauche Participations SA, à Carouge, place ses liquidités dans des actions et des obligations suisses. La " +
    "directrice, Mme Ducret, suit le portefeuille avec la banque, qui exécute les ordres et encaisse les coupons.\n\n" +
    "Elle vous confie les opérations de l'année sur titres : ventes, achats, coupons et dividendes, remboursement " +
    "d'obligations, puis l'évaluation du portefeuille et l'intérêt couru au 31 décembre.",
  operations: [
    { numero: '1', date: '2026-03-16', texte: "La banque vend 8 actions C (nominal 500.00) au cours de 1'940.00 ; frais de vente 111.00." },
    { numero: '2', date: '2026-05-19', texte: "La banque encaisse les coupons de 32 obligations de 1'000.00 de nominal, taux 3 %, impôt anticipé 35 %." },
    { numero: '3', date: '2026-05-28', texte: 'La banque encaisse le dividende de 5 actions (nominal 500.00) : 45.00 par action, impôt anticipé 35 %.' },
    {
      numero: '4',
      date: '2026-06-30',
      texte: "Échéance : la banque encaisse le remboursement de 4 obligations Ville de Bienne de 10'000.00 au nominal et leur dernier coupon annuel de 2,8 %, impôt anticipé 35 %.",
    },
    { numero: '5', date: '2026-08-30', texte: 'La banque achète 10 actions Yams (nominal 50.00) au cours de 750.00 ; frais d’achat 86.00.' },
    { numero: '6', date: '2026-09-30', texte: 'La banque débite 50.00 de droits de garde pour le portefeuille.' },
    { numero: '7', date: '2026-11-20', texte: "L'Administration fédérale des contributions rembourse sur le compte bancaire l'impôt anticipé des opérations 2 à 4." },
    { numero: '8', date: '2026-12-31', texte: "Inventaire du portefeuille au cours du 31 décembre : 74'000.00. Comptabiliser la différence de cours." },
    {
      numero: '9',
      date: '2026-12-31',
      texte: "Intérêt couru sur 2 obligations Canton de Fribourg de 10'000.00 en portefeuille, taux 3 %, coupon annuel au 15 septembre (année de 360 jours).",
    },
  ],
  ouvertureActif: montants({ '1020': 200000, '1060': 120000, '1100': 30000, '1500': 150000 }),
  ouverturePassif: montants({ '2000': 20000, '2800': 400000, '2900': 30000, '2970': 50000 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: false },
  corrige: [
    { piece: '1', lignes: s('1020', '1060', 15409) }, // 8 × 1'940 − 111
    { piece: '2', lignes: [D('1020', 624), D('1176', 336), C('6952', 960)] },
    { piece: '3', lignes: [D('1020', 146.25), D('1176', 78.75), C('6952', 225)] },
    { piece: '4', lignes: [D('1020', 40728), D('1176', 392), C('1060', 40000), C('6952', 1120)] },
    { piece: '5', lignes: s('1060', '1020', 7586) },
    { piece: '6', lignes: s('6940', '1020', 50) },
    { piece: '7', lignes: s('1020', '1176', 806.75) },
    { piece: '8', lignes: s('1060', '6952', 1823) }, // 120'000 − 15'409 − 40'000 + 7'586 = 72'177 ; inventaire 74'000
    { piece: '9', lignes: s('1300', '6952', 175) }, // 20'000 × 3 % × 105/360
  ],
};

export const exercicesManuel: Exercice[] = [
  manuelFavre, manuelVinotheque, manuelLacroix, manuelBrodard, manuelMontBlanc, manuelTruffaz, manuelLambert, manuelZephyr, manuelRiveGauche,
];
