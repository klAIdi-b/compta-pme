<!-- Simulateur : créer une partie (écran 1 de la maquette validée le 21.11.2026). -->
<script lang="ts">
  import { simulations, nouvelIdPartie } from '../../simulation.svelte';
  import { SECTEURS, MARCHE_PAR_DEFAUT } from '../../../data/simulation/secteurs';
  import { creerPartie, exerciceComplet, FORMATS, nbToursMax, type Format } from '../../../engine/simulation/tour';
  import { NIVEAUX_DISPONIBLES, type AffichageResultats, type Comptabilite, type DureeTour, type NiveauSimulation, type ReglagesPartie } from '../../../engine/simulation/types';
  import type { Mode } from '../../../engine/exercice';
  import { LIBELLES_MODE } from '../../../engine/exercice';
  import { DESCRIPTION_NIVEAU, LIBELLE_AFFICHAGE, LIBELLE_COMPTABILITE, LIBELLE_NIVEAU } from './libelles';

  const annee = new Date().getFullYear() + 1;
  let niveau = $state<NiveauSimulation>('CFC1');
  let nom = $state('');
  let secteurId = $state(SECTEURS[0]!.id);
  let format = $state<Format | null>('long');
  let dureeTour = $state<DureeTour>('mois');
  let nbTours = $state(12);
  let comptabilite = $state<Comptabilite>('eleves');
  let toursSaisis = $state<number[]>([1]);
  let modeSaisie = $state<Mode>('entrainement');
  let affichage = $state<AffichageResultats>('classement');
  let cloture = $state(true);
  let entreprises = $state<string[]>(['', '', '', '']);
  let erreurs = $state<string[]>([]);

  const complet = $derived(exerciceComplet({ dureeTour, nbTours }));
  const max = $derived(nbToursMax({ dureeTour }));

  function choisirFormat(f: Format) {
    format = f;
    dureeTour = FORMATS[f].dureeTour;
    nbTours = FORMATS[f].nbTours;
    cloture = exerciceComplet({ dureeTour, nbTours });
  }

  function choisirNiveau(n: NiveauSimulation) {
    niveau = n;
    if (n === 'AFP') comptabilite = 'automatique';
  }

  $effect(() => {
    if (!complet && cloture) cloture = false;
    if (nbTours > max) nbTours = max;
    if (toursSaisis.some((t) => t > nbTours)) toursSaisis = toursSaisis.filter((t) => t <= nbTours);
  });

  function basculerTour(t: number) {
    toursSaisis = toursSaisis.includes(t) ? toursSaisis.filter((x) => x !== t) : [...toursSaisis, t].sort((a, b) => a - b);
  }

  function creer(e: SubmitEvent) {
    e.preventDefault();
    erreurs = [];
    if (!nom.trim()) erreurs = ['Donnez un nom à la partie (par exemple la classe et la période).'];
    const reglages: ReglagesPartie = {
      niveau,
      secteur: SECTEURS.find((s) => s.id === secteurId)!,
      dureeTour,
      nbTours: Number(nbTours),
      annee,
      comptabilite,
      ...(comptabilite === 'mixte' ? { toursSaisis: [...toursSaisis] } : {}),
      affichage,
      modeSaisie,
      cloture: cloture && complet,
      marche: MARCHE_PAR_DEFAUT,
    };
    const liste = entreprises.map((n, i) => ({ id: `e${i + 1}`, nom: n })).filter((x) => x.nom.trim());
    const r = creerPartie(reglages, liste);
    if (!r.ok) erreurs = [...erreurs, ...r.erreurs];
    if (erreurs.length || !r.ok) return;
    const id = nouvelIdPartie();
    simulations.ajouter({
      id,
      nom: nom.trim(),
      creeLe: new Date().toISOString(),
      reglages: structuredClone(reglages),
      entreprises: r.valeur.entreprises,
      decisionsParTour: [],
      brouillon: {},
    });
    simulations.vue = { ecran: 'partie', id };
  }
</script>

<form class="creation" onsubmit={creer}>
  <div class="titre">
    <div>
      <h1>Nouvelle partie</h1>
      <div class="sous">Ces réglages ne pourront plus être modifiés une fois le premier tour joué.</div>
    </div>
    <button type="button" class="btn-lien" onclick={() => (simulations.vue = { ecran: 'liste' })}>Retour aux parties</button>
  </div>

  <section class="carte">
    <h2>1. Classe et secteur</h2>
    <div class="corps-carte grille">
      <div class="champ-bloc">
        <span class="lib" id="lib-niveau">Niveau</span>
        <div class="segments" role="group" aria-labelledby="lib-niveau">
          {#each ['AFP', 'CFC1', 'CFC2', 'MP'] as const as n}
            <button type="button" aria-pressed={niveau === n} disabled={!NIVEAUX_DISPONIBLES.includes(n)} onclick={() => choisirNiveau(n)}>
              {LIBELLE_NIVEAU[n]}{NIVEAUX_DISPONIBLES.includes(n) ? '' : ' — bientôt'}
            </button>
          {/each}
        </div>
        <span class="aide">{DESCRIPTION_NIVEAU[niveau]}</span>
      </div>
      <div class="champ-bloc">
        <label class="lib" for="nom-partie">Nom de la partie</label>
        <input id="nom-partie" class="champ" bind:value={nom} placeholder="2CA — printemps {annee}" autocomplete="off" />
        <span class="aide">Pour vous retrouver ; n'y mettez aucun nom d'élève.</span>
      </div>
      <div class="champ-bloc plein">
        <span class="lib" id="lib-secteur">Secteur</span>
        <div class="choix trois" role="radiogroup" aria-labelledby="lib-secteur">
          {#each SECTEURS as s}
            <label class="option" class:on={secteurId === s.id}>
              <span class="ligne"><input type="radio" name="secteur" value={s.id} bind:group={secteurId} /> <b>{s.nom}</b></span>
              <span class="aide">
                {s.produits} · prix de vente de référence {(s.prixVenteReference / 100).toFixed(2)} · {s.partVentesACreditPourcent} % de ventes sur facture{s.baissePrixAchatMensuellePourcent ? ' · prix d\'achat en baisse' : ''}
              </span>
            </label>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <section class="carte">
    <header class="tete"><h2>2. Durée</h2><span class="aide">Année fictive {annee}</span></header>
    <div class="corps-carte grille">
      <div class="champ-bloc plein">
        <span class="lib" id="lib-format">Format</span>
        <div class="choix trois" role="radiogroup" aria-labelledby="lib-format">
          {#each Object.entries(FORMATS) as [cle, f]}
            <label class="option" class:on={format === cle}>
              <span class="ligne"><input type="radio" name="format" checked={format === cle} onchange={() => choisirFormat(cle as Format)} /> <b>{f.libelle} · {f.seances}</b></span>
              <span class="aide">{f.description}</span>
            </label>
          {/each}
        </div>
      </div>
      <div class="champ-bloc">
        <span class="lib" id="lib-duree">Un tour dure</span>
        <div class="segments" role="group" aria-labelledby="lib-duree">
          <button type="button" aria-pressed={dureeTour === 'mois'} onclick={() => { dureeTour = 'mois'; format = null; }}>un mois</button>
          <button type="button" aria-pressed={dureeTour === 'trimestre'} onclick={() => { dureeTour = 'trimestre'; format = null; }}>un trimestre</button>
        </div>
      </div>
      <div class="champ-bloc">
        <label class="lib" for="nb-tours">Nombre de tours</label>
        <div class="ligne"><input id="nb-tours" class="champ court num" type="number" min="1" max={max} bind:value={nbTours} oninput={() => (format = null)} /> <span class="discret">sur {max} (une année)</span></div>
      </div>
    </div>
  </section>

  <section class="carte">
    <h2>3. Comptabilité et résultats</h2>
    <div class="corps-carte grille">
      <div class="champ-bloc">
        <span class="lib" id="lib-compta">Comptabilité</span>
        <div class="segments" role="group" aria-labelledby="lib-compta">
          {#each ['automatique', 'eleves', 'mixte'] as const as c}
            <button type="button" aria-pressed={comptabilite === c} disabled={niveau === 'AFP' && c !== 'automatique'} onclick={() => (comptabilite = c)}>{LIBELLE_COMPTABILITE[c]}</button>
          {/each}
        </div>
        {#if comptabilite === 'mixte'}
          <span class="aide">Tours saisis par les élèves dans Compta PME :</span>
          <div class="cases">
            {#each Array.from({ length: nbTours }, (_, i) => i + 1) as t}
              <label><input type="checkbox" checked={toursSaisis.includes(t)} onchange={() => basculerTour(t)} /> {t}</label>
            {/each}
          </div>
        {:else if niveau === 'AFP'}
          <span class="aide">En AFP, la comptabilité est toujours automatique.</span>
        {/if}
      </div>
      <div class="champ-bloc">
        <span class="lib" id="lib-mode">Mode de la saisie</span>
        <div class="segments" role="group" aria-labelledby="lib-mode">
          {#each ['entrainement', 'formative', 'evaluation'] as const as m}
            <button type="button" aria-pressed={modeSaisie === m} disabled={comptabilite === 'automatique'} onclick={() => (modeSaisie = m)}>{LIBELLES_MODE[m].toLocaleLowerCase('fr-CH')}</button>
          {/each}
        </div>
      </div>
      <div class="champ-bloc">
        <span class="lib" id="lib-affichage">Résultats montrés aux groupes</span>
        <div class="segments" role="group" aria-labelledby="lib-affichage">
          {#each ['classement', 'sansRang', 'cache'] as const as a}
            <button type="button" aria-pressed={affichage === a} onclick={() => (affichage = a)}>{LIBELLE_AFFICHAGE[a]}</button>
          {/each}
        </div>
        <span class="aide">Classement : résultat cumulé ×2, trésorerie ×1, part de marché ×1.</span>
      </div>
      <div class="champ-bloc">
        <span class="lib">Clôture</span>
        <label class="ligne"><input type="checkbox" bind:checked={cloture} disabled={!complet} /> Inventaire au 31.12 puis bouclement par les élèves</label>
        <span class="aide">Possible seulement si la partie couvre l'année entière.</span>
      </div>
    </div>
  </section>

  <section class="carte">
    <header class="tete">
      <h2>4. Entreprises (2 à 8)</h2>
      <button type="button" class="btn" disabled={entreprises.length >= 8} onclick={() => (entreprises = [...entreprises, ''])}>Ajouter une entreprise</button>
    </header>
    <div class="corps-carte">
      <div class="equipes">
        {#each entreprises as _, i}
          <div class="ligne">
            <input class="champ" bind:value={entreprises[i]} aria-label="Nom de l'entreprise {i + 1}" placeholder="Entreprise {i + 1}" autocomplete="off" />
            {#if entreprises.length > 2}
              <button type="button" class="btn-lien" onclick={() => (entreprises = entreprises.filter((__, j) => j !== i))} aria-label="Retirer l'entreprise {i + 1}">Retirer</button>
            {/if}
          </div>
        {/each}
      </div>
      <p class="rappel-noms" role="note">
        <b>Rappel à donner aux groupes :</b> le nom de l'entreprise ne doit contenir ni prénom ni nom d'élève (par exemple
        « Les Lémaniques », et non « Chez Léa et Hugo »). Ces noms apparaissent sur l'écran projeté, dans les fichiers remis aux
        groupes et, pour une partie en ligne, sur le service en ligne.
      </p>
    </div>
  </section>

  {#if erreurs.length}
    <div class="alerte" role="alert"><b>La partie ne peut pas encore être créée :</b><ul>{#each erreurs as e}<li>{e}</li>{/each}</ul></div>
  {/if}
  <div class="fin">
    <button type="button" class="btn" onclick={() => (simulations.vue = { ecran: 'liste' })}>Annuler</button>
    <button type="submit" class="btn btn-principal">Créer la partie</button>
  </div>
</form>

<style>
  .creation { display: grid; gap: 18px; }
  .creation .titre { margin-bottom: 0; }
  .tete { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px; }
  .plein { grid-column: 1 / -1; }
  .champ-bloc { display: grid; gap: 6px; align-content: start; }
  .champ-bloc .segments { justify-self: start; flex-wrap: wrap; }
  .lib { font-size: 12.5px; font-weight: bold; color: var(--c-texte-2); }
  .aide { font-size: 12px; color: var(--c-texte-2); }
  .choix { display: grid; gap: 12px; }
  .trois { grid-template-columns: repeat(3, 1fr); }
  .option { border: 1px solid var(--c-bordure-2); border-radius: 8px; padding: 12px 14px; display: grid; gap: 4px; cursor: pointer; }
  .option.on { border-color: var(--c-structure); box-shadow: 0 0 0 3px rgba(31, 78, 120, 0.12); }
  .ligne { display: flex; align-items: center; gap: 8px; }
  .court { width: 90px; }
  .cases { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; }
  .equipes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .rappel-noms { margin: 12px 0 0; padding: 10px 14px; border-left: 4px solid var(--c-accent); background: var(--c-alerte-fond); border-radius: 6px; font-size: 13px; }
  .fin { display: flex; justify-content: flex-end; gap: 10px; }
  .segments button[disabled] { color: #9aa5b3; cursor: not-allowed; }
  @media (max-width: 760px) {
    .grille, .trois, .equipes { grid-template-columns: 1fr; }
  }
</style>
