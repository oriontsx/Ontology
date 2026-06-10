# AgentID — App Ontology

> Repo: [intuition-box/agentId](https://github.com/intuition-box/agentId) · Status: active app

Decentralized trust registry ("Yellow Pages") for AI agents. Agents register identity atoms, declare capabilities via triples, and accrue stake-weighted reputation through FOR/AGAINST vault deposits — all on plain MultiVault primitives, no custom contracts.

## Evidence

- `packages/schema/src/predicates.ts` — the app's canonical predicate labels: `has-capability`, `operated-by`, `endorses`, `reports-issue`
- `packages/schema/src/capability.ts` — capability schema with a 10-value category enum (data-processing, code-generation, …)
- `README.md` — the concept table (Agent Identity = Atom, Capability = Atom, Agent has Capability = Triple, stake = vault deposits) and the 6-component trust score
- `packages/sdk/src/create-capability-triple.ts`, `create-agent-atom.ts`, `stake.ts`

## Atom types

| Type | Origin | Why |
|---|---|---|
| `AIAgent` | shared | the registered agent identity |
| `Skill` | **new** | AgentID's "Capability" concept, unified with AgentScore's skill vocabulary |
| `Person` | shared | operators, endorsers, evaluators |
| `Organization` | shared | operators can be orgs |
| `EthereumAccount` | shared | operator/staker accounts |
| `DefinedTerm` | shared | report concern categories (Scam, Spam, …) |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `hasSkill` (new) | Person/AIAgent → Skill | app predicate `has-capability`; published onchain as the existing `has agent skill` atom (PR #15) |
| `operatedBy` (new) | AIAgent → Person/Org/EthereumAccount | app predicate `operated-by`; operator commitment is 15% of the trust score |
| `endorses` (ext.) | Person → … + AIAgent | app predicate `endorses` ("User endorses an agent") |
| `reportedFor` (new) | identities/software/accounts → DefinedTerm | app predicate `reports-issue`, unified with AgentScore's `reported for` |
| `trusts` (ext.) | + AIAgent subjects/objects | staking on an agent's FOR vault is a trust signal |
| `evaluatedBy` (new) | AIAgent/software → AIAgent/Person/Org | assessment relation already onchain (`evaluated by`, PR #15) |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| AIAgent | hasSkill | Skill | AliceBot hasSkill Code Generation |
| AIAgent | operatedBy | Person | AliceBot operatedBy Alice |
| AIAgent | operatedBy | Organization | SupportBot operatedBy Acme DAO |
| Person | endorses | AIAgent | Alice endorses AliceBot |
| AIAgent | reportedFor | DefinedTerm | SpamBot reportedFor Spam |
| Person | trusts | AIAgent | Alice trusts AliceBot |
| AIAgent | evaluatedBy | Person | AliceBot evaluatedBy Bob |

## Onchain publication

- App atom: `AgentID` (create)
- Reused atoms: `AI Agent`, `Skill` type atoms (both already on mainnet), `has agent skill`, `endorses`, `reported for`, `evaluated by`, `trusts`
- New predicate atom: `operated by`
- Distrust is expressed by staking on counter-triples (AGAINST vaults), not by a separate predicate — so no `opposes` rule is published for this app even though the schema supports it

## Notes

- The app's own SDK currently writes dash-form labels (`has-capability`, `operated-by`) on **testnet** (chain 13579, per its README). This ontology canonicalizes the concepts on mainnet with the existing space-form atoms; a follow-up for the AgentID team is to point the SDK at the canonical atoms when it ships to mainnet.
- Capability categories from `capability.ts` map to `Skill.category` enrichment, and each category can itself be published as a `DefinedTerm` if the team wants category-level claims.
