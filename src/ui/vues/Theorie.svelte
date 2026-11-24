<!-- Théorie : sommaire des chapitres du niveau de l'exercice, puis lecture d'un chapitre. Ouverte depuis l'onglet du
     bandeau (`libre`), elle n'a pas d'exercice : l'élève choisit l'année, et les comptes viennent du plan du cours. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { CHAPITRES, chapitresDuNiveau, THEORIE_VALIDEE } from '../../data/theorie';
  import { etiquetteNiveau } from '../../engine/exercice';
  import ChapitreTheorie from '../composants/ChapitreTheorie.svelte';
  import { plan } from '../../data/plan';
  import { LIBELLES_ANNEE } from '../../engine/exercice';
  import type { Niveau } from '../../engine/plan';

  let { libre = false }: { libre?: boolean } = $props();
  const NIVEAUX: Niveau[] = ['CFC1', 'CFC2', 'MP'];
  /** Année choisie quand la théorie est ouverte sans exercice (la maturité si l'élève a choisi cette formation). */
  /** Arrivée par un lien vers un chapitre : l'année est au moins celle de ce chapitre. */
  function anneeDeDepart(): Niveau {
    const defaut: Niveau = etat.prefs.filiere === 'MP' ? 'MP' : 'CFC1';
    const cible = CHAPITRES.find((c) => c.id === etat.chapitreCible)?.niveau ?? defaut;
    return NIVEAUX.indexOf(cible) > NIVEAUX.indexOf(defaut) ? cible : defaut;
  }
  let niveauLibre = $state<Niveau>(anneeDeDepart());
  const niveau = $derived(libre ? niveauLibre : etat.exercice.niveau);

  const chapitres = $derived(chapitresDuNiveau(niveau));
  const intitules = $derived(new Map((libre ? plan : etat.dossier.plan).map((c) => [c.numero, c.intitule])));
  let choisi = $state<string | null>(etat.chapitreCible);
  etat.chapitreCible = null;
  const chapitre = $derived(chapitres.find((c) => c.id === choisi) ?? null);
  const rang = $derived(chapitre ? chapitres.indexOf(chapitre) : -1);

  function ouvrir(id: string | null) {
    choisi = id;
    document.querySelector('main')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }
</script>

<div class="titre">
  <h1>Théorie</h1>
  <span class="sous">Rappels de cours{libre ? '' : ` · ${etiquetteNiveau(etat.exercice)}`}</span>
</div>

{#if libre}
  <div class="choix-annee">
    <span class="discret" id="libelle-annee">Votre année</span>
    <div class="segments" role="group" aria-labelledby="libelle-annee">
      {#each NIVEAUX as n (n)}
        <button type="button" aria-pressed={niveauLibre === n} onclick={() => { niveauLibre = n; choisi = null; }}>{LIBELLES_ANNEE[n]}</button>
      {/each}
    </div>
    <span class="discret petit">Chaque année reprend les chapitres des précédentes.</span>
  </div>
{/if}

{#if !THEORIE_VALIDEE}
  <p class="discret petit avis">Contenu proposé, en cours de relecture par l'enseignant.</p>
{/if}

{#if !chapitre}
  <section class="carte">
    <h2>Sommaire</h2>
    <ol class="sommaire">
      {#each chapitres as c}
        <li>
          <button class="lien-chapitre" onclick={() => ouvrir(c.id)}>{c.titre}</button>{#if c.aRelire} <span class="a-relire">À relire</span>{/if}
          <span class="discret">{c.resume}</span>
        </li>
      {/each}
    </ol>
  </section>
{:else}
  <nav class="fil" aria-label="Chapitres">
    <button class="btn-lien" onclick={() => ouvrir(null)}>Sommaire</button>
    <span class="discret">Chapitre {rang + 1} sur {chapitres.length}</span>
  </nav>

  <article class="carte chapitre">
    <h2>{chapitre.titre}{#if chapitre.aRelire} <span class="a-relire">À relire</span>{/if}</h2>
    <div class="corps-carte">
      <p class="resume">{chapitre.resume}</p>
      {#if chapitre.objectifs?.length}
        <div class="objectifs">
          <p><b>À la fin de ce chapitre, vous savez :</b></p>
          <ul>{#each chapitre.objectifs as o}<li>{o}</li>{/each}</ul>
        </div>
        <nav class="plan" aria-label="Plan du chapitre">
          <ol>{#each chapitre.sections as sec}<li>{sec.titre}</li>{/each}</ol>
        </nav>
      {/if}
      <ChapitreTheorie {chapitre} {intitules} />
      {#if chapitre.bases?.length}
        <h3>Bases légales</h3>
        <ul class="bases">{#each chapitre.bases as base}<li>{base}</li>{/each}</ul>
      {/if}
    </div>
  </article>

  <div class="suivants">
    {#if rang > 0}
      <button class="btn" onclick={() => ouvrir(chapitres[rang - 1]!.id)}>Chapitre précédent : {chapitres[rang - 1]!.titre}</button>
    {/if}
    {#if rang < chapitres.length - 1}
      <button class="btn" onclick={() => ouvrir(chapitres[rang + 1]!.id)}>Chapitre suivant : {chapitres[rang + 1]!.titre}</button>
    {/if}
  </div>
{/if}

<style>
  .a-relire { display: inline-block; font-size: var(--t-12); font-weight: var(--graisse-fort); color: var(--c-avert); background: var(--c-avert-fond); border: 1px solid var(--c-avert-trait); border-radius: var(--r-1); padding: 0 8px; vertical-align: middle; }
  .objectifs { margin: 0 0 12px; }
  .objectifs p { margin: 0 0 4px; }
  .objectifs ul { margin: 0; padding-left: 20px; }
  .plan { background: var(--c-fond-tete); border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); padding: var(--e-3) var(--e-4); margin-bottom: 12px; max-width: 80ch; }
  .plan ol { margin: 0; padding-left: 22px; columns: 2; column-gap: var(--e-6); font-size: var(--t-14); }
  @media (max-width: 700px) { .plan ol { columns: 1; } }
  .choix-annee { display: flex; align-items: center; gap: var(--e-3); flex-wrap: wrap; margin-bottom: var(--e-4); }
  .petit { font-size: var(--t-13); }
  .avis { margin: -6px 0 12px; }
  .petit { font-size: var(--t-12); }
  .sommaire { margin: 0; padding: 10px 14px 14px 36px; }
  .sommaire li { padding: 6px 0; }
  .sommaire li span { display: block; font-size: var(--t-13); }
  .lien-chapitre {
    border: none; background: none; padding: 0; font: inherit; font-weight: bold; color: var(--c-structure);
    cursor: pointer; text-align: left;
  }
  .lien-chapitre:hover { text-decoration: underline; }
  .fil { display: flex; gap: 16px; align-items: center; margin-bottom: 10px; }
  .chapitre p, .chapitre li { max-width: 80ch; line-height: 1.5; }
  .resume { font-style: italic; color: var(--c-texte-2); margin-top: 0; }
  .bases { font-size: var(--t-13); }
  .suivants { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
</style>
