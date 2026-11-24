<script lang="ts">
  import { etat } from '../etat.svelte';
  import { grandLivre } from '../../engine/ledger';
  import { dt, libellesSoldes, m } from '../format';

  const d = $derived(etat.dossier);
  const comptes = $derived(grandLivre(d));
  const libelles = $derived(libellesSoldes(etat.exercice.parametres.libellesT));
  let filtre = $state('');
  const affiches = $derived(filtre ? comptes.filter((c) => c.numero === filtre) : comptes);

  function solde(s: number) {
    return s === 0 ? '0.00' : `${m(Math.abs(s))} ${s > 0 ? 'D' : 'C'}`;
  }
</script>

<div class="titre">
  <h1>Grand livre</h1>
  <label class="filtre">
    <span class="discret">Compte</span>
    <select class="champ" bind:value={filtre}>
      <option value="">Tous les comptes</option>
      {#each comptes as c}<option value={c.numero}>{c.numero} {c.intitule}</option>{/each}
    </select>
  </label>
</div>

{#if comptes.length === 0}
  <p class="vide carte">Aucun mouvement pour l'instant.</p>
{/if}

{#each affiches as c}
  <section class="carte compte">
    <h2><span class="num">{c.numero}</span> {c.intitule}</h2>
    <table class="empile">
      <thead>
        <tr>
          <th style="width:96px">Date</th>
          <th style="width:56px">Pièce</th>
          <th>Libellé</th>
          <th style="width:110px">Contrepartie</th>
          <th class="montant" style="width:110px">Débit</th>
          <th class="montant" style="width:110px">Crédit</th>
          <th class="montant" style="width:130px">Solde</th>
        </tr>
      </thead>
      <tbody>
        {#each c.lignes as l, i}
          <tr class:zebre={i % 2 === 1}>
            <td class="num" data-etiquette="Date">{l.date ? dt(l.date) : dt(d.debut)}</td>
            <td class="num" data-etiquette="Pièce">{l.piece ?? ''}</td>
            <td class="large">{l.nature === 'ouverture' ? libelles.initialLong : l.libelle}</td>
            <td class="num" data-etiquette="Contrepartie">{l.contrepartie ?? ''}</td>
            <td class="montant" data-etiquette="Débit">{l.sens === 'D' ? m(l.montant) : ''}</td>
            <td class="montant" data-etiquette="Crédit">{l.sens === 'C' ? m(l.montant) : ''}</td>
            <td class="montant" data-etiquette="Solde">{solde(l.soldeProgressif)}</td>
          </tr>
        {/each}
        <tr class="total">
          <td colspan="4" class="large">Totaux et solde</td>
          <td class="montant" data-etiquette="Débit">{m(c.totalDebit)}</td>
          <td class="montant" data-etiquette="Crédit">{m(c.totalCredit)}</td>
          <td class="montant" data-etiquette="Solde">{solde(c.solde)}</td>
        </tr>
      </tbody>
    </table>
  </section>
{/each}

<p class="discret note">D = solde débiteur, C = solde créditeur.</p>

<style>
  .filtre { display: flex; align-items: center; gap: 8px; }
  .filtre select { width: 300px; max-width: 100%; }
  @media (max-width: 700px) { .filtre { width: 100%; } .filtre select { flex: 1; min-width: 0; width: auto; } }
  .compte { margin-bottom: 16px; }
  .note { font-size: var(--t-12); }
</style>
