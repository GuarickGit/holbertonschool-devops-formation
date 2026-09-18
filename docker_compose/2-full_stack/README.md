# FFVII Materia Catalog — Full Stack (Proxy + Cache)

Extends the base stack with a reverse proxy as the single entry point
and a Redis cache in front of the database, to avoid hitting
PostgreSQL on every request.

## Architecture

| Service | Role                                      | Technology                          |
| ------- | ----------------------------------------- | ----------------------------------- |
| `proxy` | Single entry point, routes traffic        | Nginx (alpine)                      |
| `web`   | Static frontend                           | Nginx (alpine), vanilla HTML/CSS/JS |
| `api`   | Serves materia data as JSON, caches reads | Node.js / Express                   |
| `redis` | Caches the materia list                   | Redis 7 (alpine)                    |
| `db`    | Stores materia data                       | PostgreSQL 16 (alpine)              |

Only `proxy` publishes a port on the host (`80`). `web`, `api`, `db`,
and `redis` are reachable only through the internal Compose network —
traffic enters through one door.

## Routing

The proxy (`proxy/nginx.conf`) routes based on path:

- `/api/*` → forwarded to the `api` service (port 3000)
- everything else → forwarded to the `web` service (port 80)

The frontend calls a relative path (`/api/materias`), so the browser
always talks to the proxy, which then forwards internally.

## Caching

`api` follows a cache-aside pattern against `redis`:

1. On `GET /api/materias`, check Redis for a cached result.
2. If present, return it directly (cache hit).
3. If absent, query PostgreSQL, store the result in Redis with a
   60-second expiration, then return it (cache miss).

`REDIS_HOST` is set to `redis`, the service name, and resolved
automatically over the Compose network.

## Startup order

- `db` and `redis` start in parallel, each with its own `healthcheck`.
- `api` declares `depends_on` on both `db` and `redis` with
  `condition: service_healthy`, so it only starts once both are ready.
- `web` waits for `api` to be healthy.
- `proxy` starts last, after `web` and `api`.

## Proof: startup ordering

```
Container 2-full_stack-redis-1 Healthy
Container 2-full_stack-db-1 Healthy
Container 2-full_stack-api-1 Waiting
api-1    | API listening on port 3000
Container 2-full_stack-api-1 Healthy
web-1    | ... nginx started ...
proxy-1  | ... nginx started ...
```

`api-1` only starts after both `db-1` and `redis-1` report `Healthy`;
`web` and `proxy` follow in turn.

## Proof: single entry point

Loading `http://localhost` in the browser, the Network tab shows all
requests (`localhost`, `style.css`, `script.js`, `materias`) going
through the same origin, with no direct reference to `api`'s internal
port — confirming the proxy handles both the frontend and API traffic.

## Proof: cache behavior

```
api-1  | Cache miss, querying database     (first request)
api-1  | Serving materias from cache        (subsequent request, within TTL)
api-1  | Serving materias from cache        (subsequent request, within TTL)
api-1  | Cache miss, querying database      (TTL expired, ~60s later)
```

The first request misses the cache and queries PostgreSQL. Requests
within the following 60 seconds are served from Redis. Once the TTL
expires, the next request misses again and refreshes the cache.

## Setup

```bash
cp .env.example .env
```

## Running the stack

```bash
docker compose up
```

- Frontend + API: [http://localhost](http://localhost)

## Stopping the stack

```bash
docker compose down
```

Add `-v` to also remove the `db_data` volume and reset the database.

## Project structure

```
2-full_stack/
├── compose.yaml
├── .env.example
├── .gitignore
├── db/
│   └── init.sql
├── api/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── web/
│   ├── Dockerfile
│   ├── index.html
│   ├── style.css
│   └── script.js
└── proxy/
    ├── Dockerfile
    └── nginx.conf
```
