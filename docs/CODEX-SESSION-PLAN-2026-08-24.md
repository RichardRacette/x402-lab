# Codex Session Plan — 2026-08-24 Evening

Status: **source of truth for tonight's desktop/Codex work**

## Objective

Use Codex to build a **validation-grade local Role Reality Check**, generate real sample packets if provider access is available, and stop before public paid deployment unless the output survives review.

Tonight is not a feature sprint.

Tonight answers:

> **Can our current stack turn open labor-market data into a recruiter decision packet that feels worth buying?**

## Branch

Create:

`milestone-4-5-role-reality-validation`

Do not implement directly on `main`.

## Read first

Codex must read before changing code:

1. `docs/PRODUCT-VIABILITY-2026-08-24.md`
2. `docs/PRODUCT-DISCOVERY-ROUND-2-2026-08-24.md`
3. `docs/ROLE-REALITY-CHECK-V0.md`
4. `docs/CODEX-BUILD-BRIEF-2026-08-24.md` only to confirm the old plan is on HOLD
5. `src/server.ts`
6. `src/analyze-job.ts`
7. `src/public-source.ts`
8. existing tests/package scripts

Before coding, Codex should summarize:

- the product question
- what is intentionally not being built
- what data claims are allowed
- what conditions make the session stop

## Desktop prerequisite: CareerOneStop access

CareerOneStop Web APIs require a provider-side user ID and bearer token.

At the start of the desktop session, check whether these are available:

```text
CAREERONESTOP_USER_ID
CAREERONESTOP_API_TOKEN
```

If not available, do **not** block the coding session.

Build the provider behind an interface using deterministic mocked fixtures and leave live integration validation pending. Do not invent credentials or commit placeholders that look real.

The owner can request CareerOneStop Web API data access through the official CareerOneStop developer site; the provider states its API data are open data under USDOL's Open Data Policy.

## Phase 1 — pure product engine

Build the decision logic before network integration.

Suggested structure:

```text
src/role-reality/
  types.ts
  normalize.ts
  compensation.ts
  friction.ts
  questions.ts
  service.ts
  provider.ts
  careeronestop.ts
```

Exact filenames can change if a smaller structure is clearer.

### Provider-neutral market input

Define a compact normalized object representing only the facts V0 needs, conceptually:

```ts
type RoleMarketFacts = {
  occupation: {
    code: string;
    title: string;
    mapping: "direct" | "related" | "ambiguous";
  };
  wages: {
    pct25AnnualUsd: number | null;
    medianAnnualUsd: number | null;
    pct75AnnualUsd: number | null;
  };
  demand: {
    currentJobCount30d: number | null;
    estimatedEmployment: number | null;
    projectedAnnualOpenings: number | null;
    projectedGrowthPct: number | null;
  };
  alternateTitles: string[];
  marketSkills: string[];
  provenance: unknown[];
};
```

Do not let CareerOneStop response shapes leak throughout the domain logic.

## Phase 2 — deterministic decision rules

Implement only defensible rules from `ROLE-REALITY-CHECK-V0.md`.

### Compensation

Implement:

- below-market
- market-range
- above-market
- insufficient-data

Use the stated 25th/75th percentile rules.

### Friction

Start conservatively.

Required rule:

- if buyer-provided maximum annual compensation is below local 25th-percentile benchmark -> `high-friction` with `COMPENSATION_PRESSURE`

Other rules may produce `calibrate` only when directly supported.

Do **not** create a synthetic demand/supply score merely because the inputs exist.

### Calibration questions

Template questions must be traceable to actual flags.

No LLM.

## Phase 3 — tests before provider calls

Use synthetic fixtures.

Minimum tests:

- comp max below P25 -> high-friction
- comp overlaps P25–P75 -> market-range
- comp min above P75 -> above-market, but do not call it a problem
- missing wage data -> insufficient compensation data
- no compensation input -> packet still works
- ambiguous occupation -> safe preflight behavior
- restrictive skill terms produce questions without candidate-supply claims
- every flag has a reason
- `proceed` language does not promise easy fill

Run:

```bash
npm test
npm run typecheck
```

Existing tests must remain green.

## Phase 4 — CareerOneStop adapter

Only after pure tests pass.

Implement a bounded provider adapter using official APIs.

Prioritize the minimum useful calls, likely:

1. occupation lookup / occupation details
2. wage + projected employment data, preferably from a response that already packages them
3. current Jobs V2 query only to retrieve `JobCount` for a fixed 30-day window

Do not fetch hundreds of job records if the API returns the count directly.

### Adapter requirements

- explicit provider timeout
- bounded calls
- input URL/path encoding
- validate external response shapes
- no credential logging
- structured retryable errors
- preserve useful source metadata/citations
- provider unconfigured state must be clear

### Configuration

Read provider credentials from environment only.

Update `.env.example` with names, never secrets.

Do not make the application unable to start when CareerOneStop is unconfigured; Evidence Slice must remain operational.

This is important: the current server requires `X402_PAY_TO` at startup. The new optional provider must not create another mandatory startup failure for unrelated routes.

## Phase 5 — local free validation route first

Do **not** immediately add a paid route.

Add a temporary/local validation surface or call the service from a validation script/test harness.

Preferred approach:

```bash
npm run role-reality:sample -- --title "Controls Engineer" --location "Detroit, MI" ...
```

or another simple CLI that does not expose a public endpoint.

The goal is to inspect the packet before monetizing it.

If live provider credentials are unavailable, the CLI may support fixture mode explicitly labeled as synthetic.

## Phase 6 — generate sample packets

If live provider access works, generate at least these sample roles:

- Controls Engineer — Detroit, MI
- Registered Nurse — Ann Arbor, MI
- Software Engineer — San Francisco, CA
- Maintenance Technician — Dallas, TX
- Human Resources Information Systems Manager — Chicago, IL

Use realistic hypothetical compensation ranges, clearly labeled as test inputs rather than claims about an employer.

Save sanitized outputs under:

`docs/validation-samples/role-reality/`

Each file must include:

- retrieval timestamp
- input
- source metadata
- limitations
- no secrets

## Phase 7 — human product review gate

Before implementing x402 payment for the new product, review the real sample packets manually.

Ask:

1. Does this tell a recruiter anything non-obvious?
2. Does the market evidence support the language?
3. Are the calibration questions actionable?
4. Is CareerOneStop coverage good enough for modern/niche roles?
5. Does this feel worth $0.50?
6. Which missing fact blocks usefulness?

### Stop condition

If sample packets feel like a dressed-up salary lookup, **stop the build**.

Do not save the idea by adding an LLM, scraping LinkedIn, or buying another dataset tonight.

Document the failure and return to discovery.

## Phase 8 — x402 route only if the sample passes

If and only if the sample packet clearly passes the human review gate, add:

- free `POST /role-reality/preflight`
- paid `POST /role-reality`
- Base Sepolia price `$0.50` test USDC
- strong Bazaar metadata
- stable input/output example
- health metadata

Do not deploy mainnet.

Do not add MPP/MCP yet.

## Payment-route acceptance criteria

If Phase 8 is reached:

- preflight remains outside payment middleware
- paid route uses existing x402 V2 architecture
- Evidence Slice and analyze-job behavior unchanged
- provider-unavailable error semantics clear
- no payment should be intentionally solicited for obviously unsupported input after preflight
- `npm test` and `npm run typecheck` green
- complete one bounded Base Sepolia self-purchase only after local correctness is established

## Economics instrumentation

For Role Reality requests log structurally:

```text
request id
provider calls
provider latency
fulfillment latency
known variable provider cost
configured sale price
outcome
friction classification
```

No dashboard/database tonight.

## Absolute non-goals

Do not add:

- Recruiting Pressure / company-opportunity endpoint
- company history tracking
- database
- candidate data
- LinkedIn scraping
- candidate sourcing
- email/contact enrichment
- AI-generated outreach
- LLM scoring
- embeddings
- browser automation
- Lightcast/TalentNeuron subscription
- JobsPipe integration
- global data
- frontend/dashboard
- MCP
- MPP
- mainnet
- rebrand

## Codex prompt for tonight

> Read `docs/CODEX-SESSION-PLAN-2026-08-24.md` and every governing document it lists before editing anything. Create branch `milestone-4-5-role-reality-validation`. The former Recruiting Pressure build is explicitly on HOLD; do not implement it. Build Role Reality Check only through the gated phases in the session plan. Start with provider-neutral types, deterministic decision logic, and synthetic tests. Preserve all existing x402-lab behavior. Add CareerOneStop only behind an optional environment-configured adapter after tests pass. Generate live sample packets if credentials are available. Do not add a paid Role Reality endpoint until we manually judge the sample output to be materially more useful than a salary lookup. If the product fails that gate, stop and document why instead of adding features. Run tests and typecheck after each meaningful slice and report any contract conflict before broadening scope.

## Desired end-of-night result

Best case:

- tested Role Reality core
- bounded CareerOneStop integration
- 3–5 real sample packets
- clear evidence the packet is worth exposing as a paid Base Sepolia product
- optional paid route only if earned

Still-successful case:

- tests + adapter architecture complete
- product is rejected after seeing real samples
- we learned cheaply before deploying another weak SKU

Both outcomes are progress.
