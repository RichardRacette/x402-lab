# Desktop Handoff — 2026-08-24 Evening

Status: **start here when returning to the development desktop**

## 1. Pull latest `main`

Open the local `x402-lab` clone and pull today's latest strategy/docs commits.

Do not begin from an older branch or prompt that treats Recruiting Pressure, Role Reality, Search Preflight or Recruiting Agent Eval as the active product.

Active workstream: **Issue #15 — Machine Demand Observatory / Product #2 discovery**.

**Product #2 is intentionally unknown.**

## 2. Read these three docs first

In this order:

1. `docs/PRODUCT-THESIS.md`
2. `docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md`
3. `docs/CODEX-SESSION-PLAN-2026-08-24.md`

Then read `docs/ROADMAP.md` if more context is useful.

Older product-specific docs are historical evidence only.

## 3. CareerOneStop is not tonight's dependency

CareerOneStop registration has been submitted.

If credentials arrive, keep them only in local gitignored `.env` and do not paste them into prompts/issues/commits/chat.

Do **not** spend tonight integrating CareerOneStop. Product #2 is not selected and the current observatory does not require recruiting data.

## 4. Preserve existing secrets and products

Do not expose:

- wallet private keys
- seed phrases
- provider tokens
- confidential data

Do not change the live Evidence Slice contract or existing shopper behavior unless required to cleanly expose a reusable paid-fetch abstraction with tests.

## 5. Give Codex exactly one job

Use the exact prompt at the bottom of:

`docs/CODEX-SESSION-PLAN-2026-08-24.md`

Codex creates branch:

`milestone-4-5-machine-demand-observatory`

The task is **internal product-discovery instrumentation**, not a new seller product.

## 6. Expected checkpoints

### A — observatory types + fixtures

Provider-neutral merchant/resource/transaction snapshots compile and fixture tests pass.

### B — metrics

Reports clearly separate:

- buyer breadth
- repeat intensity
- economic intensity
- buyer concentration
- cross-seller shopper behavior where data permits

### C — snapshot/report workflow

Codex can import fixture/manual JSON/CSV, create normalized JSON and generate a readable Markdown report.

### D — opportunity-card scaffold

Interesting services can be turned into human-review cards with demand evidence, buy-vs-build, competition, supply, economics, advantage and falsification fields.

Cards default to `UNREVIEWED`; software does not select Product #2.

### E — optional x402scan adapter

Only after core tests pass.

The adapter should reuse existing bounded shopper/payment abstractions where cleanly possible and remain dry-run by default.

## 7. Real-money rule

**Do not execute a real-money research purchase automatically.**

A live x402scan data purchase requires separate explicit approval during the desktop session.

The code may prepare a command with proposed caps:

```text
max per payment: $0.02
max collection session: $0.25
```

but preparing the command is not permission to run it.

If the existing shopper is testnet-only or incompatible with the provider network:

- stop
- report the exact incompatibility
- continue using fixtures/manual import
- do not broaden network permissions or create/fund a mainnet wallet automatically

## 8. Key human decision tonight

Ask:

> **Does this observatory reveal meaningfully better product evidence than manually browsing x402scan?**

Pass if it helps us see non-obvious distinctions such as:

- broad adoption vs one-buyer automation
- repeat behavior vs novelty
- high-value specialist demand vs commodity volume
- cross-seller shopper behavior
- giant catalogs with weak demand
- capability classes with a clear buy-vs-build reason

Fail if it is merely a prettier leaderboard.

If it fails, stop and preserve the lesson.

## 9. Do not touch tonight

Do not spend Codex time on:

- a new paid seller endpoint
- Recruiting Agent Eval Workbench
- Search Preflight
- Role Reality
- Recruiting Pressure
- Evidence Slice feature upgrades
- rebrand
- mainnet seller launch
- MCP/MPP
- frontend/dashboard
- automatic product recommendation
- unbounded scraping
- automatic wallet funding

## 10. End-of-session record

Update **Issue #15** with:

- branch + commit
- test/typecheck result
- fixture set
- import/report commands
- live provider status: not attempted / dry-run / explicitly approved paid test
- spend controls status
- any concentration/cross-seller findings
- report paths
- 3–5 opportunity cards
- observatory pass/fail decision
- next falsification/research step

## 11. Success definition

A good night can end with **no Product #2**.

Success is either:

1. an observatory that materially improves our ability to identify/falsify profitable machine-commerce opportunities, or
2. proof that existing market tools are already sufficient and we should keep discovery manual.

Both are better than using Codex to manufacture another weak product because capacity is available.
