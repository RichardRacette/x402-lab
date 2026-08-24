# Codex Session Plan — 2026-08-24 Evening

Status: **source of truth for tonight's desktop/Codex work**

## Objective

Build an internal **Recruiting Agent Eval Workbench + synthetic benchmark pack** that makes human recruiter/practitioner evaluation structured, fast, reusable and machine-readable.

Tonight does **not** create a new paid API.

Tonight answers:

> **Can the current stack turn recruiter judgment about agent behavior into clean eval artifacts, failure labels and reusable regression cases without pretending software can replace the human reviewer?**

## Branch

Create:

`milestone-4-5-recruiting-agent-eval-harness`

Do not implement directly on `main`.

## Read before editing

Codex must read:

1. `docs/PRODUCT-DISCOVERY-ROUND-3-2026-08-24.md`
2. `docs/BUSINESS-PLAN-V0.4.md`
3. `docs/RECRUITING-AGENT-EVAL-V0.md`
4. `docs/PRODUCT-VIABILITY-2026-08-24.md`
5. `docs/ROADMAP.md`
6. existing source/tests/package scripts

Older Recruiting Pressure, Role Reality and Search Preflight plans are historical product-discovery material only.

Before coding, summarize:

- the current buyer
- why automated Role Reality and Search Preflight were downgraded
- what the human practitioner contributes
- what the workbench is allowed to automate
- what it must never fabricate
- the V0 safety/compliance boundary

## Commercial product being supported

**Recruiting Agent Practitioner Eval — Human Domain Review**

A builder supplies sanitized recruiting-agent runs/traces. A human recruiter evaluates professional workflow quality, labels failures, supplies corrected behavior and recommends regression/golden cases.

The workbench structures this service; it does not perform the practitioner verdict.

## Workbench architecture

Suggested structure:

```text
src/recruiting-eval/
  types.ts
  schemas.ts
  taxonomy.ts
  scenarios.ts
  review-store.ts
  aggregate.ts
  report-json.ts
  report-markdown.ts
  cli.ts
  fixtures/
```

Use fewer files if clearer.

No database is required. JSON files/local fixture data are sufficient for V0.

Do not add payment middleware or server routes for the eval product tonight.

## Core types

Implement explicit types for:

### Eval project

- system name
- intended user
- workflow
- autonomy level
- intended behavior
- rubric version

### Scenario

- scenario ID
- workflow family
- synthetic input
- expected constraints/behavior
- scenario notes

### Agent run

- run ID
- scenario ID
- agent output
- optional synthetic tool trace
- optional builder expected behavior

### Human review

- run ID
- verdict: `PASS | PARTIAL | FAIL | ESCALATE`
- applicable dimension notes
- failure records
- golden-case candidate
- reviewer note

### Failure record

- label
- severity: `low | material | blocking`
- evidence
- practitioner rationale
- expected/corrected behavior

The human-review fields must be explicitly provided by the reviewer. No code should silently invent them.

## Failure taxonomy

Seed the labels from `RECRUITING-AGENT-EVAL-V0.md`:

- `REQUIREMENT_DRIFT`
- `MISSING_CLARIFICATION`
- `UNSUPPORTED_INFERENCE`
- `EVIDENCE_GAP`
- `OVERCONFIDENT_CLAIM`
- `SEARCH_PLAN_MISMATCH`
- `MUST_HAVE_INCONSISTENCY`
- `OUTREACH_FABRICATION`
- `AUTONOMY_BOUNDARY_MISS`
- `HUMAN_REVIEW_NEEDED`
- `AUDITABILITY_GAP`
- `RECRUITER_USABILITY_GAP`
- `INCOMPLETE_WORKFLOW`
- `OTHER_DOMAIN_FAILURE`

Taxonomy must be extensible.

## Rubric dimensions

Represent the V0 dimensions in data/config, not scattered strings:

- task understanding
- criteria fidelity
- evidence grounding
- clarification judgment
- recruiter usability
- autonomy boundary
- traceability
- fabrication discipline
- workflow completeness
- consistency

Not every dimension must apply to every workflow.

## Synthetic benchmark pack

Create **15–20 synthetic, non-PII recruiting-agent scenarios**.

Use no real candidate names, employers, resumes or confidential job data.

Distribute across:

### Intake / calibration

- complete straightforward req
- must-have vs preferred ambiguity
- contradictory constraints
- missing information that should trigger clarification

### Search plan

- reasonable title/skill expansion
- requirement drift
- overly narrow plan
- fabricated scarcity/market statement

### Candidate summary

Use fictional profiles only:

- evidence-supported summary
- unsupported inference
- missed hard requirement
- invented experience

### Outreach draft

Use fictional profiles only:

- grounded personalization
- fabricated personalization
- overclaim about role/company

### Approval / autonomy

- action correctly awaits approval
- agent acts despite `execute_with_approval`
- ambiguous action correctly escalates

### Pipeline / handoff

- accurate synthetic state update
- unsupported state mutation
- handoff hides unresolved risk

Include normal, missing, conflicting and tempting/adversarial cases.

## Fixture runs

For each scenario, create one or more **synthetic agent outputs** sufficient to exercise the workbench.

It is fine to intentionally create bad/partial fixture outputs.

These fixture outputs are test material, not claims about any real model/product.

Do not spend the night integrating a live LLM or third-party recruiting agent merely to populate the harness.

## Review workflow

The CLI/workbench should make this loop simple:

```text
load project + scenario + run
        ↓
present compact reviewer packet
        ↓
human supplies verdict/failure labels/rationale/correction
        ↓
validate review schema
        ↓
save review
        ↓
aggregate reviewed bundle
        ↓
export JSON + Markdown report
        ↓
promote selected runs to golden/regression cases
```

Prefer simple filesystem workflows over UI.

## CLI

Add a minimal script, for example:

```bash
npm run recruiting-eval:pack
```

Possible subcommands/flags if useful:

- list scenarios
- render one reviewer packet
- validate a review JSON file
- build report
- build golden-case export

Do not build an interactive dashboard.

## Reports

### JSON report

Include:

- project metadata
- rubric version
- reviewed run count
- verdict distribution
- failures grouped by label/severity/workflow
- run-level reviews
- golden-case candidates
- limitations

### Markdown report

Include:

1. scope
2. rubric
3. headline findings
4. run table
5. repeated failure patterns
6. prioritized fixes
7. recommended regression cases
8. release observations
9. limitations

Release observations must not use certification/compliance language.

## Tests

Minimum tests:

- malformed verdict rejected
- unknown failure label rejected or explicitly handled as extensible `OTHER_DOMAIN_FAILURE`
- missing practitioner rationale rejected for non-pass failure
- human-review fields never auto-populated by report generator
- aggregate counts correct
- golden-case export contains only selected cases
- synthetic scenario pack contains no obvious PII fixture fields
- Markdown + JSON reports contain limitations
- autonomy metadata survives through reports
- existing x402-lab tests remain green

Run:

```bash
npm test
npm run typecheck
```

## Manual practitioner exercise tonight

After tooling is green:

1. pick **10 synthetic runs** across at least four workflow families
2. manually review them using the V0 rubric
3. time the human review process
4. save structured reviews
5. generate a complete report
6. inspect whether the taxonomy/rubric actually captures meaningful recruiting failures

Record:

- minutes per run
- confusing rubric dimensions
- missing/duplicate failure labels
- cases that deserve golden status
- report sections that require manual repair

### Pass gate

The workbench passes if:

- reviewer can label a run in roughly 3–6 minutes once familiar
- report generation removes most administrative formatting work
- the failure taxonomy captures meaningful practitioner distinctions
- golden cases feel reusable
- the tool clearly preserves human judgment rather than replacing it

### Fail gate

Stop/refactor if:

- labels are generic AI-quality language with little recruiting specificity
- most cases require long essays to be useful
- taxonomy is too ambiguous to apply consistently
- reviewer spends more time fighting the harness than evaluating behavior
- outputs look like a generic LLM eval service with "recruiting" pasted on top

Do not add an LLM judge to rescue an immature human rubric.

## Explicit non-goals tonight

Do not build:

- public paid eval endpoint
- automated LLM-as-judge evaluator
- legal/compliance audit
- bias/fairness certification
- real candidate evaluation
- real candidate PII ingestion
- live outreach
- live ATS write actions
- CareerOneStop/BLS/market-data integration
- Recruiting Pressure
- Role Reality
- Search Preflight customer service
- frontend/dashboard
- database
- MCP/MPP
- mainnet
- rebrand

Preserve Evidence Slice and existing buyer/shopper behavior.

## Safety language

All sample data is synthetic.

The generated report should say it is **recruiting-workflow practitioner evaluation**, not:

- legal advice
- bias audit
- employment-compliance certification
- model-safety certification
- approval for autonomous adverse employment decisions

## End-of-night artifact

Save under something like:

```text
docs/validation-samples/recruiting-agent-eval/
```

Include:

- synthetic scenario pack summary
- 10 human-reviewed synthetic run records
- generated JSON report
- generated Markdown report
- reviewer observations on the rubric/workbench

No secrets or real PII.

## After tonight

If the workbench passes:

1. create a polished 3–5-run mini-eval example
2. identify 3–5 recruiting-agent builders for targeted validation
3. offer a free mini review to a very small number
4. ask whether the labels/cases would enter their own eval/regression process
5. test `$99–$149` for 10 runs
6. test around `$249` for 20–25 runs + golden cases
7. seek the same builder again after their next release/change

Do not launch a marketplace listing until fulfillment is coherent.

## Codex prompt for tonight

> Read `docs/PRODUCT-DISCOVERY-ROUND-3-2026-08-24.md`, `docs/BUSINESS-PLAN-V0.4.md`, `docs/RECRUITING-AGENT-EVAL-V0.md`, and `docs/CODEX-SESSION-PLAN-2026-08-24.md` before editing anything. Create branch `milestone-4-5-recruiting-agent-eval-harness`. The Recruiting Pressure, automated Role Reality, and Search Preflight customer-product directions are superseded; do not implement them. Build only an internal Recruiting Agent Eval Workbench and 15–20 synthetic non-PII scenarios. Software must structure human practitioner review but must not fabricate human verdicts, rationales, failure labels, or corrected behavior. Add fixture runs, schema validation, aggregation, JSON/Markdown report generation and golden-case export. Do not add a live model, paid endpoint, market-data integration, candidate PII, legal/bias audit features, frontend, database, MCP/MPP or mainnet. Preserve all existing x402-lab behavior. Run tests and typecheck after each meaningful slice. Finish by giving me the exact commands to review 10 synthetic runs manually and generate the report.

## Desired result

Best case:

- tested eval harness
- 15–20 synthetic recruiting-agent scenarios
- fixture outputs
- 10 human-review-ready packets
- fast structured review workflow
- JSON + Markdown report generation
- golden/regression-case export
- no regression to existing x402 infrastructure

A still-successful result is discovering that the rubric/taxonomy is not recruiting-specific enough and documenting that before commercial outreach.