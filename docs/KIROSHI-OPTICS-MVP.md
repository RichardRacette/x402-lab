# Kiroshi Optics MVP — Execution Plan

Status: **approved companion implementation after Observatory core gate**

Date: **2026-08-24**

## Objective

Build a tiny local visual scanner that makes Machine Demand Observatory evidence faster to interpret without creating a new data or product architecture.

## Dependency

Kiroshi starts only after the Observatory can produce a normalized export containing enough of:

- ecosystem/source metadata;
- merchant snapshots;
- derived merchant metrics;
- demand-shape flags;
- optional buyer-level traces;
- optional opportunity cards.

The viewer must consume that export rather than recreate calculations.

## First slice

Minimum viable scanner:

1. load one Observatory JSON bundle;
2. render **MARKET SCAN** with source/window/methodology/limitations;
3. render a merchant list and **TARGET SCAN**;
4. show unique buyers, transactions per buyer, volume per buyer and available concentration fields;
5. show flags and unknown/missing values honestly;
6. show source/provenance on the same screen;
7. provide a lightweight way to switch targets;
8. run locally with one documented command.

If the Observatory export already includes opportunity cards, render a basic **OPPORTUNITY QUEUE** in the same slice.

Do not block V0 on BUYER TRACE if transaction-level data are not yet available.

## Preferred implementation

Because the repository currently has Node/TypeScript/Express and no frontend framework, prefer a tiny implementation over dependency growth.

Good options:

- generated static HTML + CSS + small browser JavaScript/TypeScript bundle;
- tiny local static server using existing dependencies;
- native SVG for the first useful scatter/indicator.

Avoid React/Vite/Next/etc. unless Codex demonstrates that using one already-present mechanism is materially simpler. Do not add a framework merely for aesthetics.

## Suggested repository shape

Adapt to the actual Observatory implementation, but something like:

```text
src/kiroshi/
  build.ts
  view-model.ts
  template.ts
  styles.ts

artifacts/kiroshi/
  index.html
  data.json
```

or an equivalently small structure.

Do not duplicate Observatory domain types if they can be imported.

## View-model rule

Any transformation from Observatory data to display data must be deterministic and testable.

The view model may:

- format numbers;
- sort/filter records;
- choose which existing flags to display;
- calculate display-only positions from already-computed metrics.

It may not:

- invent missing market values;
- recompute strategic opportunity decisions;
- infer independent/organic/fake activity;
- create a proprietary opportunity score.

## Visual target

Think **research scanner**, not analytics SaaS.

Original styling only:

- dark optical field;
- red/amber/cool-light accents chosen by implementation without copying game assets;
- reticle/focus treatment around selected target;
- compact data blocks;
- visible methodology warning strip;
- status chips for factual flags;
- monospace-friendly numerical readout;
- minimal motion.

Accessibility and readability beat visual mimicry.

## Acceptance criteria

The first slice passes if:

- it loads a fixture export and a current Observatory export;
- source/methodology/window/observation time are always visible;
- missing values display as unknown/unavailable;
- raw vs provider-defined filtered/organic semantics remain distinct;
- a user can switch merchants without editing code;
- TARGET SCAN is faster to interpret than the equivalent raw JSON;
- no network request, wallet action or data mutation is required by the viewer;
- existing tests/typecheck remain green;
- incremental paid infrastructure cost is $0.

## Time box

Initial Codex implementation: **30–45 minutes** after Observatory approval.

If a functioning slice cannot be produced inside that scale without architectural expansion, stop and report the obstacle.

## Stretch only after first slice works

In priority order:

1. breadth-vs-repeat scatter;
2. opportunity queue filters;
3. buyer trace when transaction-level data exist;
4. compatible snapshot deltas;
5. small keyboard/reticle interactions.

No stretch feature is required for the project to continue.

## Exact Codex prompt

> Kiroshi Optics is now an approved active companion project, but it must remain a read-only lens over the Machine Demand Observatory. Confirm the minimal Observatory core has passed its usefulness gate, then read `docs/KIROSHI-OPTICS.md` and `docs/KIROSHI-OPTICS-MVP.md`. Reuse the Observatory's normalized types and JSON exports. Build the smallest local scanner with MARKET SCAN and TARGET SCAN first, plus OPPORTUNITY QUEUE only if opportunity-card data already exist. Prefer vanilla HTML/CSS/TypeScript or a similarly tiny static approach using the repository's existing Node/TypeScript stack; do not add a frontend framework unless it is demonstrably simpler. Do not add a backend, database, auth, wallet access, paid calls, new providers, scraping, recommendation engine, production deployment or a single opportunity score. Preserve source, observation time, window, methodology, provenance, limitations and missing-data semantics prominently. Use original futuristic optical-scanner styling without copying Cyberpunk assets, logos, fonts or UI. Keep the first implementation to a 30–45 minute scope. Finish with exact commands to build/open the viewer against fixture data and the latest Observatory export, and run tests/typecheck.