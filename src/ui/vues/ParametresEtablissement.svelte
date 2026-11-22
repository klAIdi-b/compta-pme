<!-- Réglages de l'établissement (version publique, phase P2, maquette public/maquettes/reglages-etablissement.html validée
     le 22.11.2026) : plan comptable, niveaux et classement, partage par fichier. Chargé avec l'espace enseignant. -->
<script lang="ts">
  import { plan as planDefaut } from '../../data/plan';
  import { exercicesDemo } from '../../data/demos';
  import { difficulteDe, filiereDe, LIBELLES_CONTENU, LIBELLES_NIVEAU, TITRES_DIFFICULTE, type Filiere } from '../../engine/exercice';
  import { comptesDuNiveau, ecrirePlanCsv, NIVEAUX, type Compte, type Niveau, type TypeCompte } from '../../engine/plan';
  import {
    controlerPlanEtablissement,
    controlerTitres,
    differencesPlan,
    estVerrouille,
    importerPlanCsv,
    INTITULES_FIXES,
    nombreDifferences,
    type DifferencesPlan,
    type Reglages,
    type TitresNiveaux,
  } from '../../engine/reglages';
  import { ErreurFichier, nomFichier } from '../../io/fichiers';
  import { EXT_REGLAGES, exporterReglages, importerReglages } from '../../io/reglages';
  import { choisirFichiers, telecharger } from '../fichiers-navigateur';
  import { normaliser, TITRES_CLASSES } from '../format';
  import { reglages } from '../reglages.svelte';

  type Vue = 'resume' | 'plan' | 'import' | 'niveaux';
  let vue = $state<Vue>('resume');
  let message = $state<{ texte: string; ok: boolean } | null>(null);

  const defautParNumero = new Map(planDefaut.map((c) => [c.numero, c]));
  const NIVEAU_TEXTE = (n: Niveau | null) => (n ? LIBELLES_NIVEAU[n] : 'non utilisé');

  // ───────────── Résumé ─────────────
  const visibles = $derived(comptesDuNiveau(reglages.plan, 'MP').length);
  const nbNiveaux = (f: Filiere) => Object.keys(reglages.titres[f]).length;

  // ───────────── Plan : édition ─────────────
  let brouillon = $state<Compte[]>([]);
  let recherche = $state('');
  let seulementModifies = $state(false);
  let erreursPlan = $state<string[]>([]);
  let nouveau = $state({ numero: '', intitule: '', type: 'charge' as TypeCompte, niveau: 'CFC1' as Niveau | '-' });

  function ouvrirPlan() {
    brouillon = structuredClone($state.snapshot(reglages.plan));
    erreursPlan = [];
    recherche = '';
    seulementModifies = false;
    vue = 'plan';
  }

  const estModifie = (c: Compte) => {
    const d = defautParNumero.get(c.numero);
    return !d || d.intitule !== c.intitule || d.niveauMin !== c.niveauMin;
  };
  const nbModifs = $derived(nombreDifferences(differencesPlan(planDefaut, brouillon)));
  const groupes = $derived.by(() => {
    const t = normaliser(recherche.trim());
    const liste = brouillon.filter(
      (c) => (!t || normaliser(c.intitule).includes(t) || c.numero.startsWith(t)) && (!seulementModifies || estModifie(c)),
    );
    const g: { classe: number; comptes: Compte[] }[] = [];
    for (const c of liste) {
      if (g.at(-1)?.classe !== c.classe) g.push({ classe: c.classe, comptes: [] });
      g.at(-1)!.comptes.push(c);
    }
    return g;
  });

  function changerNiveau(c: Compte, v: string) {
    c.niveauMin = v === '-' ? null : (v as Niveau);
  }

  function ajouterCompte() {
    const numero = nouveau.numero.trim();
    const intitule = nouveau.intitule.trim().replaceAll(';', ',');
    erreursPlan = [];
    if (!/^\d{4}$/.test(numero)) erreursPlan = ['Le numéro du nouveau compte doit comporter 4 chiffres.'];
    else if (brouillon.some((c) => c.numero === numero)) erreursPlan = [`Le compte ${numero} existe déjà.`];
    else if (!intitule) erreursPlan = ["Indiquez l'intitulé du nouveau compte."];
    if (erreursPlan.length) return;
    const classe = Number(numero[0]);
    const type: TypeCompte = classe === 9 ? 'bouclement' : nouveau.type;
    brouillon = [...brouillon, { numero, intitule, classe, type, niveauMin: nouveau.niveau === '-' ? null : nouveau.niveau }].sort((a, b) =>
      a.numero.localeCompare(b.numero),
    );
    nouveau = { numero: '', intitule: '', type: nouveau.type, niveau: nouveau.niveau };
  }

  function retirerCompte(numero: string) {
    brouillon = brouillon.filter((c) => c.numero !== numero);
  }

  /** Plan identique au plan par défaut : rien à enregistrer (les exercices gardent le plan par défaut). */
  function avecPlan(r: Reglages, p: Compte[]): Reglages {
    const { plan: _ancien, ...reste } = r;
    return nombreDifferences(differencesPlan(planDefaut, p)) === 0 ? reste : { ...reste, plan: p };
  }

  function enregistrerPlan() {
    const propre = brouillon.map((c) => ({ ...c, intitule: c.intitule.trim().replaceAll(';', ',') }));
    const r = controlerPlanEtablissement(propre, planDefaut);
    if (!r.ok) {
      erreursPlan = r.erreurs;
      return;
    }
    reglages.enregistrer(avecPlan($state.snapshot(reglages.valeurs), r.valeur));
    message = { texte: 'Plan comptable enregistré. Il s’applique aux exercices que vous créerez désormais.', ok: true };
    vue = 'resume';
  }

  // ───────────── Plan : import CSV ─────────────
  let importe = $state<{ nom: string; erreurs: string[]; plan: Compte[] | null; diff: DifferencesPlan | null } | null>(null);

  async function importerCsv() {
    const [f] = await choisirFichiers('.csv,text/csv');
    if (!f) return;
    const r = importerPlanCsv(f.texte, planDefaut);
    importe = r.ok
      ? { nom: f.nom, erreurs: [], plan: r.valeur, diff: differencesPlan(reglages.plan, r.valeur) }
      : { nom: f.nom, erreurs: r.erreurs, plan: null, diff: null };
    vue = 'import';
  }

  function remplacerPlan() {
    if (!importe?.plan) return;
    reglages.enregistrer(avecPlan($state.snapshot(reglages.valeurs), importe.plan));
    message = { texte: `Plan comptable remplacé par celui de ${importe.nom}.`, ok: true };
    importe = null;
    vue = 'resume';
  }

  function exporterCsv() {
    telecharger('plan-comptable.csv', ecrirePlanCsv(reglages.plan), 'text/csv');
  }

  // ───────────── Niveaux ─────────────
  let titres = $state<TitresNiveaux>({ CFC: {}, MP: {} });
  let libelles = $state<Record<Niveau, string>>({ ...LIBELLES_CONTENU });
  let erreursNiveaux = $state<string[]>([]);

  /** Niveaux qui contiennent des exercices fournis : ils peuvent être renommés, pas retirés. */
  const occupes = (f: Filiere) => new Set(exercicesDemo.filter((e) => filiereDe(e) === f).map(difficulteDe));

  function ouvrirNiveaux() {
    titres = structuredClone($state.snapshot(reglages.titres));
    libelles = Object.fromEntries(NIVEAUX.map((n) => [n, reglages.libelleContenu(n)])) as Record<Niveau, string>;
    erreursNiveaux = [];
    vue = 'niveaux';
  }

  const numeros = (f: Filiere) => Object.keys(titres[f]).map(Number).sort((a, b) => a - b);

  function ajouterNiveau(f: Filiere) {
    const n = Math.max(0, ...numeros(f)) + 1;
    titres[f][n] = '';
  }

  function retirerDernier(f: Filiere) {
    const n = Math.max(...numeros(f));
    if (!occupes(f).has(n)) delete titres[f][n];
  }

  const egaux = (a: Record<number, string>, b: Record<number, string>) =>
    JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

  function enregistrerNiveaux() {
    const t: TitresNiveaux = {
      CFC: Object.fromEntries(Object.entries(titres.CFC).map(([k, v]) => [k, v.trim()])),
      MP: Object.fromEntries(Object.entries(titres.MP).map(([k, v]) => [k, v.trim()])),
    };
    erreursNiveaux = controlerTitres(t);
    if (erreursNiveaux.length) return;
    const l: Partial<Record<Niveau, string>> = {};
    for (const n of NIVEAUX) if (libelles[n].trim() && libelles[n].trim() !== LIBELLES_CONTENU[n]) l[n] = libelles[n].trim();
    const { titres: _t, libellesContenu: _l, ...reste } = $state.snapshot(reglages.valeurs);
    const r: Reglages = { ...reste };
    if (!egaux(t.CFC, TITRES_DIFFICULTE.CFC) || !egaux(t.MP, TITRES_DIFFICULTE.MP)) r.titres = t;
    if (Object.keys(l).length) r.libellesContenu = l;
    reglages.enregistrer(r);
    message = { texte: 'Niveaux enregistrés.', ok: true };
    vue = 'resume';
  }

  // ───────────── Partage ─────────────
  function exporter() {
    const jour = new Date().toISOString().slice(0, 10);
    telecharger(nomFichier(['compta-pme', 'reglages', jour], EXT_REGLAGES), exporterReglages($state.snapshot(reglages.valeurs)));
  }

  async function importer() {
    const [f] = await choisirFichiers(`${EXT_REGLAGES},.json`);
    if (!f) return;
    try {
      reglages.enregistrer(importerReglages(f.texte, planDefaut));
      message = { texte: `Réglages de ${f.nom} importés.`, ok: true };
    } catch (e) {
      message = { texte: e instanceof ErreurFichier ? e.message : 'Ce fichier est illisible.', ok: false };
    }
  }

  let confirmation = $state(false);
  let minuteur: ReturnType<typeof setTimeout> | undefined;
  function reinitialiser() {
    if (!confirmation) {
      confirmation = true;
      minuteur = setTimeout(() => (confirmation = false), 5000);
      return;
    }
    clearTimeout(minuteur);
    confirmation = false;
    reglages.enregistrer({});
    message = { texte: 'Réglages par défaut rétablis.', ok: true };
  }
  $effect(() => () => clearTimeout(minuteur));

  const modifie = $derived(reglages.valeurs.titres !== undefined || reglages.valeurs.libellesContenu !== undefined);
</script>

{#if message}
  <p class={message.ok ? 'info message' : 'alerte message'} role="status">{message.texte}</p>
{/if}

{#if vue === 'resume'}
  <div class="grille">
    <section class="carte">
      <h2>Plan comptable</h2>
      <div class="corps-carte">
        <dl class="resume">
          <dt>Plan utilisé</dt>
          <dd>
            {#if reglages.planModifie}Plan de l'établissement <span class="badge modif">{nombreDifferences(differencesPlan(planDefaut, reglages.plan))} modifications</span>
            {:else}Plan PME du cours <span class="badge">par défaut</span>{/if}
          </dd>
          <dt>Comptes</dt>
          <dd>{reglages.plan.length}, dont {visibles} visibles selon le niveau</dd>
        </dl>
        <p class="discret">Le plan s'applique aux exercices que vous créez. Les exercices fournis avec le logiciel gardent toujours le plan par défaut, et chaque exercice garde le plan avec lequel il a été créé.</p>
        <div class="actions">
          <button class="btn btn-principal" onclick={ouvrirPlan}>Modifier le plan</button>
          <button class="btn" onclick={importerCsv}>Importer un plan (CSV)…</button>
          <button class="btn" onclick={exporterCsv}>Exporter le plan (CSV)</button>
        </div>
      </div>
    </section>
    <section class="carte">
      <h2>Niveaux et classement des exercices</h2>
      <div class="corps-carte">
        <dl class="resume">
          <dt>CFC</dt><dd>{nbNiveaux('CFC')} niveaux</dd>
          <dt>MP</dt><dd>{nbNiveaux('MP')} niveaux</dd>
          <dt>Comptes et fonctions</dt><dd>{NIVEAUX.map((n) => reglages.libelleContenu(n)).join(' ; ')}</dd>
        </dl>
        <p class="discret">Les titres apparaissent à l'accueil (dans ce navigateur), dans l'éditeur et dans les exercices que vous créez.{modifie ? '' : ' Titres par défaut.'}</p>
        <div class="actions"><button class="btn btn-principal" onclick={ouvrirNiveaux}>Modifier les niveaux</button></div>
      </div>
    </section>
    <section class="carte">
      <h2>Partager ces réglages</h2>
      <div class="corps-carte">
        <p>Un fichier <code>{EXT_REGLAGES}</code> contient le plan et les niveaux. Les collègues de votre école l'importent pour travailler avec les mêmes réglages.</p>
        <p class="discret">Les élèves n'ont rien à faire : chaque exercice que vous distribuez emporte son plan comptable et le titre de son niveau.</p>
        <div class="actions">
          <button class="btn" onclick={exporter}>Exporter les réglages</button>
          <button class="btn" onclick={importer}>Importer des réglages…</button>
          <button class="btn" class:arme={confirmation} onclick={reinitialiser} onblur={() => (confirmation = false)}>
            {confirmation ? 'Confirmer : revenir aux réglages par défaut' : 'Revenir aux réglages par défaut'}
          </button>
        </div>
      </div>
    </section>
  </div>
{:else if vue === 'plan'}
  <div class="entete">
    <h2>Plan comptable de l'établissement {#if nbModifs}<span class="badge modif">{nbModifs} modification{nbModifs > 1 ? 's' : ''}</span>{/if}</h2>
    <button class="btn" onclick={() => (vue = 'resume')}>Retour aux paramètres</button>
  </div>
  <div class="barre">
    <input class="champ recherche" bind:value={recherche} placeholder="Rechercher un compte par nom ou numéro" aria-label="Rechercher un compte" />
    <label><input type="checkbox" bind:checked={seulementModifies} /> Afficher seulement les comptes modifiés</label>
    <span class="espace"></span>
    <button class="btn btn-principal" onclick={enregistrerPlan}>Enregistrer</button>
  </div>
  {#if erreursPlan.length}
    <div class="alerte message" role="alert"><strong>Le plan n'est pas enregistré.</strong><ul>{#each erreursPlan as e}<li>{e}</li>{/each}</ul></div>
  {/if}
  <section class="carte">
    <table>
      <thead><tr><th>N°</th><th>Intitulé</th><th>Type</th><th>Visible dès</th><th>Logiciel</th><th><span class="sr-only">Retirer</span></th></tr></thead>
      <tbody>
        {#each groupes as g (g.classe)}
          <tr class="classe"><td colspan="6">{TITRES_CLASSES[g.classe] ?? `Classe ${g.classe}`}</td></tr>
          {#each g.comptes as c (c.numero)}
            {@const d = defautParNumero.get(c.numero)}
            {@const verrou = estVerrouille(c.numero)}
            <tr>
              <td class="num">{c.numero}</td>
              <td>
                <input class="champ" class:modifie={d && d.intitule !== c.intitule} bind:value={c.intitule}
                  disabled={INTITULES_FIXES.includes(c.numero)} aria-label={`Intitulé du compte ${c.numero}`} />
              </td>
              <td>{c.type}</td>
              <td>
                <select class="champ" class:modifie={d && d.niveauMin !== c.niveauMin} value={c.niveauMin ?? '-'} disabled={verrou}
                  onchange={(e) => changerNiveau(c, e.currentTarget.value)} aria-label={`Niveau du compte ${c.numero}`}>
                  {#each NIVEAUX as n}<option value={n}>{LIBELLES_NIVEAU[n]}</option>{/each}
                  <option value="-">non utilisé</option>
                </select>
              </td>
              <td class="petit">
                {#if verrou}<span class="verrou">utilisé par le logiciel</span>{/if}
                {#if !d}<span class="discret">ajouté par l'établissement</span>
                {:else if d.intitule !== c.intitule || d.niveauMin !== c.niveauMin}
                  <span class="discret">Plan par défaut : {d.intitule !== c.intitule ? d.intitule : NIVEAU_TEXTE(d.niveauMin)}</span>
                {/if}
              </td>
              <td>{#if !d}<button class="btn-lien" onclick={() => retirerCompte(c.numero)} aria-label={`Retirer le compte ${c.numero}`}>Retirer</button>{/if}</td>
            </tr>
          {/each}
        {:else}
          <tr><td colspan="6" class="discret">Aucun compte ne correspond.</td></tr>
        {/each}
      </tbody>
    </table>
  </section>
  <section class="carte ajout">
    <h2>Ajouter un compte</h2>
    <div class="corps-carte ligne-ajout">
      <div><label class="bloc" for="nv-numero">Numéro</label><input id="nv-numero" class="champ court" bind:value={nouveau.numero} inputmode="numeric" maxlength="4" /></div>
      <div class="large"><label class="bloc" for="nv-intitule">Intitulé</label><input id="nv-intitule" class="champ" bind:value={nouveau.intitule} /></div>
      <div>
        <label class="bloc" for="nv-type">Type</label>
        <select id="nv-type" class="champ" bind:value={nouveau.type}>
          <option value="actif">actif</option><option value="passif">passif</option><option value="charge">charge</option><option value="produit">produit</option>
        </select>
      </div>
      <div>
        <label class="bloc" for="nv-niveau">Visible dès</label>
        <select id="nv-niveau" class="champ" bind:value={nouveau.niveau}>
          {#each NIVEAUX as n}<option value={n}>{LIBELLES_NIVEAU[n]}</option>{/each}<option value="-">non utilisé</option>
        </select>
      </div>
      <div class="bas"><button class="btn" onclick={ajouterCompte}>Ajouter le compte</button></div>
    </div>
    <p class="discret note">La classe suit le premier chiffre du numéro. Les comptes « utilisés par le logiciel » (bouclement, TVA, ducroire, salaires, répartition du bénéfice, titres, analyse, simulateur) ne peuvent être ni retirés ni changés de niveau ; leur intitulé reste modifiable, sauf 2800, qui suit la forme juridique.</p>
  </section>
{:else if vue === 'import' && importe}
  <div class="entete"><h2>Importer un plan comptable</h2><button class="btn" onclick={() => (vue = 'resume')}>Retour aux paramètres</button></div>
  <section class="carte etroite">
    <div class="corps-carte">
      {#if importe.erreurs.length}
        <div class="alerte message" role="alert">
          <strong>{importe.nom} n'a pas été importé.</strong>
          <ul>{#each importe.erreurs as e}<li>{e}</li>{/each}</ul>
        </div>
        <p class="discret">Format attendu (le même que l'export) : <code>numero;intitule;classe;type;niveau_min</code>, une ligne par compte.</p>
        <div class="actions"><button class="btn" onclick={importerCsv}>Choisir un autre fichier…</button><button class="btn-lien" onclick={exporterCsv}>Télécharger le plan actuel comme modèle</button></div>
      {:else if importe.diff}
        <div class="info message" role="status">
          <strong>{importe.nom} est valable.</strong> Par rapport au plan actuel :
          <ul>
            <li>{importe.diff.intitulesModifies.length} intitulé(s) modifié(s)</li>
            <li>{importe.diff.ajoutes.length} compte(s) ajouté(s){importe.diff.ajoutes.length ? ` : ${importe.diff.ajoutes.join(', ')}` : ''}</li>
            <li>{importe.diff.retires.length} compte(s) retiré(s){importe.diff.retires.length ? ` : ${importe.diff.retires.join(', ')}` : ''}</li>
            <li>{importe.diff.nonUtilises.length} compte(s) passé(s) à « non utilisé », {importe.diff.niveauxModifies.length} autre(s) changement(s) de niveau</li>
          </ul>
        </div>
        <p class="discret">Les exercices déjà créés ou distribués ne changent pas : chacun garde le plan avec lequel il a été créé.</p>
        <div class="actions"><button class="btn btn-principal" onclick={remplacerPlan}>Remplacer le plan</button><button class="btn" onclick={() => (vue = 'resume')}>Annuler</button></div>
      {/if}
    </div>
  </section>
{:else if vue === 'niveaux'}
  <div class="entete"><h2>Niveaux et classement des exercices</h2><button class="btn" onclick={() => (vue = 'resume')}>Retour aux paramètres</button></div>
  {#if erreursNiveaux.length}
    <div class="alerte message" role="alert"><strong>Les niveaux ne sont pas enregistrés.</strong><ul>{#each erreursNiveaux as e}<li>{e}</li>{/each}</ul></div>
  {/if}
  <div class="grille">
    {#each ['CFC', 'MP'] as const as f}
      <section class="carte">
        <h2>Niveaux de difficulté — {f}</h2>
        <table>
          <thead><tr><th>Niveau</th><th>Titre affiché</th></tr></thead>
          <tbody>
            {#each numeros(f) as n (n)}
              <tr><td class="num">{n}</td><td><input class="champ" bind:value={titres[f][n]} aria-label={`Titre du niveau ${n} (${f})`} /></td></tr>
            {/each}
          </tbody>
        </table>
        <div class="corps-carte">
          <div class="actions gauche">
            <button class="btn" onclick={() => ajouterNiveau(f)}>Ajouter un niveau</button>
            {#if !occupes(f).has(Math.max(...numeros(f)))}<button class="btn" onclick={() => retirerDernier(f)}>Retirer le niveau {Math.max(...numeros(f))}</button>{/if}
          </div>
          <p class="discret">Un niveau qui contient des exercices fournis peut être renommé, pas retiré.</p>
        </div>
      </section>
    {/each}
    <section class="carte">
      <h2>Comptes et fonctions</h2>
      <table>
        <thead><tr><th>Contenu</th><th>Nom affiché</th></tr></thead>
        <tbody>
          {#each NIVEAUX as n}
            <tr><td>{LIBELLES_NIVEAU[n]}</td><td><input class="champ" bind:value={libelles[n]} aria-label={`Nom affiché pour ${LIBELLES_NIVEAU[n]}`} /></td></tr>
          {/each}
        </tbody>
      </table>
      <div class="corps-carte"><p class="discret">Seul le nom change : ce que chaque niveau active (comptes, TVA, salaires, sociétés…) reste celui des niveaux validés.</p></div>
    </section>
  </div>
  <div class="actions"><button class="btn btn-principal" onclick={enregistrerNiveaux}>Enregistrer</button></div>
{/if}

<style>
  .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 860px) { .grille { grid-template-columns: 1fr; } }
  .resume { display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; margin: 0 0 10px; }
  .resume dt { color: var(--c-texte-2); }
  .resume dd { margin: 0; }
  .corps-carte p { margin: 0 0 10px; line-height: 1.5; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; justify-content: flex-end; }
  .actions.gauche { justify-content: flex-start; margin-top: 0; margin-bottom: 8px; }
  .badge.modif { background: #FDEBDD; color: var(--c-alerte-texte, #B34A12); }
  .message { margin: 0 0 14px; }
  .message ul { margin: 6px 0 0 18px; padding: 0; }
  .entete { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  .barre { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
  .recherche { width: 280px; max-width: 100%; }
  .espace { flex: 1; }
  tr.classe td { font-weight: bold; color: var(--c-structure); padding-top: 14px; background: var(--c-fond); }
  td { vertical-align: middle; padding: 5px 10px; }
  td.num { width: 64px; }
  .champ.modifie { border-color: var(--c-accent, #E8601C); }
  .petit { font-size: 12px; }
  .verrou { color: var(--c-texte-2); font-weight: bold; margin-right: 8px; }
  .ajout { margin-top: 16px; }
  .ligne-ajout { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
  .ligne-ajout .large { flex: 1; min-width: 220px; }
  .court { width: 90px; }
  .note { padding: 0 18px 14px; margin: 0; font-size: 13px; }
  .etroite { max-width: 720px; }
  .btn.arme { color: var(--c-negatif); border-color: var(--c-negatif); font-weight: bold; }
</style>
