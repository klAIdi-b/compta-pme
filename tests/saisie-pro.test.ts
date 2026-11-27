// Phase V4 (maquette validée le 27.11.2026) : historique des modifications, recherche du journal, modèles d'écritures.
import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { decrireModification, evenement, historiqueDePiece, HISTORIQUE_MAX, modeleDepuis, noterEvenement, resumeHistorique } from '../src/engine/historique';
import { filtrerEcritures, montantRecherche, totalEcritures } from '../src/engine/recherche-journal';
import { formatMontant } from '../src/engine/money';
import type { Dossier } from '../src/engine/dossier';
import { plan } from './fixtures';

function journal(n: number): Dossier {
  let d = creerDossier(demoCfc1, plan);
  for (const [i, c] of demoCfc1.corrige!.slice(0, n).entries()) {
    const op = demoCfc1.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: op.texte.slice(0, 40), lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
  }
  return d;
}

const nom = (n: string) => plan.find((c) => c.numero === n)?.intitule ?? n;

describe('historique des modifications', () => {
  it('décrit un compte remplacé et un montant changé, en clair', () => {
    expect(decrireModification([{ debit: '1520', credit: '1020', montant: 160000 }], [{ debit: '1521', credit: '1020', montant: 160000 }], nom, formatMontant)).toBe(
      'débit : Machines de bureau → Infrastructure informatique',
    );
    expect(decrireModification([{ debit: '6000', credit: '1020', montant: 185000 }], [{ debit: '6000', credit: '1020', montant: 158000 }], nom, formatMontant)).toBe(
      "Loyers : 1'850.00 → 1'580.00 ; Banque (n/avoir) : 1'850.00 → 1'580.00",
    );
    expect(decrireModification([{ debit: '6000', credit: '1020', montant: 1 }], [{ debit: '6000', credit: '1020', montant: 1 }], nom, formatMontant)).toBe('libellé ou date');
  });

  it('garde toute l’histoire d’une pièce, même renumérotée, et la résume pour l’enseignant', () => {
    const e = { id: 'E8', piece: '8', lignes: [{ debit: '1520', credit: '1020', montant: 160000 }] };
    let h = noterEvenement(undefined, evenement('creee', e, new Date('2026-12-14T09:12:00Z'), { statut: 'compte_classe' }));
    h = noterEvenement(h, evenement('modifiee', { ...e, lignes: [{ debit: '1521', credit: '1020', montant: 160000 }] }, new Date('2026-12-14T09:15:00Z'), { avant: e.lignes, statut: 'juste' }));
    h = noterEvenement(h, evenement('extournee', { ...e, piece: '11', id: 'E11' }, new Date('2026-12-14T09:33:00Z')));
    expect(historiqueDePiece(h, '8').map((x) => x.type)).toEqual(['creee', 'modifiee']);
    expect(resumeHistorique(historiqueDePiece(h, '8'), (iso) => iso.slice(11, 16))).toBe('Créée 09:12, modifiée 09:15');
    const ressaisie = noterEvenement(noterEvenement(h, evenement('supprimee', e, new Date('2026-12-14T09:40:00Z'))), evenement('creee', { ...e, id: 'E20' }, new Date('2026-12-14T09:41:00Z')));
    expect(resumeHistorique(historiqueDePiece(ressaisie, '8'), (iso) => iso.slice(11, 16))).toBe('Créée 09:12, modifiée 09:15, supprimée 09:40, saisie à nouveau 09:41');
  });

  it('ne grandit pas sans limite', () => {
    let h: ReturnType<typeof noterEvenement> = [];
    for (let i = 0; i < HISTORIQUE_MAX + 5; i++) h = noterEvenement(h, evenement('creee', { id: `E${i}`, piece: String(i), lignes: [] }, new Date(0)));
    expect(h).toHaveLength(HISTORIQUE_MAX);
    expect(h[0]!.piece).toBe('5');
  });
});

describe('recherche du journal', () => {
  const d = journal(15);
  const pieces = (f: Parameters<typeof filtrerEcritures>[2]) => filtrerEcritures(d.ecritures, d.plan, f).map((e) => e.piece);

  it('trouve un compte par son nom ou son numéro, sans tenir compte des accents', () => {
    expect(pieces({ texte: 'banque' })).toEqual(['4', '5', '6', '7', '8', '10', '13']);
    expect(pieces({ texte: '1010' })).toEqual(['9', '15']);
    expect(pieces({ texte: 'creances' })).toEqual(['3', '7']);
  });

  it('trouve un montant tapé de plusieurs façons, ou une pièce', () => {
    expect(montantRecherche("1’850,00")).toBe(185000);
    expect(montantRecherche('CHF 1850')).toBe(185000);
    expect(montantRecherche('loyer')).toBe(null);
    expect(pieces({ texte: "1'850.00" })).toEqual(['5']);
    // « 12 » : la pièce 12, et aussi un libellé qui contient « 12 » (« Ventes … 12'350.00 »).
    expect(pieces({ texte: '12' })).toEqual(['2', '12']);
  });

  it('filtre par compte et par période, et totalise', () => {
    const r = filtrerEcritures(d.ecritures, d.plan, { compte: '1020', du: '2026-01-01', au: '2026-01-31' });
    expect(r.map((e) => e.piece)).toEqual(['4', '5']);
    expect(totalEcritures(r)).toBe(900000 + 185000);
    expect(pieces({})).toHaveLength(15);
  });
});

describe('modèles d’écritures', () => {
  it('reprennent les comptes, et au choix le montant et le libellé', () => {
    const e = { libelle: "Salaire de l'employé", lignes: [{ debit: '5200', credit: '1020', montant: 420000 }] };
    expect(modeleDepuis(e, ' Salaire ', true, false)).toEqual({ nom: 'Salaire', lignes: [{ debit: '5200', credit: '1020', montant: 420000 }] });
    expect(modeleDepuis(e, 'Salaire', false, true)).toEqual({ nom: 'Salaire', libelle: "Salaire de l'employé", lignes: [{ debit: '5200', credit: '1020', montant: null }] });
  });
});
