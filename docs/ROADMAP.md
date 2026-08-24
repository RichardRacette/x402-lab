# x402-lab Roadmap

Rules:

> **Earn complexity. Revenue before ritual. Productize what repeats.**

Current governing docs:

- `PRODUCT-THESIS.md`
- `PRODUCT-DISCOVERY-ROUND-3-2026-08-24.md`
- `BUSINESS-PLAN-V0.4.md`
- `RECRUITING-AGENT-EVAL-V0.md`
- `CODEX-SESSION-PLAN-2026-08-24.md`

Older product-discovery files are historical records, not implementation instructions.

## Milestone 0 — Public seed ✅

Public repository established.

## Milestone 1 — First automated x402 transaction ✅

Proven:

```text
buyer → 402 → signed payment → settlement → retry → protected result
```

## Milestone 2 — Initial product exploration ✅

`/analyze-job` proved the payment loop. Evidence Slice became the cleaner agent-native shelf experiment.

## Milestone 3 — Evidence Slice V0 ✅

Deterministic evidence extraction, provenance, URL safety, tests and paid Base Sepolia flow.

## Milestone 4 — Public machine-payable seller proof ✅

Delivered:

- Railway deployment
- x402 V2
- first public paid Evidence Slice transaction
- Bazaar metadata
- bounded buyer + shopper gateway

This proved payment capability, not demand.

## Milestone 4.5 — Product viability discovery 🚧

### Evidence Slice

**Status:** keep as protocol proof; weak commercial confidence.

### Recruiting Pressure / Agency Opportunity

**Status:** rejected before implementation due competitive overlap.

### Automated Role Reality

**Status:** rejected before implementation after free/SMB competitive audit and weak buy-vs-build economics.

### Search Preflight

**Status:** useful workflow/scenario concept, but downgraded as the primary commercial offer because many recruiting-agent customers already have recruiter approvers.

### Recruiting Agent Practitioner Eval

**Status:** **leading first-revenue hypothesis.**

Proposition:

> Send sanitized recruiting-agent runs/traces. A recruiting practitioner labels professional workflow failures, corrected behavior and golden/regression cases.

Why it currently leads:

- domain-expert AI evaluation is already a paid service class
- recruiting agents are proliferating
- practitioner labels can compound into a benchmark
- no talent-data licensing dependency is required
- repeat trigger exists with every meaningful release/tool/model/autonomy change
- future automated evaluator can reuse the existing machine-commerce stack

## Milestone 4.5C — Eval Workbench + synthetic benchmark 🚧

### Goal

Make recruiting-practitioner evaluation fast, structured, reusable and machine-readable.

### Engineering task

Build internal workbench on:

`milestone-4-5-recruiting-agent-eval-harness`

Required outputs:

- eval project/scenario/run/review schemas
- recruiting-specific rubric dimensions
- extensible failure taxonomy
- 15–20 synthetic non-PII scenarios
- synthetic fixture agent outputs
- structured human-review records
- aggregate JSON report
- concise Markdown report
- golden/regression-case export
- tests/typecheck

### Human judgment rule

Software structures the review. It must never fabricate practitioner verdicts, rationales, failure labels, corrected behavior or golden-case promotion.

### Internal pass gate

Manually review 10 synthetic runs.

Prefer:

- ~3–6 minutes per run after familiarization
- meaningful recruiting-specific distinctions
- little manual report formatting
- reusable golden cases

Reject/refactor if the rubric looks like generic AI QA with recruiting vocabulary pasted on.

## Milestone 4.6 — External builder validation

Create a polished 3–5-run mini-eval artifact.

Show it to at least three recruiting-agent builders/product people.

Positive signals, strongest first:

1. builder sends additional runs
2. builder adds one of our cases to their regression/eval process
3. builder requests review after a change/release
4. builder engages deeply with/disputes practitioner labels
5. builder says it looks useful

Compliments alone are weak.

## Milestone 4.7 — First real paid eval

Pricing tests:

- free 3–5-run mini review for a very small number of builders
- `$99–$149` Practitioner Smoke Eval (~10 runs)
- around `$249` Practitioner Eval Sprint (20–25 runs + failure summary + golden cases)

Treat human time as a variable cost.

Exit condition:

> **One external builder pays real money for practitioner evaluation.**

The payment channel should minimize legitimate friction; it does not have to be x402.

## Milestone 4.8 — First repeat builder

Exit condition:

> **The same builder pays for another eval after a release/change.**

This is the strongest early commercial signal.

Track:

- price
- runs reviewed
- human minutes
- recurring failure labels
- cases adopted into buyer regressions
- what changed between releases

## Milestone 5 — Build the benchmark asset

After real customer-authorized/sanitized reviews:

- refine failure taxonomy
- curate workflow-specific golden cases
- version rubrics
- record inter-review ambiguity where possible
- remove customer-identifying details from any reusable artifact unless explicit rights allow otherwise

The benchmark is not a moat until enough real labeled evidence exists.

## Milestone 6 — Automate one proven eval dimension

Choose one repeated dimension only when:

- human labels are stable enough to define correctness
- enough examples exist to measure agreement
- an automated evaluator can be tested against human labels
- buyer value survives automation

Possible examples may emerge around requirement drift, evidence grounding, autonomy-boundary adherence or another repeated failure.

No dimension is pre-approved.

## Milestone 7 — Machine-native Product #2

Expose a validated automated eval component through whichever front door minimizes buyer friction:

- x402
- MCP
- MPP
- conventional API

Reuse existing x402-lab seller/payment infrastructure rather than rebuilding it.

Exit condition:

> an external machine buyer purchases a component that was first proven against human labels.

## Milestone 8 — Repeat autonomous buyer

Exit condition:

> the same external machine buyer purchases the validated eval more than once without human instruction per transaction.

Track contribution margin, not transaction count.

## Milestone 9 — Hybrid continuous QA

Potential later product:

```text
automated recruiting-agent eval
        ↓
confidence / ambiguity gate
        ↓
human practitioner escalation when needed
        ↓
new labels feed benchmark
```

This is the strongest long-term service/product flywheel currently visible.

## Milestone 10 — Business decision

Evaluate:

- external revenue
- repeat builder rate
- contribution after owner time
- review time trend
- builder acquisition cost
- benchmark reuse
- automated-human agreement
- marketplace/direct-channel performance
- support burden
- IP/data-rights risk

Possible outcomes:

1. deepen recruiting-agent eval vertical
2. specialize by recruiting workflow
3. productize evaluator(s)
4. partner with eval platforms/HR-tech builders
5. broaden domain only after recruiting proves repeat economics
6. stop/pivot if builders do not pay

## Commercial milestone ladder

- `$1` external revenue — actual commerce
- first `$99–$149` smoke eval — pricing evidence
- first `$249` sprint — stronger value evidence
- **first repeat builder** — strongest early signal
- `$1,000` cumulative eval revenue — non-ceremonial demand
- `$1,000/month` contribution after owner time — meaningful side-business validation
- recurring release-eval customer — business-model evidence
- automated evaluator with measured human agreement — scalable product milestone

## Protocol posture

x402 remains strategically useful but is not the business identity.

The project stays protocol-neutral and uses x402 when machine-native purchase genuinely reduces friction.
