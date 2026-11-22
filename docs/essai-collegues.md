# Essai par des collègues (phase P4 de la version publique)

Préparé le 22.11.2026. Choix de l'enseignant : version d'essai à une **adresse séparée**, retours par **fiche d'essai +
fichier de remarques** (onglet « Relecture », « Exporter mes remarques »).

## 1. Adresse d'essai

- Site des élèves (inchangé) : `https://klaidi-b.github.io/compta-pme/` — branche `main`.
- Version d'essai : `https://klaidi-b.github.io/compta-pme/essai/` — branche `essai`, avec un bandeau « Version d'essai »
  sur la page d'accueil.
- Publication (`.github/workflows/deploy.yml`) : à chaque envoi sur `main` ou `essai`, les deux branches sont testées
  puis publiées ensemble (`main` à la racine, `essai` dans `essai/`). Le service hors ligne garde un cache par dossier
  (`hors-ligne/sw-modele.js`), vérifié en local le 22.11.2026 : les deux caches coexistent.
- **Avant le premier envoi**, deux réglages GitHub, avec l'accord de l'enseignant :
  1. autoriser la branche `essai` à publier (environnement `github-pages`, règle de déploiement, aujourd'hui `main` seule) ;
  2. envoyer cette branche sous le nom `essai`.
- Limites tant que `main` n'a pas reçu ce nouveau fichier de publication :
  - un envoi sur `main` (par une autre session, par exemple) republie le site **sans** `essai/` ; il suffit alors de
    renvoyer la branche `essai` (ou de relancer la publication depuis `essai`) pour la remettre ;
  - l'ancien service hors ligne du site principal peut effacer le cache hors ligne de la version d'essai lors d'une
    mise à jour de `main` : la version d'essai reste utilisable en ligne.
- Même origine (`klaidi-b.github.io`) : les deux versions partagent les données du navigateur. Sur l'ordinateur de
  l'enseignant, la version d'essai voit donc ses vrais exercices et réglages ; les collègues, sur leur propre ordinateur,
  ne sont pas concernés. Les données restent compatibles (la version d'essai ajoute seulement le plan et le titre du
  niveau aux exercices créés, que la version principale ignore).

## 2. Kit à transmettre aux collègues

- La fiche d'essai : `https://klaidi-b.github.io/compta-pme/essai/fiche-essai.html` (fichier `public/fiche-essai.html`,
  imprimable) : 45 minutes, partie élève, partie enseignant (dont « Paramètres » et « Relecture »), huit questions.
- Le guide : bouton « Guide » du logiciel, ou `…/essai/guide.html`.
- Message proposé (à adapter) :

  > Bonjour, je prépare la diffusion de Compta PME, un logiciel gratuit de comptabilité en partie double pour nos
  > classes CFC et MP (navigateur seulement, aucune donnée d'élève en ligne). Accepteriez-vous de l'essayer 45 minutes
  > d'ici le [date] ? Tout est expliqué sur la fiche : https://klaidi-b.github.io/compta-pme/essai/fiche-essai.html.
  > Il suffit ensuite de me rendre la fiche et le fichier de remarques. Merci !

## 3. Après l'essai

1. Importer les fichiers de remarques reçus (onglet « Relecture ») et regrouper les réponses aux fiches.
2. Trier : corrections (erreurs, textes peu clairs), réglages manquants, demandes de contenu (à soumettre à
   l'enseignant, comme toujours).
3. Corriger sur la branche, renvoyer sur `essai` si un second tour est utile.
4. Décision de l'enseignant : fusion sur `main` et publication. À ce moment, distribuer par fichier les exercices
   tirés des manuels (dossier privé indiqué dans `CLAUDE.local.md`) aux classes qui les utilisent.

## 4. Vérification des règles du DIP (par l'enseignant)

Questions à poser à la direction ou au service compétent avant de recommander l'outil à d'autres écoles :

- Un site web gratuit, sans compte, qui garde toutes les données dans le navigateur de l'élève et échange des fichiers
  par la plateforme de l'école, peut-il être utilisé en classe sans autorisation particulière ?
- Les postes de l'école effacent-ils les données des navigateurs à la fin de la session ? (Si oui, les élèves doivent
  exporter leur copie avant de fermer.)
- Le site `github.io` est-il accessible depuis le réseau des écoles ?
- Les fichiers de copies (nom, prénom, classe, écritures) déposés sur la plateforme de l'école : quelles règles de
  conservation ?
- Pour le simulateur en ligne (phase S5, non faite) : un service de base de données en Europe, avec seulement des
  noms d'équipe et des décisions de jeu, est-il admis ?
