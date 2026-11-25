import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { demoMp } from '../src/data/demo-mp';
import type { Avancement } from '../src/engine/correction';
import { fonctionsExercice, type Exercice } from '../src/engine/exercice';
import { avecParcours, etapesParcours, etatJournal, rangParcours } from '../src/ui/parcours';

const av = (p: Partial<Avancement>): Avancement => ({
  total: 5, saisies: 5, justes: 5, avecSolution: 0, aRevoir: 0, incompletes: 0, nonSaisies: 0, parOperation: [], ...p,
});

describe('parcours après le journal', () => {
  it('CFC 1 : balance, compte de résultat, bilan, bouclement', () => {
    const e = etapesParcours(demoCfc1, fonctionsExercice(demoCfc1));
    expect(e.map((x) => x.vue)).toEqual(['balance', 'resultat', 'bilan', 'bouclement']);
    expect(e[3]!.consigne).toContain('B2');
    expect(rangParcours(e, 'journal')).toBe(0);
    expect(rangParcours(e, 'bilan')).toBe(3);
    expect(rangParcours(e, 'comptes')).toBe(-1);
  });

  it('MP (SA) : fiches à leur place, répartition après le bouclement', () => {
    const e = etapesParcours(demoMp, fonctionsExercice(demoMp)).map((x) => x.vue);
    expect(e.indexOf('degres')).toBeGreaterThan(e.indexOf('resultat'));
    expect(e.indexOf('degres')).toBeLessThan(e.indexOf('bilan'));
    expect(e.indexOf('repartition')).toBe(e.indexOf('bouclement') + 1);
  });

  it("sans étape Bouclement quand le résultat est intégré à la réouverture", () => {
    const ex: Exercice = { ...demoCfc1, parametres: { ...demoCfc1.parametres, modeBouclement: 'aLaReouverture' } };
    expect(etapesParcours(ex, fonctionsExercice(ex)).map((x) => x.vue)).not.toContain('bouclement');
  });

  it('entraînement : toutes les opérations justes ; évaluation : toutes saisies', () => {
    expect(etatJournal(av({}), true)).toEqual({ termine: true });
    expect(etatJournal(av({ aRevoir: 1, justes: 4 }), true)).toEqual({ termine: false, manquantes: 0, aRevoir: 1 });
    expect(etatJournal(av({ aRevoir: 1, justes: 4 }), false)).toEqual({ termine: true });
    expect(etatJournal(av({ nonSaisies: 2, saisies: 3 }), false)).toEqual({ termine: false, manquantes: 2, aRevoir: 0 });
  });

  it("pas de parcours pour le simulateur d'entreprise", () => {
    expect(avecParcours(demoCfc1)).toBe(true);
    expect(avecParcours({ ...demoCfc1, id: 'simulation-abc' })).toBe(false);
  });
});
