# Kiroshi Optics — Internal Observatory Viewer

Status: **optional fun/stretch layer; not Product #2; not a commercial brand**

Date: **2026-08-24**

## Purpose

**Kiroshi Optics** is the internal codename for a read-only visual scanner over Machine Demand Observatory outputs.

It exists for two reasons:

1. make market-discovery data faster and more enjoyable to inspect;
2. give the project a fun Cyberpunk-flavored interface without allowing UI work to replace product discovery.

It is **not** a seller product, revenue hypothesis, company name, or evidence of product-market fit.

Because the name is borrowed from the Cyberpunk fictional universe, treat it as a personal/internal project codename only. Do not use official logos, artwork, fonts, screenshots, copied UI assets, or imply affiliation/endorsement. Any future commercial product must use an original protocol-neutral brand.

## Build gate

Do **not** build Kiroshi Optics until the Observatory core has passed all of these checks:

- fixture metrics/tests are green;
- at least one real/free x402stats snapshot can be collected and normalized;
- JSON + Markdown reports work;
- the Observatory reveals breadth vs repeat vs concentration more clearly than manual dashboard browsing;
- Product #2 remains explicitly unselected.

If the Observatory fails its usefulness gate, Kiroshi Optics is cancelled with it.

## Time budget

Kiroshi Optics is a stretch goal, not the night's main task.

Initial implementation target: **30–45 Codex minutes maximum** after the core Observatory gate passes.

If the viewer requires a new framework, database, auth system, deployment target, design system, or major refactor, stop.

## Architecture

Prefer the cheapest possible implementation:

- local/read-only;
- consumes existing normalized Observatory JSON files;
- no separate backend;
- no database;
- no authentication;
- no writes to market snapshots;
- no wallet access;
- no paid-data execution;
- no recommendation engine;
- no new external data collection.

A static HTML/TypeScript page or similarly tiny local viewer is preferred over adding a full frontend framework.

The Observatory remains the source of truth. Kiroshi Optics is only a lens.

## Visual concept

The experience should feel like a futuristic optical scanner rather than a SaaS analytics dashboard, while using original visual treatment.

Suggested screen language:

### MARKET SCAN

High-level ecosystem context:

- source + observation time;
- raw vs source-defined organic context;
- transaction/volume context;
- seller concentration;
- methodology warning;
- freshness indicator.

### TARGET SCAN

One merchant/service at a time:

- what is sold;
- unique buyers;
- transactions per buyer;
- volume per buyer;
- concentration indicators;
- current resources/prices when known;
- descriptive demand-shape flags;
- source/provenance;
- human qualitative review fields.

Never collapse these into a fake single opportunity score.

### BUYER TRACE

When transaction-level data permits:

- buyer identifier;
- distinct sellers purchased from;
- repeated seller relationships;
- category mix;
- spend/activity context;
- cross-seller shopper flag.

This view should make real procurement-like behavior easier to spot.

### THREAT / ANOMALY PANEL

Use a fun scanner-style label, but keep the semantics factual. Examples:

- `CONCENTRATION RISK`
- `SINGLE-BUYER DOMINANCE`
- `METHODOLOGY MISMATCH`
- `LOW OBSERVED DEMAND`
- `PRICE / DATA UNKNOWN`

Do not label sellers as fake, fraudulent, self-dealing, or manipulated without evidence.

### OPPORTUNITY QUEUE

Read-only rendering of human-reviewed opportunity cards:

- observed demand evidence;
- buy-vs-build hypothesis;
- substitutes/competition;
- supply path;
- economics;
- possible advantage;
- falsification test;
- decision state: `UNREVIEWED | REJECT | RESEARCH | TEST`.

The UI may make cards easier to compare. It must never promote a card automatically.

## Useful visualizations

Only include visualizations that materially improve interpretation. Candidates:

- breadth vs repeat scatter;
- volume per buyer vs unique buyers;
- seller concentration bar/indicator;
- simple cross-seller buyer network or seller-count trace;
- snapshot delta indicators.

Avoid decorative charts that make weak data look more authoritative.

## Data honesty rules

Kiroshi Optics must display:

- source;
- observation timestamp;
- time window;
- methodology/version where available;
- missing values as unknown, not zero;
- raw and source-defined organic metrics separately;
- limitations prominently when comparisons are incompatible.

The viewer must not infer `organic`, `independent`, `fake`, `self-dealing`, or `real customer` beyond what evidence supports.

## Success test

Kiroshi Optics succeeds only if it helps a human answer faster:

- Is demand broad or concentrated?
- Is usage repeated or mostly one-off?
- Are buyers shopping across sellers?
- What capability is actually being purchased?
- What should we research next?

If it merely looks cool, it is a successful toy but **not** a successful project feature. Keep it small.

## Future

If the Machine Demand Observatory becomes genuinely useful, Kiroshi Optics can grow modestly as the internal research console.

If a commercial product eventually emerges, its customer-facing UI should be independently named and designed. Do not automatically carry the Kiroshi codename into a business.