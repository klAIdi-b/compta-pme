<script lang="ts">
  import { tick } from 'svelte';
  import { etat } from '../etat.svelte';
  import { lireProgression } from '../../io/apprendre';
  import { MODULES } from '../../data/apprendre';
  import { estDossier, exercicesDemo } from '../../data/demos';
  import { classerExercices, etiquetteNiveau, filiereDe, LIBELLES_FILIERE, LIBELLES_MODE, type Exercice, type Filiere } from '../../engine/exercice';
  import { EXT_EXERCICE, ErreurFichier, importerExercice, statutExport } from '../../io/fichiers';
  import { choisirFichiers } from '../fichiers-navigateur';
  import { EXT_SITUATION } from '../../io/simulation-extensions';
  // Simulateur : le lecteur de fichier de situation (et le moteur du jeu qu'il entraîne) n'est chargé que si on s'en sert.
  const lireSituation = async (texte: string) => (await import('../../io/simulation')).importerSituation(texte);
  import { simulationEleve } from '../simulation-eleve.svelte';
  import { avancementSession, avecCorrection } from '../avancement';
  import { dateHeure, normaliser } from '../format';
  import BarreAvancement from '../composants/BarreAvancement.svelte';
  import DemoEcriture from '../composants/DemoEcriture.svelte';
  import BandeauRubriques from '../composants/BandeauRubriques.svelte';
  import Differe from '../composants/Differe.svelte';
  import { exerciceDuLien, oublierLien } from '../lien';

  /** Page affichée : l'accueil, le choix d'un exercice ou l'évaluation (onglets du bandeau). */
  const page = $derived(etat.pageAccueil);

  // ---- Travail en cours (reprise) ----
  /** Session au moment de l'ouverture de l'accueil : sert seulement à préremplir le formulaire. */
  const depart = etat.genre === 'travail' ? etat.session : (Object.values(etat.autres)[0] ?? null);
  const enCours = $derived(etat.genre === 'travail' ? etat.session : null);
  const av = $derived(enCours ? avancementSession(enCours) : null);
  const correction = $derived(enCours ? avecCorrection(enCours) : false);
  const exporte = $derived(enCours ? statutExport(enCours.dossier, $state.snapshot(enCours.fiches), enCours.dernierExport) : 'vide');

  // ---- Lien direct donné par l'enseignant ----
  const lienId = exerciceDuLien();
  const exLien = lienId ? (exercicesDemo.find((e) => e.id === lienId) ?? null) : null;

  // ---- Exercices ----
  let importes = $state<Exercice[]>([]);
  const tous = $derived([...importes, ...exercicesDemo]);
  let erreurImport = $state('');

  /** Simulateur d'entreprise : un groupe ouvre le fichier de situation remis par l'enseignant. */
  async function ouvrirSituation() {
    erreurImport = '';
    const [f] = await choisirFichiers(`${EXT_SITUATION},.json`);
    if (!f) return;
    try {
      simulationEleve.ouvrir(await lireSituation(f.texte));
    } catch (e) {
      erreurImport = e instanceof ErreurFichier ? e.message : "Le fichier n'a pas pu être lu.";
    }
  }

  async function ouvrirFichier() {
    erreurImport = '';
    const [f] = await choisirFichiers(`${EXT_EXERCICE},${EXT_SITUATION},.json`);
    if (!f) return;
    if (f.texte.includes('"compta-pme/simulation-situation"')) {
      try {
        simulationEleve.ouvrir(await lireSituation(f.texte));
      } catch (e) {
        erreurImport = e instanceof ErreurFichier ? e.message : "Le fichier n'a pas pu être lu.";
      }
      return;
    }
    try {
      const ex = importerExercice(f.texte);
      importes = [ex, ...importes.filter((x) => x.id !== ex.id)];
      choix = ex.id;
      montrer(typeDe(ex));
    } catch (e) {
      erreurImport = e instanceof ErreurFichier ? e.message : "Le fichier n'a pas pu être lu.";
    }
  }

  let filiere = $state<Filiere>(exLien ? filiereDe(exLien) : (etat.prefs.filiere ?? (depart ? filiereDe(depart.exercice) : 'CFC')));
  function choisirFiliere(f: Filiere) {
    filiere = f;
    etat.prefs.filiere = f;
  }
  /** Onglets de la liste (choix de l'enseignant le 18.11.2026) : l'évaluation regroupe formative et sommative. */
  type TypeListe = 'entrainement' | 'evaluation';
  const typeDe = (ex: Exercice): TypeListe => (ex.mode === 'entrainement' ? 'entrainement' : 'evaluation');
  /** La liste suit la page : entraînement sur « Exercices », formative et sommative sur « Évaluation ». */
  const typeListe = $derived<TypeListe>(page === 'evaluation' ? 'evaluation' : 'entrainement');
  const montrer = (t: TypeListe) => etat.ouvrirRubrique(t === 'evaluation' ? 'evaluation' : 'exercices');
  // Lien direct vers une évaluation : la bonne page dès l'arrivée.
  if (exLien && typeDe(exLien) === 'evaluation' && etat.pageAccueil === 'exercices') etat.pageAccueil = 'evaluation';
  let recherche = $state('');
  let voirExercices = $state(true);
  let voirDossiers = $state(true);

  const correspond = (ex: Exercice) => {
    const r = normaliser(recherche.trim());
    if (!r) return true;
    return normaliser([ex.titre, ex.raisonSociale, ...(ex.sujets ?? [])].join(' ')).includes(r);
  };
  const visible = (ex: Exercice) => typeDe(ex) === typeListe && (estDossier(ex) ? voirDossiers : voirExercices) && correspond(ex);
  const importesVisibles = $derived(importes.filter((ex) => typeDe(ex) === typeListe));
  /** Exercice choisi, rappelé dans la barre « Commencer » toujours visible en bas de la liste. */
  const exChoisi = $derived(tous.find((x) => x.id === choix));
  const groupes = $derived(
    classerExercices(exercicesDemo)
      .filter((g) => g.filiere === filiere)
      .map((g) => ({ ...g, visibles: g.exercices.filter(visible) }))
      .filter((g) => g.visibles.length > 0),
  );
  const rechercheActive = $derived(recherche.trim().length > 0);

  function etatExercice(ex: Exercice): { texte: string; classe: string } {
    const s = etat.sessionDe(ex.id);
    const a = s ? avancementSession(s) : null;
    if (!s || !a) return { texte: '', classe: '' };
    const fini = avecCorrection(s) ? a.justes === a.total : a.saisies === a.total;
    return fini ? { texte: 'Terminé', classe: 'fini' } : { texte: `En cours · ${a.saisies} / ${a.total}`, classe: 'encours' };
  }

  // Autres exercices commencés dans ce navigateur (l'exercice actif a sa propre carte).
  const autres = $derived(Object.values(etat.autres).sort((a, b) => (b.derniereActivite ?? '').localeCompare(a.derniereActivite ?? '')));
  /** Élève dont le travail est enregistré dans ce navigateur. */
  const eleveConnu = $derived(enCours?.eleve ?? autres[0]?.eleve ?? null);

  // ---- Élève et démarrage ----
  let prenom = $state(depart?.eleve.prenom ?? '');
  let nom = $state(depart?.eleve.nom ?? '');
  let classe = $state(depart?.eleve.classe ?? '');
  let choix = $state(exLien?.id ?? depart?.exercice.id ?? '');
  let erreurs = $state<string[]>([]);
  /** Un autre élève sur le même ordinateur : confirmation avant d'effacer le travail enregistré. */
  let confirmer = $state(false);
  const meme = (a: string, b: string) => normaliser(a.trim()) === normaliser(b.trim());

  function commencer(e: SubmitEvent) {
    e.preventDefault();
    const err: string[] = [];
    if (!prenom.trim()) err.push('Indiquez votre prénom.');
    if (!nom.trim()) err.push('Indiquez votre nom.');
    if (!classe.trim()) err.push('Indiquez votre classe (par exemple 1CFC3).');
    const ex = tous.find((x) => x.id === choix);
    if (!ex) err.push('Choisissez un exercice dans la liste.');
    erreurs = err;
    if (err.length || !ex) return;
    const autreEleve = eleveConnu && !(meme(eleveConnu.prenom, prenom) && meme(eleveConnu.nom, nom));
    if (autreEleve && !confirmer) {
      confirmer = true;
      return;
    }
    if (autreEleve) etat.quitter();
    confirmer = false;
    oublierLien();
    etat.commencer({ prenom: prenom.trim(), nom: nom.trim(), classe: classe.trim() }, ex);
  }

  // Parcours « Apprendre » : notions maîtrisées dans ce navigateur (relu à chaque ouverture de l'accueil).
  const NB_MODULES = MODULES.length;
  const maitrises = Object.values(lireProgression()).filter((p) => p.maitrise).length;
  const nbEntrainement = exercicesDemo.filter((e) => e.mode === 'entrainement').length;

  // Portes d'entrée : l'exercice ou l'évaluation ouvre la liste, déjà filtrée, et la fait défiler à l'écran.
  // Entreprise fil rouge : les exercices de Cycles du Léman dans l'ordre, de la 1re à la 2e année.
  const FIL_ROUGE = [
    { id: 'demo-cfc1-cycles-du-leman', etape: 'Le premier trimestre : journal, bilan, bouclement' },
    { id: 'dossier-cfc2-cycles-du-leman-facturation', etape: 'Les factures et les paiements de mars' },
    { id: 'budget-cfc2-cycles-du-leman-journee', etape: 'Le budget de la Journée du vélo électrique' },
    { id: 'budget-cfc2-cycles-du-leman-trimestre', etape: 'Le budget du 2e trimestre et les comptes' },
  ]
    .map((x) => ({ ...x, ex: exercicesDemo.find((e) => e.id === x.id) }))
    .filter((x): x is { id: string; etape: string; ex: Exercice } => !!x.ex);
  function choisirFilRouge(ex: Exercice) {
    choisirFiliere(filiereDe(ex));
    montrer(typeDe(ex));
    recherche = '';
    choix = ex.id;
    tick().then(() => formulaire?.querySelector('.identite')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  /** Démonstration du premier écran : l'écriture a été validée par l'élève. */
  let demoJouee = $state(false);
  /** Valide l'écriture de la démonstration ; sur téléphone, amène le bilan à l'écran pour que l'effet se voie. */
  async function validerDemo() {
    demoJouee = true;
    await tick();
    const demo = document.querySelector('.premier .demo');
    if (!demo) return;
    const r = demo.getBoundingClientRect();
    if (r.bottom > window.innerHeight) {
      const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      demo.scrollIntoView({ block: 'end', behavior: calme ? 'auto' : 'smooth' });
    }
  }
  /** Phrase d'accueil de l'élève qui revient : où il en est dans son exercice. */
  const resumeRetour = $derived.by(() => {
    if (!enCours || !av) return 'Votre travail vous attend là où vous l’avez laissé.';
    const pieces = `${av.saisies} pièce${av.saisies > 1 ? 's' : ''} sur ${av.total}`;
    const debut = `Vous avez saisi ${pieces} chez ${enCours.dossier.raisonSociale}.`;
    if (correction && av.aRevoir > 0) return `${debut} Il vous en reste ${av.aRevoir} à revoir avant de continuer.`;
    if (av.saisies === av.total) return `${debut} Il reste à établir les comptes et à exporter votre copie.`;
    return debut;
  });

  let formulaire = $state<HTMLFormElement | null>(null);
  /** Portes de l'accueil : la page des exercices ou celle de l'évaluation s'ouvre, en haut. */
  const allerAuChoix = (t: TypeListe) => montrer(t);
</script>

<div class="page">
  <BandeauRubriques actif={page} />
  <main class="contenu">
    {#if page === 'accueil'}
    {#if enCours}
      <!-- L'élève revient : une seule action, reprendre (direction B de la maquette accueil-engageant). -->
      <section class="premier retour" aria-labelledby="titre-accueil">
        <div class="hero-texte">
          <p class="surtitre">CFC employé·e de commerce · Maturité professionnelle</p>
          <h1 id="titre-accueil">Bon retour, {enCours.eleve.prenom}.</h1>
          <p class="accroche">{resumeRetour}</p>
        </div>
        <div class="prochaine">
          <p class="surtitre">Votre prochaine étape</p>
          <h2 id="titre-reprise">{enCours.exercice.titre}</h2>
          <div class="discret petit">{etiquetteNiveau(enCours.exercice)} · {LIBELLES_MODE[enCours.exercice.mode]}</div>
          {#if av}
            <div class="reprise-avancement">
              <BarreAvancement a={av} {correction} largeur={260} /> <span class="petit num">{av.saisies} / {av.total} pièces saisies</span>
            </div>
            {#if correction}
              <div class="legende">
                <span><span class="pastille juste"></span>{av.justes} justes</span>
                <span><span class="pastille revoir"></span>{av.aRevoir} à revoir</span>
                <span><span class="pastille saisie"></span>{av.incompletes} incomplètes</span>
                <span>{av.nonSaisies} pas encore saisies</span>
              </div>
            {/if}
          {/if}
          <div class="discret petit meta-reprise">
            {#if enCours.derniereActivite}Dernière activité : {dateHeure(enCours.derniereActivite)} · {/if}
            {#if exporte === 'a-jour' && enCours.dernierExport}Copie exportée le {dateHeure(enCours.dernierExport.le)}
            {:else if exporte === 'modifie'}<span class="a-exporter">Modifiée depuis le dernier export</span>
            {:else if exporte === 'jamais'}<span class="a-exporter">Copie jamais exportée</span>{/if}
          </div>
          <button class="btn btn-principal btn-grand" onclick={() => etat.reprendre()}>Reprendre <span class="fleche" aria-hidden="true">→</span></button>
        </div>
      </section>
    {:else}
      <!-- Nouvel élève : le logiciel en action, et une première écriture en un clic (direction A). -->
      <section class="premier" aria-labelledby="titre-accueil">
        <div class="hero-texte">
          <p class="surtitre">CFC employé·e de commerce · Maturité professionnelle</p>
          <h1 id="titre-accueil">{eleveConnu ? `Bon retour, ${eleveConnu.prenom}.` : 'Passez votre première écriture.'}</h1>
          <p class="accroche">
            {#if demoJouee}Voilà ce que vous ferez ici : des écritures, et leur effet sur les comptes. Votre travail reste dans ce navigateur.
            {:else}Une opération, deux comptes, et le bilan bouge sous vos yeux. Essayez : validez l'écriture ci-contre.{/if}
          </p>
          <div class="actions-hero">
            {#if demoJouee}
              <button class="btn btn-principal btn-grand" onclick={() => allerAuChoix('entrainement')}>Continuer avec une vraie entreprise&nbsp;<span class="fleche" aria-hidden="true">→</span></button>
              <button class="btn btn-grand" onclick={() => (demoJouee = false)}>Rejouer la démonstration</button>
            {:else}
              <button class="btn btn-principal btn-grand" onclick={validerDemo}>Valider cette écriture</button>
              <button class="btn btn-grand" onclick={() => allerAuChoix('entrainement')}>Choisir un exercice&nbsp;<span class="fleche" aria-hidden="true">→</span></button>
            {/if}
          </div>
        </div>
        <DemoEcriture joue={demoJouee} />
      </section>
    {/if}

    {#if autres.length}
      <section class="carte" aria-labelledby="titre-autres">
        <h2 id="titre-autres" class="tete-simple">Vos autres exercices en cours</h2>
        {#each autres as s (s.exercice.id)}
          {@const a = avancementSession(s)}
          <div class="autre">
            <span class="infos">
              <strong>{s.exercice.titre}</strong><br />
              <span class="discret petit">
                {etiquetteNiveau(s.exercice)} · {LIBELLES_MODE[s.exercice.mode]}{s.derniereActivite ? ` · dernière activité : ${dateHeure(s.derniereActivite)}` : ''}
              </span>
            </span>
            {#if a}<span class="petit"><BarreAvancement {a} correction={avecCorrection(s)} largeur={120} /> {a.saisies} / {a.total}</span>{/if}
            <button class="btn" onclick={() => etat.commencer(s.eleve, s.exercice)}>Reprendre</button>
          </div>
        {/each}
      </section>
    {/if}

      <section class="choix-depart" aria-labelledby="titre-choix">
        <h2 id="titre-choix" class="titre-section">{enCours ? 'Ou bien, que voulez-vous faire ?' : 'Par où voulez-vous commencer ?'}</h2>
        <div class="portes">
          <button class="porte" onclick={() => etat.ouvrirRubrique('apprendre')}>
            <span class="porte-titre">Apprendre une notion</span>
            <span class="porte-texte">L'essentiel, un exemple travaillé et dix questions courtes, du bilan à la comptabilité analytique.</span>
            <span class="porte-meta">{maitrises > 0 ? `${maitrises} notion${maitrises > 1 ? 's' : ''} maîtrisée${maitrises > 1 ? 's' : ''} sur ${NB_MODULES}` : `${NB_MODULES} notions`}</span>
            <span class="porte-action">{maitrises > 0 ? 'Continuer le parcours' : 'Ouvrir le parcours'} <span class="fleche" aria-hidden="true">→</span></span>
          </button>
          <button class="porte" onclick={() => allerAuChoix('entrainement')}>
            <span class="porte-titre">M'exercer sur une entreprise</span>
            <span class="porte-texte">Tenez la comptabilité d'une entreprise : journal, bilan, bouclement, avec une correction à chaque écriture.</span>
            <span class="porte-meta">{nbEntrainement} exercices et dossiers de pièces</span>
            <span class="porte-action">Choisir un exercice <span class="fleche" aria-hidden="true">→</span></span>
          </button>
          <button class="porte" onclick={() => allerAuChoix('evaluation')}>
            <span class="porte-titre">Faire une évaluation</span>
            <span class="porte-texte">Ouvrez l'évaluation remise par votre enseignant, puis rendez votre copie dans Google Classroom.</span>
            <span class="porte-meta">Fichier remis par l'enseignant</span>
            <span class="porte-action">Ouvrir une évaluation <span class="fleche" aria-hidden="true">→</span></span>
          </button>
        </div>
        <div class="carte fil-rouge">
          <div class="tete-fil">
            <h3>Suivre une entreprise : Cycles du Léman</h3>
            <span class="discret petit">Le même magasin de vélos, d'étape en étape</span>
          </div>
          <ol class="etapes-fil">
            {#each FIL_ROUGE as x, i (x.id)}
              {@const st = etatExercice(x.ex)}
              <li>
                <button type="button" class="etape-fil" class:choisi={choix === x.id} onclick={() => choisirFilRouge(x.ex)}>
                  <span class="num-fil" class:fait={st.classe === 'fini'} aria-hidden="true">{st.classe === 'fini' ? '✓' : i + 1}</span>
                  <span class="texte-fil">{x.etape}<span class="discret petit">{etiquetteNiveau(x.ex)}{st.texte ? ` · ${st.texte}` : ''}</span></span>
                </button>
              </li>
            {/each}
          </ol>
        </div>
        <p class="aussi">
          Simulateur d'entreprise en groupe :
          <button class="btn-lien" onclick={ouvrirSituation}>ouvrir la situation de mon groupe</button>
        </p>
      </section>
    {:else if page === 'theorie'}
      <!-- Théorie ouverte sans exercice : l'élève choisit son année. Fichier chargé à la demande. -->
      <Differe charger={() => import('./Theorie.svelte')} props={{ libre: true }} />
    {:else}
    <!-- Pages « Exercices » et « Évaluation » : le choix en trois étapes, seul sur sa page. -->
    <section class="hero tete-page" aria-labelledby="titre-accueil">
      <p class="surtitre">{page === 'evaluation' ? 'Formative ou notée' : 'Entraînement, avec correction immédiate'}</p>
      <h1 id="titre-accueil">{page === 'evaluation' ? 'Faire une évaluation' : 'Choisir un exercice'}</h1>
      <p class="accroche">
        {#if page === 'evaluation'}Ouvrez le fichier remis par votre enseignant, indiquez votre nom, puis commencez. À la fin, vous rendrez votre copie dans Google Classroom.
        {:else}Choisissez votre formation, puis une entreprise. Votre travail s'enregistre dans ce navigateur : vous pouvez vous arrêter et reprendre plus tard.{/if}
      </p>
    </section>
    {#if exLien}
      <section class="carte lien" aria-labelledby="titre-lien">
        <h2 id="titre-lien" class="tete-simple">Exercice donné par votre enseignant</h2>
        <div class="corps-carte">
          <strong>{exLien.titre}</strong> <span class="discret petit">· {etiquetteNiveau(exLien)}</span>
          <p class="petit">Indiquez votre prénom, votre nom et votre classe plus bas, puis cliquez sur « {etat.sessionDe(exLien.id) ? 'Reprendre' : 'Commencer'} ».</p>
        </div>
      </section>
    {:else if lienId}
      <div class="alerte" role="alert">Ce lien ne correspond à aucun exercice du logiciel. Demandez un nouveau lien à votre enseignant, ou choisissez l'exercice dans la liste.</div>
    {/if}

    <form class="carte choisir" id="choisir-exercice" onsubmit={commencer} novalidate bind:this={formulaire}>
      <header class="tete-choisir">
        <h2>{page === 'evaluation' ? 'Votre évaluation' : eleveConnu ? 'Choisir un autre exercice' : 'Les exercices'}</h2>
        <ol class="etapes-choix" aria-label="Étapes">
          <li class:fait={!!filiere}>Formation</li>
          <li class:fait={!!exChoisi}>Exercice</li>
          <li class:fait={!!(prenom.trim() && nom.trim() && classe.trim())}>Vos informations</li>
        </ol>
      </header>

      <div class="corps-carte filtres">
        <div class="onglets" role="group" aria-label="Formation">
          {#each ['CFC', 'MP'] as const as f}
            <button type="button" aria-pressed={filiere === f} onclick={() => choisirFiliere(f)}>{LIBELLES_FILIERE[f]}</button>
          {/each}
        </div>
        <input
          class="champ recherche"
          type="search"
          bind:value={recherche}
          placeholder="Rechercher : TVA, salaires, titres…"
          aria-label="Rechercher un exercice"
        />
        <span class="cases">
          <label class="case"><input type="checkbox" bind:checked={voirExercices} /> Exercices</label>
          <label class="case"><input type="checkbox" bind:checked={voirDossiers} /> Dossiers de pièces</label>
        </span>
      </div>

      {#snippet ligne(ex: Exercice)}
        {@const st = etatExercice(ex)}
        <label class="exercice" class:choisi={choix === ex.id}>
          <input class="radio" type="radio" name="exercice" value={ex.id} bind:group={choix} />
          <span class="infos">
            <span class="ligne-titre">
              <strong>{ex.titre}</strong>
              <span class={`type ${estDossier(ex) ? 'dossier' : 'exo'}`}>{estDossier(ex) ? 'Dossier de pièces' : 'Exercice'}</span>
              {#if !exercicesDemo.includes(ex)}<span class="type exo">{LIBELLES_MODE[ex.mode]}</span>{/if}
            </span>
            <span class="discret petit">
              {ex.operations.length ? `${ex.operations.length} ${estDossier(ex) ? 'pièces' : 'opérations'}` : 'Fiche sans journal'}{ex.sujets?.length ? ` · ${ex.sujets.join(' · ')}` : ''}
            </span>
          </span>
          {#if st.texte}<span class={`etat ${st.classe}`}>{st.texte}</span>{/if}
        </label>
      {/snippet}

      {#if importesVisibles.length}
        <div class="bloc-niveaux">
          <h3 class="recus">{typeListe === 'evaluation' ? 'Évaluations reçues de votre enseignant' : 'Exercices reçus de votre enseignant'}</h3>
          <div class="cartes-exo">{#each importesVisibles as ex (ex.id)}{@render ligne(ex)}{/each}</div>
        </div>
      {/if}

      <div class="bloc-niveaux">
        {#each groupes as g (g.difficulte)}
          {@const ouvert = rechercheActive || g.visibles.some((x) => x.id === choix)}
          <details class="niveau" open={ouvert}>
            <summary>
              <span class="niveau-num">{g.difficulte}</span>
              <strong>{g.titre ?? `Niveau ${g.difficulte}`}</strong>
              <span class="discret petit">Niveau {g.difficulte} · {g.visibles.length} {g.visibles.length > 1 ? 'exercices' : 'exercice'}</span>
            </summary>
            <div class="cartes-exo">{#each g.visibles as ex (ex.id)}{@render ligne(ex)}{/each}</div>
          </details>
        {:else}
          {#if typeListe === 'evaluation' && !importesVisibles.length}
            <p class="vide">
              Aucune évaluation pour l'instant. Votre enseignant vous remet un fichier d'évaluation : ouvrez-le avec
              « Ouvrir un exercice reçu… » ci-dessous.
            </p>
          {:else if typeListe === 'entrainement' || rechercheActive}
            <p class="vide">Aucun exercice ne correspond à votre recherche.</p>
          {/if}
        {/each}
      </div>

      <div class="corps-carte ouvrir">
        <button type="button" class="btn" onclick={ouvrirFichier}>Ouvrir un exercice reçu…</button>
        <span class="discret petit">Fichier {EXT_EXERCICE} remis par votre enseignant.</span>
      </div>
      {#if erreurImport}<div class="alerte" role="alert" style="margin:0 20px 16px">{erreurImport}</div>{/if}

      <div class="corps-carte identite">
        <h3 class="sous-titre">Vos informations <span class="discret petit">pour votre copie</span></h3>
        <div class="grille">
          <div>
            <label class="bloc" for="prenom">Prénom</label>
            <input id="prenom" class="champ" bind:value={prenom} autocomplete="given-name" />
          </div>
          <div>
            <label class="bloc" for="nom">Nom</label>
            <input id="nom" class="champ" bind:value={nom} autocomplete="family-name" />
          </div>
          <div>
            <label class="bloc" for="classe">Classe</label>
            <input id="classe" class="champ" bind:value={classe} placeholder="par ex. 1CFC3" />
          </div>
        </div>
      </div>

      {#if erreurs.length}
        <div class="alerte" role="alert" style="margin:0 20px 16px">
          <ul>{#each erreurs as e}<li>{e}</li>{/each}</ul>
        </div>
      {/if}
      {#if confirmer && eleveConnu}
        <div class="alerte" role="alert" style="margin:0 20px 16px">
          Ce navigateur contient le travail de {eleveConnu.prenom} {eleveConnu.nom}. Si vous n'êtes pas cette personne, ce
          travail sera effacé pour laisser la place au vôtre. S'il doit être rendu, reprenez-le d'abord et cliquez sur
          « Exporter ma copie ».
          <div class="actions-confirmation">
            <button type="submit" class="btn btn-principal">Effacer et commencer</button>
            <button type="button" class="btn" onclick={() => (confirmer = false)}>Annuler</button>
          </div>
        </div>
      {:else}
        <div class="actions">
          <span class="choisi-texte">
            {#if exChoisi}<span class="discret">Exercice choisi :</span> <b>{exChoisi.titre}</b>{:else}<span class="discret">Choisissez un exercice dans la liste.</span>{/if}
          </span>
          <button type="submit" class="btn btn-principal btn-grand">{etat.sessionDe(choix) ? 'Reprendre' : 'Commencer'}</button>
        </div>
      {/if}
    </form>
    {/if}
    <p class="pied-page discret petit">
      Compta PME · plan comptable PME suisse · aucune donnée envoyée en ligne.
    </p>
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .contenu { max-width: 1120px; margin: 0 auto; padding: 40px 20px 56px; }
  .hero { margin-bottom: 28px; }
  .tete-page { margin-bottom: var(--e-5); }
  .tete-page h1 { font-size: var(--t-26); max-width: none; }
  .surtitre { margin: 0 0 10px; font-size: var(--t-13); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--c-action-fonce); }
  .hero h1, .premier h1 { font-size: var(--t-titre); line-height: 1.08; letter-spacing: -0.03em; max-width: 18ch; }
  /* Premier écran : le texte et une action à gauche, le logiciel en action (ou la reprise) à droite. */
  .premier { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: var(--e-6); align-items: center; margin-bottom: var(--e-6); padding-top: var(--e-4); }
  .premier.retour { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
  .hero-texte { display: flex; flex-direction: column; align-items: flex-start; gap: var(--e-4); min-width: 0; animation: arrive 0.4s ease both; }
  .hero-texte .accroche { margin: 0; }
  .hero-texte .surtitre { margin: 0; }
  .actions-hero { display: flex; gap: var(--e-3); flex-wrap: wrap; }
  .premier :global(.demo), .prochaine { animation: arrive 0.45s ease 0.1s both; }
  .prochaine { background: var(--c-fond); border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); box-shadow: var(--ombre-haute); padding: var(--e-5); display: flex; flex-direction: column; gap: var(--e-2); min-width: 0; }
  .prochaine h2 { font-size: var(--t-20); letter-spacing: -0.01em; }
  .prochaine .surtitre { margin: 0; }
  .prochaine .btn { margin-top: var(--e-3); align-self: stretch; justify-content: center; }
  .fleche { display: inline-block; transition: transform 0.15s; }
  button:hover .fleche { transform: translateX(3px); }
  /* Arrivée par un léger glissement, sans fondu : le texte reste lisible (contraste) dès la première image. */
  @keyframes arrive { from { transform: translateY(10px); } to { transform: none; } }
  .accroche { margin: 14px 0 0; font-size: var(--t-17); color: var(--c-texte-2); max-width: 60ch; line-height: 1.55; }
  .carte + .carte, .carte + form, section + form, section + section { margin-top: 20px; }
  .tete-simple { padding: 16px 20px; border-bottom: 1px solid var(--c-bordure-3); }
  .lien { border-left: 4px solid var(--c-structure); margin-bottom: 20px; }
  .lien p { margin: 6px 0 0; }
  .reprise-avancement { margin-top: 6px; display: flex; align-items: center; gap: 6px 10px; flex-wrap: wrap; }
  .meta-reprise { margin-top: 2px; }
  .legende { display: flex; gap: 14px; font-size: var(--t-12); color: var(--c-texte-2); flex-wrap: wrap; }
  .pastille { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; }
  .pastille.juste { background: var(--c-ok); }
  .pastille.revoir { background: var(--c-accent); }
  .pastille.saisie { background: #8fa9c4; }
  .a-exporter { color: var(--c-alerte-texte); font-weight: bold; }
  .titre-section { font-size: var(--t-20); letter-spacing: -0.015em; margin-bottom: 14px; }
  .portes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .porte {
    font: inherit; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 8px; padding: 22px 22px 20px;
    background: #fff; border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); box-shadow: var(--ombre-carte); color: var(--c-texte);
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  }
  .porte:hover { border-color: #b9cde1; box-shadow: var(--ombre-haute); transform: translateY(-2px); }
  .porte-titre { font-family: var(--police-titre); font-size: var(--t-20); font-weight: 700; color: var(--c-encre); letter-spacing: -0.01em; }
  .porte-texte { color: var(--c-texte-2); line-height: 1.5; flex: 1; }
  .porte-meta { font-size: var(--t-13); color: var(--c-texte-2); }
  .porte-action { font-weight: 650; color: var(--c-action); margin-top: 4px; }
  .fil-rouge { margin-top: 16px; }
  .tete-fil { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; padding: 16px 20px 0; }
  .tete-fil h3 { margin: 0; font-size: var(--t-17); color: var(--c-encre); }
  .etapes-fil { list-style: none; margin: 0; padding: 12px 14px 14px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .etape-fil {
    font: inherit; text-align: left; width: 100%; height: 100%; display: flex; gap: 10px; align-items: flex-start; padding: 10px;
    border: 1px solid transparent; border-radius: var(--r-3); background: none; cursor: pointer; color: var(--c-texte);
  }
  .etape-fil:hover { background: #f5f8fc; }
  .etape-fil.choisi { border-color: var(--c-structure); background: #f5f9fd; }
  .num-fil { width: 26px; height: 26px; border-radius: 50%; flex: none; display: grid; place-items: center; font-weight: 700; font-size: var(--t-13); background: var(--c-bleu-doux); color: var(--c-structure); }
  .num-fil.fait { background: var(--c-ok-fond); color: var(--c-ok); }
  .texte-fil { display: flex; flex-direction: column; gap: 2px; font-weight: 600; line-height: 1.35; }
  .texte-fil .discret { font-weight: normal; }
  @media (max-width: 860px) { .etapes-fil { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 520px) { .etapes-fil { grid-template-columns: 1fr; } }
  .aussi { margin: 14px 2px 0; color: var(--c-texte-2); }
  .choisir { overflow: visible; scroll-margin-top: 80px; }
  .tete-choisir { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; padding: 18px 20px; border-bottom: 1px solid var(--c-bordure-3); }
  .tete-choisir h2 { font-size: var(--t-20); }
  .etapes-choix { list-style: none; display: flex; gap: 8px; margin: 0; padding: 0; counter-reset: e; flex-wrap: wrap; }
  .etapes-choix li { counter-increment: e; font-size: var(--t-13); color: var(--c-texte-2); display: flex; align-items: center; gap: 6px; }
  .etapes-choix li::before { content: counter(e); width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: var(--t-12); font-weight: 700; background: #eceff4; color: var(--c-texte-2); }
  .etapes-choix li.fait { color: var(--c-ok); font-weight: 600; }
  .etapes-choix li.fait::before { content: '✓'; background: var(--c-ok-fond); color: var(--c-ok); }
  .etapes-choix li + li::after { content: none; }
  .filtres { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .onglets { display: inline-flex; background: #eceff4; border-radius: var(--r-3); padding: 4px; gap: 2px; }
  .onglets button { font: inherit; border: 0; background: transparent; color: var(--c-texte-2); padding: 0 16px; min-height: 34px; cursor: pointer; border-radius: var(--r-2); font-weight: 500; }
  @media (pointer: coarse) { .onglets button { min-height: 44px; } }
  .onglets button[aria-pressed='true'] { background: #fff; color: var(--c-structure); font-weight: 650; box-shadow: var(--ombre); }
  .recherche { width: 240px; max-width: 100%; }
  .cases { display: inline-flex; gap: 14px; }
  .case { display: inline-flex; gap: 6px; align-items: center; font-size: var(--t-14); }
  .bloc-niveaux { border-top: 1px solid var(--c-bordure-2); }
  .recus { font-size: var(--t-15); color: var(--c-structure); margin: 0; padding: 14px 20px 0; }
  details.niveau + details.niveau { border-top: 1px solid var(--c-bordure-3); }
  details.niveau > summary { padding: 14px 20px; cursor: pointer; display: flex; gap: 12px; align-items: center; list-style: none; }
  details.niveau > summary::-webkit-details-marker { display: none; }
  details.niveau > summary::after { content: '›'; margin-left: 4px; font-size: var(--t-20); color: var(--c-texte-2); transition: transform 0.15s; }
  details.niveau[open] > summary::after { transform: rotate(90deg); }
  details.niveau > summary:hover { background: var(--c-zebra); }
  details.niveau > summary strong { color: var(--c-encre); flex: 1; font-size: var(--t-15); }
  .niveau-num { width: 28px; height: 28px; border-radius: var(--r-3); display: grid; place-items: center; font-weight: 700; font-size: var(--t-13); background: var(--c-bleu-doux); color: var(--c-structure); flex: none; }
  .cartes-exo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 6px 20px 20px; }
  .exercice {
    display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border: 1px solid var(--c-bordure-2); border-radius: var(--r-3);
    cursor: pointer; background: #fff; transition: border-color 0.12s, box-shadow 0.12s;
  }
  .exercice:hover { border-color: #b8c7d8; box-shadow: var(--ombre-carte); }
  .exercice.choisi { border-color: var(--c-structure); box-shadow: 0 0 0 2px var(--c-structure); background: #f5f9fd; }
  .exercice .radio {
    appearance: none; width: 20px; height: 20px; margin: 2px 0 0; flex: none; border-radius: 50%;
    border: 2px solid var(--c-bordure); background: #fff; cursor: pointer;
  }
  .exercice .radio:checked { border-color: var(--c-structure); background: var(--c-structure); box-shadow: inset 0 0 0 3px #fff; }
  .exercice .radio:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }
  .infos { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .ligne-titre { display: flex; flex-wrap: wrap; gap: 6px; align-items: baseline; }
  .ligne-titre strong { color: var(--c-encre); }
  .type { display: inline-block; font-size: var(--t-12); font-weight: 700; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
  .type.dossier { background: var(--c-alerte-fond); color: var(--c-alerte-texte); border: 1px solid #f2c7ad; }
  .type.exo { background: var(--c-selection); color: var(--c-structure); }
  .etat { font-size: var(--t-12); font-weight: bold; white-space: nowrap; }
  .etat.encours { color: var(--c-action); }
  .etat.fini { color: var(--c-ok); }
  .vide { padding: 18px 20px; color: var(--c-texte-2); margin: 0; }
  .petit { font-size: var(--t-13); }
  .ouvrir { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--c-bordure-2); flex-wrap: wrap; }
  .identite { border-top: 1px solid var(--c-bordure-2); background: var(--c-zebra); }
  .sous-titre { font-size: var(--t-15); margin: 0 0 12px; display: flex; gap: 8px; align-items: baseline; }
  .grille { display: grid; grid-template-columns: 1fr 1fr 180px; gap: 14px; }
  .actions {
    position: sticky; bottom: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 14px;
    padding: 14px 20px; background: var(--c-fond); border-top: 1px solid var(--c-bordure-2);
    border-radius: 0 0 var(--rayon) var(--rayon);
  }
  .choisi-texte { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .autre { display: flex; gap: 16px; align-items: center; padding: 12px 20px; border-top: 1px solid var(--c-bordure-2); flex-wrap: wrap; }
  .tete-simple + .autre { border-top: 0; }
  .actions-confirmation { display: flex; gap: 8px; margin-top: 10px; }
  .pied-page { text-align: center; margin: 28px 0 0; }
  @media (max-width: 860px) { .portes { grid-template-columns: 1fr; } }
  @media (max-width: 760px) { .cartes-exo { grid-template-columns: 1fr; } }
  @media (max-width: 640px) {
    .choisi-texte { white-space: normal; }
    .reprise-avancement :global(.barre) { max-width: 100%; flex: 1 1 160px; }
    .grille { grid-template-columns: 1fr; }
    .contenu { padding: 28px 16px 40px; }
    .accroche { font-size: var(--t-17); }
    .premier, .premier.retour { grid-template-columns: minmax(0, 1fr); gap: var(--e-4); padding-top: 0; margin-bottom: var(--e-5); }
    .actions-hero { width: 100%; }
    .actions-hero .btn { flex: 1 1 100%; justify-content: center; }
    .prochaine { padding: var(--e-4); }
  }
  @media (max-width: 960px) and (min-width: 641px) { .premier, .premier.retour { grid-template-columns: minmax(0, 1fr); } }
  @media (prefers-reduced-motion: reduce) {
    .porte:hover { transform: none; }
    .hero-texte, .premier :global(.demo), .prochaine { animation: none; }
    .fleche { transition: none; }
    button:hover .fleche { transform: none; }
  }
</style>
