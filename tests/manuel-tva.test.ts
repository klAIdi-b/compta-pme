import { describe, expect, it } from 'vitest';
import { manuelVuilleumier } from '../src/data/exercices-manuel';
import { CONTROLES_ELECTROMENAGER as K, dossierElectromenager } from '../src/data/dossiers/cfc-manuel-tva';
import { controlerExercice } from '../src/engine/exercice';
import { tvaSurHT } from '../src/engine/tva';
import { plan } from './fixtures';

const somme = (l: { debit: string | null; credit: string | null; montant: number }[], cote: 'debit' | 'credit') =>
  l.filter((x) => x[cote]).reduce((s, x) => s + x.montant, 0);

describe('lot ch. 14 TVA (manuel E&S)', () => {
  for (const ex of [manuelVuilleumier, dossierElectromenager]) {
    it(`${ex.raisonSociale} : exercice sans erreur, corrigé complet et équilibré`, () => {
      const c = controlerExercice(ex, plan);
      expect(c.erreurs).toEqual([]);
      expect(ex.corrige!.map((x) => x.piece)).toEqual(ex.operations.map((o) => o.numero));
      for (const e of ex.corrige!) expect(somme(e.lignes, 'debit')).toBe(somme(e.lignes, 'credit'));
    });
  }

  it('Maison Vuilleumier : TVA aux taux actuels', () => {
    // Opération 6 : 28'000.00 HT à 8,1 %, opération 11 : 450.00 HT à 2,6 %.
    expect(tvaSurHT(2800000, 81)).toBe(226800);
    expect(tvaSurHT(45000, 26)).toBe(1170);
    // Décompte : TVA due 5'022.00 − IP 3'029.40 − IP 50.60 = 1'942.00
    const d = manuelVuilleumier.corrige!.find((x) => x.piece === '14')!;
    expect(d.lignes.find((l) => l.credit === '2205')!.montant).toBe(194200);
  });

  it('Électroménager des Acacias : escomptes de 2 % et 3 % avec la part de TVA', () => {
    expect(K.escompteAchatHT).toBe(Math.round(K.e1.ht * 0.02));
    expect(K.escompteAchatTVA).toBe(tvaSurHT(K.escompteAchatHT, 81));
    expect(K.escompteVenteHT).toBe(Math.round(K.e6.ht * 0.03));
    expect(K.escompteVenteTVA).toBe(tvaSurHT(K.escompteVenteHT, 81));
    expect(K.solde).toBe(124750);
  });
});

describe('lot ch. 25 salaires (manuel E&S)', () => {
  it('Pâtisserie du Molard : nets, LPP selon le salaire coordonné, charges patronales', async () => {
    const { CONTROLES_PATISSERIE: S, dossierPatisserie } = await import('../src/data/dossiers/cfc-manuel-salaires');
    expect(controlerExercice(dossierPatisserie, plan).erreurs).toEqual([]);
    expect([S.s2.net, S.s3.net, S.s4.net, S.s5.net]).toEqual([439800, 704770, 213785, 126360]);
    expect(S.avsEmployes).toBe(S.patronAvs); // même taux, arrondis identiques
    expect(S.lppEmployes).toBe(56685);
    expect(S.patronAlfa).toBe(42600);
    for (const e of dossierPatisserie.corrige!) expect(somme(e.lignes, 'debit')).toBe(somme(e.lignes, 'credit'));
  });
});
