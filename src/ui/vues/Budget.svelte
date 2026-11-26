<!--
  Budget et écarts (plan d'études CFC : c5.ep1d, c6.ep4a). Onglet 1 : préparer le budget d'après la note de la direction.
  Onglet 2 : comparer avec les chiffres effectifs (donnés, ou soldes des comptes de l'élève) : écart, écart en %,
  appréciation, cause principale et recommandation. En entraînement, chaque champ est contrôlé dès qu'il est rempli.
-->
<script lang="ts">
  import { dialogue } from '../dialogue.svelte';
  import { etat } from '../etat.svelte';
  import {
    calculBudget, champsComparer, champsPreparer, ficheBudgetVide, ID_RESULTAT, ID_TOTAL_CHARGES, ID_TOTAL_PRODUITS,
    LIBELLES_APPRECIATION, type Appreciation,
  } from '../../engine/budget';
  import { controlerChamp, type ChampAttendu } from '../../engine/champs';
  import { soldeDe } from '../../engine/ledger';
  import { m } from '../format';

  const donnees = $derived(etat.exercice.parametres.budget!);
  /**
   * Ordre d'affichage des causes, mélangé d'après l'identifiant de l'exercice (stable d'un affichage à l'autre) : la bonne
   * cause n'est plus toujours la première de la liste (second audit, 26.11.2026). La valeur enregistrée reste l'indice.
   */
  const ordreCauses = $derived.by(() => {
    let h = [...etat.exercice.id].reduce((x, ch) => (x * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const ordre = donnees.causes.map((_, i) => i);
    for (let i = ordre.length - 1; i > 0; i--) {
      h = (h * 1103515245 + 12345) >>> 0;
      const j = h % (i + 1);
      [ordre[i], ordre[j]] = [ordre[j]!, ordre[i]!];
    }
    return ordre;
  });
  const entrainement = $derived(etat.retour);
  const ferme = $derived(etat.verrouille);
  const parComptes = $derived(donnees.postes.some((p) => p.comptes));
  const solde = (n: string) => soldeDe(etat.dossier, n);

  const session = etat.session!;
  if (!session.fiches.budget) session.fiches.budget = ficheBudgetVide();
  const fiche = session.fiches.budget;

  let onglet = $state<'preparer' | 'comparer'>(etat.exercice.parametres.budget?.preparer ? 'preparer' : 'comparer');
  /**
   * Hors entraînement, le budget validé apparaît dans l'onglet 2 : une fois cet onglet ouvert, le budget préparé par
   * l'élève ne se modifie plus (sinon il suffirait de le recopier).
   */
  const budgetFige = $derived(donnees.preparer && !entrainement && fiche.comparer.ouvert === '1');

  async function ouvrirComparer() {
    if (donnees.preparer && !entrainement && fiche.comparer.ouvert !== '1') {
      const ok = await dialogue.demander({
        titre: 'Passer à la comparaison ?',
        texte: ["Le budget validé par la direction va s'afficher pour la comparaison.", 'Vous ne pourrez plus modifier votre propre budget.'],
        confirmer: 'Afficher le budget validé',
        annuler: 'Revoir mon budget',
      });
      if (!ok) return;
      fiche.comparer.ouvert = '1';
    }
    onglet = 'comparer';
  }

  function etatChamp(ch: ChampAttendu | undefined, saisies: Record<string, string>): 'juste' | 'faux' | null {
    if (!ch || !entrainement) return null;
    const r = controlerChamp(ch, saisies[ch.cle]);
    return r === null ? null : r ? 'juste' : 'faux';
  }
  const libelleEtat = (e: 'juste' | 'faux' | null) => (e === 'juste' ? 'Juste' : e === 'faux' ? 'À revoir' : '');

  const champsP = $derived(new Map(champsPreparer(donnees).map((c) => [c.cle, c])));
  const calcul = $derived(calculBudget(donnees, parComptes ? solde : undefined));
  const champsC = $derived(new Map(champsComparer(donnees, parComptes ? solde : undefined).map((c) => [c.cle, c])));
  const produits = $derived(donnees.postes.filter((p) => p.nature === 'produit'));
  const charges = $derived(donnees.postes.filter((p) => p.nature === 'charge'));
  const APPRECIATIONS = Object.keys(LIBELLES_APPRECIATION) as Appreciation[];
</script>

<div class="titre">
  <h1>Budget</h1>
  <span class="sous">{donnees.titre} · montants en CHF, hors TVA</span>
</div>

<div class="segments onglets" role="group" aria-label="Partie du budget">
  {#if donnees.preparer}
    <button aria-pressed={onglet === 'preparer'} onclick={() => (onglet = 'preparer')}>Préparer le budget</button>
  {/if}
  <button aria-pressed={onglet === 'comparer'} onclick={ouvrirComparer}>Comparer avec les chiffres effectifs</button>
</div>

{#if onglet === 'preparer'}
  <div class="deux">
    <article class="carte note">
      <h2>Note de la direction</h2>
      <div class="corps-carte">
        <ul>{#each donnees.note as l}<li>{l}</li>{/each}</ul>
      </div>
    </article>
    <section class="carte">
      <h2>Votre budget</h2>
      <div class="corps-carte">
        {#if budgetFige}<p class="discret">Vous avez ouvert la comparaison : votre budget n'est plus modifiable.</p>{/if}
        {#each [{ titre: 'Produits', postes: produits, total: ID_TOTAL_PRODUITS, libTotal: 'Total des produits' }, { titre: 'Charges', postes: charges, total: ID_TOTAL_CHARGES, libTotal: 'Total des charges' }] as bloc (bloc.titre)}
          <table class="formulaire">
            <thead><tr><th>{bloc.titre}</th><th class="montant">Budget</th>{#if entrainement}<th class="controle">Contrôle</th>{/if}</tr></thead>
            <tbody>
              {#each [...bloc.postes.map((p) => ({ cle: p.id, libelle: p.libelle, total: false })), { cle: bloc.total, libelle: bloc.libTotal, total: true }] as l, i (l.cle)}
                {@const e = etatChamp(champsP.get(l.cle), fiche.preparer)}
                <tr class:zebre={i % 2 === 1} class:total={l.total}>
                  <td>{l.libelle}</td>
                  <td class="saisie-cell"><input class="champ montant num" inputmode="decimal" placeholder="0.00" aria-label={`Budget, ${l.libelle}`} disabled={ferme || budgetFige} bind:value={fiche.preparer[l.cle]} /></td>
                  {#if entrainement}<td class="controle" class:juste={e === 'juste'} class:faux={e === 'faux'}>{libelleEtat(e)}</td>{/if}
                </tr>
              {/each}
            </tbody>
          </table>
        {/each}
        <table class="formulaire">
          <tbody>
            {#each [{ cle: ID_RESULTAT, libelle: 'Résultat prévu (bénéfice, ou perte avec un signe moins)', nombre: false }, ...(donnees.seuil ? [{ cle: 'seuil', libelle: donnees.seuil.question, nombre: true }] : [])] as l (l.cle)}
              {@const e = etatChamp(champsP.get(l.cle), fiche.preparer)}
              <tr class="total">
                <td>{l.libelle}</td>
                <td class="saisie-cell"><input class="champ montant num" inputmode="decimal" placeholder={l.nombre ? '0' : '0.00'} aria-label={l.libelle} disabled={ferme || budgetFige} bind:value={fiche.preparer[l.cle]} /></td>
                {#if entrainement}<td class="controle" class:juste={e === 'juste'} class:faux={e === 'faux'}>{libelleEtat(e)}</td>{/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </div>
{:else}
  <p class="consigne">{donnees.contexteEffectif}</p>
  <p class="discret petit">Écart = effectif − budget ; écart en % = écart ÷ budget × 100, à 0,1 près. Produit plus élevé que prévu : favorable ; charge plus élevée que prévu : défavorable.</p>
  <section class="carte">
    <h2>{donnees.preparer ? 'Budget validé par la direction et' : 'Budget et'} chiffres effectifs</h2>
    <div class="defile">
      <table>
        <thead>
          <tr>
            <th>Poste</th><th class="montant">Budget</th><th class="montant">Effectif</th>
            <th class="montant" style="width:140px">Écart</th><th class="montant" style="width:110px">Écart en %</th>
            <th style="width:170px">Appréciation</th>{#if entrainement}<th class="controle">Contrôle</th>{/if}
          </tr>
        </thead>
        <tbody>
          {#each calcul.lignes as l, i (l.id)}
            {@const chE = champsC.get(`e:${l.id}`)}
            {@const chP = champsC.get(`p:${l.id}`)}
            {@const chA = champsC.get(`a:${l.id}`)}
            {@const etats = [etatChamp(chE, fiche.comparer), etatChamp(chP, fiche.comparer), etatChamp(chA, fiche.comparer)].filter((x) => x !== null)}
            {@const e = etats.length === 0 ? null : etats.includes('faux') ? 'faux' : etats.length === (chP ? 3 : 2) ? 'juste' : null}
            <tr class:zebre={i % 2 === 1} class:total={l.total}>
              <td>{l.libelle}</td>
              <td class="montant num">{m(l.budget)}</td>
              <td class="montant num">{m(l.effectif)}</td>
              <td><input class="champ montant num" inputmode="decimal" placeholder="0.00" aria-label={`Écart, ${l.libelle}`} disabled={ferme} bind:value={fiche.comparer[`e:${l.id}`]} /></td>
              <td>
                {#if chP}<input class="champ montant num pc" inputmode="decimal" placeholder="0.0" aria-label={`Écart en %, ${l.libelle}`} disabled={ferme} bind:value={fiche.comparer[`p:${l.id}`]} />{:else}<span class="discret">—</span>{/if}
              </td>
              <td>
                <select class="champ" aria-label={`Appréciation, ${l.libelle}`} disabled={ferme} bind:value={fiche.comparer[`a:${l.id}`]}>
                  <option value="">Choisir…</option>
                  {#each APPRECIATIONS as a}<option value={a}>{LIBELLES_APPRECIATION[a]}</option>{/each}
                </select>
              </td>
              {#if entrainement}<td class="controle" class:juste={e === 'juste'} class:faux={e === 'faux'}>{libelleEtat(e)}</td>{/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="corps-carte interpretation">
      {#each [etatChamp(champsC.get('cause'), fiche.comparer)] as eC}
        <label>
          Cause principale de l'écart sur le résultat
          <span class="ligne-champ">
            <select class="champ" disabled={ferme} bind:value={fiche.comparer.cause}>
              <option value="">Choisir…</option>
              {#each ordreCauses as i}<option value={String(i)}>{donnees.causes[i]}</option>{/each}
            </select>
            {#if eC}<span class:juste={eC === 'juste'} class:faux={eC === 'faux'}>{libelleEtat(eC)}</span>{/if}
          </span>
        </label>
      {/each}
      <label>
        Recommandation à la direction (non corrigée)
        <textarea rows="3" disabled={ferme} bind:value={fiche.comparer.recommandation} placeholder="Ce qu'il faudrait faire différemment la prochaine fois…"></textarea>
      </label>
    </div>
  </section>
  {#if parComptes}
    <p class="discret note">Les chiffres effectifs suivent vos écritures : saisissez toutes les opérations au journal avant de comparer.</p>
  {/if}
{/if}

<style>
  .onglets { margin-bottom: 14px; }
  .deux { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 16px; align-items: start; }
  @media (max-width: 1100px) { .deux { grid-template-columns: 1fr; } }
  section, article { margin-bottom: 14px; }
  .note ul { margin: 0; padding-left: 18px; line-height: 1.6; }
  .formulaire { margin-bottom: 12px; }
  .saisie-cell { width: 160px; }
  .champ.montant { text-align: right; width: 130px; }
  .champ.pc { width: 90px; }
  .total td { font-weight: bold; }
  .controle { width: 90px; }
  .juste { color: var(--c-ok); font-weight: bold; }
  .faux { color: var(--c-erreur); font-weight: bold; }
  .consigne { margin: 0 0 6px; }
  .petit { font-size: var(--t-12); }
  .defile { overflow-x: auto; }
  .interpretation { display: grid; gap: 12px; }
  .interpretation label { display: flex; flex-direction: column; gap: 6px; font-weight: bold; }
  .ligne-champ { display: flex; gap: 12px; align-items: center; font-weight: normal; }
  .interpretation select { min-width: 320px; }
  .interpretation textarea { font: inherit; font-weight: normal; padding: 6px 8px; border: 1px solid var(--c-bordure); border-radius: var(--r-2); }
</style>
