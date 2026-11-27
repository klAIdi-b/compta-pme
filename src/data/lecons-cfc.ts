// Leçons approfondies du parcours « Apprendre », CFC 2e année et option Finances (réécrites le 24.11.2026 sur le
// modèle des leçons de 1re année : vocabulaire, démarche, plusieurs exemples, questions de contrôle ; à relire).
// Les règles reprennent celles du projet (CLAUDE.md) et de la théorie validée ; exemples chiffrés à la main.
import type { ExempleLecon, PartieLecon } from './lecons';

const T = (entetes: string[], ...lignes: string[][]) => ({ entetes, lignes });
const ex = (situation: string, x: Omit<ExempleLecon, 'situation'> = {}): ExempleLecon => ({ situation, ...x });

export const LECONS_CFC: Record<string, PartieLecon[]> = {
  // ------------------------------------------------------------------------------------------------- TVA
  'tva-ecritures': [
    {
      titre: "1. Un impôt payé par le client, encaissé par l'entreprise",
      texte: [
        "Quand vous achetez un vélo à 1'081.00, le magasin n'en garde que 1'000.00. Les 81.00 restants sont de la taxe sur la valeur ajoutée (TVA) : le magasin les encaisse pour le compte de la Confédération et devra les lui reverser. Il joue le rôle de percepteur.",
        "La TVA frappe la consommation. C'est le client final qui la supporte ; les entreprises, elles, ne font que la transmettre. Voilà pourquoi la TVA n'est ni un produit ni une charge pour l'entreprise : c'est de l'argent qui ne lui appartient pas.",
        "Toutes les entreprises ne sont pas concernées : seules celles qui y sont assujetties facturent la TVA. Les énoncés le précisent.",
      ],
      definitions: [
        { terme: 'TVA', definition: 'taxe sur la valeur ajoutée, impôt sur la consommation perçu par la Confédération.' },
        { terme: 'Hors taxe (HT)', definition: 'prix sans la TVA : ce qui revient vraiment au vendeur.' },
        { terme: 'Toutes taxes comprises (TTC)', definition: 'prix payé par le client, TVA incluse.' },
        { terme: 'AFC', definition: 'Administration fédérale des contributions, à qui la TVA est versée.' },
      ],
      exemple: ex('Les trois taux :', { tableau: T(['Taux', 'Pour quoi', 'Exemple'], ['8,1 % (normal)', 'La plupart des biens et des services', 'Un vélo, une réparation, une annonce'], ['2,6 % (réduit)', 'Biens de première nécessité', 'Alimentation, livres, journaux'], ['3,8 % (spécial)', "L'hébergement", "Une nuit d'hôtel"]) }),
      retenir: "La TVA encaissée n'appartient pas à l'entreprise : c'est une dette envers la Confédération.",
    },
    {
      titre: "2. L'impôt préalable : la TVA qu'on récupère",
      texte: [
        "Le magasin a lui-même payé de la TVA en achetant ses vélos au grossiste. S'il devait reverser toute la TVA de ses ventes sans rien récupérer, la même marchandise serait taxée deux fois.",
        "Il a donc le droit de déduire la TVA qu'il a payée sur ses propres achats : c'est l'impôt préalable. Il ne verse que la différence. Au bout de la chaîne, la Confédération a reçu exactement la TVA du prix final, par petits morceaux.",
      ],
      definitions: [{ terme: 'Impôt préalable (IP)', definition: "TVA payée sur ses propres achats, que l'entreprise peut récupérer." }],
      exemple: ex("Un vélo acheté 600.00 hors taxe au grossiste et revendu 1'000.00 hors taxe :", {
        lignes: ['Le magasin paie au grossiste 600.00 + 48.60 de TVA. Le grossiste reverse ces 48.60.', "Le magasin encaisse du client 1'000.00 + 81.00 de TVA.", 'Il reverse 81.00 − 48.60 = 32.40.'],
        conclusion: "La Confédération reçoit 48.60 + 32.40 = 81.00, soit 8,1 % du prix final. Le magasin n'a rien payé de sa poche.",
      }),
      retenir: 'TVA due (sur les ventes) − impôt préalable (sur les achats) = montant à verser.',
    },
    {
      titre: '3. Comptabiliser au net : la TVA à part',
      texte: [
        "Avec la méthode au net, on sépare la TVA dès la facture. Le compte de vente ou d'achat ne reçoit que le montant hors taxe ; la TVA va dans son propre compte.",
        "Côté ventes, la TVA va au crédit de TVA due : c'est une dette. Côté achats, elle va au débit d'un compte d'impôt préalable : c'est une créance envers l'AFC. Il y en a deux : l'un pour les marchandises et les services, l'autre pour les investissements et les autres charges d'exploitation.",
      ],
      methode: ['Calculer la TVA : montant hors taxe × taux.', 'Vente : le hors taxe en produit, la TVA en TVA due.', 'Achat : le hors taxe en charge ou en actif, la TVA en impôt préalable.', 'La créance, la dette ou la banque porte le total TTC.'],
      exemple: ex('Quatre factures, toutes au taux de 8,1 % :', {
        tableau: T(
          ['Opération', 'Débit', 'Crédit'],
          ["Vente à crédit, 1'000.00 HT", "Créances clients 1'081.00", "Ventes de marchandises 1'000.00 et TVA due 81.00"],
          ["Achat de marchandises à crédit, 1'000.00 HT", "Achats de marchandises 1'000.00 et IP s/marchandises et services 81.00", "Dettes fournisseurs 1'081.00"],
          ["Achat d'une camionnette à crédit, 20'000.00 HT", "Véhicules 20'000.00 et IP s/investissements et AGE 1'620.00", "Autres dettes 21'620.00"],
          ["Facture d'électricité, 300.00 HT", 'Électricité, gaz 300.00 et IP s/investissements et AGE 24.30', 'Autres dettes 324.30'],
        ),
        conclusion: "Dans chaque écriture, la créance ou la dette porte le montant TTC, car c'est bien ce montant qui sera payé.",
      }),
      piege: "Ne choisissez pas le compte d'impôt préalable au hasard : marchandises et services d'un côté, investissements et autres charges d'exploitation de l'autre.",
    },
    {
      titre: '4. Quand le prix est donné TVA comprise',
      texte: [
        "Un ticket de caisse affiche le total payé par le client. Pour retrouver la TVA, on ne prend pas 8,1 % du total : ce total représente déjà 108,1 % du prix hors taxe.",
        "La TVA s'arrondit aux 5 centimes.",
      ],
      exemples: [
        ex("Ventes au comptant, TVA comprise : 5'405.00", { lignes: ["TVA = 5'405.00 × 8,1 ÷ 108,1 = 405.00.", "Hors taxe = 5'405.00 − 405.00 = 5'000.00.", "Écriture : Caisse 5'405.00 / Ventes de marchandises 5'000.00 et TVA due 405.00."] }),
        ex('Un livre vendu 31.00 TTC, au taux réduit de 2,6 % :', { lignes: ['TVA = 31.00 × 2,6 ÷ 102,6 = 0.7856…, arrondi à 0.80.', 'Hors taxe = 31.00 − 0.80 = 30.20.'] }),
      ],
      piege: "8,1 % de 5'405.00 font 437.80 : ce n'est pas la TVA. Le taux s'applique au prix hors taxe, jamais au prix TTC.",
      retenir: 'TVA comprise : multiplier par le taux et diviser par (100 + taux).',
      questions: [{ question: "Une facture de garage s'élève à 648.60 TTC au taux de 8,1 %. Quels sont le montant hors taxe et la TVA ?", reponse: 'TVA = 648.60 × 8,1 ÷ 108,1 = 48.60. Hors taxe = 600.00.' }],
    },
    {
      titre: '5. Le décompte : régler ses comptes avec la Confédération',
      texte: [
        "À la fin de chaque période, en général un trimestre, l'entreprise fait le point. Le compte TVA due contient toute la TVA de ses ventes ; les deux comptes d'impôt préalable contiennent la TVA de ses achats.",
        "On vire l'impôt préalable en diminution de la TVA due. Ce qui reste est la dette envers l'AFC, que l'on paie ensuite.",
      ],
      exemple: ex("Fin du trimestre : TVA due 3'321.00 ; impôt préalable sur marchandises 810.00, sur investissements et autres charges 1'644.30.", {
        tableau: T(
          ['Étape', 'Débit', 'Crédit', 'CHF'],
          ["Virement de l'impôt préalable", 'TVA due', 'IP s/marchandises et services', '810.00'],
          ["Virement de l'impôt préalable", 'TVA due', 'IP s/investissements et AGE', "1'644.30"],
          ['Solde dû à la Confédération', 'TVA due', 'Dettes AFC', '866.70'],
          ['Paiement', 'Dettes AFC', 'Banque', '866.70'],
        ),
        conclusion: "3'321.00 − 810.00 − 1'644.30 = 866.70. Après ces écritures, les trois comptes de TVA sont à zéro et prêts pour le trimestre suivant.",
      }),
      retenir: "Décompte : on solde les comptes d'impôt préalable et de TVA due, la différence va à Dettes AFC.",
      questions: [{ question: "TVA due 2'430.00, impôt préalable total 1'180.00. Combien l'entreprise verse-t-elle ?", reponse: "2'430.00 − 1'180.00 = 1'250.00." }],
    },
    {
      titre: '6. Un rabais obtenu corrige aussi la TVA',
      texte: [
        "Si le fournisseur accorde un rabais sur des marchandises déjà facturées, l'achat est plus petit : l'impôt préalable à récupérer aussi. On corrige donc les deux, dans la même écriture.",
        "L'escompte pour paiement rapide, avec sa correction de la TVA, est vu en maturité professionnelle.",
      ],
      exemples: [
        ex("Des marchandises reçues sont défectueuses : le fournisseur accorde un rabais de 648.60 TVA comprise.", {
          lignes: ["Rabais TVA comprise : 648.60, dont 600.00 hors taxe et 48.60 de TVA (8,1 %)."],
          tableau: T(['Débit', 'Crédit'], ["Dettes fournisseurs 648.60", "Achats de marchandises 600.00 et IP s/marchandises et services 48.60"]),
        }),
      ],
      retenir: "Rabais obtenu : la dette diminue du montant TVA comprise ; l'achat et l'impôt préalable diminuent chacun de leur part.",
    },
  ],

  // ------------------------------------------------------------------------------------- Amortissements
  'amortissements-ecritures': [
    {
      titre: '1. Un bien qui vieillit perd de la valeur',
      texte: [
        "Une camionnette achetée 20'000.00 ne vaut plus 20'000.00 après trois ans. Elle s'est usée, elle a roulé, et des modèles plus récents sont sortis. Chaque année, elle perd une partie de sa valeur.",
        "Si le bilan continuait d'afficher 20'000.00, il mentirait. Et si l'on avait passé les 20'000.00 en charge l'année de l'achat, cette année-là aurait porté seule le coût d'un véhicule qui sert pendant quatre ou cinq ans.",
        "L'amortissement règle les deux problèmes : il répartit le coût du bien sur les années où il sert, et ramène peu à peu sa valeur au bilan. C'est une charge, mais sans sortie d'argent : l'argent est sorti le jour de l'achat.",
      ],
      definitions: [
        { terme: "Valeur d'acquisition", definition: "ce que le bien a coûté le jour de l'achat." },
        { terme: 'Valeur comptable', definition: 'ce que le bien vaut encore dans les comptes, après les amortissements.' },
        { terme: "Durée d'utilisation", definition: "nombre d'années pendant lesquelles l'entreprise compte se servir du bien." },
      ],
      retenir: "Amortir, c'est constater chaque année la perte de valeur d'un bien durable.",
      questions: [{ question: "L'amortissement fait-il sortir de l'argent de la banque ?", reponse: "Non. C'est une charge calculée : l'argent est sorti au moment de l'achat du bien." }],
    },
    {
      titre: '2. Deux façons de calculer',
      texte: [
        "En linéaire (ou constant), on prend le même montant chaque année, calculé sur la valeur d'acquisition. Un bien prévu pour quatre ans s'amortit de 25 % par an.",
        "En dégressif, on applique le même pourcentage, mais sur la valeur qui reste. Le montant diminue d'année en année : le bien perd beaucoup au début, peu à la fin, comme une voiture neuve.",
      ],
      methode: ["Linéaire : valeur d'acquisition × taux, chaque année.", "Dégressif : valeur comptable du début de l'année × taux.", 'Arrondir aux 5 centimes.'],
      exemple: ex("Véhicule de 20'000.00, taux de 25 % :", {
        tableau: T(
          ['Année', 'Linéaire', 'Valeur comptable', 'Dégressif', 'Valeur comptable'],
          ['1', "5'000.00", "15'000.00", "5'000.00", "15'000.00"],
          ['2', "5'000.00", "10'000.00", "3'750.00", "11'250.00"],
          ['3', "5'000.00", "5'000.00", "2'812.50", "8'437.50"],
          ['4', "4'999.00", '1.00', "2'109.40", "6'328.10"],
        ),
        conclusion: "En linéaire, le bien est entièrement amorti après quatre ans ; on garde 1.00 pour mémoire tant qu'il est encore utilisé. En dégressif, il reste toujours une valeur.",
      }),
      piege: "Dégressif : le taux s'applique à la valeur comptable (ce qui reste), pas à la valeur d'acquisition.",
      questions: [{ question: "Une machine de 12'000.00 est amortie de 20 % en dégressif. Quel est l'amortissement de la 2e année ?", reponse: "1re année : 2'400.00, il reste 9'600.00. 2e année : 9'600.00 × 20 % = 1'920.00." }],
    },
    {
      titre: "3. Deux façons d'écrire",
      texte: [
        "Méthode directe : on diminue directement le compte du bien. Le compte montre à tout moment ce que le bien vaut encore, mais on ne voit plus ce qu'il avait coûté.",
        "Méthode indirecte : le compte du bien garde sa valeur d'acquisition. Les amortissements s'accumulent dans un compte à part, le fonds d'amortissements cumulés (FAC). Ce compte est à l'actif, mais il fonctionne à l'envers : il augmente au crédit, parce qu'il vient en diminution du bien.",
      ],
      exemple: ex("Amortissement de 5'000.00 sur le véhicule :", {
        tableau: T(['Méthode', 'Débit', 'Crédit', 'CHF'], ['Directe', 'Amortissements', 'Véhicules', "5'000.00"], ['Indirecte', 'Amortissements', 'FAC s/véhicules', "5'000.00"]),
      }),
      exemples: [
        ex('Le bilan après deux ans en linéaire, selon la méthode :', {
          tableau: T(['Au bilan', 'Méthode directe', 'Méthode indirecte'], ['Véhicules', "10'000.00", "20'000.00"], ['FAC s/véhicules', '', "−10'000.00"], ['Valeur comptable', "10'000.00", "10'000.00"]),
          conclusion: "La valeur comptable est la même. La méthode indirecte donne une information de plus : on voit que le véhicule a coûté 20'000.00 et qu'il est amorti de moitié.",
        }),
      ],
      retenir: "Valeur comptable = valeur d'acquisition − amortissements cumulés. La charge est la même dans les deux méthodes.",
    },
    {
      titre: "4. Acheté en cours d'année : le prorata",
      texte: ["Un bien acheté en cours d'année n'a servi qu'une partie de l'année. On ne compte que la part correspondante de l'amortissement annuel, mois par mois."],
      exemples: [
        ex("Amortissement annuel de 5'000.00, achat le 1er juillet :", { lignes: ["Six mois d'utilisation : 5'000.00 × 6 ÷ 12 = 2'500.00."] }),
        ex('Même bien, acheté le 1er octobre :', { lignes: ["Trois mois d'utilisation : 5'000.00 × 3 ÷ 12 = 1'250.00."] }),
      ],
      piege: "Le prorata ne concerne que la première année. Dès l'année suivante, l'amortissement est compté en entier.",
    },
    {
      titre: "5. Ce que l'amortissement change dans les comptes",
      texte: [
        "L'amortissement est une charge : il diminue le bénéfice de l'année. Il diminue aussi la valeur de l'actif au bilan. Les liquidités, elles, ne bougent pas.",
        "C'est pour cela qu'une entreprise peut afficher un petit bénéfice et avoir pourtant de l'argent en banque : une partie de ses charges ne lui a rien coûté cette année.",
      ],
      retenir: 'Amortissement : le bénéfice baisse, la valeur du bien baisse, la banque ne bouge pas.',
    },
  ],

  // --------------------------------------------------------------------------- Actifs et passifs transitoires
  'transitoires-ecritures': [
    {
      titre: '1. Chaque année doit porter ses propres charges',
      texte: [
        "Le bénéfice de 2026 doit refléter ce qui s'est passé en 2026. Or les paiements ne tombent pas toujours la bonne année : une assurance se paie d'avance, une facture d'électricité arrive en janvier pour décembre.",
        "Si l'on s'en tenait aux dates de paiement, une année porterait des charges qui ne la concernent pas, et la suivante en serait allégée. Les deux bénéfices seraient faux.",
        "À la clôture, les comptes transitoires corrigent ce décalage. Ils ne servent qu'à passer d'une année à l'autre.",
      ],
      definitions: [{ terme: 'Régularisation', definition: "écriture de clôture qui rattache une charge ou un produit à l'année qu'il concerne." }],
      retenir: "Ce qui compte, c'est l'année concernée, pas la date du paiement.",
    },
    {
      titre: "2. Payé d'avance : une partie concerne l'an prochain",
      texte: [
        "Si une charge payée cette année couvre aussi l'an prochain, on en retire la part qui ne nous concerne pas encore. Cette part est un actif : l'entreprise a droit à une prestation qu'elle a déjà payée.",
        'On la compte mois par mois.',
      ],
      exemple: ex("Prime d'assurance de 1'200.00 payée le 1er juillet pour douze mois :", {
        lignes: ["Six mois concernent cette année, six mois l'an prochain : 1'200.00 × 6 ÷ 12 = 600.00.", 'Au 31.12 : Actifs transitoires / Assurances, 600.00.'],
        conclusion: 'Le compte Assurances ne montre plus que 600.00 : la part de cette année.',
      }),
      questions: [{ question: "Un loyer de 3'000.00 pour janvier a été payé le 28 décembre. Quelle écriture au 31 décembre ?", reponse: "Tout le montant concerne l'an prochain : Actifs transitoires / Loyers, 3'000.00." }],
    },
    {
      titre: '3. Pas encore payé : la charge existe quand même',
      texte: ["Si une charge de cette année n'est ni payée ni facturée au 31 décembre, on l'ajoute, au besoin en l'estimant. En face, on inscrit une dette à venir."],
      exemples: [
        ex("Le loyer de décembre, 2'000.00, n'est pas encore payé :", { lignes: ["Au 31.12 : Loyers / Passifs transitoires, 2'000.00."] }),
        ex("L'électricité du dernier trimestre sera facturée en janvier ; on l'estime à 450.00 :", { lignes: ['Au 31.12 : Électricité, gaz / Passifs transitoires, 450.00.'] }),
      ],
      piege: "Actif ou passif ? Payé d'avance : l'entreprise a un avoir, c'est un actif transitoire. Pas encore payé : elle doit quelque chose, c'est un passif transitoire.",
    },
    {
      titre: '4. Les produits se régularisent de la même façon',
      texte: ["Le raisonnement vaut aussi pour les produits. Un produit de l'année qui n'est pas encore encaissé ni facturé est un avoir. Un produit encaissé d'avance pour l'an prochain est une dette : il faudra encore fournir la prestation."],
      exemple: ex('Les quatre situations :', {
        tableau: T(
          ['Situation au 31 décembre', 'Compte transitoire', "Effet sur le résultat de l'année"],
          ["Charge payée d'avance", 'Actifs transitoires', 'La charge diminue'],
          ['Produit à recevoir', 'Actifs transitoires', 'Le produit augmente'],
          ['Charge à payer', 'Passifs transitoires', 'La charge augmente'],
          ["Produit reçu d'avance", 'Passifs transitoires', 'Le produit diminue'],
        ),
      }),
    },
    {
      titre: '5. Au 1er janvier : on extourne',
      texte: [
        "Les comptes transitoires ne doivent pas rester ouverts. À la réouverture, on passe l'écriture inverse de celle du 31 décembre : c'est l'extourne.",
        "La charge retrouve ainsi sa place dans la nouvelle année. Quand la facture arrivera ou que l'assurance continuera de courir, tout tombera juste sans autre calcul.",
      ],
      exemple: ex('Clôture et réouverture, côte à côte :', {
        tableau: T(
          ['Date', 'Débit', 'Crédit', 'CHF'],
          ['31.12', 'Actifs transitoires', 'Assurances', '600.00'],
          ['01.01', 'Assurances', 'Actifs transitoires', '600.00'],
          ['31.12', 'Loyers', 'Passifs transitoires', "2'000.00"],
          ['01.01', 'Passifs transitoires', 'Loyers', "2'000.00"],
        ),
        conclusion: "Après l'extourne, le compte Loyers commence l'année avec 2'000.00 au crédit. Quand le loyer de décembre sera payé en janvier, il s'inscrira au débit et les deux s'annuleront : la nouvelle année ne portera pas un loyer qui n'est pas le sien.",
      }),
      retenir: "Clôture : on régularise. Réouverture : on extourne, par l'écriture inverse.",
    },
  ],

  // ------------------------------------------------------------------------- Pertes sur créances et ducroire
  'creances-ecritures': [
    {
      titre: "1. Vendre à crédit, c'est prendre un risque",
      texte: [
        "Une créance n'est pas encore de l'argent. Tant que le client n'a pas payé, il peut déménager sans laisser d'adresse, contester la facture ou faire faillite.",
        "La comptabilité doit refléter ce risque : une créance que l'on ne touchera jamais n'a rien à faire à l'actif. On distingue trois situations, de la plus grave à la plus incertaine.",
      ],
      definitions: [
        { terme: 'Débiteur', definition: "celui qui doit de l'argent ; ici, le client." },
        { terme: 'Créance douteuse', definition: 'créance dont le paiement est devenu incertain.' },
        { terme: 'Acte de défaut de biens', definition: "document officiel qui constate qu'une poursuite n'a pas permis de payer le créancier." },
      ],
    },
    {
      titre: '2. Le client ne paiera pas : une perte',
      texte: [
        "Quand il est certain que la créance est perdue, par exemple après une faillite, on la sort du bilan. En face, on enregistre une perte.",
        "Le compte Pertes s/créances est rangé avec le chiffre d'affaires : la perte vient en diminution des ventes, puisque c'est une vente qui n'a finalement rien rapporté.",
      ],
      exemple: ex("Un client en faillite devait 2'160.00 :", { lignes: ["Pertes s/créances / Créances clients, 2'160.00."] }),
      retenir: "Dans le cours, la TVA de la vente perdue n'est pas corrigée.",
    },
    {
      titre: '3. Le client paiera peut-être : une créance douteuse',
      texte: [
        "Entre le bon client et la faillite, il y a le doute : rappels sans réponse, poursuite engagée. On isole alors la créance dans un compte à part, pour la surveiller sans la mélanger aux créances saines.",
        "Si l'entreprise avance des frais de poursuite, elle les ajoute à ce que le client lui doit : ils sont à sa charge. Et si le client verse finalement une partie, le reste devient une perte.",
      ],
      exemple: ex("Une créance de 3'200.00 tourne mal :", {
        tableau: T(
          ['Étape', 'Débit', 'Crédit'],
          ['La créance devient douteuse', "Créances douteuses 3'200.00", "Créances clients 3'200.00"],
          ["Le client verse 1'200.00 pour solde de tout compte", "Banque 1'200.00 et Pertes s/créances 2'000.00", "Créances douteuses 3'200.00"],
        ),
      }),
      exemples: [ex('Frais de poursuite de 70.00 avancés par la banque, pour un autre client :', { lignes: ['Créances clients / Banque, 70.00.'] })],
      piege: "Virer une créance en créance douteuse n'est pas encore une perte : c'est un simple reclassement à l'actif. Le résultat ne change pas.",
    },
    {
      titre: '4. Le ducroire : prévoir les pertes à venir',
      texte: [
        "À la clôture, on ne sait pas encore quels clients ne paieront pas, mais l'expérience montre qu'il y en aura. Afficher toutes les créances pour leur montant entier serait trop optimiste.",
        "Le ducroire est une estimation de ce risque, souvent un pourcentage des créances clients. C'est un compte de l'actif qui vient en diminution des créances : il augmente au crédit.",
        "Chaque année, on ne comptabilise que la différence entre le ducroire qu'il faut et celui qui existe déjà.",
      ],
      methode: ['Calculer le ducroire nécessaire : créances clients × taux.', 'Le comparer au ducroire déjà au bilan.', 'Comptabiliser seulement la différence, dans le bon sens.'],
      exemples: [
        ex("Créances clients de 40'000.00, ducroire voulu de 5 %, ducroire existant de 1'500.00 :", { lignes: ["Ducroire nécessaire : 40'000.00 × 5 % = 2'000.00. Il manque 500.00.", 'Pertes s/créances / Ducroire, 500.00.'] }),
        ex("L'année suivante, créances de 30'000.00 ; le ducroire est de 2'000.00 :", { lignes: ["Ducroire nécessaire : 1'500.00. Il y a 500.00 de trop.", 'Ducroire / Pertes s/créances, 500.00.'] }),
        ex('Au bilan :', { tableau: T(['Actif', 'CHF'], ['Créances clients', "40'000.00"], ['Ducroire', "−2'000.00"], ['Créances nettes', "38'000.00"]) }),
      ],
      piege: "On ne repasse pas le ducroire entier chaque année : seulement l'ajustement.",
      questions: [{ question: "Créances 60'000.00, taux 4 %, ducroire existant 1'800.00. Quelle écriture ?", reponse: "Nécessaire : 2'400.00. Il manque 600.00 : Pertes s/créances / Ducroire, 600.00." }],
    },
    {
      titre: '5. Une bonne surprise : la créance amortie est payée',
      texte: ["Parfois, un client dont la créance avait été passée en perte une année précédente finit par payer. La créance n'existe plus dans les comptes ; ce n'est pas non plus une vente de cette année. C'est un produit exceptionnel."],
      exemple: ex('Un ancien client verse 450.00 :', { lignes: ['Banque / Produits exceptionnels, 450.00.'] }),
      retenir: 'Perte certaine : Pertes s/créances. Risque estimé : Ducroire. Récupération inattendue : Produits exceptionnels.',
    },
  ],

  // ------------------------------------------------------------------------- Salaires et charges sociales
  'salaires-ecritures': [
    {
      titre: '1. Du salaire brut au salaire net',
      texte: [
        "Le salaire convenu dans le contrat est le salaire brut. L'employé ne le reçoit pas en entier : l'employeur retient ses cotisations aux assurances sociales et les verse à sa place.",
        "Ces assurances protègent l'employé : la retraite et l'invalidité (AVS, AI), la perte de gain en cas de service ou de maternité (APG), le chômage (AC), et la caisse de pension (LPP). Ce qui arrive sur son compte est le salaire net.",
        "Les taux changent selon les années et les caisses : ils sont toujours donnés par l'énoncé ou par la fiche de salaire.",
      ],
      definitions: [
        { terme: 'Salaire brut', definition: 'salaire convenu, avant les retenues.' },
        { terme: 'Retenues', definition: "cotisations de l'employé, prélevées sur son salaire par l'employeur." },
        { terme: 'Salaire net', definition: "salaire brut moins les retenues : ce que l'employé reçoit." },
      ],
      exemple: ex("Salaire brut de 5'000.00, taux donnés par l'énoncé :", { tableau: T(['', 'CHF'], ['Salaire brut', "5'000.00"], ['− AVS/AI/APG/AC 6,4 %', '320.00'], ['− LPP (caisse de pension) 4 %', '200.00'], ['Salaire net', "4'480.00"]) }),
    },
    {
      titre: "2. L'écriture du salaire",
      texte: ["La charge de l'entreprise est le salaire brut, pas le net : les retenues font partie de ce que le travail de l'employé lui coûte. Le net sort de la banque ; les retenues deviennent des dettes envers les assurances, à verser plus tard."],
      exemple: ex('Le salaire ci-dessus, en une écriture composée :', {
        tableau: T(['Débit', 'Crédit'], ["Salaires 5'000.00", "Dette AVS 320.00 et Dette LPP 200.00 et Banque 4'480.00"]),
        conclusion: "On peut aussi passer deux écritures : les retenues (Salaires / Dette AVS et Dette LPP, 520.00), puis le versement du net (Salaires / Banque, 4'480.00). Le résultat est le même.",
      }),
      piege: "Passer seulement le net en charge sous-estime le coût du salaire de 520.00, et les dettes envers les assurances n'apparaissent nulle part.",
    },
    {
      titre: "3. La part de l'employeur",
      texte: ["L'employeur paie lui aussi des cotisations, en plus du salaire. L'employé ne les voit pas sur sa fiche, mais elles existent. C'est une charge supplémentaire : les charges sociales."],
      exemple: ex("Mêmes taux que pour l'employé :", {
        tableau: T(['Débit', 'Crédit'], ['Charges sociales 520.00', 'Dette AVS 320.00 et Dette LPP 200.00']),
        conclusion: "Coût total de cet employé pour le mois : 5'000.00 + 520.00 = 5'520.00, pour un net versé de 4'480.00.",
      }),
      retenir: "Un salaire coûte plus à l'employeur que le brut, et rapporte moins à l'employé que le brut.",
    },
    {
      titre: '4. Le versement aux assurances',
      texte: ["Les dettes accumulées, part de l'employé et part de l'employeur, sont versées aux caisses. La dette s'éteint ; il n'y a plus de charge à ce moment, elle a déjà été comptée."],
      exemple: ex('Paiement des deux caisses par la banque :', { tableau: T(['Débit', 'Crédit', 'CHF'], ['Dette AVS', 'Banque', '640.00'], ['Dette LPP', 'Banque', '400.00']) }),
      questions: [{ question: 'Pourquoi la dette AVS est-elle de 640.00 et non de 320.00 ?', reponse: "Parce qu'elle réunit la retenue sur le salaire de l'employé (320.00) et la cotisation de l'employeur (320.00)." }],
    },
    {
      titre: '5. Une avance sur salaire',
      texte: ["Un employé peut demander une partie de son salaire avant la fin du mois. Ce n'est pas encore une charge : l'entreprise lui prête de l'argent, qu'elle retiendra sur son prochain salaire. C'est une créance."],
      exemple: ex('Avance de 800.00 virée par la banque :', { lignes: ['Avances de salaire / Banque, 800.00.'] }),
    },
    {
      titre: "6. Vue d'ensemble",
      texte: ['Trois montants différents décrivent le même salaire, selon le point de vue.'],
      exemple: ex('Le même mois, trois regards :', { tableau: T(['Point de vue', 'Montant', 'CHF'], ["L'employé", 'Salaire net reçu', "4'480.00"], ['Le contrat', 'Salaire brut', "5'000.00"], ["L'employeur", 'Brut + charges sociales', "5'520.00"]) }),
      retenir: "Salaires : le brut. Charges sociales : la part de l'employeur. Dettes : ce qui sera versé aux caisses.",
    },
  ],

  // --------------------------------------------------------------------------------- Livres auxiliaires
  // ------------------------------------------- Synthèse de clôture (second audit, 26.11.2026, à relire)
  'synthese-cfc2': [
    {
      titre: "1. Reconnaître l'écriture avant de la passer",
      texte: [
        "À la clôture, la difficulté n'est plus la règle de chaque chapitre : c'est de savoir de quel chapitre relève l'opération. Les écritures se ressemblent, il faut donc lire l'indice qui les distingue.",
        "Cette série mêle la TVA, les amortissements, les transitoires, les créances et les salaires. Elle paraît plus difficile qu'une série d'un seul chapitre : c'est normal, et c'est justement ce qui fait progresser.",
      ],
      exemple: ex("Les indices qui décident du type d'écriture :", {
        tableau: T(
          ['Indice dans la pièce ou la note', "Type d'écriture"],
          ['« TVA comprise », « TVA 8,1 % », « décompte du trimestre »', 'TVA : impôt préalable ou TVA due, puis décompte'],
          ["« usure », « taux d'amortissement », « valeur comptable »", 'Amortissement, direct ou indirect selon la méthode demandée'],
          ["« payé d'avance pour l'an prochain », « pas encore facturé »", 'Transitoire : actif ou passif selon le cas'],
          ['« faillite », « acte de défaut de biens », « risque de perte estimé »', 'Perte sur créance, créance douteuse ou ajustement du ducroire'],
          ['« salaire brut », « retenues », « part de l’employeur »', 'Salaire et charges sociales'],
        ),
      }),
    },
    {
      titre: '2. Calculer, puis comptabiliser',
      texte: [
        "Dans les écritures de clôture, le montant se calcule presque toujours : TVA arrondie aux 5 centimes, amortissement au prorata, différence de ducroire, retenues. Faites le calcul d'abord, sur une ligne, puis choisissez les comptes.",
      ],
      methode: [
        "TVA : hors taxe × taux, ou TTC × taux ÷ (100 + taux), arrondie aux 5 centimes.",
        "Amortissement constant : valeur d'acquisition × taux ; dégressif : valeur comptable × taux ; au prorata des mois la première année.",
        'Ducroire : ducroire nécessaire − ducroire existant ; on ne passe que la différence.',
        'Salaire : chaque retenue = brut × taux donné, arrondie aux 5 centimes ; net = brut − retenues.',
      ],
      retenir: "À la clôture, lisez l'indice qui dit de quel chapitre relève l'opération, faites le calcul, puis seulement choisissez les comptes.",
    },
  ],

  'livres-auxiliaires': [
    {
      titre: '1. Un compte pour tous, un compte pour chacun',
      texte: [
        "Le compte Créances clients dit combien tous les clients nous doivent ensemble. C'est suffisant pour le bilan, mais pas pour le travail de tous les jours : pour relancer un client en retard, il faut savoir combien chacun doit, et depuis quand.",
        "Le livre auxiliaire tient donc un compte par client. Le compte Créances clients en est le total : on l'appelle le compte collectif.",
      ],
      definitions: [
        { terme: 'Compte collectif', definition: 'compte du grand livre qui réunit toutes les créances (ou toutes les dettes).' },
        { terme: 'Livre auxiliaire', definition: 'ensemble des comptes individuels, un par client ou par fournisseur.' },
      ],
    },
    {
      titre: "2. Tenir le compte d'un client",
      texte: ["Chaque facture augmente ce que le client doit ; chaque paiement, chaque retour, chaque rabais le diminue. Le solde est ce qu'il doit encore."],
      methode: ['Partir du solde initial du client.', 'Ajouter ses factures de la période.', 'Retrancher ses paiements, ses retours et les rabais accordés.', 'Additionner les soldes de tous les clients et comparer au compte collectif.'],
      exemple: ex('Trois clients au 31 mars :', {
        tableau: T(['Client', 'Solde initial', '+ Factures', '− Paiements', 'Solde'], ['Garage Favre', '400.00', "1'200.00", '900.00', '700.00'], ['Hôtel du Parc', '0.00', "1'180.00", '0.00', "1'180.00"], ['Fleurs Perrin', '650.00', '0.00', '650.00', '0.00'], ['Total = Créances clients', "1'050.00", "2'380.00", "1'550.00", "1'880.00"]),
      }),
      retenir: 'Somme des comptes individuels = solde du compte collectif. Sinon, il y a une erreur à chercher.',
    },
    {
      titre: '3. À quoi cela sert',
      texte: [
        "Le livre auxiliaire montre qui paie à temps, qui est en retard, et à qui il ne faut plus vendre à crédit. Il sert de base aux rappels.",
        "Le même principe existe pour les fournisseurs : un compte par fournisseur, dont le total est le compte Dettes fournisseurs. Il permet de payer chaque facture à son échéance, ni trop tôt ni trop tard.",
      ],
      questions: [{ question: "Les comptes individuels totalisent 12'400.00, le compte Créances clients indique 12'900.00. Que faut-il faire ?", reponse: "Chercher l'erreur de 500.00 : une facture inscrite au collectif mais pas chez le client, ou un paiement inscrit chez un client mais pas au collectif." }],
    },
  ],

  // --------------------------------------------------------------------------------- Déclaration de salaire
  'declaration-salaire': [
    {
      titre: '1. Des acomptes, puis un décompte',
      texte: [
        "Pendant l'année, l'employeur ne connaît pas encore le total exact des salaires qu'il versera. Il paie donc des acomptes à la caisse de compensation, calculés sur une estimation.",
        "À la fin de l'année, il déclare les salaires réellement versés à chaque employé. La caisse calcule ce qui est vraiment dû et réclame la différence, ou la rembourse.",
      ],
      definitions: [
        { terme: 'Masse salariale', definition: "somme des salaires bruts versés pendant l'année." },
        { terme: 'Caisse de compensation', definition: 'organisme qui encaisse les cotisations AVS, AI, APG et AC.' },
      ],
      retenir: "La masse salariale est la somme des salaires bruts de l'année.",
    },
    {
      titre: '2. Le calcul',
      texte: ["Les cotisations se calculent sur la masse salariale. Elles sont payées pour moitié par l'employé, par retenue sur son salaire, et pour moitié par l'employeur."],
      methode: ["Additionner les salaires bruts de l'année.", "Appliquer chaque taux total (part de l'employé + part de l'employeur).", 'Diviser par deux pour connaître la part de chacun.'],
      exemple: ex("Deux employés à 5'000.00 et 4'000.00 par mois, douze salaires :", {
        tableau: T(['', 'Calcul', 'CHF'], ['Masse salariale', "12 × 5'000.00 + 12 × 4'000.00", "108'000.00"], ['AVS/AI/APG (5,3 % + 5,3 %)', "108'000.00 × 10,6 %", "11'448.00"], ['AC (1,1 % + 1,1 %)', "108'000.00 × 2,2 %", "2'376.00"], ['Total des cotisations', '', "13'824.00"], ["Part de l'employeur", "13'824.00 ÷ 2", "6'912.00"]),
      }),
      piege: "Les taux changent : utilisez toujours ceux que donne l'énoncé.",
    },
    {
      titre: '3. Le solde à payer',
      texte: ['On compare ce qui est dû à ce qui a déjà été versé en acomptes.'],
      exemple: ex("Acomptes versés pendant l'année : 13'200.00.", { lignes: ["Dû : 13'824.00. Déjà versé : 13'200.00.", 'Solde à payer à la caisse : 624.00.'] }),
      questions: [{ question: "Masse salariale 90'000.00, taux total AVS/AI/APG 10,6 %. Quelle est la retenue totale sur les salaires des employés ?", reponse: "90'000.00 × 5,3 % = 4'770.00 (la moitié de 9'540.00)." }],
    },
  ],

  // ----------------------------------------------------------------------------------- Marge contributive
  'marge-contributive': [
    {
      titre: '1. Des coûts qui bougent, des coûts qui restent',
      texte: [
        "Un vendeur de sandwichs paie chaque jour le pain et la garniture : plus il vend, plus il en achète. Il paie aussi l'emplacement de son stand, le même montant qu'il vende dix sandwichs ou trois cents.",
        "Les premiers sont des coûts variables : ils suivent les ventes. Les seconds sont des charges fixes : ils tombent quoi qu'il arrive.",
      ],
      definitions: [
        { terme: 'Coût variable', definition: 'coût qui augmente avec chaque unité vendue : marchandise, emballage.' },
        { terme: 'Charges fixes', definition: 'charges indépendantes des quantités vendues : loyer, salaires fixes, assurances.' },
      ],
    },
    {
      titre: '2. Ce que chaque vente laisse',
      texte: ["La marge contributive est ce qui reste d'une vente une fois son coût variable payé. Elle contribue d'abord à couvrir les charges fixes ; ce qui dépasse est le bénéfice."],
      exemple: ex("Prix de vente 20.00, coût variable 12.00, charges fixes 4'000.00 :", {
        tableau: T(['Pièces vendues', 'Marge contributive', 'Charges fixes', 'Résultat'], ['300', "2'400.00", "4'000.00", "−1'600.00"], ['500', "4'000.00", "4'000.00", '0.00'], ['700', "5'600.00", "4'000.00", "1'600.00"]),
        conclusion: 'Marge par pièce : 20.00 − 12.00 = 8.00. Chaque pièce vendue en plus améliore le résultat de 8.00.',
      }),
      retenir: 'Marge contributive par pièce = prix de vente − coût variable.',
    },
    {
      titre: '3. Le seuil de rentabilité',
      texte: ["Combien faut-il vendre pour ne pas perdre d'argent ? Il faut que la marge couvre exactement les charges fixes. En dessous, l'entreprise est en perte ; au-dessus, elle gagne."],
      methode: ['Calculer la marge contributive par pièce.', 'Diviser les charges fixes par cette marge.', 'Arrondir à la pièce supérieure.'],
      exemple: ex('Même exemple :', { lignes: ["Seuil : 4'000.00 ÷ 8.00 = 500 pièces.", "En chiffre d'affaires : 500 × 20.00 = 10'000.00."] }),
      retenir: 'Seuil = charges fixes ÷ marge contributive par pièce.',
    },
    {
      titre: '4. Se servir de la marge pour décider',
      texte: ['La marge contributive répond à des questions concrètes : que se passe-t-il si je baisse mon prix, si mon fournisseur augmente le sien, si mon loyer monte ?'],
      exemples: [
        ex('Le prix de vente baisse à 18.00 :', { lignes: ['Marge par pièce : 18.00 − 12.00 = 6.00.', "Nouveau seuil : 4'000.00 ÷ 6.00 = 666,7, soit 667 pièces."] }),
        ex("Le loyer augmente : les charges fixes passent à 4'800.00.", { lignes: ["Nouveau seuil : 4'800.00 ÷ 8.00 = 600 pièces."] }),
      ],
      questions: [{ question: "Prix 50.00, coût variable 30.00, charges fixes 12'000.00. Combien de pièces pour un bénéfice de 3'000.00 ?", reponse: "Marge par pièce : 20.00. Il faut couvrir 12'000.00 + 3'000.00 = 15'000.00, soit 750 pièces." }],
    },
  ],

  // ----------------------------------------------------------------------- Feuille de répartition des coûts
  'repartition-couts': [
    {
      titre: '1. À qui appartient ce coût ?',
      texte: [
        "Le prix d'achat d'un vélo appartient à ce vélo : c'est un coût direct. Le loyer, lui, sert à la fois au magasin, au bureau et à l'entrepôt : c'est un coût indirect, qu'on ne peut rattacher à rien de précis sans le partager.",
        "Pour savoir ce que coûte chaque partie de l'entreprise, on répartit ces charges indirectes entre des centres de coûts.",
      ],
      definitions: [
        { terme: 'Centre de coûts', definition: "partie de l'entreprise dont on veut connaître le coût : achat, vente, administration." },
        { terme: 'Clé de répartition', definition: "règle de partage d'une charge, en pour cent." },
      ],
    },
    {
      titre: '2. Choisir une clé',
      texte: ["Une bonne clé reflète ce qui fait naître le coût. Le loyer se partage d'après la surface occupée, les salaires d'après le temps passé, l'électricité d'après la consommation."],
      exemple: ex('Des clés courantes :', { tableau: T(['Charge', 'Clé logique'], ['Loyer', 'Surface en m²'], ['Salaires', 'Nombre de personnes ou heures'], ['Assurance des locaux', 'Surface ou valeur du contenu'], ['Téléphone', 'Nombre de postes']) }),
    },
    {
      titre: '3. La feuille de répartition',
      texte: ['Chaque charge est répartie selon sa clé. On additionne ensuite ce que chaque centre a reçu.'],
      methode: ['Inscrire chaque charge indirecte sur une ligne.', 'Appliquer sa clé à chaque centre.', 'Vérifier que la ligne retrouve le total de la charge.', 'Additionner chaque colonne.'],
      exemple: ex("Loyer de 12'000.00 et salaires de 40'000.00 :", {
        tableau: T(['Charge', 'Achat', 'Vente', 'Administration'], ['Loyer (20 % / 50 % / 30 %)', "2'400.00", "6'000.00", "3'600.00"], ['Salaires (25 % / 50 % / 25 %)', "10'000.00", "20'000.00", "10'000.00"], ['Total du centre', "12'400.00", "26'000.00", "13'600.00"]),
        conclusion: "12'400.00 + 26'000.00 + 13'600.00 = 52'000.00, soit exactement le loyer et les salaires réunis.",
      }),
      retenir: 'Le total des centres est égal au total des charges réparties : rien ne se perd.',
      questions: [{ question: "Une assurance de 3'000.00 est répartie 10 % / 60 % / 30 %. Combien reçoit le centre Vente ?", reponse: "3'000.00 × 60 % = 1'800.00." }],
    },
  ],
};
