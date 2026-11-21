<!-- Simulateur, tableau de la partie : jouer en ligne (configuration, connexion, mise en ligne, relève des décisions). -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { simulations } from '../../simulation.svelte';
  import { empreinteAPublier, enLigne } from '../../simulation-en-ligne.svelte';
  import { lienGroupes, ErreurEnLigne } from '../../../io/simulation-en-ligne';

  let { id, termine }: { id: string; termine: boolean } = $props();

  const e = $derived(simulations.trouver(id)!);
  let url = $state(enLigne.config?.url ?? '');
  let cle = $state(enLigne.config?.cleAnon ?? '');
  let email = $state(enLigne.email);
  let message = $state(enLigne.messageConnexion);
  let erreurs = $state<string[]>([]);
  let occupe = $state(false);
  let modifierConfig = $state(!enLigne.configure);
  let derniereReleve = $state<string | null>(null);

  const lien = $derived(e.enLigne && enLigne.config ? lienGroupes(`${location.origin}${location.pathname}`, enLigne.config, e.enLigne.code) : '');

  async function agir(action: () => Promise<void>) {
    occupe = true;
    erreurs = [];
    try {
      await action();
    } catch (err) {
      erreurs = [err instanceof ErreurEnLigne ? err.message : 'Le service en ligne ne répond pas comme prévu. Réessayez, ou passez par les fichiers.'];
    } finally {
      occupe = false;
    }
  }

  function enregistrerConfig(ev: SubmitEvent) {
    ev.preventDefault();
    erreurs = enLigne.definirConfig({ url, cleAnon: cle });
    if (!erreurs.length) {
      modifierConfig = false;
      message = 'Configuration enregistrée.';
    }
  }

  function envoyerLien(ev: SubmitEvent) {
    ev.preventDefault();
    agir(async () => {
      await enLigne.envoyerLien(email);
      message = `Un lien de connexion a été envoyé à ${email}. Ouvrez-le sur ce poste, dans ce navigateur, puis revenez dans l'onglet Simulateur.`;
    });
  }

  function mettreEnLigne() {
    agir(async () => {
      await enLigne.mettreEnLigne(id);
      message = 'La partie est en ligne. Donnez aux groupes le lien et leur code d’équipe.';
    });
  }

  function relever(silencieux = false) {
    if (!e.enLigne || termine || occupe) return;
    agir(async () => {
      const r = await enLigne.releverDecisions(id);
      derniereReleve = new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (r.acceptees.length) message = `Décisions reçues : ${r.acceptees.join(', ')}.`;
      else if (!silencieux) message = 'Aucune nouvelle décision.';
      if (r.erreurs.length) erreurs = r.erreurs;
    });
  }

  // Relève automatique toutes les 15 secondes tant que l'écran est ouvert.
  const minuterie = setInterval(() => relever(true), 15000);
  onDestroy(() => clearInterval(minuterie));

  // Publication automatique des situations dès que le tour, les imprévus ou les décisions validées diffèrent de ce qui
  // a été publié (y compris après un calcul fait pendant que cette carte n'était pas affichée).
  const aPublier = $derived(e.enLigne && enLigne.connecte && e.enLigne.empreintePubliee !== empreinteAPublier(e));
  $effect(() => {
    if (!aPublier) return;
    const t = setTimeout(() => agir(() => enLigne.publierSituations(id)), 600);
    return () => clearTimeout(t);
  });

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien);
      message = 'Lien copié.';
    } catch {
      message = 'Copiez le lien à la main.';
    }
  }
</script>

<section class="carte">
  <header class="tete">
    <h2>Jouer en ligne</h2>
    {#if enLigne.connecte && !modifierConfig}
      <span class="ligne">
        <button class="btn-lien" onclick={() => (modifierConfig = true)}>Configuration</button>
        <button class="btn-lien" onclick={() => { enLigne.deconnecter(); message = 'Vous êtes déconnecté.'; }}>Se déconnecter</button>
      </span>
    {/if}
  </header>
  <div class="corps-carte">
    {#if message}<p class="info" role="status">{message}</p>{/if}
    {#if erreurs.length}<div class="alerte" role="alert">{#each erreurs as m}<div>{m}</div>{/each}</div>{/if}

    {#if modifierConfig}
      <form class="grille" onsubmit={enregistrerConfig}>
        <p class="aide plein">
          Une seule fois : indiquez l'adresse de votre projet Supabase et sa clé publique (Project Settings, API). Ne copiez
          jamais la clé secrète « service_role ».
        </p>
        <label class="champ-bloc"><span class="lib">Adresse du projet</span><input class="champ" bind:value={url} placeholder="https://abcdefgh.supabase.co" autocomplete="off" /></label>
        <label class="champ-bloc"><span class="lib">Clé publique (anon public)</span><input class="champ" bind:value={cle} autocomplete="off" /></label>
        <div class="plein ligne">
          <button class="btn btn-principal" type="submit">Enregistrer</button>
          {#if enLigne.configure}<button class="btn" type="button" onclick={() => (modifierConfig = false)}>Annuler</button>{/if}
        </div>
      </form>
    {:else if !enLigne.connecte}
      <form class="ligne" onsubmit={envoyerLien}>
        <label class="champ-bloc large"><span class="lib">Votre adresse e-mail professionnelle</span><input class="champ" type="email" required bind:value={email} autocomplete="email" /></label>
        <button class="btn btn-principal" type="submit" disabled={occupe}>Recevoir le lien de connexion</button>
      </form>
      <p class="aide">Vous recevez un lien par e-mail : il vous connecte au service, sans mot de passe. Les groupes n'ont pas de compte.</p>
    {:else if !e.enLigne}
      <p>
        Les groupes décideront depuis leur poste avec un lien et un code d'équipe. Seules les données du jeu partent en ligne :
        noms d'entreprise, décisions, situations et résultats.
      </p>
      <button class="btn btn-principal" onclick={mettreEnLigne} disabled={occupe || termine}>Mettre la partie en ligne</button>
    {:else}
      <div class="code">Code de la partie <b>{e.enLigne.code}</b></div>
      <div class="ligne">
        <input class="champ" readonly value={lien} aria-label="Lien pour les groupes" />
        <button class="btn" onclick={copier}>Copier le lien</button>
      </div>
      <table class="codes">
        <thead><tr><th>Entreprise</th><th>Code d'équipe (à remettre au groupe seulement)</th><th>Décisions</th></tr></thead>
        <tbody>
          {#each e.entreprises as x, i (x.id)}
            <tr class:zebre={i % 2 === 1}>
              <td>{x.nom}</td>
              <td class="num"><b>{e.enLigne.codesEquipes[x.id]}</b></td>
              <td>{e.brouillon[x.id] ? 'reçues' : 'en attente'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="ligne">
        <button class="btn" onclick={() => relever()} disabled={occupe || termine}>Relever les décisions maintenant</button>
        <button class="btn" onclick={() => agir(() => enLigne.publierSituations(id))} disabled={occupe}>Republier les situations</button>
        <span class="aide">Relève automatique toutes les 15 secondes{derniereReleve ? ` (dernière : ${derniereReleve})` : ''}.</span>
      </div>
    {/if}
  </div>
</section>

<style>
  .tete { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .corps-carte { display: grid; gap: 12px; }
  .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 18px; }
  .plein { grid-column: 1 / -1; }
  .champ-bloc { display: grid; gap: 6px; }
  .large { flex: 1; min-width: 260px; }
  .lib { font-size: 12.5px; font-weight: bold; color: var(--c-texte-2); }
  .aide { font-size: 12px; color: var(--c-texte-2); margin: 0; }
  .ligne { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
  .ligne .champ { flex: 1; min-width: 260px; }
  .code { font-size: 18px; }
  .code b { font-size: 28px; letter-spacing: 0.12em; color: var(--c-nuit); margin-left: 10px; }
  .codes td { vertical-align: middle; }
  .info, .alerte { margin: 0; }
  @media (max-width: 760px) { .grille { grid-template-columns: 1fr; } }
</style>
