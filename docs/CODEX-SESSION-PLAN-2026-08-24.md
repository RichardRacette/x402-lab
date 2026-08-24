# Codex Session Plan — 2026-08-24 Evening

Status: **source of truth for tonight's desktop/Codex work**

## Objective

Build an internal **Machine Demand Observatory** that uses current x402 ecosystem evidence to improve Product #2 selection.

Tonight does **not** choose Product #2 and does **not** add another seller endpoint.

Tonight answers:

> **Can we turn observed merchant/buyer/transaction data into a repeatable evidence process that tells us what machines actually buy, how broad or concentrated that demand is, and which capability gaps deserve a cheap product test?**

## Branch

Create:

`milestone-4-5-machine-demand-observatory`

Do not implement directly on `main`.

## Read before editing

Codex must read:

1. `docs/PRODUCT-THESIS.md`
2. `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`
3. `docs/PRODUCT-VIABILITY-2026-08-24.md`
4. `docs/ROADMAP.md`
5. existing shopper/buyer implementation
6. existing tests/package scripts

Read Recruiting Pressure, Role Reality, Search Preflight and Recruiting Agent Eval docs only as historical discovery evidence.

Before changing code, summarize:

- why Product #2 is intentionally unknown
- why raw transaction count is insufficient
- what metrics the observatory needs
- how the existing shopper can help with research
- the real-money safety rule
- what Codex is explicitly forbidden to build tonight

## Existing market evidence to preserve

Use the human-researched seed observations in `PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md` only as fixtures/reference examples.

Do not silently present them as live data.

The live collection layer must timestamp its own observations.

## Desired architecture

Suggested structure:

```text
src/market-observatory/
  types.ts
  normalize.ts
  metrics.ts
  compare.ts
  flags.ts
  report.ts
  opportunity-card.ts
  cli.ts
  providers/
    provider.ts
    fixture.ts
    x402scan.ts
```

Use fewer files if clearer.

No frontend or production database is required.

JSON/JSONL/CSV snapshots plus Markdown reports are enough.

## Core normalized data

Design compact provider-neutral structures.

### Merchant snapshot

Prefer fields such as:

- observedAt
- merchant/server identifier
- address(es) where available
- origin/name/description where available
- tags/categories where supplied by source
- resource count
- transactions in source window
- payment volume in source window
- unique buyers in source window
- latest activity
- chain/facilitator metadata where available
- source reference/provenance

### Resource snapshot

Where available:

- merchant/server identifier
- resource path/name
- method
- description
- price or price range
- tags/category
- protocol/version/network
- public/paid/auth state

### Transaction snapshot

Where permitted by the source:

- transaction id/hash
- buyer address/identifier
- seller/recipient address
- amount
- timestamp
- chain
- facilitator
- source reference

Do not infer missing values as zero.

## Metrics

Implement explicit metrics with documented semantics.

### Merchant-level

- `transactionsPerBuyer`
- `volumePerBuyer`
- `averageTransactionValue`
- `buyersPer100Transactions`

When transaction-level data exists:

- repeat-buyer count/share
- top buyer share of transactions
- top buyer share of volume
- top-3/top-5 buyer concentration
- median transactions per buyer

### Buyer-level

When data permits:

- distinct sellers purchased from
- total transactions
- total spend
- seller/category mix
- repeated purchases by seller

### Snapshot comparison

Between two compatible snapshots:

- buyer delta / growth
- transaction delta / growth
- volume delta / growth
- resource-count delta
- price/resource changes where observable

Never compare incompatible windows without labeling the limitation.

## Demand-shape flags

Flags are descriptive, not product recommendations.

Examples:

### `BROAD_ADOPTION`

Relatively high unique-buyer count compared with activity.

### `CONCENTRATED_REPEAT`

Few buyers account for substantial repeat activity.

### `BROAD_AND_REPEAT`

Evidence of both breadth and repeat use.

### `LOW_OBSERVED_DEMAND`

Very low buyers/transactions despite being discoverable.

### `SINGLE_BUYER_DOMINANCE`

Transaction-level evidence shows one buyer accounts for an outsized share.

### `CROSS_SELLER_SHOPPER`

A buyer is observed purchasing from multiple independent sellers.

Do not label a transaction as self-dealing, fake, organic or independent unless the evidence actually supports that conclusion.

Use cautious wording such as `CONCENTRATION_RISK` or `POSSIBLE_INTERNAL_PATTERN` only when criteria are explicit.

## Qualitative review layer

Do not create an opaque automated “opportunity score.”

Create a small human-editable review record for interesting merchants/capabilities:

```json
{
  "merchantId": "...",
  "whatIsPurchased": "...",
  "buyVsBuildReason": "...",
  "scarceInput": "credentials|data|compute|infrastructure|external_action|trust|other",
  "freeSubstitutes": [],
  "paidSubstitutes": [],
  "replicationDifficulty": "low|medium|high|unknown",
  "notes": "..."
}
```

The software may scaffold the record from source metadata, but human judgment must fill the strategic conclusions.

## Opportunity-card generator

Generate a Markdown/JSON scaffold for a candidate product hypothesis containing:

- observed demand evidence
- representative merchants/resources
- buyer breadth
- repeat intensity
- concentration caveat
- current price bands
- buy-vs-build hypothesis
- required upstream capability
- current competitors/substitutes — human research field
- lawful supply path — human research field
- rough unit economics — human research field
- possible x402-lab advantage — human research field
- cheapest falsification test — human research field
- decision: `UNREVIEWED | REJECT | RESEARCH | TEST`

Do not auto-promote a candidate to `TEST`.

## Provider 1 — deterministic fixtures

Build and test the observatory first against fixtures based on the seed market shapes in the Round 4 document.

Fixtures should include at least:

1. broad + high-repeat service
2. few-buyer/high-repeat service
3. broad/low-repeat service
4. zero-demand catalog
5. one-buyer concentrated service
6. multi-seller buyer example

The fixtures test metrics; they are not live-market claims.

## Provider 2 — x402scan market-data adapter

After core tests pass, implement an **optional** adapter for x402scan's x402-paid market-data resources.

Current researched resources include approximately:

```text
GET /api/x402/merchants
GET /api/x402/merchants/{address}/stats
GET /api/x402/merchants/{address}/transactions
GET /api/x402/facilitators
GET /api/x402/facilitators/stats
GET /api/x402/origins/{id}/resources
```

The current observed price is roughly `$0.01` per paid call, but runtime `402` requirements are authoritative.

### Important integration rule

Do not reimplement x402 purchasing if the existing shopper/buyer abstraction can be reused cleanly.

The observatory provider should depend on a narrow paid-fetch interface rather than private-key logic spread through analytics code.

## Real-money safety — absolute requirement

**Default mode must not spend real money.**

Building an adapter is not authorization to execute a mainnet purchase.

Requirements:

- fixture/dry-run is default
- live paid mode requires an explicit CLI flag such as `--execute-paid`
- live mode must require explicit configured session budget
- never fund a wallet automatically
- never log/private-key output
- reuse existing spend controls
- check quoted/runtime price before payment
- reject payment above per-call cap
- track committed + reserved session spend
- stop when session budget is exhausted
- every paid research request produces an audit record

Suggested caps **only after explicit owner approval**:

```text
max per payment: $0.02
max research session: $0.25
```

These numbers are safety defaults, not permission to spend.

If the existing shopper is testnet-only or incompatible with the provider's network, report the gap and stop. Do not silently broaden wallet/network permissions.

## Optional public/manual import

If x402scan paid integration cannot be exercised safely tonight, the observatory must still be useful.

Support importing sanitized manually collected JSON/CSV snapshots so research is not blocked by wallet/network setup.

Do not build brittle HTML scraping solely to avoid a paid API unless the source explicitly supports it and the implementation is clearly worthwhile.

## Reports

Create at least three outputs.

### 1. Market snapshot

Markdown + JSON showing:

- merchants observed
- activity/buyer/volume metrics
- demand-shape flags
- data window and source limitations

### 2. Buyer-behavior report

When transaction-level data supports it:

- repeat buyers
- concentrated buyers
- cross-seller shoppers
- sellers/categories they purchase from

### 3. Product-discovery queue

A short list of **human-review candidates**, not product recommendations.

Prioritize unusual combinations such as:

- broad buyers + strong repeat
- high value per buyer
- clearly scarce/access-gated capability
- multi-seller shopper usage
- high demand with surprisingly few sellers/resources

Also include negative controls:

- large catalog + weak buyers
- commodity capability + weak demand

## Tests

Minimum tests:

- missing buyers does not become zero buyers
- division-by-zero handled explicitly
- transactions-per-buyer correct
- volume-per-buyer correct
- transaction-level concentration correct
- repeat-buyer share correct
- multi-seller buyer detection correct
- snapshot comparisons reject/flag incompatible windows
- flags do not claim independence/organic demand without evidence
- opportunity card defaults to `UNREVIEWED`
- dry-run cannot execute paid fetch
- session budget blocks over-budget paid fetch
- per-call cap blocks unexpected price
- audit record contains no private key/secret
- all existing x402-lab tests remain green

Run:

```bash
npm test
npm run typecheck
```

## CLI

Prefer a small CLI, for example:

```bash
npm run market:fixtures
npm run market:import -- --file path/to/snapshot.json
npm run market:report
npm run market:compare -- --before ... --after ...
npm run market:collect -- --provider x402scan --dry-run
```

A paid form may exist only with explicit execution and budget flags, for example:

```bash
npm run market:collect -- --provider x402scan --execute-paid --budget-usdc 0.25
```

Do not execute the paid form automatically.

## Initial analysis questions

The first report should make it easier for a human to answer:

1. Which services have the broadest unique-buyer adoption?
2. Which have the highest repeat intensity among nontrivial buyer sets?
3. Which are dominated by one/few buyers?
4. Which buyers purchase across many sellers?
5. What capability categories recur among cross-seller shoppers?
6. What capability categories show broad adoption despite higher prices?
7. Which giant catalogs have weak demand?
8. Which successful services mainly abstract credentials/access?
9. Which successful services provide genuinely fresh/scarce data?
10. Which opportunities appear structurally outside x402-lab's ability to compete?

The last question matters as much as the others.

## Absolute non-goals tonight

Do not build:

- Recruiting Agent Eval Workbench
- Search Preflight customer product
- Role Reality
- Recruiting Pressure
- a new seller endpoint
- a new commercial brand
- mainnet seller deployment
- MCP/MPP
- frontend/dashboard
- recommendation engine that autonomously selects Product #2
- unbounded scraper
- automatic wallet funding
- automatic real-money execution

Preserve Evidence Slice and existing buyer/shopper behavior.

## Stop/go gate

The observatory earns more work if it can produce a materially better product-discovery conversation than manually browsing x402scan.

### Pass

- normalized snapshots are easy to collect/import
- metrics reveal breadth vs repeat vs concentration clearly
- transaction-level data reveals useful buyer patterns when available
- reports surface non-obvious merchants/buyers worth manual research
- creating opportunity cards becomes faster and more disciplined

### Fail

- output is just a prettier leaderboard
- x402scan already provides every meaningful analysis directly
- data quality is too incomplete to distinguish demand shapes
- paid data cost/complexity exceeds the research value

If it fails, preserve the lesson and return to manual discovery rather than adding features.

## End-of-night target

Best case:

- tested observatory core
- fixture market shapes
- normalized snapshot format
- metrics + concentration analysis
- compare/report tooling
- optional x402scan paid-provider adapter behind hard spend controls
- one dry-run showing intended paid requests/budget
- one current manually imported or safely collected market snapshot
- 3–5 **unreviewed/research** opportunity cards grounded in observed demand

Still-successful case:

- observatory is rejected because it adds little beyond existing tools
- no Product #2 is forced
- no unnecessary real-money spend occurs

## Codex prompt for tonight

> Read `docs/PRODUCT-THESIS.md`, `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`, and `docs/CODEX-SESSION-PLAN-2026-08-24.md` before editing anything. Create branch `milestone-4-5-machine-demand-observatory`. Product #2 is intentionally unknown. Do not implement Recruiting Agent Eval, Search Preflight, Role Reality, Recruiting Pressure, or any new paid seller endpoint. Build an internal market observatory that normalizes merchant/resource/transaction snapshots, computes buyer breadth/repeat/economic/concentration metrics, compares snapshots, surfaces descriptive demand-shape flags, and scaffolds human-reviewed opportunity cards. Start with deterministic fixtures and tests. Then add an optional x402scan market-data provider behind the existing bounded buyer/shopper abstraction where cleanly possible. Default to dry-run and make real-money execution impossible without an explicit execute flag plus per-call/session spend caps; do not spend money automatically or broaden wallet/network permissions. Support manual JSON/CSV import so the work is useful without a live paid provider. Generate JSON + Markdown reports and preserve all existing x402-lab behavior. Finish with exact commands for fixture analysis, importing a snapshot, dry-running x402scan collection, and—without executing it—the command that would require explicit owner approval for a capped paid collection.
