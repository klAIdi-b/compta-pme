// Rappel lancé par Claude Code après une modification de fichier (hook PostToolUse, voir .claude/settings.json).
// Si le contenu du guide (src/data/guide.ts) vient de changer, il rappelle à Claude de régénérer la page autonome
// public/guide.html avec « npm run guide ». Il ne bloque jamais rien.
// Essai à la main (Git Bash) :
//   echo '{"tool_input":{"file_path":"src/data/guide.ts"}}' | node .claude/hooks/rappel-guide.mjs

let entree = '';
for await (const morceau of process.stdin) entree += morceau;
let chemin = '';
try {
  chemin = JSON.parse(entree).tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}
if (/[\\/]?src[\\/]data[\\/]guide\.ts$/.test(chemin)) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: 'Le guide a changé : lancer « npm run guide » pour régénérer public/guide.html avant le commit.',
      },
    }),
  );
}
process.exit(0);
