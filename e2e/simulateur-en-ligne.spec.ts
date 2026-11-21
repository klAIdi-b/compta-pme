// Simulateur en ligne (phase S5) : enseignant et groupe sur deux pages, contre un faux service Supabase.
// Le faux service reproduit les règles de `supabase/schema.sql` utiles au parcours (codes, empreintes, tour en cours).
import { createHash } from 'node:crypto';
import { expect, test, type BrowserContext, type Route } from '@playwright/test';

const CODE_ESSAI = 'essai-e2e-4821';
const SERVICE = 'https://exemple.supabase.co';
// Clé publique factice au format JWT (rôle « anon »).
const CLE = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url')}.signature-factice`;
const sha = (t: string) => createHash('sha256').update(t.toUpperCase()).digest('hex');

interface Base {
  partie: { id: string; code: string; numero_tour: number; termine: boolean } | null;
  equipes: { entreprise_id: string; nom: string; code_hash: string }[];
  situations: Map<string, unknown>;
  decisions: Map<string, { entreprise_id: string; numero_tour: number; decisions: unknown }>;
  resultats: unknown;
  liensEnvoyes: string[];
}

async function fauxService(context: BrowserContext): Promise<Base> {
  const b: Base = { partie: null, equipes: [], situations: new Map(), decisions: new Map(), resultats: null, liensEnvoyes: [] };
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
  const json = (route: Route, status: number, corps: unknown) =>
    route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: corps === null ? '' : JSON.stringify(corps) });
  const equipe = (code: string, codeEquipe: string) =>
    b.partie && b.partie.code === code.toUpperCase() && !b.partie.termine ? b.equipes.find((e) => e.code_hash === sha(codeEquipe)) : undefined;

  await context.route(`${SERVICE}/**`, async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const url = new URL(req.url());
    const corps = req.postData() ? JSON.parse(req.postData()!) : null;
    const chemin = url.pathname;
    if (chemin === '/auth/v1/otp') {
      b.liensEnvoyes.push(corps.email);
      return json(route, 200, {});
    }
    if (chemin.startsWith('/rest/v1/rpc/')) {
      const eq = equipe(corps.p_code, corps.p_code_equipe);
      if (!eq) return json(route, 400, { message: "Code de partie ou code d'équipe incorrect." });
      const fn = chemin.split('/').pop();
      if (fn === 'rejoindre_partie') {
        return json(route, 200, { entrepriseId: eq.entreprise_id, numeroTour: b.partie!.numero_tour, situation: b.situations.get(eq.entreprise_id) ?? null });
      }
      if (fn === 'deposer_decisions') {
        if (corps.p_tour !== b.partie!.numero_tour) return json(route, 400, { message: 'Ce tour est déjà calculé : rechargez votre situation.' });
        b.decisions.set(`${eq.entreprise_id}|${corps.p_tour}`, { entreprise_id: eq.entreprise_id, numero_tour: corps.p_tour, decisions: corps.p_decisions });
        return json(route, 204, null);
      }
      if (fn === 'lire_resultats') return json(route, 200, b.resultats);
    }
    // Tables : réservées à l'enseignant connecté.
    if (req.headers()['authorization'] !== 'Bearer jeton-enseignant') return json(route, 401, { message: 'JWT invalide' });
    if (chemin === '/rest/v1/sim_parties' && req.method() === 'POST') {
      b.partie = { id: 'uuid-partie', code: corps.code, numero_tour: 1, termine: false };
      return json(route, 201, [{ id: 'uuid-partie' }]);
    }
    if (chemin === '/rest/v1/sim_parties' && req.method() === 'PATCH') {
      Object.assign(b.partie!, corps);
      return json(route, 204, null);
    }
    if (chemin === '/rest/v1/sim_equipes') {
      b.equipes = corps;
      return json(route, 201, null);
    }
    if (chemin === '/rest/v1/sim_situations') {
      for (const s of corps) b.situations.set(s.entreprise_id, s.situation);
      return json(route, 201, null);
    }
    if (chemin === '/rest/v1/sim_resultats') {
      b.resultats = corps.tableau;
      return json(route, 201, null);
    }
    if (chemin === '/rest/v1/sim_decisions') {
      const tour = Number(url.searchParams.get('numero_tour')!.replace('eq.', ''));
      return json(route, 200, [...b.decisions.values()].filter((d) => d.numero_tour === tour));
    }
    return json(route, 404, { message: 'inconnu' });
  });
  return b;
}

test("partie en ligne : l'enseignant met la partie en ligne, un groupe décide depuis son poste, les décisions arrivent", async ({ page, context }) => {
  const base = await fauxService(context);
  const entrer = async () => {
    await page.getByRole('button', { name: 'Espace enseignant' }).click();
    const confirmer = page.getByLabel('Confirmer le code');
    await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
    if (await confirmer.isVisible()) await confirmer.fill(CODE_ESSAI);
    await page.getByRole('button', { name: 'Entrer' }).click();
    await page.getByRole('button', { name: 'Simulateur', exact: true }).click();
  };

  // Création de la partie, configuration du service.
  await page.goto('./');
  await entrer();
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await page.getByLabel('Nom de la partie').fill('En ligne essai');
  await page.getByText('Éclair · 2 à 3 séances').click();
  await page.getByLabel("Nom de l'entreprise 1").fill('Les Lémaniques');
  await page.getByLabel("Nom de l'entreprise 2").fill('Rhône Express');
  await page.getByRole('button', { name: 'Créer la partie' }).click();
  await page.getByLabel('Adresse du projet').fill(SERVICE);
  await page.getByLabel('Clé publique (anon public)').fill(CLE);
  await page.getByRole('button', { name: 'Enregistrer' }).click();

  // Connexion : demande du lien, puis retour du lien (jetons dans l'adresse, nettoyée au démarrage).
  await page.getByLabel('Votre adresse e-mail professionnelle').fill('enseignant@exemple.ch');
  await page.getByRole('button', { name: 'Recevoir le lien de connexion' }).click();
  await expect(page.getByText(/Un lien de connexion a été envoyé/)).toBeVisible();
  expect(base.liensEnvoyes).toEqual(['enseignant@exemple.ch']);
  await page.goto('about:blank'); // comme un vrai retour de lien : nouvelle ouverture du site
  await page.goto('./#access_token=jeton-enseignant&refresh_token=renouvellement&expires_in=3600');
  await expect(page).not.toHaveURL(/access_token/);
  await entrer();
  await page.getByRole('button', { name: 'Ouvrir' }).first().click();
  await expect(page.getByText('Vous êtes connecté au service en ligne.')).toBeVisible();

  // Mise en ligne : code de partie, codes d'équipe (seules leurs empreintes partent en ligne).
  await page.getByRole('button', { name: 'Mettre la partie en ligne' }).click();
  await expect(page.getByText('Code de la partie')).toBeVisible();
  const lien = await page.getByLabel('Lien pour les groupes').inputValue();
  const ligne = page.locator('table.codes tbody tr', { hasText: 'Les Lémaniques' });
  const codeEquipe = (await ligne.locator('td').nth(1).innerText()).trim();
  expect(codeEquipe).toMatch(/^[A-Z2-9]{8}$/);
  expect(JSON.stringify(base.equipes)).not.toContain(codeEquipe);
  expect(base.situations.size).toBe(2);

  // Le groupe, sur son propre poste.
  const groupe = await context.newPage();
  await groupe.goto(lien);
  await groupe.getByLabel('Code de votre équipe').fill('mauvais1');
  await groupe.getByRole('button', { name: 'Rejoindre' }).click();
  await expect(groupe.getByRole('alert')).toContainText("Code de partie ou code d'équipe incorrect.");
  await groupe.getByLabel('Code de votre équipe').fill(codeEquipe.toLowerCase());
  await groupe.getByRole('button', { name: 'Rejoindre' }).click();
  await expect(groupe.getByRole('heading', { name: 'Les Lémaniques' })).toBeVisible();
  await expect(groupe.getByText('Rhône Express')).toHaveCount(0);
  await groupe.getByLabel(/à commander/).fill('12');
  await groupe.getByRole('button', { name: 'Envoyer nos décisions' }).click();
  await expect(groupe.getByText('Décisions envoyées pour le tour 1')).toBeVisible();

  // L'enseignant relève les décisions, saisit celles de l'autre groupe et calcule le tour.
  await page.getByRole('button', { name: 'Relever les décisions maintenant' }).click();
  await expect(page.getByText('Décisions reçues : Les Lémaniques.')).toBeVisible();
  await page.getByRole('button', { name: 'Saisir' }).first().click();
  await page.getByRole('button', { name: 'Valider les décisions' }).click();
  await page.getByRole('button', { name: 'Calculer le tour 1' }).click();
  await page.keyboard.press('Escape');

  // Les situations du tour 2 et les résultats sont publiés automatiquement ; le groupe actualise.
  await expect.poll(() => base.partie?.numero_tour, { timeout: 10000 }).toBe(2);
  await groupe.getByRole('button', { name: 'Actualiser (tour suivant)' }).click();
  await expect(groupe.getByText(/Tour 2 sur 3/)).toBeVisible();
  await expect(groupe.getByRole('heading', { name: 'Résultats du tour 1' })).toBeVisible();
});
