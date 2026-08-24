# Kiroshi Optics — Machine Demand Scanner

Status: **active internal companion project; not Product #2; not a commercial brand**

Date: **2026-08-24**

## Purpose

**Kiroshi Optics** is the read-only visual scanner for the Machine Demand Observatory.

It has two jobs:

1. make revealed machine-demand evidence materially faster to inspect;
2. make the discovery work enjoyable enough that we actually use the instrument repeatedly.

It is not a seller product, revenue hypothesis, company name, or evidence of product-market fit.

Because the codename is inspired by the Cyberpunk fictional universe, keep it internal/personal. Use original styling only. Do not copy official logos, artwork, fonts, screenshots, UI assets, or imply affiliation/endorsement. Any commercial product gets an original protocol-neutral identity.

## Relationship to the Observatory

The Observatory is the evidence engine.

Kiroshi is the lens.

```text
market sources
    ↓
Machine Demand Observatory
    ↓
normalized snapshots + metrics + opportunity cards
    ↓
Kiroshi Optics
    ↓
human product-discovery decisions
```

Kiroshi must not create a second data pipeline, second methodology, or hidden recommendation engine.

## Implementation authorization

Kiroshi is approved to move forward **after the minimal Observatory core passes its usefulness gate**.

No additional owner approval is required to begin the first Kiroshi slice once that gate passes.

If the Observatory core fails, Kiroshi pauses because there is nothing trustworthy to visualize.

## V0 objective

> **Turn one Observatory export into a fast local scanner that lets a human distinguish broad demand, repeated demand, concentration risk, buyer shopping behavior, and research candidates without reading raw JSON.**

V0 should be useful in one sitting, not architecturally impressive.

## V0 architecture

Prefer the smallest implementation compatible with the existing Node/TypeScript repo:

- vanilla HTML/CSS/TypeScript or similarly tiny static approach;
- local/read-only;
- consumes existing Observatory JSON exports;
- imports Observatory types where practical rather than duplicating them;
- no separate backend;
- no database;
- no authentication;
- no wallet access;
- no paid-data execution;
- no new external data collection;
- no frontend framework unless the existing implementation makes it genuinely cheaper than vanilla code;
- no new production deployment requirement.

The viewer may be served by a tiny local static command if opening the generated HTML directly is awkward.

## V0 views

### 1. MARKET SCAN

Show the current evidence context before any seller ranking:

- provider/source;
- observation time;
- source window;
- methodology/version;
- raw metrics;
- source-defined organic/filtered metrics separately where available;
- concentration context;
- freshness/status;
- limitations.

A user should immediately understand **what this dataset can and cannot prove**.

### 2. TARGET SCAN

Select one merchant/service and show:

- name/id/origin;
- what is sold when known;
- unique buyers;
- transactions;
- transactions per buyer;
- volume;
- volume per buyer;
- average transaction value;
- concentration indicators when transaction-level data exists;
- resource count and prices where known;
- descriptive demand-shape flags;
- source/provenance;
- human qualitative-review fields.

Never collapse this into one opportunity score.

### 3. BUYER TRACE

When transaction-level data permits:

- buyer identifier;
- distinct sellers purchased from;
- repeated seller relationships;
- total activity/spend context;
- category/seller mix where known;
- cross-seller shopper indicator.

This exists to make procurement-like behavior easier to spot.

If the current dataset lacks transaction-level buyer detail, display an explicit `INSUFFICIENT TRACE DATA` state instead of fabricating a view.

### 4. OPPORTUNITY QUEUE

Render the Observatory's human-reviewed opportunity cards:

- observed demand evidence;
- breadth/repeat/concentration caveat;
- buy-vs-build hypothesis;
- substitutes/competition;
- supply path;
- economics;
- possible advantage;
- cheapest falsification test;
- decision state: `UNREVIEWED | REJECT | RESEARCH | TEST`.

Kiroshi may filter/sort these records. It may not auto-promote them.

### 5. ANOMALY / THREAT PANEL

Use scanner-style presentation for factual descriptive flags such as:

- `CONCENTRATION RISK`
- `SINGLE-BUYER DOMINANCE`
- `METHODOLOGY MISMATCH`
- `LOW OBSERVED DEMAND`
- `PRICE UNKNOWN`
- `TRACE DATA UNAVAILABLE`

Do not label activity fake, fraudulent, self-dealing, independent, or organic beyond what source evidence supports.

## V0 visual language

Original cyber-optics feel, not a clone of any copyrighted game UI.

Suggested qualities:

- dark optical-scanner workspace;
- high information density without becoming unreadable;
- sharp panels and reticle-like focus states;
- restrained glow/noise effects;
- clear typography for numbers and provenance;
- source/methodology warnings visually prominent;
- subtle motion only if trivial and accessible;
- keyboard-friendly target switching if cheap to implement.

Function beats decoration.

## Useful visualizations

Only add a visualization if it answers a real discovery question faster.

Highest-value candidates:

1. **breadth vs repeat scatter** — unique buyers vs transactions-per-buyer;
2. **economic demand scatter** — unique buyers vs volume-per-buyer;
3. **buyer concentration indicator** — when transaction-level detail supports it;
4. **cross-seller trace** — simple seller-count/network treatment for a buyer;
5. **snapshot delta indicators** — when two compatible observations exist.

Prefer native SVG/Canvas/simple DOM over installing a charting stack solely for V0.

## Data-honesty requirements

Every relevant screen must preserve or surface:

- source;
- observed-at timestamp;
- time window;
- methodology/version where available;
- missing values as unknown, never coerced to zero;
- raw and provider-defined filtered/organic semantics separately;
- incompatibility warnings for comparisons;
- whether buyer-level claims come from transaction-level evidence or aggregate estimates.

## V0 acceptance test

Kiroshi passes when a human can take the same Observatory export and answer these faster than by opening JSON/Markdown:

1. Is demand broad or concentrated?
2. Is usage repeated or mostly one-off?
3. Is economic value meaningful relative to call count?
4. Are any buyers shopping across multiple sellers?
5. What capability is actually being purchased?
6. What is the strongest caveat in the evidence?
7. Which merchant/capability deserves manual research next?

If the interface merely looks cool, keep it as a toy but do not count it as discovery progress.

## First implementation budget

After Observatory core approval:

- target **30–45 minutes** for the first functioning Kiroshi slice;
- permit another short iteration only if the first slice clearly improves interpretation;
- stop if it requires a new framework, database, authentication, deployment stack, or major refactor.

## Capital rule

Kiroshi itself should require **$0 incremental paid infrastructure** for V0.

The project has limited experiment capital available for evidence-generating tests, but UI polish is not an approved use of that capital.

## Codex prompt — first Kiroshi slice

> The minimal Machine Demand Observatory core has passed its usefulness gate, and Kiroshi Optics is authorized to proceed. Read `docs/KIROSHI-OPTICS.md` and reuse the Observatory's normalized types/exports rather than creating another data layer. Build the smallest local read-only Kiroshi Optics scanner using the existing Node/TypeScript repository and preferably vanilla HTML/CSS/TypeScript. Do not add a database, auth, wallet access, paid-data execution, new providers, external data collection, recommendation engine, production deployment, or commercial branding. Implement MARKET SCAN and TARGET SCAN first. Add BUYER TRACE only when real transaction-level fields exist, otherwise show an explicit insufficient-data state. Add OPPORTUNITY QUEUE if opportunity-card exports already exist. Preserve source, observation time, window, methodology, missing-data semantics, and limitations prominently. Use an original futuristic optical-scanner visual treatment without copying Cyberpunk assets/logos/fonts/UI. No single opportunity score. Prefer simple native visuals over new chart dependencies. Finish with one command that opens/serves the viewer against a fixture export and one against the latest Observatory export, plus tests for any nontrivial data-to-view transformation.

## Future

If the Observatory becomes a repeatedly useful research instrument, Kiroshi may grow modestly with it.

Do not let it become a general analytics platform.

A future commercial product, if discovered, is a separate decision.