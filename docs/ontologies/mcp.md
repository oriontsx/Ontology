# Intuition Box MCP — App Ontology

> Repo: [intuition-box/mcp](https://github.com/intuition-box/mcp) · Status: active app · Live: [mcp.intuition.box](https://mcp.intuition.box)

Model Context Protocol monorepo: two MCP servers — `mcp-general` (8 knowledge-graph tools: accounts, followers, relations, atoms, lists) and `mcp-trust` (7 trust-scoring tools: EigenTrust, AgentRank, sybil detection, composite scores) — plus an interactive playground for exploring them. The closest live successor to the mission table's missing `mcp-inspector` entry.

## Evidence

- `README.md` — monorepo layout, tool counts per server, playground at mcp.intuition.box, Claude Desktop integration config
- `packages/mcp-general/`, `packages/mcp-trust/` — tool implementations querying the Intuition indexer
- `apps/playground/` — Next.js MCP directory and per-server playgrounds

## Atom types

| Type | Origin | Why |
|---|---|---|
| `SoftwareApplication` | shared | the MCP servers and the playground |
| `Skill` | **new** | each MCP tool is a capability offered to agents |
| `AIAgent` | shared | the consumers (Claude, ChatGPT, autonomous agents) |
| `Service` | shared | the indexer/GraphQL backend the servers depend on |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `provides` (new) | software/Person/Org → Skill/Service/Product | servers expose tools: mcp-trust provides trust scoring |
| `uses` (ext.) | + AIAgent subjects | agents wiring the servers into their config |
| `dependsOn` (ext.) | software → software/Service | servers query the Intuition GraphQL indexer |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| SoftwareApplication | provides | Skill | mcp-trust provides Trust Scoring |
| AIAgent | uses | SoftwareApplication | Claude uses mcp-general |
| SoftwareApplication | dependsOn | Service | mcp-general dependsOn Intuition GraphQL indexer |

## Onchain publication

- App atom: `Intuition Box MCP` (create). Reuse was deliberately rejected: the existing mainnet atom labeled "Intuition MCP" (`0x71f050d6…f1c7`) points at `intuitionmcp.xyz` — a different product — and the `mcp.intuition.box`-URL atoms onchain are Sofia page captures, not app identities
- Reused atoms: `provides`, `uses`, `Skill`, `AI Agent`
- Shares the `(Software App, depends on, Service)` rule with Intuition RPC

## Notes

Each individual MCP tool (e.g. `get-followers`, `eigentrust-score`) can be published as a `Skill` atom with a `(server, provides, tool)` claim, turning the playground's directory into an onchain, stakeable tool registry — the natural next step once the team wants per-tool reputations.
