// Phase S5 (préparation) : situation d'un groupe, échange par fichier, codes, client en ligne (serveur simulé).
import { describe, expect, it } from 'vitest';
import { MARCHE_PAR_DEFAUT, SECTEUR_VELOS } from '../src/data/simulation/secteurs';
import {
  ALPHABET_CODES,
  controlerDecisions,
  controlerDecisionsRecues,
  controlerDecisionsSituation,
  creerPartie,
  genererCodes,
  jouerTour,
  normaliserCode,
  resultatsPublics,
  situationGroupe,
} from '../src/engine/simulation';
import type { Decisions, Partie, ReglagesPartie } from '../src/engine/simulation';
import { exporterDecisions, exporterSituation, importerDecisions, importerSituation } from '../src/io/simulation';
import { ErreurFichier } from '../src/io/fichiers';
import { ClientSimulation, empreinte, ErreurEnLigne } from '../src/io/simulation-en-ligne';

const reglages = (o: Partial<ReglagesPartie> = {}): ReglagesPartie => ({
  niveau: 'CFC1', secteur: SECTEUR_VELOS, dureeTour: 'mois', nbTours: 3, annee: 2027, comptabilite: 'eleves',
  affichage: 'classement', cloture: false, marche: MARCHE_PAR_DEFAUT, ...o,
});
const E = [{ id: 'a', nom: 'Les Lémaniques' }, { id: 'b', nom: 'Rhône Express' }];
const d = (prix: number): Decisions => ({ prixVente: prix, quantiteAchetee: 10, publicite: 50000, fournisseur: 'grossiste', prelevementPrive: 0 });
const META = { partieId: 'sim-1', partieNom: '2CA essai' };

function partie(r = reglages()): Partie {
  const c = creerPartie(r, E);
  if (!c.ok) throw new Error();
  const t = jouerTour(c.valeur, { a: d(89900), b: d(85000) });
  if (!t.ok) throw new Error();
  return t.valeur;
}

describe("situation d'un groupe", () => {
  it('ne contient que ses propres chiffres et le résumé de son tour précédent', () => {
    const p = partie();
    const s = situationGroupe(p, META, [{ type: 'hausseFournisseur', entrepriseId: 'b', pourcent: 5 }], 'a', { a: d(91000) })!;
    expect(s.numeroTour).toBe(2);
    expect(s.entreprise).toEqual(E[0]);
    expect(s.imprevus).toEqual([]);
    expect(s.precedent!.decisions.prixVente).toBe(89900);
    expect(s.decisionsValidees!.prixVente).toBe(91000);
    expect(JSON.stringify(s)).not.toContain('Rhône Express');
    expect(controlerDecisionsSituation(s, d(89900))).toEqual(controlerDecisions(p.reglages, s.etat, d(89900), 2));
  });

  it('contrôle les décisions reçues : partie, tour, entreprise, liquidités', () => {
    const p = partie();
    expect(controlerDecisionsRecues(p, META, [], { partieId: 'autre', numeroTour: 2, entrepriseId: 'a', decisions: d(89900) })).toHaveLength(1);
    expect(controlerDecisionsRecues(p, META, [], { partieId: 'sim-1', numeroTour: 1, entrepriseId: 'a', decisions: d(89900) })[0]).toMatch(/tour 1/);
    expect(controlerDecisionsRecues(p, META, [], { partieId: 'sim-1', numeroTour: 2, entrepriseId: 'z', decisions: d(89900) })).toHaveLength(1);
    expect(controlerDecisionsRecues(p, META, [], { partieId: 'sim-1', numeroTour: 2, entrepriseId: 'a', decisions: d(89900) })).toEqual([]);
    expect(controlerDecisionsRecues(p, META, [], { partieId: 'sim-1', numeroTour: 2, entrepriseId: 'a', decisions: { ...d(89900), quantiteAchetee: 120, fournisseur: 'importateur' } })[0]).toMatch(/^Les Lémaniques : Liquidités insuffisantes/);
  });

  it("résultats publics selon l'option d'affichage", () => {
    expect(resultatsPublics(partie())!.lignes[0]!.rang).toBe(1);
    const sans = resultatsPublics(partie(reglages({ affichage: 'sansRang' })))!;
    expect(sans.lignes.map((l) => l.nom)).toEqual(['Les Lémaniques', 'Rhône Express']);
    expect(sans.lignes[0]).not.toHaveProperty('rang');
    expect(resultatsPublics(partie(reglages({ affichage: 'cache' })))!.lignes).toEqual([]);
  });
});

describe('échange par fichier', () => {
  it('situation et décisions se relisent à l’identique', () => {
    const s = situationGroupe(partie(), META, [], 'a')!;
    expect(importerSituation(exporterSituation(s))).toEqual(s);
    const dec = { partieId: 'sim-1', numeroTour: 2, entrepriseId: 'a', decisions: d(90000) };
    expect(importerDecisions(exporterDecisions(dec))).toEqual(dec);
  });

  it('refuse les mauvais fichiers avec un message clair', () => {
    const dec = exporterDecisions({ partieId: 'sim-1', numeroTour: 2, entrepriseId: 'a', decisions: d(90000) });
    expect(() => importerSituation(dec)).toThrow(/c'est l'enseignant qui l'importe/);
    expect(() => importerDecisions('{"format":"compta-pme/exercice","version":1}')).toThrow(ErreurFichier);
    expect(() => importerSituation('pas du json')).toThrow(/JSON invalide/);
  });
});

describe('codes de partie et d’équipe', () => {
  it('codes de 6 et 8 caractères, sans caractère ambigu, tous différents', () => {
    let k = 0;
    const hasard = () => ((k++ * 7919) % 1000) / 1000;
    const c = genererCodes([...E, { id: 'c', nom: 'C' }], hasard);
    expect(c.partie).toHaveLength(6);
    const tous = [c.partie, ...Object.values(c.equipes)];
    expect(new Set(tous).size).toBe(4);
    for (const x of Object.values(c.equipes)) expect(x).toHaveLength(8);
    for (const x of tous) for (const ch of x) expect(ALPHABET_CODES).toContain(ch);
    expect(ALPHABET_CODES).not.toMatch(/[01ILO]/);
    expect(normaliserCode(' ab-c2 9x ')).toBe('ABC29X');
  });
});

describe('client en ligne (serveur simulé)', () => {
  const config = { url: 'https://exemple.supabase.co/', cleAnon: 'cle-publique' };

  function serveur(reponses: { status: number; corps: unknown }[]) {
    const appels: { url: string; init: RequestInit }[] = [];
    const fetchFn = async (url: string, init: RequestInit) => {
      appels.push({ url, init });
      const r = reponses.shift() ?? { status: 204, corps: null };
      return new Response(r.corps === null ? null : JSON.stringify(r.corps), { status: r.status });
    };
    return { appels, fetchFn };
  }

  it("un groupe rejoint la partie par la fonction rejoindre_partie, avec la clé publique", async () => {
    const s = serveur([{ status: 200, corps: { entrepriseId: 'a', numeroTour: 2, situation: null } }]);
    const c = new ClientSimulation(config, s.fetchFn);
    const r = await c.rejoindre('ABCDEF', 'GHJKMNPQ');
    expect(r.entrepriseId).toBe('a');
    expect(s.appels[0]!.url).toBe('https://exemple.supabase.co/rest/v1/rpc/rejoindre_partie');
    expect((s.appels[0]!.init.headers as Record<string, string>).apikey).toBe('cle-publique');
    expect(JSON.parse(s.appels[0]!.init.body as string)).toEqual({ p_code: 'ABCDEF', p_code_equipe: 'GHJKMNPQ' });
  });

  it('transmet les messages de la base et traduit les pannes réseau', async () => {
    const s = serveur([{ status: 400, corps: { message: "Code de partie ou code d'équipe incorrect." } }]);
    await expect(new ClientSimulation(config, s.fetchFn).deposerDecisions('ABCDEF', 'X', 2, d(1))).rejects.toThrow("Code de partie ou code d'équipe incorrect.");
    const panne = new ClientSimulation(config, async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(panne.rejoindre('A', 'B')).rejects.toThrow(/passez par les fichiers/);
    const s500 = serveur([{ status: 500, corps: { message: 'détail interne' } }]);
    await expect(new ClientSimulation(config, s500.fetchFn).rejoindre('A', 'B')).rejects.toThrow('(500)');
  });

  it("l'enseignant doit être connecté ; seules les empreintes des codes d'équipe partent en ligne", async () => {
    const s = serveur([{ status: 201, corps: [{ id: 'uuid-1' }] }, { status: 201, corps: null }]);
    const c = new ClientSimulation(config, s.fetchFn);
    await expect(c.publierPartie({ code: 'ABCDEF', nom: 'x', affichage: 'classement', equipes: [] })).rejects.toThrow(ErreurEnLigne);
    c.definirJeton('jeton-enseignant');
    const id = await c.publierPartie({ code: 'ABCDEF', nom: '2CA', affichage: 'classement', equipes: [{ entrepriseId: 'a', nom: 'Les Lémaniques', code: 'GHJKMNPQ' }] });
    expect(id).toBe('uuid-1');
    expect((s.appels[0]!.init.headers as Record<string, string>).Authorization).toBe('Bearer jeton-enseignant');
    const equipes = JSON.parse(s.appels[1]!.init.body as string);
    expect(equipes[0].code_hash).toBe(await empreinte('GHJKMNPQ'));
    expect(JSON.stringify(equipes)).not.toContain('GHJKMNPQ');
    expect(await empreinte('abc')).toBe('b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78');
  });

  it("lit les décisions du tour et les rattache à la partie locale", async () => {
    const s = serveur([{ status: 200, corps: [{ entreprise_id: 'a', numero_tour: 2, decisions: d(90000) }] }]);
    const c = new ClientSimulation(config, s.fetchFn, 'jeton');
    const r = await c.lireDecisions('uuid-1', 2, 'sim-1');
    expect(r).toEqual([{ partieId: 'sim-1', numeroTour: 2, entrepriseId: 'a', decisions: d(90000) }]);
    expect(s.appels[0]!.init.method).toBe('GET');
    expect(s.appels[0]!.url).toContain('sim_decisions?partie_id=eq.uuid-1&numero_tour=eq.2');
  });
});
