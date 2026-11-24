// Leçons du parcours « Apprendre », CFC 1re et 2e année (modèle validé par l'enseignant le 24.11.2026, contenu à relire).
// Les règles reprennent la théorie et les règles validées du projet (CLAUDE.md) ; les exemples sont chiffrés à la main.
import type { PartieLecon } from './lecons';

const T = (entetes: string[], ...lignes: string[][]) => ({ entetes, lignes });

export const LECONS_CFC: Record<string, PartieLecon[]> = {
  'charges-produits': [
    {
      titre: '1. Gagner et dépenser : le résultat',
      texte: [
        "Jusqu'ici, le bilan montrait ce que l'entreprise possède. Mais comment sait-on si elle gagne de l'argent ? Il faut compter ce que son activité lui rapporte et ce qu'elle lui coûte.",
        "Ce qu'elle rapporte s'appelle les produits : les ventes, les honoraires. Ce qu'elle coûte s'appelle les charges : le loyer, les salaires, l'électricité, l'assurance.",
      ],
      exemple: {
        situation: "L'année d'un magasin de vélos :",
        tableau: T(['', 'CHF'], ['Total des produits', "18'750.00"], ['Total des charges', "15'220.00"], ['Bénéfice', "3'530.00"]),
      },
      retenir: 'Produits − charges = résultat. Positif : un bénéfice. Négatif : une perte.',
    },
    {
      titre: '2. De quel côté écrire ?',
      texte: [
        "Une charge se comporte comme un actif : elle augmente au débit. Un produit se comporte comme un passif : il augmente au crédit.",
        "L'autre moitié de l'écriture est presque toujours un compte que vous connaissez déjà : la caisse, la banque, une créance ou une dette.",
      ],
      exemple: {
        situation: 'Deux opérations de tous les jours :',
        tableau: T(
          ['Opération', 'Débit', 'Crédit', 'CHF'],
          ['Loyer du mois payé par la banque', 'Loyers', 'Banque', "1'850.00"],
          ['Ventes au comptant de la journée', 'Caisse', 'Ventes de marchandises', '900.00'],
        ),
      },
      retenir: 'Charge : + au débit. Produit : + au crédit.',
    },
    {
      titre: '3. Charge ou investissement ?',
      texte: [
        "Toute dépense n'est pas une charge. Une charge est consommée pendant l'année : l'essence est brûlée, le loyer est passé. Un investissement reste : la camionnette sera encore là dans cinq ans.",
        "La question à se poser : à la fin de l'année, est-ce qu'il en reste quelque chose qui sert encore à l'entreprise ?",
      ],
      exemple: {
        situation: 'La même camionnette, deux dépenses :',
        lignes: ['Le plein de carburant : une charge (Frais de véhicules).', "L'achat de la camionnette : un actif immobilisé (Véhicules), qui figure au bilan."],
      },
      piege: "Passer un véhicule ou un ordinateur en charge fait croire que l'entreprise a perdu cet argent, alors qu'elle possède un bien.",
    },
    {
      titre: '4. Ce qui ne change pas le résultat',
      texte: [
        "Une opération qui ne touche que des comptes du bilan ne modifie pas le bénéfice. Retirer de l'argent à la banque pour la caisse, acheter un ordinateur, rembourser un emprunt : l'entreprise n'est ni plus riche ni plus pauvre.",
      ],
      piege: "Rembourser un emprunt n'est pas une charge : on rend de l'argent qu'on devait. Seul l'intérêt est une charge.",
      retenir: 'Pas de compte de charge ni de produit dans une écriture : le résultat ne bouge pas.',
    },
  ],

  factures: [
    {
      titre: '1. Deux moments : la facture, puis le paiement',
      texte: [
        "Au comptant, tout se passe en une fois : la marchandise contre l'argent. À crédit, il y a deux moments, et donc deux écritures : d'abord la facture, plus tard le paiement.",
        "Entre les deux, quelqu'un doit de l'argent à quelqu'un. C'est cela qu'il faut enregistrer.",
      ],
      retenir: 'À crédit : une écriture à la facture, une autre au paiement.',
    },
    {
      titre: '2. Quand nous vendons à crédit',
      texte: [
        "Le client a reçu la marchandise mais n'a pas encore payé. La vente est faite : c'est un produit. Et le client nous doit de l'argent : c'est une créance, un actif.",
        "Quand il paie, la créance disparaît et l'argent arrive. La vente, elle, est déjà comptée.",
      ],
      exemple: {
        situation: "Vente de vélos à un club, 6'400.00, payable à 30 jours :",
        tableau: T(
          ['Moment', 'Débit', 'Crédit', 'CHF'],
          ['La facture', 'Créances clients', 'Ventes de marchandises', "6'400.00"],
          ['Le paiement du client', 'Banque', 'Créances clients', "6'400.00"],
        ),
      },
      piege: "Au paiement, n'écrivez pas une deuxième fois « Ventes » : la vente serait comptée à double.",
    },
    {
      titre: '3. Quand nous achetons à crédit : deux comptes de dettes',
      texte: [
        "Nous avons reçu quelque chose et nous devons de l'argent. Mais à qui, et pour quoi ? La règle du cours distingue deux cas.",
        "Si ce sont des marchandises achetées pour être revendues, la dette va dans Dettes fournisseurs. Pour tout le reste, un véhicule, du mobilier, un ordinateur, une annonce publicitaire, la dette va dans Autres dettes.",
      ],
      exemple: {
        situation: 'Trois factures reçues :',
        tableau: T(
          ['Facture', 'Débit', 'Crédit', 'CHF'],
          ['Des vélos à revendre', 'Achats de marchandises', 'Dettes fournisseurs', "4'800.00"],
          ["Une camionnette d'occasion", 'Véhicules', 'Autres dettes', "12'500.00"],
          ['Une annonce dans le journal', 'Publicité', 'Autres dettes', '650.00'],
        ),
      },
      retenir: 'Marchandises à revendre : Dettes fournisseurs. Tout le reste : Autres dettes.',
    },
    {
      titre: '4. Quand nous payons',
      texte: ["Le paiement éteint la dette : elle diminue, au débit. L'argent sort de la banque, au crédit. La charge ou l'achat a déjà été compté à la réception de la facture."],
      exemple: {
        situation: 'Paiement de la facture des vélos :',
        lignes: ["Dettes fournisseurs / Banque, 4'800.00."],
      },
      piege: "Avant d'écrire, demandez-vous : la facture a-t-elle déjà été comptabilisée ? Si oui, le paiement ne touche que la dette et la banque.",
    },
  ],

  prive: [
    {
      titre: '1. Deux poches à ne pas confondre',
      texte: [
        "Dans une raison individuelle, le propriétaire et l'entreprise sont la même personne aux yeux de la loi. Mais en comptabilité, on sépare strictement les deux poches : l'argent de l'entreprise n'est pas l'argent de poche du propriétaire.",
        "Le compte Privé enregistre tout ce qui passe d'une poche à l'autre pendant l'année.",
      ],
      retenir: "Le compte Privé suit ce que le propriétaire prend dans l'entreprise pour lui-même.",
    },
    {
      titre: '2. Ce que le propriétaire prend',
      texte: ["Il peut prendre de l'argent, faire payer une facture personnelle par l'entreprise, ou emporter des marchandises. Dans les trois cas, le compte Privé est débité."],
      exemple: {
        situation: 'Trois prélèvements :',
        tableau: T(
          ['Opération', 'Débit', 'Crédit', 'CHF'],
          ['Il prend de la caisse pour ses besoins', 'Privé', 'Caisse', '800.00'],
          ["Sa facture de dentiste est payée par la banque de l'entreprise", 'Privé', 'Banque', '640.00'],
          ['Il emporte des marchandises (au prix coûtant)', 'Privé', 'Prestations propres', '380.00'],
        ),
      },
      piege: "La facture du dentiste n'est pas une charge de l'entreprise, même si c'est sa banque qui paie.",
    },
    {
      titre: "3. Ce que le propriétaire apporte",
      texte: ["S'il apporte durablement de l'argent à l'entreprise, son capital augmente."],
      exemple: { situation: "Apport de 12'000.00 sur le compte bancaire :", lignes: ["Banque / Capital, 12'000.00."] },
    },
    {
      titre: "4. À la fin de l'année",
      texte: ["Le compte Privé ne reste pas ouvert : à la clôture, son solde est viré au capital. Les prélèvements de l'année diminuent ainsi le capital du propriétaire, et le bénéfice l'augmente."],
      retenir: 'Privé : un compte de passage, soldé chaque année par le capital.',
    },
  ],

  marchandises: [
    {
      titre: '1. Trois comptes pour les marchandises',
      texte: [
        "Un commerce achète des marchandises et les revend plus cher. On utilise un compte pour les achats (une charge), un compte pour les ventes (un produit), et un compte pour le stock (un actif).",
        "Pendant l'année, on ne touche pas au stock : chaque achat va dans Achats de marchandises, chaque vente dans Ventes de marchandises. Le stock n'est corrigé qu'à la clôture, après l'inventaire.",
      ],
      piege: "Un achat de marchandises ne se passe pas dans le compte Stock, même si les cartons arrivent dans l'entrepôt.",
    },
    {
      titre: '2. Retours et rabais : on défait une partie de la facture',
      texte: ["Quand une marchandise est rendue ou qu'un rabais est accordé après coup, la facture de départ est en partie annulée. L'écriture va dans l'autre sens."],
      exemple: {
        situation: 'Côté achats et côté ventes :',
        tableau: T(
          ['Opération', 'Débit', 'Crédit'],
          ['Nous retournons des marchandises au fournisseur', 'Dettes fournisseurs', 'Achats de marchandises'],
          ['Le fournisseur nous accorde un rabais après coup', 'Dettes fournisseurs', 'Déductions obtenues'],
          ['Un client nous retourne des marchandises', 'Ventes de marchandises', 'Créances clients'],
          ['Nous accordons un rabais à un client', 'Déductions accordées', 'Créances clients'],
        ),
      },
      retenir: 'Un retour ou un rabais diminue la dette ou la créance de départ.',
    },
    {
      titre: '3. Les frais autour des marchandises',
      texte: [
        "Faire venir la marchandise coûte : transport, douane, assurance. Ces frais d'achats augmentent le coût des marchandises.",
        "Livrer la marchandise au client coûte aussi. Ces frais de ventes diminuent le chiffre d'affaires.",
      ],
      exemple: {
        situation: 'Deux factures de transport payées par la banque :',
        lignes: ["Transport d'un achat : Frais d'achats / Banque.", 'Livraison à un client : Frais de ventes / Banque.'],
      },
    },
    {
      titre: '4. À la clôture : le stock et la marge',
      texte: [
        "On compte ce qui reste en magasin : c'est l'inventaire. Si le stock a augmenté, une partie des achats n'a pas été vendue. S'il a diminué, on a vendu plus que ce qu'on a acheté.",
        "On peut alors calculer la marge brute : ce que les ventes rapportent, moins ce que les marchandises vendues ont coûté.",
      ],
      exemple: {
        situation: "Le stock passe de 12'000.00 à 14'500.00 :",
        lignes: ["Augmentation de 2'500.00 : Stock de marchandises / Variation de stocks, 2'500.00."],
      },
      retenir: "Marge brute = chiffre d'affaires net − prix de revient d'achat des marchandises vendues.",
    },
  ],

  'synthese-cfc1': [
    {
      titre: "1. Lire l'opération jusqu'au bout",
      texte: ["Les erreurs viennent rarement de la règle : elles viennent d'une lecture trop rapide. Chaque mot de l'énoncé décide d'un compte."],
      exemple: {
        situation: 'Les quatre indices à repérer :',
        tableau: T(
          ['Indice', 'Ce que cela décide'],
          ['« en espèces », « par la poste », « par la banque »', 'Caisse, Poste ou Banque'],
          ['« à crédit », « payable à 30 jours », « nous comptabilisons la facture »', "Une créance ou une dette, pas d'argent aujourd'hui"],
          ['« facture déjà comptabilisée »', 'Le paiement touche seulement la dette ou la créance'],
          ['« pour ses besoins privés », « personnelle »', 'Le compte Privé'],
        ),
      },
    },
    {
      titre: '2. Puis les trois questions',
      texte: ['Quels comptes sont touchés ? De quel type est chacun ? Augmente-t-il ou diminue-t-il ? Avec ces trois réponses, le débit et le crédit se placent tout seuls.'],
      exemple: {
        situation: 'Rappel des quatre types de comptes :',
        tableau: T(['Compte', 'Augmente', 'Diminue'], ['Actif', 'au débit', 'au crédit'], ['Passif', 'au crédit', 'au débit'], ['Charge', 'au débit', 'au crédit'], ['Produit', 'au crédit', 'au débit']),
      },
      retenir: "Une écriture juste, c'est une lecture juste : comptant ou crédit, marchandise ou investissement, entreprise ou privé.",
    },
  ],

  'classer-pieces': [
    {
      titre: '1. Avant le débit et le crédit : de quoi parle la pièce ?',
      texte: ["Une facture arrive sur votre bureau. Avant de penser aux comptes, demandez-vous ce que l'entreprise a reçu. Il n'y a que quatre réponses."],
      exemple: {
        situation: 'Les quatre classeurs :',
        tableau: T(
          ['Classeur', 'La question à se poser', 'Exemple'],
          ['Marchandises à revendre', "Est-ce acheté pour être revendu ?", 'Des vélos pour le magasin'],
          ['Investissement', "Est-ce un bien qui servira plusieurs années ?", 'Une camionnette, un ordinateur'],
          ["Charge de l'entreprise", "Est-ce consommé pendant l'année ?", 'Le loyer, le téléphone, le carburant'],
          ['Privé', 'Est-ce pour le propriétaire lui-même ?', 'Sa facture de dentiste'],
        ),
      },
    },
    {
      titre: "2. Le même objet, deux classeurs possibles",
      texte: ["Ce n'est pas l'objet qui décide, c'est ce que l'entreprise en fait. Une voiture est une marchandise chez le garagiste qui la revend, et un investissement chez le boulanger qui livre son pain."],
      piege: "L'ordinateur du bureau est un investissement ; les cartouches d'encre qu'on y met sont une charge, consommée dans l'année.",
      retenir: 'Classer la pièce, puis seulement chercher les comptes.',
    },
  ],

  'tva-ecritures': [
    {
      titre: "1. L'entreprise encaisse la TVA pour l'État",
      texte: [
        "Quand vous achetez un vélo, vous payez la TVA au magasin. Mais cet argent n'est pas pour le magasin : il doit le reverser à la Confédération. Le magasin joue le rôle de percepteur.",
        "En échange, il récupère la TVA qu'il a lui-même payée sur ses propres achats : c'est l'impôt préalable. Il ne verse donc que la différence.",
      ],
      retenir: 'TVA due (sur les ventes) − impôt préalable (sur les achats) = montant à verser. Taux normal : 8,1 %.',
    },
    {
      titre: '2. Comptabiliser au net : la TVA à part',
      texte: ["Avec la méthode au net, on sépare la TVA dès la facture. Le compte de vente ou d'achat ne reçoit que le montant hors taxe ; la TVA va dans son propre compte."],
      exemple: {
        situation: "Une vente et un achat de 1'000.00 hors taxe, à crédit :",
        tableau: T(
          ['Opération', 'Débit', 'Crédit'],
          ['Vente', "Créances clients 1'081.00", "Ventes de marchandises 1'000.00 et TVA due 81.00"],
          ['Achat de marchandises', "Achats de marchandises 1'000.00 et IP s/marchandises et services 81.00", "Dettes fournisseurs 1'081.00"],
        ),
      },
      piege: "Il y a deux comptes d'impôt préalable : l'un pour les marchandises et les services, l'autre pour les investissements et les autres charges d'exploitation (électricité, véhicule, publicité…).",
    },
    {
      titre: '3. Quand le prix est donné TVA comprise',
      texte: ["Un ticket de caisse affiche le total payé par le client. Pour retrouver la TVA, on ne prend pas 8,1 % du total : le total représente 108,1 % du prix hors taxe."],
      exemple: {
        situation: "Ventes au comptant, TVA comprise : 5'405.00",
        lignes: ["TVA = 5'405.00 × 8,1 ÷ 108,1 = 405.00.", "Hors taxe = 5'405.00 − 405.00 = 5'000.00.", "Écriture : Caisse 5'405.00 / Ventes 5'000.00 et TVA due 405.00."],
      },
      retenir: 'TVA comprise : diviser par 108,1 et multiplier par 8,1. Arrondir aux 5 centimes.',
    },
    {
      titre: '4. Le décompte : régler ses comptes avec la Confédération',
      texte: ["À la fin de la période, on vire l'impôt préalable en diminution de la TVA due. Ce qui reste est la dette envers l'Administration fédérale des contributions (AFC), que l'on paie ensuite."],
      exemple: {
        situation: "TVA due 3'321.00 ; impôt préalable 810.00 et 24.30 :",
        lignes: ["TVA due 3'321.00 / IP s/marchandises et services 810.00, IP s/investissements et AGE 24.30, Dettes AFC 2'486.70.", "Puis le paiement : Dettes AFC / Banque, 2'486.70."],
      },
    },
    {
      titre: "5. Un escompte corrige aussi la TVA",
      texte: ["Si le client paie moins que prévu grâce à un escompte, la vente est plus petite : la TVA due aussi. On corrige donc les deux."],
      retenir: "Escompte accordé : Déductions accordées et TVA due au débit. Escompte obtenu : Déductions obtenues et impôt préalable au crédit.",
    },
  ],

  'amortissements-ecritures': [
    {
      titre: '1. Un bien qui vieillit perd de la valeur',
      texte: [
        "Une camionnette achetée 20'000.00 ne vaut plus 20'000.00 après trois ans. Chaque année, elle s'use et perd une partie de sa valeur.",
        "L'amortissement répartit le coût du bien sur les années où il sert. C'est une charge, mais sans sortie d'argent : l'argent est sorti le jour de l'achat.",
      ],
      retenir: "Amortir, c'est constater chaque année la perte de valeur d'un bien durable.",
    },
    {
      titre: '2. Deux façons de calculer',
      texte: ["En linéaire (ou constant), on prend le même montant chaque année, calculé sur la valeur d'acquisition. En dégressif, on prend le même pourcentage, mais sur la valeur qui reste : le montant diminue d'année en année."],
      exemple: {
        situation: "Véhicule de 20'000.00, taux de 25 % :",
        tableau: T(['Année', 'Linéaire', 'Dégressif'], ['1', "5'000.00", "5'000.00"], ['2', "5'000.00", "3'750.00"], ['3', "5'000.00", "2'812.50"]),
      },
      piege: "Dégressif : le taux s'applique à la valeur comptable (ce qui reste), pas à la valeur d'acquisition.",
    },
    {
      titre: "3. Deux façons d'écrire",
      texte: [
        "Méthode directe : on diminue directement le compte du bien. Le bilan montre ce qu'il vaut encore.",
        "Méthode indirecte : le compte du bien garde sa valeur d'acquisition. Les amortissements s'accumulent dans un compte à part, le fonds d'amortissements cumulés. La valeur comptable est la différence entre les deux.",
      ],
      exemple: {
        situation: "Amortissement de 5'000.00 sur le véhicule :",
        lignes: ["Directe : Amortissements / Véhicules.", "Indirecte : Amortissements / FAC s/véhicules (fonds d'amortissements cumulés)."],
      },
      retenir: "Valeur comptable = valeur d'acquisition − amortissements cumulés.",
    },
    {
      titre: "4. Acheté en cours d'année : le prorata",
      texte: ["Un bien acheté le 1er juillet n'a servi que six mois. On ne compte que 6/12 de l'amortissement annuel."],
      exemple: { situation: "Amortissement annuel de 5'000.00, achat le 1er juillet :", lignes: ["5'000.00 × 6 ÷ 12 = 2'500.00."] },
    },
  ],

  'transitoires-ecritures': [
    {
      titre: '1. Chaque année doit porter ses propres charges',
      texte: [
        "Le bénéfice de 2026 doit refléter ce qui s'est passé en 2026. Or les paiements ne tombent pas toujours la bonne année : on paie parfois d'avance, parfois en retard.",
        "Les comptes transitoires corrigent ce décalage à la clôture.",
      ],
      retenir: "Ce qui compte, c'est l'année concernée, pas la date du paiement.",
    },
    {
      titre: "2. Payé d'avance : une partie concerne l'an prochain",
      texte: ["Si une charge payée cette année couvre aussi l'an prochain, on en retire la part qui ne nous concerne pas encore. Cette part est un actif : l'entreprise a droit à une prestation future."],
      exemple: {
        situation: "Prime d'assurance de 1'200.00 payée le 1er juillet pour douze mois :",
        lignes: ["Six mois concernent l'an prochain : 600.00.", 'Au 31.12 : Actifs transitoires / Assurances, 600.00.'],
      },
    },
    {
      titre: '3. Pas encore payé : la charge existe quand même',
      texte: ["Si une charge de cette année n'est ni payée ni facturée au 31 décembre, on l'ajoute. C'est une dette à venir."],
      exemple: { situation: "Le loyer de décembre, 2'000.00, n'est pas encore payé :", lignes: ["Au 31.12 : Loyers / Passifs transitoires, 2'000.00."] },
      piege: "Actif ou passif ? Payé d'avance : l'entreprise a un avoir, c'est un actif transitoire. Pas encore payé : elle doit quelque chose, c'est un passif transitoire.",
    },
    {
      titre: "4. Au 1er janvier : on extourne",
      texte: ["Les comptes transitoires ne servent qu'à passer d'une année à l'autre. À la réouverture, on passe l'écriture inverse : la charge retrouve sa place dans la nouvelle année."],
      exemple: { situation: "Extourne de l'assurance payée d'avance :", lignes: ['Au 01.01 : Assurances / Actifs transitoires, 600.00.'] },
      retenir: "Clôture : on régularise. Réouverture : on extourne, par l'écriture inverse.",
    },
  ],

  'creances-ecritures': [
    {
      titre: '1. Le client ne paiera pas : une perte',
      texte: ["Vendre à crédit, c'est prendre un risque. Si un client fait faillite, sa créance ne vaut plus rien : il faut la sortir du bilan. C'est une perte."],
      exemple: { situation: "Un client en faillite devait 2'160.00 :", lignes: ["Pertes s/créances / Créances clients, 2'160.00."] },
      retenir: 'Dans le cours, la TVA de la vente perdue n\'est pas corrigée.',
    },
    {
      titre: '2. Le client paiera peut-être : une créance douteuse',
      texte: ["Entre le bon client et la faillite, il y a le doute. On isole alors la créance dans un compte à part, pour la surveiller. Si le client verse finalement une partie, le reste devient une perte."],
      exemple: {
        situation: "Créance de 3'200.00 devenue douteuse, puis 1'200.00 reçus pour solde de tout compte :",
        lignes: ["Créances douteuses / Créances clients, 3'200.00.", "Puis : Banque 1'200.00 et Pertes s/créances 2'000.00 / Créances douteuses 3'200.00."],
      },
    },
    {
      titre: '3. Le ducroire : prévoir les pertes à venir',
      texte: [
        "À la clôture, on ne sait pas encore quels clients ne paieront pas, mais on sait qu'il y en aura. Le ducroire est une estimation de ce risque, souvent un pourcentage des créances.",
        "Chaque année, on ne comptabilise que la différence entre le ducroire qu'il faut et celui qui existe déjà.",
      ],
      exemple: {
        situation: "Créances de 40'000.00, ducroire voulu de 5 %, ducroire existant de 1'500.00 :",
        lignes: ["Ducroire nécessaire : 2'000.00. Il manque 500.00.", 'Pertes s/créances / Ducroire, 500.00.', "S'il fallait le diminuer : Ducroire / Pertes s/créances."],
      },
      piege: "On ne repasse pas le ducroire entier chaque année : seulement l'ajustement.",
    },
    {
      titre: "4. Une bonne surprise : la créance amortie est payée",
      texte: ["Parfois, un client dont la créance avait été passée en perte une année précédente finit par payer. Ce n'est pas une vente : c'est un produit exceptionnel."],
      exemple: { situation: 'Un ancien client verse 450.00 :', lignes: ['Banque / Produits exceptionnels, 450.00.'] },
    },
  ],

  'salaires-ecritures': [
    {
      titre: '1. Du salaire brut au salaire net',
      texte: [
        "Le salaire convenu dans le contrat est le salaire brut. L'employé ne le reçoit pas en entier : l'employeur retient ses cotisations aux assurances sociales et les verse à sa place.",
        "Ce qui arrive sur le compte de l'employé est le salaire net.",
      ],
      exemple: {
        situation: "Salaire brut de 5'000.00, taux donnés par l'énoncé :",
        tableau: T(['', 'CHF'], ['Salaire brut', "5'000.00"], ['− AVS/AI/APG/AC 6,4 %', '320.00'], ['− LPP (caisse de pension) 4 %', '200.00'], ['Salaire net', "4'480.00"]),
      },
    },
    {
      titre: "2. L'écriture du salaire",
      texte: ["La charge de l'entreprise est le brut. Le net sort de la banque ; les retenues deviennent des dettes envers les assurances, à verser plus tard."],
      exemple: {
        situation: 'Le salaire ci-dessus :',
        lignes: ["Salaires 5'000.00 / Dette AVS 320.00, Dette LPP 200.00, Banque 4'480.00."],
      },
      piege: "Passer seulement le net en charge sous-estime le coût du salaire.",
    },
    {
      titre: "3. La part de l'employeur",
      texte: ["L'employeur paie lui aussi des cotisations, en plus du salaire. C'est une charge supplémentaire : les charges sociales."],
      exemple: {
        situation: 'Mêmes taux que pour l\'employé :',
        lignes: ["Charges sociales 520.00 / Dette AVS 320.00 et Dette LPP 200.00.", "Coût total pour l'entreprise : 5'000.00 + 520.00 = 5'520.00."],
      },
    },
    {
      titre: '4. Le versement aux assurances',
      texte: ["Les dettes accumulées (part de l'employé et part de l'employeur) sont versées aux caisses. La dette s'éteint."],
      exemple: { situation: 'Paiement de la dette envers la caisse AVS :', lignes: ['Dette AVS / Banque, 640.00.'] },
      retenir: "Un salaire coûte plus à l'employeur que le brut, et rapporte moins à l'employé que le brut.",
    },
  ],

  'livres-auxiliaires': [
    {
      titre: '1. Un compte pour tous, un compte pour chacun',
      texte: [
        "Le compte Créances clients dit combien tous les clients nous doivent ensemble. Mais pour relancer un client en retard, il faut savoir combien chacun doit.",
        "Le livre auxiliaire tient donc un compte par client. Le compte Créances clients en est le total : on l'appelle le compte collectif.",
      ],
      exemple: {
        situation: 'Trois clients au 31 mars :',
        tableau: T(['Client', 'Solde initial', '+ Factures', '− Paiements', 'Solde'], ['Garage Favre', '400.00', "1'200.00", '900.00', '700.00'], ['Hôtel du Parc', '0.00', "1'180.00", '0.00', "1'180.00"], ['Total = Créances clients', '400.00', "2'380.00", '900.00', "1'880.00"]),
      },
      retenir: 'Somme des comptes individuels = solde du compte collectif. Sinon, il y a une erreur à chercher.',
    },
    {
      titre: '2. À quoi cela sert',
      texte: ["Le livre auxiliaire montre qui paie à temps, qui est en retard, et à qui il ne faut plus vendre à crédit. Le même principe existe pour les fournisseurs."],
    },
  ],

  'declaration-salaire': [
    {
      titre: '1. Une fois par an, on déclare tous les salaires',
      texte: ["Pendant l'année, l'employeur verse des acomptes à la caisse de compensation. À la fin de l'année, il lui déclare les salaires réellement versés à chaque employé. La caisse calcule alors ce qui est vraiment dû."],
      retenir: "La masse salariale est la somme des salaires bruts de l'année.",
    },
    {
      titre: '2. Le calcul',
      texte: ["Les cotisations se calculent sur la masse salariale. Elles sont payées pour moitié par l'employé (retenue sur son salaire) et pour moitié par l'employeur."],
      exemple: {
        situation: "Deux employés à 5'000.00 et 4'000.00 par mois, douze salaires :",
        lignes: [
          "Masse salariale : 12 × 5'000.00 + 12 × 4'000.00 = 108'000.00.",
          "AVS/AI/APG : 108'000.00 × 10,6 % = 11'448.00 (5,3 % chacun).",
          "AC : 108'000.00 × 2,2 % = 2'376.00 (1,1 % chacun).",
          "Part de l'employeur : (11'448.00 + 2'376.00) ÷ 2 = 6'912.00.",
        ],
      },
      piege: 'Les taux changent : utilisez toujours ceux que donne l\'énoncé.',
    },
  ],

  'marge-contributive': [
    {
      titre: '1. Des coûts qui bougent, des coûts qui restent',
      texte: [
        "Certains coûts dépendent de ce qu'on vend : chaque article vendu a coûté son prix d'achat. Ce sont les coûts variables. D'autres tombent quoi qu'il arrive : le loyer, les salaires fixes. Ce sont les charges fixes.",
      ],
    },
    {
      titre: '2. Ce que chaque vente laisse',
      texte: ["La marge contributive est ce qui reste d'une vente une fois son coût variable payé. Elle sert d'abord à couvrir les charges fixes ; ce qui dépasse est le bénéfice."],
      exemple: {
        situation: "Prix de vente 20.00, coût variable 12.00, charges fixes 4'000.00 :",
        lignes: ['Marge contributive par pièce : 20.00 − 12.00 = 8.00.', "Avec 700 pièces : 700 × 8.00 = 5'600.00 de marge.", "Résultat : 5'600.00 − 4'000.00 = 1'600.00 de bénéfice."],
      },
    },
    {
      titre: '3. Le seuil de rentabilité',
      texte: ["Combien faut-il vendre pour ne pas perdre d'argent ? Il faut que la marge couvre exactement les charges fixes."],
      exemple: { situation: 'Même exemple :', lignes: ["4'000.00 ÷ 8.00 = 500 pièces.", 'En dessous de 500 pièces : une perte. Au-dessus : un bénéfice.'] },
      retenir: 'Seuil = charges fixes ÷ marge contributive par pièce.',
    },
  ],

  'repartition-couts': [
    {
      titre: '1. À qui appartient ce coût ?',
      texte: [
        "Le loyer sert à la fois au magasin, au bureau et à l'entrepôt. Pour savoir ce que coûte chaque partie de l'entreprise, il faut le partager.",
        "On appelle centres de coûts les parties de l'entreprise (achat, vente, administration), et clé de répartition la règle de partage.",
      ],
    },
    {
      titre: '2. La feuille de répartition',
      texte: ["Chaque charge est répartie selon sa clé. On additionne ensuite ce que chaque centre a reçu."],
      exemple: {
        situation: "Loyer de 12'000.00 et salaires de 40'000.00 :",
        tableau: T(['Charge', 'Achat', 'Vente', 'Administration'], ['Loyer (20 % / 50 % / 30 %)', "2'400.00", "6'000.00", "3'600.00"], ['Salaires (25 % / 50 % / 25 %)', "10'000.00", "20'000.00", "10'000.00"], ['Total du centre', "12'400.00", "26'000.00", "13'600.00"]),
      },
      retenir: 'Le total des centres est égal au total des charges réparties : rien ne se perd.',
    },
  ],
};
