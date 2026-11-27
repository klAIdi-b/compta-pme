// Années comptables (phase V5, maquette public/maquettes/annees-comptables.html, validée le 27.11.2026).
// Clôture guidée : contrôles calculés d'après le dossier de l'élève, sans aucune règle nouvelle (les rappels de clôture
// par année ne seront ajoutés que d'après une liste fournie par l'enseignant). Report : le bilan de clôture d'un exercice
// et le bilan d'ouverture du suivant, compte par compte. Copie : l'exercice de l'énoncé est toujours celui qui est rendu.

import type { Centimes } from './money';
import type { Dossier } from './dossier';
import type { Avancement } from './correction';
import type { Exercice } from './exercice';
import { balance, soldes } from './ledger';
import { estBoucle } from './closing';
import { piecesHorsEnonce } from './correction-bouclement';

export type CleControle = 'operations' | 'aRevoir' | 'horsEnonce' | 'balance' | 'bouclement' | 'copie';

export interface ControleCloture {
  cle: CleControle;
  ok: boolean;
  /** Ce qui est constaté, en clair. */
  texte: string;
}

/**
 * Contrôles avant la clôture. `av` : avancement sur les opérations de l'énoncé (null sans énoncé) ; `avecCorrection` :
 * les statuts juste / à revoir sont connus (entraînement) ; `copieAJour` : la copie a été exportée depuis la dernière
 * écriture (null si sans objet, par exemple pour un aperçu).
 */
export function controlesCloture(
  ex: Exercice,
  d: Dossier,
  av: Avancement | null,
  avecCorrection: boolean,
  copieAJour: boolean | null,
): ControleCloture[] {
  const c: ControleCloture[] = [];
  const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;
  if (av && av.total > 0) {
    c.push({ cle: 'operations', ok: av.nonSaisies === 0, texte: `${av.saisies} sur ${av.total} saisies` });
    if (avecCorrection) {
      const n = av.aRevoir + av.incompletes;
      c.push({ cle: 'aRevoir', ok: n === 0, texte: n === 0 ? 'aucune' : `${pluriel(n, 'écriture')} à revoir` });
    }
    const hors = piecesHorsEnonce(d, ex);
    c.push({ cle: 'horsEnonce', ok: hors.length === 0, texte: hors.length === 0 ? 'aucune' : `pièce${hors.length > 1 ? 's' : ''} ${hors.join(', ')}` });
  }
  const b = balance(d);
  c.push({ cle: 'balance', ok: b.equilibree, texte: b.equilibree ? 'total du débit = total du crédit' : 'total du débit différent du total du crédit' });
  if (ex.parametres.modeBouclement === 'compteDeResultat') {
    const fait = d.ecritures.length > 0 && estBoucle(d);
    c.push({ cle: 'bouclement', ok: fait, texte: fait ? 'écritures de bouclement passées' : 'écritures de bouclement à passer' });
  }
  if (copieAJour !== null) c.push({ cle: 'copie', ok: copieAJour, texte: copieAJour ? 'exportée et à jour' : "pas exportée depuis la dernière écriture : exportez-la avant d'ouvrir l'année suivante" });
  return c;
}

/** Peut-on clôturer : en mode compte de résultat, le bouclement doit être passé (règle du moteur `reouvrir`). */
export function peutCloturer(ex: Exercice, d: Dossier): boolean {
  return ex.parametres.modeBouclement !== 'compteDeResultat' || (d.ecritures.length > 0 && estBoucle(d));
}

export interface LigneReport {
  compte: string;
  /** Solde final de l'exercice clôturé (positif = débiteur). */
  cloture: Centimes;
  /** Solde initial de l'exercice suivant (positif = débiteur). */
  ouverture: Centimes;
}

/**
 * Report du bilan de clôture au bilan d'ouverture, pour les comptes de bilan. En mode « à la réouverture », le capital
 * reçoit le résultat et le compte privé : sa ligne diffère, les autres sont égales.
 */
export function reportOuverture(cloture: Dossier, suivant: Pick<Dossier, 'ouverture'>): LigneReport[] {
  const types = new Map(cloture.plan.map((c) => [c.numero, c.type]));
  const comptes = new Set<string>([...Object.keys(suivant.ouverture)]);
  for (const [n, x] of soldes(cloture)) if (x.solde !== 0 && (types.get(n) === 'actif' || types.get(n) === 'passif')) comptes.add(n);
  const s = soldes(cloture);
  return [...comptes]
    .sort()
    .map((compte) => ({ compte, cloture: s.get(compte)?.solde ?? 0, ouverture: suivant.ouverture[compte] ?? 0 }));
}

/**
 * Dossier à rendre dans la copie : celui de l'exercice de l'énoncé (même après l'ouverture de l'année suivante), et les
 * années suivantes, pour information.
 */
export function dossierDeLEnonce(ex: Pick<Exercice, 'debut'>, actuel: Dossier, archives: readonly Dossier[]): { dossier: Dossier; suivants: Dossier[] } {
  const tous = [...archives, actuel];
  const enonce = tous.find((d) => d.debut === ex.debut) ?? actuel;
  return { dossier: enonce, suivants: tous.filter((d) => d !== enonce && d.debut > enonce.debut) };
}
