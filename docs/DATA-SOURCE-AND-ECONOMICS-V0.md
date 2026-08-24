# Recruiting Pressure V0 — Data Source & Economics Plan

Status: **pre-implementation operating plan**

Date: **2026-08-24**

## Objective

Build the smallest lawful, bounded data path that can produce useful Recruiting Pressure Brief samples without committing the product to an expensive aggregator, a large scraping system, or candidate/person data.

## Phase 0 — Validation source

### Greenhouse Job Board API

Official behavior relevant to V0:

- public Job Board GET data requires no authentication
- board jobs list exposes published jobs and structured fields
- `content=true` adds departments/offices/content
- individual job response exposes `first_published`

V0 should use only the fields needed for the signal product.

### Required fields to retain

From list/detail responses retain normalized facts such as:

- source job ID
- title
- location
- department name(s), when public
- office/location metadata, when public
- first-published timestamp, when explicitly provided
- updated timestamp as source metadata only
- absolute/source URL
- observation timestamp

Do not persist full descriptions in V0 unless implementation testing proves a required focus field cannot be obtained without it.

### Do not infer

- `updated_at` != first-published age
- a missing posting != permanently filled after one failed fetch
- recurring role != repost until local observations show a transition
- company need for an agency != pressure signal

## Prototype commercial-rights posture

The official Greenhouse Job Board API explicitly makes GET job-board data public, which is sufficient for a technical prototype and recruiter-facing validation using source-attributed facts.

However, **public accessibility does not by itself establish unrestricted commercial redistribution rights**.

Before real-money launch do one of the following:

1. confirm a direct permitted-use path for the derived signal product,
2. obtain written permission/partner terms where needed,
3. move commercial fulfillment to a licensed normalized provider,
4. restrict output so that it is clearly derived analysis with source links rather than republication of raw source content, after legal/terms review.

This is a release gate.

## Commercial source candidates after validation

### JobsPipe

Current published pricing observed during the 2026-08-24 research pass:

- free trial/tier: roughly 1,000 jobs
- Builder: $49/month for 25,000 jobs
- Scale: $349/month for 300,000 jobs
- published comparison rate at Scale: approximately $1 per 1,000 jobs

Why it is interesting:

- normalized records across many ATS sources
- webhooks/change delivery
- potentially removes domain-to-ATS and multi-source normalization work

Why it is not in V0:

- we have not yet proven users value the pressure product
- its terms prohibit building a competing raw job API and commercial derived-use boundaries must be confirmed for our exact product
- adding an upstream subscription before validation weakens our cheap-learning loop

Action before using commercially:

> obtain written confirmation that a derived recruiting-pressure/agency-opportunity intelligence product using JobsPipe-supplied facts is permitted under the intended plan.

### O*NET database

Current O*NET 30.3 Database content is generally available under CC BY 4.0 with attribution requirements and stated permission to copy/adapt the covered database material.

Potential future use:

- occupation/title normalization
- occupation family mapping
- skills/technology context
- role-comparison features

Why deferred from the first Codex slice:

Our first question is whether simple recruiter-focused hiring pressure is useful. O*NET improves normalization but does not create the core signal by itself.

## Source expansion order

If Greenhouse V0 validates:

1. add local history from Greenhouse observations
2. evaluate automated company-domain → supported-source discovery
3. add a second ATS only if external requested companies are frequently unsupported
4. prefer a licensed normalized feed if its cost is cheaper than maintaining adapters and its rights fit the product
5. add O*NET normalization if title noise is materially hurting signal quality

Do not pursue "57+ ATS" coverage as a vanity metric.

## Current public-source test cohort

Use companies only as technical/qualitative examples, not as claims that they need an agency.

Good Greenhouse test shapes discovered during research:

### Remora

- board token: `remoracarbon`
- small board (~4 roles in the observed public listing)
- Detroit-area engineering/operations mix
- useful for low-volume and `low/insufficient` behavior

### Atomic Industries

- board token: `atomicindustriesinc`
- medium-small board (~16 roles in the observed public listing)
- includes engineering/manufacturing roles and an active `Technical Recruiter` role
- useful for testing focus clusters and TA-capacity clue behavior

### Torc Robotics

- board token: `torcrobotics`
- medium board with substantial engineering concentration in Ann Arbor and other locations
- useful for focus keywords, multi-location handling, and larger-board bounds

### Scout Motors

- board token: `scoutmotors`
- useful technical fixture for automotive/engineering role normalization

### ALTEN Technology USA

- board token: `altentechnologyusa`
- very large board (~170 jobs in the observed listing)
- intentionally useful for proving the V0 hard bound and `SOURCE_TOO_LARGE_FOR_V0` behavior

These public listings are time-varying. Tests must not assert live counts. Unit tests should use synthetic fixtures; live-source checks belong in explicit integration/manual validation.

## Synthetic fixture matrix for Codex

Codex should create deterministic fixtures rather than make unit tests depend on live external boards.

### Fixture A — low pressure

- 8 total active jobs
- 1 focus match
- no TA roles
- focus job age 12 days

Expected: `low` if source completeness is sufficient.

### Fixture B — moderate specialty cluster

- 12 total active jobs
- 4 focus matches
- all focus jobs <35 days
- no TA roles

Expected signals:

- `SPECIALTY_CLUSTER` supporting

Expected classification: not above `low` under the initial two-supporting/one-strong rule unless another supporting signal exists. This fixture intentionally tests that a single cluster does not create hype.

### Fixture C — moderate aging pressure

- 14 total active jobs
- 3 focus matches
- 2 focus roles age 70+ days

Expected signals:

- `SPECIALTY_CLUSTER` supporting
- `AGING_FOCUS_ROLES` strong

Expected classification: `moderate` unless another supporting signal is present.

### Fixture D — high combined pressure

- 18 total active jobs
- 6 focus matches
- 4 focus roles age 35+ days, including 2 at 65+ days
- 1 active `Technical Recruiter`

Expected signals:

- `SPECIALTY_CLUSTER` strong
- `AGING_FOCUS_ROLES` strong
- `TA_CAPACITY_PRESSURE_CLUE` supporting

Expected classification: `high`.

### Fixture E — history unavailable

Same current jobs as another fixture but `observationDays=0`.

Expected:

- no `REOPENED_OR_REPEATED_ROLE` signal even if titles look duplicated
- response explicitly states repost history unavailable

### Fixture F — confirmed reappearance

Local snapshot history proves a focus title/location active → absent/closed → active again.

Expected:

- `REOPENED_OR_REPEATED_ROLE` supporting or strong according to taxonomy

### Fixture G — oversized board

- 76+ active jobs for Greenhouse V0 hard limit

Expected preflight:

- `supported=false`
- `reason=SOURCE_TOO_LARGE_FOR_V0`

No paid analysis should proceed.

## Fulfillment-cost instrumentation

Even when upstream data is free, instrument cost and work from day one.

Per request record internally/log structurally:

- source list requests
- source detail requests
- total upstream bytes if available
- source latency
- total fulfillment latency
- number of jobs inspected
- number of detail records fetched
- payment price
- known upstream variable cost
- facilitator fee assumption/config
- outcome: fulfilled / no-charge failure / paid failure

Do not expose sensitive operational details to buyers unless useful.

## Unit economics model

For a future real call:

```text
contribution margin =
  sale price
  - paid data cost
  - browser/search/model cost
  - payment facilitator cost
  - variable hosting/network allocation
  - expected failure/refund allowance
```

### V0 Greenhouse prototype

Upstream API fee: effectively $0 for the public endpoint prototype.

Main variable costs are hosting/network/payment processing.

This makes Greenhouse an excellent validation source, even though commercial-rights review remains required before real-money scale.

### Commercial target

Product #2 should target at least **60% contribution margin** at modest volume, with preference for 75%+ when the output price is $0.25–$1.00.

The product should never accept a paid request if a known upstream path could create unbounded cost.

## No-payment-on-preflight rule

The free preflight exists to avoid charging for obviously unsupported sources.

The paid route should still fail safely if the source changes between preflight and execution.

For mainnet later, investigate a payment design that avoids collecting/settling when fulfillment cannot be completed, rather than treating paid upstream failure as normal revenue.

## Data minimization

V0 intentionally excludes person-level enrichment.

Do not ingest:

- applicant data
- employee rosters
- recruiter emails/phones
- LinkedIn profile data
- resumes
- candidate identities

This reduces privacy, licensing, security, and compliance scope while we determine whether the company-level signal is worth anything.
