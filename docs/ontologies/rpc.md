# Intuition RPC — App Ontology

> Repo: [intuition-box/RPC](https://github.com/intuition-box/RPC) · Status: infra

One-click deployable Intuition L3 replica node (Arbitrum Nitro settling to Base) with an nginx gateway, status dashboard, snapshot bootstrap, and optional API-key protection. This repo is also the org's realization of the missing `l3-node` entry from the mission table.

## Evidence

- `README.md` — three-service architecture (nitro node, gateway, dashboard); `BASE_RPC_URL` required ("A self-hosted RPC node for the Intuition L3 (Arbitrum Nitro on Base)")
- `docker-compose.yaml`, `nitro/Dockerfile`, `gateway/nginx.conf`, `gateway/rpc-keys.sh`
- `local-rpc.md` — single-container personal RPC at `localhost:8545`
- `docs/` — node lifecycle: downloading, extracting, scanning, syncing, synced

## Atom types

| Type | Origin | Why |
|---|---|---|
| `Service` | shared | the RPC endpoint a deployment exposes |
| `SoftwareApplication` | shared | the node software stack |
| `Person` | shared | individual node operators |
| `Organization` | shared | teams running shared endpoints |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `hostedBy` (ext.) | WebSite/WebPage/Service → Person/Org | self-hosted endpoints — the repo's whole point |
| `provides` (new) | Person/Org/software → Service/Skill/Product | operators offering their endpoint to others |
| `dependsOn` (ext.) | software → software/Service | the replica node requires a Base RPC upstream |
| `uses` | Person → Service… | developers consuming an endpoint |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| Service | hostedBy | Person | rpc.example.com hostedBy node operator |
| Service | hostedBy | Organization | rpc.intuition.systems hostedBy Intuition |
| Person | provides | Service | Node operator provides Intuition RPC endpoint |
| SoftwareApplication | dependsOn | Service | Intuition RPC node dependsOn Base RPC |
| Person | uses | Service | Developer uses Intuition RPC endpoint |

## Onchain publication

- App atom: `Intuition RPC` (create; the bare label "RPC" is too generic for an identity atom)
- Reused atoms: `provides`, `uses`, `Service`-related rules share the new `depends on` atom with the MCP monorepo
- New predicate atoms: `hosted by`, `depends on`

## Notes

A natural follow-up for the team: publish each live endpoint as a `Service` atom (url = endpoint) with `hostedBy` claims, giving the ecosystem a stakeable registry of community RPC endpoints — trust signals on infrastructure.
