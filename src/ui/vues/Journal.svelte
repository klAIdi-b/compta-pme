<script lang="ts">
  import { tick } from 'svelte';
  import { etat } from '../etat.svelte';
  import { vueEleve } from '../modes';
  import { comptesDisponibles } from '../../engine/dossier';
  import { ajouterEcriture, estExtournee, extourner, modifierEcriture, nouvelId, supprimerEcriture } from '../../engine/journal';
  import { diagnostiquer, ecrituresRetenues, enregistrerTentative, solutionDisponible, INDICES, type Diagnostic } from '../../engine/correction';
  import { erreurTypique } from '../../engine/erreurs-typiques';
  import { SOMMAIRE } from '../../data/theorie-index';
  import type { Dossier, Ecriture } from '../../engine/dossier';
  import { bouclementCorrige, corrigeBouclement, diagnostiquerBouclement, PIECE_BOUCLEMENT } from '../../engine/correction-bouclement';
  import { operationsSaisies } from '../../engine/exercice';
  import { annee, lireDate } from '../../engine/dates';
  import type { Centimes } from '../../engine/money';
  import { m, dt } from '../format';
  import ChampCompte from '../composants/ChampCompte.svelte';
  import ChampMontant from '../composants/ChampMontant.svelte';
  import PieceVue from '../composants/PieceVue.svelte';
  import { chapitrePourComptes } from '../../data/theorie-index';
  import { comptesDeLEtape, etapesBouclement, etapesSaisies } from '../../engine/guide-bouclement';

  type LigneSaisie = { cle: number; debit: string | null; credit: string | null; montant: Centimes | null };

  let compteur = 0;
  const nouvelleLigne = (): LigneSaisie => ({ cle: ++compteur, debit: null, credit: null, montant: null });

  const d = $derived(etat.dossier);
  const ex = $derived(etat.exercice);
  const comptes = $derived(comptesDisponibles(d));
  const intitules = $derived(new Map(d.plan.map((c) => [c.numero, c.intitule])));
  const saisies = $derived(operationsSaisies(d));
  const operations = $derived(d.debut === ex.debut ? ex.operations : []);

  // ---- Retour gradué (entraînement) ----
  const corrigeParPiece = $derived(new Map((ex.corrige ?? []).map((c) => [c.piece, c])));
  const avecBouclement = $derived(bouclementCorrige(ex));
  const retour = $derived(
    etat.retour &&
      vueEleve(etat.genre) &&
      (corrigeParPiece.size > 0 || avecBouclement) &&
      operations.length > 0,
  );
  /** Pièces passées par le logiciel (simulateur, comptabilité mixte) : ni corrigées ni modifiables. */
  const nbValidees = $derived(d.ecritures.filter((e) => !e.automatique).length);
  const piecesAutomatiques = $derived(new Set((ex.ecrituresAutomatiques ?? []).map((a) => a.piece)));
  /** Clé de suivi : le numéro d'opération, ou « Bouclement » pour les écritures de bouclement. */
  function cle(piece: string): string {
    return avecBouclement && !operations.some((o) => o.numero === piece) && !piecesAutomatiques.has(piece) ? PIECE_BOUCLEMENT : piece;
  }
  function solutionDe(k: string) {
    return k === PIECE_BOUCLEMENT ? corrigeBouclement(d, ex) : corrigeParPiece.get(k);
  }
  /** Modification d'une écriture validée : toujours possible pour l'élève (choix de l'enseignant le 18.11.2026). */
  const modifAutorisee = $derived(vueEleve(etat.genre) && !etat.verrouille);
  /** Une écriture liée à une extourne ne se modifie pas (le moteur le refuse). */
  const modifiable = (e: Ecriture) => modifAutorisee && !e.automatique && !e.extourneDe && !estExtournee(d, e.id);
  const suivi = $derived(etat.session!.suivi);

  // ---- Accompagnement des écritures de bouclement (B1, B2…) ----
  const etapes = $derived(
    ex.parametres.modeBouclement === 'compteDeResultat' && !ex.parametres.bouclementAutomatique ? etapesBouclement(d.formeJuridique) : [],
  );
  const etapeCourante = $derived(etapes.find((e) => e.piece === piece.trim().toUpperCase()));
  const etapesFaites = $derived(etapesSaisies(d));
  /** Aides seulement en entraînement, comme le retour gradué. */
  const aidesPermises = $derived(ex.mode === 'entrainement' && vueEleve(etat.genre));
  /** Évaluation formative terminée : la solution de chaque opération fausse est consultable sans nouvel essai. */
  const solutionsOuvertes = $derived(etat.verrouille);
  const niveauAide = $derived(etapeCourante ? (suivi[PIECE_BOUCLEMENT]?.aides?.[etapeCourante.piece] ?? 0) : 0);
  function demanderAide(niveau: number) {
    if (!etapeCourante) return;
    const ancien = suivi[PIECE_BOUCLEMENT] ?? { essais: 0, solutionVue: false, dernier: 'manquante' as Diagnostic };
    const aides = { ...(ancien.aides ?? {}), [etapeCourante.piece]: Math.max(niveau, ancien.aides?.[etapeCourante.piece] ?? 0) };
    etat.majSuivi({ ...suivi, [PIECE_BOUCLEMENT]: { ...ancien, aides } });
  }

  function evaluer(dossier: Dossier, piece: string, compter: boolean) {
    if (!retour) return;
    const p = cle(piece);
    let diag: Diagnostic | null;
    if (p === PIECE_BOUCLEMENT) diag = diagnostiquerBouclement(dossier, ex);
    else {
      const c = corrigeParPiece.get(p);
      diag = c ? diagnostiquer(dossier.ecritures, c) : null;
    }
    if (!diag) return;
    if (compter) etat.majSuivi(enregistrerTentative(suivi, p, diag));
    else {
      const ancien = suivi[p] ?? { essais: 0, solutionVue: false, dernier: diag };
      etat.majSuivi({ ...suivi, [p]: { ...ancien, dernier: diag } });
    }
  }

  function statut(p: string): Diagnostic | null {
    return retour ? (suivi[p]?.dernier ?? null) : null;
  }

  const libelleStatut = (x: Diagnostic | null) =>
    x === 'juste' ? 'Juste' : x === 'incomplete' ? 'Incomplète' : x && x !== 'manquante' ? 'À revoir' : '';
  const classeStatut = (x: Diagnostic | null) =>
    x === 'juste' ? 'juste' : x === 'incomplete' ? 'neutre' : x && x !== 'manquante' ? 'revoir' : '';

  /** Chapitre de théorie lié à une opération, d'après les comptes de son corrigé. */
  /** Raccourcis clavier : affichés d'emblée tant qu'aucune écriture n'est validée, puis repliés. */
  let aideClavierOuverte = $state(etat.dossier.ecritures.filter((e) => !e.automatique).length === 0);

  function chapitreDe(k: string) {
    const c = solutionDe(k);
    if (!c) return null;
    const comptes = c.lignes.flatMap((l) => [l.debit, l.credit]).filter((x): x is string => !!x);
    return chapitrePourComptes(comptes, ex.niveau);
  }
  /** Erreur typique reconnue pour une opération (explication et chapitre à revoir), hors bouclement. */
  function erreurTypiqueDe(k: string) {
    if (k === PIECE_BOUCLEMENT) return null;
    const c = solutionDe(k);
    if (!c) return null;
    const lignes = ecrituresRetenues(d.ecritures).filter((e) => cle(e.piece) === k).flatMap((e) => e.lignes);
    const r = erreurTypique(lignes, c.lignes);
    const ch = r ? SOMMAIRE.find((x) => x.id === r.chapitre) : undefined;
    return r && ch ? { ...r, titre: ch.titre } : null;
  }
  function revoirTheorie(id: string) {
    etat.chapitreCible = id;
    etat.aller('theorie');
  }

  function voirSolution(p: string) {
    const ancien = suivi[p];
    if (ancien) etat.majSuivi({ ...suivi, [p]: { ...ancien, solutionVue: true } });
  }

  let editionId = $state<string | null>(null);
  let voirPiece = $state(true);

  function prochaineOperation() {
    return operations.find((o) => !saisies.has(o.numero));
  }

  const op0 = prochaineOperation();
  let date = $state(op0 ? dt(op0.date) : '');
  let piece = $state(op0?.numero ?? '');
  let libelle = $state('');
  let lignes = $state<LigneSaisie[]>([nouvelleLigne()]);
  let erreurs = $state<string[]>([]);
  let grille: HTMLElement | undefined = $state();

  const utiles = $derived(lignes.filter((l) => l.debit || l.credit || l.montant !== null));
  const totalDebit = $derived(utiles.reduce((s, l) => s + (l.debit ? (l.montant ?? 0) : 0), 0));
  const totalCredit = $derived(utiles.reduce((s, l) => s + (l.credit ? (l.montant ?? 0) : 0), 0));
  const ecart = $derived(totalDebit - totalCredit);
  const incomplete = $derived(utiles.some((l) => (!l.debit && !l.credit) || l.montant === null));
  const equilibree = $derived(utiles.length > 0 && !incomplete && ecart === 0 && totalDebit > 0);
  const operationCourante = $derived(operations.find((o) => o.numero === piece.trim()));

  // Ouverture depuis le récapitulatif de l'avancement : sélectionne l'opération demandée.
  $effect(() => {
    const cible = etat.pieceCiblee;
    if (cible) {
      etat.pieceCiblee = null;
      choisirOperation(cible);
    }
  });

  function choisirOperation(numero: string) {
    const o = operations.find((x) => x.numero === numero);
    if (!o) {
      // Écritures de bouclement (B1, B2…) : pièce proposée, datée de la fin de l'exercice.
      if (/^B\d+$/.test(numero)) {
        piece = numero;
        date = dt(d.fin);
        erreurs = [];
        tick().then(() => document.getElementById('saisie-libelle')?.focus());
      }
      return;
    }
    // Opération déjà saisie : son écriture revient dans la grille pour être modifiée.
    const existante = derniereParPiece.get(cle(o.numero));
    const e = existante ? d.ecritures.find((x) => x.id === existante) : undefined;
    if (e && modifiable(e)) {
      modifier(e);
      return;
    }
    piece = o.numero;
    date = dt(o.date);
    erreurs = [];
    tick().then(() => document.getElementById('saisie-libelle')?.focus());
  }

  function reinitialiser() {
    editionId = null;
    // Pendant le bouclement, la grille propose l'étape suivante (B2 après B1…).
    const etape = etapeCourante;
    const suivante = etape ? etapes.slice(etapes.indexOf(etape) + 1).find((e) => !etapesFaites.has(e.piece)) : undefined;
    const o = suivante ? undefined : prochaineOperation();
    piece = suivante?.piece ?? o?.numero ?? '';
    date = suivante ? dt(d.fin) : o ? dt(o.date) : date;
    libelle = '';
    lignes = [nouvelleLigne()];
    erreurs = [];
  }

  async function valider() {
    const iso = lireDate(date, annee(d.debut));
    if (!iso) {
      erreurs = ['Indiquez une date valide au format JJ.MM.AAAA.'];
      return;
    }
    const p = piece.trim();
    const contenu = {
      date: iso,
      piece: p,
      libelle: libelle.trim(),
      lignes: utiles.map((l) => ({ debit: l.debit, credit: l.credit, montant: l.montant ?? 0 })),
    };
    const ancienne = editionId ? d.ecritures.find((e) => e.id === editionId) : undefined;
    const r = editionId ? modifierEcriture(d, editionId, contenu) : ajouterEcriture(d, { id: nouvelId(d), ...contenu });
    if (!r.ok) {
      erreurs = r.erreurs;
      return;
    }
    etat.majDossier(r.valeur);
    if (ancienne && ancienne.piece !== p) evaluer(r.valeur, ancienne.piece, false);
    evaluer(r.valeur, p, true);
    // Les écritures attendues du bouclement dépendent des comptes : on met son état à jour.
    if (cle(p) !== PIECE_BOUCLEMENT && etat.session!.suivi[PIECE_BOUCLEMENT]) evaluer(etat.dossier, PIECE_BOUCLEMENT, false);
    reinitialiser();
    await tick();
    document.getElementById('saisie-libelle')?.focus();
  }

  function champs(): HTMLElement[] {
    return grille ? [...grille.querySelectorAll<HTMLElement>('[data-champ]')] : [];
  }

  async function touche(e: KeyboardEvent) {
    const cible = e.target as HTMLElement;
    const tr = cible.closest<HTMLElement>('[data-ligne]');
    const i = tr ? Number(tr.dataset.ligne) : -1;
    if (e.key === 'Enter' && !e.defaultPrevented) {
      e.preventDefault();
      if (equilibree) return valider();
      const l = lignes[i];
      const ligneComplete = l && (l.debit || l.credit) && l.montant !== null;
      if (ligneComplete && i === lignes.length - 1) {
        lignes.push(nouvelleLigne());
        await tick();
        document.getElementById(`debit-${lignes[lignes.length - 1]!.cle}`)?.focus();
      } else {
        const tous = champs();
        tous[tous.indexOf(cible) + 1]?.focus();
      }
    } else if (e.key === 'Escape' && !e.defaultPrevented && i >= 0) {
      e.preventDefault();
      retirerLigne(i);
    }
  }

  /** Nouvelle ligne pour une écriture composée ; le curseur va dans son compte au débit. */
  async function ajouterLigne() {
    lignes.push(nouvelleLigne());
    await tick();
    document.getElementById(`debit-${lignes[lignes.length - 1]!.cle}`)?.focus();
  }

  function retirerLigne(i: number) {
    if (lignes.length > 1) lignes.splice(i, 1);
    else lignes = [nouvelleLigne()];
  }

  function demanderExtourne(id: string) {
    const e = d.ecritures.find((x) => x.id === id);
    if (!e) return;
    const ok = confirm(
      `Extourner la pièce ${e.piece} « ${e.libelle} » ?\n\nUne écriture inverse sera ajoutée au journal. L'écriture d'origine reste visible.`,
    );
    if (!ok) return;
    const r = extourner(d, id, e.date);
    if (!r.ok) return alert(r.erreurs.join('\n'));
    etat.majDossier(r.valeur);
    evaluer(r.valeur, e.piece, false);
  }

  /** Suppression d'une écriture (et de son extourne éventuelle) ; les tentatives déjà comptées restent comptées. */
  function demanderSuppression(id: string) {
    const e = d.ecritures.find((x) => x.id === id);
    if (!e) return;
    const avecExtourne = !e.extourneDe && estExtournee(d, id);
    const ok = confirm(
      `Supprimer ${e.extourneDe ? "l'extourne de " : ''}la pièce ${e.piece} « ${e.libelle} » ?` +
        (avecExtourne ? '\n\nSon extourne sera supprimée aussi.' : '') +
        '\n\nVous pourrez ensuite saisir à nouveau l\'opération.',
    );
    if (!ok) return;
    const r = supprimerEcriture(d, id);
    if (!r.ok) return alert(r.erreurs.join('\n'));
    if (editionId === id) reinitialiser();
    etat.majDossier(r.valeur);
    evaluer(r.valeur, e.piece, false);
    // La grille propose aussitôt la pièce supprimée, pour la saisir à nouveau (si l'élève n'a rien commencé).
    if (!e.extourneDe && utiles.length === 0 && !libelle.trim()) {
      piece = e.piece;
      date = dt(e.date);
      tick().then(() => document.getElementById('saisie-libelle')?.focus());
    }
  }

  async function modifier(e: Ecriture) {
    editionId = e.id;
    date = dt(e.date);
    piece = e.piece;
    libelle = e.libelle;
    lignes = e.lignes.map((l) => ({ cle: ++compteur, debit: l.debit, credit: l.credit, montant: l.montant }));
    erreurs = [];
    await tick();
    document.querySelector('.saisie')?.scrollIntoView({ block: 'nearest' });
    document.getElementById('saisie-libelle')?.focus();
  }

  const derniereParPiece = $derived.by(() => {
    const r = new Map<string, string>();
    for (const e of ecrituresTriees) if (!e.extourneDe && !estExtournee(d, e.id)) r.set(cle(e.piece), e.id);
    return r;
  });

  const nomCompte = (n: string | null) => (n ? `${intitules.get(n) ?? ''} (${n})` : '');

  const ecrituresTriees = $derived(
    d.ecritures.map((e, i) => ({ e, i })).sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i)).map((x) => x.e),
  );

  /** Largeur d'un plateau de la balance, en pour cent du plus grand total. */
  function partBalance(x: Centimes): number {
    const max = Math.max(totalDebit, totalCredit);
    return max > 0 ? (x / max) * 100 : 0;
  }

  function ecartTexte(x: Centimes) {
    return x > 0 ? `il manque ${m(x)} au crédit` : `il manque ${m(-x)} au débit`;
  }
</script>

<div class="titre">
  <h1>Journal</h1>
  <span class="sous">
    {nbValidees} écriture{nbValidees > 1 ? 's' : ''} validée{nbValidees > 1 ? 's' : ''}
    {#if operations.length}· {saisies.size} opération{saisies.size > 1 ? 's' : ''} sur {operations.length} saisie{saisies.size > 1 ? 's' : ''}{/if}
  </span>
</div>

<div class="mise-en-page">
  <div class="colonne-principale">
    {#if etat.verrouille}
      <section class="carte formative-fin" aria-label="Évaluation formative terminée">
        <h2>Évaluation formative terminée</h2>
        <p class="corps-carte">
          La saisie est fermée. Chaque opération indique ci-dessous si elle est juste ou à revoir ; pour une opération à
          revoir, « Voir la solution » affiche l'écriture attendue. Votre note indicative figure sur le tableau de bord.
        </p>
      </section>
    {:else}
    <section class="carte saisie" aria-label="Nouvelle écriture" data-visite="saisie">
      <h2>{editionId ? `Modification de la pièce ${piece}` : 'Nouvelle écriture'}</h2>
      {#if etapeCourante}
        {@const rang = etapes.indexOf(etapeCourante) + 1}
        <div class="operation-courante etape-bouclement">
          <div><b>Bouclement, étape {rang} sur {etapes.length} ({etapeCourante.piece}).</b> {etapeCourante.consigne}</div>
          <details class="sens-b">
            <summary>À quoi sert cette écriture ?</summary>
            <p>{etapeCourante.but}</p>
          </details>
          <ol class="etapes-b" aria-label="Étapes du bouclement : cliquez pour passer à une étape">
            {#each etapes as e (e.piece)}
              <li>
                <button
                  type="button"
                  class:faite={etapesFaites.has(e.piece)}
                  class:active={e === etapeCourante}
                  aria-current={e === etapeCourante ? 'step' : undefined}
                  onclick={() => choisirOperation(e.piece)}
                >
                  <span class="coche" aria-hidden="true">{etapesFaites.has(e.piece) ? '✓' : ''}</span>{e.piece} {e.titre}{#if etapesFaites.has(e.piece)}<span class="sr-only"> (saisie)</span>{/if}
                </button>
              </li>
            {/each}
          </ol>
          {#if aidesPermises}
            {#if niveauAide >= 1}
              <div class="aide-b"><b>La règle :</b> {etapeCourante.regle}</div>
            {/if}
            {#if niveauAide >= 2}
              {@const comptesB = comptesDeLEtape(d, etapeCourante.piece)}
              <div class="aide-b">
                {#if comptesB.length}
                  <b>Comptes concernés :</b> {comptesB.map((c) => c.intitule).join(', ')}.
                  Les montants se trouvent dans vos comptes.
                  <button class="btn-lien" onclick={() => etat.aller('balance')}>Voir les soldes dans la balance</button>
                {:else}
                  <b>Comptes concernés :</b> aucun compte de charges ou de produits n'a de solde pour l'instant. Saisissez
                  d'abord les opérations de l'énoncé.
                {/if}
              </div>
            {/if}
            {#if niveauAide === 0}
              <button class="btn-lien aide-lien" onclick={() => demanderAide(1)}>Besoin d'aide ?</button>
            {:else if niveauAide === 1}
              <button class="btn-lien aide-lien" onclick={() => demanderAide(2)}>Quels comptes sont concernés ?</button>
            {/if}
          {/if}
        </div>
      {:else if operationCourante}
        <div class="operation-courante">
          <b>{operationCourante.piece ? 'Pièce' : 'Opération'} {operationCourante.numero}.</b> {operationCourante.texte}
          {#if operationCourante.piece}
            <button class="btn-lien bascule-piece" onclick={() => (voirPiece = !voirPiece)}>
              {voirPiece ? 'Masquer la pièce' : 'Afficher la pièce'}
            </button>
          {/if}
        </div>
      {/if}
      <div class="plan-saisie" class:avec-piece={!!(operationCourante?.piece && voirPiece)}>
      {#if operationCourante?.piece && voirPiece}
        <!-- Zone qui défile : atteignable au clavier (règle WCAG scrollable-region-focusable). -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div class="zone-piece" tabindex="0" role="region" aria-label="Pièce comptable"><PieceVue piece={operationCourante.piece} /></div>
      {/if}
      <div class="grille-saisie">
      <table>
        <thead>
          <tr>
            <th class="c-date">Date</th>
            <th class="c-piece">Pièce</th>
            <th>Libellé</th>
            <th class="c-compte">Compte au débit</th>
            <th class="c-compte">Compte au crédit</th>
            <th class="montant c-montant">Montant CHF</th>
            <th style="width:30px"><span class="sr-only">Retirer</span></th>
          </tr>
        </thead>
        <!-- Les touches proviennent des champs de saisie et remontent jusqu'ici (délégation). -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <tbody bind:this={grille} onkeydown={touche}>
          {#each lignes as l, i (l.cle)}
            <tr data-ligne={i}>
              {#if i === 0}
                <td data-etiquette="Date"><input id="saisie-date" class="champ num" aria-label="Date" placeholder="JJ.MM.AAAA" autocomplete="off" data-champ bind:value={date} /></td>
                <td data-etiquette="Pièce"><input id="saisie-piece" class="champ num" aria-label="Pièce" autocomplete="off" data-champ bind:value={piece} /></td>
                <td data-etiquette="Libellé" class="t-libelle"><input id="saisie-libelle" class="champ" aria-label="Libellé" autocomplete="off" data-champ bind:value={libelle} /></td>
              {:else}
                <td></td><td></td><td></td>
              {/if}
              <td data-etiquette="Compte au débit" class="t-compte"><ChampCompte id={`debit-${l.cle}`} libelle={`Compte au débit, ligne ${i + 1}`} {comptes} bind:valeur={l.debit} /></td>
              <td data-etiquette="Compte au crédit" class="t-compte"><ChampCompte id={`credit-${l.cle}`} libelle={`Compte au crédit, ligne ${i + 1}`} {comptes} bind:valeur={l.credit} aligne="droite" /></td>
              <td data-etiquette="Montant CHF" class="t-montant"><ChampMontant id={`montant-${l.cle}`} libelle={`Montant, ligne ${i + 1}`} bind:valeur={l.montant} /></td>
              <td>
                {#if lignes.length > 1}
                  <button class="retirer" title="Retirer la ligne" aria-label={`Retirer la ligne ${i + 1}`} onclick={() => retirerLigne(i)}>×</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="ajout-ligne">
        <button type="button" class="btn-ajout" onclick={ajouterLigne}><span aria-hidden="true">+</span> Ajouter une ligne</button>
        <span class="discret">Écriture composée : une ligne par compte, au débit ou au crédit.</span>
      </div>

      <div class="equilibre" data-visite="equilibre">
        <!-- Balance débit / crédit : les deux plateaux se rejoignent quand l'écriture est équilibrée. -->
        <div class="plateaux">
          <div class="plateau">
            <span class="lib-plateau">Total au débit</span>
            <b class="num somme">{m(totalDebit)}</b>
            <span class="jauge" aria-hidden="true"><i style:width={`${partBalance(totalDebit)}%`}></i></span>
          </div>
          <div class="etat-equilibre" aria-live="polite">
            {#if utiles.length && ecart !== 0}
              <div class="ecart">Écriture non équilibrée : {ecartTexte(ecart)}.{#if lignes.length === 1} Ajoutez une ligne pour une écriture composée.{/if}</div>
            {:else if equilibree}
              <span class="ok equilibree">Écriture équilibrée</span>
            {/if}
          </div>
          <div class="plateau credit">
            <span class="lib-plateau">Total au crédit</span>
            <b class="num somme">{m(totalCredit)}</b>
            <span class="jauge" aria-hidden="true"><i style:width={`${partBalance(totalCredit)}%`}></i></span>
          </div>
        </div>
        <div class="boutons">
          <button class="btn" onclick={reinitialiser}>Annuler</button>
          <button class="btn btn-principal" disabled={!equilibree} onclick={valider}>{editionId ? 'Enregistrer la modification' : "Valider l'écriture"}</button>
        </div>
      </div>
      {#if erreurs.length}
        <div class="alerte erreurs" role="alert">
          <b>L'écriture n'a pas été validée :</b>
          <ul>{#each erreurs as e}<li>{e}</li>{/each}</ul>
        </div>
      {/if}
      <details class="aide-clavier" bind:open={aideClavierOuverte}>
        <summary>Raccourcis clavier</summary>
        <kbd>Tab</kbd> champ suivant · <kbd>Entrée</kbd> ligne suivante, puis validation quand l'écriture est équilibrée ·
        <kbd>Échap</kbd> retire la ligne · compte : cliquez dans le champ ou tapez une partie du nom, puis <kbd>Tab</kbd> ou <kbd>Entrée</kbd> choisit le compte en surbrillance
      </details>
      </div>
      </div>
    </section>
    {/if}

    <section class="carte" style="margin-top:20px" aria-label="Écritures validées">
      <h2>Écritures validées</h2>
      {#if d.ecritures.length === 0}
        <p class="vide">
          Aucune écriture pour l'instant.
          {#if operations[0]}Commencez par saisir l'opération {operations[0].numero}.{/if}
        </p>
      {:else}
        <div class="defilement"><table class="journal">
          <thead>
            <tr>
              <th class="j-date">Date</th>
              <th class="j-piece">Pièce</th>
              <th class="j-libelle">Libellé</th>
              <th class="j-compte">Débit</th>
              <th class="j-compte">Crédit</th>
              <th class="montant j-montant">Montant</th>
              {#if retour}<th class="j-correction">Correction</th>{/if}
              <th class="j-actions"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {#each ecrituresTriees as e, k (e.id)}
              {@const extournee = estExtournee(d, e.id)}
              {#each e.lignes as l, j}
                <tr
                  class:zebre={k % 2 === 1}
                  class:annulee={extournee || !!e.extourneDe}
                  class:modifiable={modifiable(e)}
                  title={modifiable(e) ? 'Double-cliquez pour modifier cette écriture' : undefined}
                  ondblclick={() => modifiable(e) && modifier(e)}
                >
                  {#if j === 0}
                    <td class="num">{dt(e.date)}</td>
                    <td class="num">{e.piece}</td>
                    <td>
                      <span class:barre={extournee}>{e.libelle}</span>
                      {#if extournee}<span class="mention">extournée</span>{/if}
                      {#if e.automatique}<span class="mention" title="Écriture passée par le logiciel : elle n'est ni corrigée ni modifiable.">automatique</span>{/if}
                    </td>
                  {:else}
                    <td></td><td></td><td></td>
                  {/if}
                  <td>{#if l.debit}{intitules.get(l.debit)}<span class="int num">{l.debit}</span>{/if}</td>
                  <td>{#if l.credit}{intitules.get(l.credit)}<span class="int num">{l.credit}</span>{/if}</td>
                  <td class="montant">{m(l.montant)}</td>
                  {#if retour}
                    <td>
                      {#if j === 0 && !extournee && !e.extourneDe && !e.automatique}
                        <span class={`statut ${classeStatut(statut(cle(e.piece)))}`}>{libelleStatut(statut(cle(e.piece)))}</span>
                      {/if}
                    </td>
                  {/if}
                  <td class="actions">
                    {#if j === 0}
                      {#if !etat.verrouille && !e.automatique}
                      <div class="boutons-ecriture">
                        {#if !extournee && !e.extourneDe}
                          {#if modifAutorisee}<button class="action-ecr" aria-label={`Modifier la pièce ${e.piece}`} onclick={() => modifier(e)}>Modifier</button>{/if}
                          <button class="action-ecr" onclick={() => demanderExtourne(e.id)}>Extourner</button>
                        {/if}
                        <button class="action-ecr supprimer" aria-label={`Supprimer la pièce ${e.piece}${e.extourneDe ? ' (extourne)' : ''}`} onclick={() => demanderSuppression(e.id)}>Supprimer</button>
                      </div>
                      {/if}
                    {/if}
                  </td>
                </tr>
              {/each}
              {@const kc = cle(e.piece)}
              {@const st = statut(kc)}
              {#if retour && derniereParPiece.get(kc) === e.id && st && st !== 'juste' && st !== 'manquante'}
                {@const s = suivi[kc]}
                {@const solution = s?.solutionVue ? solutionDe(kc) : null}
                {@const typique = st === 'compte' || st === 'compte_classe' || st === 'erronee' ? erreurTypiqueDe(kc) : null}
                <tr class="ligne-retour" class:zebre={k % 2 === 1}>
                  <td></td><td></td>
                  <td colspan="6">
                    {#if st === 'incomplete'}
                      <div class="retour neutre">{INDICES.incomplete}</div>
                    {:else}
                      <div class="retour">
                        <b>Indice :</b> {INDICES[st]}
                        {kc === PIECE_BOUCLEMENT ? '(Écritures de bouclement prises ensemble.) ' : ''}
                        {modifAutorisee
                          ? "Modifiez l'écriture (bouton Modifier ou double-clic sur la ligne), ou supprimez-la."
                          : "Supprimez l'écriture (ou extournez-la), puis saisissez à nouveau l'opération."}
                        {#if (solutionsOuvertes || solutionDisponible(s)) && !s?.solutionVue}
                          <button class="btn-lien solution" onclick={() => voirSolution(kc)}>Voir la solution</button>
                        {/if}
                        {#if !typique}
                          {#each [chapitreDe(kc)].filter((x) => x !== null) as ch (ch.id)}
                            <button class="btn-lien solution" onclick={() => revoirTheorie(ch.id)}>Revoir la théorie : {ch.titre}</button>
                          {/each}
                        {/if}
                      </div>
                      {#if typique}
                        <div class="retour pourquoi">
                          <b>Pourquoi ?</b> {typique.explication}
                          <button class="btn-lien solution" onclick={() => revoirTheorie(typique.chapitre)}>Revoir la théorie : {typique.titre}</button>
                        </div>
                      {/if}
                      {#if solution}
                        <div class="solution-detail">
                          <b>{kc === PIECE_BOUCLEMENT ? 'Écritures de bouclement attendues, d\'après vos comptes :' : `Solution de l'opération ${kc} :`}</b>
                          <table>
                            <tbody>
                              {#each solution.lignes as l}
                                <tr>
                                  <td>{l.debit ? 'Débit ' + nomCompte(l.debit) : ''}</td>
                                  <td>{l.credit ? 'Crédit ' + nomCompte(l.credit) : ''}</td>
                                  <td class="montant">{m(l.montant)}</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      {/if}
                    {/if}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table></div>
      {/if}
    </section>
  </div>

  <aside class="carte enonce" aria-label="Énoncé" data-visite="enonce">
    <h2>Énoncé · opérations</h2>
    {#if operations.length === 0}
      <p class="vide">Aucune opération dans l'énoncé pour cet exercice.</p>
    {:else}
      <ol>
        {#each operations as o}
          <li class:courante={o.numero === piece.trim()}>
            <button onclick={() => choisirOperation(o.numero)}>
              <span class="no">{o.numero}</span>
              <span class="texte">{o.texte}</span>
              {#if retour && statut(o.numero) && statut(o.numero) !== 'manquante'}
                <span class={`etat statut ${classeStatut(statut(o.numero))}`}>{libelleStatut(statut(o.numero))}</span>
              {:else if saisies.has(o.numero)}<span class="etat">Saisie</span>{/if}
            </button>
          </li>
        {/each}
        {#if retour && avecBouclement}
          <li class="bouclement">
            <span class="no"></span>
            <span class="texte">Écritures de bouclement</span>
            {#if statut(PIECE_BOUCLEMENT) && statut(PIECE_BOUCLEMENT) !== 'manquante'}
              <span class={`etat statut ${classeStatut(statut(PIECE_BOUCLEMENT))}`}>{libelleStatut(statut(PIECE_BOUCLEMENT))}</span>
            {/if}
          </li>
        {/if}
      </ol>
    {/if}
  </aside>
</div>

<style>
  .mise-en-page { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 16px; align-items: start; }
  .colonne-principale { min-width: 0; }
  .saisie td { padding: 5px 6px; border-bottom: none; }
  .saisie tbody tr:hover td { background: none; }
  .operation-courante { padding: 12px 18px; background: #f3f8fd; border-bottom: 1px solid var(--c-bordure-3); line-height: 1.45; }
  .bascule-piece { margin-left: 10px; font-size: 13px; }
  .etapes-b { list-style: none; margin: 8px 0 0; padding: 0; display: flex; gap: 8px; flex-wrap: wrap; font-size: 13px; }
  .etapes-b button {
    font: inherit; cursor: pointer; padding: 3px 10px; border-radius: 999px; background: #fff;
    border: 1px solid var(--c-bordure-2); color: var(--c-texte-2);
  }
  .etapes-b button:hover { border-color: var(--c-structure); color: var(--c-structure); }
  .etapes-b button.active { border-color: var(--c-structure); color: var(--c-structure); font-weight: bold; }
  .etapes-b button.faite { background: var(--c-ok-fond); border-color: transparent; color: var(--c-ok); }
  .sens-b { margin-top: 6px; font-size: 14px; }
  .sens-b summary { cursor: pointer; color: var(--c-structure); font-weight: bold; font-size: 13.5px; }
  .sens-b p { margin: 6px 0 0; padding: 8px 12px; background: #fff; border-left: 3px solid var(--c-accent); border-radius: 4px; }
  .coche { display: inline-block; min-width: 0; margin-right: 4px; }
  .coche:empty { margin-right: 0; }
  .aide-b { margin-top: 8px; padding: 8px 12px; background: #fff; border-left: 3px solid var(--c-structure); border-radius: 4px; font-size: 14px; }
  .aide-lien { display: inline-block; margin-top: 8px; font-size: 13.5px; font-weight: bold; }
  .zone-piece { padding: 14px 18px; background: var(--c-fond-2); border-bottom: 1px solid var(--c-bordure-3); max-height: 420px; overflow-y: auto; }
  .grille-saisie { min-width: 0; }
  .ajout-ligne { display: flex; align-items: center; gap: 14px; padding: 2px 14px 12px; flex-wrap: wrap; font-size: 13px; }
  .btn-ajout {
    font: inherit; font-weight: bold; font-size: 13.5px; color: var(--c-structure); background: #fff; cursor: pointer;
    border: 1px dashed var(--c-structure); border-radius: 6px; padding: 6px 12px;
  }
  .btn-ajout:hover { background: var(--c-survol); border-style: solid; }
  /* Grand écran : la pièce justificative à côté de la grille de saisie. */
  @media (min-width: 1600px) {
    .plan-saisie.avec-piece { display: grid; grid-template-columns: minmax(0, 1fr) 380px; }
    .plan-saisie.avec-piece .zone-piece { order: 2; max-height: 560px; border-bottom: 0; border-left: 1px solid var(--c-bordure-3); }
  }
  .retirer {
    border: none; background: none; color: var(--c-texte-2); font-size: 18px; line-height: 1; cursor: pointer; padding: 6px 4px;
  }
  .retirer:hover { color: var(--c-negatif); }
  .saisie { box-shadow: var(--ombre-relief); border-radius: 10px; }
  .equilibre {
    display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
    padding: 14px 18px; border-top: 1px solid var(--c-bordure-3);
  }
  .plateaux { flex: 1; min-width: 320px; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 14px; }
  .plateau { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .plateau.credit { align-items: flex-end; text-align: right; }
  .lib-plateau { font-size: 13px; color: var(--c-texte-2); }
  .somme { font-size: 19px; color: var(--c-texte); }
  .jauge { display: flex; width: 100%; height: 6px; border-radius: 3px; background: var(--c-bordure-3); overflow: hidden; }
  .credit .jauge { justify-content: flex-end; }
  .jauge i { display: block; height: 100%; border-radius: 3px; background: var(--c-structure); transition: width 0.2s ease; }
  .etat-equilibre { text-align: center; max-width: 260px; }
  .equilibree { display: inline-block; padding: 6px 12px; border-radius: 8px; background: var(--c-ok-fond); }
  .ecart { border-left: 4px solid var(--c-accent); padding: 5px 10px; color: var(--c-alerte-texte); font-weight: bold; background: var(--c-alerte-fond); border-radius: 6px; }
  .boutons { display: flex; gap: 8px; flex: none; }
  .erreurs { margin: 0 14px 10px; }
  .aide-clavier { font-size: 12px; color: var(--c-texte-2); padding: 0 18px 12px; }

  .journal { font-size: 13px; table-layout: fixed; }
  .journal td { padding: 8px 8px; overflow: hidden; }
  .journal th { padding: 9px 8px; }
  .int { display: block; color: var(--c-texte-2); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .actions { text-align: right; white-space: nowrap; }
  /* Actions d'une écriture : petits boutons empilés, toujours visibles dans une colonne étroite. */
  .boutons-ecriture { display: flex; flex-direction: column; gap: 4px; align-items: stretch; }
  .action-ecr {
    font: inherit; font-size: 12.5px; font-weight: bold; padding: 4px 8px; border-radius: 6px; cursor: pointer;
    background: #fff; color: var(--c-structure); border: 1px solid var(--c-bordure); text-align: center;
  }
  .action-ecr:hover { background: var(--c-survol); border-color: var(--c-structure); }
  .action-ecr.supprimer { color: var(--c-negatif); border-color: #e9c3c9; }
  tr.modifiable { cursor: pointer; }
  .formative-fin { border-left: 4px solid var(--c-ok); }
  .formative-fin p { margin: 0; }
  .action-ecr.supprimer:hover { background: #fdf2f4; border-color: var(--c-negatif); }
  /* Écran étroit : le tableau défile plutôt que de couper les colonnes. */
  .defilement { overflow-x: auto; }
  .defilement .journal { min-width: 720px; }
  .j-date { width: 90px; }
  .j-piece { width: 52px; }
  .j-compte { width: 170px; }
  .j-montant { width: 96px; }
  .j-correction { width: 86px; }
  .j-actions { width: 112px; }
  /* Tablette et petit écran : colonnes resserrées pour laisser de la place au libellé. */
  @media (max-width: 1280px) {
    .j-date { width: 82px; }
    .j-piece { width: 44px; }
    .j-compte { width: 130px; }
    .j-montant { width: 84px; }
    .j-correction { width: 78px; }
    .j-actions { width: 100px; }
    .journal td, .journal th { padding-left: 6px; padding-right: 6px; }
  }
  tr.annulee td { color: #7a8591; }
  .barre { text-decoration: line-through; }
  .statut { font-size: 12px; font-weight: bold; white-space: nowrap; display: inline-block; padding: 2px 9px; border-radius: 999px; }
  .statut.juste { color: var(--c-ok); background: var(--c-ok-fond); }
  .statut.revoir { color: var(--c-alerte-texte); background: var(--c-alerte-fond); }
  .statut.neutre { color: var(--c-texte-2); background: #eef2f6; }
  tr.ligne-retour td { padding-top: 0; }
  .retour { padding: 7px 12px; background: var(--c-alerte-fond); border-left: 4px solid var(--c-accent); font-size: 13px; border-radius: 6px; }
  .retour.neutre { background: var(--c-fond-2); border-left-color: var(--c-bordure); color: var(--c-texte-2); }
  .retour.pourquoi { margin-top: 6px; background: var(--c-fond); border-left-color: var(--c-structure); }
  .solution { margin-left: 8px; font-weight: bold; }
  .solution-detail { margin-top: 6px; padding: 6px 10px; border-left: 4px solid var(--c-structure); background: var(--c-selection); font-size: 13px; }
  .solution-detail table { margin-top: 4px; width: auto; }
  .solution-detail td { border: none; padding: 2px 14px 2px 0; background: none !important; }
  .mention { font-size: 12px; color: var(--c-texte-2); font-style: italic; margin-left: 4px; }

  .enonce ol { margin: 0; padding: 0; list-style: none; max-height: calc(100vh - 170px); max-height: calc(100dvh - 170px); overflow-y: auto; }
  .enonce li { border-bottom: 1px solid var(--c-bordure-2); }
  .enonce li button {
    display: grid; grid-template-columns: 26px 1fr; gap: 2px 4px; width: 100%; text-align: left;
    font: inherit; color: inherit; background: none; border: none; padding: 9px 14px; cursor: pointer;
  }
  .enonce li button:hover { background: var(--c-zebra); }
  .enonce li.courante button { background: var(--c-selection); }
  .no { font-weight: bold; color: var(--c-structure); }
  .enonce li.bouclement { display: grid; grid-template-columns: 26px 1fr; gap: 2px 4px; padding: 9px 14px; font-style: italic; }
  .etat { grid-column: 2; font-size: 12px; color: var(--c-texte-2); }

  .c-date { width: 104px; }
  .c-piece { width: 56px; }
  .c-compte { width: 210px; }
  .c-montant { width: 118px; }

  @media (max-width: 1440px) {
    .mise-en-page { grid-template-columns: 1fr; }
    .enonce ol { max-height: none; }
  }
  /* Tablette en paysage et petits écrans : comptes et montant plus étroits pour laisser de la place au libellé. */
  @media (max-width: 1180px) {
    .c-date { width: 90px; }
    .c-piece { width: 44px; }
    .c-compte { width: 150px; }
    .c-montant { width: 92px; }
  }
  .aide-clavier summary { cursor: pointer; color: var(--c-structure); font-weight: 600; font-size: 13px; margin-bottom: 4px; }
  .aide-clavier:not([open]) { padding-bottom: 2px; }
  /* Téléphone et tablette en portrait : la grille de saisie s'empile, chaque champ porte son étiquette ; les tableaux défilent. */
  @media (max-width: 820px) {
    .grille-saisie thead { display: none; }
    .grille-saisie table, .grille-saisie tbody { display: block; }
    .grille-saisie tr { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 10px; padding: 12px 18px; border-bottom: 1px solid var(--c-bordure-3); }
    .grille-saisie td { display: block; padding: 0; border: 0; width: auto; }
    .grille-saisie td:empty { display: none; }
    .grille-saisie td[data-etiquette]::before { content: attr(data-etiquette); display: block; font-size: 12px; font-weight: 600; color: var(--c-texte-2); margin-bottom: 4px; }
    .grille-saisie td.t-libelle, .grille-saisie td.t-compte { grid-column: 1 / -1; }
    .defilement { overflow-x: auto; }
    .plateaux { min-width: 0; width: 100%; }
  }
</style>
