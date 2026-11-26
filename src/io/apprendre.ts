// Progression du parcours « Apprendre », gardée dans ce navigateur seulement (aucune donnée en ligne).

import { ESPACE } from './espace';
import { ecrire, lire } from './stockage';
import { apresRevision, premiereRevision, type EtatRevision } from '../engine/revision';

export const CLE_APPRENDRE = `${ESPACE}:apprendre:v1`;

export interface ProgressionModule {
  /** Meilleur score obtenu sur une série (réponses justes). */
  meilleur: number;
  /** Nombre de questions de la série du meilleur score. */
  sur: number;
  maitrise: boolean;
  series: number;
  /** Date ISO de la dernière série terminée. */
  le: string;
  /** Révision espacée : prochaine échéance, dès que la notion est maîtrisée. */
  revision?: EtatRevision;
  /** Révisions réussies à des jours distincts (« confirmée » à partir de deux). */
  confirmations?: number;
  /** Jour (AAAA-MM-JJ) de la dernière révision réussie. */
  derniereConfirmation?: string;
  /** Dernière révision ratée : la notion est « à raviver », sans rien perdre. */
  aRaviver?: boolean;
  /** Score de la dernière série (le progrès se lit sur le dernier score, pas seulement sur le meilleur). */
  dernier?: number;
  dernierSur?: number;
}

export type Progression = Record<string, ProgressionModule>;

export function lireProgression(): Progression {
  return lire<Progression>(CLE_APPRENDRE) ?? {};
}

/** Enregistre une série terminée ; la maîtrise acquise n'est jamais perdue. */
export function enregistrerSerie(p: Progression, module: string, justes: number, sur: number, maitrise: boolean): Progression {
  const a = p[module];
  const meilleur = !a || justes / sur > a.meilleur / a.sur;
  const r: Progression = {
    ...p,
    [module]: {
      meilleur: meilleur ? justes : a!.meilleur,
      sur: meilleur ? sur : a!.sur,
      maitrise: maitrise || !!a?.maitrise,
      series: (a?.series ?? 0) + 1,
      le: new Date().toISOString(),
      revision: a?.revision ?? (maitrise ? premiereRevision(new Date().toISOString().slice(0, 10)) : undefined),
      ...(a?.confirmations ? { confirmations: a.confirmations, derniereConfirmation: a.derniereConfirmation } : {}),
      ...(a?.aRaviver ? { aRaviver: true } : {}),
      dernier: justes,
      dernierSur: sur,
    },
  };
  ecrire(r, CLE_APPRENDRE);
  return r;
}

/** Enregistre le résultat d'une question de révision espacée pour une notion. */
export function enregistrerRevision(p: Progression, module: string, reussie: boolean): Progression {
  const a = p[module];
  if (!a?.revision) return p;
  const jour = new Date().toISOString().slice(0, 10);
  const confirme = reussie && a.derniereConfirmation !== jour;
  const r: Progression = {
    ...p,
    [module]: {
      ...a,
      revision: apresRevision(a.revision, reussie, jour),
      confirmations: (a.confirmations ?? 0) + (confirme ? 1 : 0),
      ...(confirme ? { derniereConfirmation: jour } : {}),
      aRaviver: !reussie,
    },
  };
  ecrire(r, CLE_APPRENDRE);
  return r;
}

/**
 * Reprise de la progression depuis un fichier `.compta-progression.json` (poste partagé, autre ordinateur ; audit du
 * 24.11.2026). Fusion notion par notion, sans rien perdre : une notion réussie le reste, le meilleur score est gardé,
 * la révision la plus avancée l'emporte. Rouvrir deux fois le même fichier ne change rien.
 */
export function fusionnerProgression(ici: Progression, fichier: Progression): Progression {
  const r: Progression = { ...ici };
  for (const [id, b] of Object.entries(fichier)) {
    if (!b || typeof b.meilleur !== 'number' || typeof b.sur !== 'number' || b.sur <= 0) continue;
    const a = r[id];
    if (!a) {
      r[id] = b;
      continue;
    }
    const meilleurB = b.meilleur / b.sur > a.meilleur / a.sur;
    const revisions = [a.revision, b.revision].filter((x): x is EtatRevision => !!x);
    revisions.sort((x, y) => y.rang - x.rang || y.prochaine.localeCompare(x.prochaine));
    r[id] = {
      meilleur: meilleurB ? b.meilleur : a.meilleur,
      sur: meilleurB ? b.sur : a.sur,
      maitrise: a.maitrise || b.maitrise,
      series: Math.max(a.series, b.series),
      le: a.le > b.le ? a.le : b.le,
      revision: revisions[0],
    };
    // Champs ajoutés au second audit (26.11.2026), seulement s'ils existent : l'état le plus récent l'emporte pour
    // « à raviver » et le dernier score ; les confirmations ne se perdent pas.
    const recent = a.le > b.le ? a : b;
    const confirmations = Math.max(a.confirmations ?? 0, b.confirmations ?? 0);
    const derniere = [a.derniereConfirmation, b.derniereConfirmation].filter((x): x is string => !!x).sort().pop();
    const m = r[id]!;
    if (confirmations) m.confirmations = confirmations;
    if (derniere) m.derniereConfirmation = derniere;
    if (recent.aRaviver) m.aRaviver = true;
    if (recent.dernier !== undefined) {
      m.dernier = recent.dernier;
      m.dernierSur = recent.dernierSur;
    }
  }
  return r;
}

export function reprendreProgression(ici: Progression, fichier: Progression): Progression {
  const r = fusionnerProgression(ici, fichier);
  ecrire(r, CLE_APPRENDRE);
  return r;
}
