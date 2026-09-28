# Security & Privacy Notes

## Client

- User-supplied strings are HTML-escaped before rendering in the main application.
- Imported backups require the expected application schema.
- No application secrets are embedded.
- External links use `noopener`.
- Precise geolocation is not requested.
- IndexedDB is the default for user records.
- Collaboration and WebLLM connections are user-triggered.

## Server

The reference server includes:

- path traversal checks for static serving;
- WebSocket message-size limit;
- allowed collaboration entity types;
- room-name sanitization;
- event-ID de-duplication;
- optional shared room-server secret;
- bounded recent event history;
- a basic Content Security Policy on HTML responses.

It does **not** provide production-grade authentication, identity proofing, role authorization, encryption at rest, regulated-record handling or multi-tenant isolation. Add those controls before using it for sensitive institutional work.

## Sensitive information

Do not place protected health information, student education records, credentials, exact vulnerable-household locations or similarly sensitive records into public/shared rooms. Store only the minimum planning data required for the task.

## CSP and WebLLM

The bundled Node server permits the WebLLM runtime and known model-host classes required by the current integration. Revalidate the CSP whenever the WebLLM distribution/model hosting changes; tightening the allowlist is preferable to broadly allowing arbitrary remote scripts.
