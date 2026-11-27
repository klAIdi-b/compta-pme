// Phase V5 (maquette validée le 27.11.2026) : clôture guidée, report du bilan d'ouverture, copie de l'exercice de l'énoncé.
import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { boucler, reouvrir } from '../src/engine/closing';
import { avancement } from '../src/engine/correction';
import { controlesCloture, dossierDeLEnonce, peutCloturer, reportOuverture } from '../src/engine/cloture';
import type { Dossier } from '../src/engine/dossier';
import { plan } from './fixtures';

function journal(n: number): Dossier {
  let d = creerDossier(demoCfc1, plan);
  for (const [i, c] of demoCfc1.corrige!.slice(0, n).entries()) {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: '2026-03-01', piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
  }
  return d;
}
const av = (d: Dossier) => avancement(demoCfc1.operations, d.ecritures, demoCfc1.corrige!, {});

describe('clôture guidée', () => {
  it('signale ce qui manque : opérations, bouclement, copie', () => {
    const d = journal(14);
    const c = controlesCloture(demoCfc1, d, av(d), true, false);
    expect(c.find((x) => x.cle === 'operations')).toMatchObject({ ok: false, texte: '14 sur 15 saisies' });
    expect(c.find((x) => x.cle === 'aRevoir')?.ok).toBe(true);
    expect(c.find((x) => x.cle === 'balance')?.ok).toBe(true);
    expect(c.find((x) => x.cle === 'bouclement')?.ok).toBe(false);
    expect(c.find((x) => x.cle === 'copie')?.ok).toBe(false);
    expect(peutCloturer(demoCfc1, d)).toBe(false);
  });

  it('tout est vert une fois le journal complet, bouclé et la copie exportée', () => {
    const b = boucler(journal(15));
    if (!b.ok) throw new Error(b.erreurs.join(' '));
    const c = controlesCloture(demoCfc1, b.valeur, av(b.valeur), true, true);
    expect(c.every((x) => x.ok)).toBe(true);
    expect(c.map((x) => x.cle)).toEqual(['operations', 'aRevoir', 'horsEnonce', 'balance', 'bouclement', 'copie']);
    expect(peutCloturer(demoCfc1, b.valeur)).toBe(true);
  });

  it('pièce hors énoncé et écriture à revoir signalées', () => {
    let d = journal(15);
    const r = ajouterEcriture(d, { id: 'X1', date: '2026-03-01', piece: '3a', libelle: 'x', lignes: [{ debit: '1000', credit: '1020', montant: 100 }] });
    if (r.ok) d = r.valeur;
    const c = controlesCloture(demoCfc1, d, av(d), true, null);
    expect(c.find((x) => x.cle === 'horsEnonce')).toMatchObject({ ok: false, texte: 'pièce 3a' });
    expect(c.some((x) => x.cle === 'copie')).toBe(false);
  });
});

describe('report du bilan d’ouverture', () => {
  it('Cycles du Léman 2026 → 2027 : chaque compte de bilan garde son solde, total 93’380.00', () => {
    const b = boucler(journal(15));
    if (!b.ok) throw new Error(b.erreurs.join(' '));
    const r = reouvrir(b.valeur, 'compteDeResultat');
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    const lignes = reportOuverture(b.valeur, r.valeur);
    expect(lignes.every((l) => l.cloture === l.ouverture)).toBe(true);
    expect(lignes.find((l) => l.compte === '2800')).toEqual({ compte: '2800', cloture: -5813000, ouverture: -5813000 });
    expect(lignes.filter((l) => l.ouverture > 0).reduce((s, l) => s + l.ouverture, 0)).toBe(9338000);
    expect(lignes.some((l) => l.compte === '2850' || l.compte === '9000')).toBe(false);
  });

  it('mode « à la réouverture » : le capital reçoit le résultat et le privé', () => {
    const d = journal(15);
    const r = reouvrir(d, 'aLaReouverture');
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    const capital = reportOuverture(d, r.valeur).find((l) => l.compte === '2800')!;
    expect(capital.cloture).toBe(-5540000);
    expect(capital.ouverture).toBe(-5813000);
  });
});

describe('copie rendue après la réouverture', () => {
  it('rend l’exercice de l’énoncé, avec les années suivantes à part', () => {
    const b = boucler(journal(15));
    if (!b.ok) throw new Error(b.erreurs.join(' '));
    const r = reouvrir(b.valeur, 'compteDeResultat');
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    const { dossier, suivants } = dossierDeLEnonce(demoCfc1, r.valeur, [b.valeur]);
    expect(dossier.debut).toBe('2026-01-01');
    expect(dossier.ecritures.length).toBe(17);
    expect(suivants.map((s) => s.debut)).toEqual(['2027-01-01']);
    expect(dossierDeLEnonce(demoCfc1, b.valeur, []).suivants).toEqual([]);
  });
});
