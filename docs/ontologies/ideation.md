# Intuition Ideation Skill — App Ontology

> Repo: [intuition-box/intuition-ideation-skill](https://github.com/intuition-box/intuition-ideation-skill) · Status: tooling

Claude Code skill that walks contributors through a 5-step workflow: describe & search the knowledge graph for similar concepts, draft against a structured template, challenge the idea, publish a PR to [intuition-box/ideas](https://github.com/intuition-box/ideas), and finally mint the idea onchain as an atom + claim.

## Evidence

- `README.md` — the 5-step workflow; step 5 is "Publish on Intuition: create an on-chain atom and claim via the Intuition Protocol"
- `references/idea-template.md` — the structured fields every idea carries
- `references/github-submission-format.md` — PR format for the ideas repo
- `SKILL.md` — bootstraps on the official Intuition protocol skill for graph search and onchain writes

## Atom types

| Type | Origin | Why |
|---|---|---|
| `Idea` | **new** | the entity this tool exists to produce |
| `Person` | shared | idea authors |
| `DefinedTerm` | shared | topics and tags ideas are filed under |
| `SoftwareApplication` / `SoftwareSourceCode` | shared | apps that later implement an idea |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `authoredBy` (ext.) | creative works + Idea → Person | attribution of the published idea |
| `about` (ext.) | works + Idea → topics | what the idea addresses |
| `taggedWith` (ext.) | + Idea subjects | template tags |
| `implements` (ext.) | software → DefinedTerm + Idea | the idea→app lineage, closing the loop from ideation to shipped ecosystem apps |
| `relatedTo` (ext.) | + Idea | step 1's "search for similar concepts" — similarity links between ideas |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| Idea | authoredBy | Person | Onchain Reputation Passport authoredBy Alice |
| Idea | about | DefinedTerm | Onchain Reputation Passport about Reputation |
| Idea | taggedWith | DefinedTerm | Onchain Reputation Passport taggedWith Identity |
| SoftwareApplication | implements | Idea | AgentID implements Onchain Reputation Passport |
| Idea | relatedTo | Idea | Reputation Passport relatedTo Trust Graph Explorer |

## Onchain publication

- App atom: `Intuition Ideation Skill` (create)
- Reused atoms: `authored` (rule published in active voice: `(Person, authored, Idea)`), `has tag`, `related to` (also standing in for `about` at the rule level)
- New type atom: `Idea`; new predicate atom: `implements`

## Notes

The skill itself decides per-idea what to mint; these rules give those mints a stable shape. Staking on `(App, implements, Idea)` claims would let the community signal which shipped apps genuinely realize which proposals — useful input for mission rewards.
