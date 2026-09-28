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
