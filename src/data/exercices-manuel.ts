// Exercices de journal tirés des cas du manuel E&S (édition 2019) : volume 1, ch. 1 « Structure du bilan et du
// résultat » et volume 2, ch. 12 « Comptabilité de l'entreprise commerciale ». Droits d'utilisation obtenus par
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

export const exercicesManuel: Exercice[] = [manuelFavre, manuelVinotheque];
