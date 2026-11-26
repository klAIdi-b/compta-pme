// Reprise d'un travail par fichier (audit du 24.11.2026, action 11) : copie exportée rouverte sur un autre poste,
// progression Apprendre reprise. Le dossier est reconstruit depuis l'exercice, jamais repris tel quel du fichier.
import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture, extourner } from '../src/engine/journal';
import { dossierDeCopie } from '../src/engine/reprise';
import { exporterCopie, importerCopie } from '../src/io/fichiers';
import { fusionnerProgression, type Progression } from '../src/io/apprendre';
import { plan } from './fixtures';

function travail(n: number) {
  let d = creerDossier(demoCfc1, plan);
  for (const [i, c] of demoCfc1.corrige!.slice(0, n).entries()) {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: demoCfc1.debut, piece: c.piece, libelle: `Opération ${c.piece}`, lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
  }
  return d;
}

describe('reprise d’une copie', () => {
  it('rejoue les écritures de l’élève, extourne comprise, sur le dossier de l’exercice', () => {
    let d = travail(3);
    const r = extourner(d, 'E2', demoCfc1.debut);
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
    const copie = importerCopie(exporterCopie({ eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CFC3' }, exerciceId: demoCfc1.id, exerciceTitre: demoCfc1.titre, mode: demoCfc1.mode, dossier: d, suivi: { '1': { essais: 1, dernier: 'juste', solutionVue: true } } }));
    const repris = dossierDeCopie(demoCfc1, plan, copie.dossier);
    expect(repris.ok).toBe(true);
    if (!repris.ok) return;
    expect(repris.valeur.ecritures).toEqual(d.ecritures);
    expect(repris.valeur.plan).toEqual(creerDossier(demoCfc1, plan).plan);
    expect(copie.suivi['1']?.solutionVue).toBe(true);
  });

  it('refuse une copie modifiée : compte absent du plan de l’exercice, ou exercice comptable suivant', () => {
    const d = travail(1);
    const faux = { ...d, ecritures: [{ ...d.ecritures[0]!, lignes: [{ debit: '9999', credit: '2000', montant: 100 }] }] };
    const r = dossierDeCopie(demoCfc1, plan, faux);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erreurs[0]).toMatch(/ne correspond pas à cet exercice \(pièce 1\)/);
    const rouvert = dossierDeCopie(demoCfc1, plan, { ...d, debut: '2027-01-01', fin: '2027-12-31' });
    expect(rouvert.ok).toBe(false);
  });

  it('le plan, le bilan d’ouverture et les écritures automatiques viennent de l’exercice, pas du fichier', () => {
    const d = travail(2);
    const truque = { ...d, ouverture: [], plan: [] };
    const r = dossierDeCopie(demoCfc1, plan, truque);
    expect(r.ok && r.valeur.ouverture).toEqual(creerDossier(demoCfc1, plan).ouverture);
  });

  it('une évaluation formative terminée le reste dans la copie', () => {
    const base = { eleve: { prenom: 'A', nom: 'B', classe: 'C' }, exerciceId: 'x', exerciceTitre: 'x', mode: 'formative' as const, dossier: travail(0), suivi: {} };
    expect(importerCopie(exporterCopie({ ...base, formativeTerminee: true })).formativeTerminee).toBe(true);
    expect(importerCopie(exporterCopie(base)).formativeTerminee).toBeUndefined();
  });
});

describe('reprise de la progression Apprendre', () => {
  const p = (meilleur: number, maitrise: boolean, rang?: number, prochaine = '2026-12-01', le = '2026-11-20'): Progression[string] => ({
    meilleur, sur: 10, maitrise, series: 2, le, revision: rang === undefined ? undefined : { rang, prochaine },
  });

  it('fusion notion par notion : réussie le reste, meilleur score et révision la plus avancée gardés', () => {
    const ici: Progression = { bilan: p(6, false), comptes: p(9, true, 0, '2026-11-27') };
    const fichier: Progression = { bilan: p(8, true, 1, '2026-11-30', '2026-11-25'), comptes: p(7, false), prive: p(5, false) };
    const r = fusionnerProgression(ici, fichier);
    expect(r.bilan).toMatchObject({ meilleur: 8, maitrise: true, revision: { rang: 1, prochaine: '2026-11-30' }, le: '2026-11-25' });
    expect(r.comptes).toMatchObject({ meilleur: 9, maitrise: true, revision: { rang: 0 } });
    expect(r.prive).toMatchObject({ meilleur: 5 });
    // Rouvrir le même fichier ne change rien.
    expect(fusionnerProgression(r, fichier)).toEqual(r);
  });

  it('ignore une notion mal formée', () => {
    const r = fusionnerProgression({}, { x: { meilleur: 'a', sur: 0 } as unknown as Progression[string] });
    expect(r).toEqual({});
  });
});
