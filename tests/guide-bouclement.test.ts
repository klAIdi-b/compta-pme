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

describe('accompagnement du bouclement (méthode du cours)', () => {
  it('deux étapes pour la raison individuelle, une pour une société', () => {
    expect(etapesBouclement('raison individuelle').map((e) => e.piece)).toEqual(['B1', 'B2']);
    expect(etapesBouclement('SA').map((e) => e.piece)).toEqual(['B1']);
  });

  it('les consignes, règles et explications ne contiennent ni numéro de compte ni montant', () => {
    for (const e of [...etapesBouclement('raison individuelle'), ...etapesBouclement('SA')]) {
      // Les numéros de pièce (B1, B2…) sont permis.
      expect((e.consigne + e.regle + e.but).replace(/B\d/g, '')).not.toMatch(/\d/);
    }
  });

  it('B1 : compte de résultat et compte privé ; B2 : compte privé et capital', () => {
    const d = dossierAvecCorrige(demoCfc1);
    expect(comptesDeLEtape(d, 'B1').map((c) => c.numero)).toEqual(['9000', '2850']);
    expect(comptesDeLEtape(d, 'B2').map((c) => c.numero)).toEqual(['2850', '2800']);
    expect(comptesDeLEtape(d, 'B2')[1]!.intitule).toBeTruthy();
  });

  it('étapes saisies après le bouclement', () => {
    const d = dossierAvecCorrige(demoCfc1);
    const r = boucler(d);
    if (!r.ok) throw new Error(r.erreurs.join());
    expect([...etapesSaisies(r.valeur)].sort()).toEqual(['B1', 'B2']);
    expect(etapesSaisies(d).size).toBe(0);
  });

  it('société : B1 vers le bénéfice reporté', () => {
    const d = dossierAvecCorrige(demoMp);
    expect(comptesDeLEtape(d, 'B1').map((c) => c.numero)).toEqual(['9000', '2970']);
    expect(comptesDeLEtape(d, 'B2')).toEqual([]);
  });
});
