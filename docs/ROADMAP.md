# x402-lab roadmap

The rule: **earn complexity**.

The governing product direction is defined in [`PRODUCT-THESIS.md`](PRODUCT-THESIS.md).

The commercial correction is defined in [`PRODUCT-VIABILITY-2026-08-24.md`](PRODUCT-VIABILITY-2026-08-24.md).

The current product-discovery decision is defined in [`PRODUCT-DISCOVERY-ROUND-2-2026-08-24.md`](PRODUCT-DISCOVERY-ROUND-2-2026-08-24.md).

Evidence Slice remains documented in [`EVIDENCE-SLICE-V0.md`](EVIDENCE-SLICE-V0.md), but is now treated primarily as the protocol/payment proof rather than sufficient evidence of a viable commercial product.

## Milestone 0 — Public seed ✅

Goal: establish a small, legible public repository.

**Status: complete.**

## Milestone 1 — First testnet x402 transaction ✅

Goal: prove the complete payment loop.

Proven flow:

```text
buyer → 402 → signed payment → settlement → automatic retry → protected result
```

**Status: complete.** See [`FIRST-TRANSACTION.md`](FIRST-TRANSACTION.md).

## Milestone 2 — Initial product hypothesis ✅

Selected initial hypothesis: **Evidence Slice**.

**Status: complete as a hypothesis-selection milestone.** Subsequent research weakened its commercial case.

## Milestone 3 — Evidence Slice V0 ✅

Delivered:

- deterministic evidence extraction
- bounded public-URL/SSRF safety
- Base Sepolia paid flow
- tests/typecheck

**Status: complete.**

## Milestone 4 — Public machine-payable shelf proof ✅

Delivered:

- Railway deployment
- public Base Sepolia x402 V2 seller
- first public paid Evidence Slice transaction
- Bazaar metadata
- bounded buyer + shopper gateway

What this proved:

> x402-lab can expose, sell, settle, and fulfill a public machine-to-machine service.

What it did not prove:

> the product is worth buying repeatedly.

## Milestone 4.5 — Product viability & profit gate 🚧

Goal: identify a product worth testing commercially **before** spending significant engineering time on Product #2.

### Discovery result A — Evidence Slice

**Commercial confidence: weak.**

Keep it stable as protocol proof. Do not rescue it with features.

### Discovery result B — Agency Opportunity / Recruiting Pressure

**Status: rejected before implementation.**

Reason: deeper competitive research found substantial overlap with Reqbeat, Signalbase, Recruitcha and adjacent hiring-signal products. The original implementation brief is intentionally marked HOLD.

The project should treat this as evidence that the viability gate is working.

### Discovery result C — Role Reality Check

**Status: active validation candidate.**

Working proposition:

> Give us a U.S. role, location, proposed compensation and key constraints. Return a source-backed market reality packet showing how the req compares with the labor market and what should be calibrated before meaningful sourcing begins.

Why it is being tested:

- closer to the economic decision of whether/how to spend recruiter time on a requisition
- incumbents validate the need for fillability/talent-market intelligence
- possible access-model wedge: one role, one transparent price, no enterprise talent-intelligence subscription for the buyer
- CareerOneStop/USDOL provides an open-data path for a cheap U.S. prototype
- no candidate PII required
- current x402 stack can expose it with little new infrastructure if it proves useful

Important limitation:

> The open-data V0 is not a moat. Its first possible advantage is product packaging + access friction. Stronger defensibility must be earned later through better data, outcome calibration, workflow integration, or proprietary benchmarks.

Governing contract: [`ROLE-REALITY-CHECK-V0.md`](ROLE-REALITY-CHECK-V0.md).

Active implementation/validation issue: **#13**.

### Milestone 4.5B validation sequence

1. build provider-neutral market-fact types and deterministic decision rules
2. test with synthetic fixtures
3. add CareerOneStop behind optional provider credentials
4. generate real sample packets if provider access is available
5. manually review whether the packet is materially better than a salary lookup
6. show useful samples to external recruiters
7. only then expose the new product as a paid Base Sepolia endpoint

### Hard stop

If Role Reality is basically a dressed-up salary lookup, reject it.

Do not add an LLM, candidate scraping, a database, or an expensive data vendor merely to rescue the idea.

### Milestone 4.5 exit condition

Exactly one Product #2 candidate must demonstrate:

1. credible buy-vs-build advantage,
2. recurring workflow value,
3. lawful/licensable data path,
4. healthy unit economics,
5. useful real sample output,
6. external user interest,
7. concrete path to a payment-capable buyer.

Until then, more generic paid endpoints are out of scope.

## Milestone 5 — Build and expose Product #2 minimally

Goal: test the winning commercial hypothesis with the smallest implementation that can produce real evidence.

Rules:

- one product, not a catalog
- reuse existing seller/payment stack
- keep product logic independent of payment-protocol frontage
- stable structured contract
- instrument fulfillment cost and latency
- publish strong machine-readable discovery metadata
- preserve Evidence Slice as a test fixture rather than expanding it

Exit condition:

> an external machine buyer successfully purchases Product #2 for a genuinely useful task.

A first purchase proves access, not product-market fit.

## Milestone 6 — First external repeat buyer

Goal: prove utility rather than novelty.

Exit condition:

> the same external buyer purchases Product #2 more than once without a human explicitly directing each individual purchase.

Track contribution margin, not just transaction count.

## Milestone 7 — Improve access only where earned

Possible additions only when observed friction justifies them:

- OpenAPI improvements
- stronger Bazaar/discovery metadata
- MCP exposure
- MPP-native frontage
- health/reliability signals
- additional payment schemes
- frozen-client V1/V2 compatibility frontage

Protocol stance:

- x402 remains the primary laboratory
- the eventual commercial brand must be protocol-neutral
- alternative payment rails should be additional doors to the same useful product, not separate product logic

## Milestone 8 — Improve Product #2 only where earned

Avoid databases, dashboards, broad integrations, model dependencies and premium data until buyer behavior or product failure evidence justifies them.

## Milestone 9 — First profitable mainnet sales

Before real-money launch require:

- proven utility
- external testnet interest
- appropriate data rights
- bounded costs
- intentional pricing
- production wallet/credential separation
- threat-model review
- transaction/accounting logging

Exit condition:

> real external sales with positive contribution margin per fulfilled transaction.

## Milestone 10 — Repeatable profit or kill/pivot decision

Evaluate:

- repeat-buyer rate
- calls per returning buyer
- buyer concentration
- contribution margin
- support/ops burden
- upstream dependency risk
- discovery conversion
- payment failure rate
- whether buyers integrate the capability into persistent workflows

Possible outcomes:

1. double down
2. add adjacent products requested by buyers
3. negotiate better upstream economics
4. create a protocol-neutral commercial brand
5. pivot to a newly exposed bottleneck
6. stop commercial investment if demand remains weak

No pre-commitment to a marketplace, facilitator, router, ATS, or giant API catalog.

## Ecosystem participation

Where it improves discovery, learning, credibility, or buyer access:

- test Coinbase Bazaar discovery
- test payment-capable AgentCore buyers
- evaluate Cloudflare x402/MPP access paths
- participate in relevant x402 working-group/community activity
- list only products that have earned public exposure
- publish concise demonstrations and measured findings

The preferred outcome remains becoming the **path of least resistance for a recurring machine need — and getting paid profitably for it**.
