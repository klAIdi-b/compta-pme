import { describe, expect, it } from 'vitest';
import { ajouterJours, apresRevision, aRevoir, premiereRevision } from '../src/engine/revision';

describe('révision espacée', () => {
  it('1, 3, 7, 14, 30 jours ; un échec ramène à 1 jour', () => {
    let e = premiereRevision('2026-11-24');
    expect(e).toEqual({ rang: 0, prochaine: '2026-11-25' });
    e = apresRevision(e, true, '2026-11-25');
    expect(e).toEqual({ rang: 1, prochaine: '2026-11-28' });
    e = apresRevision(e, true, '2026-11-28');
    expect(e.prochaine).toBe('2026-12-05');
    e = apresRevision(e, false, '2026-12-05');
    expect(e).toEqual({ rang: 0, prochaine: '2026-12-06' });
    for (let i = 0; i < 10; i++) e = apresRevision(e, true, '2026-12-06');
    expect(e).toEqual({ rang: 4, prochaine: ajouterJours('2026-12-06', 30) });
  });

  it('notions dues, la plus ancienne d’abord ; passage de mois', () => {
    expect(ajouterJours('2026-12-30', 3)).toBe('2027-01-02');
    const p = { a: { revision: { rang: 0, prochaine: '2026-11-25' } }, b: { revision: { rang: 1, prochaine: '2026-11-20' } }, c: { revision: { rang: 0, prochaine: '2026-12-01' } }, d: {} };
    expect(aRevoir(p, '2026-11-25')).toEqual(['b', 'a']);
  });
});
