import { describe, expect, it } from 'vitest';
import { exercicesManuel, manuelFavre, manuelVinotheque } from '../src/data/exercices-manuel';
import { boucler } from '../src/engine/closing';
import type { Dossier } from '../src/engine/dossier';
import { controlerExercice, creerDossier, type Exercice } from '../src/engine/exercice';
import { bilanOuverture, echelle, margeBrute } from '../src/engine/fiches-cfc';
import { ajouterEcriture } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { bilan, compteDeResultat } from '../src/engine/statements';
import { chf, plan } from './fixtures';

function dossierCorrige(ex: Exercice): Dossier {
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const op = ex.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: op.texte.slice(0, 60), lignes: c.lignes });
    if (!r.ok) throw new Error(`${ex.id}, pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
    d = r.valeur;
  });
  return d;
}

/** Résultat attendu (calculé à la main) et soldes de contrôle. */
const attendus: Record<string, { resultat: number; soldes: Record<string, number> }> = {
  'manuel-cfc1-favre-evenements': {
    resultat: 0,
    soldes: { '1020': 3290, '1010': 7265, '1000': 750, '1100': 0, '1510': 58200, '1530': 57500, '2010': -19305 },
  },
  'manuel-cfc1-vinotheque-des-paquis': {
    resultat: 8553,
    soldes: { '1020': 38863, '1000': 6100, '1100': 5550, '2000': -16340, '1200': 25500 },
  },
  // Ventes 64'600.00 − achats nets 33'700.00 − autres charges 800.00 ; comptes de TVA soldés par le décompte.
  'manuel-cfc2-maison-lacroix-tva': {
    resultat: 30100,
    soldes: {
      '1000': 22727.8, '1010': 13157.2, '1020': 16714, '1100': 14800, '2000': -15729,
      '1170': 0, '1171': 0, '2200': 0, '2205': 0, '2850': 12430,
    },
  },
};

describe('exercices tirés des chapitres 1, 12 et 14 du manuel', () => {
  for (const ex of exercicesManuel) {
    describe(ex.titre, () => {
      it("passe le contrôle de l'exercice sans erreur ni avertissement", () => {
        expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
        expect(ex.situation).toContain(ex.raisonSociale);
      });

      it('a un corrigé complet, équilibré pièce par pièce', () => {
        expect(ex.corrige!.map((c) => c.piece)).toEqual(ex.operations.map((o) => o.numero));
        for (const c of ex.corrige!) {
          const debit = c.lignes.filter((l) => l.debit).reduce((t, l) => t + l.montant, 0);
          const credit = c.lignes.filter((l) => l.credit).reduce((t, l) => t + l.montant, 0);
          expect(debit, `pièce ${c.piece}`).toBe(credit);
          for (const l of c.lignes) expect(Number.isInteger(l.montant / 5), `pièce ${c.piece} : arrondi 5 cts`).toBe(true);
        }
      });

      it('le corrigé donne le résultat et les soldes attendus, puis se boucle', () => {
        const d = dossierCorrige(ex);
        const a = attendus[ex.id]!;
        expect(balance(d).equilibree).toBe(true);
        expect(bilan(d).equilibre).toBe(true);
        expect(compteDeResultat(d).resultat).toBe(chf(a.resultat));
        for (const [n, v] of Object.entries(a.soldes)) expect(soldeDe(d, n), `solde ${n}`).toBe(chf(v));
        const b = boucler(d);
        if (!b.ok) throw new Error(b.erreurs.join());
      });
    });
  }

  it("Favre Événements : la fiche « Bilan d'ouverture » donne une fortune nette de 86'400.00", () => {
    const b = bilanOuverture(manuelFavre.ouvertureActif, manuelFavre.ouverturePassif);
    expect(b.totaux.actifsCirculants).toBe(chf(29900));
    expect(b.totaux.actifsImmobilises).toBe(chf(103000));
    expect(b.fortuneNette).toBe(chf(86400));
  });

  it('Vinothèque des Pâquis : marge brute et échelle des prix', () => {
    const r = margeBrute(dossierCorrige(manuelVinotheque));
    expect(r.can).toBe(chf(34823));
    expect(r.prama).toBe(chf(25970));
    expect(r.prmv).toBe(chf(23470));
    expect(r.margeBrute).toBe(chf(11353));
    const e = echelle(manuelVinotheque.parametres.echellePrix!);
    expect([e.pac, e.pan, e.pra, e.pr, e.pvn, e.pvb].map((c) => c / 100)).toEqual([85.5, 83.79, 90, 112.5, 135, 150]);
  });
});

describe('dossiers de pièces tirés des chapitres 1 et 12', () => {
  it('Garage du Pont-Rouge : résultat et soldes de contrôle', async () => {
    const { dossierGarage } = await import('../src/data/dossiers/cfc-manuel');
    const d = dossierCorrige(dossierGarage);
    expect(compteDeResultat(d).resultat).toBe(chf(1850 + 420 - 2600));
    expect(soldeDe(d, '1020')).toBe(chf(24000 - 17100 - 2600 + 1850 + 10000 - 5000));
    expect(soldeDe(d, '1530')).toBe(chf(46000));
    expect(soldeDe(d, '2010')).toBe(chf(-(2800 + 18000 - 900 - 17100 + 2300 + 32000)));
    expect(boucler(d).ok).toBe(true);
  });

  it('Hi-Fi Plainpalais : escompte, marge brute et variation de stock', async () => {
    const { dossierHifi } = await import('../src/data/dossiers/cfc-manuel');
    const d = dossierCorrige(dossierHifi);
    expect(soldeDe(d, '4209')).toBe(chf(-171));
    expect(soldeDe(d, '1200')).toBe(chf(63400));
    const r = margeBrute(d);
    expect(r.can).toBe(chf(7985));
    expect(r.prama).toBe(chf(8759));
    expect(r.prmv).toBe(chf(5359));
    expect(r.margeBrute).toBe(chf(2626));
    expect(boucler(d).ok).toBe(true);
  });
});
