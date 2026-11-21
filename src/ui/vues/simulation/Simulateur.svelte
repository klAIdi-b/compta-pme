<!-- Espace enseignant, onglet « Simulateur » : liste des parties et aiguillage vers les écrans (maquette S2 validée). -->
<script lang="ts">
  import { simulations } from '../../simulation.svelte';
  import { EXT_SIMULATION, exporterPartie, importerPartie } from '../../../io/simulation';
  import { ErreurFichier, nomFichier } from '../../../io/fichiers';
  import { choisirFichiers, telecharger } from '../../fichiers-navigateur';
  import { dateHeure } from '../../format';
  import { LIBELLE_NIVEAU } from './libelles';
  import CreationPartie from './CreationPartie.svelte';
  import TableauPartie from './TableauPartie.svelte';
  import DecisionsGroupe from './DecisionsGroupe.svelte';
  import ProjectionResultats from './ProjectionResultats.svelte';

  let message = $state('');

  async function importer() {
    message = '';
    const [f] = await choisirFichiers(`${EXT_SIMULATION},.json`);
    if (!f) return;
    try {
      const e = importerPartie(f.texte);
      const existe = simulations.trouver(e.id);
      if (existe && !confirm(`La partie « ${e.nom} » existe déjà dans ce navigateur. La remplacer par celle du fichier ?`)) return;
      simulations.ajouter(e);
      message = `Partie « ${e.nom} » importée.`;
    } catch (err) {
      message = err instanceof ErreurFichier ? err.message : "Le fichier n'a pas pu être lu.";
    }
  }

  function exporter(id: string) {
    const e = simulations.trouver(id);
    if (!e) return;
    telecharger(nomFichier(['simulation', e.nom], EXT_SIMULATION), exporterPartie($state.snapshot(e) as typeof e));
  }

  function supprimer(id: string) {
    const e = simulations.trouver(id);
    if (e && confirm(`Supprimer la partie « ${e.nom} » de ce navigateur ? Exportez-la d'abord si vous voulez la garder.`)) {
      simulations.supprimer(id);
    }
  }
</script>

{#if simulations.vue.ecran === 'creation'}
  <CreationPartie />
{:else if simulations.vue.ecran === 'partie' && simulations.trouver(simulations.vue.id)}
  {#key simulations.vue.id}<TableauPartie id={simulations.vue.id} />{/key}
{:else if simulations.vue.ecran === 'decisions' && simulations.trouver(simulations.vue.id)}
  {#key `${simulations.vue.id}:${simulations.vue.entrepriseId}`}
    <DecisionsGroupe id={simulations.vue.id} entrepriseId={simulations.vue.entrepriseId} />
  {/key}
{:else if simulations.vue.ecran === 'projection' && simulations.trouver(simulations.vue.id)}
  <ProjectionResultats id={simulations.vue.id} />
{:else}
  <div class="barre">
    <button class="btn btn-principal" onclick={() => (simulations.vue = { ecran: 'creation' })}>Nouvelle partie</button>
    <button class="btn" onclick={importer}>Importer une partie…</button>
  </div>
  {#if message}<p class="info" role="status">{message}</p>{/if}
  <section class="carte">
    {#if simulations.parties.length === 0}
      <p class="vide">
        Aucune partie pour l'instant. Une partie met plusieurs groupes en concurrence sur un même marché : à chaque tour,
        vous saisissez leurs décisions, le simulateur calcule les ventes et produit les pièces comptables.
      </p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Partie</th>
            <th style="width:130px">Niveau</th>
            <th style="width:120px">Avancement</th>
            <th style="width:280px"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {#each simulations.parties as e, i (e.id)}
            <tr class:zebre={i % 2 === 1}>
              <td>
                <b>{e.nom}</b><br />
                <span class="discret petit">{e.reglages.secteur.nom} · {e.entreprises.length} entreprises · créée le {dateHeure(e.creeLe)}</span>
              </td>
              <td>{LIBELLE_NIVEAU[e.reglages.niveau]}</td>
              <td class="num">
                {e.decisionsParTour.length >= e.reglages.nbTours ? 'Terminée' : `Tour ${e.decisionsParTour.length + 1} sur ${e.reglages.nbTours}`}
              </td>
              <td class="actions">
                <button class="btn-lien" onclick={() => (simulations.vue = { ecran: 'partie', id: e.id })}>Ouvrir</button>
                <button class="btn-lien" onclick={() => exporter(e.id)}>Exporter</button>
                <button class="btn-lien" onclick={() => supprimer(e.id)}>Supprimer</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>
  <p class="discret petit aide">
    Les parties ne sont enregistrées que dans ce navigateur. « Exporter » crée un fichier pour les reprendre sur un autre
    poste ou les conserver. Aucune donnée n'est envoyée en ligne.
  </p>
{/if}

<style>
  .barre { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .actions { display: flex; gap: 14px; justify-content: flex-end; flex-wrap: wrap; }
  .petit { font-size: 12px; }
  .aide { margin-top: 10px; }
  .info { margin: 0 0 14px; }
</style>
