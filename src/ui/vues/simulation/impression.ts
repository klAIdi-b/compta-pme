// Impression pour les groupes : fiches de calcul AFP (phase S6), règles du jeu et fiches de décisions (22.11.2026).
// La page est construite dans une nouvelle fenêtre, puis la boîte d'impression du navigateur s'ouvre.

import { ficheAfp, type FicheAfp } from '../../../engine/simulation/fiche-afp';
import { ficheDecisions, reglesDuJeu } from '../../../engine/simulation/fiches-groupes';
import { imprevusEntreprise } from '../../../engine/simulation/tour';
import type { Imprevu, Partie } from '../../../engine/simulation/types';
import { libelleImprevu } from './libelles';

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

const STYLE_FICHES = `
  body { font-family: Arial, Helvetica, sans-serif; color: #1b2430; margin: 0; font-size: 14px; line-height: 1.45; }
  .page { padding: 28px 36px; page-break-after: always; max-width: 760px; margin: 0 auto; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #11304d; padding-bottom: 10px; }
  h1 { margin: 0; font-size: 24px; color: #11304d; } .sous { color: #5b6675; margin-top: 4px; }
  .nature { font-weight: bold; color: #c4501a; }
  h2 { font-size: 16px; margin: 18px 0 6px; color: #11304d; }
  ul { margin: 0; padding-left: 20px; } li { margin-bottom: 5px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 7px 8px; border-bottom: 1px solid #e3e8ef; vertical-align: middle; }
  .v { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .d td { padding: 12px 8px; } .aide { color: #5b6675; font-size: 12.5px; }
  .case { display: inline-block; width: 190px; height: 30px; border: 1px solid #94a0b0; border-radius: 4px; }
  .alerte { border-left: 4px solid #e8601c; background: #fff8f3; padding: 8px 12px; margin-top: 10px; }
  .pied { margin-top: 22px; color: #5b6675; }
  @media print { .page { padding: 0; } }`;

function ouvrir(titre: string, corps: string): boolean {
  const html = `<!doctype html><html lang="fr-CH"><head><meta charset="utf-8"><title>${echapper(titre)}</title>
<style>${STYLE_FICHES}</style></head><body>${corps}<script>window.onload = () => window.print();</script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

/** Règles du jeu de la partie (une ou deux pages), à distribuer aux groupes avant le premier tour. */
export function htmlRegles(p: Partie): string {
  const blocs = reglesDuJeu(p.reglages)
    .map((b) => `<h2>${echapper(b.titre)}</h2><ul>${b.items.map((i) => `<li>${echapper(i)}</li>`).join('')}</ul>`)
    .join('');
  return `<section class="page"><header><div><h1>Règles du jeu</h1><div class="sous">Simulateur d'entreprise · ${echapper(p.reglages.secteur.nom)}</div></div>
    <div class="nature">Pour les groupes</div></header>${blocs}</section>`;
}

export function imprimerRegles(p: Partie): boolean {
  return ouvrir('Règles du jeu', htmlRegles(p));
}

/** Fiches de décisions du prochain tour : une page par groupe, avec sa situation et les imprévus qui le touchent. */
export function htmlFichesDecisions(p: Partie, imprevus: readonly Imprevu[]): string {
  return p.entreprises
    .map((x) => {
      const f = ficheDecisions(p, x.id, imprevusEntreprise(p, imprevus, x.id));
      if (!f) return '';
      const situ = f.situation.map((l) => `<tr><td>${echapper(l.libelle)}</td><td class="v">${echapper(l.valeur)}</td></tr>`).join('');
      const imp = imprevus.filter((i) => i.entrepriseId === null || i.entrepriseId === x.id);
      const alerte = imp.length
        ? `<p class="alerte"><b>Imprévu :</b> ${imp.map((i) => echapper(libelleImprevu(i, p.entreprises, p.reglages.secteur))).join(' ; ')}.</p>`
        : '';
      const dec = f.decisions
        // Choix à cocher (fournisseur, véhicule) : les cases sont dans le texte, sans case de réponse à droite.
        .map((d) => `<tr><td><b>${echapper(d.libelle)}</b><br><span class="aide">${echapper(d.aide)}</span></td><td class="v">${d.aide.startsWith('☐') ? '' : '<span class="case"></span>'}</td></tr>`)
        .join('');
      return `<section class="page"><header><div><h1>${echapper(f.entreprise)}</h1><div class="sous">${echapper(f.tour)}</div></div>
        <div class="nature">Fiche de décisions</div></header>
        ${f.precedent ? `<p>${echapper(f.precedent)}</p>` : ''}${alerte}
        <h2>Votre situation au début du tour</h2><table>${situ}</table>
        <h2>À savoir</h2><ul>${f.rappels.map((r) => `<li>${echapper(r)}</li>`).join('')}</ul>
        <h2>Vos décisions</h2><table class="d">${dec}</table>
        <p class="pied">Fiche à remettre à l'enseignant·e, qui saisit les décisions dans le simulateur.</p></section>`;
    })
    .join('');
}

export function imprimerFichesDecisions(p: Partie, imprevus: readonly Imprevu[]): boolean {
  return ouvrir('Fiches de décisions', htmlFichesDecisions(p, imprevus));
}
