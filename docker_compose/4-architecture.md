# Architecture — FFVII Materia Catalog (Full Stack)

This document describes the stack built in `2-full_stack/`: five
services working together behind a single entry point.

## Services

| Service | Role                                                                                  | Image / Build                                |
| ------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| `proxy` | Single entry point. Routes external traffic by path to `web` or `api`.                | Built from `proxy/Dockerfile` (nginx:alpine) |
| `web`   | Serves the static frontend (HTML/CSS/JS).                                             | Built from `web/Dockerfile` (nginx:alpine)   |
| `api`   | Serves materia data as JSON. Reads/writes the cache, queries the database.            | Built from `api/Dockerfile` (node:20-alpine) |
| `redis` | In-memory cache for the materia list, to avoid hitting the database on every request. | `redis:7-alpine`                             |
| `db`    | Persistent storage for materia data.                                                  | `postgres:16-alpine`                         |

## Network

All five services share a single Docker Compose network, created
automatically (`2-full_stack_default`). Services reach each other by
service name — Compose provides internal DNS resolution, so `api` can
connect to `redis` and `db` simply by using those names as hostnames,
with no manual IP configuration.

Only `proxy` publishes a port to the host machine (`80:80`). `web`,
`api`, `redis`, and `db` have no published ports — they are only
reachable from inside the Docker network, not from the host or the
outside world. This is deliberate: it enforces a single entry point
for all external traffic.

## Volumes

One named volume, `db_data`, is mounted into `db` at
`/var/lib/postgresql/data`. This is where PostgreSQL stores its actual
data files. Because it is a named volume (not tied to the container's
writable layer), the data survives `docker compose down` and
container recreation — it is only removed with an explicit
`docker compose down -v`.

`redis` has no volume: it is a pure cache with a short TTL (60
seconds) on its one key, so losing it on restart is expected and
harmless — it will simply be repopulated from `db` on the next
request.

## Request path

```
                         ┌──────────────────────────────────────────┐
                         │           Docker network                 │
                         │        (2-full_stack_default)            │
                         │                                          │
  Browser                │   ┌───────┐                              │
    │                    │   │ proxy │  :80 (published to host)     │
    │  GET /             │   └───┬───┘                              │
    │  GET /api/materias │       │                                  │
    └───────────────────►┼───────┤                                  │
       http://localhost  │       │                                  │
                         │  ┌────┴────┐         ┌────────────┐      │
                         │  │  /  →   │         │ /api/ → api│      │
                         │  │  web    │         └──┬─────────┘      │
                         │  └────┬────┘            │                │
                         │       │                 │                │
                         │  static files       ┌────▼────┐          │
                         │  (html/css/js)      │   api   │          │
                         │                     └────┬────┘          │
                         │                           │              │
                         │                  ┌────────┴────────┐     │
                         │                  │                 │     │
                         │             ┌────▼────┐      ┌─────▼───┐ │
                         │             │  redis  │      │   db    │ │
                         │             │ (cache) │      │(storage)│ │
                         │             └─────────┘      └─────────┘ │
                         └──────────────────────────────────────────┘
```

### Step by step

1. The browser loads `http://localhost`. This request hits `proxy`,
   the only service with a port published on the host.
2. `proxy` inspects the request path:
   - `/`, `/style.css`, `/script.js` → forwarded to `web`, which
     serves the static frontend files.
   - `/api/*` → forwarded to `api`.
3. Once the page loads, the frontend's `script.js` calls
   `/api/materias` (a relative path). This request also goes through
   `proxy`, which forwards it to `api`.
4. `api` first checks `redis` for a cached result:
   - **Cache hit:** the cached JSON is returned immediately, no
     database query.
   - **Cache miss:** `api` queries `db` (PostgreSQL) for the materia
     list, stores the result in `redis` with a 60-second expiration,
     then returns it.
5. The response travels back through `proxy` to the browser, which
   renders the materia cards.

Every hop after `proxy` happens entirely inside the Docker network —
the browser never talks to `web`, `api`, `redis`, or `db` directly.
