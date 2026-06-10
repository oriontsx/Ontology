# Ontology — App Ontology

> Repo: [intuition-box/Ontology](https://github.com/intuition-box/Ontology) · Status: active app · Live: [ontology.intuition.box](https://ontology.intuition.box)

Schema explorer and claim builder for the Intuition knowledge graph — the home of the type hierarchy, predicate matrix, and onchain atom glossary. Its own domain is the schema itself, so its ontology is the meta layer: how concepts relate, classify, and resolve to identities.

## Evidence

- `src/data/predicates.ts` — the canonical predicate table with subject/object domain rules and `validateClaim`
- `src/data/hierarchy.ts` — the radial type tree
- `src/pages/glossary.tsx` + `src/data/glossary-atoms.ts` — the curated index of live onchain atoms
- `src/pages/entity-matrix.tsx` — the type-pair × predicate matrix

## Atom types

| Type | Origin | Why |
|---|---|---|
| `Thing` | shared | Any entity that gets classified |
| `DefinedTerm` | shared | The concepts/terms the schema is made of |
| `Person` | shared | Identity side of `sameAs` resolution |
| `EthereumAccount` | shared | Onchain side of `sameAs` resolution |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `isA` | Thing, Person, Org, Software… → DefinedTerm | classification claims built in the app |
| `relatedTo` | DefinedTerm/concepts → DefinedTerm/concepts | concept association |
| `subConceptOf` | DefinedTerm → DefinedTerm | concept hierarchy (the radial tree) |
| `oppositeOf` | DefinedTerm → DefinedTerm | antonym pairs |
| `sameAs` (new) | identity types ↔ identity types | identity equivalence — already onchain (`same as`, PR #15) |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| Thing | isA | DefinedTerm | MultiVault isA Smart Contract Standard |
| DefinedTerm | relatedTo | DefinedTerm | Atom relatedTo Triple |
| DefinedTerm | subConceptOf | DefinedTerm | Counter-Triple subConceptOf Triple |
| DefinedTerm | oppositeOf | DefinedTerm | Trust oppositeOf Distrust |
| Person | sameAs | EthereumAccount | Billy sameAs intuitionbilly.eth |

## Onchain publication

- App atom: `Ontology` (create; url ontology.intuition.box)
- Rules: `(Thing, is, Defined Term)`, `(Defined Term, related to, Defined Term)`, `(Defined Term, belongs to, Defined Term)` — `subConceptOf` maps to the existing classification atom `belongs to` — and `(Person, same as, Ethereum Account)`. All four predicate atoms are reused (`is`, `related to`, `belongs to`, `same as`).
- `oppositeOf` stays schema-only: no verified onchain equivalent exists yet and inventing one was not justified by usage.

## Notes

PR #16 proposes a complementary onchain encoding for the matrix (slot triples `(Type, ?, Type)` + `is best usage for` meta-claims). The type atoms published here use the same labels as the app's type list, so both schemes share their type anchors when that PR lands.
