# Start Here Tonight — 2026-08-24

Status: **highest-priority desktop handoff for tonight**

This file supersedes any older product-specific desktop handoff language.

## 1. Pull latest `main`

Do not work from an older local branch.

Active discovery workstream: **Issue #15 — Machine Demand Observatory / Product #2 discovery**.

Active companion project: **Issue #16 — Kiroshi Optics MVP**.

**Product #2 is intentionally unknown.**

## 2. Read in this order

1. `docs/DIRECTIVE-ALIGNMENT-2026-08-24.md`
2. `docs/PRODUCT-THESIS.md`
3. `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`
4. `docs/MARKET-DATA-SOURCES-2026-08-24.md`
5. `docs/CODEX-SESSION-PLAN-2026-08-24.md`
6. `docs/KIROSHI-OPTICS.md`
7. `docs/KIROSHI-OPTICS-MVP.md`

Older Recruiting Pressure, Role Reality, Search Preflight and Practitioner Eval docs are historical evidence only.

## 3. Phase A — Core Codex mission

Create branch:

`milestone-4-5-machine-demand-observatory`

Build the smallest useful Machine Demand Observatory.

The first slice should prioritize:

- provider-neutral normalized market types;
- deterministic fixtures;
- breadth/repeat/economic/concentration metrics;
- free x402stats collection;
- one readable JSON + Markdown report;
- opportunity-card scaffold;
- existing tests/typecheck green.

Target roughly **90–120 Codex minutes** before judging the core.

Do not let the Observatory become a general analytics platform.

## 4. Phase A pass/fail gate

Ask:

> **Does this reveal materially better product evidence than manually browsing x402stats/x402scan?**

### Pass

Continue if it makes important distinctions materially clearer, especially:

- broad adoption vs high-repeat concentrated automation;
- economic value vs raw call count;
- buyer concentration;
- cross-seller shopping where observable;
- methodology/window differences;
- negative controls such as large catalogs with weak demand;
- disciplined candidate opportunity cards.

### Fail

Stop if it is just a prettier leaderboard or requires more infrastructure than insight.

Do not rescue it with:

- a database;
- a frontend framework;
- an LLM opportunity scorer;
- a scraper platform;
- more providers;
- real-money data purchases.

A documented failure is a successful discovery outcome.

If Phase A fails, **do not build Kiroshi yet**; it would only visualize weak evidence.

## 5. Real-money / capital rule

The project has approximately **$300 of experiment capital available**, but default remains **no spend**.

Do not execute any paid research request without explicit approval at execution time.

Capital is for bounded evidence-generating tests, not UI polish or infrastructure theater.

Before proposing a spend, identify:

- hypothesis;
- why free evidence is insufficient;
- maximum cost;
- continue/reject result;
- recurring-cost risk.

Do not broaden wallet/network permissions automatically.

## 6. Phase B — Kiroshi Optics

If the Observatory core passes, **Kiroshi Optics is already authorized to proceed**. No additional strategic approval is needed.

Read:

- `docs/KIROSHI-OPTICS.md`
- `docs/KIROSHI-OPTICS-MVP.md`
- Issue #16

Kiroshi is:

- local/read-only;
- a visual lens over existing Observatory exports;
- no backend/database/auth;
- no wallet access;
- no new data collection;
- no automatic product recommendations;
- **30–45 Codex minutes** for the first slice;
- $0 incremental paid infrastructure for V0.

First views:

- `MARKET SCAN`
- `TARGET SCAN`
- `OPPORTUNITY QUEUE` when card data exist
- `BUYER TRACE` only when transaction-level data actually support it

If it requires architecture changes or major dependency growth, stop.

## 7. Exact Phase A Codex prompt

> Read `docs/START-HERE-TONIGHT-2026-08-24.md`, `docs/DIRECTIVE-ALIGNMENT-2026-08-24.md`, `docs/PRODUCT-THESIS.md`, `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`, `docs/MARKET-DATA-SOURCES-2026-08-24.md`, and `docs/CODEX-SESSION-PLAN-2026-08-24.md` before editing anything. Create branch `milestone-4-5-machine-demand-observatory`. Product #2 is intentionally unknown. Build the smallest useful internal Machine Demand Observatory; prioritize provider-neutral data structures, deterministic fixtures/tests, breadth/repeat/economic/concentration metrics, free x402stats collection, one JSON/Markdown report, and an opportunity-card scaffold. Preserve source methodologies and existing x402-lab behavior. Do not build a new seller product, frontend, database, LLM opportunity scorer, unbounded scraper, or real-money execution path. Time-box the first useful core so we can judge it rather than endlessly extend it. Finish the core and tell me whether it materially beats manual dashboard browsing. If the core clearly passes, stop at the gate and summarize the exact Observatory export/interface Kiroshi Optics should consume.

## 8. Exact Phase B Kiroshi prompt

Use the exact prompt in `docs/KIROSHI-OPTICS-MVP.md`.

The strategic approval to run it after a Phase A pass has already been given.

## 9. End-of-night outcome

Best outcomes:

1. useful Observatory + 3–5 disciplined research targets;
2. useful Observatory + first functioning Kiroshi Optics scanner;
3. documented conclusion that the Observatory itself does not improve discovery enough to justify more work.

None of these require Product #2 to be selected tonight.