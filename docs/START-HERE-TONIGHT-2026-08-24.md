# Start Here Tonight — 2026-08-24

Status: **highest-priority desktop handoff for tonight**

This file supersedes older product-specific desktop handoff language.

## 1. Pull latest `main`

Do not work from an older local branch.

Active discovery workstream: **Issue #15 — Machine Demand Observatory / Product #2 discovery**.

Active companion project: **Issue #16 — Kiroshi Optics / Netrunner workstation perception layer**.

**Product #2 is intentionally unknown.**

Kiroshi is not Product #2. It is an operator tool intended to improve product discovery, safe development, project orientation and workstation visibility.

## 2. Read in this order

1. `docs/DIRECTIVE-ALIGNMENT-2026-08-24.md`
2. `docs/PRODUCT-THESIS.md`
3. `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`
4. `docs/MARKET-DATA-SOURCES-2026-08-24.md`
5. `docs/CODEX-SESSION-PLAN-2026-08-24.md`
6. `docs/KIROSHI-NETRUNNER-VISION.md`
7. `docs/KIROSHI-OPTICS.md`
8. `docs/KIROSHI-OPTICS-MVP.md`

Older Recruiting Pressure, Role Reality, Search Preflight and Practitioner Eval docs are historical evidence only.

## 3. Phase A — Observatory core

Create branch:

`milestone-4-5-machine-demand-observatory`

Build the smallest useful Machine Demand Observatory.

First-slice priority:

- provider-neutral normalized market types;
- deterministic fixtures;
- breadth/repeat/economic/concentration metrics;
- free x402stats collection;
- one readable JSON + Markdown report;
- opportunity-card scaffold;
- existing tests/typecheck green.

Target roughly **90–120 Codex minutes maximum before judging the core**.

Do not let the Observatory become a general analytics platform.

## 4. Observatory pass/fail gate

Ask:

> **Does this reveal materially better product evidence than manually browsing x402stats/x402scan?**

Pass only if important distinctions become materially clearer, especially:

- broad adoption vs high-repeat concentrated automation;
- economic value vs raw call count;
- buyer concentration;
- cross-seller shopping where observable;
- methodology/window differences;
- negative controls such as large catalogs with weak demand;
- disciplined opportunity cards.

If it is merely a prettier leaderboard, stop. Do not rescue it with a database, frontend framework, LLM opportunity scorer, scraper platform, extra providers or real-money data purchases.

If Phase A fails, do not build Kiroshi over weak evidence yet.

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

## 6. Phase B — Kiroshi Optics / Netrunner foundation

If the Observatory core passes, **Kiroshi is already authorized to proceed**.

Read:

- `docs/KIROSHI-NETRUNNER-VISION.md`
- `docs/KIROSHI-OPTICS.md`
- `docs/KIROSHI-OPTICS-MVP.md`
- Issue #16

Mission:

> **Turn the development PC into a local perception and decision console using safe, read-mostly sensors over systems we control, public data and explicitly authorized targets.**

Governing rule:

> **Better eyes, not bigger weapons.**

Cyberpunk concepts map to real capabilities:

- `SCAN WEAKNESSES` → repo/host/economic/security risk evidence;
- `TRACK QUESTS` → issue/branch/blocker/test/research state;
- `TARGET MODS` → modular market/repo/host/target/economics/quest optics;
- `ZOOM` → provenance-preserving drill-down;
- `WALLHACK` → cross-layer visibility on our own PC/authorized data, never access-control bypass;
- `TRAP DETECTION` → secrets, dependency/config risk, stale evidence, spend risk, unexpected local activity;
- `HIGHLIGHT ENEMIES` → visually prioritize factual risks/blockers rather than attacking people/systems.

Kiroshi V0/V1 is not a credential-theft, persistence, exploit, stealth, unauthorized network-scanning or access-control-bypass platform.

## 7. Kiroshi first-slice target

After Observatory approval, target roughly **45–60 Codex minutes** for the foundation:

- minimal `Sensor → Normalize → Correlate → Render` boundary;
- MARKET OPTIC / TARGET SCAN from Observatory export;
- explicit unknown/stale/error/limitation states;
- minimal QUEST OPTIC from safe local project state if cleanly possible;
- SENSOR BAY that detects future tool availability without installing anything;
- static/read-only local viewer with original futuristic scanner styling;
- no single opportunity score;
- tests/typecheck green.

Do not attempt the entire Netrunner vision tonight.

Future sensors may use mature existing tools such as Microsoft Sysinternals for local process/network/startup visibility and Trivy or equivalent for repository vulnerability/secret/misconfiguration evidence. Kiroshi should ingest their evidence rather than reinventing those scanners.

Do **not** silently install sensors, request elevation, change Windows security settings, or execute external actions during the first build.

## 8. Exact Phase A Codex prompt — use now

> Read `docs/START-HERE-TONIGHT-2026-08-24.md`, `docs/DIRECTIVE-ALIGNMENT-2026-08-24.md`, `docs/PRODUCT-THESIS.md`, `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`, `docs/MARKET-DATA-SOURCES-2026-08-24.md`, and `docs/CODEX-SESSION-PLAN-2026-08-24.md` before editing anything. Create branch `milestone-4-5-machine-demand-observatory`. Product #2 is intentionally unknown. Build the smallest useful internal Machine Demand Observatory; prioritize provider-neutral data structures, deterministic fixtures/tests, breadth/repeat/economic/concentration metrics, free x402stats collection, one JSON/Markdown report, and an opportunity-card scaffold. Preserve source methodologies and existing x402-lab behavior. Do not build a new seller product, frontend, database, LLM opportunity scorer, unbounded scraper, or real-money execution path. Time-box the first useful core so we can judge it rather than endlessly extend it. Finish the core and tell me whether it materially beats manual dashboard browsing, what normalized export Kiroshi should consume, and whether you recommend passing the Observatory usefulness gate. Do **not** start Kiroshi until I review that checkpoint.

## 9. Exact Phase B Kiroshi prompt

After a Phase A pass, use the exact current prompt at the bottom of `docs/KIROSHI-OPTICS-MVP.md`.

It tells Codex to establish the Netrunner sensor spine, MARKET OPTIC, optional minimal QUEST OPTIC and SENSOR BAY without installing tools or adding offensive/action capabilities.

## 10. End-of-night success

A strong outcome is one of:

1. useful Observatory + working Kiroshi Netrunner foundation;
2. useful Observatory and a documented reason Kiroshi must wait/refactor;
3. documented evidence that the Observatory itself is not worth further engineering.

We do not need Product #2 tonight.

We do need better eyes, better evidence and less self-deception.