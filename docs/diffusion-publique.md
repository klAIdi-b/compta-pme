# Compta PME en version publique — plan de diffusion

Proposition du 21.11.2026, **validée par l'enseignant le 22.11.2026**. Branche de travail : `claude/version-publique-28b3cf` (rien sur `main` sans accord).

## 1. Cadrage (réponses de l'enseignant du 21.11.2026)

| Question | Décision |
|---|---|
| Public visé | **Écoles genevoises d'abord** (collègues des autres écoles du DIP), Suisse romande ensuite |
| Contenus tirés des manuels E&S et F&C | Droits incertains pour une diffusion hors de l'école : **retirés de la version publique**, gardés pour l'école sous forme de fichiers d'exercice |
| Licence | **Code MIT**, contenus (exercices, dossiers, théorie, guide) **CC BY-NC-SA 4.0** |
| Nom de l'école | **Aucune mention** (ni école ni auteur dans l'interface et les pages partagées) |
| Réglages à rendre paramétrables | **Plan comptable** et **niveaux / classement des exercices** ; bouclement et comptes en T restent réglés par exercice comme aujourd'hui |
| Historique Git | **Laissé tel quel** (on retire les fichiers de la version actuelle seulement) |
| Maintenance | **L'enseignant seul** pour l'instant |
| Canal de contact | **À décider plus tard** |

## 2. État des lieux

**Déjà prêt pour une diffusion** : 100 % navigateur, hors ligne (service worker), aucune donnée d'élève en ligne (LPD, LIPAD), échanges par fichiers, plan PME suisse, interface entièrement en français, tests du moteur (Vitest) et des écrans avec contrôle d'accessibilité axe (`e2e/accessibilite.spec.ts`, `e2e/simulateur.spec.ts`), guide intégré et page `public/guide.html`.

**Ce qui empêche une diffusion large** :

1. **Contenus tirés des manuels** — le dépôt GitHub est **public** et ces fichiers y sont lisibles :
   - `src/data/exercices-manuel.ts` : 9 exercices (Favre Événements, Vinothèque des Pâquis, Maison Lacroix, Matériaux Brodard, Imprimerie du Mont-Blanc, Truffaz Transports, Lambert Horlogerie, Zéphyr Automation SA, Rive Gauche Participations SA) ;
   - `src/data/dossiers/cfc-manuel.ts` (Garage du Pont-Rouge, Hi-Fi Plainpalais), `cfc-manuel-tva.ts` (Électroménager du Rhône), `cfc-manuel-salaires.ts` (Confiserie du Bourg-de-Four) : 4 dossiers de pièces ;
   - tests `tests/exercices-manuel.test.ts`, `tests/manuel-tva.test.ts`.
   - Les autres exercices et dossiers sont des créations originales ; certains reprennent seulement des **règles** du cours (commentaires « F&C ch. 36 », etc.), ce qui ne pose pas de problème de droits. La théorie est rédigée en nos propres mots (lot B du 09.11.2026 : notions reformulées, à relire une dernière fois par l'enseignant pour s'assurer qu'aucun cas du manuel n'y figure).
2. **Aucune licence** : légalement, personne ne peut réutiliser le code ni les contenus.
3. **Nom de l'école** : `public/guide.html` et `scripts/generer-guide.ts` (« École de commerce Aimée-Stitelmann · Comptabilité »), `README.md`. `public/presentation.html` indique « Genève ».
4. **Réglages propres au cours** : le plan comptable est fixé dans le code (`src/data/plan-pme.csv`, avec les niveaux CFC1/CFC2/MP du cours) ; les niveaux de difficulté et leurs titres (`TITRES_DIFFICULTE`, `src/engine/exercice.ts`) suivent le découpage du manuel E&S.
5. **Documents internes** dans le dépôt public : `CLAUDE.md`, `TRAVAIL_EN_COURS.md`, `PROMPT_EQUIPE.md` (chemins locaux, nom de l'école, historique des décisions). Sans danger pour les élèves, mais à décider (phase 3).
6. **Guide** écrit pour les collègues de l'école ; il manque une page « À propos » (licence, version, contact), un guide de prise en main pour un enseignant qui ne connaît pas le projet et une déclaration d'accessibilité.
7. **Simulateur en ligne (phase S5)** : non fait ; la vérification des règles du DIP (LIPAD) reste nécessaire avant toute mise en ligne, et d'autant plus pour d'autres écoles.

## 3. Phases

L'accord de l'enseignant est demandé à la fin de chaque phase.

### Phase P1 — Version publique sans contenu protégé, licences, interface neutre (*faite le 22.11.2026 sur la branche*)

- **Mise de côté des contenus tirés des manuels** : un script exporte les 9 exercices et les 4 dossiers en fichiers « version enseignant » (`.compta-exercice.json`, corrigé en clair, importables dans l'espace enseignant) dans un dossier **hors du dépôt** (`C:\Users\41789\Documents\compta-pme-contenus-ecole\`), avec une copie des fichiers sources et des tests. Puis ils sont retirés de l'application et du dépôt.
  - Conséquence pour l'école : une fois la branche publiée, ces exercices ne figurent plus dans la liste de l'accueil ni dans les liens `?exercice=…` ; l'enseignant les importe dans son espace enseignant et les distribue par fichier (comme ses propres exercices).
- **Licences** : `LICENSE` (MIT) et `LICENCE-CONTENUS.md` (CC BY-NC-SA 4.0 : ce que couvre chaque licence). Titulaire : « Les auteurs de Compta PME » (aucun nom, selon la décision « aucune mention »).
- **Interface neutre** : nom de l'école retiré du guide à partager, du générateur du guide et du README ; « Genève » remplacé par « Suisse » dans la page de présentation ; mention de la licence au bas du guide et de la présentation.
- `package.json` : champ `license`.
- Tests, vérification des types, construction.
- *Fait* : 17 fichiers « version enseignant » exportés et relus par `importerExercice` (9 exercices, 4 dossiers et leurs versions d'évaluation), PDF élève et corrigé des dossiers, sources et tests copiés dans `sources/`, mode d'emploi `LISEZMOI.md` ; test de garde « aucun contenu tiré des manuels » (`tests/classement.test.ts`). Les élèves qui avaient commencé un de ces exercices gardent leur travail (la session enregistrée contient l'exercice complet).

### Phase P2 — Réglages par établissement

- **Plan comptable importable** : dans l'espace enseignant, importer un plan au format CSV du projet (`numero;intitule;classe;type;niveau_min`), contrôlé par le moteur (`lirePlanCsv`), enregistré dans le navigateur et joint aux fichiers d'exercice qui l'utilisent ; le plan du cours reste celui par défaut. Aucun compte ni intitulé n'est ajouté par Claude.
- **Niveaux et classement** : titres des niveaux de difficulté et formations (CFC / MP) modifiables par l'enseignant ; références aux chapitres du manuel E&S rendues facultatives.
- Maquette de l'écran de réglage avant le code, puis validation. *Maquette faite le 22.11.2026* : `public/maquettes/reglages-etablissement.html` (quatre écrans, cinq points à valider).

### Phase P3 — Documentation et accessibilité

- Guide « Démarrer avec Compta PME dans votre école » (pour un enseignant qui découvre l'outil) : installer sur les postes, préparer un exercice, distribuer, ramasser les copies, données des élèves (LPD, LIPAD).
- Page « À propos » dans l'application : version, licences, contact (canal à décider), ce que fait et ne fait pas l'application avec les données.
- Audit d'accessibilité de tous les écrans (axe, clavier seul, contraste, zoom 200 %, lecteur d'écran) et déclaration d'accessibilité.
- README public ; décision sur les documents internes (`CLAUDE.md` et autres) : les garder, les déplacer dans `docs/developpement/` ou les retirer.

### Phase P4 — Diffusion genevoise

- Vérification par l'enseignant des règles du DIP pour recommander l'outil à d'autres écoles (et pour le simulateur en ligne, phase S5).
- Essai avec un ou deux collègues d'autres écoles ; retours par le fichier « Exporter mes remarques » ; corrections.
- Fusion sur `main` et publication (GitHub Pages), avec l'accord de l'enseignant.

### Plus tard — Suisse romande

Vocabulaire et usages cantonaux (Vaud, Fribourg, Neuchâtel, Valais, Jura, Berne francophone), plans de cours différents, porteur institutionnel éventuel, canal de contact et contributions.

## 4. Points ouverts

- **Théorie, chapitres enrichis le 15.11.2026** (ch. 1 et 12) : noms des entreprises des exemples repris du manuel remplacés le 22.11.2026 à la demande de l'enseignant (Mme Favre → Mme Monnier, Librairie du Molard → Librairie des Tranchées), montants conservés.

- Canal de contact (e-mail ou Issues GitHub) : à décider avant la phase P3.
- Autorisation écrite de l'éditeur (CREME-CIIP / auteurs) : si elle est obtenue un jour, les contenus mis de côté pourront revenir avec une mention de source.
- L'historique Git du dépôt public contient toujours les contenus retirés (choix de l'enseignant du 21.11.2026).
