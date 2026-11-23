import { describe, expect, it } from 'vitest';
import { exercicesDemo } from '../src/data/demos';
import { CHAPITRES } from '../src/data/theorie';
import { MODELES } from '../src/data/apprendre';

// Règle de l'école (22.11.2026) : 2000 Dettes fournisseurs seulement pour des marchandises achetées pour être
// revendues ; 2010 Autres dettes pour les investissements et toutes les autres factures (services, frais).
const MARCHANDISES = new Set(['4200', '1170', '2000']);

describe('règle 2000 / 2010 dans tous les corrigés', () => {
  it('2000 crédité seulement pour des achats de marchandises ; 2010 jamais pour des marchandises', () => {
    const fautes: string[] = [];
    for (const ex of exercicesDemo) {
      for (const c of ex.corrige ?? []) {
        const debits = c.lignes.filter((l) => l.debit).map((l) => l.debit!);
        const credits = c.lignes.filter((l) => l.credit).map((l) => l.credit!);
        if (credits.includes('2000') && debits.some((d) => !MARCHANDISES.has(d))) fautes.push(`${ex.id} pièce ${c.piece} : 2000`);
        if (credits.includes('2010') && debits.includes('4200')) fautes.push(`${ex.id} pièce ${c.piece} : 2010`);
      }
    }
    expect(fautes).toEqual([]);
  });

  it('même règle dans la théorie et dans les modèles du parcours Apprendre', () => {
    const lignes = [
      ...CHAPITRES.flatMap((ch) => ch.sections.flatMap((s) => s.blocs.flatMap((b) => (b.type === 'ecritures' ? b.exemples.map((e) => e.lignes) : [])))),
      ...MODELES.map((m) => [{ debit: m.debit, credit: m.credit, montant: 1 }]),
    ];
    for (const l of lignes) {
      const debits = l.filter((x) => x.debit).map((x) => x.debit!);
      const credits = l.filter((x) => x.credit).map((x) => x.credit!);
      if (credits.includes('2000')) expect(debits.every((d) => MARCHANDISES.has(d)), JSON.stringify(l)).toBe(true);
      if (credits.includes('2010')) expect(debits.includes('4200'), JSON.stringify(l)).toBe(false);
    }
  });
});
