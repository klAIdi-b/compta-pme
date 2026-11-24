import { describe, expect, it } from 'vitest';
import { MODULES } from '../src/data/apprendre';
import { LECONS, exemplesDe } from '../src/data/lecons';
import { lirePlanCsv } from '../src/engine/plan';
import planCsv from '../src/data/plan-pme.csv?raw';

describe('leçons du parcours Apprendre', () => {
  it('chaque module a sa leçon, et chaque leçon son module', () => {
    const ids = MODULES.map((m) => m.id).sort();
    expect(Object.keys(LECONS).sort()).toEqual(ids);
  });

  it('chaque leçon a au moins deux parties, un exemple et une phrase à retenir', () => {
    for (const [id, parties] of Object.entries(LECONS)) {
      expect(parties.length, id).toBeGreaterThanOrEqual(2);
      expect(parties.some((p) => exemplesDe(p).length > 0), id).toBe(true);
      expect(parties.some((p) => p.retenir), id).toBe(true);
      for (const p of parties) {
        expect(p.texte.length, `${id} · ${p.titre}`).toBeGreaterThan(0);
        for (const x of exemplesDe(p)) for (const l of x.tableau?.lignes ?? []) expect(l.length, `${id} · ${p.titre}`).toBe(x.tableau!.entetes.length);
      }
    }
  });

  it('les montants sont au format du logiciel (apostrophe droite, deux décimales)', () => {
    const texte = JSON.stringify(LECONS);
    expect(texte).not.toMatch(/\d’\d/);
    expect(texte).not.toMatch(/\d \d{3}\.\d{2}/);
  });

  it('les écritures des leçons citent des comptes du plan du cours', () => {
    const plan = lirePlanCsv(planCsv);
    const intitules = new Set(plan.map((c) => c.intitule));
    // Intitulés cités en tête de cellule dans les colonnes Débit et Crédit des tableaux d'écritures.
    const abreges = new Set(['Banque', 'Poste', 'Capital-actions', 'Impôts', 'Charges financières']);
    for (const [id, parties] of Object.entries(LECONS)) {
      for (const p of parties) {
        for (const t of exemplesDe(p).map((x) => x.tableau).filter((t) => !!t)) {
        const colonnes = t.entetes.map((e, i) => (e === 'Débit' || e === 'Crédit' ? i : -1)).filter((i) => i >= 0);
        for (const l of t.lignes) for (const i of colonnes) {
          for (const morceau of l[i]!.split(/(?<=\.\d{2}) et /)) {
            const nom = morceau.replace(/\s[\d']+\.\d{2}$/, '').trim();
            const connu = intitules.has(nom) || abreges.has(nom) || [...intitules].some((x) => x.startsWith(`${nom} (`));
            expect(connu, `${id} · ${p.titre} · « ${nom} »`).toBe(true);
          }
        }
        }
      }
    }
  });

  it('les leçons de 1re année sont approfondies : vocabulaire, plusieurs exemples, questions de contrôle', () => {
    for (const m of MODULES.filter((x) => x.niveau === 'CFC1')) {
      const parties = LECONS[m.id]!;
      const nbExemples = parties.reduce((n, p) => n + exemplesDe(p).length, 0);
      expect(nbExemples, m.id).toBeGreaterThanOrEqual(2);
      expect(parties.length, m.id).toBeGreaterThanOrEqual(3);
    }
    for (const id of ['bilan', 'comptes', 'charges-produits', 'factures', 'prive', 'marchandises']) {
      const parties = LECONS[id]!;
      expect(parties.length, id).toBeGreaterThanOrEqual(5);
      expect(parties.some((p) => p.definitions?.length), id).toBe(true);
      expect(parties.some((p) => p.questions?.length), id).toBe(true);
    }
  });
});
