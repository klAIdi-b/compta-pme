<!-- Marge brute d'une entreprise commerciale : l'élève calcule CAB, CAN, PRAMA, PRAMV et la marge brute d'après ses comptes. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { margeBrute } from '../../engine/fiches-cfc';
  import FicheCalcul, { type SectionCalcul } from '../composants/FicheCalcul.svelte';

  const r = $derived(margeBrute(etat.dossier));
  const entrainement = $derived(etat.retour);
  const session = etat.session!;
  if (!session.fiches.margeBrute) session.fiches.margeBrute = {};
  const saisies = session.fiches.margeBrute;

  const sections = $derived<SectionCalcul[]>([
    {
      titre: 'Ventes',
      lignes: [
        { cle: 'cab', libelle: "CAB, chiffre d'affaires brut", formule: 'ventes de marchandises', type: 'chf', attendu: r.cab },
        {
          cle: 'can',
          libelle: "CAN, chiffre d'affaires net",
          formule: 'ventes + prestations propres − déductions accordées − frais de ventes − pertes sur créances',
          type: 'chf',
          attendu: r.can,
          fort: true,
        },
      ],
    },
    {
      titre: 'Achats',
      lignes: [
        { cle: 'prama', libelle: "PRAMA, prix de revient d'achat des marchandises achetées", formule: "achats + frais d'achats − déductions obtenues", type: 'chf', attendu: r.prama },
        {
          cle: 'prmv',
          libelle: "PRAMV, prix de revient d'achat des marchandises vendues",
          formule: 'PRAMA + diminution de stock, ou − augmentation de stock',
          type: 'chf',
          attendu: r.prmv,
          fort: true,
        },
      ],
    },
    {
      titre: 'Marge brute',
      lignes: [
        { cle: 'mb', libelle: 'Marge brute (bénéfice brut)', formule: 'CAN − PRAMV', type: 'chf', attendu: r.margeBrute, fort: true },
        { cle: 'taux', libelle: 'Taux de marge brute', formule: 'marge brute ÷ CAN × 100', type: 'pc', attendu: Number.isFinite(r.tauxMargeBrute) ? r.tauxMargeBrute : null },
      ],
    },
  ]);
</script>

<div class="titre">
  <h1>Marge brute</h1>
  <span class="sous">1er degré du compte de résultat d'une entreprise commerciale, montants en CHF</span>
</div>

<FicheCalcul {sections} {saisies} {entrainement} />

<p class="discret note">
  Les montants se calculent d'après les comptes actuels de votre dossier : passez d'abord toutes les opérations, y
  compris la variation de stock, et faites la fiche avant les écritures de bouclement.
</p>

<style>
  .note { margin-top: 4px; max-width: 80ch; }
</style>
