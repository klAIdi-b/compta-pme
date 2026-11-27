// Garde-fou lancé par Claude Code avant une commande qui contient « git push » (hook PreToolUse, voir
// .claude/settings.json). Règle du projet : on ne pousse que sur apercu ; main ne reçoit que des fusions acceptées
// par l'enseignant (demande de fusion sur GitHub). Le push est refusé s'il vise main sous une forme quelconque
// (origin main, HEAD:main, refs/heads/main, --all, --mirror, ou sans branche alors que la branche active est main)
// et s'il est forcé (--force, -f, +branche), car un push forcé efface l'historique publié.
// Essai à la main (Git Bash) :
//   echo '{"tool_input":{"command":"git push origin main"}}' | node .claude/hooks/avant-push.mjs; echo $?
// Code de sortie 0 = le push passe ; 2 = il est refusé (le message est lu par Claude).

import { execSync } from 'node:child_process';

const racine = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const refuser = (raison) => {
  process.stderr.write(`Push refusé par le garde-fou du projet : ${raison}\n`);
  process.exit(2);
};

let entree = '';
for await (const morceau of process.stdin) entree += morceau;
let commande = '';
try {
  commande = JSON.parse(entree).tool_input?.command ?? '';
} catch {
  process.exit(0);
}

// Chaque « git push » de la commande, jusqu'au prochain séparateur (&&, ||, ;, |, retour à la ligne).
const pushs = [...commande.matchAll(/\bgit(?:\s+-[cC]\s+\S+)*\s+push\b([^&|;\n]*)/g)].map((m) => m[1].trim().split(/\s+/).filter(Boolean));
if (!pushs.length) process.exit(0);

for (const args of pushs) {
  const options = args.filter((a) => a.startsWith('-'));
  const positions = args.filter((a) => !a.startsWith('-'));
  // Options longues interdites, et options courtes groupées contenant f (force) ou d (suppression), par ex. -uf.
  const interdite = (o) =>
    ['--mirror', '--all', '--delete'].includes(o) || o.startsWith('--force') || (/^-[a-zA-Z]+$/.test(o) && /[fd]/.test(o));
  if (options.some(interdite)) {
    refuser(`option « ${options.join(' ')} » non permise. Seul un push simple vers apercu est autorisé.`);
  }
  const refs = positions.slice(1); // le premier mot est le dépôt distant (origin)
  if (refs.some((r) => r.startsWith('+'))) refuser('push forcé (+branche) non permis.');
  const versMain = (r) => {
    const cible = r.includes(':') ? r.split(':').pop() : r;
    return /^(refs\/heads\/)?main$/.test(cible);
  };
  if (refs.some(versMain)) refuser("vers main. Poussez sur apercu, puis demandez à l'enseignant la fusion dans main.");
  // Sans branche nommée, ou avec HEAD, c'est la branche active qui est poussée.
  if (refs.length === 0 || refs.some((r) => (r.includes(':') ? r.split(':').pop() : r) === 'HEAD')) {
    const branche = execSync('git rev-parse --abbrev-ref HEAD', { cwd: racine, encoding: 'utf8' }).trim();
    if (branche === 'main') refuser("la branche active est main. Poussez sur apercu, puis demandez à l'enseignant la fusion dans main.");
  }
}
process.exit(0);
