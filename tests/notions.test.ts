import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { plan } from '../src/data/plan';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { analyseParNotion, notionDe } from '../src/engine/notions';
import type { Dossier } from '../src/engine/dossier';

const s = (debit: string, credit: string) => [{ debit, credit, montant: 100 }];

describe('notions du cours', () => {
  it('rattache une opération à sa notion d\'après les comptes', () => {
    expect(notionDe(s('1000', '1020')).id).toBe('bilan');
    expect(notionDe(s('6000', '1020')).id).toBe('charges-produits');
    expect(notionDe(s('1530', '2010')).id).toBe('factures');
    expect(notionDe(s('4200', '2000')).id).toBe('marchandises');
    expect(notionDe(s('2850', '1000')).id).toBe('prive');
    expect(notionDe([{ debit: '6200', credit: null, montant: 100 }, { debit: '1171', credit: null, montant: 8 }, { debit: null, credit: '1020', montant: 108 }]).id).toBe('tva');
  });

  it('bilan de la classe par notion : réussite, élèves à reprendre, erreur typique', () => {
    const copie = (fautes: Record<string, { debit: string; credit: string }>): Dossier => {
      let d = creerDossier(demoCfc1, plan);
      demoCfc1.corrige!.forEach((c, i) => {
        const op = demoCfc1.operations.find((o) => o.numero === c.piece)!;
        const f = fautes[c.piece];
        const lignes = f ? [{ ...f, montant: c.lignes[0]!.montant }] : c.lignes;
        const r = ajouterEcriture(d, { id: `E${i}`, date: op.date, piece: c.piece, libelle: 'x', lignes });
        if (r.ok) d = r.valeur;
      });
      return d;
    };
    // Opération 1 : achat de marchandises à crédit (4200/2000) ; un élève passe 1200 au lieu de 4200.
    const a = analyseParNotion(demoCfc1, [
      { nom: 'Juste Anna', dossier: copie({}) },
      { nom: 'Faux Bob', dossier: copie({ '1': { debit: '1200', credit: '2000' } }) },
    ]);
    const m = a.find((n) => n.notion.id === 'marchandises')!;
    expect(m.pieces).toContain('1');
    expect(m.reussites).toBe(m.total - 1);
    expect(m.erreurFrequente?.eleves).toEqual(['Faux Bob']);
    expect(m.erreurFrequente?.explication).toContain('Achats de marchandises');
  });
});
