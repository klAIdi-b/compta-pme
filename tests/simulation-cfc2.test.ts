// Simulateur, niveau CFC 2 : TVA au net, salaires et charges sociales, véhicule amorti, capacité.
import { describe, expect, it } from 'vitest';
import { MARCHE_PAR_DEFAUT, SECTEURS, SECTEUR_VELOS } from '../src/data/simulation/secteurs';
import {
  amortissementVehicule,
  calculSalaires,
  capacite,
  controlerDecisions,
  creerPartie,
  etatInitial,
  exerciceEntreprise,
  jouerTour,
  moisDuTour,
  PARAMETRES_CFC2,
  prixVehiculeTtc,
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
  niveau: 'CFC2', secteur: SECTEUR_VELOS, dureeTour: 'mois', nbTours: 3, annee: 2027, comptabilite: 'eleves',
  affichage: 'classement', cloture: false, marche: MARCHE_PAR_DEFAUT, ...o,
});
const ENTREPRISES = [
  { id: 'a', nom: 'Les Lémaniques' },
  { id: 'b', nom: 'Rhône Express' },
  { id: 'c', nom: 'Salève Commerce' },
];

function partie(r: ReglagesPartie): Partie {
  const p = creerPartie(r, ENTREPRISES);
  if (!p.ok) throw new Error(p.erreurs.join(' / '));
  return p.valeur;
}

/** A : 1 employé ; B : 1 employé, achète le véhicule dès qu'il peut le payer ; C : aucun employé. */
function decisionsTypes(p: Partie): Record<string, Decisions> {
  const r = p.reglages;
  const s = r.secteur;
  const n = p.tours.length + 1;
  const mois = moisDuTour(r, n);
  const prevu = Math.round((s.demandeMensuelleParEntreprise * 2 * mois.reduce((t, m) => t + s.saison[m - 1]!, 0)) / 100);
  const res: Record<string, Decisions> = {};
  const strategies = [
    { prix: 1, four: 'grossiste' as const, pub: 1, employes: 1, vehicule: false, prive: 50000 },
    { prix: 0.97, four: 'grossiste' as const, pub: 0.5, employes: 1, vehicule: true, prive: 0 },
    { prix: 1.08, four: 'grossiste' as const, pub: 1.5, employes: 0, vehicule: false, prive: 0 },
  ];
  p.entreprises.forEach((x, i) => {
    const st = strategies[i]!;
    const etat = p.tours.at(-1)?.resultats.find((y) => y.entrepriseId === x.id)?.etatFin ?? etatInitial(s, r.niveau);
    const d: Decisions = {
      prixVente: Math.round((s.prixVenteReference * st.prix) / 5) * 5,
      quantiteAchetee: Math.max(0, prevu + 5 - etat.stockUnites),
      publicite: Math.round(s.publiciteReferenceMensuelle * mois.length * st.pub),
      fournisseur: st.four,
      prelevementPrive: st.prive,
      employes: st.employes,
      acheterVehicule: st.vehicule,
    };
    // Comme un groupe prudent : renoncer au véhicule, puis réduire la publicité, le prélèvement, le personnel, la commande.
    const refuse = () => controlerDecisions(r, etat, d, n).length > 0;
    if (refuse()) d.acheterVehicule = false;
    while (refuse() && d.publicite > 0) d.publicite = Math.max(0, d.publicite - 10000);
    if (refuse()) d.prelevementPrive = 0;
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

describe('règles du CFC 2', () => {
  it('salaires : retenues AVS/AI/APG 5,30 %, AC 1,10 %, LPP fixe ; part patronale et ALFA 2,40 %', () => {
    const s = calculSalaires(reglages(), 2, 1);
    expect(s.fiches).toHaveLength(2);
    const f = s.fiches[0]!;
    expect(f.brut).toBe(490000);
    expect(f.avsAc).toBe(25970 + 5390); // 259.70 + 53.90
    expect(f.lpp).toBe(24500);
    expect(f.net).toBe(490000 - 31360 - 24500);
    expect(s.alfa).toBe(23520); // 2,40 % de 9'800.00
    expect(s.patronLpp).toBe(49000);
  });

  it('capacité : par personne, +25 % avec le véhicule ; illimitée en CFC 1', () => {
    expect(capacite(reglages(), 1, false, 1)).toBe(50);
    expect(capacite(reglages(), 1, true, 3)).toBe(187);
    expect(capacite(reglages({ niveau: 'CFC1' }), 4, false, 1)).toBe(Number.POSITIVE_INFINITY);
  });

  it('amortissement direct dégressif 40 % au prorata des mois', () => {
    expect(amortissementVehicule({ valeurAcquisition: 3200000, valeurComptable: 3200000, moisAchat: 1 })).toBe(1280000);
    expect(amortissementVehicule({ valeurAcquisition: 3200000, valeurComptable: 3200000, moisAchat: 7 })).toBe(640000);
  });

  it('refuse plus de 4 employés et compte le véhicule dans les liquidités', () => {
    const r = reglages();
    const etat = etatInitial(r.secteur, 'CFC2');
    const d: Decisions = { prixVente: 89900, quantiteAchetee: 0, publicite: 0, fournisseur: 'grossiste', prelevementPrive: 0, employes: 5 };
    expect(controlerDecisions(r, etat, d, 1).join(' ')).toMatch(/entre 0 et 4/);
    expect(prixVehiculeTtc(r.secteur)).toBe(3200000 + 259200);
    const v = controlerDecisions(r, etat, { ...d, employes: 1, acheterVehicule: true }, 1);
    expect(v.join(' ')).toMatch(/Liquidités insuffisantes/);
  });

  it('le personnel limite les ventes quand la demande dépasse la capacité', () => {
    const p = partie(reglages({ nbTours: 6 }));
    const d = (employes: number): Decisions => ({ prixVente: 79900, quantiteAchetee: 25, publicite: 100000, fournisseur: 'grossiste', prelevementPrive: 0, employes });
    let q = p;
    for (let i = 0; i < 5; i++) {
      const r = jouerTour(q, { a: d(0), b: d(2), c: { ...d(0), prixVente: 99900, publicite: 0, quantiteAchetee: 0 } });
      if (!r.ok) throw new Error(r.erreurs.join());
      q = r.valeur;
    }
    const mai = q.tours.at(-1)!.resultats.find((x) => x.entrepriseId === 'a')!;
    expect(mai.vendues).toBeLessThanOrEqual(25); // le propriétaire seul : 25 clients par mois
    expect(mai.clientsPerdus).toBeGreaterThan(0);
  });
});

const CAS: [Secteur, DureeTour, number][] = SECTEURS.flatMap((s) => [
  [s, 'mois', 12] as [Secteur, DureeTour, number],
  [s, 'trimestre', 4] as [Secteur, DureeTour, number],
]);

describe.each(CAS.map(([s, d, n]) => [`${s.nom}, ${n} tours d'un ${d}`, s, d, n] as const))(
  'CFC 2, année complète : %s',
  (_titre, secteur, dureeTour, nbTours) => {
    const p = jouerTout(partie(reglages({ secteur, dureeTour, nbTours, cloture: true })));

    it.each(ENTREPRISES.map((x) => [x.nom, x.id] as const))(
      '%s : exercice valide, comptes conformes à la simulation (TVA, cotisations, véhicule), bouclement possible',
      (_nom, id) => {
        const ex = exerciceEntreprise(p, id);
        expect(ex.niveau).toBe('CFC2');
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
        expect(soldeDe(d, '1100')).toBe(fin.creancesClients);
        expect(soldeDe(d, '2000') + fin.dettesFournisseurs).toBe(0);
        expect(soldeDe(d, '1200')).toBe(fin.stockValeur);
        // Le décompte du 4e trimestre a soldé 2200, 1170 et 1171 ; TVA et cotisations restent dues à l'ouverture.
        expect(soldeDe(d, '2200') + soldeDe(d, '1170') + soldeDe(d, '1171')).toBe(0);
        expect(soldeDe(d, '2205') + fin.aPayer.tva).toBe(0);
        expect(soldeDe(d, '2170') + fin.aPayer.avs).toBe(0);
        expect(soldeDe(d, '2171') + fin.aPayer.lpp).toBe(0);
        expect(soldeDe(d, '2172') + fin.aPayer.alfa).toBe(0);
        expect(soldeDe(d, '1530')).toBe(fin.vehicule?.valeurComptable ?? 0);
        expect(resultatExercice(d)).toBe(fin.resultatCumule);
        expect(fin.banque).toBeGreaterThanOrEqual(0);
        expect(boucler(d).ok).toBe(true);
      },
    );

    it("seule l'entreprise B achète un véhicule (si ses liquidités le permettent) ; il est amorti au 31.12", () => {
      const fin = (id: string) => p.tours.at(-1)!.resultats.find((r) => r.entrepriseId === id)!.etatFin;
      if (dureeTour === 'mois') expect(fin('b').vehicule).not.toBeNull();
      const v = fin('b').vehicule;
      if (v) expect(v.valeurComptable).toBeLessThan(v.valeurAcquisition);
      expect(fin('a').vehicule).toBeNull();
      expect(fin('c').vehicule).toBeNull();
    });
  },
);
