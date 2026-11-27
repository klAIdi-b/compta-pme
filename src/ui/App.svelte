<script lang="ts">
  import { dialogue } from './dialogue.svelte';
  import Dialogue from './composants/Dialogue.svelte';
  import { tick } from 'svelte';
  import { etat, type Vue } from './etat.svelte';
  import { etiquetteNiveau, LIBELLES_MODE } from '../engine/exercice';
  import { enseignant } from './enseignant.svelte';
  import { EXT_COPIE, empreinteTravail, exporterCopie, nomFichier, statutExport } from '../io/fichiers';
  import { telecharger, telechargerBlob } from './fichiers-navigateur';
  import Differe from './composants/Differe.svelte';
  import { simulationEleve } from './simulation-eleve.svelte';
  import AvancementEntete from './composants/AvancementEntete.svelte';
  import Icone from './composants/Icone.svelte';
  import { vueEleve } from './modes';
  import { avecParcours, etapesParcours, etatJournal, rangParcours } from './parcours';
  import { avancementSession, avecCorrection } from './avancement';
  import { estBoucle } from '../engine/closing';
  import { dateHeure, periode } from './format';
  import Accueil from './vues/Accueil.svelte';

  // Rubriques du logiciel chargées à la demande (24.11.2026) : la page d'accueil n'a pas à télécharger le journal et
  // les états. Dès qu'un exercice est ouvert, elles sont chargées d'avance, pendant un temps mort : passer de l'une
  // à l'autre reste immédiat. Hors ligne, le service worker les a déjà en cache.
  const VUES_BASE = {
    tableau: () => import('./vues/TableauDeBord.svelte'),
    journal: () => import('./vues/Journal.svelte'),
    comptes: () => import('./vues/Comptes.svelte'),
    grandlivre: () => import('./vues/GrandLivre.svelte'),
    balance: () => import('./vues/Balance.svelte'),
    bilan: () => import('./vues/Bilan.svelte'),
    resultat: () => import('./vues/CompteResultat.svelte'),
    bouclement: () => import('./vues/Bouclement.svelte'),
  };
  let prechargees = false;
  $effect(() => {
    if (!etat.session || prechargees) return;
    prechargees = true;
    const lancer = () => Object.values(VUES_BASE).forEach((charger) => charger().catch(() => {}));
    if ('requestIdleCallback' in window) window.requestIdleCallback(lancer, { timeout: 2000 });
    else setTimeout(lancer, 300);
  });
  import Visite from './composants/Visite.svelte';
  import EtapeSuivante from './composants/EtapeSuivante.svelte';

  function exporterMaCopie() {
    const s = etat.session!;
    const texte = exporterCopie({
      eleve: s.eleve,
      exerciceId: s.exercice.id,
      exerciceTitre: s.exercice.titre,
      mode: s.exercice.mode,
      dossier: s.dossier,
      suivi: s.suivi,
      fiches: s.fiches,
      formativeTerminee: s.formativeTerminee || undefined,
      // Énoncé papier : l'exercice créé par l'élève voyage avec la copie (reprise, rattachement au corrigé).
      ...(s.exercice.papier ? { papier: { exercice: $state.snapshot(s.exercice) } } : {}),
    });
    telecharger(nomFichier([s.eleve.nom, s.eleve.prenom, s.eleve.classe, s.exercice.titre], EXT_COPIE), texte);
    s.dernierExport = { le: new Date().toISOString(), empreinte: empreinteTravail(s.dossier, $state.snapshot(s.fiches)) };
  }

  const statut = $derived(
    etat.genre === 'travail' && etat.session
      ? statutExport(etat.session.dossier, $state.snapshot(etat.session.fiches), etat.session.dernierExport)
      : 'vide',
  );
  const heureExport = $derived(
    etat.session?.dernierExport
      ? dateHeure(etat.session.dernierExport.le)
      : '',
  );

  let pdfEnCours = $state(false);
  async function exporterPdf() {
    const s = etat.session!;
    pdfEnCours = true;
    try {
      const { genererPdfCopie } = await import('../pdf/copie');
      const nom = nomFichier([s.eleve.nom, s.eleve.prenom, s.eleve.classe, s.exercice.titre], '.pdf');
      telechargerBlob(nom, await genererPdfCopie(s.eleve, s.exercice, s.dossier, nom));
    } catch {
      dialogue.informer("Le PDF n'a pas pu être créé", ['Vérifiez votre connexion lors du premier export, puis réessayez.']);
    } finally {
      pdfEnCours = false;
    }
  }

  function fermerApercu() {
    etat.fermerApercu();
    enseignant.ouvert = true;
  }

  async function terminerCorrige(garder: boolean) {
    if (!garder && !(await dialogue.demander({ titre: 'Abandonner la saisie du corrigé ?', texte: ['Les modifications seront perdues.'], confirmer: 'Abandonner', annuler: 'Continuer la saisie', danger: true }))) return;
    const r = etat.fermerCorrige(garder);
    if (r) {
      const ex = enseignant.trouver(r.exerciceId);
      if (ex) enseignant.enregistrer({ ...ex, corrige: r.corrige });
      enseignant.edition = r.exerciceId;
    }
    enseignant.ouvert = true;
  }

  /** Écran affiché (machine à états explicite : src/ui/modes.ts). */
  const ecran = $derived(etat.ecran(enseignant.ouvert));

  type Entree = { vue: Vue; libelle: string; fait?: boolean; compte?: string };
  type Rubrique = { titre: string | null; entrees: Entree[] };

  /**
   * Barre latérale rangée comme celle d'un logiciel comptable (phase V1 de VISION_LOGICIEL.md, maquette validée le
   * 27.11.2026) : Saisie, Comptes, États financiers, Clôture, puis les fiches de l'exercice et les outils. Les étapes du
   * parcours restent cochées une fois faites, et la barre « Étape suivante » garde l'ordre du cours.
   */
  const journalTermine = $derived.by(() => {
    const s = etat.session;
    if (!s || !vueEleve(etat.genre)) return false;
    const a = avancementSession(s);
    return !!a && etatJournal(a, avecCorrection(s) && !etat.verrouille).termine;
  });
  const avancementJournal = $derived(etat.session && vueEleve(etat.genre) ? avancementSession(etat.session) : null);
  const etapesApres = $derived(etat.session ? etapesParcours(etat.exercice, etat.fonctions) : []);
  const rangAtteint = $derived(etat.etapeParcours ? rangParcours(etapesApres, etat.etapeParcours) : 0);
  const boucleFait = $derived(!!etat.session && etat.dossier.ecritures.length > 0 && estBoucle(etat.dossier));
  const rubriques = $derived.by((): Rubrique[] => {
    const f = etat.session ? etat.fonctions : new Set();
    const saisies = (etat.session?.dossier.ecritures.length ?? 0) > 0;
    /** Une étape du parcours est cochée quand elle est faite ; une rubrique hors parcours ne l'est jamais. */
    const entree = (vue: Vue, libelle: string): Entree => {
      const rang = rangParcours(etapesApres, vue);
      const fait = rang > 0 && journalTermine && (vue === 'bouclement' ? boucleFait : rangAtteint > rang);
      return { vue, libelle, fait };
    };
    const outils: Entree[] = [
      ...(f.has('tva') ? [{ vue: 'tva' as Vue, libelle: 'TVA' }] : []),
      ...(f.has('salaire') ? [{ vue: 'salaire' as Vue, libelle: 'Décompte de salaire' }] : []),
      ...(f.has('facturation') ? [{ vue: 'facturation' as Vue, libelle: 'Facturation' }] : []),
      ...(f.has('budget') ? [{ vue: 'budget' as Vue, libelle: 'Budget' }] : []),
      { vue: 'theorie', libelle: 'Théorie' },
    ];
    // Énoncé papier : le bilan d'ouverture puis le journal, sans parcours (pas d'opérations dans le logiciel).
    if (etat.session && etat.exercice.papier) {
      const ouvertureFaite = Object.keys(etat.exercice.ouvertureActif).length > 0;
      return [
        { titre: null, entrees: [{ vue: 'tableau', libelle: 'Votre mission' }] },
        { titre: 'Saisie', entrees: [{ vue: 'ouverture', libelle: "Bilan d'ouverture", fait: ouvertureFaite }, { vue: 'journal', libelle: 'Journal', compte: saisies ? `${new Set(etat.dossier.ecritures.map((e) => e.piece)).size} pièces` : undefined }] },
        { titre: 'Comptes', entrees: [{ vue: 'comptes', libelle: 'Comptes en T' }, { vue: 'grandlivre', libelle: 'Grand livre' }, { vue: 'balance', libelle: 'Balance' }] },
        { titre: 'États financiers', entrees: [{ vue: 'resultat', libelle: 'Compte de résultat' }, { vue: 'bilan', libelle: 'Bilan' }] },
        { titre: 'Clôture', entrees: [{ vue: 'bouclement', libelle: 'Bouclement' }] },
        { titre: 'Outils', entrees: outils },
      ];
    }
    // Exercice sans journal (fiche seule : budget, facturation) : la mission, puis les fiches.
    if (etat.session && etat.exercice.operations.length === 0) return [{ titre: null, entrees: [{ vue: 'tableau', libelle: 'Votre mission' }] }, { titre: 'Outils', entrees: outils }];
    const fichesParcours = etapesApres.filter((e) => !['balance', 'resultat', 'bilan', 'bouclement'].includes(e.vue)).map((e) => entree(e.vue, e.libelle));
    const a = avancementJournal;
    return [
      { titre: null, entrees: [{ vue: 'tableau', libelle: 'Votre mission', fait: saisies }] },
      { titre: 'Saisie', entrees: [{ vue: 'journal', libelle: 'Journal', fait: journalTermine, compte: a && !journalTermine ? `${a.saisies} / ${a.total}` : undefined }] },
      { titre: 'Comptes', entrees: [{ vue: 'comptes', libelle: 'Comptes en T' }, { vue: 'grandlivre', libelle: 'Grand livre' }, entree('balance', 'Balance')] },
      { titre: 'États financiers', entrees: [entree('resultat', 'Compte de résultat'), entree('bilan', 'Bilan')] },
      { titre: 'Clôture', entrees: [entree('bouclement', 'Bouclement')] },
      ...(fichesParcours.length || f.has('bilanOuverture')
        ? [{ titre: 'Fiches', entrees: [...(f.has('bilanOuverture') ? [{ vue: 'bilanOuverture' as Vue, libelle: "Bilan d'ouverture" }] : []), ...fichesParcours] }]
        : []),
      { titre: 'Outils', entrees: outils },
    ];
  });
  /** Menu de navigation sur téléphone et petite tablette : ouvert par le bouton « Menu », refermé après un choix. */
  let menuOuvert = $state(false);
  let boutonMenu = $state<HTMLButtonElement | null>(null);
  let navigation = $state<HTMLElement | null>(null);
  /** Ouverture : le focus entre dans le menu (rubrique en cours) ; fermeture : il revient au bouton « Menu ». */
  async function basculerMenu(ouvrir: boolean, rendreFocus = true) {
    if (menuOuvert === ouvrir) return;
    menuOuvert = ouvrir;
    await tick();
    if (ouvrir) (navigation?.querySelector<HTMLElement>('[aria-current="page"]') ?? navigation?.querySelector<HTMLElement>('a'))?.focus();
    else if (rendreFocus) boutonMenu?.focus();
  }
  function toucheGlobale(e: KeyboardEvent) {
    if (e.key === 'Escape' && menuOuvert) {
      e.preventDefault();
      basculerMenu(false);
    }
  }
  // Fenêtre élargie pendant que le menu est ouvert (tablette tournée) : le menu redevient la barre latérale.
  $effect(() => {
    const large = window.matchMedia('(min-width: 901px)');
    const fermer = () => { if (large.matches) menuOuvert = false; };
    large.addEventListener('change', fermer);
    return () => large.removeEventListener('change', fermer);
  });
  /** Libellé de la rubrique affichée, pour le fil d'Ariane de l'en-tête. */
  const libelleVue = $derived(rubriques.flatMap((r) => r.entrees).find((e) => e.vue === etat.vue)?.libelle ?? '');
</script>

<svelte:window onkeydown={toucheGlobale} />
<Dialogue />

{#if ecran === 'guide' && etat.guide}
  <Differe charger={() => import('./vues/Guide.svelte')} props={{ partie: etat.guide, onFermer: () => (etat.guide = null) }} />
{:else if ecran === 'apprendre'}
  <Differe charger={() => import('./vues/Apprendre.svelte')} props={{}} />
{:else if ecran === 'enseignant'}
  <Differe charger={() => import('./vues/EspaceEnseignant.svelte')} props={{}} />
{:else if simulationEleve.enLigne}
  <Differe charger={() => import('./vues/simulation/RejoindreEnLigne.svelte')} props={{}} />
{:else if simulationEleve.situation}
  <Differe charger={() => import('./vues/simulation/SituationEleve.svelte')} props={{}} />
{:else if ecran === 'accueil' || !etat.session}
  <Accueil />
{:else}
  {@const s = etat.session}
  {@const genre = etat.genre}
  <a class="lien-evitement" href="#contenu-principal">Aller au contenu</a>
  <div class="app">
    <header class="entete" data-visite="entete">
      <button class="bouton-menu" bind:this={boutonMenu} aria-expanded={menuOuvert} aria-controls="navigation-principale" onclick={() => basculerMenu(!menuOuvert)}>
        <span class="trait" aria-hidden="true"></span><span class="sr-only">Menu</span>
      </button>
      {#if genre === 'travail'}
        <button class="logo logo-bouton" title="Retour à la page d'accueil" onclick={() => etat.allerAccueil()}>
          <span class="pastille-logo" aria-hidden="true">CP</span>Compta PME
        </button>
      {:else}
        <div class="logo"><span class="pastille-logo" aria-hidden="true">CP</span>Compta PME</div>
      {/if}
      <div class="dossier">
        {#if genre === 'travail'}<button class="vers-dossiers" onclick={() => etat.ouvrirRubrique('dossiers')}>Mes dossiers<span class="chevron" aria-hidden="true">›</span></button>{/if}
        <strong>{s.dossier.raisonSociale}</strong>
        <span class="fil" aria-hidden="true">/ {libelleVue}</span>
        <span class="meta">{s.dossier.formeJuridique === 'raison individuelle' ? 'Raison individuelle' : s.dossier.formeJuridique}</span>
        <span class="meta">Exercice {periode(s.dossier.debut, s.dossier.fin)}</span>
        <span class="badge badge-niveau" title="Formation et niveau de difficulté">{etiquetteNiveau(s.exercice)}</span>
        <span class="badge badge-mode" class:corrige={genre === 'corrige'} title="Mode">
          {genre === 'corrige' ? 'Saisie du corrigé' : s.exercice.papier ? 'Énoncé papier' : LIBELLES_MODE[s.exercice.mode]}
        </span>
      </div>
      {#if vueEleve(genre)}<AvancementEntete />{/if}
      {#if vueEleve(genre)}
        <div class="eleve" title={`${s.eleve.prenom} ${s.eleve.nom} · ${s.eleve.classe}`}>
          <span class="initiales" aria-hidden="true">{(s.eleve.prenom[0] ?? '') + (s.eleve.nom[0] ?? '')}</span>
          <span class="nom-eleve">{s.eleve.prenom} {s.eleve.nom} · {s.eleve.classe}</span>
        </div>
      {/if}
    </header>

    {#if menuOuvert}<button class="voile-menu" aria-label="Fermer le menu" tabindex="-1" onclick={() => basculerMenu(false)}></button>{/if}
    <nav class="lateral" class:ouvert={menuOuvert} bind:this={navigation} id="navigation-principale" aria-label="Navigation" data-visite="navigation">
      {#each rubriques as r}
        {#if r.titre}<div class="rubrique">{r.titre}</div>{/if}
        {#each r.entrees as e}
          <a
            href={`#${e.vue}`}
            class:actif={etat.vue === e.vue}
            class:fait={e.fait}
            aria-current={etat.vue === e.vue ? 'page' : undefined}
            onclick={(ev) => {
              ev.preventDefault();
              basculerMenu(false, false);
              etat.aller(e.vue);
            }}
            ><Icone nom={e.vue} /><span class="libelle">{e.libelle}</span>{#if e.compte}<span class="compte num">{e.compte}</span>{/if}{#if e.fait}<span class="coche" aria-hidden="true">✓</span><span class="sr-only"> (fait)</span>{/if}</a
          >
        {/each}
      {/each}
      <div class="bas">
        {#if genre === 'corrige'}
          <button class="action-lateral principale" onclick={() => terminerCorrige(true)}>Enregistrer le corrigé</button>
          <button class="action-lateral" onclick={() => terminerCorrige(false)}>Abandonner</button>
        {:else if genre === 'apercu'}
          <button class="action-lateral principale" onclick={fermerApercu}>Fermer l'aperçu</button>
        {:else}
          <button class="action-lateral" class:principale={journalTermine || !avecParcours(s.exercice)} onclick={exporterMaCopie}>Exporter ma copie</button>
          {#if statut !== 'vide'}
            <p class="rappel-export" class:a-faire={statut !== 'a-jour'} role="status">
              {#if statut === 'jamais'}Copie jamais exportée. Votre travail n'existe que dans ce navigateur.
              {:else if statut === 'modifie'}Modifiée depuis le dernier export ({heureExport}). Exportez à nouveau avant de rendre.
              {:else}Copie exportée le {heureExport}.{/if}
            </p>
          {/if}
          <button class="action-lateral" onclick={exporterPdf} disabled={pdfEnCours}>{pdfEnCours ? 'Création du PDF…' : 'Exporter en PDF'}</button>
          <button class="action-lateral discrete" onclick={() => { basculerMenu(false, false); etat.ouvrirRubrique('dossiers'); }}>Mes dossiers</button>
          <button class="action-lateral discrete" onclick={() => (etat.apprendre = true)}>Cours : apprendre pas à pas</button>
        <button class="action-lateral discrete" onclick={() => (etat.guide = 'eleve')}>Guide d'utilisation</button>
          <button class="action-lateral discrete" onclick={() => (enseignant.ouvert = true)}>Espace enseignant</button>
        {/if}
      </div>
    </nav>

    <!-- Zone qui défile : atteignable au clavier (règle WCAG scrollable-region-focusable). -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <main class="principal" id="contenu-principal" tabindex="0" aria-label="Contenu" inert={menuOuvert}>
      {#if genre === 'apercu'}
        <div class="bandeau-apercu" role="status">
          <span><b>Aperçu enseignant.</b> Vous voyez l'exercice comme vos élèves{s.exercice.mode === 'evaluation' ? ' (évaluation : aucun retour pendant la saisie)' : s.exercice.mode === 'formative' ? ' (évaluation formative : correction quand l’élève termine)' : ''}. Ce que vous saisissez ici n'est ni enregistré dans l'exercice, ni dans une copie.</span>
          <button class="btn" onclick={fermerApercu}>Fermer l'aperçu</button>
        </div>
      {/if}
      {#if etat.stockageIndisponible}
        <div class="alerte" role="alert" style="margin-bottom:16px">
          Le navigateur refuse l'enregistrement local (navigation privée ?). Votre travail sera perdu à la fermeture de
          la page.
        </div>
      {/if}
      {#if etat.vue === 'tableau'}<Differe charger={VUES_BASE.tableau} props={{}} />
      {:else if etat.vue === 'journal'}<Differe charger={VUES_BASE.journal} props={{}} />
      {:else if etat.vue === 'comptes'}<Differe charger={VUES_BASE.comptes} props={{}} />
      {:else if etat.vue === 'grandlivre'}<Differe charger={VUES_BASE.grandlivre} props={{}} />
      {:else if etat.vue === 'balance'}<Differe charger={VUES_BASE.balance} props={{}} />
      {:else if etat.vue === 'bilan'}<Differe charger={VUES_BASE.bilan} props={{}} />
      {:else if etat.vue === 'resultat'}<Differe charger={VUES_BASE.resultat} props={{}} />
      {:else if etat.vue === 'bouclement'}<Differe charger={VUES_BASE.bouclement} props={{}} />
      {:else if etat.vue === 'ouverture' && s.exercice.papier}<Differe charger={() => import('./vues/SaisieOuverture.svelte')} props={{}} />
      {:else if etat.vue === 'tva' && etat.fonctions.has('tva')}<Differe charger={() => import('./vues/Tva.svelte')} props={{}} />
      {:else if etat.vue === 'salaire' && etat.fonctions.has('salaire')}<Differe charger={() => import('./vues/Salaire.svelte')} props={{}} />
      {:else if etat.vue === 'repartition' && etat.fonctions.has('repartition')}<Differe charger={() => import('./vues/Repartition.svelte')} props={{}} />
      {:else if etat.vue === 'analyse' && etat.fonctions.has('analyse')}<Differe charger={() => import('./vues/Analyse.svelte')} props={{}} />
      {:else if etat.vue === 'degres' && etat.fonctions.has('degres')}<Differe charger={() => import('./vues/FicheDegres.svelte')} props={{}} />
      {:else if etat.vue === 'flux' && etat.fonctions.has('flux')}<Differe charger={() => import('./vues/FicheFlux.svelte')} props={{}} />
      {:else if etat.vue === 'seuil' && etat.fonctions.has('seuil')}<Differe charger={() => import('./vues/FicheSeuil.svelte')} props={{}} />
      {:else if etat.vue === 'bilanOuverture' && etat.fonctions.has('bilanOuverture')}<Differe charger={() => import('./vues/FicheBilanOuverture.svelte')} props={{}} />
      {:else if etat.vue === 'margeBrute' && etat.fonctions.has('margeBrute')}<Differe charger={() => import('./vues/FicheMargeBrute.svelte')} props={{}} />
      {:else if etat.vue === 'echelle' && etat.fonctions.has('echelle')}<Differe charger={() => import('./vues/FicheEchelle.svelte')} props={{}} />
      {:else if etat.vue === 'facturation' && etat.fonctions.has('facturation')}<Differe charger={() => import('./vues/Facturation.svelte')} props={{}} />
      {:else if etat.vue === 'budget' && etat.fonctions.has('budget')}<Differe charger={() => import('./vues/Budget.svelte')} props={{}} />
      {:else if etat.vue === 'theorie'}<Differe charger={() => import('./vues/Theorie.svelte')} props={{}} />
      {:else}<Differe charger={VUES_BASE.tableau} props={{}} />
      {/if}
      {#if vueEleve(genre)}<EtapeSuivante />{/if}
    </main>
  </div>
  {#if etat.visiteOuverte}<Visite />{/if}
{/if}

<style>
  .app { display: grid; grid-template-columns: 244px minmax(0, 1fr); grid-template-rows: 64px minmax(0, 1fr); height: 100vh; height: 100dvh; }
  .entete {
    grid-column: 1 / -1; display: flex; align-items: center; gap: 20px; padding: 0 20px;
    background: var(--c-fond); border-bottom: 1px solid var(--c-bordure-2);
  }
  .logo { font-weight: bold; color: var(--c-texte); font-size: var(--t-15); width: 192px; flex: none; display: flex; align-items: center; gap: 10px; }
  .pastille-logo { width: 28px; height: 28px; border-radius: var(--r-2); background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: var(--t-12); }
  .fil { color: var(--c-texte-2); white-space: nowrap; }
  .dossier { display: flex; align-items: baseline; gap: 16px; flex: 1; min-width: 0; }
  .dossier strong { font-size: var(--t-17); font-weight: 650; color: var(--c-encre); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 6ch; }
  .meta { display: none; }
  .badge-niveau { background: var(--c-structure); color: #fff; }
  .entete .badge { align-self: center; }
  .badge-mode { background: var(--c-selection); color: var(--c-structure); }
  .eleve { color: var(--c-texte-2); white-space: nowrap; display: flex; align-items: center; gap: 8px; }
  .initiales { width: 32px; height: 32px; border-radius: 50%; background: var(--c-selection); color: var(--c-structure); display: grid; place-items: center; font-weight: bold; font-size: var(--t-12); text-transform: uppercase; }
  .lateral { background: var(--c-nuit); color: #fff; padding: 14px 12px; overflow-y: auto; gap: 2px; }
  .rubrique { font-size: var(--t-12); font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #8fa9c4; padding: 16px 10px 8px; }
  .rubrique:first-child { padding-top: 4px; }
  .rubrique { padding-top: 12px; padding-bottom: 4px; }
  .lateral a { display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 6px 10px; color: #dce6f0; text-decoration: none; border-radius: var(--r-3); }
  .lateral a:hover { background: rgba(255, 255, 255, 0.07); color: #fff; }
  .lateral a.actif { background: rgba(255, 255, 255, 0.13); color: #fff; font-weight: 650; box-shadow: inset 3px 0 0 var(--c-accent); }
  .lateral a .libelle { flex: 1; min-width: 0; }
  .lateral a .compte { font-size: var(--t-12); color: #a9bccf; }
  .lateral a .coche { font-size: var(--t-12); font-weight: 700; color: #9fd3b0; }
  .vers-dossiers {
    font: inherit; font-size: var(--t-14); border: 0; background: none; padding: 0 var(--e-1); color: var(--c-structure); cursor: pointer;
    white-space: nowrap; align-self: center; min-height: var(--h-cible); border-radius: var(--r-2);
  }
  .vers-dossiers:hover { background: var(--c-bleu-doux); }
  .vers-dossiers .chevron { margin-left: 6px; color: var(--c-texte-2); }
  .bouton-menu { display: none; }
  .voile-menu { display: none; }
  .lateral { display: flex; flex-direction: column; }
  .bas { margin-top: auto; padding: 16px 0 4px; display: flex; flex-direction: column; gap: 8px; }
  .action-lateral {
    font: inherit; text-align: center; padding: 9px 10px; border-radius: var(--r-2); cursor: pointer;
    background: transparent; color: #fff; border: 1px solid rgba(255, 255, 255, 0.28);
  }
  .action-lateral:hover { background: rgba(255, 255, 255, 0.08); }
  .action-lateral.principale { background: var(--c-action); border-color: var(--c-action); font-weight: bold; }
  .rappel-export { margin: 0 2px 4px; font-size: var(--t-12); line-height: 1.35; color: #9fb6cc; }
  .rappel-export.a-faire { color: #fff; border-left: 3px solid var(--c-accent); padding-left: 7px; }
  .action-lateral.discrete { border: none; color: #b4c6d8; font-size: var(--t-13); padding: 4px 10px; min-height: 28px; text-align: left; }
  @media (pointer: coarse) { .lateral a, .action-lateral, .action-lateral.discrete { min-height: 44px; } }
  .badge-mode.corrige { background: var(--c-action); color: #fff; }
  .bandeau-apercu {
    display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: -4px 0 16px; padding: 10px 14px;
    background: var(--c-alerte-fond); border: 1px solid var(--c-avert-trait); border-radius: var(--r-3);
  }
  .principal { overflow: auto; padding: 28px 32px 56px; min-width: 0; }
  @media (max-width: 1280px) {
    .nom-eleve { display: none; }
    .fil { display: none; }
    /* Tablette : le nom de l'entreprise reste lisible ; forme juridique et période sont au tableau de bord. */
    .dossier .meta { display: none; }
    .entete { gap: 14px; }
  }
  @media (max-width: 1100px) {
    .app { grid-template-columns: 210px minmax(0, 1fr); }
    .logo { width: auto; }
    .principal { padding: 18px; }
    .badge-mode { display: none; }
  }
  /* Téléphone et petite tablette : la navigation devient un menu qu'on ouvre ; le contenu prend toute la largeur. */
  @media (max-width: 900px) {
    .app { grid-template-columns: minmax(0, 1fr); }
    .entete { gap: 12px; padding: 0 12px; }
    .bouton-menu {
      display: grid; place-items: center; width: 44px; height: 44px; flex: none; border: 1px solid var(--c-bordure);
      border-radius: var(--r-2); background: #fff; cursor: pointer;
    }
    .bouton-menu .trait, .bouton-menu .trait::before, .bouton-menu .trait::after {
      display: block; width: 18px; height: 2px; background: var(--c-encre); border-radius: var(--r-1); position: relative; content: '';
    }
    .bouton-menu .trait::before { position: absolute; top: -6px; left: 0; }
    .bouton-menu .trait::after { position: absolute; top: 6px; left: 0; }
    .logo { font-size: 0; gap: 0; }
    .badge-niveau { display: none; }
    .lateral {
      position: fixed; top: 64px; bottom: 0; left: 0; width: min(300px, 86vw); z-index: 40; transform: translateX(-102%);
      /* Fermé : invisible pour le clavier et les lecteurs d'écran, pas seulement hors de l'écran. */
      visibility: hidden; transition: transform 0.2s ease, visibility 0s linear 0.2s; box-shadow: var(--ombre-haute);
    }
    .lateral.ouvert { transform: none; visibility: visible; transition: transform 0.2s ease; }
    .voile-menu { display: block; position: fixed; inset: 64px 0 0 0; z-index: 35; background: rgba(15, 30, 45, 0.4); border: 0; }
    .principal { padding: 16px 14px 40px; }
  }
  @media (max-width: 600px) {
    .dossier, .eleve { display: none; }
    .entete { justify-content: space-between; }
  }
</style>
