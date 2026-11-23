import { describe, expect, it } from 'vitest';
import { MODELES, MODULES, modeleParId } from '../src/data/apprendre';
import { plan } from '../src/data/plan';
import { exercicesDemo } from '../src/data/demos';
import {
  estJuste, genererSerie, raisonnement, seuilMaitrise, sensVariation, variationBilan, type ContexteSerie,
} from '../src/engine/exercices-courts';

const contexte = (id: string): ContexteSerie => {
  const m = MODULES.find((x) => x.id === id)!;
  return { plan, modeles: m.modeles.map(modeleParId), comptes: m.comptes, types: m.types, calculs: m.calculs };
};

describe('parcours Apprendre : contenu', () => {
  it('chaque modèle utilise des comptes CFC 1 du plan, déjà employés ensemble dans un corrigé validé', () => {
    const paires = new Set(
      exercicesDemo.flatMap((e) => (e.corrige ?? []).flatMap((c) => c.lignes.map((l) => `${l.debit}/${l.credit}`))),
    );
    for (const m of MODELES) {
      for (const n of [m.debit, m.credit]) expect(plan.find((c) => c.numero === n)?.niveauMin, `${m.id} ${n}`).toBe('CFC1');
      // Le remboursement d'une dette par un apport vient du tableau du chapitre « Le bilan ».
      if (m.id !== 'dette-par-apport') expect(paires.has(`${m.debit}/${m.credit}`), m.id).toBe(true);
      expect(m.texte).toContain('{m}');
    }
  });

  it('chaque module propose dans ses listes les comptes de ses modèles et un exemple qui lui appartient', () => {
    for (const mod of MODULES) {
      if (mod.calculs) continue;
      expect(mod.modeles).toContain(mod.exemple);
      for (const id of mod.modeles) {
        const m = modeleParId(id);
        expect(m, id).toBeDefined();
        expect(mod.comptes, `${mod.id} ${id}`).toEqual(expect.arrayContaining([m.debit, m.credit]));
      }
    }
  });
});

describe('exercices courts générés', () => {
  it('même graine, même série ; autre graine, autres montants', () => {
    const a = genererSerie(contexte('comptes'), ['ecriture'], 10, 42);
    expect(genererSerie(contexte('comptes'), ['ecriture'], 10, 42)).toEqual(a);
    expect(genererSerie(contexte('comptes'), ['ecriture'], 10, 43)).not.toEqual(a);
  });

  it('chaque module génère 10 questions justes à leur propre réponse, sur 200 graines', () => {
    for (const mod of MODULES) {
      for (let g = 1; g <= 200; g++) {
        const serie = genererSerie(contexte(mod.id), mod.formats, 10, g);
        expect(serie).toHaveLength(10);
        for (const q of serie) {
          switch (q.format) {
            case 'classer': expect(estJuste(q, { format: 'classer', type: q.reponse })).toBe(true); break;
            case 'ecriture':
              expect(q.comptes).toEqual(expect.arrayContaining([q.reponse.debit, q.reponse.credit]));
              expect(estJuste(q, { format: 'ecriture', ...q.reponse })).toBe(true);
              expect(estJuste(q, { format: 'ecriture', debit: q.reponse.credit, credit: q.reponse.debit })).toBe(false);
              break;
            case 'erreur': {
              const fausses = q.lignes.filter((l) => !MODELES.some((m) => l.texte === m.texte.replace('{m}', l.texte.match(/[\d']+\.\d\d/)![0]) && m.debit === l.debit && m.credit === l.credit));
              expect(fausses, mod.id).toHaveLength(1);
              expect(q.lignes.indexOf(fausses[0]!)).toBe(q.reponse);
              break;
            }
            case 'operation': expect(new Set(q.choix).size).toBe(q.choix.length); break;
            case 'solde': expect(q.reponse.montant).toBeGreaterThan(0); break;
            case 'variation': expect(q.reponse).toBeGreaterThanOrEqual(0); break;
          }
        }
      }
    }
  });

  it('variations du bilan et sens des comptes', () => {
    expect(variationBilan(plan, '1530', '2010')).toBe(0);
    expect(variationBilan(plan, '2010', '1010')).toBe(1);
    expect(variationBilan(plan, '1000', '1020')).toBe(2);
    expect(variationBilan(plan, '2400', '2800')).toBe(3);
    expect(variationBilan(plan, '6000', '1020')).toBeNull();
    expect(sensVariation('passif', 'credit')).toBe('augmente');
    expect(sensVariation('charge', 'credit')).toBe('diminue');
  });

  it('solde : actif débiteur, passif créditeur', () => {
    for (let g = 1; g <= 100; g++) {
      for (const q of genererSerie(contexte('comptes'), ['solde'], 3, g)) {
        if (q.format !== 'solde') continue;
        const type = plan.find((c) => c.numero === q.compte)!.type;
        expect(q.reponse.cote).toBe(type === 'actif' ? 'debiteur' : 'crediteur');
      }
    }
  });

  it('raisonnement de l\'exemple travaillé et seuil de maîtrise', () => {
    const r = raisonnement(plan, '1530', '2010');
    expect(r[1]).toContain('il augmente');
    expect(r[1]).toContain('au débit');
    expect(r[2]).toContain('compte de passif');
    expect(seuilMaitrise(10)).toBe(8);
  });
});
