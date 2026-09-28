# Texas Connectivity & Opportunity OS v3 — Trystero/WebRTC edition

**Primary multiplayer architecture:** Trystero 0.25.3 for decentralized peer discovery/signaling and direct WebRTC browser-to-browser room traffic. The app does not require the bundled legacy WebSocket server for normal multiplayer. `BroadcastChannel` remains a zero-network same-device mode.

## What changed in v3

- animated, skippable, reduced-motion-aware splash screen
- simplified advanced guides with plain-language, advanced and expert layers
- accessible keyboard/focus tooltips for technical concepts
- Trystero discovery strategies: Nostr (default), MQTT, BitTorrent and IPFS
- WebRTC P2P event/state exchange for projects, tasks, decisions and notes
- optional shared room password supported by Trystero
- peer snapshot exchange when participants join
- current local IndexedDB/PWA/WebLLM architecture retained
- explicit TURN reliability boundary documented

A public-ready reference implementation for measuring connectivity barriers, planning digital-opportunity interventions, coordinating multidisciplinary teams and linking broadband to education, health, workforce, small business, libraries, emergency communications and critical infrastructure.

**Systems architecture/concept:** Ricky Foster + Navi · Planetary Restoration Archive.

## What changed from the standalone edition

The original single-file implementation is retained as `standalone.html`. The v2 suite adds:

- modular app shell driven by one route registry;
- current Texas/federal source registry with dates, jurisdictions, evidence classes and limitations;
- BEAD, BOOT, TAP, pole-replacement, broadband-workforce, E-Rate, RHC, Census, TSLAC, DIR, TDEM and small-business reference material;
- cross-domain dependency graph for education, health, workforce, business, emergency management, energy, water, mobility, agriculture, libraries and public services;
- functional local collaboration across tabs/windows using `BroadcastChannel`;
- optional multi-device WebSocket rooms with a bundled Node server;
- shared tasks, decisions, comments, projects, presence and event replay;
- IndexedDB outbox and local-first records;
- cross-domain project studio, scenario lab, diagnostics, affordability, device inventory and infrastructure planning tools;
- optional WebLLM dedicated-worker integration with graceful fallback;
- installable PWA, versioned service worker and offline app-shell/data caching;
- searchable preservation of all 111 original requirement sections;
- validated JSON backups, CSV speed-log export and explicit reset;
- high-contrast, reduced-motion, scalable text, keyboard navigation and print support.

## Quick start

### Option A — app/PWA without hosted multiplayer

Serve the directory over HTTP:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/`.

Local collaboration works across tabs/windows in the same browser profile. PWA/service-worker behavior works on `localhost` and HTTPS, not `file://`.

### Option B — full hosted multiplayer

```bash
cd server
npm install
npm start
```

Open `http://localhost:8787/`.

The application will default to `ws://localhost:8787/ws` when you open **Multiplayer Commons**. For production, serve the app behind HTTPS and use `wss://`.

`npm install` is a real prerequisite. The ZIP does not copy the `ws` library into the project.

### Option C — direct file fallback

Open `standalone.html` directly. This preserves the prior single-file/local tools, but **does not claim** service-worker/PWA or hosted multiplayer behavior under `file://`.

## Multiplayer architecture

### Local Commons

`BroadcastChannel` synchronizes task/project/decision/comment events between same-origin tabs. This is useful for demonstrations and local multi-role workflows without a server. It is not cross-device networking.

### Hosted Rooms

`server/server.js` provides:

- static file hosting;
- `/healthz` status endpoint;
- WebSocket endpoint at `/ws`;
- room join and presence;
- event snapshots for joining members;
- shared project/task/decision/comment/evidence/activity events;
- event-ID de-duplication;
- bounded in-memory room history;
- optional JSONL persistence in `server/data/`;
- optional `ROOM_SECRET` gate.

Client records use `modifiedAt + clientId` deterministic last-write-wins reconciliation. This is intentionally simple and auditable. For large institutional deployments, replace the demo persistence layer with authenticated accounts, authorization, durable database storage, backups, audit retention and stronger conflict semantics/CRDTs where necessary.

## Cross-domain collaboration model

A project can explicitly tag/connect:

- Education & Learning
- Health & Telehealth
- Workforce & Remote Work
- Small Business & Entrepreneurship
- Emergency Communications
- Energy & Grid
- Water Systems
- Mobility & Transportation
- Agriculture & Rural Economy
- Libraries & Community Hubs
- Public Services & Civic Access

Each domain defines stakeholders, shared metrics and handoffs. Example: `grid outage → network power → telehealth/work/school disruption → backup link/public hub/offline procedure`.

## WebLLM

The suite uses WebLLM only after an explicit user action:

- runtime: `@mlc-ai/web-llm` v0.2.85 via `https://esm.run/`;
- inference runs in a dedicated Web Worker;
- WebGPU is required;
- the model list is read from WebLLM's runtime configuration instead of hard-coding a model name;
- no model weights are bundled;
- first model load can be large and requires internet access;
- WebLLM/IndexedDB manages model caching;
- the application service worker deliberately does **not** intercept/cache third-party model artifacts;
- if WebLLM cannot run, the Project Assistant offers a deterministic, non-AI planning fallback.

Do not treat local model output as verified coverage, program eligibility, engineering design or legal advice. The assistant prompt is explicitly instructed not to invent grants, deadlines, provider performance or causal outcomes.

## PWA and offline behavior

The service worker precaches only the application shell, local JavaScript, CSS and curated JSON datasets. Third-party official links, hosted WebSocket rooms and first-time WebLLM downloads remain online-only.

Offline-ready records include projects, tasks, decisions, comments, devices, speed observations, outage observations, scenarios and saved local state. Cached Texas source metadata may become stale; each record displays its source date/freshness context.

## Evidence discipline

Evidence classes:

- **A** — official measured/administrative data
- **B** — peer-reviewed evidence
- **C** — institutional analysis/guidance
- **D** — preliminary/incomplete evidence
- **E** — modeled scenario
- **F** — conceptual proposal

The app distinguishes provider-reported availability from measured performance, reliability observations, household adoption and affordability.

Curated source metadata is in `data/texas-current.json`. It is a starting registry, not an automatically live API. Follow the official link before making a deadline-, eligibility- or status-sensitive decision.

## Privacy and data sovereignty

- No analytics or hidden telemetry are embedded.
- IndexedDB is the default storage for structured records.
- localStorage stores small preferences/identity labels.
- Hosted collaboration is opt-in.
- Precise household location is never collected automatically.
- JSON backup/export is explicit.
- Cross-device sync is not implied when no server is connected.
- Collaboration rooms should not be used for secrets, protected health information, student records or other regulated/sensitive data without an appropriately secured institutional deployment.

## Directory map

```text
index.html                     modular app shell
standalone.html                prior single-file fallback
manifest.webmanifest           PWA metadata
sw.js                          versioned app-shell/data cache
offline.html                   network fallback
assets/css/app.css             responsive/accessibility/print UI
assets/js/app.js               route registry + tools/views
assets/js/db.js                IndexedDB/data portability
assets/js/collab.js            BroadcastChannel/WebSocket sync
assets/js/ai.js                WebLLM capability + fallback
assets/js/webllm-worker.js     dedicated WebLLM worker
icons/icon.svg                 installable icon
data/texas-current.json        sourced Texas/federal facts/programs
data/cross-domain.json         multidisciplinary dependency registry
data/requirements.json         all 111 source requirements
server/server.js               static + WebSocket room server
server/package.json            `ws` dependency
docs/                          deployment/security/API/testing notes
integrity/SHA256SUMS.txt       generated release hashes
```

## Zero-Harm / Anti-Inversion

The system exists to improve access, opportunity, education, health, resilience and digital autonomy. Do not use it to expose household locations, build covert surveillance, exploit digital-exclusion data, manipulate vulnerable users, bypass device protections, conceal uncertainty or portray a modeled scenario as verified reality.

## Integrity

`integrity/SHA256SUMS.txt` hashes release files. SHA-256 verifies byte integrity against a known expected hash; it does not establish authorship on its own.

See `docs/TESTING.md` for what was and was not tested in the build environment.
