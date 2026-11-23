// Écrans ajoutés le 23.11.2026 : Facturation, Budget, Apprendre pas à pas et formulaire officiel de décompte TVA.
import { expect, test, type Page } from '@playwright/test';

async function ouvrirParLien(page: Page, id: string) {
  await page.goto(`./?exercice=${id}`);
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();
}

/** Ligne de tableau qui contient un libellé, pour lire sa colonne « Contrôle ». */
const ligne = (page: Page, texte: string) => page.locator('tr', { hasText: texte }).first();

test('facturation : facture, ordre de paiement et contrôle des paiements, contrôlés en entraînement', async ({ page }) => {
  await ouvrirParLien(page, 'dossier-cfc2-cycles-du-leman-facturation');
  await page.getByRole('link', { name: 'Facturation' }).click();
  await expect(page.getByRole('heading', { name: 'Facturation', exact: true })).toBeVisible();

  // F-301 : la TVA arrondie aux 5 centimes est exigée.
  await page.getByLabel('TVA 8,1 %').fill('272.60');
  await expect(ligne(page, 'TVA 8,1 %')).toContainText('À revoir');
  await page.getByLabel('TVA 8,1 %').fill('272.65');
  await expect(ligne(page, 'TVA 8,1 %')).toContainText('Juste');

  // Ordre de paiement : escompte déduit dans le délai.
  await page.getByRole('button', { name: 'Payer des factures' }).click();
  await page.getByLabel('Escompte déduit ?').selectOption('oui');
  await page.getByLabel('Montant', { exact: true }).fill('4767.20');
  await expect(page.locator('table.formulaire tr').filter({ has: page.getByLabel('Montant', { exact: true }) })).toContainText('Juste');

  // Contrôle : facture échue non payée.
  await page.getByRole('button', { name: 'Contrôler les paiements' }).click();
  await page.getByLabel('Situation de la facture F-298').selectOption('echue');
  await page.getByLabel('Reste à encaisser, facture F-298').fill('1180');
  await expect(page.locator('tr').filter({ has: page.getByLabel('Situation de la facture F-298') })).toContainText('Juste');
});

test('budget : préparer le budget puis calculer les écarts', async ({ page }) => {
  await ouvrirParLien(page, 'budget-cfc2-cycles-du-leman-journee');
  await page.getByRole('link', { name: 'Budget' }).click();
  await page.getByLabel('Budget, T-shirts').fill('450');
  await expect(ligne(page, 'T-shirts')).toContainText('À revoir');
  await page.getByLabel('Budget, T-shirts').fill('540');
  await expect(ligne(page, 'T-shirts')).toContainText('Juste');

  await page.getByRole('button', { name: 'Comparer avec les chiffres effectifs' }).click();
  await page.getByLabel('Écart, Inscriptions').fill('−300');
  await page.getByLabel('Écart en %, Inscriptions').fill('-20');
  await page.getByLabel('Appréciation, Inscriptions').selectOption('defavorable');
  await expect(ligne(page, 'Inscriptions')).toContainText('Juste');
});

test('apprendre pas à pas : un module, son exemple, une question corrigée tout de suite', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Ouvrir le parcours|Continuer le parcours/ }).click();
  await expect(page.getByRole('heading', { name: 'Apprendre pas à pas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Maturité professionnelle' })).toBeVisible();
  await page.getByRole('button', { name: 'TVA : comptabilisation au net' }).click();
  await expect(page.getByRole('heading', { name: 'Exemple travaillé' })).toBeVisible();
  await page.getByRole('button', { name: /Commencer la série/ }).click();
  const listes = page.locator('.composee select');
  const n = await listes.count();
  for (let i = 0; i < n; i++) await listes.nth(i).selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Vérifier' }).click();
  await expect(page.getByRole('status')).toContainText(/Juste|Pas tout à fait/);
  await expect(page.getByRole('button', { name: /Question suivante|Voir le résultat/ })).toBeVisible();
});

test('formulaire officiel de décompte TVA dans l’écran TVA', async ({ page }) => {
  await ouvrirParLien(page, 'demo-cfc2-papeterie-arve');
  await page.getByRole('link', { name: 'TVA' }).click();
  await expect(page.getByRole('heading', { name: /Formulaire officiel de décompte/ })).toBeVisible();
  // Rien n'est encore comptabilisé : le chiffre d'affaires du formulaire est nul.
  const c200 = page.getByLabel(/^Chiffre 200,/);
  await c200.fill('5');
  await expect(ligne(page, 'Total des contre-prestations')).toContainText('À revoir');
  await c200.fill('0');
  await expect(ligne(page, 'Total des contre-prestations')).toContainText('Juste');
});
