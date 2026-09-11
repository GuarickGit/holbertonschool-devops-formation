# 0. Meet your first container

## Commands used

```bash
docker pull nginx
docker run -d -p 8080:80 --name mon-nginx nginx
docker ps
curl http://localhost:8080
docker exec -it mon-nginx bash
docker logs mon-nginx
docker stop mon-nginx
docker rm mon-nginx
docker images
```

## Observations

1. L'image et le conteneur sont deux choses distinctes : `docker pull` a téléchargé l'image (un empilement de layers en lecture seule), et `docker run` a créé une instance à part, identifiée par son propre ID. La preuve la plus nette : après `docker rm mon-nginx`, le conteneur a disparu mais `docker images` montre toujours `nginx` dans la liste — supprimer un conteneur ne touche pas à l'image dont il est issu.

2. Le conteneur est vraiment isolé du système hôte. Une fois dedans avec `docker exec -it mon-nginx bash`, le prompt est devenu `root@e6b35aba3e9c:/#` au lieu de `guarick@Guarick`, avec son propre filesystem (`/usr/share/nginx/html`, `/etc/nginx/nginx.conf`) qui n'a rien à voir avec l'arborescence de ma machine WSL.

3. Le réseau du conteneur est isolé lui aussi. Dans `docker logs`, ma requête `curl` apparaît avec l'adresse source `172.17.0.1`, pas `127.0.0.1` ni l'IP de ma machine — c'est l'adresse de la passerelle du réseau bridge que Docker crée pour le conteneur. Le flag `-p 8080:80` fait le pont entre le port 8080 de mon hôte et le port 80 interne du conteneur, mais le conteneur reste dans son propre espace réseau.
