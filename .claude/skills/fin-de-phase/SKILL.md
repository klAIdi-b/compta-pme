---
name: fin-de-phase
description: Clôt une phase de travail selon la méthode du projet - vérifications complètes, relecture indépendante, contrôle comptable si besoin, mise à jour de CLAUDE.md et de TRAVAIL_EN_COURS.md, compte rendu à l'enseignant, puis arrêt et attente de son accord.
argument-hint: "[nom de la phase, facultatif]"
---

Clore la phase : $ARGUMENTS

1. **Vérifications** : `npm test`, `npm run check`, `npm run build`, puis `npm run test:ecrans` si l'interface a
   changé. Noter les nombres de tests réussis. Un échec : le corriger avant d'aller plus loin, ou s'arrêter et le dire.
2. **Écrans** : si l'interface a changé, confier au sous-agent `testeur-ecrans` les captures à 360, 768 et 1440 px des
   écrans touchés et le contrôle d'accessibilité ; regarder les captures rendues.
3. **Comptabilité** : si un exercice, un corrigé, une théorie, une leçon, un module, une fiche ou une règle du moteur a
   changé, confier la vérification au sous-agent `expert-comptable`.
4. **Relecture** : confier le diff de la phase au sous-agent `relecteur`. Corriger ce qui est bloquant ; garder pour
   l'enseignant ce qui relève d'une décision.
5. **Guide** : si le fonctionnement visible a changé, mettre à jour `src/data/guide.ts` puis lancer `/guide`.
6. **Documents** : `CLAUDE.md` ne reçoit que la règle actuelle, en une ou deux lignes courtes (rien d'historique ; une
   règle remplacée est réécrite, pas complétée) ; le détail comptable va dans `.claude/rules/comptabilite.md`, le
   détail d'interface dans `.claude/rules/interface.md`. `TRAVAIL_EN_COURS.md` : ce qui est fait, ce qui reste, ce qui
   attend une décision. Le récit daté va dans `docs/historique.md` s'il mérite d'être gardé.
7. **Compte rendu** à l'enseignant, en français et en le vouvoyant : ce qui a été fait, résultats des vérifications,
   comment vérifier soi-même dans le navigateur (adresse, clics), ce qui reste incomplet ou non vérifié, ce qui attend
   sa décision. Rien n'est commité ni publié sans sa demande (`/publier-apercu`).
8. **S'arrêter** et attendre son accord avant la phase suivante.
