// Fiches à imprimer pour les groupes (22.11.2026) : « Règles du jeu » d'une partie et fiche de décisions d'un tour.
// Elles ne font que reprendre les règles et les données validées (cahier des charges § 4, 5, 13 à 16) : aucune règle
// nouvelle. Moteur pur : textes et chiffres, la mise en page est dans src/ui/vues/simulation/impression.ts.
import { formatMontant, type Centimes } from '../money';
import { PONDERATION } from './classement';
import {
  capacite,
  demandeDeBase,
  estCfc2,
  estMp,
  etatsCourants,
  exerciceComplet,
  fondsPropresMp,
  libellePeriode,
  moisDuTour,
  prixAchat,
  prixVehiculeTtc,
} from './tour';
import { PARAMETRES_CFC2, PARAMETRES_MP, type ImprevusEntreprise, type Partie, type ReglagesPartie } from './types';

export interface BlocRegles {
  titre: string;
  items: string[];
}

export const NOMS_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const chf = (c: Centimes) => `${formatMontant(c)} CHF`;
const pourcent = (dixiemes: number) => `${(dixiemes / 10).toFixed(1).replace('.', ',').replace(',0', '')} %`;
const nombre = (n: number) => n.toLocaleString('fr-CH').replace(/\s/g, "'");

/** Règles du jeu d'une partie, selon son niveau, son secteur, la durée des tours et l'affichage des résultats. */
export function reglesDuJeu(r: ReglagesPartie): BlocRegles[] {
  const s = r.secteur;
  const afp = r.niveau === 'AFP';
  const cfc2 = estCfc2(r);
  const mp = estMp(r);
  const tour = r.dureeTour === 'mois' ? 'un mois' : 'un trimestre';
  const blocs: BlocRegles[] = [];

  blocs.push({
    titre: 'Le jeu',
    items: [
      `Chaque groupe dirige ${mp ? 'une société anonyme' : 'un commerce'} du secteur « ${s.nom} » qui vend des ${s.produits}. ` +
        'Tous les groupes vendent au même endroit, aux mêmes clients : ils sont en concurrence.',
      `La partie dure ${r.nbTours} tours ; un tour représente ${tour} de l'année ${r.annee}. À chaque tour, le groupe prend ` +
        'ses décisions, puis l’enseignant·e calcule les ventes de tous les groupes en même temps.',
      'Les mêmes décisions donnent toujours les mêmes résultats : il n’y a pas de hasard, sauf les imprévus annoncés par l’enseignant·e.',
    ],
  });

  const decisions = [
    `Le prix de vente d'un ${s.produit}${cfc2 ? ', TVA comprise' : ''} (prix de référence du marché : ${chf(s.prixVenteReference)}).`,
    `Le nombre de ${s.produits} à commander : ils sont livrés au début du tour, avant les ventes.`,
    'Le budget de publicité.',
  ];
  if (!afp) {
    const g = s.fournisseurs.grossiste;
    const i = s.fournisseurs.importateur;
    decisions.push(
      `Le fournisseur : ${g.nom}, payé au début du tour suivant, ou ${i.nom}, ${Math.abs(i.ecartPrixPourcent)} % moins cher mais payé à la commande.`,
    );
  }
  if (!afp && !mp) decisions.push('Le prélèvement privé du propriétaire (argent viré sur son compte personnel).');
  if (cfc2) {
    decisions.push(
      `Le nombre d'employés, de 0 à ${PARAMETRES_CFC2.employesMax}, sans compter le propriétaire (${PARAMETRES_CFC2.employesDepart} au départ).`,
      'L’achat d’un véhicule de livraison (une seule fois).',
    );
  }
  if (mp) {
    decisions.push(
      `Un nouvel emprunt bancaire (au plus ${chf(PARAMETRES_MP.empruntMax)} au total).`,
      ...(r.cloture && exerciceComplet(r) ? ['Au dernier tour seulement : le dividende proposé à l’assemblée générale, en % du capital-actions.'] : []),
    );
  }
  blocs.push({ titre: 'Vos décisions à chaque tour', items: decisions });

  const saisons = s.saison.map((v, k) => `${NOMS_MOIS[k]} ${v} %`).join(', ');
  const ventes = [
    `Clients du marché : environ ${nombre(demandeDeBase(r))} par entreprise et par mois au prix de référence, selon la saison ` +
      `(100 % = mois moyen) : ${saisons}.`,
    'Le prix : plus votre prix est bas par rapport au prix moyen de tous les groupes, plus vous attirez de clients ; plus il est ' +
      'haut, moins vous en attirez. Si tous les groupes vendent plus cher que le prix de référence, le marché entier achète moins.',
    `La publicité attire des clients en plus, jusqu’à +${Math.round(r.marche.effetMaxPublicite * 100)} % au maximum. Les premiers francs ` +
      `rapportent le plus : avec ${chf(s.publiciteReferenceMensuelle)} par mois, vous obtenez déjà la moitié de cet effet maximal.`,
    'Chaque groupe reçoit une part des clients du tour, d’après son prix et sa publicité comparés à ceux des autres.',
    cfc2
      ? `Vous ne vendez pas plus que votre stock, ni plus de clients que votre personnel ne peut en servir : ${s.capaciteParPersonneMensuelle} ` +
        `clients par personne et par mois (propriétaire compris), +${PARAMETRES_CFC2.capaciteVehiculePourcent} % avec le véhicule. ` +
        'Les clients en trop repartent sans acheter.'
      : 'Vous ne vendez pas plus que votre stock : les clients en trop repartent sans acheter.',
    `Environ ${s.partVentesACreditPourcent} % des ventes sont faites sur facture à des clients professionnels, qui paient au tour suivant ; ` +
      'les autres sont payées comptant.',
  ];
  blocs.push({ titre: 'Comment se font les ventes', items: ventes });

  const argent = [
    `Au départ, chaque entreprise a ${chf(s.ouverture.banque)} en banque, ${chf(s.ouverture.caisse)} en caisse et ` +
      `${nombre(s.ouverture.stockUnites)} ${s.produits} en stock.`,
    `Loyer : ${chf(s.loyerMensuel)} par mois.`,
    afp
      ? `Le fournisseur (${s.fournisseurs.grossiste.nom}) est payé au début du tour suivant.`
      : `Prix d'achat de référence : ${chf(s.prixAchatReference)}${cfc2 ? ' hors TVA' : ''} l'unité chez ${s.fournisseurs.grossiste.nom}.`,
    'Une décision est refusée si les paiements du tour (fournisseur à payer, commande payée tout de suite, loyer, publicité' +
      `${!afp && !mp ? ', prélèvement privé' : ''}${cfc2 ? ', salaires, véhicule, TVA et cotisations dues' : ''}${mp ? ', intérêts' : ''}) ` +
      `dépassent l’argent en banque plus les factures clients à encaisser${mp ? ' (plus le nouvel emprunt du tour)' : ''}. ` +
      'Les ventes du tour ne comptent pas : elles ne sont pas encore faites.',
  ];
  if (s.baissePrixAchatMensuellePourcent) {
    argent.push(`Le prix d'achat baisse de ${s.baissePrixAchatMensuellePourcent} % par mois.`);
  }
  if (cfc2) {
    argent.push(
      `TVA : vos prix de vente sont TVA comprise (${pourcent(s.tauxTva)}). La TVA est décomptée à la fin de chaque trimestre et payée ` +
        'au début du trimestre suivant, comme les cotisations sociales.',
      `Salaire d'un employé : ${chf(s.salaireBrutMensuel)} brut par mois, plus les charges sociales de l’employeur.`,
      `Véhicule de livraison : ${chf(prixVehiculeTtc(s))} TVA comprise, payé à la livraison ; il est amorti à la fin de l'année.`,
      'Si les paiements obligatoires (fournisseur, loyer, salaires, TVA et cotisations dues) dépassent à eux seuls l’argent disponible, ' +
        'le tour est joué sans aucune autre dépense et la banque devient négative.',
    );
  }
  if (mp) {
    const fp = fondsPropresMp(s);
    argent.push(
      `Capital-actions : ${chf(fp.capital)}. Il n’y a pas de prélèvement privé dans une société anonyme.`,
      `Emprunt bancaire : versé au début du tour, intérêts de ${PARAMETRES_MP.tauxInteretAnnuelPourcent} % par an payés à la fin de chaque ` +
        'trimestre, pas de remboursement pendant l’année.',
      'Dividende : s’il est trop élevé pour le bénéfice disponible, il est ramené au taux entier le plus élevé possible.',
    );
  }
  blocs.push({ titre: 'Argent et paiements', items: argent });

  const resultats = [
    'Après chaque tour, les résultats de tous les groupes sont projetés : chiffre d’affaires, résultat du tour, trésorerie, part de marché ' +
      `et stock${mp ? ', ainsi que la rentabilité des fonds propres' : ''}. Chaque groupe apprend aussi combien de clients sont repartis sans acheter.`,
  ];
  if (r.affichage === 'classement') {
    resultats.push(
      `Classement : pour chaque critère, le 1er gagne autant de points qu’il y a de groupes, le 2e un de moins, etc. Le résultat depuis le ` +
        `début compte ×${PONDERATION.resultat}, la trésorerie ×${PONDERATION.tresorerie} et la part de marché depuis le début ` +
        `×${PONDERATION.partMarche}. Vendre à perte pour prendre des clients ne suffit donc pas pour gagner.`,
    );
  } else if (r.affichage === 'sansRang') {
    resultats.push('Les résultats sont affichés sans classement.');
  } else {
    resultats.push('Chaque groupe ne voit que ses propres résultats.');
  }
  resultats.push(
    afp
      ? 'Après chaque tour, votre groupe reçoit une fiche de calcul : chiffre d’affaires, coût des marchandises vendues, marge brute, charges et bénéfice.'
      : r.comptabilite === 'automatique'
        ? 'La comptabilité est tenue automatiquement : vous pouvez la consulter dans Compta PME.'
        : 'Après les tours à saisir, votre groupe reçoit les pièces comptables du tour (factures, avis de la banque…) et passe les écritures au journal de Compta PME.',
  );
  blocs.push({ titre: 'Résultats', items: resultats });
  return blocs;
}

export interface LigneSituation {
  libelle: string;
  valeur: string;
}

export interface FicheDecisions {
  entreprise: string;
  /** « Tour 3 sur 12 · mars 2026 » */
  tour: string;
  situation: LigneSituation[];
  /** Résumé du tour précédent, s'il y en a un. */
  precedent: string | null;
  rappels: string[];
  /** Décisions à remplir : libellé et aide (contraintes). */
  decisions: { libelle: string; aide: string }[];
}

/**
 * Fiche de décisions d'un groupe pour le prochain tour de la partie (après le dernier tour joué). Les imprévus du tour,
 * s'il y en a, sont passés par l'interface (texte et effet sur l'entreprise).
 */
export function ficheDecisions(p: Partie, entrepriseId: string, imp: ImprevusEntreprise): FicheDecisions | null {
  const r = p.reglages;
  const s = r.secteur;
  const n = p.tours.length + 1;
  if (n > r.nbTours) return null;
  const x = p.entreprises.find((e) => e.id === entrepriseId);
  const etat = etatsCourants(p).get(entrepriseId);
  if (!x || !etat) return null;
  const afp = r.niveau === 'AFP';
  const cfc2 = estCfc2(r);
  const mp = estMp(r);
  const mois = moisDuTour(r, n);
  const saison = Math.round(mois.reduce((t, m) => t + s.saison[m - 1]!, 0) / mois.length);
  const dernierTour = n === r.nbTours && r.cloture && exerciceComplet(r);

  const situation: LigneSituation[] = [
    { libelle: 'Avoir en banque', valeur: chf(etat.banque) },
    { libelle: 'Caisse', valeur: chf(etat.caisse) },
    { libelle: 'Factures clients à encaisser', valeur: chf(etat.creancesClients) },
    { libelle: 'Facture du fournisseur à payer', valeur: chf(etat.dettesFournisseurs) },
    { libelle: 'Stock', valeur: `${nombre(etat.stockUnites)} ${etat.stockUnites > 1 ? s.produits : s.produit}` },
  ];
  if (cfc2) {
    situation.push({ libelle: 'Employés', valeur: String(etat.employes) }, { libelle: 'Véhicule de livraison', valeur: etat.vehicule ? 'oui' : 'non' });
    const dus = etat.aPayer.avs + etat.aPayer.lpp + etat.aPayer.alfa + etat.aPayer.tva;
    if ((mois[0]! - 1) % 3 === 0 && dus !== 0) situation.push({ libelle: 'TVA et cotisations à payer', valeur: chf(dus) });
  }
  if (mp) situation.push({ libelle: 'Emprunt bancaire', valeur: chf(etat.emprunt) });
  situation.push({ libelle: 'Résultat depuis le début', valeur: chf(etat.resultatCumule) });

  const prec = p.tours.at(-1);
  const res = prec?.resultats.find((y) => y.entrepriseId === entrepriseId);
  const precedent =
    prec && res
      ? `Tour précédent (${libellePeriode(r, prec.numero)}) : ${nombre(res.vendues)} ${res.vendues > 1 ? s.produits : s.produit} vendus sur ` +
        `${nombre(res.demande)} clients attirés${res.clientsPerdus > 0 ? `, ${nombre(res.clientsPerdus)} repartis sans acheter` : ''} ; ` +
        `prix moyen du marché ${chf(prec.prixMoyen)} ; résultat ${chf(res.resultat)}.`
      : null;

  const rappels = [
    `Saison : ${saison} % d'un mois moyen. Loyer du tour : ${chf(s.loyerMensuel * mois.length)}.`,
    afp
      ? `Fournisseur : ${s.fournisseurs.grossiste.nom}, ${chf(prixAchat(s, 'grossiste', mois[0]!, imp.hausseAchatPourcent))} l'unité, payé au tour suivant.`
      : `Prix d'achat${cfc2 ? ' HT' : ''} : ${s.fournisseurs.grossiste.nom} ${chf(prixAchat(s, 'grossiste', mois[0]!, imp.hausseAchatPourcent))} ` +
        `(payé au tour suivant) ; ${s.fournisseurs.importateur.nom} ${chf(prixAchat(s, 'importateur', mois[0]!, imp.hausseAchatPourcent))} (payé à la commande).`,
    `Les paiements du tour ne doivent pas dépasser l’avoir en banque plus les factures clients à encaisser${mp ? ' (plus le nouvel emprunt)' : ''}.`,
  ];
  if (cfc2) {
    rappels.push(
      `Capacité : ${s.capaciteParPersonneMensuelle} clients par personne et par mois (propriétaire compris), +${PARAMETRES_CFC2.capaciteVehiculePourcent} % ` +
        `avec le véhicule. Avec les employés actuels : ${nombre(capacite(r, etat.employes, !!etat.vehicule, mois.length))} clients pour ce tour.`,
    );
  }

  const decisions: { libelle: string; aide: string }[] = [
    { libelle: `Prix de vente d'un ${s.produit} (CHF${cfc2 ? ', TVA comprise' : ''})`, aide: `Prix de référence : ${chf(s.prixVenteReference)}` },
    { libelle: `Nombre de ${s.produits} à commander`, aide: 'Livrés au début du tour, avant les ventes' },
  ];
  if (!afp) decisions.push({ libelle: 'Fournisseur', aide: `☐ ${s.fournisseurs.grossiste.nom}      ☐ ${s.fournisseurs.importateur.nom}` });
  if (cfc2) {
    decisions.push({ libelle: 'Nombre d’employés (sans le propriétaire)', aide: `De 0 à ${PARAMETRES_CFC2.employesMax}` });
    if (!etat.vehicule) decisions.push({ libelle: 'Acheter le véhicule de livraison', aide: `☐ oui   ☐ non (${chf(prixVehiculeTtc(s))} TVA comprise)` });
  }
  decisions.push({ libelle: 'Budget de publicité (CHF)', aide: `Référence : ${chf(s.publiciteReferenceMensuelle)} par mois` });
  if (mp) {
    decisions.push({ libelle: 'Nouvel emprunt bancaire (CHF)', aide: `Au plus ${chf(PARAMETRES_MP.empruntMax - etat.emprunt)} encore` });
    if (dernierTour) {
      decisions.push({ libelle: 'Dividende proposé (% du capital-actions)', aide: `Capital-actions ${chf(fondsPropresMp(s).capital)} ; au plus ${PARAMETRES_MP.dividendeMaxPourcent} %` });
    }
  }
  if (!afp && !mp) decisions.push({ libelle: 'Prélèvement privé du propriétaire (CHF)', aide: 'Viré sur son compte personnel' });

  return {
    entreprise: x.nom,
    tour: `Tour ${n} sur ${r.nbTours} · ${libellePeriode(r, n)}`,
    situation,
    precedent,
    rappels,
    decisions,
  };
}
