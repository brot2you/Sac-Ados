# Sac’Ados — le kit du collégien

Hub des applications BROT2YOU pour le collège (6e → 3e) : une carte avec une île par niveau et un « sac d’aventurier » qui range les applis par type et par matière.
En ligne : https://brot2you.github.io/Sac-Ados/

## Ce qu’il y a dans le dossier

| Fichier | Rôle |
|---|---|
| `index.html` | La page et le **catalogue des applis** (bloc `<script id="catalogue">`) |
| `css/sacados.css` | **Toute** la mise en forme, en un seul fichier |
| `js/sacados.js` | Le fonctionnement de l’appli (carte, sac, quêtes, réglages…) |
| `js/responsive-v5.4.js` | Ajustements smartphone / tablette |
| `js/pwa-v1.js`, `service-worker.js`, `manifest.webmanifest` | Installation sur téléphone (PWA) et mode hors ligne |
| `assets/` | Illustrations (WebP), icônes, carte des mondes |

## Ajouter ou modifier une appli

Dans `index.html`, bloc `catalogue` → liste `applis`. Une appli = une ligne :

```json
{"id": "mon-appli", "nom": "Mon Appli", "emoji": "🎯", "disc": "anglais", "type": "jouer",
 "niveaux": [5, 4], "duree": "10 min", "url": "https://brot2you.github.io/Mon-Appli/", "desc": "Une phrase pour l’élève."}
```

- `disc` : anglais, francais, histoire, geo, maths, musique, arts, eps, svt, physique, technologie, espagnol, allemand, italien, emc, toutes
- `type` : jouer, entrainer, lire, comprendre, soin
- Illustration : `assets/illustrations/applications/<id>.webp` (carré, 640 × 640 px suffit)

## Règles pour garder le dépôt léger

1. **Images en WebP**, 640 px de large pour une illustration d’appli, 1800 px max pour une bannière. Plus besoin des PNG de 2 Mo.
2. **Une correction de style = quelques lignes ajoutées à la fin de `css/sacados.css`**, pas un nouveau fichier.
3. **Pas de copie `app-v110.js`** : on modifie `js/sacados.js`. L’historique des versions est déjà gardé par GitHub.
4. Après une modification de `sacados.js` ou `sacados.css`, augmenter le numéro `?v=` dans `index.html` pour que les élèves reçoivent la nouvelle version.
5. Après une modification de `service-worker.js`, augmenter `VERSION` en haut du fichier.

## Historique

- **V6** (nov. 2026) : ménage du dépôt (89 Mo → 11 Mo, 317 → 120 fichiers), 14 feuilles CSS fusionnées, images converties en WebP (≈ 57 Mo → 8 Mo pour les visuels utilisés), « Mon sac » plus clair (« Tout mon sac » + bouton vers son monde), repère « Ton île » sur la carte, vignettes 4e/3e sans étiquette coupée, zones tactiles de l’en-tête agrandies.
- V5.x : PWA, nouvelle icône, catégories dorées, responsive.
- V4.x : carte des mondes, inventaire, sons rétro, mode calme.
