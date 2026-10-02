# 1. Make containers talk

This document shows that two containers on the same **user-defined bridge network** can reach each other **by name**, thanks to Docker's built-in DNS, and that this does not work on the default bridge network.

## 1. Create a custom bridge network

```bash
docker network create mynet
```

Output:

```
ba83e8852db0d8544a2033f1b8d0754c3b4788bd07fac9e4942b1585f1b762b9
```

```bash
docker network ls
```

Output:

```
NETWORK ID     NAME      DRIVER    SCOPE
af288ecc5e1e   bridge    bridge    local
0553dff3fc21   host      host      local
ba83e8852db0   mynet     bridge    local
a77d23a1d85a   none      null      local
```

`mynet` is a user-defined network (driver `bridge`), separate from the default `bridge`.

## 2. Run two containers on the network

The server (nginx):

```bash
docker run -d --name web --network mynet nginx:alpine
```

The client (alpine, kept alive with `sleep` so we can `exec` into it):

```bash
docker run -d --name client --network mynet alpine sleep 3600
```

```bash
docker ps
```

Output:

```
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS     NAMES
3d91c9889ca0   alpine         "sleep 3600"             12 seconds ago   Up 12 seconds             client
10edbd804b76   nginx:alpine   "/docker-entrypoint.…"   13 minutes ago   Up 13 minutes   80/tcp    web
```

No port is published (`-p`): containers on the same network reach each other directly.

## 3. Reach `web` from `client` by name

```bash
docker exec client ping -c 3 web
```

Output:

```
PING web (172.18.0.2): 56 data bytes
64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.166 ms
64 bytes from 172.18.0.2: seq=1 ttl=64 time=0.112 ms
64 bytes from 172.18.0.2: seq=2 ttl=64 time=0.088 ms

--- web ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.088/0.122/0.166 ms
```

The name `web` was resolved to `172.18.0.2` by Docker's DNS. No IP address was typed.

```bash
docker exec client wget -qO- http://web
```

Output (truncated):

```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
<h1>Welcome to nginx!</h1>
...
```

The HTTP request also works using only the container name.

## 4. Check which containers are on the network

```bash
docker network inspect mynet --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\n"}}{{end}}'
```

Output:

```
web 172.18.0.2/16
client 172.18.0.3/16
```

Both containers are attached to `mynet`, and `web` has the IP that `ping` resolved.

## 5. Counter-proof: the default bridge has no DNS by name

```bash
docker run -d --name web-default nginx:alpine
```

Output:

```
bac0927420c5751d918bcf8ce10d7d426852d8c1e1852aa38b7eb96fe3e830bc
```

```bash
docker run --rm alpine ping -c 2 web-default
```

Output:

```
ping: bad address 'web-default'
```

Without `--network`, the containers are on the default bridge, where names are **not** resolved. This is why a custom network is needed.

## Default bridge vs user-defined bridge

|                                  | Default `bridge`        | User-defined bridge (`mynet`)   |
| -------------------------------- | ----------------------- | ------------------------------- |
| DNS resolution by container name | No                      | Yes                             |
| Connected by default             | Yes                     | No (`--network` required)       |
| Isolation                        | All containers share it | Only containers on that network |

## Conclusion

A user-defined bridge network gives containers an internal DNS: they find each other by name, so no hardcoded IP is needed (IPs can change at each restart).
