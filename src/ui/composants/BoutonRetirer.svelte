<!-- Retrait en deux temps : le premier clic arme le bouton (« Confirmer »), le second retire. Sans second clic dans
     les 5 secondes, ou si le focus part ailleurs, le bouton revient au repos. Une ligne encore vide (`direct`) se
     retire au premier clic : il n'y a rien à perdre. -->
<script lang="ts">
  let { libelle, direct = false, onretirer }: { libelle: string; direct?: boolean; onretirer: () => void } = $props();

  let arme = $state(false);
  let minuteur: ReturnType<typeof setTimeout> | undefined;

  function desarmer() {
    clearTimeout(minuteur);
    arme = false;
  }

  function clic() {
    if (direct || arme) {
      desarmer();
      onretirer();
      return;
    }
    arme = true;
    minuteur = setTimeout(desarmer, 5000);
  }

  $effect(() => () => clearTimeout(minuteur));
</script>

<button type="button" class="retirer" class:arme aria-label={arme ? `Confirmer : ${libelle}` : libelle} onclick={clic} onblur={desarmer}>
  {arme ? 'Confirmer' : '×'}
</button>

<style>
  .retirer { border: none; background: none; color: var(--c-texte-2); font-size: 18px; cursor: pointer; padding: 6px 4px; }
  .retirer:hover { color: var(--c-negatif); }
  .retirer.arme {
    font-size: 12px; font-weight: bold; color: var(--c-negatif); border: 1px solid var(--c-negatif); border-radius: 6px;
    padding: 5px 8px; background: var(--c-fond); white-space: nowrap;
  }
</style>
