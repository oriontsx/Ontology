# Atlas — App Ontology

> Repo: [intuition-box/Atlas](https://github.com/intuition-box/Atlas) · Status: active app · Formerly named `orbyt`

Community directory and engagement platform: people sign to join communities, get reviewed by admins, hold roles, attest to each other, and appear as orbiting members ranked by Reach/Love/Gravity scores. Atlas is the org's realization of the "community directory" concept from the original mission table.

## Evidence

- `README.md` — "A community directory where people sign to join communities…"; membership statuses (PENDING/APPROVED/REJECTED/BANNED); ranked roles OWNER/ADMIN/MODERATOR/MEMBER; "facts/attestations as first-class actions"
- `docs/orbit/scoring.md` + `src/lib/scoring.ts` — Reach/Love/Gravity computed from attestations given/received
- `prisma/schema.prisma` — community, membership, friendship, attestation, quest models
- GitHub redirect `intuition-box/orbyt` → `intuition-box/Atlas` confirms the rename

## Atom types

| Type | Origin | Why |
|---|---|---|
| `Person` | shared | members |
| `Community` | **new** | the entity people join — looser than a formal Organization |
| `Organization` | shared | teams using Atlas formally |
| `DefinedTerm` | shared | roles (Owner, Admin, Moderator, Member) and orbit levels |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `memberOf` (ext.) | Person → Org/Community/MusicGroup | approved membership |
| `founderOf` (ext.) | Person → Org/Community | community creation/ownership |
| `hasRole` (new) | Person/AIAgent → DefinedTerm | the ranked role system |
| `endorses` | Person → Person… | attestations between members ("Reach increases with attestations received") |
| `knows` | Person → Person | the friendship model |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| Person | memberOf | Community | Alice memberOf Intuition Builders |
| Person | founderOf | Community | Billy founderOf Intuition Builders |
| Person | hasRole | DefinedTerm | Alice hasRole Moderator |
| Person | endorses | Person | Alice endorses Bob |
| Person | knows | Person | Alice knows Bob |

## Onchain publication

- App atom: `Atlas` (create). Two unrelated "Atlas" atoms exist on mainnet (one is the Atlas smart-contract IDE); the app atom is disambiguated by its pinned description and repo URL — the dry run flags the label collision explicitly
- Reused atoms: `Community` type atom, `is member of`, `endorses`, `created` (active-voice stand-in for `founderOf`), `is connected to` (stand-in for `knows`)
- New predicate atom: `has role`

## Notes

- Orbit level, Reach, Love, and Gravity are derived metrics computed off attestation claims — they are outputs of the ontology, not predicates in it.
- Role claims are community-scoped in the app (`Alice hasRole Moderator` *in* `Intuition Builders`). A flat triple drops that context; when the team needs it onchain, nest the role triple as the subject of a `(roleTriple, belongs to, Community)` claim — MultiVault V2 supports triple terms in any position.
