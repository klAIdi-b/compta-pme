// Leçons approfondies du parcours « Apprendre », maturité professionnelle (réécrites le 24.11.2026 sur le modèle des
// leçons de 1re année : vocabulaire, démarche, plusieurs exemples, questions de contrôle ; à relire).
// Les règles reprennent celles du projet (CLAUDE.md) et des générateurs de calcul ; exemples chiffrés à la main.
import type { ExempleLecon, PartieLecon } from './lecons';

const T = (entetes: string[], ...lignes: string[][]) => ({ entetes, lignes });
const ex = (situation: string, x: Omit<ExempleLecon, 'situation'> = {}): ExempleLecon => ({ situation, ...x });

export const LECONS_MP: Record<string, PartieLecon[]> = {
  // ------------------------------------------------------------------------------- Plan comptable PME
  'classes-pme': [
    {
      titre: '1. Un numéro qui dit où ranger le compte',
      texte: [
        "Une entreprise utilise des dizaines de comptes, parfois des centaines. Pour s'y retrouver, on les numérote, comme les rayons d'une bibliothèque. La plupart des PME suisses suivent la même numérotation : le plan comptable PME.",
        "Le premier chiffre du numéro indique la classe : il suffit de le lire pour savoir de quel genre de compte il s'agit. Les chiffres suivants précisent le groupe, puis le compte lui-même.",
      ],
      definitions: [
        { terme: 'Plan comptable', definition: "liste ordonnée et numérotée de tous les comptes d'une entreprise." },
        { terme: 'Classe', definition: 'grande famille de comptes, donnée par le premier chiffre.' },
      ],
      exemple: ex('Les classes du plan comptable PME :', {
        tableau: T(
          ['Classe', 'Contenu', 'Exemple'],
          ['1', 'Actifs', 'Banque, Véhicules'],
          ['2', 'Passifs', 'Dettes fournisseurs, Capital'],
          ['3', "Chiffre d'affaires", 'Ventes de marchandises'],
          ['4', 'Charges de marchandises et de services', 'Achats de marchandises'],
          ['5', 'Charges de personnel', 'Salaires, Charges sociales'],
          ['6', "Autres charges d'exploitation, amortissements, résultat financier", 'Loyers, Amortissements'],
          ['7', 'Activités annexes', "Produits d'immeubles"],
          ['8', 'Hors exploitation, exceptionnels, impôts', 'Produits exceptionnels, Impôts'],
          ['9', 'Clôture', 'Compte de résultat'],
        ),
      }),
      retenir: 'Classes 1 et 2 : le bilan. Classes 3 à 8 : le compte de résultat. Classe 9 : la clôture.',
    },
    {
      titre: '2. Lire un numéro de compte',
      texte: ["Chaque chiffre affine le classement. En lisant le numéro de gauche à droite, on passe de la classe au groupe, puis au compte précis."],
      exemple: ex('Le compte 1020 Banque, chiffre par chiffre :', {
        tableau: T(['Numéro', 'Niveau', 'Signification'], ['1', 'Classe', 'Actifs'], ['10', 'Groupe', 'Actifs circulants'], ['100', 'Sous-groupe', 'Liquidités'], ['1020', 'Compte', 'Banque']),
        conclusion: 'Deux comptes dont les numéros commencent de la même façon sont voisins dans le bilan : 1000 Caisse, 1010 Poste et 1020 Banque sont trois liquidités.',
      }),
      questions: [{ question: 'Dans quelle classe range-t-on un compte numéroté 6300, et que contient-elle ?', reponse: "Classe 6 : les autres charges d'exploitation. 6300 est le compte Assurances." }],
    },
    {
      titre: '3. Les classes suivent le compte de résultat',
      texte: [
        "L'ordre des classes n'est pas un hasard. En descendant de la classe 3 à la classe 8, on parcourt le compte de résultat de haut en bas : ce que l'entreprise vend, ce que coûtent les marchandises, puis le personnel, puis le reste de l'exploitation, enfin ce qui sort de l'activité habituelle et les impôts.",
        "Cet ordre permet de calculer des résultats intermédiaires : la marge brute après les classes 3 et 4, puis le résultat d'exploitation, puis le résultat de l'exercice.",
      ],
      piege: "Certains comptes diminuent leur classe au lieu de l'augmenter : les Déductions accordées et les Pertes s/créances sont en classe 3 parce qu'elles réduisent le chiffre d'affaires ; les Déductions obtenues sont en classe 4 parce qu'elles réduisent le coût des achats.",
      questions: [{ question: 'Où range-t-on le loyer encaissé pour un appartement que l’entreprise loue à un tiers, dans un immeuble sans lien avec son activité ?', reponse: 'En classe 8 : c’est un produit hors exploitation.' }],
    },
  ],

  // -------------------------------------------------------------------------------- Intérêts commerciaux
  interets: [
    {
      titre: "1. L'intérêt : le loyer de l'argent",
      texte: [
        "Prêter de l'argent, c'est comme louer un appartement : celui qui l'utilise paie un loyer. Ce loyer s'appelle l'intérêt. Pour celui qui emprunte, c'est une charge ; pour celui qui prête, un produit.",
        "L'intérêt dépend de trois choses : la somme prêtée, le prix du prêt et la durée. Doublez l'une des trois, l'intérêt double.",
      ],
      definitions: [
        { terme: 'Capital (C)', definition: 'somme prêtée ou placée.' },
        { terme: 'Taux (t)', definition: 'prix du prêt, en pour cent du capital par an.' },
        { terme: 'Durée (j)', definition: 'temps pendant lequel le capital est prêté, en jours.' },
      ],
      exemple: ex("12'000.00 prêtés à 4 % :", { lignes: ["Pendant un an : 12'000.00 × 4 % = 480.00.", "Pendant 90 jours, soit un quart de l'année : 480.00 ÷ 4 = 120.00."] }),
    },
    {
      titre: "2. L'année commerciale : 360 jours",
      texte: [
        "Les mois n'ont pas tous la même longueur, ce qui compliquerait les calculs. L'usage commercial simplifie : chaque mois compte 30 jours, et l'année 360. Le 31 d'un mois compte comme le 30.",
        "On compte les jours du lendemain du premier jour jusqu'au dernier jour compris.",
      ],
      methode: ['Compter les jours qui restent dans le premier mois : 30 − le jour de départ.', 'Ajouter 30 jours par mois entier.', "Ajouter le jour d'arrivée dans le dernier mois."],
      exemples: [
        ex('Du 15 mars au 30 juin :', { lignes: ['Fin mars : 30 − 15 = 15 jours.', 'Avril, mai, juin : 3 × 30 = 90 jours.', 'Total : 105 jours.'] }),
        ex('Du 10 avril au 25 août :', { lignes: ['Fin avril : 30 − 10 = 20 jours.', 'Mai, juin, juillet : 90 jours.', 'Août : 25 jours.', 'Total : 135 jours.'] }),
      ],
      retenir: 'I = C × t × j ÷ 36 000.',
      questions: [{ question: 'Combien de jours du 20 janvier au 5 mai ?', reponse: 'Janvier : 10 jours. Février, mars, avril : 90 jours. Mai : 5 jours. Total : 105 jours.' }],
    },
    {
      titre: '3. Calculer un intérêt',
      texte: ["La formule réunit les trois grandeurs. Le 36 000 vient de 360 jours multipliés par 100, puisque le taux est exprimé en pour cent."],
      exemples: [
        ex("Prêt de 12'000.00 à 4 % pendant 90 jours :", { lignes: ["I = 12'000 × 4 × 90 ÷ 36 000 = 120.00."] }),
        ex("Placement de 25'000.00 à 1,5 % du 15 mars au 30 juin (105 jours) :", { lignes: ["I = 25'000 × 1,5 × 105 ÷ 36 000 = 109.375, soit 109.40."] }),
      ],
      piege: 'Le taux s’écrit sans le signe % dans la formule (4, et non 0,04) : le 36 000 contient déjà la division par 100.',
    },
    {
      titre: '4. Chercher une autre grandeur',
      texte: ["La même formule permet de retrouver la durée, le taux ou le capital quand on connaît l'intérêt. On isole la grandeur cherchée, comme dans une équation."],
      exemple: ex('Les trois formules dérivées :', {
        tableau: T(['On cherche', 'Formule', 'Exemple'], ['La durée', 'j = I × 36 000 ÷ (C × t)', '120 × 36 000 ÷ (12 000 × 4) = 90 jours'], ['Le taux', 't = I × 36 000 ÷ (C × j)', '120 × 36 000 ÷ (12 000 × 90) = 4 %'], ['Le capital', 'C = I × 36 000 ÷ (t × j)', "120 × 36 000 ÷ (4 × 90) = 12'000.00"]),
      }),
      questions: [{ question: "Un capital de 8'000.00 a rapporté 60.00 en 180 jours. Quel est le taux ?", reponse: "t = 60 × 36 000 ÷ (8'000 × 180) = 1,5 %." }],
    },
    {
      titre: '5. Comptabiliser les intérêts',
      texte: ["L'intérêt payé sur un emprunt est une charge financière ; l'intérêt reçu sur un placement est un produit financier."],
      exemple: ex('Deux écritures :', { tableau: T(['Opération', 'Débit', 'Crédit', 'CHF'], ["La banque débite l'intérêt de l'emprunt", 'Charges financières', 'Banque', '480.00'], ["Un débiteur verse l'intérêt d'un prêt accordé", 'Banque', 'Produits financiers', '120.00']) }),
      retenir: "Le remboursement d'un emprunt ne change pas le résultat ; son intérêt, oui.",
    },
  ],

  // ------------------------------------------------------------------------------------ Compte courant
  'compte-courant': [
    {
      titre: '1. Un solde qui change tout le temps',
      texte: [
        "Sur un compte courant, le solde bouge à chaque versement et à chaque retrait. L'intérêt ne se calcule donc pas sur un seul capital, mais sur une suite de soldes, chacun pendant quelques jours.",
        "On pourrait appliquer la formule de l'intérêt à chaque période et additionner. La méthode des nombres évite ces calculs répétés : on calcule un « nombre » par période, on les additionne, et on applique le taux une seule fois à la fin.",
      ],
      definitions: [
        { terme: 'Compte courant', definition: 'compte bancaire dont le solde varie librement, créditeur ou débiteur.' },
        { terme: 'Nombre', definition: 'capital × jours ÷ 100 : il mesure à la fois le montant et la durée.' },
      ],
      retenir: 'Nombre = capital × jours ÷ 100. Intérêt = total des nombres × taux ÷ 360.',
    },
    {
      titre: '2. Un exemple complet',
      texte: ["Pour chaque solde, on compte les jours pendant lesquels il est resté inchangé, selon l'année commerciale."],
      methode: ['Découper la période en tranches où le solde ne change pas.', 'Calculer le nombre de chaque tranche.', 'Additionner les nombres.', 'Multiplier le total par le taux et diviser par 360.'],
      exemple: ex('Compte créditeur du 1er janvier au 30 juin, taux 1 % :', {
        tableau: T(['Solde', 'Jours', 'Nombre'], ["6'000.00", '60', "3'600"], ["8'000.00", '90', "7'200"], ["12'000.00", '30', "3'600"], ['Total', '180', "14'400"]),
        lignes: ["Intérêt brut : 14'400 × 1 ÷ 360 = 40.00."],
        conclusion: 'Vérification par la formule habituelle : 10.00 + 20.00 + 10.00 = 40.00 pour les trois tranches.',
      }),
    },
    {
      titre: "3. L'impôt anticipé",
      texte: [
        "La banque ne crédite pas tout l'intérêt : elle en retient 35 % pour la Confédération. C'est l'impôt anticipé. Il incite chacun à déclarer ses revenus : l'entreprise qui tient correctement ses comptes le récupère ensuite.",
        "Pour l'entreprise, l'impôt anticipé n'est donc pas une charge, mais une créance envers l'Administration fédérale des contributions.",
      ],
      exemple: ex("Sur 40.00 d'intérêt brut :", {
        lignes: ['Impôt anticipé : 40.00 × 35 % = 14.00.', 'Intérêt net crédité : 40.00 − 14.00 = 26.00.'],
        tableau: T(['Débit', 'Crédit'], ['Banque 26.00 et Créances AFC 14.00', 'Produits financiers 40.00']),
      }),
      piege: "Le produit à enregistrer est l'intérêt brut, pas le net : les 35 % retenus restent un revenu de l'entreprise, qu'elle touchera plus tard.",
      questions: [{ question: "La banque crédite 97.50 d'intérêt net. Quel était l'intérêt brut ?", reponse: '97.50 représente 65 % du brut : 97.50 ÷ 0,65 = 150.00. Impôt anticipé : 52.50.' }],
    },
    {
      titre: '4. Solde créditeur, solde débiteur',
      texte: [
        "Quand le compte est créditeur, la banque doit de l'argent à l'entreprise et lui verse un intérêt, généralement faible. Quand il est débiteur, c'est l'entreprise qui emprunte à la banque, à un taux nettement plus élevé.",
        "Sur un même relevé, on calcule séparément les nombres créditeurs et les nombres débiteurs, chacun avec son taux.",
      ],
      retenir: "Intérêt créditeur : un produit, soumis à l'impôt anticipé. Intérêt débiteur : une charge financière.",
    },
  ],

  // ---------------------------------------------------------------------------------- Monnaies étrangères
  devises: [
    {
      titre: '1. Deux cours, et la banque gagne entre les deux',
      texte: [
        "La banque achète une monnaie étrangère à un prix et la revend plus cher : c'est son métier. Il y a donc toujours deux cours, le cours achat (le plus bas) et le cours vente (le plus haut).",
        "Les cours sont donnés du point de vue de la banque : « achat » signifie que la banque achète la monnaie étrangère, « vente » qu'elle la vend.",
      ],
      definitions: [
        { terme: 'Cours', definition: "prix d'une monnaie étrangère en francs suisses, pour 1 ou pour 100 unités." },
        { terme: 'Cours achat', definition: 'prix auquel la banque achète la monnaie étrangère.' },
        { terme: 'Cours vente', definition: 'prix auquel la banque vend la monnaie étrangère.' },
      ],
      retenir: "L'entreprise a besoin d'euros : la banque les lui vend (cours vente). L'entreprise reçoit des euros : la banque les lui achète (cours achat).",
    },
    {
      titre: '2. Billets ou devises ?',
      texte: [
        "Les billets sont l'argent en espèces, échangé au guichet. Les devises sont l'argent des comptes : virements, cartes, chèques. Manipuler, transporter et assurer des billets coûte cher à la banque : l'écart entre achat et vente est donc plus grand pour les billets.",
      ],
      methode: ['Espèces ou virement ? Billets ou devises.', 'Que fait la banque : elle vend la monnaie étrangère, ou elle l’achète ?', 'Lire le cours dans la bonne case, puis multiplier.'],
      exemple: ex("Cours de l'euro (pour 1 EUR) :", {
        tableau: T(['', 'Achat', 'Vente'], ['Devises', '0,9320', '0,9480'], ['Billets', '0,9100', '0,9700']),
        lignes: [
          "Payer par virement une facture de EUR 2'000.00 : devises, vente. 2'000.00 × 0,9480 = CHF 1'896.00.",
          "Un client verse EUR 2'000.00 sur notre compte : devises, achat. 2'000.00 × 0,9320 = CHF 1'864.00.",
          'Acheter EUR 500.00 en billets pour un voyage : billets, vente. 500.00 × 0,9700 = CHF 485.00.',
          'Rendre EUR 100.00 en billets au retour : billets, achat. 100.00 × 0,9100 = CHF 91.00.',
        ],
      }),
      piege: "Ne choisissez pas le cours d'après ce que fait l'entreprise (« elle achète des euros, donc cours achat ») : le cours porte le nom de ce que fait la banque.",
      questions: [{ question: "Avec ces cours, combien coûte en francs un virement de EUR 4'500.00 à un fournisseur ?", reponse: "Devises, vente : 4'500.00 × 0,9480 = CHF 4'266.00." }],
    },
    {
      titre: '3. Entre la facture et le paiement, le cours a bougé',
      texte: [
        "La facture en monnaie étrangère est comptabilisée en francs, au cours du jour. Au moment du paiement, le cours a changé : on ne paie pas exactement le montant comptabilisé.",
        "Dans le cours, cette différence de change corrige le compte de la marchandise, sans compte de change séparé. Si l'on paie plus que prévu, l'achat a coûté plus cher ; si l'on paie moins, il a coûté moins cher.",
      ],
      exemples: [
        ex("Achat : facture comptabilisée pour CHF 1'880.00, payée CHF 1'896.00.", { tableau: T(['Débit', 'Crédit'], ["Dettes fournisseurs 1'880.00 et Achats de marchandises 16.00", "Banque 1'896.00"]) }),
        ex("Vente : facture de EUR 3'000.00 comptabilisée pour CHF 2'820.00 ; la banque crédite CHF 2'796.00.", {
          tableau: T(['Débit', 'Crédit'], ["Banque 2'796.00 et Ventes de marchandises 24.00", "Créances clients 2'820.00"]),
          conclusion: "La vente a rapporté 24.00 de moins que prévu : le compte Ventes de marchandises est diminué d'autant.",
        }),
      ],
      retenir: 'La dette ou la créance s’éteint pour son montant comptabilisé ; la différence de change va dans Achats ou Ventes de marchandises.',
    },
  ],

  // ----------------------------------------------------------------------------- Calcul des prix à rebours
  'prix-inverse': [
    {
      titre: "1. L'échelle des prix",
      texte: [
        "Entre le prix affiché par le fournisseur et le prix affiché en vitrine, il y a une série d'étapes : des réductions obtenues, des frais, une marge, des réductions accordées. On les range sur une échelle à huit marches.",
      ],
      exemple: ex('Les huit prix, du fournisseur au client :', {
        tableau: T(
          ['Sigle', 'Nom', 'Comment on y arrive'],
          ['PAB', "Prix d'achat brut", 'Prix de catalogue du fournisseur'],
          ['PAC', "Prix d'achat à crédit", 'PAB − rabais obtenu'],
          ['PAN', "Prix d'achat net", 'PAC − escompte obtenu'],
          ['PRA', "Prix de revient d'achat", "PAN + frais d'achat"],
          ['PR', 'Prix de revient', 'PRA + frais généraux'],
          ['PVN', 'Prix de vente net', 'PR + bénéfice net'],
          ['PVC', 'Prix de vente à crédit', 'PVN + escompte accordé'],
          ['PVB', 'Prix de vente brut', 'PVC + rabais accordé'],
        ),
      }),
      retenir: 'PAB → PAC → PAN → PRA → PR → PVN → PVC → PVB.',
    },
    {
      titre: "2. Monter l'échelle, puis la redescendre",
      texte: [
        "On monte l'échelle quand on connaît le prix d'achat et qu'on cherche le prix de vente. Mais souvent le prix de vente est imposé par le marché : « ce produit doit se vendre 150.00 ». La question devient : combien ai-je le droit de le payer ?",
        "On redescend alors l'échelle, du prix de vente brut jusqu'au prix d'achat brut. C'est le calcul à rebours.",
      ],
    },
    {
      titre: '3. La règle qui évite toutes les erreurs',
      texte: [
        "Un pourcentage se calcule toujours sur une base précise. Si le bénéfice vaut 20 % du prix de revient, alors le prix de vente net représente 120 % du prix de revient. Pour retrouver le prix de revient, on divise par 120 % ; on ne retire pas 20 %.",
        "Avant chaque étape, demandez-vous : sur quel prix ce pourcentage est-il calculé, et est-ce que je connais ce prix ?",
      ],
      methode: ['Repérer la base du pourcentage (le prix sur lequel il est calculé).', 'Si la base est connue : multiplier.', 'Si la base est ce que l’on cherche : diviser par (100 + taux) % ou par (100 − taux) %.', 'Arrondir au centime avant de passer à l’étape suivante.'],
      exemple: ex('PVN de 135.00, bénéfice de 20 % du PR :', { lignes: ['Juste : 135.00 ÷ 1,20 = 112.50.', 'Faux : 135.00 − 20 % = 108.00, car 20 % de 135.00 ne sont pas 20 % du PR.', 'Vérification : 112.50 + 20 % = 112.50 + 22.50 = 135.00.'] }),
      retenir: 'Pourcentage ajouté : diviser par (100 + taux) %. Pourcentage déduit : diviser par (100 − taux) %.',
    },
    {
      titre: "4. Un exemple d'un bout à l'autre",
      texte: ['Chaque étape est arrondie au centime avant de passer à la suivante.'],
      exemple: ex("PVB 150.00 ; rabais accordé 10 % ; pas d'escompte ; bénéfice 20 % du PR ; frais généraux 25 % du PRA ; frais d'achat 5.00 ; rabais obtenu 20 % :", {
        tableau: T(['Étape', 'Calcul', 'CHF'], ['PVC = PVN', '150.00 × 90 %', '135.00'], ['PR', '135.00 ÷ 120 %', '112.50'], ['PRA', '112.50 ÷ 125 %', '90.00'], ['PAN = PAC', '90.00 − 5.00', '85.00'], ['PAB', '85.00 ÷ 80 %', '106.25']),
        conclusion: "Contrôle en remontant : 106.25 − 20 % = 85.00 ; + 5.00 = 90.00 ; + 25 % = 112.50 ; + 20 % = 135.00 ; 135.00 ÷ 90 % = 150.00.",
      }),
      piege: "Le rabais accordé se calcule sur le PVB, que l'on connaît : on multiplie par 90 %. Le rabais obtenu se calcule sur le PAB, que l'on cherche : on divise par 80 %.",
      questions: [{ question: 'PR de 240.00 ; les frais généraux valent 20 % du PRA. Quel est le PRA ?', reponse: '240.00 ÷ 120 % = 200.00.' }],
    },
  ],

  // ---------------------------------------------------------------- Cession et changement de méthode
  'amortissements-mp': [
    {
      titre: '1. Rappel : la valeur comptable',
      texte: [
        "Un bien durable perd de la valeur chaque année : c'est l'amortissement. Ce qu'il vaut encore dans les comptes s'appelle la valeur comptable. Elle n'a aucune raison d'être égale au prix qu'un acheteur serait prêt à payer.",
      ],
      definitions: [
        { terme: 'Valeur comptable', definition: "valeur d'acquisition moins les amortissements cumulés." },
        { terme: 'Cession', definition: "vente d'un bien que l'entreprise utilisait, et non d'une marchandise." },
      ],
    },
    {
      titre: '2. Vendre un bien déjà amorti',
      texte: [
        "Quand l'entreprise revend une machine, elle ne compare pas le prix de vente à ce qu'elle l'avait payée, mais à sa valeur comptable. La différence est le résultat de la cession.",
        "Un bénéfice de cession signifie que le bien avait été amorti plus vite qu'il ne perdait réellement de la valeur ; une perte, qu'il ne l'avait pas été assez.",
      ],
      methode: ["Calculer les amortissements cumulés jusqu'à la vente.", "Valeur comptable = valeur d'acquisition − amortissements cumulés.", 'Résultat de cession = prix de vente − valeur comptable.'],
      exemple: ex("Machine achetée 40'000.00, amortie 20 % par an de la valeur d'acquisition depuis 3 ans :", {
        lignes: ["Amortissements cumulés : 40'000.00 × 20 % × 3 = 24'000.00.", "Valeur comptable : 40'000.00 − 24'000.00 = 16'000.00.", "Vendue 18'000.00 : bénéfice de cession de 2'000.00.", "Vendue 13'000.00 : perte de cession de 3'000.00."],
      }),
      retenir: 'Résultat de cession = prix de vente − valeur comptable.',
      questions: [{ question: "Véhicule de 30'000.00, amorti linéairement de 25 % depuis 2 ans, vendu 16'000.00. Résultat ?", reponse: "Amortissements cumulés : 15'000.00. Valeur comptable : 15'000.00. Bénéfice de cession : 1'000.00." }],
    },
    {
      titre: '3. Passer de la méthode directe à la méthode indirecte',
      texte: [
        "Avec la méthode directe, le compte du bien montre la valeur comptable. Avec la méthode indirecte, il doit montrer la valeur d'acquisition, et les amortissements figurent à part, dans le fonds d'amortissements cumulés.",
        "Pour changer de méthode, on remet donc dans le compte du bien tout ce qui avait été amorti, et on l'inscrit en face dans le fonds. La valeur comptable ne change pas.",
      ],
      exemple: ex("Véhicule de 30'000.00, amorti deux ans en dégressif, 40 % de la valeur comptable :", {
        lignes: ["1re année : 30'000.00 × 40 % = 12'000.00. 2e année : 18'000.00 × 40 % = 7'200.00.", "Amortissements cumulés : 19'200.00. Valeur comptable : 10'800.00."],
        tableau: T(['Débit', 'Crédit', 'CHF'], ['Véhicules', 'FAC s/véhicules', "19'200.00"]),
        conclusion: "Après l'écriture : Véhicules 30'000.00, FAC s/véhicules 19'200.00. La valeur comptable reste de 10'800.00.",
      }),
      piege: "Le changement de méthode n'est ni une charge ni un produit : le résultat ne bouge pas.",
    },
  ],

  // --------------------------------------------------------------------- Perte de capital et surendettement
  'perte-capital': [
    {
      titre: '1. Quand les pertes mangent les fonds propres',
      texte: [
        "Dans une société anonyme, les actionnaires ne répondent pas des dettes sur leurs biens personnels : seule la fortune de la société garantit ses créanciers. Les fonds propres jouent le rôle d'un coussin de sécurité.",
        "Les fonds propres sont ce qui reste une fois toutes les dettes payées : actifs − dettes. Chaque perte les fait fondre. La loi fixe deux seuils d'alarme, pour protéger ceux qui ont prêté de l'argent à la société.",
      ],
      definitions: [
        { terme: 'Fonds propres', definition: 'actifs moins dettes : ce qui appartient aux actionnaires.' },
        { terme: 'Réserves légales', definition: 'réserves que la loi oblige à constituer, issues du capital ou du bénéfice.' },
      ],
    },
    {
      titre: '2. Premier seuil : la perte de capital (art. 725a CO)',
      texte: [
        "Il y a perte de capital quand les fonds propres ne couvrent plus la moitié du capital-actions et des réserves légales. Le coussin est à moitié vide.",
        "Le conseil d'administration doit alors prendre des mesures pour redresser la situation, et au besoin en proposer à l'assemblée générale.",
      ],
      methode: ['Calculer les fonds propres : actifs − dettes.', 'Calculer le seuil : (capital-actions + réserves légales) ÷ 2.', 'Comparer : fonds propres négatifs, sous le seuil, ou au-dessus ?'],
      exemple: ex("Capital-actions 200'000.00, réserves légales 40'000.00 ; actifs 500'000.00, dettes 400'000.00 :", { lignes: ["Seuil : (200'000.00 + 40'000.00) ÷ 2 = 120'000.00.", "Fonds propres : 500'000.00 − 400'000.00 = 100'000.00.", "100'000.00 est inférieur à 120'000.00 : perte de capital."] }),
    },
    {
      titre: '3. Second seuil : le surendettement (art. 725b CO)',
      texte: [
        "Il y a surendettement quand les dettes dépassent les actifs : même en vendant tout, la société ne pourrait pas rembourser. Les fonds propres sont négatifs, le coussin a disparu.",
        "La situation est grave : en principe, le conseil d'administration doit avertir le tribunal.",
      ],
      exemple: ex("Mêmes actifs, dettes de 520'000.00 :", { lignes: ["Fonds propres : 500'000.00 − 520'000.00 = −20'000.00 : surendettement."] }),
      piege: "Une perte sur l'exercice ne suffit pas à déclencher ces articles : c'est le niveau des fonds propres au bilan qui compte.",
    },
    {
      titre: '4. Les trois situations',
      texte: ["Pour la même société, tout dépend du montant des dettes."],
      exemple: ex("Actifs 500'000.00 ; seuil 120'000.00 :", {
        tableau: T(['Dettes', 'Fonds propres', 'Situation'], ["350'000.00", "150'000.00", 'Pas de perte de capital'], ["400'000.00", "100'000.00", 'Perte de capital'], ["520'000.00", "−20'000.00", 'Surendettement']),
      }),
      retenir: 'Fonds propres inférieurs à la moitié du capital et des réserves légales : perte de capital. Fonds propres négatifs : surendettement.',
      questions: [{ question: "Capital-actions 100'000.00, réserves légales 20'000.00, actifs 300'000.00, dettes 250'000.00. Quelle situation ?", reponse: "Seuil : 60'000.00. Fonds propres : 50'000.00. Ils sont positifs mais sous le seuil : perte de capital." }],
    },
  ],

  // -------------------------------------------------------------------------------- Bordereaux et rendements
  'titres-immeubles': [
    {
      titre: '1. Actions et obligations',
      texte: [
        "Une action est une part d'une société : son détenteur en est copropriétaire et reçoit, les bonnes années, un dividende. Une obligation est une part d'un emprunt : son détenteur est un prêteur et reçoit chaque année un intérêt fixe, le coupon, puis le remboursement à l'échéance.",
        "Le cours d'une action s'exprime en francs par titre. Celui d'une obligation s'exprime en pour cent de sa valeur nominale.",
      ],
      definitions: [
        { terme: 'Valeur nominale', definition: "montant inscrit sur le titre, sur lequel se calcule l'intérêt d'une obligation." },
        { terme: 'Cours', definition: "prix auquel le titre s'échange en bourse." },
        { terme: 'Coupon', definition: "intérêt annuel d'une obligation." },
      ],
    },
    {
      titre: '2. Le bordereau : la facture de la banque',
      texte: [
        "Quand vous achetez des obligations, la banque vous envoie un bordereau. Il additionne quatre éléments : le prix des titres, l'intérêt couru, le courtage de la banque et le droit de timbre.",
        "Pourquoi un intérêt couru ? Le prochain coupon sera versé en entier à l'acheteur, alors que le vendeur a détenu le titre pendant une partie de l'année. L'acheteur lui rembourse donc la part d'intérêt déjà gagnée.",
      ],
      methode: ['Prix : valeur nominale × cours.', 'Intérêt couru : nominal × taux × jours ÷ 36 000.', 'Courtage et droit de timbre : en pour cent du prix.', 'Additionner les quatre montants.'],
      exemple: ex("Obligations 3 %, valeur nominale 10'000.00, cours 98 %, dernier coupon il y a 120 jours, courtage 0,5 %, droit de timbre 0,075 % :", {
        tableau: T(['Élément', 'Calcul', 'CHF'], ['Prix', "10'000.00 × 98 %", "9'800.00"], ['Intérêt couru', "10'000 × 3 × 120 ÷ 36 000", '100.00'], ['Courtage', "9'800.00 × 0,5 %", '49.00'], ['Droit de timbre', "9'800.00 × 0,075 %", '7.35'], ['Total débité', '', "9'956.35"]),
      }),
      piege: "L'intérêt couru se calcule sur la valeur nominale ; le courtage et le timbre sur le prix.",
    },
    {
      titre: '3. Le rendement : ce que rapporte un placement en un an',
      texte: [
        "Le rendement compare ce que le placement a rapporté en une année à ce qu'il a coûté. Exprimé en pour cent, il permet de comparer des placements très différents.",
        "Le revenu d'une année comprend ce qui est encaissé (dividende, intérêt) et ce qui est gagné ou perdu sur le cours.",
      ],
      exemples: [
        ex('Action achetée 200.00, dividende 6.00, revendue 210.00 après un an :', { lignes: ['Revenu : 6.00 de dividende + 10.00 de gain de cours = 16.00.', 'Rendement : 16.00 ÷ 200.00 × 100 = 8,0 %.'] }),
        ex('Obligation 2 %, achetée à 96 %, remboursée à 100 % dans 4 ans :', { lignes: ["Intérêt annuel : 2. Gain au remboursement : 4, réparti sur 4 ans, soit 1 par an.", 'Rendement : (2 + 1) ÷ 96 × 100 = 3,1 %.'] }),
        ex('Obligation 3 %, achetée à 104 %, remboursée à 100 % dans 8 ans :', { lignes: ['Perte au remboursement : 4, répartie sur 8 ans, soit 0,5 par an.', 'Rendement : (3 − 0,5) ÷ 104 × 100 = 2,4 %.'] }),
      ],
      retenir: "Rendement = revenu de l'année (± gain ou perte, réparti sur les années) ÷ capital investi × 100.",
      questions: [{ question: 'Action achetée 80.00, dividende 2.00, cours un an plus tard 78.00. Rendement ?', reponse: '(2.00 − 2.00) ÷ 80.00 = 0 % : la perte de cours a annulé le dividende.' }],
    },
    {
      titre: "4. L'immeuble : rendement brut et rendement net",
      texte: [
        "Le rendement brut compare les loyers au prix de l'immeuble : il se calcule en un instant et sert à comparer des objets.",
        "Le rendement net regarde ce qui reste au propriétaire après les charges et les intérêts de l'hypothèque, par rapport à l'argent qu'il a lui-même investi.",
      ],
      exemple: ex("Immeuble de 1'000'000.00, dont 300'000.00 de fonds propres ; loyers 55'000.00, charges 12'000.00, intérêts hypothécaires 14'000.00 :", {
        lignes: ["Rendement brut : 55'000.00 ÷ 1'000'000.00 × 100 = 5,5 %.", "Ce qui reste au propriétaire : 55'000.00 − 12'000.00 − 14'000.00 = 29'000.00.", "Rendement net : 29'000.00 ÷ 300'000.00 × 100 = 9,7 %."],
        conclusion: "Le rendement net dépasse le rendement brut parce que l'hypothèque coûte 2 % alors que l'immeuble rapporte davantage : c'est l'effet de levier.",
      }),
    },
  ],

  // ------------------------------------------------------------------------ Point mort et rotation du stock
  'point-mort': [
    {
      titre: '1. Le point mort : ni bénéfice ni perte',
      texte: [
        "Au début de l'année, l'entreprise travaille pour payer ses charges fixes : loyer, salaires, assurances. Chaque franc vendu laisse une marge ; quand la somme de ces marges atteint les charges fixes, le point mort est franchi. Tout ce qui est vendu ensuite produit du bénéfice.",
        "Dans un commerce, on admet par simplification que seule la marchandise est un coût variable : la marge contributive est alors égale à la marge brute.",
      ],
      definitions: [
        { terme: 'Point mort', definition: "chiffre d'affaires pour lequel le résultat est nul. On parle aussi de seuil de rentabilité." },
        { terme: 'Taux de marge', definition: "marge brute en pour cent du chiffre d'affaires." },
      ],
      exemple: ex("Chiffre d'affaires annuel 600'000.00, marge brute 40 %, charges fixes 180'000.00 :", { lignes: ["CA au point mort : 180'000.00 ÷ 40 % = 450'000.00.", "Vérification : 450'000.00 × 40 % = 180'000.00, exactement les charges fixes."] }),
      retenir: 'CA au point mort = charges fixes ÷ taux de marge.',
    },
    {
      titre: '2. À quelle date ?',
      texte: ["Si les ventes sont régulières, on peut dire quel jour de l'année le point mort est atteint, en comptant 360 jours."],
      exemple: ex('Même entreprise :', { lignes: ["450'000.00 ÷ 600'000.00 × 360 = 270e jour, soit fin septembre.", "Les trois derniers mois de l'année produisent le bénéfice : 150'000.00 × 40 % = 60'000.00."] }),
      piege: "Plus le point mort est tard dans l'année, plus l'entreprise est fragile : une petite baisse des ventes suffit à la mettre en perte.",
      questions: [{ question: "CA annuel 400'000.00, taux de marge 25 %, charges fixes 80'000.00. CA et jour du point mort ?", reponse: "CA au point mort : 320'000.00. Jour : 320'000.00 ÷ 400'000.00 × 360 = 288e jour." }],
    },
    {
      titre: '3. Agir sur le point mort',
      texte: ["Trois leviers déplacent le point mort : baisser les charges fixes, améliorer le taux de marge, ou vendre davantage pour l'atteindre plus tôt."],
      exemples: [
        ex("Les charges fixes baissent à 160'000.00 :", { lignes: ["Point mort : 160'000.00 ÷ 40 % = 400'000.00, atteint le 240e jour."] }),
        ex('Le taux de marge passe à 45 % :', { lignes: ["Point mort : 180'000.00 ÷ 45 % = 400'000.00 également."] }),
      ],
    },
    {
      titre: '4. La rotation du stock',
      texte: [
        "Un stock qui dort coûte de l'argent : il immobilise des liquidités, occupe de la place, vieillit. La rotation dit combien de fois par an le stock est entièrement vendu et renouvelé.",
        "On la calcule avec le prix de revient d'achat des marchandises vendues (PRAMV), parce que le stock est lui aussi évalué au prix d'achat.",
      ],
      exemple: ex("PRAMV 360'000.00 ; stock initial 50'000.00, stock final 70'000.00 :", { lignes: ["Stock moyen : (50'000.00 + 70'000.00) ÷ 2 = 60'000.00.", "Rotation : 360'000.00 ÷ 60'000.00 = 6 fois par an.", 'Durée moyenne de stockage : 360 ÷ 6 = 60 jours.'] }),
      retenir: 'Rotation = PRAMV ÷ stock moyen. Durée de stockage = 360 ÷ rotation.',
    },
  ],

  // ------------------------------------------------------------------- Flux de trésorerie, méthode directe
  'flux-direct': [
    {
      titre: "1. Le bénéfice n'est pas de l'argent en caisse",
      texte: [
        "Une entreprise peut afficher un bénéfice et manquer d'argent : ses clients n'ont pas encore payé, ou elle vient d'acheter une machine. À l'inverse, elle peut être en perte et avoir des liquidités, parce qu'elle vient d'emprunter.",
        "Le tableau des flux de trésorerie répond à une autre question que le compte de résultat : combien d'argent est réellement entré et sorti, et pourquoi ?",
      ],
      definitions: [
        { terme: 'Liquidités', definition: 'caisse, poste et banque.' },
        { terme: 'Flux de trésorerie', definition: "entrée ou sortie d'argent pendant l'exercice." },
        { terme: 'Cash-flow', definition: "flux net de liquidités produit par l'exploitation." },
      ],
    },
    {
      titre: '2. Trois familles de flux',
      texte: ["On classe les mouvements d'argent selon leur origine."],
      exemple: ex('Les trois activités :', {
        tableau: T(['Activité', 'Entrées', 'Sorties'], ['Exploitation', 'Encaissements des clients', 'Fournisseurs, personnel, loyers'], ['Investissement', "Vente d'immobilisations", "Achat de machines, de véhicules"], ['Financement', 'Emprunt, augmentation de capital', "Remboursement d'emprunt, dividende"]),
      }),
    },
    {
      titre: '3. La méthode directe : on compte les entrées et les sorties',
      texte: [
        "On additionne ce que l'exploitation a fait entrer et on retire ce qu'elle a fait sortir. Seuls comptent les encaissements et les paiements : une vente à crédit non encaissée n'y figure pas.",
      ],
      exemple: ex("Les flux d'exploitation de l'exercice :", {
        tableau: T(['', 'CHF'], ['Encaissements des clients', "500'000.00"], ['− Paiements aux fournisseurs', "260'000.00"], ['− Paiements au personnel', "110'000.00"], ["− Autres paiements d'exploitation", "50'000.00"], ["Cash-flow d'exploitation", "80'000.00"]),
      }),
      piege: "L'amortissement n'apparaît pas : c'est une charge, mais aucun argent ne sort. C'est pour cela que le cash-flow est en général plus élevé que le bénéfice.",
      questions: [{ question: "Ventes de l'année 400'000.00, dont 30'000.00 pas encore encaissées. Quel montant entre dans le cash-flow ?", reponse: "370'000.00 : seuls les encaissements comptent." }],
    },
    {
      titre: '4. Le free cash-flow : ce qui reste vraiment libre',
      texte: ["L'entreprise doit encore payer ses investissements. Ce qui reste ensuite est libre : elle peut rembourser des dettes, verser un dividende ou garder une réserve."],
      exemple: ex("Investissements payés 45'000.00, vente d'une ancienne machine 5'000.00 :", { lignes: ["Free cash-flow : 80'000.00 − 45'000.00 + 5'000.00 = 40'000.00."] }),
      retenir: "Free cash-flow = cash-flow d'exploitation − investissements + désinvestissements.",
    },
  ],

  // --------------------------------------------------------------------------------- Comptabilité analytique
  analytique: [
    {
      titre: '1. Combien coûte vraiment ce produit ?',
      texte: [
        "La comptabilité financière dit si l'entreprise gagne de l'argent. Elle ne dit pas sur quel produit. Pour fixer un prix ou décider d'arrêter une fabrication, il faut connaître le coût de chaque commande : c'est le rôle de la comptabilité analytique.",
        "Certains coûts appartiennent clairement à une commande : la matière, le salaire de celui qui la fabrique. Ce sont les charges directes. D'autres servent à tout le monde : le bâtiment, la direction. Ce sont les charges indirectes, et il faut les répartir.",
      ],
      definitions: [
        { terme: 'Charge directe', definition: "coût que l'on peut attribuer sans calcul à un produit ou à une commande." },
        { terme: 'Charge indirecte', definition: "coût commun à plusieurs produits, qu'il faut répartir." },
        { terme: 'Centre de coûts', definition: "partie de l'entreprise où l'on rassemble des charges indirectes." },
      ],
    },
    {
      titre: '2. La feuille de répartition, en deux temps',
      texte: [
        "D'abord, chaque charge indirecte est attribuée aux centres de coûts : c'est la répartition primaire.",
        "Ensuite, les centres auxiliaires, qui travaillent pour les autres et non pour les produits, sont vidés sur les centres principaux : c'est la répartition secondaire. Le bâtiment abrite la production et l'administration ; son coût leur est donc reporté.",
      ],
      exemple: ex("Bâtiment 40'000.00, à répartir 75 % sur la production et 25 % sur l'administration :", {
        tableau: T(['', 'Bâtiment', 'Production', 'Administration et vente'], ['Répartition primaire', "40'000.00", "200'000.00", "90'000.00"], ['Répartition secondaire', "−40'000.00", "30'000.00", "10'000.00"], ['Total', '0.00', "230'000.00", "100'000.00"]),
        conclusion: "Le total général n'a pas changé : 330'000.00 avant comme après. Le centre auxiliaire est simplement vidé.",
      }),
    },
    {
      titre: "3. L'unité d'œuvre : le prix d'une heure",
      texte: ["Pour imputer le centre Production aux commandes, on le divise par ce qu'il a produit. L'unité choisie doit refléter le travail fourni : des heures-machine, des heures de main-d'œuvre, des pièces."],
      exemple: ex("4'600 heures-machine dans l'année :", { lignes: ["Coût d'une heure-machine : 230'000.00 ÷ 4'600 = 50.00.", 'Une commande qui occupe les machines 10 heures reçoit 500.00 de frais de production.'] }),
      retenir: "Coût d'une unité d'œuvre = total du centre ÷ nombre d'unités.",
    },
    {
      titre: '4. Le prix de revient complet',
      texte: ["On additionne les charges directes de la commande, les heures-machine qu'elle a utilisées, puis sa part des frais d'administration et de vente, en pour cent du coût de production."],
      methode: ['Matières + salaires directs.', "+ heures-machine × coût de l'heure = coût de production.", "+ frais d'administration et de vente (en % du coût de production).", '= prix de revient complet.'],
      exemple: ex("Commande : matières 600.00, salaires directs 400.00, 10 heures-machine ; frais d'administration et de vente 5 % :", {
        tableau: T(['', 'CHF'], ['Matières', '600.00'], ['Salaires directs', '400.00'], ['Frais de production (10 × 50.00)', '500.00'], ['Coût de production', "1'500.00"], ["Frais d'administration et de vente (5 %)", '75.00'], ['Prix de revient complet', "1'575.00"]),
        conclusion: "Le taux de 5 % vient lui aussi de la feuille : total du centre Administration et vente, 100'000.00, divisé par le coût de production de l'année, 2'000'000.00.",
      }),
      questions: [{ question: "Un centre totalise 96'000.00 pour 3'200 heures. Une commande utilise 15 heures. Quels frais lui impute-t-on ?", reponse: "Coût de l'heure : 30.00. Frais imputés : 15 × 30.00 = 450.00." }],
    },
  ],

  // ------------------------------------------------------------------------ Comptes de groupe et normes
  normes: [
    {
      titre: '1. Pourquoi des normes ?',
      texte: [
        "Le Code des obligations est prudent : il autorise une entreprise à sous-évaluer ses actifs ou à surévaluer ses provisions. Elle constitue ainsi des réserves latentes, invisibles dans les comptes. C'est une sécurité, mais celui qui lit le bilan ne voit pas la situation réelle.",
        "Les normes comptables font le choix inverse : elles imposent une image fidèle (true and fair view), pour que les investisseurs puissent comparer les entreprises entre elles.",
      ],
      definitions: [
        { terme: 'Réserve latente', definition: "différence entre la valeur réelle d'un poste et sa valeur, plus prudente, au bilan." },
        { terme: 'Image fidèle', definition: 'présentation des comptes qui reflète la situation économique réelle.' },
      ],
      exemple: ex('Les trois référentiels à connaître :', {
        tableau: T(['Normes', 'Origine', 'Pour qui'], ['Swiss GAAP RPC', 'Suisse', 'PME et groupes suisses'], ['IFRS', 'International (IASB)', 'De nombreux groupes cotés en bourse'], ['US GAAP', 'États-Unis', 'Sociétés cotées aux États-Unis']),
      }),
    },
    {
      titre: '2. Le groupe : plusieurs sociétés, une seule entreprise',
      texte: [
        "Une société qui en contrôle d'autres forme avec elles un groupe. La société qui contrôle est la société mère ; les autres sont ses filiales. Chacune tient ses propres comptes, mais ces comptes séparés ne disent pas ce que vaut l'ensemble.",
      ],
      definitions: [
        { terme: 'Société mère', definition: 'société qui en contrôle une ou plusieurs autres.' },
        { terme: 'Filiale', definition: 'société contrôlée par une autre.' },
        { terme: 'Comptes consolidés', definition: 'comptes du groupe présenté comme une seule entreprise.' },
      ],
    },
    {
      titre: '3. La consolidation',
      texte: [
        "Pour montrer le groupe comme une seule entreprise, on additionne les comptes de toutes ses sociétés, puis on élimine ce qui s'est passé entre elles.",
        "La participation de la mère dans sa filiale est remplacée par les actifs et les dettes de la filiale. Les créances et les dettes internes disparaissent, de même que les ventes d'une société du groupe à une autre.",
      ],
      exemple: ex("La mère détient toute la filiale (participation 200'000.00) et lui a prêté 50'000.00.", {
        tableau: T(['Élimination', 'Dans les comptes de la mère', 'Dans les comptes de la filiale'], ['Participation contre fonds propres', "Participation 200'000.00", "Fonds propres 200'000.00"], ['Prêt interne', "Créance 50'000.00", "Dette 50'000.00"]),
        conclusion: "Au bilan consolidé, ni la participation ni le prêt n'apparaissent : restent les actifs réels du groupe et ses dettes envers des tiers.",
      }),
      piege: "Une créance de la mère envers sa filiale disparaît du bilan consolidé : le groupe ne peut pas se devoir de l'argent à lui-même.",
      retenir: 'Consolider = réunir les comptes du groupe et éliminer les opérations internes.',
      questions: [{ question: 'Une filiale vend pour 80\'000.00 de marchandises à sa société mère, qui les a toutes revendues à des clients. Que devient cette vente dans les comptes consolidés ?', reponse: 'Elle est éliminée : seule compte la vente de la mère aux clients extérieurs au groupe.' }],
    },
  ],

  // ---------------------------------------------------------------- Société anonyme : capital et bénéfice
  'societes-ecritures': [
    {
      titre: '1. Une société qui existe par elle-même',
      texte: [
        "La société anonyme (SA) est une personne morale : c'est elle qui possède les biens et qui doit les dettes, pas ses actionnaires. Ceux-ci ne risquent que ce qu'ils ont apporté.",
        "Les comptes changent en conséquence. Il n'y a plus de compte Privé, puisqu'il n'y a plus de propriétaire unique. Le capital s'appelle Capital-actions, et le bénéfice n'est pas viré au capital : il attend, dans un compte de bénéfice reporté, que l'assemblée générale décide de son emploi.",
      ],
      definitions: [
        { terme: 'Action', definition: 'part du capital de la société.' },
        { terme: 'Valeur nominale', definition: "montant inscrit sur l'action ; la somme des valeurs nominales est le capital-actions." },
        { terme: 'Assemblée générale', definition: 'réunion des actionnaires, qui décide notamment de la répartition du bénéfice.' },
      ],
    },
    {
      titre: '2. La fondation : promettre, puis verser',
      texte: [
        "Une SA naît en deux temps. Les actionnaires s'engagent d'abord à apporter le capital : c'est la souscription. La société a alors une créance envers eux. Ensuite ils versent l'argent, ou apportent un bien : c'est la libération.",
        "Le capital peut n'être libéré qu'en partie au départ. La part qui reste à verser demeure dans le compte Actionnaires : c'est toujours une créance de la société.",
      ],
      exemple: ex("Capital-actions de 100'000.00, libéré d'abord à 60 % :", {
        tableau: T(['Étape', 'Débit', 'Crédit', 'CHF'], ['Souscription', 'Actionnaires', 'Capital-actions', "100'000.00"], ['Libération de 60 %', 'Banque', 'Actionnaires', "60'000.00"], ['Facture du notaire', 'FAO', 'Autres dettes', "2'400.00"]),
        conclusion: "Après ces écritures, le compte Actionnaires montre 40'000.00 : ce que les actionnaires doivent encore verser.",
      }),
      retenir: 'Les frais de fondation (notaire, registre du commerce) sont une charge : FAO.',
    },
    {
      titre: "3. L'augmentation du capital et l'agio",
      texte: [
        "Quand la société vaut plus que son capital, les nouvelles actions sont vendues plus cher que leur valeur nominale : les nouveaux actionnaires paient leur part des réserves déjà accumulées. Le supplément s'appelle l'agio.",
        "L'agio ne va pas au capital-actions, mais dans une réserve légale issue du capital. Il est toujours libéré entièrement.",
      ],
      exemple: ex('500 actions de 100.00 nominal, émises à 120.00 :', {
        tableau: T(['Débit', 'Crédit'], ["Actionnaires 60'000.00", "Capital-actions 50'000.00 et Réserves légales issues du capital 10'000.00"]),
        conclusion: "Capital : 500 × 100.00 = 50'000.00. Agio : 500 × 20.00 = 10'000.00.",
      }),
      piege: "Le capital-actions n'augmente que de la valeur nominale, jamais du prix d'émission.",
      questions: [{ question: "1'000 actions de 50.00 nominal émises à 65.00. Montants pour le capital et pour l'agio ?", reponse: "Capital-actions : 50'000.00. Réserves légales issues du capital : 15'000.00." }],
    },
    {
      titre: '4. La répartition du bénéfice',
      texte: [
        "À la clôture, le bénéfice de l'année rejoint le bénéfice reporté. L'assemblée générale décide ensuite de son emploi.",
        "La loi impose d'abord une part à la réserve légale issue du bénéfice : 5 % du bénéfice de l'exercice, tant que les réserves légales n'atteignent pas la moitié du capital-actions (art. 672 CO). Viennent ensuite le dividende, puis éventuellement des réserves libres. Ce qui n'est pas attribué reste reporté.",
      ],
      methode: ["Bénéfice disponible = bénéfice de l'exercice + bénéfice reporté.", "Réserve légale : 5 % du bénéfice de l'exercice.", 'Dividende décidé par l’assemblée.', 'Le solde reste en bénéfice reporté.'],
      exemple: ex("Bénéfice de l'exercice 80'000.00, bénéfice reporté 6'000.00, dividende décidé 60'000.00 :", {
        tableau: T(['', 'CHF'], ['Bénéfice disponible', "86'000.00"], ['− Réserve légale issue du bénéfice (5 %)', "4'000.00"], ['− Dividende', "60'000.00"], ['Nouveau bénéfice reporté', "22'000.00"]),
      }),
      exemples: [ex("L'écriture de répartition :", { tableau: T(['Débit', 'Crédit'], ["Bénéfice reporté 64'000.00", "Réserves légales issues du bénéfice 4'000.00 et Dividendes 60'000.00"]) })],
    },
    {
      titre: '5. Le paiement du dividende',
      texte: ["La société ne verse à l'actionnaire que 65 % du dividende. Elle retient 35 % d'impôt anticipé, qu'elle doit verser à l'Administration fédérale des contributions."],
      exemple: ex("Dividende de 60'000.00 :", { tableau: T(['Débit', 'Crédit'], ["Dividendes 60'000.00", "Banque 39'000.00 et Dettes AFC 21'000.00"]) }),
      retenir: "Dividende brut = 65 % versés à l'actionnaire + 35 % d'impôt anticipé dus à l'AFC.",
    },
  ],

  // ------------------------------------------------------------------------ Titres, intérêts et provisions
  'titres-ecritures': [
    {
      titre: '1. Acheter et vendre des titres',
      texte: [
        "Une entreprise qui a de l'argent en trop peut le placer en actions ou en obligations, en attendant d'en avoir besoin. Ces titres de placement sont un actif.",
        "Ils entrent dans les comptes pour ce qu'ils ont réellement coûté, frais de banque compris. À la vente, on enregistre ce que la banque crédite réellement, frais déduits. Les gains et les pertes ne sont pas calculés à chaque vente : ils apparaîtront à la clôture.",
      ],
      exemple: ex('Un achat, puis une vente partielle :', { tableau: T(['Opération', 'Débit', 'Crédit', 'CHF'], ['Achat, frais compris', 'Titres de placement', 'Banque', "10'150.00"], ['Vente, net de frais', 'Banque', 'Titres de placement', "4'930.00"]) }),
    },
    {
      titre: '2. Les revenus : dividendes, intérêts et impôt anticipé',
      texte: [
        "Le revenu, c'est le dividende ou l'intérêt brut. La banque n'en crédite que 65 % ; les 35 % restants seront remboursés par l'Administration fédérale des contributions : c'est une créance.",
        "Les frais que la banque facture pour conserver les titres, les droits de garde, sont une charge des titres.",
      ],
      exemple: ex('Dividende brut de 400.00, puis droits de garde de 45.00 :', { tableau: T(['Débit', 'Crédit'], ['Banque 260.00 et Créances AFC 140.00', 'Produits des titres 400.00'], ['Charges des titres 45.00', 'Banque 45.00']) }),
      piege: 'Comptabiliser seulement 260.00 de produit fait oublier la créance de 140.00.',
    },
    {
      titre: '3. À la clôture : les cours ont bougé',
      texte: [
        "À la fin de l'année, on compare la valeur des titres dans les comptes avec leur valeur d'après l'inventaire, au cours du jour. La différence est le résultat réel de toutes les opérations de l'année.",
        "Une baisse est toujours comptabilisée : c'est une charge des titres. Une hausse peut l'être, comme produit des titres.",
      ],
      exemples: [
        ex("Le compte montre 5'220.00, l'inventaire donne 4'620.00 :", { lignes: ['Moins-value de 600.00 : Charges des titres / Titres de placement, 600.00.'] }),
        ex("Le compte montre 5'220.00, l'inventaire donne 5'500.00 :", { lignes: ['Plus-value de 280.00 : Titres de placement / Produits des titres, 280.00.'] }),
      ],
      retenir: 'Charges des titres : droits de garde, pertes de cours. Produits des titres : dividendes, intérêts, gains de cours.',
    },
    {
      titre: '4. Les intérêts',
      texte: ["L'intérêt d'un emprunt est une charge financière ; l'intérêt d'un prêt accordé ou d'un compte bancaire est un produit financier. Ne les confondez pas avec les revenus des titres, qui ont leurs propres comptes."],
      exemple: ex("La banque débite l'intérêt annuel de l'emprunt, 1'200.00 :", { lignes: ["Charges financières / Banque, 1'200.00."] }),
    },
    {
      titre: '5. Les provisions',
      texte: [
        "Une provision anticipe une dépense probable, dont la cause existe déjà mais dont on ne connaît pas encore le montant exact ni la date : une révision de machine devenue nécessaire, un procès en cours, les impôts de l'année.",
        "On passe déjà la charge, par sa nature, et on inscrit en face une dette estimée au passif. Quand la facture arrivera, elle sera imputée sur la provision.",
      ],
      exemple: ex('Deux provisions à la clôture :', { tableau: T(['Opération', 'Débit', 'Crédit', 'CHF'], ['Révision de machine prévue en janvier', 'Entretien et réparations', 'Provision pour réparations', "3'000.00"], ["Impôts estimés sur le bénéfice de l'exercice", 'Impôts', 'Provision pour impôts', "8'500.00"]) }),
      retenir: 'Provision : la charge par nature au débit, la provision au crédit.',
      questions: [{ question: 'Pourquoi comptabiliser une charge avant d’avoir reçu la facture ?', reponse: 'Parce que la cause de la dépense appartient à l’exercice : son bénéfice doit la supporter, même si le montant exact n’est connu que plus tard.' }],
    },
  ],
};
