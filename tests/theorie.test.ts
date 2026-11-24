import { describe, expect, it } from 'vitest';
import { CHAPITRES, CHAPITRES_VALIDES, chapitresDuNiveau, type Bloc, type LigneExemple } from '../src/data/theorie';
import { MODULES } from '../src/data/apprendre';
import { exercicesDemo } from '../src/data/demos';
import { IDS_ERREURS_TYPIQUES } from '../src/engine/erreurs-typiques';
import { comptesDuNiveau } from '../src/engine/plan';
import { plan } from './fixtures';

const centimes = (francs: number) => Math.round(francs * 100);

/** Toutes les écritures d'un bloc, quel que soit son type (exemples, exemple résolu et sa variante, cas contrastés). */
function ecrituresDe(b: Bloc): { cas: string; lignes: LigneExemple[] }[] {
  if (b.type === 'ecritures') return b.exemples;
  if (b.type === 'exemple') {
    // Un exemple résolu peut enchaîner plusieurs écritures simples (B1 puis B2) : chacune est équilibrée séparément.
    const simples = (b.lignes ?? []).every((l) => l.debit && l.credit);
    const principal = simples ? (b.lignes ?? []).map((l, i) => ({ cas: `${b.enonce} (${i + 1})`, lignes: [l] })) : [{ cas: b.enonce, lignes: b.lignes ?? [] }];
    return [...principal, ...(b.variante?.lignes ? [{ cas: b.variante.enonce, lignes: b.variante.lignes }] : [])];
  }
  if (b.type === 'contraste') return b.cas.filter((c) => c.lignes).map((c) => ({ cas: c.titre, lignes: c.lignes! }));
  return [];
}

describe('théorie', () => {
  it('affiche les chapitres de façon cumulative : CFC1 ⊂ CFC2 ⊂ MP', () => {
    const c1 = chapitresDuNiveau('CFC1').map((c) => c.id);
    const c2 = chapitresDuNiveau('CFC2').map((c) => c.id);
    const mp = chapitresDuNiveau('MP').map((c) => c.id);
    expect(c1).toEqual(['cadre-legal', 'bilan', 'comptes', 'journal', 'credit', 'resultat', 'prive', 'marchandises', 'prix']);
    expect(mp).toContain('evaluation');
    expect(c2.slice(0, c1.length)).toEqual(c1);
    expect(c2).toContain('tva');
    expect(c2).not.toContain('societes');
    expect(mp).toHaveLength(CHAPITRES.length);
  });

  it('les identifiants de chapitre sont uniques', () => {
    expect(new Set(CHAPITRES.map((c) => c.id)).size).toBe(CHAPITRES.length);
  });

  it("chaque exemple d'écriture est équilibré et n'utilise que des comptes du plan disponibles au niveau du chapitre", () => {
    for (const ch of CHAPITRES) {
      const dispo = new Set(comptesDuNiveau(plan, ch.niveau).map((c) => c.numero));
      for (const sec of ch.sections) {
        for (const b of sec.blocs) {
          for (const ex of ecrituresDe(b)) {
            let debit = 0;
            let credit = 0;
            for (const l of ex.lignes) {
              expect(Number.isInteger(centimes(l.montant) / 5), `${ch.id} — ${ex.cas} : montant arrondi aux 5 centimes`).toBe(true);
              for (const n of [l.debit, l.credit]) {
                if (n) expect(dispo.has(n), `${ch.id} — ${ex.cas} : compte ${n}`).toBe(true);
              }
              if (l.debit) debit += centimes(l.montant);
              if (l.credit) credit += centimes(l.montant);
            }
            expect(debit, `${ch.id} — ${ex.cas}`).toBe(credit);
          }
        }
      }
    }
  });
});

describe('théorie enrichie (modèle du 24.11.2026)', () => {
  const enrichis = CHAPITRES.filter((c) => c.objectifs?.length);

  it('validés par l’enseignant le 24.11.2026 : plus aucun chapitre ne porte la mention « à relire »', () => {
    expect(CHAPITRES.filter((c) => c.aRelire).map((c) => c.id)).toEqual([]);
  });
  const blocs = (c: (typeof CHAPITRES)[number]) => c.sections.flatMap((s) => s.blocs);

  it('les neuf chapitres de 1ère CFC sont enrichis', () => {
    expect(enrichis.filter((c) => c.niveau === 'CFC1').map((c) => c.id)).toEqual(['cadre-legal', 'bilan', 'comptes', 'journal', 'credit', 'resultat', 'prive', 'marchandises', 'prix']);
  });

  it('les huit chapitres de 2ème CFC sont enrichis, dont trois nouveaux placés après les salaires', () => {
    expect(enrichis.filter((c) => c.niveau === 'CFC2').map((c) => c.id)).toEqual(['tva', 'amortissements', 'transitoires', 'creances', 'salaires', 'facturation', 'budget', 'couts']);
  });

  it('les treize chapitres de maturité sont enrichis, dont la comptabilité analytique, et plus aucun chapitre ne reste sans enrichissement', () => {
    expect(enrichis.filter((c) => c.niveau === 'MP').map((c) => c.id)).toEqual(['monnaies', 'proprietaire', 'societes', 'provisions', 'titres', 'immeubles', 'interets', 'evaluation', 'resultat-degres', 'flux', 'seuil', 'analytique', 'analyse']);
    expect(enrichis).toHaveLength(CHAPITRES.length);
  });

  it('aucun bloc validé n’est perdu : chacun est repris tel quel dans un chapitre enrichi', () => {
    const texte = JSON.stringify(CHAPITRES);
    for (const c of CHAPITRES_VALIDES) for (const s of c.sections) for (const b of s.blocs) expect(texte.includes(JSON.stringify(b)), `${c.id} — ${s.titre}`).toBe(true);
  });

  it('chaque chapitre enrichi a des objectifs, des termes, des erreurs, des questions et des liens', () => {
    for (const c of enrichis) {
      expect(c.objectifs?.length, c.id).toBeGreaterThanOrEqual(2);
      const types = new Set<string>(blocs(c).map((b) => b.type));
      for (const t of ['definitions', 'erreurs', 'questions', 'liens']) expect(types.has(t), `${c.id} — ${t}`).toBe(true);
      expect(types.has('exemple') || types.has('contraste'), `${c.id} — exemple ou contraste`).toBe(true);
      for (const b of blocs(c)) {
        if (b.type !== 'questions') continue;
        expect(b.items.length, c.id).toBeGreaterThanOrEqual(3);
        expect(b.items.length, c.id).toBeLessThanOrEqual(5);
        for (const q of b.items) expect(q.reponse.trim().length, `${c.id} — ${q.question}`).toBeGreaterThan(5);
      }
    }
  });

  it('les liens renvoient à des modules, des exercices et des erreurs typiques qui existent', () => {
    const modules = new Set(MODULES.map((m) => m.id));
    const exercices = new Set(exercicesDemo.map((e) => e.id));
    const typiques = new Set(IDS_ERREURS_TYPIQUES);
    for (const c of enrichis) for (const b of blocs(c)) {
      if (b.type === 'liens') {
        if (b.module) expect(modules.has(b.module), `${c.id} — module ${b.module}`).toBe(true);
        for (const id of b.exercices ?? []) expect(exercices.has(id), `${c.id} — exercice ${id}`).toBe(true);
      }
      if (b.type === 'erreurs') for (const x of b.items) if (x.typique) expect(typiques.has(x.typique), `${c.id} — erreur ${x.typique}`).toBe(true);
    }
  });

  it('comptes en T équilibrés et bilans dessinés égaux des deux côtés, avec des comptes du plan', () => {
    const numeros = new Set(plan.map((c) => c.numero));
    const intitules = plan.map((c) => c.intitule);
    const somme = (x: { montant: number }[]) => x.reduce((t, y) => t + centimes(y.montant), 0);
    for (const c of enrichis) for (const b of blocs(c)) {
      if (b.type === 'compteT') {
        expect(numeros.has(b.compte), `${c.id} — compte ${b.compte}`).toBe(true);
        expect(somme(b.debit), `${c.id} — compte en T ${b.compte}`).toBe(somme(b.credit));
      }
      if (b.type === 'bilan') {
        expect(somme(b.actif), `${c.id} — ${b.titre}`).toBe(somme(b.passif));
        for (const x of [...b.actif, ...b.passif]) expect(intitules.some((i) => i === x.libelle || i.startsWith(`${x.libelle} (`)), `${c.id} — ${x.libelle}`).toBe(true);
      }
    }
  });

  it('les réponses chiffrées des exemples résolus concordent avec leurs écritures', () => {
    const exemple = (id: string, extrait: string) => {
      const b = blocs(CHAPITRES.find((c) => c.id === id)!).find((x) => x.type === 'exemple' && x.enonce.includes(extrait));
      return b?.type === 'exemple' ? (b.lignes ?? []).map((l) => l.montant) : [];
    };
    // Bouclement : le solde du privé viré au capital = bénéfice − prélèvements.
    expect(exemple('prive', '64')).toEqual([3530, 1710]);
    expect(3530 - 1820).toBe(1710);
    // Escompte : montant payé + escompte = dette éteinte.
    expect(exemple('marchandises', '2 %')).toEqual([4800, 4704, 96]);
    expect(4704 + 96).toBe(4800);
    // Écriture composée : le solde payé par la banque complète le versement en espèces.
    expect(exemple('journal', 'ordinateur')).toEqual([2400, 1000, 1400]);
  });
});

describe('lien de l’indice vers la théorie', () => {
  it('reconnaît le thème d’après les comptes du corrigé, dans les chapitres du niveau', async () => {
    const { chapitrePourComptes } = await import('../src/data/theorie');
    expect(chapitrePourComptes(['1100', '3200', '2200'], 'CFC2')?.id).toBe('tva');
    expect(chapitrePourComptes(['6800', '1509'], 'CFC2')?.id).toBe('amortissements');
    expect(chapitrePourComptes(['1060', '1020'], 'MP')?.id).toBe('titres');
    // Chapitre hors niveau : on retombe sur le journal.
    expect(chapitrePourComptes(['1060', '1020'], 'CFC1')?.id).toBe('journal');
  });
});

describe('sommaire de la théorie (chargé avec le journal)', () => {
  it('reste identique aux chapitres', async () => {
    const { SOMMAIRE } = await import('../src/data/theorie-index');
    expect(SOMMAIRE).toEqual(CHAPITRES.map((c) => ({ id: c.id, titre: c.titre, niveau: c.niveau })));
  });
});
