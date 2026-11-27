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
    expect(notionDe([{ debit: '6200', credit: null, montant: 100 }, { debit: '1171', credit: null, montant: 8 }, { debit: null, credit: '1020', montant: 108 }]).id).toBe('charges-produits');
  });

  // Relecture guidée du 27.11.2026 (lot 1) : rangement par nature, TVA seulement pour ses opérations propres.
  it('TVA : décompte et paiement à l’AFC ; une opération avec TVA est rangée par sa nature', () => {
    expect(notionDe([{ debit: '4200', credit: null, montant: 100 }, { debit: '1170', credit: null, montant: 8 }, { debit: null, credit: '2000', montant: 108 }]).id).toBe('marchandises');
    expect(notionDe(s('2200', '1170')).id).toBe('tva');
    expect(notionDe([{ debit: '2200', credit: null, montant: 100 }, { debit: null, credit: '1170', montant: 60 }, { debit: null, credit: '2205', montant: 40 }]).id).toBe('tva');
    expect(notionDe(s('2205', '1020')).id).toBe('tva');
  });
  it('dividende et impôt anticipé : sociétés, pas TVA', () => {
    expect(notionDe([{ debit: '2230', credit: null, montant: 100 }, { debit: null, credit: '1020', montant: 65 }, { debit: null, credit: '2205', montant: 35 }]).id).toBe('societes');
    expect(notionDe(s('2205', '1020'), { texte: "Versement de l'impôt anticipé à l'AFC" }).id).toBe('societes');
  });
  it('salaire en 1ère CFC : charges et produits ; intérêts : notion propre en maturité seulement', () => {
    expect(notionDe(s('5200', '1020'), { niveau: 'CFC1' }).id).toBe('charges-produits');
    expect(notionDe(s('5200', '1020'), { niveau: 'CFC2' }).id).toBe('salaires');
    expect(notionDe(s('6900', '1020'), { niveau: 'MP' }).id).toBe('interets');
    expect(notionDe(s('6900', '1020'), { niveau: 'CFC2' }).id).toBe('charges-produits');
    // Intérêt du capital de l'exploitant : compte privé.
    expect(notionDe(s('6900', '2850'), { niveau: 'MP' }).id).toBe('prive');
  });
  it('dossier de pièces : versement de l’impôt anticipé rangé en sociétés, même sans le mot dans le titre de la pièce', async () => {
    const { exercicesDemo } = await import('../src/data/demos');
    const ex = exercicesDemo.find((e) => e.id === 'dossier-mp3-optique-rhone-sa')!;
    let d = creerDossier(ex, plan);
    ex.corrige!.forEach((c, i) => {
      const r = ajouterEcriture(d, { id: `E${i}`, date: ex.debut, piece: c.piece, libelle: 'x', lignes: c.lignes });
      if (r.ok) d = r.valeur;
    });
    const c = ex.corrige!.find((x) => x.piece === '3')!;
    expect(c.lignes.some((l) => l.debit === '2205')).toBe(true);
    const a = analyseParNotion(ex, [{ nom: 'Juste Anna', dossier: d }]);
    expect(a.find((n) => n.notion.id === 'societes')!.pieces).toContain('3');
    expect(a.find((n) => n.notion.id === 'tva')).toBeUndefined();
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
