// Phase V3 (maquette validée le 27.11.2026) : distribuer par lien et code QR, recevoir le lien, importer les copies en
// archive ZIP, ajuster les points, rendre les copies, suivre la classe dans un fichier de classe.
import { expect, test, type Page } from '@playwright/test';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { readFileSync } from 'node:fs';
import { lirePlanCsv } from '../src/engine/plan';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { corrigerCopie } from '../src/engine/notation';
import { appliquerAjustements } from '../src/engine/ajustements';
import { exporterCopie, importerCopie } from '../src/io/fichiers';
import { lienExercice } from '../src/io/lien-exercice';
import { creerRetour, exporterRetour } from '../src/io/retour';
import { creerZip } from '../src/io/zip';

const CODE_ESSAI = 'essai-e2e-4821';
const plan = lirePlanCsv(readFileSync('src/data/plan-pme.csv', 'utf-8'));

/** Copie de Léa : toutes les opérations justes sauf la 14 (dette en « Autres dettes »). */
function copieLea() {
  let d = creerDossier(demoCfc1, plan);
  for (const [i, c] of demoCfc1.corrige!.entries()) {
    const lignes = c.piece === '14' ? [{ debit: '4200', credit: null, montant: 300000 }, { debit: null, credit: '1000', montant: 100000 }, { debit: null, credit: '2010', montant: 200000 }] : c.lignes;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: demoCfc1.debut, piece: c.piece, libelle: `Pièce ${c.piece}`, lignes });
    if (r.ok) d = r.valeur;
  }
  return exporterCopie({ eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CA' }, exerciceId: demoCfc1.id, exerciceTitre: demoCfc1.titre, mode: demoCfc1.mode, dossier: d, suivi: {} }, new Date('2026-12-14T15:00:00Z'));
}

async function espaceEnseignant(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
}

test('l’élève ouvre le lien autonome : l’exercice est reçu sans fichier ni liste', async ({ page }) => {
  const lien = await lienExercice('http://localhost:4173/', { ...demoCfc1, id: 'ex-enseignant-1', titre: 'Cycles du Léman · ma version' });
  await page.goto(`./${lien.slice(lien.indexOf('#'))}`);
  await expect(page.getByRole('heading', { name: 'Exercice reçu de votre enseignant' })).toBeVisible();
  await expect(page.getByText('Cycles du Léman · ma version').first()).toBeVisible();
  await expect(page).not.toHaveURL(/#ex=/);
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('1CA');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByRole('heading', { name: /Votre mission/ })).toBeVisible();

  // Un lien abîmé est refusé avec un message clair.
  await page.goto(`./${lien.slice(lien.indexOf('#'), lien.indexOf('#') + 120)}`);
  await page.reload();
  await expect(page.getByText(/Ce lien est incomplet/)).toBeVisible();
});

test('l’enseignant distribue : lien, code QR, fichier, énoncé papier', async ({ page }) => {
  await espaceEnseignant(page);
  // Exercice court (2,1 ko dans un lien) : il tient dans un code QR.
  await page.locator('select').first().selectOption('exercice-cfc3-imprimerie-delices-amortissements');
  await page.getByRole('button', { name: 'Copier cet exemple' }).click();
  // L'éditeur s'ouvre sur la copie : on le ferme pour revenir à la liste des exercices.
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).locator('xpath=preceding-sibling::button[1]').click();
  await page.getByRole('button', { name: 'Distribuer' }).first().click();
  await expect(page.getByRole('heading', { name: /Distribuer · Imprimerie des Délices/ })).toBeVisible();
  await expect(page.getByLabel("Lien de l'exercice")).toHaveValue(/#ex=/);
  await expect(page.getByRole('img', { name: 'Code QR du lien' }).locator('svg')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Télécharger le fichier' })).toBeVisible();
  await page.getByRole('button', { name: 'Évaluation', exact: true }).click();
  await expect(page.getByText(/le corrigé n'est ni dans le lien ni dans le fichier/)).toBeVisible();
});

test('copies en archive ZIP, ajustement des points, fichier de classe, copie rendue à l’élève', async ({ page }) => {
  await espaceEnseignant(page);
  // Classe 1CA : deux élèves dans la liste, une seule copie rendue.
  await page.getByRole('button', { name: 'Ma classe', exact: true }).click();
  await page.getByLabel('Nom de la nouvelle classe').fill('1CA');
  await page.getByRole('button', { name: 'Créer la classe' }).click();
  await page.locator('#liste-classe').fill('Martin\tLéa\nFavre\tChloé');
  await page.getByRole('button', { name: 'Ajouter les élèves' }).click();
  await expect(page.getByText('2 élèves ajoutés.')).toBeVisible();

  await page.getByRole('button', { name: 'Copies', exact: true }).click();
  await page.locator('select').first().selectOption(demoCfc1.id);
  const zip = creerZip([
    { nom: 'Devoir/Martin Lea.compta-copie.json', donnees: new TextEncoder().encode(copieLea()) },
    { nom: 'Devoir/consigne.pdf', donnees: new Uint8Array([37, 80, 68, 70]) },
  ]);
  const choix = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Importer des copies…' }).click();
  await (await choix).setFiles({ name: 'Devoir.zip', mimeType: 'application/zip', buffer: Buffer.from(zip) });
  await expect(page.getByText('1 copie importée.')).toBeVisible();
  await expect(page.getByText('Pas de copie : Favre Chloé.')).toBeVisible();
  await expect(page.getByText(/1 fichier sans copie ignoré/)).toBeVisible();

  // Ajustement : 1,5 point accordé à l'opération 14, avec un commentaire.
  await page.getByRole('button', { name: 'Détail' }).first().click();
  await page.getByLabel('Points accordés, opération 14').fill('1.5');
  await page.getByLabel('Points accordés, opération 14').press('Tab');
  await page.getByLabel('Commentaire, opération 14').fill('Bon découpage.');
  await page.getByLabel('Commentaire, opération 14').press('Tab');
  await expect(page.getByRole('button', { name: /Revenir au calcul/ })).toBeVisible();

  const telechargement = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Rendre les copies (ZIP)' }).click();
  expect((await telechargement).suggestedFilename()).toMatch(/copies-rendues\.zip$/);

  // Ma classe : la note tient compte de l'ajustement ; l'élève sans copie est signalé.
  await page.getByRole('button', { name: 'Ma classe', exact: true }).click();
  await expect(page.getByText('Fichier de classe modifié')).toBeVisible();
  const tableau = page.locator('table.classe');
  await expect(tableau.getByRole('row', { name: /Martin/ })).toContainText('*');
  await expect(tableau.getByRole('row', { name: /Favre/ })).toContainText('Pas rendu');
  await page.getByRole('button', { name: "N'a pas rendu" }).click();
  await expect(tableau.getByRole('row', { name: /Martin/ })).toHaveCount(0);
  const enregistrement = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Enregistrer le fichier de classe' }).click();
  expect((await enregistrement).suggestedFilename()).toBe('1CA.compta-classe.json');
  await expect(page.getByText('Fichier de classe modifié')).toHaveCount(0);
});

test('l’élève ouvre sa copie corrigée : note, statuts et commentaires dans « Votre mission »', async ({ page }) => {
  const copie = importerCopie(copieLea());
  const c = appliquerAjustements(corrigerCopie(demoCfc1, copie.dossier), { '14': { points: 1.5, commentaire: 'Bon découpage.' } });
  const retour = exporterRetour(creerRetour(copie, demoCfc1, c, false));
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('button', { name: 'Comptabilité' }).click();
  const choix = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Ouvrir un fichier…' }).click();
  await (await choix).setFiles({ name: 'Martin_Lea.compta-retour.json', mimeType: 'application/json', buffer: Buffer.from(retour) });
  await expect(page.getByText(/Copie corrigée par votre enseignant/)).toBeVisible();
  await expect(page.getByRole('heading', { name: `Note ${String(c.note).replace('.', ',')}` })).toBeVisible();
  await expect(page.getByText('Commentaire : Bon découpage.')).toBeVisible();
});
