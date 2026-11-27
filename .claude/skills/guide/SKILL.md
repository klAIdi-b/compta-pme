---
name: guide
description: Régénère la page autonome du guide d'utilisation (public/guide.html) à partir de src/data/guide.ts et vérifie le guide. À utiliser après toute modification du contenu du guide.
---

Régénérer le guide d'utilisation.

1. `npm run guide` : réécrit `public/guide.html` d'après `src/data/guide.ts`. Le message attendu est
   « Guide écrit : public/guide.html ».
2. `npx vitest run tests/guide` : les tests du guide doivent passer.
3. `git status --short` : `public/guide.html` et `src/data/guide.ts` apparaissent modifiés. Ne pas commiter sans
   demande ; signaler les deux fichiers à inclure dans le prochain commit.
4. Vérifier que le texte du guide respecte les règles du projet : « 1ère CFC », « 2ème CFC » ; copies rendues dans
   Google Classroom (jamais Teams ni e-mail) ; aucun nom d'école ni chemin de disque.
5. Compte rendu en deux lignes : régénéré ou non, tests du guide, fichiers à commiter.
