/**
 * Publishes the intuition-box ecosystem ontologies (Mission 04) onchain.
 *
 * Reads the per-app definitions from src/data/ecosystem-ontologies.ts and
 * turns them into MultiVault atoms + triples:
 *
 *   1. one atom per app (pinned Thing: name, description, repo/live URL)
 *   2. one atom per referenced entity type (Person, AI Agent, Skill, ...)
 *   3. one atom per predicate (reusing existing onchain atoms wherever a
 *      verified equivalent exists — see PREDICATE_BINDINGS)
 *   4. one "rule triple" per valid subject-predicate-object combination:
 *      (TypeAtom, PredicateAtom, TypeAtom)
 *   5. app attribution triples: (App, belongs to, Intuition Box) and
 *      (App, developed by, Intuition Box)
 *   6. app schema links: (App, uses, RuleTriple) — nested triples binding
 *      each app to the rules it relies on
 *
 * Idempotent by construction: reused atoms are pre-verified mainnet
 * term_ids; created atoms pin deterministic IPFS data so re-runs resolve
 * to the same atom id and are skipped via isTermCreated; triples are
 * checked with calculateTripleId + isTermCreated before creation.
 *
 * Usage:
 *   node scripts/publish-ontology.mjs                  # DRY run (default): print the plan
 *   DRY=0 PRIVATE_KEY=0x... node scripts/publish-ontology.mjs   # execute
 *   NETWORK=testnet DRY=0 PRIVATE_KEY=0x... node scripts/publish-ontology.mjs
 *
 * On testnet the mainnet reuse bindings do not exist, so every binding is
 * treated as create — useful for a full preview before mainnet.
 */

import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatEther,
  http,
  parseAbi,
  stringToHex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const NETWORKS = {
  mainnet: {
    chain: defineChain({
      id: 1155,
      name: 'Intuition',
      nativeCurrency: { decimals: 18, name: 'Intuition', symbol: 'TRUST' },
      rpcUrls: { default: { http: ['https://rpc.intuition.systems/http'] } },
    }),
    multivault: '0x6E35cF57A41fA15eA0EaE9C33e751b01A784Fe7e',
    graphql: 'https://mainnet.intuition.sh/v1/graphql',
    explorer: 'https://explorer.intuition.systems',
  },
  testnet: {
    chain: defineChain({
      id: 13579,
      name: 'Intuition Testnet',
      nativeCurrency: { decimals: 18, name: 'Test Trust', symbol: 'tTRUST' },
      rpcUrls: { default: { http: ['https://testnet.rpc.intuition.systems/http'] } },
    }),
    multivault: '0x2Ece8D4dEdcB9918A398528f3fa4688b1d2CAB91',
    graphql: 'https://testnet.intuition.sh/v1/graphql',
    explorer: 'https://testnet.explorer.intuition.systems',
  },
};

const MULTIVAULT_ABI = parseAbi([
  'function getAtomCost() view returns (uint256)',
  'function getTripleCost() view returns (uint256)',
  'function calculateAtomId(bytes atomData) view returns (bytes32)',
  'function calculateTripleId(bytes32 subjectId, bytes32 predicateId, bytes32 objectId) view returns (bytes32)',
  'function isTermCreated(bytes32 termId) view returns (bool)',
  'function createAtoms(bytes[] atomDatas, uint256[] assets) payable returns (bytes32[])',
  'function createTriples(bytes32[] subjectIds, bytes32[] predicateIds, bytes32[] objectIds, uint256[] assets) payable returns (bytes32[])',
]);

/**
 * Verified mainnet atoms reused as-is (term_ids confirmed via the indexer,
 * 2026-06-10). On testnet these all fall back to create.
 */
const REUSED_ENTITIES = {
  'Intuition Box': '0xbc35e0e2300b869802c1d76928417fc4c5446bf2d61a60f774b178c2a6d7b00b',
  'Intuition': '0x8c486fd3377cef67861f7137bcc89b188c7f1781314e393e22c1fa6fa24e520e',
  'AI Agent': '0x3bc738a1ffacf08c0b53077b7467fa025e11137d236bc60eae21530342d50557',
  'Skill': '0xba57c5daf6c9b8b7821406db1bff01427b385a4a041f2ddd5cf004e80949610c',
  'Community': '0x9813a2accf94000ab0fd7bb7bbed4698099eed24d5e9805ea6136fe48cfb9830',
  'Thing': '0x4e053f5733e15de9222004c520327176ea59e24f59b4400fcb855cb1db3ac2a3',
};

const REUSED_PREDICATES = {
  'trusts': '0x3a73f3b1613d166eea141a25a2adc70db9304ab3c4e90daecad05f86487c3ee9',
  'follows': '0x87daf17b45361ec14fbbe35699133704897e39b358c51305eb9cf8b61e601b80',
  'uses': '0x5c0bde1cc696456c0268248c4656acdf9621fdb39e605bc99b0a83dc8ff6e800',
  'created': '0xc0778a52f7cc989edded561d5bac9e70694e8ad2ad70baf11f0aa227f7f663aa',
  'authored': '0x313db11e1e724d7b2cb018d067f60a957dd4dd81268aea7ba83d814c85bbb551',
  'owns': '0xdd3eb9326e013e0ffecb067709bbf6cb6352122e025faede9c887b7c9ac4b773',
  'supports': '0x9d431d249c3d157d56b013cda719a09722c172cb6a43b881cf5b328fff911090',
  'has tag': '0x7ec36d201c842dc787b45cb5bb753bea4cf849be3908fb1b0a7d067c3c3cc1f5',
  'is': '0xdd4320a03fcd85ed6ac29f3171208f05418324d6943f1fac5d3c23cc1ce10eb3',
  'is connected to': '0x0fdc2f1da5a7be5283b26c549c28b20315d1a583f1e1607d610d6728ed91b97e',
  'related to': '0xa1fadfcf5e29bd37e048625f1deee9a6374b249fcda4905649a85022c74070ec',
  'belongs to': '0x3317b232b1d59ae421283a4ce4d8bef0f739574c3a53386d5d8597d4b272d4e8',
  'same as': '0xbeebfb7d177cbd96ffc239d2196c72ec346efe81f39dc595773f13d83506f5f0',
  'has agent skill': '0x638fd866e4564e213a11ebeb98bbaea58e81f677860d90fa4ad01e50bb007108',
  'reported for': '0x51f1febac0b9d05953442f082597c5d1ce827bd2f888446ad811692e0a0f428d',
  'evaluated by': '0xb769bc51460e2dc29927c825f743238174c02901603a0c9604dd2e8ea40f8226',
  'endorses': '0x0471b733d120dc48dfa20eeaa24d1bcb0fb4477d975d5ccc7748dc8eb8d3f7a7',
  'is member of': '0xe489948c4bd4fa6f50f402434996b90942ab67585a71c71d81dff8e624f661d4',
  'has value': '0x36168c95e4ad03ad3c70031f5a7e6133ee36abff638638d41da0aaa068e7e460',
  'provides': '0x996e3fb300e4b5fa825f59d33e46c7ea5a001ca65e8b506bc2e6c3e85f702314',
  'developed by': '0x1e4fb6f9dc4f9d83aff58fb7bbd08b77ebf32c52fb12eb6b7c340049d06e4db6',
  'deployed on': '0x957beb2e34369c31c05a83dd43b7361bae62ce27aa799d731e7b24bd4ede7d7b',
};

/**
 * Maps each schema predicate id to its onchain encoding.
 *   label    — onchain atom label used for the rule triple
 *   invert   — swap subject/object so an existing active-voice atom is
 *              reused instead of minting a passive duplicate
 *   objectOverride — replace a generic object type with a concrete entity
 *   skip     — schema-only predicate, not published (documented per app)
 *   description — pinThing description when the atom must be created
 */
const PREDICATE_BINDINGS = {
  trusts: { label: 'trusts' },
  follows: { label: 'follows' },
  uses: { label: 'uses' },
  knows: { label: 'is connected to' },
  endorses: { label: 'endorses' },
  memberOf: { label: 'is member of' },
  founderOf: { label: 'created' },
  hasSkill: { label: 'has agent skill' },
  hasValue: { label: 'has value' },
  advocates: { label: 'supports' },
  provides: { label: 'provides' },
  taggedWith: { label: 'has tag' },
  relatedTo: { label: 'related to' },
  subConceptOf: { label: 'belongs to' },
  isA: { label: 'is' },
  sameAs: { label: 'same as' },
  reportedFor: { label: 'reported for' },
  evaluatedBy: { label: 'evaluated by' },
  authoredBy: { label: 'authored', invert: true },
  about: { label: 'related to' },
  ownedBy: { label: 'owns', invert: true },
  deployedOn: { label: 'deployed on', objectOverride: 'Intuition' },
  oppositeOf: { skip: 'no verified onchain equivalent; schema-only for now' },
  operatedBy: {
    label: 'operated by',
    description: 'Subject (AI agent, system) is operated by object (person, organization, account). The operator is accountable for the subject’s behavior. AgentID registry pattern: [Agent] — operated by — [Operator].',
  },
  hasRole: {
    label: 'has role',
    description: 'Subject holds object as a role within a group or community (e.g. Owner, Admin, Moderator, Member). Atlas community role pattern: [Person] — has role — [Role].',
  },
  proxies: {
    label: 'proxies',
    description: 'Subject contract forwards calls to object contract, usually adding fees or access control. Fee proxy pattern: [Proxy Contract] — proxies — [MultiVault].',
  },
  controlledBy: {
    label: 'controlled by',
    description: 'Subject (account, contract) is controlled by object (person, organization) — control of keys or admin rights, distinct from ownership.',
  },
  dependsOn: {
    label: 'depends on',
    description: 'Subject (software, service) requires object (software, service) to function. Example: an Intuition L3 replica node depends on a Base RPC endpoint.',
  },
  implements: {
    label: 'implements',
    description: 'Subject (software) implements object (standard, concept, or published idea). Links shipped apps back to the ideas they realize.',
  },
  hostedBy: {
    label: 'hosted by',
    description: 'Subject (website, service, node) is hosted and operated by object (person, organization). Self-hosted infrastructure pattern: [RPC endpoint] — hosted by — [operator].',
  },
};

/** pinThing descriptions for entity-type atoms that must be created. */
const TYPE_ATOM_DESCRIPTIONS = {
  Person: 'A human individual — developer, artist, founder, contributor.',
  Organization: 'A company, DAO, foundation, team, or collective.',
  DefinedTerm: 'A formally defined concept, keyword, or term.',
  EthereumAccount: 'An Ethereum externally owned account (EOA).',
  EthereumSmartContract: 'A deployed smart contract on an EVM chain.',
  SoftwareApplication: 'A desktop or web application.',
  SoftwareSourceCode: 'An open-source project, library, or codebase.',
  Service: 'An offered service — API endpoint, SaaS, infrastructure.',
  WebSite: 'A website — top-level domain presence.',
};

const NETWORK = process.env.NETWORK === 'testnet' ? 'testnet' : 'mainnet';
const DRY = process.env.DRY !== '0';
const NET = NETWORKS[NETWORK];

async function loadData() {
  const entry = [
    "export { ECOSYSTEM_APPS } from './src/data/ecosystem-ontologies';",
    "export { ATOM_TYPES } from './src/data/atom-types';",
    "export { PREDICATES, validateClaim } from './src/data/predicates';",
  ].join('\n');
  const dir = mkdtempSync(join(tmpdir(), 'ontology-publish-'));
  const outfile = join(dir, 'data.mjs');
  await build({
    stdin: { contents: entry, resolveDir: ROOT, loader: 'ts' },
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile,
  });
  return import(pathToFileURL(outfile).href);
}

async function gql(query) {
  const res = await fetch(NET.graphql, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
  return json.data;
}

async function pinThing({ name, description, url }) {
  const res = await fetch(NET.graphql, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation pinThing($name: String!, $description: String!, $image: String!, $url: String!) {
        pinThing(thing: { name: $name, description: $description, image: $image, url: $url }) { uri }
      }`,
      variables: { name, description: description ?? '', image: '', url: url ?? '' },
    }),
  });
  const json = await res.json();
  const uri = json.data?.pinThing?.uri;
  if (!uri || !uri.startsWith('ipfs://')) {
    throw new Error(`pinThing failed for "${name}": ${JSON.stringify(json.errors ?? json)}`);
  }
  return uri;
}

function buildPlan(data) {
  const { ECOSYSTEM_APPS, ATOM_TYPES, validateClaim } = data;

  for (const app of ECOSYSTEM_APPS) {
    for (const p of app.claimPatterns) {
      const check = validateClaim(p.subjectTypeId, p.predicateId, p.objectTypeId);
      if (!check.valid) {
        throw new Error(`[${app.id}] invalid claim pattern (${p.subjectTypeId}, ${p.predicateId}, ${p.objectTypeId}): ${check.reason}`);
      }
    }
  }

  const typeLabel = (typeId) => {
    const t = ATOM_TYPES.find((a) => a.id === typeId);
    if (!t) throw new Error(`Unknown atom type id: ${typeId}`);
    // Onchain type atoms use natural names, not UI abbreviations.
    if (typeId === 'EthereumAccount') return 'Ethereum Account';
    return t.label;
  };

  /** key → { label, kind, description?, url?, reuse? } */
  const atoms = new Map();
  const addAtom = (label, info) => {
    if (!atoms.has(label)) atoms.set(label, { label, ...info });
    return label;
  };

  addAtom('Intuition Box', { kind: 'entity', reuse: REUSED_ENTITIES['Intuition Box'] });

  const rules = new Map();
  const appLinks = [];
  const attributions = [];
  const skipped = [];

  for (const app of ECOSYSTEM_APPS) {
    addAtom(app.name, {
      kind: 'app',
      description: app.description,
      url: app.url ?? `https://github.com/${app.repo}`,
    });
    attributions.push([app.name, 'belongs to', 'Intuition Box']);
    attributions.push([app.name, 'developed by', 'Intuition Box']);

    for (const p of app.claimPatterns) {
      const binding = PREDICATE_BINDINGS[p.predicateId];
      if (!binding) throw new Error(`No onchain binding for predicate "${p.predicateId}"`);
      if (binding.skip) {
        skipped.push(`[${app.id}] (${p.subjectTypeId}, ${p.predicateId}, ${p.objectTypeId}) — ${binding.skip}`);
        continue;
      }

      let subjectLabel = typeLabel(p.subjectTypeId);
      let objectLabel = binding.objectOverride ?? typeLabel(p.objectTypeId);
      if (binding.invert) [subjectLabel, objectLabel] = [objectLabel, subjectLabel];

      for (const label of [subjectLabel, objectLabel]) {
        if (atoms.has(label)) continue;
        if (REUSED_ENTITIES[label]) {
          addAtom(label, { kind: 'type', reuse: REUSED_ENTITIES[label] });
        } else {
          const typeId = [p.subjectTypeId, p.objectTypeId].find((id) => typeLabel(id) === label);
          const atomType = ATOM_TYPES.find((a) => a.id === typeId);
          addAtom(label, {
            kind: 'type',
            description: TYPE_ATOM_DESCRIPTIONS[typeId] ?? atomType?.description ?? '',
          });
        }
      }

      if (!atoms.has(binding.label)) {
        if (REUSED_PREDICATES[binding.label]) {
          addAtom(binding.label, { kind: 'predicate', reuse: REUSED_PREDICATES[binding.label] });
        } else {
          addAtom(binding.label, { kind: 'predicate', description: binding.description });
        }
      }

      const ruleKey = `${subjectLabel}|${binding.label}|${objectLabel}`;
      if (!rules.has(ruleKey)) rules.set(ruleKey, { subjectLabel, predicateLabel: binding.label, objectLabel, apps: [] });
      rules.get(ruleKey).apps.push(app.id);
      appLinks.push([app.name, 'uses', ruleKey]);
    }
  }

  for (const label of ['belongs to', 'developed by', 'uses']) {
    if (!atoms.has(label)) addAtom(label, { kind: 'predicate', reuse: REUSED_PREDICATES[label] });
  }

  if (NETWORK === 'testnet') {
    for (const atom of atoms.values()) delete atom.reuse;
  }

  return { atoms, rules, attributions, appLinks, skipped };
}

async function main() {
  console.log(`Network: ${NETWORK} (chain ${NET.chain.id}) — MultiVault ${NET.multivault}`);
  console.log(`Mode: ${DRY ? 'DRY RUN (set DRY=0 to execute)' : 'EXECUTE'}\n`);

  const data = await loadData();
  const plan = buildPlan(data);

  const client = createPublicClient({ chain: NET.chain, transport: http() });
  const [atomCost, tripleCost] = await Promise.all([
    client.readContract({ address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'getAtomCost' }),
    client.readContract({ address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'getTripleCost' }),
  ]);

  const reused = [...plan.atoms.values()].filter((a) => a.reuse);
  const toCreate = [...plan.atoms.values()].filter((a) => !a.reuse);

  console.log(`── Atoms reused (${reused.length}) ──`);
  for (const a of reused) console.log(`  [${a.kind}] ${a.label}  →  ${a.reuse}`);

  console.log(`\n── Atoms to create (${toCreate.length}) ──`);
  for (const a of toCreate) {
    const existing = await gql(
      `query { atoms(limit: 3, where: { label: { _eq: ${JSON.stringify(a.label)} } }, order_by: { created_at: asc }) { term_id type } }`
    );
    const collisions = existing.atoms ?? [];
    const note = collisions.length
      ? `  (label collision: ${collisions.length} existing atom(s) with other data, e.g. ${collisions[0].term_id.slice(0, 14)}…)`
      : '';
    console.log(`  [${a.kind}] ${a.label}${a.url ? `  url=${a.url}` : ''}${note}`);
  }

  console.log(`\n── Rule triples (${plan.rules.size}) ──`);
  for (const r of plan.rules.values()) {
    console.log(`  (${r.subjectLabel}, ${r.predicateLabel}, ${r.objectLabel})  [${r.apps.join(', ')}]`);
  }

  console.log(`\n── App attribution triples (${plan.attributions.length}) ──`);
  for (const [s, p, o] of plan.attributions) console.log(`  (${s}, ${p}, ${o})`);

  console.log(`\n── App → rule links (${plan.appLinks.length} nested triples) ──`);
  for (const [appName, , ruleKey] of plan.appLinks) {
    const r = plan.rules.get(ruleKey);
    console.log(`  (${appName}, uses, [${r.subjectLabel} — ${r.predicateLabel} — ${r.objectLabel}])`);
  }

  if (plan.skipped.length) {
    console.log(`\n── Skipped (schema-only) ──`);
    for (const s of plan.skipped) console.log(`  ${s}`);
  }

  const nTriples = plan.rules.size + plan.attributions.length + plan.appLinks.length;
  const total = atomCost * BigInt(toCreate.length) + tripleCost * BigInt(nTriples);
  console.log(`\n── Totals ──`);
  console.log(`  atoms:   ${toCreate.length} new, ${reused.length} reused`);
  console.log(`  triples: ${nTriples} (${plan.rules.size} rules + ${plan.attributions.length} attributions + ${plan.appLinks.length} links)`);
  console.log(`  atomCost=${formatEther(atomCost)} ${NET.chain.nativeCurrency.symbol}, tripleCost=${formatEther(tripleCost)} ${NET.chain.nativeCurrency.symbol}`);
  console.log(`  estimated total: ${formatEther(total)} ${NET.chain.nativeCurrency.symbol} (+ negligible gas)`);

  if (DRY) {
    console.log('\nDry run complete — nothing was pinned or broadcast.');
    return;
  }

  if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY is required when DRY=0');
  const account = privateKeyToAccount(process.env.PRIVATE_KEY);
  const wallet = createWalletClient({ account, chain: NET.chain, transport: http() });
  console.log(`\nPublishing as ${account.address}…`);

  const termIds = new Map();
  for (const a of reused) termIds.set(a.label, a.reuse);

  const pendingDatas = [];
  const pendingAssets = [];
  for (const a of toCreate) {
    const uri = await pinThing({ name: a.label, description: a.description, url: a.url });
    const atomData = stringToHex(uri);
    const atomId = await client.readContract({
      address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'calculateAtomId', args: [atomData],
    });
    const exists = await client.readContract({
      address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'isTermCreated', args: [atomId],
    });
    termIds.set(a.label, atomId);
    if (exists) {
      console.log(`  atom exists, skipping: ${a.label} → ${atomId}`);
    } else {
      pendingDatas.push(atomData);
      pendingAssets.push(atomCost);
    }
  }
  if (pendingDatas.length) {
    const hash = await wallet.writeContract({
      address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'createAtoms',
      args: [pendingDatas, pendingAssets],
      value: pendingAssets.reduce((a, b) => a + b, 0n),
    });
    console.log(`  createAtoms tx: ${NET.explorer}/tx/${hash}`);
    await client.waitForTransactionReceipt({ hash });
  }

  const submitTriples = async (label, triples) => {
    const subjects = [];
    const predicates = [];
    const objects = [];
    for (const [s, p, o] of triples) {
      const tripleId = await client.readContract({
        address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'calculateTripleId', args: [s, p, o],
      });
      const exists = await client.readContract({
        address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'isTermCreated', args: [tripleId],
      });
      if (!exists) { subjects.push(s); predicates.push(p); objects.push(o); }
    }
    if (!subjects.length) {
      console.log(`  ${label}: all triples already exist, skipping`);
      return;
    }
    const assets = subjects.map(() => tripleCost);
    const hash = await wallet.writeContract({
      address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'createTriples',
      args: [subjects, predicates, objects, assets],
      value: assets.reduce((a, b) => a + b, 0n),
    });
    console.log(`  ${label} tx (${subjects.length} triples): ${NET.explorer}/tx/${hash}`);
    await client.waitForTransactionReceipt({ hash });
  };

  const ruleTriples = [...plan.rules.values()].map((r) => [
    termIds.get(r.subjectLabel), termIds.get(r.predicateLabel), termIds.get(r.objectLabel),
  ]);
  await submitTriples('rule triples', ruleTriples);

  const ruleTermIds = new Map();
  for (const [key, r] of plan.rules) {
    ruleTermIds.set(key, await client.readContract({
      address: NET.multivault, abi: MULTIVAULT_ABI, functionName: 'calculateTripleId',
      args: [termIds.get(r.subjectLabel), termIds.get(r.predicateLabel), termIds.get(r.objectLabel)],
    }));
  }

  const attributionTriples = plan.attributions.map(([s, p, o]) => [
    termIds.get(s), termIds.get(p), termIds.get(o),
  ]);
  await submitTriples('attribution triples', attributionTriples);

  const linkTriples = plan.appLinks.map(([appName, , ruleKey]) => [
    termIds.get(appName), termIds.get('uses'), ruleTermIds.get(ruleKey),
  ]);
  await submitTriples('app → rule links', linkTriples);

  console.log('\nPublish complete. Verify via the indexer, then update glossary-atoms.ts with the new term_ids.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
