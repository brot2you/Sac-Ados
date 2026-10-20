# SAC’ADOS — PIXEL KINGDOM DELUXE V4

Refonte visuelle du portail d'applications éducatives Sac’Ados à partir du concept graphique pixel art validé.

## Installer sur GitHub Pages

1. Décompresser l'archive ZIP.
2. Copier **le contenu du dossier** à la racine du dépôt GitHub (index.html, css/, js/, assets/, README.md).
3. Commit + Push origin avec GitHub Desktop.
4. Laisser GitHub Pages publier la nouvelle version et recharger la page (Ctrl+F5 si les images sont en cache).

Aucun serveur, module npm ou compilateur n'est requis.

## Fonctionnalités conservées

- Carte interactive des mondes 6e, 5e, 4e et 3e ; sur mobile, de grands boutons de niveau accessibles.
- Catalogue de 31 applications existantes, auxquelles est ajouté Dino Buddy Park (32 entrées au total).
- 5 catégories, filtres par discipline, recherche, choix de la classe, fenêtres de présentation et liens.
- Quêtes du jour, suivi des applications lancées, favoris et leurs six raccourcis.
- Espace professeur et personnalisation locale des URLs ; sauvegarde `localStorage` **sacados_v1** intacte.
- Police Lexend, mode calme et navigation clavier.
- Les liens vides restent explicitement « Lien à venir ». Le compteur est un compteur d'applications *ouvertes*, pas d'activités terminées.

## Direction artistique

- Décor principal en pixel art HD, conserver la carte 4 mondes.
- Menu inférieur V2.2 conservé, avec détourage validé, intégré au panneau de carte sur grand écran.
- Inventaire bleu nuit / cuivre / parchemin inspiré du modèle validé.
- Les huit jaquettes principales de l'accueil utilisent les illustrations validées sur la maquette.
- Le catalogue possède un visuel pour chaque entrée ; **plusieurs jaquettes secondaires utilisent encore des extraits de décors de la carte**. Elles constituent des visuels transitoires et pourront être remplacées individuellement au fil des versions. Elles ne sont pas présentées comme des œuvres illustrées spécifiquement pour chaque application.
- Les noms, descriptions, catégories et boutons sont des éléments HTML indépendants des images.

## Fichiers principaux

- `index.html` — configuration et catalogue JSON.
- `js/app.js` — navigation, catalogue, stockage et interactions.
- `css/base.css`, `css/pixel.css`, `css/nav-v2.2.css`, `css/pixel-v3.css`, `css/pixel-v4.css` — styles.
- `assets/worlds/` — carte et bannières.
- `assets/premium/covers/` — visuels du catalogue.
- `assets/premium/icons/` — blasons et disciplines.
- `assets/premium/categories/` — types d'activités.
- `assets/premium/decor/` — décor de l'inventaire.
- `assets/ui/` — nav V2.2 préservée.

## Contrôles

Vérification fonctionnelle Chromium : ouvertures des mondes, sélection d'applications, recherche, fenêtre de détail, favoris, quêtes, découvertes, changement de classe et persistance du stockage. Largeurs testées : 1440 px et 320 px. Des aperçus PNG ont été générés en 1440 px et 320 px. Le déploiement GitHub Pages n'a pas été effectué par l'assistant.
