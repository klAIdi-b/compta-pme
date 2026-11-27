// Mode « énoncé papier » (phase V2, maquette validée le 27.11.2026) : code de l'exercice, dossier créé par l'élève,
// bilan d'ouverture fourni ou saisi, correction pièce par pièce avec le corrigé de l'enseignant.
import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { exercicesDemo } from '../src/data/demos';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { corrigerCopie } from '../src/engine/notation';
import { corrigeBouclement } from '../src/engine/correction-bouclement';
import { dossierDeCopie } from '../src/engine/reprise';
import {
  codeExercice,
  copiePapierPour,
  ecartsOuverture,
  exerciceDuCode,
  exercicePapier,
  normaliserCode,
  prochainePiece,
  varianteDuCode,
} from '../src/engine/papier';
import { exporterCopie, importerCopie } from '../src/io/fichiers';
import type { Dossier } from '../src/engine/dossier';
import { plan } from './fixtures';

const infos = { raisonSociale: 'Cycles du Léman', formeJuridique: 'raison individuelle' as const, niveau: 'CFC1' as const, debut: '2026-01-01', fin: '2026-12-31', code: '' };

describe('code de l’exercice', () => {
  it('a la forme NOM-XXX, deux variantes distinctes, stables', () => {
    const f = codeExercice(demoCfc1, 'fourni');
    const s = codeExercice(demoCfc1, 'saisi');
    expect(f).toMatch(/^CYCLES-[A-Z2-9]{3}$/);
    expect(s).toMatch(/^CYCLES-[A-Z2-9]{3}$/);
    expect(f).not.toBe(s);
    expect(codeExercice(demoCfc1, 'fourni')).toBe(f);
  });

  it('se reconnaît quelle que soit la façon de le taper', () => {
    const f = codeExercice(demoCfc1, 'fourni');
    expect(varianteDuCode(demoCfc1, f.toLowerCase().replace('-', ' '))).toBe('fourni');
    expect(varianteDuCode(demoCfc1, codeExercice(demoCfc1, 'saisi'))).toBe('saisi');
    expect(varianteDuCode(demoCfc1, 'CYCLES-ZZZ9')).toBe(null);
    expect(normaliserCode(' cy-clé s ')).toBe('CYCLES');
  });

  it('est unique dans le catalogue, et retrouve son exercice', () => {
    const codes = exercicesDemo.flatMap((e) => [codeExercice(e, 'fourni'), codeExercice(e, 'saisi')].map(normaliserCode));
    expect(new Set(codes).size).toBe(codes.length);
    for (const e of exercicesDemo) expect(exerciceDuCode(codeExercice(e, 'saisi'), exercicesDemo)?.exercice.id).toBe(e.id);
  });

  it('prend le code choisi par l’enseignant pour la variante « fourni »', () => {
    const ex = { ...demoCfc1, code: 'leman-24' };
    expect(codeExercice(ex, 'fourni')).toBe('LEMAN-24');
    expect(codeExercice(ex, 'saisi')).toBe('LEMAN-24-S');
    expect(varianteDuCode(ex, 'leman 24')).toBe('fourni');
  });
});

describe('dossier « énoncé papier »', () => {
  it('sans code : l’entreprise et la période tapées par l’élève, ouverture vide, sans opérations ni corrigé', () => {
    const ex = exercicePapier('papier-1', infos);
    expect(ex.operations).toEqual([]);
    expect(ex.corrige).toBeUndefined();
    expect(ex.ouvertureActif).toEqual({});
    expect(ex.papier).toEqual({ code: undefined, source: undefined, ouvertureFournie: undefined });
    expect(creerDossier(ex, plan).comptesAjoutes).toContain('9000');
  });

  it('avec le code « fourni » : entreprise, période, niveau et bilan d’ouverture repris de l’exercice', () => {
    const source = exerciceDuCode(codeExercice(demoCfc1, 'fourni'), exercicesDemo)!;
    const ex = exercicePapier('papier-2', { ...infos, raisonSociale: '', code: codeExercice(demoCfc1, 'fourni') }, source);
    expect(ex.raisonSociale).toBe('Cycles du Léman');
    expect(ex.ouvertureActif).toEqual(demoCfc1.ouvertureActif);
    expect(ex.ouverturePassif).toEqual(demoCfc1.ouverturePassif);
    expect(ex.papier?.ouvertureFournie).toBe(true);
    expect(ecartsOuverture(creerDossier(ex, plan).ouverture, demoCfc1)).toEqual([]);
  });

  it('avec le code « saisi » : l’entreprise vient de l’exercice, le bilan d’ouverture reste à saisir', () => {
    const source = exerciceDuCode(codeExercice(demoCfc1, 'saisi'), exercicesDemo)!;
    const ex = exercicePapier('papier-3', { ...infos, code: codeExercice(demoCfc1, 'saisi') }, source);
    expect(ex.raisonSociale).toBe('Cycles du Léman');
    expect(ex.ouvertureActif).toEqual({});
    expect(ex.papier?.source).toBe(demoCfc1.id);
  });

  it('propose le numéro de pièce suivant', () => {
    expect(prochainePiece([])).toBe('1');
    expect(prochainePiece(['1', '2', '8', 'B1', '3a'])).toBe('9');
  });

  it('rattache une copie au corrigé par son code, accepte une copie sans code', () => {
    expect(copiePapierPour(demoCfc1, { code: codeExercice(demoCfc1, 'saisi') })).toBe('oui');
    expect(copiePapierPour(demoCfc1, { code: 'AUTRE-ABC' })).toBe('non');
    expect(copiePapierPour(demoCfc1, {})).toBe('sans-code');
    expect(copiePapierPour(demoCfc1, { source: demoCfc1.id })).toBe('oui');
  });
});

describe('copie de Léa (exemple de la maquette V2.4)', () => {
  // Ouverture saisie avec les montants du mobilier et des véhicules inversés ; opérations 8, 12 et 14 fausses.
  const code = codeExercice(demoCfc1, 'saisi');
  const exPapier = {
    ...exercicePapier('papier-lea', { ...infos, code }, exerciceDuCode(code, exercicesDemo)!),
    ouvertureActif: { ...demoCfc1.ouvertureActif, '1510': 2200000, '1530': 1500000 },
    ouverturePassif: { ...demoCfc1.ouverturePassif },
  };
  const erreurs: Record<string, { debit: string | null; credit: string | null; montant: number }[]> = {
    '8': [{ debit: '1520', credit: '1020', montant: 160000 }],
    '12': [{ debit: '6600', credit: '2000', montant: 65000 }],
    '14': [
      { debit: '4200', credit: null, montant: 300000 },
      { debit: null, credit: '1000', montant: 100000 },
      { debit: null, credit: '2010', montant: 200000 },
    ],
  };
  let d: Dossier = creerDossier(exPapier, plan);
  for (const [i, c] of demoCfc1.corrige!.entries()) {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: demoCfc1.debut, piece: c.piece, libelle: `Pièce ${c.piece}`, lignes: erreurs[c.piece] ?? c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
  }
  const b = corrigeBouclement(d, demoCfc1)!;
  const rb = ajouterEcriture(d, { id: 'E99', date: demoCfc1.fin, piece: 'B1', libelle: 'Bouclement', lignes: b.lignes });
  if (!rb.ok) throw new Error(rb.erreurs.join(' '));
  d = rb.valeur;

  it('est corrigée par numéro de pièce : 15,5 points sur 19, note 5', () => {
    const c = corrigerCopie(demoCfc1, d);
    expect(c.max).toBe(19);
    expect(c.points).toBe(15.5);
    expect(c.note).toBe(5);
    expect(c.operations.find((o) => o.piece === '14')?.points).toBe(0.5);
    expect(c.piecesHorsEnonce).toEqual([]);
  });

  it('signale les deux écarts du bilan d’ouverture, sans les noter', () => {
    expect(ecartsOuverture(d.ouverture, demoCfc1)).toEqual([
      { compte: '1510', attendu: 1500000, saisi: 2200000 },
      { compte: '1530', attendu: 2200000, saisi: 1500000 },
    ]);
  });

  it('voyage dans le fichier de copie et se reprend sur un autre ordinateur', () => {
    const copie = importerCopie(
      exporterCopie({ eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CA' }, exerciceId: exPapier.id, exerciceTitre: exPapier.titre, mode: exPapier.mode, dossier: d, suivi: {}, papier: { exercice: exPapier } }),
    );
    expect(copie.papier?.exercice.papier?.code).toBe(code);
    expect(copie.papier?.exercice.corrige).toBeUndefined();
    const r = dossierDeCopie(copie.papier!.exercice, plan, copie.dossier);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.valeur.ouverture).toEqual(d.ouverture);
  });
});

describe('énoncé à imprimer (phase V2)', () => {
  it('imprime le code de l’exercice et les consignes de l’énoncé papier', async () => {
    const { genererPdfDossier } = await import('../src/pdf/dossier');
    for (const v of ['fourni', 'saisi'] as const) {
      const texte = await (await genererPdfDossier(demoCfc1, plan, 'enonce.pdf', v)).text();
      expect(texte.startsWith('%PDF')).toBe(true);
      expect(texte).toContain(codeExercice(demoCfc1, v));
      expect(texte).toContain('Op');
    }
  });
});
