# Decentralized multiplayer architecture

The default multiplayer path uses **Trystero 0.25.3**. The browser dynamically imports the pinned package when the user explicitly joins a P2P room. Nostr is the default discovery strategy; MQTT, BitTorrent and IPFS can be selected.

Trystero uses the selected strategy to exchange WebRTC session information and discover peers. Application state is exchanged through Trystero actions over WebRTC. The OS defines actions for entity events, presence and state snapshots.

## Privacy boundary

A room name is not an authentication system. For non-public rooms, use a hard-to-guess name and optional shared password distributed out-of-band. Peer presence is not verified organizational identity. Do not put secrets into room metadata.

## NAT/TURN boundary

Direct WebRTC cannot connect every pair of networks. Restrictive NAT/firewall combinations may require TURN. TURN relays WebRTC packets but the WebRTC transport remains encrypted. Operators must provision and secure their own TURN service; the bundle contains no credentials.

## Offline behavior

Previously loaded app assets and local IndexedDB tools work offline. Decentralized discovery and new remote peers require network access. Third-party Trystero modules are loaded on demand and are therefore not claimed to be available on a first-ever offline launch. For a fully controlled deployment, vendor audited dependency builds under the same origin.
