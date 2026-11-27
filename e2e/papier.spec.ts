// Mode « énoncé papier » (phase V2) : l'élève crée le dossier avec le code de la feuille, saisit le bilan d'ouverture
// et les écritures, exporte sa copie ; l'enseignant l'importe dans « Copies » avec son corrigé.
import { expect, test, type Page } from '@playwright/test';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { codeExercice } from '../src/engine/papier';

const CODE_ESSAI = 'essai-e2e-4821';

async function nouveauPapier(page: Page) {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  await page.getByRole('button', { name: /Énoncé sur papier/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Nouveau dossier, énoncé sur papier' })).toBeVisible();
}

async function saisir(page: Page, libelle: string, debit: string, credit: string, montant: string) {
  await page.locator('#saisie-date').fill('05.01.2026');
  await page.locator('#saisie-libelle').fill(libelle);
  const deb = page.getByLabel('Compte au débit, ligne 1');
  await deb.fill(debit);
  await deb.press('Tab');
  const cre = page.getByLabel('Compte au crédit, ligne 1');
  await cre.fill(credit);
  await cre.press('Tab');
  await page.getByLabel('Montant, ligne 1').fill(montant);
  await page.getByRole('button', { name: "Valider l'écriture" }).click();
}

test('énoncé papier : bilan d’ouverture saisi, pièces de la feuille, copie corrigée par l’enseignant', async ({ page }) => {
  await nouveauPapier(page);
  await page.getByLabel(/Code de l'exercice/).fill(codeExercice(demoCfc1, 'saisi').toLowerCase());
  await expect(page.getByText(/Exercice reconnu/)).toContainText('Vous saisirez vous-même le bilan d');
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('1CA');
  await page.getByRole('button', { name: 'Créer le dossier' }).click();

  // Bilan d'ouverture : un seul compte de chaque côté suffit pour l'essai (l'écart sera signalé, sans points).
  await expect(page.getByRole('heading', { level: 1, name: "Bilan d'ouverture" })).toBeVisible();
  const a = page.getByLabel('Actif, compte 1');
  await a.fill('1020');
  await a.press('Tab');
  await page.getByLabel('Actif, montant 1').fill('93000');
  const p = page.getByLabel('Passif, compte 1');
  await p.fill('2800');
  await p.press('Tab');
  await page.getByLabel('Passif, montant 1').fill('93000');
  await page.getByLabel('Passif, montant 1').press('Tab');
  await expect(page.getByText('le bilan d’ouverture est équilibré').or(page.getByText("le bilan d'ouverture est équilibré"))).toBeVisible();
  await page.getByRole('button', { name: "Valider l'ouverture et passer au journal" }).click();

  // Journal sans corrigé : pas de panneau d'énoncé, numéro de pièce proposé, doublon signalé.
  await expect(page.getByText(/Énoncé sur papier : le logiciel ne corrige pas/)).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Énoncé' })).toHaveCount(0);
  await expect(page.locator('#saisie-piece')).toHaveValue('1');
  await saisir(page, 'Achat de marchandises à crédit', '4200', '2000', '4800');
  await expect(page.locator('#saisie-piece')).toHaveValue('2');
  await expect(page.getByText('Juste')).toHaveCount(0);
  await page.locator('#saisie-piece').fill('1');
  await expect(page.getByText(/La pièce 1 existe déjà dans le journal/)).toBeVisible();
  await page.locator('#saisie-piece').fill('2');
  await saisir(page, 'Ventes au comptant', '1000', '3200', '12350');

  // Copie exportée, puis « Mes dossiers » la montre comme énoncé papier.
  const telechargement = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter ma copie' }).click();
  const copie = await (await telechargement).path();
  await page.getByRole('button', { name: /^Mes dossiers/ }).first().click();
  await expect(page.locator('.ligne-dossier').filter({ hasText: 'Énoncé sur papier' })).toBeVisible();

  // L'enseignant corrige la copie avec le corrigé de l'exercice.
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Copies', exact: true }).click();
  await page.locator('select').first().selectOption(demoCfc1.id);
  await expect(page.getByText(codeExercice(demoCfc1, 'fourni'))).toBeVisible();
  const choix = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Importer des copies…' }).click();
  await (await choix).setFiles(copie!);
  await expect(page.getByText('1 copie importée.')).toBeVisible();
  await expect(page.getByRole('cell', { name: /Martin/ }).first()).toBeVisible();
  await expect(page.getByText(/Bilan d'ouverture \(non noté\)/)).toBeVisible();
});

test('énoncé papier : avec le code « fourni », le bilan d’ouverture est déjà rempli', async ({ page }) => {
  await nouveauPapier(page);
  await page.getByLabel(/Code de l'exercice/).fill(codeExercice(demoCfc1, 'fourni'));
  await page.getByLabel('Prénom').fill('Noah');
  await page.getByLabel('Nom', { exact: true }).fill('Rossier');
  await page.getByLabel('Classe').fill('1CA');
  await page.getByRole('button', { name: 'Créer le dossier' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Journal' })).toBeVisible();
  await page.getByRole('link', { name: "Bilan d'ouverture" }).click();
  await expect(page.getByText(/rempli par le code de l'exercice/)).toBeVisible();
  await expect(page.getByLabel('Actif, compte 1')).toHaveValue('Caisse');
});
