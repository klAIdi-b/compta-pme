<!--
  Bandeau de l'accueil et du parcours Apprendre (demande de l'enseignant du 24.11.2026) : le nom du site, cinq
  onglets toujours visibles (Accueil, Apprendre, Théorie, Exercices, Évaluation), puis le guide et l'espace enseignant.
  Sur téléphone, les onglets passent sur une seconde ligne qui défile, sans menu caché.
-->
<script lang="ts">
  import { etat, type Rubrique } from '../etat.svelte';
  import { enseignant } from '../enseignant.svelte';

  let { actif, fermer }: { actif: Rubrique; fermer?: () => void } = $props();

  const RUBRIQUES: { id: Rubrique; libelle: string }[] = [
    { id: 'accueil', libelle: 'Accueil' },
    { id: 'apprendre', libelle: 'Apprendre' },
    { id: 'theorie', libelle: 'Théorie' },
    { id: 'exercices', libelle: 'Exercices' },
    { id: 'evaluation', libelle: 'Évaluation' },
  ];

  function ouvrirEnseignant() {
    etat.apprendre = false;
    enseignant.ouvert = true;
  }
</script>

<header class="bandeau">
  <button class="logo" title="Retour à la page d'accueil" onclick={() => etat.ouvrirRubrique('accueil')}>Compta PME</button>
  <nav class="rubriques" aria-label="Rubriques">
    {#each RUBRIQUES as r (r.id)}
      <button class:actif={actif === r.id} class:vers-accueil={r.id === 'accueil'} aria-current={actif === r.id ? 'page' : undefined} onclick={() => etat.ouvrirRubrique(r.id)}>{r.libelle}</button>
    {/each}
  </nav>
  <nav class="liens" aria-label="Liens utiles">
    <button class="lien guide" onclick={() => (etat.guide = 'eleve')}>Guide d'utilisation</button>
    <button class="lien" onclick={ouvrirEnseignant}>Espace enseignant</button>
    {#if fermer}<button class="lien fermer" onclick={fermer}>Fermer</button>{/if}
  </nav>
</header>

<style>
  .bandeau {
    position: sticky; top: 0; z-index: 10; background: var(--c-fond); border-bottom: 1px solid var(--c-bordure-2);
    padding: 0 var(--e-5); min-height: 64px; display: flex; align-items: stretch; gap: var(--e-5);
  }
  .logo {
    font: inherit; border: 0; background: none; padding: 0; cursor: pointer; color: var(--c-encre); font-weight: 700; font-size: var(--t-17);
    display: flex; align-items: center; gap: 10px; letter-spacing: -0.01em; flex: none;
  }
  .logo::before { content: 'CP'; width: 32px; height: 32px; border-radius: var(--r-3); background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: var(--t-13); }
  .rubriques { display: flex; align-items: stretch; gap: var(--e-1); min-width: 0; }
  .rubriques button {
    font: inherit; font-weight: var(--graisse-moyen); border: 0; background: none; color: var(--c-texte-2); cursor: pointer;
    padding: 0 var(--e-4); border-bottom: 3px solid transparent; margin-bottom: -1px; white-space: nowrap; transition: color 0.12s, background-color 0.12s;
  }
  .rubriques button:hover { color: var(--c-structure); background: var(--c-fond-tete); }
  .rubriques button.actif { color: var(--c-structure); border-bottom-color: var(--c-structure); font-weight: var(--graisse-fort); }
  .liens { margin-left: auto; display: flex; align-items: center; gap: var(--e-1); flex: none; }
  .lien {
    font: inherit; font-weight: 600; font-size: var(--t-14); border: 0; background: none; color: var(--c-structure); padding: 0 var(--e-3);
    min-height: var(--h-cible); border-radius: var(--r-2); cursor: pointer; white-space: nowrap;
  }
  .lien:hover { background: var(--c-bleu-doux); }
  .lien.fermer { text-decoration: underline; text-underline-offset: 3px; }
  /* Téléphone et petite tablette : les onglets sur une seconde ligne, qui défile si elle ne tient pas. */
  @media (max-width: 860px) {
    .bandeau { flex-wrap: wrap; padding: 0 var(--e-3); gap: 0 var(--e-3); min-height: 0; }
    .logo { min-height: 52px; }
    .liens { min-height: 52px; }
    .rubriques { order: 3; flex: 1 1 100%; overflow-x: auto; margin: 0 calc(-1 * var(--e-3)); padding: 0 var(--e-2); border-top: 1px solid var(--c-bordure-3); scrollbar-width: none; }
    .rubriques button { min-height: 44px; padding: 0 var(--e-3); flex: 1 0 auto; }
  }
  @media (max-width: 420px) {
    .lien.guide { display: none; }
    /* Sur un petit téléphone, le nom du site tient lieu d'onglet « Accueil » : les quatre autres tiennent sur la ligne. */
    .rubriques button.vers-accueil { display: none; }
    .rubriques { padding: 0; }
    .rubriques button { padding: 0 var(--e-2); font-size: var(--t-14); }
  }
  @media (prefers-reduced-motion: reduce) { .rubriques button { transition: none; } }
</style>
