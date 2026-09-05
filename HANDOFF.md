# x402-lab Handoff

Verified: 2026-09-05

## Mission and strategic boundary

x402-lab is a bounded exploration of machine commerce: learn by operating a real paid endpoint,
a bounded buyer, and evidence-oriented market tooling. It is not currently a primary product bet
and must not displace Talent Bench or direct career work.

The current rule is observe demand before building supply. Product #2 is intentionally unknown.
No repository artifact authorizes a mainnet transaction, a live Buyer Trace purchase, wallet
funding, or meaningful spend.

## What works

- A Node.js/TypeScript/Express seller runs on Railway.
- The deployment exposes the legacy POST /analyze-job endpoint at $0.01 test USDC.
- Evidence Slice exposes POST /extract-evidence at $0.003 test USDC.
- Both seller routes use x402 v2 on Base Sepolia, chain eip155:84532.
- Evidence Slice validates public URLs, defends against SSRF/redirect abuse, extracts bounded
  text, ranks passages deterministically, and returns provenance plus a content hash.
- The bounded buyer/shopper gateway enforces endpoint, chain, intent, and spending controls.
- Bazaar/discovery metadata is present.
- Machine Demand Observatory normalizes provider evidence, computes descriptive metrics,
  preserves unknown states, compares snapshots, and emits Markdown/JSON.
- The current checked-in Observatory report contains five unreviewed opportunity cards.
- Kiroshi Optics renders a local read-only scanner over Observatory exports.
- Buyer Trace preflight exists and cannot execute a payment.

The deployment health endpoint returned HTTP 200 on 2026-09-05 and reported both paid routes on
Base Sepolia. An unpaid synthetic POST to /extract-evidence returned the expected HTTP 402
challenge. No payment was attempted.

## Deployment and payment flow

Runtime shape:

1. Railway starts src/server.ts through the repository Node runtime.
2. Express publishes health, discovery, and paid routes.
3. x402 middleware returns a payment challenge for an unpaid request.
4. A compatible buyer signs and retries against the Base Sepolia facilitator.
5. After verified testnet settlement, the protected handler returns its result.

Configuration is supplied outside Git. X402_PAY_TO is required for the receiving address; buyer
wallet material and any provider credentials must remain in ignored environment configuration.
The code pins the network to Base Sepolia and uses the x402.org facilitator. Treat a change to the
network, recipient, price, facilitator, or wallet permissions as a separately reviewed payment
change.

The repository contains first-transaction evidence for /analyze-job and a successful public
testnet Evidence Slice transaction. These prove the protocol loop, not external commercial demand.

## Run and test

Requirements: Node.js 22 or newer and npm.

    npm ci
    npm run typecheck
    npm test
    npm run dev

On 2026-09-05 typecheck passed and 87 tests passed. The exact default-branch GitHub CI run was also
green. In the handoff sandbox, the tsx CLI could not create its temporary Unix control socket, so
the equivalent Node test runner command was used:

    node --import tsx --test src/**/*.test.ts

That environment limitation is not a repository failure; canonical npm test remains the project
contract and passes in GitHub Actions.

## Completed experiments

- Seller, buyer, and public Base Sepolia payment loop.
- Railway deployment and proxy-scheme correction.
- Evidence Slice V0 plus discovery metadata.
- Bounded shopper gateway and agent compatibility work.
- Product viability and positive-sum qualification gates.
- Machine Demand Observatory and a normalized live snapshot.
- Five evidence-grounded opportunity cards, intentionally unreviewed.
- Kiroshi Optics Mk.1.2 scanner and Buyer Trace preflight.

## Rejected or downgraded directions

Preserve these as learning; do not quietly restart them:

- Evidence Slice as the standalone business: weak buy-versus-build advantage.
- Recruiting Pressure / Agency Opportunity: crowded market.
- Automated Role Reality: strong low-cost substitutes and easy replication.
- Search Preflight: often redundant with recruiter expertise.
- Recruiting Agent Practitioner Eval: closer to consulting/domain labor than a demonstrated
  machine-commerce advantage.

Older product documents are historical discovery evidence unless a current governing document
explicitly reactivates them.

## Preserved unfinished work

- feature/retrieval-provider-evaluation: provider seam, ADR, and tests for retrieval evaluation.
- kiroshi-native-delegation-v0: unique native-delegation test work.
- kiroshi-unlazy-multitree-payto-integrity-v0: unique agent-behavior and pay-to integrity work.

These branches are intentionally not merged merely to reduce branch count. Inspect and rebase them
before continuation because main has moved.

Issue #27 is the only current engineering follow-up: implement a single approval-gated Buyer Trace
adapter with deterministic drift and budget tests. The issue authorizes implementation and
fixtures only. Its live-spend ceiling is $0.00.

## What remains unknown

- No external paid use or repeat external buyer has been demonstrated.
- Product #2 has not passed the qualification gate.
- Current Observatory transaction coverage does not establish full-market buyer concentration or
  repeat behavior.
- The legacy /analyze-job route remains deployed even though Evidence Slice is the cleaner
  protocol fixture; decide deliberately whether to retain or retire it.
- A live Buyer Trace purchase has never been run and is not authorized by this handoff.

## Do not rebuild or expand

- Do not select Product #2 by scoring the current opportunity cards.
- Do not add a database, autonomous recommendation engine, broad scraper, or new seller simply to
  make progress visible.
- Do not fund a wallet, switch to Base mainnet, execute Issue #27, or purchase data without a new
  explicit owner approval.
- Do not treat testnet settlement as product-market fit.
- Do not expand Kiroshi into an offensive scanner or a separate commercial product.

## Next sensible experiment

If x402 work is selected after higher-priority work, implement only Issue #27's dry-run execution
adapter and its deterministic drift/budget tests, then stop before the documented live command.
After review, use the cheapest approved falsification test against one strong opportunity card.
A valid outcome is that no Product #2 survives.
