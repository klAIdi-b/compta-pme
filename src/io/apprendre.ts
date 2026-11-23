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
    },
  };
  ecrire(r, CLE_APPRENDRE);
  return r;
}

/** Enregistre le résultat d'une question de révision espacée pour une notion. */
export function enregistrerRevision(p: Progression, module: string, reussie: boolean): Progression {
  const a = p[module];
  if (!a?.revision) return p;
  const r: Progression = { ...p, [module]: { ...a, revision: apresRevision(a.revision, reussie, new Date().toISOString().slice(0, 10)) } };
  ecrire(r, CLE_APPRENDRE);
  return r;
}
