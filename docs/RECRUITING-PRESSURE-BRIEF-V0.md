# Recruiting Pressure Brief V0 — Candidate Contract

Status: **implementation candidate; not yet approved for commercial launch**

Date: **2026-08-24**

Governing issue: #12

This document narrows the earlier **Agency Opportunity Brief** concept into a more defensible and honest product surface.

## Working product name

**Recruiting Pressure Brief**

This is a product label, not a company name.

The product does **not** claim that a company definitely needs an agency. It reports observable hiring conditions that can make outside recruiting help more relevant.

## Buyer

Initial buyer:

- recruiting-agency prospecting agent
- agency recruiter or owner
- recruiting CRM / workflow product
- developer building recruiting-business-development automation

Future buyers may include GTM, investment, labor-market, or workforce-intelligence systems, but V0 should optimize for the agency decision.

## One-sentence proposition

> **Give us a supported public careers source and your recruiting focus. We return whether the company's observable hiring footprint shows recruiting pressure worth investigating, why, and the source receipts.**

## Why this is stronger than a generic hiring-signal API

The product is not primarily selling job listings.

The value is the combination of:

1. normalized public hiring facts
2. role age where the source exposes a trustworthy published timestamp
3. recruiter-specific specialty matching
4. explainable pressure rules
5. source provenance
6. our own accumulated snapshots over time
7. later, outcome calibration against recruiter actions and wins

The long-term moat is the history and calibration layer, not scraping.

## V0 source decision

### Implement first: Greenhouse public Job Board API

Why:

- official GET endpoints are public and require no authentication
- list results expose job IDs, titles, locations, departments/offices, and updated timestamps
- individual job results expose `first_published`, which supports an explainable age signal without pretending that `updated_at` equals posting age
- the source is structurally predictable enough for a bounded adapter

Important commercial caveat:

**Public access is not the same as unrestricted redistribution rights.** V0 is a product-validation prototype. Before mainnet or conventional paid commercial use, confirm the permitted derived-data use path or replace/augment the source with a provider whose commercial terms expressly fit the product.

### Defer: Lever

Lever's Postings API is public and useful for current-job normalization, but the documented public posting shape does not expose an equivalent canonical first-published timestamp. Add Lever only after Greenhouse V0 proves useful, and do not invent age from fields that do not mean age.

### Defer: normalized commercial aggregators

JobsPipe and similar providers may become appropriate for multi-ATS coverage. Do not add one until:

- written terms fit our derived commercial use,
- unit cost is bounded,
- Greenhouse V0 shows external user interest.

## V0 request contract

The first implementation should accept an explicit supported source rather than pretending domain-to-ATS discovery is already solved.

```json
{
  "company": {
    "name": "Example Company",
    "domain": "example.com"
  },
  "source": {
    "type": "greenhouse",
    "boardToken": "examplecompany"
  },
  "agencyFocus": {
    "keywords": ["controls", "automation", "manufacturing"],
    "locations": ["Michigan"]
  }
}
```

### Input rules

- `company.name`: required non-empty string, max 120 chars
- `company.domain`: required hostname, no scheme/path
- `source.type`: V0 supports only `greenhouse`
- `source.boardToken`: required, conservative token validation, max 100 chars
- `agencyFocus.keywords`: 1–12 normalized non-empty strings, each max 60 chars
- `agencyFocus.locations`: optional, max 12 strings, each max 80 chars

No candidate names, emails, phones, resumes, LinkedIn profiles, or other person-level PII in V0.

## Free preflight

Before payment, expose a free bounded check:

`POST /recruiting-pressure/preflight`

It should answer only whether the source appears usable enough to justify a paid call.

Example:

```json
{
  "service": "x402-lab/recruiting-pressure-preflight",
  "supported": true,
  "source": {
    "type": "greenhouse",
    "boardToken": "examplecompany"
  },
  "activeJobCount": 18,
  "focusMatchCount": 5,
  "reason": "SUPPORTED"
}
```

Possible `reason` values:

- `SUPPORTED`
- `INVALID_INPUT`
- `SOURCE_NOT_FOUND`
- `SOURCE_UNAVAILABLE`
- `NO_ACTIVE_JOBS`
- `NO_FOCUS_MATCHES`
- `SOURCE_TOO_LARGE_FOR_V0`

Preflight must not return the paid pressure analysis.

## Paid endpoint

Candidate route:

`POST /recruiting-pressure`

Base Sepolia validation price:

> **$0.25 test USDC**

This price is intentionally far above Evidence Slice. The point is to test a value-bearing purchase, not prove that micropennies work.

Provisional future real-money range:

> **$0.25–$1.00 per company brief**

Do not set mainnet pricing until real users evaluate the output.

## V0 response contract

Avoid false numeric precision. V0 should return an explainable classification, not a magical 0–100 score.

```json
{
  "service": "x402-lab/recruiting-pressure",
  "network": "eip155:84532",
  "price": "$0.25",
  "company": {
    "name": "Example Company",
    "domain": "example.com"
  },
  "asOf": "2026-08-24T16:00:00.000Z",
  "pressure": {
    "classification": "high",
    "confidence": "moderate",
    "summary": "Multiple aging specialty roles and a concentrated hiring cluster are visible in the supported public source."
  },
  "signals": [
    {
      "type": "AGING_FOCUS_ROLES",
      "strength": "strong",
      "evidence": {
        "count": 3,
        "roleIds": ["123", "456", "789"]
      }
    },
    {
      "type": "SPECIALTY_CLUSTER",
      "strength": "supporting",
      "evidence": {
        "count": 5,
        "keywords": ["controls", "automation"]
      }
    }
  ],
  "hiring": {
    "activeJobsObserved": 18,
    "focusJobsObserved": 5,
    "focusJobsAged35DaysPlus": 3,
    "recruitingOrTaJobsObserved": 1
  },
  "history": {
    "observationDays": 0,
    "repostSignalsAvailable": false
  },
  "sources": [
    {
      "type": "greenhouse",
      "url": "https://job-boards.greenhouse.io/examplecompany",
      "observedAt": "2026-08-24T16:00:00.000Z"
    }
  ],
  "limitations": [
    "V0 observes only the supplied public Greenhouse board.",
    "A recruiting-pressure signal is not proof that the company will use an agency."
  ]
}
```

The exact payload may become smaller during implementation. Do not add fields merely because they are easy to calculate.

## V0 pressure classification

Classification must be deterministic and explainable.

Use only signal strengths defined in `SIGNAL-TAXONOMY-V0.md`.

Suggested initial rule:

- `high`: at least 2 strong signals, or 1 strong + at least 2 supporting signals
- `moderate`: 1 strong signal, or at least 2 supporting signals
- `low`: enough source data exists, but thresholds above are not met
- `insufficient-data`: source coverage or evidence is too weak to classify responsibly

This is a starting rule to validate with recruiters, not a scientific truth.

## Bounded fulfillment

Protect reliability and economics.

V0 server limits:

- max active Greenhouse jobs processed: 75
- max focus keywords: 12
- bounded fetch concurrency
- per-request upstream timeout
- no browser rendering
- no LLM
- no embeddings
- no candidate enrichment
- no search engine dependency
- no contact lookup

If a board exceeds the V0 processing boundary, preflight should fail clearly rather than silently sample and imply completeness.

## Snapshot/history requirement

Every successful paid analysis should create or update an observation record **only after the persistence design is explicitly approved in implementation**.

Minimum conceptual snapshot fields:

- company domain
- source type + source identifier
- observation timestamp
- external job ID
- title
- normalized title key
- location
- department if present
- first published if source provides it
- source URL
- active/closed transition derived from observations

Do not store full job descriptions unless a later product requirement earns them.

History should make these later signals possible:

- role closed
- role reappeared/reopened
- recurring same-title/location demand
- hiring acceleration/deceleration
- new geography/function relative to prior observations

Never fabricate these on the first observation.

## Success criteria for V0

V0 is useful enough to continue only if external recruiters can inspect sample outputs and do at least one of these:

- identify a company they would prioritize differently because of the packet
- say the packet removes meaningful manual research
- ask to run another company
- ask to receive the signal repeatedly
- indicate willingness to pay a plausible amount for the information

The strongest early signal is a recruiter voluntarily giving us another company to analyze.

## Falsification

Do not rescue the product with features if early evidence is weak.

Pause or kill this wedge if, after a small external validation set:

- recruiters say the information is obvious from a careers page and not worth paying for,
- pressure classifications do not change prospecting decisions,
- users primarily want contact enrichment rather than the pressure analysis,
- source coverage is too narrow to create reliable packets,
- commercial data rights make healthy margins impractical,
- acquisition cost or workflow friction overwhelms per-brief value.

## Explicit non-goals

V0 is not:

- a lead database
- a candidate database
- a contact-enrichment API
- an outreach sequencer
- a hiring-manager finder
- a CRM
- a replacement for Recruitcha, Clay, ZoomInfo, LinkedIn Recruiter, or an ATS
- a generic job-search API
- an AI-generated sales-email product

## Decision after V0

Only after recruiter validation should we decide whether to:

1. add automated domain-to-ATS discovery,
2. add another ATS adapter,
3. add a normalized commercial source,
4. add O*NET-based occupation normalization,
5. expose MCP,
6. launch a protocol-neutral commercial brand,
7. test real-money pricing.
