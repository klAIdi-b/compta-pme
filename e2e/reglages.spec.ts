// Réglages de l'établissement (version publique, phase P2) : plan comptable, import CSV refusé, niveaux, accessibilité.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const CODE_ESSAI = 'essai-e2e-4821';

async function ouvrirParametres(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Paramètres', exact: true }).click();
}

async function sansViolationGrave(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
}

test("plan de l'établissement : renommer un compte, l'exercice créé l'emporte", async ({ page }) => {
  await ouvrirParametres(page);
  await expect(page.getByText('Plan PME du cours')).toBeVisible();
  await sansViolationGrave(page);

  await page.getByRole('button', { name: 'Modifier le plan' }).click();
  await expect(page.getByLabel('Niveau du compte 9000')).toBeDisabled();
  await expect(page.getByLabel('Intitulé du compte 2800')).toBeDisabled();
  await page.getByLabel('Intitulé du compte 1010').fill('PostFinance');
  await expect(page.getByText('1 modification', { exact: true })).toBeVisible();
  await sansViolationGrave(page);
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText("Plan de l'établissement")).toBeVisible();

  // Un nouvel exercice emporte le plan de l'établissement (liste « Comptes de l'exercice » de l'éditeur).
  await page.getByRole('button', { name: 'Exercices', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvel exercice' }).click();
  await expect(page.getByText('PostFinance').first()).toBeVisible();
});

test('niveaux : un titre renommé apparaît dans l’éditeur ; la remise à zéro demande une confirmation', async ({ page }) => {
  await ouvrirParametres(page);
  await page.getByRole('button', { name: 'Modifier les niveaux' }).click();
  await page.getByLabel('Titre du niveau 1 (CFC)').fill('Première année');
  await page.getByLabel('Nom affiché pour CFC 1').fill('1re année');
  await sansViolationGrave(page);
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page.getByText('Niveaux enregistrés.')).toBeVisible();
  await expect(page.getByText(/1re année ; CFC complet/)).toBeVisible();

  const remise = page.getByRole('button', { name: 'Revenir aux réglages par défaut' });
  await remise.click();
  await page.getByRole('button', { name: 'Confirmer : revenir aux réglages par défaut' }).click();
  await expect(page.getByText('Réglages par défaut rétablis.')).toBeVisible();
  await expect(page.getByText(/Bases \(CFC, 1re année\)/)).toBeVisible();
});
