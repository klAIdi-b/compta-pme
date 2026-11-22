// Simulateur d'entreprise (phase S3, sans connexion) : créer une partie, saisir les décisions, calculer, projeter.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const CODE_ESSAI = 'essai-e2e-4821';
const CAPTURES = process.env.SIM_CAPTURES;

async function controler(page: Page, nom: string) {
  if (CAPTURES) await page.screenshot({ path: `${CAPTURES}/sim-${nom}.png`, fullPage: true });
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const graves = r.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${nom} — ${v.id} : ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(graves, graves.join('\n')).toEqual([]);
}

test("l'enseignant crée une partie, saisit les décisions, calcule un tour et projette les résultats", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Simulateur', exact: true }).click();
  await expect(page.getByText('Aucune partie pour l\'instant.', { exact: false })).toBeVisible();

  // Création : refus sans nom, puis partie Éclair à deux entreprises.
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await page.getByRole('button', { name: 'Créer la partie' }).click();
  await expect(page.getByText('Donnez un nom à la partie')).toBeVisible();
  await page.getByLabel('Nom de la partie').fill('2CA essai');
  await page.getByText('Éclair · 2 à 3 séances').click();
  await page.getByLabel("Nom de l'entreprise 1").fill('Les Lémaniques');
  await page.getByLabel("Nom de l'entreprise 2").fill('Rhône Express');
  await controler(page, '1-creation');
  await page.getByRole('button', { name: 'Créer la partie' }).click();

  await expect(page.getByRole('heading', { name: '2CA essai' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Calculer le tour 1' })).toBeDisabled();
  await controler(page, '2-tableau');

  // Décisions du premier groupe.
  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await expect(page.getByRole('heading', { name: 'Les Lémaniques' })).toBeVisible();
  await page.getByLabel(/à commander/).fill('10');
  await page.getByLabel('Budget de publicité').fill('500');
  await controler(page, '3-decisions');
  await page.getByRole('button', { name: 'Valider les décisions' }).click();

  // Second groupe : une commande trop chère chez l'importateur est refusée, puis corrigée.
  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await expect(page.getByRole('heading', { name: 'Rhône Express' })).toBeVisible();
  await page.getByText('Velimport Sàrl').click();
  await page.getByLabel(/à commander/).fill('100');
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await expect(page.getByRole('alert')).toContainText('Liquidités insuffisantes');
  await page.getByLabel(/à commander/).fill('12');
  await page.getByLabel('Prix de vente').fill('829');
  await page.getByRole('button', { name: 'Valider les décisions' }).click();

  // Calcul et projection.
  await page.getByRole('button', { name: 'Calculer le tour 1' }).click();
  await expect(page.getByRole('heading', { name: /^Résultats — janvier/ })).toBeVisible();
  await expect(page.locator('.classement tbody tr')).toHaveCount(2);
  await controler(page, '4-projection');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Calculer le tour 2' })).toBeVisible();

  // Fiches pour les groupes (22.11.2026) : règles du jeu et fiches de décisions du tour 2, une page par groupe.
  const [regles] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Imprimer les règles du jeu' }).click()]);
  await expect(regles.getByRole('heading', { name: 'Règles du jeu' })).toBeVisible();
  await expect(regles.getByRole('heading', { name: 'Comment se font les ventes' })).toBeVisible();
  if (CAPTURES) await regles.screenshot({ path: `${CAPTURES}/sim-5-regles.png`, fullPage: true });
  await regles.close();
  const [fiches] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Imprimer les fiches de décisions du tour 2' }).click()]);
  await expect(fiches.locator('section.page')).toHaveCount(2);
  await expect(fiches.getByText(/^Tour précédent \(janvier/).first()).toBeVisible();
  if (CAPTURES) await fiches.screenshot({ path: `${CAPTURES}/sim-6-fiches.png`, fullPage: true });
  await fiches.close();

  // Pièces : aperçu de l'exercice d'une entreprise, retour au simulateur.
  await page.getByRole('button', { name: 'Aperçu' }).first().click();
  await expect(page.getByText('Aperçu enseignant.')).toBeVisible();
  await page.locator('.bandeau-apercu').getByRole('button', { name: "Fermer l'aperçu" }).click();
  await expect(page.getByRole('heading', { name: '2CA essai' })).toBeVisible();

  // La partie est enregistrée : elle survit au rechargement.
  await page.reload();
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Simulateur', exact: true }).click();
  await expect(page.getByText('Tour 2 sur 3')).toBeVisible();
});

test('partie CFC 2 : employés et véhicule dans les décisions, tour calculé avec la TVA', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Simulateur', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await page.getByRole('button', { name: 'CFC 2', exact: true }).click();
  await page.getByLabel('Nom de la partie').fill('3CA essai');
  await page.getByText('Éclair · 2 à 3 séances').click();
  await page.getByLabel("Nom de l'entreprise 1").fill('Les Gourmets');
  await page.getByLabel("Nom de l'entreprise 2").fill('Panier Lémanique');
  await page.getByRole('button', { name: 'Créer la partie' }).click();
  await expect(page.getByText('CFC 2', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await expect(page.getByLabel('Employés (sans le propriétaire)')).toHaveValue('1');
  await expect(page.getByText(/Capacité du tour : 50 clients/)).toBeVisible();
  await page.getByLabel(/Acheter fourgon de livraison/).click();
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await expect(page.getByRole('alert')).toContainText('Liquidités insuffisantes');
  await page.getByLabel(/Acheter fourgon de livraison/).click();
  await page.getByLabel(/à commander/).fill('20');
  await controler(page, '5-decisions-cfc2');
  await page.getByRole('button', { name: 'Valider les décisions' }).click();

  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await page.getByLabel('Employés (sans le propriétaire)').fill('0');
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await page.getByRole('button', { name: 'Calculer le tour 1' }).click();
  await expect(page.getByRole('heading', { name: /^Résultats — janvier/ })).toBeVisible();
});

test('comptabilité mixte : les tours non saisis sont au journal comme écritures automatiques', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Simulateur', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await page.getByLabel('Nom de la partie').fill('Mixte essai');
  await page.getByText('Éclair · 2 à 3 séances').click();
  await page.getByRole('button', { name: 'mixte', exact: true }).click();
  // Tour 1 coché par défaut : on saisira le tour 2 à la place.
  await page.getByRole('checkbox', { name: '1', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: '2', exact: true }).check();
  await page.getByLabel("Nom de l'entreprise 1").fill('Les Lémaniques');
  await page.getByLabel("Nom de l'entreprise 2").fill('Rhône Express');
  await page.getByRole('button', { name: 'Créer la partie' }).click();
  await expect(page.getByRole('heading', { name: 'Mixte essai' })).toBeVisible();

  for (const tour of [1, 2]) {
    for (let g = 0; g < 2; g++) {
      await page.getByRole('button', { name: 'Saisir' }).first().click();
      await page.getByLabel(/à commander/).fill('10');
      await page.getByRole('button', { name: 'Valider les décisions' }).click();
    }
    await page.getByRole('button', { name: `Calculer le tour ${tour}` }).click();
    await page.keyboard.press('Escape');
  }
  await expect(page.getByText(/les élèves saisissent les tours 2/)).toBeVisible();
  await page.getByRole('button', { name: 'Aperçu' }).first().click();
  await expect(page.getByText(/0 opération sur \d+ saisie/)).toBeVisible();
  await page.getByRole('button', { name: 'Commencer la saisie' }).click();
  await expect(page.getByText('automatique').first()).toBeVisible();
  await controler(page, '6-journal-mixte');
});

test('partie MP : emprunt bancaire dans les décisions, rentabilité des fonds propres projetée', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Simulateur', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await page.getByRole('button', { name: 'MP', exact: true }).click();
  await page.getByLabel('Nom de la partie').fill('MP essai');
  await page.getByText('Éclair · 2 à 3 séances').click();
  await page.getByLabel("Nom de l'entreprise 1").fill('Léman Cycles SA');
  await page.getByLabel("Nom de l'entreprise 2").fill('Rhône Mobilité SA');
  await page.getByRole('button', { name: 'Créer la partie' }).click();
  await expect(page.getByRole('heading', { name: 'MP essai' })).toBeVisible();

  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await expect(page.getByLabel('Prélèvement privé')).toHaveCount(0);
  await page.getByLabel('Nouvel emprunt bancaire').fill('40000');
  await page.getByLabel(/Acheter fourgon de livraison/).click();
  await page.getByLabel(/à commander/).fill('20');
  await controler(page, '7-decisions-mp');
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await page.getByRole('button', { name: 'Calculer le tour 1' }).click();
  await expect(page.locator('.classement th', { hasText: 'Rentabilité des fonds propres' })).toBeVisible();
});

test('imprévu annoncé aux groupes et projeté ; fiches AFP à imprimer', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Simulateur', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await page.getByRole('button', { name: 'AFP', exact: true }).click();
  await page.getByLabel('Nom de la partie').fill('AFP essai');
  await page.getByText('Éclair · 2 à 3 séances').click();
  await page.getByLabel("Nom de l'entreprise 1").fill('Les Lémaniques');
  await page.getByLabel("Nom de l'entreprise 2").fill('Rhône Express');
  await page.getByRole('button', { name: 'Créer la partie' }).click();

  await page.getByLabel('Hausse en pour cent').fill('10');
  await page.getByRole('button', { name: "Ajouter l'imprévu" }).click();
  await expect(page.getByText(/Hausse de 10 % du prix d'achat des vélos de ville \(tout le marché\)/)).toBeVisible();
  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await expect(page.getByText(/Imprévu de ce tour/)).toBeVisible();
  await expect(page.getByText(/572\.00 l'unité/)).toBeVisible();
  await page.getByLabel(/à commander/).fill('10');
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await page.getByRole('button', { name: 'Calculer le tour 1' }).click();
  await expect(page.locator('.projection .imprevu')).toContainText('Hausse de 10 %');
  await page.keyboard.press('Escape');

  const fenetre = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Imprimer les fiches de calcul du tour 1' }).click();
  const fiches = await fenetre;
  await expect(fiches.getByRole('heading', { name: 'Les Lémaniques' })).toBeVisible();
  await expect(fiches.getByText("Coût d'achat des marchandises vendues").first()).toBeVisible();
});
