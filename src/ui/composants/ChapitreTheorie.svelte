<!-- Contenu d'un chapitre de théorie (sections et blocs) : rubrique Théorie et parcours Apprendre.
     Modèle enrichi du 24.11.2026 : termes, exemple résolu, cas contrastés, erreurs fréquentes, compte en T, bilan,
     questions à réponse masquée, liens pour s'exercer. -->
<script lang="ts">
  import type { Chapitre, ExempleEcriture, LigneExemple, PosteSchema } from '../../data/theorie';
  import { formatMontant } from '../../engine/money';
  import { MODULES } from '../../data/apprendre';
  import { exercicesDemo } from '../../data/demos';
  import { etat } from '../etat.svelte';

  let { chapitre, intitules }: { chapitre: Chapitre; intitules: Map<string, string> } = $props();

  const compte = (n: string | null) => (n ? `${intitules.get(n) ?? n}` : '');
  const fr = (francs: number) => formatMontant(Math.round(francs * 100));
  const total = (postes: PosteSchema[]) => postes.reduce((t, x) => t + x.montant, 0);

  /** Une ligne simple affiche les deux comptes ; les lignes d'une écriture composée n'en affichent qu'un. */
  function lignes(e: ExempleEcriture) {
    return e.lignes.map((l) => ({ debit: l.debit, credit: l.credit, montant: fr(l.montant) }));
  }
  const titreModule = (id: string) => MODULES.find((m) => m.id === id)?.titre ?? id;
  const titreExercice = (id: string) => exercicesDemo.find((e) => e.id === id)?.titre ?? id;
</script>

{#snippet ecriture(ls: LigneExemple[])}
  <table class="ecritures empile">
    <thead><tr><th>Débit</th><th>Crédit</th><th class="montant">Montant</th></tr></thead>
    <tbody>
      {#each ls as l}
        <tr>
          <td data-etiquette={l.debit ? 'Débit' : undefined}>{#if l.debit}{compte(l.debit)} <span class="numero">{l.debit}</span>{/if}</td>
          <td data-etiquette={l.credit ? 'Crédit' : undefined}>{#if l.credit}{compte(l.credit)} <span class="numero">{l.credit}</span>{/if}</td>
          <td class="montant num" data-etiquette="Montant">{fr(l.montant)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

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
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div class="defile" tabindex="0" role="group" aria-label={`Tableau : ${b.entetes.filter(Boolean).join(', ')}`}>
          <table class="tableau">
            <thead><tr>{#each b.entetes as e}<th>{e}</th>{/each}</tr></thead>
            <tbody>{#each b.lignes as l}<tr>{#each l as cel}<td>{cel}</td>{/each}</tr>{/each}</tbody>
          </table>
        </div>
      {:else if b.type === 'ecritures'}
        {#if b.titre}<p class="titre-ex">{b.titre}</p>{/if}
        <table class="ecritures empile">
          <thead>
            <tr><th>Opération</th><th>Débit</th><th>Crédit</th><th class="montant">Montant</th></tr>
          </thead>
          <tbody>
            {#each b.exemples as ex}
              {#each lignes(ex) as l, i}
                <tr class:suite={i > 0}>
                  <td class="large">{i === 0 ? ex.cas : ''}</td>
                  <td data-etiquette={l.debit ? 'Débit' : undefined}>{#if l.debit}{compte(l.debit)} <span class="numero">{l.debit}</span>{/if}</td>
                  <td data-etiquette={l.credit ? 'Crédit' : undefined}>{#if l.credit}{compte(l.credit)} <span class="numero">{l.credit}</span>{/if}</td>
                  <td class="montant num" data-etiquette="Montant">{l.montant}</td>
                </tr>
              {/each}
            {/each}
          </tbody>
        </table>
      {:else if b.type === 'definitions'}
        <dl class="termes">
          {#each b.termes as t (t.terme)}<div><dt>{t.terme}</dt><dd>{t.definition}</dd></div>{/each}
        </dl>
      {:else if b.type === 'exemple'}
        <div class="exemple">
          <p class="etiq">Exemple résolu</p>
          <p class="enonce">{b.enonce}</p>
          {#if b.raisonnement?.length}<ol class="raisonnement">{#each b.raisonnement as r}<li>{r}</li>{/each}</ol>{/if}
          {#if b.calcul?.length}<ul class="calcul">{#each b.calcul as c}<li>{c}</li>{/each}</ul>{/if}
          {#if b.lignes?.length}{@render ecriture(b.lignes)}{/if}
          {#if b.effets}
            <div class="effets">
              {#if b.effets.actif}<div><b>Bilan, actif</b>{b.effets.actif}</div>{/if}
              {#if b.effets.passif}<div><b>Bilan, passif</b>{b.effets.passif}</div>{/if}
              {#if b.effets.resultat}<div><b>Compte de résultat</b>{b.effets.resultat}</div>{/if}
            </div>
          {/if}
          {#if b.conclusion}<p>{b.conclusion}</p>{/if}
          {#if b.variante}
            <div class="variante">
              <p class="etiq">Variante</p>
              <p class="enonce">{b.variante.enonce}</p>
              {#each b.variante.texte ?? [] as t}<p>{t}</p>{/each}
              {#if b.variante.lignes?.length}{@render ecriture(b.variante.lignes)}{/if}
            </div>
          {/if}
        </div>
      {:else if b.type === 'contraste'}
        <div class="contraste">
          {#each b.cas as c (c.titre)}
            <div class="cas">
              <h4>{c.titre}</h4>
              {#each c.texte as t}<p>{t}</p>{/each}
              {#if c.lignes?.length}{@render ecriture(c.lignes)}{/if}
            </div>
          {/each}
        </div>
      {:else if b.type === 'erreurs'}
        <ul class="erreurs">
          {#each b.items as x (x.erreur)}<li><b>{x.erreur}</b> {x.correction}</li>{/each}
        </ul>
      {:else if b.type === 'compteT'}
        {@const somme = Math.max(total(b.debit), total(b.credit))}
        <div class="compte-t" role="img" aria-label={`Compte ${compte(b.compte)} : ${b.debit.map((x) => `${x.libelle} ${fr(x.montant)} au débit`).join(', ')} ; ${b.credit.map((x) => `${x.libelle} ${fr(x.montant)} au crédit`).join(', ')}.`}>
          <p class="nom-t">{compte(b.compte)}</p>
          <div class="t" aria-hidden="true">
            <div class="sens">Débit</div><div class="sens">Crédit</div>
            <div class="cote gauche">{#each b.debit as x}<div class="l"><span>{x.libelle}</span><span class="num">{fr(x.montant)}</span></div>{/each}</div>
            <div class="cote">{#each b.credit as x}<div class="l"><span>{x.libelle}</span><span class="num">{fr(x.montant)}</span></div>{/each}</div>
            <div class="tot gauche num">{fr(somme)}</div><div class="tot num">{fr(somme)}</div>
          </div>
        </div>
      {:else if b.type === 'bilan'}
        <div class="bilan-dessine">
          <p class="titre-ex">{b.titre}</p>
          <div class="deux">
            {#each [{ nom: 'Actif', postes: b.actif }, { nom: 'Passif', postes: b.passif }] as cote (cote.nom)}
              <table>
                <thead><tr><th>{cote.nom}</th><th class="montant">CHF</th></tr></thead>
                <tbody>
                  {#each cote.postes as x}<tr><td>{x.libelle}</td><td class="montant num">{fr(x.montant)}</td></tr>{/each}
                  <tr class="total"><td>Total</td><td class="montant num">{fr(total(cote.postes))}</td></tr>
                </tbody>
              </table>
            {/each}
          </div>
        </div>
      {:else if b.type === 'questions'}
        <div class="questions">
          {#each b.items as q (q.question)}
            <details>
              <summary>{q.question}</summary>
              <p>{q.reponse}</p>
            </details>
          {/each}
        </div>
      {:else if b.type === 'liens'}
        <ul class="liens">
          {#if b.module}
            <li>Parcours guidé : <button class="btn-lien" onclick={() => etat.ouvrirRubrique('apprendre')}>module « {titreModule(b.module)} » de l'onglet Apprendre</button></li>
          {/if}
          {#each b.exercices ?? [] as id (id)}
            <li>Exercice : <a href={`?exercice=${id}`}>{titreExercice(id)}</a></li>
          {/each}
        </ul>
      {/if}
    {/each}
  {/each}
</div>

<style>
  .chapitre-theorie :global(p), .chapitre-theorie :global(li) { max-width: 80ch; line-height: 1.5; }
  h3 { font-size: var(--t-15); color: var(--c-structure); margin: 20px 0 6px; }
  h4 { font-size: var(--t-15); color: var(--c-encre); margin: 0; }
  .retenir { border-left: 4px solid var(--c-structure); background: var(--c-zebra); padding: 8px 12px; }
  .titre-ex { font-weight: bold; margin-bottom: 4px; }
  table.tableau, table.ecritures { margin: 6px 0 12px; }
  .tableau td, .ecritures td { vertical-align: top; }
  .tableau tbody tr:nth-child(even) { background: var(--c-zebra); }
  .ecritures tbody tr:not(.suite) td { border-top: 1px solid var(--c-bordure); }
  .ecritures tbody tr:first-child td { border-top: none; }
  .numero { font-size: var(--t-12); color: var(--c-texte-2); font-variant-numeric: tabular-nums; }
  .montant { text-align: right; white-space: nowrap; }
  .defile { overflow-x: auto; }
  .etiq { font-size: var(--t-12); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--c-structure); margin: 0; }
  dl.termes { margin: 6px 0 12px; display: grid; gap: 6px; }
  dl.termes div { max-width: 80ch; }
  dl.termes dt { display: inline; font-weight: var(--graisse-fort); color: var(--c-encre); }
  dl.termes dt::after { content: ' : '; font-weight: 400; }
  dl.termes dd { display: inline; margin: 0; }
  .exemple { background: var(--c-bleu-doux); border-radius: var(--r-3); padding: var(--e-4); margin: 8px 0 12px; display: grid; gap: var(--e-2); }
  .exemple > *, .variante > *, .cas > * { min-width: 0; margin-top: 0; margin-bottom: 0; }
  .exemple :global(table) { background: var(--c-fond); border-radius: var(--r-2); }
  .enonce { font-weight: 600; }
  .raisonnement, .calcul { margin: 0; padding-left: 22px; }
  .effets { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: var(--e-2); }
  .effets div { background: var(--c-fond); border: 1px solid var(--c-bordure-2); border-radius: var(--r-2); padding: var(--e-2) var(--e-3); font-size: var(--t-14); }
  .effets b { display: block; font-size: var(--t-12); color: var(--c-texte-2); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .variante { border-top: 1px dashed var(--c-bordure); padding-top: var(--e-3); display: grid; gap: var(--e-2); }
  .contraste { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--e-3); margin: 8px 0 12px; }
  .cas { border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); padding: var(--e-3) var(--e-4); display: grid; gap: var(--e-2); align-content: start; }
  .erreurs { list-style: none; margin: 6px 0 12px; padding: 0; display: grid; gap: var(--e-2); }
  .erreurs li { border: 1px solid var(--c-bordure-2); border-left: 4px solid var(--c-erreur); border-radius: var(--r-2); padding: var(--e-2) var(--e-3); max-width: none; }
  .erreurs b { color: var(--c-erreur); }
  .compte-t { border: 1px solid var(--c-bordure); border-radius: var(--r-1); padding: var(--e-3); max-width: min(520px, 100%); min-width: 0; margin: 8px 0 12px; background: var(--c-fond); }
  .nom-t { text-align: center; font-weight: var(--graisse-fort); color: var(--c-structure); margin: 0 0 var(--e-2); }
  .t { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .sens { text-align: center; font-size: var(--t-12); color: var(--c-texte-2); border-bottom: 2px solid var(--c-texte); padding-bottom: 3px; }
  .cote { padding: var(--e-2) var(--e-3); display: grid; gap: 3px; align-content: start; font-size: var(--t-14); }
  .gauche { border-right: 2px solid var(--c-texte); }
  .l { display: flex; justify-content: space-between; gap: 2px var(--e-2); flex-wrap: wrap; }
  .l span { min-width: 0; }
  .l span:last-child { margin-left: auto; }
  .l span:first-child { color: var(--c-texte-2); font-size: var(--t-13); }
  .tot { border-top: 1px solid var(--c-texte); font-weight: var(--graisse-fort); text-align: right; padding: 3px var(--e-3) 0; }
  .bilan-dessine { margin: 8px 0 12px; }
  .deux { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--e-3); align-items: start; }
  .deux table { border: 1px solid var(--c-bordure-2); }
  .questions { display: grid; gap: var(--e-2); margin: 6px 0 12px; }
  details { border: 1px solid var(--c-bordure-2); border-radius: var(--r-2); padding: var(--e-2) var(--e-3); background: var(--c-fond); }
  summary { cursor: pointer; font-weight: var(--graisse-moyen); }
  details p { margin: var(--e-2) 0 0; }
  .liens { margin: 6px 0 12px; }
  .liens a { color: var(--c-structure); text-underline-offset: 3px; }
  @media (max-width: 700px) {
    .contraste, .deux { grid-template-columns: minmax(0, 1fr); }
    .exemple { padding: var(--e-3); }
    .compte-t { padding: var(--e-2); }
    .cote { padding: var(--e-2); }
    .ecritures.empile tbody tr.suite { border-top: 0; padding-top: 0; }
  }
</style>
