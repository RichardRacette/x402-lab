# x402-lab Roadmap

Rules:

> **Earn complexity. Observe demand before building supply.**

Current governing docs:

- `PRODUCT-THESIS.md`
- `PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`
- `DIRECTIVE-ALIGNMENT-2026-08-24.md`
- `CODEX-SESSION-PLAN-2026-08-24.md`
- `KIROSHI-OPTICS.md`
- `KIROSHI-OPTICS-MVP.md`

Older product-discovery files are historical records, not current implementation instructions.

## Milestone 0 — Public seed ✅

Public repository established.

## Milestone 1 — First automated x402 transaction ✅

Proven:

```text
buyer → 402 → signed payment → settlement → retry → protected result
```

## Milestone 2 — Initial product exploration ✅

`/analyze-job` proved the payment loop. Evidence Slice became the cleaner agent-native shelf experiment.

## Milestone 3 — Evidence Slice V0 ✅

Deterministic evidence extraction, provenance, URL safety, tests and paid Base Sepolia flow.

## Milestone 4 — Public machine-payable seller proof ✅

Delivered:

- Railway deployment
- x402 V2 seller
- first public paid Evidence Slice transaction
- machine-readable discovery/Bazaar metadata
- bounded buyer + shopper gateway

This proved payment capability, not demand.

## Milestone 4.5 — Product viability discovery 🚧

### Evidence Slice

**Status:** keep as protocol proof; weak commercial confidence.

### Recruiting Pressure / Agency Opportunity

**Status:** rejected before implementation due current competition.

### Automated Role Reality

**Status:** rejected before implementation after free/SMB competitive audit and weak buy-vs-build economics.

### Search Preflight

**Status:** parked service concept.

### Recruiting Agent Practitioner Eval

**Status:** parked side hypothesis.

It may have consulting/service value, but it is not currently strong enough to be the project's master plan.

### Product #2

**Status:** **unknown by design.**

No candidate is entitled to implementation because previous ideas failed.

## Milestone 4.5D — Machine Demand Observatory 🚧

### Goal

Improve product selection using revealed machine purchasing behavior.

### Engineering task

Build internal observatory on:

`milestone-4-5-machine-demand-observatory`

Required first-slice outputs:

- provider-neutral merchant/resource/transaction snapshot schemas
- deterministic fixture provider
- buyer breadth metrics
- repeat-intensity metrics
- economic-intensity metrics
- buyer-concentration metrics where transaction data permits
- cross-seller shopper detection where data permits
- snapshot comparison
- descriptive demand-shape flags
- human-editable qualitative review records
- opportunity-card scaffolds
- JSON + Markdown reports
- tests/typecheck
- optional x402scan paid-data adapter behind strict dry-run/spend controls

### Pass gate

The observatory must reveal something more useful than manually browsing a leaderboard.

Prefer:

- clear distinction between broad adoption and one-buyer/high-repeat behavior
- useful cross-seller buyer patterns
- negative examples showing large catalogs with weak demand
- market changes visible across snapshots
- faster creation of disciplined opportunity cards

Reject/refactor if the output is merely prettier x402scan rankings.

### Discovery-capital posture

Approximately `$300` of experiment capital is available, but default remains `$0` spend.

Capital may support bounded evidence-generating tests only after the hypothesis, max cost, free-data gap and continue/reject criteria are explicit.

UI polish and infrastructure theater are not approved uses.

## Milestone 4.5E — Kiroshi Optics companion scanner 🔓

**Status:** active companion project; implementation authorized after the minimal Observatory core passes.

Issue: **#16**.

Goal:

> turn Observatory exports into a fast local research scanner without creating another data architecture.

First slice:

- MARKET SCAN
- TARGET SCAN
- OPPORTUNITY QUEUE when card data exist
- BUYER TRACE only when transaction-level data genuinely support it
- source/window/methodology/provenance always visible
- original futuristic optical-scanner styling
- no single opportunity score

Constraints:

- read-only
- local
- no new providers
- no wallet/payment access
- no database/auth/backend
- prefer existing Node/TypeScript + vanilla HTML/CSS/TypeScript
- `$0` incremental paid infrastructure
- initial implementation roughly `30–45` Codex minutes

Kiroshi succeeds only if it makes the same evidence faster to interpret than raw JSON/Markdown.

If it is merely cool, keep it small.

## Milestone 4.6 — Current market snapshot

Capture or safely import a normalized current snapshot.

Target initial review set:

- 10–20 active merchants across different demand shapes
- >=3 broad buyer examples
- >=3 concentrated repeat examples
- >=3 low/zero-demand negative controls
- cross-seller buyer examples where data permits

Every snapshot must retain source/window/timestamp limitations.

## Milestone 4.7 — Opportunity queue

Create 3–5 **evidence-grounded opportunity cards**.

Each card must answer:

1. observed demand
2. buyer breadth / repeat intensity
3. concentration caveat
4. buy-vs-build reason
5. current free + paid substitutes
6. lawful/reliable supply path
7. plausible price + cost + contribution margin
8. x402-lab-specific advantage
9. cheapest falsification test

Cards begin as `UNREVIEWED` or `RESEARCH`.

Software does not promote them automatically.

## Milestone 4.8 — Cheap falsification sprint

Take the strongest candidate(s) and run the cheapest serious test before seller implementation.

Possible tests may include:

- manual buyer interviews
- a one-off concierge fulfillment
- upstream access/cost test
- mock discovery listing
- request-for-interest
- a tiny local prototype
- direct comparison against current substitutes

The falsification method depends on the product.

Exit condition:

> one candidate survives a realistic attempt to disprove its value.

## Milestone 5 — Select and build Product #2 minimally

Only now select Product #2.

Required before implementation:

- demand evidence
- buy-vs-build advantage
- competition review
- supply/data rights
- unit economics
- advantage hypothesis
- falsification result

Rules:

- one product, not a catalog
- smallest useful contract
- reuse existing seller/payment infrastructure
- keep product logic independent of payment frontage
- instrument fulfillment cost and failure behavior
- no mainnet just because the code works

## Milestone 6 — External purchase

Exit condition:

> an external buyer pays for Product #2 for a genuinely useful task.

A first purchase proves access/willingness, not retention.

## Milestone 7 — Repeat external buyer

Exit condition:

> the same external buyer purchases Product #2 again because the need recurred.

Track:

- buyer identity/address where appropriate
- repeat interval
- calls per buyer
- contribution margin
- concentration
- support/ops burden

## Milestone 8 — Broaden distribution only where earned

Possible additions:

- stronger OpenAPI/discovery
- MCP
- MPP
- additional payment rails
- compatibility frontage for older clients
- conventional billing

Distribution work follows product evidence.

## Milestone 9 — First profitable mainnet sales

Before mainnet require:

- proven utility
- intentional real-money price
- bounded variable cost
- production wallet/credential separation
- threat-model review
- accounting/transaction logging
- appropriate data/supply rights

Exit condition:

> real external sales with positive contribution margin.

## Milestone 10 — Repeatable profit or stop

Evaluate:

- repeat-buyer rate
- unique buyer growth
- calls per returning buyer
- revenue per buyer
- buyer concentration
- contribution margin
- support burden
- upstream dependency risk
- distribution conversion
- payment failure rate
- whether the capability is becoming embedded in persistent workflows

Possible outcomes:

1. double down
2. negotiate better upstream economics
3. add adjacent products requested by real buyers
4. create a protocol-neutral commercial brand
5. pivot to a better observed bottleneck
6. stop commercial investment

## Protocol posture

x402 remains the primary laboratory, not the permanent business identity.

The next product must deserve distribution before the project spends significant time optimizing distribution.