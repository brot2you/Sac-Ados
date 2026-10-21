SAC’ADOS V4.9 — Correctif définitif des résidus d’images

PROBLÈMES IDENTIFIÉS DANS LE CODE V4.8 :
(1) L’ancienne illustration “sac-banner.webp” intégrait une vieille image du sac tronquée ainsi qu’une lanterne sur la gauche.
(2) L’ancienne règle .pack::before/.pack::after ajoutait encore deux “bretelles” jaunes du sac d’origine.
(3) L’image du journal des quêtes portait toujours l’ancien nom quest.webp, ce qui permettait sa mise en cache.

CORRECTIONS :
- Suppression CSS de la bannière ancienne et de tous ses résidus, ainsi que des pseudo-éléments d’avant.
- Bannière de l’inventaire redessinée avec un fond de jeu original sans images tronquées.
- Icône sac indépendante, bien cadrée à droite et enregistrée sous backpack-v49.png.
- Nouvelle étoile bien cadrée sous quest-gold-v49.png, chargée par le JavaScript dans “Mes quêtes”, y compris Le Pic du Brevet.
- CSS et JavaScript avec ?v=49 pour éviter les caches des versions précédentes.
- Carte principale, barre de menu, sons, catalogue et progression inchangés.

INSTALLATION :
1. Extraire le ZIP CORRECTIF.
2. Copier LE CONTENU du ZIP dans la RACINE du dépôt SAC’ADOS (le dossier qui contient déjà index.html).
3. Ne pas copier de dossier englobant “SACADOS-PIXEL-KINGDOM-V4.9”.
4. GitHub Desktop : Changes → Commit to main → Push origin.
5. Après la publication GitHub Pages (attendre son déploiement) : Ctrl+F5.

Le ZIP CORRECTIF contient seulement cinq fichiers nécessaires. Ne pas supprimer les autres fichiers.
