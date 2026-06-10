# Fee Proxy Template — App Ontology

> Repo: [intuition-box/Fee-Proxy-Template](https://github.com/intuition-box/Fee-Proxy-Template) · Status: infra

Customizable proxy contract that sits in front of the MultiVault and collects a fixed + percentage fee on deposits and create operations before forwarding the remaining value. Deployers configure fees, a fee recipient, and an admin whitelist.

## Evidence

- `README.md` — fee structure (0.1 TRUST fixed + 5% default) applied to `deposit`, `createAtoms`, `createTriples`, `depositBatch`; `FEE_RECIPIENT` and admin env config; "Full MultiVault compatibility: all view functions pass through"
- The deployed instance of this template is the Sofia Fee Proxy (`0x26F81d723Ad1648194FAA4b7E235105Fd1212c6c` on mainnet, per the dashboard repo)

## Atom types

| Type | Origin | Why |
|---|---|---|
| `EthereumSmartContract` | shared | the proxy and the MultiVault it fronts |
| `EthereumAccount` | shared | fee recipient and admin accounts |
| `Organization` | shared | the team operating a deployment |
| `Person` | shared | individual deployers/admins |
| `Thing` | shared | deployment target in the generic rule |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `proxies` (new) | EthereumSmartContract → EthereumSmartContract | the template's entire purpose: forward calls to the MultiVault with fees |
| `ownedBy` | contracts/accounts → Person/Org | who a deployment and its fee recipient belong to |
| `deployedOn` | contracts → Thing | which network an instance lives on |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| EthereumSmartContract | proxies | EthereumSmartContract | Sofia Fee Proxy proxies MultiVault |
| EthereumSmartContract | ownedBy | Organization | Sofia Fee Proxy ownedBy Sofia |
| EthereumAccount | ownedBy | Organization | Fee recipient ownedBy Sofia |
| EthereumSmartContract | deployedOn | Thing | Sofia Fee Proxy deployedOn Intuition |

## Onchain publication

- App atom: `Intuition Fee Proxy` (create)
- Reused atoms: `owns` (rules published in active voice: `(Organization, owns, Smart Contract)` / `(Organization, owns, Ethereum Account)`), `deployed on`, and the canonical `Intuition` entity as the deployment target object
- New type atoms: `Smart Contract`, `Ethereum Account` (none existed with these labels)
- New predicate atom: `proxies`
- Rules are shared with the Sofia Fee Proxy Dashboard, which observes the same deployment

## Notes

Fee amounts, percentages, and per-operation fee tables are contract configuration, not ontology — they change per deployment and are readable onchain. Claims about a *specific* deployment (e.g. its fee recipient) instantiate the rules above with concrete CAIP-10 address atoms.
