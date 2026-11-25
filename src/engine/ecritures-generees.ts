// Écritures générées pour le parcours « Apprendre » au-delà de la 1re année : TVA, amortissements, transitoires,
// pertes sur créances, salaires (CFC 2) ; sociétés, titres, provisions (MP). Chaque modèle reprend une écriture des
// corrigés validés (mêmes comptes, mêmes côtés) ; les montants changent à chaque série. L'élève choisit le compte de
// chaque ligne : les montants et les côtés sont donnés (écriture composée).

import type { Centimes } from './money';
import { formatMontant } from './money';
import { tvaSurHT, tvaSurTTC } from './tva';
import type { Hasard } from './exercices-courts';

export interface LigneComposee {
  cote: 'debit' | 'credit';
  compte: string;
  montant: Centimes;
}

export interface QuestionComposee {
  format: 'composee';
  sujet: string;
  texte: string;
  lignes: LigneComposee[];
}

const entier = (h: Hasard, a: number, b: number) => a + Math.floor(h() * (b - a + 1));
const m = (c: Centimes) => formatMontant(c);
const fr = (c: Centimes) => m(c);
const D = (compte: string, montant: Centimes): LigneComposee => ({ cote: 'debit', compte, montant });
const C = (compte: string, montant: Centimes): LigneComposee => ({ cote: 'credit', compte, montant });
const q = (sujet: string, texte: string, lignes: LigneComposee[]): QuestionComposee => ({ format: 'composee', sujet, texte, lignes });
const cent = (h: Hasard, a: number, b: number) => entier(h, a, b) * 10000;
const TVA = 81;

type Generateur = (h: Hasard) => QuestionComposee;

// ---------- CFC 2 : TVA au net ----------

const tva: Generateur[] = [
  (h) => { const ht = cent(h, 20, 150); const t = tvaSurHT(ht, TVA); return q('TVA', `Achat de marchandises à crédit : ${fr(ht)} + TVA 8,1 %.`, [D('4200', ht), D('1170', t), C('2000', ht + t)]); },
  (h) => { const ht = cent(h, 20, 200); const t = tvaSurHT(ht, TVA); return q('TVA', `Vente de marchandises à crédit : ${fr(ht)} + TVA 8,1 %.`, [D('1100', ht + t), C('3200', ht), C('2200', t)]); },
  (h) => { const ttc = cent(h, 10, 80) + 5000; const t = tvaSurTTC(ttc, TVA); return q('TVA', `Ventes au comptant de la semaine, TVA 8,1 % comprise : ${fr(ttc)}.`, [D('1000', ttc), C('3200', ttc - t), C('2200', t)]); },
  (h) => { const ht = entier(h, 20, 90) * 1000; const t = tvaSurHT(ht, TVA); return q('TVA', `Facture d'électricité payée par la banque : ${fr(ht)} + TVA 8,1 %.`, [D('6400', ht), D('1171', t), C('1020', ht + t)]); },
  (h) => { const ht = cent(h, 150, 400); const t = tvaSurHT(ht, TVA); return q('TVA', `Achat d'une camionnette de livraison, payée par la banque : ${fr(ht)} + TVA 8,1 %.`, [D('1530', ht), D('1171', t), C('1020', ht + t)]); },
  (h) => {
    const due = cent(h, 30, 90); const ip1 = Math.round(due * entier(h, 30, 60) / 100 / 5) * 5; const ip2 = entier(h, 50, 300) * 100;
    return q('TVA', `Décompte de TVA du trimestre : TVA due ${fr(due)}, impôt préalable sur marchandises ${fr(ip1)}, sur autres charges ${fr(ip2)}. Virez l'impôt préalable et le solde dû à l'AFC.`,
      [D('2200', due), C('1170', ip1), C('1171', ip2), C('2205', due - ip1 - ip2)]);
  },
  // Escompte avec correction de la TVA : retiré de la 2ème CFC le 25.11.2026 (enseigné en maturité seulement).
];

// ---------- CFC 2 : amortissements ----------

const amortissements: Generateur[] = [
  (h) => { const a = cent(h, 5, 40); return q('Amortissements', `Amortissement des machines selon la méthode indirecte : ${fr(a)}.`, [D('6800', a), C('1509', a)]); },
  (h) => { const a = cent(h, 5, 30); return q('Amortissements', `Amortissement des véhicules selon la méthode indirecte : ${fr(a)}.`, [D('6800', a), C('1539', a)]); },
  (h) => { const a = cent(h, 2, 15); return q('Amortissements', `Amortissement du mobilier selon la méthode directe : ${fr(a)}.`, [D('6800', a), C('1510', a)]); },
  (h) => { const a = cent(h, 2, 12); return q('Amortissements', `Amortissement direct de l'infrastructure informatique (ordinateurs) : ${fr(a)}.`, [D('6800', a), C('1521', a)]); },
  (h) => { const a = cent(h, 3, 10); const b = cent(h, 3, 20); return q('Amortissements', `Amortissements indirects : mobilier ${fr(a)}, véhicules ${fr(b)}.`, [D('6800', a + b), C('1519', a), C('1539', b)]); },
];

// ---------- CFC 2 : actifs et passifs transitoires ----------

const transitoires: Generateur[] = [
  (h) => { const a = cent(h, 3, 12); return q('Transitoires', `Bouclement : la prime d'assurance payée en juillet comprend ${fr(a)} qui concernent l'exercice suivant.`, [D('1300', a), C('6300', a)]); },
  (h) => { const a = cent(h, 10, 30); return q('Transitoires', `Bouclement : le loyer de janvier de l'an prochain, ${fr(a)}, a déjà été payé.`, [D('1300', a), C('6000', a)]); },
  (h) => { const a = cent(h, 10, 30); return q('Transitoires', `Bouclement : le loyer de décembre, ${fr(a)}, n'a pas encore été payé.`, [D('6000', a), C('2300', a)]); },
  (h) => { const a = entier(h, 30, 150) * 1000; return q('Transitoires', `Bouclement : une réparation effectuée en décembre, ${fr(a)}, n'est pas encore facturée.`, [D('6100', a), C('2300', a)]); },
  (h) => { const a = cent(h, 20, 80); return q('Transitoires', `Bouclement : intérêt couru de la dette hypothécaire, payable l'an prochain, ${fr(a)}.`, [D('6900', a), C('2300', a)]); },
  (h) => { const a = cent(h, 3, 12); return q('Transitoires', `Réouverture : extourne de l'actif transitoire (prime d'assurance payée d'avance), ${fr(a)}.`, [D('6300', a), C('1300', a)]); },
  (h) => { const a = entier(h, 50, 300) * 1000; return q('Transitoires', `Réouverture : extourne du passif transitoire (électricité de décembre à payer), ${fr(a)}.`, [D('2300', a), C('6400', a)]); },
];

// ---------- CFC 2 : pertes sur créances, créances douteuses, ducroire ----------

const creances: Generateur[] = [
  (h) => { const a = cent(h, 5, 40); return q('Pertes sur créances', `Un client est déclaré en faillite : sa créance de ${fr(a)} est définitivement perdue.`, [D('3805', a), C('1100', a)]); },
  (h) => { const a = cent(h, 5, 40); return q('Pertes sur créances', `Un client a de graves difficultés financières : sa créance de ${fr(a)} devient douteuse.`, [D('1108', a), C('1100', a)]); },
  (h) => {
    const a = cent(h, 10, 40); const verse = Math.round(a * entier(h, 20, 60) / 100 / 1000) * 1000;
    return q('Pertes sur créances', `Le client douteux (créance de ${fr(a)}) verse ${fr(verse)} par la banque pour solde de tout compte.`, [D('1020', verse), D('3805', a - verse), C('1108', a)]);
  },
  (h) => { const a = entier(h, 50, 400) * 1000; return q('Pertes sur créances', `Ducroire au 31.12 : les créances ont augmenté, la provision doit augmenter de ${fr(a)}.`, [D('3805', a), C('1109', a)]); },
  (h) => { const a = entier(h, 50, 400) * 1000; return q('Pertes sur créances', `Ducroire : les créances ont diminué, la provision est réduite de ${fr(a)}.`, [D('1109', a), C('3805', a)]); },
  (h) => { const a = entier(h, 20, 150) * 1000; return q('Pertes sur créances', `Un ancien client verse ${fr(a)} par la banque sur une créance amortie comme perte l'an dernier.`, [D('1020', a), C('8510', a)]); },
];

// ---------- CFC 2 : salaires ----------

const salaires: Generateur[] = [
  (h) => {
    const brut = cent(h, 40, 80); const avs = Math.round(brut * 64 / 1000 / 5) * 5; const lpp = Math.round(brut * 40 / 1000 / 5) * 5;
    return q('Salaires', `Salaire du mois viré par la banque. Brut ${fr(brut)} ; retenues AVS/AI/APG/AC 6,4 % (${fr(avs)}) et LPP 4 % (${fr(lpp)}).`, [D('5200', brut), C('2170', avs), C('2171', lpp), C('1020', brut - avs - lpp)]);
  },
  (h) => {
    const brut = cent(h, 40, 80); const avs = Math.round(brut * 64 / 1000 / 5) * 5; const lpp = Math.round(brut * 40 / 1000 / 5) * 5;
    return q('Salaires', `Cotisations de l'employeur sur un salaire brut de ${fr(brut)} : AVS/AI/APG/AC 6,4 % (${fr(avs)}), LPP 4 % (${fr(lpp)}).`, [D('5270', avs + lpp), C('2170', avs), C('2171', lpp)]);
  },
  (h) => { const a = cent(h, 5, 20); return q('Salaires', `Paiement par la banque de la dette envers la caisse AVS, ${fr(a)}.`, [D('2170', a), C('1020', a)]); },
  (h) => { const a = entier(h, 3, 10) * 10000; return q('Salaires', `Un employé reçoit une avance sur salaire de ${fr(a)}, virée par la banque.`, [D('1140', a), C('1020', a)]); },
];

// ---------- MP : sociétés anonymes ----------

const societes: Generateur[] = [
  (h) => { const a = entier(h, 1, 5) * 10000000; return q('Sociétés', `Fondation : souscription intégrale du capital-actions de ${fr(a)}.`, [D('1850', a), C('2800', a)]); },
  (h) => { const a = entier(h, 1, 5) * 10000000; return q('Sociétés', `Les actionnaires libèrent ${fr(a)} à la banque.`, [D('1020', a), C('1850', a)]); },
  (h) => {
    const nb = entier(h, 1, 5) * 100; const nominal = 100000; const agio = entier(h, 1, 6) * 10000;
    return q('Sociétés', `Augmentation du capital : ${nb} actions de ${fr(nominal)} nominal émises à ${fr(nominal + agio)} (agio ${fr(agio)} par action), souscrites.`, [D('1850', nb * (nominal + agio)), C('2800', nb * nominal), C('2900', nb * agio)]);
  },
  (h) => {
    const leg = cent(h, 5, 20); const div = cent(h, 50, 150); const rep = cent(h, 1, 9);
    return q('Sociétés', `L'assemblée générale répartit le bénéfice : réserve légale issue du bénéfice ${fr(leg)}, dividende ${fr(div)}, solde ${fr(rep)} aux réserves facultatives issues du bénéfice.`, [D('2970', leg + div + rep), C('2950', leg), C('2230', div), C('2960', rep)]);
  },
  (h) => {
    const div = cent(h, 50, 150); const ia = Math.round(div * 35 / 100);
    return q('Sociétés', `Paiement du dividende de ${fr(div)} par la banque, déduction faite de l'impôt anticipé de 35 % (${fr(ia)}).`, [D('2230', div), C('1020', div - ia), C('2205', ia)]);
  },
  (h) => { const a = entier(h, 20, 90) * 10000; return q('Sociétés', `Facture du notaire pour l'augmentation du capital, ${fr(a)}.`, [D('6550', a), C('2010', a)]); },
];

// ---------- MP : titres, intérêts et provisions ----------

const titres: Generateur[] = [
  (h) => { const a = cent(h, 10, 60) + entier(h, 100, 500) * 100; return q('Titres', `Achat d'actions cotées par la banque, courtage et frais compris : ${fr(a)}.`, [D('1060', a), C('1020', a)]); },
  (h) => { const a = cent(h, 10, 60); return q('Titres', `La banque vend des actions ; montant net crédité après frais : ${fr(a)}.`, [D('1020', a), C('1060', a)]); },
  (h) => {
    const brut = entier(h, 40, 300) * 1000; const ia = Math.round(brut * 35 / 100);
    return q('Titres', `Dividende brut de ${fr(brut)} crédité en banque sous déduction de l'impôt anticipé de 35 % (${fr(ia)}).`, [D('1020', brut - ia), D('1176', ia), C('6952', brut)]);
  },
  (h) => { const a = entier(h, 10, 80) * 10000; return q('Titres', `Au 31.12, le cours des actions a baissé : ajustement de la valeur au bilan, ${fr(a)}.`, [D('6940', a), C('1060', a)]); },
  (h) => { const a = cent(h, 20, 80); return q('Intérêts et provisions', `La banque débite l'intérêt annuel de l'emprunt bancaire à long terme, ${fr(a)}.`, [D('6900', a), C('1020', a)]); },
  (h) => { const a = cent(h, 3, 12); return q('Intérêts et provisions', `Constitution d'une provision pour les impôts sur le bénéfice de l'exercice, ${fr(a)}.`, [D('8900', a), C('2640', a)]); },
  (h) => { const a = cent(h, 3, 12); return q('Intérêts et provisions', `Constitution d'une provision pour une révision de machine prévue en janvier, ${fr(a)}.`, [D('6100', a), C('2600', a)]); },
];

export const GENERATEURS_ECRITURES: Record<string, Generateur[]> = {
  tva, amortissements, transitoires, creances, salaires, societes, titres,
};

export function genererEcriture(id: string, h: Hasard): QuestionComposee {
  const liste = GENERATEURS_ECRITURES[id];
  if (!liste) throw new Error(`Écritures inconnues : ${id}`);
  return liste[Math.floor(h() * liste.length)]!(h);
}

/** Comptes proposés dans les listes d'un module : tous ceux de ses écritures. */
export function comptesEcritures(ids: readonly string[], h: Hasard): string[] {
  const s = new Set<string>();
  for (const id of ids) for (const g of GENERATEURS_ECRITURES[id] ?? []) for (const l of g(h).lignes) s.add(l.compte);
  return [...s].sort();
}
