# Kiroshi Optics MVP — Execution Plan

Status: **approved companion implementation after Observatory core gate**

Date: **2026-08-24**

## Objective

Build the first useful slice of a local **Netrunner perception console**: a read-mostly Kiroshi shell that consumes Machine Demand Observatory evidence today and can accept additional quest/repo/host/target sensors later without a rewrite.

Read `docs/KIROSHI-NETRUNNER-VISION.md` before implementation.

## Governing rule

> **Better eyes, not bigger weapons.**

Kiroshi improves perception, correlation, prioritization and traceability across systems we own/control, public data and explicitly authorized targets. It is not an intrusion toolkit.

## Dependency

Kiroshi starts after the Observatory can produce a normalized export containing enough of:

- ecosystem/source metadata;
- merchant snapshots;
- derived merchant metrics;
- demand-shape flags;
- optional buyer-level traces;
- optional opportunity cards.

The Market Optic consumes that export rather than recreating calculations.

## V0 architectural spine

Establish a small:

`Sensor → Normalize → Correlate → Render`

boundary.

Do not build a plugin framework. A few explicit TypeScript interfaces/types are enough.

A sensor result should preserve at least:

- sensor/module name;
- observation timestamp;
- source/tool/version where known;
- scope/target;
- raw or normalized evidence reference;
- status: `OK | UNKNOWN | STALE | ERROR | UNAVAILABLE`;
- limitations.

Kiroshi flags/correlations must be deterministic and testable.

## First working slice

### 1. MARKET OPTIC

Required:

1. load one Observatory JSON bundle;
2. render **MARKET SCAN** with source/window/methodology/limitations;
3. render merchant list + **TARGET SCAN**;
4. show unique buyers, transactions per buyer, volume per buyer and available concentration fields;
5. show factual flags and unknown/missing values honestly;
6. show source/provenance on the same screen;
7. switch targets without editing code.

If opportunity cards already exist, render a basic **OPPORTUNITY QUEUE**.

Do not block V0 on BUYER TRACE if transaction-level data are unavailable.

### 2. QUEST OPTIC — minimal if cleanly available

Add a tiny project-state view only if it can be done without new credentials or infrastructure.

Useful local observations:

- current git branch;
- HEAD commit;
- dirty/clean working tree;
- relevant active project identifiers from local config/docs;
- test/typecheck command availability;
- current declared next gate/quest.

If GitHub CLI/API access is already available locally, Codex may propose a later adapter. Do not require or configure credentials tonight merely for this view.

### 3. SENSOR BAY

Show future sensor availability without installing anything.

Detect/label as `AVAILABLE` or `NOT DETECTED` where cheap and safe:

- Microsoft Sysinternals tools / relevant executables;
- Trivy;
- GitHub CLI;
- native PowerShell capabilities needed for future read-only host scans.

Detection is not installation and must not request elevation.

## Preferred implementation

Keep the current Node/TypeScript stack small.

A strong V0 pattern is:

```text
npm run kiroshi:scan
        ↓
read Observatory export + local read-only project/tool state
        ↓
write one Kiroshi snapshot JSON
        ↓
render/generate local static viewer
```

This keeps the UI read-only while allowing future sensors to refresh the snapshot.

Good options:

- generated static HTML + CSS + small browser JS/TS;
- tiny local static server using existing dependencies;
- native SVG/DOM for one genuinely useful visualization.

Avoid React/Vite/Next/etc. unless an already-present mechanism is materially simpler. No framework merely for aesthetics.

Suggested shape:

```text
src/kiroshi/
  types.ts
  scan.ts
  correlate.ts
  view-model.ts
  render.ts
  sensors/
    observatory.ts
    quest-local.ts
    availability.ts

artifacts/kiroshi/
  snapshot.json
  index.html
```

Adapt to actual implementation; fewer files are fine.

## View-model rules

May:

- format numbers;
- sort/filter existing observations;
- select existing flags;
- calculate display-only positions from computed metrics;
- highlight explicit risk/blocker states.

May not:

- invent missing values;
- create a single opportunity score;
- infer fake/self-dealing/independent activity without evidence;
- claim a process/connection is malicious from anomaly alone;
- perform external actions;
- install software;
- request admin rights;
- execute paid calls.

## Real Netrunner modules — roadmap, not tonight's requirement

After V0 proves useful:

### REPO OPTIC / SCAN WEAKNESSES

Ingest structured output from a mature defensive scanner (for example vulnerability/secret/misconfiguration findings) rather than building our own scanner database.

### HOST OPTIC / WALLHACK

Read-only correlation across our own PC:

- process;
- local TCP/UDP endpoint;
- executable/path/signature metadata;
- startup entry;
- local security state where available.

Prefer native Windows telemetry or trusted Microsoft Sysinternals outputs. No third-party network scanning or access-control bypass.

### TRAP PANEL

Cross-module warnings for:

- secret exposure;
- dependency/config risk;
- unexpected local activity;
- stale/incompatible evidence;
- research-budget/price risk;
- blocked quest;
- unsafe/elevated proposed action.

These are review signals, not automatic malware/fraud verdicts.

### TARGET OPTIC

Deep analysis of public or explicitly authorized merchant/repository/domain targets, retaining provenance and scope.

## Visual target

Think **cybernetic research scanner**, not analytics SaaS.

Original styling only:

- dark optical field;
- original red/amber/cool-light accents;
- selected-target reticle/focus treatment;
- compact readouts;
- methodology/authorization warning strip;
- factual threat/risk chips;
- monospace-friendly numerical display;
- minimal purposeful motion.

Accessibility/readability beats mimicry. Do not copy official Cyberpunk logos, artwork, fonts, screenshots, or UI assets.

## Acceptance criteria

First slice passes if:

- fixture + current Observatory exports load;
- source/methodology/window/observation time remain visible;
- missing values render as unknown/unavailable;
- raw vs provider-defined organic/filtered semantics remain distinct;
- target switching is easy;
- TARGET SCAN is faster to interpret than raw JSON;
- Kiroshi has a small sensor/module boundary suitable for future optics;
- QUEST OPTIC or explicit `UNAVAILABLE` state behaves honestly;
- future sensor availability can be displayed without installing/elevating;
- viewer performs no wallet/network mutation;
- existing tests/typecheck remain green;
- incremental paid infrastructure cost is $0.

## Time box

Do not attempt the entire Netrunner vision tonight.

After the Observatory core passes, target roughly **45–60 Codex minutes** for the Kiroshi foundation. If the module spine + Market Optic cannot be built in that scale without architecture expansion, stop and report why.

## Stretch order

Only after first slice works:

1. breadth-vs-repeat visual;
2. stronger Quest Optic;
3. Repo Optic Lite using an already-available local scanner or `npm audit`-style evidence;
4. Host sensor proof using safe read-only local commands;
5. Buyer Trace when transaction-level market data exist;
6. keyboard/reticle navigation.

Do not install new sensors automatically as a stretch step.

## Exact Codex prompt

> The minimal Machine Demand Observatory core has passed its usefulness gate. Now read `docs/KIROSHI-NETRUNNER-VISION.md`, `docs/KIROSHI-OPTICS.md`, and `docs/KIROSHI-OPTICS-MVP.md`. Build Kiroshi as a small local Netrunner perception console, not merely a dashboard and not an offensive security tool. Establish a minimal Sensor → Normalize → Correlate → Render boundary that preserves timestamp/source/tool/version/scope/status/limitations. Reuse the Observatory's normalized types and JSON export for MARKET OPTIC / TARGET SCAN; do not recompute its strategic metrics. Add a minimal QUEST OPTIC from safe local project state if cleanly possible, and a SENSOR BAY that only detects availability of future tools such as Sysinternals, Trivy, GitHub CLI, or relevant native PowerShell capabilities without installing anything or requesting elevation. Prefer a scan/build command that emits a Kiroshi snapshot JSON plus a static local viewer using the existing Node/TypeScript stack. No backend service, database, auth, wallet access, paid calls, new market providers, external scanning, software installation, elevated actions, recommendation engine, or single opportunity score. Use original futuristic optical-scanner styling without copying Cyberpunk assets. Keep this first foundation bounded to roughly 45–60 minutes. Finish with exact commands to generate/open Kiroshi, test it against fixture/current Observatory exports, and list which future sensors are available or missing. Run tests and typecheck.