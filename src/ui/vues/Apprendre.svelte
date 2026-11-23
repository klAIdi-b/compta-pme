<!-- Parcours « Apprendre » : modules par notion (découvrir, exemple travaillé, série d'exercices courts, maîtrise). -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { LIBELLES_NIVEAU_APPRENDRE, MODULES, modeleParId, type ModuleApprendre, type NiveauApprendre } from '../../data/apprendre';
  import { champJuste, genererCalcul, valeurLisible, type QuestionGeneree } from '../../engine/calculs';
  import { CHAPITRES } from '../../data/theorie';
  import { plan } from '../../data/plan';
  import {
    estJuste, genererSerie, montantModele, hasard, raisonnement, seuilMaitrise, texteOperation, VARIATIONS,
    type Question, type Reponse,
  } from '../../engine/exercices-courts';
  import { erreurTypique } from '../../engine/erreurs-typiques';
  import { formatMontant, lireMontant } from '../../engine/money';
  import type { TypeCompte } from '../../engine/plan';
  import { enregistrerSerie, lireProgression, type Progression } from '../../io/apprendre';
  import ChapitreTheorie from '../composants/ChapitreTheorie.svelte';

  const NB = 10;
  const intitules = new Map(plan.map((c) => [c.numero, c.intitule]));
  const nom = (n: string) => intitules.get(n) ?? n;
  const m = (c: number) => formatMontant(c);
  const LIBELLE_TYPE: Record<TypeCompte, string> = { actif: 'Actif', passif: 'Passif', charge: 'Charge', produit: 'Produit', bouclement: 'Bouclement' };

  let progression = $state<Progression>(lireProgression());
  let module = $state.raw<ModuleApprendre | null>(null);
  let etape = $state<'decouvrir' | 'serie' | 'bilan'>('decouvrir');
  let theorieOuverte = $state(false);

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
  const exempleCalcul = $derived<QuestionGeneree | null>(module?.calculs?.length ? genererCalcul(module.calculs[0]!, hasard(7), { plan }) : null);
  const NIVEAUX: NiveauApprendre[] = ['CFC1', 'CFC2', 'MP'];
  const indexModule = $derived(module ? MODULES.indexOf(module) : -1);
  const suivant = $derived(indexModule >= 0 && indexModule < MODULES.length - 1 ? MODULES[indexModule + 1]! : null);

  function haut() {
    document.querySelector('.contenu-apprendre')?.scrollIntoView({ block: 'start' });
    window.scrollTo({ top: 0 });
  }

  function ouvrir(mod: ModuleApprendre | null) {
    module = mod;
    etape = 'decouvrir';
    theorieOuverte = false;
    haut();
  }

  function reinitialiserReponse() {
    choix = null; type = null; debit = ''; credit = ''; montantSaisi = ''; cote = null;
    valeurs = q && q.format === 'calcul' ? q.champs.map(() => '') : [];
    corrigee = false; juste = false;
  }

  function commencerSerie() {
    if (!module) return;
    const x = { plan, modeles: module.modeles.map(modeleParId), comptes: module.comptes, types: module.types, calculs: module.calculs };
    questions = genererSerie(x, module.formats, NB, Math.floor(Math.random() * 2 ** 31));
    rang = 0;
    justes = 0;
    reinitialiserReponse();
    const q0 = questions[0];
    valeurs = q0 && q0.format === 'calcul' ? q0.champs.map(() => '') : [];
    etape = 'serie';
    haut();
  }

  function reponse(): Reponse | null {
    if (!q) return null;
    switch (q.format) {
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
    if (juste) justes++;
    corrigee = true;
  }

  function continuer() {
    if (rang < questions.length - 1) {
      rang++;
      reinitialiserReponse();
      const qs = questions[rang];
      valeurs = qs && qs.format === 'calcul' ? qs.champs.map(() => '') : [];
      return;
    }
    progression = enregistrerSerie(progression, module!.id, justes, questions.length, justes >= seuilMaitrise(questions.length));
    etape = 'bilan';
    haut();
  }

  const typique = $derived(
    q && q.format === 'ecriture' && corrigee && !juste && debit && credit
      ? erreurTypique([{ debit, credit, montant: q.montant }], [{ debit: q.reponse.debit, credit: q.reponse.credit, montant: q.montant }])
      : null,
  );
  const reussi = $derived(justes >= seuilMaitrise(questions.length || NB));

  function fermer() {
    etat.apprendre = false;
  }
</script>

<div class="page">
  <header class="bandeau-haut">
    <button class="logo logo-bouton" title="Retour à la page d'accueil" onclick={() => etat.allerAccueil()}>Compta PME</button>
    <span class="titre-espace">Apprendre pas à pas</span>
    <button class="btn-lien fermer" onclick={fermer}>Fermer</button>
  </header>

  <main class="contenu contenu-apprendre">
    {#if !module}
      <div class="titre"><h1>Apprendre pas à pas</h1><span class="sous">CFC et maturité professionnelle</span></div>
      <p class="intro">
        Une notion à la fois, dans l'ordre du cours : vous lisez l'essentiel, vous suivez un exemple, puis vous vous
        entraînez sur une série de {NB} questions courtes. Avec {seuilMaitrise(NB)} réponses justes sur {NB}, la notion est
        maîtrisée. Chaque série est nouvelle : vous pouvez recommencer autant de fois que nécessaire.
      </p>
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
              {#if p?.maitrise}Maîtrisé{:else if p}Meilleur score {p.meilleur} / {p.sur}{:else}À faire{/if}
            </span>
          </li>
        {/each}
      </ol>
      {/each}
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
      <section class="carte">
        <h2>L'essentiel</h2>
        <div class="corps-carte">
          <ul>{#each module.rappel as r}<li>{r}</li>{/each}</ul>
          {#if chapitre}
            <button class="btn-lien" aria-expanded={theorieOuverte} onclick={() => (theorieOuverte = !theorieOuverte)}>
              {theorieOuverte ? 'Masquer la théorie' : `Lire la théorie : ${chapitre.titre}`}
            </button>
            {#if theorieOuverte}<div class="theorie"><ChapitreTheorie {chapitre} {intitules} /></div>{/if}
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
        <button class="btn btn-principal" onclick={commencerSerie}>Commencer la série de {NB} questions</button>
      </div>
    {:else if etape === 'serie' && q}
      <nav class="fil">
        <button class="btn-lien" onclick={() => ouvrir(module)}>{module.titre}</button>
        <span class="discret">Question {rang + 1} sur {questions.length} · {justes} juste{justes > 1 ? 's' : ''}</span>
      </nav>
      <div class="barre" aria-hidden="true"><span style:width={`${(rang / questions.length) * 100}%`}></span></div>

      <section class="carte question">
        <div class="corps-carte">
          {#if q.format === 'calcul'}
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
            <p class="consigne">{q.sujet}</p>
            <p class="enonce">{q.question}</p>
            <div class="choix-colonne" role="radiogroup" aria-label={q.question}>
              {#each q.choix as c, i}
                <label class="option"><input type="radio" name="qcm" value={i} bind:group={choix} disabled={corrigee} /> {c}</label>
              {/each}
            </div>
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
                <select bind:value={debit} disabled={corrigee}>
                  <option value="">Choisir…</option>
                  {#each comptesTries as n}<option value={n}>{nom(n)}</option>{/each}
                </select>
              </label>
              <label>Compte au crédit
                <select bind:value={credit} disabled={corrigee}>
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
                {#if q.format === 'calcul'}
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
    {:else if etape === 'bilan'}
      <nav class="fil"><button class="btn-lien" onclick={() => ouvrir(null)}>Tous les modules</button></nav>
      <div class="titre"><h1>{module.titre}</h1></div>
      <section class="carte">
        <div class="corps-carte">
          <p class="score"><b>{justes} réponses justes sur {questions.length}.</b></p>
          {#if reussi}
            <p class="ok">Notion maîtrisée. Vous pouvez passer à la suivante.</p>
          {:else}
            <p>Il faut {seuilMaitrise(questions.length)} réponses justes pour maîtriser la notion. Relisez l'essentiel et l'exemple, puis faites une nouvelle série : les questions et les montants changent.</p>
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
    {/if}
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .bandeau-haut { background: #fff; border-bottom: 1px solid var(--c-bordure-2); padding: 0 28px; height: 60px; display: flex; align-items: center; gap: 18px; }
  .logo { color: var(--c-texte); font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 10px; }
  .logo::before { content: 'CP'; width: 28px; height: 28px; border-radius: 7px; background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: 12px; }
  .titre-espace { color: var(--c-texte-2); flex: 1; }
  .fermer { color: var(--c-structure); }
  .contenu { max-width: 900px; margin: 0 auto; padding: 24px 16px 48px; }
  .intro { margin: 0 0 16px; line-height: 1.5; }
  section { margin-bottom: 14px; }
  .petit { font-size: 13px; }
  .fil { display: flex; gap: 16px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
  h2.niveau { font-size: 15px; color: var(--c-structure); margin: 18px 0 8px; }
  .donnees { width: 100%; margin: 6px 0 12px; }
  .donnees td, .donnees th { padding: 6px 8px; }
  .reponses td:first-child { width: 55%; }
  .champ-calcul { width: 140px; text-align: right; font-size: 15px; padding: 5px 8px; }
  .reponses select { min-width: 260px; font-size: 14px; padding: 5px; }
  .unite { color: var(--c-texte-2); font-size: 12px; margin-left: 4px; }
  .attendu { color: var(--c-alerte-texte); font-weight: bold; white-space: nowrap; }
  .faux-ligne { background: var(--c-alerte-fond); }
  .enonce-calcul { margin: 4px 0; font-weight: bold; }
  .modules { list-style: none; margin: 0 0 14px; padding: 0; display: grid; gap: 10px; }
  .module { display: flex; align-items: center; gap: 14px; padding: 12px 16px; margin: 0; }
  .rang { width: 30px; height: 30px; border-radius: 50%; background: var(--c-selection); color: var(--c-structure); display: grid; place-items: center; font-weight: bold; flex: none; }
  .module .texte { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .lien-module { border: none; background: none; padding: 0; font: inherit; font-weight: bold; color: var(--c-structure); cursor: pointer; text-align: left; }
  .lien-module:hover { text-decoration: underline; }
  .etat { font-size: 13px; color: var(--c-texte-2); white-space: nowrap; }
  .etat.maitrise { color: var(--c-ok); font-weight: bold; }
  .corps-carte p, .corps-carte li { line-height: 1.5; }
  .theorie { margin-top: 10px; border-top: 1px solid var(--c-bordure-3); padding-top: 6px; }
  .operation, .enonce { font-weight: bold; }
  .enonce { font-size: 17px; margin: 4px 0 14px; }
  .consigne { margin: 0; color: var(--c-texte-2); }
  .raisonnement { margin: 8px 0; padding-left: 22px; }
  .ecriture-ex, .liste-erreurs { width: 100%; }
  .montant { text-align: right; white-space: nowrap; }
  .actions-bas { display: flex; gap: 10px; flex-wrap: wrap; }
  .barre { height: 6px; background: var(--c-bordure-3); border-radius: 3px; margin-bottom: 12px; overflow: hidden; }
  .barre span { display: block; height: 100%; background: var(--c-structure); }
  .choix-ligne { display: flex; gap: 8px; flex-wrap: wrap; }
  .choix-ligne .btn[aria-pressed='true'] { background: var(--c-selection); border-color: var(--c-structure); color: var(--c-structure); font-weight: bold; }
  .choix-colonne { display: grid; gap: 6px; }
  .option { display: flex; gap: 8px; align-items: flex-start; padding: 8px 10px; border: 1px solid var(--c-bordure-2); border-radius: 6px; cursor: pointer; }
  .option:has(input:checked) { border-color: var(--c-structure); background: var(--c-selection); }
  .grille-ecriture { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; }
  .grille-ecriture label, .grille-solde label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
  .grille-ecriture select { font-size: 15px; padding: 6px; }
  .montant-donne { display: flex; flex-direction: column; gap: 4px; font-size: 13px; text-align: right; }
  .montant-donne b { font-size: 15px; padding: 6px 0; }
  .liste-erreurs tr.choisie { background: var(--c-selection); }
  .compte-t { width: auto; min-width: 360px; margin-bottom: 12px; }
  .compte-t th { text-align: center; }
  .compte-t td:nth-child(2) { border-right: 2px solid var(--c-texte); }
  .abrev { color: var(--c-texte-2); font-size: 12px; }
  .grille-solde { display: flex; gap: 16px; align-items: end; flex-wrap: wrap; }
  .grille-solde input { font-size: 15px; padding: 6px; width: 140px; text-align: right; }
  .retour { margin-top: 14px; padding: 10px 12px; border-left: 4px solid var(--c-accent); background: var(--c-alerte-fond); border-radius: 6px; }
  .retour.ok { border-left-color: var(--c-ok); background: var(--c-ok-fond); }
  .pourquoi { margin: 6px 0 0; }
  .score { font-size: 18px; }
  .ok { color: var(--c-ok); font-weight: bold; }
  @media (max-width: 700px) {
    .grille-ecriture { grid-template-columns: 1fr; }
    .montant-donne { text-align: left; }
    .bandeau-haut { padding: 0 16px; }
  }
</style>
