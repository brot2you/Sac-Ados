# Sac’Ados — PWA v1 : installer l’appli sur smartphone

Sac’Ados devient installable (icône sur l’écran d’accueil, plein écran) et fonctionne hors ligne.

## Fichiers du correctif
- `index.html` : 8 lignes ajoutées dans <head> (manifest, icône iPhone, balises Apple) + 1 balise <script> en bas.
- `manifest.webmanifest` : nom, couleurs, icônes de l’appli.
- `service-worker.js` : mode hors ligne et mises à jour.
- `js/pwa-v1.js` : bandeau « Installer », ligne dans Réglages, modes d’emploi (iPhone, Android, PC, Mac), message « Nouvelle version ».
- `assets/pwa/` : 7 icônes générées depuis le logo V5.3.

## GitHub Desktop
Décompresse, copie le contenu à la racine du dépôt en autorisant le remplacement de `index.html`, puis Commit to main > Push origin. N’efface rien d’autre.

## Ensuite
- Quand tu modifies index.html, css, js ou images : rien de spécial, les élèves reçoivent la mise à jour automatiquement.
- Si tu ajoutes une nouvelle version d’index.html, garde les lignes « PWA » du <head> et la balise `js/pwa-v1.js`.
- Si tu modifies `service-worker.js` lui-même : change `VERSION` en haut du fichier (v1 → v2).
