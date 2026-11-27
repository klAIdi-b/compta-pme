// Guide d'utilisation du logiciel, pour les élèves et pour l'enseignant.

export type BlocGuide =
  | { type: 'p'; texte: string }
  | { type: 'etapes'; items: string[] }
  | { type: 'liste'; items: string[] }
  | { type: 'retenir'; texte: string };

export interface SectionGuide {
  id: string;
  titre: string;
  blocs: BlocGuide[];
}

export interface PartieGuide {
  id: 'eleve' | 'enseignant';
  titre: string;
  intro: string;
  sections: SectionGuide[];
}

export const GUIDE: PartieGuide[] = [
  {
    id: 'eleve',
    titre: 'Pour les élèves',
    intro:
      "Compta PME est un logiciel de comptabilité en partie double. Vous y tenez la comptabilité d'une entreprise " +
      'fictive : vous passez les écritures au journal, puis vous consultez les comptes et les états financiers.',
    sections: [
      {
        id: 'demarrer',
        titre: 'Démarrer un exercice',
        blocs: [
          {
            type: 'etapes',
            items: [
              'Le site a deux espaces, en haut de la page : « Comptabilité », où vous tenez la comptabilité d’entreprises, ' +
                'et « Cours », où vous apprenez les notions (Apprendre, Théorie). La page d’accueil mène à l’un ou à l’autre.',
              "Dans « Comptabilité », la rubrique « Exercices » présente les exercices du logiciel : choisissez votre formation " +
                "(CFC ou maturité professionnelle), puis ouvrez un niveau et choisissez l'exercice. " +
                "La recherche trouve un exercice par sujet (« TVA », « salaires »…). Un fichier reçu de votre enseignant " +
                "s'ouvre avec le bouton « Ouvrir un exercice reçu… ».",
              'Indiquez votre prénom, votre nom et votre classe (« Vos informations »), puis cliquez sur « Commencer ». ' +
                '« Votre mission » présente l’entreprise et ce qui vous est demandé.',
              'Cliquez sur « Commencer la saisie » pour ouvrir le journal.',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Votre travail est enregistré automatiquement dans ce navigateur, sur cet ordinateur. Rien n’est envoyé sur internet.',
          },
          {
            type: 'p',
            texte:
              "Quand vous revenez sur le site, l'accueil affiche « Votre prochaine étape » avec votre avancement. Tous les " +
              "exercices commencés dans ce navigateur sont dans « Comptabilité › Mes dossiers » : pour chacun, son origine " +
              "(exercice du logiciel, dossier de pièces, fichier de l'enseignant), son avancement et la date de votre dernière " +
              "activité ; « Ouvrir » le reprend là où vous l'aviez laissé. Pendant un exercice, « Mes dossiers » en haut de " +
              "l'écran ramène à cette liste.",
          },
          {
            type: 'retenir',
            texte:
              "Ordinateur partagé : si un autre élève indique son nom, le logiciel prévient que le travail enregistré sera " +
              "effacé. Exportez toujours votre copie avant de laisser l'ordinateur à quelqu'un d'autre.",
          },
        ],
      },
      {
        id: 'apprendre',
        titre: 'Apprendre pas à pas',
        blocs: [
          {
            type: 'p',
            texte:
              "Avant les exercices complets, « Apprendre » (espace « Cours », depuis la page d'accueil ou la barre latérale) reprend les notions " +
              'une à une, dans l’ordre du cours : écritures de la 1ère CFC, écritures composées de la 2ème CFC (TVA, ' +
              'amortissements, transitoires, créances, salaires) et de la maturité (société anonyme, titres), calculs de la 2ème CFC et de l’option ' +
              'Finances (livres auxiliaires, déclaration de salaire, marge contributive, répartition des coûts) et de la ' +
              'maturité (intérêts, compte courant, devises, calcul des prix à rebours, cession, perte de capital, titres et ' +
              'immeubles, point mort, flux de trésorerie, comptabilité analytique, normes).',
          },
          {
            type: 'etapes',
            items: [
              'Lisez l’objectif, la leçon et le résumé ; « Ouvrir le chapitre dans la Théorie » montre le chapitre du cours dans un nouvel onglet, sans quitter le module.',
              'Suivez l’exemple travaillé : quels comptes, de quel type, augmente ou diminue, donc débit ou crédit.',
              'Faites la série de 10 questions courtes : classer un compte, passer une écriture, retrouver l’opération, trouver ' +
                'l’écriture fausse, calculer un solde. Chaque réponse est corrigée tout de suite, avec une explication.',
              'Avec 8 réponses justes sur 10, la notion est maîtrisée. Sinon, recommencez : questions et montants changent.',
              'Une notion maîtrisée vous est redemandée quelques jours plus tard (« Révision du jour »). « Envoyer ma ' +
                'progression à l’enseignant » télécharge un fichier à rendre dans le devoir Google Classroom.',
            ],
          },
        ],
      },
      {
        id: 'ecran',
        titre: "Se repérer à l'écran",
        blocs: [
          {
            type: 'liste',
            items: [
              "En haut : l'entreprise, la formation et le niveau, le mode (entraînement ou évaluation) et votre avancement.",
              'À gauche, les rubriques rangées comme dans un logiciel comptable : « Votre mission », puis « Saisie » ' +
                '(journal), « Comptes » (comptes en T, grand livre, balance), « États financiers » (compte de résultat, ' +
                'bilan), « Clôture » (bouclement), « Fiches » (les fiches demandées par l’exercice) et « Outils » (TVA, ' +
                'salaire, facturation, budget, théorie). Les étapes de l’exercice sont cochées une fois faites ; en bas de ' +
                'chaque écran, « Étape suivante » indique toujours la suite, dans l’ordre du cours.',
              'Sur téléphone ou petite tablette, ce menu s’ouvre avec le bouton à trois traits en haut à gauche.',
              'Au centre : une seule tâche à la fois.',
              'Dans le journal, l’énoncé et ses opérations sont affichés à droite ou en dessous, selon la taille de l’écran.',
            ],
          },
        ],
      },
      {
        id: 'theorie',
        titre: 'Consulter la théorie',
        blocs: [
          {
            type: 'p',
            texte:
              'La théorie est le cours de référence : on y revient pour revoir une règle, chercher un exemple ou préparer une ' +
              'évaluation. Elle s’ouvre par l’espace « Cours », rubrique « Théorie », ou par la rubrique « Théorie » pendant un exercice.',
          },
          {
            type: 'liste',
            items: [
              'Dans la Théorie ouverte sans exercice, choisissez votre année : 1ère CFC, 2ème CFC ou Maturité professionnelle. Chaque année reprend les chapitres des précédentes.',
              'Chaque chapitre annonce ses objectifs, définit les termes à connaître, puis explique la règle avec des exemples résolus pas à pas.',
              '« Erreurs fréquentes » montre les pièges habituels et comment les éviter.',
              '« Vérifiez vos connaissances » : cherchez la réponse, puis cliquez sur la question pour l’afficher. Rien n’est noté ni enregistré.',
              '« Pour s’exercer » ouvre le module d’Apprendre pas à pas ou un exercice sur le même sujet.',
            ],
          },
        ],
      },
      {
        id: 'saisir',
        titre: 'Saisir une écriture',
        blocs: [
          {
            type: 'etapes',
            items: [
              "Cliquez sur une opération de l'énoncé : la date et le numéro de pièce se remplissent. Le numéro de pièce est " +
                "toujours le numéro de l'opération.",
              'Écrivez un libellé court (par exemple « Achat de marchandises à crédit »).',
              'Choisissez le compte au débit, puis le compte au crédit, puis tapez le montant.',
              "Appuyez sur Entrée : si l'écriture est équilibrée, elle est validée.",
            ],
          },
          {
            type: 'p',
            texte:
              'Touches utiles : Tab pour passer au champ suivant, Entrée pour passer à la ligne suivante ou valider, Échap pour ' +
              'retirer une ligne. Les montants s’écrivent librement : 1250, 1250.50 ou 1’250,50.',
          },
        ],
      },
      {
        id: 'comptes',
        titre: 'Choisir un compte',
        blocs: [
          {
            type: 'p',
            texte:
              'Cliquez dans un champ compte : la liste de tous les comptes de l’exercice s’ouvre, classée par classe. Vous ' +
              'pouvez aussi taper une partie du nom (« banque », « dettes four ») : la liste se réduit. Choisissez avec la ' +
              'souris, au doigt, ou avec les flèches puis Tab ou Entrée : le compte en surbrillance est choisi.',
          },
          {
            type: 'retenir',
            texte:
              'Le logiciel ne propose jamais la contrepartie : c’est à vous de décider quels comptes l’opération modifie.',
          },
        ],
      },
      {
        id: 'composee',
        titre: 'Écriture composée',
        blocs: [
          {
            type: 'p',
            texte:
              "Quand une opération touche plus de deux comptes, saisissez plusieurs lignes : sur chaque ligne, un compte au " +
              "débit ou au crédit avec son montant. Cliquez sur « Ajouter une ligne » sous la grille (ou appuyez sur Entrée à la fin d'une ligne). " +
              "Sous la grille, " +
              "l'écart entre débit et crédit s'affiche tant que l'écriture n'est pas équilibrée ; elle se valide dès que " +
              "l'écart est nul.",
          },
          {
            type: 'p',
            texte: 'Vous pouvez aussi décomposer l’opération en plusieurs écritures simples avec le même numéro de pièce.',
          },
        ],
      },
      {
        id: 'corriger',
        titre: 'Corriger une erreur',
        blocs: [
          {
            type: 'liste',
            items: [
              "Modifier : cliquez sur « Modifier », double-cliquez sur la ligne du journal, ou cliquez sur l'opération dans " +
                "l'énoncé. L'écriture revient dans la grille avec ce que vous aviez saisi ; corrigez-la, puis « Enregistrer la modification ».",
              'Supprimer : « Supprimer » retire l’écriture ; la grille propose aussitôt la même pièce pour la saisir à nouveau.',
              "Extourner : « Extourner » passe l'écriture inverse, avec le même numéro de pièce ; l'écriture fausse et son " +
                'extourne restent visibles dans le journal, comme en comptabilité.',
            ],
          },
        ],
      },
      {
        id: 'retour',
        titre: 'Le retour en mode entraînement',
        blocs: [
          {
            type: 'liste',
            items: [
              '« Juste » : l’opération est correctement comptabilisée.',
              '« Incomplète » : une partie de l’opération manque encore (par exemple une ligne d’une écriture composée).',
              "« À revoir » avec un indice : l'indice dit quel type d'erreur vous avez fait (débit et crédit inversés, " +
                'mauvais compte, montant erroné, TVA oubliée…), sans donner la réponse.',
              'Sous l’indice, le lien « Revoir la théorie » ouvre le chapitre du cours qui correspond à l’opération.',
              'Dès la première erreur, le bouton « Voir la solution » apparaît à côté de l’indice.',
            ],
          },
          {
            type: 'p',
            texte:
              'Quand vous avez choisi un mauvais compte pour une raison fréquente (un véhicule passé en charge, Dettes ' +
              'fournisseurs au lieu d’Autres dettes, un paiement repassé en charge…), « Pourquoi ? » explique ce qui a été ' +
              'confondu et propose le chapitre de théorie à revoir.',
          },
          {
            type: 'p',
            texte:
              "En haut à droite, la barre d'avancement indique combien de pièces vous avez saisies : en vert les justes, en " +
              "orange celles à revoir. Un clic ouvre le récapitulatif de toutes les pièces ; un clic sur une pièce l'ouvre " +
              "dans le journal. En évaluation, la barre indique seulement le nombre de pièces saisies.",
          },
          {
            type: 'p',
            texte:
              'En évaluation, aucun retour n’est affiché pendant le travail : votre enseignant corrige votre copie. En ' +
              'évaluation formative, aucun retour non plus pendant la saisie ; quand vous avez fini, « Terminer et voir la ' +
              'correction » (« Votre mission ») ferme la saisie et affiche ce qui est juste ou à revoir, les solutions et une ' +
              'note indicative. Dans l’espace « Comptabilité », la rubrique « Évaluation » regroupe les évaluations reçues de votre enseignant.',
          },
        ],
      },
      {
        id: 'consulter',
        titre: 'Consulter les comptes et les états',
        blocs: [
          {
            type: 'liste',
            items: [
              'Comptes : chaque compte en T, avec le solde initial (SI) et le solde final (SF), un compte à la fois ou tous ensemble.',
              'Grand livre : le détail de chaque compte avec le solde après chaque écriture.',
              'Balance : contrôle que le total des débits égale le total des crédits.',
              "Bilan et compte de résultat : présentés en forme de compte ; le bilan d'ouverture est aussi consultable.",
            ],
          },
        ],
      },
      {
        id: 'fiches',
        titre: 'Les fiches de calcul et la clôture',
        blocs: [
          {
            type: 'liste',
            items: [
              'Décompte de salaire : calculez les retenues et le salaire net avant de passer l’écriture.',
              'TVA : le décompte TVA due moins impôt préalable, d’après vos comptes. Si l’enseignant l’active, remplissez aussi le ' +
                'formulaire officiel de décompte (chiffres 200 à 510) d’après vos écritures, avant de passer le décompte au journal.',
              'Répartition du bénéfice et Analyse (maturité) : calculez les montants et les ratios demandés.',
              "Bilan d'ouverture, Marge brute et Échelle des prix (si l'enseignant les propose) : classez les comptes dans " +
                'les masses du bilan, calculez la marge brute d’après vos comptes avant bouclement, ou le prix de vente d’un article ; ' +
                'en entraînement, chaque résultat est contrôlé.',
              'Résultat par degrés, Flux de trésorerie et Seuil de rentabilité (maturité) : calculez chaque degré ou chaque ' +
                'flux d’après vos comptes avant bouclement ; en entraînement, chaque résultat est contrôlé.',
              'Facturation (2ème CFC et maturité, si l’enseignant la propose) : établissez les factures d’après les bons de ' +
                'commande (rabais, TVA et escompte arrondis aux 5 centimes, échéance), remplissez les ordres de paiement des ' +
                'factures reçues (escompte seulement dans le délai) et contrôlez les paiements des clients sur le relevé bancaire. ' +
                'Comptabilisez ensuite chaque pièce au journal. En évaluation, ces documents rapportent des points.',
              'Budget (2ème CFC et maturité, si l’enseignant le propose) : préparez le budget d’après la note de la direction, puis ' +
                'comparez-le avec les chiffres effectifs (donnés, ou soldes de vos comptes) : écart = effectif − budget, écart en % ' +
                '= écart ÷ budget × 100, appréciation (favorable, défavorable, conforme), cause principale et recommandation.',
              "Bouclement : depuis l'écran Bouclement, « Saisir les écritures de bouclement » ouvre le journal sur la pièce B1. " +
                "Chaque étape affiche sa consigne ; en entraînement, « Besoin d'aide ? » rappelle la règle, puis les comptes " +
                "concernés (sans les montants). Selon l'exercice, ces écritures sont corrigées comme les opérations.",
            ],
          },
          { type: 'p', texte: 'Ce que vous écrivez dans les fiches est enregistré avec votre travail.' },
          {
            type: 'p',
            texte:
              'Après le journal, le logiciel vous guide : dès la dernière opération juste (entraînement) ou saisie (évaluation), ' +
              'la balance s’ouvre, puis une barre en bas de l’écran donne la consigne de chaque étape et le bouton « Étape suivante » : ' +
              'balance, compte de résultat, bilan, bouclement, puis les fiches demandées.',
          },
        ],
      },
      {
        id: 'rendre',
        titre: 'Rendre son travail',
        blocs: [
          {
            type: 'etapes',
            items: [
              'Cliquez sur « Exporter ma copie » (en bas à gauche) : un fichier .compta-copie.json est enregistré dans vos téléchargements.',
              'Déposez ce fichier dans le devoir Google Classroom prévu par votre enseignant.',
              'Pour garder une trace imprimable, « Exporter en PDF » produit un document avec le journal, la balance et les états.',
            ],
          },
          {
            type: 'p',
            texte:
              'Sous le bouton « Exporter ma copie », une ligne indique où vous en êtes : copie jamais exportée, modifiée ' +
              'depuis le dernier export (exportez-la à nouveau avant de la rendre), ou exportée à telle date et heure.',
          },
          {
            type: 'p',
            texte:
              'Pour continuer sur un autre ordinateur : espace « Comptabilité », rubrique « Mes dossiers » ou « Exercices », bouton « Reprendre ma copie… », ' +
              'puis choisissez votre fichier .compta-copie.json. Pour un exercice reçu par fichier, ouvrez d’abord ce ' +
              'fichier avec « Ouvrir un exercice reçu… ». Votre progression d’« Apprendre pas à pas » se reprend de la même ' +
              'façon : « Envoyer ou reprendre ma progression », puis « Reprendre ma progression… ».',
          },
          {
            type: 'retenir',
            texte:
              "Votre travail n'existe que dans le navigateur de cet ordinateur. Exportez votre copie avant de changer " +
              "d'ordinateur ou de vider l'historique du navigateur : vous pourrez la reprendre ailleurs.",
          },
        ],
      },
    ],
  },
  {
    id: 'enseignant',
    titre: "Pour l'enseignant",
    intro:
      "L'espace enseignant permet de créer des exercices, d'importer ceux de collègues, de distribuer des dossiers de " +
      "pièces comptables et de corriger les copies. Il est protégé par un code simple, sans prétention de sécurité. Tout " +
      "reste dans le navigateur de l'ordinateur utilisé : aucun compte, aucune inscription.",
    sections: [
      {
        id: 'demarrer-classe',
        titre: 'Démarrer en 10 minutes avec sa classe',
        blocs: [
          {
            type: 'etapes',
            items: [
              'Ouvrez l’espace enseignant et choisissez votre propre code (aucun compte, rien à installer).',
              'Entraînement : onglet « Dossiers » ou « Partir d’un exemple… », puis « Copier le lien pour les élèves ». Collez ' +
                'le lien sur la plateforme de la classe : les élèves arrivent directement sur l’exercice.',
              'Les élèves indiquent leur nom et leur classe, travaillent, puis cliquent sur « Exporter ma copie » et vous ' +
                'remettent le fichier.',
              'Évaluation : « Variante d’évaluation » crée dans vos exercices une copie dont tous les montants sont ' +
                'multipliés par un même nombre. L’éditeur vous indique trois opérations à réécrire (texte et nouveau corrigé) : ' +
                'elles ne sont citées par aucune autre, les liens de l’exercice restent justes. Faites passer l’épreuve en ' +
                'classe, puis exportez-la pour les élèves ; son corrigé reste chez vous.',
              'Correction : onglet « Copies », importez les fichiers reçus (notes, erreurs, CSV, PDF).',
              'Sauvegardez vos exercices et partagez la sauvegarde avec vos collègues.',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Les exercices et dossiers fournis avec le logiciel ont des corrigés publics : utilisez-les pour l’entraînement ' +
              'et l’évaluation formative. Une variante seule ne suffit pas pour une note : l’élève qui connaît l’exercice ' +
              'public retrouve les comptes et divise les montants. Pour une évaluation notée, utilisez un exercice que vous ' +
              'avez créé, ou une variante dont vous avez modifié plusieurs opérations, en classe et sous surveillance.',
          },
        ],
      },
      {
        id: 'acces',
        titre: "Accéder à l'espace enseignant",
        blocs: [
          {
            type: 'etapes',
            items: [
              "Cliquez sur « Espace enseignant » (en haut à droite de la page d'accueil, ou en bas de la barre latérale).",
              'À la première visite dans un navigateur, choisissez vous-même un code d’au moins 4 caractères et confirmez-le. ' +
                'Il n’existe pas de code par défaut.',
              'Le code est ensuite demandé à chaque ouverture. Il se modifie dans l’onglet « Paramètres ».',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Le code et vos exercices sont enregistrés dans le navigateur de cet ordinateur seulement. Sur un autre ' +
              'ordinateur, vous créez un nouveau code et vous restaurez votre sauvegarde (voir « Sauvegarder et restaurer »).',
          },
        ],
      },
      {
        id: 'onglets',
        titre: 'Les onglets',
        blocs: [
          {
            type: 'liste',
            items: [
              'Exercices : vos exercices (création, modification, import, export).',
              'Dossiers : les dossiers de pièces comptables prêts à distribuer (PDF élève, corrigé PDF, fichiers d’exercice).',
              'Copies : correction automatique des copies rendues par les élèves, notes et statistiques de la classe.',
              'Progression : tableau des notions d’Apprendre, d’après les fichiers de progression rendus par les élèves.',
              'Simulateur : préparer et animer une partie du simulateur d’entreprise (voir « Le simulateur d’entreprise »).',
              'Relecture : liste de tout le contenu (théorie, exercices, dossiers, niveaux des comptes) à commenter.',
              'Paramètres : changement du code d’accès.',
            ],
          },
        ],
      },
      {
        id: 'creer',
        titre: 'Créer son propre exercice',
        blocs: [
          {
            type: 'p',
            texte:
              "Le plus rapide est de partir d'un exemple proche de ce que vous voulez : choisissez-le dans « Partir d'un " +
              "exemple… », cliquez sur « Copier cet exemple », puis adaptez l'entreprise, le bilan et les opérations. Pour " +
              'partir de zéro, cliquez sur « Nouvel exercice ».',
          },
          {
            type: 'etapes',
            items: [
              'Informations générales : titre, raison sociale, forme juridique, dates de l’exercice, formation (CFC ou ' +
                'maturité), niveau de difficulté, mode (entraînement ou évaluation), sujets traités (un par ligne), ' +
                'introduction et situation de départ présentée à l’élève.',
              '« Comptes et fonctions » (1ère CFC, 2ème CFC, maturité) fixe les comptes et les fonctions disponibles (TVA, fiches…). ' +
                'Dans « Comptes de l’exercice », cochez ou décochez ensuite les comptes proposés aux élèves.',
              "Bilan d'ouverture : choisissez les comptes et tapez les montants ; l'équilibre actif = passif est contrôlé.",
              "Opérations de l'énoncé : pour chacune, un numéro, une date, le texte et les points en évaluation. Le numéro " +
                "de l'opération est le numéro de pièce que l'élève inscrit dans le journal.",
              'Options : SI/SF ou San/Spb dans les comptes en T, bouclement par le compte 9000 ou intégration à la ' +
                'réouverture, correction des écritures de bouclement, TVA au net ou au brut, fiche « Décompte de salaire », ' +
                'calculatrice de TVA, répartition du bénéfice (sociétés).',
              '« Saisir le corrigé dans le journal » : passez les écritures exactement comme un élève, puis enregistrez le ' +
                'corrigé. Votre éventuel travail d’élève est mis de côté puis restauré.',
              'Vérifiez le cadre « Contrôle de l’exercice » en bas de page : il liste ce qui manque. Quand il indique ' +
                '« L’exercice est complet et peut être distribué », l’exercice est prêt.',
              "« Aperçu » (dans la liste de vos exercices, à côté des exemples et dans l'onglet « Dossiers ») ouvre " +
                "l'exercice exactement comme vos élèves le verront, avec le retour en entraînement. « Fermer l'aperçu » vous " +
                "ramène dans l'espace enseignant ; ce que vous avez saisi pendant l'aperçu n'est conservé nulle part.",
            ],
          },
          {
            type: 'liste',
            items: [
              'Écritures composées : le corrigé peut contenir plusieurs lignes ; l’élève peut aussi décomposer l’opération en ' +
                'plusieurs écritures simples avec le même numéro de pièce, c’est accepté.',
              'La date n’est pas contrôlée ; les montants le sont à 5 centimes près.',
              'Points partiels : cochez l’option pour accorder une partie des points sur les écritures touchant au moins trois ' +
                'comptes ou côtés. Ces écritures valent 2 points par défaut (1 point pour les autres) ; par exemple, sur 2 points, ' +
                'un élève qui a juste 2 lignes sur 3 sans ligne en trop obtient 1 point (2 × 2 ÷ 3 = 1,33, au demi-point inférieur).',
              "Exercices tirés d'un manuel : reformulez l'énoncé et changez les données (entreprise, montants). Les manuels " +
                'protégés ne doivent pas être recopiés dans un fichier distribué.',
            ],
          },
        ],
      },
      {
        id: 'distribuer',
        titre: 'Distribuer un exercice aux élèves',
        blocs: [
          {
            type: 'etapes',
            items: [
              '« Exporter pour les élèves » enregistre un fichier .compta-exercice.json dans vos téléchargements.',
              'Déposez ce fichier dans un devoir Google Classroom de la classe.',
              "L'élève ouvre le site, clique sur « Ouvrir un exercice reçu… » et choisit le fichier.",
            ],
          },
          {
            type: 'liste',
            items: [
              'En entraînement, le fichier contient le corrigé sous forme encodée : l’élève reçoit un retour immédiat.',
              'En évaluation, le fichier ne contient pas le corrigé et l’élève ne reçoit aucun retour pendant le travail.',
              '« Version enseignant » : fichier complet, corrigé en clair. Conservez-le : il sert à corriger les copies, à ' +
                'retrouver l’exercice sur un autre ordinateur et à le partager avec un collègue.',
            ],
          },
        ],
      },
      {
        id: 'partager',
        titre: 'Partager ses exercices entre collègues',
        blocs: [
          {
            type: 'etapes',
            items: [
              "L'auteur exporte la « Version enseignant » de l'exercice et la transmet à son collègue.",
              'Le collègue ouvre l’espace enseignant, onglet « Exercices », clique sur « Importer un exercice… » et choisit ' +
                'le fichier.',
              "L'exercice apparaît dans sa liste : il peut le modifier, l'exporter pour ses élèves et corriger les copies.",
            ],
          },
          {
            type: 'retenir',
            texte:
              "Ne remettez jamais la version enseignant d'une évaluation aux élèves : elle contient le corrigé en clair. " +
              'Un fichier élève peut aussi être importé, mais une évaluation arrive alors sans corrigé.',
          },
        ],
      },
      {
        id: 'sauvegarde',
        titre: 'Sauvegarder et restaurer ses exercices',
        blocs: [
          {
            type: 'p',
            texte:
              "Vos exercices ne sont enregistrés que dans le navigateur de cet ordinateur. Ils disparaissent si l'on vide les " +
              "données du navigateur, si l'on change d'ordinateur ou si l'adresse du site change. Sauvegardez-les régulièrement.",
          },
          {
            type: 'etapes',
            items: [
              'Onglet « Exercices » : « Sauvegarder tous mes exercices » enregistre un seul fichier .compta-sauvegarde.json ' +
                'dans vos téléchargements, avec tous les exercices et leurs corrigés.',
              'Rangez ce fichier en lieu sûr (dossier personnel de l’école, clé USB). La date de la dernière sauvegarde est ' +
                'affichée sous les boutons.',
              'Sur un autre ordinateur, ou après une perte : « Restaurer une sauvegarde… » et choisissez le fichier. Les ' +
                'exercices sont ajoutés ; un exercice déjà présent est remplacé par sa version sauvegardée.',
            ],
          },
          {
            type: 'retenir',
            texte:
              'La sauvegarde contient les corrigés en clair : ne la donnez pas aux élèves. Le code d’accès n’y figure pas.',
          },
        ],
      },
      {
        id: 'dossiers',
        titre: 'Les dossiers de pièces comptables',
        blocs: [
          {
            type: 'p',
            texte:
              "Dix-neuf dossiers prêts à l'emploi, un par grand thème (CFC niveaux 1 à 4, maturité niveaux 1 à 5). Chacun présente " +
              'une entreprise fictive et 10 à 12 pièces : factures, tickets de caisse, quittances, avis bancaires, fiches de ' +
              "salaire, notes internes. L'élève doit trouver lui-même l'écriture à partir du document.",
          },
          {
            type: 'liste',
            items: [
              'Paquet élèves (ZIP) : le dossier PDF et le fichier d’entraînement, à déposer tels quels pour la classe.',
              'Paquet complet (ZIP) : en plus, le corrigé PDF, le fichier d’évaluation et sa version enseignant. Il contient ' +
                'les corrigés : gardez-le pour vous.',
              'Dossier PDF : à imprimer ou à déposer pour les élèves (situation, consignes, bilan d’ouverture, une pièce par page).',
              'Corrigé PDF : écritures de chaque pièce, bouclement et états financiers, pour l’enseignant.',
              'Fichier entraînement et fichier évaluation : à distribuer comme un exercice ordinaire. Dans le journal, la pièce ' +
                's’affiche au-dessus de la grille de saisie.',
              'Les dossiers figurent aussi dans la liste des exercices de l’espace « Comptabilité », en entraînement.',
            ],
          },
        ],
      },
      {
        id: 'sequences',
        titre: 'Séquences prêtes : apprendre pas à pas',
        blocs: [
          {
            type: 'p',
            texte:
              'Le parcours « Apprendre pas à pas » compte huit modules pour la 1ère CFC : le bilan, débit et crédit, ' +
              'charges et produits, factures, dettes et créances, le compte privé, achats et ventes de marchandises, ' +
              'une synthèse, puis « Classer les pièces ». La 2ème CFC a en plus une synthèse des écritures de clôture. ' +
              'Chaque module correspond à un chapitre de la théorie.',
          },
          {
            type: 'etapes',
            items: [
              '5 minutes, en début d’heure : faites ouvrir la « Révision du jour » (deux questions par notion à confirmer).',
              '5 minutes, en classe entière : projetez l’objectif et « L’essentiel » du module ; ouvrez la théorie si besoin.',
              '10 minutes : déroulez l’exemple travaillé au projecteur en faisant répondre la classe aux trois questions ' +
                '(quels comptes, de quel type, augmente ou diminue).',
              '15 à 25 minutes, individuellement : l’entraînement guidé (trois questions avec une aide qui diminue), puis une ' +
                'série. La notion est réussie à 8 points sur 10, avec au moins la moitié des points dans chaque type de ' +
                'question ; sinon, nouvelle série. Circulez auprès de ceux qui échouent deux fois.',
              '5 minutes : projetez une question pour la classe (« Projeter une question »), faites répondre chacun en même ' +
                'temps sur une ardoise ou une carte A, B, C, D, puis révélez la réponse. Évitez le « qui a réussi ? » à main ' +
                'levée, qui expose les élèves en difficulté.',
              'Après les modules 1 à 5, donnez un exercice complet de niveau 1 (par exemple Cycles du Léman) ; après le module 6, ' +
                'un exercice avec marchandises. Le journal terminé, le logiciel guide l’élève jusqu’au bouclement.',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Les séries sont générées : deux voisins n’ont pas les mêmes questions, et un élève peut s’entraîner autant qu’il le faut. ' +
              'La progression reste dans le navigateur de l’élève (aucune donnée en ligne). Une notion réussie une fois devient ' +
              '« confirmée » après deux révisions réussies, deux jours différents ; une révision ratée la rend « à raviver », ' +
              'sans rien retirer.',
          },
        ],
      },
      {
        id: 'progression',
        titre: 'Suivre la progression et animer la classe',
        blocs: [
          {
            type: 'liste',
            items: [
              'Onglet « Progression » : importez les fichiers de progression rendus par les élèves. Le tableau montre, pour ' +
                'chaque élève et chaque notion, « C » (confirmée), « R » (réussie une fois), « À » (à raviver), le meilleur ' +
                'score ou « – » (pas commencé). Ce fichier est rempli par l’élève : il renseigne sur son travail, il ne ' +
                'prouve pas la maîtrise et ne doit pas servir à noter.',
              '« Projeter une question pour la classe » (dans chaque module d’Apprendre) affiche une question en grand : ' +
                'la classe répond à main levée, puis vous révélez la réponse et l’explication.',
            ],
          },
        ],
      },
      {
        id: 'corriger-copies',
        titre: 'Corriger les copies',
        blocs: [
          {
            type: 'etapes',
            items: [
              'Les élèves cliquent sur « Exporter ma copie » et vous remettent leur fichier .compta-copie.json.',
              'Onglet « Copies » : choisissez l’exercice. Il doit se trouver dans vos exercices avec son corrigé ; pour une ' +
                'évaluation préparée par un collègue, importez d’abord sa version enseignant.',
              '« Importer des copies… » : sélectionnez tous les fichiers reçus en une fois.',
              'Le tableau donne les points et la note de chaque élève, le détail par opération et les erreurs les plus ' +
                'fréquentes de la classe.',
              '« Détail » affiche, pour chaque opération fausse, les écritures de l’élève à côté du corrigé (la case à ' +
                'cocher montre aussi celles des opérations justes).',
              '« Bilan de la classe par notion » regroupe les opérations par notion du cours : taux de réussite, élèves sous ' +
                '50 % à reprendre (groupe de remédiation) et erreur typique la plus fréquente, avec les élèves concernés.',
              '« Exporter les résultats (CSV) » produit un fichier qui s’ouvre dans Excel.',
              '« Copies corrigées (PDF) » produit un seul document pour la classe : le tableau des notes, puis une page par ' +
                'élève avec le résultat de chaque opération et, pour les erreurs, ses écritures à côté du corrigé.',
              '« Un PDF par élève (ZIP) » produit une archive avec un PDF par élève, à déposer dans Classroom : la note et le ' +
                'résultat de chaque opération, sans le corrigé (cochez « avec le corrigé » quand toutes les classes ont passé l’épreuve).',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Note = 1 + points obtenus / points maximum × 5, arrondie au demi-point. Avec la rubrique Facturation, chaque ' +
              'facture établie vaut 3 points, chaque ordre de paiement 2 points et le contrôle des paiements 3 points, au ' +
              'prorata des champs justes (au demi-point inférieur). Avec la rubrique Budget : 3 points pour le budget préparé ' +
              'et 3 points pour la comparaison.',
          },
        ],
      },
      {
        id: 'relecture',
        titre: 'Relire et valider le contenu',
        blocs: [
          {
            type: 'p',
            texte:
              "La théorie, les exercices et les dossiers fournis avec le logiciel sont des propositions à relire. L'onglet " +
              "« Relecture » les liste tous, avec l'avancement de votre relecture.",
          },
          {
            type: 'etapes',
            items: [
              '« Aperçu » ouvre un exercice ou un dossier comme le voient les élèves ; « Lire » ouvre un chapitre de théorie.',
              'Cochez « Validé » quand le contenu est juste. Sinon, cliquez sur « Remarque » et notez ce qu’il faut corriger ' +
                '(numéro de pièce ou section, montant, compte, formulation).',
              'Les boutons « À relire », « Avec remarque » et « Tout » filtrent la liste.',
              '« Exporter mes remarques (texte) » produit un fichier qui classe les éléments : à corriger, validés, pas encore relus.',
            ],
          },
          {
            type: 'retenir',
            texte:
              "Vos avis restent dans ce navigateur et sont inclus dans votre sauvegarde. Ils ne changent pas ce que voient les " +
              "élèves : transmettez le fichier de remarques pour que le contenu officiel soit corrigé.",
          },
        ],
      },
      {
        id: 'simulateur',
        titre: 'Le simulateur d’entreprise',
        blocs: [
          {
            type: 'p',
            texte:
              'Des groupes d’élèves dirigent chacun une entreprise sur un marché commun : à chaque tour (un mois ou un ' +
              'trimestre), ils décident des achats, du prix et de la publicité ; le logiciel calcule les ventes et le ' +
              'résultat, et la comptabilité est saisie par les élèves ou passée automatiquement, selon votre choix.',
          },
          {
            type: 'etapes',
            items: [
              'Onglet « Simulateur » : créez une partie (niveau, nombre de tours, durée d’un tour, secteurs, groupes).',
              'Sans connexion : chaque groupe vous remet son fichier de décisions ; vous l’importez, puis vous jouez le tour ' +
                'et rendez à chaque groupe le fichier de sa situation.',
              'En ligne (facultatif) : il faut un projet Supabase à vous ; les étapes sont décrites dans le document ' +
                '« simulateur-mise-en-ligne » du dépôt. Seules des données de jeu anonymes sont échangées.',
              'Imprévus : vous pouvez déclencher une hausse d’un fournisseur ou un client insolvable pendant la partie.',
              'Projection : le classement entre groupes s’affiche par défaut ; débattez-en après la partie.',
            ],
          },
        ],
      },
      {
        id: 'donnees',
        titre: 'Données et confidentialité',
        blocs: [
          {
            type: 'p',
            texte:
              "Le logiciel fonctionne entièrement dans le navigateur. Aucune donnée d'élève n'est envoyée sur internet : les " +
              'échanges se font uniquement par fichiers. Seule exception : la partie en ligne du simulateur d’entreprise, si ' +
              'vous la lancez, échange des données de jeu anonymes (code de partie, nom d’équipe, décisions, résultats), ' +
              'jamais un nom d’élève, une écriture ou une note. Les copies importées dans l’onglet « Copies » ne sont pas ' +
              'enregistrées : conservez les fichiers reçus. Vider les données du navigateur efface vos exercices : gardez ' +
              'toujours la version enseignant de chacun.',
          },
        ],
      },
    ],
  },
];
