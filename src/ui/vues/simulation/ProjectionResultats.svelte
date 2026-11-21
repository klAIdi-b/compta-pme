<!-- Simulateur : résultats du dernier tour, à projeter (écran 4 de la maquette validée le 21.11.2026). -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { simulations } from '../../simulation.svelte';
  import { tableauResultats, PONDERATION } from '../../../engine/simulation/classement';
  import { libellePeriode } from '../../../engine/simulation/tour';
  import { formatMontant } from '../../../engine/money';
  import { libelleImprevu, pourMille } from './libelles';

  let { id }: { id: string } = $props();

  // svelte-ignore state_referenced_locally
  const e = simulations.trouver(id)!;
  // svelte-ignore state_referenced_locally
  const p = simulations.calculee(id)!;
  const r = e.reglages;
  const tour = p.tours.at(-1);
  const lignes = tableauResultats(p);
  const parNom = [...lignes].sort((a, b) => a.nom.localeCompare(b.nom, 'fr-CH'));
  const perdus = tour ? tour.resultats.reduce((t, x) => t + x.clientsPerdus, 0) : 0;
  const finale = p.tours.length === r.nbTours;
  const partMax = Math.max(1, ...lignes.map((l) => l.partMarchePourMille));
  let fermer: HTMLButtonElement;

  function retour() {
    simulations.vue = { ecran: 'partie', id };
  }

  onMount(() => {
    fermer?.focus();
    const touche = (ev: KeyboardEvent) => ev.key === 'Escape' && retour();
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  });
</script>

<div class="projection" role="dialog" aria-modal="true" aria-labelledby="titre-projection">
  <button class="btn retour" bind:this={fermer} onclick={retour}>Retour au tableau de la partie <kbd>Échap</kbd></button>
  {#if !tour}
    <p class="vide">Aucun tour n'a encore été joué.</p>
  {:else}
    <div class="entete">
      <div>
        <h1 id="titre-projection">{finale ? 'Résultats finaux' : 'Résultats'} — {libellePeriode(r, tour.numero)}</h1>
        <div class="sous">Tour {tour.numero} sur {r.nbTours} · {r.secteur.nom}</div>
      </div>
      <div class="marche">
        <div>Clients du {r.dureeTour === 'mois' ? 'mois' : 'trimestre'}<b>{tour.demandeTotale}</b></div>
        <div>Prix moyen<b>{formatMontant(tour.prixMoyen)}</b></div>
        <div>Repartis sans acheter<b>{perdus}</b></div>
      </div>
    </div>

    {#if tour.imprevus.length}
      <p class="imprevu">Imprévu{tour.imprevus.length > 1 ? 's' : ''} : {tour.imprevus.map((i) => libelleImprevu(i, e.entreprises, r.secteur)).join(' ; ')}.</p>
    {/if}
    {#if r.affichage === 'cache'}
      <p class="message">Chaque groupe consulte ses propres chiffres sur l'écran de ses décisions.</p>
    {:else}
      <table class="classement">
        <thead>
          <tr>
            {#if r.affichage === 'classement'}<th style="width:90px">Rang</th>{/if}
            <th>Entreprise</th>
            <th class="montant">Résultat cumulé</th>
            <th class="montant">Trésorerie</th>
            <th class="montant">Part de marché</th>
            {#if r.niveau === 'MP'}<th class="montant">Rentabilité des fonds propres</th>{/if}
            {#if r.affichage === 'classement'}<th class="montant">Score</th>{/if}
          </tr>
        </thead>
        <tbody>
          {#each r.affichage === 'classement' ? lignes : parNom as l, i (l.entrepriseId)}
            <tr class:zebre={i % 2 === 1}>
              {#if r.affichage === 'classement'}<td><span class="rang" class:premier={l.rang === 1}>{l.rang}</span></td>{/if}
              <td><b>{l.nom}</b></td>
              <td class="montant" class:negatif={l.resultatCumule < 0}><b>{formatMontant(l.resultatCumule)}</b></td>
              <td class="montant">{formatMontant(l.tresorerie)}</td>
              <td class="montant">
                <span class="part">{pourMille(l.partMarchePourMille)} <span class="b" aria-hidden="true"><span style="width:{Math.round((l.partMarchePourMille * 100) / partMax)}%"></span></span></span>
              </td>
              {#if r.niveau === 'MP'}<td class="montant">{pourMille(l.rentabiliteFondsPropresPourMille ?? 0)}</td>{/if}
              {#if r.affichage === 'classement'}<td class="montant">{l.score}</td>{/if}
            </tr>
          {/each}
        </tbody>
      </table>
      {#if r.affichage === 'classement'}
        <p class="pied">
          Score : rang du résultat ×{PONDERATION.resultat}, rang de la trésorerie ×{PONDERATION.tresorerie}, rang de la part de marché
          ×{PONDERATION.partMarche} (1er sur {lignes.length} = {lignes.length} points).
        </p>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .projection { position: fixed; inset: 0; z-index: 50; background: #fff; overflow: auto; padding: 56px 48px 40px; }
  .retour { position: absolute; top: 12px; right: 16px; font-size: 13px; }
  .entete { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; border-bottom: 3px solid var(--c-nuit); padding-bottom: 16px; }
  h1 { font-size: 34px; color: var(--c-nuit); }
  .sous { font-size: 18px; color: var(--c-texte-2); margin-top: 4px; }
  .marche { display: flex; gap: 40px; font-size: 18px; flex-wrap: wrap; }
  .marche b { display: block; font-size: 30px; color: var(--c-nuit); font-variant-numeric: tabular-nums; }
  .classement { margin-top: 26px; }
  .classement th { font-size: 14px; background: none; border-bottom: 2px solid var(--c-bordure-2); }
  .classement td { font-size: 22px; padding: 16px 14px; vertical-align: middle; }
  .classement tbody tr:hover td { background: inherit; }
  .rang { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-weight: bold; font-size: 24px; background: var(--c-selection); color: var(--c-structure); }
  .rang.premier { background: var(--c-nuit); color: #fff; }
  .part { display: inline-flex; align-items: center; gap: 10px; }
  .part .b { width: 140px; height: 14px; background: var(--c-bordure-3); border-radius: 7px; overflow: hidden; }
  .part .b span { display: block; height: 100%; background: var(--c-structure); }
  .imprevu { margin: 16px 0 0; font-size: 18px; color: var(--c-alerte-texte); }
  .pied { margin-top: 18px; font-size: 15px; color: var(--c-texte-2); }
  .message { font-size: 22px; margin-top: 40px; color: var(--c-texte-2); }
  @media (max-width: 760px) {
    .projection { padding: 56px 16px 24px; }
    .classement td { font-size: 16px; padding: 10px 8px; }
    .part .b { display: none; }
  }
</style>
