import { describe, expect, it } from 'vitest';
import { MODULES } from '../src/data/apprendre';
import { exercicesDemo } from '../src/data/demos';
import { plan } from '../src/data/plan';
import { GENERATEURS_ECRITURES } from '../src/engine/ecritures-generees';
import { estJuste, genererSerie, hasard } from '../src/engine/exercices-courts';

/** Signature d'une écriture : comptes et côtés, sans les montants (« D4200 D1170 C2000 »). */
const signature = (lignes: { debit?: string | null; credit?: string | null; cote?: string; compte?: string }[]) =>
  [...new Set(lignes.flatMap((l) => (l.cote ? [`${l.cote === 'debit' ? 'D' : 'C'}${l.compte}`] : [l.debit ? `D${l.debit}` : '', l.credit ? `C${l.credit}` : '']).filter(Boolean)))].sort().join(' ');

describe('écritures générées (CFC 2 et MP)', () => {
  const validees = new Set(exercicesDemo.flatMap((e) => (e.corrige ?? []).map((c) => signature(c.lignes))));

  it('chaque modèle est équilibré et reprend les comptes et les côtés d’une écriture d’un corrigé validé', () => {
    for (const [famille, liste] of Object.entries(GENERATEURS_ECRITURES)) {
      liste.forEach((g, k) => {
        for (let s = 1; s <= 50; s++) {
          const q = g(hasard(s));
          const d = q.lignes.filter((l) => l.cote === 'debit').reduce((t, l) => t + l.montant, 0);
          const c = q.lignes.filter((l) => l.cote === 'credit').reduce((t, l) => t + l.montant, 0);
          expect(d, `${famille} ${k}`).toBe(c);
          expect(q.lignes.every((l) => l.montant > 0), `${famille} ${k}`).toBe(true);
          for (const l of q.lignes) expect(plan.some((x) => x.numero === l.compte), l.compte).toBe(true);
        }
        expect(validees.has(signature(g(hasard(1)).lignes)), `${famille} ${k} : ${signature(g(hasard(1)).lignes)}`).toBe(true);
      });
    }
  });

  it('les modules proposent dans leurs listes tous les comptes de leurs écritures ; séries justes à leur propre réponse', () => {
    for (const m of MODULES.filter((x) => x.ecritures)) {
      for (let s = 1; s <= 30; s++) {
        const serie = genererSerie({ plan, modeles: [], comptes: m.comptes, types: [], ecritures: m.ecritures }, m.formats, 10, s);
        for (const q of serie) {
          if (q.format !== 'composee') continue;
          for (const l of q.lignes) expect(m.comptes, `${m.id} ${l.compte}`).toContain(l.compte);
          expect(estJuste(q, { format: 'composee', comptes: q.lignes.map((l) => l.compte) })).toBe(true);
        }
      }
    }
  });

  it('règle 2000 / 2010 respectée', () => {
    for (const liste of Object.values(GENERATEURS_ECRITURES)) {
      for (const g of liste) {
        const q = g(hasard(3));
        const debits = q.lignes.filter((l) => l.cote === 'debit').map((l) => l.compte);
        if (q.lignes.some((l) => l.cote === 'credit' && l.compte === '2000')) expect(debits.every((x) => ['4200', '1170'].includes(x))).toBe(true);
        if (q.lignes.some((l) => l.cote === 'credit' && l.compte === '2010')) expect(debits).not.toContain('4200');
      }
    }
  });
});
