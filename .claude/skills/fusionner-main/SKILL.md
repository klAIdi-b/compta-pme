---
name: fusionner-main
description: Fusionne la branche apercu dans main par une demande de fusion GitHub, après l'accord de l'enseignant, puis vérifie la publication du site des élèves. Correspond à « Fusionner dans main ».
argument-hint: "[titre de la demande de fusion, facultatif]"
disable-model-invocation: true
---

Fusionner `apercu` dans `main`. L'enseignant a lancé cette commande lui-même : c'est son accord pour cette fusion-ci,
et seulement celle-ci. Titre proposé (peut être vide) : $ARGUMENTS

1. **État** : `git fetch -q origin`, puis `git status --short --branch` (branche `apercu`, rien de non commité qui
   devrait partir) et `git log --oneline origin/main..origin/apercu` : la liste des commits qui vont entrer dans
   `main`. Si `origin/apercu` est en retard sur le travail local, s'arrêter et proposer `/publier-apercu`.
2. **Demande de fusion** : `gh pr create --base main --head apercu`, titre court en français, corps : ce qui change pour
   les élèves et les enseignants, « Validé par l'enseignant sur la prévisualisation », puis la ligne
   « 🤖 Generated with [Claude Code](https://claude.com/claude-code) ».
3. **Fusion** : `gh pr merge <numéro> --merge`. Une fenêtre d'accord s'affiche (règle de permission du projet) :
   c'est normal, l'enseignant confirme.
4. **Publication** : attendre le déploiement de `main` (`gh run list --workflow deploy.yml --branch main --limit 1`,
   puis `gh run watch <id> --exit-status`).
5. **Vérification en ligne** : sur `https://klaidi-b.github.io/compta-pme/`, retrouver par `curl` le fichier concerné
   et y chercher un texte propre au changement.
6. **Suivi** : dans `CLAUDE.md` et `TRAVAIL_EN_COURS.md`, lever les mentions « à valider » de ce qui vient d'être
   fusionné (avec la date et le numéro de la demande de fusion) ; commiter sur `apercu` et pousser.
7. **Compte rendu** : lien de la demande de fusion (`https://github.com/klAIdi-b/compta-pme/pull/<numéro>`), résultat
   du déploiement et de la vérification, ce que les élèves voient désormais, et l'action suivante proposée.

Ne jamais pousser directement sur `main` (le hook le refuse) ; ne jamais activer la fusion automatique.
