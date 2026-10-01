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

L'API est déployée sur un **VPS Hostinger (Ubuntu, accès root via SSH)**. Sur un
VPS on ne peut pas utiliser le deploy automatique de Render : c'est le serveur
qui tire le code depuis GitHub, puis Nginx le met devant.

```
Internet ──HTTPS──> Nginx (443) ──http──> API NestJS (127.0.0.1:3000, PM2)
                                            └──> PostgreSQL Supabase
```

### 7.1 Prérequis dans hPanel

1. **VPS avec un système d'exploitation** : hPanel → *VPS* → *Ajouter* → Ubuntu 22.04/24.04.
2. **Accès root** : hPanel → *VPS* → *Serveur* → *Gérer* → *Paramètres root*.
3. Un **sous-domaine** pointant vers l'IP du VPS : hPanel → *Sites* → *Ajouter*.
   Exemple `api.tawssilgo.com`. C'est obligatoire pour obtenir un certificat HTTPS.

### 7.2 Connexion SSH

```bash
ssh root@<IP_DU_VPS>
```

### 7.3 Installation de la pile serveur (une seule fois)

```bash
apt update && apt upgrade -y

# Node.js 20 + npm
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 (gestion du process)
npm install -g pm2

# Nginx + Certbot (reverse proxy + HTTPS)
apt install -y nginx certbot python3-certbot-nginx

# Outils utiles
apt install -y git curl
```

### 7.4 Récupération du dépôt

```bash
mkdir -p /var/www/tawssilgo && cd /var/www/tawssilgo
git clone https://github.com/aniszik98/api-tawssilgo.git .
cp .env.example .env
nano .env    # renseigner DB_*, API_KEYS — .env n'est jamais versionné
chmod 600 .env
```

### 7.5 Premier lancement

```bash
npm ci
npm run build
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # ← copier la commande affichée, elle rend PM2 persistant au reboot
```

Vérification :

```bash
curl http://127.0.0.1:3000/api/v1/health
```

### 7.6 Nginx + HTTPS

Remplacer `api.tawssilgo.com` par votre domaine, puis :

```bash
cp /var/www/tawssilgo/deploy/nginx/tawssilgo-api.conf /etc/nginx/sites-available/tawssilgo-api.conf
ln -s /etc/nginx/sites-available/tawssilgo-api.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

Pour le certificat, retirer d'abord le bloc `listen 443` du fichier
(Let's Encrypt a besoin du port 80 seul), puis :

```bash
certbot --nginx -d api.tawssilgo.com
systemctl enable certbot.timer
```

Après la validation de `certbot`, rejouer la commande `cp ... /etc/nginx/sites-available/`
pour récupérer la version finale avec le bloc 443, puis `nginx -t && systemctl reload nginx`.

L'API est disponible sur :

- API : `https://api.tawssilgo.com/api/v1`
- Swagger : `https://api.tawssilgo.com/docs`

### 7.7 Mises à jour ultérieures

```bash
cd /var/www/tawssilgo && bash deploy/deploy.sh
```

Ce script fait `git pull` + `npm ci` + `npm run build` + `pm2 reload`. Si la
configuration PM2 n'a jamais été modifiée, un simple `git pull && npm run build
&& pm2 reload ecosystem.config.cjs --update-env` suffit.

> `--update-env` est important : il réinjecte les variables de `.env` dans le
> process après un redémarrage.

### 7.8 Alternative : Docker

Un `Dockerfile` et un `docker-compose.yml` sont fournis si vous préférez
containeriser l'API :

```bash
cd /var/www/tawssilgo
docker compose up -d --build
```

Le port 3000 n'est publié que sur `127.0.0.1` : Nginx reste le seul point
d'entrée public. Dans ce cas, remplacez l'étape 7.5 (PM2) par
`systemctl enable docker` et oubliez PM2.

### 7.9 Commandes utiles

```bash
pm2 logs tawssilgo-api          # logs en direct
pm2 status                      # état des process
pm2 monit                       # CPU / mémoire
pm2 restart tawssilgo-api       # redémarrage manuel
journalctl -u nginx -f          # logs Nginx
```

### 7.10 Sécurité — points de vigilance

- **`.env` ne doit jamais être commité** : il est dans `.gitignore`, `chmod 600`
  sur le serveur. Idem pour les variables du `docker-compose` (`env_file`, pas
  `environment:` en clair).
- **Les clés `API_KEYS` sont secrètes**. Elles ont été retirées des logs
  applicatifs ; ne jamais les `console.log`.
- **Ne jamais ouvrir le port 3000 publiquement** : Nginx (et le pare-feu) sont
  les seuls à y accéder. Dans hPanel → *VPS* → *Pare-feu*, ouvrir uniquement
  `22`, `80`, `443`.
- **Les logs PM2** (`logs/*.log`) sont en dur sur le disque : les purger
  régulièrement (`pm2 flush`) ou activer la rotation via
  `pm2 install pm2-logrotate`.
