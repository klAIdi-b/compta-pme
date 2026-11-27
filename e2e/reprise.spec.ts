// Reprise d'un travail par fichier (audit du 24.11.2026, action 11) : un élève rouvre sa copie sur un autre poste.
import { expect, test } from '@playwright/test';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { readFileSync } from 'node:fs';
import { lirePlanCsv } from '../src/engine/plan';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { exporterCopie } from '../src/io/fichiers';

const plan = lirePlanCsv(readFileSync(new URL('../src/data/plan-pme.csv', import.meta.url), 'utf8'));

function copie(prenom: string, n: number) {
  let d = creerDossier(demoCfc1, plan);
  for (const [i, c] of demoCfc1.corrige!.slice(0, n).entries()) {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: demoCfc1.debut, piece: c.piece, libelle: `Opération ${c.piece}`, lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
  }
  return Buffer.from(exporterCopie({ eleve: { prenom, nom: 'Martin', classe: '1CFC3' }, exerciceId: demoCfc1.id, exerciceTitre: demoCfc1.titre, mode: demoCfc1.mode, dossier: d, suivi: {} }));
}

async function ouvrirCopie(page: import('@playwright/test').Page, contenu: Buffer) {
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  await page.getByRole('navigation', { name: 'Rubriques' }).getByRole('button', { name: 'Exercices' }).click();
  const choix = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Reprendre ma copie…' }).click();
  await (await choix).setFiles({ name: 'Martin_Lea.compta-copie.json', mimeType: 'application/json', buffer: contenu });
}

test('une copie exportée se rouvre dans un navigateur vide, avec ses écritures', async ({ page }) => {
  await page.goto('./');
  await ouvrirCopie(page, copie('Léa', 3));
  await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();
  await page.getByRole('link', { name: 'Journal' }).click();
  await expect(page.getByText('3 écritures validées')).toBeVisible();
  await expect(page.getByRole('button', { name: /pièces/ })).toContainText('3 / 15');
  // La copie reprise compte comme déjà exportée : pas d'alerte « jamais exportée ».
  await expect(page.getByText(/jamais exportée/i)).toHaveCount(0);
});

test('reprendre la copie d’un autre élève demande de confirmer l’effacement du travail présent', async ({ page }) => {
  await page.goto('./');
  await ouvrirCopie(page, copie('Léa', 2));
  await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();
  await page.getByRole('button', { name: /Changer d'exercice|Accueil/ }).first().click();
  await ouvrirCopie(page, copie('Noé', 1));
  const dialogue = page.getByRole('dialog');
  await expect(dialogue).toContainText('Ce navigateur contient le travail de Léa Martin');
  await dialogue.getByRole('button', { name: 'Annuler' }).click();
  await expect(page.getByRole('heading', { name: /Votre mission/ })).toHaveCount(0);
  await ouvrirCopie(page, copie('Noé', 1));
  await page.getByRole('dialog').getByRole('button', { name: 'Effacer et reprendre la copie' }).click();
  await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();
});

test('une copie modifiée à la main est refusée avec un message clair', async ({ page }) => {
  await page.goto('./');
  const f = JSON.parse(copie('Léa', 1).toString('utf8'));
  f.dossier.ecritures[0].lignes[0].debit = '9999';
  await ouvrirCopie(page, Buffer.from(JSON.stringify(f)));
  await expect(page.getByRole('alert')).toContainText('La copie ne correspond pas à cet exercice');
});
