# Product Discovery Round 4 — Revealed Demand Before Product #2

Status: **current product-discovery decision**

Date: **2026-08-24**

## Decision

**Product #2 is not selected.**

Do not force another product hypothesis into the slot simply because Codex can build it quickly.

The project has now rejected or downgraded several technically buildable ideas:

- Evidence Slice as the commercial business — weak buy-vs-build advantage
- Recruiting Pressure / Agency Opportunity — crowded current market
- automated Role Reality — weak against free/SMB alternatives and easy public-data replication
- Search Preflight as the primary service — plausible but frequently redundant with the customer's own recruiter
- Recruiting Agent Practitioner Eval — plausible specialist service, but currently closer to consulting/domain labor than a demonstrated x402-lab advantage

Practitioner Eval remains a **parked side hypothesis**, not the active engineering target.

The next task is to improve the quality of product discovery by observing **revealed machine purchasing behavior**.

## New active question

> **What are independent buyers already paying for repeatedly in machine commerce, why is buying rational compared with reproducing the capability, and where is there a gap x402-lab can credibly exploit?**

This question deliberately comes before another seller implementation.

## Why this is the right correction

AI coding has made implementation cheap enough that implementation is no longer proof of progress.

The project repeatedly found attractive ideas only after deeper research exposed:

- existing free substitutes
- established competitors
- weak buyer differentiation
- internal human substitutes
- commodity model/search/browser capability

The recurring failure was not engineering.

It was **choosing the product before sufficiently observing demand**.

## Current market observations — seed snapshot

These are research observations captured on 2026-08-24 and will move over time. Treat them as a seed dataset, not permanent truth.

### Overall x402scan ecosystem

Public x402scan showed roughly:

- ~13.3M transactions / 30 days
- ~$1.2M volume / 30 days
- ~22K buyers
- ~30K sellers

Raw headline counts are noisy and highly concentrated. They are context, not TAM.

### BlockRun

Observed approximately:

- ~8.0M transactions / 30 days
- ~625 buyers
- ~$196K volume

Capability: model/compute routing with payment built in.

Interpretation: strong transaction volume, but concentrated buyer count relative to calls. Compute/model access is a clearly purchased machine capability.

### StableEnrich

Observed approximately:

- ~53K transactions / 30 days
- ~501 buyers
- ~$1.6K volume

Capability: pay-per-request access to upstream services including enrichment, Exa, Firecrawl, Google Maps, Serper and related APIs without each buyer creating separate upstream accounts/credentials/subscriptions.

Interpretation: one of the clearest examples of **credential/access abstraction** plus useful upstream data producing broad buyer adoption.

### People Data Labs x402 access

Observed approximately:

- ~1.15K transactions / 30 days
- 7 buyers
- ~$29 volume

Interpretation: extremely strong repeat intensity among a small buyer set. This is different evidence from broad adoption and should be modeled separately.

### x402scan's own paid data API

Observed approximately:

- ~1.0K transactions / 30 days
- 51 buyers
- ~$11 volume

Capabilities include merchant lists/stats/transactions, facilitator data and resource/origin data at roughly $0.01/call.

Interpretation: ecosystem intelligence itself is purchased and can be used as a research primitive.

### 402utils

Observed approximately:

- 218 transactions / 30 days
- 22 buyers
- <$1 total volume
- ~50 utility endpoints

Interpretation: some demand exists for deterministic utility infrastructure, but endpoint count does not create demand by itself.

### AgenticFi

Observed approximately:

- 96 transactions / 30 days
- 34 buyers

Interpretation: low repeat intensity but relatively broad unique-buyer count for its transaction volume; useful contrast with a few-buyer/high-repeat service.

### Generic judgment/search/scrape utility catalog

A researched seller offering cheap research/search/scrape/classification-style utilities showed:

- 0 transactions
- 0 buyers

Interpretation: generic model/search-like convenience can be commercially invisible even at tiny prices.

## Key metrics the observatory must separate

Do not reduce market behavior to one score.

Track independently when data permits:

### Demand breadth

- unique buyers
- unique buyers per time window
- new buyers between snapshots

### Repeat intensity

- transactions / unique buyer
- repeat-buyer share when transaction-level data permits
- calls per returning buyer

### Economic intensity

- total volume
- volume / buyer
- average transaction value
- median transaction value when possible

### Buyer concentration

- largest buyer share
- top-3 / top-5 buyer share
- one-buyer/high-volume patterns

A service with 100,000 calls from one buyer is not the same market signal as 1,000 calls from 500 buyers.

### Buyer breadth across sellers

When observable:

- number of sellers purchased from per buyer
- buyers paying multiple independent sellers
- category combinations purchased by the same buyer

Cross-seller shoppers are particularly valuable evidence because they behave more like actual procurement agents than a single hard-wired internal client.

### Product breadth

- number of resources/endpoints
- resource categories/tags
- whether activity concentrates in a small subset when resource-level evidence exists

Large catalogs with weak buyers are negative evidence against “more endpoints = growth.”

### Recency / momentum

Across saved snapshots:

- buyer growth
- transaction growth
- volume growth
- new/removed resources
- price changes where observable

One snapshot cannot prove momentum.

## Qualitative classification

Metrics are not enough. For each interesting seller/capability, record manually reviewed fields:

- what is actually being purchased?
- why can the buyer not trivially do it itself?
- what upstream resource or external action creates value?
- is the capability scarce, gated, expensive, stateful, real-time or operational?
- what are plausible substitutes?
- what does the seller appear to abstract: credentials, billing, orchestration, data rights, compute, infrastructure, trust, external action, latency, specialist judgment?
- how replicable is it for x402-lab?
- what would our legitimate advantage be?

Do not let an LLM automatically turn descriptions into confident market conclusions without human review.

## High-interest product archetypes

Current evidence suggests prioritizing investigation of:

1. **credential/access brokers** — useful upstream APIs without separate accounts/subscriptions
2. **scarce/fresh data** — information an agent cannot recreate from its model context
3. **compute/model access** — inference or expensive compute
4. **browser/document infrastructure** — rendering, extraction, PDFs, screenshots, crawl jobs
5. **real external actions** — calls, messages, transactions, execution, booking, etc.
6. **agent/payment infrastructure** — RPC, routing, transaction preflight, identity, settlement, risk
7. **specialist high-value analysis** — only where inputs/knowledge are genuinely hard to reproduce

These are research categories, not pre-approved products.

## Explicit anti-patterns

Treat these as high-risk until evidence says otherwise:

- generic summarization
- generic classification
- generic web research
- generic “AI judgment”
- catalogs created before demand
- public-data wrappers with free substitutes
- tiny price used as a substitute for utility
- products whose only differentiation is “uses x402”

## Opportunity qualification card

No Product #2 build begins until a candidate has a written card answering:

### Demand

- What observed buyer behavior supports this need?
- How many independent buyers are represented?
- Is repeat behavior visible?

### Buy vs build

- Why is purchase rational for a competent agent?
- What cannot be reproduced with ordinary model/search/browser/tool capability?

### Competition

- What free and paid substitutes exist right now?
- Why would the buyer choose us?

### Supply

- Where do we obtain the scarce capability/data/action legally and reliably?
- What does it cost per fulfillment?

### Economics

- plausible price
- variable cost
- contribution margin
- expected support/ops burden

### Advantage

- What specific advantage can x402-lab develop?
- Does use compound into data, trust, integration, history or another asset?

### Cheap falsification

- What is the cheapest test that would prove this idea is weak before full implementation?

If these answers are vague, do not build the seller.

## Market Observatory strategy

Build an **internal Product Discovery / Market Observatory** before Product #2.

It is research tooling, not the business.

The observatory should:

1. ingest normalized merchant/resource/transaction snapshots
2. support fixture/manual import first
3. optionally use x402scan's paid market-data endpoints through the existing bounded shopper infrastructure
4. preserve raw source snapshots separately from derived metrics
5. compute breadth/repeat/economic/concentration metrics
6. compare snapshots over time
7. surface interesting merchants/buyers for human review
8. generate opportunity-card scaffolds, not automatic product verdicts

No frontend/database is required for the first slice.

JSON/CSV + Markdown reports are sufficient.

## x402scan as a research supplier

x402scan currently exposes paid x402 resources including approximately:

- `/api/x402/merchants`
- `/api/x402/merchants/{address}/stats`
- `/api/x402/merchants/{address}/transactions`
- `/api/x402/facilitators`
- `/api/x402/facilitators/stats`
- `/api/x402/origins/{id}/resources`

Observed price is roughly `$0.01` per paid call.

This is a particularly useful experiment because x402-lab can use its existing buyer/shopper architecture to purchase machine-economy research from another x402 seller.

### Real-money safety

Do **not** execute a mainnet research purchase merely because the adapter exists.

- fixture/dry-run is default
- no private key committed
- no automatic wallet funding
- real-money execution requires explicit owner approval
- per-payment and session spend caps are mandatory
- record every research purchase and result

Suggested initial live research budget after explicit approval:

- max `$0.02` per payment
- max `$0.25` per collection session

These are proposed caps, not authorization to spend.

## Success condition for the observatory

The observatory succeeds if it materially improves product selection, for example by producing:

- a repeatable current market snapshot
- 10–20 manually reviewed active sellers across different demand shapes
- at least 3 examples of broad independent buyer demand
- at least 3 examples of concentrated repeat demand
- at least 3 zero/weak-demand anti-examples
- at least 3 cross-seller buyer patterns if transaction data permits
- 3–5 opportunity cards grounded in revealed demand

The observatory does **not** succeed merely because it downloads data or creates pretty rankings.

## Product #2 gate

Product #2 is selected only when one candidate has:

1. observed external demand or a very strong adjacent demand analogue
2. a clear buy-vs-build advantage
3. a current competition/free-substitute review
4. a lawful/reliable supply path
5. plausible positive unit economics
6. an advantage x402-lab can actually develop
7. a cheap falsification test

Until then:

> **No Product #2 is a valid and preferred state over a weak Product #2.**
