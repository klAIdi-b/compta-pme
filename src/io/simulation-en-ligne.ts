// Simulateur : échange en ligne avec Supabase (phase S5, préparée le 21.11.2026, pas encore branchée à l'interface).
// Seul fichier qui communique avec un service en ligne ; chargé à la demande. Sans dépendance : appels HTTP directs à
// l'API REST de Supabase (PostgREST et Auth). Schéma de la base : `supabase/schema.sql`.
// Données anonymes du jeu seulement (CLAUDE.md, accord du 20.11.2026) : jamais de nom d'élève ni de note.

import type { Decisions } from '../engine/simulation/types';
import type { DecisionsGroupe, SituationGroupe } from '../engine/simulation/situation';

export interface ConfigEnLigne {
  /** Adresse du projet Supabase, par exemple https://abcd.supabase.co */
  url: string;
  /** Clé publique (« anon ») du projet : elle ne donne accès qu'à ce que les règles de la base permettent. */
  cleAnon: string;
}

export class ErreurEnLigne extends Error {}

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

/** SHA-256 hexadécimal (codes d'équipe : seule l'empreinte est stockée en ligne). */
export async function empreinte(texte: string): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte.toUpperCase()));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class ClientSimulation {
  private readonly base: string;

  constructor(
    private readonly config: ConfigEnLigne,
    private readonly fetchFn: Fetch = (u, i) => fetch(u, i),
    /** Jeton de session de l'enseignant (après connexion par lien e-mail) ; absent pour un groupe. */
    private jeton: string | null = null,
  ) {
    this.base = config.url.replace(/\/+$/, '');
  }

  definirJeton(jeton: string | null) {
    this.jeton = jeton;
  }

  private async appel<T>(chemin: string, corps: unknown, methode = 'POST', entetes: Record<string, string> = {}): Promise<T> {
    let r: Response;
    try {
      r = await this.fetchFn(`${this.base}${chemin}`, {
        method: methode,
        headers: {
          apikey: this.config.cleAnon,
          Authorization: `Bearer ${this.jeton ?? this.config.cleAnon}`,
          'Content-Type': 'application/json',
          ...entetes,
        },
        body: corps === undefined ? undefined : JSON.stringify(corps),
      });
    } catch {
      throw new ErreurEnLigne('Pas de connexion au service en ligne. Vérifiez le réseau, ou passez par les fichiers.');
    }
    const texte = await r.text();
    const json = texte ? (JSON.parse(texte) as unknown) : null;
    if (!r.ok) {
      const m = (json as { message?: string } | null)?.message;
      throw new ErreurEnLigne(m && r.status < 500 ? m : `Le service en ligne a répondu par une erreur (${r.status}).`);
    }
    return json as T;
  }

  // ---------- Groupe (sans compte) ----------

  async rejoindre(code: string, codeEquipe: string): Promise<{ entrepriseId: string; numeroTour: number; situation: SituationGroupe | null }> {
    return this.appel('/rest/v1/rpc/rejoindre_partie', { p_code: code, p_code_equipe: codeEquipe });
  }

  async deposerDecisions(code: string, codeEquipe: string, numeroTour: number, decisions: Decisions): Promise<void> {
    await this.appel('/rest/v1/rpc/deposer_decisions', { p_code: code, p_code_equipe: codeEquipe, p_tour: numeroTour, p_decisions: decisions });
  }

  async lireResultats(code: string, codeEquipe: string): Promise<unknown> {
    return this.appel('/rest/v1/rpc/lire_resultats', { p_code: code, p_code_equipe: codeEquipe });
  }

  // ---------- Enseignant (connecté) ----------

  /** Envoie le lien de connexion à l'adresse de l'enseignant (son propre compte Supabase). */
  async envoyerLienConnexion(email: string, retour: string): Promise<void> {
    await this.appel(`/auth/v1/otp?redirect_to=${encodeURIComponent(retour)}`, { email, create_user: true });
  }

  private exigerJeton() {
    if (!this.jeton) throw new ErreurEnLigne("Connectez-vous d'abord (lien reçu par e-mail).");
  }

  /** Crée la partie en ligne et ses équipes ; renvoie l'identifiant en ligne. */
  async publierPartie(p: { code: string; nom: string; affichage: string; equipes: { entrepriseId: string; nom: string; code: string }[] }): Promise<string> {
    this.exigerJeton();
    const [partie] = await this.appel<{ id: string }[]>('/rest/v1/sim_parties', { code: p.code, nom: p.nom, affichage: p.affichage }, 'POST', {
      Prefer: 'return=representation',
    });
    const equipes = await Promise.all(
      p.equipes.map(async (e) => ({ partie_id: partie!.id, entreprise_id: e.entrepriseId, nom: e.nom, code_hash: await empreinte(e.code) })),
    );
    await this.appel('/rest/v1/sim_equipes', equipes, 'POST', { Prefer: 'return=minimal' });
    return partie!.id;
  }

  /** Publie la situation de chaque groupe pour le tour et met à jour le numéro du tour en cours. */
  async publierTour(partieId: string, numeroTour: number, situations: SituationGroupe[], termine = false): Promise<void> {
    this.exigerJeton();
    await this.appel(
      '/rest/v1/sim_situations?on_conflict=partie_id,entreprise_id',
      situations.map((s) => ({ partie_id: partieId, entreprise_id: s.entreprise.id, numero_tour: numeroTour, situation: s })),
      'POST',
      { Prefer: 'resolution=merge-duplicates,return=minimal' },
    );
    await this.appel(`/rest/v1/sim_parties?id=eq.${encodeURIComponent(partieId)}`, { numero_tour: numeroTour, termine }, 'PATCH', { Prefer: 'return=minimal' });
  }

  /** Décisions reçues pour le tour ; `partieIdLocal` est l'identifiant de la partie dans le navigateur de l'enseignant. */
  async lireDecisions(partieId: string, numeroTour: number, partieIdLocal: string): Promise<DecisionsGroupe[]> {
    this.exigerJeton();
    const lignes = await this.appel<{ entreprise_id: string; numero_tour: number; decisions: Decisions }[]>(
      `/rest/v1/sim_decisions?partie_id=eq.${encodeURIComponent(partieId)}&numero_tour=eq.${numeroTour}&select=entreprise_id,numero_tour,decisions`,
      undefined,
      'GET',
    );
    return lignes.map((l) => ({ partieId: partieIdLocal, numeroTour: l.numero_tour, entrepriseId: l.entreprise_id, decisions: l.decisions }));
  }

  /** Publie le tableau des résultats du tour (déjà filtré selon l'option d'affichage). */
  async publierResultats(partieId: string, numeroTour: number, tableau: unknown): Promise<void> {
    this.exigerJeton();
    await this.appel('/rest/v1/sim_resultats?on_conflict=partie_id,numero_tour', { partie_id: partieId, numero_tour: numeroTour, tableau }, 'POST', {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    });
  }
}
