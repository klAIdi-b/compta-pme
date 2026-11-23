<script lang="ts">
  // Barre du parcours après le journal : consigne de l'étape et bouton « Étape suivante ».
  // Dès la dernière opération du journal juste (entraînement) ou saisie (évaluation), l'étape suivante s'ouvre seule.
  import { etat } from '../etat.svelte';
  import { avancementSession, avecCorrection } from '../avancement';
  import { avecParcours, etapesParcours, etatJournal, rangParcours } from '../parcours';
  import { estBoucle } from '../../engine/closing';

  const s = $derived(etat.session!);
  const av = $derived(avecParcours(s.exercice) ? avancementSession(s) : null);
  // Formative terminée : la saisie est fermée, on ne bloque donc plus sur les opérations à revoir.
  const journal = $derived(av ? etatJournal(av, avecCorrection(s) && !etat.verrouille) : null);
  const etapes = $derived(etapesParcours(s.exercice, etat.fonctions));
  const boucle = $derived(etat.dossier.ecritures.length > 0 && estBoucle(etat.dossier));

  /** Le journal sert au bouclement quand l'élève y vient depuis l'étape Bouclement. */
  const vueParcours = $derived(etat.vue === 'journal' && etat.etapeParcours === 'bouclement' ? 'bouclement' : etat.vue);
  const rang = $derived(rangParcours(etapes, vueParcours));
  const etape = $derived(rang > 0 ? etapes[rang - 1]! : null);
  const suivante = $derived(rang >= 0 && rang < etapes.length ? etapes[rang]! : null);
  /** Au bouclement (compte de résultat), on continue une fois les écritures B1, B2… passées. */
  const bloque = $derived(etape?.vue === 'bouclement' && !boucle);

  $effect(() => {
    if (rang > 0) etat.etapeParcours = vueParcours;
  });

  // Ouverture automatique de la première étape quand le journal vient d'être terminé.
  let precedent: { id: string; termine: boolean } | null = null;
  $effect(() => {
    const termine = !!journal?.termine;
    const id = s.exercice.id;
    if (precedent?.id === id && !precedent.termine && termine && etat.vue === 'journal' && etapes[0]) {
      etat.etapeParcours = etapes[0].vue;
      etat.aller(etapes[0].vue);
    }
    precedent = { id, termine };
  });

  function continuer() {
    if (suivante) {
      etat.etapeParcours = suivante.vue;
      etat.aller(suivante.vue);
    } else {
      etat.etapeParcours = null;
      etat.aller('tableau');
    }
  }
</script>

{#if journal && rang >= 0}
  {#if journal.termine}
    <div class="parcours" role="region" aria-label="Étape suivante">
      <div class="texte">
        {#if etape}
          <b>Étape {rang} sur {etapes.length} · {etape.libelle}.</b>
          {etape.vue === 'bouclement' && boucle ? 'Les écritures de bouclement sont passées.' : etape.consigne}
        {:else}
          <b>Journal terminé.</b> Passez maintenant à la suite de l'exercice.
        {/if}
      </div>
      {#if !bloque}
        <button class="btn btn-principal" onclick={continuer}>
          {suivante ? `Étape suivante : ${suivante.libelle}` : 'Exercice terminé : tableau de bord'}
        </button>
      {/if}
    </div>
  {:else if rang === 0 && journal.manquantes === 0}
    <div class="parcours attente" role="status">
      <div class="texte">
        <b>Encore {journal.aRevoir} opération{journal.aRevoir > 1 ? 's' : ''} à revoir</b> avant de passer à la balance,
        au compte de résultat et au bilan.
      </div>
    </div>
  {/if}
{/if}

<style>
  .parcours {
    position: sticky;
    bottom: -48px;
    margin: 24px -28px -48px;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--c-fond);
    border-top: 3px solid var(--c-structure);
    box-shadow: 0 -4px 12px rgba(17, 48, 77, 0.08);
    z-index: 5;
  }
  .attente { border-top-color: var(--c-accent); }
  .texte { flex: 1; min-width: 0; }
  .btn { flex: none; font-size: 15px; padding: 10px 18px; }
  @media (max-width: 1100px) {
    .parcours { margin: 16px -16px -16px; padding: 12px 16px; bottom: -16px; flex-wrap: wrap; }
  }
</style>
