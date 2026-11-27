<!--
  Bilan d'ouverture saisi par l'élève (énoncé papier, phase V2 ; maquette public/maquettes/comptabilite-cours.html,
  écran V2.2, validée le 27.11.2026). L'élève recopie le bilan de la feuille : comptes choisis par leur nom, montants,
  totaux et différence en direct. Seul contrôle : actif = passif (et comptes de bilan du plan du cours). L'ouverture
  saisie n'est pas notée par défaut ; l'enseignant voit les écarts avec son corrigé.
-->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { comptesDisponibles, controlerOuverture, ouvertureDepuisBilan } from '../../engine/dossier';
  import type { Centimes } from '../../engine/money';
  import ChampCompte from '../composants/ChampCompte.svelte';
  import ChampMontant from '../composants/ChampMontant.svelte';
  import { m } from '../format';

  type Ligne = { cle: number; compte: string | null; montant: Centimes | null };
  let cle = 0;
  const lignesDe = (r: Record<string, Centimes>): Ligne[] => [...Object.entries(r).map(([compte, montant]) => ({ cle: ++cle, compte, montant })), { cle: ++cle, compte: null, montant: null }];

  const ex = etat.exercice;
  const fournie = !!ex.papier?.ouvertureFournie;
  let actif = $state<Ligne[]>(lignesDe(ex.ouvertureActif));
  let passif = $state<Ligne[]>(lignesDe(ex.ouverturePassif));
  let erreurs = $state<string[]>([]);
  let enregistre = $state(false);

  const comptes = $derived(comptesDisponibles(etat.dossier));
  const comptesActif = $derived(comptes.filter((c) => c.type === 'actif'));
  const comptesPassif = $derived(comptes.filter((c) => c.type === 'passif'));
  const total = (l: Ligne[]) => l.reduce((s, x) => s + (x.compte && x.montant ? x.montant : 0), 0);
  const totalActif = $derived(total(actif));
  const totalPassif = $derived(total(passif));
  const ecart = $derived(totalActif - totalPassif);

  /** Une ligne vide reste toujours en bas de chaque colonne, pour ajouter un compte sans bouton. */
  $effect(() => {
    for (const l of [actif, passif]) {
      const derniere = l[l.length - 1];
      if (derniere && (derniere.compte || derniere.montant !== null)) l.push({ cle: ++cle, compte: null, montant: null });
    }
  });

  function versBilan(l: Ligne[]): Record<string, Centimes> {
    const r: Record<string, Centimes> = {};
    for (const x of l) if (x.compte && x.montant) r[x.compte] = (r[x.compte] ?? 0) + x.montant;
    return r;
  }

  function valider() {
    enregistre = false;
    const a = versBilan(actif);
    const p = versBilan(passif);
    const err: string[] = [];
    if (!Object.keys(a).length || !Object.keys(p).length) err.push("Saisissez au moins un compte à l'actif et un compte au passif.");
    const doublons = Object.keys(a).filter((n) => n in p);
    if (doublons.length) err.push(`Le compte ${doublons.join(', ')} figure à l'actif et au passif.`);
    err.push(...controlerOuverture({ plan: etat.dossier.plan, ouverture: ouvertureDepuisBilan(a, p) }));
    erreurs = err;
    if (err.length) return;
    etat.majOuverture(a, p);
    enregistre = true;
    etat.aller('journal');
  }
</script>

<div class="titre">
  <div>
    <h1>Bilan d'ouverture</h1>
    <span class="sous">{etat.dossier.raisonSociale} · au {etat.dossier.debut.split('-').reverse().join('.')}{ex.papier?.code ? ` · code ${ex.papier.code}` : ''}</span>
  </div>
</div>

{#if fournie}
  <p class="message information">Le bilan d'ouverture a été rempli par le code de l'exercice. Vérifiez-le avec la feuille.</p>
{:else}
  <p class="message information">Recopiez le bilan d'ouverture de la feuille : choisissez chaque compte par son nom, puis son montant.</p>
{/if}

{#snippet colonne(titre: string, lignes: Ligne[], liste: typeof comptes, totalCol: number)}
  <section class="carte" aria-label={titre}>
    <h2>{titre}</h2>
    <table class="saisie-bilan">
      <thead><tr><th>Compte</th><th class="montant">Montant CHF</th><th><span class="sr-only">Retirer</span></th></tr></thead>
      <tbody>
        {#each lignes as l, i (l.cle)}
          <tr>
            <td><ChampCompte id={`ouv-${titre}-${l.cle}`} libelle={`${titre}, compte ${i + 1}`} comptes={liste} bind:valeur={l.compte} /></td>
            <td class="t-montant"><ChampMontant id={`ouv-m-${titre}-${l.cle}`} libelle={`${titre}, montant ${i + 1}`} bind:valeur={l.montant} /></td>
            <td>
              {#if i < lignes.length - 1}
                <button class="retirer" aria-label={`Retirer la ligne ${i + 1} (${titre})`} onclick={() => lignes.splice(i, 1)}>×</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
      <tfoot><tr><td>Total {titre === 'Actif' ? "de l'actif" : 'du passif'}</td><td class="montant num">{m(totalCol)}</td><td></td></tr></tfoot>
    </table>
  </section>
{/snippet}

<div class="deux-colonnes">
  {@render colonne('Actif', actif, comptesActif, totalActif)}
  {@render colonne('Passif', passif, comptesPassif, totalPassif)}
</div>

<div class="pied">
  <span role="status" aria-live="polite">
    {#if totalActif === 0 && totalPassif === 0}<span class="discret">Le total de l'actif doit être égal au total du passif.</span>
    {:else if ecart === 0}<span class="ok">Actif {m(totalActif)} = Passif {m(totalPassif)} · le bilan d'ouverture est équilibré.</span>
    {:else}<span class="ecart">Différence : {m(Math.abs(ecart))} ({ecart > 0 ? "l'actif dépasse le passif" : "le passif dépasse l'actif"}).</span>{/if}
  </span>
  <button class="btn btn-principal" onclick={valider}>Valider l'ouverture et passer au journal</button>
</div>
{#if erreurs.length}
  <div class="alerte" role="alert"><b>Le bilan d'ouverture n'a pas été enregistré :</b><ul>{#each erreurs as e}<li>{e}</li>{/each}</ul></div>
{/if}
{#if enregistre}<p class="message succes" role="status">Bilan d'ouverture enregistré.</p>{/if}

<style>
  .message { margin: 0 0 var(--e-4); }
  .deux-colonnes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--e-4); align-items: start; }
  .carte h2 { padding: var(--e-3) var(--e-4); border-bottom: 1px solid var(--c-bordure-3); }
  .saisie-bilan { width: 100%; border-collapse: collapse; }
  .saisie-bilan th { text-align: left; font-size: var(--t-13); color: var(--c-texte-2); padding: var(--e-2) var(--e-3); background: var(--c-fond-tete); }
  .saisie-bilan th.montant { text-align: right; }
  .saisie-bilan td { padding: 4px var(--e-3); vertical-align: middle; }
  .saisie-bilan .t-montant { width: 150px; }
  .saisie-bilan tfoot td { font-weight: var(--graisse-fort); border-top: 2px solid var(--c-bordure-2); padding: var(--e-2) var(--e-3); }
  .retirer { font: inherit; border: 0; background: none; color: var(--c-texte-2); cursor: pointer; min-width: 32px; min-height: 32px; border-radius: var(--r-2); }
  .retirer:hover { background: var(--c-fond-tete); color: var(--c-erreur); }
  .pied { display: flex; justify-content: space-between; align-items: center; gap: var(--e-4); flex-wrap: wrap; margin: var(--e-4) 0; }
  .ok { color: var(--c-succes); font-weight: 600; }
  .ecart { color: var(--c-erreur); font-weight: 600; }
  @media (max-width: 760px) {
    .deux-colonnes { grid-template-columns: minmax(0, 1fr); }
    /* Téléphone : le compte sur toute la largeur, le montant dessous. */
    .saisie-bilan thead { display: none; }
    .saisie-bilan, .saisie-bilan tbody, .saisie-bilan tfoot { display: block; width: 100%; }
    .saisie-bilan tfoot tr { display: flex; justify-content: space-between; }
    .saisie-bilan tbody tr { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px var(--e-2); padding: var(--e-2) var(--e-3); border-bottom: 1px solid var(--c-bordure-3); }
    .saisie-bilan tbody td { padding: 0; }
    .saisie-bilan tbody td:first-child { grid-column: 1 / -1; }
    .saisie-bilan .t-montant { width: auto; }
    .pied .btn { width: 100%; justify-content: center; }
  }
  @media (pointer: coarse) { .retirer { min-width: 44px; min-height: 44px; } }
</style>
