<script lang="ts">
  import { etat } from '../etat.svelte';
  import { balance } from '../../engine/ledger';
  import { m } from '../format';

  const b = $derived(balance(etat.dossier));
  const z = (x: number) => (x === 0 ? '' : m(x));
</script>

<div class="titre">
  <h1>Balance de vérification</h1>
  <span class="sous">Solde d'ouverture compris dans les totaux</span>
</div>

<section class="carte">
  <!-- Téléphone : les quatre colonnes de montants sont rappelées une fois, en tête. -->
  <div class="legende-mobile" aria-hidden="true"><span>Total débit</span><span>Total crédit</span><span>Solde débiteur</span><span>Solde créditeur</span></div>
  <table class="empile balance">
    <thead>
      <tr>
        <th rowspan="2" style="width:70px">Compte</th>
        <th rowspan="2">Intitulé</th>
        <th colspan="2" class="centre">Totaux</th>
        <th colspan="2" class="centre">Soldes</th>
      </tr>
      <tr>
        <th class="montant" style="width:120px">Débit</th>
        <th class="montant" style="width:120px">Crédit</th>
        <th class="montant" style="width:120px">Débiteurs</th>
        <th class="montant" style="width:120px">Créditeurs</th>
      </tr>
    </thead>
    <tbody>
      {#each b.lignes as l, i}
        <tr class:zebre={i % 2 === 1}>
          <td class="num numero">{l.numero}</td>
          <td class="intitule">{l.intitule}</td>
          <td class="montant" data-etiquette="Total débit">{z(l.debit)}</td>
          <td class="montant" data-etiquette="Total crédit">{z(l.credit)}</td>
          <td class="montant" data-etiquette="Solde déb.">{z(l.soldeDebiteur)}</td>
          <td class="montant" data-etiquette="Solde créd.">{z(l.soldeCrediteur)}</td>
        </tr>
      {/each}
      <tr class="total">
        <td colspan="2" class="large">Totaux</td>
        <td class="montant" data-etiquette="Total débit">{m(b.totalDebit)}</td>
        <td class="montant" data-etiquette="Total crédit">{m(b.totalCredit)}</td>
        <td class="montant" data-etiquette="Solde déb.">{m(b.totalSoldesDebiteurs)}</td>
        <td class="montant" data-etiquette="Solde créd.">{m(b.totalSoldesCrediteurs)}</td>
      </tr>
    </tbody>
  </table>
</section>

{#if b.equilibree}
  <p class="ok">La balance est équilibrée : total débit = total crédit, soldes débiteurs = soldes créditeurs.</p>
{:else}
  <p class="alerte">La balance n'est pas équilibrée. Vérifiez le bilan d'ouverture.</p>
{/if}

<style>
  .legende-mobile { display: none; }
  th.centre { text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
  p { margin-top: 12px; }
  @media (max-width: 700px) {
    .balance { --colonnes: 4; }
    .balance td.numero { grid-column: 1; color: var(--c-texte-2); }
    .balance td.intitule { grid-column: 2 / -1; font-weight: var(--graisse-moyen); }
    .balance td.montant { font-size: var(--t-13); }
    .balance td[data-etiquette]::before { content: none; }
    .balance tr.total td.montant { font-size: var(--t-12); }
    .legende-mobile {
      display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding: 8px 14px; position: sticky; top: 0; z-index: 1;
      background: var(--c-fond-tete); border-bottom: 1px solid var(--c-bordure-2); font-size: var(--t-12); color: var(--c-texte-2);
      font-weight: var(--graisse-moyen); text-align: right; line-height: 1.25;
    }
  }
</style>
