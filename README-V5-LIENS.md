# SAC’ADOS V5 — Intégration des liens depuis le blog BROT2YOU

**Base conservée : V4.9 complète.** Carte seule à l’accueil, menu RPG centré, visuels, sons, favoris et espace prof inchangés.

**Source :** https://raw.githubusercontent.com/brot2you/BROT2YOU-the-blog/main/index.html — champs `appNom` / `appUrl` des articles. Références consultées le 21 octobre 2026.

**Bilan :** 32 applis au catalogue ; **21 liens disponibles** (dont Dino Buddy Park déjà reliée dans V4.9), **17 nouveaux liens ajoutés**, **11 fiches sans lien**.

> Les URL sont reprises à l’identique du blog. Le contrôle individuel du chargement HTTP des 21 applications n’a pas abouti dans cet environnement ; les adresses sont sourcées, mais leur disponibilité en temps réel n’est pas garantie.

## Catalogue et liens

| Application | État V5 | Origine du lien |
|---|---|---|
| My Survival Kit | [Ouvrir](https://brot2you.github.io/My-Survival-Kit/) | Blog BROT2YOU |
| Phonix | [Ouvrir](https://brot2you.github.io/Phonix/) | Blog BROT2YOU |
| VerbDojo | [Ouvrir](https://brot2you.github.io/Verb-Dojo/) | Blog BROT2YOU |
| Past Masters | [Ouvrir](https://brot2you.github.io/Past-Masters/) | Blog BROT2YOU |
| Grammar Arena | [Ouvrir](https://brot2you.github.io/Grammar-Arena/) | Blog BROT2YOU |
| Mind the Mistake! | [Ouvrir](https://brot2you.github.io/mind-the-mistake/) | Blog BROT2YOU |
| Word Up | Lien à venir | Non publié sur le blog consulté |
| Swipe ton English | [Ouvrir](https://brot2you.github.io/Swipe-Ton-English/) | Blog BROT2YOU |
| Ma créature anglaise | Lien à venir | Non publié sur le blog consulté |
| Dino Buddy Park | [Ouvrir](https://brot2you.github.io/Dino-Buddy-Park/) | Déjà présent en V4.9 |
| PixelQuest English | Lien à venir | Non publié sur le blog consulté |
| Books of Heroes | [Ouvrir](https://brot2you.github.io/BOOKS-OF-HEROES/) | Blog BROT2YOU |
| Make-Me-Read | [Ouvrir](https://brot2you.github.io/Make-Me-Read/) | Blog BROT2YOU |
| PlumeCraft | Lien à venir | Non publié sur le blog consulté |
| Ravensmoor | [Ouvrir](https://brot2you.github.io/Ravensmoor/) | Blog BROT2YOU |
| Frequency Zero | Lien à venir | Non publié sur le blog consulté |
| Whodunnit Logic Puzzle | Lien à venir | Non publié sur le blog consulté |
| L’arbre des devoirs | [Ouvrir](https://brot2you.github.io/Arbre-des-devoirs/) | Blog BROT2YOU |
| Verbêtes | [Ouvrir](https://brot2you.github.io/Verbetes/) | Blog BROT2YOU |
| Corrige ta Copie | Lien à venir | Non publié sur le blog consulté |
| Le Grimoire du Style | Lien à venir | Non publié sur le blog consulté |
| La Frise vivante | [Ouvrir](https://brot2you.github.io/La-Frise/) | Blog BROT2YOU |
| Chronogramme | [Ouvrir](https://brot2you.github.io/Chronogramme/) | Blog BROT2YOU |
| Geopins | Lien à venir | Non publié sur le blog consulté |
| Le Kit de Survie en Maths | [Ouvrir](https://brot2you.github.io/Le-Kit-De-Survie-En-Maths/) | Blog BROT2YOU |
| Le Pupitre | Lien à venir | Non publié sur le blog consulté |
| L’Atelier | Lien à venir | Non publié sur le blog consulté |
| Swipe ton brevet | [Ouvrir](https://brot2you.github.io/Swipe-Ton-Brevet/) | Blog BROT2YOU |
| Mochi Check | [Ouvrir](https://brot2you.github.io/Mochi-Check/) | Blog BROT2YOU |
| Boost | [Ouvrir](https://brot2you.github.io/Boost/) | Blog BROT2YOU |
| Objectif devoirs | [Ouvrir](https://brot2you.github.io/Objectif-Devoirs/) | Blog BROT2YOU |
| CogniCoach | [Ouvrir](https://brot2you.github.io/Cognicoach/) | Blog BROT2YOU |

## Applications mentionnées sur le blog, mais absentes du catalogue Sac’Ados

- **Case Files** — application de lecture-enquête pour élèves : https://brot2you.github.io/Brot2you-Case-Files/
- **Culture Corner** — bibliothèque de ressources culturelles également destinée aux élèves : https://brot2you.github.io/Culture-Corner/

Ces deux applications **ne sont pas ajoutées automatiquement** : elles nécessitent des niveaux, des catégories et des illustrations cohérentes avec la DA.

## Installation GitHub Desktop

**Mise à jour légère :** seul `index.html` change. Dézippe, copie ce fichier à la racine du dépôt, puis **Commit to main → Push origin**. Le dossier `assets` est inchangé : ne le supprime pas.

**Version complète :** tous les fichiers du site, y compris le `index.html` mis à jour. Dézippe à la racine du dépôt, pas dans un dossier imbriqué.

## Vérifications

- JSON catalogue valide et 32 identifiants conservés.
- Les 21 liens se terminent tous par `/` et sont en HTTPS.
- Aucun lien construit à partir d’un nom supposé.
- Les 11 fiches sans URL restent visibles et leur bouton indique « Lien à venir ». 
- Compatibilité `localStorage` conservée : pas de suppression des réglages ou des favoris.
- Les liens personnalisés déjà enregistrés dans l’espace professeur de l’appareil continuent de primer sur les valeurs par défaut du catalogue.
