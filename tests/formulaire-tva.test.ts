import { describe, expect, it } from 'vitest';
import { demoCfc2 } from '../src/data/demo-cfc2';
import { dossierElectromenager } from '../src/data/dossiers/cfc-manuel-tva';
import { plan } from '../src/data/plan';
import type { Dossier } from '../src/engine/dossier';
import type { Exercice } from '../src/engine/exercice';
import { creerDossier } from '../src/engine/exercice';
import { champsFormulaireTva, formulaireTva } from '../src/engine/formulaire-tva';
import { ajouterEcriture } from '../src/engine/journal';
import { chf } from './fixtures';

function dossierCorrige(ex: Exercice): Dossier {
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const op = ex.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = r.valeur;
  });
  return d;
}

/** Écriture du décompte dans le corrigé : TVA due virée, impôt préalable, dette envers l'AFC. */
const decompteDuCorrige = (ex: Exercice) => ex.corrige!.find((c) => c.lignes.some((l) => l.credit === '2205'))!.lignes;
const montant = (lignes: ReturnType<typeof decompteDuCorrige>, cote: 'debit' | 'credit', compte: string) =>
  lignes.find((l) => l[cote] === compte)?.montant ?? 0;

describe('formulaire officiel de décompte TVA', () => {
  for (const ex of [demoCfc2, dossierElectromenager]) {
    it(`${ex.titre} : concorde avec l'écriture du décompte du corrigé`, () => {
      const f = formulaireTva(dossierCorrige(ex));
      const dec = decompteDuCorrige(ex);
      expect(f.c399).toBe(montant(dec, 'debit', '2200'));
      expect(f.c400).toBe(montant(dec, 'credit', '1170'));
      expect(f.c405).toBe(montant(dec, 'credit', '1171'));
      expect(f.c500).toBe(montant(dec, 'credit', '2205'));
      expect(f.c299).toBe(f.c200 - f.c289);
      expect(f.parTaux.reduce((s, t) => s + t.base, 0)).toBe(f.c299);
    });
  }

  it('Électroménager du Rhône : exportation en 220, escompte accordé en 235', () => {
    const f = formulaireTva(dossierCorrige(dossierElectromenager));
    expect(f.c220).toBe(chf(18500));
    expect(f.c235).toBe(chf(600));
    expect(f.parTaux.map((t) => t.chiffre)).toEqual(['303']);
    const champs = champsFormulaireTva(f).map((c) => c.cle);
    expect(champs).toEqual(['200', '220', '235', '289', '299', '303b', '303i', '399', '400', '405', '479', '500']);
  });

  it("ignore les écritures du décompte déjà passé et donne 510 quand l'impôt préalable dépasse", () => {
    let d = creerDossier(demoCfc2, plan);
    const lignes = [
      { debit: '4200', credit: null, montant: chf(1000) },
      { debit: '1170', credit: null, montant: chf(81) },
      { debit: null, credit: '2000', montant: chf(1081) },
    ];
    d = (ajouterEcriture(d, { id: 'A', date: '2026-01-05', piece: '1', libelle: 'x', lignes }) as { ok: true; valeur: Dossier }).valeur;
    const f = formulaireTva(d);
    expect([f.c399, f.c479, f.c500, f.c510]).toEqual([0, chf(81), 0, chf(81)]);
    expect(champsFormulaireTva(f).at(-1)!.cle).toBe('510');
  });
});
