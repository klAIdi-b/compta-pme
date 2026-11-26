// Dossier CFC, niveau 3 (salaires), tiré des cas du manuel E&S 2022, vol. 3, ch. 25 « Décompte de salaire »
// (exercice 25.7 et exemples du salaire coordonné) : droits d'utilisation obtenus par l'enseignant (09.11.2026), cas
// reformulés. Taux AVS/AI/APG 5,3 % et AC 1,1 % ; cotisations LPP calculées selon la méthode du manuel (salaire
// coordonné et taux selon l'âge, paramètres de l'édition 2022) et données sur les fiches. Conventions du cours :
// AVS/AI/APG et AC → 2170, LPP → 2171, allocations familiales → 2172, charges de l'employeur → 5270.
import { avisBancaire, ficheSalaire, noteInterne, quittance } from '../../engine/pieces';
import { BANQUE, C, construireDossier, D, f, S } from './outils';

const confiserie = { nom: 'Confiserie du Bourg-de-Four', adresse: ['Place du Bourg-de-Four 9', '1204 Genève'] };
const compteConfiserie = 'CH21 0000 4471 8841 3307 2';
const rosset = { nom: 'Mme Daniela Rosset', adresse: ['Rue de la Terrassière 15', '1207 Genève'] };
const blanc = { nom: 'M. Marc Blanc', adresse: ['Chemin de la Montagne 42', '1224 Chêne-Bougeries'] };
const caloz = { nom: 'Mme Géraldine Caloz', adresse: ['Rue de Genève 77', '1225 Chêne-Bourg'] };
const perret = { nom: 'M. Lucas Perret, apprenti', adresse: ['Avenue de Thônex 3', '1226 Thônex'] };
const AVS = { libelle: 'AVS/AI/APG', taux: 530 };
const AC = { libelle: 'AC', taux: 110 };
const vire = ['Salaire net viré sur votre compte le 25.06.2026.'];

const s1 = quittance({
  emetteur: confiserie, date: '2026-06-10', numero: 'Q-06', titre: 'QUITTANCE — AVANCE SUR SALAIRE',
  texte: ['Je soussigné, Marc Blanc, reconnais avoir reçu en espèces une avance sur mon salaire de juin.'],
  montant: f(1000), mentions: ['Signé : M. Blanc'],
});
// Employée de 27 ans : salaire coordonné 4'600.00 − 2'091.25 = 2'508.75, LPP 3,5 %.
const s2 = ficheSalaire({ employeur: confiserie, employe: rosset, periode: 'JUIN 2026', date: '2026-06-25', brut: f(4600),
  retenues: [AVS, AC, { libelle: 'LPP (caisse de pension)', montant: f(87.8) }], mentions: vire });
// Chef comptable de 55 ans, salaire 8'400.00 + prime d'ancienneté 400.00 : salaire coordonné maximal 5'078.75, LPP 9 %.
const s3 = ficheSalaire({ employeur: confiserie, employe: blanc, periode: 'JUIN 2026', date: '2026-06-25', brut: f(8800),
  retenues: [AVS, AC, { libelle: 'LPP (caisse de pension)', montant: f(457.1) }, { libelle: 'Avance du 10.06', montant: f(1000) }],
  mentions: ["Salaire brut : salaire mensuel 8'400.00 et prime d'ancienneté 400.00.", ...vire] });
// Employée à temps partiel, 37 ans : salaire coordonné minimal 298.75, LPP 5 %.
const s4 = ficheSalaire({ employeur: confiserie, employe: caloz, periode: 'JUIN 2026', date: '2026-06-25', brut: f(2200),
  retenues: [AVS, AC, { libelle: 'LPP (caisse de pension)', montant: f(14.95) }], mentions: vire });
// Apprenti : salaire inférieur au seuil d'entrée, pas de cotisation LPP.
const s5 = ficheSalaire({ employeur: confiserie, employe: perret, periode: 'JUIN 2026', date: '2026-06-25', brut: f(1250),
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
  emetteur: confiserie, date: '2026-06-30', numero: 'NI-06', titre: "CHARGES SOCIALES DE L'EMPLOYEUR — JUIN 2026",
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
  mentions: ['Signé : N. Favre'],
});
const s7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: confiserie, compte: compteConfiserie, date: '2026-07-10',
  operations: [{ designation: 'Caisse de compensation AVS — cotisations AVS/AI/APG et AC de juin (parts employés et employeur)', montant: avsEmployes + patronAvs }] });
const s8 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: confiserie, compte: compteConfiserie, date: '2026-07-10',
  operations: [{ designation: 'Caisse de pension des métiers de bouche — cotisations LPP de juin (parts employés et employeur)', montant: lppEmployes + patronLpp }] });
const s9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: confiserie, compte: compteConfiserie, date: '2026-07-10',
  operations: [{ designation: 'Caisse d’allocations familiales — cotisations de juin', montant: patronAlfa }] });
const s10 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: confiserie, compte: compteConfiserie, date: '2026-07-15',
  operations: [{ designation: 'Assurance accidents Romande SA — prime LAA du second semestre (accidents professionnels, à la charge de l’employeur)', montant: f(1320) }] });

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

export const dossierConfiserie = construireDossier(
  {
    id: 'dossier-cfc3-confiserie-bourg-de-four-salaires',
    titre: 'Confiserie du Bourg-de-Four — dossier de pièces, décomptes de salaire de juin',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 3,
    sujets: ['Décompte de salaire', 'Salaire coordonné et LPP selon l’âge', 'Prime et avance sur salaire', 'Charges sociales de l’employeur', 'Paiement des assurances sociales'],
    raisonSociale: 'Confiserie du Bourg-de-Four',
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
      "La Confiserie du Bourg-de-Four, dans la vieille ville, appartient à Nadia Favre. Quatre personnes y travaillent : " +
      "Daniela Rosset aux finances, Marc Blanc, chef comptable proche de la retraite, Géraldine Caloz au marketing à temps " +
      "partiel, et Lucas Perret, apprenti confiseur.\n\n" +
      "Leurs salaires sont très différents, et la cotisation à la caisse de pension dépend de l'âge et du salaire " +
      "coordonné : l'apprenti n'y cotise même pas. Mme Favre vous remet les décomptes de juin, la note des charges " +
      "patronales et les avis de paiement : à vous de les comptabiliser.",
    ouvertureActif: { '1000': f(3000), '1020': f(60000), '1200': f(8000), '1500': f(35000) },
    ouverturePassif: { '2000': f(6000), '2800': f(100000) },
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
export const CONTROLES_CONFISERIE = { s2, s3, s4, s5, avsEmployes, lppEmployes, patronAvs, patronAlfa };
