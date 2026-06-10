/**
 * Per-app ontology registry for the intuition-box ecosystem (Mission 04).
 *
 * Each entry grounds an app's schema in what the app actually does — the
 * `evidence` field cites the repo files/features that justify every atom
 * type and predicate. Claim patterns are the app's valid
 * subject–predicate–object combinations; all of them validate against the
 * canonical PREDICATES table (see `validateClaim` in predicates.ts), which
 * keeps the per-app schemas consistent with each other by construction.
 *
 * Onchain publication of these definitions is handled by
 * `scripts/publish-ontology.mjs`, which reuses already-published atoms
 * (see glossary-atoms.ts) and only mints what is missing.
 *
 * Inventory note: of the 15 apps listed in intuition-box/Ontology#9, four
 * repos do not exist in the org (community-directory, l3-node,
 * mcp-inspector, 9atunments) and `orbyt` was renamed to `Atlas` — leaving
 * the 11 apps registered here. Atlas covers the community-directory
 * concept; RPC covers the l3-node concept; `mcp` is the closest successor
 * to mcp-inspector.
 */

/** A valid subject–predicate–object combination an app relies on. */
export interface ClaimPattern {
  subjectTypeId: string;
  predicateId: string;
  objectTypeId: string;
  /** Realistic instance of the pattern, for docs and UI surfaces. */
  example: string;
}

export type AppStatus = 'app' | 'infra' | 'tooling';

export interface AppOntology {
  /** Stable slug, used by docs and the publish script. */
  id: string;
  /** Display name (also the onchain app atom label). */
  name: string;
  /** GitHub repo, org-qualified. */
  repo: string;
  /** Live URL, if deployed. */
  url?: string;
  status: AppStatus;
  description: string;
  /** Repo files/features that ground this ontology. */
  evidence: string[];
  /** Atom type IDs (atom-types.ts) the app uses or introduces. */
  atomTypeIds: string[];
  /** Predicate IDs (predicates.ts) relevant to the app. */
  predicateIds: string[];
  claimPatterns: ClaimPattern[];
}

export const ECOSYSTEM_APPS: AppOntology[] = [
  {
    id: 'ontology',
    name: 'Ontology',
    repo: 'intuition-box/Ontology',
    url: 'https://ontology.intuition.box',
    status: 'app',
    description:
      'Schema explorer and claim builder for the Intuition knowledge graph — the home of the type hierarchy, predicate matrix, and onchain atom glossary.',
    evidence: [
      'src/data/predicates.ts — canonical predicate table with domain/range rules',
      'src/data/hierarchy.ts — radial type tree',
      'src/pages/glossary.tsx — curated onchain atom glossary',
    ],
    atomTypeIds: ['Thing', 'DefinedTerm', 'Person', 'EthereumAccount'],
    predicateIds: ['isA', 'relatedTo', 'subConceptOf', 'oppositeOf', 'sameAs'],
    claimPatterns: [
      { subjectTypeId: 'Thing', predicateId: 'isA', objectTypeId: 'DefinedTerm', example: 'MultiVault isA Smart Contract Standard' },
      { subjectTypeId: 'DefinedTerm', predicateId: 'relatedTo', objectTypeId: 'DefinedTerm', example: 'Atom relatedTo Triple' },
      { subjectTypeId: 'DefinedTerm', predicateId: 'subConceptOf', objectTypeId: 'DefinedTerm', example: 'Counter-Triple subConceptOf Triple' },
      { subjectTypeId: 'DefinedTerm', predicateId: 'oppositeOf', objectTypeId: 'DefinedTerm', example: 'Trust oppositeOf Distrust' },
      { subjectTypeId: 'Person', predicateId: 'sameAs', objectTypeId: 'EthereumAccount', example: 'Billy sameAs intuitionbilly.eth' },
    ],
  },
  {
    id: 'graph',
    name: 'Intuition Graph',
    repo: 'intuition-box/Graph',
    url: 'https://graph.intuition.box',
    status: 'app',
    description:
      '3D force-graph explorer for the live knowledge graph. Renders atoms, triples, and account positions; the Reality Tunnel filters the graph through a chosen account’s staked positions.',
    evidence: [
      'src/GraphVisualization.js — renders atoms/triples as nodes/edges',
      'src/RealityTunnel.js + src/realityTunnelConfig.js — per-account position filtering',
      'src/UserPositionsPanel.js — account positions on claims',
    ],
    atomTypeIds: ['Person', 'Organization', 'AIAgent', 'EthereumAccount', 'Thing'],
    predicateIds: ['trusts', 'follows', 'controlledBy'],
    claimPatterns: [
      { subjectTypeId: 'Person', predicateId: 'trusts', objectTypeId: 'Person', example: 'Alice trusts Billy' },
      { subjectTypeId: 'Person', predicateId: 'trusts', objectTypeId: 'Organization', example: 'Alice trusts Intuition Box' },
      { subjectTypeId: 'Person', predicateId: 'follows', objectTypeId: 'Person', example: '0xBilly.eth follows Zet.box' },
      { subjectTypeId: 'EthereumAccount', predicateId: 'controlledBy', objectTypeId: 'Person', example: 'intuitionbilly.eth controlledBy Billy' },
    ],
  },
  {
    id: 'agentid',
    name: 'AgentID',
    repo: 'intuition-box/agentId',
    status: 'app',
    description:
      'Decentralized trust registry for AI agents — agents register identity atoms, declare capabilities via triples, and accrue stake-weighted reputation through FOR/AGAINST vaults.',
    evidence: [
      'packages/schema/src/predicates.ts — has-capability, operated-by, endorses, reports-issue',
      'packages/schema/src/capability.ts — capability schema + category enum',
      'README.md — Agent/Capability/Triple/Vault mapping table and trust score weights',
    ],
    atomTypeIds: ['AIAgent', 'Skill', 'Person', 'Organization', 'EthereumAccount', 'DefinedTerm'],
    predicateIds: ['hasSkill', 'operatedBy', 'endorses', 'reportedFor', 'trusts', 'evaluatedBy'],
    claimPatterns: [
      { subjectTypeId: 'AIAgent', predicateId: 'hasSkill', objectTypeId: 'Skill', example: 'AliceBot hasSkill Code Generation' },
      { subjectTypeId: 'AIAgent', predicateId: 'operatedBy', objectTypeId: 'Person', example: 'AliceBot operatedBy Alice' },
      { subjectTypeId: 'AIAgent', predicateId: 'operatedBy', objectTypeId: 'Organization', example: 'SupportBot operatedBy Acme DAO' },
      { subjectTypeId: 'Person', predicateId: 'endorses', objectTypeId: 'AIAgent', example: 'Alice endorses AliceBot' },
      { subjectTypeId: 'AIAgent', predicateId: 'reportedFor', objectTypeId: 'DefinedTerm', example: 'SpamBot reportedFor Spam' },
      { subjectTypeId: 'Person', predicateId: 'trusts', objectTypeId: 'AIAgent', example: 'Alice trusts AliceBot' },
      { subjectTypeId: 'AIAgent', predicateId: 'evaluatedBy', objectTypeId: 'Person', example: 'AliceBot evaluatedBy Bob' },
    ],
  },
  {
    id: 'atlas',
    name: 'Atlas',
    repo: 'intuition-box/Atlas',
    status: 'app',
    description:
      'Community directory and engagement platform — people join communities, get reviewed, hold roles, attest to each other, and appear as orbiting members ranked by Reach/Love/Gravity scores. (Repo formerly named orbyt.)',
    evidence: [
      'README.md — membership status, OWNER/ADMIN/MODERATOR/MEMBER roles, attestations as first-class actions',
      'docs/orbit/scoring.md + src/lib/scoring.ts — orbit level from attestation-driven scores',
      'prisma/schema.prisma — community, membership, friendship, attestation models',
    ],
    atomTypeIds: ['Person', 'Community', 'Organization', 'DefinedTerm'],
    predicateIds: ['memberOf', 'founderOf', 'hasRole', 'endorses', 'knows'],
    claimPatterns: [
      { subjectTypeId: 'Person', predicateId: 'memberOf', objectTypeId: 'Community', example: 'Alice memberOf Intuition Builders' },
      { subjectTypeId: 'Person', predicateId: 'founderOf', objectTypeId: 'Community', example: 'Billy founderOf Intuition Builders' },
      { subjectTypeId: 'Person', predicateId: 'hasRole', objectTypeId: 'DefinedTerm', example: 'Alice hasRole Moderator' },
      { subjectTypeId: 'Person', predicateId: 'endorses', objectTypeId: 'Person', example: 'Alice endorses Bob' },
      { subjectTypeId: 'Person', predicateId: 'knows', objectTypeId: 'Person', example: 'Alice knows Bob' },
    ],
  },
  {
    id: 'values',
    name: 'Values',
    repo: 'intuition-box/Values',
    status: 'app',
    description:
      'Organization values platform — communities propose value atoms and stake for or against `has value` triples; vault vs counter-vault shares rank the values.',
    evidence: [
      'src/hooks/useGetValuesListing.ts — triples filtered by fixed predicate_id ("has value") and subject_id (the organization)',
      'src/hooks/useCreateTriple.ts + useDepositTriple.ts — value proposal and stake voting',
      'README.md — fork of the ConsenSys Community Values experiment, configurable per organization',
    ],
    atomTypeIds: ['Organization', 'Community', 'Person', 'Value'],
    predicateIds: ['hasValue', 'advocates', 'oppositeOf', 'relatedTo'],
    claimPatterns: [
      { subjectTypeId: 'Organization', predicateId: 'hasValue', objectTypeId: 'Value', example: 'Intuition Box hasValue Transparency' },
      { subjectTypeId: 'Community', predicateId: 'hasValue', objectTypeId: 'Value', example: 'Intuition Builders hasValue Openness' },
      { subjectTypeId: 'Person', predicateId: 'advocates', objectTypeId: 'Value', example: 'Alice advocates Decentralization' },
      { subjectTypeId: 'Value', predicateId: 'oppositeOf', objectTypeId: 'Value', example: 'Transparency oppositeOf Opacity' },
      { subjectTypeId: 'Value', predicateId: 'relatedTo', objectTypeId: 'Value', example: 'Decentralization relatedTo Censorship Resistance' },
    ],
  },
  {
    id: 'fee-proxy-template',
    name: 'Intuition Fee Proxy',
    repo: 'intuition-box/Fee-Proxy-Template',
    status: 'infra',
    description:
      'Customizable proxy contract in front of the MultiVault that collects fixed + percentage fees on deposits and create operations before forwarding value.',
    evidence: [
      'README.md — fee structure on deposit/createAtoms/createTriples, admin whitelist, FEE_RECIPIENT',
      'contracts — proxy forwards all MultiVault view functions and write operations',
    ],
    atomTypeIds: ['EthereumSmartContract', 'EthereumAccount', 'Organization', 'Person', 'Thing'],
    predicateIds: ['proxies', 'ownedBy', 'deployedOn'],
    claimPatterns: [
      { subjectTypeId: 'EthereumSmartContract', predicateId: 'proxies', objectTypeId: 'EthereumSmartContract', example: 'Sofia Fee Proxy proxies MultiVault' },
      { subjectTypeId: 'EthereumSmartContract', predicateId: 'ownedBy', objectTypeId: 'Organization', example: 'Sofia Fee Proxy ownedBy Sofia' },
      { subjectTypeId: 'EthereumAccount', predicateId: 'ownedBy', objectTypeId: 'Organization', example: 'Fee recipient ownedBy Sofia' },
      { subjectTypeId: 'EthereumSmartContract', predicateId: 'deployedOn', objectTypeId: 'Thing', example: 'Sofia Fee Proxy deployedOn Intuition' },
    ],
  },
  {
    id: 'sofia-fee-proxy-dashboard',
    name: 'Sofia Fee Proxy Dashboard',
    repo: 'intuition-box/Sofia-Fee-Proxy-Dashboard',
    status: 'app',
    description:
      'Read-only analytics dashboard for the Sofia Fee Proxy on Intuition mainnet — visualizes TransactionForwarded events as fee revenue metrics.',
    evidence: [
      'README.md — proxy contract 0x26F81d723Ad1648194FAA4b7E235105Fd1212c6c, TransactionForwarded event schema',
      'src/config.ts — SOFIA_PROXY_ADDRESS, deploy block, refresh interval',
    ],
    atomTypeIds: ['SoftwareApplication', 'EthereumSmartContract', 'EthereumAccount', 'Organization'],
    predicateIds: ['proxies', 'uses', 'ownedBy'],
    claimPatterns: [
      { subjectTypeId: 'EthereumSmartContract', predicateId: 'proxies', objectTypeId: 'EthereumSmartContract', example: 'Sofia Fee Proxy proxies MultiVault' },
      { subjectTypeId: 'SoftwareApplication', predicateId: 'uses', objectTypeId: 'EthereumSmartContract', example: 'Sofia Fee Proxy Dashboard uses Sofia Fee Proxy' },
      { subjectTypeId: 'EthereumSmartContract', predicateId: 'ownedBy', objectTypeId: 'Organization', example: 'Sofia Fee Proxy ownedBy Sofia' },
    ],
  },
  {
    id: 'spread-trust',
    name: 'Spread Trust',
    repo: 'intuition-box/spread-trust',
    status: 'app',
    description:
      'Burner-wallet PWA for onboarding — generates a throwaway wallet in the browser and sends TRUST to scanned QR addresses. Makes no claims onchain; its ontology is the minimal account/person layer it touches.',
    evidence: [
      'README.md — auto-generated burner wallet, QR scan, TRUST transfer on Intuition chain 1155',
      'package.json — viem for native transfers; no atom/triple creation anywhere in src',
    ],
    atomTypeIds: ['Person', 'EthereumAccount', 'SoftwareApplication'],
    predicateIds: ['controlledBy', 'uses'],
    claimPatterns: [
      { subjectTypeId: 'EthereumAccount', predicateId: 'controlledBy', objectTypeId: 'Person', example: 'Burner wallet controlledBy booth operator' },
      { subjectTypeId: 'Person', predicateId: 'uses', objectTypeId: 'SoftwareApplication', example: 'Booth operator uses Spread Trust' },
    ],
  },
  {
    id: 'rpc',
    name: 'Intuition RPC',
    repo: 'intuition-box/RPC',
    status: 'infra',
    description:
      'One-click deployable Intuition L3 replica node (Arbitrum Nitro settling to Base) with an nginx gateway, status dashboard, and optional API-key protection.',
    evidence: [
      'README.md — nitro node + gateway + dashboard architecture, BASE_RPC_URL requirement',
      'docker-compose.yaml + nitro/Dockerfile — self-hosted node deployment',
      'local-rpc.md — personal RPC at localhost:8545',
    ],
    atomTypeIds: ['Service', 'SoftwareApplication', 'Person', 'Organization'],
    predicateIds: ['hostedBy', 'provides', 'dependsOn', 'uses'],
    claimPatterns: [
      { subjectTypeId: 'Service', predicateId: 'hostedBy', objectTypeId: 'Person', example: 'rpc.example.com hostedBy node operator' },
      { subjectTypeId: 'Service', predicateId: 'hostedBy', objectTypeId: 'Organization', example: 'rpc.intuition.systems hostedBy Intuition' },
      { subjectTypeId: 'Person', predicateId: 'provides', objectTypeId: 'Service', example: 'Node operator provides Intuition RPC endpoint' },
      { subjectTypeId: 'SoftwareApplication', predicateId: 'dependsOn', objectTypeId: 'Service', example: 'Intuition RPC node dependsOn Base RPC' },
      { subjectTypeId: 'Person', predicateId: 'uses', objectTypeId: 'Service', example: 'Developer uses Intuition RPC endpoint' },
    ],
  },
  {
    id: 'mcp',
    name: 'Intuition Box MCP',
    repo: 'intuition-box/mcp',
    url: 'https://mcp.intuition.box',
    status: 'app',
    description:
      'MCP monorepo — two Model Context Protocol servers (knowledge-graph tools and trust-scoring tools) plus an interactive playground where agents and people can explore them.',
    evidence: [
      'README.md — mcp-general (8 knowledge-graph tools), mcp-trust (EigenTrust, AgentRank, sybil detection), playground app',
      'packages/mcp-general + packages/mcp-trust — tool implementations',
      'README.md — Claude Desktop integration config',
    ],
    atomTypeIds: ['SoftwareApplication', 'Skill', 'AIAgent', 'Service'],
    predicateIds: ['provides', 'uses', 'dependsOn'],
    claimPatterns: [
      { subjectTypeId: 'SoftwareApplication', predicateId: 'provides', objectTypeId: 'Skill', example: 'mcp-trust provides Trust Scoring' },
      { subjectTypeId: 'AIAgent', predicateId: 'uses', objectTypeId: 'SoftwareApplication', example: 'Claude uses mcp-general' },
      { subjectTypeId: 'SoftwareApplication', predicateId: 'dependsOn', objectTypeId: 'Service', example: 'mcp-general dependsOn Intuition GraphQL indexer' },
    ],
  },
  {
    id: 'ideation',
    name: 'Intuition Ideation Skill',
    repo: 'intuition-box/intuition-ideation-skill',
    status: 'tooling',
    description:
      'Claude Code skill that walks contributors from brainstorm to published idea — structured drafting, challenge round, PR to the ideas repo, then an onchain idea atom and claim.',
    evidence: [
      'README.md — 5-step workflow ending in "Publish on Intuition" (onchain atom + claim)',
      'references/idea-template.md — structured idea fields',
      'references/github-submission-format.md — PR format for intuition-box/ideas',
    ],
    atomTypeIds: ['Idea', 'Person', 'DefinedTerm', 'SoftwareApplication', 'SoftwareSourceCode'],
    predicateIds: ['authoredBy', 'about', 'taggedWith', 'implements', 'relatedTo'],
    claimPatterns: [
      { subjectTypeId: 'Idea', predicateId: 'authoredBy', objectTypeId: 'Person', example: 'Onchain Reputation Passport authoredBy Alice' },
      { subjectTypeId: 'Idea', predicateId: 'about', objectTypeId: 'DefinedTerm', example: 'Onchain Reputation Passport about Reputation' },
      { subjectTypeId: 'Idea', predicateId: 'taggedWith', objectTypeId: 'DefinedTerm', example: 'Onchain Reputation Passport taggedWith Identity' },
      { subjectTypeId: 'SoftwareApplication', predicateId: 'implements', objectTypeId: 'Idea', example: 'AgentID implements Onchain Reputation Passport' },
      { subjectTypeId: 'Idea', predicateId: 'relatedTo', objectTypeId: 'Idea', example: 'Reputation Passport relatedTo Trust Graph Explorer' },
    ],
  },
];

export function getEcosystemApp(id: string): AppOntology | undefined {
  return ECOSYSTEM_APPS.find((app) => app.id === id);
}
