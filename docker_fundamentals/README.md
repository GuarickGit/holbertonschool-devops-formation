# Learning Objectives

## General

**1. Ce qu'est un conteneur, et en quoi il diffère d'une machine virtuelle**

Un conteneur est un processus isolé qui s'exécute directement sur le noyau (kernel) de la machine hôte, mais avec sa propre vue du système de fichiers, du réseau et des processus — grâce à des fonctionnalités du noyau Linux (namespaces, cgroups). Il embarque uniquement l'application et ses dépendances, pas un système d'exploitation complet.

Une machine virtuelle, elle, virtualise le matériel et fait tourner un système d'exploitation invité complet (avec son propre noyau), au-dessus d'un hyperviseur. C'est beaucoup plus lourd à démarrer, à stocker, et à faire tourner en grand nombre.

**Différence clé :** plusieurs conteneurs partagent le même noyau (démarrage en millisecondes, très légers), alors que chaque VM embarque son propre noyau complet (démarrage en dizaines de secondes, beaucoup plus lourde).

**2. Ce que sont une image, un layer, et un registre**

- **Image** : un modèle en lecture seule qui contient tout ce qu'il faut pour faire tourner une application (code, dépendances, configuration). Un conteneur est une instance en cours d'exécution d'une image.
- **Layer (couche)** : une image est construite comme un empilement de couches, chacune correspondant à une instruction du Dockerfile (ex. `COPY`, `RUN`). Docker met ces couches en cache : si une couche n'a pas changé, elle est réutilisée telle quelle au prochain build, ce qui accélère considérablement les reconstructions.
- **Registre (registry)** : un serveur qui stocke et distribue des images, organisées en dépôts (repositories) et tags (versions). Docker Hub est le registre public par défaut, mais on peut aussi en héberger un privé.

**3. Le CLI Docker essentiel**

- **`docker run`** : crée et démarre un conteneur à partir d'une image.
- **`docker ps`** : liste les conteneurs en cours d'exécution (`-a` pour inclure ceux arrêtés).
- **`docker exec`** : exécute une commande dans un conteneur déjà démarré (ex. ouvrir un shell interactif).
- **`docker logs`** : affiche la sortie standard/erreur d'un conteneur, utile pour diagnostiquer un problème.
- **`docker images`** : liste les images présentes localement.
- **`docker build`** : construit une image à partir d'un Dockerfile.
- **`docker stop`** : arrête un conteneur en cours d'exécution proprement (signal `SIGTERM`, puis `SIGKILL` après un délai).
- **`docker rm`** : supprime un conteneur arrêté.

**4. Les instructions essentielles d'un Dockerfile**

- **`FROM`** : définit l'image de base à partir de laquelle construire (ex. `node:20-alpine`). Toujours la première instruction.
- **`WORKDIR`** : définit le répertoire de travail à l'intérieur du conteneur pour toutes les instructions suivantes (`COPY`, `RUN`, `CMD`...).
- **`COPY`** : copie des fichiers depuis la machine hôte (le contexte de build) vers le système de fichiers du conteneur.
- **`RUN`** : exécute une commande pendant la construction de l'image (ex. installer des dépendances), et son résultat est capturé dans une nouvelle couche.
- **`EXPOSE`** : documente le port sur lequel l'application à l'intérieur du conteneur écoute. C'est purement informatif — ça ne publie rien tout seul (voir point 6).
- **`CMD`** : définit la commande exécutée par défaut au démarrage du conteneur.

**5. La différence entre `CMD` et `ENTRYPOINT`**

- **`CMD`** définit une commande par défaut, mais entièrement remplaçable : si on lance `docker run mon-image autre-commande`, `autre-commande` écrase le `CMD` du Dockerfile.
- **`ENTRYPOINT`** définit une commande fixe qui s'exécute toujours ; les arguments passés à `docker run` s'ajoutent à sa suite plutôt que de la remplacer.

Les deux se combinent souvent : `ENTRYPOINT` fixe le programme principal (ex. `["node", "server.js"]`), et `CMD` peut fournir des arguments par défaut modifiables (ex. des flags optionnels).

**6. Pourquoi publier un port (`-p`) n'est pas la même chose qu'`EXPOSE`**

`EXPOSE` dans un Dockerfile ne fait que documenter — pour les humains et certains outils — quel port l'application écoute à l'intérieur du conteneur. Il ne crée **aucun** mapping réseau vers l'hôte : sans `-p`, le port reste totalement inaccessible depuis l'extérieur du conteneur, même s'il est déclaré avec `EXPOSE`.

La publication réelle se fait avec `-p hôte:conteneur` au lancement (`docker run -p 8080:80 ...`), qui crée une redirection depuis un port de la machine hôte vers le port du conteneur. C'est cette option, et elle seule, qui rend le service joignable depuis l'extérieur.

**7. Pourquoi les conteneurs rendent une application reproductible**

Une image Docker embarque tout ce dont l'application a besoin pour tourner : le code, les dépendances exactes (avec leurs versions figées), les fichiers de configuration, et même le système de base. Elle élimine ainsi le classique "ça marche sur ma machine" : la même image, construite une fois, tourne à l'identique sur n'importe quelle machine dotée de Docker — poste de développement, serveur de CI, environnement de production — sans dépendre des paquets déjà installés localement ni de la configuration de l'hôte.
