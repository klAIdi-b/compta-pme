<script lang="ts">
  import { dialogue } from '../dialogue.svelte';
  import { etat } from '../etat.svelte';
  import { etiquetteNiveau, LIBELLES_MODE, operationsSaisies } from '../../engine/exercice';
  import { balance } from '../../engine/ledger';
  import { dt } from '../format';
  import { corrigerCopie } from '../../engine/notation';
  import { vueEleve } from '../modes';

  const s = $derived(etat.session!);
  const saisies = $derived(operationsSaisies(s.dossier).size);
  const total = $derived(s.exercice.operations.length);
  /** Exercice sans journal (fiche seule, par exemple un budget) : le bouton principal ouvre la fiche. */
  const premiereFiche = $derived(
    s.exercice.parametres.budget ? [{ vue: 'budget' as const, libelle: 'Budget' }]
      : s.exercice.parametres.facturation ? [{ vue: 'facturation' as const, libelle: 'Facturation' }] : [],
  );
  const paragraphes = $derived(
    (s.exercice.situation ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
  );

  /** Évaluation formative : correction à la fin, note indicative (barème de l'exercice). */
  const formative = $derived(s.exercice.mode === 'formative' && vueEleve(etat.genre) && (s.exercice.corrige?.length ?? 0) > 0);
  const resultat = $derived(formative && s.formativeTerminee ? corrigerCopie(s.exercice, s.dossier, s.fiches) : null);
  const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  async function terminer() {
    if (!(await dialogue.demander({ titre: "Terminer l'évaluation formative ?", texte: ["La saisie sera fermée et la correction s'affichera.", 'Vous ne pourrez plus modifier vos écritures.'], confirmer: 'Voir la correction', annuler: 'Continuer la saisie' }))) return;
    s.formativeTerminee = true;
  }

  async function recommencer() {
    if (await dialogue.demander({ titre: "Recommencer l'exercice ?", texte: ['Toutes vos écritures seront effacées.'], confirmer: 'Tout effacer et recommencer', danger: true })) etat.recommencer();
  }
  // L'accueil s'ouvre par-dessus le travail en cours : rien n'est effacé tant qu'un autre exercice n'est pas commencé.
  function quitter() {
    etat.allerAccueil();
  }
</script>

<section class="mission">
  <h1><span class="surtitre">Votre mission</span>{s.dossier.raisonSociale}</h1>
  <p class="sous-titre">{s.exercice.titre} · {etiquetteNiveau(s.exercice)} · {LIBELLES_MODE[s.exercice.mode]}</p>
  {#if paragraphes.length}
    <p class="accroche">{paragraphes[0]}</p>
    {#if paragraphes.length > 1}
      <details class="suite">
        <summary>Lire toute la situation</summary>
        {#each paragraphes.slice(1) as p}<p>{p}</p>{/each}
      </details>
    {/if}
  {/if}
</section>

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

<section class="carte demarrer">
  <div class="demarrer-corps">
    <div class="demarrer-texte">
      <h2>{s.dossier.debut === s.exercice.debut ? 'Ce qui vous est demandé' : 'Exercice suivant'}</h2>
      {#if s.dossier.debut === s.exercice.debut}
        <p>{s.exercice.introduction}</p>
        {#if total > 0}
          <div class="progression" aria-label="Avancement du journal">
            <div class="jauge"><span style:width={`${Math.round((saisies / total) * 100)}%`}></span></div>
            <span><b>{saisies}</b> opération{saisies > 1 ? 's' : ''} sur {total} saisie{saisies > 1 ? 's' : ''} · balance {balance(s.dossier).equilibree ? 'équilibrée' : 'non équilibrée'}</span>
          </div>
        {/if}
      {:else}
        <p>
          L'exercice {dt(s.exercice.debut).slice(6)} est bouclé et archivé. Vous travaillez sur l'exercice suivant
          ({dt(s.dossier.debut)} – {dt(s.dossier.fin)}), ouvert avec le bilan de clôture. L'énoncé ne contient pas
          d'opération pour cet exercice.
        </p>
      {/if}
    </div>
    <div class="demarrer-action">
      {#if total > 0}
        <button class="btn btn-principal btn-grand" onclick={() => etat.commencerSaisie()}>
          {s.dossier.ecritures.some((e) => !e.automatique) ? 'Continuer la saisie' : 'Commencer la saisie'}
        </button>
      {:else}
        {#each premiereFiche as v}
          <button class="btn btn-principal btn-grand" onclick={() => etat.aller(v.vue)}>Ouvrir : {v.libelle}</button>
        {/each}
      {/if}
    </div>
  </div>
  <div class="options">
    <button class="btn-lien" onclick={() => (etat.visiteOuverte = true)}>Revoir la visite guidée</button>
    <button class="btn-lien" onclick={recommencer}>Recommencer l'exercice</button>
    {#if etat.genre === 'travail'}<button class="btn-lien" onclick={quitter}>Changer d'exercice</button>{/if}
  </div>
</section>

<style>
  .mission { margin-bottom: 24px; max-width: 78ch; }
  .mission h1 { font-size: clamp(26px, 3vw, 34px); letter-spacing: -0.025em; }
  .surtitre { display: block; font-size: var(--t-13); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--c-action-fonce); margin-bottom: 6px; }
  .sous-titre { margin: 6px 0 0; color: var(--c-texte-2); }
  .accroche { font-size: var(--t-17); line-height: 1.6; margin: 16px 0 0; }
  .suite { margin-top: 10px; }
  .suite summary { cursor: pointer; color: var(--c-structure); font-weight: 600; }
  .suite p { line-height: 1.6; margin: 10px 0 0; white-space: pre-line; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .formative { border-left: 4px solid var(--c-structure); margin-bottom: 16px; }
  .formative p { margin: 0 0 8px; }
  .note { font-size: var(--t-17); }
  .demarrer-corps { display: flex; gap: 28px; align-items: center; justify-content: space-between; padding: 22px 24px; flex-wrap: wrap; }
  .demarrer-texte { flex: 1 1 380px; min-width: 0; }
  .demarrer-texte h2 { font-size: var(--t-17); margin-bottom: 8px; }
  .demarrer-texte p { margin: 0; line-height: 1.6; max-width: 75ch; color: var(--c-texte); }
  .progression { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; color: var(--c-texte-2); font-size: var(--t-14); }
  .jauge { height: 8px; border-radius: var(--r-1); background: #e8ecf2; overflow: hidden; max-width: 420px; }
  .jauge span { display: block; height: 100%; background: var(--c-structure); border-radius: var(--r-1); }
  .options { display: flex; gap: 20px; flex-wrap: wrap; padding: 12px 24px; border-top: 1px solid var(--c-bordure-3); background: var(--c-zebra); font-size: var(--t-14); }
  @media (max-width: 640px) { .demarrer-action, .demarrer-action .btn { width: 100%; } }
</style>
