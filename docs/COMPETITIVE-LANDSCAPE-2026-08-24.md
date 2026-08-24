# Competitive Landscape Snapshot — 2026-08-24

Status: **research memory; re-check before making future market claims**

This file preserves the competitive discoveries that changed Product #2 direction.

Numbers, pricing and features are time-sensitive.

## 1. Agent-commerce lesson

The x402 ecosystem contains many generic utility catalogs with weak observed usage, while stronger observed activity appears around:

- credential/API abstraction
- enrichment/data access
- browser/document infrastructure
- model/compute access
- specialist research/data

### StableEnrich

Observed during research:

- tens of thousands of 30-day transactions
- hundreds of buyers
- pay-per-request access to multiple upstream enrichment/search/data services
- buyer avoids maintaining each upstream account/subscription

Strategic lesson:

> **Access friction itself can be sellable when the underlying capability is useful.**

This pattern is more important to x402-lab than copying any individual upstream API.

## 2. Company hiring signals are crowded

### Reqbeat

Current documented surface included:

- `is-hiring`
- open reqs
- hiring pulse / velocity / direction
- first-hire signals
- repost pain
- pre-action brief
- outcomes
- attribution
- calibrated intent

This invalidated the belief that our earlier Recruiting Pressure Brief was sufficiently distinct.

### Signalbase

Current positioning includes:

- real-time hiring signals
- hiring velocity
- role shelf-life
- talent-supply strain
- repost density
- first-hire detection
- API/webhooks/MCP
- recruiting-agency use cases

### Recruitcha

Current recruiting-agency BD tooling includes fresh/stale role signals and hiring intelligence.

### Conclusion

Do not build:

> "Company X looks like it may need recruiting help because jobs are old/reposted/clustered."

That can still be an upstream signal inside a future product, but it is not our product wedge.

## 3. Fillability / talent-market intelligence is also established

### Lightcast Talent Benchmark API

Packages, for a job title and location:

- supply
- demand
- compensation
- skills
- diversity

This proves the underlying decision is valuable but also sets a high benchmark for sophisticated market data.

### TalentNeuron

APIs/data support:

- demand
- supply / relative supply
- salary
- competitive concentration
- posting period
- employers
- top skills/titles
- hiring difficulty questions

### Joveo AI Staffing Advisor

Current positioning includes:

- predicted fill rates
- high-probability / at-risk job orders
- recruiter capacity
- revenue-at-risk

### TalMan

Current positioning includes:

- market viability score
- salary alignment
- market intelligence reports
- talent supply/demand

### Other recruiting operations products

- Automindz describes a Fillability Score in its recruiting agent/skills stack
- Seven20 advertises commitment/fillability management
- SetpointHQ explicitly positions its product as helping make roles fillable
- LinkedIn Talent Insights provides talent pool/hiring-demand information in an enterprise product

### Conclusion

Do not market Role Reality as:

> "the first fillability score."

That would be false and strategically weak.

## 4. Possible gap: pay-per-role access model

Current discovery did **not** identify a dominant agent-native product with the exact experience:

```text
one U.S. role + location + comp + constraints
    ↓
no buyer API key or enterprise subscription
    ↓
one source-backed market-calibration packet
    ↓
pay only for that decision
```

This is an **access-model hypothesis**, not proof of an uncontested market.

Examples of adjacent pay-per-role/no-subscription behavior exist elsewhere in recruiting, including sourcing/report products, which suggests users can understand transaction-based pricing.

## 5. Open-data substrate

### CareerOneStop

U.S. Department of Labor-sponsored CareerOneStop states its API data are open data under USDOL's Open Data Policy and explicitly describes third parties integrating and displaying the information in their own products.

Useful APIs include:

- occupation lookup/details
- wages
- projected employment/openings
- skills/knowledge
- current Jobs V2 search with `JobCount`
- LMI

Provider token required; buyer does not need one.

### O*NET

O*NET database content is generally available under CC BY with attribution and can support future title/occupation/skills normalization.

## 6. Agency economics validate the decision value

Current 2026 sources commonly describe direct-hire fees around 15–30% of first-year salary, with specialist/hard-to-fill work often toward the upper end.

The important implication is not the exact industry percentage.

It is:

> **A recruiter can spend substantial time on a contingent search and receive $0 if someone else fills it or the req is not realistically fillable.**

Current agency guidance explicitly recommends prioritizing reqs using both revenue potential and fillability.

This supports testing a low-cost product that improves the decision before search effort begins.

## 7. User-language evidence from recruiter communities

Recent recruiter discussions show:

- skepticism toward expensive generic AI add-ons
- stronger reported value from market research
- use of AI to consolidate intake notes and create search plans
- concern about whether tools save measurable recruiter time
- emphasis on role calibration, must-have vs nice-to-have, compensation, location and feedback expectations

Product implication:

> Avoid "AI for recruiting" positioning. Sell a specific decision/workflow outcome.

## 8. Current positioning hypothesis

Working category:

**on-demand recruiter market intelligence**

Working product:

**Role Reality Check**

Working promise:

> Market-ground a req before you burn sourcing time.

The product should win, if at all, by:

- no enterprise contract
- no buyer-side data/API credentials
- bounded per-role price
- machine-readable response
- source receipts
- recruiter-specific calibration output
- honest limitations

## 9. Defensibility ladder

### V0

Weak moat:

- integration/orchestration
- packaging
- machine-payable distribution

### V1 if demand exists

Potential improvements:

- better title/occupation crosswalks
- actual search-outcome labels
- req calibration outcomes
- specialty-specific rule packs
- premium sources with contractual rights

### Long-term

Potential defensibility requires proprietary evidence such as:

- which req attributes predicted stalled searches
- which calibration changes improved time-to-shortlist/fill
- recruiter/agency-specific priors
- benchmarked response to compensation/location/skill relaxation

Do not claim this before we collect it.

## 10. Strategic rules retained

- x402 is a rail, not the company
- do not compete on endpoint count
- do not rescue weak products with LLM features
- market data must be useful without crypto
- no mainnet until real utility exists
- commercial brand stays protocol-neutral
- kill hypotheses early when competition or users invalidate them
