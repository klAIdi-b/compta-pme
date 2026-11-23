import { describe, expect, it } from 'vitest';
import { dossierFacturationLeman, facturationLeman } from '../src/data/dossiers/cfc-facturation';
import { plan } from '../src/data/plan';
import { boucler } from '../src/engine/closing';
import type { Dossier } from '../src/engine/dossier';
import { controlerExercice, creerDossier, fonctionsExercice } from '../src/engine/exercice';
import {
  ajouterJours, calculFacture, calculPaiement, champsControle, champsFacture, champsPaiement, controlerChamp,
  noterFacturation, situationFacture, type ChampAttendu, type FicheFacturation,
} from '../src/engine/facturation';
import { ajouterEcriture } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { corrigerCopie } from '../src/engine/notation';
import { chf } from './fixtures';

const [f301, f302, f303] = facturationLeman.factures;

function valeur(c: ChampAttendu): string {
  if (c.type === 'chf') return ((c.attendu as number) / 100).toFixed(2);
  if (c.type === 'date') return (c.attendu as string).split('-').reverse().join('.');
  return String(c.attendu);
}

function ficheJuste(): FicheFacturation {
  const r: FicheFacturation = { factures: {}, paiements: {}, controle: {} };
  for (const f of facturationLeman.factures) r.factures[f.numero] = Object.fromEntries(champsFacture(f).map((c) => [c.cle, valeur(c)]));
  for (const p of facturationLeman.paiements) r.paiements[p.id] = Object.fromEntries(champsPaiement(p).map((c) => [c.cle, valeur(c)]));
  r.controle = Object.fromEntries(champsControle(facturationLeman.controle!).map((c) => [c.cle, valeur(c)]));
  return r;
}

function dossierCorrige(): Dossier {
  let d = creerDossier(dossierFacturationLeman, plan);
  dossierFacturationLeman.corrige!.forEach((c, i) => {
    const op = dossierFacturationLeman.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(`${c.piece} : ${r.erreurs.join()}`);
    d = r.valeur;
  });
  return d;
}

describe('facturation : calculs', () => {
  it('facture F-301 : rabais, TVA arrondie aux 5 centimes, escompte sur le total TVA comprise', () => {
    const c = calculFacture(f301!);
    expect(c.lignes).toEqual([chf(3560), chf(180)]);
    expect([c.brut, c.rabais, c.ht, c.tva, c.ttc]).toEqual([chf(3740), chf(374), chf(3366), chf(272.65), chf(3638.65)]);
    expect(c.echeance).toBe('2026-04-02');
    expect(c.escompteJusquau).toBe('2026-03-13');
    expect(c.aPayerAvecEscompte).toBe(chf(3565.9));
  });

  it('F-302 sans rabais ni escompte ; F-303 avec rabais de 5 %', () => {
    const c2 = calculFacture(f302!);
    expect([c2.ht, c2.tva, c2.ttc, c2.aPayerAvecEscompte]).toEqual([chf(1114), chf(90.25), chf(1204.25), null]);
    const c3 = calculFacture(f303!);
    expect([c3.brut, c3.rabais, c3.ht, c3.tva, c3.ttc]).toEqual([chf(2070), chf(103.5), chf(1966.5), chf(159.3), chf(2125.8)]);
  });

  it("délais : date + 30 jours, escompte jusqu'à la date + 10 jours", () => {
    expect(ajouterJours('2026-03-03', 30)).toBe('2026-04-02');
    expect(ajouterJours('2026-02-26', 30)).toBe('2026-03-28');
  });

  it('ordres de paiement : escompte seulement dans le délai', () => {
    const [gcr, sel, pdl] = facturationLeman.paiements.map(calculPaiement);
    expect(gcr).toEqual({ escompteDeduit: true, montant: chf(4767.2) });
    expect(sel).toEqual({ escompteDeduit: false, montant: chf(335.1) });
    expect(pdl).toEqual({ escompteDeduit: false, montant: chf(529.7) });
  });

  it('contrôle des paiements : les six situations', () => {
    const c = facturationLeman.controle!;
    const s = Object.fromEntries(c.factures.map((f) => [f.numero, situationFacture(c, f)]));
    expect(s['F-297']).toEqual({ situation: 'payee', reste: 0 });
    expect(s['F-298']).toEqual({ situation: 'echue', reste: chf(1180) });
    expect(s['F-299']).toEqual({ situation: 'partiel', reste: chf(360) });
    expect(s['F-301']).toEqual({ situation: 'escompte-justifie', reste: 0 });
    expect(s['F-302']).toEqual({ situation: 'pas-echue', reste: chf(1204.25) });
    expect(s['F-303']).toEqual({ situation: 'escompte-hors-delai', reste: chf(42.5) });
  });
});

describe('facturation : contrôle des saisies et points', () => {
  it('compare les montants au centime, les dates, les IBAN sans espaces, le texte sans majuscules', () => {
    const ch = champsFacture(f301!);
    const tva = ch.find((c) => c.cle === 'tva')!;
    expect(controlerChamp(tva, '272.65')).toBe(true);
    expect(controlerChamp(tva, '272.60')).toBe(false);
    expect(controlerChamp(tva, '')).toBeNull();
    expect(controlerChamp(ch.find((c) => c.cle === 'echeance')!, '2.4.2026')).toBe(true);
    const p = champsPaiement(facturationLeman.paiements[0]!);
    expect(controlerChamp(p.find((c) => c.cle === 'iban')!, 'ch0000000000000001185')).toBe(true);
    expect(controlerChamp(p.find((c) => c.cle === 'beneficiaire')!, ' grossiste cycles  romandie sa')).toBe(true);
  });

  it('points au prorata des champs justes, puis dans la note de la copie', () => {
    const juste = ficheJuste();
    const r = noterFacturation(facturationLeman, juste);
    expect(r.every((x) => x.points === x.max)).toBe(true);
    expect(r.reduce((s, x) => s + x.max, 0)).toBe(3 * 3 + 3 * 2 + 3);
    expect(noterFacturation(facturationLeman, undefined).every((x) => x.points === 0)).toBe(true);

    // Une erreur sur la TVA de F-301 : 3 points × 10 justes / 11 champs = 2.73, soit 2.5 au demi-point inférieur.
    const uneErreur = ficheJuste();
    uneErreur.factures['F-301']!.tva = '272.60';
    const f = noterFacturation(facturationLeman, uneErreur).find((x) => x.cle === 'Facture F-301')!;
    expect([f.justes, f.total, f.points]).toEqual([10, 11, 2.5]);

    const d = dossierCorrige();
    const sans = corrigerCopie(dossierFacturationLeman, d);
    const avec = corrigerCopie(dossierFacturationLeman, d, { facturation: juste });
    expect(avec.max).toBe(sans.max + 18);
    expect(avec.note).toBe(6);
  });
});

describe('dossier Cycles du Léman, facturation de mars', () => {
  it('passe le contrôle, active la rubrique Facturation, corrigé équilibré et soldes attendus', () => {
    expect(controlerExercice(dossierFacturationLeman, plan)).toEqual({ erreurs: [], avertissements: [] });
    expect(fonctionsExercice(dossierFacturationLeman).has('facturation')).toBe(true);
    const d = dossierCorrige();
    expect(balance(d).equilibree).toBe(true);
    // Créances au 31.03 : F-298 1'180.00 + solde F-299 360.00 + F-302 1'204.25 + escompte non accepté F-303 42.50.
    expect(soldeDe(d, '1100')).toBe(chf(1180 + 360 + 1204.25 + 42.5));
    expect(soldeDe(d, '2000')).toBe(0);
    expect(soldeDe(d, '2010')).toBe(0);
    expect(boucler(d).ok).toBe(true);
  });
});
