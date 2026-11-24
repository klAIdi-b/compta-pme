// Leçons du parcours « Apprendre », CFC 2e année et option Finances (la 1re année est dans lecons-cfc1.ts) (modèle validé par l'enseignant le 24.11.2026, contenu à relire).
// Les règles reprennent la théorie et les règles validées du projet (CLAUDE.md) ; les exemples sont chiffrés à la main.
import type { PartieLecon } from './lecons';

const T = (entetes: string[], ...lignes: string[][]) => ({ entetes, lignes });

export const LECONS_CFC: Record<string, PartieLecon[]> = {

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
