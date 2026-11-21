<script lang="ts">
  import { etat } from '../etat.svelte';
  import { operationsSaisies } from '../../engine/exercice';
  import { balance } from '../../engine/ledger';
  import { dt } from '../format';
  import { corrigerCopie } from '../../engine/notation';
  import { vueEleve } from '../modes';

  const s = $derived(etat.session!);
  const saisies = $derived(operationsSaisies(s.dossier).size);
  const paragraphes = $derived(
    (s.exercice.situation ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
  );

  /** Évaluation formative : correction à la fin, note indicative (barème de l'exercice). */
  const formative = $derived(s.exercice.mode === 'formative' && vueEleve(etat.genre) && (s.exercice.corrige?.length ?? 0) > 0);
  const resultat = $derived(formative && s.formativeTerminee ? corrigerCopie(s.exercice, s.dossier) : null);
  const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  function terminer() {
    if (!confirm("Terminer l'évaluation formative ?\n\nLa saisie sera fermée et la correction s'affichera. Vous ne pourrez plus modifier vos écritures.")) return;
    s.formativeTerminee = true;
  }

  function recommencer() {
    if (confirm("Recommencer l'exercice ? Toutes vos écritures seront effacées.")) etat.recommencer();
  }
  // L'accueil s'ouvre par-dessus le travail en cours : rien n'est effacé tant qu'un autre exercice n'est pas commencé.
  function quitter() {
    etat.allerAccueil();
  }
</script>

<div class="titre"><h1>Tableau de bord</h1></div>

{#if paragraphes.length}
  <section class="carte situation">
    <h2>Votre situation</h2>
    <div class="corps-carte">
      {#each paragraphes as p}<p>{p}</p>{/each}
    </div>
  </section>
{/if}

{#if formative}
  <section class="carte formative">
    <h2>Évaluation formative</h2>
    <div class="corps-carte">
      {#if resultat}
        <p class="note">Note indicative : <b>{resultat.note.toFixed(1)}</b> <span class="discret">({fmt(resultat.points)} / {fmt(resultat.max)} points)</span></p>
        <p>
          {resultat.operations.filter((o) => o.diagnostic === 'juste').length} opération{resultat.operations.filter((o) => o.diagnostic === 'juste').length > 1 ? 's' : ''}
          juste{resultat.operations.filter((o) => o.diagnostic === 'juste').length > 1 ? 's' : ''} sur {resultat.operations.length}.
          Cette note n'est pas transmise : elle vous aide à savoir où vous en êtes.
        </p>
        <div class="actions"><button class="btn btn-principal" onclick={() => etat.aller('journal')}>Voir la correction dans le journal</button></div>
      {:else}
        <p>Aucun retour n'est donné pendant la saisie. Quand vous avez terminé, cliquez sur « Terminer » : vous verrez ce qui est juste ou à revoir, les solutions et une note indicative.</p>
        <div class="actions"><button class="btn btn-principal" onclick={terminer}>Terminer et voir la correction</button></div>
      {/if}
    </div>
  </section>
{/if}

<section class="carte">
  <h2>{s.exercice.titre}</h2>
  <div class="corps-carte">
    {#if s.dossier.debut === s.exercice.debut}
      <p>{s.exercice.introduction}</p>
      <p>
        <b>{saisies}</b> opération{saisies > 1 ? 's' : ''} sur {s.exercice.operations.length} saisie{saisies > 1 ? 's' : ''}
        · balance {balance(s.dossier).equilibree ? 'équilibrée' : 'non équilibrée'}.
      </p>
    {:else}
      <p>
        L'exercice {dt(s.exercice.debut).slice(6)} est bouclé et archivé. Vous travaillez sur l'exercice suivant
        ({dt(s.dossier.debut)} – {dt(s.dossier.fin)}), ouvert avec le bilan de clôture. L'énoncé ne contient pas
        d'opération pour cet exercice.
      </p>
    {/if}
    <div class="actions">
      <button class="btn btn-principal" onclick={() => etat.commencerSaisie()}>
        {s.dossier.ecritures.some((e) => !e.automatique) ? 'Continuer la saisie' : 'Commencer la saisie'}
      </button>
      <button class="btn" onclick={() => (etat.visiteOuverte = true)}>Revoir la visite guidée</button>
      <button class="btn" onclick={recommencer}>Recommencer l'exercice</button>
      {#if etat.genre === 'travail'}<button class="btn" onclick={quitter}>Changer d'exercice</button>{/if}
    </div>
  </div>
</section>

<style>
  .situation p { max-width: 75ch; line-height: 1.5; margin: 0 0 10px; white-space: pre-line; }
  .situation p:last-child { margin-bottom: 0; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .formative { border-left: 4px solid var(--c-structure); margin-bottom: 16px; }
  .formative p { margin: 0 0 8px; }
  .note { font-size: 18px; }
</style>
