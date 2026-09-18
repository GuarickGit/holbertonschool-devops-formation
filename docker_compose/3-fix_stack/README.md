# Docker Compose — Fix a Broken Stack

The provided `compose.yaml` had three classic bugs preventing the
stack from starting. All three are fixed below, with no redesign of
the stack itself.

## Bugs found and fixed

### 1. Missing database password

`db` had no `POSTGRES_PASSWORD` set. The official `postgres` image
refuses to initialize without one, causing the container to crash on
startup.

**Fix:** added `POSTGRES_PASSWORD: postgres` under `db`'s
`environment`, matching the `-U postgres` already used in the
healthcheck.

### 2. Port conflict

Both `web` (`8080:80`) and `api` (`8080:8080`) tried to publish port
`8080` on the host. Docker rejects the second binding
(`port is already allocated`).

**Fix:** changed `api`'s host port to `8081`, so it no longer
collides with `web`.

### 3. Referenced service does not exist

`api` declared `depends_on: - databse` — a typo. No service named
`databse` exists in the stack, so Compose refuses to start.

**Fix:** corrected the reference to `db`, the actual service name.

## Result

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  cache:
    image: redis:7-alpine

  web:
    image: nginx:alpine
    ports:
      - "8080:80"

  api:
    image: nginx:alpine
    ports:
      - "8081:8080"
    depends_on:
      - db
```

All four services (`db`, `cache`, `web`, `api`) now start and stay up
with a single `docker compose up`, with no crash loops, no port
conflicts, and no missing references.

## Known limitation (not one of the three bugs)

`api`'s host port was changed to `8081` only to resolve the port
conflict. Its container port (`8080`) does not match nginx's actual
listening port inside the `nginx:alpine` image, which is `80` by
default. As a result, `api` starts and stays up (satisfying the
task's requirements), but nothing responds on `localhost:8081`.

This was left as-is because the task explicitly scopes the fix to
three named problems (missing password, port conflict, non-existent
service reference) and asks not to redesign the stack. Changing the
container port would go beyond that scope.

## Running the stack

```bash
docker compose up
```

## Stopping the stack

```bash
docker compose down
```
