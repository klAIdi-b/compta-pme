<!--
  Palette de commandes (phase V4, maquette public/maquettes/saisie-professionnelle.html, écran V4.5, validée le
  27.11.2026) : Ctrl + K (Cmd + K sur Mac), ou la loupe de l'en-tête sur téléphone. Une seule recherche pour aller à une
  rubrique, ouvrir le grand livre d'un compte, retrouver une pièce ou lancer une action. Flèches et Entrée pour choisir,
  Échap pour fermer.
-->
<script lang="ts">
  import { tick } from 'svelte';
  import { etat, type Vue } from '../etat.svelte';
  import { grandLivre } from '../../engine/ledger';
  import { normaliser } from '../format';

  type Commande = { groupe: string; libelle: string; detail?: string; touche?: string; agir: () => void };

  let {
    ouverte = $bindable(false),
    rubriques,
    actions,
  }: { ouverte: boolean; rubriques: { vue: Vue; libelle: string }[]; actions: { libelle: string; touche?: string; agir: () => void }[] } = $props();

  let texte = $state('');
  let choix = $state(0);
  let champ = $state<HTMLInputElement | undefined>();
  let avantOuverture: HTMLElement | null = null;

  const commandes = $derived.by((): Commande[] => {
    if (!etat.session) return [];
    const d = etat.dossier;
    return [
      ...rubriques.map((r) => ({ groupe: 'Rubriques', libelle: r.libelle, agir: () => etat.aller(r.vue) })),
      ...grandLivre(d).map((c) => ({
        groupe: 'Comptes',
        libelle: `Grand livre · ${c.intitule}`,
        detail: c.numero,
        agir: () => {
          etat.compteCible = c.numero;
          etat.aller('grandlivre');
        },
      })),
      ...d.ecritures
        .filter((e) => !e.automatique && !e.extourneDe)
        .map((e) => ({ groupe: 'Écritures', libelle: `Pièce ${e.piece} · ${e.libelle || 'sans libellé'}`, agir: () => etat.ouvrirOperation(e.piece) })),
      ...actions.map((a) => ({ groupe: 'Actions', libelle: a.libelle, touche: a.touche, agir: a.agir })),
    ];
  });

  const trouvees = $derived.by(() => {
    const t = normaliser(texte.trim());
    const r = t ? commandes.filter((c) => normaliser(`${c.libelle} ${c.detail ?? ''}`).includes(t)) : commandes.filter((c) => c.groupe !== 'Écritures' && c.groupe !== 'Comptes');
    return r.slice(0, 30);
  });

  $effect(() => {
    if (!ouverte) return;
    avantOuverture = document.activeElement as HTMLElement | null;
    texte = '';
    choix = 0;
    tick().then(() => champ?.focus());
  });

  function fermer() {
    ouverte = false;
    avantOuverture?.focus?.();
  }

  function executer(c: Commande | undefined) {
    if (!c) return;
    ouverte = false;
    c.agir();
  }

  function touche(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      fermer();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      choix = Math.min(trouvees.length - 1, choix + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      choix = Math.max(0, choix - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executer(trouvees[choix]);
    }
  }
</script>

{#if ouverte}
  <div class="voile" role="presentation" onclick={fermer}></div>
  <div class="palette" role="dialog" aria-modal="true" aria-label="Palette de commandes">
    <input
      bind:this={champ}
      class="champ"
      bind:value={texte}
      oninput={() => (choix = 0)}
      onkeydown={touche}
      placeholder="Rubrique, compte, pièce ou action…"
      aria-label="Rechercher une commande"
      role="combobox"
      aria-expanded="true"
      aria-controls="liste-palette"
      aria-activedescendant={trouvees.length ? `palette-${choix}` : undefined}
      autocomplete="off"
    />
    <ul id="liste-palette" role="listbox" aria-label="Commandes">
      {#each trouvees as c, i (`${c.groupe}-${c.libelle}-${i}`)}
        {#if i === 0 || trouvees[i - 1]!.groupe !== c.groupe}<li class="groupe" role="presentation">{c.groupe}</li>{/if}
        <li id={`palette-${i}`} role="option" aria-selected={i === choix} class:sel={i === choix} onmousemove={() => (choix = i)} onclick={() => executer(c)} onkeydown={() => {}}>
          <span>{c.libelle}{#if c.detail}<span class="detail num">{c.detail}</span>{/if}</span>
          {#if c.touche}<span class="touche">{c.touche}</span>{/if}
        </li>
      {:else}
        <li class="vide" role="presentation">Aucune commande ne correspond.</li>
      {/each}
    </ul>
    <p class="aide">↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer</p>
  </div>
{/if}

<style>
  .voile { position: fixed; inset: 0; background: rgba(15, 39, 66, 0.35); z-index: 90; }
  .palette {
    position: fixed; top: 12vh; left: 50%; transform: translateX(-50%); width: min(600px, calc(100vw - 24px)); z-index: 91;
    background: var(--c-fond); border-radius: var(--r-3); box-shadow: var(--ombre-haute); padding: var(--e-3); display: flex; flex-direction: column; gap: var(--e-2);
  }
  .palette .champ { width: 100%; font-size: var(--t-17); }
  ul { list-style: none; margin: 0; padding: 0; max-height: 55vh; overflow-y: auto; }
  li { display: flex; justify-content: space-between; gap: var(--e-3); padding: 8px 10px; border-radius: var(--r-2); cursor: pointer; font-size: var(--t-14); }
  li.sel { background: var(--c-selection); }
  li.groupe { cursor: default; font-size: var(--t-12); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--c-texte-2); padding: 8px 10px 2px; }
  li.vide { cursor: default; color: var(--c-texte-2); }
  .detail { margin-left: 8px; font-size: var(--t-12); color: var(--c-texte-2); }
  .touche { font-size: var(--t-12); color: var(--c-texte-2); white-space: nowrap; }
  .aide { margin: 0; font-size: var(--t-12); color: var(--c-texte-2); }
</style>
