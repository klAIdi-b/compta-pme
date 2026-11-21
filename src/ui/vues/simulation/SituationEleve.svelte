<!-- Simulateur, côté groupe : décisions à partir du fichier de situation remis par l'enseignant (phase S5, sans connexion). -->
<script lang="ts">
  import { simulationEleve } from '../../simulation-eleve.svelte';
  import { EXT_DECISIONS, exporterDecisions } from '../../../io/simulation';
  import { nomFichier } from '../../../io/fichiers';
  import { telecharger } from '../../fichiers-navigateur';
  import type { Decisions } from '../../../engine/simulation/types';
  import DecisionsGroupe from './DecisionsGroupe.svelte';

  const sit = $derived(simulationEleve.situation!);

  function enregistrer(d: Decisions) {
    const nom = nomFichier([sit.entreprise.nom, `tour-${sit.numeroTour}`, 'decisions'], EXT_DECISIONS);
    telecharger(nom, exporterDecisions({ partieId: sit.partieId, numeroTour: sit.numeroTour, entrepriseId: sit.entreprise.id, decisions: d }));
    simulationEleve.fichierEnregistre = nom;
  }
</script>

<div class="page">
  <header class="bandeau-haut">
    <span class="logo">Compta PME</span>
    <span class="titre-espace">Simulateur d'entreprise · {sit.partieNom}</span>
    <button class="btn-lien" onclick={() => simulationEleve.fermer()}>Fermer</button>
  </header>
  <main class="contenu">
    {#if simulationEleve.fichierEnregistre}
      <section class="carte">
        <h2>Décisions enregistrées</h2>
        <div class="corps-carte">
          <p>
            Le fichier <b>{simulationEleve.fichierEnregistre}</b> se trouve dans vos téléchargements. Remettez-le à votre enseignant
            (messagerie de l'école, clé USB ou dépôt de fichiers) : il l'importera avant de calculer le tour.
          </p>
          <div class="ligne">
            <button class="btn" onclick={() => (simulationEleve.fichierEnregistre = null)}>Modifier les décisions</button>
            <button class="btn btn-principal" onclick={() => simulationEleve.fermer()}>Terminer</button>
          </div>
        </div>
      </section>
    {:else}
      {#key sit}
        <DecisionsGroupe situation={sit} onValider={enregistrer} libelleValider="Valider et enregistrer le fichier de décisions" />
      {/key}
    {/if}
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .bandeau-haut { background: #fff; border-bottom: 1px solid var(--c-bordure-2); padding: 0 28px; height: 60px; display: flex; align-items: center; gap: 18px; }
  .logo { color: var(--c-texte); font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 10px; }
  .logo::before { content: 'CP'; width: 28px; height: 28px; border-radius: 7px; background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: 12px; }
  .titre-espace { color: var(--c-texte-2); flex: 1; }
  .contenu { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
  .ligne { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
</style>
