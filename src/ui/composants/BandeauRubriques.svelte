<!--
  Bandeau de l'accueil et du Cours. Phase V1 de VISION_LOGICIEL.md (maquette public/maquettes/comptabilite-cours.html,
  validée le 27.11.2026) : trois espaces, Accueil · Comptabilité · Cours, puis le guide et l'espace enseignant ; sous
  l'espace choisi, ses rubriques (Comptabilité : Mes dossiers, Exercices, Évaluation ; Cours : Apprendre, Théorie).
  Sur téléphone, les espaces passent sur une seconde ligne, sans menu caché.
-->
<script lang="ts">
  import { espaceDe, etat, type Espace, type Rubrique } from '../etat.svelte';
  import { enseignant } from '../enseignant.svelte';

  let { actif, fermer }: { actif: Rubrique; fermer?: () => void } = $props();

  const ESPACES: { id: Espace; libelle: string; rubrique: Rubrique }[] = [
    { id: 'accueil', libelle: 'Accueil', rubrique: 'accueil' },
    { id: 'comptabilite', libelle: 'Comptabilité', rubrique: 'dossiers' },
    { id: 'cours', libelle: 'Cours', rubrique: 'apprendre' },
  ];
  const RUBRIQUES: Record<Espace, { id: Rubrique; libelle: string }[]> = {
    accueil: [],
    comptabilite: [
      { id: 'dossiers', libelle: 'Mes dossiers' },
      { id: 'exercices', libelle: 'Exercices' },
      { id: 'evaluation', libelle: 'Évaluation' },
    ],
    cours: [
      { id: 'apprendre', libelle: 'Apprendre' },
      { id: 'theorie', libelle: 'Théorie' },
    ],
  };
  const espace = $derived(espaceDe(actif));

  function ouvrirEnseignant() {
    etat.apprendre = false;
    enseignant.ouvert = true;
  }
</script>

<header class="bandeau">
  <div class="ligne">
    <button class="logo" title="Retour à la page d'accueil" onclick={() => etat.ouvrirRubrique('accueil')}>Compta PME</button>
    <nav class="espaces" aria-label="Espaces">
      {#each ESPACES as e (e.id)}
        <button class:actif={espace === e.id} class:vers-accueil={e.id === 'accueil'} aria-current={espace === e.id ? 'page' : undefined} onclick={() => etat.ouvrirRubrique(e.rubrique)}>{e.libelle}</button>
      {/each}
    </nav>
    <nav class="liens" aria-label="Liens utiles">
      <button class="lien guide" onclick={() => (etat.guide = 'eleve')}>Guide d'utilisation</button>
      <button class="lien" onclick={ouvrirEnseignant}>Espace enseignant</button>
      {#if fermer}<button class="lien fermer" onclick={fermer}>Fermer</button>{/if}
    </nav>
  </div>
  {#if RUBRIQUES[espace].length}
    <nav class="rubriques" aria-label="Rubriques">
      {#each RUBRIQUES[espace] as r (r.id)}
        <button class:actif={actif === r.id} aria-current={actif === r.id ? 'page' : undefined} onclick={() => etat.ouvrirRubrique(r.id)}>{r.libelle}</button>
      {/each}
    </nav>
  {/if}
</header>

<style>
  .bandeau { position: sticky; top: 0; z-index: 10; background: var(--c-fond); border-bottom: 1px solid var(--c-bordure-2); }
  .ligne { padding: 0 var(--e-5); min-height: 64px; display: flex; align-items: stretch; gap: var(--e-5); }
  .logo {
    font: inherit; border: 0; background: none; padding: 0; cursor: pointer; color: var(--c-encre); font-weight: 700; font-size: var(--t-17);
    display: flex; align-items: center; gap: 10px; letter-spacing: -0.01em; flex: none;
  }
  .logo::before { content: 'CP'; width: 32px; height: 32px; border-radius: var(--r-3); background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: var(--t-13); }
  .espaces { display: flex; align-items: stretch; gap: var(--e-1); min-width: 0; }
  .espaces button, .rubriques button {
    font: inherit; font-weight: var(--graisse-moyen); border: 0; background: none; color: var(--c-texte-2); cursor: pointer;
    padding: 0 var(--e-4); border-bottom: 3px solid transparent; margin-bottom: -1px; white-space: nowrap; transition: color 0.12s, background-color 0.12s;
  }
  .espaces button:hover, .rubriques button:hover { color: var(--c-structure); background: var(--c-fond-tete); }
  .espaces button.actif { color: var(--c-encre); border-bottom-color: var(--c-accent); font-weight: var(--graisse-fort); }
  /* Rubriques de l'espace : une ligne plus discrète sous les espaces. */
  .rubriques { display: flex; gap: var(--e-1); padding: 0 var(--e-5); border-top: 1px solid var(--c-bordure-3); background: var(--c-fond-tete); overflow-x: auto; scrollbar-width: none; }
  .rubriques button { min-height: var(--h-cible); font-size: var(--t-14); }
  .rubriques button.actif { color: var(--c-structure); border-bottom-color: var(--c-structure); font-weight: var(--graisse-fort); }
  .liens { margin-left: auto; display: flex; align-items: center; gap: var(--e-1); flex: none; }
  .lien {
    font: inherit; font-weight: 600; font-size: var(--t-14); border: 0; background: none; color: var(--c-structure); padding: 0 var(--e-3);
    min-height: var(--h-cible); border-radius: var(--r-2); cursor: pointer; white-space: nowrap;
  }
  .lien:hover { background: var(--c-bleu-doux); }
  .lien.fermer { text-decoration: underline; text-underline-offset: 3px; }
  /* Téléphone et petite tablette : les espaces sur une seconde ligne. */
  @media (max-width: 860px) {
    .ligne { flex-wrap: wrap; padding: 0 var(--e-3); gap: 0 var(--e-3); min-height: 0; }
    .logo { min-height: 52px; }
    .liens { min-height: 52px; }
    .espaces { order: 3; flex: 1 1 100%; margin: 0 calc(-1 * var(--e-3)); padding: 0 var(--e-2); border-top: 1px solid var(--c-bordure-3); }
    .espaces button { min-height: 44px; padding: 0 var(--e-3); flex: 1 0 auto; }
    .rubriques { padding: 0 var(--e-2); }
    .rubriques button { min-height: 44px; padding: 0 var(--e-3); flex: 1 0 auto; }
  }
  @media (max-width: 420px) {
    .lien.guide { display: none; }
    .rubriques button { padding: 0 var(--e-2); }
  }
  @media (prefers-reduced-motion: reduce) { .espaces button, .rubriques button { transition: none; } }
</style>
