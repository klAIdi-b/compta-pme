<!-- Échelle des prix : du prix d'achat brut au prix de vente brut, d'après les données de l'énoncé. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { echelle } from '../../engine/fiches-cfc';
  import { formatMontant as m } from '../../engine/money';
  import FicheCalcul, { type SectionCalcul } from '../composants/FicheCalcul.svelte';

  const x = $derived(etat.exercice.parametres.echellePrix!);
  const e = $derived(echelle(x));
  const entrainement = $derived(etat.retour);
  const session = etat.session!;
  if (!session.fiches.echelle) session.fiches.echelle = {};
  const saisies = session.fiches.echelle;
  const p = (n: number) => `${String(n).replace('.', ',')} %`;

  const sections = $derived<SectionCalcul[]>([
    {
      titre: "Du prix d'achat brut au prix de revient d'achat",
      lignes: [
        { cle: 'pac', libelle: "PAC, prix d'achat à crédit", formule: 'PAB − rabais obtenu', type: 'chf', attendu: e.pac },
        { cle: 'pan', libelle: "PAN, prix d'achat net", formule: 'PAC − escompte obtenu', type: 'chf', attendu: e.pan },
        { cle: 'pra', libelle: "PRA, prix de revient d'achat", formule: "PAN + frais d'achat", type: 'chf', attendu: e.pra, fort: true },
      ],
    },
    {
      titre: "Du prix de revient d'achat au prix de vente net",
      lignes: [
        { cle: 'pr', libelle: 'PR, prix de revient', formule: 'PRA + frais généraux', type: 'chf', attendu: e.pr },
        { cle: 'pvn', libelle: 'PVN, prix de vente net', formule: 'PR + bénéfice net', type: 'chf', attendu: e.pvn, fort: true },
        { cle: 'bb', libelle: 'Bénéfice brut', formule: 'PVN − PRA', type: 'chf', attendu: e.beneficeBrut },
      ],
    },
    {
      titre: 'Du prix de vente net au prix de vente brut',
      lignes: [
        { cle: 'pvc', libelle: 'PVC, prix de vente à crédit', formule: "PVN ÷ (100 − taux d'escompte) × 100", type: 'chf', attendu: e.pvc },
        { cle: 'pvb', libelle: 'PVB, prix de vente brut (affiché)', formule: 'PVC ÷ (100 − taux de rabais) × 100', type: 'chf', attendu: e.pvb, fort: true },
      ],
    },
    {
      titre: 'Nombres clés',
      lignes: [
        { cle: 'clePanPvn', libelle: 'Nombre clé du PAN au PVN', formule: 'PVN ÷ PAN (4 décimales)', type: 'nombre', attendu: e.nombreClePanPvn },
        { cle: 'clePabPvb', libelle: 'Nombre clé du PAB au PVB', formule: 'PVB ÷ PAB (4 décimales)', type: 'nombre', attendu: e.nombreClePabPvb },
      ],
    },
  ]);
</script>

<div class="titre">
  <h1>Échelle des prix</h1>
  <span class="sous">{x.article ? `Calcul du prix de vente pour ${x.article}` : 'Du prix d\'achat brut au prix de vente brut'}</span>
</div>

<section class="carte donnees">
  <h2>Données</h2>
  <table>
    <tbody>
      <tr><td>Prix d'achat brut (PAB)</td><td class="montant">{m(x.pab)}</td></tr>
      <tr class="zebre"><td>Rabais obtenu du fournisseur, en % du PAB</td><td class="montant">{p(x.rabaisObtenu)}</td></tr>
      <tr><td>Escompte obtenu, en % du PAC</td><td class="montant">{p(x.escompteObtenu)}</td></tr>
      <tr class="zebre"><td>Frais d'achat{x.fraisAchat.type === 'pc' ? ', en % du PAN' : ''}</td><td class="montant">{x.fraisAchat.type === 'chf' ? m(x.fraisAchat.valeur) : p(x.fraisAchat.valeur)}</td></tr>
      <tr><td>Frais généraux, en % du PRA</td><td class="montant">{p(x.fraisGeneraux)}</td></tr>
      <tr class="zebre"><td>Bénéfice net, en % du PR</td><td class="montant">{p(x.beneficeNet)}</td></tr>
      <tr><td>Escompte accordé au client, en % du PVC</td><td class="montant">{p(x.escompteAccorde)}</td></tr>
      <tr class="zebre"><td>Rabais accordé au client, en % du PVB</td><td class="montant">{p(x.rabaisAccorde)}</td></tr>
    </tbody>
  </table>
</section>

<FicheCalcul {sections} {saisies} {entrainement} />

<p class="discret note">Arrondissez chaque montant au centime. Les montants sont contrôlés à 5 centimes près.</p>

<style>
  .donnees { margin-bottom: 16px; max-width: 620px; }
  .donnees h2 { padding: 10px 14px; border-bottom: 1px solid var(--c-bordure-2); }
  .note { margin-top: 4px; max-width: 80ch; }
</style>
