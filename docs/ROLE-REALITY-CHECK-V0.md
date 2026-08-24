# Role Reality Check V0 — Validation Contract

Status: **approved for validation-grade implementation; not approved for mainnet/commercial claims**

Date: **2026-08-24**

## Purpose

Help a recruiter or recruiting agent decide whether a U.S. requisition should be **proceeded with, calibrated, or treated as high-friction** before meaningful sourcing time is spent.

The product does not predict whether a role will fill.

It compares the req against observable labor-market facts and identifies concrete calibration questions.

## One-sentence proposition

> **Send a role, location, proposed compensation and key constraints. Receive a source-backed market reality packet showing compensation alignment, market competition, occupation outlook, relevant alternate titles/skills and the specific constraints worth challenging before search begins.**

## V0 buyer

Primary:

- recruiting agent
- agency recruiter/account manager
- internal recruiter performing intake/calibration

Secondary:

- lightweight ATS/CRM/recruiting workflow software
- hiring manager tool

## Geography

V0 is **United States only** because the initial open-data source is CareerOneStop/USDOL.

Reject unsupported geography clearly.

Do not imply global coverage.

## Request contract

```json
{
  "role": {
    "title": "Controls Engineer",
    "location": "Detroit, MI",
    "radiusMiles": 50,
    "compensation": {
      "minAnnualUsd": 95000,
      "maxAnnualUsd": 120000
    }
  },
  "constraints": {
    "requiredSkills": ["PLC", "Siemens", "controls"],
    "remotePolicy": "onsite"
  }
}
```

### Required

- `role.title`: non-empty, max 140 chars
- `role.location`: U.S. city/state, state, or ZIP understood by the source; max 120 chars

### Optional

- `role.radiusMiles`: integer 0–100; default 50
- `role.compensation.minAnnualUsd`: positive number
- `role.compensation.maxAnnualUsd`: positive number >= min
- `constraints.requiredSkills`: max 12 strings, max 80 chars each
- `constraints.remotePolicy`: `onsite | hybrid | remote | unspecified`

V0 should not require a full job description.

A later version may accept one after the market packet itself proves useful.

## Source dependency

V0 provider adapter: **CareerOneStop Web API**.

Provider-side environment variables should be explicit, for example:

- `CAREERONESTOP_USER_ID`
- `CAREERONESTOP_API_TOKEN`

The buyer never supplies these credentials.

Do not commit provider credentials.

## Free preflight

Candidate route:

`POST /role-reality/preflight`

Purpose:

- validate input
- determine whether the title can map to a plausible occupation
- determine whether the location is accepted
- report whether the paid packet is available

Example:

```json
{
  "service": "x402-lab/role-reality-preflight",
  "supported": true,
  "reason": "SUPPORTED",
  "occupation": {
    "onetCode": "17-2112.00",
    "title": "Industrial Engineers"
  }
}
```

Possible reasons:

- `SUPPORTED`
- `INVALID_INPUT`
- `UNSUPPORTED_GEOGRAPHY`
- `AMBIGUOUS_OCCUPATION`
- `NO_OCCUPATION_MATCH`
- `PROVIDER_NOT_CONFIGURED`
- `PROVIDER_UNAVAILABLE`

Preflight must not return the full paid market packet.

## Paid validation route

Candidate:

`POST /role-reality`

Base Sepolia validation price:

> **$0.50 test USDC**

Why $0.50:

- high enough to test a meaningful procurement decision rather than novelty micropayment
- trivial relative to recruiter time and placement economics
- leaves room for eventual data-provider and payment costs

No mainnet price is approved yet.

## Paid response concept

```json
{
  "service": "x402-lab/role-reality",
  "network": "eip155:84532",
  "price": "$0.50",
  "asOf": "2026-08-24T20:00:00.000Z",
  "input": {
    "title": "Controls Engineer",
    "location": "Detroit, MI",
    "radiusMiles": 50
  },
  "occupation": {
    "onetCode": "...",
    "title": "...",
    "mapping": "direct|related|ambiguous"
  },
  "market": {
    "currentJobCount": 123,
    "jobCountWindowDays": 30,
    "medianAnnualWageUsd": 101000,
    "pct25AnnualWageUsd": 85000,
    "pct75AnnualWageUsd": 122000,
    "estimatedEmployment": 4200,
    "projectedAnnualOpenings": 310,
    "projectedGrowthPct": 5.4
  },
  "compensation": {
    "provided": true,
    "alignment": "below-market|market-range|above-market|insufficient-data",
    "observation": "The proposed maximum is near the local median wage."
  },
  "friction": {
    "classification": "proceed|calibrate|high-friction|insufficient-data",
    "flags": [
      {
        "type": "COMPENSATION_PRESSURE",
        "strength": "material",
        "reason": "..."
      }
    ]
  },
  "calibrationQuestions": [
    "Can the compensation ceiling move if the required skill combination proves scarce?"
  ],
  "alternateTitles": [],
  "marketSkills": [],
  "sources": [],
  "limitations": []
}
```

This schema is illustrative. Implementation should omit data that CareerOneStop cannot support reliably.

## V0 facts to retrieve

Prefer a small bounded set:

1. occupation/O*NET mapping for raw title
2. wage percentiles for mapped occupation/location
3. projected employment / annual openings where available
4. current job count for occupation/title + location over a fixed recent window
5. related/alternate titles where available
6. market skills / important skills where available
7. source metadata/citation information

Do not call every available endpoint just because it exists.

## Market competition window

Use a fixed **30-day** current-job search window for V0 unless provider behavior requires a documented adjustment.

Return the window explicitly.

The number is a demand/competition indicator, not a count of all requisitions in the market.

## Compensation alignment rules

Only classify when appropriate local wage data exists and the buyer supplied compensation.

Initial conservative rule using offered midpoint or ceiling as appropriate:

### `below-market`

The offered maximum is below the local 25th-percentile annual wage.

### `market-range`

The offered range overlaps the local 25th–75th percentile band.

### `above-market`

The offered minimum is above the local 75th-percentile annual wage.

### `insufficient-data`

Missing offered compensation or usable wage data.

Do not imply that wage percentiles equal required offer levels for a specific employer.

## Friction classification

V0 deliberately avoids a fake 0–100 score.

### `high-friction`

Use only when at least one strongly defensible friction condition exists, such as:

- offered maximum materially below the local 25th-percentile benchmark; or
- occupation mapping is clear but multiple available market facts indicate a structurally constrained search under explicit rules defined in code/tests.

Do not invent a demand/supply ratio unless numerator and denominator semantics are defensible.

### `calibrate`

Use when market facts create one or more concrete intake questions but do not justify `high-friction`.

Examples:

- compensation overlaps only the low end of market
- title maps ambiguously to multiple occupations
- required skill terms appear narrower than common market terminology
- current demand is visibly active and the req has restrictive constraints

### `proceed`

Use only when the source coverage is good and V0 finds no material market mismatch under its limited rules.

This does **not** mean the role will be easy to fill.

### `insufficient-data`

Use when source coverage cannot support a responsible classification.

## Required-skill handling

V0 should treat required skills as **calibration input**, not as a candidate-supply query.

Compare normalized supplied skill terms to occupation market skills where possible and identify:

- direct overlap
- unfamiliar/nonstandard terms
- potentially narrow combinations

Do not claim exact candidate counts by skill without a source that provides them.

Do not use an LLM in the first slice.

## Calibration-question generation

Questions should be deterministic templates tied to flags.

Examples:

### Compensation pressure

- Can the compensation ceiling move if the required profile proves scarce?
- Which requirements are important enough to justify paying above the current range?

### Ambiguous title

- Which of these market-standard occupation/title families best describes the actual work?
- Is the posted title negotiable if an alternative title reaches the intended talent pool more clearly?

### Restrictive skills

- Which required skills are true day-one requirements versus learnable after hire?
- Can equivalent tools/technologies satisfy the requirement?

### Onsite constraint

V0 may surface an intake question about location flexibility, but it must not quantify remote-policy impact without data supporting that claim.

## Source provenance

Every packet must identify:

- provider: CareerOneStop / USDOL-sponsored data
- data vintage/last-update metadata where returned
- query location
- occupation mapping used
- job-count window
- retrieval timestamp

Preserve provider citation metadata where practical.

## Error behavior

Structured errors with `retryable`.

At minimum:

- `INVALID_INPUT`
- `PROVIDER_NOT_CONFIGURED`
- `PROVIDER_UNAVAILABLE`
- `NO_OCCUPATION_MATCH`
- `AMBIGUOUS_OCCUPATION`
- `UNSUPPORTED_GEOGRAPHY`
- `INSUFFICIENT_MARKET_DATA`

## Bounded fulfillment

V0 should cap:

- provider calls per request
- provider timeout
- response size
- title/skills input size
- job-search page size

Do not paginate hundreds of job records merely to calculate a count if the provider already returns `JobCount`.

## Economics telemetry

Log structurally per fulfillment:

- provider calls by endpoint
- provider latency
- total fulfillment latency
- known provider variable cost (initial open-data prototype: $0)
- configured sale price
- fulfilled / failed
- classification

No dashboard.

## V0 tests

Use mocked provider fixtures.

### A — healthy market / comp aligned

Expected: `proceed` or mild `calibrate`, never overconfident.

### B — comp max below 25th percentile

Expected: compensation `below-market`; friction `high-friction`; compensation calibration question.

### C — comp range overlaps market

Expected: `market-range`.

### D — ambiguous title mapping

Expected: preflight refuses paid call or returns clear ambiguity according to final adapter behavior.

### E — no wage data

Expected: compensation `insufficient-data`; no fabricated benchmark.

### F — provider unavailable

Expected structured retryable failure.

### G — restrictive skill terms

Expected calibration questions without unsupported candidate-count claims.

### H — no compensation provided

Packet remains useful; compensation section says insufficient/not provided rather than failing whole request.

## Manual validation roles

Choose roles where expected recruiter intuition differs so sample packets are easy to critique.

Suggested U.S. examples:

- Controls Engineer — Detroit, MI
- Registered Nurse — Ann Arbor, MI
- Software Engineer — San Francisco, CA
- Maintenance Technician — Dallas, TX
- Human Resources Information Systems Manager — Chicago, IL

These are examples, not claims about current market difficulty.

## Falsification test

After generating sample packets, show them to external recruiters and ask:

1. Is this materially better than what you get from a normal web/AI search?
2. Would this change your intake conversation or search plan?
3. Which field would you actually use?
4. What critical market fact is missing?
5. Would you pay $0.50 for another role right now?
6. Would you call this through an API/agent instead of buying a larger subscription?

Do not upgrade the product until we have answers.

## V0 exit condition

The validation slice passes only if:

- data can be retrieved reliably with clear provenance
- output is honest and useful on multiple role types
- at least one external recruiter requests another role or says the packet would alter intake/search behavior
- the buy-vs-build argument remains credible at the proposed price

Then, and only then, decide whether to put the endpoint on public Base Sepolia and pursue a commercial provider/data expansion.
