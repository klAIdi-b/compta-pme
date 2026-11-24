// Leçons approfondies du parcours « Apprendre », CFC 1re année (demande de l'enseignant du 24.11.2026 : une théorie
// plus fournie, davantage d'explications et d'exemples). Plan et profondeur inspirés du cours (structure du bilan et
// du résultat, comptabilité de l'entreprise commerciale) ; textes et exemples rédigés pour Compta PME, entreprises
// fictives. Les règles sont celles du projet (CLAUDE.md) et de la théorie validée (src/data/theorie.ts).
import type { ExempleLecon, PartieLecon } from './lecons';

const T = (entetes: string[], ...lignes: string[][]) => ({ entetes, lignes });
const ex = (situation: string, x: Omit<ExempleLecon, 'situation'> = {}): ExempleLecon => ({ situation, ...x });

export const LECONS_CFC1: Record<string, PartieLecon[]> = {
  // ------------------------------------------------------------------------------------------------ Le bilan
  bilan: [
    {
      titre: '1. À quoi sert la comptabilité ?',
      texte: [
        "Imaginez un commerce sans aucune trace écrite. Le soir, la patronne ne saurait pas combien elle a vendu, ce qu'elle doit à ses fournisseurs, ni si elle a de quoi payer le loyer à la fin du mois. La comptabilité est la mémoire chiffrée de l'entreprise : tout ce qui se compte en francs y est noté, dans l'ordre, pièce après pièce.",
        "Cette mémoire sert d'abord à l'entreprise elle-même, pour décider : puis-je engager quelqu'un, acheter une camionnette, baisser mes prix ? Elle sert aussi à l'extérieur : la banque veut savoir si elle sera remboursée avant de prêter, et l'administration fiscale calcule les impôts d'après le bénéfice.",
        "Toute la comptabilité aboutit à deux documents. Le bilan montre ce que l'entreprise possède et ce qu'elle doit, à une date précise. Le compte de résultat montre ce qu'elle a gagné ou perdu pendant une période. Cette leçon traite du premier.",
      ],
      definitions: [
        { terme: 'Comptabilité', definition: "enregistrement ordonné de toutes les opérations chiffrées d'une entreprise." },
        { terme: 'Exercice comptable', definition: "période sur laquelle on fait les comptes, le plus souvent du 1er janvier au 31 décembre." },
        { terme: 'Pièce comptable', definition: "document qui prouve une opération : facture, ticket de caisse, avis de la banque. Pas d'écriture sans pièce." },
      ],
      retenir: 'Le bilan montre une situation à une date ; le compte de résultat raconte une période.',
      questions: [
        { question: 'Citez deux personnes ou organismes extérieurs que les comptes d’une entreprise intéressent.', reponse: 'La banque (ou tout prêteur), qui veut savoir si elle sera remboursée, et l’administration fiscale, qui calcule l’impôt d’après le bénéfice. On peut aussi citer un futur associé ou un repreneur.' },
      ],
    },
    {
      titre: '2. Le bilan : une photo à une date précise',
      texte: [
        "Commencez par vous. Léa, apprentie, possède un scooter, un ordinateur et un peu d'argent sur son compte. Elle a aussi une dette : ses parents lui ont avancé de l'argent pour le scooter.",
        "Si l'on fait la liste de ce qu'elle possède et de ce qu'elle doit, à une date précise, on obtient son bilan. Le lendemain, la photo ne serait déjà plus tout à fait la même : il suffit qu'elle retire 50 francs.",
        "Une entreprise fait exactement la même chose. Avant de dresser son bilan, elle fait l'inventaire : elle compte l'argent en caisse, relève ses comptes bancaires, liste son matériel et ses marchandises, puis toutes ses dettes.",
      ],
      definitions: [{ terme: 'Inventaire', definition: "liste détaillée et chiffrée de tout ce que l'entreprise possède et de tout ce qu'elle doit, à une date donnée." }],
      exemple: ex('La situation de Léa au 31 décembre :', {
        tableau: T(
          ['Ce que Léa possède', 'CHF', "D'où vient l'argent", 'CHF'],
          ['Compte bancaire', '800.00', 'Dette envers ses parents', "1'000.00"],
          ['Ordinateur', "1'200.00", 'Sa fortune nette', "4'000.00"],
          ['Scooter', "3'000.00", '', ''],
          ['Total', "5'000.00", 'Total', "5'000.00"],
        ),
        conclusion: "Léa possède pour 5'000.00 de biens. Sur ce total, 1'000.00 viennent de ses parents : ce qui est vraiment à elle vaut 4'000.00.",
      }),
      retenir: "Le bilan est une photo à une date précise : ce que l'on possède d'un côté, comment on l'a financé de l'autre.",
    },
    {
      titre: '3. Actif et passif : deux regards sur le même argent',
      texte: [
        "La colonne de gauche s'appelle l'actif : elle dit à quoi l'argent a servi. On parle des emplois. La colonne de droite s'appelle le passif : elle dit d'où l'argent vient. On parle des sources.",
        "C'est le même argent, regardé de deux façons. Voilà pourquoi les deux totaux sont toujours égaux : chaque franc qui a servi à quelque chose est forcément venu de quelque part.",
        "Pour bien le voir, suivons la naissance d'un magasin de vélos, étape par étape.",
      ],
      exemple: ex('Mme Rochat ouvre son magasin le 1er janvier :', {
        lignes: [
          "Elle verse 64'000.00 de ses économies sur le compte de l'entreprise. Actif : Banque 64'000.00. Passif : Capital 64'000.00.",
          "La banque lui prête 25'000.00 sur cinq ans. Actif : Banque 89'000.00. Passif : Emprunt 25'000.00 et Capital 64'000.00.",
          "Elle achète le mobilier (15'000.00), une camionnette (22'000.00) et des vélos à vendre (20'000.00), puis met 2'000.00 en caisse. Il reste 30'000.00 à la banque.",
        ],
        tableau: T(
          ['Actif (emplois)', 'CHF', 'Passif (sources)', 'CHF'],
          ['Caisse', "2'000.00", 'Emprunt bancaire à long terme', "25'000.00"],
          ['Banque', "30'000.00", 'Capital', "64'000.00"],
          ['Stock de marchandises', "20'000.00", '', ''],
          ['Mobilier et installations', "15'000.00", '', ''],
          ['Véhicules', "22'000.00", '', ''],
          ["Total de l'actif", "89'000.00", 'Total du passif', "89'000.00"],
        ),
        conclusion: "À chaque étape, le total de gauche est resté égal au total de droite. Les achats de la troisième étape n'ont rien changé au passif : l'argent a seulement changé de forme.",
      }),
      piege: "« Passif » ne veut pas dire « négatif ». Le capital figure au passif parce que c'est une source de fonds : l'argent apporté par la propriétaire.",
      retenir: "Total de l'actif = total du passif, toujours.",
      questions: [
        { question: 'Un ami vous dit : « Mon entreprise a 50\'000.00 d’actifs et 60\'000.00 de passifs. » Que lui répondez-vous ?', reponse: 'C’est impossible : les deux totaux sont toujours égaux. Il a oublié un actif, compté une dette à double, ou confondu passif et dettes.' },
        { question: 'Pourquoi le capital apporté par le propriétaire est-il au passif ?', reponse: 'Parce que le passif répond à la question « d’où vient l’argent ? ». Le capital est une source de fonds, au même titre qu’un emprunt ; la différence est qu’il vient du propriétaire.' },
      ],
    },
    {
      titre: "4. Ranger l'actif : ce qui tourne et ce qui reste",
      texte: [
        "On ne présente pas les postes en vrac : on les range en groupes, appelés masses. L'actif en compte deux.",
        "Les actifs circulants changent sans cesse : l'argent en caisse et en banque (les liquidités), les factures que les clients doivent encore payer (les créances), les marchandises à vendre (le stock). Tout cela se transforme en argent en quelques jours ou quelques mois.",
        "Les actifs immobilisés servent à l'entreprise pendant des années : le mobilier, les machines, l'informatique, les véhicules, un immeuble. On ne les achète pas pour les revendre, mais pour travailler avec.",
        "À l'intérieur des actifs circulants, on suit l'ordre de liquidité : d'abord ce qui est déjà de l'argent, ensuite ce qui le deviendra le plus vite.",
      ],
      definitions: [
        { terme: 'Liquidités', definition: 'argent immédiatement disponible : caisse, poste, banque.' },
        { terme: 'Créance', definition: "somme qu'un client nous doit encore." },
        { terme: 'Immobilisation', definition: "bien durable utilisé par l'entreprise pendant plus d'un an." },
      ],
      exemple: ex('Dans le magasin de vélos :', {
        lignes: [
          'Les vélos à vendre sont du stock : un actif circulant. Ils sont là pour être vendus.',
          'La camionnette de livraison est un véhicule : un actif immobilisé. Elle est là pour servir.',
          "L'ordinateur de la caisse est de l'infrastructure informatique : un actif immobilisé.",
        ],
      }),
      piege: "Le même objet peut changer de masse selon l'entreprise : une voiture est du stock chez un garagiste qui la revend, un actif immobilisé chez un boulanger qui livre son pain.",
      questions: [
        { question: 'Classez : une créance de 2\'300.00 sur un client, une machine à café pour la salle de pause, 400.00 en caisse.', reponse: 'Créance : actif circulant. Machine à café : actif immobilisé (elle sert durablement). Caisse : actif circulant, et même le plus liquide de tous.' },
      ],
    },
    {
      titre: "5. Ranger le passif : l'argent des autres et l'argent du propriétaire",
      texte: [
        "Le passif compte trois masses. Les deux premières sont l'argent des autres, qu'il faudra rendre : ce sont les capitaux étrangers, autrement dit les dettes.",
        "Les capitaux étrangers à court terme sont à payer dans l'année : les factures des fournisseurs, une facture de garage, un découvert bancaire. Les capitaux étrangers à long terme sont à rembourser plus tard : un emprunt sur cinq ans, une hypothèque.",
        "La troisième masse, ce sont les capitaux propres : l'argent du propriétaire. L'entreprise ne doit le rendre à personne d'autre.",
        "On range donc le passif d'après le délai de remboursement : ce qui presse le plus en haut, ce qui ne sera jamais réclamé par un tiers en bas.",
      ],
      exemple: ex('Le bilan du magasin de vélos après quelques semaines, rangé en cinq masses :', {
        tableau: T(
          ['Actif', 'CHF', 'Passif', 'CHF'],
          ['Actifs circulants', '', 'Capitaux étrangers à court terme', ''],
          ['Caisse', "2'000.00", 'Dettes fournisseurs', "3'000.00"],
          ['Banque', "30'000.00", 'Autres dettes', "1'000.00"],
          ['Créances clients', "4'000.00", 'Capitaux étrangers à long terme', ''],
          ['Stock de marchandises', "20'000.00", 'Emprunt bancaire à long terme', "25'000.00"],
          ['Actifs immobilisés', '', 'Capitaux propres', ''],
          ['Mobilier et installations', "15'000.00", 'Capital', "64'000.00"],
          ['Véhicules', "22'000.00", '', ''],
          ["Total de l'actif", "93'000.00", 'Total du passif', "93'000.00"],
        ),
        conclusion: "Actifs circulants 56'000.00, actifs immobilisés 37'000.00. Dettes à court terme 4'000.00, à long terme 25'000.00, capitaux propres 64'000.00.",
      }),
      retenir: 'Cinq masses : actifs circulants, actifs immobilisés ; capitaux étrangers à court terme, à long terme, capitaux propres.',
    },
    {
      titre: '6. La fortune nette, et le découvert',
      texte: [
        "Le capital n'est pas un chiffre que l'on choisit : il se calcule. C'est ce qui resterait au propriétaire s'il vendait tout et remboursait toutes ses dettes. On l'appelle aussi la fortune nette.",
        "Il arrive qu'une entreprise doive plus qu'elle ne possède. Il n'y a alors plus de fortune nette, mais un découvert. Pour que le bilan reste équilibré, le découvert s'inscrit du côté de l'actif.",
      ],
      exemples: [
        ex('Le magasin de vélos :', { lignes: ["Total de l'actif : 93'000.00. Total des dettes : 4'000.00 + 25'000.00 = 29'000.00.", "Fortune nette : 93'000.00 − 29'000.00 = 64'000.00. C'est bien le capital."] }),
        ex("Un atelier en difficulté : il possède 24'100.00 et doit 30'000.00.", {
          tableau: T(['Actif', 'CHF', 'Passif', 'CHF'], ['Caisse et banque', "1'100.00", 'Autres dettes', "5'000.00"], ['Machines et appareils', "23'000.00", 'Emprunt bancaire à long terme', "25'000.00"], ['Découvert', "5'900.00", '', ''], ['Total', "30'000.00", 'Total', "30'000.00"]),
          conclusion: "Les dettes dépassent les biens de 5'900.00 : même en vendant tout, le propriétaire ne pourrait pas tout rembourser.",
        }),
      ],
      retenir: 'Fortune nette = total des actifs − total des dettes. Si le résultat est négatif, c’est un découvert, inscrit à l’actif.',
      questions: [{ question: 'Une entreprise possède 48\'000.00 d’actifs. Elle doit 6\'000.00 à ses fournisseurs et 20\'000.00 à la banque. Quel est son capital ?', reponse: '48\'000.00 − 26\'000.00 = 22\'000.00.' }],
    },
    {
      titre: '7. Chaque opération fait bouger le bilan, sans jamais le déséquilibrer',
      texte: [
        "Le bilan n'est pas figé : chaque achat, chaque paiement le modifie. Mais une opération touche toujours au moins deux postes, et l'égalité tient toujours.",
        "Quand une opération ne concerne que des postes du bilan, il n'y a que quatre cas possibles. Reprenons le bilan du magasin, dont le total est de 93'000.00.",
      ],
      exemple: ex('Les quatre variations, avec le nouveau total du bilan :', {
        tableau: T(
          ['Opération', 'Effet', 'Nouveau total'],
          ["Achat d'un ordinateur à crédit, 2'000.00", 'Actif + et passif +', "95'000.00"],
          ["Paiement de cette facture par la banque", 'Actif − et passif −', "93'000.00"],
          ["Retrait de 500.00 à la banque pour la caisse", 'Actif + et actif −', "93'000.00"],
          ["La propriétaire rembourse 5'000.00 de l'emprunt avec ses économies", 'Passif − et passif +', "93'000.00"],
        ),
        conclusion: "Dans les deux premiers cas le total change, mais des deux côtés à la fois. Dans les deux derniers, on parle de permutation : un seul côté est touché, et son total ne bouge pas.",
      }),
      piege: "Acheter à crédit ne rend pas l'entreprise plus riche : elle possède un bien de plus, mais elle a une dette de plus, du même montant. Son capital n'a pas changé.",
      retenir: "Si un seul poste bouge, c'est que vous avez oublié la moitié de l'opération.",
      questions: [
        { question: 'Un client paie par virement une facture de 1\'200.00 qu’il nous devait. Quels postes bougent, et le total du bilan change-t-il ?', reponse: 'La banque augmente de 1\'200.00, les créances clients diminuent de 1\'200.00. C’est une permutation à l’actif : le total ne change pas.' },
        { question: 'L’entreprise emprunte 10\'000.00 à la banque. Effet sur le bilan ?', reponse: 'Actif + (banque) et passif + (emprunt) : le total augmente de 10\'000.00.' },
      ],
    },
  ],

  // ------------------------------------------------------------------------------------ Débit et crédit
  comptes: [
    {
      titre: '1. Pourquoi des comptes ?',
      texte: [
        "On pourrait refaire le bilan après chaque opération, mais ce serait interminable : un magasin en passe des dizaines par jour. On ouvre donc un compte par poste du bilan : un pour la caisse, un pour la banque, un pour les dettes envers les fournisseurs… Chaque compte suit un seul poste, opération après opération.",
        "Pensez à votre relevé bancaire : une colonne pour ce qui entre, une colonne pour ce qui sort, et un solde. Un compte, c'est cela.",
        "La liste de tous les comptes qu'une entreprise utilise s'appelle son plan comptable. Chaque compte y porte un nom et un numéro. Le premier chiffre du numéro indique la famille : 1 pour les actifs, 2 pour les passifs. En classe, vous travaillez avec les noms ; les numéros servent surtout aux logiciels.",
      ],
      definitions: [
        { terme: 'Compte', definition: "tableau qui enregistre les augmentations et les diminutions d'un seul poste." },
        { terme: 'Plan comptable', definition: "liste ordonnée des comptes d'une entreprise." },
      ],
      retenir: "Un compte enregistre les augmentations et les diminutions d'un seul poste.",
    },
    {
      titre: '2. Le compte en T : gauche et droite, rien de plus',
      texte: [
        "On dessine le compte comme un T. Le côté gauche s'appelle le débit, le côté droit le crédit. Ce sont seulement des noms pour « gauche » et « droite ».",
        "Au début de l'année, on inscrit dans chaque compte ce qu'il contenait à la fin de l'année précédente : c'est le solde initial (SI). Il se place du côté où le poste figure au bilan : à gauche pour un actif, à droite pour un passif.",
      ],
      exemple: ex("Le compte Caisse d'un magasin :", {
        tableau: T(['Débit (gauche)', 'CHF', 'Crédit (droite)', 'CHF'], ['Solde initial', "2'000.00", 'Paiement de fournitures', '150.00'], ['Ventes au comptant', '900.00', 'Solde final', "2'750.00"], ['Total', "2'900.00", 'Total', "2'900.00"]),
      }),
      piege: "Dans la vie courante, « débiter » veut dire retirer de l'argent et « créditer » en ajouter, parce que la banque parle de son propre point de vue. En comptabilité, oubliez ce sens : débit = gauche, crédit = droite.",
    },
    {
      titre: '3. De quel côté le compte augmente-t-il ?',
      texte: [
        "Un compte augmente du côté où il se trouve dans le bilan. La caisse est à l'actif, donc à gauche : elle augmente à gauche, au débit. Une dette est au passif, donc à droite : elle augmente à droite, au crédit.",
        "Et chaque compte diminue de l'autre côté. Il n'y a rien d'autre à apprendre par cœur : si vous savez où le poste se trouve dans le bilan, vous savez de quel côté il augmente.",
      ],
      exemple: ex('La règle en un tableau :', {
        tableau: T(['Compte', 'Solde initial', 'Augmente', 'Diminue'], ['Actif (caisse, banque, véhicules…)', 'au débit', 'au débit', 'au crédit'], ['Passif (dettes, emprunt, capital)', 'au crédit', 'au crédit', 'au débit']),
      }),
      retenir: 'Actif : + au débit. Passif : + au crédit. Le compte augmente de son côté du bilan.',
      questions: [
        { question: 'Le compte Emprunt bancaire à long terme diminue. De quel côté écrit-on ?', reponse: 'Au débit : c’est un passif, il augmente au crédit et diminue au débit.' },
        { question: 'Le compte Stock de marchandises a-t-il son solde initial au débit ou au crédit ?', reponse: 'Au débit : c’est un actif.' },
      ],
    },
    {
      titre: "4. Trois questions pour trouver n'importe quelle écriture",
      texte: [
        "Devant une opération, ne cherchez pas l'écriture tout de suite. Posez-vous trois questions, dans l'ordre.",
        "1. Quels comptes sont touchés ? 2. De quel type est chacun : actif ou passif ? 3. Chacun augmente-t-il ou diminue-t-il ?",
        "Avec ces trois réponses, le débit et le crédit se placent tout seuls. Une écriture a toujours un débit et un crédit du même montant : c'est ce qu'on appelle la partie double.",
      ],
      methode: ['Lire l’opération jusqu’au bout.', 'Nommer les deux comptes touchés.', 'Dire pour chacun : actif ou passif ?', 'Dire pour chacun : augmente ou diminue ?', 'Placer le débit et le crédit, puis vérifier que les deux montants sont égaux.'],
      exemples: [
        ex("Mme Favre achète un scooter de 5'000.00, payable à 30 jours.", {
          lignes: ['Comptes touchés : Véhicules et Autres dettes.', "Véhicules est un compte d'actif, il augmente : débit.", 'Autres dettes est un compte de passif, il augmente : crédit.', "Écriture : Véhicules / Autres dettes, 5'000.00."],
        }),
        ex("L'entreprise rembourse 5'000.00 de son emprunt par la banque.", {
          lignes: ['Comptes touchés : Emprunt bancaire à long terme et Banque.', "L'emprunt est un passif, il diminue : débit.", 'La banque est un actif, elle diminue : crédit.', "Écriture : Emprunt bancaire à long terme / Banque, 5'000.00."],
        }),
        ex("On retire 1'000.00 à la banque pour alimenter la caisse.", {
          lignes: ['Comptes touchés : Caisse et Banque, deux actifs.', 'La caisse augmente : débit. La banque diminue : crédit.', "Écriture : Caisse / Banque, 1'000.00."],
        }),
      ],
      piege: "Dans le premier exemple, rien n'a été payé : la banque n'est pas touchée. Lisez toujours l'opération jusqu'au bout avant de choisir les comptes.",
      retenir: 'Une écriture a toujours un débit et un crédit du même montant : c’est la partie double.',
    },
    {
      titre: '5. Le journal : tout noter, dans l’ordre',
      texte: [
        "Les écritures ne s'inscrivent pas d'abord dans les comptes, mais dans le journal : un grand registre où l'on note chaque opération à la suite, par ordre de date. C'est le carnet de bord de l'entreprise.",
        "Chaque ligne du journal donne la date, le numéro de la pièce, un libellé qui dit de quoi il s'agit, le compte débité, le compte crédité et le montant. On cite toujours le compte débité en premier.",
      ],
      exemple: ex('Quatre opérations de janvier au journal :', {
        tableau: T(
          ['Date', 'Pièce', 'Libellé', 'Débit', 'Crédit', 'CHF'],
          ['05.01', '1', "Un client paie sa facture", 'Banque', 'Créances clients', "4'000.00"],
          ['12.01', '2', "Remboursement de l'emprunt", 'Emprunt bancaire à long terme', 'Banque', "5'000.00"],
          ['18.01', '3', 'Retrait pour la caisse', 'Caisse', 'Banque', "1'000.00"],
          ['25.01', '4', 'Paiement du fournisseur', 'Dettes fournisseurs', 'Banque', "3'000.00"],
        ),
      }),
      definitions: [{ terme: 'Libellé', definition: "courte description de l'opération, écrite à côté de l'écriture." }],
      retenir: 'Au journal : une ligne par opération, dans l’ordre des dates, le compte débité d’abord.',
    },
    {
      titre: '6. Du journal aux comptes : le grand livre',
      texte: [
        "Le journal dit ce qui s'est passé, jour après jour. Mais pour savoir combien il reste à la banque, il faudrait relire toutes les lignes. On reporte donc chaque écriture dans les deux comptes qu'elle touche. L'ensemble des comptes forme le grand livre.",
        "Le montant inscrit au débit dans le journal va du côté gauche du compte débité ; le même montant va du côté droit du compte crédité.",
      ],
      exemple: ex("Le compte Banque après les quatre opérations ci-dessus (solde initial 30'000.00) :", {
        tableau: T(
          ['Au débit', 'CHF', 'Au crédit', 'CHF'],
          ['Solde initial', "30'000.00", "Pièce 2, remboursement de l'emprunt", "5'000.00"],
          ['Pièce 1, un client paie', "4'000.00", 'Pièce 3, retrait pour la caisse', "1'000.00"],
          ['', '', 'Pièce 4, paiement du fournisseur', "3'000.00"],
          ['', '', 'Solde final', "25'000.00"],
          ['Total', "34'000.00", 'Total', "34'000.00"],
        ),
        conclusion: "Le journal et le grand livre contiennent les mêmes écritures, classées autrement : par date dans l'un, par compte dans l'autre.",
      }),
    },
    {
      titre: '7. Le solde : où en est le compte ?',
      texte: [
        "Le solde est la différence entre les deux côtés. On l'inscrit du côté le plus faible, pour que les deux totaux soient égaux : c'est le solde final (SF).",
        "Un compte d'actif a normalement un solde débiteur, parce que le débit est le plus fort. Un compte de passif a un solde créditeur.",
        "À la fin de l'année, on calcule le solde de tous les comptes. En les réunissant, on obtient le bilan final. Et au 1er janvier, chaque solde final devient le solde initial de la nouvelle année.",
      ],
      methode: ['Additionner le côté débit.', 'Additionner le côté crédit.', 'Calculer la différence : c’est le solde.', 'L’inscrire du côté le plus faible, sous le nom de solde final.', 'Vérifier que les deux totaux sont égaux.'],
      exemple: ex('Dans le compte Banque ci-dessus :', { lignes: ["Total du débit : 30'000.00 + 4'000.00 = 34'000.00.", "Total du crédit : 5'000.00 + 1'000.00 + 3'000.00 = 9'000.00.", "Solde final : 34'000.00 − 9'000.00 = 25'000.00, inscrit au crédit pour équilibrer."] }),
      retenir: "Le solde final d'une année devient le solde initial de la suivante.",
      questions: [{ question: 'Le compte Dettes fournisseurs montre 9\'000.00 au crédit (solde initial et factures) et 6\'500.00 au débit (paiements). Quel est son solde, et de quel côté l’inscrit-on ?', reponse: 'Solde : 2\'500.00. Le crédit est le plus fort : le solde est créditeur, et on l’inscrit au débit pour équilibrer.' }],
    },
    {
      titre: '8. Quand une opération touche plus de deux comptes',
      texte: [
        "Certaines opérations concernent trois comptes ou plus. On passe alors une écriture composée : plusieurs lignes, mais toujours le même total au débit et au crédit.",
      ],
      exemple: ex("Achat d'une camionnette de 18'000.00 : 5'000.00 payés tout de suite par la banque, le reste à 60 jours.", {
        tableau: T(['Débit', 'Crédit'], ["Véhicules 18'000.00", "Banque 5'000.00 et Autres dettes 13'000.00"]),
        conclusion: "Total du débit : 18'000.00. Total du crédit : 5'000.00 + 13'000.00 = 18'000.00.",
      }),
      retenir: 'Autant de lignes qu’il faut, mais total des débits = total des crédits.',
    },
    {
      titre: '9. Corriger une erreur : l’extourne',
      texte: [
        "En comptabilité, on n'efface pas une écriture : on la corrige par une nouvelle écriture, pour que tout reste traçable. L'extourne est l'écriture inverse de l'écriture fausse : elle l'annule. On passe ensuite l'écriture juste.",
      ],
      exemple: ex("Une photocopieuse de 2'400.00 payée par la banque a été inscrite par erreur dans le mobilier.", {
        tableau: T(['Étape', 'Débit', 'Crédit', 'CHF'], ['Écriture fausse', 'Mobilier et installations', 'Banque', "2'400.00"], ['Extourne', 'Banque', 'Mobilier et installations', "2'400.00"], ['Écriture juste', 'Machines de bureau', 'Banque', "2'400.00"]),
      }),
      retenir: 'Extourner = passer l’écriture inverse. L’écriture fausse reste visible, mais son effet est annulé.',
    },
  ],

  // ----------------------------------------------------------------------------------- Charges et produits
  'charges-produits': [
    {
      titre: '1. Gagner et dépenser : le résultat',
      texte: [
        "Le bilan montre ce que l'entreprise possède. Mais comment sait-on si elle gagne de l'argent ? Deux bilans de suite donneraient la réponse, sans dire pourquoi. Il faut compter, tout au long de l'année, ce que son activité lui rapporte et ce qu'elle lui coûte.",
        "Ce qu'elle rapporte s'appelle les produits : les ventes, les honoraires, les prestations facturées. Ce qu'elle coûte s'appelle les charges : le loyer, les salaires, l'électricité, l'assurance, les marchandises achetées.",
        "La différence entre les deux est le résultat de l'exercice : un bénéfice si les produits l'emportent, une perte dans le cas contraire.",
      ],
      definitions: [
        { terme: 'Produit', definition: "ce que l'activité rapporte à l'entreprise pendant l'exercice." },
        { terme: 'Charge', definition: "ce que l'activité consomme pendant l'exercice pour fonctionner." },
        { terme: 'Résultat', definition: 'différence entre les produits et les charges : bénéfice ou perte.' },
      ],
      exemple: ex("L'année d'un magasin de vélos :", { tableau: T(['', 'CHF'], ['Total des produits', "18'750.00"], ['Total des charges', "15'220.00"], ['Bénéfice', "3'530.00"]) }),
      retenir: 'Produits − charges = résultat. Positif : un bénéfice. Négatif : une perte.',
    },
    {
      titre: '2. De quel côté écrire, et pourquoi',
      texte: [
        "Un produit enrichit l'entreprise : il augmente ce qui revient au propriétaire. Il se comporte donc comme le capital, qui est un passif : il augmente au crédit.",
        "Une charge fait l'inverse : elle diminue ce qui revient au propriétaire. Elle augmente donc de l'autre côté, au débit.",
        "L'autre moitié de l'écriture est presque toujours un compte que vous connaissez déjà : la caisse, la banque, une créance ou une dette.",
      ],
      exemple: ex('La règle complète, pour les quatre types de comptes :', {
        tableau: T(['Compte', 'Augmente', 'Diminue'], ['Actif', 'au débit', 'au crédit'], ['Passif', 'au crédit', 'au débit'], ['Charge', 'au débit', 'au crédit'], ['Produit', 'au crédit', 'au débit']),
      }),
      retenir: 'Charge : + au débit. Produit : + au crédit.',
      questions: [{ question: 'Pourquoi un produit augmente-t-il au crédit, comme une dette, alors que c’est une bonne nouvelle ?', reponse: 'Parce que le crédit n’est pas « mauvais » : c’est le côté droit. Un produit augmente ce qui revient au propriétaire, donc les capitaux propres, qui sont au passif et augmentent au crédit.' }],
    },
    {
      titre: '3. Les écritures de tous les jours',
      texte: [
        "Reprenez les trois questions : quels comptes, de quel type, augmente ou diminue ? Avec les charges et les produits, la réponse à la troisième est presque toujours « augmente ».",
      ],
      exemple: ex('Six opérations courantes :', {
        tableau: T(
          ['Opération', 'Débit', 'Crédit', 'CHF'],
          ['Loyer du mois payé par la banque', 'Loyers', 'Banque', "1'850.00"],
          ['Salaires virés par la banque', 'Salaires', 'Banque', "4'200.00"],
          ["Facture d'électricité reçue, à payer", 'Électricité, gaz', 'Autres dettes', '310.00'],
          ['Plein de carburant payé en espèces', 'Frais de véhicules', 'Caisse', '95.00'],
          ['Ventes au comptant de la journée', 'Caisse', 'Ventes de marchandises', '900.00'],
          ['Vente à crédit à un club', 'Créances clients', 'Ventes de marchandises', "6'400.00"],
        ),
        conclusion: "Dans chaque ligne, un compte de charge ou de produit rencontre un compte du bilan.",
      }),
      methode: ['Y a-t-il une charge ou un produit ? Lequel ?', 'Charge au débit, produit au crédit.', 'Quel compte du bilan est en face : caisse, banque, créance ou dette ?'],
    },
    {
      titre: '4. Charge ou investissement ?',
      texte: [
        "Toute dépense n'est pas une charge. Une charge est consommée pendant l'année : l'essence est brûlée, le loyer est passé. Un investissement reste : la camionnette sera encore là dans cinq ans, et elle figure au bilan.",
        "La question à se poser : à la fin de l'année, est-ce qu'il en reste quelque chose qui sert encore à l'entreprise ?",
      ],
      exemple: ex('Des dépenses qui se ressemblent, et qui ne se comptabilisent pas de la même façon :', {
        tableau: T(
          ['Dépense', 'Nature', 'Compte'],
          ["Achat d'une camionnette", 'Investissement', 'Véhicules'],
          ['Plein de carburant, service au garage', 'Charge', 'Frais de véhicules'],
          ["Achat d'un ordinateur", 'Investissement', 'Infrastructure informatique'],
          ["Cartouches d'encre, papier", 'Charge', "Frais d'administration"],
          ["Achat d'une vitrine réfrigérée", 'Investissement', 'Mobilier et installations'],
          ['Réparation de cette vitrine', 'Charge', 'Entretien et réparations'],
        ),
      }),
      piege: "Passer un véhicule ou un ordinateur en charge fait croire que l'entreprise a perdu cet argent, alors qu'elle possède un bien. Le bénéfice de l'année serait faux, et le bilan aussi.",
      questions: [{ question: 'L’entreprise achète une armoire pour 1\'400.00 et paie 180.00 de frais de nettoyage des locaux. Charge ou investissement ?', reponse: 'L’armoire servira des années : investissement (Mobilier et installations). Le nettoyage est consommé tout de suite : charge.' }],
    },
    {
      titre: '5. Ce qui ne change pas le résultat',
      texte: [
        "Une opération qui ne touche que des comptes du bilan ne modifie pas le bénéfice. Retirer de l'argent à la banque pour la caisse, acheter un ordinateur, encaisser la facture d'un client, rembourser un emprunt : l'entreprise n'est ni plus riche ni plus pauvre.",
        "C'est un bon réflexe de contrôle : si votre écriture ne contient ni charge ni produit, le résultat ne bouge pas.",
      ],
      piege: "Rembourser un emprunt n'est pas une charge : on rend de l'argent qu'on devait. Encaisser une créance n'est pas un produit : la vente a été comptée le jour de la facture.",
      retenir: 'Pas de compte de charge ni de produit dans une écriture : le résultat ne bouge pas.',
    },
    {
      titre: '6. Le compte de résultat',
      texte: [
        "À la fin de l'année, on réunit tous les comptes de charges et de produits dans un tableau : le compte de résultat. Les charges sont à gauche, les produits à droite, comme dans les comptes eux-mêmes.",
        "Le résultat s'inscrit du côté le plus faible, pour équilibrer : un bénéfice apparaît donc du côté des charges, une perte du côté des produits.",
      ],
      exemple: ex('Le compte de résultat du magasin de vélos :', {
        tableau: T(
          ['Charges', 'CHF', 'Produits', 'CHF'],
          ['Achats de marchandises', "7'400.00", 'Ventes de marchandises', "18'750.00"],
          ['Salaires', "4'200.00", '', ''],
          ['Loyers', "2'400.00", '', ''],
          ['Assurances', '520.00', '', ''],
          ['Publicité', '700.00', '', ''],
          ["Bénéfice de l'exercice", "3'530.00", '', ''],
          ['Total', "18'750.00", 'Total', "18'750.00"],
        ),
      }),
      retenir: 'Le bilan est une photo ; le compte de résultat est le film de l’année.',
    },
    {
      titre: '7. Où va le bénéfice ?',
      texte: [
        "Un bénéfice appartient au propriétaire : il augmente ses capitaux propres. C'est le lien entre les deux documents : le résultat du compte de résultat se retrouve dans le bilan.",
        "Avant le bouclement, le bénéfice de l'exercice apparaît au bilan parmi les capitaux propres. Une perte, elle, s'inscrit du côté de l'actif, sur une ligne à part.",
        "Les charges et les produits ne servent qu'à mesurer une année. Au 1er janvier suivant, leurs comptes repartent de zéro, alors que les comptes du bilan reprennent leur solde.",
      ],
      retenir: 'Les comptes du bilan se reportent d’une année à l’autre ; les comptes de charges et de produits recommencent à zéro.',
      questions: [{ question: 'En cours d’année, une entreprise a 80\'000.00 d’actifs, 30\'000.00 de dettes et 45\'000.00 de capital. Que manque-t-il au passif ?', reponse: 'Il manque 5\'000.00 : c’est le bénéfice de l’exercice, qui figure dans les capitaux propres tant que le bouclement n’est pas fait.' }],
    },
  ],

  // --------------------------------------------------------------------------- Factures, dettes et créances
  factures: [
    {
      titre: '1. Comptant ou à crédit ?',
      texte: [
        "Au comptant, tout se passe en une fois : la marchandise contre l'argent. À crédit, le vendeur livre aujourd'hui et accepte d'être payé plus tard, en général à 30 jours. Entre entreprises, c'est la règle.",
        "Il y a alors deux moments, et donc deux écritures : d'abord la facture, plus tard le paiement. Entre les deux, quelqu'un doit de l'argent à quelqu'un. C'est cela qu'il faut enregistrer.",
      ],
      definitions: [
        { terme: 'Facture', definition: 'document par lequel le vendeur réclame le prix de ce qu’il a livré.' },
        { terme: 'Échéance', definition: 'date à laquelle la facture doit être payée.' },
        { terme: 'Créance', definition: 'ce qu’un client nous doit. Nous sommes son créancier.' },
        { terme: 'Dette', definition: 'ce que nous devons à quelqu’un. Nous sommes son débiteur.' },
      ],
      retenir: 'À crédit : une écriture à la facture, une autre au paiement.',
    },
    {
      titre: '2. Quand nous vendons à crédit',
      texte: [
        "Le client a reçu la marchandise mais n'a pas encore payé. La vente est faite : c'est un produit, et il compte pour l'année en cours même si l'argent n'arrive que plus tard. En face, le client nous doit de l'argent : c'est une créance, un actif.",
        "Quand il paie, la créance disparaît et l'argent arrive. La vente, elle, est déjà comptée.",
      ],
      exemple: ex("Vente de vélos à un club le 3 mars, 6'400.00, payable à 30 jours. Le club paie le 1er avril.", {
        tableau: T(['Date', 'Moment', 'Débit', 'Crédit', 'CHF'], ['03.03', 'La facture', 'Créances clients', 'Ventes de marchandises', "6'400.00"], ['01.04', 'Le paiement', 'Banque', 'Créances clients', "6'400.00"]),
        conclusion: "Entre le 3 mars et le 1er avril, le compte Créances clients montre 6'400.00 : c'est ce qui permet de savoir qui n'a pas encore payé.",
      }),
      piege: "Au paiement, n'écrivez pas une deuxième fois « Ventes » : la vente serait comptée à double et le bénéfice gonflé de 6'400.00.",
    },
    {
      titre: '3. Quand nous achetons à crédit : deux comptes de dettes',
      texte: [
        "Nous avons reçu quelque chose et nous devons de l'argent. Mais pour quoi ? La règle du cours distingue deux cas, et le choix du compte en dépend.",
        "Si ce sont des marchandises achetées pour être revendues, la dette va dans Dettes fournisseurs. Pour tout le reste, un véhicule, du mobilier, un ordinateur, une annonce publicitaire, une réparation, la dette va dans Autres dettes.",
        "L'intérêt de cette séparation : le compte Dettes fournisseurs montre à lui seul ce que l'entreprise doit pour ses marchandises, le cœur de son commerce.",
      ],
      exemple: ex('Cinq factures reçues par le magasin de vélos :', {
        tableau: T(
          ['Facture', 'Débit', 'Crédit', 'CHF'],
          ['Des vélos à revendre', 'Achats de marchandises', 'Dettes fournisseurs', "4'800.00"],
          ["Une camionnette d'occasion", 'Véhicules', 'Autres dettes', "12'500.00"],
          ['Une annonce dans le journal', 'Publicité', 'Autres dettes', '650.00'],
          ['La réparation de la vitrine', 'Entretien et réparations', 'Autres dettes', '280.00'],
          ['Des casques à revendre', 'Achats de marchandises', 'Dettes fournisseurs', '900.00'],
        ),
      }),
      methode: ['Qu’avons-nous reçu : des marchandises à revendre, ou autre chose ?', 'Marchandises à revendre : Achats de marchandises / Dettes fournisseurs.', 'Autre chose : le compte de l’investissement ou de la charge / Autres dettes.'],
      retenir: 'Marchandises à revendre : Dettes fournisseurs. Tout le reste : Autres dettes.',
      questions: [
        { question: 'Le magasin reçoit la facture d’un nouveau présentoir à vélos, 1\'900.00, payable à 30 jours. Quelle écriture ?', reponse: 'Le présentoir sert au magasin, il ne sera pas revendu : Mobilier et installations / Autres dettes, 1\'900.00.' },
        { question: 'Et pour la facture de 60 chambres à air destinées à la vente, 480.00 ?', reponse: 'Ce sont des marchandises à revendre : Achats de marchandises / Dettes fournisseurs, 480.00.' },
      ],
    },
    {
      titre: '4. Quand nous payons',
      texte: [
        "Le paiement éteint la dette : elle diminue, au débit. L'argent sort de la banque, au crédit. La charge ou l'achat a déjà été compté à la réception de la facture.",
        "On peut aussi payer en plusieurs fois. Chaque versement diminue la dette du montant versé ; le reste demeure dans le compte.",
      ],
      exemples: [
        ex('Paiement de la facture des vélos :', { lignes: ["Dettes fournisseurs / Banque, 4'800.00."] }),
        ex("La camionnette de 12'500.00 est payée en deux fois : 5'000.00 puis 7'500.00.", {
          tableau: T(['Au débit', 'CHF', 'Au crédit', 'CHF'], ['Premier versement', "5'000.00", 'Facture de la camionnette', "12'500.00"], ['Second versement', "7'500.00", '', ''], ['Total', "12'500.00", 'Total', "12'500.00"]),
          conclusion: "C'est le compte Autres dettes. Après le premier versement, il reste 7'500.00 à payer ; après le second, la dette est éteinte.",
        }),
      ],
      piege: "Avant d'écrire, demandez-vous : la facture a-t-elle déjà été comptabilisée ? Si oui, le paiement ne touche que la dette et la banque.",
    },
    {
      titre: '5. Reconnaître la situation dans un énoncé',
      texte: [
        "Les énoncés et les pièces ne disent pas « passez l'écriture de la facture ». Ils décrivent une situation, et quelques mots suffisent à savoir où l'on en est.",
      ],
      exemple: ex('Les mots qui décident :', {
        tableau: T(
          ['Dans l’énoncé', 'Ce que cela signifie'],
          ['« Nous recevons la facture de… », « à 30 jours »', "Rien n'est payé : une dette apparaît."],
          ['« Nous envoyons la facture à… »', 'Une créance apparaît, et la vente est comptée.'],
          ['« Nous payons la facture de… » (déjà comptabilisée)', 'La dette diminue, la banque aussi.'],
          ['« Le client règle sa facture »', 'La créance diminue, la banque augmente.'],
          ['« Au comptant », « en espèces »', 'Pas de dette ni de créance : la caisse ou la banque directement.'],
        ),
      }),
      retenir: 'Facture reçue ou envoyée : une dette ou une créance. Paiement : elle s’éteint.',
    },
  ],

  // ------------------------------------------------------------------------------------- Le compte privé
  prive: [
    {
      titre: '1. Deux poches à ne pas confondre',
      texte: [
        "Dans une raison individuelle, le propriétaire et son entreprise ne font qu'un aux yeux de la loi : il répond des dettes de l'entreprise sur ses biens personnels. En comptabilité, pourtant, on sépare strictement les deux poches. L'argent de l'entreprise n'est pas l'argent de poche du propriétaire.",
        "Pourquoi cette séparation ? Parce que le compte de résultat doit montrer ce que le commerce gagne. Si les courses de la famille y figuraient, personne ne saurait plus si le magasin est rentable.",
        "Le compte Privé enregistre tout ce qui passe d'une poche à l'autre pendant l'année.",
      ],
      definitions: [
        { terme: 'Raison individuelle', definition: 'entreprise qui appartient à une seule personne, responsable de ses dettes.' },
        { terme: 'Prélèvement privé', definition: 'ce que le propriétaire prend dans l’entreprise pour ses besoins personnels.' },
      ],
      retenir: "Le compte Privé suit ce que le propriétaire prend dans l'entreprise pour lui-même.",
    },
    {
      titre: '2. Ce que le propriétaire prend',
      texte: [
        "Il peut prendre de l'argent, faire payer une facture personnelle par l'entreprise, ou emporter des marchandises. Dans les trois cas, le compte Privé est débité.",
      ],
      exemple: ex('Trois prélèvements de Mme Rochat :', {
        tableau: T(
          ['Opération', 'Débit', 'Crédit', 'CHF'],
          ['Elle prend de la caisse pour ses besoins', 'Privé', 'Caisse', '800.00'],
          ["Sa facture de dentiste est payée par la banque de l'entreprise", 'Privé', 'Banque', '640.00'],
          ['Elle emporte un vélo pour sa fille (au prix coûtant)', 'Privé', 'Prestations propres', '380.00'],
        ),
        conclusion: "Total des prélèvements : 1'820.00.",
      }),
      piege: "La facture du dentiste n'est pas une charge de l'entreprise, même si c'est sa banque qui paie. Demandez-vous toujours : cette dépense sert-elle à l'entreprise ou à la personne ?",
    },
    {
      titre: '3. Pourquoi « Prestations propres » pour les marchandises ?',
      texte: [
        "Quand la propriétaire emporte un vélo, ce n'est pas une vente : aucun client n'a payé. Mais le vélo a été acheté par l'entreprise et son coût figure dans les achats. Si on ne faisait rien, le magasin aurait une charge sans rien en face, et son bénéfice serait trop bas.",
        "On inscrit donc le prix coûtant du vélo dans un compte de produit à part, Prestations propres. Le compte Ventes de marchandises reste réservé aux vraies ventes, à de vrais clients.",
      ],
      retenir: 'Marchandises prélevées par le propriétaire : Privé / Prestations propres, au prix coûtant.',
    },
    {
      titre: '4. Privé ou charge de l’entreprise ?',
      texte: ["Le tri se fait dépense par dépense. Le même fournisseur peut envoyer deux factures qui ne se traitent pas de la même façon."],
      exemple: ex('Privé ou entreprise ?', {
        tableau: T(
          ['Dépense payée par l’entreprise', 'Pour qui ?', 'Compte débité'],
          ['Loyer du magasin', "L'entreprise", 'Loyers'],
          ["Loyer de l'appartement de la propriétaire", 'La personne', 'Privé'],
          ['Abonnement de téléphone du magasin', "L'entreprise", 'Téléphone, fax, Internet'],
          ['Vacances de la famille', 'La personne', 'Privé'],
          ['Assurance de la camionnette', "L'entreprise", 'Assurances'],
          ['Assurance-maladie de la propriétaire', 'La personne', 'Privé'],
        ),
      }),
      questions: [{ question: 'La banque de l’entreprise paie 320.00 pour l’abonnement de fitness du propriétaire. Quelle écriture ?', reponse: 'Privé / Banque, 320.00. Ce n’est pas une charge : la dépense ne sert pas à l’entreprise.' }],
    },
    {
      titre: '5. Ce que le propriétaire apporte',
      texte: ["Le mouvement inverse existe aussi. Si le propriétaire met durablement de l'argent ou un bien dans son entreprise, le capital augmente."],
      exemple: ex("Apport de 12'000.00 sur le compte bancaire :", { lignes: ["Banque / Capital, 12'000.00."] }),
    },
    {
      titre: "6. À la fin de l'année : le privé et le résultat rejoignent le capital",
      texte: [
        "Le compte Privé ne reste pas ouvert d'une année à l'autre. À la clôture, deux écritures règlent les comptes entre le propriétaire et son entreprise.",
        "D'abord, le résultat de l'année est viré au compte Privé : le bénéfice revient au propriétaire. Ensuite, le solde du compte Privé est viré au capital. Les prélèvements de l'année diminuent ainsi le capital, et le bénéfice l'augmente.",
      ],
      exemple: ex("Capital au 1er janvier 64'000.00 ; bénéfice de l'année 3'530.00 ; prélèvements 1'820.00.", {
        tableau: T(['Écriture de bouclement', 'Débit', 'Crédit', 'CHF'], ['Le bénéfice est viré au privé', 'Compte de résultat', 'Privé', "3'530.00"], ['Le solde du privé est viré au capital', 'Privé', 'Capital', "1'710.00"]),
        lignes: ["Compte Privé : 1'820.00 au débit, 3'530.00 au crédit. Solde : 1'710.00.", "Nouveau capital : 64'000.00 + 1'710.00 = 65'710.00."],
        conclusion: "La propriétaire a gagné 3'530.00 et en a retiré 1'820.00 : elle a laissé 1'710.00 dans son entreprise.",
      }),
      piege: "Si les prélèvements dépassent le bénéfice, le solde du privé est de l'autre côté et le capital diminue : le propriétaire a retiré plus que ce que l'entreprise a gagné.",
      retenir: 'Privé : un compte de passage, soldé chaque année par le capital.',
      questions: [{ question: 'Capital initial 40\'000.00, bénéfice 6\'000.00, prélèvements 9\'000.00. Quel est le capital final ?', reponse: '40\'000.00 + 6\'000.00 − 9\'000.00 = 37\'000.00. Le propriétaire a retiré 3\'000.00 de plus que le bénéfice.' }],
    },
  ],

  // ----------------------------------------------------------------- Achats et ventes de marchandises
  marchandises: [
    {
      titre: "1. L'entreprise commerciale",
      texte: [
        "Une entreprise commerciale achète des marchandises et les revend sans les transformer : une librairie, un magasin de sport, un kiosque. Elle gagne sa vie sur la différence entre le prix auquel elle achète et le prix auquel elle vend.",
        "Ce qui la distingue d'une entreprise de services, c'est le stock : des marchandises achetées, pas encore vendues, qui attendent en magasin.",
      ],
      definitions: [
        { terme: 'Marchandise', definition: 'bien acheté pour être revendu tel quel.' },
        { terme: 'Stock', definition: 'marchandises que l’entreprise possède à un moment donné.' },
      ],
    },
    {
      titre: '2. Quatre comptes pour les marchandises',
      texte: [
        "On utilise un compte pour les achats (une charge), un compte pour les ventes (un produit), un compte pour le stock (un actif), et un compte pour la variation du stock, qui ne sert qu'à la clôture.",
        "Pendant l'année, on ne touche pas au stock : chaque achat va dans Achats de marchandises, chaque vente dans Ventes de marchandises. Le compte Stock garde la valeur du dernier inventaire jusqu'au 31 décembre.",
        "Pourquoi ne pas mettre à jour le stock à chaque vente ? Parce qu'il faudrait connaître, pour chaque article vendu, ce qu'il avait coûté. Il est bien plus simple de compter une fois par an ce qui reste.",
      ],
      exemple: ex('Les opérations de base :', {
        tableau: T(
          ['Opération', 'Débit', 'Crédit', 'CHF'],
          ['Achat de marchandises à crédit', 'Achats de marchandises', 'Dettes fournisseurs', "6'000.00"],
          ['Achat de marchandises payé par la banque', 'Achats de marchandises', 'Banque', "1'200.00"],
          ['Vente de marchandises à crédit', 'Créances clients', 'Ventes de marchandises', "9'500.00"],
          ['Ventes au comptant', 'Caisse', 'Ventes de marchandises', '900.00'],
        ),
      }),
      piege: "Un achat de marchandises ne se passe pas dans le compte Stock, même si les cartons arrivent dans l'entrepôt.",
    },
    {
      titre: '3. Retours : on défait une partie de la facture',
      texte: [
        "Une marchandise abîmée ou qui ne convient pas est renvoyée. La facture de départ est alors en partie annulée : l'écriture va dans l'autre sens, pour le montant du retour.",
      ],
      exemple: ex('Côté achats et côté ventes :', {
        tableau: T(['Opération', 'Débit', 'Crédit', 'CHF'], ['Nous retournons des marchandises au fournisseur', 'Dettes fournisseurs', 'Achats de marchandises', '700.00'], ['Un client nous retourne des marchandises', 'Ventes de marchandises', 'Créances clients', '800.00']),
        conclusion: "Après le retour, nous ne devons plus que 5'300.00 au fournisseur, et le client ne nous doit plus que 8'700.00.",
      }),
      retenir: 'Un retour diminue la dette ou la créance de départ, par l’écriture inverse.',
    },
    {
      titre: '4. Rabais, remises et escomptes',
      texte: [
        "Trois réductions de prix existent, pour trois raisons différentes. Le rabais compense un défaut ou accompagne des soldes. La remise récompense une grande quantité ou un bon client. L'escompte récompense un paiement rapide, par exemple 2 % si l'on paie dans les 10 jours.",
        "Les réductions que nous accordons à nos clients vont dans Déductions accordées : elles diminuent notre chiffre d'affaires. Celles que nous obtenons de nos fournisseurs vont dans Déductions obtenues : elles diminuent le coût de nos achats.",
        "L'escompte se découvre au moment du paiement : on paie moins que la facture. L'écriture a alors trois lignes.",
      ],
      exemples: [
        ex('Rabais accordés après la facture :', {
          tableau: T(['Opération', 'Débit', 'Crédit', 'CHF'], ['Le fournisseur nous accorde un rabais', 'Dettes fournisseurs', 'Déductions obtenues', '300.00'], ['Nous accordons un rabais à un client', 'Déductions accordées', 'Créances clients', '250.00']),
        }),
        ex("Nous payons une facture de 4'800.00 dans les 10 jours, sous déduction de 2 % d'escompte.", {
          tableau: T(['Débit', 'Crédit'], ["Dettes fournisseurs 4'800.00", "Banque 4'704.00 et Déductions obtenues 96.00"]),
          conclusion: "Escompte : 4'800.00 × 2 % = 96.00. La dette de 4'800.00 est entièrement éteinte, alors que nous n'avons versé que 4'704.00.",
        }),
        ex("Un client paie une facture de 6'400.00 sous déduction de 2 % d'escompte.", {
          tableau: T(['Débit', 'Crédit'], ["Banque 6'272.00 et Déductions accordées 128.00", "Créances clients 6'400.00"]),
        }),
      ],
      piege: "Avec un escompte, la dette ou la créance s'éteint pour son montant entier, pas pour le montant versé. Sinon il resterait un petit solde que personne ne paiera jamais.",
    },
    {
      titre: '5. Les frais autour des marchandises',
      texte: [
        "Faire venir la marchandise coûte : transport, douane, assurance. Ces frais d'achats augmentent le coût des marchandises.",
        "Livrer la marchandise au client coûte aussi : port, emballage. Ces frais de ventes diminuent ce que la vente rapporte vraiment.",
      ],
      exemple: ex('Deux factures de transport payées par la banque :', {
        tableau: T(['Opération', 'Débit', 'Crédit', 'CHF'], ["Transport d'un achat", "Frais d'achats", 'Banque', '180.00'], ['Livraison à un client', 'Frais de ventes', 'Banque', '120.00']),
      }),
    },
    {
      titre: '6. À la clôture : l’inventaire et la variation du stock',
      texte: [
        "Au 31 décembre, on compte ce qui reste en magasin : c'est l'inventaire. On compare ce stock final au stock du début de l'année.",
        "Si le stock a augmenté, une partie des achats de l'année n'a pas été vendue : elle ne doit pas peser sur le résultat. Si le stock a diminué, on a vendu plus que ce qu'on a acheté : il faut ajouter ce supplément au coût des ventes.",
      ],
      exemples: [
        ex("Le stock passe de 12'000.00 à 14'500.00 :", { lignes: ["Augmentation de 2'500.00 : Stock de marchandises / Variation de stocks, 2'500.00."] }),
        ex("Le stock passe de 12'000.00 à 10'800.00 :", { lignes: ["Diminution de 1'200.00 : Variation de stocks / Stock de marchandises, 1'200.00."] }),
      ],
      retenir: 'Stock en hausse : on retire des achats ce qui n’est pas vendu. Stock en baisse : on y ajoute ce qui a été puisé dans le stock.',
    },
    {
      titre: '7. La marge brute : ce que le commerce rapporte vraiment',
      texte: [
        "Avec tous ces comptes, on peut calculer ce que les ventes rapportent une fois payé le coût des marchandises vendues. Quatre chiffres y mènent.",
        "Le chiffre d'affaires brut (CAB) est le total des ventes. Le chiffre d'affaires net (CAN) est ce qui reste après les déductions accordées et les frais de ventes. Le prix de revient d'achat des marchandises achetées (PRAMA) est le coût réel des achats. Le prix de revient d'achat des marchandises vendues (PRAMV) corrige ce coût de la variation du stock.",
      ],
      exemple: ex("L'année d'une boutique :", {
        tableau: T(
          ['', 'CHF'],
          ['Ventes de marchandises (CAB)', "50'000.00"],
          ['− Déductions accordées', "1'500.00"],
          ['− Frais de ventes', '500.00'],
          ["Chiffre d'affaires net (CAN)", "48'000.00"],
          ['Achats de marchandises', "30'000.00"],
          ['− Déductions obtenues', "1'000.00"],
          ["+ Frais d'achats", '800.00'],
          ['PRAMA', "29'800.00"],
          ['− Augmentation du stock', "2'500.00"],
          ['PRAMV', "27'300.00"],
          ['Marge brute (CAN − PRAMV)', "20'700.00"],
        ),
        conclusion: "Sur 48'000.00 de ventes nettes, les marchandises ont coûté 27'300.00. Il reste 20'700.00, soit 43,1 % du CAN, pour payer le loyer, les salaires et les autres charges, puis dégager un bénéfice.",
      }),
      retenir: "Marge brute = chiffre d'affaires net − prix de revient d'achat des marchandises vendues.",
      questions: [{ question: 'CAN 80\'000.00, PRAMA 52\'000.00, le stock a diminué de 3\'000.00. Quelle est la marge brute ?', reponse: 'PRAMV = 52\'000.00 + 3\'000.00 = 55\'000.00. Marge brute = 80\'000.00 − 55\'000.00 = 25\'000.00.' }],
    },
  ],

  // ---------------------------------------------------------------------- Synthèse de la 1re année
  'synthese-cfc1': [
    {
      titre: "1. Lire l'opération jusqu'au bout",
      texte: [
        "Les erreurs viennent rarement de la règle : elles viennent d'une lecture trop rapide. Chaque mot de l'énoncé décide d'un compte.",
        "Prenez l'habitude de souligner trois choses : ce que l'entreprise reçoit ou donne, le moyen de paiement, et le moment (aujourd'hui ou plus tard).",
      ],
      exemple: ex('Les indices à repérer :', {
        tableau: T(
          ['Indice', 'Ce que cela décide'],
          ['« en espèces », « par la poste », « par la banque »', 'Caisse, Poste ou Banque'],
          ['« à crédit », « payable à 30 jours », « nous recevons la facture »', "Une créance ou une dette, pas d'argent aujourd'hui"],
          ['« facture déjà comptabilisée »', 'Le paiement touche seulement la dette ou la créance'],
          ['« pour être revendu », « marchandises »', 'Achats de marchandises et Dettes fournisseurs'],
          ['« pour le magasin », « pour le bureau » (bien durable)', 'Un actif immobilisé et Autres dettes'],
          ['« pour ses besoins privés », « personnelle »', 'Le compte Privé'],
        ),
      }),
    },
    {
      titre: '2. Puis les trois questions',
      texte: ['Quels comptes sont touchés ? De quel type est chacun ? Augmente-t-il ou diminue-t-il ? Avec ces trois réponses, le débit et le crédit se placent tout seuls.'],
      exemple: ex('Rappel des quatre types de comptes :', { tableau: T(['Compte', 'Augmente', 'Diminue'], ['Actif', 'au débit', 'au crédit'], ['Passif', 'au crédit', 'au débit'], ['Charge', 'au débit', 'au crédit'], ['Produit', 'au crédit', 'au débit']) }),
    },
    {
      titre: '3. La même situation, six écritures différentes',
      texte: ["Un seul mot change, et l'écriture change. Comparez ces opérations qui commencent toutes par « Le magasin achète… »."],
      exemple: ex('Le magasin achète…', {
        tableau: T(
          ['Opération', 'Débit', 'Crédit'],
          ['… des vélos à revendre, à crédit', 'Achats de marchandises', 'Dettes fournisseurs'],
          ['… des vélos à revendre, payés par la banque', 'Achats de marchandises', 'Banque'],
          ['… une camionnette, à crédit', 'Véhicules', 'Autres dettes'],
          ['… une camionnette, payée par la banque', 'Véhicules', 'Banque'],
          ['… des fournitures de bureau, en espèces', "Frais d'administration", 'Caisse'],
          ['… un vélo pour le fils de la propriétaire, payé par la banque', 'Privé', 'Banque'],
        ),
      }),
      retenir: "Une écriture juste, c'est une lecture juste : comptant ou crédit, marchandise ou investissement, entreprise ou privé.",
    },
    {
      titre: '4. Se contrôler soi-même',
      texte: ["Avant de valider, trois vérifications prennent dix secondes et évitent la plupart des fautes."],
      methode: ['Le débit et le crédit ont-ils le même total ?', 'Si de l’argent est sorti ou entré aujourd’hui, y a-t-il bien la caisse, la poste ou la banque ?', 'S’il n’y a ni charge ni produit, est-il normal que le résultat ne change pas ?'],
    },
  ],

  // ----------------------------------------------------------------------------- Classer les pièces
  'classer-pieces': [
    {
      titre: '1. Avant le débit et le crédit : de quoi parle la pièce ?',
      texte: [
        "Une facture arrive sur votre bureau. Avant de penser aux comptes, demandez-vous ce que l'entreprise a reçu. Il n'y a que quatre réponses possibles, et chacune mène à une famille de comptes.",
      ],
      exemple: ex('Les quatre classeurs :', {
        tableau: T(
          ['Classeur', 'La question à se poser', 'Exemple'],
          ['Marchandises à revendre', 'Est-ce acheté pour être revendu ?', 'Des vélos pour le magasin'],
          ['Investissement', 'Est-ce un bien qui servira plusieurs années ?', 'Une camionnette, un ordinateur'],
          ["Charge de l'entreprise", "Est-ce consommé pendant l'année ?", 'Le loyer, le téléphone, le carburant'],
          ['Privé', 'Est-ce pour le propriétaire lui-même ?', 'Sa facture de dentiste'],
        ),
      }),
    },
    {
      titre: '2. Lire une pièce : où regarder',
      texte: [
        "Une pièce contient toujours les mêmes informations. Qui l'a émise ? À qui est-elle adressée ? Que décrit-elle ? Pour quel montant ? Est-elle déjà payée (ticket, quittance) ou à payer (facture avec une échéance) ?",
        "La description des articles suffit presque toujours à choisir le classeur. Le mode de paiement, lui, décidera plus tard de l'autre moitié de l'écriture.",
      ],
      methode: ['Repérer ce qui a été livré ou fourni.', 'Se demander à quoi cela servira dans l’entreprise.', 'Choisir le classeur.', 'Regarder ensuite seulement si c’est payé ou à payer.'],
    },
    {
      titre: '3. Le même objet, deux classeurs possibles',
      texte: ["Ce n'est pas l'objet qui décide, c'est ce que l'entreprise en fait. Une voiture est une marchandise chez le garagiste qui la revend, et un investissement chez le boulanger qui livre son pain."],
      exemple: ex('Un ordinateur portable, quatre destinations :', {
        tableau: T(
          ['Qui achète, et pour quoi faire', 'Classeur'],
          ['Un magasin d’informatique, pour le vendre', 'Marchandises à revendre'],
          ['Un cabinet d’architecte, pour ses dessins', 'Investissement'],
          ['Le même cabinet paie la réparation de l’écran', "Charge de l'entreprise"],
          ['L’architecte l’offre à sa fille', 'Privé'],
        ),
      }),
      piege: "L'ordinateur du bureau est un investissement ; les cartouches d'encre qu'on y met sont une charge, consommée dans l'année.",
      retenir: 'Classer la pièce, puis seulement chercher les comptes.',
    },
  ],
};
