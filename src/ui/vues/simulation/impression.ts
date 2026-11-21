// Impression des fiches de calcul AFP (phase S6) : une page par groupe, ou le corrigé de l'enseignant.
// La page est construite dans une nouvelle fenêtre, puis la boîte d'impression du navigateur s'ouvre.

import { ficheAfp, type FicheAfp } from '../../../engine/simulation/fiche-afp';
import type { Partie } from '../../../engine/simulation/types';

const echapper = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(f: FicheAfp, corrige: boolean, secteur: string): string {
  const donnees = f.donnees.map((d) => `<tr><td>${echapper(d.libelle)}</td><td class="v">${echapper(d.valeur)}</td></tr>`).join('');
  const questions = f.questions
    .map(
      (q, i) =>
        `<tr><td><b>${i + 1}. ${echapper(q.libelle)}</b><br><span class="aide">${echapper(q.aide)}</span></td>` +
        `<td class="v">${corrige ? `<b>${echapper(q.reponse)}</b>` : '<span class="case"></span>'}</td></tr>`,
    )
    .join('');
  return `<section class="page">
    <header><div><h1>${echapper(f.entreprise)}</h1><div class="sous">${echapper(secteur)} · ${echapper(f.periode)}</div></div>
    <div class="nature">${corrige ? 'CORRIGÉ' : 'Fiche de calcul'}</div></header>
    <h2>Les chiffres du tour</h2><table>${donnees}</table>
    <h2>À calculer</h2><table class="q">${questions}</table>
    ${corrige ? '' : '<p class="pied">Noms du groupe : ……………………………………………………………………</p>'}
  </section>`;
}

/** Ouvre les fiches du tour (ou le corrigé) dans une nouvelle fenêtre prête à imprimer. Renvoie false si bloquée. */
export function imprimerFichesAfp(p: Partie, numeroTour: number, corrige: boolean): boolean {
  const pages = p.entreprises.map((x) => page(ficheAfp(p, x.id, numeroTour), corrige, p.reglages.secteur.nom)).join('');
  const html = `<!doctype html><html lang="fr-CH"><head><meta charset="utf-8"><title>${corrige ? 'Corrigé' : 'Fiches'} — tour ${numeroTour}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1b2430; margin: 0; }
  .page { padding: 28px 36px; page-break-after: always; max-width: 760px; margin: 0 auto; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #11304d; padding-bottom: 10px; }
  h1 { margin: 0; font-size: 26px; color: #11304d; } .sous { color: #5b6675; margin-top: 4px; }
  .nature { font-weight: bold; color: #c4501a; }
  h2 { font-size: 16px; margin: 22px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  td { padding: 9px 8px; border-bottom: 1px solid #e3e8ef; vertical-align: middle; }
  .v { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; width: 220px; }
  .q td { padding: 14px 8px; } .aide { color: #5b6675; font-size: 13px; }
  .case { display: inline-block; width: 200px; height: 30px; border: 1px solid #94a0b0; border-radius: 4px; }
  .pied { margin-top: 28px; color: #5b6675; }
  @media print { .page { padding: 0; } }
</style></head><body>${pages}<script>window.onload = () => window.print();</script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
