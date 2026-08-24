# Start Here Tonight — 2026-08-24

Status: **highest-priority desktop handoff for tonight**

This file supersedes any older product-specific desktop handoff language.

## 1. Pull latest `main`

Do not work from an older local branch.

Active issue: **#15 — Machine Demand Observatory / Product #2 discovery**.

**Product #2 is intentionally unknown.**

## 2. Read in this order

1. `docs/DIRECTIVE-ALIGNMENT-2026-08-24.md`
2. `docs/PRODUCT-THESIS.md`
3. `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`
4. `docs/MARKET-DATA-SOURCES-2026-08-24.md`
5. `docs/CODEX-SESSION-PLAN-2026-08-24.md`
6. `docs/KIROSHI-OPTICS.md`

Older Recruiting Pressure, Role Reality, Search Preflight and Practitioner Eval docs are historical evidence only.

## 3. Core Codex mission

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

## 4. Core pass/fail gate

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

## 5. Real-money rule

Default: **no spend**.

Do not execute any paid x402 research request without separate explicit owner approval during the session.

Preparing/dry-running a capped command is allowed. Executing it is not.

Do not broaden wallet/network permissions automatically.

## 6. Kiroshi Optics — optional fun unlock

Only after the Observatory core passes:

Read `docs/KIROSHI-OPTICS.md` and give Codex a separate stretch task.

Kiroshi Optics is:

- local/read-only;
- a visual lens over existing Observatory JSON;
- no backend/database/auth;
- no wallet access;
- no new data collection;
- no automatic product recommendations;
- **30–45 Codex minutes maximum** for the first slice.

It is an internal codename inspired by the Cyberpunk fictional universe, not a commercial brand. Use original styling/assets only.

Suggested first views:

- `MARKET SCAN`
- `TARGET SCAN`
- `BUYER TRACE`
- `OPPORTUNITY QUEUE`

If it takes longer than the bounded stretch or requires architecture changes, stop.

## 7. Exact first Codex prompt

> Read `docs/START-HERE-TONIGHT-2026-08-24.md`, `docs/DIRECTIVE-ALIGNMENT-2026-08-24.md`, `docs/PRODUCT-THESIS.md`, `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`, `docs/MARKET-DATA-SOURCES-2026-08-24.md`, and `docs/CODEX-SESSION-PLAN-2026-08-24.md` before editing anything. Create branch `milestone-4-5-machine-demand-observatory`. Product #2 is intentionally unknown. Build the smallest useful internal Machine Demand Observatory; prioritize provider-neutral data structures, deterministic fixtures/tests, breadth/repeat/economic/concentration metrics, free x402stats collection, one JSON/Markdown report, and an opportunity-card scaffold. Preserve source methodologies and existing x402-lab behavior. Do not build a new seller product, frontend, database, LLM opportunity scorer, unbounded scraper, or real-money execution path. Time-box the first useful core so we can judge it rather than endlessly extend it. Finish the core and tell me whether it materially beats manual dashboard browsing. Do **not** start Kiroshi Optics yet; that is a separate stretch task only if I approve after reviewing the core.

## 8. Kiroshi stretch prompt — use only after core approval

> The Machine Demand Observatory core has passed its usefulness gate. Now read `docs/KIROSHI-OPTICS.md`. Build the smallest local read-only Kiroshi Optics viewer over the Observatory's existing normalized JSON outputs. Do not add a backend, database, auth, wallet access, new provider, data collection, recommendation engine, or commercial branding. Use original futuristic scanner styling; do not copy official Cyberpunk assets/logos/fonts/UI. Prioritize MARKET SCAN, TARGET SCAN, BUYER TRACE where data exists, and OPPORTUNITY QUEUE. Preserve source/methodology/observation-time/limitations prominently. Do not invent a single opportunity score. Keep this first viewer slice bounded to roughly 30–45 minutes of implementation effort and stop rather than expanding architecture.

## 9. End-of-night outcome

Best outcome is not necessarily code volume.

We want one of:

1. a useful Observatory that produces 3–5 disciplined research targets;
2. a useful Observatory plus a tiny Kiroshi Optics scanner;
3. a documented conclusion that the Observatory itself does not improve discovery enough to justify more work.

All three are preferable to forcing Product #2.