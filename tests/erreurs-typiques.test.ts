import { describe, expect, it } from 'vitest';
import { erreurTypique } from '../src/engine/erreurs-typiques';

const s = (debit: string, credit: string, montant = 1000) => ({ debit, credit, montant });

describe('erreurs typiques', () => {
  it('investissement passé en charge', () => {
    expect(erreurTypique([s('6100', '2010')], [s('1530', '2010')])?.id).toBe('investissement-en-charge');
  });
  it('2000 au lieu de 2010 pour un véhicule (règle de l\'école)', () => {
    expect(erreurTypique([s('1530', '2000')], [s('1530', '2010')])?.id).toBe('autres-dettes-en-fournisseurs');
    expect(erreurTypique([s('4200', '2010')], [s('4200', '2000')])?.id).toBe('fournisseurs-en-autres-dettes');
  });
  it('paiement d\'une facture passé une deuxième fois en charge', () => {
    expect(erreurTypique([s('6000', '1020')], [s('2010', '1020')])?.id).toBe('paiement-en-charge');
  });
  it('encaissement d\'un client passé en vente', () => {
    expect(erreurTypique([s('1020', '3200')], [s('1020', '1100')])?.id).toBe('encaissement-en-vente');
  });
  it('moyen de paiement', () => {
    expect(erreurTypique([s('6300', '1020')], [s('6300', '1010')])?.chapitre).toBe('bilan');
  });
  // Relecture guidée du 27.11.2026 (lot 1).
  it('écriture inversée (mêmes comptes) : jamais d’explication de confusion de comptes', () => {
    expect(erreurTypique([s('4200', '2000')], [s('2000', '4200')])).toBeNull();
    expect(erreurTypique([s('1000', '1020')], [s('1020', '1000')])).toBeNull();
    expect(erreurTypique([s('1530', '6800')], [s('6800', '1530')])).toBeNull();
  });
  it('« encaissement en vente » seulement pour un encaissement', () => {
    expect(erreurTypique([s('3805', '3200')], [s('3805', '1100')])).toBeNull();
    expect(erreurTypique([s('2000', '3200')], [s('2000', '1100')])).toBeNull();
  });
  it('règles d’amortissement seulement pour un amortissement (6800 au débit)', () => {
    const vente = [{ debit: '1020', credit: null, montant: 500 }, { debit: '1539', credit: null, montant: 600 }, { debit: null, credit: '1530', montant: 1000 }, { debit: null, credit: '8510', montant: 100 }];
    const eleve = [{ debit: '1020', credit: null, montant: 500 }, { debit: '1539', credit: null, montant: 600 }, { debit: null, credit: '1539', montant: 1000 }, { debit: null, credit: '8510', montant: 100 }];
    expect(erreurTypique(eleve, vente)?.id).not.toBe('amortissement-indirect-au-lieu-direct');
    expect(erreurTypique([s('6800', '1539')], [s('6800', '1530')])?.id).toBe('amortissement-indirect-au-lieu-direct');
    expect(erreurTypique([s('6800', '1530')], [s('6800', '1539')])?.id).toBe('amortissement-direct-au-lieu-indirect');
    // Amortissement d'un immeuble hors exploitation (8000) ou annexe (7510).
    expect(erreurTypique([s('8000', '1600')], [s('8000', '1609')])?.id).toBe('amortissement-direct-au-lieu-indirect');
  });
  it('prélèvement de marchandises : « opération », pas « dépense » ; phrase du ducroire juste', () => {
    expect(erreurTypique([s('4200', '3720')], [s('2850', '3720')])?.explication).toMatch(/^Cette opération concerne la vie privée/);
    expect(erreurTypique([s('3805', '1100')], [s('3805', '1109')])?.explication).toContain('ne sont pas touchées par le ducroire');
  });
  it('vente à crédit encaissée comptant', () => {
    expect(erreurTypique([s('1000', '3200')], [s('1100', '3200')])?.id).toBe('credit-paye-comptant-client');
  });
  it('compte privé', () => {
    expect(erreurTypique([s('6000', '1000')], [s('2850', '1000')])?.id).toBe('prive-en-charge');
  });
  it('achat de marchandises passé au stock', () => {
    expect(erreurTypique([s('1200', '2000')], [s('4200', '2000')])?.id).toBe('achat-en-stock');
  });
  it('rien de typique : null', () => {
    expect(erreurTypique([s('6500', '1020')], [s('6000', '1020')])).toBeNull();
  });
});
