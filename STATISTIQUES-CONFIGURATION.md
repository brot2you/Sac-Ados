# Statistiques de Sac’Ados — tableau de bord privé

**État : prêt à connecter, mais collecte désactivée.** Aucun chiffre antérieur à l'activation ne peut être reconstitué.

## 1. Créer le tableau de bord

1. Ouvrir https://cloud.umami.is/ et créer un compte personnel.
2. Choisir la région de traitement des données appropriée, en tenant compte des obligations de l'établissement.
3. Aller dans **Websites → Add website**.
4. Nom : **Sac’Ados**. Domaine : **brot2you.github.io**.
5. Ouvrir la fiche de ce site → **Tracking code** puis copier uniquement la valeur **Website ID** (UUID, par exemple 00000000-0000-0000-0000-000000000000). Ce n'est **pas** un mot de passe ou une clé API.
6. Dans **js/sacados-analytics.js**, remplacer `var WEBSITE_ID = '';` par le UUID copié, en conservant les apostrophes.
7. Publier sur GitHub. Sur https://brot2you.github.io/Sac-Ados/, le suivi est alors activé et les données commencent à apparaître dans Umami.

Un seul compte Umami est nécessaire : **les élèves n'ont aucun compte à créer**. Le tableau de bord doit rester **privé**. Ne pas publier les liens de partage public, les clés API, des exports de données brutes ou des mots de passe sur GitHub.

## 2. Indicateurs disponibles dans Umami

| Rubrique Umami | Contenu attendu |
| --- | --- |
| Overview | Visites, visiteurs, pages vues, évolution par jour et période sélectionnée |
| Referrers | Provenance des visites (liens entrants, moteurs de recherche, etc.) |
| Devices / Browsers | Appareils et navigateurs, agrégés |
| Pages | Fréquentation du portail Sac’Ados |
| Events → **lancement_application** → propriété **application** | Nombre de clics sur chaque bouton « Lancer » ; classement des applications |
| Events → **fiche_application** → propriété **application** | Nombre d'ouvertures des fiches détaillées |
| Events → **section_visitee** → propriété **section** | Navigation vers Mon sac, Mes quêtes, Découvertes, etc. |

**Différences importantes** : un lancement est un clic de départ depuis Sac’Ados, **pas** une preuve que l'élève a terminé ou utilisé l'application. Les applications sont sur d'autres sites : leur usage interne n'est pas mesuré ici. Le nombre de visiteurs uniques repose sur la méthode d'estimation du prestataire et n'identifie pas les élèves.

## 3. Respect de la vie privée

- Aucun nom, prénom, adresse e-mail, identifiant scolaire, texte libre, réponse d'élève ou classe individuelle n'est envoyé par le code d'événement Sac’Ados.
- Les événements contiennent seulement l'identifiant public de l'application ou le nom générique de la rubrique.
- Le traceur Umami est paramétré pour respecter **Do Not Track** et ignorer les paramètres de recherche dans les URL.
- Umami peut néanmoins traiter des données techniques de navigation et de réseau nécessaires à son fonctionnement. L'absence de cookies ne signifie pas automatiquement l'absence de données personnelles.
- Pour un portail utilisé par des mineurs en contexte scolaire, **vérifier les obligations RGPD, information et éventuel consentement/exemption** auprès du DPO de l'établissement ou de l'académie avant d'activer. Paramétrer la durée de conservation et le lieu d'hébergement de manière adaptée.
- L'outil n'est pas activé tant que **WEBSITE_ID** est vide.

## 4. Coûts

Le service Umami Cloud propose une formule Hobby gratuite avec des limites de volume et de conservation susceptibles d'évoluer. Vérifier les conditions du plan avant activation : https://umami.is/pricing

La collecte n'utilise **ni Firebase, ni Firestore**, et n'engendre donc pas de lecture/écriture Firebase.

## 5. Dépannage

- Si aucune visite n'apparaît, vérifier le UUID dans **js/sacados-analytics.js** et la publication GitHub Pages.
- Le script charge **https://cloud.umami.is/script.js** uniquement après configuration ; certains bloqueurs peuvent empêcher le suivi.
- Ouvrir Sac’Ados et lancer une application via une fiche ou un raccourci : l'événement doit ensuite être visible dans Umami → Events.
- Pour arrêter immédiatement la collecte, remettre `var WEBSITE_ID = '';` et publier la modification.
- Les données collectées par le passé restent gérées dans le compte Umami ; retirer le script ne les supprime pas.

Documentation officielle : https://docs.umami.is/docs/collect-data et https://docs.umami.is/docs/track-events
