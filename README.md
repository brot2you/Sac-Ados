# SAC’ADOS V4.5 — Menu centré, planches aérées, icônes dorées, sons rétro

**Base : V4.4 complète.** Catalogue, liens, carte, inventaire, écran professeur, favoris et données locales conservés.

- Le menu RPG reste à sa place sous la carte d’accueil sur ordinateur et est **recentré** sur les pages Sac, Quêtes et Découvertes. Sur tablette/téléphone, il reste fixé et centré.
- Les 32 illustrations d’applications utilisent des compositions **à marges peintes d’origine** : pas de recadrage brutal de la scène, `object-fit: contain` partout.
- Nouvelle série de 8 disciplines à bordures dorées, plus 5 **planches 4 × 2** faciles à examiner et découper avec **68px de gouttières** entre images ; les planches sont des visuels de vérification, les vrais fichiers sont déjà séparés dans `assets/illustrations/`.
- Reflets d’or animés (CSS) sur les icônes et les cartes, désactivés par « Mode calme » et `prefers-reduced-motion`.
- Sons 8-bit brefs, synthétisés en local par WebAudio au clic. **On/Off** en haut et dans Réglages ; choix enregistré dans `sacados_v1`. Aucun fichier externe à télécharger.

## Installer
Décompresser et copier **le contenu du dossier** dans le dépôt GitHub, puis Commit/Push. Les planches `PLANCHES-RECADRAGE/` ne sont pas nécessaires au fonctionnement de l’application et peuvent rester sur ton ordinateur.

## Mise à jour légère
Le ZIP « mise à jour » ne contient que le `index.html`, `js/app.js`, `css/finish-v4.5.css` et les **40 illustrations modifiées**. Copie son contenu à la racine du dépôt en autorisant le remplacement ; ne supprime pas les dossiers déjà présents.
