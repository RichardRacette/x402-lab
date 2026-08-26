# x402-lab

[![CI](https://github.com/RichardRacette/x402-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/RichardRacette/x402-lab/actions/workflows/ci.yml)

Experimental x402 machine-commerce lab for paid agent APIs, bounded autonomous purchasing, revealed-demand research, and security tooling.

This is a public R&D experiment in becoming a real vendor in the machine economy. Technical proof is treated separately from evidence of commercial demand.

Current rule:

> **Observe demand before building supply.**

## Development

Requirements: Node.js 22+ and npm.

```bash
npm ci
npm run typecheck
npm test
```

Run the local server with:

```bash
npm run dev
```

Repository changes should be developed on a scoped branch, proposed through a pull request, and merged only after CI passes. Tests and CI must not execute real payments. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the repository workflow and payment-safety invariants.

## Live technical proof

**Evidence Slice** remains live on Base Sepolia testnet:

`POST https://x402-lab-production.up.railway.app/extract-evidence`

- price: `$0.003` test USDC
- payment: x402 v2
- signup/API key: none
- current role: stable protocol/payment proof + compatibility fixture

Evidence Slice proved public 402 challenge → automated payment → settlement → retry → protected fulfillment, plus machine-readable discovery.

It did **not** prove commercial demand.

## Current product state

**Product #2 is not selected.**

That is intentional.

The project has repeatedly discovered that attractive, easy-to-build ideas had weak buy-vs-build economics, strong free substitutes, existing competitors, or no unique x402-lab advantage.

A weak Product #2 is worse than no Product #2.

Start tonight with:

- [`docs/START-HERE-TONIGHT-2026-08-24.md`](docs/START-HERE-TONIGHT-2026-08-24.md)

Current governing docs:

- [`docs/DIRECTIVE-ALIGNMENT-2026-08-24.md`](docs/DIRECTIVE-ALIGNMENT-2026-08-24.md)
- [`docs/PRODUCT-THESIS.md`](docs/PRODUCT-THESIS.md)
- [`docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`](docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md)
- [`docs/CODEX-SESSION-PLAN-2026-08-24.md`](docs/CODEX-SESSION-PLAN-2026-08-24.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)

Older Recruiting Pressure, Role Reality, Search Preflight and Recruiting Agent Eval documents are preserved as product-discovery history, not current implementation instructions.

## What we learned from rejected/downgraded ideas

1. **Evidence Slice as the business** — weak buy-vs-build advantage.
2. **Recruiting Pressure / Agency Opportunity** — crowded current market.
3. **Automated Role Reality** — strong free/SMB substitutes and easy public-data replication.
4. **Search Preflight** — plausible service but often redundant with existing recruiter expertise.
5. **Recruiting Agent Practitioner Eval** — plausible specialist service, but currently closer to consulting/domain labor than a demonstrated structural machine-commerce advantage.

These are useful failures because they happened before large implementation commitments.

## Current discovery direction

The active question is:

> **What are independent machine buyers already paying for repeatedly, why is buying rational compared with reproducing the capability, and where is there a gap x402-lab can credibly exploit?**

Current observed demand patterns make these categories worth investigating:

- credential/access abstraction
- scarce/fresh data
- compute/model access
- browser/document infrastructure
- external actions/execution
- payment/identity/RPC/risk infrastructure
- genuinely specialist analysis

These are categories to study, not pre-approved products.

## Machine Demand Observatory

The active discovery workstream is **Issue #15**.

Build an internal Machine Demand Observatory on branch:

`milestone-4-5-machine-demand-observatory`

The observatory should help distinguish:

- unique buyer breadth
- repeat intensity
- economic intensity
- buyer concentration
- cross-seller shoppers
- demand momentum across snapshots
- large catalogs with weak demand
- capability types with actual repeat purchase behavior

It should support normalized JSON/CSV snapshots, Markdown reports and human-reviewed opportunity cards.

It must **not** autonomously choose Product #2.

## Kiroshi Optics

**Kiroshi Optics** is now an active internal companion project: **Issue #16**.

It is a local read-only visual scanner over Observatory exports — not Product #2, not a commercial brand, and not another data pipeline.

After the minimal Observatory core passes its usefulness gate, Kiroshi is authorized to proceed with a tightly bounded first slice:

- `MARKET SCAN`
- `TARGET SCAN`
- `OPPORTUNITY QUEUE` when data exist
- `BUYER TRACE` only when transaction-level evidence supports it

Read:

- [`docs/KIROSHI-OPTICS.md`](docs/KIROSHI-OPTICS.md)
- [`docs/KIROSHI-OPTICS-MVP.md`](docs/KIROSHI-OPTICS-MVP.md)

V0 target: local, original futuristic scanner styling, existing Node/TypeScript stack, `$0` incremental paid infrastructure, no wallet/data-provider access from the viewer.

## Experiment capital

Approximately **$300** of discretionary experiment capital is available for bounded evidence-generating tests.

That is strategic capacity, not a spending target.

Default remains `$0` spend until a test has a clear hypothesis, maximum cost, free-data gap and continue/reject criterion.

## Using our shopper as a research tool

x402scan currently sells x402 ecosystem data through paid resources such as merchant lists/stats/transaction histories.

The observatory may implement an optional adapter that reuses the existing bounded shopper.

Real-money rules:

- dry-run/fixtures by default
- no automatic wallet funding
- no private keys in source/logs
- no execution without an explicit paid-execution flag
- per-call and per-session caps mandatory
- do not broaden network/wallet permissions silently
- any real-money research purchase still requires explicit owner approval

Building purchase capability is **not** authorization to spend.

## Product #2 qualification gate

No seller build begins until a candidate has written answers for:

1. observed demand
2. repeat behavior / buyer breadth
3. buy-vs-build advantage
4. current free + paid competition
5. lawful/reliable supply path
6. plausible unit economics
7. x402-lab-specific advantage
8. cheapest falsification test

If those answers are vague, do not build it.

## Existing technical assets

- Node.js + TypeScript + Express
- x402 v2 seller/payment middleware
- Base Sepolia public deployment
- Bazaar/discovery metadata
- Evidence Slice deterministic service
- bounded buyer + shopper gateway
- public-source/SSRF safety work
- tests/typecheck
- compatibility research

These are reusable infrastructure, not product-market fit.

## Current milestone

**Milestone 4.5D — Revealed-demand observatory / Product #2 discovery**, with **Milestone 4.5E — Kiroshi Optics** as the approved companion scanner after the Observatory gate.

## Progress

- [x] public repository
- [x] automated x402 settlement
- [x] public Base Sepolia seller
- [x] first public paid Evidence Slice transaction
- [x] machine-readable discovery metadata
- [x] bounded buyer/shopper gateway
- [x] product viability/profit gate
- [x] multiple weak product hypotheses rejected before large builds
- [x] Product #2 explicitly reset to unknown
- [x] Kiroshi Optics MVP scoped and approved after Observatory gate
- [ ] build machine-demand observatory
- [ ] capture normalized current market snapshot
- [ ] analyze buyer breadth/repeat/concentration
- [ ] create 3–5 evidence-grounded opportunity cards
- [ ] build first Kiroshi Optics scanner slice
- [ ] cheaply falsify the strongest candidate(s)
- [ ] select Product #2 only after one passes the gate
- [ ] first external paid use
- [ ] first repeat external buyer

## License

MIT
