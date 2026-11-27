// Phase V4 (maquette validée le 27.11.2026) : saisie rapide, recherche et filtres, dupliquer, historique, modèles
// d'écritures, palette de commandes.
import { expect, test, type Page } from '@playwright/test';

async function commencer(page: Page) {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Exercices' }).click();
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('1CA');
  await page.getByLabel('Rechercher un exercice').fill('cycles');
  await page.locator('#choisir-exercice').getByText(/Cycles du Léman — premier trimestre/).first().click();
  await page.getByRole('button', { name: 'Commencer' }).click();
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
}

async function ligne(page: Page, n: number, debit: string, credit: string, montant: string) {
  if (debit) {
    const d = page.getByLabel(`Compte au débit, ligne ${n}`);
    await d.fill(debit);
    await d.press('Tab');
  }
  if (credit) {
    const c = page.getByLabel(`Compte au crédit, ligne ${n}`);
    await c.fill(credit);
    await c.press('Tab');
  }
  if (montant) await page.getByLabel(`Montant, ligne ${n}`).fill(montant);
}

test('saisie rapide : journal au-dessus, verdict sur la ligne, pièce suivante, différence proposée', async ({ page }) => {
  await commencer(page);
  await page.getByRole('button', { name: 'Saisie rapide' }).click();
  await expect(page.getByRole('button', { name: 'Saisie rapide' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#saisie-libelle').fill('Achat de marchandises à crédit');
  await ligne(page, 1, '4200', '2000', '4800');
  await page.getByLabel('Montant, ligne 1').press('Enter');
  // Le verdict est sur la ligne de la pièce, dans le journal ; la grille propose la pièce suivante.
  await expect(page.locator('table.journal').getByText('Juste')).toBeVisible();
  await expect(page.locator('#saisie-piece')).toHaveValue('2');
  // Écriture composée : la ligne suivante propose la différence.
  await page.locator('#saisie-piece').fill('14');
  await page.locator('#saisie-libelle').fill('Achat de marchandises');
  await ligne(page, 1, '4200', '', '3000');
  await page.getByLabel('Montant, ligne 1').press('Enter');
  await ligne(page, 2, '', '1000', '');
  await page.getByLabel('Montant, ligne 2').fill('1000');
  await page.getByLabel('Montant, ligne 2').press('Enter');
  await expect(page.getByLabel('Montant, ligne 3')).toHaveValue("2'000.00");
  // Le choix est mémorisé : après un rechargement, la saisie rapide reste choisie.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Saisie rapide' })).toHaveAttribute('aria-pressed', 'true');
  // Sur téléphone, la saisie guidée est toujours utilisée.
  await page.setViewportSize({ width: 360, height: 740 });
  await expect(page.getByRole('button', { name: 'Saisie rapide' })).toBeHidden();
});

test('recherche, dupliquer, historique d’une écriture modifiée, modèles, palette de commandes', async ({ page }) => {
  await commencer(page);
  for (const [piece, libelle, d, c, mt] of [
    ['1', 'Achat de marchandises à crédit', '4200', '2000', '4800'],
    ['4', 'Versement de la caisse en banque', '1020', '1000', '9000'],
    ['5', 'Loyer de janvier', '6000', '1020', '1850'],
  ] as const) {
    await page.locator('#saisie-piece').fill(piece);
    await page.locator('#saisie-libelle').fill(libelle);
    await ligne(page, 1, d, c, mt);
    await page.getByRole('button', { name: "Valider l'écriture" }).click();
  }
  // Recherche : par compte, puis par montant.
  await page.getByLabel('Rechercher dans le journal').fill('banque');
  await expect(page.getByText('2 écritures trouvées')).toBeVisible();
  await page.getByLabel('Rechercher dans le journal').fill("1'850");
  await expect(page.getByText('1 écriture trouvée')).toBeVisible();
  await page.getByRole('button', { name: 'Effacer les filtres' }).click();

  // Historique : la pièce 5 est modifiée (montant), puis son historique est déplié.
  await page.getByRole('button', { name: 'Modifier la pièce 5' }).click();
  await page.getByLabel('Montant, ligne 1').fill('1580');
  await page.getByRole('button', { name: 'Enregistrer la modification' }).click();
  await page.getByRole('button', { name: 'Autres actions pour la pièce 5' }).click();
  await page.getByRole('button', { name: 'Historique de la pièce 5' }).click();
  await expect(page.getByText(/Loyers : 1'850.00 → 1'580.00/)).toBeVisible();

  // Dupliquer : l'écriture revient dans la grille.
  await page.getByRole('button', { name: 'Autres actions pour la pièce 4' }).click();
  await page.getByRole('button', { name: 'Dupliquer la pièce 4' }).click();
  await expect(page.locator('#saisie-libelle')).toHaveValue('Versement de la caisse en banque');
  await expect(page.getByLabel('Compte au débit, ligne 1')).toHaveValue('Banque (n/avoir)');

  // Modèle : enregistré depuis la grille, puis inséré.
  await page.getByRole('button', { name: 'Enregistrer comme modèle' }).click();
  await page.getByLabel('Nom du modèle').fill('Versement en banque');
  await page.getByRole('button', { name: 'Enregistrer le modèle' }).click();
  await page.getByRole('button', { name: 'Annuler' }).first().click();
  await page.getByRole('button', { name: 'Insérer un modèle' }).click();
  await page.getByRole('region', { name: "Vos modèles d'écritures" }).getByRole('button', { name: 'Insérer' }).click();
  await expect(page.getByLabel('Compte au crédit, ligne 1')).toHaveValue('Caisse');

  // Palette de commandes : Ctrl + K, « bilan », Entrée.
  await page.keyboard.press('Control+k');
  await page.getByLabel('Rechercher une commande').fill('bilan');
  await page.getByLabel('Rechercher une commande').press('Enter');
  await expect(page).toHaveURL(/#bilan/);
});
