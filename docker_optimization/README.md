# Docker : Optimisation et durcissement

Projet pratique pour rendre des images Docker petites, rapides à reconstruire et sûres : persistance, réseau, optimisation d'image, builds multi-étapes et durcissement.

## Contenu

| Tâche | Sujet                                                  | Livrable                               |
| ----- | ------------------------------------------------------ | -------------------------------------- |
| 0     | Persister des données avec un volume nommé             | [`0-persistence.md`](0-persistence.md) |
| 1     | Conteneurs qui communiquent sur un réseau personnalisé | [`1-networking.md`](1-networking.md)   |
| 2     | Alléger une image Node surchargée                      | [`2-optimize/`](2-optimize/)           |
| 3     | Réparer un build multi-étapes Go cassé                 | [`3-multistage/`](3-multistage/)       |
| 4     | Utilisateur non-root et healthcheck fonctionnel        | [`4-harden/`](4-harden/)               |

## Résultats mesurés

|                                            | Avant          | Après                            |
| ------------------------------------------ | -------------- | -------------------------------- |
| Tâche 2 : taille de l'image (`DISK USAGE`) | 1,59 Go        | 208 Mo                           |
| Tâche 2 : rebuild après 1 ligne de code    | 4,02 s         | 1,10 s                           |
| Tâche 3 : image finale Go                  | build cassé    | 23,1 Mo, sans chaîne d'outils Go |
| Tâche 4 : utilisateur / healthcheck        | build en échec | `app` (non-root), `healthy`      |

## Objectifs d'apprentissage

### Persister des données avec un volume nommé, et différence avec un bind mount

Un conteneur a un système de fichiers temporaire : quand on le supprime, ses données disparaissent. Un **volume nommé** (`-v pgdata:/var/lib/postgresql/data`) est un espace de stockage créé et géré par Docker (sous `/var/lib/docker/volumes/`), indépendant du cycle de vie du conteneur. En Tâche 0, des données écrites dans PostgreSQL ont survécu à la suppression puis à la recréation du conteneur.

Un **bind mount** (`-v /chemin/hôte:/chemin/conteneur`) relie directement un dossier de la machine hôte au conteneur. Le stockage n'est alors pas géré par Docker, il dépend de l'arborescence et des permissions de l'hôte.

|               | Volume nommé                            | Bind mount                                      |
| ------------- | --------------------------------------- | ----------------------------------------------- |
| Syntaxe       | `-v pgdata:/chemin`                     | `-v /chemin/hôte:/chemin`                       |
| Géré par      | Docker                                  | L'utilisateur (chemin de l'hôte)                |
| Usage typique | Données persistantes (bases de données) | Partager du code ou une config en développement |

`docker inspect` distingue les deux : `"Type":"volume"` ou `"Type":"bind"`.

### Comment les conteneurs se trouvent sur un réseau personnalisé

Sur un réseau défini par l'utilisateur, Docker fournit un DNS interne : chaque conteneur est joignable par son **nom**. En Tâche 1, `client` a atteint `web` avec `ping web` et `wget http://web`, sans jamais écrire d'adresse IP. Le nom a été résolu en `172.18.0.2`.

Coder des IP en dur est fragile : elles sont attribuées dynamiquement et peuvent changer à chaque recréation du conteneur. Le nom, lui, reste stable. Sur le bridge par défaut, il n'y a pas de DNS par nom : le même `ping` a échoué avec `bad address`.

### Ce qu'est un build multi-étapes et pourquoi il produit des images plus petites

Un Dockerfile multi-étapes contient plusieurs `FROM`. On compile dans une première étape (image lourde avec le compilateur, par exemple `golang:1.22`), puis on ne copie que le résultat (`COPY --from=builder /app/server /server`) dans une image finale légère (`alpine:3.20`). Tout le reste (compilateur, sources, caches) n'est pas dans l'image livrée.

En Tâche 3, l'image finale fait **23,1 Mo** et `which go` n'y trouve rien. Deux bugs ont été corrigés : le nom d'étape (`build` au lieu de `builder`) et le binaire, compilé avec `CGO_ENABLED=0` pour être statique et fonctionner sur Alpine.

### Effet de l'ordre des couches et du `.dockerignore` sur le cache et la taille

Chaque instruction crée une couche. Docker réutilise une couche en cache tant que l'instruction et ses fichiers sont inchangés, mais dès qu'une couche change, toutes les suivantes sont reconstruites. Il faut donc placer ce qui change rarement (dépendances) avant ce qui change souvent (code). En Tâche 2, copier `package*.json` puis lancer `npm install` **avant** de copier le code a donné `CACHED` sur l'installation : le rebuild est passé de 4,02 s à 1,10 s.

Le `.dockerignore` exclut des fichiers du contexte de build (`node_modules`, `.git`, `.env`, logs, docs). Il réduit le contexte envoyé à Docker, évite qu'un `node_modules` local écrase celui de l'image, empêche d'embarquer des secrets, et évite d'invalider le cache pour des fichiers inutiles à l'exécution.

### Choisir une image de base

| Type       | Exemple                 | Avantages                                                                               | Inconvénients                                                                           |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Complète   | `node:20`               | Tous les outils présents, compatibilité maximale                                        | Très lourde (1,59 Go mesurés avec l'app de la Tâche 2), grande surface d'attaque        |
| Slim       | `node:20-slim`          | Debian allégée, garde la glibc                                                          | Moins d'outils, plus lourde qu'Alpine                                                   |
| Alpine     | `node:20-alpine`        | Très petite (208 Mo mesurés pour la même app)                                           | Utilise musl au lieu de glibc : un binaire lié à la glibc ne démarre pas (voir Tâche 3) |
| Distroless | `gcr.io/distroless/...` | Contient uniquement l'application et son runtime, sans shell ni gestionnaire de paquets | Plus difficile à déboguer (pas de shell)                                                |

On choisit en fonction de la compatibilité avec l'application, de la taille voulue et de la surface d'attaque. Distroless n'a pas été testé dans ce projet.

### Pourquoi et comment exécuter un conteneur en non-root

Un conteneur partage le noyau de l'hôte. Si un processus root est compromis (ou si une faille d'évasion existe), l'attaquant dispose de droits élevés. Un utilisateur non privilégié limite les dégâts : c'est le principe du moindre privilège.

Comment faire : créer un utilisateur et passer dessus avec `USER`. Il faut gérer les permissions explicitement : en Tâche 4, `USER app` placé avant `npm install` provoquait `EACCES`, car le dossier de travail appartenait à root. La correction est `chown app:app` sur le dossier (avant `USER`) et `COPY --chown=app:app` pour les fichiers. L'image `node:20-alpine` fournit aussi un utilisateur `node` prêt à l'emploi (utilisé en Tâche 2). Vérification : `docker exec <conteneur> whoami` renvoie `app` ou `node`, jamais `root`.

### Ce que fait un HEALTHCHECK et comment le faire réellement passer

Un `HEALTHCHECK` exécute périodiquement une commande dans le conteneur. Code de sortie `0` : sain, `1` : défaillant. L'état (`starting`, `healthy`, `unhealthy`) apparaît dans `docker ps` et peut être utilisé par les orchestrateurs. Un conteneur peut être `Up` alors que l'application ne répond plus : le healthcheck détecte ce cas.

Pour qu'il passe, trois choses doivent être justes (les trois bugs de la Tâche 4) :

1. **Le bon port** : l'application écoute sur `3000`, pas `8080`.
2. **Un outil présent dans l'image** : `curl` n'existe pas sur Alpine, `wget` si.
3. **Le bon endpoint et un code de retour correct** : `/health`, avec `|| exit 1`.

Bonnes pratiques : utiliser `127.0.0.1` plutôt que `localhost` (évite la résolution IPv6) et prévoir un `--start-period` pour laisser l'application démarrer. Vérification : `docker inspect --format '{{json .State.Health}}'` montre `"Status":"healthy"` et des vérifications avec `"ExitCode":0`.

### Pourquoi scanner les images à la recherche de vulnérabilités

Une image contient un système de base, des paquets et des bibliothèques (npm, Go, etc.) qui peuvent avoir des failles publiques connues (CVE). Une image qui « marche » peut donc être dangereuse en production. Un scanner comme **Trivy** compare le contenu de l'image à des bases de vulnérabilités et signale les paquets concernés avec leur gravité et la version corrigée.

On scanne avant de livrer et régulièrement ensuite, car de nouvelles failles sont découvertes après la construction de l'image (idéalement en CI). Réduire l'image (Alpine, multi-étapes, distroless) diminue aussi le nombre de paquets, donc de vulnérabilités possibles. Aucun scan n'a été réalisé dans ce projet : cette section décrit le principe.

## Notes

- Les tailles sont la colonne `DISK USAGE` de `docker images`.
- Rien de sensible n'est commité : pas de `node_modules`, pas d'artefacts de build, pas de secrets. Le seul mot de passe utilisé (`POSTGRES_PASSWORD=demo`, Tâche 0) est une valeur jetable pour un conteneur de test local.
