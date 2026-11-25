import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { avancement } from '../src/engine/correction';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture, extourner } from '../src/engine/journal';
import { plan } from './fixtures';

describe("avancement de l'élève", () => {
  const ops = demoCfc1.operations;
  const c = demoCfc1.corrige!;
  let d = creerDossier(demoCfc1, plan);
  const ajouter = (id: string, piece: string, lignes = c.find((x) => x.piece === piece)!.lignes) => {
    const r = ajouterEcriture(d, { id, date: ops[0]!.date, piece, libelle: 'x', lignes });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
  };

  it('rien de saisi : tout est à faire', () => {
    const a = avancement(ops, d.ecritures, c);
    expect(a).toMatchObject({ total: ops.length, saisies: 0, justes: 0, aRevoir: 0, incompletes: 0, nonSaisies: ops.length });
  });

  it('compte justes et à revoir ; une extourne retire la pièce', () => {
    ajouter('E1', '1');
    const juste2 = c.find((x) => x.piece === '2')!.lignes;
    const inverse = juste2.map((l) => ({ debit: l.credit, credit: l.debit, montant: l.montant }));
    ajouter('E2', '2', inverse);
    let a = avancement(ops, d.ecritures, c);
    expect(a.justes).toBe(1);
    expect(a.aRevoir).toBe(1);
    expect(a.saisies).toBe(2);
    expect(a.parOperation[1]).toEqual({ numero: '2', statut: 'revoir' });
    const r = extourner(d, 'E2', ops[0]!.date);
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
    a = avancement(ops, d.ecritures, c);
    expect(a.saisies).toBe(1);
    expect(a.parOperation[1]!.statut).toBe('manquante');
  });

  it('juste après « Voir la solution » : comptée juste, mais signalée à part', () => {
    const a = avancement(ops, d.ecritures, c, { '1': { essais: 1, dernier: 'juste', solutionVue: true } });
    expect(a.justes).toBe(1);
    expect(a.avecSolution).toBe(1);
    expect(a.parOperation[0]).toEqual({ numero: '1', statut: 'juste', avecSolution: true });
    // Sans solution vue, rien n'est signalé.
    expect(avancement(ops, d.ecritures, c, { '1': { essais: 2, dernier: 'juste', solutionVue: false } }).avecSolution).toBe(0);
  });

  it('sans corrigé (évaluation) : seulement « saisie »', () => {
    const a = avancement(ops, d.ecritures, null);
    expect(a.parOperation[0]!.statut).toBe('saisie');
    expect(a.justes).toBe(0);
    expect(a.saisies).toBe(1);
  });
});
