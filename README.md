# Mon catalogue des possibles · EJP Cotonou

Application web statique qui aide chaque personne, surtout des jeunes, à découvrir et reconnaître ses talents. On y parcourt 1061 capacités, compétences et qualités (4 familles, 34 thèmes), on marque celles où l'on se reconnaît, on remplit son bilan, puis on télécharge son résultat en PDF.

- Aucun compte, aucun backend : les réponses restent sur l'appareil (`localStorage`, sauvegarde automatique).
- PWA installable, utilisable hors connexion après la première visite.
- Le PDF est généré dans le navigateur (texte vectoriel, polices Poppins et Lora intégrées).

## Stack

Vue 3, Vite, TypeScript, Bun · motion-v (animations) · @phosphor-icons/vue · @fontsource (polices auto-hébergées) · pdfmake (PDF) et pdf.js (aperçu), tous deux chargés à la demande · vite-plugin-pwa · Vitest, Playwright et axe-core.

## Développement local

Prérequis : [Bun](https://bun.sh) 1.3 ou plus récent.

```bash
bun install
bun dev            # http://localhost:5173
```

| Commande | Rôle |
|---|---|
| `bun dev` | serveur de développement |
| `bun run build` | vérification TypeScript puis build de production dans `dist/` |
| `bun run preview` | sert `dist/` localement |
| `bun test` | tests unitaires (store des réponses, données du PDF) |
| `bun run test:e2e` | parcours Playwright et audit d'accessibilité axe (mobile et desktop) |

Première fois avec Playwright : `bunx playwright install chromium`.

Pour lancer les tests de bout en bout contre un conteneur déjà démarré :

```bash
E2E_BASE_URL=http://127.0.0.1:8080 bun run test:e2e
```

### Scripts utiles

- `bun scripts/capture.ts [url]` : captures mobile (390 px) et desktop (1440 px) de chaque écran, dans `docs/captures/`.
- `bun scripts/sample-pdf.ts [url]` : génère l'exemple de PDF, à partir de réponses fictives, dans `docs/exemple/`.

Les deux scripts demandent un serveur lancé (`bun dev` ou `bun run preview`).

## Organisation

```
data/catalogue.json     contenu du catalogue, chargé tel quel et typé (src/data/catalogue.ts)
src/store/              état versionné (state.ts) et store des réponses (answers.ts)
src/views/              Accueil, Prénom, Famille, Bilan, Export
src/components/         ligne d'élément, cercle « entouré à la main », sommaire, recherche…
src/pdf/                données du PDF (pure, testée), définition pdfmake, génération, aperçu
deploy/                 configuration nginx du conteneur et exemple de reverse proxy
```

L'état enregistré porte un numéro de version (`v: 1`). Pour faire évoluer son format, ajoute une migration dans `src/store/state.ts` (`migrations[1]` transforme v1 en v2) et augmente `CURRENT_VERSION`. Les données abîmées ou inconnues sont ignorées, jamais propagées.

## Déploiement sur le VPS (Docker + nginx)

L'image se construit en deux étapes : build avec Bun, puis service par `nginx:alpine`. Le nginx du conteneur gère le cache (un an pour `/assets/*`, revalidation pour `index.html` et le service worker), le fallback SPA, la compression et les en-têtes de sécurité (CSP stricte comprise). Le TLS reste sur le reverse proxy du VPS.

```bash
# sur le VPS, dans le dossier du projet
docker compose up -d --build        # écoute sur 127.0.0.1:8080
curl -s http://127.0.0.1:8080/healthz   # → ok
```

Puis, côté reverse proxy nginx (hors conteneur) :

```bash
sudo cp deploy/reverse-proxy.example.conf /etc/nginx/sites-available/catalogue.conf
# remplacer catalogue.example.org par le domaine retenu
sudo ln -s /etc/nginx/sites-available/catalogue.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d catalogue.example.org
```

Pour mettre à jour : `git pull && docker compose up -d --build`. Le service worker récupère automatiquement la nouvelle version au chargement suivant.

Sans Docker Compose :

```bash
docker build -t ejp/mon-catalogue-des-possibles .
docker run -d --name catalogue --restart unless-stopped -p 127.0.0.1:8080:80 ejp/mon-catalogue-des-possibles
```

## Hors connexion

À la première visite, le service worker met en cache l'application, le catalogue, les logos et les polices latines (environ 760 Ko). Les modules PDF, plus lourds (pdfmake et pdf.js, environ 2,6 Mo), ne sont pas préchargés, pour épargner les connexions faibles : ils sont mis en cache à la première ouverture de l'écran « Télécharger mon PDF ». Ensuite, tout fonctionne sans réseau.

## Accessibilité

Vérifiée par axe-core (WCAG 2.1 A et AA) sur chaque écran, en mobile et en desktop (`tests/e2e/a11y.spec.ts`). Les éléments sont des `role="checkbox"` ; le niveau se choisit dans un `radiogroup` navigable aux flèches. Le niveau est toujours indiqué par la couleur, une icône et un libellé. `prefers-reduced-motion` réduit les animations à de simples fondus.

Deux teintes de la charte ont été assombries d'un cran pour le texte, afin d'atteindre le contraste 4,5:1 : le texte discret (`#66796f` → `#5e7167`) et le texte en couleur de famille posé sur sa teinte de fond (accent × 0,82).
