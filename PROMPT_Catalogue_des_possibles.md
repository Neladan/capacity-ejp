# Prompt Claude Code — Plateforme « Mon catalogue des possibles »

> Copie tout ce qui suit dans Claude Code, lancé à la racine d'un dossier vide où tu as déposé les dossiers `data/` et `assets/` de ce kit.

---

## Rôle et contexte

Tu es un·e développeur·se front-end senior et un·e designer produit exigeant·e. Tu vas construire **« Mon catalogue des possibles »**, une application web de l'**Église Jeunes Prodiges (EJP) Cotonou**.

Elle aide chaque personne, surtout des jeunes, à découvrir et reconnaître ses talents. L'utilisateur parcourt **1061 capacités, compétences et qualités**, réparties en **4 familles** et **34 thèmes**. Il indique celles dans lesquelles il se reconnaît, remplit son bilan, puis **télécharge son résultat en PDF**.

L'objectif n°1 est une **expérience superbe**, en UX comme en UI : fluide, chaleureuse, rassurante, belle. Les animations doivent être soignées sans être tape-à-l'œil. C'est un outil d'introspection, pas une vitrine. Chaque mouvement doit aider à comprendre ou à se sentir encouragé.

## Avant d'écrire du code

1. **Liste les skills disponibles** dans ton environnement. Utilise au minimum ceux-ci, chacun chargé **avant** l'étape qu'il concerne :
   - **`impeccable`** : pour la qualité de l'interface, de la direction artistique jusqu'aux finitions. Applique-le au moment de poser le design, puis repasse-le à la fin de chaque écran pour un audit et un polissage avant de me montrer le rendu.
   - **`emil` : lis ce qu'il propose et applique-le partout où il s'applique, notamment aux animations, aux interactions et aux transitions.
   - **`frontend-design`** : pour la direction artistique, la typographie et la mise en page.
   - **`21st-ui`** : quand un composant de qualité y existe déjà (panneau qui glisse, sélecteur segmenté, barre de progression…), à adapter à notre charte.
   - Les skills PDF, accessibilité ou tests, s'ils sont présents.

   Si deux skills se contredisent, suis la charte et les exigences de ce prompt. Dis-moi quels skills tu as utilisés, et à quelle étape.
2. Lis `data/catalogue.json` en entier. Il contient tout le contenu : les textes d'introduction, les niveaux, les familles, les thèmes, les éléments et les rubriques du bilan. **N'invente ni ne reformule aucun élément du catalogue.**
3. Regarde `assets/reference-slides.pdf`. C'est la version présentation du document : elle sert de référence pour la charte visuelle, pas de maquette à copier.
4. Propose-moi un plan court : écrans, composants, choix techniques. Ensuite, avance par étapes et montre-moi le rendu (captures mobile et desktop) à la fin de chaque étape importante.

## Stack imposée

- **Vue 3 + Vite + TypeScript**, avec **Bun** comme gestionnaire de paquets et runtime. C'est la stack habituelle de l'équipe ; pas de Laravel.
- **motion-v** (Motion pour Vue) pour les animations, **@phosphor-icons/vue** pour les icônes.
- CSS moderne avec variables CSS : Tailwind seulement si tu le justifies, sinon CSS scopé.
- **Aucun backend, aucun compte.** Toutes les réponses restent sur l'appareil, en `localStorage` avec sauvegarde automatique. Prévois aussi un bouton « Recommencer » avec confirmation intégrée à la page, sans `confirm()` natif.
- Le résultat est une **application statique**, déployée sur notre VPS (Docker + nginx, derrière un reverse proxy nginx + certbot). Fournis un `Dockerfile` multi-étapes (build Bun puis nginx:alpine) et un `README` de déploiement.

## Charte visuelle (issue du document)

**Couleurs de la maison EJP**

| Rôle | Hex |
|---|---|
| Vert profond (fonds forts, titres) | `#103b33` |
| Vert profond 2 (surfaces sur fond profond) | `#17493f` |
| Vert EJP (accent principal) | `#327b57` |
| Menthe (texte clair sur fond profond) | `#a9d9c0` |
| Brume (surfaces claires) | `#e9f2f0` |
| Papier (fond de page) | `#f6faf8` |
| Encre (texte) | `#1c2a26` |
| Texte courant | `#3d4f4a` |
| Texte discret | `#66796f` |
| Filets | `#d6e4df` |

**Une couleur repère par famille**

Elles se trouvent aussi dans `catalogue.json`, au champ `families[].color`.

| Famille | Accent | Teinte de fond | Teinte moyenne |
|---|---|---|---|
| 1. Capacités relationnelles | `#2f7a55` | `#e2f0e8` | `#bfdccb` |
| 2. Capacités intellectuelles | `#1d6a86` | `#e0edf2` | `#b9d5e1` |
| 3. Compétences techniques et organisationnelles | `#a8620f` | `#f5ead9` | `#e6cfa9` |
| 4. Qualités personnelles | `#a3452c` | `#f5e5de` | `#e4c0b3` |

**Les 3 niveaux de réponse**

Ils viennent de la méthode du document (« entoure en vert / jaune / orange ») et se trouvent dans `catalogue.json`, au champ `levels`.

- Vert `#3c9a5f` : **Je sais déjà**
- Jaune `#f2c230` : **À améliorer**
- Orange `#f0892a` : **Envie d'essayer**

Vérifie le contraste du texte posé sur le jaune et l'orange : utilise un texte foncé, jamais du blanc.

**Typographie**

- **Poppins** (400, 600, 700) pour l'interface et les titres.
- **Lora italique** pour les phrases d'accompagnement : sous-titres, encouragements, citations.
- Auto-héberge les fichiers de police (`@fontsource`) pour que tout fonctionne hors connexion.

**Logo**

Le dossier `assets/` contient :
- `logo-white.png`, pour les fonds profonds ;
- `logo-green.png`, pour les fonds clairs ;
- `logo-black.png`, l'original ;
- `favicon.png`.

Le logo apparaît sur l'accueil, discrètement dans l'en-tête et sur le PDF. Ne le déforme pas et ne le recolorise pas autrement.

**Ton visuel**

L'ensemble doit être épuré, aéré et chaleureux, avec des coins doux. Le motif récurrent est un grand arc ou cercle en vert profond (voir la couverture des slides). Évite les dégradés criards, les emojis comme icônes et les ombres lourdes.

## Parcours utilisateur

### 1. Accueil
- Un écran d'ouverture sur fond vert profond, avec le logo, le titre « Mon catalogue des possibles », le sous-titre en Lora italique, et les chiffres clés (4 familles, 34 thèmes, 1061 éléments) qui se comptent en douceur.
- Au défilement, les sections apparaissent en fondu : « Pourquoi ce document ? », « Comment l'utiliser ? » (avec les 3 niveaux montrés en vrai, sous forme de cercles de couleur) et « À retenir » (`intro.keep`, mis en valeur).
- Un appel à l'action « Commencer ». On demande ensuite le prénom (facultatif, il sert seulement pour le PDF).
- Si une progression existe déjà sur l'appareil, propose « Reprendre là où je me suis arrêté·e », avec le pourcentage parcouru.

### 2. Le parcours des 4 familles
- **Navigation claire :**
  - Sur mobile, une barre de progression collante en haut, avec la famille et le thème en cours, plus un accès rapide au sommaire dans un panneau qui glisse depuis le bas.
  - Sur desktop, une colonne latérale qui liste les familles et leurs thèmes, avec un compteur de réponses par thème et une coche quand un thème a été parcouru.
- **Une famille à la fois :**
  - Chaque famille s'ouvre sur un intercalaire avec son numéro, son titre, sa description et la liste de ses thèmes. La couleur repère de la famille s'installe en transition douce.
  - Les thèmes se suivent en défilement continu, chacun avec un en-tête collant (titre du thème, nombre d'éléments, compteur « 8 choisis »).
- **Les éléments :**
  - Chaque élément est une ligne ou carte large, facile à toucher (au moins 48 px), avec son numéro d'origine discret et son libellé.
  - **Un toucher sur l'élément le marque « Je sais déjà ».** Sans changer de niveau, la personne peut cocher très vite.
  - Un petit sélecteur discret sur l'élément permet de choisir « À améliorer » ou « Envie d'essayer », ou de retirer la marque.
  - Le niveau choisi se voit par la couleur, une icône **et** un libellé court. La couleur ne doit jamais être le seul indicateur.
- **Micro-interactions :**
  - Le marquage s'accompagne d'une animation « entourer à la main » : un cercle légèrement imparfait se dessine autour de la puce, en écho à la consigne « entoure ».
  - Les compteurs s'incrémentent avec un léger rebond.
  - Ajoute un retour haptique (`navigator.vibrate`) très court quand le navigateur le permet.
- **Fin de thème et de famille :**
  - À la fin de chaque thème, un petit encouragement en Lora italique. Écris des formules sobres, sans flatterie excessive et sans contenu religieux inventé.
  - À la fin de chaque famille, un récapitulatif animé (nombre par niveau), puis la famille suivante.
- **Outils pratiques :**
  - Une recherche dans tout le catalogue, avec le nom de la famille et du thème affiché dans les résultats.
  - Un filtre « Afficher seulement mes choix ».
  - Un bouton « Tout voir / Masquer ce que j'ai déjà parcouru ».
  - La possibilité de sauter librement d'un thème à l'autre. Rien n'est obligatoire.

### 3. Mon bilan
- **Une synthèse visuelle :**
  - le total par niveau ;
  - une répartition par famille, en barres horizontales simples aux couleurs des familles ;
  - les thèmes où la personne a le plus de « Je sais déjà ».
- **Mes 10 plus belles forces :** la personne choisit jusqu'à 10 éléments parmi ses « Je sais déjà », avec une sélection fluide, un compteur 0/10 et la possibilité de les réordonner par glisser-déposer, ou par boutons sur mobile.
- **Les 4 autres rubriques :** des champs de texte (`bilan[1..4]`) agréables à remplir, qui s'agrandissent avec le texte et sont sauvegardés automatiquement.

### 4. Télécharger mon PDF
- **Le PDF est généré côté client, avec du texte vectoriel** (sélectionnable et net) : pas de capture d'écran pixelisée. Utilise par exemple `pdfmake` avec Poppins et Lora intégrées, ou une solution équivalente que tu justifies.
- **Contenu du PDF :**
  - Une couverture avec le logo, « Mon catalogue des possibles », le prénom, la date et les chiffres clés de la personne.
  - « Mes 10 plus belles forces » en page 2, mises en valeur.
  - Les réponses aux 4 rubriques du bilan.
  - Puis, **famille par famille et thème par thème**, les éléments cochés, regroupés par niveau, avec leur numéro et la couleur de leur niveau. N'imprime pas les 1061 éléments, seulement les choix de la personne.
  - Un pied de page avec la pagination et « EJP Cotonou ».
- **Mise en page :** format A4 portrait, même charte que l'application, et un nom de fichier propre : `mon-catalogue-des-possibles-<prenom>-<date>.pdf`.
- **Sur l'écran d'export :** un aperçu de la première page avant le téléchargement, avec un état de chargement élégant pendant la génération.

## Animations : la règle

- Utilise **motion-v** pour :
  - les apparitions au défilement (`whileInView`, fondu et légère translation de 12 à 24 px) ;
  - les transitions entre écrans et familles ;
  - le dessin du cercle (SVG `pathLength`) ;
  - les compteurs.
- Utilise l'**API View Transitions** pour le passage d'une famille à l'autre quand le navigateur la prend en charge, avec un repli propre sinon.
- **Durées :** entre 150 et 450 ms, avec des courbes douces (ease-out et ressorts amortis). Pas de rebonds exagérés, de parallaxe lourde ni de défilement détourné.
- **Respect de `prefers-reduced-motion` :** toutes les animations se réduisent à de simples fondus ou disparaissent.
- **Fluidité :** 60 fps sur un Android d'entrée de gamme. N'anime que `transform` et `opacity`, et virtualise ou découpe le rendu si les 1061 éléments ralentissent l'affichage.

## Exigences de qualité

- **Mobile d'abord.** La majorité des utilisateurs seront sur téléphone, parfois avec une connexion faible. Vise un bundle léger, le chargement différé de la génération PDF, et une PWA installable qui fonctionne hors connexion après la première visite.
- **Accessibilité WCAG 2.1 AA :**
  - navigation complète au clavier, avec un focus visible ;
  - rôles ARIA corrects pour les éléments cochables (`role="checkbox"` ou radio group pour le niveau) ;
  - contrastes vérifiés ;
  - libellés pour les lecteurs d'écran.
- **Langue :** l'interface est entièrement en français, en tutoiement, avec la ponctuation française (espaces fines avant `? ! : ;`, guillemets « »).
- **Robustesse :** `localStorage` encapsulé dans un `try/catch`, état versionné pour de futures migrations, et aucune perte de données au rechargement.
- **Données :** charge `catalogue.json` en l'état, typé en TypeScript, sans en recopier le contenu dans les composants.
- **Tests :**
  - quelques tests unitaires (Vitest) sur le store des réponses et la génération des données du PDF ;
  - un parcours de bout en bout (Playwright) : cocher, changer de niveau, remplir le bilan, télécharger le PDF.

## Livrables attendus

1. Le code source complet, avec ses scripts : `bun dev`, `bun run build`, `bun test`.
2. Le `Dockerfile` et la configuration nginx (cache des assets, fallback SPA), plus un `README` qui explique le développement local, le build et le déploiement sur le VPS.
3. Des captures mobile (390 px) et desktop (1440 px) de chaque écran : accueil, intercalaire de famille, liste de thème avec des éléments marqués, bilan, aperçu PDF.
4. Un exemple de PDF généré avec des réponses fictives clairement marquées comme exemple.
5. Une courte liste de ce qui reste à décider, par exemple le nom de domaine.

Commence par lister les skills disponibles et me proposer ton plan.
