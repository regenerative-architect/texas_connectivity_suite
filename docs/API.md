# Collaboration Protocol

WebSocket endpoint: `/ws`

## Join

```json
{"type":"join","room":"texas-commons","member":{"clientId":"...","name":"...","role":"planner","room":"texas-commons"}}
```

Server response:

```json
{"type":"snapshot","room":"texas-commons","events":[],"members":[]}
```

## Presence

```json
{"type":"presence","room":"texas-commons","member":{"clientId":"...","name":"...","role":"library"}}
```

Presence is ephemeral and not intended as an authoritative identity system.

## Durable collaboration event

```json
{
  "type":"event",
  "eventId":"evt-uuid",
  "room":"texas-commons",
  "entityType":"task",
  "payload":{"id":"task-uuid","title":"Verify clinic upload capacity","status":"Doing","modifiedAt":"2026-09-28T00:00:00Z","clientId":"..."},
  "actor":{"clientId":"...","name":"...","role":"health"}
}
```

Allowed `entityType` values in the reference server:

- `task`
- `decision`
- `comment`
- `project`
- `evidence`
- `activity`

The server relays events and keeps a bounded room history. The client reconciles entities with deterministic `modifiedAt`, then `clientId` ordering. This is not a full CRDT.
