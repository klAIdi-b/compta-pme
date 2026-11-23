// Exercices « Budget et écarts » (maquette validée le 23.11.2026 ; plan d'études CFC c5.ep1d et c6.ep4a).
// 1. Budget d'un événement, chiffres effectifs donnés (fiche seule, sans journal).
// 2. Budget trimestriel du magasin, comparé aux comptes de l'élève après la saisie du trimestre.
// Entreprise fictive (Cycles du Léman, comme les exercices CFC 1 et la facturation). Montants hors TVA dans les budgets.
import type { DonneesBudget } from '../engine/budget';
import type { Exercice } from '../engine/exercice';

const f = (francs: number) => Math.round(francs * 100);
const D = (compte: string, francs: number) => ({ debit: compte, credit: null, montant: f(francs) });
const C = (compte: string, francs: number) => ({ debit: null, credit: compte, montant: f(francs) });
const s = (debit: string, credit: string, francs: number) => [{ debit, credit, montant: f(francs) }];

const PARAMETRES: Exercice['parametres'] = {
  libellesT: 'SI/SF',
  modificationDirecte: false,
  modeBouclement: 'compteDeResultat',
  comptesAjoutes: [],
  comptesMasques: [],
  tvaMethode: 'net',
  ficheSalaire: false,
  calculatriceTva: false,
  corrigerBouclement: false,
};

const SITUATION_MAGASIN =
  "Vous êtes en deuxième année d'apprentissage chez Cycles du Léman, le magasin de vélos de Sandra Rochat à Carouge. " +
  'Sandra veut mieux prévoir : elle vous demande de préparer les budgets, puis de les comparer avec ce qui s’est réellement passé.';

// ---------- 1. Journée du vélo électrique ----------

const journee: DonneesBudget = {
  titre: 'Journée du vélo électrique, samedi 6 juin 2026',
  note: [
    'Journée du vélo électrique, samedi 6 juin 2026, au parc des Évaux.',
    'Nous attendons 60 participants ; inscription 25.00 par personne.',
    'Chaque participant achète en moyenne une boisson à 6.00 ; nous achetons les boissons 2.50 pièce.',
    'Le Garage Favre nous verse 800.00 de sponsoring.',
    'Location du parc 400.00, assurance de la journée 150.00, transport des vélos de démonstration 300.00.',
    'Publicité (affiches et réseaux sociaux) 350.00.',
    'Un t-shirt offert à chaque participant, 9.00 pièce.',
    'Tous les montants sont hors TVA.',
  ],
  preparer: true,
  postes: [
    { id: 'inscriptions', libelle: 'Inscriptions', nature: 'produit', calcul: '60 × 25.00', budget: f(1500), effectif: f(1200) },
    { id: 'boissons-ventes', libelle: 'Ventes de boissons', nature: 'produit', calcul: '60 × 6.00', budget: f(360), effectif: f(288) },
    { id: 'sponsoring', libelle: 'Sponsoring', nature: 'produit', budget: f(800), effectif: f(800) },
    { id: 'parc', libelle: 'Location du parc', nature: 'charge', budget: f(400), effectif: f(400) },
    { id: 'assurance', libelle: 'Assurance', nature: 'charge', budget: f(150), effectif: f(150) },
    { id: 'transport', libelle: 'Transport des vélos', nature: 'charge', budget: f(300), effectif: f(360) },
    { id: 'boissons-achats', libelle: 'Achat des boissons', nature: 'charge', calcul: '60 × 2.50', budget: f(150), effectif: f(140) },
    { id: 'publicite', libelle: 'Publicité', nature: 'charge', budget: f(350), effectif: f(520) },
    { id: 'tshirts', libelle: 'T-shirts', nature: 'charge', calcul: '60 × 9.00', budget: f(540), effectif: f(540) },
  ],
  contexteEffectif:
    "La journée a eu lieu avec 48 participants seulement. Les 60 t-shirts avaient été commandés à l'avance. " +
    'La publicité a coûté plus cher que prévu (annonces supplémentaires la dernière semaine) et le transport a été facturé 360.00.',
  causes: [
    'Moins de participants que prévu',
    'Prix de vente plus bas que prévu',
    'Une charge mal estimée',
    'Une charge imprévue',
  ],
  cause: 0,
  // Par participant : 25.00 + 6.00 − 2.50 − 9.00 = 19.50 ; charges fixes 1'200.00 − sponsoring 800.00 = 400.00 ;
  // 400.00 ÷ 19.50 = 20,5, soit 21 participants.
  seuil: {
    question:
      'Combien de participants faut-il au minimum pour que les produits couvrent les charges ? (Inscriptions, boissons et ' +
      't-shirts dépendent du nombre de participants ; les autres montants sont fixes.)',
    attendu: 21,
  },
};

export const budgetJournee: Exercice = {
  id: 'budget-cfc2-cycles-du-leman-journee',
  titre: 'Cycles du Léman — budget de la Journée du vélo électrique',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 2,
  sujets: ['Budget', 'Écarts budget et effectif', 'Recommandation'],
  raisonSociale: 'Cycles du Léman',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Dans la rubrique Budget, préparez le budget de la journée d'après la note de Sandra Rochat, puis comparez-le avec les " +
    'chiffres effectifs : écarts en francs et en pour cent, appréciation, cause principale et recommandation. ' +
    "Cet exercice n'a pas d'écritures à passer au journal.",
  situation: SITUATION_MAGASIN + '\n\nEn juin, le magasin organise une journée de démonstration de vélos électriques.',
  operations: [],
  ouvertureActif: { '1000': f(2000), '1020': f(30000), '1200': f(20000), '1510': f(15000), '1530': f(22000) },
  ouverturePassif: { '2400': f(25000), '2800': f(64000) },
  mode: 'entrainement',
  parametres: { ...PARAMETRES, budget: journee },
  corrige: [],
};

// ---------- 2. Budget du 2e trimestre, comparé aux comptes ----------

const trimestre: DonneesBudget = {
  titre: 'Budget du 2e trimestre 2026 (avril à juin)',
  note: [
    'Ventes : nous prévoyons de vendre 55 vélos à 900.00 en moyenne et pour 3’500.00 d’accessoires.',
    'Achats de marchandises : 55 % des ventes prévues.',
    'Loyer du magasin : 1’850.00 par mois.',
    'Électricité : environ 100.00 par mois.',
    'Publicité : 1’200.00 pour le trimestre.',
    "Assurance : prime trimestrielle de 450.00.",
    'Tous les montants sont hors TVA.',
  ],
  preparer: true,
  postes: [
    { id: 'ventes', libelle: 'Ventes de marchandises', nature: 'produit', calcul: '55 × 900.00 + 3’500.00', budget: f(53000), comptes: ['3200'] },
    { id: 'achats', libelle: 'Achats de marchandises', nature: 'charge', calcul: '55 % de 53’000.00', budget: f(29150), comptes: ['4200'] },
    { id: 'loyer', libelle: 'Loyer', nature: 'charge', calcul: '3 × 1’850.00', budget: f(5550), comptes: ['6000'] },
    { id: 'electricite', libelle: 'Électricité', nature: 'charge', calcul: '3 × 100.00', budget: f(300), comptes: ['6400'] },
    { id: 'publicite', libelle: 'Publicité', nature: 'charge', budget: f(1200), comptes: ['6600'] },
    { id: 'assurance', libelle: 'Assurance', nature: 'charge', budget: f(450), comptes: ['6300'] },
  ],
  contexteEffectif:
    'Les chiffres effectifs sont les soldes de vos comptes après la saisie des opérations du trimestre (montants hors TVA). ' +
    "Saisissez d'abord toutes les opérations au journal.",
  causes: [
    'Ventes inférieures aux prévisions',
    'Achats de marchandises plus chers que prévu',
    'Une charge mal estimée',
    'Une charge imprévue',
  ],
  cause: 0,
};

export const budgetTrimestre: Exercice = {
  id: 'budget-cfc2-cycles-du-leman-trimestre',
  titre: 'Cycles du Léman — budget du 2e trimestre et comptes',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 2,
  sujets: ['Budget', 'Écarts budget et effectif', 'TVA au net'],
  raisonSociale: 'Cycles du Léman',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net, 8,1 %). Préparez d'abord le budget du " +
    "trimestre dans la rubrique Budget. Passez ensuite au journal les opérations d'avril à juin, en indiquant le numéro de " +
    "l'opération comme numéro de pièce. Comparez enfin le budget avec les soldes de vos comptes. Arrondissez la TVA aux 5 centimes.",
  situation: SITUATION_MAGASIN + '\n\nCette fois, il s’agit du budget du magasin pour le deuxième trimestre.',
  operations: [
    { numero: '1', date: '2026-04-15', texte: "Achat de marchandises à crédit : 12'000.00 + TVA 8,1 %." },
    { numero: '2', date: '2026-04-30', texte: "Ventes d'avril encaissées par la banque (paiements par carte) : 16'000.00 + TVA 8,1 %." },
    { numero: '3', date: '2026-04-30', texte: "Loyer d'avril à juin payé par la banque, 3 × 1'850.00 (pas de TVA)." },
    { numero: '4', date: '2026-05-15', texte: "Achat de marchandises à crédit : 9'500.00 + TVA 8,1 %." },
    { numero: '5', date: '2026-05-20', texte: "Annonces publicitaires payées par la banque : 1'800.00 + TVA 8,1 %." },
    { numero: '6', date: '2026-05-31', texte: "Ventes de mai encaissées par la banque : 18'500.00 + TVA 8,1 %." },
    { numero: '7', date: '2026-06-10', texte: 'Prime trimestrielle d’assurance payée par la banque, 450.00 (pas de TVA).' },
    { numero: '8', date: '2026-06-15', texte: "Achat de marchandises à crédit : 6'000.00 + TVA 8,1 %." },
    { numero: '9', date: '2026-06-30', texte: "Facture d'électricité du trimestre payée par la banque : 410.00 + TVA 8,1 %." },
    { numero: '10', date: '2026-06-30', texte: "Ventes de juin encaissées par la banque : 14'000.00 + TVA 8,1 %." },
  ],
  ouvertureActif: { '1000': f(2000), '1020': f(30000), '1200': f(20000), '1510': f(15000), '1530': f(22000) },
  ouverturePassif: { '2400': f(25000), '2800': f(64000) },
  mode: 'entrainement',
  parametres: { ...PARAMETRES, budget: trimestre },
  corrige: [
    { piece: '1', lignes: [D('4200', 12000), D('1170', 972), C('2000', 12972)] },
    { piece: '2', lignes: [D('1020', 17296), C('3200', 16000), C('2200', 1296)] },
    { piece: '3', lignes: s('6000', '1020', 5550) },
    { piece: '4', lignes: [D('4200', 9500), D('1170', 769.5), C('2000', 10269.5)] },
    { piece: '5', lignes: [D('6600', 1800), D('1171', 145.8), C('1020', 1945.8)] },
    { piece: '6', lignes: [D('1020', 19998.5), C('3200', 18500), C('2200', 1498.5)] },
    { piece: '7', lignes: s('6300', '1020', 450) },
    { piece: '8', lignes: [D('4200', 6000), D('1170', 486), C('2000', 6486)] },
    { piece: '9', lignes: [D('6400', 410), D('1171', 33.2), C('1020', 443.2)] },
    { piece: '10', lignes: [D('1020', 15134), C('3200', 14000), C('2200', 1134)] },
  ],
};

export const exercicesBudget: Exercice[] = [budgetJournee, budgetTrimestre];
