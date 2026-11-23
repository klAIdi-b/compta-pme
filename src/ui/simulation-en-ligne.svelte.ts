// Simulateur en ligne, côté enseignant : configuration du service, connexion, mise en ligne d'une partie,
// publication des situations et des résultats, relève des décisions des groupes.
// Le calcul reste dans ce navigateur ; le service ne fait que stocker et transmettre des données de jeu anonymes.

import { ESPACE } from '../io/espace';
import { simulations } from './simulation.svelte';
import { lire, ecrire, effacer } from '../io/stockage';
import { ClientSimulation, controlerConfig, ErreurEnLigne, renouvelerSession } from '../io/simulation-en-ligne';
import { CLE_RETOUR_CONNEXION, type ConfigEnLigne, type SessionEnLigne } from '../io/simulation-session';
import type { PartieEnregistree } from '../io/simulation';
import { controlerDecisionsRecues, genererCodes, resultatsPublics, situationGroupe } from '../engine/simulation/situation';
import type { Decisions, Imprevu } from '../engine/simulation/types';

const CLE = `${ESPACE}:simulateur-en-ligne:v1`;

interface Donnees {
  config: ConfigEnLigne | null;
  session: SessionEnLigne | null;
  email: string;
}

class EnLigneEnseignant {
  config = $state<ConfigEnLigne | null>(null);
  session = $state<SessionEnLigne | null>(null);
  email = $state('');
  /** Message à afficher après le retour de la connexion (succès ou lien expiré). */
  messageConnexion = $state('');

  constructor() {
    const d = lire<Donnees>(CLE);
    if (d) {
      this.config = d.config;
      this.session = d.session;
      this.email = d.email ?? '';
    }
    const retour = lire<{ session: SessionEnLigne | null; erreur: string | null }>(CLE_RETOUR_CONNEXION);
    if (retour) {
      effacer(CLE_RETOUR_CONNEXION);
      if (retour.session) {
        this.session = retour.session;
        this.messageConnexion = 'Vous êtes connecté au service en ligne.';
      } else if (retour.erreur) this.messageConnexion = retour.erreur;
    }
    this.sauver();
  }

  sauver() {
    ecrire({ config: this.config, session: this.session, email: this.email } satisfies Donnees, CLE);
  }

  get configure(): boolean {
    return !!this.config;
  }

  get connecte(): boolean {
    return !!this.session;
  }

  definirConfig(c: ConfigEnLigne): string[] {
    const propre = { url: c.url.trim().replace(/\/+$/, ''), cleAnon: c.cleAnon.trim() };
    const e = controlerConfig(propre);
    if (e.length) return e;
    this.config = propre;
    this.sauver();
    return [];
  }

  oublierConfig() {
    this.config = null;
    this.session = null;
    this.sauver();
  }

  deconnecter() {
    this.session = null;
    this.sauver();
  }

  /** Client prêt à l'emploi ; renouvelle la session si elle expire dans moins de 5 minutes. */
  async client(enseignant = true): Promise<ClientSimulation> {
    if (!this.config) throw new ErreurEnLigne("Le service en ligne n'est pas configuré.");
    if (!enseignant) return new ClientSimulation(this.config);
    if (!this.session) throw new ErreurEnLigne("Connectez-vous d'abord (lien reçu par e-mail).");
    if (this.session.expireLe - Date.now() < 5 * 60 * 1000) {
      try {
        this.session = await renouvelerSession(this.config, this.session);
        this.sauver();
      } catch {
        this.session = null;
        this.sauver();
        throw new ErreurEnLigne('Votre connexion a expiré : demandez un nouveau lien de connexion.');
      }
    }
    return new ClientSimulation(this.config, undefined, this.session.jeton);
  }

  async envoyerLien(email: string): Promise<void> {
    this.email = email.trim();
    this.sauver();
    const retour = `${location.origin}${location.pathname}`;
    await (await this.client(false)).envoyerLienConnexion(this.email, retour);
  }

  /** Met la partie en ligne : codes, équipes, situations du tour en cours. */
  async mettreEnLigne(id: string): Promise<void> {
    const e = simulations.trouver(id);
    if (!e) return;
    const c = await this.client();
    const codes = genererCodes(e.entreprises);
    const idEnLigne = await c.publierPartie({
      code: codes.partie,
      nom: e.nom,
      affichage: e.reglages.affichage,
      equipes: e.entreprises.map((x) => ({ entrepriseId: x.id, nom: x.nom, code: codes.equipes[x.id]! })),
    });
    e.enLigne = { id: idEnLigne, code: codes.partie, codesEquipes: codes.equipes, tourPublie: 0 };
    await this.publierSituations(id);
  }

  /** Publie la situation de chaque groupe pour le tour en cours (après un calcul, un imprévu ou une décision saisie ici). */
  async publierSituations(id: string): Promise<void> {
    const e = simulations.trouver(id);
    const p = simulations.calculee(id);
    if (!e?.enLigne || !p) return;
    const c = await this.client();
    const termine = p.tours.length >= e.reglages.nbTours;
    const imprevus = $state.snapshot(e.imprevus ?? []) as Imprevu[];
    const brouillon = $state.snapshot(e.brouillon) as Record<string, Decisions>;
    const situations = termine
      ? []
      : e.entreprises.map((x) => situationGroupe(p, { partieId: e.id, partieNom: e.nom }, imprevus, x.id, brouillon)!);
    await c.publierTour(e.enLigne.id, p.tours.length + 1, situations, termine);
    const res = resultatsPublics(p);
    if (res) await c.publierResultats(e.enLigne.id, res.numeroTour, res);
    e.enLigne.tourPublie = p.tours.length + 1;
    e.enLigne.empreintePubliee = empreinteAPublier(e);
  }

  /** Relève les décisions déposées par les groupes ; renvoie les noms acceptés et les erreurs. */
  async releverDecisions(id: string): Promise<{ acceptees: string[]; erreurs: string[] }> {
    const e = simulations.trouver(id);
    const p = simulations.calculee(id);
    if (!e?.enLigne || !p) return { acceptees: [], erreurs: [] };
    const c = await this.client();
    const recues = await c.lireDecisions(e.enLigne.id, p.tours.length + 1, e.id);
    const acceptees: string[] = [];
    const erreurs: string[] = [];
    const imprevus = $state.snapshot(e.imprevus ?? []) as Imprevu[];
    for (const d of recues) {
      const deja = e.brouillon[d.entrepriseId];
      if (deja && JSON.stringify(deja) === JSON.stringify(d.decisions)) continue;
      const err = controlerDecisionsRecues(p, { partieId: e.id }, imprevus, d);
      if (err.length) erreurs.push(...err);
      else {
        simulations.validerDecisions(id, d.entrepriseId, d.decisions);
        acceptees.push(e.entreprises.find((x) => x.id === d.entrepriseId)!.nom);
      }
    }
    return { acceptees, erreurs };
  }
}

export const enLigne = new EnLigneEnseignant();

/** Ce qui doit être publié : le tour, les imprévus et les décisions validées. */
export function empreinteAPublier(e: PartieEnregistree): string {
  return `${e.decisionsParTour.length}|${JSON.stringify(e.imprevus ?? [])}|${JSON.stringify(e.brouillon)}`;
}

/** Partie en ligne ? */
export function estEnLigne(e: PartieEnregistree | undefined): boolean {
  return !!e?.enLigne;
}
