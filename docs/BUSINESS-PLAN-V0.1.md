# Business Plan v0.1 — From x402 Experiment to Profitable Agent-Native Business

Status: **working commercial plan**

Date: **2026-08-24**

This plan turns the x402-lab payment experiment into a commercial strategy whose success does not depend on x402 hype, transaction-count headlines, or a giant catalog of generic AI tools.

It should be read with:

- `PRODUCT-THESIS.md`
- `PRODUCT-VIABILITY-2026-08-24.md`
- `ROADMAP.md`
- `AGENT-COMPATIBILITY-PRINCIPLE.md`

## Executive decision

### 1. Keep `x402-lab` as the R&D repository

Do not rename the repository. It is an accurate public record of the payment/protocol experiment and preserves technical credibility.

### 2. Do not build the commercial company around the x402 protocol name

The eventual commercial brand must be **protocol-neutral**.

The product should be able to sell through:

- x402
- MPP
- MCP
- a conventional API key
- ordinary subscription/invoice/card billing
- future machine-payment rails

x402 is a useful friction-reduction and discovery rail, not the addressable market.

### 3. Treat Evidence Slice as infrastructure proof

Evidence Slice stays live and stable. It proved that the seller, buyer, payment, settlement, retry, security boundary, discovery metadata, and public deployment can work.

Do not spend meaningful product effort making Evidence Slice more sophisticated unless real buyers request it.

### 4. Commercial wedge: recruiting-agency opportunity intelligence

The leading opportunity is **not another generic hiring-signals feed**.

The leading wedge is a narrow decision product:

> **Use public/licensable hiring data and accumulated history to identify when a company's hiring pattern suggests that an external recruiter could be unusually useful, and return the evidence in a machine-readable packet.**

Working product label: **Agency Opportunity Brief**.

This is a product label, not the final company name.

The target buyer may be:

- a recruiting-agency prospecting agent
- a recruiting CRM/automation product
- an agency owner or recruiter using an API/MCP workflow
- eventually a GTM or investment agent that values the underlying hiring-change data

## Why this wedge

### The market need exists outside x402

Recruitment agencies already buy tools and spend human time trying to identify companies with hiring pain before competitors do.

Current products sell hiring signals, recruiting BD automation, job-change signals, and company intent at meaningful monthly prices. Recruiter communities repeatedly discuss signals such as:

- multiple roles open for a long time
- repeated/reposted specialist openings
- hiring volume that appears to outstrip internal recruiting capacity
- clusters of roles in a function
- first-time functions or leadership roles
- geographic expansion
- internal recruiting/TA hiring
- funding or leadership changes combined with actual hiring activity

This is important because it means the economic problem survives even if autonomous-agent payments grow slowly.

### x402 demand suggests data/access products are more promising than generic AI utilities

Observed marketplace activity is stronger around:

- data/enrichment access
- model/compute access
- browser/document infrastructure
- fresh social/market data
- specialist research
- API credential abstraction

Many large generic utility catalogs show weak or zero buyer activity.

This supports selling a difficult-to-reproduce **signal/data product**, not another summarizer.

### The founder has a relevant domain advantage

The differentiator should not be "we can scrape jobs."

Many companies can scrape jobs.

The domain advantage is knowing which combinations of hiring facts actually matter to a recruiter and how to turn them into a useful decision packet rather than a raw feed.

That expertise should be encoded into the product contract and later calibrated against real agency outcomes.

## Important market correction: x402 is early and noisy

Do not use global x402 transaction counts as the TAM.

Independent August 2026 analysis finds the ecosystem highly concentrated and reports substantial internal, wash-like, or otherwise non-independent activity. One independent adoption report counted only roughly a hundred sellers clearing a modest organic-business threshold in its measured window, while academic work finds that raw settlement count is not equivalent to independent adoption.

Implication:

> **The business must be worth buying through normal developer and human commercial channels as well as through autonomous payment rails.**

The correct success metric is real independent customer revenue and repeat use, not on-chain transaction count.

## Product #2: Agency Opportunity Brief

### One-sentence proposition

> **Give us a company domain. We return whether its current hiring footprint shows evidence of recruiting pressure worth an agency's attention, why, what changed, and the source receipts.**

### Initial request

```json
{
  "companyDomain": "example.com",
  "windowDays": 30,
  "specialties": ["engineering", "supply-chain", "hr"]
}
```

### Initial response concept

```json
{
  "service": "agency-opportunity-brief",
  "company": {
    "domain": "example.com",
    "name": "Example Corp"
  },
  "asOf": "2026-08-24T12:00:00Z",
  "signal": {
    "classification": "strong|moderate|weak|insufficient-data",
    "score": 78,
    "reasons": [
      {
        "type": "repeated_role",
        "detail": "Senior Controls Engineer has been observed repeatedly across the measurement window"
      },
      {
        "type": "hiring_cluster",
        "detail": "7 engineering openings are active across two locations"
      }
    ]
  },
  "hiring": {
    "activeOpenings": 18,
    "newOpenings": 6,
    "closedOpenings": 2,
    "netChange": 4,
    "functions": [],
    "locations": [],
    "repeatedOrReopenedRoles": []
  },
  "sources": [],
  "confidence": 0.84,
  "limitations": []
}
```

The exact schema must remain smaller than this if some fields cannot be supported reliably in V0.

### Signals V0 can earn from public hiring data

Prefer observable, explainable indicators:

- active-role count
- recent new-role count
- net opening change when history exists
- repeated/reopened same-title roles
- long-running roles where age is measurable
- multiple specialist roles in the same function
- new location or geography
- first observed role/function where history supports the claim
- internal recruiter/TA openings that can indicate hiring-volume pressure
- salary/location/onsite constraints where published
- source ATS/career URL and timestamps

Avoid unsupported claims such as "this company definitely needs an agency."

The output is a **decision aid with evidence**, not mind reading.

## Why an agent might buy instead of build

The buy-vs-build advantage comes from the combination, not one field:

1. normalization across inconsistent ATS/job-board shapes
2. historical snapshots/change detection
3. duplicate/repost detection
4. occupation/function normalization
5. recruiter-specific signal rules
6. source provenance
7. a stable, tiny contract
8. no upstream API account required for the machine buyer
9. repeatability across companies

A one-time scrape of a careers page cannot recreate our historical observations after the fact.

That accumulated history is the beginning of a defensible asset.

## Data strategy

### Phase A — cheapest lawful proof

Use only public/licensable non-PII data.

Priority sources:

1. documented public ATS job-board APIs where appropriate
2. O*NET occupational/skill data under its current CC BY 4.0 license, with required attribution
3. a normalized jobs-data provider when cross-ATS coverage materially reduces engineering burden

Greenhouse documents that Job Board GET data is publicly available without authentication. Lever's public Postings API exposes published postings. These are useful source surfaces, but public access does not remove the need to respect source rights, rate limits, attribution, and downstream-use restrictions.

### Phase B — normalized upstream supplier

JobsPipe is a plausible development supplier because it currently advertises:

- 30+ normalized job sources
- a 1,000-job free tier
- $49/month Builder tier with 25,000 jobs/month
- webhook/diff support
- source attribution

Its terms prohibit re-publishing raw responses in a way that competes with the JobsPipe API, while describing its service as public job data plus its own normalized schema/enrichment.

The intended product is a **derived recruiter decision packet**, not a raw job-feed resale. Before a real commercial launch, obtain written confirmation that the planned derived use is permitted under the chosen plan.

### Phase C — owned derived history

Persist only the fields and derived events needed to produce change intelligence, subject to source rights.

Over time, the valuable asset becomes:

- when a role first appeared
- when it disappeared
- when it reappeared
- repeated title/location patterns
- function/location hiring velocity
- historical baselines per company
- which signal combinations produced customer-positive outcomes

This is more defensible than continuously proxying an upstream API.

## PII boundary

V0 should contain **no candidate PII and no personal contact data**.

This intentionally avoids the largest licensing/privacy complication in Candidate Refresh and people-enrichment products.

Candidate/job-change products can be reconsidered later only with explicit contractual data rights and a clear customer need.

## Opportunity comparison

| Candidate | Buy-vs-build | Repeat need | Licensing risk | Differentiation | Margin potential | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Evidence Slice | weak | moderate | low | weak | high | keep as proof |
| Candidate Refresh | strong | high | **high** | moderate | uncertain | defer |
| Generic hiring-signal feed | moderate | high | moderate | **weak/crowded** | good | reject as generic product |
| Role Market Packet | moderate-strong | moderate | manageable | moderate | good | possible adjacent SKU |
| Agency Opportunity Brief | **stronger** | **high** | **manageable** | **domain-specific** | **good** | **leading Product #2** |
| Generic API credential broker | strong | high | high/contractual | weak | variable | reject for now |
| Browser/PDF infrastructure | strong | high | low | weak/crowded | good | defer |

## Technical fit with the current stack

The existing stack is sufficient for the first commercial test.

Current assets already available:

- Node.js / TypeScript
- Express seller
- x402 V2 payment middleware
- public Railway deployment
- Bazaar metadata
- safe HTTP-fetch patterns from Evidence Slice
- bounded buyer
- shopper gateway/spend controls
- CI/typechecking/tests

Likely additions for Product #2:

- source adapter layer for job data
- company-domain -> source/board resolution
- normalized job record
- deterministic signal engine
- small persistent database for snapshots and signal history
- scheduled ingestion for watched companies
- provenance/source ledger
- per-request cost telemetry

A small Postgres/Supabase database is enough initially. Do not build a warehouse.

## Protocol architecture

Keep product logic independent of payment.

```text
                 Agency Opportunity engine
                    /        |        \
                   /         |         \
              x402 HTTP     MCP      normal API
                 |            |          |
              USDC/rail   agent host   API key/billing
```

MPP can become another payment frontage if real buyers justify it.

This is important because AWS AgentCore Payments now supports both x402 and MPP and exposes Coinbase Bazaar as a discovery target. Protocol neutrality protects the business if standards shift.

## Pricing hypothesis

Do not price this like Evidence Slice.

The output is intended to influence a commercial decision worth potentially thousands of dollars to an agency. Fractions of a cent would leave no room for data cost and would signal the wrong value category.

### Machine pay-per-use V0

Initial test range:

- **$0.25** — bounded company opportunity packet using a small/medium data pull
- **$0.50** — richer packet or large-company tier
- later dynamic/`upto` pricing if variable upstream cost makes fixed pricing awkward

A free preflight can tell the buyer whether enough source data exists before payment.

### Conventional developer/API pricing after validation

Illustrative, not final:

- Sandbox: small free monthly allowance
- Builder: roughly **$49–$79/month**
- Pro: roughly **$149–$249/month**
- enterprise/custom only after someone actually asks

Do not build a subscription dashboard before demand. API keys and a minimal billing surface are enough.

## Unit economics

JobsPipe's current Builder economics are approximately $49 / 25,000 returned jobs, or about $0.00196 per returned job before our own compute.

Illustrative per-call math after the free facilitator allowance:

### 20 upstream job rows, $0.25 sale

```text
sale price                         $0.2500
approx jobs-data cost             -0.0392
facilitator                       -0.0010
-----------------------------------------
pre-hosting contribution           $0.2098
pre-hosting contribution margin       84%
```

### 50 upstream job rows, $0.25 sale

```text
sale price                         $0.2500
approx jobs-data cost             -0.0980
facilitator                       -0.0010
-----------------------------------------
pre-hosting contribution           $0.1510
pre-hosting contribution margin       60%
```

### 50 upstream job rows, $0.50 sale

```text
sale price                         $0.5000
approx jobs-data cost             -0.0980
facilitator                       -0.0010
-----------------------------------------
pre-hosting contribution           $0.4010
pre-hosting contribution margin       80%
```

These are not forecasts. They show that a bounded derived product can plausibly support healthy contribution margins while still making the purchase trivial relative to a recruiter placement fee.

Large-company requests must be capped, sampled, pre-priced, or dynamically priced so a buyer cannot force an uneconomic upstream pull.

## Revenue targets

The first goal is **not** $1M ARR.

Use an evidence ladder:

### Stage 1 — real value

- one unrelated external buyer
- one real-money paid output
- buyer says the packet changed or accelerated a decision

### Stage 2 — repeat use

- 3+ independent buyers
- at least one repeat buyer
- at least 50 genuine paid packets
- positive contribution margin

### Stage 3 — tiny business

- $100 monthly gross profit
- then $500
- then $1,000

A $1,000 monthly contribution target at roughly $0.20 contribution per packet requires about 5,000 packets/month, or fewer calls if conventional subscriptions contribute recurring revenue.

### Stage 4 — meaningful side business

A plausible target architecture is dozens of developer/agency subscriptions plus automated pay-per-use traffic.

Example only:

- 50 customers at $79/month = $3,950 monthly recurring revenue
- plus 10,000 pay-per-use packets with $0.18 average contribution = $1,800 contribution

This is **not a projection**. It illustrates why the business should have both conventional customers and machine-native traffic rather than relying on x402 discovery alone.

## Distribution plan

### Machine-native

1. excellent x402/Bazaar metadata
2. x402scan listing
3. AgentCore/Bazaar compatibility test
4. MCP tool after the product works
5. MPP frontage only when earned

AWS made AgentCore Payments generally available on 2026-08-18 and exposes a curated Coinbase Bazaar MCP server containing 10,000+ x402 tools. Quality, metadata, social proof and availability influence curation, making reliability and precise descriptions part of distribution.

### Human/developer

1. one clear public landing page
2. no-call sandbox/example
3. direct API documentation
4. recruiting-agency communities and targeted outreach
5. direct conversations with 5–10 agency recruiters/owners
6. recruiting-tech developer outreach
7. public demonstrations using only public-company data

Do not spend on ads before repeat usage.

## Customer discovery questions

Ask agency users about behavior, not whether the idea sounds cool:

1. How do you decide which companies to prospect this morning?
2. What tells you a public req is likely to become agency business?
3. Which roles/companies do you deliberately ignore and why?
4. What is the last company you contacted because you saw a hiring signal?
5. Which public clues made you act?
6. How often do you manually inspect careers pages or LinkedIn jobs?
7. Would a source-backed "why this account now" packet replace any current work?
8. What false positive would make you stop trusting it?
9. What would one genuinely good signal be worth?
10. Would you rather pay per signal, per watched company, or per month?

## Learning moat

The long-term moat is **not x402 middleware**.

If this works, the moat becomes:

1. historical hiring-change data
2. recruiter-specific signal taxonomy
3. outcome feedback from real agencies
4. calibration by recruiting niche
5. reliability/provenance
6. integration into agent workflows

An especially promising future loop is:

```text
signal emitted
    ↓
agency acts
    ↓
meeting / mandate / no response recorded
    ↓
which signal combinations work for this niche becomes measurable
    ↓
future ranking improves
```

Do not build machine learning until enough labeled outcomes exist.

## Kill conditions

Kill or substantially pivot the product if any of these become clear:

- agencies say the public signal arrives too late to matter and cannot identify a narrower useful niche
- buyers can reproduce the packet reliably with existing tools for less total effort
- source/data terms prevent a lawful derived commercial product at viable cost
- after direct exposure to at least 10 relevant external users, nobody will pay even a trivial real amount
- buyers try it but do not return
- false positives destroy trust
- acquiring one customer requires enterprise sales effort inconsistent with the expected revenue

## What not to build now

- candidate database
- contact enrichment
- full recruiting CRM
- outreach sequencer
- ATS
- generic sales-intelligence platform
- giant agent-tool marketplace
- generic x402 router
- dashboard-heavy SaaS
- custom ML model
- dozens of endpoints

The product should earn each adjacent layer.

## Brand direction

The commercial identity should describe buyer value, not infrastructure.

Avoid putting `x402`, `USDC`, `agent`, or `AI` in the core company name unless there is a durable brand reason.

Working naming territories to explore only after the first customer signal:

- recruiting pressure / hiring pressure
- mandate / opportunity
- change / delta
- signal / timing
- source-backed intelligence

Do not spend meaningful time on a final name before an external user values the product.

## No-Codex work window

While Codex is unavailable, the project should advance through work that does not require product code:

1. market/competitor research — completed enough to select the leading wedge
2. x402 organic-demand reality check — completed and incorporated
3. data-source/licensing research — initial pass completed
4. unit-economics model — initial pass completed
5. Product #2 contract — draft defined here
6. customer-discovery script — defined here
7. distribution map — defined here
8. Codex implementation brief — prepare only after this business plan is reviewed

Do **not** compensate for unavailable Codex by inventing additional features.

## Recommended next engineering sequence when Codex is available

1. freeze `Agency Opportunity Brief V0` contract
2. implement one jobs-data adapter plus a source fixture
3. implement normalized job records
4. implement 3–5 deterministic opportunity signals
5. add a tiny snapshot store
6. expose a free preflight
7. expose one Base Sepolia paid endpoint through the existing seller
8. instrument upstream cost, latency, data completeness and signal reasons
9. run it on a small curated set of public companies
10. show the packets to external recruiters before adding another data source

## Decision

The current commercial direction is therefore:

> **Build the smallest source-backed recruiting-opportunity intelligence product that can become more valuable through accumulated history, sell it through both normal developer channels and machine-native payment rails, and judge it only by independent repeat use and positive contribution margin.**

This direction should change immediately if customer behavior or source economics contradict it.
