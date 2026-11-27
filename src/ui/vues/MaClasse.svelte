<!--
  Espace enseignant, onglet « Ma classe » (phase V3, maquette public/maquettes/distribution-classe.html, écran V3.6,
  validée le 27.11.2026). Un tableau par classe : une ligne par élève, une colonne par exercice rendu et une par notion
  d'Apprendre. Tout est gardé dans un fichier de classe que l'enseignant enregistre et rouvre (décision du 27.11.2026) :
  rien n'est gardé dans le navigateur ni envoyé en ligne. Les copies importées dans « Copies » rejoignent le fichier
  ouvert ; les ajustements de points y sont aussi enregistrés.
-->
<script lang="ts">
  import { enseignant } from '../enseignant.svelte';
  import { exercicesDemo } from '../../data/demos';
  import { DOSSIERS_EVALUATION } from '../../data/dossiers';
  import { MODULES } from '../../data/apprendre';
  import type { Exercice } from '../../engine/exercice';
  import { corrigerCopie } from '../../engine/notation';
  import { appliquerAjustements } from '../../engine/ajustements';
  import { etatNotion, LIBELLES_ETAT_NOTION, type EtatNotion } from '../../engine/revision';
  import type { FicheFacturation } from '../../engine/facturation';
  import type { FicheBudget } from '../../engine/budget';
  import { ErreurFichier, nomFichier } from '../../io/fichiers';
  import { EXT_PROGRESSION, importerProgression } from '../../io/progression';
  import { ajouterEleves, ajouterProgressions, classeVide, cleCopie, cleEleve, EXT_CLASSE, exerciceDeCopie, exporterClasse, importerClasse, lireListeClasse } from '../../io/classe';
  import { choisirFichiers, telecharger } from '../fichiers-navigateur';
  import { dialogue } from '../dialogue.svelte';
  import { dateHeure } from '../format';

  let nomNouvelle = $state('');
  let listeCollee = $state('');
  let voirListe = $state(false);
  let filtre = $state<'tous' | 'nonRendu' | 'sous4'>('tous');
  let message = $state('');

  const classe = $derived(enseignant.classe);
  const exercices = $derived<Exercice[]>([...enseignant.exercices, ...exercicesDemo, ...DOSSIERS_EVALUATION]);

  /** Exercices rendus par la classe, dans l'ordre de la première copie. */
  const devoirs = $derived.by(() => {
    if (!classe) return [];
    const ids: string[] = [];
    for (const c of [...classe.copies].sort((a, b) => a.exporteLe.localeCompare(b.exporteLe))) if (!ids.includes(exerciceDeCopie(c))) ids.push(exerciceDeCopie(c));
    return ids.map((id) => {
      const ex = exercices.find((e) => e.id === id);
      const copie = classe.copies.find((c) => exerciceDeCopie(c) === id);
      return { id, ex, titre: ex?.titre ?? copie?.exerciceTitre ?? id };
    });
  });

  /** Notions d'Apprendre travaillées par au moins un élève de la classe. */
  const notions = $derived(classe ? MODULES.filter((m) => classe.progressions.some((p) => p.progression[m.id])) : []);

  type Cellule = { note: number | null; rendu: boolean; ajustee: boolean };
  const lignes = $derived.by(() => {
    if (!classe) return [];
    return [...classe.eleves]
      .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr'))
      .map((e) => {
        const k = cleEleve(e);
        const cellules: Cellule[] = devoirs.map((d) => {
          const copie = classe.copies.find((c) => exerciceDeCopie(c) === d.id && cleEleve(c.eleve) === k);
          if (!copie) return { note: null, rendu: false, ajustee: false };
          if (!d.ex?.corrige?.length) return { note: null, rendu: true, ajustee: false };
          const aj = classe.ajustements[cleCopie(copie, d.id)] ?? {};
          const c = appliquerAjustements(corrigerCopie(d.ex, copie.dossier, copie.fiches as { facturation?: FicheFacturation; budget?: FicheBudget } | undefined), aj);
          return { note: c.note, rendu: true, ajustee: c.operations.some((o) => o.ajuste) };
        });
        const prog = classe.progressions.find((p) => cleEleve(p.eleve) === k);
        const etats: EtatNotion[] = notions.map((m) => etatNotion(prog?.progression[m.id]));
        return { eleve: e, cellules, etats };
      });
  });
  const visibles = $derived(
    lignes.filter((l) =>
      filtre === 'nonRendu' ? l.cellules.some((c) => !c.rendu) : filtre === 'sous4' ? l.cellules.some((c) => c.note !== null && c.note < 4) : true,
    ),
  );

  const LETTRE: Record<EtatNotion, string> = { confirmee: 'C', reussieUneFois: 'R', aRaviver: 'À', enCours: '·', aFaire: '' };

  function nouvelle() {
    if (!nomNouvelle.trim()) {
      message = 'Indiquez le nom de la classe (par exemple 1CA).';
      return;
    }
    enseignant.classe = classeVide(nomNouvelle.trim());
    enseignant.classeModifiee = true;
    voirListe = true;
    message = '';
  }

  async function quitterSansPerdre(): Promise<boolean> {
    if (!enseignant.classe || !enseignant.classeModifiee) return true;
    return dialogue.demander({
      titre: 'Fichier de classe non enregistré',
      texte: [`Les changements de « ${enseignant.classe.nom} » ne sont pas enregistrés. Ils seront perdus.`],
      confirmer: 'Continuer sans enregistrer',
      danger: true,
    });
  }

  async function ouvrir() {
    if (!(await quitterSansPerdre())) return;
    const [f] = await choisirFichiers(`${EXT_CLASSE},.json`);
    if (!f) return;
    try {
      enseignant.classe = importerClasse(f.texte);
      enseignant.classeModifiee = false;
      message = `Fichier de classe « ${enseignant.classe.nom} » ouvert.`;
    } catch (e) {
      message = e instanceof ErreurFichier ? e.message : "Le fichier n'a pas pu être lu.";
    }
  }

  function enregistrer() {
    if (!classe) return;
    telecharger(nomFichier([classe.nom || 'classe'], EXT_CLASSE), exporterClasse($state.snapshot(classe)));
    enseignant.classe = { ...classe, enregistreLe: new Date().toISOString() };
    enseignant.classeModifiee = false;
  }

  async function fermer() {
    if (!(await quitterSansPerdre())) return;
    enseignant.classe = null;
    enseignant.classeModifiee = false;
  }

  function ajouterListe() {
    if (!classe) return;
    const eleves = lireListeClasse(listeCollee);
    if (!eleves.length) {
      message = 'Aucun élève reconnu : une ligne par élève, le nom puis le prénom.';
      return;
    }
    const avant = classe.eleves.length;
    enseignant.classe = ajouterEleves(classe, eleves);
    enseignant.classeModifiee = true;
    message = `${enseignant.classe.eleves.length - avant} élève${enseignant.classe.eleves.length - avant > 1 ? 's' : ''} ajouté${enseignant.classe.eleves.length - avant > 1 ? 's' : ''}.`;
    listeCollee = '';
    voirListe = false;
  }

  async function importerProgressions() {
    if (!classe) return;
    const fichiers = await choisirFichiers(`${EXT_PROGRESSION},.json`, true);
    const lus = [];
    const refus: string[] = [];
    for (const f of fichiers) {
      try {
        lus.push(importerProgression(f.texte));
      } catch {
        refus.push(f.nom);
      }
    }
    if (lus.length) {
      enseignant.classe = ajouterProgressions(classe, lus);
      enseignant.classeModifiee = true;
    }
    message = [lus.length ? `${lus.length} progression${lus.length > 1 ? 's' : ''} importée${lus.length > 1 ? 's' : ''}.` : '', refus.length ? `Fichiers refusés : ${refus.join(', ')}.` : ''].filter(Boolean).join(' ');
  }

  const fmtNote = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));
</script>

{#if !classe}
  <section class="carte">
    <h2>Ma classe</h2>
    <div class="corps-carte depart">
      <p>
        Suivez une classe d'un coup d'œil : qui a rendu quel exercice, sa note, et les notions d'Apprendre réussies. Tout est
        gardé dans un fichier de classe que vous enregistrez et rouvrez la fois suivante, sur n'importe quel ordinateur :
        rien n'est gardé dans le navigateur ni envoyé en ligne.
      </p>
      <div class="boutons">
        <button class="btn btn-principal" onclick={ouvrir}>Ouvrir un fichier de classe…</button>
      </div>
      <form class="nouvelle" onsubmit={(e) => { e.preventDefault(); nouvelle(); }}>
        <label><span class="discret petit">Ou créer une classe</span><input class="champ" bind:value={nomNouvelle} placeholder="par ex. 1CA" aria-label="Nom de la nouvelle classe" /></label>
        <button class="btn" type="submit">Créer la classe</button>
      </form>
      {#if message}<p class="message information" role="status">{message}</p>{/if}
    </div>
  </section>
{:else}
  <section class="carte">
    <header class="tete">
      <div>
        <h2>Ma classe · {classe.nom}</h2>
        <p class="discret petit">
          {classe.eleves.length} élève{classe.eleves.length > 1 ? 's' : ''} · {classe.copies.length} copie{classe.copies.length > 1 ? 's' : ''}
          {#if classe.enregistreLe} · enregistré le {dateHeure(classe.enregistreLe)}{/if}
        </p>
      </div>
      <div class="boutons">
        <button class="btn btn-principal" onclick={enregistrer}>Enregistrer le fichier de classe</button>
        <button class="btn" onclick={ouvrir}>Ouvrir un autre fichier…</button>
        <button class="btn" onclick={fermer}>Fermer</button>
      </div>
    </header>
    {#if enseignant.classeModifiee}
      <p class="message avert rappel" role="status">Fichier de classe modifié : enregistrez-le pour garder ces changements.</p>
    {/if}
    <div class="corps-carte">
      <div class="filtres">
        <div class="segments" role="group" aria-label="Filtre">
          <button aria-pressed={filtre === 'tous'} onclick={() => (filtre = 'tous')}>Tous</button>
          <button aria-pressed={filtre === 'nonRendu'} onclick={() => (filtre = 'nonRendu')}>N'a pas rendu</button>
          <button aria-pressed={filtre === 'sous4'} onclick={() => (filtre = 'sous4')}>Sous 4</button>
        </div>
        <button class="btn-lien" onclick={() => (voirListe = !voirListe)}>Coller la liste de la classe</button>
        <button class="btn-lien" onclick={importerProgressions}>Importer des progressions d'Apprendre…</button>
      </div>
      {#if voirListe}
        <div class="liste">
          <label for="liste-classe" class="discret petit">Une ligne par élève, le nom puis le prénom (copiés depuis un tableur, ou séparés par un point-virgule).</label>
          <textarea id="liste-classe" class="champ" rows="6" bind:value={listeCollee} placeholder={'Martin\tLéa\nRossier\tNoah'}></textarea>
          <div class="boutons"><button class="btn" onclick={ajouterListe}>Ajouter les élèves</button></div>
        </div>
      {/if}
      {#if message}<p class="message information" role="status">{message}</p>{/if}
      {#if classe.eleves.length === 0}
        <p class="vide">Aucun élève pour l'instant. Collez la liste de la classe, ou importez des copies dans l'onglet « Copies » : leurs auteurs s'ajoutent à la liste.</p>
      {:else}
        <div class="defile">
          <table class="classe">
            <thead>
              <tr>
                <th>Élève</th>
                {#each devoirs as d (d.id)}<th>{d.titre}</th>{/each}
                {#each notions as m (m.id)}<th class="notion">{m.titre}</th>{/each}
              </tr>
            </thead>
            <tbody>
              {#each visibles as l (cleEleve(l.eleve))}
                <tr>
                  <td><b>{l.eleve.nom}</b> {l.eleve.prenom}</td>
                  {#each l.cellules as c, i (devoirs[i]!.id)}
                    <td class="num">
                      {#if !c.rendu}<span class="pas-rendu">Pas rendu</span>
                      {:else if c.note === null}<span class="discret">Rendu</span>
                      {:else}<span class:sous4={c.note < 4} title={c.ajustee ? 'Note avec un ajustement de points' : undefined}>{fmtNote(c.note)}{c.ajustee ? '*' : ''}</span>{/if}
                    </td>
                  {/each}
                  {#each l.etats as e, i (notions[i]!.id)}
                    <td class={`etat ${e}`} title={LIBELLES_ETAT_NOTION[e]}>{LETTRE[e]}<span class="sr-only">{LIBELLES_ETAT_NOTION[e]}</span></td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="discret petit">
          C : notion confirmée · R : réussie une fois · À : à raviver · « · » : en cours. Une note suivie de * tient compte
          d'un ajustement de points. Les notes se calculent avec le corrigé de l'exercice ; « Rendu » : corrigé introuvable
          dans vos exercices.
        </p>
      {/if}
    </div>
  </section>
{/if}

<style>
  .carte h2 { margin: 0; }
  .carte > h2 { padding: 14px 18px; border-bottom: 1px solid var(--c-bordure-3); }
  .depart { display: flex; flex-direction: column; gap: var(--e-3); }
  .depart p { margin: 0; max-width: 75ch; }
  .nouvelle { display: flex; gap: var(--e-2); align-items: flex-end; flex-wrap: wrap; }
  .nouvelle label { display: flex; flex-direction: column; gap: 2px; }
  .tete { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--e-3); flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid var(--c-bordure-3); }
  .tete p { margin: 2px 0 0; }
  .rappel { margin: var(--e-3) 18px 0; }
  .boutons { display: flex; gap: var(--e-2); flex-wrap: wrap; }
  .filtres { display: flex; gap: var(--e-3); align-items: center; flex-wrap: wrap; margin-bottom: var(--e-3); }
  .liste { display: flex; flex-direction: column; gap: var(--e-2); margin-bottom: var(--e-3); max-width: 520px; }
  .liste textarea { font-family: inherit; }
  .defile { overflow-x: auto; }
  table.classe { border-collapse: collapse; width: 100%; font-size: var(--t-14); }
  table.classe th { font-size: var(--t-13); font-weight: 600; color: var(--c-texte-2); background: var(--c-fond-tete); padding: 8px 10px; text-align: center; border-bottom: 1px solid var(--c-bordure-2); }
  table.classe th:first-child, table.classe td:first-child { text-align: left; white-space: nowrap; }
  table.classe th.notion { max-width: 110px; }
  table.classe td { padding: 7px 10px; border-bottom: 1px solid var(--c-bordure-3); text-align: center; }
  table.classe tbody tr:nth-child(even) td { background: var(--c-zebra); }
  .pas-rendu { color: var(--c-erreur); font-size: var(--t-13); font-weight: 600; white-space: nowrap; }
  .sous4 { color: var(--c-erreur); font-weight: 600; }
  .etat { font-weight: 700; }
  .etat.confirmee { color: var(--c-succes); }
  .etat.reussieUneFois { color: var(--c-structure); }
  .etat.aRaviver { color: var(--c-avert); }
  .vide { color: var(--c-texte-2); }
  .petit { font-size: var(--t-13); }
</style>
