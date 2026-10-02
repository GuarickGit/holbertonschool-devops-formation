# 0. Persist your data

This document shows that data written to a PostgreSQL container survives the removal and recreation of that container, thanks to a **named volume**.

## 1. Create a named volume

```bash
docker volume create pgdata
```

Output:

```
pgdata
```

```bash
docker volume ls
```

Output:

```
DRIVER    VOLUME NAME
local     pgdata
```

## 2. Run PostgreSQL with the volume

```bash
docker run -d --name pg-test -e POSTGRES_PASSWORD=demo -v pgdata:/var/lib/postgresql/data postgres:16
```

`-v pgdata:/var/lib/postgresql/data` mounts the volume `pgdata` where PostgreSQL stores its data. Because the left side is a name (not a path), Docker treats it as a named volume.

```bash
docker ps
```

Output:

```
CONTAINER ID   IMAGE         COMMAND                  CREATED          STATUS          PORTS      NAMES
5ffc2adeb3f0   postgres:16   "docker-entrypoint.s…"   24 seconds ago   Up 23 seconds   5432/tcp   pg-test
```

## 3. Write some data

```bash
docker exec pg-test psql -U postgres \
  -c "CREATE TABLE notes (id serial PRIMARY KEY, message text);" \
  -c "INSERT INTO notes (message) VALUES ('hello from the first container');" \
  -c "SELECT * FROM notes;"
```

Output:

```
CREATE TABLE
INSERT 0 1
 id |            message
----+--------------------------------
  1 | hello from the first container
(1 row)
```

## 4. Remove the container

```bash
docker rm -f pg-test
docker ps -a
docker volume ls
```

Output:

```
pg-test
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
DRIVER    VOLUME NAME
local     pgdata
```

The container is gone, but the volume `pgdata` still exists: its lifecycle is independent from the container's.

## 5. Recreate a new container with the same volume

```bash
docker run -d --name pg-test2 -e POSTGRES_PASSWORD=demo -v pgdata:/var/lib/postgresql/data postgres:16
```

New container ID: `589a0aa6ee8f...` (different from the first one, `5ffc2adeb3f0...`).

```bash
docker exec pg-test2 psql -U postgres -c "SELECT * FROM notes;"
```

Output:

```
 id |            message
----+--------------------------------
  1 | hello from the first container
(1 row)
```

The row written by the first container is still there: **the data survived**.

## 6. Proof that it is a named volume (not a bind mount)

```bash
docker inspect pg-test2 --format '{{json .Mounts}}'
```

Output:

```json
[
  {
    "Type": "volume",
    "Name": "pgdata",
    "Source": "/var/lib/docker/volumes/pgdata/_data",
    "Destination": "/var/lib/postgresql/data",
    "Driver": "local",
    "Mode": "z",
    "RW": true,
    "Propagation": ""
  }
]
```

`"Type":"volume"` confirms a named volume managed by Docker (stored under `/var/lib/docker/volumes/`). A bind mount would show `"Type":"bind"` and a path from the host filesystem.

## Named volume vs bind mount

|             | Named volume                    | Bind mount                                       |
| ----------- | ------------------------------- | ------------------------------------------------ |
| Syntax      | `-v pgdata:/path`               | `-v /host/path:/path`                            |
| Managed by  | Docker                          | The user (host path)                             |
| Location    | `/var/lib/docker/volumes/...`   | Any host directory                               |
| Typical use | Persistent app data (databases) | Sharing source code or config with the container |

## Conclusion

Removing a container deletes its writable layer, but not a named volume mounted on it. Mounting the same volume in a new container gives access to the same data.
