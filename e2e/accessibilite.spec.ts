// Contrôle d'accessibilité automatique (axe-core, règles WCAG 2.1 A et AA) sur les écrans principaux.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function controler(page: Page, nom: string) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const resume = graves.map(
    (v) =>
      `${nom} — ${v.id} (${v.impact}) : ${v.help} — ${v.nodes.length} élément(s) : ` +
      v.nodes
        .slice(0, 3)
        .map((n) => n.target.join(' '))
        .join(' | '),
  );
  expect(resume, resume.join('\n')).toEqual([]);
}

test('accueil, journal, comptes, bilan, théorie et espace enseignant sans défaut grave', async ({ page }) => {
  await page.goto('./');
  await controler(page, 'Accueil');
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill('outils');
  await page.getByText(/Outils & Cie/).first().click();
  await page.getByRole('button', { name: 'Commencer' }).click();
  await controler(page, 'Tableau de bord');
  for (const vue of ['journal', 'comptes', 'balance', 'bilan', 'resultat', 'tva', 'theorie']) {
    await page.goto(`./#${vue}`);
    await page.waitForTimeout(300);
    await controler(page, vue);
  }
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await controler(page, 'Espace enseignant (code)');
});

// Audit complet (version publique, phase P3, 22.11.2026) : tous les écrans de l'élève, le guide et l'espace enseignant.
const TOUTES_LES_VUES = [
  'tableau', 'journal', 'comptes', 'grandlivre', 'balance', 'bilan', 'resultat', 'tva', 'salaire', 'repartition', 'analyse',
  'degres', 'flux', 'seuil', 'bilanOuverture', 'margeBrute', 'echelle', 'bouclement', 'theorie',
];

async function commencer(page: Page, recherche: string, titre: RegExp, mp = false) {
  await page.goto('./');
  if (mp) await page.getByRole('button', { name: 'Maturité professionnelle', exact: true }).click();
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill(recherche);
  await page.getByText(titre).first().click();
  await page.getByRole('button', { name: /^(Commencer|Reprendre)$/ }).click();
}

for (const [recherche, titre, mp] of [['Arve', /Papeterie de l'Arve/, false], ['Lémantec', /Lémantec SA/, true]] as const) {
  test(`tous les écrans de l'élève sans défaut grave (${recherche})`, async ({ page }) => {
    await commencer(page, recherche, titre, mp);
    for (const vue of TOUTES_LES_VUES) {
      await page.goto(`./#${vue}`);
      await page.waitForTimeout(200);
      await controler(page, `${recherche} · ${vue}`);
    }
  });
}

test('guide (trois parties) sans défaut grave', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'À propos' }).click();
  await expect(page.getByRole('heading', { name: '1. Licences' })).toBeVisible();
  await controler(page, 'Guide · À propos');
  for (const partie of ['Pour les élèves', "Pour l'enseignant"]) {
    await page.getByRole('button', { name: partie }).click();
    await controler(page, `Guide · ${partie}`);
  }
});

test("tous les onglets de l'espace enseignant et l'éditeur sans défaut grave", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill('essai-e2e-4821');
  await page.getByLabel('Confirmer le code').fill('essai-e2e-4821');
  await page.getByRole('button', { name: 'Entrer' }).click();
  for (const onglet of ['Exercices', 'Dossiers', 'Copies', 'Simulateur', 'Relecture', 'Paramètres']) {
    await page.getByRole('button', { name: onglet, exact: true }).click();
    await page.waitForTimeout(300);
    await controler(page, `Espace enseignant · ${onglet}`);
  }
  await page.getByRole('button', { name: 'Exercices', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvel exercice' }).click();
  await controler(page, "Éditeur d'exercice");
});

test('zoom à 200 % : pas de défilement horizontal de la page sur les écrans principaux', async ({ page }) => {
  // 1366 × 768 zoomé à 200 % équivaut à une fenêtre de 683 × 384 pixels CSS.
  await page.setViewportSize({ width: 683, height: 384 });
  await commencer(page, 'Arve', /Papeterie de l'Arve/);
  const debordements: string[] = [];
  for (const vue of ['tableau', 'journal', 'balance', 'bilan', 'resultat', 'theorie']) {
    await page.goto(`./#${vue}`);
    await page.waitForTimeout(200);
    const { large, fenetre } = await page.evaluate(() => ({ large: document.documentElement.scrollWidth, fenetre: window.innerWidth }));
    if (large > fenetre + 1) debordements.push(`${vue} : ${large} px pour ${fenetre} px`);
  }
  expect(debordements, debordements.join('\n')).toEqual([]);
});
