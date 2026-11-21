// Transforme les tours joués par une entreprise en exercice de Compta PME : pièces, corrigé, bilan d'ouverture.
// Un seul exercice par entreprise pour toute la partie (l'année fictive) : chaque tour y ajoute ses opérations,
// numérotées à la suite. La comptabilité automatique consiste à passer ce corrigé : en comptabilité mixte (phase S4),
// les tours non saisis par les élèves deviennent des écritures automatiques (pièces A1-1, A1-2…), déjà au journal.

import type { EcritureCorrigee, Exercice, Operation } from '../exercice';
import type { PieceComptable } from '../pieces';
import { formatMontant } from '../money';
import type { Partie, ReglagesPartie } from './types';
import { estCfc2, estMp, etatsCourants, exerciceComplet, fondsPropresMp, libellePeriode } from './tour';
import { repartir, type DonneesRepartition } from '../repartition';

function texteDePiece(p: PieceComptable): string {
  const titre = p.titre.charAt(0) + p.titre.slice(1).toLocaleLowerCase('fr-CH');
  return `${titre}${p.numero ? ` n° ${p.numero}` : ''} — ${p.emetteur.nom}`;
}

/** Le tour n est-il saisi par les élèves ? (sinon, ses écritures sont passées automatiquement) */
export function tourSaisi(r: Pick<ReglagesPartie, 'comptabilite' | 'toursSaisis'>, n: number): boolean {
  if (r.comptabilite === 'eleves') return true;
  if (r.comptabilite === 'automatique') return false;
  return (r.toursSaisis ?? []).includes(n);
}

export interface OperationsDuTour {
  tour: number;
  /** Saisi par les élèves (opérations de l'énoncé) ou passé automatiquement (pièces A…). */
  saisi: boolean;
  numeros: string[];
}

/** Numéros des pièces de chaque tour pour une entreprise : opérations 1, 2, 3… ou pièces automatiques A2-1, A2-2… */
export function operationsParTour(p: Partie, entrepriseId: string): OperationsDuTour[] {
  let k = 0;
  return p.tours.map((t) => {
    const r = t.resultats.find((x) => x.entrepriseId === entrepriseId);
    const saisi = tourSaisi(p.reglages, t.numero);
    const numeros = (r?.elements ?? []).map((_, i) => (saisi ? String(++k) : `A${t.numero}-${i + 1}`));
    return { tour: t.numero, saisi, numeros };
  });
}

export function exerciceEntreprise(p: Partie, entrepriseId: string): Exercice {
  const x = p.entreprises.find((e) => e.id === entrepriseId);
  if (!x) throw new Error(`Entreprise inconnue : ${entrepriseId}`);
  const r = p.reglages;
  const s = r.secteur;
  const operations: Operation[] = [];
  const corrige: EcritureCorrigee[] = [];
  const automatiques: NonNullable<Exercice['ecrituresAutomatiques']> = [];
  const numeros = operationsParTour(p, entrepriseId);
  for (const [i, t] of p.tours.entries()) {
    const res = t.resultats.find((y) => y.entrepriseId === entrepriseId);
    const { saisi, numeros: nums } = numeros[i]!;
    for (const [k, e] of (res?.elements ?? []).entries()) {
      const numero = nums[k]!;
      if (saisi) {
        operations.push({ numero, date: e.date, texte: texteDePiece(e.piece), piece: e.piece });
        corrige.push({ piece: numero, lignes: e.lignes });
      } else {
        automatiques.push({ date: e.date, piece: numero, libelle: texteDePiece(e.piece), lignes: e.lignes });
      }
    }
  }
  const stock = s.ouverture.stockUnites * s.prixAchatReference;
  const actif = { '1000': s.ouverture.caisse, '1020': s.ouverture.banque, '1200': stock, '1510': s.ouverture.mobilier };
  const capital = Object.values(actif).reduce((a, b) => a + b, 0);
  const joues = p.tours.length;
  const termine = joues === r.nbTours;
  const cfc2 = estCfc2(r);
  const cloture = termine && r.cloture && exerciceComplet(r);
  const saisie = r.comptabilite !== 'automatique';
  const mp = estMp(r);
  const fp = fondsPropresMp(s);
  const repartition = mp && cloture && saisie ? donneesRepartition(p, entrepriseId) : null;
  const periode =
    joues === 0 ? '' : joues === 1 ? libellePeriode(r, 1) : `${libellePeriode(r, 1)} à ${libellePeriode(r, joues)}`;
  return {
    id: `simulation-${entrepriseId}`,
    titre: `${x.nom} — simulation, ${periode || 'aucun tour joué'}`,
    niveau: mp ? 'MP' : cfc2 ? 'CFC2' : 'CFC1',
    filiere: mp ? 'MP' : 'CFC',
    difficulte: mp ? 6 : cfc2 ? 4 : 1,
    sujets: [
      'Simulation',
      'Achats et ventes de marchandises',
      'Banque et caisse',
      ...(cfc2 ? ['TVA (méthode effective, au net)', 'Salaires et charges sociales'] : []),
      ...(mp ? ['Société anonyme', 'Emprunt et intérêts'] : []),
      ...(cloture ? ['Inventaire', ...(cfc2 ? ['Amortissements'] : []), 'Bouclement', ...(repartition ? ['Répartition du bénéfice'] : [])] : []),
    ],
    raisonSociale: x.nom,
    formeJuridique: mp ? 'SA' : 'raison individuelle',
    debut: `${r.annee}-01-01`,
    fin: `${r.annee}-12-31`,
    introduction:
      (cfc2
        ? "L'entreprise est assujettie à la TVA (méthode effective, au net) : séparez la TVA à chaque pièce. Les prix de " +
          'vente sont TVA comprise. Le décompte TVA est établi à la fin de chaque trimestre ; la TVA et les cotisations ' +
          'sociales sont payées au début du trimestre suivant. Comptabilisez les pièces de chaque tour au journal'
        : "L'entreprise n'est pas assujettie à la TVA. Comptabilisez les pièces de chaque tour au journal") +
      (cloture && saisie ? ', puis passez les écritures de bouclement au 31.12.' : '.') +
      (mp
        ? " L'entreprise est une société anonyme : l'emprunt bancaire est en 2400, ses intérêts sont payés à la fin de chaque trimestre." +
          (repartition ? " Pour finir, établissez la répartition du bénéfice proposée à l'assemblée générale (fiche « Répartition du bénéfice »)." : '')
        : '') +
      (automatiques.length && operations.length
        ? ' Les pièces des autres tours ont déjà été comptabilisées par le logiciel (mention « automatique » dans le journal).'
        : ''),
    situation:
      `Votre groupe dirige ${x.nom}, un commerce genevois de ${s.produits} (secteur « ${s.nom} »). ` +
      `Au départ, le magasin dispose de ${s.ouverture.stockUnites} ${s.produits} en stock, de ${formatMontant(s.ouverture.banque)} ` +
      `en banque et de son mobilier. D'autres entreprises vendent les mêmes produits sur le même marché.\n\n` +
      'À chaque tour, vous fixez votre prix de vente, la quantité à commander et votre budget de publicité' +
      (cfc2 ? ", ainsi que le nombre d'employés ; vous pouvez acheter un véhicule de livraison. " : '. ') +
      'Les pièces de ce dossier sont la conséquence de vos décisions : factures, avis de la banque, rapports de caisse.',
    operations,
    ouvertureActif: actif,
    ouverturePassif: mp ? { '2800': fp.capital, ...(fp.reporte ? { '2970': fp.reporte } : {}) } : { '2800': capital },
    mode: r.modeSaisie ?? 'entrainement',
    parametres: {
      libellesT: 'SI/SF',
      modificationDirecte: false,
      modeBouclement: 'compteDeResultat',
      comptesAjoutes: [],
      comptesMasques: [],
      corrigerBouclement: cloture && saisie,
      ...(cfc2 ? { tvaMethode: 'net' as const } : {}),
      ...(repartition ? { repartition } : {}),
    },
    corrige,
    ...(automatiques.length ? { ecrituresAutomatiques: automatiques } : {}),
  };
}

/**
 * MP : données de la fiche « Répartition du bénéfice » (art. 672 CO), d'après le bénéfice de l'année et le dividende
 * proposé par le groupe au dernier tour. Si le bénéfice disponible ne suffit pas, le dividende est ramené au taux
 * entier le plus élevé possible. Aucune fiche en cas de perte.
 */
export function donneesRepartition(p: Partie, entrepriseId: string): DonneesRepartition | null {
  const fin = etatsCourants(p).get(entrepriseId);
  const dernier = p.tours.at(-1)?.resultats.find((x) => x.entrepriseId === entrepriseId);
  if (!fin || !dernier || fin.resultatCumule <= 0) return null;
  const fp = fondsPropresMp(p.reglages.secteur);
  const base: DonneesRepartition = {
    benefice: fin.resultatCumule,
    reporte: fp.reporte,
    capital: fp.capital,
    reserveLegaleCapital: 0,
    reserveLegaleBenefice: 0,
    holding: false,
    tauxDividende: 0,
    tantiemes: 0,
    reservesLibres: 0,
  };
  for (let pc = dernier.decisions.dividendePourcent ?? 0; pc > 0; pc--) {
    if (repartir({ ...base, tauxDividende: pc * 100 }).ok) return { ...base, tauxDividende: pc * 100 };
  }
  return base;
}
