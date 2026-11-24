// Page d'accueil (direction « Le logiciel en action », reprise en tête pour l'élève qui revient) : démonstration,
// première action en un clic, clavier, mouvement réduit, largeurs de 360 à 1440 px.
import { expect, test } from '@playwright/test';

const horsCadre = (page: import('@playwright/test').Page) =>
  page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    largeur: window.innerWidth,
    droite: Math.max(...[...document.querySelectorAll<HTMLElement>('main *')].filter((e) => e.offsetParent !== null).map((e) => e.getBoundingClientRect().right)),
    petites: [...document.querySelectorAll<HTMLElement>('header button, main button, main a, main summary')]
      .filter((e) => e.offsetParent !== null)
      .map((e) => ({ n: (e.innerText || e.tagName).trim().slice(0, 30), r: e.getBoundingClientRect() }))
      .filter((x) => x.r.height < 24 || x.r.width < 24)
      .map((x) => `${x.n} ${Math.round(x.r.width)}×${Math.round(x.r.height)}`),
  }));

test('nouvel élève : une première écriture en un clic, puis le choix d’un exercice', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: 'Passez votre première écriture.' })).toBeVisible();
  const demo = page.getByRole('group', { name: /Démonstration/ });
  await expect(demo).toContainText('Le magasin achète une camionnette à crédit');
  await expect(demo).toContainText("93'000.00");
  await page.getByRole('button', { name: 'Valider cette écriture' }).click();
  await expect(demo.getByRole('status')).toContainText('Juste');
  await expect(demo).toContainText("98'000.00");
  await expect(demo).toContainText("42'000.00");
  // La démonstration se rejoue, et l'action principale mène au choix d'un exercice.
  await page.getByRole('button', { name: 'Rejouer la démonstration' }).click();
  await expect(demo).toContainText("93'000.00");
  await page.getByRole('button', { name: 'Valider cette écriture' }).click();
  // Les trois portes, le fil rouge et les accès sont toujours là.
  for (const nom of [/Apprendre une notion/, /M'exercer sur une entreprise/, /Faire une évaluation/]) await expect(page.getByRole('button', { name: nom })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Suivre une entreprise : Cycles du Léman/ })).toBeVisible();
  await expect(page.getByRole('button', { name: "Guide d'utilisation" })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Espace enseignant' })).toBeVisible();
  // L'action principale ouvre la page des exercices, en haut, et non plus le bas de l'accueil.
  await page.getByRole('button', { name: /Continuer avec une vraie entreprise/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Choisir un exercice' })).toBeInViewport();
  await expect(page.getByLabel('Rechercher un exercice')).toBeVisible();
});

test('onglets du bandeau : chaque rubrique a sa page, le bouton Retour ramène en arrière', async ({ page }) => {
  await page.goto('./');
  const rubriques = page.getByRole('navigation', { name: 'Rubriques' });
  await expect(rubriques.getByRole('button', { name: 'Accueil' })).toHaveAttribute('aria-current', 'page');
  await rubriques.getByRole('button', { name: 'Apprendre' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Apprendre pas à pas' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Apprendre' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Exercices' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Choisir un exercice' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Évaluation' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Faire une évaluation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ouvrir un exercice reçu…' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Choisir un exercice' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Apprendre pas à pas' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Passez votre première écriture.' })).toBeVisible();
  // Le nom du site ramène toujours à l'accueil.
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Exercices' }).click();
  await page.getByTitle("Retour à la page d'accueil").click();
  await expect(page.getByRole('heading', { level: 1, name: 'Passez votre première écriture.' })).toBeVisible();
});

test('accueil au clavier et avec moins d’animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  // Clavier : après le nom du site, les quatre onglets et les deux liens du bandeau, la première action.
  let atteint = false;
  for (let i = 0; i < 9 && !atteint; i++) {
    await page.keyboard.press('Tab');
    atteint = await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Valider cette écriture');
  }
  expect(atteint).toBe(true);
  const contour = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(contour).not.toBe('none');
  await page.keyboard.press('Enter');
  // Sans animation, l'état final est affiché tout de suite.
  const etat = await page.evaluate(() => ({
    champs: [...document.querySelectorAll('.demo .champ span')].map((e) => getComputedStyle(e).opacity),
    verdict: getComputedStyle(document.querySelector('.demo .verdict')!).opacity,
    animations: document.getAnimations().filter((a) => a.playState === 'running').length,
  }));
  expect(etat.champs).toEqual(['1', '1', '1']);
  expect(etat.verdict).toBe('1');
  expect(etat.animations).toBe(0);
});

for (const largeur of [360, 768, 1440]) {
  test(`accueil à ${largeur} px : rien ne dépasse, nouvel élève puis élève qui revient`, async ({ page }) => {
    await page.setViewportSize({ width: largeur, height: largeur < 700 ? 740 : 900 });
    await page.goto('./');
    await page.getByRole('button', { name: 'Valider cette écriture' }).click();
    let m = await horsCadre(page);
    expect(m.page).toBeLessThanOrEqual(m.largeur);
    expect(m.droite).toBeLessThanOrEqual(m.largeur + 1);
    expect(m.petites).toEqual([]);
    // La première action tient dans le premier écran.
    const premier = await page.getByRole('button', { name: /Continuer avec une vraie entreprise/ }).boundingBox();
    expect(premier!.y + premier!.height).toBeLessThanOrEqual(largeur < 700 ? 740 : 900);

    // Un travail en cours : la reprise est tout en haut.
    await page.getByRole('button', { name: /Continuer avec une vraie entreprise/ }).click();
    await page.getByLabel('Prénom').fill('Léa');
    await page.getByLabel('Nom', { exact: true }).fill('Martin');
    await page.getByLabel('Classe').fill('2CFC1');
    await page.getByLabel('Rechercher un exercice').fill('cycles');
    await page.locator('#choisir-exercice').getByText(/Cycles du Léman/).first().click();
    await page.getByRole('button', { name: 'Commencer' }).click();
    await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();
    await page.getByTitle("Retour à la page d'accueil").click();
    await expect(page.getByRole('heading', { level: 1, name: 'Bon retour, Léa.' })).toBeVisible();
    await expect(page.getByText('Votre prochaine étape')).toBeVisible();
    const reprendre = await page.getByRole('button', { name: /^Reprendre/ }).first().boundingBox();
    expect(reprendre!.y + reprendre!.height).toBeLessThanOrEqual(largeur < 700 ? 740 : 900);
    m = await horsCadre(page);
    expect(m.page).toBeLessThanOrEqual(m.largeur);
    expect(m.droite).toBeLessThanOrEqual(m.largeur + 1);
    await page.getByRole('button', { name: /^Reprendre/ }).first().click();
    await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();
  });
}
