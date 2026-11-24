<!--
  Bilan vivant (audit du 24.11.2026) : le bilan en blocs proportionnels, mis à jour
  à chaque écriture. L'élève voit l'actif et le passif varier ensemble, ou un bloc glisser d'un poste à l'autre, et
  l'effet de sa dernière écriture. Idée du concret vers l'abstrait : voir avant de formaliser en débit et crédit.
-->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { bilan } from '../../engine/statements';
  import { bilanEnBlocs, effetEcriture, type BlocBilan } from '../../engine/bilan-vivant';
  import { ecrituresRetenues } from '../../engine/correction';
  import { m } from '../format';

  const d = $derived(etat.dossier);
  const b = $derived(bilan(d));
  /** Bilan avant la dernière écriture validée, pour montrer son effet. */
  const derniere = $derived(ecrituresRetenues(d.ecritures).filter((e) => !e.automatique).at(-1) ?? null);
  const avant = $derived(derniere ? bilan({ ...d, ecritures: d.ecritures.filter((e) => e.id !== derniere.id) }) : null);

  // Blocs, totaux et effet viennent du moteur (`engine/bilan-vivant.ts`) : rien n'est recalculé ici.
  const blocs = $derived(bilanEnBlocs(b, avant));
  const echelle = $derived(Math.max(blocs.totalActif, blocs.totalPassif, 1));
  const variation = (k: BlocBilan) => k.montant - k.avant;
  const signe = (x: number) => (x > 0 ? `+${m(x)}` : x < 0 ? `−${m(-x)}` : m(0));

  /** Effet de la dernière écriture, dans les mots du chapitre « Le bilan ». */
  const effet = $derived.by(() => {
    if (!derniere || !avant) return null;
    const e = effetEcriture(b, avant);
    if (e.genre === 'permutation') return 'Le total du bilan ne change pas : un poste augmente, un autre diminue du même montant (permutation).';
    if (e.genre === 'ensemble') return `L'actif et le passif ${e.sens === 'hausse' ? 'augmentent' : 'diminuent'} tous les deux de ${m(e.montant)} : le bilan reste équilibré.`;
    return `Actif ${signe(e.actif)}, passif ${signe(e.passif)} : vérifiez votre écriture, le bilan n'est plus équilibré.`;
  });

  let ouvert = $state(etat.exercice.niveau === 'CFC1');
</script>

<details class="carte bilan-vivant" bind:open={ouvert}>
  <summary><h2>Bilan en direct</h2><span class="discret">Actif {m(blocs.totalActif)} · Passif {m(blocs.totalPassif)}</span></summary>
  <div class="corps">
    <div class="colonnes" role="img" aria-label={`Actif ${m(blocs.totalActif)}, passif ${m(blocs.totalPassif)} ; hauteur des blocs indicative`}>
      {#each [{ nom: 'Actif', liste: blocs.actif, total: blocs.totalActif }, { nom: 'Passif', liste: blocs.passif, total: blocs.totalPassif }] as col (col.nom)}
        <div class="colonne">
          <div class="tete"><b>{col.nom}</b><span class="num">{m(col.total)}</span></div>
          <div class="pile" style:height={`${Math.max(60, (col.total / echelle) * 220)}px`}>
            {#each col.liste as k (k.titre)}
              <div class={`bloc ${k.classe}`} class:change={variation(k) !== 0} style:flex-grow={Math.max(k.montant, col.total * 0.08)}>
                <span class="nom">{k.titre}</span>
                <span class="num">{m(k.montant)}{#if variation(k) !== 0}&nbsp;<em>({signe(variation(k))})</em>{/if}</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <p class="effet" role="status">
      {#if effet}<b>Votre dernière écriture :</b> {effet}{:else}Passez une écriture : vous verrez ici son effet sur le bilan.{/if}
    </p>
  </div>
</details>

<style>
  .bilan-vivant { margin-bottom: 16px; }
  summary { display: flex; align-items: baseline; gap: 14px; padding: 14px 20px; cursor: pointer; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: '›'; margin-left: auto; font-size: var(--t-20); color: var(--c-texte-2); transition: transform 0.15s; }
  details[open] > summary::after { transform: rotate(90deg); }
  .corps { padding: 4px 20px 18px; border-top: 1px solid var(--c-bordure-3); }
  .colonnes { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: end; margin-top: 14px; }
  .tete { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .pile { display: flex; flex-direction: column; gap: 3px; transition: height 0.4s ease; }
  .bloc {
    flex-basis: 0; min-height: 34px; border-radius: var(--r-3); padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;
    gap: 8px; font-size: var(--t-13); color: #fff; transition: flex-grow 0.4s ease, box-shadow 0.3s; overflow: hidden;
  }
  .bloc .nom { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bloc .num { white-space: nowrap; }
  .bloc em { font-style: normal; font-weight: 700; }
  .bloc.change { box-shadow: 0 0 0 3px var(--c-accent); }
  .ac { background: #2a6aa0; } .ai { background: var(--c-structure); }
  .ct { background: #b3541e; } .lt { background: #8f3f12; } .cp { background: var(--c-succes); }
  .perte { background: var(--c-erreur); }
  .effet { margin: 14px 0 0; }
  @media (max-width: 600px) {
    .bloc { flex-direction: column; align-items: flex-start; gap: 0; }
    .bloc .nom, .bloc .num { white-space: normal; max-width: 100%; }
    .colonnes { gap: 8px; }
    summary { flex-wrap: wrap; gap: 4px 14px; }
    .tete { flex-wrap: wrap; gap: 0 8px; }
  }
  @media (prefers-reduced-motion: reduce) { .pile, .bloc { transition: none; } }
</style>
