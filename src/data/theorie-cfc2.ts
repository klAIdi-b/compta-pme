// Théorie enrichie de la 2ème CFC (modèle du 24.11.2026). Cinq chapitres validés enrichis sans rien retirer (TVA,
// amortissements, transitoires, pertes sur créances et ducroire, salaires) et trois chapitres nouveaux, qui expliquent des
// rubriques existantes du logiciel : facturation et paiements, budget et écarts, marge contributive et répartition des coûts.
// Texte original ; comptes du plan du cours disponibles en 2ème CFC ; règles du projet (CLAUDE.md) et du moteur
// (src/engine/facturation.ts, budget.ts, calculs.ts). Contenu validé par l'enseignant le 24.11.2026.
// Non traité ici, en attente de la décision de l'enseignant : l'escompte avec correction de la TVA (classé en maturité).
import type { Chapitre } from './theorie';
import { C, D, P, enrichir, p, r3, s } from './theorie-cfc1';

const vide = (id: string, titre: string, resume: string, sections: Chapitre['sections']): Chapitre => ({ id, titre, niveau: 'CFC2', resume, sections });

/** Remplace les chapitres de 2ème CFC par leur version enrichie et ajoute, après les salaires, les trois chapitres nouveaux. */
export function enrichirCfc2(chapitres: Chapitre[]): Chapitre[] {
  const de = (id: string) => chapitres.find((c) => c.id === id)!;

  const enrichis: Record<string, Chapitre[]> = {
    // ───────────────────────────────────────────────────────────────────────────────── TVA
    tva: [
      enrichir(de('tva'), {
        bases: ["LTVA art. 10 (assujettissement, seuil de 100'000 francs)", "LTVA art. 25 (taux de l'impôt)"],
        objectifs: [
          "Calculer la TVA à partir d'un montant hors taxe ou TVA comprise.",
          'Comptabiliser un achat et une vente avec TVA, au net et au brut.',
          "Établir le décompte d'une période et comptabiliser le paiement à l'AFC.",
        ],
        termes: [
          { terme: 'TVA', definition: 'taxe sur la valeur ajoutée, impôt de la Confédération sur la consommation.' },
          { terme: 'Assujetti', definition: 'entreprise qui doit facturer la TVA et la verser à la Confédération.' },
          { terme: 'Hors taxe (HT)', definition: 'prix sans la TVA.' },
          { terme: 'TVA comprise (TTC)', definition: 'prix payé par le client, TVA incluse.' },
          { terme: 'TVA due', definition: "TVA facturée aux clients, que l'entreprise doit reverser." },
          { terme: 'Impôt préalable (IP)', definition: "TVA payée aux fournisseurs, que l'entreprise peut déduire." },
          { terme: 'AFC', definition: 'Administration fédérale des contributions, qui encaisse la TVA.' },
          { terme: 'Décompte', definition: "calcul, à la fin d'une période, de ce que l'entreprise doit à l'AFC." },
        ],
        apres: {
          Principe: [
            p("La TVA est un impôt sur la consommation : c'est le client final qui la supporte. L'entreprise ne fait que l'encaisser pour la Confédération. Elle n'est donc pour elle ni un produit ni une charge."),
            {
              type: 'exemple',
              enonce: "Un magasin achète un vélo 600.00 hors taxe et le revend 1'000.00 hors taxe, au taux de 8,1 %.",
              calcul: [
                'Le magasin paie au grossiste 600.00 + 48.60 de TVA. Le grossiste reverse ces 48.60.',
                "Il encaisse du client 1'000.00 + 81.00 de TVA.",
                'Il reverse 81.00 − 48.60 = 32.40.',
              ],
              conclusion: "La Confédération reçoit 48.60 + 32.40 = 81.00, soit 8,1 % du prix final. Le magasin n'a rien payé de sa poche.",
            },
            {
              type: 'contraste',
              cas: [
                { titre: 'Vous connaissez le hors taxe', texte: ['TVA = hors taxe × taux.', "1'000.00 × 8,1 % = 81.00."] },
                { titre: 'Vous connaissez le montant TVA comprise', texte: ['TVA = TTC × taux ÷ (100 + taux).', "1'081.00 × 8,1 ÷ 108,1 = 81.00."] },
              ],
            },
            {
              type: 'exemple',
              enonce: 'Une facture de 249.90 hors taxe, au taux de 8,1 %.',
              calcul: ['249.90 × 8,1 % = 20.2419, arrondi aux 5 centimes : 20.25.', 'Montant TVA comprise : 249.90 + 20.25 = 270.15.'],
            },
          ],
          'Comptes utilisés': [
            p("La TVA due est une dette : elle est au passif. L'impôt préalable est une créance envers l'AFC : il est à l'actif."),
            {
              type: 'contraste',
              cas: [
                { titre: '1170 IP s/marchandises et services', texte: ["Ce que l'entreprise achète pour le revendre, et les services liés à ces achats.", 'Exemple : la TVA sur une facture de vélos destinés à la vente.'] },
                { titre: '1171 IP s/investissements et AGE', texte: ["Ce qui sert au fonctionnement de l'entreprise : biens durables et autres charges d'exploitation.", "Exemple : la TVA sur une camionnette, une réparation, l'électricité."] },
              ],
            },
          ],
          'Comptabilisation au net': [
            {
              type: 'exemple',
              enonce: "Vente de marchandises à crédit, 2'000.00 hors taxe, TVA 8,1 %.",
              raisonnement: r3('Créances clients, Ventes de marchandises et TVA due.', 'Un actif, un produit et un passif.', 'Les trois augmentent : la créance au débit, la vente et la TVA due au crédit.'),
              calcul: ["TVA : 2'000.00 × 8,1 % = 162.00. Le client devra 2'162.00."],
              lignes: [D('1100', 2162), C('3200', 2000), C('2200', 162)],
              effets: { actif: "Créances clients + 2'162.00", passif: 'TVA due + 162.00', resultat: "Produits + 2'000.00" },
              conclusion: "Le résultat augmente de 2'000.00 seulement : la TVA n'est pas un produit.",
              variante: {
                enonce: "Achat d'une camionnette à crédit, 20'000.00 hors taxe, TVA 8,1 %.",
                texte: ["La TVA payée est un impôt préalable sur un investissement : 1'620.00. Ce n'est pas un achat de marchandises : la dette va dans Autres dettes."],
                lignes: [D('1530', 20000), D('1171', 1620), C('2010', 21620)],
              },
            },
            { type: 'retenir', texte: "Au net : le hors taxe dans le compte de charge, d'actif ou de produit ; la TVA dans son compte ; le total TVA comprise dans la créance, la dette ou la banque." },
          ],
          'Comptabilisation au brut': [
            {
              type: 'contraste',
              cas: [
                { titre: 'Au net : une écriture', texte: ["La vente de 2'162.00 TVA comprise est séparée tout de suite."], lignes: [D('1100', 2162), C('3200', 2000), C('2200', 162)] },
                { titre: 'Au brut : deux écritures', texte: ['À la facture, puis à la fin de la période.'], lignes: [...s('1100', '3200', 2162), ...s('3200', '2200', 162)] },
              ],
            },
            p('Le résultat final est le même. Seul le moment où la TVA est séparée change.'),
          ],
          'Décompte et paiement': [
            {
              type: 'exemple',
              enonce: "Fin du trimestre : TVA due 3'321.00 ; impôt préalable 810.00 sur les marchandises et 1'644.30 sur les investissements et autres charges.",
              calcul: ["À verser : 3'321.00 − 810.00 − 1'644.30 = 866.70."],
              lignes: [D('2200', 3321), C('1170', 810), C('1171', 1644.3), C('2205', 866.7)],
              effets: { actif: "Impôt préalable − 2'454.30", passif: "TVA due − 3'321.00 ; Dettes AFC + 866.70", resultat: 'Aucun effet' },
              conclusion: 'Après le décompte, le compte TVA due et les deux comptes d’impôt préalable sont à zéro.',
              variante: { enonce: "Paiement à l'AFC par la banque.", lignes: s('2205', '1020', 866.7) },
            },
            { type: 'compteT', compte: '2200', debit: [P('IP marchandises', 810), P('IP investissements', 1644.3), P('Dettes AFC', 866.7)], credit: [P('TVA du trimestre', 3321)] },
          ],
        },
        erreurs: [
          { erreur: 'Oublier la TVA.', correction: "Si l'entreprise est assujettie, chaque achat et chaque vente soumis portent une ligne de TVA." },
          { erreur: 'Appliquer le taux au montant TVA comprise.', correction: "8,1 % de 1'081.00 font 87.55, et non 81.00. À partir d'un montant TVA comprise, on multiplie par 8,1 et on divise par 108,1." },
          { erreur: 'Passer la TVA en charge ou en produit.', correction: "La TVA payée n'est pas un coût et la TVA encaissée n'est pas une vente : elles vont dans les comptes de TVA." },
          { erreur: "Se tromper de compte d'impôt préalable.", correction: "Marchandises et services d'un côté, investissements et autres charges d'exploitation de l'autre." },
          { erreur: 'Arrêter le décompte trop tôt.', correction: "Virer l'impôt préalable ne suffit pas : le solde de TVA due doit encore être viré à Dettes AFC." },
        ],
        questions: [
          { question: "Une facture s'élève à 648.60 TVA comprise, au taux de 8,1 %. Quelle est la TVA ?", reponse: '648.60 × 8,1 ÷ 108,1 = 48.60. Le montant hors taxe est de 600.00.' },
          { question: "Pourquoi la TVA encaissée auprès d'un client n'augmente-t-elle pas le bénéfice ?", reponse: "Parce qu'elle est due à la Confédération : elle est inscrite au passif, dans TVA due, et non dans un compte de produit." },
          { question: "L'entreprise reçoit une facture d'électricité de 300.00 hors taxe, à payer. Quelle écriture au net ?", reponse: 'Électricité, gaz 300.00 et IP s/investissements et AGE 24.30 au débit ; Autres dettes 324.30 au crédit.' },
          { question: "TVA due 2'430.00, impôt préalable 1'180.00 au total. Quel montant va dans Dettes AFC ?", reponse: "2'430.00 − 1'180.00 = 1'250.00." },
          { question: 'Après le décompte et avant le paiement, quels comptes de TVA ont encore un solde ?', reponse: 'Un seul : Dettes AFC.' },
        ],
        liens: { module: 'tva-ecritures', exercices: ['prop-cfc2-electro-saleve-tva', 'dossier-cfc2-outils-et-cie-tva'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Amortissements
    amortissements: [
      enrichir(de('amortissements'), {
        objectifs: [
          'Calculer un amortissement linéaire ou dégressif, avec ou sans prorata.',
          'Comptabiliser un amortissement selon la méthode directe ou indirecte.',
          "Calculer la valeur comptable d'une immobilisation.",
        ],
        termes: [
          { terme: "Valeur d'acquisition", definition: "ce que le bien a coûté le jour de l'achat." },
          { terme: 'Amortissement', definition: "perte de valeur d'un bien durable, enregistrée comme charge de l'exercice." },
          { terme: 'Valeur comptable', definition: "valeur d'acquisition moins les amortissements cumulés." },
          { terme: 'FAC', definition: "fonds d'amortissements cumulés : compte qui réunit les amortissements dans la méthode indirecte." },
          { terme: 'Prorata temporis', definition: "calcul en proportion du nombre de mois d'utilisation." },
        ],
        apres: {
          'Pourquoi amortir ?': [
            p("Sans amortissement, le bilan continuerait d'afficher le prix payé pour un véhicule qui a déjà roulé cinq ans. Et passer tout le prix en charge l'année de l'achat ferait porter à un seul exercice le coût d'un bien qui sert plusieurs années."),
            p("L'amortissement répartit ce coût sur les années d'utilisation. C'est une charge sans sortie d'argent : l'argent est sorti le jour de l'achat."),
          ],
          'Calcul : linéaire ou dégressif': [
            {
              type: 'exemple',
              enonce: "Véhicule acheté 20'000.00 le 1er janvier, amorti au taux de 25 %.",
              calcul: [
                "Linéaire : 20'000.00 × 25 % = 5'000.00 chaque année.",
                "Dégressif, 1re année : 20'000.00 × 25 % = 5'000.00 ; il reste 15'000.00.",
                "Dégressif, 2e année : 15'000.00 × 25 % = 3'750.00 ; il reste 11'250.00.",
                "Dégressif, 3e année : 11'250.00 × 25 % = 2'812.50 ; il reste 8'437.50.",
              ],
              conclusion: "En linéaire, la valeur comptable baisse de 5'000.00 par an. En dégressif, l'amortissement diminue d'année en année.",
            },
            {
              type: 'tableau',
              entetes: ['Année', 'Linéaire', 'Valeur comptable', 'Dégressif', 'Valeur comptable'],
              lignes: [
                ['1', "5'000.00", "15'000.00", "5'000.00", "15'000.00"],
                ['2', "5'000.00", "10'000.00", "3'750.00", "11'250.00"],
                ['3', "5'000.00", "5'000.00", "2'812.50", "8'437.50"],
              ],
            },
            {
              type: 'exemple',
              enonce: "Même véhicule, acheté le 1er octobre : amortissement linéaire de la première année.",
              calcul: ["Trois mois d'utilisation : 5'000.00 × 3 ÷ 12 = 1'250.00."],
              conclusion: "Le prorata ne concerne que l'année de l'achat.",
            },
          ],
          'Comptabilisation : directe ou indirecte': [
            {
              type: 'exemple',
              enonce: "Amortissement du véhicule, 5'000.00, méthode indirecte.",
              raisonnement: r3('Amortissements et FAC s/véhicules.', "Une charge et un compte correctif d'actif.", "La charge augmente au débit ; le fonds d'amortissements augmente au crédit."),
              lignes: s('6800', '1539', 5000),
              effets: { actif: "Valeur comptable du véhicule − 5'000.00", resultat: "Charges + 5'000.00 : le bénéfice diminue" },
              variante: { enonce: 'Le même amortissement, méthode directe.', texte: ['Le compte Véhicules est crédité directement.'], lignes: s('6800', '1530', 5000) },
            },
            {
              type: 'contraste',
              cas: [
                { titre: 'Méthode directe, après deux ans', texte: ["Véhicules : 10'000.00.", "Le compte montre la valeur comptable ; on ne voit plus le prix d'achat."] },
                { titre: 'Méthode indirecte, après deux ans', texte: ["Véhicules : 20'000.00 ; FAC s/véhicules : 10'000.00.", "Valeur comptable : 20'000.00 − 10'000.00 = 10'000.00. On voit le prix d'achat et ce qui est déjà amorti."] },
              ],
            },
          ],
        },
        erreurs: [
          { erreur: "Calculer l'amortissement dégressif sur la valeur d'acquisition.", correction: 'Le taux dégressif s’applique à la valeur comptable du début de l’exercice.' },
          { erreur: "Oublier le prorata l'année de l'achat.", correction: "On ne compte que les mois d'utilisation : amortissement annuel × mois ÷ 12." },
          { erreur: 'Créditer la banque.', correction: "L'amortissement ne fait sortir aucun argent : on crédite l'immobilisation ou son fonds d'amortissements." },
          { erreur: "En méthode indirecte, créditer le compte de l'immobilisation.", correction: "Le compte du bien garde sa valeur d'acquisition ; c'est le compte FAC qui est crédité." },
        ],
        questions: [
          { question: "Une machine de 12'000.00 est amortie de 20 % en dégressif. Quel est l'amortissement de la 2e année ?", reponse: "1re année : 2'400.00, il reste 9'600.00. 2e année : 9'600.00 × 20 % = 1'920.00." },
          { question: "Mobilier de 9'000.00 acheté le 1er septembre, amorti linéairement de 10 %. Amortissement de l'année ?", reponse: "Amortissement annuel : 900.00. Quatre mois : 900.00 × 4 ÷ 12 = 300.00." },
          { question: "Machines et appareils 30'000.00, FAC s/machines et appareils 18'000.00. Quelle est la valeur comptable ?", reponse: "12'000.00." },
          { question: "L'amortissement fait-il sortir de l'argent de la banque ?", reponse: "Non : c'est une charge calculée. L'argent est sorti lors de l'achat." },
        ],
        liens: { module: 'amortissements-ecritures', exercices: ['prop-cfc2-imprimerie-mandement', 'dossier-cfc3-menuiserie-grandjean'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Transitoires
    transitoires: [
      enrichir(de('transitoires'), {
        objectifs: [
          "Reconnaître une charge ou un produit à régulariser à la clôture.",
          'Passer les écritures de régularisation au 31 décembre.',
          'Extourner ces écritures au 1er janvier.',
        ],
        termes: [
          { terme: 'Régularisation', definition: "écriture de clôture qui rattache une charge ou un produit à l'exercice qu'il concerne." },
          { terme: 'Actif transitoire', definition: "avoir de l'entreprise à la clôture : une charge payée d'avance ou un produit à recevoir." },
          { terme: 'Passif transitoire', definition: "dette de l'entreprise à la clôture : une charge à payer ou un produit encaissé d'avance." },
          { terme: 'Extourne', definition: "écriture inverse, passée au 1er janvier." },
        ],
        apres: {
          Principe: [
            {
              type: 'exemple',
              enonce: "Prime d'assurance de 1'200.00 payée le 1er juillet pour douze mois.",
              raisonnement: r3('Actifs transitoires et Assurances.', 'Un actif et une charge.', "L'actif augmente au débit ; la charge diminue au crédit."),
              calcul: ["Six mois concernent l'exercice suivant : 1'200.00 × 6 ÷ 12 = 600.00."],
              lignes: s('1300', '6300', 600),
              effets: { actif: 'Actifs transitoires + 600.00', resultat: 'Charges − 600.00 : le bénéfice augmente' },
              conclusion: "Le compte Assurances ne montre plus que 600.00 : la part de l'exercice.",
              variante: {
                enonce: "Le loyer de décembre, 2'000.00, n'est pas encore payé au 31 décembre.",
                texte: ["La charge existe, même sans paiement : on l'ajoute, avec une dette en face."],
                lignes: s('6000', '2300', 2000),
              },
            },
            {
              type: 'contraste',
              cas: [
                { titre: "Payé d'avance", texte: ["L'entreprise a payé pour une prestation qu'elle recevra plus tard : c'est un avoir.", 'Actifs transitoires au débit, la charge au crédit.'] },
                { titre: 'Pas encore payé', texte: ["L'entreprise a consommé une prestation qu'elle doit encore payer : c'est une dette.", 'La charge au débit, Passifs transitoires au crédit.'] },
              ],
            },
          ],
          'Extourne au 1er janvier': [
            p("L'extourne remet la charge dans le nouvel exercice. Quand le loyer de décembre sera payé en janvier, il s'inscrira au débit du compte Loyers, où l'extourne a laissé le même montant au crédit : les deux s'annulent."),
            { type: 'compteT', compte: '6300', debit: [P('Prime payée le 1er juillet', 1200)], credit: [P("Part de l'exercice suivant", 600), P("Charge de l'exercice", 600)] },
          ],
        },
        erreurs: [
          { erreur: 'Confondre actif et passif transitoire.', correction: "Payé d'avance : l'entreprise a un avoir, c'est un actif. Pas encore payé : elle doit, c'est un passif." },
          { erreur: "Régulariser le montant entier au lieu de la part concernée.", correction: "On compte les mois qui concernent l'exercice suivant, et eux seulement." },
          { erreur: "Oublier l'extourne au 1er janvier.", correction: 'Sans extourne, le compte transitoire reste ouvert et la charge est comptée à double l’année suivante.' },
          { erreur: 'Créditer la banque au 31 décembre.', correction: "Aucun argent ne bouge à la clôture : l'écriture oppose un compte transitoire et un compte de charge ou de produit." },
        ],
        questions: [
          { question: "Un loyer de 3'000.00 pour janvier a été payé le 28 décembre. Quelle écriture au 31 décembre ?", reponse: "Actifs transitoires / Loyers, 3'000.00." },
          { question: "L'électricité de décembre, estimée à 450.00, sera facturée en janvier. Quelle écriture ?", reponse: 'Électricité, gaz / Passifs transitoires, 450.00.' },
          { question: "Une prime d'assurance de 2'400.00 est payée le 1er octobre pour douze mois. Quel montant régulariser ?", reponse: "Neuf mois concernent l'exercice suivant : 2'400.00 × 9 ÷ 12 = 1'800.00." },
          { question: "Quel est l'effet sur le bénéfice d'une charge à payer comptabilisée au 31 décembre ?", reponse: 'La charge augmente : le bénéfice diminue.' },
        ],
        liens: { module: 'transitoires-ecritures', exercices: ['prop-cfc2-imprimerie-mandement', 'dossier-cfc3-ecole-babel-transitoires'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────── Pertes sur créances, ducroire
    creances: [
      enrichir(de('creances'), {
        objectifs: [
          'Comptabiliser une perte sur créance et une créance douteuse.',
          "Calculer et comptabiliser l'ajustement du ducroire.",
          "Comptabiliser l'encaissement d'une créance déjà amortie.",
        ],
        termes: [
          { terme: 'Débiteur', definition: "celui qui doit de l'argent ; ici, le client." },
          { terme: 'Créance douteuse', definition: 'créance dont le paiement est devenu incertain.' },
          { terme: 'Acte de défaut de biens', definition: "document officiel qui constate qu'une poursuite n'a pas permis de payer le créancier." },
          { terme: 'Ducroire', definition: 'estimation des pertes probables sur les créances clients.' },
        ],
        apres: {
          'Créances douteuses': [
            {
              type: 'exemple',
              enonce: "Une créance douteuse de 3'200.00 : le client verse finalement 1'200.00 par la banque, pour solde de tout compte.",
              raisonnement: r3('Banque, Pertes s/créances et Créances douteuses.', 'Un actif, un compte qui diminue le chiffre d’affaires et un actif.', "La banque et la perte augmentent au débit ; la créance douteuse s'éteint au crédit."),
              calcul: ["Perte : 3'200.00 − 1'200.00 = 2'000.00."],
              lignes: [D('1020', 1200), D('3805', 2000), C('1108', 3200)],
              effets: { actif: "Banque + 1'200.00 ; Créances douteuses − 3'200.00", resultat: "Pertes s/créances + 2'000.00 : le bénéfice diminue" },
            },
            p('Si l’entreprise avance des frais de poursuite, elle les ajoute à ce que le client lui doit : ils sont à la charge du débiteur.'),
            { type: 'ecritures', exemples: [{ cas: 'Frais de poursuite avancés par la banque, 70.00', lignes: s('1100', '1020', 70) }] },
          ],
          'Le ducroire': [
            {
              type: 'exemple',
              enonce: "Créances clients au 31 décembre 40'000.00 ; ducroire voulu 5 % ; ducroire existant 1'500.00.",
              calcul: ["Ducroire nécessaire : 40'000.00 × 5 % = 2'000.00.", "Il manque 2'000.00 − 1'500.00 = 500.00."],
              lignes: s('3805', '1109', 500),
              effets: { actif: 'Créances nettes − 500.00', resultat: 'Pertes s/créances + 500.00 : le bénéfice diminue' },
              variante: {
                enonce: "L'exercice suivant, créances de 30'000.00 ; le ducroire est de 2'000.00.",
                texte: ["Ducroire nécessaire : 1'500.00. Il y a 500.00 de trop : on le diminue."],
                lignes: s('1109', '3805', 500),
              },
            },
            { type: 'compteT', compte: '1109', debit: [P('SF', 2000)], credit: [P('SI', 1500), P('Ajustement', 500)] },
            { type: 'tableau', entetes: ['Au bilan', 'CHF'], lignes: [['Créances clients', "40'000.00"], ['Ducroire', "−2'000.00"], ['Créances nettes', "38'000.00"]] },
          ],
        },
        erreurs: [
          { erreur: 'Repasser le ducroire entier chaque année.', correction: "On ne comptabilise que la différence entre le ducroire nécessaire et le ducroire existant." },
          { erreur: 'Traiter une créance douteuse comme une perte.', correction: "Le virement en Créances douteuses est un reclassement à l'actif : le résultat ne change pas." },
          { erreur: "Passer en vente l'encaissement d'une créance déjà amortie.", correction: "Ce n'est pas une vente de l'exercice : c'est un produit exceptionnel." },
          { erreur: 'Corriger la TVA sur une perte.', correction: 'Dans ce cours, la TVA n’est pas corrigée sur les pertes sur créances.' },
        ],
        questions: [
          { question: "Créances 60'000.00, taux 4 %, ducroire existant 1'800.00. Quelle écriture ?", reponse: "Nécessaire : 2'400.00. Il manque 600.00 : Pertes s/créances / Ducroire, 600.00." },
          { question: "Un client en faillite devait 2'160.00. Quelle écriture ?", reponse: "Pertes s/créances / Créances clients, 2'160.00." },
          { question: 'Un client dont la créance a été amortie l’an dernier verse 450.00 par la banque. Quelle écriture ?', reponse: 'Banque / Produits exceptionnels, 450.00.' },
          { question: 'Le ducroire a-t-il un solde débiteur ou créditeur ?', reponse: "Créditeur : c'est un compte de l'actif qui vient en diminution des créances." },
        ],
        liens: { module: 'creances-ecritures', exercices: ['prop-cfc2-sport-evasion-creances', 'dossier-cfc3-meubles-confort-creances'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Salaires
    salaires: [
      enrichir(de('salaires'), {
        objectifs: [
          'Calculer un salaire net à partir du brut et des taux donnés.',
          "Comptabiliser le salaire, les retenues et les charges sociales de l'employeur.",
          'Établir la déclaration annuelle des salaires.',
        ],
        termes: [
          { terme: 'Salaire brut', definition: 'salaire convenu, avant les retenues.' },
          { terme: 'Retenues', definition: "cotisations de l'employé, prélevées sur son salaire par l'employeur." },
          { terme: 'Salaire net', definition: 'salaire brut moins les retenues.' },
          { terme: 'Charges sociales', definition: "cotisations payées par l'employeur en plus du salaire." },
          { terme: 'Masse salariale', definition: "somme des salaires bruts versés pendant l'année." },
        ],
        apres: {
          'Du brut au net': [
            {
              type: 'exemple',
              enonce: "Salaire brut de 5'000.00 ; retenues données par l'énoncé : AVS/AI/APG/AC 6,4 %, LPP 4 %.",
              calcul: ["Retenue AVS/AI/APG/AC : 5'000.00 × 6,4 % = 320.00.", "Retenue LPP : 5'000.00 × 4 % = 200.00.", "Salaire net : 5'000.00 − 320.00 − 200.00 = 4'480.00."],
            },
          ],
          Comptabilisation: [
            {
              type: 'exemple',
              enonce: 'Le salaire ci-dessus, versé par la banque, en une écriture composée.',
              raisonnement: r3('Salaires, Dette AVS, Dette LPP et Banque.', 'Une charge, deux passifs et un actif.', 'La charge augmente au débit pour le brut ; les dettes augmentent et la banque diminue au crédit.'),
              lignes: [D('5200', 5000), C('2170', 320), C('2171', 200), C('1020', 4480)],
              effets: { actif: "Banque − 4'480.00", passif: 'Dettes envers les assurances + 520.00', resultat: "Charges + 5'000.00" },
              variante: {
                enonce: "Cotisations de l'employeur, aux mêmes taux.",
                texte: ["Elles s'ajoutent au salaire : le coût total de l'employé est de 5'520.00 pour le mois."],
                lignes: [D('5270', 520), C('2170', 320), C('2171', 200)],
              },
            },
            { type: 'compteT', compte: '2170', debit: [P('Paiement à la caisse', 640)], credit: [P("Retenue de l'employé", 320), P("Part de l'employeur", 320)] },
            {
              type: 'tableau',
              entetes: ['Point de vue', 'Montant', 'CHF'],
              lignes: [["L'employé", 'Salaire net reçu', "4'480.00"], ['Le contrat', 'Salaire brut', "5'000.00"], ["L'employeur", 'Brut + charges sociales', "5'520.00"]],
            },
            { type: 'ecritures', exemples: [{ cas: 'Avance sur salaire de 800.00 virée par la banque', lignes: s('1140', '1020', 800) }] },
          ],
        },
        sections: [
          {
            titre: 'La déclaration annuelle des salaires',
            blocs: [
              p("Pendant l'année, l'employeur verse des acomptes à la caisse de compensation. À la fin de l'année, il déclare les salaires réellement versés : la caisse calcule ce qui est dû et réclame la différence, ou la rembourse."),
              p("Les cotisations se calculent sur la masse salariale. Elles sont payées pour moitié par l'employé et pour moitié par l'employeur."),
              {
                type: 'exemple',
                enonce: "Deux employés à 5'000.00 et 4'000.00 par mois, douze salaires ; taux donnés : AVS/AI/APG 5,3 % + 5,3 %, AC 1,1 % + 1,1 % ; acomptes versés 13'200.00.",
                calcul: [
                  "Masse salariale : 12 × 5'000.00 + 12 × 4'000.00 = 108'000.00.",
                  "AVS/AI/APG : 108'000.00 × 10,6 % = 11'448.00.",
                  "AC : 108'000.00 × 2,2 % = 2'376.00.",
                  "Total dû : 13'824.00. Solde à payer : 13'824.00 − 13'200.00 = 624.00.",
                ],
              },
            ],
          },
        ],
        erreurs: [
          { erreur: 'Passer en charge le salaire net seulement.', correction: 'Le compte Salaires est débité du brut : les retenues font partie du coût du salaire.' },
          { erreur: "Oublier la part de l'employeur.", correction: "L'employeur paie ses propres cotisations, en Charges sociales, en plus du salaire." },
          { erreur: 'Passer une avance en charge.', correction: 'Une avance est un prêt à l’employé : Avances de salaire, à l’actif.' },
          { erreur: 'Utiliser des taux appris par cœur.', correction: "Les taux changent : on prend ceux de l'énoncé ou de la fiche de salaire." },
        ],
        questions: [
          { question: "Salaire brut 6'000.00, retenues AVS 384.00 et LPP 300.00. Quel est le net ?", reponse: "6'000.00 − 684.00 = 5'316.00." },
          { question: 'Pourquoi la dette envers la caisse AVS est-elle le double de la retenue ?', reponse: "Parce qu'elle réunit la retenue de l'employé et la cotisation de l'employeur, du même montant." },
          { question: "Masse salariale 90'000.00, taux total AVS/AI/APG 10,6 %. Quelle est la part retenue aux employés ?", reponse: "90'000.00 × 5,3 % = 4'770.00." },
          { question: "Le paiement à la caisse AVS est-il une charge ?", reponse: 'Non : la charge a été comptée avec le salaire. Le paiement éteint la dette.' },
        ],
        liens: { module: 'salaires-ecritures', exercices: ['prop-cfc2-jardins-morel-salaires', 'dossier-cfc3-boulangerie-au-bon-grain-salaires'] },
      }),

      // ───────────────────────────────────────────────────────────── Facturation et paiements (nouveau)
      enrichir(
        vide('facturation', 'Facturation et paiements', 'Établir une facture, payer celles que l’on reçoit, contrôler celles que l’on a envoyées.', [
          {
            titre: 'Ce que contient une facture',
            blocs: [
              p("La facture réclame le prix d'une livraison ou d'un service. Elle sert de pièce justificative au vendeur comme à l'acheteur, et permet à l'acheteur assujetti de récupérer la TVA."),
              {
                type: 'liste',
                items: [
                  'Nom, adresse et numéro de TVA du fournisseur.',
                  'Nom et adresse du client.',
                  'Date ou période de la livraison.',
                  'Nature et quantité des marchandises ou des services.',
                  'Montant de la contre-prestation (le prix).',
                  'Taux et montant de la TVA.',
                ],
              },
              p("Le numéro de téléphone du client ou la signature du fournisseur peuvent y figurer, mais ne sont pas exigés."),
            ],
          },
          {
            titre: 'Calculer le total',
            blocs: [
              p('On calcule ligne par ligne, puis on applique le rabais, puis la TVA. La TVA est arrondie aux 5 centimes.'),
              {
                type: 'exemple',
                enonce: 'Facture du 3 mars : 4 casques à 120.00 et 2 antivols à 85.00 ; rabais de 10 % ; TVA 8,1 %.',
                calcul: [
                  'Casques : 4 × 120.00 = 480.00. Antivols : 2 × 85.00 = 170.00. Total brut : 650.00.',
                  'Rabais : 650.00 × 10 % = 65.00. Total net hors taxe : 585.00.',
                  'TVA : 585.00 × 8,1 % = 47.385, arrondi à 47.40.',
                  'Total à payer : 585.00 + 47.40 = 632.40.',
                ],
                lignes: [D('1100', 632.4), C('3200', 585), C('2200', 47.4)],
                conclusion: 'Le rabais se déduit avant la TVA : la TVA se calcule sur ce que le client paie réellement, hors taxe.',
              },
            ],
          },
          {
            titre: "L'échéance et l'escompte",
            blocs: [
              p("L'échéance est le dernier jour pour payer. Avec un délai de 30 jours, on ajoute 30 jours à la date de la facture."),
              p("Le vendeur peut offrir un escompte à qui paie vite, par exemple 2 % dans les 10 jours. L'escompte se calcule sur le total TVA comprise et s'arrondit aux 5 centimes. Le dixième jour est encore dans le délai."),
              {
                type: 'exemple',
                enonce: 'Facture du 3 mars, 632.40, payable à 30 jours, 2 % d’escompte à 10 jours.',
                calcul: ['Échéance : 3 mars + 30 jours = 2 avril.', "Escompte possible jusqu'au 13 mars compris.", 'Escompte : 632.40 × 2 % = 12.648, arrondi à 12.65.', 'Montant à payer avec escompte : 632.40 − 12.65 = 619.75.'],
              },
            ],
          },
          {
            titre: 'Payer une facture reçue',
            blocs: [
              p("L'ordre de paiement reprend exactement les indications de la facture : le bénéficiaire, son IBAN, la référence, la date d'exécution et le montant."),
              p("On ne déduit l'escompte que si le paiement part dans le délai. Passé ce délai, on paie le montant entier, au plus tard à l'échéance."),
            ],
          },
          {
            titre: 'Contrôler les paiements reçus',
            blocs: [
              p('Pour chaque facture envoyée, on compare ce qui a été reçu à ce qui était dû, et la date du paiement aux délais.'),
              {
                type: 'tableau',
                entetes: ['Ce que le client a fait', 'Situation', 'Suite'],
                lignes: [
                  ['Montant entier', 'Payée', 'La créance est éteinte'],
                  ['Montant avec escompte, dans le délai', 'Payée, escompte justifié', 'La créance est éteinte'],
                  ['Montant avec escompte, après le délai', 'Escompte déduit hors délai', 'Le solde est à réclamer'],
                  ['Une partie seulement', 'Paiement partiel', 'Le solde est à relancer'],
                  ['Rien, échéance dépassée', 'Non payée, échue', 'À relancer'],
                  ['Rien, échéance à venir', 'Non payée, pas encore échue', 'Rien à faire pour le moment'],
                ],
              },
              {
                type: 'exemple',
                enonce: "Le client de la facture de 632.40 verse 619.75 le 20 mars, alors que l'escompte n'était valable que jusqu'au 13 mars.",
                calcul: ["L'escompte n'est pas accepté. Seul le montant reçu est encaissé.", 'Il reste 632.40 − 619.75 = 12.65 dans Créances clients.'],
                lignes: s('1020', '1100', 619.75),
              },
            ],
          },
        ]),
        {
          objectifs: [
            'Établir une facture : total, rabais, TVA, échéance, escompte.',
            'Préparer un ordre de paiement sans erreur.',
            "Contrôler si un client a payé ce qu'il devait, à temps.",
          ],
          termes: [
            { terme: 'Échéance', definition: 'dernier jour pour payer la facture.' },
            { terme: 'Rabais', definition: 'réduction accordée sur le prix, déduite avant la TVA.' },
            { terme: 'Escompte', definition: 'réduction accordée pour un paiement rapide.' },
            { terme: 'IBAN', definition: 'numéro international du compte bancaire du bénéficiaire.' },
            { terme: 'Facture échue', definition: "facture dont l'échéance est dépassée." },
          ],
          erreurs: [
            { erreur: 'Calculer la TVA avant le rabais.', correction: 'On déduit le rabais, puis on calcule la TVA sur le total net hors taxe.' },
            { erreur: "Calculer l'escompte sur le montant hors taxe.", correction: "L'escompte se calcule sur le total TVA comprise." },
            { erreur: "Déduire l'escompte après le délai.", correction: "Hors délai, l'escompte n'est plus dû : on paie le montant entier." },
            { erreur: "Recopier un IBAN ou une référence avec une erreur.", correction: 'Le paiement risque de ne pas arriver : on contrôle chaque caractère sur la facture.' },
          ],
          questions: [
            { question: 'Facture du 12 mai à 30 jours. Quelle est son échéance ?', reponse: 'Le 11 juin : il reste 19 jours en mai, puis 11 jours en juin.' },
            { question: 'Total net hors taxe 1’200.00, TVA 8,1 %. Quel est le total de la facture ?', reponse: "TVA : 97.20. Total : 1'297.20." },
            { question: "Facture de 540.50 TVA comprise, 2 % d'escompte. Combien paie-t-on dans le délai ?", reponse: 'Escompte : 10.81, arrondi à 10.80. À payer : 529.70.' },
            { question: "Un client paie avec l'escompte trois jours après le délai. Que fait-on ?", reponse: "On encaisse ce qu'il a versé et le solde reste dû : l'escompte n'est pas accepté." },
          ],
          liens: { exercices: ['dossier-cfc2-cycles-du-leman-facturation'] },
        },
      ),

      // ─────────────────────────────────────────────────────────────────── Budget et écarts (nouveau)
      enrichir(
        vide('budget', 'Budget et analyse des écarts', 'Prévoir les produits et les charges, puis comparer avec ce qui s’est réellement passé.', [
          {
            titre: 'À quoi sert un budget ?',
            blocs: [
              p("Un budget est une prévision chiffrée : ce que l'entreprise pense vendre, ce qu'elle pense dépenser, et le résultat qu'elle en attend. Il sert à décider avant d'agir : cette action vaut-elle la peine ?"),
              p("Il sert ensuite de point de comparaison. Une fois l'action terminée, on met les chiffres réels en face des chiffres prévus."),
            ],
          },
          {
            titre: 'Préparer le budget',
            blocs: [
              p('On liste les produits attendus, puis les charges, poste par poste. Le résultat prévu est la différence entre les deux totaux.'),
              {
                type: 'exemple',
                enonce: "Une journée de promotion : ventes prévues 6'000.00 ; marchandises 3'200.00, location du stand 600.00, publicité 400.00.",
                calcul: ["Total des produits : 6'000.00.", "Total des charges : 3'200.00 + 600.00 + 400.00 = 4'200.00.", "Résultat prévu : 6'000.00 − 4'200.00 = 1'800.00."],
              },
            ],
          },
          {
            titre: "Comparer : l'écart",
            blocs: [
              p("L'écart est la différence entre le montant effectif et le montant du budget. On l'exprime aussi en pour cent du budget, à une décimale."),
              { type: 'retenir', texte: 'Écart = effectif − budget. Écart en % = écart ÷ budget × 100.' },
              {
                type: 'tableau',
                entetes: ['Poste', 'Budget', 'Effectif', 'Écart', 'Écart en %', 'Appréciation'],
                lignes: [
                  ['Ventes', "6'000.00", "6'600.00", '+600.00', '+10,0 %', 'Favorable'],
                  ['Marchandises', "3'200.00", "3'520.00", '+320.00', '+10,0 %', 'Défavorable'],
                  ['Location du stand', '600.00', '660.00', '+60.00', '+10,0 %', 'Défavorable'],
                  ['Publicité', '400.00', '400.00', '0.00', '0,0 %', 'Conforme'],
                  ['Résultat', "1'800.00", "2'020.00", '+220.00', '+12,2 %', 'Favorable'],
                ],
              },
              {
                type: 'contraste',
                cas: [
                  { titre: 'Un produit plus élevé que prévu', texte: ["L'entreprise a encaissé davantage : l'écart est favorable.", 'Le résultat s’apprécie de la même façon.'] },
                  { titre: 'Une charge plus élevée que prévu', texte: ["L'entreprise a dépensé davantage : l'écart est défavorable.", 'Un écart nul est conforme.'] },
                ],
              },
            ],
          },
          {
            titre: 'Chercher la cause',
            blocs: [
              p("Un écart ne dit pas pourquoi. Il faut revenir aux faits : a-t-on vendu plus de pièces, ou plus cher ? Le fournisseur a-t-il augmenté ses prix ? Une dépense a-t-elle été oubliée dans le budget ?"),
              p("Dans l'exemple, les ventes et les marchandises ont augmenté dans la même proportion : on a simplement vendu davantage. La location, elle, a coûté plus cher que prévu sans rien rapporter de plus."),
            ],
          },
        ]),
        {
          objectifs: ['Préparer un budget et calculer le résultat prévu.', 'Calculer un écart en francs et en pour cent.', 'Dire si un écart est favorable, défavorable ou conforme.'],
          termes: [
            { terme: 'Budget', definition: 'prévision chiffrée des produits et des charges.' },
            { terme: 'Effectif', definition: 'montant réellement constaté.' },
            { terme: 'Écart', definition: 'effectif moins budget.' },
            { terme: 'Favorable, défavorable', definition: "qui améliore le résultat par rapport à la prévision, ou qui le dégrade." },
          ],
          erreurs: [
            { erreur: "Calculer l'écart dans le mauvais sens.", correction: "L'écart est l'effectif moins le budget, jamais l'inverse." },
            { erreur: "Diviser l'écart par l'effectif.", correction: "Le pourcentage se calcule sur le budget : c'est lui la référence." },
            { erreur: 'Juger favorable tout écart positif.', correction: 'Un écart positif est favorable pour un produit, défavorable pour une charge.' },
          ],
          questions: [
            { question: "Budget des ventes 8'000.00, effectif 7'400.00. Quel est l'écart, et son appréciation ?", reponse: "−600.00, soit −7,5 % : défavorable, car c'est un produit." },
            { question: "Budget de publicité 500.00, effectif 450.00. Appréciation ?", reponse: 'Écart de −50.00, soit −10,0 % : favorable, car une charge plus basse améliore le résultat.' },
            { question: "Produits prévus 9'000.00, charges prévues 7'300.00. Quel est le résultat prévu ?", reponse: "1'700.00." },
            { question: 'Les ventes et le coût des marchandises augmentent tous deux de 10 %. Quelle est la cause la plus probable ?', reponse: 'Les quantités vendues ont augmenté.' },
          ],
          liens: { exercices: ['budget-cfc2-cycles-du-leman-journee', 'budget-cfc2-cycles-du-leman-trimestre'] },
        },
      ),

      // ─────────────────────────────────────── Marge contributive et répartition des coûts (nouveau, option Finances)
      enrichir(
        vide('couts', 'Marge contributive et répartition des coûts', 'Savoir ce que chaque vente laisse, à partir de combien l’entreprise gagne, et ce que coûte chaque secteur.', [
          {
            titre: 'Coûts variables et charges fixes',
            blocs: [
              p("Certains coûts suivent les ventes : chaque article vendu a coûté son prix d'achat. Ce sont les coûts variables. D'autres tombent quoi qu'il arrive : le loyer, les salaires fixes, les assurances. Ce sont les charges fixes."),
              {
                type: 'contraste',
                cas: [
                  { titre: 'Coût variable', texte: ['Il augmente avec chaque unité vendue.', 'Exemple : la marchandise, l’emballage.'] },
                  { titre: 'Charge fixe', texte: ['Elle ne dépend pas des quantités vendues.', 'Exemple : le loyer, un salaire mensuel.'] },
                ],
              },
            ],
          },
          {
            titre: 'La marge contributive',
            blocs: [
              p("La marge contributive est ce qui reste d'une vente une fois son coût variable payé. Elle sert d'abord à couvrir les charges fixes ; ce qui dépasse est le bénéfice."),
              {
                type: 'exemple',
                enonce: "Prix de vente 20.00, coût variable 12.00, charges fixes 4'000.00 ; 700 pièces vendues.",
                calcul: ['Marge contributive par pièce : 20.00 − 12.00 = 8.00.', "Marge contributive totale : 700 × 8.00 = 5'600.00.", "Résultat : 5'600.00 − 4'000.00 = 1'600.00 de bénéfice."],
              },
              { type: 'retenir', texte: 'Marge contributive par pièce = prix de vente − coût variable. Résultat = marge contributive totale − charges fixes.' },
            ],
          },
          {
            titre: 'Le seuil de rentabilité',
            blocs: [
              p("Le seuil de rentabilité est la quantité à vendre pour ne faire ni bénéfice ni perte : la marge contributive couvre alors exactement les charges fixes."),
              {
                type: 'exemple',
                enonce: 'Même produit : combien de pièces faut-il vendre pour couvrir les charges fixes ?',
                calcul: ["Seuil : 4'000.00 ÷ 8.00 = 500 pièces.", 'En dessous de 500 pièces : une perte. Au-dessus : un bénéfice.'],
                variante: { enonce: 'Le prix de vente baisse à 18.00.', texte: ["La marge par pièce tombe à 6.00. Nouveau seuil : 4'000.00 ÷ 6.00 = 666,7, soit 667 pièces."] },
              },
              { type: 'retenir', texte: 'Seuil = charges fixes ÷ marge contributive par pièce.' },
            ],
          },
          {
            titre: 'Répartir les charges indirectes',
            blocs: [
              p("Le loyer sert à la fois au magasin, au bureau et à l'entrepôt. Pour savoir ce que coûte chaque secteur, on répartit ces charges communes entre des centres de coûts, selon une clé en pour cent."),
              {
                type: 'tableau',
                entetes: ['Charge', 'Achat', 'Vente', 'Administration'],
                lignes: [
                  ['Loyer (20 % / 50 % / 30 %)', "2'400.00", "6'000.00", "3'600.00"],
                  ['Salaires (25 % / 50 % / 25 %)', "10'000.00", "20'000.00", "10'000.00"],
                  ['Total du centre', "12'400.00", "26'000.00", "13'600.00"],
                ],
              },
              p("Le loyer est de 12'000.00 et les salaires de 40'000.00. Le total des trois centres, 52'000.00, retrouve exactement le total des charges réparties."),
            ],
          },
        ]),
        {
          objectifs: ['Distinguer un coût variable d’une charge fixe.', 'Calculer une marge contributive, un résultat et un seuil de rentabilité.', 'Répartir une charge indirecte entre des centres de coûts.'],
          termes: [
            { terme: 'Coût variable', definition: 'coût qui augmente avec chaque unité vendue.' },
            { terme: 'Charges fixes', definition: 'charges indépendantes des quantités vendues.' },
            { terme: 'Marge contributive', definition: 'prix de vente moins coût variable.' },
            { terme: 'Seuil de rentabilité', definition: 'quantité vendue pour laquelle le résultat est nul.' },
            { terme: 'Centre de coûts', definition: "secteur de l'entreprise dont on veut connaître le coût." },
            { terme: 'Clé de répartition', definition: "règle de partage d'une charge, en pour cent." },
          ],
          erreurs: [
            { erreur: 'Diviser les charges fixes par le prix de vente.', correction: 'On divise par la marge contributive par pièce, pas par le prix.' },
            { erreur: 'Arrondir le seuil vers le bas.', correction: "À 666 pièces, il manque encore un peu de marge : on arrondit à la pièce supérieure." },
            { erreur: 'Une répartition dont le total ne retrouve pas la charge.', correction: 'Les pourcentages d’une clé font 100 % : la somme des parts est égale à la charge.' },
          ],
          questions: [
            { question: "Prix 50.00, coût variable 30.00, charges fixes 12'000.00. Quel est le seuil de rentabilité ?", reponse: "Marge par pièce : 20.00. Seuil : 12'000.00 ÷ 20.00 = 600 pièces." },
            { question: 'Avec les mêmes chiffres, quel est le résultat pour 750 pièces vendues ?', reponse: "750 × 20.00 = 15'000.00 de marge, moins 12'000.00 : bénéfice de 3'000.00." },
            { question: "Une assurance de 3'000.00 est répartie 10 % / 60 % / 30 %. Combien reçoit le deuxième centre ?", reponse: "3'000.00 × 60 % = 1'800.00." },
            { question: 'Le loyer augmente. Le seuil de rentabilité monte-t-il ou descend-il ?', reponse: 'Il monte : il faut vendre davantage pour couvrir des charges fixes plus élevées.' },
          ],
          liens: { module: 'marge-contributive' },
        },
      ),
    ],
  };

  return chapitres.flatMap((c) => enrichis[c.id] ?? [c]);
}
