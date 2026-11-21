import { describe, expect, it } from 'vitest';
import { MARCHE_PAR_DEFAUT, SECTEURS, SECTEUR_VELOS } from '../src/data/simulation/secteurs';
import {
  controlerDecisions,
  creerPartie,
  etatInitial,
  exerciceEntreprise,
  jouerTour,
  moisDuTour,
  operationsParTour,
  repartirEntiers,
  repartirMarche,
  tableauResultats,
} from '../src/engine/simulation';
import type { Decisions, DureeTour, Partie, ReglagesPartie, Secteur } from '../src/engine/simulation';
import { controlerExercice, creerDossier } from '../src/engine/exercice';
import { comptesDisponibles } from '../src/engine/dossier';
import { ajouterEcriture } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { bilan, resultatExercice } from '../src/engine/statements';
import { boucler } from '../src/engine/closing';
import { plan } from './fixtures';

const reglages = (o: Partial<ReglagesPartie> = {}): ReglagesPartie => ({
  niveau: 'CFC1',
  secteur: SECTEUR_VELOS,
  dureeTour: 'mois',
  nbTours: 3,
  annee: 2026,
  comptabilite: 'eleves',
  affichage: 'classement',
  cloture: false,
  marche: MARCHE_PAR_DEFAUT,
  ...o,
});

const ENTREPRISES = [
  { id: 'a', nom: 'Les Lémaniques' },
  { id: 'b', nom: 'Rhône Express' },
  { id: 'c', nom: 'Salève Commerce' },
  { id: 'd', nom: 'Jet d\'Eau & Cie' },
];

function partie(r: ReglagesPartie, entreprises = ENTREPRISES): Partie {
  const p = creerPartie(r, entreprises);
  if (!p.ok) throw new Error(p.erreurs.join(' / '));
  return p.valeur;
}

/** Stratégies différentes selon l'entreprise : prix, fournisseur, publicité. */
function decisionsTypes(p: Partie): Record<string, Decisions> {
  const r = p.reglages;
  const s = r.secteur;
  const n = p.tours.length + 1;
  const mois = moisDuTour(r, n);
  const saison = mois.reduce((t, m) => t + s.saison[m - 1]!, 0) / 100;
  const prevu = Math.round(s.demandeMensuelleParEntreprise * saison);
  const etats = new Map(p.tours.length ? p.tours.at(-1)!.resultats.map((x) => [x.entrepriseId, x.etatFin]) : []);
  const strategies = [
    { prix: 1, four: 'grossiste' as const, pub: 1 },
    { prix: 0.92, four: 'importateur' as const, pub: 0.5 },
    { prix: 1.1, four: 'grossiste' as const, pub: 2 },
    { prix: 1.02, four: 'grossiste' as const, pub: 0 },
  ];
  const res: Record<string, Decisions> = {};
  p.entreprises.forEach((x, i) => {
    const st = strategies[i % strategies.length]!;
    const etat = etats.get(x.id) ?? etatInitial(s);
    const d: Decisions = {
      prixVente: Math.round((s.prixVenteReference * st.prix) / 5) * 5,
      quantiteAchetee: Math.max(0, prevu + 5 - etat.stockUnites),
      publicite: Math.round(s.publiciteReferenceMensuelle * mois.length * st.pub),
      fournisseur: st.four,
      prelevementPrive: i === 0 ? 50000 : 0,
    };
    // Comme un groupe prudent : on réduit la commande tant que les liquidités ne suffisent pas.
    while (d.quantiteAchetee > 0 && controlerDecisions(r, etat, d, n).length) d.quantiteAchetee -= 1;
    res[x.id] = d;
  });
  return res;
}

function jouerTout(p: Partie): Partie {
  while (p.tours.length < p.reglages.nbTours) {
    const r = jouerTour(p, decisionsTypes(p));
    if (!r.ok) throw new Error(r.erreurs.join(' / '));
    p = r.valeur;
  }
  return p;
}

describe('répartition entière', () => {
  it('répartit proportionnellement aux poids, à égalité de poids égalité de parts', () => {
    expect(repartirEntiers(10, [1, 1, 1])).toEqual([3, 3, 3]);
    expect(repartirEntiers(11, [1, 1, 2])).toEqual([3, 3, 5]);
    expect(repartirEntiers(100, [3, 1])).toEqual([75, 25]);
    expect(repartirEntiers(7, [0, 0])).toEqual([0, 0]);
    const p = repartirEntiers(1001, [1.7, 2.2, 0.4, 5]);
    expect(p.reduce((a, b) => a + b, 0)).toBe(1001);
  });
});

describe('règle du marché (prix et publicité)', () => {
  const s = SECTEUR_VELOS;
  const m = MARCHE_PAR_DEFAUT;
  const offre = (prix: number, publicite = 0, disponible = 1000) => ({ prix, publicite, disponible });

  it('des décisions identiques se partagent le marché à parts égales', () => {
    const r = repartirMarche(s, m, [4], [offre(89900), offre(89900), offre(89900), offre(89900)]);
    expect(r.demandeTotale).toBe(Math.round((25 * 4 * 130) / 100));
    expect(new Set(r.demandes).size).toBe(1);
  });

  it('un prix plus bas attire plus de clients', () => {
    const r = repartirMarche(s, m, [4], [offre(80000), offre(89900), offre(99900)]);
    expect(r.demandes[0]).toBeGreaterThan(r.demandes[1]!);
    expect(r.demandes[1]).toBeGreaterThan(r.demandes[2]!);
  });

  it('la publicité attire, de moins en moins à chaque franc', () => {
    const gain = (pub: number) => repartirMarche(s, m, [4], [offre(89900, pub), offre(89900)]).demandes[0]!;
    const sans = gain(0);
    const g1 = gain(100000) - sans;
    const g2 = gain(200000) - gain(100000);
    expect(g1).toBeGreaterThan(0);
    expect(g2).toBeGreaterThan(0);
    expect(g2).toBeLessThan(g1);
  });

  it('des prix moyens plus élevés réduisent la demande totale', () => {
    const bas = repartirMarche(s, m, [4], [offre(89900), offre(89900)]).demandeTotale;
    const haut = repartirMarche(s, m, [4], [offre(110000), offre(110000)]).demandeTotale;
    expect(haut).toBeLessThan(bas);
  });

  it('les ventes sont limitées par le stock disponible', () => {
    const r = repartirMarche(s, m, [6], [offre(89900, 0, 3), offre(89900)]);
    expect(r.vendues[0]).toBe(3);
    expect(r.demandes[0]).toBeGreaterThan(3);
    expect(r.vendues[1]).toBe(r.demandes[1]);
  });
});

describe('création de la partie et contrôle des décisions', () => {
  it('refuse les réglages incohérents', () => {
    expect(creerPartie(reglages({ dureeTour: 'trimestre', nbTours: 5 }), ENTREPRISES).ok).toBe(false);
    expect(creerPartie(reglages({ cloture: true, nbTours: 6 }), ENTREPRISES).ok).toBe(false);
    expect(creerPartie(reglages({ niveau: 'AFP', comptabilite: 'eleves' }), ENTREPRISES).ok).toBe(false);
    expect(creerPartie(reglages({ comptabilite: 'mixte', toursSaisis: [] }), ENTREPRISES).ok).toBe(false);
    expect(creerPartie(reglages(), [ENTREPRISES[0]!]).ok).toBe(false);
    expect(creerPartie(reglages(), [ENTREPRISES[0]!, { id: 'z', nom: ' les lémaniques ' }]).ok).toBe(false);
  });

  it('refuse une décision qui dépasse les liquidités, avec un message pour le groupe', () => {
    const r = reglages();
    const d: Decisions = { prixVente: 89900, quantiteAchetee: 60, publicite: 0, fournisseur: 'importateur', prelevementPrive: 0 };
    const e = controlerDecisions(r, etatInitial(r.secteur), d, 1);
    expect(e.join(' ')).toMatch(/Liquidités insuffisantes/);
    const g = controlerDecisions(r, etatInitial(r.secteur), { ...d, fournisseur: 'grossiste' }, 1);
    expect(g).toEqual([]);
  });

  it('refuse un tour incomplet et un tour de trop', () => {
    const p = partie(reglages({ nbTours: 1 }));
    const d = decisionsTypes(p);
    delete d['b'];
    const r = jouerTour(p, d);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erreurs).toEqual(['Rhône Express : décisions manquantes.']);
    const fini = jouerTout(p);
    expect(jouerTour(fini, decisionsTypes(fini)).ok).toBe(false);
  });

  it("en AFP, le grossiste est imposé et il n'y a pas de prélèvement privé", () => {
    const p = jouerTout(partie(reglages({ niveau: 'AFP', comptabilite: 'automatique', nbTours: 2 })));
    for (const t of p.tours) {
      for (const r of t.resultats) {
        expect(r.decisions.fournisseur).toBe('grossiste');
        expect(r.decisions.prelevementPrive).toBe(0);
      }
    }
  });

  it('est déterministe : mêmes décisions, mêmes résultats', () => {
    const a = jouerTout(partie(reglages()));
    const b = jouerTout(partie(reglages()));
    expect(a).toEqual(b);
  });
});

const CAS: [Secteur, DureeTour, number][] = SECTEURS.flatMap((s) => [
  [s, 'mois', 12] as [Secteur, DureeTour, number],
  [s, 'trimestre', 4] as [Secteur, DureeTour, number],
]);

describe.each(CAS.map(([s, d, n]) => [`${s.nom}, ${n} tours d'un ${d}`, s, d, n] as const))(
  'année complète : %s',
  (_titre, secteur, dureeTour, nbTours) => {
    const p = jouerTout(partie(reglages({ secteur, dureeTour, nbTours, cloture: true })));

    it.each(ENTREPRISES.map((x) => [x.nom, x.id] as const))(
      '%s : exercice valide, corrigé complet, comptes conformes à la simulation, bouclement possible',
      (_nom, id) => {
        const ex = exerciceEntreprise(p, id);
        expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
        let d = creerDossier(ex, plan);
        const dispo = new Set(comptesDisponibles(d).map((c) => c.numero));
        ex.corrige!.forEach((c, i) => {
          for (const l of c.lignes) for (const n of [l.debit, l.credit]) if (n) expect(dispo.has(n), `${c.piece} : ${n}`).toBe(true);
          expect(c.lignes.every((l) => l.montant > 0 && Number.isSafeInteger(l.montant))).toBe(true);
          const op = ex.operations.find((o) => o.numero === c.piece)!;
          const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
          if (!r.ok) throw new Error(`Pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
          d = r.valeur;
        });
        expect(balance(d).equilibree).toBe(true);
        expect(bilan(d).equilibre).toBe(true);

        const fin = p.tours.at(-1)!.resultats.find((r) => r.entrepriseId === id)!.etatFin;
        expect(soldeDe(d, '1020')).toBe(fin.banque);
        expect(soldeDe(d, '1000')).toBe(fin.caisse);
        expect(soldeDe(d, '1100')).toBe(fin.creancesClients);
        expect(soldeDe(d, '2000') + fin.dettesFournisseurs).toBe(0);
        expect(soldeDe(d, '1200')).toBe(fin.stockValeur);
        // Après l'inventaire, le résultat comptable est celui de la simulation (prix d'achat moyen pondéré).
        expect(resultatExercice(d)).toBe(fin.resultatCumule);
        expect(fin.banque).toBeGreaterThanOrEqual(0);

        expect(ex.parametres.corrigerBouclement).toBe(true);
        expect(boucler(d).ok).toBe(true);
      },
    );

    it('les opérations sont réparties par tour, sans trou', () => {
      const parTour = operationsParTour(p, 'a');
      expect(parTour).toHaveLength(nbTours);
      const tous = parTour.flatMap((t) => t.numeros);
      expect(tous).toEqual(exerciceEntreprise(p, 'a').operations.map((o) => o.numero));
    });
  },
);

describe('tableau des résultats et classement', () => {
  it('classe selon le score multicritère, rangs 1 à n, totaux cohérents', () => {
    const p = jouerTout(partie(reglages({ nbTours: 4 })));
    const t = tableauResultats(p);
    expect(t).toHaveLength(4);
    expect(t[0]!.rang).toBe(1);
    for (let i = 1; i < t.length; i++) expect(t[i]!.score).toBeLessThanOrEqual(t[i - 1]!.score);
    const parts = t.reduce((s, l) => s + l.partMarchePourMille, 0);
    expect(Math.abs(parts - 1000)).toBeLessThanOrEqual(2);
  });

  it('des entreprises aux décisions identiques sont ex aequo', () => {
    const p0 = partie(reglages({ nbTours: 1 }), ENTREPRISES.slice(0, 2));
    const d: Decisions = { prixVente: 89900, quantiteAchetee: 10, publicite: 50000, fournisseur: 'grossiste', prelevementPrive: 0 };
    const r = jouerTour(p0, { a: d, b: d });
    if (!r.ok) throw new Error(r.erreurs.join(' / '));
    const t = tableauResultats(r.valeur);
    expect(t.map((l) => l.rang)).toEqual([1, 1]);
  });
});
