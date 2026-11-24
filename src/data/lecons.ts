// Leçons du parcours « Apprendre » (demande de l'enseignant du 24.11.2026 : une théorie solide, vulgarisée, avec des
// exemples). Deux leçons modèles, à valider sur la prévisualisation avant d'écrire les autres. Chaque partie : une idée,
// expliquée avec les mots de tous les jours, un exemple chiffré, le piège fréquent, ce qu'il faut retenir.
// Les règles reprennent la théorie validée (chapitres « Le bilan » et « Les comptes ») : rien de nouveau n'est inventé.

export interface PartieLecon {
  titre: string;
  /** Explication en langage courant, un paragraphe par élément. */
  texte: string[];
  exemple?: {
    situation: string;
    /** Tableau à deux colonnes (bilan, compte en T) : en-têtes puis lignes. */
    tableau?: { entetes: string[]; lignes: string[][] };
    lignes?: string[];
  };
  /** Erreur ou confusion fréquente. */
  piege?: string;
  retenir?: string;
}

export const LECON_BILAN: PartieLecon[] = [
  {
    titre: '1. Une photo de ce que l’on possède et de ce que l’on doit',
    texte: [
      'Commencez par vous. Léa, apprentie, possède un scooter, un ordinateur et un peu d’argent sur son compte. Elle a aussi une dette : ses parents lui ont avancé de l’argent pour le scooter.',
      'Si l’on fait la liste de ce qu’elle possède et de ce qu’elle doit, à une date précise, on obtient son bilan. Une entreprise fait exactement la même chose.',
    ],
    exemple: {
      situation: 'La situation de Léa au 31 décembre :',
      tableau: {
        entetes: ['Ce que Léa possède', 'CHF', 'D’où vient l’argent', 'CHF'],
        lignes: [
          ['Compte bancaire', '800.00', 'Dette envers ses parents', '1\'000.00'],
          ['Ordinateur', '1\'200.00', 'Sa fortune nette', '4\'000.00'],
          ['Scooter', '3\'000.00', '', ''],
          ['Total', '5\'000.00', 'Total', '5\'000.00'],
        ],
      },
    },
    retenir: 'Le bilan est une photo à une date précise : ce que l’on possède d’un côté, comment on l’a financé de l’autre.',
  },
  {
    titre: '2. Actif et passif : deux regards sur le même argent',
    texte: [
      'La colonne de gauche s’appelle l’actif : elle dit à quoi l’argent a servi (les emplois). La colonne de droite s’appelle le passif : elle dit d’où l’argent vient (les sources).',
      'C’est le même argent, regardé de deux façons. Voilà pourquoi les deux totaux sont toujours égaux : chaque franc qui a servi à quelque chose est forcément venu de quelque part.',
    ],
    exemple: {
      situation: 'Le bilan d’un magasin de vélos au 1er janvier :',
      tableau: {
        entetes: ['Actif (emplois)', 'CHF', 'Passif (sources)', 'CHF'],
        lignes: [
          ['Caisse', '2\'000.00', 'Emprunt bancaire à long terme', '25\'000.00'],
          ['Banque', '30\'000.00', 'Capital', '64\'000.00'],
          ['Stock de marchandises', '20\'000.00', '', ''],
          ['Mobilier et installations', '15\'000.00', '', ''],
          ['Véhicules', '22\'000.00', '', ''],
          ['Total de l’actif', '89\'000.00', 'Total du passif', '89\'000.00'],
        ],
      },
    },
    piege: '« Passif » ne veut pas dire « négatif ». Le capital figure au passif parce que c’est une source de fonds : l’argent apporté par le propriétaire.',
    retenir: 'Total de l’actif = total du passif, toujours.',
  },
  {
    titre: '3. Ranger l’actif : ce qui tourne et ce qui reste',
    texte: [
      'On range l’actif en deux groupes. Les actifs circulants changent sans cesse : l’argent en caisse et en banque, les factures que les clients doivent encore payer, le stock. Les actifs immobilisés servent à l’entreprise pendant des années : le mobilier, les machines, les véhicules.',
      'Demandez-vous : est-ce que cet élément va se transformer en argent bientôt, ou est-ce un outil de travail que l’entreprise garde ?',
    ],
    exemple: {
      situation: 'Dans le magasin de vélos :',
      lignes: [
        'Les vélos à vendre sont du stock : un actif circulant. Ils sont là pour être vendus.',
        'La camionnette de livraison est un véhicule : un actif immobilisé. Elle est là pour servir.',
      ],
    },
    piege: 'Le même objet peut changer de groupe selon l’entreprise : une voiture est du stock chez un garagiste qui la revend, un actif immobilisé chez un boulanger qui livre son pain.',
  },
  {
    titre: '4. Ranger le passif : l’argent des autres et l’argent du propriétaire',
    texte: [
      'Les capitaux étrangers sont l’argent des autres : il faudra le rendre. À court terme, ce sont les factures à payer aux fournisseurs. À long terme, ce sont les emprunts à la banque.',
      'Les capitaux propres sont l’argent du propriétaire : le capital qu’il a apporté. L’entreprise ne doit le rendre à personne d’autre.',
    ],
    retenir: 'Passif = capitaux étrangers (les dettes, à court puis à long terme) + capitaux propres (le capital).',
  },
  {
    titre: '5. Chaque opération fait bouger le bilan, sans jamais le déséquilibrer',
    texte: [
      'Une opération touche toujours au moins deux postes. Il n’y a que quatre cas possibles quand elle ne concerne que le bilan.',
    ],
    exemple: {
      situation: 'Les quatre variations :',
      tableau: {
        entetes: ['Opération', 'Effet', 'Total du bilan'],
        lignes: [
          ['Achat d’un scooter à crédit', 'Actif + et passif +', 'augmente'],
          ['Paiement de la facture du scooter', 'Actif − et passif −', 'diminue'],
          ['Retrait à la banque pour la caisse', 'Actif + et actif −', 'inchangé'],
          ['Emprunt remboursé par un apport du propriétaire', 'Passif − et passif +', 'inchangé'],
        ],
      },
    },
    piege: 'Acheter à crédit ne rend pas l’entreprise plus riche : elle possède un bien de plus, mais elle a une dette de plus, du même montant.',
    retenir: 'Si un seul côté bouge, c’est que vous avez oublié la moitié de l’opération.',
  },
];

export const LECON_COMPTES: PartieLecon[] = [
  {
    titre: '1. Pourquoi des comptes ?',
    texte: [
      'On pourrait refaire le bilan après chaque opération, mais ce serait interminable. On ouvre donc un compte par poste du bilan : un pour la caisse, un pour la banque, un pour les dettes… Chaque compte suit un seul poste, opération après opération.',
      'Pensez à votre relevé bancaire : une colonne pour ce qui entre, une colonne pour ce qui sort, et un solde. Un compte, c’est cela.',
    ],
    retenir: 'Un compte enregistre les augmentations et les diminutions d’un seul poste.',
  },
  {
    titre: '2. Le compte en T : gauche et droite, rien de plus',
    texte: [
      'On dessine le compte comme un T. Le côté gauche s’appelle le débit, le côté droit le crédit. Ce sont seulement des noms pour « gauche » et « droite ».',
    ],
    exemple: {
      situation: 'Le compte Caisse d’un magasin :',
      tableau: {
        entetes: ['Débit (gauche)', 'CHF', 'Crédit (droite)', 'CHF'],
        lignes: [
          ['Solde initial', '2\'000.00', 'Paiement de fournitures', '150.00'],
          ['Ventes au comptant', '900.00', 'Solde final', '2\'750.00'],
          ['Total', '2\'900.00', 'Total', '2\'900.00'],
        ],
      },
    },
    piege: 'Dans la vie courante, « débiter » veut dire retirer de l’argent et « créditer » en ajouter. En comptabilité, oubliez ce sens : débit = gauche, crédit = droite.',
  },
  {
    titre: '3. De quel côté le compte augmente-t-il ?',
    texte: [
      'Un compte augmente du côté où il se trouve dans le bilan. La caisse est à l’actif, donc à gauche : elle augmente à gauche, au débit. Une dette est au passif, donc à droite : elle augmente à droite, au crédit.',
      'Et chaque compte diminue de l’autre côté.',
    ],
    exemple: {
      situation: 'La règle en un tableau :',
      tableau: {
        entetes: ['Compte', 'Augmente', 'Diminue'],
        lignes: [
          ['Actif (caisse, banque, véhicules…)', 'au débit', 'au crédit'],
          ['Passif (dettes, emprunt, capital)', 'au crédit', 'au débit'],
        ],
      },
    },
    retenir: 'Actif : + au débit. Passif : + au crédit. Le compte augmente de son côté du bilan.',
  },
  {
    titre: '4. Trois questions pour trouver n’importe quelle écriture',
    texte: [
      'Devant une opération, ne cherchez pas l’écriture tout de suite. Posez-vous trois questions, dans l’ordre.',
      '1. Quels comptes sont touchés ? 2. De quel type est chacun : actif ou passif ? 3. Chacun augmente-t-il ou diminue-t-il ?',
    ],
    exemple: {
      situation: 'Mme Favre achète un scooter de 5\'000.00, payable à 30 jours.',
      lignes: [
        'Comptes touchés : Véhicules et Autres dettes.',
        'Véhicules est un compte d’actif, il augmente : débit.',
        'Autres dettes est un compte de passif, il augmente : crédit.',
        'Écriture : Véhicules / Autres dettes, 5\'000.00.',
      ],
    },
    piege: 'Elle n’a rien payé aujourd’hui : la banque n’est pas touchée. Lisez toujours l’opération jusqu’au bout avant de choisir les comptes.',
    retenir: 'Une écriture a toujours un débit et un crédit du même montant : c’est la partie double.',
  },
  {
    titre: '5. Le solde : où en est le compte ?',
    texte: [
      'Le solde est la différence entre les deux côtés. On l’inscrit du côté le plus faible, pour que les deux totaux soient égaux.',
      'Un compte d’actif a normalement un solde débiteur (le débit est le plus fort) ; un compte de passif, un solde créditeur.',
    ],
    exemple: {
      situation: 'Dans le compte Caisse ci-dessus :',
      lignes: ['Total du débit : 2\'000.00 + 900.00 = 2\'900.00.', 'Total du crédit : 150.00.', 'Solde final : 2\'900.00 − 150.00 = 2\'750.00, inscrit au crédit pour équilibrer.'],
    },
    retenir: 'Le solde final d’une année devient le solde initial de la suivante.',
  },
];
