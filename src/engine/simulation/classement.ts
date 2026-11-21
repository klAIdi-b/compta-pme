// Tableau des résultats et classement multicritère (affiché par défaut, décision du 20.11.2026).
// Score = somme, pour chaque critère, de poids × points de rang (1er sur n : n points ; ex aequo : même rang).
// Pondération validée le 20.11.2026 : résultat cumulé ×2, trésorerie ×1, part de marché cumulée ×1.

import type { Centimes } from '../money';
import type { Partie } from './types';
import { estMp, etatsCourants, fondsPropresMp } from './tour';

export const PONDERATION = { resultat: 2, tresorerie: 1, partMarche: 1 } as const;

export interface LigneResultats {
  entrepriseId: string;
  nom: string;
  chiffreAffairesCumule: Centimes;
  resultatCumule: Centimes;
  tresorerie: Centimes;
  /** Part des clients servis depuis le début, en dixièmes de pour cent. */
  partMarchePourMille: number;
  stockUnites: number;
  clientsPerdusCumules: number;
  /** MP : rentabilité des fonds propres (résultat / fonds propres d'ouverture), en dixièmes de pour cent. */
  rentabiliteFondsPropresPourMille?: number;
  score: number;
  rang: number;
}

/** Rangs avec ex aequo (valeurs égales : même rang, le suivant saute). */
function rangs(valeurs: readonly number[]): number[] {
  return valeurs.map((v) => 1 + valeurs.filter((w) => w > v).length);
}

export function tableauResultats(p: Partie): LigneResultats[] {
  const etats = etatsCourants(p);
  const totalServis = [...etats.values()].reduce((s, e) => s + e.clientsServisCumules, 0);
  const base = p.entreprises.map((x) => {
    const e = etats.get(x.id)!;
    let ca = 0;
    let perdus = 0;
    for (const t of p.tours) {
      const r = t.resultats.find((y) => y.entrepriseId === x.id);
      ca += r?.chiffreAffaires ?? 0;
      perdus += r?.clientsPerdus ?? 0;
    }
    return {
      entrepriseId: x.id,
      nom: x.nom,
      chiffreAffairesCumule: ca,
      resultatCumule: e.resultatCumule,
      tresorerie: e.caisse + e.banque,
      partMarchePourMille: totalServis > 0 ? Math.round((e.clientsServisCumules * 1000) / totalServis) : 0,
      stockUnites: e.stockUnites,
      clientsPerdusCumules: perdus,
      ...(estMp(p.reglages)
        ? (() => {
            const fp = fondsPropresMp(p.reglages.secteur);
            return { rentabiliteFondsPropresPourMille: Math.round((e.resultatCumule * 1000) / (fp.capital + fp.reporte)) };
          })()
        : {}),
    };
  });
  const n = base.length;
  const points = (vals: number[]) => rangs(vals).map((r) => n - r + 1);
  const pr = points(base.map((b) => b.resultatCumule));
  const pt = points(base.map((b) => b.tresorerie));
  const pm = points(base.map((b) => b.partMarchePourMille));
  const scores = base.map(
    (_, i) => PONDERATION.resultat * pr[i]! + PONDERATION.tresorerie * pt[i]! + PONDERATION.partMarche * pm[i]!,
  );
  const r = rangs(scores);
  return base
    .map((b, i) => ({ ...b, score: scores[i]!, rang: r[i]! }))
    .sort((a, b) => a.rang - b.rang || a.nom.localeCompare(b.nom, 'fr-CH'));
}
