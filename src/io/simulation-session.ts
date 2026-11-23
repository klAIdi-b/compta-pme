// Simulateur en ligne : ce qui doit être lu au démarrage, sans charger le code réseau.
// - retour de la connexion de l'enseignant (jetons Supabase dans l'adresse, après le clic sur le lien reçu par e-mail) ;
// - lien donné aux groupes (?partie=…&service=…&cle=…).
// Aucune donnée d'élève : la session est celle de l'enseignant, le lien ne contient que des informations publiques.

import { ESPACE } from './espace';
import { ecrire } from './stockage';

export interface ConfigEnLigne {
  /** Adresse du projet Supabase, par exemple https://abcd.supabase.co */
  url: string;
  /** Clé publique (« anon ») du projet : elle ne donne accès qu'à ce que les règles de la base permettent. */
  cleAnon: string;
}

export const CLE_RETOUR_CONNEXION = `${ESPACE}:simulateur-connexion:v1`;

// ---------- Session de l'enseignant (connexion par lien e-mail) ----------

export interface SessionEnLigne {
  jeton: string;
  jetonRenouvellement: string;
  /** Date d'expiration du jeton, en millisecondes depuis 1970. */
  expireLe: number;
}

/**
 * Après un clic sur le lien de connexion, Supabase revient sur le site avec les jetons dans l'adresse
 * (#access_token=…&refresh_token=…&expires_in=…). Renvoie la session, ou null si l'adresse n'en contient pas.
 */
export function sessionDepuisAdresse(hash: string, maintenant = Date.now()): SessionEnLigne | null {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const jeton = p.get('access_token');
  const renouvellement = p.get('refresh_token');
  if (!jeton || !renouvellement) return null;
  const duree = Number(p.get('expires_in') ?? '3600');
  return { jeton, jetonRenouvellement: renouvellement, expireLe: maintenant + (Number.isFinite(duree) ? duree : 3600) * 1000 };
}

/** Message d'erreur renvoyé dans l'adresse par Supabase (lien expiré, par exemple), ou null. */
export function erreurDepuisAdresse(hash: string): string | null {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  const e = p.get('error_description') ?? p.get('error');
  return e ? 'Le lien de connexion a expiré ou a déjà servi : demandez-en un nouveau.' : null;
}

/** Lit un lien de groupe ; null si l'adresse n'en est pas un. */
export function lireLienGroupes(search: string): { codePartie: string; config: ConfigEnLigne } | null {
  const p = new URLSearchParams(search);
  const partie = p.get('partie');
  const service = p.get('service');
  const cle = p.get('cle');
  if (!partie || !service || !cle || !/^https:\/\//.test(service)) return null;
  return { codePartie: partie.toUpperCase(), config: { url: service, cleAnon: cle } };
}


/**
 * Au démarrage : si l'adresse contient le retour de la connexion (jetons ou erreur), le mémorise pour l'onglet
 * Simulateur et nettoie l'adresse (les jetons ne doivent pas rester visibles ni dans l'historique).
 */
export function capturerRetourConnexion(): void {
  if (typeof location === 'undefined' || !/access_token=|error_description=/.test(location.hash)) return;
  const session = sessionDepuisAdresse(location.hash);
  const erreur = session ? null : erreurDepuisAdresse(location.hash);
  ecrire({ session, erreur, le: new Date().toISOString() }, CLE_RETOUR_CONNEXION);
  history.replaceState(null, '', `${location.pathname}${location.search}`);
}
