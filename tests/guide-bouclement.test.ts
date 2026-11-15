import { describe, expect, it } from 'vitest';
import { comptesDeLEtape, etapesBouclement, etapesSaisies } from '../src/engine/guide-bouclement';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { demoMp } from '../src/data/demo-mp';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { boucler } from '../src/engine/closing';
import type { Dossier } from '../src/engine/dossier';
import { plan } from './fixtures';

function dossierAvecCorrige(ex: typeof demoCfc1): Dossier {
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: ex.operations.find((o) => o.numero === c.piece)?.date ?? d.debut, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = r.valeur;
  });
  return d;
}

describe('accompagnement du bouclement', () => {
  it('trois étapes pour la raison individuelle, deux pour une société', () => {
    expect(etapesBouclement('raison individuelle').map((e) => e.piece)).toEqual(['B1', 'B2', 'B3']);
    expect(etapesBouclement('SA').map((e) => e.piece)).toEqual(['B1', 'B2']);
  });

  it('les consignes et les règles ne contiennent ni numéro de compte ni montant', () => {
    for (const e of [...etapesBouclement('raison individuelle'), ...etapesBouclement('SA')]) {
      // Les numéros de pièce (B1, B2…) sont permis.
      expect((e.consigne + e.regle).replace(/B\d/g, '')).not.toMatch(/\d/);
    }
  });

  it('B1 : les charges et produits non soldés, B2 et B3 : les comptes du virement', () => {
    const d = dossierAvecCorrige(demoCfc1);
    const b1 = comptesDeLEtape(d, 'B1');
    expect(b1.length).toBeGreaterThan(2);
    expect(b1.every((c) => /^[3-8]/.test(c.numero))).toBe(true);
    expect(comptesDeLEtape(d, 'B2').map((c) => c.numero)).toEqual(['9000', '2850']);
    expect(comptesDeLEtape(d, 'B3').map((c) => c.numero)).toEqual(['2850', '2800']);
    expect(comptesDeLEtape(d, 'B3')[0]!.intitule).toBeTruthy();
  });

  it('les comptes de B1 restent ceux d’avant le bouclement, même une fois B1 passée', () => {
    const d = dossierAvecCorrige(demoCfc1);
    const avant = comptesDeLEtape(d, 'B1');
    const r = boucler(d);
    if (!r.ok) throw new Error(r.erreurs.join());
    expect(comptesDeLEtape(r.valeur, 'B1')).toEqual(avant);
    expect([...etapesSaisies(r.valeur)].sort()).toEqual(['B1', 'B2', 'B3']);
    expect(etapesSaisies(d).size).toBe(0);
  });

  it('société : B2 vers le bénéfice reporté', () => {
    const d = dossierAvecCorrige(demoMp);
    expect(comptesDeLEtape(d, 'B2').map((c) => c.numero)).toEqual(['9000', '2970']);
    expect(comptesDeLEtape(d, 'B3')).toEqual([]);
  });
});
