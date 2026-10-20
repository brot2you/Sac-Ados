# SAC’ADOS — V4.4, accueil carte uniquement

Cette version repart de **V4.2** pour conserver le catalogue, les 40 visuels cadrés, la fiche d’application RPG, l’inventaire, et tous les réglages.

## Changement d’interface

L’écran **Accueil** présente UNIQUEMENT la grande carte des quatre mondes. Suppression de l’aperçu du sac à droite et des panneaux de disciplines, de quêtes et de progression sous la carte. Le menu RPG illustré, dans sa version PNG détourée, se situe sous la carte sur grand écran et reste fixé en bas sur téléphone. **Mon sac** ouvre l’inventaire de la classe choisie. Les quatre zones de la carte continuent à ouvrir directement leurs mondes. Les libellés de niveau sont légèrement renforcés sur petits écrans à l’intérieur de la carte.

Aucune modification du catalogue ni des liens, aucun effacement des favoris/découvertes (`localStorage` `sacados_v1`).  
Les fonctions Quêtes, Découvertes, Réglages, Espace professeur, recherche et filtres demeurent disponibles via les écrans existants.

## Installation GitHub Pages

Décompresser le ZIP, copier le contenu (`index.html`, `css`, `js`, `assets`) à la racine du dépôt puis Commit et Push. Aucun serveur ni compilation requis. Lors d’un changement de version, recharger sans cache si nécessaire (Ctrl+F5).

## Fichiers modifiés

- `js/app.js` : `renderMap()` simplifié uniquement.
- `index.html` : ajout du style dédié.
- `css/home-v4.4.css` : dispositions carte seule, responsive et positionnement du menu.

Les autres écrans et visuels restent ceux de la version précédente.
