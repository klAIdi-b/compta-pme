// Exercice fourni par l'enseignant : énoncé, opérations, bilan d'ouverture, paramètres.
// Le corrigé et le barème seront formalisés en phase 3.

import type { DonneesFacturation } from './facturation';
import type { DonneesBudget } from './budget';
import type { Centimes } from './money';
import type { DateISO } from './dates';
import type { Dossier, FormeJuridique, LigneEcriture } from './dossier';
import { comptesDisponibles, controlerOuverture, ouvertureDepuisBilan } from './dossier';
import { estDateValide } from './dates';
import type { ModeBouclement } from './closing';
import type { Compte, Niveau } from './plan';
import { comptesDuNiveau, NIVEAUX } from './plan';
import type { DonneesRepartition } from './repartition';
import type { DonneesSeuil } from './tableaux';
import type { DonneesEchelle } from './fiches-cfc';
import type { PieceComptable } from './pieces';

export type LibellesT = 'SI/SF' | 'San/Spb';
/**
 * Mode d'un exercice : entraînement (retour immédiat), évaluation formative (aucun retour pendant la saisie, correction
 * et note indicative montrées à l'élève quand il termine ; choix de l'enseignant le 18.11.2026), évaluation (aucun retour).
 */
export type Mode = 'entrainement' | 'formative' | 'evaluation';

/** Retour (statuts, indices, solutions, contrôle des fiches) visible par l'élève. */
export function retourVisible(mode: Mode, formativeTerminee: boolean): boolean {
  return mode === 'entrainement' || (mode === 'formative' && formativeTerminee);
}

/** Rubriques de l'application ; une rubrique non activée n'apparaît pas. */
export type Fonction =
  | 'tva'
  | 'salaire'
  | 'calculatriceTva'
  | 'repartition'
  | 'analyse'
  | 'degres'
  | 'flux'
  | 'seuil'
  | 'bilanOuverture'
  | 'margeBrute'
  | 'echelle'
  | 'facturation'
  | 'budget';

export interface Operation {
  numero: string;
  date: DateISO;
  texte: string;
  /** Pièce comptable à lire (dossiers « pièces seules ») ; l'élève en déduit l'écriture. */
  piece?: PieceComptable;
}

export interface EcritureCorrigee {
  piece: string;
  lignes: LigneEcriture[];
  /**
   * Autres écritures admises comme justes (décision de l'enseignant du 26.11.2026, par exemple un abonnement en 6500
   * ou en 6700). La solution montrée à l'élève et les points partiels suivent `lignes`.
   */
  variantes?: LigneEcriture[][];
}

export type Filiere = 'CFC' | 'MP';

export interface Exercice {
  id: string;
  titre: string;
  /** Comptes et fonctions disponibles (CFC 1re année, CFC 2e année, maturité professionnelle). */
  niveau: Niveau;
  /** Formation visée : CFC ou maturité professionnelle (par défaut d'après `niveau`). */
  filiere?: Filiere;
  /** Niveau de difficulté dans la formation : 1 = le plus simple. */
  difficulte?: number;
  /**
   * Variante d'évaluation : opérations que l'enseignant doit réécrire (texte et corrigé) avant de l'exporter, avec leur
   * texte d'origine (assistant de réécriture, 26.11.2026).
   */
  aReecrire?: { numero: string; texte: string }[];
  /**
   * Code imprimé sur l'énoncé papier, choisi par l'enseignant (sinon calculé : `codeExercice` dans `papier.ts`). Il
   * associe la copie d'un élève qui a travaillé sur la feuille au bon corrigé.
   */
  code?: string;
  /**
   * Dossier « énoncé papier » créé par l'élève (phase V2) : pas d'opérations ni de corrigé, l'énoncé est sur la feuille.
   * `code` : code tapé par l'élève ; `source` : exercice du logiciel reconnu par ce code ; `ouvertureFournie` : le bilan
   * d'ouverture vient de cet exercice.
   */
  papier?: { code?: string; source?: string; ouvertureFournie?: boolean };
  /** Sujets traités, affichés aux élèves (par exemple « TVA », « Amortissements »). */
  sujets?: string[];
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  debut: DateISO;
  fin: DateISO;
  /** Texte d'introduction de l'énoncé. */
  introduction: string;
  /**
   * Situation de départ : récit qui place l'élève dans l'entreprise (rôle, produits, collègues, attentes).
   * Facultatif pour les fichiers créés avant son introduction.
   */
  situation?: string;
  operations: Operation[];
  /** Bilan d'ouverture en montants positifs. */
  ouvertureActif: Record<string, Centimes>;
  ouverturePassif: Record<string, Centimes>;
  mode: Mode;
  parametres: {
    libellesT: LibellesT;
    /** Entraînement : l'enseignant autorise la modification directe des écritures validées. */
    modificationDirecte: boolean;
    modeBouclement: ModeBouclement;
    comptesAjoutes: string[];
    comptesMasques: string[];
    /** CFC 2 et plus : méthode de comptabilisation de la TVA (au net par défaut). */
    tvaMethode?: 'net' | 'brut';
    /** Fiche « Décompte de salaire » pour calculer les retenues. */
    ficheSalaire?: boolean;
    /** Calculatrice de TVA (aide au calcul, désactivée par défaut). */
    calculatriceTva?: boolean;
    /** Corriger (entraînement) et noter (évaluation) les écritures de bouclement. */
    corrigerBouclement?: boolean;
    /** Mode compte de résultat : le logiciel passe lui-même les écritures de bouclement (bouton à l'écran Bouclement). */
    bouclementAutomatique?: boolean;
    /** MP, sociétés : données de la répartition du bénéfice décidée par l'assemblée générale. */
    repartition?: DonneesRepartition;
    /** MP : données de la fiche « Seuil de rentabilité » (prix, coût variable, charges fixes, quantité). */
    seuil?: DonneesSeuil;
    /** Tous niveaux : fiche « Bilan d'ouverture » (classer les comptes dans les masses, fortune nette). */
    ficheBilanOuverture?: boolean;
    /** Tous niveaux : fiche « Marge brute » (CAB, CAN, PRAMA, PRAMV d'après les comptes). */
    ficheMargeBrute?: boolean;
    /** CFC 2 et MP : formulaire officiel de décompte TVA à remplir dans l'écran TVA (chiffres 200 à 510). */
    formulaireTva?: boolean;
    /** Tous niveaux : données de la fiche « Échelle des prix ». */
    echellePrix?: DonneesEchelle;
    /** CFC 2 et MP : facturation et paiements (factures à établir, ordres de paiement, contrôle des paiements). */
    facturation?: DonneesFacturation;
    /** CFC 2 et MP : budget (préparer) et écarts entre budget et chiffres effectifs (comparer). */
    budget?: DonneesBudget;
  };
  corrige?: EcritureCorrigee[];
  /**
   * Écritures déjà passées par le logiciel (simulateur en comptabilité mixte : tours non saisis par les élèves). Elles
   * figurent dans le journal dès l'ouverture, sans être des opérations de l'énoncé.
   */
  ecrituresAutomatiques?: { date: DateISO; piece: string; libelle: string; lignes: LigneEcriture[] }[];
  /** Points par opération (numéro → points) ; 1 point par défaut. */
  bareme?: Record<string, number>;
  /** Points partiels pour les écritures multiples (oui par défaut). */
  pointsPartiels?: boolean;
}

/** Fonctions activées par défaut selon le niveau (TVA dès CFC 2). */
export function fonctionsDuNiveau(niveau: Niveau): Set<Fonction> {
  const f = new Set<Fonction>();
  if (NIVEAUX.indexOf(niveau) >= NIVEAUX.indexOf('CFC2')) f.add('tva');
  return f;
}

export const INTITULE_CAPITAL: Record<FormeJuridique, string> = {
  'raison individuelle': 'Capital',
  SA: 'Capital-actions',
  Sàrl: 'Capital social',
};

/** Le compte 2800 porte l'intitulé correspondant à la forme juridique. */
export function planSelonForme(plan: Compte[], forme: FormeJuridique): Compte[] {
  return plan.map((c) => (c.numero === '2800' ? { ...c, intitule: INTITULE_CAPITAL[forme] } : c));
}

/** Fonctions visibles pour un exercice : celles du niveau, plus les options choisies par l'enseignant. */
export function fonctionsExercice(ex: Exercice): Set<Fonction> {
  const f = fonctionsDuNiveau(ex.niveau);
  if (ex.parametres.ficheBilanOuverture) f.add('bilanOuverture');
  if (ex.parametres.ficheMargeBrute) f.add('margeBrute');
  if (ex.parametres.echellePrix) f.add('echelle');
  const cfc2 = NIVEAUX.indexOf(ex.niveau) >= NIVEAUX.indexOf('CFC2');
  if (cfc2 && ex.parametres.ficheSalaire) f.add('salaire');
  if (cfc2 && ex.parametres.calculatriceTva) f.add('calculatriceTva');
  if (cfc2 && ex.parametres.facturation) f.add('facturation');
  if (cfc2 && ex.parametres.budget) f.add('budget');
  if (ex.niveau === 'MP') {
    f.add('analyse');
    f.add('degres');
    f.add('flux');
    if (ex.parametres.seuil) f.add('seuil');
    if (ex.formeJuridique !== 'raison individuelle') f.add('repartition');
  }
  return f;
}

/** Crée le dossier comptable de l'élève à partir de l'exercice. */
export function creerDossier(ex: Exercice, plan: Compte[]): Dossier {
  const ajoutes = [...ex.parametres.comptesAjoutes];
  // En mode « compte de résultat », le compte 9000 est nécessaire aux écritures de bouclement.
  if (ex.parametres.modeBouclement === 'compteDeResultat' && !ajoutes.includes('9000')) ajoutes.push('9000');
  return {
    raisonSociale: ex.raisonSociale,
    formeJuridique: ex.formeJuridique,
    debut: ex.debut,
    fin: ex.fin,
    niveau: ex.niveau,
    plan: planSelonForme(plan, ex.formeJuridique),
    comptesAjoutes: ajoutes,
    comptesMasques: [...ex.parametres.comptesMasques],
    ouverture: ouvertureDepuisBilan(ex.ouvertureActif, ex.ouverturePassif),
    ecritures: (ex.ecrituresAutomatiques ?? []).map((e, i) => ({ id: `A${i + 1}`, ...e, automatique: true })),
  };
}

/** Comptes du plan choisis pour l'exercice : ceux du niveau, plus les ajoutés, moins les masqués. */
export function comptesChoisis(
  plan: readonly Compte[],
  niveau: Niveau,
  choix: { comptesAjoutes: readonly string[]; comptesMasques: readonly string[] },
): Set<string> {
  const s = new Set(comptesDuNiveau(plan, niveau).map((c) => c.numero));
  for (const n of choix.comptesAjoutes) s.add(n);
  for (const n of choix.comptesMasques) s.delete(n);
  return s;
}

/**
 * Coche ou décoche un compte dans l'éditeur : un compte hors niveau coché va dans `comptesAjoutes`,
 * un compte du niveau décoché va dans `comptesMasques`. Les listes restent minimales et triées.
 */
export function basculerCompte(
  plan: readonly Compte[],
  niveau: Niveau,
  choix: { comptesAjoutes: readonly string[]; comptesMasques: readonly string[] },
  numero: string,
  coche: boolean,
): { comptesAjoutes: string[]; comptesMasques: string[] } {
  const duNiveau = new Set(comptesDuNiveau(plan, niveau).map((c) => c.numero));
  const ajoutes = new Set(choix.comptesAjoutes.filter((n) => !duNiveau.has(n)));
  const masques = new Set(choix.comptesMasques.filter((n) => duNiveau.has(n)));
  if (duNiveau.has(numero)) {
    if (coche) masques.delete(numero);
    else masques.add(numero);
  } else if (coche) ajoutes.add(numero);
  else ajoutes.delete(numero);
  return { comptesAjoutes: [...ajoutes].sort(), comptesMasques: [...masques].sort() };
}

/** Numéros d'opérations ayant au moins une écriture non extournée dans le journal. */
export function operationsSaisies(d: Dossier): Set<string> {
  const extournees = new Set(d.ecritures.filter((e) => e.extourneDe).map((e) => e.extourneDe!));
  return new Set(d.ecritures.filter((e) => !e.automatique && !e.extourneDe && !extournees.has(e.id)).map((e) => e.piece));
}

/**
 * Simulateur : l'enseignant distribue après chaque tour une nouvelle version du même exercice (mêmes identifiant et
 * entreprise, pièces des nouveaux tours en plus). L'élève garde ses écritures ; les écritures automatiques sont
 * remplacées par celles de la nouvelle version.
 */
export function actualiserDossier(d: Dossier, ex: Exercice): Dossier {
  const automatiques = (ex.ecrituresAutomatiques ?? []).map((e, i) => ({ id: `A${i + 1}`, ...e, automatique: true }));
  return { ...d, ecritures: [...automatiques, ...d.ecritures.filter((e) => !e.automatique)] };
}

/** Nouvelle version d'un exercice du simulateur, à reprendre dans la session de l'élève. */
export function estNouvelleVersionSimulation(ancien: Exercice, nouveau: Exercice): boolean {
  return (
    ancien.id === nouveau.id &&
    nouveau.id.startsWith('simulation-') &&
    (ancien.operations.length !== nouveau.operations.length ||
      (ancien.ecrituresAutomatiques ?? []).length !== (nouveau.ecrituresAutomatiques ?? []).length ||
      ancien.titre !== nouveau.titre)
  );
}

/**
 * Exercice fourni dont le corrigé a été corrigé depuis que l'élève l'a commencé (la session garde une copie de
 * l'exercice) : on reprend le corrigé du catalogue si l'énoncé est resté identique. Les écritures de l'élève ne
 * changent pas ; seule la correction est recalculée. Sans effet pour un exercice sans corrigé (évaluation).
 */
export function avecCorrigeAJour(enregistre: Exercice, catalogue: readonly Exercice[]): Exercice {
  const c = catalogue.find((x) => x.id === enregistre.id);
  if (!c || !c.corrige || !enregistre.corrige || c.mode !== enregistre.mode) return enregistre;
  const memeEnonce =
    c.operations.length === enregistre.operations.length &&
    c.operations.every((o, i) => o.numero === enregistre.operations[i]!.numero && o.texte === enregistre.operations[i]!.texte) &&
    // Un corrigé repris doit correspondre au bilan d'ouverture que l'élève a sous les yeux (comptes renumérotés, 25.11.2026).
    JSON.stringify(c.ouvertureActif) === JSON.stringify(enregistre.ouvertureActif) &&
    JSON.stringify(c.ouverturePassif) === JSON.stringify(enregistre.ouverturePassif);
  if (!memeEnonce || JSON.stringify(c.corrige) === JSON.stringify(enregistre.corrige)) return enregistre;
  return { ...enregistre, corrige: c.corrige };
}

/** Contrôle d'un exercice avant distribution : erreurs bloquantes et avertissements. */
export function controlerExercice(ex: Exercice, plan: Compte[]): { erreurs: string[]; avertissements: string[] } {
  const erreurs: string[] = [];
  const avertissements: string[] = [];
  if (!ex.titre.trim()) erreurs.push("Indiquez le titre de l'exercice.");
  if (!ex.raisonSociale.trim()) erreurs.push("Indiquez la raison sociale de l'entreprise.");
  const datesOk = estDateValide(ex.debut) && estDateValide(ex.fin);
  if (!datesOk) erreurs.push("Indiquez des dates d'exercice valides (JJ.MM.AAAA).");
  else if (ex.debut >= ex.fin) erreurs.push("La fin de l'exercice doit être postérieure à son début.");

  const d = creerDossier(ex, plan);
  erreurs.push(...controlerOuverture(d));
  const dispo = new Set(comptesDisponibles(d).map((c) => c.numero));
  for (const n of Object.keys(d.ouverture)) {
    if (!dispo.has(n)) erreurs.push(`Bilan d'ouverture : le compte ${n} n'est pas disponible au niveau choisi.`);
  }

  // Une fiche seule (budget ou facturation) peut se passer d'opérations au journal.
  const ficheSeule = !!(ex.parametres.budget || ex.parametres.facturation);
  if (ex.operations.length === 0 && !(ex.ecrituresAutomatiques ?? []).length && !ficheSeule) erreurs.push("Ajoutez au moins une opération à l'énoncé.");
  for (const a of ex.ecrituresAutomatiques ?? []) {
    if (ex.operations.some((o) => o.numero === a.piece)) erreurs.push(`La pièce automatique ${a.piece} porte le numéro d'une opération.`);
    const debit = a.lignes.reduce((t, l) => t + (l.debit ? l.montant : 0), 0);
    const credit = a.lignes.reduce((t, l) => t + (l.credit ? l.montant : 0), 0);
    if (debit !== credit) erreurs.push(`La pièce automatique ${a.piece} n'est pas équilibrée.`);
    for (const l of a.lignes) for (const n of [l.debit, l.credit]) if (n && !dispo.has(n)) erreurs.push(`Pièce automatique ${a.piece} : le compte ${n} n'est pas disponible.`);
  }
  const vus = new Set<string>();
  ex.operations.forEach((o) => {
    if (vus.has(o.numero)) erreurs.push(`Le numéro d'opération ${o.numero} figure deux fois.`);
    vus.add(o.numero);
    if (!o.texte.trim()) erreurs.push(`Opération ${o.numero} : le texte est vide.`);
    if (!estDateValide(o.date)) erreurs.push(`Opération ${o.numero} : la date est invalide.`);
    else if (datesOk && (o.date < ex.debut || o.date > ex.fin)) {
      erreurs.push(`Opération ${o.numero} : la date est hors de l'exercice.`);
    }
  });

  const corrige = new Map((ex.corrige ?? []).map((c) => [c.piece, c]));
  const sansCorrige = ex.operations.filter((o) => !corrige.has(o.numero)).map((o) => o.numero);
  if (sansCorrige.length) {
    const msg = `Opérations sans corrigé : ${sansCorrige.join(', ')}.`;
    if (ex.mode !== 'evaluation') avertissements.push(`${msg} Aucun retour ne sera donné aux élèves pour ces opérations.`);
    else avertissements.push(`${msg} Elles ne pourront pas être corrigées automatiquement.`);
  }
  for (const c of ex.corrige ?? []) {
    if (!vus.has(c.piece)) avertissements.push(`Le corrigé contient une pièce ${c.piece} qui n'est pas une opération de l'énoncé.`);
  }
  return { erreurs, avertissements };
}

/** Exercice vierge pour l'éditeur de l'enseignant. */
export function exerciceVierge(id: string, annee: number): Exercice {
  return {
    id,
    titre: '',
    niveau: 'CFC1',
    raisonSociale: '',
    formeJuridique: 'raison individuelle',
    debut: `${annee}-01-01`,
    fin: `${annee}-12-31`,
    introduction: '',
    situation: '',
    operations: [],
    ouvertureActif: {},
    ouverturePassif: {},
    mode: 'entrainement',
    parametres: {
      libellesT: 'SI/SF',
      modificationDirecte: false,
      modeBouclement: 'compteDeResultat',
      comptesAjoutes: [],
      comptesMasques: [],
    },
    corrige: [],
  };
}

/** Transforme les écritures saisies par l'enseignant en corrigé (une entrée par pièce). */
export function corrigeDepuisEcritures(d: Dossier): EcritureCorrigee[] {
  const extournees = new Set(d.ecritures.filter((e) => e.extourneDe).map((e) => e.extourneDe!));
  const parPiece = new Map<string, LigneEcriture[]>();
  for (const e of d.ecritures) {
    if (e.extourneDe || extournees.has(e.id) || e.automatique) continue;
    parPiece.set(e.piece, [...(parPiece.get(e.piece) ?? []), ...e.lignes]);
  }
  return [...parPiece].map(([piece, lignes]) => ({ piece, lignes }));
}

export const LIBELLES_MODE: Record<Mode, string> = {
  entrainement: 'Entraînement',
  formative: 'Évaluation formative',
  evaluation: 'Évaluation',
};

export const LIBELLES_NIVEAU: Record<Niveau, string> = { CFC1: '1ère CFC', CFC2: '2ème CFC', MP: 'MP' };
/** Année de formation, en toutes lettres (dénominations de l'école : 1ère CFC, 2ème CFC). */
export const LIBELLES_ANNEE: Record<Niveau, string> = { CFC1: '1ère CFC', CFC2: '2ème CFC', MP: 'Maturité professionnelle' };

/** Contenu disponible selon `niveau` (comptes et fonctions), libellés de l'éditeur. */
export const LIBELLES_CONTENU: Record<Niveau, string> = {
  CFC1: 'Bases (1ère CFC)',
  CFC2: 'CFC complet (2ème CFC : TVA, clôture, salaires)',
  MP: 'Maturité professionnelle (sociétés, titres, analyse)',
};

export const LIBELLES_FILIERE: Record<Filiere, string> = { CFC: 'CFC', MP: 'Maturité professionnelle' };

/** Titres des niveaux de difficulté (proposition à faire valider par l'enseignant). */
export const TITRES_DIFFICULTE: Record<Filiere, Record<number, string>> = {
  CFC: {
    1: 'Bases : bilan, comptes, journal, bouclement',
    2: 'TVA (option Finances)',
    3: 'Opérations de clôture : amortissements, transitoires, créances, salaires (option Finances)',
    4: 'Synthèse de plusieurs chapitres (option Finances)',
  },
  MP: {
    1: 'Opérations financières et commerciales : intérêts, impôt anticipé, escomptes, monnaies étrangères',
    2: "Clôture de l'entreprise individuelle : salaire du propriétaire, intérêt du capital",
    3: 'Société anonyme : capital, répartition du bénéfice, réserves',
    4: 'Titres et immeubles',
    5: 'Analyse financière',
    6: 'Synthèse de plusieurs chapitres',
  },
};

export function filiereDe(ex: Pick<Exercice, 'filiere' | 'niveau'>): Filiere {
  return ex.filiere ?? (ex.niveau === 'MP' ? 'MP' : 'CFC');
}

export function difficulteDe(ex: Pick<Exercice, 'difficulte'>): number {
  return ex.difficulte && ex.difficulte > 0 ? Math.floor(ex.difficulte) : 1;
}

/** « CFC · niveau 3 » */
/**
 * Contenu de l'option Finances du plan de formation CFC (c6 : TVA comptabilisée, clôture, salaires) : niveaux CFC 2 à 4.
 * Décision de l'enseignant du 26.11.2026 : ces contenus sont marqués « option Finances », sans être déplacés.
 */
export function estOptionFinances(ex: Pick<Exercice, 'filiere' | 'niveau' | 'difficulte'>): boolean {
  return filiereDe(ex) === 'CFC' && difficulteDe(ex) >= 2;
}

export function etiquetteNiveau(ex: Pick<Exercice, 'filiere' | 'niveau' | 'difficulte'>): string {
  return `${filiereDe(ex)} · niveau ${difficulteDe(ex)}${estOptionFinances(ex) ? ' · option Finances' : ''}`;
}

export interface GroupeExercices {
  filiere: Filiere;
  difficulte: number;
  titre: string;
  exercices: Exercice[];
}

/** Exercices classés par formation (CFC puis MP), puis par niveau de difficulté croissant. */
export function classerExercices(exercices: readonly Exercice[]): GroupeExercices[] {
  const groupes = new Map<string, GroupeExercices>();
  for (const ex of exercices) {
    const filiere = filiereDe(ex);
    const difficulte = difficulteDe(ex);
    const cle = `${filiere}|${difficulte}`;
    if (!groupes.has(cle)) {
      groupes.set(cle, { filiere, difficulte, titre: TITRES_DIFFICULTE[filiere][difficulte] ?? '', exercices: [] });
    }
    groupes.get(cle)!.exercices.push(ex);
  }
  const ordre = (f: Filiere) => (f === 'CFC' ? 0 : 1);
  return [...groupes.values()].sort((a, b) => ordre(a.filiere) - ordre(b.filiere) || a.difficulte - b.difficulte);
}
