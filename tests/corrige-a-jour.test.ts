import { describe, expect, it } from 'vitest';
import { exercicesDemo } from '../src/data/demos';
import { avecCorrigeAJour } from '../src/engine/exercice';

describe('avecCorrigeAJour (exercices fournis déjà commencés)', () => {
  const ex = exercicesDemo.find((e) => e.corrige && e.corrige.length > 0)!;

  it("reprend le corrigé du catalogue quand l'énoncé est identique", () => {
    const ancien = { ...ex, corrige: ex.corrige!.map((c, i) => (i === 0 ? { ...c, lignes: [] } : c)) };
    expect(avecCorrigeAJour(ancien, exercicesDemo).corrige).toEqual(ex.corrige);
  });

  it("ne touche à rien si l'énoncé a changé, sans corrigé ou exercice inconnu", () => {
    const autreTexte = { ...ex, corrige: [], operations: ex.operations.map((o, i) => (i === 0 ? { ...o, texte: 'x' } : o)) };
    expect(avecCorrigeAJour(autreTexte, exercicesDemo)).toBe(autreTexte);
    const sansCorrige = { ...ex, corrige: undefined };
    expect(avecCorrigeAJour(sansCorrige, exercicesDemo)).toBe(sansCorrige);
    const inconnu = { ...ex, id: 'exercice-de-l-enseignant', corrige: [] };
    expect(avecCorrigeAJour(inconnu, exercicesDemo)).toBe(inconnu);
  });
});
