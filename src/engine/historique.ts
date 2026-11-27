// Historique des modifications du journal (phase V4, maquette public/maquettes/saisie-professionnelle.html, écran V4.4,
// validée le 27.11.2026) : chaque écriture garde son histoire (créée, modifiée, extournée, supprimée), datée. Rien ne
// s'efface. L'historique ne compte pas dans la note (décision du 27.11.2026) : il montre le cheminement de l'élève.
// Modèles d'écritures (écran V4.6) : écritures de l'élève, réutilisables ; le logiciel n'en propose aucun.

import type { Centimes } from './money';
import type { Ecriture, LigneEcriture } from './dossier';
import type { Diagnostic } from './correction';

export type TypeEvenement = 'creee' | 'modifiee' | 'extournee' | 'supprimee';

export interface EvenementHistorique {
  /** Date et heure ISO de l'événement. */
  le: string;
  type: TypeEvenement;
  piece: string;
  ecritureId: string;
  /** Lignes après l'événement (création, modification). */
  lignes?: LigneEcriture[];
  /** Lignes avant une modification. */
  avant?: LigneEcriture[];
  /** Pièce passée à un autre numéro lors d'une modification. */
  pieceAvant?: string;
  /** Statut de la pièce juste après l'événement, en entraînement (juste, à revoir…). */
  statut?: Diagnostic | null;
}

/** Au-delà, les événements les plus anciens d'un dossier très long ne sont plus gardés. */
export const HISTORIQUE_MAX = 3000;

export function noterEvenement(h: readonly EvenementHistorique[] | undefined, ev: EvenementHistorique): EvenementHistorique[] {
  const r = [...(h ?? []), ev];
  return r.length > HISTORIQUE_MAX ? r.slice(r.length - HISTORIQUE_MAX) : r;
}

export function evenement(type: TypeEvenement, e: Pick<Ecriture, 'id' | 'piece' | 'lignes'>, le: Date, extra: Partial<EvenementHistorique> = {}): EvenementHistorique {
  return { le: le.toISOString(), type, piece: e.piece, ecritureId: e.id, ...(type === 'creee' || type === 'modifiee' ? { lignes: e.lignes } : {}), ...extra };
}

/** Événements d'une pièce, dans l'ordre (une pièce renumérotée garde son histoire sous ses deux numéros). */
export function historiqueDePiece(h: readonly EvenementHistorique[] | undefined, piece: string): EvenementHistorique[] {
  const ids = new Set((h ?? []).filter((e) => e.piece === piece).map((e) => e.ecritureId));
  return (h ?? []).filter((e) => ids.has(e.ecritureId) || e.piece === piece);
}

type Cote = 'debit' | 'credit';
function comptesDuCote(l: readonly LigneEcriture[], c: Cote): Map<string, Centimes> {
  const m = new Map<string, Centimes>();
  for (const x of l) {
    const n = x[c];
    if (n) m.set(n, (m.get(n) ?? 0) + x.montant);
  }
  return m;
}

/**
 * Ce qui a changé entre deux versions d'une écriture, en clair : comptes remplacés ou ajoutés de chaque côté, montants
 * modifiés. `nom` donne le nom d'un compte (le numéro s'il est inconnu) ; `montant` formate un montant.
 */
export function decrireModification(
  avant: readonly LigneEcriture[],
  apres: readonly LigneEcriture[],
  nom: (n: string) => string,
  montant: (c: Centimes) => string,
): string {
  const parties: string[] = [];
  for (const c of ['debit', 'credit'] as const) {
    const a = comptesDuCote(avant, c);
    const b = comptesDuCote(apres, c);
    const retires = [...a.keys()].filter((n) => !b.has(n));
    const ajoutes = [...b.keys()].filter((n) => !a.has(n));
    const libelle = c === 'debit' ? 'débit' : 'crédit';
    if (retires.length && ajoutes.length) parties.push(`${libelle} : ${retires.map(nom).join(', ')} → ${ajoutes.map(nom).join(', ')}`);
    else if (ajoutes.length) parties.push(`${libelle} : ${ajoutes.map(nom).join(', ')} ajouté`);
    else if (retires.length) parties.push(`${libelle} : ${retires.map(nom).join(', ')} retiré`);
    for (const [n, m] of b) {
      const ancien = a.get(n);
      if (ancien !== undefined && ancien !== m) parties.push(`${nom(n)} : ${montant(ancien)} → ${montant(m)}`);
    }
  }
  return parties.join(' ; ') || 'libellé ou date';
}

/** Résumé d'une pièce pour l'enseignant : « Créée 10:12, modifiée 10:15 ». `heure` formate une date ISO. */
export function resumeHistorique(evs: readonly EvenementHistorique[], heure: (iso: string) => string): string {
  const mots: Record<TypeEvenement, string> = { creee: 'créée', modifiee: 'modifiée', extournee: 'extournée', supprimee: 'supprimée' };
  let deja = false;
  return evs
    .map((e) => {
      const mot = e.type === 'creee' && deja ? 'saisie à nouveau' : mots[e.type];
      if (e.type === 'creee') deja = true;
      return `${mot} ${heure(e.le)}`;
    })
    .join(', ')
    .replace(/^./, (c) => c.toUpperCase());
}

// ---------- Modèles d'écritures ----------

export interface ModeleEcriture {
  nom: string;
  libelle?: string;
  lignes: { debit: string | null; credit: string | null; montant: Centimes | null }[];
}

export function modeleDepuis(e: Pick<Ecriture, 'libelle' | 'lignes'>, nom: string, garderMontant: boolean, garderLibelle: boolean): ModeleEcriture {
  return {
    nom: nom.trim(),
    ...(garderLibelle && e.libelle.trim() ? { libelle: e.libelle.trim() } : {}),
    lignes: e.lignes.map((l) => ({ debit: l.debit, credit: l.credit, montant: garderMontant ? l.montant : null })),
  };
}
