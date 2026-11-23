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
  await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();
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

test("l'élève supprime une écriture fausse et la saisit à nouveau", async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await saisir(page, 'Essai', '2000', '4200', '4800');
  await expect(page.getByText('À revoir').first()).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Supprimer la pièce 1' }).click();
  await expect(page.getByText("Aucune écriture pour l'instant.")).toBeVisible();
  await saisir(page, 'Achat de marchandises à crédit', '4200', '2000', '4800');
  await expect(page.getByText('Juste').first()).toBeVisible();
});

test('Tab choisit le compte en surbrillance, comme Entrée', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  const deb = page.getByLabel('Compte au débit, ligne 1');
  // Plusieurs comptes correspondent : la flèche désigne le deuxième, Tab le choisit.
  await deb.click();
  await deb.pressSequentially('d');
  const options = page.getByRole('option');
  expect(await options.count()).toBeGreaterThan(1);
  await deb.press('ArrowDown');
  const designe = (await options.nth(1).locator('.nom').textContent())!;
  await deb.press('Tab');
  await expect(deb).toHaveValue(designe);
  await expect(page.getByLabel('Compte au crédit, ligne 1')).toBeFocused();
  // Sans flèche, Tab choisit le premier compte en surbrillance.
  const cre = page.getByLabel('Compte au crédit, ligne 1');
  await cre.pressSequentially('dettes');
  await cre.press('Tab');
  await expect(cre).toHaveValue(/Dettes/);
});

test('une écriture composée se saisit avec le bouton « Ajouter une ligne »', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await page.locator('#saisie-piece').fill('14');
  await page.locator('#saisie-libelle').fill('Achat de marchandises');
  const choisir = async (champ: string, compte: string) => {
    const c = page.getByLabel(champ);
    await c.click();
    await c.pressSequentially(compte);
    await c.press('Tab');
  };
  await choisir('Compte au débit, ligne 1', 'achats de m');
  await page.getByLabel('Montant, ligne 1').fill('3000');
  await page.getByRole('button', { name: 'Ajouter une ligne' }).click();
  await expect(page.getByLabel('Compte au débit, ligne 2')).toBeFocused();
  await choisir('Compte au crédit, ligne 2', 'caisse');
  await page.getByLabel('Montant, ligne 2').fill('1000');
  await page.getByRole('button', { name: 'Ajouter une ligne' }).click();
  await choisir('Compte au crédit, ligne 3', 'dettes f');
  await page.getByLabel('Montant, ligne 3').fill('2000');
  await page.getByLabel('Montant, ligne 3').press('Tab');
  await expect(page.getByText('Écriture équilibrée')).toBeVisible();
  await page.getByRole('button', { name: "Valider l'écriture" }).click();
  await expect(page.getByText('Juste').first()).toBeVisible();
});

test("l'écran Bouclement mène au journal sur la pièce B1 et explique la réouverture", async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#bouclement');
  await expect(page.getByRole('button', { name: "Ouvrir l'exercice comptable 2027" })).toBeDisabled();
  await expect(page.getByText('Disponible quand les écritures de bouclement sont passées au journal.')).toBeVisible();
  await page.getByRole('button', { name: 'Saisir les écritures de bouclement (B1)' }).click();
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await expect(page.locator('#saisie-piece')).toHaveValue('B1');
  await expect(page.locator('#saisie-date')).toHaveValue('31.12.2026');
});

test('le bouclement guide l’élève étape par étape, avec une aide en deux niveaux', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await saisir(page, 'Ventes au comptant', '1000', '3200', '12350');
  await page.goto('./#bouclement');
  await page.getByRole('button', { name: 'Saisir les écritures de bouclement (B1)' }).click();
  await expect(page.getByText('Bouclement, étape 1 sur 2 (B1).')).toBeVisible();
  await expect(page.getByText('La règle :')).toHaveCount(0);
  await page.getByRole('button', { name: "Besoin d'aide ?" }).click();
  await expect(page.getByText('La règle :')).toBeVisible();
  await page.getByRole('button', { name: 'Quels comptes sont concernés ?' }).click();
  await expect(page.locator('.aide-b', { hasText: 'Comptes concernés' })).toContainText('Compte de résultat');
  // Aucun montant dans les aides.
  await expect(page.locator('.aide-b', { hasText: 'Comptes concernés' })).not.toContainText(/\d'\d{3}\.\d{2}|\d+\.\d{2}/);
  // Après B1 (résultat au compte privé), la grille propose B2.
  await saisir(page, 'Bénéfice au privé', '9000', '2850', '12350');
  await expect(page.locator('#saisie-piece')).toHaveValue('B2');
  await expect(page.getByText('Bouclement, étape 2 sur 2 (B2).')).toBeVisible();
});

test("l'élève modifie une écriture fausse : solution dès la 1re erreur, double-clic ou clic dans l'énoncé", async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await saisir(page, 'Achat', '4200', '1000', '4800');
  await expect(page.getByText('À revoir').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voir la solution' })).toBeVisible();
  // Clic sur l'opération 1 dans l'énoncé : l'écriture revient dans la grille.
  await page.locator('.enonce li').first().getByRole('button').click();
  await expect(page.getByRole('button', { name: 'Enregistrer la modification' })).toBeVisible();
  await expect(page.locator('#saisie-libelle')).toHaveValue('Achat');
  await page.getByRole('button', { name: 'Annuler' }).click();
  // Double-clic sur la ligne du journal : même résultat ; on corrige le compte au crédit.
  await page.locator('.journal tbody tr.modifiable').first().dblclick();
  const cre = page.getByLabel('Compte au crédit, ligne 1');
  await cre.fill('2000');
  await cre.press('Tab');
  await page.getByRole('button', { name: 'Enregistrer la modification' }).click();
  await expect(page.getByText('Juste').first()).toBeVisible();
});

test("l'accueil sépare l'entraînement et l'évaluation", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Évaluation', exact: true }).click();
  await expect(page.getByText("Aucune évaluation pour l'instant.")).toBeVisible();
  await page.getByRole('button', { name: 'Entraînement', exact: true }).click();
  await page.getByLabel('Rechercher un exercice').fill('cycles');
  await page.getByText(/Cycles du Léman/).first().click();
  await expect(page.locator('.choisi-texte')).toContainText('Cycles du Léman');
});
