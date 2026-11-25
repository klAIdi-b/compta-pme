// Théorie enrichie de la 1ère CFC (modèle du 24.11.2026, chapitre TVA de la maquette validé par l'enseignant).
// Chaque chapitre garde toutes les sections validées le 07.11.2026 et reçoit en plus : objectifs, termes à connaître,
// exemples résolus pas à pas, cas contrastés, erreurs fréquentes, questions d'auto-vérification, liens pour s'exercer.
// Deux chapitres naissent d'un découpage, sans texte perdu : « Achats et ventes à crédit » (section tirée du journal) et
// « Compte privé et bouclement » (sections tirées du compte de résultat).
// Texte original ; comptes du plan du cours ; montants en francs. Contenu validé par l'enseignant le 24.11.2026.
import type { Bloc, Chapitre, LigneExemple, PosteSchema, Section } from './theorie';

export const s = (debit: string, credit: string, montant: number): LigneExemple[] => [{ debit, credit, montant }];
export const D = (compte: string, montant: number): LigneExemple => ({ debit: compte, credit: null, montant });
export const C = (compte: string, montant: number): LigneExemple => ({ debit: null, credit: compte, montant });
export const P = (libelle: string, montant: number): PosteSchema => ({ libelle, montant });
export const p = (texte: string): Bloc => ({ type: 'p', texte });

export interface Enrichissement {
  titre?: string;
  resume?: string;
  /** Bases légales vérifiées, à la place de celles du chapitre validé. */
  bases?: string[];
  objectifs: string[];
  termes: { terme: string; definition: string }[];
  /** Sections validées à ne pas reprendre (déplacées dans un autre chapitre). */
  sansSections?: string[];
  /** Blocs ajoutés à la fin d'une section validée, par titre de section. */
  apres?: Record<string, Bloc[]>;
  /** Sections nouvelles, placées après les sections validées. */
  sections?: Section[];
  /** Sections nouvelles, placées avant les sections validées. */
  avant?: Section[];
  erreurs: { erreur: string; correction: string; typique?: string }[];
  questions: { question: string; reponse: string }[];
  liens: { module?: string; exercices?: string[] };
}

const QUESTIONS_3 = ['Quels comptes sont touchés ?', 'De quel type est chacun ?', 'Augmente-t-il ou diminue-t-il ?'];
export const r3 = (a: string, b: string, c: string) => [`${QUESTIONS_3[0]} ${a}`, `${QUESTIONS_3[1]} ${b}`, `${QUESTIONS_3[2]} ${c}`];

export function enrichir(base: Chapitre, e: Enrichissement): Chapitre {
  const gardees = base.sections.filter((x) => !(e.sansSections ?? []).includes(x.titre));
  for (const titre of Object.keys(e.apres ?? {})) {
    if (!gardees.some((x) => x.titre === titre)) throw new Error(`Théorie ${base.id} : section « ${titre} » introuvable`);
  }
  return {
    ...base,
    titre: e.titre ?? base.titre,
    resume: e.resume ?? base.resume,
    bases: e.bases ?? base.bases,
    objectifs: e.objectifs,
    sections: [
      { titre: 'Les termes à connaître', blocs: [{ type: 'definitions', termes: e.termes }] },
      ...(e.avant ?? []),
      ...gardees.map((x) => ({ ...x, blocs: [...x.blocs, ...(e.apres?.[x.titre] ?? [])] })),
      ...(e.sections ?? []),
      { titre: 'Erreurs fréquentes', blocs: [{ type: 'erreurs', items: e.erreurs }] },
      { titre: 'Vérifiez vos connaissances', blocs: [{ type: 'questions', items: e.questions }] },
      ...(e.liens.module || e.liens.exercices?.length ? [{ titre: "Pour s'exercer", blocs: [{ type: 'liens' as const, ...e.liens }] }] : []),
    ],
  };
}

export const section = (base: Chapitre, titre: string): Section => {
  const x = base.sections.find((y) => y.titre === titre);
  if (!x) throw new Error(`Théorie ${base.id} : section « ${titre} » introuvable`);
  return x;
};

/** Remplace les chapitres de 1ère CFC par leur version enrichie et insère les deux chapitres issus d'un découpage. */
export function enrichirCfc1(valides: Chapitre[]): Chapitre[] {
  const de = (id: string) => valides.find((c) => c.id === id)!;
  const journal = de('journal');
  const resultat = de('resultat');

  const enrichis: Record<string, Chapitre[]> = {
    // ─────────────────────────────────────────────────────────────────────────── Cadre légal
    'cadre-legal': [
      enrichir(de('cadre-legal'), {
        objectifs: [
          "Dire à quoi sert la comptabilité et qui s'en sert.",
          'Savoir quelles entreprises doivent tenir une comptabilité complète.',
          'Citer les règles de base : une pièce pour chaque écriture, dix ans de conservation.',
        ],
        termes: [
          { terme: 'Comptabilité', definition: "enregistrement ordonné de toutes les opérations chiffrées d'une entreprise." },
          { terme: 'Pièce justificative', definition: 'document qui prouve une opération : facture, quittance, ticket de caisse, avis bancaire.' },
          { terme: 'Exercice comptable', definition: 'période pour laquelle on établit les comptes, en principe une année.' },
          { terme: 'Comptes annuels', definition: "bilan et compte de résultat établis à la fin de l'exercice." },
        ],
        avant: [
          {
            titre: 'À quoi sert la comptabilité ?',
            blocs: [
              p("Une entreprise réalise chaque jour des dizaines d'opérations : elle achète, vend, paie, encaisse. Sans trace écrite, personne ne saurait ce qu'elle possède, ce qu'elle doit, ni si elle gagne de l'argent."),
              p("La comptabilité est cette trace. Elle sert d'abord à l'entreprise, pour décider : engager quelqu'un, acheter une machine, fixer un prix."),
              p("Elle sert aussi à l'extérieur. La banque la consulte avant d'accorder un crédit. L'administration fiscale s'en sert pour calculer les impôts. Un fournisseur peut la demander avant de livrer à crédit."),
              {
                type: 'exemple',
                enonce: "Mme Rochat veut emprunter 25'000.00 pour ouvrir un second magasin.",
                calcul: [
                  'La banque demande son dernier bilan : que possède-t-elle, que doit-elle déjà ?',
                  'Elle demande son compte de résultat : le magasin actuel dégage-t-il un bénéfice ?',
                  "Sans comptabilité tenue, Mme Rochat ne peut répondre à aucune des deux questions.",
                ],
                conclusion: 'Les deux documents que la comptabilité produit, le bilan et le compte de résultat, répondent aux questions des tiers.',
              },
            ],
          },
        ],
        apres: {
          'Qui doit tenir une comptabilité ?': [
            {
              type: 'contraste',
              cas: [
                { titre: 'Comptabilité complète', texte: ["Raison individuelle ou société de personnes dont le chiffre d'affaires atteint 500'000 francs ; toutes les personnes morales.", 'Bilan, compte de résultat, journal, pièces justificatives.'] },
                { titre: 'Comptabilité simplifiée', texte: ["Raison individuelle ou société de personnes en dessous de 500'000 francs.", 'Recettes, dépenses et patrimoine. Elle doit être tenue avec le même soin.'] },
              ],
            },
          ],
        },
        erreurs: [
          { erreur: 'Jeter une facture une fois payée.', correction: 'La pièce prouve l’écriture : elle se conserve dix ans, payée ou non.' },
          { erreur: 'Passer une écriture « de mémoire », sans document.', correction: 'Pas d’écriture sans pièce justificative. Si la pièce manque, on la demande ou on établit une note interne.' },
          { erreur: "Croire qu'une petite entreprise n'a aucune obligation.", correction: "En dessous de 500'000 francs, la comptabilité est allégée, mais elle reste obligatoire." },
        ],
        questions: [
          { question: 'Citez deux personnes ou organismes extérieurs à l’entreprise qui consultent ses comptes.', reponse: 'La banque, avant un crédit, et l’administration fiscale, pour l’impôt. On peut aussi citer un fournisseur ou un repreneur.' },
          { question: 'Combien de temps faut-il conserver les pièces et les comptes annuels ?', reponse: 'Dix ans (CO art. 958f).' },
          { question: "Une raison individuelle réalise un chiffre d'affaires de 320'000.00. Quelle comptabilité doit-elle tenir ?", reponse: "Une comptabilité des recettes, des dépenses et du patrimoine suffit : le seuil de 500'000 francs n'est pas atteint." },
          { question: 'Pourquoi les comptes sont-ils établis pour une période déterminée ?', reponse: "Pour mesurer un résultat : le bénéfice ou la perte n'a de sens que rapporté à une période, l'exercice comptable." },
        ],
        liens: { module: 'classer-pieces', exercices: ['dossier-cfc1-saveurs-de-carouge'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Bilan
    bilan: [
      enrichir(de('bilan'), {
        objectifs: [
          'Établir un bilan à partir des inventaires et calculer le capital.',
          'Ranger chaque poste dans sa masse.',
          "Prévoir l'effet d'une opération sur le total du bilan.",
        ],
        termes: [
          { terme: 'Actif', definition: "ce que l'entreprise possède : les emplois des fonds." },
          { terme: 'Passif', definition: "d'où viennent les fonds : les dettes et le capital." },
          { terme: 'Capitaux étrangers', definition: "dettes envers des tiers, qu'il faudra rembourser." },
          { terme: 'Capitaux propres', definition: 'fonds qui appartiennent au propriétaire : capital, puis résultat.' },
          { terme: 'Liquidités', definition: 'argent immédiatement disponible : caisse, poste, banque.' },
          { terme: 'Inventaire', definition: "relevé chiffré de tout ce que l'entreprise possède et de tout ce qu'elle doit, à une date." },
          { terme: 'Masse', definition: 'grand groupe de postes du bilan ; il y en a cinq.' },
        ],
        apres: {
          'Des inventaires au bilan': [
            {
              type: 'exemple',
              enonce: "M. Perrin ouvre un atelier le 1er mars. Il apporte 40'000.00 et emprunte 20'000.00 à la banque sur cinq ans. Il achète des machines (25'000.00), du mobilier (8'000.00) et des marchandises (12'000.00), et met 1'000.00 en caisse.",
              calcul: [
                "Fonds reçus : 40'000.00 + 20'000.00 = 60'000.00. C'est le total du passif.",
                "Fonds employés hors banque : 25'000.00 + 8'000.00 + 12'000.00 + 1'000.00 = 46'000.00.",
                "Reste à la banque : 60'000.00 − 46'000.00 = 14'000.00.",
              ],
              conclusion: "Les deux totaux sont égaux sans qu'on ait eu à l'arranger : chaque franc employé vient d'une source.",
            },
            {
              type: 'bilan',
              titre: "Bilan d'ouverture de M. Perrin au 1er mars",
              actif: [P('Caisse', 1000), P('Banque', 14000), P('Stock de marchandises', 12000), P('Machines et appareils', 25000), P('Mobilier et installations', 8000)],
              passif: [P('Emprunt bancaire à long terme', 20000), P('Capital', 40000)],
            },
          ],
          'Les cinq masses du bilan': [
            {
              type: 'contraste',
              cas: [
                { titre: 'Actif circulant', texte: ['Il se transforme en argent rapidement, en moins d’un an.', 'Une voiture chez un garagiste qui la revend : c’est de la marchandise.'] },
                { titre: 'Actif immobilisé', texte: ['Il sert durablement à l’entreprise, plus d’un an.', 'La même voiture chez un boulanger qui livre son pain : c’est un véhicule.'] },
              ],
            },
          ],
          'Les quatre variations du bilan': [
            {
              type: 'exemple',
              enonce: "L'atelier de M. Perrin achète un scooter de 4'000.00, payable à 30 jours.",
              raisonnement: r3('Véhicules et Autres dettes.', 'Un actif et un passif.', 'Les deux augmentent : le véhicule au débit, la dette au crédit.'),
              lignes: s('1530', '2010', 4000),
              effets: { actif: "Véhicules + 4'000.00", passif: "Autres dettes + 4'000.00", resultat: 'Aucun effet' },
              conclusion: "Le total du bilan passe de 60'000.00 à 64'000.00. Le capital ne change pas : l'atelier possède un bien de plus, et doit autant en plus.",
              variante: {
                enonce: 'Un mois plus tard, la facture du scooter est payée par la banque.',
                texte: ["La banque diminue, la dette aussi : le total du bilan revient à 60'000.00."],
                lignes: s('2010', '1020', 4000),
              },
            },
          ],
        },
        erreurs: [
          { erreur: 'Croire que « passif » veut dire « négatif ».', correction: 'Le passif dit d’où viennent les fonds. Le capital, qui appartient au propriétaire, y figure.' },
          { erreur: "Penser qu'un achat à crédit enrichit l'entreprise.", correction: 'L’actif augmente, mais une dette du même montant apparaît : le capital ne change pas.' },
          { erreur: "Ne modifier qu'un seul poste.", correction: 'Une opération touche toujours au moins deux postes ; sinon le bilan n’est plus équilibré.' },
          { erreur: 'Inscrire en charge un bien durable.', correction: 'Un véhicule, une machine ou un ordinateur est un actif immobilisé : il figure au bilan.', typique: 'investissement-en-charge' },
        ],
        questions: [
          { question: "Une entreprise possède 48'000.00 d'actifs. Elle doit 6'000.00 à ses fournisseurs et 20'000.00 à la banque. Quel est son capital ?", reponse: "48'000.00 − 26'000.00 = 22'000.00." },
          { question: 'Dans quelle masse range-t-on les créances clients ? Et un emprunt sur six ans ?', reponse: 'Créances clients : actifs circulants. Emprunt sur six ans : capitaux étrangers à long terme.' },
          { question: "Un client paie par la banque une facture de 1'200.00 qu'il devait. Le total du bilan change-t-il ?", reponse: 'Non. La banque augmente et les créances clients diminuent du même montant : c’est une permutation d’actifs.' },
          { question: "Les actifs valent 30'000.00 et les dettes 34'000.00. Que montre le bilan ?", reponse: "Un découvert de 4'000.00, inscrit du côté de l'actif pour équilibrer." },
          { question: "L'entreprise emprunte 10'000.00 à la banque. Quel est l'effet sur le bilan ?", reponse: "Actif + (banque) et passif + (emprunt) : le total augmente de 10'000.00." },
        ],
        liens: { module: 'bilan', exercices: ['manuel-cfc1-favre-evenements', 'demo-cfc1-cycles-du-leman'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Comptes
    comptes: [
      enrichir(de('comptes'), {
        objectifs: [
          'Dire de quel côté un compte augmente, selon son type.',
          'Trouver une écriture avec les trois questions.',
          "Calculer et inscrire le solde d'un compte.",
        ],
        termes: [
          { terme: 'Compte', definition: "tableau qui enregistre les augmentations et les diminutions d'un seul poste." },
          { terme: 'Débit', definition: 'côté gauche du compte.' },
          { terme: 'Crédit', definition: 'côté droit du compte.' },
          { terme: 'Solde', definition: 'différence entre le total du débit et le total du crédit.' },
          { terme: 'SI et SF', definition: "solde initial, au début de l'exercice, et solde final, à la fin." },
          { terme: 'Partie double', definition: 'chaque opération est inscrite au débit d’un compte et au crédit d’un autre, pour le même montant.' },
        ],
        apres: {
          'Le compte en T': [
            p("Dans la vie courante, « débiter » veut dire retirer de l'argent et « créditer » en ajouter : la banque parle de son propre point de vue. En comptabilité, ces deux mots désignent seulement un côté du compte."),
          ],
          'Les quatre types de comptes': [
            {
              type: 'contraste',
              cas: [
                { titre: "Un compte d'actif : Caisse", texte: ['Solde initial au débit.', 'Une entrée d’argent s’inscrit au débit, une sortie au crédit.', 'Solde final débiteur, inscrit au crédit pour équilibrer.'] },
                { titre: 'Un compte de passif : Dettes fournisseurs', texte: ['Solde initial au crédit.', 'Une nouvelle facture s’inscrit au crédit, un paiement au débit.', 'Solde final créditeur, inscrit au débit pour équilibrer.'] },
              ],
            },
          ],
          'Raisonner en trois questions': [
            {
              type: 'exemple',
              enonce: "L'entreprise rembourse 5'000.00 de son emprunt par la banque.",
              raisonnement: r3('Emprunt bancaire à long terme et Banque.', 'Un passif et un actif.', "Les deux diminuent : l'emprunt au débit, la banque au crédit."),
              lignes: s('2400', '1020', 5000),
              effets: { actif: "Banque − 5'000.00", passif: "Emprunt − 5'000.00", resultat: 'Aucun effet' },
              variante: {
                enonce: "On retire 1'000.00 à la banque pour alimenter la caisse.",
                texte: ['Deux actifs : la caisse augmente au débit, la banque diminue au crédit.'],
                lignes: s('1000', '1020', 1000),
              },
            },
          ],
        },
        sections: [
          {
            titre: "Calculer le solde d'un compte",
            blocs: [
              p("On additionne chaque côté. La différence est le solde. On l'inscrit du côté le plus faible, pour que les deux totaux soient égaux."),
              p("Un compte d'actif a normalement un solde débiteur : son débit est le plus fort. Un compte de passif a un solde créditeur."),
              {
                type: 'compteT',
                compte: '1020',
                debit: [P('SI', 30000), P('Un client paie', 4000)],
                credit: [P("Remboursement de l'emprunt", 5000), P('Retrait pour la caisse', 1000), P('Paiement du fournisseur', 3000), P('SF', 25000)],
              },
              p("Total du débit : 34'000.00. Total du crédit avant le solde : 9'000.00. Solde final : 25'000.00, inscrit au crédit."),
              { type: 'retenir', texte: "Le solde final d'un exercice devient le solde initial du suivant." },
            ],
          },
        ],
        erreurs: [
          { erreur: 'Croire que « débit » signifie « diminution ».', correction: 'Le débit est le côté gauche. Un actif y augmente, un passif y diminue.' },
          { erreur: 'Inscrire le solde du côté le plus fort.', correction: 'Le solde va du côté le plus faible : il sert à équilibrer les deux totaux.' },
          { erreur: 'Se tromper de moyen de paiement.', correction: "Relisez l'énoncé : « en espèces » désigne la caisse, « par la poste » ou « par la banque » un autre compte.", typique: 'moyen-de-paiement' },
          { erreur: 'Passer un seul côté.', correction: 'Le débit et le crédit portent toujours le même montant.' },
        ],
        questions: [
          { question: 'Le compte Emprunt bancaire à long terme diminue. De quel côté écrit-on ?', reponse: 'Au débit : c’est un passif, il augmente au crédit et diminue au débit.' },
          { question: "Le compte Dettes fournisseurs montre 9'000.00 au crédit et 6'500.00 au débit. Quel est son solde ?", reponse: "2'500.00, créditeur. On l'inscrit au débit pour équilibrer." },
          { question: "Le propriétaire dépose 2'000.00 de la caisse sur le compte bancaire. Quelle écriture ?", reponse: "Banque au débit, Caisse au crédit, 2'000.00." },
          { question: 'Pourquoi un compte de charge ou de produit n’a-t-il pas de solde initial ?', reponse: 'Parce qu’il mesure ce qui se passe pendant l’exercice : il repart de zéro chaque année.' },
        ],
        liens: { module: 'comptes', exercices: ['manuel-cfc1-favre-evenements'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Journal
    journal: [
      enrichir(journal, {
        objectifs: [
          'Rédiger une écriture simple et une écriture composée.',
          'Reporter une écriture du journal dans les comptes.',
          'Corriger une écriture par une extourne.',
        ],
        termes: [
          { terme: 'Journal', definition: "registre où l'on inscrit toutes les opérations dans l'ordre des dates." },
          { terme: 'Grand livre', definition: 'ensemble de tous les comptes.' },
          { terme: 'Libellé', definition: "courte description de l'opération." },
          { terme: 'Écriture simple', definition: 'un compte au débit, un compte au crédit.' },
          { terme: 'Écriture composée', definition: 'plus de deux comptes ; le total des débits égale le total des crédits.' },
          { terme: 'Extourne', definition: "écriture inverse, qui annule une écriture fausse." },
        ],
        sansSections: ['Facture comptabilisée ou non ?'],
        apres: {
          'Écriture composée': [
            {
              type: 'exemple',
              enonce: "Achat d'un ordinateur de 2'400.00 : 1'000.00 payés en espèces, le solde par la banque.",
              raisonnement: r3('Infrastructure informatique, Caisse et Banque.', 'Trois actifs.', "L'ordinateur augmente au débit ; la caisse et la banque diminuent au crédit."),
              calcul: ["Solde payé par la banque : 2'400.00 − 1'000.00 = 1'400.00."],
              lignes: [D('1521', 2400), C('1000', 1000), C('1020', 1400)],
              effets: { actif: 'Total inchangé : permutation', resultat: 'Aucun effet' },
              conclusion: "Débit 2'400.00, crédits 1'000.00 + 1'400.00 = 2'400.00 : l'écriture est équilibrée.",
            },
          ],
          'Du journal au grand livre': [
            {
              type: 'contraste',
              cas: [
                { titre: 'Le journal', texte: ["Classe les opérations par date.", 'Répond à la question : que s’est-il passé le 12 mars ?'] },
                { titre: 'Le grand livre', texte: ['Classe les mêmes montants par compte.', 'Répond à la question : combien reste-t-il à la banque ?'] },
              ],
            },
          ],
        },
        erreurs: [
          { erreur: 'Effacer ou modifier à la main une écriture fausse.', correction: 'On l’extourne, puis on passe l’écriture juste : la correction reste visible.' },
          { erreur: 'Une écriture composée dont les deux côtés ne sont pas égaux.', correction: 'Additionnez les débits, puis les crédits, avant de valider.' },
          { erreur: 'Extourner avec un autre montant ou un autre compte.', correction: "L'extourne reprend exactement l'écriture fausse, débit et crédit inversés, sous le même numéro de pièce." },
        ],
        questions: [
          { question: 'Dans quel ordre le journal présente-t-il les écritures ?', reponse: 'Dans l’ordre chronologique.' },
          { question: "Achat d'une machine de 6'000.00 : 2'000.00 par la banque, le reste à crédit. Quelle écriture ?", reponse: "Machines et appareils 6'000.00 au débit ; Banque 2'000.00 et Autres dettes 4'000.00 au crédit." },
          { question: "Un loyer de 1'400.00 a été passé par erreur au débit de Publicité. Quelles écritures de correction ?", reponse: "Extourne : Banque / Publicité 1'400.00. Écriture juste : Loyers / Banque 1'400.00." },
          { question: 'Quelle est la différence entre le journal et le grand livre ?', reponse: 'Les mêmes écritures, classées par date dans le journal et par compte dans le grand livre.' },
        ],
        liens: { module: 'synthese-cfc1', exercices: ['demo-cfc1-cycles-du-leman', 'dossier-cfc1-saveurs-de-carouge'] },
      }),
      // ───────────────────────────────────────────────────────────────── Achats et ventes à crédit (nouveau)
      enrichir(
        {
          id: 'credit',
          titre: 'Achats et ventes à crédit : créances et dettes',
          niveau: 'CFC1',
          resume: 'La facture, puis le paiement : créances clients, dettes fournisseurs et autres dettes.',
          sections: [
            {
              titre: 'Comptant ou à crédit',
              blocs: [
                p("Au comptant, la marchandise et l'argent s'échangent en même temps : une seule écriture. À crédit, le vendeur livre aujourd'hui et accepte d'être payé plus tard, souvent à 30 jours."),
                p('Il y a alors deux moments, donc deux écritures : la facture, puis le paiement. Entre les deux, l’un doit de l’argent à l’autre, et les comptes doivent le montrer.'),
                { type: 'retenir', texte: 'À crédit : une écriture à la facture, une autre au paiement.' },
              ],
            },
            {
              titre: 'Vendre à crédit : la créance',
              blocs: [
                p("Le client a reçu la marchandise. La vente est faite : c'est un produit, qui compte pour l'exercice en cours. Le client nous doit le montant : c'est une créance, un actif."),
                {
                  type: 'exemple',
                  enonce: "Vente de vélos à un club le 3 mars, 6'400.00, payable à 30 jours.",
                  raisonnement: r3('Créances clients et Ventes de marchandises.', 'Un actif et un produit.', 'Les deux augmentent : la créance au débit, la vente au crédit.'),
                  lignes: s('1100', '3200', 6400),
                  effets: { actif: "Créances clients + 6'400.00", resultat: "Produits + 6'400.00" },
                  variante: {
                    enonce: 'Le 1er avril, le club paie par la banque.',
                    texte: ["La créance s'éteint et l'argent arrive. La vente est déjà comptée : on ne la repasse pas."],
                    lignes: s('1020', '1100', 6400),
                  },
                },
              ],
            },
            {
              titre: 'Acheter à crédit : deux comptes de dettes',
              blocs: [
                p("Quand l'entreprise reçoit une facture à payer plus tard, une dette apparaît. Le compte dépend de ce qui a été acheté."),
                {
                  type: 'contraste',
                  cas: [
                    { titre: '2000 Dettes fournisseurs', texte: ['Seulement pour des marchandises achetées pour être revendues.', "Exemple : des vélos destinés à la vente, 4'800.00."], lignes: s('4200', '2000', 4800) },
                    { titre: '2010 Autres dettes', texte: ["Tout le reste : véhicule, mobilier, machines, ordinateurs, services, frais.", "Exemple : une camionnette d'occasion, 12'500.00."], lignes: s('1530', '2010', 12500) },
                  ],
                },
              ],
            },
            section(journal, 'Facture comptabilisée ou non ?'),
            {
              titre: 'Payer en plusieurs fois',
              blocs: [
                p('Chaque versement diminue la dette du montant versé. Le reste demeure dans le compte jusqu’au dernier paiement.'),
                {
                  type: 'ecritures',
                  exemples: [
                    { cas: "Premier versement sur la facture de la camionnette, par la banque", lignes: s('2010', '1020', 5000) },
                    { cas: 'Second versement, par la banque', lignes: s('2010', '1020', 7500) },
                  ],
                },
                { type: 'compteT', compte: '2010', debit: [P('Premier versement', 5000), P('Second versement', 7500)], credit: [P('Facture de la camionnette', 12500)] },
              ],
            },
          ],
        },
        {
          objectifs: [
            'Comptabiliser une facture envoyée ou reçue, puis son paiement.',
            'Choisir entre Dettes fournisseurs et Autres dettes.',
            "Reconnaître dans un énoncé si la facture est déjà comptabilisée.",
          ],
          termes: [
            { terme: 'Facture', definition: 'document par lequel le vendeur réclame le prix de ce qu’il a livré.' },
            { terme: 'Échéance', definition: 'date à laquelle la facture doit être payée.' },
            { terme: 'Créance', definition: 'ce qu’un client nous doit.' },
            { terme: 'Dette', definition: 'ce que nous devons à un tiers.' },
          ],
          erreurs: [
            { erreur: 'Mettre en Dettes fournisseurs une facture qui ne concerne pas des marchandises.', correction: 'Véhicule, mobilier, publicité, réparation : Autres dettes.', typique: 'autres-dettes-en-fournisseurs' },
            { erreur: 'Mettre en Autres dettes une facture de marchandises à revendre.', correction: 'Les marchandises destinées à la vente vont en Dettes fournisseurs.', typique: 'fournisseurs-en-autres-dettes' },
            { erreur: 'Repasser la charge ou l’achat au moment du paiement.', correction: 'La facture est déjà comptabilisée : le paiement ne touche que la dette et la banque.', typique: 'paiement-en-charge' },
            { erreur: 'Repasser la vente au moment où le client paie.', correction: "L'encaissement éteint la créance ; la vente a été comptée à la facture.", typique: 'encaissement-en-vente' },
            { erreur: 'Faire sortir de l’argent alors que rien n’est payé.', correction: '« À crédit » ou « à 30 jours » : ni la caisse ni la banque ne bougent à la facture.', typique: 'credit-paye-comptant-fournisseur' },
          ],
          questions: [
            { question: "Le magasin reçoit la facture d'un présentoir, 1'900.00, payable à 30 jours. Quelle écriture ?", reponse: "Mobilier et installations / Autres dettes, 1'900.00." },
            { question: 'Et pour la facture de 60 chambres à air destinées à la vente, 480.00 ?', reponse: 'Achats de marchandises / Dettes fournisseurs, 480.00.' },
            { question: "Un client règle par la banque une facture de 2'300.00 déjà comptabilisée. Quelle écriture ?", reponse: "Banque / Créances clients, 2'300.00." },
            { question: "L'énoncé dit : « facture non comptabilisée, payée par la banque ». Faut-il passer par une dette ?", reponse: 'Non : on passe directement l’achat ou la charge contre la banque.' },
          ],
          liens: { module: 'factures', exercices: ['manuel-cfc1-favre-evenements', 'dossier-cfc1-garage-pont-rouge'] },
        },
      ),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Compte de résultat
    resultat: [
      enrichir(resultat, {
        titre: 'Charges, produits et compte de résultat',
        resume: "Mesurer ce que l'activité rapporte et ce qu'elle coûte, puis calculer le bénéfice ou la perte.",
        objectifs: [
          'Reconnaître une charge, un produit et un investissement.',
          'Comptabiliser les charges et les produits courants.',
          'Établir un compte de résultat et lire son résultat.',
        ],
        termes: [
          { terme: 'Charge', definition: "ce que l'activité consomme pendant l'exercice : loyer, salaires, marchandises achetées." },
          { terme: 'Produit', definition: "ce que l'activité rapporte pendant l'exercice : ventes, prestations." },
          { terme: 'Résultat', definition: 'différence entre les produits et les charges.' },
          { terme: 'Bénéfice, perte', definition: 'résultat positif, résultat négatif.' },
          { terme: 'Comptes de gestion', definition: 'comptes de charges et de produits.' },
        ],
        sansSections: ['Le compte privé de la raison individuelle', 'Le bouclement : résultat et compte privé'],
        apres: {
          'Le compte de résultat': [
            p("Un produit augmente ce qui revient au propriétaire : il se comporte comme le capital et augmente au crédit. Une charge fait l'inverse : elle augmente au débit."),
            {
              type: 'exemple',
              enonce: "Paiement du loyer du mois par la banque, 1'850.00.",
              raisonnement: r3('Loyers et Banque.', 'Une charge et un actif.', 'La charge augmente au débit, la banque diminue au crédit.'),
              lignes: s('6000', '1020', 1850),
              effets: { actif: "Banque − 1'850.00", resultat: "Charges + 1'850.00 : le bénéfice diminue" },
              variante: { enonce: 'Ventes au comptant de la journée, 900.00.', texte: ['La caisse augmente au débit, le produit au crédit : le bénéfice augmente de 900.00.'], lignes: s('1000', '3200', 900) },
            },
            {
              type: 'tableau',
              entetes: ['Charges', 'CHF', 'Produits', 'CHF'],
              lignes: [
                ['Achats de marchandises', "7'400.00", 'Ventes de marchandises', "18'750.00"],
                ['Salaires', "4'200.00", '', ''],
                ['Loyers', "2'400.00", '', ''],
                ['Assurances', '520.00', '', ''],
                ['Publicité', '700.00', '', ''],
                ["Bénéfice de l'exercice", "3'530.00", '', ''],
                ['Total', "18'750.00", 'Total', "18'750.00"],
              ],
            },
          ],
          "Effet d'une opération sur le résultat et sur le bilan": [
            {
              type: 'contraste',
              cas: [
                { titre: 'Une charge', texte: ["Consommée pendant l'exercice : il n'en reste rien à la fin.", 'Exemple : un plein de carburant payé en espèces, 95.00.'], lignes: s('6200', '1000', 95) },
                { titre: 'Un investissement', texte: ["Un bien qui sert plusieurs années : il figure au bilan.", "Exemple : une camionnette achetée à crédit, 12'500.00."], lignes: s('1530', '2010', 12500) },
              ],
            },
          ],
        },
        erreurs: [
          { erreur: 'Passer un bien durable en charge.', correction: 'Un véhicule ou un ordinateur est un actif immobilisé, pas une charge.', typique: 'investissement-en-charge' },
          { erreur: 'Passer une dépense courante en actif.', correction: 'Le carburant, le loyer ou une réparation sont consommés dans l’exercice : ce sont des charges.', typique: 'charge-en-investissement' },
          { erreur: "Compter le remboursement d'un emprunt comme une charge.", correction: 'On rend de l’argent dû : seuls des comptes du bilan bougent, le résultat ne change pas.' },
          { erreur: 'Inscrire le bénéfice du côté des produits.', correction: 'Le bénéfice équilibre le compte de résultat : il s’inscrit du côté des charges.' },
        ],
        questions: [
          { question: "L'entreprise achète une armoire à 1'400.00 et paie 180.00 de nettoyage des locaux. Charge ou investissement ?", reponse: "L'armoire est un investissement (Mobilier et installations). Le nettoyage est une charge." },
          { question: "Produits 52'000.00, charges 47'300.00. Quel est le résultat, et de quel côté l'inscrit-on ?", reponse: "Un bénéfice de 4'700.00, inscrit du côté des charges." },
          { question: 'Un retrait à la banque pour alimenter la caisse modifie-t-il le résultat ?', reponse: 'Non : l’écriture ne contient ni charge ni produit.' },
          { question: 'Pourquoi un produit augmente-t-il au crédit ?', reponse: 'Parce qu’il augmente les capitaux propres, qui sont au passif et augmentent au crédit.' },
        ],
        liens: { module: 'charges-produits', exercices: ['prop-cfc1-atelier-lumen', 'demo-cfc1-cycles-du-leman'] },
      }),
      // ───────────────────────────────────────────────────────────── Compte privé et bouclement (découpage)
      enrichir(
        {
          id: 'prive',
          titre: 'Compte privé et bouclement de la raison individuelle',
          niveau: 'CFC1',
          resume: "Séparer l'entreprise de son propriétaire, puis boucler l'exercice.",
          bases: resultat.bases,
          sections: [section(resultat, 'Le compte privé de la raison individuelle'), section(resultat, 'Le bouclement : résultat et compte privé')],
        },
        {
          objectifs: [
            'Distinguer une dépense privée d’une charge de l’entreprise.',
            'Comptabiliser les prélèvements et les apports du propriétaire.',
            'Passer les deux écritures de bouclement et calculer le nouveau capital.',
          ],
          termes: [
            { terme: 'Raison individuelle', definition: 'entreprise qui appartient à une seule personne.' },
            { terme: 'Prélèvement privé', definition: "ce que le propriétaire prend dans l'entreprise pour ses besoins personnels." },
            { terme: 'Apport', definition: "ce que le propriétaire met durablement dans l'entreprise." },
            { terme: 'Bouclement', definition: "écritures de fin d'exercice qui portent le résultat et le compte privé au capital." },
          ],
          apres: {
            'Le compte privé de la raison individuelle': [
              p("L'entreprise et son propriétaire sont tenus séparés en comptabilité. Le compte de résultat doit montrer ce que le commerce gagne : une dépense de la famille n'y a pas sa place."),
              {
                type: 'contraste',
                cas: [
                  { titre: 'Dépense privée', texte: ["Elle sert à la personne, même si c'est la banque de l'entreprise qui paie.", "Exemple : la facture de l'opticien du propriétaire, 290.00."], lignes: s('2850', '1020', 290) },
                  { titre: "Charge de l'entreprise", texte: ["Elle sert à l'activité.", "Exemple : le loyer du magasin, 1'850.00."], lignes: s('6000', '1020', 1850) },
                ],
              },
              {
                type: 'ecritures',
                titre: 'Autres mouvements entre le propriétaire et son entreprise',
                exemples: [
                  { cas: 'Le propriétaire emporte des marchandises pour son usage personnel, 240.00', lignes: s('2850', '3720', 240) },
                  { cas: "Il apporte 8'500.00 sur le compte bancaire de l'entreprise", lignes: s('1020', '2800', 8500) },
                ],
              },
            ],
            'Le bouclement : résultat et compte privé': [
              {
                type: 'exemple',
                enonce: "Capital au 1er janvier 52'000.00 ; bénéfice de l'exercice 7'200.00 ; prélèvements privés 4'300.00.",
                calcul: ["B1 : le bénéfice est viré au compte privé.", "Le compte privé montre alors 4'300.00 au débit et 7'200.00 au crédit : solde créditeur de 2'900.00.", 'B2 : ce solde est viré au capital.'],
                lignes: [...s('9000', '2850', 7200), ...s('2850', '2800', 2900)],
                effets: { passif: "Capital + 2'900.00 : 54'900.00" },
                conclusion: "Le propriétaire a gagné 7'200.00 et en a retiré 4'300.00 : il a laissé 2'900.00 dans son entreprise.",
                variante: {
                  enonce: "Même exercice, mais avec 9'500.00 de prélèvements.",
                  texte: ["Le compte privé a un solde débiteur de 2'300.00. B2 s'inverse et le capital diminue : 49'700.00."],
                  lignes: s('2800', '2850', 2300),
                },
              },
              { type: 'compteT', compte: '2850', debit: [P('Prélèvements', 4300), P('B2, viré au capital', 2900)], credit: [P('B1, bénéfice', 7200)] },
            ],
          },
          erreurs: [
            { erreur: "Passer une dépense privée en charge de l'entreprise.", correction: 'Demandez-vous à qui la dépense sert. Si c’est au propriétaire : compte Privé.', typique: 'prive-en-charge' },
            { erreur: "Passer une charge de l'entreprise au compte Privé.", correction: 'Une dépense qui sert à l’activité reste une charge, même payée par le propriétaire.', typique: 'charge-en-prive' },
            { erreur: 'Oublier la seconde écriture de bouclement.', correction: 'Après B1, le compte Privé a encore un solde : B2 le vire au capital.' },
            { erreur: 'Enregistrer un prélèvement de marchandises comme une vente.', correction: 'Aucun client n’a payé : Privé au débit, Prestations propres au crédit.' },
          ],
          questions: [
            { question: "La banque de l'entreprise paie 185.00 pour l'abonnement de fitness du propriétaire. Quelle écriture ?", reponse: 'Privé / Banque, 185.00.' },
            { question: "Capital initial 35'000.00, bénéfice 8'000.00, prélèvements 10'500.00. Quel est le capital final ?", reponse: "35'000.00 + 8'000.00 − 10'500.00 = 32'500.00." },
            { question: "Avec ces chiffres, quelle est l'écriture B2 ?", reponse: "Le compte privé a un solde débiteur de 2'500.00 : Capital / Privé, 2'500.00." },
            { question: 'Pourquoi tenir un compte Privé plutôt que de débiter directement le capital ?', reponse: "Pour suivre pendant l'exercice ce que le propriétaire retire, sans modifier le capital à chaque prélèvement." },
          ],
          liens: { module: 'prive', exercices: ['demo-cfc1-cycles-du-leman', 'prop-cfc1-bouquinerie-du-bourg'] },
        },
      ),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Marchandises
    marchandises: [
      enrichir(de('marchandises'), {
        objectifs: [
          'Comptabiliser achats, ventes, retours, rabais, escomptes et frais.',
          'Enregistrer la variation du stock à la clôture.',
          'Calculer le CAN, le PRAMV et la marge brute.',
        ],
        termes: [
          { terme: 'Marchandise', definition: 'bien acheté pour être revendu sans transformation.' },
          { terme: 'Stock', definition: "marchandises que l'entreprise possède à une date." },
          { terme: 'Rabais, remise', definition: 'réduction de prix pour un défaut, une quantité ou un bon client.' },
          { terme: 'Escompte', definition: 'réduction pour un paiement rapide.' },
          { terme: 'CAN', definition: "chiffre d'affaires net : ce que les ventes rapportent vraiment." },
          { terme: 'PRAMV', definition: "prix de revient d'achat des marchandises vendues." },
          { terme: 'Marge brute', definition: 'CAN moins PRAMV.' },
        ],
        apres: {
          'Les quatre comptes de marchandises': [
            {
              type: 'contraste',
              cas: [
                { titre: 'Un retour', texte: ['La marchandise repart : on défait une partie de la facture.', 'Retour au fournisseur, 700.00.'], lignes: s('2000', '4200', 700) },
                { titre: 'Un rabais', texte: ['La marchandise reste, son prix baisse.', 'Rabais obtenu du fournisseur, 300.00.'], lignes: s('2000', '4209', 300) },
              ],
            },
          ],
          'Rabais, remises et escomptes': [
            {
              type: 'exemple',
              enonce: "Nous payons par la banque une facture de marchandises de 4'800.00, sous déduction de 2 % d'escompte.",
              raisonnement: r3('Dettes fournisseurs, Banque et Déductions obtenues.', 'Un passif, un actif et un compte qui diminue les achats.', "La dette s'éteint au débit ; la banque diminue et la déduction s'inscrit au crédit."),
              calcul: ["Escompte : 4'800.00 × 2 % = 96.00. Montant payé : 4'800.00 − 96.00 = 4'704.00."],
              lignes: [D('2000', 4800), C('1020', 4704), C('4209', 96)],
              effets: { actif: "Banque − 4'704.00", passif: "Dettes fournisseurs − 4'800.00", resultat: 'Charges − 96.00 : le bénéfice augmente' },
              conclusion: "La dette est éteinte pour son montant entier, alors que 4'704.00 seulement ont été versés.",
              variante: {
                enonce: "Un client paie par la banque une facture de 6'400.00 sous déduction de 2 % d'escompte.",
                texte: ["Escompte : 128.00. Montant reçu : 6'272.00. La créance s'éteint entièrement."],
                lignes: [D('1020', 6272), D('3209', 128), C('1100', 6400)],
              },
            },
          ],
          "Variation du stock en fin d'exercice": [
            {
              type: 'exemple',
              enonce: "Stock au 1er janvier 12'000.00 ; inventaire au 31 décembre 14'500.00.",
              calcul: ["Variation : 14'500.00 − 12'000.00 = 2'500.00 d'augmentation.", "Une partie des achats de l'exercice n'a pas été vendue : on la retire des charges."],
              lignes: s('1200', '4280', 2500),
              effets: { actif: "Stock + 2'500.00", resultat: "Charges − 2'500.00 : le bénéfice augmente" },
              variante: { enonce: "Si l'inventaire donnait 10'800.00.", texte: ["Diminution de 1'200.00 : on a vendu plus qu'on a acheté, la charge augmente."], lignes: s('4280', '1200', 1200) },
            },
          ],
        },
        erreurs: [
          { erreur: 'Passer un achat de marchandises dans le compte Stock.', correction: "Pendant l'exercice, les achats vont dans Achats de marchandises ; le stock n'est corrigé qu'à la clôture.", typique: 'achat-en-stock' },
          { erreur: 'Créditer le compte Stock lors d’une vente.', correction: 'Une vente va dans Ventes de marchandises.', typique: 'vente-en-stock' },
          { erreur: "Avec un escompte, n'éteindre la dette que du montant payé.", correction: 'La dette ou la créance est soldée pour son montant entier ; la différence est la déduction.' },
          { erreur: "Confondre frais d'achats et frais de ventes.", correction: 'Faire venir la marchandise : Frais d’achats. La livrer au client : Frais de ventes.' },
          { erreur: "Inverser l'écriture de variation du stock.", correction: 'Stock en hausse : Stock au débit. Stock en baisse : Variation de stocks au débit.' },
        ],
        questions: [
          { question: "Nous payons une facture de 3'000.00 avec 2 % d'escompte. Combien versons-nous, et dans quel compte va l'escompte ?", reponse: "2'940.00. L'escompte de 60.00 va au crédit de Déductions obtenues." },
          { question: "CAN 80'000.00, PRAMA 52'000.00, le stock a diminué de 3'000.00. Quelle est la marge brute ?", reponse: "PRAMV = 55'000.00. Marge brute = 25'000.00." },
          { question: 'Un client retourne pour 800.00 de marchandises facturées. Quelle écriture ?', reponse: 'Ventes de marchandises / Créances clients, 800.00.' },
          { question: 'Pourquoi une augmentation du stock augmente-t-elle le bénéfice ?', reponse: 'Parce que les marchandises non vendues ne sont pas une charge de l’exercice : on les retire des achats.' },
          { question: 'Dans quel compte passe-t-on les droits de douane payés sur un achat de marchandises ?', reponse: 'Frais d’achats.' },
        ],
        liens: { module: 'marchandises', exercices: ['manuel-cfc1-vinotheque-des-paquis', 'dossier-cfc1-hifi-plainpalais'] },
      }),
    ],

    // ─────────────────────────────────────────────────────────────────────────── Échelle des prix
    prix: [
      enrichir(de('prix'), {
        objectifs: [
          "Calculer chaque étape, du prix d'achat brut au prix de vente brut.",
          'Repérer la base de chaque pourcentage.',
          'Utiliser un nombre clé.',
        ],
        termes: [
          { terme: 'Base', definition: 'prix qui vaut 100 % pour le pourcentage que l’on calcule.' },
          { terme: 'Frais généraux', definition: "charges de l'entreprise réparties sur les articles : salaires, loyer, publicité." },
          { terme: 'Bénéfice brut', definition: 'frais généraux plus bénéfice net : la différence entre le PVN et le PRA.' },
          { terme: 'Nombre clé', definition: "coefficient qui fait passer d'un prix à un autre en une multiplication." },
        ],
        sections: [
          {
            titre: "Un exemple d'un bout à l'autre",
            blocs: [
              {
                type: 'exemple',
                enonce: "PAB 500.00 ; rabais obtenu 20 % ; escompte obtenu 5 % ; frais d'achat 20.00 ; frais généraux 40 % du PRA ; bénéfice net 22,5 % du PR ; escompte accordé 2 % ; rabais accordé 12,5 %.",
                calcul: [
                  'PAC = 500.00 − 20 % = 400.00.',
                  'PAN = 400.00 − 5 % = 380.00.',
                  'PRA = 380.00 + 20.00 = 400.00.',
                  'PR = 400.00 + 40 % = 560.00.',
                  'PVN = 560.00 + 22,5 % = 686.00.',
                  'PVC = 686.00 ÷ 98 % = 700.00.',
                  'PVB = 700.00 ÷ 87,5 % = 800.00.',
                ],
                conclusion: 'Bénéfice brut : 686.00 − 400.00 = 286.00, soit 160.00 de frais généraux et 126.00 de bénéfice net.',
              },
              {
                type: 'contraste',
                cas: [
                  { titre: 'La base est connue : on multiplie', texte: ['Rabais obtenu de 20 % du PAB : 500.00 × 20 % = 100.00.', 'On connaît le prix qui vaut 100 %.'] },
                  { titre: 'La base est ce que l’on cherche : on divise', texte: ['Escompte accordé de 2 % du PVC : le PVN vaut 98 % du PVC, donc PVC = 686.00 ÷ 98 %.', 'Ajouter 2 % de 686.00 donnerait un résultat faux.'] },
                ],
              },
            ],
          },
        ],
        erreurs: [
          { erreur: "Calculer l'escompte accordé sur le PVN.", correction: "Il se calcule sur le PVC, que l'on cherche : on divise le PVN par (100 − taux) %." },
          { erreur: 'Additionner des pourcentages qui n’ont pas la même base.', correction: 'Un rabais de 20 % puis un escompte de 5 % ne font pas 25 % : le second se calcule sur le prix déjà réduit.' },
          { erreur: "Oublier les frais d'achat.", correction: "Ils s'ajoutent au PAN pour donner le PRA : c'est le coût de la marchandise arrivée dans l'entreprise." },
        ],
        questions: [
          { question: 'PAB 800.00, rabais 10 %, escompte 2 %. Quel est le PAN ?', reponse: 'PAC = 720.00. PAN = 720.00 − 14.40 = 705.60.' },
          { question: 'PRA 300.00, frais généraux 30 % du PRA, bénéfice net 20 % du PR. Quel est le PVN ?', reponse: 'PR = 390.00. PVN = 390.00 + 78.00 = 468.00.' },
          { question: 'Le PVN vaut 441.00 et le client a droit à 2 % d’escompte. Quel est le PVC ?', reponse: '441.00 ÷ 98 % = 450.00.' },
          { question: 'PAN 200.00 et PVN 290.00. Quel est le nombre clé pour passer du PAN au PVN ?', reponse: '290 ÷ 200 = 1,45.' },
        ],
        liens: { exercices: ['manuel-cfc1-vinotheque-des-paquis'] },
      }),
    ],
  };

  return valides.flatMap((c) => enrichis[c.id] ?? [c]);
}
