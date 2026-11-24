// Théorie enrichie de la maturité professionnelle (modèle du 24.11.2026). Les douze chapitres validés sont enrichis sans
// rien retirer ; un chapitre nouveau, « Comptabilité analytique », explique un module existant du parcours Apprendre.
// Les sections nouvelles reprennent les règles déjà programmées (src/engine/calculs.ts) : intérêts en année commerciale,
// méthode des nombres, perte de capital et surendettement, bordereau et rendements, point mort, méthode directe.
// Texte original ; comptes du plan du cours ; règles du projet (CLAUDE.md). Contenu À RELIRE par l'enseignant (aRelire).
import type { Chapitre } from './theorie';
import { C, D, P, enrichir, p, r3, s } from './theorie-cfc1';

/** Remplace les chapitres de maturité par leur version enrichie et ajoute, après le seuil de rentabilité, la comptabilité analytique. */
export function enrichirMp(chapitres: Chapitre[]): Chapitre[] {
  const de = (id: string) => chapitres.find((c) => c.id === id)!;

  const enrichis: Record<string, Chapitre[]> = {
    // ─────────────────────────────────────────────────────────────────────── Monnaies étrangères
    monnaies: [
      enrichir(de('monnaies'), {
        objectifs: [
          'Choisir le bon cours : billets ou devises, achat ou vente.',
          'Convertir en francs une facture en monnaie étrangère.',
          'Comptabiliser la différence de change au paiement.',
        ],
        termes: [
          { terme: 'Devises', definition: "monnaie étrangère échangée par virement, d'un compte à un autre." },
          { terme: 'Billets', definition: 'monnaie étrangère échangée en espèces, au guichet.' },
          { terme: 'Cours achat', definition: 'cours auquel la banque achète la monnaie étrangère.' },
          { terme: 'Cours vente', definition: 'cours auquel la banque vend la monnaie étrangère.' },
          { terme: 'Différence de change', definition: 'écart entre le montant comptabilisé à la facture et le montant payé ou encaissé.' },
        ],
        apres: {
          'Cours achat et cours vente': [
            p("Le cours se lit toujours du point de vue de la banque. C'est elle qui achète ou qui vend la monnaie étrangère."),
            {
              type: 'contraste',
              cas: [
                { titre: "L'entreprise a besoin de monnaie étrangère", texte: ['Elle paie un fournisseur étranger, ou elle retire des billets pour un voyage.', 'La banque vend : cours vente.'] },
                { titre: "L'entreprise remet de la monnaie étrangère", texte: ['Un client étranger la paie, ou elle rapporte des billets.', 'La banque achète : cours achat.'] },
              ],
            },
            {
              type: 'exemple',
              enonce: "L'entreprise paie par virement EUR 2'500.00 à un fournisseur. Devises : achat 0.9390, vente 0.9550.",
              calcul: ["Virement : cours des devises. L'entreprise a besoin d'euros : cours vente.", "2'500.00 × 0.9550 = CHF 2'387.50."],
              variante: { enonce: "Facture de JPY 200'000, cours vente 0.58 pour 100 yens.", texte: ["200'000 × 0.58 ÷ 100 = CHF 1'160.00."] },
            },
          ],
          'Achat de marchandises à l’étranger': [
            {
              type: 'exemple',
              enonce: "Facture d'un fournisseur américain, USD 4'000.00, comptabilisée au cours vente de 0.88. Elle est payée par la banque au cours vente de 0.90.",
              raisonnement: r3('Dettes fournisseurs, Banque et Achats de marchandises.', 'Un passif, un actif et une charge.', "La dette s'éteint au débit ; la banque diminue au crédit ; la perte de change augmente les achats au débit."),
              calcul: ["À la facture : 4'000.00 × 0.88 = 3'520.00.", "Au paiement : 4'000.00 × 0.90 = 3'600.00.", 'Perte de change : 80.00.'],
              lignes: [D('2000', 3520), D('4200', 80), C('1020', 3600)],
              effets: { actif: "Banque − 3'600.00", passif: "Dettes fournisseurs − 3'520.00", resultat: 'Charges + 80.00' },
              conclusion: 'La marchandise a finalement coûté 3’600.00 : le compte Achats le montre.',
            },
          ],
          'Vente de marchandises à l’étranger': [
            {
              type: 'exemple',
              enonce: "Facture à un client français, EUR 6'000.00, comptabilisée au cours achat de 0.94. Le client paie quand le cours achat est de 0.95.",
              calcul: ["À la facture : 6'000.00 × 0.94 = 5'640.00.", "À l'encaissement : 6'000.00 × 0.95 = 5'700.00.", 'Gain de change : 60.00.'],
              lignes: [D('1020', 5700), C('1100', 5640), C('3200', 60)],
              effets: { actif: 'Banque + 5’700.00 ; Créances clients − 5’640.00', resultat: 'Produits + 60.00' },
            },
            { type: 'retenir', texte: "Dans ce cours, la différence de change n'a pas de compte séparé : elle corrige les achats ou les ventes de marchandises." },
          ],
        },
        erreurs: [
          { erreur: 'Prendre le cours du point de vue de l’entreprise.', correction: "Le cours achat et le cours vente sont ceux de la banque : quand l'entreprise achète des euros, la banque vend." },
          { erreur: 'Utiliser le cours des billets pour un virement.', correction: 'Virement : devises. Espèces : billets.' },
          { erreur: 'Oublier de diviser par 100.', correction: 'Certains cours sont donnés pour 100 unités : on divise alors le résultat par 100.' },
          { erreur: 'Passer la différence de change en charges financières.', correction: 'Dans ce cours, elle va dans Achats de marchandises ou dans Ventes de marchandises.' },
        ],
        questions: [
          { question: "Un client anglais verse GBP 1'000.00 sur le compte de l'entreprise. Quel cours ?", reponse: 'Le cours achat des devises : la banque achète les livres reçues par virement.' },
          { question: "Facture fournisseur de EUR 3'000.00 au cours de 0.96, payée au cours de 0.94. Gain ou perte ?", reponse: "Comptabilisé 2'880.00, payé 2'820.00 : gain de change de 60.00, au crédit des Achats de marchandises." },
          { question: "Facture client de USD 5'000.00 au cours de 0.90, encaissée au cours de 0.88. Quelle écriture ?", reponse: "Banque 4'400.00 et Ventes de marchandises 100.00 au débit ; Créances clients 4'500.00 au crédit." },
          { question: 'Le cours vente est-il plus haut ou plus bas que le cours achat ?', reponse: 'Plus haut : la banque vend plus cher qu’elle n’achète.' },
        ],
        liens: { module: 'devises', exercices: ['dossier-mp1-terroirs-du-monde'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────── Rémunération du propriétaire
    proprietaire: [
      enrichir(de('proprietaire'), {
        objectifs: [
          "Comptabiliser le salaire du propriétaire et l'intérêt sur son capital.",
          "Calculer le revenu de l'entrepreneur.",
          'Expliquer pourquoi ces écritures ne changent pas ce revenu.',
        ],
        termes: [
          { terme: 'Écriture interne', definition: "écriture sans mouvement d'argent, passée pour mieux mesurer le résultat." },
          { terme: 'Salaire du propriétaire', definition: 'rémunération calculée de son travail.' },
          { terme: 'Intérêt sur le capital', definition: "rémunération calculée du capital qu'il a investi." },
          { terme: "Revenu de l'entrepreneur", definition: 'salaire + intérêt + résultat.' },
        ],
        apres: {
          'Pourquoi des écritures internes ?': [
            {
              type: 'exemple',
              enonce: "Le propriétaire compte un salaire de 72'000.00 pour l'année.",
              raisonnement: r3('Salaires et Privé.', 'Une charge et un compte de capitaux propres.', "La charge augmente au débit ; le Privé augmente au crédit : l'entreprise doit ce salaire au propriétaire."),
              lignes: s('5200', '2850', 72000),
              effets: { passif: "Privé + 72'000.00", resultat: "Charges + 72'000.00 : le bénéfice diminue" },
              conclusion: "La banque n'est pas touchée. Quand le propriétaire retire de l'argent, c'est un prélèvement ordinaire, au débit du Privé.",
              variante: { enonce: "Intérêt de 4 % sur un capital de 150'000.00.", texte: ["150'000.00 × 4 % = 6'000.00."], lignes: s('6900', '2850', 6000) },
            },
          ],
          "Le revenu de l'entrepreneur": [
            {
              type: 'contraste',
              cas: [
                { titre: 'Sans écritures internes', texte: ["Bénéfice de l'exercice : 79'000.00.", "Revenu de l'entrepreneur : 79'000.00."] },
                { titre: 'Avec écritures internes', texte: ["Salaire 60'000.00, intérêt 4'000.00, bénéfice 15'000.00.", "Revenu de l'entrepreneur : 79'000.00."] },
              ],
            },
            p("Le revenu est le même. Mais le bénéfice de 15'000.00 dit autre chose : c'est ce qui reste une fois le travail et le capital du propriétaire rémunérés. On peut alors le comparer à celui d'une société, qui paie ses dirigeants."),
            { type: 'compteT', compte: '2850', debit: [P("Retraits de l'année", 50000), P('Solde avant bouclement', 14000)], credit: [P('Salaire du propriétaire', 60000), P('Intérêt sur le capital', 4000)] },
          ],
        },
        erreurs: [
          { erreur: 'Créditer la banque.', correction: "Aucun argent ne sort : la contrepartie du salaire et de l'intérêt est le compte Privé." },
          { erreur: 'Croire que le propriétaire gagne davantage.', correction: "Le revenu de l'entrepreneur ne change pas : une partie du bénéfice est seulement appelée salaire ou intérêt." },
          { erreur: 'Passer un retrait du propriétaire en Salaires.', correction: 'Un retrait est un prélèvement : au débit du Privé. Le salaire calculé est une écriture distincte.' },
        ],
        questions: [
          { question: "Salaire 54'000.00, intérêt 3'000.00, bénéfice 21'000.00. Revenu de l'entrepreneur ?", reponse: "78'000.00." },
          { question: "Capital de 120'000.00, intérêt de 3 %. Quelle écriture ?", reponse: "Charges financières / Privé, 3'600.00." },
          { question: "Sans écritures internes, le bénéfice serait-il plus haut ou plus bas ?", reponse: 'Plus haut, du montant du salaire et de l’intérêt.' },
          { question: 'Ces écritures sont-elles obligatoires ?', reponse: 'Non : elles sont internes et facultatives.' },
        ],
        liens: { exercices: ['dossier-mp2-atelier-zufferey'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Sociétés
    societes: [
      enrichir(de('societes'), {
        objectifs: [
          "Comptabiliser la fondation et l'augmentation du capital d'une SA.",
          'Répartir un bénéfice selon le droit révisé et comptabiliser le dividende.',
          'Reconnaître une perte de capital et un surendettement.',
        ],
        termes: [
          { terme: 'Valeur nominale', definition: "montant inscrit sur l'action ; la somme des valeurs nominales forme le capital-actions." },
          { terme: 'Souscription', definition: "engagement de l'actionnaire de payer ses actions." },
          { terme: 'Libération', definition: 'paiement effectif des actions, en espèces ou en nature.' },
          { terme: 'Agio', definition: "prime d'émission : ce que l'actionnaire paie en plus de la valeur nominale." },
          { terme: 'Réserve', definition: 'bénéfice non distribué, ou agio, conservé dans la société.' },
          { terme: 'Dividende', definition: 'part du bénéfice distribuée aux actionnaires.' },
          { terme: 'Impôt anticipé', definition: "impôt de 35 % retenu sur le dividende et versé à l'AFC." },
        ],
        apres: {
          "Les capitaux propres d'une société": [
            {
              type: 'contraste',
              cas: [
                { titre: 'Raison individuelle', texte: ['Un compte Capital et un compte Privé.', 'Le résultat rejoint le capital du propriétaire.'] },
                { titre: 'Société anonyme', texte: ['Capital-actions, réserves et bénéfice reporté ; pas de compte Privé.', "Le résultat est viré à Bénéfice reporté ; l'assemblée générale décide de son emploi."] },
              ],
            },
          ],
          'Répartition selon le droit révisé (art. 672 CO)': [
            {
              type: 'exemple',
              enonce: "Bénéfice de l'exercice 80'000.00 ; perte reportée 10'000.00 ; capital-actions 200'000.00 ; réserves légales 30'000.00. L'assemblée générale décide un dividende de 40'000.00.",
              calcul: [
                "Bénéfice après compensation de la perte : 80'000.00 − 10'000.00 = 70'000.00.",
                "Les réserves légales (30'000.00) n'atteignent pas 50 % du capital (100'000.00) : l'attribution est due.",
                "Réserve légale issue du bénéfice : 70'000.00 × 5 % = 3'500.00.",
                "Solde reporté : 70'000.00 − 3'500.00 − 40'000.00 = 26'500.00.",
              ],
              lignes: [D('2970', 43500), C('2950', 3500), C('2230', 40000)],
              effets: { passif: "Bénéfice reporté − 43'500.00 ; Réserves + 3'500.00 ; Dividendes + 40'000.00", resultat: 'Aucun effet' },
              conclusion: "La répartition ne passe par aucun compte de charge : elle déplace des montants à l'intérieur du passif.",
              variante: {
                enonce: "Même société, mais les réserves légales atteignent déjà 100'000.00.",
                texte: ["Elles représentent 50 % du capital : l'attribution de 5 % n'est plus obligatoire."],
              },
            },
            { type: 'compteT', compte: '2970', debit: [P('Perte reportée', 10000), P('Réserve légale', 3500), P('Dividendes', 40000), P('SF', 26500)], credit: [P("Bénéfice de l'exercice", 80000)] },
          ],
          'Impôt anticipé sur les dividendes': [
            {
              type: 'exemple',
              enonce: "Paiement du dividende de 40'000.00 par la banque.",
              calcul: ["Impôt anticipé : 40'000.00 × 35 % = 14'000.00.", "Versé aux actionnaires : 40'000.00 × 65 % = 26'000.00."],
              lignes: [D('2230', 40000), C('1020', 26000), C('2205', 14000)],
              effets: { actif: "Banque − 26'000.00", passif: "Dividendes − 40'000.00 ; Dettes AFC + 14'000.00" },
            },
          ],
        },
        sections: [
          {
            titre: 'Perte de capital et surendettement',
            blocs: [
              p("Quand une société accumule les pertes, ses fonds propres fondent. La loi fixe deux seuils d'alerte, que l'on contrôle d'après le bilan."),
              {
                type: 'contraste',
                cas: [
                  { titre: 'Perte de capital (art. 725a CO)', texte: ['Les actifs, déduction faite des dettes, ne couvrent plus la moitié du capital-actions et des réserves légales.'] },
                  { titre: 'Surendettement (art. 725b CO)', texte: ['Les dettes ne sont plus couvertes par les actifs : les fonds propres sont négatifs.'] },
                ],
              },
              {
                type: 'exemple',
                enonce: "Actifs 500'000.00, dettes 410'000.00 ; capital-actions 200'000.00, réserves légales 40'000.00.",
                calcul: [
                  "Fonds propres : 500'000.00 − 410'000.00 = 90'000.00.",
                  "Moitié du capital-actions et des réserves légales : (200'000.00 + 40'000.00) ÷ 2 = 120'000.00.",
                  "90'000.00 est inférieur à 120'000.00 : il y a perte de capital.",
                ],
                variante: { enonce: "Les dettes montent à 520'000.00.", texte: ["Fonds propres : 500'000.00 − 520'000.00 = −20'000.00. La société est surendettée."] },
              },
              p("Dans les deux cas, la loi impose au conseil d'administration d'agir."),
            ],
          },
        ],
        erreurs: [
          { erreur: 'Calculer les 5 % avant de compenser la perte reportée.', correction: 'La perte reportée est déduite d’abord ; les 5 % se calculent sur ce qui reste.' },
          { erreur: "Créditer le capital-actions de l'agio.", correction: "Le capital-actions ne reçoit que la valeur nominale ; l'agio va aux Réserves légales issues du capital." },
          { erreur: "Porter les frais de fondation à l'actif.", correction: "Ce sont des charges de l'exercice : compte FAO." },
          { erreur: 'Verser le dividende entier aux actionnaires.', correction: "La société retient 35 % d'impôt anticipé, qu'elle doit à l'AFC." },
          { erreur: 'Virer le bénéfice au capital-actions.', correction: 'Dans une société, le résultat est viré à Bénéfice reporté.' },
        ],
        questions: [
          { question: "Bénéfice 120'000.00, aucune perte reportée, réserves légales encore faibles. Attribution à la réserve légale ?", reponse: "120'000.00 × 5 % = 6'000.00." },
          { question: "Dividende de 50'000.00. Combien reçoivent les actionnaires, combien l'AFC ?", reponse: "Actionnaires : 32'500.00. AFC : 17'500.00." },
          { question: '500 actions de 100.00 sont émises à 130.00. Quelle écriture de souscription ?', reponse: "Actionnaires 65'000.00 au débit ; Capital-actions 50'000.00 et Réserves légales issues du capital 15'000.00 au crédit." },
          { question: "Capital-actions 100'000.00, réserves légales 20'000.00, fonds propres 55'000.00. Perte de capital ?", reponse: "La moitié est de 60'000.00 ; 55'000.00 est inférieur : oui." },
          { question: 'Pourquoi une SA n’a-t-elle pas de compte Privé ?', reponse: 'Parce que la société est une personne distincte de ses actionnaires : ils ne peuvent recevoir que le dividende décidé.' },
        ],
        liens: { module: 'societes-ecritures', exercices: ['demo-mp-lemantec-sa', 'dossier-mp3-brasserie-du-mont-blanc-fondation', 'dossier-mp3-lemanbio-augmentation-capital'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Provisions
    provisions: [
      enrichir(de('provisions'), {
        objectifs: ["Distinguer une provision d'une dette.", "Comptabiliser la constitution, l'utilisation et la dissolution d'une provision."],
        termes: [
          { terme: 'Provision', definition: 'dette probable, dont le montant ou la date sont incertains.' },
          { terme: 'Constitution', definition: 'création ou augmentation de la provision, par une charge.' },
          { terme: 'Utilisation', definition: 'paiement de la dépense prévue, au débit de la provision.' },
          { terme: 'Dissolution', definition: "annulation d'une provision devenue inutile." },
        ],
        apres: {
          Principe: [
            {
              type: 'contraste',
              cas: [
                { titre: 'Une dette', texte: ['Le montant et le créancier sont connus.', 'Exemple : la facture reçue du garagiste.'] },
                { titre: 'Une provision', texte: ["La dépense est probable, mais son montant ou sa date sont incertains.", 'Exemple : une réparation décidée, pas encore devisée.'] },
              ],
            },
            p("La charge est ainsi comptée dans l'exercice où naît sa cause, et non dans celui où elle est payée."),
            {
              type: 'exemple',
              enonce: "Une provision de 5'000.00 a été constituée pour une réparation. La réparation coûte finalement 4'200.00, payés par la banque.",
              calcul: ["Utilisation : 4'200.00.", "Il reste 800.00 de provision sans objet : on la dissout par le compte de charge d'origine."],
              lignes: [...s('2600', '1020', 4200), ...s('2600', '6100', 800)],
              effets: { actif: "Banque − 4'200.00", passif: "Provision − 5'000.00", resultat: 'Charges − 800.00 : le bénéfice augmente' },
              variante: {
                enonce: "La réparation coûte 5'600.00.",
                texte: ['La provision ne suffit pas : les 600.00 de plus sont une charge de l’exercice.'],
                lignes: [D('2600', 5000), D('6100', 600), C('1020', 5600)],
              },
            },
            { type: 'compteT', compte: '2600', debit: [P('Paiement de la réparation', 4200), P('Dissolution', 800)], credit: [P('Constitution', 5000)] },
          ],
        },
        erreurs: [
          { erreur: 'Repasser la dépense en charge au moment du paiement.', correction: 'La charge a été comptée à la constitution : le paiement débite la provision.' },
          { erreur: 'Créditer la banque à la constitution.', correction: "Aucun argent ne sort : on crédite le compte de provision." },
          { erreur: 'Laisser au bilan une provision sans objet.', correction: 'Une provision devenue inutile est dissoute.' },
        ],
        questions: [
          { question: "Provision pour impôts de 6'000.00 à constituer. Quelle écriture ?", reponse: "Impôts / Provision pour impôts, 6'000.00." },
          { question: 'La constitution d’une provision augmente-t-elle ou diminue-t-elle le bénéfice ?', reponse: 'Elle le diminue : une charge est comptée.' },
          { question: "Provision pour réparations de 3'000.00 ; la facture payée est de 3'000.00. Quelle écriture ?", reponse: "Provision pour réparations / Banque, 3'000.00." },
          { question: "Quelle différence entre une provision et un passif transitoire ?", reponse: 'Le passif transitoire concerne une charge certaine de l’exercice, à payer peu après ; la provision couvre une dépense probable, au montant ou à la date incertains.' },
        ],
        liens: { module: 'titres-ecritures', exercices: ['dossier-mp4-precimeca-sa-titres-provisions'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Titres
    titres: [
      enrichir(de('titres'), {
        objectifs: [
          "Comptabiliser l'achat, la vente et les revenus de titres.",
          'Constater la différence de cours à la clôture.',
          "Établir un bordereau d'achat d'obligations et calculer un rendement.",
        ],
        termes: [
          { terme: 'Action', definition: "part du capital d'une société ; elle rapporte un dividende." },
          { terme: 'Obligation', definition: 'part d’un emprunt ; elle rapporte un intérêt fixe.' },
          { terme: 'Cours', definition: "prix du titre en bourse ; en pour cent de la valeur nominale pour une obligation." },
          { terme: 'Courtage', definition: "commission de la banque pour l'achat ou la vente." },
          { terme: 'Intérêt couru', definition: "intérêt de l'obligation depuis le dernier coupon, que l'acheteur paie au vendeur." },
          { terme: 'Rendement', definition: 'ce que le placement rapporte en un an, en pour cent du capital investi.' },
        ],
        apres: {
          'Clôture du compte Titres': [
            {
              type: 'exemple',
              enonce: "Le compte Titres a reçu l'achat de 100 actions (8'120.00) et la vente de 40 actions (3'740.00). Au 31.12, les 60 actions restantes cotent 78.00.",
              calcul: ["Solde du compte : 8'120.00 − 3'740.00 = 4'380.00.", "Inventaire : 60 × 78.00 = 4'680.00.", 'Différence : 300.00 de plus que le solde.'],
              lignes: s('1060', '6952', 300),
              effets: { actif: 'Titres + 300.00', resultat: 'Produits + 300.00' },
              conclusion: "Cette différence réunit le bénéfice réalisé sur les actions vendues et la variation de cours des actions gardées : on ne les calcule pas séparément.",
            },
            { type: 'compteT', compte: '1060', debit: [P('Achat de 100 actions', 8120), P('Différence de cours', 300)], credit: [P('Vente de 40 actions', 3740), P('SF (inventaire)', 4680)] },
          ],
        },
        sections: [
          {
            titre: "Bordereau d'achat d'obligations",
            blocs: [
              p("Le bordereau est le décompte que la banque remet après un achat. Pour une obligation, l'acheteur paie le prix au cours du jour, l'intérêt couru depuis le dernier coupon, et les frais."),
              {
                type: 'exemple',
                enonce: "Achat d'obligations 3 %, valeur nominale 10'000.00, au cours de 98 %. Dernier coupon payé il y a 120 jours. Courtage 0,8 % et droit de timbre 0,075 % du prix.",
                calcul: [
                  "Prix : 10'000.00 × 98 % = 9'800.00.",
                  "Intérêt couru : 10'000.00 × 3 × 120 ÷ 36 000 = 100.00.",
                  "Courtage : 9'800.00 × 0,8 % = 78.40.",
                  "Droit de timbre : 9'800.00 × 0,075 % = 7.35.",
                  "Montant débité : 9'800.00 + 100.00 + 78.40 + 7.35 = 9'985.75.",
                ],
              },
              p("L'intérêt couru se calcule sur la valeur nominale, avec l'année commerciale de 360 jours. Les taux du courtage et du droit de timbre sont donnés par l'énoncé."),
            ],
          },
          {
            titre: "Rendement d'un placement",
            blocs: [
              {
                type: 'tableau',
                entetes: ['Placement', 'Rendement annuel en %'],
                lignes: [
                  ['Action', '(dividende ± gain ou perte de cours) ÷ prix d’achat × 100'],
                  ['Obligation', '(intérêt annuel ± différence de remboursement ÷ années) ÷ cours d’achat × 100'],
                  ['Immeuble, brut', 'loyers ÷ prix d’achat × 100'],
                  ['Immeuble, net', '(loyers − charges − intérêts) ÷ fonds propres investis × 100'],
                ],
              },
              {
                type: 'exemple',
                enonce: 'Action achetée 200.00, dividende brut 6.00, revendue un an plus tard 210.00.',
                calcul: ['Gain de cours : 10.00.', '(6.00 + 10.00) ÷ 200.00 × 100 = 8,0 %.'],
                variante: { enonce: 'Obligation 2 %, achetée au cours de 96 %, remboursée à 100 % dans 4 ans.', texte: ['(2 + (100 − 96) ÷ 4) ÷ 96 × 100 = 3 ÷ 96 × 100 = 3,1 %.'] },
              },
            ],
          },
        ],
        erreurs: [
          { erreur: "Passer les frais d'achat en charge.", correction: 'Les titres entrent au prix payé, frais compris.' },
          { erreur: 'Ne comptabiliser que le dividende net.', correction: "Le produit est le dividende brut ; les 35 % retenus sont une créance envers l'AFC." },
          { erreur: 'Calculer un bénéfice à chaque vente.', correction: "La vente est créditée au net ; la différence apparaît à la clôture, avec l'inventaire." },
          { erreur: "Calculer l'intérêt couru sur le prix payé.", correction: 'Il se calcule sur la valeur nominale.' },
        ],
        questions: [
          { question: "Achat de 50 actions à 120.00, frais 90.00. Quel montant au débit de Titres de placement ?", reponse: "50 × 120.00 + 90.00 = 6'090.00." },
          { question: 'Dividende brut de 400.00. Quelle écriture ?', reponse: 'Banque 260.00 et Créances AFC 140.00 au débit ; Produits des titres 400.00 au crédit.' },
          { question: "Solde de Titres 12'000.00, inventaire 11'400.00. Quelle écriture ?", reponse: 'Charges des titres / Titres de placement, 600.00.' },
          { question: "Obligation 4 %, nominal 20'000.00, dernier coupon il y a 90 jours. Intérêt couru ?", reponse: "20'000.00 × 4 × 90 ÷ 36 000 = 200.00." },
          { question: 'Action achetée 500.00, dividende 15.00, revendue 490.00 un an après. Rendement ?', reponse: '(15.00 − 10.00) ÷ 500.00 × 100 = 1,0 %.' },
        ],
        liens: { module: 'titres-ecritures', exercices: ['dossier-mp4-precimeca-sa-titres-provisions'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Immeubles
    immeubles: [
      enrichir(de('immeubles'), {
        objectifs: [
          "Choisir les comptes d'un immeuble selon son usage.",
          'Comptabiliser les loyers internes et une annuité hypothécaire.',
          "Calculer le résultat et le rendement d'un immeuble.",
        ],
        termes: [
          { terme: 'Valeur locative', definition: "loyer que le propriétaire paierait pour le logement qu'il occupe." },
          { terme: 'Loyer interne', definition: 'loyer calculé, sans paiement, pour des locaux utilisés par leur propriétaire.' },
          { terme: 'Dette hypothécaire', definition: "emprunt garanti par l'immeuble." },
          { terme: 'Annuité', definition: "paiement périodique qui réunit l'intérêt et le remboursement." },
          { terme: 'Plus-value', definition: "dépense qui augmente durablement la valeur de l'immeuble." },
        ],
        apres: {
          'Trois situations': [
            {
              type: 'tableau',
              entetes: ['Immeuble', 'Charges', 'Produits'],
              lignes: [
                ['Commercial', "Charges d'exploitation (classes 5 et 6)", 'Aucun'],
                ['À usage mixte', "Charges d'immeubles", "Produits d'immeubles"],
                ['Locatif', 'Charges hors exploitation', 'Produits hors exploitation'],
              ],
            },
          ],
          'Loyers internes': [
            {
              type: 'exemple',
              enonce: "Résultat d'un immeuble à usage mixte : loyer interne de l'atelier 24'000.00, valeur locative du logement 18'000.00, loyers de tiers 12'000.00 ; entretien 9'000.00, intérêts hypothécaires 6'000.00, amortissement 6'000.00, assurance et impôt foncier 4'000.00.",
              calcul: ["Produits d'immeubles : 24'000.00 + 18'000.00 + 12'000.00 = 54'000.00.", "Charges d'immeubles : 9'000.00 + 6'000.00 + 6'000.00 + 4'000.00 = 25'000.00.", "Résultat de l'immeuble : 29'000.00."],
              conclusion: 'Sans les loyers internes, l’immeuble afficherait une perte de 13’000.00, alors qu’il loge l’entreprise et son propriétaire.',
            },
          ],
          'Dette hypothécaire et annuité': [
            {
              type: 'exemple',
              enonce: "Dette de 300'000.00 à 2 %, remboursement annuel constant de 5'000.00 : les deux premières annuités.",
              calcul: [
                "1re année : intérêt 300'000.00 × 2 % = 6'000.00 ; annuité 11'000.00 ; dette restante 295'000.00.",
                "2e année : intérêt 295'000.00 × 2 % = 5'900.00 ; annuité 10'900.00 ; dette restante 290'000.00.",
              ],
              lignes: [D('7510', 5900), D('2401', 5000), C('1020', 10900)],
              conclusion: "Seul l'intérêt est une charge. Le remboursement diminue la dette, sans effet sur le résultat.",
            },
          ],
        },
        sections: [
          {
            titre: "Rendement d'un immeuble",
            blocs: [
              {
                type: 'exemple',
                enonce: "Immeuble acheté 1'000'000.00, financé par 300'000.00 de fonds propres et 700'000.00 d'hypothèque. Loyers 55'000.00, charges 12'000.00, intérêts hypothécaires 14'000.00.",
                calcul: ["Rendement brut : 55'000.00 ÷ 1'000'000.00 × 100 = 5,5 %.", "Rendement net des fonds propres : (55'000.00 − 12'000.00 − 14'000.00) ÷ 300'000.00 × 100 = 9,7 %."],
              },
            ],
          },
        ],
        erreurs: [
          { erreur: 'Passer en charge une dépense qui augmente la valeur.', correction: "Un agrandissement ou une installation nouvelle s'ajoute au compte Immeubles." },
          { erreur: "Passer toute l'annuité en charge.", correction: "Seul l'intérêt est une charge ; le remboursement débite la dette hypothécaire." },
          { erreur: 'Passer la valeur locative du logement en Loyers.', correction: "C'est un prélèvement du propriétaire : au débit du Privé." },
          { erreur: "Se tromper de compte pour l'intérêt hypothécaire.", correction: "Il suit l'usage de l'immeuble : charges financières, charges d'immeubles ou charges hors exploitation." },
        ],
        questions: [
          { question: "Loyer interne des bureaux de l'entreprise, 30'000.00, immeuble à usage mixte. Quelle écriture ?", reponse: "Loyers / Produits d'immeubles, 30'000.00." },
          { question: 'Ce loyer interne change-t-il le bénéfice ?', reponse: "Non : la charge d'exploitation et le produit d'immeubles se compensent." },
          { question: "Dette de 400'000.00 à 1,5 %, remboursement de 8'000.00. Montant de l'annuité ?", reponse: "Intérêt 6'000.00 + remboursement 8'000.00 = 14'000.00." },
          { question: "Remplacement d'une fenêtre cassée : charge ou plus-value ?", reponse: "Charge : c'est de l'entretien, la valeur de l'immeuble n'augmente pas." },
        ],
        liens: { module: 'titres-immeubles', exercices: ['dossier-mp4-carrosserie-du-saleve-immeuble'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Intérêts
    interets: [
      enrichir(de('interets'), {
        objectifs: [
          "Calculer un intérêt, une durée, un taux ou un capital avec l'année commerciale.",
          "Calculer l'intérêt d'un compte courant par la méthode des nombres.",
          'Comptabiliser un escompte avec correction de la TVA.',
        ],
        termes: [
          { terme: 'Capital', definition: 'somme prêtée ou placée.' },
          { terme: 'Taux', definition: 'intérêt annuel, en pour cent du capital.' },
          { terme: 'Année commerciale', definition: '360 jours, soit douze mois de 30 jours.' },
          { terme: 'Nombre', definition: 'capital × jours ÷ 100 ; il sert à additionner des périodes de soldes différents.' },
          { terme: 'Escompte', definition: 'réduction accordée pour un paiement rapide.' },
        ],
        apres: {
          'Escomptes et rabais': [
            {
              type: 'exemple',
              enonce: "Le premier cas ci-dessus, pas à pas : facture de 10'810.00 TVA comprise, 2 % d'escompte.",
              calcul: [
                "Escompte total : 10'810.00 × 2 % = 216.20.",
                "Part hors taxe : 10'000.00 × 2 % = 200.00, en Déductions accordées.",
                'Part de TVA : 810.00 × 2 % = 16.20, en diminution de la TVA due.',
                "Encaissé : 10'810.00 − 216.20 = 10'593.80.",
              ],
              conclusion: "L'entreprise a vendu pour 200.00 de moins : elle doit aussi 16.20 de TVA de moins.",
            },
            {
              type: 'contraste',
              cas: [
                { titre: 'Escompte accordé à un client', texte: ['Déductions accordées et TVA due au débit.', "Le chiffre d'affaires et la TVA à verser diminuent."] },
                { titre: "Escompte obtenu d'un fournisseur", texte: ['Déductions obtenues et impôt préalable au crédit.', "Le coût d'achat et la TVA à récupérer diminuent."] },
              ],
            },
          ],
        },
        sections: [
          {
            titre: "Calculer un intérêt : l'année commerciale",
            blocs: [
              p("L'intérêt dépend du capital, du taux et de la durée. En Suisse, on compte en général 30 jours par mois et 360 jours par an."),
              { type: 'retenir', texte: 'I = C × t × j ÷ 36 000, où C est le capital, t le taux en pour cent et j le nombre de jours.' },
              {
                type: 'exemple',
                enonce: "Capital de 24'000.00 placé à 3 % pendant 150 jours.",
                calcul: ["I = 24'000.00 × 3 × 150 ÷ 36 000 = 300.00."],
                variante: {
                  enonce: "Un capital de 18'000.00 placé à 4 % a rapporté 180.00. Pendant combien de jours ?",
                  texte: ["j = I × 36 000 ÷ (C × t) = 180.00 × 36 000 ÷ (18'000.00 × 4) = 90 jours."],
                },
              },
              {
                type: 'tableau',
                entetes: ['On cherche', 'Formule'],
                lignes: [
                  ["L'intérêt", 'I = C × t × j ÷ 36 000'],
                  ['La durée', 'j = I × 36 000 ÷ (C × t)'],
                  ['Le taux', 't = I × 36 000 ÷ (C × j)'],
                  ['Le capital', 'C = I × 36 000 ÷ (t × j)'],
                ],
              },
            ],
          },
          {
            titre: 'Compte courant : la méthode des nombres',
            blocs: [
              p("Le solde d'un compte courant change souvent. Plutôt que de calculer l'intérêt de chaque période, on calcule un nombre par période, on additionne les nombres, puis on applique le taux une seule fois."),
              { type: 'retenir', texte: 'Nombre = capital × jours ÷ 100. Intérêt = total des nombres × taux ÷ 360.' },
              {
                type: 'tableau',
                entetes: ['Période', 'Solde créditeur', 'Jours', 'Nombre'],
                lignes: [
                  ['1', "40'000.00", '60', "24'000"],
                  ['2', "70'000.00", '90', "63'000"],
                  ['3', "30'000.00", '30', "9'000"],
                  ['Total', '', '180', "96'000"],
                ],
              },
              {
                type: 'exemple',
                enonce: "Bouclement du compte ci-dessus au taux de 1,5 % ; la banque retient l'impôt anticipé de 35 %.",
                calcul: ["Intérêt brut : 96'000 × 1,5 ÷ 360 = 400.00.", 'Impôt anticipé : 400.00 × 35 % = 140.00.', 'Intérêt net crédité : 260.00.'],
                lignes: [D('1020', 260), D('1176', 140), C('6950', 400)],
                effets: { actif: 'Banque + 260.00 ; Créances AFC + 140.00', resultat: 'Produits + 400.00' },
              },
            ],
          },
        ],
        erreurs: [
          { erreur: "Compter 365 jours ou les jours réels du mois.", correction: 'Année commerciale : 30 jours par mois, 360 par an.' },
          { erreur: 'Diviser par 360 au lieu de 36 000.', correction: 'Le taux est en pour cent : 100 × 360 = 36 000.' },
          { erreur: "Ne comptabiliser que l'intérêt net.", correction: "Le produit est l'intérêt brut ; l'impôt anticipé est une créance envers l'AFC." },
          { erreur: "Oublier de corriger la TVA d'un escompte.", correction: 'Avec la TVA au net, la TVA diminue dans la même proportion que le prix.' },
        ],
        questions: [
          { question: "Capital 60'000.00, taux 2 %, 90 jours. Intérêt ?", reponse: "60'000.00 × 2 × 90 ÷ 36 000 = 300.00." },
          { question: "Un capital de 45'000.00 a rapporté 450.00 en 120 jours. À quel taux ?", reponse: "450.00 × 36 000 ÷ (45'000.00 × 120) = 3 %." },
          { question: "Solde de 50'000.00 pendant 36 jours. Quel est le nombre ?", reponse: "50'000 × 36 ÷ 100 = 18'000." },
          { question: "Facture fournisseur de 5'405.00 (5'000.00 + TVA 8,1 %), escompte de 2 %. Montant payé ?", reponse: "Escompte : 108.10 (100.00 + 8.10 de TVA). Payé : 5'296.90." },
          { question: 'Frais de tenue de compte de 45.00. Quelle écriture ?', reponse: 'Charges financières / Banque, 45.00.' },
        ],
        liens: { module: 'interets', exercices: ['dossier-mp1-terroirs-du-monde'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────── Évaluation, réserves latentes
    evaluation: [
      enrichir(de('evaluation'), {
        objectifs: [
          "Expliquer le principe de prudence dans l'évaluation.",
          'Calculer une réserve latente et sa variation.',
          'Passer du bénéfice comptable au bénéfice réel.',
        ],
        termes: [
          { terme: "Valeur d'acquisition", definition: "ce que l'actif a coûté ; c'est la valeur la plus haute qu'il peut avoir au bilan." },
          { terme: 'Principe de prudence', definition: "ne pas présenter l'entreprise plus riche qu'elle ne l'est." },
          { terme: 'Réserve latente', definition: 'différence entre la valeur réelle et la valeur comptable, plus prudente.' },
          { terme: 'Bilan externe', definition: 'bilan publié, avec ses valeurs prudentes.' },
          { terme: 'Bilan interne', definition: "bilan apuré, aux valeurs réelles, réservé à la direction et à l'analyse." },
        ],
        apres: {
          'Les réserves latentes': [
            {
              type: 'exemple',
              enonce: "Machine achetée 100'000.00. L'entreprise l'amortit de 40'000.00, alors que la perte de valeur réelle est de 25'000.00. Bénéfice publié : 60'000.00.",
              calcul: [
                "Valeur comptable : 60'000.00. Valeur réelle : 75'000.00.",
                "Réserve latente constituée : 15'000.00.",
                "Bénéfice réel : 60'000.00 + 15'000.00 = 75'000.00.",
              ],
              conclusion: "L'entreprise a gagné 75'000.00, mais n'en montre que 60'000.00.",
            },
          ],
          'Dissolution des réserves latentes': [
            {
              type: 'exemple',
              enonce: "Bénéfice comptable 50'000.00. Les réserves latentes passent de 35'000.00 au début de l'exercice à 23'000.00 à la fin.",
              calcul: ["Variation : 23'000.00 − 35'000.00 = −12'000.00 (dissolution).", "Bénéfice réel : 50'000.00 − 12'000.00 = 38'000.00."],
              conclusion: "Le bénéfice publié est flatté par la dissolution : l'activité n'a rapporté que 38'000.00.",
            },
          ],
          "L'apurement": [
            {
              type: 'tableau',
              entetes: ['', 'CHF'],
              lignes: [['Fonds propres comptables (bilan externe)', "300'000.00"], ['+ Réserves latentes à la fin de l’exercice', "23'000.00"], ['= Fonds propres réels (bilan interne)', "323'000.00"]],
            },
          ],
        },
        sections: [
          {
            titre: 'Normes de présentation et comptes de groupe',
            blocs: [
              p("Le Code des obligations admet les réserves latentes. D'autres référentiels les limitent, parce qu'ils visent une image fidèle de l'entreprise."),
              {
                type: 'tableau',
                entetes: ['Normes', 'Origine et usage'],
                lignes: [
                  ['Swiss GAAP RPC', 'Recommandations suisses, notamment pour les PME et les groupes non cotés à l’étranger'],
                  ['IFRS', "Normes internationales publiées par l'IASB, utilisées par de nombreux groupes cotés"],
                  ['US GAAP', 'Normes comptables des États-Unis'],
                ],
              },
              p("Un groupe réunit une société mère et ses filiales. Ses comptes consolidés additionnent les actifs et les dettes de toutes les sociétés, puis éliminent les opérations internes : le groupe ne peut pas avoir une créance ou une dette envers lui-même. La participation de la société mère est remplacée par les actifs et les dettes de la filiale."),
            ],
          },
        ],
        erreurs: [
          { erreur: 'Confondre réserve latente et réserve au bilan.', correction: "La réserve latente n'apparaît dans aucun compte : c'est un écart entre deux valeurs." },
          { erreur: 'Ajouter une dissolution au bénéfice comptable.', correction: 'Une dissolution est une variation négative : le bénéfice réel est plus bas que le bénéfice publié.' },
          { erreur: "Évaluer un actif au-dessus de son coût d'acquisition.", correction: "Le coût d'acquisition est un plafond ; seuls les titres cotés peuvent être évalués au cours du jour." },
        ],
        questions: [
          { question: "Stock réel 80'000.00, au bilan 60'000.00. Réserve latente ?", reponse: "20'000.00." },
          { question: "Bénéfice comptable 40'000.00 ; réserves latentes de 10'000.00 au début, 18'000.00 à la fin. Bénéfice réel ?", reponse: "Variation + 8'000.00 : bénéfice réel 48'000.00." },
          { question: 'Une provision trop élevée crée-t-elle une réserve latente ?', reponse: 'Oui : une dette surévaluée sous-évalue les fonds propres.' },
          { question: 'Que fait-on, en consolidation, d’une dette de la filiale envers la société mère ?', reponse: 'On l’élimine, avec la créance correspondante.' },
        ],
        liens: { module: 'normes', exercices: ['dossier-mp3-ateliers-genevois-reserves-latentes', 'dossier-mp3-cartonnages-du-leman-dissolution'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────── Compte de résultat à plusieurs degrés
    'resultat-degres': [
      enrichir(de('resultat-degres'), {
        objectifs: ['Présenter un compte de résultat par degrés.', 'Dire ce que mesure chaque résultat intermédiaire.'],
        termes: [
          { terme: 'Marge brute', definition: 'ce que laissent les ventes une fois les marchandises payées.' },
          { terme: 'EBITDA', definition: 'résultat avant intérêts, impôts et amortissements.' },
          { terme: 'EBIT', definition: "résultat avant intérêts et impôts : ce que rapporte l'exploitation." },
          { terme: 'EBT', definition: 'résultat avant impôts.' },
        ],
        apres: {
          'Les degrés selon le plan comptable PME': [
            {
              type: 'tableau',
              entetes: ['Exemple', 'CHF'],
              lignes: [
                ["Chiffre d'affaires", "800'000.00"],
                ['− Charges de marchandises', "480'000.00"],
                ['= Marge brute', "320'000.00"],
                ['− Charges de personnel', "180'000.00"],
                ["− Autres charges d'exploitation", "60'000.00"],
                ['= EBITDA', "80'000.00"],
                ['− Amortissements', "20'000.00"],
                ['= EBIT', "60'000.00"],
                ['− Charges financières, nettes des produits', "8'000.00"],
                ["= Résultat net d'exploitation", "52'000.00"],
                ['+ Résultat hors exploitation', "5'000.00"],
                ['= EBT', "57'000.00"],
                ['− Impôts', "12'000.00"],
                ["= Résultat de l'exercice", "45'000.00"],
              ],
            },
            {
              type: 'contraste',
              cas: [
                { titre: 'Entreprise financée par ses propriétaires', texte: ["EBIT 60'000.00, aucun intérêt.", "Résultat net d'exploitation : 60'000.00."] },
                { titre: 'Entreprise très endettée', texte: ["EBIT 60'000.00, intérêts 25'000.00.", "Résultat net d'exploitation : 35'000.00."] },
              ],
            },
            p("Les deux entreprises exploitent aussi bien l'une que l'autre : leur EBIT est le même. Seul leur financement les distingue."),
          ],
        },
        erreurs: [
          { erreur: "Déduire les amortissements avant l'EBITDA.", correction: "L'EBITDA est calculé avant les amortissements ; ils sont déduits pour obtenir l'EBIT." },
          { erreur: "Mettre les intérêts dans les autres charges d'exploitation.", correction: "Les charges financières viennent après l'EBIT." },
          { erreur: "Compter un produit hors exploitation dans l'EBIT.", correction: "L'EBIT ne mesure que l'exploitation ; l'annexe et le hors exploitation viennent ensuite." },
        ],
        questions: [
          { question: "Marge brute 250'000.00, personnel 140'000.00, autres charges d'exploitation 50'000.00. EBITDA ?", reponse: "60'000.00." },
          { question: "EBITDA 60'000.00, amortissements 15'000.00. EBIT ?", reponse: "45'000.00." },
          { question: "Pourquoi compare-t-on deux entreprises par leur EBIT plutôt que par leur bénéfice ?", reponse: 'Parce que l’EBIT ne dépend ni de leur endettement, ni de leurs impôts.' },
          { question: "Où apparaît le résultat d'un immeuble à usage mixte ?", reponse: "Après le résultat net d'exploitation, dans les activités annexes." },
        ],
        liens: { exercices: ['dossier-mp5-rhone-mobilite-tableaux'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────── Flux de trésorerie
    flux: [
      enrichir(de('flux'), {
        objectifs: [
          'Classer un mouvement de liquidités dans son secteur.',
          'Calculer le cash flow par la méthode indirecte et par la méthode directe.',
          'Calculer le free cash-flow.',
        ],
        termes: [
          { terme: 'Liquidités', definition: 'caisse, poste et banque.' },
          { terme: 'Cash flow', definition: "liquidités dégagées par l'exploitation." },
          { terme: 'Cash drain', definition: "liquidités absorbées par l'exploitation : un cash flow négatif." },
          { terme: 'Désinvestissement', definition: "vente d'une immobilisation." },
          { terme: 'Free cash-flow', definition: 'ce qui reste du cash flow une fois les investissements payés.' },
        ],
        apres: {
          'Trois secteurs': [
            {
              type: 'exemple',
              enonce: "Flux d'exploitation + 52'000.00 ; achat d'une machine 30'000.00 ; remboursement d'un emprunt 10'000.00. Liquidités au début : 18'000.00.",
              calcul: ["Variation : 52'000.00 − 30'000.00 − 10'000.00 = + 12'000.00.", "Liquidités à la fin : 18'000.00 + 12'000.00 = 30'000.00."],
              conclusion: "Le contrôle est toujours le même : la variation calculée doit expliquer l'écart entre les liquidités du début et celles de la fin.",
            },
          ],
          'Cash flow par la méthode indirecte': [
            {
              type: 'contraste',
              cas: [
                { titre: 'On ajoute au bénéfice', texte: ['Les amortissements et la hausse des provisions.', 'La baisse des créances et des stocks ; la hausse des dettes fournisseurs.'] },
                { titre: 'On soustrait du bénéfice', texte: ['La dissolution de provisions.', 'La hausse des créances et des stocks ; la baisse des dettes fournisseurs.'] },
              ],
            },
          ],
        },
        sections: [
          {
            titre: 'La méthode directe et le free cash-flow',
            blocs: [
              p("La méthode directe arrive au même cash flow par un autre chemin : elle additionne les encaissements de l'exploitation et en soustrait les paiements."),
              {
                type: 'exemple',
                enonce: "Encaissements des clients 500'000.00 ; paiements aux fournisseurs 260'000.00, au personnel 110'000.00, autres 40'000.00. Investissements payés 50'000.00 ; vente d'une machine 8'000.00.",
                calcul: ["Cash flow d'exploitation : 500'000.00 − 260'000.00 − 110'000.00 − 40'000.00 = 90'000.00.", "Free cash-flow : 90'000.00 − 50'000.00 + 8'000.00 = 48'000.00."],
                conclusion: "Ces 48'000.00 sont disponibles pour rembourser des dettes ou verser un dividende.",
              },
              { type: 'retenir', texte: "Free cash-flow = cash flow d'exploitation − investissements + désinvestissements." },
            ],
          },
        ],
        erreurs: [
          { erreur: 'Confondre bénéfice et liquidités.', correction: "Une vente à crédit augmente le bénéfice sans faire entrer d'argent ; un amortissement le diminue sans en faire sortir." },
          { erreur: 'Soustraire les amortissements.', correction: 'Dans la méthode indirecte, on les ajoute au bénéfice : ils ne font sortir aucun argent.' },
          { erreur: "Classer le remboursement d'un emprunt dans l'exploitation.", correction: "C'est un flux de financement." },
          { erreur: "Classer l'achat d'une machine dans l'exploitation.", correction: "C'est un flux d'investissement." },
        ],
        questions: [
          { question: "Bénéfice 30'000.00, amortissements 10'000.00, hausse des stocks 4'000.00. Cash flow ?", reponse: "30'000.00 + 10'000.00 − 4'000.00 = 36'000.00." },
          { question: 'Le versement du dividende : quel secteur ?', reponse: 'Financement.' },
          { question: "Cash flow 70'000.00, investissements 55'000.00, aucune vente d'immobilisation. Free cash-flow ?", reponse: "15'000.00." },
          { question: "Flux d'exploitation + 40'000.00, investissement − 60'000.00, financement + 15'000.00. Variation des liquidités ?", reponse: "− 5'000.00." },
        ],
        liens: { module: 'flux-direct', exercices: ['dossier-mp5-rhone-mobilite-tableaux'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────── Seuil de rentabilité
    seuil: [
      enrichir(de('seuil'), {
        objectifs: [
          'Calculer une marge contributive et un seuil de rentabilité, en quantité et en chiffre d’affaires.',
          "Calculer le point mort d'une entreprise commerciale et sa date.",
          'Calculer la rotation du stock.',
        ],
        termes: [
          { terme: 'Charges variables', definition: 'charges qui suivent la quantité vendue.' },
          { terme: 'Charges fixes', definition: 'charges indépendantes de la quantité vendue.' },
          { terme: 'Marge contributive', definition: 'prix de vente moins coût variable.' },
          { terme: 'Seuil de rentabilité (point mort)', definition: "niveau de ventes où le résultat est nul." },
          { terme: 'Rotation du stock', definition: "nombre de fois où le stock est renouvelé dans l'année." },
        ],
        apres: {
          'Charges fixes, charges variables et marge contributive': [
            {
              type: 'exemple',
              enonce: "Avec les chiffres ci-dessus (prix 80.00, coût variable 50.00, charges fixes 60'000.00) : résultat pour 2'500 unités vendues.",
              calcul: ["Marge contributive totale : 2'500 × 30.00 = 75'000.00.", "Résultat : 75'000.00 − 60'000.00 = 15'000.00 de bénéfice."],
              variante: { enonce: "L'entreprise ne vend que 1'600 unités.", texte: ["1'600 × 30.00 = 48'000.00 ; 48'000.00 − 60'000.00 = −12'000.00 : une perte."] },
            },
          ],
        },
        sections: [
          {
            titre: "Le point mort d'une entreprise commerciale",
            blocs: [
              p("Un commerce vend des centaines d'articles : on ne raisonne plus par unité, mais en chiffre d'affaires. Par simplification, seul le prix de revient des marchandises vendues est variable : la marge contributive est alors la marge brute."),
              { type: 'retenir', texte: "Chiffre d'affaires au point mort = charges fixes ÷ taux de marge brute. Date = chiffre d'affaires au point mort ÷ chiffre d'affaires annuel × 360." },
              {
                type: 'exemple',
                enonce: "Chiffre d'affaires annuel 600'000.00, marge brute 240'000.00 (40 %), charges fixes 180'000.00.",
                calcul: ["Chiffre d'affaires au point mort : 180'000.00 ÷ 40 % = 450'000.00.", "Date : 450'000.00 ÷ 600'000.00 × 360 = 270e jour, soit le 30 septembre."],
                conclusion: "Jusqu'à fin septembre, l'entreprise travaille pour couvrir ses charges fixes ; le bénéfice se fait au dernier trimestre.",
              },
            ],
          },
          {
            titre: 'La rotation du stock',
            blocs: [
              { type: 'retenir', texte: 'Rotation = prix de revient des marchandises vendues ÷ stock moyen. Durée moyenne de stockage = 360 ÷ rotation.' },
              {
                type: 'exemple',
                enonce: "Même entreprise : prix de revient des marchandises vendues 360'000.00, stock moyen 60'000.00.",
                calcul: ["Rotation : 360'000.00 ÷ 60'000.00 = 6.", 'Durée moyenne de stockage : 360 ÷ 6 = 60 jours.'],
              },
            ],
          },
        ],
        erreurs: [
          { erreur: 'Diviser les charges fixes par le prix de vente.', correction: 'On divise par la marge contributive par unité, ou par son taux.' },
          { erreur: 'Classer le loyer dans les charges variables.', correction: 'Le loyer est dû quelle que soit la quantité vendue : charge fixe.' },
          { erreur: "Calculer la rotation avec le chiffre d'affaires.", correction: 'On rapporte le prix de revient des marchandises vendues au stock moyen : les deux sont au prix de revient.' },
        ],
        questions: [
          { question: "Prix 40.00, coût variable 28.00, charges fixes 36'000.00. Seuil en quantité ?", reponse: "36'000.00 ÷ 12.00 = 3'000 unités." },
          { question: 'Avec ces chiffres, quel est le taux de marge contributive ?', reponse: '12.00 ÷ 40.00 × 100 = 30 %.' },
          { question: "Charges fixes 150'000.00, taux de marge brute 30 %. Chiffre d'affaires au point mort ?", reponse: "500'000.00." },
          { question: "Point mort à 500'000.00, chiffre d'affaires annuel 750'000.00. Quel jour ?", reponse: "500'000.00 ÷ 750'000.00 × 360 = 240e jour." },
          { question: 'Rotation de 8. Durée moyenne de stockage ?', reponse: '360 ÷ 8 = 45 jours.' },
        ],
        liens: { module: 'point-mort', exercices: ['dossier-mp5-rhone-mobilite-tableaux'] },
      }),

      // ─────────────────────────────────────────────────────────────── Comptabilité analytique (nouveau)
      enrichir(
        {
          id: 'analytique',
          titre: 'Comptabilité analytique',
          niveau: 'MP',
          resume: 'Répartir les charges entre les secteurs de l’entreprise pour connaître le prix de revient de ce qu’elle produit.',
          sections: [
            {
              titre: 'À quoi sert-elle ?',
              blocs: [
                p("La comptabilité financière dit combien l'entreprise a gagné. Elle ne dit pas ce que coûte chaque produit, ni si une commande est rentable. La comptabilité analytique reprend les mêmes charges et les attribue aux secteurs, puis aux produits."),
                {
                  type: 'contraste',
                  cas: [
                    { titre: 'Charges directes', texte: ["On sait pour quel produit elles ont été engagées.", 'Exemple : la matière et le salaire de l’ouvrier qui a fabriqué la commande.'] },
                    { titre: 'Charges indirectes', texte: ['Elles servent à plusieurs produits à la fois.', 'Exemple : le loyer, le salaire du comptable, l’amortissement des machines.'] },
                  ],
                },
              ],
            },
            {
              titre: 'La feuille de répartition',
              blocs: [
                p("Les charges indirectes sont d'abord réparties entre des centres de coûts : c'est la répartition primaire. Un centre auxiliaire, comme le bâtiment, ne produit rien pour les clients : il travaille pour les autres centres. Son total est donc réparti à son tour sur les centres principaux : c'est la répartition secondaire."),
                {
                  type: 'tableau',
                  entetes: ['', 'Bâtiment', 'Production', 'Administration et vente'],
                  lignes: [
                    ['Charges primaires', "40'000.00", "260'000.00", "90'000.00"],
                    ['Répartition du bâtiment (75 % / 25 %)', "−40'000.00", "30'000.00", "10'000.00"],
                    ['Total après répartition', '0.00', "290'000.00", "100'000.00"],
                  ],
                },
                p("Le total ne change pas : 390'000.00 avant comme après. La répartition déplace les charges, elle n'en crée pas."),
              ],
            },
            {
              titre: "Le coût d'une unité d'œuvre",
              blocs: [
                p("Pour imputer un centre aux commandes, on choisit une unité qui mesure son activité : l'heure-machine pour un atelier, par exemple."),
                { type: 'retenir', texte: "Coût d'une unité d'œuvre = total du centre ÷ nombre d'unités." },
                {
                  type: 'exemple',
                  enonce: "Le centre Production (290'000.00) a fourni 5'000 heures-machine.",
                  calcul: ["Coût d'une heure-machine : 290'000.00 ÷ 5'000 = 58.00."],
                },
              ],
            },
            {
              titre: 'Le prix de revient complet',
              blocs: [
                p("Le coût de production d'une commande réunit ses charges directes et les heures-machine qu'elle a consommées. On y ajoute les frais d'administration et de vente, en pour cent du coût de production."),
                {
                  type: 'exemple',
                  enonce: "Commande : matières 1'200.00, salaires directs 800.00, 10 heures-machine. Frais d'administration et de vente imputés sur une base de 2'000'000.00.",
                  calcul: [
                    "Coût de production : 1'200.00 + 800.00 + 10 × 58.00 = 2'580.00.",
                    "Taux d'administration et de vente : 100'000.00 ÷ 2'000'000.00 × 100 = 5 %.",
                    "Frais imputés : 2'580.00 × 5 % = 129.00.",
                    "Prix de revient complet : 2'580.00 + 129.00 = 2'709.00.",
                  ],
                  conclusion: 'Vendue au-dessous de 2’709.00, la commande ne couvre pas toutes ses charges.',
                },
              ],
            },
          ],
        },
        {
          objectifs: [
            "Distinguer les charges directes des charges indirectes.",
            'Établir une feuille de répartition avec un centre auxiliaire.',
            "Calculer le coût d'une unité d'œuvre et un prix de revient complet.",
          ],
          termes: [
            { terme: 'Centre de coûts', definition: "secteur de l'entreprise dont on mesure les charges." },
            { terme: 'Centre auxiliaire', definition: 'centre qui travaille pour les autres centres.' },
            { terme: "Unité d'œuvre", definition: "mesure de l'activité d'un centre." },
            { terme: 'Coût de production', definition: 'charges directes + part du centre de production.' },
            { terme: 'Prix de revient complet', definition: "coût de production + frais d'administration et de vente." },
          ],
          erreurs: [
            { erreur: 'Oublier la répartition secondaire.', correction: 'Le centre auxiliaire doit finir à zéro : son total est réparti sur les centres principaux.' },
            { erreur: 'Un total différent après la répartition.', correction: "La somme des centres reste égale au total des charges indirectes." },
            { erreur: "Calculer les frais d'administration sur le prix de vente.", correction: 'Ici, ils sont imputés en pour cent du coût de production.' },
          ],
          questions: [
            { question: "Centre auxiliaire de 60'000.00, réparti 80 % / 20 %. Combien reçoit la production ?", reponse: "48'000.00." },
            { question: "Centre Production 180'000.00 pour 4'000 heures-machine. Coût de l'heure ?", reponse: '45.00.' },
            { question: 'Matières 500.00, salaires directs 300.00, 6 heures à 45.00. Coût de production ?', reponse: "500.00 + 300.00 + 270.00 = 1'070.00." },
            { question: "Avec un taux d'administration et de vente de 10 %, quel est le prix de revient complet ?", reponse: "1'070.00 + 107.00 = 1'177.00." },
          ],
          liens: { module: 'analytique' },
        },
      ),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Analyse
    analyse: [
      enrichir(de('analyse'), {
        objectifs: [
          'Calculer les ratios du cours à partir d’un bilan et d’un compte de résultat.',
          'Calculer le fonds de roulement.',
          "Expliquer l'effet de levier et le modèle DuPont.",
        ],
        termes: [
          { terme: 'Liquidité', definition: 'capacité de payer les dettes à court terme.' },
          { terme: 'Endettement', definition: 'part des capitaux étrangers dans le financement.' },
          { terme: 'Rentabilité', definition: 'résultat rapporté aux capitaux engagés.' },
          { terme: 'Capitaux permanents', definition: 'capitaux propres et capitaux étrangers à long terme.' },
          { terme: 'Fonds de roulement', definition: 'actifs circulants moins capitaux étrangers à court terme.' },
        ],
        apres: {
          'Les ratios': [
            {
              type: 'tableau',
              entetes: ['Actif', 'CHF', 'Passif', 'CHF'],
              lignes: [
                ['Liquidités', "40'000.00", 'Capitaux étrangers à court terme', "100'000.00"],
                ['Créances', "80'000.00", 'Capitaux étrangers à long terme', "150'000.00"],
                ['Stocks', "100'000.00", 'Capitaux propres', "250'000.00"],
                ['Actifs immobilisés', "280'000.00", '', ''],
                ['Total', "500'000.00", 'Total', "500'000.00"],
              ],
            },
            {
              type: 'exemple',
              enonce: "Avec ce bilan ; EBIT 60'000.00, bénéfice net 45'000.00, actif moyen 480'000.00, capitaux propres moyens 240'000.00.",
              calcul: [
                "Liquidités 1 : 40'000.00 ÷ 100'000.00 = 40,0 %.",
                "Liquidités 2 : (40'000.00 + 80'000.00) ÷ 100'000.00 = 120,0 %.",
                "Degré d'endettement : 250'000.00 ÷ 500'000.00 = 50,0 %.",
                "Degré de financement propre : 250'000.00 ÷ 500'000.00 = 50,0 %.",
                "Degré de couverture des immobilisations 2 : (150'000.00 + 250'000.00) ÷ 280'000.00 = 142,9 %.",
                "Rentabilité des capitaux investis : 60'000.00 ÷ 480'000.00 = 12,5 %.",
                "Rentabilité des fonds propres : 45'000.00 ÷ 240'000.00 = 18,8 %.",
              ],
            },
          ],
          'Fonds de roulement': [
            {
              type: 'exemple',
              enonce: 'Fonds de roulement du bilan ci-dessus, par les deux chemins.',
              calcul: [
                "Actifs circulants − capitaux étrangers à court terme : 220'000.00 − 100'000.00 = 120'000.00.",
                "Capitaux permanents − actifs immobilisés : 400'000.00 − 280'000.00 = 120'000.00.",
              ],
            },
          ],
          "L'effet de levier": [
            {
              type: 'contraste',
              cas: [
                { titre: 'Levier favorable', texte: ['Les capitaux investis rapportent 12,5 % ; la dette coûte 4 %.', "L'écart revient aux propriétaires : la rentabilité des fonds propres dépasse celle des capitaux investis."] },
                { titre: 'Levier défavorable', texte: ['Les capitaux investis rapportent 3 % ; la dette coûte 4 %.', 'La dette coûte plus qu’elle ne rapporte : la rentabilité des fonds propres baisse.'] },
              ],
            },
          ],
          'Le modèle DuPont': [
            {
              type: 'exemple',
              enonce: "Même entreprise : chiffre d'affaires 800'000.00, EBIT 60'000.00, actif moyen 480'000.00.",
              calcul: ["Marge : 60'000.00 ÷ 800'000.00 = 7,5 %.", "Rotation : 800'000.00 ÷ 480'000.00 = 1,67.", 'ROI : 7,5 % × 1,67 = 12,5 %.'],
              conclusion: 'Pour améliorer le ROI, on peut augmenter la marge, ou faire tourner les capitaux plus vite.',
            },
          ],
        },
        erreurs: [
          { erreur: 'Juger un ratio isolé.', correction: "Un ratio se compare : avec l'année précédente, ou avec la branche." },
          { erreur: 'Compter les stocks dans les liquidités 2.', correction: 'Les liquidités 2 ne réunissent que les liquidités et les créances.' },
          { erreur: "Calculer la rentabilité sur les capitaux de fin d'exercice.", correction: 'On prend la moyenne entre le début et la fin.' },
          { erreur: 'Confondre endettement et financement propre.', correction: 'Les deux degrés se complètent : leur somme fait 100 %.' },
        ],
        questions: [
          { question: "Liquidités 30'000.00, créances 60'000.00, capitaux étrangers à court terme 75'000.00. Liquidités 2 ?", reponse: "90'000.00 ÷ 75'000.00 = 120,0 %." },
          { question: "Capitaux étrangers 320'000.00, total du passif 800'000.00. Degré d'endettement ?", reponse: '40,0 %.' },
          { question: "Actifs circulants 180'000.00, capitaux étrangers à court terme 200'000.00. Fonds de roulement ?", reponse: "− 20'000.00 : les dettes à court terme financent une partie des immobilisations." },
          { question: 'Marge 5 %, rotation 2. ROI ?', reponse: '5 % × 2 = 10 %.' },
          { question: "Dans une SA, le bénéfice de l'exercice entre-t-il dans le degré d'autofinancement ?", reponse: 'Oui : il rejoint le bénéfice reporté.' },
        ],
        liens: { exercices: ['dossier-mp5-sports-et-montagne-analyse', 'demo-mp-lemantec-sa'] },
      }),
    ],
  };

  return chapitres.flatMap((c) => enrichis[c.id] ?? [c]);
}
