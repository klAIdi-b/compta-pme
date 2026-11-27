---
name: publier-apercu
description: Commite le travail en cours sur la branche apercu, le pousse et publie le site de prévisualisation, puis vérifie qu'il est en ligne. Correspond à « Oui, sur apercu » de l'enseignant.
argument-hint: "[résumé du changement, facultatif]"
disable-model-invocation: true
---

Publier sur la prévisualisation. Résumé donné par l'enseignant (peut être vide) : $ARGUMENTS

1. **État** : `git status --short --branch`. La branche doit être `apercu` ; sinon, s'arrêter et le dire. Lister les
   fichiers qui seront commités ; laisser de côté un fichier de travail sans rapport avec le changement (le dire).
2. **Vérifications** : `npm test` et `npm run check` (le hook avant commit les refait, mais on veut voir le résultat) ;
   si l'interface a changé, `npm run build` puis `npm run test:ecrans`. Un échec : s'arrêter et expliquer.
3. **Commit** : `git add` des fichiers concernés, puis un commit dont le titre commence par « Prévisualisation : »,
   suivi d'un court paragraphe en français et de la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
   Le hook refuse le commit en cas d'information privée ou de test en échec : corriger la cause, jamais contourner.
4. **Publication** : `git push origin apercu`, puis `gh workflow run deploy.yml --ref main` (le site principal et
   `/apercu/` sont construits ensemble). Attendre la fin avec `gh run watch <id> --exit-status`.
5. **Vérification en ligne** : dans `https://klaidi-b.github.io/compta-pme/apercu/`, retrouver par `curl` le fichier
   JavaScript concerné et y chercher un texte propre au changement (compter les occurrences).
6. **Suivi** : mettre à jour `TRAVAIL_EN_COURS.md` (ce qui est publié, ce qui reste) ; si ce fichier change, le
   commiter et le pousser aussi.
7. **Compte rendu** à l'enseignant : commit (numéro court et titre), résultat de la publication et de la vérification,
   comment essayer sur la prévisualisation, et rappel que le site des élèves (`main`) ne change pas sans son accord.
