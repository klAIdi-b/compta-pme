import { describe, expect, it } from 'vitest';
import { MODELES, MODULES, modeleParId } from '../src/data/apprendre';
import { plan } from '../src/data/plan';
import { champJuste, GENERATEURS, genererCalcul, valeurLisible, type ChampCalcul } from '../src/engine/calculs';
import { estJuste, genererSerie, hasard } from '../src/engine/exercices-courts';

/** Réponse saisie comme un élève : montant 1234.50, pour cent 4.5, nombre, indice d'un choix. */
const saisie = (c: ChampCalcul) => (c.type === 'chf' ? (c.attendu / 100).toFixed(2) : String(c.attendu));

describe('calculs générés', () => {
  it('chaque générateur donne, sur 300 graines, des réponses finies, justes à leur propre saisie et expliquées', { timeout: 30_000 }, () => {
    for (const id of Object.keys(GENERATEURS)) {
      for (let g = 1; g <= 300; g++) {
        const q = genererCalcul(id, hasard(g), { plan, modeles: MODELES });
        if (q.format === 'qcm') {
          expect(q.reponse).toBeGreaterThanOrEqual(0);
          expect(q.reponse).toBeLessThan(q.choix.length);
          continue;
        }
        expect(q.explication.length, id).toBeGreaterThan(0);
        for (const c of q.champs) {
          expect(Number.isFinite(c.attendu), `${id} ${c.libelle}`).toBe(true);
          expect(champJuste(c, saisie(c)), `${id} ${c.libelle} ${saisie(c)}`).toBe(true);
          expect(valeurLisible(c)).not.toBe('');
        }
        expect(estJuste(q, { format: 'calcul', valeurs: q.champs.map(saisie) })).toBe(true);
      }
    }
  });

  it('exemples de contrôle : intérêt 30/360, méthode des nombres, échelle à rebours', () => {
    const i = { libelle: 'Intérêt', type: 'chf' as const, attendu: 37500, tolerance: 5 };
    expect(champJuste(i, '375')).toBe(true);
    expect(champJuste(i, '375.10')).toBe(false);
    const p = { libelle: 'Taux', type: 'pc' as const, attendu: -21.8, tolerance: 0.1 };
    expect(champJuste(p, '−21,8 %')).toBe(true);
    expect(champJuste(p, '21.8')).toBe(false);
  });

  it('chaque module de calcul a des générateurs connus et des objectifs du plan d\'études', () => {
    for (const m of MODULES.filter((x) => x.calculs)) {
      for (const id of m.calculs!) expect(GENERATEURS[id], `${m.id} ${id}`).toBeDefined();
      expect(m.plan?.length, m.id).toBeGreaterThan(0);
      const serie = genererSerie({ plan, modeles: m.modeles.map(modeleParId), comptes: [], types: [], calculs: m.calculs }, m.formats, 10, 42);
      expect(serie).toHaveLength(10);
      expect(serie.every((q) => q.format === 'calcul' || q.format === 'qcm')).toBe(true);
    }
  });

  it('devises : paiement à l\'étranger au cours vente des devises', () => {
    for (let g = 1; g <= 50; g++) {
      const q = genererCalcul('devises', hasard(g), { plan });
      if (q.format !== 'calcul') continue;
      const virementSortant = q.enonce[0]!.includes('paie par virement');
      if (virementSortant) expect(q.explication[1]).toContain('devises, vente');
    }
  });
});

describe('crédit au prorata', () => {
  it('une étape fausse sur plusieurs ne fait perdre que sa part', async () => {
    const { credit } = await import('../src/engine/exercices-courts');
    const q = genererCalcul('analytique', hasard(5), { plan });
    if (q.format !== 'calcul') throw new Error('calcul attendu');
    const valeurs = q.champs.map(saisie);
    expect(credit(q, { format: 'calcul', valeurs })).toBe(1);
    valeurs[0] = '1';
    expect(credit(q, { format: 'calcul', valeurs })).toBeCloseTo((q.champs.length - 1) / q.champs.length);
  });
});

describe('classer la pièce', () => {
  it('chaque opération proposée a un classeur, cohérent avec la règle 2000 / 2010 et le compte privé', async () => {
    const { classeurDe } = await import('../src/engine/calculs');
    expect([classeurDe('4200'), classeurDe('1530'), classeurDe('6000'), classeurDe('2850'), classeurDe('1020'), classeurDe('1509')]).toEqual([0, 1, 2, 3, -1, -1]);
    const mod = MODULES.find((x) => x.id === 'classer-pieces')!;
    for (const id of mod.modeles) expect(classeurDe(modeleParId(id).debit), id).toBeGreaterThanOrEqual(0);
  });
});
