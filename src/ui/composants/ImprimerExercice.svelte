<!--
  Imprimer l'énoncé et le corrigé d'un exercice (phase V2, écran V2.5 de la maquette validée le 27.11.2026) : pour
  l'enseignant qui distribue ses énoncés sur papier. L'énoncé porte le code de l'exercice ; l'élève le tape dans
  « Nouveau dossier, énoncé sur papier », et sa copie se corrige ensuite dans l'onglet « Copies ».
  Les PDF sont créés dans le navigateur (jsPDF chargé à la demande), rien n'est envoyé en ligne.
-->
<script lang="ts">
  import type { Exercice } from '../../engine/exercice';
  import { codeExercice, type VarianteCode } from '../../engine/papier';
  import { plan } from '../../data/plan';
  import { nomFichier } from '../../io/fichiers';
  import { telechargerBlob } from '../fichiers-navigateur';
  import type { TableauComplement } from '../../pdf/dossier';

  let { ex, complements }: { ex: Exercice; complements?: TableauComplement[] } = $props();

  /** « logiciel » : l'énoncé dit d'ouvrir l'exercice dans le logiciel ; sinon énoncé papier, avec son code. */
  let forme = $state<'fourni' | 'saisi' | 'logiciel'>('fourni');
  let enCours = $state<'enonce' | 'corrige' | null>(null);
  let erreur = $state('');
  const aCorrige = $derived((ex.corrige?.length ?? 0) > 0);

  async function imprimer(quoi: 'enonce' | 'corrige') {
    erreur = '';
    enCours = quoi;
    try {
      const m = await import('../../pdf/dossier');
      if (quoi === 'enonce') {
        const nom = nomFichier([ex.raisonSociale, 'enonce'], '.pdf');
        telechargerBlob(nom, await m.genererPdfDossier(ex, plan, nom, forme === 'logiciel' ? undefined : (forme as VarianteCode)));
      } else {
        const nom = nomFichier([ex.raisonSociale, 'corrige'], '.pdf');
        telechargerBlob(nom, await m.genererPdfCorrige(ex, plan, nom, complements));
      }
    } catch (e) {
      erreur = `Le PDF n'a pas pu être créé : ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      enCours = null;
    }
  }
</script>

<div class="imprimer">
  <fieldset>
    <legend>Énoncé à imprimer</legend>
    <label><input type="radio" bind:group={forme} value="fourni" /> Papier, bilan d'ouverture fourni par le logiciel · code <b class="num">{codeExercice(ex, 'fourni')}</b></label>
    <label><input type="radio" bind:group={forme} value="saisi" /> Papier, bilan d'ouverture à saisir par l'élève · code <b class="num">{codeExercice(ex, 'saisi')}</b></label>
    <label><input type="radio" bind:group={forme} value="logiciel" /> Exercice à ouvrir dans le logiciel (pas de code)</label>
  </fieldset>
  <div class="boutons">
    <button class="btn btn-principal" disabled={enCours !== null || ex.operations.length === 0} onclick={() => imprimer('enonce')}>{enCours === 'enonce' ? 'Création…' : "Imprimer l'énoncé (PDF)"}</button>
    <button class="btn" disabled={enCours !== null || !aCorrige} onclick={() => imprimer('corrige')}>{enCours === 'corrige' ? 'Création…' : 'Imprimer le corrigé (PDF)'}</button>
  </div>
  {#if ex.operations.length === 0}<p class="discret petit">Ajoutez d'abord des opérations à l'énoncé.</p>{:else if !aCorrige}<p class="discret petit">Le corrigé n'est pas encore saisi.</p>{/if}
  {#if erreur}<div class="alerte" role="alert">{erreur}</div>{/if}
</div>

<style>
  .imprimer { display: flex; flex-direction: column; gap: var(--e-3); }
  fieldset { border: 0; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--e-2); }
  legend { font-weight: var(--graisse-fort); margin-bottom: var(--e-2); }
  label { display: flex; gap: var(--e-2); align-items: baseline; flex-wrap: wrap; }
  input[type='radio'] { width: 20px; height: 20px; flex: none; align-self: center; }
  .boutons { display: flex; gap: var(--e-2); flex-wrap: wrap; }
  .petit { font-size: var(--t-13); margin: 0; }
</style>
