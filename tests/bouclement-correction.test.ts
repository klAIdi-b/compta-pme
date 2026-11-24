import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { creerDossier, type Exercice } from '../src/engine/exercice';
import { ajouterEcriture, extourner } from '../src/engine/journal';
import { ecrituresDeBouclement } from '../src/engine/closing';
import { clotureDeGestionPar9000, diagnostiquerBouclement, PIECE_BOUCLEMENT } from '../src/engine/correction-bouclement';
import { soldes } from '../src/engine/ledger';
import { corrigerCopie } from '../src/engine/notation';
import type { Dossier, LigneEcriture } from '../src/engine/dossier';
import { chf, plan } from './fixtures';

const ex: Exercice = { ...demoCfc1, parametres: { ...demoCfc1.parametres, corrigerBouclement: true } };

function operations(): Dossier {
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: '2026-03-01', piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = r.valeur;
  });
  return d;
}

function passer(d: Dossier, piece: string, lignes: LigneEcriture[]): Dossier {
  const r = ajouterEcriture(d, { id: `B${d.ecritures.length + 1}`, date: '2026-12-31', piece, libelle: 'Bouclement', lignes });
  if (!r.ok) throw new Error(r.erreurs.join());
  return r.valeur;
}

describe('correction du bouclement', () => {
  it('juste lorsque l\'élève passe les écritures attendues, quels que soient les numéros de pièce', () => {
    let d = operations();
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    attendues.valeur.forEach((e, i) => (d = passer(d, `C${i + 1}`, e.lignes)));
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
  });

  it('accepte la clôture compte par compte (décomposition)', () => {
    let d = operations();
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    for (const e of attendues.valeur) {
      // chaque compte soldé par une écriture simple contre 9000 ou le capital
      const contre = e.lignes.find((l) => l.debit === '9000' || l.credit === '9000') ? '9000' : '2800';
      for (const l of e.lignes) {
        if (l.debit && l.credit) {
          d = passer(d, 'B', [l]); // écriture déjà simple (virement du résultat ou du privé)
          continue;
        }
        if (l.debit === contre || l.credit === contre) continue;
        d = passer(d, 'B', [l.debit ? { debit: l.debit, credit: contre, montant: l.montant } : { debit: contre, credit: l.credit, montant: l.montant }]);
      }
    }
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
  });

  it('incomplète si seule la clôture des charges et produits est passée, inversée si débit et crédit sont permutés', () => {
    const base = operations();
    expect(diagnostiquerBouclement(base, ex)).toBe('manquante');
    const attendues = ecrituresDeBouclement(base);
    if (!attendues.ok) throw new Error();
    expect(diagnostiquerBouclement(passer(base, 'B1', attendues.valeur[0]!.lignes), ex)).toBe('incomplete');
    let d = base;
    attendues.valeur.forEach((e) => (d = passer(d, 'B', e.lignes.map((l) => ({ debit: l.credit, credit: l.debit, montant: l.montant })))));
    expect(diagnostiquerBouclement(d, ex)).toBe('inversee');
  });

  it('ne pénalise pas deux fois une erreur d\'opération', () => {
    // opération 5 fausse (loyer passé à 1'580 au lieu de 1'850) : le bouclement est jugé sur les comptes de l'élève
    let d = creerDossier(ex, plan);
    ex.corrige!.forEach((c, i) => {
      const lignes = c.piece === '5' ? [{ debit: '6000', credit: '1020', montant: chf(1580) }] : c.lignes;
      const r = ajouterEcriture(d, { id: `E${i + 1}`, date: '2026-03-01', piece: c.piece, libelle: 'x', lignes });
      if (r.ok) d = r.valeur;
    });
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    attendues.valeur.forEach((e) => (d = passer(d, 'B', e.lignes)));
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
  });

  it('une écriture de bouclement extournée ne compte pas', () => {
    let d = passer(operations(), 'B1', [{ debit: '2850', credit: '2800', montant: chf(800) }]);
    const r = extourner(d, d.ecritures.at(-1)!.id, '2026-12-31');
    if (!r.ok) throw new Error();
    d = r.valeur;
    expect(diagnostiquerBouclement(d, ex)).toBe('manquante');
  });

  it('est noté (3 points par défaut) quand l\'enseignant l\'active', () => {
    let d = operations();
    const sans = corrigerCopie(ex, d);
    expect(sans.operations.at(-1)).toMatchObject({ piece: PIECE_BOUCLEMENT, points: 0, max: 3 });
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    attendues.valeur.forEach((e) => (d = passer(d, 'B', e.lignes)));
    const avec = corrigerCopie(ex, d);
    expect(avec.points).toBe(avec.max);
    expect(avec.note).toBe(6);
    const sansBouclement = { ...demoCfc1, parametres: { ...demoCfc1.parametres, corrigerBouclement: false } };
    expect(corrigerCopie(sansBouclement, d).operations.some((o) => o.piece === PIECE_BOUCLEMENT)).toBe(false);
  });
});

/** Lignes qui soldent chaque compte de charges et de produits par le compte de résultat (méthode non enseignée au cours). */
function lignesDeCloture(d: Dossier): LigneEcriture[] {
  const types = new Map(plan.map((c) => [c.numero, c.type]));
  const lignes: LigneEcriture[] = [];
  for (const [n, x] of soldes(d)) {
    const t = types.get(n);
    if ((t !== 'charge' && t !== 'produit') || x.solde === 0) continue;
    lignes.push(x.solde > 0 ? { debit: '9000', credit: n, montant: x.solde } : { debit: n, credit: '9000', montant: -x.solde });
  }
  return lignes;
}

describe('bouclement par le compte de résultat avec clôture des comptes de gestion (audit du 24.11.2026)', () => {
  const virements = (d: Dossier) => {
    const r = ecrituresDeBouclement(d);
    if (!r.ok) throw new Error();
    return r.valeur.map((e) => e.lignes);
  };

  it('clôture complète par 9000, écriture par écriture, puis B1 et B2 : juste, tous les points, note 6', () => {
    const base = operations();
    const attendus = virements(base);
    let d = base;
    for (const l of lignesDeCloture(base)) d = passer(d, 'C', [l]);
    expect(clotureDeGestionPar9000(d, ex).size).toBe(lignesDeCloture(base).length);
    expect(diagnostiquerBouclement(d, ex)).toBe('manquante');
    attendus.forEach((lignes, i) => (d = passer(d, `B${i + 1}`, lignes)));
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
    const copie = corrigerCopie(ex, d);
    expect(copie.operations.at(-1)).toMatchObject({ piece: PIECE_BOUCLEMENT, points: 3, max: 3 });
    expect(copie.points).toBe(copie.max);
    expect(copie.note).toBe(6);
  });

  it('clôture complète passée en deux écritures composées (charges, puis produits) : juste aussi', () => {
    const base = operations();
    const cloture = lignesDeCloture(base);
    const charges = cloture.filter((l) => l.debit === '9000');
    const produits = cloture.filter((l) => l.credit === '9000');
    const total = (ls: LigneEcriture[]) => ls.reduce((t, l) => t + l.montant, 0);
    let d = passer(base, 'C1', [{ debit: '9000', credit: null, montant: total(charges) }, ...charges.map((l) => ({ debit: null, credit: l.credit, montant: l.montant }))]);
    d = passer(d, 'C2', [...produits.map((l) => ({ debit: l.debit, credit: null, montant: l.montant })), { debit: null, credit: '9000', montant: total(produits) }]);
    virements(base).forEach((lignes, i) => (d = passer(d, `B${i + 1}`, lignes)));
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
    expect(corrigerCopie(ex, d).note).toBe(6);
  });

  it('clôture partielle (un compte de charges oublié) : non reconnue, le bouclement reste faux', () => {
    const base = operations();
    let d = base;
    for (const l of lignesDeCloture(base).slice(1)) d = passer(d, 'C', [l]);
    expect(clotureDeGestionPar9000(d, ex).size).toBe(0);
    virements(base).forEach((lignes, i) => (d = passer(d, `B${i + 1}`, lignes)));
    expect(diagnostiquerBouclement(d, ex)).not.toBe('juste');
    expect(corrigerCopie(ex, d).operations.at(-1)).toMatchObject({ piece: PIECE_BOUCLEMENT, max: 3 });
    expect(corrigerCopie(ex, d).operations.at(-1)!.points).toBeLessThan(3);
  });

  it('clôture complète mais virement du résultat faux : le bouclement reste faux', () => {
    const base = operations();
    let d = base;
    for (const l of lignesDeCloture(base)) d = passer(d, 'C', [l]);
    d = passer(d, 'B1', [{ debit: '9000', credit: '2800', montant: chf(3530) }]);
    expect(diagnostiquerBouclement(d, ex)).not.toBe('juste');
  });

  it('la méthode du cours (B1 et B2 seulement) n’est pas touchée', () => {
    const base = operations();
    let d = base;
    virements(base).forEach((lignes, i) => (d = passer(d, `B${i + 1}`, lignes)));
    expect(clotureDeGestionPar9000(d, ex).size).toBe(0);
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
  });
});

describe('bouclement automatique', () => {
  it("n'est jamais corrigé ni noté, même si la correction est cochée", async () => {
    const { bouclementCorrige } = await import('../src/engine/correction-bouclement');
    const { demoCfc1 } = await import('../src/data/demo-cfc1');
    const ex = { ...demoCfc1, parametres: { ...demoCfc1.parametres, corrigerBouclement: true } };
    expect(bouclementCorrige(ex)).toBe(true);
    expect(bouclementCorrige({ ...ex, parametres: { ...ex.parametres, bouclementAutomatique: true } })).toBe(false);
  });
});
