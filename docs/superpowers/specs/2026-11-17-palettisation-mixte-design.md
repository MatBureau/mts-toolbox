# Palettisation mixte — conception

Date : 2026-11-17. Statut : validée section par section par Mathis.

## Objectif

Nouvel outil de MTS-Toolbox : l'utilisateur saisit une commande composée de colis de tailles différentes (« Colis 1 », « Colis 2 »…) ; l'outil répartit la commande sur autant de palettes que nécessaire, propose un rangement optimisé pour chacune et montre les étapes de montage.

Promesse affichée : « rangement optimisé », jamais « meilleur rangement ». Le rangement de boîtes hétérogènes en 3D n'a pas de solution exacte rapide ; l'outil produit un rangement stable et dense par heuristique.

## Décisions

| Sujet | Décision |
|---|---|
| Cas d'usage | Une commande → autant de palettes que nécessaire (B) |
| Contraintes par référence | Jeu complet (C) : base + options avancées repliées |
| Emplacement | Nouvelle page `/logistique/palettisation-mixte`, liens croisés avec `/logistique/visualiseur-palette` |
| Moteur | Hybride : couches pleines en bas, puis chapeau posé colis par colis |
| Tests | Vitest ajouté (`npm test`) |
| Git | Commits locaux ; aucun push sans feu vert explicite |

## 1. Saisie et règles

Une **référence** :

| Champ | Obligatoire | Défaut | Remarque |
|---|---|---|---|
| Nom | non | « Colis n » | modifiable |
| Longueur, largeur, hauteur (mm) | oui | — | ≥ 10 mm |
| Quantité | non | 1 | entier ≥ 1 |
| Poids (kg) | non | vide | sans poids : « lourd » estimé par le volume ; contrôle de charge ignoré pour cette référence, avec avertissement |
| Ce côté vers le haut | non | coché | décoché : les trois orientations sont permises |
| Fragile, rien dessus | non | décoché | rien n'est posé sur son dessus ; posé en fin de montage |

**Options avancées** (repliées par défaut) :

- **Charge maximale supportée** (kg) : poids total admis au-dessus du carton. Calcul prudent : tout colis posé plus haut dont l'emprise chevauche celle du carton pèse entièrement dessus (transmission verticale, sans répartition). Ce modèle peut refuser des cas acceptables, jamais l'inverse.
- **Garder ensemble** : la référence n'est pas répartie sur plusieurs palettes tant qu'elle tient entière sur une seule.
- **Client / arrêt n°** : ordre de livraison (1 = livré en premier).

**Réglages palette** communs à la commande, identiques à l'outil actuel : type ou sur mesure, hauteur maximale palette comprise, charge maximale, débord par côté.

**Limites** : 30 références, 3 000 colis au total. Au-delà : message explicite, pas de calcul.

**Colis non palettisables** (plus grand que la zone utile dans toutes les orientations permises, plus haut que la hauteur disponible, plus lourd que la charge maximale de la palette) : listés à part avec la raison ; le reste est calculé normalement.

## 2. Moteur

Le calcul tourne dans un **Web Worker** ; l'interface reste fluide.

### Construction d'une palette

1. **Tri** des colis restants, par clés successives : arrêt décroissant (le dernier livré en bas), non fragiles avant fragiles, poids décroissant (à défaut, volume décroissant).
2. **Couches pleines.** Pour chaque référence, dans l'ordre du tri, dont il reste au moins une couche complète : plan de couche par `bestLayer` (`lib/palette/packing.ts`, plans mixtes compris, orientations permises), couche centrée dans la zone. On empile des couches de cette référence tant que la hauteur maximale, la charge maximale de la palette et la charge supportée des colis déjà posés le permettent. Une couche de fragiles n'est jamais recouverte.
3. **Chapeau.** Les colis restants sont posés un à un au point candidat (méthode des points extrêmes) le plus bas, puis le plus au fond (y min), puis le plus à gauche (x min). Un placement n'est valide que si :
   - le colis est dans la zone utile (débord compris) et sous la hauteur maximale ;
   - il ne chevauche aucun colis ;
   - **au plancher**, le centre de sa base est au-dessus de la palette (bornes comprises) : le débord ne porte rien, mais un colis peut déborder sur deux côtés à la fois ; sans débord, cette règle est toujours vraie pour un colis dans la zone ;
   - **au-dessus du plancher**, sa base repose sur **au moins 75 %** de sa surface sur des dessus de colis situés exactement à sa cote ;
   - aucune des surfaces qui le portent n'est le dessus d'un fragile ;
   - la charge maximale de la palette et la charge supportée de chaque colis situé en dessous restent respectées.

   Quatre ordres de tri sont essayés pour le chapeau (volume, surface de base, hauteur, poids, toujours après les clés arrêt et fragile) ; on garde celui qui place le plus de colis, puis, à égalité, celui dont le centre de gravité est le plus bas.
4. Les colis non posés passent sur la **palette suivante**.

### Plusieurs palettes

- **Clients** : chaque arrêt est palettisé séparément. Ensuite, les dernières palettes de chaque arrêt remplies à moins de 50 % du volume utile sont fusionnées par recalcul de leur union quand elle tient sur une palette ; le tri place alors le dernier livré en bas.
- **Garder ensemble** : si une référence marquée ne tient pas entière dans la place restante de la palette en cours mais tiendrait entière sur une palette vide, elle est reportée à la palette suivante.
- Sans arrêt renseigné, toutes les références sont dans l'arrêt 1.

### Étapes

L'ordre de montage est l'ordre de construction : couches de bas en haut, puis chapeau trié par cote, puis y, puis x. Un colis n'est jamais posé avant ce qui le porte.

Chaque étape :
- couche : « Couche k : n × Nom » avec son plan numéroté ;
- colis du chapeau : « Nom n° i — posé sur [palette | Nom], [au fond | devant | au milieu] [à gauche | à droite | au centre] ». Position en mots, calculée par tiers de la zone.

### Contrôles et sorties

Par palette : poids, hauteur, remplissage volumique, arrêts présents, alerte si le centre de gravité horizontal s'écarte de plus de 10 % de la longueur ou de la largeur par rapport au centre de la palette. Pour la commande : nombre de palettes, colis placés, poids total, colis non palettisables.

**Invariant d'honnêteté** : une commande d'une seule référence, sans options, donne sur la première palette exactement le nombre de colis de l'outil actuel (`computePalletization`). Avec un débord autorisé, l'équivalence tient tant que chaque côté du colis mesure au moins deux fois le débord : la couche centrée de l'outil actuel garde alors le centre de chaque colis de bord au-dessus de la palette (règle du plancher ci-dessus).

## 3. Interface

- **Bandeaux croisés** : sur `visualiseur-palette` : « Vos colis ont des tailles différentes ? → Palettisation mixte » ; sur `palettisation-mixte` : « Tous vos colis sont identiques ? → Calcul de palettisation ».
- **Saisie** (colonne gauche sur grand écran, cartes empilées sur mobile) : une carte par référence (champs de la section 1, volet « Options avancées »), boutons « + Ajouter un colis », dupliquer, supprimer ; **Coller depuis Excel** : lignes `nom ; L ; l ; H ; quantité ; poids`, séparateur tabulation, point-virgule ou virgule hors décimales, en-tête optionnel ignoré ; carte « Palette » reprise de l'outil actuel.
- **Recalcul automatique** 300 ms après la dernière modification ; indicateur de calcul en cours.
- **Synthèse** : N palettes · X colis · poids total · colis non palettisables (rouge, avec raison).
- **Onglets** Palette 1, 2… avec poids, hauteur, remplissage, arrêts, alerte de centre de gravité.
- **Lecteur d'étapes** sur la vue 3D : précédent / suivant / lecture automatique, curseur « étape k / n » ; colis futurs masqués, étape courante en surbrillance ; une couleur par référence avec légende.
- **Liste des étapes** cliquable à côté de la 3D (dessous sur mobile) ; les étapes « couche » montrent leur plan de couche.
- **Camions** : tableau des véhicules avec le nombre de véhicules nécessaires pour la commande. Option « palettes gerbables » comme dans l'outil actuel ; appariement glouton : la palette la plus haute reçoit la plus haute palette dont la somme des hauteurs tient dans la hauteur utile du véhicule ; une palette dont le dessus porte un fragile n'en reçoit aucune ; le poids total est comparé à la charge utile.
- **Actions** : PDF (page de synthèse, puis une page par palette : vue 3D, plans des couches, liste des étapes) ; copier le lien (commande encodée dans l'URL, compressée) ; réinitialiser.

## 4. Architecture

```
lib/palette-mixte/
  types.ts       références, placements, palettes, étapes, résultat
  layers.ts      phase des couches pleines (réutilise bestLayer)
  cap.ts         chapeau : points extrêmes, appui, fragiles, charges
  engine.ts      palettes successives, arrêts, garder ensemble, fusion
  steps.ts       ordre de montage, libellés de position
  paste.ts       analyse du collage Excel
  url-state.ts   encodage du lien (CompressionStream deflate-raw + base64url)
  worker.ts      exécution hors fil principal
  pdf.ts         plan PDF multi-palettes
components/tools/PalettisationMixte.tsx
components/tools/palette-mixte/   carte de référence, onglets, lecteur et liste d'étapes
components/tools/palette/BoxScene3D.tsx   vue 3D générique (liste de colis, couleur, surbrillance)
```

- **Remaniement ciblé** : la scène 3D de `PalletScene3D.tsx` est extraite dans `BoxScene3D.tsx`, qui affiche une liste de colis positionnés ; `PalletScene3D` devient un adaptateur. Comportement de l'outil actuel inchangé.
- **Enregistrement** : entrée `palettisation-mixte` (catégorie `logistique`) dans `lib/tools-config.ts`, composant dans la table de `app/(site)/[category]/[tool]/page.tsx`, FAQ dans `lib/tool-seo-data.ts`, contenu dans `components/seo/ToolContent.tsx`. Le sitemap est généré depuis `tools`.

## 5. Tests

Vitest (dépendance de développement), script `npm test`.

- **Invariants**, vérifiés sur chaque palette produite par un jeu de commandes variées et aléatoires à graine fixe : aucun chevauchement ; tout dans la zone et sous la hauteur maximale ; appui ≥ 75 % ; rien sur un fragile ; charge de palette et charges supportées respectées ; conservation (placés + non palettisables = saisis) ; l'ordre des étapes ne pose jamais un colis avant ses supports.
- **Équivalence** avec `computePalletization` pour une référence unique sans option.
- **Comportements** : séparation des arrêts et fusion des fins de client, garder ensemble, colis non palettisables, limites de saisie.
- **Utilitaires** : collage Excel (séparateurs, en-tête, décimales à virgule), aller-retour du lien.
- **Non-régression du moteur actuel** : 33 palettes EUR en semi, 26 EUR 2, 11 en 20 pieds, 25 en 40 pieds, carton 500 × 300 = 6 par couche sur EUR, moulinet 5 × 5 / 3 × 2 = 4.
- **Navigateur** : parcours complet sur ordinateur et mobile (390 px), PDF généré et relu, aucune erreur console.

## Hors périmètre

Optimisation globale exacte ; colis non parallélépipédiques ; intercalaires et cornières ; calcul du film étirable ; affectation des palettes dans le camion par ordre de livraison.
