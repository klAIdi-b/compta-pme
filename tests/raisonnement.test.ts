// Raisonnement en trois questions sous la solution du journal (audit du 24.11.2026) : quels comptes, de quel type,
// augmente ou diminue, donc débit ou crédit. Il ne doit jamais contredire le corrigé.
import { describe, expect, it } from 'vitest';
import { exercicesDemo } from '../src/data/demos';
import { raisonnement } from '../src/engine/exercices-courts';
import { compteHorsRaisonnement, raisonnementEcriture } from '../src/engine/raisonnement';
import { plan } from './fixtures';

describe('raisonnement sous la solution', () => {
  it('écriture simple : identique à l’exemple travaillé d’Apprendre', () => {
    expect(raisonnementEcriture(plan, [{ debit: '4200', credit: '2000', montant: 480_000 }])).toEqual(raisonnement(plan, '4200', '2000'));
    expect(raisonnement(plan, '4200', '2000')).toEqual([
      'Comptes touchés : Achats de marchandises et Dettes fournisseurs.',
      'Achats de marchandises : compte de charge, il augmente ; un tel compte augmente au débit → au débit.',
      'Dettes fournisseurs : compte de passif, il augmente ; un tel compte augmente au crédit → au crédit.',
    ]);
  });

  it('écriture composée : chaque compte selon son solde dans l’écriture, débits d’abord', () => {
    const r = raisonnementEcriture(plan, [
      { debit: '1500', credit: null, montant: 300_000 },
      { debit: null, credit: '1000', montant: 100_000 },
      { debit: null, credit: '1020', montant: 200_000 },
    ])!;
    expect(r).toHaveLength(4);
    expect(r[0]).toMatch(/^Comptes touchés : .+, .+ et .+\.$/);
    expect(r.slice(1).map((x) => x.split(' → ')[1])).toEqual(['au débit.', 'au crédit.', 'au crédit.']);
  });

  it('comptes correctifs et compte de résultat : pas de raisonnement automatique', () => {
    expect(raisonnementEcriture(plan, [{ debit: '6800', credit: '1539', montant: 100_000 }])).toBeNull();
    expect(raisonnementEcriture(plan, [{ debit: '3805', credit: '1109', montant: 100_000 }])).toBeNull();
    expect(raisonnementEcriture(plan, [{ debit: '9000', credit: '2850', montant: 100_000 }])).toBeNull();
    expect(['1109', '1509', '1539', '3209', '4209', '3805', '4280', '2970'].every(compteHorsRaisonnement)).toBe(true);
    expect(['1100', '1500', '1020', '2850', '3200', '4200'].some(compteHorsRaisonnement)).toBe(false);
  });

  it('sur tous les corrigés fournis : chaque compte est annoncé du côté où le corrigé le passe', () => {
    let avec = 0;
    for (const ex of exercicesDemo) {
      for (const c of ex.corrige ?? []) {
        const r = raisonnementEcriture(plan, c.lignes);
        if (!r) continue;
        avec++;
        const net = new Map<string, number>();
        for (const l of c.lignes) {
          if (l.debit) net.set(l.debit, (net.get(l.debit) ?? 0) + l.montant);
          if (l.credit) net.set(l.credit, (net.get(l.credit) ?? 0) - l.montant);
        }
        for (const [n, s] of net) {
          if (s === 0) continue;
          const nom = plan.find((x) => x.numero === n)!.intitule;
          const etape = r.slice(1).find((x) => x.startsWith(`${nom} : `));
          expect(etape, `${ex.id}, pièce ${c.piece}, ${n}`).toBeDefined();
          expect(etape!.endsWith(s > 0 ? '→ au débit.' : '→ au crédit.'), `${ex.id}, pièce ${c.piece}, ${n}`).toBe(true);
        }
      }
    }
    expect(avec).toBeGreaterThan(300);
  });
});
