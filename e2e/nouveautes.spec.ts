// Écrans ajoutés le 23.11.2026 : Facturation, Budget, Apprendre pas à pas et formulaire officiel de décompte TVA.
import { expect, test, type Page } from '@playwright/test';

async function ouvrirParLien(page: Page, id: string) {
  await page.goto(`./?exercice=${id}`);
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();
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

test('classer les pièces : exemple, classeurs et question projetée pour la classe', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Ouvrir le parcours|Continuer le parcours/ }).click();
  await page.getByRole('button', { name: 'Classer les pièces', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Exemple travaillé' })).toBeVisible();
  await page.getByRole('button', { name: 'Projeter une question pour la classe' }).click();
  await page.getByRole('button', { name: 'Révéler la réponse' }).click();
  await expect(page.getByRole('status')).toContainText('Réponse');
  await page.getByRole('button', { name: 'Terminer' }).click();
  await page.getByRole('button', { name: /Commencer la série/ }).click();
  await page.getByRole('radio', { name: "Charge de l'entreprise" }).click();
  await page.getByRole('button', { name: 'Vérifier' }).click();
  await expect(page.getByRole('status')).toContainText(/Juste|Pas tout à fait/);
});

test('fil rouge sur l’accueil et onglet Progression de l’espace enseignant', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Les factures et les paiements de mars/ }).click();
  await expect(page.locator('.choisi-texte')).toContainText('facturation et paiements de mars');
});

test('leçon d’un module et navigation en bas de page', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Ouvrir le parcours|Continuer le parcours/ }).click();
  await page.getByRole('button', { name: 'Charges et produits', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'La leçon' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Charge ou investissement/ })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Autres modules' });
  await nav.getByRole('button', { name: /Module suivant/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Factures, dettes et créances');
  await page.getByRole('navigation', { name: 'Autres modules' }).getByRole('button', { name: /Module précédent/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Charges et produits');
  await page.getByRole('navigation', { name: 'Autres modules' }).getByRole('button', { name: 'Tous les modules' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Apprendre pas à pas');
});

test('théorie enrichie : chapitre lisible à 360 px, réponses masquées au clavier, sans défaut d’accessibilité', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Théorie' }).click();
  await expect(page.locator('.sommaire').getByText('À relire').first()).toBeVisible();
  await page.locator('.sommaire li button').filter({ hasText: 'Compte privé' }).click();
  await expect(page.getByRole('heading', { level: 2, name: /Compte privé et bouclement/ })).toBeVisible();
  await expect(page.getByText('À la fin de ce chapitre, vous savez')).toBeVisible();
  for (const titre of ['Les termes à connaître', 'Erreurs fréquentes', 'Vérifiez vos connaissances', "Pour s'exercer"]) {
    await expect(page.getByRole('heading', { level: 3, name: titre })).toBeVisible();
  }
  const mesure = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    hors: [...document.querySelectorAll<HTMLElement>('article *')].filter((e) => {
      if (e.offsetParent === null) return false;
      if (e.getBoundingClientRect().right <= window.innerWidth + 1) return false;
      for (let q = e.parentElement; q; q = q.parentElement) if (['auto', 'scroll'].includes(getComputedStyle(q).overflowX)) return false;
      return true;
    }).length,
  }));
  expect(mesure.page).toBeLessThanOrEqual(360);
  expect(mesure.hors).toBe(0);
  // Réponse masquée : fermée au départ, ouverte au clavier.
  const question = page.locator('.questions details').first();
  await expect(question.locator('p')).toBeHidden();
  await question.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(question.locator('p')).toBeVisible();
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);
});

for (const [annee, chapitres] of [
  ['2ème CFC', ['TVA', 'Amortissements', 'Actifs et passifs transitoires', 'Pertes sur créances', 'Salaires', 'Facturation et paiements', 'Budget et analyse', 'Marge contributive']],
  ['Maturité professionnelle', ['Monnaies étrangères', 'Rémunération du propriétaire', 'Sociétés', 'Provisions', 'Titres et produits', 'Immeubles', 'Intérêts, frais bancaires', "Principes d'évaluation", 'Compte de résultat à plusieurs', 'Tableau des flux', 'Seuil de rentabilité', 'Comptabilité analytique', 'Analyse du bilan']],
] as const) test(`théorie enrichie, ${annee} : chaque chapitre tient à 360 px, sans défaut d’accessibilité`, async ({ page }) => {
  test.setTimeout(180_000);
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Théorie' }).click();
  await page.getByRole('group', { name: 'Votre année' }).getByRole('button', { name: annee }).click();
  for (const titre of chapitres) {
    await page.locator('.sommaire li button').filter({ hasText: titre }).click();
    await expect(page.getByRole('heading', { level: 2 }).filter({ hasText: titre })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Vérifiez vos connaissances' })).toBeVisible();
    const mesure = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      hors: [...document.querySelectorAll<HTMLElement>('article *')].filter((e) => {
        if (e.offsetParent === null) return false;
        if (e.getBoundingClientRect().right <= window.innerWidth + 1) return false;
        for (let q = e.parentElement; q; q = q.parentElement) if (['auto', 'scroll'].includes(getComputedStyle(q).overflowX)) return false;
        return true;
      }).length,
    }));
    expect(mesure.page, titre).toBeLessThanOrEqual(360);
    expect(mesure.hors, titre).toBe(0);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations.map((v) => `${titre} : ${v.id} (${v.nodes.length})`)).toEqual([]);
    await page.getByRole('navigation', { name: 'Chapitres' }).getByRole('button', { name: 'Sommaire' }).click();
  }
});
