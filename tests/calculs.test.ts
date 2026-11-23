import { describe, expect, it } from 'vitest';
import { MODULES } from '../src/data/apprendre';
import { plan } from '../src/data/plan';
import { champJuste, GENERATEURS, genererCalcul, valeurLisible, type ChampCalcul } from '../src/engine/calculs';
import { estJuste, genererSerie, hasard } from '../src/engine/exercices-courts';

/** Réponse saisie comme un élève : montant 1234.50, pour cent 4.5, nombre, indice d'un choix. */
const saisie = (c: ChampCalcul) => (c.type === 'chf' ? (c.attendu / 100).toFixed(2) : String(c.attendu));

describe('calculs générés', () => {
  it('chaque générateur donne, sur 300 graines, des réponses finies, justes à leur propre saisie et expliquées', () => {
    for (const id of Object.keys(GENERATEURS)) {
      for (let g = 1; g <= 300; g++) {
        const q = genererCalcul(id, hasard(g), { plan });
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
      const serie = genererSerie({ plan, modeles: [], comptes: [], types: [], calculs: m.calculs }, m.formats, 10, 42);
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
