<!--
  Démonstration de la page d'accueil (direction « Le logiciel en action », choisie par l'enseignant le 24.11.2026) :
  une écriture s'inscrit et deux masses du bilan grandissent. Données fixes, écrites ici : aucun moteur n'est chargé.
  Les mouvements montrent la comptabilité (exception à la charte, pour l'accueil seulement) et sont coupés si
  l'appareil demande moins d'animations ; l'état final reste alors affiché d'un coup.
-->
<script lang="ts">
  let { joue = false }: { joue?: boolean } = $props();
</script>

<div class="demo" class:joue role="group" aria-label="Démonstration : une écriture et son effet sur le bilan">
  <div class="demo-tete"><span>Journal · Cycles du Léman</span><span class="num rang">Opération 1 sur 15</span></div>
  <p class="operation"><b>Opération.</b> Le magasin achète une camionnette à crédit, 5'000.00.</p>
  <div class="ecriture" aria-hidden={!joue}>
    <div><span class="etiq">Compte au débit</span><div class="champ"><span>Véhicules</span></div></div>
    <div><span class="etiq">Compte au crédit</span><div class="champ"><span>Autres dettes</span></div></div>
    <div><span class="etiq">Montant CHF</span><div class="champ num"><span>5'000.00</span></div></div>
  </div>
  <div class="bilan" aria-hidden="true">
    <div>
      <div class="cote-tete"><span>Actif</span><span class="num">{joue ? "98'000.00" : "93'000.00"}</span></div>
      <div class="pile">
        <div class="bloc ac" style:--part="56"><span>Actifs circulants</span><span class="num">56'000.00</span></div>
        <div class="bloc ai" class:plus={joue} style:--part={joue ? 42 : 37}><span>Actifs immobilisés</span><span class="num">{joue ? "42'000.00" : "37'000.00"}</span></div>
      </div>
    </div>
    <div>
      <div class="cote-tete"><span>Passif</span><span class="num">{joue ? "98'000.00" : "93'000.00"}</span></div>
      <div class="pile">
        <div class="bloc ct" class:plus={joue} style:--part={joue ? 9 : 4}><span>Dettes à court terme</span><span class="num">{joue ? "9'000.00" : "4'000.00"}</span></div>
        <div class="bloc lt" style:--part="25"><span>Dettes à long terme</span><span class="num">25'000.00</span></div>
        <div class="bloc cp" style:--part="64"><span>Capitaux propres</span><span class="num">64'000.00</span></div>
      </div>
    </div>
  </div>
  <p class="verdict" role="status">
    {#if joue}<b>Juste.</b> L'actif et le passif augmentent tous les deux de 5'000.00 : le bilan reste équilibré.{/if}
  </p>
</div>

<style>
  .demo { background: var(--c-fond); border: 1px solid var(--c-bordure-2); border-radius: var(--r-3); box-shadow: var(--ombre-haute); overflow: hidden; min-width: 0; }
  .demo-tete { display: flex; justify-content: space-between; align-items: center; gap: var(--e-2); padding: var(--e-2) var(--e-4); background: var(--c-fond-tete); border-bottom: 1px solid var(--c-bordure-2); font-size: var(--t-13); color: var(--c-texte-2); font-weight: var(--graisse-moyen); }
  .operation { margin: 0; padding: var(--e-3) var(--e-4); background: var(--c-bleu-doux); font-size: var(--t-14); }
  .ecriture { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 110px; gap: var(--e-2); padding: var(--e-3) var(--e-4); align-items: end; }
  .etiq { display: block; font-size: var(--t-12); color: var(--c-texte-2); font-weight: var(--graisse-moyen); margin-bottom: 2px; }
  .champ { border: 1px solid var(--c-bordure); border-radius: var(--r-1); min-height: 38px; padding: 0 var(--e-2); display: flex; align-items: center; font-size: var(--t-14); background: var(--c-fond); overflow: hidden; white-space: nowrap; }
  .champ.num { justify-content: flex-end; }
  .champ span { opacity: 0; }
  .bilan { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--e-3); padding: var(--e-3) var(--e-4) var(--e-4); border-top: 1px solid var(--c-bordure-3); }
  .cote-tete { display: flex; justify-content: space-between; gap: var(--e-2); font-size: var(--t-13); font-weight: var(--graisse-fort); margin-bottom: 4px; }
  .pile { display: flex; flex-direction: column; gap: 3px; height: 156px; }
  .bloc {
    border-radius: var(--r-2); color: #fff; font-size: var(--t-12); font-weight: 600; padding: 4px 8px; display: flex; justify-content: space-between;
    align-items: center; gap: var(--e-2); min-height: 26px; flex: var(--part) 1 0; transition: flex-grow 0.7s ease 0.9s, box-shadow 0.3s ease 0.9s; overflow: hidden; white-space: nowrap;
  }
  /* Mêmes teintes que le « Bilan en direct » du journal. */
  .ac { background: #2a6aa0; } .ai { background: var(--c-structure); }
  .ct { background: #b3541e; } .lt { background: #8f3f12; } .cp { background: var(--c-succes); }
  .bloc.plus { box-shadow: inset 0 0 0 2px #fff, 0 0 0 2px var(--c-accent); }
  .verdict { margin: 0 var(--e-4) var(--e-4); padding: var(--e-2) var(--e-3); border: 1px solid var(--c-succes); border-left-width: 4px; border-radius: var(--r-2); background: var(--c-succes-fond); color: #124526; font-size: var(--t-14); min-height: 3.6em; opacity: 0; }
  .joue .champ span { animation: apparait 0.35s ease forwards; }
  .joue .ecriture > div:nth-child(2) .champ span { animation-delay: 0.3s; }
  .joue .ecriture > div:nth-child(3) .champ span { animation-delay: 0.6s; }
  .joue .verdict { animation: apparait 0.4s ease 1.7s forwards; }
  @keyframes apparait { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @media (max-width: 700px) {
    .ecriture { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .ecriture > div:nth-child(3) { grid-column: 1 / -1; }
    .pile { height: 196px; }
    .bloc { flex-direction: column; align-items: flex-start; justify-content: center; gap: 0; white-space: normal; line-height: 1.25; min-height: 40px; }
    .rang { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .bloc { transition: none; }
    .joue .champ span, .joue .verdict { animation: none; opacity: 1; }
  }
</style>
