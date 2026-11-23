<!--
  Facturation et paiements (plan d'études CFC, 2e année : c5.ep3a, c5.ep5a). Trois onglets : établir une facture,
  payer des factures (ordre de paiement), contrôler les paiements des clients. En entraînement, chaque champ est
  contrôlé dès qu'il est rempli ; en évaluation, rien n'est affiché et les points comptent dans la note.
-->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import {
    calculFacture, champsControle, champsFacture, champsPaiement, controlerChamp, ficheFacturationVide,
    LIBELLES_SITUATION, MENTIONS_FACTURE, type ChampAttendu, type Situation,
  } from '../../engine/facturation';
  import { annee } from '../../engine/dates';
  import PieceVue from '../composants/PieceVue.svelte';
  import { dt, m } from '../format';

  const donnees = $derived(etat.exercice.parametres.facturation!);
  const entrainement = $derived(etat.retour);
  const ferme = $derived(etat.verrouille);
  const an = $derived(annee(etat.exercice.debut));

  const session = etat.session!;
  if (!session.fiches.facturation) session.fiches.facturation = ficheFacturationVide();
  const fiche = session.fiches.facturation;
  for (const f of etat.exercice.parametres.facturation?.factures ?? []) fiche.factures[f.numero] ??= {};
  for (const p of etat.exercice.parametres.facturation?.paiements ?? []) fiche.paiements[p.id] ??= {};

  type Onglet = 'factures' | 'paiements' | 'controle';
  let onglet = $state<Onglet>('factures');
  let numeroFacture = $state(etat.exercice.parametres.facturation?.factures[0]?.numero ?? '');
  let idPaiement = $state(etat.exercice.parametres.facturation?.paiements[0]?.id ?? '');

  const factureCourante = $derived(donnees.factures.find((f) => f.numero === numeroFacture) ?? null);
  const paiementCourant = $derived(donnees.paiements.find((p) => p.id === idPaiement) ?? null);

  function etatChamp(ch: ChampAttendu, saisies: Record<string, string>): 'juste' | 'faux' | null {
    if (!entrainement) return null;
    const r = controlerChamp(ch, saisies[ch.cle], an);
    return r === null ? null : r ? 'juste' : 'faux';
  }

  /** Avancement d'un document : champs remplis (et justes en entraînement). */
  function bilanDoc(champs: ChampAttendu[], saisies: Record<string, string>) {
    const remplis = champs.filter((c) => (saisies[c.cle] ?? '').trim() !== '').length;
    const justes = champs.filter((c) => controlerChamp(c, saisies[c.cle], an) === true).length;
    return { remplis, justes, total: champs.length };
  }
  const libelleBilan = (b: { remplis: number; justes: number; total: number }) =>
    entrainement ? `${b.justes} / ${b.total} justes` : `${b.remplis} / ${b.total} remplis`;

  // Mentions : cases à cocher enregistrées dans l'ordre de la liste, séparées par des virgules.
  function mentionCochee(saisies: Record<string, string>, id: string) {
    return (saisies.mentions ?? '').split(',').includes(id);
  }
  function basculerMention(saisies: Record<string, string>, id: string) {
    const actuelles = new Set((saisies.mentions ?? '').split(',').filter(Boolean));
    if (actuelles.has(id)) actuelles.delete(id);
    else actuelles.add(id);
    saisies.mentions = MENTIONS_FACTURE.map((x) => x.id).filter((x) => actuelles.has(x)).join(',');
  }

  const SITUATIONS = Object.keys(LIBELLES_SITUATION) as Situation[];
</script>

<div class="titre">
  <h1>Facturation</h1>
  <span class="sous">Factures, ordres de paiement et contrôle des paiements · montants en CHF</span>
</div>

<div class="segments onglets" role="group" aria-label="Partie de la facturation">
  <button aria-pressed={onglet === 'factures'} onclick={() => (onglet = 'factures')}>Établir une facture</button>
  <button aria-pressed={onglet === 'paiements'} onclick={() => (onglet = 'paiements')}>Payer des factures</button>
  {#if donnees.controle}
    <button aria-pressed={onglet === 'controle'} onclick={() => (onglet = 'controle')}>Contrôler les paiements</button>
  {/if}
</div>

{#if onglet === 'factures'}
  {#if donnees.factures.length > 1}
    <div class="choix-doc" role="group" aria-label="Facture à établir">
      {#each donnees.factures as f}
        {@const b = bilanDoc(champsFacture(f), fiche.factures[f.numero]!)}
        <button class="btn" aria-pressed={numeroFacture === f.numero} onclick={() => (numeroFacture = f.numero)}>
          {f.numero} · {f.client.nom} <span class="discret petit">{libelleBilan(b)}</span>
        </button>
      {/each}
    </div>
  {/if}
  {#if factureCourante}
    {@const f = factureCourante}
    {@const saisies = fiche.factures[f.numero]!}
    {@const champs = champsFacture(f)}
    {@const calc = calculFacture(f)}
    {@const chMentions = champs.find((c) => c.cle === 'mentions')!}
    {@const eM = (saisies.mentions ?? '') === '' ? null : etatChamp(chMentions, saisies)}
    <div class="deux">
      <article class="carte commande">
        <h2>Bon de commande</h2>
        <div class="corps-carte">
          <p><strong>{f.client.nom}</strong>{#each f.client.adresse ?? [] as l}<br />{l}{/each}</p>
          <table>
            <thead><tr><th>Article</th><th class="montant">Quantité</th><th class="montant">Prix catalogue HT</th></tr></thead>
            <tbody>
              {#each f.articles as a, i}
                <tr class:zebre={i % 2 === 1}><td>{a.designation}</td><td class="montant num">{a.quantite}</td><td class="montant num">{m(a.prixUnitaire)}</td></tr>
              {/each}
            </tbody>
          </table>
          <p class="note-patron"><b>Note de la direction :</b> {f.consigne} TVA {String(f.tauxTva / 10).replace('.', ',')} %.</p>
        </div>
      </article>

      <section class="carte">
        <h2>Votre facture n° {f.numero} du {dt(f.date)}</h2>
        <div class="corps-carte">
          <table class="formulaire">
            <tbody>
              {#each champs.filter((c) => c.cle !== 'mentions') as ch, i (ch.cle)}
                {@const e = etatChamp(ch, saisies)}
                {@const ligne = ch.cle.startsWith('l') ? f.articles[Number(ch.cle.slice(1))] : null}
                <tr class:zebre={i % 2 === 1}>
                  <td>
                    {ch.libelle}
                    {#if ligne}<span class="discret petit"> · {ligne.quantite} × {m(ligne.prixUnitaire)}</span>{/if}
                  </td>
                  <td class="saisie-cell">
                    <input
                      class="champ num"
                      class:montant={ch.type === 'chf'}
                      inputmode={ch.type === 'chf' ? 'decimal' : 'text'}
                      placeholder={ch.type === 'date' ? 'JJ.MM.AAAA' : '0.00'}
                      aria-label={ch.libelle}
                      disabled={ferme}
                      bind:value={saisies[ch.cle]}
                    />
                  </td>
                  {#if entrainement}<td class="controle" class:juste={e === 'juste'} class:faux={e === 'faux'}>{e === 'juste' ? 'Juste' : e === 'faux' ? 'À revoir' : ''}</td>{/if}
                </tr>
              {/each}
            </tbody>
          </table>
          {#if calc.aPayerAvecEscompte === null}<p class="discret petit">Pas d'escompte pour ce client.</p>{/if}

          <fieldset class="mentions">
            <legend>Quelles mentions une facture doit-elle obligatoirement contenir ? (loi sur la TVA)</legend>
            {#each MENTIONS_FACTURE as mention}
              <label><input type="checkbox" disabled={ferme} checked={mentionCochee(saisies, mention.id)} onchange={() => basculerMention(saisies, mention.id)} /> {mention.libelle}</label>
            {/each}
            {#if eM}<div class="controle-ligne" class:juste={eM === 'juste'} class:faux={eM === 'faux'}>{eM === 'juste' ? 'Juste' : 'À revoir'}</div>{/if}
          </fieldset>
        </div>
      </section>
    </div>
    <p class="discret note">Ensuite, comptabilisez la facture au journal (pièce du bon de commande).</p>
  {/if}
{:else if onglet === 'paiements'}
  <div class="choix-doc" role="group" aria-label="Facture à payer">
    {#each donnees.paiements as p}
      {@const b = bilanDoc(champsPaiement(p), fiche.paiements[p.id]!)}
      <button class="btn" aria-pressed={idPaiement === p.id} onclick={() => (idPaiement = p.id)}>
        {p.id} · {p.beneficiaire} <span class="discret petit">{libelleBilan(b)}</span>
      </button>
    {/each}
  </div>
  {#if paiementCourant}
    {@const p = paiementCourant}
    {@const saisies = fiche.paiements[p.id]!}
    <div class="deux">
      <div><PieceVue piece={p.piece} /></div>
      <section class="carte">
        <h2>Ordre de paiement (e-banking)</h2>
        <div class="corps-carte">
          <p class="consigne"><b>Consigne :</b> payez cette facture le {dt(p.datePaiement)}.</p>
          <table class="formulaire">
            <tbody>
              {#each champsPaiement(p) as ch, i (ch.cle)}
                {@const e = etatChamp(ch, saisies)}
                <tr class:zebre={i % 2 === 1}>
                  <td>{ch.libelle}</td>
                  <td class="saisie-cell">
                    {#if ch.cle === 'escompte'}
                      <select class="champ" aria-label={ch.libelle} disabled={ferme} bind:value={saisies[ch.cle]}>
                        <option value="">Choisir…</option>
                        <option value="oui">Oui, payé dans le délai d'escompte</option>
                        <option value="non">Non</option>
                      </select>
                    {:else}
                      <input
                        class="champ"
                        class:montant={ch.type === 'chf'}
                        class:large={ch.type === 'texte' || ch.type === 'compte'}
                        inputmode={ch.type === 'chf' ? 'decimal' : 'text'}
                        placeholder={ch.type === 'date' ? 'JJ.MM.AAAA' : ch.type === 'chf' ? '0.00' : ''}
                        aria-label={ch.libelle}
                        disabled={ferme}
                        bind:value={saisies[ch.cle]}
                      />
                    {/if}
                  </td>
                  {#if entrainement}<td class="controle" class:juste={e === 'juste'} class:faux={e === 'faux'}>{e === 'juste' ? 'Juste' : e === 'faux' ? 'À revoir' : ''}</td>{/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    <p class="discret note">Ensuite, comptabilisez le paiement au journal (pièce « Ordre de paiement exécuté »).</p>
  {/if}
{:else if onglet === 'controle' && donnees.controle}
  {@const c = donnees.controle}
  {@const champs = champsControle(c)}
  {@const parCle = new Map(champs.map((x) => [x.cle, x]))}
  <p class="consigne">
    <b>Consigne :</b> nous sommes le {dt(c.date)}. Rapprochez le relevé bancaire des factures ouvertes, puis indiquez la
    situation de chaque facture et le montant qui reste à encaisser.
  </p>
  <section class="carte">
    <h2>Relevé bancaire : crédits</h2>
    <table>
      <thead><tr><th style="width:110px">Date</th><th>Donneur d'ordre</th><th class="montant">Montant</th><th style="width:200px">Facture payée</th>{#if entrainement}<th style="width:90px">Contrôle</th>{/if}</tr></thead>
      <tbody>
        {#each c.credits as cr, i (cr.id)}
          {@const ch = parCle.get(`c:${cr.id}`)!}
          {@const e = etatChamp(ch, fiche.controle)}
          <tr class:zebre={i % 2 === 1}>
            <td>{dt(cr.date)}</td><td>{cr.donneur}</td><td class="montant num">{m(cr.montant)}</td>
            <td>
              <select class="champ" aria-label={`Facture payée par ${cr.donneur}`} disabled={ferme} bind:value={fiche.controle[ch.cle]}>
                <option value="">Choisir…</option>
                {#each c.factures as f}<option value={f.numero}>{f.numero} · {f.client}</option>{/each}
              </select>
            </td>
            {#if entrainement}<td class="controle" class:juste={e === 'juste'} class:faux={e === 'faux'}>{e === 'juste' ? 'Juste' : e === 'faux' ? 'À revoir' : ''}</td>{/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
  <section class="carte">
    <h2>Factures ouvertes au {dt(c.date)}</h2>
    <table>
      <thead>
        <tr>
          <th>N°</th><th>Client</th><th>Date</th><th>Conditions</th><th class="montant">Montant</th>
          <th style="width:270px">Situation</th><th class="montant" style="width:150px">Reste à encaisser</th>
          {#if entrainement}<th style="width:90px">Contrôle</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each c.factures as f, i (f.numero)}
          {@const chS = parCle.get(`s:${f.numero}`)!}
          {@const chR = parCle.get(`r:${f.numero}`)!}
          {@const eS = etatChamp(chS, fiche.controle)}
          {@const eR = etatChamp(chR, fiche.controle)}
          {@const e = eS === null && eR === null ? null : eS === 'faux' || eR === 'faux' ? 'faux' : eS === 'juste' && eR === 'juste' ? 'juste' : null}
          <tr class:zebre={i % 2 === 1}>
            <td class="nowrap">{f.numero}</td><td>{f.client}</td><td class="nowrap">{dt(f.date)}</td>
            <td>{f.delaiNet} jours net{f.escompte ? `, ${f.escompte.taux / 10} % à ${f.escompte.jours} jours` : ''}</td>
            <td class="montant num">{m(f.total)}</td>
            <td>
              <select class="champ" aria-label={`Situation de la facture ${f.numero}`} disabled={ferme} bind:value={fiche.controle[chS.cle]}>
                <option value="">Choisir…</option>
                {#each SITUATIONS as s}<option value={s}>{LIBELLES_SITUATION[s]}</option>{/each}
              </select>
            </td>
            <td><input class="champ montant num" inputmode="decimal" placeholder="0.00" aria-label={`Reste à encaisser, facture ${f.numero}`} disabled={ferme} bind:value={fiche.controle[chR.cle]} /></td>
            {#if entrainement}<td class="controle" class:juste={e === 'juste'} class:faux={e === 'faux'}>{e === 'juste' ? 'Juste' : e === 'faux' ? 'À revoir' : ''}</td>{/if}
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="corps-carte">
      <label class="mesure">
        Mesure proposée à la direction (non corrigée)
        <textarea rows="3" disabled={ferme} bind:value={fiche.controle.mesure} placeholder="Par exemple : rappeler les conditions d'escompte, relancer les clients en retard…"></textarea>
      </label>
    </div>
  </section>
  <p class="discret note">Ensuite, comptabilisez chaque encaissement au journal, d'après les avis de crédit.</p>
{/if}

<style>
  .onglets { margin-bottom: 14px; }
  .choix-doc { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .choix-doc .btn[aria-pressed='true'] { background: var(--c-selection); border-color: var(--c-structure); color: var(--c-structure); font-weight: bold; }
  .deux { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 16px; align-items: start; }
  @media (max-width: 1100px) { .deux { grid-template-columns: 1fr; } }
  section, article { margin-bottom: 14px; }
  .note-patron { margin-top: 10px; padding: 8px 10px; background: var(--c-zebra); border-left: 4px solid var(--c-structure); }
  .formulaire td { vertical-align: middle; }
  .saisie-cell { width: 180px; }
  .saisie-cell .champ { width: 170px; }
  .saisie-cell .champ.large { width: 300px; }
  .saisie-cell select.champ { width: 260px; }
  td .champ.montant { text-align: right; }
  .controle { width: 90px; }
  .juste { color: var(--c-ok); font-weight: bold; }
  .faux { color: var(--c-alerte-texte); font-weight: bold; }
  .mentions { margin-top: 14px; border: 1px solid var(--c-bordure-2); border-radius: 6px; padding: 8px 12px 10px; display: grid; gap: 4px; }
  .mentions legend { font-weight: bold; padding: 0 4px; }
  .mentions label { display: flex; gap: 8px; align-items: center; }
  .controle-ligne { margin-top: 4px; }
  .consigne { margin: 0 0 12px; }
  .mesure { display: flex; flex-direction: column; gap: 6px; font-weight: bold; }
  .mesure textarea { font: inherit; font-weight: normal; padding: 6px 8px; border: 1px solid var(--c-bordure); border-radius: 6px; }
  .note { margin-top: 4px; }
  .petit { font-size: 12px; }
  .nowrap { white-space: nowrap; }
</style>
