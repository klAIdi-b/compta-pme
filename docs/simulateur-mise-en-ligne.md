# Mettre le simulateur en ligne : ce que l'enseignant fait lui-même

L'accord de l'école a été obtenu le 21.11.2026. Seules des données anonymes du jeu sont envoyées en ligne. L'échange par fichier reste disponible en secours.

1. **Créer un compte** sur supabase.com, avec votre adresse professionnelle. Claude ne crée pas de compte à votre place.
2. **Créer un projet**, par exemple « compta-pme-simulateur », dans une région en Europe, en Suisse si elle est proposée. Notez le mot de passe de la base dans votre gestionnaire de mots de passe : il ne sera pas demandé par Compta PME.
3. **Exécuter le schéma** : dans le projet, ouvrez *SQL Editor*, collez le contenu de `supabase/schema.sql`, puis cliquez sur *Run*.
4. **Activer la connexion par e-mail** : *Authentication → Providers → Email*, activé par défaut. Dans *Authentication → URL Configuration*, indiquez comme *Site URL* l'adresse du site publié, `https://klaidi-b.github.io/compta-pme/`, et ajoutez-la aussi aux *Redirect URLs*.
5. **Relever deux valeurs**, dans *Project Settings → API* :
   - l'adresse du projet (*Project URL*) ;
   - la clé publique (*anon public*).
   Ces deux valeurs peuvent figurer dans le site. **La clé secrète (*service_role*) ne doit jamais être communiquée à personne, ni copiée dans Compta PME.**
6. **Dans Compta PME** : ouvrez l'espace enseignant, onglet Simulateur, puis une partie. Dans la carte « Jouer en ligne », collez l'adresse du projet et la clé publique, puis cliquez sur *Enregistrer*. Il faut le faire une seule fois par navigateur.
7. **Se connecter** : indiquez votre adresse e-mail et cliquez sur « Recevoir le lien de connexion ». Ouvrez le lien reçu **sur le même poste et dans le même navigateur**, puis revenez dans l'onglet Simulateur.
8. **Mettre la partie en ligne** : vous obtenez le code de la partie, un lien à donner à tous les groupes et un code secret par équipe. Remettez à chaque groupe son code seulement.

En classe, les groupes ouvrent le lien, entrent leur code d'équipe et envoient leurs décisions. Leurs décisions arrivent d'elles-mêmes, la carte les relève toutes les 15 secondes. Après chaque calcul, les situations du tour suivant et les résultats sont publiés automatiquement. Les groupes cliquent alors sur « Actualiser ».

En fin d'année, effacez les parties dans le tableau de bord de Supabase (*Table Editor*, table `sim_parties` : supprimer une partie efface aussi ses équipes, ses situations, ses décisions et ses résultats).
