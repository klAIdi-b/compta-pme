<!-- Barre d'avancement : justes (vert), justes avec la solution (vert hachuré), à revoir (orange), incomplètes ou saisies
     sans correction (gris-bleu). -->
<script lang="ts">
  import type { Avancement } from '../../engine/correction';

  let { a, correction, largeur = 160, sombre = false }: { a: Avancement; correction: boolean; largeur?: number; sombre?: boolean } = $props();
  const pc = (n: number) => (a.total ? (n / a.total) * 100 : 0);
  const description = $derived(
    correction
      ? `${a.saisies} pièces saisies sur ${a.total} : ${a.justes} justes${a.avecSolution ? ` (dont ${a.avecSolution} avec la solution)` : ''}, ${a.aRevoir} à revoir, ${a.incompletes} incomplètes`
      : `${a.saisies} pièces saisies sur ${a.total}`,
  );
</script>

<span class="barre" class:sombre style={`width:${largeur}px`} role="img" aria-label={description} title={description}>
  {#if correction}
    <span class="juste" style={`width:${pc(a.justes - a.avecSolution)}%`}></span>
    <span class="juste-solution" style={`width:${pc(a.avecSolution)}%`}></span>
    <span class="revoir" style={`width:${pc(a.aRevoir)}%`}></span>
    <span class="saisie" style={`width:${pc(a.incompletes)}%`}></span>
  {:else}
    <span class="neutre" style={`width:${pc(a.saisies)}%`}></span>
  {/if}
</span>

<style>
  .barre { display: inline-flex; height: 10px; border-radius: var(--r-1); overflow: hidden; background: var(--c-bordure-2); vertical-align: middle; }
  .barre.sombre { background: rgba(255, 255, 255, 0.28); }
  .juste { background: var(--c-ok); }
  .juste-solution { background: repeating-linear-gradient(135deg, var(--c-ok) 0 3px, #b7d8c2 3px 6px); }
  .revoir { background: var(--c-accent); }
  .saisie { background: #8fa9c4; }
  .neutre { background: #8fa9c4; }
  .sombre .neutre { background: var(--c-selection); }
</style>
