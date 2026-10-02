# 2. Shrink it

Optimization of a small Express app (`index.js`, one dependency: `express`).

## Before / after

|                                      | Before             | After             |
| ------------------------------------ | ------------------ | ----------------- |
| Base image                           | `node:20` (Debian) | `node:20-alpine`  |
| Image size (`DISK USAGE`)            | 1.59 GB            | 208 MB            |
| Compressed size (`CONTENT SIZE`)     | 401 MB             | 50.8 MB           |
| Cold build time                      | 4.25 s             | 3.80 s\*          |
| Rebuild after a one-line code change | 4.02 s             | 1.10 s            |
| `npm install` on code-only change    | re-run             | `CACHED`          |
| Runs as                              | root (no `USER`)   | `node` (non-root) |

\* Not a fully cold build: the `WORKDIR` step was already cached. Build time on a cold build is dominated by `npm install` in both cases (2.3 s vs 2.6 s), so the real gain is on rebuilds and size.

Size reduction: about **87 %** (1.59 GB to 208 MB).

## How it was measured

```bash
docker pull node:20            # so the download is not counted in the build time
time docker build -t optimize:before .
docker images optimize:before

# edit one line in index.js, then:
time docker build -t optimize:before .   # rebuild "before"

# optimized version
docker pull node:20-alpine
time docker build -t optimize:after .
docker images optimize

# edit one line in index.js, then:
time docker build -t optimize:after .    # rebuild "after"
```

Same measurement method for both images: the `DISK USAGE` column of `docker images` and the `real` line of `time`.

## What changed and why

1. **Lighter base image**: `node:20-alpine` instead of `node:20`. Alpine is a minimal Linux distribution, which is where most of the size reduction comes from.
2. **Layer ordering**: `package*.json` is copied and `npm install` is run **before** the application code is copied. As long as the dependencies do not change, Docker reuses the cached `npm install` layer. A code-only change only rebuilds the last `COPY` layer.
3. **`.dockerignore`**: keeps `node_modules`, `.git`, `.env`, logs and docs out of the build context. This keeps the context small and avoids copying a local `node_modules` or secrets into the image.
4. **Non-root user**: `USER node` (the unprivileged user provided by the official Node image) instead of running as root.
5. **`--omit=dev`**: only production dependencies are installed.

## Verification

```bash
docker run -d --name opt-test -p 3000:3000 optimize:after
docker exec opt-test whoami     # node
curl http://localhost:3000      # Optimize me! v3
```

Cache proof on a code-only change (`optimize:after`):

```
CACHED [3/5] COPY package*.json ./
CACHED [4/5] RUN npm install --omit=dev
[5/5] COPY index.js ./
```
