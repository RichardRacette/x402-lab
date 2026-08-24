# Business Plan v0.3 — Service First, Productize What Repeats

Status: **current working commercial plan**

Date: **2026-08-24**

This version supersedes `BUSINESS-PLAN-V0.2.md` after a full project audit found that the proposed automated Role Reality Check is too close to current free/SMB-access talent-intelligence products to justify a paid automated launch.

Read with:

- `FULL-PROJECT-AUDIT-2026-08-24.md`
- `PRODUCT-VIABILITY-2026-08-24.md`
- `ROADMAP.md`
- `AGENT-COMPATIBILITY-PRINCIPLE.md`

## Business objective

> **Earn real external revenue for a useful recruiting decision, reach positive contribution after owner time, then automate the repeated parts.**

The project is not optimizing for:

- endpoint count
- testnet transactions
- protocol novelty
- AI feature count
- a fully automated business before customer evidence

## Strategic architecture

### Layer 1 — x402-lab R&D asset

Keep the repository and existing public Evidence Slice service.

It proves the machine-commerce stack and remains useful for protocol/compatibility testing.

### Layer 2 — human-reviewed commercial experiment

Working service label:

**Search Calibration Review**

Proposition:

> Send one U.S. requisition and receive a fast, source-backed, human-reviewed recruiting brief showing what to challenge, clarify, or change before heavy sourcing begins.

### Layer 3 — internal fulfillment workbench

Software is used first to make the human review faster and more consistent.

Only components that repeatedly create buyer value graduate into standalone automated products.

### Layer 4 — machine-native automated products

When a repeated component is proven, expose it through x402/MPP/MCP/conventional APIs as appropriate.

The payment protocol remains a distribution mechanism, not the core value proposition.

## Why v0.2 was superseded

The prior automated Role Reality hypothesis assumed there was an access-model gap between enterprise talent intelligence and recruiters who wanted one role at a time.

Current research weakened that gap materially:

- Glozo provides rich U.S. role-market intelligence on its free plan, including supply, demand, salary, trends, competing employers and explicit role-hireability use cases.
- Glozo already works with browser-based AI tools and plans native MCP access.
- Recruiting-industry guidance now teaches solo recruiters to build similar public-data talent-intelligence MCPs using free government datasets.

Therefore a $0.50 public-data Role Reality API has weak buy-vs-build and weak buy-vs-free-competitor economics.

The role-market work is not discarded. It becomes **internal research infrastructure** for a higher-value human-reviewed service.

## The product being sold now

### Search Calibration Review

The buyer is purchasing **recruiting judgment applied to one search**, not access to a wage table.

Suggested inputs:

- job title
- U.S. location
- compensation/rate
- work model
- true must-haves
- optional job description
- optional shift/travel/industry/urgency/process context

Suggested output:

1. role/search-family interpretation
2. source-backed market context
3. compensation context where reliable
4. requirement/constraint review
5. 5–8 intake calibration questions
6. alternate title/skill/search pivots
7. reviewer priority note: what to challenge first and why
8. source receipts, vintage and limitations

The service should be concise enough that a recruiter can use it immediately on an intake/client call.

## Initial specialization

Test broadly enough to avoid overfitting, but prioritize **industrial/manufacturing/supply-chain/operations** searches during early refinement.

Hypothesis:

Generic market-intelligence tools are strongest in tech/knowledge work, while industrial recruiting decisions often turn on context such as:

- shift
- onsite/commute radius
- plant environment
- certifications
- equipment/process experience
- overtime/travel
- local industrial employer density
- narrow geographic supply

A specialty wedge may allow human judgment to outperform generic market snapshots.

Do not claim this until external tests support it.

## Data policy

### CareerOneStop

Registration has been submitted transparently.

Because the click-license presented during registration restricts modification/alteration of COS Data, CareerOneStop must **not** be the foundation of a proprietary commercial score or transformed output without written clarification of the intended use.

It may remain an internal/validation source subject to its license.

### O*NET

Prefer O*NET Database/content where covered by CC BY 4.0 for taxonomy, titles, skills and occupation context, with required attribution and change notices.

### BLS

Prefer BLS data for wage/employment facts where practical. Follow BLS citation/disclaimer requirements and preserve data vintage/geography.

### Other sources

Do not add a paid or proprietary data source until a real buyer identifies a missing fact worth its cost.

## Revenue model

### Phase 0 — free validation

A small number of external reviewers receive sample briefs free in exchange for direct behavioral feedback.

### Phase 1 — paid concierge

Pilot price: **$25 per review**.

Then test **$49**.

If the service materially changes a live client/intake decision, test **$75–$99**.

### Phase 2 — bundles

Only after repeat demand:

- 5-review pack
- monthly credits
- agency team pack

Do not build subscription infrastructure before this demand exists.

### Phase 3 — automated components

Components that repeatedly save time may become:

- paid API calls
- MCP tools
- x402 endpoints
- embedded partner functions

Pricing follows demonstrated value, not micropayment ideology.

## Unit economics

Track per review:

```text
sale price
- platform/payment fees
- paid data cost
- model/browser cost if any
- owner-time cost
= contribution
```

Use an internal owner-time value of at least **$50/hour** for decision-making.

At a 5% marketplace fee:

- $25 sale -> $23.75 net before owner time
- $49 -> $46.55
- $75 -> $71.25

At $50/hour internal owner cost:

- 20 min = $16.67
- 30 min = $25
- 45 min = $37.50

Operating target for the $49 product:

> **median fulfillment <=25 minutes** after the workbench is functioning.

If fulfillment remains >45–60 minutes, either raise price, reduce scope or reject the service.

## Why a human-reviewed service can be strategically useful

The initial service is intentionally not maximally scalable.

It exists to discover:

- what buyers actually ask for
- which market facts change their decisions
- which recruiter judgments recur
- which sources are trusted
- what they will pay for
- where automation saves the most time

This is paid product research.

A manually fulfilled product that earns $49 teaches more than a fully automated endpoint with zero buyers.

## Agent-commerce distribution

### the402

Current marketplace capabilities include:

- human services
- machine-readable input schemas
- x402 payment
- escrow
- agent/human buyers
- provider reputation
- request/bidding flow
- 5% provider fee

This is a concrete future channel for **human recruiting judgment purchased by an agent**.

Do not assume demand exists because the marketplace exists. The public request board may have little/no recruiting work at a given moment.

### Direct x402

Keep x402-lab's seller infrastructure for future automated SKUs.

Do not force human-reviewed fulfillment into a synchronous HTTP endpoint.

### Conventional payment

If humans want the service, add a normal purchasing path before requiring wallet adoption.

The business must survive if x402 growth disappoints.

## Customer validation protocol

For first five external recruiters:

Before showing the brief ask what they would research/ask on the req.

After showing it record:

- did intake/search behavior change?
- did it replace manual research?
- what part mattered?
- what was obvious/useless?
- what fact was missing?
- would they send another req?
- would they pay $25? $49? $75?

### Continue threshold

From first 5:

- >=3 report a concrete behavior change or meaningful manual research saved
- >=2 request another review / recurring use
- at least 1 is willing to pay a stated price

### Stronger signal

First actual external payment.

### Strongest early signal

Same buyer purchases a second review.

## Fulfillment workbench

Tonight's Codex work should create an **internal** Search Calibration Workbench.

Core requirements:

- input schema for req facts
- source-neutral market-fact interfaces
- occupation/title normalization
- clearly licensed O*NET/BLS integration or fixture support
- CareerOneStop only as optional experimental source pending rights clarity
- deterministic compensation/context calculations
- source/vintage/provenance output
- reusable calibration-question templates
- Markdown and JSON draft output
- execution timing
- tests

The workbench is successful if it reduces the time needed to produce a credible human-reviewed brief.

It is not a customer product by default.

## Tonight's stop/go rule

After Codex generates sample drafts across multiple role families:

### Continue if

- draft gets a human reviewer >70% of the way to a useful deliverable
- facts are sourced and correctly scoped
- industrial/non-tech roles are not systematically poor
- finishing a review plausibly takes <=25–30 minutes

### Stop/refactor if

- output is mostly generic salary data
- occupation mapping is unreliable
- human reviewer has to rewrite most of it
- the tool creates more checking work than it saves

Do **not** add an LLM or premium data automatically to rescue poor utility.

## First revenue plan

Once sample quality passes:

1. create 3–5 polished example briefs using non-confidential/public roles
2. show to five external recruiters
3. offer next review at pilot price ($25)
4. record fulfillment time and what buyer changed
5. collect payment through the simplest available channel
6. after one real buyer exists, test a machine-native human-service listing
7. seek a repeat purchase before broader product development

## Commercial milestones

- **$1 external revenue** — crossed from experiment to commerce
- **$100 cumulative external revenue** — non-ceremonial demand
- **first repeat payer** — strongest early signal
- **$500 monthly revenue** — tiny business signal
- **$1,000 monthly contribution after owner time** — meaningful side-business validation
- **$5,000 monthly contribution** — evaluate standalone commercial brand and deeper automation

These are milestones, not forecasts.

## Moat roadmap

### Now

Human recruiting judgment + fast fulfillment.

### Next

Specialty-specific playbooks and better workbench tooling.

### Then

Anonymized outcome/calibration history:

- compensation changed
- title changed
- must-have relaxed
- location/remote changed
- search started/stalled
- buyer returned

### Later

Automate the proven recurring judgments and expose them as products.

The long-term moat, if one emerges, should come from **observed outcomes and workflow learning**, not merely wrapping public datasets.

## Brand

Do not name a company yet.

`x402-lab` remains the public experiment.

A commercial identity is earned only after actual paid demand.

## Definition of success for Business Plan v0.3

This plan succeeds if it gets the project to a real paying external buyer faster than continuing to build unvalidated automated APIs, while creating evidence about which portions of recruiting judgment deserve software productization.