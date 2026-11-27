// Phase V5 (maquette validée le 27.11.2026) : clôture guidée, ouverture de l'année suivante, bilan d'ouverture reporté,
// consultation de l'année clôturée, copie rendue = exercice de l'énoncé.
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { boucler } from '../src/engine/closing';
import { lirePlanCsv } from '../src/engine/plan';

const plan = lirePlanCsv(readFileSync('src/data/plan-pme.csv', 'utf-8'));

/** Session enregistrée : Cycles du Léman, 15 opérations justes, bouclé. */
function session() {
  let d = creerDossier(demoCfc1, plan);
  for (const [i, c] of demoCfc1.corrige!.entries()) {
    const op = demoCfc1.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: op.texte.slice(0, 40), lignes: c.lignes });
    if (r.ok) d = r.valeur;
  }
  const b = boucler(d);
  if (!b.ok) throw new Error(b.erreurs.join(' '));
  return {
    session: { eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CA' }, exercice: demoCfc1, dossier: b.valeur, archives: [], suivi: {}, role: 'eleve', fiches: {}, derniereActivite: '2026-12-14T09:00:00.000Z' },
    autres: {},
    prefs: { visiteVue: true, numerosComptes: true },
  };
}

test('clôturer, ouvrir 2027, voir le report, consulter 2026, rendre la copie de l’énoncé', async ({ page }) => {
  const s = session();
  await page.addInitScript((v) => {
    if (!localStorage.getItem('compta-pme:v1')) localStorage.setItem('compta-pme:v1', v);
  }, JSON.stringify(s));
  await page.goto('./#cloture');
  await expect(page.getByRole('heading', { level: 1, name: "Clôture de l'exercice 2026" })).toBeVisible();
  await expect(page.getByText('15 sur 15 saisies')).toBeVisible();
  await expect(page.getByText('écritures de bouclement passées')).toBeVisible();
  await page.getByRole('button', { name: "Clôturer et ouvrir l'exercice 2027" }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clôturer et ouvrir 2027' }).click();

  // Report : bilan d'ouverture au 01.01.2027, capital de 58'130.00, total de 93'380.00.
  await expect(page.getByRole('heading', { name: "Bilan d'ouverture au 01.01.2027" })).toBeVisible();
  await expect(page.getByRole('row', { name: /Capital/ })).toContainText("58'130.00");
  await expect(page.locator('.report-table tfoot')).toContainText("93'380.00");

  // Consultation de 2026 en lecture seule, puis retour à 2027.
  await page.getByLabel('Exercice comptable').selectOption('2026-01-01');
  await page.getByRole('link', { name: 'Journal' }).click();
  await expect(page.getByText(/Exercice 2026 clôturé\. Vous le consultez/)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Nouvelle écriture' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Revenir à 2027' }).click();
  await expect(page.getByRole('region', { name: 'Nouvelle écriture' })).toBeVisible();

  // La copie rendue est l'exercice de l'énoncé (2026), avec 2027 en plus.
  const telechargement = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter ma copie' }).click();
  const copie = JSON.parse(readFileSync((await (await telechargement).path())!, 'utf-8'));
  expect(copie.dossier.debut).toBe('2026-01-01');
  expect(copie.dossier.ecritures).toHaveLength(17);
  expect(copie.annees.map((a: { debut: string }) => a.debut)).toEqual(['2027-01-01']);

  // Annuler l'ouverture tant que 2027 est vide.
  await page.getByRole('link', { name: "Clôture de l'exercice" }).click();
  await page.getByRole('button', { name: "Annuler l'ouverture" }).click();
  await page.getByRole('dialog').getByRole('button', { name: "Annuler l'ouverture" }).click();
  await expect(page.getByRole('heading', { level: 1, name: "Clôture de l'exercice 2026" })).toBeVisible();
  await expect(page.getByLabel('Exercice comptable')).toHaveCount(0);
});
