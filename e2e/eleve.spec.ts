// Parcours élève : accueil, démarrage, saisie d'une écriture juste et d'une fausse, avancement, reprise.
import { expect, test } from '@playwright/test';

async function commencer(page: import('@playwright/test').Page, recherche: string, titre: RegExp) {
  await page.goto('./');
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill(recherche);
  await page.getByText(titre).first().click();
  await page.getByRole('button', { name: 'Commencer' }).click();
}

/** Saisit une écriture simple au clavier, les comptes par leur numéro (accepté sans être mis en avant). */
async function saisir(page: import('@playwright/test').Page, libelle: string, debit: string, credit: string, montant: string) {
  await page.locator('#saisie-libelle').fill(libelle);
  const deb = page.getByLabel('Compte au débit, ligne 1');
  await deb.fill(debit);
  await deb.press('Tab');
  const cre = page.getByLabel('Compte au crédit, ligne 1');
  await cre.fill(credit);
  await cre.press('Tab');
  const mt = page.getByLabel('Montant, ligne 1');
  await mt.fill(montant);
  await page.getByRole('button', { name: "Valider l'écriture" }).click();
}

test('un élève comptabilise, voit le retour et son avancement, puis reprend son travail', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();
  await page.getByRole('button', { name: /Commencer la saisie|Continuer la saisie/ }).click();
  // La visite guidée peut s'ouvrir la première fois.
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();

  await saisir(page, 'Achat de marchandises à crédit', '4200', '2000', '4800');
  await expect(page.getByText('Juste').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /1 \/ 15 pièces/ })).toBeVisible();

  // Opération 2 volontairement fausse (comptes inversés) : indice et lien vers la théorie.
  await saisir(page, 'Essai', '2000', '4200', '4800');
  await page.getByRole('button', { name: /pièces/ }).click();
  await expect(page.getByRole('dialog', { name: 'Récapitulatif des pièces' })).toBeVisible();

  // Retour à l'accueil par le nom du site, sans rien perdre, puis reprise.
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Compta PME' }).click();
  await expect(page.getByRole('heading', { name: 'Bon retour, Léa' })).toBeVisible();
  await expect(page.getByText(/En cours · 2 \/ 15/)).toBeVisible();
  await page.getByRole('button', { name: 'Reprendre' }).first().click();
  // L'élève retrouve la rubrique qu'il avait quittée.
  await expect(page.getByRole('heading', { name: 'Journal' })).toBeVisible();
});

test('la tablette en paysage affiche le journal sans débordement', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await commencer(page, 'outils', /Outils & Cie/);
  await page.goto('./#journal');
  await expect(page.getByText('FACTURE').first()).toBeVisible();
  const deborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(deborde).toBe(false);
  const libelle = await page.locator('#saisie-libelle').boundingBox();
  expect(libelle!.width).toBeGreaterThan(120);
});

test('la liste des comptes se manipule entièrement à la souris', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await page.getByLabel('Compte au débit, ligne 1').click();
  const liste = page.getByRole('listbox');
  await expect(liste).toBeVisible();
  // La liste n'est pas coupée par la carte de saisie : elle montre une dizaine de comptes au moins.
  const boite = await liste.boundingBox();
  expect(boite!.height).toBeGreaterThan(300);
  // Un clic dans la liste hors d'un compte (titre de classe, barre de défilement) ne la ferme pas.
  await liste.getByText(/Classe 1/).click();
  await expect(liste).toBeVisible();
  // La molette fait défiler la liste, qui reste ouverte ; on choisit ensuite un compte à la souris.
  await liste.hover();
  await page.mouse.wheel(0, 600);
  await expect(liste).toBeVisible();
  await liste.getByRole('option', { name: /Achats de marchandises/ }).click();
  await expect(page.getByLabel('Compte au débit, ligne 1')).toHaveValue('Achats de marchandises');
});

test('Échap ferme le récapitulatif des pièces et rend le focus au bouton', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill('outils');
  await page.getByText(/Outils & Cie/).first().click();
  await page.getByRole('button', { name: 'Commencer' }).click();
  const declencheur = page.locator('.avancement .declencheur');
  await declencheur.click();
  await expect(page.getByRole('dialog', { name: 'Récapitulatif des pièces' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Récapitulatif des pièces' })).toHaveCount(0);
  await expect(declencheur).toBeFocused();
});
