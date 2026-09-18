# Docker Compose — Healthchecks

Demonstrates how to make one service wait for another to be genuinely
ready, not just started, using a Compose `healthcheck` combined with a
`depends_on` condition.

## Architecture

| Service | Role                        | Technology             |
| ------- | --------------------------- | ---------------------- |
| `db`    | Stores materia data         | PostgreSQL 16 (alpine) |
| `api`   | Serves materia data as JSON | Node.js / Express      |

## The problem

Starting `db` and `api` at the same time is not enough. PostgreSQL
takes a moment to initialize before it can accept connections. If
`api` tries to connect too early, it fails or crashes.

## The fix

- `db` defines a `healthcheck` using `pg_isready`, which checks that
  PostgreSQL is actually accepting connections — not just that the
  container process is running.
- `api` declares `depends_on: db: condition: service_healthy`, which
  tells Compose to hold `api`'s startup until `db`'s healthcheck
  reports `healthy`.

```yaml
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
    interval: 5s
    timeout: 5s
    retries: 5

api:
  depends_on:
    db:
      condition: service_healthy
```

## Proof of ordering

Running `docker compose up`, the logs show `db` completing its full
PostgreSQL initialization and being marked `Healthy` **before** `api`
ever starts:

```
Container 1-healthchecks-db-1 Waiting
db-1  | ... PostgreSQL initializing, running init.sql ...
db-1  | CREATE TABLE
db-1  | INSERT 0 8
db-1  | database system is ready to accept connections
Container 1-healthchecks-db-1 Healthy
api-1  | API listening on port 3000
```

`api-1` only logs its startup message after `db-1` is marked
`Healthy`, confirming that the dependency condition works as intended.

## Setup

```bash
cp .env.example .env
```

## Running the stack

```bash
docker compose up
```

- API: [http://localhost:3000/api/materias](http://localhost:3000/api/materias)
- API health check: [http://localhost:3000/health](http://localhost:3000/health)

## Stopping the stack

```bash
docker compose down
```

Add `-v` to also remove the `db_data` volume and reset the database.

## Project structure

```
1-healthchecks/
├── compose.yaml
├── .env.example
├── .gitignore
├── db/
│   └── init.sql
└── api/
    ├── Dockerfile
    ├── package.json
    └── server.js
```
