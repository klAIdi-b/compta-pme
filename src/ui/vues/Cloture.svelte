<!--
  Clôture de l'exercice (phase V5, maquette public/maquettes/annees-comptables.html, écrans V5.2 et V5.3, validée le
  27.11.2026). Contrôles calculés d'après le dossier de l'élève, puis « Clôturer et ouvrir l'exercice suivant ». Après
  l'ouverture : le bilan d'ouverture, compte par compte, à côté du bilan de clôture, et « Annuler l'ouverture » tant que
  la nouvelle année est vide. Aucune règle nouvelle : la réouverture est celle du moteur (`reouvrir`).
-->
<script lang="ts">
  import { dialogue } from '../dialogue.svelte';
  import { etat, type Vue } from '../etat.svelte';
  import { controlesCloture, peutCloturer, reportOuverture, type CleControle } from '../../engine/cloture';
  import { avancementSession, avecCorrection } from '../avancement';
  import { statutExport } from '../../io/fichiers';
  import { libellesSoldes, m } from '../format';
  import { vueEleve } from '../modes';

  const s = $derived(etat.session!);
  const d = $derived(s.dossier);
  const annee = $derived(Number(d.fin.slice(0, 4)));
  const exerciceEnonce = $derived(d.debut === s.exercice.debut);
  const av = $derived(exerciceEnonce ? avancementSession(s) : null);
  const copieAJour = $derived(
    etat.genre === 'travail' ? statutExport(d, $state.snapshot(s.fiches), s.dernierExport) === 'a-jour' : null,
  );
  const controles = $derived(controlesCloture(s.exercice, d, av, avecCorrection(s), exerciceEnonce ? copieAJour : null));
  const possible = $derived(peutCloturer(s.exercice, d) && vueEleve(etat.genre) && !etat.verrouille);
  const precedente = $derived(s.archives.at(-1) ?? null);
  const report = $derived(precedente ? reportOuverture(precedente, d) : []);
  const nouvelleAnneeVide = $derived(!d.ecritures.some((e) => !e.automatique));
  const nom = $derived(new Map(d.plan.map((c) => [c.numero, c.intitule])));
  const libelles = $derived(libellesSoldes(s.exercice.parametres.libellesT));
  const total = (cle: 'cloture' | 'ouverture') => report.filter((l) => l[cle] > 0).reduce((t, l) => t + l[cle], 0);

  const TITRES: Record<CleControle, string> = {
    operations: "Opérations de l'énoncé",
    aRevoir: 'Écritures à revoir',
    horsEnonce: 'Pièces hors énoncé',
    balance: 'Balance',
    bouclement: 'Bouclement',
    copie: 'Copie',
  };
  const LIENS: Partial<Record<CleControle, { vue: Vue; libelle: string }>> = {
    operations: { vue: 'journal', libelle: 'Journal' },
    aRevoir: { vue: 'journal', libelle: 'Journal' },
    horsEnonce: { vue: 'journal', libelle: 'Journal' },
    balance: { vue: 'balance', libelle: 'Balance' },
    bouclement: { vue: 'bouclement', libelle: 'Bouclement' },
  };

  let erreur = $state('');
  async function cloturer() {
    erreur = '';
    const ok = await dialogue.demander({
      titre: `Clôturer l'exercice ${annee} et ouvrir ${annee + 1} ?`,
      texte: [
        `L'exercice ${annee} restera consultable, mais plus rien ne pourra y être modifié.`,
        `Le bilan de clôture deviendra le bilan d'ouverture du 01.01.${annee + 1}.`,
        ...(copieAJour === false && exerciceEnonce ? ["Votre copie n'est pas à jour : exportez-la d'abord si vous devez la rendre."] : []),
      ],
      confirmer: `Clôturer et ouvrir ${annee + 1}`,
    });
    if (!ok) return;
    const r = etat.ouvrirAnneeSuivante();
    if (!r.ok) erreur = r.erreurs.join(' ');
  }

  async function annuler() {
    const ok = await dialogue.demander({
      titre: `Annuler l'ouverture de l'exercice ${annee} ?`,
      texte: [`L'exercice ${annee - 1} redevient l'exercice en cours.`],
      confirmer: "Annuler l'ouverture",
    });
    if (ok && !etat.annulerOuverture()) erreur = "L'ouverture ne peut plus être annulée : des écritures ont été passées dans la nouvelle année.";
  }
</script>

<div class="titre">
  <h1>Clôture de l'exercice {annee}</h1>
  <span class="sous">{d.raisonSociale} · ce qu'il faut avoir fait avant d'ouvrir l'année suivante</span>
</div>

{#if precedente}
  <section class="carte report" aria-labelledby="titre-report">
    <header class="tete">
      <h2 id="titre-report">Bilan d'ouverture au {d.debut.split('-').reverse().join('.')}</h2>
      {#if nouvelleAnneeVide && vueEleve(etat.genre)}<button class="btn-lien" onclick={annuler}>Annuler l'ouverture</button>{/if}
    </header>
    <p class="explication">
      Chaque compte de bilan reprend son solde de clôture de {annee - 1}. Les comptes de charges et de produits repartent de
      zéro{s.exercice.parametres.modeBouclement === 'compteDeResultat' ? ' ; le résultat est déjà viré par les écritures de bouclement' : ' ; le capital reçoit le résultat et le compte privé'}.
    </p>
    <table class="empile report-table">
      <thead><tr><th>Compte</th><th class="montant">{libelles.final} au {precedente.fin.split('-').reverse().join('.')}</th><th class="montant">{libelles.initial} au {d.debut.split('-').reverse().join('.')}</th></tr></thead>
      <tbody>
        {#each report as l (l.compte)}
          <tr class:different={l.cloture !== l.ouverture}>
            <td data-etiquette="Compte">{nom.get(l.compte) ?? l.compte} <span class="num discret">{l.compte}</span></td>
            <td data-etiquette={libelles.final} class="montant num">{m(Math.abs(l.cloture))}</td>
            <td data-etiquette={libelles.initial} class="montant num">{m(Math.abs(l.ouverture))}</td>
          </tr>
        {/each}
      </tbody>
      <tfoot><tr><td>Total de l'actif = total du passif</td><td class="montant num">{m(total('cloture'))}</td><td class="montant num">{m(total('ouverture'))}</td></tr></tfoot>
    </table>
  </section>
{/if}

<section class="carte" aria-label="Contrôles avant la clôture">
  <ul class="controles">
    {#each controles as c (c.cle)}
      <li class:ok={c.ok}>
        <span class="marque-etat" aria-hidden="true">{c.ok ? '✓' : '!'}</span>
        <span><b>{TITRES[c.cle]}</b> · {c.texte}<span class="sr-only">{c.ok ? ' (fait)' : ' (à faire)'}</span></span>
        {#if LIENS[c.cle]}<button class="btn-lien" onclick={() => etat.aller(LIENS[c.cle]!.vue)}>{LIENS[c.cle]!.libelle}</button>{:else}<span></span>{/if}
      </li>
    {/each}
  </ul>
</section>

<section class="carte">
  <div class="corps-carte action">
    <p>
      L'exercice {annee} sera clôturé : il restera consultable, mais plus rien ne pourra y être modifié. Le bilan de clôture
      deviendra le bilan d'ouverture du 01.01.{annee + 1}. C'est facultatif : l'exercice de l'énoncé est terminé une fois le
      bouclement passé.
    </p>
    <button class="btn btn-principal" disabled={!possible} onclick={cloturer}>Clôturer et ouvrir l'exercice {annee + 1}</button>
  </div>
  {#if !possible && vueEleve(etat.genre)}<p class="discret petit">Disponible quand les écritures de bouclement sont passées au journal.</p>{/if}
  {#if erreur}<div class="alerte" role="alert">{erreur}</div>{/if}
</section>

<style>
  section { margin-bottom: 16px; }
  .controles { list-style: none; margin: 0; padding: 0; }
  .controles li { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; gap: var(--e-3); align-items: center; padding: var(--e-3) var(--e-4); border-bottom: 1px solid var(--c-bordure-3); }
  .marque-etat { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: var(--t-13); background: var(--c-avert-fond); color: var(--c-avert); }
  .controles li.ok .marque-etat { background: var(--c-succes-fond); color: var(--c-succes); }
  .action { display: flex; justify-content: space-between; align-items: center; gap: var(--e-4); flex-wrap: wrap; }
  .action p { margin: 0; max-width: 62ch; }
  .petit { font-size: var(--t-13); margin: 0 var(--e-4) var(--e-3); }
  .tete { display: flex; justify-content: space-between; align-items: center; gap: var(--e-3); padding: 14px 18px; border-bottom: 1px solid var(--c-bordure-3); flex-wrap: wrap; }
  .tete h2 { margin: 0; }
  .explication { margin: var(--e-3) 18px; color: var(--c-texte-2); font-size: var(--t-14); }
  .report-table { width: 100%; }
  .report-table tr.different td { background: var(--c-bleu-doux); }
  .report-table tfoot td { font-weight: var(--graisse-fort); }
  @media (max-width: 600px) {
    .controles li { grid-template-columns: 28px minmax(0, 1fr); }
    .controles li > :last-child { grid-column: 2; justify-self: start; }
  }
</style>
