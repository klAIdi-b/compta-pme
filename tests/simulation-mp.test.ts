// Simulateur, niveau MP : SA, emprunt bancaire et intérêts trimestriels, répartition du bénéfice.
import { describe, expect, it } from 'vitest';
import { MARCHE_PAR_DEFAUT, SECTEURS, SECTEUR_VELOS } from '../src/data/simulation/secteurs';
import {
  controlerDecisions,
  creerPartie,
  donneesRepartition,
  etatInitial,
  exerciceEntreprise,
  fondsPropresMp,
  interetMensuel,
  jouerTour,
  moisDuTour,
  tableauResultats,
} from '../src/engine/simulation';
import type { Decisions, DureeTour, Partie, ReglagesPartie, Secteur } from '../src/engine/simulation';
import { controlerExercice, creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { bilan, resultatExercice } from '../src/engine/statements';
import { boucler } from '../src/engine/closing';
import { repartir } from '../src/engine/repartition';
import { plan } from './fixtures';

const reglages = (o: Partial<ReglagesPartie> = {}): ReglagesPartie => ({
  niveau: 'MP', secteur: SECTEUR_VELOS, dureeTour: 'mois', nbTours: 3, annee: 2027, comptabilite: 'eleves',
  affichage: 'classement', cloture: false, marche: MARCHE_PAR_DEFAUT, ...o,
});
const ENTREPRISES = [
  { id: 'a', nom: 'Léman Cycles SA' },
  { id: 'b', nom: 'Rhône Mobilité SA' },
  { id: 'c', nom: 'Salève Sport SA' },
];

function partie(r: ReglagesPartie): Partie {
  const p = creerPartie(r, ENTREPRISES);
  if (!p.ok) throw new Error(p.erreurs.join(' / '));
  return p.valeur;
}

/** A : sans emprunt ; B : emprunte 40'000 au 1er tour pour le véhicule ; C : emprunte 20'000 au 3e tour. */
function decisionsTypes(p: Partie): Record<string, Decisions> {
  const r = p.reglages;
  const s = r.secteur;
  const n = p.tours.length + 1;
  const mois = moisDuTour(r, n);
  const prevu = Math.round((s.demandeMensuelleParEntreprise * 2 * mois.reduce((t, m) => t + s.saison[m - 1]!, 0)) / 100);
  const res: Record<string, Decisions> = {};
  const strategies = [
    { prix: 1, employes: 1, emprunt: 0, vehicule: false, div: 10 },
    { prix: 0.97, employes: 1, emprunt: n === 1 ? 4000000 : 0, vehicule: true, div: 50 },
    { prix: 1.05, employes: 0, emprunt: n === 3 ? 2000000 : 0, vehicule: false, div: 0 },
  ];
  p.entreprises.forEach((x, i) => {
    const st = strategies[i]!;
    const etat = p.tours.at(-1)?.resultats.find((y) => y.entrepriseId === x.id)?.etatFin ?? etatInitial(s, r.niveau);
    const d: Decisions = {
      prixVente: Math.round((s.prixVenteReference * st.prix) / 5) * 5,
      quantiteAchetee: Math.max(0, prevu + 5 - etat.stockUnites),
      publicite: s.publiciteReferenceMensuelle * mois.length,
      fournisseur: 'grossiste',
      prelevementPrive: 0,
      employes: st.employes,
      acheterVehicule: st.vehicule,
      emprunt: st.emprunt,
      dividendePourcent: st.div,
    };
    const refuse = () => controlerDecisions(r, etat, d, n).length > 0;
    if (refuse()) d.acheterVehicule = false;
    while (refuse() && d.publicite > 0) d.publicite = Math.max(0, d.publicite - 10000);
    while (refuse() && d.employes! > 0) d.employes! -= 1;
    while (refuse() && d.quantiteAchetee > 0) d.quantiteAchetee -= 1;
    res[x.id] = d;
  });
  return res;
}

function jouerTout(p: Partie): Partie {
  while (p.tours.length < p.reglages.nbTours) {
    const r = jouerTour(p, decisionsTypes(p));
    if (!r.ok) throw new Error(`Tour ${p.tours.length + 1} : ${r.erreurs.join(' / ')}`);
    p = r.valeur;
  }
  return p;
}

describe('règles du MP', () => {
  it('capital-actions en dizaines de milliers, le reste en bénéfice reporté ; intérêts 4 % par an', () => {
    expect(fondsPropresMp(SECTEUR_VELOS)).toEqual({ capital: 6000000, reporte: 780000 });
    expect(interetMensuel(4000000)).toBe(13333);
  });

  it("emprunt plafonné, compté dans les liquidités ; dividende limité", () => {
    const r = reglages();
    const etat = etatInitial(r.secteur, 'MP');
    const d: Decisions = { prixVente: 89900, quantiteAchetee: 0, publicite: 0, fournisseur: 'grossiste', prelevementPrive: 0, employes: 1, acheterVehicule: true };
    expect(controlerDecisions(r, etat, d, 1).join(' ')).toMatch(/Liquidités insuffisantes/);
    expect(controlerDecisions(r, etat, { ...d, emprunt: 4000000 }, 1)).toEqual([]);
    expect(controlerDecisions(r, etat, { ...d, emprunt: 20000000 }, 1).join(' ')).toMatch(/ne peut pas dépasser/);
    expect(controlerDecisions(r, etat, { ...d, acheterVehicule: false, dividendePourcent: 80 }, 1).join(' ')).toMatch(/dividende/);
  });
});

const CAS: [Secteur, DureeTour, number][] = SECTEURS.flatMap((s) => [
  [s, 'mois', 12] as [Secteur, DureeTour, number],
  [s, 'trimestre', 4] as [Secteur, DureeTour, number],
]);

describe.each(CAS.map(([s, d, n]) => [`${s.nom}, ${n} tours d'un ${d}`, s, d, n] as const))(
  'MP, année complète : %s',
  (_titre, secteur, dureeTour, nbTours) => {
    const p = jouerTout(partie(reglages({ secteur, dureeTour, nbTours, cloture: true })));

    it.each(ENTREPRISES.map((x) => [x.nom, x.id] as const))(
      '%s : SA valide, emprunt et intérêts conformes, bouclement par 2970, répartition possible',
      (_nom, id) => {
        const ex = exerciceEntreprise(p, id);
        expect(ex.niveau).toBe('MP');
        expect(ex.formeJuridique).toBe('SA');
        expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
        let d = creerDossier(ex, plan);
        ex.corrige!.forEach((c, i) => {
          const op = ex.operations.find((o) => o.numero === c.piece)!;
          const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
          if (!r.ok) throw new Error(`Pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
          d = r.valeur;
        });
        expect(balance(d).equilibree).toBe(true);
        expect(bilan(d).equilibre).toBe(true);
        const fin = p.tours.at(-1)!.resultats.find((r) => r.entrepriseId === id)!.etatFin;
        expect(soldeDe(d, '1020')).toBe(fin.banque);
        expect(soldeDe(d, '2400') + fin.emprunt).toBe(0);
        expect(fin.interetsTrimestre).toBe(0);
        expect(resultatExercice(d)).toBe(fin.resultatCumule);
        const b = boucler(d);
        expect(b.ok).toBe(true);
        if (b.ok) expect(soldeDe(b.valeur, '2970') + fondsPropresMp(secteur).reporte + fin.resultatCumule).toBe(0);
        const rep = ex.parametres.repartition;
        if (fin.resultatCumule > 0) {
          expect(rep).toEqual(donneesRepartition(p, id));
          expect(repartir(rep!).ok).toBe(true);
        } else expect(rep).toBeUndefined();
      },
    );

    it("l'entreprise qui a emprunté paie des intérêts ; le tableau montre la rentabilité des fonds propres", () => {
      const ex = exerciceEntreprise(p, 'b');
      const interets = ex.corrige!.flatMap((c) => c.lignes).filter((l) => l.debit === '6900').reduce((t, l) => t + l.montant, 0);
      expect(interets).toBeGreaterThan(0);
      expect(tableauResultats(p).every((l) => typeof l.rentabiliteFondsPropresPourMille === 'number')).toBe(true);
    });
  },
);
