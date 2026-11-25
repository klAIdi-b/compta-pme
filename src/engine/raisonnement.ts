// Raisonnement pas à pas d'une écriture, selon la méthode du chapitre « Les comptes » : quels comptes, de quel type,
// augmente ou diminue, donc débit ou crédit. Utilisé par l'exemple travaillé d'Apprendre et, depuis le 25.11.2026
// (audit, statut « Juste avec la solution »), sous la solution affichée dans le journal.
// Fichier léger, sans dépendance : le journal l'importe sans charger les générateurs d'Apprendre.

import type { LigneEcriture } from './dossier';
import type { Compte, TypeCompte } from './plan';

export const NOM_TYPE: Record<TypeCompte, string> = {
  actif: "compte d'actif",
  passif: 'compte de passif',
  charge: 'compte de charge',
  produit: 'compte de produit',
  bouclement: 'compte de bouclement',
};

/** Augmentation ou diminution d'un compte inscrit au débit ou au crédit (règle du chapitre « Les comptes »). */
export function sensVariation(type: TypeCompte, cote: 'debit' | 'credit'): 'augmente' | 'diminue' {
  const augmenteAuDebit = type === 'actif' || type === 'charge';
  return (cote === 'debit') === augmenteAuDebit ? 'augmente' : 'diminue';
}

/** Une étape du raisonnement : le compte, son type, son sens de variation, donc son côté. */
export function etapeRaisonnement(nom: string, type: TypeCompte, cote: 'debit' | 'credit'): string {
  const v = sensVariation(type, cote);
  const ici = cote === 'debit' ? 'au débit' : 'au crédit';
  const regle =
    v === 'augmente'
      ? type === 'actif' || type === 'charge' ? 'un tel compte augmente au débit' : 'un tel compte augmente au crédit'
      : type === 'actif' || type === 'charge' ? 'un tel compte diminue au crédit' : 'un tel compte diminue au débit';
  return `${nom} : ${NOM_TYPE[type]}, il ${v} ; ${regle} → ${ici}.`;
}

/**
 * Comptes pour lesquels la règle générale « actif et charge augmentent au débit » se lit mal : comptes correctifs
 * (fonds d'amortissements cumulés et ducroire, 1xx9), déductions accordées et obtenues (3209, 4209), pertes sur
 * créances (3805), variation de stocks (4280), bénéfice reporté (2970). Le cours les décrit à part ; on ne leur
 * applique pas le raisonnement automatique, pour ne rien affirmer de trompeur.
 */
export function compteHorsRaisonnement(numero: string): boolean {
  return /^1\d\d9$/.test(numero) || ['3209', '4209', '3805', '4280', '2970'].includes(numero);
}

/**
 * Raisonnement d'une écriture simple ou composée, d'après le solde de chaque compte dans l'écriture.
 * Rend null si un compte n'entre pas dans la règle générale (voir `compteHorsRaisonnement`) ou n'est pas un compte
 * de bilan ou de gestion (compte de résultat 9000) : la solution s'affiche alors sans raisonnement.
 */
export function raisonnementEcriture(plan: readonly Compte[], lignes: readonly LigneEcriture[]): string[] | null {
  const net = new Map<string, number>();
  for (const l of lignes) {
    if (l.debit) net.set(l.debit, (net.get(l.debit) ?? 0) + l.montant);
    if (l.credit) net.set(l.credit, (net.get(l.credit) ?? 0) - l.montant);
  }
  const debits: Compte[] = [];
  const credits: Compte[] = [];
  for (const [numero, solde] of net) {
    if (solde === 0) continue;
    const c = plan.find((x) => x.numero === numero);
    if (!c || c.type === 'bouclement' || compteHorsRaisonnement(numero)) return null;
    (solde > 0 ? debits : credits).push(c);
  }
  const comptes = [...debits, ...credits];
  if (comptes.length < 2) return null;
  const noms = comptes.map((c) => c.intitule);
  const liste = `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
  return [
    `Comptes touchés : ${liste}.`,
    ...debits.map((c) => etapeRaisonnement(c.intitule, c.type, 'debit')),
    ...credits.map((c) => etapeRaisonnement(c.intitule, c.type, 'credit')),
  ];
}
