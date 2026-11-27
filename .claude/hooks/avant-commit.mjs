// Garde-fou lancé par Claude Code avant une commande qui contient « git commit » (hook PreToolUse, voir
// .claude/settings.json). Il refuse le commit, avec la raison, dans trois cas :
//   1. le commit serait fait directement sur la branche main (tout passe par apercu) ;
//   2. les changements contiennent un motif privé : nom de l'école, chemin d'un disque, mot de la liste locale
//      .claude/motifs-prives.local (fichier non versionné), ou CLAUDE.local.md lui-même ;
//   3. npm test ou npm run check échoue.
// Il ne contient lui-même aucun nom ni chemin privé : ce fichier est publié avec le dépôt.
// Essai à la main (Git Bash) :
//   echo '{"tool_input":{"command":"git commit --dry-run -m essai"}}' | node .claude/hooks/avant-commit.mjs; echo $?
// Code de sortie 0 = le commit passe ; 2 = il est refusé (le message est lu par Claude).

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const racine = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const refuser = (raison) => {
  process.stderr.write(`Commit refusé par le garde-fou du projet : ${raison}\n`);
  process.exit(2);
};
const git = (args) => execSync(`git ${args}`, { cwd: racine, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

let entree = '';
for await (const morceau of process.stdin) entree += morceau;
let commande = '';
try {
  commande = JSON.parse(entree).tool_input?.command ?? '';
} catch {
  process.exit(0);
}
// « git commit », y compris avec des options globales (git -C . commit, git -c x=y commit).
if (!/\bgit(\s+-[cC]\s+\S+)*\s+commit\b/.test(commande)) process.exit(0);

// 1. Jamais de commit directement sur main.
const branche = git('rev-parse --abbrev-ref HEAD').trim();
if (branche === 'main') refuser("la branche active est main. Travaillez sur apercu ; main ne reçoit que des fusions acceptées par l'enseignant.");

// 2. Confidentialité. Changements examinés : ceux déjà préparés, et, si la commande prépare elle-même des fichiers
// (git add, commit -a), tous les fichiers suivis modifiés et les nouveaux fichiers non ignorés.
const prepareAussi = /\bgit\s+add\b|\bcommit\b[^|;&]*\s-(a|am|-all)\b/.test(commande);
const fichiers = new Set(git('diff --cached --name-only').split('\n').filter(Boolean));
let diff = git('diff --cached -U0');
if (prepareAussi) {
  for (const f of git('diff HEAD --name-only').split('\n').filter(Boolean)) fichiers.add(f);
  diff += git('diff HEAD -U0');
  for (const f of git('ls-files --others --exclude-standard').split('\n').filter(Boolean)) {
    fichiers.add(f);
    try {
      diff += `\n+++ b/${f}\n` + readFileSync(join(racine, f), 'utf8').split('\n').map((l) => `+${l}`).join('\n');
    } catch {
      // fichier binaire ou illisible : ignoré
    }
  }
}
if ([...fichiers].some((f) => /(^|\/)CLAUDE\.local\.md$/i.test(f)) || /\bgit\s+add\b[^&|;\n]*CLAUDE\.local\.md/i.test(commande)) refuser('CLAUDE.local.md ne doit jamais être versionné.');

const motifs = [];
const liste = join(racine, '.claude', 'motifs-prives.local');
if (existsSync(liste)) {
  for (const l of readFileSync(liste, 'utf8').split(/\r?\n/)) if (l.trim() && !l.startsWith('#')) motifs.push(l.trim().toLowerCase());
}
// Chemin d'un disque Windows (C:\…, D:/…), sauf C:\Program Files (emplacement standard des logiciels).
const disque = /\b[A-Za-z]:[\\/](?!Program Files)[A-Za-z0-9_.&]/;
let courant = '';
const trouves = [];
for (const ligne of diff.split('\n')) {
  if (ligne.startsWith('+++ b/')) courant = ligne.slice(6);
  if (!ligne.startsWith('+') || ligne.startsWith('+++')) continue;
  const texte = ligne.slice(1);
  const bas = texte.toLowerCase();
  const motif = motifs.find((m) => bas.includes(m));
  if (motif) trouves.push(`${courant} : motif privé « ${motif} »`);
  else if (disque.test(texte)) trouves.push(`${courant} : chemin de disque « ${texte.match(disque)[0]}… »`);
  if (trouves.length >= 5) break;
}
if (trouves.length) refuser(`information privée dans les changements (dépôt public).\n- ${trouves.join('\n- ')}`);

// 3. Tests et vérification des types.
for (const script of ['test', 'run check']) {
  const r = spawnSync(`npm ${script}`, { cwd: racine, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    // Lignes utiles seulement (tests en échec, erreurs de types), sans les codes de couleur du terminal.
    const sortie = `${r.stdout ?? ''}${r.stderr ?? ''}`
      .replace(/\x1b\[[0-9;]*m/g, '')
      .split('\n')
      .filter((l) => /FAIL|×|AssertionError|Error:|error TS|Errors?\b.*\d|\d+ failed/.test(l))
      .slice(0, 15)
      .join('\n');
    refuser(`« npm ${script} » échoue. Corrigez d'abord.\n${sortie}`);
  }
}
process.exit(0);
