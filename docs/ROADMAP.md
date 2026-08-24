# x402-lab roadmap

The rule: **earn complexity**.

The governing product direction is defined in [`PRODUCT-THESIS.md`](PRODUCT-THESIS.md).

The current commercial correction is defined in [`PRODUCT-VIABILITY-2026-08-24.md`](PRODUCT-VIABILITY-2026-08-24.md).

Evidence Slice remains documented in [`EVIDENCE-SLICE-V0.md`](EVIDENCE-SLICE-V0.md), but is now treated primarily as the protocol/payment proof rather than sufficient evidence of a viable commercial product.

## Milestone 0 — Public seed ✅

Goal: establish a small, legible public repository.

Exit condition: repository is public and clonable.

**Status: complete.**

## Milestone 1 — First testnet x402 transaction ✅

Goal: prove the complete payment loop locally.

Proven flow:

```text
buyer → 402 → signed payment → settlement → automatic retry → protected result
```

Exit condition: a buyer program paid a seller program and received the protected result.

**Status: complete.** See [`FIRST-TRANSACTION.md`](FIRST-TRANSACTION.md).

## Milestone 2 — Product thesis and first recurring X ✅

Goal: move from “x402 works” to an initial product hypothesis.

Selected initial hypothesis: **Evidence Slice**.

> Give x402-lab a public URL and a question. Return the few passages on that page that actually contain evidence relevant to the question, packaged as clean JSON.

**Status: complete as a hypothesis-selection milestone.** Subsequent market research weakened the commercial case for Evidence Slice itself; see the product viability addendum.

## Milestone 3 — Build Evidence Slice V0 locally ✅

Goal: make the selected shelf item work safely before exposing it publicly.

Delivered:

- `POST /extract-evidence`
- one public URL + one question
- deterministic lexical ranking
- source metadata + SHA-256 content hash
- bounded public-URL/SSRF safety controls
- Base Sepolia paid flow
- typecheck/tests
- local paid x402 transaction

**Status: complete.**

## Milestone 4 — Put Evidence Slice on the public testnet shelf ✅

Goal: prove x402-lab can operate a real public machine-payable service.

Delivered:

- public Railway deployment
- Base Sepolia x402 V2 payment flow
- first public paid Evidence Slice transaction
- machine-readable Bazaar metadata
- stable request/response contract
- bounded buyer and shopper gateway

**Status: complete.**

What this proved:

> x402-lab can expose, sell, settle, and fulfill a public machine-to-machine service.

What this did **not** prove:

> an external agent has a sufficiently strong reason to buy Evidence Slice rather than reproduce the capability itself.

## Milestone 4.5 — Product viability & profit gate 🚧

Goal: identify a product worth testing commercially **before** spending significant engineering time on Product #2.

Governing document: [`PRODUCT-VIABILITY-2026-08-24.md`](PRODUCT-VIABILITY-2026-08-24.md).

### Market findings already incorporated

Observed x402 demand is materially stronger for:

- credential-gated or licensed data access
- B2B/person/company/job enrichment
- browser/PDF/visual infrastructure
- specialized high-value research
- agent-commerce data/infrastructure

Observed demand is much weaker for many broad catalogs of generic text/AI utilities.

### Current leading opportunity family

**Data/access + domain-specific orchestration**, with workforce/company/hiring intelligence as the leading domain to investigate because it combines observed paid demand with founder recruiting-domain knowledge.

No product has been selected yet.

### Required Product #2 proposal

Before Codex builds Product #2, document:

- buyer
- recurring job
- why buy instead of build
- exact input/output contract
- upstream dependencies
- licensing basis
- expected variable cost
- proposed price
- contribution margin
- existing demand evidence
- discovery channel
- falsification condition
- smallest possible implementation

### Exit condition

Exactly one Product #2 candidate passes the viability gate with:

1. strong buy-vs-build advantage,
2. repeated need,
3. observable external demand evidence,
4. a lawful/licensable data or infrastructure path,
5. credible positive unit economics,
6. a concrete path to an external payment-capable buyer.

Until this exit condition is met, more generic paid endpoints are explicitly out of scope.

## Milestone 5 — Build and expose Product #2 minimally

Goal: test the winning commercial hypothesis with the smallest implementation that can produce real evidence.

Rules:

- one product, not a catalog
- reuse the existing seller/payment stack
- keep product logic independent of payment-protocol frontage
- stable structured contract
- instrument variable fulfillment cost
- instrument success/failure/retry behavior
- publish strong Bazaar metadata
- list/register on relevant x402 discovery surfaces
- preserve Evidence Slice as a test fixture rather than expanding it

Exit condition:

> an external machine buyer successfully discovers and purchases Product #2 for a genuinely useful task.

A first purchase proves access, not product-market fit.

## Milestone 6 — First external repeat buyer

Goal: prove utility rather than novelty.

- observe whether the external buyer returns
- preserve stable price/input/output contracts unless evidence requires change
- fix only friction exposed by real integrations
- track contribution margin, not only transaction count

Exit condition:

> the same external agent purchases Product #2 more than once without a human explicitly directing each individual purchase.

This is the first strong product signal.

## Milestone 7 — Improve access only where earned

Goal: make a proven capability easier for agents to discover, invoke, and pay for.

Possible additions only when justified by observed friction:

- OpenAPI improvements
- stronger Bazaar/discovery metadata
- MCP exposure
- explicit health/reliability signals
- MPP-native seller frontage
- additional supported payment schemes such as `upto`
- frozen-client V1/V2 compatibility frontage where representative testing proves a meaningful buyer class is excluded

Protocol stance:

- x402 remains the current primary implementation and laboratory
- the commercial brand should not be tied permanently to x402
- MPP and future machine-payment rails may become additional front doors to the same product logic

Exit condition: an access change measurably reduces integration, payment, compatibility, or decision cost for external agents.

## Milestone 8 — Improve Product #2 only where earned

Goal: increase usefulness without losing the low-friction contract.

Potential upgrades must be earned by buyer behavior or failure evidence.

Avoid databases, dashboards, broad integrations, and model dependencies unless measured usage justifies them.

Exit condition: measured usefulness, repeat usage, or contribution margin improves without materially increasing buyer friction.

## Milestone 9 — First profitable mainnet sales

Goal: exchange real value for real utility with positive unit economics.

Before switching:

- Product #2 has a clear reason to exist
- external testnet buyer behavior supports the hypothesis
- upstream licensing/use rights are appropriate
- endpoint threat model is reviewed
- request/rate limits are intentional
- seller wallet and credentials are dedicated appropriately
- production facilitator is chosen intentionally
- pricing exceeds expected variable cost by an intentional margin
- transaction logging and accounting implications are understood

Then:

- production payment rail
- real external buyer
- real fulfilled utility
- record sale price, variable cost, and contribution margin

Exit condition:

> x402-lab completes real external sales where each fulfilled transaction has positive contribution margin.

The objective is not merely to move real USDC.

## Milestone 10 — Repeatable profit or kill/pivot decision

Goal: determine whether this is a business rather than a technically successful experiment.

Evaluate:

- repeat-buyer rate
- calls per returning buyer
- buyer concentration
- gross contribution margin
- support/ops burden
- upstream dependency risk
- discovery conversion
- protocol/payment failure rate
- whether buyers integrate the capability into persistent workflows

Possible outcomes:

1. double down on the winning paid capability
2. add closely adjacent products requested by existing buyers
3. negotiate better upstream economics/reseller terms
4. create a protocol-neutral commercial brand around the validated product family
5. pivot to a newly exposed bottleneck
6. stop commercial investment if demand remains weak

No pre-commitment to becoming a generic marketplace, facilitator, router, ATS, or API catalog.

## Ecosystem participation

Where it improves discovery, learning, credibility, or buyer access:

- participate in x402 community channels
- test Coinbase Bazaar discovery
- test external buyers such as Amazon Bedrock AgentCore payment-capable agents
- evaluate Cloudflare x402/MPP access paths
- attend relevant working-group/TSC sessions when useful
- submit the project to appropriate ecosystem listings
- publish concise demonstrations and measured findings

The preferred outcome remains discovering a place where the project becomes the **path of least resistance for a recurring machine need — and gets paid profitably for it**.
