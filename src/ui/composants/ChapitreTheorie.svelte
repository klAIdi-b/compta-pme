<!-- Contenu d'un chapitre de théorie (sections et blocs) : rubrique Théorie et parcours Apprendre. -->
<script lang="ts">
  import type { Chapitre, ExempleEcriture } from '../../data/theorie';
  import { formatMontant } from '../../engine/money';

  let { chapitre, intitules }: { chapitre: Chapitre; intitules: Map<string, string> } = $props();

  const compte = (n: string | null) => (n ? `${intitules.get(n) ?? n}` : '');
  const fr = (francs: number) => formatMontant(Math.round(francs * 100));

  /** Une ligne simple affiche les deux comptes ; les lignes d'une écriture composée n'en affichent qu'un. */
  function lignes(e: ExempleEcriture) {
    return e.lignes.map((l) => ({ debit: l.debit, credit: l.credit, montant: fr(l.montant) }));
  }
</script>

<div class="chapitre-theorie">
      {#each chapitre.sections as sec}
        <h3>{sec.titre}</h3>
        {#each sec.blocs as b}
          {#if b.type === 'p'}
            <p>{b.texte}</p>
          {:else if b.type === 'retenir'}
            <p class="retenir"><b>À retenir :</b> {b.texte}</p>
          {:else if b.type === 'liste'}
            <ul>{#each b.items as it}<li>{it}</li>{/each}</ul>
          {:else if b.type === 'tableau'}
            <table class="tableau">
              <thead><tr>{#each b.entetes as e}<th>{e}</th>{/each}</tr></thead>
              <tbody>{#each b.lignes as l}<tr>{#each l as cel}<td>{cel}</td>{/each}</tr>{/each}</tbody>
            </table>
          {:else if b.type === 'ecritures'}
            {#if b.titre}<p class="titre-ex">{b.titre}</p>{/if}
            <table class="ecritures">
              <thead>
                <tr><th>Opération</th><th>Débit</th><th>Crédit</th><th class="montant">Montant</th></tr>
              </thead>
              <tbody>
                {#each b.exemples as ex}
                  {#each lignes(ex) as l, i}
                    <tr class:suite={i > 0}>
                      <td>{i === 0 ? ex.cas : ''}</td>
                      <td>{#if l.debit}{compte(l.debit)} <span class="numero">{l.debit}</span>{/if}</td>
                      <td>{#if l.credit}{compte(l.credit)} <span class="numero">{l.credit}</span>{/if}</td>
                      <td class="montant num">{l.montant}</td>
                    </tr>
                  {/each}
                {/each}
              </tbody>
            </table>
          {/if}
        {/each}
      {/each}
</div>

<style>
  .chapitre-theorie :global(p), .chapitre-theorie :global(li) { max-width: 80ch; line-height: 1.5; }
  h3 { font-size: 15px; color: var(--c-structure); margin: 20px 0 6px; }
  .retenir { border-left: 4px solid var(--c-structure); background: var(--c-zebra); padding: 8px 12px; }
  .titre-ex { font-weight: bold; margin-bottom: 4px; }
  table.tableau, table.ecritures { margin: 6px 0 12px; }
  .tableau td, .ecritures td { vertical-align: top; }
  .tableau tbody tr:nth-child(even) { background: var(--c-zebra); }
  .ecritures tbody tr:not(.suite) td { border-top: 1px solid var(--c-bordure); }
  .ecritures tbody tr:first-child td { border-top: none; }
  .numero { font-size: 11px; color: var(--c-texte-2); font-variant-numeric: tabular-nums; }
  .montant { text-align: right; white-space: nowrap; }
</style>
