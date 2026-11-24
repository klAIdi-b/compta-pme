<!-- Simulateur en ligne, côté groupe : ouvert par le lien de l'enseignant ; code d'équipe, décisions, résultats. -->
<script lang="ts">
  import { simulationEleve } from '../../simulation-eleve.svelte';
  import { ClientSimulation, ErreurEnLigne } from '../../../io/simulation-en-ligne';
  import { normaliserCode, type ResultatsPublics, type SituationGroupe } from '../../../engine/simulation/situation';
  import type { Decisions } from '../../../engine/simulation/types';
  import { formatMontant } from '../../../engine/money';
  import { pourMille } from './libelles';
  import DecisionsGroupe from './DecisionsGroupe.svelte';

  const lien = simulationEleve.enLigne!;
  const client = new ClientSimulation(lien.config);
  let codeEquipe = $state('');
  let situation = $state<SituationGroupe | null>(null);
  let resultats = $state<ResultatsPublics | null>(null);
  let envoye = $state(false);
  let attente = $state('');
  let erreur = $state('');
  let occupe = $state(false);

  async function charger() {
    occupe = true;
    erreur = '';
    try {
      const r = await client.rejoindre(lien.codePartie, normaliserCode(codeEquipe));
      situation = r.situation;
      envoye = !!r.situation?.decisionsValidees;
      attente = r.situation ? '' : "La partie n'a pas encore commencé, ou elle est terminée. Réessayez dans un instant.";
      resultats = (await client.lireResultats(lien.codePartie, normaliserCode(codeEquipe))) as ResultatsPublics | null;
    } catch (e) {
      erreur = e instanceof ErreurEnLigne ? e.message : 'Le service en ligne ne répond pas. Réessayez dans un instant.';
    } finally {
      occupe = false;
    }
  }

  async function envoyer(d: Decisions) {
    if (!situation) return;
    occupe = true;
    erreur = '';
    try {
      await client.deposerDecisions(lien.codePartie, normaliserCode(codeEquipe), situation.numeroTour, d);
      situation = { ...situation, decisionsValidees: d };
      envoye = true;
    } catch (e) {
      erreur = e instanceof ErreurEnLigne ? e.message : "Les décisions n'ont pas pu être envoyées. Réessayez.";
    } finally {
      occupe = false;
    }
  }

  function rejoindre(ev: SubmitEvent) {
    ev.preventDefault();
    charger();
  }
</script>

<div class="page">
  <header class="bandeau-haut">
    <span class="logo">Compta PME</span>
    <span class="titre-espace">Simulateur d'entreprise · partie {lien.codePartie}</span>
    <button class="btn-lien" onclick={() => simulationEleve.fermer()}>Quitter</button>
  </header>
  <main class="contenu">
    {#if erreur}<div class="alerte" role="alert">{erreur}</div>{/if}

    {#if !situation && !attente}
      <form class="carte etroit" onsubmit={rejoindre}>
        <h2>Rejoindre la partie {lien.codePartie}</h2>
        <div class="corps-carte">
          <label class="bloc" for="code-equipe">Code de votre équipe</label>
          <input id="code-equipe" class="champ code" bind:value={codeEquipe} autocomplete="off" autocapitalize="characters" required />
          <p class="aide">Votre enseignant vous a remis ce code de 8 caractères. Ne le communiquez pas aux autres groupes.</p>
          <button class="btn btn-principal" type="submit" disabled={occupe}>Rejoindre</button>
        </div>
      </form>
    {:else if attente}
      <section class="carte etroit">
        <h2>En attente</h2>
        <div class="corps-carte">
          <p>{attente}</p>
          <button class="btn btn-principal" onclick={charger} disabled={occupe}>Actualiser</button>
        </div>
      </section>
    {:else if situation && envoye}
      <section class="carte">
        <h2>Décisions envoyées pour le tour {situation.numeroTour}</h2>
        <div class="corps-carte">
          <p>Votre enseignant les recevra automatiquement. Vous pouvez encore les modifier tant que le tour n'est pas calculé.</p>
          <div class="ligne">
            <button class="btn" onclick={() => (envoye = false)}>Modifier les décisions</button>
            <button class="btn btn-principal" onclick={charger} disabled={occupe}>Actualiser (tour suivant)</button>
          </div>
        </div>
      </section>
    {:else if situation}
      {#key `${situation.numeroTour}`}
        <DecisionsGroupe {situation} onValider={envoyer} libelleValider="Envoyer nos décisions" />
      {/key}
    {/if}

    {#if resultats && resultats.lignes.length}
      <section class="carte">
        <h2>Résultats du tour {resultats.numeroTour}</h2>
        <table>
          <thead>
            <tr>
              {#if resultats.lignes[0]?.rang !== undefined}<th>Rang</th>{/if}
              <th>Entreprise</th><th class="montant">Résultat cumulé</th><th class="montant">Trésorerie</th><th class="montant">Part de marché</th>
            </tr>
          </thead>
          <tbody>
            {#each resultats.lignes as l, i}
              <tr class:zebre={i % 2 === 1}>
                {#if l.rang !== undefined}<td class="num">{l.rang}</td>{/if}
                <td>{l.nom}</td>
                <td class="montant">{formatMontant(l.resultatCumule)}</td>
                <td class="montant">{formatMontant(l.tresorerie)}</td>
                <td class="montant">{pourMille(l.partMarchePourMille)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </section>
    {/if}
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .bandeau-haut { background: #fff; border-bottom: 1px solid var(--c-bordure-2); padding: 0 28px; height: 60px; display: flex; align-items: center; gap: 18px; }
  .logo { color: var(--c-texte); font-weight: bold; font-size: var(--t-15); display: flex; align-items: center; gap: 10px; }
  .logo::before { content: 'CP'; width: 28px; height: 28px; border-radius: var(--r-2); background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: var(--t-12); }
  .titre-espace { color: var(--c-texte-2); flex: 1; }
  .contenu { max-width: 1200px; margin: 0 auto; padding: 24px 16px; display: grid; gap: 18px; }
  .etroit { max-width: 480px; }
  .code { font-size: var(--t-20); letter-spacing: 0.15em; text-transform: uppercase; }
  .aide { font-size: var(--t-12); color: var(--c-texte-2); }
  .ligne { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
  .corps-carte .btn-principal { margin-top: 8px; }
</style>
