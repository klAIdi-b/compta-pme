<!--
  Panneau « Distribuer » (phase V3, maquette public/maquettes/distribution-classe.html, écran V3.1, validée le
  27.11.2026) : les quatre façons de donner un exercice aux élèves, du plus simple au plus complet. Le lien contient
  l'exercice après « # » (rien n'est envoyé à un serveur) ; le code QR contient ce lien (exercices courts seulement) ;
  le fichier et le paquet de classe pour Google Classroom ; l'énoncé papier (phase V2). En évaluation, le corrigé n'est
  ni dans le lien ni dans le fichier.
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { Exercice, Mode } from '../../engine/exercice';
  import { controlerExercice, LIBELLES_MODE } from '../../engine/exercice';
  import { operationsNonReecrites } from '../../engine/variante';
  import { plan } from '../../data/plan';
  import { EXT_EXERCICE, exporterExercice, nomFichier } from '../../io/fichiers';
  import { lienExercice, tailleQr } from '../../io/lien-exercice';
  import { telecharger, telechargerBlob } from '../fichiers-navigateur';
  import ImprimerExercice from './ImprimerExercice.svelte';

  let { ex, fermer }: { ex: Exercice; fermer: () => void } = $props();

  // Mode proposé : celui de l'exercice à l'ouverture du panneau (le panneau est recréé pour un autre exercice).
  let mode = $state<Mode>(untrack(() => ex.mode));
  const aDistribuer = $derived<Exercice>({ ...ex, mode });
  const erreurs = $derived(controlerExercice(aDistribuer, plan).erreurs);
  const nonReecrites = $derived(operationsNonReecrites(ex));
  const base = `${location.origin}${location.pathname.replace(/index\.html$/, '')}`;

  let lien = $state('');
  let qr = $state<{ svg: string; confortable: boolean } | null>(null);
  let qrImpossible = $state(false);
  let copie = $state('');
  let grand = $state(false);

  // Lien et code QR recalculés quand le mode change (le corrigé n'est pas dans le lien en évaluation).
  $effect(() => {
    const e = aDistribuer;
    let annule = false;
    lien = '';
    qr = null;
    qrImpossible = false;
    (async () => {
      const l = await lienExercice(base, $state.snapshot(e) as Exercice);
      if (annule) return;
      lien = l;
      const t = tailleQr(l);
      if (!t.possible) {
        qrImpossible = true;
        return;
      }
      const { default: qrcode } = await import('qrcode-generator');
      const q = qrcode(0, 'L');
      q.addData(l, 'Byte');
      q.make();
      if (!annule) qr = { svg: q.createSvgTag({ cellSize: 4, margin: 4, scalable: true }), confortable: t.confortable };
    })();
    return () => {
      annule = true;
    };
  });

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(lien);
      copie = 'Lien copié : collez-le dans le devoir Classroom ou dans un message.';
    } catch {
      copie = 'La copie automatique est bloquée par le navigateur : sélectionnez le lien et copiez-le.';
    }
  }

  function fichier() {
    telecharger(nomFichier([ex.titre], EXT_EXERCICE), exporterExercice(aDistribuer));
  }

  const consigne = $derived(
    [
      `Exercice « ${ex.titre} » (${LIBELLES_MODE[mode]}).`,
      '',
      `1. Ouvrez ce lien : ${lien}`,
      `   ou ouvrez Compta PME, « Comptabilité », « Ouvrir un fichier… », et choisissez le fichier joint au devoir.`,
      '2. Indiquez votre prénom, votre nom et votre classe, puis cliquez sur « Commencer ».',
      '3. À la fin, cliquez sur « Exporter ma copie » et rendez le fichier dans ce devoir.',
    ].join('\n'),
  );

  async function paquet() {
    const { creerZip } = await import('../../io/zip');
    const e = new TextEncoder();
    const fichiers = [
      { nom: nomFichier([ex.titre], EXT_EXERCICE), donnees: e.encode(exporterExercice(aDistribuer)) },
      { nom: 'lien.txt', donnees: e.encode(lien) },
      { nom: 'consigne-classroom.txt', donnees: e.encode(consigne) },
      ...(qr ? [{ nom: 'code-qr.svg', donnees: e.encode(qr.svg) }] : []),
    ];
    telechargerBlob(nomFichier([ex.titre, 'paquet-classe'], '.zip'), new Blob([creerZip(fichiers)], { type: 'application/zip' }));
  }

  function toucheGrand(ev: KeyboardEvent) {
    if (ev.key === 'Escape' && grand) grand = false;
  }
</script>

<svelte:window onkeydown={toucheGrand} />

<section class="carte distribuer" aria-labelledby="titre-distribuer">
  <header>
    <h2 id="titre-distribuer">Distribuer · {ex.titre || 'Sans titre'}</h2>
    <button class="btn" onclick={fermer}>Fermer</button>
  </header>
  <div class="corps-carte">
    <div class="ligne-mode" role="group" aria-label="Mode">
      {#each ['entrainement', 'formative', 'evaluation'] as const as m}
        <button class="seg" aria-pressed={mode === m} onclick={() => (mode = m)}>{LIBELLES_MODE[m]}</button>
      {/each}
    </div>
    <p class="discret petit">
      {mode === 'evaluation'
        ? "Évaluation : aucun retour pendant la saisie ; le corrigé n'est ni dans le lien ni dans le fichier."
        : mode === 'formative'
          ? "Évaluation formative : correction montrée à l'élève quand il termine ; corrigé encodé."
          : 'Entraînement : correction à chaque écriture ; corrigé encodé.'}
    </p>
    {#if erreurs.length}
      <div class="alerte" role="alert">L'exercice contient des erreurs : ouvrez-le pour les corriger avant de le distribuer.<ul>{#each erreurs as e}<li>{e}</li>{/each}</ul></div>
    {:else}
      {#if nonReecrites.length}
        <p class="message avert">Variante : les opérations {nonReecrites.join(', ')} ont encore le texte de l'exercice public. Un élève qui le connaît retrouvera le corrigé.</p>
      {/if}
      <div class="options">
        <div class="option">
          <h3>1 · Lien à donner</h3>
          <input class="champ lien" readonly value={lien || 'Préparation du lien…'} aria-label="Lien de l'exercice" onfocus={(e) => (e.currentTarget as HTMLInputElement).select()} />
          <div class="boutons"><button class="btn btn-principal" disabled={!lien} onclick={copierLien}>Copier le lien</button></div>
          {#if copie}<p class="petit" role="status">{copie}</p>{/if}
          <p class="discret petit">L'exercice est dans le lien ({lien ? `${(new TextEncoder().encode(lien).length / 1000).toFixed(1)} ko` : '…'}) : rien n'est envoyé à un serveur.</p>
        </div>
        <div class="option">
          <h3>2 · Code QR à projeter</h3>
          {#if qr}
            <div class="qr-ligne">
              <div class="qr" aria-label="Code QR du lien" role="img">{@html qr.svg}</div>
              <div>
                <div class="boutons">
                  <button class="btn" onclick={() => (grand = true)}>Projeter en grand</button>
                  <button class="btn" onclick={() => telechargerBlob(nomFichier([ex.titre, 'code-qr'], '.svg'), new Blob([qr!.svg], { type: 'image/svg+xml' }))}>Image (SVG)</button>
                </div>
                <p class="discret petit">{qr.confortable ? 'Les élèves le scannent avec la caméra du téléphone ou de la tablette.' : 'Exercice assez long : projetez le code en grand, les élèves le scannent de près.'}</p>
              </div>
            </div>
          {:else if qrImpossible}
            <p class="message information">Cet exercice est trop long pour un code QR. Donnez le lien ou le fichier.</p>
          {:else}
            <p class="discret petit">Préparation du code QR…</p>
          {/if}
        </div>
        <div class="option">
          <h3>3 · Fichier pour Classroom</h3>
          <p class="discret petit">Le fichier {EXT_EXERCICE}, à joindre au devoir. Toujours possible, quelle que soit la taille de l'exercice.</p>
          <div class="boutons">
            <button class="btn" onclick={fichier}>Télécharger le fichier</button>
            <button class="btn" disabled={!lien} onclick={paquet}>Paquet de classe (ZIP)</button>
          </div>
          <p class="discret petit">Paquet de classe : le fichier, le lien, le code QR en image et la consigne prête à coller dans Classroom.</p>
        </div>
        <div class="option">
          <h3>4 · Énoncé sur papier</h3>
          <ImprimerExercice ex={aDistribuer} />
        </div>
      </div>
    {/if}
  </div>
</section>

{#if grand && qr}
  <div class="grand" role="dialog" aria-modal="true" aria-label="Code QR en grand">
    <p class="titre-grand">{ex.titre}</p>
    <div class="qr-grand">{@html qr.svg}</div>
    <button class="btn" onclick={() => (grand = false)}>Fermer (Échap)</button>
  </div>
{/if}

<style>
  .distribuer { margin-bottom: var(--e-4); }
  .distribuer > header { display: flex; justify-content: space-between; align-items: center; gap: var(--e-3); padding: 14px 18px; border-bottom: 1px solid var(--c-bordure-3); }
  .corps-carte { display: flex; flex-direction: column; gap: var(--e-3); }
  .ligne-mode { display: flex; gap: var(--e-1); flex-wrap: wrap; }
  .seg { font: inherit; font-size: var(--t-14); padding: 0 var(--e-3); min-height: var(--h-cible); border: 1px solid var(--c-bordure-2); border-radius: 999px; background: var(--c-fond); color: var(--c-texte-2); cursor: pointer; }
  .seg[aria-pressed='true'] { background: var(--c-structure); color: #fff; border-color: var(--c-structure); }
  .options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--e-4); }
  .option { min-width: 0; border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); padding: var(--e-3) var(--e-4); display: flex; flex-direction: column; gap: var(--e-2); }
  .option h3 { margin: 0; font-size: var(--t-15); color: var(--c-encre); }
  .lien { width: 100%; font-size: var(--t-13); }
  .boutons { display: flex; gap: var(--e-2); flex-wrap: wrap; }
  .petit { font-size: var(--t-13); margin: 0; }
  .qr-ligne { display: flex; gap: var(--e-3); align-items: flex-start; }
  .qr { width: 132px; height: 132px; flex: none; border: 1px solid var(--c-bordure-2); background: #fff; }
  .qr :global(svg), .qr-grand :global(svg) { width: 100%; height: 100%; display: block; }
  .grand { position: fixed; inset: 0; z-index: 100; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--e-4); padding: var(--e-5); }
  .titre-grand { font-size: var(--t-26); font-weight: var(--graisse-fort); color: var(--c-encre); margin: 0; text-align: center; }
  .qr-grand { width: min(80vh, 90vw); height: min(80vh, 90vw); }
  @media (max-width: 860px) { .options { grid-template-columns: minmax(0, 1fr); } .qr-ligne { flex-direction: column; } }
</style>
