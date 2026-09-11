# 4. Talk to your container

## Change made

Added a `GREETING` environment variable to `app.js` in `1-first_image/`, with a fallback to the original message when unset.

## Commands used

```bash
docker build -t first-image .
docker run -d -p 3000:3000 --name talk-container -e GREETING="Hello Guarick, from your container!" first-image
curl http://localhost:3000
docker exec talk-container env
docker logs talk-container
docker inspect talk-container
```

## Observations

1. **`-e` at runtime**: passing `-e GREETING="Hello Guarick, from your container!"` to `docker run` changed the app's response immediately — `curl` returned exactly that string, no rebuild required. The variable is read once, at process startup (`process.env.GREETING`), not baked into the image at build time.

2. **`exec` from inside**: `docker exec talk-container env` listed `GREETING=Hello Guarick, from your container!` alongside the container's other environment variables (`PATH`, `NODE_VERSION`, `HOSTNAME`). This confirms the value genuinely lives in the container's process environment, not just something the app echoes back over HTTP.

3. **`logs` / `inspect`**: `docker logs` shows the greeting baked into the startup line (`App listening on port 3000 — greeting: ...`). `docker inspect` goes further — under `Config.Env` the same `GREETING` value is listed, and `NetworkSettings` shows the container's own IP (`172.17.0.2`) on the bridge network, plus the exact port mapping (`3000/tcp` → host `3000`) under `HostConfig.PortBindings`.
