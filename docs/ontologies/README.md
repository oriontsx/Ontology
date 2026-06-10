# Ecosystem App Ontologies (Mission 04)

Onchain ontology definitions for the apps in the [intuition-box](https://github.com/intuition-box) GitHub org — for each app: the atom types it uses or introduces, the predicates relevant to it, and its valid subject–predicate–object combinations.

The definitions live in three places, kept consistent by construction:

| Layer | Where | What it gives you |
|---|---|---|
| Schema | [`src/data/atom-types.ts`](../../src/data/atom-types.ts), [`src/data/predicates.ts`](../../src/data/predicates.ts), [`src/data/hierarchy.ts`](../../src/data/hierarchy.ts) | New types and predicates render in the claim builder, type tree, and entity matrix on [ontology.intuition.box](https://ontology.intuition.box) |
| Per-app registry | [`src/data/ecosystem-ontologies.ts`](../../src/data/ecosystem-ontologies.ts) | One typed structure per app: types, predicates, claim patterns, repo evidence. Every claim pattern is validated against `validateClaim`, so app schemas cannot drift from the canonical matrix |
| Onchain | [`scripts/publish-ontology.mjs`](../../scripts/publish-ontology.mjs) + [`src/data/glossary-atoms.ts`](../../src/data/glossary-atoms.ts) | Atoms + triples on Intuition mainnet; pre-existing atoms are reused, never duplicated |

## App inventory

Confirmed against the live org state (2026-06-10, 102 repos). The issue's table of 15 maps to 11 publishable apps:

| # | Issue entry | Verdict |
|---|---|---|
| 1 | Ontology | Active app — [ontology.md](ontology.md) |
| 2 | Atlas (`atlas`) | Active app — [atlas.md](atlas.md). Same repo as #12: GitHub redirects `orbyt` → `Atlas` (the orbit visualization lives on in `docs/orbit/`) |
| 3 | Fee-Proxy-Template | Active infra — [fee-proxy-template.md](fee-proxy-template.md) |
| 4 | Sofia-Fee-Proxy-Dashboard | Active app — [sofia-fee-proxy-dashboard.md](sofia-fee-proxy-dashboard.md) |
| 5 | community-directory | Repo does not exist (404, no rename trace). The concept is covered by Atlas, which describes itself as a community directory |
| 6 | spread-trust | Active app — [spread-trust.md](spread-trust.md) |
| 7 | l3-node | Repo does not exist (404, no rename trace). The concept is covered by RPC (self-hosted L3 replica node) |
| 8 | RPC | Active infra — [rpc.md](rpc.md) |
| 9 | mcp-inspector | Repo does not exist (404). Closest successor: `mcp` (active monorepo with the [mcp.intuition.box](https://mcp.intuition.box) playground) — [mcp.md](mcp.md). The org also holds two stale forks of the upstream server (`MCP-Server`, `intuition-mcp-server`) which need no ontology of their own |
| 10 | 9atunments | Repo does not exist (404, no rename trace, nothing similar in the org). No ontology defined — honesty over invention |
| 11 | agentId | Active app — [agentid.md](agentid.md) |
| 12 | orbyt | Renamed to `Atlas` — see #2 |
| 13 | Intuition-ideation-skill | Active tooling — [ideation.md](ideation.md) |
| 14 | Graph (`graph.intuition.box`) | Active app, repo `Graph` — [graph.md](graph.md) |
| 15 | Values | Active app, repo `Values` — [values.md](values.md) |

The org contains many more repos (Sofia and its satellites, games, archived experiments). They are out of the issue's scope; the shared core below is designed so their ontologies can be added the same way later.

## Shared core

Cross-app consistency comes from every app drawing on one vocabulary instead of minting its own:

- **Identity:** `Person`, `Organization`, `Community` (new), `AIAgent`, `EthereumAccount`
- **Artifacts:** `SoftwareApplication`, `SoftwareSourceCode`, `Service`, `EthereumSmartContract`, `WebSite`
- **Concepts:** `DefinedTerm`, `Skill` (new), `Idea` (new), `Value` (new), `Thing`
- **Trust signals:** `trusts`, `endorses`, `opposes`, `reportedFor`, `evaluatedBy`, `sameAs`
- **Structure:** `memberOf`, `founderOf`, `hasRole`, `hasValue`
- **Capability:** `hasSkill`, `provides`, `uses`, `dependsOn`, `implements`, `hostedBy`
- **Chain:** `ownedBy`, `controlledBy`, `deployedOn`, `proxies`
- **Taxonomy:** `isA`, `relatedTo`, `subConceptOf`, `oppositeOf`, `taggedWith`

New types introduced for the ecosystem: **Skill** (AgentID capabilities, AgentScore attestations, MCP tools), **Community** (Atlas), **Idea** (ideation workflow), **Value** (Values platform). The `skill` category and the agent/skill predicate direction follow the maintainers' earlier prototype on the `feat/skill-agent-entities-and-matrix-sharing` branch, adapted to `main`'s single `AIAgent` type.

New predicates with domain/range rules: `hasSkill`, `provides`, `operatedBy`, `opposes`, `reportedFor`, `evaluatedBy`, `hasValue`, `hasRole`, `proxies`, `sameAs` — plus targeted domain extensions to existing predicates (e.g. `endorses` now accepts `AIAgent` objects per AgentID, `memberOf` accepts `Community` per Atlas).

## Onchain encoding

The publish script turns the registry into MultiVault terms:

1. **App atom** per app — pinned Thing with name, description, repo/live URL
2. **Type atoms** — one per entity type referenced by the rules ("Person", "AI Agent", "Skill", …), labels matching the app's type list so they compose with the proposed matrix-slot scheme from PR #16
3. **Predicate atoms** — existing onchain atoms are reused wherever a verified equivalent exists (see reuse table below); only 7 predicate atoms are genuinely new
4. **Rule triples** — each valid combination becomes `(TypeAtom, PredicateAtom, TypeAtom)`, e.g. `(AI Agent, has agent skill, Skill)`. Shared rules are published once and referenced by every app that uses them
5. **Attribution triples** — `(App, belongs to, Intuition Box)` and `(App, developed by, Intuition Box)` against the existing Intuition Box organization atom
6. **App → rule links** — `(App, uses, RuleTriple)` nested triples bind each app to exactly the rules it relies on, making each app's ontology browsable from its atom

### Reuse map (verified mainnet term_ids)

Where the schema predicate differs from the onchain label, the rule is flipped to active voice or mapped to the closest verified atom rather than minting a near-duplicate:

| Schema predicate | Onchain atom | term_id |
|---|---|---|
| `trusts` | `trusts` | `0x3a73f3b1…3ee9` |
| `follows` | `follows` | `0x87daf17b…1b80` |
| `uses` | `uses` | `0x5c0bde1c…e800` |
| `endorses` | `endorses` | `0x0471b733…f7a7` |
| `memberOf` | `is member of` | `0xe489948c…61d4` |
| `founderOf` | `created` (active voice) | `0xc0778a52…63aa` |
| `knows` | `is connected to` | `0x0fdc2f1d…b97e` |
| `hasSkill` | `has agent skill` | `0x638fd866…7108` |
| `hasValue` | `has value` | `0x36168c95…e460` |
| `advocates` | `supports` | `0x9d431d24…1090` |
| `provides` | `provides` | `0x996e3fb3…2314` |
| `reportedFor` | `reported for` | `0x51f1feba…428d` |
| `evaluatedBy` | `evaluated by` | `0xb769bc51…8226` |
| `sameAs` | `same as` | `0xbeebfb7d…f5f0` |
| `isA` | `is` | `0xdd4320a0…0eb3` |
| `relatedTo` / `about` | `related to` | `0xa1fadfcf…70ec` |
| `subConceptOf` | `belongs to` | `0x3317b232…d4e8` |
| `taggedWith` | `has tag` | `0x7ec36d20…cc1f5` |
| `authoredBy` | `authored` (subject/object flipped) | `0x313db11e…b551` |
| `ownedBy` | `owns` (subject/object flipped) | `0xdd3eb932…b773` |
| `deployedOn` | `deployed on` | `0x957beb2e…7d7b` |
| `oppositeOf` | — schema-only (no verified equivalent yet) | — |

Entity atoms reused: `Intuition Box` (`0xbc35e0e2…b00b`), `Intuition` (`0x8c486fd3…520e`), `AI Agent` (`0x3bc738a1…0557`), `Skill` (`0xba57c5da…610c`), `Community` (`0x9813a2ac…9830`), `Thing` (`0x4e053f57…c2a3`). All of these are registered in the glossary with provenance notes.

### Publishing

```bash
node scripts/publish-ontology.mjs                          # dry run: print the full plan + cost
NETWORK=testnet DRY=0 PRIVATE_KEY=0x… node scripts/publish-ontology.mjs   # testnet preview
DRY=0 PRIVATE_KEY=0x… node scripts/publish-ontology.mjs    # mainnet
```

The script is idempotent: reused atoms are pre-verified term_ids, created atoms pin deterministic IPFS data and are skipped via `isTermCreated` on re-runs, and every triple is existence-checked via `calculateTripleId` before creation.

Dry run against mainnet (2026-06-10): **27 new atoms** (10 app + 10 type + 7 predicate), **28 reused atoms**, **110 triples** (42 rules + 22 attributions + 46 app→rule links), `getAtomCost` = `getTripleCost` = 0.1 TRUST → **≈ 13.7 TRUST total** plus negligible gas.

After a mainnet publish, append the newly created term_ids to `glossary-atoms.ts` so the glossary stays the canonical reuse index.

## Prior art

The reused predicate set builds directly on atoms published by earlier contributors — notably the prediction-resolution and AgentScore primitives from PRs [#7](https://github.com/intuition-box/Ontology/pull/7) and [#15](https://github.com/intuition-box/Ontology/pull/15) — and on the canonical `trusts` / `follows` / `is` / `has tag` atoms already live on mainnet.
