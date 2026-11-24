// « Bilan en direct » : les blocs affichés reprennent exactement le bilan du moteur.
// Régression de l'audit du 24.11.2026 : la perte de l'exercice était comptée deux fois, et l'écran annonçait
// « le bilan n'est plus équilibré » après une écriture juste (157 états sur 541 dans les corrigés fournis).
import { describe, expect, it } from 'vitest';
import { exercicesDemo } from '../src/data/demos';
import { TITRE_PERTE, bilanEnBlocs, effetEcriture } from '../src/engine/bilan-vivant';
import type { Dossier } from '../src/engine/dossier';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { bilan } from '../src/engine/statements';
import { plan } from './fixtures';

const somme = (x: { montant: number }[]) => x.reduce((t, k) => t + k.montant, 0);

/** Rejoue le corrigé d'un exercice, écriture par écriture, et rend chaque état avec celui qui le précède. */
function* etats(id: string): Generator<{ piece: string; avant: Dossier; apres: Dossier }> {
  const ex = exercicesDemo.find((e) => e.id === id)!;
  let d = creerDossier(ex, plan);
  for (const [i, c] of (ex.corrige ?? []).entries()) {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: ex.debut, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(`${id}, pièce ${c.piece} : ${r.erreurs.join(' ')}`);
    yield { piece: c.piece, avant: d, apres: r.valeur };
    d = r.valeur;
  }
}

describe('bilan en direct', () => {
  it('démonstration de 1ère CFC, opération 1 (achat de marchandises à crédit, 4’800.00) : 97’800.00 des deux côtés', () => {
    const { avant, apres } = etats('demo-cfc1-cycles-du-leman').next().value!;
    const b = bilan(apres);
    const blocs = bilanEnBlocs(b, bilan(avant));
    expect(blocs.totalActif).toBe(9_780_000);
    expect(blocs.totalPassif).toBe(9_780_000);
    // La perte figure une seule fois, à l'actif, avec sa variation.
    const pertes = blocs.actif.filter((k) => k.classe === 'perte');
    expect(pertes).toEqual([{ titre: TITRE_PERTE, montant: 480_000, avant: 0, classe: 'perte' }]);
    expect(somme(blocs.actif)).toBe(9_780_000);
    expect(effetEcriture(b, bilan(avant))).toEqual({ genre: 'ensemble', sens: 'hausse', montant: 480_000 });
  });

  it('sur tous les corrigés fournis, après chaque écriture : blocs = totaux du moteur, actif = passif, jamais « déséquilibré »', () => {
    let nb = 0;
    let avecPerte = 0;
    for (const ex of exercicesDemo) {
      if (!ex.corrige?.length) continue;
      for (const { piece, avant, apres } of etats(ex.id)) {
        const b = bilan(apres);
        const ref = bilan(avant);
        const blocs = bilanEnBlocs(b, ref);
        const ou = `${ex.id}, pièce ${piece}`;
        expect(somme(blocs.actif), ou).toBe(b.totalActif);
        expect(somme(blocs.passif), ou).toBe(b.totalPassif);
        expect(blocs.totalActif, ou).toBe(blocs.totalPassif);
        // Une perte en cours : un seul bloc. Une perte qui vient de disparaître reste affichée à zéro, avec sa variation.
        expect(blocs.actif.filter((k) => k.classe === 'perte' && k.montant > 0).length, ou).toBe(b.resultat < 0 ? 1 : 0);
        expect(blocs.actif.filter((k) => k.classe === 'perte').length, ou).toBeLessThanOrEqual(1);
        expect(effetEcriture(b, ref).genre, ou).not.toBe('desequilibre');
        // La variation totale des blocs est celle des totaux du moteur.
        expect(somme(blocs.actif) - blocs.actif.reduce((t, k) => t + k.avant, 0), ou).toBe(b.totalActif - ref.totalActif);
        expect(somme(blocs.passif) - blocs.passif.reduce((t, k) => t + k.avant, 0), ou).toBe(b.totalPassif - ref.totalPassif);
        nb++;
        if (b.resultat < 0) avecPerte++;
      }
    }
    // Garde-fou : le contrôle porte bien sur plusieurs centaines d'états, dont ceux où l'exercice est en perte.
    expect(nb).toBeGreaterThan(500);
    expect(avecPerte).toBeGreaterThan(100);
  });

  it('une charge payée par la banque pendant une perte : le total ne change pas (la banque diminue, la perte augmente)', () => {
    const ex = exercicesDemo.find((e) => e.id === 'demo-cfc1-cycles-du-leman')!;
    const d0 = creerDossier(ex, plan);
    const r = ajouterEcriture(d0, { id: 'E1', date: ex.debut, piece: 'X', libelle: 'Loyer', lignes: [{ debit: '6000', credit: '1020', montant: 185_000 }] });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    expect(effetEcriture(bilan(r.valeur), bilan(d0))).toEqual({ genre: 'permutation' });
  });

  it('sans écriture précédente, aucun bloc n’affiche de variation', () => {
    const ex = exercicesDemo.find((e) => e.id === 'demo-cfc1-cycles-du-leman')!;
    const blocs = bilanEnBlocs(bilan(creerDossier(ex, plan)), null);
    for (const k of [...blocs.actif, ...blocs.passif]) expect(k.montant - k.avant).toBe(0);
  });
});
