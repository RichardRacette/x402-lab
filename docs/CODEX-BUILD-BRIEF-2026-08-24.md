# Codex Build Brief — Recruiting Pressure V0

Status: **ready for tonight's desktop/Codex session**

Date: **2026-08-24**

Governing docs:

- `PRODUCT-VIABILITY-2026-08-24.md`
- `BUSINESS-PLAN-V0.1.md`
- `RECRUITING-PRESSURE-BRIEF-V0.md`
- `SIGNAL-TAXONOMY-V0.md`
- `DATA-SOURCE-AND-ECONOMICS-V0.md`
- Issue #12

## Session objective

Do **not** build a broad commercial product tonight.

Build the smallest trustworthy Recruiting Pressure V0 implementation that can turn a supported Greenhouse board plus recruiter focus keywords into an explainable local/testnet sample packet.

The purpose of the session is to create something external recruiters can evaluate.

## Branch

Create and work on:

`milestone-4-5-recruiting-pressure-v0`

Do not push implementation directly to `main` until review/tests pass.

## Read-before-code rule

Before changing code, Codex must read:

1. this file
2. `docs/RECRUITING-PRESSURE-BRIEF-V0.md`
3. `docs/SIGNAL-TAXONOMY-V0.md`
4. `docs/DATA-SOURCE-AND-ECONOMICS-V0.md`
5. `src/server.ts`
6. `src/public-source.ts`
7. `src/evidence-slice.ts`
8. current tests/package scripts

Then summarize the intended changes and identify any contract conflict before coding.

Do not silently reinterpret the product.

## Implementation slice A — pure domain engine first

Create a small domain module for recruiting pressure.

Suggested structure (names may change if there is a simpler clean structure):

```text
src/recruiting-pressure/
  types.ts
  normalize.ts
  signals.ts
  classify.ts
  greenhouse.ts
  service.ts
```

Keep pure signal logic separate from network fetching.

### Required normalized job shape

Use the minimum fields required by V0, conceptually:

```ts
type ObservedJob = {
  externalId: string;
  title: string;
  location: string;
  departments: string[];
  firstPublished: string | null;
  updatedAt: string | null;
  sourceUrl: string;
};
```

Do not add full candidate, company-enrichment, or person fields.

### Implement V0 focus matching

Follow `SIGNAL-TAXONOMY-V0.md` exactly:

- conservative normalized substring matching
- focus keywords match title or department
- optional focus locations must also match
- no embeddings
- no LLM
- no fuzzy semantic matcher

### Implement current-snapshot signals

Implement:

- `AGING_FOCUS_ROLES`
- `SPECIALTY_CLUSTER`
- `TA_CAPACITY_PRESSURE_CLUE`

Implement the classification rule from the taxonomy.

### History signal

Define enough types/interfaces to represent history in tests, but **do not add production persistence in this slice**.

The service should truthfully report:

- `observationDays: 0`
- `repostSignalsAvailable: false`

unless a test directly supplies history to the pure domain engine.

Implement pure test coverage for `REOPENED_OR_REPEATED_ROLE` only if it can be done without creating persistence infrastructure.

## Implementation slice B — Greenhouse adapter

Implement a bounded Greenhouse Job Board adapter.

### List call

Use the official public GET board jobs endpoint.

Preflight needs:

- board exists/retrieves
- active job count
- focus match count based on list-level fields when possible
- hard-board-size decision

### Detail calls

For focus-matched jobs, retrieve individual job detail when needed to obtain trustworthy `first_published`.

Do not fetch every full description.

### Bounds

- hard reject >75 active jobs in V0
- bounded concurrency for detail calls
- explicit timeout
- cap response bytes where practical
- reject malformed/unexpected upstream shapes
- structured errors

Reuse proven URL/network safety helpers only when they fit; do not weaken `public-source.ts` safety or create a giant generic fetch abstraction merely to share code.

### Error taxonomy

At minimum distinguish:

- invalid input
- source not found
- source unavailable/retryable
- source too large for V0
- no active jobs
- no focus matches
- incomplete age data if classification depends on it

## Implementation slice C — free preflight

Add:

`POST /recruiting-pressure/preflight`

This route must remain **outside payment middleware**.

Validate the contract in `RECRUITING-PRESSURE-BRIEF-V0.md`.

Return only support/readiness facts, not paid pressure analysis.

Do not accidentally expose the whole paid result for free.

## Implementation slice D — paid Base Sepolia route

Add:

`POST /recruiting-pressure`

Testnet price:

`$0.25`

Network remains Base Sepolia.

Use the existing x402 V2 payment architecture rather than inventing a new payment stack.

Add strong Bazaar/discovery metadata:

- service name
- concise description
- request example
- required schema
- realistic output example
- tags focused on recruiting, hiring, workforce, agency, signals

Do not change Evidence Slice or `/analyze-job` behavior except for health metadata needed to list the new route.

## Implementation slice E — tests

Tests are mandatory before live-source testing.

Use synthetic fixtures from `DATA-SOURCE-AND-ECONOMICS-V0.md`.

Minimum test groups:

### Normalization

- keyword matching is case-insensitive
- punctuation/whitespace normalization is deterministic
- seniority/specialty tokens are not accidentally erased
- location filter works

### Signals

- one young cluster does not magically become high pressure
- aging thresholds at 35 and 65 days
- TA role alone is not strong
- high combined-pressure fixture
- duplicate-looking current jobs do not create a repost signal without history
- history fixture creates repost signal only after active → absent → active evidence

### Classification

- high / moderate / low / insufficient-data paths

### Greenhouse adapter

Use mocked/injected fetch responses, not live network in unit tests.

Test:

- board 404
- malformed JSON/shape
- timeout/retryable failure
- 0 jobs
- 76+ jobs hard reject
- detail first-published mapping
- detail failure that prevents responsible age classification

### Preflight

- returns supported state for bounded source
- refuses oversized source before payment path
- does not include paid signals

### Regression

All existing tests must continue to pass.

## Implementation slice F — manual live-source validation

Only after unit tests and typecheck pass, run explicit manual/integration checks against current public sources.

Suggested technical cohort:

- `remoracarbon`
- `atomicindustriesinc`
- `torcrobotics`
- `scoutmotors`
- `altentechnologyusa` specifically to confirm oversized-board refusal

Do not encode their live job counts into unit tests.

Save sanitized sample outputs under a clearly labeled validation location such as:

`docs/validation-samples/`

Each sample must state:

- observation timestamp
- source board token
- agency focus used
- that the output is experimental and is **not a claim that the company needs an agency**

## Implementation slice G — economics telemetry

Create a small internal fulfillment metrics object/log per request.

Track at least:

- upstream list-call count
- detail-call count
- jobs inspected
- source latency
- fulfillment latency
- known upstream variable cost (currently zero for prototype)
- configured sale price
- fulfilled/failed status

Do not build a dashboard.

Structured console logging is sufficient for V0.

## No production persistence tonight

Do not add Supabase/Postgres/SQLite/Railway volumes tonight unless the current implementation absolutely cannot proceed without them.

Why:

- history is the moat, but database choice is not the thing we need to validate first
- we can validate the current packet and signal rules with explicit source timestamps plus synthetic history
- once recruiter feedback says the packet is useful, durable daily snapshots become the next earned infrastructure slice

Design interfaces so a snapshot repository can be added without rewriting signal logic.

## Absolute non-goals tonight

Do not add:

- LLM calls
- embeddings
- vector database
- candidate PII
- LinkedIn scraping
- hiring-manager enrichment
- email finding
- outreach automation
- browser automation
- generic web search
- O*NET ingestion
- Lever adapter
- JobsPipe subscription/integration
- MPP
- MCP
- mainnet
- new commercial brand
- dashboard/UI
- 0–100 AI score

## Acceptance criteria

Do not call the slice complete unless:

1. `npm test` passes
2. `npm run typecheck` passes
3. all existing Evidence Slice and shopper tests still pass
4. Greenhouse network behavior is bounded
5. preflight is free and does not leak paid analysis
6. paid route is protected at `$0.25` Base Sepolia
7. output follows the frozen V0 contract or deviations are documented and justified
8. no unsupported history claims are returned
9. at least 3 manual sample packets are generated from live public boards after tests pass
10. the oversized-board case is demonstrated cleanly
11. no secrets or new credentials are committed

## Review checklist before merge

Ask:

- Does the packet tell a recruiter something more useful than "this company has jobs"?
- Are all claims traceable to source facts?
- Are we overstating age, pressure, or agency need?
- Is any new complexity present only because it was fun to build?
- Would an external recruiter understand the packet in under a minute?
- Could a machine buyer parse the offer without reading the README?
- Is the buy-vs-build advantage beginning to emerge?

If the answer to the first question is no, do **not** compensate by adding features. Return to product validation.

## Suggested first Codex prompt

Use this at the start of the desktop session:

> Read `docs/CODEX-BUILD-BRIEF-2026-08-24.md` and every governing file it lists before writing code. Create branch `milestone-4-5-recruiting-pressure-v0`. Implement the brief in the prescribed slices, beginning with the pure domain engine and synthetic tests. Preserve all existing Evidence Slice, analyze-job, shopper, payment, and safety behavior. Do not add any deferred features or production persistence. After each slice, run the relevant tests/typecheck and inspect failures before proceeding. Stop and report any conflict between the frozen product contract and the existing architecture rather than silently broadening scope. The end state must satisfy every acceptance criterion in the brief.
