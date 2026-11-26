<!--
  Progression de la classe dans « Apprendre » : l'enseignant importe les fichiers rendus par les élèves et voit un
  tableau élève × notion. Les fichiers restent en mémoire dans ce navigateur : rien n'est enregistré ni envoyé.
-->
<script lang="ts">
  import { LIBELLES_NIVEAU_APPRENDRE, MODULES, type NiveauApprendre } from '../../data/apprendre';
  import { ErreurFichier } from '../../io/fichiers';
  import { EXT_PROGRESSION, importerProgression, type FichierProgression } from '../../io/progression';
  import { choisirFichiers } from '../fichiers-navigateur';
  import { etatNotion, LIBELLES_ETAT_NOTION } from '../../engine/revision';

  let fichiers = $state<FichierProgression[]>([]);
  let messages = $state<string[]>([]);
  let niveau = $state<NiveauApprendre>('CFC1');
  const modules = $derived(MODULES.filter((m) => m.niveau === niveau));
  const eleves = $derived([...fichiers].sort((a, b) => `${a.eleve.nom} ${a.eleve.prenom}`.localeCompare(`${b.eleve.nom} ${b.eleve.prenom}`, 'fr')));
  const cle = (x: FichierProgression) => `${x.eleve.nom}|${x.eleve.prenom}|${x.eleve.classe}`.toLocaleLowerCase('fr');

  async function importer() {
    messages = [];
    for (const f of await choisirFichiers(`${EXT_PROGRESSION},.json`, true)) {
      try {
        const p = importerProgression(f.texte);
        // Un élève qui rend deux fois : le fichier le plus récent remplace l'autre.
        const ancien = fichiers.find((x) => cle(x) === cle(p));
        if (!ancien || ancien.exporteLe < p.exporteLe) fichiers = [...fichiers.filter((x) => cle(x) !== cle(p)), p];
      } catch (e) {
        messages = [...messages, `${f.nom} : ${e instanceof ErreurFichier ? e.message : 'fichier illisible.'}`];
      }
    }
  }
  const maitrises = (f: FichierProgression) => modules.filter((m) => f.progression[m.id]?.maitrise).length;
  const reussite = (id: string) => fichiers.filter((f) => f.progression[id]?.maitrise).length;
  const points = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace('.', ','));
</script>

<section class="carte">
  <h2>Progression dans « Apprendre pas à pas »</h2>
  <div class="corps-carte">
    <p class="discret">
      Chaque élève télécharge son fichier depuis la page « Apprendre » (« Envoyer ma progression à l'enseignant ») et le rend
      dans le devoir Google Classroom. Importez ici tous les fichiers de la classe.
    </p>
    <div class="barre">
      <button class="btn btn-principal" onclick={importer}>Importer des fichiers de progression…</button>
      {#if fichiers.length}<button class="btn" onclick={() => (fichiers = [])}>Vider le tableau</button>{/if}
      <div class="segments" role="group" aria-label="Niveau">
        {#each ['CFC1', 'CFC2', 'MP'] as const as n}
          <button aria-pressed={niveau === n} onclick={() => (niveau = n)}>{LIBELLES_NIVEAU_APPRENDRE[n]}</button>
        {/each}
      </div>
    </div>
    {#if messages.length}<div class="alerte" role="alert"><ul>{#each messages as msg}<li>{msg}</li>{/each}</ul></div>{/if}
  </div>
  {#if fichiers.length === 0}
    <p class="vide">Aucun fichier importé pour l'instant.</p>
  {:else}
    <div class="defile">
      <table>
        <thead>
          <tr>
            <th>Élève</th><th>Classe</th><th class="montant">Réussies (confirmées)</th>
            {#each modules as m, i}<th class="col-module" title={m.titre}>{i + 1}</th>{/each}
          </tr>
        </thead>
        <tbody>
          {#each eleves as f, k (cle(f))}
            <tr class:zebre={k % 2 === 1}>
              <td>{f.eleve.nom} {f.eleve.prenom}</td><td>{f.eleve.classe}</td>
              <td class="montant num">{maitrises(f)} / {modules.length} ({modules.filter((m) => etatNotion(f.progression[m.id]) === "confirmee").length})</td>
              {#each modules as m}
                {@const p = f.progression[m.id]}
                {@const en = etatNotion(p)}
                <td
                  class="cellule"
                  class:ok={en === 'confirmee'}
                  class:une-fois={en === 'reussieUneFois'}
                  class:encours={en === 'enCours' || en === 'aRaviver'}
                  title={`${m.titre} : ${LIBELLES_ETAT_NOTION[en]}${p ? `, meilleur score ${points(p.meilleur)} / ${p.sur}, ${p.series} série${p.series > 1 ? 's' : ''}, ${p.confirmations ?? 0} révision${(p.confirmations ?? 0) > 1 ? 's' : ''} réussie${(p.confirmations ?? 0) > 1 ? 's' : ''}` : ''}`}
                >
                  {en === 'confirmee' ? 'C' : en === 'reussieUneFois' ? 'R' : en === 'aRaviver' ? 'À' : p ? points(p.meilleur) : '–'}
                </td>
              {/each}
            </tr>
          {/each}
          <tr class="total">
            <td colspan="3">Élèves qui ont réussi la notion au moins une fois (sur {fichiers.length})</td>
            {#each modules as m}<td class="cellule num">{reussite(m.id)}</td>{/each}
          </tr>
        </tbody>
      </table>
    </div>
    <div class="corps-carte">
      <p class="discret legende">
        C = confirmée (série réussie et deux révisions réussies à des jours différents) · R = réussie une fois, pas encore
        confirmée · À = à raviver (dernière révision ratée) · un nombre = meilleur score sur 10, notion pas encore réussie ·
        – = pas commencé. Ce fichier est rempli par l'élève : il renseigne sur le travail, il ne prouve pas la maîtrise.
      </p>
      <ol class="liste-modules">{#each modules as m}<li>{m.titre}</li>{/each}</ol>
    </div>
  {/if}
</section>

<style>
  .barre { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 10px; }
  .defile { overflow-x: auto; }
  .col-module, .cellule { text-align: center; width: 44px; }
  .cellule.ok { background: var(--c-ok-fond); color: var(--c-ok); font-weight: bold; }
  .cellule.une-fois { color: var(--c-ok); }
  .cellule.encours { color: var(--c-alerte-texte); }
  .legende { margin: 0 0 8px; }
  .liste-modules { margin: 0; padding-left: 22px; columns: 2; font-size: var(--t-13); color: var(--c-texte-2); }
  @media (max-width: 700px) { .liste-modules { columns: 1; } }
</style>
