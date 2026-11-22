// Fiches à imprimer pour les groupes (22.11.2026) : règles du jeu et fiche de décisions, d'après les règles validées.
import { describe, expect, it } from 'vitest';
import { MARCHE_PAR_DEFAUT, SECTEUR_VELOS } from '../src/data/simulation/secteurs';
import { creerPartie, ficheDecisions, jouerTour, reglesDuJeu, SANS_IMPREVU, etatInitial, type Decisions, type Partie, type ReglagesPartie } from '../src/engine/simulation';
import { formatMontant } from '../src/engine/money';

const reglages = (o: Partial<ReglagesPartie> = {}): ReglagesPartie => ({
  niveau: 'CFC1', secteur: SECTEUR_VELOS, dureeTour: 'mois', nbTours: 3, annee: 2027, comptabilite: 'eleves',
  affichage: 'classement', cloture: false, marche: MARCHE_PAR_DEFAUT, ...o,
});
const texte = (r: ReglagesPartie) => reglesDuJeu(r).flatMap((b) => [b.titre, ...b.items]).join('\n');

function partie(r: ReglagesPartie): Partie {
  const p = creerPartie(r, [{ id: 'a', nom: 'Les Lémaniques' }, { id: 'b', nom: 'Rhône Vélos' }]);
  if (!p.ok) throw new Error(p.erreurs.join(' / '));
  return p.valeur;
}

const prudentes = (p: Partie): Record<string, Decisions> =>
  Object.fromEntries(
    p.entreprises.map((x) => [
      x.id,
      { prixVente: p.reglages.secteur.prixVenteReference, quantiteAchetee: 10, publicite: 0, fournisseur: 'grossiste', prelevementPrive: 0, employes: etatInitial(p.reglages.secteur, p.reglages.niveau).employes, acheterVehicule: false, emprunt: 0, dividendePourcent: 0 } as Decisions,
    ]),
  );

describe('règles du jeu', () => {
  it('reprennent les décisions de chaque niveau, sans en ajouter', () => {
    const afp = texte(reglages({ niveau: 'AFP', comptabilite: 'automatique' }));
    expect(afp).not.toMatch(/importateur|Prélèvement privé|employés|emprunt/i);
    expect(afp).toMatch(/fiche de calcul/);
    const cfc1 = texte(reglages());
    expect(cfc1).toMatch(/prélèvement privé/);
    expect(cfc1).toMatch(/8 % moins cher mais payé à la commande/);
    expect(cfc1).not.toMatch(/employés|TVA|emprunt/);
    const cfc2 = texte(reglages({ niveau: 'CFC2' }));
    expect(cfc2).toMatch(/De 0|de 0 à 4/);
    expect(cfc2).toMatch(/TVA comprise \(8,1 %\)/);
    expect(cfc2).toMatch(/\+25 % avec le véhicule/);
    const mp = texte(reglages({ niveau: 'MP' }));
    expect(mp).toMatch(/emprunt bancaire/i);
    expect(mp).not.toMatch(/Le prélèvement privé/);
    expect(mp).not.toMatch(/dividende proposé/); // pas de clôture dans cette partie
    expect(texte(reglages({ niveau: 'MP', nbTours: 12, cloture: true }))).toMatch(/dividende proposé/);
  });

  it('chiffres tirés des données du secteur et du marché', () => {
    const t = texte(reglages());
    const s = SECTEUR_VELOS;
    expect(t).toContain(`Loyer : ${formatMontant(s.loyerMensuel)} CHF par mois`);
    expect(t).toContain(`(prix de référence du marché : ${formatMontant(s.prixVenteReference)} CHF)`);
    expect(t).toContain(`jusqu’à +60 %`);
    expect(t).toContain(`avec ${formatMontant(s.publiciteReferenceMensuelle)} CHF par mois`);
    expect(t).toContain(`environ ${s.demandeMensuelleParEntreprise} par entreprise`);
    // CFC 2 : commerce deux fois plus grand
    expect(texte(reglages({ niveau: 'CFC2' }))).toContain(`environ ${s.demandeMensuelleParEntreprise * 2} par entreprise`);
  });

  it('le classement et sa pondération ne figurent que si la partie affiche un classement', () => {
    expect(texte(reglages())).toMatch(/×2, la trésorerie ×1 et la part de marché depuis le début ×1/);
    expect(texte(reglages({ affichage: 'sansRang' }))).not.toMatch(/×2/);
    expect(texte(reglages({ affichage: 'cache' }))).toMatch(/ne voit que ses propres résultats/);
  });
});

describe('fiche de décisions', () => {
  it('situation au début du premier tour, puis résumé du tour précédent ; rien après le dernier tour', () => {
    let p = partie(reglages({ nbTours: 2 }));
    const f1 = ficheDecisions(p, 'a', SANS_IMPREVU)!;
    expect(f1.entreprise).toBe('Les Lémaniques');
    expect(f1.tour).toMatch(/^Tour 1 sur 2/);
    expect(f1.situation[0]).toEqual({ libelle: 'Avoir en banque', valeur: `${formatMontant(SECTEUR_VELOS.ouverture.banque)} CHF` });
    expect(f1.precedent).toBeNull();
    expect(f1.decisions.map((d) => d.libelle)).toContain('Prélèvement privé du propriétaire (CHF)');
    const r = jouerTour(p, prudentes(p));
    if (!r.ok) throw new Error(r.erreurs.join(' / '));
    p = r.valeur;
    expect(ficheDecisions(p, 'a', SANS_IMPREVU)!.precedent).toMatch(/^Tour précédent/);
    const r2 = jouerTour(p, prudentes(p));
    if (!r2.ok) throw new Error(r2.erreurs.join(' / '));
    expect(ficheDecisions(r2.valeur, 'a', SANS_IMPREVU)).toBeNull();
  });

  it('une hausse du fournisseur annoncée change le prix d’achat rappelé', () => {
    const p = partie(reglages());
    const sans = ficheDecisions(p, 'a', SANS_IMPREVU)!.rappels.join(' ');
    const avec = ficheDecisions(p, 'a', { hausseAchatPourcent: 10, perteClient: 0 })!.rappels.join(' ');
    expect(avec).not.toBe(sans);
  });

  it('CFC 2 : employés, véhicule et capacité ; MP : emprunt, sans prélèvement privé', () => {
    const c2 = ficheDecisions(partie(reglages({ niveau: 'CFC2' })), 'a', SANS_IMPREVU)!;
    expect(c2.decisions.map((d) => d.libelle)).toEqual(expect.arrayContaining(['Nombre d’employés (sans le propriétaire)', 'Acheter le véhicule de livraison']));
    expect(c2.rappels.join(' ')).toMatch(/Capacité : 25 clients par personne/);
    const mp = ficheDecisions(partie(reglages({ niveau: 'MP' })), 'a', SANS_IMPREVU)!;
    const libelles = mp.decisions.map((d) => d.libelle);
    expect(libelles).toContain('Nouvel emprunt bancaire (CHF)');
    expect(libelles).not.toContain('Prélèvement privé du propriétaire (CHF)');
  });
});
