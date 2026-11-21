import { describe, expect, it } from 'vitest';
import { MARCHE_PAR_DEFAUT, SECTEUR_EPICERIE } from '../src/data/simulation/secteurs';
import { creerPartie, detailSorties, etatInitial, jouerTour, rejouer, sortiesPrevues } from '../src/engine/simulation';
import type { Decisions, ReglagesPartie } from '../src/engine/simulation';
import { exporterPartie, importerPartie, partieDe, type PartieEnregistree } from '../src/io/simulation';
import { ErreurFichier } from '../src/io/fichiers';

const reglages: ReglagesPartie = {
  niveau: 'CFC1', secteur: SECTEUR_EPICERIE, dureeTour: 'mois', nbTours: 3, annee: 2027,
  comptabilite: 'eleves', affichage: 'classement', cloture: false, marche: MARCHE_PAR_DEFAUT,
};
const entreprises = [{ id: 'e1', nom: 'Les Gourmets' }, { id: 'e2', nom: 'Panier Lémanique' }];
const d = (prix: number, q: number): Decisions => ({ prixVente: prix, quantiteAchetee: q, publicite: 50000, fournisseur: 'grossiste', prelevementPrive: 0 });
const tours = [
  { e1: d(4900, 200), e2: d(4500, 250) },
  { e1: d(4900, 250), e2: d(4700, 250) },
];

function enregistree(): PartieEnregistree {
  return { id: 'sim-1', nom: '2CA printemps', creeLe: '2026-11-21T08:00:00.000Z', reglages, entreprises, decisionsParTour: tours, brouillon: { e1: d(5000, 100) } };
}

describe('rejouer une partie', () => {
  it('donne exactement la partie jouée tour par tour', () => {
    const c = creerPartie(reglages, entreprises);
    if (!c.ok) throw new Error();
    let p = c.valeur;
    for (const t of tours) {
      const r = jouerTour(p, t);
      if (!r.ok) throw new Error(r.erreurs.join());
      p = r.valeur;
    }
    const r = rejouer(reglages, entreprises, tours);
    expect(r.ok && r.valeur).toEqual(p);
  });

  it('signale le tour fautif', () => {
    const r = rejouer(reglages, entreprises, [{ e1: d(4900, 200) }]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erreurs[0]).toMatch(/^Tour 1 : Panier Lémanique : décisions manquantes/);
  });
});

describe('paiements prévus', () => {
  it('détaille les postes et leur total', () => {
    const et = { ...etatInitial(SECTEUR_EPICERIE), dettesFournisseurs: 560000 };
    const x: Decisions = { prixVente: 4900, quantiteAchetee: 100, publicite: 80000, fournisseur: 'importateur', prelevementPrive: 30000 };
    const s = detailSorties(reglages, et, x, 1);
    expect(s.lignes.map((l) => l.libelle)).toEqual([
      'Facture du grossiste du tour précédent', 'Commande payée à la commande', 'Loyer', 'Publicité', 'Prélèvement privé',
    ]);
    expect(s.total).toBe(sortiesPrevues(reglages, et, x, 1));
    expect(s.commandeReportee).toBe(0);
    expect(detailSorties(reglages, et, { ...x, fournisseur: 'grossiste' }, 1).commandeReportee).toBe(100 * 2800);
  });
});

describe('fichier de partie', () => {
  it("s'exporte et se réimporte à l'identique, partie recalculée", () => {
    const e = enregistree();
    const lue = importerPartie(exporterPartie(e));
    expect(lue).toEqual(e);
    expect(partieDe(lue).tours).toHaveLength(2);
  });

  it("refuse un autre fichier, un fichier endommagé ou incohérent", () => {
    expect(() => importerPartie('pas du json')).toThrow(ErreurFichier);
    expect(() => importerPartie(JSON.stringify({ format: 'compta-pme/exercice', version: 1 }))).toThrow(/pas une partie/);
    expect(() => importerPartie(JSON.stringify({ format: 'compta-pme/simulation', version: 1, partie: { id: 'x' } }))).toThrow(/incomplète/);
    const faussee = { ...enregistree(), decisionsParTour: [{ e1: d(1, 200), e2: d(4500, 250) }] };
    expect(() => importerPartie(exporterPartie(faussee))).toThrow(/ne peut pas être recalculée/);
  });

  it("ne contient aucun champ de nom d'élève", () => {
    const texte = exporterPartie(enregistree());
    expect(texte).not.toMatch(/"(prenom|nom_?eleve|eleve|classe)"\s*:/i);
  });
});

describe('comptabilité mixte (phase S4)', () => {
  const mixte: ReglagesPartie = { ...reglages, nbTours: 3, comptabilite: 'mixte', toursSaisis: [2] };
  const p = (() => {
    const r = rejouer(mixte, entreprises, [...tours, { e1: d(4900, 200), e2: d(4600, 250) }]);
    if (!r.ok) throw new Error(r.erreurs.join());
    return r.valeur;
  })();

  it('seul le tour 2 devient des opérations ; les tours 1 et 3 sont des écritures automatiques', async () => {
    const { exerciceEntreprise, operationsParTour } = await import('../src/engine/simulation');
    const ex = exerciceEntreprise(p, 'e1');
    const parTour = operationsParTour(p, 'e1');
    expect(parTour.map((t) => t.saisi)).toEqual([false, true, false]);
    expect(ex.operations.map((o) => o.numero)).toEqual(parTour[1]!.numeros);
    expect(ex.operations[0]!.numero).toBe('1');
    expect(ex.ecrituresAutomatiques!.map((a) => a.piece)).toEqual([...parTour[0]!.numeros, ...parTour[2]!.numeros]);
    expect(ex.ecrituresAutomatiques![0]!.piece).toBe('A1-1');
    expect(ex.introduction).toMatch(/déjà été comptabilisées par le logiciel/);
  });

  it("l'élève ne saisit que le tour 2 : les écritures automatiques sont au journal, verrouillées et jamais corrigées", async () => {
    const { exerciceEntreprise } = await import('../src/engine/simulation');
    const { controlerExercice, creerDossier } = await import('../src/engine/exercice');
    const { ajouterEcriture, extourner, supprimerEcriture, modifierEcriture } = await import('../src/engine/journal');
    const { avancement } = await import('../src/engine/correction');
    const { estEcritureBouclement } = await import('../src/engine/correction-bouclement');
    const { corrigerCopie } = await import('../src/engine/notation');
    const { plan } = await import('./fixtures');
    const ex = exerciceEntreprise(p, 'e1');
    expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
    let dossier = creerDossier(ex, plan);
    expect(dossier.ecritures.length).toBe(ex.ecrituresAutomatiques!.length);
    const auto = dossier.ecritures[0]!;
    expect(auto.automatique).toBe(true);
    expect(estEcritureBouclement(auto, ex)).toBe(false);
    expect(extourner(dossier, auto.id, auto.date).ok).toBe(false);
    expect(supprimerEcriture(dossier, auto.id).ok).toBe(false);
    expect(modifierEcriture(dossier, auto.id, { ...auto }).ok).toBe(false);
    for (const c of ex.corrige!) {
      const op = ex.operations.find((o) => o.numero === c.piece)!;
      const r = ajouterEcriture(dossier, { id: `E${c.piece}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
      if (!r.ok) throw new Error(r.erreurs.join());
      dossier = r.valeur;
    }
    const a = avancement(ex.operations, dossier.ecritures, ex.corrige!);
    expect(a.justes).toBe(ex.operations.length);
    const n = corrigerCopie(ex, dossier);
    expect(n.points).toBe(n.max);
  });
});

describe('nouvelle version de l’exercice après un tour (simulateur)', () => {
  it("garde les écritures de l'élève et remplace les écritures automatiques", async () => {
    const { exerciceEntreprise } = await import('../src/engine/simulation');
    const { actualiserDossier, creerDossier, estNouvelleVersionSimulation } = await import('../src/engine/exercice');
    const { ajouterEcriture } = await import('../src/engine/journal');
    const { plan } = await import('./fixtures');
    const mixte: ReglagesPartie = { ...reglages, nbTours: 3, comptabilite: 'mixte', toursSaisis: [1] };
    const p1 = rejouer(mixte, entreprises, [tours[0]!]);
    const p2 = rejouer(mixte, entreprises, tours);
    if (!p1.ok || !p2.ok) throw new Error();
    const v1 = exerciceEntreprise(p1.valeur, 'e1');
    const v2 = exerciceEntreprise(p2.valeur, 'e1');
    expect(estNouvelleVersionSimulation(v1, v2)).toBe(true);
    expect(estNouvelleVersionSimulation(v1, v1)).toBe(false);
    let d = creerDossier(v1, plan);
    const c = v1.corrige![0]!;
    const r = ajouterEcriture(d, { id: 'E1', date: v1.operations[0]!.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = actualiserDossier(r.valeur, v2);
    expect(d.ecritures.filter((e) => !e.automatique).map((e) => e.id)).toEqual(['E1']);
    expect(d.ecritures.filter((e) => e.automatique)).toHaveLength(v2.ecrituresAutomatiques!.length);
  });
});
