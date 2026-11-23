import { describe, expect, it } from 'vitest';
import { budgetJournee, budgetTrimestre } from '../src/data/exercices-budget';
import { plan } from '../src/data/plan';
import {
  appreciation, calculBudget, champsComparer, champsPreparer, ID_RESULTAT, ID_TOTAL_CHARGES, ID_TOTAL_PRODUITS,
  noterBudget, type FicheBudget,
} from '../src/engine/budget';
import type { ChampAttendu } from '../src/engine/champs';
import { controlerChamp } from '../src/engine/champs';
import type { Dossier } from '../src/engine/dossier';
import { controlerExercice, creerDossier, fonctionsExercice } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { soldeDe } from '../src/engine/ledger';
import { corrigerCopie } from '../src/engine/notation';
import { chf } from './fixtures';

const journee = budgetJournee.parametres.budget!;
const trimestre = budgetTrimestre.parametres.budget!;

function valeur(c: ChampAttendu): string {
  if (c.type === 'chf') return ((c.attendu as number) / 100).toFixed(2);
  return String(c.attendu);
}

function dossierCorrige(): Dossier {
  let d = creerDossier(budgetTrimestre, plan);
  budgetTrimestre.corrige!.forEach((c, i) => {
    const op = budgetTrimestre.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(`${c.piece} : ${r.erreurs.join()}`);
    d = r.valeur;
  });
  return d;
}

describe('budget : calculs', () => {
  it('Journée du vélo électrique : budget, effectif, écarts et appréciations', () => {
    const c = calculBudget(journee);
    expect([c.totalProduits, c.totalCharges, c.resultat]).toEqual([chf(2660), chf(1890), chf(770)]);
    const l = Object.fromEntries(c.lignes.map((x) => [x.id, x]));
    expect([l.inscriptions!.ecart, l.inscriptions!.ecartPc, l.inscriptions!.appreciation]).toEqual([chf(-300), -20, 'defavorable']);
    expect([l['boissons-achats']!.ecart, l['boissons-achats']!.ecartPc, l['boissons-achats']!.appreciation]).toEqual([chf(-10), -6.7, 'favorable']);
    expect([l.publicite!.ecart, l.publicite!.ecartPc, l.publicite!.appreciation]).toEqual([chf(170), 48.6, 'defavorable']);
    expect(l.sponsoring!.appreciation).toBe('conforme');
    expect([l[ID_TOTAL_PRODUITS]!.ecart, l[ID_TOTAL_PRODUITS]!.ecartPc]).toEqual([chf(-372), -14]);
    expect([l[ID_TOTAL_CHARGES]!.ecart, l[ID_TOTAL_CHARGES]!.ecartPc, l[ID_TOTAL_CHARGES]!.appreciation]).toEqual([chf(220), 11.6, 'defavorable']);
    expect([l[ID_RESULTAT]!.effectif, l[ID_RESULTAT]!.ecart, l[ID_RESULTAT]!.ecartPc, l[ID_RESULTAT]!.appreciation]).toEqual([chf(178), chf(-592), -76.9, 'defavorable']);
  });

  it('appréciation : produit plus élevé favorable, charge plus élevée défavorable, écart nul conforme', () => {
    expect(appreciation('produit', 100)).toBe('favorable');
    expect(appreciation('charge', 100)).toBe('defavorable');
    expect(appreciation('charge', -100)).toBe('favorable');
    expect(appreciation('produit', 0)).toBe('conforme');
  });

  it('2e trimestre : chiffres effectifs tirés des comptes de l\'élève', () => {
    const d = dossierCorrige();
    const c = calculBudget(trimestre, (n) => soldeDe(d, n));
    expect([c.totalProduits, c.totalCharges, c.resultat]).toEqual([chf(53000), chf(36650), chf(16350)]);
    const l = Object.fromEntries(c.lignes.map((x) => [x.id, x]));
    expect(l.ventes!.effectif).toBe(chf(48500));
    expect(l.achats!.effectif).toBe(chf(27500));
    expect([l.publicite!.ecart, l.publicite!.ecartPc]).toEqual([chf(600), 50]);
    expect([l[ID_RESULTAT]!.effectif, l[ID_RESULTAT]!.ecart, l[ID_RESULTAT]!.ecartPc]).toEqual([chf(12790), chf(-3560), -21.8]);
  });
});

describe('budget : saisies et points', () => {
  it('écart en % à 0,1 point près, signe moins typographique accepté', () => {
    const p = champsComparer(journee).find((c) => c.cle === 'p:inscriptions')!;
    expect(controlerChamp(p, '−20')).toBe(true);
    expect(controlerChamp(p, '-20,05')).toBe(true);
    expect(controlerChamp(p, '20')).toBe(false);
    const e = champsComparer(journee).find((c) => c.cle === 'e:inscriptions')!;
    expect(controlerChamp(e, '−300.00')).toBe(true);
    expect(champsPreparer(journee).find((c) => c.cle === 'seuil')!.attendu).toBe(21);
  });

  it('points des deux onglets dans la note de la copie ; effectifs tirés des comptes de la copie', () => {
    const d = dossierCorrige();
    const solde = (n: string) => soldeDe(d, n);
    const juste: FicheBudget = {
      preparer: Object.fromEntries(champsPreparer(trimestre).map((c) => [c.cle, valeur(c)])),
      comparer: Object.fromEntries(champsComparer(trimestre, solde).map((c) => [c.cle, valeur(c)])),
    };
    const r = noterBudget(trimestre, juste, {}, solde);
    expect(r.map((x) => [x.cle, x.points, x.max])).toEqual([['Budget', 3, 3], ['Comparaison avec le budget', 3, 3]]);
    const sans = corrigerCopie(budgetTrimestre, d);
    const avec = corrigerCopie(budgetTrimestre, d, { budget: juste });
    expect(avec.max).toBe(sans.max + 6);
    expect(avec.note).toBe(6);
  });
});

describe('exercices budget', () => {
  it('passent le contrôle et activent la rubrique Budget (la journée sans opération au journal)', () => {
    for (const ex of [budgetJournee, budgetTrimestre]) {
      expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
      expect(fonctionsExercice(ex).has('budget')).toBe(true);
    }
    expect(budgetJournee.operations).toHaveLength(0);
  });
});
