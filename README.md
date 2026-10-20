# Sac’Ados — Pixel Kingdom Deluxe | Étape 2.1 — menu RPG restauré

Refonte fonctionnelle et visuelle du fichier `index(7).html` fourni : le même catalogue, les mêmes réglages et la même clé de sauvegarde locale `sacados_v1` sont utilisés.

## Installation rapide sur GitHub Pages

1. Décompresser le ZIP.
2. Copier **le contenu du dossier** `SACADOS-PIXEL-KINGDOM-V2` dans la racine du dépôt GitHub (pas le dossier lui-même).
3. Vérifier que `index.html`, `css/`, `js/` et `assets/` se trouvent tous à la racine.
4. Commit puis Push sur `main` dans GitHub Desktop.
5. Pour GitHub Pages, vérifier `Settings > Pages > Deploy from a branch > main / (root)`.
6. Rafraîchir la page avec `Ctrl+F5` si l’ancienne version est mise en cache.

Vous pouvez aussi ouvrir `index.html` directement pour consulter l'application localement. Tous les visuels sont intégrés au projet. Les polices Web Google peuvent basculer sur des polices locales si vous êtes hors ligne.

## Fonctionnalités

- Carte en pixel art, avec quatre zones cliquables, navigation accessible au clavier et cartes alternatives.
- Quatre niveaux et biomes, bannière d'illustration par monde.
- Catalogue d'origine : 31 applications, matières, descriptions, niveaux, durées, types, indicateurs NEW/Bientôt.
- Sacs/inventaires avec filtres par poche et discipline et recherche instantanée.
- Fiches d'applications, lancement vers les liens existants, favoris (six raccourcis maximum).
- Onglets supplémentaires `Quêtes` et `Découvertes` qui exploitent l'état réel du catalogue.
- Réglages, choix de classe, mode calme, police Lexend et espace professeur conservés.
- État conservé dans `localStorage` sous **la clé originale** `sacados_v1`.
- Mise en page adaptable aux appareils de 320 pixels de large jusqu'aux ordinateurs.

## Important

Seuls **trois liens publics** étaient renseignés dans le catalogue fourni : Grammar Arena, Mind the Mistake! et Ravensmoor. Les autres liens apparaissent comme « Lien à venir » sans inventer de destination. Vous pouvez ajouter ces liens via l'espace professeur puis générer le catalogue à republier.

Les compteurs de découvertes indiquent les **applications ouvertes**, et ne prouvent pas que les exercices dans ces applications sont terminés. Les quêtes du jour sont des suggestions de découverte.

### Travail restant pour l'étape 3

La carte est intégrée à partir de la grande illustration réalisée à l'étape 1 : son logo et les panneaux nommant les îles sont **inclus dans le fichier image**. Les clics, les éléments de navigation et les données sont, eux, du vrai HTML/JavaScript indépendant de cette image. Pour une V3 plus propre, remplacer le fond par une nouvelle carte sans texte incorporé, garder les zones interactives HTML et créer des icônes/jaquettes individuelles pixel art ; les emojis actuellement utilisés sont des repères temporaires issus du catalogue initial.

## Fichiers

- `index.html` : squelette et catalogue JSON conservé.
- `css/base.css` : styles d'origine.
- `css/pixel.css` : direction artistique Pixel Kingdom Deluxe et responsive.
- `js/app.js` : fonctionnalités d'origine plus nouvelles pages.
- `assets/worlds/` : carte et quatre panoramas WebP optimisés.

## Validation réalisée

- Vérification de la syntaxe JavaScript (`node --check`).
- Tests interactifs de navigation (carte, entrée dans le monde), filtres, recherche, ouverture de fiche, ajout en favoris, Quêtes, Découvertes, changement de classe, conservation des favoris : **réussis**.
- Vérification de l’absence de débordement horizontal : écrans 1360, 390 et 320 px : **réussie**.
- Pas de vérification externe des URLs distantes ou du déploiement GitHub à ce stade.


## Correctif V2.1

- La barre de navigation du bas réutilise exactement le visuel pixel art validé, avec 5 grandes zones HTML cliquables : Accueil / Mon sac / Quêtes / Découvertes / Réglages.
- Sur téléphone, des boutons RPG natifs avec icônes extraites de ce même visuel assurent la lisibilité.
- Les six raccourcis ont été déplacés vers le bouton « Raccourcis » dans l’en-tête, afin de ne plus masquer la navigation.
- Les liens et sauvegardes `sacados_v1` sont inchangés.
