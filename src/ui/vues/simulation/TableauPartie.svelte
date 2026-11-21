<!-- Simulateur : tableau de la partie (écran 2 de la maquette validée le 21.11.2026). -->
<script lang="ts">
  import { simulations } from '../../simulation.svelte';
  import { controlerDecisions, estCfc2, etatsCourants, imprevusEntreprise, libellePeriode, moisDuTour, partieTerminee } from '../../../engine/simulation/tour';
  import type { Imprevu } from '../../../engine/simulation/types';
  import { imprimerFichesAfp } from './impression';
  import EnLigneCarte from './EnLigneCarte.svelte';
  import { libelleImprevu } from './libelles';
  import { exerciceEntreprise } from '../../../engine/simulation/exercice';
  import { formatMontant } from '../../../engine/money';
  import { controlerExercice, type Exercice } from '../../../engine/exercice';
  import { plan } from '../../../data/plan';
  import { EXT_EXERCICE, exporterExercice, exporterExerciceEnseignant, nomFichier } from '../../../io/fichiers';
  import { EXT_DECISIONS, EXT_SIMULATION, EXT_SITUATION, exporterPartie, exporterSituation, importerDecisions } from '../../../io/simulation';
  import { choisirFichiers, telecharger, telechargerBlob } from '../../fichiers-navigateur';
  import { controlerDecisionsRecues, situationGroupe } from '../../../engine/simulation/situation';
  import { creerZip } from '../../../io/zip';
  import { ErreurFichier } from '../../../io/fichiers';
  import type { Decisions } from '../../../engine/simulation/types';
  import { etat } from '../../etat.svelte';
  import { enseignant } from '../../enseignant.svelte';
  import { LIBELLE_AFFICHAGE, LIBELLE_COMPTABILITE, LIBELLE_NIVEAU } from './libelles';

  let { id }: { id: string } = $props();

  const e = $derived(simulations.trouver(id)!);
  const p = $derived(simulations.calculee(id));
  const r = $derived(e.reglages);
  const n = $derived(e.decisionsParTour.length + 1);
  const termine = $derived(p ? partieTerminee(p) : false);
  const etats = $derived(p ? etatsCourants(p) : new Map());
  const dernier = $derived(p?.tours.at(-1));
  let erreurs = $state<string[]>([]);
  let message = $state('');

  const statuts = $derived(
    e.entreprises.map((x) => {
      const d = e.brouillon[x.id];
      const err = d && !termine && p ? controlerDecisions(r, etats.get(x.id)!, d, n, imprevusEntreprise(p, e.imprevus ?? [], x.id)) : [];
      return { x, d, err };
    }),
  );
  const recues = $derived(statuts.filter((s) => s.d && s.err.length === 0).length);
  const pret = $derived(!termine && recues === e.entreprises.length);
  const saison = $derived(termine ? 0 : moisDuTour(r, n).reduce((t, m) => t + r.secteur.saison[m - 1]!, 0) / moisDuTour(r, n).length);
  const prochainASaisir = $derived(
    r.comptabilite === 'eleves' ? 'chaque tour' : r.comptabilite === 'mixte' ? (r.toursSaisis ?? []).map((t) => `tour ${t}`).join(', ') : 'aucun',
  );

  // Imprévus du tour en cours (déclenchés par l'enseignant, choix du 21.11.2026).
  let typeImprevu = $state<Imprevu['type']>('hausseFournisseur');
  let cibleImprevu = $state<string>('');
  let pourcentImprevu = $state(8);
  let erreursImprevu = $state<string[]>([]);

  function ajouterImprevu() {
    const imp: Imprevu =
      typeImprevu === 'hausseFournisseur'
        ? { type: 'hausseFournisseur', entrepriseId: cibleImprevu || null, pourcent: Number(pourcentImprevu) }
        : { type: 'clientInsolvable', entrepriseId: cibleImprevu || e.entreprises[0]!.id };
    erreursImprevu = simulations.ajouterImprevu(id, imp);
  }

  // Échange par fichier avec les groupes (phase S5, sans connexion).
  function distribuer() {
    if (!p) return;
    const imprevus = $state.snapshot(e.imprevus ?? []) as Imprevu[];
    const brouillon = $state.snapshot(e.brouillon) as Record<string, Decisions>;
    const fichiers = e.entreprises.map((x) => {
      const sit = situationGroupe(p!, { partieId: e.id, partieNom: e.nom }, imprevus, x.id, brouillon)!;
      return { nom: nomFichier([x.nom, `tour-${n}`], EXT_SITUATION), donnees: new TextEncoder().encode(exporterSituation(sit)) };
    });
    telechargerBlob(nomFichier([e.nom, `situations-tour-${n}`], '.zip'), new Blob([creerZip(fichiers)], { type: 'application/zip' }));
    message = `Un fichier de situation par groupe a été téléchargé (archive ZIP). Remettez à chaque groupe le sien (par exemple dans un devoir Google Classroom) : il l'ouvre dans Compta PME (accueil, « Simulateur : ouvrir ma situation »), décide, puis dépose son fichier de décisions dans le devoir Classroom.`;
  }

  async function importerLesDecisions() {
    if (!p) return;
    message = '';
    erreurs = [];
    const fichiers = await choisirFichiers(`${EXT_DECISIONS},.json`, true);
    const ok: string[] = [];
    const ko: string[] = [];
    for (const f of fichiers) {
      try {
        const d = importerDecisions(f.texte);
        const err = controlerDecisionsRecues(p, { partieId: e.id }, $state.snapshot(e.imprevus ?? []) as Imprevu[], d);
        if (err.length) ko.push(...err);
        else {
          simulations.validerDecisions(id, d.entrepriseId, d.decisions);
          ok.push(e.entreprises.find((x) => x.id === d.entrepriseId)!.nom);
        }
      } catch (err) {
        ko.push(`${f.nom} : ${err instanceof ErreurFichier ? err.message : 'fichier illisible.'}`);
      }
    }
    if (ok.length) message = `Décisions importées : ${ok.join(', ')}.`;
    erreurs = ko;
  }

  function imprimer(corrige: boolean) {
    if (!p || !imprimerFichesAfp(p, p.tours.length, corrige)) {
      message = "La fenêtre d'impression a été bloquée par le navigateur : autorisez les fenêtres pour ce site, puis réessayez.";
    }
  }

  function calculer() {
    erreurs = simulations.calculerTour(id);
    if (erreurs.length === 0) simulations.vue = { ecran: 'projection', id };
  }

  function annuler() {
    if (!confirm(`Annuler le calcul du tour ${e.decisionsParTour.length} ? Ses décisions redeviennent modifiables.`)) return;
    simulations.annulerDernierTour(id);
    message = 'Le dernier tour a été annulé : vous pouvez modifier ses décisions et le recalculer.';
  }

  function exercice(entrepriseId: string): Exercice {
    return exerciceEntreprise(p!, entrepriseId);
  }

  function apercu(entrepriseId: string) {
    etat.ouvrirApercu(exercice(entrepriseId));
    enseignant.ouvert = false;
  }

  function exporterEx(entrepriseId: string, version: 'eleves' | 'enseignant') {
    const ex = exercice(entrepriseId);
    const { erreurs: err } = controlerExercice(ex, plan);
    if (err.length) return (message = `L'exercice de ${ex.raisonSociale} n'est pas encore utilisable : ${err.join(' ')}`);
    if (version === 'eleves') telecharger(nomFichier([ex.raisonSociale, 'simulation'], EXT_EXERCICE), exporterExercice(ex));
    else telecharger(nomFichier([ex.raisonSociale, 'simulation', 'enseignant'], EXT_EXERCICE), exporterExerciceEnseignant(ex));
  }

  function exporter() {
    telecharger(nomFichier(['simulation', e.nom], EXT_SIMULATION), exporterPartie($state.snapshot(e) as typeof e));
  }
</script>

<div class="partie">
  <div class="titre">
    <div>
      <h1>{e.nom}</h1>
      <div class="pastilles">
        <span class="badge fort">{LIBELLE_NIVEAU[r.niveau]}</span>
        <span class="badge">{r.secteur.nom}</span>
        <span class="badge">Comptabilité {LIBELLE_COMPTABILITE[r.comptabilite]}</span>
        <span class="badge">Résultats : {LIBELLE_AFFICHAGE[r.affichage]}</span>
      </div>
    </div>
    <div class="actions-haut">
      <button class="btn-lien" onclick={() => (simulations.vue = { ecran: 'liste' })}>Retour aux parties</button>
      <button class="btn" onclick={exporter}>Exporter la partie</button>
    </div>
  </div>

  {#if !p}
    <div class="alerte" role="alert">Cette partie ne peut pas être recalculée : le fichier semble endommagé.</div>
  {:else}
    {#if message}<p class="info" role="status">{message}</p>{/if}
    <div class="kpis">
      <div class="carte kpi">
        <div class="l">{termine ? 'Partie' : 'Tour en cours'}</div>
        <div class="v">{termine ? 'terminée' : libellePeriode(r, n)}</div>
        <div class="d">{termine ? `${r.nbTours} tours joués` : `Tour ${n} sur ${r.nbTours} · saison ${Math.round(saison)} % d'un mois moyen`}</div>
      </div>
      <div class="carte kpi">
        <div class="l">Décisions validées</div>
        <div class="v num">{termine ? '—' : `${recues} / ${e.entreprises.length}`}</div>
        <div class="d">{termine ? '' : recues === e.entreprises.length ? 'Le tour peut être calculé' : `Il manque ${statuts.filter((s) => !s.d || s.err.length).map((s) => s.x.nom).join(', ')}`}</div>
      </div>
      <div class="carte kpi">
        <div class="l">Tour précédent</div>
        <div class="v num">{dernier ? `${dernier.demandeTotale} clients` : '—'}</div>
        <div class="d">{dernier ? `Prix moyen du marché ${formatMontant(dernier.prixMoyen)}` : 'Aucun tour joué'}</div>
      </div>
      <div class="carte kpi">
        <div class="l">Saisie des élèves</div>
        <div class="v">{r.comptabilite === 'automatique' ? 'aucune' : r.comptabilite === 'eleves' ? 'tous les tours' : `${(r.toursSaisis ?? []).length} tour(s)`}</div>
        <div class="d">{r.comptabilite === 'mixte' ? prochainASaisir : r.comptabilite === 'eleves' ? 'Exercice à exporter après chaque tour' : 'Comptabilité tenue par le simulateur'}</div>
      </div>
    </div>

    <EnLigneCarte {id} {termine} />

    {#if !termine}
      <section class="carte">
        <header class="tete"><h2>Imprévus du tour {n}</h2><span class="aide">Annoncez-les aux groupes avant leurs décisions.</span></header>
        <div class="corps-carte imprevus">
          {#if (e.imprevus ?? []).length}
            <ul>
              {#each e.imprevus ?? [] as imp, i}
                <li>{libelleImprevu(imp, e.entreprises, r.secteur)} <button class="btn-lien" onclick={() => simulations.retirerImprevu(id, i)}>Retirer</button></li>
              {/each}
            </ul>
          {:else}
            <p class="aide">Aucun imprévu pour ce tour.</p>
          {/if}
          <div class="ligne">
            <select class="champ court-auto" bind:value={typeImprevu} aria-label="Type d'imprévu">
              <option value="hausseFournisseur">Hausse du prix d'achat</option>
              {#if estCfc2(r)}<option value="clientInsolvable">Client insolvable</option>{/if}
            </select>
            <select class="champ court-auto" bind:value={cibleImprevu} aria-label="Entreprise touchée">
              {#if typeImprevu === 'hausseFournisseur'}<option value="">Tout le marché</option>{/if}
              {#each e.entreprises as x}<option value={x.id}>{x.nom}</option>{/each}
            </select>
            {#if typeImprevu === 'hausseFournisseur'}
              <label class="ligne">de <input class="champ pourcent num" type="number" min="5" max="10" bind:value={pourcentImprevu} aria-label="Hausse en pour cent" /> %</label>
            {/if}
            <button class="btn" onclick={ajouterImprevu}>Ajouter l'imprévu</button>
          </div>
          {#if erreursImprevu.length}<p class="alerte" role="alert">{erreursImprevu.join(' ')}</p>{/if}
        </div>
      </section>

      <section class="carte">
        <header class="tete">
          <h2>Décisions du tour {n}</h2>
          <div class="ligne">
            {#if !pret}<span class="aide">Le calcul est possible quand les {e.entreprises.length} groupes ont validé.</span>{/if}
            <button class="btn btn-principal" disabled={!pret} onclick={calculer}>Calculer le tour {n}</button>
          </div>
        </header>
        {#if erreurs.length}<div class="alerte marge" role="alert"><ul>{#each erreurs as m}<li>{m}</li>{/each}</ul></div>{/if}
        <div class="defile">
          <table>
            <thead>
              <tr>
                <th>Entreprise</th><th>Décisions</th><th class="montant">Prix de vente</th><th class="montant">Commande</th>
                <th class="montant">Publicité</th><th class="montant">Banque</th><th class="montant">Stock</th><th><span class="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {#each statuts as s, i (s.x.id)}
                {@const et = etats.get(s.x.id)}
                <tr class:zebre={i % 2 === 1}>
                  <td><b>{s.x.nom}</b></td>
                  <td>
                    {#if !s.d}<span class="statut att">En attente</span>
                    {:else if s.err.length}<span class="statut att" title={s.err.join(' ')}>À revoir</span>
                    {:else}<span class="statut ok">Validées</span>{/if}
                  </td>
                  <td class="montant">{s.d ? formatMontant(s.d.prixVente) : '—'}</td>
                  <td class="montant">{s.d ? `${s.d.quantiteAchetee}${r.niveau === 'AFP' ? '' : ` · ${s.d.fournisseur}`}` : '—'}</td>
                  <td class="montant">{s.d ? formatMontant(s.d.publicite) : '—'}</td>
                  <td class="montant">{et ? formatMontant(et.banque) : ''}</td>
                  <td class="montant">{et?.stockUnites ?? ''}</td>
                  <td class="montant">
                    <button class={s.d ? 'btn petit' : 'btn btn-principal petit'} onclick={() => (simulations.vue = { ecran: 'decisions', id, entrepriseId: s.x.id })}>{s.d ? 'Modifier' : 'Saisir'}</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
      <div class="ligne">
        <button class="btn" onclick={distribuer}>Distribuer les situations du tour {n} (fichiers)</button>
        <button class="btn" onclick={importerLesDecisions}>Importer des décisions…</button>
      </div>
      <p class="aide">
        Sans connexion, deux façons de recueillir les décisions : les saisir ici, ou distribuer à chaque groupe le fichier de sa
        situation et importer les fichiers de décisions qu'il vous renvoie. Les décisions importées sont contrôlées comme celles saisies ici.
      </p>
    {:else}
      <p class="info">Tous les tours ont été joués. Affichez les résultats finaux, puis exportez les exercices pour la comptabilité des élèves.</p>
    {/if}

    {#if p.tours.length > 0}
      <div class="ligne">
        <button class="btn" onclick={() => (simulations.vue = { ecran: 'projection', id })}>Afficher les résultats du tour {p.tours.length}</button>
        <button class="btn-lien" onclick={annuler}>Annuler le dernier tour</button>
        {#if r.niveau === 'AFP'}
          <button class="btn" onclick={() => imprimer(false)}>Imprimer les fiches de calcul du tour {p.tours.length}</button>
          <button class="btn" onclick={() => imprimer(true)}>Imprimer le corrigé</button>
        {/if}
      </div>

      <section class="carte">
        <header class="tete"><h2>Pièces et exercices</h2><span class="aide">Un exercice par entreprise, avec les pièces de tous les tours joués.</span></header>
        <div class="defile">
          <table>
            <thead><tr><th>Entreprise</th><th class="montant">Pièces</th><th class="montant">Résultat cumulé</th><th><span class="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {#each e.entreprises as x, i (x.id)}
                {@const fin = etats.get(x.id)}
                <tr class:zebre={i % 2 === 1}>
                  <td><b>{x.nom}</b></td>
                  <td class="montant">{p.tours.reduce((t, tour) => t + (tour.resultats.find((y) => y.entrepriseId === x.id)?.elements.length ?? 0), 0)}</td>
                  <td class="montant">{fin ? formatMontant(fin.resultatCumule) : ''}</td>
                  <td class="liens">
                    <button class="btn-lien" onclick={() => apercu(x.id)}>Aperçu</button>
                    {#if r.comptabilite !== 'automatique'}
                      <button class="btn-lien" onclick={() => exporterEx(x.id, 'eleves')}>Exporter pour les élèves</button>
                    {/if}
                    <button class="btn-lien" onclick={() => exporterEx(x.id, 'enseignant')}>Version enseignant</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        {#if r.comptabilite === 'mixte'}
          <p class="aide marge">
            Comptabilité mixte : les élèves saisissent les tours {(r.toursSaisis ?? []).join(', ')} ; les pièces des autres tours sont déjà au
            journal (mention « automatique »), ni corrigées ni modifiables. Distribuez l'exercice après chaque tour saisi : un élève
            qui ouvre la nouvelle version garde ses écritures.
          </p>
        {:else if r.comptabilite === 'eleves'}
          <p class="aide marge">Distribuez l'exercice après chaque tour : un élève qui ouvre la nouvelle version garde ses écritures.</p>
        {/if}
      </section>
    {/if}
  {/if}
</div>

<style>
  .partie { display: grid; gap: 18px; }
  .partie .titre { margin-bottom: 0; }
  .pastilles { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
  .badge { background: var(--c-selection); color: var(--c-structure); }
  .badge.fort { background: var(--c-structure); color: #fff; }
  .actions-haut, .ligne { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .kpi { padding: 14px 18px; }
  .kpi .l { font-size: 12px; color: var(--c-texte-2); text-transform: uppercase; letter-spacing: 0.05em; }
  .kpi .v { font-size: 21px; font-weight: bold; margin-top: 6px; }
  .kpi .d { font-size: 12px; margin-top: 4px; color: var(--c-texte-2); }
  .tete { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .aide { font-size: 12px; color: var(--c-texte-2); margin: 0; }
  .marge { margin: 12px 18px; }
  .defile { overflow-x: auto; }
  .statut { font-size: 12px; font-weight: bold; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
  .statut.ok { background: var(--c-ok-fond); color: var(--c-ok); }
  .statut.att { background: var(--c-alerte-fond); color: var(--c-alerte-texte); }
  .petit { padding: 5px 10px; font-size: 13px; }
  .imprevus ul { margin: 0 0 12px; padding-left: 18px; }
  .imprevus .ligne { flex-wrap: wrap; }
  .court-auto { width: auto; }
  .pourcent { width: 70px; }
  .liens { display: flex; gap: 14px; justify-content: flex-end; flex-wrap: wrap; }
  td { vertical-align: middle; }
  @media (max-width: 900px) { .kpis { grid-template-columns: 1fr 1fr; } }
</style>
