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

export const exercicesManuel: Exercice[] = [manuelFavre, manuelVinotheque, manuelLacroix, manuelBrodard, manuelMontBlanc, manuelTruffaz];
