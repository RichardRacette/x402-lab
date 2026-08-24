# Business Plan v0.4 — Recruiter Judgment as Agent-Eval Infrastructure

Status: **current working commercial plan**

Date: **2026-08-24**

This plan supersedes Business Plan v0.3 after a zero-based revenue review found a stronger use of the same scarce asset: **recruiting practitioner judgment**.

The leading commercial experiment is no longer a human review attached to every requisition. It is:

> **Recruiting Agent Practitioner Eval — human domain-expert evaluation of recruiting-agent runs, traces, and workflows.**

Read with:

- `PRODUCT-DISCOVERY-ROUND-3-2026-08-24.md`
- `RECRUITING-AGENT-EVAL-V0.md`
- `CODEX-SESSION-PLAN-2026-08-24.md`
- `ROADMAP.md`

## Business objective

> **Earn real external revenue by helping recruiting-agent builders discover professional workflow failures their engineering/eval stack cannot reliably judge, then turn repeated human labels into reusable benchmark and automated eval products.**

Success is measured by external payment, repeat releases/buyers, contribution after owner time, and eventually a benchmark/evaluator asset — not by testnet transaction count.

## Why this outranks Search Preflight

Search Preflight remains a valid recruiting workflow, but many production recruiting agents are deployed for recruiting teams that already preserve internal human approval.

Selling a second outside recruiter review on every requisition can therefore duplicate expertise the customer already employs.

By contrast, teams **building** recruiting agents have a different gap:

- engineers can measure latency, tool failures and schema correctness
- LLM judges can test many generic criteria
- product teams may know intended behavior
- but they may lack an independent recruiting practitioner who can tell whether the workflow actually makes sense in real recruiting

This is a recognized pattern in domain-specific AI evaluation: domain experts define nuanced correctness, label failures, calibrate model judges, and create golden/regression cases.

## Customer

### Primary

- startup founder building recruiting agents
- AI/ML/product engineer building a recruiting workflow
- HR-tech product team adding agentic behavior

### Secondary

- internal recruiting/TA innovation team
- AI eval platform needing a recruiting-domain specialist
- consulting/integration team delivering recruiting agents

Do not target ordinary recruiters as the first buyer unless they are also operating/building an agent system.

## Product V0

### Recruiting Agent Practitioner Eval

Input:

- 5–25 sanitized agent runs/traces, or
- a public/safe demo plus explicit scenarios
- intended workflow and autonomy level
- expected behavior / constraints

Output:

1. evaluation rubric
2. run-by-run verdicts
3. domain failure labels
4. severity and recruiter rationale
5. expected/corrected behavior
6. prioritized failure patterns
7. recommended golden/regression cases
8. concise release/readiness observations without certification language
9. JSON + Markdown

The service is **practitioner product-quality evaluation**, not legal compliance certification.

## Initial workflow coverage

Focus on workflows where recruiter judgment is observable without real candidate PII:

- intake / requirement calibration
- sourcing/search-plan generation
- candidate-summary evidence discipline using synthetic inputs
- outreach-draft grounding using synthetic inputs
- approval/autonomy boundaries
- pipeline/state-update logic
- recruiter handoff/usability

Avoid live candidate selection decisions in V0.

## Evaluation dimensions

Initial rubric dimensions:

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

Use categorical judgments and evidence, not a fake global score.

## Failure taxonomy

Initial labels:

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

The taxonomy is provisional and must evolve from real reviews.

## Pricing hypothesis

The service should be priced like domain-expert evaluation, not a micropayment.

### Mini sample

`3–5 runs` — free for a very small number of builders to validate the format.

### Practitioner Smoke Eval

`10 runs` — test `$99–$149`.

### Practitioner Eval Sprint

`20–25 runs + failure summary + 5–10 golden cases` — test approximately `$249`.

### Recurring release eval

Quote only after repeat demand. A future release-by-release cadence could justify `$500+` or monthly retainers if the buyer receives real value.

These are experiments, not forecasts.

## Unit economics

Use owner-time value of at least `$50/hour`.

Target after the internal workbench exists:

### $149 / 10 runs

Prefer <=60–75 minutes total human work.

### $249 / 20–25 runs

Prefer <=2 hours total human review/report work.

Track:

```text
sale price
- marketplace/payment fees
- model/tool variable cost
- owner-time cost
= contribution
```

No paid talent dataset should be required.

If the practitioner sprint takes 4–6 hours, either raise price, narrow scope, improve the workbench, or reject the economics.

## Repeat trigger

The natural repeat event is strong:

- new agent release
- prompt/model change
- new tool integration
- autonomy expansion
- new recruiting workflow
- regression after production incidents

The most important early commercial event is:

> **the same builder pays for another eval after changing the agent.**

## Distribution

### 1. Direct builder validation

Highest priority.

Use public recruiting-agent projects/startups to find a handful of builders for respectful, targeted outreach.

Offer a tiny free practitioner mini-eval only when we can show a concrete useful artifact.

Do not send mass outreach.

### 2. Agent-native human-service marketplace

Once fulfillment is reliable, test a listing where an AI agent/builder can submit sanitized traces and buy asynchronous human review using x402 escrow.

This preserves the original machine-commerce thesis without pretending the human judgment must be synchronous software.

### 3. Eval-tool ecosystem

The output should be portable into:

- LangSmith
- ProofMap
- Label Studio
- DeepEval / custom harnesses
- JSON/CSV/internal eval systems

We should sell the domain labels and cases, not force customers to adopt our evaluation infrastructure.

### 4. Conventional payment

Use the lowest-friction legitimate payment method for early human buyers.

Do not require crypto to validate willingness to pay.

## Competitive position

### ProofMap and eval infrastructure

Recruiting-specific evaluation infrastructure already exists. This validates the need for recruiting-agent testing but means we should **not** build another general eval platform.

Our wedge is the practitioner layer:

> **Who defines realistic recruiting cases, recognizes tacit workflow failures, writes corrected behavior, and turns that judgment into reusable labels/regression cases?**

### Generic expert-eval vendors

Large/general expert-eval providers prove willingness to pay for domain expertise, but they often emphasize medicine, law, finance, coding, STEM and language specialties.

The niche hypothesis is that recruiting-agent builders may value a packaged recruiting-practitioner evaluation sprint.

We have not yet proven demand.

## Why the current tech stack still matters

The existing x402 seller/buyer stack is not wasted.

It gives the project:

- public machine-commerce credibility
- direct x402 payment capability for future automated evals
- shopper/spend-control knowledge
- a route to machine-native distribution
- a public technical artifact demonstrating agent commerce rather than only consulting

But tonight's product does not need another public endpoint.

## Internal Eval Workbench

The immediate Codex task is to build a local harness that makes expert review structured and reusable.

It should support:

- scenario definitions
- agent-run records
- intended behavior/autonomy metadata
- rubric dimensions
- practitioner verdicts
- failure labels
- severity
- rationale/evidence
- corrected behavior
- golden-case promotion
- summary/report generation
- JSON + Markdown export

The workbench must never auto-fill the human review as if Codex can substitute for the domain reviewer.

## Benchmark strategy

### V0

Synthetic, non-PII cases to establish the rubric and workbench.

### V1

Customer-authorized/sanitized agent runs with human labels.

### V2

Curated recruiting-agent regression benchmark across workflow families.

### V3

Automated evaluator(s) calibrated against the human-labelled set, with measured agreement/disagreement.

### V4

Machine-buyable eval API/MCP/x402 tool plus human escalation.

This is the long-term product flywheel.

## Safety and scope

Do not sell this as:

- employment-law advice
- bias audit
- NYC Local Law 144 audit
- anti-discrimination certification
- model safety certification
- validation of live adverse employment decisions

V0 requires no real candidate PII.

Use synthetic/public/customer-authorized sanitized inputs only.

If customers later ask for compliance/bias auditing, that is a separate regulated/professional-services decision with different expertise and liability.

## Outside-work / IP gate

Before accepting any paid customer, verify applicable employment/contract terms covering:

- moonlighting/outside business
- conflict of interest
- invention/IP assignment
- confidentiality
- competitive activity
- use of employer equipment/time

Use only personal equipment, personal accounts and personal time.

Never use current/former employer confidential recruiting processes, candidate data, internal documents or proprietary systems as training/eval material.

This is a mandatory commercial gate.

## Validation plan

### Gate A — workbench + rubric quality

Create 15–20 synthetic recruiting-agent cases spanning normal, ambiguous, conflicting and unsafe-to-autonomously-act scenarios.

Human reviewer labels them using the V0 rubric.

The tool should reduce administrative/reporting effort without deciding the domain verdict itself.

### Gate B — external builder reaction

Show a mini review to at least three recruiting-agent builders/product people.

Strong evidence:

- they dispute or engage with specific domain labels
- they add a case to their own regression/eval harness
- they send more runs
- they ask for another review after a change

### Gate C — first payment

At least one external builder pays a stated price.

### Gate D — repeat

Same builder buys another eval/release review.

### Gate E — automation

Only automate a judgment dimension after enough human labels exist to measure agreement and failure modes.

## Commercial milestones

- `$1` external revenue — actual commerce
- first `$99–$149` smoke eval — initial pricing signal
- first `$249` sprint — stronger value signal
- first repeat builder — strongest early signal
- `$1,000` cumulative eval revenue — non-ceremonial demand
- `$1,000/month` contribution after owner time — meaningful side-business validation
- recurring release-eval customer — business-model evidence
- automated evaluator with measured human agreement — productization milestone

## Brand

Do not rename the company/repo yet.

If this direction earns paying repeat customers, the eventual brand should be broader than recruiting consulting and protocol-neutral enough to support:

- domain evals
- benchmarks
- automated evaluators
- human escalation

Naming follows evidence.

## Definition of success for v0.4

This plan succeeds if it gets the project to a paying recruiting-agent builder and turns practitioner feedback into a reusable evaluation asset that compounds rather than disappearing after each service engagement.