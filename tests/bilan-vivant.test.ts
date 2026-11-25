// « Bilan en direct » : les blocs affichés reprennent exactement le bilan du moteur.
// Régression de l'audit du 24.11.2026 : la perte de l'exercice était comptée deux fois, et l'écran annonçait
// « le bilan n'est plus équilibré » après une écriture juste (157 états sur 541 dans les corrigés fournis).
// Remarque de l'enseignant du 25.11.2026 : ne pas laisser croire à un débutant qu'un achat est une perte. Le résultat
// du moment est montré à part (perte ou bénéfice provisoire) et l'écriture est décrite compte par compte.
import { describe, expect, it } from 'vitest';
import { exercicesDemo } from '../src/data/demos';
import { TITRE_BENEFICE, TITRE_PERTE, bilanEnBlocs, effetEcriture } from '../src/engine/bilan-vivant';
import type { Dossier, Ecriture } from '../src/engine/dossier';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { bilan } from '../src/engine/statements';
import { plan } from './fixtures';

const somme = (x: { montant: number }[]) => x.reduce((t, k) => t + k.montant, 0);

/** Rejoue le corrigé d'un exercice, écriture par écriture, et rend chaque état avec celui qui le précède. */
function* etats(id: string): Generator<{ piece: string; ecriture: Ecriture; avant: Dossier; apres: Dossier }> {
  const ex = exercicesDemo.find((e) => e.id === id)!;
  let d = creerDossier(ex, plan);
  for (const [i, c] of (ex.corrige ?? []).entries()) {
    const ecriture = { id: `E${i + 1}`, date: ex.debut, piece: c.piece, libelle: 'x', lignes: c.lignes };
    const r = ajouterEcriture(d, ecriture);
    if (!r.ok) throw new Error(`${id}, pièce ${c.piece} : ${r.erreurs.join(' ')}`);
    yield { piece: c.piece, ecriture, avant: d, apres: r.valeur };
    d = r.valeur;
  }
}

describe('bilan en direct', () => {
  it('démonstration de 1ère CFC, opération 1 (achat de marchandises à crédit, 4’800.00) : une charge et une dette, une perte provisoire', () => {
    const { ecriture, avant, apres } = etats('demo-cfc1-cycles-du-leman').next().value!;
    const b = bilan(apres);
    const blocs = bilanEnBlocs(b, bilan(avant));
    expect(blocs.totalActif).toBe(9_780_000);
    expect(blocs.totalPassif).toBe(9_780_000);
    // La perte figure une seule fois, à l'actif, sous le nom de perte provisoire.
    expect(blocs.actif.filter((k) => k.classe === 'perte')).toEqual([{ titre: TITRE_PERTE, montant: 480_000, avant: 0, classe: 'perte' }]);
    const e = effetEcriture(ecriture, apres, b, bilan(avant));
    expect(e.mouvements.map((x) => [x.numero, x.type, x.variation])).toEqual([
      ['4200', 'charge', 480_000],
      ['2000', 'passif', 480_000],
    ]);
    expect(e.resultat).toEqual({ genre: 'change', avant: 0, apres: -480_000 });
    // Le message ne compare plus les totaux du bilan quand une charge ou un produit est touché.
    expect(e.bilan).toBeNull();
  });

  it('opération 2 (vente au comptant, 12’350.00) : la caisse augmente du montant de la vente, la perte devient un bénéfice provisoire', () => {
    const suite = etats('demo-cfc1-cycles-du-leman');
    suite.next();
    const { ecriture, avant, apres } = suite.next().value!;
    const b = bilan(apres);
    const e = effetEcriture(ecriture, apres, b, bilan(avant));
    expect(e.mouvements.map((x) => [x.type, x.variation])).toEqual([
      ['actif', 1_235_000],
      ['produit', 1_235_000],
    ]);
    expect(e.resultat).toEqual({ genre: 'change', avant: -480_000, apres: 755_000 });
    const blocs = bilanEnBlocs(b, bilan(avant));
    // Le bénéfice provisoire est montré à côté des capitaux propres, qui gardent leur montant d'ouverture.
    expect(blocs.passif.find((k) => k.titre === TITRE_BENEFICE)).toMatchObject({ montant: 755_000, avant: 0, classe: 'benefice' });
    expect(blocs.passif.find((k) => k.titre === 'Capitaux propres')).toMatchObject({ montant: 5_540_000, avant: 5_540_000 });
    expect(blocs.actif.find((k) => k.titre === TITRE_PERTE)).toMatchObject({ montant: 0, avant: 480_000 });
  });

  it('sur tous les corrigés fournis, après chaque écriture : blocs = totaux du moteur, actif = passif, jamais « déséquilibré »', () => {
    let nb = 0;
    let avecPerte = 0;
    let avecBenefice = 0;
    for (const ex of exercicesDemo) {
      if (!ex.corrige?.length) continue;
      for (const { piece, ecriture, avant, apres } of etats(ex.id)) {
        const b = bilan(apres);
        const ref = bilan(avant);
        const blocs = bilanEnBlocs(b, ref);
        const ou = `${ex.id}, pièce ${piece}`;
        expect(somme(blocs.actif), ou).toBe(b.totalActif);
        expect(somme(blocs.passif), ou).toBe(b.totalPassif);
        expect(blocs.totalActif, ou).toBe(blocs.totalPassif);
        // Un seul bloc de résultat en cours, du bon côté ; un bloc qui vient de disparaître reste affiché à zéro.
        expect(blocs.actif.filter((k) => k.classe === 'perte' && k.montant > 0).length, ou).toBe(b.resultat < 0 ? 1 : 0);
        expect(blocs.passif.filter((k) => k.classe === 'benefice' && k.montant > 0).length, ou).toBe(b.resultat > 0 ? 1 : 0);
        const e = effetEcriture(ecriture, apres, b, ref);
        expect(e.bilan?.genre, ou).not.toBe('desequilibre');
        // Chaque compte touché (hors compte de résultat 9000) est décrit, dans sa catégorie du cours.
        expect(e.mouvements.every((x) => ['actif', 'passif', 'charge', 'produit'].includes(x.type)), ou).toBe(true);
        // La variation totale des blocs est celle des totaux du moteur.
        expect(somme(blocs.actif) - blocs.actif.reduce((t, k) => t + k.avant, 0), ou).toBe(b.totalActif - ref.totalActif);
        expect(somme(blocs.passif) - blocs.passif.reduce((t, k) => t + k.avant, 0), ou).toBe(b.totalPassif - ref.totalPassif);
        nb++;
        if (b.resultat < 0) avecPerte++;
        if (b.resultat > 0) avecBenefice++;
      }
    }
    // Garde-fou : le contrôle porte bien sur plusieurs centaines d'états, en perte comme en bénéfice.
    expect(nb).toBeGreaterThan(500);
    expect(avecPerte).toBeGreaterThan(100);
    expect(avecBenefice).toBeGreaterThan(100);
  });

  it('écriture qui ne touche que des comptes du bilan : l’effet est décrit sur le bilan (permutation)', () => {
    const ex = exercicesDemo.find((e) => e.id === 'demo-cfc1-cycles-du-leman')!;
    const d0 = creerDossier(ex, plan);
    const ecriture = { id: 'E1', date: ex.debut, piece: 'X', libelle: 'Retrait', lignes: [{ debit: '1000', credit: '1020', montant: 50_000 }] };
    const r = ajouterEcriture(d0, ecriture);
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    const e = effetEcriture(ecriture, r.valeur, bilan(r.valeur), bilan(d0));
    expect(e.resultat).toEqual({ genre: 'aucun' });
    expect(e.bilan).toEqual({ genre: 'permutation' });
  });

  it('écriture de bouclement : le résultat est viré, il ne figure plus à part', () => {
    const ex = exercicesDemo.find((e) => e.id === 'demo-cfc1-cycles-du-leman')!;
    let d = creerDossier(ex, plan);
    for (const [i, c] of ex.corrige!.entries()) {
      const r = ajouterEcriture(d, { id: `E${i}`, date: ex.debut, piece: c.piece, libelle: 'x', lignes: c.lignes });
      if (!r.ok) throw new Error(r.erreurs.join(' '));
      d = r.valeur;
    }
    const ecriture = { id: 'B1', date: ex.fin, piece: 'B1', libelle: 'Bouclement', lignes: [{ debit: '9000', credit: '2850', montant: 353_000 }] };
    const r = ajouterEcriture(d, ecriture);
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    const e = effetEcriture(ecriture, r.valeur, bilan(r.valeur), bilan(d));
    expect(e.resultat).toEqual({ genre: 'vire', montant: 353_000 });
    expect(e.mouvements.map((x) => x.numero)).toEqual(['2850']);
  });

  it('sans écriture précédente, aucun bloc n’affiche de variation', () => {
    const ex = exercicesDemo.find((e) => e.id === 'demo-cfc1-cycles-du-leman')!;
    const blocs = bilanEnBlocs(bilan(creerDossier(ex, plan)), null);
    for (const k of [...blocs.actif, ...blocs.passif]) expect(k.montant - k.avant).toBe(0);
  });
});
