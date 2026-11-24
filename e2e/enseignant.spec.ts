// Parcours enseignant : création du code (valeur d'essai), onglets, aperçu d'un dossier, relecture.
import { expect, test } from '@playwright/test';

const CODE_ESSAI = 'essai-e2e-4821';

test("l'enseignant ouvre son espace, regarde un dossier en aperçu et revient sur le même onglet", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  for (const o of ['Exercices', 'Dossiers', 'Copies', 'Relecture', 'Paramètres']) {
    await expect(page.getByRole('button', { name: o, exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Dossiers', exact: true }).click();
  await page.getByRole('button', { name: 'Aperçu' }).first().click();
  await expect(page.getByText('Aperçu enseignant.')).toBeVisible();
  // L'aperçu ne mène pas à l'accueil élève : nom du site non cliquable, pas de « Changer d'exercice ».
  await expect(page.getByRole('button', { name: 'Compta PME' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: "Changer d'exercice" })).toHaveCount(0);
  await page.locator('.bandeau-apercu').getByRole('button', { name: "Fermer l'aperçu" }).click();
  await expect(page.getByRole('heading', { name: 'Dossiers de pièces comptables' })).toBeVisible();

  await page.getByRole('button', { name: 'Relecture', exact: true }).click();
  await expect(page.getByText(/0 \/ \d+ éléments validés/)).toBeVisible();
});

test("retirer une opération demande une confirmation, sauf si la ligne est encore vide", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Nouvel exercice' }).click();

  const lignes = page.locator('table.ops tbody tr');
  const avant = await lignes.count();
  await page.getByRole('button', { name: 'Ajouter une opération' }).click();
  await expect(lignes).toHaveCount(avant + 1);
  const ligne = lignes.last();

  // Ligne encore vide : retrait direct.
  await ligne.getByRole('button', { name: /^Retirer l'opération/ }).click();
  await expect(lignes).toHaveCount(avant);

  // Ligne remplie : le premier clic arme le bouton, rien n'est retiré ; le second retire.
  await page.getByRole('button', { name: 'Ajouter une opération' }).click();
  await lignes.last().getByLabel('Texte').fill('Achat de marchandises à crédit');
  await lignes.last().getByRole('button', { name: /^Retirer l'opération/ }).click();
  await expect(lignes).toHaveCount(avant + 1);
  const confirmer = lignes.last().getByRole('button', { name: /^Confirmer/ });
  await expect(confirmer).toHaveText('Confirmer');

  // Le focus part ailleurs : le bouton revient au repos.
  await lignes.last().getByLabel('Texte').focus();
  await expect(lignes.last().getByRole('button', { name: /^Confirmer/ })).toHaveCount(0);

  await lignes.last().getByRole('button', { name: /^Retirer l'opération/ }).click();
  await lignes.last().getByRole('button', { name: /^Confirmer/ }).click();
  await expect(lignes).toHaveCount(avant);
});

test("évaluation formative : aucun retour pendant la saisie, correction et note quand l'élève termine", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Dossiers', exact: true }).click();
  await page.getByRole('button', { name: "Variante d'évaluation" }).first().click();
  await page.locator('#ex-mode').selectOption('formative');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await page.getByRole('button', { name: 'Fermer', exact: true }).click();
  await page.getByRole('row', { name: /variante/i }).getByRole('button', { name: 'Aperçu' }).click();
  await expect(page.getByRole('heading', { name: 'Évaluation formative' })).toBeVisible();
  // Une écriture quelconque : aucun retour pendant la saisie.
  await page.getByRole('link', { name: 'Journal' }).click();
  await page.locator('#saisie-libelle').fill('Essai');
  const deb = page.getByLabel('Compte au débit, ligne 1'); await deb.fill('1000'); await deb.press('Tab');
  const cre = page.getByLabel('Compte au crédit, ligne 1'); await cre.fill('1020'); await cre.press('Tab');
  await page.getByLabel('Montant, ligne 1').fill('100');
  await page.getByRole('button', { name: "Valider l'écriture" }).click();
  await expect(page.getByText('À revoir')).toHaveCount(0);
  // Terminer : note indicative, correction visible, saisie fermée.
  await page.getByRole('link', { name: /Votre mission/ }).click();
  await page.getByRole('button', { name: 'Terminer et voir la correction' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Voir la correction' }).click();
  await expect(page.getByText('Note indicative')).toBeVisible();
  await page.getByRole('button', { name: 'Voir la correction dans le journal' }).click();
  await expect(page.getByText('Évaluation formative terminée')).toBeVisible();
  await expect(page.getByText('À revoir').first()).toBeVisible();
  await expect(page.getByRole('button', { name: "Valider l'écriture" })).toHaveCount(0);
});
