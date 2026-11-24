<!-- Parcours « Apprendre » : modules par notion (découvrir, exemple travaillé, série d'exercices courts, maîtrise). -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { LIBELLES_NIVEAU_APPRENDRE, MODULES, modeleParId, type ModuleApprendre, type NiveauApprendre } from '../../data/apprendre';
  import { champJuste, genererCalcul, SUJET_TRI, valeurLisible, type QuestionGeneree } from '../../engine/calculs';
  import { genererEcriture } from '../../engine/ecritures-generees';
  import { CHAPITRES } from '../../data/theorie';
  import { plan } from '../../data/plan';
  import {
    credit as partReussie, estJuste, genererSerie, montantModele, hasard, raisonnement, seuilMaitrise, texteOperation, VARIATIONS,
    type Question, type Reponse,
  } from '../../engine/exercices-courts';
  import { erreurTypique } from '../../engine/erreurs-typiques';
  import { formatMontant, lireMontant } from '../../engine/money';
  import type { TypeCompte } from '../../engine/plan';
  import { LECONS, exemplesDe } from '../../data/lecons';
  import BandeauRubriques from '../composants/BandeauRubriques.svelte';
  import { enregistrerRevision, enregistrerSerie, lireProgression, type Progression } from '../../io/apprendre';
  import { aRevoir } from '../../engine/revision';
  import { EXT_PROGRESSION, exporterProgression } from '../../io/progression';
  import { nomFichier } from '../../io/fichiers';
  import { telecharger } from '../fichiers-navigateur';
  import { dt } from '../format';
  import { lienTheorie } from '../lien';

  const NB = 10;
  /** Points d'une série : un chiffre après la virgule seulement s'il est utile. */
  const pts = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace('.', ','));
  const intitules = new Map(plan.map((c) => [c.numero, c.intitule]));
  const nom = (n: string) => intitules.get(n) ?? n;
  const m = (c: number) => formatMontant(c);
  const LIBELLE_TYPE: Record<TypeCompte, string> = { actif: 'Actif', passif: 'Passif', charge: 'Charge', produit: 'Produit', bouclement: 'Bouclement' };

  let progression = $state<Progression>(lireProgression());
  let module = $state.raw<ModuleApprendre | null>(null);
  let etape = $state<'decouvrir' | 'serie' | 'bilan' | 'projection'>('decouvrir');

  // Série en cours
  let questions = $state<Question[]>([]);
  let rang = $state(0);
  let justes = $state(0);
  let corrigee = $state(false);
  let juste = $state(false);
  // Réponses en cours de saisie
  let choix = $state<number | null>(null);
  let type = $state<TypeCompte | null>(null);
  let debit = $state('');
  let credit = $state('');
  let montantSaisi = $state('');
  let cote = $state<'debiteur' | 'crediteur' | null>(null);
  let valeurs = $state<string[]>([]);
  let comptesLignes = $state<string[]>([]);

  const q = $derived(questions[rang] ?? null);
  const chapitre = $derived(module ? CHAPITRES.find((c) => c.id === module!.chapitre) ?? null : null);
  const exemple = $derived.by(() => {
    if (!module || !module.exemple) return null;
    const mo = modeleParId(module.exemple);
    const montant = montantModele(hasard(7), mo);
    return { texte: texteOperation(mo, montant), debit: mo.debit, credit: mo.credit, montant, etapes: raisonnement(plan, mo.debit, mo.credit) };
  });
  const comptesTries = $derived(q && q.format === 'ecriture' ? [...q.comptes].sort((a, b) => nom(a).localeCompare(nom(b), 'fr')) : []);
  /** Exemple travaillé d'un module de calcul : une question générée avec ses réponses et son explication. */
  const exempleCalcul = $derived<QuestionGeneree | null>(module?.calculs?.length ? genererCalcul(module.calculs[0]!, hasard(7), { plan, modeles: module.modeles.map(modeleParId) }) : null);
  const exempleComposee = $derived(module?.ecritures?.length ? genererEcriture(module.ecritures[0]!, hasard(7)) : null);
  const comptesModule = $derived(module ? [...module.comptes].sort((a, b) => nom(a).localeCompare(nom(b), 'fr')) : []);
  const NIVEAUX: NiveauApprendre[] = ['CFC1', 'CFC2', 'MP'];
  // Ordre affiché dans la liste : par formation, puis dans l'ordre du cours.
  const ORDRE = NIVEAUX.flatMap((niv) => MODULES.filter((x) => x.niveau === niv));
  const indexModule = $derived(module ? ORDRE.indexOf(module) : -1);
  const suivant = $derived(indexModule >= 0 && indexModule < ORDRE.length - 1 ? ORDRE[indexModule + 1]! : null);
  const precedent = $derived(indexModule > 0 ? ORDRE[indexModule - 1]! : null);
  const lecon = $derived(module ? LECONS[module.id] : undefined);

  function haut() {
    document.querySelector('.contenu-apprendre')?.scrollIntoView({ block: 'start' });
    window.scrollTo({ top: 0 });
  }

  function ouvrir(mod: ModuleApprendre | null) {
    module = mod;
    etape = 'decouvrir';
    haut();
  }

  function reinitialiserReponse() {
    choix = null; type = null; debit = ''; credit = ''; montantSaisi = ''; cote = null;
    valeurs = q && q.format === 'calcul' ? q.champs.map(() => '') : [];
    comptesLignes = q && q.format === 'composee' ? q.lignes.map(() => '') : [];
    corrigee = false; juste = false;
  }

  const contexte = (mod: ModuleApprendre) => ({
    plan, modeles: mod.modeles.map(modeleParId), comptes: mod.comptes, types: mod.types, calculs: mod.calculs, ecritures: mod.ecritures,
  });
  const graine = () => Math.floor(Math.random() * 2 ** 31);

  /**
   * Trois sortes de séries : la série notée du module ; l'entraînement guidé (exemples estompés : une partie de
   * l'écriture est déjà donnée, de moins en moins) ; la révision du jour (une question par notion à confirmer).
   */
  let mode = $state<'serie' | 'guide' | 'revision'>('serie');
  let modulesRevision = $state.raw<ModuleApprendre[]>([]);
  /** Parties de la réponse déjà données dans l'entraînement guidé. */
  let donne = $state<{ debit: boolean; credit: boolean; lignes: boolean[] }>({ debit: false, credit: false, lignes: [] });

  const aujourdhui = () => new Date().toISOString().slice(0, 10);
  const dus = $derived(aRevoir(progression, aujourdhui()).map((id) => MODULES.find((x) => x.id === id)).filter((x): x is ModuleApprendre => !!x));
  const guidePossible = $derived(!!module && (module.formats.includes('ecriture') || module.formats.includes('composee')));

  function preparerQuestion() {
    reinitialiserReponse();
    const qs = questions[rang];
    valeurs = qs && qs.format === 'calcul' ? qs.champs.map(() => '') : [];
    comptesLignes = qs && qs.format === 'composee' ? qs.lignes.map(() => '') : [];
    donne = { debit: false, credit: false, lignes: [] };
    if (mode !== 'guide' || !qs) return;
    // Aide qui s'estompe : question 1 presque résolue, question 2 à moitié, question 3 sans aide.
    if (qs.format === 'ecriture') {
      if (rang === 0) { debit = qs.reponse.debit; donne.debit = true; }
      if (rang === 1) { credit = qs.reponse.credit; donne.credit = true; }
    } else if (qs.format === 'composee') {
      const n = rang === 0 ? qs.lignes.length - 1 : rang === 1 ? Math.floor(qs.lignes.length / 2) : 0;
      donne.lignes = qs.lignes.map((_, i) => i < n);
      comptesLignes = qs.lignes.map((l, i) => (i < n ? l.compte : ''));
    }
  }

  function lancer(m2: 'serie' | 'guide' | 'revision') {
    mode = m2;
    rang = 0;
    justes = 0;
    preparerQuestion();
    etape = 'serie';
    haut();
  }

  // ---- Question au projecteur : la classe répond à main levée, l'enseignant révèle la réponse (aucun réseau). ----
  let qProj = $state.raw<Question | null>(null);
  let revele = $state(false);
  function projeter() {
    if (!module) return;
    qProj = genererSerie(contexte(module), module.formats, 1, graine())[0] ?? null;
    revele = false;
    etape = 'projection';
    haut();
  }
  interface VueProjection { consigne: string; enonce: string[]; tableau?: { entetes: string[]; lignes: string[][] }; choix: string[]; reponse: string[] }
  const cotes = (l: { cote: string; compte: string; montant: number }) => `${l.cote === 'debit' ? 'Débit' : 'Crédit'} ${nom(l.compte)} ${m(l.montant)}`;
  function vueProjection(x: Question): VueProjection {
    switch (x.format) {
      case 'classer': return { consigne: 'Dans quelle catégorie se trouve ce compte ?', enonce: [nom(x.compte)], choix: x.choix.map((t) => LIBELLE_TYPE[t]), reponse: [LIBELLE_TYPE[x.reponse]] };
      case 'variation': return { consigne: "Quel est l'effet de cette opération sur le bilan ?", enonce: [x.texte], choix: x.choix, reponse: [x.choix[x.reponse]!] };
      case 'ecriture': return { consigne: "Quelle est l'écriture ?", enonce: [x.texte], choix: [], reponse: [`Débit ${nom(x.reponse.debit)}`, `Crédit ${nom(x.reponse.credit)}`, ...raisonnement(plan, x.reponse.debit, x.reponse.credit)] };
      case 'operation': return { consigne: 'Quelle opération correspond à cette écriture ?', enonce: [`Débit ${nom(x.debit)} / Crédit ${nom(x.credit)} · ${m(x.montant)}`], choix: x.choix, reponse: [x.choix[x.reponse]!] };
      case 'erreur': return { consigne: 'Une seule de ces écritures est fausse. Laquelle ?', enonce: [], choix: x.lignes.map((l) => `${l.texte} → débit ${nom(l.debit)}, crédit ${nom(l.credit)}`), reponse: [`L'écriture fausse : ${x.lignes[x.reponse]!.texte}`] };
      case 'solde': return { consigne: 'Quel est le solde final de ce compte ?', enonce: [nom(x.compte), `Solde initial ${m(x.initial)} · débits ${x.debits.map(m).join(', ') || '—'} · crédits ${x.credits.map(m).join(', ') || '—'}`], choix: [], reponse: [`${m(x.reponse.montant)}, solde ${x.reponse.cote === 'debiteur' ? 'débiteur' : 'créditeur'}`] };
      case 'composee': return { consigne: 'Quels comptes pour cette écriture ?', enonce: [x.texte, ...x.lignes.map((l) => `${l.cote === 'debit' ? 'Débit' : 'Crédit'} … ${m(l.montant)}`)], choix: [], reponse: x.lignes.map(cotes) };
      case 'calcul': return { consigne: x.sujet, enonce: [...x.enonce, ...x.champs.map((c) => `→ ${c.libelle} ?`)], tableau: x.tableau, choix: [], reponse: [...x.champs.map((c) => `${c.libelle} : ${valeurLisible(c)}`), ...x.explication] };
      case 'qcm': return { consigne: x.sujet, enonce: [x.question], choix: x.choix, reponse: [x.choix[x.reponse]!, x.explication] };
    }
  }
  const proj = $derived(qProj ? vueProjection(qProj) : null);

  function commencerSerie() {
    if (!module) return;
    questions = genererSerie(contexte(module), module.formats, NB, graine());
    lancer('serie');
  }

  function commencerGuide() {
    if (!module) return;
    const format = module.formats.includes('composee') ? 'composee' : 'ecriture';
    questions = genererSerie(contexte(module), [format], 3, graine());
    lancer('guide');
  }

  /** Révision du jour : une question par notion à confirmer (cinq au plus), notions mélangées. */
  function commencerRevision() {
    modulesRevision = dus.slice(0, 5);
    if (!modulesRevision.length) return;
    questions = modulesRevision.map((mod) => genererSerie(contexte(mod), mod.formats, 1, graine())[0]!);
    module = modulesRevision[0]!;
    lancer('revision');
  }

  function reponse(): Reponse | null {
    if (!q) return null;
    switch (q.format) {
      case 'composee': return comptesLignes.every((c) => c) ? { format: 'composee', comptes: [...comptesLignes] } : null;
      case 'calcul': return valeurs.every((v) => (v ?? '').trim() !== '') ? { format: 'calcul', valeurs: [...valeurs] } : null;
      case 'qcm': return choix === null ? null : { format: 'qcm', choix };
      case 'classer': return type ? { format: 'classer', type } : null;
      case 'variation': case 'operation': case 'erreur': return choix === null ? null : { format: q.format, choix };
      case 'ecriture': return debit && credit ? { format: 'ecriture', debit, credit } : null;
      case 'solde': {
        const v = lireMontant(montantSaisi);
        return v === null || !cote ? null : { format: 'solde', montant: v, cote };
      }
    }
  }
  const prete = $derived(reponse() !== null);

  function verifier() {
    const r = reponse();
    if (!q || !r || corrigee) return;
    juste = estJuste(q, r);
    const part = partReussie(q, r);
    justes += part;
    corrigee = true;
    if (mode === 'revision') progression = enregistrerRevision(progression, module!.id, part >= 0.75);
  }

  function continuer() {
    if (rang < questions.length - 1) {
      rang++;
      if (mode === 'revision') module = modulesRevision[rang]!;
      preparerQuestion();
      return;
    }
    if (mode === 'serie') progression = enregistrerSerie(progression, module!.id, justes, questions.length, justes >= seuilMaitrise(questions.length));
    etape = 'bilan';
    haut();
  }

  const typique = $derived(
    q && q.format === 'ecriture' && corrigee && !juste && debit && credit
      ? erreurTypique([{ debit, credit, montant: q.montant }], [{ debit: q.reponse.debit, credit: q.reponse.credit, montant: q.montant }])
      : null,
  );
  const reussi = $derived(justes >= seuilMaitrise(questions.length || NB));

  // Envoi de la progression à l'enseignant : un fichier à rendre dans Google Classroom (rien ne passe en ligne).
  const connu = etat.session?.eleve ?? Object.values(etat.autres)[0]?.eleve;
  let prenomE = $state(connu?.prenom ?? '');
  let nomE = $state(connu?.nom ?? '');
  let classeE = $state(connu?.classe ?? '');
  let envoye = $state(false);
  function envoyerProgression(e: SubmitEvent) {
    e.preventDefault();
    if (!prenomE.trim() || !nomE.trim() || !classeE.trim()) return;
    const eleve = { prenom: prenomE.trim(), nom: nomE.trim(), classe: classeE.trim() };
    telecharger(
      nomFichier([eleve.nom, eleve.prenom, eleve.classe, 'progression'], EXT_PROGRESSION),
      exporterProgression({ eleve, exporteLe: new Date().toISOString(), progression: $state.snapshot(progression) }),
    );
    envoye = true;
  }

  function fermer() {
    etat.apprendre = false;
  }
</script>

{#snippet navigationModules()}
  <nav class="nav-modules" aria-label="Autres modules">
    {#if precedent}
      <button class="btn nav-item" onclick={() => ouvrir(precedent)}>
        <span class="sens"><span aria-hidden="true">←</span> Module précédent</span><span class="nom">{precedent.titre}</span>
      </button>
    {/if}
    <button class="btn-lien nav-menu" onclick={() => ouvrir(null)}>Tous les modules</button>
    {#if suivant}
      <button class="btn nav-item droite" onclick={() => ouvrir(suivant)}>
        <span class="sens">Module suivant <span aria-hidden="true">→</span></span><span class="nom">{suivant.titre}</span>
      </button>
    {/if}
  </nav>
{/snippet}

<div class="page">
  <BandeauRubriques actif="apprendre" fermer={etat.session && !etat.accueilOuvert ? fermer : undefined} />

  <main class="contenu contenu-apprendre">
    {#if !module}
      <div class="titre"><h1>Apprendre pas à pas</h1><span class="sous">CFC et maturité professionnelle</span></div>
      <p class="intro">
        Une notion à la fois, dans l'ordre du cours : vous lisez l'essentiel, vous suivez un exemple, puis vous vous
        entraînez sur une série de {NB} questions courtes. Avec {seuilMaitrise(NB)} points sur {NB}, la notion est
        maîtrisée. Chaque série est nouvelle : vous pouvez recommencer autant de fois que nécessaire.
      </p>
      {#if dus.length}
        <section class="carte revision-jour">
          <div class="corps-carte ligne-revision">
            <div>
              <h2>Révision du jour</h2>
              <p>{dus.length} notion{dus.length > 1 ? 's' : ''} à confirmer : {Math.min(dus.length, 5)} question{Math.min(dus.length, 5) > 1 ? 's' : ''}, quelques minutes. Se souvenir quelques jours plus tard, c'est ce qui fait retenir.</p>
            </div>
            <button class="btn btn-principal" onclick={commencerRevision}>Commencer la révision</button>
          </div>
        </section>
      {/if}
      {#each NIVEAUX as niv (niv)}
      <h2 class="niveau">{LIBELLES_NIVEAU_APPRENDRE[niv]}</h2>
      <ol class="modules">
        {#each MODULES.filter((x) => x.niveau === niv) as mod, i (mod.id)}
          {@const p = progression[mod.id]}
          <li class="carte module">
            <span class="rang" aria-hidden="true">{i + 1}</span>
            <div class="texte">
              <button class="lien-module" onclick={() => ouvrir(mod)}>{mod.titre}</button>
              <span class="discret">{mod.objectif}</span>
            </div>
            <span class="etat" class:maitrise={p?.maitrise}>
              {#if p?.maitrise}Maîtrisé{#if p.revision}<span class="echeance">&nbsp;· à confirmer le {dt(p.revision.prochaine).slice(0, 5)}</span>{/if}{:else if p}Meilleur score {pts(p.meilleur)} / {p.sur}{:else}À faire{/if}
            </span>
          </li>
        {/each}
      </ol>
      {/each}
      <details class="carte envoi">
        <summary>Envoyer ma progression à l'enseignant</summary>
        <form class="corps-carte" onsubmit={envoyerProgression}>
          <p>Téléchargez votre fichier de progression, puis rendez-le dans le devoir Google Classroom.</p>
          <div class="grille-envoi">
            <label>Prénom <input class="champ" bind:value={prenomE} required autocomplete="given-name" /></label>
            <label>Nom <input class="champ" bind:value={nomE} required autocomplete="family-name" /></label>
            <label>Classe <input class="champ" bind:value={classeE} required placeholder="par ex. 1CFC3" /></label>
            <button class="btn btn-principal" type="submit">Télécharger le fichier</button>
          </div>
          {#if envoye}<p class="ok" role="status">Fichier téléchargé : déposez-le dans le devoir Classroom.</p>{/if}
        </form>
      </details>
      <nav class="nav-modules" aria-label="Navigation">
        <button class="btn" onclick={() => etat.allerAccueil()}><span aria-hidden="true">←</span> Retour à la page d'accueil</button>
      </nav>
      <p class="discret petit">
        Votre progression reste dans ce navigateur. Les exercices complets (journal, bilan, bouclement) se trouvent sur
        la page d'accueil.
      </p>
    {:else if etape === 'decouvrir'}
      <nav class="fil"><button class="btn-lien" onclick={() => ouvrir(null)}>Tous les modules</button><span class="discret">Module {indexModule + 1} sur {MODULES.length}</span></nav>
      <div class="titre"><h1>{module.titre}</h1></div>
      <section class="carte">
        <h2>Objectif</h2>
        <div class="corps-carte">
          <p>{module.objectif}</p>
          {#if module.plan?.length}<p class="discret petit">Plan d'études : {module.plan.join(' · ')}</p>{/if}
        </div>
      </section>
      {#if lecon}
        <section class="carte lecon">
          <h2>La leçon</h2>
          <div class="corps-carte">
            {#if lecon.length > 3}
              <nav class="sommaire-lecon" aria-label="Plan de la leçon">
                <ol>
                  {#each lecon as partie, i (partie.titre)}
                    <li><a href={`#partie-${i + 1}`} onclick={(e) => { e.preventDefault(); document.getElementById(`partie-${i + 1}`)?.scrollIntoView({ block: 'start' }); }}>{partie.titre.replace(/^\d+\.\s*/, '')}</a></li>
                  {/each}
                </ol>
              </nav>
            {/if}
            {#each lecon as partie, i (partie.titre)}
              <article class="partie" id={`partie-${i + 1}`}>
                <h3>{partie.titre}</h3>
                {#each partie.texte as t}<p>{t}</p>{/each}
                {#if partie.definitions?.length}
                  <dl class="definitions">
                    {#each partie.definitions as d (d.terme)}<div><dt>{d.terme}</dt><dd>{d.definition}</dd></div>{/each}
                  </dl>
                {/if}
                {#if partie.methode?.length}
                  <div class="methode">
                    <p class="etiquette-ex">La démarche</p>
                    <ol>{#each partie.methode as m}<li>{m}</li>{/each}</ol>
                  </div>
                {/if}
                {#each exemplesDe(partie) as x (x.situation)}
                  <div class="exemple-lecon">
                    <p class="etiquette-ex">Exemple</p>
                    <p><b>{x.situation}</b></p>
                    {#if x.lignes && x.tableau}<ul>{#each x.lignes as l}<li>{l}</li>{/each}</ul>{/if}
                    {#if x.tableau}
                      <!-- Zone qui peut défiler sur téléphone : atteignable au clavier (WCAG scrollable-region-focusable). -->
                      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                      <div class="defile-lecon" tabindex="0" role="group" aria-label={`Tableau : ${x.situation}`}>
                        <table>
                          <thead><tr>{#each x.tableau.entetes as e}<th class:montant={e === 'CHF'}>{e}</th>{/each}</tr></thead>
                          <tbody>
                            {#each x.tableau.lignes as l}
                              <tr class:total={l[0]?.startsWith('Total')}>{#each l as c, j}<td class:montant={x.tableau.entetes[j] === 'CHF'} class:num={x.tableau.entetes[j] === 'CHF'} class:masse={c !== '' && x.tableau.entetes[j + 1] === 'CHF' && l[j + 1] === ''}>{c}</td>{/each}</tr>
                            {/each}
                          </tbody>
                        </table>
                      </div>
                    {/if}
                    {#if x.lignes && !x.tableau}<ul>{#each x.lignes as l}<li>{l}</li>{/each}</ul>{/if}
                    {#if x.conclusion}<p class="conclusion-ex">{x.conclusion}</p>{/if}
                  </div>
                {/each}
                {#if partie.piege}<p class="piege"><b>Piège fréquent.</b> {partie.piege}</p>{/if}
                {#if partie.retenir}<p class="a-retenir"><b>À retenir.</b> {partie.retenir}</p>{/if}
                {#if partie.questions?.length}
                  <div class="controle">
                    <p class="etiquette-ex">Vérifiez que vous avez compris</p>
                    {#each partie.questions as q (q.question)}
                      <details>
                        <summary>{q.question}</summary>
                        <p>{q.reponse}</p>
                      </details>
                    {/each}
                  </div>
                {/if}
              </article>
            {/each}
          </div>
        </section>
      {/if}
      <section class="carte">
        <h2>{lecon ? 'En résumé' : "L'essentiel"}</h2>
        <div class="corps-carte">
          <ul>{#each module.rappel as r}<li>{r}</li>{/each}</ul>
          {#if chapitre}
            <p class="vers-theorie">
              <a href={lienTheorie(chapitre.id)} target="_blank" rel="noopener">Ouvrir le chapitre dans la Théorie : {chapitre.titre}</a>
              <span class="discret petit">(nouvel onglet : vous gardez votre place ici)</span>
            </p>
          {/if}
        </div>
      </section>
      {#if exemple}
        <section class="carte">
          <h2>Exemple travaillé</h2>
          <div class="corps-carte">
            <p class="operation">{exemple.texte}</p>
            <ol class="raisonnement">{#each exemple.etapes as e}<li>{e}</li>{/each}</ol>
            <table class="ecriture-ex">
              <thead><tr><th>Débit</th><th>Crédit</th><th class="montant">Montant</th></tr></thead>
              <tbody><tr><td>{nom(exemple.debit)}</td><td>{nom(exemple.credit)}</td><td class="montant num">{m(exemple.montant)}</td></tr></tbody>
            </table>
          </div>
        </section>
      {/if}
      {#if exempleComposee}
        <section class="carte">
          <h2>Exemple travaillé</h2>
          <div class="corps-carte">
            <p class="operation">{exempleComposee.texte}</p>
            <table class="ecriture-ex">
              <thead><tr><th>Débit</th><th>Crédit</th><th class="montant">Montant</th></tr></thead>
              <tbody>
                {#each exempleComposee.lignes as l}
                  <tr><td>{l.cote === 'debit' ? nom(l.compte) : ''}</td><td>{l.cote === 'credit' ? nom(l.compte) : ''}</td><td class="montant num">{m(l.montant)}</td></tr>
                {/each}
              </tbody>
            </table>
            <p class="discret petit">Le total des débits est égal au total des crédits.</p>
          </div>
        </section>
      {/if}
      {#if exempleCalcul}
        <section class="carte">
          <h2>Exemple travaillé</h2>
          <div class="corps-carte">
            {#if exempleCalcul.format === 'calcul'}
              {#each exempleCalcul.enonce as e}<p class="operation">{e}</p>{/each}
              {#if exempleCalcul.tableau}
                <table class="donnees"><thead><tr>{#each exempleCalcul.tableau.entetes as t}<th>{t}</th>{/each}</tr></thead>
                  <tbody>{#each exempleCalcul.tableau.lignes as l}<tr>{#each l as c, j}<td class:montant={j > 0}>{c}</td>{/each}</tr>{/each}</tbody></table>
              {/if}
              <table class="donnees"><tbody>{#each exempleCalcul.champs as c}<tr><td>{c.libelle}</td><td class="montant num"><b>{valeurLisible(c)}</b></td></tr>{/each}</tbody></table>
              <ol class="raisonnement">{#each exempleCalcul.explication as e}<li>{e}</li>{/each}</ol>
            {:else}
              <p class="operation">{exempleCalcul.question}</p>
              <p><b>Réponse :</b> {exempleCalcul.choix[exempleCalcul.reponse]}. {exempleCalcul.explication}</p>
            {/if}
          </div>
        </section>
      {/if}
      <div class="actions-bas">
        {#if guidePossible}<button class="btn" onclick={commencerGuide}>S'entraîner avec aide (3 questions)</button>{/if}
        <button class="btn" onclick={projeter}>Projeter une question pour la classe</button>
        <button class="btn btn-principal" onclick={commencerSerie}>Commencer la série de {NB} questions</button>
      </div>
      {@render navigationModules()}
    {:else if etape === 'serie' && q}
      <nav class="fil">
        <button class="btn-lien" onclick={() => ouvrir(module)}>{module.titre}</button>
        <span class="discret">
          {mode === 'guide' ? 'Entraînement guidé · ' : mode === 'revision' ? 'Révision du jour · ' : ''}Question {rang + 1} sur {questions.length}{#if mode === 'serie'} · {pts(justes)} point{justes >= 2 ? 's' : ''}{/if}
        </span>
      </nav>
      <div class="barre" aria-hidden="true"><span style:width={`${(rang / questions.length) * 100}%`}></span></div>

      <section class="carte question">
        <div class="corps-carte">
          {#if q.format === 'composee'}
            <p class="consigne">{q.sujet} · choisissez le compte de chaque ligne</p>
            <p class="enonce">{q.texte}</p>
            <table class="donnees composee">
              <thead><tr><th>Côté</th><th>Compte</th><th class="montant">Montant</th>{#if corrigee}<th></th>{/if}</tr></thead>
              <tbody>
                {#each q.lignes as l, i}
                  <tr class:faux-ligne={corrigee && comptesLignes[i] !== l.compte}>
                    <td>{l.cote === 'debit' ? 'Débit' : 'Crédit'}</td>
                    <td>
                      <select bind:value={comptesLignes[i]} disabled={corrigee || !!donne.lignes[i]} aria-label={`Compte de la ligne ${i + 1} (${l.cote === 'debit' ? 'débit' : 'crédit'})`}>
                        <option value="">Choisir…</option>
                        {#each comptesModule as n}<option value={n}>{nom(n)}</option>{/each}
                      </select>
                    </td>
                    <td class="montant num">{m(l.montant)}</td>
                    {#if corrigee}<td class="attendu">{comptesLignes[i] === l.compte ? 'Juste' : nom(l.compte)}</td>{/if}
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else if q.format === 'calcul'}
            <p class="consigne">{q.sujet}</p>
            {#each q.enonce as e}<p class="enonce-calcul">{e}</p>{/each}
            {#if q.tableau}
              <table class="donnees"><thead><tr>{#each q.tableau.entetes as t}<th>{t}</th>{/each}</tr></thead>
                <tbody>{#each q.tableau.lignes as l}<tr>{#each l as c, j}<td class:montant={j > 0}>{c}</td>{/each}</tr>{/each}</tbody></table>
            {/if}
            <table class="donnees reponses">
              <tbody>
                {#each q.champs as c, i}
                  <tr class:faux-ligne={corrigee && !champJuste(c, valeurs[i])}>
                    <td>{c.libelle}</td>
                    <td class="montant">
                      {#if c.type === 'choix'}
                        <select bind:value={valeurs[i]} disabled={corrigee} aria-label={c.libelle}>
                          <option value="">Choisir…</option>
                          {#each c.choix ?? [] as o, k}<option value={String(k)}>{o}</option>{/each}
                        </select>
                      {:else}
                        <input class="num champ-calcul" inputmode="decimal" placeholder={c.type === 'chf' ? '0.00' : c.type === 'pc' ? '0.0' : '0'} aria-label={c.libelle} bind:value={valeurs[i]} disabled={corrigee} />
                        <span class="unite">{c.type === 'chf' ? 'CHF' : c.type === 'pc' ? '%' : ''}</span>
                      {/if}
                    </td>
                    {#if corrigee}<td class="attendu">{champJuste(c, valeurs[i]) ? 'Juste' : valeurLisible(c)}</td>{/if}
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else if q.format === 'qcm'}
            {#if q.sujet === SUJET_TRI}
              <p class="consigne">Dans quel classeur rangez-vous cette pièce ? Cliquez sur le classeur, ou glissez-y la pièce.</p>
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="piece-a-classer" draggable={!corrigee} ondragstart={(e) => e.dataTransfer?.setData('text/plain', 'piece')}>{q.question}</div>
              <div class="classeurs" role="radiogroup" aria-label="Classeur">
                {#each q.choix as c, i}
                  <button
                    type="button" class="classeur" role="radio" aria-checked={choix === i} disabled={corrigee}
                    onclick={() => (choix = i)}
                    ondragover={(e) => e.preventDefault()}
                    ondrop={(e) => { e.preventDefault(); if (!corrigee) choix = i; }}
                  >{c}</button>
                {/each}
              </div>
            {:else}
            <p class="consigne">{q.sujet}</p>
            <p class="enonce">{q.question}</p>
            <div class="choix-colonne" role="radiogroup" aria-label={q.question}>
              {#each q.choix as c, i}
                <label class="option"><input type="radio" name="qcm" value={i} bind:group={choix} disabled={corrigee} /> {c}</label>
              {/each}
            </div>
            {/if}
          {:else if q.format === 'classer'}
            <p class="consigne">Dans quelle catégorie se trouve ce compte ?</p>
            <p class="enonce">{nom(q.compte)}</p>
            <div class="choix-ligne" role="group" aria-label="Catégorie">
              {#each q.choix as t}
                <button class="btn" aria-pressed={type === t} disabled={corrigee} onclick={() => (type = t)}>{LIBELLE_TYPE[t]}</button>
              {/each}
            </div>
          {:else if q.format === 'variation'}
            <p class="consigne">Quel est l'effet de cette opération sur le bilan ?</p>
            <p class="enonce">{q.texte}</p>
            <div class="choix-colonne" role="radiogroup" aria-label="Effet sur le bilan">
              {#each q.choix as c, i}
                <label class="option"><input type="radio" name="var" value={i} bind:group={choix} disabled={corrigee} /> {c}</label>
              {/each}
            </div>
          {:else if q.format === 'ecriture'}
            <p class="consigne">Passez l'écriture de cette opération.</p>
            <p class="enonce">{q.texte}</p>
            <div class="grille-ecriture">
              <label>Compte au débit
                <select bind:value={debit} disabled={corrigee || donne.debit}>
                  <option value="">Choisir…</option>
                  {#each comptesTries as n}<option value={n}>{nom(n)}</option>{/each}
                </select>
              </label>
              <label>Compte au crédit
                <select bind:value={credit} disabled={corrigee || donne.credit}>
                  <option value="">Choisir…</option>
                  {#each comptesTries as n}<option value={n}>{nom(n)}</option>{/each}
                </select>
              </label>
              <div class="montant-donne"><span class="discret">Montant</span><b class="num">{m(q.montant)}</b></div>
            </div>
          {:else if q.format === 'operation'}
            <p class="consigne">Quelle opération correspond à cette écriture ?</p>
            <p class="enonce">Débit {nom(q.debit)} / Crédit {nom(q.credit)} · <span class="num">{m(q.montant)}</span></p>
            <div class="choix-colonne" role="radiogroup" aria-label="Opération">
              {#each q.choix as c, i}
                <label class="option"><input type="radio" name="op" value={i} bind:group={choix} disabled={corrigee} /> {c}</label>
              {/each}
            </div>
          {:else if q.format === 'erreur'}
            <p class="consigne">Une seule de ces écritures est fausse. Laquelle ?</p>
            <table class="liste-erreurs">
              <thead><tr><th></th><th>Opération</th><th>Débit</th><th>Crédit</th><th class="montant">Montant</th></tr></thead>
              <tbody>
                {#each q.lignes as l, i}
                  <tr class:choisie={choix === i}>
                    <td><input type="radio" name="err" value={i} bind:group={choix} disabled={corrigee} aria-label={`Écriture ${i + 1}`} /></td>
                    <td>{l.texte}</td><td>{nom(l.debit)}</td><td>{nom(l.credit)}</td><td class="montant num">{m(l.montant)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else if q.format === 'solde'}
            <p class="consigne">Calculez le solde final de ce compte.</p>
            <p class="enonce">{nom(q.compte)}</p>
            {@const actif = plan.find((c) => c.numero === q.compte)?.type === 'actif'}
            <table class="compte-t">
              <thead><tr><th colspan="2">Débit</th><th colspan="2">Crédit</th></tr></thead>
              <tbody>
                {#each Array.from({ length: Math.max(q.debits.length + (actif ? 1 : 0), q.credits.length + (actif ? 0 : 1)) }) as _, i}
                  {@const gauche = actif ? (i === 0 ? ['SI', q.initial] : ['', q.debits[i - 1]]) : ['', q.debits[i]]}
                  {@const droite = actif ? ['', q.credits[i]] : i === 0 ? ['SI', q.initial] : ['', q.credits[i - 1]]}
                  <tr>
                    <td class="abrev">{gauche[1] !== undefined ? gauche[0] : ''}</td><td class="montant num">{gauche[1] !== undefined ? m(gauche[1] as number) : ''}</td>
                    <td class="abrev">{droite[1] !== undefined ? droite[0] : ''}</td><td class="montant num">{droite[1] !== undefined ? m(droite[1] as number) : ''}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
            <div class="grille-solde">
              <label>Solde final (SF) <input class="num" inputmode="decimal" bind:value={montantSaisi} disabled={corrigee} placeholder="0.00" /></label>
              <div class="choix-ligne" role="group" aria-label="Solde">
                <button class="btn" aria-pressed={cote === 'debiteur'} disabled={corrigee} onclick={() => (cote = 'debiteur')}>Solde débiteur</button>
                <button class="btn" aria-pressed={cote === 'crediteur'} disabled={corrigee} onclick={() => (cote = 'crediteur')}>Solde créditeur</button>
              </div>
            </div>
          {/if}

          {#if corrigee}
            <div class="retour" class:ok={juste} role="status">
              {#if juste}
                <b>Juste.</b>
                {#if q.format === 'calcul'}<ol class="raisonnement">{#each q.explication as e}<li>{e}</li>{/each}</ol>{/if}
              {:else}
                <b>Pas tout à fait.</b>
                {#if q.format === 'composee'}
                  Le compte attendu figure à droite des lignes fausses.
                {:else if q.format === 'calcul'}
                  Les valeurs attendues figurent à droite des réponses fausses.
                  <ol class="raisonnement">{#each q.explication as e}<li>{e}</li>{/each}</ol>
                {:else if q.format === 'qcm'}La bonne réponse : {q.choix[q.reponse]}. {q.explication}
                {:else if q.format === 'classer'}La bonne réponse : {LIBELLE_TYPE[q.reponse]}.
                {:else if q.format === 'variation'}La bonne réponse : {VARIATIONS[q.reponse]}.
                {:else if q.format === 'operation'}La bonne réponse : {q.choix[q.reponse]}
                {:else if q.format === 'erreur'}
                  L'écriture fausse est la n° {q.reponse + 1} ({q.lignes[q.reponse]!.texte}).
                {:else if q.format === 'ecriture'}
                  Écriture attendue : débit {nom(q.reponse.debit)}, crédit {nom(q.reponse.credit)}.
                  {#if typique}<p class="pourquoi"><b>Pourquoi ?</b> {typique.explication}</p>{/if}
                  <ol class="raisonnement">{#each raisonnement(plan, q.reponse.debit, q.reponse.credit) as e}<li>{e}</li>{/each}</ol>
                {:else if q.format === 'solde'}
                  Solde final : {m(q.reponse.montant)}, {q.reponse.cote === 'debiteur' ? 'débiteur' : 'créditeur'}. Total du côté le plus fort − total de l'autre côté.
                {/if}
              {/if}
            </div>
          {/if}
        </div>
      </section>
      <div class="actions-bas">
        {#if !corrigee}
          <button class="btn btn-principal" disabled={!prete} onclick={verifier}>Vérifier</button>
        {:else}
          <button class="btn btn-principal" onclick={continuer}>{rang < questions.length - 1 ? 'Question suivante' : 'Voir le résultat'}</button>
        {/if}
      </div>
    {:else if etape === 'projection' && proj}
      <nav class="fil"><button class="btn-lien" onclick={() => ouvrir(module)}>{module.titre}</button><span class="discret">Question pour la classe · réponse à main levée</span></nav>
      <section class="carte projection">
        <div class="corps-carte">
          <p class="p-consigne">{proj.consigne}</p>
          {#each proj.enonce as e}<p class="p-enonce">{e}</p>{/each}
          {#if proj.tableau}
            <table class="donnees"><thead><tr>{#each proj.tableau.entetes as t}<th>{t}</th>{/each}</tr></thead>
              <tbody>{#each proj.tableau.lignes as l}<tr>{#each l as c, j}<td class:montant={j > 0}>{c}</td>{/each}</tr>{/each}</tbody></table>
          {/if}
          {#if proj.choix.length}
            <ol class="p-choix" type="A">{#each proj.choix as c}<li>{c}</li>{/each}</ol>
          {/if}
          {#if revele}
            <div class="retour ok p-reponse" role="status"><b>Réponse.</b>{#each proj.reponse as r}<div>{r}</div>{/each}</div>
          {/if}
        </div>
      </section>
      <div class="actions-bas">
        {#if !revele}<button class="btn btn-principal btn-grand" onclick={() => (revele = true)}>Révéler la réponse</button>{/if}
        <button class="btn" class:btn-principal={revele} onclick={projeter}>Question suivante</button>
        <button class="btn" onclick={() => ouvrir(module)}>Terminer</button>
      </div>
    {:else if etape === 'bilan'}
      <nav class="fil"><button class="btn-lien" onclick={() => ouvrir(null)}>Tous les modules</button></nav>
      {#if mode === 'revision'}
        <div class="titre"><h1>Révision du jour</h1></div>
        <section class="carte">
          <div class="corps-carte">
            <p class="score"><b>{pts(justes)} points sur {questions.length}.</b></p>
            <p>Les notions réussies vous seront redemandées plus tard ; les autres reviennent dès demain.</p>
          </div>
        </section>
        <div class="actions-bas"><button class="btn btn-principal" onclick={() => ouvrir(null)}>Retour aux modules</button></div>
      {:else if mode === 'guide'}
        <div class="titre"><h1>{module.titre}</h1></div>
        <section class="carte">
          <div class="corps-carte"><p>Entraînement guidé terminé. À vous maintenant, sans aide : la série compte pour la maîtrise.</p></div>
        </section>
        <div class="actions-bas">
          <button class="btn btn-principal" onclick={commencerSerie}>Commencer la série de {NB} questions</button>
          <button class="btn" onclick={commencerGuide}>Refaire l'entraînement guidé</button>
        </div>
      {:else}
      <div class="titre"><h1>{module.titre}</h1></div>
      <section class="carte">
        <div class="corps-carte">
          <p class="score"><b>{pts(justes)} points sur {questions.length}.</b></p>
          {#if reussi}
            <p class="ok">Notion maîtrisée. Vous pouvez passer à la suivante.</p>
          {:else}
            <p>Il faut {seuilMaitrise(questions.length)} points pour maîtriser la notion (une question en plusieurs étapes compte au prorata des étapes justes). Relisez l'essentiel et l'exemple, puis faites une nouvelle série : les questions et les montants changent.</p>
          {/if}
        </div>
      </section>
      <div class="actions-bas">
        {#if reussi && suivant}
          <button class="btn btn-principal" onclick={() => ouvrir(suivant)}>Module suivant : {suivant.titre}</button>
          <button class="btn" onclick={commencerSerie}>Nouvelle série</button>
        {:else if reussi}
          <button class="btn btn-principal" onclick={() => etat.allerAccueil()}>Passer à un exercice complet</button>
          <button class="btn" onclick={commencerSerie}>Nouvelle série</button>
        {:else}
          <button class="btn btn-principal" onclick={commencerSerie}>Nouvelle série</button>
          <button class="btn" onclick={() => ouvrir(module)}>Revoir l'essentiel et l'exemple</button>
        {/if}
      </div>
      {@render navigationModules()}
      {/if}
    {/if}
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .contenu { max-width: 900px; margin: 0 auto; padding: 24px 16px 48px; }
  .intro { margin: 0 0 16px; line-height: 1.5; }
  section { margin-bottom: 14px; }
  .petit { font-size: var(--t-13); }
  .fil { display: flex; gap: 16px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
  .revision-jour { border: 1px solid #f1c9b3; background: linear-gradient(135deg, #fff 0%, var(--c-orange-doux) 100%); margin-bottom: 8px; }
  .ligne-revision { display: flex; gap: 20px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .ligne-revision p { margin: 4px 0 0; max-width: 60ch; }
  .echeance { font-weight: normal; color: var(--c-texte-2); }
  .envoi { margin: 18px 0 12px; }
  .envoi summary { padding: 14px 20px; cursor: pointer; font-weight: 600; color: var(--c-structure); }
  .envoi p { margin: 0 0 12px; }
  .grille-envoi { display: grid; grid-template-columns: 1fr 1fr 160px auto; gap: 12px; align-items: end; }
  .grille-envoi label { display: flex; flex-direction: column; gap: 4px; font-size: var(--t-13); font-weight: 600; color: var(--c-texte-2); }
  @media (max-width: 700px) { .grille-envoi { grid-template-columns: 1fr; } }
  .piece-a-classer {
    margin: 12px 0 16px; padding: 16px 18px; background: #fff; border: 1px solid #d5dce5; border-left: 5px solid var(--c-structure);
    border-radius: var(--r-3); box-shadow: var(--ombre-carte); font-size: var(--t-17); font-weight: 600; cursor: grab; max-width: 70ch;
  }
  .classeurs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .classeur {
    font: inherit; font-weight: 600; min-height: 84px; padding: 12px; border-radius: var(--r-3); cursor: pointer; text-align: center;
    background: var(--c-bleu-doux); color: var(--c-structure); border: 2px dashed #a9bfd6;
  }
  .classeur[aria-checked='true'] { background: var(--c-structure); color: #fff; border-style: solid; border-color: var(--c-structure); }
  .classeur:disabled { cursor: default; opacity: 0.85; }
  @media (max-width: 700px) { .classeurs { grid-template-columns: 1fr 1fr; } }
  .projection .corps-carte { padding: 28px 32px; }
  .p-consigne { font-size: var(--t-17); color: var(--c-texte-2); margin: 0 0 10px; }
  .p-enonce { font-size: clamp(22px, 2.6vw, 34px); font-weight: 700; color: var(--c-encre); line-height: 1.3; margin: 0 0 12px; }
  .p-choix { font-size: clamp(18px, 2vw, 26px); line-height: 1.5; margin: 14px 0 0; padding-left: 1.6em; }
  .p-choix li { margin-bottom: 8px; }
  .p-reponse { font-size: clamp(18px, 2vw, 26px); line-height: 1.5; }
  .lecon .corps-carte { padding: 8px 24px 22px; }
  .partie { padding: 18px 0; border-bottom: 1px solid var(--c-bordure-3); max-width: 76ch; }
  .partie:last-child { border-bottom: 0; padding-bottom: 0; }
  .partie h3 { margin: 0 0 8px; font-size: var(--t-17); letter-spacing: -0.01em; }
  .partie p { margin: 0 0 10px; font-size: var(--t-17); line-height: 1.65; }
  .exemple-lecon { margin: 12px 0; padding: 14px 16px; background: var(--c-bleu-doux); border-radius: var(--r-3); }
  .exemple-lecon p { font-size: var(--t-15); margin-bottom: 8px; }
  .exemple-lecon ul { margin: 0; padding-left: 20px; line-height: 1.6; }
  .exemple-lecon table { background: #fff; border-radius: var(--r-3); overflow: hidden; }
  .etiquette-ex { font-size: var(--t-12) !important; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--c-structure); margin-bottom: 4px !important; }
  .defile-lecon { overflow-x: auto; border-radius: var(--r-3); }
  .sommaire-lecon { margin: 12px 0 4px; padding: 12px 16px; background: var(--c-fond-tete); border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); max-width: 76ch; }
  .sommaire-lecon ol { margin: 0; padding-left: 22px; columns: 2; column-gap: 28px; line-height: 1.7; }
  .sommaire-lecon a { color: var(--c-structure); text-underline-offset: 3px; }
  .partie { scroll-margin-top: 12px; }
  .definitions { margin: 12px 0; padding: 12px 16px; border-left: 4px solid var(--c-structure); background: var(--c-fond-tete); border-radius: var(--r-2); display: grid; gap: 6px; }
  .definitions div { display: block; }
  .definitions dt { display: inline; font-weight: var(--graisse-fort); color: var(--c-encre); }
  .definitions dt::after { content: ' : '; font-weight: 400; }
  .definitions dd { display: inline; margin: 0; }
  .methode { margin: 12px 0; padding: 12px 16px; border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); }
  .methode ol { margin: 0; padding-left: 22px; line-height: 1.6; }
  .exemple-lecon ul + .defile-lecon { margin-top: 10px; }
  .conclusion-ex { margin: 10px 0 0 !important; font-style: italic; }
  td.masse { font-weight: var(--graisse-fort); color: var(--c-structure); }
  .controle { margin-top: 12px; }
  .controle details { border: 1px solid var(--c-bordure-2); border-radius: var(--r-2); padding: 8px 12px; margin-top: 6px; background: var(--c-fond); }
  .controle summary { cursor: pointer; font-weight: var(--graisse-moyen); }
  .controle details p { margin: 8px 0 2px; font-size: var(--t-15); }
  @media (max-width: 600px) { .sommaire-lecon ol { columns: 1; } }
  @media (max-width: 600px) {
    .lecon .corps-carte { padding: 4px 14px 18px; }
    .exemple-lecon { padding: 12px; }
    .exemple-lecon table { font-size: var(--t-13); }
    .exemple-lecon th, .exemple-lecon td { padding: 6px 8px; white-space: normal; }
  }
  .piege { padding: 10px 14px; background: var(--c-alerte-fond); border-left: 4px solid var(--c-avert-trait); border-radius: var(--r-2); }
  .a-retenir { padding: 10px 14px; background: var(--c-ok-fond); border-left: 4px solid var(--c-ok); border-radius: var(--r-2); }
  .nav-modules { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: stretch; margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--c-bordure-3); }
  .nav-modules .nav-item { display: flex; flex-direction: column; gap: 2px; text-align: left; white-space: normal; height: auto; padding: 10px 14px; }
  .nav-modules .nav-item.droite { text-align: right; grid-column: 3; }
  .nav-modules .nav-menu { grid-column: 2; align-self: center; }
  .nav-modules .sens { font-size: var(--t-12); color: var(--c-texte-2); }
  .nav-modules .nom { font-weight: 600; }
  @media (max-width: 700px) {
    .nav-modules { grid-template-columns: 1fr; }
    .nav-modules .nav-item.droite, .nav-modules .nav-menu { grid-column: 1; text-align: left; }
    .nav-modules .nav-menu { order: 3; justify-self: start; }
  }
  h2.niveau { font-size: var(--t-15); color: var(--c-structure); margin: 18px 0 8px; }
  .donnees { width: 100%; margin: 6px 0 12px; }
  .donnees td, .donnees th { padding: 6px 8px; }
  .reponses td:first-child { width: 55%; }
  .champ-calcul { width: 140px; text-align: right; font-size: var(--t-15); padding: 5px 8px; }
  .composee select { min-width: 300px; font-size: var(--t-14); padding: 5px; }
  .reponses select { min-width: 260px; font-size: var(--t-14); padding: 5px; }
  .unite { color: var(--c-texte-2); font-size: var(--t-12); margin-left: 4px; }
  .attendu { color: var(--c-erreur); font-weight: bold; white-space: nowrap; }
  .faux-ligne { background: var(--c-erreur-fond); }
  .enonce-calcul { margin: 4px 0; font-weight: bold; }
  .modules { list-style: none; margin: 0 0 14px; padding: 0; display: grid; gap: 10px; }
  .module { display: flex; align-items: center; gap: 14px; padding: 12px 16px; margin: 0; }
  .rang { width: 30px; height: 30px; border-radius: 50%; background: var(--c-selection); color: var(--c-structure); display: grid; place-items: center; font-weight: bold; flex: none; }
  .module .texte { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .lien-module { border: none; background: none; padding: 0; font: inherit; font-weight: bold; color: var(--c-structure); cursor: pointer; text-align: left; }
  .lien-module:hover { text-decoration: underline; }
  .etat { font-size: var(--t-13); color: var(--c-texte-2); white-space: nowrap; }
  .etat.maitrise { color: var(--c-ok); font-weight: bold; }
  .corps-carte p, .corps-carte li { line-height: 1.5; }
  .vers-theorie { margin: 12px 0 0; display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
  .vers-theorie a { color: var(--c-structure); font-weight: var(--graisse-moyen); text-underline-offset: 3px; min-height: 24px; display: inline-flex; align-items: center; }
  .operation, .enonce { font-weight: bold; }
  .enonce { font-size: var(--t-17); margin: 4px 0 14px; }
  .consigne { margin: 0; color: var(--c-texte-2); }
  .raisonnement { margin: 8px 0; padding-left: 22px; }
  .ecriture-ex, .liste-erreurs { width: 100%; }
  .montant { text-align: right; white-space: nowrap; }
  .actions-bas { display: flex; gap: 10px; flex-wrap: wrap; }
  .barre { height: 6px; background: var(--c-bordure-3); border-radius: var(--r-1); margin-bottom: 12px; overflow: hidden; }
  .barre span { display: block; height: 100%; background: var(--c-structure); }
  .choix-ligne { display: flex; gap: 8px; flex-wrap: wrap; }
  .choix-ligne .btn[aria-pressed='true'] { background: var(--c-selection); border-color: var(--c-structure); color: var(--c-structure); font-weight: bold; }
  .choix-colonne { display: grid; gap: 6px; }
  .option { display: flex; gap: 8px; align-items: flex-start; padding: 8px 10px; border: 1px solid var(--c-bordure-2); border-radius: var(--r-2); cursor: pointer; }
  .option:has(input:checked) { border-color: var(--c-structure); background: var(--c-selection); }
  .grille-ecriture { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; }
  .grille-ecriture label, .grille-solde label { display: flex; flex-direction: column; gap: 4px; font-size: var(--t-13); }
  .grille-ecriture select { font-size: var(--t-15); padding: 6px; }
  .montant-donne { display: flex; flex-direction: column; gap: 4px; font-size: var(--t-13); text-align: right; }
  .montant-donne b { font-size: var(--t-15); padding: 6px 0; }
  .liste-erreurs tr.choisie { background: var(--c-selection); }
  .compte-t { width: auto; min-width: 360px; margin-bottom: 12px; }
  .compte-t th { text-align: center; }
  .compte-t td:nth-child(2) { border-right: 2px solid var(--c-texte); }
  .abrev { color: var(--c-texte-2); font-size: var(--t-12); }
  .grille-solde { display: flex; gap: 16px; align-items: end; flex-wrap: wrap; }
  .grille-solde input { font-size: var(--t-15); padding: 6px; width: 140px; text-align: right; }
  .retour { margin-top: 14px; padding: 10px 12px; border-left: 4px solid var(--c-erreur); background: var(--c-erreur-fond); border-radius: var(--r-2); }
  .retour.ok { border-left-color: var(--c-ok); background: var(--c-ok-fond); }
  .pourquoi { margin: 6px 0 0; }
  .score { font-size: var(--t-17); }
  .ok { color: var(--c-ok); font-weight: bold; }
  @media (max-width: 700px) {
    .grille-ecriture { grid-template-columns: 1fr; }
    .montant-donne { text-align: left; }
  }
</style>
