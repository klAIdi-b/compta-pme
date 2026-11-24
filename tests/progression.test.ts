import { describe, expect, it } from 'vitest';
import { ErreurFichier } from '../src/io/fichiers';
import { exporterProgression, importerProgression } from '../src/io/progression';

describe('fichier de progression', () => {
  const f = {
    eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CFC3' },
    exporteLe: '2026-11-24T10:00:00.000Z',
    progression: { bilan: { meilleur: 9, sur: 10, maitrise: true, series: 2, le: '2026-11-24T09:00:00.000Z' } },
  };

  it('exporté puis importé sans perte', () => {
    expect(importerProgression(exporterProgression(f))).toEqual(f);
  });

  it('refuse un autre fichier', () => {
    expect(() => importerProgression('{"format":"compta-pme/copie"}')).toThrow(ErreurFichier);
    expect(() => importerProgression('pas du json')).toThrow(ErreurFichier);
  });
});
