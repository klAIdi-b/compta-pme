// Progression du parcours « Apprendre », gardée dans ce navigateur seulement (aucune donnée en ligne).

import { ESPACE } from './espace';
import { ecrire, lire } from './stockage';

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
    },
  };
  ecrire(r, CLE_APPRENDRE);
  return r;
}
