# Deployment

## Static/PWA hosting

Any HTTPS static host can serve the client-only application. The app can be hosted without the room server; use Local Commons for same-browser collaboration.

Requirements:

- correct MIME types for ES modules, JSON, webmanifest and SVG;
- HTTPS for production PWA/service worker and WebGPU expectations;
- `index.html` and `sw.js` under the same application scope;
- do not rewrite `sw.js` to an HTML fallback;
- preserve relative paths.

## Full room server

`server/server.js` serves both the static parent directory and `/ws`.

```bash
cd server
npm install
PORT=8787 HOST=0.0.0.0 npm start
```

Optional environment settings:

- `ROOM_SECRET` — if non-empty, the WebSocket URL must include `?key=...`.
- `PERSIST_ROOMS=false` — disables JSONL event persistence.

For internet deployment, terminate TLS at a reverse proxy/load balancer and proxy WebSocket upgrades to the Node process. Use `wss://` from an HTTPS page to avoid mixed-content blocking.

## Persistence and scaling

The bundled server is deliberately compact. It stores a bounded recent event history in memory and, by default, appends JSONL files under `server/data/`.

Before institutional scale, add:

- authenticated user identities;
- per-room authorization/RBAC;
- durable database storage;
- backups/retention policy;
- rate limiting and abuse controls;
- structured audit logging without collecting unnecessary personal data;
- horizontal room coordination (Redis/NATS/etc.) if multiple server instances are used;
- TLS, secret management and security monitoring;
- privacy/legal review for regulated records.

## Service worker update flow

Increment `VERSION` in `sw.js` when changing shell files. Old caches are deleted on activation. The current service worker deliberately caches only same-origin application resources and does not intercept WebLLM model downloads or external government websites.
