import { describe, expect, it } from 'vitest';
import { exercicesManuel, manuelCaveEauxVives, manuelGolay } from '../src/data/exercices-manuel';
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
    soldes: { '1020': 4880, '1010': 8065, '1000': 1000, '1100': 0, '1510': 67350, '1530': 68800, '2010': -22825 },
  },
  // Ventes 40'260.00 − déductions 849.60 − frais de ventes 280.00 + prélèvement 420.00 ; achats nets 30'000.00 − 852.00
  // + frais 610.00 − variation de stock 3'000.00 ; loyer 3'100.00.
  'manuel-cfc1-vinotheque-des-paquis': {
    resultat: 9692.4,
    soldes: { '1020': 43542.4, '1000': 7750, '1100': 6460, '2000': -18980, '1200': 29000 },
  },
  // Ventes 74'600.00 − achats nets 37'400.00 − autres charges 930.00 ; comptes de TVA soldés par le décompte.
  'manuel-cfc2-maison-lacroix-tva': {
    resultat: 36270,
    soldes: {
      '1000': 25687, '1010': 15019.4, '1020': 20438.6, '1100': 17100, '2000': -17810,
      '1170': 0, '1171': 0, '2200': 0, '2205': 0, '2850': 15835,
    },
  },
  // Ventes 39'200.00 − pertes nettes 35'357.50 + produits exceptionnels 14'000.00.
  'manuel-cfc3-materiaux-brodard-creances': {
    resultat: 17842.5,
    soldes: { '1000': 7500, '1010': 21780, '1020': 75500, '1100': 23750, '1108': 21000, '1109': -1187.5, '2000': -14800 },
  },
  // Amortissements 63'749.00 (perte, aucune autre opération de résultat).
  'manuel-cfc3-imprimerie-mont-blanc-amortissements': {
    resultat: -63749,
    soldes: { '1500': 212000, '1509': -96500, '1549': -10800, '1510': 18250, '1521': 7200, '1530': 1, '1020': 33000 },
  },
  // Charges de l'exercice : assurances 3'700, réparations 4'200 + 7'500, salaires 36'000, intérêt 2'400.
  'manuel-cfc3-truffaz-transports-transitoires': {
    resultat: -53800,
    soldes: { '1300': 21380, '2300': -50100, '1020': 104920, '6000': 0, '6500': 0, '6300': 3700 },
  },
  // Produits 1'713'100.00 − charges 1'295'275.00.
  'manuel-cfc4-lambert-horlogerie-cloture': {
    resultat: 417825,
    soldes: {
      '1020': 429000, '1010': 8440, '1100': 385000, '1109': -19250, '1200': 396000, '1510': 26400, '1521': 15400,
      '1539': -29700, '1609': -51920, '1300': 1880, '2300': -29085, '2000': -104500, '2850': -34540,
    },
  },
  // Frais de fondation 2'885.50 et d'augmentation 7'200.00 ; 48'000.00 encore à libérer.
  'manuel-mp3-zephyr-automation-fondation': {
    resultat: -10085.5,
    soldes: { '1850': 48000, '1860': 0, '1020': 273314.5, '2800': -360000, '2810': -60000, '2900': -30000, '1109': -3200, '1100': 32000 },
  },
  // Produits des titres 4'938.50 − droits de garde 60.00.
  'manuel-mp4-rive-gauche-participations-titres': {
    resultat: 4878.5,
    soldes: { '1060': 71000, '1176': 0, '1300': 262.5, '1020': 283616 },
  },
};

describe('exercices construits sur les cas du manuel E&S (CFC) et de F&C (MP)', () => {
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

  it("Golay Événements : la fiche « Bilan d'ouverture » donne une fortune nette de 100'110.00", () => {
    const b = bilanOuverture(manuelGolay.ouvertureActif, manuelGolay.ouverturePassif);
    expect(b.totaux.actifsCirculants).toBe(chf(35610));
    expect(b.totaux.actifsImmobilises).toBe(chf(120000));
    expect(b.fortuneNette).toBe(chf(100110));
  });

  it('Cave des Eaux-Vives : marge brute et échelle des prix', () => {
    const r = margeBrute(dossierCorrige(manuelCaveEauxVives));
    expect(r.can).toBe(chf(39550.4));
    expect(r.prama).toBe(chf(29758));
    expect(r.prmv).toBe(chf(26758));
    expect(r.margeBrute).toBe(chf(12792.4));
    const e = echelle(manuelCaveEauxVives.parametres.echellePrix!);
    expect([e.pac, e.pan, e.pra, e.pr, e.pvn, e.pvb].map((c) => c / 100)).toEqual([114, 111.72, 120, 150, 180, 200]);
  });
});

describe('dossiers de pièces construits sur les chapitres 1 et 12', () => {
  it('Garage de la Praille : résultat et soldes de contrôle', async () => {
    const { dossierGarage } = await import('../src/data/dossiers/cfc-manuel');
    const d = dossierCorrige(dossierGarage);
    expect(compteDeResultat(d).resultat).toBe(chf(2100 + 480 - 2900));
    expect(soldeDe(d, '1020')).toBe(chf(28000 - 19950 - 2900 + 2100 + 12000 - 6000));
    expect(soldeDe(d, '1530')).toBe(chf(52000));
    expect(soldeDe(d, '2010')).toBe(chf(-(3200 + 21000 - 1050 - 19950 + 2540 + 36000)));
    expect(boucler(d).ok).toBe(true);
  });

  it('Son & Image Servette : escompte, marge brute et variation de stock', async () => {
    const { dossierSonImage } = await import('../src/data/dossiers/cfc-manuel');
    const d = dossierCorrige(dossierSonImage);
    expect(soldeDe(d, '4209')).toBe(chf(-187.2));
    expect(soldeDe(d, '1200')).toBe(chf(66800));
    const r = margeBrute(d);
    expect(r.can).toBe(chf(8835));
    expect(r.prama).toBe(chf(9592.8));
    expect(r.prmv).toBe(chf(5792.8));
    expect(r.margeBrute).toBe(chf(3042.2));
    expect(boucler(d).ok).toBe(true);
  });
});
