<script lang="ts">
  import { etat } from '../etat.svelte';
  import { vueEleve } from '../modes';
  import { boucler, estBoucle } from '../../engine/closing';
  import { compteDeResultat } from '../../engine/statements';
  import { m } from '../format';
  import { bouclementCorrige, diagnostiquerBouclement } from '../../engine/correction-bouclement';
  import { INDICES } from '../../engine/correction';

  const d = $derived(etat.dossier);
  const mode = $derived(etat.exercice.parametres.modeBouclement);
  const boucle = $derived(d.ecritures.length > 0 && estBoucle(d));
  const cr = $derived(compteDeResultat(d));
  const correction = $derived(
    etat.retour && vueEleve(etat.genre) && bouclementCorrige(etat.exercice)
      ? diagnostiquerBouclement(d, etat.exercice)
      : null,
  );

  const automatique = $derived(mode === 'compteDeResultat' && !!etat.exercice.parametres.bouclementAutomatique);
  let erreurBouclement = $state('');

  /** Bouclement automatique (option d'exercice) : le logiciel passe les écritures B1, B2… au journal. */
  function boucleAutomatiquement() {
    erreurBouclement = '';
    const r = boucler(d);
    if (!r.ok) {
      erreurBouclement = r.erreurs.join(' ');
      return;
    }
    etat.majDossier(r.valeur);
  }

  /** Année de l'exercice comptable suivant (réouverture). */
  const anneeSuivante = $derived(Number(d.fin.slice(0, 4)) + 1);
  /** Première pièce de bouclement libre (B1, B2…), pour ouvrir le journal dessus. */
  const prochaineB = $derived.by(() => {
    const prises = new Set(d.ecritures.map((e) => e.piece));
    let n = 1;
    while (prises.has(`B${n}`)) n++;
    return `B${n}`;
  });

</script>

<div class="titre"><h1>Bouclement</h1></div>

{#if correction}
  <section class="carte correction">
    <h2>Correction du bouclement</h2>
    <div class="corps-carte">
      {#if correction === 'juste'}
        <p class="ok">Vos écritures de bouclement sont justes.</p>
      {:else if correction === 'manquante'}
        <p class="discret">Aucune écriture de bouclement saisie pour l'instant.</p>
      {:else if correction === 'incomplete'}
        <p class="discret">{INDICES.incomplete}</p>
      {:else}
        <p class="revoir"><b>À revoir.</b> {INDICES[correction]}</p>
      {/if}
      <p class="discret petit">
        Les écritures attendues sont calculées d'après vos propres comptes : une erreur dans une opération n'est pas
        comptée une deuxième fois au bouclement.
      </p>
    </div>
  </section>
{/if}

<section class="carte">
  <h2>Détermination du résultat</h2>
  <div class="corps-carte">
    {#if boucle}
      <p class="ok">L'exercice est bouclé : le résultat est viré et le compte privé est soldé.</p>
    {:else}
      <p>Total des produits {m(cr.totalProduits)} − total des charges {m(cr.totalCharges)} =
        <b>{cr.resultat >= 0 ? 'bénéfice' : 'perte'} de {m(Math.abs(cr.resultat))}</b>.</p>
      {#if automatique}
        <p class="discret">Pour cet exercice, le logiciel passe lui-même les écritures de bouclement ; vous les retrouverez dans le journal (pièces B1, B2…).</p>
        <p><button class="btn btn-principal" onclick={boucleAutomatiquement}>Passer les écritures de bouclement</button></p>
        {#if erreurBouclement}<div class="alerte" role="alert">{erreurBouclement}</div>{/if}
      {:else if mode === 'compteDeResultat'}
        {#if d.formeJuridique === 'raison individuelle'}
          <p class="discret">Passez au journal les écritures de bouclement, avec les pièces B1 et B2 : B1 résultat viré du compte de résultat au compte privé, puis B2 solde du compte privé viré au capital.</p>
        {:else}
          <p class="discret">Passez au journal l'écriture de bouclement B1 : résultat viré du compte de résultat au bénéfice reporté.</p>
        {/if}
        <p><button class="btn btn-principal" onclick={() => etat.ouvrirOperation(prochaineB)}>Saisir les écritures de bouclement ({prochaineB})</button></p>
      {/if}
    {/if}
  </div>
</section>

<section class="carte">
  <h2>Exercice comptable suivant</h2>
  <div class="corps-carte">
    <p class="discret">
      La réouverture archive l'exercice actuel et reporte le bilan de clôture comme bilan d'ouverture du
      1er janvier {anneeSuivante}. C'est facultatif : l'exercice de l'énoncé est terminé une fois le bouclement passé.
    </p>
    <p><button class="btn" disabled={etat.consultation} onclick={() => etat.aller('cloture')}>Clôture de l'exercice</button></p>
  </div>
</section>

<style>
  section { margin-bottom: 16px; }
  .revoir { color: var(--c-erreur); }
  .petit { font-size: var(--t-12); margin: 6px 0 0; }
</style>
