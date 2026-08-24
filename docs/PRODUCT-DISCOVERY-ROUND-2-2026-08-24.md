# Product Discovery Round 2 — 2026-08-24

Status: **governing discovery decision for tonight's Codex session**

This document records the second major product correction after deeper competitive research.

## Decision history

### Evidence Slice

Retain as payment/protocol proof. Do not invest in feature expansion without buyer evidence.

### Recruiting Pressure Brief / Agency Opportunity Brief

**Do not build.**

The initial thesis was that we could use public hiring history to identify companies exhibiting recruiting pressure. Deeper research found current products already occupying this exact layer:

- Reqbeat: hiring pulse, repost pain, first-hire, pre-action brief, outcome attribution, calibrated intent
- Signalbase: hiring velocity, shelf-life, talent supply strain, repost density, first-hire, API/webhooks/MCP
- Recruitcha: recruiting-agency BD intelligence around fresh/stale roles and hiring activity
- other job-data/MCP providers already expose hiring signals cheaply

The idea is not useless; it is simply not differentiated enough to deserve scarce engineering time.

This is an example of the Product Viability Gate working correctly.

## New leading hypothesis

### Working label: **Role Reality Check**

> **Give us a U.S. role, location, proposed compensation, and a small set of important constraints. We return a source-backed market reality packet showing how the req compares with the labor market, where the biggest search friction sits, and what should be calibrated before a recruiter spends meaningful time sourcing.**

This product sits **after a job/mandate exists and before expensive search execution begins**.

It is deliberately different from "who is hiring?" intelligence.

## Why this problem deserves investigation

Recruiting agencies and TA teams repeatedly perform a role-calibration workflow:

- understand the real requirement
- assess compensation
- understand local talent availability / competition
- separate must-haves from negotiables
- choose a search strategy
- decide whether a req is worth prioritizing

Agency economics amplify the value of this decision. Direct-hire fees commonly run as a meaningful percentage of first-year salary, while contingent searches produce no placement fee if they do not fill. Recruiter time is therefore a major variable cost.

Current recruiting operators explicitly discuss fillability and revenue potential as req-prioritization dimensions.

## Existing competition — and what it teaches us

This category is not empty.

### Enterprise / platform incumbents

- Lightcast Talent Benchmark: packaged supply, demand, compensation, diversity and skills by title/location
- TalentNeuron: supply, relative supply, salary, demand, posting period, competition, skills and related labor-market endpoints
- Joveo AI Staffing Advisor: predicts fill rates and flags high-probability/at-risk job orders
- LinkedIn Talent Insights: talent-pool and hiring-demand intelligence
- TalMan: market viability / salary alignment / talent-market reports
- Korn Ferry / Eightfold / Beamery and others include role calibration in broader enterprise platforms

### Recruiting-operations products

- Automindz explicitly describes a Fillability Score as a recruiting skill/agent primitive
- Seven20 includes fillability management
- SetpointHQ markets a layer designed to make jobs more fillable

Therefore **"we score fillability" is not a moat.**

## The hypothesized wedge

The wedge is an access and product-model gap:

> **Talent-market intelligence without buying talent-intelligence software.**

Target experience:

```text
recruiter/agent has one role
    ↓
POST one bounded request
    ↓
no subscription / seat / sales call / API-key provisioning for the buyer
    ↓
receive one source-backed decision packet
    ↓
pay only for this role
```

The product should be useful to:

- autonomous recruiting agents
- agency recruiters deciding whether/how to pursue a search
- internal recruiters calibrating a new req
- lightweight recruiting software that cannot justify enterprise talent-intelligence contracts

x402 is well-suited to this model, but a conventional API/card channel should remain possible.

## Why the current tech stack can plausibly support it

x402-lab already has:

- TypeScript/Node/Express
- public deployment
- x402 seller middleware
- Base Sepolia transaction proof
- Bazaar metadata
- bounded buyer/shopper primitives
- tests and safety patterns

The proposed V0 does not require:

- a database
- candidate PII
- browser automation
- a vector store
- a large model
- a new frontend

## Data advantage: U.S. Department of Labor open data

CareerOneStop, sponsored by the U.S. Department of Labor Employment and Training Administration, exposes quality-controlled Web APIs and states that data available through its APIs are open data under USDOL's Open Data Policy.

Useful endpoints include:

- occupation lookup / O*NET mapping
- occupation details
- local/national wage percentiles
- projected employment and annual openings
- skills, knowledge and related titles
- current job search/count by occupation/keyword and location
- LMI by occupation/location

CareerOneStop requires a provider-side API token, but the buyer would not need one. That credential abstraction itself is part of the product value.

O*NET also provides a commercially usable CC BY data layer with attribution for future normalization work.

## Buy-vs-build argument

An agent could assemble these facts itself if it had:

- CareerOneStop credentials
- occupation-resolution logic
- knowledge of which endpoints to call
- stable handling of inconsistent/missing data
- decision rules to translate data into recruiter-relevant friction
- provenance and a normalized contract

The V0 asks whether paying approximately cents-to-one-dollar for that complete bounded packet is easier than maintaining the integration.

This is the same broad economic pattern seen in successful agent-commerce services that abstract credentials/upstream APIs behind pay-per-use access.

## Important humility

The initial defensibility is **not strong**.

Open government data can be reproduced. A serious competitor can build a similar service.

Therefore V0 is acceptable only as a cheap wedge if it can later compound into one or more stronger assets:

1. recruiter outcome calibration
2. proprietary benchmarks from actual search outcomes
3. better crosswalks between messy req language and labor-market taxonomies
4. counterfactual calibration recommendations grounded in observed outcomes
5. premium/licensed data sources added only when economics justify them
6. workflow integrations that make the service a default machine call

Do not describe the open-data V0 itself as a moat.

## Why this hypothesis currently outranks Recruiting Pressure

- it sits closer to a high-value decision: whether/how to spend recruiter time on a req
- the value per correct calibration can be large relative to a sub-$1 call
- it does not require building a proprietary company-history corpus before being useful
- its V0 data path has much clearer open-data rights
- the buyer does not need person-level PII
- the current x402 stack can expose it cheaply
- no direct x402-native Role Reality Check competitor was found in this research pass
- incumbents validate the need while leaving a possible pay-per-role/no-contract access gap

## Why this hypothesis could still fail

Kill or pause it if:

- recruiters say the packet is no better than asking ChatGPT plus a salary search
- CareerOneStop data is too coarse/stale for role-level decisions
- title-to-occupation mapping is unreliable for modern/niche roles
- users need real candidate-pool counts that only expensive proprietary providers can supply
- users will not pay even a small amount without deeper candidate-market data
- existing lightweight products already provide equivalent pay-per-role output with less friction
- an agent can reproduce the same quality with commodity tools more cheaply than our price

## Commercial shape if validated

### Machine channel

Pay per role via x402.

Candidate early range:

- basic market reality packet: $0.25–$0.50
- richer multi-location / constraint comparison later: $1–$5 if upstream costs/value justify it

### Human/developer channel

Do not build subscriptions yet.

Possible later model:

- free sample/preflight
- pay-per-report
- small API credit packs
- monthly plans only after repeat demand exists

## Brand implication

Do not rename x402-lab yet.

If a commercial brand emerges, it should describe trusted, on-demand labor/recruiting intelligence rather than the payment protocol.

## Next decision

Tonight's Codex session should build a **validation-grade Role Reality Check core**, not a commercial launch.

The required contract and implementation limits are defined in `ROLE-REALITY-CHECK-V0.md` and `CODEX-SESSION-PLAN-2026-08-24.md`.
