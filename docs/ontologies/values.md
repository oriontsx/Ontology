# Values — App Ontology

> Repo: [intuition-box/Values](https://github.com/intuition-box/Values) · Status: active app

Organization values platform (a configurable fork of the ConsenSys Community Values experiment). Communities propose value atoms and stake for or against `has value` triples; vault vs counter-vault shares rank the values.

## Evidence

- `src/hooks/useGetValuesListing.ts` — lists triples filtered by a fixed `predicate_id` (code comment: `// has value`) and fixed `subject_id` (`// Organization ID`), ranked by `vault.total_shares` (upvotes) vs `counter_vault.total_shares` (downvotes)
- `src/hooks/useCreateAtom.ts` / `useCreateTriple.ts` — proposing a new value mints a value atom and the `(Organization, has value, Value)` triple
- `src/hooks/useDepositTriple.ts` / `useRedeemTriple.ts` — stake voting
- `README.md` — env contract: `NEXT_PUBLIC_PREDICATE_ID`, `NEXT_PUBLIC_SUBJECT_ID`

## Atom types

| Type | Origin | Why |
|---|---|---|
| `Organization` | shared | the configured subject of every claim |
| `Community` | **new** | the framework targets any community, not just formal orgs |
| `Person` | shared | proposers and voters |
| `Value` | **new** | the app's core entity — a principle the org stands for |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `hasValue` (new) | Org/Community → Value | the app's single fixed predicate |
| `advocates` (ext.) | Person/Org → DefinedTerm/Value | individual support for a value |
| `oppositeOf` (ext.) | DefinedTerm/Value → DefinedTerm/Value | value polarity (schema-level) |
| `relatedTo` (ext.) | concepts → concepts | value clustering |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| Organization | hasValue | Value | Intuition Box hasValue Transparency |
| Community | hasValue | Value | Intuition Builders hasValue Openness |
| Person | advocates | Value | Alice advocates Decentralization |
| Value | oppositeOf | Value | Transparency oppositeOf Opacity |
| Value | relatedTo | Value | Decentralization relatedTo Censorship Resistance |

## Onchain publication

- App atom: `Values` (create)
- Reused atoms: `has value` (already on mainnet since 2025-11), `supports` (stand-in for `advocates`), `related to`
- New type atom: `Value`
- `(Value, oppositeOf, Value)` stays schema-only — no verified onchain equivalent and no current app feature requires it

## Notes

- Disagreement with a value is expressed by staking the counter-triple of `(Org, has value, Value)` — the protocol's native mechanism — not by a negation predicate.
- The deployed instance reads numeric term ids through env vars; when the team re-points it at the V2 mainnet (`bytes32` term ids), the canonical `has value` atom above is the drop-in predicate.
