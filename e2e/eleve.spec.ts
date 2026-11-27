// Parcours élève : accueil, démarrage, saisie d'une écriture juste et d'une fausse, avancement, reprise.
import { expect, test } from '@playwright/test';

async function commencer(page: import('@playwright/test').Page, recherche: string, titre: RegExp) {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Exercices' }).click();
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill(recherche);
  await page.locator('#choisir-exercice').getByText(titre).first().click();
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
  // Bilan en direct après une écriture juste : la perte n'est comptée qu'une fois, les deux totaux sont égaux.
  const vivant = page.locator('.bilan-vivant');
  await expect(vivant.locator('summary')).toContainText("Actif 97'800.00 · Passif 97'800.00");
  await expect(vivant.locator('.bloc.perte')).toHaveCount(1);
  await expect(vivant.locator('.bloc.perte')).toContainText('Perte provisoire');
  await expect(vivant.locator('.effet')).toContainText("Achats de marchandises (charge) +4'800.00 · Dettes fournisseurs (passif) +4'800.00.");
  await expect(vivant.locator('.effet')).toContainText("Le résultat diminue de 4'800.00 : il passe d'un résultat nul à une perte provisoire de 4'800.00.");
  await expect(vivant).not.toContainText("n'est plus équilibré");

  // Opération 2 volontairement fausse (comptes inversés) : indice et lien vers la théorie.
  await saisir(page, 'Essai', '2000', '4200', '4800');
  await page.getByRole('button', { name: /pièces/ }).click();
  await expect(page.getByRole('dialog', { name: 'Récapitulatif des pièces' })).toBeVisible();

  // Retour à l'accueil par le nom du site, sans rien perdre, puis reprise.
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Compta PME' }).click();
  await expect(page.getByRole('heading', { name: 'Bon retour, Léa' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Exercices' }).click();
  await expect(page.locator('#choisir-exercice').getByText(/En cours · 2 \/ 15/)).toBeVisible();
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Accueil' }).click();
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
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Exercices' }).click();
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill('outils');
  await page.locator('#choisir-exercice').getByText(/Outils & Cie/).first().click();
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
  await page.getByRole('button', { name: 'Autres actions pour la pièce 1' }).click();
  await page.getByRole('button', { name: 'Supprimer la pièce 1' }).click();
  // Dialogue du logiciel : Échap annule, le bouton nommé confirme.
  const boite = page.getByRole('dialog', { name: /Supprimer la pièce 1/ });
  await expect(boite.getByRole('button', { name: 'Annuler' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(boite).toBeHidden();
  await expect(page.getByText('À revoir').first()).toBeVisible();
  await page.getByRole('button', { name: 'Supprimer la pièce 1' }).click();
  await boite.getByRole('button', { name: "Supprimer l'écriture" }).click();
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
  // Phase V5 : la réouverture se fait depuis « Clôture de l'exercice », disponible une fois le bouclement passé.
  await page.goto('./#bouclement');
  await page.getByRole('button', { name: "Clôture de l'exercice" }).click();
  await expect(page.getByRole('button', { name: "Clôturer et ouvrir l'exercice 2027" })).toBeDisabled();
  await expect(page.getByText('Disponible quand les écritures de bouclement sont passées au journal.')).toBeVisible();
  await page.goto('./#bouclement');
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
  const rubriques = page.getByRole('navigation', { name: 'Rubriques' });
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  await rubriques.getByRole('button', { name: 'Évaluation' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Faire une évaluation' })).toBeVisible();
  await expect(page.getByText("Aucune évaluation pour l'instant.")).toBeVisible();
  await rubriques.getByRole('button', { name: 'Exercices' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Choisir un exercice' })).toBeVisible();
  await page.getByLabel('Rechercher un exercice').fill('cycles');
  await page.locator('#choisir-exercice').getByText(/Cycles du Léman/).first().click();
  await expect(page.locator('.choisi-texte')).toContainText('Cycles du Léman');
});

test('journal : le verdict s’affiche sous la saisie et le bouton grisé dit pourquoi', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  const raison = page.locator('#raison-validation');
  await expect(raison).toContainText('Choisissez les comptes');
  const deb = page.getByLabel('Compte au débit, ligne 1');
  await deb.fill('4200');
  await deb.press('Tab');
  await expect(raison).toContainText('Indiquez le montant');
  await page.getByLabel('Montant, ligne 1').fill('4800');
  await expect(raison).toContainText('il manque 4\'800.00 au crédit');
  await expect(page.getByRole('button', { name: "Valider l'écriture" })).toBeDisabled();
  // Écriture fausse (comptes inversés) : verdict sous la saisie, avec le bouton pour corriger.
  await saisir(page, 'Achat', '2000', '4200', '4800');
  const verdict = page.locator('.verdict');
  await expect(verdict).toContainText('Opération 1 : à revoir');
  await verdict.getByRole('button', { name: "Corriger l'écriture" }).click();
  await expect(page.getByRole('heading', { name: 'Modification de la pièce 1' })).toBeVisible();
  const debit = page.getByLabel('Compte au débit, ligne 1');
  await debit.fill('4200');
  await debit.press('Tab');
  const credit = page.getByLabel('Compte au crédit, ligne 1');
  await credit.fill('2000');
  await credit.press('Tab');
  await page.getByRole('button', { name: 'Enregistrer la modification' }).click();
  await expect(verdict).toContainText('Juste');
});

test('téléphone (360 px) : le journal ne déborde pas et les écritures sont en fiches', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await saisir(page, 'Achat de marchandises à crédit', '4200', '2000', '4800');
  await page.setViewportSize({ width: 360, height: 740 });
  await page.waitForTimeout(200);
  const mesure = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    zones: [...document.querySelectorAll<HTMLElement>('main *')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible').map((e) => e.className),
    droite: Math.max(...[...document.querySelectorAll<HTMLElement>('main *')].filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect().right)),
  }));
  expect(mesure.page).toBeLessThanOrEqual(360);
  expect(mesure.droite).toBeLessThanOrEqual(361);
  await expect(page.getByText('Dettes fournisseurs').first()).toBeVisible();
});

test('téléphone (360 px) : bilan, résultat, balance, comptes et grand livre sans débordement', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await saisir(page, 'Achat de marchandises à crédit', '4200', '2000', '4800');
  await page.setViewportSize({ width: 360, height: 740 });
  for (const vue of ['bilan', 'resultat', 'balance', 'comptes', 'grandlivre']) {
    await page.goto(`./#${vue}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const mesure = await page.evaluate(() => {
      const main = document.querySelector('main')!;
      const visibles = [...main.querySelectorAll<HTMLElement>('*')].filter((e) => e.offsetParent !== null);
      return {
        droite: Math.max(...visibles.map((e) => e.getBoundingClientRect().right)),
        coupes: visibles.filter((e) => e.clientWidth > 1 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'hidden' && getComputedStyle(e).textOverflow !== 'ellipsis').length,
      };
    });
    expect(mesure.droite, vue).toBeLessThanOrEqual(361);
    expect(mesure.coupes, vue).toBe(0);
  }
  // Bilan : l'intitulé et le montant d'un poste ne se chevauchent pas.
  await page.goto('./#bilan');
  const chevauchements = await page.evaluate(() =>
    [...document.querySelectorAll('.poste')].filter((p) => {
      const lib = p.querySelector('.lib')?.getBoundingClientRect();
      const mt = [...p.querySelectorAll('.montant')].find((x) => x.textContent!.trim())?.getBoundingClientRect();
      return lib && mt && lib.width > 0 && lib.right > mt.left + 1 && lib.bottom > mt.top && mt.bottom > lib.top;
    }).length,
  );
  expect(chevauchements).toBe(0);
});

test('téléphone : le menu se ferme avec Échap, rend le focus, et la liste des exercices reste repliée à l’accueil', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./#journal');
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  const menu = page.getByRole('button', { name: 'Menu' });
  const nav = page.getByRole('navigation', { name: 'Navigation' });
  // Fermé : la navigation n'est pas atteignable.
  await expect(nav).toBeHidden();
  await menu.click();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: /Journal/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(menu).toBeFocused();
  // Cibles : aucun bouton, lien ou champ visible de moins de 24 px.
  const petits = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('main button, main a, main input, main select, main summary, header button')]
      .filter((e) => e.offsetParent !== null)
      .map((e) => ({ n: (e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30), r: e.getBoundingClientRect() }))
      .filter((x) => x.r.height < 24 || x.r.width < 24)
      .map((x) => `${x.n} ${Math.round(x.r.width)}×${Math.round(x.r.height)}`),
  );
  expect(petits).toEqual([]);
  // Accueil avec un travail en cours : « Reprendre » est tout de suite visible.
  await menu.click();
  await page.keyboard.press('Escape');
  await page.getByTitle("Retour à la page d'accueil").click();
  await expect(page.getByRole('button', { name: 'Reprendre' }).first()).toBeVisible();
  // La liste des exercices n'est plus sur l'accueil : la page reste courte, la liste a sa propre page.
  await expect(page.getByLabel('Rechercher un exercice')).toHaveCount(0);
  const hauteur = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(hauteur).toBeLessThan(2400);
  // Un élève qui a déjà commencé : « Tenir une comptabilité » ouvre « Mes dossiers », où son exercice l'attend.
  await page.getByRole('button', { name: /Tenir une comptabilité/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mes dossiers' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ouvrir Cycles du Léman' })).toBeVisible();
  // Le bouton Retour du navigateur ramène à l'accueil.
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Bon retour, Léa.' })).toBeVisible();
});

test('une écriture saisie sous un numéro de pièce qui n’est pas une opération est signalée à l’élève', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.getByRole('button', { name: /Commencer la saisie|Continuer la saisie/ }).click();
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  await expect(page.locator('.hors-enonce')).toHaveCount(0);
  await page.locator('#saisie-piece').fill('3a');
  await saisir(page, 'Vente', '1020', '3200', '6400');
  const alerte = page.locator('.hors-enonce');
  await expect(alerte).toContainText('Pièce 3a : ce numéro ne correspond à aucune opération');
  // Une écriture rattachée à une opération ne déclenche rien de plus.
  await page.locator('#saisie-piece').fill('1');
  await saisir(page, 'Achat de marchandises à crédit', '4200', '2000', '4800');
  await expect(alerte).toContainText('Pièce 3a');
  await expect(alerte).not.toContainText('Pièces');
});

for (const [largeur, hauteur] of [[1440, 900], [360, 740]] as const) {
  test(`après « Valider », le verdict est à l’écran sans défiler (${largeur} × ${hauteur})`, async ({ page }) => {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await commencer(page, 'cycles', /Cycles du Léman/);
    await page.getByRole('button', { name: /Commencer la saisie|Continuer la saisie/ }).click();
    const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
    if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
    for (const [libelle, debit, credit, montant, attendu] of [
      ['Achat de marchandises à crédit', '4200', '2000', '4800', 'Juste'],
      ['Essai', '2000', '1020', '100', 'à revoir'],
    ] as const) {
      await saisir(page, libelle, debit, credit, montant);
      const message = page.locator('.verdict .message').first();
      await expect(message).toContainText(attendu);
      if (attendu === 'Juste') await expect(message).toContainText('écriture correcte. Passez');
      const boite = (await message.boundingBox())!;
      // Le haut du message et sa première ligne sont dans la fenêtre.
      expect(boite.y, `${libelle} : haut du verdict`).toBeGreaterThanOrEqual(0);
      expect(boite.y + 24, `${libelle} : verdict sous la ligne de flottaison`).toBeLessThanOrEqual(hauteur);
    }
    // Le curseur est prêt pour l'écriture suivante.
    await expect(page.locator('#saisie-libelle')).toBeFocused();
  });
}

test('une écriture juste trouvée après « Voir la solution » est signalée comme telle', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.getByRole('button', { name: /Commencer la saisie|Continuer la saisie/ }).click();
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();
  // Opération 1 fausse (côtés inversés), puis la solution, puis la correction.
  await saisir(page, 'Achat', '2000', '4200', '4800');
  await page.getByRole('button', { name: 'Voir la solution' }).first().click();
  // Sous la solution, le raisonnement en trois questions.
  const raisonnement = page.locator('.verdict .solution-detail .raisonnement').first();
  await expect(raisonnement).toContainText('Comptes touchés : Achats de marchandises et Dettes fournisseurs.');
  await expect(raisonnement).toContainText('compte de charge, il augmente');
  await page.getByRole('button', { name: "Corriger l'écriture" }).first().click();
  const deb = page.getByLabel('Compte au débit, ligne 1');
  await deb.fill('4200');
  await deb.press('Tab');
  const cre = page.getByLabel('Compte au crédit, ligne 1');
  await cre.fill('2000');
  await cre.press('Tab');
  await page.getByRole('button', { name: 'Enregistrer la modification' }).click();
  await expect(page.locator('.verdict .message')).toContainText('Juste avec la solution.');
  await expect(page.locator('.statut.juste-solution').first()).toContainText('Juste avec la solution');
  // L'en-tête le dit aussi.
  await page.getByRole('button', { name: /pièces/ }).click();
  await expect(page.getByRole('dialog', { name: 'Récapitulatif des pièces' })).toContainText('dont 1 avec la solution');
});


test('la solution se masque pendant que l’élève corrige, puis se revoit à la demande', async ({ page }) => {
  await commencer(page, 'cycles', /Cycles du Léman/);
  await page.getByRole('button', { name: /Commencer la saisie|Continuer la saisie/ }).click();
  const fermerVisite = page.getByRole('button', { name: /Passer|Fermer la visite|Terminer/ });
  if (await fermerVisite.first().isVisible().catch(() => false)) await fermerVisite.first().click();

  await saisir(page, 'Achat de marchandises', '4200', '1020', '4800');
  const verdict = page.locator('.verdict');
  await verdict.getByRole('button', { name: 'Voir la solution' }).click();
  await expect(verdict.getByText("Solution de l'opération 1 :")).toBeVisible();
  // L'élève corrige : la solution se cache pour qu'il retrouve l'écriture de mémoire.
  await verdict.getByRole('button', { name: "Corriger l'écriture" }).click();
  await expect(verdict.getByText('Solution masquée pendant votre correction')).toBeVisible();
  await expect(verdict.getByText("Solution de l'opération 1 :")).toBeHidden();
  await verdict.getByRole('button', { name: 'Revoir la solution' }).click();
  await expect(verdict.getByText("Solution de l'opération 1 :")).toBeVisible();
});
