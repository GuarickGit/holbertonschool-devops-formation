# FFVII Materia Catalog — Docker Compose First Stack

A small three-tier web application that displays a catalog of Materias
from Final Fantasy VII. Built to demonstrate a multi-service stack
orchestrated entirely through Docker Compose.

## Architecture

The stack is made of three services defined in a single `compose.yaml`:

| Service | Role                                                  | Technology                                 |
| ------- | ----------------------------------------------------- | ------------------------------------------ |
| `db`    | Stores materia data (name, type, description, effect) | PostgreSQL 16 (alpine)                     |
| `api`   | Serves materia data as JSON over HTTP                 | Node.js / Express                          |
| `web`   | Static frontend that fetches and displays the data    | Nginx (alpine) serving vanilla HTML/CSS/JS |

Startup order is enforced with healthchecks: `api` waits for `db` to be
truly ready to accept connections (not just started), and `web` waits
for `api` to be healthy in turn.

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Copy the example environment file and adjust values if needed:

```bash
   cp .env.example .env
```

2. The `.env` file defines the PostgreSQL credentials used by both
   `db` and `api`. It is not committed to version control.

## Running the stack

Start all three services with a single command:

```bash
docker compose up
```

On first run, Docker will build the `api` and `web` images and pull the
`postgres` image. The database will be initialized with sample materia
data from `db/init.sql`.

Once running:

- Frontend: [http://localhost:8080](http://localhost:8080)
- API: [http://localhost:3000/api/materias](http://localhost:3000/api/materias)
- API health check: [http://localhost:3000/health](http://localhost:3000/health)

To rebuild images after changing `api` or `web` source code:

```bash
docker compose up --build
```

## Stopping the stack

```bash
docker compose down
```

This stops and removes the containers and the network, but keeps the
`db_data` volume so materia data persists across restarts. To also
remove the volume (full reset):

```bash
docker compose down -v
```

## Project structure

```
0-first_stack/
├── compose.yaml
├── .env.example
├── .gitignore
├── db/
│   └── init.sql
├── api/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── web/
    ├── Dockerfile
    ├── index.html
    ├── style.css
    └── script.js
```
