# 1. Your first Dockerfile

Tiny Express app served from inside a Docker container.

## Build

```bash
docker build -t first-image .
```

## Run

```bash
docker run -d -p 3000:3000 --name first-container first-image
```

## Verify

```bash
curl http://localhost:3000
```

Expected output: `Hello from inside a container!`
