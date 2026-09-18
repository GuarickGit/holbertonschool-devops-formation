# Learning Objectives

## General

**1. Pourquoi Compose existe et quel problème il résout**

Une application réelle est rarement un seul conteneur : elle est composée de plusieurs services qui doivent tourner ensemble (front, API, base de données, cache, proxy...). Les démarrer un par un avec `docker run` oblige à retenir manuellement chaque port, chaque variable d'environnement, chaque nom de conteneur, et à les relier entre eux à la main — ça devient vite ingérable et impossible à reproduire de façon fiable.

Docker Compose résout ce problème en permettant de décrire l'intégralité d'une application — tous ses services, leurs connexions, leurs volumes, leurs réseaux — dans un seul fichier déclaratif (`compose.yaml`). Une seule commande (`docker compose up`) suffit alors à faire démarrer tout le système, dans le bon ordre, de façon reproductible.

**Exemple concret du projet :** le stack `2-full_stack/` regroupe 5 services (`proxy`, `web`, `api`, `redis`, `db`) qui démarrent tous avec `docker compose up`, sans qu'on ait à taper une seule commande `docker run`.

**2. L'anatomie d'un `compose.yaml`**

- **`services`** : bloc racine qui liste chaque composant de l'application. Chaque service correspond à un conteneur.
- **`build` vs `image`** : `image` récupère une image déjà construite (ex. `postgres:16-alpine`, `redis:7-alpine`) — utile pour les briques standards qu'on ne modifie pas. `build: ./chemin` construit une image à partir d'un `Dockerfile` local — utile pour son propre code applicatif (ex. `api/`, `web/`, `proxy/`).
- **`ports`** : publie un port du conteneur vers l'hôte (`"hôte:conteneur"`). Seuls les services qui doivent être joignables depuis l'extérieur du réseau Docker en ont besoin.
- **`volumes`** : monte un espace de stockage persistant (ex. `db_data:/var/lib/postgresql/data`), pour que les données survivent à la suppression d'un conteneur. Peut aussi monter un fichier local en lecture seule (ex. `init.sql`).
- **`networks`** : Compose crée automatiquement un réseau partagé entre tous les services d'un même fichier, avec résolution DNS par nom de service (pas besoin de connaître les IP).
- **`environment`** : variables d'environnement transmises au conteneur (identifiants de connexion, configuration applicative), souvent injectées depuis un `.env`.
- **`depends_on`** : déclare qu'un service dépend d'un autre pour son démarrage. Peut être une simple liste (attend juste que le conteneur soit _lancé_) ou une condition plus stricte (voir point 4).
- **`healthcheck`** : commande exécutée périodiquement dans le conteneur pour vérifier qu'il est réellement opérationnel, pas seulement démarré.

**3. Le cycle de vie de Compose**

- **`docker compose up`** : construit (si nécessaire) et démarre tous les services définis, dans l'ordre imposé par les dépendances.
- **`docker compose down`** : arrête et supprime les conteneurs et le réseau créé, sans toucher aux volumes nommés (sauf avec `-v`).
- **`docker compose logs`** : affiche les logs d'un ou plusieurs services, utile pour diagnostiquer un problème sans devoir se connecter dans un conteneur.
- **`docker compose ps`** : liste l'état de chaque service (running, healthy, exited...).
- **`docker compose exec <service> <commande>`** : exécute une commande à l'intérieur d'un conteneur déjà démarré (ex. ouvrir un shell dans `db` pour inspecter la base directement).

**4. Démarrer les services dans le bon ordre**

Un `depends_on` simple garantit uniquement l'ordre de _démarrage_ du conteneur — pas que le service à l'intérieur soit réellement prêt à répondre. Une base de données PostgreSQL, par exemple, met un instant à s'initialiser avant d'accepter des connexions ; une API qui tente de s'y connecter trop tôt plantera ou échouera silencieusement.

La solution est de combiner deux mécanismes :

- un **`healthcheck`** sur le service dépendant, qui teste sa disponibilité réelle (ex. `pg_isready` pour PostgreSQL, `redis-cli ping` pour Redis, une requête HTTP sur `/health` pour une API) ;
- une **condition de dépendance** (`depends_on: <service>: condition: service_healthy`) sur le service qui en dépend, qui bloque son démarrage tant que le premier n'est pas explicitement `healthy`.

**Exemple concret du projet :** dans `1-healthchecks/`, les logs montrent que `api-1` ne démarre qu'une fois que `Container ...-db-1` est passé à l'état `Healthy` — jamais avant.

**5. Paramétrer un stack : `.env`, fichiers d'override, profils**

- **Fichiers `.env`** : stockent les valeurs de configuration (identifiants, ports, etc.) en dehors du `compose.yaml`, pour ne jamais committer de secret dans le dépôt Git. Compose les charge automatiquement s'ils sont nommés `.env` et situés à côté du fichier compose. Un fichier `.env.example` (sans les vraies valeurs) sert de modèle versionné pour les autres développeurs.
- **Fichiers d'override** (ex. `compose.override.yaml` ou `compose.prod.yaml`) : permettent de superposer une configuration différente selon l'environnement (développement, production) sans dupliquer tout le fichier de base — seules les différences sont déclarées.
- **Profils** (`profiles:`) : permettent de marquer certains services comme optionnels, à n'activer que sur demande (`docker compose --profile <nom> up`), utile par exemple pour des outils de debug ou des services qui ne sont utiles que dans certains contextes.
