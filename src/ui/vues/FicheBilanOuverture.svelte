<!-- Bilan d'ouverture : l'élève classe chaque compte dans sa masse, puis calcule les totaux et la fortune nette. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { bilanOuverture, MASSES } from '../../engine/fiches-cfc';
  import { indexPlan } from '../../engine/dossier';
  import { formatMontant as m } from '../../engine/money';
  import FicheCalcul, { type SectionCalcul } from '../composants/FicheCalcul.svelte';

  const b = $derived(bilanOuverture(etat.exercice.ouvertureActif, etat.exercice.ouverturePassif));
  const plan = $derived(indexPlan(etat.dossier.plan));
  const entrainement = $derived(etat.retour);
  const session = etat.session!;
  if (!session.fiches.bilanOuverture) session.fiches.bilanOuverture = {};
  const saisies = session.fiches.bilanOuverture;

  const classes = $derived(b.postes.filter((p) => saisies[`masse:${p.numero}`]).length);
  const justes = $derived(b.postes.filter((p) => saisies[`masse:${p.numero}`] === p.masse).length);

  const sections = $derived<SectionCalcul[]>([
    {
      titre: 'Totaux et fortune nette',
      lignes: [
        ...MASSES.filter((x) => x.cle !== 'capitauxPropres').map((x) => ({
          cle: `total:${x.cle}`,
          libelle: x.titre,
          formule: 'somme des comptes classés dans cette masse',
          type: 'chf' as const,
          attendu: b.totaux[x.cle],
        })),
        { cle: 'totalActifs', libelle: 'Total des actifs', formule: 'actifs circulants + actifs immobilisés', type: 'chf', attendu: b.totalActifs, fort: true },
        { cle: 'capitauxEtrangers', libelle: 'Total des capitaux étrangers', formule: 'court terme + long terme', type: 'chf', attendu: b.capitauxEtrangers, fort: true },
        {
          cle: 'fortuneNette',
          libelle: 'Capitaux propres (fortune nette)',
          formule: 'actifs − capitaux étrangers ; un découvert s\'écrit avec un signe moins',
          type: 'chf',
          attendu: b.fortuneNette,
          fort: true,
        },
      ],
    },
  ]);
</script>

<div class="titre">
  <h1>Bilan d'ouverture</h1>
  <span class="sous">Classer les comptes dans les cinq masses, puis calculer la fortune nette</span>
</div>

<section class="carte">
  <h2>Classer les comptes</h2>
  <table>
    <thead>
      <tr>
        <th>Compte</th>
        <th class="montant" style="width:140px">Montant</th>
        <th style="width:270px">Masse du bilan</th>
        {#if entrainement}<th style="width:100px">Contrôle</th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each b.postes as p, i (p.numero)}
        {@const choix = saisies[`masse:${p.numero}`] ?? ''}
        <tr class:zebre={i % 2 === 1}>
          <td>{plan.get(p.numero)?.intitule ?? p.numero}{#if etat.prefs.numerosComptes}<span class="discret petit numero">{p.numero}</span>{/if}</td>
          <td class="montant">{m(p.montant)}</td>
          <td>
            <select class="champ" aria-label={`Masse du compte ${plan.get(p.numero)?.intitule ?? p.numero}`} bind:value={saisies[`masse:${p.numero}`]}>
              <option value="">Choisir…</option>
              {#each MASSES.filter((x) => x.cle !== 'capitauxPropres') as x (x.cle)}<option value={x.cle}>{x.titre}</option>{/each}
            </select>
          </td>
          {#if entrainement}
            <td class:juste={choix === p.masse} class:faux={choix !== '' && choix !== p.masse}>
              {choix === '' ? '' : choix === p.masse ? 'Juste' : 'À revoir'}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="discret petit pied">
    {classes} compte{classes > 1 ? 's' : ''} classé{classes > 1 ? 's' : ''} sur {b.postes.length}{#if entrainement && classes > 0}, dont {justes} juste{justes > 1 ? 's' : ''}{/if}.
    Le capital n'est pas donné : c'est la fortune nette à calculer ci-dessous.
  </p>
</section>

<FicheCalcul {sections} {saisies} {entrainement} />

<style>
  section { margin-bottom: 16px; }
  h2 { padding: 10px 14px; border-bottom: 1px solid var(--c-bordure-2); }
  select { width: 100%; }
  .pied { padding: 8px 14px; margin: 0; }
  .petit { font-size: var(--t-12); }
  .numero { margin-left: 6px; }
  .juste { color: var(--c-ok); font-weight: bold; }
  .faux { color: var(--c-erreur); font-weight: bold; }
</style>
