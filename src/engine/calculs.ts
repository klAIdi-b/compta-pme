// Calculs générés pour le parcours « Apprendre » (plans d'études CFC option Finances et MP FIEc, demande de
// l'enseignant du 23.11.2026 : « tout ce qui se trouve sur le plan d'étude », à relire). Chaque générateur produit
// un énoncé, les réponses attendues et une explication pas à pas ; les données changent à chaque série.
// Conventions (cours et plans d'études) :
// - intérêt commercial 30/360 : I = C × t × j ÷ 36 000 ; nombres = C × j ÷ 100, intérêt = Σ nombres × t ÷ 360 ;
// - devises : la banque vend (cours vente) quand l'entreprise paie à l'étranger, achète (cours achat) quand elle
//   reçoit des devises ; billets pour les espèces, devises pour les virements (règle validée, ch. 13) ;
// - montants arrondis au centime, sauf indication ; un résultat se contrôle à 5 centimes près (pour cent à 0,1).

import { formatMontant, type Centimes } from './money';
import type { Compte } from './plan';
import type { Hasard } from './exercices-courts';

export type TypeChampCalcul = 'chf' | 'pc' | 'nombre' | 'choix';

export interface ChampCalcul {
  libelle: string;
  type: TypeChampCalcul;
  /** chf : centimes ; pc et nombre : valeur ; choix : indice dans `choix`. */
  attendu: number;
  choix?: string[];
  /** Tolérance (centimes pour chf, points pour pc, unités pour nombre). */
  tolerance?: number;
}

export interface QuestionCalcul {
  format: 'calcul';
  sujet: string;
  enonce: string[];
  tableau?: { entetes: string[]; lignes: string[][] };
  champs: ChampCalcul[];
  explication: string[];
}

export interface QuestionQcm {
  format: 'qcm';
  sujet: string;
  question: string;
  choix: string[];
  reponse: number;
  explication: string;
}

export type QuestionGeneree = QuestionCalcul | QuestionQcm;

// ---------- Outils ----------

const entier = (h: Hasard, a: number, b: number) => a + Math.floor(h() * (b - a + 1));
const tirer = <T>(h: Hasard, t: readonly T[]): T => t[Math.floor(h() * t.length)]!;
function melanger<T>(h: Hasard, t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(h() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}
const m = (c: Centimes) => formatMontant(Math.round(c));
const fr = (x: number, d = 1) => x.toFixed(d).replace('.', ',');
const n = (x: number) => Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
const pc1 = (x: number) => Math.round(x * 10) / 10;
const chf = (libelle: string, attendu: number, tolerance = 5): ChampCalcul => ({ libelle, type: 'chf', attendu: Math.round(attendu), tolerance });
const pc = (libelle: string, attendu: number): ChampCalcul => ({ libelle, type: 'pc', attendu: pc1(attendu), tolerance: 0.1 });
const nb = (libelle: string, attendu: number, tolerance = 0): ChampCalcul => ({ libelle, type: 'nombre', attendu, tolerance });

/** Contrôle d'un champ saisi (texte). */
export function champJuste(c: ChampCalcul, saisie: string | undefined): boolean {
  const t = (saisie ?? '').trim().replace(/[−–]/g, '-').replace(/['\s]/g, '').replace(',', '.').replace('%', '');
  if (t === '') return false;
  if (c.type === 'choix') return t === String(c.attendu);
  const v = Number(t);
  if (Number.isNaN(v)) return false;
  const valeur = c.type === 'chf' ? Math.round(v * 100) : v;
  return Math.abs(valeur - c.attendu) <= (c.tolerance ?? 0) + 1e-9;
}

export function valeurLisible(c: ChampCalcul): string {
  if (c.type === 'chf') return m(c.attendu);
  if (c.type === 'pc') return `${fr(c.attendu)} %`;
  if (c.type === 'choix') return c.choix?.[c.attendu] ?? '';
  return Number.isInteger(c.attendu) ? n(c.attendu) : fr(c.attendu, 2);
}

// ---------- CFC option Finances ----------

const CLIENTS = ['Garage Favre', 'Hôtel du Parc', 'École de Plainpalais', 'Camping des Rives', 'Vélo-Club des Eaux-Vives'];

/** Livres auxiliaires : comptes individuels des clients et compte collectif Créances clients. */
function livresAuxiliaires(h: Hasard): QuestionCalcul {
  const clients = melanger(h, CLIENTS).slice(0, 3);
  const lignes = clients.map((c) => {
    const si = entier(h, 2, 30) * 10000;
    const factures = entier(h, 5, 40) * 10000;
    const paiements = entier(h, 1, Math.floor((si + factures) / 10000)) * 10000;
    return { c, si, factures, paiements, sf: si + factures - paiements };
  });
  const total = lignes.reduce((t, l) => t + l.sf, 0);
  return {
    format: 'calcul',
    sujet: 'Livres auxiliaires',
    enonce: ['Le livre auxiliaire des clients donne, pour le trimestre, les mouvements ci-dessous.', 'Calculez le solde de chaque client, puis le solde du compte collectif Créances clients.'],
    tableau: { entetes: ['Client', 'Solde initial', 'Factures envoyées', 'Paiements reçus'], lignes: lignes.map((l) => [l.c, m(l.si), m(l.factures), m(l.paiements)]) },
    champs: [...lignes.map((l) => chf(`Solde de ${l.c}`, l.sf)), chf('Solde du compte Créances clients', total)],
    explication: [
      'Solde d’un client = solde initial + factures − paiements.',
      ...lignes.map((l) => `${l.c} : ${m(l.si)} + ${m(l.factures)} − ${m(l.paiements)} = ${m(l.sf)}.`),
      `Le compte collectif est égal à la somme des comptes individuels : ${m(total)}.`,
    ],
  };
}

/** Marge contributive : MC unitaire, MC totale, résultat et seuil de rentabilité en quantité. */
function margeContributive(h: Hasard): QuestionCalcul {
  const prix = entier(h, 8, 30) * 1000;
  const cv = Math.round(prix * entier(h, 40, 70) / 100 / 100) * 100;
  const mcu = prix - cv;
  const q = entier(h, 4, 12) * 100;
  const cf = Math.round(mcu * q * entier(h, 55, 90) / 100 / 1000) * 1000;
  const seuil = Math.ceil(cf / mcu);
  return {
    format: 'calcul',
    sujet: 'Marge contributive',
    enonce: [
      `Un article se vend ${m(prix)} ; son coût variable est de ${m(cv)} par pièce.`,
      `Charges fixes de la période : ${m(cf)}. Quantité vendue : ${n(q)} pièces.`,
    ],
    champs: [
      chf('Marge contributive par pièce', mcu),
      chf('Marge contributive totale', mcu * q),
      chf('Résultat (bénéfice, ou perte avec un signe moins)', mcu * q - cf),
      nb('Seuil de rentabilité, en pièces (arrondi à l’unité supérieure)', seuil),
    ],
    explication: [
      `MC par pièce = prix − coût variable = ${m(prix)} − ${m(cv)} = ${m(mcu)}.`,
      `MC totale = ${m(mcu)} × ${n(q)} = ${m(mcu * q)}.`,
      `Résultat = MC totale − charges fixes = ${m(mcu * q)} − ${m(cf)} = ${m(mcu * q - cf)}.`,
      `Seuil = charges fixes ÷ MC par pièce = ${m(cf)} ÷ ${m(mcu)} = ${fr(cf / mcu, 2)}, soit ${seuil} pièces.`,
    ],
  };
}

/** Feuille de répartition simple : charges indirectes réparties sur les centres selon des clés en %. */
function repartitionSimple(h: Hasard): QuestionCalcul {
  const centres = ['Achat', 'Vente', 'Administration'];
  const charges = [
    { nom: 'Salaires', montant: entier(h, 20, 60) * 100000 },
    { nom: 'Loyer', montant: entier(h, 10, 30) * 100000 },
    { nom: 'Autres charges', montant: entier(h, 4, 15) * 100000 },
  ];
  const cles = charges.map(() => {
    const a = entier(h, 2, 5) * 10;
    const b = entier(h, 2, 10 - a / 10 - 1) * 10;
    return [a, b, 100 - a - b];
  });
  const totaux = centres.map((_, j) => charges.reduce((t, c, i) => t + (c.montant * cles[i]![j]!) / 100, 0));
  return {
    format: 'calcul',
    sujet: 'Feuille de répartition des coûts',
    enonce: ['Répartissez les charges indirectes sur les centres de coûts selon les clés de répartition (en %), puis calculez le total de chaque centre.'],
    tableau: { entetes: ['Charge', 'Montant', ...centres.map((c) => `Clé ${c}`)], lignes: charges.map((c, i) => [c.nom, m(c.montant), ...cles[i]!.map((k) => `${k} %`)]) },
    champs: centres.map((c, j) => chf(`Total du centre ${c}`, totaux[j]!)),
    explication: [
      'Part d’un centre = montant de la charge × clé ÷ 100 ; total du centre = somme de ses parts.',
      ...centres.map((c, j) => `${c} : ${charges.map((ch, i) => `${m(ch.montant)} × ${cles[i]![j]} %`).join(' + ')} = ${m(totaux[j]!)}.`),
    ],
  };
}

/** Déclaration de salaire annuelle : masse salariale et cotisations (taux donnés). */
function declarationSalaire(h: Hasard): QuestionCalcul {
  const employes = melanger(h, ['Luca', 'Inès', 'Noah', 'Léa', 'Marc']).slice(0, 3).map((nom) => ({ nom, mensuel: entier(h, 40, 75) * 10000 }));
  const masse = employes.reduce((t, e) => t + e.mensuel * 12, 0);
  const avs = Math.round((masse * 106) / 1000);
  const ac = Math.round((masse * 22) / 1000);
  return {
    format: 'calcul',
    sujet: 'Déclaration de salaire',
    enonce: [
      'Établissez la déclaration annuelle des salaires pour la caisse de compensation (12 salaires mensuels, pas de 13e salaire).',
      'Taux : AVS/AI/APG 5,3 % pour l’employé et 5,3 % pour l’employeur ; AC 1,1 % et 1,1 % (salaires sous le plafond AC).',
    ],
    tableau: { entetes: ['Employé', 'Salaire brut mensuel'], lignes: employes.map((e) => [e.nom, m(e.mensuel)]) },
    champs: [chf('Masse salariale annuelle soumise à l’AVS', masse), chf('Cotisations AVS/AI/APG (employé et employeur, 10,6 %)', avs), chf('Cotisations AC (employé et employeur, 2,2 %)', ac), chf('Part de l’employeur (AVS/AI/APG et AC)', (avs + ac) / 2)],
    explication: [
      `Masse salariale = somme des salaires annuels = ${employes.map((e) => `12 × ${m(e.mensuel)}`).join(' + ')} = ${m(masse)}.`,
      `AVS/AI/APG = ${m(masse)} × 10,6 % = ${m(avs)} ; AC = ${m(masse)} × 2,2 % = ${m(ac)}.`,
      `L’employeur paie la moitié des cotisations : (${m(avs)} + ${m(ac)}) ÷ 2 = ${m((avs + ac) / 2)}.`,
    ],
  };
}

// ---------- MP, semestre 1 : partie double, intérêts, compte courant ----------

const CLASSES: Record<number, string> = {
  1: 'Classe 1 · Actifs',
  2: 'Classe 2 · Passifs',
  3: "Classe 3 · Chiffre d'affaires",
  4: 'Classe 4 · Charges de marchandises et de services',
  5: 'Classe 5 · Charges de personnel',
  6: "Classe 6 · Autres charges d'exploitation, amortissements, résultat financier",
  7: 'Classe 7 · Résultats des activités annexes',
  8: 'Classe 8 · Résultats exceptionnels et hors exploitation, impôts',
  9: 'Classe 9 · Clôture',
};

/** Plan comptable PME : à quelle classe appartient un compte ? */
function classeCompte(h: Hasard, plan: readonly Compte[]): QuestionQcm {
  const candidats = plan.filter((c) => c.niveauMin !== null && c.classe >= 1 && c.classe <= 8);
  const c = tirer(h, candidats);
  const choix = Object.values(CLASSES);
  return {
    format: 'qcm',
    sujet: 'Plan comptable PME',
    question: `Dans quelle classe du plan comptable PME se trouve le compte « ${c.intitule} » ?`,
    choix,
    reponse: c.classe - 1,
    explication: `${c.numero} ${c.intitule} : le premier chiffre du numéro donne la classe (${CLASSES[c.classe]}).`,
  };
}

/** Intérêt commercial 30/360 : calculer l'intérêt, la durée, le taux ou le capital. */
function interet(h: Hasard): QuestionCalcul {
  const capital = entier(h, 10, 200) * 100000;
  const taux = tirer(h, [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6]);
  const jours = entier(h, 1, 11) * 30 + tirer(h, [0, 0, 15]);
  const i = Math.round((capital * taux * jours) / 36000);
  const formule = 'I = C × t × j ÷ 36 000 (année commerciale de 360 jours, mois de 30 jours)';
  const cas = entier(h, 0, 3);
  if (cas === 0) {
    return { format: 'calcul', sujet: 'Intérêts', enonce: [`Capital ${m(capital)}, taux ${fr(taux)} %, durée ${jours} jours.`, 'Calculez l’intérêt.'], champs: [chf('Intérêt', i)], explication: [formule, `I = ${m(capital)} × ${fr(taux)} × ${jours} ÷ 36 000 = ${m(i)}.`] };
  }
  // Les cas inverses partent de l'intérêt arrondi au centime : tolérance en conséquence.
  const iExact = i;
  const tolCapital = Math.ceil((0.5 * 36000) / (taux * jours)) + 100;
  if (cas === 1) {
    return { format: 'calcul', sujet: 'Intérêts', enonce: [`Un capital de ${m(capital)} placé à ${fr(taux)} % a rapporté ${m(iExact)} d'intérêt.`, 'Pendant combien de jours a-t-il été placé ?'], champs: [nb('Durée en jours', jours, 0.5)], explication: [formule, `j = I × 36 000 ÷ (C × t) = ${m(iExact)} × 36 000 ÷ (${m(capital)} × ${fr(taux)}) = ${jours} jours.`] };
  }
  if (cas === 2) {
    return { format: 'calcul', sujet: 'Intérêts', enonce: [`Un capital de ${m(capital)} a rapporté ${m(iExact)} en ${jours} jours.`, 'À quel taux était-il placé ?'], champs: [pc("Taux d'intérêt", taux)], explication: [formule, `t = I × 36 000 ÷ (C × j) = ${m(iExact)} × 36 000 ÷ (${m(capital)} × ${jours}) = ${fr(taux)} %.`] };
  }
  return { format: 'calcul', sujet: 'Intérêts', enonce: [`Placé à ${fr(taux)} % pendant ${jours} jours, un capital a rapporté ${m(iExact)}.`, 'Quel était ce capital ?'], champs: [chf('Capital', capital, tolCapital)], explication: [formule, `C = I × 36 000 ÷ (t × j) = ${m(iExact)} × 36 000 ÷ (${fr(taux)} × ${jours}) = ${m(capital)}.`] };
}

/** Compte courant bancaire : méthode des nombres et impôt anticipé. */
function compteCourant(h: Hasard): QuestionCalcul {
  const taux = tirer(h, [0.5, 0.75, 1, 1.25, 1.5]);
  // Trois soldes créditeurs successifs jusqu'au 30.06 (180 jours).
  const j1 = entier(h, 1, 3) * 30;
  const j2 = entier(h, 1, 2) * 30;
  const j3 = 180 - j1 - j2;
  const soldes = [entier(h, 20, 80), entier(h, 30, 120), entier(h, 10, 90)].map((x) => x * 100000);
  const jours = [j1, j2, j3];
  const nombres = soldes.map((s, k) => (s / 100) * jours[k]! / 100);
  const total = nombres.reduce((t, x) => t + x, 0);
  const brut = Math.round((total * taux * 100) / 360);
  const ia = Math.round((brut * 35) / 100);
  return {
    format: 'calcul',
    sujet: 'Compte courant et méthode des nombres',
    enonce: [`Compte courant bancaire créditeur, taux d'intérêt ${fr(taux, 2)} %, impôt anticipé 35 %. Bouclement au 30.06 (180 jours).`, 'Calculez les nombres, l’intérêt brut, l’impôt anticipé et l’intérêt net crédité.'],
    tableau: { entetes: ['Période', 'Solde créditeur', 'Jours'], lignes: soldes.map((s, k) => [`Période ${k + 1}`, m(s), String(jours[k])]) },
    champs: [
      ...nombres.map((x, k) => nb(`Nombre de la période ${k + 1}`, Math.round(x), 1)),
      chf('Intérêt brut', brut),
      chf('Impôt anticipé (35 %)', ia),
      chf('Intérêt net crédité', brut - ia),
    ],
    explication: [
      'Nombre = capital × jours ÷ 100 ; intérêt = total des nombres × taux ÷ 360.',
      ...nombres.map((x, k) => `Période ${k + 1} : ${n(soldes[k]! / 100)} × ${jours[k]} ÷ 100 = ${n(x)}.`),
      `Intérêt brut = ${n(total)} × ${fr(taux, 2)} ÷ 360 = ${m(brut)} ; impôt anticipé = 35 % de ${m(brut)} = ${m(ia)} ; net = ${m(brut - ia)}.`,
    ],
  };
}

// ---------- MP, semestre 2 : devises, calcul des prix, amortissements ----------

/** Conversion de monnaies étrangères avec un tableau de cotations (billets et devises, achat et vente). */
function devises(h: Hasard): QuestionCalcul {
  const monnaies = [
    { code: 'EUR', base: 0.94 },
    { code: 'USD', base: 0.88 },
    { code: 'GBP', base: 1.1 },
  ];
  const cot = monnaies.map((x) => {
    const milieu = x.base + (entier(h, -20, 20) / 1000);
    return { code: x.code, da: milieu - 0.008, dv: milieu + 0.008, ba: milieu - 0.03, bv: milieu + 0.03 };
  });
  const c = tirer(h, cot);
  const montant = entier(h, 5, 120) * 10000;
  const cas = tirer(h, [
    { texte: `L'entreprise paie par virement une facture de ${c.code} ${m(montant)} à un fournisseur étranger.`, cours: c.dv, nom: 'devises, vente' },
    { texte: `Un client étranger verse ${c.code} ${m(montant)} sur le compte bancaire de l'entreprise.`, cours: c.da, nom: 'devises, achat' },
    { texte: `Le patron achète au guichet ${c.code} ${m(montant)} en billets pour un voyage d'affaires.`, cours: c.bv, nom: 'billets, vente' },
    { texte: `Au retour, l'entreprise revend à la banque ${c.code} ${m(montant)} en billets.`, cours: c.ba, nom: 'billets, achat' },
  ]);
  const chfMontant = Math.round((montant * Math.round(cas.cours * 10000)) / 10000);
  const f4 = (x: number) => x.toFixed(4).replace('.', ',');
  return {
    format: 'calcul',
    sujet: 'Monnaies étrangères',
    enonce: [cas.texte, 'Quel montant en CHF est comptabilisé ? Utilisez le cours qui convient du tableau (pour 1 unité).'],
    tableau: { entetes: ['Monnaie', 'Devises achat', 'Devises vente', 'Billets achat', 'Billets vente'], lignes: cot.map((x) => [x.code, f4(x.da), f4(x.dv), f4(x.ba), f4(x.bv)]) },
    champs: [chf('Montant en CHF', chfMontant)],
    explication: [
      'Virement : cours des devises ; espèces : cours des billets. La banque vend quand l’entreprise a besoin de la monnaie étrangère, elle achète quand l’entreprise la lui remet.',
      `Ici : cours ${cas.nom} = ${f4(cas.cours)} ; ${m(montant)} × ${f4(cas.cours)} = CHF ${m(chfMontant)}.`,
    ],
  };
}

/** Calcul des prix à rebours : du prix de vente brut au prix d'achat brut (chaque étape arrondie au centime). */
function prixInverse(h: Hasard): QuestionCalcul {
  const pvb = entier(h, 200, 2000) * 100;
  const ra = tirer(h, [0, 5, 10]);
  const ea = tirer(h, [0, 2, 3]);
  const bn = tirer(h, [10, 15, 20, 25]);
  const fg = tirer(h, [20, 25, 30, 40]);
  const fa = entier(h, 1, 8) * 500;
  const eo = tirer(h, [0, 2]);
  const ro = tirer(h, [10, 20, 25]);
  const pvc = Math.round((pvb * (100 - ra)) / 100);
  const pvn = Math.round((pvc * (100 - ea)) / 100);
  const pr = Math.round((pvn * 100) / (100 + bn));
  const pra = Math.round((pr * 100) / (100 + fg));
  const pan = pra - fa;
  const pac = Math.round((pan * 100) / (100 - eo));
  const pab = Math.round((pac * 100) / (100 - ro));
  return {
    format: 'calcul',
    sujet: 'Calcul des prix à rebours',
    enonce: [
      `Le prix de vente brut (PVB) d'un article est de ${m(pvb)}. Retrouvez le prix d'achat brut (PAB), en arrondissant chaque étape au centime.`,
      `Rabais accordé ${ra} % du PVB ; escompte accordé ${ea} % du PVC ; bénéfice net ${bn} % du PR ; frais généraux ${fg} % du PRA ; frais d'achat ${m(fa)} ; escompte obtenu ${eo} % du PAC ; rabais obtenu ${ro} % du PAB.`,
    ],
    champs: [chf('PVC', pvc), chf('PVN', pvn), chf('PR', pr), chf('PRA', pra), chf('PAN', pan), chf('PAC', pac), chf('PAB', pab)],
    explication: [
      `PVC = PVB × (100 − ${ra}) % = ${m(pvc)} ; PVN = PVC × (100 − ${ea}) % = ${m(pvn)}.`,
      `PR = PVN ÷ (100 + ${bn}) % = ${m(pr)} ; PRA = PR ÷ (100 + ${fg}) % = ${m(pra)}.`,
      `PAN = PRA − frais d'achat = ${m(pan)} ; PAC = PAN ÷ (100 − ${eo}) % = ${m(pac)} ; PAB = PAC ÷ (100 − ${ro}) % = ${m(pab)}.`,
    ],
  };
}

/** Amortissement linéaire, valeur comptable et résultat de la cession d'une immobilisation. */
function cession(h: Hasard): QuestionCalcul {
  const va = entier(h, 20, 120) * 100000;
  const taux = tirer(h, [10, 12.5, 20, 25]);
  const annees = entier(h, 1, Math.min(3, Math.floor(100 / taux) - 1));
  const cumul = Math.round((va * taux * annees) / 100);
  const vc = va - cumul;
  const prix = Math.round((vc * entier(h, 70, 130)) / 100 / 10000) * 10000;
  return {
    format: 'calcul',
    sujet: "Cession d'une immobilisation",
    enonce: [
      `Une machine acquise ${m(va)} est amortie de ${fr(taux)} % par an de la valeur d'acquisition (amortissement linéaire) depuis ${annees} an${annees > 1 ? 's' : ''}.`,
      `Elle est vendue ${m(prix)} au début de l'exercice suivant.`,
    ],
    champs: [chf('Amortissements cumulés', cumul), chf('Valeur comptable au moment de la vente', vc), chf('Résultat de la cession (bénéfice, ou perte avec un signe moins)', prix - vc)],
    explication: [
      `Amortissements cumulés = ${m(va)} × ${fr(taux)} % × ${annees} = ${m(cumul)} ; valeur comptable = ${m(va)} − ${m(cumul)} = ${m(vc)}.`,
      `Résultat = prix de vente − valeur comptable = ${m(prix)} − ${m(vc)} = ${m(prix - vc)} (${prix >= vc ? 'bénéfice' : 'perte'} de cession).`,
    ],
  };
}

/** Amortissement dégressif et passage de la méthode directe à la méthode indirecte. */
function changementMethode(h: Hasard): QuestionCalcul {
  const va = entier(h, 20, 90) * 100000;
  const taux = tirer(h, [20, 25, 30, 40]);
  const a1 = Math.round((va * taux) / 100);
  const a2 = Math.round(((va - a1) * taux) / 100);
  const vc = va - a1 - a2;
  return {
    format: 'calcul',
    sujet: "Changement de méthode d'amortissement",
    enonce: [
      `Un véhicule acquis ${m(va)} a été amorti deux ans de suite selon la méthode directe, dégressive, ${taux} % de la valeur comptable.`,
      "Au début de la 3e année, l'entreprise passe à la méthode indirecte : le compte du véhicule doit à nouveau montrer la valeur d'acquisition.",
    ],
    champs: [chf('Amortissement de la 1re année', a1), chf('Amortissement de la 2e année', a2), chf('Valeur comptable au début de la 3e année', vc), chf('Montant viré au fonds d’amortissements cumulés', a1 + a2)],
    explication: [
      `1re année : ${m(va)} × ${taux} % = ${m(a1)} ; 2e année : (${m(va)} − ${m(a1)}) × ${taux} % = ${m(a2)}.`,
      `Valeur comptable = ${m(vc)}. Pour passer à la méthode indirecte, on reporte les amortissements cumulés (${m(a1 + a2)}) au débit du compte du véhicule et au crédit du fonds d'amortissements cumulés.`,
    ],
  };
}

// ---------- MP, semestre 4 : SA, titres, immeubles ----------

/** Perte de capital et surendettement (art. 725a et 725b CO révisés). */
function perteCapital(h: Hasard): QuestionCalcul {
  const capital = entier(h, 10, 50) * 1000000;
  const reserves = Math.round((capital * entier(h, 5, 20)) / 100);
  const dettes = entier(h, 50, 300) * 1000000;
  const cas = entier(h, 0, 2);
  const seuil = (capital + reserves) / 2;
  const fp = cas === 0 ? seuil + entier(h, 1, 10) * 1000000 : cas === 1 ? Math.round(seuil * entier(h, 10, 90) / 100) : -entier(h, 1, 20) * 1000000;
  const actifs = dettes + fp;
  const situation = fp < 0 ? 2 : fp < seuil ? 1 : 0;
  return {
    format: 'calcul',
    sujet: 'Perte de capital et surendettement',
    enonce: [
      `Bilan d'une SA : actifs ${m(actifs)}, dettes (capitaux étrangers) ${m(dettes)}.`,
      `Capital-actions ${m(capital)} ; réserves légales issues du capital et du bénéfice ${m(reserves)}.`,
    ],
    champs: [
      chf('Fonds propres (actifs − dettes)', fp),
      chf('Moitié du capital-actions et des réserves légales', seuil),
      { libelle: 'Situation de la société', type: 'choix', attendu: situation, choix: ['Pas de perte de capital', 'Perte de capital (art. 725a CO)', 'Surendettement (art. 725b CO)'] },
    ],
    explication: [
      `Fonds propres = ${m(actifs)} − ${m(dettes)} = ${m(fp)} ; moitié = (${m(capital)} + ${m(reserves)}) ÷ 2 = ${m(seuil)}.`,
      'Perte de capital : les actifs, déduction faite des dettes, ne couvrent plus la moitié du capital-actions et des réserves légales. Surendettement : les dettes ne sont plus couvertes par les actifs.',
    ],
  };
}

/** Bordereau d'achat d'obligations : prix, intérêt couru (30/360), courtage et droit de timbre. */
function bordereau(h: Hasard): QuestionCalcul {
  const nominal = entier(h, 1, 20) * 1000000;
  const cours = entier(h, 950, 1050) / 10;
  const taux = tirer(h, [1.5, 2, 2.25, 2.5, 3]);
  const jours = entier(h, 1, 11) * 30;
  const courtage = tirer(h, [0.5, 0.6, 0.8, 1]);
  // Droit de timbre de négociation sur titres suisses : 1,5 pour mille, dont la moitié à la charge du client.
  const timbre = 0.075;
  const prix = Math.round((nominal * cours) / 100);
  const ic = Math.round((nominal * taux * jours) / 36000);
  const fc = Math.round((prix * courtage) / 100);
  const ft = Math.round((prix * timbre) / 100);
  return {
    format: 'calcul',
    sujet: "Bordereau d'achat d'obligations",
    enonce: [
      `Achat d'obligations ${fr(taux, 2)} %, valeur nominale ${m(nominal)}, au cours de ${fr(cours)} %.`,
      `Dernier coupon payé il y a ${jours} jours (intérêt couru 30/360). Courtage ${fr(courtage, 1)} % et droit de timbre ${fr(timbre, 3)} % du prix.`,
    ],
    champs: [chf('Prix (valeur cotée)', prix), chf('Intérêt couru', ic), chf('Courtage', fc), chf('Droit de timbre', ft), chf('Montant débité', prix + ic + fc + ft)],
    explication: [
      `Prix = ${m(nominal)} × ${fr(cours)} % = ${m(prix)} ; intérêt couru = ${m(nominal)} × ${fr(taux, 2)} × ${jours} ÷ 36 000 = ${m(ic)}.`,
      `Courtage = ${m(prix)} × ${fr(courtage, 1)} % = ${m(fc)} ; timbre = ${m(prix)} × ${fr(timbre, 3)} % = ${m(ft)} ; total = ${m(prix + ic + fc + ft)}.`,
    ],
  };
}

/** Rendements : action, obligation (formule générale) et immeuble (brut et net). */
function rendements(h: Hasard): QuestionCalcul {
  const cas = entier(h, 0, 2);
  if (cas === 0) {
    const prix = entier(h, 50, 400) * 100;
    const div = Math.round((prix * entier(h, 15, 50)) / 1000);
    const vente = Math.round((prix * entier(h, 90, 120)) / 100);
    const r = ((div + vente - prix) / prix) * 100;
    return { format: 'calcul', sujet: 'Rendement d’une action', enonce: [`Action achetée ${m(prix)}, dividende brut ${m(div)}, revendue un an plus tard ${m(vente)}.`, 'Calculez le rendement de l’année.'], champs: [pc('Rendement', r)], explication: ['Rendement = (dividende + gain ou − perte de cours) ÷ prix d’achat × 100.', `(${m(div)} + ${m(vente - prix)}) ÷ ${m(prix)} × 100 = ${fr(pc1(r))} %.`] };
  }
  if (cas === 1) {
    const cours = entier(h, 92, 108);
    const taux = tirer(h, [1.5, 2, 2.5, 3, 3.5]);
    const annees = entier(h, 2, 8);
    const r = ((taux + (100 - cours) / annees) / cours) * 100;
    return { format: 'calcul', sujet: 'Rendement d’une obligation', enonce: [`Obligation ${fr(taux)} %, achetée au cours de ${cours} %, remboursée à 100 % dans ${annees} ans.`, 'Calculez le rendement annuel (formule générale).'], champs: [pc('Rendement', r)], explication: ['Rendement = (intérêt annuel ± différence de remboursement ÷ années) ÷ cours d’achat × 100.', `(${fr(taux)} + (100 − ${cours}) ÷ ${annees}) ÷ ${cours} × 100 = ${fr(pc1(r))} %.`] };
  }
  const prix = entier(h, 8, 30) * 10000000;
  const fp = Math.round((prix * entier(h, 20, 40)) / 100);
  const loyers = Math.round((prix * entier(h, 45, 65)) / 1000);
  const charges = Math.round((loyers * entier(h, 15, 30)) / 100);
  const hypo = prix - fp;
  const interets = Math.round((hypo * tirer(h, [15, 18, 20, 25])) / 1000);
  const brut = (loyers / prix) * 100;
  const net = ((loyers - charges - interets) / fp) * 100;
  return {
    format: 'calcul',
    sujet: 'Rendement d’un immeuble',
    enonce: [`Immeuble acheté ${m(prix)}, financé par ${m(fp)} de fonds propres et ${m(hypo)} d'hypothèque.`, `Loyers annuels ${m(loyers)}, charges d'entretien et d'exploitation ${m(charges)}, intérêts hypothécaires ${m(interets)}.`],
    champs: [pc('Rendement brut (loyers ÷ prix)', brut), pc('Rendement net des fonds propres', net)],
    explication: [`Rendement brut = ${m(loyers)} ÷ ${m(prix)} × 100 = ${fr(pc1(brut))} %.`, `Rendement net = (loyers − charges − intérêts) ÷ fonds propres × 100 = ${m(loyers - charges - interets)} ÷ ${m(fp)} × 100 = ${fr(pc1(net))} %.`],
  };
}

// ---------- MP, semestres 5 et 6 : point mort, flux, comptabilité analytique, normes ----------

/** Point mort en CHF et en date (marge contributive = marge brute, seul le PRAMV est variable) ; rotation du stock. */
function pointMort(h: Hasard): QuestionCalcul {
  const ca = entier(h, 50, 300) * 1000000;
  const tauxMb = entier(h, 25, 45);
  const mb = Math.round((ca * tauxMb) / 100);
  const cf = Math.round((mb * entier(h, 50, 90)) / 100);
  const seuil = Math.round((cf * 100) / tauxMb);
  const jour = Math.ceil((seuil / ca) * 360);
  const prmv = ca - mb;
  const stockMoyen = Math.round(prmv / tirer(h, [4, 5, 6, 8]));
  const rotation = prmv / stockMoyen;
  return {
    format: 'calcul',
    sujet: 'Point mort et rotation du stock',
    enonce: [
      `Chiffre d'affaires annuel ${m(ca)}, marge brute ${m(mb)} (${tauxMb} % du CA), charges fixes ${m(cf)}.`,
      `Stock moyen de marchandises ${m(stockMoyen)}. Par simplification, la marge contributive est égale à la marge brute.`,
    ],
    champs: [
      chf("Chiffre d'affaires au point mort", seuil, 100),
      nb('Jour de l’année où le point mort est atteint (année de 360 jours, arrondi au jour supérieur)', jour, 1),
      nb('Rotation du stock (PRAMV ÷ stock moyen)', Math.round(rotation * 100) / 100, 0.01),
      nb('Durée moyenne de stockage en jours (360 ÷ rotation)', Math.round(360 / rotation), 1),
    ],
    explication: [
      `CA au point mort = charges fixes ÷ taux de marge = ${m(cf)} ÷ ${tauxMb} % = ${m(seuil)}.`,
      `Date = ${m(seuil)} ÷ ${m(ca)} × 360 = ${fr((seuil / ca) * 360, 1)}, soit le ${jour}e jour.`,
      `PRAMV = CA − marge brute = ${m(prmv)} ; rotation = ${m(prmv)} ÷ ${m(stockMoyen)} = ${fr(rotation, 2)} ; durée = 360 ÷ ${fr(rotation, 2)} = ${Math.round(360 / rotation)} jours.`,
    ],
  };
}

/** Cash-flow d'exploitation par la méthode directe et free cash-flow. */
function fluxDirect(h: Hasard): QuestionCalcul {
  const enc = entier(h, 300, 900) * 100000;
  const four = Math.round((enc * entier(h, 40, 55)) / 100 / 100000) * 100000;
  const pers = Math.round((enc * entier(h, 15, 25)) / 100 / 100000) * 100000;
  const autres = Math.round((enc * entier(h, 5, 12)) / 100 / 100000) * 100000;
  const invest = entier(h, 10, 120) * 100000;
  const cessions = entier(h, 0, 20) * 100000;
  const cf = enc - four - pers - autres;
  return {
    format: 'calcul',
    sujet: 'Flux de trésorerie, méthode directe',
    enonce: ['Calculez le cash-flow d’exploitation par la méthode directe, puis le free cash-flow.'],
    tableau: {
      entetes: ['Flux de l’exercice', 'Montant'],
      lignes: [['Encaissements des clients', m(enc)], ['Paiements aux fournisseurs', m(four)], ['Paiements au personnel', m(pers)], ['Autres paiements d’exploitation', m(autres)], ['Investissements payés', m(invest)], ['Ventes d’immobilisations encaissées', m(cessions)]],
    },
    champs: [chf("Cash-flow d'exploitation", cf), chf('Free cash-flow', cf - invest + cessions)],
    explication: [
      `Cash-flow d'exploitation = encaissements − paiements d'exploitation = ${m(enc)} − ${m(four)} − ${m(pers)} − ${m(autres)} = ${m(cf)}.`,
      `Free cash-flow = cash-flow d'exploitation − investissements + désinvestissements = ${m(cf)} − ${m(invest)} + ${m(cessions)} = ${m(cf - invest + cessions)}.`,
    ],
  };
}

/** Comptabilité analytique : feuille de répartition avec centre auxiliaire, coût d'unité d'œuvre, prix de revient. */
function analytique(h: Hasard): QuestionCalcul {
  const indirect = { batiment: entier(h, 20, 60) * 100000, production: entier(h, 150, 400) * 100000, admin: entier(h, 60, 200) * 100000 };
  const cleProd = tirer(h, [60, 70, 75, 80]);
  const totalProd = indirect.production + Math.round((indirect.batiment * cleProd) / 100);
  const totalAdmin = indirect.admin + indirect.batiment - Math.round((indirect.batiment * cleProd) / 100);
  const heures = entier(h, 20, 60) * 100;
  const coutHeure = Math.round(totalProd / heures);
  const matieres = entier(h, 20, 90) * 10000;
  const salaires = entier(h, 10, 40) * 10000;
  const h1 = entier(h, 5, 40);
  const coutProduction = matieres + salaires + h1 * coutHeure;
  const baseAdmin = entier(h, 1500, 4000) * 100000;
  const tauxAdmin = Math.round((totalAdmin / baseAdmin) * 1000) / 10;
  const admin = Math.round((coutProduction * tauxAdmin) / 100);
  return {
    format: 'calcul',
    sujet: 'Comptabilité analytique',
    enonce: [
      `Feuille de répartition. Centre auxiliaire Bâtiment ${m(indirect.batiment)}, à répartir ${cleProd} % sur la production et ${100 - cleProd} % sur l'administration et la vente (répartition secondaire).`,
      `Charges primaires : Production ${m(indirect.production)}, Administration et vente ${m(indirect.admin)}.`,
      `Unité d'œuvre de la production : ${n(heures)} heures-machine. Les frais d'administration et de vente sont imputés en % du coût de production, sur une base de ${m(baseAdmin)}.`,
      `Commande : matières ${m(matieres)}, salaires directs ${m(salaires)}, ${h1} heures-machine.`,
    ],
    champs: [
      chf('Total du centre Production après répartition secondaire', totalProd),
      chf("Coût d'une heure-machine (arrondi au centime)", coutHeure, 1),
      chf('Coût de production de la commande', coutProduction, 5),
      pc("Taux des frais d'administration et de vente", tauxAdmin),
      chf('Prix de revient complet de la commande', coutProduction + admin, 100),
    ],
    explication: [
      `Production = ${m(indirect.production)} + ${cleProd} % de ${m(indirect.batiment)} = ${m(totalProd)} ; Administration et vente = ${m(totalAdmin)}.`,
      `Coût d'une heure-machine = ${m(totalProd)} ÷ ${n(heures)} = ${m(coutHeure)}.`,
      `Coût de production = ${m(matieres)} + ${m(salaires)} + ${h1} × ${m(coutHeure)} = ${m(coutProduction)}.`,
      `Taux d'administration = ${m(totalAdmin)} ÷ ${m(baseAdmin)} × 100 = ${fr(tauxAdmin)} % ; prix de revient = ${m(coutProduction)} + ${fr(tauxAdmin)} % = ${m(coutProduction + admin)}.`,
    ],
  };
}

const QUESTIONS_NORMES: Omit<QuestionQcm, 'format' | 'sujet'>[] = [
  { question: 'Quelles normes de présentation des comptes sont élaborées en Suisse, notamment pour les PME et les groupes non cotés à l’étranger ?', choix: ['Swiss GAAP RPC', 'IFRS', 'US GAAP'], reponse: 0, explication: 'Les Swiss GAAP RPC sont les recommandations suisses relatives à la présentation des comptes.' },
  { question: 'Quelles normes internationales sont publiées par l’IASB et utilisées par de nombreux groupes cotés en bourse ?', choix: ['Swiss GAAP RPC', 'IFRS', 'US GAAP'], reponse: 1, explication: 'Les IFRS (International Financial Reporting Standards) sont publiées par l’IASB.' },
  { question: 'Quelles normes s’appliquent aux sociétés cotées aux États-Unis ?', choix: ['Swiss GAAP RPC', 'IFRS', 'US GAAP'], reponse: 2, explication: 'Les US GAAP sont les normes comptables des États-Unis.' },
  { question: 'Lors de la consolidation, que fait-on des créances et des dettes entre deux sociétés du même groupe ?', choix: ['On les additionne', 'On les élimine', 'On les reporte en hors bilan'], reponse: 1, explication: 'Les opérations internes au groupe sont éliminées : le groupe ne peut pas avoir une dette envers lui-même.' },
  { question: 'Dans les comptes consolidés, la participation de la société mère dans une filiale est remplacée par…', choix: ['les actifs et les dettes de la filiale', 'le bénéfice de la filiale', 'le capital-actions de la filiale'], reponse: 0, explication: 'La participation est éliminée contre les fonds propres de la filiale ; ses actifs et ses dettes sont repris.' },
  { question: 'Pourquoi les normes comme les Swiss GAAP RPC ou les IFRS limitent-elles les réserves latentes ?', choix: ['Pour donner une image fidèle (true and fair view)', 'Pour réduire les impôts', 'Pour augmenter le bénéfice'], reponse: 0, explication: 'Ces normes visent une image fidèle de la situation financière, ce que les réserves latentes faussent.' },
];

function normes(h: Hasard): QuestionQcm {
  const q = tirer(h, QUESTIONS_NORMES);
  return { format: 'qcm', sujet: 'Comptes de groupe et normes', ...q };
}

// ---------- Registre ----------

export interface ContexteCalcul {
  plan: readonly Compte[];
  /** Modèles d'opérations du module (pour « classer la pièce »). */
  modeles?: readonly { texte: string; debit: string; min: number; max: number; pas: number }[];
}

// ---------- CFC 1 : classer une pièce avant de la comptabiliser ----------

export const SUJET_TRI = 'Classer la pièce';
export const CLASSEURS = ['Marchandises à revendre', 'Investissement (bien durable)', "Charge de l'entreprise", 'Privé (propriétaire)'];
const EXPLICATIONS_TRI = [
  "Des marchandises achetées pour être revendues : c'est un achat de marchandises.",
  "Un bien qui sert durablement à l'entreprise (machine, véhicule, mobilier, ordinateur) est un actif immobilisé : il figure au bilan.",
  "Une dépense consommée pendant l'exercice pour faire fonctionner l'entreprise est une charge.",
  "Ce que le propriétaire prend ou paie pour sa vie privée va dans son compte privé, pas dans les charges de l'entreprise.",
];

/** Classeur d'une opération d'après le compte débité, ou -1 si elle ne se classe pas ainsi. */
export function classeurDe(debit: string): number {
  if (debit === '4200') return 0;
  if (/^1[4-7]/.test(debit) && !debit.endsWith('9')) return 1;
  if (debit === '2850') return 3;
  if (/^[56]/.test(debit)) return 2;
  return -1;
}

function trier(h: Hasard, x: ContexteCalcul): QuestionQcm {
  const candidats = (x.modeles ?? []).filter((mo) => classeurDe(mo.debit) >= 0);
  const mo = tirer(h, candidats);
  const montant = (mo.min + entier(h, 0, Math.floor((mo.max - mo.min) / mo.pas)) * mo.pas) * 100;
  const reponse = classeurDe(mo.debit);
  return { format: 'qcm', sujet: SUJET_TRI, question: mo.texte.replace('{m}', m(montant)), choix: [...CLASSEURS], reponse, explication: EXPLICATIONS_TRI[reponse]! };
}

export const GENERATEURS: Record<string, (h: Hasard, x: ContexteCalcul) => QuestionGeneree> = {
  trier,
  'livres-auxiliaires': livresAuxiliaires,
  'marge-contributive': margeContributive,
  'repartition-simple': repartitionSimple,
  'declaration-salaire': declarationSalaire,
  'classe-compte': (h, x) => classeCompte(h, x.plan),
  interet,
  'compte-courant': compteCourant,
  devises,
  'prix-inverse': prixInverse,
  cession,
  'changement-methode': changementMethode,
  'perte-capital': perteCapital,
  bordereau,
  rendements,
  'point-mort': pointMort,
  'flux-direct': fluxDirect,
  analytique,
  normes,
};

export function genererCalcul(id: string, h: Hasard, x: ContexteCalcul): QuestionGeneree {
  const g = GENERATEURS[id];
  if (!g) throw new Error(`Générateur inconnu : ${id}`);
  return g(h, x);
}
