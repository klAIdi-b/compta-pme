// Leçons du parcours « Apprendre », maturité professionnelle (modèle validé par l'enseignant le 24.11.2026, contenu à
// relire). Les règles reprennent celles du projet (CLAUDE.md) et des générateurs de calcul ; exemples chiffrés à la main.
import type { PartieLecon } from './lecons';

const T = (entetes: string[], ...lignes: string[][]) => ({ entetes, lignes });

export const LECONS_MP: Record<string, PartieLecon[]> = {
  'classes-pme': [
    {
      titre: '1. Un numéro qui dit où ranger le compte',
      texte: [
        "Une entreprise utilise des dizaines de comptes. Pour s'y retrouver, on les numérote, comme les rayons d'une bibliothèque. Le premier chiffre du numéro indique la classe : il suffit de le lire pour savoir de quel genre de compte il s'agit.",
      ],
      exemple: {
        situation: 'Les classes du plan comptable PME :',
        tableau: T(
          ['Classe', 'Contenu', 'Exemple'],
          ['1', 'Actifs', 'Banque, Véhicules'],
          ['2', 'Passifs', 'Dettes fournisseurs, Capital'],
          ['3', "Chiffre d'affaires", 'Ventes de marchandises'],
          ['4', 'Charges de marchandises', 'Achats de marchandises'],
          ['5', 'Charges de personnel', 'Salaires'],
          ['6', "Autres charges d'exploitation", 'Loyers, Amortissements'],
          ['7', 'Activités annexes', "Produits d'immeubles"],
          ['8', 'Hors exploitation, exceptionnels, impôts', 'Produits exceptionnels'],
          ['9', 'Clôture', 'Compte de résultat'],
        ),
      },
      retenir: 'Classes 1 et 2 : le bilan. Classes 3 à 8 : le compte de résultat. Classe 9 : la clôture.',
    },
    {
      titre: '2. Les classes suivent le compte de résultat',
      texte: [
        "L'ordre n'est pas un hasard. En descendant de la classe 3 à la classe 8, on parcourt le compte de résultat : ce que l'entreprise vend, ce que coûtent les marchandises, puis le personnel, puis le reste de l'exploitation, et enfin ce qui sort de l'activité habituelle.",
      ],
      piege: "Certains comptes diminuent leur classe : les Déductions accordées sont dans la classe 3 parce qu'elles réduisent le chiffre d'affaires, et les Pertes sur créances aussi.",
    },
  ],

  interets: [
    {
      titre: "1. L'intérêt : le loyer de l'argent",
      texte: [
        "Prêter de l'argent, c'est comme louer un appartement : celui qui l'utilise paie un loyer. Ce loyer s'appelle l'intérêt. Il dépend de trois choses : la somme prêtée (le capital), le prix du prêt (le taux, en % par an) et la durée.",
      ],
      exemple: {
        situation: "12'000.00 prêtés à 4 % pendant un an, puis pendant 90 jours :",
        lignes: ["Un an : 12'000.00 × 4 % = 480.00.", '90 jours, soit un quart de l\'année : 480.00 ÷ 4 = 120.00.'],
      },
    },
    {
      titre: "2. L'année commerciale : 360 jours",
      texte: ["Pour simplifier, on compte 30 jours pour chaque mois et 360 jours pour l'année. Le 31 d'un mois compte comme le 30."],
      exemple: {
        situation: 'Du 15 mars au 30 juin :',
        lignes: ['Fin mars : 30 − 15 = 15 jours.', 'Avril, mai, juin : 3 × 30 = 90 jours.', 'Total : 105 jours.'],
      },
      retenir: 'I = C × t × j ÷ 36 000 (C le capital, t le taux, j le nombre de jours).',
    },
    {
      titre: '3. Chercher une autre grandeur',
      texte: ["La même formule permet de retrouver la durée, le taux ou le capital quand on connaît l'intérêt. On l'isole comme dans une équation."],
      exemple: {
        situation: "Combien de jours pour que 12'000.00 à 4 % rapportent 120.00 ?",
        lignes: ["j = I × 36 000 ÷ (C × t) = 120 × 36 000 ÷ (12'000 × 4) = 90 jours."],
      },
      piege: "Le taux s'écrit sans le signe % dans la formule (4, et non 0,04) : le 36 000 contient déjà la division par 100.",
    },
  ],

  'compte-courant': [
    {
      titre: '1. Un solde qui change tout le temps',
      texte: [
        "Sur un compte courant, le solde bouge à chaque opération. On ne peut pas appliquer la formule de l'intérêt une seule fois : il faudrait la refaire pour chaque période où le solde est resté le même.",
        "La méthode des nombres évite ces calculs répétés : on calcule un « nombre » par période, on les additionne, et on applique le taux une seule fois.",
      ],
      retenir: 'Nombre = capital × jours ÷ 100. Intérêt = total des nombres × taux ÷ 360.',
    },
    {
      titre: '2. Un exemple complet',
      texte: ["Pour chaque solde, on compte les jours pendant lesquels il est resté inchangé."],
      exemple: {
        situation: 'Compte créditeur, taux 1 % :',
        tableau: T(['Solde', 'Jours', 'Nombre'], ["6'000.00", '60', "3'600"], ["8'000.00", '90', "7'200"], ["12'000.00", '30', "3'600"], ['Total des nombres', '180', "14'400"]),
        lignes: ["Intérêt brut : 14'400 × 1 ÷ 360 = 40.00."],
      },
    },
    {
      titre: "3. L'impôt anticipé",
      texte: ["La banque ne crédite pas tout l'intérêt : elle en retient 35 % pour la Confédération. C'est l'impôt anticipé. L'entreprise qui déclare correctement ses revenus le récupère ensuite."],
      exemple: { situation: 'Sur 40.00 d\'intérêt brut :', lignes: ['Impôt anticipé : 40.00 × 35 % = 14.00.', 'Intérêt net crédité : 40.00 − 14.00 = 26.00.'] },
      piege: "L'impôt anticipé n'est pas une charge : c'est une créance envers l'Administration fédérale des contributions.",
    },
  ],

  devises: [
    {
      titre: '1. Deux cours, et la banque gagne entre les deux',
      texte: [
        "La banque achète une monnaie étrangère à un prix et la revend plus cher : c'est son métier. Il y a donc toujours deux cours, le cours achat (le plus bas) et le cours vente (le plus haut).",
        "Les cours sont donnés du point de vue de la banque : « achat » signifie que la banque achète la monnaie étrangère.",
      ],
      retenir: "L'entreprise a besoin d'euros : la banque les lui vend (cours vente). L'entreprise reçoit des euros : la banque les lui achète (cours achat).",
    },
    {
      titre: '2. Billets ou devises ?',
      texte: ["Les billets sont l'argent en espèces, échangé au guichet. Les devises sont l'argent des comptes : virements, cartes. Manipuler des billets coûte plus cher à la banque : l'écart entre achat et vente est plus grand."],
      exemple: {
        situation: 'Cours de l\'euro (pour 1 EUR) :',
        tableau: T(['', 'Achat', 'Vente'], ['Devises', '0,9320', '0,9480'], ['Billets', '0,9100', '0,9700']),
        lignes: [
          "Payer par virement une facture de EUR 2'000.00 : devises, vente. 2'000.00 × 0,9480 = CHF 1'896.00.",
          "Un client verse EUR 2'000.00 sur notre compte : devises, achat. 2'000.00 × 0,9320 = CHF 1'864.00.",
          'Acheter EUR 500.00 en billets pour un voyage : billets, vente. 500.00 × 0,9700 = CHF 485.00.',
        ],
      },
      piege: "Ne choisissez pas le cours d'après ce que fait l'entreprise (« elle achète des euros, donc cours achat ») : le cours porte le nom de ce que fait la banque.",
    },
    {
      titre: '3. Entre la facture et le paiement, le cours a bougé',
      texte: ["La facture est comptabilisée au cours du jour. Au paiement, le cours a changé : on ne paie pas exactement le montant comptabilisé. Dans le cours, la différence corrige le compte de la marchandise, sans compte de change séparé."],
      exemple: {
        situation: "Facture d'un fournisseur comptabilisée pour CHF 1'880.00, payée CHF 1'896.00 :",
        lignes: ["Dettes fournisseurs 1'880.00 et Achats de marchandises 16.00 / Banque 1'896.00."],
      },
    },
  ],

  'prix-inverse': [
    {
      titre: "1. L'échelle des prix, dans l'autre sens",
      texte: [
        "Vous savez monter l'échelle : partir du prix d'achat et ajouter les frais, puis le bénéfice, pour arriver au prix de vente. Mais souvent le prix de vente est imposé par le marché : « ce produit doit se vendre 150.00 ». La question devient : combien ai-je le droit de le payer ?",
        "On redescend alors l'échelle, du prix de vente brut (PVB) jusqu'au prix d'achat brut (PAB).",
      ],
      retenir: 'PVB → PVC → PVN → PR → PRA → PAN → PAC → PAB.',
    },
    {
      titre: '2. La règle qui évite toutes les erreurs',
      texte: [
        "Un pourcentage se calcule toujours sur une base précise. Si le bénéfice vaut 20 % du prix de revient (PR), alors le prix de vente net représente 120 % du PR. Pour retrouver le PR, on divise par 120 %, on ne retire pas 20 %.",
      ],
      exemple: {
        situation: 'PVN de 135.00, bénéfice de 20 % du PR :',
        lignes: ['Juste : 135.00 ÷ 1,20 = 112.50.', 'Faux : 135.00 − 20 % = 108.00 (20 % de 135.00 ne sont pas 20 % du PR).'],
      },
      retenir: 'Pourcentage ajouté : diviser par (100 + taux) %. Pourcentage déduit : diviser par (100 − taux) %, ou multiplier quand on connaît la base.',
    },
    {
      titre: "3. Un exemple d'un bout à l'autre",
      texte: ['Chaque étape est arrondie au centime avant de passer à la suivante.'],
      exemple: {
        situation: "PVB 150.00 ; rabais accordé 10 % ; pas d'escompte ; bénéfice 20 % du PR ; frais généraux 25 % du PRA ; frais d'achat 5.00 ; rabais obtenu 20 % :",
        tableau: T(
          ['Étape', 'Calcul', 'CHF'],
          ['PVC = PVN', '150.00 × 90 %', '135.00'],
          ['PR', '135.00 ÷ 120 %', '112.50'],
          ['PRA', '112.50 ÷ 125 %', '90.00'],
          ['PAN = PAC', '90.00 − 5.00', '85.00'],
          ['PAB', '85.00 ÷ 80 %', '106.25'],
        ),
      },
      piege: "Le rabais accordé se calcule sur le PVB, que l'on connaît : on multiplie par 90 %. Le rabais obtenu se calcule sur le PAB, que l'on cherche : on divise par 80 %.",
    },
  ],

  'amortissements-mp': [
    {
      titre: '1. Vendre un bien déjà amorti',
      texte: [
        "Quand l'entreprise revend une machine, elle ne compare pas le prix de vente à ce qu'elle l'avait payée, mais à ce que la machine vaut encore dans ses comptes : la valeur comptable.",
      ],
      exemple: {
        situation: "Machine achetée 40'000.00, amortie 20 % par an de la valeur d'acquisition depuis 3 ans :",
        lignes: [
          "Amortissements cumulés : 40'000.00 × 20 % × 3 = 24'000.00.",
          "Valeur comptable : 40'000.00 − 24'000.00 = 16'000.00.",
          "Vendue 18'000.00 : bénéfice de cession de 2'000.00.",
          "Vendue 13'000.00 : perte de cession de 3'000.00.",
        ],
      },
      retenir: 'Résultat de cession = prix de vente − valeur comptable.',
    },
    {
      titre: '2. Passer de la méthode directe à la méthode indirecte',
      texte: [
        "Avec la méthode directe, le compte du bien montre la valeur comptable. Avec la méthode indirecte, il doit montrer la valeur d'acquisition, et les amortissements figurent à part.",
        "Pour changer de méthode, on remet donc dans le compte du bien tout ce qui avait été amorti, et on l'inscrit en face dans le fonds d'amortissements cumulés. La valeur comptable ne change pas.",
      ],
      exemple: {
        situation: "Véhicule de 30'000.00, amorti deux ans en dégressif, 40 % de la valeur comptable :",
        lignes: [
          "1re année : 30'000.00 × 40 % = 12'000.00. 2e année : 18'000.00 × 40 % = 7'200.00.",
          "Valeur comptable : 30'000.00 − 19'200.00 = 10'800.00.",
          "Changement de méthode : Véhicules / FAC s/véhicules, 19'200.00.",
        ],
      },
      piege: "Le changement de méthode n'est ni une charge ni un produit : le résultat ne bouge pas.",
    },
  ],

  'perte-capital': [
    {
      titre: '1. Quand les pertes mangent les fonds propres',
      texte: [
        "Les fonds propres sont ce qui reste aux actionnaires une fois toutes les dettes payées : actifs − dettes. Chaque perte les fait fondre. La loi fixe deux seuils d'alarme, pour protéger ceux qui ont prêté de l'argent à la société.",
      ],
    },
    {
      titre: '2. Premier seuil : la perte de capital (art. 725a CO)',
      texte: ["Il y a perte de capital quand les fonds propres ne couvrent plus la moitié du capital-actions et des réserves légales. Le conseil d'administration doit alors prendre des mesures pour redresser la situation."],
      exemple: {
        situation: "Capital-actions 200'000.00, réserves légales 40'000.00 ; actifs 500'000.00, dettes 400'000.00 :",
        lignes: ["Seuil : (200'000.00 + 40'000.00) ÷ 2 = 120'000.00.", "Fonds propres : 500'000.00 − 400'000.00 = 100'000.00.", "100'000.00 est inférieur à 120'000.00 : perte de capital."],
      },
    },
    {
      titre: '3. Second seuil : le surendettement (art. 725b CO)',
      texte: ["Il y a surendettement quand les dettes dépassent les actifs : même en vendant tout, la société ne pourrait pas rembourser. Les fonds propres sont négatifs. En principe, le conseil d'administration doit avertir le tribunal."],
      exemple: { situation: "Mêmes actifs, dettes de 520'000.00 :", lignes: ["Fonds propres : 500'000.00 − 520'000.00 = −20'000.00 : surendettement."] },
      piege: "Une perte sur l'exercice ne suffit pas : c'est le niveau des fonds propres au bilan qui compte.",
      retenir: 'Fonds propres inférieurs à la moitié du capital et des réserves légales : perte de capital. Fonds propres négatifs : surendettement.',
    },
  ],

  'titres-immeubles': [
    {
      titre: "1. Le bordereau : la facture de la banque",
      texte: [
        "Quand vous achetez des obligations, la banque vous envoie un bordereau. Il additionne quatre éléments : le prix des titres, l'intérêt que le vendeur a déjà gagné depuis le dernier coupon, le courtage de la banque et le droit de timbre.",
      ],
      exemple: {
        situation: "Obligations 3 %, valeur nominale 10'000.00, cours 98 %, dernier coupon il y a 120 jours, courtage 0,5 %, droit de timbre 0,075 % :",
        tableau: T(
          ['Élément', 'Calcul', 'CHF'],
          ['Prix', "10'000.00 × 98 %", "9'800.00"],
          ['Intérêt couru', "10'000 × 3 × 120 ÷ 36 000", '100.00'],
          ['Courtage', "9'800.00 × 0,5 %", '49.00'],
          ['Droit de timbre', "9'800.00 × 0,075 %", '7.35'],
          ['Total débité', '', "9'956.35"],
        ),
      },
      piege: "L'intérêt couru se calcule sur la valeur nominale ; le courtage et le timbre sur le prix.",
    },
    {
      titre: '2. Le rendement : ce que rapporte un placement en un an',
      texte: ["Le rendement compare ce que le placement a rapporté en une année à ce qu'il a coûté. Il permet de comparer des placements très différents."],
      exemple: {
        situation: 'Une action, puis une obligation :',
        lignes: [
          'Action achetée 200.00, dividende 6.00, revendue 210.00 après un an : (6.00 + 10.00) ÷ 200.00 × 100 = 8,0 %.',
          'Obligation 2 %, achetée à 96 %, remboursée à 100 % dans 4 ans : (2 + 4 ÷ 4) ÷ 96 × 100 = 3,1 %.',
        ],
      },
      retenir: 'Rendement = revenu de l\'année (± gain ou perte, réparti sur les années) ÷ capital investi × 100.',
    },
    {
      titre: "3. L'immeuble : rendement brut et rendement net",
      texte: ["Le rendement brut compare les loyers au prix de l'immeuble. Le rendement net regarde ce qui reste au propriétaire après les charges et les intérêts, par rapport à l'argent qu'il a lui-même investi."],
      exemple: {
        situation: "Immeuble de 1'000'000.00, dont 300'000.00 de fonds propres ; loyers 55'000.00, charges 12'000.00, intérêts hypothécaires 14'000.00 :",
        lignes: ["Rendement brut : 55'000.00 ÷ 1'000'000.00 × 100 = 5,5 %.", "Rendement net : (55'000.00 − 12'000.00 − 14'000.00) ÷ 300'000.00 × 100 = 9,7 %."],
      },
    },
  ],

  'point-mort': [
    {
      titre: '1. Le point mort : ni bénéfice ni perte',
      texte: [
        "Au début de l'année, l'entreprise travaille pour payer ses charges fixes. Chaque franc vendu laisse une marge ; quand la somme de ces marges atteint les charges fixes, le point mort est franchi. Tout ce qui est vendu ensuite produit du bénéfice.",
      ],
      exemple: {
        situation: "Chiffre d'affaires annuel 600'000.00, marge brute 40 %, charges fixes 180'000.00 :",
        lignes: ["CA au point mort : 180'000.00 ÷ 40 % = 450'000.00.", "Vérification : 450'000.00 × 40 % = 180'000.00, exactement les charges fixes."],
      },
      retenir: "CA au point mort = charges fixes ÷ taux de marge.",
    },
    {
      titre: '2. À quelle date ?',
      texte: ["Si les ventes sont régulières, on peut dire quel jour de l'année le point mort est atteint."],
      exemple: { situation: 'Même entreprise :', lignes: ["450'000.00 ÷ 600'000.00 × 360 = 270e jour, soit fin septembre.", "Les trois derniers mois de l'année produisent le bénéfice."] },
      piege: "Plus le point mort est tard dans l'année, plus l'entreprise est fragile : une petite baisse des ventes suffit à la mettre en perte.",
    },
    {
      titre: '3. La rotation du stock',
      texte: ["Un stock qui dort coûte de l'argent. La rotation dit combien de fois par an le stock est entièrement vendu et renouvelé."],
      exemple: {
        situation: "Prix de revient des marchandises vendues (PRAMV) 360'000.00, stock moyen 60'000.00 :",
        lignes: ["Rotation : 360'000.00 ÷ 60'000.00 = 6 fois par an.", 'Durée moyenne de stockage : 360 ÷ 6 = 60 jours.'],
      },
      retenir: 'Rotation = PRAMV ÷ stock moyen. Durée de stockage = 360 ÷ rotation.',
    },
  ],

  'flux-direct': [
    {
      titre: '1. Le bénéfice n\'est pas de l\'argent en caisse',
      texte: [
        "Une entreprise peut afficher un bénéfice et manquer d'argent : ses clients n'ont pas encore payé, ou elle vient d'acheter une machine. Le tableau des flux de trésorerie répond à une autre question que le compte de résultat : combien d'argent est réellement entré et sorti ?",
      ],
    },
    {
      titre: '2. La méthode directe : on compte les entrées et les sorties',
      texte: ["On additionne ce que l'exploitation a fait entrer (les encaissements des clients) et on retire ce qu'elle a fait sortir (fournisseurs, personnel, autres paiements)."],
      exemple: {
        situation: "Les flux de l'exercice :",
        tableau: T(['', 'CHF'], ['Encaissements des clients', "500'000.00"], ['− Paiements aux fournisseurs', "260'000.00"], ['− Paiements au personnel', "110'000.00"], ["− Autres paiements d'exploitation", "50'000.00"], ["Cash-flow d'exploitation", "80'000.00"]),
      },
      piege: "L'amortissement n'apparaît pas : c'est une charge, mais aucun argent ne sort.",
    },
    {
      titre: '3. Le free cash-flow : ce qui reste vraiment libre',
      texte: ["L'entreprise doit encore payer ses investissements. Ce qui reste ensuite peut servir à rembourser des dettes ou à verser un dividende."],
      exemple: { situation: "Investissements payés 45'000.00, vente d'une ancienne machine 5'000.00 :", lignes: ["Free cash-flow : 80'000.00 − 45'000.00 + 5'000.00 = 40'000.00."] },
      retenir: "Free cash-flow = cash-flow d'exploitation − investissements + désinvestissements.",
    },
  ],

  analytique: [
    {
      titre: '1. Combien coûte vraiment ce produit ?',
      texte: [
        "Certains coûts appartiennent clairement à une commande : la matière, le salaire de celui qui la fabrique. Ce sont les charges directes. D'autres servent à tout le monde : le bâtiment, la direction. Ce sont les charges indirectes, et il faut les répartir.",
      ],
    },
    {
      titre: '2. La feuille de répartition, en deux temps',
      texte: [
        "D'abord, chaque charge indirecte est attribuée aux centres de coûts : c'est la répartition primaire. Ensuite, les centres auxiliaires, qui travaillent pour les autres (le bâtiment), sont vidés sur les centres principaux : c'est la répartition secondaire.",
      ],
      exemple: {
        situation: "Bâtiment 40'000.00, à répartir 75 % sur la production et 25 % sur l'administration :",
        tableau: T(['', 'Bâtiment', 'Production', 'Administration et vente'], ['Répartition primaire', "40'000.00", "200'000.00", "90'000.00"], ['Répartition secondaire', "−40'000.00", "30'000.00", "10'000.00"], ['Total', '0.00', "230'000.00", "100'000.00"]),
      },
    },
    {
      titre: "3. L'unité d'œuvre : le prix d'une heure",
      texte: ["Pour imputer le centre Production aux commandes, on le divise par ce qu'il a produit : des heures-machine, par exemple."],
      exemple: { situation: "4'600 heures-machine dans l'année :", lignes: ["Coût d'une heure-machine : 230'000.00 ÷ 4'600 = 50.00."] },
    },
    {
      titre: '4. Le prix de revient complet',
      texte: ["On additionne les charges directes de la commande, les heures-machine qu'elle a utilisées, puis sa part des frais d'administration et de vente, en pourcentage du coût de production."],
      exemple: {
        situation: "Commande : matières 600.00, salaires directs 400.00, 10 heures-machine ; frais d'administration et de vente 5 % :",
        lignes: ["Coût de production : 600.00 + 400.00 + 10 × 50.00 = 1'500.00.", "Prix de revient complet : 1'500.00 + 5 % = 1'575.00."],
      },
      retenir: "Prix de revient = coût de production + frais d'administration et de vente.",
    },
  ],

  normes: [
    {
      titre: '1. Pourquoi des normes ?',
      texte: [
        "Le Code des obligations laisse de la marge : une entreprise peut sous-évaluer ses actifs et créer des réserves latentes. Prudent, mais celui qui lit les comptes ne voit pas la situation réelle.",
        "Les normes comptables imposent une image fidèle (true and fair view), pour que les investisseurs puissent comparer les entreprises.",
      ],
      exemple: {
        situation: 'Les trois référentiels à connaître :',
        tableau: T(['Normes', 'Origine', 'Pour qui'], ['Swiss GAAP RPC', 'Suisse', 'PME et groupes suisses'], ['IFRS', "International (IASB)", 'De nombreux groupes cotés en bourse'], ['US GAAP', 'États-Unis', 'Sociétés cotées aux États-Unis']),
      },
    },
    {
      titre: '2. La consolidation : un groupe, un seul bilan',
      texte: [
        "Une société mère et ses filiales forment un groupe. Pour montrer le groupe comme une seule entreprise, on additionne leurs comptes, puis on élimine ce qui s'est passé entre elles.",
        "La participation de la mère dans sa filiale est remplacée par les actifs et les dettes de la filiale.",
      ],
      piege: "Une créance de la mère envers sa filiale disparaît du bilan consolidé : le groupe ne peut pas se devoir de l'argent à lui-même.",
      retenir: 'Consolider = réunir les comptes du groupe et éliminer les opérations internes.',
    },
  ],

  'societes-ecritures': [
    {
      titre: '1. La fondation : promettre, puis verser',
      texte: [
        "Une société anonyme naît en deux temps. Les actionnaires s'engagent d'abord à apporter le capital : c'est la souscription. La société a alors une créance envers eux. Ensuite ils versent l'argent : c'est la libération.",
      ],
      exemple: {
        situation: "Capital-actions de 100'000.00 :",
        tableau: T(['Étape', 'Débit', 'Crédit', 'CHF'], ['Souscription', 'Actionnaires (capital non versé)', 'Capital-actions', "100'000.00"], ['Libération', 'Banque', 'Actionnaires (capital non versé)', "100'000.00"]),
      },
      retenir: 'Les frais de fondation (notaire, registre du commerce) sont une charge : FAO.',
    },
    {
      titre: "2. L'augmentation du capital et l'agio",
      texte: ["Quand la société vaut plus que son capital, les nouvelles actions sont vendues plus cher que leur valeur nominale. Le supplément s'appelle l'agio. Il ne va pas au capital-actions, mais dans une réserve."],
      exemple: {
        situation: '500 actions de 100.00 nominal, émises à 120.00 :',
        lignes: ["Actionnaires 60'000.00 / Capital-actions 50'000.00 et Réserves légales issues du capital 10'000.00."],
      },
      piege: "Le capital-actions n'augmente que de la valeur nominale, jamais du prix d'émission.",
    },
    {
      titre: '3. La répartition du bénéfice',
      texte: [
        "Le bénéfice de l'année rejoint le bénéfice reporté. L'assemblée générale décide ensuite de son emploi. La loi impose d'abord une part à la réserve légale : 5 % du bénéfice, tant que les réserves légales n'atteignent pas la moitié du capital-actions (art. 672 CO).",
      ],
      exemple: {
        situation: "Bénéfice de 80'000.00, dividende décidé de 60'000.00 :",
        lignes: [
          "Réserve légale : 80'000.00 × 5 % = 4'000.00.",
          "Bénéfice reporté 64'000.00 / Réserves légales issues du bénéfice 4'000.00 et Dividendes 60'000.00.",
          "Le solde, 16'000.00, reste en bénéfice reporté.",
        ],
      },
    },
    {
      titre: "4. Le paiement du dividende",
      texte: ["La société ne verse à l'actionnaire que 65 % du dividende. Elle retient 35 % d'impôt anticipé, qu'elle doit verser à l'Administration fédérale des contributions."],
      exemple: { situation: "Dividende de 60'000.00 :", lignes: ["Dividendes 60'000.00 / Banque 39'000.00 et Dettes AFC 21'000.00."] },
      retenir: 'Dividende brut = 65 % versés à l\'actionnaire + 35 % d\'impôt anticipé dus à l\'AFC.',
    },
  ],

  'titres-ecritures': [
    {
      titre: '1. Acheter et vendre des titres',
      texte: [
        "Une entreprise qui a de l'argent en trop peut le placer en actions ou en obligations. Les titres entrent dans les comptes pour ce qu'ils ont réellement coûté, frais de banque compris. À la vente, on enregistre ce que la banque crédite réellement, frais déduits.",
      ],
      exemple: {
        situation: 'Un achat, puis une vente partielle :',
        tableau: T(['Opération', 'Débit', 'Crédit', 'CHF'], ['Achat, frais compris', 'Titres de placement', 'Banque', "10'150.00"], ['Vente, net de frais', 'Banque', 'Titres de placement', "4'930.00"]),
      },
    },
    {
      titre: '2. Les revenus : dividendes et impôt anticipé',
      texte: ["Le revenu, c'est le dividende brut. La banque n'en crédite que 65 % ; les 35 % restants seront remboursés par l'Administration fédérale des contributions : c'est une créance."],
      exemple: { situation: 'Dividende brut de 400.00 :', lignes: ['Banque 260.00 et Créances AFC 140.00 / Produits des titres 400.00.'] },
      piege: "Comptabiliser seulement 260.00 de produit fait oublier la créance de 140.00.",
    },
    {
      titre: '3. À la clôture : les cours ont bougé',
      texte: ["À la fin de l'année, on compare la valeur des titres au bilan avec leur cours. Une baisse est toujours comptabilisée : c'est une charge des titres. Le résultat exact de toutes les opérations apparaît ainsi d'après l'inventaire."],
      exemple: { situation: 'Les actions ont perdu 600.00 :', lignes: ['Charges des titres / Titres de placement, 600.00.'] },
      retenir: 'Charges des titres : droits de garde, pertes de cours. Produits des titres : dividendes, intérêts, gains de cours.',
    },
    {
      titre: '4. Intérêts et provisions',
      texte: [
        "L'intérêt d'un emprunt est une charge financière. Une provision, elle, anticipe une dépense probable dont on ne connaît pas encore le montant exact : on passe déjà la charge, par sa nature, et on inscrit une dette estimée au passif.",
      ],
      exemple: {
        situation: 'Trois écritures :',
        tableau: T(
          ['Opération', 'Débit', 'Crédit'],
          ["Intérêt annuel de l'emprunt", 'Charges financières', 'Banque'],
          ['Révision de machine prévue en janvier', 'Entretien et réparations', 'Provision pour réparations'],
          ["Impôts estimés sur le bénéfice de l'exercice", 'Impôts', 'Provision pour impôts'],
        ),
      },
      retenir: 'Provision : la charge par nature au débit, la provision au crédit.',
    },
  ],
};
