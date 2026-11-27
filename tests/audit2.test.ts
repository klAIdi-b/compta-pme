// Corrections du second audit (26.11.2026, rapport AUDIT_COMPTA_PME_2.md) : chaque test reprend un constat.
import { describe, expect, it } from 'vitest';
import { champJuste, genererCalcul } from '../src/engine/calculs';
import { controlerChamp, textesProches } from '../src/engine/champs';
import { diagnostiquer, enregistrerTentative, indiceNiveau2, INDICES, solutionDisponible } from '../src/engine/correction';
import { erreurTypique } from '../src/engine/erreurs-typiques';
import type { Ecriture, LigneEcriture } from '../src/engine/dossier';
import { creerDossier, controlerExercice, type EcritureCorrigee } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { corrigerCopie } from '../src/engine/notation';
import { PIECE_BOUCLEMENT } from '../src/engine/correction-bouclement';
import { piecesIncoherentes, varianteExercice, varianteSure } from '../src/engine/variante';
import { alertesCopie, copiesIdentiques } from '../src/engine/reprise';
import { etatNotion } from '../src/engine/revision';
import { bilanSerie, genererSerie, hasard, questionsRevision, revisionReussie } from '../src/engine/exercices-courts';
import { exporterExercice } from '../src/io/fichiers';
import { exercicesDemo } from '../src/data/demos';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { manuelGolay, manuelVuilleumier } from '../src/data/exercices-manuel';
import { dossierFacturationLeman } from '../src/data/dossiers/cfc-facturation';
import { MODULES, modeleParId } from '../src/data/apprendre';
import { chf, plan } from './fixtures';

let n = 0;
const e = (piece: string, lignes: LigneEcriture[]): Ecriture => ({ id: `A${++n}`, date: '2026-03-01', piece, libelle: 'x', lignes });
const D = (c: string, f: number): LigneEcriture => ({ debit: c, credit: null, montant: chf(f) });
const C = (c: string, f: number): LigneEcriture => ({ debit: null, credit: c, montant: chf(f) });
const S = (d: string, c: string, f: number): LigneEcriture => ({ debit: d, credit: c, montant: chf(f) });

describe('réponses justes acceptées (F1)', () => {
  const champ = { libelle: 'Montant', type: 'chf' as const, attendu: 123450, tolerance: 5 };
  it.each(["1'234.50", '1’234.50', '1 234.50', 'CHF 1234.50', '1234.50 CHF', '1234,50'])('« %s » est juste', (saisie) => {
    expect(champJuste(champ, saisie)).toBe(true);
  });
  it('les fiches acceptent aussi l’apostrophe typographique et « CHF »', () => {
    expect(controlerChamp({ cle: 'x', libelle: 'x', type: 'chf', attendu: 123450 }, 'CHF 1’234.50')).toBe(true);
    expect(controlerChamp({ cle: 'x', libelle: 'x', type: 'pc', attendu: 12.5 }, '12,5 %')).toBe(true);
  });
});

describe('diagnostic « incomplète » et écriture nette (F2)', () => {
  const reprise: EcritureCorrigee = manuelGolay.corrige!.find((c) => c.piece === '14')!;
  it('une écriture nette est signalée comme telle, et comptée comme un essai', () => {
    const nette = [e('14', [S('1530', '1020', 24000)])];
    const d = diagnostiquer(nette, reprise);
    expect(d).toBe('nette');
    const suivi = enregistrerTentative({}, '14', d);
    expect(suivi['14']!.essais).toBe(1);
    expect(solutionDisponible(suivi['14'])).toBe(true);
  });
  it('« incomplète » propose la solution et dit qu’un montant peut être trop faible', () => {
    const suivi = enregistrerTentative({}, '14', 'incomplete');
    expect(suivi['14']!.essais).toBe(0);
    expect(solutionDisponible(suivi['14'])).toBe(true);
    expect(INDICES.incomplete).toMatch(/montant net au lieu du montant brut/);
  });
  it('côtés inversés et compte faux : on le dit', () => {
    const vente: EcritureCorrigee = { piece: '1', lignes: [S('1000', '3200', 500)] };
    expect(diagnostiquer([e('1', [S('3200', '1020', 500)])], vente)).toBe('inversee_compte');
  });
  it('indice du 2e niveau : la forme de l’écriture, sans les comptes', () => {
    expect(indiceNiveau2(reprise)).toBe("L'écriture attendue touche 1 compte au débit et 2 comptes au crédit.");
  });
});

describe('explications des erreurs typiques (F3, PED3-05)', () => {
  it('paiement d’une facture d’investissement passé en charge : plus de « charge déjà comptabilisée »', () => {
    const r = erreurTypique([S('6500', '1010', 1000)], [S('2010', '1010', 1000)]);
    expect(r?.id).toBe('paiement-en-charge');
    expect(r?.explication).not.toMatch(/charge a déjà été comptabilisée/);
  });
  it.each([
    [[S('1170', '1020', 10)], [S('1171', '1020', 10)], 'impot-prealable-investissement'],
    [[S('6800', '1510', 10)], [S('6800', '1519', 10)], 'amortissement-direct-au-lieu-indirect'],
    [[S('3805', '1100', 10)], [S('3805', '1109', 10)], 'ducroire-en-creances'],
    [[S('2300', '6000', 10)], [S('1300', '6000', 10)], 'actif-transitoire'],
  ])('2ème CFC : %#', (eleve, corrige, id) => {
    expect(erreurTypique(eleve, corrige)?.id).toBe(id);
  });
});

describe('compte courant : impôt anticipé seulement au-dessus de 200 francs (F4, art. 5 LIA)', () => {
  it('sur 500 tirages, l’intérêt brut dépasse toujours 200.00', () => {
    for (let g = 1; g <= 500; g++) {
      const q = genererCalcul('compte-courant', hasard(g), { plan });
      if (q.format !== 'calcul') throw new Error('format');
      const brut = q.champs.find((c) => c.libelle === 'Intérêt brut')!.attendu;
      expect(brut).toBeGreaterThan(20000);
    }
  });
});

describe('variante d’évaluation (F5)', () => {
  it('varianteSure refuse facturation et budget, et signale chaque pièce dont la TVA reste décalée', () => {
    for (const ex of exercicesDemo) {
      const r = varianteSure(ex, 2, `${ex.id}-v`);
      if (ex.parametres.facturation || ex.parametres.budget) {
        expect(r.ok).toBe(false);
        continue;
      }
      expect(r.ok, ex.id).toBe(true);
      if (r.ok) {
        expect(controlerExercice(r.valeur, plan).erreurs).toEqual([]);
        expect(r.avertissements.length > 0, ex.id).toBe(piecesIncoherentes(r.valeur).length > 0);
      }
    }
  });
  it('le contrôle repère une TVA multipliée après arrondi', () => {
    const fausses = exercicesDemo.filter((ex) => !ex.parametres.facturation && !ex.parametres.budget).flatMap((ex) => piecesIncoherentes(varianteExercice(ex, 3, 'v')));
    expect(fausses.length).toBeGreaterThan(0);
  });
});

describe('fichier d’évaluation et import des copies (ENS3, ENS4, ENS5)', () => {
  it('le fichier élève d’une évaluation ne livre pas la facture payée par chaque crédit', () => {
    const ev = { ...dossierFacturationLeman, mode: 'evaluation' as const };
    const f = JSON.parse(exporterExercice(ev));
    for (const c of f.exercice.parametres.facturation.controle.credits) expect(c.facture).toBe('');
  });
  it('une copie modifiée à la main ou passée en entraînement est signalée', () => {
    const ex = { ...demoCfc1, mode: 'evaluation' as const };
    const d = creerDossier(ex, plan);
    expect(alertesCopie(ex, plan, { mode: 'evaluation', dossier: d })).toEqual([]);
    expect(alertesCopie(ex, plan, { mode: 'entrainement', dossier: d })).toHaveLength(1);
    const falsifiee = { ...d, ecritures: [{ ...e('3', [D('1000', 0.01)]) }] };
    expect(alertesCopie(ex, plan, { mode: 'evaluation', dossier: falsifiee })[0]).toMatch(/contrôles du logiciel/);
  });
  it('des copies aux écritures identiques sont regroupées', () => {
    const a = { nom: 'A', ecritures: [e('1', [S('1020', '2800', 100)])] };
    const b = { nom: 'B', ecritures: [e('1', [S('1020', '2800', 100)])] };
    const c = { nom: 'C', ecritures: [e('1', [S('1000', '2800', 100)])] };
    expect(copiesIdentiques([a, b, c], (x) => x.ecritures).map((g) => g.map((x) => x.nom))).toEqual([['A', 'B']]);
  });
  it('le bouclement reste dans le maximum, et un journal presque vide n’en tire aucun point', () => {
    const d = creerDossier(demoCfc1, plan);
    const vide = corrigerCopie(demoCfc1, d);
    const r = ajouterEcriture(d, { id: 'X', date: '2026-01-05', piece: '1', libelle: 'x', lignes: demoCfc1.corrige![0]!.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    const une = corrigerCopie(demoCfc1, r.valeur);
    expect(une.max).toBe(vide.max);
    expect(une.operations.find((o) => o.piece === PIECE_BOUCLEMENT)?.points).toBe(0);
  });
});

describe('signal de maîtrise (NEU1, NEU2, NEU5)', () => {
  const bilan = MODULES.find((m) => m.id === 'bilan')!;
  const ctx = { plan, modeles: bilan.modeles.map(modeleParId), comptes: [...bilan.comptes], types: [...bilan.types] };
  it('module Bilan : répondre toujours « Actif » ne donne plus qu’environ la moitié des questions de classement', () => {
    let actif = 0;
    let total = 0;
    for (let g = 1; g <= 300; g++) {
      for (const q of genererSerie(ctx, ['classer'], 10, g)) {
        if (q.format !== 'classer') continue;
        total++;
        if (q.reponse === 'actif') actif++;
      }
    }
    expect(actif / total).toBeGreaterThan(0.4);
    expect(actif / total).toBeLessThan(0.6);
  });
  it('« toujours Actif, toujours la même variation » ne réussit presque plus jamais une série', () => {
    let reussies = 0;
    for (let g = 1; g <= 2000; g++) {
      const parts = genererSerie(ctx, bilan.formats, 10, g).map((q) => ({
        format: q.format,
        part: (q.format === 'classer' && q.reponse === 'actif') || (q.format === 'variation' && q.reponse === 2) ? 1 : 0,
      }));
      if (bilanSerie(parts).reussie) reussies++;
    }
    expect(reussies / 2000).toBeLessThan(0.02);
  });
  it('la révision pose deux questions, de préférence à produire, et demande deux réponses entièrement justes', () => {
    const comptes = MODULES.find((m) => m.id === 'comptes')!;
    const qs = questionsRevision({ plan, modeles: comptes.modeles.map(modeleParId), comptes: [...comptes.comptes], types: [...comptes.types] }, comptes.formats, 5);
    expect(qs).toHaveLength(2);
    expect(qs.every((q) => ['ecriture', 'solde', 'calcul', 'composee'].includes(q.format))).toBe(true);
    expect(revisionReussie([1, 1])).toBe(true);
    expect(revisionReussie([1, 0.75])).toBe(false);
  });
  it('états d’une notion : réussie une fois, confirmée après deux révisions, à raviver sans rien perdre', () => {
    expect(etatNotion(undefined)).toBe('aFaire');
    expect(etatNotion({ maitrise: false })).toBe('enCours');
    expect(etatNotion({ maitrise: true })).toBe('reussieUneFois');
    expect(etatNotion({ maitrise: true, confirmations: 2 })).toBe('confirmee');
    expect(etatNotion({ maitrise: true, confirmations: 2, aRaviver: true })).toBe('aRaviver');
  });
});

describe('2ème CFC : le calcul est exercé (PED3-08) et les énoncés varient (NEU3)', () => {
  it('les modules d’écritures de 2ème CFC mêlent écritures et calculs', () => {
    for (const id of ['tva-ecritures', 'amortissements-ecritures', 'creances-ecritures', 'salaires-ecritures', 'synthese-cfc2']) {
      const m = MODULES.find((x) => x.id === id)!;
      expect(m.formats, id).toContain('calcul');
      expect(m.calculs?.length, id).toBeGreaterThan(0);
    }
  });
  it('dans une série d’amortissements, une même situation revient beaucoup moins', () => {
    const m = MODULES.find((x) => x.id === 'amortissements-ecritures')!;
    const serie = genererSerie({ plan, modeles: [], comptes: [...m.comptes], types: [], ecritures: m.ecritures, calculs: m.calculs }, m.formats, 10, 11);
    const signatures = serie.map((q) => JSON.stringify(q).replace(/\d/g, ''));
    expect(new Set(signatures).size).toBeGreaterThanOrEqual(7);
  });
});

describe('contenus mis en cohérence', () => {
  it('Maison Vuilleumier, op. 5 : électricité en 6400 et téléphone en 6510, montants donnés', () => {
    const op = manuelVuilleumier.operations.find((o) => o.numero === '5')!;
    expect(op.texte).toMatch(/électricité 324.30 et téléphone 194.60/);
    const c = manuelVuilleumier.corrige!.find((x) => x.piece === '5')!;
    expect(c.lignes.map((l) => l.debit ?? l.credit)).toEqual(['6400', '6510', '1171', '1010']);
  });
  it('bénéficiaire d’un paiement : l’orthographe ne compte pas (ENS17)', () => {
    for (const s of ['Energies du Leman SA', 'Énergies du Léman', 'Energie du Léman SA']) expect(textesProches(s, 'Énergies du Léman SA'), s).toBe(true);
    expect(textesProches('Garage Favre', 'Énergies du Léman SA')).toBe(false);
  });
  it('formulaire TVA : l’impôt calculé sur les prestations est admis à 5 centimes près (C1-10)', () => {
    expect(controlerChamp({ cle: '303i', libelle: 'impôt', type: 'chf', attendu: 51675, tolerance: 5 }, '516.72')).toBe(true);
  });
});

describe('décisions de l’enseignant du 26.11.2026', () => {
  it('barème par défaut : 2 points pour une écriture d’au moins trois comptes ou côtés', async () => {
    const { pointsParDefaut } = await import('../src/engine/notation');
    expect(pointsParDefaut({ piece: '1', lignes: [S('1020', '3200', 100)] })).toBe(1);
    expect(pointsParDefaut(manuelGolay.corrige!.find((c) => c.piece === '14'))).toBe(2);
  });
  it('abonnement : 6500 et 6700 sont admis (Vuilleumier op. 11)', () => {
    const c = manuelVuilleumier.corrige!.find((x) => x.piece === '11')!;
    const en = (compte: string) => [e('11', [D(compte, 450), D('1171', 11.7), C('1010', 461.7)])];
    expect(diagnostiquer(en('6700'), c)).toBe('juste');
    expect(diagnostiquer(en('6500'), c)).toBe('juste');
    expect(diagnostiquer(en('6000'), c)).not.toBe('juste');
  });
  it('option Finances : marquée sur les exercices CFC de niveau 2 à 4', async () => {
    const { etiquetteNiveau } = await import('../src/engine/exercice');
    expect(etiquetteNiveau({ filiere: 'CFC', niveau: 'CFC1', difficulte: 1 })).toBe('CFC · niveau 1');
    expect(etiquetteNiveau({ filiere: 'CFC', niveau: 'CFC2', difficulte: 3 })).toBe('CFC · niveau 3 · option Finances');
  });
  it('variante : trois opérations à réécrire, jamais citées par une autre, suivies jusqu’à leur réécriture', async () => {
    const { operationsNonReecrites } = await import('../src/engine/variante');
    const r = varianteSure(demoCfc1, 2, 'v');
    if (!r.ok) throw new Error(r.erreurs.join());
    const v = r.valeur;
    expect(v.aReecrire).toHaveLength(3);
    const citees = v.operations.flatMap((o) => [...o.texte.matchAll(/opérations?\s+(\d+)/gi)].map((m) => m[1]));
    for (const a of v.aReecrire!) expect(citees).not.toContain(a.numero);
    expect(operationsNonReecrites(v)).toHaveLength(3);
    const reecrite = { ...v, operations: v.operations.map((o) => (o.numero === v.aReecrire![0]!.numero ? { ...o, texte: 'Autre opération' } : o)) };
    expect(operationsNonReecrites(reecrite)).toHaveLength(2);
  });
});
