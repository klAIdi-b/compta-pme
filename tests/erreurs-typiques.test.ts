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
    expect(erreurTypique([s('6300', '1020')], [s('6300', '1010')])?.chapitre).toBe('comptes');
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
