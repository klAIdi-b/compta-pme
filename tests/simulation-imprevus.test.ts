// Phase S6 : imprévus déclenchés par l'enseignant, ducroire du 31.12, fiche de calcul AFP.
import { describe, expect, it } from 'vitest';
import { MARCHE_PAR_DEFAUT, SECTEUR_VELOS } from '../src/data/simulation/secteurs';
import {
  controlerImprevu,
  creerPartie,
  exerciceEntreprise,
  ficheAfp,
  imprevusEntreprise,
  jouerTour,
  montantDucroire,
  prixAchat,
  rejouer,
} from '../src/engine/simulation';
import type { Decisions, Imprevu, Partie, ReglagesPartie } from '../src/engine/simulation';
import { controlerExercice, creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { soldeDe } from '../src/engine/ledger';
import { resultatExercice } from '../src/engine/statements';
import { plan } from './fixtures';

const reglages = (o: Partial<ReglagesPartie> = {}): ReglagesPartie => ({
  niveau: 'CFC2', secteur: SECTEUR_VELOS, dureeTour: 'trimestre', nbTours: 4, annee: 2027, comptabilite: 'eleves',
  affichage: 'classement', cloture: true, marche: MARCHE_PAR_DEFAUT, ...o,
});
const E = [{ id: 'a', nom: 'Les Lémaniques' }, { id: 'b', nom: 'Rhône Express' }];
const dec = (q: number): Decisions => ({ prixVente: 89900, quantiteAchetee: q, publicite: 100000, fournisseur: 'grossiste', prelevementPrive: 0, employes: 1 });

function partie(r: ReglagesPartie): Partie {
  const c = creerPartie(r, E);
  if (!c.ok) throw new Error(c.erreurs.join());
  return c.valeur;
}

function jouer(p: Partie, q: number, imprevus: Imprevu[] = []): Partie {
  const r = jouerTour(p, { a: dec(q), b: dec(q) }, imprevus);
  if (!r.ok) throw new Error(r.erreurs.join(' / '));
  return r.valeur;
}

function passerCorrige(p: Partie, id: string) {
  const ex = exerciceEntreprise(p, id);
  expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const op = ex.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = r.valeur;
  });
  return d;
}

describe('imprévus', () => {
  it("hausse du fournisseur : prix d'achat majoré pour l'entreprise touchée seulement", () => {
    let p = jouer(partie(reglages()), 80, [{ type: 'hausseFournisseur', entrepriseId: 'a', pourcent: 10 }]);
    const t = p.tours[0]!;
    expect(t.resultats[0]!.prixAchatUnitaire).toBe(prixAchat(SECTEUR_VELOS, 'grossiste', 1, 10));
    expect(t.resultats[0]!.prixAchatUnitaire).toBe(57200);
    expect(t.resultats[1]!.prixAchatUnitaire).toBe(52000);
    expect(t.imprevus).toHaveLength(1);
    p = jouer(p, 80, [{ type: 'hausseFournisseur', entrepriseId: null, pourcent: 5 }]);
    expect(p.tours[1]!.resultats.every((r) => r.prixAchatUnitaire === 54600)).toBe(true);
  });

  it('refuse les imprévus impossibles', () => {
    const p0 = partie(reglages());
    expect(controlerImprevu(p0, { type: 'hausseFournisseur', entrepriseId: null, pourcent: 20 })).toHaveLength(1);
    expect(controlerImprevu(p0, { type: 'clientInsolvable', entrepriseId: 'a' }).join()).toMatch(/aucune facture client/);
    const cfc1 = partie(reglages({ niveau: 'CFC1' }));
    expect(controlerImprevu(cfc1, { type: 'clientInsolvable', entrepriseId: 'a' }).join()).toMatch(/réservé au CFC 2/);
    expect(jouerTour(p0, { a: dec(10), b: dec(10) }, [{ type: 'clientInsolvable', entrepriseId: 'a' }]).ok).toBe(false);
  });

  it('client insolvable : acte de défaut de biens 3805 / 1100 pour une facture, le reste est encaissé', () => {
    let p = jouer(partie(reglages()), 80);
    const creances = p.tours[0]!.resultats[0]!.etatFin.creancesClients;
    expect(creances).toBeGreaterThan(89900);
    const imp: Imprevu = { type: 'clientInsolvable', entrepriseId: 'a' };
    expect(imprevusEntreprise(p, [imp], 'a').perteClient).toBe(89900);
    p = jouer(p, 80, [imp]);
    const els = p.tours[1]!.resultats[0]!.elements;
    const adb = els.find((e) => e.piece.titre === 'ACTE DE DÉFAUT DE BIENS')!;
    expect(adb.lignes).toEqual([{ debit: '3805', credit: '1100', montant: 89900 }]);
    const encaissement = els.find((e) => e.lignes[0]!.debit === '1020' && e.lignes[0]!.credit === '1100')!;
    expect(encaissement.lignes[0]!.montant).toBe(creances - 89900);
    expect(p.tours[1]!.resultats[1]!.elements.some((e) => e.piece.titre === 'ACTE DE DÉFAUT DE BIENS')).toBe(false);
  });

  it("une partie avec imprévus se rejoue à l'identique", () => {
    const imprevus: Imprevu[][] = [[], [{ type: 'clientInsolvable', entrepriseId: 'b' }, { type: 'hausseFournisseur', entrepriseId: null, pourcent: 8 }]];
    let p = partie(reglages());
    p = jouer(p, 80, imprevus[0]);
    p = jouer(p, 80, imprevus[1]);
    const r = rejouer(reglages(), E, [{ a: dec(80), b: dec(80) }, { a: dec(80), b: dec(80) }], imprevus);
    expect(r.ok && r.valeur).toEqual(p);
  });
});

describe('année complète avec imprévus et ducroire (CFC 2)', () => {
  let p = partie(reglages());
  p = jouer(p, 80);
  p = jouer(p, 80, [{ type: 'clientInsolvable', entrepriseId: 'a' }, { type: 'hausseFournisseur', entrepriseId: 'b', pourcent: 7 }]);
  p = jouer(p, 70);
  p = jouer(p, 60);

  it.each(['a', 'b'])('%s : comptes conformes, ducroire de 5 % des créances au 31.12', (id) => {
    const d = passerCorrige(p, id);
    const fin = p.tours.at(-1)!.resultats.find((r) => r.entrepriseId === id)!.etatFin;
    expect(fin.ducroire).toBe(montantDucroire(fin.creancesClients));
    expect(soldeDe(d, '1109') + fin.ducroire).toBe(0);
    expect(soldeDe(d, '1100')).toBe(fin.creancesClients);
    expect(soldeDe(d, '1020')).toBe(fin.banque);
    expect(resultatExercice(d)).toBe(fin.resultatCumule);
  });
});

describe('fiche de calcul AFP', () => {
  it('donne les données du tour et des réponses cohérentes', () => {
    const r = reglages({ niveau: 'AFP', comptabilite: 'automatique', dureeTour: 'mois', nbTours: 3, cloture: false });
    let p = partie(r);
    const d = { prixVente: 89900, quantiteAchetee: 10, publicite: 50000, fournisseur: 'grossiste' as const, prelevementPrive: 0 };
    const t = jouerTour(p, { a: d, b: { ...d, prixVente: 85000 } });
    if (!t.ok) throw new Error(t.erreurs.join());
    p = t.valeur;
    const f = ficheAfp(p, 'a', 1);
    const res = p.tours[0]!.resultats[0]!;
    expect(f.entreprise).toBe('Les Lémaniques');
    expect(f.periode).toBe('janvier 2027');
    expect(f.donnees.map((x) => x.libelle)).toContain('Ventes du tour');
    expect(f.questions.map((q) => q.libelle)).toEqual([
      "Chiffre d'affaires", "Coût d'achat des marchandises vendues", 'Marge brute', 'Charges', f.benefice >= 0 ? 'Bénéfice' : 'Perte', 'Stock à la fin',
    ]);
    // Prix d'achat constant (vélos) : la fiche donne exactement le résultat du simulateur.
    expect(f.benefice).toBe(res.resultat);
    expect(f.questions.at(-1)!.reponse).toBe(`${res.etatFin.stockUnites} vélos de ville`);
  });
});
