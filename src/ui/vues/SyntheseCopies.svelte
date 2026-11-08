<!--
  Synthèse des copies : l'enseignant importe les copies d'un exercice ; chaque copie est corrigée
  automatiquement (barème, points partiels, note suisse). Les copies restent en mémoire, dans ce
  navigateur uniquement : elles ne sont pas enregistrées.
-->
<script lang="ts">
  import { enseignant } from '../enseignant.svelte';
  import { exercicesDemo } from '../../data/demos';
  import { DOSSIERS_EVALUATION } from '../../data/dossiers';
  import type { Exercice } from '../../engine/exercice';
  import { analyseClasse, comparaisonOperation, corrigerCopie, type CorrectionCopie } from '../../engine/notation';
  import { formatMontant } from '../../engine/money';
  import type { LigneEcriture } from '../../engine/dossier';
  import { LIBELLES_DIAGNOSTIC } from '../../engine/correction';
  import { bouclementCorrige, PIECE_BOUCLEMENT } from '../../engine/correction-bouclement';
  import { EXT_COPIE, ErreurFichier, importerCopie, nomFichier, type Copie } from '../../io/fichiers';
  import { choisirFichiers, telecharger, telechargerBlob } from '../fichiers-navigateur';

  const disponibles = $derived<Exercice[]>(
    [...enseignant.exercices, ...exercicesDemo, ...DOSSIERS_EVALUATION].filter((e) => (e.corrige?.length ?? 0) > 0),
  );
  let exerciceId = $state('');
  const exercice = $derived(disponibles.find((e) => e.id === exerciceId));
  let copies = $state<Copie[]>([]);
  let messages = $state<string[]>([]);
  let detail = $state<string | null>(null);

  type Ligne = { cle: string; copie: Copie; correction: CorrectionCopie };
  const lignes = $derived<Ligne[]>(
    exercice
      ? copies
          .map((c) => ({ cle: `${c.eleve.nom}|${c.eleve.prenom}|${c.exporteLe}`, copie: c, correction: corrigerCopie(exercice, c.dossier) }))
          .sort((a, b) => `${a.copie.eleve.nom} ${a.copie.eleve.prenom}`.localeCompare(`${b.copie.eleve.nom} ${b.copie.eleve.prenom}`, 'fr'))
      : [],
  );
  /** Bilan de la classe par opération ; « à reprendre d'abord » trie par taux de réussite croissant. */
  let ordre = $state<'enonce' | 'reprendre'>('reprendre');
  const analyse = $derived(
    exercice ? analyseClasse(exercice, lignes.map((l) => ({ nom: `${l.copie.eleve.nom} ${l.copie.eleve.prenom}`, dossier: l.copie.dossier }))) : [],
  );
  const taux = (a: { reussites: number; total: number }) => (a.total ? a.reussites / a.total : 1);
  const stats = $derived(ordre === 'enonce' ? analyse : [...analyse].sort((a, b) => taux(a) - taux(b)));
  /** Plan de la première copie : sert à afficher les noms des comptes de la faute commune. */
  const copieRef = $derived(lignes[0]?.copie);
  const moyenne = $derived(lignes.length ? lignes.reduce((s, l) => s + l.correction.note, 0) / lignes.length : 0);
  const texteOp = (piece: string) =>
    piece === PIECE_BOUCLEMENT ? 'Écritures de bouclement' : (exercice?.operations.find((o) => o.numero === piece)?.texte ?? '');

  async function importer() {
    messages = [];
    if (!exercice) return;
    const fichiers = await choisirFichiers(`${EXT_COPIE},.json`, true);
    const nouvelles: Copie[] = [];
    for (const f of fichiers) {
      try {
        const c = importerCopie(f.texte);
        if (c.exerciceId !== exercice.id) {
          messages.push(`${f.nom} : cette copie concerne l'exercice « ${c.exerciceTitre} », pas celui-ci.`);
          continue;
        }
        nouvelles.push(c);
      } catch (e) {
        messages.push(`${f.nom} : ${e instanceof ErreurFichier ? e.message : 'fichier illisible.'}`);
      }
    }
    // Une même copie importée deux fois remplace la précédente (même élève, même classe).
    const cle = (c: Copie) => `${c.eleve.nom}|${c.eleve.prenom}|${c.eleve.classe}`.toLowerCase();
    const parEleve = new Map(copies.map((c) => [cle(c), c]));
    for (const c of nouvelles) parEleve.set(cle(c), c);
    copies = [...parEleve.values()];
    if (nouvelles.length) messages.push(`${nouvelles.length} copie${nouvelles.length > 1 ? 's' : ''} importée${nouvelles.length > 1 ? 's' : ''}.`);
  }

  function exporterCsv() {
    if (!exercice) return;
    const pieces = [...exercice.operations.map((o) => o.numero), ...(bouclementCorrige(exercice) ? [PIECE_BOUCLEMENT] : [])];
    const entete = ['Nom', 'Prénom', 'Classe', 'Points', 'Maximum', 'Note', ...pieces.map((p) => (p === PIECE_BOUCLEMENT ? p : `Op. ${p}`))];
    const rangs = lignes.map((l) => [
      l.copie.eleve.nom,
      l.copie.eleve.prenom,
      l.copie.eleve.classe,
      String(l.correction.points),
      String(l.correction.max),
      l.correction.note.toFixed(1),
      ...pieces.map((p) => String(l.correction.operations.find((x) => x.piece === p)?.points ?? '')),
    ]);
    const csv = [entete, ...rangs].map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    telecharger(nomFichier([exercice.titre, 'resultats'], '.csv'), '﻿' + csv, 'text/csv');
  }

  let pdfEnCours = $state(false);
  async function exporterPdf() {
    if (!exercice) return;
    pdfEnCours = true;
    try {
      const { genererPdfCopiesCorrigees } = await import('../../pdf/copies-corrigees');
      const nom = nomFichier([exercice.titre, 'copies-corrigees'], '.pdf');
      telechargerBlob(nom, await genererPdfCopiesCorrigees(exercice, lignes.map((l) => ({ copie: l.copie, correction: l.correction })), nom));
    } catch (e) {
      messages = [`Le PDF n'a pas pu être créé : ${e instanceof Error ? e.message : String(e)}`];
    } finally {
      pdfEnCours = false;
    }
  }

  const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));
  let voirJustes = $state(false);

  /** Lignes d'écriture lisibles : « Débit Banque (1020) · Crédit Ventes (3200) · 1'000.00 ». */
  function lisibles(lignes: LigneEcriture[], copie: Copie): string[] {
    const nom = new Map(copie.dossier.plan.map((c) => [c.numero, c.intitule]));
    const cpt = (n: string) => `${nom.get(n) ?? n} (${n})`;
    return lignes.map((l) =>
      [l.debit ? `D ${cpt(l.debit)}` : '', l.credit ? `C ${cpt(l.credit)}` : '', formatMontant(l.montant)].filter(Boolean).join(' · '),
    );
  }
</script>

<section class="carte">
  <h2>Correction des copies</h2>
  <div class="corps-carte barre">
    <label>
      <span class="discret">Exercice</span>
      <select class="champ" bind:value={exerciceId} onchange={() => { copies = []; messages = []; detail = null; }}>
        <option value="">Choisissez un exercice…</option>
        {#each disponibles as e}<option value={e.id}>{e.titre}</option>{/each}
      </select>
    </label>
    <button class="btn btn-principal" disabled={!exercice} onclick={importer}>Importer des copies…</button>
    <button class="btn" disabled={!lignes.length} onclick={exporterCsv}>Exporter les résultats (CSV)</button>
    <button class="btn" disabled={!lignes.length || pdfEnCours} onclick={exporterPdf}>{pdfEnCours ? 'Création du PDF…' : 'Copies corrigées (PDF)'}</button>
  </div>
  <p class="discret petit aide">
    Les copies importées restent dans cette page : elles ne sont ni enregistrées ni envoyées en ligne. Seuls les exercices
    dont le corrigé est saisi apparaissent dans la liste.
  </p>
</section>

{#if messages.length}
  <div class="info messages"><ul>{#each messages as m}<li>{m}</li>{/each}</ul></div>
{/if}

{#if exercice && lignes.length === 0}
  <p class="vide carte">Aucune copie importée pour cet exercice.</p>
{/if}

{#if lignes.length}
  <section class="carte">
    <h2>Résultats · {lignes.length} copie{lignes.length > 1 ? 's' : ''} · moyenne {moyenne.toFixed(2)}</h2>
    <table>
      <thead>
        <tr>
          <th>Élève</th>
          <th style="width:90px">Classe</th>
          <th class="montant" style="width:110px">Points</th>
          <th class="montant" style="width:70px">Note</th>
          <th style="width:110px"><span class="sr-only">Détail</span></th>
        </tr>
      </thead>
      <tbody>
        {#each lignes as l, i (l.cle)}
          <tr class:zebre={i % 2 === 1}>
            <td>{l.copie.eleve.nom} {l.copie.eleve.prenom}</td>
            <td>{l.copie.eleve.classe}</td>
            <td class="montant">{fmt(l.correction.points)} / {fmt(l.correction.max)}</td>
            <td class="montant"><b>{l.correction.note.toFixed(1)}</b></td>
            <td class="actions">
              <button class="btn-lien" onclick={() => (detail = detail === l.cle ? null : l.cle)}>
                {detail === l.cle ? 'Masquer' : 'Détail'}
              </button>
            </td>
          </tr>
          {#if detail === l.cle}
            <tr>
              <td colspan="5" class="detail">
                <table>
                  <tbody>
                    <tr>
                      <td colspan="4" class="options">
                        <label><input type="checkbox" bind:checked={voirJustes} /> Montrer aussi les écritures des opérations justes</label>
                      </td>
                    </tr>
                    {#each l.correction.operations as o}
                      <tr>
                        <td class="num" style="width:40px">{o.piece}</td>
                        <td>{texteOp(o.piece)}</td>
                        <td style="width:220px" class:faux={o.diagnostic !== 'juste'}>{LIBELLES_DIAGNOSTIC[o.diagnostic]}</td>
                        <td class="montant" style="width:80px">{fmt(o.points)} / {fmt(o.max)}</td>
                      </tr>
                      {#if voirJustes || o.diagnostic !== 'juste'}
                        {@const cmp = comparaisonOperation(exercice!, l.copie.dossier, o.piece)}
                        <tr class="comparaison">
                          <td></td>
                          <td colspan="3">
                            <div class="cote-a-cote">
                              <div>
                                <div class="etiquette">Écritures de l'élève</div>
                                {#each lisibles(cmp.eleve, l.copie) as t}<div class="ligne-ecr">{t}</div>{:else}<div class="discret">Aucune écriture.</div>{/each}
                              </div>
                              <div>
                                <div class="etiquette">Corrigé</div>
                                {#each lisibles(cmp.corrige, l.copie) as t}<div class="ligne-ecr">{t}</div>{/each}
                              </div>
                            </div>
                          </td>
                        </tr>
                      {/if}
                    {/each}
                  </tbody>
                </table>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </section>

  <section class="carte">
    <header class="tete-bilan">
      <h2>Bilan de la classe par opération</h2>
      <div class="segments" role="group" aria-label="Ordre des opérations">
        <button aria-pressed={ordre === 'reprendre'} onclick={() => (ordre = 'reprendre')}>À reprendre d'abord</button>
        <button aria-pressed={ordre === 'enonce'} onclick={() => (ordre = 'enonce')}>Ordre de l'énoncé</button>
      </div>
    </header>
    <p class="discret petit aide-bilan">
      Pour chaque erreur, ouvrez la liste des élèves concernés pour former des groupes de remédiation. La faute commune est
      l'écriture fausse saisie à l'identique par au moins deux élèves.
    </p>
    <table>
      <thead>
        <tr>
          <th style="width:50px">N°</th>
          <th>Opération</th>
          <th style="width:170px">Réussite</th>
          <th style="width:360px">Erreurs</th>
        </tr>
      </thead>
      <tbody>
        {#each stats as s, i (s.piece)}
          {@const pc = Math.round(taux(s) * 100)}
          <tr class:zebre={i % 2 === 1}>
            <td class="num">{s.piece}</td>
            <td>
              {texteOp(s.piece)}
              {#if s.fauteCommune && copieRef}
                <div class="faute-commune">
                  <b>Faute commune ({s.fauteCommune.eleves.length} élèves) :</b>
                  {#each lisibles(s.fauteCommune.lignes, copieRef) as t}<div class="ligne-ecr">{t}</div>{/each}
                </div>
              {/if}
            </td>
            <td>
              <div class="reussite"><span class="num">{s.reussites} / {s.total}</span> <span class="discret">({pc} %)</span></div>
              <span class="jauge" aria-hidden="true"><i class:faible={pc < 50} style:width={`${pc}%`}></i></span>
            </td>
            <td>
              {#if s.erreurs.length === 0}<span class="ok">Aucune erreur</span>{/if}
              {#each s.erreurs as e}
                <details class="erreur">
                  <summary>{LIBELLES_DIAGNOSTIC[e.diagnostic]} <span class="discret">({e.eleves.length})</span></summary>
                  <div class="eleves">{e.eleves.join(', ')}</div>
                </details>
              {/each}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}

<style>
  section { margin-bottom: 16px; }
  .barre { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
  .barre label { display: flex; flex-direction: column; gap: 4px; min-width: 360px; }
  .petit { font-size: 12px; }
  .aide { padding: 0 14px 12px; margin: 0; }
  .messages { margin-bottom: 16px; }
  .messages ul { margin: 0; padding-left: 18px; }
  .actions { text-align: right; }
  .detail { background: var(--c-fond-2); padding: 6px 14px 10px; }
  .detail td { background: none; }
  .faux { color: var(--c-alerte-texte); font-weight: bold; }
  .options { padding: 4px 0 8px; font-size: 12px; }
  .comparaison td { padding-top: 0; padding-bottom: 10px; }
  .cote-a-cote { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px; }
  .etiquette { font-weight: bold; color: var(--c-structure); margin-bottom: 2px; }
  .ligne-ecr { font-variant-numeric: tabular-nums; }
  .tete-bilan { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
  .aide-bilan { margin: 0; padding: 10px 18px 0; }
  .faute-commune { margin-top: 6px; padding: 6px 10px; border-left: 3px solid var(--c-accent); background: var(--c-alerte-fond); font-size: 12px; border-radius: 4px; }
  .reussite { margin-bottom: 4px; }
  .jauge { display: flex; height: 6px; border-radius: 3px; background: var(--c-bordure-3); overflow: hidden; }
  .jauge i { display: block; height: 100%; background: var(--c-ok); }
  .jauge i.faible { background: var(--c-accent); }
  .erreur summary { cursor: pointer; }
  .erreur + .erreur { margin-top: 3px; }
  .eleves { font-size: 12px; color: var(--c-texte-2); padding: 2px 0 4px 14px; }
</style>
