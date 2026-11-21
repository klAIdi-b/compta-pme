# Mettre le simulateur en ligne : ce que l'enseignant fait lui-même

Ces étapes ne se font qu'après l'accord de l'école ou du DIP sur l'usage d'un service en ligne avec les élèves. Seules des données anonymes du jeu y sont envoyées. En attendant, l'échange par fichier fonctionne déjà.

1. **Créer un compte** sur supabase.com, avec votre adresse professionnelle. Claude ne crée pas de compte à votre place.
2. **Créer un projet**, par exemple « compta-pme-simulateur », dans une région en Europe, en Suisse si elle est proposée. Notez le mot de passe de la base dans votre gestionnaire de mots de passe : il ne sera pas demandé par Compta PME.
3. **Exécuter le schéma** : dans le projet, ouvrez *SQL Editor*, collez le contenu de `supabase/schema.sql`, puis cliquez sur *Run*.
4. **Activer la connexion par e-mail** : *Authentication → Providers → Email* (lien magique). Dans *URL Configuration*, ajoutez l'adresse du site Compta PME publié aux adresses de retour autorisées.
5. **Relever deux valeurs**, dans *Project Settings → API* :
   - l'adresse du projet (*Project URL*) ;
   - la clé publique (*anon public*).
   Ces deux valeurs peuvent figurer dans le site. **La clé secrète (*service_role*) ne doit jamais être communiquée à personne, ni copiée dans Compta PME.**
6. Revenir vers Claude avec l'adresse du projet : il branchera l'interface et la testera avec vous.
