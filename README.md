# Colis API

API centrale REST construite avec **NestJS + TypeORM + PostgreSQL**, basée sur le schéma
de base de données fourni (gestion de colis, partenaires, livreurs, clients, paiements,
réclamations). Documentation interactive générée automatiquement avec **Swagger**.

Cette API est pensée pour être le **point d'entrée unique** de vos applications. L'étape
suivante (synchronisation avec la 2ème base de données) viendra se greffer dessus sans
avoir à réécrire cette couche.

## 1. Architecture

```
src/
├── main.ts                  # bootstrap, Swagger, pipes globaux
├── app.module.ts            # assemblage de tous les modules + connexion DB
├── config/                  # configuration centralisée (.env)
├── common/
│   ├── guards/api-key.guard.ts       # authentification par clé API
│   ├── decorators/public.decorator.ts
│   ├── filters/http-exception.filter.ts
│   └── dto/pagination-query.dto.ts
└── modules/
    ├── partenaires/
    ├── livreurs/
    ├── clients/
    ├── colis/               # + colis_historique (audit des statuts)
    ├── paiements/
    ├── reclamations/        # + reclamation_historique
    ├── collaborateurs/
    ├── notifications/
    ├── messages/
    ├── navettes/             # + navettes_historique (dispatch inter-villes)
    ├── appels/               # journal d'appels liés à un colis
    ├── colis-flux/           # traçabilité des mouvements physiques (entrée/sortie dépôt)
    ├── tarifs/               # grille tarifaire nationale par wilaya
    ├── versements/           # paiements sortants (livreurs / partenaires / clients)
    ├── messagerie/           # chat_reseau + messages_partenaires + messages_equipe
    ├── integrations/         # connexion à des API externes (partenaires + clients)
    └── health/
```

Chaque module suit le même pattern : `entity` → `dto` → `service` (logique métier) →
`controller` (endpoints REST) → `module` (assemblage + injection).

### Modules déjà implémentés en détail

| Module | Ce qui est couvert |
|---|---|
| **Partenaires** | CRUD complet, désactivation logique, ajustement de solde |
| **Livreurs** | CRUD, **workflow de validation** (`en_attente_validation` → `actif`/`refuse`), ajustement de solde |
| **Clients** | CRUD, ajustement de solde |
| **Colis** | CRUD, génération de code de suivi, **machine à états des statuts** avec transitions contrôlées, horodatage automatique par étape, historique d'audit automatique |
| **Paiements** | Création, validation (`payer`) avec répercussion sur le solde du partenaire, annulation |
| **Réclamations** | CRUD, changement de statut avec historique d'audit automatique |
| **Collaborateurs** | CRUD par partenaire |
| **Notifications / Messages** | Création, listing, marquage "lu" |
| **Navettes** | CRUD, **embarquement de colis** (rattache une liste de colis à une navette, historique complet de chaque envoi) |
| **Appels** | Journal d'appels (sortant/entrant/note) rattaché à un colis |
| **Colis-flux** | Traçabilité des entrées/sorties physiques d'un colis dans un point/dépôt |
| **Tarifs** | Grille tarifaire nationale par wilaya (lecture + mise à jour) |
| **Versements** | Paiements sortants vers livreurs/partenaires/clients, **avec répercussion automatique sur leur solde** |
| **Messagerie** | Chat réseau (diffusion), messages directs entre partenaires, messagerie d'équipe interne |
| **Intégrations API externes** | Configuration et **synchronisation réelle** de sources externes (API d'un partenaire ou d'un client) vers des colis, via mapping JSON configurable |

Toutes les tables du schéma fourni sont désormais couvertes.

### Zoom sur le module Intégrations : le pont vers des données externes

C'est le module qui répond directement au besoin initial de connecter une source
de données externe. Chaque intégration (`api_integrations` pour un partenaire,
`client_apis` pour un client) stocke :
- l'URL de l'API distante et sa clé d'authentification (envoyée en `Bearer`)
- un mapping JSON `{ result_path, map }` indiquant où trouver le tableau de
  résultats dans la réponse, et comment traduire chaque champ distant vers un
  champ local (ex: `"data.client.nom"` → `clientNom`)

L'endpoint `POST /api-integrations/:id/sync` (ou `/client-apis/:id/sync`) :
1. appelle l'API externe,
2. extrait le tableau d'éléments via `result_path`,
3. transforme chaque élément en colis via le mapping,
4. crée les colis correspondants (avec génération automatique du code de suivi
   et entrée dans l'historique, comme pour toute création de colis),
5. met à jour l'intégration (`dernier_sync_at`, `sync_ok`, `sync_insertions`,
   `dernier_sync_message`) pour un suivi complet.

C'est un import ponctuel déclenché à la demande (bouton "Synchroniser" côté
application, par exemple). Pour automatiser ces appels à intervalle régulier,
voir la section suivante.

## 2. Logique métier clé : le cycle de vie d'un colis

```
en_attente → attribue → en_interne → disponible → livree → cloturee
                  ↘___________↗           ↘
                                          retour → en_attente / cloturee
```

Le service `ColisService.changerStatut()` :
- refuse toute transition non autorisée (ex: `livree` → `en_attente`)
- exige un `retourMotif` si le nouveau statut est `retour`
- horodate automatiquement la colonne correspondante (`statut_attribue_at`, etc.)
- crée une ligne dans `colis_historique` à chaque changement, pour un audit complet

Le même principe s'applique aux réclamations (`ReclamationsService.changerStatut()`).

## 3. Authentification

Choix retenu : **clé API simple** (header `x-api-key`), adaptée à une utilisation
serveur-à-serveur / intégration applicative (pas de comptes utilisateurs individuels
à gérer côté API).

```
GET /api/v1/colis
x-api-key: change-moi-cle-admin
```

Les clés valides sont définies dans `.env` (`API_KEYS=cle1,cle2`). Seule la route
`/health` est publique. Pour une évolution future avec des comptes utilisateurs
différenciés (rôles, permissions fines), remplacer `ApiKeyGuard` par une stratégie
JWT — la structure du reste du projet ne change pas.

## 4. Installation

```bash
npm install
cp .env.example .env    # renseigner les infos de connexion à la base existante
npm run start:dev
```

- API : `http://localhost:3000/api/v1`
- Documentation Swagger : `http://localhost:3000/docs`

**Important** : `synchronize: false` est volontairement fixé dans `app.module.ts`
car la base de données existe déjà (schéma Supabase fourni). L'API vient se
brancher dessus sans jamais modifier le schéma automatiquement.

## 5. Étape suivante : brancher la 2ème base de données

Cette API a été conçue pour que la synchronisation vienne s'ajouter proprement,
sans rien casser :

1. **Ajouter une deuxième connexion TypeORM** nommée (ex: `secondaryConnection`)
   dans `app.module.ts`, pointant vers la 2ème base.
2. **Créer un module `sync/`** contenant :
   - un mapping champ-à-champ entre les deux schémas (souvent différents)
   - un `SyncService` qui lit les enregistrements modifiés depuis la dernière
     synchronisation (colonne `created_at`/`updated_at`) et les *upsert* dans
     l'autre base
   - une file de tâches (**BullMQ + Redis**) pour fiabiliser les écritures avec
     retries automatiques
   - une table `sync_log` pour tracer chaque exécution (succès/échec, nombre
     d'enregistrements traités)
3. **Décider du sens de la synchro** : unidirectionnelle (recommandé pour
   démarrer) ou bidirectionnelle (nécessite une stratégie de résolution de
   conflits, ex. "dernier écrivain gagne" basé sur `updated_at`).

Comme discuté, je pars du principe qu'on démarre en **synchronisation unidirectionnelle
par polling planifié** (`@nestjs/schedule`), évolutif vers du CDC (Debezium) si un besoin
de temps réel strict apparaît plus tard.

Note : si la 2ème base expose (ou peut exposer) une petite API HTTP en lecture, le module
`integrations/` déjà livré peut directement servir de base à cette synchro — c'est
exactement le même mécanisme (appeler une source externe, mapper les champs, upsert
en local), il suffirait de l'étendre avec une planification automatique (`@nestjs/schedule`)
au lieu d'un déclenchement manuel via `/sync`.

## 6. Exemples d'appels

```bash
# Créer un colis
curl -X POST http://localhost:3000/api/v1/colis \
  -H "x-api-key: change-moi-cle-admin" \
  -H "Content-Type: application/json" \
  -d '{"destination": "Alger Centre", "clientNom": "Karim B.", "prixLivraison": 400}'

# Faire avancer son statut
curl -X POST http://localhost:3000/api/v1/colis/{id}/statut \
  -H "x-api-key: change-moi-cle-admin" \
  -H "Content-Type: application/json" \
  -d '{"statut": "attribue", "nom": "Admin Yacine"}'

# Consulter l'historique complet du colis
curl http://localhost:3000/api/v1/colis/{id}/historique \
  -H "x-api-key: change-moi-cle-admin"
```

Tous les endpoints, leurs schémas de requête/réponse et la possibilité de les
tester directement sont disponibles sur `/docs` (Swagger).

## 7. Déploiement sur un VPS Hostinger

L'API est déployée sur un **VPS Hostinger (Ubuntu, accès root via SSH)** avec
**Docker + Nginx**. Sur un VPS il n'y a pas de déploiement automatique comme sur
Render : c'est le serveur qui tire le code depuis GitHub, le lance dans un
conteneur, et Nginx se place devant avec un certificat HTTPS.

```
Internet ──HTTPS──> Nginx (443, sur l'hôte) ──http──> conteneur tawssilgo-api (127.0.0.1:3000)
                                                          └──> PostgreSQL Supabase
```

**La base de données reste sur Supabase** : il n'y a donc aucune donnée à
migrer. Le VPS remplace uniquement l'exécution du process.

### 7.1 Prérequis dans hPanel

1. **VPS avec un système d'exploitation** : hPanel → *VPS* → *Ajouter* → Ubuntu 22.04/24.04.
2. **Accès root** : hPanel → *VPS* → *Serveur* → *Gérer* → *Paramètres root*.
3. Un **sous-domaine** pour l'API : `api.tawssilgo.com`. Les enregistrements DNS
   se modifient à l'étape 7.8 ; le certificat exige que le sous-domaine pointe
   déjà vers le VPS.

### 7.2 Connexion SSH

```bash
ssh root@<IP_DU_VPS>
```

### 7.3 Pile serveur (une seule fois)

```bash
apt update && apt upgrade -y

# Docker (inclut le plugin "docker compose")
curl -fsSL https://get.docker.com | sh

# Nginx (reverse proxy), Certbot (HTTPS), pare-feu, outils
apt install -y nginx certbot python3-certbot-nginx git curl ufw

systemctl enable --now docker nginx
```

> Si `docker compose` est inconnu après cette étape :
> `apt install -y docker-compose-v2`

**VPS avec 1 Go de RAM uniquement** — le build NestJS peut se faire tuer par le
OOM killer. Ajouter du swap avant toute autre chose :

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h   # vérifier que Swap n'est pas 0
```

Pare-feu — ouvrir **uniquement** 22, 80 et 443 :

```bash
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

hPanel → *VPS* → *Pare-feu* a son propre filtre : y ouvrir aussi `22`, `80`, `443`.
Le port `3000` ne doit jamais être ouvert, ni par ufw ni par hPanel.

### 7.4 Dépôt et variables d'environnement

```bash
mkdir -p /var/www/tawssilgo && cd /var/www/tawssilgo
git clone https://github.com/aniszik98/api-tawssilgo.git .
cp .env.example .env
nano .env
chmod 600 .env
```

| Variable | Rôle |
|---|---|
| `DB_HOST` | hôte PostgreSQL (Supabase : `*.pooler.supabase.com`) |
| `DB_PORT` | `5432` |
| `DB_USERNAME` | utilisateur de la base |
| `DB_PASSWORD` | mot de passe |
| `DB_DATABASE` | `postgres` |
| `DB_SSL` | `true` chez Supabase |
| `API_KEYS` | clés acceptées dans `x-api-key`, **séparées par des virgules** |
| `PORT` | **laisser `3000`** |

> **Piège Render** : Render impose `PORT=10000` sur ses services. Ne pas recopier
> cette valeur depuis le dashboard Render — `docker-compose.yml` et la config
> Nginx attendent `3000`.

> `.env` est dans `.gitignore` **et** `.dockerignore` : il n'est ni versionné ni
> copié dans l'image Docker. Les secrets sont injectés à l'exécution par
> `env_file`.

### 7.5 Premier lancement

```bash
docker compose up -d --build
docker compose logs -f --tail=50     # → "API démarrée sur http://localhost:3000/api/v1"
```

Puis les **trois tests de validation**, dans l'ordre. Le troisième est le plus
important : c'est lui qui prouve que l'accès à PostgreSQL fonctionne.

```bash
# 1. l'API répond (route publique, aucune clé requise)
curl http://127.0.0.1:3000/api/v1/health
#    attendu : {"status":"ok","timestamp":"..."}

# 2. la protection par clé API est active (sans clé → refus)
curl -i http://127.0.0.1:3000/api/v1/partenaires
#    attendu : HTTP 401

# 3. une clé valide accède bien aux données
curl -H "x-api-key: <PREMIERE_CLE>" \
  "http://127.0.0.1:3000/api/v1/partenaires?limit=1"
#    attendu : HTTP 200 + JSON
```

Si le test 3 renvoie `401` → `API_KEYS` mal recopiée (espaces parasites).
S'il renvoie `500` ou si le conteneur redémarre en boucle → identifiants
PostgreSQL à revérifier (voir 7.10).

Le conteneur embarque son propre `HEALTHCHECK` (appel à `/api/v1/health` toutes
les 30 s) : `docker inspect --format '{{.State.Health.Status}}' tawssilgo-api`
doit renvoyer `healthy`.

### 7.6 Nginx

Le fichier versionné suppose un certificat déjà généré, donc `nginx -t`
échouerait au premier essai. Commencer par une version **HTTP seul** :

```bash
mkdir -p /var/www/html/.well-known/acme-challenge

cat > /etc/nginx/sites-available/tawssilgo-api.conf <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name api.tawssilgo.com;

    location /.well-known/acme-challenge/ { root /var/www/html; }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
EOF

ln -s /etc/nginx/sites-available/tawssilgo-api.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

`rm /etc/nginx/sites-enabled/default` évite que le `server_name _` par défaut
réponde à la place sur l'IP du VPS.

### 7.7 Certificat HTTPS

**Quand l'enregistrement DNS A pointe déjà vers le VPS** (voir 7.8) :

```bash
certbot certonly --webroot -w /var/www/html -d api.tawssilgo.com
systemctl enable --now certbot.timer
```

Puis on bascule sur la config versionnée, qui ajoute le bloc `443` :

```bash
cp /var/www/tawssilgo/deploy/nginx/tawssilgo-api.conf /etc/nginx/sites-available/tawssilgo-api.conf
nginx -t && systemctl reload nginx
```

Une fois le site servi en HTTPS, la redirection `301` du bloc `80` peut être
remise en place (elle l'est déjà dans la config versionnée).

L'API est disponible sur :

- API : `https://api.tawssilgo.com/api/v1`
- Swagger : `https://api.tawssilgo.com/docs`
- Health : `https://api.tawssilgo.com/api/v1/health`

### 7.8 Bascule DNS

1. hPanel → *Sites* → *DNS* → zone de `tawssilgo.com` → enregistrement **A**
   pour `api` → IP du VPS.
2. Si `api.tawssilgo.com` servait déjà Render via un domaine personnalisé,
   **c'est la seule chose à changer** : les clients ne voient aucune différence.
   S'ils appelaient `*.onrender.com`, mettre à jour l'URL de base côté client.
3. Vérifier :

```bash
curl https://api.tawssilgo.com/api/v1/health
curl -H "x-api-key: <CLE>" https://api.tawssilgo.com/api/v1/partenaires?limit=1
```

4. Garder Render en secours 24–48 h, puis arrêter le service.

> Ne pas éteindre Render avant d'avoir eu un `200` sur le test authentifié :
> c'est le seul contrôle qui prouve que la base est bien joignable depuis le
> VPS.

### 7.9 Mises à jour et retour arrière

```bash
cd /var/www/tawssilgo
bash deploy/deploy.sh
```

Le script enchaîne `git pull --ff-only` → `docker compose build` → `up -d` →
attente du healthcheck (60 s) → nettoyage des couches orphelines. Il refuse de
continuer si `.env` est absent, et s'arrête avec les logs si le conteneur ne
devient pas `healthy`.

Chaque build est **técuté avec le commit courant** (`tawssilgo-api:<sha>`), ce
qui préserve le point de retour arrière.

**Rollback** : revenir au dernier commit connu bon suffit — l'image correspondante
est toujours sur le disque.

```bash
git log --oneline -10             # repérer le sha précédent
git checkout <sha-precedent>
bash deploy/deploy.sh
```

Les anciens tags s'accumulent : les lister et supprimer ceux qui ne servent plus,
une fois le rollback devenu inutile.

```bash
docker images tawssilgo-api --format '{{.Repository}}:{{.Tag}}  {{.CreatedAt}}'
docker rmi tawssilgo-api:<ancien-sha>
```

### 7.10 Diagnostic

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Conteneur en boucle de redémarrage | identifiants PostgreSQL | `docker compose logs --tail=50` → `Unable to connect to the database` |
| `unhealthy` alors que les logs sont vides | API qui n'écoute pas encore | laisser 20 s (`start-period`) puis `docker inspect --format '{{.State.Health.Status}}' tawssilgo-api` |
| `401` sur un appel authentifié | `API_KEYS` mal recopiée | pas d'espace autour des virgules |
| `502` depuis Nginx | API down ou port modifié | `ss -tlnp \| grep 3000` |
| `502` pendant le build | build OOM | vérifier `free -h`, swap de l'étape 7.3 |
| Disque plein | logs Docker / images anciennes | `docker system df`, `docker images -f dangling=true -q \| xargs -r docker rmi` |

Commandes utiles :

```bash
docker compose ps                 # état + health
docker compose logs -f --tail=100 # logs en direct
docker compose restart api        # redémarrage seul
docker stats --no-stream          # RAM/CPU du conteneur
journalctl -u nginx -f            # logs Nginx
```

### 7.11 Sécurité

- **`.env` jamais commité** : il est dans `.gitignore` et `.dockerignore`, et en
  `chmod 600` sur le serveur. Les secrets arrivent par `env_file`, jamais dans
  l'image.
- **`API_KEYS` est un secret** : ne jamais le `console.log` côté API, ni le
  printer dans un ticket ou un log de Nginx.
- **Le port 3000 ne s'ouvre jamais publiquement** : Nginx et le pare-feu sont les
  seuls à y accéder.
- **Une seule route publique** : `/api/v1/health`, tout le reste passe par
  `x-api-key`. Ajouter une route publique exige un `@Public()` explicite.
- **Certificat** : `certbot.timer` renouvelle automatiquement ; vérifier avec
  `certbot renew --dry-run`.

### 7.12 Variante sans Docker (PM2)

`ecosystem.config.cjs` est fourni pour qui préfère gérer le process sans
conteneur : `npm ci && npm run build && pm2 reload ecosystem.config.cjs
--update-env`. À noter que cette config est en `instances: 'max'` + `cluster`,
donc un process Node par cœur — **plus gourmand en RAM** que le conteneur unique,
et PM2 demande en plus `pm2 startup` pour survivre au reboot. Sur un VPS 2 Go,
Docker reste le meilleur choix.
