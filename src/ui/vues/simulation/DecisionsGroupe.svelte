<!-- Simulateur : décisions d'un groupe pour le tour en cours (écran 3 de la maquette validée le 21.11.2026). -->
<script lang="ts">
  // Même écran pour l'enseignant (décisions dictées, à son poste) et pour le groupe (situation reçue par fichier ou en
  // ligne) : il ne dépend que de la « situation » du groupe (src/engine/simulation/situation.ts).
  import { capacite, detailSorties, estCfc2, estMp, exerciceComplet, fondsPropresMp, libellePeriode, moisDuTour, prixAchat, prixVehiculeTtc } from '../../../engine/simulation/tour';
  import { controlerDecisionsSituation, type SituationGroupe } from '../../../engine/simulation/situation';
  import { PARAMETRES_CFC2, PARAMETRES_MP } from '../../../engine/simulation/types';
  import type { ChoixFournisseur, Decisions } from '../../../engine/simulation/types';
  import { formatMontant } from '../../../engine/money';
  import ChampMontant from '../../composants/ChampMontant.svelte';
  import { libelleImprevu, pourMille } from './libelles';

  let {
    situation,
    onValider,
    onRetirer,
    onRetour,
    libelleRetour = 'Retour au tableau de la partie',
    libelleValider = 'Valider les décisions',
  }: {
    situation: SituationGroupe;
    onValider: (d: Decisions) => void;
    onRetirer?: () => void;
    onRetour?: () => void;
    libelleRetour?: string;
    libelleValider?: string;
  } = $props();

  // L'écran est recréé pour chaque situation ({#key}) : la valeur initiale suffit.
  // svelte-ignore state_referenced_locally
  const sit = situation;
  const r = sit.reglages;
  const s = r.secteur;
  const x = sit.entreprise;
  const n = sit.numeroTour;
  const mois = moisDuTour(r, n);
  const etat = sit.etat;
  const imprevus = sit.imprevus;
  const imp = sit.effetImprevus;
  const precedent = sit.precedent;
  const periode = libellePeriode(r, n);
  const afp = r.niveau === 'AFP';
  const cfc2 = estCfc2(r);
  const mp = estMp(r);
  const dernierTour = n === r.nbTours && r.cloture && exerciceComplet(r);
  const saison = Math.round(mois.reduce((t, m) => t + s.saison[m - 1]!, 0) / mois.length);

  // Décisions déjà validées, sinon celles du tour précédent, sinon des valeurs de départ neutres.
  const depart: Decisions = sit.decisionsValidees ?? precedent?.decisions ?? {
    prixVente: s.prixVenteReference,
    quantiteAchetee: 0,
    publicite: 0,
    fournisseur: 'grossiste',
    prelevementPrive: 0,
  };
  let prix = $state<number | null>(depart.prixVente);
  let quantite = $state<number>(sit.decisionsValidees ? depart.quantiteAchetee : 0);
  let publicite = $state<number | null>(depart.publicite || null);
  let fournisseur = $state<ChoixFournisseur>(depart.fournisseur);
  let prelevement = $state<number | null>(depart.prelevementPrive || null);
  let employes = $state<number>(depart.employes ?? etat.employes);
  let vehicule = $state<boolean>(!!sit.decisionsValidees?.acheterVehicule);
  let emprunt = $state<number | null>(sit.decisionsValidees?.emprunt || null);
  let dividende = $state<number>(depart.dividendePourcent ?? 0);
  let tente = $state(false);

  const decisions = $derived<Decisions>({
    prixVente: prix ?? 0,
    quantiteAchetee: Number.isFinite(quantite) ? Math.trunc(quantite) : -1,
    publicite: publicite ?? 0,
    fournisseur,
    prelevementPrive: afp || mp ? 0 : (prelevement ?? 0),
    ...(cfc2 ? { employes: Number.isFinite(employes) ? Math.trunc(employes) : -1, acheterVehicule: vehicule && !etat.vehicule } : {}),
    ...(mp ? { emprunt: emprunt ?? 0, dividendePourcent: dernierTour ? (Number.isFinite(dividende) ? Math.trunc(dividende) : -1) : 0 } : {}),
  });
  const capaciteTour = $derived(cfc2 ? capacite(r, Math.max(0, decisions.employes ?? 0), !!etat.vehicule || vehicule, mois.length) : null);
  const erreurs = $derived(controlerDecisionsSituation(sit, decisions));
  const sorties = $derived(detailSorties(r, etat, decisions, n, imp));
  const part = $derived(sorties.disponible > 0 ? Math.min(100, Math.round((sorties.total * 100) / sorties.disponible)) : 100);

  function valider(ev: SubmitEvent) {
    ev.preventDefault();
    tente = true;
    if (erreurs.length) return;
    onValider($state.snapshot(decisions) as Decisions);
  }
</script>

<form class="decisions" onsubmit={valider}>
  <div class="titre">
    <div>
      <h1>{x.nom}</h1>
      <div class="sous">Tour {n} sur {r.nbTours} · {periode} · {s.nom}</div>
    </div>
    {#if onRetour}<button type="button" class="btn-lien" onclick={onRetour}>{libelleRetour}</button>{/if}
  </div>

  {#if precedent}
    <div class="info">
      <b>Le tour précédent ({libellePeriode(r, precedent.numero)}) :</b> vous avez vendu <b>{precedent.vendues} {precedent.vendues > 1 ? s.produits : s.produit}</b>
      sur {precedent.demande} clients attirés{#if precedent.clientsPerdus > 0}&#32;; <b>{precedent.clientsPerdus} client{precedent.clientsPerdus > 1 ? 's sont repartis' : ' est reparti'}</b> faute de {cfc2 ? 'stock ou de personnel' : 'stock'}{/if}.
      Prix moyen du marché : {formatMontant(precedent.prixMoyen)}. Part de marché : {pourMille(precedent.partMarchePourMille)}. Résultat : <b class="num">{formatMontant(precedent.resultat)}</b>.
    </div>
  {/if}

  {#if imprevus.length}
    <div class="alerte" role="status">
      <b>Imprévu{imprevus.length > 1 ? 's' : ''} de ce tour :</b>
      {#each imprevus as i, k}{k ? ' ; ' : ' '}{libelleImprevu(i, [x], s)}{/each}.
    </div>
  {/if}

  <div class="deux-col">
    <section class="carte">
      <h2>Votre situation au début du tour</h2>
      <div class="corps-carte">
        <table class="situation">
          <tbody>
            <tr><td>Avoir en banque</td><td class="montant"><b>{formatMontant(etat.banque)}</b></td></tr>
            <tr><td>Caisse</td><td class="montant">{formatMontant(etat.caisse)}</td></tr>
            <tr><td>Factures clients à encaisser</td><td class="montant">{formatMontant(etat.creancesClients)}</td></tr>
            <tr><td>Facture du grossiste à payer</td><td class="montant">{formatMontant(etat.dettesFournisseurs)}</td></tr>
            <tr><td>Stock</td><td class="montant">{etat.stockUnites} {etat.stockUnites > 1 ? s.produits : s.produit}</td></tr>
            {#if cfc2}
              <tr><td>Employés</td><td class="montant">{etat.employes}</td></tr>
              <tr><td>Véhicule de livraison</td><td class="montant">{etat.vehicule ? 'oui' : 'non'}</td></tr>
              {#if (mois[0]! - 1) % 3 === 0 && etat.aPayer.avs + etat.aPayer.lpp + etat.aPayer.alfa + etat.aPayer.tva !== 0}
                <tr><td>TVA et cotisations à payer</td><td class="montant">{formatMontant(etat.aPayer.avs + etat.aPayer.lpp + etat.aPayer.alfa + etat.aPayer.tva)}</td></tr>
              {/if}
            {/if}
            {#if mp}
              <tr><td>Emprunt bancaire</td><td class="montant">{formatMontant(etat.emprunt)}</td></tr>
            {/if}
            <tr><td>Résultat depuis le début</td><td class="montant">{formatMontant(etat.resultatCumule)}</td></tr>
          </tbody>
        </table>
        <p class="aide">
          Saison : {saison} % d'un mois moyen. Loyer du {r.dureeTour === 'mois' ? 'mois' : 'trimestre'} : {formatMontant(s.loyerMensuel * mois.length)}.
        </p>
      </div>
    </section>

    <section class="carte">
      <h2>Vos décisions pour {periode}</h2>
      <div class="corps-carte grille">
        <div class="champ-bloc">
          <label class="lib" for="prix">Prix de vente d'un {s.produit} (CHF)</label>
          <ChampMontant id="prix" libelle="Prix de vente" bind:valeur={prix} />
          <span class="aide">Prix de référence du marché : {formatMontant(s.prixVenteReference)}{cfc2 ? `, TVA ${(s.tauxTva / 10).toFixed(1).replace('.', ',')} % comprise` : ''}</span>
        </div>
        <div class="champ-bloc">
          <label class="lib" for="quantite">{s.produits.charAt(0).toUpperCase() + s.produits.slice(1)} à commander</label>
          <input id="quantite" class="champ num" type="number" min="0" step="1" bind:value={quantite} />
          <span class="aide">Livrés au début du tour, avant les ventes.</span>
        </div>
        {#if !afp}
          <div class="champ-bloc plein">
            <span class="lib" id="lib-four">Fournisseur</span>
            <div class="choix" role="radiogroup" aria-labelledby="lib-four">
              {#each ['grossiste', 'importateur'] as const as c}
                {@const f = s.fournisseurs[c]}
                <label class="option" class:on={fournisseur === c}>
                  <span class="ligne"><input type="radio" name="fournisseur" value={c} bind:group={fournisseur} /> <b>{f.nom}</b></span>
                  <span class="aide">
                    {formatMontant(prixAchat(s, c, mois[0]!, imp.hausseAchatPourcent))} l'unité{cfc2 ? ' HT' : ''}{f.ecartPrixPourcent ? ` (${f.ecartPrixPourcent} %)` : ''} ·
                    {f.aCredit ? 'payable au début du tour suivant' : 'payable à la commande'}
                  </span>
                </label>
              {/each}
            </div>
          </div>
        {:else}
          <p class="aide plein">Fournisseur : {s.fournisseurs.grossiste.nom}, {formatMontant(prixAchat(s, 'grossiste', mois[0]!, imp.hausseAchatPourcent))} l'unité, payable au tour suivant.</p>
        {/if}
        {#if cfc2}
          <div class="champ-bloc">
            <label class="lib" for="employes">Employés (sans le propriétaire)</label>
            <input id="employes" class="champ num" type="number" min="0" max={PARAMETRES_CFC2.employesMax} step="1" bind:value={employes} />
            <span class="aide">
              Salaire brut {formatMontant(s.salaireBrutMensuel)} par mois et par employé. Capacité du tour : {capaciteTour} clients
              ({s.capaciteParPersonneMensuelle} par personne et par mois{etat.vehicule || vehicule ? ', +25 % avec le véhicule' : ''}).
            </span>
          </div>
          <div class="champ-bloc">
            <span class="lib">Véhicule de livraison</span>
            {#if etat.vehicule}
              <span class="aide">Déjà acheté : il augmente la capacité de 25 %.</span>
            {:else}
              <label class="ligne"><input type="checkbox" bind:checked={vehicule} /> Acheter {s.vehicule.designation.toLocaleLowerCase('fr-CH')}</label>
              <span class="aide">{formatMontant(prixVehiculeTtc(s))} TVA comprise, payé à la livraison ; +25 % de capacité.</span>
            {/if}
          </div>
        {/if}
        <div class="champ-bloc">
          <label class="lib" for="pub">Budget de publicité (CHF)</label>
          <ChampMontant id="pub" libelle="Budget de publicité" bind:valeur={publicite} />
          <span class="aide">Chaque franc rapporte un peu moins que le précédent.</span>
        </div>
        {#if mp}
          <div class="champ-bloc">
            <label class="lib" for="emprunt">Nouvel emprunt bancaire (CHF)</label>
            <ChampMontant id="emprunt" libelle="Nouvel emprunt bancaire" bind:valeur={emprunt} />
            <span class="aide">
              Versé au début du tour. Intérêts {PARAMETRES_MP.tauxInteretAnnuelPourcent} % par an, payés à la fin de chaque trimestre ;
              pas de remboursement pendant l'année. Maximum {formatMontant(PARAMETRES_MP.empruntMax)} au total.
            </span>
          </div>
          {#if dernierTour}
            <div class="champ-bloc">
              <label class="lib" for="dividende">Dividende proposé (% du capital-actions)</label>
              <input id="dividende" class="champ num" type="number" min="0" max={PARAMETRES_MP.dividendeMaxPourcent} step="1" bind:value={dividende} />
              <span class="aide">
                Capital-actions {formatMontant(fondsPropresMp(s).capital)}. Proposition à l'assemblée générale : les élèves établiront la
                répartition du bénéfice (réserve légale, dividende, impôt anticipé).
              </span>
            </div>
          {/if}
        {/if}
        {#if !afp && !mp}
          <div class="champ-bloc">
            <label class="lib" for="prive">Prélèvement privé du propriétaire (CHF)</label>
            <ChampMontant id="prive" libelle="Prélèvement privé" bind:valeur={prelevement} />
            <span class="aide">Viré sur le compte personnel du propriétaire.</span>
          </div>
        {/if}
        <div class="plein">
          <div class="ligne entre"><b>Paiements prévus</b><span class="num"><b>{formatMontant(sorties.total)}</b> sur {formatMontant(sorties.disponible)} disponibles</span></div>
          <div class="jauge" class:depasse={sorties.total > sorties.disponible}><span style="width:{part}%"></span></div>
          <div class="aide">
            {sorties.lignes.map((l) => `${l.libelle.toLocaleLowerCase('fr-CH')} ${formatMontant(l.montant)}`).join(' · ') || 'Aucun paiement prévu.'}
            {#if sorties.commandeReportee > 0}&#32;La commande ({formatMontant(sorties.commandeReportee)}) sera payée au tour suivant.{/if}
          </div>
        </div>
        {#if tente && erreurs.length}
          <div class="alerte plein" role="alert"><ul>{#each erreurs as m}<li>{m}</li>{/each}</ul></div>
        {/if}
        <div class="plein fin">
          {#if sit.decisionsValidees && onRetirer}<button type="button" class="btn-lien" onclick={onRetirer}>Retirer ces décisions</button>{/if}
          <button type="submit" class="btn btn-principal">{libelleValider}</button>
        </div>
      </div>
    </section>
  </div>
</form>

<style>
  .decisions { display: grid; gap: 18px; }
  .decisions .titre { margin-bottom: 0; }
  .deux-col { display: grid; grid-template-columns: 340px 1fr; gap: 18px; align-items: start; }
  .situation td { padding: 7px 0; background: none; }
  .situation tr:hover td { background: none; }
  .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 22px; }
  .plein { grid-column: 1 / -1; }
  .champ-bloc { display: grid; gap: 6px; align-content: start; }
  .lib { font-size: var(--t-12); font-weight: bold; color: var(--c-texte-2); }
  .aide { font-size: var(--t-12); color: var(--c-texte-2); margin: 0; }
  .corps-carte > .aide { margin-top: 12px; }
  .choix { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .option { border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); padding: 12px 14px; display: grid; gap: 4px; cursor: pointer; }
  .option.on { border-color: var(--c-structure); box-shadow: 0 0 0 3px rgba(31, 78, 120, 0.12); }
  .ligne { display: flex; align-items: center; gap: 8px; }
  .entre { justify-content: space-between; flex-wrap: wrap; }
  .jauge { height: 12px; border-radius: var(--r-2); background: var(--c-bordure-3); overflow: hidden; margin: 8px 0 6px; }
  .jauge span { display: block; height: 100%; background: var(--c-structure); }
  .jauge.depasse span { background: var(--c-accent); }
  .fin { display: flex; justify-content: flex-end; align-items: center; gap: 16px; }
  @media (max-width: 900px) { .deux-col, .grille, .choix { grid-template-columns: 1fr; } }
</style>
