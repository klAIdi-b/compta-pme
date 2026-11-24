<!-- Boîte de dialogue du logiciel : confirmation ou message. Élément <dialog> natif : focus retenu dans la boîte,
     Échap annule, le focus revient ensuite où il était. Voir src/ui/dialogue.svelte.ts. -->
<script lang="ts">
  import { dialogue } from '../dialogue.svelte';

  let boite = $state<HTMLDialogElement | null>(null);
  const d = $derived(dialogue.courante);

  $effect(() => {
    if (!boite) return;
    if (d && !boite.open) {
      boite.showModal();
      // Action qui efface : le focus va sur « Annuler », pour qu'Entrée ne supprime rien par mégarde.
      boite.querySelector<HTMLElement>(d.danger ? '[data-annuler]' : '[data-confirmer]')?.focus();
    } else if (!d && boite.open) boite.close();
  });
</script>

<dialog
  bind:this={boite}
  aria-labelledby="dialogue-titre"
  aria-describedby={d?.texte?.length ? 'dialogue-texte' : undefined}
  oncancel={(e) => {
    e.preventDefault();
    dialogue.repondre(false);
  }}
>
  {#if d}
    <h2 id="dialogue-titre">{d.titre}</h2>
    {#if d.texte?.length}
      <div id="dialogue-texte">{#each d.texte as t}<p>{t}</p>{/each}</div>
    {/if}
    <div class="actions">
      {#if !d.information}
        <button class="btn" data-annuler onclick={() => dialogue.repondre(false)}>{d.annuler ?? 'Annuler'}</button>
      {/if}
      <button class="btn" class:btn-principal={!d.danger} class:danger={d.danger} data-confirmer onclick={() => dialogue.repondre(true)}>
        {d.confirmer ?? 'Confirmer'}
      </button>
    </div>
  {/if}
</dialog>

<style>
  dialog {
    width: min(460px, calc(100vw - 32px)); padding: var(--e-5); border: 1px solid var(--c-bordure-2); border-radius: var(--r-3);
    background: var(--c-fond); color: var(--c-texte); box-shadow: var(--ombre-haute);
  }
  dialog::backdrop { background: rgba(15, 30, 45, 0.45); }
  h2 { font-size: var(--t-17); margin-bottom: var(--e-2); }
  p { margin: 0 0 var(--e-2); color: var(--c-texte); }
  .actions { display: flex; justify-content: flex-end; gap: var(--e-2); margin-top: var(--e-4); flex-wrap: wrap; }
  .danger { background: var(--c-erreur); border-color: var(--c-erreur); color: #fff; }
  .danger:hover { background: #8c0019; border-color: #8c0019; }
  @media (max-width: 480px) { .actions { flex-direction: column-reverse; } .actions .btn { width: 100%; justify-content: center; } }
</style>
