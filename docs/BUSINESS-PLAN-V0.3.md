# Business Plan v0.3 — Service First, Productize What Repeats

Status: **current working commercial plan**

Date: **2026-08-24**

This version supersedes `BUSINESS-PLAN-V0.2.md` after a full profitability audit found that the proposed automated Role Reality Check is too close to current free/SMB-access talent-intelligence products to justify a paid automated launch.

Read with:

- `FULL-PROJECT-AUDIT-2026-08-24.md`
- `PRODUCT-VIABILITY-2026-08-24.md`
- `ROADMAP.md`
- `CODEX-SESSION-PLAN-2026-08-24.md`

## Business objective

> **Earn real external revenue for a useful recruiting decision, reach positive contribution after owner time, then automate the repeated parts.**

The project is not optimizing for endpoint count, testnet volume, protocol novelty, AI feature count, or full automation before customer evidence.

## Strategic architecture

### Layer 1 — x402-lab R&D asset

Keep the repository and existing public Evidence Slice service. It proves the machine-commerce stack and remains useful for protocol/compatibility testing.

### Layer 2 — human-reviewed commercial experiment

Working service label:

**Recruiting Search Preflight — Human Review Gate**

Proposition:

> **Send one U.S. requisition plus its important search assumptions. Receive a fast recruiter review of what is unrealistic, ambiguous, contradictory, underspecified, or worth changing before heavy sourcing/outreach begins.**

The buyer is purchasing recruiting judgment applied to a specific search, not access to public wage data.

### Layer 3 — internal fulfillment workbench

Software is used first to make the human review faster, more consistent, and source-aware.

### Layer 4 — machine-native automated products

Only components that repeatedly create paid buyer value graduate into automated x402/MPP/MCP/API products.

Payment technology remains a distribution mechanism, not the core value proposition.

## Why automated Role Reality was rejected

The previous thesis assumed a pay-per-role access gap between enterprise talent-intelligence platforms and smaller recruiters.

Fresh 2026 research weakened that gap materially:

- **Glozo Intelligence** provides live role-level U.S. supply, demand, salary, geographic distribution, trends, competing employers, and listing lifespan on its free plan.
- **Findem Calibration Agent** explicitly aligns recruiters/hiring managers on a market-grounded search before sourcing.
- **MergeSearch** sells completed, source-linked and human-checked executive-search market maps within 24 hours, at roughly `$650–$975` per map depending on plan.
- current recruiting-industry guidance teaches solo recruiters to build talent-intelligence MCPs from public/free datasets.

Therefore an automated `$0.50` public-data Role Reality packet fails both **buy-vs-build** and **buy-vs-free-competitor** tests.

Do not resurrect it because implementation would be easy.

## What we are *not* becoming

The Search Preflight experiment is deliberately smaller than a MergeSearch-style market map and narrower than a Findem/Glozo talent-intelligence product.

It does **not** promise:

- complete candidate-market mapping
- candidate names or contact data
- search execution
- supply/demand modeling unless directly sourced
- guaranteed fillability
- employer hiring decisions
- a multi-week consultancy report

The question is much smaller:

> **Before this search starts, what would an experienced recruiter challenge or clarify?**

## Why this can still be worth testing

### 1. Human judgment is scarcer than public market data

A capable agent can fetch labor-market information. It cannot necessarily reproduce the contextual tradeoffs an experienced recruiter makes around titles, must-haves, compensation, onsite constraints, shift, travel, geography, search-plan coherence, and intake questions.

### 2. It can earn revenue before full automation

We do not need to prove a standalone API before learning whether the decision itself is worth money.

### 3. Paid reviews become product discovery

Every fulfilled review teaches us which judgments recur, which facts matter, what buyers trust, what they will pay for, and which steps deserve automation.

### 4. Agent-native human work is now possible

Current agent marketplaces support human-delivered work with machine-readable briefs, escrow, reputation, asynchronous fulfillment, and x402 settlement. This lets us test whether an AI recruiting agent will buy human recruiting judgment as an escalation step.

## Initial customer segments

Prioritize in this order:

1. **independent/boutique recruiters** — easiest people to judge utility and pay-per-search economics
2. **agency recruiters/account managers** — search quality directly affects capacity/revenue
3. **AI recruiting agent builders** — machine-native escalation use case
4. **internal recruiters** — later if the same problem repeats

Do not broaden messaging to all HR until a buyer returns.

## Initial specialization hypothesis

Test multiple role families, but deliberately over-sample **industrial/manufacturing/supply-chain/operations** searches.

Potential reason:

Generic talent-intelligence tools are often strongest in tech/knowledge work, while industrial searches depend heavily on context such as:

- shift
- onsite/commute radius
- plant environment
- equipment/process experience
- certifications/licenses
- overtime/travel
- geography
- narrow combinations of day-one experience

This is a hypothesis, not a moat claim.

## Data policy

### CareerOneStop

Registration has been submitted transparently.

Because the click-license presented during registration restricts modification/alteration of COS Data, CareerOneStop must **not** become the foundation of proprietary transformed commercial scoring without written clarification.

It may remain optional internal/validation evidence subject to its license.

### O*NET

Prefer O*NET Database/content where covered by CC BY 4.0 for occupation taxonomy, titles, skills/tasks and related context. Follow attribution requirements and indicate modifications where required.

### BLS

Prefer BLS public data for wage/employment facts where practical. Preserve retrieval date, source/vintage/geography and required downstream disclaimer language.

### Premium sources

Do not buy Lightcast, TalentNeuron, proprietary candidate data or another premium source to make the demo impressive.

A paid source is earned only when a real buyer identifies a missing fact worth its cost and rights burden.

## Revenue model

### Phase 0 — validation samples

Create a small number of high-quality sample reviews for external recruiters. Free is acceptable because the goal is behavioral feedback, not praise.

### Phase 1 — paid preflight

Initial price tests:

- `$25` pilot
- `$49` early standard
- `$75–$99` only if buyers show that the review materially changes a live search/intake decision or replaces meaningful research

### Phase 2 — repeat/bundles

Only after a buyer returns:

- 5-review pack
- monthly credits
- agency team allowance

Do not build billing/subscription infrastructure before demand.

### Phase 3 — automated components

Repeated valuable pieces may later become:

- paid API calls
- x402 endpoints
- MCP tools
- embedded recruiting-agent functions

Pricing follows demonstrated value, not micropayment ideology.

## Unit economics

Track every paid review:

```text
sale price
- payment/marketplace fee actually charged to provider
- paid data cost
- model/browser cost if any
- owner-time cost
= contribution
```

Use an internal owner-time value of at least **$50/hour**.

At $50/hour:

- 20 minutes = `$16.67`
- 30 minutes = `$25.00`
- 45 minutes = `$37.50`

Operating target for a `$49` review:

> **median human finish time <=25–30 minutes**.

If fulfillment stays above 45–60 minutes, raise price, reduce scope, automate a proven step, or reject the service.

### the402 fee correction

Do not model the402 as automatically taking 5% out of the provider's listed price.

Its current public pricing page says:

- provider receives the price they set
- the402 adds 5% to the buyer total

Example: provider lists `$49`; buyer would pay `$51.45` and provider receives `$49`, subject to the actual provider agreement/onboarding terms in force at transaction time.

Some technical/provider documentation has contained conflicting or stale language, so verify actual economics before launch.

## Agent-native distribution

### the402

Current platform capabilities include:

- human services
- fixed-price or quote-based work
- machine-readable input schemas
- x402 payment
- escrow
- asynchronous delivery
- provider reputation
- open work requests/bidding
- MCP server access

Its public provider/pricing pages currently say listings are free and buyers pay a 5% platform surcharge.

This creates a concrete experiment:

> **Will an agent purchase recruiter judgment from a human specialist?**

Do not overstate current demand. Marketplace availability is distribution infrastructure, not product validation.

### Direct human channel

For first revenue, use whichever legitimate payment route creates the least friction for a real recruiter. Do not require a wallet merely to preserve the x402 theme.

### Existing direct x402 stack

Keep x402-lab seller infrastructure for future automated components that earn productization.

Do not force asynchronous human fulfillment into a synchronous HTTP endpoint.

## Customer validation protocol

For each external recruiter:

Before showing the review, ask what they would normally research/challenge for the req.

Afterward record:

- did the review change an intake/search action?
- did it remove manual research?
- what observation mattered?
- what was obvious/useless?
- what fact was missing?
- would they send another req?
- would they pay `$25`, `$49`, `$75`?

### Continue threshold

From first five:

- `>=3/5` report a concrete behavior change or meaningful manual research saved
- `>=2/5` request another review / recurring use
- at least one is willing to pay a stated price

### Stronger signals

1. first actual external payment
2. same buyer purchases a second review

The second event matters far more.

## Fulfillment workbench

Tonight's Codex work builds an **internal Search Preflight Workbench**.

Core requirements:

- structured req + search-plan input
- source-neutral market-fact interfaces
- occupation/title normalization where reliable
- O*NET/BLS or fixture support
- CareerOneStop optional internal evidence only pending rights clarification
- deterministic compensation/context helpers
- constraint/search-plan contradiction detection
- source/vintage/provenance output
- reusable calibration-question templates
- Markdown + JSON draft output
- explicit human-review layer
- execution/review timing
- tests

The workbench is successful if it reduces time needed to produce a credible human-reviewed preflight.

It is **not** a customer product by default.

## Tonight's stop/go rule

Continue if:

- draft gets a human reviewer roughly `>=70%` of the way to a useful deliverable
- facts are correctly scoped/sourced
- industrial/non-tech roles are not systematically poor
- finishing a review plausibly takes `<=25–30 minutes`

Stop/refactor if:

- output is mostly salary/occupation lookup
- occupation mapping routinely misleads
- reviewer rewrites most of the draft
- generic template language dominates
- tool creates more checking work than it saves

Do **not** add an LLM or premium data automatically to rescue weak utility.

## First revenue sequence

1. build the internal workbench
2. generate five sanitized drafts across role families
3. human-review them and measure finish time
4. create 3–5 credible examples
5. show to five external recruiters
6. offer a next real review at a stated pilot price
7. record fulfillment time and what buyer changed
8. seek first external payment
9. seek second payment from the same buyer
10. only after reliable fulfillment, test an agent-native human-service listing

## Moat ladder

The initial service has a weak moat. That is acceptable for discovery.

The objective is to earn stronger layers:

1. **workflow expertise** — faster/better reviewer playbooks
2. **specialty depth** — especially where contextual recruiting judgment matters
3. **fulfillment tooling** — lower time and higher consistency
4. **buyer outcome history** — what recommendations actually led to req/search changes
5. **proprietary calibration patterns** — what combinations repeatedly create problems
6. **automation** — encode repeated, validated judgment
7. **machine-native products** — sell proven components autonomously

Do not claim a data moat before one exists.

## Commercial milestone ladder

- `$1` external revenue — crossed from experiment into commerce
- `$100` cumulative external revenue — non-ceremonial demand
- **first repeat payer** — strongest early signal
- `$500/month` revenue — tiny business signal
- `$1,000/month` contribution after owner time — meaningful side-business validation
- `$5,000/month` contribution — evaluate formal brand, deeper automation and deliberate acquisition

These are learning milestones, not forecasts.

## Brand

Do not name a company yet.

`x402-lab` remains the public R&D asset.

A commercial identity is earned only after actual paid demand.

## Definition of success for Business Plan v0.3

This plan succeeds if it gets the project to a real paying external buyer faster than continuing to build unvalidated automated APIs, while generating evidence about which parts of recruiting judgment deserve software productization.