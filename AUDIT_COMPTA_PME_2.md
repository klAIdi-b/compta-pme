# Second audit de Compta PME par quatre spécialistes

Date : 26.11.2026. Commit audité : `706c476` (branche `apercu`, « Prévisualisation : reprise d'un travail par fichier »).

**État de départ.** Branche `apercu`, à jour avec `origin/apercu`, aucun fichier non commité. Par rapport à `origin/main`, `apercu` a un commit de contenu d'avance (la reprise d'un travail par fichier, non encore fusionnée) et treize commits de fusion de retard (fusions des demandes précédentes, sans contenu propre). `npm test` : 623 tests réussis dans 57 fichiers. `npm run check` : 0 erreur, 0 avertissement sur 388 fichiers. `npm run build` : réussi, script principal de 129,6 ko compressés.

**Méthode.** Quatre sous-agents en lecture seule, chacun avec un contexte neuf et sa seule mission : un expert-comptable suisse (C), un enseignant de comptabilité (ENS), un pédagogue (PED), un neuroscientifique de l'éducation (NEU). Phase 1 : audit indépendant (62 constats). Phase 2 : deux tours de confrontation écrite. Phase 3 : arbitrage et comparaison avec le premier audit par l'orchestrateur, qui a seul lu `AUDIT_COMPTA_PME.md`. Aucun fichier de l'application n'a été modifié ; ce rapport est le seul fichier créé dans le dépôt. Les scripts d'essai et les rapports complets sont dans le dossier de travail de la session, hors du dépôt.

**Limite de l'indépendance.** `CLAUDE.md` est chargé automatiquement dans le contexte de chaque sous-agent, avec ses mentions de l'audit du 24.11.2026. Les spécialistes avaient la consigne de les ignorer et de ne pas lire le premier rapport, ce qu'ils déclarent avoir fait. L'indépendance est donc forte sur le fond, mais pas absolue.

**Niveaux de preuve.** « Essai » : reproduit par un script qui appelle le vrai moteur. « Lecture du code » : déduit du code, non exécuté. « Source » : texte officiel lu en ligne. « Calcul » : refait à la main. Les constats critiques ont été revérifiés par l'orchestrateur dans le code (section 2).

---

## 1. Synthèse

Le moteur comptable reste solide : les 45 exercices et dossiers rejoués ne contiennent aucune erreur de calcul, une copie parfaite obtient 6 dans les 68 exercices corrigeables, et aucune des solutions affichées par 19 générateurs de calcul (3'000 tirages chacun) n'est refusée. Les problèmes sont ailleurs.

**1. Des réponses justes sont refusées, et des messages faux sont donnés à l'élève.**
Un montant saisi avec l'apostrophe typographique (« 1’234.50 ») est refusé dans tous les calculs d'Apprendre. Une reprise de véhicule passée en écriture nette est annoncée « incomplète », et comme ce diagnostic ne compte pas d'essai, « Voir la solution » n'est jamais proposé ; le même diagnostic cache des erreurs de fond (dividende passé au net, retenues de salaire oubliées). Le paiement d'une facture de mobilier passé en charge reçoit l'explication « La charge a déjà été comptabilisée », alors que la facture a été portée à l'actif. Le générateur de compte courant exige l'impôt anticipé sur des intérêts que l'art. 5 LIA exonère.

**2. Une note d'évaluation obtenue avec un contenu fourni n'est pas défendable.**
Les corrigés des exercices et dossiers fournis sont dans le script public du site, et le dossier « évaluation » est identique au dossier d'entraînement, où « Voir la solution » est disponible dans un second onglet. La « variante d'évaluation », que le guide présente comme la voie sûre, multiplie tous les montants par le même entier : il suffit de diviser. Elle produit en plus des pièces à la TVA fausse (16 sur 56) et laisse la facturation et le budget à l'échelle d'origine, si bien qu'un paiement juste est refusé. Le fichier d'évaluation contient des réponses en clair, son mode se change dans un éditeur de texte, une copie retouchée à la main est notée, et le maximum de points change d'un élève à l'autre quand le bouclement sort du barème.

**3. « Maîtrisé » ne prouve pas la maîtrise.**
Un élève qui répond toujours « Actif » et toujours la même variation réussit une série du module « Le bilan » dans 12 % des cas, puis sa révision dans 71 % des cas : le module s'affiche « Maîtrisé » après huit séries en moyenne. La révision repose sur une seule question, toujours du premier format du module. Les modules d'écritures de 2ème CFC et de maturité n'ont que 4 à 7 énoncés, réussis par cœur dès la deuxième série. La règle du minimum par format, ajoutée le 26.11.2026, n'y change rien. Toute gamification posée sur ce critère récompenserait la devinette : les quatre spécialistes en font un préalable.

**4. Le retour aide peu au-delà des premières notions.**
Les explications « Pourquoi ? » n'existent que pour la 1ère CFC. Dans Apprendre, quatre formats sur huit ne donnent que la bonne réponse, y compris tout le module « Le bilan ». Une écriture inversée qui contient en plus un compte faux n'est reconnue comme inversée que 6 fois sur 541. La solution reste affichée pendant que l'élève corrige, ce qui invite à recopier. Les modules de 2ème CFC donnent montants et côtés : le calcul de l'amortissement, de la TVA, du ducroire et des retenues n'y est jamais exercé.

**5. Des conventions du cours sont présentées comme des règles générales, et certains contenus se contredisent.**
Pertes sur créances sans correction de TVA (art. 41 LTVA), impôt anticipé d'une raison individuelle en 1176 (art. 30 LIA), agio sans déduction des frais d'émission (art. 671 CO) : les spécialistes ne demandent pas de changer ces règles, mais de les écrire comme des simplifications du cours. Une pièce affirme « Il n'y a pas de correction de la TVA à faire ». L'électricité va en 6400 dans la démo de 1ère CFC et en 6700 dans Maison Lacroix ; les abonnements en 6500 ou en 6700 selon l'exercice. Le dossier de salaires daté de 2026 calcule la LPP avec les montants de 2022. Enfin, ce que le logiciel appelle « 2ème CFC » relève, dans le plan fédéral et dans le plan genevois, de l'option Finances de 3e année.

Ordre conseillé, accepté par les quatre spécialistes : corriger d'abord le faux et les réponses justes refusées, puis fiabiliser l'évaluation et le signal de maîtrise, puis améliorer les retours, et seulement ensuite introduire la gamification.

---

## 2. Erreurs comptables et réponses justes refusées

Toutes revérifiées dans le code par l'orchestrateur. Classement après confrontation.

### 2.1 Critiques

| N° | Où | Constat et preuve | Correction proposée | Source |
|---|---|---|---|---|
| F1 (C1-01) | `src/engine/calculs.ts` l. 67 à 75 (`champJuste`) ; `src/engine/champs.ts` l. 23 (`lireNombre`) | Réponse juste refusée. Attendu 1'234.50 : « 1'234.50 » juste, « 1’234.50 », « CHF 1234.50 », « 1234.50 CHF » faux. `champJuste` ne retire que l'apostrophe droite, alors que l'apostrophe typographique est insérée d'office par les claviers de téléphone et de Mac. Le journal (`lireMontant`) l'accepte. Essai. | Lire les champs en francs avec `lireMontant` ; retirer aussi `’`, l'espace insécable et « CHF » dans `champJuste` et `lireNombre` ; ajouter ces cas aux tests. Effort faible. | Défaut interne, aucune source légale. |
| F2 (C1-02, C1-03) | `src/engine/correction.ts` l. 94 à 127 et l. 146 (`enregistrerTentative`), l. 159 à 162 (`solutionDisponible`) ; exercices Favre Événements op. 14 et Garage du Pont-Rouge op. 11 | Message faux et aide bloquée. L'écriture nette d'une reprise de véhicule donne les mêmes soldes que le corrigé et reçoit « il manque une partie de l'écriture », 0,5 point sur 2. Le diagnostic « incomplète » ne compte pas d'essai, donc la solution n'est jamais proposée. Le même diagnostic couvre un dividende passé au net sans impôt anticipé, des retenues de salaire oubliées, un montant faux. Essai. | Après un second « incomplète » sur la même opération, compter un essai et proposer la solution ; réserver « incomplète » au cas où chaque montant saisi correspond à une ligne du corrigé. Pour l'écriture nette : message explicite (« juste en solde, mais présentez séparément l'entrée du nouveau véhicule et la sortie de l'ancien »), compté comme un essai. Effort faible. | Pratique de la tenue d'un registre des immobilisations (présentation brute) ; pas de texte légal en cause. |
| F3 (PED3-06) | `src/engine/erreurs-typiques.ts` l. 71 à 80 (règle `paiement-en-charge`, attendu 2000 ou 2010) | Explication fausse. Paiement de la facture du mobilier, attendu 2010/1010, élève 6500/1010 : « La charge a déjà été comptabilisée à la réception de la facture. » La facture avait été portée en 1510. Le modèle `paie-autre-dette` d'Apprendre produit exactement ce cas. Essai, revérifié par l'expert-comptable. | Texte neutre (« La facture a déjà été comptabilisée à sa réception : le paiement éteint la dette ») ou deux règles distinctes pour 2000 et 2010. Effort faible. | Règle de l'école du 22.11.2026 (2010 pour les investissements), `CLAUDE.md`. |
| F4 (C1-07) | `src/engine/calculs.ts` l. 245 à 276 (`compteCourant`) ; comparer le dossier Optique du Rhône SA op. 7 | 959 tirages sur 3'000 exigent 35 % d'impôt anticipé sur un intérêt de 200 francs ou moins. L'élève qui applique la franchise est refusé ; le dossier Optique applique au contraire l'exonération. Essai. L'expert-comptable classait ce point important ; l'orchestrateur le classe critique, comme la consigne le prévoit pour une réponse juste refusée. | Tirer des soldes qui donnent plus de 200 francs d'intérêt annuel, ou l'écrire dans l'énoncé ; une phrase sur la franchise dans le chapitre `interets`. Effort faible. | Art. 5 al. 1 let. c LIA, https://www.fedlex.admin.ch/eli/cc/1966/371_385_384/fr |
| F5 (C1-15) | `src/engine/variante.ts` l. 25 à 91 | Latent : n'apparaît que si l'enseignant crée une variante. La TVA déjà arrondie est multipliée : 16 TVA de pièces sur 56 sont fausses (Saveurs de Carouge × 3, op. 8 : HT 517.20, TVA affichée 41.85 au lieu de 41.90). Les paramètres de facturation et de budget ne sont pas multipliés : dans la variante × 2 du dossier Cycles du Léman (facturation), l'ordre de paiement attend 4'864.50 alors que la pièce montre le double. Essai (expert-comptable et enseignant). | Reconstruire les pièces avec les constructeurs (`facture`, `ticket`), recalculer les lignes de TVA et le décompte ; multiplier facturation et budget, ou refuser la variante quand ces fiches existent ; test : chaque variante passe `controlerExercice`. Effort moyen. | Art. 26 LTVA pour la facture ; règle du cours (arrondi aux 5 centimes). |

### 2.2 Importants

| N° | Où | Constat | Correction proposée | Source |
|---|---|---|---|---|
| F6 (C1-10) | `src/engine/formulaire-tva.ts` l. 114 à 125 ; `src/engine/champs.ts` l. 35 | Latent. L'impôt du formulaire est contrôlé au centime contre la somme des TVA comptabilisées, pas contre « prestations × taux ». Dossier Cycles du Léman (facturation), chiffre 303 : 516.75 contre 516.72. Les deux exercices où le formulaire est activé concordent. Essai. | Tolérance de 5 centimes sur l'impôt, ou contrôle à l'activation de l'option dans l'éditeur. Effort faible. | Formulaire 0550 de l'AFC non relu (liens en erreur 404). |
| F7 (ENS17) | `src/engine/facturation.ts`, ordre de paiement | L'orthographe du bénéficiaire est notée : « Energies du Leman SA », « Énergies du Léman » et « Energie du Léman SA » sont refusés. En évaluation, ce champ compte dans les 2 points de l'ordre de paiement. Contredit la règle de l'école : aucune grille ne compte les fautes. Essai. | Comparer sans accents ni forme juridique, ou ne pas noter ce champ ; IBAN et référence restent décisifs. Effort faible. | Avis de pratique de l'expert-comptable, non vérifié sur une source bancaire. |
| F8 (ENS6 et suite) | `src/data/exercices-manuel.ts` l. 233 et 253 à 259 (Maison Lacroix, op. 5 et 11) | Op. 5 : « électricité et téléphone, 432.40 » corrigé en 6700 ; une réponse en 6400, compte enseigné pour l'électricité par la démo de 1ère CFC et par Apprendre, vaut 0. L'énoncé ne donne qu'un total, donc aucun partage 6400 / 6510 n'est calculable. Op. 11 : abonnement au quotidien régional en 6700, alors que les revues professionnelles vont en 6500 ailleurs. Essai. Les deux corrigés suivent une règle validée de `CLAUDE.md` (lot E : électricité, téléphone et abonnement au journal en 6700 ; revues spécialisées en 6500) : ce ne sont pas des erreurs, mais deux associations concurrentes pour l'élève. | Donner les deux montants dans l'énoncé de l'op. 5 et corriger en 6400 + 6510, ou admettre plusieurs corrigés par opération ; trancher la convention des abonnements. Effort faible à moyen. | Plan du cours `plan-pme.csv` (6400, 6510, 6700). |
| F9 (C1-05) | `src/data/dossiers/cfc-manuel-salaires.ts` (Confiserie du Bourg-de-Four) | Dossier daté de 2026, LPP calculée avec les montants de 2022. Blanc : 457.10 au lieu de 481.95 ; Rosset : 87.80 au lieu de 83.85 ; Caloz : 14.95 au lieu de 15.75. Les corrigés sont cohérents avec leurs pièces : l'élève n'est pas pénalisé. Calcul. | Dater le dossier de 2022, ou recalculer avec les montants de 2026, ou écrire « montants LPP donnés par la caisse ». Effort faible. | Montants OFAS 2026 lus seulement dans un résumé : https://www.bsv.admin.ch/dam/fr/sd-web/sAgdISSXenMT/f_Betr%C3%A4ge%202026.pdf (à confirmer). |
| F10 (NEU16) | `src/data/apprendre.ts` l. 239 | « L'essentiel » du module TVA de 2ème CFC dit encore « Un escompte corrige aussi la TVA. », alors que l'escompte avec correction de la TVA est passé en maturité le 25.11.2026 ; 3209 reste dans la liste des comptes du module sans aucun générateur qui l'emploie. Phrase juste en droit, hors niveau. Lecture du code. | Remplacer par « Un rabais accordé ou obtenu après facturation corrige aussi la TVA » ; retirer 3209 ou ajouter un générateur de rabais. Effort faible. | Art. 41 LTVA. |

### 2.3 Écarts entre l'usage scolaire et la pratique (non tranchés)

Les quatre spécialistes s'accordent sur la méthode : écrire d'abord chaque simplification comme une convention du cours, vérifier la règle appliquée aux épreuves de l'école, et ne changer les corrigés qu'ensuite. La décision vous revient.

| Sujet | Usage du logiciel | Pratique ou texte de loi | Source |
|---|---|---|---|
| Pertes sur créances d'une entreprise assujettie (C1-04) | Perte passée TVA comprise ; la pièce du dossier Fleurs et Jardins Mermoud affirme « Il n'y a pas de correction de la TVA à faire » | La contre-prestation corrigée réduit la TVA due | Art. 41 al. 1 LTVA, https://www.fedlex.admin.ch/eli/cc/2009/615/fr |
| Impôt anticipé d'une raison individuelle (C1-06) | 1176 Créances AFC (dossier Terroirs du Monde) | La personne physique demande le remboursement au canton ; en pratique, compte privé | Art. 30 al. 1 et 2 LIA |
| Agio et frais d'émission (C1-08) | Agio entier en 2900, frais en 6550 (Lémanbio, Zéphyr) | Réserve légale issue du capital « sous déduction des frais d'émission » | Art. 671 al. 1 ch. 1 CO, https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr |
| Perte de capital, surendettement (C1-09) | Moitié du capital et des réserves légales ; surendettement = fonds propres négatifs | Réserves « qui ne sont pas remboursables aux actionnaires » ; comptes intermédiaires à la valeur d'exploitation et de liquidation | Art. 725a et 725b CO |
| Entreprise « non assujettie » (C1-11) | Lambert Horlogerie (ventes 1'500'000.00) et Atelier Zufferey (165'000.00) dites non assujetties | Libération seulement sous 100'000 francs de chiffre d'affaires | Art. 10 al. 2 let. a LTVA. Écrire « la TVA est laissée de côté ». |
| Décoration florale (C1-12) | Forfait de décoration d'un hall au taux réduit (Mermoud op. 3) | Le taux réduit vise la livraison de fleurs ; un forfait de décoration peut être une prestation de services au taux normal | Art. 25 al. 2 let. a ch. 5 LTVA ; pratique AFC non consultée |
| Ducroire « maximum fiscal 5 % » (C1-14) | Lambert op. 12 | Non vérifié | Aucune source obtenue |
| Installation de chauffage (C1-13) | Novaterm op. 7 en 3200 | 3410 serait plus juste, mais il n'est pas disponible dans cet exercice : aucune réponse n'est refusée | Cohérence avec Garage du Pont-Rouge et Menuiserie Grandjean |

### 2.4 Ce qui a été vérifié sans défaut

- Les 45 corrigés sont arithmétiquement justes : TVA à 8,1 et 2,6 % aux 5 centimes, escomptes avec correction de la TVA, prorata, intérêts courus 30/360, dégressif, cession, devises, fondation et augmentation, répartition.
- `repartition.ts` est conforme aux art. 672 et 677 CO (Fedlex).
- AVS/AI/APG 5,3 % + 5,3 % : mémento 2.01 de la caisse AVS, état au 1er janvier 2026, https://www.ahv-iv.ch/p/2.01.f
- Le correcteur accepte la décomposition d'une écriture composée, l'ordre libre des lignes, une extourne suivie de la bonne écriture, un écart d'arrondi de TVA d'un centime.
- `noteSuisse` applique 1 + p/max × 5 au demi-point.

### 2.5 Non vérifié

Formulaire 0550 de l'AFC (liens en 404) ; montants LPP 2026 sur le document de l'OFAS ; taux fiscal du ducroire ; pratique AFC pour la décoration florale ; théorie, leçons, PDF et simulateur non relus ligne à ligne par l'expert-comptable.

---

## 3. Comparaison avec l'audit du 24.11.2026

### 3.1 Corrigé et vérifié

| Premier audit | État | Vérification |
|---|---|---|
| E1 Bilan en direct (perte comptée deux fois) | Corrigé | Test `tests/bilan-vivant.test.ts` sur tous les corrigés, dans les 623 tests réussis ; aucun spécialiste n'a retrouvé le défaut. |
| E2 Bouclement par 9000 refusé | Corrigé | `clotureDeGestionPar9000` présent ; copie parfaite à 6 dans les 68 exercices. |
| E3 1520 et 1521 | Corrigé selon votre règle | Aucun écart relevé dans les 45 corrigés rejoués. |
| E4 Pièce hors énoncé | Corrigé | Lecture du code. |
| E5 Tantièmes sans dividende de 5 % | Corrigé | Conforme à l'art. 677 CO selon l'expert-comptable. |
| E6 Imprimerie du Mandement | Corrigé | Passif transitoire de 2'700.00 lu dans le corrigé. |
| E8 Formulaire TVA hors classe 3 | Corrigé | Aucun écart sur les deux exercices où il est activé ; défaut voisin nouveau, voir F6. |
| Verdict hors de l'écran | Corrigé | Placé au-dessus de la grille (lecture du code et test d'écran existant). |
| « Juste avec la solution » | Corrigé | Statut distinct, salué par le pédagogue ; voir NEU7 pour sa limite. |
| Raisonnement en trois questions | Corrigé | Même texte qu'Apprendre ; aucun constat. |
| Accord « 1 justes » | Corrigé | `Accueil.svelte` l. 330. |
| Reprise d'un travail par fichier | Fait | La vérification `dossierDeCopie` existe, mais elle ne sert pas à l'import des copies par l'enseignant (ENS4). |

### 3.2 Toujours présent

- **Variante d'évaluation contournable** (premier audit, enseignant n° 1 ; action 8) : toujours présente, et aggravée par F5.
- **Barème par défaut de 1 point** (action 9) : les points partiels restent presque nuls (ENS7). Correction manuelle des points par l'enseignant toujours absente (ENS6).
- **« 2ème CFC » face au plan cantonal** (premier audit, enseignant n° 2) : confirmé cette fois sur le plan de formation fédéral et le plan genevois de la formation duale 2025 (ENS8). Votre réponse sur la répartition réelle dans votre école manque toujours.
- **Erreurs typiques limitées à la 1ère CFC** (premier audit, enseignant n° 8) : toujours présent (PED3-05).
- **Liste Apprendre des trois années sans filtre** (action 13) : toujours présent (PED3-12).
- **Module Bilan long avant la première question** (premier audit, enseignant n° 4) : 1'756 mots (PED3-13). Vous avez décidé de garder les leçons ; seules des questions intercalées restent proposées.
- **Guide dépassé** (premier audit, marketing n° 7) : le simulateur n'a toujours aucune section, deux onglets de l'espace enseignant manquent, l'ancienne dénomination des années figure dans le guide (l. 427) et dans `Relecture.svelte` (l. 45), la page « Données » dit qu'aucune donnée n'est envoyée sur internet sans mentionner le simulateur en ligne (ENS9).
- **Contenus tirés des manuels suivis par Git et publiés** (premier audit, point 7.3.7) : `src/data/exercices-manuel.ts` et trois fichiers `src/data/dossiers/cfc-manuel*.ts` sont toujours suivis, et leurs raisons sociales figurent dans le script publié (ENS16, revérifié par l'orchestrateur).
- **Licence, README, page de présentation** : toujours pas de licence ; README de 16 lignes ; `public/presentation.html` n'est lié depuis aucune page (revérifié par l'orchestrateur, non revu par les spécialistes).
- **Impôt anticipé sous 200 francs** : classé « non vérifié » par le premier audit, il est confirmé par la source et par une contradiction interne (F4).
- **Écarts d'usage** (premier audit, section 2.2) : pertes sur créances et TVA, impôt anticipé d'une raison individuelle, frais d'émission : toujours en l'état, faute de décision.
- **Postes partagés** : le travail d'un autre élève est toujours effacé après confirmation (ENS14) ; la reprise par fichier atténue le risque.

### 3.3 Nouveau

Réponses justes refusées et messages faux F1 à F4 ; variantes fausses F5 ; formulaire TVA au centime F6 ; orthographe notée F7 ; Lacroix 6400, 6500 et 6700 F8 ; LPP de 2022 F9 ; fuite des réponses dans le fichier d'évaluation et mode modifiable (ENS3) ; copie falsifiable (ENS4) ; maximum variable (ENS5) ; maîtrise obtenue sans connaissance et révision sur le premier format (NEU1 à NEU5) ; solution visible pendant la correction (NEU7) ; formative fermée (PED3-03) ; pas de retour individuel après une évaluation notée (PED3-02) ; calcul non exercé en 2ème CFC (PED3-08) ; pas d'alternance entre notions en 2ème CFC et en maturité (NEU10) ; import des copies sans archive ZIP ni conservation (ENS10, PED3-14).

### 3.4 Régressions introduites par les corrections récentes

- **Escompte passé en maturité (E7, 25.11.2026)** : la phrase « Un escompte corrige aussi la TVA. » et le compte 3209 sont restés dans le module TVA de 2ème CFC (F10). Correction incomplète plutôt que régression de code.
- **Minimum par format (26.11.2026)** : aucune régression, mais aucun effet sur les stratégies qui devinent (essai NEU, 20'000 séries : 11,97 % avec la règle comme sans elle). Le premier audit en attendait davantage.
- Aucune autre régression n'a été trouvée : les 623 tests passent, et aucun spécialiste n'a retrouvé un défaut corrigé.

### 3.5 Points où les deux audits se contredisent

| Sujet | Premier audit | Second audit | Arbitrage |
|---|---|---|---|
| Variante d'évaluation | Changer l'entreprise et l'ordre des opérations (action 8) | Changer les facteurs par opération casse les liens comptables (paiement d'une facture, décompte TVA, ducroire, amortissement, bilan d'ouverture) ; changer l'entreprise ne change pas le choix des comptes, qui est ce qu'on note | Le second audit a raison sur les liens comptables. Voir section 8. |
| Barème des écritures composées | 2 points par défaut dès trois comptes ou côtés, accepté par l'enseignant du premier audit | Refusé par le pédagogue et l'enseignant : des lignes justes dans un raisonnement faux rapporteraient des points ; l'éditeur doit montrer l'effet des points partiels et vous fixez le barème | Règle de notation : à vous de décider. |
| Révision espacée | « Sans remarque » | Une seule question, toujours du premier format ; réussite dès 75 % | Le second audit, prouvé par essai. |
| Maîtrise au module Bilan | 26 % des séries réussies en devinant les variations | 20,4 % pour un élève qui sait classer et devine les variations ; 12 % par série et 71 % à la révision pour un élève qui ne sait rien | Hypothèses différentes, pas de contradiction de fond : le défaut est confirmé et plus large. |
| Gamification | « Écritures autonomes : Seul·e, Terminé en autonomie à 80 % » ; défi de classe calculé d'après les fichiers de progression | Indicateur « premier coup » écarté (il pousse à éviter l'aide et dépend d'un diagnostic encore inexact) ; objectif de classe calculé sur les fichiers écarté (aucune source, fichiers modifiables à la main) | Le second audit : les deux mécaniques sont retirées. |
| Art. 725a et 725b CO | « Conformes » | Simplifiés : la restriction aux réserves non remboursables et les comptes intermédiaires manquent | Simplification admissible ; à écrire comme telle. |
| Formulaire TVA | Seule la détection hors classe 3 était en cause | L'impôt est aussi contrôlé au centime contre la somme comptabilisée | Défaut nouveau, latent. |

---

## 4. Les 15 actions prioritaires

Classées par impact, puis par effort. Porteur : C expert-comptable, E enseignant, P pédagogue, N neuroscientifique.

| Rang | Action | Constats | Impact | Effort | Porteur |
|---|---|---|---|---|---|
| 1 | Accepter l'apostrophe typographique, l'espace insécable et « CHF » dans tous les champs de montant, avec tests | F1 | Très fort | Faible | C |
| 2 | Corriger l'explication « La charge a déjà été comptabilisée » pour les factures en 2010 | F3 | Fort | Faible | C, P |
| 3 | « Incomplète » : compter un essai au second diagnostic, proposer la solution, message explicite pour l'écriture nette | F2 | Très fort | Faible | C, E |
| 4 | Compte courant : intérêts annuels supérieurs à 200 francs ; phrase sur la franchise dans la théorie | F4 | Fort | Faible | C |
| 5 | Retirer la variante du mode sommatif tant que F5 n'est pas corrigé ; avertir dans le guide et dans l'onglet Copies qu'une évaluation tirée d'un contenu fourni n'est pas fiable ; renommer « Fichier évaluation » des dossiers fournis en formative | ENS1, ENS2, F5 | Très fort | Faible | E |
| 6 | Fichier d'évaluation sans réponses en clair (facture des crédits, calcul et cause du budget), causes mélangées ; à l'import, contrôle par `dossierDeCopie`, du mode, des copies identiques et de la plus récente ; maximum fixe quand le bouclement est noté | ENS3, ENS4, ENS5 | Fort | Faible à moyen | E |
| 7 | Révision : format tiré au hasard parmi les formats à produire, deux questions, réponse entièrement juste ; module Bilan équilibré (actifs et passifs, quatre variations) ; choix des QCM mélangés ; banque « normes » élargie ; `trier` équilibré | NEU1, NEU2, NEU4, PED3-09 | Très fort | Faible | N, P |
| 8 | Trois états de maîtrise : « Réussie une fois », « Confirmée » après deux révisions réussies à des jours distincts, « À raviver » après une révision ratée, sans perte affichée ; l'enseignant voit l'état réel | NEU5 | Fort | Faible à moyen | N, P, E |
| 9 | Retour expliqué pour « classer », « variation », « retrouver l'opération » et « écriture fausse », par `raisonnement()` et `variationBilan()` | PED3-07, NEU8 | Fort | Faible | P, N |
| 10 | Écrire les simplifications comme des conventions du cours : pièce Mermoud, pertes sur créances, impôt anticipé, agio, art. 725a et 725b, « non assujetti » ; rappel TVA de 2ème CFC | C1-04, C1-06, C1-08, C1-09, C1-11, F10 | Moyen | Faible | C |
| 11 | Facturation : bénéficiaire comparé sans accents ni forme juridique ; formulaire TVA à 5 centimes ; Lacroix op. 5 avec deux montants ; LPP datée | F6, F7, F8, F9 | Moyen | Faible | C, E |
| 12 | Journal : solution masquée dès que l'élève saisit une ligne, bouton « Revoir la solution » enregistré dans le suivi ; indice de 2e niveau après une nouvelle saisie fausse ; diagnostic « inversée et compte faux » | NEU7, PED3-04 | Fort | Moyen | N, P |
| 13 | Guide à jour : simulateur, sept onglets, page « Données » avec l'exception du simulateur, dénominations, séquence de 45 minutes sans « qui a maîtrisé ? » à main levée ; puis `npm run guide` | ENS9, PED3-16 | Moyen | Faible | E |
| 14 | Copies : import d'une archive ZIP de Classroom, séance de correction gardée dans le navigateur de l'enseignant, liste de la classe pour voir qui n'a pas rendu, PDF par élève sans corrigé | ENS10, PED3-14, PED3-02 | Fort | Moyen | E, P |
| 15 | 2ème CFC : format de calcul dans chaque module d'écritures (amortissement, TVA, ducroire, net à payer), énoncés variés sans répétition dans une série, puis « Synthèse de clôture » qui mêle les familles | PED3-08, NEU3, NEU10 | Fort | Moyen | P, N, C |

Les actions 1 à 6 corrigent ce qui est faux ou non défendable ; 7 et 8 sont le préalable à toute gamification.

---

## 5. Constats détaillés par spécialiste

Importance après confrontation. Les constats repris en section 2 ne sont pas répétés en détail.

### 5.1 Expert-comptable (15 constats : 4 critiques, 6 importants, 5 de confort)

Méthode : 45 exercices et dossiers rejoués (journal complet de 3'476 lignes relu opération par opération), 18 variantes justes et fausses soumises au correcteur, 19 générateurs sur 3'000 graines, formulaire TVA sur 11 exercices, textes de loi lus sur Fedlex.

- Critiques : C1-01 (F1), C1-02 pour le message et l'aide bloquée (F2), C1-15 (F5), PED3-06 repris (F3).
- Importants : C1-03 (F2), C1-04, C1-06, C1-08 (écarts, 2.3), C1-05 (F9), C1-07 (F4, classé critique par l'orchestrateur), C1-10 (F6), Lacroix op. 5 et 11 (F8), ENS17 soutenu (F7).
- Confort : C1-09, C1-11, C1-12, C1-13, C1-14 (2.3).
- Hors constat : le décompte TVA passé tout entier par 2205, ou une vente TTC dont la TVA est extraite ensuite, donnent les mêmes soldes et sont refusés ; défendable, car l'énoncé impose la méthode. La formule des points partiels compte comme ni juste ni en trop une ligne au bon compte et au mauvais montant : à écrire dans le guide.

### 5.2 Enseignant de comptabilité (17 constats : 2 critiques, 11 importants, 4 de confort)

Méthode : notation par script sur des copies simulées (parfaite, vide, partielles, extournes, décompositions, bouclement) dans 68 exercices ; script publié téléchargé et cherché ; plans d'études lus.

1. **ENS1 Corrigés accessibles** (critique, `src/data/dossiers/index.ts` l. 25 à 30, `DossiersEnseignant.svelte` l. 91 à 110). Corrigés en clair dans le script public ; « Corrigé PDF » ouvert à quiconque choisit un code ; dossier « évaluation » identique à l'entraînement. Essai. Effort faible pour l'avertissement, élevé pour une vraie protection.
2. **ENS2 Variante déductible** (critique, avec F5). Facteur entier unique (× 3 : 14'400 = 3 × 4'800). Essai. Effort moyen.
3. **ENS3 Réponses dans le fichier d'évaluation, mode modifiable** (important après confrontation). Crédits du relevé avec leur facture, calcul et montant attendus du budget, bonne cause toujours en tête ; « evaluation » remplacé par « entrainement » : correction immédiate des fiches et du bouclement, copie acceptée par la synthèse. Essai. Effort moyen.
4. **ENS4 Copie falsifiable** (important). Écritures de 1999, ligne déséquilibrée : importée et notée 5 ; doublons non signalés ; la dernière copie importée l'emporte, pas la plus récente. Essai. Effort faible.
5. **ENS5 Maximum variable** (important). Élève sans charge ni produit : maximum 15 au lieu de 18, note 2,5 au lieu de 2,0 ; inversement, l'opération 1 seule plus le bouclement rapporte 4 points sur 18. Essai. Effort faible.
6. **ENS6 Une seule réponse admise, pas d'ajustement manuel** (important). Voir F8. Effort moyen.
7. **ENS7 Points partiels presque nuls** (important). 2010 au lieu de 2000 : 0 sur 1, 1 sur 3 avec un barème de 3. Essai. Effort faible.
8. **ENS8 2ème CFC et option Finances** (important). Plan fédéral : c5 (tronc commun) budget, factures, contrôle des paiements ; c6 (option Finances) comptabilisation, salaires, comptes annuels. Plan genevois dual 2025 : c5.ep1a à c en 1re année, c5.ep1d, ep3a, ep5a en 2e année, option Finances en 3e année. Domaines MP 3.2, 3.3, 5.3, 5.4, 5.5 et 8.1 sans module. Source : plan de formation SEFRI du 24.6.2021 (copie publique : https://www.swissbanking.ch/_Resources/Persistent/3/e/3/f/3e3fbdb3ea195bb5937dc9301ad219dd91967627/Plan_Formation_FR.pdf), PEC MP du 13.6.2025 (https://www.sbfi.admin.ch/dam/fr/sd-web/umUlonTbNY5o/Rahmenlehrplan_fr_web.pdf), plan genevois (https://www.ge.ch/document/14948/telecharger). Plan de la filière plein temps non trouvé. Effort moyen.
9. **ENS9 Guide incomplet** (important). Voir 3.2. Effort faible.
10. **ENS10 Remise par Classroom fastidieuse** (important). Pas d'import ZIP, copies perdues au rechargement, pas de liste des absents, analyse de classe sans les fiches. Lecture du code. Effort moyen.
11. **ENS11 Simulateur en ligne** (confort). Chaque enseignant doit créer son propre projet Supabase, sans explication dans le guide. Effort moyen.
12. **ENS12 Progression modifiable à la main** (important pour la gamification). Un « M » se fabrique dans un éditeur de texte. Recommandation retenue : ne jamais fonder une récompense ou une décision sur ce fichier ; la somme de contrôle a été abandonnée (elle se recalcule dans un code public).
13. **ENS13 Corrigé « encodé »** (confort). Base64 inversé, lisible en une ligne ; le dire dans le guide pour la formative.
14. **ENS14 Postes partagés, code oublié** (confort). Garder le travail des autres noms ; « code oublié : sauvegarder puis réinitialiser ».
15. **ENS15 Arrondi de la note figé au demi-point** (confort). Règle cantonale non vérifiée ; option dixième ou demi-point, note non arrondie dans le CSV.
16. **ENS16 Contenus tirés des manuels publiés** (important). Faire confirmer que les droits obtenus couvrent une publication sur un site public.
17. **ENS17 Orthographe notée** (important, F7).

### 5.3 Pédagogue (16 constats : 2 critiques, 11 importants, 3 de confort)

Cadre : alignement constructif (Biggs 1996), rétroaction (Hattie et Timperley 2007 ; Shute 2008 ; Kluger et DeNisi 1996), évaluation formative (Black et Wiliam 1998), autodétermination (Ryan et Deci 2000), pédagogie de la maîtrise (Bloom 1968), recherche d'aide (Aleven et al. 2003), exemples estompés (Renkl et Atkinson 2003).

Ce qui tient : les 45 exercices ont une situation de départ, les dossiers « pièces seules » partent de la situation de travail ; la séquence d'un module Apprendre est bien fondée ; le statut « Juste avec la solution » distingue honnêtement réussite autonome et aidée.

1. **PED3-01 Pas de matériel d'évaluation valide prêt à l'emploi** (critique après confrontation). Les 45 contenus fournis sont en entraînement ; la variante garde les mêmes opérations. Effort moyen.
2. **PED3-02 Aucun retour individuel après une évaluation notée** (important). Un seul PDF pour la classe. Après confrontation : retour d'abord sans corrigé (rattrapages, classes parallèles). Effort faible à moyen.
3. **PED3-03 Formative fermée d'un coup** (important). Statuts, solutions et note ensemble, saisie fermée, seule suite « recommencer ». Recommandation : deux temps (statuts et indices, saisie rouverte sur les opérations à revoir ; puis solutions et note masquable). Appui principal : Black et Wiliam 1998 ; Butler 1988 reclassé étude unique en classe. Effort moyen.
4. **PED3-04 Indices du journal** (important). Inversion avec compte faux reconnue 6 fois sur 541 ; salaire au brut sans retenues : « Relisez l'énoncé ». Après confrontation : indice de 2e niveau après une nouvelle saisie fausse. Essai. Effort moyen.
5. **PED3-05 Explications « Pourquoi ? » absentes en 2ème CFC et en maturité** (important). 1170/1171, 1xx0/1xx9, 1100/1109, 1300/2300, retenues oubliées. Les textes devront dépendre de la forme juridique (remarque de l'expert-comptable) et vous être soumis. Effort moyen.
6. **PED3-06 Explication fausse** (critique après confrontation, F3).
7. **PED3-07 Réponses fausses non expliquées dans Apprendre** (important). Effort faible.
8. **PED3-08 Calcul non exercé en 2ème CFC** (important). Effort moyen.
9. **PED3-09 Maîtrise en partie au hasard** (important, fusionné avec NEU1, NEU2, NEU4).
10. **PED3-10 Ni remédiation ciblée ni accélération** (important). « M'entraîner sur ce type de question » ; « Je pense déjà savoir », valable seulement si une série réussie le vérifie (condition du neuroscientifique). Effort moyen.
11. **PED3-11 Ponts incomplets** (important). 15 exercices cités par aucun chapitre ; 8 chapitres sans module, dont les ratios de maturité ; fin de module renvoyée vers 45 exercices sans recommandation ; élargi aux contenus contradictoires (F4, F8). Effort faible à moyen.
12. **PED3-12 Les 31 modules affichés à tout élève** (confort). Après confrontation : année de l'élève ouverte, années précédentes visibles, années suivantes repliées. Effort faible.
13. **PED3-13 Longue lecture avant la pratique** (confort). Après votre décision de garder les leçons : seules des questions non notées intercalées, sans toucher au texte.
14. **PED3-14 Charge de l'enseignant** (important). Chaque cycle repart de zéro. Effort moyen.
15. **PED3-15 Gamification** (important ; section 7).
16. **PED3-16 Guide en retard** (confort). « Sept modules » au lieu de huit ; point à main levée « qui a maîtrisé ? » qui expose les élèves en échec.

### 5.4 Neuroscientifique de l'éducation (16 constats : 0 critique, 11 importants, 5 de confort)

Méthode : trois élèves simulés sans compréhension (hasard, réponse la plus fréquente, mémoire par cœur) sur les 33 modules, avec les vraies fonctions du moteur, 4'000 à 20'000 graines. PC : psychologie cognitive ; NS : neurosciences.

| Id | Constat | Importance | Preuve | Domaine |
|---|---|---|---|---|
| NEU1 | « Le bilan » maîtrisé sans connaissance : 12 % par série, 71 % à la révision ; quatrième variation presque absente des modèles | important | essai | PC |
| NEU2 | Révision sur une question, toujours `formats[0]` | important | essai, lecture du code | PC |
| NEU3 | Modules d'écritures : 4 à 7 énoncés, 45 à 62 % de répétitions dans une série, réussis par cœur dès la 2e série | important | essai | PC |
| NEU4 | Normes : 6 questions, choix dans un ordre fixe | important | essai | PC |
| NEU5 | Maîtrise sur une série, jamais réévaluée ; « M » pour l'enseignant même après des révisions manquées ; meilleur score affiché plutôt que le dernier | important | lecture du code, calcul | PC |
| NEU6 | Estompage court (3 questions), facultatif, absent des 15 modules de calcul | important | lecture du code, sources | PC |
| NEU7 | Solution visible pendant la correction | important | lecture du code | PC |
| NEU8 | Retour réduit à la bonne réponse pour 4 formats sur 8 | important | lecture du code | PC |
| NEU9 | Aucun jugement de confiance | confort (limité à la révision) | surtout laboratoire | PC |
| NEU10 | Pas d'alternance entre notions en 2ème CFC et en maturité | important | lecture du code, méta-analyse | PC |
| NEU11 | Révision du jour absente de l'accueil ; intervalles croissants non étayés mais sans inconvénient | important (rappel), confort (intervalles) | lecture du code, méta-analyse | PC, NS pour le sommeil |
| NEU12 | Question projetée à main levée plutôt qu'avec des cartes ABCD | confort | étude en classe | PC |
| NEU13 | Lecture longue avant tout exercice ; effet du Bilan en direct à mesurer | confort | argument général | PC |
| NEU14 | Fiabiliser la mesure avant de gamifier | important | méta-analyses | PC |
| NEU15 | Aucun neuromythe | confort | lecture du code | sans objet |
| NEU16 | Rappel TVA sur l'escompte hors niveau | confort (F10) | lecture du code | sans objet |

Ce qui tient : les 15 modules de calcul et les formats à saisir résistent à toutes les stratégies sans compréhension (0 % sur 4'000 séries) ; la récupération est au cœur d'Apprendre ; le retour arrive au bon moment (immédiat en entraînement, différé en formative) ; la règle du minimum par format est utile contre le format négligé et doit rester.

---

## 6. L'apprentissage au regard des sciences cognitives

Presque toutes les recommandations relèvent de la psychologie cognitive. Les neurosciences n'apportent ici qu'une explication de fond (consolidation pendant le sommeil), aucune consigne directe.

### 6.1 Ce que l'outil fait bien

- **Pratique de récupération** : séries, révision, entraînement par la production d'écritures. Appui : Roediger et Karpicke 2006 (laboratoire) ; Adesope, Trevisan et Sundararajan 2017 (méta-analyse).
- **Espacement** : intervalles de 1, 3, 7, 14 et 30 jours, échec ramené à 1 jour. Appui : Cepeda et al. 2006 (méta-analyse). Le choix d'intervalles croissants n'apporte rien de plus qu'un calendrier régulier (Latimier, Peyre et Ramus 2021, méta-analyse, g = 0,034, non significatif) ; il n'est pas utile de le changer.
- **Exemple résolu avant la pratique**, raisonnement identique dans Apprendre et sous la solution du journal.
- **Honnêteté du signal** : « Réussie une fois · à confirmer », « Juste avec la solution ».
- **Modules de calcul** à données tirées au hasard : impossibles à deviner.

### 6.2 Ce qui manque, avec le niveau de preuve

| Recommandation | Constats | Niveau de preuve | Références |
|---|---|---|---|
| Critère de maîtrise exigeant : série réussie puis deux révisions réussies à des jours distincts, formats de production tirés au hasard | NEU1, NEU2, NEU5 | Fort pour l'apprentissage (laboratoire répliqué en classe, méta-analyses) ; effet sur la motivation peu chiffré | Rawson et Dunlosky 2011 ; Kulik, Kulik et Bangert-Drowns 1990 ; Latimier et al. 2021 |
| Effet du critère proposé, mesuré par essai : élève qui devine de 8,5 % à 1,4 % de faux « maîtrisé » ; élève qui réussit 80 % des questions de 54 % à 28 % par tentative | NEU1 | Essai | Le coût se compte en jours de calendrier, pas en travail |
| Retour qui explique plutôt que la seule bonne réponse | NEU8, PED3-07 | Méta-analyses | Van der Kleij, Feskens et Eggen 2015 ; Wisniewski, Zierer et Hattie 2020 |
| Un retour faux est pire qu'un retour absent : corriger F2, F3 avant tout | F2, F3 | Méta-analyse | Kluger et DeNisi 1996 |
| Solution masquée pendant la correction, aide graduée après une nouvelle saisie fausse | NEU7, PED3-04 | Études en classe | Koedinger et Aleven 2007 ; Baker, Corbett, Koedinger et Wagner 2004 ; Aleven et al. 2003 |
| Estompage vers l'arrière pour les calculs, avec questions d'auto-explication, retiré pour les élèves qui réussissent | NEU6 | Laboratoire et classe ; méta-analyse sur l'auto-explication | Atkinson, Renkl et Merrill 2003 ; Kalyuga et al. 2003 ; Bisra et al. 2018 |
| Énoncés variés et cas contrastés, pas de répétition dans une série | NEU3 | Méta-analyse | Brunmair et Richter 2019 |
| Alternance entre notions de clôture (2ème CFC, maturité) | NEU10 | Essai randomisé en classe, méta-analyse | Rohrer, Dedrick, Hartwig et Cheung 2020 ; Rohrer et Taylor 2007 ; Brunmair et Richter 2019 ; Kornell et Bjork 2008 (l'élève la juge à tort moins efficace) |
| Jugement de confiance en révision seulement, prédiction de score par série | NEU9 | Surtout laboratoire | Butterfield et Metcalfe 2001 ; Dunlosky et Rawson 2012 ; Bjork, Dunlosky et Kornell 2013 |
| Cartes-réponses ABCD pour la question projetée, sans réseau | NEU12 | Une étude en classe (plan ABAB) | Narayan, Heward, Gardner, Courson et Omness 1990 |
| Rappel des révisions sur l'accueil et en début de cours | NEU11 | Lecture du code ; consolidation : laboratoire | Diekelmann et Born 2010 (NS) |
| Questions non notées intercalées dans les leçons | PED3-13, NEU13 | Laboratoire | Richland, Kornell et Kao 2009 ; Sweller, van Merriënboer et Paas 2019 |
| Bilan en direct ouvert ou fermé par défaut en 1ère CFC | NEU13 | Inconnu | À comparer sur deux classes avant de trancher |

### 6.3 Neuromythes

Aucun neuromythe dans l'outil (recherche dans `src/data`, `src/ui` et `public/guide.html` : styles d'apprentissage, cerveau gauche ou droit, « 10 % du cerveau », pyramide de l'apprentissage, dopamine). Les deux phrases sur l'apprentissage présentes sont exactes. Aucun neuromythe non plus dans les propositions des autres spécialistes. Le neuroscientifique a signalé trois affirmations sans source, retirées pendant la confrontation : la durée d'attention citée par le pédagogue (la règle des « 10 minutes » n'a pas de base solide, Bradbury 2016) et sa propre phrase sur la baisse d'attention ; l'indicateur « premier coup » et l'objectif de classe ; la portée générale donnée à Butler 1988, une étude unique.

### 6.4 Fiabilité des références

Vérifiées en ligne par le neuroscientifique : Latimier et al. 2021, Sailer et Homner 2020, Christy et Fox 2014, Narayan et al. 1990. Les autres références sont citées de mémoire par les spécialistes et n'ont pas été relues par l'orchestrateur : elles sont connues et vérifiables, mais leurs chiffres précis sont à contrôler avant toute citation publique.

---

## 7. La gamification recommandée

Votre position (récompenser la maîtrise et la progression réelles, jamais le temps passé ni les clics) est jugée cohérente avec les méta-analyses par le neuroscientifique : effets moyens modestes et variables (Sailer et Homner 2020, méta-analyse, g = 0,49 sur les résultats cognitifs, 0,36 sur la motivation) ; récompenses pour la seule participation nuisibles à la motivation intrinsèque (Deci, Koestner et Ryan 1999, méta-analyse) ; baisse de motivation dans un cours entièrement gamifié avec classements et badges (Hanus et Fox 2015, étude en classe).

**Préalables, unanimes** : corriger F1 à F4 (réponses justes refusées et messages faux), puis fiabiliser le signal de maîtrise (actions 7 et 8). Sans cela, un badge récompenserait la devinette.

**Règles communes** : tout dans le navigateur de l'élève ; rien en évaluation formative ou sommative ; aucun effet sur la note ; aucun affichage public ; aucune décision fondée sur un fichier rendu par l'élève (modifiable à la main, ENS12).

| N° | Mécanique | Ce qu'elle récompense | Fonctionnement sans données en ligne | Pédagogue | Neuroscientifique |
|---|---|---|---|---|---|
| 1 | Carte de maîtrise de l'année | L'étendue de ce qui est retenu : notions à faire, réussies une fois, confirmées | Lecture de la clé `compta-pme:apprendre:v1`, aucune donnée de plus | Favorable | Favorable ; preuve indirecte (retour informatif) |
| 2 | Palier « Confirmée » | La rétention : deux révisions réussies à des jours distincts, sur des formats de production tirés au hasard ; jamais retiré ; « À raviver » après une révision ratée | Même clé, avec dates des révisions | Favorable | Favorable, le meilleur des mécanismes ; preuve forte pour l'apprentissage, indirecte pour la motivation |
| 3 | Opérations jumelles réussies | Avoir appris grâce à une solution vue : 2 ou 3 opérations voisines, tirées d'Apprendre, réussies sans aide en fin d'exercice | Générateurs existants ; résultat dans la session et la copie | Favorable (remplace « premier coup ») | Favorable (proposé en NEU7) ; preuve : études sur le dilemme d'assistance |
| 4 | Défi de transfert en fin de module | Une situation nouvelle réussie sans solution : un dossier de pièces du même chapitre ; échec renvoyé vers l'entraînement guidé, sans commentaire | Contenus existants ; trace locale | Favorable | Favorable à faible enjeu ; preuve indirecte (Brunmair et Richter 2019) |
| 5 | Progrès personnel par notion | Le dernier score et son évolution, plutôt que le meilleur score jamais obtenu | Même clé | Favorable | Favorable (NEU5 : le meilleur score fait surestimer son niveau) |
| 6 | Simulateur : classement entre groupes masquable, progrès de chaque groupe par rapport à lui-même | La progression du groupe | Inchangé : seul le jeu anonyme est échangé, selon l'exception existante | Favorable | Favorable avec précautions (Christy et Fox 2014, laboratoire : un classement peut nuire à certains élèves) ; débattre après la partie |

**Écartés par les spécialistes** : indicateur « juste du premier coup » (pousse à éviter l'aide, dépend d'un diagnostic encore inexact), objectif de classe calculé d'après les progressions rendues (aucune source, fichiers modifiables), points, niveaux, séries de jours consécutifs, badges de participation, classement individuel, chronomètre, tout palier calculé d'après un fichier rendu par l'élève. Le neuroscientifique admet une seule variante d'objectif collectif : une mesure faite en classe, avec cartes-réponses.

**Avis de l'enseignant auditeur** : rien avant NEU1, NEU2 et NEU5 ; jamais sur la base de fichiers d'élèves ; corriger d'abord ce qui est faux avant d'ajouter des étapes.

**Règle de `CLAUDE.md`** : la ligne « aucune gamification (sauf le simulateur) » est à réécrire par vous selon ces principes. `CLAUDE.md` n'a pas été modifié.

---

## 8. Désaccords entre spécialistes et arbitrage

### 8.1 Résolus pendant la confrontation

- **PED3-01 et PED3-06** passent de « important » à « critique » : le pédagogue s'est rangé aux arguments de l'enseignant (variante présentée comme sûre, F5) et de l'expert-comptable (contenu faux).
- **Écriture nette (C1-02)** : l'expert-comptable abandonne la compensation automatique, car Favre et le Garage enseignent justement la reprise d'un véhicule. Les quatre retiennent un message explicite compté comme un essai.
- **Facteur différent par opération (ENS2)** : abandonné par l'enseignant devant l'argument des liens comptables.
- **Somme de contrôle de la progression (ENS12)** : abandonnée (elle se recalcule dans un code public).
- **2 points automatiques pour une écriture composée (ENS7)** : abandonnés ; l'éditeur doit montrer l'effet des points partiels et vous fixez le barème.
- **Découpage des leçons** : abandonné par le pédagogue et le neuroscientifique, conformément à votre décision ; seules des questions intercalées restent.
- **Corrigé rendu à chaque élève par défaut** : abandonné ; retour d'abord sans corrigé.
- **« Sûr / Pas sûr » à chaque question (NEU9)** : limité à la révision.
- **Maîtrise qui recule (NEU5)** : trois états sans perte affichée ; l'enseignant voit l'état réel.
- **Indicateur « premier coup » et objectif de classe** : retirés par le pédagogue.
- **Affichage des seules notions de l'année (PED3-12)** : version de l'enseignant (années précédentes visibles, suivantes repliées), acceptée par les deux autres.
- **Dater ou recalculer la LPP (C1-05)** : l'expert-comptable admet les deux.

### 8.2 Maintenus, avec arbitrage

| Sujet | Positions | Arbitrage de l'orchestrateur |
|---|---|---|
| Importance d'ENS1 et ENS2 | Enseignant : critiques, une note fausse au bulletin a un effet comparable à une erreur de corrigé ; même surveillé, l'élève ouvre un second onglet en quelques secondes. Pédagogue et neuroscientifique : le niveau dépend de l'usage (évaluation surveillée en classe ou non). | Critiques, parce que le guide présente la variante comme la voie sûre et que F5 la rend fausse. ENS3 reste important (l'enseignant l'a abaissé lui-même : il faut modifier le fichier, ce qui se voit). |
| Avenir de la variante | Enseignant : assistant qui garde les liens, recalcule les montants dérivés et fait réécrire deux ou trois opérations par vous, sans génération depuis Apprendre. Pédagogue : opérations nouvelles générées, avec une banque de formulations réservée à l'évaluation et un tiers d'opérations de transfert. Neuroscientifique : génération valable seulement si la rédaction diffère de l'entraînement (concession pour la 1ère CFC, où l'association opération-écriture est la compétence visée). Expert-comptable : opérations nouvelles tirées des modèles validés. | Court terme sans regret : retirer la variante du mode sommatif et corriger F5. Long terme non tranché : les deux voies demandent du contenu que vous devrez valider. À trancher par vous. |
| Lacroix op. 5 et 11 (F8) | Enseignant : op. 11 critique (6700 contre 6500 ailleurs). Expert-comptable : important, 6700 est défendable, l'énoncé est mal posé. | Important. Les deux corrigés suivent une règle de `CLAUDE.md` que vous avez validée (abonnement au journal en 6700, revues spécialisées en 6500) : ce n'est pas une erreur, c'est une convention à confirmer ou à changer. |
| C1-07 (impôt anticipé sous 200 francs) | Expert-comptable : important. | Critique : réponse juste selon la loi refusée, ce que la consigne classe toujours critique (F4). |
| Ordre des aides du journal | Pédagogue : indice de 2e niveau à la demande. Neuroscientifique : seulement après une nouvelle saisie fausse, sinon l'élève clique jusqu'à la solution. Votre règle : solution dès la 1re erreur. | Convergence au second tour : indice de 2e niveau d'office après une nouvelle saisie fausse, solution toujours accessible dès la 1re erreur comme lien secondaire. Votre règle est gardée. |
| Masquage de la solution (NEU7) | Neuroscientifique : masquée dès que l'élève saisit une ligne, revue ligne par ligne pour une écriture composée, sinon le masquage se contourne d'un clic. Enseignant et pédagogue : bouton « Revoir la solution » tracé, réglable par exercice. | Retenir les deux : masquée dès la saisie, « Revoir » enregistré dans le suivi. Activé par défaut ou non : à vous. |
| Importance de PED3-12 | Neuroscientifique : important (charge cognitive). Pédagogue : confort. | Confort : le correctif est faible et sans enjeu de justesse. |
| Libellé de l'état intermédiaire | « À raviver » (pédagogue) ou « À rafraîchir » (enseignant) ; le neuroscientifique distingue les deux (révision en retard ou ratée). | Votre choix de vocabulaire. |

### 8.3 Ce qui reste à trancher par vous

1. **Usage de l'évaluation sommative** : en classe seulement, et blocage du mode sommatif pour les contenus fournis.
2. **Avenir de la variante d'évaluation** : assistant qui garde les liens, ou opérations générées avec une banque de formulations réservée.
3. **Écriture nette d'une reprise de véhicule** : accepter avec un message, ou exiger la présentation séparée (les quatre spécialistes conseillent le message compté comme un essai, sans acceptation).
4. **Conventions de comptes** : 6500 ou 6700 pour les abonnements ; montants séparés pour Lacroix op. 5.
5. **Simplifications du cours face à la loi** (section 2.3) : les garder en les écrivant comme conventions, ou les changer en maturité.
6. **Barème des écritures composées** et **arrondi de la note** (demi-point ou dixième).
7. **Tronc commun de 2ème CFC ou option Finances** : quel plan de votre école s'applique.
8. **Moment du retour des corrigés aux élèves** après une évaluation (absents, classes parallèles).
9. **Publication des contenus tirés des manuels** sur le site public, puis licence.
10. **Masquage de la solution par défaut**, et libellé « À raviver » ou « À rafraîchir ».
11. **Points du premier audit encore en attente** : la méthode au brut en 2ème CFC, les quatre points « à confirmer » de la théorie de maturité (impôt anticipé du compte courant en 1176 / 6950, dissolution d'une provision sans objet, droit de timbre, art. 725a et 725b ; ce dernier est confirmé avec la nuance de 2.3).

---

## 9. Chantiers marqués « à relire » dans CLAUDE.md

| Chantier | État | Remarques |
|---|---|---|
| Référence pédagogique du 23.11.2026 (Apprendre de 1ère CFC, exercices courts, erreurs typiques, bilan par notion) | Relu avec corrections | F3, PED3-07, PED3-09, NEU1, NEU2, NEU4 ; le bilan de classe par notion (`notions.ts`) n'a pas été relu |
| Plan d'études complet (seize modules de calcul) | Relu avec corrections | F1, F4, C1-09, NEU4, ENS8 ; aucune solution affichée refusée sur 19 générateurs |
| Écritures générées de 2ème CFC et de maturité | Relu avec corrections | NEU3, PED3-08, F10 ; comptes et côtés conformes aux corrigés validés |
| Formulaire officiel de décompte TVA | Relu avec corrections | F6 ; formulaire 0550 non relu (404) |
| Leçons d'Apprendre | Relu en partie | Longueur (PED3-13) ; aucune erreur comptable signalée, mais pas de relecture ligne à ligne par l'expert-comptable |
| Refonte de l'expérience du 23.11.2026 | Non relu | Aucun designer dans cet audit ; seul l'affichage des 31 modules a été vu (PED3-12) |
| Amélioration de l'interface, parties 1 à 6 | Non relu | Idem |
| Chantier B (bilan en direct, entraînement guidé, révision espacée) | Relu avec corrections | NEU2, NEU5, NEU6, NEU11, NEU13 ; bilan en direct sans défaut comptable retrouvé |
| Chantier C (progression, « Classer les pièces », question projetée) | Relu avec corrections | ENS12, NEU4 (`trier` déséquilibré), NEU12 |
| Lot B, théorie ch. 1 et 12 | Non relu en détail | Théorie validée par vous le 24.11.2026 ; exemples chiffrés vérifiés par les tests existants |
| Lot D, exercices et dossiers des ch. 1 et 12 (Favre, Vinothèque, Garage du Pont-Rouge, Hi-Fi Plainpalais) | Relu avec corrections | Calculs justes ; F2 (Favre op. 14, Garage op. 11) |
| Lot E, ch. 14 (Maison Lacroix, Électroménager du Rhône) | Relu avec corrections | Calculs justes ; F8 |
| Lot F, ch. 22 à 24 (Brodard, Mont-Blanc, Truffaz) | Relu sans remarque | Calculs justes |
| Lot G, ch. 25 (Confiserie du Bourg-de-Four) | Relu avec corrections | F9 (LPP de 2022) |
| Lot H, ch. 35 (Lambert Horlogerie) | Relu avec corrections | C1-11, C1-14 |
| Lot I, maturité (Zéphyr, Rive Gauche) | Relu avec corrections | C1-08 (agio de Zéphyr) ; calculs justes |
| Situations de départ des démos | Relu sans remarque | 45 exercices sur 45 en ont une, jugées crédibles par le pédagogue |
| Reprise d'un travail par fichier (26.11.2026) | Relu avec corrections | ENS4 : la vérification n'est pas utilisée à l'import des copies |
| Simulateur d'entreprise | Non relu | Seul ENS11 (projet Supabase) ; ni moteur ni corrigés relus |

---

## 10. Plan en trois vagues

**Vague 1 : corrections rapides** (chacune sur `apercu`, avec votre accord, action par action).
- F1 apostrophe typographique et « CHF », avec tests.
- F3 explication des factures en 2010.
- F2 « incomplète » compté comme essai et message de l'écriture nette.
- F4 compte courant au-dessus de 200 francs d'intérêt.
- F10 rappel TVA de 2ème CFC et compte 3209.
- F7 bénéficiaire sans accents ni forme juridique ; F6 tolérance du formulaire TVA.
- Variante retirée du mode sommatif ; avertissements dans le guide et dans l'onglet Copies.
- Fichier d'évaluation sans réponses en clair ; causes du budget mélangées.
- Contrôles à l'import des copies (rejeu, mode, doublons, copie la plus récente) ; maximum fixe du bouclement.
- Simplifications du cours écrites comme conventions (pièce Mermoud en premier) ; « la TVA est laissée de côté ».
- Guide à jour, puis `npm run guide`.

**Vague 2 : améliorations de fond.**
- Révision fiable et module Bilan équilibré ; trois états de maîtrise visibles par l'enseignant.
- Retours expliqués dans Apprendre ; solution masquée pendant la correction ; indice de 2e niveau ; diagnostic « inversée et compte faux ».
- F5 variantes reconstruites (pièces, TVA, fiches) ; plusieurs corrigés admis par opération et ajustement manuel des points.
- Formative en deux temps.
- Import ZIP, séance de correction conservée, liste de la classe, PDF par élève.
- Liste Apprendre ouverte sur l'année de l'élève ; révision du jour sur l'accueil ; cartes ABCD pour la question projetée.
- F8 et F9 selon vos décisions.

**Vague 3 : chantiers longs.**
- Formats de calcul dans les modules de 2ème CFC, énoncés variés, « Synthèse de clôture » de 2ème CFC puis de maturité.
- Erreurs typiques de 2ème CFC et de maturité, à vous soumettre avant de coder.
- Estompage pour les calculs ; remédiation ciblée et test de positionnement.
- Évaluations nouvelles (selon votre choix en 8.3, point 2).
- Gamification, dans l'ordre : palier « Confirmée » et carte de maîtrise, progrès personnel, opérations jumelles, défi de transfert, options du classement du simulateur.
- Correspondance avec les plans d'études : champ `plan` sur chaque exercice, marque « option Finances », modules pour les ratios.
- Guide du simulateur en ligne ; licence après décision sur les contenus de manuels.

---

## Annexe : ce que cet audit n'a pas couvert

- Pas de designer : interface, accessibilité, téléphone et accueil n'ont pas été réexaminés.
- Simulateur : ni moteur ni corrigés relus.
- PDF élève et corrigé, bilan de classe par notion, écrans TVA, salaires, répartition et analyse : non relus à l'écran.
- Formulaire 0550 de l'AFC, montants LPP 2026 sur le document de l'OFAS, taux fiscal du ducroire, règlement cantonal sur l'arrondi des notes, plan de la filière plein temps, format de l'archive Classroom : non vérifiés.
- Aucun essai sur un appareil réel ni dans un autre navigateur ; aucune mesure Lighthouse.
- Les rapports complets, les quatre réponses de chaque tour et les scripts d'essai sont dans le dossier de travail de la session, hors du dépôt. Ce dossier est temporaire : dites-moi si vous voulez les conserver.
