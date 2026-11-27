// Dossier CFC, niveau 3 (salaires), construit sur la structure de cas du manuel E&S 2022, vol. 3, ch. 25 « Décompte de
// salaire » : droits d'utilisation obtenus par l'enseignant (09.11.2026). Décision de l'enseignant du 27.11.2026 : mêmes
// écritures, noms et montants changés. Taux AVS/AI/APG 5,3 % et AC 1,1 % ; cotisations LPP calculées selon la méthode
// du manuel (salaire coordonné et taux selon l'âge, paramètres de 2022 : déduction de coordination 2'091.25 par mois,
// salaire coordonné minimal 298.75 et maximal 5'078.75, seuil d'entrée 1'792.50) et données sur les fiches. Conventions
// du cours : AVS/AI/APG et AC → 2170, LPP → 2171, allocations familiales → 2172, charges de l'employeur → 5270.
import { avisBancaire, ficheSalaire, noteInterne, quittance } from '../../engine/pieces';
import { BANQUE, C, construireDossier, D, f, S } from './outils';

const patisserie = { nom: 'Pâtisserie du Molard', adresse: ['Place du Molard 6', '1204 Genève'] };
const comptePatisserie = 'CH21 0000 4471 8852 6610 4';
const kohler = { nom: 'Mme Sabrina Kohler', adresse: ['Rue des Eaux-Vives 41', '1207 Genève'] };
const python = { nom: 'M. Gérard Python', adresse: ['Chemin de Grange-Canal 18', '1208 Genève'] };
const roulin = { nom: 'Mme Nathalie Roulin', adresse: ['Avenue de Bel-Air 9', '1225 Chêne-Bourg'] };
const jaccard = { nom: 'M. Hugo Jaccard, apprenti', adresse: ['Chemin du Foron 4', '1226 Thônex'] };
const AVS = { libelle: 'AVS/AI/APG', taux: 530 };
const AC = { libelle: 'AC', taux: 110 };
const vire = ['Salaire net viré sur votre compte le 25.06.2026.'];

const s1 = quittance({
  emetteur: patisserie, date: '2026-06-10', numero: 'Q-06', titre: 'QUITTANCE — AVANCE SUR SALAIRE',
  texte: ['Je soussigné, Gérard Python, reconnais avoir reçu en espèces une avance sur mon salaire de juin.'],
  montant: f(1200), mentions: ['Signé : G. Python'],
});
// Employée de 27 ans : salaire coordonné 4'800.00 − 2'091.25 = 2'708.75, LPP 3,5 % = 94.80.
const s2 = ficheSalaire({ employeur: patisserie, employe: kohler, periode: 'JUIN 2026', date: '2026-06-25', brut: f(4800),
  retenues: [AVS, AC, { libelle: 'LPP (caisse de pension)', montant: f(94.8) }], mentions: vire });
// Chef comptable de 55 ans, salaire 8'900.00 + prime d'ancienneté 400.00 : salaire coordonné maximal 5'078.75, LPP 9 %.
const s3 = ficheSalaire({ employeur: patisserie, employe: python, periode: 'JUIN 2026', date: '2026-06-25', brut: f(9300),
  retenues: [AVS, AC, { libelle: 'LPP (caisse de pension)', montant: f(457.1) }, { libelle: 'Avance du 10.06', montant: f(1200) }],
  mentions: ["Salaire brut : salaire mensuel 8'900.00 et prime d'ancienneté 400.00.", ...vire] });
// Employée à temps partiel, 37 ans : salaire coordonné minimal 298.75, LPP 5 %.
const s4 = ficheSalaire({ employeur: patisserie, employe: roulin, periode: 'JUIN 2026', date: '2026-06-25', brut: f(2300),
  retenues: [AVS, AC, { libelle: 'LPP (caisse de pension)', montant: f(14.95) }], mentions: vire });
// Apprenti : salaire inférieur au seuil d'entrée, pas de cotisation LPP.
const s5 = ficheSalaire({ employeur: patisserie, employe: jaccard, periode: 'JUIN 2026', date: '2026-06-25', brut: f(1350),
  retenues: [AVS, AC], mentions: ['Salaire inférieur au seuil d’entrée de la prévoyance professionnelle : pas de cotisation LPP.', ...vire] });

const fiches = [s2, s3, s4, s5];
const somme = (r: typeof s2, debut: string) => r.retenues.filter((x) => x.libelle.startsWith(debut)).reduce((t, x) => t + x.montant, 0);
const avsEmployes = fiches.reduce((t, r) => t + somme(r, 'AVS') + somme(r, 'AC'), 0);
const lppEmployes = fiches.reduce((t, r) => t + somme(r, 'LPP'), 0);
const masse = fiches.reduce((t, r) => t + r.brut, 0);
const patronAvs = Math.round((masse * 530) / 10000) + Math.round((masse * 110) / 10000);
const patronLpp = lppEmployes;
const patronAlfa = Math.round((masse * 240) / 10000);

const s6 = noteInterne({
  emetteur: patisserie, date: '2026-06-30', numero: 'NI-06', titre: "CHARGES SOCIALES DE L'EMPLOYEUR — JUIN 2026",
  texte: [
    "Part de l'employeur sur les salaires bruts du mois : AVS/AI/APG et AC au même taux que les employés, LPP du même " +
      'montant que la part des employés, allocations familiales (ALFA) 2,40 % à la charge de l’employeur seul.',
  ],
  lignes: [
    { designation: 'AVS/AI/APG et AC (caisse de compensation)', montant: patronAvs },
    { designation: 'LPP (caisse de pension)', montant: patronLpp },
    { designation: 'Allocations familiales', montant: patronAlfa },
  ],
  totaux: [{ libelle: 'Total des charges patronales', montant: patronAvs + patronLpp + patronAlfa, fort: true }],
  mentions: ['Signé : V. Zbinden'],
});
const s7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: patisserie, compte: comptePatisserie, date: '2026-07-10',
  operations: [{ designation: 'Caisse de compensation AVS — cotisations AVS/AI/APG et AC de juin (parts employés et employeur)', montant: avsEmployes + patronAvs }] });
const s8 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: patisserie, compte: comptePatisserie, date: '2026-07-10',
  operations: [{ designation: 'Caisse de pension des métiers de l’alimentation — cotisations LPP de juin (parts employés et employeur)', montant: lppEmployes + patronLpp }] });
const s9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: patisserie, compte: comptePatisserie, date: '2026-07-10',
  operations: [{ designation: 'Caisse d’allocations familiales — cotisations de juin', montant: patronAlfa }] });
const s10 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: patisserie, compte: comptePatisserie, date: '2026-07-15',
  operations: [{ designation: 'Assurances Léman Accidents SA — prime LAA du second semestre (accidents professionnels, à la charge de l’employeur)', montant: f(1450) }] });

const ecritureFiche = (r: typeof s2) => {
  const avance = somme(r, 'Avance');
  const lpp = somme(r, 'LPP');
  return [
    D('5200', r.brut),
    C('2170', somme(r, 'AVS') + somme(r, 'AC')),
    ...(lpp ? [C('2171', lpp)] : []),
    ...(avance ? [C('1140', avance)] : []),
    C('1020', r.net),
  ];
};

export const dossierPatisserie = construireDossier(
  {
    id: 'dossier-cfc3-confiserie-bourg-de-four-salaires',
    titre: 'Pâtisserie du Molard — dossier de pièces, décomptes de salaire de juin',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 3,
    sujets: ['Décompte de salaire', 'Salaire coordonné et LPP selon l’âge', 'Prime et avance sur salaire', 'Charges sociales de l’employeur', 'Paiement des assurances sociales'],
    raisonSociale: 'Pâtisserie du Molard',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      'Les retenues sur le salaire sont portées dans le compte de dette de chaque assurance (AVS/AI/APG et AC à la même ' +
      'caisse de compensation) ; le salaire net est viré par la banque. Les charges de l’employeur sont comptabilisées en ' +
      'charges sociales. Les cotisations LPP sont données sur les fiches : elles ont été calculées avec les montants de ' +
      'la prévoyance professionnelle de 2022 (déduction de coordination de cette année-là), non avec ceux de 2026. ' +
      'Comptabilisez les dix pièces de juin et de début juillet.',
    situation:
      "La Pâtisserie du Molard, au centre-ville, appartient à Valérie Zbinden. Quatre personnes y travaillent : " +
      "Sabrina Kohler aux finances, Gérard Python, chef comptable proche de la retraite, Nathalie Roulin au marketing à " +
      "temps partiel, et Hugo Jaccard, apprenti pâtissier.\n\n" +
      "Leurs salaires sont très différents, et la cotisation à la caisse de pension dépend de l'âge et du salaire " +
      "coordonné : l'apprenti n'y cotise même pas. Mme Zbinden vous remet les décomptes de juin, la note des charges " +
      "patronales et les avis de paiement : à vous de les comptabiliser.",
    ouvertureActif: { '1000': f(3500), '1020': f(65000), '1200': f(9000), '1500': f(38000) },
    ouverturePassif: { '2000': f(6500), '2800': f(109000) },
    parametres: { corrigerBouclement: false },
  },
  [
    { date: '2026-06-10', piece: s1.piece, lignes: S('1140', '1000', s1.montant) },
    { date: '2026-06-25', piece: s2.piece, lignes: ecritureFiche(s2) },
    { date: '2026-06-25', piece: s3.piece, lignes: ecritureFiche(s3) },
    { date: '2026-06-25', piece: s4.piece, lignes: ecritureFiche(s4) },
    { date: '2026-06-25', piece: s5.piece, lignes: ecritureFiche(s5) },
    { date: '2026-06-30', piece: s6.piece, lignes: [D('5270', patronAvs + patronLpp + patronAlfa), C('2170', patronAvs), C('2171', patronLpp), C('2172', patronAlfa)] },
    { date: '2026-07-10', piece: s7.piece, lignes: S('2170', '1020', s7.total) },
    { date: '2026-07-10', piece: s8.piece, lignes: S('2171', '1020', s8.total) },
    { date: '2026-07-10', piece: s9.piece, lignes: S('2172', '1020', s9.total) },
    { date: '2026-07-15', piece: s10.piece, lignes: S('5270', '1020', s10.total) },
  ],
);

/** Montants de contrôle (tests). */
export const CONTROLES_PATISSERIE = { s2, s3, s4, s5, avsEmployes, lppEmployes, patronAvs, patronAlfa };
