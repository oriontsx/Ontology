# Intuition Graph — App Ontology

> Repo: [intuition-box/Graph](https://github.com/intuition-box/Graph) · Status: active app · Live: [graph.intuition.box](https://graph.intuition.box)

3D force-graph explorer for the live knowledge graph. It renders atoms, triples, and account positions, and its Reality Tunnel filters everything through the staked positions of a chosen account. The app consumes the graph rather than introducing new vocabulary — its ontology is the trust/social layer it visualizes.

## Evidence

- `src/GraphVisualization.js` — renders atoms and triples as nodes/edges from the indexer
- `src/RealityTunnel.js` + `src/realityTunnelConfig.js` — whitelisted accounts whose positions filter the graph
- `src/UserPositionsPanel.js` — a connected account's positions on claims
- `src/api/` — indexer queries for atoms, triples, positions

## Atom types

| Type | Origin | Why |
|---|---|---|
| `Person` | shared | the people behind accounts and claims |
| `Organization` | shared | orgs as trust objects |
| `AIAgent` | shared | agents appear in the graph as first-class identities |
| `EthereumAccount` | shared | accounts hold the positions the Reality Tunnel reads |
| `Thing` | shared | any node in the rendered graph |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `trusts` | Person/Org/AIAgent → identity & artifact types | the dominant claim type rendered (canonical `trusts` atom holds ~91k TRUST market cap) |
| `follows` | Person → Person/Org | Reality Tunnel whitelist relations |
| `controlledBy` | EthereumAccount → Person | binds a position-holding account to its person |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| Person | trusts | Person | Alice trusts Billy |
| Person | trusts | Organization | Alice trusts Intuition Box |
| Person | follows | Person | 0xBilly.eth follows Zet.box |
| EthereumAccount | controlledBy | Person | intuitionbilly.eth controlledBy Billy |

## Onchain publication

- App atom: `Intuition Graph` (create; url graph.intuition.box — the bare label "Graph" was avoided as too generic for an identity atom)
- Rules reuse `trusts` and `follows`; `controlled by` is one of the 7 new predicate atoms (control of keys is distinct from ownership, so it was not collapsed into the existing `owns`)
- Shared rule note: `(Ethereum Account, controlled by, Person)` is shared with spread-trust
