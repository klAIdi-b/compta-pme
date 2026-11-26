// Formulaire officiel de décompte TVA (méthode effective), demande de l'enseignant du 23.11.2026.
// Chiffres du formulaire de l'AFC depuis 2024 (structure confirmée le 24.11.2026 sur le formulaire officiel 0550) :
//   200 total des contre-prestations ; 220 prestations exonérées (exportations) ; 235 diminutions de la
//   contre-prestation (rabais, escomptes) ; 289 total des déductions ; 299 contre-prestation imposable (200 − 289) ;
//   303 / 313 / 343 prestations imposables et impôt aux taux de 8,1 / 2,6 / 3,8 % ; 399 total de l'impôt dû ;
//   400 impôt préalable sur le coût du matériel et des prestations de services ; 405 impôt préalable sur les
//   investissements et autres charges d'exploitation ; 479 total de l'impôt préalable ; 500 montant à payer ;
//   510 solde en faveur de l'assujetti.
// Les montants viennent des écritures de l'élève (méthode au net), sans les écritures du décompte lui-même :
// chaque vente est rattachée à un taux d'après le rapport TVA due ÷ chiffre d'affaires de son écriture ; une vente
// sans TVA due est une prestation exonérée (exportation). Pas de correction de TVA sur les pertes sur créances (cours).
// Vente hors classe 3 (25.11.2026, erreur E8 de l'audit) : une écriture qui crédite la TVA due sans chiffre d'affaires
// de la classe 3 (cession d'une immobilisation, produit d'immeuble soumis par option, produit exceptionnel) compte
// aussi : sa contre-prestation hors taxe = montant TVA comprise porté au débit des liquidités ou des créances (10xx,
// 11xx) moins la TVA due. Le formulaire concorde ainsi avec le compte TVA due.
// Limites connues, non traitées : une vente sans TVA est toujours classée en 220 (exportation), jamais en prestation
// exclue du champ de l'impôt ; un rabais ou un escompte sans correction de la TVA (sur une exportation) n'entre pas
// en 235 ; un prélèvement privé de marchandises avec TVA n'est pas compté.

import type { ChampAttendu } from './champs';
import { ecrituresRetenues } from './correction';
import type { Dossier, Ecriture } from './dossier';
import type { Centimes } from './money';

export const TAUX_FORMULAIRE = [
  { chiffre: '303', taux: 81, libelle: 'Taux normal 8,1 %' },
  { chiffre: '313', taux: 26, libelle: 'Taux réduit 2,6 %' },
  { chiffre: '343', taux: 38, libelle: 'Taux spécial hébergement 3,8 %' },
] as const;

/** Comptes du chiffre d'affaires de la classe 3 qui ne sont pas des diminutions ni des prestations propres. */
function compteCA(d: Dossier, n: string): boolean {
  if (!n.startsWith('3') || ['3209', '3210', '3720', '3805'].includes(n)) return false;
  return d.plan.find((c) => c.numero === n)?.type === 'produit';
}

/** Liquidités et créances (10xx, 11xx) : leur débit est le montant TVA comprise reçu ou à recevoir. */
const liquiditeOuCreance = (n: string) => n.startsWith('10') || n.startsWith('11');

/** Écriture du décompte (virement de l'impôt préalable ou du solde vers la dette envers l'AFC) : ignorée. */
function estDecompte(e: Ecriture): boolean {
  const comptes = e.lignes.flatMap((l) => [l.debit, l.credit]);
  const auDebit = (n: string) => e.lignes.some((l) => l.debit === n);
  return comptes.includes('2205') || (auDebit('2200') && e.lignes.some((l) => l.credit === '1170' || l.credit === '1171'));
}

function tauxProche(tva: Centimes, base: Centimes): number | null {
  if (base <= 0) return null;
  const r = (tva / base) * 1000;
  let meilleur: { taux: number; ecart: number } | null = null;
  for (const t of TAUX_FORMULAIRE) {
    const ecart = Math.abs(r - t.taux);
    if (!meilleur || ecart < meilleur.ecart) meilleur = { taux: t.taux, ecart };
  }
  return meilleur && meilleur.ecart <= 3 ? meilleur.taux : null;
}

export interface FormulaireTva {
  c200: Centimes;
  c220: Centimes;
  c235: Centimes;
  c289: Centimes;
  c299: Centimes;
  /** Par taux : contre-prestation imposable (après diminutions) et impôt. */
  parTaux: { chiffre: string; taux: number; libelle: string; base: Centimes; impot: Centimes }[];
  c399: Centimes;
  c400: Centimes;
  c405: Centimes;
  c479: Centimes;
  /** Montant à payer (500) ou solde en faveur de l'assujetti (510) : un seul des deux est positif. */
  c500: Centimes;
  c510: Centimes;
}

export function formulaireTva(d: Dossier): FormulaireTva {
  const base = new Map<number, Centimes>();
  const impot = new Map<number, Centimes>();
  const ajouter = (m: Map<number, Centimes>, t: number, v: Centimes) => m.set(t, (m.get(t) ?? 0) + v);
  let c200 = 0;
  let c220 = 0;
  let c235 = 0;
  let ip1170 = 0;
  let ip1171 = 0;
  for (const e of ecrituresRetenues(d.ecritures)) {
    if (estDecompte(e)) continue;
    let ca = 0;
    let tvaCredit = 0;
    let diminution = 0;
    let tvaDebit = 0;
    let encaisse = 0;
    for (const l of e.lignes) {
      if (l.credit && compteCA(d, l.credit)) ca += l.montant;
      if (l.credit === '2200') tvaCredit += l.montant;
      if (l.debit && (l.debit === '3209' || compteCA(d, l.debit))) diminution += l.montant;
      if (l.debit === '2200') tvaDebit += l.montant;
      if (l.debit && liquiditeOuCreance(l.debit)) encaisse += l.montant;
      if (l.debit === '1170') ip1170 += l.montant;
      if (l.credit === '1170') ip1170 -= l.montant;
      if (l.debit === '1171') ip1171 += l.montant;
      if (l.credit === '1171') ip1171 -= l.montant;
    }
    // Vente hors classe 3 avec TVA due : contre-prestation hors taxe = montant TVA comprise − TVA.
    if (ca === 0 && tvaCredit > 0 && encaisse - tvaCredit > 0) ca = encaisse - tvaCredit;
    if (ca > 0) {
      c200 += ca;
      const t = tvaCredit > 0 ? tauxProche(tvaCredit, ca) : null;
      if (t === null) c220 += ca;
      else {
        ajouter(base, t, ca);
        ajouter(impot, t, tvaCredit);
      }
    }
    // Diminution de la contre-prestation avec correction de la TVA (escompte, rabais ou retour après facturation).
    if (diminution > 0 && tvaDebit > 0) {
      const t = tauxProche(tvaDebit, diminution);
      if (t !== null) {
        c235 += diminution;
        ajouter(base, t, -diminution);
        ajouter(impot, t, -tvaDebit);
      }
    }
  }
  const parTaux = TAUX_FORMULAIRE.filter((x) => base.has(x.taux)).map((x) => ({ ...x, base: base.get(x.taux) ?? 0, impot: impot.get(x.taux) ?? 0 }));
  const c289 = c220 + c235;
  const c399 = parTaux.reduce((s, x) => s + x.impot, 0);
  const c479 = ip1170 + ip1171;
  return {
    c200, c220, c235, c289, c299: c200 - c289, parTaux, c399, c400: ip1170, c405: ip1171, c479,
    c500: Math.max(0, c399 - c479), c510: Math.max(0, c479 - c399),
  };
}

/** Champs que l'élève remplit, dans l'ordre du formulaire. */
export function champsFormulaireTva(f: FormulaireTva): ChampAttendu[] {
  const c = (cle: string, libelle: string, attendu: Centimes): ChampAttendu => ({ cle, libelle, type: 'chf', attendu });
  return [
    c('200', 'Total des contre-prestations convenues (chiffre d’affaires)', f.c200),
    c('220', 'Prestations exonérées (exportations)', f.c220),
    c('235', 'Diminutions de la contre-prestation (rabais, escomptes)', f.c235),
    c('289', 'Total des déductions (220 + 235)', f.c289),
    c('299', 'Contre-prestation imposable (200 − 289)', f.c299),
    // Impôt par taux : le formulaire officiel le calcule sur les prestations déclarées, la comptabilité additionne des TVA
    // arrondies aux 5 centimes ; les deux montants sont admis (tolérance de 5 centimes, second audit du 26.11.2026).
    ...f.parTaux.flatMap((t) => [c(`${t.chiffre}b`, `${t.libelle} : prestations`, t.base), { ...c(`${t.chiffre}i`, `${t.libelle} : impôt`, t.impot), tolerance: 5 }]),
    c('399', "Total de l'impôt dû", f.c399),
    c('400', 'Impôt préalable sur le coût du matériel et des prestations de services', f.c400),
    c('405', "Impôt préalable sur les investissements et autres charges d'exploitation", f.c405),
    c('479', "Total de l'impôt préalable", f.c479),
    f.c510 > 0 ? c('510', "Solde en faveur de l'assujetti", f.c510) : c('500', "Montant à payer à l'AFC", f.c500),
  ];
}
