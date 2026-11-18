import { describe, expect, it } from 'vitest';
import { retourVisible, LIBELLES_MODE } from '../src/engine/exercice';
import { exporterExercice, importerExercice } from '../src/io/fichiers';
import { demoCfc1 } from '../src/data/demo-cfc1';

describe('évaluation formative', () => {
  it('aucun retour pendant la saisie, retour une fois terminée ; jamais en évaluation', () => {
    expect(retourVisible('entrainement', false)).toBe(true);
    expect(retourVisible('formative', false)).toBe(false);
    expect(retourVisible('formative', true)).toBe(true);
    expect(retourVisible('evaluation', true)).toBe(false);
    expect(LIBELLES_MODE.formative).toBe('Évaluation formative');
  });

  it('le fichier élève garde le corrigé encodé (pour la correction à la fin), pas en évaluation', () => {
    const formative = exporterExercice({ ...demoCfc1, mode: 'formative' });
    expect(formative).toContain('corrigeEncode');
    expect(importerExercice(formative).corrige?.length).toBe(demoCfc1.corrige!.length);
    expect(exporterExercice({ ...demoCfc1, mode: 'evaluation' })).not.toContain('corrigeEncode');
  });
});
