import { describe, expect, it } from 'vitest';
import { plan as planDefaut } from '../src/data/plan';
import { exercicesDemo } from '../src/data/demos';
import { classerExercices, creerDossier, exerciceVierge, TITRES_DIFFICULTE } from '../src/engine/exercice';
import { comptesDisponibles } from '../src/engine/dossier';
import { ecrirePlanCsv, type Compte } from '../src/engine/plan';
import {
  COMPTES_VERROUILLES,
  controlerPlanEtablissement,
  controlerTitres,
  differencesPlan,
  importerPlanCsv,
  nombreDifferences,
  titresEffectifs,
} from '../src/engine/reglages';
import { ErreurFichier, exporterExercice, exporterExerciceEnseignant, importerExercice } from '../src/io/fichiers';
import { exporterReglages, importerReglages } from '../src/io/reglages';

const copie = (): Compte[] => structuredClone(planDefaut);
const modifier = (p: Compte[], numero: string, changement: Partial<Compte>) => p.map((c) => (c.numero === numero ? { ...c, ...changement } : c));

/** Sources du moteur (texte brut), pour vérifier les numéros de compte cités. */
const SOURCES_MOTEUR = import.meta.glob('../src/engine/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('comptes verrouillés', () => {
  it('tout numéro du plan cité par le moteur est verrouillé', () => {
    const numeros = new Set(planDefaut.map((c) => c.numero));
    const cites = new Set<string>();
    expect(Object.keys(SOURCES_MOTEUR).length).toBeGreaterThan(20);
    for (const texte of Object.values(SOURCES_MOTEUR)) {
      for (const m of texte.matchAll(/['"`]([1-9]\d{3})['"`]/g)) if (numeros.has(m[1]!)) cites.add(m[1]!);
    }
    expect([...cites].filter((n) => !COMPTES_VERROUILLES.includes(n))).toEqual([]);
  });

  it('les comptes verrouillés existent dans le plan par défaut', () => {
    const numeros = new Set(planDefaut.map((c) => c.numero));
    expect(COMPTES_VERROUILLES.filter((n) => !numeros.has(n))).toEqual([]);
  });
});

describe("plan de l'établissement", () => {
  it('le plan par défaut est accepté', () => {
    expect(controlerPlanEtablissement(planDefaut, planDefaut).ok).toBe(true);
  });

  it('accepte un intitulé renommé, un compte ajouté et un compte non verrouillé passé à « non utilisé »', () => {
    let p = modifier(copie(), '1010', { intitule: 'PostFinance' });
    p = modifier(p, '1000', { intitule: 'Caisse principale' });
    p = modifier(p, '1500', { niveauMin: null });
    p.push({ numero: '6590', intitule: 'Frais divers', classe: 6, type: 'charge', niveauMin: 'CFC1' });
    const r = controlerPlanEtablissement(p, planDefaut);
    expect(r.ok).toBe(true);
    const d = differencesPlan(planDefaut, r.ok ? r.valeur : []);
    expect(d.intitulesModifies).toEqual(['1000', '1010']);
    expect(d.ajoutes).toEqual(['6590']);
    expect(d.nonUtilises).toEqual(['1500']);
    expect(nombreDifferences(d)).toBe(4);
  });

  it('refuse le retrait, le changement de type ou de niveau d’un compte verrouillé et le renommage de 2800', () => {
    const sans9000 = copie().filter((c) => c.numero !== '9000');
    expect(controlerPlanEtablissement(sans9000, planDefaut)).toEqual({
      ok: false,
      erreurs: ['Le compte 9000 Compte de résultat manque : il est utilisé par une fonction du logiciel.'],
    });
    const r = controlerPlanEtablissement(
      modifier(modifier(modifier(copie(), '2850', { niveauMin: 'MP' }), '2800', { intitule: 'Fonds propres' }), '1170', { type: 'passif' }),
      planDefaut,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erreurs).toHaveLength(3);
      expect(r.erreurs.join(' ')).toMatch(/1170.*type/);
      expect(r.erreurs.join(' ')).toMatch(/2800 ne se modifie pas/);
      expect(r.erreurs.join(' ')).toMatch(/2850 doit rester visible dès CFC1/);
    }
  });

  it('import CSV : messages du contrôle du plan, puis des comptes verrouillés', () => {
    const mauvais = ecrirePlanCsv(planDefaut).replace('1300;Actifs transitoires;1;', '1300;Actifs transitoires;2;');
    expect(importerPlanCsv(mauvais, planDefaut)).toEqual({
      ok: false,
      erreurs: ['Ligne 16 : la classe 2 ne correspond pas au premier chiffre du compte 1300.'],
    });
    expect(importerPlanCsv('n;i\n', planDefaut).ok).toBe(false);
    expect(importerPlanCsv(ecrirePlanCsv(planDefaut), planDefaut).ok).toBe(true);
  });
});

describe('niveaux et classement', () => {
  it('titres effectifs : ceux de l’établissement complétés par défaut', () => {
    const t = titresEffectifs(TITRES_DIFFICULTE, { titres: { CFC: { 3: 'Clôture' }, MP: {} } });
    expect(t.CFC[1]).toBe(TITRES_DIFFICULTE.CFC[1]);
    expect(t.CFC[3]).toBe('Clôture');
    expect(t.MP[6]).toBe(TITRES_DIFFICULTE.MP[6]);
  });

  it('contrôle : niveaux qui se suivent, titres non vides', () => {
    expect(controlerTitres({ CFC: { 1: 'A', 2: 'B' }, MP: { 1: 'C' } })).toEqual([]);
    expect(controlerTitres({ CFC: { 1: 'A', 3: 'B' }, MP: { 1: ' ' } })).toEqual([
      'CFC : les niveaux doivent se suivre (1, 2, 3…).',
      'MP : le titre du niveau 1 est vide.',
    ]);
  });

  it("l'accueil prend les titres de l'établissement, sinon celui porté par un exercice, sinon le titre par défaut", () => {
    const t = titresEffectifs(TITRES_DIFFICULTE, { titres: { CFC: { 1: 'Première année' }, MP: {} } });
    expect(classerExercices(exercicesDemo, t)[0]!.titre).toBe('Première année');
    expect(classerExercices(exercicesDemo)[0]!.titre).toBe(TITRES_DIFFICULTE.CFC[1]);
    const ex = { ...exerciceVierge('x', 2026), filiere: 'CFC' as const, difficulte: 7, titreNiveau: 'Projet' };
    expect(classerExercices([ex])[0]!.titre).toBe('Projet');
  });
});

describe("plan joint à l'exercice", () => {
  const planEcole = (() => {
    const p = modifier(copie(), '1010', { intitule: 'PostFinance' });
    p.push({ numero: '6590', intitule: 'Frais divers', classe: 6, type: 'charge', niveauMin: 'CFC1' });
    return p.sort((a, b) => a.numero.localeCompare(b.numero));
  })();

  it("le dossier de l'élève est créé avec le plan de l'exercice", () => {
    const ex = { ...exerciceVierge('x', 2026), plan: planEcole };
    const comptes = comptesDisponibles(creerDossier(ex, planDefaut));
    expect(comptes.find((c) => c.numero === '1010')?.intitule).toBe('PostFinance');
    expect(comptes.some((c) => c.numero === '6590')).toBe(true);
    // sans plan joint : plan par défaut
    expect(comptesDisponibles(creerDossier(exerciceVierge('y', 2026), planDefaut)).find((c) => c.numero === '1010')?.intitule).toBe('Poste (CP)');
  });

  it('le plan voyage dans les fichiers élève et enseignant ; un plan endommagé est refusé', () => {
    const ex = { ...exerciceVierge('x', 2026), plan: planEcole, titreNiveau: 'Bases' };
    for (const texte of [exporterExercice(ex), exporterExerciceEnseignant(ex)]) {
      const lu = importerExercice(texte);
      expect(lu.plan).toEqual(planEcole);
      expect(lu.titreNiveau).toBe('Bases');
    }
    const abime = JSON.parse(exporterExerciceEnseignant(ex));
    abime.exercice.plan[0].numero = '12';
    expect(() => importerExercice(JSON.stringify(abime))).toThrow(ErreurFichier);
    expect(importerExercice(exporterExercice(exerciceVierge('z', 2026))).plan).toBeUndefined();
  });
});

describe('fichier de réglages', () => {
  it('aller-retour, puis refus d’un plan sans compte verrouillé', () => {
    const r = { plan: modifier(copie(), '1010', { intitule: 'PostFinance' }), titres: { CFC: { 1: 'A', 2: 'B' }, MP: { 1: 'C' } }, libellesContenu: { CFC1: '1re année' } };
    expect(importerReglages(exporterReglages(r), planDefaut)).toEqual(r);
    const mauvais = { ...r, plan: copie().filter((c) => c.numero !== '2850') };
    expect(() => importerReglages(exporterReglages(mauvais), planDefaut)).toThrow(/2850/);
    expect(() => importerReglages('{"format":"autre"}', planDefaut)).toThrow(ErreurFichier);
  });
});
