# Sofia Fee Proxy Dashboard — App Ontology

> Repo: [intuition-box/Sofia-Fee-Proxy-Dashboard](https://github.com/intuition-box/Sofia-Fee-Proxy-Dashboard) · Status: active app

Read-only analytics dashboard for the Sofia Fee Proxy on Intuition mainnet — fetches `TransactionForwarded` events directly over RPC (no wallet) and visualizes fee revenue, volume, and unique wallets.

## Evidence

- `README.md` — proxy contract `0x26F81d723Ad1648194FAA4b7E235105Fd1212c6c`, chain 1155; `TransactionForwarded(string operation, address user, uint256 sofiaFee, uint256 multiVaultValue, uint256 totalReceived)`; per-operation fee table
- `src/config.ts` — `SOFIA_PROXY_ADDRESS`, `DEPLOY_BLOCK`, 30s refresh

## Atom types

| Type | Origin | Why |
|---|---|---|
| `SoftwareApplication` | shared | the dashboard itself |
| `EthereumSmartContract` | shared | the proxy and MultiVault it observes |
| `EthereumAccount` | shared | fee recipient, user wallets in events |
| `Organization` | shared | Sofia, the operating team |

## Predicates

| Predicate | Domain → Range | Grounding |
|---|---|---|
| `proxies` (new) | EthereumSmartContract → EthereumSmartContract | the observed relationship between Sofia Fee Proxy and MultiVault |
| `uses` (ext.) | + software subjects, + EthereumSmartContract objects | the dashboard reads the proxy contract |
| `ownedBy` | contracts → Org | deployment attribution |

## Claim patterns

| Subject | Predicate | Object | Example |
|---|---|---|---|
| EthereumSmartContract | proxies | EthereumSmartContract | Sofia Fee Proxy proxies MultiVault |
| SoftwareApplication | uses | EthereumSmartContract | Sofia Fee Proxy Dashboard uses Sofia Fee Proxy |
| EthereumSmartContract | ownedBy | Organization | Sofia Fee Proxy ownedBy Sofia |

## Onchain publication

- App atom: `Sofia Fee Proxy Dashboard` (create)
- Shares the `(Smart Contract, proxies, Smart Contract)` and `(Organization, owns, Smart Contract)` rules with the Fee Proxy Template — one rule set, two apps linking to it
- New rule specific to this app: `(Software App, uses, Smart Contract)`

## Notes

The dashboard makes no writes; its ontology describes what its analytics are *about*. Instantiating the rules with the concrete proxy address (CAIP-10 atom for `0x26F8…2c6c`) would let trust signals accrue on the actual deployment.
