<!--
  Écran chargé à la demande (théorie, guide, espace enseignant) : le premier chargement du logiciel reste léger pour les
  élèves. Hors ligne, le service worker a déjà ces fichiers en cache : le chargement est immédiat.
-->
<script lang="ts" generics="P extends Record<string, unknown>">
  import type { Component } from 'svelte';

  let { charger, props }: { charger: () => Promise<{ default: Component<P> }>; props: P } = $props();
  // svelte-ignore state_referenced_locally
  const module = charger();
</script>

{#await module}
  <p class="vide" role="status">Chargement…</p>
{:then m}
  <m.default {...props} />
{:catch}
  <div class="alerte" role="alert">
    Cette partie du logiciel n'a pas pu être chargée. Vérifiez la connexion, puis rechargez la page (touche F5).
  </div>
{/await}
