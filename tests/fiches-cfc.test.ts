import { describe, expect, it } from 'vitest';
import { bilanOuverture, echelle, margeBrute, masseDuCompte } from '../src/engine/fiches-cfc';
import type { Dossier } from '../src/engine/dossier';
import { chf, dossierVide, ecr, passer, simple } from './fixtures';

describe("fiche « Bilan d'ouverture »", () => {
  it('classe les comptes dans les cinq masses', () => {
    expect(masseDuCompte('1000')).toBe('actifsCirculants');
    expect(masseDuCompte('1200')).toBe('actifsCirculants');
    expect(masseDuCompte('1530')).toBe('actifsImmobilises');
    expect(masseDuCompte('2000')).toBe('ceCourtTerme');
    expect(masseDuCompte('2401')).toBe('ceLongTerme');
    expect(masseDuCompte('2800')).toBe('capitauxPropres');
    expect(masseDuCompte('3200')).toBeNull();
  });

  it("calcule les totaux et la fortune nette ; le capital n'est pas donné à classer", () => {
    // Exemple de la théorie : agence de Mme Monnier
    const b = bilanOuverture(
      { '1000': chf(3000), '1010': chf(15000), '1510': chf(40000), '1521': chf(22000), '1530': chf(20000) },
      { '2010': chf(5000), '2400': chf(35000), '2800': chf(60000) },
    );
    expect(b.postes.map((p) => p.numero)).toEqual(['1000', '1010', '1510', '1521', '1530', '2010', '2400']);
    expect(b.totaux.actifsCirculants).toBe(chf(18000));
    expect(b.totaux.actifsImmobilises).toBe(chf(82000));
    expect(b.totalActifs).toBe(chf(100000));
    expect(b.capitauxEtrangers).toBe(chf(40000));
    expect(b.fortuneNette).toBe(chf(60000));
  });

  it('donne un découvert (fortune nette négative) quand les dettes dépassent les actifs', () => {
    const b = bilanOuverture({ '1020': chf(84000) }, { '2000': chf(91500) });
    expect(b.fortuneNette).toBe(chf(-7500));
  });
});

describe('fiche « Marge brute »', () => {
  it('reprend l\'exemple de la théorie (Librairie des Tranchées)', () => {
    let d: Dossier = { ...dossierVide(), niveau: 'CFC2' }; // stock initial 8'000 ; 3805 dès CFC2
    d = passer(
      d,
      ecr('1', simple('1100', '3200', 80000)),
      ecr('2', simple('2850', '3720', 600)),
      ecr('3', simple('3209', '1100', 2500)),
      ecr('4', simple('3210', '1020', 1200)),
      ecr('5', simple('3805', '1100', 400)),
      ecr('6', simple('4200', '2000', 50000)),
      ecr('7', simple('4270', '1000', 1500)),
      ecr('8', simple('2000', '4209', 1800)),
      ecr('9', simple('1200', '4280', 2500)), // augmentation de stock
    );
    const r = margeBrute(d);
    expect(r.cab).toBe(chf(80000));
    expect(r.can).toBe(chf(76500));
    expect(r.prama).toBe(chf(49700));
    expect(r.variationStock).toBe(chf(-2500));
    expect(r.prmv).toBe(chf(47200));
    expect(r.margeBrute).toBe(chf(29300));
    expect(r.tauxMargeBrute).toBe(38.3);
  });
});

describe('fiche « Échelle des prix »', () => {
  it("reprend l'exemple de la théorie, du PAB au PVB", () => {
    const e = echelle({
      article: 'une machine',
      pab: chf(2000),
      rabaisObtenu: 5,
      escompteObtenu: 2,
      fraisAchat: { type: 'chf', valeur: chf(138) },
      fraisGeneraux: 20,
      beneficeNet: 22.5,
      escompteAccorde: 2,
      rabaisAccorde: 4,
    });
    expect([e.pac, e.pan, e.pra, e.pr, e.pvn, e.pvc, e.pvb].map((c) => c / 100)).toEqual([1900, 1862, 2000, 2400, 2940, 3000, 3125]);
    expect(e.beneficeBrut).toBe(chf(940));
    expect(e.escompteAccorde).toBe(chf(60));
    expect(e.rabaisAccorde).toBe(chf(125));
    expect(e.nombreClePabPvb).toBe(1.5625);
  });

  it('accepte des frais d\'achat en % du PAN (exemple du nombre clé)', () => {
    const e = echelle({
      article: 'un article',
      pab: chf(400),
      rabaisObtenu: 0,
      escompteObtenu: 0,
      fraisAchat: { type: 'pc', valeur: 10 },
      fraisGeneraux: 25,
      beneficeNet: 0,
      escompteAccorde: 0,
      rabaisAccorde: 0,
    });
    expect(e.pra).toBe(chf(440));
    expect(e.pvn).toBe(chf(550));
    expect(e.nombreClePanPvn).toBe(1.375);
  });
});
