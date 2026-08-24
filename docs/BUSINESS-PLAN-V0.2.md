# Business Plan v0.2 — Profit Before Protocol

Status: **current working commercial plan**

Date: **2026-08-24**

This version supersedes `BUSINESS-PLAN-V0.1.md` after deeper competitive research invalidated the company-level Agency Opportunity / Recruiting Pressure wedge.

The business is **not** "an x402 company."

The goal is to create a genuinely useful, profitable recruiting/labor-market intelligence product that can be purchased through x402 and other channels with unusually low friction.

## Executive direction

### Keep x402-lab as the public R&D asset

The repository preserves proof that the project can:

- sell a machine-readable service
- accept x402 payment
- settle and fulfill a request
- advertise through machine-readable discovery
- operate bounded buyer/shopper controls
- test protocol compatibility

Do not rename this repo.

### Build the commercial product protocol-neutral

If a product earns a real launch, it should be usable through some combination of:

- x402
- MPP
- MCP
- conventional API credentials
- prepaid credits/card billing
- partner/embedded integrations

Payment technology is a distribution advantage, not the customer's reason to buy.

### Current product candidate: Role Reality Check

Working proposition:

> **Market-ground a U.S. requisition before you burn sourcing time.**

Input:

- role title
- location
- proposed compensation
- a few important constraints

Output:

- occupation mapping
- local wage context
- current job-market activity
- employment/outlook context
- relevant alternate titles/skills where supported
- explainable friction flags
- concrete intake/calibration questions
- source provenance and limitations

The initial product is not a prediction engine and should not claim a proprietary fillability score.

## The customer problem

Recruiting work becomes expensive before a hire is made.

A recruiter can spend hours on:

- intake clarification
- market research
- compensation sanity checks
- title translation
- sourcing-strategy design
- search execution
- client/hiring-manager recalibration

For agency contingent/direct-hire work, a search can consume meaningful recruiter capacity and still generate no placement fee.

For internal recruiting, an unrealistic req can consume sourcing/interview capacity and extend time-to-fill.

The product decision is therefore:

> **Before search begins, is there enough objective market evidence to identify obvious friction and improve the intake conversation?**

## Why buyers might pay instead of build

CareerOneStop/USDOL data are open, so raw data access alone is not a moat.

The initial buy-vs-build case is convenience and orchestration:

- buyer does not need CareerOneStop credentials
- buyer does not need to resolve role text to labor-market taxonomy
- buyer does not need to learn multiple provider endpoints
- buyer gets one stable recruiter-oriented contract
- buyer gets deterministic interpretation instead of raw tables
- buyer gets source/vintage metadata
- buyer can invoke it per role with no enterprise talent-intelligence contract

The economic question is whether that convenience is worth $0.50, $1, $2, or more often enough to create repeat use.

## Competitive position

### What we are not claiming

Enterprise products already validate sophisticated talent-market/fillability intelligence:

- Lightcast
- TalentNeuron
- LinkedIn Talent Insights
- Joveo
- TalMan
- broader workforce/talent intelligence suites

Other recruiting-operations systems also discuss or expose fillability/market-viability concepts.

Therefore the product cannot win by saying:

> "we invented fillability scoring."

### Working wedge

The possible gap is **access model + packaging**:

> **talent-market intelligence for one decision, without buying talent-intelligence software.**

The ideal buyer experience is:

```text
new req arrives
    ↓
agent/recruiter calls Role Reality
    ↓
one bounded market packet arrives
    ↓
intake/search plan changes if needed
    ↓
pay only for this role
```

This remains a hypothesis until external recruiters validate it.

## Initial target customers

### Segment A — small recruiting agencies

Best early human validation market.

Why:

- req quality/fillability directly affects recruiter capacity and revenue
- many cannot justify enterprise labor-market platforms
- direct path to people who understand whether the packet changes behavior

### Segment B — independent recruiters / boutique specialists

Potentially high fit because each search matters and tooling budgets are smaller.

### Segment C — recruiting software / agent builders

Potential machine/API buyer.

Use case:

- call Role Reality automatically during intake
- enrich a recruiting workflow with market facts without owning a labor-market-data integration

### Segment D — internal recruiting teams

Potential later market if the output proves useful for intake calibration.

Do not broaden messaging to all HR before one segment repeats usage.

## V0 data strategy

### CareerOneStop/USDOL

Use for validation because:

- open-data posture is clear
- provider documents third-party integration
- occupation, wage, job, skills, and projected-employment APIs are available
- provider-side credentials can be abstracted from the buyer

V0 remains U.S.-only.

### O*NET

Potential later normalization/crosswalk layer under appropriate attribution.

### Premium data

Do not purchase Lightcast, TalentNeuron, proprietary candidate data, or other premium sources merely to make V0 impressive.

Add a paid source only when users identify a missing fact strongly enough to justify its cost and rights.

Every premium source must pass:

- exact commercial-use rights
- bounded per-call cost
- contribution-margin impact
- buyer-visible value
- evidence of demand

## Product architecture

### Core product logic

Must be independent from payment method.

Conceptually:

```text
request contract
    ↓
occupation resolution
    ↓
market provider(s)
    ↓
normalized market facts
    ↓
deterministic calibration logic
    ↓
Role Reality packet
```

Payment/discovery frontage sits outside that core.

### V0 technical stack

Reuse:

- Node.js
- TypeScript
- Express
- existing tests
- current public x402 seller architecture

Do not add until earned:

- database
- LLM
- embeddings
- browser automation
- frontend
- candidate PII
- LinkedIn scraping

## Product packaging

### Validation product

Local/fixture + live provider sample packet first.

No payment required until the packet passes human review.

### Machine product if earned

Candidate:

`POST /role-reality`

Initial Base Sepolia test price:

> **$0.50 test USDC**

Machine-readable schema + Bazaar metadata.

### Human/developer product later

Possible forms:

- one-off report
- prepaid credits
- API plan
- embedded partner usage

Do not build a dashboard or subscription system before repeat demand.

## Pricing strategy

The project should stop treating tiny price as inherently good.

The objective is:

> **the price that maximizes profitable repeat purchase volume.**

Candidate tests after usefulness:

- $0.50
- $1
- $2
- $5 for richer/human-facing packets if value supports it

A product that saves meaningful recruiter time does not need to cost fractions of a cent.

## Unit economics

V0 has an attractive experimental cost profile:

- open-data provider cost: expected near $0
- deterministic logic: minimal compute
- no model/browser costs
- payment cost small relative to $0.50 if/when x402 is used

Current operating target:

> **>=60% contribution margin**, with preference for 75%+.

Do not use high margin to hide low demand.

At $0.50/call:

- 100 calls/month = $50 revenue
- 1,000 = $500
- 10,000 = $5,000

This means the real bottleneck is repeat demand/distribution, not API cost.

See `ROLE-REALITY-UNIT-ECONOMICS.md`.

## Go-to-market sequence

### Stage 0 — packet quality

Generate real sample packets across different occupation families.

Reject the product if it feels like a dressed-up salary lookup.

### Stage 1 — recruiter validation

Show samples to at least five external recruiters using `ROLE-REALITY-VALIDATION-PROTOCOL.md`.

Strongest desired behavior:

> **"Run this other role for me."**

That is stronger than compliments.

### Stage 2 — Base Sepolia machine test

Only after human usefulness:

- expose free preflight
- expose $0.50 paid testnet route
- strong Bazaar metadata
- test external discovery/payment

### Stage 3 — real willingness to pay

Obtain a buyer willing to pay a stated amount for another useful packet or integration.

### Stage 4 — first real sale

Only after rights, failure semantics, pricing, wallet separation and accounting are ready.

### Stage 5 — repeat buyer

This is the first serious product signal.

A natural repeat trigger exists: **every new or materially changed requisition.**

## Distribution strategy

### Human recruiting channel

Early acquisition should be direct and cheap:

- recruiter peers
- boutique agency owners
- recruiting communities
- targeted product demos with real roles

Do not buy broad marketing.

### Developer/machine channel

If product value exists:

- Coinbase Bazaar/x402 discovery
- AgentCore payment-capable agents
- x402scan/listing surfaces
- strong OpenAPI/schema
- later MCP only if it improves integration
- later MPP only if it expands reachable buyers

### Partner channel

Potential long-term advantage:

Recruiting tools may prefer to call one market-calibration API rather than license/integrate a broader labor-market platform.

Do not pursue partnerships until the packet proves itself.

## Moat ladder

### V0 — weak moat, acceptable for cheap validation

- convenient access
- clean contract
- recruiting-specific interpretation
- machine payment/discovery

### V1 — workflow learning

If users return, collect non-sensitive outcome labels such as:

- req accepted/rejected
- compensation changed
- title changed
- location/remote constraint changed
- shortlist generated
- search stalled
- filled/not filled

Do not collect candidate PII unnecessarily.

### V2 — proprietary calibration evidence

Potential defensibility:

- which market flags actually caused req changes
- which changes correlated with better search outcomes
- specialty-specific calibration priors
- benchmarked impact of compensation/title/location adjustments

### V3 — premium data where earned

Only after demand tells us which facts matter.

The moat should come increasingly from **observed recruiting outcomes**, not from wrapping public data.

## Key metrics

### Product

- packet completion rate
- occupation-match ambiguity rate
- data coverage by role family
- recruiter action-change rate
- second-role request rate

### Commercial

- independent paying buyers
- repeat buyer rate
- calls per returning buyer
- revenue per buyer
- contribution margin
- top-buyer concentration

### Operational

- provider calls/request
- provider latency
- fulfillment latency
- provider failure rate
- support burden

### Do not optimize

- endpoint count
- self-generated test transactions
- GitHub stars
- total ecosystem x402 volume
- AI feature count

## Explicit validation thresholds

From the first five external recruiter tests, prefer:

- >=3/5 say the packet changes an intake/search action or replaces meaningful research
- >=2/5 request another role or recurring workflow
- no systemic data-quality failure

If fewer than two testers change any action, pause rather than add features.

## Profit milestone ladder

### $0 revenue

Acceptable during validation.

### First willingness to pay

Product has crossed from useful demo toward commerce.

### First independent sale

Real exchange of money for utility.

### First repeat buyer

Strongest early signal.

### $100 cumulative external revenue

Proof revenue is not purely ceremonial.

### $500 monthly revenue

Tiny business signal.

### $1,000 monthly contribution profit

Meaningful side-business validation.

### $5,000 monthly contribution profit

Now evaluate a standalone brand, more formal business infrastructure, premium data and deliberate acquisition.

These are learning milestones, not forecasts.

## Brand strategy

Do not name the company tonight.

If Role Reality or a successor earns commercial traction, the brand should be:

- protocol-neutral
- credible to recruiters/developers
- broad enough for adjacent labor-market decision products
- not dependent on "AI" or "crypto" positioning

Possible naming territory can explore concepts like:

- market reality
- calibration
- signal
- search economics
- labor intelligence
- role viability

But naming follows validation.

## Failure modes

### Product too shallow

If users say it is just salary lookup + web search, reject it.

### Open data too coarse

If modern/niche titles map badly, do not automatically buy premium data. First determine whether the decision remains worth solving.

### Buyers need candidate-pool counts

That changes both data cost and licensing. Re-run economics before proceeding.

### Users want consulting, not API

Avoid accidentally building a bespoke recruiting-services business unless that is explicitly desired.

### x402 adoption disappoints

The product must remain sellable through conventional channels.

### Competitor closes access gap

Differentiate through outcome calibration/workflow or pivot.

## Immediate execution plan

Current source of truth for the next desktop/Codex session:

- `ROLE-REALITY-CHECK-V0.md`
- `CODEX-SESSION-PLAN-2026-08-24.md`
- Issue #13

The correct next engineering output is **sample evidence**, not a production company.

## Definition of success for v0.2

This business plan succeeds if it drives the project to one of two outcomes quickly:

1. **Role Reality produces repeated, paid, positive-margin value and earns deeper investment**, or
2. **we reject it cheaply and use what we learned to select a stronger Product #2.**

Either outcome is better than maintaining a technically impressive but economically weak catalog.
