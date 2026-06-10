# Spread Trust — App Ontology

> Repo: [intuition-box/spread-trust](https://github.com/intuition-box/spread-trust) · Status: active app

Burner-wallet PWA for conference onboarding: the app generates a throwaway wallet in the browser, you fund it with TRUST, then scan attendees' wallet QR codes to send them gas on the spot.

## Evidence

- `README.md` — auto-generated burner wallet stored in the browser, QR scan → TRUST transfer on Intuition chain 1155, auto-send mode
- `package.json` — viem + jsQR/BarcodeDetector; the source contains **no atom or triple creation** — the app only does native transfers

## Atom types

| Type | Origin | Why |
|---|---|---|
| `Person` | shared | the operator and the recipients |
| `EthereumAccount` | shared | burner wallet and scanned recipient addresses |
| `SoftwareApplication` | shared | the PWA itself |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `controlledBy` | EthereumAccount → Person | the burner key lives in the operator's browser — control, not durable ownership |
| `uses` | Person → SoftwareApplication… | operators running the app |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| EthereumAccount | controlledBy | Person | Burner wallet controlledBy booth operator |
| Person | uses | SoftwareApplication | Booth operator uses Spread Trust |

## Onchain publication

- App atom: `Spread Trust` (create)
- Rules: `(Ethereum Account, controlled by, Person)` — shared with Intuition Graph — and `(Person, uses, Software App)`
- New predicate atom: `controlled by` (shared creation, also used by Graph)

## Notes

This is deliberately the smallest ontology in the set. Spread Trust writes nothing to the knowledge graph — defining a rich schema for it would be invention, not documentation. Its two rules cover the only durable facts the app embodies. If the team later mints "onboarded by" attestations (a natural extension: each scan is an onboarding event), that predicate should be added here first.
